/**
 * Host half of the bilingual PDF plugin.
 *
 * The plugin owns no Remote namespace: Host methods are not visible to a
 * third-party Client module because the Client `ctx.remote` facade only mounts
 * generated contributions. It therefore exposes a small same-origin HTTP API
 * under `/babeldoc`, registered on the Web server, and the browser half calls
 * it with `fetch`.
 */

import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { createApi } from './api.js'
import { DocStore } from './docs.js'
import { JobManager } from './jobs.js'
import { PythonRuntime } from './python.js'

const require = createRequire(import.meta.url)
const { version: VERSION } = require('../package.json')

const DEFAULTS = {
  dataDir: '',
  python: '',
  pipIndex: '',
  qps: 16,
  batchSize: 8,
  parallel: 3,
  retryLimit: 2,
  maxUploadMB: 200,
  timeoutMs: 1_200_000,
  answerBudget: 24_000,
}

export const name = 'babeldoc-pdf'

export function apply(ctx, config) {
  const settings = { ...DEFAULTS, ...(config || {}) }
  const logger = ctx.logger ?? console
  const dataDir = resolveDataDir(settings)
  const startedAt = Date.now()

  const runtime = new PythonRuntime({
    dataDir,
    config: settings,
    getSubprocess: () => ctx.get('subprocess'),
    logger,
  })
  const store = new DocStore({ dataDir, runtime, logger })
  const jobs = new JobManager({ store, runtime, config: settings, logger })
  const getLlm = () => ctx.get('llm')
  const getClientModules = () => ctx.get('clientModules')
  const getOrigin = () => ctx.get('webServer')?.getOrigin?.()

  const handler = createApi({
    store,
    runtime,
    jobs,
    config: settings,
    logger,
    getLlm,
    getClientModules,
    getOrigin,
    dataDir,
    startedAt,
    version: VERSION,
  })

  store.init().catch((error) => logger?.warn?.('babeldoc: cannot prepare data directory: ' + String(error?.message || error)))
  mkdir(dataDir, { recursive: true }).catch(() => {})

  ctx.effect(() => () => jobs.shutdown(), 'babeldoc-pdf: jobs')

  ctx.inject(['webServer'], (scoped) => {
    scoped.effect(
      () =>
        scoped.webServer.register({
          kind: 'prefix',
          path: '/babeldoc',
          handler,
        }),
      'babeldoc-pdf: routes',
    )
  })
}

function resolveDataDir(settings) {
  if (settings.dataDir) return path.resolve(settings.dataDir)
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'babeldoc')
}
