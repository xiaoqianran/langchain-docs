<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents quickstart | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-quickstart -->

# 托管 Deep Agents 快速入门

使用 mda CLI 创建并部署您的第一个托管深度代理。

创建并部署您的第一个托管深度代理：构建项目、配置模型和指令、添加搜索、在 [LangSmith Studio](/langsmith/studio) 中测试，并使用 [⟦T13⟧ CLI](/langsmith/javascript/managed-deep-agents-cli) 进行部署。托管 Deep Agents 提供 [Deep Agents harness](/oss/javascript/deepagents/overview) 和托管运行时。

在本快速入门之后，[tutorial](/langsmith/javascript/managed-deep-agents-tutorial) 在同一项目上添加了持久内存和每日计划。

<Note>
  托管 Deep Agents 在 **公共 [beta](/langsmith/release-stages)** 中可用，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 先决条件

在开始之前，请确保您拥有：

* 具有托管 Deep Agents 公共测试版访问权限的组织。

* A [LangSmith API key](/langsmith/create-account-api-key)。

* Node.js 和 npm。

* 您选择的模型提供商的 API 密钥。

## 创建并部署代理

<Steps>
  <Step title="Set up the project">
    安装`managed-deepagents`，创建项目，并打开其目录：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install managed-deepagents
    mda init research-assistant
    cd research-assistant
    ```

    您现在已经为您的代理准备好了所有的脚手架。
  </Step>

  <Step title="Add your keys">
    将您的 LangSmith API 密钥和模型提供商 API 密钥添加到 `.env`：

    ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
    OPENAI_API_KEY=<OPENAI_API_KEY>
    # ANTHROPIC_API_KEY=<ANTHROPIC_API_KEY>
    # GOOGLE_API_KEY=<GOOGLE_API_KEY>
    ```

    要创建 LangSmith API 密钥、[sign up](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-managed-deep-agents-quickstart)，请打开 [Settings](https://smith.langchain.com/settings)，转至 **API 密钥**，然后单击 **创建 API 密钥**。欲了解更多详情，请参阅[Create an account and API key](/langsmith/create-account-api-key)。本快速入门默认使用 OpenAI。如果您在下一步中选择 Google 或 Anthropic，请改为设置该提供商的 API 密钥。 `mda deploy` 使用 LangSmith API 密钥来部署代理并将提供程序密钥添加到部署中。您也可以使用任何 [other chat provider](/oss/javascript/integrations/chat/)。

    <Warning>
      不要将 `.env` 文件提交到版本控制中。它包含秘密。
    </Warning>
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

    开放`agent.ts`：

    <CodeGroup>
      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { defineDeepAgent } from "managed-deepagents";

      // OpenAI's built-in web search — no extra install or API key needed
      export const agent = defineDeepAgent({
        name: "research-assistant",
        model: "openai:gpt-5.5",
        tools: [{ type: "web_search_preview" }],
      });
      ```

      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { defineDeepAgent } from "managed-deepagents";

      // Google's built-in search — no extra install or API key needed
      export const agent = defineDeepAgent({
        name: "research-assistant",
        model: "google-genai:gemini-3.6-flash",
        tools: [{ google_search: {} }],
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { defineDeepAgent } from "managed-deepagents";

      // Anthropic's built-in web search — no extra install or API key needed
      export const agent = defineDeepAgent({
        name: "research-assistant",
        model: "anthropic:claude-sonnet-4-6",
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      });
      ```
    </CodeGroup>

    代理名称也是默认部署名称。有关模型概念和提供程序选项，请参阅[Models](/oss/javascript/langchain/models)。

    <Accordion title="Using another provider?">
      您可以使用 Tavilly 搜索工具。
      将 [Tavily API key](https://app.tavily.com) 添加到 `.env`：

      ```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      TAVILY_API_KEY=<TAVILY_API_KEY>
      ```

      安装Tavilly客户端：

      ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/tavily
      ```

      创建自定义 `internet_search` 工具：

      ```ts tools/search.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { TavilySearch } from "@langchain/tavily";
      import { tool } from "langchain";
      import { z } from "zod";

      export const internetSearch = tool(
        async ({ query, maxResults = 5, topic = "general" }) => {
          const tavilySearch = new TavilySearch({
            maxResults,
            tavilyApiKey: process.env.TAVILY_API_KEY,
            topic,
          });
          return tavilySearch._call({ query });
        },
        {
          name: "internet_search",
          description: "Search the internet for relevant sources.",
          schema: z.object({
            query: z.string().describe("The search query."),
            maxResults: z.number().optional().default(5),
            topic: z.enum(["general", "news", "finance"]).optional().default("general"),
          }),
        },
      );
      ```

      导入工具并将其添加到代理中：```ts agent.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { defineDeepAgent } from "managed-deepagents";

      import { internetSearch } from "./tools/search";

      export const agent = defineDeepAgent({
        name: "research-assistant",
        model: "openai:gpt-5.5",
        tools: [internetSearch],
      });
      ```

      有关更多创作工具，请参阅[Custom tools](/langsmith/javascript/managed-deep-agents-tools)。
    </Accordion>
  </Step>

  <Step title="Run locally">
    安装项目依赖项并启动代理：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install
    mda dev .
    ```

    `mda dev` 从 `.env` 加载 API 密钥，启动本地代理服务器，并在 LangSmith Studio 中打开代理。

    在 Studio 中，发送：

    ```txt wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    What were the main announcements from the latest LangChain release?
    ```

    您应该看到代理调用网络搜索工具，然后返回引用来源的简洁答案。如果搜索从未出现在跟踪中，请确认提供程序工具字典与您在`agent.py`或`agent.ts`中设置的模型匹配。

    欲了解更多信息，请参阅[Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development)。
  </Step>

  <Step title="Deploy the agent">
    通过运行以下命令来部署项目：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    mda deploy .
    ```

    托管 Deep Agents 打包项目并将其作为托管部署在 [LangSmith Agent Server](/langsmith/agent-server) 上运行。部署完成后，CLI 会打印部署仪表板 URL。

    打开该网址。您应该看到部署处于就绪状态。发送上一步中的相同研究问题，并通过搜索工具调用确认托管代理返回答案。有关部署选项和机密处理的信息，请参阅[Deploy a Managed Deep Agent](/langsmith/javascript/managed-deep-agents-deploy)。要在代理运行后检查代理的执行情况，请使用[LangSmith observability](/langsmith/observability-quickstart)。
  </Step>
</Steps>

## 后续步骤<CardGroup>
  <Card title="Tutorial" icon="book" href="/langsmith/javascript/managed-deep-agents-tutorial">
    为这位研究助理添加持久记忆和每日日程安排。
  </Card>

  <Card title="Custom tools" icon="tool" href="/langsmith/javascript/managed-deep-agents-tools">
    从您的项目中添加创作的 LangChain 工具以及提供商搜索。
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