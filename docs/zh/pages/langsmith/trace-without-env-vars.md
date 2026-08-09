<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace without setting environment variables | https://docs.langchain.com/langsmith/trace-without-env-vars -->

# 不设置环境变量进行跟踪

以下环境变量允许您配置启用的跟踪、API 端点、API 密钥和跟踪项目：

* `LANGSMITH_TRACING`
* `LANGSMITH_API_KEY`
* `LANGSMITH_ENDPOINT`
* `LANGSMITH_PROJECT`

如果您需要使用自定义配置跟踪运行，在不支持典型环境变量（例如 Cloudflare Workers）的环境中工作，或者不想依赖环境变量，LangSmith 允许您以编程方式配置跟踪。

<Warning>
  在 [Python SDK](/langsmith/smith-python-sdk) 版本 **0.1.95** 中，`with trace` 遵循 `LANGSMITH_TRACING` 环境变量。详情请参阅[release notes](https://github.com/langchain-ai/langsmith-sdk/releases/tag/v0.1.95)。要在不设置环境变量的情况下禁用或启用跟踪，请使用 `with tracing_context` 上下文管理器，如以下示例所示。
</Warning>

* Python：在 Python 中执行此操作的推荐方法是使用 [⟦T9⟧](/langsmith/annotate-code#use-the-trace-context-manager-python-only) 上下文管理器。这适用于用 `traceable` 注释的代码和 `trace` 上下文管理器中的代码。
* TypeScript：您可以将客户端和 `tracingEnabled` 标志传递给 [⟦T13⟧](https://reference.langchain.com/javascript/langsmith/traceable) 装饰器。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import openai
  from langsmith import Client, tracing_context, traceable
  from langsmith.wrappers import wrap_openai

  langsmith_client = Client(
    api_key="YOUR_LANGSMITH_API_KEY",  # This can be retrieved from a secrets manager
    api_url="https://api.smith.langchain.com",  # Update appropriately for self-hosted installations or regional SaaS
    workspace_id="YOUR_WORKSPACE_ID", # Must be specified for API keys scoped to multiple workspaces
  )

  client = wrap_openai(openai.Client())

  @traceable(run_type="tool", name="Retrieve Context")
  def my_tool(question: str) -> str:
    return "During this morning's meeting, we solved all world conflict."

  @traceable
  def chat_pipeline(question: str):
    context = my_tool(question)
    messages = [
        { "role": "system", "content": "You are a helpful assistant. Please respond to the user's request only based on the given context." },
        { "role": "user", "content": f"Question: {question}\nContext: {context}"}
    ]
    chat_completion = client.chat.completions.create(
        model="gpt-5.4-mini", messages=messages
    )
    return chat_completion.choices[0].message.content

  # Can set to False to disable tracing here without changing code structure
  with tracing_context(enabled=True):
    # Use langsmith_extra to pass in a custom client
    chat_pipeline("Can you summarize this morning's meetings?", langsmith_extra={"client": langsmith_client})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";
  import { traceable } from "langsmith/traceable";
  import { wrapOpenAI } from "langsmith/wrappers";
  import { OpenAI } from "openai";

  const client = new Client({
      apiKey: "YOUR_API_KEY",  // This can be retrieved from a secrets manager
      apiUrl: "https://api.smith.langchain.com",  // Update appropriately for self-hosted installations or regional SaaS
  });

  const openai = wrapOpenAI(new OpenAI());

  const tool = traceable((question: string) => {
      return "During this morning's meeting, we solved all world conflict.";
  }, { name: "Retrieve Context", runType: "tool" });

  const pipeline = traceable(
      async (question: string) => {
          const context = await tool(question);

          const completion = await openai.chat.completions.create({
              model: "gpt-5.4-mini",
              messages: [
                  { role: "system" as const, content: "You are a helpful assistant. Please respond to the user's request only based on the given context." },
                  { role: "user" as const, content: `Question: ${question}\nContext: ${context}`}
              ]
          });

          return completion.choices[0].message.content;
      },
      { name: "Chat", client, tracingEnabled: true }
  );

  await pipeline("Can you summarize this morning's meetings?");
  ```
</CodeGroup>

如果您更喜欢视频教程，请查看 LangSmith 简介课程中的[Alternative Ways to Trace video](https://academy.langchain.com/pages/intro-to-langsmith-preview)。

＃＃ 有关的如果您需要根据运行时条件（例如客户端要求、数据敏感性或合规性策略）动态启用或禁用跟踪，请参阅[Conditional tracing](/langsmith/conditional-tracing)获取示例。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-without-env-vars.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>