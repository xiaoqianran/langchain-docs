<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log user feedback using the SDK | https://docs.langchain.com/langsmith/attach-user-feedback -->

# 使用 SDK 记录用户反馈

LangSmith 可以轻松地将 [feedback](/langsmith/observability-concepts#feedback) 连接到 [traces](/langsmith/observability-concepts#traces)。这种反馈可以来自用户、注释者、自动评估者等，这对于监控和评估应用程序至关重要。

本页详细介绍了如何使用 [SDK](/langsmith/reference) 记录反馈。反馈对象的结构参见[Feedback data format](/langsmith/feedback-data-format)。

## 使用 `create_feedback()` / `createFeedback`

<Info>
  **儿童跑步**
  您可以将用户反馈附加到跟踪的**任何**子运行，而不仅仅是跟踪（根运行）本身。
  这对于批评 LLM 申请的特定步骤非常有用，例如 RAG 管道的检索步骤或生成步骤。
</Info>

<Tip>
  **非阻塞创建（仅限 Python）**
  如果您将 `trace_id=` 传递给 [⟦T5⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback)，Python 客户端将自动在后台创建反馈。
  这对于低延迟环境至关重要，您希望确保应用程序在创建反馈时不会被阻止。
</Tip>

以下示例创建具有两个子运行的跟踪，然后记录针对根运行和其中一个子运行的反馈。 TypeScript 片段显示了等效的 `createFeedback` 调用形式，假设您的应用程序已提供 `runId`。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client, trace, traceable

  @traceable
  def foo(x):
      return {"y": x * 2}

  @traceable
  def bar(y):
      return {"z": y - 1}

  client = Client()

  inputs = {"x": 1}
  with trace(name="foobar", inputs=inputs) as root_run:
      result = foo(**inputs)
      result = bar(**result)
      root_run.outputs = result
      trace_id = root_run.id
      child_runs = root_run.child_runs

  # Resolve the UUID of the project that owns the trace
  session_id = client.create_project(project_name=root_run.session_name, upsert=True).id

  # Provide feedback for a trace (a.k.a. a root run)
  client.create_feedback(
      key="user_feedback",
      score=1,
      trace_id=trace_id,
      session_id=session_id,
      comment="the user said that ..."
  )

  # Provide feedback for a child run
  foo_run_id = [run for run in child_runs if run.name == "foo"][0].id
  client.create_feedback(
      key="correctness",
      score=0,
      run_id=foo_run_id,
      # trace_id= is optional but recommended to enable batched and backgrounded
      # feedback ingestion.
      trace_id=trace_id,
      session_id=session_id,
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";
  const client = new Client();

      // ... Run your application and get the run_id...
      // This information can be the result of a user-facing feedback form

  // Resolve the UUID of the project that owns the trace
  const { id: sessionId } = await client.createProject({ projectName: "default", upsert: true });

  await client.createFeedback({
      runId,
      sessionId,
      key: "feedback-key",
      score: 1.0,
      comment: "comment",
  });
  ```
</CodeGroup>您甚至可以使用 [⟦T8⟧](https://reference.langchain.com/python/langsmith/client/Client/create_feedback) / [⟦T9⟧](https://reference.langchain.com/javascript/classes/langsmith.client.Client.html#createfeedback) 记录正在进行的运行的反馈。请参阅 [Access the current run (span) within a traced function](/langsmith/access-current-span) 了解如何获取正在进行的运行的运行 ID。

## 收集客户端应用程序的反馈

如果您需要在不公开 API 密钥的情况下从浏览器或其他客户端环境收集反馈，请使用**预签名反馈令牌**。它们会生成一个范围为特定运行和反馈密钥的 URL，客户端可以直接调用该 URL。

完整指南请参阅[Collect feedback with presigned URLs](/langsmith/presigned-feedback-tokens)。

要了解有关如何根据各种属性（包括用户反馈）过滤跟踪的更多信息，请参阅[Filter traces](/langsmith/filter-traces-in-application)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/attach-user-feedback.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>