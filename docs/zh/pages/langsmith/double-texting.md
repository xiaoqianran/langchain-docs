<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Double texting | https://docs.langchain.com/langsmith/double-texting -->

# 双重短信

<Info>
**先决条件**
* [Agent Server](/langsmith/agent-server)
</Info>

很多时候，用户可能会以意想不到的方式与您的图表进行交互。
例如，用户可以发送一条消息，并在图表完成运行之前发送第二条消息。
更一般地，用户可以在第一次运行完成之前第二次调用该图。
我们称之为“双重短信”。

[Enqueue](#enqueue-default) 是在 [Agent Server](/langsmith/agent-server) 中创建运行时的默认双短信（多任务）策略。

<Note>
双重短信是LangSmith部署的一项功能。 [LangGraph open source framework](/oss/python/langgraph/overview) 中不可用。
</Note>

![Double-text strategies across first vs. second run: Reject keeps only the first; Enqueue runs the second afterward; Interrupt halts the first to run the second; Rollback reverts the first and reruns with the second.](/langsmith/images/double-texting.png)

## 入队（默认）

此选项允许在处理任何新输入之前完成当前运行。一旦先前的运行完成，传入的请求就会排队并按顺序执行。

有关配置入队双文本选项，请参阅[how-to guide](/langsmith/enqueue-concurrent)。

## 拒绝

当当前运行正在进行时，此选项会拒绝任何额外的传入运行，并防止并发执行或双重发短信。

有关配置拒绝双文本选项，请参阅[how-to guide](/langsmith/reject-concurrent)。

## 中断此选项会停止当前执行并保留到中断点为止的进度。然后插入新的用户输入，并从该状态继续执行。

使用此选项时，您的图表必须考虑潜在的边缘情况。例如，工具调用可能已启动但在中断时尚未完成。在这些情况下，可能需要处理或删除部分工具调用，以避免未解决的操作。

关于中断双文本选项的配置，请参考[how-to guide](/langsmith/interrupt-concurrent)。

## 回滚

在处理新的用户输入之前，此选项会暂停当前执行并恢复所有进度（包括初始运行输入）。新输入被视为从初始状态开始的全新运行。

关于回滚双文本选项的配置，请参考[how-to guide](/langsmith/rollback-concurrent)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/double-texting.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>