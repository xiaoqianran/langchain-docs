<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Get started with Studio | https://docs.langchain.com/langsmith/quick-start-studio -->

# 开始使用 Studio

[LangSmith Deployment UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-quick-start-studio)中的[Studio](/langsmith/studio)支持连接两种类型的图：

- 部署在[cloud or self-hosted](#deployed-graphs)上的图表。
- 使用 [Agent Server](#local-development-server) 在本地运行的图表。

## 部署图

Studio 可通过 **部署** 导航在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-quick-start-studio) 中访问。

对于 [deployed](/langsmith/deployment-quickstart) 的应用程序，您可以在部署过程中访问 Studio。为此，请导航到 UI 中的部署并选择 **Studio**。

这将加载连接到实时部署的 Studio，允许您在该部署中创建、读取和更新 [threads](/oss/python/langgraph/checkpointers#threads)、[assistants](/langsmith/assistants) 和 [memory](/oss/python/concepts/memory)。

## 本地开发服务器

### 先决条件

要使用 Studio 在本地测试您的应用程序：

- 首先遵循[local application quickstart](/langsmith/local-dev-testing)。
- 如果您不需要数据[traced](/langsmith/observability-concepts#traces)到LangSmith，请在应用程序的`.env`文件中设置`LANGSMITH_TRACING=false`。禁用跟踪后，没有数据离开您的本地服务器。

### 设置

1. 安装[LangGraph CLI](/langsmith/cli)：

    <CodeGroup>
    ```bash pip
    pip install -U "langgraph-cli[inmem]"
    langgraph dev
    ```

    ```bash uv
    uv add "langgraph-cli[inmem]"
    langgraph dev
    ```

    ```bash npm
    npx @langchain/langgraph-cli dev
    ```
    </CodeGroup><Warning>
    **浏览器兼容性**
    Safari 阻止 `localhost` 与 Studio 的连接。要解决此问题，请使用 `--tunnel` 运行命令以通过安全隧道访问 Studio。您需要通过单击 Studio UI 中的 **连接到本地服务器** 来手动将隧道 URL 添加到允许的源。步骤请参阅[troubleshooting guide](/langsmith/troubleshooting-studio#safari-connection-issues)。
    </Warning>

    这将在本地启动代理服务器，并在内存中运行。服务器将以监视模式运行，侦听代码更改并自动重新启动。阅读此[reference](/langsmith/cli#dev)，了解启动 API 服务器的所有选项。

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

    运行后，您将自动定向到 Studio。

1. 对于正在运行的服务器，请使用以下方式之一访问 Dbugger：
    1. 直接导航至以下网址：`https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024`。
    1. 导航到 UI 中的 **部署**，单击部署上的 **Studio** 按钮，输入 `http://127.0.0.1:2024` 并单击 **连接**。

    如果在不同的主机或端口上运行服务器，请更新 `baseUrl` 以匹配。

### （可选）附加调试器

要使用断点和变量检查进行逐步调试，请运行以下命令：

    <CodeGroup>
    ```bash pip
    # Install debugpy package
    pip install debugpy
    # Start server with debugging enabled
    langgraph dev --debug-port 5678
    ```

    ```bash uv
    # Install debugpy package
    uv add debugpy
    # Start server with debugging enabled
    langgraph dev --debug-port 5678
    ```
    </CodeGroup>然后附加您首选的调试器：

<Tabs>
    <Tab title="VS Code">
    将此配置添加到`launch.json`：

    ```json
    {
        "name": "Attach to LangGraph",
        "type": "debugpy",
        "request": "attach",
        "connect": {
          "host": "0.0.0.0",
          "port": 5678
        }
    }
    ```
    </Tab>
    <Tab title="PyCharm">
    1. 转到运行→编辑配置
    2.点击+并选择“Python调试服务器”
    3.设置IDE主机名：`localhost`
    4. 设置端口：`5678`（或者您在上一步中选择的端口号）
    5.点击“确定”开始调试
    </Tab>
</Tabs>

<Tip>
有关入门问题，请参阅[troubleshooting guide](/langsmith/troubleshooting-studio)。
</Tip>

## 后续步骤

有关如何运行 Studio 的更多信息，请参阅以下指南：

- [Run application](/langsmith/use-studio#run-application)
- [Manage assistants](/langsmith/use-studio#manage-assistants)
- [Manage threads](/langsmith/use-studio#manage-threads)
- [Iterate on prompts](/langsmith/observability-studio)
- [Debug LangSmith traces](/langsmith/observability-studio#debug-langsmith-traces)
- [Add node to dataset](/langsmith/observability-studio#add-node-to-dataset)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/quick-start-studio.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>