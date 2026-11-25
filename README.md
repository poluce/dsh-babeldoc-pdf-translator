# dsh-babeldoc-pdf-translator

> DSH（DeepSeek Harness）插件：左侧栏「双语 PDF」入口，左侧原文、右侧 BabelDOC 译文逐页对照阅读，支持断点续翻的逐页缓存、文档问答与译文 PDF 导出。

## 功能

- **左侧栏入口**：注册 `sidebar.panellist` 图标与 `main` 页面，点侧栏行进入整页阅读器
- **服务端渲染**：原文与译文都由 Host 用 PyMuPDF 渲染成 PNG，浏览器不需要 pdf.js、不访问 CDN
- **BabelDOC 分批翻译**：每批多页、多个批次并行，可随时停止；每页译文单独落盘，中断后继续不会重复调用模型
- **目录页修复**：自动识别目录页，翻译后修复右对齐页码与点线
- **导出译文 PDF**：把已缓存译文页与未翻译原文页合成一份 PDF
- **文档问答**：走 DSH 内置 LLM 服务，按当前页优先组织上下文，回答标注来源页码
- **模型来源三选一**：DSH 模型（默认，无 Key）、DSH 内置免费翻译（Bing / Google 匿名端点，无 Key、不耗额度）、自定义 OpenAI 兼容 API
- **环境自管理**：首次使用在插件数据目录创建独立 Python venv 并安装依赖，不污染系统 Python

## 安装

本机 Desktop profile：

- 界面：**Plugins → Add plugin**，选择本目录
- Agent：`plugin_manager` → `install_bundle`，`target` 为本目录绝对路径

其他 profile：`dsh plugin --profile <profile> add <本地目录或 npm 包名>`。

安装后刷新页面（`Ctrl+Shift+R`），左侧栏出现「双语 PDF」。

## 首次使用

1. 打开左侧栏「双语 PDF」→ 设置 → **安装依赖**。插件会在 `DSH_HOME/babeldoc/venv` 创建虚拟环境并安装
   `babeldoc pymupdf openai httpx peewee`（依赖较多，首次需要联网，可能数分钟到十几分钟）。
2. 设置里的「模型来源」有三种：
   - **DSH 模型**（默认）：列出 DSH「模型渠道」里配置的**全部** provider 与模型，可在设置里选，也可在顶部工具栏直接切换；新增渠道后点「刷新模型列表」
   - **内置免费翻译**：选 Bing 或 Google，走 DSH 的匿名翻译端点，不需要 Key、不消耗模型额度
   - **自定义 OpenAI 兼容 API**：填地址、Key 和模型
3. 「打开 PDF」→ 选择文件 → 「翻译本页」或「翻译全部」。

## 工作原理

| 环节 | 实现 |
|---|---|
| 包形态 | 标准 DSH bundle：`package.json` 声明 `dsh.bundle.patch` + `dsh.client`，`cordis.patch.yml` 插入一行 |
| Host | 普通 Cordis 插件：在 `webServer` 上注册 `/babeldoc` 前缀的同源 HTTP API；文档与缓存由 Node `fs` 管理；Python 通过 `subprocess` 服务启动 |
| Client | 单文件 `window.__ModuleLoader__` 模块：`sidebar.panellist` 图标 + `main` 页面，`fetch` 调用 Host API |
| 页面渲染 | `python/render_page.py`：PyMuPDF 按目标宽度渲染 PNG，磁盘缓存 |
| 翻译 | `python/babeldoc_run.py`：BabelDOC CLI 分批输出 mono PDF，`split_pages.py` 拆回逐页缓存 |
| 模型桥接 | `source: 'dsh'` 时，Host 暴露一个 OpenAI 兼容的 `/babeldoc/api/llm/<provider>/<model>/v1/chat/completions`，把 BabelDOC 的请求转给 `ctx.llm.stream`；`reasoningEffort` 默认 `off`，避免逐段翻译被推理 token 拖慢 |
| 免费翻译 | `source: 'free'` 时走同一桥的 `/babeldoc/api/llm/dsh-translator-<bing|google>/<lang>/v1`，把 BabelDOC 的 JSON 批量提示拆成逐条文本，交给 DSH 内置 `translator` 服务翻译（Bing/Google 匿名端点），并保护 `{v1}`、HTML 标签等占位符 |
| 目录修复 | `python/toc_pages.py` 识别 + `python/fix_toc.py` 重排 |
| 文档问答 | Host `ctx.llm` 流式调用，`python/extract_text.py` 取上下文 |
| Python 环境 | `lib/python.js`：独立 venv、依赖探测、pip 安装、脚本按包内路径执行 |

### 为什么不用 `ctx.remote`

客户端的 `ctx.remote` 只挂载构建期选定的生成 contribution（`@deepseek-ai/dsh-api-remotes`），第三方插件在运行时注册的 `@Remote` 方法不会出现在浏览器半区。因此本插件改用同源 HTTP 路由；这也是 `@local/dsh-panel-plugin` 等已安装插件的做法。

## 数据目录

```
DSH_HOME/babeldoc/
  venv/                       # 独立 Python 环境
  docs/<sha1>/original.pdf    # 原文（按内容哈希去重）
  docs/<sha1>/meta.json
  docs/<sha1>/pages/pN.zh.pdf # 逐页译文缓存
  docs/<sha1>/merged/zh.pdf   # 导出的合并译文
  docs/<sha1>/cache/*.png     # 页面图像缓存
  tmp/                        # 翻译中间目录
```

`DSH_HOME` 默认是 `C:\Users\<用户>\.dsh`（Windows）。

## 开发与更新

```powershell
node --check lib/index.js
node --check lib/client.js
```

本地目录安装是 Junction 链接：改完代码后重新安装一次（`remove_bundle` + `install_bundle`，或界面上重新添加），
再强制刷新页面；只改文件不重新安装不会加载新的 Host 模块。

## 配置

本插件不声明 `Config` 图形，但 `cordis.patch.yml` 的行 `config` 可以覆盖以下默认值：

| 字段 | 默认 | 含义 |
|---|---|---|
| `dataDir` | `DSH_HOME/babeldoc` | 数据目录 |
| `python` | 自动探测 | 用于创建 venv 的基础 Python |
| `pipIndex` | 空 | pip 镜像（如 `https://pypi.tuna.tsinghua.edu.cn/simple`） |
| `qps` | `8` | 每个 BabelDOC 进程的请求速率 |
| `batchSize` | `4` | 每个 BabelDOC 进程翻译的页数 |
| `parallel` | `3` | 并行 BabelDOC 进程数 |
| `maxUploadMB` | `200` | 单个 PDF 上传上限 |
| `timeoutMs` | `1200000` | 单批翻译超时 |

## 排障

- **依赖安装失败**：设置里可重试；国内网络可在行 `config` 里配 `pipIndex`。
- **`bitstring` 兼容性**：BabelDOC 0.6 仍引用旧版 `BitStream`，安装命令固定了 `bitstring<5`，无需手动处理。
- **代理导致的异常**：如果系统 `NO_PROXY` 含 `[::1]` 这类方括号条目，httpx 会解析失败；插件启动 Python 前会清理该值，代理本身照常透传。
- **翻译全部走了回退**：BabelDOC 在模型接口失败时会保留原文并继续输出，插件会把「成功 0 段」的批次判为失败并提示检查 API 配置。
- **DSH 模型报 401/认证失败**：说明该 provider 在 DSH 里的凭据本身不可用（与插件无关），换一个 provider/模型即可；错误原文会显示在面板上。
- **免费翻译质量/限流**：Bing/Google 是匿名浏览器端点，逐段机器翻译，措辞比大模型朴素，也可能临时限流；插件已把该模式的并发限制为 2、qps 4，遇到失败换通道（Bing/Google）或改用 DSH 模型即可。
- **日志**：每个批次的标准输出在 `DSH_HOME/babeldoc/logs/`。
- **改码不生效**：重新安装插件并强制刷新页面，见上一节。

## 限制

- 首次安装 Python 依赖需要网络，耗时取决于网络与 pip 镜像
- 扫描版（纯图片）PDF 没有可提取文字，无法翻译
- 译文版式由 BabelDOC 决定，复杂排版可能错位；问答回答需结合原文核对
- 译文页以图片呈现，导出的是 BabelDOC 生成的 PDF

## License

MIT
