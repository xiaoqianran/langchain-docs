<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage billing in your account | https://docs.langchain.com/langsmith/billing -->

# 管理您帐户中的账单

本页面介绍如何管理您的 LangSmith 组织的账单：

* [Set up billing for your account](#set-up-billing-for-your-account)：完成 Developer 和 Plus 计划的计费设置流程，包括旧帐户的特殊说明。
* [Track contract usage (Enterprise)](#track-contract-usage-enterprise)：查看预付费合约消费。
* [Update your information](#update-your-information-paid-plans-only)：修改您组织的发票电子邮件地址、业务信息和税号。
* [Enforce spend limits](#enforce-spend-limits)：了解如何通过使用限制和数据保留来管理您的支出。
* [LangSmith Deployment billing](#langsmith-deployment-billing)：了解部署费用，比较规模和每小时成本，降低部署成本。

## 为您的帐户设置账单

> [!注意]
>
> 使用本指南之前，请注意以下事项：
>
> * 如果您对[Enterprise](https://www.langchain.com/pricing)计划感兴趣，请[contact our sales team](https://www.langchain.com/contact-sales)。本指南仅适用于我们的自助计费计划。

要为您的 LangSmith 组织设置计费，请导航至 **设置** 下的 [Billing and Usage](https://smith.langchain.com/settings/payments) 页面。根据您组织的设置，有不同的设置指南：

* [Developer plan](#developer-plan%3A-set-up-billing-on-your-personal-organization)
* [Plus plan](#plus-plan%3A-set-up-billing-on-a-shared-organization)

### 开发者计划：为您的个人组织设置计费

在添加信用卡之前，个人组织每月的跟踪次数限制为 5,000 条。添加卡：1. 单击**添加卡以删除跟踪限制**。
2. 添加您的信用卡信息。
3. 完成后，您将不再受到 5,000 条跟踪的费率限制，并且将按照 [pricing](https://www.langchain.com/pricing-langsmith) 页面上指定的费率向您收取任何超出的跟踪费用。

### Plus 计划：在共享组织上设置结算

团队组织每月初始获得 10,000 条跟踪。任何多余的痕迹将按照[pricing](https://www.langchain.com/pricing-langsmith)页面上指定的费率收费。

> [!注意]
>
> 您手动创建的新组织必须包含在 Plus 计划中。如果您看到有关需要升级到 Plus 才能使用此组织的消息，请按照以下步骤操作。

1. 单击“**升级到 Plus**”。
2. 根据需要邀请成员加入您的组织。
3. 输入您的信用卡信息。然后，输入公司信息、发票电子邮件和税号。如果该组织属于企业，请选中 **这是企业** 复选框并输入相应的信息。欲了解更多信息，请参阅[Update your information section](#update-your-information-paid-plans-only)。

## 跟踪合约使用情况（企业）

具有预付费承诺的[**Enterprise plan**](/langsmith/pricing-plans)客户可以使用合同使用跟踪。您必须拥有[⟦T2⟧ permission](/langsmith/organization-workspace-operations)才能访问此功能。查看预付合约消费详情请参见[Contract usage](/langsmith/view-usage#contract-usage)。

> [!注意]
>
> 有关企业计划的更多详细信息，[contact our sales team](https://www.langchain.com/contact-sales)。

## 更新您的信息（仅限付费计划）

要更新您的 LangSmith 组织的业务信息，请前往 **设置** 下的 [Billing and Usage](https://smith.langchain.com/settings/payments) 页面。

### 发票电子邮件

要更新发票的电子邮件地址，请执行以下步骤：

1. 导航到 **计划和账单** 选项卡。
2. 找到付款方式下方显示当前发票电子邮件的部分。
3. 在提供的字段中输入发票的新电子邮件地址。
4. 新的电子邮件地址将自动保存。

您将通过更新的电子邮件地址收到所有未来的发票。

### 商业信息和税号

> [!注意]
>
> 在某些司法管辖区，LangSmith 需要征收销售税。如果您是企业，提供您的税号可能会使您有资格获得销售税豁免。

要更新您组织的业务信息，请执行以下步骤：1. 导航到 **计划和账单** 选项卡。
2. 在发票电子邮件部分下方，您将看到一个标有 **Business** 的复选框。
3. 如果您的组织属于企业，请选中 **企业** 复选框。
4. 将出现一个业务信息部分，允许您输入或更新以下详细信息：
   * 公司名称
   * 地址
   * 适用司法管辖区的税号
5. 选择国家/地区后，将显示适用管辖区的税号字段。
6. 输入必要的信息后，单击“**保存**”按钮保存更改。

这可确保您的业务信息是最新且准确的，可用于计费和税务目的。

## 强制执行支出限制

> [!提示]
>
> 在继续本节优化跟踪支出之前，您可能会发现阅读以下几页很有帮助：
>
> * [Data Retention Conceptual Docs](/langsmith/usage-and-billing#data-retention)
> * [Usage Limiting Conceptual Docs](/langsmith/usage-and-billing#usage-limits)

> [!注意]
>
> 由于其计费的自定义性质，本指南中提到的一些功能目前在企业计划上不可用。如果您使用企业计划并对成本优化有疑问，请通过 [support.langchain.com](https://support.langchain.com) 联系您的销售代表或支持人员。

### 了解您当前的使用情况任何优化过程的第一步都是了解当前的使用情况。有关使用图、粒度使用、发票和合同使用的详细信息，请参阅[View usage](/langsmith/view-usage)。

LangSmith 衡量每个工作区的使用情况，因为工作区通常代表组织内的开发环境或团队。

### 设置使用限制

![P2usagelimitsempty v2](https://mintcdn.com/langchain-5e9cc07a/-XAfdD9knKGGfZBx/langsmith/images/p2usagelimitsempty-v2.png?fit=max\&auto=format\&n=-XAfdD9knKGGfZBx\&q=85\&s=27addecc92b87dd4131683fb8500f96c)

#### 设置工作空间的支出限制

1. 要设置限制，请导航至 **设置** -> **计费和使用情况** -> **使用限制**。
2. 输入所选工作空间的支出限额。 LangSmith 将确定适当数量的基本和扩展跟踪限制以匹配该支出。跟踪限制包括您的计划附带的免费跟踪分配（请参阅[pricing page](https://smith.langchain.com/settings/payments)的详细信息）。

> [!注意]
>
> 对于**仅具有多个工作空间**的组织：为简单起见，LangSmith 将免费跟踪纳入**仅第一个工作空间**的成本计算中。实际上，任何工作空间都可以“消耗”免费跟踪。因此，虽然多工作空间组织的工作区级别支出限制是近似值，但组织级别支出限制是绝对的。

#### 配置跟踪层分布LangSmith 有两个跟踪层：基本跟踪和扩展跟踪。基本跟踪具有基本保留并且是短暂的（14 天），而扩展跟踪具有延长的保留并且是长期的（默认为 180 天，[customizable for Enterprise customers](/langsmith/data-purging-compliance#customize-extended-retention-policy)）。欲了解更多信息，请参阅[data retention conceptual docs](/langsmith/usage-and-billing#data-retention)。

> [!警告]
>
> 从 2026 年 9 月 14 日开始，SaaS 客户的最长长期跟踪保留期将更改为 180 天。企业客户仍然可以自定义每个工作区的延长保留期，直至达到新的最大值。更改仅适用于新跟踪，现有跟踪不受影响。

通过选择 **默认数据保留** 标签下方的选项来设置所需的默认跟踪层。所有跟踪在注册时都会默认具有此层。请注意，由于扩展跟踪的成本高于基本跟踪，因此选择“**扩展**”作为默认数据保留选项将导致计费周期内允许的总体跟踪减少。默认情况下，更新此设置将仅适用于将来的传入跟踪。要应用到工作区中的所有现有轨迹，请选中该复选框。如果默认数据保留设置为 **Base**，您可以选择使用滑块在基本跟踪和扩展跟踪之间分配跟踪限制。 LangSmith 自动提供对此发行版的建议，但您可以根据您的需要进行定制。例如，如果您正在运行大量自动化或其他可能将跟踪升级为扩展的功能，您可能需要增加扩展跟踪限制。要查看可能升级跟踪的功能的完整列表，[see here](https://docs.langchain.com/langsmith/usage-and-billing#how-it-works:~:text=Data%20retention%20auto%2Dupgrades)。

> [!注意]
>
> 一旦达到延长的数据保留限制，可能会导致跟踪以外的功能停止工作。如果您打算使用此功能，请阅读有关其[functionality and side effects](/langsmith/usage-and-billing#side-effects-of-extended-data-retention-traces-limit)的更多信息。

### 管理痕迹的其他方法

#### 自定义延长保留期（仅限[Enterprise](/langsmith/pricing-plans)）

[Enterprise](/langsmith/pricing-plans) 客户可以在工作区级别自定义延长数据保留期限，以满足合规性要求。默认值为 180 天（截至 2026 年 9 月 14 日），但可以根据组织的需求进行调整。欲了解更多信息，请参阅[Customize extended retention policy](/langsmith/data-purging-compliance#customize-extended-retention-policy)。

#### 更改项目级默认保留每个跟踪项目的数据保留设置均可调整。在项目级别，您可以在两个级别之间进行选择：基础（14 天）或扩展（180 天）。要自定义最长 180 天的延长持续时间，请使用 [workspace-level configuration](/langsmith/data-purging-compliance#customize-extended-retention-policy)（仅限企业）。

在 [agent-based workspace](/langsmith/agents) 中，每个代理的 [environments](/langsmith/agent-environments) 都是其自己的跟踪项目，因此保留是按环境而不是按代理设置的，并且您可以通过代理而不是 **项目** 列表来访问设置。

导航到 **项目** > ***您的项目名称*** > 选择 **保留** 并选择所需的默认保留。这只会影响**未来跟踪**的保留（和定价）。

![P1projectretention](https://mintcdn.com/langchain-5e9cc07a/H9jA2WRyA-MV4-H0/langsmith/images/p1projectretention.png?fit=max\&auto=format\&n=H9jA2WRyA-MV4-H0\&q=85\&s=394b513df5ef31d0309f5f3c78bd315a)

#### 将扩展数据保留应用于一定百分比的跟踪

您可能不希望所有跟踪记录在 14 天后过期。您可以通过创建 [automation rule](/langsmith/rules) 自动延长符合某些条件的跟踪的保留时间。您可能希望将扩展数据保留应用于特定类型的跟踪，例如：

* 所有痕迹的 10%：用于一般分析或分析长期趋势。
* 错误跟踪：彻底调查和调试问题。
* 具有特定元数据的跟踪：用于特定功能或用户流的长期检查。

要配置此：1. 导航到 **项目** > ***您的项目名称*** > 选择 **+ 新建** > 选择 **新建自动化**。在基于代理的工作区中，从代理的环境开始。
2. 命名您的规则并可选择应用过滤器或采样率。有关配置过滤器的更多信息，请参阅[filtering techniques](/langsmith/filter-traces-in-application#filter-operators)。

> [!注意]
>
> 当自动化规则与 [trace](/langsmith/observability-concepts#traces) 中的任何 [run](/langsmith/observability-concepts#runs) 匹配时，跟踪中的所有运行都会升级为延长数据保留（默认情况下为 180 天，[customizable for Enterprise customers](/langsmith/data-purging-compliance#customize-extended-retention-policy)）。

例如，这是保留所有跟踪的 10% 以延长数据保留的预期配置：

![P2sampletraces](https://mintcdn.com/langchain-5e9cc07a/Xbr8HuVd9jPi6qTU/langsmith/images/P2SampleTraces.png?fit=max\&auto=format\&n=Xbr8HuVd9jPi6qTU\&q=85\&s=09bbdf5ef7cf3a5a99d6bf0a704e2143)

如果出于数据收集目的而希望将跟踪子集保留**超过 180 天**，您可以创建另一个运行规则，将一些运行发送到您选择的数据集。数据集允许您存储跟踪输入和输出（例如，作为键值数据集），并且即使在删除跟踪后也将无限期地保留。

### 总结

如果您对进一步管理支出有疑问，请通过[support.langchain.com](https://support.langchain.com)联系支持人员。

## LangSmith 部署计费

除了跟踪之外，LangSmith还通过LangSmith部署对部署的代理进行收费。部署根据其消耗的资源进行计费：* **计算**：每个正在运行的副本请求的 vCPU 和内存，以 LangChain 标准单位 (LSU) 为单位进行测量。 [Autoscaling](/langsmith/cloud-platform-features#scaling) 添加了可计费副本。 [Serverless](/langsmith/cloud-platform-features#serverless) 计算费用在规模缩小时停止，而不是在流量停止时停止。 [Dedicated](/langsmith/cloud-platform-features#dedicated) 连续运行。
* **数据库**：专用数据库费用基于配置的 vCPU 和内存，包括空闲时。运行时自动缩放不会改变数据库费用。数据库磁盘存储和共享无服务器数据库不计费。

托管 Redis 不按任何部署类型或规模计费。

下图显示了每种部署类型的哪些部分需要计费。蓝色部分已计费。绿色部分不计费：

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"theme":"base","flowchart":{"htmlLabels":true,"nodeSpacing":24,"rankSpacing":16,"padding":14,"subGraphTitleMargin":{"top":6,"bottom":10}},"themeVariables":{"fontFamily":"Inter, system-ui, sans-serif","fontSize":"14px","lineColor":"#40668D","primaryColor":"#E5F4FF","primaryTextColor":"#030710","primaryBorderColor":"#006DDD","clusterBkg":"transparent","edgeLabelBackground":"#FFFFFF"}}}%%
flowchart LR
    subgraph serverless["<b>Serverless</b>"]
        direction TB
        SRuntime("<div style='width:210px;text-align:left;line-height:1.45'><b>Runtime</b><br/>1 replica<br/>API server and queue worker<br/><b>Billed</b> while running</div>")
        SDb("<div style='width:210px;text-align:left;line-height:1.45'><b>Shared Postgres database</b><br/>Not billed</div>")
        SRedis("<div style='width:210px;text-align:left;line-height:1.45'><b>Managed Redis</b><br/>Not billed</div>")
        SRuntime ~~~ SDb ~~~ SRedis
    end
    subgraph dedicated["<b>Dedicated</b>"]
        direction TB
        DRuntime("<div style='width:210px;text-align:left;line-height:1.45'><b>Runtime</b><br/>2 or more API servers<br/>1 or more queue workers<br/><b>Billed</b> at all times</div>")
        DDb("<div style='width:210px;text-align:left;line-height:1.45'><b>Dedicated Postgres database</b><br/>vCPU and memory <b>billed</b><br/>Disk storage not billed</div>")
        DRedis("<div style='width:210px;text-align:left;line-height:1.45'><b>Managed Redis</b><br/>Not billed</div>")
        DRuntime ~~~ DDb ~~~ DRedis
    end
    serverless ~~~ dedicated

    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710,rx:10,ry:10
    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900,rx:10,ry:10

    class SRuntime,DRuntime,DDb process
    class SDb,SRedis,DRedis trigger

    style serverless fill:none,stroke:#40668D,stroke-width:1.5px,stroke-dasharray:5 4
    style dedicated fill:none,stroke:#40668D,stroke-width:1.5px,stroke-dasharray:5 4
```

使用量按以下比率转换为 LSU。一个 LSU 的成本为 1.00 美元：

|资源 |评分 |
| - | - |
|运行时 vCPU |每 vCPU 小时 0.0675 LSU |
|运行时内存|每 GiB 小时 0.009 LSU |
|数据库 vCPU |每 vCPU 小时 0.177 LSU |
|数据库内存|每 GiB 小时 0.025 LSU |

每 5 分钟对使用情况进行一次采样，并每小时汇总一次。每个正在运行的可计费容器根据请求的资源而不是实际利用率在该时间间隔内收费。

### 比较大小和每小时成本下表显示了 GCP 中 LangSmith 云上每个 [size](/langsmith/cloud-platform-features#sizes) 的每小时费用。所有费用均以路易斯安那州立大学每小时为单位。

无服务器部署仅在运行时收费。缩小规模的无服务器部署成本为 0 LSU。无服务器部署不会横向扩展，并且其共享数据库不计费：

|无服务器规模 |计费运行时间 |运行时的成本|
| - | - | - |
|小| 0.8 个 vCPU/2 GiB | 0.072 路易斯安那州立大学 |
|中等| 4 个 vCPU/4 GiB | 0.306 路易斯安那州立大学 |
|大| 8 个 vCPU / 8 GiB | 0.612 路易斯安那州立大学 |

专用部署始终按其最短运行时间及其数据库收费。此表假设数据库大小与计算大小匹配：

|专用尺寸|运行时+数据库|最低总数 |
| - | - | - |
|小| 0.2565 + 0.277 | 0.2565 + 0.277 0.5335 路易斯安那州立大学 |
|中等| 0.513 + 0.554 | 0.513 + 0.554 1.067 路易斯安那州立大学 |
|大| 1.026 + 1.108 | 2.134 路易斯安那州立大学 |

> [!注意]
>
> 专用最小运行时间为 2 个 API 服务器副本和 1 个队列工作线程。 [Autoscaling](/langsmith/cloud-platform-features#scaling) 添加 API 服务器或队列工作副本。每个添加的副本都会花费与其大小相应的添加副本速率。

下表显示了每个专用大小的最短运行时间和添加的副本率：|专用尺寸|最短运行时间 |每个添加的副本 |
| - | - | - |
|小| 3 个 vCPU / 6 GiB | +0.0855 路易斯安那州立大学 |
|中等| 6 个 vCPU/12 GiB | +0.171 路易斯安那州立大学 |
|大| 12 个 vCPU/24 GiB | +0.342 路易斯安那州立大学 |

GCP 中LangSmith 云上的专用数据库容量为：

|数据库大小 |产能 |每小时数据库成本|
| - | - | - |
|小| 1 个 vCPU / 4 GiB | 0.277 路易斯安那州立大学 |
|中等| 2 个 vCPU / 8 GiB | 0.554 路易斯安那州立大学 |
|大| 4 个 vCPU/16 GiB | 1.108 路易斯安那州立大学 |

数据库容量因云提供商而异。计算和数据库大小可以是[set independently](/langsmith/cloud-platform-features#sizes)。

追踪和其他产品使用是单独收费的。

[Free Serverless deployments](https://www.langchain.com/pricing) 仅提供小尺寸。在任何**缩减后**设置下，免费部署都不会为任何容器计费。专用部署从来都不是免费的。

要估算部署成本，您还可以使用[pricing page](https://www.langchain.com/pricing)上的部署成本计算器。

> [!注意]
>
> 2026 年 10 月 1 日，基于使用情况的定价取代了每次运行和正常运行时间定价。扩展到零需要新的定价。对于过渡问题，请联系[support](https://support.langchain.com)。

对于大批量部署使用，[contact our sales team](https://www.langchain.com/contact-sales) 讨论自定义定价选项。

### 降低部署成本部署费用基于每个部署请求的计算和数据库资源。要降低部署费用，请运行更少的部署，使用更小的规模，并缩小空闲部署的规模：

* **使用无服务器且缩减时间较短**：无服务器部署在缩减时会停止计算费用。将**之后缩小**设置为`1 hour`，而不是默认的`1 week`。默认情况下，每周至少接收一次请求的部署永远不会缩小规模。无服务器部署具有冷启动并运行一个副本。无服务器尚不适用于 AWS 或 Azure 上的部署，也不适用于自托管和混合部署。
* **在一个部署上运行多个代理**：费用适用于每个部署，而不是每个代理。 [Define multiple graphs](/langsmith/application-structure#define-multiple-graphs-in-one-deployment) 合二为一 `langgraph.json`，以便您的代理共享一组副本和一个数据库。这在 Dedicated 上节省了最多的时间，其中每个部署至少有 2 个 API 服务器副本、1 个队列工作线程和自己的数据库。
* **使用有效的最小大小**：每个运行时副本和每个数据库均按其大小收费。在专用部署中，您可以单独设置计算大小和数据库大小。参见[Sizes](/langsmith/cloud-platform-features#sizes)。* **删除未使用的部署**：空闲的专用部署按其最小副本及其数据库收费。空闲的无服务器部署会被计费，直到其缩小规模为止。
* **限制预览部署**：每个 [preview deployment](/langsmith/preview-builds) 都是一个单独的部署，并且按一次计费。降低**空闲 TTL** 和 **最大并发预览** 以限制运行预览部署的数量和时间。
* **删除不需要的唤醒**：对缩小规模的无服务器部署的请求会再次启动它，包括自动运行状况检查。启用 [cron jobs](/langsmith/cron-jobs) 并安排运行，最多可在到期前 10 分钟启动部署。删除不需要的 cron 作业和运行状况检查。

下图将三种专用部署与运行三个图表的一种专用部署进行了比较：

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"theme":"base","flowchart":{"htmlLabels":true,"nodeSpacing":24,"rankSpacing":36,"padding":14,"subGraphTitleMargin":{"top":6,"bottom":10}},"themeVariables":{"fontFamily":"Inter, system-ui, sans-serif","fontSize":"14px","lineColor":"#40668D","primaryColor":"#E5F4FF","primaryTextColor":"#030710","primaryBorderColor":"#006DDD","clusterBkg":"transparent","edgeLabelBackground":"#FFFFFF"}}}%%
flowchart TB
    subgraph separate["<b>Before: 3 Dedicated deployments, at least 1.6005 LSU per hour</b>"]
        direction LR
        A("<div style='width:130px;text-align:left;line-height:1.45'><b>Agent A</b><br/>2 API servers<br/>1 queue worker<br/>1 database</div>")
        B("<div style='width:130px;text-align:left;line-height:1.45'><b>Agent B</b><br/>2 API servers<br/>1 queue worker<br/>1 database</div>")
        C("<div style='width:130px;text-align:left;line-height:1.45'><b>Agent C</b><br/>2 API servers<br/>1 queue worker<br/>1 database</div>")
        A ~~~ B ~~~ C
    end
    subgraph shared["<b>After: 1 Dedicated deployment, at least 0.5335 LSU per hour</b>"]
        direction LR
        Config("<div style='width:130px;text-align:left;line-height:1.45'><b>langgraph.json</b><br/>agent_a<br/>agent_b<br/>agent_c</div>")
        Runtime("<div style='width:130px;text-align:left;line-height:1.45'><b>Shared runtime</b><br/>2 API servers<br/>1 queue worker</div>")
        Db("<div style='width:130px;text-align:left;line-height:1.45'><b>Shared database</b><br/>1 database</div>")
        Config --> Runtime --> Db
    end

    separate == "Define all graphs in one langgraph.json" ==> shared

    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710,rx:10,ry:10
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68,rx:10,ry:10

    class A,B,C,Runtime,Db process
    class Config neutral

    style separate fill:none,stroke:#40668D,stroke-width:1.5px,stroke-dasharray:5 4
    style shared fill:none,stroke:#40668D,stroke-width:1.5px,stroke-dasharray:5 4
```

下表显示了两项更改的效果。每月费用使用 720 小时：

* **更短的缩减时间**：无服务器小型部署每个工作日、每月 22 天接收 2 小时的请求。
* **多个图表**：三个代理在 GCP 上的专用小型部署上运行。|改变 |之前 |之后 |
| - | - | - |
|更短的缩减时间| `1 week`（默认）：720 小时正常运行时间，\~51.84 LSU 使用 | `1 hour`：\~66 小时的正常运行时间，\~4.75 LSU 使用量。 Savings \~47.09 LSU. |
|多个图表 | 3 次部署：\~1,152 LSU | 1 个部署，包含 3 个图表：\~384 LSU。节省约 768 LSU。 |

自动缩放会增加两种专用设置的运行时间成本。

LangSmith 不支持创建部署后更改部署类型。要迁移到无服务器，请创建一个新的无服务器部署，并使用 [Agent Server API](/langsmith/server-api-ref) 从之前的部署复制数据。您还可以联系 [support](https://support.langchain.com) 寻求迁移帮助。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/billing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。