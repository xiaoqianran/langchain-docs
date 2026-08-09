<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Streaming | https://docs.langchain.com/oss/javascript/deepagents/streaming -->

# 流媒体

从深度代理运行和子代理执行中传输实时更新

<Tip>
  对于新应用程序，我们推荐[event streaming](/oss/javascript/deepagents/event-streaming)——Deep Agents v0.6 中引入的类型化投影 API。事件流为每个投影提供单独的迭代器（子代理、消息、工具调用、值），因此您可以独立使用它们，而不是在 `stream_mode` 块上分支。
</Tip>

Deep Agents 构建在 LangGraph 的流基础设施之上，为子代理流提供一流的支持。当深度代理将工作委托给子代理时，您可以独立地传输来自每个子代理的更新 - 实时跟踪进度、LLM 令牌和工具调用。

深度代理流可以实现什么：

* <Icon icon="diagram-subtask" /> [**Stream subagent progress**](#subagent-progress)—跟踪每个子代理并行运行时的执行情况。
* <Icon icon="square-binary" /> [**Stream LLM tokens**](#llm-tokens)——来自主代理和每个子代理的流令牌。
* <Icon icon="screwdriver-wrench" /> [**Stream tool calls**](#tool-calls) — 查看子代理执行中的工具调用和结果。
* <Icon icon="table" /> [**Stream custom updates**](#custom-updates)—从内部子代理节点发出用户定义的信号。

## 启用子图流

深度代理使用 LangGraph 的子图流来显示子代理执行中的事件。要接收子代理事件，请在流式传输时启用 `stream_subgraphs`。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    systemPrompt: "You are a helpful research assistant",
    subagents: [
      {
        name: "researcher",
        description: "Researches a topic in depth",
        systemPrompt: "You are a thorough researcher.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Research quantum computing advances" },
      ],
    },
    {
      streamMode: "updates",
      subgraphs: true, // [!code highlight]
    },
  )) {
    if (namespace.length > 0) {
      // Subagent event - namespace identifies the source
      console.log(`[subagent: ${namespace.join("|")}]`);
    } else {
      // Main agent event
      console.log("[main agent]");
    }
    console.log(chunk);
  }
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    systemPrompt: "You are a helpful research assistant",
    subagents: [
      {
        name: "researcher",
        description: "Researches a topic in depth",
        systemPrompt: "You are a thorough researcher.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Research quantum computing advances" },
      ],
    },
    {
      streamMode: "updates",
      subgraphs: true, // [!code highlight]
    },
  )) {
    if (namespace.length > 0) {
      // Subagent event - namespace identifies the source
      console.log(`[subagent: ${namespace.join("|")}]`);
    } else {
      // Main agent event
      console.log("[main agent]");
    }
    console.log(chunk);
  }
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    systemPrompt: "You are a helpful research assistant",
    subagents: [
      {
        name: "researcher",
        description: "Researches a topic in depth",
        systemPrompt: "You are a thorough researcher.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Research quantum computing advances" },
      ],
    },
    {
      streamMode: "updates",
      subgraphs: true, // [!code highlight]
    },
  )) {
    if (namespace.length > 0) {
      // Subagent event - namespace identifies the source
      console.log(`[subagent: ${namespace.join("|")}]`);
    } else {
      // Main agent event
      console.log("[main agent]");
    }
    console.log(chunk);
  }
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    systemPrompt: "You are a helpful research assistant",
    subagents: [
      {
        name: "researcher",
        description: "Researches a topic in depth",
        systemPrompt: "You are a thorough researcher.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Research quantum computing advances" },
      ],
    },
    {
      streamMode: "updates",
      subgraphs: true, // [!code highlight]
    },
  )) {
    if (namespace.length > 0) {
      // Subagent event - namespace identifies the source
      console.log(`[subagent: ${namespace.join("|")}]`);
    } else {
      // Main agent event
      console.log("[main agent]");
    }
    console.log(chunk);
  }
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt: "You are a helpful research assistant",
    subagents: [
      {
        name: "researcher",
        description: "Researches a topic in depth",
        systemPrompt: "You are a thorough researcher.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Research quantum computing advances" },
      ],
    },
    {
      streamMode: "updates",
      subgraphs: true, // [!code highlight]
    },
  )) {
    if (namespace.length > 0) {
      // Subagent event - namespace identifies the source
      console.log(`[subagent: ${namespace.join("|")}]`);
    } else {
      // Main agent event
      console.log("[main agent]");
    }
    console.log(chunk);
  }
  ``````ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt: "You are a helpful research assistant",
    subagents: [
      {
        name: "researcher",
        description: "Researches a topic in depth",
        systemPrompt: "You are a thorough researcher.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Research quantum computing advances" },
      ],
    },
    {
      streamMode: "updates",
      subgraphs: true, // [!code highlight]
    },
  )) {
    if (namespace.length > 0) {
      // Subagent event - namespace identifies the source
      console.log(`[subagent: ${namespace.join("|")}]`);
    } else {
      // Main agent event
      console.log("[main agent]");
    }
    console.log(chunk);
  }
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt: "You are a helpful research assistant",
    subagents: [
      {
        name: "researcher",
        description: "Researches a topic in depth",
        systemPrompt: "You are a thorough researcher.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Research quantum computing advances" },
      ],
    },
    {
      streamMode: "updates",
      subgraphs: true, // [!code highlight]
    },
  )) {
    if (namespace.length > 0) {
      // Subagent event - namespace identifies the source
      console.log(`[subagent: ${namespace.join("|")}]`);
    } else {
      // Main agent event
      console.log("[main agent]");
    }
    console.log(chunk);
  }
  ```
</CodeGroup>

## 命名空间

当启用`subgraphs`时，每个流事件都包含一个**命名空间**，用于标识哪个代理生成了它。命名空间是代表代理层次结构的节点名称和任务 ID 的路径。

|命名空间|来源 |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| `()`（空）|主代理|
| `("tools:abc123",)` |由主代理的 `task` 工具调用 `abc123` 生成的子代理 |
| `("tools:abc123", "model_request:def456")` |子代理内的模型请求节点 |

使用命名空间将事件路由到正确的 UI 组件：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for await (const [namespace, chunk] of await agent.stream(
  { messages: [{ role: "user", content: "Plan my vacation" }] },
  { streamMode: "updates", subgraphs: true },
)) {
  // Check if this event came from a subagent
  const isSubagent = namespace.some((segment: string) =>
    segment.startsWith("tools:"),
  );

  if (isSubagent) {
    // Extract the tool call ID from the namespace
    const toolCallId = namespace
      .find((s: string) => s.startsWith("tools:"))
      ?.split(":")[1];
    console.log(`Subagent ${toolCallId}:`, chunk);
  } else {
    console.log("Main agent:", chunk);
  }
}
```

## 子代理进度

使用 `stream_mode="updates"` 跟踪每个步骤完成时的子代理进度。这对于显示哪些子代理处于活动状态以及它们已完成哪些工作非常有用。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    systemPrompt:
      "You are a project coordinator with no research knowledge. " +
      "For every user request, you must call the task() tool with " +
      "subagent_type set to researcher. Never answer research questions yourself. " +
      "Keep your final response to one sentence.",
    subagents: [
      {
        name: "researcher",
        description: "Researches topics thoroughly",
        systemPrompt:
          "You are a thorough researcher. Research the given topic " +
          "and provide a concise summary in 2-3 sentences.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Write a short summary about AI safety" },
      ],
    },
    { streamMode: "updates", subgraphs: true },
  )) {
    // Main agent updates (empty namespace)
    if (namespace.length === 0) {
      for (const [nodeName, data] of Object.entries(chunk)) {
        if (nodeName === "tools") {
          // Subagent results returned to main agent
          for (const msg of (data as any).messages ?? []) {
            if (msg.type === "tool") {
              console.log(`\nSubagent complete: ${msg.name}`);
              console.log(`  Result: ${String(msg.content).slice(0, 200)}...`);
            }
          }
        } else {
          console.log(`[main agent] step: ${nodeName}`);
        }
      }
    }
    // Subagent updates (non-empty namespace)
    else {
      for (const [nodeName] of Object.entries(chunk)) {
        console.log(`  [${namespace[0]}] step: ${nodeName}`);
      }
    }
  }
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    systemPrompt:
      "You are a project coordinator with no research knowledge. " +
      "For every user request, you must call the task() tool with " +
      "subagent_type set to researcher. Never answer research questions yourself. " +
      "Keep your final response to one sentence.",
    subagents: [
      {
        name: "researcher",
        description: "Researches topics thoroughly",
        systemPrompt:
          "You are a thorough researcher. Research the given topic " +
          "and provide a concise summary in 2-3 sentences.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Write a short summary about AI safety" },
      ],
    },
    { streamMode: "updates", subgraphs: true },
  )) {
    // Main agent updates (empty namespace)
    if (namespace.length === 0) {
      for (const [nodeName, data] of Object.entries(chunk)) {
        if (nodeName === "tools") {
          // Subagent results returned to main agent
          for (const msg of (data as any).messages ?? []) {
            if (msg.type === "tool") {
              console.log(`\nSubagent complete: ${msg.name}`);
              console.log(`  Result: ${String(msg.content).slice(0, 200)}...`);
            }
          }
        } else {
          console.log(`[main agent] step: ${nodeName}`);
        }
      }
    }
    // Subagent updates (non-empty namespace)
    else {
      for (const [nodeName] of Object.entries(chunk)) {
        console.log(`  [${namespace[0]}] step: ${nodeName}`);
      }
    }
  }
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    systemPrompt:
      "You are a project coordinator with no research knowledge. " +
      "For every user request, you must call the task() tool with " +
      "subagent_type set to researcher. Never answer research questions yourself. " +
      "Keep your final response to one sentence.",
    subagents: [
      {
        name: "researcher",
        description: "Researches topics thoroughly",
        systemPrompt:
          "You are a thorough researcher. Research the given topic " +
          "and provide a concise summary in 2-3 sentences.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Write a short summary about AI safety" },
      ],
    },
    { streamMode: "updates", subgraphs: true },
  )) {
    // Main agent updates (empty namespace)
    if (namespace.length === 0) {
      for (const [nodeName, data] of Object.entries(chunk)) {
        if (nodeName === "tools") {
          // Subagent results returned to main agent
          for (const msg of (data as any).messages ?? []) {
            if (msg.type === "tool") {
              console.log(`\nSubagent complete: ${msg.name}`);
              console.log(`  Result: ${String(msg.content).slice(0, 200)}...`);
            }
          }
        } else {
          console.log(`[main agent] step: ${nodeName}`);
        }
      }
    }
    // Subagent updates (non-empty namespace)
    else {
      for (const [nodeName] of Object.entries(chunk)) {
        console.log(`  [${namespace[0]}] step: ${nodeName}`);
      }
    }
  }
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    systemPrompt:
      "You are a project coordinator with no research knowledge. " +
      "For every user request, you must call the task() tool with " +
      "subagent_type set to researcher. Never answer research questions yourself. " +
      "Keep your final response to one sentence.",
    subagents: [
      {
        name: "researcher",
        description: "Researches topics thoroughly",
        systemPrompt:
          "You are a thorough researcher. Research the given topic " +
          "and provide a concise summary in 2-3 sentences.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Write a short summary about AI safety" },
      ],
    },
    { streamMode: "updates", subgraphs: true },
  )) {
    // Main agent updates (empty namespace)
    if (namespace.length === 0) {
      for (const [nodeName, data] of Object.entries(chunk)) {
        if (nodeName === "tools") {
          // Subagent results returned to main agent
          for (const msg of (data as any).messages ?? []) {
            if (msg.type === "tool") {
              console.log(`\nSubagent complete: ${msg.name}`);
              console.log(`  Result: ${String(msg.content).slice(0, 200)}...`);
            }
          }
        } else {
          console.log(`[main agent] step: ${nodeName}`);
        }
      }
    }
    // Subagent updates (non-empty namespace)
    else {
      for (const [nodeName] of Object.entries(chunk)) {
        console.log(`  [${namespace[0]}] step: ${nodeName}`);
      }
    }
  }
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt:
      "You are a project coordinator with no research knowledge. " +
      "For every user request, you must call the task() tool with " +
      "subagent_type set to researcher. Never answer research questions yourself. " +
      "Keep your final response to one sentence.",
    subagents: [
      {
        name: "researcher",
        description: "Researches topics thoroughly",
        systemPrompt:
          "You are a thorough researcher. Research the given topic " +
          "and provide a concise summary in 2-3 sentences.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Write a short summary about AI safety" },
      ],
    },
    { streamMode: "updates", subgraphs: true },
  )) {
    // Main agent updates (empty namespace)
    if (namespace.length === 0) {
      for (const [nodeName, data] of Object.entries(chunk)) {
        if (nodeName === "tools") {
          // Subagent results returned to main agent
          for (const msg of (data as any).messages ?? []) {
            if (msg.type === "tool") {
              console.log(`\nSubagent complete: ${msg.name}`);
              console.log(`  Result: ${String(msg.content).slice(0, 200)}...`);
            }
          }
        } else {
          console.log(`[main agent] step: ${nodeName}`);
        }
      }
    }
    // Subagent updates (non-empty namespace)
    else {
      for (const [nodeName] of Object.entries(chunk)) {
        console.log(`  [${namespace[0]}] step: ${nodeName}`);
      }
    }
  }
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt:
      "You are a project coordinator with no research knowledge. " +
      "For every user request, you must call the task() tool with " +
      "subagent_type set to researcher. Never answer research questions yourself. " +
      "Keep your final response to one sentence.",
    subagents: [
      {
        name: "researcher",
        description: "Researches topics thoroughly",
        systemPrompt:
          "You are a thorough researcher. Research the given topic " +
          "and provide a concise summary in 2-3 sentences.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Write a short summary about AI safety" },
      ],
    },
    { streamMode: "updates", subgraphs: true },
  )) {
    // Main agent updates (empty namespace)
    if (namespace.length === 0) {
      for (const [nodeName, data] of Object.entries(chunk)) {
        if (nodeName === "tools") {
          // Subagent results returned to main agent
          for (const msg of (data as any).messages ?? []) {
            if (msg.type === "tool") {
              console.log(`\nSubagent complete: ${msg.name}`);
              console.log(`  Result: ${String(msg.content).slice(0, 200)}...`);
            }
          }
        } else {
          console.log(`[main agent] step: ${nodeName}`);
        }
      }
    }
    // Subagent updates (non-empty namespace)
    else {
      for (const [nodeName] of Object.entries(chunk)) {
        console.log(`  [${namespace[0]}] step: ${nodeName}`);
      }
    }
  }
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt:
      "You are a project coordinator with no research knowledge. " +
      "For every user request, you must call the task() tool with " +
      "subagent_type set to researcher. Never answer research questions yourself. " +
      "Keep your final response to one sentence.",
    subagents: [
      {
        name: "researcher",
        description: "Researches topics thoroughly",
        systemPrompt:
          "You are a thorough researcher. Research the given topic " +
          "and provide a concise summary in 2-3 sentences.",
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        { role: "user", content: "Write a short summary about AI safety" },
      ],
    },
    { streamMode: "updates", subgraphs: true },
  )) {
    // Main agent updates (empty namespace)
    if (namespace.length === 0) {
      for (const [nodeName, data] of Object.entries(chunk)) {
        if (nodeName === "tools") {
          // Subagent results returned to main agent
          for (const msg of (data as any).messages ?? []) {
            if (msg.type === "tool") {
              console.log(`\nSubagent complete: ${msg.name}`);
              console.log(`  Result: ${String(msg.content).slice(0, 200)}...`);
            }
          }
        } else {
          console.log(`[main agent] step: ${nodeName}`);
        }
      }
    }
    // Subagent updates (non-empty namespace)
    else {
      for (const [nodeName] of Object.entries(chunk)) {
        console.log(`  [${namespace[0]}] step: ${nodeName}`);
      }
    }
  }
  ```
</CodeGroup>

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Main agent step: model_request
  [tools:call_abc123] step: model_request
  [tools:call_abc123] step: tools
  [tools:call_abc123] step: model_request
Subagent complete: task
Result: ## AI Safety Report...
Main agent step: model_request
  [tools:call_def456] step: model_request
  [tools:call_def456] step: model_request
Subagent complete: task
Result: # Comprehensive Report on AI Safety...
Main agent step: model_request
```

## LLM 代币使用 `stream_mode="messages"` 从主代理和子代理流式传输各个令牌。每个消息事件都包含标识源代理的元数据。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
let currentSource = "";

for await (const [namespace, chunk] of await agent.stream(
  {
    messages: [
      {
        role: "user",
        content: "Research quantum computing advances",
      },
    ],
  },
  { streamMode: "messages", subgraphs: true },
)) {
  const [message] = chunk;

  // Check if this event came from a subagent (namespace contains "tools:")
  const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));

  if (isSubagent) {
    // Token from a subagent
    const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
    if (subagentNs !== currentSource) {
      process.stdout.write(`\n\n--- [subagent: ${subagentNs}] ---\n`);
      currentSource = subagentNs;
    }
    if (message.text) {
      process.stdout.write(message.text);
    }
  } else {
    // Token from the main agent
    if ("main" !== currentSource) {
      process.stdout.write(`\n\n--- [main agent] ---\n`);
      currentSource = "main";
    }
    if (message.text) {
      process.stdout.write(message.text);
    }
  }
}

process.stdout.write("\n");
```

## 工具调用

当子代理使用工具时，您可以流式传输工具调用事件以显示每个子代理正在执行的操作。工具调用块以`messages`流模式出现。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { AIMessageChunk, ToolMessage } from "langchain";

for await (const [namespace, chunk] of await agent.stream(
  {
    messages: [
      {
        role: "user",
        content: "Research recent quantum computing advances",
      },
    ],
  },
  { streamMode: "messages", subgraphs: true },
)) {
  const [message] = chunk;

  // Identify source: "main" or the subagent namespace segment
  const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
  const source = isSubagent
    ? namespace.find((s: string) => s.startsWith("tools:"))!
    : "main";

  // Tool call chunks (streaming tool invocations)
  if (AIMessageChunk.isInstance(message) && message.tool_call_chunks?.length) {
    for (const tc of message.tool_call_chunks) {
      if (tc.name) {
        console.log(`\n[${source}] Tool call: ${tc.name}`);
      }
      // Args stream in chunks - write them incrementally
      if (tc.args) {
        process.stdout.write(tc.args);
      }
    }
  }

  // Tool results
  if (ToolMessage.isInstance(message)) {
    console.log(
      `\n[${source}] Tool result [${message.name}]: ${message.text?.slice(0, 150)}`,
    );
  }

  // Regular AI content (skip tool call messages)
  if (
    AIMessageChunk.isInstance(message) &&
    message.text &&
    !message.tool_call_chunks?.length
  ) {
    process.stdout.write(message.text);
  }
}

process.stdout.write("\n");
```

## 自定义更新

在子代理工具中使用 `config.writer` 来发出自定义进度事件：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool, type ToolRuntime } from "langchain";
  import { z } from "zod";

  /**
   * A tool that emits custom progress events via config.writer.
   * The writer sends data to the "custom" stream mode.
   */
  const analyzeData = tool(
    async ({ topic }: { topic: string }, config: ToolRuntime) => {
      const writer = config.writer;

      writer?.({ status: "starting", topic, progress: 0 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "analyzing", progress: 50 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "complete", progress: 100 });
      return `Analysis of "${topic}": Customer sentiment is 85% positive, driven by product quality and support response times.`;
    },
    {
      name: "analyze_data",
      description:
        "Run a data analysis on a given topic. " +
        "This tool performs the actual analysis and emits progress updates. " +
        "You MUST call this tool for any analysis request.",
      schema: z.object({
        topic: z.string().describe("The topic or subject to analyze"),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "google-genai:gemini-3.6-flash",
    systemPrompt:
      "You are a coordinator. For any analysis request, you MUST delegate " +
      "to the analyst subagent using the task tool. Never try to answer directly. " +
      "After receiving the result, summarize it in one sentence.",
    subagents: [
      {
        name: "analyst",
        description: "Performs data analysis with real-time progress tracking",
        systemPrompt:
          "You are a data analyst. You MUST call the analyze_data tool " +
          "for every analysis request. Do not use any other tools. " +
          "After the analysis completes, report the result.",
        tools: [analyzeData],
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "Analyze customer satisfaction trends",
        },
      ],
    },
    { streamMode: "custom", subgraphs: true },
  )) {
    const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
    if (isSubagent) {
      const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
      console.log(`[${subagentNs}]`, chunk);
    } else {
      console.log("[main]", chunk);
    }
  }
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool, type ToolRuntime } from "langchain";
  import { z } from "zod";

  /**
   * A tool that emits custom progress events via config.writer.
   * The writer sends data to the "custom" stream mode.
   */
  const analyzeData = tool(
    async ({ topic }: { topic: string }, config: ToolRuntime) => {
      const writer = config.writer;

      writer?.({ status: "starting", topic, progress: 0 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "analyzing", progress: 50 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "complete", progress: 100 });
      return `Analysis of "${topic}": Customer sentiment is 85% positive, driven by product quality and support response times.`;
    },
    {
      name: "analyze_data",
      description:
        "Run a data analysis on a given topic. " +
        "This tool performs the actual analysis and emits progress updates. " +
        "You MUST call this tool for any analysis request.",
      schema: z.object({
        topic: z.string().describe("The topic or subject to analyze"),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "openai:gpt-5.5",
    systemPrompt:
      "You are a coordinator. For any analysis request, you MUST delegate " +
      "to the analyst subagent using the task tool. Never try to answer directly. " +
      "After receiving the result, summarize it in one sentence.",
    subagents: [
      {
        name: "analyst",
        description: "Performs data analysis with real-time progress tracking",
        systemPrompt:
          "You are a data analyst. You MUST call the analyze_data tool " +
          "for every analysis request. Do not use any other tools. " +
          "After the analysis completes, report the result.",
        tools: [analyzeData],
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "Analyze customer satisfaction trends",
        },
      ],
    },
    { streamMode: "custom", subgraphs: true },
  )) {
    const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
    if (isSubagent) {
      const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
      console.log(`[${subagentNs}]`, chunk);
    } else {
      console.log("[main]", chunk);
    }
  }
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool, type ToolRuntime } from "langchain";
  import { z } from "zod";

  /**
   * A tool that emits custom progress events via config.writer.
   * The writer sends data to the "custom" stream mode.
   */
  const analyzeData = tool(
    async ({ topic }: { topic: string }, config: ToolRuntime) => {
      const writer = config.writer;

      writer?.({ status: "starting", topic, progress: 0 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "analyzing", progress: 50 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "complete", progress: 100 });
      return `Analysis of "${topic}": Customer sentiment is 85% positive, driven by product quality and support response times.`;
    },
    {
      name: "analyze_data",
      description:
        "Run a data analysis on a given topic. " +
        "This tool performs the actual analysis and emits progress updates. " +
        "You MUST call this tool for any analysis request.",
      schema: z.object({
        topic: z.string().describe("The topic or subject to analyze"),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "anthropic:claude-sonnet-4-6",
    systemPrompt:
      "You are a coordinator. For any analysis request, you MUST delegate " +
      "to the analyst subagent using the task tool. Never try to answer directly. " +
      "After receiving the result, summarize it in one sentence.",
    subagents: [
      {
        name: "analyst",
        description: "Performs data analysis with real-time progress tracking",
        systemPrompt:
          "You are a data analyst. You MUST call the analyze_data tool " +
          "for every analysis request. Do not use any other tools. " +
          "After the analysis completes, report the result.",
        tools: [analyzeData],
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "Analyze customer satisfaction trends",
        },
      ],
    },
    { streamMode: "custom", subgraphs: true },
  )) {
    const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
    if (isSubagent) {
      const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
      console.log(`[${subagentNs}]`, chunk);
    } else {
      console.log("[main]", chunk);
    }
  }
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool, type ToolRuntime } from "langchain";
  import { z } from "zod";

  /**
   * A tool that emits custom progress events via config.writer.
   * The writer sends data to the "custom" stream mode.
   */
  const analyzeData = tool(
    async ({ topic }: { topic: string }, config: ToolRuntime) => {
      const writer = config.writer;

      writer?.({ status: "starting", topic, progress: 0 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "analyzing", progress: 50 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "complete", progress: 100 });
      return `Analysis of "${topic}": Customer sentiment is 85% positive, driven by product quality and support response times.`;
    },
    {
      name: "analyze_data",
      description:
        "Run a data analysis on a given topic. " +
        "This tool performs the actual analysis and emits progress updates. " +
        "You MUST call this tool for any analysis request.",
      schema: z.object({
        topic: z.string().describe("The topic or subject to analyze"),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    systemPrompt:
      "You are a coordinator. For any analysis request, you MUST delegate " +
      "to the analyst subagent using the task tool. Never try to answer directly. " +
      "After receiving the result, summarize it in one sentence.",
    subagents: [
      {
        name: "analyst",
        description: "Performs data analysis with real-time progress tracking",
        systemPrompt:
          "You are a data analyst. You MUST call the analyze_data tool " +
          "for every analysis request. Do not use any other tools. " +
          "After the analysis completes, report the result.",
        tools: [analyzeData],
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "Analyze customer satisfaction trends",
        },
      ],
    },
    { streamMode: "custom", subgraphs: true },
  )) {
    const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
    if (isSubagent) {
      const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
      console.log(`[${subagentNs}]`, chunk);
    } else {
      console.log("[main]", chunk);
    }
  }
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool, type ToolRuntime } from "langchain";
  import { z } from "zod";

  /**
   * A tool that emits custom progress events via config.writer.
   * The writer sends data to the "custom" stream mode.
   */
  const analyzeData = tool(
    async ({ topic }: { topic: string }, config: ToolRuntime) => {
      const writer = config.writer;

      writer?.({ status: "starting", topic, progress: 0 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "analyzing", progress: 50 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "complete", progress: 100 });
      return `Analysis of "${topic}": Customer sentiment is 85% positive, driven by product quality and support response times.`;
    },
    {
      name: "analyze_data",
      description:
        "Run a data analysis on a given topic. " +
        "This tool performs the actual analysis and emits progress updates. " +
        "You MUST call this tool for any analysis request.",
      schema: z.object({
        topic: z.string().describe("The topic or subject to analyze"),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt:
      "You are a coordinator. For any analysis request, you MUST delegate " +
      "to the analyst subagent using the task tool. Never try to answer directly. " +
      "After receiving the result, summarize it in one sentence.",
    subagents: [
      {
        name: "analyst",
        description: "Performs data analysis with real-time progress tracking",
        systemPrompt:
          "You are a data analyst. You MUST call the analyze_data tool " +
          "for every analysis request. Do not use any other tools. " +
          "After the analysis completes, report the result.",
        tools: [analyzeData],
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "Analyze customer satisfaction trends",
        },
      ],
    },
    { streamMode: "custom", subgraphs: true },
  )) {
    const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
    if (isSubagent) {
      const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
      console.log(`[${subagentNs}]`, chunk);
    } else {
      console.log("[main]", chunk);
    }
  }
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool, type ToolRuntime } from "langchain";
  import { z } from "zod";

  /**
   * A tool that emits custom progress events via config.writer.
   * The writer sends data to the "custom" stream mode.
   */
  const analyzeData = tool(
    async ({ topic }: { topic: string }, config: ToolRuntime) => {
      const writer = config.writer;

      writer?.({ status: "starting", topic, progress: 0 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "analyzing", progress: 50 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "complete", progress: 100 });
      return `Analysis of "${topic}": Customer sentiment is 85% positive, driven by product quality and support response times.`;
    },
    {
      name: "analyze_data",
      description:
        "Run a data analysis on a given topic. " +
        "This tool performs the actual analysis and emits progress updates. " +
        "You MUST call this tool for any analysis request.",
      schema: z.object({
        topic: z.string().describe("The topic or subject to analyze"),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt:
      "You are a coordinator. For any analysis request, you MUST delegate " +
      "to the analyst subagent using the task tool. Never try to answer directly. " +
      "After receiving the result, summarize it in one sentence.",
    subagents: [
      {
        name: "analyst",
        description: "Performs data analysis with real-time progress tracking",
        systemPrompt:
          "You are a data analyst. You MUST call the analyze_data tool " +
          "for every analysis request. Do not use any other tools. " +
          "After the analysis completes, report the result.",
        tools: [analyzeData],
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "Analyze customer satisfaction trends",
        },
      ],
    },
    { streamMode: "custom", subgraphs: true },
  )) {
    const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
    if (isSubagent) {
      const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
      console.log(`[${subagentNs}]`, chunk);
    } else {
      console.log("[main]", chunk);
    }
  }
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createDeepAgent } from "deepagents";
  import { tool, type ToolRuntime } from "langchain";
  import { z } from "zod";

  /**
   * A tool that emits custom progress events via config.writer.
   * The writer sends data to the "custom" stream mode.
   */
  const analyzeData = tool(
    async ({ topic }: { topic: string }, config: ToolRuntime) => {
      const writer = config.writer;

      writer?.({ status: "starting", topic, progress: 0 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "analyzing", progress: 50 });
      await new Promise((r) => setTimeout(r, 500));

      writer?.({ status: "complete", progress: 100 });
      return `Analysis of "${topic}": Customer sentiment is 85% positive, driven by product quality and support response times.`;
    },
    {
      name: "analyze_data",
      description:
        "Run a data analysis on a given topic. " +
        "This tool performs the actual analysis and emits progress updates. " +
        "You MUST call this tool for any analysis request.",
      schema: z.object({
        topic: z.string().describe("The topic or subject to analyze"),
      }),
    },
  );

  const agent = createDeepAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt:
      "You are a coordinator. For any analysis request, you MUST delegate " +
      "to the analyst subagent using the task tool. Never try to answer directly. " +
      "After receiving the result, summarize it in one sentence.",
    subagents: [
      {
        name: "analyst",
        description: "Performs data analysis with real-time progress tracking",
        systemPrompt:
          "You are a data analyst. You MUST call the analyze_data tool " +
          "for every analysis request. Do not use any other tools. " +
          "After the analysis completes, report the result.",
        tools: [analyzeData],
      },
    ],
  });

  for await (const [namespace, chunk] of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: "Analyze customer satisfaction trends",
        },
      ],
    },
    { streamMode: "custom", subgraphs: true },
  )) {
    const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
    if (isSubagent) {
      const subagentNs = namespace.find((s: string) => s.startsWith("tools:"))!;
      console.log(`[${subagentNs}]`, chunk);
    } else {
      console.log("[main]", chunk);
    }
  }
  ```
</CodeGroup>

```shell title="Output" theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[tools:call_abc123] { status: 'fetching', progress: 0 }
[tools:call_abc123] { status: 'analyzing', progress: 50 }
[tools:call_abc123] { status: 'complete', progress: 100 }
```

## 多种流模式

结合多种流模式来全面了解代理执行情况：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// Skip internal middleware steps - only show meaningful node names
const INTERESTING_NODES = new Set(["model", "tools"]);

let lastSource = "";
let midLine = false; // true when we've written tokens without a trailing newline

for await (const [namespace, mode, data] of await agent.stream(
  {
    messages: [
      {
        role: "user",
        content: "Analyze the impact of remote work on team productivity",
      },
    ],
  },
  { streamMode: ["updates", "messages", "custom"], subgraphs: true },
)) {
  const isSubagent = namespace.some((s: string) => s.startsWith("tools:"));
  const source = isSubagent ? "subagent" : "main";

  if (mode === "updates") {
    for (const nodeName of Object.keys(data)) {
      if (!INTERESTING_NODES.has(nodeName)) continue;
      if (midLine) {
        process.stdout.write("\n");
        midLine = false;
      }
      console.log(`[${source}] step: ${nodeName}`);
    }
  } else if (mode === "messages") {
    const [message] = data;
    if (message.text) {
      // Print a header when the source changes
      if (source !== lastSource) {
        if (midLine) {
          process.stdout.write("\n");
          midLine = false;
        }
        process.stdout.write(`\n[${source}] `);
        lastSource = source;
      }
      process.stdout.write(message.text);
      midLine = true;
    }
  } else if (mode === "custom") {
    if (midLine) {
      process.stdout.write("\n");
      midLine = false;
    }
    console.log(`[${source}] custom event:`, data);
  }
}

process.stdout.write("\n");
```

## 常见模式

### 跟踪子代理生命周期

监视子代理何时启动、运行和完成：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
function getToolCalls(message: unknown): Array<{
  id?: string;
  name?: string;
  args?: Record<string, unknown>;
}> {
  if (!message || typeof message !== "object") {
    return [];
  }
  const record = message as Record<string, unknown>;
  const toolCalls = record.tool_calls ?? record.toolCalls;
  return Array.isArray(toolCalls)
    ? (toolCalls as Array<{
        id?: string;
        name?: string;
        args?: Record<string, unknown>;
      }>)
    : [];
}

const activeSubagents = new Map<
  string,
  { type?: string; description?: string; status: string }
>();

for await (const [namespace, chunk] of await agent.stream(
  {
    messages: [
      { role: "user", content: "Research the latest AI safety developments" },
    ],
  },
  { streamMode: "updates", subgraphs: true },
)) {
  for (const [nodeName, data] of Object.entries(chunk)) {
    // ─── Phase 1: Detect subagent starting ────────────────────────
    // When the main agent emits a task tool call, a subagent has been spawned.
    if (namespace.length === 0) {
      for (const msg of (data as { messages?: unknown[] }).messages ?? []) {
        for (const tc of getToolCalls(msg)) {
          if (tc.name === "task" && tc.id) {
            activeSubagents.set(tc.id, {
              type: tc.args?.subagent_type as string | undefined,
              description: String(tc.args?.description ?? "").slice(0, 80),
              status: "pending",
            });
            console.log(
              `[lifecycle] PENDING  → subagent "${tc.args?.subagent_type}" (${tc.id})`,
            );
          }
        }
      }
    }

    // ─── Phase 2: Detect subagent running ─────────────────────────
    // When we receive events from a tools:UUID namespace, that
    // subagent is actively executing.
    if (namespace.length > 0 && namespace[0].startsWith("tools:")) {
      const pregelId = namespace[0].split(":")[1];
      // Check if any pending subagent needs to be marked running.
      // Note: the pregel task ID differs from the tool_call_id,
      // so we mark any pending subagent as running on first subagent event.
      let markedRunning = false;
      for (const [, sub] of activeSubagents) {
        if (sub.status === "pending") {
          sub.status = "running";
          markedRunning = true;
          console.log(
            `[lifecycle] RUNNING  → subagent "${sub.type}" (pregel: ${pregelId})`,
          );
          break;
        }
      }
      if (!markedRunning && activeSubagents.size === 0) {
        activeSubagents.set(pregelId, {
          type: "researcher",
          status: "running",
        });
        console.log(
          `[lifecycle] RUNNING  → subagent "researcher" (pregel: ${pregelId})`,
        );
      }
    }

    // ─── Phase 3: Detect subagent completing ──────────────────────
    // When the main agent's tools node returns a tool message,
    // the subagent has completed and returned its result.
    if (namespace.length === 0 && nodeName === "tools") {
      for (const msg of (data as { messages?: Array<Record<string, unknown>> })
        .messages ?? []) {
        if (msg.type === "tool") {
          const toolCallId = String(msg.tool_call_id ?? msg.toolCallId ?? "");
          const subagent = activeSubagents.get(toolCallId);
          if (subagent) {
            subagent.status = "complete";
            console.log(
              `[lifecycle] COMPLETE → subagent "${subagent.type}" (${toolCallId})`,
            );
            console.log(
              `  Result preview: ${String(msg.content).slice(0, 120)}...`,
            );
          }
        }
      }
    }
  }
}

// Print final state
console.log("\n--- Final subagent states ---");
for (const [id, sub] of activeSubagents) {
  console.log(`  ${sub.type}: ${sub.status}`);
}
```

## 相关

* [Subagents](/oss/javascript/deepagents/subagents)—配置子代理并将其与深度代理一起使用
* [Frontend streaming](/oss/javascript/deepagents/frontend/overview)—使用 [⟦T40⟧](https://reference.langchain.com/javascript/langchain-react/index/useStream) 为深度代理构建 React UI
* [LangChain Event Streaming](/oss/javascript/langchain/event-streaming)—LangChain 代理的一般流媒体概念

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/streaming.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>