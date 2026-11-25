# 双语 PDF

在左侧栏打开 PDF，左边原文、右边 BabelDOC 译文，逐页对照阅读。

## 使用

1. 左侧栏点击「双语 PDF」。
2. 首次使用先在「设置」里点「安装依赖」。插件会在自己的数据目录
   （`%USERPROFILE%\.dsh\babeldoc`，即 `DSH_HOME/babeldoc`）创建独立 Python 虚拟环境，
   并安装 `babeldoc pymupdf openai httpx peewee`；不会改动系统 Python。
3. 选择翻译模型：「模型来源」有三种——
   - DSH 模型：列出 DSH 模型渠道里配置的全部 provider/模型，可在设置或顶部工具栏切换；
     新增渠道后点「刷新模型列表」；发现不到模型时可直接输入模型 ID；
   - 内置免费翻译：选 Bing 或 Google，走 DSH 的匿名翻译端点，无需 Key、不消耗额度；
   - 自定义 OpenAI 兼容 API：填写地址、Key 与模型。
4. 「打开 PDF」→ 选择文件。PDF 保存在插件数据目录，按内容哈希去重。
5. 「翻译本页」或「翻译全部」。翻译在 Host 后台按批执行，可以随时「停止」；
   已完成的页面写入逐页缓存，下次打开或继续翻译不会重复调用模型。
6. 右侧译文逐页显示，可「导出」为合并后的译文 PDF。

## 工作方式

- 页面图像由 Host 用 PyMuPDF 渲染为 PNG，浏览器不需要加载 pdf.js 或访问 CDN。
- 翻译按批调用 BabelDOC（每批多页），完成后拆回单页缓存；
  目录页会自动识别并修复右对齐页码与点线。
- 文档问答使用 DSH 内置 LLM 服务，按当前页优先组织上下文，回答标注来源页码。
- 所有能力通过 `/babeldoc/api` 的同源 HTTP 接口提供，不依赖动态 Remote 命名空间。
- 选择「DSH 模型」时，BabelDOC 请求发往插件自身暴露的 OpenAI 兼容桥
  `/babeldoc/api/llm/<provider>/<model>/v1/chat/completions`，由 Host 转给 `ctx.llm.stream`。
- 选择「内置免费翻译」时，同一桥把 BabelDOC 的 JSON 批量提示拆成逐条文本，
  交给 DSH 内置 `translator` 服务（Bing/Google 匿名端点）翻译后再拼回 JSON，
  并保护 `{v1}`、`%s`、HTML 标签等占位符。

## 限制

- 首次安装 Python 依赖需要联网，耗时取决于网络与镜像。
- 扫描版（纯图片）PDF 没有可提取文字，BabelDOC 无法翻译。
- 译文版式由 BabelDOC 决定，复杂排版可能出现错位；问答回答也需结合原文核对。
- 免费翻译走 Bing/Google 匿名端点，逐段机器翻译，措辞比大模型朴素，且可能被临时限流；
  该模式已把并发限制为 2、qps 4，失败时换通道或改用 DSH 模型。
- 译文页以图片呈现，导出的是 BabelDOC 生成的 PDF，不是可编辑文本。
