<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Build an agent with LangSmith Studio | https://docs.langchain.com/langsmith/build-an-agent -->

# 使用 LangSmith Studio 构建代理

在 Studio 中描述一个代理，让 LangSmith Chat 起草其配置，然后查看、保存和测试它，而无需编写代码。

LangSmith Studio 根据描述构建无代码代理。您描述代理应该做什么，[LangSmith Chat](/langsmith/chat)起草其配置，并在保存之前检查每个步骤。然后，您无需离开 Studio 即可测试代理并查看其痕迹。

当您需要一个没有本地项目或部署的工作代理时，请使用它。要从您自己的计算机上的文件构建代理，请参阅[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)。结果是一个常规的 [agent](/langsmith/agent-registry#agent)，因此它的跟踪、仪表板和评估器的行为与您自己检测的行为相同。 Studio 构建了与 [Fleet](/langsmith/fleet) 相同类型的无代码代理，因此有关工具、频道、时间表和技能的 Fleet 页面适用于它。

> [!注意]
>
> [LangSmith Cloud](/langsmith/cloud) 上提供基于代理的工作区。它们在 [self-hosted](/langsmith/self-hosted) LangSmith 上不可用。要检查您的工作区是否基于代理，请查看左上角的控件。在基于代理的工作区中，它是一个为您的工作区命名的工作区切换器。在[project-based](/langsmith/observability-concepts#tracing-projects)工作区中，它显示LangSmith徽标。创建代理需要`fleet-agents:create`[permission](/langsmith/fleet/access-and-oversight)，它涵盖了所有无代码代理，包括在Studio中内置的代理。如果没有它，Studio 会显示“向工作区管理员询问创建代理的权限”。

## 启动一个新的代理

从任一位置打开 **构建代理** 屏幕：

* **Studio**：在左侧导航中，选择“**所有代理**”，单击“**Studio**”，然后单击“**构建新代理**”。
* **新代理菜单**：在[new agent menu](/langsmith/create-an-agent#start-from-the-new-agent-menu)中的**构建**下，单击**无代码**。

![The Build an agent screen in Studio, with a prompt box that reads Build me an agent that, a model menu, a send icon, six template cards, and a Build in code button.](https://mintcdn.com/langchain-5e9cc07a/tGosUF7lrl5yN4aT/langsmith/images/studio-build-an-agent-light.png?fit=max\&auto=format\&n=tGosUF7lrl5yN4aT\&q=85\&s=bd96253e330d772b8676187a7f81615c)

## 描述代理

描述代理：1. 在“为我构建一个代理……”框中，描述代理应该执行的操作，最多 8,000 个字符。要从示例开始，请单击模板卡：**日程管理器**、**幻灯片设计器**、**支持分类**、**项目经理**、**深度研究员**或**数据分析师**。每张卡都列出了其代理使用的应用程序。卡片会填写提示，您可以在发送前对其进行编辑。
2. （可选）从框左下角的模型菜单中，选择 Chat 用于起草代理的模型。 **自动** 使用 LangSmith 托管模型（如果可用）。否则，菜单将以工作区的默认聊天模型启动。此选择仅适用于聊天。您在[Basics step](#configure-the-agent)中设置代理自己的模型。
3. 单击 **使用 AI 构建** 图标。

要改为在代码中构建代理，请单击模板卡下方的 **在代码中构建**。它会打开 **使用代码构建** 窗格，其中提供由 LangSmith 托管的 [Managed Deep Agents](/langsmith/python/managed-deep-agents-overview) 或您自己托管的开源框架。有关更多信息，请参阅[Create an agent](/langsmith/create-an-agent#start-from-the-new-agent-menu)。

## 生成草稿Chat 首先起草代理的姓名、描述和说明。填写完所有三个内容后，LangSmith 将创建代理并在 **Instructions** 步骤打开其配置。

> [!注意]
>
> 在您单击 **保存** 之前，代理从此时开始存在。它显示在工作区中每个人的座席列表和座席切换器中。如果您离开页面而不单击“**取消**”，代理将保留在工作区中。要删除它，请参阅[Save or cancel](#save-or-cancel)。

如果聊天在填写名称、描述和说明之前停止，请单击 **重试** 再次发送原始提示。 **重试**仅在创建代理之前出现，因此重试不会创建第二个代理。

然后，聊天会一次建议一个剩余步骤：连接、频道和时间表。您还可以直接编辑任何步骤。

## 配置代理

**配置代理**视图将配置列为步骤：* **基础知识**：代理的**名称**、其功能的**描述**以及支持其响应的**模型**。该名称是您在代理切换器中看到的标签。 **型号** 列表显示为 [Fleet](/langsmith/fleet/manage-agent-settings#change-the-model) 启用的相同型号。
* **说明**：代理应该做什么以及它应该如何工作。
* **连接**：代理可以使用的应用程序和工具，通过 **添加连接** 添加。详细信息见列表。
* **频道**：人们可以与客服人员聊天的地方，通过 **添加频道** 添加。选项包括 Slack、Gmail、Outlook 和 Microsoft Teams。 Microsoft Teams 带有 **管理员** 徽章，并且仅适用于具有共享连接的代理。 Studio 将通道设置与其余配置分开保存。欲了解更多信息，请参阅[Channels](/langsmith/fleet/channels)。
* **时间表**：代理自行制定的[scheduled runs](/langsmith/fleet/schedules)，通过**添加时间表**添加。

当您编辑现有代理时，视图还会显示 **技能** 和 **内存**。欲了解更多信息，请参阅[Skills](/langsmith/fleet/skills)。

在 **连接** 中，**连接类型** 标题显示代理使用的帐户：* **共享**（固定凭据）：每个人都使用一组连接的帐户。
* **每用户**（用户凭据）：每个人连接自己的帐户。

Studio 将新代理创建为 **每用户**。标题显示类型但不会更改它。有关更多信息，请参阅[Agent identity](/langsmith/fleet/agent-identity)。

帐户设置立即生效，而工具选择将保留在草稿中，直到您保存。对于每个工具，选择一个选项：

* **自动**：代理无需询问即可运行该工具。
* **询问**：代理在运行工具之前请求批准。
* **删除**：该工具已从代理中删除。

## 保存或取消

要保存，请单击 **配置代理** 标题中的 **保存**，或单击聊天编辑器上方卡片上的 **保存代理**。仅当有需要保存的内容时，该卡才会出现。保存将关闭聊天并返回到 Studio，您可以在其中测试代理。

要离开而不保留代理，请单击“**取消**”。由于代理已存在，因此 **取消代理创建？** 对话框会要求您确认：

* **删除代理**：永久删除代理并放弃其配置。
* **继续构建**：返回到配置。如果您在 Chat 完成初稿之前取消，该对话框将提供 **放弃并离开** 而不是 **删除代理**，并且不会创建任何内容。

## 测试代理

保存后，Studio 将打开与代理的聊天。给它发消息来尝试一下。当代理响应时，聊天旁边的跟踪面板会填充运行的跟踪。

在 Studio 中，您通过聊天测试无代码代理，因此需要具有图形视图的代理的 **Interact** 无法使用。

## 稍后更改配置

编辑代理需要代理上的 `fleet-agents:update` [permission](/langsmith/fleet/access-and-oversight) 和编辑访问权限。如果没有它们，配置将打开并显示 **只读配置** 横幅。

要在 Studio 中打开现有代理，请使用任一路径：

* 在左侧导航中，选择“**所有代理**”，单击“**Studio**”，单击“**选择现有代理**”，然后从列表中选择代理。
* 在代理切换器中选择代理，然后单击左侧导航中的 **Studio**。

要编辑代理的配置，请使用以下任一控件：

* 在 Studio 聊天中，单击“**编辑**”。
* 在代理的概述中，单击 **代理设置** 图标，然后单击 **编辑配置**。两者都在 **Basics** 步骤中打开配置。进行更改并单击**保存**。 **取消**会丢弃它们并返回 Studio。

如果您要求 Chat 从 LangSmith 中的其他位置更改代理，它会在 Studio 中打开配置并保留对话。

## 寻找痕迹和环境

Studio 仅使用 **Production** [environment](/langsmith/agent-environments) 创建代理，并且其运行在那里。只有当有东西向其他环境报告时，它才会获得其他环境。

要查找代理的踪迹，请选择代理并打开 **跟踪**。要查看其环境，请阅读 [agent Overview](/langsmith/navigate-agents#read-the-agent-overview) 上的摘要。

LangSmith 在 Studio 运行时上运行代理，因此您无法为其创建代理服务器。 [agent environment deploy flags](/langsmith/deploy-to-agent-environment) 不适用，并且其概述标题中的 **代理服务器** 链接被禁用。

## 另请参阅

* [Test from Studio](/langsmith/studio)
* [Create an agent](/langsmith/create-an-agent)
* [Navigate agents](/langsmith/navigate-agents)
* [Agent Registry](/langsmith/agent-registry)
* [Agent environments](/langsmith/agent-environments)
* [Fleet](/langsmith/fleet)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/build-an-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。