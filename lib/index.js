import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { Remote } from "@deepseek-ai/dsh-typert-protocol";

/**
 * Manually apply the @Remote marker that the typert gateway reads via
 * remoteMethods(service). Node has no native decorators, so we drive the
 * decorator function with a synthetic context whose addInitializer runs
 * against a prototype-carrying this.
 */
export function markRemote(proto, method, exportName) {
  const deco = Remote(exportName || method);
  const context = {
    kind: "method",
    name: method,
    static: false,
    private: false,
    addInitializer(fn) {
      fn.call(Object.create(proto));
    },
  };
  deco(null, context);
}

/**
 * BabelDOC PDF bilingual reader — Host half.
 *
 * Exposes the RPC methods below under the "babeldoc" Typert namespace; the
 * browser half calls them through ctx.remote.babeldoc.<method>.
 */
class BabeldocService extends TypertRemoteService {
  static inject = ["fs", "subprocess", "llm", "timer"];

  constructor(ctx, config) {
    super(ctx, "babeldoc");
    // The handler closure below keeps every helper and service binding alive;
    // this is the original dynamic-plugin apply body, unchanged in spirit.
    const handlers = {};

    const fs = ctx.get('fs');
    const sub = ctx.get('subprocess');
    const llm = ctx.get('llm');
    const timer = ctx.get('timer');
    const sp = ctx.get('sandboxPolicy');

    const uploads = new Map();
    let seq = 0;
    let currentProgress = { status: 'idle', detail: '', updatedAt: 0 };
    let mergeLock = Promise.resolve();
    const tocCache = new Map();
    const activeHandles = new Set();

    const PY_RUN = [
      'import sys',
      'import os',
      'import httpx',
      'import sqlite3',
      'import time',
      '',
      'BROWSER_UA = (',
      '    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "',
      '    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"',
      ')',
      '',
      'DEBUG = os.environ.get("BABELDOC_DEBUG") == "1"',
      '',
      '',
      'def _warmup_cache_db():',
      '    try:',
      '        import pathlib',
      '        p = str(pathlib.Path.home() / ".cache" / "babeldoc" / "cache.v1.db")',
      '        for _ in range(12):',
      '            try:',
      '                c = sqlite3.connect(p, timeout=3)',
      '                c.execute("PRAGMA busy_timeout=3000")',
      '                c.execute("PRAGMA journal_mode=wal").fetchall()',
      '                c.execute("PRAGMA busy_timeout=60000")',
      '                c.close()',
      '                if DEBUG:',
      '                    print("BABELDOC-DEBUG cache warmup ok", file=sys.stderr)',
      '                return',
      '            except Exception:',
      '                try:',
      '                    c.close()',
      '                except Exception:',
      '                    pass',
      '                time.sleep(0.4)',
      '    except Exception:',
      '        pass',
      '    if DEBUG:',
      '        print("BABELDOC-DEBUG cache warmup failed", file=sys.stderr)',
      '',
      '',
      '_orig_client = httpx.Client.__init__',
      '',
      '',
      'def _patched_client(self, *args, **kwargs):',
      '    h = dict(kwargs.get("headers") or {})',
      '    h.setdefault("User-Agent", BROWSER_UA)',
      '    h.setdefault("Accept", "*/*")',
      '    kwargs["headers"] = h',
      '    if DEBUG:',
      '        print("BABELDOC-DEBUG patched httpx.Client init", file=sys.stderr)',
      '    _orig_client(self, *args, **kwargs)',
      '',
      '',
      'httpx.Client.__init__ = _patched_client',
      '',
      '_orig_async = httpx.AsyncClient.__init__',
      '',
      '',
      'def _patched_async(self, *args, **kwargs):',
      '    h = dict(kwargs.get("headers") or {})',
      '    h.setdefault("User-Agent", BROWSER_UA)',
      '    kwargs["headers"] = h',
      '    if DEBUG:',
      '        print("BABELDOC-DEBUG patched httpx.AsyncClient init", file=sys.stderr)',
      '    _orig_async(self, *args, **kwargs)',
      '',
      '',
      'httpx.AsyncClient.__init__ = _patched_async',
      '',
      'try:',
      '    from openai._base_client import BaseClient as _OAIBase',
      '',
      '    _orig_default_headers = _OAIBase.default_headers',
      '',
      '    def _patched_default_headers(self):',
      '        h = dict(_orig_default_headers.fget(self))',
      '        h["User-Agent"] = BROWSER_UA',
      '        return h',
      '',
      '    _OAIBase.default_headers = property(_patched_default_headers)',
      '',
      '    try:',
      '        from openai._base_client import AsyncBaseClient as _OAIAsync',
      '',
      '        _orig_async_dh = _OAIAsync.default_headers',
      '',
      '        def _patched_async_dh(self):',
      '            h = dict(_orig_async_dh.fget(self))',
      '            h["User-Agent"] = BROWSER_UA',
      '            return h',
      '',
      '        _OAIAsync.default_headers = property(_patched_async_dh)',
      '    except Exception:',
      '        pass',
      '',
      '    if DEBUG:',
      '        print("BABELDOC-DEBUG patched openai default_headers", file=sys.stderr)',
      'except Exception as e:',
      '    if DEBUG:',
      '        print("BABELDOC-DEBUG openai patch failed:", repr(e), file=sys.stderr)',
      '',
      'try:',
      '    import peewee',
      '',
      '    _orig_set_pragmas = peewee.SqliteDatabase._set_pragmas',
      '',
      '    def _patched_set_pragmas(self, conn):',
      '        try:',
      '            conn.execute("PRAGMA busy_timeout=60000")',
      '        except Exception:',
      '            pass',
      '        last_err = None',
      '        for _ in range(10):',
      '            try:',
      '                _orig_set_pragmas(self, conn)',
      '                last_err = None',
      '                break',
      '            except Exception as e:',
      '                last_err = e',
      '                time.sleep(0.3)',
      '        if last_err is not None:',
      '            raise last_err',
      '        try:',
      '            conn.execute("PRAGMA busy_timeout=60000")',
      '        except Exception:',
      '            pass',
      '        return None',
      '',
      '    peewee.SqliteDatabase._set_pragmas = _patched_set_pragmas',
      '    if DEBUG:',
      '        print("BABELDOC-DEBUG patched peewee busy_timeout+retry", file=sys.stderr)',
      'except Exception as e:',
      '    if DEBUG:',
      '        print("BABELDOC-DEBUG peewee patch failed:", repr(e), file=sys.stderr)',
      '',
      '_warmup_cache_db()',
      '',
      'from babeldoc.main import cli',
      '',
      'if __name__ == "__main__":',
      '    sys.exit(cli())',
    ].join('\n');

    const PY_PARSE = [
      'import pymupdf, sys, json, base64',
      '',
      '',
      'def main():',
      '    if len(sys.argv) > 1:',
      '        doc = pymupdf.open(sys.argv[1])',
      '    else:',
      '        raw_b64 = sys.stdin.buffer.read().strip()',
      '        try:',
      '            raw = base64.b64decode(raw_b64, validate=False)',
      '        except Exception as e:',
      '            sys.stderr.write("base64 decode failed: " + repr(e) + " len=" + str(len(raw_b64)))',
      '            sys.exit(3)',
      '        if not raw[:4] == b"%PDF":',
      '            sys.stderr.write("input is not a PDF stream head=" + repr(raw[:16]) + " len=" + str(len(raw)))',
      '            sys.exit(4)',
      '        try:',
      '            doc = pymupdf.open(stream=raw, filetype="pdf")',
      '        except Exception as e:',
      '            sys.stderr.write("pdf open failed: " + repr(e) + " len=" + str(len(raw)))',
      '            sys.exit(5)',
      '    pages = []',
      '    for pno in range(doc.page_count):',
      '        pg = doc[pno]',
      '        rect = pg.rect',
      '        paras = []',
      '        d = pg.get_text("dict")',
      '        for b in d["blocks"]:',
      '            for l in b.get("lines", []):',
      '                spans = l["spans"]',
      '                if not spans:',
      '                    continue',
      '                t = "".join(s["text"] for s in spans)',
      '                if not t.strip():',
      '                    continue',
      '                x0 = min(s["bbox"][0] for s in spans)',
      '                y0 = min(s["bbox"][1] for s in spans)',
      '                sz = max(s["size"] for s in spans)',
      '                paras.append({"text": t, "x": round(x0, 1), "y": round(y0, 1),',
      '                              "size": round(sz, 1), "heading": False})',
      '        pages.append({"width": round(rect.width, 1), "height": round(rect.height, 1),',
      '                      "paragraphs": paras})',
      '    doc.close()',
      '    print(json.dumps({"ok": True, "pages": pages, "warnings": []}, ensure_ascii=False))',
      '',
      '',
      'main()',
    ].join('\n');

    const PY_FIXTOC = [
      'import pymupdf, sys, re, json, os',
      '',
      'orig_path = sys.argv[1]',
      'trans_path = sys.argv[2]',
      'page_idx = int(sys.argv[3])',
      'out_path = sys.argv[4] if len(sys.argv) > 4 else trans_path',
      '',
      'NUM_RE = re.compile("^[.]?[0-9]{1,4}$")',
      'NUM_PREF_RE = re.compile("^[0-9]+([.][0-9]+)*[.][ \\t\\n\\r]*")',
      'ZW = "".join(chr(c) for c in (0x2060, 0x200b, 0x200d, 0xfeff, 0x2009))',
      'ZERO_W = re.compile("[" + ZW + "]")',
      '',
      'odoc = pymupdf.open(orig_path)',
      'op = odoc[page_idx]',
      '',
      'rows = []',
      'd = op.get_text("dict")',
      'for b in d["blocks"]:',
      '    for l in b.get("lines", []):',
      '        spans = l["spans"]',
      '        t = "".join(s["text"] for s in spans)',
      '        if not t.strip():',
      '            continue',
      '        y = (l["bbox"][1] + l["bbox"][3]) / 2',
      '        x_ref = max(s["bbox"][2] for s in spans)',
      '        clean = ZERO_W.sub("", t.strip())',
      '        if re.fullmatch("[0-9]{1,4}", clean):',
      '            continue',
      '        m = re.search("([0-9]{1,4})$", clean)',
      '        num = m.group(1) if m else None',
      '        pm = NUM_PREF_RE.match(clean)',
      '        pref = pm.group(0).strip().rstrip(".") if pm else None',
      '        rows.append({"y": y, "text": clean, "num": num, "x_ref": x_ref, "pref": pref,',
      '                     "size": max(s["size"] for s in spans),',
      '                     "x0": min(s["bbox"][0] for s in spans)})',
      '',
      'tdoc = pymupdf.open(trans_path)',
      'tp = tdoc[0]',
      'tspans = []',
      'dt = tp.get_text("dict")',
      'for b in dt["blocks"]:',
      '    for l in b.get("lines", []):',
      '        for s in l["spans"]:',
      '            txt = s["text"]',
      '            if not txt.strip():',
      '                continue',
      '            x0, y0, x1, y1 = s["bbox"]',
      '            tspans.append({"bbox": s["bbox"], "text": txt, "yc": (y0 + y1) / 2, "x1": x1,',
      '                           "size": s["size"], "font": s["font"]})',
      '',
      'tspans.sort(key=lambda s: (s["yc"], s["x1"]))',
      'tlines = []',
      'for s in tspans:',
      '    if tlines and abs(s["yc"] - tlines[-1]["yc"]) < 8:',
      '        tlines[-1]["spans"].append(s)',
      '        tlines[-1]["yc"] = (tlines[-1]["yc"] + s["yc"]) / 2',
      '    else:',
      '        tlines.append({"yc": s["yc"], "spans": [s]})',
      'for tl in tlines:',
      '    tl["spans"].sort(key=lambda s: s["x1"])',
      '    tl["text"] = "".join(s["text"] for s in tl["spans"])',
      '',
      '',
      'def tpref(txt):',
      '    pm = NUM_PREF_RE.match(txt)',
      '    return pm.group(0).strip().rstrip(".") if pm else None',
      '',
      '',
      'used_t = set()',
      'paired_rows = set()',
      'pairs = []',
      'for r in rows:',
      '    if r["num"] is None:',
      '        continue',
      '    if r["pref"]:',
      '        best = None',
      '        for i, tl in enumerate(tlines):',
      '            if i in used_t:',
      '                continue',
      '            if tpref(tl["text"]) == r["pref"]:',
      '                best = i',
      '                break',
      '        if best is not None:',
      '            used_t.add(best)',
      '            pairs.append((r, tlines[best]))',
      '            continue',
      '    best = None',
      '    best_d = 1e9',
      '    for i, tl in enumerate(tlines):',
      '        if i in used_t:',
      '            continue',
      '        dd = abs(tl["yc"] - r["y"])',
      '        if dd < best_d:',
      '            best_d = dd',
      '            best = i',
      '    if best is not None and best_d < 30:',
      '        used_t.add(best)',
      '        pairs.append((r, tlines[best]))',
      '    paired_rows.add(id(r))',
      '',
      'remaining_rows = [r for r in rows if r["num"] is not None and id(r) not in paired_rows]',
      'remaining_tl = [(i, tl) for i, tl in enumerate(tlines) if i not in used_t]',
      'remaining_rows.sort(key=lambda r: r["y"])',
      'remaining_tl.sort(key=lambda item: item[1]["yc"])',
      'for r, (i, tl) in zip(remaining_rows, remaining_tl):',
      '    if abs(tl["yc"] - r["y"]) < 40:',
      '        used_t.add(i)',
      '        pairs.append((r, tl))',
      '',
      '',
      'def is_numfrag(s):',
      '    t = s["text"].strip()',
      '    return bool(NUM_RE.match(t)) or t == "."',
      '',
      '',
      'def is_numpref(s):',
      '    return bool(re.match("^[0-9]+([.][0-9]+)*[.][ \\t\\n\\r]*$", s["text"]))',
      '',
      '',
      'def num_tail_cover(s):',
      '    m = re.search("([.]?[0-9]{1,4})$", s["text"].strip())',
      '    if not m:',
      '        return None',
      '    tail = m.group(1)',
      '    w = len(tail) * s["size"] * 0.55',
      '    x0, y0, x1, y1 = s["bbox"]',
      '    return ((x1 - w, y0, x1, y1), w)',
      '',
      '',
      'fixed = 0',
      'for r, tl in pairs:',
      '    yc = tl["yc"]',
      '    frags = list(tl["spans"])',
      '    tl_idx = tlines.index(tl)',
      '    i = tl_idx - 1',
      '    while i >= 0 and tl["yc"] - tlines[i]["yc"] < 24:',
      '        if tpref(tlines[i]["text"]) is not None:',
      '            break',
      '        for s in tlines[i]["spans"]:',
      '            frags.append(s)',
      '        i -= 1',
      '    i = tl_idx + 1',
      '    while i < len(tlines) and tlines[i]["yc"] - tl["yc"] < 24:',
      '        if tpref(tlines[i]["text"]) is not None:',
      '            break',
      '        for s in tlines[i]["spans"]:',
      '            frags.append(s)',
      '        i += 1',
      '',
      '    best_by_text = {}',
      '    for s in frags:',
      '        key = s["text"].strip()',
      '        if key and (key not in best_by_text or s["size"] > best_by_text[key]["size"]):',
      '            best_by_text[key] = s',
      '    covers = []',
      '    for s in frags:',
      '        key = s["text"].strip()',
      '        if key and best_by_text.get(key) is not s:',
      '            covers.append(s["bbox"])',
      '',
      '    nonnum = []',
      '    tailfrags = []',
      '    pref_tex = None',
      '    for s in frags:',
      '        key = s["text"].strip()',
      '        if key and best_by_text.get(key) is not s:',
      '            continue',
      '        if is_numfrag(s):',
      '            covers.append(s["bbox"])',
      '            continue',
      '        res = num_tail_cover(s)',
      '        if res is not None:',
      '            rect, w = res',
      '            covers.append(rect)',
      '            tailfrags.append((s, w))',
      '            continue',
      '        if is_numpref(s):',
      '            if "TeXGyrePagella" in s["font"]:',
      '                pref_tex = s',
      '                covers.append(s["bbox"])',
      '            else:',
      '                nonnum.append(s)',
      '            continue',
      '        if "TeXGyrePagella" in s["font"] and re.match("^[A-Za-z]{1,3}$", key):',
      '            covers.append(s["bbox"])',
      '            continue',
      '        nonnum.append(s)',
      '    for bbox in covers:',
      '        tp.draw_rect(bbox, color=(1, 1, 1), fill=(1, 1, 1))',
      '    size = r["size"] or 9',
      '    width = size * 0.55 * len(r["num"])',
      '    x_num = r["x_ref"] - width - 2',
      '    tp.insert_text((x_num, yc + size * 0.35), r["num"], fontsize=size, fontname="helv",',
      '                   color=(0, 0, 0))',
      '    if pref_tex is not None:',
      '        body_kept = [s for s in nonnum if not is_numpref(s)]',
      '        main_y0 = min(s["bbox"][1] for s in body_kept) if body_kept else (tl["yc"] - 5.5)',
      '        px = r.get("x0", pref_tex["bbox"][0])',
      '        tp.insert_text((px, main_y0 + pref_tex["size"] * 0.85), pref_tex["text"],',
      '                       fontsize=pref_tex["size"], fontname="helv", color=(0, 0, 0))',
      '    if nonnum or tailfrags:',
      '        x_start = max(s["x1"] for s in nonnum) + 6 if nonnum else 0',
      '        for s, w in tailfrags:',
      '            x_start = max(x_start, s["x1"] - w + 6)',
      '        if pref_tex is not None:',
      '            x_start = max(x_start, pref_tex["bbox"][0] + pref_tex["size"] * 0.55 * len(pref_tex["text"]) + 6)',
      '        x_end = x_num - 6',
      '        if x_end > x_start:',
      '            x = x_start',
      '            while x < x_end:',
      '                tp.draw_circle((x, yc), 0.7, color=(0.2, 0.2, 0.2), fill=(0.2, 0.2, 0.2))',
      '                x += 9',
      '    fixed += 1',
      '',
      'if out_path == trans_path:',
      '    tmp = trans_path + ".fixtmp.pdf"',
      '    tdoc.save(tmp, garbage=3, deflate=True)',
      '    tdoc.close()',
      '    odoc.close()',
      '    os.replace(tmp, trans_path)',
      'else:',
      '    tdoc.save(out_path, garbage=3, deflate=True)',
      '    tdoc.close()',
      '    odoc.close()',
      '',
      'print(json.dumps({"fixed": fixed, "orig_rows": len(rows), "pairs": len(pairs)}))',
    ].join('\n');

    const SCRIPTS = { 'babeldoc_run.py': PY_RUN, 'parse_pdf.py': PY_PARSE, 'fix_toc.py': PY_FIXTOC };

    function killActiveHandles() {
      for (const h of activeHandles) {
        try { h.terminate(); } catch (e) { /* ignore */ }
      }
    }

    ctx.effect(() => {
      return () => {
        killActiveHandles();
        activeHandles.clear();
      };
    });

    function withMergeLock(fn) {
      const p = mergeLock.then(fn);
      mergeLock = p.then(() => {}, () => {});
      return p;
    }

    function rootDir() {
      const r = sp && sp.workspaceRoot;
      if (!r) throw new Error('sandboxPolicy.workspaceRoot 未配置');
      return String(r).replace(/[\\/]+$/, '');
    }
    function helperDir() {
      return rootDir() + '/.dsh-babeldoc';
    }

    let scriptsReady = null;
    function readyScripts() {
      if (!scriptsReady) {
        scriptsReady = (async () => {
          await ensureDir(helperDir());
          for (const name of Object.keys(SCRIPTS)) {
            const t = await fs.resolve(helperDir() + '/' + name);
            let exists = false;
            try { const st = await fs.stat(t); exists = !!st; } catch (e) { exists = false; }
            if (!exists) await fs.writeText(t, SCRIPTS[name]);
          }
        })().catch((e) => { scriptsReady = null; throw e; });
      }
      return scriptsReady;
    }

    function stripAnsi(s) {
      return String(s).replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\x1b\][^\x07]*\x07/g, '');
    }

    function summarizeProgress(raw) {
      const clean = stripAnsi(raw).replace(/\r/g, '\n');
      const lines = clean.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
      const dedup = [];
      for (const l of lines) {
        if (dedup[dedup.length - 1] !== l) dedup.push(l);
      }
      return dedup.slice(-25).join(' · ');
    }

    async function appendLog(line) {
      try {
        const code = 'import sys\nopen(sys.argv[1],"a",encoding="utf-8").write(sys.argv[2] + "\n")';
        await runPython(code, [helperDir() + '/logs/activity.log', line]);
      } catch (e) { /* ignore */ }
    }

    async function runPython(code, args, stdinText) {
      const py = await sub.resolveExecutable('python');
      const handle = sub.spawn({
        argv: [py, '-c', code].concat(args || []),
        cwd: '.',
        env: { PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
        stdio: {
          stdin: stdinText != null ? { data: stdinText } : 'ignore',
          stdout: { maxBytes: 8 * 1024 * 1024, spill: { maxBytes: 16 * 1024 * 1024 } },
          stderr: { maxBytes: 2 * 1024 * 1024 },
        },
        graceMs: 3000,
      });
      const outcome = await handle.done;
      if (!outcome || outcome.exitCode !== 0) {
        const err = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '';
        throw new Error('python helper failed: ' + String(err).slice(0, 500));
      }
      return handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '';
    }

    async function runPyScript(scriptName, args, stdinText) {
      await readyScripts();
      const py = await sub.resolveExecutable('python');
      const script = helperDir() + '/' + scriptName;
      const handle = sub.spawn({
        argv: [py, script].concat(args || []),
        cwd: '.',
        env: { PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
        stdio: {
          stdin: stdinText != null ? { data: stdinText } : 'ignore',
          stdout: { maxBytes: 64 * 1024 * 1024, spill: { maxBytes: 96 * 1024 * 1024 } },
          stderr: { maxBytes: 2 * 1024 * 1024 },
        },
        graceMs: 3000,
      });
      const outcome = await handle.done;
      if (!outcome || outcome.exitCode !== 0) {
        const err = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '';
        throw new Error(scriptName + ' failed: ' + String(err).slice(0, 500));
      }
      return handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '';
    }

    async function parsePdf(path, b64) {
      let raw;
      if (path) {
        raw = await runPyScript('parse_pdf.py', [path]);
      } else {
        raw = await runPyScript('parse_pdf.py', [], String(b64));
      }
      return JSON.parse(raw);
    }

    async function detectTocPages(inputPath) {
      if (tocCache.has(inputPath)) return tocCache.get(inputPath);
      const code = [
        'import pymupdf, sys',
        'doc = pymupdf.open(sys.argv[1])',
        'out = []',
        'for i in range(doc.page_count):',
        '    d = doc[i].get_text("dict")',
        '    score = 0',
        '    num_lines = 0',
        '    pw = doc[i].rect.width',
        '    for b in d["blocks"]:',
        '        for l in b.get("lines", []):',
        '            num_lines += 1',
        '            spans = l["spans"]',
        '            t = "".join(s["text"] for s in spans)',
        '            if t.count(".") >= 8:',
        '                score += 1',
        '                continue',
        '            if spans:',
        '                last = spans[-1]',
        '                lt = last["text"].strip()',
        '                if lt.isdigit() and len(lt) <= 4 and last["bbox"][2] > pw - 60:',
        '                    head = t[:24]',
        '                    if head[0].isdigit() or head.startswith("Chapter ") or head.startswith("Appendix "):',
        '                        score += 1',
        '    if num_lines >= 5 and score >= 3:',
        '        out.append(i + 1)',
        'print(",".join(str(x) for x in out))',
      ].join('\n');
      const out = await runPython(code, [inputPath]);
      const pages = String(out || '').split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n) && n > 0);
      const set = new Set(pages);
      tocCache.set(inputPath, set);
      return set;
    }

    async function fixTocPage(origPath, transPath, pageIdx0) {
      try {
        await runPyScript('fix_toc.py', [origPath, transPath, String(pageIdx0)]);
        await appendLog('[' + new Date().toISOString() + '] fixTocPage ok page=' + (pageIdx0 + 1) + ' trans=' + transPath);
      } catch (e) {
        await appendLog('[' + new Date().toISOString() + '] fixTocPage FAIL page=' + (pageIdx0 + 1) + ' ' + String((e && e.message) || e).slice(0, 300));
      }
    }

    async function cleanCacheDb() {
      const code = [
        'import sqlite3, os, sys',
        'p = os.path.expanduser("~/.cache/babeldoc/cache.v1.db")',
        'if not os.path.exists(p): sys.exit(0)',
        'c = sqlite3.connect(p, timeout=10)',
        'n = c.execute("delete from _translationcache where translation is null or length(trim(translation))=0").rowcount',
        'c.commit()',
        'c.close()',
        'if n: print("cleaned", n)',
      ].join('\n');
      try {
        await runPython(code, []);
      } catch (e) { /* ignore */ }
    }

    async function pdfPageCount(pdfPath) {
      try {
        const code = 'import pymupdf,sys\nprint(pymupdf.open(sys.argv[1]).page_count)';
        const out = await runPython(code, [pdfPath]);
        const m = String(out).match(/\d+/);
        const n = m ? parseInt(m[0], 10) : 0;
        return Number.isFinite(n) && n > 0 ? n : 0;
      } catch (e) { return 0; }
    }

    async function writeB64File(b64, filePath) {
      const code = 'import base64,sys\nopen(sys.argv[1],"wb").write(base64.b64decode(sys.stdin.read()))';
      await runPython(code, [filePath], String(b64));
    }

    async function ensureDir(dirPath) {
      const code = 'import os,sys\nos.makedirs(sys.argv[1],exist_ok=True)';
      await runPython(code, [dirPath]);
    }

    async function copyFile(srcPath, dstPath) {
      const code = 'import shutil,sys\nshutil.copy(sys.argv[1], sys.argv[2])';
      await runPython(code, [srcPath, dstPath]);
    }

    async function atomicCopyFile(srcPath, dstPath) {
      const code = [
        'import shutil, sys, os, tempfile',
        'd = os.path.dirname(os.path.abspath(sys.argv[2]))',
        'fd, tmp = tempfile.mkstemp(suffix=".mtmp", dir=d)',
        'os.close(fd)',
        'shutil.copy(sys.argv[1], tmp)',
        'try:',
        '    os.replace(tmp, sys.argv[2])',
        'except Exception:',
        '    try: os.remove(tmp)',
        '    except Exception: pass',
        '    raise',
      ].join('\n');
      await runPython(code, [srcPath, dstPath]);
    }

    async function removeFile(filePath) {
      const code = 'import os,sys\ntry:\n    os.remove(sys.argv[1])\nexcept Exception:\n    pass';
      await runPython(code, [filePath]);
    }

    async function bytesToB64(bytes) {
      let bin = '';
      const CH = 0x8000;
      for (let i = 0; i < bytes.length; i += CH) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(bytes.length, i + CH)));
      }
      return btoa(bin);
    }

    async function downloadUrlB64(url) {
      if (!sub) throw new Error('subprocess service unavailable');
      let pw = null;
      for (const cand of ['pwsh', 'pwsh.exe', 'powershell', 'powershell.exe']) {
        try { pw = await sub.resolveExecutable(cand); break; } catch (e) { /* try next */ }
      }
      if (!pw) throw new Error('PowerShell not found; cannot download URL PDF');
      const safeUrl = String(url).replace(/'/g, "''");
      const script = "$p='" + safeUrl + "';$ProgressPreference='SilentlyContinue';try{$r=Invoke-WebRequest -Uri $p -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0'};[Convert]::ToBase64String($r.Content)}catch{Write-Error $_.Exception.Message;exit 1}";
      const handle = sub.spawn({
        argv: [pw, '-NoProfile', '-NonInteractive', '-Command', script],
        cwd: '.',
        stdio: { stdin: 'ignore', stdout: { maxBytes: 256 * 1024 * 1024, spill: { maxBytes: 256 * 1024 * 1024 } }, stderr: { maxBytes: 2 * 1024 * 1024 } },
        graceMs: 3000,
      });
      const outcome = await handle.done;
      const out = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text.trim() : '';
      if (!outcome || outcome.exitCode !== 0 || !out) {
        const err = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '';
        throw new Error('URL download failed: ' + String(err).slice(0, 800));
      }
      return out;
    }

    async function resolveModel(args) {
      const llmSvc = llm;
      if (!llmSvc) throw new Error('llm service unavailable');
      let provider = String(args.provider || '');
      let model = String(args.model || '');
      if (!provider || !model) {
        const adm = ctx.get('agentDefaultModel');
        if (adm) {
          try {
            const sel = adm.currentSelection();
            if (sel && sel.provider && sel.model) { if (!provider) provider = sel.provider; if (!model) model = sel.model; }
          } catch (e) { /* fall through */ }
        }
      }
      if (!provider || !model) {
        const providers = llmSvc.listProviders();
        if (!providers.length) throw new Error('No LLM provider configured');
        provider = providers[0].id || providers[0].name || String(providers[0]);
        try { const models = await llmSvc.listModels(provider); if (models.length) model = models[0].id; } catch (e) { /* ignore */ }
      }
      if (!model) throw new Error('No model available for provider ' + provider);
      return { llmSvc, provider, model };
    }

    function projectDirFor(stem) {
      const safe = String(stem).replace(/[^A-Za-z0-9._-]/g, '_');
      return helperDir() + '/projects/' + safe;
    }
    function pagesDirFor(stem) {
      return projectDirFor(stem) + '/pages';
    }
    function mergedPathFor(stem, langOut) {
      return projectDirFor(stem) + '/translated.' + langOut + '.pdf';
    }
    function markerPathFor(stem, langOut) {
      return projectDirFor(stem) + '/full.' + langOut + '.marker';
    }

    handlers.diag = async (args) => {
      const msg = String((args && args.msg) || '');
      if (msg) await appendLog('[' + new Date().toISOString() + '] CLIENT ' + msg.slice(0, 400));
      return { ok: true };
    };

    handlers.envCheck = async () => {
      const lines = [];
      const add = (k, ok, msg) => lines.push((ok ? '[OK]   ' : '[FAIL] ') + k + '  ' + String(msg || ''));
      try {
        const py = await sub.resolveExecutable('python');
        const v = await runPython('import sys\nprint(sys.version.split()[0])', []);
        add('python', true, py + '  (v' + String(v).trim() + ')');
      } catch (e) { add('python', false, String((e && e.message) || e).slice(0, 150)); }
      const modOk = async (m) => {
        try { await runPython('import ' + m, []); return true; } catch (e) { return false; }
      };
      add('babeldoc', await modOk('babeldoc'), 'pip install babeldoc');
      add('pymupdf', await modOk('pymupdf'), 'pip install pymupdf');
      add('openai', await modOk('openai'), 'pip install openai');
      add('httpx', await modOk('httpx'), 'pip install httpx');
      add('peewee', await modOk('peewee'), 'pip install peewee');
      try {
        await readyScripts();
        add('scripts', true, helperDir() + ' (babeldoc_run.py, parse_pdf.py, fix_toc.py)');
      } catch (e) {
        add('scripts', false, String((e && e.message) || e).slice(0, 150));
      }
      return { lines };
    };

    handlers.exportPdf = async (args) => {
      const path = String(args.path || '');
      const name = String(args.name || 'translated.pdf');
      if (!path || !fs) throw new Error('missing path');
      const target = await fs.resolve(path);
      const bytes = await fs.readBytes(target, undefined, 256 * 1024 * 1024);
      const base64 = await bytesToB64(bytes);
      await appendLog('[' + new Date().toISOString() + '] exportPdf name=' + name + ' bytes=' + bytes.length);
      return { base64, name };
    };

    handlers.cancelTranslate = async () => {
      const n = activeHandles.size;
      killActiveHandles();
      await appendLog('[' + new Date().toISOString() + '] cancelTranslate terminated ' + n + ' process(es)');
      return { ok: true, terminated: n };
    };

    handlers.tocPages = async (args) => {
      let inputPath;
      if (args.path) {
        inputPath = fs.processPath(await fs.resolve(String(args.path)));
      } else if (args.pdfBase64) {
        const tmpName = 'babeldoc_in_' + Date.now().toString(36) + '_toc.pdf';
        inputPath = helperDir() + '/' + tmpName;
        await writeB64File(String(args.pdfBase64), inputPath);
      } else {
        return { pages: [] };
      }
      const toc = await detectTocPages(inputPath);
      const list = Array.from(toc).sort((a, b) => a - b);
      await appendLog('[' + new Date().toISOString() + '] tocPages found=' + list.join(','));
      return { pages: list };
    };

    handlers.clearTranslationCache = async () => {
      const projectsDir = helperDir() + '/projects';
      const code = [
        'import os, sys, glob',
        'projects = sys.argv[1]',
        'for pdir in glob.glob(os.path.join(projects, "*")):',
        '    if not os.path.isdir(pdir): continue',
        '    for pat in ("pages/*", "translated.*.pdf", "*.marker"):',
        '        for f in glob.glob(os.path.join(pdir, pat)):',
        '            try: os.remove(f)',
        '            except Exception: pass',
        'db = os.path.expanduser("~/.cache/babeldoc/cache.v1.db")',
        'for f in glob.glob(db + "*"):',
        '    try: os.remove(f)',
        '    except Exception: pass',
      ].join('\n');
      await runPython(code, [projectsDir]);
      await appendLog('[' + new Date().toISOString() + '] clearTranslationCache done');
      return { ok: true };
    };

    handlers.uploadChunk = (args) => {
      const uploadId = String(args.uploadId || '');
      if (!uploadId) throw new Error('missing uploadId');
      let up = uploads.get(uploadId);
      if (!up) { up = { name: String(args.name || 'upload.pdf'), parts: [], total: Number(args.total) || 0 }; uploads.set(uploadId, up); }
      up.parts[Number(args.index)] = String(args.chunk || '');
      return { received: up.parts.length, total: up.total };
    };

    handlers.listModels = async () => {
      const llmSvc = llm;
      if (!llmSvc) return { providers: [] };
      const providers = [];
      try {
        const list = llmSvc.listProviders();
        for (const p of list) {
          const pid = (p && (p.id || p.name)) ? (p.id || p.name) : String(p);
          try {
            const models = await llmSvc.listModels(pid);
            providers.push({ provider: pid, models: models.map((m) => ({ id: (m && m.id) || String(m), label: (m && (m.label || m.displayName || m.name)) || (m && m.id) || String(m) })) });
          } catch (e) { /* skip provider */ }
        }
      } catch (e) { /* ignore */ }
      return { providers };
    };

    handlers.openPdf = async (args) => {
      const kind = String(args.kind || '');
      let result;
      let pdfB64 = '';
      let persistPath = '';
      let realName = String(args.name || '');
      if (kind === 'upload') {
        const up = uploads.get(String(args.uploadId || ''));
        if (!up) throw new Error('upload not found, please re-upload');
        pdfB64 = up.parts.join('');
        result = await parsePdf(null, pdfB64);
        uploads.delete(String(args.uploadId));
        if (!realName) realName = String(args.name || 'document.pdf');
        try {
          const safeName = realName.replace(/[^A-Za-z0-9._-]/g, '_');
          const dir = helperDir() + '/uploads';
          await ensureDir(dir);
          persistPath = dir + '/' + safeName;
          await writeB64File(pdfB64, persistPath);
        } catch (e) { persistPath = ''; }
      } else if (kind === 'path') {
        if (!fs) throw new Error('fs service unavailable');
        const target = await fs.resolve(String(args.path));
        const p = fs.processPath(target);
        result = await parsePdf(p, null);
        if (!realName) realName = String(args.path).split(/[\\/]/).pop() || 'document.pdf';
        try { const bytes = await fs.readBytes(target, undefined, 128 * 1024 * 1024); pdfB64 = await bytesToB64(bytes); } catch (e) { pdfB64 = ''; }
      } else if (kind === 'url') {
        pdfB64 = await downloadUrlB64(String(args.url));
        result = await parsePdf(null, pdfB64);
        if (!realName) realName = 'document.pdf';
      } else {
        throw new Error('unknown source kind: ' + kind);
      }
      if (!result || result.ok !== true || !Array.isArray(result.pages)) {
        throw new Error('PDF parse failed: ' + JSON.stringify(result).slice(0, 300));
      }
      const pages = result.pages.map((pg) => ({
        width: Number(pg.width) || 0,
        height: Number(pg.height) || 0,
        paragraphs: Array.isArray(pg.paragraphs) ? pg.paragraphs.map((pp) => ({ text: String(pp.text || ''), x: Number(pp.x) || 0, y: Number(pp.y) || 0, size: Number(pp.size) || 0, heading: !!pp.heading })) : [],
      }));
      await appendLog('[' + new Date().toISOString() + '] openPdf kind=' + kind + ' name=' + realName + ' pages=' + pages.length + ' persist=' + (persistPath ? 'yes' : 'no'));
      return { name: realName, pages, warnings: result.warnings || [], pdfBase64: pdfB64, persistPath: persistPath };
    };

    handlers.listTranslatedPages = async (args) => {
      const name = String(args.name || '');
      const langOut = String(args.langOut || 'zh');
      if (!name) return { pages: [] };
      const stem = name.replace(/\.pdf$/i, '');
      const pageDir = pagesDirFor(stem);
      try {
        const target = await fs.resolve(pageDir);
        const entries = await fs.listDir(target);
        const pages = [];
        const re = new RegExp('^p(\\d+)\\.' + langOut + '\\.mono\\.pdf$', 'i');
        for (const e of entries) {
          const n = String(e.name || '');
          const m = n.match(re);
          if (m) pages.push(parseInt(m[1], 10));
        }
        pages.sort((a, b) => a - b);
        await appendLog('[' + new Date().toISOString() + '] listTranslatedPages name=' + name + ' lang=' + langOut + ' found=' + pages.length);
        return { pages };
      } catch (e) {
        await appendLog('[' + new Date().toISOString() + '] listTranslatedPages name=' + name + ' ERROR ' + String(e).slice(0, 200));
        return { pages: [] };
      }
    };

    handlers.markFullTranslation = async (args) => {
      const name = String(args.name || '');
      const langOut = String(args.langOut || 'zh');
      const pages = Math.max(0, Number(args.pages) || 0);
      if (!name || !fs) return { ok: false };
      const stem = name.replace(/\.pdf$/i, '');
      try {
        const markerPath = markerPathFor(stem, langOut);
        const t = await fs.resolve(markerPath);
        await fs.writeText(t, String(pages));
        await appendLog('[' + new Date().toISOString() + '] markFullTranslation name=' + name + ' pages=' + pages);
        return { ok: true };
      } catch (e) {
        return { ok: false };
      }
    };

    handlers.loadCachedTranslation = async (args) => {
      const name = String(args.name || '');
      const langOut = String(args.langOut || 'zh');
      if (!name) return { found: false };
      const stem = name.replace(/\.pdf$/i, '');
      const monoPath = mergedPathFor(stem, langOut);
      try {
        const target = await fs.resolve(monoPath);
        const info = await fs.stat(target);
        if (!info) {
          await appendLog('[' + new Date().toISOString() + '] loadCachedTranslation name=' + name + ' notfound(no file)');
          return { found: false };
        }
        let hasFull = false;
        let markerNum = 0;
        try {
          const mt = await fs.resolve(markerPathFor(stem, langOut));
          const mi = await fs.stat(mt);
          if (mi) {
            const txt = String(await fs.readText(mt) || '').trim();
            markerNum = parseInt(txt, 10);
            if (!Number.isFinite(markerNum)) markerNum = 0;
          }
        } catch (e) { markerNum = 0; }
        const p = fs.processPath(target);
        const pages = await pdfPageCount(p);
        hasFull = markerNum > 0 && markerNum === pages;
        let translatedCount = 0;
        try {
          const entries = await fs.listDir(await fs.resolve(pagesDirFor(stem)));
          const re = new RegExp('^p(\\d+)\\.' + langOut + '\\.mono\\.pdf$', 'i');
          for (const e of entries) {
            if (String(e.name || '').match(re)) translatedCount++;
          }
        } catch (e) { translatedCount = 0; }
        await appendLog('[' + new Date().toISOString() + '] loadCachedTranslation name=' + name + ' found=1 pages=' + pages + ' hasFull=' + (hasFull ? 1 : 0) + ' translated=' + translatedCount + ' marker=' + markerNum);
        return { found: true, monoPath: p, pages, hasFull, translatedCount };
      } catch (e) {
        await appendLog('[' + new Date().toISOString() + '] loadCachedTranslation name=' + name + ' notfound');
        return { found: false };
      }
    };

    handlers.pdfInfo = async (args) => {
      const path = String(args.path || '');
      if (!path || !fs) throw new Error('missing path');
      const target = await fs.resolve(path);
      const p = fs.processPath(target);
      return { pages: await pdfPageCount(p) };
    };

    handlers.translateProgress = () => {
      return currentProgress;
    };

    handlers.renderPage = async (args) => {
      const path = String(args.path || '');
      const page = Math.max(0, Number(args.page) || 0);
      const scale = Math.min(3, Math.max(0.5, Number(args.scale) || 2));
      const logLine = '[' + new Date().toISOString() + '] renderPage path=' + path + ' page=' + page + ' scale=' + scale;
      try {
        if (!path || !fs || !sub) throw new Error('missing path');
        const target = await fs.resolve(path);
        const p = fs.processPath(target);
        const code = [
          'import pymupdf,sys,base64,json',
          'doc = pymupdf.open(sys.argv[1])',
          'page = min(int(sys.argv[2]), doc.page_count - 1)',
          'pix = doc[page].get_pixmap(matrix=pymupdf.Matrix(float(sys.argv[3]), float(sys.argv[3])), alpha=False)',
          'sys.stdout.write(json.dumps({"b64": base64.b64encode(pix.tobytes("png")).decode(), "pages": doc.page_count, "page": page}))',
        ].join('\n');
        const py = await sub.resolveExecutable('python');
        const handle = sub.spawn({
          argv: [py, '-c', code, p, String(page), String(scale)],
          cwd: '.',
          env: { PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
          stdio: { stdin: 'ignore', stdout: { maxBytes: 16 * 1024 * 1024 }, stderr: { maxBytes: 1024 * 1024 } },
          graceMs: 3000,
        });
        const outcome = await handle.done;
        if (!outcome || outcome.exitCode !== 0) {
          const err = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '';
          throw new Error('renderPage failed: ' + String(err).slice(0, 400));
        }
        const outRaw = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text.trim() : '';
        const s = outRaw.indexOf('{');
        const e = outRaw.lastIndexOf('}');
        const out = (s >= 0 && e > s) ? outRaw.slice(s, e + 1) : outRaw;
        if (!out) throw new Error('renderPage empty output');
        const obj = JSON.parse(out);
        if (!obj || !obj.b64) throw new Error('bad payload');
        await appendLog(logLine + ' OK b64len=' + obj.b64.length + ' totalpages=' + obj.pages + ' rendered=' + obj.page);
        return { pngBase64: obj.b64, pages: obj.pages, page: obj.page };
      } catch (err) {
        await appendLog(logLine + ' FAIL ' + String((err && err.message) || err).slice(0, 300));
        throw err;
      }
    };

    handlers.translate = async (args) => {
      const baseUrl = String(args.baseUrl || '').trim();
      const apiKey = String(args.apiKey || '').trim();
      const model = String(args.model || '').trim();
      const langOut = String(args.langOut || 'zh');
      const langIn = String(args.langIn || 'en');
      const pages = String(args.pages || '').trim();
      const customPrompt = String(args.customPrompt || '').trim();
      if (!baseUrl || !apiKey || !model) throw new Error('请先填写翻译服务配置（Base URL / API Key / 模型）');
      if (!fs || !sub) throw new Error('fs/subprocess service unavailable');

      await cleanCacheDb();

      let inputPath;
      if (args.path) {
        inputPath = fs.processPath(await fs.resolve(String(args.path)));
      } else if (args.pdfBase64) {
        const tmpName = 'babeldoc_in_' + Date.now().toString(36) + '.pdf';
        inputPath = helperDir() + '/' + tmpName;
        await writeB64File(String(args.pdfBase64), inputPath);
      } else {
        throw new Error('缺少 PDF 源');
      }

      const stem = inputPath.replace(/\\/g, '/').split('/').pop().replace(/\.pdf$/i, '');
      const projDir = projectDirFor(stem);
      const pageDir = pagesDirFor(stem);
      await ensureDir(projDir);
      await ensureDir(pageDir);
      try {
        await copyFile(inputPath, projDir + '/original.pdf');
      } catch (e) { /* ignore */ }
      const outDir = pages
        ? pageDir + '/tmp' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36)
        : projDir;
      await ensureDir(outDir);

      const pageNums = [];
      if (pages) {
        for (const seg of pages.split(',')) {
          const n = parseInt(seg.trim(), 10);
          if (Number.isFinite(n) && n > 0) pageNums.push(n);
        }
      }

      const babelArgs = [
        '--files', inputPath,
        '--output', outDir,
        '--openai',
        '--openai-model', model,
        '--openai-base-url', baseUrl,
        '--openai-api-key', apiKey,
        '--lang-in', langIn,
        '--lang-out', langOut,
        '--skip-scanned-detection',
        '--no-auto-extract-glossary',
        '--watermark-output-mode', 'no_watermark',
        '--no-dual',
        '--qps', '8',
        '--openai-thinking', 'disabled',
        '--split-short-lines',
      ];
      if (pages) {
        babelArgs.push('--pages', pages);
        babelArgs.push('--only-include-translated-page');
      }
      if (customPrompt) {
        babelArgs.push('--custom-system-prompt');
        babelArgs.push(customPrompt);
        await appendLog('[' + new Date().toISOString() + '] custom prompt active len=' + customPrompt.length);
      }
      if (pageNums.length === 1) {
        try {
          const toc = await detectTocPages(inputPath);
          if (toc.has(pageNums[0])) {
            babelArgs.push('--short-line-split-factor');
            babelArgs.push('1.5');
            await appendLog('[' + new Date().toISOString() + '] toc page ' + pageNums[0] + ' uses split factor 1.5');
          }
        } catch (e) { /* ignore */ }
      }

      currentProgress = { status: 'running', detail: '启动 BabelDOC…', updatedAt: Date.now() };
      const py = await sub.resolveExecutable('python');
      await readyScripts();
      const wrapperPath = helperDir() + '/babeldoc_run.py';
      const handle = sub.spawn({
        argv: [py, wrapperPath].concat(babelArgs),
        cwd: '.',
        env: { PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: 16 * 1024 * 1024, spill: { maxBytes: 32 * 1024 * 1024 } },
          stderr: { maxBytes: 8 * 1024 * 1024, spill: { maxBytes: 16 * 1024 * 1024 } },
        },
        graceMs: 3000,
      });
      activeHandles.add(handle);

      let stderrOff = 0;
      let rawProgress = '';
      let pollDispose = null;
      let settled = false;
      const poll = () => {
        try {
          if (handle.collected && handle.collected.stderr) {
            const r = handle.collected.stderr.readFrom(stderrOff);
            if (r.text) {
              rawProgress += r.text;
              currentProgress = { status: 'running', detail: summarizeProgress(rawProgress), updatedAt: Date.now() };
            }
            stderrOff = r.nextOffset;
          }
        } catch (e) { /* ignore */ }
        if (!settled && timer) pollDispose = timer.timeout(poll, 900);
      };
      poll();

      let timedOut = false;
      let cancel = null;
      let doneP = handle.done.then((o) => { settled = true; if (pollDispose) pollDispose(); return o; });
      if (timer) {
        doneP = Promise.race([
          doneP,
          new Promise((resolve) => { cancel = timer.timeout(() => { timedOut = true; handle.terminate(); resolve(null); }, 1800000); }),
        ]);
      }
      const outcome = await doneP;
      if (cancel) cancel();
      activeHandles.delete(handle);

      const errText = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '';
      const outText = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '';
      let logPath = '';
      try {
        const logDir = helperDir() + '/logs';
        await ensureDir(logDir);
        logPath = logDir + '/translate-' + Date.now().toString(36) + '.log';
        const logTarget = await fs.resolve(logPath);
        await fs.writeText(logTarget, outText + '\n===== STDERR =====\n' + errText);
      } catch (e) { logPath = ''; }

      if (timedOut || !outcome || outcome.exitCode !== 0) {
        currentProgress = { status: 'error', detail: summarizeProgress(errText || outText).slice(-300), updatedAt: Date.now() };
        throw new Error('BabelDOC 翻译失败 (exit ' + (outcome ? outcome.exitCode : 'timeout') + '): ' + String(stripAnsi(errText || outText)).slice(-2000));
      }

      await ensureDir(outDir);
      const outTarget = await fs.resolve(outDir);
      const entries = await fs.listDir(outTarget);
      const candidates = [];
      for (const e of entries) {
        const n = String(e.name || '').toLowerCase();
        if (n.endsWith('.mono.pdf')) candidates.push(e);
      }
      if (!candidates.length) throw new Error('BabelDOC 未生成 mono.pdf 输出');
      candidates.sort((a, b) => {
        const an = String(a.name || '').toLowerCase();
        const bn = String(b.name || '').toLowerCase();
        const aw = an.includes('.no_watermark.') ? 1 : 0;
        const bw = bn.includes('.no_watermark.') ? 1 : 0;
        if (aw !== bw) return bw - aw;
        const am = (a && (a.mtime || a.modified || 0)) || 0;
        const bm = (b && (b.mtime || b.modified || 0)) || 0;
        return bm - am;
      });
      const monoTarget = candidates[0].target || candidates[0];
      const monoFilePath = fs.processPath(monoTarget);

      if (pageNums.length === 1) {
        try {
          const toc = await detectTocPages(inputPath);
          if (toc.has(pageNums[0])) {
            await fixTocPage(inputPath, monoFilePath, pageNums[0] - 1);
          }
        } catch (e) { /* ignore */ }
      }

      const mergedPath = mergedPathFor(stem, langOut);
      let finalMonoPath = monoFilePath;
      let keepTmp = false;
      if (pages) {
        try {
          await withMergeLock(async () => {
            if (pageNums.length > 1) {
              const splitCode = [
                'import pymupdf, sys, os',
                'mono = sys.argv[1]',
                'd = sys.argv[2]',
                'lang = sys.argv[3]',
                'nums = sys.argv[4].split(",")',
                'doc = pymupdf.open(mono)',
                'for i, n in enumerate(nums):',
                '    if i >= doc.page_count: break',
                '    out = os.path.join(d, "p" + n + "." + lang + ".mono.pdf")',
                '    single = pymupdf.open()',
                '    single.insert_pdf(doc, from_page=i, to_page=i)',
                '    single.save(out)',
                '    single.close()',
                'doc.close()',
              ].join('\n');
              await runPython(splitCode, [monoFilePath, pageDir, langOut, pageNums.join(',')]);
            } else {
              const pageKey = 'p' + pageNums[0] + '.' + langOut + '.mono.pdf';
              await copyFile(monoFilePath, pageDir + '/' + pageKey);
            }
            const mergeCode = [
              'import pymupdf, sys, os, tempfile',
              'src = sys.argv[1]',
              'out = sys.argv[2]',
              'd = sys.argv[3]',
              'lang = sys.argv[4]',
              'src_doc = pymupdf.open(src)',
              'n = src_doc.page_count',
              'result = pymupdf.open()',
              'for i in range(1, n + 1):',
              '    p = os.path.join(d, "p" + str(i) + "." + lang + ".mono.pdf")',
              '    if os.path.exists(p):',
              '        tmp = pymupdf.open(p)',
              '        result.insert_pdf(tmp)',
              '        tmp.close()',
              '    else:',
              '        result.insert_pdf(src_doc, from_page=i - 1, to_page=i - 1)',
              'src_doc.close()',
              'fd, tmp_path = tempfile.mkstemp(suffix=".mtmp", dir=os.path.dirname(os.path.abspath(out)))',
              'os.close(fd)',
              'result.save(tmp_path)',
              'result.close()',
              'os.replace(tmp_path, out)',
              'print(n)',
            ].join('\n');
            let lastErr = null;
            for (let attempt = 0; attempt < 4; attempt++) {
              try {
                await runPython(mergeCode, [inputPath, mergedPath, pageDir, langOut]);
                lastErr = null;
                break;
              } catch (e) {
                lastErr = e;
                if (attempt < 3 && timer) await new Promise((r) => timer.timeout(r, 800));
              }
            }
            if (lastErr) throw lastErr;
            await removeFile(markerPathFor(stem, langOut));
          });
          finalMonoPath = mergedPath;
        } catch (e) {
          try {
            const mi = await fs.stat(await fs.resolve(mergedPath));
            if (mi) {
              finalMonoPath = mergedPath;
            } else {
              finalMonoPath = monoFilePath;
              keepTmp = true;
            }
          } catch (e2) {
            finalMonoPath = monoFilePath;
            keepTmp = true;
          }
        }
      } else {
        try {
          await atomicCopyFile(monoFilePath, mergedPath);
          try {
            const mt = await fs.resolve(markerPathFor(stem, langOut));
            await fs.writeText(mt, String(await pdfPageCount(mergedPath)));
          } catch (e) { /* ignore */ }
          const cleanCode = [
            'import os, sys, glob',
            'd = sys.argv[1]',
            'for f in glob.glob(os.path.join(d, "*.mono.pdf")):',
            '    try: os.remove(f)',
            '    except Exception: pass',
          ].join('\n');
          try {
            await runPython(cleanCode, [pageDir]);
          } catch (e) { /* ignore */ }
        } catch (e) { /* ignore */ }
      }
      if (pages && !keepTmp) {
        try {
          const rmCode = 'import shutil,sys\nshutil.rmtree(sys.argv[1], ignore_errors=True)';
          await runPython(rmCode, [outDir]);
        } catch (e) { /* ignore */ }
      }
      await cleanCacheDb();
      const pagesCount = await pdfPageCount(finalMonoPath);
      await appendLog('[' + new Date().toISOString() + '] translate ok pagesArg=' + (pages || '(all)') + ' monoPath=' + finalMonoPath + ' pages=' + pagesCount);
      currentProgress = { status: 'done', detail: '完成', updatedAt: Date.now() };
      return { monoPath: finalMonoPath, pages: pagesCount, langOut, model, logTail: summarizeProgress(errText).slice(-400), logPath };
    };

    handlers.ask = async (args) => {
      const question = String(args.question || '').trim();
      if (!question) throw new Error('问题不能为空');
      const pages = Array.isArray(args.pages) ? args.pages : [];
      const currentPage = Math.max(0, Number(args.currentPage) || 0);
      const r = await resolveModel(args);
      const BUDGET = 24000;
      const used = new Set();
      const ordered = [];
      const add = (idx) => { if (idx >= 0 && idx < pages.length && !used.has(idx)) { used.add(idx); ordered.push(idx); } };
      add(currentPage);
      add(currentPage - 1); add(currentPage + 1);
      add(currentPage - 2); add(currentPage + 2);
      add(0); add(1); add(2);
      for (let i = 0; i < pages.length; i++) add(i);
      const parts = [];
      let total = 0;
      for (const idx of ordered) {
        const t = pages[idx] && pages[idx].text ? String(pages[idx].text) : '';
        if (!t) continue;
        const piece = '【第 ' + (idx + 1) + ' 页】\n' + t;
        if (total + piece.length > BUDGET && parts.length) break;
        parts.push(piece);
        total += piece.length;
      }
      const context = parts.join('\n\n');
      const system = 'You are a PDF reading assistant. Answer the user question based ONLY on the document content provided below. Cite the relevant source page in brackets like [P3]. Answer in the language of the question. Be concise and accurate; if the document does not contain the answer, say so explicitly.';
      const userText = 'Document content:\n\n' + context + '\n\nQuestion: ' + question;
      const messages = [{ id: 'babeldoc-ask-' + (++seq), role: 'user', content: [{ type: 'text', text: userText }], source: { kind: 'user' } }];
      let text = '';
      let reason = null;
      try {
        for await (const chunk of r.llmSvc.stream({ provider: r.provider, model: r.model, messages, system, temperature: 0.3, maxTokens: 3000 })) {
          if (chunk.type === 'text-delta') text += chunk.text;
          else if (chunk.type === 'finish') reason = chunk.reason;
        }
      } catch (e) {
        throw new Error('LLM call failed: ' + (e && e.message ? e.message : String(e)));
      }
      if (!text && (reason === 'error' || reason === 'aborted')) {
        throw new Error('LLM call failed (reason: ' + reason + ')');
      }
      return { answer: text.trim(), provider: r.provider, model: r.model, usedPages: ordered.length };
    };
    // Attach handlers to the prototype so remoteMethods(service) discovers them.
    for (const [name, fn] of Object.entries(handlers)) {
      Object.defineProperty(BabeldocService.prototype, name, {
        value: fn,
        writable: true,
        configurable: true,
      });
      markRemote(BabeldocService.prototype, name);
    }
  }
}

export default BabeldocService;
export { BabeldocService };
