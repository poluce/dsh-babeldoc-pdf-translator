/**
 * Document store: one directory per PDF under the plugin data directory.
 *
 * Layout:
 *   docs/<id>/original.pdf
 *   docs/<id>/meta.json
 *   docs/<id>/pages/p<n>.<lang>.pdf     translated single pages (the cache)
 *   docs/<id>/merged/<lang>.pdf         export assembled from the cache
 *   docs/<id>/cache/*.png               rendered page images
 *
 * A document id is the SHA-1 prefix of its bytes, so opening the same file
 * twice reuses the same cache instead of duplicating work.
 */

import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PAGE_WIDTH = 1400

export class DocStore {
  constructor({ dataDir, runtime, logger }) {
    this.dataDir = dataDir
    this.runtime = runtime
    this.logger = logger
    this.docsDir = path.join(dataDir, 'docs')
    this.tmpDir = path.join(dataDir, 'tmp')
    this.metas = new Map()
    this.renders = new Map()
    this.toc = new Map()
    this.activeRenders = 0
    this.renderWaiters = []
  }

  async init() {
    await mkdir(this.docsDir, { recursive: true })
    await mkdir(this.tmpDir, { recursive: true })
  }

  docDir(id) {
    return path.join(this.docsDir, id)
  }

  pageDir(id) {
    return path.join(this.docDir(id), 'pages')
  }

  cacheDir(id) {
    return path.join(this.docDir(id), 'cache')
  }

  pagePdf(id, page, lang) {
    return path.join(this.pageDir(id), `p${page}.${lang}.pdf`)
  }

  async addDocument({ name, buffer }) {
    const id = createHash('sha1').update(buffer).digest('hex').slice(0, 16)
    const existing = await this.getDocument(id)
    if (existing) {
      existing.name = name || existing.name
      existing.updatedAt = Date.now()
      await this.saveMeta(existing)
      return existing
    }
    const dir = this.docDir(id)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'original.pdf'), buffer)
    const inspected = await this.inspect(id)
    const meta = {
      id,
      name: name || 'document.pdf',
      pages: inspected.pages,
      dims: inspected.dims,
      size: buffer.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      langs: [],
      toc: null,
    }
    await this.saveMeta(meta)
    return meta
  }

  async inspect(id) {
    const run = await this.runtime.run('inspect_pdf.py', [path.join(this.docDir(id), 'original.pdf')])
    return JSON.parse(extractJson(run.stdout))
  }

  async getDocument(id) {
    if (this.metas.has(id)) return this.metas.get(id)
    try {
      const raw = await readFile(path.join(this.docDir(id), 'meta.json'), 'utf8')
      const meta = JSON.parse(raw)
      this.metas.set(id, meta)
      return meta
    } catch {
      return null
    }
  }

  async saveMeta(meta) {
    this.metas.set(meta.id, meta)
    await writeFile(path.join(this.docDir(meta.id), 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
  }

  async listDocuments() {
    const entries = await readdir(this.docsDir, { withFileTypes: true }).catch(() => [])
    const docs = []
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const meta = await this.getDocument(entry.name)
      if (meta) docs.push(publicDoc(meta))
    }
    docs.sort((a, b) => b.updatedAt - a.updatedAt)
    return docs
  }

  async removeDocument(id) {
    this.metas.delete(id)
    this.toc.delete(id)
    await rm(this.docDir(id), { recursive: true, force: true })
  }

  /** Pages already translated for a language, derived from the cache files. */
  async translatedPages(id, lang) {
    const entries = await readdir(this.pageDir(id)).catch(() => [])
    const suffix = `.${lang}.pdf`
    const pages = []
    for (const name of entries) {
      if (!name.startsWith('p') || !name.endsWith(suffix)) continue
      const number = Number.parseInt(name.slice(1, -suffix.length), 10)
      if (Number.isFinite(number)) pages.push(number)
    }
    pages.sort((a, b) => a - b)
    return pages
  }

  async documentView(id, lang) {
    const meta = await this.getDocument(id)
    if (!meta) return null
    const translated = lang ? await this.translatedEntries(id, lang) : []
    return { ...publicDoc(meta), translated, lang: lang || '' }
  }

  /** Translated pages with the cache revision used for browser cache busting. */
  async translatedEntries(id, lang) {
    const pages = await this.translatedPages(id, lang)
    const entries = []
    for (const page of pages) {
      entries.push({ page, v: await this.pageTimestamp(id, page, lang) })
    }
    return entries
  }

  /** Split one BabelDOC mono PDF into the per-page cache files. */
  async savePagesFromMono(id, monoPath, pages, lang) {
    await mkdir(this.pageDir(id), { recursive: true })
    const run = await this.runtime.run('split_pages.py', [
      monoPath,
      this.pageDir(id),
      lang,
      pages.join(','),
    ])
    const parsed = JSON.parse(extractJson(run.stdout))
    const written = Array.isArray(parsed.written) ? parsed.written : []
    this.renders.clear()
    return written
  }

  /** Render at most a few pages at once; a scrolling reader requests many. */
  async withRenderSlot(work) {
    if (this.activeRenders >= 3) {
      await new Promise((resolve) => this.renderWaiters.push(resolve))
    }
    this.activeRenders += 1
    try {
      return await work()
    } finally {
      this.activeRenders -= 1
      const next = this.renderWaiters.shift()
      if (next) next()
    }
  }

  async pageTimestamp(id, page, lang) {
    try {
      const info = await stat(this.pagePdf(id, page, lang))
      return Math.round(info.mtimeMs)
    } catch {
      return 0
    }
  }

  /** Render one page of either the original or a translated page to PNG. */
  async renderPagePng(id, page, kind, lang) {
    const meta = await this.getDocument(id)
    if (!meta) throw new Error('文档不存在')
    if (page < 1 || page > meta.pages) throw new Error('页码超出范围')
    const stamp = kind === 'trans' ? await this.pageTimestamp(id, page, lang) : 0
    if (kind === 'trans' && stamp === 0) throw new Error('该页尚未翻译')
    const key = `${id}:${kind}:${lang}:${page}:${stamp}`
    if (this.renders.has(key)) return this.renders.get(key)

    const task = (async () => {
      const outDir = this.cacheDir(id)
      await mkdir(outDir, { recursive: true })
      const out = path.join(outDir, `p${page}.${kind}.${lang || 'src'}.${stamp}.png`)
      try {
        const existing = await stat(out)
        if (existing.size > 0) return out
      } catch {
        /* render below */
      }
      const source =
        kind === 'trans'
          ? this.pagePdf(id, page, lang)
          : path.join(this.docDir(id), 'original.pdf')
      return this.withRenderSlot(async () => {
        await this.runtime.run('render_page.py', [source, String(page - 1), out, String(PAGE_WIDTH)])
        return out
      })
    })()
    this.renders.set(key, task)
    try {
      return await task
    } finally {
      this.renders.delete(key)
    }
  }

  /** Assemble the export PDF, reusing the page cache. */
  async mergeDocument(id, lang, force = false) {
    const meta = await this.getDocument(id)
    if (!meta) throw new Error('文档不存在')
    const outDir = path.join(this.docDir(id), 'merged')
    await mkdir(outDir, { recursive: true })
    const out = path.join(outDir, `${lang}.pdf`)
    if (!force) {
      try {
        const info = await stat(out)
        const newest = await newestPageMtime(this.pageDir(id), lang)
        if (info.size > 0 && info.mtimeMs >= newest) return out
      } catch {
        /* rebuild below */
      }
    }
    await this.runtime.run('merge_pages.py', [
      path.join(this.docDir(id), 'original.pdf'),
      this.pageDir(id),
      lang,
      out,
    ])
    return out
  }

  async exportStream(id, lang) {
    const file = await this.mergeDocument(id, lang)
    const info = await stat(file)
    return { file, size: info.size }
  }

  async clearCache(id) {
    if (id) {
      await rm(this.pageDir(id), { recursive: true, force: true })
      await rm(this.cacheDir(id), { recursive: true, force: true })
      await rm(path.join(this.docDir(id), 'merged'), { recursive: true, force: true })
    } else {
      const entries = await readdir(this.docsDir, { withFileTypes: true }).catch(() => [])
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        await rm(path.join(this.docDir(entry.name), 'pages'), { recursive: true, force: true })
        await rm(path.join(this.docDir(entry.name), 'cache'), { recursive: true, force: true })
        await rm(path.join(this.docDir(entry.name), 'merged'), { recursive: true, force: true })
      }
    }
  }

  async tocPages(id) {
    if (this.toc.has(id)) return this.toc.get(id)
    const run = await this.runtime.run('toc_pages.py', [path.join(this.docDir(id), 'original.pdf')])
    const parsed = JSON.parse(extractJson(run.stdout))
    const pages = new Set(Array.isArray(parsed.toc) ? parsed.toc : [])
    this.toc.set(id, pages)
    const meta = await this.getDocument(id)
    if (meta) {
      meta.toc = [...pages]
      await this.saveMeta(meta)
    }
    return pages
  }

  async extractText(id, pages) {
    const spec = pages && pages.length ? pages.join(',') : 'all'
    const run = await this.runtime.run('extract_text.py', [
      path.join(this.docDir(id), 'original.pdf'),
      spec,
      '6000',
    ])
    return JSON.parse(extractJson(run.stdout)).texts || {}
  }

  pageSource(id, page, lang) {
    return this.pagePdf(id, page, lang)
  }

  originalPath(id) {
    return path.join(this.docDir(id), 'original.pdf')
  }

  readStream(file) {
    return createReadStream(file)
  }
}

export function publicDoc(meta) {
  return {
    id: meta.id,
    name: meta.name,
    pages: meta.pages,
    dims: meta.dims,
    size: meta.size,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    toc: meta.toc || [],
  }
}

async function newestPageMtime(dir, lang) {
  const entries = await readdir(dir).catch(() => [])
  const suffix = `.${lang}.pdf`
  let newest = 0
  for (const name of entries) {
    if (!name.endsWith(suffix)) continue
    try {
      const info = await stat(path.join(dir, name))
      newest = Math.max(newest, info.mtimeMs)
    } catch {
      /* ignore */
    }
  }
  return newest
}

function extractJson(text) {
  const value = String(text || '')
  const start = value.indexOf('{')
  const end = value.lastIndexOf('}')
  return start >= 0 && end > start ? value.slice(start, end + 1) : value
}
