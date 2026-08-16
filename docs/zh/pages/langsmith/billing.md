<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage billing in your account | https://docs.langchain.com/langsmith/billing -->

# 管理您帐户中的账单

本页面介绍如何管理您的 LangSmith 组织的账单：

- [Set up billing for your account](#set-up-billing-for-your-account)：完成 Developer 和 Plus 计划的计费设置流程，包括旧帐户的特殊说明。
- [Track contract usage (Enterprise)](#track-contract-usage-enterprise)：查看预付费合约消费。
- [Update your information](#update-your-information-paid-plans-only)：修改您组织的发票电子邮件地址、业务信息和税号。
- [Enforce spend limits](#enforce-spend-limits)：了解如何通过使用限制和数据保留来管理您的支出。

## 为您的帐户设置账单

<Note>
使用本指南之前，请注意以下事项：

- 如果您对[Enterprise](https://www.langchain.com/pricing)计划感兴趣，请[contact sales](https://www.langchain.com/contact-sales)。本指南仅适用于我们的自助计费计划。
</Note>

要为您的 LangSmith 组织设置计费，请导航至 **设置** 下的 [Billing and Usage](https://smith.langchain.com/settings/payments) 页面。根据您组织的设置，有不同的设置指南：

- [Developer plan](#developer-plan%3A-set-up-billing-on-your-personal-organization)
- [Plus plan](#plus-plan%3A-set-up-billing-on-a-shared-organization)

### 开发者计划：为您的个人组织设置计费

在添加信用卡之前，个人组织每月的跟踪次数限制为 5,000 条。添加卡：1. 单击**添加卡以删除跟踪限制**。
1. 添加您的信用卡信息。
1. 完成后，您将不再受到 5,000 条跟踪的费率限制，并且将按照 [pricing](https://www.langchain.com/pricing-langsmith) 页面上指定的费率向您收取任何超出的跟踪费用。

### Plus 计划：在共享组织上设置结算
团队组织每月初始获得 10,000 条跟踪。任何多余的痕迹将按照[pricing](https://www.langchain.com/pricing-langsmith)页面上指定的费率收费。

<Note>
您手动创建的新组织必须包含在 Plus 计划中。如果您看到有关需要升级到 Plus 才能使用此组织的消息，请按照以下步骤操作。
</Note>

1. 单击“**升级到 Plus**”。
1. 根据需要邀请成员加入您的组织。
1. 输入您的信用卡信息。然后，输入公司信息、发票电子邮件和税号。如果该组织属于企业，请选中 **这是企业** 复选框并输入相应的信息。欲了解更多信息，请参阅[Update your information section](#update-your-information-paid-plans-only)。

## 跟踪合约使用情况（企业）

合同使用情况跟踪适用于具有预付费承诺的[**Enterprise plan**](/langsmith/pricing-plans) 客户。您必须拥有 [⟦T0⟧ permission](/langsmith/organization-workspace-operations) 才能访问此功能。查看预付合约消费详情请参见[Contract usage](/langsmith/view-usage#contract-usage)。

<Note>
有关企业计划的更多详细信息，[contact the sales team](https://www.langchain.com/contact-sales)。
</Note>

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

<Note>
在某些司法管辖区，LangSmith 需要征收销售税。如果您是企业，提供您的税号可能会使您有资格获得销售税豁免。
</Note>

要更新您组织的业务信息，请执行以下步骤：1. 导航到 **计划和账单** 选项卡。
2. 在发票电子邮件部分下方，您将看到一个标有 **Business** 的复选框。
3. 如果您的组织属于企业，请选中 **企业** 复选框。
4. 将出现一个业务信息部分，允许您输入或更新以下详细信息：
   - 公司名称
   - 地址
   - 适用司法管辖区的税号
5. 选择国家/地区后，将显示适用管辖区的税号字段。
6. 输入必要的信息后，单击“**保存**”按钮保存更改。

这可确保您的业务信息是最新且准确的，可用于计费和税务目的。

## 强制执行支出限制

<Check>
在继续本节优化跟踪支出之前，您可能会发现阅读以下几页很有帮助：

- [Data Retention Conceptual Docs](/langsmith/usage-and-billing#data-retention)
- [Usage Limiting Conceptual Docs](/langsmith/usage-and-billing#usage-limits)
</Check>

<Note>
由于其计费的自定义性质，本指南中提到的某些功能目前在企业计划中不可用。如果您使用企业计划并对成本优化有疑问，请通过 [support.langchain.com](https://support.langchain.com) 联系您的销售代表或支持人员。
</Note>


### 了解您当前的使用情况任何优化过程的第一步都是了解当前的使用情况。有关使用图、粒度使用、发票和合同使用的详细信息，请参阅[View usage](/langsmith/view-usage)。

LangSmith 衡量每个工作区的使用情况，因为工作区通常代表组织内的开发环境或团队。

### 设置使用限制

![P2usagelimitsempty v2](/langsmith/images/p2usagelimitsempty-v2.png)

#### 设置工作空间的支出限制

1. 要设置限制，请导航至 **设置** -> **计费和使用情况** -> **使用限制**。
1. 输入所选工作空间的支出限额。 LangSmith 将确定适当数量的基本和扩展跟踪限制以匹配该支出。跟踪限制包括您的计划附带的免费跟踪分配（请参阅[pricing page](https://smith.langchain.com/settings/payments)\ 的详细信息）。


<Note>
对于具有**仅多个工作区**的组织：为简单起见，LangSmith将免费跟踪纳入**仅第一个工作区**的成本计算中。实际上，任何工作空间都可以“消耗”免费跟踪。因此，尽管多工作空间组织的工作区级别支出限制是近似值，但组织级别支出限制是绝对的。
</Note>

#### 配置跟踪层分布LangSmith 有两个跟踪层：基本跟踪和扩展跟踪。基本跟踪具有基本保留并且是短暂的（14 天），而扩展跟踪具有延长的保留并且是长期的（默认情况下为 400 天，[customizable for Enterprise customers](/langsmith/data-purging-compliance#customize-extended-retention-policy)）。欲了解更多信息，请参阅[data retention conceptual docs](/langsmith/usage-and-billing#data-retention)。

通过选择 **默认数据保留** 标签下方的选项来设置所需的默认跟踪层。所有跟踪在注册时都会默认具有此层。请注意，由于扩展跟踪的成本高于基本跟踪，因此选择“**扩展**”作为默认数据保留选项将导致计费周期内允许的总体跟踪减少。默认情况下，更新此设置将仅适用于将来的传入跟踪。要应用到工作区中的所有现有轨迹，请选中该复选框。如果默认数据保留设置为 **Base**，您可以选择使用滑块在基本跟踪和扩展跟踪之间分配跟踪限制。 LangSmith 自动提供对此发行版的建议，但您可以根据您的需要进行定制。例如，如果您正在运行大量自动化或其他可能将跟踪升级为扩展的功能，您可能需要增加扩展跟踪限制。要查看可能升级跟踪的功能的完整列表，[see here](https://docs.langchain.com/langsmith/usage-and-billing#how-it-works:~:text=Data%20retention%20auto%2Dupgrades)。


<Note>
一旦达到延长的数据保留限制，可能会导致跟踪以外的功能停止工作。如果您打算使用此功能，请阅读有关其[functionality and side effects](/langsmith/usage-and-billing#side-effects-of-extended-data-retention-traces-limit)的更多信息。
</Note>

### 管理痕迹的其他方法

#### 自定义延长保留期（仅限[Enterprise](/langsmith/pricing-plans)）

[Enterprise](/langsmith/pricing-plans) 客户可以在工作区级别自定义延长数据保留期限，以满足合规性要求。默认值为 400 天，但可以根据您组织的需求进行调整。欲了解更多信息，请参阅[Customize extended retention policy](/langsmith/data-purging-compliance#customize-extended-retention-policy)。

#### 更改项目级默认保留每个跟踪项目的数据保留设置均可调整。在项目级别，您可以在两个级别之间进行选择：基础（14 天）或扩展（400 天）。要自定义超过 400 天的延长持续时间，请使用 [workspace-level configuration](/langsmith/data-purging-compliance#customize-extended-retention-policy)（仅限企业）。

导航到 **项目** > ***您的项目名称*** > 选择 **保留** 并选择所需的默认保留。这只会影响**未来跟踪**的保留（和定价）。

![P1projectretention](/langsmith/images/p1projectretention.png)

#### 将扩展数据保留应用于一定百分比的跟踪

您可能不希望所有跟踪记录在 14 天后过期。您可以通过创建 [automation rule](/langsmith/rules) 自动延长符合某些条件的跟踪的保留时间。您可能希望将扩展数据保留应用于特定类型的跟踪，例如：

* 所有痕迹的 10%：用于一般分析或分析长期趋势。
* 错误跟踪：彻底调查和调试问题。
* 具有特定元数据的跟踪：用于特定功能或用户流的长期检查。

要配置此：1. 导航到 **项目** > ***您的项目名称*** > 选择 **+ 新建** > 选择 **新建自动化**。
2. 命名您的规则并可选择应用过滤器或采样率。有关配置过滤器的更多信息，请参阅[filtering techniques](/langsmith/filter-traces-in-application#filter-operators)。

<Note>
当自动化规则与 [trace](/langsmith/observability-concepts#traces) 中的任何 [run](/langsmith/observability-concepts#runs) 匹配时，跟踪中的所有运行都会升级为延长数据保留（默认情况下为 400 天，[customizable for Enterprise customers](/langsmith/data-purging-compliance#customize-extended-retention-policy)）。
</Note>

例如，这是保留所有跟踪的 10% 以延长数据保留的预期配置：

![P2sampletraces](/langsmith/images/P2SampleTraces.png)

如果出于数据收集目的，您希望将跟踪子集保留**超过 400 天**，您可以创建另一个运行规则，将一些运行发送到您选择的数据集。数据集允许您存储跟踪输入和输出（例如，作为键值数据集），并且即使在删除跟踪后也将无限期地保留。

### LangSmith 部署计费

除了跟踪之外，LangSmith还通过LangSmith部署对部署的代理进行收费。部署根据其消耗的资源进行计费：- **计算**：配置资源时部署使用的 vCPU 和内存，以 LangChain 计算单元 (LCU) 为单位进行测量。 [Serverless](/langsmith/cloud-platform-features#serverless) 部署在一段时间不活动后可以[scale to zero (beta)](/langsmith/cloud-platform-features#serverless)，因此计算费用仅在规模缩小后停止。 [Dedicated](/langsmith/cloud-platform-features#dedicated) 部署始终在线并持续消耗计算。
- **存储**：部署用于持久状态的数据库存储，以 LangChain 存储单元 (LSU) 为单位进行测量。

有关当前 LCU 和 LSU 费率以及估计部署成本的信息，请参阅 [pricing page](https://www.langchain.com/pricing)，其中包括部署成本计算器。

<Note>
这种基于使用情况的模型取代了之前的按运行和正常运行时间定价。现有客户在 2026 年 10 月 1 日之前仍保持当前定价，然后转向新型号。缩放至零仅适用于按新定价进行的部署。随着功能的推出，无服务器部署扩展到零之前的不活动窗口可能会发生变化。有关转换的问题，请通过 [support.langchain.com](https://support.langchain.com) 联系支持人员。
</Note>

对于大批量部署使用，[contact the sales team](https://www.langchain.com/contact-sales) 讨论自定义定价选项。

### 总结

如果您对进一步管理支出有疑问，请通过 [support.langchain.com](https://support.langchain.com) 联系支持人员。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/billing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>