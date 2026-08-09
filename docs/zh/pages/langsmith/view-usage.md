<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: View usage | https://docs.langchain.com/langsmith/view-usage -->

# 查看使用情况

LangSmith 中提供哪些使用数据、每个指标的含义以及自托管的不同之处。

LangSmith 提供了多种关于 [organization's](/langsmith/administration-overview) 使用情况的视图，具体取决于您的 [plan](/langsmith/pricing-plans) 和 [hosting type](/langsmith/platform-setup)。本页介绍了哪些数据可用、每个指标的含义以及适用于 [Self-hosted](/langsmith/self-hosted) 的限制。

## 使用视图

|查看 |在哪里可以找到它 |谁能看到|计划可用性 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [Usage graph](#usage-graph) | **企业**：设置 > 使用情况 > 使用情况图表<br />**自助服务**：设置 > 计费 > 使用情况图表 |所有组织成员 |所有计划|| [Granular usage](#granular-usage) | **企业**：设置 > 使用情况 > 细化使用情况<br />**自助服务**：设置 > 计费 > 细化使用情况 |所有组织成员 |所有计划|
| [Contract usage](#contract-usage) | **企业**：设置 > 使用情况 > 合同使用情况<br />**自助服务**：设置 > 计费 > 合同使用情况 |仅限组织管理员 (`organization:manage`) |仅限企业|
| [Invoices](#invoices) |设置 > 账单 > 发票 |所有组织成员 |仅自助云 |
| [Evaluator spend](/langsmith/evaluator-spend) |评估者页面，评估者详细信息 |所有工作区成员 |每周跟踪一次，于周一上午 12 点（世界标准时间）重置，与下面的每月计费周期分开 |

## 使用图使用情况图表显示 [organization](/langsmith/administration-overview#organizations) 的聚合跟踪消耗，按 [workspace](/langsmith/administration-overview#workspaces) 细分。它涵盖当前计费周期，并且不显示支出 - 有关支出，请参阅发票。

导航至 **设置** → **计费和使用情况** → **使用情况图表**。

### 可计费指标

|公制|这算什么 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LangSmith 迹线（基本电荷）** |在计费期间发送到 LangSmith 的每个跟踪，无论数据保留层如何。                                                                                                                                     || **LangSmith Traces（扩展数据保留升级）** |跟踪升级为延长保留期（默认为 400 天，[customizable for Enterprise customers](/langsmith/data-purging-compliance#customize-extended-retention-policy)）。这些费用是在基本费用之外收取的。 |
| **LangSmith 部署运行** |已部署的 LangGraph 代理的端到端调用。有关定价详情，请参阅[LangSmith Deployment billing](/langsmith/billing#langsmith-deployment-billing)。                                                                   |
| **朗史密斯舰队运行** | [Fleet](/langsmith/fleet) 代理的端到端调用。单独跟踪云托管和自托管部署。                                                                                                    |
| **执行 LangSmith 部署节点** |跨已部署代理的各个 LangGraph 节点执行。已部署代理图中的每个步骤都算作一个节点执行。单独跟踪云托管和自托管部署。                               |

有关跟踪保留层的更多详细信息，请参阅[Data retention](/langsmith/usage-and-billing#data-retention)。

<Note>
  使用情况图表使用术语 `tenant_id` 与工作区 ID 互换。
</Note>

## 合约使用具有预付费承诺的企业客户可以查看其合同已消耗了多少。

导航至 **设置** → **使用配置** → **合同使用**。

该视图显示：

* **使用情况摘要**：总使用量、总积分和任何超额。当使用量超过您的预付费承诺总额时，就会出现超额。
* **承诺进度条**：每个承诺的视觉指示器显示消耗的百分比以及已用与剩余的美元金额。合同可以有多个承诺，适用于不同的时间段（例如，多年期合同的第一年和第二年）或不同的产品。
* **每月使用量图表**：显示合同期内每个月的使用量的条形图。
* **产品价格**：您的授权产品及其定价表。

<Note>
  合同使用需要[⟦T3⟧ permission](/langsmith/organization-workspace-operations)，并且仅适用于具有预付费承诺的企业客户。
</Note><Note>
  如果您的合同跨越同一计费实体下的多个组织，则合同使用情况视图将显示所有这些组织中累计的**组合**使用情况，而不仅仅是您当前查看的组织。 [Granular usage](#granular-usage) 始终仅限于单个组织，因此要查看特定组织的精细使用情况，请切换到该组织并单独查看其精细使用情况。
</Note>

## 发票

**仅自助云计划**提供发票。企业云组织有一个单独的使用视图来跟踪支出。

导航至 **设置** → **计费和使用情况** → **发票** 以查看您的使用情况如何转化为支出。显示的第一张发票是您当月发票的草稿，反映了您迄今为止的运行支出。

## 细化使用

粒度使用情况为您提供在您选择的时间范围内按您选择的维度（工作空间、项目、用户或 API 密钥）细分的跟踪计数。这对于内部退款、识别高使用率团队或审核跟踪活动非常有用。

导航至 **设置** → **计费和使用情况** → **详细使用情况**，或使用 [granular usage API](/langsmith/granular-usage)。

### 这里的“痕迹”是什么意思粒度使用视图对**跟踪**进行计数：根级别运行及其所有子跨度均算作一个单元。这与 [billing](/langsmith/billing) 使用的单位相同。它不会单独计算各个范围、令牌或模型调用。

### 记录使用情况时

精细使用情况按**插入时间**（LangSmith 接收并存储跟踪的时间）记录跟踪，而不是按其在应用程序中运行的时间记录跟踪。实际上，这种差异通常可以忽略不计，但以显着延迟发送的跟踪（例如，缓冲的 SDK 上传）可能会出现在比预期更晚的时间段中。

有关分组选项、时间段大小和 API 参考，请参阅[Granular billable usage](/langsmith/granular-usage)。

## 自托管限制

由于计费基础设施的差异，与 [Cloud](/langsmith/cloud) 相比，[Self-hosted](/langsmith/self-hosted) LangSmith 具有一组不同的可用使用视图。| **功能** | **自托管可用性** |
| ---------------------------------- | ---------------------------------------------------------------- |
|细化使用（追踪归因）|可用于功能标志或版本 ≥ 0.13.12 |
|使用图（聚合痕迹）|适用于 Helm Chart 0.9.5 及更高版本 |
|合约使用 |启用 Beacon 回拨功能后可用 |
|发票和付款管理 |不可用（计费在 LangSmith 外部处理）|

### 自托管的粒度使用

[Self-hosted](/langsmith/self-hosted) 上提供粒度使用，但需要明确选择加入：

* 在 **LangSmith 0.13.12 及更高版本**上，默认启用精细使用情况收集。
* 在 **早期版本** 上，通过设置以下两个环境变量来启用它：

  ```env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  DEFAULT_ORG_FEATURE_ENABLE_GRANULAR_USAGE_REPORTING=true
  GRANULAR_USAGE_TABLE_ENABLED=true
  ```

<Warning>
  数据收集从启用该功能的那一刻开始。在启用之前不会回填历史使用数据。选择何时启用此功能时，请做出相应计划。
</Warning>

### 自托管的聚合使用情况使用情况图表可在运行 Helm Chart 0.9.5 或更高版本的 [Self-hosted](/langsmith/self-hosted) 上获得。 LangSmith 自动生成并同步组织使用情况图表，可在 **设置** → **使用情况和计费** → **使用情况图表** 下找到：

* **工作空间的使用情况**：每个工作空间的跟踪计数（根运行）
* **组织使用情况**：整个组织的总跟踪计数

图表每 5 分钟刷新一次以包含新工作区，并且不可编辑。

有关以编程方式访问跟踪计数的信息，请参阅[View trace counts across your organization](/langsmith/self-host-organization-charts)。

## 相关资源

* [Granular billable usage API reference](/langsmith/granular-usage)
* [Manage billing](/langsmith/billing)
* [Data retention and usage limits](/langsmith/usage-and-billing#data-retention)
* [Track and limit evaluator spend](/langsmith/evaluator-spend)
* [Organization and workspace operations](/langsmith/organization-workspace-operations)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/view-usage.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>