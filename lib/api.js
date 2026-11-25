/**
 * Same-origin JSON API served under `/babeldoc`.
 *
 * The Client half is a plain Web module, so it talks to the Host over HTTP
 * instead of a generated Remote namespace. Routes are intentionally small and
 * resource-shaped: documents, pages, jobs, environment.
 */

import { createReadStream } from 'node:fs'
import { appendFile, mkdir, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

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
  const llm = deps.getLlm()
  if (!llm) return openaiError(res, 503, 'DSH LLM service is unavailable')
  const mapped = toDshMessages(body.messages)
  if (mapped.messages.length === 0) return openaiError(res, 400, 'no chat messages')
  const base = {
    provider,
    model,
    temperature: typeof body.temperature === 'number' ? body.temperature : 0,
    maxTokens: Math.max(16384, Number.isFinite(Number(body.max_tokens)) ? Number(body.max_tokens) : 2048),
  }
  const batch = extractJsonItems(extractPromptText(body.messages))
  try {
    if (!batch) {
      const plain = await runGeneration(llm, { ...base, messages: mapped.messages, system: mapped.system || undefined })
      return completionPayload(res, model, plain.text, finishReason(plain.finish))
    }
    return await translateWithTool(deps, res, { llm, provider, model, base, mapped, batch })
  } catch (error) {
    return openaiError(res, 502, String(error?.message || error))
  }
}

/** One model call with thinking disabled, plus one larger-budget retry on an empty answer. */
async function runGeneration(llm, options) {
  let result
  try {
    result = await collectStream(llm, { ...options, reasoningEffort: 'off' })
  } catch (error) {
    // Channels that do not accept an explicit reasoning effort still answer.
    if (!/reasoning|effort|unsupported|not support|invalid/i.test(String(error?.message || error))) throw error
    result = await collectStream(llm, options)
  }
  if (!result.toolCalls.length && !String(result.text || '').trim() && isTokenLimit(result.finish)) {
    const bigger = { ...options, maxTokens: Math.min(65536, Math.max((options.maxTokens || 16384) * 2, 32768)) }
    result = await collectStream(llm, { ...bigger, reasoningEffort: 'off' }).catch(() => result)
  }
  return result
}

const TRANSLATION_TOOL = {
  name: 'submit_translations',
  description: '提交本批次全部段落的译文。items 的数量必须与输入一致，id 必须与输入的 id 一一对应。',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'output'],
          properties: {
            id: { type: ['integer', 'string'] },
            output: { type: 'string' },
          },
        },
      },
    },
  },
}

const TOOL_SYSTEM_NOTE = '你是翻译引擎。必须调用 submit_translations 工具提交本批全部段落的译文，不要直接输出正文。items 的数量与顺序必须与输入一致，id 必须与输入一一对应，output 只放译文。'

/**
 * Drive one batch of BabelDOC paragraphs through the tool-calling protocol.
 * A wrong tool submission comes back as an isError tool result so the model
 * can re-plan; three failed rounds reject the request instead of guessing.
 */
async function translateWithTool(deps, res, { llm, provider, model, base, mapped, batch }) {
  const expectedIds = batch.map((item) => item.id)
  const messages = mapped.messages.map((message) => ({ ...message }))
  const system = mapped.system ? mapped.system + '\n\n' + TOOL_SYSTEM_NOTE : TOOL_SYSTEM_NOTE
  let lastError = '模型没有调用 submit_translations'
  for (let round = 1; round <= 3; round += 1) {
    const result = await runGeneration(llm, {
      provider,
      model,
      messages,
      system,
      tools: [TRANSLATION_TOOL],
      temperature: 0,
      maxTokens: base.maxTokens,
    })
    const call = result.toolCalls.find((item) => item.name === TRANSLATION_TOOL.name) || result.toolCalls[0]
    if (!call) {
      const text = String(result.text || '').trim()
      lastError = '模型没有调用 submit_translations' + (text ? '（而是输出了文本）' : '')
      if (text) messages.push(await assistantTextMessage(provider, model, text))
      messages.push({
        id: 'babeldoc-user-' + round + '-' + randomUUID(),
        role: 'user',
        content: [{ type: 'text', text: '请调用 submit_translations 工具，按输入数量与 id 提交全部译文，不要直接回复文本。' }],
      })
      await debugBridge(deps, { kind: 'tool-missing', round, textChars: text.length, finish: result.finish || null })
      continue
    }
    let parsed = null
    try {
      parsed = JSON.parse(call.arguments)
    } catch (error) {
      lastError = '工具参数不是合法 JSON：' + String(error?.message || error)
      messages.push(await assistantToolCallMessage(provider, model, call))
      messages.push(await toolErrorMessage(call.id, lastError))
      await debugBridge(deps, { kind: 'tool-bad-json', round, error: lastError })
      continue
    }
    const verdict = validateSubmission(parsed, expectedIds)
    if (verdict.ok) {
      return completionPayload(res, model, JSON.stringify(verdict.items), 'stop')
    }
    lastError = verdict.error
    messages.push(await assistantToolCallMessage(provider, model, call))
    messages.push(await toolErrorMessage(call.id, verdict.error))
    await debugBridge(deps, { kind: 'tool-invalid', round, error: verdict.error })
  }
  throw new Error('submit_translations 连续 3 轮未成功：' + lastError)
}

function validateSubmission(parsed, expectedIds) {
  const items = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : null
  if (!items) return { ok: false, error: '工具参数缺少 items 数组' }
  if (items.length !== expectedIds.length) {
    return { ok: false, error: 'items 数量不匹配：期望 ' + expectedIds.length + ' 项，实际 ' + items.length + ' 项' }
  }
  const wanted = new Set(expectedIds.map((id) => String(id)))
  const outputs = new Map()
  for (const item of items) {
    if (!item || typeof item !== 'object') return { ok: false, error: 'items 中包含非对象元素' }
    const id = String(item.id)
    if (!wanted.has(id)) return { ok: false, error: '出现未知 id：' + id }
    if (outputs.has(id)) return { ok: false, error: 'id 重复：' + id }
    if (typeof item.output !== 'string') return { ok: false, error: 'id ' + id + ' 的 output 不是字符串' }
    outputs.set(id, item.output)
  }
  const ordered = expectedIds.map((id) => ({ id, output: outputs.get(String(id)) }))
  return { ok: true, items: ordered }
}

let messageFactories = null

/** Reuse DSH's own message constructors when the installed package is reachable. */
async function loadMessageFactories() {
  if (messageFactories) return messageFactories
  messageFactories = {}
  try {
    const installDir = process.env.DSH_INSTALL_DIR
    if (!installDir) throw new Error('DSH_INSTALL_DIR is not set')
    const file = path.join(installDir, '..', 'dsh-llm', 'lib', 'message.js')
    const mod = await import(pathToFileURL(file).href)
    if (typeof mod.createAssistantMessage === 'function' && typeof mod.createToolResultMessage === 'function') {
      messageFactories = {
        createAssistantMessage: mod.createAssistantMessage,
        createToolResultMessage: mod.createToolResultMessage,
      }
    }
  } catch (error) {
    /* plain message objects below remain valid for adapters */
  }
  return messageFactories
}

async function assistantTextMessage(provider, model, text) {
  const content = [{ type: 'text', text }]
  const factories = await loadMessageFactories()
  if (factories.createAssistantMessage) return factories.createAssistantMessage({ content, source: { provider, model } })
  return { id: 'babeldoc-' + randomUUID(), role: 'assistant', source: { kind: 'model', provider, model }, content }
}

async function assistantToolCallMessage(provider, model, call) {
  const content = [{ type: 'tool-call', id: call.id, name: call.name, arguments: call.arguments }]
  const factories = await loadMessageFactories()
  if (factories.createAssistantMessage) return factories.createAssistantMessage({ content, source: { provider, model } })
  return { id: 'babeldoc-' + randomUUID(), role: 'assistant', source: { kind: 'model', provider, model }, content }
}

async function toolErrorMessage(callId, text) {
  const content = [{ type: 'text', text }]
  const factories = await loadMessageFactories()
  if (factories.createToolResultMessage) return factories.createToolResultMessage({ callId, content, isError: true })
  return { id: 'babeldoc-' + randomUUID(), role: 'tool', source: { kind: 'tool', callId }, toolCallId: callId, isError: true, content }
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

/** Run one DSH model call and collect visible text plus any tool calls. */
async function collectStream(llm, options) {
  let text = ''
  let finish = null
  const toolCalls = new Map()
  for await (const chunk of llm.stream(options)) {
    if (chunk?.type === 'text-delta') {
      text += chunk.text || ''
      continue
    }
    if (chunk?.type === 'tool-call-delta') {
      const key = chunk.id || 'call-' + (chunk.index ?? toolCalls.size)
      let entry = toolCalls.get(key)
      if (!entry) {
        entry = { id: chunk.id || key, name: '', arguments: '' }
        toolCalls.set(key, entry)
      }
      if (chunk.name) entry.name = chunk.name
      entry.arguments += chunk.argumentsDelta || ''
      continue
    }
    if (chunk?.type === 'finish') {
      finish = chunk.reason
      const kind = finish && typeof finish === 'object' ? finish.kind : finish
      if (kind === 'error' || kind === 'aborted') {
        const failure = finish && typeof finish === 'object' ? finish.failure : undefined
        throw new Error('DSH model call failed: ' + JSON.stringify(failure || kind))
      }
    }
  }
  return { text, finish, toolCalls: [...toolCalls.values()] }
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
  const provider = String(body.provider || '').trim()
  const model = String(body.model || '').trim()
  if (!provider || !model) throw httpError(400, '请先选择 DSH 模型')
  const origin = deps.getOrigin?.()
  if (!origin) throw httpError(503, 'Web 服务不可用，无法桥接 DSH 模型')
  return {
    source: 'dsh',
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
