<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prompt engineering concepts | https://docs.langchain.com/langsmith/prompt-engineering-concepts -->

# 提示工程概念

传统的软件应用程序是通过编写代码构建的，而人工智能应用程序通常从提示中得出逻辑。

本指南将介绍LangSmith中即时工程的关键概念。

## 为什么要促进工程？

提示指导模型的行为而不改变其底层功能。通过提供说明、示例和上下文，提示塑造模型如何响应输入。

快速工程很重要，因为它允许您修改模型行为。虽然存在其他方法（例如微调），但即时工程通常提供最低的进入壁垒，并且通常会带来最高的投资回报。

快速工程通常是多学科的努力。最有效的提示工程师可能是产品经理、领域专家或其他非技术团队成员，而不是构建应用程序的软件工程师。适当的工具和基础设施对于支持这种跨职能协作至关重要。

## 提示类型

有两种不同类型的提示格式：`chat`风格提示和`completion`风格提示。**聊天提示**是消息列表，每条消息都有一个角色（例如 `system`、`user` 或 `assistant`）。这是当前大多数模型API支持的提示样式，也是推荐的格式。

**完成提示**是单个字符串。这是一种较旧的提示样式，主要是为了向后兼容而维护的。

<Note>
除非您有特定原因使用完成提示，否则请对新项目使用聊天提示。聊天提示为多轮对话提供了更好的结构，并且得到了现代法学硕士的更好支持。
</Note>

## 提示与提示模板

虽然_prompt_和_prompt template_经常互换使用，但理解它们之间的区别有助于阐明LangSmith如何管理和评估您的AI应用程序。

- **提示**是指传递到语言模型中的消息。
- **提示模板**允许您使用在运行时填充的动态占位符创建可重用的提示。您可以定义变量，而不是硬编码值，每次运行提示时，LangSmith 都会用不同的输入替换这些变量。这使得提示变得灵活、可测试并且更容易迭代。

以下是模板在实践中的工作原理：1. **定义模板**：使用将在运行时替换的变量（用大括号标记）创建提示：

    ```
    You are a customer support agent. This is the refund policy:

    {refund_policy}

    Please respond to the user's question:

    {question}
    ```

1. **提供输入值**：提供每个变量的实际值：

    ```json
    {
    "refund_policy": "no refunds under any circumstances",
    "question": "can I get a refund for this hat?"
    }
    ```

1. **获取最终提示**： LangSmith 将变量替换为您的输入，以创建发送到模型的提示：

    ```
    You are a customer support agent. This is the refund policy:

    no refunds under any circumstances

    Please respond to the user's question:

    Can I get a refund for this hat?
    ```

<Tip>
在 [Prompt template format](/langsmith/create-a-prompt#template-format) 指南中了解有关模板变量语法和格式选项的更多信息。
</Tip>

## LangSmith 中的提示

您可以在LangSmith中存储和版本提示模板。这些模板可以在 Playground 中进行测试，使用提交和标签进行版本控制，然后将其拉入您的应用程序代码中。

<Callout type="info" color="#4F46E5" icon="player-play" iconType="regular">
打开 [Playground](https://smith.langchain.com/playground) 创建并测试您的第一个提示模板。具体步骤请参阅[Create a prompt](/langsmith/create-a-prompt)。
</Callout>

以下部分描述了提示模板的关键方面。

### F 弦与小胡子

您可以使用 [f-string](https://realpython.com/python-f-strings/) 或 [mustache](https://mustache.github.io/mustache.5.html) 格式使用输入变量来格式化提示模板。

有关如何在 Playground 中使用这些格式的详细信息，请参阅[Template format](/langsmith/create-a-prompt#template-format)。<Check>
[Playground](https://smith.langchain.com/playground)使用`f-string`作为默认模板格式，但您可以在提示设置/模板格式部分切换为`mustache`格式。 `mustache` 为您提供有关条件变量、循环和嵌套键的更大灵活性。对于条件变量，您需要在“输入”部分手动添加 json 变量。阅读[the documentation](https://mustache.github.io/mustache.5.html)
</Check>

### 工具

[Tools](/langsmith/use-tools) 是法学硕士可以用来与外界交互的接口。工具由名称、描述和用于调用该工具的参数的 JSON 架构组成。

### 结构化输出

结构化输出是大多数最先进的法学硕士的一个特征，其中它们不生成原始文本作为输出，而是坚持指定的模式。这可能会或可能不会在引擎盖下使用[Tools](#tools)。

<Check>
结构化输出与工具类似，但在几个关键方面有所不同。使用工具，法学硕士可以选择调用哪个工具（或者可以选择不调用任何工具）；通过结构化输出，法学硕士**始终**以这种格式做出响应。使用工具，LLM可以选择**多个**工具；对于结构化输出，仅生成一个响应。
</Check>

### 型号或者，您可以将模型配置与提示模板一起存储。这包括模型名称和任何其他参数（温度等）。

## 提示版本控制

版本控制是迭代和与提示协作的关键组成部分。

### 提交

每个保存的提示更新都会创建一个具有唯一提交哈希的新提交。这使您能够：

- 查看提示更改的完整历史记录。
- 查看早期版本。
- 如果需要，恢复到之前的状态。
- 使用提交哈希引用代码中的特定版本（例如，`client.pull_prompt("prompt_name:commit_hash")`）。

在 UI 中，您可以通过切换 [Prompt detail page](/langsmith/manage-prompts#prompt-detail-page) 右上角的 **Diff** 将提交与其之前的版本进行比较。

### 标签

提交标签是人类可读的标签，指向提示历史记录中的特定提交。与提交哈希不同，标签可以移动以指向不同的提交，从而允许您更新代码引用的版本，而无需更改代码本身。

提交标签的用例可以包括：- **环境**：`staging` 和 `production` 标签是为 [Environments](/langsmith/manage-prompts#environments) 功能保留的，它允许您在命名部署目标和切换版本之间提升提交，而无需更改代码。
- **版本控制**：标记提示的稳定版本，例如`v1`、`v2`，它允许您在代码中引用特定版本并跟踪随时间的变化。
- **协作**：将版本标记为可供审核，这使您能够与协作者共享特定版本并获得反馈。

<Note>
**不要与资源标签混淆**：提交标签引用特定的提示版本。 [Resource tags](/langsmith/set-up-resource-tags) 是用于组织工作区资源的键值对。
</Note>

有关创建和管理提交标签的详细信息，请参阅[Manage prompts](/langsmith/manage-prompts#commit-tags)。

## 游乐场

Playground 提供了一个用于迭代和测试提示的界面。您可以从侧边栏或直接从保存的提示访问 Playground。

在 Playground 中您可以：

* 更改正在使用的型号
* 更改正在使用的提示模板
* 更改输出模式
* 更改可用的工具
* 输入输入变量以运行提示模板
* 通过模型运行提示
* 观察输出<Callout type="info" icon="feather">
使用 Playground 中的 **[Chat](/langsmith/chat)** 来优化提示、生成工具并在 AI 辅助下创建输出模式。
</Callout>

## 测试多个提示

您可以向 Playground 添加多个提示来比较输出并评估性能：

![Add prompt to Playground](/langsmith/images/add-prompt-to-playground.gif)

## 对数据集进行测试

要测试数据集，请从右上角选择数据集，然后单击“开始”。您可以配置是否传输结果以及测试的重复次数。

![Test over dataset in Playground](/langsmith/images/test-over-dataset-in-playground.gif)

点击“查看实验”按钮可以查看详细的测试结果。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/prompt-engineering-concepts.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>