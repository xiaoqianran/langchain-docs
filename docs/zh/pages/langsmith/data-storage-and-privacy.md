<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Data storage and privacy | https://docs.langchain.com/langsmith/data-storage-and-privacy -->

# 数据存储和隐私

本文档介绍如何在内存服务器 (`langgraph dev`) 和本地 Docker 服务器 (`langgraph up`) 的LangGraph CLI 和代理服务器中处理数据。它还描述了与托管 Studio 前端交互时跟踪哪些数据。

## 命令行界面

LangGraph **CLI** 是用于构建和运行 LangGraph 应用程序的命令行界面；请参阅[CLI guide](/langsmith/cli)了解更多信息。

默认情况下，对大多数 CLI 命令的调用会在调用时记录单个分析事件。这有助于我们更好地优先考虑 CLI 体验的改进。每个遥测事件包含调用进程的操作系统、操作系统版本、Python 版本、CLI 版本、命令名称（`dev`、`up`、`run` 等）以及表示是否将标志传递给命令的布尔值。欲了解更多信息，请参阅[full analytics logic](https://github.com/langchain-ai/langgraph/blob/main/libs/cli/langgraph-cli/analytics.py)。

您可以通过设置 `LANGGRAPH_CLI_NO_ANALYTICS=1` 禁用所有 CLI 遥测。

<a id="in-memory-docker"></a>
## 代理服务器[Agent Server](/langsmith/agent-server) 提供了持久的执行运行时，它依赖于应用程序状态、长期记忆、线程元数据、助手以及本地文件系统或数据库的类似资源的持久检查点。除非您故意自定义存储位置，否则此信息将写入本地磁盘（对于`langgraph dev`）或 PostgreSQL 数据库（对于`langgraph up` 以及所有部署中）。

### LangSmith 追踪

运行代理服务器（在内存中或在 Docker 中）时，可以启用 LangSmith 跟踪，以促进更快的调试，并在生产中提供图形状态和 LLM 提示的可观察性。您始终可以通过在服务器的运行时环境中设置 `LANGSMITH_TRACING=false` 来禁用跟踪。

<Note>
为了进行更精细的控制，您可以使用[conditional tracing](/langsmith/conditional-tracing)根据运行时条件（例如客户端要求或数据敏感性）有选择地启用或禁用跟踪。
</Note>

<a id="langgraph-dev"></a>
### 内存开发服务器`langgraph dev` 将 [in-memory development server](/langsmith/local-dev-testing) 作为单个 Python 进程运行，专为快速开发和测试而设计。它将所有检查点和内存数据保存到磁盘当前工作目录中的`.langgraph_api`目录中。除了 [CLI](#cli) 部分中描述的遥测数据之外，除非您启用了跟踪或您的图形代码显式联系外部服务，否则不会有任何数据离开机器。

<a id="langgraph-up"></a>
### 独立服务器

`langgraph up` 将本地包构建到 Docker 映像中，并作为 [data plane](/langsmith/self-hosted) 运行服务器，该服务器由三个容器组成：API 服务器、PostgreSQL 容器和 Redis 容器。所有持久数据（检查点、助手等）都存储在 PostgreSQL 数据库中。 Redis 用作实时事件流的发布订阅连接。您可以通过设置有效的 `LANGGRAPH_AES_KEY` 环境变量，在保存到数据库之前加密所有检查点。您还可以为`langgraph.json`中的检查点和跨线程内存指定[TTLs](/langsmith/configure-ttl)来控制数据存储的时间。所有持久化的线程、内存和其他数据都可以通过相关的 API 端点删除。进行其他 API 调用以确认服务器具有有效许可证并跟踪已执行的运行和任务的数量。 API 服务器定期验证提供的许可证密钥（或 API 密钥）。

如果您禁用了 [tracing](#langsmith-tracing)，则除非您的图形代码显式联系外部服务，否则不会在外部保留任何用户数据。

## 工作室

[Studio](/langsmith/studio) 是一个用于与代理服务器交互的图形界面。它不会保留任何私人数据（您发送到服务器的数据不会发送到LangSmith）。虽然 Studio 界面在 [smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-data-storage-and-privacy) 上提供服务，但它在您的浏览器中运行并直接连接到本地代理服务器，因此不需要将数据发送到 LangSmith。

如果您已登录，LangSmith 会收集一些使用情况分析，以帮助改善调试用户体验。这包括：

* 页面访问和导航模式
* 用户操作（按钮点击）
* 浏览器类型和版本
* 屏幕分辨率和视口大小重要的是，不会收集任何应用程序数据或代码（或其他敏感配置详细信息）。所有这些都存储在代理服务器的持久层中。匿名使用 Studio 时，无需创建帐户，也不会收集使用情况分析。

## 快速参考

总之，您可以通过关闭 CLI 分析和禁用跟踪来选择退出服务器端遥测。

|变量|目的|默认|
| ------------------------------------------ | ---------------------------------- | -------------------------------- |
| `LANGGRAPH_CLI_NO_ANALYTICS=1` |禁用 CLI 分析 |启用分析 |
| `LANGSMITH_API_KEY` |启用 LangSmith 跟踪 |跟踪已禁用 |
| `LANGSMITH_TRACING=false` |禁用 LangSmith 跟踪 |取决于环境|

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/data-storage-and-privacy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>