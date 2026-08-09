<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Test multi-turn conversations | https://docs.langchain.com/langsmith/multiple-messages -->

# 测试多轮对话

本操作指南将引导您了解为多轮对话设置 Playground 的各种方法，这将允许您针对较长的消息线程测试不同的工具配置和系统提示。

<img alt="Multiturn diagram" />

## 来自现有运行

首先，确保您有正确的 [traced](/langsmith/observability) 多轮对话，然后导航到您的跟踪项目。进入跟踪项目后，只需打开运行，选择 LLM 调用，然后在 Playground 中打开它，如下所示：

<img alt="Multiturn from run" />

然后，您可以编辑系统提示，调整工具和/或输出模式，并观察多轮对话的输出如何变化。

## 来自数据集

开始之前，请确保您拥有[set up your dataset](/langsmith/manage-datasets-in-application)。由于您想要评估多轮对话，请确保您的输入中有一个包含消息列表的键。

创建数据集后，前往 Playground 和 [load your dataset](/langsmith/manage-datasets-in-application#from-the-playground) 进行评估。

然后，将消息列表变量添加到提示中，确保其名称与包含消息列表的输入中的键相同：

<img alt="Multiturn from dataset" />当您运行提示时，每个示例中的消息将作为列表添加到“消息列表”变量的位置。

## 手动

有两种方法可以手动创建多轮对话。第一种方法是简单地将消息附加到提示中：

<img alt="Multiturn manual" />

这对于快速迭代很有帮助，但由于多轮对话是硬编码的，因此很僵化。相反，如果您希望提示适用于任何多轮对话，您可以添加“消息列表”变量并在其中添加多轮对话：

<img alt="Multiturn manual list" />

这允许您只需调整系统提示或工具，同时允许任何多轮对话代替 `Messages List` 变量，从而允许您在各种运行中重复使用此提示。

## 后续步骤

现在您已经知道如何设置 Playground 进行多轮交互，您可以手动检查和判断输出，也可以[add evaluators](/langsmith/code-evaluator-ui) 对结果进行分类。

您还可以阅读 [these how-to guides](/langsmith/create-a-prompt) 了解有关如何使用 Playground 运行评估的更多信息。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/multiple-messages.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>