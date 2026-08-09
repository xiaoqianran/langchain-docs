<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Runtime | https://docs.langchain.com/oss/javascript/langchain/runtime -->

## 概述

LangChain 的 `createAgent` 在 LangGraph 的运行时上运行。

LangGraph 公开了一个 [⟦T6⟧](https://reference.langchain.com/javascript/langchain/index/Runtime) 对象，其中包含以下信息：

1. **上下文**：静态信息，例如用户 ID、数据库连接或代理调用的其他依赖项
2. **Store**：用于[long-term memory](/oss/javascript/langchain/long-term-memory)的[BaseStore](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore)实例
3. **Stream writer**：用于通过`"custom"`流模式传输信息的对象
4. **执行信息**：当前执行的身份和重试信息（线程ID、运行ID、尝试次数）
5. **服务器信息**：在 LangGraph Server 上运行时特定于服务器的元数据（助手 ID、图形 ID、经过身份验证的用户）

<Tip>
  运行时上下文是您通过代理线程化数据的方式。您可以将值（例如数据库连接、用户会话或配置）附加到上下文，并在工具和中间件内访问它们，而不是将事物存储在全局状态中。这使事物保持无状态、可测试和可重用。
</Tip>

您可以在[tools](#inside-tools)和[middleware](#inside-middleware)中访问运行时信息。

## 访问

使用`createAgent`创建代理时，可以指定一个`contextSchema`来定义存储在代理[⟦T11⟧](https://reference.langchain.com/javascript/langchain/index/Runtime)中的`context`的结构。调用代理时，传递 `context` 参数以及运行的相关配置：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { createAgent } from "langchain";

const contextSchema = z.object({ // [!code highlight]
  userName: z.string(), // [!code highlight]
}); // [!code highlight]

const agent = createAgent({
  model: "gpt-5.5",
  tools: [
    /* ... */
  ],
  contextSchema, // [!code highlight]
});

const result = await agent.invoke(
  { messages: [{ role: "user", content: "What's my name?" }] },
  { context: { userName: "John Smith" } } // [!code highlight]
);
```

### 内部工具

您可以访问工具内部的运行时信息来：

* 访问上下文
* 读取或写入长期记忆
* 写入[custom stream](/oss/javascript/langchain/streaming#custom-updates)（例如，工具进度/更新）

使用 `runtime` 参数访问工具内的 [⟦T14⟧](https://reference.langchain.com/javascript/langchain/index/Runtime) 对象。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { tool } from "langchain";
import { type ToolRuntime } from "@langchain/core/tools"; // [!code highlight]

const contextSchema = z.object({
  userName: z.string(),
});

const fetchUserEmailPreferences = tool(
  async (_, runtime: ToolRuntime<any, typeof contextSchema>) => { // [!code highlight]
    const userName = runtime.context?.userName; // [!code highlight]
    if (!userName) {
      throw new Error("userName is required");
    }

    let preferences = "The user prefers you to write a brief and polite email.";
    if (runtime.store) { // [!code highlight]
      const memory = await runtime.store?.get(["users"], userName); // [!code highlight]
      if (memory) {
        preferences = memory.value.preferences;
      }
    }
    return preferences;
  },
  {
    name: "fetch_user_email_preferences",
    description: "Fetch the user's email preferences.",
    schema: z.object({}),
  }
);
```

### 工具内的执行信息和服务器信息

在 LangGraph Server 上运行时，通过 `runtime.executionInfo` 访问执行身份（线程 ID、运行 ID），并通过 `runtime.serverInfo` 访问服务器特定的元数据（助手 ID、经过身份验证的用户）：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import * as z from "zod";

const contextAwareTool = tool(
  async (_input, runtime) => {
    // Access thread and run IDs
    const info = runtime.executionInfo;
    console.log(`Thread: ${info.threadId}, Run: ${info.runId}`);  // [!code highlight]

    // Access server info (only available on LangGraph Server)
    const server = runtime.serverInfo;
    if (server != null) {
      console.log(`Assistant: ${server.assistantId}`);  // [!code highlight]
      if (server.user != null) {
        console.log(`User: ${server.user.identity}`);  // [!code highlight]
      }
    }

    return "done";
  },
  {
    name: "context_aware_tool",
    description: "A tool that uses execution and server info.",
    schema: z.object({}),
  }
);
```

当不在 LangGraph Server 上运行时（例如，在本地开发期间），`serverInfo` 是 `null`。

<Note>
  `runtime.executionInfo` 和 `runtime.serverInfo` 需要 `deepagents>=1.9.0`（或 `@langchain/langgraph>=1.2.8`）。
</Note>

### 内部中间件

您可以访问中间件中的运行时信息，以创建动态提示、修改消息或根据用户上下文控制代理行为。

使用 `runtime` 参数访问中间件内的 [⟦T24⟧](https://reference.langchain.com/javascript/langchain/index/Runtime) 对象。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { createAgent, createMiddleware, SystemMessage } from "langchain";

const contextSchema = z.object({
  userName: z.string(),
});

// Dynamic prompt middleware
const dynamicPromptMiddleware = createMiddleware({
  name: "DynamicPrompt",
  contextSchema,
  beforeModel: (state, runtime) => { // [!code highlight]
    const userName = runtime.context?.userName; // [!code highlight]
    if (!userName) {
      throw new Error("userName is required");
    }

    const systemMsg = `You are a helpful assistant. Address the user as ${userName}.`;
    return {
      messages: [new SystemMessage(systemMsg), ...state.messages],
    };
  },
});

// Logging middleware
const loggingMiddleware = createMiddleware({
  name: "Logging",
  contextSchema,
  beforeModel: (state, runtime) => {  // [!code highlight]
    console.log(`Processing request for user: ${runtime.context?.userName}`);  // [!code highlight]
    return;
  },
  afterModel: (state, runtime) => {  // [!code highlight]
    console.log(`Completed request for user: ${runtime.context?.userName}`);  // [!code highlight]
    return;
  },
});

const agent = createAgent({
  model: "gpt-5.5",
  tools: [
    /* ... */
  ],
  middleware: [dynamicPromptMiddleware, loggingMiddleware],  // [!code highlight]
  contextSchema,
});

const result = await agent.invoke(
  { messages: [{ role: "user", content: "What's my name?" }] },
  { context: { userName: "John Smith" } }
);

```

### 中间件内的执行信息和服务器信息

中间件钩子还可以访问`runtime.executionInfo`和`runtime.serverInfo`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";

const authGate = createMiddleware({
  name: "AuthGate",
  beforeModel: (state, runtime) => {
    const server = runtime.serverInfo;
    if (server != null && server.user == null) {  // [!code highlight]
      throw new Error("Authentication required");
    }
    console.log(`Thread: ${runtime.executionInfo.threadId}`);  // [!code highlight]
    return;
  },
});
```

<Note>
  需要`deepagents>=1.9.0`（或`@langchain/langgraph>=1.2.8`）。
</Note>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/runtime.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>