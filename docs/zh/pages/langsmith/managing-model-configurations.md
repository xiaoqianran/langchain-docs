<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure prompt settings | https://docs.langchain.com/langsmith/managing-model-configurations -->

# 配置提示设置

[Playground](/langsmith/prompt-engineering-concepts#playground) 使您能够控制提示的各种设置。 **提示设置**窗口包含：

- [Model configuration](#model-configurations)
- [Tool settings](#tool-settings)
- [Prompt formatting](#prompt-formatting)

要访问**提示设置**：

1. 导航至左侧边栏中的 **Playground**。
1. 在 **提示** 标题下，选择型号名称旁边的齿轮 <Icon icon="settings" iconType="solid" /> 图标，这将启动 **提示设置** 窗口。

    <div style={{ textAlign: 'center' }}>
    <img
        className="block dark:hidden"
        src="/langsmith/images/model-config-light.png"
        alt="Model Configuration window in the LangSmith UI, settings for Provider, Model, Temperature, Max Output Tokens, Top P, Presence Penalty, Frequency Penalty, Reasoning Effort, etc."
    />

    <img
        className="hidden dark:block"
        src="/langsmith/images/model-config-dark.png"
        alt="Model Configuration window in the LangSmith UI, settings for Provider, Model, Temperature, Max Output Tokens, Top P, Presence Penalty, Frequency Penalty, Reasoning Effort, etc."
    />
    </div>

## 模型配置

[Model configurations](/langsmith/model-configurations) 定义提示运行时所针对的参数。配置在您的工作区中共享 - 此处保存的任何配置都可以在其他 LangSmith 功能中使用，并且管理员可以在 **设置** > **模型配置** 中查看。有关特定设置的详细信息，请参阅模型提供商的文档（例如，[Anthropic](https://platform.claude.com/docs/en/api/messages) 或 [OpenAI](https://platform.openai.com/docs/api-reference/responses/create)）。

### 创建保存的配置1. 在 **模型配置** 选项卡中，根据需要调整模型配置 - 您可以选择[saved configuration to edit](#edit-configurations)。
1. 单击顶栏中的 **另存为** 按钮。
1. 输入配置的名称和可选说明并确认。
1. 现在您已保存配置，组织中的 [workspace](/langsmith/administration-overview#workspaces) 中的任何人都可以访问它。所有保存的配置都可以在 **模型配置** 下拉列表中找到。
1. 创建保存的配置后，您可以将其设置为默认配置，因此您创建的任何新提示都将自动使用此配置。要将配置设置为默认配置，请单击下拉列表中型号名称旁边的 **设置为默认** <Icon icon="pinned" iconType="solid" /> 图标。

<Note>
仅当配置保存为预设后，OAuth 客户端凭据字段才会出现在此弹出窗口中。要将 OAuth 附加到一次性配置，请先将其保存为预设（请参阅[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)）。
</Note>

### 编辑配置

1. 要重命名已保存的配置或更新描述，请选择配置名称或描述并进行必要的更改。
1. 根据需要更新当前配置的参数，然后单击顶部的 **保存** 按钮。

### 删除配置1. 选择您要删除的配置。
1. 点击垃圾桶<Icon icon="trash" iconType="solid" />图标将其删除。

### 额外参数

**额外参数** 字段允许您传递 LangSmith 接口中不直接支持的其他模型参数。这在两种情况下特别有用：

1. 当模型提供商发布尚未集成到LangSmith接口的新参数时。您可以以 JSON 格式指定这些参数以便立即使用它们。例如：

    ```json
    {
        "reasoning_effort": "medium"
    }
    ```

1. 在修复Playground中与参数相关的错误时，例如：

    ```
    TypeError: AsyncCompletions.create() got an unexpected keyword argument 'max_concurrency'
    ```

    如果您收到有关不必要参数的错误（在使用 [LangChain JS](/oss/python/langchain/overview) 进行运行跟踪时更常见），您可以使用此字段删除额外的参数。

## 工具设置

[_Tools_](/langsmith/prompt-engineering-concepts#tools) 使您的法学硕士能够执行诸如搜索网络、查找信息等任务。在“工具设置”选项卡中，您可以管理 LLM 使用和访问您在提示中定义的工具的方式，包括：- **并行工具调用**：在适当的时候并行调用多个工具。这允许模型同时从不同来源收集信息。 （取决于并行执行的模型支持。）
- **工具选择**：选择模型可以访问的工具。更多详情请参阅[Use tools in a prompt](/langsmith/use-tools)。

<Callout icon="tool" color="#A855F7" iconType="regular">
要管理工作区中可用的工具，包括跨提示启用、禁用和编辑工具，请参阅[Manage tools with the registry](/langsmith/use-tools#manage-tools-with-the-registry)。
</Callout>

## 提示格式化

**提示格式**选项卡允许您指定：

- **提示类型**。有关聊天和完成提示的详细信息，请参阅[Prompt engineering](/langsmith/prompt-engineering-concepts#prompt-types)概念。
- **模板格式**。有关提示模板和使用变量的详细信息，请参阅[F-string vs. mustache](/langsmith/prompt-engineering-concepts#f-string-vs-mustache)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managing-model-configurations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>