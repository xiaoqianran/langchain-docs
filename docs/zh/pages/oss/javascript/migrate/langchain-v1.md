<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangChain v1 migration guide | https://docs.langchain.com/oss/javascript/migrate/langchain-v1 -->

# LangChain v1迁移指南

本迁移指南概述了 LangChain v1 的主要变化。要了解有关 v1 的新功能的更多信息，请参阅[introductory post](/oss/javascript/releases/langchain-v1)。

要升级，

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langchain@latest @langchain/core@latest
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm install langchain@latest @langchain/core@latest
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add langchain@latest @langchain/core@latest
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add langchain@latest @langchain/core@latest
  ```
</CodeGroup>

## `createAgent`

在 v1 中，预构建的 React Agent 现在位于 langchain 包中。下表概述了已更改的功能：

|部分|发生了什么变化|
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Import path](#import-path) |包裹从`@langchain/langgraph/prebuilts`移至`langchain` |
| [Prompts](#prompts) |参数重命名为`systemPrompt`，动态提示使用中间件 |
| [Pre-model hook](#pre-model-hook) |被中间件替换为`beforeModel`方法 |
| [Post-model hook](#post-model-hook) |被中间件替换为`afterModel`方法 || [Custom state](#custom-state) |中间件中定义，仅限 zod 对象 |
| [Model](#model) |通过中间件动态选择，不支持预绑定模型 |
| [Tools](#tools) |工具错误处理已通过 `wrapToolCall` 转移到中间件 |
| [Structured output](#structured-output) |提示输出已删除，请使用`toolStrategy`/​​`providerStrategy` |
| [Streaming node name](#streaming-node-name-rename) |节点名称由`"agent"`更改为`"model"` |
| [Runtime context](#runtime-context) | `context` 属性代替 `config.configurable` |
| [Namespace](#simplified-package) |简化以专注于代理构建块，遗留代码移至`@langchain/classic` |

### 导入路径

预构建的 React Agent 的导入路径已从 `@langchain/langgraph/prebuilts` 更改为 `langchain`。函数名称已从`createReactAgent`更改为`createAgent`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createReactAgent } from "@langchain/langgraph/prebuilts"; // [!code --]
import { createAgent } from "langchain"; // [!code ++]
```

### 提示

#### 静态提示重命名

`prompt`参数已重命名为`systemPrompt`：

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  agent = createAgent({
    model,
    tools,
    systemPrompt: "You are a helpful assistant.", // [!code highlight]
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent } from "@langchain/langgraph/prebuilts";

  const agent = createReactAgent({
    model,
    tools,
    prompt: "You are a helpful assistant.", // [!code highlight]
  });
  ```
</CodeGroup>

#### `SystemMessage`

如果在系统提示符中使用`SystemMessage`对象，则现在直接使用字符串内容：

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { SystemMessage, createAgent } from "langchain";

  const agent = createAgent({
    model,
    tools,
    systemPrompt: "You are a helpful assistant.", // [!code highlight]
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent } from "@langchain/langgraph/prebuilts";

  const agent = createReactAgent({
    model,
    tools,
    prompt: new SystemMessage(content: "You are a helpful assistant."), // [!code highlight]
  });
  ```
</CodeGroup>####动态提示

动态提示是一种核心上下文工程模式——它们根据当前对话状态调整您告诉模型的内容。为此，请使用 `dynamicSystemPromptMiddleware`：

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, dynamicSystemPromptMiddleware } from "langchain";
  import * as z from "zod";

  const contextSchema = z.object({
    userRole: z.enum(["expert", "beginner"]).default("beginner"),
  });

  const userRolePrompt = dynamicSystemPromptMiddleware<z.infer<typeof contextSchema>>( // [!code highlight]
      (_state, runtime) => {
          const userRole = runtime.context.userRole;
          const basePrompt = "You are a helpful assistant.";

          if (userRole === "expert") {
              return `${basePrompt} Provide detailed technical responses.`;
          } else if (userRole === "beginner") {
              return `${basePrompt} Explain concepts simply and avoid jargon.`;
          }
          return basePrompt; // [!code highlight]
      }
  );

  const agent = createAgent({
    model,
    tools,
    middleware: [userRolePrompt],
    contextSchema,
  });

  await agent.invoke(
    {
      messages: [new HumanMessage("Explain async programming")],
    },
    {
      context: {
        userRole: "expert",
      },
    }
  );
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent } from "@langchain/langgraph/prebuilts";

  const contextSchema = z.object({
    userRole: z.enum(["expert", "beginner"]),
  });

  const agent = createReactAgent({
    model,
    tools,
    prompt: (state) => {
      const userRole = state.context.userRole;
      const basePrompt = "You are a helpful assistant.";

      if (userRole === "expert") {
        return `${basePrompt} Provide detailed technical responses.`;
      } else if (userRole === "beginner") {
        return `${basePrompt} Explain concepts simply and avoid jargon.`;
      }
      return basePrompt;
    },
    contextSchema,
  });

  // Use with context via config.configurable
  await agent.invoke(
    {
      messages: [new HumanMessage("Explain async programming")],
    },
    {
      config: {
        configurable: { userRole: "expert" },
      },
    }
  );
  ```
</CodeGroup>

### 预模型钩子

预模型挂钩现在通过 `beforeModel` 方法实现为中间件。这种模式更具可扩展性——您可以定义多个中间件在调用模型之前运行，并在代理之间重用它们。

常见用例包括：

* 总结对话历史
* 修剪消息
* 输入护栏，例如 PII 修订

v1 包含内置摘要中间件：

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, summarizationMiddleware } from "langchain";

  const agent = createAgent({
    model: "claude-sonnet-4-6",
    tools,
    middleware: [
      summarizationMiddleware({
        model: "claude-sonnet-4-6",
        trigger: { tokens: 1000 },
      }),
    ],
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent } from "@langchain/langgraph/prebuilts";

  function customSummarization(state) {
    // Custom logic for message summarization
  }

  const agent = createReactAgent({
    model: "claude-sonnet-4-6",
    tools,
    preModelHook: customSummarization,
  });
  ```
</CodeGroup>

### 后模型挂钩

后模型挂钩现在通过 `afterModel` 方法实现为中间件。这使您可以在模型响应后组合多个处理程序。

常见用例包括：

* 人机交互批准
* 输出护栏

v1 包含一个内置的人机交互中间件：

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware } from "langchain";

  const agent = createAgent({
    model: "claude-sonnet-4-6",
    tools: [readEmail, sendEmail],
    middleware: [
      humanInTheLoopMiddleware({
        interruptOn: {
          sendEmail: { allowedDecisions: ["approve", "edit", "reject"] },
        },
      }),
    ],
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent } from "@langchain/langgraph/prebuilts";

  function customHumanInTheLoopHook(state) {
    // Custom approval logic
  }

  const agent = createReactAgent({
    model: "claude-sonnet-4-6",
    tools: [readEmail, sendEmail],
    postModelHook: customHumanInTheLoopHook,
  });
  ```
</CodeGroup>

### 自定义状态

现在使用 `stateSchema` 属性在中间件中定义自定义状态。使用 Zod 声明通过代理运行携带的其他状态字段。

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { createAgent, createMiddleware, tool } from "langchain";

  const UserState = z.object({
    userName: z.string(),
  });

  const userState = createMiddleware({
    name: "UserState",
    stateSchema: UserState,
    beforeModel: (state) => {
      // Access custom state properties
      const name = state.userName;
      // Optionally modify messages/system prompt based on state
      return;
    },
  });

  const greet = tool(
    async () => {
      return "Hello!";
    },
    {
      name: "greet",
      description: "Greet the user",
      schema: z.object({}),
    }
  );

  const agent = createAgent({
    model: "claude-sonnet-4-6",
    tools: [greet],
    middleware: [userState],
  });

  await agent.invoke({
    messages: [{ role: "user", content: "Hi" }],
    userName: "Ada",
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { getCurrentTaskInput } from "@langchain/langgraph";
  import { createReactAgent } from "@langchain/langgraph/prebuilts";
  import * as z from "zod";

  const UserState = z.object({
    userName: z.string(),
  });

  const greet = tool(
    async () => {
      const state = await getCurrentTaskInput();
      const userName = state.userName;
      return `Hello ${userName}!`;
    },
  );

  // Custom state was provided via agent-level state schema or accessed ad hoc in hooks
  const agent = createReactAgent({
    model: "claude-sonnet-4-6",
    tools: [greet],
    stateSchema: UserState,
  });
  ```
</CodeGroup>

### 型号动态模型选择现在通过中间件进行。使用 `wrapModelCall` 根据状态或运行时上下文交换模型（和工具）。在 `createReactAgent` 中，这是通过传递给 `model` 参数的函数完成的。

此功能已在 v1 中移植到中间件接口。

#### 动态模型选择

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";

  const dynamicModel = createMiddleware({
    name: "DynamicModel",
    wrapModelCall: (request, handler) => {
      const messageCount = request.state.messages.length;
      const model = messageCount > 10 ? "openai:gpt-5.5" : "openai:gpt-5-nano";
      return handler({ ...request, model });
    },
  });

  const agent = createAgent({
    model: "gpt-5-nano",
    tools,
    middleware: [dynamicModel],
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent } from "@langchain/langgraph/prebuilts";

  function selectModel(state) {
    return state.messages.length > 10 ? "openai:gpt-5.5" : "openai:gpt-5-nano";
  }

  const agent = createReactAgent({
    model: selectModel,
    tools,
  });
  ```
</CodeGroup>

#### 预绑定模型

为了更好地支持结构化输出，`createAgent`应该接收一个普通模型（字符串或实例）和一个单独的`tools`列表。使用结构化输出时，避免传递与工具预先绑定的模型。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// No longer supported
// const modelWithTools = new ChatOpenAI({ model: "gpt-5.4-mini" }).bindTools([someTool]);
// const agent = createAgent({ model: modelWithTools, tools: [] });

// Use instead
const agent = createAgent({ model: "gpt-5.4-mini", tools: [someTool] });
```

### 工具

`createAgent` 的 `tools` 参数接受：

* 使用`tool`创建的函数
* LangChain工具实例
* 代表内置提供者工具的对象

#### 处理工具错误

您现在可以使用实现 `wrapToolCall` 方法的中间件来配置工具错误的处理。

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware, ToolMessage } from "langchain";

  const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        // Only handle errors that occur during tool execution due to invalid inputs
        // that pass schema validation but fail at runtime (e.g., invalid SQL syntax).
        // Do NOT handle:
        // - Network failures (use tool retry middleware instead)
        // - Incorrect tool implementation errors (should bubble up)
        // - Schema mismatch errors (already auto-handled by the framework)
        //
        // Return a custom error message to the model
        return new ToolMessage({
          content: `Tool error: Please check your input and try again. (${error})`,
          tool_call_id: request.toolCall.id!,
        });
      }
    },
  });

  const agent = createAgent({
    model: "claude-sonnet-4-6",
    tools: [checkWeather, searchWeb],
    middleware: [handleToolErrors],
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilts";

  const agent = createReactAgent({
    model: "claude-sonnet-4-6",
    tools: new ToolNode(
      [checkWeather, searchWeb],
      { handleToolErrors: true } // [!code highlight]
    ),
  });
  ```
</CodeGroup>

### 结构化输出

#### 节点变化

结构化输出过去是在与主代理不同的节点中生成的。现在情况已不再如此。结构化输出在主循环中生成（无需额外的 LLM 调用），从而降低成本和延迟。

#### 工具和提供商策略

在v1中，有两种策略：* `toolStrategy`使用人工工具调用来生成结构化输出
* `providerStrategy` 使用提供者本地结构化输出生成

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, toolStrategy } from "langchain";
  import * as z from "zod";

  const OutputSchema = z.object({
    summary: z.string(),
    sentiment: z.string(),
  });

  const agent = createAgent({
    model: "gpt-5.4-mini",
    tools,
    // explicitly using tool strategy
    responseFormat: toolStrategy(OutputSchema), // [!code highlight]
  });
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent } from "@langchain/langgraph/prebuilts";
  import * as z from "zod";

  const OutputSchema = z.object({
    summary: z.string(),
    sentiment: z.string(),
  });

  const agent = createReactAgent({
    model: "gpt-5.4-mini",
    tools,
    // Structured output was driven primarily via tool-calling with fewer options
    responseFormat: OutputSchema,
  });
  ```
</CodeGroup>

#### 提示输出已删除

`responseFormat` 中通过自定义指令提示的输出被删除，以支持上述策略。

### 流节点名称重命名

当从代理流式传输事件时，节点名称从 `"agent"` 更改为 `"model"`，以更好地反映节点的用途。

### 运行时上下文

调用代理时，通过 `context` 配置参数传递静态只读配置。这取代了使用 `config.configurable` 的模式。

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, HumanMessage } from "langchain";
  import * as z from "zod";

  const agent = createAgent({
    model: "gpt-5.5",
    tools,
    contextSchema: z.object({ userId: z.string(), sessionId: z.string() }),
  });

  const result = await agent.invoke(
    { messages: [new HumanMessage("Hello")] },
    { context: { userId: "123", sessionId: "abc" } }, // [!code highlight]
  );
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createReactAgent, HumanMessage } from "@langchain/langgraph/prebuilts";

  const agent = createReactAgent({ model, tools });

  // Pass context via config.configurable
  const result = await agent.invoke(
    { messages: [new HumanMessage("Hello")] },
    {
      config: { // [!code highlight]
        configurable: { userId: "123", sessionId: "abc" }, // [!code highlight]
      }, // [!code highlight]
    }
  );
  ```
</CodeGroup>

<Note>
  旧的 `config.configurable` 模式仍然适用于向后兼容，但建议新应用程序或迁移到 v1 的应用程序使用新的 `context` 参数。
</Note>

***

## 标准内容

在 v1 中，消息获得与提供商无关的标准内容块。通过 `message.contentBlocks` 访问它们，以获得跨提供商的一致的类型化视图。对于字符串或提供者本机结构，现有的 `message.content` 字段保持不变。

### 发生了什么变化* 规范化内容消息的新 `contentBlocks` 属性。
* `ContentBlock` 下的新 TypeScript 类型用于强类型。
* 通过 `LC_OUTPUT_VERSION=v1` 或 `outputVersion: "v1"` 将标准块可选序列化为 `content`。

### 阅读标准化内容

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { initChatModel } from "langchain";

  const model = await initChatModel("gpt-5-nano");
  const response = await model.invoke("Explain AI");

  for (const block of response.contentBlocks) {
    if (block.type === "reasoning") {
      console.log(block.reasoning);
    } else if (block.type === "text") {
      console.log(block.text);
    }
  }
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // Provider-native formats vary; you needed per-provider handling.
  const response = await model.invoke("Explain AI");
  for (const item of response.content as any[]) {
    if (item.type === "reasoning") {
      // OpenAI-style reasoning
    } else if (item.type === "thinking") {
      // Anthropic-style thinking
    } else if (item.type === "text") {
      // Text
    }
  }
  ```
</CodeGroup>

### 创建多模式消息

<CodeGroup>
  ```typescript v1 (new) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { HumanMessage } from "langchain";

  const message = new HumanMessage({
    contentBlocks: [
      { type: "text", text: "Describe this image." },
      { type: "image", url: "https://example.com/image.jpg" },
    ],
  });
  const res = await model.invoke([message]);
  ```

  ```typescript v0 (old) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { HumanMessage } from "langchain";

  const message = new HumanMessage({
    // Provider-native structure
    content: [
      { type: "text", text: "Describe this image." },
      { type: "image_url", image_url: { url: "https://example.com/image.jpg" } },
    ],
  });
  const res = await model.invoke([message]);
  ```
</CodeGroup>

### 块类型示例

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ContentBlock } from "langchain";

const textBlock: ContentBlock.Text = {
  type: "text",
  text: "Hello world",
};

const imageBlock: ContentBlock.Multimodal.Image = {
  type: "image",
  url: "https://example.com/image.png",
  mimeType: "image/png",
};
```

有关更多详细信息，请参阅内容块[reference](/oss/javascript/langchain/messages#content-block-reference)。

### 序列化标准内容

默认情况下，标准内容块**不会序列化**到 `content` 属性中。如果您需要访问 `content` 属性中的标准内容块（例如，向客户端发送消息时），您可以选择将它们序列化为 `content`。

<CodeGroup>
  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LC_OUTPUT_VERSION=v1
  ```

  ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { initChatModel } from "langchain";

  const model = await initChatModel("gpt-5-nano", {
    outputVersion: "v1",
  });
  ```
</CodeGroup>

<Note>
  了解更多：[Messages](/oss/javascript/langchain/messages#message-content) 和 [Standard content blocks](/oss/javascript/langchain/messages#standard-content-blocks)。有关输入示例，请参阅[Multimodal](/oss/javascript/langchain/messages#multimodal)。
</Note>

***

## 简化包

`langchain` 包命名空间经过简化，专注于代理构建块。旧功能已移至`@langchain/classic`。新包仅公开最有用和最相关的功能。

### 出口

v1 包包括：|模块|有什么可用的 |笔记|
| ----------- | -------------------------------------------------------- | ---------------------------------- |
|代理| `createAgent`、`AgentState` |核心代理创建功能 |
|留言 |消息类型、内容块、`trimMessages` |从`@langchain/core`转口|
|工具| `tool`，工具类 |从`@langchain/core`转口|
|聊天模特| `initChatModel`、`BaseChatModel` |统一模型初始化 |

### `@langchain/classic`

如果您使用旧链、索引 API 或之前从 `@langchain/community` 重新导出的功能，请安装 `@langchain/classic` 并更新导入：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/classic
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm install @langchain/classic
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/classic
  ```

  ```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  bun add @langchain/classic
  ```
</CodeGroup>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// v1 (new)
import { ... } from "@langchain/classic";
import { ... } from "@langchain/classic/chains";

// v0 (old)
import { ... } from "langchain";
import { ... } from "langchain/chains";
```

***

## 重大变更

### 删除了 Node 18 支持

所有 LangChain 软件包现在都需要 **Node.js 22 或更高版本**。 Node.js 18 于 2025 年 3 月达到[end of life](https://nodejs.org/en/about/releases/)。

### 新构建输出

所有 langchain 包的构建现在使用基于捆绑器的方法，而不是使用原始打字稿输出。如果您从 `dist/` 目录导入文件（不推荐），则需要更新导入以使用新的模块系统。### 旧代码移至`@langchain/classic`

标准接口和代理焦点之外的旧功能已移至 [⟦T107⟧](https://www.npmjs.com/package/@langchain/classic) 包。请参阅 [Simplified package](#simplified-package) 部分，了解有关核心 `langchain` 包中可用内容以及移至 `@langchain/classic` 的内容的详细信息。

### 删除已弃用的 API

已被弃用并计划在 1.0 中删除的方法、函数和其他对象已被删除。

<Accordion title="View removed deprecated APIs">
  以下已弃用的 API 已在 v1 中删除：

  #### 核心功能

  * `TraceGroup` - 使用 LangSmith 追踪代替
  * `BaseDocumentLoader.loadAndSplit` - 使用 `.load()` 后跟文本分割器
  * `RemoteRunnable` - 不再支持

  #### 提示

  * `BasePromptTemplate.serialize` 和 `.deserialize` - 直接使用 JSON 序列化
  * `ChatPromptTemplate.fromPromptMessages` - 使用`ChatPromptTemplate.fromMessages`

  #### 猎犬

  * `BaseRetrieverInterface.getRelevantDocuments` - 使用 `.invoke()` 代替

  #### 可运行程序

  * `Runnable.bind` - 使用`.bindTools()`或其他特定绑定方法
  * `Runnable.map` - 使用`.batch()` 代替
  * `RunnableBatchOptions.maxConcurrency` - 在配置对象中使用`maxConcurrency`

  #### 聊天模型

  * `BaseChatModel.predictMessages` - 使用`.invoke()` 代替
  * `BaseChatModel.predict` - 使用 `.invoke()` 代替
  * `BaseChatModel.serialize` - 直接使用JSON序列化
  * `BaseChatModel.callPrompt` - 使用`.invoke()` 代替
  * `BaseChatModel.call` - 使用`.invoke()` 代替

  #### 法学硕士* `BaseLLMParams.concurrency` - 在配置对象中使用`maxConcurrency`
  * `BaseLLM.call` - 使用 `.invoke()` 代替
  * `BaseLLM.predict` - 使用`.invoke()` 代替
  * `BaseLLM.predictMessages` - 使用`.invoke()` 代替
  * `BaseLLM.serialize` - 直接使用JSON序列化

  #### 流媒体

  * `createChatMessageChunkEncoderStream` - 直接使用`.stream()`方法

  #### 追踪

  * `BaseTracer.runMap` - 使用 LangSmith 跟踪 API
  * `getTracingCallbackHandler` - 使用 LangSmith 追踪
  * `getTracingV2CallbackHandler` - 使用 LangSmith 追踪
  * `LangChainTracerV1` - 使用 LangSmith 追踪

  #### 内存和存储

  * `BaseListChatMessageHistory.addAIChatMessage` - 将 `.addMessage()` 与 `AIMessage` 一起使用
  * `BaseStoreInterface` - 使用特定的商店实现

  #### 实用程序

  * `getRuntimeEnvironmentSync` - 使用异步`getRuntimeEnvironment()`
</Accordion>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/migrate/langchain-v1.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>