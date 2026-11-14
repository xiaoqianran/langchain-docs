<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fault tolerance | https://docs.langchain.com/oss/javascript/deepagents/fault-tolerance -->

# 容错能力

通过速率限制、重试、回退和错误处理，使您的深度代理具有弹性

当出现问题时，容错中间件可以让您的深度代理保持运行。并非所有错误都应该以相同的方式处理：瞬时故障（网络超时、速率限制）应该自动重试，LLM 可以恢复的错误（错误的工具输出、解析失败）应该反馈给模型，需要人工输入的错误应该暂停代理。

## 错误处理策略

不同的错误需要不同的处理策略：

|错误类型 |谁修的|战略|中间件或功能 |
| - | - | - | - |
|瞬时错误（网络问题、速率限制）|系统（自动）|使用指数退避重试 | [ModelRetryMiddleware](https://reference.langchain.com/javascript/langchain/index/modelRetryMiddleware)、[ToolRetryMiddleware](https://reference.langchain.com/javascript/langchain/index/toolRetryMiddleware) |

\|模特拒绝|系统或开发者|退回到另一个模型，然后捕获错误 | [modelFallbackMiddleware](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware)、[modelRefusalMiddleware](https://reference.langchain.com/javascript/langchain/index/modelRefusalMiddleware) |\|用户可修复的错误（信息缺失、说明不明确）|人类 |按 `interrupt()` 暂停 | [Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop) |
\|供应商中断 |系统（自动）|退回到替代模型 | [ModelFallbackMiddleware](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware) |
\|过多的调用（失控循环）|系统（自动）|每次运行的模型和工具调用上限 | [ModelCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/modelCallLimitMiddleware)、[ToolCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/toolCallLimitMiddleware) |
\|意外错误 |开发商 |让它们冒泡|无中间件；让异常传播 |

以下部分通过代码示例介绍了每种策略。

> [选项卡] 瞬态错误
>
> 添加重试中间件以自动重试网络问题和速率限制。模型调用和工具调用都有自己的具有指数退避的重试中间件：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createAgent, modelRetryMiddleware, toolRetryMiddleware } from "langchain";
>
> const agent = createAgent({
>   model: "google:gemini-4-hydrogen",
>   tools: [searchTool, fetchUrlTool],
>   middleware: [
>     modelRetryMiddleware({ maxRetries: 3, backoffFactor: 2.0, initialDelayMs: 1000 }),
>     toolRetryMiddleware({
>       maxRetries: 2,
>       tools: ["search", "fetch_url"],
>       retryOn: [TimeoutError, TypeError],
>     }),
>   ],
> });
> ```

> [选项卡] 用户可修复
>
> 在需要时暂停并收集用户信息（例如帐户 ID、订单号或说明）。使用 `interrupt_on` 在特定工具调用之前暂停代理：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createDeepAgent } from "deepagents";
>
> const agent = createDeepAgent({
>   model: "google:gemini-4-hydrogen",
>   tools: [sendEmailTool, deleteRecordTool],
>   interruptOn: {
>     send_email: true,
>     delete_record: true,
>   },
> });
> ```
>
> 有关完整的人机交互指南，请参阅 [Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop)。

> [选项卡] 提供商中断
>
> 如果您的主要模型提供商完全瘫痪，请使用 [ModelFallbackMiddleware](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware) 切换到替代模型：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createAgent, modelFallbackMiddleware } from "langchain";
>
> const agent = createAgent({
>   model: "google:gemini-4-hydrogen",
>   tools: [searchTool],
>   middleware: [
>     modelFallbackMiddleware("gpt-6.1-sol"),
>   ],
> });
> ```> [tab] 过多的通话
>
> 如果没有限制，困惑的代理可以通过循环同一工具调用或进行数百个模型调用，在几分钟内耗尽您的 LLM API 预算。设置每次运行的模型调用和工具执行上限：
>
> ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";
>
> const agent = createAgent({
>   model: "google:gemini-4-hydrogen",
>   tools: [searchTool],
>   middleware: [
>     modelCallLimitMiddleware({ runLimit: 50 }),
>     toolCallLimitMiddleware({ runLimit: 200 }),
>   ],
> });
> ```

> [选项卡] 意外
>
> 让它们冒泡以进行调试。不要抓住你无法处理的东西。此模式也适用于 JavaScript SDK 中的自定义中间件。

## 速率限制

有两种互补的方法可以限制资源使用：控制模型提供程序的请求率，并限制每次运行的调用总数。

### 提供商速率限制

聊天模型提供程序对给定时间段内可以进行的调用数量施加限制。要控制发出请求的速率，请使用 `rate_limiter` 初始化模型：

### 通话限制

如果没有限制，困惑的代理可以通过循环同一工具调用或进行数百个模型调用，在几分钟内耗尽您的 LLM API 预算。设置每次运行的模型调用和工具执行上限：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";

const agent = createAgent({
  model: "google:gemini-4-hydrogen",
  middleware: [
    modelCallLimitMiddleware({ runLimit: 50 }),
    toolCallLimitMiddleware({ runLimit: 200 }),
  ],
});
```使用 `run_limit` 限制单次调用内的调用（每轮重置）。使用 `thread_limit` 限制整个对话中的呼叫（需要检查点）。完整配置请参见[ModelCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/modelCallLimitMiddleware)和[ToolCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/toolCallLimitMiddleware)。

## 重试

瞬时故障（网络超时、速率限制）应自动重试。模型调用和工具调用都有自己的具有指数退避的重试中间件：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  createAgent,
  modelRetryMiddleware,
  toolRetryMiddleware,
} from "langchain";

const agent = createAgent({
  model: "google:gemini-4-hydrogen",
  middleware: [
    // Retry model calls on rate limits, timeouts, and 5xx errors
    modelRetryMiddleware({ maxRetries: 3, backoffFactor: 2.0, initialDelayMs: 1000 }),
    // Retry specific tools that hit external APIs (not all tools)
    toolRetryMiddleware({
      maxRetries: 2,
      tools: ["search", "fetch_url"],
      retryOn: [TimeoutError, TypeError],
    }),
  ],
});
```

将 [ToolRetryMiddleware](https://reference.langchain.com/javascript/langchain/index/toolRetryMiddleware) 范围扩展到特定工具，而不是重试所有内容。失败的文件系统`read_file`不会从重试中受益，但超时的网络搜索可能会受益。完整配置请参见[ModelRetryMiddleware](https://reference.langchain.com/javascript/langchain/index/modelRetryMiddleware)。

## Fallbacks

如果您的主要模型提供程序完全崩溃，后备中间件将切换到替代模型：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  createAgent,
  modelFallbackMiddleware,
} from "langchain";

const agent = createAgent({
  model: "google:gemini-4-hydrogen",
  middleware: [
    // If the primary model is fully down, fall back to an alternative
    modelFallbackMiddleware("gpt-6.1-sol"),
  ],
});
```

完整配置请参见[ModelFallbackMiddleware](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware)。

### Model refusals提供者可以拒绝请求（例如根据安全策略），但仍然返回成功的响应。当模型拒绝时，Deep Agents抛出[⟦T13⟧](https://reference.langchain.com/javascript/langchain-core/errors/ModelRefusalError)，因此即使是拒绝，运行看起来也不像成功的运行。 [⟦T14⟧](https://reference.langchain.com/javascript/langchain/index/modelRefusalMiddleware) 在您的中间件之后运行。因此，您通过的 [⟦T15⟧](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware) 首先在下一个模型上重试被拒绝的请求。仅当没有后备措施时，运行才会抛出。后备模型可以来自同一提供商或不同的提供商，并且它仍然可以拒绝相同的请求。

模型级`withFallbacks`不会捕获拒绝，因为中间件在模型调用返回后检测到它们。请使用 [⟦T17⟧](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware) 代替。

当每个模型都拒绝时，在调用代理的地方捕获`ModelRefusalError`。拒绝的回复不会保存到线程中，因此您可以告诉用户并继续对话。对于此选项和其他选项，请参阅[Handle a refusal](/oss/javascript/langchain/middleware/built-in#handle-a-refusal)。有关子代理拒绝如何到达父代理的信息，请参阅[Model refusals](/oss/javascript/deepagents/subagents#model-refusals)。

> [!注意]
>
> 默认情况下抛出模型拒绝需要 `deepagents>=1.16.4`。

## 错误处理

当工具在执行期间引发异常时，代理运行默认停止。 JavaScript SDK 中尚不提供 `ToolErrorMiddleware`。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/fault-tolerance.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。