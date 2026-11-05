<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Observability | https://docs.langchain.com/oss/javascript/langchain/observability -->

# LangSmith 可观测性

当您使用LangChain构建和运行代理时，您需要了解它们的行为方式：它们调用哪个[tools](/oss/javascript/langchain/tools)、它们生成什么提示以及它们如何做出决策。使用[⟦T4⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)构建的LangChain代理自动支持通过[LangSmith](/langsmith/observability)进行跟踪，[LangSmith](/langsmith/observability)是一个用于捕获、调试、评估和监控代理行为的平台。

[*Traces*](/langsmith/observability-concepts#traces) 记录代理执行的每一步，从初始用户输入到最终响应，包括所有工具调用、模型交互和决策点。此执行数据可帮助您调试问题、评估不同输入的性能以及监控生产中的使用模式。

本指南向您展示如何为 LangChain 代理启用跟踪并使用 LangSmith 分析其执行情况。

## 先决条件

在开始之前，请确保您具备以下条件：

* **LangSmith帐户**：注册（免费）或在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-observability)登录。
* **A LangSmith API 密钥**：遵循 [Create an API key](/langsmith/create-account-api-key) 指南。

## 启用跟踪

> [!注意]
>
> 在发送跟踪之前，在[agent-based workspace](/langsmith/agent-registry)、[create an agent](/langsmith/create-an-agent) 中进行一次。使用[agent addressing](/langsmith/log-traces-to-agent)选择其标识符和环境。如果集成需要 `project_name`，请使用所选环境的 [⟦T6⟧](/langsmith/create-an-agent#use-an-environment-project) 作为兼容性值。所有LangChain代理自动支持LangSmith跟踪。要启用它，请设置以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_AGENT_ID="<your-agent-id>"
export LANGSMITH_AGENT_ENVIRONMENT="local"
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
```

## 快速入门

无需额外代码即可将跟踪记录到 LangSmith。只需像平常一样运行代理代码：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "@langchain/agents";

function sendEmail(to: string, subject: string, body: string): string {
    // ... email sending logic
    return `Email sent to ${to}`;
}

function searchWeb(query: string): string {
    // ... web search logic
    return `Search results for: ${query}`;
}

const agent = createAgent({
    model: "gpt-5.5",
    tools: [sendEmail, searchWeb],
    systemPrompt: "You are a helpful assistant that can send emails and search the web."
});

// Run the agent - all steps will be traced automatically
const response = await agent.invoke({
    messages: [{ role: "user", content: "Search for the latest AI news and email a summary to john@example.com" }]
});
```

跟踪显示在设置期间配置的目标中。

## 有选择地跟踪

您可以选择使用 LangSmith 的 `tracing_context` 上下文管理器来跟踪特定调用或代理的部分：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

// This WILL be traced
const tracer = new LangChainTracer();
await agent.invoke(
  {
    messages: [{role: "user", content: "Send a test email to alice@example.com"}]
  },
  { callbacks: [tracer] }
);

// This will NOT be traced (if LANGSMITH_TRACING is not set)
await agent.invoke(
  {
    messages: [{role: "user", content: "Send another email"}]
  }
);
```

## 选择代理和环境

使用`LANGSMITH_AGENT_ID`和`LANGSMITH_AGENT_ENVIRONMENT`选择注册的代理和环境。对于每个请求路由，请在代码中传递代理地址。参见[Log traces to an agent](/langsmith/log-traces-to-agent)。

> [手风琴] 基于项目的工作区和自托管 LangSmith
>
> 将 `LANGSMITH_PROJECT` 设置为跟踪项目名称，而不是设置代理变量。对于在基于代理的工作区中需要 `project_name` 的集成，请使用环境的 [⟦T12⟧](/langsmith/create-an-agent#use-an-environment-project) 作为兼容性值。

## 将元数据添加到跟踪中

您可以使用自定义元数据和标签来注释您的跟踪：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

const tracer = new LangChainTracer();
await agent.invoke(
  {
    messages: [{role: "user", content: "Send a test email to alice@example.com"}]
  },
  {
    tags: ["production", "email-assistant", "v1.0"],
    metadata: {
      userId: "user123",
      sessionId: "session456",
      environment: "production"
    }
  },
);

```

此自定义元数据和标签将附加到 LangSmith 中的跟踪。

> [!提示]
>
> 要了解有关如何使用跟踪来调试、评估和监控代理的更多信息，请参阅 [LangSmith documentation](/langsmith/observability)。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/observability.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。