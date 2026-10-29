<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Find and fix your agent's issues with LangSmith Engine | https://docs.langchain.com/langsmith/engine-issues -->

# 查找并修复代理与 LangSmith 引擎的问题

查看 LangSmith 引擎检测到的问题，使用其建议的修复打开拉取请求，并将失败的跟踪转化为数据集示例。

**Engine** 页面列出了 [LangSmith Engine](/langsmith/engine) 在跟踪项目中检测到的问题，每个问题都有一个诊断、支持它的跟踪以及建议的修复。通过它们来发布修复并将真正的故障转化为评估数据集。如果引擎尚未在您的项目上运行，请参阅[Set up Engine](/langsmith/engine-setup)。

单击任何问题以打开其详细信息面板。顶部的诊断描述了问题及其影响。每个问题都有一个工具栏，用于设置其优先级、关闭或重新打开它、打开拉取请求、创建线性问题并观看它。

引擎会从您对每个问题所做的操作中学习：关闭它、将其标记为错误标记、更改其优先级或打开拉取请求，以及您给出的任何原因。有关反馈如何影响以后的扫描，请参阅[How Engine learns from your feedback](/langsmith/engine#how-engine-learns-from-your-feedback)。

## 审查证据

**证据**部分包含支持诊断的跟踪，包括每个跟踪的片段。从本节中，您可以：* **查看跟踪**：单击 **查看跟踪** 打开证据跟踪。当引擎识别出导致问题的子运行时，它会打开该确切的运行。跟踪视图包含返回引擎问题的 **查看问题** 链接。
* **创建离线示例**：单击 [**Add offline examples**](#add-offline-examples) 从生产跟踪输入生成自定义地面实况 [dataset examples](/langsmith/manage-datasets) 以进行离线评估。
* **查看项目证据**：点击**查看项目中的全部**，可以查看追踪项目中的证据。

有关更多信息，请参阅[Manage a trace](/langsmith/manage-trace)。

引擎在提交问题后会持续跟踪问题。在以后的扫描中，任何与问题的故障模式匹配的新跟踪都会自动添加到 **证据**，因此问题反映了在您不重新运行任何内容的情况下故障仍然发生的频率。

**建议的修复**部分描述了该问题并建议如何解决它，其中可能包括特定代码或提示更改（如果连接了存储库）。

## 更改优先级和状态

从优先级下拉列表中选择 **低**、**中** 或 **高** 以更新问题的优先级。您可以选择提供一个原因，即稍后扫描时引擎[learns from](/langsmith/engine#how-engine-learns-from-your-feedback)。

结束记录您的审核结果。点击：* **关闭** 将问题标记为已解决。
* **错误标记** 将问题视为不真实或不值得修复而忽略。

对于任一结果，您都可以选择提供一个原因，引擎 [learns from](/langsmith/engine#how-engine-learns-from-your-feedback) 在以后的扫描中。

您可以随时重新打开已关闭的问题。单击 **重新打开** 以清除任何正在进行的修复，并停止查看该问题（如果正在查看）。当引擎检测到在以后的跟踪中重复出现相同的问题时，它还会自动重新打开问题。

## 打开拉取请求

要打开包含建议的代码更改的拉取请求，请首先[connect a repository](/langsmith/engine-repositories)，然后单击 **Open PR**。在 GitLab 上，引擎打开合并请求，但按钮保留其名称，**打开 PR** 和 **查看 PR**。一旦存在拉取请求，引擎就会用 **View PR** 替换 **Open PR**。单击 **查看 PR** 以在 GitHub 中打开拉取请求或在 GitLab 中打开合并请求。引擎反映了 PR 在整个问题中的状态（开放、合并或关闭）。

您还可以将问题的修复上下文复制到剪贴板，以便与法学硕士或编码助理一起使用。引擎可以对任何连接的存储库提出代码更改建议，包括使用[Deep Agents](/oss/python/deepagents/overview)、[LangChain](/oss/python/langchain/overview)和[LangGraph](/oss/python/langgraph/overview)构建的代理。

## 创建一个线性问题要创建问题，首先[connect Linear](/langsmith/engine-setup#connect-to-linear)，然后在引擎问题上单击“**以线性方式创建**”。引擎在创建问题时显示**线性创建挂起**。创建完成后，引擎会在引擎问题和问题列表中显示链接的线性问题标识符。

线性问题包括引擎问题标题和描述、严重性、类别、标签、**在 LangSmith** 链接中查看问题以及证据跟踪 ID。引擎保留了线性问题的链接。如果您关闭线性工单，引擎将关闭相应的问题。如果您取消线性票证，引擎会将相应的问题标记为错误标记。引擎还跟踪与相应引擎问题上的线性票证链接的拉取请求。

## 添加离线示例

此步骤捕获使问题浮出水面的痕迹作为事实[dataset examples](/langsmith/manage-datasets)，因此您可以在修复进入生产之前离线评估修复。1. 单击“证据”列表右上角的“添加离线示例”，打开“添加为离线示例”对话框。
2. 检查每条迹线。该对话框显示输入、代理生成的错误输出以及作为自定义地面实况示例的建议预期输出。
3. 单击“**添加到数据集**”直接添加它们，或单击“**在注释队列中编辑**”先查看它们。
4. 在注释队列中，每个示例显示运行输入以及引擎提出的参考输出，其结构为从跟踪分析生成的名为[assertions](/langsmith/assertions)。每个断言都是一个简短的断言，描述正确答案应该或不应该包括的内容。根据需要编辑断言，使用 **+ 添加断言** 添加新断言，然后单击 **添加到数据集并继续** 以完成每个示例。

欲了解更多信息，请参阅[Manage datasets](/langsmith/manage-datasets)、[Use annotation queues](/langsmith/annotation-queues)和[Use assertions](/langsmith/assertions)。

## 观看一个问题

观看使问题保持开放状态以供监控，而不解决问题或将其标记为错误标记。当您尚未准备好解决问题但仍想知道问题是否持续发生时，请单击“观看”。要在关注的问题再次出现时收到提醒，请单击 **通过 Slack 提醒我**，这会打开 [Engine settings](/langsmith/engine-setup#configure-engine) 面板的 **通知** 部分。参见[Engine notifications](/langsmith/engine-notifications)。

当新跟踪链接到关注的问题时，引擎会将其移至列表顶部并显示到达的新跟踪数，以便您可以选择修复或继续关注。

> [!注意]
>
> 观看仅适用于没有运行中拉取请求的未决问题：放弃修复以再次观看问题。解决关注的问题，或将其标记为错误标记，会自动停止关注。

## 过滤和排序问题

### 在用户界面中

**引擎**页面在左侧面板中列出了检测到的问题。每个条目都会显示标题、简短描述、贡献痕迹的数量以及最近观察到该问题的时间。每个问题都标有故障类别，例如**无声工具错误**或**幻觉**。

在列表顶部，您可以单击：

* **过滤问题**图标可按**优先级**、**状态**和**标签**进行过滤。
* **对问题进行排序** 图标可按 **严重性**、**上次更新** 和 **创建** 进行排序。
* **将引擎**（齿轮）图标配置为[configure Engine](/langsmith/engine-setup#configure-engine)。打开[LangSmith Chat](/langsmith/chat#engine)针对您的问题提出问题，例如哪些问题最需要关注或有多少新问题尚未解决。

如果设置完成后没有出现问题，则引擎在分析的跟踪中没有发现重复出现的模式。尝试在收集更多痕迹后回来查看。

### 使用 CLI

使用 [LangSmith CLI](/langsmith/cli) 中的 `langsmith project issues list` 列出项目的问题。使用`--status`（`open`、`fixing`、`watching`、`completed`或`ignored`）和`--priority`（`urgent`、`high`、`medium`或`low`）进行过滤，以及带有 `--limit` 和 `--offset` 的页面。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# List open, high-priority issues for a project
langsmith project issues list --project <project-name> --status open --priority high
```

## 另请参阅

* [LangSmith Engine](/langsmith/engine)：引擎如何检测问题并从您的反馈中学习。
* [Set up Engine](/langsmith/engine-setup)：为跟踪项目打开引擎并配置其关注的内容。
* [Validate fixes automatically](/langsmith/engine-fix-validation)：确认问题重现并且引擎的修复解决了该问题。
* [Engine notifications](/langsmith/engine-notifications)：当引擎发现问题时，在 Slack、Jira 或 Webhook 中收到警报。
* [Manage datasets](/langsmith/manage-datasets)、[Use annotation queues](/langsmith/annotation-queues) 和 [Use assertions](/langsmith/assertions)：使用引擎生成的离线示例。
* [LangSmith CLI](/langsmith/cli)：以编程方式列出和管理问题。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-issues.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。