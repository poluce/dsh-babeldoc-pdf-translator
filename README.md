# DSH BabelDOC PDF 双语阅读器

> 在 DeepSeek Harness 对话界面中直接打开 PDF，左侧原文、右侧 BabelDOC 译文并排对照阅读，支持全文翻译、逐页缓存、文档问答与译文导出。

一个完全自包含的 DSH 动态 Cordis 插件（Host + Client 双半区），翻译引擎使用 [funstory-ai/BabelDOC](https://github.com/funstory-ai/BabelDOC)（OpenAI 兼容接口），不依赖任何机器专属路径。

## ✨ 功能

- 📄 **双栏对照阅读**：左侧 pdf.js 渲染原文，右侧 BabelDOC 译文按页 PNG 渲染，独立滚动 + 比例同步开关
- 🌐 **全文自动翻译**：打开 PDF 自动从第 1 页开始，5 页/批 × 4 路并行（每路 qps 8），翻译完成自动拼接完整译文 PDF
- ⏸ **随时停止**：停止按钮会真正终止全部翻译子进程；面板 ✕ 只收起界面
- 🔄 **逐页缓存**：每页译文按页号落盘缓存，中断后续翻，重复打开零 LLM 调用
- 🗂 **目录页识别**：自动识别目录页（点线 + 右对齐页码），目录页单页翻译后自动修复页码排版
- 💬 **文档问答**：基于 DSH 内置 LLM 服务，按当前页优先注入上下文，回答附带页码引用
- ⇩ **导出译文 PDF**：下载翻译完成的完整 PDF
- ⚙ **设置面板**：API Base URL / API Key / 翻译模型 / 目标语言 / 问答模型 / 自定义系统提示词 / 清空缓存 / 环境检查

## 🚀 安装

### 环境要求

- DeepSeek Harness（DSH）运行环境
- Python 3.10+，且已安装：

```bash
pip install babeldoc pymupdf openai httpx peewee
```

### 安装插件（两种方式任选）

**方式 A：动态插件（推荐，无需重启）**

1. 打开本仓库的 `host.js`，在 DSH 会话中调用 `cordis_define`，参数如下：

```js
plugin: { kind: "new", idPrefix: "babel" }   // 首次安装；升级时用 kind: "existing" + 你的 pluginId
name: "babeldoc 双语PDF"
code: {
  host:   /* host.js 的完整内容 */,
  client: /* client.js 的完整内容 */
}
```

2. 用返回的 `packageId` 调用 `cordis_run`（mode: `run`）激活。
3. 刷新页面后，会话头部出现「📄 双语PDF」按钮。

**方式 B：静态插件（随部署分发）**

将本仓库放入你的 DSH 插件目录（如 `agent-presets/` 或部署配置引用的目录），并在 `cordis.yml` 对应位置挂载。具体挂载方式取决于你的部署结构，参见 DSH 文档。

### 首次使用

1. 点击「📄 双语PDF」打开面板
2. ⚙ 设置 → 粘贴**你自己的** OpenCode Go API Key（`https://opencode.ai/zen/go/v1`），选择翻译模型（默认 `deepseek-v4-flash`）
3. 打开 PDF → 自动开始逐页翻译；也可点「翻译当前页」或「翻译全部」
4. 设置 → 更多设置 →「🔍 环境检查」可一键确认 Python 依赖是否齐全

> 插件**不内置任何密钥**。API Key 仅保存在使用者的浏览器 localStorage 中，不会写入插件或仓库。

## 🧠 工作原理（简要）

| 环节 | 实现 |
|---|---|
| PDF 解析 | 内嵌 `parse_pdf.py`（pymupdf），支持文件路径与 base64 stdin 两种输入 |
| BabelDOC 调用 | 内嵌 `babeldoc_run.py`：补丁 httpx/openai UA 防 Cloudflare 403、peewee busy_timeout + 重试、启动前预热 SQLite 缓存库（WAL）解决 4 路并行锁竞争 |
| 目录页修复 | 内嵌 `fix_toc.py`：还原右对齐页码与点线引导 |
| 辅助脚本部署 | 首次使用时自动写入 `<workspaceRoot>/.dsh-babeldoc/`（幂等，已存在则跳过） |
| 译文展示 | `renderPage` 用 pymupdf 将译文页渲染为 PNG 返回浏览器 |
| 文档问答 | 通过 DSH `llm` 服务流式调用，按当前页优先组织上下文（24k 预算） |

## 🗂 仓库结构

```
host.js      # Host 半区：所有 babeldoc.* RPC handler + 内嵌 Python 辅助脚本
client.js    # Client 半区：双栏阅读器 UI、队列调度、设置抽屉
```

## ⚠️ 注意

- 翻译质量与成本取决于所选模型与 API 额度；文档问答回答可能不准确，请结合原文核对
- 缓存库位于 `~/.cache/babeldoc/cache.v1.db`，由 BabelDOC 管理
- 首次打开大 PDF 时左侧渲染依赖 CDN 加载 pdf.js（`cdn.jsdelivr.net`），需可访问外网

## 📄 License

MIT
