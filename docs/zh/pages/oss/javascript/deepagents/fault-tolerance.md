<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fault tolerance | https://docs.langchain.com/oss/javascript/deepagents/fault-tolerance -->

# 容错能力

通过速率限制、重试、回退和错误处理，使您的深度代理具有弹性

当出现问题时，容错中间件可以让您的深度代理保持运行。并非所有错误都应该以相同的方式处理：瞬时故障（网络超时、速率限制）应该自动重试，LLM 可以恢复的错误（错误的工具输出、解析失败）应该反馈给模型，需要人工输入的错误应该暂停代理。

## 错误处理策略

不同的错误需要不同的处理策略：|错误类型 |谁修的|战略|中间件或功能 |
| --------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|瞬时错误（网络问题、速率限制）|系统（自动）|使用指数退避重试 | [ModelRetryMiddleware](https://reference.langchain.com/javascript/langchain/index/modelRetryMiddleware)、[ToolRetryMiddleware](https://reference.langchain.com/javascript/langchain/index/toolRetryMiddleware) || LLM 可恢复错误（工具故障、解析问题）|法学硕士 |转换为误差`ToolMessage`并让模型调整 | @\[工具错误中间件] |
|用户可修复的错误（信息缺失、说明不明确）|人类 |按 `interrupt()` 暂停 | [Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop) |
|供应商中断 |系统（自动）|退回到替代模型 | [ModelFallbackMiddleware](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware) |
|过多的调用（失控循环）|系统（自动）|每次运行的模型和工具调用上限 | [ModelCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/modelCallLimitMiddleware)、[ToolCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/toolCallLimitMiddleware) ||意外错误 |开发商 |让它们冒泡|没有中间件——让异常传播 |

以下部分通过代码示例介绍了每种策略。

<Tabs>
  <Tab title="Transient errors" icon="rotate">
    添加重试中间件以自动重试网络问题和速率限制。模型调用和工具调用都有自己的具有指数退避的重试中间件：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createAgent, modelRetryMiddleware, toolRetryMiddleware } from "langchain";

    const agent = createAgent({
      model: "google_genai:gemini-3.6-flash",
      tools: [searchTool, fetchUrlTool],
      middleware: [
        modelRetryMiddleware({ maxRetries: 3, backoffFactor: 2.0, initialDelayMs: 1000 }),
        toolRetryMiddleware({
          maxRetries: 2,
          tools: ["search", "fetch_url"],
          retryOn: [TimeoutError, TypeError],
        }),
      ],
    });
    ```
  </Tab>

  <Tab title="LLM-recoverable" icon="brain">
    使用@\[ToolErrorMiddleware]捕获工具异常并将其转换为错误`ToolMessage`s，以便LLM可以看到出了什么问题并重试：

    JavaScript SDK 中尚不提供此中间件。
  </Tab>

  <Tab title="User-fixable" icon="user">
    需要时暂停并收集用户信息（例如帐户 ID、订单号或说明）。使用 `interrupt_on` 在特定工具调用之前暂停代理：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createDeepAgent } from "deepagents";

    const agent = createDeepAgent({
      model: "google_genai:gemini-3.6-flash",
      tools: [sendEmailTool, deleteRecordTool],
      interruptOn: {
        send_email: true,
        delete_record: true,
      },
    });
    ```

    有关完整的人机交互指南，请参阅[Human-in-the-loop](/oss/javascript/deepagents/human-in-the-loop)。
  </Tab><Tab title="Provider outage" icon="arrows-exchange">
    如果您的主要模型提供商完全崩溃，请使用 [ModelFallbackMiddleware](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware) 切换到替代模型：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createAgent, modelFallbackMiddleware } from "langchain";

    const agent = createAgent({
      model: "google_genai:gemini-3.6-flash",
      tools: [searchTool],
      middleware: [
        modelFallbackMiddleware("gpt-5.5"),
      ],
    });
    ```
  </Tab>

  <Tab title="Excessive calls" icon="gauge">
    如果没有限制，困惑的代理可以通过循环同一工具调用或进行数百个模型调用，在几分钟内耗尽您的 LLM API 预算。设置每次运行的模型调用和工具执行上限：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";

    const agent = createAgent({
      model: "google_genai:gemini-3.6-flash",
      tools: [searchTool],
      middleware: [
        modelCallLimitMiddleware({ runLimit: 50 }),
        toolCallLimitMiddleware({ runLimit: 200 }),
      ],
    });
    ```
  </Tab>

  <Tab title="Unexpected" icon="alert-triangle">
    让它们冒泡进行调试。不要抓住你无法处理的东西。 @\[ToolErrorMiddleware] 仅显示您显式返回内容的异常；其他一切都保持不变：

    此模式也适用于 JavaScript SDK 中的自定义中间件。
  </Tab>
</Tabs>

## 速率限制

有两种互补的方法可以限制资源使用：控制模型提供程序的请求率，以及限制每次运行的调用总数。

### 提供商速率限制

聊天模型提供程序对给定时间段内可以进行的调用数量施加限制。要控制发出请求的速率，请使用 `rate_limiter` 初始化模型：

### 通话限制如果没有限制，困惑的代理可以通过循环同一工具调用或进行数百个模型调用，在几分钟内耗尽您的 LLM API 预算。设置每次运行的模型调用和工具执行上限：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";

const agent = createAgent({
  model: "google_genai:gemini-3.6-flash",
  middleware: [
    modelCallLimitMiddleware({ runLimit: 50 }),
    toolCallLimitMiddleware({ runLimit: 200 }),
  ],
});
```

使用 `run_limit` 限制单次调用内的调用（每轮重置）。使用 `thread_limit` 限制整个对话中的呼叫（需要检查点）。完整配置请参见[ModelCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/modelCallLimitMiddleware)和[ToolCallLimitMiddleware](https://reference.langchain.com/javascript/langchain/index/toolCallLimitMiddleware)。

## 重试

瞬时故障（网络超时、速率限制）应自动重试。模型调用和工具调用都有自己的具有指数退避的重试中间件：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  createAgent,
  modelRetryMiddleware,
  toolRetryMiddleware,
} from "langchain";

const agent = createAgent({
  model: "google_genai:gemini-3.6-flash",
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

## 后备方案

如果您的主要模型提供程序完全崩溃，后备中间件将切换到替代模型：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import {
  createAgent,
  modelFallbackMiddleware,
} from "langchain";

const agent = createAgent({
  model: "google_genai:gemini-3.6-flash",
  middleware: [
    // If the primary model is fully down, fall back to an alternative
    modelFallbackMiddleware("gpt-5.5"),
  ],
});
```

完整配置请参见[ModelFallbackMiddleware](https://reference.langchain.com/javascript/langchain/index/modelFallbackMiddleware)。

## 错误处理当工具在执行期间引发异常时，代理运行默认停止。使用 @\[ToolErrorMiddleware] 捕获特定异常并将其转换为模型可以看到并从中恢复的错误 ToolMessage，而不是使运行崩溃。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/fault-tolerance.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>