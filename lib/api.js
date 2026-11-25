/**
 * Same-origin JSON API served under `/babeldoc`.
 *
 * The Client half is a plain Web module, so it talks to the Host over HTTP
 * instead of a generated Remote namespace. Routes are intentionally small and
 * resource-shaped: documents, pages, jobs, environment.
 */

import { createReadStream } from 'node:fs'
import { appendFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const JSON_LIMIT = 2 * 1024 * 1024

export function createApi(deps) {
  return async function handle(req, res) {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const pathname = url.pathname.replace(/^\/babeldoc/, '') || '/'
      if (req.method !== 'GET' && req.method !== 'HEAD' && !sameOrigin(req)) {
        return json(res, 403, { ok: false, error: 'forbidden' })
      }
      const segments = pathname.split('/').filter(Boolean)
      if (segments[0] !== 'api') return json(res, 404, { ok: false, error: 'not found' })
      const route = segments.slice(1)
      return await routeRequest(deps, req, res, url, route)
    } catch (error) {
      const status = error?.status || (error?.code === 'ENV_NOT_READY' ? 409 : 500)
      return json(res, status, {
        ok: false,
        error: String(error?.message || error),
        code: error?.code || '',
        probe: error?.probe || undefined,
      })
    }
  }
}

async function routeRequest(deps, req, res, url, route) {
  const method = req.method

  if (route[0] === 'diag' && method === 'GET') return json(res, 200, await diagnose(deps))
  if (route[0] === 'models' && method === 'GET') return json(res, 200, await listModels(deps))
  if (route[0] === 'llm' && method === 'POST' && route.length === 6 && route[3] === 'v1' && route[4] === 'chat' && route[5] === 'completions') {
    return await chatCompletion(deps, req, res, route[1], route[2])
  }

  if (route[0] === 'docs') {
    if (route.length === 1 && method === 'GET') {
      return json(res, 200, { ok: true, docs: await deps.store.listDocuments() })
    }
    if (route.length === 1 && method === 'POST') {
      const buffer = await readBody(req, deps.config.maxUploadMB * 1024 * 1024)
      if (buffer.length < 5 || buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
        return json(res, 400, { ok: false, error: '不是有效的 PDF 文件' })
      }
      const name = decodeName(req.headers['x-file-name']) || 'document.pdf'
      const meta = await deps.store.addDocument({ name, buffer })
      return json(res, 200, { ok: true, doc: await deps.store.documentView(meta.id, url.searchParams.get('lang') || 'zh') })
    }
  }

  if (route[0] === 'docs' && route.length >= 2) {
    const id = route[1]
    const lang = url.searchParams.get('lang') || 'zh'
    if (route.length === 2 && method === 'GET') {
      const doc = await deps.store.documentView(id, lang)
      if (!doc) return json(res, 404, { ok: false, error: '文档不存在' })
      return json(res, 200, { ok: true, doc })
    }
    if (route.length === 2 && method === 'DELETE') {
      deps.jobs.cancelDoc(id)
      await deps.store.removeDocument(id)
      return json(res, 200, { ok: true })
    }
    if (route[2] === 'page' && route.length === 4 && method === 'GET') {
      const page = Number.parseInt(route[3], 10)
      const kind = url.searchParams.get('kind') === 'trans' ? 'trans' : 'orig'
      let file
      try {
        file = await deps.store.renderPagePng(id, page, kind, lang)
      } catch (error) {
        if (String(error?.message || '').includes('尚未翻译')) {
          return json(res, 404, { ok: false, error: '该页尚未翻译' })
        }
        throw error
      }
      const info = await stat(file)
      res.writeHead(200, {
        'content-type': 'image/png',
        'content-length': String(info.size),
        'cache-control': 'public, max-age=31536000, immutable',
      })
      createReadStream(file).pipe(res)
      return
    }
    if (route[2] === 'export' && method === 'GET') {
      const exported = await deps.store.exportStream(id, lang)
      const doc = await deps.store.getDocument(id)
      const base = (doc?.name || 'document.pdf').replace(/\.pdf$/i, '')
      res.writeHead(200, {
        'content-type': 'application/pdf',
        'content-length': String(exported.size),
        'content-disposition': 'attachment; filename="' + encodeURIComponent(base + '.' + lang + '.pdf') + '"',
      })
      createReadStream(exported.file).pipe(res)
      return
    }
    if (route[2] === 'translate' && method === 'POST') {
      const body = await readJson(req)
      const doc = await deps.store.getDocument(id)
      if (!doc) return json(res, 404, { ok: false, error: '文档不存在' })
      await deps.runtime.ensureReady()
      const cfg = translationConfig(deps, body)
      if (cfg.source === 'dsh') await probeModel(deps, cfg)
      if (!doc.sourceLang) {
        doc.sourceLang = await detectSourceLanguage(deps, cfg, doc)
        await deps.store.saveMeta(doc)
      }
      cfg.langIn = doc.sourceLang
      const pages = await resolvePages(deps, id, body.pages, cfg.langOut)
      if (pages.length === 0) {
        return json(res, 409, { ok: false, error: '没有需要翻译的页面（可能已全部缓存）' })
      }
      const job = deps.jobs.create({ docId: id, pages, cfg, lang: cfg.langOut })
      return json(res, 200, { ok: true, job: deps.jobs.view(job.id) })
    }
    if (route[2] === 'ask' && method === 'POST') {
      const body = await readJson(req)
      const answer = await answerQuestion(deps, id, body)
      return json(res, 200, answer)
    }
  }

  if (route[0] === 'jobs' && route.length === 2 && method === 'GET') {
    const job = deps.jobs.view(route[1])
    if (!job) return json(res, 404, { ok: false, error: '任务不存在' })
    return json(res, 200, { ok: true, job })
  }
  if (route[0] === 'jobs' && route.length === 3 && route[2] === 'cancel' && method === 'POST') {
    const job = deps.jobs.cancel(route[1])
    if (!job) return json(res, 404, { ok: false, error: '任务不存在' })
    return json(res, 200, { ok: true, job })
  }

  if (route[0] === 'env' && route[1] === 'status' && method === 'GET') {
    return json(res, 200, { ok: true, env: await deps.runtime.status() })
  }
  if (route[0] === 'env' && route[1] === 'install' && method === 'POST') {
    if (!deps.runtime.installing) {
      deps.runtime.install().catch((error) => deps.logger?.warn?.('babeldoc: install failed ' + String(error?.message || error)))
    }
    return json(res, 200, { ok: true, env: await deps.runtime.status() })
  }
  if (route[0] === 'cache' && route[1] === 'clear' && method === 'POST') {
    const body = await readJson(req).catch(() => ({}))
    await deps.store.clearCache(body.id || '')
    return json(res, 200, { ok: true })
  }

  return json(res, 404, { ok: false, error: 'not found: ' + route.join('/') })
}

/**
 * OpenAI-compatible chat completions bridge.
 *
 * BabelDOC talks to any OpenAI endpoint, so a job configured with
 * `source: 'dsh'` points it at this route. The Host forwards the prompt to
 * `ctx.llm.stream`, which uses the model configured in DSH itself — no second
 * API key, and the same quota/account as the chat UI.
 */
async function chatCompletion(deps, req, res, rawProvider, rawModel) {
  const provider = safeDecode(rawProvider)
  const model = safeDecode(rawModel)
  let body
  try {
    body = await readJson(req)
  } catch {
    return openaiError(res, 400, 'invalid JSON body')
  }
  if (provider.startsWith('dsh-translator-')) {
    return translateCompletion(deps, res, body, provider.slice('dsh-translator-'.length), model)
  }
  const llm = deps.getLlm()
  if (!llm) return openaiError(res, 503, 'DSH LLM service is unavailable')
  const mapped = toDshMessages(body.messages)
  if (mapped.messages.length === 0) return openaiError(res, 400, 'no chat messages')
  const base = {
    provider,
    model,
    messages: mapped.messages,
    system: mapped.system || undefined,
    temperature: typeof body.temperature === 'number' ? body.temperature : 0,
    maxTokens: Math.max(16384, Number.isFinite(Number(body.max_tokens)) ? Number(body.max_tokens) : 2048),
  }
  let result
  try {
    result = await collectStream(llm, { ...base, reasoningEffort: 'off' })
  } catch (error) {
    // Models that do not accept an explicit reasoning effort still translate;
    // retry once without it instead of failing the whole page.
    if (!/reasoning|effort|unsupported|not support|invalid/i.test(String(error?.message || error))) throw error
    result = await collectStream(llm, base)
  }
  // Some channels burn the whole budget on hidden reasoning and then finish
  // with "max-tokens" and an empty answer. Give those a larger budget once.
  if (!String(result.text || '').trim() && isTokenLimit(result.finish)) {
    const bigger = { ...base, maxTokens: Math.min(65536, Math.max(base.maxTokens * 4, 32768)) }
    result = await collectStream(llm, { ...bigger, reasoningEffort: 'off' }).catch(() => result)
  }
  const promptText = JSON.stringify(body.messages || '')
  const reply = repairJsonReply(result.text, promptText)
  const looksStructured = /^\s*[[{]/.test(String(result.text || '')) || /"output"/.test(String(result.text || ''))
  if (!reply.trim() || (looksStructured && !isJsonArray(reply))) {
    await debugBridge(deps, {
      kind: !reply.trim() ? 'empty-reply' : 'structured-unparsed',
      provider,
      model,
      promptHasOutput: /output/i.test(promptText),
      promptChars: promptText.length,
      rawChars: String(result.text || '').length,
      rawHead: String(result.text || '').slice(0, 240),
      rawTail: String(result.text || '').slice(-240),
      finish: result.finish || null,
    })
  }
  return completionPayload(res, model, reply, finishReason(result.finish))
}

function isJsonArray(text) {
  try {
    const parsed = JSON.parse(String(text || ''))
    return Array.isArray(parsed) && parsed.length > 0
  } catch (error) {
    return false
  }
}

function isTokenLimit(finish) {
  const kind = finish && typeof finish === 'object' ? finish.kind : finish
  return /max[-_]?tokens|length/i.test(String(kind || ''))
}

async function debugBridge(deps, record) {
  try {
    const dir = path.join(deps.dataDir, 'logs')
    await mkdir(dir, { recursive: true })
    await appendFile(path.join(dir, 'bridge-debug.log'), JSON.stringify({ at: new Date().toISOString(), ...record }) + '\n', 'utf8')
  } catch (error) {
    /* debug only */
  }
}

/**
 * BabelDOC asks for a strict JSON array of `{id, output}` items. Models often
 * wrap it in code fences or add prose, which makes BabelDOC fall back to the
 * source text. Extract the array whenever the prompt clearly asked for it.
 */
function repairJsonReply(text, promptText) {
  const raw = String(text || '')
  const again = String(promptText || '')
  const structured = /^\s*[[{]/.test(raw) || /"output"/.test(raw)
  if (!structured && !/output/i.test(again)) return raw
  const cleaned = raw.replace(/```(?:json|JSON)?/g, '').trim()
  const candidates = [cleaned]
  const firstBracket = cleaned.indexOf('[')
  const lastBracket = cleaned.lastIndexOf(']')
  if (firstBracket >= 0 && lastBracket > firstBracket) candidates.push(cleaned.slice(firstBracket, lastBracket + 1))
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const parsed = JSON.parse(candidate)
      const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [parsed]
      if (items.length && items.every((item) => item && typeof item === 'object' && 'output' in item)) return JSON.stringify(items)
    } catch (error) {
      /* try the next candidate */
    }
  }
  const pieces = cleaned.match(/\{[^{}]*"output"[^{}]*\}/g)
  if (pieces && pieces.length) {
    try {
      const items = pieces.map((piece) => JSON.parse(piece))
      if (items.length) return JSON.stringify(items)
    } catch (error) {
      /* fall through to the balanced scanner */
    }
  }
  const salvaged = salvageItems(cleaned)
  if (salvaged.length) return JSON.stringify(salvaged)
  return raw
}

/** Yield every complete top-level JSON object that contains an output field. */
function salvageItems(text) {
  const items = []
  let depth = 0
  let start = -1
  let inString = false
  let escaped = false
  for (let index = 0; index < text.length; index += 1) {
    const ch = text[index]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') {
      if (depth === 0) start = index
      depth += 1
    } else if (ch === '}') {
      depth -= 1
      if (depth === 0 && start >= 0) {
        const chunk = text.slice(start, index + 1)
        start = -1
        try {
          const parsed = JSON.parse(chunk)
          if (parsed && typeof parsed === 'object' && 'output' in parsed) items.push(parsed)
        } catch (error) {
          /* skip malformed object */
        }
      }
    }
  }
  return items
}

const MODEL_ERROR_HINTS = [
  [/insufficient|balance|quota|402|欠费|余额/i, '模型额度不足（账户欠费或余额耗尽）'],
  [/unauthor|401|invalid api key|invalid.{0,8}key|鉴权/i, '模型鉴权失败（Key 无效或无权限）'],
  [/timeout|timed out|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|fetch failed|network/i, '模型连接失败（网络超时或不可达）'],
]

function friendlyModelError(message) {
  const text = String(message || '')
  for (const [pattern, hint] of MODEL_ERROR_HINTS) {
    if (pattern.test(text)) return hint + '：' + text
  }
  return '模型调用失败：' + text
}

/** Fail fast with a readable reason before a whole job burns through retries. */
async function probeModel(deps, cfg) {
  const llm = deps.getLlm()
  if (!llm) throw httpError(503, 'DSH 模型服务不可用（当前 profile 没有 LLM 服务）', 'MODEL_UNAVAILABLE')
  const options = {
    provider: cfg.provider,
    model: cfg.model,
    messages: [{ id: 'babeldoc-probe', role: 'user', content: [{ type: 'text', text: 'ping' }] }],
    maxTokens: 8,
    temperature: 0,
  }
  try {
    await drainStream(llm, { ...options, reasoningEffort: 'off' })
  } catch (error) {
    const message = String(error?.message || error)
    if (!/reasoning|effort|unsupported|not support|invalid/i.test(message)) {
      throw httpError(502, friendlyModelError(message), 'MODEL_UNAVAILABLE')
    }
    try {
      await drainStream(llm, options)
    } catch (retryError) {
      throw httpError(502, friendlyModelError(String(retryError?.message || retryError)), 'MODEL_UNAVAILABLE')
    }
  }
}

async function drainStream(llm, options) {
  for await (const chunk of llm.stream(options)) {
    if (chunk?.type === 'finish') {
      const reason = chunk.reason
      const kind = reason && typeof reason === 'object' ? reason.kind : reason
      if (kind === 'error' || kind === 'aborted') {
        const failure = reason && typeof reason === 'object' ? reason.failure : undefined
        throw new Error('DSH model call failed: ' + JSON.stringify(failure || kind))
      }
    }
  }
}

/**
 * Free translation through the built-in DSH `translator` service.
 *
 * The service wraps the anonymous Bing and Google browser endpoints (no key,
 * no account). BabelDOC sends one raw text segment per request, so the bridge
 * forwards that segment and returns the plain translation as an assistant
 * message. Text over the provider limit is split on line boundaries.
 */
async function translateCompletion(deps, res, body, engine, targetLanguage) {
  const translator = deps.getTranslator?.()
  if (!translator) {
    return openaiError(res, 503, 'DSH built-in translator is not enabled in this profile')
  }
  const provider = engine === 'google' ? 'google' : 'bing'
  const text = extractPromptText(body.messages)
  if (!text.trim()) return completionPayload(res, targetLanguage, '', 'stop')
  let limit = 4000
  try {
    limit = Math.max(200, Number(translator.maxTextChars) || 4000)
  } catch {
    /* keep the documented default */
  }
  const width = Math.max(200, limit - 40)
  try {
    const items = extractJsonItems(text)
    if (items) {
      const outputs = []
      for (const item of items) {
        const translated = await translateOne(translator, provider, targetLanguage, String(item.input), width)
        outputs.push({ id: item.id, output: translated })
      }
      return completionPayload(res, targetLanguage, JSON.stringify(outputs), 'stop')
    }
    const translated = await translateOne(translator, provider, targetLanguage, text, width)
    return completionPayload(res, targetLanguage, translated, 'stop')
  } catch (error) {
    return openaiError(res, 502, String(error?.message || error))
  }
}

/** Translate one text through the DSH service, protecting BabelDOC markup. */
async function translateOne(translator, provider, targetLanguage, text, width) {
  const { replaced, tokens } = protectMarkup(text)
  const parts = []
  for (const chunk of splitForTranslation(replaced, width)) {
    const spec = translator.resolve({ text: chunk, targetLanguage, provider })
    parts.push(await translator.translate(spec))
  }
  return restoreMarkup(parts.join('\n'), tokens)
}

/**
 * BabelDOC's batch prompt ends with a JSON array of `{id, input, ...}` and
 * expects `[{id, output}]` back. A free machine translator cannot follow that
 * instruction, so the bridge extracts the array and rebuilds the answer.
 */
function extractJsonItems(text) {
  const marker = text.indexOf('## Here is the input:')
  const payload = marker >= 0 ? text.slice(marker + '## Here is the input:'.length) : text
  const start = payload.indexOf('[')
  const end = payload.lastIndexOf(']')
  if (start < 0 || end <= start) return null
  try {
    const parsed = JSON.parse(payload.slice(start, end + 1))
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((item) => item && typeof item.input === 'string')) {
      return parsed
    }
  } catch {
    /* not the batch shape */
  }
  return null
}

const MARKUP_PATTERN = /(<\/?[a-zA-Z][^>]*>|\{[^{}\s]{1,60}\}|%[sd]|\[\[[^\]]{1,80}\]\]|%%[^%]{1,80}%%)/g

function protectMarkup(text) {
  const tokens = []
  const replaced = String(text).replace(MARKUP_PATTERN, (match) => {
    tokens.push(match)
    return '\uE000' + (tokens.length - 1) + '\uE001'
  })
  return { replaced, tokens }
}

function restoreMarkup(text, tokens) {
  return String(text).replace(/\uE000(\d+)\uE001/g, (match, index) => {
    const token = tokens[Number(index)]
    return token === undefined ? match : token
  })
}

function extractPromptText(messages) {
  const list = Array.isArray(messages) ? messages : []
  for (let index = list.length - 1; index >= 0; index -= 1) {
    const message = list[index]
    if (message?.role !== 'user') continue
    const content = message.content
    const text = typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((part) => (typeof part === 'string' ? part : part?.text || '')).join('')
        : ''
    const marker = text.indexOf('Input:\n\n')
    return marker >= 0 ? text.slice(marker + 8) : text
  }
  return ''
}

function splitForTranslation(text, limit) {
  if (text.length <= limit) return [text]
  const chunks = []
  let current = ''
  for (const line of text.split('\n')) {
    if (line.length > limit) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      for (let index = 0; index < line.length; index += limit) {
        chunks.push(line.slice(index, index + limit))
      }
      continue
    }
    const candidate = current ? current + '\n' + line : line
    if (candidate.length > limit) {
      chunks.push(current)
      current = line
    } else {
      current = candidate
    }
  }
  if (current) chunks.push(current)
  return chunks
}

function completionPayload(res, model, text, finish) {
  return json(res, 200, {
    id: 'chatcmpl-' + Date.now().toString(36),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: finish }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  })
}

/** Run one DSH model call and collect its visible text. */
async function collectStream(llm, options) {
  let text = ''
  let finish = null
  for await (const chunk of llm.stream(options)) {
    if (chunk?.type === 'text-delta') text += chunk.text || ''
    else if (chunk?.type === 'finish') {
      finish = chunk.reason
      const kind = finish && typeof finish === 'object' ? finish.kind : finish
      if (kind === 'error' || kind === 'aborted') {
        const failure = finish && typeof finish === 'object' ? finish.failure : undefined
        throw new Error('DSH model call failed: ' + JSON.stringify(failure || kind))
      }
    }
  }
  return { text, finish }
}

function toDshMessages(messages) {
  const system = []
  const mapped = []
  let index = 0
  for (const message of Array.isArray(messages) ? messages : []) {
    const content = message?.content
    const text = typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((part) => (typeof part === 'string' ? part : part?.text || '')).join('')
        : ''
    if (!text.trim()) continue
    if (message.role === 'system') {
      system.push(text)
      continue
    }
    mapped.push({
      id: 'babeldoc-llm-' + (index += 1),
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: [{ type: 'text', text }],
      source: { kind: 'user' },
    })
  }
  return { messages: mapped, system: system.join('\n\n') }
}

function finishReason(reason) {
  const kind = reason && typeof reason === 'object' ? reason.kind : reason
  if (kind === 'length') return 'length'
  if (kind === 'tool-calls' || kind === 'tool_calls') return 'tool_calls'
  return 'stop'
}

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ''))
  } catch {
    return String(value || '')
  }
}

function openaiError(res, status, message) {
  return json(res, status, { error: { message, type: 'invalid_request_error', code: status } })
}

async function diagnose(deps) {
  const env = await deps.runtime.status()
  const docs = await deps.store.listDocuments()
  let clientEntries = null
  try {
    const graph = deps.getClientModules?.()?.graph?.()
    if (graph && Array.isArray(graph.entries)) {
      clientEntries = graph.entries
        .map((entry) => String(entry.id || entry.name || ''))
        .filter((id) => id.includes('babeldoc'))
    }
  } catch {
    clientEntries = null
  }
  return {
    ok: true,
    version: deps.version,
    node: process.version,
    platform: process.platform,
    dataDir: deps.dataDir,
    uptimeMs: Date.now() - deps.startedAt,
    docs: docs.length,
    llm: Boolean(deps.getLlm()),
    clientEntries,
    env,
  }
}

async function listModels(deps) {
  const llm = deps.getLlm()
  if (!llm) return { ok: true, providers: [] }
  const providers = []
  try {
    for (const raw of llm.listProviders()) {
      const id = String(raw?.id || raw?.name || raw)
      const label = String(raw?.name || raw?.id || raw)
      try {
        const models = await llm.listModels(id)
        providers.push({
          provider: id,
          label,
          models: (models || []).map((model) => ({
            id: String(model?.id || model),
            label: String(model?.label || model?.displayName || model?.name || model?.id || model),
          })),
        })
      } catch (error) {
        // Keep the route visible even when discovery fails, so the model id
        // can still be typed by hand.
        providers.push({ provider: id, label, models: [], error: String(error?.message || error) })
      }
    }
  } catch {
    /* no llm service */
  }
  return { ok: true, providers }
}

const SUPPORTED_LANGS = new Set(['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'ru', 'pt', 'it', 'nl', 'pl', 'tr', 'vi', 'th', 'id', 'ar'])

/** Ask the selected model for the document language; script ratios are only a fallback. */
async function detectSourceLanguage(deps, cfg, doc) {
  let sample = ''
  try {
    const texts = await deps.store.extractText(doc.id, [1, 2, 3])
    sample = Object.values(texts || {}).join('\n').replace(/\s+/g, ' ').trim().slice(0, 2000)
  } catch (error) {
    /* text extraction is best effort */
  }
  if (!sample) return 'en'
  const llm = cfg.source === 'dsh' ? deps.getLlm() : null
  if (llm) {
    try {
      const result = await collectStream(llm, {
        provider: cfg.provider,
        model: cfg.model,
        messages: [{
          id: 'babeldoc-lang',
          role: 'user',
          content: [{ type: 'text', text: 'Detect the source language of the text below. Reply with exactly one ISO 639-1 code (en, zh, ja, de, fr, es, ru, ...), nothing else.\n\n' + sample }],
        }],
        maxTokens: 16,
        temperature: 0,
        reasoningEffort: 'off',
      })
      const match = String(result.text || '').toLowerCase().match(/\b([a-z]{2,3})\b/)
      if (match && SUPPORTED_LANGS.has(match[1])) return match[1]
    } catch (error) {
      /* fall back to script detection */
    }
  }
  return detectLanguageByScript(sample)
}

function detectLanguageByScript(text) {
  const sample = String(text || '')
  let cjk = 0
  let kana = 0
  let hangul = 0
  let cyrillic = 0
  let latin = 0
  for (const ch of sample) {
    const code = ch.codePointAt(0)
    if (code >= 0x3040 && code <= 0x30ff) kana += 1
    else if (code >= 0xac00 && code <= 0xd7af) hangul += 1
    else if (code >= 0x4e00 && code <= 0x9fff) cjk += 1
    else if (code >= 0x0400 && code <= 0x04ff) cyrillic += 1
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) latin += 1
  }
  const total = cjk + kana + hangul + cyrillic + latin || 1
  if (kana / total > 0.02) return 'ja'
  if (hangul / total > 0.05) return 'ko'
  if (cjk / total > 0.2) return 'zh'
  if (cyrillic / total > 0.2) return 'ru'
  return 'en'
}

function translationConfig(deps, body) {
  const source = body.source === 'dsh' ? 'dsh' : body.source === 'free' ? 'free' : 'custom'
  if (source === 'free') {
    const freeProvider = body.freeProvider === 'google' ? 'google' : 'bing'
    const langOut = String(body.langOut || 'zh')
    const origin = deps.getOrigin?.()
    if (!origin) throw httpError(503, 'Web 服务不可用，无法桥接 DSH 翻译服务')
    return {
      source,
      freeProvider,
      provider: freeProvider,
      baseUrl: origin.replace(/\/$/, '') + '/babeldoc/api/llm/dsh-translator-' + freeProvider + '/' + encodeURIComponent(langOut) + '/v1',
      apiKey: 'dsh-translator',
      model: langOut,
      langIn: String(body.langIn || 'en'),
      langOut,
      customPrompt: '',
      qps: Math.min(4, positiveInt(body.qps, 4)),
      batchSize: Math.min(4, positiveInt(body.batchSize, 2)),
      parallel: Math.min(2, positiveInt(body.parallel, 2)),
    }
  }
  if (source === 'dsh') {
    const provider = String(body.provider || '').trim()
    const model = String(body.model || '').trim()
    if (!provider || !model) throw httpError(400, '请先选择 DSH 模型')
    const origin = deps.getOrigin?.()
    if (!origin) throw httpError(503, 'Web 服务不可用，无法桥接 DSH 模型')
    return {
      source,
      provider,
      baseUrl: origin.replace(/\/$/, '') + '/babeldoc/api/llm/' + encodeURIComponent(provider) + '/' + encodeURIComponent(model) + '/v1',
      apiKey: 'dsh-babeldoc',
      model,
      langIn: String(body.langIn || 'en'),
      langOut: String(body.langOut || 'zh'),
      customPrompt: String(body.customPrompt || ''),
      qps: positiveInt(body.qps, deps.config.qps),
      batchSize: positiveInt(body.batchSize, deps.config.batchSize),
      parallel: positiveInt(body.parallel, deps.config.parallel),
    }
  }
  const baseUrl = String(body.baseUrl || '').trim()
  const apiKey = String(body.apiKey || '').trim()
  const model = String(body.model || '').trim()
  if (!baseUrl || !apiKey || !model) {
    throw httpError(400, '请先在设置里填写翻译服务的 Base URL、API Key 和模型')
  }
  return {
    source,
    baseUrl,
    apiKey,
    model,
    langIn: String(body.langIn || 'en'),
    langOut: String(body.langOut || 'zh'),
    customPrompt: String(body.customPrompt || ''),
    qps: positiveInt(body.qps, deps.config.qps),
    batchSize: positiveInt(body.batchSize, deps.config.batchSize),
    parallel: positiveInt(body.parallel, deps.config.parallel),
  }
}

async function resolvePages(deps, id, requested, lang) {
  const doc = await deps.store.getDocument(id)
  if (!doc) throw httpError(404, '文档不存在')
  const existing = new Set(await deps.store.translatedPages(id, lang))
  let pages
  if (Array.isArray(requested) && requested.length > 0) {
    pages = requested.map((value) => Number.parseInt(value, 10)).filter((value) => Number.isFinite(value))
  } else if (typeof requested === 'number') {
    pages = [requested]
  } else {
    pages = Array.from({ length: doc.pages }, (_, index) => index + 1)
  }
  pages = pages.filter((page) => page >= 1 && page <= doc.pages)
  return [...new Set(pages)].filter((page) => !existing.has(page)).sort((a, b) => a - b)
}

async function answerQuestion(deps, id, body) {
  const llm = deps.getLlm()
  if (!llm) throw httpError(503, '当前 profile 没有可用的 LLM 服务')
  const question = String(body.question || '').trim()
  if (!question) throw httpError(400, '问题不能为空')
  const doc = await deps.store.getDocument(id)
  if (!doc) throw httpError(404, '文档不存在')
  const target = await pickModels(deps, body)
  const currentPage = clamp(Number.parseInt(body.currentPage, 10) || 1, 1, doc.pages)
  const wanted = contextPages(currentPage, doc.pages)
  const texts = await deps.store.extractText(id, wanted)
  const budget = deps.config.answerBudget
  const parts = []
  let used = 0
  for (const page of wanted) {
    const text = texts[String(page)]
    if (!text) continue
    const piece = '【第 ' + page + ' 页】\n' + text
    if (used + piece.length > budget && parts.length > 0) break
    parts.push(piece)
    used += piece.length
  }
  if (parts.length === 0) throw httpError(409, '没有可用的正文内容')
  const messages = [
    {
      id: 'babeldoc-ask-' + Date.now().toString(36),
      role: 'user',
      content: [{ type: 'text', text: '文档内容：\n\n' + parts.join('\n\n') + '\n\n问题：' + question }],
      source: { kind: 'user' },
    },
  ]
  const system =
    'You are a PDF reading assistant. Answer the question using ONLY the provided document text. Cite the source page in brackets like [P3]. Answer in the language of the question; be concise, and say so when the document does not contain the answer.'
  let text = ''
  let reason = null
  for await (const chunk of llm.stream({
    provider: target.provider,
    model: target.model,
    messages,
    system,
    temperature: 0.3,
    maxTokens: 3000,
  })) {
    if (chunk?.type === 'text-delta') text += chunk.text || ''
    else if (chunk?.type === 'finish') reason = chunk.reason
  }
  if (!text && (reason === 'error' || reason === 'aborted')) {
    throw httpError(502, 'LLM 调用失败（' + reason + '）')
  }
  return { ok: true, answer: text.trim(), provider: target.provider, model: target.model }
}

async function pickModels(deps, body) {
  const llm = deps.getLlm()
  const provider = String(body.provider || '').trim()
  const model = String(body.model || '').trim()
  if (provider && model) return { provider, model }
  const providers = llm.listProviders() || []
  for (const raw of providers) {
    const id = String(raw?.id || raw?.name || raw)
    try {
      const models = await llm.listModels(id)
      if (models && models.length > 0) {
        return { provider: provider || id, model: model || String(models[0]?.id || models[0]) }
      }
    } catch {
      /* next provider */
    }
  }
  throw httpError(409, '没有可用的问答模型')
}

function contextPages(current, total) {
  const wanted = []
  const add = (page) => {
    if (page >= 1 && page <= total && !wanted.includes(page)) wanted.push(page)
  }
  add(current)
  add(current - 1)
  add(current + 1)
  add(current - 2)
  add(current + 2)
  for (let page = 1; page <= Math.min(4, total); page += 1) add(page)
  for (let page = 1; page <= total; page += 1) add(page)
  return wanted
}

function sameOrigin(req) {
  const origin = req.headers.origin
  if (origin === undefined || origin === '') return true
  let host
  try {
    host = new URL(origin).host
  } catch {
    return false
  }
  return String(req.headers.host || '').toLowerCase() === host.toLowerCase()
}

function decodeName(raw) {
  if (typeof raw !== 'string' || raw === '') return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function readJson(req) {
  return readBody(req, JSON_LIMIT).then((buffer) => {
    if (!buffer.length) return {}
    return JSON.parse(buffer.toString('utf8'))
  })
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(httpError(413, '请求体过大'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function json(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': String(Buffer.byteLength(text)),
  })
  res.end(text)
}

function httpError(status, message, code) {
  const error = new Error(message)
  error.status = status
  if (code) error.code = code
  return error
}

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 16) : fallback
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
