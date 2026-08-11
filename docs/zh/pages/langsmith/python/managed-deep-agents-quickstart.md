<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents quickstart | https://docs.langchain.com/langsmith/python/managed-deep-agents-quickstart -->

# 托管 Deep Agents 快速入门

使用 mda CLI 创建并部署您的第一个托管深度代理。

创建一个代理项目，在 [LangSmith Studio](/langsmith/studio) 中进行本地测试，然后使用 [⟦T12⟧ CLI](/langsmith/python/managed-deep-agents-cli) 将其部署到托管的 LangSmith 基础设施。项目文件夹包含代理的模型、说明和工具。托管 Deep Agents 提供 [Deep Agents harness](/oss/python/deepagents/overview) 和托管运行时。

<Note>
  托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 先决条件

在开始之前，请确保您拥有：

* 具有托管 Deep Agents 公共测试版访问权限的组织。

* A [LangSmith API key](/langsmith/create-account-api-key)。

* Python 和 `uv`。

* 您选择的模型提供商的 API 密钥。

## 创建并部署代理

<Steps>
  <Step title="Install the package">
    安装`managed-deepagents`。该软件包包括 `mda` CLI。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv tool install managed-deepagents
    ```
  </Step>

  <Step title="Create a project">
    创建一个项目并打开其目录：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda init research-assistant
    cd research-assistant
    ```

    您在此快速入门中编辑的文件是：

    * **`agent.py`**：定义并导出代理。参见[Agent definition](/langsmith/python/managed-deep-agents-agent-definition)。

    * **[⟦T17⟧](/langsmith/python/managed-deep-agents-instructions)**：包含描述代理应如何行为的提示。

    * **`.env`**：存储用于本地开发和部署的 API 密钥。不要提交该文件。

    对于所有生成的文件，请参阅[Project structure](/langsmith/python/managed-deep-agents-project-structure)。
  </Step><Step title="Add API keys">
    将您的 LangSmith API 密钥和模型提供商 API 密钥添加到 `.env`：

    ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
    OPENAI_API_KEY=<OPENAI_API_KEY>
    ```

    此示例使用 [OpenAI chat model](/oss/python/integrations/chat/openai)。如果您选择其他模型提供商，请添加该提供商所需的 API 密钥。 `mda deploy` 使用 LangSmith API 密钥来部署代理并将提供程序密钥添加到部署中。
  </Step>

  <Step title="Configure the agent">
    打开`agent.py`，设置代理名称和型号：

    ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from managed_deepagents import define_deep_agent

    agent = define_deep_agent(
        name="research-assistant",
        model="openai:gpt-5.5",
    )
    ```

    该模型处理代理的语言理解和推理。代理名称也是默认部署名称。有关模型概念和提供程序选项，请参阅[Models](/oss/python/langchain/models)。
  </Step>

  <Step title="Edit the instructions">
    打开 `instructions.md` 并描述代理应该如何表现：

    ```markdown instructions.md theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Research assistant

    You are a careful research assistant. Use internet search to find sources,
    keep notes, and return concise answers with citations.
    ```

    部署时，托管 Deep Agents 会将这些指令同步到 [LangSmith Context Hub](/langsmith/use-the-context-hub)，您可以在其中更新它们，而无需重新部署代理。
  </Step>

  <Step title="Add an internet search tool">
    工具是代理可以调用来检索数据或采取操作的函数。选择模型提供商的服务器端搜索或使用 Tavily 创建 [custom LangChain tool](/oss/python/langchain/tools)。

    <Tabs>
      <Tab title="Provider search (recommended)">
        OpenAI 提供了一个在服务器端运行的内置网络搜索工具，因此不需要其他包或 API 密钥。直接添加到代理中：

        ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from managed_deepagents import define_deep_agent

        agent = define_deep_agent(
            name="research-assistant",
            model="openai:gpt-5.5",
            tools=[{"type": "web_search"}],
        )
        ```
      </Tab>

      <Tab title="Tavily (any provider)">
        将 [Tavily API key](https://app.tavily.com) 添加到 `.env`：```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        TAVILY_API_KEY=<TAVILY_API_KEY>
        ```

        安装Tavilly客户端：

        ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        uv add tavily-python
        ```

        创建自定义 `internet_search` 工具：

        ```python tools/search.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import os
        from typing import Literal

        from langchain.tools import tool
        from tavily import TavilyClient


        tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])


        @tool
        def internet_search(
            query: str,
            max_results: int = 5,
            topic: Literal["general", "news", "finance"] = "general",
        ) -> dict:
            """Search the internet for relevant sources."""
            return tavily_client.search(
                query,
                max_results=max_results,
                topic=topic,
            )
        ```

        导入工具并将其添加到代理中：

        ```python agent.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        from managed_deepagents import define_deep_agent

        from tools.search import internet_search

        agent = define_deep_agent(
            name="research-assistant",
            model="openai:gpt-5.5",
            tools=[internet_search],
        )
        ```
      </Tab>
    </Tabs>

    欲了解更多信息，请参阅[Custom tools](/langsmith/python/managed-deep-agents-tools)。
  </Step>

  <Step title="Run locally">
    安装项目依赖项并启动代理：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv sync
    mda dev .
    ```

    `mda dev` 从 `.env` 加载 API 密钥，启动本地代理服务器，并在 LangSmith Studio 中打开代理。在 Studio 中发送消息以检查模型响应和工具调用。欲了解更多信息，请参阅[Develop locally with LangSmith Studio](/langsmith/python/managed-deep-agents-local-development)。
  </Step>

  <Step title="Deploy the agent">
    部署项目：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda deploy .
    ```

    托管 Deep Agents 打包项目并将其作为托管部署在 [LangSmith Agent Server](/langsmith/agent-server) 上运行。部署完成后，CLI 会打印部署仪表板 URL。打开它以查看和测试已部署的代理。

    有关部署选项和机密处理的信息，请参阅[Deploy a Managed Deep Agent](/langsmith/python/managed-deep-agents-deploy)。要在代理运行后检查代理的执行情况，请使用[LangSmith observability](/langsmith/observability-quickstart)。
  </Step>
</Steps>

## 后续步骤

<CardGroup>
  <Card title="Tutorial" icon="book" href="/langsmith/python/managed-deep-agents-tutorial">
    从空目录构建预定的研究代理。
  </Card>

  <Card title="Identity" icon="fingerprint" href="/langsmith/python/managed-deep-agents-identity">
    对调用者进行身份验证并提供私有线程。
  </Card>

  <Card title="Memory" icon="brain" href="/langsmith/python/managed-deep-agents-memory">
    使用 Context Hub `/memories` 跨线程保留首选项。
  </Card><Card title="Evals" icon="flask" href="/langsmith/python/managed-deep-agents-evals">
    编写 Harbor 任务并编译 Harbor 的托管代理。
  </Card>

  <Card title="Custom tools" icon="tool" href="/langsmith/python/managed-deep-agents-tools">
    从项目源添加创作的 LangChain 工具。
  </Card>

  <Card title="MCP connectors" icon="plug" href="/langsmith/python/managed-deep-agents-mcp-connectors">
    从远程 MCP 服务器添加工具。
  </Card>

  <Card title="Custom middleware" icon="code" href="/langsmith/python/managed-deep-agents-middleware">
    围绕模型和工具调用添加内置或自定义中间件。
  </Card>

  <Card title="Schedules" icon="calendar" href="/langsmith/python/managed-deep-agents-schedules">
    根据托管 cron 计划运行代理。
  </Card>

  <Card title="Deploy an agent" icon="upload" href="/langsmith/python/managed-deep-agents-deploy">
    使用 `mda` 测试和部署托管 Deep Agents。
  </Card>

  <Card title="CLI reference" icon="terminal" href="/langsmith/python/managed-deep-agents-cli">
    查看 `mda init`、`mda evals`、`mda dev` 和 `mda deploy`。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>