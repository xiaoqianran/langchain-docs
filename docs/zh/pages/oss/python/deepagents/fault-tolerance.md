<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fault tolerance | https://docs.langchain.com/oss/python/deepagents/fault-tolerance -->

# 容错能力

通过速率限制、重试、回退和错误处理，使您的深度代理具有弹性

当出现问题时，容错中间件可以让您的深度代理保持运行。并非所有错误都应该以相同的方式处理：瞬时故障（网络超时、速率限制）应该自动重试，LLM 可以恢复的错误（错误的工具输出、解析失败）应该反馈给模型，需要人工输入的错误应该暂停代理。

## 错误处理策略

不同的错误需要不同的处理策略：|错误类型 |谁修的|战略|中间件或功能 |
| - | - | - | - |
|瞬时错误（网络问题、速率限制）|系统（自动）|使用指数退避重试 | [ModelRetryMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_retry/ModelRetryMiddleware)、[ToolRetryMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_retry/ToolRetryMiddleware) |
| LLM 可恢复错误（工具故障、解析问题）|法学硕士 |转换为误差`ToolMessage`并让模型调整 | [ToolErrorMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_error/ToolErrorMiddleware) |
|模特拒绝|系统或开发者 |退回到另一个模型，然后捕获错误 | [ModelFallbackMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_fallback/ModelFallbackMiddleware)、[ModelRefusalMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_refusal/ModelRefusalMiddleware) |
|用户可修复的错误（信息缺失、说明不明确）|人类 |按 `interrupt()` 暂停 | [Human-in-the-loop](/oss/python/deepagents/human-in-the-loop) |
|供应商中断 |系统（自动）|退回到替代模型 | [ModelFallbackMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_fallback/ModelFallbackMiddleware) |
|过多的调用（失控循环）|系统（自动）|每次运行的模型和工具调用上限 | [ModelCallLimitMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_call_limit/ModelCallLimitMiddleware)、[ToolCallLimitMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_call_limit/ToolCallLimitMiddleware) |
|意外错误 |开发商|让它们冒泡|无中间件；让异常传播 |

以下部分通过代码示例介绍了每种策略。

> [选项卡] 瞬态错误
>
> 添加重试中间件以自动重试网络问题和速率限制。模型调用和工具调用都有自己的具有指数退避的重试中间件：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain.agents import create_agent
> from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
>
> agent = create_agent(
>     model="google_genai:gemini-3.6-flash",
>     tools=[search_tool, fetch_url_tool],
>     middleware=[
>         ModelRetryMiddleware(max_retries=3, backoff_factor=2.0, initial_delay=1.0),
>         ToolRetryMiddleware(
>             max_retries=2,
>             tools=["search", "fetch_url"],
>             retry_on=(TimeoutError, ConnectionError),
>         ),
>     ],
> )
> ```> [选项卡] LLM-可恢复
>
> 使用[ToolErrorMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_error/ToolErrorMiddleware)捕获工具异常并将其转换为错误`ToolMessage`，以便LLM可以看到出了什么问题并重试：
>
>> [!注意]
>>
>> `ToolErrorMiddleware` 需要 `langchain>=1.3.14`。
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain.agents import create_agent
> from langchain.agents.middleware import ToolErrorMiddleware
>
>
> def on_error(exc: Exception, request: ToolCallRequest) -> str | None:
>     if isinstance(exc, ValueError):
>         return f"Tool `{request.tool_call['name']}` failed: {type(exc).__name__}. Fix the input and retry."
>     # propagate everything else
>
>
> agent = create_agent(
>     model="google_genai:gemini-3.6-flash",
>     tools=[search_tool],
>     middleware=[ToolErrorMiddleware(on_error)],
> )
> ```

> [选项卡] 用户可修复
>
> 在需要时暂停并收集用户信息（例如帐户 ID、订单号或说明）。使用 `interrupt_on` 在特定工具调用之前暂停代理：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from deepagents import create_deep_agent
>
> agent = create_deep_agent(
>     model="google_genai:gemini-3.6-flash",
>     tools=[send_email_tool, delete_record_tool],
>     interrupt_on={
>         "send_email": True,
>         "delete_record": True,
>     },
> )
> ```
>
> 有关完整的人机交互指南，请参阅 [Human-in-the-loop](/oss/python/deepagents/human-in-the-loop)。

> [选项卡] 提供商中断
>
> 如果您的主要模型提供商完全瘫痪，请使用 [ModelFallbackMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_fallback/ModelFallbackMiddleware) 切换到替代模型：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain.agents import create_agent
> from langchain.agents.middleware import ModelFallbackMiddleware
>
> agent = create_agent(
>     model="google_genai:gemini-3.6-flash",
>     tools=[search_tool],
>     middleware=[
>         ModelFallbackMiddleware("gpt-5.5"),
>     ],
> )
> ```

> [tab] 过多的通话
>
> 如果没有限制，困惑的代理可以通过循环同一工具调用或进行数百个模型调用，在几分钟内耗尽您的 LLM API 预算。设置每次运行的模型调用和工具执行上限：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> from langchain.agents import create_agent
> from langchain.agents.middleware import ModelCallLimitMiddleware, ToolCallLimitMiddleware
>
> agent = create_agent(
>     model="google_genai:gemini-3.6-flash",
>     tools=[search_tool],
>     middleware=[
>         ModelCallLimitMiddleware(run_limit=50),
>         ToolCallLimitMiddleware(run_limit=200),
>     ],
> )
> ```

> [选项卡] 意外
>
> 让它们冒泡以进行调试。不要抓住你无法处理的东西。 [ToolErrorMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_error/ToolErrorMiddleware) 仅显示您明确返回内容的异常；其他一切都保持不变：
>
> ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> def on_error(exc: Exception, request: ToolCallRequest) -> str | None:
>     if isinstance(exc, (ValueError, KeyError)):
>         # Surface known, recoverable errors to the model
>         return f"Tool `{request.tool_call['name']}` failed: {type(exc).__name__}."
>     # Everything else (unexpected errors) propagates and halts the run
> ```

## 速率限制有两种互补的方法可以限制资源使用：控制模型提供程序的请求率，并限制每次运行的调用总数。

### 提供商速率限制

聊天模型提供程序对给定时间段内可以进行的调用数量施加限制。要控制发出请求的速率，请使用 `rate_limiter` 初始化模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.rate_limiters import InMemoryRateLimiter
from langchain.chat_models import init_chat_model

rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.1,  # 1 request every 10s
    check_every_n_seconds=0.1,  # Check every 100ms whether allowed to make a request
    max_bucket_size=10,  # Controls the maximum burst size
)

model = init_chat_model(
    model="google_genai:gemini-3.6-flash",
    rate_limiter=rate_limiter,  # [!code highlight]
)

agent = create_deep_agent(model=model, tools=[search_tool])
```

完整配置请参见[Rate limiting](/oss/python/langchain/models#rate-limiting)。

### 通话限制

如果没有限制，困惑的代理可以通过循环同一工具调用或进行数百个模型调用，在几分钟内耗尽您的 LLM API 预算。设置每次运行的模型调用和工具执行上限：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from langchain.agents.middleware import ModelCallLimitMiddleware, ToolCallLimitMiddleware

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    middleware=[
        ModelCallLimitMiddleware(run_limit=50),
        ToolCallLimitMiddleware(run_limit=200),
    ],
)
```

使用 `run_limit` 限制单次调用内的调用（每轮重置）。使用 `thread_limit` 限制整个对话中的呼叫（需要检查点）。完整配置请参见[ModelCallLimitMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_call_limit/ModelCallLimitMiddleware)和[ToolCallLimitMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_call_limit/ToolCallLimitMiddleware)。

## 重试

瞬时故障（网络超时、速率限制）应自动重试。模型调用和工具调用都有自己的具有指数退避的重试中间件：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    middleware=[
        # Retry model calls on rate limits, timeouts, and 5xx errors
        ModelRetryMiddleware(max_retries=3, backoff_factor=2.0, initial_delay=1.0),
        # Retry specific tools that hit external APIs (not all tools)
        ToolRetryMiddleware(
            max_retries=2,
            tools=["search", "fetch_url"],
            retry_on=(TimeoutError, ConnectionError),
        ),
    ],
)
```将 [ToolRetryMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_retry/ToolRetryMiddleware) 范围限定于特定工具，而不是重试所有内容。失败的文件系统`read_file`不会从重试中受益，但超时的网络搜索可能会受益。完整配置请参见[ModelRetryMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_retry/ModelRetryMiddleware)。

> [!注意]
>
> 主要集成包提出了标准异常类型（[ModelAuthenticationError](https://reference.langchain.com/python/langchain-core/exceptions/ModelAuthenticationError)、[ModelRateLimitError](https://reference.langchain.com/python/langchain-core/exceptions/ModelRateLimitError)、[ModelTimeoutError](https://reference.langchain.com/python/langchain-core/exceptions/ModelTimeoutError) 等），这些异常类型带有重试中间件默认遵循的 `is_retryable` 标志。完整列表请参见[Model exceptions](/oss/python/langchain/models#model-exceptions)。

## 后备方案

如果您的主要模型提供程序完全崩溃，后备中间件将切换到替代模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from langchain.agents.middleware import ModelFallbackMiddleware

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    middleware=[
        # If the primary model is fully down, fall back to an alternative
        ModelFallbackMiddleware("gpt-5.5"),
    ],
)
```

完整配置请参见[ModelFallbackMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/model_fallback/ModelFallbackMiddleware)。

### 模型拒绝

提供者可以拒绝请求（例如根据安全策略），但仍然返回成功的响应。当模型拒绝时，Deep Agents提高[⟦T22⟧](https://reference.langchain.com/python/langchain-core/exceptions/ModelRefusalError)，因此运行不会像成功一样结束。 [⟦T23⟧](https://reference.langchain.com/python/langchain/agents/middleware/model_refusal/ModelRefusalMiddleware) 在中间件之后运行，因此您传递的 [⟦T24⟧](https://reference.langchain.com/python/langchain/agents/middleware/model_fallback/ModelFallbackMiddleware) 首先会在下一个模型上重试被拒绝的请求，并且仅当没有留下后备时才会引发运行。后备模型可以来自同一个提供商，也可以来自不同的提供商，并且它仍然可以拒绝相同的请求。

模型级 `with_fallbacks` 不会捕获拒绝，因为中间件在模型调用返回后检测到它们。请改用[⟦T26⟧](https://reference.langchain.com/python/langchain/agents/middleware/model_fallback/ModelFallbackMiddleware)。当每个模型都拒绝时，在调用代理的地方捕获`ModelRefusalError`。拒绝的回复不会保存到线程中，因此您可以告诉用户并继续对话。对于此选项和其他选项，请参阅[Handle a refusal](/oss/python/langchain/middleware/built-in#handle-a-refusal)。有关子代理拒绝如何到达父代理的信息，请参阅[Model refusals](/oss/python/deepagents/subagents#model-refusals)。

## 错误处理

当工具在执行期间引发异常时，代理运行默认停止。使用 [ToolErrorMiddleware](https://reference.langchain.com/python/langchain/agents/middleware/tool_error/ToolErrorMiddleware) 捕获特定异常并将其转换为模型可以看到并从中恢复的错误 ToolMessage，而不是使运行崩溃。

> [!注意]
>
> `ToolErrorMiddleware` 需要 `langchain>=1.3.14`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from langchain.agents.middleware import ToolErrorMiddleware


def on_error(exc: Exception, request: ToolCallRequest) -> str | None:
    if isinstance(exc, ValueError):
        return f"`{request.tool_call['name']}` failed with {type(exc).__name__}."
    # propagate everything else


agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    middleware=[ToolErrorMiddleware(on_error)],
)
```

有关完整的配置选项和使用模式，包括异步处理程序和使用重试中间件进行组合，请参阅[Prebuilt middleware](/oss/python/langchain/middleware/built-in#tool-error)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/fault-tolerance.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。