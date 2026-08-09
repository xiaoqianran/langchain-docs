<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create a prompt | https://docs.langchain.com/langsmith/create-a-prompt -->

# 创建提示

在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-create-a-prompt) 中，导航至左侧边栏或应用程序主页中的 **Playground**。

<img alt="Empty playground" />

<img alt="Empty playground" />

## 撰写提示

Playground 的左侧面板是提示的可编辑视图。

提示由消息组成，每条消息都有一个*角色*，包括：

* **系统**：“使用说明书”。用它来定义人工智能的角色、语气和基本规则（例如，“你是一个有用的助手，可以解释天气等事情”）。
* **人类**：“用户”。这代表向人工智能提出问题或提供指令的人。
* **AI**：“助手”。这是模型的响应。在操场上，您可以使用它来提供“少量”示例 - 向 AI 准确展示您希望它如何响应。
* **工具/功能**：这些角色代表外部工具（如计算器或搜索引擎）的输出。它们可以帮助您测试人工智能在收到特定数据后应如何表现。
* **聊天**：通用角色，通常在导入未分配特定标签的日志或对话历史记录时使用。* **消息列表**：动态占位符。这允许您添加一个包含以前消息的完整列表的变量，从而可以轻松管理较长的对话历史记录。

### 模板格式

默认的 [template format](/langsmith/prompt-template-format) 是 f-string，但是您可以通过单击提示框下方的下拉框将提示模板格式更改为 Mustache。

### 添加模板变量

当您在提示中添加变量时，提示变得特别有用。您可以使用变量将动态内容添加到提示中。通过以下两种方式之一添加模板变量：

* 将 `{variable_name}` 添加到提示符中（每侧一个大括号表示 f 字符串，两个大括号表示小胡子）。

  <img alt="Variable in prompt box." />

  <img alt="Variable in prompt box." />

* 突出显示要模板化的文本，然后单击显示的 **转换为变量** 工具提示按钮。输入变量的名称并进行转换。

  <img alt="Double clicking on a prompt displays the variable icon." />

  <img alt="Double clicking on a prompt displays the variable icon." />

添加变量后，playground 的右侧面板将有一个 **输入** 框，用于提示变量的示例输入。用值填充这些值以测试提示。

<Callout icon="book">
  有关一般提示模板格式和两种语法示例的更多详细信息，请参阅 [Prompt template format](/langsmith/prompt-template-format) 指南。
</Callout>

### 结构化输出将输出模式添加到提示中将以结构化格式获得输出。了解更多关于[structured output](/langsmith/prompt-engineering-concepts#structured-output)的信息。

### 工具

您还可以通过单击提示编辑器底部的**+工具**按钮来添加工具。有关如何使用工具的更多信息，请参阅[Use tools](/langsmith/use-tools)。

<Callout type="info" icon="feather">
  使用 Playground 中的 **[Chat](/langsmith/chat)** 生成工具、创建输出模式并在 AI 辅助下优化提示。
</Callout>

## 运行提示

要运行提示，请使用 Playground 右侧面板顶部的 <Icon icon="player-play" /> **开始**。

## 保存您的提示

要保存提示，请单击 **保存** 按钮并为提示命名。

您在 Playground 设置中选择的模型和配置将随提示一起保存。当您重新打开提示时，模型和配置将自动从保存的版本加载。

<Check>
  第一次创建公共提示时，系统会要求您设置 LangChain Hub 句柄。您的所有公共提示都将链接到此句柄。在共享工作区中，将为整个工作区设置此句柄。
</Check>

## 查看提示

创建提示后，您可以在左侧边栏中的 **提示** 下查看提示表。

## 添加元数据要将元数据添加到提示中，请单击页面右上角的 <Icon icon="dots-vertical" /> **更多** 图标，然后从下拉列表中单击 <Icon icon="pencil" /> **更新元数据**。这将带您进入一个页面，您可以在其中添加有关提示的其他信息，包括说明和自述文件。

# 后续步骤

现在您已经创建了提示，您可以在应用程序代码中使用它。参见[how to pull a prompt programmatically](/langsmith/manage-prompts-programmatically#pull-a-prompt)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/create-a-prompt.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>