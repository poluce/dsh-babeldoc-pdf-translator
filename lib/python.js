/**
 * Python runtime for the BabelDOC helpers.
 *
 * The plugin owns an isolated virtual environment under its data directory.
 * Every helper script ships inside the package (`python/`) and runs from
 * there, so an upgrade replaces the scripts instead of leaving stale copies in
 * a workspace. Nothing is pip-installed into the user's global interpreter.
 */

import { spawn } from 'node:child_process'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPTS_DIR = fileURLToPath(new URL('../python/', import.meta.url))
const REQUIRED_MODULES = ['pymupdf', 'babeldoc', 'openai', 'httpx', 'peewee']
// bitstring 5 removed BitStream, which BabelDOC 0.6 still imports; its own
// metadata only requires >=4.3, so the constraint has to live here.
const INSTALL_SPECS = [...REQUIRED_MODULES, 'bitstring<5']
const PROBE_CODE = [
  'import json, sys',
  'mods = {}',
  'for name in ["pymupdf", "babeldoc", "openai", "httpx", "peewee"]:',
  '    try:',
  '        __import__(name)',
  '        mods[name] = True',
  '    except Exception:',
  '        mods[name] = False',
  'print(json.dumps({"python": sys.version.split()[0], "modules": mods}))',
].join('\n')

export class EnvNotReadyError extends Error {
  constructor(message, probe) {
    super(message)
    this.name = 'EnvNotReadyError'
    this.code = 'ENV_NOT_READY'
    this.probe = probe
  }
}

export class PythonRuntime {
  constructor({ dataDir, config, getSubprocess, logger }) {
    this.dataDir = dataDir
    this.config = config
    this.getSubprocess = getSubprocess
    this.logger = logger
    this.installTask = null
    this.installLog = ''
    this.installStartedAt = 0
    this.installError = ''
    this.cachedProbe = null
  }

  get venvDir() {
    return path.join(this.dataDir, 'venv')
  }

  get venvPython() {
    return process.platform === 'win32'
      ? path.join(this.venvDir, 'Scripts', 'python.exe')
      : path.join(this.venvDir, 'bin', 'python')
  }

  get installing() {
    return this.installTask !== null
  }

  /** Base interpreter used to create the venv and as a last-resort fallback. */
  async basePython() {
    if (this.config.python) return this.config.python
    const sub = this.getSubprocess()
    if (sub) {
      for (const candidate of ['python', 'python3']) {
        try {
          const resolved = await sub.resolveExecutable(candidate)
          if (resolved) return resolved
        } catch {
          /* try the next name */
        }
      }
    }
    return process.platform === 'win32' ? 'python' : 'python3'
  }

  async exists(target) {
    try {
      await stat(target)
      return true
    } catch {
      return false
    }
  }

  /** Read the state of the managed environment without installing anything. */
  async probe() {
    const base = await this.basePython()
    const venvExists = await this.exists(this.venvPython)
    const result = {
      python: base,
      venv: this.venvDir,
      venvExists,
      ready: false,
      version: '',
      modules: {},
      missing: [...REQUIRED_MODULES],
    }
    if (!venvExists) return result
    try {
      const run = await this.runInline(PROBE_CODE, [], { timeoutMs: 30_000 })
      if (run.code !== 0) {
        result.error = tail(run.stderr) || 'probe failed'
        return result
      }
      const parsed = JSON.parse(extractJson(run.stdout))
      result.version = String(parsed.python || '')
      result.modules = parsed.modules || {}
      result.missing = REQUIRED_MODULES.filter((name) => result.modules[name] !== true)
      result.ready = result.missing.length === 0
    } catch (error) {
      result.error = String(error?.message || error)
    }
    this.cachedProbe = result
    return result
  }

  async ensureReady() {
    const probe = await this.probe()
    if (!probe.ready) {
      throw new EnvNotReadyError(
        'Python 依赖未就绪，请先在设置里点「安装依赖」',
        probe,
      )
    }
    return probe
  }

  async status() {
    const probe = await this.probe()
    return {
      ...probe,
      installing: this.installing,
      installStartedAt: this.installStartedAt,
      installError: this.installError,
      installLog: tail(this.installLog, 6000),
    }
  }

  /** Create the venv and install the pinned helper dependencies. */
  async install(onLog) {
    if (this.installTask) return this.installTask
    this.installTask = (async () => {
      this.installLog = ''
      this.installError = ''
      this.installStartedAt = Date.now()
      const log = (text) => {
        if (!text) return
        this.installLog = (this.installLog + text).slice(-120_000)
        try {
          onLog?.(text)
        } catch {
          /* ignore */
        }
      }
      try {
        await mkdir(this.dataDir, { recursive: true })
        const base = await this.basePython()
        if (!(await this.exists(this.venvPython))) {
          log(`[venv] ${base} -m venv ${this.venvDir}\n`)
          const created = await this._spawn([base, '-m', 'venv', this.venvDir], {
            timeoutMs: 180_000,
            onChunk: log,
          })
          if (created.code !== 0) {
            throw new Error('创建虚拟环境失败：' + tail(created.stderr || created.stdout))
          }
        }
        const args = [
          this.venvPython,
          '-m',
          'pip',
          'install',
          '--disable-pip-version-check',
          '--no-input',
          ...(this.config.pipIndex ? ['-i', this.config.pipIndex] : []),
          ...INSTALL_SPECS,
        ]
        log(`[pip] ${args.slice(3).join(' ')}\n`)
        const installed = await this._spawn(args, {
          timeoutMs: 1_200_000,
          onChunk: log,
        })
        if (installed.code !== 0) {
          throw new Error('pip 安装失败（exit ' + installed.code + '）：' + tail(installed.stderr || installed.stdout))
        }
        const probe = await this.probe()
        if (!probe.ready) {
          throw new Error('安装完成但依赖仍缺失：' + probe.missing.join(', '))
        }
        log('[done] 依赖安装完成，Python ' + probe.version + '\n')
        this.cachedProbe = probe
        return probe
      } catch (error) {
        this.installError = String(error?.message || error)
        log('[error] ' + this.installError + '\n')
        throw error
      } finally {
        this.installTask = null
      }
    })()
    return this.installTask
  }

  /** Run one packaged helper script and return its collected output. */
  async run(script, args = [], options = {}) {
    const ready = await this.exists(this.venvPython)
    if (!ready) {
      const probe = await this.probe()
      throw new EnvNotReadyError('Python 依赖未就绪，请先在设置里点「安装依赖」', probe)
    }
    const result = await this._spawn([this.venvPython, path.join(SCRIPTS_DIR, script), ...args.map(String)], {
      ...options,
      cwd: this.dataDir,
    })
    if (result.code !== 0) {
      const detail = tail(result.stderr || result.stdout, 2000)
      throw new Error(script + ' 执行失败（exit ' + result.code + '）：' + detail)
    }
    return result
  }

  async runInline(code, args = [], options = {}) {
    const python = (await this.exists(this.venvPython)) ? this.venvPython : await this.basePython()
    return this._spawn([python, '-c', code, ...args], { ...options, cwd: this.dataDir })
  }

  async _spawn(argv, options = {}) {
    const env = childEnvironment(options.env)
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs ?? 600_000
    const signal = options.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)])
      : AbortSignal.timeout(timeoutMs)
    const sub = this.getSubprocess()
    if (sub) {
      const handle = sub.spawn({
        argv,
        cwd: options.cwd ?? this.dataDir,
        env,
        stdio: {
          stdin: options.stdin != null ? { data: String(options.stdin) } : 'ignore',
          stdout: { maxBytes: options.maxBytes ?? 32 * 1024 * 1024 },
          stderr: { maxBytes: 16 * 1024 * 1024 },
        },
        graceMs: 3000,
        signal,
      })
      let offset = 0
      let timer = null
      if (typeof options.onChunk === 'function') {
        timer = setInterval(() => {
          try {
            const chunk = handle.collected.stdout.readFrom(offset)
            if (chunk.text) {
              offset = chunk.nextOffset
              options.onChunk(chunk.text)
            }
          } catch {
            /* stream already drained */
          }
        }, 350)
      }
      try {
        const outcome = await handle.done
        return {
          code: outcome?.exitCode ?? null,
          stdout: readHandle(handle.collected.stdout),
          stderr: readHandle(handle.collected.stderr),
        }
      } finally {
        if (timer) clearInterval(timer)
      }
    }
    return this._spawnFallback(argv, { ...options, env, signal, timeoutMs })
  }

  _spawnFallback(argv, { cwd, stdin, timeoutMs, onChunk }) {
    return new Promise((resolve) => {
      let stdout = ''
      let stderr = ''
      const child = spawn(argv[0], argv.slice(1), { cwd, windowsHide: true, env: { ...process.env }, timeout: timeoutMs })
      child.stdout.on('data', (buffer) => {
        stdout += buffer.toString('utf8')
        onChunk?.(buffer.toString('utf8'))
      })
      child.stderr.on('data', (buffer) => {
        stderr += buffer.toString('utf8')
      })
      if (stdin != null) child.stdin.end(String(stdin))
      else child.stdin.end()
      child.on('close', (code) => resolve({ code, stdout, stderr }))
      child.on('error', (error) => resolve({ code: -1, stdout, stderr: stderr + String(error?.message || error) }))
    })
  }
}

const PROXY_KEYS = [
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'ALL_PROXY',
  'NO_PROXY',
  'http_proxy',
  'https_proxy',
  'all_proxy',
  'no_proxy',
]

/**
 * Build the child environment: UTF-8 Python, the caller's extra values, and
 * the Host proxy settings. `no_proxy` is normalized because httpx turns a
 * bracketed IPv6 entry such as `[::1]` into `all://*[::1]` and then refuses to
 * parse it, which aborts every BabelDOC run before it starts.
 */
function childEnvironment(extra = {}) {
  const env = {
    PYTHONUTF8: '1',
    PYTHONIOENCODING: 'utf-8',
    PYTHONUNBUFFERED: '1',
    ...(extra || {}),
  }
  for (const key of PROXY_KEYS) {
    const value = process.env[key]
    if (value && env[key] === undefined) env[key] = value
  }
  const noProxy = env.NO_PROXY || env.no_proxy || ''
  const cleaned = String(noProxy)
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !part.includes('[') && !part.includes(']'))
    .join(',')
  if (cleaned) {
    env.NO_PROXY = cleaned
    env.no_proxy = cleaned
  } else {
    delete env.NO_PROXY
    delete env.no_proxy
  }
  return env
}

function readHandle(stream) {  try {
    return stream ? stream.readFrom(0).text : ''
  } catch {
    return ''
  }
}

function extractJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  return start >= 0 && end > start ? text.slice(start, end + 1) : text
}

function tail(text, limit = 1200) {
  const value = String(text || '')
  return value.length > limit ? value.slice(-limit) : value
}
