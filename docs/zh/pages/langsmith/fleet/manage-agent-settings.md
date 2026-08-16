<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage agent settings | https://docs.langchain.com/langsmith/fleet/manage-agent-settings -->

# 管理代理设置

本页介绍如何管理 LangSmith 舰队中座席的设置。

## 更改模型

要更改代理的模型：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-manage-agent-settings)中，打开您的代理。
1. 在边栏中，展开 **高级设置** 抽屉。
1. 在 **型号** 部分中，选择您要使用的型号。
1. 如果模型需要 API 密钥，请将其添加到 **API 密钥** 部分。

定制模型可用于企业部署。有关更多信息，请参阅[Custom models](/langsmith/fleet/essentials#custom-models)。

## 重新连接工具集成

要将工具集成重新连接到代理：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-manage-agent-settings)中，打开您的代理。
1. 在侧栏中，展开 **连接** 抽屉。
1. 单击集成旁边的 **管理** 以查看或重新连接它。

## 下载代理文件

要下载代理的文件，请打开代理，展开侧边栏中的“**高级设置**”抽屉，然后在“**开发人员**”下单击“**下载 ZIP**”。这会将代理配置导出为 ZIP 文件。

## 更改代理的访问权限

代理可以是创建者私有的、与特定人员共享的，或者与整个 LangSmith 工作区共享的。|特色|私人代理| [Workspace agents](#workspace-scoped-agent-details) |
| ---| ---| ---|
| **所有权和访问权** |仅对创建者可见 |对同一 LangSmith 工作区中的任何人都可见 |
| **OAuth 身份验证** | OAuth 凭证的范围仅限于创建者 | OAuth 凭证的范围仅限于每个用户；新用户克隆工作区代理必须使用选定的工具重新进行身份验证
| **秘密** |使用工作区范围的 LangSmith 秘密 |使用工作空间范围的LangSmith秘密（与私人代理相同）|

要更改代理可见性，请打开代理，展开侧边栏中的 **共享** 抽屉，然后选择 **私人** 或 **工作区**。要与特定人员共享，请单击 **特定人员** 旁边的 **+ 添加**。

### 工作区范围的代理详细信息

虽然工作区范围的代理是共享的，但一些详细信息是公开的，而另一些则是私有的：- **线程始终是用户范围的**，因此即使代理是工作区范围的，在该代理中创建的聊天历史记录也将始终是私有的，并且只能由创建它们的特定用户访问。
- **系统提示、选定的工具和子代理将在工作区范围的代理上公开。** 用户将无法在原始工作区范围的代理上修改这些字段，但可以在克隆代理后进行更改。
- **工作区范围代理上的通道类型是公共**（例如，收到的 Slack 消息），但与通道的特定连接（例如，Slack 通道或 Gmail 地址）不共享。这样，用户就知道克隆代理时要使用哪个通道，但无法对原始用户已设置的任何连接进行未经授权的访问。

## 更新内存

您的代理可以记住之前对话中的信息，并使用它在未来的对话中做出更好的决策。代理通过使用 `write_file` 和 `edit_file` 工具调用将文件写入 **memories 文件夹** 来保留内存。默认情况下，您的代理在保存到记忆文件夹之前需要批准。启用此设置后，代理会暂停并等待您在队列 UI 中接受、编辑或拒绝每个内存更新，然后再继续。

<Tip>
如果您的代理按照 [schedule](/langsmith/fleet/schedules#add-a-schedule) 或其他自动计划运行，请禁用内存批准要求。否则，代理将暂停涉及内存更新的每个计划运行，并无限期等待手动批准。
</Tip>

### 禁用内存更新所需的批准

要禁用内存批准要求：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-manage-agent-settings)中，打开您的代理。
1. 在侧栏中，展开 **知识** 抽屉。
1. 在 **内存** 部分中，将 **更新内存和指令** 设置为 **自动**。

## 以编程方式使用代理

您可以使用[LangGraph SDK](/langsmith/reference)通过代码连接到您的代理。要查看以编程方式调用代理所需的代码片段：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-manage-agent-settings)中，打开您的代理。
1. 在边栏中，展开 **高级设置** 抽屉。
1. 在 **开发人员** 下，单击 **查看代码片段**。
1. 复制为您的代理预先填充的代码片段。

有关更多信息，请参阅[Call agents from code](/langsmith/fleet/code)。

## 暂停代理

要暂停代理，请暂停其通道：1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-manage-agent-settings)中，打开您的代理。
1. 在侧边栏中，展开 **Channels** 抽屉。
1. 单击 **暂停频道** 按钮。

<Tip>
要恢复，请单击 **恢复频道** 按钮。
</Tip>

## 删除代理

要永久删除代理：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-manage-agent-settings)中，打开您的代理。
1. 在边栏中，展开 **高级设置** 抽屉。
1. 在 **危险区域** 部分中，单击 **删除代理**。
1. 要确认删除，请单击 **删除** 按钮。

<Warning>
此操作无法撤消。它将永久删除代理、链接到代理的所有线程，并取消链接任何附加的通道。
</Warning>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/manage-agent-settings.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>