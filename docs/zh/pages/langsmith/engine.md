<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Find and fix your agent's issues with LangSmith Engine | https://docs.langchain.com/langsmith/engine -->

# 查找并修复代理与 LangSmith 引擎的问题

使用 LangSmith 引擎自动检测并解决跟踪项目中重复出现的问题。

LangSmith 引擎可帮助您发送更可靠的代理，而无需手动搜索痕迹。它是用于代理工程的 LangSmith 代理：根据您的生产跟踪，它会显示重复出现的问题，诊断其根本原因，并在开发生命周期的每个阶段推动修复。有关产品概述，请参阅[Engine](/langsmith/engine-overview)。

## 引擎如何工作

每个问题都经过一个闭环，其中引擎：

1. 检测跟踪中重复出现的问题。
2. 根据您的痕迹和连接的源代码诊断根本原因。
3. 提出修复作为拉取请求。
4. 生成评估器和基本事实[dataset examples](/langsmith/manage-datasets)来捕获回归。
5. 如果问题在关闭后重新出现，则自动重新打开该问题。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
    detect["Detect recurring issue"]:::trigger --> diagnose["Diagnose root cause"]:::process
    diagnose --> fix["Propose fix as PR"]:::process
    fix --> prevent["Generate evaluator and dataset examples"]:::output
    prevent --> close["Close issue"]:::decision
    close -->|"resurfaces"| detect

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
```

本页介绍如何设置引擎、完成修复和评估循环、控制成本以及发送通知。

## 引擎如何对跟踪进行采样和优先级排序在为每次扫描选择和排名跟踪时，引擎会分析跟踪内容和运行反馈。它将反馈（包括在线评估者分数、注释队列分数和通过 SDK 提交的用户反馈）视为高优先级信号，而不是补充数据。

要应用此信号，引擎：

* 读取项目中存在的反馈键，并为每个键专门提取低分跟踪，因此示例包含评估者分数较低的跟踪，而不是让它们保留在新近度中。
* 在筛选样本时，将具有非空反馈分数的迹线优先于其他迹线。
* 保留分析上下文中每个跟踪的反馈分数，即使跟踪有效负载被压缩以适应上下文限制也是如此。

任何向运行写入反馈的源都会自动促成此优先级排序。除了评估器或注释队列之外，引擎不需要任何设置。

## 设置引擎

设置引擎分为两步：[Organization Admin](/langsmith/rbac#organization-admin)首先为[workspace](/langsmith/administration-overview#workspaces)启用引擎，然后任何用户都可以为每个跟踪项目配置引擎。<Note>
  在自托管 LangSmith 上，操作员必须在 LangSmith Helm 图表中启用引擎，然后任一步骤可用。请参阅[Enable Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine)和[Engine on Self-hosted](/langsmith/engine-self-hosted)。
</Note>

### 为您的组织启用引擎

<Note>您必须是[**Organization Admin**](/langsmith/rbac#organization-admin)才能启用引擎。要查找您的管理员，请打开 **设置**，选择 **访问和安全** 下的 **成员**，然后查找具有 **组织管理员** 角色的成员。</Note>

<Steps>
  <Step title="Open Engine enablement">
    在[LangSmith console](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-engine)中，点击左下角的**设置**，然后选择**引擎**下的**引擎启用**。
  </Step>

  <Step title="Toggle Enable Engine">
    打开 **启用引擎** 并确认 AI 功能使用条款。该对话框逐字显示以下产品内通知：

    > LangSmith AI 功能由 LangChain 托管推理提供支持，为您的可观察性工作流程带来智能。启用 LangSmith AI 后，您的团队可以更快地发现问题、运行更智能的评估并构建更可靠的 LLM 申请。通过启用此功能，您组织的跟踪数据将使用 LangChain 管理的 LLM 密钥进行处理。遵守我们的服务条款。
  </Step>
</Steps>

启用引擎后，组织中的任何团队成员都可以为其跟踪项目进行设置。<Tip>
  如果您想关闭引擎，请将相同的设置切换为关闭。这将停止引擎的所有自动运行并停止您帐户中的未来计费。
</Tip>

### 了解 LCU 成本

引擎以 **LangChain 计算单元 (LCU)** 收费，这是一个结合了计算、存储、内存和 LLM 支出的标准化工作单元。 LCU 消耗随着分析的跟踪数量、引擎为诊断和修复问题而进行的 LLM 调用的数量和复杂性以及任何连接的存储库的大小而变化。每个 LCU 的成本为 **\1.50 美元**。有关预期 LCU 使用量的估计，请参阅 [LangSmith Usage Calculator](https://www.langchain.com/pricing#pricing-calc)。

引擎分两个阶段运行：

|相|触发|典型的 LCU 使用情况 |
| ------------------- | ---------------------------------------------------- | ----------------- |
| **初始化** |第一次在项目上启用引擎 | 30-40 个 LCU |
| **重复扫描** |每 6 小时自动 | 10-15 个 LCU |在初始化时，引擎会审核过去的跟踪、集群并按严重性对问题进行优先级排序，并对提示或代码提出修复建议（如果存储库已连接）。无论是否发现新问题，都会按 6 小时计划运行定期扫描，并发现以前未检测到的新问题。

### 设置支出限额并监控使用情况

组织管理员可以在两个级别设置支出限制：

* **组织范围限制**：打开**设置**，选择 **引擎** 下的 **引擎启用**，然后在 **每月 LCU 支出限制** 下输入一个值。
* **每个项目限制**：打开跟踪项目中的 **引擎** 选项卡，单击 **引擎设置** <Icon icon="settings" /> 图标，然后在 **每月 LCU 支出限制** 下设置限制。

您可以输入本币或美元的限额（1 LCU = 1.50 美元）。当达到限制时，LangSmith 暂停新的引擎运行，直到限制提高或下一个每月计费周期开始。

将限制留空以允许无限制的引擎支出。要完全停止引擎，请使用 **设置 > 引擎启用** 中的 **启用引擎** 开关。要监控使用情况，您可以在 **设置** 中的 **引擎启用** 页面上查看组织的每月 LCU 支出，或在每个跟踪项目的 [**Engine Settings**](#configure-engine) 面板中查看每个项目的支出。

### 为跟踪项目设置引擎

<Steps>
  <Step title="Open the Engine tab">
    在 [LangSmith console](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-engine) 中，导航到 UI 侧边栏中的 **Tracing**，选择一个项目，然后单击项目导航中的 **Engine** 选项卡。
  </Step>

  <Step title="Connect a code repository (optional)">
    尽管可选，但建议连接代码存储库。引擎读取您的源代码以找到失败跟踪背后的代码路径，在实际实现中落实其建议的修复，并直接从问题中打开拉取请求。在 **连接代理的代码存储库** 下，在 **GitHub 存储库** 字段中选择一个存储库。仅显示 GitHub 应用程序可以访问的存储库。单击 **管理应用程序访问 →** 以更新权限。有关 GitHub 应用程序设置和组织批准，请参阅[Connect Engine to GitHub](/langsmith/engine-github)。要为引擎提供额外的项目上下文，请在 **Context Hub 存储库** 字段中选择一个存储库。您可以随时从 [**Engine Settings**](#configure-engine) 面板更新任一存储库。
  </Step><Step title="Select preference categories (optional)">
    在**什么对您最重要？**下，选择要优先审核的类别（例如，**工具调用失败**或**延迟**）。单击 **+ 添加特定内容** 来描述自定义问题。您可以随时从 [**Engine Settings**](#configure-engine) 面板更新**首选项**。
  </Step>

  <Step title="Focus on specific traces (optional)">
    在 **关注特定跟踪** 下，按运行名称或元数据将引擎的注意力缩小到运行的子集。将其留空以分析所有痕迹。您可以随时从 [**Engine Settings**](#configure-engine) 面板更新范围。欲了解更多信息，请参阅[Focus on specific traces](#focus-on-specific-traces)。
  </Step>

  <Step title="Start analyzing">
    单击**开始分析**。该对话框可能会根据您的项目使用情况显示估计的每月成本范围。引擎可能需要长达 20 分钟的时间来分析项目的跟踪并开始提出建议。在等待期间，您可以在设置面板中点击[set up notifications](#get-notified-about-new-issues)，以便在发现不同优先级的问题时在 Slack 中或通过 Webhook 收到警报。
  </Step><Step title="Review the agent overview document">
    在出现问题之前，引擎会根据您的跟踪生成一个代理概述文档，描述项目的目的、架构和关键指标。查看并编辑文档，然后单击“**接受并继续**”继续。如果概述不准确，请在继续之前对其进行编辑，因为引擎将其用作所有分析的上下文，因此此处的准确性会影响检测到的问题的质量。您可以随时从[**Engine Settings**](#configure-engine)面板进行更新。
  </Step>
</Steps>

<Frame>
  <img alt="Setup dialog showing the code repository field and category selections for prioritizing issue types" />

  <img alt="Setup dialog showing the code repository field and category selections for prioritizing issue types" />
</Frame>

### 关注特定痕迹

将引擎聚焦于重要的跟踪，以保持分析精确并减少浪费的 LCU 支出。当项目混合多个代理或工作负载并且您希望引擎仅分析其中的某些代理或工作负载时，请使用跟踪范围（**关注特定跟踪**控件）。例如，如果一个项目同时运行生产聊天机器人和夜间批处理作业，则范围为`Run Name is chatbot`，以便引擎忽略批处理运行。默认情况下，引擎会分析项目的所有跟踪。

使用相同的控件在两个位置之一设置范围：* **引擎设置**：在**查找并修复代理的问题**面板中，**关注特定跟踪**下。
* **引擎设置**：在[**Engine Settings**](#configure-engine)面板的**关注特定轨迹**部分。此处的编辑会自动保存。

使用跟踪项目的 **Tracing** 选项卡上使用的相同 [filter editor](/langsmith/filter-traces-in-application#create-and-apply-filters) 添加范围条件。您可以添加每种条件一个，**最多两个**：

* **运行名称**：选择运行或代理名称。值字段根据项目最近跟踪中的运行名称自动完成。
* **元数据**：选择一个元数据键，然后选择一个值。两者都根据项目最近运行中存在的元数据自动完成。

要添加条件，请从字段选择器中选择其类型，填写值，然后单击“**添加**”。每个条件都显示为一个筹码，例如 `Run Name is chatbot` 或 `env is prod`。单击芯片上的 ****** 可消除该情况。<Note>
  **范围限制：** 范围过滤器仅接受运行名称和元数据条件。您无法通过反馈键、评估者名称或分数阈值来确定引擎的扫描范围。要将引擎集中在具有特定评估者低分的跟踪上，请使用 [**Preferences** and **Agent overview** settings](#configure-engine) 告诉引擎要优先考虑哪些内容。引擎已经自动考虑所有反馈信号。参见[How Engine samples and prioritizes traces](#how-engine-samples-and-prioritizes-traces)。
</Note>

范围确定引擎分析哪些跟踪来检测问题并构建代理概述文档。初始设置期间设置的范围适用于引擎的第一次扫描。稍后在[**Engine Settings**](#configure-engine)面板中更改范围不会立即重新运行引擎；它适用于每 6 小时运行一次的下一次扫描。

## 浏览和过滤问题

设置完成后，**引擎**选项卡会在左侧面板中显示自动检测到的问题的列表。每个条目都会显示标题、简短描述、贡献痕迹的数量以及最近发现问题的时间。每个问题都标有故障类别，例如**无声工具错误**或**幻觉**。有关引擎分配的类别的完整列表以及描述和检测方法，请参阅[Engine issue categories](/langsmith/engine-issue-categories)。

在列表顶部，您可以单击：* **过滤问题**图标可按**优先级**、**状态**和**标签**进行过滤。
* **对问题进行排序** 图标可按 **严重性**、**上次更新** 和 **创建** 进行排序。
* **引擎设置** <Icon icon="settings" /> 图标至 [configure Engine](#configure-engine)。

单击任何问题即可在右侧面板中显示其详细信息。

如果设置完成后没有出现问题，则引擎在分析的跟踪中没有发现重复出现的模式。尝试在收集更多痕迹后回来查看。

## 审查一个问题

单击列表中的任何问题以打开其详细信息面板。顶部的诊断描述了问题及其影响。

**链接跟踪**部分列出了支持诊断的跟踪。单击任意轨迹可打开其详细信息面板。欲了解更多信息，请参阅[Manage a trace](/langsmith/manage-trace)。单击本部分右上角的[**Add offline examples**](#add-offline-examples)，从生产跟踪输入生成自定义地面实况[dataset examples](/langsmith/manage-datasets)以进行离线评估。

**建议的修复**部分描述了该问题并建议如何解决它，其中可能包括特定代码或提示更改（如果连接了存储库）。

**离线示例**部分建议从触发问题的生产跟踪输入生成的数据集示例，以用于离线评估。## 对问题采取行动

每个问题都有一个用于对其进行操作的工具栏：修复它、监视它或关闭它（解决或标记为错误标记），并设置其优先级。

### 更改优先级

从优先级下拉列表中选择 **低**、**中** 或 **高** 以更新问题的优先级。您可以选择提供一个原因，该原因会反馈到引擎中，以帮助随着时间的推移改进其分析。

### 修复：完成建议的修复

单击“**修复**”开始完成建议的修复。修复问题有两个步骤，因此修复既已发布又可测试：

1. [**Apply the code change**](#open-a-pull-request)：使用建议的修复打开拉取请求。
2. [**Add offline examples**](#add-offline-examples)：捕捉问题出现的痕迹作为评估示例。

完成后，您可以直接从此处标记已解决的问题，这是[resolving from Close](#close-or-reopen-an-issue)的快捷方式。要放弃修复而不解决问题，请将其丢弃。如果正在观看该问题，则丢弃也会停止观看该问题。

<Note>
  修复仅适用于未解决的问题：[reopen](#close-or-reopen-an-issue) 首先解决或错误标记的问题。
</Note>

#### 打开拉取请求应用修复意味着在连接的存储库中打开包含建议的代码更改的 GitHub 拉取请求。如果还没有，请先连接存储库。一旦存在拉取请求，引擎就会直接链接到它（及其分支），并在整个问题中反映 PR 的状态（打开、合并或关闭）。您还可以将问题的修复上下文复制到剪贴板，以便与法学硕士或编码助理一起使用。引擎关闭了LangChain堆栈的循环：它可以对任何连接的存储库提出代码更改建议，包括使用[Deep Agents](/oss/python/deepagents/overview)、[LangChain](/oss/python/langchain/overview)和[LangGraph](/oss/python/langgraph/overview)构建的代理。

#### 添加离线示例

此步骤捕获作为地面事实[dataset examples](/langsmith/manage-datasets)出现问题的痕迹，因此您可以在修复进入生产之前离线评估修复。您还可以从页面下方的 **链接跟踪** 部分开始此操作。1. 单击“链接跟踪”列表右上角的“添加离线示例”，打开“添加为离线示例”对话框。
2. 检查每条迹线。该对话框显示输入、代理生成的错误输出以及作为自定义地面实况示例的建议预期输出。
3. 单击“**添加到数据集**”直接添加它们，或单击“**在注释队列中编辑**”先查看它们。
4. 在注释队列中，每个示例显示运行输入以及引擎提出的参考输出，其结构为从跟踪分析生成的名为[assertions](/langsmith/assertions)。每个断言都是一个简短的断言，描述正确答案应该或不应该包含的内容。根据需要编辑断言，使用 **+ 添加断言** 添加新断言，然后单击 **添加到数据集并继续** 以完成每个示例。

欲了解更多信息，请参阅[Manage datasets](/langsmith/manage-datasets)、[Use annotation queues](/langsmith/annotation-queues)和[Use assertions](/langsmith/assertions)。

### Watch：关注一个问题

观看会使问题保持开放状态以供监控，而不解决问题或将其标记为错误标记。当您尚未准备好解决问题但仍想知道问题是否持续发生时，请单击“观看”。要在关注的问题再次出现时收到提醒，请单击 **通过 Slack 提醒我**，这将打开 [Engine Settings](#configure-engine) 面板的 **通知** 部分。

当新跟踪链接到关注的问题时，引擎会将其移至列表顶部并显示到达的新跟踪数，以便您可以选择修复或继续关注。

<Note>
  观看仅适用于没有正在进行的拉取请求的开放问题：放弃修复以再次观看问题。解决关注的问题，或将其标记为错误标记，会自动停止关注。
</Note>

### 关闭或重新打开问题

结束记录您的审核结果。点击：

* **关闭** 将问题标记为已解决。
* **错误标记** 将问题视为不真实或不值得修复而忽略。

对于任一结果，您都可以选择提供原因，该原因会反馈到引擎的分析中。

您可以随时重新打开已关闭的问题。单击 **重新打开** 以清除任何正在进行的修复，并停止查看该问题（如果正在查看）。当引擎检测到在以后的跟踪中重复出现相同的问题时，它还会自动重新打开问题。

## 通过 CLI 列出问题

您可以使用 [LangSmith CLI](/langsmith/cli) 以编程方式列出问题。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# List issues for a project
langsmith project issues list --project <project-name>
```## 获取有关新问题的通知

当引擎打开新问题、将新跟踪链接到现有问题或无法完成运行时，它可以通知您。将这些通知传递到 **Slack 通道**、**HTTP Webhook 端点**，或两者。每个目标都有自己的事件类型和最低优先级，因此您可以将紧急问题路由到寻呼 Webhook，同时将每个问题发送到 Slack 通道。

从 [**Engine Settings**](#configure-engine) 面板管理通知目标：打开跟踪项目的 **引擎** 选项卡，单击 **引擎设置** <Icon icon="settings" /> 图标，然后在 **通知** 下单击 **+ 添加目标**。

### 通知 Slack 频道

<Steps>
  <Step title="Connect a Slack workspace">
    连接 Slack 工作区是您执行一次的组织级操作，而不是针对每个项目执行一次。连接或断开工作区需要 `organization:manage` 权限。在 [LangSmith console](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-engine) 中，打开 **设置**，转到组织的 **常规** 设置，然后在 **Slack** 下单击 **连接 Slack**。在 Slack 中授权 LangSmith 应用程序。您可以将多个 Slack 工作区连接到一个组织。
  </Step><Step title="Add a Slack destination">
    在跟踪项目的 **引擎** 选项卡上，单击 **引擎设置** <Icon icon="settings" /> 图标，然后单击 **添加目标**。将 **Deliver to** 字段设置为 **Slack**，然后在 **Channel** 下选择工作区和通道。
  </Step>

  <Step title="Choose events and priority">
    在**通知时间**下，选择哪个[event types](/langsmith/engine-webhooks#event-types)向频道发布消息。在 **最低优先级**下，选择触发通知的最低优先级 [severity](/langsmith/engine-webhooks#severity-filtering)。单击“**添加目的地**”进行保存。
  </Step>
</Steps>

LangSmith自动加入您选择的公共频道。要发布到私人频道，请先在 Slack 中邀请 LangSmith 应用程序到该频道。

每条 Slack 消息都包含问题标题、描述和严重性、返回LangSmith的 **查看问题** 链接，以及（对于问题事件）问题随时间重复发生的图表。如果工作区的连接变得无效（例如，应用程序从 Slack 中删除），其目标将停止传送，直到您从组织的 **常规** 设置重新连接它。

### 发送到 webhook要将引擎事件转发到您自己的事件管理、寻呼或聊天工具，请添加目标并将 **传递到** 字段设置为 **Webhook**。输入 URL 和（可选）自定义标头。 Webhook 交付已签名，因此您可以验证其真实性。有关完整的事件负载参考、签名秘密验证和传递语义，请参阅[Engine webhook events](/langsmith/engine-webhooks)。

## 配置引擎

<Note>
  引擎专门使用 **LangChain 托管推理**。不支持自带密钥 (BYOK)；您无法为引擎提供您自己的提供商 API 密钥。
</Note>

在跟踪项目中，单击 **Engine** 选项卡上的 **Engine Settings** <Icon icon="settings" /> 图标以打开 **Edit Engine Settings** 面板。从这里您可以配置：* **代理概述**：编辑您的代理概述文档，以随着应用程序的发展保持引擎对项目的准确理解。
* **首选项**：区域引擎应关注、优先考虑或忽略的区域。引擎将这些视为权威，并在下次扫描时将它们折叠到代理概述文档中。选择类别芯片，例如 **成本和令牌**、**延迟** 或 **工具调用失败**，或单击 **+ 添加特定内容** 来描述自定义问题。更改将在下次扫描时生效。
* **引擎支出**：查看该项目本月至今的引擎 LCU 支出。单击“**设置限制**”以限制每月支出。当达到每月限制时，新的运行将暂停。
* **关注特定跟踪**：窄引擎关注按运行名称或元数据运行的子集。编辑自动保存并在下次扫描时生效。范围条件仅接受运行名称和元数据；您无法按反馈键或分数进行过滤。参见[Focus on specific traces](#focus-on-specific-traces)。* **通知**：单击 **添加目标** 以添加 Slack 通道或 Webhook 目标，以便在引擎检测到新问题时接收通知。设置每个目的地的最低优先级以控制哪些问题触发通知。参见[Get notified about new issues](#get-notified-about-new-issues)。
* **代码存储库**：连接或更新 GitHub 存储库，以便代理在诊断问题时可以引用源代码。可以选择设置**子文件夹**和**分支**（默认为存储库默认值）。设置请参见[Connect Engine to GitHub](/langsmith/engine-github)。
* **Context 存储库**：连接 Context Hub 存储库，以便引擎可以针对说明、文档和链接技能提出修复建议。
* **暂停**：默认情况下，引擎每 6 小时扫描一次您的痕迹。单击“**暂停**”停止扫描而不删除现有问题，或单击“**恢复**”继续扫描。
* **删除所有问题**：此操作无法撤消。所有问题和设置都将被永久删除。

## 另请参阅* [Engine](/langsmith/engine-overview)：产品概述以及引擎在开发生命周期中的位置。
* [Connect Engine to GitHub](/langsmith/engine-github)：连接LangSmith云中的存储库，或创建和配置您自己的 GitHub 应用程序以进行自托管部署。
* [Engine issue categories](/langsmith/engine-issue-categories)：引擎分配给检测到的问题的故障类别的参考。
* [Engine webhook events](/langsmith/engine-webhooks)：事件负载参考、签名秘密验证和传递语义。
* [Engine on self-hosted](/langsmith/engine-self-hosted)：自托管架构和数据处理。
* [Manage datasets](/langsmith/manage-datasets)、[Use annotation queues](/langsmith/annotation-queues) 和 [Use assertions](/langsmith/assertions)：使用引擎生成的离线示例。
* [LangSmith CLI](/langsmith/cli)：以编程方式列出和管理问题。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>