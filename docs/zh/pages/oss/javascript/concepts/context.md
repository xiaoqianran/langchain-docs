<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Context overview | https://docs.langchain.com/oss/javascript/concepts/context -->

# 上下文概述

**上下文工程**是构建动态系统的实践，以正确的格式提供正确的信息和工具，以便人工智能应用程序能够完成任务。上下文可以通过两个关键维度来表征：

1. 通过**可变性**：
   * **静态上下文**：在执行期间不会更改的不可变数据（例如，用户元数据、数据库连接、工具）
   * **动态上下文**：随着应用程序运行而演变的可变数据（例如，对话历史记录、中间结果、工具调用观察）
2. 按**生命周期**：
   * **运行时上下文**：数据范围仅限于单次运行或调用
   * **跨对话上下文**：在多个对话或会话中持续存在的数据

<Tip>
  运行时上下文是指本地上下文：代码运行所需的数据和依赖项。它**不**指的是：

  * LLM 上下文，即传递到 LLM 提示符中的数据。
  * “上下文窗口”，即可以传递给LLM的最大令牌数。运行时上下文是您通过代理线程化数据的方式。您可以将值（例如数据库连接、用户会话或配置）附加到上下文，并在工具和中间件内访问它们，而不是将事物存储在全局状态中。这使事物保持无状态、可测试和可重用。例如，您可以在运行时上下文中使用用户元数据来获取用户首选项并将其输入到上下文窗口中。
</Tip>

LangGraph提供了三种管理上下文的方法，结合了可变性和生命周期维度：|上下文类型 |描述 |可变性 |终身|
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------- | ------------------ |
| [**Config**](#config) |运行开始时传递的数据 |静态|单跑 |
| [**Dynamic runtime context (state)**](#dynamic-runtime-context) |在单次运行期间演变的可变数据 |动态 |单跑 |
| [**Dynamic cross-conversation context (store)**](#dynamic-cross-conversation-context) |跨对话共享持久数据|动态 |交叉对话 |

## 配置

配置用于不可变数据，例如用户元数据或 API 密钥。当您的值在运行中不会更改时，请使用此选项。

使用名为 **“configurable”** 的键指定配置，该键是为此目的而保留的。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await graph.invoke(
  { messages: [{ role: "user", content: "hi!" }] },
  { configurable: { user_id: "user_123" } } // [!code highlight]
);
```

## 动态运行时上下文**动态运行时上下文**表示可以在单次运行期间演变的可变数据，并通过 LangGraph 状态对象进行管理。这包括对话历史记录、中间结果以及从工具或 LLM 输出得出的值。在 LangGraph 中，状态对象在运行期间充当[short-term memory](/oss/javascript/concepts/memory)。

<Tabs>
  <Tab title="In an agent">
    示例展示了如何将状态合并到代理**提示**中。

    状态也可以通过代理的**工具**访问，它可以根据需要读取或更新状态。详情请参阅[tool calling guide](/oss/javascript/langchain/tools#access-context)。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createAgent, createMiddleware } from "langchain";
    import type { AgentState } from "langchain";
    import * as z from "zod";

    const CustomState = z.object({ // [!code highlight]
      userName: z.string(),
    });

    const personalizedPrompt = createMiddleware({ // [!code highlight]
      name: "PersonalizedPrompt",
      stateSchema: CustomState,
      wrapModelCall: (request, handler) => {
        const userName = request.state.userName || "User";
        const systemPrompt = `You are a helpful assistant. User's name is ${userName}`;
        return handler({ ...request, systemPrompt });
      },
    });

    const agent = createAgent({  // [!code highlight]
      model: "claude-sonnet-4-6",
      tools: [/* your tools here */],
      middleware: [personalizedPrompt] as const, // [!code highlight]
    });

    await agent.invoke({
      messages: [{ role: "user", content: "hi!" }],
      userName: "John Smith",
    });
    ```
  </Tab>

  <Tab title="In a workflow">
    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { z } from "zod/v4";
    import { StateGraph, StateSchema, MessagesValue, START } from "@langchain/langgraph";

    const CustomState = new StateSchema({  // [!code highlight]
      messages: MessagesValue,
      extraField: z.number(),
    });

    const builder = new StateGraph(CustomState)
      .addNode("node", async (state) => {  // [!code highlight]
        const messages = state.messages;
        // ...
        return {  // [!code highlight]
          extraField: state.extraField + 1,
        };
      })
      .addEdge(START, "node");

    const graph = builder.compile();
    ```
  </Tab>
</Tabs>

<Tip>
  **打开内存**
  有关如何启用内存的更多详细信息，请参阅[memory guide](/oss/javascript/langgraph/add-memory)。这是一个强大的功能，允许您在多次调用中保留代理的状态。否则，状态的范围仅限于单次运行。
</Tip>

## 动态交叉对话上下文**动态交叉对话上下文**表示跨越多个对话或会话的持久、可变数据，并通过 LangGraph 存储进行管理。这包括用户个人资料、偏好和历史交互。 LangGraph 存储在多次运行中充当[long-term memory](/oss/javascript/concepts/memory#long-term-memory)。这可用于读取或更新持久事实（例如，用户配置文件、偏好、先前的交互）。

## 了解更多

* [Memory conceptual overview](/oss/javascript/concepts/memory)
* [Short-term memory in LangChain](/oss/javascript/langchain/short-term-memory)
* [Memory in LangGraph](/oss/javascript/langgraph/add-memory)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/concepts/context.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>