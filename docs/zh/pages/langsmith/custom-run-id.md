<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Specify a custom run ID | https://docs.langchain.com/langsmith/custom-run-id -->

# 指定自定义运行ID

默认情况下，LangSmith为每个[run](/langsmith/observability-concepts#runs)分配一个随机ID。当您需要时，您可以使用自定义 ID 覆盖它：

- 提前知道运行 ID（例如，运行后立即附加 [feedback](/langsmith/observability-concepts#feedback)）。
- 将 LangSmith 运行与外部系统的 ID 相关联。
- 通过重用确定性 ID 使运行幂等。

<Note>
我们建议使用 **UUID v7** 自定义运行 ID。 UUIDv7 嵌入了时间戳，可保留跟踪中运行的正确时间顺序。目前传递非 UUIDv7 ID 会发出警告，未来版本将要求这样做。

[LangSmith SDK](/langsmith/reference) 导出 `uuid7` 帮助器（Python v0.4.43+、JS v0.3.80+）：

- **Python**：`from langsmith import uuid7`
- **JS/TS**：`import { uuid7 } from 'langsmith'`
</Note>

接受任何 UUID v7 字符串。您可以传递由 LangSmith SDK 帮助程序生成的标识符，或者如果您的系统已使用 UUID v7 标识符，则可以传递您自己的标识符。

<Tabs>
  <Tab title="Python">
    ### 使用`@traceable`

    调用 [⟦T9⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 函数时，在 `langsmith_extra` 内传递 `run_id`：

    ```python Python
    from langsmith import traceable, uuid7

    @traceable
    def my_pipeline(question: str) -> str:
        return "answer"

    run_id = uuid7()
    my_pipeline("What is the capital of France?", langsmith_extra={"run_id": run_id})

    # run_id can now be used to attach feedback, query the run, etc.
    ```

    ### 使用`trace`上下文管理器

    将 `run_id` 直接传递给 [trace](https://reference.langchain.com/python/langsmith/run_helpers/trace) 上下文管理器构造函数以设置该跟踪块的 ID：

    ```python Python
    from langsmith import trace, uuid7

    run_id = uuid7()

    with trace("my-pipeline", run_id=run_id) as run:
        result = "answer"
        run.end(outputs={"result": result})

    # run_id can now be used to attach feedback, query the run, etc.
    ```
  </Tab>
  <Tab title="TypeScript">
    ### 使用`traceable`

    在传递给[⟦T14⟧](https://reference.langchain.com/javascript/langsmith/traceable/traceable)的配置对象中传递`id`：

    ```typescript TypeScript
    import { traceable } from "langsmith/traceable";
    import { uuid7 } from "langsmith";

    const runId = uuid7();

    const myPipeline = traceable(
      async (question: string) => {
        return "answer";
      },
      { name: "my-pipeline", id: runId }
    );

    await myPipeline("What is the capital of France?");

    // runId can now be used to attach feedback, query the run, etc.
    ```

  </Tab>
</Tabs>## 相关

- [Attach user feedback](/langsmith/attach-user-feedback)：预先指定运行 ID 的常见用例。
- [Access the current run (span) within a traced function](/langsmith/access-current-span)：从跟踪内部读取自动分配的 ID。
- [Trace with the LangSmith API](/langsmith/trace-with-api)：用于指定运行 ID 的低级 API 方法。
- [Trace Vercel AI SDK applications](/langsmith/trace-with-vercel-ai-sdk)：使用`wrapAISDK`指定自定义运行ID。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-run-id.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>