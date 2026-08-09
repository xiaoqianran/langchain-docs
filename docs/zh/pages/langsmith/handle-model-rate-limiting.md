<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to handle model rate limits | https://docs.langchain.com/langsmith/handle-model-rate-limiting -->

# 如何处理模型速率限制

运行大型评估作业时的一个常见问题是遇到第三方 API 速率限制（通常来自模型提供商）。有几种方法可以处理速率限制。

## 使用 `langchain` RateLimiters（仅限 Python）

如果您在应用程序或评估器中使用 `langchain` Python 聊天模型，您可以向模型添加速率限制器，这将添加客户端对向模型提供程序 API 发送请求的频率的控制，以避免速率限制错误。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model
from langchain.rate_limiters import InMemoryRateLimiter

rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.1,  # <-- Super slow! We can only make a request once every 10 seconds!!
    check_every_n_seconds=0.1,  # Wake up every 100 ms to check whether allowed to make a request,
    max_bucket_size=10,  # Controls the maximum burst size.
)

model = init_chat_model("gpt-5.5", rate_limiter=rate_limiter)

def app(inputs: dict) -> dict:
    response = model.invoke(...)
    ...

def evaluator(inputs: dict, outputs: dict, reference_outputs: dict) -> dict:
    response = model.invoke(...)
    ...
```

有关如何配置速率限制器的更多信息，请参阅 [⟦T7⟧](/oss/python/langchain/models#rate-limiting) 文档。

## 使用指数退避重试

处理速率限制错误的一种非常常见的方法是使用指数退避重试。使用指数退避重试意味着重复重试失败的请求，每次重试之间的等待时间（呈指数）增加。这将持续到请求成功或发出最大数量的请求为止。

#### 与 `langchain`

如果您使用 `langchain` 组件，您可以使用 `.with_retry(...)` / `.withRetry()` 方法向所有模型调用添加重试：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain import init_chat_model

  model_with_retry = init_chat_model("gpt-5.4-mini").with_retry(stop_after_attempt=6)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { initChatModel } from "langchain";

  const model = await initChatModel("gpt-5.5", {
      modelProvider: "openai",
  });

  const modelWithRetry = model.withRetry({ stopAfterAttept: 2 });
  ```
</CodeGroup>

有关更多信息，请参阅 `langchain` [Python](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.BaseChatModel.with_retry) 和 [JS](https://reference.langchain.com/javascript/langchain-core/language_models/chat_models/BaseChatModel/withRetry) API 参考。

#### 没有`langchain`如果您不使用 `langchain`，您可以使用其他库，如 `tenacity` (Python) 或 `backoff` (Python) 来实现指数退避重试，或者您可以从头开始实现。请参阅 [OpenAI docs](https://platform.openai.com/docs/guides/rate-limits#retrying-with-exponential-backoff) 中有关如何执行此操作的一些示例。

## 限制`max_concurrency`

限制对应用程序和评估器进行的并发调用的数量是降低模型调用频率的另一种方法，从而避免速率限制错误。 `max_concurrency` 可直接在[evaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._runner.evaluate) / [aevaluate()](https://docs.smith.langchain.com/reference/python/evaluation/langsmith.evaluation._arunner.aevaluate) 功能上设置。这通过有效地将数据集跨线程分割来并行化评估。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import aevaluate

  results = await aevaluate(
      ...
      max_concurrency=4,
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { evaluate } from "langsmith/evaluation";

  await evaluate(..., {
    ...,
    maxConcurrency: 4,
  });
  ```
</CodeGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/handle-model-rate-limiting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>