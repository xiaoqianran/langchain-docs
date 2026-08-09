<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Customize Deep Agents | https://docs.langchain.com/oss/javascript/deepagents/customization -->

# 自定义深度代理

了解如何使用系统提示、工具、子代理等自定义深度代理

围绕您的目标构建安全带。 `create_deep_agent` 为您提供生产就绪的基础：将其连接到您的数据，塑造其行为，并添加您的用例所需的功能。

`createDeepAgent` 附带预组装的工具：默认情况下文件系统、摘要、子代理和提示缓存。下面的参数可让您定义代理的角色，将其连接到您的数据和工具，并使用附加中间件扩展 [Deep Agents stack](#deep-agents-stack)。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    systemPrompt: "You are a helpful assistant.",
    tools: [search, fetchUrl],
    memory: ["./AGENTS.md"],
    skills: ["./skills/"],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    systemPrompt: "You are a helpful assistant.",
    tools: [search, fetchUrl],
    memory: ["./AGENTS.md"],
    skills: ["./skills/"],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    systemPrompt: "You are a helpful assistant.",
    tools: [search, fetchUrl],
    memory: ["./AGENTS.md"],
    skills: ["./skills/"],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    systemPrompt: "You are a helpful assistant.",
    tools: [search, fetchUrl],
    memory: ["./AGENTS.md"],
    skills: ["./skills/"],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt: "You are a helpful assistant.",
    tools: [search, fetchUrl],
    memory: ["./AGENTS.md"],
    skills: ["./skills/"],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt: "You are a helpful assistant.",
    tools: [search, fetchUrl],
    memory: ["./AGENTS.md"],
    skills: ["./skills/"],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt: "You are a helpful assistant.",
    tools: [search, fetchUrl],
    memory: ["./AGENTS.md"],
    skills: ["./skills/"],
  });
  ```
</CodeGroup>|参数|它有什么作用 |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `model` |使用哪种型号 |
| `systemPrompt` |代理定制说明 |
| `tools` |代理可以调用​​的领域工具 |
| `memory` |启动时加载的 AGENTS.md 文件 |
| `skills` |按需知识的技能目录 || `backend` |文件系统后端（默认为 StateBackend）|
| `permissions` |文件系统的路径级访问控制|
| `subagents` |用于委派任务的自定义子代理 |
| `middleware` |附加到 [Deep Agents stack](#deep-agents-stack) | 的额外中间件
| `interruptOn` |在工具请求人工批准之前暂停 |
| `responseFormat` |结构化输出模式|
| [⟦T158⟧](/oss/javascript/deepagents/context-engineering#runtime-context) |每次运行的运行时上下文架构（用户 ID、API 密钥、功能标志）|

有关完整参数列表，请参阅 [⟦T159⟧](https://reference.langchain.com/javascript/deepagents/types/CreateDeepAgentParams) API 参考。要从头开始构建完全自定义的线束，请参阅[Configure the harness](/oss/javascript/langchain/agents#configure-the-harness)。<Tip>
  当您添加工具、子代理和后端时，使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-customization) 来跟踪每个部分的行为方式。按照[observability quickstart](/langsmith/observability-quickstart)进行设置，并参阅[Going to production](/oss/javascript/deepagents/going-to-production)在LangSmith上进行部署。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine)，它可以监视您的痕迹、检测问题并提出修复建议。
</Tip>

## 型号

传递 `provider:model` 格式的 `model` 字符串，或初始化的模型实例。请参阅[supported models](/oss/javascript/deepagents/models#supported-models)了解所有提供商，并参阅[suggested models](/oss/javascript/deepagents/models#suggested-models)了解经过测试的建议。

<Tip>
  使用`provider:model`格式（例如`openai:gpt-5.5`）可以在模型之间快速切换。
</Tip>

<Tabs>
  <Tab title="OpenAI">
    👉 阅读[OpenAI chat model integration docs](/oss/javascript/integrations/chat/openai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/openai deepagents
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/openai deepagents
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/openai deepagents
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/openai deepagents
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      process.env.OPENAI_API_KEY = "your-api-key";

      const agent = createDeepAgent({ model: "gpt-5.5" });
      // this calls initChatModel for the specified model with default parameters
      // to use specific model parameters, use initChatModel directly
      ```

      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";
      import { createDeepAgent } from "deepagents";

      process.env.OPENAI_API_KEY = "your-api-key";

      const model = await initChatModel("gpt-5.5");
      const agent = createDeepAgent({
        model,
        temperature: 0,
      });
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatOpenAI } from "@langchain/openai";
      import { createDeepAgent } from "deepagents";

      const agent = createDeepAgent({
        model: new ChatOpenAI({
          model: "gpt-5.5",
          apiKey: "your-api-key",
          temperature: 0,
        }),
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Anthropic">
    👉 阅读[Anthropic chat model integration docs](/oss/javascript/integrations/chat/anthropic/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/anthropic deepagents
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/anthropic deepagents
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/anthropic deepagents
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/anthropic deepagents
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      process.env.ANTHROPIC_API_KEY = "your-api-key";

      const agent = createDeepAgent({ model: "anthropic:claude-sonnet-4-6" });
      // this calls initChatModel for the specified model with default parameters
      // to use specific model parameters, use initChatModel directly
      ```

      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";
      import { createDeepAgent } from "deepagents";

      process.env.ANTHROPIC_API_KEY = "your-api-key";

      const model = await initChatModel("claude-sonnet-4-6");
      const agent = createDeepAgent({
        model,
        temperature: 0,
      });
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatAnthropic } from "@langchain/anthropic";
      import { createDeepAgent } from "deepagents";

      const agent = createDeepAgent({
        model: new ChatAnthropic({
          model: "claude-sonnet-4-6",
          apiKey: "your-api-key",
          temperature: 0,
        }),
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Azure">
    👉 阅读[Azure chat model integration docs](/oss/javascript/integrations/chat/azure/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/azure deepagents
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/azure deepagents
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/azure deepagents
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/azure deepagents
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      process.env.AZURE_OPENAI_API_KEY = "your-api-key";
      process.env.AZURE_OPENAI_ENDPOINT = "your-endpoint";
      process.env.OPENAI_API_VERSION = "your-api-version";

      const agent = createDeepAgent({ model: "azure_openai:gpt-5.5" });
      // this calls initChatModel for the specified model with default parameters
      // to use specific model parameters, use initChatModel directly
      ```

      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";
      import { createDeepAgent } from "deepagents";

      process.env.AZURE_OPENAI_API_KEY = "your-api-key";
      process.env.AZURE_OPENAI_ENDPOINT = "your-endpoint";
      process.env.OPENAI_API_VERSION = "your-api-version";

      const model = await initChatModel("azure_openai:gpt-5.5");
      const agent = createDeepAgent({
        model,
        temperature: 0,
      });
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { AzureChatOpenAI } from "@langchain/openai";
      import { createDeepAgent } from "deepagents";

      const agent = createDeepAgent({
        model: new AzureChatOpenAI({
          model: "gpt-5.5",
          azureOpenAIApiKey: "your-api-key",
          azureOpenAIApiEndpoint: "your-endpoint",
          azureOpenAIApiVersion: "your-api-version",
          temperature: 0,
        }),
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Google Gemini">
    👉 阅读[Google GenAI chat model integration docs](/oss/javascript/integrations/chat/google_generative_ai/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/google-genai deepagents
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/google-genai deepagents
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/google-genai deepagents
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/google-genai deepagents
      ```
    </CodeGroup><CodeGroup>
      ```typescript default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      process.env.GOOGLE_API_KEY = "your-api-key";

      const agent = createDeepAgent({ model: "google-genai:gemini-3.1-pro-preview" });
      // this calls initChatModel for the specified model with default parameters
      // to use specific model parameters, use initChatModel directly
      ```

      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";
      import { createDeepAgent } from "deepagents";

      process.env.GOOGLE_API_KEY = "your-api-key";

      const model = await initChatModel("google-genai:gemini-3.1-pro-preview");
      const agent = createDeepAgent({
        model,
        temperature: 0,
      });
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
      import { createDeepAgent } from "deepagents";

      const agent = createDeepAgent({
        model: new ChatGoogleGenerativeAI({
          model: "gemini-3.1-pro-preview",
          apiKey: "your-api-key",
          temperature: 0,
        }),
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Bedrock Converse">
    👉 阅读[AWS Bedrock chat model integration docs](/oss/javascript/integrations/chat/bedrock_converse/)

    <CodeGroup>
      ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      npm install @langchain/aws deepagents
      ```

      ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pnpm install @langchain/aws deepagents
      ```

      ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      yarn add @langchain/aws deepagents
      ```

      ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      bun add @langchain/aws deepagents
      ```
    </CodeGroup>

    <CodeGroup>
      ```typescript default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent } from "deepagents";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const agent = createDeepAgent({ model: "bedrock:anthropic.claude-sonnet-4-6" });
      // this calls initChatModel for the specified model with default parameters
      // to use specific model parameters, use initChatModel directly
      ```

      ```typescript initChatModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { initChatModel } from "langchain";
      import { createDeepAgent } from "deepagents";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const model = await initChatModel("bedrock:anthropic.claude-sonnet-4-6");
      const agent = createDeepAgent({
        model,
        temperature: 0,
      });
      ```

      ```typescript Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ChatBedrockConverse } from "@langchain/aws";
      import { createDeepAgent } from "deepagents";

      // Follow the steps here to configure your credentials:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      const agent = createDeepAgent({
        model: new ChatBedrockConverse({
          model: "anthropic.claude-sonnet-4-6",
          region: "us-east-2",
          temperature: 0,
        }),
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Other">
    传递任何[supported model string](/oss/javascript/deepagents/models#supported-models)，或初始化的模型实例：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { initChatModel } from "langchain";
    import { createDeepAgent } from "deepagents";

    const model = await initChatModel("provider:model-name");
    const agent = createDeepAgent({ model });
    ```
  </Tab>
</Tabs>

<Tip>
  聊天模型会自动重试短暂的 API 失败（使用指数退避）。有关调整`max_retries` / `timeout`的默认值、限制和代码示例，请参见 LangChain [Models](/oss/javascript/langchain/models#connection-resilience) 页面。
</Tip>

## 工具

除了用于文件管理和子代理生成的[built-in tools](/oss/javascript/deepagents/overview#execution-environment)之外，您还可以提供自定义工具：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [internetSearch],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    tools: [internetSearch],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [internetSearch],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [internetSearch],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [internetSearch],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [internetSearch],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [internetSearch],
  });
  ```
</CodeGroup>

### MCP 工具

<Tip>
  Deep Agents 完全支持 [Model Context Protocol (MCP)](/oss/javascript/langchain/mcp) 工具。您可以从任何 MCP 服务器（数据库、API、文件系统等）加载工具，并将它们直接传递到 `create_deep_agent`。
</Tip>

安装`@langchain/mcp-adapters`以连接到MCP服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @langchain/mcp-adapters
```

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
      my_server: {
          transport: "http",
          url: "http://localhost:8000/mcp",
      },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
      model: "google-genai:gemini-3.6-flash",
      tools,
  });

  const result = await agent.invoke({
      messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
      my_server: {
          transport: "http",
          url: "http://localhost:8000/mcp",
      },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
      model: "openai:gpt-5.5",
      tools,
  });

  const result = await agent.invoke({
      messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
      my_server: {
          transport: "http",
          url: "http://localhost:8000/mcp",
      },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
      model: "anthropic:claude-sonnet-4-6",
      tools,
  });

  const result = await agent.invoke({
      messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
      my_server: {
          transport: "http",
          url: "http://localhost:8000/mcp",
      },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
      model: "openrouter:openrouter:z-ai/glm-5.2",
      tools,
  });

  const result = await agent.invoke({
      messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
      my_server: {
          transport: "http",
          url: "http://localhost:8000/mcp",
      },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
      model: "fireworks:accounts/fireworks/models/glm-5p2",
      tools,
  });

  const result = await agent.invoke({
      messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
      my_server: {
          transport: "http",
          url: "http://localhost:8000/mcp",
      },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
      model: "baseten:zai-org/GLM-5.2",
      tools,
  });

  const result = await agent.invoke({
      messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const { MultiServerMCPClient } = await import("@langchain/mcp-adapters");

  const client = new MultiServerMCPClient({
      my_server: {
          transport: "http",
          url: "http://localhost:8000/mcp",
      },
  });

  const tools = await client.getTools();

  const agent = await createDeepAgent({
      model: "ollama:north-mini-code-1.0",
      tools,
  });

  const result = await agent.invoke({
      messages: [{ role: "user", content: "Use the MCP server to help me." }],
  });
  ```
</CodeGroup>

有关详细配置选项，包括 stdio 服务器、OAuth 身份验证、工具过滤和有状态会话，请参阅完整的 [MCP guide](/oss/javascript/langchain/mcp)。

## 系统提示通过`system_prompt=`给代理您自己的指示：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const researchInstructions =
    `You are an expert researcher. ` +
    `Your job is to conduct thorough research, and then ` +
    `write a polished report.`;

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    systemPrompt: researchInstructions,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const researchInstructions =
    `You are an expert researcher. ` +
    `Your job is to conduct thorough research, and then ` +
    `write a polished report.`;

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const researchInstructions =
    `You are an expert researcher. ` +
    `Your job is to conduct thorough research, and then ` +
    `write a polished report.`;

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    systemPrompt: researchInstructions,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const researchInstructions =
    `You are an expert researcher. ` +
    `Your job is to conduct thorough research, and then ` +
    `write a polished report.`;

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const researchInstructions =
    `You are an expert researcher. ` +
    `Your job is to conduct thorough research, and then ` +
    `write a polished report.`;

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const researchInstructions =
    `You are an expert researcher. ` +
    `Your job is to conduct thorough research, and then ` +
    `write a polished report.`;

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt: researchInstructions,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const researchInstructions =
    `You are an expert researcher. ` +
    `Your job is to conduct thorough research, and then ` +
    `write a polished report.`;

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt: researchInstructions,
  });
  ```
</CodeGroup>

<Note>
  除了字符串之外，主代理还接受具有结构化[content blocks](/oss/javascript/langchain/messages#standard-content-blocks)的[⟦T169⟧](https://reference.langchain.com/javascript/langchain-core/messages/SystemMessage)；深度代理保留这些块（[subagent](/oss/javascript/deepagents/subagents)字典规范保留字符串）。
</Note>

<AccordionGroup>
  <Accordion title="Subagent prompts">
    声明式 [subagents](/oss/javascript/deepagents/subagents) 根据自己的模型解析配置文件覆盖，然后将解析的配置文件的 `base_system_prompt` / `system_prompt_suffix` 应用到子代理编写的 `system_prompt`。仅附带 `system_prompt_suffix`（内置 Anthropic / OpenAI 配置文件的常见情况）的配置文件会附加到编写的提示中。设置 `base_system_prompt` 的配置文件会完全取代它。
  </Accordion>

  <Accordion title="General-purpose subagent prompt">
    自动添加的 [general-purpose subagent](/oss/javascript/deepagents/subagents#the-general-purpose-subagent) 将其基本提示解析为 **`general_purpose_subagent.system_prompt`（如果设置）-> `HarnessProfile.base_system_prompt`（如果设置）-> SDK 通用默认**，配置文件后缀位于顶部。当两个覆盖字段都被设置时，通用特定的字段获胜，因此调整这两个字段的调用者永远不会看到他们的 GP 覆盖默默地被丢弃：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import (
        GeneralPurposeSubagentProfile,
        HarnessProfile,
        register_harness_profile,
    )

    register_harness_profile(
        "anthropic",
        HarnessProfile(
            base_system_prompt="You are ACME's support orchestrator.",  # main agent
            general_purpose_subagent=GeneralPurposeSubagentProfile(
                system_prompt="You are a research subagent. Cite sources.",  # GP subagent
            ),
            system_prompt_suffix="Always think step by step.",
        ),
    )
    ```|堆栈|最终系统提示|
    | ----------- | ------------------------------------------------------- |
    |主代理| `"You are ACME's support orchestrator." + SUFFIX` |
    | GP 子代理 | `"You are a research subagent. Cite sources." + SUFFIX` |
  </Accordion>
</AccordionGroup>

## 中间件

Deep Agent支持任何[middleware](/oss/javascript/langchain/middleware/overview)，包括下面列出的内置中间件、LangChain的预构建中间件、特定于提供商的中间件以及您自己编写的自定义中间件。

将中间件传递给 `createDeepAgent` 的 `middleware` 参数。自定义中间件附加在[Deep Agents stack](#deep-agents-stack)中的[⟦T181⟧](https://reference.langchain.com/javascript/deepagents/middleware/createPatchToolCallsMiddleware)之后。

### 深层代理堆栈

`createDeepAgent` 以固定的顺序构建中间件。只需一个模型即可获得 [bare stack](#bare-stack)。 [full stack](#full-stack) 是完整的汇编顺序，包括仅当您传递可选参数或解析的 [harness profile](/oss/javascript/deepagents/profiles) 贡献它们时才出现的槽。

#### 裸栈

只有一个`model`（没有其他可选参数），主代理通常包括：1.[⟦T184⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware)
2. [⟦T185⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware)（因为 [general-purpose subagent](/oss/javascript/deepagents/subagents#default-subagent) 是自动添加的，除非线束配置文件禁用它）
3.[⟦T186⟧](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware)
4.[⟦T187⟧](https://reference.langchain.com/javascript/deepagents/middleware/createPatchToolCallsMiddleware)
5. **提示缓存**中间件（为受支持的提供程序添加；其他地方无操作）
6. **利用配置文件额外**和**排除工具过滤**，如果解析的模型配置文件定义了它们

#### 全栈

从第一个到最后一个：

1. [⟦T188⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSkillsMiddleware)：仅当您通过`skills`时。 **在**文件系统中间件之前注入，因此技能元数据在文件工具运行之前可用。

2. [⟦T190⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware)：处理文件系统操作，例如读取、写入和导航目录。当您通过`permissions`时，文件系统权限强制执行包含在此处，因此它可以评估代理可能调用的每个工具。

3. [⟦T192⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware)：仅当至少有一个同步子代理可用时。生成并协调子代理来委派任务。包含在[bare stack](#bare-stack)中，因为默认情况下自动添加通用子代理；通过禁用该子代理并不传递同步`subagents`来省略它。参见[Running without subagents](/oss/javascript/deepagents/subagents#running-without-subagents)。

4. [⟦T194⟧](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware)：当对话变长时，压缩消息历史记录以保持在上下文限制内（通过[createSummarizationMiddleware](https://reference.langchain.com/javascript/deepagents/middleware/createSummarizationMiddleware)）。5. [⟦T195⟧](https://reference.langchain.com/javascript/deepagents/middleware/createPatchToolCallsMiddleware)：当运行在中断后恢复或收到格式错误的工具调用参数时，修复消息历史记录中悬空的工具调用。 **在** Anthropic 提示缓存和下面的尾堆栈之前运行。

6. [⟦T196⟧](https://reference.langchain.com/javascript/deepagents/agent/createDeepAgent)：仅当您配置异步子代理时。

7. **您的中间件参数**：您作为 `middleware` 参数传递的可选中间件附加在此处（Patch 之后，尾堆栈之前）。

8. **利用配置文件附加**：来自解析的模型配置文件的特定于提供商的中间件（如果有）。

9. **排除工具过滤**：当线束配置文件列出排除工具时，中间件将从代理中删除这些工具。

10. **提示缓存**（[⟦T198⟧](https://reference.langchain.com/javascript/langchain/index/anthropicPromptCachingMiddleware) 和 [⟦T199⟧](https://reference.langchain.com/javascript/langchain/index/bedrockPromptCachingMiddleware)）：分别为 Anthropic 模型和 Amazon Bedrock Converse 模型自动添加。两者都在** Patch 之后和中间件之后运行，因此缓存的前缀与实际发送到模型的内容相匹配。

11. [⟦T200⟧](https://reference.langchain.com/javascript/deepagents/middleware/createMemoryMiddleware)：仅当您通过`memory`时。

    <Note>
      `MemoryMiddleware` 放置在配置文件附加功能和提示缓存中间件的**之后，因此对注入内存的更新不太可能使缓存前缀无效。 `createDeepAgent` 实现注释中也提出了相同的排序问题。
    </Note>12. `HumanInTheLoopMiddleware`：仅当您通过`interruptOn`时。在配置的工具调用时暂停以供人工批准或输入。

### 同步子代理堆栈

内置的**通用**子代理和每个声明性同步`SubAgent`图使用`createDeepAgent`在代码中构建的堆栈。它与主要代理的广泛形状（文件系统、摘要、补丁、配置文件附加、人类和基岩缓存、可选权限）匹配，但有两点不同：

* **技能在这些内部代理上** [⟦T208⟧](https://reference.langchain.com/javascript/deepagents/middleware/createPatchToolCallsMiddleware) 运行（在主代理上，当设置 `skills` 时，技能在**文件系统中间件之前运行）。
* 子代理图中**没有** [⟦T210⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSubAgentMiddleware)（只有父代理公开了`task` 工具）。

当声明性子代理设置 `interruptOn` 时，该值将转发到子代理的 `createAgent`，从而为已配置的工具调用连接人机交互处理。

### 预构建中间件

LangChain 公开了额外的预构建中间件，让您可以添加各种功能，例如重试、回退或 PII 检测。更多信息请参见[Prebuilt middleware](/oss/javascript/langchain/middleware/built-in)。

`deepagents` 包还为相同的工作流程公开了 [⟦T215⟧](https://reference.langchain.com/javascript/deepagents/middleware/createSummarizationMiddleware)。欲了解更多详情，请参阅[Summarization](/oss/javascript/deepagents/context-engineering#summarization)。

### 特定于提供商的中间件对于针对特定 LLM 提供商进行优化的提供商特定中间件，请参阅 [Middleware integrations](/oss/javascript/integrations/middleware)。

### 自定义中间件

您可以提供额外的中间件来扩展功能、添加工具或实现自定义挂钩：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, createMiddleware } from "langchain";
  import { createDeepAgent } from "deepagents";
  import * as z from "zod";

  const getWeather = tool(
    ({ city }: { city: string }) => {
      return `The weather in ${city} is sunny.`;
    },
    {
      name: "get_weather",
      description: "Get the weather in a city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  let callCount = 0;

  const logToolCallsMiddleware = createMiddleware({
    name: "LogToolCallsMiddleware",
    wrapToolCall: async (request, handler) => {
      // Intercept and log every tool call - demonstrates cross-cutting concern
      callCount += 1;
      const toolName = request.toolCall.name;

      console.log(`[Middleware] Tool call #${callCount}: ${toolName}`);
      console.log(
        `[Middleware] Arguments: ${JSON.stringify(request.toolCall.args)}`,
      );

      // Execute the tool call
      const result = await handler(request);

      // Log the result
      console.log(`[Middleware] Tool call #${callCount} completed`);

      return result;
    },
  });

  const agent = await createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [getWeather] as any,
    middleware: [logToolCallsMiddleware] as any,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, createMiddleware } from "langchain";
  import { createDeepAgent } from "deepagents";
  import * as z from "zod";

  const getWeather = tool(
    ({ city }: { city: string }) => {
      return `The weather in ${city} is sunny.`;
    },
    {
      name: "get_weather",
      description: "Get the weather in a city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  let callCount = 0;

  const logToolCallsMiddleware = createMiddleware({
    name: "LogToolCallsMiddleware",
    wrapToolCall: async (request, handler) => {
      // Intercept and log every tool call - demonstrates cross-cutting concern
      callCount += 1;
      const toolName = request.toolCall.name;

      console.log(`[Middleware] Tool call #${callCount}: ${toolName}`);
      console.log(
        `[Middleware] Arguments: ${JSON.stringify(request.toolCall.args)}`,
      );

      // Execute the tool call
      const result = await handler(request);

      // Log the result
      console.log(`[Middleware] Tool call #${callCount} completed`);

      return result;
    },
  });

  const agent = await createDeepAgent({
    model: "openai:gpt-5.5",
    tools: [getWeather] as any,
    middleware: [logToolCallsMiddleware] as any,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, createMiddleware } from "langchain";
  import { createDeepAgent } from "deepagents";
  import * as z from "zod";

  const getWeather = tool(
    ({ city }: { city: string }) => {
      return `The weather in ${city} is sunny.`;
    },
    {
      name: "get_weather",
      description: "Get the weather in a city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  let callCount = 0;

  const logToolCallsMiddleware = createMiddleware({
    name: "LogToolCallsMiddleware",
    wrapToolCall: async (request, handler) => {
      // Intercept and log every tool call - demonstrates cross-cutting concern
      callCount += 1;
      const toolName = request.toolCall.name;

      console.log(`[Middleware] Tool call #${callCount}: ${toolName}`);
      console.log(
        `[Middleware] Arguments: ${JSON.stringify(request.toolCall.args)}`,
      );

      // Execute the tool call
      const result = await handler(request);

      // Log the result
      console.log(`[Middleware] Tool call #${callCount} completed`);

      return result;
    },
  });

  const agent = await createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [getWeather] as any,
    middleware: [logToolCallsMiddleware] as any,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, createMiddleware } from "langchain";
  import { createDeepAgent } from "deepagents";
  import * as z from "zod";

  const getWeather = tool(
    ({ city }: { city: string }) => {
      return `The weather in ${city} is sunny.`;
    },
    {
      name: "get_weather",
      description: "Get the weather in a city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  let callCount = 0;

  const logToolCallsMiddleware = createMiddleware({
    name: "LogToolCallsMiddleware",
    wrapToolCall: async (request, handler) => {
      // Intercept and log every tool call - demonstrates cross-cutting concern
      callCount += 1;
      const toolName = request.toolCall.name;

      console.log(`[Middleware] Tool call #${callCount}: ${toolName}`);
      console.log(
        `[Middleware] Arguments: ${JSON.stringify(request.toolCall.args)}`,
      );

      // Execute the tool call
      const result = await handler(request);

      // Log the result
      console.log(`[Middleware] Tool call #${callCount} completed`);

      return result;
    },
  });

  const agent = await createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [getWeather] as any,
    middleware: [logToolCallsMiddleware] as any,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, createMiddleware } from "langchain";
  import { createDeepAgent } from "deepagents";
  import * as z from "zod";

  const getWeather = tool(
    ({ city }: { city: string }) => {
      return `The weather in ${city} is sunny.`;
    },
    {
      name: "get_weather",
      description: "Get the weather in a city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  let callCount = 0;

  const logToolCallsMiddleware = createMiddleware({
    name: "LogToolCallsMiddleware",
    wrapToolCall: async (request, handler) => {
      // Intercept and log every tool call - demonstrates cross-cutting concern
      callCount += 1;
      const toolName = request.toolCall.name;

      console.log(`[Middleware] Tool call #${callCount}: ${toolName}`);
      console.log(
        `[Middleware] Arguments: ${JSON.stringify(request.toolCall.args)}`,
      );

      // Execute the tool call
      const result = await handler(request);

      // Log the result
      console.log(`[Middleware] Tool call #${callCount} completed`);

      return result;
    },
  });

  const agent = await createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [getWeather] as any,
    middleware: [logToolCallsMiddleware] as any,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, createMiddleware } from "langchain";
  import { createDeepAgent } from "deepagents";
  import * as z from "zod";

  const getWeather = tool(
    ({ city }: { city: string }) => {
      return `The weather in ${city} is sunny.`;
    },
    {
      name: "get_weather",
      description: "Get the weather in a city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  let callCount = 0;

  const logToolCallsMiddleware = createMiddleware({
    name: "LogToolCallsMiddleware",
    wrapToolCall: async (request, handler) => {
      // Intercept and log every tool call - demonstrates cross-cutting concern
      callCount += 1;
      const toolName = request.toolCall.name;

      console.log(`[Middleware] Tool call #${callCount}: ${toolName}`);
      console.log(
        `[Middleware] Arguments: ${JSON.stringify(request.toolCall.args)}`,
      );

      // Execute the tool call
      const result = await handler(request);

      // Log the result
      console.log(`[Middleware] Tool call #${callCount} completed`);

      return result;
    },
  });

  const agent = await createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [getWeather] as any,
    middleware: [logToolCallsMiddleware] as any,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool, createMiddleware } from "langchain";
  import { createDeepAgent } from "deepagents";
  import * as z from "zod";

  const getWeather = tool(
    ({ city }: { city: string }) => {
      return `The weather in ${city} is sunny.`;
    },
    {
      name: "get_weather",
      description: "Get the weather in a city.",
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  let callCount = 0;

  const logToolCallsMiddleware = createMiddleware({
    name: "LogToolCallsMiddleware",
    wrapToolCall: async (request, handler) => {
      // Intercept and log every tool call - demonstrates cross-cutting concern
      callCount += 1;
      const toolName = request.toolCall.name;

      console.log(`[Middleware] Tool call #${callCount}: ${toolName}`);
      console.log(
        `[Middleware] Arguments: ${JSON.stringify(request.toolCall.args)}`,
      );

      // Execute the tool call
      const result = await handler(request);

      // Log the result
      console.log(`[Middleware] Tool call #${callCount} completed`);

      return result;
    },
  });

  const agent = await createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [getWeather] as any,
    middleware: [logToolCallsMiddleware] as any,
  });
  ```
</CodeGroup>

<Warning>
  **初始化后不要改变属性**

  如果您需要跟踪挂钩调用之间的值（例如计数器或累积数据），请使用图形状态。
  图状态的设计范围仅限于线程，因此更新在并发情况下是安全的。

  **这样做：**

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const customMiddleware = createMiddleware({
    name: "CustomMiddleware",
    beforeAgent: async (state) => {
      return { x: (state.x ?? 0) + 1 }; // Update graph state instead
    },
  });
  ```

  **不要**这样做：

  ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  let x = 1;

  const customMiddlewareBad = createMiddleware({
    name: "CustomMiddleware",
    beforeAgent: async () => {
      x += 1; // Mutation causes race conditions
    },
  });
  ```

  适当的修改，例如修改 `beforeAgent` 中的 `state.x`、修改 `beforeAgent` 中的共享变量，或更改钩子中的其他共享值，可能会导致微妙的错误和竞争条件，因为许多操作是并发运行的（子代理、并行工具和不同线程上的并行调用）。

  如果必须在自定义中间件中使用突变，请考虑当子代理、并行工具或并发代理调用同时运行时会发生什么情况。
</Warning>

### 覆盖默认中间件实例

### 口译员使用 [interpreters](/oss/javascript/deepagents/interpreters) 添加在作用域 QuickJS 运行时中运行 JavaScript 的 `eval` 工具。当代理需要以编程方式组合工具、批处理工作、处理代码中的错误或在没有完整 shell 环境的情况下转换结构化数据时，解释器非常有用。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { createCodeInterpreterMiddleware } from "@langchain/quickjs";

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    middleware: [createCodeInterpreterMiddleware()],
  });
  ```
</CodeGroup>

有关设置、编程工具调用、子代理编排和限制，请参阅[Interpreters](/oss/javascript/deepagents/interpreters)。

## 子代理

要隔离详细工作并避免上下文膨胀，请使用子代理：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent, type SubAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const researchSubagent: SubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions",
    systemPrompt: "You are a great researcher",
    tools: [internetSearch],
    model: "google-genai:gemini-3.6-flash", // Optional override, defaults to main agent model
  };
  const subagents = [researchSubagent];

  const agent = createDeepAgent({
    model: "google_genai:gemini-3.6-flash",
    subagents,
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent, type SubAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const researchSubagent: SubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions",
    systemPrompt: "You are a great researcher",
    tools: [internetSearch],
    model: "openai:gpt-5.5", // Optional override, defaults to main agent model
  };
  const subagents = [researchSubagent];

  const agent = createDeepAgent({
    model: "google_genai:gemini-3.6-flash",
    subagents,
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent, type SubAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const researchSubagent: SubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions",
    systemPrompt: "You are a great researcher",
    tools: [internetSearch],
    model: "anthropic:claude-sonnet-4-6", // Optional override, defaults to main agent model
  };
  const subagents = [researchSubagent];

  const agent = createDeepAgent({
    model: "google_genai:gemini-3.6-flash",
    subagents,
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent, type SubAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const researchSubagent: SubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions",
    systemPrompt: "You are a great researcher",
    tools: [internetSearch],
    model: "openrouter:openrouter:z-ai/glm-5.2", // Optional override, defaults to main agent model
  };
  const subagents = [researchSubagent];

  const agent = createDeepAgent({
    model: "google_genai:gemini-3.6-flash",
    subagents,
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent, type SubAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const researchSubagent: SubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions",
    systemPrompt: "You are a great researcher",
    tools: [internetSearch],
    model: "fireworks:accounts/fireworks/models/glm-5p2", // Optional override, defaults to main agent model
  };
  const subagents = [researchSubagent];

  const agent = createDeepAgent({
    model: "google_genai:gemini-3.6-flash",
    subagents,
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent, type SubAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const researchSubagent: SubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions",
    systemPrompt: "You are a great researcher",
    tools: [internetSearch],
    model: "baseten:zai-org/GLM-5.2", // Optional override, defaults to main agent model
  };
  const subagents = [researchSubagent];

  const agent = createDeepAgent({
    model: "google_genai:gemini-3.6-flash",
    subagents,
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import { TavilySearch } from "@langchain/tavily";
  import { createDeepAgent, type SubAgent } from "deepagents";
  import { z } from "zod";

  const internetSearch = tool(
    async ({
      query,
      maxResults = 5,
      topic = "general",
      includeRawContent = false,
    }: {
      query: string;
      maxResults?: number;
      topic?: "general" | "news" | "finance";
      includeRawContent?: boolean;
    }) => {
      const tavilySearch = new TavilySearch({
        maxResults,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        includeRawContent,
        topic,
      });
      return await tavilySearch._call({ query });
    },
    {
      name: "internet_search",
      description: "Run a web search",
      schema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().optional().default(5),
        topic: z
          .enum(["general", "news", "finance"])
          .optional()
          .default("general"),
        includeRawContent: z.boolean().optional().default(false),
      }),
    },
  );

  const researchSubagent: SubAgent = {
    name: "research-agent",
    description: "Used to research more in depth questions",
    systemPrompt: "You are a great researcher",
    tools: [internetSearch],
    model: "ollama:north-mini-code-1.0", // Optional override, defaults to main agent model
  };
  const subagents = [researchSubagent];

  const agent = createDeepAgent({
    model: "google_genai:gemini-3.6-flash",
    subagents,
  });
  ```
</CodeGroup>

有关更多信息，请参阅[Subagents](/oss/javascript/deepagents/subagents)。

## 后端

深度代理工具可以利用虚拟文件系统来存储、访问和编辑文件。默认情况下，深度代理使用[⟦T220⟧](https://reference.langchain.com/javascript/deepagents/backends/StateBackend)。

如果您使用[skills](#skills)或[memory](#memory)，则必须在创建代理之前将所需的技能或内存文件添加到后端。

<Tabs>
  <Tab title="StateBackend">
    存储在 `langgraph` 状态的线程范围文件系统后端。

    文件在线程内持续存在（通过检查点），并且不会跨线程共享。

    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, StateBackend } from "deepagents";

    // By default we provide a StateBackend
    const agent = createDeepAgent();

    // Under the hood, it looks like
    const agent2 = createDeepAgent({
      backend: new StateBackend(),
    });
    ```
  </Tab>

  <Tab title="FilesystemBackend">
    本地计算机的文件系统。<Warning>
      该后端授予代理直接文件系统读/写访问权限。
      请谨慎使用，并且仅在适当的环境中使用。
      欲了解更多信息，请参阅[⟦T222⟧](/oss/javascript/deepagents/backends#filesystembackend-local-disk)。
    </Warning>

    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";

      const agent = createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";

      const agent = createDeepAgent({
        model: "openai:gpt-5.5",
        backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";

      const agent = createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";

      const agent = createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";

      const agent = createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";

      const agent = createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";

      const agent = createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        backend: new FilesystemBackend({ rootDir: ".", virtualMode: true }),
      });
      ```
    </CodeGroup>

    <Tip>
      将 `FilesystemBackend` 包装在 `CompositeBackend` 中，以防止内部代理数据（卸载的工具结果、对话历史记录）与项目文件一起写入磁盘。请参阅[recommended pattern](/oss/javascript/deepagents/backends#filesystembackend-local-disk)。
    </Tip>
  </Tab>

  <Tab title="LocalShellBackend">
    直接在主机上执行 shell 的文件系统。提供文件系统工具以及用于运行命令的`execute`工具。

    <Warning>
      该后端向代理授予直接文件系统读/写访问权限**和**在主机上不受限制的 shell 执行。
      请极其谨慎地使用，并且仅在适当的环境中使用。
      有关更多信息，请参阅[⟦T226⟧](/oss/javascript/deepagents/backends#localshellbackend-local-shell)。
    </Warning>

    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, LocalShellBackend } from "deepagents";

      const backend = new LocalShellBackend({ workingDirectory: "." });

      const agent = createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        backend,
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, LocalShellBackend } from "deepagents";

      const backend = new LocalShellBackend({ workingDirectory: "." });

      const agent = createDeepAgent({
        model: "openai:gpt-5.5",
        backend,
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, LocalShellBackend } from "deepagents";

      const backend = new LocalShellBackend({ workingDirectory: "." });

      const agent = createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        backend,
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, LocalShellBackend } from "deepagents";

      const backend = new LocalShellBackend({ workingDirectory: "." });

      const agent = createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        backend,
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, LocalShellBackend } from "deepagents";

      const backend = new LocalShellBackend({ workingDirectory: "." });

      const agent = createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        backend,
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, LocalShellBackend } from "deepagents";

      const backend = new LocalShellBackend({ workingDirectory: "." });

      const agent = createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        backend,
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, LocalShellBackend } from "deepagents";

      const backend = new LocalShellBackend({ workingDirectory: "." });

      const agent = createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        backend,
      });
      ```
    </CodeGroup>
  </Tab>

  <Tab title="StoreBackend">
    提供“跨线程持久化”长期存储的文件系统。

    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

      const agent = createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        backend: new StoreBackend({
          namespace: (rt) => [rt.serverInfo.user.identity],
        }),
        store,
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

      const agent = createDeepAgent({
        model: "openai:gpt-5.5",
        backend: new StoreBackend({
          namespace: (rt) => [rt.serverInfo.user.identity],
        }),
        store,
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

      const agent = createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        backend: new StoreBackend({
          namespace: (rt) => [rt.serverInfo.user.identity],
        }),
        store,
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

      const agent = createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        backend: new StoreBackend({
          namespace: (rt) => [rt.serverInfo.user.identity],
        }),
        store,
      });
      ``````ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

      const agent = createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        backend: new StoreBackend({
          namespace: (rt) => [rt.serverInfo.user.identity],
        }),
        store,
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

      const agent = createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        backend: new StoreBackend({
          namespace: (rt) => [rt.serverInfo.user.identity],
        }),
        store,
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore(); // Good for local dev; omit for LangSmith Deployment

      const agent = createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        backend: new StoreBackend({
          namespace: (rt) => [rt.serverInfo.user.identity],
        }),
        store,
      });
      ```
    </CodeGroup>

    <Note>
      部署到[LangSmith Deployment](/langsmith/deployment)时，省略`store`参数。平台自动为您的代理商提供商店。
    </Note>

    <Tip>
      `namespace`参数控制数据隔离。对于多用户部署，请始终设置 [namespace factory](/oss/javascript/deepagents/backends#namespace-factories) 来隔离每个用户或租户的数据。
    </Tip>
  </Tab>

  <Tab title="ContextHubBackend">
    LangSmith Hub 存储库中的持久文件系统存储。

    欲了解更多详情，请参阅[⟦T229⟧](/oss/javascript/deepagents/backends#contexthubbackend)。
  </Tab>

  <Tab title="CompositeBackend">
    灵活的后端，您可以在文件系统中指定不同的路由以指向不同的后端。

    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import {
        createDeepAgent,
        CompositeBackend,
        StateBackend,
        StoreBackend,
      } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore();

      const agent = createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        backend: new CompositeBackend(new StateBackend(), {
          "/memories/": new StoreBackend({
            namespace: () => ["memories"],
          }),
        }),
        store,
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import {
        createDeepAgent,
        CompositeBackend,
        StateBackend,
        StoreBackend,
      } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore();

      const agent = createDeepAgent({
        model: "openai:gpt-5.5",
        backend: new CompositeBackend(new StateBackend(), {
          "/memories/": new StoreBackend({
            namespace: () => ["memories"],
          }),
        }),
        store,
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import {
        createDeepAgent,
        CompositeBackend,
        StateBackend,
        StoreBackend,
      } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore();

      const agent = createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        backend: new CompositeBackend(new StateBackend(), {
          "/memories/": new StoreBackend({
            namespace: () => ["memories"],
          }),
        }),
        store,
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import {
        createDeepAgent,
        CompositeBackend,
        StateBackend,
        StoreBackend,
      } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore();

      const agent = createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        backend: new CompositeBackend(new StateBackend(), {
          "/memories/": new StoreBackend({
            namespace: () => ["memories"],
          }),
        }),
        store,
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import {
        createDeepAgent,
        CompositeBackend,
        StateBackend,
        StoreBackend,
      } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore();

      const agent = createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        backend: new CompositeBackend(new StateBackend(), {
          "/memories/": new StoreBackend({
            namespace: () => ["memories"],
          }),
        }),
        store,
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import {
        createDeepAgent,
        CompositeBackend,
        StateBackend,
        StoreBackend,
      } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore();

      const agent = createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        backend: new CompositeBackend(new StateBackend(), {
          "/memories/": new StoreBackend({
            namespace: () => ["memories"],
          }),
        }),
        store,
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import {
        createDeepAgent,
        CompositeBackend,
        StateBackend,
        StoreBackend,
      } from "deepagents";
      import { InMemoryStore } from "@langchain/langgraph";

      const store = new InMemoryStore();

      const agent = createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        backend: new CompositeBackend(new StateBackend(), {
          "/memories/": new StoreBackend({
            namespace: () => ["memories"],
          }),
        }),
        store,
      });
      ```
    </CodeGroup>
  </Tab>
</Tabs>

欲了解更多信息，请参阅[Backends](/oss/javascript/deepagents/backends)。

### 沙箱

沙箱是专门的 [backends](/oss/javascript/deepagents/backends)，它在具有自己的文件系统和用于 shell 命令的 `execute` 工具的隔离环境中运行代理代码。
当您希望深度代理写入文件、安装依赖项并运行命令而不更改本地计算机上的任何内容时，请使用沙箱后端。

在创建深度代理时，您可以通过将沙箱后端传递给 `backend` 来配置沙箱：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createDeepAgent, LangSmithSandbox } from "deepagents";
import { ChatAnthropic } from "@langchain/anthropic";
import { SandboxClient } from "langsmith/sandbox";

const client = new SandboxClient();
const lsSandbox = await client.createSandbox();

try {
  const agent = createDeepAgent({
    model: new ChatAnthropic({ model: "claude-opus-4-8" }),
    systemPrompt: "You are a coding assistant with sandbox access.",
    backend: new LangSmithSandbox({ sandbox: lsSandbox }),
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: "Create a hello world Python script and run it",
      },
    ],
  });
} finally {
  await client.deleteSandbox(lsSandbox.name);
}
```欲了解更多信息，请参阅[Sandboxes](/oss/javascript/deepagents/sandboxes)。

## 人机交互

某些工具操作可能很敏感，需要人工批准才能执行。
您可以为每个工具配置批准：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { createDeepAgent } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

const removeFile = tool(
  async ({ path }: { path: string }) => {
    return `Deleted ${path}`;
  },
  {
    name: "remove_file",
    description: "Delete a file from the filesystem.",
    schema: z.object({
      path: z.string(),
    }),
  },
);

const fetchFile = tool(
  async ({ path }: { path: string }) => {
    return `Contents of ${path}`;
  },
  {
    name: "fetch_file",
    description: "Read a file from the filesystem.",
    schema: z.object({
      path: z.string(),
    }),
  },
);

const notifyEmail = tool(
  async ({
    to,
    subject,
    body,
  }: {
    to: string;
    subject: string;
    body: string;
  }) => {
    return `Sent email to ${to}`;
  },
  {
    name: "notify_email",
    description: "Send an email.",
    schema: z.object({
      to: z.string(),
      subject: z.string(),
      body: z.string(),
    }),
  },
);

// Checkpointer is REQUIRED for human-in-the-loop
const checkpointer = new MemorySaver();

const agent = createDeepAgent({
  model: "google_genai:gemini-3.6-flash",
  tools: [removeFile, fetchFile, notifyEmail],
  interruptOn: {
    remove_file: true, // Default: approve, edit, reject, respond
    fetch_file: false, // No interrupts needed
    notify_email: { allowedDecisions: ["approve", "reject"] }, // No editing
  },
  checkpointer, // Required!
});
```

您可以在工具调用时以及工具调用内部为代理和子代理配置中断。
欲了解更多信息，请参阅[Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop)。

## 技能

您可以使用[skills](/oss/javascript/deepagents/overview)为您的深度代理提供新的功能和专业知识。
虽然 [tools](/oss/javascript/deepagents/customization#tools) 倾向于涵盖较低级别的功能，例如本机文件系统操作，但技能可以包含有关如何完成任务、参考信息和其他资产（例如模板）的详细说明。
仅当代理确定该技能对当前提示有用时，代理才会加载这些文件。
这种渐进式披露减少了代理在启动时必须考虑的令牌和上下文的数量。

例如技能，请参阅[Deep Agents example skills](https://github.com/langchain-ai/deepagentsjs/tree/main/examples/skills)。

要为深度代理添加技能，请将它们作为参数传递给 `create_deep_agent`：

<Tabs>
  <Tab title="StateBackend">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, StateBackend, type FileData } from "deepagents";
    import { MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    const backend = new StateBackend();

    function createFileData(content: string): FileData {
      const now = new Date().toISOString();
      return {
        content: content.split("\n"),
        created_at: now,
        modified_at: now,
      };
    }

    const skillsFiles: Record<string, FileData> = {};
    const skillUrl =
      "https://raw.githubusercontent.com/langchain-ai/deepagentsjs/refs/heads/main/examples/skills/langgraph-docs/SKILL.md";
    const response = await fetch(skillUrl);
    const skillContent = await response.text();

    skillsFiles["/skills/langgraph-docs/SKILL.md"] = createFileData(skillContent);

    const agent = await createDeepAgent({
      model: "google-genai:gemini-3.1-pro-preview",
      backend,
      checkpointer, // Required !
      // IMPORTANT: deepagents skill source paths are virtual (POSIX) paths relative to the backend root.
      skills: ["/skills/"],
    });

    const config = { configurable: { thread_id: `thread-${Date.now()}` } };
    const result = await agent.invoke(
      {
        messages: [{ role: "user", content: "what is langraph?" }],
        files: skillsFiles,
      },
      config,
    );
    ```
  </Tab>

  <Tab title="StoreBackend">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
    import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    const store = new InMemoryStore();
    const backend = new StoreBackend({
      namespace: () => ["filesystem"],
    });

    function createFileData(content: string): FileData {
      const now = new Date().toISOString();
      return {
        content: content.split("\n"),
        created_at: now,
        modified_at: now,
      };
    }

    const skillUrl =
      "https://raw.githubusercontent.com/langchain-ai/deepagentsjs/refs/heads/main/examples/skills/langgraph-docs/SKILL.md";

    const response = await fetch(skillUrl);
    const skillContent = await response.text();
    const fileData = createFileData(skillContent);

    await store.put(["filesystem"], "/skills/langgraph-docs/SKILL.md", fileData);

    const agent = await createDeepAgent({
      model: "google-genai:gemini-3.1-pro-preview",
      backend,
      store,
      checkpointer,
      // IMPORTANT: deepagents skill source paths are virtual (POSIX) paths relative to the backend root.
      skills: ["/skills/"],
    });

    const config = {
      recursionLimit: 50,
      configurable: { thread_id: `thread-${Date.now()}` },
    };
    const result = await agent.invoke(
      { messages: [{ role: "user", content: "what is langraph?" }] },
      config,
    );
    ```
  </Tab>

  <Tab title="FilesystemBackend">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent, FilesystemBackend } from "deepagents";
    import { MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    const backend = new FilesystemBackend({ rootDir: process.cwd() });

    const agent = await createDeepAgent({
      model: "google-genai:gemini-3.1-pro-preview",
      backend,
      skills: ["./examples/skills/"],
      interruptOn: {
        read_file: true,
        write_file: true,
        delete_file: true,
      },
      checkpointer, // Required!
    });

    const config = { configurable: { thread_id: `thread-${Date.now()}` } };
    const result = await agent.invoke(
      { messages: [{ role: "user", content: "what is langraph?" }] },
      config,
    );
    ```
  </Tab>
</Tabs>

## 内存

使用 [⟦T233⟧ files](https://agents.md/) 为您的深度代理提供额外的上下文。<Tip>
  要生成编码代理通过`AGENTS.md`发现的存储库wiki，请参阅[OpenWiki](/oss/openwiki/overview)。
</Tip>

创建深度代理时，您可以将一个或多个文件路径传递给 `memory` 参数：

<Tabs>
  <Tab title="StateBackend">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, type FileData } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);
      const checkpointer = new MemorySaver();

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const agent = await createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        memory: ["/AGENTS.md"],
        checkpointer: checkpointer,
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
          // Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
          files: { "/AGENTS.md": createFileData(agentsMd) },
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, type FileData } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);
      const checkpointer = new MemorySaver();

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const agent = await createDeepAgent({
        model: "openai:gpt-5.5",
        memory: ["/AGENTS.md"],
        checkpointer: checkpointer,
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
          // Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
          files: { "/AGENTS.md": createFileData(agentsMd) },
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, type FileData } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);
      const checkpointer = new MemorySaver();

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const agent = await createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        memory: ["/AGENTS.md"],
        checkpointer: checkpointer,
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
          // Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
          files: { "/AGENTS.md": createFileData(agentsMd) },
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, type FileData } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);
      const checkpointer = new MemorySaver();

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const agent = await createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        memory: ["/AGENTS.md"],
        checkpointer: checkpointer,
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
          // Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
          files: { "/AGENTS.md": createFileData(agentsMd) },
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, type FileData } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);
      const checkpointer = new MemorySaver();

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const agent = await createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        memory: ["/AGENTS.md"],
        checkpointer: checkpointer,
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
          // Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
          files: { "/AGENTS.md": createFileData(agentsMd) },
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, type FileData } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);
      const checkpointer = new MemorySaver();

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const agent = await createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        memory: ["/AGENTS.md"],
        checkpointer: checkpointer,
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
          // Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
          files: { "/AGENTS.md": createFileData(agentsMd) },
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, type FileData } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);
      const checkpointer = new MemorySaver();

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const agent = await createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        memory: ["/AGENTS.md"],
        checkpointer: checkpointer,
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
          // Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
          files: { "/AGENTS.md": createFileData(agentsMd) },
        },
        { configurable: { thread_id: "12345" } },
      );
      ```
    </CodeGroup>
  </Tab>

  <Tab title="StoreBackend">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
      import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const store = new InMemoryStore();
      const fileData = createFileData(agentsMd);
      await store.put(["filesystem"], "/AGENTS.md", fileData);

      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        backend: new StoreBackend({
          namespace: () => ["filesystem"],
        }),
        store: store,
        checkpointer: checkpointer,
        memory: ["/AGENTS.md"],
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
      import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const store = new InMemoryStore();
      const fileData = createFileData(agentsMd);
      await store.put(["filesystem"], "/AGENTS.md", fileData);

      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "openai:gpt-5.5",
        backend: new StoreBackend({
          namespace: () => ["filesystem"],
        }),
        store: store,
        checkpointer: checkpointer,
        memory: ["/AGENTS.md"],
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
      import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const store = new InMemoryStore();
      const fileData = createFileData(agentsMd);
      await store.put(["filesystem"], "/AGENTS.md", fileData);

      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        backend: new StoreBackend({
          namespace: () => ["filesystem"],
        }),
        store: store,
        checkpointer: checkpointer,
        memory: ["/AGENTS.md"],
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
      import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const store = new InMemoryStore();
      const fileData = createFileData(agentsMd);
      await store.put(["filesystem"], "/AGENTS.md", fileData);

      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        backend: new StoreBackend({
          namespace: () => ["filesystem"],
        }),
        store: store,
        checkpointer: checkpointer,
        memory: ["/AGENTS.md"],
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
      import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const store = new InMemoryStore();
      const fileData = createFileData(agentsMd);
      await store.put(["filesystem"], "/AGENTS.md", fileData);

      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        backend: new StoreBackend({
          namespace: () => ["filesystem"],
        }),
        store: store,
        checkpointer: checkpointer,
        memory: ["/AGENTS.md"],
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
      import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const store = new InMemoryStore();
      const fileData = createFileData(agentsMd);
      await store.put(["filesystem"], "/AGENTS.md", fileData);

      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        backend: new StoreBackend({
          namespace: () => ["filesystem"],
        }),
        store: store,
        checkpointer: checkpointer,
        memory: ["/AGENTS.md"],
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
        },
        { configurable: { thread_id: "12345" } },
      );
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, StoreBackend, type FileData } from "deepagents";
      import { InMemoryStore, MemorySaver } from "@langchain/langgraph";

      const AGENTS_MD_URL =
        "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md";

      async function fetchText(url: string): Promise<string> {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
        }
        return await res.text();
      }

      const agentsMd = await fetchText(AGENTS_MD_URL);

      function createFileData(content: string): FileData {
        const now = new Date().toISOString();
        return {
          content,
          mimeType: "text/plain",
          created_at: now,
          modified_at: now,
        };
      }

      const store = new InMemoryStore();
      const fileData = createFileData(agentsMd);
      await store.put(["filesystem"], "/AGENTS.md", fileData);

      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        backend: new StoreBackend({
          namespace: () => ["filesystem"],
        }),
        store: store,
        checkpointer: checkpointer,
        memory: ["/AGENTS.md"],
      });

      const result = await agent.invoke(
        {
          messages: [
            {
              role: "user",
              content: "Please tell me what's in your memory files.",
            },
          ],
        },
        { configurable: { thread_id: "12345" } },
      );
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Filesystem">
    <CodeGroup>
      ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      // Checkpointer is REQUIRED for human-in-the-loop
      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "google-genai:gemini-3.6-flash",
        backend: new FilesystemBackend({ rootDir: "/Users/user/{project}" }),
        memory: ["./AGENTS.md", "./.deepagents/AGENTS.md"],
        interruptOn: {
          read_file: true,
          write_file: true,
          delete_file: true,
        },
        checkpointer, // Required!
      });
      ```

      ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      // Checkpointer is REQUIRED for human-in-the-loop
      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "openai:gpt-5.5",
        backend: new FilesystemBackend({ rootDir: "/Users/user/{project}" }),
        memory: ["./AGENTS.md", "./.deepagents/AGENTS.md"],
        interruptOn: {
          read_file: true,
          write_file: true,
          delete_file: true,
        },
        checkpointer, // Required!
      });
      ```

      ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      // Checkpointer is REQUIRED for human-in-the-loop
      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "anthropic:claude-sonnet-4-6",
        backend: new FilesystemBackend({ rootDir: "/Users/user/{project}" }),
        memory: ["./AGENTS.md", "./.deepagents/AGENTS.md"],
        interruptOn: {
          read_file: true,
          write_file: true,
          delete_file: true,
        },
        checkpointer, // Required!
      });
      ```

      ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      // Checkpointer is REQUIRED for human-in-the-loop
      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "openrouter:openrouter:z-ai/glm-5.2",
        backend: new FilesystemBackend({ rootDir: "/Users/user/{project}" }),
        memory: ["./AGENTS.md", "./.deepagents/AGENTS.md"],
        interruptOn: {
          read_file: true,
          write_file: true,
          delete_file: true,
        },
        checkpointer, // Required!
      });
      ```

      ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      // Checkpointer is REQUIRED for human-in-the-loop
      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "fireworks:accounts/fireworks/models/glm-5p2",
        backend: new FilesystemBackend({ rootDir: "/Users/user/{project}" }),
        memory: ["./AGENTS.md", "./.deepagents/AGENTS.md"],
        interruptOn: {
          read_file: true,
          write_file: true,
          delete_file: true,
        },
        checkpointer, // Required!
      });
      ```

      ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      // Checkpointer is REQUIRED for human-in-the-loop
      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "baseten:zai-org/GLM-5.2",
        backend: new FilesystemBackend({ rootDir: "/Users/user/{project}" }),
        memory: ["./AGENTS.md", "./.deepagents/AGENTS.md"],
        interruptOn: {
          read_file: true,
          write_file: true,
          delete_file: true,
        },
        checkpointer, // Required!
      });
      ```

      ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { createDeepAgent, FilesystemBackend } from "deepagents";
      import { MemorySaver } from "@langchain/langgraph";

      // Checkpointer is REQUIRED for human-in-the-loop
      const checkpointer = new MemorySaver();

      const agent = await createDeepAgent({
        model: "ollama:north-mini-code-1.0",
        backend: new FilesystemBackend({ rootDir: "/Users/user/{project}" }),
        memory: ["./AGENTS.md", "./.deepagents/AGENTS.md"],
        interruptOn: {
          read_file: true,
          write_file: true,
          delete_file: true,
        },
        checkpointer, // Required!
      });
      ```
    </CodeGroup>
  </Tab>
</Tabs>

## 结构化输出

深度代理支持[structured output](/oss/javascript/langchain/structured-output)。

您可以通过将其作为`responseFormat`参数传递给`createDeepAgent()`调用来设置所需的结构化输出模式。
当模型生成结构化数据时，它会被捕获、验证并在代理状态的“structuralResponse”键中返回。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import { createDeepAgent } from "deepagents";
import { z } from "zod";

const internetSearch = tool(
  async ({
    query,
    maxResults = 5,
    topic = "general",
    includeRawContent = false,
  }: {
    query: string;
    maxResults?: number;
    topic?: "general" | "news" | "finance";
    includeRawContent?: boolean;
  }) => {
    const tavilySearch = new TavilySearch({
      maxResults,
      tavilyApiKey: process.env.TAVILY_API_KEY,
      includeRawContent,
      topic,
    });
    return await tavilySearch._call({ query });
  },
  {
    name: "internet_search",
    description: "Run a web search",
    schema: z.object({
      query: z.string().describe("The search query"),
      maxResults: z.number().optional().default(5),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .default("general"),
      includeRawContent: z.boolean().optional().default(false),
    }),
  },
);

const weatherReportSchema = z.object({
  location: z.string().describe("The location for this weather report"),
  temperature: z.number().describe("Current temperature in Celsius"),
  condition: z
    .string()
    .describe("Current weather condition (e.g., sunny, cloudy, rainy)"),
  humidity: z.number().describe("Humidity percentage"),
  windSpeed: z.number().describe("Wind speed in km/h"),
  forecast: z.string().describe("Brief forecast for the next 24 hours"),
});

const agent = await createDeepAgent({
  responseFormat: weatherReportSchema,
  tools: [internetSearch],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What's the weather like in San Francisco?",
    },
  ],
});

console.log(result.structuredResponse);
// {
//   location: 'San Francisco, California',
//   temperature: 18.3,
//   condition: 'Sunny',
//   humidity: 48,
//   windSpeed: 7.6,
//   forecast: 'Clear skies with temperatures remaining mild. High of 18°C (64°F) during the day, dropping to around 11°C (52°F) at night.'
// }
```

有关更多信息和示例，请参阅[response format](/oss/javascript/langchain/structured-output#response-format)。

## 高级

`createDeepAgent` 在`createAgent` 之上预组装中间件堆栈。要构建完全自定义的代理（准确选择要包含的功能），请参阅[Configure the harness](/oss/javascript/langchain/agents#configure-the-harness)。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/customization.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>