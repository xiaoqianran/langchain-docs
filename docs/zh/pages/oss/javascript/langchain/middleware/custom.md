<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom middleware | https://docs.langchain.com/oss/javascript/langchain/middleware/custom -->

# 自定义中间件

通过实现在代理执行流程中的特定点运行的挂钩来构建自定义中间件。

## 钩子

中间件提供了两种类型的钩子来拦截代理执行：

<CardGroup>
  <Card title="Node-style hooks" icon="share" href="#node-style-hooks">
    在特定的执行点顺序运行。
  </Card>

  <Card title="Wrap-style hooks" icon="container" href="#wrap-style-hooks">
    围绕每个模型或工具调用运行。
  </Card>
</CardGroup>

### 节点式挂钩

在特定的执行点顺序运行。用于日志记录、验证和状态更新。

选择您的中间件需要的挂钩。您可以在节点式挂钩和环绕式挂钩之间进行选择。

**节点式挂钩**在特定执行点运行：

|钩|当它运行时 |
| ------------- | ------------------------------------------- |
| `beforeAgent` |代理启动之前（每次调用一次）|
| `beforeModel` |每次模型调用之前 |
| `afterModel` |每次模型响应后 |
| `afterAgent` |代理完成后（每次调用一次）|

**环绕式钩子**围绕每个调用运行，让您可以控制执行：|钩|当它运行时 |
| ---------------- | ---------------------- |
| `wrapModelCall` |各地型号调用|
| `wrapToolCall` |围绕每个工具调用|

**示例：**

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware, AIMessage } from "langchain";

const createMessageLimitMiddleware = (maxMessages: number = 50) => {
  return createMiddleware({
    name: "MessageLimitMiddleware",
    beforeModel: {
      canJumpTo: ["end"],
      hook: (state) => {
        if (state.messages.length === maxMessages) {
          return {
            messages: [new AIMessage("Conversation limit reached.")],
            jumpTo: "end",
          };
        }
        return;
      }
    },
    afterModel: (state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      console.log(`Model returned: ${lastMessage.content}`);
      return;
    },
  });
};
```

### 缠绕式挂钩

调用处理程序时拦截执行和控制。用于重试、缓存和转换。

您可以决定处理程序是否被调用零次（短路）、一次（正常流程）或多次（重试逻辑）。

**可用的挂钩：**

* `wrapModelCall` - 围绕每个模型调用
* `wrapToolCall` - 围绕每个工具调用

**示例：**

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";

const createRetryMiddleware = (maxRetries: number = 3) => {
  return createMiddleware({
    name: "RetryMiddleware",
    wrapModelCall: (request, handler) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return handler(request);
        } catch (e) {
          if (attempt === maxRetries - 1) {
            throw e;
          }
          console.log(`Retry ${attempt + 1}/${maxRetries} after error: ${e}`);
        }
      }
      throw new Error("Unreachable");
    },
  });
};
```

## 状态更新

节点式和包裹式钩子都可以更新代理状态。机制不同：

* **Node-style hooks** (`beforeAgent`, `beforeModel`, `afterModel`, `afterAgent`): 直接返回一个dict。使用图的化简器将字典应用于代理状态。
* **Wrap-style hooks** (`wrapModelCall`, `wrapToolCall`)：对于模型调用，直接返回 [⟦T42⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/Command) 以在模型响应旁边注入状态更新。对于工具调用，直接返回[⟦T43⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/Command)。当您需要根据模型或工具调用期间运行的逻辑（例如汇总触发点、使用元数据或根据请求或响应计算的自定义字段）跟踪或更新状态时，请使用这些。### 节点式挂钩

从节点式挂钩返回一个字典，将更新合并到代理状态中。字典键映射到状态字段。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";
import * as z from "zod";

const trackingStateSchema = z.object({
  modelCallCount: z.number().default(0),
});

const incrementAfterModel = createMiddleware({
  name: "incrementAfterModel",
  stateSchema: trackingStateSchema,
  afterModel: (state) => {
    return { modelCallCount: state.modelCallCount + 1 };
  },
});
```

### 缠绕式挂钩

直接从 `wrapModelCall` 返回 [⟦T44⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/Command) 以从模型调用层注入状态更新：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { createMiddleware } from "langchain";
import { Command } from "@langchain/langgraph";

const usageTrackingStateSchema = z.object({
  lastModelCallTokens: z.number().optional(),
});

const trackUsage = createMiddleware({
  name: "trackUsage",
  stateSchema: usageTrackingStateSchema,
  wrapModelCall: async (request, handler) => {
    const response = await handler(request);
    return new Command({ update: { lastModelCallTokens: 150 } });
  },
});
```

[⟦T46⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/Command) 流经图的化简器，因此可以正确应用更新，并且消息是附加的，而不是替换现有状态。

#### 多个中间件的组合

当多个中间件层返回响应时，框架会传递最后生成的 `AIMessage`：* **AIMessage流经：** 每个中间件的`handler()`接收来自上一层的`AIMessage`。当中间件返回 `AIMessage` 时，它将成为下一个中间件处理程序的输入。
* **没有消息更新的命令是传递的：** 如果中间件返回一个 `Command`，其状态更新不触及 `messages`，则框架将其视为消息流的无操作。下一个中间件的处理程序从返回命令的中间件*之前*接收到 `AIMessage`。
* **Reducer 行为和重试安全性：** 命令仍然通过Reducer 应用（消息附加，冲突时外部获胜）。重试逻辑会丢弃先前调用的命令。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { createMiddleware } from "langchain";
import { Command, StateSchema, ReducedValue } from "@langchain/langgraph";
import { AIMessage, SystemMessage } from "@langchain/core/messages";

/** Last-wins reducer: when both middleware write, outer overwrites inner. */
const customMiddlewareStateSchema = new StateSchema({
  traceLayer: new ReducedValue(
    z.string().optional(),
    { reducer: (a, b) => b },
  ),
});

const outerMiddleware = createMiddleware({
  name: "OuterMiddleware",
  stateSchema: customMiddlewareStateSchema,
  wrapModelCall: async (_request, handler) => {
    await handler(_request);
    return new Command({
      update: {
        traceLayer: "outer",
        messages: [new SystemMessage({ content: "[Outer ran]" })],
      },
    });
  },
});

const innerMiddleware = createMiddleware({
  name: "InnerMiddleware",
  stateSchema: customMiddlewareStateSchema,
  wrapModelCall: async (_request, handler) => {
    await handler(_request);
    return new Command({
      update: {
        traceLayer: "inner",
        messages: [new SystemMessage({ content: "[Inner ran]" })],
      },
    });
  },
});
```

## 创建中间件

蟒蛇
`AgentMiddleware` 子类可以声明代理工厂在编译时获取的三个类属性：

* `state_schema` — 使用自定义字段扩展代理状态。参见[Custom state schema](#custom-state-schema)。
* `tools` — 注册中间件附带的其他工具（例如，待办事项列表中间件上的 `write_todos`）。
* `transformers` — 注册作用域感知的流转换器工厂。参见[Custom stream transformers](#custom-stream-transformers)。
  :::

`createMiddleware` 接受代理工厂在编译时选取的三个配置字段：* `stateSchema` — 使用自定义字段扩展代理状态。参见[Custom state schema](#custom-state-schema)。
* `tools` — 注册中间件附带的附加工具。
* `streamTransformers` — 注册作用域感知的流转换器工厂。参见[Custom stream transformers](#custom-stream-transformers)。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents.middleware import (
    AgentMiddleware,
    AgentState,
    ModelRequest,
    ModelResponse,
)
from langgraph.runtime import Runtime
from typing import Any, Callable

class LoggingMiddleware(AgentMiddleware):
    def before_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        print(f"About to call model with {len(state['messages'])} messages")
        return None

    def after_model(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        print(f"Model returned: {state['messages'][-1].content}")
        return None

    async def abefore_model(
        self, state: AgentState, runtime: Runtime
    ) -> dict[str, Any] | None:
        # Async version of before_model
        return None

    async def aafter_model(
        self, state: AgentState, runtime: Runtime
    ) -> dict[str, Any] | None:
        # Async version of after_model
        print(f"Model returned: {state['messages'][-1].content}")
        return None


agent = create_agent(
    model="gpt-5.5",
    middleware=[LoggingMiddleware()],
    tools=[...],
)
```

**何时使用类：**

* 为同一个钩子定义同步和异步实现
* 单个中间件中需要多个钩子
* 需要复杂的配置（例如，可配置阈值、自定义模型）
* 通过初始化时配置跨项目重用

:::

使用 `createMiddleware` 函数定义自定义中间件：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";

const loggingMiddleware = createMiddleware({
  name: "LoggingMiddleware",
  beforeModel: (state) => {
    console.log(`About to call model with ${state.messages.length} messages`);
    return;
  },
  afterModel: (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    console.log(`Model returned: ${lastMessage.content}`);
    return;
  },
});
```

## 自定义状态模式

如果您的中间件需要跨钩子跟踪状态，中间件可以使用自定义属性扩展代理的状态。这使得中间件能够：

* **跟踪执行过程中的状态**：维护在代理执行生命周期中持续存在的计数器、标志或其他值

* **在钩子之间共享数据**：从`beforeModel`到`afterModel`或不同中间件实例之间传递信息

* **实现横切关注点**：添加速率限制、使用跟踪、用户上下文或审核日志记录等功能，而无需修改核心代理逻辑* **做出条件决策**：使用累积状态来确定是否继续执行、跳转到不同节点或动态修改行为

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware, createAgent, HumanMessage } from "langchain";
import { StateSchema } from "@langchain/langgraph";
import * as z from "zod";

const CustomState = new StateSchema({
  modelCallCount: z.number().default(0),
  userId: z.string().optional(),
});

const callCounterMiddleware = createMiddleware({
  name: "CallCounterMiddleware",
  stateSchema: CustomState,
  beforeModel: {
    canJumpTo: ["end"],
    hook: (state) => {
      if (state.modelCallCount > 10) {
        return { jumpTo: "end" };
      }

      return;
    },
  },
  afterModel: (state) => {
    return { modelCallCount: state.modelCallCount + 1 };
  },
});

const agent = createAgent({
  model: "gpt-5.5",
  tools: [...],
  middleware: [callCounterMiddleware],
});

const result = await agent.invoke({
  messages: [new HumanMessage("Hello")],
  modelCallCount: 0,
  userId: "user-123",
});
```

状态字段可以是公共的也可以是私有的。以下划线 (`_`) 开头的字段被视为私有字段，不会包含在代理的结果中。仅返回公共字段（没有前导下划线的字段）。

这对于存储不应暴露给调用者的内部中间件状态非常有用，例如临时跟踪变量或内部标志：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { StateSchema } from "@langchain/langgraph";
import * as z from "zod";

const PrivateState = new StateSchema({
  // Public field - included in invoke result
  publicCounter: z.number().default(0),
  // Private field - excluded from invoke result
  _internalFlag: z.boolean().default(false),
});

const middleware = createMiddleware({
  name: "ExampleMiddleware",
  stateSchema: PrivateState,
  afterModel: (state) => {
    // Both fields are accessible during execution
    if (state._internalFlag) {
      return { publicCounter: state.publicCounter + 1 };
    }
    return { _internalFlag: true };
  },
});

const result = await agent.invoke({
  messages: [new HumanMessage("Hello")],
  publicCounter: 0
});

// result only contains publicCounter, not _internalFlag
console.log(result.publicCounter); // 1
console.log(result._internalFlag); // undefined
```

## 自定义流转换器

<Note>中间件注册变压器需要`langchain@1.4.3`或更高版本。</Note>

中间件可以注册流转换器工厂，将事件从实时代理流投影到类型化扩展通道上。这对于在不耦合到框架的内置投影的情况下显示计数器、侧通道工件、部分输出或线级编辑非常有用。

在编译时，中间件注册的工厂与调用者直接传递给代理工厂的任何内容合并。 [final ordering rules](/oss/javascript/langchain/event-streaming#register-transformers-on-middleware) 将内置的 `ToolCallTransformer` 保留在前面，让调用者提供的条目最后落地。将 `streamTransformers` 作为工厂元组传递给 `createMiddleware`。每个工厂的形状为`() => StreamTransformer<any>`（零参数），并且每个作用域被调用一次；每次调用返回一个新的变压器使每个子图保持隔离。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, createMiddleware } from "langchain";

const toolActivityMiddleware = createMiddleware({
  name: "ToolActivityMiddleware",
  streamTransformers: [toolActivityTransformer],
});

const agent = createAgent({
  model: "gpt-5-nano",
  tools: [...],
  middleware: [toolActivityMiddleware],
});
```

请参阅 [Register transformers on middleware](/oss/javascript/langchain/event-streaming#register-transformers-on-middleware) 了解完整的排序规则和 PII 编辑示例。

## 自定义上下文

中间件可以定义自定义上下文架构来访问每个调用的元数据。与状态不同，上下文是只读的，并且在调用之间不会保留。这使得它非常适合：

* **用户信息**：传递在执行过程中不会改变的用户ID、角色或偏好
* **配置覆盖**：提供每次调用设置，例如速率限制或功能标志
* **租户/工作空间上下文**：包括多租户应用程序的组织特定数据
* **请求元数据**：传递请求 ID、API 密钥或中间件所需的其他元数据

使用 Zod 定义上下文模式并通过中间件挂钩中的 `runtime.context` 访问它。上下文架构中的必填字段将在 TypeScript 级别强制执行，确保您在调用 `agent.invoke()` 时必须提供它们。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, createMiddleware, HumanMessage } from "langchain";
import * as z from "zod";

const contextSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  apiKey: z.string().optional(),
});

const userContextMiddleware = createMiddleware({
  name: "UserContextMiddleware",
  contextSchema,
  wrapModelCall: (request, handler) => {
    // Access context from runtime
    const { userId, tenantId } = request.runtime.context;

    // Add user context to system message
    const contextText = `User ID: ${userId}, Tenant: ${tenantId}`;
    const newSystemMessage = request.systemMessage.concat(contextText);

    return handler({
      ...request,
      systemMessage: newSystemMessage,
    });
  },
});

const agent = createAgent({
  model: "gpt-5.5",
  middleware: [userContextMiddleware],
  tools: [],
  contextSchema,
});

const result = await agent.invoke(
  { messages: [new HumanMessage("Hello")] },
  // Required fields (userId, tenantId) must be provided
  {
    context: {
      userId: "user-123",
      tenantId: "acme-corp",
    },
  }
);
```**必需的上下文字段**：当您在 `contextSchema` 中定义必需字段（没有 `.optional()` 或 `.default()` 的字段）时，TypeScript 将强制要求在 `agent.invoke()` 调用期间必须提供这些字段。这确保了类型安全并防止运行时错误缺少所需的上下文。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// This will cause a TypeScript error if userId or tenantId are missing
const result = await agent.invoke(
  { messages: [new HumanMessage("Hello")] },
  { context: { userId: "user-123" } } // Error: tenantId is required
);
```

## 执行顺序

使用多个中间件时，了解它们如何执行：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const agent = createAgent({
  model: "gpt-5.5",
  middleware: [middleware1, middleware2, middleware3],
  tools: [...],
});
```

<Accordion title="Execution flow">
  **在钩子按顺序运行之前：**

  1.`middleware1.before_agent()`
  2.`middleware2.before_agent()`
  3.`middleware3.before_agent()`

  **代理循环开始**

  4.`middleware1.before_model()`
  5.`middleware2.before_model()`
  6.`middleware3.before_model()`

  **像函数调用一样包裹钩子嵌套：**

  7. `middleware1.wrap_model_call()` → `middleware2.wrap_model_call()` → `middleware3.wrap_model_call()` → 型号

  **挂钩以相反顺序运行后：**

  8.`middleware3.after_model()`
  9.`middleware2.after_model()`
  10.`middleware1.after_model()`

  **代理循环结束**

  11.`middleware3.after_agent()`
  12.`middleware2.after_agent()`
  13.`middleware1.after_agent()`
</Accordion>

**关键规则：**

* `before_*` 挂钩：从第一个到最后一个
* `after_*` 挂钩：最后到第一个（反向）
* `wrap_*` 钩子：嵌套（第一个中间件包装所有其他中间件）

## 特工跳跃

要提前退出中间件，请返回带有 `jump_to` 的字典：

**可用的跳跃目标：**

* `'end'`：跳转到代理执行的末尾（或第一个`after_agent`钩子）
* `'tools'`：跳转到工具节点
* `'model'`：跳转到模型节点（或者第一个`before_model`钩子）

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, createMiddleware, AIMessage } from "langchain";

const agent = createAgent({
  model: "gpt-5.5",
  middleware: [
    createMiddleware({
      name: "BlockedContentMiddleware",
      beforeModel: {
        canJumpTo: ["end"],
        hook: (state) => {
          if (state.messages.at(-1)?.content.includes("BLOCKED")) {
            return {
              messages: [new AIMessage("I cannot respond to that request.")],
              jumpTo: "end" as const,
            };
          }
          return;
        },
      },
    }),
  ],
});

const result = await agent.invoke({
    messages: "Hello, world! BLOCKED"
});

/**
 * Expected output:
 * I cannot respond to that request.
 */
console.log(result.messages.at(-1)?.content);
```

## 最佳实践1. 集中中间件——每个中间件都应该做好一件事
2. 优雅地处理错误——不要让中间件错误导致代理崩溃
3. **使用适当的钩子类型**：
   * 用于顺序逻辑的节点样式（日志记录、验证）
   * 控制流的环绕式（重试、回退、缓存）
4. 清楚地记录任何自定义状态属性
5. 集成前独立对中间件进行单元测试
6. 考虑执行顺序 - 将关键中间件放在列表的第一位
7. 尽可能使用内置中间件

## 示例

###动态提示

在运行时动态修改系统提示符，以在每次模型调用之前注入上下文、用户特定的指令或其他信息。这是最常见的中间件用例之一。

使用`ModelRequest`中的`systemMessage`字段读取和修改系统提示符。它包含一个 [⟦T104⟧](https://reference.langchain.com/javascript/langchain-core/messages/SystemMessage) 对象（即使代理是使用字符串 [⟦T105⟧](https://reference.langchain.com/javascript/types/langchain.index.CreateAgentParams.html#systemprompt) 创建的）。

<CodeGroup>
  ```ts Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware, SystemMessage, createAgent } from "langchain";

  const addContextMiddleware = createMiddleware({
    name: "AddContextMiddleware",
    wrapModelCall: async (request, handler) => {
      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(`Additional context.`),
      });
    },
  });

  const agent = createAgent({
    model: "google-genai:gemini-3.6-flash",
    systemPrompt: "You are a helpful assistant.",
    middleware: [addContextMiddleware],
  });
  ```

  ```ts OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware, SystemMessage, createAgent } from "langchain";

  const addContextMiddleware = createMiddleware({
    name: "AddContextMiddleware",
    wrapModelCall: async (request, handler) => {
      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(`Additional context.`),
      });
    },
  });

  const agent = createAgent({
    model: "openai:gpt-5.5",
    systemPrompt: "You are a helpful assistant.",
    middleware: [addContextMiddleware],
  });
  ```

  ```ts Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware, SystemMessage, createAgent } from "langchain";

  const addContextMiddleware = createMiddleware({
    name: "AddContextMiddleware",
    wrapModelCall: async (request, handler) => {
      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(`Additional context.`),
      });
    },
  });

  const agent = createAgent({
    model: "anthropic:claude-sonnet-4-6",
    systemPrompt: "You are a helpful assistant.",
    middleware: [addContextMiddleware],
  });
  ```

  ```ts OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware, SystemMessage, createAgent } from "langchain";

  const addContextMiddleware = createMiddleware({
    name: "AddContextMiddleware",
    wrapModelCall: async (request, handler) => {
      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(`Additional context.`),
      });
    },
  });

  const agent = createAgent({
    model: "openrouter:openrouter:z-ai/glm-5.2",
    systemPrompt: "You are a helpful assistant.",
    middleware: [addContextMiddleware],
  });
  ```

  ```ts Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware, SystemMessage, createAgent } from "langchain";

  const addContextMiddleware = createMiddleware({
    name: "AddContextMiddleware",
    wrapModelCall: async (request, handler) => {
      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(`Additional context.`),
      });
    },
  });

  const agent = createAgent({
    model: "fireworks:accounts/fireworks/models/glm-5p2",
    systemPrompt: "You are a helpful assistant.",
    middleware: [addContextMiddleware],
  });
  ```

  ```ts Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware, SystemMessage, createAgent } from "langchain";

  const addContextMiddleware = createMiddleware({
    name: "AddContextMiddleware",
    wrapModelCall: async (request, handler) => {
      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(`Additional context.`),
      });
    },
  });

  const agent = createAgent({
    model: "baseten:zai-org/GLM-5.2",
    systemPrompt: "You are a helpful assistant.",
    middleware: [addContextMiddleware],
  });
  ```

  ```ts Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { createMiddleware, SystemMessage, createAgent } from "langchain";

  const addContextMiddleware = createMiddleware({
    name: "AddContextMiddleware",
    wrapModelCall: async (request, handler) => {
      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(`Additional context.`),
      });
    },
  });

  const agent = createAgent({
    model: "ollama:north-mini-code-1.0",
    systemPrompt: "You are a helpful assistant.",
    middleware: [addContextMiddleware],
  });
  ```
</CodeGroup>

使用 [⟦T106⟧](https://reference.langchain.com/javascript/langchain-core/utils/stream/concat) 保留由其他中间件创建的缓存控制元数据或结构化内容块。

### 动态模型选择

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware, initChatModel } from "langchain";

const models = {
  complex: await initChatModel("claude-sonnet-4-6"),
  simple: await initChatModel("claude-haiku-4-5-20251001"),
};

const dynamicModelMiddleware = createMiddleware({
  name: "DynamicModelMiddleware",
  wrapModelCall: (request, handler) => {
    const modifiedRequest = { ...request };
    if (request.messages.length > 10) {
      modifiedRequest.model = models.complex;
    } else {
      modifiedRequest.model = models.simple;
    }
    return handler(modifiedRequest);
  },
});
```

### 动态选择工具在运行时选择相关工具以提高性能和准确性。本节介绍过滤预注册工具。有关注册在运行时发现的工具（例如，从 MCP 服务器），请参阅[Runtime tool registration](/oss/javascript/langchain/tools#dynamic-tool-selection)。

**好处：**

* **更短的提示** - 通过仅公开相关工具来降低复杂性
* **更高的准确性** - 模型从更少的选项中正确选择
* **权限控制** - 根据用户访问权限动态过滤工具

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, createMiddleware } from "langchain";

const toolSelectorMiddleware = createMiddleware({
  name: "ToolSelector",
  wrapModelCall: (request, handler) => {
    // Select a small, relevant subset of tools based on state/context
    const relevantTools = selectRelevantTools(request.state, request.runtime);
    const modifiedRequest = { ...request, tools: relevantTools };
    return handler(modifiedRequest);
  },
});

const agent = createAgent({
  model: "gpt-5.5",
  tools: allTools,
  middleware: [toolSelectorMiddleware],
});
```

### 工具调用监控

```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware } from "langchain";

const toolMonitoringMiddleware = createMiddleware({
  name: "ToolMonitoringMiddleware",
  wrapToolCall: (request, handler) => {
    console.log(`Executing tool: ${request.toolCall.name}`);
    console.log(`Arguments: ${JSON.stringify(request.toolCall.args)}`);
    try {
      const result = handler(request);
      console.log("Tool completed successfully");
      return result;
    } catch (e) {
      console.log(`Tool failed: ${e}`);
      throw e;
    }
  },
});
```

### 提示缓存（人为）

使用 Anthropic 模型时，使用带有缓存控制指令的结构化内容块来缓存大型系统提示：

<Tabs>
  <Tab title="Decorator">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
    from langchain.messages import SystemMessage
    from typing import Callable


    @wrap_model_call
    def add_cached_context(
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        # Always work with content blocks
        new_content = list(request.system_message.content_blocks) + [
            {
                "type": "text",
                "text": "Here is a large document to analyze:\n\n<document>...</document>",
                # content up until this point is cached
                "cache_control": {"type": "ephemeral"}
            }
        ]

        new_system_message = SystemMessage(content=new_content)
        return handler(request.override(system_message=new_system_message))
    ```
  </Tab>

  <Tab title="Class">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.agents.middleware import AgentMiddleware, ModelRequest, ModelResponse
    from langchain.messages import SystemMessage
    from typing import Callable


    class CachedContextMiddleware(AgentMiddleware):
        def wrap_model_call(
            self,
            request: ModelRequest,
            handler: Callable[[ModelRequest], ModelResponse],
        ) -> ModelResponse:
            # Always work with content blocks
            new_content = list(request.system_message.content_blocks) + [
                {
                    "type": "text",
                    "text": "Here is a large document to analyze:\n\n<document>...</document>",
                    "cache_control": {"type": "ephemeral"}  # This content will be cached
                }
            ]

            new_system_message = SystemMessage(content=new_content)
            return handler(request.override(system_message=new_system_message))
    ```
  </Tab>
</Tabs>

**注释：**

* `ModelRequest.system_message` 始终是 [⟦T108⟧](https://reference.langchain.com/javascript/langchain-core/messages/SystemMessage) 对象，即使代理是使用 `system_prompt="string"` 创建的
* 使用`SystemMessage.content_blocks`以块列表的形式访问内容，无论原始内容是字符串还是列表
* 修改系统消息时，使用`content_blocks`并附加新块以保留现有结构
* 您可以将 [⟦T112⟧](https://reference.langchain.com/javascript/langchain-core/messages/SystemMessage) 对象直接传递给 `create_agent` 的 `system_prompt` 参数，以实现缓存控制等高级用例

:::使用`ModelRequest`中的`systemMessage`字段修改中间件中的系统消息。它包含一个 [⟦T117⟧](https://reference.langchain.com/javascript/langchain-core/messages/SystemMessage) 对象（即使代理是使用字符串 [⟦T118⟧](https://reference.langchain.com/javascript/types/langchain.index.CreateAgentParams.html#systemprompt) 创建的）。

**示例：链接中间件** - 不同的中间件可以使用不同的方法：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createMiddleware, SystemMessage, createAgent } from "langchain";

// Middleware 1: Uses systemMessage with simple concatenation
const myMiddleware = createMiddleware({
  name: "MyMiddleware",
  wrapModelCall: async (request, handler) => {
    return handler({
      ...request,
      systemMessage: request.systemMessage.concat(`Additional context.`),
    });
  },
});

// Middleware 2: Uses systemMessage with structured content (preserves structure)
const myOtherMiddleware = createMiddleware({
  name: "MyOtherMiddleware",
  wrapModelCall: async (request, handler) => {
    return handler({
      ...request,
      systemMessage: request.systemMessage.concat(
        new SystemMessage({
          content: [
            {
              type: "text",
              text: " More additional context. This will be cached.",
              cache_control: { type: "ephemeral", ttl: "5m" },
            },
          ],
        })
      ),
    });
  },
});

const agent = createAgent({
  model: "google_genai:gemini-3.6-flash",
  systemPrompt: "You are a helpful assistant.",
  middleware: [myMiddleware, myOtherMiddleware],
});
```

生成的系统消息将是：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
new SystemMessage({
  content: [
    { type: "text", text: "You are a helpful assistant." },
    { type: "text", text: "Additional context." },
    {
        type: "text",
        text: " More additional context. This will be cached.",
        cache_control: { type: "ephemeral", ttl: "5m" },
    },
  ],
});
```

使用 [⟦T119⟧](https://reference.langchain.com/javascript/langchain-core/utils/stream/concat) 保留由其他中间件创建的缓存控制元数据或结构化内容块。

## 其他资源

* [Middleware API reference](https://reference.langchain.com/python/langchain/middleware/)
* [Built-in middleware](/oss/javascript/langchain/middleware/built-in)
* [Testing agents](/oss/javascript/langchain/test/)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/middleware/custom.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>