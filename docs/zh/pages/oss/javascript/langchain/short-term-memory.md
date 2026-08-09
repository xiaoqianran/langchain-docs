<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Short-term memory | https://docs.langchain.com/oss/javascript/langchain/short-term-memory -->

## 概述

记忆是一个记住先前交互信息的系统。对于人工智能代理来说，记忆至关重要，因为它可以让它们记住之前的交互、从反馈中学习并适应用户偏好。随着代理通过大量用户交互处理更复杂的任务，此功能对于效率和用户满意度变得至关重要。

短期记忆可让您的应用程序记住单个线程或对话中先前的交互。

<Note>
  线程在会话中组织多个交互，类似于电子邮件在单个对话中对消息进行分组的方式。
</Note>

对话历史是短期记忆最常见的形式。长时间的对话对当今的法学硕士提出了挑战；完整的历史记录可能不适合法学硕士的上下文窗口，从而导致上下文丢失或错误。

即使您的模型支持完整的上下文长度，大多数法学硕士在长上下文中仍然表现不佳。他们会被陈旧或偏离主题的内容“分散注意力”，同时还要承受响应时间较慢和成本较高的问题。聊天模型使用[messages](/oss/javascript/langchain/messages)接受上下文，其中包括指令（系统消息）和输入（人类消息）。在聊天应用程序中，消息在人工输入和模型响应之间交替，导致消息列表随着时间的推移而变长。由于上下文窗口有限，许多应用程序可以从使用删除或“忘记”过时信息的技术中受益。

<Tip>
  需要记住**跨**对话的信息？使用[long-term memory](/oss/javascript/langchain/long-term-memory)跨不同线程和会话存储和调用用户特定或应用程序级数据。
</Tip>

## 用法

要为代理添加短期内存（线程级持久性），您需要在创建代理时指定`checkpointer`。

<Info>
  LangChain 的代理将短期记忆作为代理状态的一部分进行管理。

  通过将这些存储在图的状态中，代理可以访问给定对话的完整上下文，同时保持不同线程之间的分离。

  使用检查指针将状态保存到数据库（或内存），以便可以随时恢复线程。当调用代理或完成一个步骤（如工具调用）时，短期内存会更新，并且在每个步骤开始时读取状态。
</Info>

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]
  import * as z from "zod";

  const getUserInfo = tool(() => "No user profile on file.", {
    name: "get_user_info",
    description: "Look up information about the current user.",
    schema: z.object({}),
  });

  const checkpointer = new MemorySaver(); // [!code highlight]

  const agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [getUserInfo],
    checkpointer,
  });

  const threadConfig = { configurable: { thread_id: "1" } };
  let result = await agent.invoke(
    { messages: [{ role: "user", content: "Hi! My name is Bob." }] },
    threadConfig, // [!code highlight]
  );
  let response = result.messages.at(-1)?.content;
  console.log(response); // "Hi Bob! Nice to see you here. How are you doing?"

  result = await agent.invoke(
    { messages: [{ role: "user", content: "What's my name?" }] },
    threadConfig, // [!code highlight]
  );
  response = result.messages.at(-1)?.content;
  console.log(response); // "You are Bob!"
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]
  import * as z from "zod";

  const getUserInfo = tool(() => "No user profile on file.", {
    name: "get_user_info",
    description: "Look up information about the current user.",
    schema: z.object({}),
  });

  const checkpointer = new MemorySaver(); // [!code highlight]

  const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [getUserInfo],
    checkpointer,
  });

  const threadConfig = { configurable: { thread_id: "1" } };
  let result = await agent.invoke(
    { messages: [{ role: "user", content: "Hi! My name is Bob." }] },
    threadConfig, // [!code highlight]
  );
  let response = result.messages.at(-1)?.content;
  console.log(response); // "Hi Bob! Nice to see you here. How are you doing?"

  result = await agent.invoke(
    { messages: [{ role: "user", content: "What's my name?" }] },
    threadConfig, // [!code highlight]
  );
  response = result.messages.at(-1)?.content;
  console.log(response); // "You are Bob!"
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]
  import * as z from "zod";

  const getUserInfo = tool(() => "No user profile on file.", {
    name: "get_user_info",
    description: "Look up information about the current user.",
    schema: z.object({}),
  });

  const checkpointer = new MemorySaver(); // [!code highlight]

  const agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [getUserInfo],
    checkpointer,
  });

  const threadConfig = { configurable: { thread_id: "1" } };
  let result = await agent.invoke(
    { messages: [{ role: "user", content: "Hi! My name is Bob." }] },
    threadConfig, // [!code highlight]
  );
  let response = result.messages.at(-1)?.content;
  console.log(response); // "Hi Bob! Nice to see you here. How are you doing?"

  result = await agent.invoke(
    { messages: [{ role: "user", content: "What's my name?" }] },
    threadConfig, // [!code highlight]
  );
  response = result.messages.at(-1)?.content;
  console.log(response); // "You are Bob!"
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]
  import * as z from "zod";

  const getUserInfo = tool(() => "No user profile on file.", {
    name: "get_user_info",
    description: "Look up information about the current user.",
    schema: z.object({}),
  });

  const checkpointer = new MemorySaver(); // [!code highlight]

  const agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [getUserInfo],
    checkpointer,
  });

  const threadConfig = { configurable: { thread_id: "1" } };
  let result = await agent.invoke(
    { messages: [{ role: "user", content: "Hi! My name is Bob." }] },
    threadConfig, // [!code highlight]
  );
  let response = result.messages.at(-1)?.content;
  console.log(response); // "Hi Bob! Nice to see you here. How are you doing?"

  result = await agent.invoke(
    { messages: [{ role: "user", content: "What's my name?" }] },
    threadConfig, // [!code highlight]
  );
  response = result.messages.at(-1)?.content;
  console.log(response); // "You are Bob!"
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]
  import * as z from "zod";

  const getUserInfo = tool(() => "No user profile on file.", {
    name: "get_user_info",
    description: "Look up information about the current user.",
    schema: z.object({}),
  });

  const checkpointer = new MemorySaver(); // [!code highlight]

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [getUserInfo],
    checkpointer,
  });

  const threadConfig = { configurable: { thread_id: "1" } };
  let result = await agent.invoke(
    { messages: [{ role: "user", content: "Hi! My name is Bob." }] },
    threadConfig, // [!code highlight]
  );
  let response = result.messages.at(-1)?.content;
  console.log(response); // "Hi Bob! Nice to see you here. How are you doing?"

  result = await agent.invoke(
    { messages: [{ role: "user", content: "What's my name?" }] },
    threadConfig, // [!code highlight]
  );
  response = result.messages.at(-1)?.content;
  console.log(response); // "You are Bob!"
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]
  import * as z from "zod";

  const getUserInfo = tool(() => "No user profile on file.", {
    name: "get_user_info",
    description: "Look up information about the current user.",
    schema: z.object({}),
  });

  const checkpointer = new MemorySaver(); // [!code highlight]

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [getUserInfo],
    checkpointer,
  });

  const threadConfig = { configurable: { thread_id: "1" } };
  let result = await agent.invoke(
    { messages: [{ role: "user", content: "Hi! My name is Bob." }] },
    threadConfig, // [!code highlight]
  );
  let response = result.messages.at(-1)?.content;
  console.log(response); // "Hi Bob! Nice to see you here. How are you doing?"

  result = await agent.invoke(
    { messages: [{ role: "user", content: "What's my name?" }] },
    threadConfig, // [!code highlight]
  );
  response = result.messages.at(-1)?.content;
  console.log(response); // "You are Bob!"
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, tool } from "langchain";
  import { MemorySaver } from "@langchain/langgraph"; // [!code highlight]
  import * as z from "zod";

  const getUserInfo = tool(() => "No user profile on file.", {
    name: "get_user_info",
    description: "Look up information about the current user.",
    schema: z.object({}),
  });

  const checkpointer = new MemorySaver(); // [!code highlight]

  const agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [getUserInfo],
    checkpointer,
  });

  const threadConfig = { configurable: { thread_id: "1" } };
  let result = await agent.invoke(
    { messages: [{ role: "user", content: "Hi! My name is Bob." }] },
    threadConfig, // [!code highlight]
  );
  let response = result.messages.at(-1)?.content;
  console.log(response); // "Hi Bob! Nice to see you here. How are you doing?"

  result = await agent.invoke(
    { messages: [{ role: "user", content: "What's my name?" }] },
    threadConfig, // [!code highlight]
  );
  response = result.messages.at(-1)?.content;
  console.log(response); // "You are Bob!"
  ```
</CodeGroup>

### 生产中

在生产中，使用由数据库支持的检查指针：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";
const checkpointer = PostgresSaver.fromConnString(DB_URI);
```

<Note>
  有关更多检查点选项，包括 SQLite、Postgres 和 Azure Cosmos DB，请参阅持久性文档中的 [list of checkpointer libraries](/oss/javascript/langgraph/checkpointers#checkpointer-libraries)。
</Note>

## 定制代理内存

您可以通过创建具有状态架构的自定义中间件来扩展代理状态。可以使用中间件中的 `stateSchema` 参数传递自定义状态模式。最好使用 `StateSchema` 类进行状态定义（也支持普通 Zod 对象）。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, createMiddleware } from "langchain";
import { StateSchema, MemorySaver } from "@langchain/langgraph";
import * as z from "zod";

const CustomState = new StateSchema({  // [!code highlight]
    userId: z.string(),  // [!code highlight]
    preferences: z.record(z.string(), z.any()),  // [!code highlight]
});  // [!code highlight]

const stateExtensionMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: CustomState,  // [!code highlight]
});

const checkpointer = new MemorySaver();
const agent = createAgent({
    model: "gpt-5.5",
    tools: [],
    middleware: [stateExtensionMiddleware],  // [!code highlight]
    checkpointer,
});

// Custom state can be passed in invoke
const result = await agent.invoke({
    messages: [{ role: "user", content: "Hello" }],
    userId: "user_123",  // [!code highlight]
    preferences: { theme: "dark" },  // [!code highlight]
});
```

## 常见模式

启用 [short-term memory](#usage) 后，长时间对话可能会超出 LLM 的上下文窗口。常见的解决方案有：

<CardGroup>
  <Card title="Trim messages" icon="scissors" href="#trim-messages">
    删除前 N 条或后 N 条消息（在调用 LLM 之前）
  </Card>

  <Card title="Delete messages" icon="trash" href="#delete-messages">
    永久删除 LangGraph 状态中的消息
  </Card>

  <Card title="Summarize messages" icon="stack-2" href="#summarize-messages">
    总结历史记录中较早的消息并将其替换为摘要
  </Card>

  <Card title="Custom strategies" icon="adjustments">
    自定义策略（例如消息过滤等）
  </Card>
</CardGroup>这允许代理在不超出 LLM 上下文窗口的情况下跟踪对话。

### 修剪消息

大多数法学硕士都有最大支持的上下文窗口（以令牌计价）。

决定何时截断消息的一种方法是计算消息历史记录中的标记，并在接近该限制时进行截断。如果您使用 LangChain，则可以使用修剪消息实用程序并指定要从列表中保留的令牌数量，以及用于处理边界的`strategy`（例如，保留最后一个`maxTokens`）。

要修剪代理中的消息历史记录，请使用 [⟦T26⟧](https://reference.langchain.com/javascript/langchain/index/createMiddleware) 和 `beforeModel` 挂钩：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { RemoveMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";
import { MemorySaver, REMOVE_ALL_MESSAGES } from "@langchain/langgraph";

const trimMessages = createMiddleware({
  name: "TrimMessages",
  beforeModel: (state) => {
    const messages = state.messages;

    if (messages.length <= 3) {
      return; // No changes needed
    }

    const firstMsg = messages[0];
    const recentMessages =
      messages.length % 2 === 0 ? messages.slice(-3) : messages.slice(-4);
    const newMessages = [firstMsg, ...recentMessages];

    return {
      messages: [
        new RemoveMessage({ id: REMOVE_ALL_MESSAGES }),
        ...newMessages,
      ],
    };
  },
});

const checkpointer = new MemorySaver();
const agent = createAgent({
  model: "gpt-5.5",
  tools: [...],
  middleware: [trimMessages],
  checkpointer,
});
```

### 删除消息

您可以从图形状态中删除消息以管理消息历史记录。

当您想要删除特定消息或清除整个消息历史记录时，这非常有用。

要从图状态中删除消息，可以使用`RemoveMessage`。为了使 `RemoveMessage` 工作，您需要使用带有 [⟦T30⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/messagesStateReducer) [reducer](/oss/javascript/langgraph/graph-api#reducers) 的状态密钥，如 `MessagesValue`。

要删除特定消息：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { RemoveMessage } from "@langchain/core/messages";

const deleteMessages = (state) => {
    const messages = state.messages;
    if (messages.length > 2) {
        // remove the earliest two messages
        return {
        messages: messages
            .slice(0, 2)
            .map((m) => new RemoveMessage({ id: m.id })),
        };
    }
};
```

<Warning>
  删除消息时，**确保**生成的消息历史记录有效。检查您正在使用的 LLM 提供商的限制。例如：* 一些提供商希望消息历史记录以 `user` 消息开始
  * 大多数提供商要求带有工具调用的 `assistant` 消息后跟相应的 `tool` 结果消息。
</Warning>

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { RemoveMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";

const deleteOldMessages = createMiddleware({
  name: "DeleteOldMessages",
  afterModel: (state) => {
    const messages = state.messages;
    if (messages.length > 2) {
      // remove the earliest two messages
      return {
        messages: messages
          .slice(0, 2)
          .map((m) => new RemoveMessage({ id: m.id! })),
      };
    }
    return;
  },
});

const agent = createAgent({
  model: "gpt-5.5",
  tools: [],
  systemPrompt: "Please be concise and to the point.",
  middleware: [deleteOldMessages],
  checkpointer: new MemorySaver(),
});

const config = { configurable: { thread_id: "1" } };

const streamA = await agent.streamEvents(
  { messages: [{ role: "user", content: "hi! I'm bob" }] },
  { ...config, version: "v3" }
);
for await (const snapshot of streamA.values) {
  const messageDetails = snapshot.messages.map((message) => [
    message.getType(),
    message.content,
  ]);
  console.log(messageDetails);
}

const streamB = await agent.streamEvents(
  { messages: [{ role: "user", content: "write a short poem about cats" }] },
  { ...config, version: "v3" }
);
for await (const snapshot of streamB.values) {
  const messageDetails = snapshot.messages.map((message) => [
    message.getType(),
    message.content,
  ]);
  console.log(messageDetails);
}

const streamC = await agent.streamEvents(
  { messages: [{ role: "user", content: "what's my name?" }] },
  { ...config, version: "v3" }
);
for await (const snapshot of streamC.values) {
  const messageDetails = snapshot.messages.map((message) => [
    message.getType(),
    message.content,
  ]);
  console.log(messageDetails);
}
```

```
[["human", "hi! I'm bob"]]
[["human", "hi! I'm bob"], ["ai", "Hi Bob! Nice to meet you. How can I help you today? I can answer questions, brainstorm ideas, draft text, explain things, or help with code."]]
[["human", "hi! I'm bob"], ["ai", "Hi Bob! Nice to meet you. How can I help you today? I can answer questions, brainstorm ideas, draft text, explain things, or help with code."], ["human", "write a short poem about cats"]]
[["human", "hi! I'm bob"], ["ai", "Hi Bob! Nice to meet you. How can I help you today? I can answer questions, brainstorm ideas, draft text, explain things, or help with code."], ["human", "write a short poem about cats"], ["ai", "There once was a cat on a wall, Who barely moved at all..."]]
[["human", "write a short poem about cats"], ["ai", "There once was a cat on a wall, Who barely moved at all..."]]
[["human", "write a short poem about cats"], ["ai", "There once was a cat on a wall, Who barely moved at all..."], ["human", "what's my name?"]]
[["human", "write a short poem about cats"], ["ai", "There once was a cat on a wall, Who barely moved at all..."], ["human", "what's my name?"], ["ai", "I don't know your name - you haven't told me!"]]
[["human", "what's my name?"], ["ai", "I don't know your name - you haven't told me!"]]
```

### 总结消息

如上所示，修剪或删除消息的问题是您可能会因消息队列的剔除而丢失信息。
因此，一些应用程序受益于使用聊天模型总结消息历史记录的更复杂的方法。

<img alt="Summary" />

要汇总代理中的消息历史记录，请使用内置的 [⟦T35⟧](/oss/javascript/langchain/middleware#summarization)：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, summarizationMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();

const agent = createAgent({
  model: "gpt-5.5",
  tools: [],
  middleware: [
    summarizationMiddleware({
      model: "gpt-5.4-mini",
      trigger: { tokens: 4000 },
      keep: { messages: 20 },
    }),
  ],
  checkpointer,
});

const config = { configurable: { thread_id: "1" } };
await agent.invoke({ messages: "hi, my name is bob" }, config);
await agent.invoke({ messages: "write a short poem about cats" }, config);
await agent.invoke({ messages: "now do the same but for dogs" }, config);
const finalResponse = await agent.invoke({ messages: "what's my name?" }, config);

console.log(finalResponse.messages.at(-1)?.content);
// Your name is Bob!
```

更多配置选项请参见[⟦T36⟧](/oss/javascript/langchain/middleware#summarization)。

## 访问内存

您可以通过多种方式访问和修改代理的短期记忆（状态）：

### 工具

#### 在工具中读取短期记忆

使用 `runtime` 参数（键入为 `ToolRuntime`）访问工具中的短期内存（状态）。

`runtime` 参数在工具签名中隐藏（因此模型看不到它），但工具可以通过它访问状态。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, tool, type ToolRuntime } from "langchain";
import { StateSchema } from "@langchain/langgraph";
import * as z from "zod";

const CustomState = new StateSchema({
  userId: z.string(),
});

const getUserInfo = tool(
  async (_, config: ToolRuntime<typeof CustomState.State>) => {
    const userId = config.state.userId;
    return userId === "user_123" ? "John Doe" : "Unknown User";
  },
  {
    name: "get_user_info",
    description: "Get user info",
    schema: z.object({}),
  }
);

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [getUserInfo],
  stateSchema: CustomState,
});

const result = await agent.invoke(
  {
    messages: [{ role: "user", content: "what's my name?" }],
    userId: "user_123",
  },
  {
    context: {},
  }
);

console.log(result.messages.at(-1)?.content);
// Outputs: "Your name is John Doe."
```

#### 从工具中写入短期记忆

要在执行期间修改代理的短期记忆（状态），您可以直接从工具返回状态更新。这对于保留中间结果或使后续工具或提示可以访问信息非常有用。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool, createAgent, ToolMessage, type ToolRuntime } from "langchain";
import { Command, StateSchema } from "@langchain/langgraph";
import * as z from "zod";

const CustomState = new StateSchema({
  userId: z.string().optional(),
  userName: z.string().optional(),
});

const updateUserInfo = tool(
  async (_, config: ToolRuntime<typeof CustomState.State>) => {
    const userId = config.state.userId;
    const name = userId === "user_123" ? "John Smith" : "Unknown user";
    return new Command({
      update: {
        userName: name,
        // update the message history
        messages: [
          new ToolMessage({
            content: "Successfully looked up user information",
            tool_call_id: config.toolCall?.id ?? "",
          }),
        ],
      },
    });
  },
  {
    name: "update_user_info",
    description: "Look up and update user info.",
    schema: z.object({}),
  }
);

const greet = tool(
  async (_, config: ToolRuntime<typeof CustomState.State>) => {
    const userName = config.state.userName;
    return `Hello ${userName}!`;
  },
  {
    name: "greet",
    description: "Use this to greet the user once you found their info.",
    schema: z.object({}),
  }
);

const agent = createAgent({
  model: "openai:gpt-5-mini",
  tools: [updateUserInfo, greet],
  stateSchema: CustomState,
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "greet the user" }],
  userId: "user_123",
});

console.log(result.messages.at(-1)?.content);
// Output: "Hello John Smith! It's great to meet you. How can I help you today?"
```

### 提示

访问中间件中的短期记忆（状态），以根据对话历史记录或自定义状态字段创建动态提示。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { createAgent, tool, dynamicSystemPromptMiddleware } from "langchain";

const contextSchema = z.object({
  userName: z.string(),
});
type ContextSchema = z.infer<typeof contextSchema>;

const getWeather = tool(
  async ({ city }) => {
    return `The weather in ${city} is always sunny!`;
  },
  {
    name: "get_weather",
    description: "Get user info",
    schema: z.object({
      city: z.string(),
    }),
  }
);

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [getWeather],
  contextSchema,
  middleware: [
    dynamicSystemPromptMiddleware<ContextSchema>((_, config) => {
      return `You are a helpful assistant. Address the user as ${config.context?.userName}.`;
    }),
  ],
});

const result = await agent.invoke(
  {
    messages: [{ role: "user", content: "What is the weather in SF?" }],
  },
  {
    context: {
      userName: "John Smith",
    },
  }
);

for (const message of result.messages) {
  console.log(message);
}
/**
 * HumanMessage {
 *   "content": "What is the weather in SF?",
 *   // ...
 * }
 * AIMessage {
 *   // ...
 *   "tool_calls": [
 *     {
 *       "name": "get_weather",
 *       "args": {
 *         "city": "San Francisco"
 *       },
 *       "type": "tool_call",
 *       "id": "call_tCidbv0apTpQpEWb3O2zQ4Yx"
 *     }
 *   ],
 *   // ...
 * }
 * ToolMessage {
 *   "content": "The weather in San Francisco is always sunny!",
 *   "tool_call_id": "call_tCidbv0apTpQpEWb3O2zQ4Yx"
 *   // ...
 * }
 * AIMessage {
 *   "content": "John Smith, here's the latest: The weather in San Francisco is always sunny!\n\nIf you'd like more details (temperature, wind, humidity) or a forecast for the next few days, I can pull that up. What would you like?",
 *   // ...
 * }
 */
```

### 模型之前

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
    init: {
        "fontFamily": "monospace",
        "flowchart": {
        "curve": "basis"
        }
    }
}%%
graph TD
    S(["\_\_start\_\_"])
    PRE(before_model)
    MODEL(model)
    TOOLS(tools)
    END(["\_\_end\_\_"])
    S --> PRE
    PRE --> MODEL
    MODEL -.-> TOOLS
    MODEL -.-> END
    TOOLS --> PRE
    classDef blueHighlight fill:#E5F4FF,stroke:#006DDD,color:#030710;
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68;
    class S blueHighlight;
    class END blueHighlight;
    class PRE,MODEL,TOOLS neutral;
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { RemoveMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware, trimMessages } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { REMOVE_ALL_MESSAGES } from "@langchain/langgraph";

const trimMessageHistory = createMiddleware({
  name: "TrimMessages",
  beforeModel: async (state) => {
    const trimmed = await trimMessages(state.messages, {
      maxTokens: 384,
      strategy: "last",
      startOn: "human",
      endOn: ["human", "tool"],
      tokenCounter: (msgs) => msgs.length,
    });
    return {
      messages: [new RemoveMessage({ id: REMOVE_ALL_MESSAGES }), ...trimmed],
    };
  },
});

const checkpointer = new MemorySaver();
const agent = createAgent({
  model: "gpt-5-nano",
  tools: [],
  middleware: [trimMessageHistory],
  checkpointer,
});
```

### 模型后

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{
    init: {
        "fontFamily": "monospace",
        "flowchart": {
        "curve": "basis"
        }
    }
}%%
graph TD
    S(["\_\_start\_\_"])
    MODEL(model)
    POST(after_model)
    TOOLS(tools)
    END(["\_\_end\_\_"])
    S --> MODEL
    MODEL --> POST
    POST -.-> END
    POST -.-> TOOLS
    TOOLS --> MODEL
    classDef blueHighlight fill:#E5F4FF,stroke:#006DDD,color:#030710;
    classDef greenHighlight fill:#F6FFDB,stroke:#6E8900,color:#2E3900;
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68;
    class S blueHighlight;
    class END blueHighlight;
    class POST greenHighlight;
    class MODEL,TOOLS neutral;
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { RemoveMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";
import { REMOVE_ALL_MESSAGES } from "@langchain/langgraph";

const validateResponse = createMiddleware({
  name: "ValidateResponse",
  afterModel: (state) => {
    const lastMessage = state.messages.at(-1)?.content;
    if (
      typeof lastMessage === "string" &&
      lastMessage.toLowerCase().includes("confidential")
    ) {
      return {
        messages: [
          new RemoveMessage({ id: REMOVE_ALL_MESSAGES }),
        ],
      };
    }
    return;
  },
});

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [],
  middleware: [validateResponse],
});
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/short-term-memory.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>