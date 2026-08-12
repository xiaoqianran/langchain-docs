<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Quickstart | https://docs.langchain.com/oss/javascript/langchain/quickstart -->

# 快速入门

在几分钟内建立您的第一个代理

本快速入门向您展示如何在短短几分钟内创建功能齐全的 AI 代理。

<Tip>
  **使用人工智能编码助手？**

  * 安装 [LangChain Docs MCP server](/use-these-docs) 以使您的代理能够访问最新的 LangChain 文档和示例。
  * 安装[LangChain Skills](https://github.com/langchain-ai/langchain-skills)以提高代理在LangChain生态系统任务上的性能。
</Tip>

## 安装依赖项

安装以下软件包以进行后续操作：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langchain @langchain/core
  # Requires Node.js 22+
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add langchain @langchain/core
  # Requires Node.js 22+
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add langchain @langchain/core
  # Requires Node.js 22+
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add langchain @langchain/core
  # Requires Bun v1.0.0+
  ```
</CodeGroup>

## 设置 API 密钥

从 [any supported model provider](/oss/javascript/integrations/providers/overview) 获取 API 密钥（例如 Google Gemini 或 OpenAI）。

设置API密钥，例如：

<Tabs>
  <Tab title="OpenAI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export OPENAI_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Google Gemini">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export GOOGLE_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Claude (Anthropic)">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export ANTHROPIC_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="OpenRouter">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export OPENROUTER_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Fireworks">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export FIREWORKS_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Baseten">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export BASETEN_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Ollama">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Local: Ollama must be running (https://ollama.com)
    # Cloud: Set your Ollama API key for hosted inference
    export OLLAMA_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Azure">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export AZURE_OPENAI_API_KEY="your-api-key"
    export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
    export AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment"
    ```
  </Tab>

  <Tab title="AWS Bedrock">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export AWS_ACCESS_KEY_ID="your-access-key"
    export AWS_SECRET_ACCESS_KEY="your-secret-key"
    export AWS_REGION="us-east-1"
    ```
  </Tab>

  <Tab title="HuggingFace">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export HUGGINGFACEHUB_API_TOKEN="hf_..."
    ```
  </Tab>

  <Tab title="Other">
    查看支持的 [chat model integrations](/oss/javascript/integrations/chat) 的完整列表。
  </Tab>
</Tabs>

<Tip>
  **使用LangSmith网关**

  [LangSmith Gateway](/langsmith/llm-gateway) 通过 LangSmith 路由大多数主要提供商。您可以使用 [bring your own provider keys](/langsmith/llm-gateway-quickstart#2-make-a-call) 或使用 [Gateway Credits](/langsmith/llm-gateway-credits) 在没有提供程序密钥的情况下访问模型。
</Tip>

## 构建一个基本代理首先创建一个可以回答问题和调用工具的简单代理。本示例中的代理使用所选的语言模型、基本天气函数作为工具，以及指导其行为的简单提示：

<CodeGroup>
  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

当您运行代码并提示代理告诉您旧金山的天气时，代理会使用该输入及其可用上下文。
代理了解您正在询问旧金山市的天气，因此会使用提供的城市名称调用天气工具。

<Tip>
  您可以通过更改模型名称并设置适当的 API 密钥来使用[any supported model](/oss/javascript/integrations/providers/overview)。使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-quickstart) 跟踪代理内部发生的情况。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监控您的痕迹、检测问题并提出修复建议。
</Tip>

## 构建一个真实世界的代理

在以下示例中，您将构建一个可以回答有关文本文件的问题的研究代理。
在此过程中，您将探索以下概念：1. **详细的系统提示**，更好的座席行为
2. **创建与外部数据集成的工具**
3.**模型配置**以实现一致的响应
4.**对话记忆**用于类似聊天的交互
5. **Deep Agents** 用于内置功能
6. **测试**您的代理

<Steps>
  <Step title="Define the system prompt">
    系统提示定义了座席的角色和行为。保持具体且可操作：

    ```ts wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const SYSTEM_PROMPT = `You are a literary data assistant.

    ## Capabilities

    - \`fetch_text_from_url\`: loads document text from a URL into the conversation.
    Do not guess line counts or positions—ground them in tool results from the saved file.`;
    ```
  </Step>

  <Step title="Create tools">
    [Tools](/oss/javascript/langchain/tools) 让模型通过调用您定义的函数与外部系统交互。
    工具可以依赖于[runtime context](/oss/javascript/langchain/runtime)，也可以与[agent memory](/oss/javascript/langchain/short-term-memory)交互。

    此示例使用一个工具从给定 URL 加载文档：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { tool } from "@langchain/core/tools";
    import { createAgent, initChatModel } from "langchain";
    import { z } from "zod";

    const fetchTextFromUrl = tool(
        async ({ url }: { url: string }): Promise<string> => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120_000);
            try {
                const resp = await fetch(url, {
                    headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; quickstart-research/1.0)",
                    },
                    signal: controller.signal,
                });
                if (!resp.ok) {
                    return `Fetch failed: HTTP ${resp.status} ${resp.statusText}`;
                }
                return await resp.text();
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                return `Fetch failed: ${msg}`;
            } finally {
                clearTimeout(timeoutId);
            }
        },
        {
            name: "fetch_text_from_url",
            description: "Fetch the document from a URL.",
            schema: z.object({ url: z.string().url() }),
        },
    );
    ```

    <Note>
      [Zod](https://zod.dev/) 是一个用于验证和解析预定义模式的库。您可以使用它来定义工具的输入架构，以确保代理仅使用正确的参数调用工具。

      或者，您可以将 `schema` 属性定义为 [JSON schema](https://json-schema.org/overview/what-is-jsonschema) 对象。请记住，JSON 模式**不会**在运行时进行验证。

      <Accordion title="Example: Using JSON schema for tool input">
        ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        import { tool } from "@langchain/core/tools";

        const fetchTextFromUrl = tool(
        async ({ url }: { url: string }): Promise<string> => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120_000);
            try {
            const resp = await fetch(url, {
                headers: {
                "User-Agent": "Mozilla/5.0 (compatible; quickstart-research/1.0)",
                },
                signal: controller.signal,
            });
            if (!resp.ok) {
                return `Fetch failed: HTTP ${resp.status} ${resp.statusText}`;
            }
            return await resp.text();
            } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return `Fetch failed: ${msg}`;
            } finally {
            clearTimeout(timeoutId);
            }
        },
        {
            name: "fetch_text_from_url",
            description: "Fetch the document from a URL.",
            schema: {
            type: "object",
            properties: {
                url: {
                type: "string",
                description: "The URL of the document to fetch.",
                format: "uri",
                },
            },
            required: ["url"],
            },
        },
        );
        ```
      </Accordion>
    </Note>
  </Step>

  <Step title="Configure your model">
    使用适合您的用例的正确参数设置您的 [language model](/oss/javascript/langchain/models)。例如：

    <CodeGroup>
      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("gpt-5.5", {
        temperature: 0.5,
        timeout: 300,
        maxTokens: 25000,
      });
      ```

      ```ts Google Gemini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("gemini-3.1-pro-preview", {
        modelProvider: "google-genai",
        temperature: 0.5,
        timeout: 600_000,
        maxTokens: 25000,
      });
      ``````ts Claude (Anthropic) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("claude-sonnet-4-6", {
        temperature: 0.5,
        timeout: 300,
        maxTokens: 25000,
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("openrouter:anthropic/claude-sonnet-4-6", {
        temperature: 0.5,
        timeout: 300,
        maxTokens: 25000,
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel(
        "fireworks:accounts/fireworks/models/qwen3p5-397b-a17b",
        { temperature: 0.5, timeout: 300, maxTokens: 25000 }
      );
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("baseten:zai-org/GLM-5.2", {
        temperature: 0.5,
        timeout: 300,
        maxTokens: 25000,
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("ollama:devstral-2", {
        temperature: 0.5,
        timeout: 300,
        maxTokens: 25000,
      });
      ```

      ```ts Azure theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("azure_openai:gpt-5.5", {
        temperature: 0.5,
        timeout: 300,
        maxTokens: 25000,
      });
      ```

      ```ts AWS Bedrock theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";

      const model = await initChatModel("bedrock:gpt-5.5", {
        temperature: 0.5,
        timeout: 300,
        maxTokens: 25000,
      });
      ```
    </CodeGroup>

    根据选择的模型和提供程序，初始化参数可能会有所不同；有关详细信息，请参阅其参考页。
  </Step>

  <Step title="Add memory">
    将 [memory](/oss/javascript/langchain/short-term-memory) 添加到您的代理以维护交互中的状态。这允许
    代理记住之前的对话和上下文。

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    ```

    <Info>
      在生产中，使用持久检查指针将消息历史记录保存到数据库中。
      更多详情请参见[Add and manage memory](/oss/javascript/langgraph/add-memory#manage-short-term-memory)。
    </Info>
  </Step>

  <Step title="Create and run the agent">
    现在将您的代理与所有组件组装起来并运行它。

    有两种不同的框架用于创建代理：LangChain代理和深度代理。
    LangChain 和深度代理都可以为您提供对工具、内存等的细粒度控制。
    两者之间的主要区别在于，深度代理已经内置了一系列常用的有用功能，例如规划、文件系统工具和子代理。

    当您希望以最少的设置获得最大的功能时，请使用深度代理；当需要细粒度控制时，选择LangChain代理。

    要在此步骤中比较两者，请安装 `deepagents` 软件包：<CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install deepagents
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm add deepagents
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add deepagents
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add deepagents
      ```
    </CodeGroup>

    <Warning>
      由于代码使用《了不起的盖茨比》的整个文本调用模型，因此它使用了大量的标记。

      您可以在下一步中查看示例输出。
    </Warning>

    让我们尝试一下：

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async function main() {
        const agent = createAgent({
            model,
            tools: [fetchTextFromUrl],
            systemPrompt: SYSTEM_PROMPT,
            checkpointer,
        });

        const deepAgent = createDeepAgent({
            model,
            tools: [fetchTextFromUrl],
            systemPrompt: SYSTEM_PROMPT,
            checkpointer,
        });

        const content = `Project Gutenberg hosts a full plain-text copy of F. Scott Fitzgerald's The Great Gatsby.
        URL: https://www.gutenberg.org/files/64317/64317-0.txt

        Answer as much as you can:

        1) How many lines in the complete Gutenberg file contain the substring \`Gatsby\` (count lines, not occurrences within a line, each line ends with a line break).
        2) The 1-based line number of the first line in the file that contains \`Daisy\`.
        3) A two-sentence neutral synopsis.

        Do your best on (1) and (2). If at any point you realize you cannot **verify** an exact answer with
        your available tools and reasoning, do not fabricate numbers: use \`null\` for that field and spell out
        the limitation in \`how_you_computed_counts\`. If you encounter any errors please report what the error was and what the error message was.`;

        const agentResult = await agent.invoke(
            { messages: [{ role: "user", content }] },
            { configurable: { thread_id: "great-gatsby-lc" } },
        );
        const deepAgentResult = await deepAgent.invoke(
            { messages: [{ role: "user", content }] },
            { configurable: { thread_id: "great-gatsby-da" } },
        );

        const agentMessages = agentResult.messages;
        const deepMessages = deepAgentResult.messages;
        console.log(agentMessages[agentMessages.length - 1]!.contentBlocks);
        console.log("\n");
        console.log(deepMessages[deepMessages.length - 1]!.contentBlocks);
    }

    main().catch((err) => {
        console.error(err);
        process.exitCode = 1;
    });
    ```

    <Expandable title="Full example code">
      ```ts wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { MemorySaver } from "@langchain/langgraph";
      import { createDeepAgent } from "deepagents";
      import { tool } from "@langchain/core/tools";
      import { createAgent, initChatModel } from "langchain";
      import { z } from "zod";
      const SYSTEM_PROMPT = `You are a literary data assistant.

      ## Capabilities

      - \`fetch_text_from_url\`: loads document text from a URL into the conversation.
      Do not guess line counts or positions—ground them in tool results from the saved file.`;

      const fetchTextFromUrl = tool(
          async ({ url }: { url: string }): Promise<string> => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 120_000);
              try {
                  const resp = await fetch(url, {
                      headers: {
                          "User-Agent": "Mozilla/5.0 (compatible; quickstart-research/1.0)",
                      },
                      signal: controller.signal,
                  });
                  if (!resp.ok) {
                      return `Fetch failed: HTTP ${resp.status} ${resp.statusText}`;
                  }
                  return await resp.text();
              } catch (e) {
                  const msg = e instanceof Error ? e.message : String(e);
                  return `Fetch failed: ${msg}`;
              } finally {
                 clearTimeout(timeoutId);
              }
          },
          {
              name: "fetch_text_from_url",
              description: "Fetch the document from a URL.",
              schema: z.object({ url: z.string().url() }),
          },
      );

      const model = await initChatModel("gemini-3.1-pro-preview", {
          modelProvider: "google-genai",
          temperature: 0.5,
          timeout: 600_000,
          maxTokens: 25000,
          streaming: true,
      });

      const checkpointer = new MemorySaver();

      async function main() {
          const agent = createAgent({
              model,
              tools: [fetchTextFromUrl],
              systemPrompt: SYSTEM_PROMPT,
              checkpointer,
          });

          const deepAgent = createDeepAgent({
              model,
              tools: [fetchTextFromUrl],
              systemPrompt: SYSTEM_PROMPT,
              checkpointer,
          });

          const content = `Project Gutenberg hosts a full plain-text copy of F. Scott Fitzgerald's The Great Gatsby.
          URL: https://www.gutenberg.org/files/64317/64317-0.txt

          Answer as much as you can:

          1) How many lines in the complete Gutenberg file contain the substring \`Gatsby\` (count lines, not occurrences within a line, each line ends with a line break).
          2) The 1-based line number of the first line in the file that contains \`Daisy\`.
          3) A two-sentence neutral synopsis.

          Do your best on (1) and (2). If at any point you realize you cannot **verify** an exact answer with
          your available tools and reasoning, do not fabricate numbers: use \`null\` for that field and spell out
          the limitation in \`how_you_computed_counts\`. If you encounter any errors please report what the error was and what the error message was.`;

          const agentResult = await agent.invoke(
              { messages: [{ role: "user", content }] },
              { configurable: { thread_id: "great-gatsby-lc" } },
          );
          const deepAgentResult = await deepAgent.invoke(
              { messages: [{ role: "user", content }] },
              { configurable: { thread_id: "great-gatsby-da" } },
          );

          const agentMessages = agentResult.messages;
          const deepMessages = deepAgentResult.messages;
          console.log(agentMessages[agentMessages.length - 1]!.content_blocks);
          console.log("\n");
          console.log(deepMessages[deepMessages.length - 1]!.content_blocks);
      }

      main().catch((err) => {
          console.error(err);
          process.exitCode = 1;
      });
      ```
    </Expandable>
  </Step>

  <Step title="Review the results">
    结果将根据模型和执行而有所不同。

    <Tabs>
      <Tab title="LangChain agents">
        ```txt wrap expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        **1) Number of lines containing `Gatsby`:** `null`

        **2) First line containing `Daisy`:** `null`

        **3) Synopsis:**
        The Great Gatsby follows the mysterious millionaire Jay Gatsby and his obsession with reuniting with his former lover, Daisy Buchanan, as narrated by his neighbor Nick Carraway. Set against the backdrop of the Roaring Twenties on Long Island, the novel explores themes of wealth, class, and the elusive nature of the American Dream.

        **how_you_computed_counts:**
        I successfully fetched the full text of the eBook using the `fetch_text_from_url` tool. However, because I do not have access to a code execution environment (like Python) or text-processing tools (like `grep`), I cannot deterministically split the text by line breaks, iterate through the thousands of lines, and verify the exact line numbers or match counts. LLMs cannot reliably perform exact line-counting or indexing over massive texts within their context window without external computational tools. As instructed, rather than fabricating or guessing a number, I have output `null` for the exact counts and positions.
        ```
      </Tab>

      <Tab title="Deep agents">
        ```txt wrap expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
        Based on the text fetched directly from the Gutenberg URL and analyzed using filesystem search tools, here are the answers to your questions:

        **1) Lines containing the substring `Gatsby`**
        **258** lines contain the exact substring `Gatsby`.

        **2) First line containing `Daisy`**
        Line **181** is the first line in the file that contains the exact substring `Daisy`.
        *(For context, the line reads: "Buchanans. Daisy was my second cousin once removed, and I’d known Tom")*

        **3) Two-sentence neutral synopsis**
        *The Great Gatsby* follows the mysterious millionaire Jay Gatsby and his obsessive pursuit to reunite with his former lover, Daisy Buchanan, in 1920s Long Island. The story is narrated by Nick Carraway, who observes the tragic consequences of Gatsby's relentless ambition and the shallow materialism of the era's wealthy elite.

        ***

        **How counts were computed:**
        When fetching the document from the URL, the file was too large for the standard output and was automatically saved to the local filesystem by the system (`/large_tool_results/x246ax2x`). I then used the `grep` tool to search the saved file for the exact literal substrings `Gatsby` and `Daisy`. The `grep` tool returned every matching line along with its 1-based line number. I manually counted the exact number of lines returned for `Gatsby` (which totaled 258) and identified the first line number returned for `Daisy` (which was 181). I also verified there were no uppercase variations (`GATSBY` or `DAISY`) that would have been missed. No errors were encountered during this process.
        ```
      </Tab>
    </Tabs>

    如果您查看两个选项卡上的输出，您会注意到 LangChain 代理提供了答案，但它们是估计值。代理缺乏回答这个问题的工具。您还可能会收到提示太长的错误。

    另一方面，深度代理可以：

    1. **规划其方法**，使用内置的[⟦T47⟧](/oss/javascript/deepagents/harness#task-planning)工具来分解研究任务。
    2. **通过调用`fetch_text_from_url`工具收集信息来加载文件**。
    3. **使用文件系统工具（[⟦T49⟧](/oss/javascript/deepagents/harness#virtual-filesystem-access) 和 [⟦T50⟧](/oss/javascript/deepagents/harness#virtual-filesystem-access)）管理上下文**。
    4. **根据需要生成子代理**，将复杂的子任务委托给专门的子代理。对于 LangChain 代理，您必须实现更多功能才能获得类似的服务级别，并且可以根据需要自定义它们。
  </Step>
</Steps>

## 跟踪代理调用

您使用 LangChain 构建的大多数有趣的应用程序都会多次调用 LLM。随着这些应用程序变得越来越复杂，能够检查代理内部到底发生了什么变得很重要。最好的方法是使用[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-quickstart)。

注册一个 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-quickstart) 帐户并设置这些以开始记录跟踪：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
```

设置完成后，再次运行脚本，然后检查代理调用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-quickstart) 期间发生的情况。

<Tip>
  要了解有关使用 LangSmith 跟踪代理的更多信息，请参阅 [LangSmith documentation](/langsmith/trace-with-langchain)。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监视您的痕迹、检测问题并提出修复建议。
</Tip>

## 后续步骤

您现在拥有的代理可以：

* **理解上下文**并记住对话
* **明智地使用工具**
* **以一致的格式提供结构化回复**
* **通过上下文处理用户特定信息**
* **在交互过程中保持对话状态**
* **计划、研究和综合**（仅限深度代理）

继续：* **LangChain代理**：[Add and manage memory](/oss/javascript/langgraph/add-memory#manage-short-term-memory)、[deploy to production](/oss/javascript/langgraph/deploy)
* **Deep Agents**：[Customization options](/oss/javascript/deepagents/customization)、[persistent memory](/oss/javascript/deepagents/memory)、[deploy to production](/oss/javascript/langgraph/deploy)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>