<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up LangSmith Engine | https://docs.langchain.com/langsmith/engine-setup -->

# 设置LangSmith引擎

为您的组织启用 LangSmith 引擎，为跟踪项目打开它，并配置它分析的内容。

设置 [LangSmith Engine](/langsmith/engine) 需要两个步骤。 [Organization Admin](/langsmith/rbac#organization-admin) 首先为组织启用引擎。然后，任何 [role](/langsmith/rbac) 可以更新跟踪项目的用户都会为每个跟踪项目或代理环境打开引擎。引擎运行后，[configure it](#configure-engine) 专注于对您重要的问题和跟踪。

> [!注意]
>
> 在自托管 LangSmith 上，操作员必须在 LangSmith Helm 图表中启用引擎，然后任一步骤可用。在 [BYOC](/langsmith/byoc) 上，组织管理员还必须在引擎运行之前添加模型提供者凭据。参见[Engine on self-hosted and BYOC](/langsmith/engine-self-hosted)。

## 为您的组织启用引擎

> [!注意]
>
> 您必须是[**Organization Admin**](/langsmith/rbac#organization-admin)才能启用引擎。要查找您的管理员，请打开 **设置**，选择 **访问和安全** 下的 **成员**，然后查找具有 **组织管理员** 角色的成员。

**1.打开引擎设置**

在[LangSmith console](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-engine-setup)中，点击左下角的**设置**，然后选择**引擎**下的**引擎**。

**2.切换启用引擎**

打开 **启用引擎** 并确认 AI 功能使用条款。该对话框逐字显示以下产品内通知：> LangSmith AI 功能由 LangChain 托管推理提供支持，为您的可观察性工作流程带来智能。启用 LangSmith AI 后，您的团队可以更快地发现问题、运行更智能的评估并构建更可靠的 LLM 申请。通过启用此功能，您组织的跟踪数据将使用 LangChain 管理的 LLM 密钥进行处理。遵守我们的服务条款。

启用引擎后，其角色可以更新跟踪项目的任何用户都可以针对跟踪项目或代理环境进行设置。对项目具有只读访问权限的角色则不能。

## 为跟踪项目打开引擎

**1.打开引擎并选择一个项目**

在 [LangSmith console](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-engine-setup) 中，选择 UI 侧栏中的 **Engine**。项目选择器列出了已配置的项目。要设置未列出的项目，请单击 **+ 设置另一个项目**，然后在 **选择要分析的项目** 下选择它。跟踪项目中的 **Engine** 选项卡也可用。

**2.连接代码存储库（可选）**连接存储库是可选的，但建议这样做，因为引擎在读取源代码时会发现更好的问题。参见[Why connect GitHub](/langsmith/engine#why-connect-github)。在 **连接代理的代码存储库** 下，选择引擎应使用的存储库。仅显示 GitHub 应用程序可以访问的存储库。单击“**管理应用程序访问权限→**”以更新权限。有关 GitHub 应用程序设置和组织批准，请参阅[Connect Engine to your repository](/langsmith/engine-repositories)。要为引擎提供额外的项目上下文，请在 **Context Hub 存储库** 字段中选择一个存储库。

还要在跟踪上设置`revision_id`，以便引擎可以将每个跟踪与生成它的提交相匹配。然后，引擎从运行的代码中进行推理，例如，当指标回归时，通过比较两个版本之间传送的提交。参见[Record the code version on traces](/langsmith/add-metadata-tags#record-the-code-version-on-traces)。

**3.选择偏好类别（可选）**

在**什么对您最重要？**下，选择要优先审核的类别（例如，**工具调用失败**或**延迟**）。单击 **+ 添加特定内容** 来描述自定义问题。参见[Tell Engine what kinds of issues to focus on](#tell-engine-what-kinds-of-issues-to-focus-on)。

**4.选择分析级别**

在**分析级别**下，选择**缩减**、**标准**（默认）或**扩展**。级别越高，分析的痕迹越多，成本也越高。参见[Set the analysis level](/langsmith/engine#set-the-analysis-level)。**5.关注特定痕迹（可选）**

在 **关注特定跟踪** 下，按运行名称或元数据将引擎的注意力缩小到运行的子集。将其留空以分析所有痕迹。参见[Tell Engine which traces to focus on](#tell-engine-which-traces-to-focus-on)。

**6。开始分析**

单击**开始分析**。该对话框可能会根据您的项目使用情况显示估计的每月成本范围。引擎可能需要长达 20 分钟的时间来分析项目的跟踪并开始提出建议。在等待期间，当发现不同优先级的问题时，您可以[set up notifications](/langsmith/engine-notifications)在 Slack 中或通过 Webhook 收到警报。

**7.查看代理概述文档**

在出现问题之前，引擎会根据您的跟踪生成一个代理概述文档，描述项目的目的、架构和关键指标。查看并编辑文档，然后单击“**接受并继续**”继续。如果概述不准确，请在继续之前对其进行编辑，因为引擎将其用作所有分析的上下文，因此此处的准确性会影响检测到的问题的质量。

您可以稍后在 [Configure Engine](#configure-engine) 中更改任何这些选择。要连接 GitHub，请参阅[Connect Engine to your repository](/langsmith/engine-repositories)。要在 Engine 发现问题时在 Slack 中或通过 Webhook 收到警报，请参阅 [Engine notifications](/langsmith/engine-notifications)。

## 配置引擎在**引擎**页面上，单击问题列表顶部的**配置引擎**（齿轮）图标以打开**引擎设置**面板。使用它为引擎提供代理的上下文，告诉它要关注什么，然后连接 Linear。该面板还包含其他地方介绍的设置：

* **代码存储库**和**上下文存储库**：连接或更新诊断问题时引擎读取的 GitHub 存储库。每个 GitHub 存储库都可以有自己的 **子文件夹** 和 **分支**（默认为存储库默认值）。 Context Hub 存储库可让引擎针对说明、文档和链接技能提出修复建议。参见[Connect Engine to your repository](/langsmith/engine-repositories)。
* **通知**：请参阅[Engine notifications](/langsmith/engine-notifications)。
* **部署**：设置基线部署引擎重放问题跟踪。要自动验证引擎建议的修复，请通过预览部署启用修复验证。参见[Validate fixes automatically](/langsmith/engine-fix-validation)。
* **分析级别**：参见[Set the analysis level](/langsmith/engine#set-the-analysis-level)。
* **支出限额**：参见[Set spend limits and monitor usage](/langsmith/engine#set-spend-limits-and-monitor-usage)。
* **暂停**和**删除所有问题**：请参阅[Pause Engine or delete its issues](#pause-engine-or-delete-its-issues)。

### 提供有关您的代理的背景信息在设置过程中，引擎会生成一个代理概述文档，描述项目的目的、架构和关键指标。引擎将其用作所有分析的上下文，因此其准确性会影响检测到的问题的质量。在 **代理概述** 下，编辑文档以添加引擎无法从您的跟踪中推断出的任何相关上下文，并确保其准确。该文档的**用户首选项**部分还收集了引擎具有的[learned from your actions on issues](/langsmith/engine#how-engine-learns-from-your-feedback)，因此您可以在此处查看并更正这些校准。

### 告诉引擎要关注哪些类型的问题

在**首选项**下，列出引擎应关注、优先考虑或忽略的区域。选择类别芯片，例如 **成本和令牌**、**延迟** 或 **工具调用失败**，或单击 **+ 添加特定内容** 来描述自定义问题。引擎将首选项视为权威并将其折叠到代理概述文档中。更改将在下次扫描时生效。

### 告诉引擎要关注哪些跟踪将引擎聚焦于重要的跟踪，以保持分析精确并减少浪费的 LSU 支出。当项目混合多个代理或工作负载并且您希望引擎仅分析其中的某些代理或工作负载时，请使用跟踪范围（**关注特定跟踪**控件）。例如，如果一个项目同时运行生产聊天机器人和夜间批处理作业，则范围为`Run Name is chatbot`，以便引擎忽略批处理运行。默认情况下，引擎会分析项目的所有跟踪。

使用相同的控件在两个位置之一设置范围：

* **引擎设置**：在**查找并修复代理的问题**面板中，**关注特定跟踪**下。
* **引擎设置**：在[**Engine settings**](#configure-engine)面板的**跟踪过滤器**部分。此处的编辑会自动保存。

使用过滤器编辑器添加范围条件。您可以添加每种条件一个，**最多两个**：

* **运行名称**：选择运行或代理名称。值字段根据项目最近跟踪中的运行名称自动完成。
* **元数据**：选择一个元数据键，然后选择一个值。两者都根据项目最近运行中存在的元数据自动完成。要添加条件，请从字段选择器中选择其类型，填写值，然后单击“**添加**”。每个条件都显示为一个筹码，例如 `Run Name is chatbot` 或 `env is prod`。单击芯片上的 ****** 可消除该情况。

> [!注意]
>
> **范围限制：** 范围过滤器仅接受运行名称和元数据条件。您无法通过反馈键、评估者姓名或分数阈值来确定引擎的扫描范围。要将引擎集中在具有特定评估者低分的跟踪上，请在您的 [preferences](#tell-engine-what-kinds-of-issues-to-focus-on) 或 [agent overview](#give-context-on-your-agent) 中进行描述。引擎已经自动考虑所有反馈信号。参见[How Engine selects traces](/langsmith/engine#how-engine-selects-traces)。

范围确定引擎分析哪些跟踪来检测问题并构建代理概述文档。初始设置期间设置的范围适用于引擎的第一次扫描。稍后在[**Engine settings**](#configure-engine)面板中更改范围不会立即重新运行引擎。它适用于下一次扫描。

### 连接到线性

在“线性”下，单击“连接”，选择一个团队，还可以选择新问题的项目，然后单击“保存更改”。 Engine 保留与其创建的问题的持久链接，但不会同步 Linear 的后续编辑。删除所有引擎问题不会删除现有的线性票证。参见[Create a Linear issue](/langsmith/engine-issues#create-a-linear-issue)。## 暂停引擎或删除其问题

引擎按照动态计划扫描您的痕迹，以平衡成本和性能。要停止扫描项目而不删除其现有问题，请单击 [**Engine settings**](#configure-engine) 面板中的 **暂停**。单击 **恢复** 再次开始扫描。

单击同一面板中的 **删除所有问题** 以永久删除项目的问题和引擎设置。此操作无法撤消。

要关闭整个组织的引擎，组织管理员可在 **设置** > **引擎** 下切换 **启用引擎**。这将停止组织的所有自动引擎运行和未来的引擎计费。

## 另请参阅

* [LangSmith Engine](/langsmith/engine)：引擎如何工作、如何学习以及成本如何。
* [Find and fix issues](/langsmith/engine-issues)：查看引擎检测到的问题并采取措施。
* [Connect Engine to your repository](/langsmith/engine-repositories)：连接存储库，以便引擎可以读取您的代码并打开拉取请求。
* [Engine notifications](/langsmith/engine-notifications)：当引擎发现问题时，在 Slack、Jira 或 Webhook 中收到警报。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine-setup.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。