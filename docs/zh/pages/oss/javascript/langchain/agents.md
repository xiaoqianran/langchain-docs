<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Agents | https://docs.langchain.com/oss/javascript/langchain/agents -->

# 代理

代理是一个循环调用工具的模型，直到给定的任务完成。

<img alt="Core agent loop diagram" />

线束是围绕该循环的一切：提示、工具以及塑造模型行为的任何中间件。

<Note>
  **特工=模特+线束**

  线束的工作：为给定任务在正确的时间为模型提供正确的上下文。
</Note>

[⟦T109⟧](https://reference.langchain.com/javascript/langchain/index/createAgent) 是一款高度可配置的安全带。最简单的是，您可以使用以下命令创建一个：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "google-genai:gemini-3.6-flash", tools });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "openai:gpt-5.5", tools });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "anthropic:claude-sonnet-4-6", tools });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "openrouter:openrouter:z-ai/glm-5.2", tools });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "fireworks:accounts/fireworks/models/glm-5p2", tools });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "baseten:zai-org/GLM-5.2", tools });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "ollama:north-mini-code-1.0", tools });
  ```
</CodeGroup>

在此基础上，您可以直接使用 `model=`、`tools=` 和 `system_prompt=` 参数配置基础知识。如需更高级的功能，请使用 [middleware](#configure-the-harness) 延长线束。

<Tip>
  [Deep Agents](/oss/javascript/deepagents/overview) 构建于 `create_agent` 之上，并附带已组装的常用功能，例如规划、文件系统工具、子代理和内存。当您需要自己配置线束时，请使用`create_agent`。
</Tip>

## 核心组件

<img alt="Agent model and harness components diagram" />

### 型号

传递模型标识符字符串 (`"provider:model"`) 或初始化的模型实例来为您的代理选择模型。有关参数、提供程序设置和动态模型选择，请参阅[Models](/oss/javascript/langchain/models)。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "google-genai:gemini-3.6-flash", tools });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "openai:gpt-5.5", tools });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "anthropic:claude-sonnet-4-6", tools });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "openrouter:openrouter:z-ai/glm-5.2", tools });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "fireworks:accounts/fireworks/models/glm-5p2", tools });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "baseten:zai-org/GLM-5.2", tools });
  ``````ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";

  var agent = createAgent({ model: "ollama:north-mini-code-1.0", tools });
  ```
</CodeGroup>

### 工具

要为代理提供工具，请传递任何 Python 可调用工具、LangChain 工具或工具字典。有关工具定义、上下文访问和动态工具选择，请参阅[Tools](/oss/javascript/langchain/tools)。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Results for: ${query}`, {
    name: "search",
    description: "Search for information",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({ model: "google-genai:gemini-3.6-flash", tools: [search] });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Results for: ${query}`, {
    name: "search",
    description: "Search for information",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({ model: "openai:gpt-5.5", tools: [search] });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Results for: ${query}`, {
    name: "search",
    description: "Search for information",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({ model: "anthropic:claude-sonnet-4-6", tools: [search] });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Results for: ${query}`, {
    name: "search",
    description: "Search for information",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({ model: "openrouter:openrouter:z-ai/glm-5.2", tools: [search] });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Results for: ${query}`, {
    name: "search",
    description: "Search for information",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({ model: "fireworks:accounts/fireworks/models/glm-5p2", tools: [search] });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Results for: ${query}`, {
    name: "search",
    description: "Search for information",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({ model: "baseten:zai-org/GLM-5.2", tools: [search] });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Results for: ${query}`, {
    name: "search",
    description: "Search for information",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({ model: "ollama:north-mini-code-1.0", tools: [search] });
  ```
</CodeGroup>

###系统提示

塑造代理处理任务的方式。系统提示参数接受字符串或`SystemMessage`。对于运行时的动态提示，请使用[middleware](/oss/javascript/langchain/middleware)。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools,
    systemPrompt: "You are a helpful assistant. Be concise and accurate.",
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools,
    systemPrompt: "You are a helpful assistant. Be concise and accurate.",
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools,
    systemPrompt: "You are a helpful assistant. Be concise and accurate.",
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools,
    systemPrompt: "You are a helpful assistant. Be concise and accurate.",
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools,
    systemPrompt: "You are a helpful assistant. Be concise and accurate.",
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools,
    systemPrompt: "You are a helpful assistant. Be concise and accurate.",
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools,
    systemPrompt: "You are a helpful assistant. Be concise and accurate.",
  });
  ```
</CodeGroup>

### 结构化输出

使用 `response_format=` 从代理返回经过验证的架构。有关策略和示例，请参阅[Structured output](/oss/javascript/langchain/structured-output)。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const Answer = z.object({ summary: z.string(), confidence: z.number() });

  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools,
    responseFormat: Answer,
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Summarize AI trends" }],
  });
  result.structuredResponse; // { summary: ..., confidence: ... }
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const Answer = z.object({ summary: z.string(), confidence: z.number() });

  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools,
    responseFormat: Answer,
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Summarize AI trends" }],
  });
  result.structuredResponse; // { summary: ..., confidence: ... }
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const Answer = z.object({ summary: z.string(), confidence: z.number() });

  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools,
    responseFormat: Answer,
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Summarize AI trends" }],
  });
  result.structuredResponse; // { summary: ..., confidence: ... }
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const Answer = z.object({ summary: z.string(), confidence: z.number() });

  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools,
    responseFormat: Answer,
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Summarize AI trends" }],
  });
  result.structuredResponse; // { summary: ..., confidence: ... }
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const Answer = z.object({ summary: z.string(), confidence: z.number() });

  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools,
    responseFormat: Answer,
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Summarize AI trends" }],
  });
  result.structuredResponse; // { summary: ..., confidence: ... }
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const Answer = z.object({ summary: z.string(), confidence: z.number() });

  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools,
    responseFormat: Answer,
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Summarize AI trends" }],
  });
  result.structuredResponse; // { summary: ..., confidence: ... }
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const Answer = z.object({ summary: z.string(), confidence: z.number() });

  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools,
    responseFormat: Answer,
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Summarize AI trends" }],
  });
  result.structuredResponse; // { summary: ..., confidence: ... }
  ```
</CodeGroup>

### 代理状态

每个代理都通过一个 `AgentState` 对象来管理其执行上下文，该对象保存当前对话历史记录以及您的工具和中间件所需的任何自定义字段。

内置字段是：|领域 |类型 |描述 |
| ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `messages` | `BaseMessage[]` |当前线程的完整对话历史记录。仅追加：添加新消息，从不替换。 |

`AgentState` 也是传递给每个节点样式中间件挂钩的类型（`beforeModel`、`afterModel` 等）。钩子接收当前状态并可以返回更新对象以合并回其中。

要添加自定义字段，请使用 `stateSchema` 和 `StateSchema` 或 Zod 对象在中间件上定义状态模式：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";
  import { StateSchema } from "@langchain/langgraph";
  import * as z from "zod";

  const MyState = new StateSchema({
    userId: z.string(),
    callCount: z.number().default(0),
  });

  const stateMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: MyState, // [!code highlight]
  });

  const agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [],
    middleware: [stateMiddleware],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";
  import { StateSchema } from "@langchain/langgraph";
  import * as z from "zod";

  const MyState = new StateSchema({
    userId: z.string(),
    callCount: z.number().default(0),
  });

  const stateMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: MyState, // [!code highlight]
  });

  const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [],
    middleware: [stateMiddleware],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";
  import { StateSchema } from "@langchain/langgraph";
  import * as z from "zod";

  const MyState = new StateSchema({
    userId: z.string(),
    callCount: z.number().default(0),
  });

  const stateMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: MyState, // [!code highlight]
  });

  const agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [],
    middleware: [stateMiddleware],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";
  import { StateSchema } from "@langchain/langgraph";
  import * as z from "zod";

  const MyState = new StateSchema({
    userId: z.string(),
    callCount: z.number().default(0),
  });

  const stateMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: MyState, // [!code highlight]
  });

  const agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [],
    middleware: [stateMiddleware],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";
  import { StateSchema } from "@langchain/langgraph";
  import * as z from "zod";

  const MyState = new StateSchema({
    userId: z.string(),
    callCount: z.number().default(0),
  });

  const stateMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: MyState, // [!code highlight]
  });

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [],
    middleware: [stateMiddleware],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";
  import { StateSchema } from "@langchain/langgraph";
  import * as z from "zod";

  const MyState = new StateSchema({
    userId: z.string(),
    callCount: z.number().default(0),
  });

  const stateMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: MyState, // [!code highlight]
  });

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [],
    middleware: [stateMiddleware],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, createMiddleware } from "langchain";
  import { StateSchema } from "@langchain/langgraph";
  import * as z from "zod";

  const MyState = new StateSchema({
    userId: z.string(),
    callCount: z.number().default(0),
  });

  const stateMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: MyState, // [!code highlight]
  });

  const agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [],
    middleware: [stateMiddleware],
  });
  ```
</CodeGroup>

有关完整的详细信息、示例和中间件级状态模式，请参阅[Short-term memory](/oss/javascript/langchain/short-term-memory#customizing-agent-memory)和[Custom middleware](/oss/javascript/langchain/middleware/custom#state-updates)。

## 调用

<Tip>
  跟踪此循环的每个步骤，调试工具调用，并使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-agents) 评估代理输出。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监控您的痕迹、检测问题并提出修复建议。
</Tip>您可以使用消息调用代理。在幕后将更新传递给代理的[⟦T126⟧](/oss/javascript/langgraph/graph-api#state)。所有代理在其所在州都包含[sequence of messages](/oss/javascript/langgraph/use-graph-api#messagesvalue)；要调用代理，请传递一条新消息以及 `thread_id`，以便代理可以保留并恢复对话历史记录：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  let result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    config,
  );

  // A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = await agent.invoke(
    { messages: [{ role: "user", content: "What about tomorrow?" }] },
    config,
  );
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  let result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    config,
  );

  // A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = await agent.invoke(
    { messages: [{ role: "user", content: "What about tomorrow?" }] },
    config,
  );
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  let result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    config,
  );

  // A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = await agent.invoke(
    { messages: [{ role: "user", content: "What about tomorrow?" }] },
    config,
  );
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  let result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    config,
  );

  // A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = await agent.invoke(
    { messages: [{ role: "user", content: "What about tomorrow?" }] },
    config,
  );
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  let result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    config,
  );

  // A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = await agent.invoke(
    { messages: [{ role: "user", content: "What about tomorrow?" }] },
    config,
  );
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  let result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    config,
  );

  // A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = await agent.invoke(
    { messages: [{ role: "user", content: "What about tomorrow?" }] },
    config,
  );
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [],
    checkpointer: new MemorySaver(),
  });

  const config = { configurable: { thread_id: crypto.randomUUID() } };

  let result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    config,
  );

  // A follow-up turn on the same conversation: reuse the same thread_id to keep history
  result = await agent.invoke(
    { messages: [{ role: "user", content: "What about tomorrow?" }] },
    config,
  );
  ```
</CodeGroup>

<Note>
  使用 `thread_id` 保留对话历史记录需要使用 [checkpointer](/oss/javascript/langchain/long-term-memory) 配置代理。当部署在[LangSmith](/langsmith/deployment)上时，会自动配置检查点。在本地，显式传递一个，例如 `create_agent(..., checkpointer=InMemorySaver())`。
</Note>

如果您还需要将每次运行的配置（例如用户 ID、API 密钥或功能标志）传递给工具和中间件，请将其作为 `context` 与配置一起传递。使用 `contextSchema` 定义该数据的形状并通过 `runtime.context` 访问它：

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const contextSchema = z.object({
    user_id: z.string(),
  });

  const agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [],
    contextSchema,
    checkpointer: new MemorySaver(),
  });

  const result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_id: "user-123" },
    },
  );
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const contextSchema = z.object({
    user_id: z.string(),
  });

  const agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [],
    contextSchema,
    checkpointer: new MemorySaver(),
  });

  const result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_id: "user-123" },
    },
  );
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const contextSchema = z.object({
    user_id: z.string(),
  });

  const agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [],
    contextSchema,
    checkpointer: new MemorySaver(),
  });

  const result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_id: "user-123" },
    },
  );
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const contextSchema = z.object({
    user_id: z.string(),
  });

  const agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [],
    contextSchema,
    checkpointer: new MemorySaver(),
  });

  const result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_id: "user-123" },
    },
  );
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const contextSchema = z.object({
    user_id: z.string(),
  });

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [],
    contextSchema,
    checkpointer: new MemorySaver(),
  });

  const result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_id: "user-123" },
    },
  );
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const contextSchema = z.object({
    user_id: z.string(),
  });

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [],
    contextSchema,
    checkpointer: new MemorySaver(),
  });

  const result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_id: "user-123" },
    },
  );
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import * as z from "zod";
  import { AIMessage } from "@langchain/core/messages";
  import { createAgent } from "langchain";
  import { MemorySaver } from "@langchain/langgraph";

  const contextSchema = z.object({
    user_id: z.string(),
  });

  const agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [],
    contextSchema,
    checkpointer: new MemorySaver(),
  });

  const result = await agent.invoke(
    {
      messages: [
        { role: "user", content: "What's the weather in San Francisco?" },
      ],
    },
    {
      configurable: { thread_id: crypto.randomUUID() },
      context: { user_id: "user-123" },
    },
  );
  ```
</CodeGroup>

`thread_id` 限定*对话*（消息历史记录、检查点），而 `context` 则携带您的工具和中间件在调用时读取的*每次运行*数据。两者通常一起传递。有关更多信息，请参阅 [tool context](/oss/javascript/langchain/tools#context) 和 [Runtime](/oss/javascript/langchain/runtime)。

## 流媒体`invoke` 返回运行结束时的最终响应。如果代理执行多个工具调用，用户通常需要在完成之前更新进度。使用流式传输来显示发生的中间消息和工具活动。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const stream = await agent.streamEvents(
  {
    messages: [
      {
        role: "user",
        content: "Search for AI news and summarize the findings",
      },
    ],
  },
  { version: "v3" },
);

for await (const snapshot of stream.values) {
  // Each snapshot contains the full state at that point
  const latestMessage = snapshot.messages.at(-1);
  if (latestMessage?.content) {
    if (latestMessage.type === "human") {
      console.log(`User: ${latestMessage.content}`);
    } else if (latestMessage.type === "ai") {
      console.log(`Agent: ${latestMessage.content}`);
    }
  } else if (latestMessage?.tool_calls?.length) {
    const toolCallNames = latestMessage.tool_calls.map((tc) => tc.name);
    console.log(`Calling tools: ${toolCallNames.join(", ")}`);
  }
}
```

<Tip>
  有关流模式、事件类型和 UI 模式，请参阅[Streaming](/oss/javascript/langchain/streaming)。
</Tip>

## 配置线束

`create_agent` 具有高度可扩展性。中间件是定制的基础：每个部分处理一个问题，在适当的时刻挂接到代理循环中，并与任何其他部分自由组合。准确获取您的用例所需的内容并跳过其余部分。

通用模式被预先构建为一流的中间件。您可以构建任何其他东西作为[custom middleware](/oss/javascript/langchain/middleware/custom)。

<img alt="Agent harness capabilities by category" />

当代理承担复杂的工作时，他们需要几个关键领域的支持。中间件生态系统提供：

<CardGroup>
  <Card title="Execution environment" icon="bolt" href="#execution-environment">
    工具、文件系统、沙箱和代码执行
  </Card>

  <Card title="Context management" icon="database" href="#context-management">
    总结、记忆、技巧、提示缓存
  </Card>

  <Card title="Planning and delegation" icon="sitemap" href="#planning-and-delegation">
    用于并行、隔离工作的待办事项列表和子代理
  </Card>

  <Card title="Fault tolerance" icon="shield" href="#fault-tolerance">
    重试、回退和调用限制
  </Card>

  <Card title="Guardrails" icon="lock" href="#guardrails">
    PII 检测和内容控制
  </Card><Card title="Steering" icon="user" href="#steering">
    在采取高影响力行动之前进行人机交互批准
  </Card>
</CardGroup>

<Tip>
  `create_deep_agent` 为长时间运行的编码和研究任务预先组装该堆栈（默认情况下包括文件系统、摘要、子代理和提示缓存）。请参阅 [Deep Agents](/oss/javascript/deepagents/harness) 了解完整的预制线束。
</Tip>

### 执行环境

当代理可以采取行动而不仅仅是生成文本时，它们特别有用。执行环境为代理提供了一个工作空间：它可以调用的工具、用于跨轮读写文件的文件系统以及用于运行脚本或 shell 命令的代码执行。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { createFilesystemMiddleware, StateBackend } from "deepagents";

  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [search],
    middleware: [createFilesystemMiddleware({ backend: new StateBackend() })],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { createFilesystemMiddleware, StateBackend } from "deepagents";

  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [search],
    middleware: [createFilesystemMiddleware({ backend: new StateBackend() })],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { createFilesystemMiddleware, StateBackend } from "deepagents";

  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [search],
    middleware: [createFilesystemMiddleware({ backend: new StateBackend() })],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { createFilesystemMiddleware, StateBackend } from "deepagents";

  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [search],
    middleware: [createFilesystemMiddleware({ backend: new StateBackend() })],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { createFilesystemMiddleware, StateBackend } from "deepagents";

  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [search],
    middleware: [createFilesystemMiddleware({ backend: new StateBackend() })],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { createFilesystemMiddleware, StateBackend } from "deepagents";

  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [search],
    middleware: [createFilesystemMiddleware({ backend: new StateBackend() })],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent } from "langchain";
  import { createFilesystemMiddleware, StateBackend } from "deepagents";

  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [search],
    middleware: [createFilesystemMiddleware({ backend: new StateBackend() })],
  });
  ```
</CodeGroup>

参见[⟦T138⟧](https://reference.langchain.com/javascript/deepagents/middleware/createFilesystemMiddleware)、[Sandboxes](/oss/javascript/deepagents/sandboxes)、[Interpreters](/oss/javascript/deepagents/interpreters)。

<Note>
  此示例从 `deepagents` 包导入。安装它：

  <CodeGroup>
    ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install deepagents
    ```

    ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    yarn add deepagents
    ```

    ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm add deepagents
    ```
  </CodeGroup>
</Note>

### 上下文管理每个模型调用都有一个固定的上下文窗口。当代理运行时，该窗口会填充累积的历史记录、工具结果和中间步骤。汇总会在溢出发生之前压缩历史记录；内存在启动时加载持久指令，以便知识跨会话传递；技能按需呈现领域知识，而不是预先加载所有内容。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";
import {
  StateBackend,
  createFilesystemMiddleware,
  createSkillsMiddleware,
  createSummarizationMiddleware,
} from "deepagents";

var backend = new StateBackend();
const model = "anthropic:claude-sonnet-4-6";

var agent = createAgent({
  model,
  tools: [search],
  middleware: [
    createFilesystemMiddleware({ backend }),
    createSummarizationMiddleware({ model, backend }),
    createSkillsMiddleware({ backend, sources: ["./skills/"] }),
  ],
});
```

参见[⟦T140⟧](https://reference.langchain.com/javascript/langchain/index/summarizationMiddleware)、[⟦T141⟧](https://reference.langchain.com/javascript/deepagents/middleware/createMemoryMiddleware)、[Skills](/oss/javascript/langchain/multi-agent/skills)、[Context engineering](/oss/javascript/deepagents/context-engineering)。

<Note>
  此示例从 `deepagents` 包导入。安装它：

  <CodeGroup>
    ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install deepagents
    ```

    ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    yarn add deepagents
    ```

    ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm add deepagents
    ```
  </CodeGroup>
</Note>

### 规划和授权

复杂的任务通常超出一个上下文窗口的处理能力。委派让主代理将工作分解成多个部分，将它们交给每个子代理，每个子代理都在自己的隔离上下文中运行，并专注于协调而不是执行。工作可以并行运行；主要代理的上下文保持干净。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, todoListMiddleware, tool } from "langchain";
  import {
    createFilesystemMiddleware,
    createSubAgentMiddleware,
    StateBackend,
  } from "deepagents";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var backend = new StateBackend();

  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [search],
    middleware: [
      createFilesystemMiddleware({ backend }),
      todoListMiddleware(),
      createSubAgentMiddleware({
        defaultModel: "anthropic:claude-sonnet-4-6",
        defaultTools: [],
        subagents: [
          {
            name: "researcher",
            description: "Searches and returns a structured summary.",
            systemPrompt:
              "Use the search tool to research the question and summarize key points.",
            tools: [search],
            model: "anthropic:claude-sonnet-4-6",
            middleware: [],
          },
        ],
      }),
    ],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, todoListMiddleware, tool } from "langchain";
  import {
    createFilesystemMiddleware,
    createSubAgentMiddleware,
    StateBackend,
  } from "deepagents";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var backend = new StateBackend();

  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [search],
    middleware: [
      createFilesystemMiddleware({ backend }),
      todoListMiddleware(),
      createSubAgentMiddleware({
        defaultModel: "anthropic:claude-sonnet-4-6",
        defaultTools: [],
        subagents: [
          {
            name: "researcher",
            description: "Searches and returns a structured summary.",
            systemPrompt:
              "Use the search tool to research the question and summarize key points.",
            tools: [search],
            model: "anthropic:claude-sonnet-4-6",
            middleware: [],
          },
        ],
      }),
    ],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, todoListMiddleware, tool } from "langchain";
  import {
    createFilesystemMiddleware,
    createSubAgentMiddleware,
    StateBackend,
  } from "deepagents";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var backend = new StateBackend();

  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [search],
    middleware: [
      createFilesystemMiddleware({ backend }),
      todoListMiddleware(),
      createSubAgentMiddleware({
        defaultModel: "anthropic:claude-sonnet-4-6",
        defaultTools: [],
        subagents: [
          {
            name: "researcher",
            description: "Searches and returns a structured summary.",
            systemPrompt:
              "Use the search tool to research the question and summarize key points.",
            tools: [search],
            model: "anthropic:claude-sonnet-4-6",
            middleware: [],
          },
        ],
      }),
    ],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, todoListMiddleware, tool } from "langchain";
  import {
    createFilesystemMiddleware,
    createSubAgentMiddleware,
    StateBackend,
  } from "deepagents";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var backend = new StateBackend();

  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [search],
    middleware: [
      createFilesystemMiddleware({ backend }),
      todoListMiddleware(),
      createSubAgentMiddleware({
        defaultModel: "anthropic:claude-sonnet-4-6",
        defaultTools: [],
        subagents: [
          {
            name: "researcher",
            description: "Searches and returns a structured summary.",
            systemPrompt:
              "Use the search tool to research the question and summarize key points.",
            tools: [search],
            model: "anthropic:claude-sonnet-4-6",
            middleware: [],
          },
        ],
      }),
    ],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, todoListMiddleware, tool } from "langchain";
  import {
    createFilesystemMiddleware,
    createSubAgentMiddleware,
    StateBackend,
  } from "deepagents";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var backend = new StateBackend();

  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [search],
    middleware: [
      createFilesystemMiddleware({ backend }),
      todoListMiddleware(),
      createSubAgentMiddleware({
        defaultModel: "anthropic:claude-sonnet-4-6",
        defaultTools: [],
        subagents: [
          {
            name: "researcher",
            description: "Searches and returns a structured summary.",
            systemPrompt:
              "Use the search tool to research the question and summarize key points.",
            tools: [search],
            model: "anthropic:claude-sonnet-4-6",
            middleware: [],
          },
        ],
      }),
    ],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, todoListMiddleware, tool } from "langchain";
  import {
    createFilesystemMiddleware,
    createSubAgentMiddleware,
    StateBackend,
  } from "deepagents";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var backend = new StateBackend();

  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [search],
    middleware: [
      createFilesystemMiddleware({ backend }),
      todoListMiddleware(),
      createSubAgentMiddleware({
        defaultModel: "anthropic:claude-sonnet-4-6",
        defaultTools: [],
        subagents: [
          {
            name: "researcher",
            description: "Searches and returns a structured summary.",
            systemPrompt:
              "Use the search tool to research the question and summarize key points.",
            tools: [search],
            model: "anthropic:claude-sonnet-4-6",
            middleware: [],
          },
        ],
      }),
    ],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, todoListMiddleware, tool } from "langchain";
  import {
    createFilesystemMiddleware,
    createSubAgentMiddleware,
    StateBackend,
  } from "deepagents";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var backend = new StateBackend();

  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [search],
    middleware: [
      createFilesystemMiddleware({ backend }),
      todoListMiddleware(),
      createSubAgentMiddleware({
        defaultModel: "anthropic:claude-sonnet-4-6",
        defaultTools: [],
        subagents: [
          {
            name: "researcher",
            description: "Searches and returns a structured summary.",
            systemPrompt:
              "Use the search tool to research the question and summarize key points.",
            tools: [search],
            model: "anthropic:claude-sonnet-4-6",
            middleware: [],
          },
        ],
      }),
    ],
  });
  ```
</CodeGroup>

参见[Subagents](/oss/javascript/langchain/multi-agent/subagents)。

<Note>
  此示例从 `deepagents` 包导入。安装它：

  <CodeGroup>
    ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install deepagents
    ```

    ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    yarn add deepagents
    ```

    ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm add deepagents
    ```
  </CodeGroup>
</Note>

### 命名您的代理人可以选择使用代理的标识符。当将代理作为子图嵌入到 [multi-agent](/oss/javascript/langchain/multi-agent) 系统中时，这特别有用。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools,
    name: "research_assistant",
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools,
    name: "research_assistant",
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools,
    name: "research_assistant",
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools,
    name: "research_assistant",
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools,
    name: "research_assistant",
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools,
    name: "research_assistant",
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools,
    name: "research_assistant",
  });
  ```
</CodeGroup>

### 容错

生产中的代理会遇到开发中很少出现的故障：速率限制、模型超时、瞬时 API 错误。容错中间件在基础设施级别处理这些问题，因此您的工具和业务逻辑不需要在每次调用时进行 try/catch。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    modelRetryMiddleware,
    tool,
    toolRetryMiddleware,
  } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [search],
    middleware: [
      modelRetryMiddleware({ maxRetries: 3 }),
      toolRetryMiddleware({ maxRetries: 2 }),
    ],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    modelRetryMiddleware,
    tool,
    toolRetryMiddleware,
  } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [search],
    middleware: [
      modelRetryMiddleware({ maxRetries: 3 }),
      toolRetryMiddleware({ maxRetries: 2 }),
    ],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    modelRetryMiddleware,
    tool,
    toolRetryMiddleware,
  } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [search],
    middleware: [
      modelRetryMiddleware({ maxRetries: 3 }),
      toolRetryMiddleware({ maxRetries: 2 }),
    ],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    modelRetryMiddleware,
    tool,
    toolRetryMiddleware,
  } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [search],
    middleware: [
      modelRetryMiddleware({ maxRetries: 3 }),
      toolRetryMiddleware({ maxRetries: 2 }),
    ],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    modelRetryMiddleware,
    tool,
    toolRetryMiddleware,
  } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [search],
    middleware: [
      modelRetryMiddleware({ maxRetries: 3 }),
      toolRetryMiddleware({ maxRetries: 2 }),
    ],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    modelRetryMiddleware,
    tool,
    toolRetryMiddleware,
  } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [search],
    middleware: [
      modelRetryMiddleware({ maxRetries: 3 }),
      toolRetryMiddleware({ maxRetries: 2 }),
    ],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import {
    createAgent,
    modelRetryMiddleware,
    tool,
    toolRetryMiddleware,
  } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [search],
    middleware: [
      modelRetryMiddleware({ maxRetries: 3 }),
      toolRetryMiddleware({ maxRetries: 2 }),
    ],
  });
  ```
</CodeGroup>

参见[⟦T144⟧](https://reference.langchain.com/javascript/langchain/index/modelRetryMiddleware)、[⟦T145⟧](https://reference.langchain.com/javascript/langchain/index/toolRetryMiddleware)、[Prebuilt middleware](/oss/javascript/langchain/middleware/built-in)。

### 护栏

有些策略不能立即生效——无论模型做什么，它们都需要确定性地执行。 Guardrails 在数据流经代理循环时拦截数据，在工具结果到达模型上下文之前应用合规性规则或内容策略。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, piiMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [search],
    middleware: [piiMiddleware("email")],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, piiMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [search],
    middleware: [piiMiddleware("email")],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, piiMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [search],
    middleware: [piiMiddleware("email")],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, piiMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [search],
    middleware: [piiMiddleware("email")],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, piiMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [search],
    middleware: [piiMiddleware("email")],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, piiMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [search],
    middleware: [piiMiddleware("email")],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, piiMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [search],
    middleware: [piiMiddleware("email")],
  });
  ```
</CodeGroup>

参见[⟦T146⟧](https://reference.langchain.com/javascript/langchain/index/piiMiddleware)、[Prebuilt middleware](/oss/javascript/langchain/middleware/built-in)。

### 转向完全自治并不总是合适的。引导可以让您将人员置于特定的决策点 - 在破坏性写入、昂贵的 API 调用或任何需要判断的事情之前 - 无需重组您的代理。代理暂停并等待；人类批准、编辑或拒绝；执行仍在继续。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    tools: [search],
    middleware: [humanInTheLoopMiddleware({ interruptOn: { writeFile: true } })],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "openai:gpt-5.5",
    tools: [search],
    middleware: [humanInTheLoopMiddleware({ interruptOn: { writeFile: true } })],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    tools: [search],
    middleware: [humanInTheLoopMiddleware({ interruptOn: { writeFile: true } })],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    tools: [search],
    middleware: [humanInTheLoopMiddleware({ interruptOn: { writeFile: true } })],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    tools: [search],
    middleware: [humanInTheLoopMiddleware({ interruptOn: { writeFile: true } })],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    tools: [search],
    middleware: [humanInTheLoopMiddleware({ interruptOn: { writeFile: true } })],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
  import * as z from "zod";

  var search = tool(({ query }) => `Search results for: ${query}`, {
    name: "search",
    description: "Search for a query and return a short summary.",
    schema: z.object({ query: z.string() }),
  });

  var agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    tools: [search],
    middleware: [humanInTheLoopMiddleware({ interruptOn: { writeFile: true } })],
  });
  ```
</CodeGroup>

参见[⟦T147⟧](https://reference.langchain.com/javascript/langchain/middleware/humanInTheLoopMiddleware)、[Human-in-the-loop](/oss/javascript/langchain/human-in-the-loop)。

### 中间件资源

<CardGroup>
  <Card title="Middleware overview" icon="route" href="/oss/javascript/langchain/middleware/overview">
    中间件堆栈如何工作以及钩子何时触发
  </Card>

  <Card title="Prebuilt middleware" icon="package" href="/oss/javascript/langchain/middleware/built-in">
    包含配置示例的完整参考
  </Card>

  <Card title="Custom middleware" icon="code" href="/oss/javascript/langchain/middleware/custom">
    为业务逻辑、PII 清理等编写您自己的挂钩
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>