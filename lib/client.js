window.__ModuleLoader__.load({
  id: 'dsh-babeldoc-pdf-translator',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

    const NS = 'babeldoc';
    const PANEL_ID = 'babeldoc';
    const TAB_ID = 'dsh-babeldoc-pdf-translator';
    const TAB_KIND = 'babeldoc-pdf';
    const HEADER_ID = 'babeldoc-open';
    const API = '/babeldoc/api';
    const LS_KEY = 'babeldoc.prefs.v2';
    const LAST_DOC_KEY = 'babeldoc.lastDoc';
    const JOB_KEY = 'babeldoc.activeJob';
    const RECENT_LIMIT = 8;
    const CLIENT_TAG = '[babeldoc]';
    const CLIENT_VERSION = '2026-11-25.3';

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
        emptyHint: 'Pick a PDF and read the translation beside the original.',
        emptyHintTab: 'Pick a PDF and read the translation beside the original. Ask in the conversation in the center; this tab stays open.',
        openTab: 'Bilingual PDF',
        guideHint: 'Original and translation, while this conversation stays in the center.',
        layout: 'Page layout',
        layoutLr: 'Original on the left, translation on the right',
        layoutRl: 'Translation on the left, original on the right',
        layoutTb: 'Original above, translation below',
        layoutBt: 'Translation above, original below',
        layoutOrig: 'Original only',
        layoutTrans: 'Translation only',
        navOutline: 'Contents',
        navThumbs: 'Pages',
        outlineEmpty: 'This PDF has no bookmarks',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        pan: 'Pan',
        marqueeZoom: 'Zoom to selection',
        refreshView: 'Reset view',
        opening: 'Opening…',
        openTabFailed: 'The right sidebar did not open. Open a session, then choose Bilingual PDF again.',
        bindWorkspace: 'Choose a workspace folder',
        chooseWorkspace: 'Choose folder',
        changeWorkspace: 'Change folder',
        workspacePath: 'Workspace folder',
        workspaceUnset: 'Not chosen yet',
        workspaceHint: 'Choose the folder for this reader. You can change it later in Settings.',
        workspaceFailed: 'Could not save this folder',
        workspaceUnavailable: 'Workspace service is not ready',
        setGeneral: 'General',
        setTranslation: 'Translation',
        setAdvanced: 'Advanced',
        setEnvironment: 'Environment',
        setMaintain: 'Maintenance',
        setAbout: 'About',
        setOk: 'OK',
        setCancel: 'Cancel',
        setApply: 'Apply',
        setDirty: 'Unsaved',
        setConcurrency: 'Concurrency',
        setPromptSection: 'System prompt',
        setPython: 'Python environment',
        setCache: 'Page cache',
        setCurrentDoc: 'Current document',
        setClear: 'Clear',
        setEngine: 'Engine',
        setLicense: 'License',
        setSaved: 'Saved',
        setExpand: 'Resize',
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
        featQa: 'Ask in the conversation',
        dropHint: 'Drop the PDF to open it',
        noDshModel: 'No DSH model found.',
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
        needKey: 'Choose a DSH model first.',
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
        translateAll: '全文翻译',
        stop: '停止',
        exportPdf: '导出',
        settings: '设置',
        close: '关闭',
        original: '原文',
        translated: '译文',
        pageOf: '第 {page} / {total} 页',
        emptyTitle: '打开一个 PDF 开始阅读',
        emptyHint: '选一个 PDF，逐页翻译后左右对照阅读。',
        emptyHintTab: '选一个 PDF，逐页翻译后对照阅读。提问请直接用中间的对话，这个标签会保持打开。',
        openTab: '双语 PDF',
        guideHint: '原文和译文对照，中间继续用当前对话。',
        layout: '页面布局',
        layoutLr: '左原文，右译文',
        layoutRl: '左译文，右原文',
        layoutTb: '上原文，下译文',
        layoutBt: '上译文，下原文',
        layoutOrig: '只看原文',
        layoutTrans: '只看译文',
        navOutline: '目录',
        navThumbs: '页面',
        outlineEmpty: '这份 PDF 没有书签',
        zoomIn: '放大',
        zoomOut: '缩小',
        pan: '拖动',
        marqueeZoom: '框选放大',
        refreshView: '刷新',
        opening: '正在打开…',
        openTabFailed: '右侧栏没有打开。请先进入一个会话，再点「双语 PDF」。',
        bindWorkspace: '选择工作目录',
        chooseWorkspace: '选择目录',
        changeWorkspace: '更换目录',
        workspacePath: '工作目录',
        workspaceUnset: '尚未选择',
        workspaceHint: '先选定这个阅读器的工作目录。以后可以在设置里更换。',
        workspaceFailed: '没能保存这个目录',
        workspaceUnavailable: '工作区服务还没准备好',
        setGeneral: '常规',
        setTranslation: '翻译',
        setAdvanced: '高级',
        setEnvironment: '环境',
        setMaintain: '维护',
        setAbout: '关于',
        setOk: '确定',
        setCancel: '取消',
        setApply: '应用',
        setDirty: '未保存',
        setConcurrency: '并发控制',
        setPromptSection: '系统提示词',
        setPython: 'Python 环境',
        setCache: '页面缓存',
        setCurrentDoc: '当前文档',
        setClear: '清空',
        setEngine: '引擎',
        setLicense: '许可',
        setSaved: '已保存',
        setExpand: '调整大小',
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
        featQa: '中间对话提问',
        dropHint: '松开即可打开 PDF',
        noDshModel: '没有可用的 DSH 模型。',
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
        needKey: '请先选择 DSH 模型。',
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
    let activeCtx;
    let tabTypeDispose;
    let openSerial = 0;
    let openState = { phase: 'idle', detail: '' };
    const openListeners = new Set();
    const chipTitles = new Map();
    const chipListeners = new Set();

    function service(name) {
      if (!activeCtx) return undefined;
      try {
        if (typeof activeCtx.get === 'function') {
          const value = activeCtx.get(name);
          if (value) return value;
        }
      } catch (error) {
        /* not injected, or not ready yet */
      }
      try {
        return activeCtx[name];
      } catch (error) {
        return undefined;
      }
    }

    function setChipTitle(sessionId, text) {
      const key = sessionId || 'default';
      const next = text || '';
      if (chipTitles.get(key) === next) return;
      chipTitles.set(key, next);
      chipListeners.forEach((listener) => listener());
    }

    function useChipTitle(sessionId) {
      const key = sessionId || 'default';
      const [text, setText] = useState(() => chipTitles.get(key) || '');
      useEffect(() => {
        const listener = () => setText(chipTitles.get(key) || '');
        chipListeners.add(listener);
        listener();
        return () => chipListeners.delete(listener);
      }, [key]);
      return text;
    }

    function tabDefinition() {
      return {
        id: TAB_ID,
        kind: TAB_KIND,
        keepMounted: true,
        title: () => t('panel'),
        guide: [
          {
            id: 'reader',
            order: 42,
            title: () => t('panel'),
            description: () => t('guideHint'),
          },
        ],
      };
    }

    function connectTabType() {
      if (typeof tabTypeDispose === 'function') return true;
      const tabs = service('sidebarRightTabs');
      if (!tabs || typeof tabs.register !== 'function') return false;
      try {
        tabTypeDispose = tabs.register(tabDefinition());
      } catch (error) {
        const message = String((error && error.message) || error);
        if (message.indexOf('already registered') !== -1) {
          console.info(CLIENT_TAG, 'right tab type already registered', TAB_KIND);
          return true;
        }
        console.warn(CLIENT_TAG, 'tab type register failed', error);
        return false;
      }
      console.info(CLIENT_TAG, 'right tab type registered', TAB_KIND);
      return true;
    }

    function setOpenState(phase, detail) {
      openState = { phase, detail: detail || '' };
      openListeners.forEach((listener) => listener());
    }

    function useOpenState() {
      const [state, setState] = useState(openState);
      useEffect(() => {
        const listener = () => setState(openState);
        openListeners.add(listener);
        listener();
        return () => openListeners.delete(listener);
      }, []);
      return state;
    }

    function sessionOnScreen() {
      const sidebar = service('sidebarRight');
      if (!sidebar || !sidebar.mounted || typeof sidebar.mounted.getSnapshot !== 'function') return undefined;
      try {
        return sidebar.mounted.getSnapshot();
      } catch (error) {
        return undefined;
      }
    }

    function panelCoveringConversation() {
      const layout = service('layout');
      if (!layout || !layout.panelInfo || typeof layout.panelInfo.getSnapshot !== 'function') return false;
      try {
        return layout.panelInfo.getSnapshot().activePanelId != null;
      } catch (error) {
        return false;
      }
    }

    function failOpen(token, cameFromPanel, error) {
      if (token !== openSerial) return;
      console.warn(CLIENT_TAG, 'right tab did not open', error || '');
      setOpenState('failed', t('openTabFailed'));
      void cameFromPanel;
    }

    function openBabeldocTab() {
      const token = ++openSerial;
      setOpenState('opening', '');
      const cameFromPanel = panelCoveringConversation();
      if (cameFromPanel) {
        try {
          const layout = service('layout');
          if (layout && typeof layout.selectPanel === 'function') layout.selectPanel(null);
        } catch (error) {
          console.warn(CLIENT_TAG, 'could not return to the conversation', error);
        }
      }
      const attempt = (left) => {
        if (token !== openSerial) return;
        const sidebar = service('sidebarRight');
        if (sidebar && typeof sidebar.openTab === 'function' && sessionOnScreen()) {
          try {
            sidebar.openTab(TAB_KIND, {});
            setOpenState('idle', '');
            return;
          } catch (error) {
            if (left <= 0) {
              failOpen(token, cameFromPanel, error);
              return;
            }
          }
        }
        if (left <= 0) {
          failOpen(token, cameFromPanel);
          return;
        }
        window.setTimeout(() => attempt(left - 1), 50);
      };
      attempt(20);
    }

    function readRecentIds(key) {
      try {
        const raw = JSON.parse(window.localStorage.getItem(key) || '[]');
        return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string').slice(0, RECENT_LIMIT) : [];
      } catch (error) {
        return [];
      }
    }

    function writeRecentIds(key, ids) {
      try {
        window.localStorage.setItem(key, JSON.stringify(ids.slice(0, RECENT_LIMIT)));
      } catch (error) {
        /* ignore */
      }
    }

    function pickRecent(docs, ids) {
      const list = Array.isArray(docs) ? docs : [];
      const byId = new Map(list.map((doc) => [doc.id, doc]));
      const picked = [];
      for (const id of ids) {
        const doc = byId.get(id);
        if (doc) picked.push(doc);
        if (picked.length >= RECENT_LIMIT) return picked;
      }
      for (const doc of list) {
        if (picked.some((item) => item.id === doc.id)) continue;
        picked.push(doc);
        if (picked.length >= RECENT_LIMIT) break;
      }
      return picked;
    }

    const LAYOUTS = ['lr', 'rl', 'tb', 'bt', 'orig', 'trans'];

    function readLayout(surface) {
      try {
        const value = window.localStorage.getItem('babeldoc.layout.' + surface);
        if (LAYOUTS.indexOf(value) !== -1) return value;
      } catch (error) {
        /* ignore */
      }
      return 'lr';
    }

    function writeLayout(surface, mode) {
      try {
        window.localStorage.setItem('babeldoc.layout.' + surface, mode);
      } catch (error) {
        /* ignore */
      }
    }

    function LayoutGlyph(props) {
      const mode = props.mode;
      const gray = 'var(--dsw-alias-label-tertiary,#94a3b8)';
      const blue = '#3b63f3';
      const box = (x, y, w, height, color) => h('rect', { x: x, y: y, width: w, height: height, rx: 1.2, stroke: color, strokeWidth: 1.4 });
      let marks;
      if (mode === 'rl') marks = [box(1, 2, 6, 12, blue), box(9, 2, 6, 12, gray)];
      else if (mode === 'tb') marks = [box(2, 1, 12, 6, gray), box(2, 9, 12, 6, blue)];
      else if (mode === 'bt') marks = [box(2, 1, 12, 6, blue), box(2, 9, 12, 6, gray)];
      else if (mode === 'orig') marks = [box(3, 1, 10, 14, gray)];
      else if (mode === 'trans') marks = [box(3, 1, 10, 14, blue)];
      else marks = [box(1, 2, 6, 12, gray), box(9, 2, 6, 12, blue)];
      return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'none', 'aria-hidden': 'true' }, marks);
    }

    function LayoutPicker(props) {
      const items = [
        ['lr', t('layoutLr')],
        ['rl', t('layoutRl')],
        ['tb', t('layoutTb')],
        ['bt', t('layoutBt')],
        ['orig', t('layoutOrig')],
        ['trans', t('layoutTrans')],
      ];
      return h(
        'div',
        { className: 'bdoc-layout' },
        h(
          'button',
          {
            type: 'button',
            className: 'bdoc-iconbtn' + (props.open ? ' is-on' : ''),
            title: t('layout'),
            'aria-label': t('layout'),
            'aria-expanded': props.open ? 'true' : 'false',
            onClick: props.onToggle,
          },
          h(LayoutGlyph, { mode: props.value }),
        ),
        props.open
          ? h(
              React.Fragment,
              null,
              h('div', { className: 'bdoc-layout-backdrop', onClick: props.onToggle }),
              h(
                'div',
                { className: 'bdoc-layout-pop', role: 'menu' },
                items.map(([mode, label]) => h(
                  'button',
                  {
                    key: mode,
                    type: 'button',
                    className: 'bdoc-layout-item' + (mode === props.value ? ' is-on' : ''),
                    title: label,
                    'aria-label': label,
                    onClick: () => props.onPick(mode),
                  },
                  h(LayoutGlyph, { mode: mode }),
                )),
              ),
            )
          : null,
      );
    }

    function readZoom(surface) {
      const value = Number(window.localStorage.getItem('babeldoc.zoom.' + surface));
      return value >= 0.5 && value <= 8 ? value : 1;
    }

    function writeZoom(surface, value) {
      try {
        window.localStorage.setItem('babeldoc.zoom.' + surface, String(value));
      } catch (error) {
        /* ignore */
      }
    }

    function ViewIcon(props) {
      const stroke = 'currentColor';
      const common = { fill: 'none', stroke: stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
      if (props.kind === 'out') {
        return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' },
          h('circle', { cx: 7, cy: 7, r: 4.2, ...common }),
          h('path', { d: 'M10.2 10.2 13 13M5.2 7h3.6', ...common }));
      }
      if (props.kind === 'in') {
        return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' },
          h('circle', { cx: 7, cy: 7, r: 4.2, ...common }),
          h('path', { d: 'M10.2 10.2 13 13M5.2 7h3.6M7 5.2v3.6', ...common }));
      }
      if (props.kind === 'hand') {
        return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' },
          h('path', { fill: stroke, d: 'M6.7 7.4V4.1a.85.85 0 0 1 1.7 0v2.8h.15V2.7a.85.85 0 0 1 1.7 0v4h.15V4.5a.85.85 0 0 1 1.7 0v3.3h.1V5.8c.15-.7.8-1.1 1.4-.8.35.2.45.6.35.95l-.55 2.2c-.4 1.55-1.7 2.65-3.3 2.65H6.9c-1.55 0-2.7-1-3.05-2.3-.25-.8-.1-1.45.4-2l.85-1.05c.25-.3.6-.4.9-.2.2.12.28.32.28.5v1.45z' }));
      }
      if (props.kind === 'marquee') {
        return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' },
          h('rect', { x: 1.3, y: 1.6, width: 9.2, height: 8.4, rx: 1.3, fill: 'none', stroke: stroke, strokeWidth: 1.35 }),
          h('path', { fill: stroke, d: 'M7.4 6.1 13.5 13.1 10.7 12.5 9.5 15.1 8.2 14.5 9.4 11.9 7 11.5z' }));
      }
      return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true' },
        h('path', { d: 'M12.6 6.2A5 5 0 1 1 8 3.1', ...common }),
        h('path', { d: 'M8 1.4v2.2h2.2', ...common }));
    }

    function ViewBar(props) {
      const button = (kind, title, onClick, extra) => h(
        'button',
        {
          type: 'button',
          className: 'bdoc-viewbtn' + (extra && extra.on ? ' is-on' : ''),
          title: title,
          'aria-label': title,
          disabled: extra && extra.disabled,
          onClick: onClick,
        },
        h(ViewIcon, { kind: kind }),
      );
      return h(
        'div',
        { className: 'bdoc-viewbar' },
        button('out', t('zoomOut'), () => props.onStep(-0.1), { disabled: props.zoom <= 0.5 }),
        button('in', t('zoomIn'), () => props.onStep(0.1), { disabled: props.zoom >= 8 }),
        button('hand', t('pan'), props.onPan, { on: props.hand }),
        button('marquee', t('marqueeZoom'), props.onMarquee, { on: props.marquee }),
        button('refresh', t('refreshView'), props.onRefresh),
      );
    }

    function readNav(surface) {
      try {
        const raw = JSON.parse(window.localStorage.getItem('babeldoc.nav.' + surface) || '{}');
        return { open: !!raw.open, mode: raw.mode === 'outline' ? 'outline' : 'thumbs' };
      } catch (error) {
        return { open: false, mode: 'thumbs' };
      }
    }

    function writeNav(surface, value) {
      try {
        window.localStorage.setItem('babeldoc.nav.' + surface, JSON.stringify(value));
      } catch (error) {
        /* ignore */
      }
    }

    function DownloadIcon() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'none', 'aria-hidden': 'true' },
        h('path', { d: 'M8 2v7.2', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
        h('path', { d: 'M4.6 6.6 8 10l3.4-3.4', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M3.2 13.2h9.6', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
      );
    }

    function SparkIcon() {
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 14, height: 14, fill: 'currentColor', 'aria-hidden': 'true' },
        h('path', { d: 'M8 1.1 9.05 4.7 12.7 5.75 9.05 6.8 8 10.4 6.95 6.8 3.3 5.75 6.95 4.7 8 1.1z' }),
        h('path', { d: 'M12.35 9.15 12.9 10.7 14.45 11.25 12.9 11.8 12.35 13.35 11.8 11.8 10.25 11.25 11.8 10.7 12.35 9.15z' }),
      );
    }

    function NavIcon(props) {
      const kind = props.kind;
      const stroke = 'currentColor';
      const line = (y) => h('path', { d: 'M3 ' + y + 'h10', stroke: stroke, strokeWidth: 1.4, strokeLinecap: 'round' });
      if (kind === 'outline') {
        return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'none', 'aria-hidden': 'true' }, line(4), line(8), line(12));
      }
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'none', 'aria-hidden': 'true' },
        h('rect', { x: 2, y: 2, width: 5, height: 5, rx: 1, stroke: stroke, strokeWidth: 1.3 }),
        h('rect', { x: 9, y: 2, width: 5, height: 5, rx: 1, stroke: stroke, strokeWidth: 1.3 }),
        h('rect', { x: 2, y: 9, width: 5, height: 5, rx: 1, stroke: stroke, strokeWidth: 1.3 }),
        h('rect', { x: 9, y: 9, width: 5, height: 5, rx: 1, stroke: stroke, strokeWidth: 1.3 }),
      );
    }

    function NavDrawer(props) {
      const mode = props.outline.length === 0 ? 'thumbs' : props.mode;
      const current = props.outline.reduce((found, item) => (item.page <= props.page ? item : found), null);
      return h(
        'div',
        { className: 'bdoc-navdrawer' },
        h(
          'div',
          { className: 'bdoc-navdrawer-head' },
          h(
            'div',
            { className: 'bdoc-navtabs' },
            h(
              'button',
              {
                type: 'button',
                className: 'bdoc-navtab' + (mode === 'outline' ? ' is-on' : ''),
                disabled: props.outline.length === 0,
                onClick: () => props.onMode('outline'),
              },
              t('navOutline'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'bdoc-navtab' + (mode === 'thumbs' ? ' is-on' : ''),
                onClick: () => props.onMode('thumbs'),
              },
              t('navThumbs'),
            ),
          ),
          h('button', { type: 'button', className: 'bdoc-iconbtn', title: t('close'), onClick: props.onClose }, '✕'),
        ),
        mode === 'outline'
          ? h(
              'div',
              { className: 'bdoc-navlist' },
              props.outline.length === 0
                ? h('p', { className: 'bdoc-navempty' }, t('outlineEmpty'))
                : props.outline.map((item, index) => h(
                    'button',
                    {
                      key: index + ':' + item.page + ':' + item.title,
                      type: 'button',
                      className: 'bdoc-outline' + (current === item ? ' is-on' : ''),
                      style: { paddingLeft: 10 + Math.min(item.level - 1, 2) * 14 + 'px' },
                      onClick: () => props.onGo(item.page),
                    },
                    h('span', { className: 'bdoc-outline-title' }, item.title),
                    h('span', { className: 'bdoc-outline-page' }, item.page),
                  )),
            )
          : h(
              'div',
              { className: 'bdoc-thumblist' },
              Array.from({ length: props.pages }, (_, index) => {
                const number = index + 1;
                return h(
                  'button',
                  {
                    key: number,
                    type: 'button',
                    className: 'bdoc-thumb' + (number === props.page ? ' is-on' : ''),
                    onClick: () => props.onGo(number),
                  },
                  h('img', {
                    src: API + '/docs/' + props.docId + '/page/' + number + '?kind=orig&w=160',
                    alt: '',
                    loading: 'lazy',
                    draggable: false,
                  }),
                  props.translated && props.translated.has(number) ? h('span', { className: 'bdoc-thumb-dot' }) : null,
                  h('span', { className: 'bdoc-thumb-no' }, number),
                );
              }),
            ),
      );
    }

    function rememberJob(job, key) {
      try {
        if (job && (job.status === 'running' || job.status === 'queued')) window.sessionStorage.setItem(key, job.id);
        else window.sessionStorage.removeItem(key);
      } catch (error) {
        /* ignore */
      }
    }

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

    function settingsSnapshot(prefs) {
      return {
        syncScroll: !!(prefs && prefs.syncScroll),
        autoTranslate: !!(prefs && prefs.autoTranslate),
        langOut: (prefs && prefs.langOut) || 'zh',
        provider: (prefs && prefs.provider) || '',
        dshModel: (prefs && prefs.dshModel) || '',
        parallel: Number(prefs && prefs.parallel) || 3,
        batchSize: Number(prefs && prefs.batchSize) || 8,
        qps: Number(prefs && prefs.qps) || 16,
        customPrompt: (prefs && prefs.customPrompt) || '',
      };
    }

    function SettingsDrawer(props) {
      const { prefs, setPrefs, env, models, onInstall, onCheck, onClearCache, onClose, onDelete, workspace, onPickWorkspace, workspaceBusy, jobActive } = props;
      const [tab, setTab] = useState('general');
      const [expanded, setExpanded] = useState(false);
      const maskRef = useRef(null);
      const navRef = useRef(null);
      const [portrait, setPortrait] = useState(false);
      const [navRows, setNavRows] = useState(1);
      useEffect(() => {
        const node = maskRef.current;
        if (!node || typeof ResizeObserver !== 'function') return undefined;
        const measure = () => {
          const box = node.getBoundingClientRect();
          // Landscape card is 720px: 172px nav plus a label and control on one row.
          // Switch as soon as that fits. Narrower stays the stacked layout.
          setPortrait(box.width < 720);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
      }, []);
      useEffect(() => {
        const nav = navRef.current;
        if (!portrait || !nav) {
          setNavRows(1);
          return undefined;
        }
        const measure = () => {
          const buttons = Array.from(nav.querySelectorAll('button'));
          const gap = 2;
          const need = buttons.reduce((sum, button) => sum + (Number(button.dataset.navw) || button.scrollWidth), 0) + gap * Math.max(0, buttons.length - 1) + 16;
          if (navRows === 1) buttons.forEach((button) => { button.dataset.navw = String(button.scrollWidth); });
          setNavRows(nav.clientWidth > 0 && need > nav.clientWidth ? 2 : 1);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(nav);
        return () => observer.disconnect();
      }, [portrait, navRows]);
      const [draft, setDraft] = useState(() => settingsSnapshot(prefs));
      const [saved, setSaved] = useState(() => settingsSnapshot(prefs));
      const [notice, setNotice] = useState('');
      const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
      const envReady = env && env.ready;
      const patch = (next) => setDraft((current) => ({ ...current, ...next }));
      const commit = (close) => {
        setPrefs(draft);
        setSaved(draft);
        setNotice(t('setSaved'));
        if (close) onClose();
      };
      const modelValue = draft.provider && draft.dshModel ? draft.provider + '\u0000' + draft.dshModel : '';
      const nav = [
        ['general', t('setGeneral')],
        ['translation', t('setTranslation')],
        ['advanced', t('setAdvanced')],
        ['environment', t('setEnvironment')],
        ['maintain', t('setMaintain')],
        ['about', t('setAbout')],
      ];
      const paneRef = useRef(null);
      const row = (label, control) => h('div', { className: 'bdoc-setrow' }, h('span', null, label), control);
      const toggle = (checked, onChange) => h('label', { className: 'bdoc-switch' },
        h('input', { type: 'checkbox', checked: !!checked, onChange: (event) => onChange(event.target.checked) }),
        h('i', null));
      const sections = [
        h('section', { key: 'general', id: 'bdoc-set-general', className: 'bdoc-setsection' },
          h('h1', null, t('setGeneral')),
          h('div', { className: 'bdoc-setlist' },
            row(t('syncScroll'), toggle(draft.syncScroll, (value) => patch({ syncScroll: value }))),
            row(t('autoTranslate'), toggle(draft.autoTranslate, (value) => patch({ autoTranslate: value }))))),
        h('section', { key: 'translation', id: 'bdoc-set-translation', className: 'bdoc-setsection' },
          h('h1', null, t('setTranslation')),
          h('div', { className: 'bdoc-setlist' },
            row(t('model'), h('select', {
              className: 'bdoc-setctl',
              value: modelValue,
              disabled: jobActive,
              onChange: (event) => {
                const parts = String(event.target.value).split('\u0000');
                patch({ provider: parts[0] || '', dshModel: parts[1] || '' });
              },
            },
            modelValue ? null : h('option', { value: '' }, t('selectModel')),
            (models || []).map((entry) => h('optgroup', { key: entry.provider, label: entry.label || entry.provider },
              (entry.models || []).map((model) => h('option', { key: entry.provider + '::' + model.id, value: entry.provider + '\u0000' + model.id }, model.label || model.id)))))),
            row(t('langOut'), h('select', {
              className: 'bdoc-setctl',
              value: draft.langOut,
              onChange: (event) => patch({ langOut: event.target.value }),
            }, TARGET_LANGS.map(([value, label]) => h('option', { key: value, value }, label)),
            TARGET_LANGS.some(([value]) => value === draft.langOut) ? null : h('option', { value: draft.langOut }, draft.langOut))))),
        h('section', { key: 'advanced', id: 'bdoc-set-advanced', className: 'bdoc-setsection' },
          h('h1', null, t('setAdvanced')),
          h('h2', null, t('setConcurrency')),
          h('div', { className: 'bdoc-setgrid' },
            h('label', null, t('parallel'), h('input', { className: 'bdoc-setctl', type: 'number', min: 1, max: 8, value: draft.parallel, onChange: (event) => patch({ parallel: Number(event.target.value) || 1 }) })),
            h('label', null, t('batchSize'), h('input', { className: 'bdoc-setctl', type: 'number', min: 1, max: 12, value: draft.batchSize, onChange: (event) => patch({ batchSize: Number(event.target.value) || 1 }) })),
            h('label', null, t('qps'), h('input', { className: 'bdoc-setctl', type: 'number', min: 1, max: 32, value: draft.qps, onChange: (event) => patch({ qps: Number(event.target.value) || 1 }) }))),
          h('hr', null),
          h('h2', null, t('setPromptSection')),
          h('textarea', { className: 'bdoc-setctl', placeholder: t('customPromptHint'), value: draft.customPrompt, onChange: (event) => patch({ customPrompt: event.target.value }) })),
        h('section', { key: 'environment', id: 'bdoc-set-environment', className: 'bdoc-setsection' },
          h('h1', null, t('setEnvironment')),
          h('h2', null, t('workspacePath')),
          h('div', { className: 'bdoc-setpath' },
            h('input', { className: 'bdoc-setctl', readOnly: true, value: workspace && workspace.path ? workspace.path : t('workspaceUnset') }),
            h('button', { type: 'button', className: 'bdoc-setbtn', disabled: workspaceBusy, onClick: onPickWorkspace }, t('changeWorkspace'))),
          h('hr', null),
          h('h2', null, t('setPython')),
          h('div', { className: 'bdoc-setenv' },
            h('span', { className: 'bdoc-setdot' + (envReady ? ' is-ok' : '') }),
            h('span', null, envReady ? t('envReady') + (env.version ? ' · Python ' + env.version : '') : t('notReady')),
            h('span', { className: 'bdoc-spacer' }),
            h('button', { type: 'button', className: 'bdoc-setbtn', onClick: onCheck, disabled: env && env.installing }, t('check')),
            h('button', { type: 'button', className: 'bdoc-setbtn', onClick: onInstall, disabled: env && env.installing }, env && env.installing ? t('installing') : t('install'))),
          env && env.installLog ? h('pre', { className: 'bdoc-envreport' }, env.installLog.slice(-4000)) : null),
        h('section', { key: 'maintain', id: 'bdoc-set-maintain', className: 'bdoc-setsection' },
          h('h1', null, t('setMaintain')),
          h('div', { className: 'bdoc-setlist' },
            row(t('setCache'), h('button', { type: 'button', className: 'bdoc-setbtn', onClick: onClearCache }, t('setClear'))),
            row(t('setCurrentDoc'), h('button', { type: 'button', className: 'bdoc-setbtn is-danger', onClick: () => { if (window.confirm(t('deleteConfirm'))) onDelete(); } }, t('removeDoc'))))),
        h('section', { key: 'about', id: 'bdoc-set-about', className: 'bdoc-setsection' },
          h('h1', null, t('setAbout')),
          h('div', { className: 'bdoc-setbrand' }, h('strong', null, 'BabelDOC'), h('span', null, 'v2.0.0')),
          h('div', { className: 'bdoc-setlist' },
            row(t('setEngine'), h('strong', null, 'BabelDOC')),
            row(t('setLicense'), h('strong', null, 'MIT')))),
      ];
      const showSection = (id) => {
        const paneNode = paneRef.current;
        const target = paneNode && paneNode.querySelector('#bdoc-set-' + id);
        if (!paneNode || !target) return;
        paneNode.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        setTab(id);
      };
      return h(
        'div',
        { ref: maskRef, className: 'bdoc-setmask' + (portrait ? ' is-portrait' : ' is-landscape') },
        h(
          'div',
          { className: 'bdoc-setwin' + (expanded ? ' is-max' : '') + (portrait ? ' is-portrait' : ' is-landscape'), role: 'dialog', 'aria-label': t('settings') },
          h(
            'header',
            { className: 'bdoc-sethead' },
            h('span', { className: 'bdoc-setmark', 'aria-hidden': 'true' }),
            h('span', null, t('settings')),
            h('span', { className: 'bdoc-spacer' }),
            h('button', { type: 'button', title: t('setExpand'), onClick: () => setExpanded((value) => !value) }, '▢'),
            h('button', { type: 'button', className: 'is-close', title: t('close'), onClick: onClose }, '✕'),
          ),
          h(
            'div',
            { className: 'bdoc-setbody' },
            h('nav', { ref: navRef, className: 'bdoc-setnav' + (portrait && navRows > 1 ? ' is-two' : '') }, nav.map(([id, label]) => h('button', {
              key: id,
              type: 'button',
              className: tab === id ? 'is-on' : '',
              onClick: () => showSection(id),
            }, label))),
            h(
              'div',
              { className: 'bdoc-setmain' },
              h('div', {
                ref: paneRef,
                className: 'bdoc-setpane',
                onScroll: (event) => {
                  const node = event.currentTarget;
                  const found = nav.map(([id]) => node.querySelector('#bdoc-set-' + id)).filter(Boolean);
                  const top = node.scrollTop + 8;
                  let current = found[0];
                  found.forEach((section) => { if (section.offsetTop <= top) current = section; });
                  const id = current && current.id.replace('bdoc-set-', '');
                  if (id) setTab(id);
                },
              }, sections),
              h(
                'footer',
                { className: 'bdoc-setfoot' },
                h('span', { className: 'bdoc-setdirty' + (dirty || notice ? '' : ' is-hidden') }, dirty ? t('setDirty') : notice),
                h('span', { className: 'bdoc-spacer' }),
                h('button', { type: 'button', className: 'bdoc-setbtn is-primary', onClick: () => commit(true) }, t('setOk')),
                h('button', { type: 'button', className: 'bdoc-setbtn', onClick: onClose }, t('setCancel')),
                h('button', { type: 'button', className: 'bdoc-setbtn', disabled: !dirty, onClick: () => commit(false) }, t('setApply')),
              ),
            ),
          ),
        ),
      );
    }

    function FileCard(props) {
      const doc = props.doc;
      const [failed, setFailed] = useState(false);
      return h(
        'button',
        { type: 'button', className: 'bdoc-file', title: doc.name, onClick: () => props.onOpen(doc.id) },
        h(
          'span',
          { className: 'bdoc-file-preview' },
          failed
            ? h('span', { className: 'bdoc-file-mark', 'aria-hidden': 'true' })
            : h('img', {
                src: API + '/docs/' + doc.id + '/page/1?kind=orig&w=480',
                alt: '',
                loading: 'lazy',
                draggable: false,
                onError: () => setFailed(true),
              }),
        ),
        h(
          'span',
          { className: 'bdoc-file-body' },
          h('span', { className: 'bdoc-file-name' }, doc.name),
          h('span', { className: 'bdoc-file-meta' }, t('docPages', { pages: doc.pages })),
        ),
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
          { className: 'bdoc-home' },
          h(
            'div',
            { className: 'bdoc-home-bar' },
            h(
              'div',
              { className: 'bdoc-home-copy' },
              h('h1', { className: 'bdoc-hero-title' }, t('emptyTitle')),
              h('p', { className: 'bdoc-hero-hint' }, props.hint || t('emptyHint')),
            ),
            h('button', { className: 'bdoc-btn bdoc-btn-primary', type: 'button', onClick: onPick, disabled: busy }, t('open')),
          ),
          hasDocs
            ? h(
                'section',
                { className: 'bdoc-recent' },
                h('h2', { className: 'bdoc-recent-head' }, t('recent')),
                h(
                  'div',
                  { className: 'bdoc-filegrid' },
                  docs.map((doc) => h(FileCard, { key: doc.id, doc: doc, onOpen: onOpen })),
                ),
              )
            : null,
        ),
        dragging ? h('div', { className: 'bdoc-dropmask' }, t('dropHint')) : null,
      );
    }

    function useElementNarrow(ref, maxWidth) {
      const [narrow, setNarrow] = useState(true);
      useEffect(() => {
        const node = ref.current;
        if (!node || typeof ResizeObserver !== 'function') return undefined;
        const measure = () => {
          const width = node.getBoundingClientRect().width;
          setNarrow(!(width > 0) || width < maxWidth);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
      }, [ref, maxWidth]);
      return narrow;
    }

    function BabeldocPage(props) {
      const surface = props && props.surface === 'tab' ? 'tab' : 'page';
      const docKey = LAST_DOC_KEY + '.' + surface;
      const jobKey = JOB_KEY + '.' + surface;
      const recentKey = 'babeldoc.recent.' + surface;
      const [recentIds, setRecentIds] = useState(() => readRecentIds(recentKey));
      const [workspace, setWorkspace] = useState(readWorkspaceBinding);
      const [workspaceBusy, setWorkspaceBusy] = useState(false);
      const [prefs, setPrefsState] = useState(loadPrefs);
      const [env, setEnv] = useState(null);
      const [docs, setDocs] = useState([]);
      const [doc, setDoc] = useState(null);
      const [job, setJob] = useState(null);
      const [error, setError] = useState('');
      const [busy, setBusy] = useState(false);
      const [drawer, setDrawer] = useState(false);
      const [page, setPage] = useState(1);
      const [models, setModels] = useState([]);
      const [modelsBusy, setModelsBusy] = useState(false);
      const [menuOpen, setMenuOpen] = useState(false);
      const [layoutOpen, setLayoutOpen] = useState(false);
      const [layout, setLayout] = useState(() => readLayout(surface));
      const savedNav = readNav(surface);
      const [navOpen, setNavOpen] = useState(savedNav.open);
      const [navMode, setNavMode] = useState(savedNav.mode);
      const [outline, setOutline] = useState([]);
      const [zoom, setZoom] = useState(() => readZoom(surface));
      const [hand, setHand] = useState(false);
      const [marquee, setMarquee] = useState(false);
      const marqueeScroll = useRef(null);
      const [rotate, setRotate] = useState(0);
      const rootRef = useRef(null);
      const containerNarrow = useElementNarrow(rootRef, 760);
      const narrow = surface === 'tab' && containerNarrow;
      const fileRef = useRef(null);
      const sessionId = props && props.sessionId;
      const leftRef = useRef(null);
      const rightRef = useRef(null);
      const syncing = useRef(false);
      const doneRef = useRef(0);
      const autoRef = useRef('');

      useEffect(() => {
        const onWorkspace = (event) => setWorkspace(event.detail || readWorkspaceBinding());
        window.addEventListener('babeldoc:workspace', onWorkspace);
        return () => window.removeEventListener('babeldoc:workspace', onWorkspace);
      }, []);

      const pickWorkspace = useCallback(async () => {
        setWorkspaceBusy(true);
        setError('');
        try {
          const next = await chooseWorkspace();
          if (next) setWorkspace(next);
        } catch (failure) {
          console.warn(CLIENT_TAG, 'workspace bind failed', failure);
          setError(failure && failure.message ? failure.message : t('workspaceFailed'));
        } finally {
          setWorkspaceBusy(false);
        }
      }, []);

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

      useEffect(() => {
        if (!doc) {
          setOutline([]);
          return undefined;
        }
        let alive = true;
        request('/docs/' + doc.id + '/outline')
          .then((data) => {
            if (!alive) return;
            const items = Array.isArray(data.outline) ? data.outline : [];
            setOutline(items);
            if (items.length === 0) setNavMode('thumbs');
          })
          .catch(() => {
            if (alive) setOutline([]);
          });
        return () => {
          alive = false;
        };
      }, [doc && doc.id]);

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
        if (surface !== 'tab') return undefined;
        setChipTitle(sessionId, doc && doc.name ? doc.name : t('panel'));
        return undefined;
      }, [surface, sessionId, doc && doc.name]);

      useEffect(() => {
        rememberJob(job, jobKey);
      }, [job && job.id, job && job.status, jobKey]);

      useEffect(() => {
        if (job && doc && job.docId && job.docId !== doc.id) setJob(null);
      }, [job, doc]);

      useEffect(() => {
        refreshEnv();
        refreshDocs();
        loadModels();
        let jobId = '';
        try {
          jobId = window.sessionStorage.getItem(jobKey) || '';
        } catch (error) {
          jobId = '';
        }
        if (jobId) {
          request('/jobs/' + jobId)
            .then((data) => {
              if (data.job && (data.job.status === 'running' || data.job.status === 'queued')) setJob(data.job);
            })
            .catch(() => {
              rememberJob(null, jobKey);
            });
        }
        let last = '';
        try {
          last = window.localStorage.getItem(docKey) || '';
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
                window.localStorage.removeItem(docKey);
              } catch (error) {
                /* ignore */
              }
            });
        }
      }, [refreshEnv, refreshDocs, loadModels, docKey, jobKey]);

      useEffect(() => {
        if (!doc) return;
        refreshDoc(doc.id, prefs.langOut);
      }, [prefs.langOut]);

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
            window.localStorage.setItem(docKey, data.doc.id);
          } catch (error) {
            /* ignore */
          }
          setRecentIds((current) => {
            const next = [data.doc.id, ...current.filter((item) => item !== data.doc.id)].slice(0, RECENT_LIMIT);
            writeRecentIds(recentKey, next);
            return next;
          });
          refreshDocs();
        } catch (failure) {
          console.warn(CLIENT_TAG, 'upload failed', failure.message);
          setError(failure.message || t('openFailed'));
          if (failure.code === 'ENV_NOT_READY') setEnv(failure.probe || env);
        } finally {
          setBusy(false);
        }
      }, [prefs.langOut, refreshDocs, env, docKey, recentKey]);

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
              window.localStorage.setItem(docKey, data.doc.id);
            } catch (error) {
              /* ignore */
            }
            setRecentIds((current) => {
              const next = [data.doc.id, ...current.filter((item) => item !== data.doc.id)].slice(0, RECENT_LIMIT);
              writeRecentIds(recentKey, next);
              return next;
            });
          } catch (failure) {
            setError(failure.message);
          } finally {
            setBusy(false);
          }
        },
        [prefs.langOut, docKey, recentKey],
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
          if (!doc) return;
          const clamped = Math.min(doc.pages, Math.max(1, target));
          syncing.current = true;
          for (const container of [leftRef.current, rightRef.current]) {
            if (!container) continue;
            const node = container.querySelector('[data-page="' + clamped + '"]');
            if (node) container.scrollTop = node.offsetTop;
          }
          window.requestAnimationFrame(() => {
            syncing.current = false;
          });
          setPage(clamped);
        },
        [doc],
      );

      const onScroll = useCallback((event) => {
        const container = (event && event.currentTarget) || leftRef.current;
        if (!container || !doc) return;
        const max = Math.max(1, container.scrollHeight - container.clientHeight);
        const ratio = Math.min(1, Math.max(0, container.scrollTop / max));
        setPage(Math.min(doc.pages, Math.max(1, Math.round(ratio * (doc.pages - 1)) + 1)));
        if (!prefs.syncScroll || syncing.current) return;
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
            window.localStorage.removeItem(docKey);
          } catch (error) {
            /* ignore */
          }
          setRecentIds((current) => {
            const next = current.filter((item) => item !== doc.id);
            writeRecentIds(recentKey, next);
            return next;
          });
          refreshDocs();
        } catch (failure) {
          setError(failure.message);
        }
      }, [doc, refreshDocs, docKey, recentKey]);

      const translatedCount = translatedMap.size;
      const envReady = env && env.ready;
      const canTranslate = !!doc && (!job || job.status === 'done' || job.status === 'error' || job.status === 'cancelled');

      const jobActive = !!job && (job.status === 'running' || job.status === 'queued');


      useEffect(() => {
        if (!doc) autoRef.current = '';
      }, [doc && doc.id]);

      useEffect(() => {
        if (!hand) return undefined;
        const nodes = [leftRef.current, rightRef.current].filter(Boolean);
        const cleanups = nodes.map((node) => {
          let active = false;
          let x = 0;
          let y = 0;
          let left = 0;
          let top = 0;
          const down = (event) => {
            if (event.button !== 0) return;
            active = true;
            x = event.clientX;
            y = event.clientY;
            left = node.scrollLeft;
            top = node.scrollTop;
            node.classList.add('is-panning');
            event.preventDefault();
          };
          const move = (event) => {
            if (!active) return;
            node.scrollLeft = left - (event.clientX - x);
            node.scrollTop = top - (event.clientY - y);
          };
          const up = () => {
            active = false;
            node.classList.remove('is-panning');
          };
          node.addEventListener('mousedown', down);
          window.addEventListener('mousemove', move);
          window.addEventListener('mouseup', up);
          return () => {
            node.removeEventListener('mousedown', down);
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            node.classList.remove('is-panning');
          };
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      }, [hand, doc && doc.id]);

      useEffect(() => {
        if (!marquee) return undefined;
        const nodes = [leftRef.current, rightRef.current].filter(Boolean);
        const cleanups = nodes.map((node) => {
          let box = null;
          let startX = 0;
          let startY = 0;
          const down = (event) => {
            if (event.button !== 0) return;
            startX = event.clientX;
            startY = event.clientY;
            box = document.createElement('div');
            box.className = 'bdoc-marquee';
            document.body.appendChild(box);
            event.preventDefault();
          };
          const move = (event) => {
            if (!box) return;
            const left = Math.min(startX, event.clientX);
            const top = Math.min(startY, event.clientY);
            box.style.left = left + 'px';
            box.style.top = top + 'px';
            box.style.width = Math.abs(event.clientX - startX) + 'px';
            box.style.height = Math.abs(event.clientY - startY) + 'px';
          };
          const up = (event) => {
            if (!box) return;
            box.remove();
            box = null;
            const rect = node.getBoundingClientRect();
            const x = Math.min(startX, event.clientX) - rect.left;
            const y = Math.min(startY, event.clientY) - rect.top;
            const width = Math.abs(event.clientX - startX);
            const height = Math.abs(event.clientY - startY);
            if (width < 12 || height < 12) return;
            setZoom((value) => {
              const fit = Math.min(node.clientWidth / width, node.clientHeight / height);
              const next = Math.round(Math.min(8, Math.max(0.5, value * fit)) * 10) / 10;
              const scale = value > 0 ? next / value : 1;
              const left = (node.scrollLeft + x) * scale;
              const top = (node.scrollTop + y) * scale;
              if (next === value) {
                node.scrollLeft = left;
                node.scrollTop = top;
                marqueeScroll.current = null;
              } else {
                marqueeScroll.current = { node, left, top };
              }
              writeZoom(surface, next);
              return next;
            });
          };
          node.addEventListener('mousedown', down);
          window.addEventListener('mousemove', move);
          window.addEventListener('mouseup', up);
          return () => {
            node.removeEventListener('mousedown', down);
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            if (box) box.remove();
          };
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      }, [marquee, doc && doc.id, surface]);

      useEffect(() => {
        const pending = marqueeScroll.current;
        if (!pending || !pending.node) return;
        pending.node.scrollLeft = pending.left;
        pending.node.scrollTop = pending.top;
        marqueeScroll.current = null;
      }, [zoom]);

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
              h('span', { className: 'bdoc-banner-text' }, '⚠ ' + t('notReady') + (env.missing && env.missing.length ? '：' + env.missing.join(', ') : '')),
              h('button', { className: 'bdoc-tbtn bdoc-tbtn-primary', type: 'button', onClick: installEnv, disabled: env.installing }, env.installing ? t('installing') : t('install')),
            )
          : null;

      const pageStyle = (number) => {
        const dims = doc && Array.isArray(doc.dims) ? doc.dims : null;
        const dim = dims ? dims[number - 1] : null;
        const turned = rotate === 90 || rotate === 270;
        if (dim && dim.w > 0 && dim.h > 0) {
          const width = turned ? dim.h : dim.w;
          const height = turned ? dim.w : dim.h;
          return { aspectRatio: width + ' / ' + height };
        }
        return { minHeight: '240px' };
      };
      const pageAttrs = (number) => ({
        className: 'bdoc-page',
        'data-page': number,
        'data-rot': rotate ? String(rotate) : undefined,
        style: { ...pageStyle(number), '--bdoc-rot': rotate + 'deg' },
      });

      const origPages = h(
        'div',
        { className: 'bdoc-pages' + (hand ? ' is-hand' : '') + (marquee ? ' is-marquee' : ''), ref: leftRef, onScroll },
        doc
          ? Array.from({ length: doc.pages }, (_, index) => {
              const number = index + 1;
              return h(
                'div',
                { ...pageAttrs(number), key: 'o' + number },
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
        { className: 'bdoc-pages' + (hand ? ' is-hand' : '') + (marquee ? ' is-marquee' : ''), ref: rightRef, onScroll },
        doc
          ? Array.from({ length: doc.pages }, (_, index) => {
              const number = index + 1;
              const version = translatedMap.get(number);
              const busyPage = jobActive && Array.isArray(job.pages) && job.pages.indexOf(number) !== -1;
              return h(
                'div',
                { ...pageAttrs(number), key: 't' + number },
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

      const stepZoom = (delta) => {
        setZoom((value) => {
          const next = Math.round(Math.min(8, Math.max(0.5, value + delta)) * 10) / 10;
          writeZoom(surface, next);
          return next;
        });
      };
      const zoomControl = () => h(ViewBar, {
        zoom: zoom,
        hand: hand,
        marquee: marquee,
        onStep: stepZoom,
        onPan: () => {
          setHand((value) => !value);
          setMarquee(false);
        },
        onMarquee: () => {
          setMarquee((value) => !value);
          setHand(false);
        },
        onRefresh: () => {
          setZoom(1);
          writeZoom(surface, 1);
          setRotate(0);
          [leftRef.current, rightRef.current].forEach((node) => {
            if (!node) return;
            node.scrollLeft = 0;
            node.scrollTop = 0;
          });
        },
      });
      const origPane = h(
        'div',
        { className: 'bdoc-pane' },
        h('div', { className: 'bdoc-pane-head' }, h('span', null, t('original')), h('span', { className: 'bdoc-spacer' }), zoomControl()),
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
          zoomControl(),
        ),
        transPages,
      );

      const stacked = layout === 'tb' || layout === 'bt';
      const single = layout === 'orig' || layout === 'trans';
      const showOrig = layout !== 'trans';
      const showTrans = layout !== 'orig';
      const origFirst = layout === 'lr' || layout === 'tb' || layout === 'orig';
      const panes = [];
      if (origFirst) {
        if (showOrig) panes.push(origPane);
        if (showTrans) panes.push(transPane);
      } else {
        if (showTrans) panes.push(transPane);
        if (showOrig) panes.push(origPane);
      }
      const closeNav = () => {
        setNavOpen(false);
        writeNav(surface, { open: false, mode: navMode });
      };
      const body = doc
        ? h(
            'div',
            { className: 'bdoc-main' + (stacked ? ' is-stack' : '') + (single ? ' is-single' : ''), style: { '--bdoc-zoom': String(zoom) } },
            h('div', { className: 'bdoc-reader' }, panes),
            navOpen
              ? h(
                  React.Fragment,
                  null,
                  h('div', { className: 'bdoc-navmask', onClick: closeNav }),
                  h(NavDrawer, {
                    docId: doc.id,
                    pages: doc.pages,
                    page,
                    outline,
                    mode: navMode,
                    translated: translatedMap,
                    onGo: goPage,
                    onClose: closeNav,
                    onMode: (mode) => {
                      setNavMode(mode);
                      writeNav(surface, { open: true, mode });
                    },
                  }),
                )
              : null,
          )
        : h(DocList, {
            docs: pickRecent(docs, recentIds),
            onOpen: openDoc,
            onPick: pickFile,
            onFile: uploadFile,
            busy,
            hint: surface === 'tab' ? t('emptyHintTab') : t('emptyHint'),
            askInChat: surface === 'tab',
          });

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
              doc ? menuItem('⇩ ' + t('exportPdf'), exportPdf, translatedCount === 0) : null,
              menuItem('⚙ ' + t('settings'), () => setDrawer(true)),
              doc ? menuItem(t('backToList'), () => { setDoc(null); setJob(null); }) : null,
            ),
          )
        : null;

      if (surface === 'page' && !workspace) {
        return h(
          'div',
          { ref: rootRef, className: 'bdoc-root' },
          h(
            'div',
            { className: 'bdoc-welcome' },
            h(
              'div',
              { className: 'bdoc-home' },
              h('h1', { className: 'bdoc-hero-title' }, t('bindWorkspace')),
              h('p', { className: 'bdoc-hero-hint' }, t('workspaceHint')),
              h('button', { className: 'bdoc-btn bdoc-btn-primary', type: 'button', disabled: workspaceBusy, onClick: pickWorkspace }, workspaceBusy ? t('opening') : t('chooseWorkspace')),
              error ? h('div', { className: 'bdoc-err', onClick: () => setError('') }, '⚠ ' + error) : null,
            ),
          ),
        );
      }

      return h(
        'div',
        { ref: rootRef, className: 'bdoc-root' + (surface === 'tab' ? ' is-tab' : '') + (narrow ? ' is-narrow' : '') },
        h('input', { ref: fileRef, type: 'file', accept: 'application/pdf,.pdf', style: { display: 'none' }, onChange: openFile }),
        h(
          'div',
          { className: 'bdoc-top' },
          doc ? null : h('span', { className: 'bdoc-topname' }, t('panel')),
          doc
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'bdoc-iconbtn' + (navOpen ? ' is-on' : ''),
                  title: t('navOutline'),
                  'aria-label': t('navOutline'),
                  onClick: () => {
                    setLayoutOpen(false);
                    setMenuOpen(false);
                    setNavOpen((value) => {
                      const next = !value;
                      writeNav(surface, { open: next, mode: navMode });
                      return next;
                    });
                  },
                },
                h(NavIcon, { kind: 'outline' }),
              )
            : null,
          doc
            ? h(LayoutPicker, {
                value: layout,
                open: layoutOpen,
                onToggle: () => {
                  setMenuOpen(false);
                  setNavOpen(false);
                  setLayoutOpen((value) => !value);
                },
                onPick: (mode) => {
                  setLayout(mode);
                  setLayoutOpen(false);
                  writeLayout(surface, mode);
                },
              })
            : null,
          h('span', { className: 'bdoc-spacer' }),
          doc && canTranslate
            ? h(
                'button',
                { className: 'bdoc-btn bdoc-translate', type: 'button', onClick: () => translate(null) },
                h(SparkIcon),
                h('span', null, t('translateAll')),
              )
            : null,
          jobActive ? h('span', { className: 'bdoc-jobpill', title: (job.current ? job.current + ' · ' : '') + (job.detail || '') }, '● ' + job.done + '/' + (job.total || 0)) : null,
          doc && jobActive ? h('button', { className: 'bdoc-btn bdoc-btn-danger', type: 'button', title: t('stop'), onClick: stopJob }, '■') : null,
          doc
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'bdoc-iconbtn',
                  title: t('exportPdf'),
                  'aria-label': t('exportPdf'),
                  disabled: translatedCount === 0,
                  onClick: exportPdf,
                },
                h(DownloadIcon),
              )
            : null,
          h('button', { className: 'bdoc-iconbtn', type: 'button', title: t('menu'), onClick: () => { setLayoutOpen(false); setNavOpen(false); setMenuOpen((value) => !value); } }, '⋯'),
        ),
        banner,
        error ? h('div', { className: 'bdoc-err', onClick: () => setError('') }, '⚠ ' + error) : null,
        body,
        menu,
        drawer ? h(SettingsDrawer, { prefs, setPrefs, env, models, jobActive, onInstall: installEnv, onCheck: refreshEnv, onClearCache: clearCache, onDelete: removeDoc, onClose: () => setDrawer(false), workspace, onPickWorkspace: pickWorkspace, workspaceBusy }) : null,
      );

    }

    function BabeldocTitle(props) {
      const name = useChipTitle(props && props.sessionId);
      return h('span', { className: 'bdoc-tabtitle' }, name || t('panel'));
    }

    function OpenTabButton() {
      const status = useOpenState();
      const failed = status.phase === 'failed';
      const opening = status.phase === 'opening';
      return h(
        'button',
        {
          type: 'button',
          className: 'bdoc-openbtn' + (failed ? ' is-failed' : ''),
          title: failed ? status.detail || t('openTabFailed') : t('guideHint'),
          'aria-label': t('openTab'),
          'aria-busy': opening ? 'true' : undefined,
          onClick: () => openBabeldocTab(),
        },
        h(BabeldocIcon, { size: 16 }),
        h('span', { className: 'bdoc-openbtn-label' }, opening ? t('opening') : t('openTab')),
      );
    }

    const WORKSPACE_KEY = 'babeldoc.workspace';

    function readWorkspaceBinding() {
      try {
        const raw = JSON.parse(window.localStorage.getItem(WORKSPACE_KEY) || 'null');
        if (!raw || !raw.id || !raw.path) return null;
        return { id: String(raw.id), path: String(raw.path) };
      } catch (error) {
        return null;
      }
    }

    function writeWorkspaceBinding(value) {
      try {
        window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify({ id: value.id, path: value.path }));
      } catch (error) {
        /* ignore */
      }
    }

    async function chooseWorkspace() {
      const ui = service('uiWorkspace');
      const spaces = service('workspaces');
      if (!ui || typeof ui.pickDirectory !== 'function' || !spaces || typeof spaces.create !== 'function') {
        throw new Error(t('workspaceUnavailable'));
      }
      const picked = await ui.pickDirectory();
      if (!picked) return null;
      const created = await spaces.create({ path: picked });
      const next = { id: String(created.workspaceId), path: String(created.path || picked) };
      writeWorkspaceBinding(next);
      window.dispatchEvent(new CustomEvent('babeldoc:workspace', { detail: next }));
      return next;
    }

    function BabeldocMainPage() {
      return h(BabeldocPage, { surface: 'page' });
    }

    function BabeldocTabPage(props) {
      return h(BabeldocPage, { surface: 'tab', sessionId: props && props.sessionId });
    }

    const CSS = [
      '.bdoc-root{position:relative;width:100%;height:100%;display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111827);font-size:14px;font-family:Inter,"Segoe UI","Microsoft YaHei","PingFang SC",Arial,sans-serif;overflow:hidden;}',
      '.bdoc-tabtitle{display:block;max-width:148px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.bdoc-openbtn{display:inline-flex;align-items:center;gap:6px;height:28px;max-width:148px;padding:0 8px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#1f2329);font:inherit;font-size:12px;font-weight:600;cursor:pointer;}',
      '.bdoc-openbtn:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.12));}',
      '.bdoc-openbtn.is-failed{color:var(--dsw-alias-state-error-primary,#b91c1c);}',
      '.bdoc-openbtn-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.bdoc-launcher{height:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:12px;padding:24px;color:var(--dsw-alias-label-primary,#111827);}',
      '.bdoc-root.is-narrow .bdoc-welcome{flex-direction:column;align-items:stretch;justify-content:flex-start;gap:18px;padding:16px 12px 24px;}',
      '.bdoc-root.is-narrow .bdoc-hero{max-width:none;}',
      '.bdoc-root.is-narrow .bdoc-hero-title{font-size:20px;}',
      '.bdoc-root.is-narrow .bdoc-recent{max-width:none;}',
      '.bdoc-setmask.is-portrait{align-items:flex-start;padding:8px;}',
      '.bdoc-setwin.is-portrait{width:100%;height:auto;max-height:100%;overflow:hidden;border-radius:12px;}',
      '.bdoc-setwin.is-portrait .bdoc-setbody{flex-direction:column;min-height:0;}',
      '.bdoc-setwin.is-portrait .bdoc-setnav{width:100%;flex:none;flex-direction:row;flex-wrap:nowrap;overflow:hidden;border-right:none;border-bottom:1px solid #e8eaef;}',
      '.bdoc-setwin.is-portrait .bdoc-setnav.is-two{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));}',
      '.bdoc-setwin.is-portrait .bdoc-setnav.is-two button{display:inline-flex;align-items:center;width:100%;justify-content:center;text-align:center;padding:0 4px;}',
      '.bdoc-setwin.is-portrait .bdoc-setmain{min-height:0;}',
      '.bdoc-setwin.is-portrait .bdoc-setmain{min-height:0;flex:1;}',
      '.bdoc-setwin.is-portrait .bdoc-setpane{flex:1;min-height:180px;max-height:52vh;padding:16px;overflow:auto;}',
      '.bdoc-setwin.is-portrait .bdoc-setrow{flex-direction:column;align-items:stretch;gap:8px;}',
      '.bdoc-setwin.is-portrait select.bdoc-setctl{width:100%;}',
      '.bdoc-setwin.is-portrait .bdoc-setfoot{padding:0 16px;}',
      '.bdoc-setwin.is-portrait .bdoc-setgrid{grid-template-columns:1fr;}',
      '.bdoc-root.is-narrow .bdoc-top{min-height:35px;padding:1px 8px;}',
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
      '.bdoc-banner{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 12px;background:#fffbeb;border-bottom:1px solid #fde68a;color:#92400e;font-size:13px;flex:none;}',
      '.bdoc-banner-text{min-width:0;flex:1 1 140px;}',
      '.bdoc-banner .bdoc-tbtn{flex:none;}',
      '.bdoc-err{padding:6px 16px;color:#b91c1c;background:#fef2f2;border-bottom:1px solid #fecaca;font-size:13px;cursor:pointer;flex:none;}',
      '.bdoc-progress{display:flex;align-items:center;gap:12px;padding:6px 16px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);font-size:12px;color:var(--dsw-alias-label-secondary,#475569);flex:none;}',
      '.bdoc-pbar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-bg-layer-3,#e9edf5);overflow:hidden;}',
      '.bdoc-pfill{display:block;height:100%;border-radius:3px;background:#3b63f3;transition:width .3s;}',
      '.bdoc-workspace{flex:1;display:flex;gap:12px;padding:10px 14px;min-height:0;}',
      '.bdoc-pane{flex:1;min-width:0;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2,#d8e0ea);border-radius:0;overflow:hidden;background:var(--dsw-alias-bg-layer-1,#fff);}',
      '.bdoc-pane-head{display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);font-weight:700;font-size:13px;background:#f3f5f8;flex:none;position:relative;}',
      '.bdoc-navcenter{position:absolute;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;}',
      '.bdoc-headprog{font-size:12px;font-weight:600;color:#3b63f3;white-space:nowrap;}',
      '.bdoc-pages{flex:1;overflow:auto;padding:0;background:var(--dsw-alias-bg-layer-2,#f8fafc);}',
      '.bdoc-pages.is-hand{cursor:grab;}',
      '.bdoc-pages.is-hand.is-panning{cursor:grabbing;user-select:none;}',
      '.bdoc-pages.is-marquee{cursor:crosshair;}',
      '.bdoc-marquee{position:fixed;z-index:80;border:1px solid #3b63f3;background:rgba(59,99,243,.12);pointer-events:none;}',
      '.bdoc-page{container-type:size;position:relative;margin:0 auto 12px;background:#fff;border-radius:3px;box-shadow:0 1px 4px rgba(15,23,42,.08);overflow:hidden;width:calc(100% * var(--bdoc-zoom, 1));max-width:none;}',
      '.bdoc-viewbar{display:inline-flex;align-items:center;gap:2px;margin-left:8px;flex:none;color:var(--dsw-alias-label-primary,#111827);}',
      '.bdoc-viewbtn{width:26px;height:26px;border:none;border-radius:6px;background:transparent;color:inherit;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;}',
      '.bdoc-viewbtn:hover{background:rgba(15,23,42,.06);}',
      '.bdoc-viewbtn.is-on{color:#3b63f3;}',
      '.bdoc-viewbtn:disabled{opacity:.35;cursor:default;}',
      '.bdoc-page img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:contain;}',
      '.bdoc-page[data-rot="180"] img{transform:rotate(180deg);}',
      '.bdoc-page[data-rot="90"] img,.bdoc-page[data-rot="270"] img{width:100cqh;height:100cqw;max-width:none;inset:auto;top:50%;left:50%;transform:translate(-50%,-50%) rotate(var(--bdoc-rot));}',
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
      '.bdoc-setmask{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(17,24,39,.18);}',
      '.bdoc-setwin{width:min(720px,100%);height:min(480px,100%);display:flex;flex-direction:column;overflow:hidden;background:#fff;color:#111827;border-radius:12px;box-shadow:0 18px 42px -12px rgba(15,23,42,.14),0 0 0 1px rgba(15,23,42,.08);}',
      '.bdoc-setwin.is-max{width:100%;height:100%;max-height:none;border-radius:8px;}',
      '.bdoc-setwin.is-max .bdoc-setbody{flex:1;min-height:0;}',
      '.bdoc-setwin.is-max .bdoc-setmain{flex:1;min-height:0;display:flex;flex-direction:column;}',
      '.bdoc-setwin.is-max .bdoc-setpane{flex:1;min-height:0;max-height:none;overflow:auto;}',
      '.bdoc-sethead{height:38px;display:flex;align-items:center;gap:8px;padding:0 6px 0 14px;border-bottom:1px solid #e8eaef;font-size:12.5px;font-weight:500;color:#374151;flex:none;}',
      '.bdoc-sethead button{width:32px;height:24px;border:none;border-radius:4px;background:transparent;color:#6b7280;cursor:pointer;}',
      '.bdoc-sethead button:hover{background:#f3f4f6;color:#111827;}',
      '.bdoc-sethead button.is-close:hover{background:#ef4444;color:#fff;}',
      '.bdoc-setmark{width:18px;height:18px;border-radius:4px;background:#2563eb;flex:none;}',
      '.bdoc-setbody{flex:1;min-height:0;display:flex;}',
      '.bdoc-setnav{width:172px;flex:none;display:flex;flex-direction:column;gap:2px;padding:8px;background:#f8f9fb;border-right:1px solid #e8eaef;}',
      '.bdoc-setnav button{height:34px;padding:0 12px;border:none;border-radius:6px;background:transparent;color:#374151;font:inherit;font-size:13px;font-weight:500;text-align:left;cursor:pointer;white-space:nowrap;flex:none;}',
      '.bdoc-setnav button:hover{background:#eef1f6;}',
      '.bdoc-setnav button.is-on{background:#e8f0fe;color:#1d4ed8;}',
      '.bdoc-setmain{flex:1;min-width:0;display:flex;flex-direction:column;background:#fff;}',
      '.bdoc-setpane{flex:1;min-height:0;overflow:auto;padding:24px 32px;}',
      '.bdoc-setsection{padding-bottom:28px;}',
      '.bdoc-setsection + .bdoc-setsection{border-top:1px solid #eef0f4;padding-top:22px;}',
      '.bdoc-setpane h1{margin:0 0 20px;font-size:16px;font-weight:600;}',
      '.bdoc-setpane h2{margin:0 0 12px;font-size:12px;font-weight:500;color:#6b7280;}',
      '.bdoc-setpane hr{border:none;border-top:1px solid #eef0f4;margin:16px 0;}',
      '.bdoc-setlist{border-top:1px solid #eef0f4;border-bottom:1px solid #eef0f4;}',
      '.bdoc-setrow{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-top:1px solid #eef0f4;font-size:13.5px;}',
      '.bdoc-setrow>span:first-child{flex:none;white-space:nowrap;}',
      '.bdoc-setlist>.bdoc-setrow:first-child{border-top:none;}',
      '.bdoc-setctl{height:32px;padding:0 10px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#111827;font:inherit;font-size:13px;box-sizing:border-box;}',
      'select.bdoc-setctl{width:230px;max-width:100%;}',
      'textarea.bdoc-setctl{width:100%;height:96px;padding:10px;resize:none;}',
      '.bdoc-setgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;}',
      '.bdoc-setgrid label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#374151;}',
      '.bdoc-setpath{display:flex;gap:8px;}',
      '.bdoc-setpath input{flex:1;min-width:0;background:#f9fafb;font-family:Consolas,Menlo,monospace;font-size:12.5px;}',
      '.bdoc-setenv{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13.5px;}',
      '.bdoc-setdot{width:8px;height:8px;border-radius:50%;background:#f59e0b;flex:none;}',
      '.bdoc-setdot.is-ok{background:#10b981;}',
      '.bdoc-setbtn{height:32px;padding:0 12px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#374151;font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;}',
      '.bdoc-setbtn:hover{background:#f9fafb;}',
      '.bdoc-setbtn:disabled{background:#f9fafb;color:#9ca3af;cursor:default;}',
      '.bdoc-setbtn.is-primary{border-color:#2563eb;background:#2563eb;color:#fff;}',
      '.bdoc-setbtn.is-primary:hover{background:#1d4ed8;}',
      '.bdoc-setbtn.is-danger{border-color:#fecaca;background:#fef2f2;color:#dc2626;}',
      '.bdoc-setfoot{height:52px;display:flex;align-items:center;gap:8px;padding:0 32px;border-top:1px solid #eef0f4;flex:none;}',
      '.bdoc-setdirty{font-size:12px;color:#d97706;}',
      '.bdoc-setdirty.is-hidden{visibility:hidden;}',
      '.bdoc-setbrand{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:15px;}',
      '.bdoc-setbrand span{padding:2px 8px;border-radius:999px;background:#f3f4f6;color:#4b5563;font-size:11.5px;font-family:Consolas,Menlo,monospace;}',
      '.bdoc-switch{position:relative;width:36px;height:20px;flex:none;}',
      '.bdoc-switch input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer;}',
      '.bdoc-switch i{display:block;width:36px;height:20px;border-radius:999px;background:#d1d5db;}',
      '.bdoc-switch i:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.15);transition:transform .15s;}',
      '.bdoc-switch input:checked+i{background:#2563eb;}',
      '.bdoc-switch input:checked+i:after{transform:translateX(16px);}',
      '.bdoc-field label{font-size:12px;font-weight:600;display:block;margin:8px 0 4px;}',
      '.bdoc-field input,.bdoc-field textarea,.bdoc-field select{width:100%;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:13px;box-sizing:border-box;}',
      '.bdoc-field textarea{height:64px;resize:vertical;}',
      '.bdoc-two{display:flex;gap:8px;}.bdoc-two>span{flex:1;}',
      '.bdoc-three{display:flex;flex-wrap:wrap;gap:8px;}.bdoc-three>span{flex:1 1 88px;min-width:0;}',
      '.bdoc-check{display:flex;align-items:center;gap:8px;font-weight:600;}',
      '.bdoc-check input{width:auto;margin:0;}',
      '.bdoc-envline{font-size:12px;color:var(--dsw-alias-label-secondary,#475569);}',
      '.bdoc-hint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary,#64748b);margin:2px 0 4px;}',
      '.bdoc-hint-warn{color:#b45309;}',
      '.bdoc-envreport{font-size:10px;font-family:Consolas,Menlo,monospace;color:#334155;background:var(--dsw-alias-bg-layer-1,#f8fafc);border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:8px;padding:8px;white-space:pre-wrap;word-break:break-all;margin-top:8px;max-height:180px;overflow:auto;}',
      '.bdoc-setpane .bdoc-envreport{margin-top:12px;}',
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
      '.bdoc-translate{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#1f2329);font-size:13px;font-weight:500;box-shadow:none;}',
      '.bdoc-translate:hover{background:var(--dsw-alias-bg-layer-2,#f4f6f8);}',
      '.bdoc-translate svg{color:var(--dsw-alias-label-secondary,#64748b);flex:none;}',
      '.bdoc-btn-primary{background:#3b63f3;border-color:#3b63f3;color:#fff;}',
      '.bdoc-btn-primary:hover{opacity:.92;}',
      '.bdoc-btn-danger{border-color:#fecaca;color:#dc2626;background:#fff;}',
      '.bdoc-btn:disabled{opacity:.5;cursor:default;}',
      '.bdoc-ghost{height:34px;padding:0 10px;border:1px solid transparent;border-radius:9px;background:transparent;color:#3b63f3;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;}',
      '.bdoc-ghost:hover{background:#eef4ff;}',
      '.bdoc-ghost:disabled{opacity:.5;cursor:default;}',
      '.bdoc-iconbtn{width:34px;height:34px;border:none;border-radius:8px;background:transparent;color:inherit;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;}',
      '.bdoc-iconbtn:hover{background:var(--dsw-alias-bg-layer-2,#f4f6f8);color:#3b63f3;}',
      '.bdoc-iconbtn.is-on{background:transparent;color:#3b63f3;}',
      '.bdoc-iconbtn:disabled{opacity:.35;cursor:default;}',
      '.bdoc-jobpill{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 9px;border-radius:999px;background:#eef4ff;color:#3b63f3;font-size:11px;font-weight:700;white-space:nowrap;}',
      '.bdoc-main{position:relative;flex:1;display:flex;gap:0;padding:0;min-height:0;}',
      '.bdoc-main.is-stack{flex-direction:column;}',
      '.bdoc-main.is-stack .bdoc-reader{flex-direction:column;}',
      '.bdoc-main.is-stack .bdoc-pane,.bdoc-main.is-single .bdoc-pane{flex:1 1 0;min-height:0;}',
      '.bdoc-navmask{position:absolute;inset:0;z-index:21;background:rgba(15,23,42,.12);}',
      '.bdoc-navdrawer{position:absolute;top:0;left:0;bottom:0;z-index:22;box-sizing:border-box;width:min(320px,52%);display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1,#fff);border-right:1px solid var(--dsw-alias-border-l2,#e2e8f0);box-shadow:8px 0 24px rgba(15,23,42,.12);animation:bdoc-drawer-in .16s ease-out;}',
      '@keyframes bdoc-drawer-in{from{transform:translateX(-100%);}to{transform:none;}}',
      '.bdoc-navdrawer-head{display:flex;align-items:center;gap:8px;min-height:36px;padding:2px 8px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);flex:none;}',
      '.bdoc-navdrawer-head .bdoc-iconbtn{width:28px;height:28px;}',
      '.bdoc-navtabs{display:flex;align-items:center;gap:14px;flex:1;}',
      '.bdoc-navtab{height:28px;padding:0;border:none;background:transparent;color:var(--dsw-alias-label-tertiary,#94a3b8);font-size:13px;font-weight:500;cursor:pointer;}',
      '.bdoc-navtab.is-on{color:var(--dsw-alias-label-primary,#111827);font-weight:700;}',
      '.bdoc-navtab:disabled{opacity:.35;cursor:default;}',
      '.bdoc-navlist,.bdoc-thumblist{flex:1;min-height:0;overflow:auto;padding:8px;}',
      '.bdoc-navempty{margin:12px 8px;font-size:12px;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-outline{display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:6px 8px;border:none;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer;}',
      '.bdoc-outline.is-on{background:#eef4ff;color:#3b63f3;}',
      '.bdoc-outline-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;}',
      '.bdoc-outline-page{flex:none;font-size:12px;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-thumblist{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:10px 8px;align-content:start;}',
      '.bdoc-thumb{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;padding:0;border:none;background:transparent;cursor:pointer;}',
      '.bdoc-thumb img{display:block;width:100%;aspect-ratio:1/1.35;object-fit:contain;object-position:center;background:#fff;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:4px;box-shadow:0 1px 2px rgba(15,23,42,.06);}',
      '.bdoc-thumb.is-on img{border-color:#3b63f3;box-shadow:0 0 0 1px #3b63f3;}',
      '.bdoc-thumb-no{font-size:11px;line-height:1.2;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-thumb.is-on .bdoc-thumb-no{color:#3b63f3;font-weight:600;}',
      '.bdoc-thumb-dot{position:absolute;top:4px;right:4px;width:6px;height:6px;border-radius:50%;background:#3b63f3;}',
      '.bdoc-layout{position:relative;flex:none;}',
      '.bdoc-layout-backdrop{position:fixed;inset:0;z-index:40;}',
      '.bdoc-layout-pop{position:absolute;top:calc(100% + 6px);left:0;z-index:41;display:flex;gap:4px;padding:6px;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:12px;box-shadow:0 12px 32px rgba(15,23,42,.16);}',
      '.bdoc-layout-item{width:32px;height:32px;border:1px solid transparent;border-radius:8px;background:transparent;padding:0;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;}',
      '.bdoc-layout-item:hover{background:var(--dsw-alias-bg-layer-2,#f1f5f9);}',
      '.bdoc-layout-item.is-on{border-color:#3b63f3;background:#eef4ff;}',
      '.bdoc-reader{flex:1;min-width:0;min-height:0;display:flex;gap:0;padding:0;}',
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
      '.bdoc-welcome{flex:1;position:relative;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;min-height:0;padding:28px 32px 40px;overflow:auto;}',
      '.bdoc-home{width:100%;max-width:1120px;margin:0 auto;display:flex;flex-direction:column;gap:28px;}',
      '.bdoc-home-bar{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;}',
      '.bdoc-home-copy{min-width:0;display:flex;flex-direction:column;gap:6px;}',
      '.bdoc-hero-title{margin:0;font-size:22px;line-height:1.3;font-weight:600;}',
      '.bdoc-hero-hint{margin:0;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-secondary,#64748b);}',
      '.bdoc-recent{min-width:0;display:flex;flex-direction:column;gap:12px;}',
      '.bdoc-recent-head{margin:0;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#111827);}',
      '.bdoc-filegrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:12px;align-items:stretch;}',
      '.bdoc-file{display:flex;flex-direction:column;align-items:stretch;min-width:0;height:100%;padding:0;overflow:hidden;border:1px solid var(--dsw-alias-border-l2,#e2e8f0);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;text-align:left;cursor:pointer;}',
      '.bdoc-file:hover{border-color:var(--dsw-alias-border-l1,#cbd5e1);}',
      '.bdoc-file-preview{display:flex;align-items:center;justify-content:center;height:148px;overflow:hidden;background:var(--dsw-alias-bg-layer-2,#f4f6f8);border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);}',
      '.bdoc-file-preview img{width:100%;height:100%;object-fit:cover;object-position:top center;background:var(--dsw-alias-bg-layer-1,#fff);}',
      '.bdoc-file-body{display:flex;flex-direction:column;gap:2px;min-width:0;padding:8px 10px 10px;}',
      '.bdoc-file-mark{width:22px;height:28px;border:1px solid var(--dsw-alias-border-l2,#d6dee9);border-radius:3px;background:var(--dsw-alias-bg-layer-1,#fff);position:relative;}',
      '.bdoc-file-mark:before{content:"";position:absolute;top:6px;left:4px;right:4px;height:1px;background:var(--dsw-alias-border-l2,#d6dee9);box-shadow:0 4px 0 var(--dsw-alias-border-l2,#d6dee9),0 8px 0 var(--dsw-alias-border-l2,#d6dee9);}',
      '.bdoc-file-name{max-width:100%;height:2.7em;font-size:13px;font-weight:600;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}',
      '.bdoc-file-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#64748b);}',
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
      '.bdoc-top{display:flex;align-items:center;flex-wrap:nowrap;gap:8px;padding:1px 10px;min-height:35px;border-bottom:1px solid var(--dsw-alias-border-l2,#e5eaf1);flex:none;background:var(--dsw-alias-bg-layer-1,#fff);}',
      '.bdoc-top .bdoc-btn{height:28px;padding:0 10px;font-size:13px;border-radius:8px;flex:none;}',
      '.bdoc-top .bdoc-translate{font-weight:500;}',
      '.bdoc-top .bdoc-iconbtn{width:28px;height:28px;font-size:13px;flex:none;}',
      '.bdoc-top .bdoc-model{height:32px;flex:1 1 auto;min-width:0;max-width:220px;width:auto;margin-left:0;}',
      '.bdoc-top .bdoc-jobpill{flex:none;max-width:88px;overflow:hidden;text-overflow:ellipsis;}',
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
      '.bdoc-top{padding:1px 10px;min-height:35px;}',
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
      '.bdoc-pages{padding:0;}',
      '.bdoc-page{max-width:100%;}',
      '.bdoc-qa-body{max-height:180px;}',
      '.bdoc-setwin.is-max{width:100%;height:100%;max-height:none;border-radius:0;}',
      '.bdoc-setwin.is-max .bdoc-setpane{max-height:none;}',
      '.bdoc-banner{padding:6px 10px;font-size:12px;}',
      '.bdoc-progress{padding:4px 10px;}',
      '}',
      '@media (max-height:520px){',
      '.bdoc-qabar{display:none;}',
      '.bdoc-top{min-height:35px;padding:1px 10px;}',
      '.bdoc-subbar{padding:4px 8px;}',
      '.bdoc-footbar{padding:6px 10px;}',
      '.bdoc-body-single{padding:4px 6px;}',
      '.bdoc-welcome{padding:16px 12px 24px;}',
      '.bdoc-home-bar{align-items:stretch;flex-direction:column;}',
      '.bdoc-hero-title{font-size:18px;}',
      '}',
    ].join('\n');

    function injectStyles(css) {
      const tagId = 'babeldoc-pdf/styles';
      if (typeof document === 'undefined') return () => {};
      let tag = document.querySelector('style[data-plugin-css="' + tagId + '"]');
      if (!tag) {
        tag = document.createElement('style');
        tag.dataset.pluginCss = tagId;
        document.head.appendChild(tag);
      }
      tag.textContent = css;
      return () => tag.remove();
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs', 'layout', 'uiWorkspace', 'workspaces'],
      apply(ctx) {
        try {
          console.info(CLIENT_TAG, 'client apply start', CLIENT_VERSION);
          ctx.effect(() => injectStyles(CSS), 'babeldoc-pdf: styles');
          ctx.effect(() => ctx.locale.register(NS, DICT), 'babeldoc-pdf: dictionaries');
          t = ctx.locale.bind(NS);
          activeCtx = ctx;
          if (!connectTabType() && typeof window.setTimeout === 'function') {
            let left = 8;
            const retry = () => {
              left -= 1;
              if (!connectTabType() && left > 0) window.setTimeout(retry, 400);
            };
            window.setTimeout(retry, 200);
          }
          ctx.effect(() => {
            const disposers = [
              ctx.slots.inject('sidebar.panellist', () =>
                ctx.slots.register(
                  { name: 'sidebar.panellist', id: PANEL_ID, order: 30, label: () => t('panel'), locale: NS },
                  BabeldocIcon,
                ),
              ),
              ctx.slots.inject('main', () =>
                ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, BabeldocMainPage),
              ),
              ctx.slots.inject('sidebar.right.pane.tab', () =>
                ctx.slots.register(
                  { name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS },
                  BabeldocTabPage,
                ),
              ),
              ctx.slots.inject('sidebar.right.pane.tab.title', () =>
                ctx.slots.register(
                  { name: 'sidebar.right.pane.tab.title', key: TAB_ID, locale: NS },
                  BabeldocTitle,
                ),
              ),
              ctx.slots.inject('conversation.session.header.utilities', () =>
                ctx.slots.register(
                  {
                    name: 'conversation.session.header.utilities',
                    id: HEADER_ID,
                    order: 8,
                    label: () => t('openTab'),
                    locale: NS,
                  },
                  OpenTabButton,
                ),
              ),
            ];
            return () => {
              for (const dispose of disposers) dispose();
            };
          }, 'babeldoc-pdf: seats');
          ctx.effect(() => () => {
            if (typeof tabTypeDispose !== 'function') return;
            try {
              tabTypeDispose();
            } catch (error) {
              console.warn(CLIENT_TAG, 'tab type dispose failed', error);
            }
            tabTypeDispose = undefined;
          }, 'babeldoc-pdf: tab type');
          console.info(CLIENT_TAG, 'client applied', CLIENT_VERSION);
        } catch (error) {
          console.error(CLIENT_TAG, 'client apply failed', error);
          throw error;
        }
      },
    };
  },
});
