<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Annotate traces and runs inline | https://docs.langchain.com/langsmith/annotate-traces-inline -->

# 注释跟踪并内联运行

LangSmith 允许您在应用程序内手动注释轨迹并提供反馈。这对于向跟踪添加上下文非常有用，例如用户的评论或有关特定问题的注释。
您可以内联或通过将跟踪发送到注释队列来注释跟踪，这允许您仔细检查并记录反馈以一次运行一个。
反馈标签与您的[workspace](/langsmith/administration-overview#workspaces)相关联。

<Note>
**您可以将用户反馈附加到跟踪的任何中间运行（跨度），而不仅仅是根跨度。**

这对于批评 LLM 申请的特定部分非常有用，例如 RAG 管道的检索步骤或生成步骤。

</Note>

要内联注释跟踪，请在属于跟踪一部分的任何特定运行的跟踪视图中打开三点菜单 (`...`)，然后单击 **注释**。


这将打开一个窗格，允许您从与您的工作区关联的反馈标签中进行选择，并为特定标签添加分数。您还可以添加独立评论。按照[Set up feedback criteria](/langsmith/set-up-feedback-criteria)为您的工作空间设置反馈标签。
您还可以在窗格本身内设置新的反馈标准。LangSmith UI 中的内联反馈和注释不会更改跟踪的 [retention tier](/langsmith/usage-and-billing#data-retention-auto-upgrades)；跟踪将保留为其项目配置的保留，除非另一个操作明确延长保留。

![Annotation sidebar](/langsmith/images/annotation-sidebar.png)

您可以使用带标签的键盘快捷键来简化注释过程。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/annotate-traces-inline.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>