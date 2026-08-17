# dsh-babeldoc-pdf-translator

> DSH（DeepSeek Harness）标准插件包：在对话界面中直接打开 PDF，左侧原文、右侧 BabelDOC 译文并排对照阅读，支持全文翻译、逐页缓存、文档问答与译文导出。

这是一个**标准 DSH 插件**（npm 包格式），通过 DSH 官方插件命令一键安装，无需复制任何代码。

## ✨ 功能

- 📄 **双栏对照阅读**：左侧 pdf.js 渲染原文，右侧 BabelDOC 译文按页 PNG 渲染，独立滚动 + 比例同步开关
- 🌐 **全文自动翻译**：打开 PDF 自动从第 1 页开始，5 页/批 × 4 路并行（每路 qps 8），翻译完成自动拼接完整译文 PDF
- ⏸ **随时停止**：停止按钮真正终止全部翻译子进程；面板 ✕ 只收起界面
- 🔄 **逐页缓存**：每页译文按页号落盘缓存，中断后续翻，重复打开零 LLM 调用
- 🗂 **目录页识别**：自动识别目录页（点线 + 右对齐页码），目录页单页翻译后自动修复页码排版
- 💬 **文档问答**：基于 DSH 内置 LLM 服务，按当前页优先注入上下文，回答附带页码引用
- ⇩ **导出译文 PDF**：下载翻译完成的完整 PDF
- ⚙ **设置面板**：API Base URL / API Key / 翻译模型 / 目标语言 / 问答模型 / 自定义系统提示词 / 清空缓存 / 环境检查 / 一键安装缺失依赖

## 🚀 安装（真正的一条命令）

### 环境要求

- DSH（DeepSeek Harness），web profile
- Python 3.10+（未装 Python 依赖也不用怕：打开面板后 设置 → 更多设置 →「⚙ 一键安装缺失依赖」可自动 pip 安装 `babeldoc pymupdf openai httpx peewee`）

### 安装步骤

**只需一条命令**，插件会作为标准 DSH bundle 自动挂载（`dsh plugin` 会自动写入 `dsh.profile.bundles`，无需手动编辑任何配置文件）：

```bash
# 从 GitHub 安装
dsh plugin --profile web add github:poluce/dsh-babeldoc-pdf-translator

# 或发布到 npm 之后
dsh plugin --profile web add dsh-babeldoc-pdf-translator
```

然后**重启 DSH web**，会话头部出现「📄 双语PDF」按钮即可使用。

> 无需复制代码、无需编辑 `cordis.patch.yml`、无需手动挂载——包自带 `cordis.patch.yml` 并通过 `package.json` 的 `dsh.bundle.patch` 声明，安装命令自动完成挂载。

### 首次使用

1. 点击「📄 双语PDF」打开面板
2. ⚙ 设置 → 粘贴**你自己的** OpenCode Go API Key（`https://opencode.ai/zen/go/v1`），选择翻译模型（默认 `deepseek-v4-flash`）
3. 打开 PDF → 自动开始逐页翻译；也可点「翻译当前页」或「翻译全部」
4. 设置 → 更多设置 →「🔍 环境检查」一键确认 Python 依赖是否齐全；若缺失，点「⚙ 一键安装缺失依赖」自动补装

> 插件**不内置任何密钥**。API Key 仅保存在使用者的浏览器 localStorage 中，不会写入插件或仓库。

## 🧠 工作原理（简要）

| 环节 | 实现 |
|---|---|
| 架构 | 标准 DSH 双半区插件：Host = `TypertRemoteService`（`babeldoc` 命名空间，18 个 Remote 方法），Client = `__ModuleLoader__` 模块（`ctx.remote.babeldoc.*` 直调） |
| PDF 解析 | 内嵌 `parse_pdf.py`（pymupdf），支持文件路径与 base64 stdin 两种输入 |
| BabelDOC 调用 | 内嵌 `babeldoc_run.py`：补丁 httpx/openai UA 防 Cloudflare 403、peewee busy_timeout + 重试、启动前预热 SQLite 缓存库（WAL）解决 4 路并行锁竞争 |
| 目录页修复 | 内嵌 `fix_toc.py`：还原右对齐页码与点线引导 |
| 辅助脚本部署 | 首次使用时自动写入 `<workspaceRoot>/.dsh-babeldoc/`（幂等，已存在则跳过） |
| 译文展示 | `renderPage` 用 pymupdf 将译文页渲染为 PNG 返回浏览器 |
| 文档问答 | 通过 DSH `llm` 服务流式调用，按当前页优先组织上下文（24k 预算） |

## 📦 包结构

```
lib/index.js       # Host 半区：BabeldocService（18 个 Remote 方法 + 内嵌 Python 辅助脚本）
lib/client.js      # Client 半区：双栏阅读器 UI、4 路并行队列、设置抽屉
cordis.patch.yml   # bundle 挂载层（由 dsh plugin add 自动应用）
package.json       # dsh.client + dsh.bundle.patch + exports["./client"]
```

## ⚠️ 注意

- 翻译质量与成本取决于所选模型与 API 额度；文档问答回答可能不准确，请结合原文核对
- 缓存库位于 `~/.cache/babeldoc/cache.v1.db`，由 BabelDOC 管理
- 首次打开大 PDF 时左侧渲染依赖 CDN 加载 pdf.js（`cdn.jsdelivr.net`），需可访问外网

## 📄 License

MIT
