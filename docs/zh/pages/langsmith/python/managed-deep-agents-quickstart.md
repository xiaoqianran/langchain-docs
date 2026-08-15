<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents quickstart | https://docs.langchain.com/langsmith/python/managed-deep-agents-quickstart -->

# 托管 Deep Agents 快速入门

使用 mda CLI 创建并部署您的第一个托管深度代理。

创建并部署您的第一个托管深度代理：构建项目，配置模型和指令，添加搜索，在[LangSmith Studio](/langsmith/studio)中进行测试，然后使用[⟦T14⟧ CLI](/langsmith/python/managed-deep-agents-cli)进行部署。托管 Deep Agents 提供 [Deep Agents harness](/oss/python/deepagents/overview) 和托管运行时。

在本快速入门之后，[tutorial](/langsmith/python/managed-deep-agents-tutorial) 在同一项目上添加了持久内存和每日计划。

<Note>
  托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 先决条件

要继续操作，您需要：

* Python 和 `uv`。

* 您选择的模型提供商的 API 密钥。

## 创建并部署代理

<Steps>
  <Step title="Set up the project">
    安装`managed-deepagents`，创建项目，并打开其目录：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv tool install managed-deepagents
    mda init research-assistant
    cd research-assistant
    ```

    您现在已经为您的代理准备好了所有的脚手架。
  </Step>

  <Step title="Add your keys">
    将您的模型提供商 API 密钥添加到 `.env`：

    ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    OPENAI_API_KEY=<OPENAI_API_KEY>
    # ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
    # GOOGLE_API_KEY=<GOOGLE_API_KEY>
    ```

    本快速入门默认使用 OpenAI。如果您在下一步中选择 Google 或 Anthropic，请改为设置该提供商的 API 密钥。 `mda deploy` 将提供程序密钥添加到部署中。您也可以使用任何 [other chat provider](/oss/python/integrations/chat/)。

    <Warning>
      不要将 `.env` 文件提交到版本控制中。它包含秘密。
    </Warning>
  </Step><Step title="Set up LangSmith">
    托管 Deep Agents 在 LangSmith 上运行。您的 LangSmith API 密钥使用 `mda dev` 验证本地开发，使用 `mda deploy` 部署代理，并在 [LangSmith Studio](/langsmith/studio) 中打开代理，以便您可以与其聊天并检查跟踪。

    [Sign up for LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-managed-deep-agents-quickstart) 如果您还没有帐户。

    要创建 LangSmith API 密钥，请打开 [Settings](https://smith.langchain.com/settings)，转至 **API 密钥**，然后单击 **创建 API 密钥**。欲了解更多详情，请参阅[Create an account and API key](/langsmith/create-account-api-key)。

    将您的 LangSmith API 密钥添加到 `.env`：

    ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
    ```
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

  <Step title="Configure your model and search">
    现在设置模型和内置网络搜索工具。 Google、OpenAI 和 Anthropic 提供服务器端搜索，无需额外的软件包或 API 密钥。传递与您的模型匹配的提供程序工具字典：

    打开`agent.py`：

    <CodeGroup>
      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from managed_deepagents import define_deep_agent

      # OpenAI's built-in web search — no extra install or API key needed
      agent = define_deep_agent(
          name="research-assistant",
          model="openai:gpt-5.5",
          tools=[{"type": "web_search"}],
      )
      ```

      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from managed_deepagents import define_deep_agent

      # Google's built-in search — no extra install or API key needed
      agent = define_deep_agent(
          name="research-assistant",
          model="google_genai:gemini-3.6-flash",
          tools=[{"google_search": {}}],
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from managed_deepagents import define_deep_agent

      # Anthropic's built-in web search — no extra install or API key needed
      agent = define_deep_agent(
          name="research-assistant",
          model="anthropic:claude-sonnet-4-6",
          tools=[{"type": "web_search_20260209", "name": "web_search"}],
      )
      ```
    </CodeGroup>

    代理名称也是默认部署名称。有关模型概念和提供程序选项，请参阅[Models](/oss/python/langchain/models)。

    <Accordion title="Using another provider?">
      您可以使用 Tavilly 搜索工具。
      将 [Tavily API key](https://app.tavily.com) 添加到 `.env`：

      ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      TAVILY_API_KEY=<TAVILY_API_KEY>
      ```

      安装Tavilly客户端：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add tavily-python
      ```创建自定义 `internet_search` 工具：

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

      有关更多创作工具，请参阅[Custom tools](/langsmith/python/managed-deep-agents-tools)。
    </Accordion>
  </Step>

  <Step title="Run locally">
    安装项目依赖项并启动代理：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv sync
    mda dev .
    ```

    `mda dev` 从 `.env` 加载 API 密钥，启动本地代理服务器，并在 LangSmith Studio 中打开代理。

    在 Studio 中，发送：

    ```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    What were the main announcements from the latest LangChain release?
    ```

    您应该看到代理调用网络搜索工具，然后返回引用来源的简洁答案。如果搜索从未出现在跟踪中，请确认提供程序工具字典与您在`agent.py`或`agent.ts`中设置的模型匹配。

    欲了解更多信息，请参阅[Develop locally with LangSmith Studio](/langsmith/python/managed-deep-agents-local-development)。
  </Step>

  <Step title="Deploy the agent">
    通过运行以下命令来部署项目：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda deploy .
    ```

    托管 Deep Agents 打包项目并将其作为托管部署在 [LangSmith Agent Server](/langsmith/agent-server) 上运行。部署完成后，CLI 会打印部署仪表板 URL。

    打开该网址。您应该看到部署处于就绪状态。发送上一步中的相同研究问题，并通过搜索工具调用确认托管代理返回答案。有关部署选项和机密处理的信息，请参阅[Deploy a Managed Deep Agent](/langsmith/python/managed-deep-agents-deploy)。要在代理运行后检查其执行情况，请使用[LangSmith observability](/langsmith/observability-quickstart)。
  </Step>
</Steps>## 后续步骤

<CardGroup>
  <Card title="Tutorial" icon="book" href="/langsmith/python/managed-deep-agents-tutorial">
    添加自定义 Tavilly 搜索工具、持久内存和每日日程安排。
  </Card>

  <Card title="Custom tools" icon="tool" href="/langsmith/python/managed-deep-agents-tools">
    从您的项目中添加创作的 LangChain 工具。
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