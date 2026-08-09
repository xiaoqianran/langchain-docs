<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangChain overview | https://docs.langchain.com/oss/javascript/langchain/overview -->

# LangChain 概述

LangChain 提供了 create_agent：一个最小的、高度可配置的代理工具。从模型、工具、提示和中间件中准确构建您的用例所需的代理。

**Agent = Model + Harness。** LangChain 提供`create_agent`：一个最小的、高度可配置的harness。线束是模型循环周围的一切：提示、工具和任何塑造行为的中间件。从原语开始，准确地组合您的用例所需的内容。支持[OpenAI, Anthropic, Google, and more](/oss/javascript/integrations/providers/overview)。

<Tip>
  **LangChain 与 LangGraph 与深度代理**

  从 [Deep Agents](/oss/javascript/deepagents/overview/) 开始，获得“包含电池”的代理，具有自动上下文压缩、虚拟文件系统和子代理生成等功能。 Deep Agents基于LangChain[agents](/oss/javascript/langchain/agents/)构建，您也可以直接使用。

  使用 [LangChain](/oss/javascript/langchain/agents) (`create_agent`) 打造高度可定制的线束，轻松根据您的用例和数据进行定制。

  使用我们的低级编排框架[LangGraph](/oss/javascript/langgraph/overview)来满足结合确定性和代理工作流程的高级需求。使用 [LangSmith](/langsmith/observability) 跟踪、调试和评估使用任何这些框架构建的代理。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监控您的痕迹、检测问题并提出修复建议。
</Tip>

## <Icon icon="wand" /> 创建代理

此示例演示如何使用自定义工具创建简单的 LangChain 代理：

<CodeGroup>
  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod @langchain/openai
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "gpt-5.5",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts Google Gemini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod @langchain/google-genai
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "google-genai:gemini-2.5-flash-lite",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts Claude (Anthropic) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod @langchain/anthropic
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "claude-sonnet-4-6",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod @langchain/openrouter
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "openrouter:anthropic/claude-sonnet-4-6",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/qwen3p5-397b-a17b",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod @langchain/ollama
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "ollama:devstral-2",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts Azure theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod @langchain/openai
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "azure_openai:gpt-5.5",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```

  ```ts AWS Bedrock theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // First install: npm install langchain zod @langchain/aws
  import { createAgent, tool } from "langchain";
  import * as z from "zod";

  const getWeather = tool(
    (input) => `It's always sunny in ${input.city}!`,
    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string().describe("The city to get the weather for"),
      }),
    }
  );

  const agent = createAgent({
    model: "bedrock:gpt-5.5",
    tools: [getWeather],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: "user", content: "What's the weather in San Francisco?" }],
    })
  );
  ```
</CodeGroup>

请参阅[Installation instructions](/oss/javascript/langchain/install)和[Quickstart guide](/oss/javascript/langchain/quickstart)开始使用LangChain构建您自己的代理和应用程序。

<Tip>
  使用 [LangSmith](/langsmith/observability) 跟踪请求、调试代理行为并评估输出。设置 `LANGSMITH_TRACING=true` 和您的 API 密钥即可开始。
</Tip>

## <Icon icon="star" /> 核心优势

<Columns>
  <Card title="Standard model interface" icon="refresh" href="/oss/javascript/langchain/models">
    使用一个界面来实现跨提供商的聊天模型、嵌入等。只需最少的代码更改即可切换模型，并随着需求的变化保持应用程序的可移植性。
  </Card>

  <Card title="Highly configurable harness" icon="wand" href="/oss/javascript/langchain/agents">
    从 `create_agent` 作为最小的工具开始，并通过中间件逐步添加功能。仅编写您的用例所需的内容，从护栏和重试到路由和自定义工具策略。
  </Card><Card title="Built on top of LangGraph" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/langgraph-icon.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=b997e1a7487d507a36556eedbfd99f81" href="/oss/javascript/langgraph/overview">
    LangChain的代理是建立在LangGraph之上的。这使我们能够利用 LangGraph 的持久执行、人机交互支持、持久性等。
  </Card>

  <Card title="Debug with LangSmith" icon="https://mintcdn.com/langchain-5e9cc07a/nQm-sjd_MByLhgeW/images/brand/observability-icon-dark.png?fit=max&auto=format&n=nQm-sjd_MByLhgeW&q=85&s=ccbc183bca2a5e4ca78d30149e3836cc" href="/langsmith/observability">
    在一处检查跟踪、工具调用、状态转换和延迟。查找故障模式、评估质量并利用执行数据改进代理行为。
  </Card>
</Columns>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>