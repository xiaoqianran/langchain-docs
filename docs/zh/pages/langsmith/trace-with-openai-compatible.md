<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace OpenAI-compatible providers | https://docs.langchain.com/langsmith/trace-with-openai-compatible -->

# 跟踪 OpenAI 兼容的提供商

跟踪从任何 OpenAI 兼容提供商到 LangSmith 的 LLM 调用。

许多 LLM 提供商接受与 OpenAI API 格式相同的请求。要跟踪从这些提供商到 LangSmith 的调用，请构造一个指向提供商的基本 URL 的 OpenAI 客户端，然后用 [⟦T7⟧](https://reference.langchain.com/python/langsmith/wrappers/_openai/wrap_openai) / [⟦T8⟧](https://reference.langchain.com/javascript/modules/langsmith.html) 包装它。

使用 `wrap_openai` / `wrapOpenAI` 进行直接 API 调用。当您需要跟踪调用周围的应用程序逻辑或设置每个调用的元数据时，请使用[⟦T11⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable)。

|                | `wrap_openai` / `wrapOpenAI` | `@traceable` / `traceable` |
| -------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
|代币追踪 |自动|需要 `run_type="llm"` ||运行类型| LLM（自动设置）|默认链 |
|痕迹| API 调用 |包装它的函数 |
|元数据|仅客户端级别 (Python)；客户端级别或每次调用 (TypeScript) |通过 [⟦T17⟧](https://reference.langchain.com/python/langsmith/run_helpers/SupportsLangsmithExtra) 每次通话 |

<Note>直接追踪OpenAI，参考[Trace OpenAI applications](/langsmith/trace-openai)。</Note>

## 设置

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langsmith openai
  ```

  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langsmith openai
  ```
</CodeGroup>

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your-api-key>
export LANGSMITH_TRACING=true
```

## 跟踪 API 调用

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  import openai
  from langsmith import wrappers

  client = wrappers.wrap_openai(
      openai.OpenAI(
          base_url="https://<provider-base-url>/v1",
          api_key=os.environ["PROVIDER_API_KEY"],
      )
  )

  completion = client.chat.completions.create(
      model="<provider-model-name>",
      messages=[{"role": "user", "content": "Hello!"}],
  )
  print(completion.choices[0].message.content)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";
  import { wrapOpenAI } from "langsmith/wrappers/openai";

  const client = wrapOpenAI(
    new OpenAI({
      baseURL: "https://<provider-base-url>/v1",
      apiKey: process.env.PROVIDER_API_KEY!,
    })
  );

  const completion = await client.chat.completions.create({
    model: "<provider-model-name>",
    messages: [{ role: "user", content: "Hello!" }],
  });
  console.log(completion.choices[0].message.content);
  ```
</CodeGroup>

## 添加元数据

<Tabs>
  <Tab title="Python">
    包装客户端时传递`tracing_extra`。元数据适用于与该客户端进行的所有调用。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import os

    import openai

    from langsmith import wrappers

    client = wrappers.wrap_openai(
        openai.OpenAI(
            base_url="https://<provider-base-url>/v1",
            api_key=os.environ["PROVIDER_API_KEY"],
        ),
        tracing_extra={"metadata": {"environment": "production"}},
    )
    ```
  </Tab>

  <Tab title="TypeScript">
    将选项作为第二个参数传递给 `wrapOpenAI` 以获取客户端级元数据，或在每次调用时传递 [⟦T20⟧](https://reference.langchain.com/javascript/modules/langsmith.html)。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import OpenAI from "openai";
    import { wrapOpenAI } from "langsmith/wrappers/openai";

    const client = wrapOpenAI(
      new OpenAI({
        baseURL: "https://<provider-base-url>/v1",
        apiKey: process.env.PROVIDER_API_KEY!,
      }),
      { metadata: { environment: "production" } }
    );

    // Per-call metadata
    const completion = await client.chat.completions.create(
      {
        model: "<provider-model-name>",
        messages: [{ role: "user", content: "Hello!" }],
      },
      { langsmithExtra: { metadata: { request_id: "abc123" } } }
    );
    ```
  </Tab>
</Tabs>

## 相关指南

一些提供商有专门的设置指南，使用 `@traceable` 或本机回调。这些方法在功能级别进行跟踪，而不是直接包装客户端，或者与提供商自己的 SDK 和路由层集成。* [DeepSeek](/langsmith/trace-deepseek)：兼容OpenAI的API；指南使用 `@traceable` 和自定义提供者元数据
* [LiteLLM](/langsmith/trace-litellm)：公开 OpenAI 兼容端点的代理；指南涵盖 `@traceable` 和 LiteLLM 的内置 LangSmith 回调

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-openai-compatible.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>