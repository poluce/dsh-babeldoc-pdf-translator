window.__ModuleLoader__.load({
  id: 'dsh-babeldoc-pdf-translator',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

    const NS = 'babeldoc';
    const PANEL_ID = 'babeldoc';
    const API = '/babeldoc/api';
    const LS_KEY = 'babeldoc.prefs.v2';
    const LAST_DOC_KEY = 'babeldoc.lastDoc';
    const CLIENT_TAG = '[babeldoc]';
    const CLIENT_VERSION = '2026-11-24.1';

    const DEFAULTS = {
      provider: 'commandcode',
      dshModel: 'deepseek/deepseek-v4.1-flash',
      langOut: 'zh',
      customPrompt: '',
      syncScroll: true,
      autoTranslate: true,
      qps: 16,
      batchSize: 8,
      parallel: 3,
    };
    const PREFS_VERSION = 3;

    const TARGET_LANGS = [
      ['zh', '中文'],
      ['en', 'English'],
      ['ja', '日本語'],
      ['ko', '한국어'],
      ['de', 'Deutsch'],
      ['fr', 'Français'],
      ['es', 'Español'],
      ['ru', 'Русский'],
      ['pt', 'Português'],
      ['it', 'Italiano'],
    ];


    const TARGETS = {
      en: 'English',
      zh: '简体中文',
      'zh-TW': '繁體中文',
      ja: '日本語',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      ko: '한국어',
      ru: 'Русский',
    };

    const DICT = {
      en: {
        panel: 'Bilingual PDF',
        open: 'Open PDF',
        translatePage: 'Translate page',
        translateAll: 'Translate all',
        stop: 'Stop',
        exportPdf: 'Export',
        settings: 'Settings',
        close: 'Close',
        original: 'Original',
        translated: 'Translation',
        pageOf: 'Page {page} / {total}',
        emptyTitle: 'Open a PDF to start',
        emptyHint: 'Pick a PDF, translate page by page, and read the original beside the translation. Use a DSH model or the free built-in channel.',
        recent: 'Recent documents',
        untranslated: 'Not translated yet',
        translating: 'Translating…',
        translatingProgress: 'Translating · {done}/{total} done',
        translatingPage: 'Translating {page} · {done}/{total}',
        notReady: 'Python dependencies are missing',
        notReadyHint: 'Install the BabelDOC environment once; it lives inside the plugin data directory.',
        install: 'Install dependencies',
        installing: 'Installing dependencies…',
        envReady: 'Python ready',
        check: 'Check environment',
        clearCache: 'Clear page cache',
        clearCacheDone: 'Cache cleared',
        removeDoc: 'Remove document',
        model: 'Translation model',
        provider: 'Provider',
        dshModel: 'Model',
        dshHint: 'Translation runs on the model configured in DSH and consumes that account quota.',
        selectModel: 'Select model',
        refreshModels: 'Refresh model list',
        refreshing: 'Refreshing…',
        noModels: 'No model discovered for this channel; type a model id directly.',
        recentEmpty: 'No documents opened yet',
        featBilingual: 'Bilingual view',
        featResume: 'Per-page cache',
        featQa: 'Document Q&A',
        dropHint: 'Drop the PDF to open it',
        noDshModel: 'No DSH model found; use a custom API instead.',
        translateShort: 'Translate',
        allShort: 'All',
        menu: 'Menu',
        backToList: 'Document list',
        langOut: 'Target language',
        customPrompt: 'Custom system prompt',
        customPromptHint: 'Leave empty to use BabelDOC defaults',
        parallel: 'Parallel batches',
        batchSize: 'Pages per batch',
        qps: 'Requests per second',
        syncScroll: 'Synchronize scrolling',
        autoTranslate: 'Auto-translate the whole document on open',
        status: 'Status',
        queued: 'Queued…',
        running: 'Translating…',
        done: 'Translation finished',
        failed: 'Translation failed',
        cancelled: 'Translation stopped',
        qaTitle: 'Ask this document',
        ask: 'Ask',
        asking: 'Thinking…',
        qaPlaceholder: 'Ask something about the document',
        qaEmpty: 'Answers cite the source page like [P3].',
        deleteConfirm: 'Remove this document and its cached pages?',
        needKey: 'Choose a DSH model or fill in the custom API settings.',
        needDoc: 'Open a PDF first.',
        openFailed: 'Could not open the PDF',
        uploadTooBig: 'The PDF is too large',
        noTranslated: 'Nothing to export yet',
        page: 'Page',
        prev: 'Previous page',
        next: 'Next page',
        jumpPage: 'Jump to page',
        docPages: '{pages} pages',
        pageUnit: 'pages',
        translatedUnit: 'translated',
        logDetail: 'Progress',
      },
      zh: {
        panel: '双语 PDF',
        open: '打开 PDF',
        translatePage: '翻译本页',
        translateAll: '翻译全部',
        stop: '停止',
        exportPdf: '导出',
        settings: '设置',
        close: '关闭',
        original: '原文',
        translated: '译文',
        pageOf: '第 {page} / {total} 页',
        emptyTitle: '打开一个 PDF 开始阅读',
        emptyHint: '选一个 PDF，逐页翻译后左右对照阅读；可以用 DSH 模型或内置免费翻译。',
        recent: '最近打开',
        untranslated: '尚未翻译',
        translating: '翻译中…',
        translatingProgress: '正在翻译中 · 已完成 {done}/{total}',
        translatingPage: '正在翻译{page} · 已完成 {done}/{total}',
        notReady: 'Python 依赖未就绪',
        notReadyHint: '首次使用需要安装一次 BabelDOC 环境，安装在插件自己的数据目录内。',
        install: '安装依赖',
        installing: '正在安装依赖…',
        envReady: 'Python 就绪',
        check: '环境检查',
        clearCache: '清空页面缓存',
        clearCacheDone: '缓存已清空',
        removeDoc: '移除文档',
        model: '翻译模型',
        provider: '服务商',
        dshModel: '模型',
        dshHint: '使用 DSH 中配置的模型翻译，会消耗对应账号的额度。',
        selectModel: '选择模型',
        refreshModels: '刷新模型列表',
        refreshing: '刷新中…',
        noModels: '该渠道没有发现模型，可直接输入模型 ID。',
        recentEmpty: '还没有打开过文档',
        featBilingual: '双语对照',
        featResume: '逐页缓存 · 断点续翻',
        featQa: '文档问答',
        dropHint: '松开即可打开 PDF',
        noDshModel: '没有可用的 DSH 模型，请改用自定义 API。',
        translateShort: '翻译',
        allShort: '全部',
        menu: '菜单',
        backToList: '文档列表',
        langOut: '目标语言',
        customPrompt: '自定义系统提示词',
        customPromptHint: '留空使用 BabelDOC 默认提示词',
        parallel: '并行批次数',
        batchSize: '每批页数',
        qps: '每秒请求数',
        syncScroll: '同步滚动',
        autoTranslate: '打开文档后自动翻译整本',
        status: '状态',
        queued: '排队中…',
        running: '翻译中…',
        done: '翻译完成',
        failed: '翻译失败',
        cancelled: '已停止',
        qaTitle: '文档问答',
        ask: '提问',
        asking: '思考中…',
        qaPlaceholder: '就这份文档提一个问题',
        qaEmpty: '回答会以 [P3] 的形式标注来源页码。',
        deleteConfirm: '移除本文档及其页面缓存？',
        needKey: '请先选择 DSH 模型，或填写自定义 API 配置。',
        needDoc: '请先打开一个 PDF。',
        openFailed: '打开 PDF 失败',
        uploadTooBig: 'PDF 文件过大',
        noTranslated: '还没有可导出的译文',
        page: '页码',
        prev: '上一页',
        next: '下一页',
        jumpPage: '跳转页码',
        docPages: '{pages} 页',
        pageUnit: '页',
        translatedUnit: '已译',
        logDetail: '进度',
      },
    };

    let t = (key) => key;

    function loadPrefs() {
      try {
        const raw = window.localStorage.getItem(LS_KEY);
        const stored = raw ? JSON.parse(raw) : {};
        const prefs = { ...DEFAULTS, ...stored };
        if (stored.version !== PREFS_VERSION) {
          prefs.provider = 'commandcode';
          prefs.dshModel = 'deepseek/deepseek-v4.1-flash';
          prefs.qps = 16;
          prefs.batchSize = 8;
          prefs.parallel = 3;
          if (prefs.autoTranslate === undefined) prefs.autoTranslate = true;
          prefs.version = PREFS_VERSION;
        }
        // Only the DSH model channel remains; drop settings from removed ones.
        for (const key of ['source', 'freeProvider', 'baseUrl', 'apiKey', 'model', 'langIn']) delete prefs[key];
        if (stored.version !== PREFS_VERSION) {
          try {
            window.localStorage.setItem(LS_KEY, JSON.stringify(prefs));
          } catch (error) {
            /* ignore */
          }
        }
        return prefs;
      } catch (error) {
        return { ...DEFAULTS };
      }
    }

    async function request(path, options) {
      const response = await fetch(API + path, options);
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        data = { error: text };
      }
      if (!response.ok) {
        const failure = new Error((data && data.error) || 'HTTP ' + response.status);
        failure.code = data && data.code;
        failure.probe = data && data.probe;
        throw failure;
      }
      return data;
    }

    function BabeldocIcon(props) {      const size = props && typeof props.size === 'number' ? props.size : 20;
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('rect', { x: 3.2, y: 2.6, width: 17.6, height: 18.8, rx: 3, stroke: 'currentColor', strokeWidth: 1.6 }),
        h('path', { d: 'M12 2.6v18.8', stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.5 }),
        h('path', { d: 'M5.8 7.2h3.8M5.8 10.2h3.8M5.8 13.2h3.1M5.8 16.2h3.6', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' }),
        h('path', { d: 'M14.6 7.4h3.6M14.6 10.4h3.6M14.6 13.4h2.9M14.6 16.4h3.4', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', opacity: 0.65 }),
      );
    }

    function ProgressBar(props) {
      const job = props.job;
      if (!job) return null;
      const total = Math.max(1, job.total || 1);
      const value = Math.min(100, Math.round(((job.done + job.failed) / total) * 100));
      const label =
        job.status === 'done'
          ? t('done')
          : job.status === 'error'
            ? t('failed') + (job.error ? '：' + job.error : '')
            : job.status === 'cancelled'
              ? t('cancelled')
              : (job.detail || t('running')) + ' · ' + job.done + '/' + job.total;
      return h(
        'div',
        { className: 'bdoc-progress' },
        h('span', { className: 'bdoc-pbar' }, h('span', { className: 'bdoc-pfill', style: { width: value + '%' } })),
        h('span', { style: { maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, label),
      );
    }

    function PageNav(props) {
      const { page, total, onGo, arrows = true } = props;
      const [draft, setDraft] = useState(String(page));
      useEffect(() => {
        setDraft(String(page));
      }, [page]);
      const commit = () => {
        const value = Number.parseInt(draft, 10);
        if (Number.isFinite(value)) onGo(Math.min(total, Math.max(1, value)));
        else setDraft(String(page));
      };
      return h(
        'div',
        { className: 'bdoc-navgroup' },
        arrows ? h('button', { className: 'bdoc-navbtn', type: 'button', onClick: () => onGo(page - 1), disabled: page <= 1, title: t('prev') }, '‹') : null,
        h('input', {
          className: 'bdoc-pageinput',
          type: 'text',
          inputMode: 'numeric',
          value: draft,
          title: t('jumpPage'),
          'aria-label': t('jumpPage'),
          onChange: (event) => setDraft(event.target.value.replace(/[^0-9]/g, '').slice(0, 5)),
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
              event.currentTarget.blur();
            }
          },
          onBlur: commit,
        }),
        h('span', { className: 'bdoc-pagetotal' }, '/ ' + total),
        arrows ? h('button', { className: 'bdoc-navbtn', type: 'button', onClick: () => onGo(page + 1), disabled: page >= total, title: t('next') }, '›') : null,
      );
    }

    function SettingsDrawer(props) {
      const { prefs, setPrefs, env, models, modelsBusy, onRefreshModels, onInstall, onCheck, onClearCache, onClose, onDelete } = props;
      const [prompt, setPrompt] = useState(prefs.customPrompt || '');
      const update = (patch) => setPrefs(patch);
      const envReady = env && env.ready;
      const providers = Array.isArray(models) ? models : [];
      const currentProvider = providers.find((entry) => entry.provider === prefs.provider) || providers[0] || null;
      const currentModels = currentProvider ? currentProvider.models || [] : [];
      const pickProvider = (provider) => {
        const next = providers.find((entry) => entry.provider === provider);
        update({ provider, dshModel: next && next.models[0] ? next.models[0].id : '' });
      };
      return h(
        'div',
        { className: 'bdoc-drawer' },
        h(
          'div',
          { className: 'bdoc-drawer-head' },
          h('span', null, t('settings')),
          h('span', { className: 'sp' }),
          h('button', { type: 'button', onClick: onClose, title: t('close') }, '✕'),
        ),
        h(
          'div',
          { className: 'bdoc-field' },
          h('label', null, t('provider')),
          h(
            'select',
            { value: currentProvider ? currentProvider.provider : '', onChange: (event) => pickProvider(event.target.value) },
            providers.length === 0 ? h('option', { value: '' }, '—') : null,
            providers.map((entry) => h('option', { key: entry.provider, value: entry.provider }, entry.provider)),
          ),
        ),
        h(
          'div',
          { className: 'bdoc-field' },
          h('label', null, t('dshModel')),
          h('input', {
            list: 'bdoc-dsh-models',
            value: prefs.dshModel,
            placeholder: t('selectModel'),
            onChange: (event) => update({ dshModel: event.target.value }),
          }),
          h(
            'datalist',
            { id: 'bdoc-dsh-models' },
            currentModels.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.label || entry.id)),
          ),
        ),
        h('div', { className: 'bdoc-hint' }, t('dshHint')),
        currentModels.length === 0 ? h('div', { className: 'bdoc-hint bdoc-hint-warn' }, t('noModels')) : null,
        providers.length === 0 ? h('div', { className: 'bdoc-hint bdoc-hint-warn' }, t('noDshModel')) : null,
        h(
          'button',
          { className: 'bdoc-tbtn', type: 'button', style: { marginTop: 6 }, onClick: onRefreshModels, disabled: modelsBusy },
          modelsBusy ? t('refreshing') : t('refreshModels'),
        ),
        h(
          'div',
          { className: 'bdoc-field' },
          h('label', null, t('langOut')),
          h(
            'select',
            { value: prefs.langOut, onChange: (event) => update({ langOut: event.target.value }) },
            TARGET_LANGS.map(([value, label]) => h('option', { key: value, value }, label)),
            TARGET_LANGS.some(([value]) => value === prefs.langOut) ? null : h('option', { value: prefs.langOut }, prefs.langOut),
          ),
        ),
        h(
          'div',
          { className: 'bdoc-field' },
          h('label', null, t('customPrompt')),
          h('textarea', { placeholder: t('customPromptHint'), value: prompt, onChange: (event) => { setPrompt(event.target.value); update({ customPrompt: event.target.value }); } }),
        ),
        h(
          'div',
          { className: 'bdoc-field bdoc-three' },
          h('span', null, h('label', null, t('parallel')), h('input', { type: 'number', min: 1, max: 8, value: prefs.parallel, onChange: (event) => update({ parallel: Number(event.target.value) || 1 }) })),
          h('span', null, h('label', null, t('batchSize')), h('input', { type: 'number', min: 1, max: 12, value: prefs.batchSize, onChange: (event) => update({ batchSize: Number(event.target.value) || 1 }) })),
          h('span', null, h('label', null, t('qps')), h('input', { type: 'number', min: 1, max: 32, value: prefs.qps, onChange: (event) => update({ qps: Number(event.target.value) || 1 }) })),
        ),
        h('div', { className: 'bdoc-field' },
          h('label', { className: 'bdoc-check' },
            h('input', { type: 'checkbox', checked: !!prefs.syncScroll, onChange: (event) => update({ syncScroll: event.target.checked }) }),
            h('span', null, t('syncScroll')))),
        h('div', { className: 'bdoc-field' },
          h('label', { className: 'bdoc-check' },
            h('input', { type: 'checkbox', checked: !!prefs.autoTranslate, onChange: (event) => update({ autoTranslate: event.target.checked }) }),
            h('span', null, t('autoTranslate')))),
        h('hr', null),
        h('div', { className: 'bdoc-field' },
          h('label', null, t('status')),
          h('div', { className: 'bdoc-envline' }, envReady ? '✓ ' + t('envReady') + (env.version ? ' · Python ' + env.version : '') : '⚠ ' + t('notReady')),
          h('button', { className: 'bdoc-tbtn', type: 'button', style: { marginTop: 8 }, onClick: onCheck, disabled: env && env.installing }, t('check')),
          h('button', { className: 'bdoc-tbtn bdoc-tbtn-primary', type: 'button', style: { marginTop: 8 }, onClick: onInstall, disabled: env && env.installing }, env && env.installing ? t('installing') : t('install')),
          env && env.installLog ? h('pre', { className: 'bdoc-envreport' }, env.installLog.slice(-4000)) : null,
        ),
        h('hr', null),
        h('button', { className: 'bdoc-tbtn', type: 'button', onClick: onClearCache }, t('clearCache')),
        h('button', { className: 'bdoc-tbtn bdoc-tbtn-stop', type: 'button', style: { marginTop: 8 }, onClick: () => { if (window.confirm(t('deleteConfirm'))) onDelete(); } }, t('removeDoc')),
      );
    }

    function DocList(props) {
      const { docs, onOpen, onPick, onFile, busy } = props;
      const [dragging, setDragging] = useState(false);
      const hasDocs = Array.isArray(docs) && docs.length > 0;
      const onDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        if (file && onFile) onFile(file);
      };
      const onDragLeave = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
      };
      return h(
        'div',
        {
          className: 'bdoc-welcome' + (dragging ? ' is-dragging' : ''),
          onDragOver: (event) => { event.preventDefault(); setDragging(true); },
          onDragLeave,
          onDrop,
        },
        h(
          'div',
          { className: 'bdoc-hero' },
          h('div', { className: 'bdoc-hero-icon' }, '📄'),
          h('h1', { className: 'bdoc-hero-title' }, t('emptyTitle')),
          h('p', { className: 'bdoc-hero-hint' }, t('emptyHint')),
          h(
            'div',
            { className: 'bdoc-hero-actions' },
            h('button', { className: 'bdoc-btn bdoc-btn-primary bdoc-btn-lg', type: 'button', onClick: onPick, disabled: busy }, '＋ ' + t('open')),
            hasDocs
              ? h('button', {
                  className: 'bdoc-link',
                  type: 'button',
                  onClick: () => {
                    const node = document.getElementById('bdoc-recent');
                    if (node && node.scrollIntoView) node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                  },
                }, t('recent'))
              : null,
          ),
          h(
            'div',
            { className: 'bdoc-feats' },
            h('span', null, '✓ ' + t('featBilingual')),
            h('span', null, '✓ ' + t('featResume')),
            h('span', null, '✓ ' + t('featQa')),
          ),
        ),
        h(
          'div',
          { className: 'bdoc-recent', id: 'bdoc-recent' },
          h('div', { className: 'bdoc-recent-head' }, t('recent')),
          hasDocs
            ? docs.map((doc) =>
                h(
                  'button',
                  { key: doc.id, className: 'bdoc-recent-item', type: 'button', onClick: () => onOpen(doc.id) },
                  h('span', { className: 'bdoc-recent-icon' }, '📄'),
                  h(
                    'span',
                    { className: 'bdoc-recent-body' },
                    h('span', { className: 'bdoc-recent-name', title: doc.name }, doc.name),
                    h('span', { className: 'bdoc-recent-meta' }, t('docPages', { pages: doc.pages })),
                  ),
                  h('span', { className: 'bdoc-recent-arrow' }, '›'),
                ),
              )
            : h('div', { className: 'bdoc-recent-empty' }, t('recentEmpty')),
        ),
        dragging ? h('div', { className: 'bdoc-dropmask' }, t('dropHint')) : null,
      );
    }

    function useMediaQuery(query) {
      const [matches, setMatches] = useState(() => {
        try {
          return window.matchMedia(query).matches;
        } catch (error) {
          return false;
        }
      });
      useEffect(() => {
        let media = null;
        try {
          media = window.matchMedia(query);
        } catch (error) {
          return undefined;
        }
        const onChange = (event) => setMatches(event.matches);
        if (media.addEventListener) media.addEventListener('change', onChange);
        else media.addListener(onChange);
        setMatches(media.matches);
        return () => {
          if (media.removeEventListener) media.removeEventListener('change', onChange);
          else media.removeListener(onChange);
        };
      }, [query]);
      return matches;
    }

    function BabeldocPage() {
      const [prefs, setPrefsState] = useState(loadPrefs);
      const [env, setEnv] = useState(null);
      const [docs, setDocs] = useState([]);
      const [doc, setDoc] = useState(null);
      const [job, setJob] = useState(null);
      const [error, setError] = useState('');
      const [busy, setBusy] = useState(false);
      const [drawer, setDrawer] = useState(false);
      const [page, setPage] = useState(1);
      const [chatOpen, setChatOpen] = useState(false);
      const [qa, setQa] = useState([]);
      const [qaBusy, setQaBusy] = useState(false);
      const [models, setModels] = useState([]);
      const [modelsBusy, setModelsBusy] = useState(false);
      const narrow = useMediaQuery('(max-width: 900px)');
      const [mobilePane, setMobilePane] = useState('orig');
      const [menuOpen, setMenuOpen] = useState(false);
      const fileRef = useRef(null);
      const leftRef = useRef(null);
      const rightRef = useRef(null);
      const syncing = useRef(false);
      const doneRef = useRef(0);
      const autoRef = useRef('');

      const setPrefs = useCallback((patch) => {
        setPrefsState((current) => {
          const next = { ...current, ...patch };
          try {
            window.localStorage.setItem(LS_KEY, JSON.stringify(next));
          } catch (error) {
            /* ignore storage failures */
          }
          return next;
        });
      }, []);

      const translatedMap = useMemo(() => {
        const map = new Map();
        if (doc && Array.isArray(doc.translated)) {
          for (const entry of doc.translated) map.set(entry.page, entry.v);
        }
        return map;
      }, [doc]);

      const refreshEnv = useCallback(async () => {
        try {
          const data = await request('/env/status');
          setEnv(data.env);
        } catch (failure) {
          /* host route may not be ready yet */
        }
      }, []);

      const refreshDocs = useCallback(async () => {
        try {
          const data = await request('/docs');
          setDocs(data.docs || []);
        } catch (failure) {
          /* ignore */
        }
      }, []);

      const refreshDoc = useCallback(async (id, lang) => {
        if (!id) return;
        try {
          const data = await request('/docs/' + id + '?lang=' + encodeURIComponent(lang));
          setDoc(data.doc);
        } catch (failure) {
          /* document may have been removed */
        }
      }, []);

      const loadModels = useCallback(async () => {
        setModelsBusy(true);
        try {
          const data = await request('/models');
          const providers = (data.providers || []).filter((entry) => entry && entry.provider);
          setModels(providers);
          setPrefsState((current) => {
            const target = providers.find((entry) => entry.provider === current.provider)
              || providers.find((entry) => entry.models && entry.models.length > 0)
              || providers[0];
            if (!target) return current;
            const ids = (target.models || []).map((model) => model.id);
            if (current.provider === target.provider && current.dshModel) return current;
            const next = { ...current, provider: target.provider, dshModel: ids[0] || '' };
            try {
              window.localStorage.setItem(LS_KEY, JSON.stringify(next));
            } catch (error) {
              /* ignore */
            }
            return next;
          });
        } catch (error) {
          /* keep the current list */
        } finally {
          setModelsBusy(false);
        }
      }, []);

      useEffect(() => {
        refreshEnv();
        refreshDocs();
        loadModels();
        let last = '';
        try {
          last = window.localStorage.getItem(LAST_DOC_KEY) || '';
        } catch (error) {
          last = '';
        }
        if (last) {
          request('/docs/' + last + '?lang=' + encodeURIComponent(prefs.langOut))
            .then((data) => {
              if (data.doc) setDoc(data.doc);
            })
            .catch(() => {
              try {
                window.localStorage.removeItem(LAST_DOC_KEY);
              } catch (error) {
                /* ignore */
              }
            });
        }
      }, [refreshEnv, refreshDocs, loadModels]);

      useEffect(() => {
        if (!doc) return;
        refreshDoc(doc.id, prefs.langOut);
      }, [prefs.langOut]);

      useEffect(() => {
        setMobilePane('orig');
      }, [doc && doc.id]);

      useEffect(() => {
        if (job && job.status === 'error' && job.error) setError(job.error);
      }, [job && job.status]);

      useEffect(() => {
        if (!env || !env.installing) return;
        const timer = window.setInterval(refreshEnv, 1500);
        return () => window.clearInterval(timer);
      }, [env, refreshEnv]);

      useEffect(() => {
        if (!job || (job.status !== 'running' && job.status !== 'queued')) return;
        let alive = true;
        const timer = window.setInterval(async () => {
          try {
            const data = await request('/jobs/' + job.id);
            if (!alive) return;
            setJob(data.job);
            if (data.job.done !== doneRef.current) {
              doneRef.current = data.job.done;
              if (doc) refreshDoc(doc.id, prefs.langOut);
            }
            if (data.job.status !== 'running' && data.job.status !== 'queued') {
              if (doc) refreshDoc(doc.id, prefs.langOut);
            }
          } catch (failure) {
            /* keep polling */
          }
        }, 1200);
        return () => {
          alive = false;
          window.clearInterval(timer);
        };
      }, [job && job.id, job && job.status, doc && doc.id, prefs.langOut, refreshDoc]);

      const uploadFile = useCallback(async (file) => {
        if (!file) {
          console.info(CLIENT_TAG, 'upload cancelled (no file selected)');
          return;
        }
        console.info(CLIENT_TAG, 'upload start', file.name, file.size);
        setBusy(true);
        setError('');
        try {
          const data = await request('/docs?lang=' + encodeURIComponent(prefs.langOut), {
            method: 'POST',
            headers: { 'content-type': 'application/pdf', 'x-file-name': encodeURIComponent(file.name) },
            body: file,
          });
          setDoc(data.doc);
          setPage(1);
          setJob(null);
          console.info(CLIENT_TAG, 'upload ok', data.doc.id, data.doc.pages + ' pages');
          try {
            window.localStorage.setItem(LAST_DOC_KEY, data.doc.id);
          } catch (error) {
            /* ignore */
          }
          refreshDocs();
        } catch (failure) {
          console.warn(CLIENT_TAG, 'upload failed', failure.message);
          setError(failure.message || t('openFailed'));
          if (failure.code === 'ENV_NOT_READY') setEnv(failure.probe || env);
        } finally {
          setBusy(false);
        }
      }, [prefs.langOut, refreshDocs, env]);

      const openFile = useCallback(async () => {
        const input = fileRef.current;
        if (!input) {
          console.warn(CLIENT_TAG, 'file input is not mounted');
          return;
        }
        const file = input.files && input.files[0];
        input.value = '';
        console.info(CLIENT_TAG, 'file picker result', file ? file.name : '(cancelled)');
        await uploadFile(file);
      }, [uploadFile]);

      const pickFile = useCallback(() => {
        const input = fileRef.current;
        console.info(CLIENT_TAG, 'open clicked, input mounted:', Boolean(input));
        if (input) input.click();
      }, []);

      const openDoc = useCallback(
        async (id) => {
          setBusy(true);
          setError('');
          try {
            const data = await request('/docs/' + id + '?lang=' + encodeURIComponent(prefs.langOut));
            setDoc(data.doc);
            setPage(1);
            setJob(null);
            try {
              window.localStorage.setItem(LAST_DOC_KEY, data.doc.id);
            } catch (error) {
              /* ignore */
            }
          } catch (failure) {
            setError(failure.message);
          } finally {
            setBusy(false);
          }
        },
        [prefs.langOut],
      );

      const translate = useCallback(
        async (pages) => {
          if (!doc) return;
          console.info(CLIENT_TAG, 'translate requested', Array.isArray(pages) && pages.length ? pages.join(',') : 'all');
          if (!prefs.provider || !prefs.dshModel) {
            setError(t('needKey'));
            setDrawer(true);
            return;
          }
          setError('');
          try {
            const body = {
              source: 'dsh',
              provider: prefs.provider,
              model: prefs.dshModel,
              langOut: prefs.langOut,
              customPrompt: prefs.customPrompt,
              qps: prefs.qps,
              batchSize: prefs.batchSize,
              parallel: prefs.parallel,
            };
            if (Array.isArray(pages) && pages.length) body.pages = pages;
            const data = await request('/docs/' + doc.id + '/translate', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            });
            doneRef.current = 0;
            setJob(data.job);
            refreshDoc(doc.id, prefs.langOut);
          } catch (failure) {
            console.warn(CLIENT_TAG, 'translate failed', failure.message);
            setError(failure.message);
            if (failure.code === 'ENV_NOT_READY') {
              setEnv(failure.probe || env);
              setDrawer(true);
            }
            if (failure.code === 'MODEL_UNAVAILABLE') setDrawer(true);
          }
        },
        [doc, prefs, refreshDoc, env],
      );

      const stopJob = useCallback(async () => {
        if (!job) return;
        try {
          const data = await request('/jobs/' + job.id + '/cancel', { method: 'POST' });
          setJob(data.job);
        } catch (failure) {
          setError(failure.message);
        }
      }, [job]);

      const ask = useCallback(
        async (question) => {
          if (!doc || !question.trim()) return;
          const entry = { question, answer: '', error: '' };
          setQa((current) => [...current, entry]);
          setQaBusy(true);
          try {
            const body = { question, currentPage: page };
            if (prefs.provider && prefs.dshModel) {
              body.provider = prefs.provider;
              body.model = prefs.dshModel;
            } else if (models.length && models[0].models && models[0].models.length) {
              body.provider = models[0].provider;
              body.model = models[0].models[0].id;
            }
            const data = await request('/docs/' + doc.id + '/ask', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(body),
            });
            setQa((current) => current.map((item) => (item === entry ? { ...item, answer: data.answer } : item)));
          } catch (failure) {
            setQa((current) => current.map((item) => (item === entry ? { ...item, error: failure.message } : item)));
          } finally {
            setQaBusy(false);
          }
        },
        [doc, page, models],
      );

      const installEnv = useCallback(async () => {
        setError('');
        try {
          await request('/env/install', { method: 'POST' });
          await refreshEnv();
        } catch (failure) {
          setError(failure.message);
        }
      }, [refreshEnv]);

      const goPage = useCallback(
        (target) => {
          const container = narrow && mobilePane === 'trans' ? rightRef.current : leftRef.current;
          if (!container || !doc) return;
          const clamped = Math.min(doc.pages, Math.max(1, target));
          const node = container.querySelector('[data-page="' + clamped + '"]');
          if (node && node.scrollIntoView) node.scrollIntoView({ block: 'start' });
          setPage(clamped);
        },
        [doc, narrow, mobilePane],
      );

      const onScroll = useCallback((event) => {
        const container = (event && event.currentTarget) || leftRef.current;
        if (!container || !doc) return;
        const max = Math.max(1, container.scrollHeight - container.clientHeight);
        const ratio = Math.min(1, Math.max(0, container.scrollTop / max));
        setPage(Math.min(doc.pages, Math.max(1, Math.round(ratio * (doc.pages - 1)) + 1)));
        if (narrow || !prefs.syncScroll || syncing.current) return;
        const other = container === leftRef.current ? rightRef.current : leftRef.current;
        if (!other) return;
        syncing.current = true;
        const otherMax = Math.max(0, other.scrollHeight - other.clientHeight);
        if (Math.abs(otherMax - max) < 4) {
          other.scrollTop = container.scrollTop;
        } else {
          other.scrollTop = container.scrollTop * (otherMax / max);
        }
        window.requestAnimationFrame(() => {
          syncing.current = false;
        });
      }, [doc, narrow, prefs.syncScroll]);

      const exportPdf = useCallback(() => {
        if (!doc) return;
        if (translatedMap.size === 0) {
          setError(t('noTranslated'));
          return;
        }
        const url = API + '/docs/' + doc.id + '/export?lang=' + encodeURIComponent(prefs.langOut);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.rel = 'noopener';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }, [doc, prefs.langOut, translatedMap]);

      const clearCache = useCallback(async () => {
        if (!doc) return;
        try {
          await request('/cache/clear', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: doc.id }),
          });
          await refreshDoc(doc.id, prefs.langOut);
          setError(t('clearCacheDone'));
        } catch (failure) {
          setError(failure.message);
        }
      }, [doc, prefs.langOut, refreshDoc]);

      const removeDoc = useCallback(async () => {
        if (!doc) return;
        try {
          await request('/docs/' + doc.id, { method: 'DELETE' });
          setDoc(null);
          setJob(null);
          try {
            window.localStorage.removeItem(LAST_DOC_KEY);
          } catch (error) {
            /* ignore */
          }
          refreshDocs();
        } catch (failure) {
          setError(failure.message);
        }
      }, [doc, refreshDocs]);

      const translatedCount = translatedMap.size;
      const envReady = env && env.ready;
      const canTranslate = !!doc && (!job || job.status === 'done' || job.status === 'error' || job.status === 'cancelled');

      const modelChoices = [];
      models.forEach((entry) => {
        (entry.models || []).forEach((model) => {
          modelChoices.push({
            provider: entry.provider,
            id: model.id,
            label: entry.label || entry.provider,
            modelLabel: model.label || model.id,
          });
        });
      });
      const currentChoice = modelChoices.findIndex((choice) => choice.provider === prefs.provider && choice.id === prefs.dshModel);
      const jobActive = !!job && (job.status === 'running' || job.status === 'queued');
      const pageNav = doc ? h(PageNav, { page, total: doc.pages, onGo: goPage }) : null;
      const pageNavCenter = doc ? h(PageNav, { page, total: doc.pages, onGo: goPage, arrows: false }) : null;

      useEffect(() => {
        if (!doc) autoRef.current = '';
      }, [doc && doc.id]);

      useEffect(() => {
        if (!doc || !prefs.autoTranslate) return;
        if (autoRef.current === doc.id) return;
        if (jobActive) return;
        if (translatedCount >= doc.pages) {
          autoRef.current = doc.id;
          return;
        }
        autoRef.current = doc.id;
        console.info(CLIENT_TAG, 'auto translate on open', doc.id, 'pages=' + doc.pages);
        translate(null).catch(() => {});
      }, [doc && doc.id, prefs.autoTranslate, jobActive, translatedCount, translate]);

      const banner =
        env && !env.ready
          ? h(
              'div',
              { className: 'bdoc-banner' },
              h('span', null, '⚠ ' + t('notReady') + (env.missing && env.missing.length ? '：' + env.missing.join(', ') : '')),
              h('button', { className: 'bdoc-tbtn bdoc-tbtn-primary', type: 'button', onClick: installEnv, disabled: env.installing }, env.installing ? t('installing') : t('install')),
            )
          : null;

      const pageStyle = (number) => {
        const dims = doc && Array.isArray(doc.dims) ? doc.dims : null;
        const dim = dims ? dims[number - 1] : null;
        return dim && dim.w > 0 && dim.h > 0
          ? { aspectRatio: dim.w + ' / ' + dim.h }
          : { minHeight: '240px' };
      };

      const origPages = h(
        'div',
        { className: 'bdoc-pages', ref: leftRef, onScroll },
        doc
          ? Array.from({ length: doc.pages }, (_, index) => {
              const number = index + 1;
              return h(
                'div',
                { className: 'bdoc-page', key: 'o' + number, 'data-page': number, style: pageStyle(number) },
                h('img', {
                  src: API + '/docs/' + doc.id + '/page/' + number + '?kind=orig',
                  loading: 'lazy',
                  draggable: false,
                  alt: '',
                }),
              );
            })
          : null,
      );

      const transPages = h(
        'div',
        { className: 'bdoc-pages', ref: rightRef, onScroll },
        doc
          ? Array.from({ length: doc.pages }, (_, index) => {
              const number = index + 1;
              const version = translatedMap.get(number);
              const busyPage = jobActive && Array.isArray(job.pages) && job.pages.indexOf(number) !== -1;
              return h(
                'div',
                { className: 'bdoc-page', key: 't' + number, 'data-page': number, style: pageStyle(number) },
                version
                  ? h('img', {
                      src: API + '/docs/' + doc.id + '/page/' + number + '?kind=trans&lang=' + encodeURIComponent(prefs.langOut) + '&v=' + version,
                      loading: 'lazy',
                      draggable: false,
                      alt: '',
                    })
                  : h(
                      'div',
                      { className: 'bdoc-page-missing' + (busyPage ? ' is-busy' : '') },
                      busyPage
                        ? h(React.Fragment, null, h('span', { className: 'bdoc-spinner' }), h('span', null, t('translating')))
                        : h(React.Fragment, null, h('span', null, t('untranslated')), h('button', { className: 'bdoc-tbtn', type: 'button', onClick: () => translate([number]), disabled: !!job }, t('translatePage'))),
                    ),
              );
            })
          : null,
      );

      const origPane = h(
        'div',
        { className: 'bdoc-pane' },
        h('div', { className: 'bdoc-pane-head' }, h('span', null, t('original')), h('span', { className: 'bdoc-spacer' }), h('span', { className: 'bdoc-navcenter' }, pageNavCenter)),
        origPages,
      );
      const transPane = h(
        'div',
        { className: 'bdoc-pane' },
        h(
          'div',
          { className: 'bdoc-pane-head' },
          h('span', null, t('translated')),
          h('span', { className: 'bdoc-spacer' }),
          jobActive ? h('span', { className: 'bdoc-headprog', title: job.current || job.detail || '' }, t('translatingProgress', { done: translatedCount, total: doc ? doc.pages : 0 })) : null,
        ),
        transPages,
      );

      const modelPicker = h(
        'select',
        {
          className: 'bdoc-model',
          title: t('model'),
          value: currentChoice >= 0 ? String(currentChoice) : '',
          disabled: jobActive,
          onChange: (event) => {
            const choice = modelChoices[Number(event.target.value)];
            if (choice) setPrefs({ provider: choice.provider, dshModel: choice.id });
          },
        },
        currentChoice < 0 ? h('option', { value: '' }, t('selectModel')) : null,
        models.map((entry) => h(
          'optgroup',
          { key: entry.provider, label: entry.label || entry.provider },
          (entry.models || []).length === 0
            ? h('option', { value: '', disabled: true }, t('noModels'))
            : entry.models.map((model) => {
                const index = modelChoices.findIndex((choice) => choice.provider === entry.provider && choice.id === model.id);
                return h('option', { key: entry.provider + '::' + model.id, value: String(index) }, model.label || model.id);
              }),
        )),
      );

      const tabs = doc && narrow
        ? h(
            'div',
            { className: 'bdoc-tabs' },
            h('button', { type: 'button', className: 'bdoc-tab' + (mobilePane === 'orig' ? ' is-on' : ''), onClick: () => setMobilePane('orig') },
              t('original'), h('span', { className: 'count' }, doc.pages)),
            h('button', { type: 'button', className: 'bdoc-tab' + (mobilePane === 'trans' ? ' is-on' : ''), onClick: () => setMobilePane('trans') },
              t('translated'), h('span', { className: 'count' }, translatedCount + '/' + doc.pages)),
          )
        : null;

      const body = doc
        ? narrow
          ? chatOpen
            ? h(ChatPanel, { qa, busy: qaBusy, onAsk: ask, onClose: () => setChatOpen(false), compact: true })
            : h('div', { className: 'bdoc-body bdoc-body-single' }, mobilePane === 'trans' ? transPages : origPages)
          : h(
              'div',
              { className: 'bdoc-main' },
              h('div', { className: 'bdoc-reader' }, origPane, transPane),
              chatOpen ? h(ChatPanel, { qa, busy: qaBusy, onAsk: ask, onClose: () => setChatOpen(false) }) : null,
            )
        : h(DocList, { docs, onOpen: openDoc, onPick: pickFile, onFile: uploadFile, busy });

      const menuItem = (label, action, disabled) => h(
        'button',
        { className: 'bdoc-menuitem', type: 'button', disabled: !!disabled, onClick: () => { setMenuOpen(false); action(); } },
        label,
      );

      const menu = menuOpen
        ? h(
            React.Fragment,
            null,
            h('div', { className: 'bdoc-menu-backdrop', onClick: () => setMenuOpen(false) }),
            h(
              'div',
              { className: 'bdoc-menu' },
              doc ? menuItem('＋ ' + t('open'), pickFile) : null,
              doc ? menuItem(t('translatePage'), () => translate([page]), !canTranslate) : null,
              doc ? menuItem(t('translateAll'), () => translate(null), !canTranslate) : null,
              doc ? menuItem('⇩ ' + t('exportPdf'), exportPdf, translatedCount === 0) : null,
              menuItem('⚙ ' + t('settings'), () => setDrawer(true)),
              doc ? menuItem(t('backToList'), () => { setDoc(null); setJob(null); }) : null,
            ),
          )
        : null;

      return h(
        'div',
        { className: 'bdoc-root' },
        h('input', { ref: fileRef, type: 'file', accept: 'application/pdf,.pdf', style: { display: 'none' }, onChange: openFile }),
        h(
          'div',
          { className: 'bdoc-top' },
          doc ? null : h('span', { className: 'bdoc-topname' }, t('panel')),
          doc && !narrow ? modelPicker : null,
          h('span', { className: 'bdoc-spacer' }),
          doc && !narrow && canTranslate ? h('button', { className: 'bdoc-btn bdoc-btn-primary', type: 'button', onClick: () => translate(null) }, t('translateAll')) : null,
          jobActive ? h('span', { className: 'bdoc-jobpill', title: (job.current ? job.current + ' · ' : '') + (job.detail || '') }, '● ' + job.done + '/' + (job.total || 0)) : null,
          doc && !narrow && jobActive ? h('button', { className: 'bdoc-btn bdoc-btn-danger', type: 'button', title: t('stop'), onClick: stopJob }, '■') : null,
          doc ? h('button', { className: 'bdoc-iconbtn' + (chatOpen ? ' is-on' : ''), type: 'button', title: t('qaTitle'), onClick: () => setChatOpen((value) => !value) }, '💬') : null,
          h('button', { className: 'bdoc-iconbtn', type: 'button', title: t('menu'), onClick: () => setMenuOpen((value) => !value) }, '⋯'),
        ),
        doc && narrow ? h('div', { className: 'bdoc-subbar' }, tabs, modelPicker) : null,
        banner,
        error ? h('div', { className: 'bdoc-err', onClick: () => setError('') }, '⚠ ' + error) : null,
        body,
        doc && narrow
          ? h(
              'div',
              { className: 'bdoc-footbar' },
              pageNav,
              h('span', { className: 'bdoc-spacer' }),
              canTranslate ? h('button', { className: 'bdoc-btn bdoc-btn-primary', type: 'button', onClick: () => translate([page]) }, t('translateShort')) : null,
              jobActive ? h('button', { className: 'bdoc-btn bdoc-btn-danger', type: 'button', title: t('stop'), onClick: stopJob }, '■') : null,
            )
          : null,
        menu,
        drawer ? h(SettingsDrawer, { prefs, setPrefs, env, models, modelsBusy, onRefreshModels: loadModels, onInstall: installEnv, onCheck: refreshEnv, onClearCache: clearCache, onDelete: removeDoc, onClose: () => setDrawer(false) }) : null,
      );

    }

    function ChatPanel(props) {
      const { qa, busy, onAsk, onClose, compact } = props;
      const [draft, setDraft] = useState('');
      const listRef = useRef(null);

      useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
      }, [qa, busy]);

      const submit = () => {
        const question = draft.trim();
        if (!question || busy) return;
        setDraft('');
        onAsk(question);
      };

      return h(
        'div',
        { className: 'bdoc-chat' + (compact ? ' is-compact' : '') },
        h(
          'div',
          { className: 'bdoc-chat-head' },
          h('span', null, t('qaTitle')),
          h('span', { className: 'bdoc-spacer' }),
          h('button', { className: 'bdoc-iconbtn', type: 'button', title: t('close'), onClick: onClose }, '✕'),
        ),
        h(
          'div',
          { className: 'bdoc-chat-list', ref: listRef },
          qa.length === 0 ? h('div', { className: 'bdoc-chat-empty' }, t('qaEmpty')) : null,
          qa.map((item, index) =>
            h(
              'div',
              { key: index, className: 'bdoc-chat-turn' },
              h('div', { className: 'bdoc-msg bdoc-msg-user' }, item.question),
              h('div', { className: 'bdoc-msg bdoc-msg-assist' }, item.error ? '⚠ ' + item.error : item.answer || (busy ? t('asking') : '')),
            ),
          ),
        ),
        h(
          'div',
          { className: 'bdoc-chat-compose' },
          h('textarea', {
            className: 'bdoc-chat-input',
            rows: 2,
            value: draft,
            placeholder: t('qaPlaceholder'),
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            },
          }),
          h('button', { className: 'bdoc-chat-send', type: 'button', onClick: submit, disabled: busy || !draft.trim() }, busy ? '…' : t('ask')),
        ),
      );
    }

    const CSS = [
      '.bdoc-root{position:relative;height:100%;display:flex;flex-direction:column;min-height:0;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111827);font-size:14px;font-family:Inter,"Segoe UI","Microsoft YaHei","PingFang SC",Arial,sans-serif;overflow:hidden;}',
      '.bdoc-appbar{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);flex:none;background:var(--dsw-alias-bg-layer-2,#fbfdff);}',
      '.bdoc-logo{width:28px;height:28px;border-radius:7px;background:#3b63f3;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;flex:none;}',
      '.bdoc-title{font-size:17px;font-weight:700;flex:0 0 auto;}',
      '.bdoc-toolbar{display:flex;flex-wrap:wrap;gap:8px;padding:10px 16px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);align-items:center;flex:none;}',
      '.bdoc-tbtn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);cursor:pointer;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#1f2937);white-space:nowrap;}',
      '.bdoc-tbtn:hover{border-color:#3b63f3;color:#3b63f3;}',
      '.bdoc-tbtn:disabled{opacity:.5;cursor:default;}',
      '.bdoc-tbtn-primary{background:#3b63f3;border-color:#3b63f3;color:#fff;}',
      '.bdoc-tbtn-primary:hover{opacity:.92;color:#fff;}',
      '.bdoc-tbtn-stop{border-color:#fb7185;color:#ef4444;}',
      '.bdoc-tbtn-file{border-color:#3b63f3;color:#3b63f3;}',
      '.bdoc-chip{display:inline-flex;align-items:center;padding:3px 9px;border-radius:12px;background:var(--dsw-alias-bg-layer-2,#f8fafc);border:1px solid var(--dsw-alias-border-l2,#d8e0ea);font-size:11px;color:var(--dsw-alias-label-secondary,#64748b);white-space:nowrap;}',
      '.bdoc-chip-ok{color:#15803d;border-color:#bbf7d0;background:#f0fdf4;}',
      '.bdoc-chip-warn{color:#b45309;border-color:#fde68a;background:#fffbeb;}',
      '.bdoc-pageno{font-size:12px;color:var(--dsw-alias-label-secondary,#64748b);white-space:nowrap;}',
      '.bdoc-modelsel{height:32px;max-width:240px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:12px;}',
      '.bdoc-banner{display:flex;align-items:center;gap:12px;padding:8px 16px;background:#fffbeb;border-bottom:1px solid #fde68a;color:#92400e;font-size:13px;flex:none;}',
      '.bdoc-err{padding:6px 16px;color:#b91c1c;background:#fef2f2;border-bottom:1px solid #fecaca;font-size:13px;cursor:pointer;flex:none;}',
      '.bdoc-progress{display:flex;align-items:center;gap:12px;padding:6px 16px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);font-size:12px;color:var(--dsw-alias-label-secondary,#475569);flex:none;}',
      '.bdoc-pbar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-bg-layer-3,#e9edf5);overflow:hidden;}',
      '.bdoc-pfill{display:block;height:100%;border-radius:3px;background:#3b63f3;transition:width .3s;}',
      '.bdoc-workspace{flex:1;display:flex;gap:12px;padding:10px 14px;min-height:0;}',
      '.bdoc-pane{flex:1;min-width:0;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2,#d8e0ea);border-radius:0;overflow:hidden;background:var(--dsw-alias-bg-layer-1,#fff);}',
      '.bdoc-pane-head{display:flex;align-items:center;gap:8px;height:36px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);font-weight:700;font-size:13px;background:var(--dsw-alias-bg-layer-2,#fbfdff);flex:none;position:relative;}',
      '.bdoc-navcenter{position:absolute;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;}',
      '.bdoc-headprog{font-size:12px;font-weight:600;color:#3b63f3;white-space:nowrap;}',
      '.bdoc-pages{flex:1;overflow-y:auto;padding:6px;background:var(--dsw-alias-bg-layer-2,#f8fafc);}',
      '.bdoc-page{position:relative;margin:0 auto 12px;background:#fff;border-radius:3px;box-shadow:0 1px 4px rgba(15,23,42,.08);overflow:hidden;width:100%;max-width:900px;}',
      '.bdoc-page img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:contain;}',
      '.bdoc-page-missing{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--dsw-alias-label-secondary,#94a3b8);font-size:13px;border:1px dashed var(--dsw-alias-border-l2,#d8e0ea);border-radius:6px;background:repeating-linear-gradient(45deg,#fbfdff,#fbfdff 10px,#f4f7fc 10px,#f4f7fc 20px);}',
      '.bdoc-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:40px;text-align:center;overflow-y:auto;}',
      '.bdoc-empty-title{font-size:20px;font-weight:700;}',
      '.bdoc-empty-hint{max-width:520px;color:var(--dsw-alias-label-secondary,#64748b);font-size:13px;line-height:1.6;margin:0;}',
      '.bdoc-list{width:min(720px,100%);margin-top:18px;display:flex;flex-direction:column;gap:6px;text-align:left;}',
      '.bdoc-list-title{font-size:12px;font-weight:700;color:var(--dsw-alias-label-secondary,#64748b);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;}',
      '.bdoc-doc-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);cursor:pointer;text-align:left;}',
      '.bdoc-doc-item:hover{border-color:#3b63f3;}',
      '.bdoc-doc-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;font-size:13px;}',
      '.bdoc-doc-meta{font-size:11px;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-qabar{flex:none;border-top:1px solid var(--dsw-alias-border-l2,#e5eaf1);background:var(--dsw-alias-bg-layer-2,#fbfdff);}',
      '.bdoc-qa-toggle{display:flex;align-items:center;gap:8px;width:100%;padding:8px 16px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#1f2937);}',
      '.bdoc-qa-toggle .sp{flex:1;}',
      '.bdoc-qa-body{display:flex;flex-direction:column;max-height:260px;border-top:1px solid var(--dsw-alias-border-l2,#e5eaf1);}',
      '.bdoc-qa-hist{flex:1;overflow-y:auto;padding:8px 16px;display:flex;flex-direction:column;gap:8px;}',
      '.bdoc-qa-turn{display:flex;flex-direction:column;gap:6px;}',
      '.bdoc-qa-msg{max-width:88%;padding:8px 10px;border-radius:8px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;}',
      '.bdoc-qa-user{align-self:flex-end;background:#3b63f3;color:#fff;}',
      '.bdoc-qa-assist{align-self:flex-start;background:var(--dsw-alias-bg-layer-3,#eef1f8);border:1px solid var(--dsw-alias-border-l2,#e5eaf1);}',
      '.bdoc-qa-input-row{display:flex;gap:8px;padding:8px 16px;}',
      '.bdoc-qa-input{flex:1;height:36px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2,#cfd7e4);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:13px;}',
      '.bdoc-qa-send{height:36px;padding:0 18px;border:none;border-radius:8px;background:#3b63f3;color:#fff;font-size:13px;font-weight:600;cursor:pointer;}',
      '.bdoc-qa-send:disabled{opacity:.5;}',
      '.bdoc-drawer{position:absolute;top:0;right:0;bottom:0;width:min(340px,92vw);background:var(--dsw-alias-bg-layer-2,#fbfdff);border-left:1px solid var(--dsw-alias-border-l2,#d8e0ea);box-shadow:-8px 0 24px rgba(15,23,42,.10);z-index:20;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:4px;}',
      '.bdoc-drawer-head{display:flex;align-items:center;font-size:15px;font-weight:700;margin-bottom:6px;}',
      '.bdoc-drawer-head .sp{flex:1;}',
      '.bdoc-drawer-head button{border:none;background:none;font-size:16px;cursor:pointer;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-field label{font-size:12px;font-weight:600;display:block;margin:8px 0 4px;}',
      '.bdoc-field input,.bdoc-field textarea,.bdoc-field select{width:100%;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:13px;box-sizing:border-box;}',
      '.bdoc-field textarea{height:64px;resize:vertical;}',
      '.bdoc-two{display:flex;gap:8px;}.bdoc-two>span{flex:1;}',
      '.bdoc-three{display:flex;gap:8px;}.bdoc-three>span{flex:1;}',
      '.bdoc-check{display:flex;align-items:center;gap:8px;font-weight:600;}',
      '.bdoc-check input{width:auto;margin:0;}',
      '.bdoc-envline{font-size:12px;color:var(--dsw-alias-label-secondary,#475569);}',
      '.bdoc-hint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary,#64748b);margin:2px 0 4px;}',
      '.bdoc-hint-warn{color:#b45309;}',
      '.bdoc-envreport{font-size:10px;font-family:Consolas,Menlo,monospace;color:#334155;background:var(--dsw-alias-bg-layer-1,#f8fafc);border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:8px;padding:8px;white-space:pre-wrap;word-break:break-all;margin-top:8px;max-height:180px;overflow:auto;}',
      '.bdoc-drawer hr{border:none;border-top:1px solid var(--dsw-alias-border-l2,#e5eaf1);margin:10px 0;}',
      '.bdoc-status{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600;white-space:nowrap;}',
      '.bdoc-status.is-ok{color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;}',
      '.bdoc-status.is-bad{color:#b45309;background:#fffbeb;border:1px solid #fde68a;}',
      '.bdoc-status-dot{width:6px;height:6px;border-radius:50%;background:currentColor;}',
      '.bdoc-docrow{display:flex;align-items:center;gap:10px;padding:8px 14px 0;flex:none;}',
      '.bdoc-docmeta{min-width:0;display:flex;flex-direction:column;gap:1px;}',
      '.bdoc-docname{font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}',
      '.bdoc-docsub{font-size:11px;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);flex:none;}',
      '.bdoc-spacer{flex:1;}',
      '.bdoc-navgroup{display:inline-flex;align-items:center;height:34px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);overflow:hidden;}',
      '.bdoc-navbtn{width:30px;height:32px;border:none;background:none;cursor:pointer;font-size:16px;color:inherit;line-height:1;}',
      '.bdoc-navbtn:disabled{opacity:.35;cursor:default;}',
      '.bdoc-navlabel{min-width:54px;text-align:center;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#475569);}',
      '.bdoc-pageinput{width:40px;height:26px;border:none;border-radius:6px;background:transparent;text-align:center;font-size:12px;font-weight:700;color:inherit;font-family:inherit;padding:0;}',
      '.bdoc-pageinput:focus{outline:none;background:var(--dsw-alias-bg-layer-3,#eef1f6);}',
      '.bdoc-pagetotal{font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#475569);margin-right:2px;}',
      '.bdoc-pane-head .bdoc-navgroup{height:28px;border:none;background:transparent;gap:0;}',
      '.bdoc-pane-head .bdoc-navbtn{height:26px;width:22px;font-size:14px;}',
      '.bdoc-pane-head .bdoc-pageinput{width:26px;height:24px;font-size:12px;}',
      '.bdoc-pane-head .bdoc-pagetotal{font-size:12px;margin:0;}',
      '.bdoc-model{height:34px;flex:1 1 130px;min-width:110px;max-width:220px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:12px;}',
      '.bdoc-btn{height:34px;padding:0 14px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;}',
      '.bdoc-btn-primary{background:#3b63f3;border-color:#3b63f3;color:#fff;}',
      '.bdoc-btn-primary:hover{opacity:.92;}',
      '.bdoc-btn-danger{border-color:#fecaca;color:#dc2626;background:#fff;}',
      '.bdoc-btn:disabled{opacity:.5;cursor:default;}',
      '.bdoc-ghost{height:34px;padding:0 10px;border:1px solid transparent;border-radius:9px;background:transparent;color:#3b63f3;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;}',
      '.bdoc-ghost:hover{background:#eef4ff;}',
      '.bdoc-ghost:disabled{opacity:.5;cursor:default;}',
      '.bdoc-iconbtn{width:34px;height:34px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:9px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;}',
      '.bdoc-iconbtn:hover{border-color:#3b63f3;color:#3b63f3;}',
      '.bdoc-iconbtn.is-on{background:#eef4ff;border-color:#3b63f3;color:#3b63f3;}',
      '.bdoc-jobpill{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 9px;border-radius:999px;background:#eef4ff;color:#3b63f3;font-size:11px;font-weight:700;white-space:nowrap;}',
      '.bdoc-main{flex:1;display:flex;gap:0;padding:0;min-height:0;}',
      '.bdoc-reader{flex:1;min-width:0;display:flex;gap:0;padding:0;}',
      '.bdoc-chat{width:340px;flex:none;display:flex;flex-direction:column;min-height:0;border-left:1px solid var(--dsw-alias-border-l2,#e5eaf1);background:var(--dsw-alias-bg-layer-1,#fff);}',
      '.bdoc-chat.is-compact{width:100%;flex:1;border-left:none;}',
      '.bdoc-chat-head{display:flex;align-items:center;gap:8px;height:36px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);font-size:13px;font-weight:700;flex:none;}',
      '.bdoc-chat-list{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;}',
      '.bdoc-chat-empty{color:var(--dsw-alias-label-secondary,#94a3b8);font-size:12px;line-height:1.6;text-align:center;padding:24px 10px;}',
      '.bdoc-chat-turn{display:flex;flex-direction:column;gap:6px;}',
      '.bdoc-msg{max-width:92%;padding:8px 10px;border-radius:10px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;}',
      '.bdoc-msg-user{align-self:flex-end;background:#3b63f3;color:#fff;border-bottom-right-radius:4px;}',
      '.bdoc-msg-assist{align-self:flex-start;background:var(--dsw-alias-bg-layer-3,#eef1f8);border:1px solid var(--dsw-alias-border-l2,#e5eaf1);border-bottom-left-radius:4px;}',
      '.bdoc-chat-compose{display:flex;align-items:flex-end;gap:8px;padding:10px;border-top:1px solid var(--dsw-alias-border-l2,#e5eaf1);flex:none;}',
      '.bdoc-chat-input{flex:1;resize:none;min-height:40px;max-height:140px;padding:10px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:13px;font-family:inherit;line-height:1.5;}',
      '.bdoc-chat-send{height:40px;padding:0 18px;border:none;border-radius:10px;background:#3b63f3;color:#fff;font-size:13px;font-weight:600;cursor:pointer;}',
      '.bdoc-chat-send:disabled{opacity:.5;cursor:default;}',
      '.bdoc-empty-icon{width:56px;height:56px;border-radius:16px;background:var(--dsw-alias-bg-layer-3,#eef4ff);display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:4px;}',
      '.bdoc-welcome{flex:1;position:relative;display:flex;align-items:center;justify-content:center;gap:48px;padding:36px 48px;overflow:auto;}',
      '.bdoc-hero{flex:1;max-width:460px;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:10px;}',
      '.bdoc-hero-icon{width:52px;height:52px;border-radius:15px;background:#eef4ff;display:flex;align-items:center;justify-content:center;font-size:24px;}',
      '.bdoc-hero-title{margin:0;font-size:26px;line-height:1.25;font-weight:800;letter-spacing:-.01em;}',
      '.bdoc-hero-hint{margin:0;font-size:14px;line-height:1.7;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-hero-actions{display:flex;align-items:center;gap:14px;margin-top:8px;}',
      '.bdoc-btn-lg{height:42px;padding:0 22px;font-size:14px;border-radius:11px;}',
      '.bdoc-link{border:none;background:none;padding:0;font-size:13px;font-weight:600;color:#3b63f3;cursor:pointer;}',
      '.bdoc-feats{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:8px;font-size:12px;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-recent{flex:1;max-width:430px;min-width:0;display:flex;flex-direction:column;gap:8px;}',
      '.bdoc-recent-head{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-secondary,#94a3b8);}',
      '.bdoc-recent-item{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:12px;background:var(--dsw-alias-bg-layer-1,#fff);cursor:pointer;text-align:left;color:inherit;}',
      '.bdoc-recent-item:hover{border-color:#3b63f3;box-shadow:0 2px 10px rgba(59,99,243,.1);}',
      '.bdoc-recent-icon{font-size:17px;}',
      '.bdoc-recent-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}',
      '.bdoc-recent-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.bdoc-recent-meta{font-size:11px;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-recent-arrow{font-size:16px;color:#94a3b8;}',
      '.bdoc-recent-empty{border:1px dashed var(--dsw-alias-border-l2,#d8e0ea);border-radius:12px;padding:22px;text-align:center;font-size:12px;color:#94a3b8;}',
      '.bdoc-page-missing.is-busy{color:#3b63f3;background:repeating-linear-gradient(45deg,#f5f8ff,#f5f8ff 10px,#eef3ff 10px,#eef3ff 20px);}',
      '.bdoc-spinner{width:26px;height:26px;border-radius:50%;border:3px solid #c7d4f5;border-top-color:#3b63f3;animation:bdoc-spin .8s linear infinite;}',
      '@keyframes bdoc-spin{to{transform:rotate(360deg);}}',
      '.bdoc-dropmask{position:absolute;inset:14px;border:2px dashed #3b63f3;border-radius:16px;background:rgba(59,99,243,.06);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#3b63f3;pointer-events:none;}',
      '.bdoc-pill{display:inline-flex;align-items:center;height:30px;padding:0 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,#f8fafc);border:1px solid var(--dsw-alias-border-l2,#e2e8f0);font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-body{flex:1;display:flex;gap:10px;padding:8px 14px 10px;min-height:0;}',
      '.bdoc-body-single{flex-direction:column;gap:0;padding:6px 8px;}',
      '.bdoc-tabs{display:flex;gap:3px;padding:3px;margin:8px 4px;background:var(--dsw-alias-bg-layer-3,#eef1f6);border-radius:10px;flex:none;}',
      '.bdoc-tab{flex:1;height:32px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#64748b);font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;}',
      '.bdoc-tab.is-on{background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111827);box-shadow:0 1px 2px rgba(15,23,42,.08);}',
      '.bdoc-tab .count{font-size:11px;opacity:.6;}',
      '.bdoc-body-single .bdoc-pages{flex:1;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:12px;background:var(--dsw-alias-bg-layer-2,#f8fafc);}',
      '.bdoc-top{display:flex;align-items:center;gap:8px;padding:8px 12px;min-height:48px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);flex:none;background:var(--dsw-alias-bg-layer-1,#fff);}',
      '.bdoc-top .bdoc-btn{height:32px;padding:0 12px;font-size:12px;border-radius:8px;}',
      '.bdoc-top .bdoc-iconbtn{width:32px;height:32px;font-size:13px;}',
      '.bdoc-top .bdoc-model{height:32px;flex:0 0 auto;max-width:200px;margin-left:4px;}',
      '.bdoc-topname{font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;min-width:0;max-width:280px;}',
      '.bdoc-dot{width:7px;height:7px;border-radius:50%;flex:none;background:#94a3b8;}',
      '.bdoc-dot.is-ok{background:#22c55e;}',
      '.bdoc-dot.is-bad{background:#f59e0b;}',
      '.bdoc-subbar{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);flex:none;background:var(--dsw-alias-bg-layer-1,#fff);}',
      '.bdoc-subbar .bdoc-tabs{flex:1;margin:0;}',
      '.bdoc-subbar .bdoc-model{flex:0 0 auto;max-width:130px;}',
      '.bdoc-footbar{display:flex;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l2,#e5eaf1);background:var(--dsw-alias-bg-layer-1,#fff);flex:none;}',
      '.bdoc-menu-backdrop{position:absolute;inset:0;z-index:40;}',
      '.bdoc-menu{position:absolute;top:48px;right:10px;z-index:41;min-width:180px;padding:6px;display:flex;flex-direction:column;gap:2px;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:12px;box-shadow:0 12px 32px rgba(15,23,42,.16);}',
      '.bdoc-menuitem{display:flex;align-items:center;height:40px;padding:0 12px;border:none;background:none;border-radius:8px;font-size:13px;font-weight:600;color:inherit;text-align:left;cursor:pointer;white-space:nowrap;}',
      '.bdoc-menuitem:hover{background:var(--dsw-alias-bg-layer-2,#f1f5f9);}',
      '.bdoc-menuitem:disabled{opacity:.4;cursor:default;}',
      '.bdoc-lbl-short{display:none;}',
      '.bdoc-mtabs{display:flex;gap:6px;flex:none;padding:2px 2px 4px;}',
      '.bdoc-mtab{flex:1;height:36px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#fff);font-size:13px;font-weight:600;color:inherit;cursor:pointer;}',
      '.bdoc-mtab-on{background:#3b63f3;border-color:#3b63f3;color:#fff;}',
      '@media (max-width:900px){',
      '.bdoc-appbar{padding:8px 12px;gap:8px;}',
      '.bdoc-title{font-size:15px;}',
      '.bdoc-docrow{padding:8px 10px 0;}',
      '.bdoc-docname{font-size:13px;}',
      '.bdoc-controls{padding:8px 10px;gap:6px;}',
      '.bdoc-btn{height:34px;padding:0 10px;font-size:12px;}',
      '.bdoc-ghost{padding:0 8px;font-size:12px;}',
      '.bdoc-model{max-width:150px;}',
      '.bdoc-body{padding:0;}',
      '.bdoc-body-single{padding:6px 6px 4px;}',
      '.bdoc-top{padding:8px 10px;min-height:42px;}',
      '.bdoc-subbar{padding:6px 8px;}',
      '.bdoc-footbar{padding:8px 10px;}',
      '.bdoc-menu{top:46px;right:8px;}',
      '.bdoc-toolbar{gap:6px;padding:8px 10px;}',
      '.bdoc-tbtn{height:34px;padding:0 10px;font-size:12px;border-radius:9px;}',
      '.bdoc-tbtn-file .bdoc-lbl{display:inline;}',
      '.bdoc-ic{font-size:13px;}',
      '.bdoc-lbl{display:none;}',
      '.bdoc-lbl-full{display:none;}',
      '.bdoc-lbl-short{display:inline;}',
      '.bdoc-docname{max-width:110px!important;font-size:12px;}',
      '.bdoc-chip-pages,.bdoc-chip-count{display:none;}',
      '.bdoc-modelsel{max-width:118px;height:30px;font-size:11px;padding:0 6px;}',
      '.bdoc-pageno{font-size:11px;}',
      '.bdoc-workspace{padding:6px;}',
      '.bdoc-workspace-narrow{flex-direction:column;gap:0;}',
      '.bdoc-pages{padding:6px;}',
      '.bdoc-page{max-width:100%;}',
      '.bdoc-qa-body{max-height:180px;}',
      '.bdoc-drawer{width:min(320px,94vw);}',
      '.bdoc-banner{padding:6px 10px;font-size:12px;}',
      '.bdoc-progress{padding:4px 10px;}',
      '}',
      '@media (max-height:520px){',
      '.bdoc-qabar{display:none;}',
      '.bdoc-top{min-height:40px;padding:6px 10px;}',
      '.bdoc-subbar{padding:4px 8px;}',
      '.bdoc-footbar{padding:6px 10px;}',
      '.bdoc-body-single{padding:4px 6px;}',
      '.bdoc-welcome{flex-direction:column;align-items:stretch;justify-content:flex-start;gap:26px;padding:22px 16px 32px;}',
      '.bdoc-hero{max-width:none;}',
      '.bdoc-hero-title{font-size:21px;}',
      '.bdoc-recent{max-width:none;}',
      '}',
    ].join('\n');

    function injectStyles(css) {
      const tagId = 'babeldoc-pdf/styles';
      if (typeof document === 'undefined') return () => {};
      if (document.querySelector('style[data-plugin-css="' + tagId + '"]')) return () => {};
      const tag = document.createElement('style');
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
      return () => tag.remove();
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        try {
          console.info(CLIENT_TAG, 'client apply start', CLIENT_VERSION);
          ctx.effect(() => injectStyles(CSS), 'babeldoc-pdf: styles');
          ctx.effect(() => ctx.locale.register(NS, DICT), 'babeldoc-pdf: dictionaries');
          t = ctx.locale.bind(NS);
          ctx.effect(() => {
            const disposers = [
              ctx.slots.inject('sidebar.panellist', () =>
                ctx.slots.register(
                  { name: 'sidebar.panellist', id: PANEL_ID, order: 30, label: () => t('panel'), locale: NS },
                  BabeldocIcon,
                ),
              ),
              ctx.slots.inject('main', () =>
                ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, BabeldocPage),
              ),
            ];
            return () => {
              for (const dispose of disposers) dispose();
            };
          }, 'babeldoc-pdf: panel');
          console.info(CLIENT_TAG, 'client applied', CLIENT_VERSION);
        } catch (error) {
          console.error(CLIENT_TAG, 'client apply failed', error);
          throw error;
        }
      },
    };
  },
});
