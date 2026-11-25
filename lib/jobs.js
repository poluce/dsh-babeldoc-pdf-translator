/**
 * Translation jobs.
 *
 * The Host owns the queue: pages are grouped into batches, each batch runs one
 * BabelDOC process, the produced mono PDF is split back into the per-page
 * cache, and table-of-contents pages get the layout repair. Jobs are resumable
 * because the page cache decides what is still missing.
 */

import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

export class JobManager {
  constructor({ store, runtime, config, logger }) {
    this.store = store
    this.runtime = runtime
    this.config = config
    this.logger = logger
    this.entries = new Map()
    this.seq = 0
    this.closed = false
  }

  create({ docId, pages, cfg, lang }) {
    const id = 'job-' + Date.now().toString(36) + '-' + (this.seq += 1).toString(36)
    const job = {
      id,
      docId,
      lang,
      pages: [...pages],
      status: 'queued',
      total: pages.length,
      done: 0,
      failed: 0,
      failedPages: [],
      current: '',
      detail: '排队中…',
      error: '',
      createdAt: Date.now(),
      endedAt: null,
      merged: false,
    }
    const controller = new AbortController()
    this.entries.set(id, { job, controller, cancelled: false, cfg })
    this.run(id).catch((error) => {
      job.status = 'error'
      job.error = String(error?.message || error)
      job.endedAt = Date.now()
    })
    return job
  }

  view(id) {
    const entry = this.entries.get(id)
    return entry ? { ...entry.job } : null
  }

  cancel(id) {
    const entry = this.entries.get(id)
    if (!entry) return null
    entry.cancelled = true
    entry.controller.abort()
    if (entry.job.status === 'running' || entry.job.status === 'queued') {
      entry.job.status = 'cancelled'
      entry.job.detail = '已停止'
      entry.job.endedAt = Date.now()
    }
    return { ...entry.job }
  }

  cancelDoc(docId) {
    for (const [id, entry] of this.entries) {
      if (entry.job.docId === docId && (entry.job.status === 'running' || entry.job.status === 'queued')) {
        this.cancel(id)
      }
    }
  }

  shutdown() {
    this.closed = true
    for (const entry of this.entries.values()) {
      try {
        entry.controller.abort()
      } catch {
        /* ignore */
      }
    }
  }

  async run(id) {
    const entry = this.entries.get(id)
    const job = entry.job
    const meta = await this.store.getDocument(job.docId)
    if (!meta) throw new Error('文档不存在')
    job.status = 'running'
    job.detail = '准备翻译…'

    const existing = new Set(await this.store.translatedPages(job.docId, job.lang))
    const todo = job.pages.filter((page) => !existing.has(page))
    job.total = todo.length
    if (todo.length === 0) {
      job.status = 'done'
      job.detail = '所有页面已翻译'
      job.endedAt = Date.now()
      await this.merge(id)
      return
    }

    let toc = new Set()
    try {
      toc = await this.store.tocPages(job.docId)
    } catch {
      /* TOC detection is optional */
    }

    const batchSize = Math.max(1, Number(entry.cfg?.batchSize) || this.config.batchSize || 1)
    const parallel = Math.max(1, Number(entry.cfg?.parallel) || this.config.parallel || 1)
    const batches = chunk(todo, batchSize)
    let cursor = 0
    const take = () => (cursor < batches.length ? cursor++ : -1)
    const workers = Array.from(
      { length: Math.max(1, Math.min(parallel, batches.length)) },
      () => this.worker(entry, batches, take, toc),
    )
    await Promise.all(workers)

    if (entry.cancelled) {
      job.status = 'cancelled'
      job.detail = '已停止'
    } else if (job.done === 0) {
      job.status = 'error'
      job.error = job.error || '全部页面翻译失败'
    } else {
      job.status = 'done'
      job.detail = job.failed > 0 ? `完成（${job.failed} 页失败）` : '完成'
      await this.merge(id)
    }
    job.endedAt = Date.now()
  }

  async merge(id) {
    const entry = this.entries.get(id)
    if (!entry || entry.cancelled) return
    try {
      await this.store.mergeDocument(entry.job.docId, entry.job.lang)
      entry.job.merged = true
    } catch (error) {
      this.logger?.warn?.('babeldoc: merge failed ' + String(error?.message || error))
    }
  }

  async worker(entry, batches, next, toc) {
    for (;;) {
      if (entry.cancelled || this.closed) return
      const index = next()
      if (index < 0 || index >= batches.length) return
      await this.runBatch(entry, batches[index], index, toc)
    }
  }

  async runBatch(entry, pages, index, toc) {
    const job = entry.job
    const retries = Math.max(0, Number(this.config.retryLimit ?? 2))
    const attempts = retries + 1
    const tocHit = pages.some((page) => toc.has(page))
    let lastError = null
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const tempDir = path.join(this.store.tmpDir, job.id, 'b' + index + (attempt > 1 ? '-r' + attempt : ''))
      job.current = '第 ' + pages.join('、') + ' 页'
      job.detail = attempt === 1 ? '启动 BabelDOC…' : '有段落未译好，正在重试…'
      try {
        await mkdir(tempDir, { recursive: true })
        const args = buildArgs(this.store.originalPath(job.docId), tempDir, pages, entry.cfg)
        // A retry must bypass BabelDOC's on-disk cache: a previous failed run
        // can leave empty/poisoned entries that would keep failing forever.
        if (attempt > 1 && !args.includes('--ignore-cache')) args.push('--ignore-cache')
        if (tocHit) args.push('--short-line-split-factor', '1.5')
        const run = await this.runtime.run('babeldoc_run.py', args, {
          signal: entry.controller.signal,
          timeoutMs: this.config.timeoutMs,
          onChunk: (text) => {
            job.detail = summarize(text)
          },
        })
        if (entry.cancelled) return
        const mono = await findMono(tempDir)
        if (!mono) throw new Error('BabelDOC 未生成 .mono.pdf 输出')
        await this.saveLog(job, index, run, attempt)
        assertTranslated(run)
        const written = await this.store.savePagesFromMono(job.docId, mono, pages, job.lang)
        const missing = pages.filter((page) => !written.includes(page))
        if (missing.length) {
          job.failed += missing.length
          job.failedPages.push(...missing)
        }
        if (tocHit) await this.fixToc(job.docId, pages.filter((page) => written.includes(page)), job.lang, toc)
        job.done += written.length
        job.detail = '已完成 ' + job.done + '/' + job.total + ' 页'
        this.logger?.info?.('babeldoc: batch done pages=' + pages.join(',') + ' ' + tail(run.stderr, 200))
        await rm(tempDir, { recursive: true, force: true }).catch(() => {})
        return
      } catch (error) {
        await rm(tempDir, { recursive: true, force: true }).catch(() => {})
        if (entry.cancelled) return
        lastError = error
        if (error && error.code === 'FALLBACK' && attempt < attempts) {
          job.detail = '有段落未译好，重试中（' + attempt + '/' + retries + '）…'
          this.logger?.warn?.('babeldoc: retry batch pages=' + pages.join(',') + ' attempt=' + attempt + ' ' + String(error.message || error).slice(0, 200))
          await delay(1000 * attempt)
          continue
        }
        break
      }
    }
    const message = String(lastError?.message || lastError)
    job.failed += pages.length
    job.failedPages.push(...pages)
    job.error = lastError && lastError.code === 'FALLBACK'
      ? message + '（已重试 ' + retries + ' 次）'
      : message
    job.detail = '批次失败：' + job.error.slice(0, 200)
    this.logger?.warn?.('babeldoc: batch failed pages=' + pages.join(',') + ' ' + message.slice(0, 400))
  }

  async saveLog(job, index, run, attempt = 1) {
    try {
      const dir = path.join(this.store.dataDir, 'logs')
      await mkdir(dir, { recursive: true })
      const body = 'STDOUT\n' + String(run.stdout || '') + '\n\nSTDERR\n' + String(run.stderr || '')
      const suffix = attempt > 1 ? '-r' + attempt : ''
      await writeFile(path.join(dir, job.id + '-b' + index + suffix + '.log'), body, 'utf8')
    } catch {
      /* logs are best effort */
    }
  }

  async fixToc(docId, pages, lang, toc) {    for (const page of pages) {
      if (!toc.has(page)) continue
      try {
        await this.runtime.run('fix_toc.py', [
          this.store.originalPath(docId),
          this.store.pagePdf(docId, page, lang),
          String(page - 1),
        ])
      } catch (error) {
        this.logger?.warn?.('babeldoc: fix_toc failed page=' + page + ' ' + String(error?.message || error))
      }
    }
  }
}

function buildArgs(input, output, pages, cfg) {
  const args = [
    '--files', input,
    '--output', output,
    '--openai',
    '--openai-model', cfg.model,
    '--openai-base-url', cfg.baseUrl,
    '--openai-api-key', cfg.apiKey,
    '--lang-in', cfg.langIn || 'en',
    '--lang-out', cfg.langOut || 'zh',
    '--skip-scanned-detection',
    '--no-auto-extract-glossary',
    '--watermark-output-mode', 'no_watermark',
    '--no-dual',
    '--qps', String(cfg.qps || 8),
    '--openai-thinking', 'disabled',
    '--split-short-lines',
    '--pages', pages.join(','),
    '--only-include-translated-page',
  ]
  if (cfg.customPrompt) args.push('--custom-system-prompt', cfg.customPrompt)
  // The free translator bridge answers a JSON batch prompt itself; cached
  // entries from an earlier LLM run would bypass it and poison the parse.
  if (cfg.source === 'free') args.push('--ignore-cache')
  return args
}

async function findMono(dir) {
  const entries = await readdir(dir).catch(() => [])
  const files = []
  for (const name of entries) {
    if (!name.toLowerCase().endsWith('.pdf')) continue
    const target = path.join(dir, name)
    try {
      const info = await stat(target)
      if (info.size > 0) files.push({ name, target, mtime: info.mtimeMs })
    } catch {
      /* ignore */
    }
  }
  files.sort((a, b) => {
    const am = a.name.includes('.no_watermark.') ? 1 : 0
    const bm = b.name.includes('.no_watermark.') ? 1 : 0
    if (am !== bm) return bm - am
    return b.mtime - a.mtime
  })
  return files.length ? files[0].target : null
}

/**
 * BabelDOC falls back to the original text when the model call fails, so a bad
 * endpoint or key still produces a "successful" run with an unchanged PDF.
 * Treat an all-fallback page as a failure so the UI reports the real problem.
 */
function assertTranslated(run) {
  const text = String(run.stderr || '') + '\n' + String(run.stdout || '')
  const clean = text
    .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
    .replace(/\x1b\][^\x07]*\x07/g, '')
    .replace(/\s+/g, ' ')
  const matches = [...clean.matchAll(/Total:\s*(\d+),\s*Successful:\s*(\d+),\s*Fallback:\s*(\d+)/g)]
  if (matches.length === 0) return
  const last = matches[matches.length - 1]
  const total = Number(last[1])
  const successful = Number(last[2])
  const fallback = Number(last[3])
  if (total <= 0) return
  // BabelDOC also "falls back" for paragraphs that cannot be translated on
  // purpose (page numbers, text identical to the source). Only the ones that
  // failed because of an API/translation error are worth retrying.
  const compact = clean.replace(/\s+/g, '')
  const contentFallbacks = (compact.match(/Translationresultisthesameasinput|TranslationresultistoolongortooShort/gi) || []).length
  const apiFallbacks = Math.max(0, fallback - contentFallbacks)
  if (successful === 0 && apiFallbacks > 0) {
    throw new Error('BabelDOC 没有成功翻译任何段落，请检查模型 API（额度 / 地址 / Key / 模型名）')
  }
  if (apiFallbacks > 0) {
    const error = new Error('有 ' + apiFallbacks + '/' + total + ' 个段落翻译失败')
    error.code = 'FALLBACK'
    throw error
  }
}

function chunk(list, size) {  const result = []
  for (let index = 0; index < list.length; index += size) result.push(list.slice(index, index + size))
  return result
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function summarize(text) {
  const clean = String(text || '')
    .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
    .replace(/\x1b\][^\x07]*\x07/g, '')
    .replace(/\r/g, '\n')
  const lines = clean
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const dedup = []
  for (const line of lines) {
    if (dedup[dedup.length - 1] !== line) dedup.push(line)
  }
  return dedup.slice(-6).join(' · ').slice(-300) || '处理中…'
}

function tail(text, limit) {
  const value = String(text || '')
  return value.length > limit ? value.slice(-limit) : value
}
