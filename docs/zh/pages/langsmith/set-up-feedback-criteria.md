<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up feedback criteria | https://docs.langchain.com/langsmith/set-up-feedback-criteria -->

# 设置反馈标准

> [!提示]
>
> **推荐阅读**
>
> 在深入了解本内容之前，阅读以下内容可能会有所帮助：
>
> * [Conceptual guide on tracing and feedback](/langsmith/observability-concepts)
> * [Reference guide on feedback data format](/langsmith/feedback-data-format)

在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-set-up-feedback-criteria)中，反馈标准称为反馈标签。对于人工反馈，您可以将新的反馈标准设置为连续、分类或自由形式反馈。

> [!注意]
>
> 您还可以使用 SDK 以编程方式管理反馈标签。参考[Manage feedback & annotation queues programmatically](/langsmith/annotation-queues-sdk)。

强制反馈标签为其跨工作区的键设置规则，因此[annotation queues](/langsmith/annotation-queues)和[traces](/langsmith/annotate-traces-inline)中的反馈表单遵循它。创建、编辑和删除强制反馈标签需要`feedback-configs:manage-enforced`权限。内置的[Workspace Admin](/langsmith/rbac#workspace-admin)角色包含它。要向 [custom role](/langsmith/rbac#custom-roles) 授予此访问权限，请授予其权限。

要设置新的反馈标准，请转至 **设置** > **工作区** > **强制反馈标签**，然后单击 **+ 强制反馈标签**。对强制反馈标签的更改需要几分钟才能应用。

## 持续反馈

对于连续反馈，您可以输入反馈标签名称，然后选择最小值和最大值。此范围内的每个值（包括浮点数）都将被接受为反馈分数。

![Enforced feedback tag form with the Continuous type selected, showing the Feedback Tag name and the Minimum and Maximum fields.](https://mintcdn.com/langchain-5e9cc07a/KvWGY4QGu9qRYJib/langsmith/images/feedback-continuous-light.png?fit=max\&auto=format\&n=KvWGY4QGu9qRYJib\&q=85\&s=d82d2ee5451f9b5949bef8a87917a3bf)

## 分类反馈对于分类反馈，您可以输入反馈标签名称，然后添加类别列表，每个类别映射到一个分数。当您提供反馈时，您可以选择这些类别之一作为反馈分数。
类别标签和分数将分别作为反馈记录在`value`和`score`字段中。

![Enforced feedback tag form with the Categorical type selected, showing the Allow multiple selections switch and a Categories list of labels and scores.](https://mintcdn.com/langchain-5e9cc07a/KvWGY4QGu9qRYJib/langsmith/images/feedback-categorical-light.png?fit=max\&auto=format\&n=KvWGY4QGu9qRYJib\&q=85\&s=97d7edde510f53832ba78caf331aebed)

### 允许多项选择

默认情况下，审阅者只选择一个类别。要让审阅者为同一项目选择多个类别，例如对话涵盖的每个主题，请在创建或编辑分类标签时启用**允许多项选择**。具有此设置的标签在标签列表中显示**多选**徽章。

LangSmith 将每个选择保存为标签键下自己的反馈条目。清除拾取将删除其条目。在 [annotation queue](/langsmith/annotation-queues) 中，所需的多选项目至少需要选择一个。

[composite evaluator](/langsmith/composite-evaluators-ui) 不能包含多选标签，因为一次运行可以在该标签的键下有多个分数。当您将注释队列的已完成运行下载到 CSV 时，每个多选标签保留一列。每次运行的单元格都会按照审阅者的顺序列出不同的选择，并用分号分隔。几位审稿人做出的选择出现一次。如果您选择 **包括审阅者详细信息（姓名、每行评论）**，则单元格会列出每个审阅者的反馈。

对于单选和多选标签，具有 10 个以上类别的标签在审阅窗格中显示搜索框，而不是选项列表。

## 自由形式反馈

对于自由形式反馈，请输入反馈标签名称并选择 **自由形式** 作为类型。审阅者输入文本而不是分数或类别。在 [annotation queue](/langsmith/annotation-queues) 中，自由格式的标题项还可以设置一个**正则表达式验证器**，每个条目在保存之前必须匹配。使用自由格式标签进行定性观察或解释。

![Enforced feedback tag form with the Freeform type selected, showing only the Feedback Tag name and Type fields.](https://mintcdn.com/langchain-5e9cc07a/KvWGY4QGu9qRYJib/langsmith/images/feedback-freeform-light.png?fit=max\&auto=format\&n=KvWGY4QGu9qRYJib\&q=85\&s=e2cbba52bb46c50af581c72a3e7eea93)

## 另请参阅

* [Use assertions](/langsmith/assertions)：查看[LangSmith Engine](/langsmith/engine) 针对重复出现的问题提出的自由形式验收标准。
* [Use annotation queues](/langsmith/annotation-queues)：在评论标题中使用反馈标签。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/set-up-feedback-criteria.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。