<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up feedback criteria | https://docs.langchain.com/langsmith/set-up-feedback-criteria -->

# 设置反馈标准

<Tip>
**推荐阅读**

在深入了解此内容之前，阅读以下内容可能会有所帮助：

- [Conceptual guide on tracing and feedback](/langsmith/observability-concepts)
- [Reference guide on feedback data format](/langsmith/feedback-data-format)

</Tip>

反馈标准在应用程序中表示为反馈标签。对于人工反馈，您可以将新的反馈标准设置为连续反馈或分类反馈。

<Info>
您还可以使用 SDK 以编程方式管理反馈配置。参考[Manage feedback & annotation queues programmatically](/langsmith/annotation-queues-sdk)。
</Info>

<Tip>
对于审稿人每次运行编写的自由形式接受标准（而不是一组固定的评分标准），请参阅[Use assertions](/langsmith/assertions)。
</Tip>

要设置新的反馈标准，请按照[this link](https://smith.langchain.com/settings/workspaces/feedbacks)查看工作区的所有现有标签，然后单击**新标签**。

## 持续反馈

对于连续反馈，您可以输入反馈标签名称，然后选择最小值和最大值。此范围内的每个值（包括浮点数）都将被接受为反馈分数。

![Cont feedback](/langsmith/images/cont-feedback.png)

## 分类反馈对于分类反馈，您可以输入反馈标签名称，然后添加类别列表，每个类别映射到一个分数。当您提供反馈时，您可以选择这些类别之一作为反馈分数。
类别标签和分数将分别作为反馈记录在`value`和`score`字段中。

![Cat feedback](/langsmith/images/cat-feedback.png)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/set-up-feedback-criteria.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>