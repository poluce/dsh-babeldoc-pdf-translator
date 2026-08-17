window.__ModuleLoader__.load({
  id: "dsh-babeldoc-pdf-translator",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;

    /** Inject a CSS string as a <style> tag; returns a disposer. */
    function injectStyles(css) {
      const tagId = "dsh-babeldoc-pdf-translator/styles";
      if (typeof document === "undefined") return () => {};
      const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]");
      if (existing !== null) return () => {};
      const tag = document.createElement("style");
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
      return () => { tag.remove(); };
    }

    const inject = ["slots","remote","remote.babeldoc","timer"];

    function apply(ctx) {
      injectStyles(".bdoc-panel{position:fixed;top:0;right:0;bottom:0;width:min(1500px,98vw);z-index:2147483001;display:flex;flex-direction:column;background:#ffffff;border-left:1px solid var(--dsw-alias-border-l2,#d0d0d0);box-shadow:-14px 0 40px rgba(0,0,0,.18);color:var(--dsw-alias-label-primary,#111827);font-family:Inter,\"Segoe UI\",\"Microsoft YaHei\",\"PingFang SC\",Arial,sans-serif;font-size:14px;}.bdoc-appbar{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#fbfdff;border-bottom:1px solid #e5eaf1;flex:none;}.bdoc-logo{width:28px;height:28px;border-radius:7px;background:#3b63f3;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;flex:none;}.bdoc-title{font-size:20px;font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.bdoc-abtn{padding:8px 14px;border:1px solid #cfd7e4;border-radius:12px;background:#fff;cursor:pointer;font-size:14px;font-weight:600;color:#1f2937;white-space:nowrap;}.bdoc-abtn:hover{border-color:#3b63f3;color:#3b63f3;}.bdoc-win{display:flex;gap:12px;color:#374151;font-size:14px;align-items:center;}.bdoc-win span{cursor:pointer;}.bdoc-toolbar{display:flex;flex-wrap:wrap;gap:10px;padding:10px 16px;border-bottom:1px solid #e5eaf1;align-items:center;flex:none;}.bdoc-tbtn{display:flex;align-items:center;gap:8px;height:46px;padding:0 16px;border:1px solid #d6dee9;border-radius:12px;background:#fff;cursor:pointer;font-size:14px;font-weight:600;color:#1f2937;white-space:nowrap;}.bdoc-tbtn:hover{border-color:#3b63f3;}.bdoc-tbtn:disabled{opacity:.5;cursor:default;}.bdoc-tbtn-primary{background:#3b63f3;border-color:#3b63f3;color:#fff;}.bdoc-tbtn-primary:hover{border-color:#3b63f3;opacity:.92;}.bdoc-tbtn-stop{border-color:#fb7185;color:#ef4444;}.bdoc-tbtn-file{border-color:#d6dee9;background:#fff;font-weight:600;}.bdoc-fileicon{width:22px;height:24px;border-radius:4px;background:#ef4444;position:relative;flex:none;}.bdoc-fileicon:after{content:\"\";position:absolute;right:0;bottom:0;width:0;height:0;border-left:6px solid #fff;border-bottom:6px solid transparent;}.bdoc-tselect{display:flex;align-items:center;gap:6px;height:46px;padding:0 12px;border:1px solid #d6dee9;border-radius:12px;background:#ffffff;background-color:#ffffff !important;font-size:14px;font-weight:600;color:#1f2937;cursor:pointer;max-width:220px;}.bdoc-tselect:focus,.bdoc-tselect:active,.bdoc-tselect:hover{background-color:#ffffff !important;}.bdoc-progress{display:flex;align-items:center;gap:14px;padding:6px 16px;border-bottom:1px solid #e5eaf1;font-size:14px;font-weight:600;color:#1f2937;background:#fbfdff;flex:none;}.bdoc-pbar{flex:1;height:8px;border-radius:4px;background:#e9edf5;overflow:hidden;}.bdoc-pfill{height:100%;border-radius:4px;background:#3b63f3;transition:width .3s;}.bdoc-err{color:#d93026;font-size:13px;padding:4px 16px;}.bdoc-workspace{flex:1;display:flex;gap:14px;padding:12px 16px;min-height:0;background:#ffffff;}.bdoc-card{flex:1;min-width:0;display:flex;flex-direction:column;background:#fff;border:1px solid #d8e0ea;border-radius:14px;overflow:hidden;}.bdoc-card-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fbfdff;border-bottom:1px solid #e5eaf1;flex:none;flex-wrap:wrap;}.bdoc-card-title{font-size:17px;font-weight:700;margin-right:auto;white-space:nowrap;}.bdoc-chip{padding:4px 10px;border-radius:14px;background:#f8fafc;border:1px solid #d8e0ea;font-size:12px;color:#64748b;white-space:nowrap;}.bdoc-tgl{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:14px;background:#f8fafc;border:1px solid #d8e0ea;font-size:12px;color:#64748b;cursor:pointer;white-space:nowrap;}.bdoc-tgl-on{background:#eef4ff;border-color:#3b63f3;color:#3b63f3;}.bdoc-tgl .dot{width:14px;height:14px;border-radius:3px;background:#3b63f3;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:10px;}.bdoc-tgl:not(.bdoc-tgl-on) .dot{background:#cbd5e1;}.bdoc-zoombtn{padding:4px 10px;border-radius:8px;background:#fff;border:1px solid #d8e0ea;font-size:12px;color:#64748b;cursor:pointer;white-space:nowrap;}.bdoc-zoombtn-on{background:#eef4ff;border-color:#3b63f3;color:#3b63f3;}.bdoc-card-scroll{flex:1;overflow-y:auto;padding:14px;background:#f8fafc;}.bdoc-lpage{position:relative;margin:0 auto 14px;background:#fff;border-radius:3px;box-shadow:0 2px 6px rgba(15,23,42,.07);overflow:hidden;width:100%;}.bdoc-lpage canvas,.bdoc-lpage img{display:block;width:100%;height:auto;}.bdoc-card-foot{display:flex;align-items:center;gap:10px;padding:8px 12px;border-top:1px solid #e5eaf1;font-size:14px;color:#374151;flex:none;background:#fbfdff;}.bdoc-navbtn{width:30px;height:30px;border-radius:8px;border:1px solid #d8e0ea;background:#fff;cursor:pointer;font-size:14px;color:#374151;}.bdoc-navbtn:disabled{opacity:.4;cursor:default;}.bdoc-qa{margin:0 16px 12px;border:1px solid #d8e0ea;border-radius:14px;background:#fbfdff;display:flex;flex-direction:column;flex:none;}.bdoc-qa-head{display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:16px;font-weight:700;}.bdoc-qa-head .sp{flex:1;}.bdoc-qa-head button{border:none;background:none;font-size:16px;cursor:pointer;color:#64748b;}.bdoc-qa-hist{max-height:150px;overflow-y:auto;padding:0 12px;display:flex;flex-direction:column;gap:8px;}.bdoc-qa-msg{max-width:92%;padding:8px 10px;border-radius:8px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;}.bdoc-qa-user{align-self:flex-end;background:#3b63f3;color:#fff;}.bdoc-qa-assist{align-self:flex-start;background:#eef1f8;border:1px solid #e5eaf1;}.bdoc-qa-model{font-size:10px;opacity:.7;margin-top:4px;}.bdoc-qa-input-row{display:flex;gap:10px;padding:10px 12px;}.bdoc-qa-input{flex:1;height:44px;padding:0 14px;border:1px solid #cfd7e4;border-radius:10px;background:#fff;color:inherit;font-size:14px;}.bdoc-qa-send{height:44px;padding:0 22px;border:none;border-radius:10px;background:#3b63f3;color:#fff;font-size:14px;font-weight:600;cursor:pointer;}.bdoc-qa-send:disabled{opacity:.5;}.bdoc-qa-disc{font-size:12px;color:#64748b;padding:0 12px 8px;}.bdoc-drawer{position:absolute;top:0;right:0;bottom:0;width:320px;background:#fbfdff;border-left:1px solid #d8e0ea;box-shadow:-8px 0 24px rgba(15,23,42,.10);z-index:2147483002;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:6px;}.bdoc-drawer-head{display:flex;align-items:center;font-size:17px;font-weight:700;margin-bottom:6px;}.bdoc-drawer-head .sp{flex:1;}.bdoc-drawer-head button{border:none;background:none;font-size:16px;cursor:pointer;color:#64748b;}.bdoc-field label{font-size:13px;font-weight:600;color:#1f2937;display:block;margin-top:10px;margin-bottom:4px;}.bdoc-field input,.bdoc-field select,.bdoc-field textarea{width:100%;padding:10px;border:1px solid #d6dee9;border-radius:9px;background:#fff;color:#334155;font-size:13px;box-sizing:border-box;}.bdoc-field select{background-color:#ffffff !important;}.bdoc-field select:focus,.bdoc-field select:active,.bdoc-field select:hover{background-color:#ffffff !important;}.bdoc-field textarea{height:56px;resize:vertical;}.bdoc-tselect option,.bdoc-field select option{background:#ffffff;color:#1f2937;}.bdoc-drawer hr{border:none;border-top:1px solid #e5eaf1;margin:12px 0;}.bdoc-more{display:flex;align-items:center;justify-content:space-between;padding:8px 2px;font-size:13px;font-weight:600;color:#1f2937;cursor:pointer;}.bdoc-envreport{font-size:11px;font-family:Consolas,Menlo,monospace;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px;white-space:pre-wrap;word-break:break-all;margin-top:8px;}.bdoc-empty{color:#94a3b8;text-align:center;padding:40px;font-size:14px;}");
    const React = require("react");

        const TARGETS = { 'zh-CN': '中文', 'zh-TW': '繁體中文', en: 'English', ja: '日本語', es: 'Español' };
    const OC_BASE_URL = 'https://opencode.ai/zen/go/v1';
    const OC_DEFAULT_KEY = '';
    const OC_DEFAULT_MODEL = 'deepseek-v4-flash';
    const OC_MODELS = [
      { id: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash（推荐·快）' },
      { id: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro（质量好·慢）' },
      { id: 'glm-5.2', label: 'GLM-5.2' },
      { id: 'glm-5.1', label: 'GLM-5.1' },
      { id: 'glm-5.3', label: 'GLM-5.3' },
      { id: 'kimi-k3', label: 'Kimi K3' },
      { id: 'kimi-k2.7-code', label: 'Kimi K2.7 Code' },
      { id: 'kimi-k2.6', label: 'Kimi K2.6' },
      { id: 'mimo-v2.5', label: 'MiMo V2.5' },
      { id: 'mimo-v2.5-pro', label: 'MiMo V2.5 Pro' },
      { id: 'hy3', label: 'Hy3' },
    ];
    const LS_KEY = 'babeldoc.prefs';
    const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const BATCH = 5;
    const PARALLEL = 4;

    injectStyles(CSS_TEXT)
;

    const store = { open: false };
    const listeners = new Set();
    function emit() { for (const fn of listeners) fn(); }
    function useTick() {
      const [, setV] = React.useState(0);
      React.useEffect(() => {
        const fn = () => setV((v) => v + 1);
        listeners.add(fn);
        return () => listeners.delete(fn);
      }, []);
    }

    function diag(msg) {
      try { ctx.remote.babeldoc.diag({ msg: String(msg).slice(0, 400) }).catch(() => { /* ignore */ }); } catch (e) { /* ignore */ }
    }

    function base64FromBytes(bytes) {
      let bin = '';
      const CH = 0x8000;
      for (let i = 0; i < bytes.length; i += CH) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(bytes.length, i + CH)));
      }
      return btoa(bin);
    }

    function b64ToBytes(b64) {
      const bin = atob(String(b64));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }

    function loadPdfJs() {
      return new Promise((resolve, reject) => {
        try {
          if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
          const s = document.createElement('script');
          s.src = PDFJS_URL;
          s.onload = () => {
            try {
              if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
                resolve(window.pdfjsLib);
              } else reject(new Error('pdf.js 未加载'));
            } catch (e) { reject(e); }
          };
          s.onerror = () => reject(new Error('pdf.js 加载失败（请检查网络）'));
          document.head.appendChild(s);
        } catch (e) { reject(e); }
      });
    }

    function renderPdfPage(pdfDoc, pageNum, canvas) {
      return pdfDoc.getPage(pageNum).then((page) => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });
        const dpr = (window.devicePixelRatio || 1) > 1.5 ? 1.5 : 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        const ctx = canvas.getContext('2d');
        if (dpr !== 1) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return page.render({ canvasContext: ctx, viewport: viewport }).promise;
      });
    }

    function savePrefs(partial) {
      try {
        const cur = loadPrefs() || {};
        localStorage.setItem(LS_KEY, JSON.stringify(Object.assign({}, cur, partial)));
      } catch (e) { /* ignore */ }
    }
    function loadPrefs() {
      try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; }
    }

    function Viewer(props) {
      const [doc, setDoc] = React.useState(null);
      const [error, setError] = React.useState('');
      const [busy, setBusy] = React.useState('');
      const [pdfState, setPdfState] = React.useState('idle');
      const [translating, setTranslating] = React.useState(false);
      const [progressDetail, setProgressDetail] = React.useState('');
      const [donePages, setDonePages] = React.useState(0);
      const [target, setTarget] = React.useState('zh-CN');
      const [qaModels, setQaModels] = React.useState([]);
      const [qaModel, setQaModel] = React.useState({ provider: '', model: '' });
      const [tcfg, setTcfg] = React.useState({ apiKey: OC_DEFAULT_KEY, model: OC_DEFAULT_MODEL, baseUrl: OC_BASE_URL, customPrompt: '' });
      const [syncScroll, setSyncScroll] = React.useState(true);
      const [curPage, setCurPage] = React.useState(0);
      const [qa, setQa] = React.useState([]);
      const [qaInput, setQaInput] = React.useState('');
      const [qaBusy, setQaBusy] = React.useState(false);
      const [tpdf, setTpdf] = React.useState(null);
      const [tpdfState, setTpdfState] = React.useState('idle');
      const [tpageCount, setTpageCount] = React.useState(0);
      const [renderErr, setRenderErr] = React.useState('');
      const [monoPath, setMonoPath] = React.useState('');
      const [rpng, setRpng] = React.useState({});
      const [rpngBusy, setRpngBusy] = React.useState({});
      const [autoQueue, setAutoQueue] = React.useState(false);
      const [pendingAuto, setPendingAuto] = React.useState(false);
      const [drawerOpen, setDrawerOpen] = React.useState(false);
      const [moreOpen, setMoreOpen] = React.useState(false);
      const [qaCollapsed, setQaCollapsed] = React.useState(false);
      const [zoom, setZoom] = React.useState('fit');
      const [envReport, setEnvReport] = React.useState('');
      const [depsBusy, setDepsBusy] = React.useState(false);
      const [depsReport, setDepsReport] = React.useState('');
      const fileRef = React.useRef(null);
      const leftScrollRef = React.useRef(null);
      const rightScrollRef = React.useRef(null);
      const pdfDocRef = React.useRef(null);
      const renderedRef = React.useRef(new Set());
      const runIdRef = React.useRef(0);
      const sourceRef = React.useRef(null);
      const monoPathRef = React.useRef('');
      const prevMonoRef = React.useRef('');
      const rpngRef = React.useRef({});
      const rpngBusyRef = React.useRef({});
      const leftObsRef = React.useRef(null);
      const tpageCountRef = React.useRef(0);
      const tpdfStateRef = React.useRef('idle');
      const autoStopRef = React.useRef(false);
      const syncLockRef = React.useRef(false);
      const scanDisposerRef = React.useRef(null);

      const pageCount = doc ? doc.pages.length : 0;
      const pidx = pageCount ? Math.max(0, Math.min(curPage, pageCount - 1)) : 0;
      const rpageTotal = tpageCount > 0 ? tpageCount : pageCount;
      const rpidx = rpageTotal ? Math.max(0, Math.min(pidx, rpageTotal - 1)) : 0;

      function setMono(p) {
        monoPathRef.current = p;
        setMonoPath(p);
      }
      function setTpc(n) {
        tpageCountRef.current = n;
        setTpageCount(n);
      }
      function setTState(s) {
        tpdfStateRef.current = s;
        setTpdfState(s);
      }

      function stopScan() {
        if (scanDisposerRef.current) {
          try { scanDisposerRef.current(); } catch (e) { /* ignore */ }
          scanDisposerRef.current = null;
        }
      }
      function scheduleScan() {
        stopScan();
        scanDisposerRef.current = ctx.timer.timeout(() => {
          scanDisposerRef.current = null;
          if (tpdfStateRef.current !== 'ready') return;
          const triggered = scanRight();
          const hasBusy = Object.keys(rpngBusyRef.current).some((k) => rpngBusyRef.current[k]);
          if (triggered > 0 || hasBusy) scheduleScan();
        }, 700);
      }
      function inViewport(el, sc, margin) {
        if (!sc || !el) return false;
        const t = el.offsetTop;
        const b = t + (el.offsetHeight || 0);
        const m = margin || 900;
        return b >= sc.scrollTop - m && t <= sc.scrollTop + sc.clientHeight + m;
      }
      function scanRight() {
        if (tpdfStateRef.current !== 'ready' || !rightScrollRef.current) return 0;
        const els = rightScrollRef.current.querySelectorAll('.bdoc-lpage');
        let triggered = 0;
        for (let i = 0; i < els.length; i++) {
          const el = els[i];
          const num = Number(el.getAttribute('data-page'));
          if (!num) continue;
          if (rpngRef.current[num] || rpngBusyRef.current[num]) continue;
          if (!inViewport(el, rightScrollRef.current, 900)) continue;
          renderPageImg(num);
          triggered++;
        }
        if (!rpngRef.current[1] && !rpngBusyRef.current[1]) { renderPageImg(1); triggered++; }
        return triggered;
      }

      function renderPageImg(num) {
        const mp = monoPathRef.current;
        if (!mp) return;
        const max = tpageCountRef.current;
        let n = num;
        if (max > 0 && n > max) n = max;
        if (!n || rpngRef.current[n] || rpngBusyRef.current[n]) return;
        rpngBusyRef.current[n] = true;
        setRpngBusy((prev) => Object.assign({}, prev, { [n]: true }));
        ctx.remote.babeldoc.renderPage({ path: mp, page: n - 1, scale: 2 })
          .then((r) => {
            if (!rpngBusyRef.current[n]) return;
            if (r && r.pngBase64) {
              const key = (r.page != null) ? (r.page + 1) : n;
              rpngRef.current[key] = r.pngBase64;
              setRpng(Object.assign({}, rpngRef.current));
              diag('img n=' + key + ' ok len=' + r.pngBase64.length);
            }
          })
          .catch((e) => {
            const msg = String((e && e.message) || e);
            diag('img n=' + n + ' FAIL ' + msg.slice(0, 200));
            setRenderErr(msg);
          })
          .finally(() => {
            if (n in rpngBusyRef.current) {
              rpngBusyRef.current[n] = false;
              setRpngBusy(Object.assign({}, rpngBusyRef.current));
            }
          });
      }

      function handleError(err) {
        setError(String((err && err.message) || err));
      }

      function stopAuto() {
        autoStopRef.current = true;
        setAutoQueue(false);
        try {
          ctx.remote.babeldoc.cancelTranslate({}).catch(() => { /* ignore */ });
        } catch (e) { /* ignore */ }
        diag('stop clicked; cancelTranslate sent');
      }

      async function runEnvCheck() {
        setEnvReport('检查中…');
        try {
          const r = await ctx.remote.babeldoc.envCheck({});
          setEnvReport((r && Array.isArray(r.lines)) ? r.lines.join('\n') : '（无返回）');
        } catch (e) {
          setEnvReport('环境检查失败：' + String((e && e.message) || e));
        }
      }
      async function runInstallDeps() {
        setDepsBusy(true);
        setDepsReport('开始安装缺失依赖（需要几分钟，请耐心等待）…');
        try {
          const r = await ctx.remote.babeldoc.installDeps({});
          const lines = (r && Array.isArray(r.results)) ? r.results.map((x) => {
            const tag = x.status === 'ok' ? '[OK]   ' : (x.status === 'installed' ? '[NEW]  ' : '[FAIL] ');
            return tag + x.pkg + '  ' + String(x.detail || '');
          }) : [];
          if (r && r.error) lines.unshift('[FAIL] ' + r.error);
          setDepsReport(lines.join('\n') || '（无返回）');
        } catch (e) {
          setDepsReport('安装失败：' + String((e && e.message) || e));
        } finally {
          setDepsBusy(false);
        }
      }


      async function clearAllCache() {
        setError('');
        setBusy('清空缓存…');
        try {
          await ctx.remote.babeldoc.clearTranslationCache({});
          stopScan();
          setTpdf(null);
          setTpc(0);
          setTState('idle');
          setMono('');
          rpngRef.current = {};
          rpngBusyRef.current = {};
          setRpng({});
          setRenderErr('');
          diag('cache cleared');
        } catch (e) {
          handleError(e);
        } finally {
          setBusy('');
        }
      }

      async function exportPdf() {
        if (!monoPathRef.current || !doc) return;
        setBusy('导出中…');
        try {
          const stem = String(doc.name || 'document').replace(/\.pdf$/i, '');
          const r = await ctx.remote.babeldoc.exportPdf({ path: monoPathRef.current, name: stem + '.zh.pdf' });
          const bytes = b64ToBytes(r.base64);
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = r.name || 'translated.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
          ctx.timer.timeout(() => { try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ } }, 5000);
          diag('export ok ' + r.name + ' bytes=' + bytes.length);
        } catch (e) {
          handleError(e);
        } finally {
          setBusy('');
        }
      }

      async function runTranslate(pagesArg) {
        if (!doc) return false;
        if (!tcfg.apiKey) {
          setError('请先在「⚙ 设置」中填写你的 API Key');
          return false;
        }
        setError('');
        setTranslating(true);
        if (!monoPathRef.current) {
          setTState('loading');
          setProgressDetail('启动 BabelDOC…');
        }
        let pollDispose = null;
        let stopPoll = false;
        const poll = () => {
          if (stopPoll) return;
          ctx.remote.babeldoc.translateProgress({}).then((p) => {
            if (p && p.detail) setProgressDetail(String(p.detail).slice(-240));
          }).catch(() => { /* ignore */ });
          pollDispose = ctx.timer.timeout(poll, 1500);
        };
        pollDispose = ctx.timer.timeout(poll, 1500);
        try {
          const myRun = runIdRef.current;
          const srcObj = sourceRef.current || {};
          const args = {
            baseUrl: tcfg.baseUrl || OC_BASE_URL,
            apiKey: tcfg.apiKey,
            model: tcfg.model,
            langOut: target === 'zh-CN' ? 'zh' : (target === 'zh-TW' ? 'zh-TW' : target),
            langIn: 'en',
          };
          if (tcfg.customPrompt && String(tcfg.customPrompt).trim()) args.customPrompt = String(tcfg.customPrompt).trim();
          if (pagesArg) args.pages = pagesArg;
          if (srcObj.kind === 'path' && srcObj.path) args.path = srcObj.path;
          else { args.pdfBase64 = srcObj.pdfBase64; args.name = srcObj.name; }
          diag('translate start pages=' + (pagesArg || 'all'));
          const res = await ctx.remote.babeldoc.translate(args);
          if (runIdRef.current !== myRun) { diag('translate stale run ignored'); return false; }
          setMono(res.monoPath || '');
          const pagesDone = pagesArg ? String(pagesArg).split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n) && n > 0) : [];
          for (const n of pagesDone) {
            delete rpngRef.current[n];
            delete rpngBusyRef.current[n];
          }
          if (pagesDone.length) {
            setRpng(Object.assign({}, rpngRef.current));
            setDonePages((d) => d + pagesDone.length);
          }
          let pc = res.pages;
          if (!pc) {
            try { pc = (await ctx.remote.babeldoc.pdfInfo({ path: res.monoPath })).pages; } catch (e) { pc = 0; }
          }
          setTpc(pc || 1);
          setTpdf({ model: tcfg.model, seq: Date.now() });
          setTState('ready');
          setProgressDetail('');
          diag('translate done pages=' + pc + ' mono=' + String(res.monoPath || '').slice(-50));
          return true;
        } catch (err) {
          if (autoStopRef.current) {
            diag('translate cancelled by user stop');
            return false;
          }
          const msg = String((err && err.message) || err);
          diag('translate FAIL ' + msg.slice(0, 300));
          handleError(err);
          if (!monoPathRef.current) setTState('failed');
          return false;
        } finally {
          stopPoll = true;
          if (pollDispose) pollDispose();
          setTranslating(false);
        }
      }

      function doTranslate() { stopAuto(); startAutoQueue(true); }
      function translateCurrentPage() { stopAuto(); runTranslate(String(pidx + 1)); }

      async function startAutoQueue(forceFrom1) {
        if (!doc || !tcfg.apiKey) return;
        autoStopRef.current = false;
        setAutoQueue(true);
        let next = 1;
        let doneFull = false;
        try {
          const langOutNow = target === 'zh-CN' ? 'zh' : (target === 'zh-TW' ? 'zh-TW' : target);
          const cached = await ctx.remote.babeldoc.loadCachedTranslation({ name: doc.name, langOut: langOutNow });
          if (cached && cached.found && cached.monoPath) {
            setMono(cached.monoPath);
            if (cached.pages) setTpc(cached.pages);
            setTpdf({ model: '缓存', cachedPages: (cached.hasFull ? cached.pages : cached.translatedCount) || cached.pages || 1, seq: Date.now() });
            setTState('ready');
            diag('queue cached loaded pages=' + cached.pages + ' translated=' + cached.translatedCount + ' hasFull=' + cached.hasFull);
          }
          if (!forceFrom1) {
            if (cached && cached.found && cached.hasFull) {
              doneFull = true;
            } else {
              const r = await ctx.remote.babeldoc.listTranslatedPages({ name: doc.name, langOut: langOutNow });
              const done = (r && Array.isArray(r.pages)) ? r.pages : [];
              while (done.indexOf(next) >= 0 && next <= pageCount) next++;
            }
          }
        } catch (e) { /* start from 1 */ }
        diag('queue start next=' + next + ' doneFull=' + doneFull + ' force=' + (forceFrom1 ? 1 : 0) + ' total=' + pageCount);
        if ((doneFull || next > pageCount) && !forceFrom1) { setAutoQueue(false); return; }
        let tocSet = null;
        try {
          const srcObj = sourceRef.current || {};
          const tpArgs = { name: doc.name };
          if (srcObj.kind === 'path' && srcObj.path) tpArgs.path = srcObj.path;
          else { tpArgs.pdfBase64 = srcObj.pdfBase64; tpArgs.name = srcObj.name; }
          const tp = await ctx.remote.babeldoc.tocPages(tpArgs);
          if (tp && Array.isArray(tp.pages) && tp.pages.length) tocSet = new Set(tp.pages.map(Number));
          if (tocSet) diag('toc pages: ' + Array.from(tocSet).join(','));
        } catch (e) { tocSet = null; }
        const groups = [];
        let cur = [];
        for (let p = next; p <= pageCount; p++) {
          if (tocSet && tocSet.has(p)) {
            if (cur.length) { groups.push(cur); cur = []; }
            groups.push([p]);
          } else {
            cur.push(p);
            if (cur.length === BATCH) { groups.push(cur); cur = []; }
          }
        }
        if (cur.length) groups.push(cur);
        const active = new Set();
        const launch = async (nums) => {
          try {
            return await runTranslate(nums.join(','));
          } finally { /* label-less */ }
        };
        try {
          let idx = 0;
          while (idx < groups.length) {
            while (active.size < PARALLEL && idx < groups.length && !autoStopRef.current) {
              const pr = launch(groups[idx++]).catch(() => false).then((ok) => ok);
              active.add(pr);
              pr.finally(() => active.delete(pr));
            }
            if (active.size === 0) break;
            const ok = await Promise.race(Array.from(active));
            if (!ok) { break; }
          }
          await Promise.all(Array.from(active));
        } catch (e) {
          if (!autoStopRef.current) {
            const msg = String((e && e.message) || e);
            diag('queue FAIL ' + msg.slice(0, 300));
            handleError(e);
          } else {
            diag('queue cancelled by user');
          }
        }
        if (idx >= groups.length && !autoStopRef.current) {
          try {
            await ctx.remote.babeldoc.markFullTranslation({ name: doc.name, langOut: target === 'zh-CN' ? 'zh' : (target === 'zh-TW' ? 'zh-TW' : target), pages: pageCount });
          } catch (e) { /* ignore */ }
        }
        diag('queue end stopped=' + autoStopRef.current);
        setAutoQueue(false);
      }

      React.useEffect(() => {
        if (!pendingAuto || !doc || !tcfg.apiKey) return;
        setPendingAuto(false);
        startAutoQueue(false);
      }, [pendingAuto, doc, tcfg.apiKey]);

      React.useEffect(() => {
        const saved = loadPrefs();
        if (!saved) return;
        if (saved.target && TARGETS[saved.target]) setTarget(saved.target);
        if (typeof saved.syncScroll === 'boolean') setSyncScroll(saved.syncScroll);
        if (saved.tcfg) setTcfg(Object.assign({ apiKey: OC_DEFAULT_KEY, model: OC_DEFAULT_MODEL, baseUrl: OC_BASE_URL, customPrompt: '' }, saved.tcfg));
        if (saved.zoom) setZoom(saved.zoom);
      }, []);

      React.useEffect(() => {
        ctx.remote.babeldoc.listModels({}).then((res) => {
          const list = (res && res.providers) || [];
          if (!list.length) return;
          setQaModels(list);
          const saved = loadPrefs();
          const pr = saved && saved.qaModel && list.find((m) => m.provider === saved.qaModel.provider);
          const md = pr && pr.models.find((m) => m.id === saved.qaModel.model);
          if (pr && md) {
            setQaModel({ provider: saved.qaModel.provider, model: saved.qaModel.model });
          } else {
            const p0 = list[0];
            const sel = { provider: p0.provider, model: p0.models && p0.models.length ? p0.models[0].id : '' };
            setQaModel(sel);
            savePrefs({ qaModel: sel });
          }
        }).catch(() => { /* models unavailable */ });
      }, []);

      React.useEffect(() => {
        diag('viewer mounted');
        const onErr = (ev) => { diag('winerr ' + String(ev && ev.message || '').slice(0, 200)); };
        const onRej = (ev) => { diag('unhandled ' + String((ev && ev.reason && (ev.reason.message || ev.reason)) || '').slice(0, 200)); };
        window.addEventListener('error', onErr);
        window.addEventListener('unhandledrejection', onRej);
        return () => {
          window.removeEventListener('error', onErr);
          window.removeEventListener('unhandledrejection', onRej);
        };
      }, []);

      React.useEffect(() => {
        if (pdfDocRef.current) {
          try { pdfDocRef.current.destroy(); } catch (e) { /* ignore */ }
          pdfDocRef.current = null;
        }
        renderedRef.current = new Set();
        if (!doc || !doc.pdfBase64) { setPdfState('none'); return; }
        let cancelled = false;
        setPdfState('loading');
        loadPdfJs()
          .then((lib) => { if (cancelled) return null; return lib.getDocument({ data: b64ToBytes(doc.pdfBase64) }).promise; })
          .then((pdf) => { if (cancelled || !pdf) return; pdfDocRef.current = pdf; setPdfState('ready'); })
          .catch(() => { if (!cancelled) setPdfState('failed'); });
        return () => { cancelled = true; };
      }, [doc]);

      React.useEffect(() => {
        if (pdfState !== 'ready' || !leftScrollRef.current) return;
        if (leftObsRef.current) { leftObsRef.current.disconnect(); leftObsRef.current = null; }
        const io = new IntersectionObserver((entries) => {
          for (const en of entries) {
            if (!en.isIntersecting) continue;
            const holder = en.target;
            const num = Number(holder.getAttribute('data-page'));
            if (!num || renderedRef.current.has(num)) continue;
            const canvas = holder.querySelector('canvas');
            if (!canvas) continue;
            const pd = pdfDocRef.current;
            if (!pd) continue;
            renderedRef.current.add(num);
            renderPdfPage(pd, num, canvas).catch(() => { /* ignore */ });
          }
        }, { root: leftScrollRef.current, rootMargin: '300px 0px' });
        const els = leftScrollRef.current.querySelectorAll('.bdoc-lpage');
        for (const el of els) io.observe(el);
        leftObsRef.current = io;
        return () => { io.disconnect(); leftObsRef.current = null; };
      }, [pdfState, doc]);

      React.useEffect(() => {
        stopScan();
        if (tpdfState !== 'ready') return;
        const monoChanged = !!monoPath && monoPath !== prevMonoRef.current;
        prevMonoRef.current = monoPath;
        if (monoChanged) {
          rpngRef.current = {};
          rpngBusyRef.current = {};
          setRpng({});
          setRenderErr('');
        }
        diag('render effect monoChanged=' + (monoChanged ? 1 : 0));
        scanRight();
        scheduleScan();
        return stopScan;
      }, [tpdfState, tpdf, tpageCount, monoPath]);

      async function uploadFile(file) {
        setError('');
        setBusy('读取文件…');
        try {
          const buf = await file.arrayBuffer();
          const bytes = new Uint8Array(buf);
          const uploadId = 'up' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          const chunkSize = 786432;
          const total = Math.max(1, Math.ceil(bytes.length / chunkSize));
          for (let i = 0; i < total; i++) {
            const part = bytes.slice(i * chunkSize, Math.min(bytes.length, (i + 1) * chunkSize));
            await ctx.remote.babeldoc.uploadChunk({ uploadId: uploadId, name: file.name, index: i, total: total, size: bytes.length, chunk: base64FromBytes(part) });
          }
          setBusy('解析 PDF…');
          const res = await ctx.remote.babeldoc.openPdf({ kind: 'upload', uploadId: uploadId, name: file.name });
          const srcObj = res.persistPath
            ? { kind: 'path', path: res.persistPath, name: res.name }
            : { kind: 'upload', pdfBase64: res.pdfBase64, name: res.name };
          applyDoc(res, srcObj);
        } catch (err) {
          handleError(err);
        } finally {
          setBusy('');
        }
      }

      function applyDoc(res, source) {
        diag('applyDoc name=' + String(res && res.name || '') + ' pages=' + (res && res.pages ? res.pages.length : 0));
        stopScan();
        runIdRef.current = runIdRef.current + 1;
        sourceRef.current = source;
        autoStopRef.current = true;
        setAutoQueue(false);
        setDoc(res);
        setQa([]);
        setTpdf(null);
        setTpc(0);
        setTState('idle');
        setMono('');
        rpngRef.current = {};
        rpngBusyRef.current = {};
        setRpng({});
        setCurPage(0);
        setDonePages(0);
        setError('');
        setPendingAuto(true);
      }

      async function sendQa() {
        const q = qaInput.trim();
        if (!q || qaBusy || !doc) return;
        if (!qaModel.provider || !qaModel.model) {
          setError('未获取到内置问答模型');
          return;
        }
        setQa((prev) => prev.concat([{ role: 'user', text: q }]));
        setQaInput('');
        setQaBusy(true);
        try {
          const ctxPages = doc.pages.map((pg, i) => ({ pageNo: i, text: pg.paragraphs.map((x) => x.text).join('\n') }));
          const res = await ctx.remote.babeldoc.ask({ provider: qaModel.provider, model: qaModel.model, question: q, pages: ctxPages, currentPage: pidx });
          setQa((prev) => prev.concat([{ role: 'assistant', text: (res && res.answer) || '（无回答）', model: res && res.model }]));
        } catch (err) {
          setQa((prev) => prev.concat([{ role: 'assistant', text: '⚠ ' + String((err && err.message) || err) }]));
        } finally {
          setQaBusy(false);
        }
      }

      function currentPageIn(sc) {
        if (!sc) return 0;
        const els = sc.querySelectorAll('.bdoc-lpage');
        let idx = 0;
        for (let i = 0; i < els.length; i++) {
          if (els[i].offsetTop - sc.scrollTop > 60) break;
          idx = i;
        }
        return Math.min(idx, Math.max(0, els.length - 1));
      }

      function syncPair(fromEl, toEl) {
        if (!toEl) return;
        const maxF = fromEl.scrollHeight - fromEl.clientHeight;
        const maxT = toEl.scrollHeight - toEl.clientHeight;
        if (maxF <= 0 || maxT <= 0) return;
        toEl.scrollTop = (fromEl.scrollTop / maxF) * maxT;
      }

      function handleLeftScroll() {
        if (syncLockRef.current) return;
        if (syncScroll && rightScrollRef.current && leftScrollRef.current) {
          syncLockRef.current = true;
          syncPair(leftScrollRef.current, rightScrollRef.current);
          ctx.timer.timeout(() => { syncLockRef.current = false; }, 40);
        }
        const idx = currentPageIn(leftScrollRef.current);
        setCurPage(idx);
        scanRight();
      }

      function handleRightScroll() {
        if (syncLockRef.current) return;
        if (syncScroll && leftScrollRef.current && rightScrollRef.current) {
          syncLockRef.current = true;
          syncPair(rightScrollRef.current, leftScrollRef.current);
          ctx.timer.timeout(() => { syncLockRef.current = false; }, 40);
        }
        scanRight();
      }

      function scrollToPage(idx, side) {
        const sc = side === 'right' ? rightScrollRef.current : leftScrollRef.current;
        if (!sc) return;
        const els = sc.querySelectorAll('.bdoc-lpage');
        if (!els.length) return;
        const target = els[Math.max(0, Math.min(idx, els.length - 1))];
        sc.scrollTop = target.offsetTop - 10;
        if (side !== 'right') setCurPage(idx);
        if (syncScroll && side !== 'right') {
          syncPair(leftScrollRef.current, rightScrollRef.current);
        }
        scanRight();
      }

      function onTargetChange(v) { setTarget(v); savePrefs({ target: v }); }
      function onCfgChange(k, v) {
        const next = Object.assign({}, tcfg, { [k]: v });
        setTcfg(next);
        savePrefs({ tcfg: next });
      }
      function toggleSyncScroll() { const n = !syncScroll; setSyncScroll(n); savePrefs({ syncScroll: n }); }
      function toggleDrawer() { setDrawerOpen((v) => !v); }
      function toggleMore() { setMoreOpen((v) => !v); }
      function toggleQa() { setQaCollapsed((v) => !v); }
      function setZoomMode(m) { setZoom(m); savePrefs({ zoom: m }); }
      function onQaProviderChange(p) {
        const pr = qaModels.find((m) => m.provider === p);
        const sel = { provider: p, model: pr && pr.models.length ? pr.models[0].id : '' };
        setQaModel(sel);
        savePrefs({ qaModel: sel });
      }
      function onQaModelChange(m) {
        const sel = Object.assign({}, qaModel, { model: m });
        setQaModel(sel);
        savePrefs({ qaModel: sel });
      }

      const pageWStyle = zoom === '100' ? { width: 'min(793px, 100%)' } : { width: '100%' };

      const appbar = React.createElement('div', { className: 'bdoc-appbar' },
        React.createElement('div', { className: 'bdoc-logo' }, '▤'),
        React.createElement('span', { className: 'bdoc-title' }, 'PDF 双语阅读器'),
        React.createElement('button', { className: 'bdoc-abtn', onClick: toggleDrawer, title: '设置' }, '⚙ 设置'),
        React.createElement('div', { className: 'bdoc-win' },
          React.createElement('span', null, '—'),
          React.createElement('span', null, '□'),
          React.createElement('span', { onClick: props.onClose }, '✕'))
      );

      const toolbar = React.createElement('div', { className: 'bdoc-toolbar' },
        React.createElement('button', { className: 'bdoc-tbtn bdoc-tbtn-file', disabled: !doc, title: doc ? (doc.name + ' · ' + pageCount + ' 页') : '未打开文件' },
          React.createElement('span', { className: 'bdoc-fileicon' }),
          doc ? (doc.name.replace(/\.pdf$/i, '') + ' · ' + pageCount + '页') : '未打开文件'),
        React.createElement('button', { className: 'bdoc-tbtn', onClick: () => fileRef.current && fileRef.current.click(), disabled: !!busy, title: '打开 PDF 文件' },
          React.createElement('span', null, '🗀'), '打开 PDF'),
        React.createElement('select', { className: 'bdoc-tselect', value: target, onChange: (e) => onTargetChange(e.target.value), title: '目标语言' },
          Object.keys(TARGETS).map((k) => React.createElement('option', { key: k, value: k }, TARGETS[k]))),
        React.createElement('select', { className: 'bdoc-tselect', value: tcfg.model, onChange: (e) => onCfgChange('model', e.target.value), title: '翻译模型' },
          OC_MODELS.map((m) => React.createElement('option', { key: m.id, value: m.id }, m.label))),
        React.createElement('button', { className: 'bdoc-tbtn', onClick: translateCurrentPage, disabled: translating || !doc || !!busy, title: '只翻译当前页' }, '翻译当前页'),
        React.createElement('button', { className: 'bdoc-tbtn bdoc-tbtn-primary', onClick: doTranslate, disabled: translating || !doc || !!busy, title: '翻译全部页面' }, '翻译全部'),
        translating ? React.createElement('button', { className: 'bdoc-tbtn bdoc-tbtn-stop', onClick: stopAuto, title: '停止并终止当前翻译进程' }, '⏸ 停止') : null,
        React.createElement('button', { className: 'bdoc-tbtn', onClick: exportPdf, disabled: !monoPath || !!busy, title: '下载译文 PDF' },
          React.createElement('span', null, '⇩'), '导出译文 PDF'),
        React.createElement('input', {
          ref: fileRef, type: 'file', accept: '.pdf,application/pdf', style: { display: 'none' },
          onChange: (e) => { const f = e.target.files && e.target.files[0]; if (f) uploadFile(f); e.target.value = ''; },
        })
      );

      let progress = null;
      if (translating) {
        const total = pageCount || 1;
        const pct = Math.min(100, Math.round((donePages / total) * 100));
        progress = React.createElement('div', { className: 'bdoc-progress' },
          React.createElement('span', null, '正在翻译 ' + Math.min(donePages, total) + ' / ' + total + ' 页'),
          React.createElement('div', { className: 'bdoc-pbar' }, React.createElement('div', { className: 'bdoc-pfill', style: { width: pct + '%' } })),
          React.createElement('span', null, pct + '%'),
          progressDetail ? React.createElement('span', { style: { fontSize: 12, color: '#64748b', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, progressDetail) : null
        );
      }

      let workspace = null;
      if (!doc) {
        workspace = React.createElement('div', { className: 'bdoc-workspace' },
          React.createElement('div', { className: 'bdoc-empty' },
            '点击「打开 PDF」选择文件，左侧显示原文，右侧自动逐页翻译成中文。'
          ));
      } else {
        const lpages = doc.pages.map((pg, i) => {
          const isCv = pdfState === 'ready';
          return React.createElement('div', {
            key: i, className: 'bdoc-lpage', 'data-page': i + 1,
            style: Object.assign({}, pageWStyle, { aspectRatio: (pg.width || 612) + ' / ' + (pg.height || 792) }),
          }, isCv ? React.createElement('canvas', { className: 'bdoc-lpage-canvas' }) : React.createElement('div', { className: 'bdoc-qa-msg bdoc-qa-assist' }, '第 ' + (i + 1) + ' 页加载中…'));
        });
        const useTpdf = tpdfState === 'ready' && tpdf && monoPath;
        let rpages;
        if (useTpdf) {
          const n = tpageCount || 0;
          rpages = [];
          for (let i = 0; i < n; i++) {
            const pg = doc.pages[Math.min(i, doc.pages.length - 1)] || { width: 612, height: 792 };
            const b64 = rpng[i + 1];
            rpages.push(React.createElement('div', {
              key: i, className: 'bdoc-lpage', 'data-page': i + 1,
              style: Object.assign({}, pageWStyle, { aspectRatio: (pg.width || 612) + ' / ' + (pg.height || 792) }),
            }, b64
              ? React.createElement('img', { className: 'bdoc-lpage-canvas', src: 'data:image/png;base64,' + b64 })
              : React.createElement('div', { className: 'bdoc-qa-msg bdoc-qa-assist' }, '第 ' + (i + 1) + ' 页渲染中…')));
          }
        } else {
          rpages = doc.pages.map((pg, i) => React.createElement('div', {
            key: i, className: 'bdoc-lpage',
            style: Object.assign({}, pageWStyle, { aspectRatio: (pg.width || 612) + ' / ' + (pg.height || 792) }),
          }, React.createElement('div', { className: 'bdoc-qa-msg bdoc-qa-assist' }, '第 ' + (i + 1) + ' 页（翻译后显示）')));
        }
        const tgl = React.createElement('button', { className: syncScroll ? 'bdoc-tgl bdoc-tgl-on' : 'bdoc-tgl', onClick: toggleSyncScroll, title: '左右滚动同步' },
          React.createElement('span', { className: 'dot' }, '✓'), '同步滚动');
        const zoomBtns = React.createElement(React.Fragment, null,
          React.createElement('button', { className: zoom === '100' ? 'bdoc-zoombtn bdoc-zoombtn-on' : 'bdoc-zoombtn', onClick: () => setZoomMode('100'), title: '实际大小' }, '100%'),
          React.createElement('button', { className: zoom === 'fit' ? 'bdoc-zoombtn bdoc-zoombtn-on' : 'bdoc-zoombtn', onClick: () => setZoomMode('fit'), title: '适合宽度' }, '适合宽度')
        );
        const footL = React.createElement('div', { className: 'bdoc-card-foot' },
          React.createElement('button', { className: 'bdoc-navbtn', disabled: pidx === 0, onClick: () => scrollToPage(pidx - 1, 'left') }, '‹'),
          React.createElement('button', { className: 'bdoc-navbtn', disabled: pidx >= pageCount - 1, onClick: () => scrollToPage(pidx + 1, 'left') }, '›'),
          React.createElement('span', { className: 'bdoc-chip' }, (pidx + 1) + ' / ' + pageCount),
          React.createElement('span', { style: { marginLeft: 'auto', color: '#94a3b8' } }, '⊖  ⊕  ⊕  ⋮')
        );
        const footR = React.createElement('div', { className: 'bdoc-card-foot' },
          React.createElement('button', { className: 'bdoc-navbtn', disabled: rpidx === 0, onClick: () => scrollToPage(rpidx - 1, 'right') }, '‹'),
          React.createElement('button', { className: 'bdoc-navbtn', disabled: rpidx >= rpageTotal - 1, onClick: () => scrollToPage(rpidx + 1, 'right') }, '›'),
          React.createElement('span', { className: 'bdoc-chip' }, (rpidx + 1) + ' / ' + rpageTotal),
          React.createElement('span', { style: { marginLeft: 'auto', color: '#94a3b8' } }, '⊖  ⊕  ⊕  ⋮')
        );
        const cardL = React.createElement('div', { className: 'bdoc-card' },
          React.createElement('div', { className: 'bdoc-card-head' },
            React.createElement('span', { className: 'bdoc-card-title' }, '▣ 原文 PDF'),
            React.createElement('span', { className: 'bdoc-chip' }, (pidx + 1) + ' / ' + pageCount),
            tgl, zoomBtns),
          React.createElement('div', { className: 'bdoc-card-scroll', ref: leftScrollRef, onScroll: handleLeftScroll }, lpages),
          footL);
        const cardR = React.createElement('div', { className: 'bdoc-card' },
          React.createElement('div', { className: 'bdoc-card-head' },
            React.createElement('span', { className: 'bdoc-card-title' }, '▣ 译文 PDF'),
            React.createElement('span', { className: 'bdoc-chip' }, (rpidx + 1) + ' / ' + rpageTotal),
            tgl, zoomBtns),
          React.createElement('div', { className: 'bdoc-card-scroll', ref: rightScrollRef, onScroll: handleRightScroll }, rpages),
          footR);
        workspace = React.createElement('div', { className: 'bdoc-workspace' }, cardL, cardR);
      }

      const qaMsgs = qa.map((m, i) => React.createElement('div', {
        key: i, className: m.role === 'user' ? 'bdoc-qa-msg bdoc-qa-user' : 'bdoc-qa-msg bdoc-qa-assist',
      }, m.text, m.model && m.role === 'assistant' ? React.createElement('div', { className: 'bdoc-qa-model' }, 'via ' + m.model) : null));
      if (qaBusy) qaMsgs.push(React.createElement('div', { key: 'busy', className: 'bdoc-qa-msg bdoc-qa-assist' }, '思考中…'));
      const qaBox = React.createElement('div', { className: 'bdoc-qa' },
        React.createElement('div', { className: 'bdoc-qa-head' },
          React.createElement('span', null, '● 询问本文档'),
          React.createElement('span', { className: 'sp' }),
          React.createElement('button', { onClick: toggleQa, title: qaCollapsed ? '展开' : '收起' }, qaCollapsed ? '⌄' : '⌃')),
        qaCollapsed ? null : React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'bdoc-qa-hist' }, qaMsgs),
          React.createElement('div', { className: 'bdoc-qa-input-row' },
            React.createElement('input', {
              className: 'bdoc-qa-input', placeholder: '例如：这篇论文提出了什么模型？', value: qaInput,
              onChange: (e) => setQaInput(e.target.value),
              onKeyDown: (e) => { if (e.key === 'Enter') sendQa(); },
              disabled: qaBusy,
            }),
            React.createElement('button', { className: 'bdoc-qa-send', onClick: sendQa, disabled: qaBusy || !qaInput.trim() || !doc }, '发送')
          ),
          React.createElement('div', { className: 'bdoc-qa-disc' }, '文档问答基于所选问答模型，回答内容可能不完全准确，请结合原文核对。'))
      );

      const drawer = drawerOpen ? React.createElement('div', { className: 'bdoc-drawer' },
        React.createElement('div', { className: 'bdoc-drawer-head' },
          React.createElement('span', null, '设置'),
          React.createElement('span', { className: 'sp' }),
          React.createElement('button', { onClick: toggleDrawer, title: '关闭' }, '×')),
        React.createElement('div', { className: 'bdoc-field' },
          React.createElement('label', null, 'API Base URL  ⓘ'),
          React.createElement('input', { value: tcfg.baseUrl, onChange: (e) => onCfgChange('baseUrl', e.target.value) })),
        React.createElement('div', { className: 'bdoc-field' },
          React.createElement('label', null, 'API Key  ⓘ（必填，你自己的密钥）'),
          React.createElement('input', { type: 'password', placeholder: '粘贴你的 OpenCode Go API Key', value: tcfg.apiKey, onChange: (e) => onCfgChange('apiKey', e.target.value) })),
        React.createElement('div', { className: 'bdoc-field' },
          React.createElement('label', null, '翻译模型'),
          React.createElement('select', { value: tcfg.model, onChange: (e) => onCfgChange('model', e.target.value) },
            OC_MODELS.map((m) => React.createElement('option', { key: m.id, value: m.id }, m.label)))),
        React.createElement('div', { className: 'bdoc-field' },
          React.createElement('label', null, '目标语言'),
          React.createElement('select', { value: target, onChange: (e) => onTargetChange(e.target.value) },
            Object.keys(TARGETS).map((k) => React.createElement('option', { key: k, value: k }, TARGETS[k])))),
        React.createElement('div', { className: 'bdoc-field' },
          React.createElement('label', null, '问答模型'),
          React.createElement('select', { value: qaModel.provider, onChange: (e) => onQaProviderChange(e.target.value) },
            qaModels.map((m) => React.createElement('option', { key: m.provider, value: m.provider }, m.provider))),
          React.createElement('select', { value: qaModel.model, onChange: (e) => onQaModelChange(e.target.value), style: { marginTop: 6 } },
            (qaModels.find((m) => m.provider === qaModel.provider) || { models: [] }).models.map((m) => React.createElement('option', { key: m.id, value: m.id }, m.label || m.id)))),
        React.createElement('hr', null),
        React.createElement('div', { className: 'bdoc-more', onClick: toggleMore },
          React.createElement('span', null, '更多设置'),
          React.createElement('span', null, moreOpen ? '⌃' : '⌄')),
        moreOpen ? React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'bdoc-field' },
            React.createElement('label', null, '系统提示词（可选）'),
            React.createElement('textarea', { placeholder: '自定义翻译提示词（留空使用 BabelDOC 默认）', value: tcfg.customPrompt || '', onChange: (e) => onCfgChange('customPrompt', e.target.value) })),
          React.createElement('button', { className: 'bdoc-tbtn', style: { marginTop: 10, color: '#d93026', borderColor: '#fb7185' }, onClick: clearAllCache, disabled: !!busy }, '🧹 清空缓存'),
          React.createElement('button', { className: 'bdoc-tbtn', style: { marginTop: 8 }, onClick: runEnvCheck }, '🔍 环境检查'),
          React.createElement('button', { className: 'bdoc-tbtn', style: { marginTop: 8 }, onClick: runInstallDeps, disabled: depsBusy }, depsBusy ? '⏳ 正在安装依赖…' : '⚙ 一键安装缺失依赖'),
          depsReport ? React.createElement('div', { className: 'bdoc-envreport' }, depsReport) : null,
          envReport ? React.createElement('div', { className: 'bdoc-envreport' }, envReport) : null
        ) : null
      ) : null;

      return React.createElement('div', { className: 'bdoc-panel' },
        appbar, toolbar,
        error ? React.createElement('div', { className: 'bdoc-err' }, '⚠ ' + error) : null,
        renderErr && !error ? React.createElement('div', { className: 'bdoc-err' }, '⚠ 译文渲染失败：' + renderErr) : null,
        progress, workspace, qaBox, drawer
      );
    }

    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register(
      { name: 'conversation.session.header.actions', id: 'babeldoc-open', order: 30, label: '双语PDF' },
      () => {
        useTick();
        return React.createElement('button',
          { className: 'bdoc-open-btn', onClick: () => { store.open = !store.open; emit(); }, title: '打开 PDF 双语阅读器' },
          '📄 双语PDF');
      }
    ));

    ctx.slots.inject('shell.overlay', () => ctx.slots.register(
      { name: 'shell.overlay', id: 'babeldoc-viewer', order: 0, label: '双语PDF' },
      () => {
        useTick();
        return React.createElement('div', { style: { display: store.open ? 'block' : 'none' } },
          React.createElement(Viewer, { onClose: () => { store.open = false; emit(); } })
        );
      }
    ));
    }

    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  },
});
