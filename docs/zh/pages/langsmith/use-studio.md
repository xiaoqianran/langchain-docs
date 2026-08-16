<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to use Studio | https://docs.langchain.com/langsmith/use-studio -->

# 如何使用 Studio

本页描述了您将在 Studio 中使用的核心工作流程。它解释了如何运行应用程序、管理助手配置以及使用对话线程。每个部分都包含图形模式（图形执行的全功能视图）和聊天模式（轻量级对话界面）中的步骤：

- [Run application](#run-application)：执行您的应用程序或代理并观察其行为。
- [Manage assistants](#manage-assistants)：创建、编辑和选择应用程序使用的辅助配置。
- [Manage threads](#manage-threads)：查看和组织线程，包括分叉或编辑过去的运行以进行调试。

## 运行应用程序

<Tabs>
<Tab title="Graph">

### 指定输入

1. 在页面左侧图形界面下方的 **输入** 部分中定义图形的输入。 Studio 将尝试根据图表定义的 [state schema](/oss/python/langgraph/graph-api/#schema) 为您的输入呈现表单。要禁用此功能，请单击 **View Raw** 按钮，这将为您提供一个 JSON 编辑器。
1. 单击“**输入**”部分顶部的向上或向下箭头可切换并使用之前提交的输入。

### 运行设置

#### 助理

要指定用于运行的 [assistant](/langsmith/assistants)：1. 单击左下角的**设置**按钮。如果当前选择了助理，该按钮还将列出助理姓名。如果未选择任何助手，则会显示“**管理助手**”。
1. 选择要运行的助手。
1. 单击模式顶部的 **活动** 开关将其激活。

欲了解更多信息，请参阅[Manage assistants](#manage-assistants)。

#### 流媒体

单击“**提交**”旁边的下拉菜单，然后单击切换开关以启用或禁用流式传输。

#### 断点

要使用断点运行图表：

1. 单击“**中断**”。
1. 选择一个节点以及是在该节点执行之前还是之后暂停。
1. 单击线程日志中的“继续”以恢复执行。

有关断点的更多信息，请参阅[Human-in-the-loop](/oss/python/langchain/human-in-the-loop)。

### 提交运行

要使用指定的输入和运行设置提交运行：

1. 单击**提交**按钮。这会将 [run](/langsmith/runs) 添加到现有选定的 [thread](/oss/python/langgraph/checkpointers#threads)。如果当前没有选择任何线程，则会创建一个新线程。
1. 要取消正在进行的运行，请单击 **取消** 按钮。

</Tab>
<Tab title="Chat">

在对话面板底部指定聊天应用程序的输入。1. 单击 **发送消息** 按钮将输入作为人工消息提交并返回响应。

要取消正在进行的运行：

1. 单击“**取消**”。
1. 单击 **显示工具调用** 开关以隐藏或显示对话中的工具调用。

</Tab>
</Tabs>

## 管理助手

Studio 允许您查看和编辑助手，并允许您使用这些助手配置运行图表。

有关更多概念细节，请参阅[Assistants overview](/langsmith/assistants/)。

<Tabs>
<Tab title="Graph">

要查看您的助手：

1. 单击左下角的**管理助手**。这将打开一个模式，供您查看所选图表的所有助手。
1. 指定您想要标记为**活动**的助手及其版本。 LangSmith 将在提交运行时使用此助手。

**默认配置**选项将处于活动状态，这反映了图表中定义的默认配置。对此配置所做的编辑将用于更新运行时配置，但不会更新或创建新助手，除非您单击 **创建新助手**。

</Tab>
<Tab title="Chat">聊天模式使您可以通过页面顶部的下拉选择器在图表中的不同助手之间切换。要创建、编辑或删除助手，请使用图形模式。

</Tab>
</Tabs>

## 管理线程

Studio 提供了查看服务器上保存的所有[threads](/oss/python/langgraph/checkpointers#threads) 并编辑其状态的工具。您可以在图形模式和聊天模式下创建新线程、在线程之间切换以及修改过去的状态。

<Tabs>
<Tab title="Graph">

### 查看主题

1. 在右侧窗格的顶部，选择下拉菜单以查看现有线程。
1. 选择所需的话题，话题历史记录将填充在页面右侧。
1. 要创建新线程，请单击 **+ 新线程** 和 [submit a run](#run-application)。
1. 要查看线程中更详细的信息，请将页面顶部的滑块向右拖动。要查看较少的信息，请将滑块向左拖动。此外，折叠或展开状态的各个回合、节点和关键点。
1. 在`Pretty`和`JSON`模式之间切换，以适应不同的渲染格式。

### 编辑线程历史记录

编辑线程的状态：1. 选择所需节点旁边的<Icon icon="pencil"/> **编辑节点状态**。
1. 根据需要编辑节点的输出，然后单击 **Fork** 进行确认。这将从所选节点的检查点创建一个新的分叉运行。

如果您想从给定检查点重新运行线程而不编辑状态，请单击 **从此处重新运行**。这将再次从选定的检查点创建一个新的分叉运行。这对于重新运行非特定于状态的更改（例如选定的助手）非常有用。

</Tab>
<Tab title="Chat">

1. 在页面右侧窗格中查看所有主题。
1. 选择所需的话题，话题历史记录将填充在中心面板中。
1. 要创建新线程，请单击 **+** 并提交运行。

要在线程中编辑人工消息：

1. 单击人工消息下方的<Icon icon="pencil"/> **编辑节点状态**。
1. 根据需要编辑消息并提交。这将创建对话历史记录的新分支。
1. 要重新生成 AI 消息，请单击 AI 消息下方的重试图标。

</Tab>
</Tabs>

## 后续步骤

有关可以在 Studio 中完成的任务的更多详细信息，请参阅以下指南：

- [Iterate on prompts](/langsmith/observability-studio)
- [Run experiments over datasets](/langsmith/observability-studio#run-experiments-over-a-dataset)

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/use-studio.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>