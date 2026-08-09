<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Anthropic applications | https://docs.langchain.com/langsmith/trace-anthropic -->

# 跟踪人类应用程序

Python ([⟦T3⟧](https://reference.langchain.com/python/langsmith/wrappers/_anthropic/wrap_anthropic)) 和 Typescript ([⟦T4⟧](https://reference.langchain.com/javascript/functions/langsmith.wrappers_anthropic.wrapAnthropic.html)) 中的 Anthropic 包装器方法允许您包装 Anthropic 客户端以便自动记录跟踪。使用包装器可确保消息（包括工具调用和多模式内容块）在 LangSmith 中得到良好呈现。该包装器与 `@traceable` 装饰器 (Python) 或 `traceable` 函数 (TypeScript) 无缝协作，因此您可以使用包装器跟踪 Anthropic 调用，并使用装饰器或函数跟踪应用程序的其他部分。

该包装器还支持 [Claude managed agents](https://docs.anthropic.com/en/docs/claude-code/managed-agents)（仅限 TypeScript）。请参阅[Trace Claude managed agents](#trace-claude-managed-agents)。

<Note>
  `LANGSMITH_TRACING` 环境变量必须设置为 `'true'`，以便将跟踪记录到 LangSmith，即使使用 `wrap_anthropic` 或 `wrapAnthropic` 也是如此。这允许您在不更改代码的情况下打开和关闭跟踪。

  此外，您需要将 `LANGSMITH_API_KEY` 环境变量设置为您的 API 密钥（有关更多信息，请参阅 [Setup](/)）。

  如果您的 LangSmith API 密钥链接到多个工作区，请设置 `LANGSMITH_WORKSPACE_ID` 环境变量以指定要使用的工作区。

  默认情况下，跟踪将记录到名为 `default` 的项目中。要将跟踪记录到不同的项目，请参阅[Log traces to a specific project](/langsmith/log-traces-to-project)。
</Note><CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import anthropic
  from langsmith import traceable
  from langsmith.wrappers import wrap_anthropic

  client = wrap_anthropic(anthropic.Anthropic())

  @traceable(run_type="tool", name="Retrieve Context")
  def my_tool(question: str) -> str:
    return "During this morning's meeting, we solved all world conflict."

  @traceable(name="Chat Pipeline")
  def chat_pipeline(question: str):
    context = my_tool(question)
    messages = [
        { "role": "user", "content": f"Question: {question}\nContext: {context}"}
    ]
    message = client.messages.create(
        model="claude-sonnet-4-6",
        messages=messages,
        max_tokens=1024,
        system="You are a helpful assistant. Please respond to the user's request only based on the given context."
    )
    return message

  chat_pipeline("Can you summarize this morning's meetings?")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import Anthropic from "@anthropic-ai/sdk";
  import { traceable } from "langsmith/traceable";
  import { wrapAnthropic } from "langsmith/wrappers/anthropic";

  const client = wrapAnthropic(new Anthropic());

  const myTool = traceable(async (question: string) => {
    return "During this morning's meeting, we solved all world conflict.";
  }, { name: "Retrieve Context", run_type: "tool" });

  const chatPipeline = traceable(async (question: string) => {
    const context = await myTool(question);
    const messages = [
        { role: "user", content: `Question: ${question}\nContext: ${context}` }
    ];
    const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        messages: messages,
        max_tokens: 1024,
        system: "You are a helpful assistant. Please respond to the user's request only based on the given context."
    });
    return message;
  }, { name: "Chat Pipeline" });

  await chatPipeline("Can you summarize this morning's meetings?");
  ```
</CodeGroup>

## Trace Claude 管理的代理

`wrapAnthropic` 包装器还支持 [Claude managed agents](https://docs.anthropic.com/en/docs/claude-code/managed-agents)（仅限 TypeScript）。用 `wrapAnthropic` 包裹 Anthropic 客户端。包装器将自动跟踪代理创建、会话创建以及流经会话的所有事件。

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import Anthropic from "@anthropic-ai/sdk";
import { wrapAnthropic } from "langsmith/wrappers/anthropic";

const anthropic = wrapAnthropic(new Anthropic());

// Create a managed agent
const agent = await anthropic.beta.agents.create({
  name: "my-agent",
  model: "claude-opus-4-8",
  system: "You are a helpful assistant.",
  tools: [
    // ... your tools here
  ],
});

// Create a cloud environment for the agent to run in
const environment = await anthropic.beta.environments.create({
  name: "my-environment",
  config: {
    type: "cloud",
    networking: { type: "unrestricted" },
  },
});

// Create a session connecting the agent and environment
const session = await anthropic.beta.sessions.create({
  agent: agent.id,
  environment_id: environment.id,
  title: "My session",
});

// Stream session events
const stream = await anthropic.beta.sessions.events.stream(session.id);

// Send a message to the agent
await anthropic.beta.sessions.events.send(session.id, {
  events: [
    {
      type: "user.message",
      content: [
        {
          type: "text",
          text: "Hello! Can you help me with something?",
        },
      ],
    },
  ],
});

// Consume the event stream until the session is idle
for await (const event of stream) {
  if (event.type === "session.status_idle") {
    break;
  }
}
```

<Note>
  Anthropic 多代理架构中子代理的完整跟踪需要
  接入单独的事件流，尚不支持。仅限顶级
  跟踪会话事件。
</Note>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-anthropic.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>