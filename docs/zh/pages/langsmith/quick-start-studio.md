<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get started with Studio | https://docs.langchain.com/langsmith/quick-start-studio -->

# 开始使用 Studio

[LangSmith Agent Server UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-quick-start-studio)中的[Studio](/langsmith/studio)支持连接两种类型的图：

* Graphs deployed on [cloud or self-hosted](#deployed-graphs).
* 使用 [Agent Server](#local-development-server) 在本地运行的图表。

## Deployed graphs

Studio 可通过 **代理服务器** 导航在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-quick-start-studio) 中访问。

对于 [deployed](/langsmith/deployment-quickstart) 的应用程序，您可以将 Studio 作为该代理服务器的一部分进行访问。为此，请导航到 UI 中的代理服务器并选择 **Studio**。

这将加载连接到实时代理服务器的 Studio，允许您在该代理服务器中创建、读取和更新 [threads](/oss/python/langgraph/checkpointers#threads)、[assistants](/langsmith/assistants) 和 [memory](/oss/python/concepts/memory)。

## Local development server

### 先决条件

要使用 Studio 在本地测试您的应用程序：

* Follow the [local application quickstart](/langsmith/local-dev-testing) first.
* 如果您不需要数据 [traced](/langsmith/observability-concepts#traces) 至 LangSmith，请在应用程序的 `.env` 文件中设置 `LANGSMITH_TRACING=false`。禁用跟踪后，没有数据离开您的本地服务器。

### 设置

1. 安装[LangGraph CLI](/langsmith/cli)：

   ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   pip install -U "langgraph-cli[inmem]"
   langgraph dev
   ```

   ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   uv add "langgraph-cli[inmem]"
   langgraph dev
   ```

   ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   npx @langchain/langgraph-cli dev
   ```> [!警告]
   >
   > **浏览器兼容性**
   > Safari blocks `localhost` connections to Studio. To work around this, run the command with `--tunnel` to access Studio via a secure tunnel. You'll need to manually add the tunnel URL to allowed origins by clicking **Connect to a local server** in the Studio UI.步骤请参阅[troubleshooting guide](/langsmith/troubleshooting-studio#safari-connection-issues)。

   This will start the Agent Server locally, running in-memory. The server will run in watch mode, listening for and automatically restarting on code changes. Read this [reference](/langsmith/cli#dev) to learn about all the options for starting the API server.

   您将看到以下日志：

   ```
   > Ready!
   >
   > - API: [http://localhost:2024](http://localhost:2024/)
   >
   > - Docs: http://localhost:2024/docs
   >
   > - LangSmith Studio Web UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
   ```

   Once running, you will automatically be directed to Studio.

2. For a running server, access the Dbugger with one of the following:

   1. Directly navigate to the following URL: `https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024`.
   2. Navigate to **Agent Servers** in the UI, click the **Studio** button on an Agent Server, enter `http://127.0.0.1:2024` and click **Connect**.

   If running your server at a different host or port, update the `baseUrl` to match.

### （可选）附加调试器

For step-by-step debugging with breakpoints and variable inspection, run the following:

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Install debugpy package
pip install debugpy
# Start server with debugging enabled
langgraph dev --debug-port 5678
```

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Install debugpy package
uv add debugpy
# Start server with debugging enabled
langgraph dev --debug-port 5678
```

然后附加您首选的调试器：> [选项卡] VS 代码
>
> 将此配置添加到`launch.json`：
>
> ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> {
>     "name": "Attach to LangGraph",
>     "type": "debugpy",
>     "request": "attach",
>     "connect": {
>       "host": "0.0.0.0",
>       "port": 5678
>     }
> }
> ```

> [选项卡] PyCharm
>
> 1. 转到运行 > 编辑配置
> 2.点击+并选择“Python调试服务器”
> 3.设置IDE主机名：`localhost`
> 4. Set port: `5678` (or the port number you chose in the previous step)
> 5.点击“确定”开始调试

> [!提示]
>
> For issues getting started, refer to the [troubleshooting guide](/langsmith/troubleshooting-studio).

## 后续步骤

For more information on how to run Studio, refer to the following guides:

* [Run application](/langsmith/use-studio#run-application)
* [Manage assistants](/langsmith/use-studio#manage-assistants)
* [Manage threads](/langsmith/use-studio#manage-threads)
* [Iterate on prompts](/langsmith/observability-studio)
* [Debug LangSmith traces](/langsmith/observability-studio#debug-langsmith-traces)
* [Add node to dataset](/langsmith/observability-studio#add-node-to-dataset)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/quick-start-studio.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。