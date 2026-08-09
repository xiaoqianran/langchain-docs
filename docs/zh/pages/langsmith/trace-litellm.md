<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace LiteLLM applications | https://docs.langchain.com/langsmith/trace-litellm -->

# 跟踪 LiteLLM 应用程序

[LiteLLM](https://www.litellm.ai/) 使用一致的 OpenAI 兼容 API 提供统一的接口来调用 LLM 提供商。它可以用作直接嵌入应用程序中的[Python SDK](https://docs.litellm.ai/docs/#litellm-python-sdk)，也可以用作为客户端应用程序公开 OpenAI 兼容端点的[proxy server](https://docs.litellm.ai/docs/simple_proxy)。

本指南向您展示如何使用 LangSmith 跟踪 LiteLLM 调用：

* 用于应用程序级跟踪的 [LangSmith SDK](#use-langsmith_tracing-and-traceable) (`@traceable`)。
* [LiteLLM’s built-in langsmith callback](#log-litellm-call-with-the-langsmith-callback) 用于模型级日志记录。
* 用于网关级跟踪的[LiteLLM Proxy](#use-the-litellm-proxy)。

## 安装

使用 LiteLLM Python SDK 或 LiteLLM 代理时安装以下内容：

<CodeGroup>
  ```bash Python SDK theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install litellm langsmith openai
  ```

  ```bash Proxy usage theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install openai langsmith
  ```
</CodeGroup>

本指南中的示例使用 OpenAI 模型，但您可以为您的用例安装必要的提供程序。

## 使用 LiteLLM Python SDK

LiteLLM 支持两种将跟踪发送到 LangSmith 的方法，它们在不同的层上运行：* [LangSmith SDK tracing](#use-langsmith_tracing-and-traceable) 与 `LANGSMITH_TRACING=true` 通过 LangSmith SDK 启用应用程序级跟踪。当您想要跟踪更广泛的业务逻辑、多步骤管道或使用 `@traceable` 创建的跨度时，这非常有用。
* LiteLLM 的内置[⟦T16⟧ callback](#log-litellm-call-with-the-langsmith-callback) 直接从 LiteLLM 记录模型调用。当您想要专门跟踪 LiteLLM 请求或运行异步应用程序时，建议这样做。

<Note>
  避免为相同的 LiteLLM 调用启用 LiteLLM 的 `langsmith` 回调和 LangSmith 跟踪，因为这可能会导致重复的跟踪。
</Note>

### 使用`LANGSMITH_TRACING`和`traceable`

您可以将 `LANGSMITH_TRACING=true` 与 `@traceable` 一起使用，以在 LangSmith 中实现可预测的跟踪。此方法可确保 **Input** 和 **Output** 列反映您的函数参数和返回值，从而允许您保留完整的消息结构（包括 `role` 和 `content`）。它还可以在简单的同步脚本中可靠地工作，无需异步事件循环或额外的回调配置。

1. 设置以下环境变量以启用 LiteLLM Python SDK 使用的 LangSmith 跟踪：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY="your_api_key"
   export LANGSMITH_PROJECT="litellm-integration"
   export LANGSMITH_TRACING="true"
   ```

   在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-litellm) 中创建 LangSmith [API keys](/langsmith/create-account-api-key)。

   根据您使用的提供商，您还需要设置 API 密钥：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export OPENAI_API_KEY="your_openai_key"
   ```2. 将以下代码添加到脚本文件中：

   ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   from langsmith import traceable
   from litellm import completion

   @traceable(name="LiteLLM Chat Completion")
   def run(messages):
       response = completion(
           model="gpt-4o",
           messages=messages,
       )
       # Return the assistant message so the LangSmith UI shows role + content
       return response["choices"][0]["message"]

   messages = [
       {"role": "user", "content": "Explain observability in LLM systems."}
   ]

   result = run(messages)
   print(result["content"])
   ```

   `@traceable` 仪器您作为 LangSmith 运行的功能。当设置`LANGSMITH_TRACING=true`时，LangSmith自动：

   * 调用函数时创建运行。
   * 将函数参数记录为运行输入。
   * 执行函数体（包括LiteLLM调用）。
   * 记录函数的返回值作为运行输出。
   * 捕获时序、错误和嵌套跨度（如果有）。

   在此示例中，`messages`参数成为跟踪输入，返回的辅助消息对象成为跟踪输出。 LiteLLM 调用本身正常运行 - `@traceable` 用可观察性包装它，而不是修改其行为。这种方法跟踪您的应用程序逻辑，而不仅仅是模型调用。

   <Tip>
     有关使用 `@traceable` 的更一般示例，请参阅 [Custom instrumentation](/langsmith/annotate-code#use-@traceable-/-traceable) 页面。
   </Tip>

### 使用 `langsmith` 回调记录 LiteLLM 调用

LiteLLM 可以使用其内置的 [callback system](https://docs.litellm.ai/docs/observability/callbacks) 将跟踪直接发送到 LangSmith。当在异步 Python 服务中运行 LiteLLM 并且您希望 LiteLLM 本身发出模型级日志时，这非常有用。LiteLLM 回调在异步环境中运行。使用`litellm.acompletion()`进行异步调用时，您可以启用`langsmith`回调来记录成功的模型调用。

<Tip>
  这种方法最适合异步应用程序。对于简单的同步脚本，请使用[previous section](#use-langsmith_tracing-and-traceable)中所示的`@traceable`方法。
</Tip>

1. 设置以下环境变量：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY="your_api_key"
   export LANGSMITH_PROJECT="litellm-integration"
   ```

   在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-litellm) 中创建 LangSmith [API keys](/langsmith/create-account-api-key)。

   根据您使用的提供商，您还需要设置 API 密钥：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export OPENAI_API_KEY="your_openai_key"
   ```

2. 要在最小脚本中运行它：

   * 使用`acompletion()`（异步API）。
   * 使用 `asyncio.run(...)` 运行以创建事件循环。
   * 设置`langsmith_batch_size = 1`立即冲洗。

   ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   import asyncio
   import litellm
   from litellm import acompletion

   # Enable LiteLLM → LangSmith callback
   litellm.success_callback = ["langsmith"]

   # For short-lived scripts, send immediately instead of waiting for batch flush
   litellm.langsmith_batch_size = 1

   async def main():
       response = await acompletion(
           model="gpt-4o",
           messages=[
               {"role": "user", "content": "Explain observability in LLM systems."}
           ],
       )

       # Print the assistant message content for local verification
       print(response["choices"][0]["message"]["content"])

       # Allow time for background logger to flush before process exit
       await asyncio.sleep(1)

   if __name__ == "__main__":
       asyncio.run(main())
   ```

   该回调将 LiteLLM 的模型请求和响应数据直接发送到 LangSmith，包括提供者元数据和令牌使用情况。由于 LiteLLM 控制有效负载，因此与 `@traceable` 示例相比，**输入**和 **输出**列可能包含其他元数据。

## 使用 LiteLLM 代理

LiteLLM 代理作为独立服务器运行并公开 OpenAI 兼容的 API。

1. 要让代理日志请求直接发送到 LangSmith，请在 `config.yaml` 中配置回调：

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   model_list:
     - model_name: gpt-4o
       litellm_params:
         model: openai/gpt-4o

   litellm_settings:
     callbacks: ["langsmith"]
   ```

2. 在代理环境中设置环境变量：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY="your_api_key"
   export LANGSMITH_PROJECT="litellm-proxy"
   export OPENAI_API_KEY="your_openai_key"
   ```<Note>
     LiteLLM 代理作为单独的服务运行。如果在代理级别启用 LangSmith 跟踪，则必须在代理的运行时环境中配置 `LANGSMITH_API_KEY` 及相关环境变量。这些设置不会与您的应用程序进程共享。
   </Note>

3.启动代理：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   litellm --config config.yaml
   ```

   默认情况下，代理在`http://localhost:4000/v1`运行。您的应用程序使用任何 OpenAI 兼容客户端（Python、JavaScript、curl 等）调用它。

   启用`callbacks: ["langsmith"]`后，代理将模型请求和响应数据直接发送到LangSmith。客户端应用程序中不需要跟踪配置。

4. 从另一个终端窗口调用代理：

   <CodeGroup>
     ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     from openai import OpenAI

     client = OpenAI(
         base_url="http://localhost:4000/v1",
         api_key="anything"  # proxy may require a key but doesn't validate it by default
     )

     response = client.chat.completions.create(
         model="gpt-4o",
         messages=[
             {"role": "user", "content": "What is LiteLLM?"}
         ],
     )

     print(response.choices[0].message.content)
     ```

     ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     import OpenAI from "openai";

     const client = new OpenAI({
     apiKey: "anything",
     baseURL: "http://localhost:4000/v1",
     });

     const response = await client.chat.completions.create({
     model: "gpt-4o",
     messages: [
         { role: "user", content: "Explain LiteLLM tracing." }
     ],
     });

     console.log(response.choices[0].message.content);
     ```
   </CodeGroup>

   客户端发送正常的聊天完成请求，代理处理提供者路由和响应格式。

## 后续步骤

* [View traces in LangSmith](/langsmith/filter-traces-in-application)
* [Add custom metadata](/langsmith/ls-metadata-parameters)
* [Filter and sample traces](/langsmith/sample-traces)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-litellm.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>