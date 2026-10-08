<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Managed Deep Agents runtime | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-runtime -->

# 托管 Deep Agents 运行时

从代理工厂、工具和中间件接收的本机运行时类型中读取运行上下文、已验证的调用方、通道传递和沙箱。

代理工厂、工具和中间件挂钩各自接收一个运行时。它是本机 LangChain 或 LangGraph 运行时，添加了三个托管字段。上下文、状态和存储的工作方式与 [LangChain](/oss/javascript/langchain/runtime) 中的工作方式相同，并且您的类型检查器会看到您自己的上下文类型。

<Note>
  托管 Deep Agents 位于 **公共 [beta](/langsmith/release-stages)** 中，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 了解运行时类型

托管 Deep Agents 为代码运行的每个位置扩展一种本机类型：

|代码|类型 |延伸|
| - | - | - |
|代理工厂| `ManagedServerRuntime<Context>` | `ServerRuntime` 从 `@langchain/langgraph-sdk` |
|工具| `ManagedToolRuntime<State, Context>` | `ToolRuntime` 从 `@langchain/core/tools` |
|中间件钩子| `ManagedRuntime<Context>` | `Runtime` 从 `langchain` |

类型参数遵循本机顺序，因此 `ManagedToolRuntime` 首先采用状态，然后采用上下文。这两个参数都是可选的。 `ManagedDeepAgentRuntime` 是`ManagedToolRuntime` 的别名。

每种类型都保留每个本机字段和方法，例如 `context`、`state`、`store`、`writer` 和 `toolCallId`。托管Deep Agents添加了三个字段：* **`serverInfo`**：本机服务器元数据加上经过验证的调用者。工具和中间件接收它。
* **`channel`**：开始运行的已验证通道交付。 `undefined` 直接 API 和计划运行。
* **`backend`**：线程的[sandbox](/langsmith/javascript/managed-deep-agents-sandboxes)文件系统。 `undefined` 当项目声明没有沙箱时。

## 独立的上下文、调用者和传递者

上下文、调用者和通道传递来自不同的来源并具有不同的信任级别。运行时将它们保存在单独的字段中：

* **Context** 来自 API 调用的 `context` 参数。 LangGraph 根据您的上下文架构对其进行验证。用它来选择行为，而不是授予访问权限。
* **服务器信息**来自[identity](/langsmith/javascript/managed-deep-agents-identity)，它通过经过验证的令牌解析调用者。托管Deep Agents剥离客户端通过`configurable`发送的身份密钥，因此使用此字段进行授权。
* **通道** 来自托管的 [channel](/langsmith/javascript/managed-deep-agents-channels) 入口，它在运行开始之前验证交付。直接 API 调用上下文中的 `channel` 键不会创建 `runtime.channel`。

API 调用者在输入旁边传递上下文：

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await client.runs.create(threadId, "support", {
  input: { messages: [{ role: "user", content: "Where is my order?" }] },
  context: { tier: "fast" },
});
```

### 处理没有上下文的通道运行通道传递不携带应用程序上下文。托管 Deep Agents 在 LangGraph 验证上下文之前删除交付数据，因此所需的上下文字段不会拒绝通道运行。直接 API 运行保持本机验证。

在通道运行时，代理工厂和工具中的上下文为`undefined`，而本机中间件中的上下文为空对象。

要区分通道运行和直接运行，请检查`runtime.channel`。

## 读取代理工厂中的运行时

代理工厂收到`ManagedServerRuntime`：本机[⟦T32⟧](/langsmith/graph-rebuild)加上`channel`和`backend`。要编写工厂，请参阅[Select configuration per run](/langsmith/javascript/managed-deep-agents-agent-definition#select-configuration-per-run)。

代理服务器还调用工厂来读取模式和状态。 `accessContext` 命名操作。 [⟦T36⟧](/langsmith/graph-rebuild#access-contexts) 是 `null` 在 `threads.create_run` 之外，因此从 `executionRuntime.context` 读取运行上下文。每次调用返回相同的图形结构和模式。

`channel` 可用，因此工厂可以选择每个通道的配置。 `backend`始终是`undefined`，因为工厂选择了沙箱。

## 在工具中读取运行时

用`ManagedToolRuntime`注释运行时参数：

```ts tools/check-order.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "langchain";
import type { ManagedToolRuntime } from "managed-deepagents";
import { z } from "zod";

type AppContext = { region?: string };

export const checkOrder = tool(
  async ({ orderId }, runtime: ManagedToolRuntime<unknown, AppContext>) => {
    const principal = runtime.serverInfo?.principal;
    if (!principal) return "Sign in to check orders.";
    await runtime.channel?.post?.({
      type: "content",
      content: "Checking that order now.",
    });
    const region = runtime.context?.region ?? "us";
    return `Order ${orderId} for ${principal.id} ships from ${region}.`;
  },
  {
    name: "check_order",
    description: "Check the status of an order.",
    schema: z.object({ orderId: z.string() }),
  }
);
```

当没有呼叫者解析时，`principal` 不存在，因为身份是选择加入的。 `post` 发送一条附加消息，客服人员的最终回复仍会自动发布。有关书写工具的更多信息，请参阅[Custom tools](/langsmith/javascript/managed-deep-agents-tools)。

## 读取中间件中的运行时将钩子的运行时转换为 `ManagedRuntime` 以读取托管字段：

```ts middleware/log-caller.ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";
import type { ManagedRuntime } from "managed-deepagents";

type AppContext = { region?: string };

export const logCaller = createMiddleware({
  name: "LogCaller",
  beforeModel: (_state, runtime) => {
    const { serverInfo, channel } = runtime as ManagedRuntime<AppContext>;
    const caller = serverInfo?.principal?.id ?? "anonymous";
    console.log(`${caller} via ${channel?.provider ?? "api"}`);
    return undefined;
  },
});
```

工具调用挂钩接收一个`ManagedToolRuntime`。声明性子代理接收相同的托管字段。两者都不需要身份或沙箱声明。有关编写中间件的更多信息，请参阅[Custom middleware](/langsmith/javascript/managed-deep-agents-middleware)。

## 引用托管字段

### 服务器信息

`runtime.serverInfo` 是`ManagedServerInfo`。它保留本机 `assistantId`、`graphId` 和 `user` 字段并添加调用者：

* **`principal`**：经过验证的调用者。 `id` 是呼叫者 ID，`kind` 是 `"person"`、`"service"` 或 `"channel"`，`claims` 保存令牌声明。 `claims.groups` 始终是字符串数组，`claims.email` 始终是字符串。
* **`subject`**：运行所使用的权限。 `authority` 是 `"agent"` 或 `"user"`，以及 `agent_id` 和 `user_id`。
* **`link`**：账户链接。 `status` 目前报告`"not_required"`。
* **`source`**：跑步进入的地方。 `provider` 是一个值，例如 `"http"`、`"schedule"`、`"studio"` 或 `"slack"`，以及可选的 `threadId`。

从 `principal` 读取调用者，而不是从本机 `user` 读取。有关身份提供者和声明映射，请参阅[Identity](/langsmith/javascript/managed-deep-agents-identity)。

### 频道

`runtime.channel` 是`RuntimeChannel`：* **`name`**：配置的通道名称。
* **`provider`**：提供商标签，例如`"slack"`。
* **`event`**：打字传送。请参阅下面的事件类型。
* **`rawEvent`**：当通道提供一个时，原始提供者有效负载。对于 Slack，这是没有 HTTP 标头或触发器信封的内部 Slack 事件。简历可以省略。
* **`post`**：一个异步函数，用于向启动运行的会话发送消息。 `undefined` 当通道无法发送时。

`event.type` 是以下之一：

* **`message`**：一条新消息。 `messages` 保存传入消息。
* **`user_prompt_response`**：对交互式提示的回复。带有 `action`、可选的 `value` 和可选的 `correlation_id`。参见[Agent-owned interrupts](/langsmith/javascript/managed-deep-agents-agent-owned-interrupts)。
* **`interrupt_resume`**：挂起中断的恢复。 `resume` 保存恢复值。

`post` 接受内容消息 `{"type": "content", "content": ...}` 或本机消息 `{"type": "native", "native": ...}`。内置的 Slack 通道仅发送文本内容。回复目标保持私有：`post`没有地址或目标覆盖，代码无法读取或替换目标。

### 后端

`runtime.backend` 在线程的沙箱中读写文件。参见[Read and write sandbox files from code](/langsmith/javascript/managed-deep-agents-sandboxes#read-and-write-sandbox-files-from-code)。

## 另请参阅

* [Runtime](/oss/javascript/langchain/runtime)
* [Rebuild graph at runtime](/langsmith/graph-rebuild)
* [Agent definition](/langsmith/javascript/managed-deep-agents-agent-definition)
* [Custom tools](/langsmith/javascript/managed-deep-agents-tools)
* [Custom middleware](/langsmith/javascript/managed-deep-agents-middleware)
* [Channels](/langsmith/javascript/managed-deep-agents-channels)
* [Identity](/langsmith/javascript/managed-deep-agents-identity)

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-runtime.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>