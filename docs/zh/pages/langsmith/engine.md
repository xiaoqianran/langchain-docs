<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Engine | https://docs.langchain.com/langsmith/engine -->

#LangSmith发动机

LangSmith 引擎是代理工程的代理，将生产跟踪转化为整个开发生命周期中跟踪的问题、修复和数据集。

LangSmith引擎是代理工程的LangSmith代理。根据您的生产跟踪，它会显示重复出现的问题，诊断其根本原因，并提出修复建议，因此您可以交付更可靠的代理，而无需手动搜索跟踪。首先，[set up Engine](/langsmith/engine-setup) 用于跟踪项目。

## 引擎的整个生命周期

对于每个问题，引擎都会显示贡献的跟踪，提出修复方案，通过附加与相同故障模式匹配的新跟踪来保持问题最新，并根据生产跟踪输入创建地面实况数据集示例。

> [卡][Build: Open a pull request](/langsmith/engine-issues#open-a-pull-request)
>
> 通过在连接的存储库中打开拉取请求来应用建议的修复。引擎可以对使用Deep Agents、LangChain和LangGraph构建的代理提出代码更改建议。

> [卡][Test: Generate datasets](/langsmith/engine-issues#add-offline-examples)
>
> 从生产跟踪中创建地面实况数据集示例以进行离线评估，以便您可以在修复发布之前对其进行验证。> [卡][Monitor: Track recurring issues](/langsmith/engine-issues#filter-and-sort-issues)
>
> 按计划扫描您的跟踪项目，以显示、确定优先顺序并诊断重复出现的问题，并在每个问题出现时向其添加新的匹配跟踪。

## Engine 与 Insights 有何不同

Engine 和 [Insights](/langsmith/insights) 都分析您的痕迹，但它们回答不同的问题：

* **Insights** 是一种分析工具。它将跟踪分为自动生成或您定义的类别，并报告每个类别的指标，以便您可以查看使用模式及其变化方式。
* **引擎** 寻找需要解决的具体问题。它打开的每个问题都附带诊断、支持诊断的痕迹以及建议的修复方案。

使用见解来了解人们如何使用您的代理。使用 Engine 找出问题所在以及需要更改的内容。

## 引擎如何工作

引擎按照动态计划扫描每个连接的跟踪项目，以平衡成本和性能，并对发现的问题按严重程度进行聚类和优先级排序。

### 问题生命周期

每个问题都经过一个闭环，其中引擎：1. 检测跟踪中重复出现的问题。
2. 根据您的痕迹和连接的源代码诊断根本原因。
3. 提出修复作为拉取请求。
4. 随着时间的推移跟踪问题，自动添加与相同模式匹配的新跟踪，并生成基本事实[dataset examples](/langsmith/manage-datasets)，以便您可以验证修复。参见[Find and fix issues](/langsmith/engine-issues)。
5. 如果问题在关闭后重新出现，则自动重新打开该问题。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
    detect["Detect recurring issue"]:::trigger --> diagnose["Diagnose root cause"]:::process
    diagnose --> fix["Propose fix as PR"]:::process
    fix --> prevent["Track matching traces and generate dataset examples"]:::output
    prevent --> close["Close issue"]:::decision
    close -->|"resurfaces"| detect

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
```

### 引擎如何选择轨迹

引擎利用多个信号来决定要检查哪些跟踪。它会查找引发错误的跟踪、行为异常的跟踪以及看起来正常的跟踪中的问题，例如不引发错误的错误答案。它还使用其他策划的信号。

跟踪反馈是引擎使用的另一个信号。它包括来自在线评估者和注释队列的分数、来自用户的评分，并跟踪您[flag for Engine](/langsmith/engine-issues#flag-a-trace-for-engine)。跟踪运行后添加的反馈仍然有效，例如一周后审阅者在注释队列中留下的分数。

引擎自动使用来自任何来源的跟踪反馈，因此您无需进行任何设置。当跟踪反馈导致引擎出现问题时，该问题会列出所使用的反馈引擎，以便您可以查看哪些分数或评级出现了问题。欲了解更多信息，请参阅[Review evidence](/langsmith/engine-issues#review-evidence)。

### Engine 如何从您对问题的操作中学习

当您解决问题时，引擎会变得更加准确。在每次计划的扫描中，它都会审查自上次扫描以来您对问题采取的操作，并将每一项操作转化为项目[agent overview](/langsmith/engine-setup#give-context-on-your-agent)的**用户首选项**部分中的一般规则。稍后的扫描使用这些规则来决定标记什么以及如何确定其优先级。

引擎从这些操作中学习，包括您给出的任何原因：

* **关闭问题**或标记它 **错误标记**：引擎将此类问题视为较低优先级。
* **更改问题的优先级**：引擎记录该类别问题对您的客服人员的严重程度。
* **打开拉取请求**：引擎记录该类别是真实的并且值得建议修复。例如，假设您的代理处理付款，并且引擎将包含完整信用卡号的跟踪标记为未经编辑的个人身份信息 (PII)。您的代理按照设计处理卡号，因此您将问题标记为**错误标记**，原因是“此代理将卡号作为结帐的一部分进行处理”。引擎记录支付流程中预期的卡号。如果您不断忽略同一类别中的问题，引擎会一次将该类别的严重性降低一级。它不会跌破低点，因此该模式保持可见，而不会排除紧急问题。

引擎不会从自动化带来的更改（例如拉取请求合并）或通过[LangSmith Chat](/langsmith/chat#engine)采取的操作中学习。要查看或更正引擎所了解的内容，请编辑代理概述的 **用户首选项** 部分。

## 为什么要连接存储库连接 GitHub 存储库或 GitLab 项目是可选的，但当引擎可以读取源代码时，它会发现更多问题和更有用的问题。通过源访问，引擎可以找到失败跟踪背后的代码路径，并将其诊断和建议的修复基于您的实际实现。即使您从不合并引擎拉取请求，这也成立：您可以自己应用修复或将修复上下文复制到编码助手中。

引擎的 GitHub 访问权限已修复。通过 GitHub App，Engine 可以：

* **阅读**您在安装应用程序时选择的存储库。
* **从它创建的修复分支打开拉取请求**。

在 GitLab 上，引擎充当工作区管理员连接其访问令牌的帐户，通常是专用服务帐户。引擎在帐户角色的权限内读取帐户所属的项目，推送修复分支并打开合并请求。引擎永远不会合并拉取或合并请求。它提出的每项更改都会经过您的审查和分支保护规则。您可以随时通过卸载 GitHub 应用程序或断开 GitLab 来撤销访问权限。有关令牌生命周期、沙箱和保留，请参阅引擎安全性的 [GitHub](/langsmith/engine-security#github-integration) 和 [GitLab](/langsmith/engine-security#gitlab-integration) 部分。要连接存储库，请参阅[Connect Engine to your repository](/langsmith/engine-repositories)。

## 管理引擎成本

### 了解路易斯安那州立大学的费用

> [!注意]
>
> LangSmith 云使用 LangChain 托管推理。自托管部署还可以使用 [their own model providers](/langsmith/engine-self-hosted-model-providers)，以及 API 密钥或云身份。 [BYOC](/langsmith/engine-self-hosted#engine-on-byoc) 部署仅使用自己的模型提供程序。对于您自己的提供商，您可以向他们支付模型调用费用，并且 LangChain 对引擎使用收取较低的 LSU 费率。

引擎以 **LangChain 标准单位 (LSU)** 收费，这是一种标准化工作单位，涵盖计算、存储和内存，以及 LangChain 提供的模型推理。 LSU 消耗随着分析的跟踪数量、引擎为诊断和修复问题而进行的 LLM 调用的数量和复杂性以及任何连接的存储库的大小而变化。 LSU 的成本**\每台 1 美元**。有关预期 LSU 使用量的估计，请参阅 [LangSmith Usage Calculator](https://www.langchain.com/pricing#pricing-calc)。在初始化时，引擎会审核过去的跟踪、集群并按严重性对问题进行优先级排序，并对提示或代码提出修复建议（如果连接了存储库）。定期扫描按照动态计划运行，以平衡成本和性能，无论是否发现新问题，并发现以前未检测到的新问题。

### 设置分析级别

分析级别控制引擎分析的项目跟踪数量，以及它使用的 LSU 数量。 [turn on Engine for a project](/langsmith/engine-setup#turn-on-engine-for-a-tracing-project)时选择它，稍后在[**Engine settings**](/langsmith/engine-setup#configure-engine)面板中的**分析级别**下更改：

* **减少**：以更低的成本监控更少的跟踪。
* **标准**（默认）：分析更多符合条件的轨迹以获得更全面的覆盖范围。
* **扩展**：最大程度地覆盖大容量项目。仅适用于具有足够跟踪量的项目。

设置对话框显示估计的每月成本范围，该范围随您选择的级别而更新。

### 设置支出限额并监控使用情况

组织管理员可以在两个级别设置支出限制：* **组织范围限制**：打开**设置**并选择**引擎**下的**引擎**。在本月至今的支出卡上，单击限制芯片并在弹出窗口中设置限制。
* **项目或环境限制**：在跟踪项目或代理环境中打开 **引擎** 选项卡，然后单击 **配置引擎** 图标。在“**支出限制**”下，单击限制筹码（未设置限制时，筹码显示“**无**”）并在弹出窗口中设置限制。

您可以输入 LSU 或 USD 的限额 (1 LSU = \$1)。当达到限制时，LangSmith 暂停新的引擎运行，直到限制提高或下一个每月计费周期开始。

这两个级别的默认值不同：

* **组织范围限制**：选择**默认**、**无限制**或自定义上限。在管理员选择之前，默认情况下适用（每月 750 LSU，750 美元），因此即使没有人设置限制，引擎支出也是有上限的。 **引擎**设置页面命名强制限制及其来源。
* **项目或环境限制**：将弹出框的字段留空表示没有限制。使用 **删除限制** 清除您之前设置的上限。

要停止项目或整个组织的 Engine，请参阅 [Pause Engine or delete its issues](/langsmith/engine-setup#pause-engine-or-delete-its-issues)。要监控使用情况，您可以在 **设置** 中的 **引擎** 页面上查看组织的每月 LSU 支出，或在其 [**Engine settings**](/langsmith/engine-setup#configure-engine) 面板中查看跟踪项目或代理环境的支出。

对于离线自托管部署，支出报告和限制执行有所不同。参见[Air-gapped installations](/langsmith/engine-self-hosted#air-gapped-installations)。

## 开始吧

> [卡][Set up Engine](/langsmith/engine-setup)
>
> 为您的组织启用引擎并为跟踪项目或代理环境打开它。

> [卡][Find and fix issues](/langsmith/engine-issues)
>
> 查看引擎检测到的问题、打开拉取请求并创建数据集示例。

> [卡][Connect Engine to your repository](/langsmith/engine-repositories)
>
> 让引擎读取您的源代码并打开带有建议修复的拉取请求。

> [卡][Engine notifications](/langsmith/engine-notifications)
>
> 将检测到的问题发送到 Slack、Jira 或您的事件管理和分页工具。

## 另请参阅

* [Validate fixes automatically](/langsmith/engine-fix-validation)：重播问题的痕迹以确认问题重现并且引擎的修复解决了问题（测试版，仅限LangSmith 云）。
* [Proactively identify issues with Red Teaming](/langsmith/engine-red-teaming)：在故障到达生产环境之前使用合成请求探测已部署的代理（测试版，仅限LangSmith 云）。
* [Engine security](/langsmith/engine-security)：引擎如何处理您的数据，及其 GitHub 和模型子处理器控件。
* [Engine on self-hosted and BYOC](/langsmith/engine-self-hosted)：在自托管LangSmith实例或BYOC数据平面上安装并运行引擎。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/engine.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。