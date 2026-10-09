<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tools | https://docs.langchain.com/oss/javascript/langchain/mcp/tools -->

# 工具

将MCP工具加载到LangChain代理中，控制其执行，并处理服务器结果和请求。

[⟦T9⟧](https://reference.langchain.com/javascript/langchain-mcp-adapters/MCPAdapter)桥接MCP服务器和LangChain代理：它发现服务器通告的工具并将其改编为标准LangChain工具。将工具从 `listTools()` 传递到 [⟦T11⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)，就像传递任何其他 LangChain 工具一样。

本页介绍了该桥的具体内容：识别 MCP 工具、控制其执行、处理其输出以及在调用期间服务器需要输入时进行响应。有关可运行的发现和代理示例，请参阅 [MCP quickstart](/oss/javascript/langchain/mcp)。

## 在代理中使用 MCP 工具

使用[⟦T12⟧](https://reference.langchain.com/javascript/langchain-mcp-adapters/MCPAdapter/listTools)发现服务器的目录，然后将返回的工具交给[⟦T13⟧](https://reference.langchain.com/javascript/langchain/index/createAgent)。从代理的角度来看，它们的行为类似于 LangChain 工具：模型选择一个工具，LangChain 调用它，并将生成的 [⟦T14⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage) 返回给模型。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

async function main(server: string) {
  const adapter = new MCPAdapter({
    servers: { weather: { url: server } },
  });

  try {
    // Discover the server's tools, then hand them to the agent like any other
    // LangChain tools. Keep the adapter open while the agent calls its tools.
    const tools = await adapter.listTools();
    const agent = createAgent({ model: "claude-sonnet-5", tools });

    await agent.invoke({
      messages: [{ role: "user", content: "What is the forecast for Oslo?" }],
    });
  } finally {
    await adapter.close();
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/3f60de8e-697e-40e1-87de-d2419e426b61/r">
  为此示例打开公共 LangSmith 运行。
</Card>

当代理可以调用其工具时（包括恢复中断的运行时），请保持适配器打开。当您使用完代理后，请致电`await adapter.close()`。

有关定义、绑定和使用 LangChain 工具的一般指南，请参阅 [Tools](/oss/javascript/langchain/tools)。有关多个 MCP 服务器及其命名空间工具目录，请参阅[Connections](/oss/javascript/langchain/mcp/connections#multiple-servers)。## 处理工具输出

MCP 工具结果成为[⟦T16⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage) 对象，其中包含模型可以读取的内容、应用程序数据的工件以及指示成功或失败的状态。

### 多模式内容

该适配器将模型可见的 MCP 内容转换为 LangChain [content blocks](/oss/javascript/langchain/messages#standard-content-blocks)。例如，返回带有屏幕截图的 MCP 图像块的工具以 `image` 块的形式到达模型。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

async function accessMultimodalToolContent(serverUrl: string) {
  const adapter = new MCPAdapter({
    servers: { browser: { url: serverUrl } },
  });

  try {
    const tools = await adapter.listTools();

    const agent = createAgent({ model: "claude-sonnet-5", tools });

    const result = await agent.invoke({
      messages: [
        { role: "user", content: "Take a screenshot of the current page" },
      ],
    });

    // An MCP result arrives as LangChain content blocks. Image content
    // converts into standardized `image` blocks alongside `text`.
    for (const message of result.messages) {
      if (message.type === "tool") {
        for (const block of message.contentBlocks) { // [!code highlight]
          if (block.type === "text") { // [!code highlight]
            console.log(`Text: ${block.text}`); // [!code highlight]
          } else if (block.type === "image") { // [!code highlight]
            console.log(`Image MIME type: ${block.mimeType}`); // [!code highlight]
            console.log(`Image data: ${String(block.data).slice(0, 50)}...`); // [!code highlight]
          } // [!code highlight]
        } // [!code highlight]
      }
    }
  } finally {
    await adapter.close();
  }
}
```

### 结构化内容

当工具返回结构化内容时，适配器将其作为工件附加到[⟦T18⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)，而不是将其折叠到模型可见文本中。运行代理，然后从结果中的 [⟦T20⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage) 实例中读取 `artifact`：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent, ToolMessage } from "langchain";

async function readStructuredContent(serverUrl: string) {
  const adapter = new MCPAdapter({
    servers: { crm: { url: serverUrl } },
  });

  try {
    const tools = await adapter.listTools();
    const agent = createAgent({ model: "claude-sonnet-5", tools });
    const result = await agent.invoke({
      messages: [{ role: "user", content: "Look up user 42." }],
    });

    // The adapter stores MCP result entries in an `artifact` array.
    // Find the `mcp_structured_content` entry, then read its `data` field.
    for (const message of result.messages) {
      if (ToolMessage.isInstance(message) && Array.isArray(message.artifact)) {
        const structured = message.artifact.find(
          (entry) => entry.type === "mcp_structured_content",
        );
        if (structured) {
          console.log(`Structured content: ${JSON.stringify(structured.data)}`); // [!code highlight]
        }
      }
    }
  } finally {
    await adapter.close();
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/77a2988b-909c-475d-a811-86cbb843f5c1/r">
  为此示例打开公共 LangSmith 运行。
</Card>

`artifact` 是 MCP 结果条目的数组。结构化内容出现在带有`type: "mcp_structured_content"`的条目中，其`data`字段保存工具结果的`structuredContent`。

### 错误

当服务器在代理工具调用期间返回 `isError: true` 时，适配器将返回带有 `status: "error"` 和服务器消息的 [⟦T26⟧](https://reference.langchain.com/javascript/langchain-core/messages/ToolMessage)。该模型可以读取错误并重试。适配器抛出传输故障。当工具在 `createAgent` 内运行时，代理的默认错误处理也会将这些故障转换为错误工具消息。消息的`status`本身并不能区分原因：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent, ToolMessage } from "langchain";

async function divideByZero(serverUrl: string) {
  const adapter = new MCPAdapter({
    servers: { calculator: { url: serverUrl } },
  });

  try {
    const tools = await adapter.listTools();

    const agent = createAgent({ model: "claude-sonnet-5", tools });
    const result = await agent.invoke({
      messages: [{ role: "user", content: "What is 10 divided by 0?" }],
    });

    // A server error (isError: true) reaches the model as a failed ToolMessage,
    // so the agent can read the server's own message and recover. By default,
    // createAgent also converts transport failures into error tool messages.
    for (const message of result.messages) {
      if (ToolMessage.isInstance(message) && message.status === "error") {
        console.log(`Tool error: ${message.text}`); // [!code highlight]
      }
    }
  } finally {
    await adapter.close();
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/f47c3c87-87f8-4b3e-9b51-6116e9bdd313/r">
  为此示例打开公共 LangSmith 运行。
</Card>

如果您直接使用普通参数调用适配工具，则带有 `isError: true` 的服务器结果会抛出 `ToolException`，而 MCP 结果为 `error.result`。

## 工具元数据

适配器将 MCP 工具注释存储在 `tool.metadata.annotations` 中：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
tool.metadata;
// {
//   annotations: {
//     destructiveHint: true,
//     readOnlyHint: false,
//   },
// }
```

`annotations`保存服务器的MCP工具注释，例如`readOnlyHint`和`destructiveHint`。服务器可能会省略它们，因此该字段可以是`undefined`。

防御性地读取可选元数据，因此缺失的字段会返回默认值而不是失败：

此示例以及来自 `@modelcontextprotocol/client` 的 [human-in-the-loop example](#human-in-the-loop) 导入类型；将其添加为直接依赖项。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { DynamicStructuredTool } from "@langchain/core/tools";
import type { ToolAnnotations } from "@modelcontextprotocol/client";

/** Read the MCP destructive hint from the adapter's tool metadata. */
function isDestructive(tool: DynamicStructuredTool): boolean {
  // Use optional chaining and a default so a tool missing any field returns
  // false rather than raising.
  const annotations = tool.metadata?.annotations as ToolAnnotations | undefined;
  return annotations?.destructiveHint ?? false;
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/aca946a6-8b00-425e-9ebd-c9166dfe5958/r">
  为此示例打开公共 LangSmith 运行。
</Card>

## 人机交互

阅读注释可以让您根据服务器声明的内容来控制工具，而不是硬编码工具名称。 MCP 注释对工具进行分类，LangChain 的人机交互中间件强制执行审批策略。在工具发现期间从元数据中读取一次破坏性提示。然后为人机交互配置提供一个 `when` 谓词，用于接收每个待处理的工具调用并返回该调用是否需要批准：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import type { DynamicStructuredTool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { MCPAdapter } from "@langchain/mcp-adapters";
import type { ToolAnnotations } from "@modelcontextprotocol/client";
import {
  createAgent,
  humanInTheLoopMiddleware,
  type InterruptOnConfig,
  type WhenPredicate,
} from "langchain";

function isDestructive(tool: DynamicStructuredTool): boolean {
  const annotations = tool.metadata?.annotations as ToolAnnotations | undefined;
  return annotations?.destructiveHint ?? false;
}

async function gateDestructiveTools(serverUrl: string) {
  const adapter = new MCPAdapter({
    servers: { crm: { url: serverUrl } },
  });
  const tools = await adapter.listTools();

  // Read the hint once, then apply the same predicate to every tool call.
  const destructive = new Set(
    tools.filter(isDestructive).map((tool) => tool.name),
  );

  const needsApproval: WhenPredicate = (request) =>
    destructive.has(request.toolCall.name);

  const gate: InterruptOnConfig = {
    allowedDecisions: ["approve", "reject"],
    when: needsApproval,
  };
  const interruptOn = Object.fromEntries(
    tools.map((tool) => [tool.name, gate]),
  );

  const agent = createAgent({
    model: "claude-sonnet-5",
    tools,
    middleware: [humanInTheLoopMiddleware({ interruptOn })],
    checkpointer: new MemorySaver(),
  });
  return { agent, adapter };
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/5c0bfda7-ce16-43ee-a5ad-0c827409668a/r">
  为此示例打开公共 LangSmith 运行。
</Card>

<Warning>
  `interruptOn` 键必须是适配器的工具名称，其中包括服务器前缀 (`crm_delete_file`)。无前缀的密钥永远不会匹配，因此该工具无需批准即可运行。
</Warning>

当代理调用谓词门控的工具时，运行会暂停。批准调用以运行它，或拒绝它以跳过该工具并告诉模型：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Command } from "@langchain/langgraph";

// Approve the pending destructive call and resume.
const resumed = await agent.invoke(
  new Command({ resume: { decisions: [{ type: "approve" }] } }),
  config
);
```

谓词还可以检查调用的参数。这使得工具可以自由运行以实现安全输入，并仅在有风险的情况下暂停，例如针对受保护路径的 `delete_file` 调用。

通过`request.toolCall.args`访问参数。

仅当工具的类型和输入值得批准时，才将元数据分类和参数检查相结合来控制工具。有关完整的审批工作流程，请参阅[Human-in-the-loop](/oss/javascript/langchain/human-in-the-loop)。

## 工具执行期间的服务器请求

大多数工具在通话过程中无需向客户询问任何信息即可完成。当服务器需要输入时，[⟦T44⟧](https://reference.langchain.com/javascript/langchain-mcp-adapters/MCPAdapter)将[elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation)显示为LangGraph[⟦T45⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/interrupt)。

### 引出[Elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation) 让 MCP 服务器在工具调用期间请求输入。适配器通过 LangGraph 中断暂停运行。您的应用程序向用户提出请求，并根据用户的回答继续运行。

将 [checkpointer](/oss/javascript/langchain/short-term-memory) 附加到代理，并在调用和恢复它时使用相同的 `thread_id`。

此示例假设预订工具询问一个日期并暂停一次。将示例日期替换为用户的答案。

中断驱动的诱导需要现代 MCP 服务器，并且默认启用。在服务器上设置`elicitation: false`以选择退出。对于旧服务器，请使用 `mode: "legacy"` 配置 `onElicitation` 处理程序。如果没有检查点，要求输入的工具会失败并出现错误 `ToolMessage`，而不是暂停。

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { Command, MemorySaver } from "@langchain/langgraph";
import {
  MCPAdapter,
  createMCPElicitationResume,
  type MCPElicitationInterrupt,
} from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

async function bookWithElicitation(serverUrl: string) {
  // When a server needs input mid-call, the adapter surfaces the question
  // as a LangGraph interrupt.
  const adapter = new MCPAdapter({
    servers: { booking: { url: serverUrl } },
  });

  try {
    const tools = await adapter.listTools();
    // A checkpointer saves the interrupted run so it can resume.
    const agent = createAgent({
      model: "claude-sonnet-5",
      tools,
      checkpointer: new MemorySaver(),
    });
    const config = { configurable: { thread_id: "booking-1" } };

    const paused = await agent.invoke(
      { messages: [{ role: "user", content: "Book a table for 4." }] },
      config,
    );
    const [pending] = paused.__interrupt__!;
    const question = pending.value as MCPElicitationInterrupt;
    const [key] = Object.keys(question.requests);

    // Answers are keyed by the server's own request key.
    // Use `decline` or `cancel` to refuse the request.
    const answer = {
      action: "accept" as const,
      content: { date: "2026-09-14" },
    };
    // Address the answer to the interrupt that requested it.
    const resume = createMCPElicitationResume(pending, { [key]: answer });
    return await agent.invoke(new Command({ resume }), config);
  } finally {
    await adapter.close();
  }
}
```

<Card title="View example trace" icon="chart-line" href="https://smith.langchain.com/public/cc8ee095-52ca-403e-800f-e75479cdff90/r">
  为此示例打开公共 LangSmith 运行。
</Card>

`createMCPElicitationResume` 寻址请求它的中断的答案。响应使用服务器的请求密钥。使用 `createMCPElicitationResume` 而不是裸露的 `{ responses }` 对象构建每个恢复值，这并没有说明它会响应哪个中断。每个中断的`value`都是一个`MCPElicitationInterrupt`：`type: "mcp_elicitation"`、`server`、`tool`（服务器自己的工具名称，不带前缀）、`arguments`（有效工具参数）和`requests`。当同一代理也可以引发人机循环中断时，请检查`type`。

当多个呼叫同时暂停时，应答每个中断。将`createMCPElicitationResume`返回的对象合并为一个`Command({ resume })`，例如`Object.assign({}, ...paused.__interrupt__!.map((q) => createMCPElicitationResume(q, answers)))`，或者继续直到`__interrupt__`为空。仅响应第一个中断的简历会使其他中断暂停。

<Note>
  恢复将从头开始重新运行该工具。在服务器请求输入之前执行的任何工作都可以重复。确保该工作可以安全地重复，而不会产生重复的副作用。
</Note>

每个答案都使用以下操作之一：

* **`accept`**：提供与请求架构匹配的表单`content`，或在没有`content`的情况下确认 URL 交互的完成。
* **`decline`**：拒绝提供所要求的信息。
* **`cancel`**：表示用户取消了交互。

适配器将答案转发给服务器，服务器决定工具调用如何完成。只有启发式才是这样回答的。适配器仅在每次调用时声明启发功能，因此需要 [sampling](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) 或 [roots](https://modelcontextprotocol.io/specification/2025-06-18/client/roots) 的工具会失败并返回 `ToolException`，其中 `createAgent` 将作为错误 `ToolMessage` 返回到模型。参见[Sampling and roots](/oss/javascript/migrate/langchain-mcp-adapters#sampling-and-roots)。

<Note>
  中断驱动的诱导应答服务器，以 `InputRequiredResult` 的形式返回其请求。仅通过传统握手会话推送启发的服务器无法以这种方式应答。
</Note>

## 另请参阅

* [Content blocks](/oss/javascript/langchain/messages#standard-content-blocks)

* [Tools](/oss/javascript/langchain/tools)

* [Human-in-the-loop](/oss/javascript/langchain/human-in-the-loop)

* [MCP elicitation specification](https://modelcontextprotocol.io/specification/draft/client/elicitation)

* [MCP tool annotations](https://modelcontextprotocol.io/specification/draft/server/tools)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/mcp/tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>