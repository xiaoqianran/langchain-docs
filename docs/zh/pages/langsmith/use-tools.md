<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use tools in a prompt | https://docs.langchain.com/langsmith/use-tools -->

# 在提示中使用工具

工具允许语言模型与外部系统交互并执行不仅仅是生成文本的操作。在 Playground 中，您可以使用两种类型的工具：

1. [**Built-in tools**](#built-in-tools)：模型提供商（如 OpenAI 和 Anthropic）提供的预配置工具，可供使用。当您需要 Web 搜索或代码解释等常用功能时，请使用内置工具。
2. [**Custom tools**](#create-a-custom-tool)：您定义的用于执行特定任务的函数。当您需要与自己的系统集成或创建专门的功能时，这些非常有用。当您在 Playground 中定义自定义工具时，您可以验证模型是否正确识别并使用正确的参数调用这些工具。

LangSmith 会自动将您创建的工具保存到工作区范围的[tool registry](#manage-tools-with-the-registry)，这使得它们可以在您的所有提示和会话中重复使用。

## 内置工具

Playground 原生支持 OpenAI 和 Anthropic 的各种工具。如果您想使用 Playground 中未明确列出的工具，您仍然可以通过手动指定其 `type` 和任何必需的参数来添加它。

### OpenAI 工具* **网络搜索**：[Search the web for real-time information](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses)。
* **图像生成**：[Generate images based on a text prompt](https://platform.openai.com/docs/guides/tools-image-generation)。
* **MCP**：[Gives the model access to tools hosted on a remote MCP server](https://platform.openai.com/docs/guides/tools-remote-mcp)。
* [View all OpenAI tools](https://platform.openai.com/docs/guides/tools?api-mode=responses)。

### 人类工具

* **网络搜索**：[Search the web for up-to-date information](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)。
* [View all Anthropic tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)。

## 添加和使用工具

Playground 让您只需单击一下即可快速[add tools](#add-a-tool) 到达任何提示。您可以从 OpenAI 和 Anthropic 等模型提供商提供的内置工具中进行选择，也可以根据您的特定需求定义自己的[custom tools](#create-a-custom-tool)。创建自定义工具后，它会自动添加到工作区范围的[tool registry](#manage-tools-with-the-registry)，您可以在其中跨不同提示启用、禁用或编辑它，而无需重新创建它。

### 添加工具

要将工具添加到提示中，请单击提示编辑器底部的 **+ 工具** 按钮。

<img alt="The prompt interface with the + Tool button following the editing boxes." />

<img alt="The prompt interface with the + Tool button following the editing boxes." />

### 使用内置工具

1. 在工具部分中，选择您要使用的内置工具。您只会看到与您选择的提供商和型号兼容的工具。
2. 当模型调用该工具时，Playground 将显示响应。

   <img alt="Web search tool" />

### 创建自定义工具

要创建自定义工具，您需要提供：

* **名称**：您的工具的描述性名称。
* **描述**：对该工具功能的清晰解释。
* **参数**：您的工具所需的输入。

<img alt="Custom tool" />在 Playground 中运行自定义工具时，模型将使用包含工具名称和工具调用的 JSON 对象进行响应。

<img alt="Tool call" />

### 使用注册表管理工具

Playground 包括一个 [workspace](/langsmith/administration-overview#workspaces) 范围的**工具注册表**，它可以在提示和会话中保留自定义工具和内置工具。当您创建自定义工具或添加内置工具时，它会自动保存到您的工作区注册表中，并可在任何提示中重复使用。您可以启用或禁用每个提示的工具，以控制每个特定提示的活动工具，并且在编辑共享工具时，您可以选择更新注册表版本或另存为新工具。

单击 Playground 中的 **+ 工具** 按钮以打开 **管理工具**。您可以执行以下操作：

* 在 **可用工具** 选项卡中选择并查看现有工具。
* 使用 **Enabled** 开关打开/关闭各个工具。
* 通过单击列表中的现有工具来编辑它们。
* 使用**管理工具**底部的**删除**删除工具。

<img alt="Manage tools with a list of available tools, Enabled switch, and edit functionality." />

<img alt="Manage tools with a list of available tools, Enabled switch, and edit functionality." />工具及其完整配置一起存储，包括名称、描述、参数和元数据。注册表支持自定义功能工具和内置工具配置。

## 工具选择设置

某些模型提供对调用哪些工具的控制。要配置此：

1. 在提示编辑器下选择**+ Tool**。
2. 导航至**工具选择设置**选项卡。
3. 选择您的工具选择。

要了解可用的工具选择选项，请查看特定提供商的文档。例如，[OpenAI's documentation on tool choice](https://platform.openai.com/docs/guides/function-calling/function-calling-behavior?api-mode=responses#tool-choice)。

<img alt="Select tools from the Tool Choice Settings tab." />

<img alt="Select tools from the Tool Choice Settings tab." />

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/use-tools.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>