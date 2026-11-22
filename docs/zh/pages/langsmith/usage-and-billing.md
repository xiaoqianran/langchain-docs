<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Usage and billing | https://docs.langchain.com/langsmith/usage-and-billing -->

# 使用和计费

了解 LangSmith 跟踪数据保留层、定价、速率限制和使用限制。

本页介绍了 LangSmith 如何保留、速率限制和跟踪账单。它涵盖了每个托管选项的保留层和期限、返回 HTTP 429 响应的速率限制以及您可以设置的使用限制。

> [!注意]
>
> 要设置账单、更新发票详细信息或设置支出限额，请参阅[Manage billing](/langsmith/billing)。

## 数据保留

LangSmith 仅在其层的保留期内保留每个跟踪。当该时间段结束时，LangSmith 会删除该跟踪。

### 为什么保留很重要

* **隐私**：许多数据隐私法规（例如欧洲的 GDPR 或加利福尼亚州的 CCPA）要求组织在个人数据不再用于其收集目的时删除该数据。设置保留期限有助于遵守此类法规。
* **成本**：基本迹线的成本低于扩展迹线。要控制追踪费用，请参阅[Enforce spend limits](/langsmith/billing#enforce-spend-limits)。

### 保留期限

每个跟踪属于两个保留层之一：基本或扩展。每个级别的保留期限取决于您的[hosting option](/langsmith/platform-setup)：|托管选项 |基地|扩展（默认）|企业客户可以选择延长期限 |
| - | - | - | - |
|云| 14 天 | 180 天 | 30、60、90、120、150 或 180 天 |
|自带设备 | 14 天（数据平面默认）| 400 天（数据平面默认）| 30、60、90、120、150、180、240、300、365 或 400 天 |
|自托管 | 14 天（Helm 图表默认）| 400 天（Helm 图表默认）|可配置。参见[Enable TTL and data retention](/langsmith/self-host-ttl)。 |

在 AWS 或 Azure BYOC 数据平面上，您可以更改这两个数据平面默认值。了解如何更改 [AWS](/langsmith/byoc-operations-aws#ttl-retention) 和 [Azure](/langsmith/byoc-operations-azure#data-plane-settings) 上的数据平面设置。 GCP 数据平面保留 14 天和 400 天。工作区的扩展保留选择会覆盖数据平面默认值。

要选择工作空间的延长持续时间，请参阅[Customize extended retention policy](/langsmith/data-purging-compliance#customize-extended-retention-policy)。 2026 年 9 月 14 日之前摄取的云痕迹会保留摄取时的保留情况。

### 保留结束后会发生什么

保留期过后，将无法再通过 UI 或 API 访问跟踪记录。与跟踪相关的所有用户数据（例如输入和输出）很快就会从LangSmith系统中删除。与每个跟踪关联的一些元数据可能会无限期保留以用于分析和计费目的。### 设置保留层的位置

默认保留层属于代理[environment](/langsmith/agent-environments)，而不属于整个代理。新环境继承工作区的默认层，您在[Configure trace tier distribution](/langsmith/billing#configure-trace-tier-distribution)中设置。更改工作区默认值不会更改现有环境，除非您选择将其应用到所有环境。无论其环境层如何，[auto-upgrade](#data-retention-auto-upgrades) 都可以将单个跟踪移至延长保留期。

由于您为每个环境设置了层，因此一个代理可以将生产跟踪长期保留，并将开发跟踪保留在基础上。要更改整个代理的层，请在每个环境上进行设置。

> [!提示]
>
> 在开始发送跟踪之前规划您的保留层。更改环境的层仅适用于新跟踪。已经摄入的痕迹保持其等级。参见[Change default retention for an environment](/langsmith/billing#change-default-retention-for-an-environment)。

### 数据保留自动升级

> [!警告]
>
> 自动升级会增加您的账单。阅读本节以了解您的估计跟踪成本。

某些操作会将基本层跟踪升级到扩展层，这会增加其保留期和成本。您可以控制哪些操作可以延长保留时间。

按操作保留行为：* **通过 API 或 SDK 进行反馈**：通过显式传递 `extend_trace_retention=true`（在 TypeScript 中为 `extendTraceRetention: true`）的 API 或 SDK 调用，将反馈添加到跟踪（或线程中的任何跟踪）上的任何运行。有关更多信息，请参阅[Attach user feedback](/langsmith/attach-user-feedback)。 LangSmith UI 发送反馈和注释，但不会延长保留时间。
* **在线评估器**：在线评估器对跟踪进行评分并启用其保留设置。跟踪级和线程级评估器都可以选择退出此升级。
* **自动化规则**：启用保留扩展的[automation rule](/langsmith/rules#create-a-rule)匹配跟踪中的任何运行。匹配单个运行会升级整个跟踪，而不仅仅是该运行。 [item type](/langsmith/rules#set-the-item-type-to-runs-or-threads) 为 **Threads** 的规则会升级匹配线程中的每个跟踪，而不仅仅是最近的跟踪。
* **手动注释队列添加**（不升级）：默认情况下，手动将运行或线程添加到 [annotation queue](/langsmith/annotation-queues#assign-runs-and-threads-to-a-single-run-queue) 不会升级保留。

默认情况下，新的在线评估器和自动化规则启用保留扩展。您可以在创建或编辑每个评估器或规则时将其关闭。仅当环境的默认保留为基础层时，在线评估者才能选择退出。参见[Manage evaluator trace retention](/langsmith/evaluators#manage-evaluator-trace-retention)。关闭保留扩展不会降级跟踪。先前操作已升级的痕迹将保留较长的保留时间。

#### 为什么LangSmith自动升级痕迹

自动升级模型遵循两个原则：

1. 通过 API 接收反馈、由在线评估程序评分或匹配自动化规则的跟踪通常比其他跟踪更有价值，因此将其保留更长时间非常有用。
2. 无人交互的痕迹成本应低一个数量级。只有具有有意义的交互的痕迹才会以更高的扩展费率收费。

有关 LangSmith 定价的问题，请通过 [support.langchain.com](https://support.langchain.com) 联系支持人员。

#### 保留如何影响下游功能

以下功能与保留的交互作用不同：

* **实验**：默认情况下，运行是在延长保留时创建的。
* **自动化规则和评估器**：启用保留设置后，将匹配跟踪升级为延长保留。线程级规则和评估器升级匹配线程中的每个跟踪。
* **UI 反馈、注释和注释队列**：保持跟踪的保留层不变。

其他功能的行为独立于跟踪的保留层：* **监控**：即使基础层跟踪的数据保留期结束，监控选项卡仍会继续工作。它由保存超过 30 天的跟踪元数据提供支持，因此监控图表对于 `base` 层跟踪保持准确。
* **数据集**：数据集具有无限的数据保留期。如果将跟踪的输入和输出添加到数据集，它们永远不会被删除。如果您使用LangSmith进行数据收集，请将要保留的数据存储在[dataset](/langsmith/manage-datasets)中。

### 计费模型

您的 LangSmith 发票显示两个跟踪指标：

* **LangSmith 痕迹（基本费用）**：每条痕迹，无论等级如何。
* **LangSmith 跟踪（扩展数据保留升级）**：每个扩展保留跟踪。

#### 为什么发票单独计算升级

直接计算基本和扩展跟踪会更简单，但它不处理升级。例如，在 6 月 30 日记录并在 7 月 3 日升级为扩展的基本层跟踪落在 6 月计费周期中，而其升级则落在 7 月中。分别测量这两个事件，在正确的时间段内对每个事件进行计费。

在延长保留时创建的跟踪记录具有相同时间戳的两个指标。

## 速率限制LangSmith具有速率限制，旨在确保所有用户的服务稳定性。

当超出速率限制或使用限制时，在以下情况下，LangSmith 会以 HTTP 状态代码 429 进行响应：

### 负载均衡器的每分钟吞吐量限制

此 429 是基于每个服务密钥或 PAT 在 1 分钟窗口内超过固定数量的 API 调用的结果。该窗口不一定在时钟分钟开始时开始，并且其开始可能会随着应用程序部署事件而变化。

达到最大调用次数后，LangSmith 会响应 429，直到窗口开始后经过 60 秒。然后窗口再次启动。

LangSmith 应用程序负载均衡器返回此 429。它适用于所有 LangSmith 用户，无论计划如何。

|方法|端点 |限制|窗口|
| - | - | - | - |
| `DELETE` | `/sessions*` | 30| 1 分钟 |
| `POST` 或 `PATCH` | `/runs*` | 5000 | 1 分钟 |
| `GET` | `/runs/:id` | 30| 1 分钟 |
| `POST` | `/feedbacks*` | 5000 | 1 分钟 |
| `*` | `*` | 2000 | 2000 1 分钟 |> [!注意]
>
> LangSmith SDK 采取措施，通过将单个会话 ID 中的最多 100 次运行批处理到单个 API 调用中，最大限度地降低在运行相关端点上达到这些限制的可能性。

### 计划级每小时跟踪事件限制

此 429 是达到每小时最大摄取事件数的结果，并在 UTC 每个时钟小时开始时的固定窗口中进行评估，并在每个新小时的顶部重置。

此上下文中的事件是运行的创建或更新。如果创建运行并随后在同一小时窗口中更新，则针对此限制计为 2 个事件。

LangSmith 应用程序返回此 429。限制因计划而异：Startup/Plus 和 Enterprise 计划的每小时限制高于专为个人使用而设计的 Developer 计划。

|计划|限制|窗口|
| - | - | - |
|开发商（档案中无付款）| 50,000 场活动 | 1小时|
|开发商（已付款存档）| 250,000 场活动 | 1小时|
|启动/增强 | 500,000 个事件 | 1小时|
|企业 |定制|定制|

### 计划级每小时跟踪数据摄取限制此 429 是在跟踪输入、输出和元数据中获取的最大数据量达到的结果，并在 UTC 每个时钟小时开始时的固定窗口中进行评估，并在每个新小时的顶部重置。

通常，输入、输出和元数据都会在运行创建和更新事件上发送。如果以 2.0MB 创建运行并在同一小时窗口内更新为 3.0MB，则相对于此限制，该存储将计为 5.0MB。

LangSmith 应用程序返回此 429。限制因计划而异：Startup/Plus 和 Enterprise 计划的每小时限制高于专为个人使用而设计的 Developer 计划。

|计划|限制|窗口|
| - | - | - |
|开发商（档案中无付款）| 500MB | 1小时|
|开发商（已付款存档）| 2.5GB | 2.5GB 1小时|
|启动/增强 | 5.0GB| 1小时|
|企业 |定制|定制|

### 计划级别每月唯一痕迹限制

此 429 是达到每月最大摄取痕迹的结果，并在 UTC 每个日历月月初开始的固定窗口中进行评估，并在每个新月月初重置。LangSmith 应用程序返回此 429。它仅适用于当文件中没有付款方式时的开发者计划。

|计划|限制|窗口|
| - | - | - |
|开发商（档案中无付款）| 5,000 条痕迹 | 1 个月 |

### 自行配置每月使用限额

此 429 是达到组织管理员配置的使用限制的结果，并在 UTC 每个日历月月初开始的固定窗口中进行评估，并在每个新月月初重置。

LangSmith 应用程序返回此 429。该限制取决于您的组织配置的使用限制。参见[Usage limits](#usage-limits)。

### 每个跟踪的最大运行次数

每个跟踪最多运行 25,000 次。一旦跟踪达到此限制，LangSmith 将拒绝您为该跟踪发送的任何其他运行。

### 运行查询端点

LangSmith 公开具有不同速率限制配置文件的两个版本的运行查询端点。

**v2（推荐）：** `POST /v2/runs/query`（Python 中的[⟦T15⟧](https://reference.langchain.com/python/langsmith/client/Client/list_runs)，JavaScript 中的[⟦T16⟧](https://reference.langchain.com/javascript/langsmith/client/Client/listRuns)）由 SmithDB 支持，并且每个 API 密钥都有统一的限制，没有时间窗口层：

| **限制** | **窗口** |
| - | - |
| 300 个请求 | 10 秒 |设置 `sem_filter`（语义搜索）的 API 密钥请求也限制为每个工作区每分钟 10 个请求。

**v1:** `POST /runs/query` 具有根据查询参数而变化的每租户速率限制：

| **查询类型** | **限制** | **窗口** |
| - | - | - |
|短时间窗口（≤ 7 天）| 10 个请求 | 10 秒 |
|大时间窗口（> 7 天）| 3 个请求 | 10 秒 |
|全文检索，时间窗口短（≤7天）| 3 个请求 | 10 秒 |
|全文检索，大时间窗口（>7天）| 1 请求 | 10 秒 |
|选择`child_run_ids`，短时间窗口（≤7天）| 3 个请求 | 10 秒 |
|选择`child_run_ids`，大时间窗口（>7天）| 1 请求 | 10 秒 |

时间窗口由`end_time - start_time`决定。如果未提供 `end_time`，则 LangSmith 使用当前时间。没有 `start_time` 的查询将被视为大时间窗口查询。

为了避免达到 v1 速率限制并减少查询时间：* **设置`start_time`**：省略它会触发大时间窗口层（每10秒3个请求而不是10个）。尽可能使用 7 天或更短的时间窗口。
* **使用`select`**：默认返回所有字段。仅指定您需要的字段（例如，`select=["inputs", "outputs"]`）可大大减少响应大小和查询时间。
* **设置`limit`**：如果您不需要对所有内容进行分页，则限制结果数量。
* **避免全文搜索**：`filter='search("...")'`具有最严格的速率限制；尽可能使用结构化过滤器（例如，`eq()`、`has()`）。
* **避免选择`child_run_ids`**：这也会触发更严格的速率限制等级。

### 运行统计端点

[⟦T32⟧](/langsmith/smith-api/run/stats-runs) 端点具有每个租户的速率限制，该限制根据查询时间窗口而变化：| **查询类型** | **限制** | **窗口** |
| - | - | - |
|短时间窗口（≤ 14 天）| 10 个请求 | 10 秒 |
|大时间窗口（> 14 天和 \< 90 days) | 3 requests | 10 seconds |
| Extra-large time window (≥ 90 days) or no ⟦T33⟧ | 1 request | 10 seconds |

The time window is determined by ⟦T34⟧. If ⟦T35⟧ is not provided, LangSmith uses the current time. Queries without a ⟦T36⟧ are subject to the strictest limit.

In the GCP-hosted US region, API key requests to this endpoint are also limited to 1 request per 10 seconds per API key.

To avoid hitting rate limits:

* **Set ⟦T37⟧**: use a window of 14 days or less when possible.
* **Avoid open-ended queries**: always provide a ⟦T38⟧ to stay in the less-restrictive tier.

### Workspace invite batch endpoint

Workspace invite batch requests are rate limited per workspace to reduce bulk invitation abuse.

The ⟦T39⟧ endpoint allows 2 requests per second per workspace. This limit applies to LangSmith Cloud only.

### Handle 429 responses in your application

Some 429 responses are temporary, so a later call may succeed. If your application calls the LangSmith API directly, implement retry logic with exponential backoff and jitter. The LangSmith SDK has this retry logic built in.

> [！注意]
>
> 如果您的应用程序长时间使端点饱和，重试可能无济于事，因为积压最终会耗尽所有重试。
>
> 在这种情况下，请联系 [LangSmith support](https://support.langchain.com) 并提供您的应用程序的吞吐量需求和示例代码。支持可以帮助您确定修复是错误修复、应用程序代码更改还是不同的 LangSmith 计划。

## 使用限制

使用限制限制了每个日历月 LangSmith 摄取的跟踪数量。他们限制跟踪计数，而不是支出。要设置每月支出目标并让LangSmith从中得出限制，请参阅[Set a workspace spend limit](/langsmith/billing#set-a-workspace-spend-limit)。有关评估器运行的支出限制，请参阅[Track and limit evaluator spend](/langsmith/evaluator-spend)。

您可以在三个范围内设置使用限制：

* **工作空间**：与两个[billable metrics](#billing-model)匹配的两个限制：所有跟踪限制和扩展数据保留跟踪限制。
* **代理环境**：一个代理环境的每月跟踪限制。 UI 将此范围标记为**项目**。
* **用户**：一名工作区成员的每月跟踪限制。

痕迹必须在适用于其摄取的每个使用限制内。### 设置工作区使用限制

要更新工作区的使用限制，请转至 **设置** > **计费和使用情况** > **使用限制**。

### 延长数据保留痕迹限制的副作用

延长数据保留跟踪限制有副作用。如果已达到限制，LangSmith 会阻止创建另一个扩展保留跟踪的操作。例如，您不能再：

1. 运行延长跟踪保留时间的自动化规则。
2. 运行延长跟踪保留时间的评估器。

不更改跟踪保留的操作不计入限制。当达到限制时，您仍然可以在 LangSmith UI 中提交反馈，将运行或线程添加到注释队列，并在禁用保留扩展的情况下运行自动化规则或评估器。

### 设置环境和用户使用限制

环境和用户使用限制可阻止一个代理环境或工作区成员消耗不成比例的工作区跟踪份额。设置它们需要与工作区使用限制 (`Update usage limits`) 相同的权限。

添加环境或用户使用限制：1. 进入**设置** > **使用配置**。
2. 在**项目和用户限制**部分中，单击**添加限制**。
3. 设置以下字段：
   * **范围**： **项目** 限制单个代理环境，或 **用户** 限制单个工作区成员。 UI 在此处将环境标记为项目。
   * **工作空间**：包含环境或成员的工作空间。
   * **项目** 或 **用户**：要限制的环境或成员。 **项目**列表按其 `tracer_session_name` 显示每个环境。要查找环境的 `tracer_session_name`，请参阅 [Configure integrations that require a project name](/langsmith/create-an-agent#use-an-environment-project)。
   * **每月跟踪限制**：每个日历月允许的最大跟踪数。

**项目** 限制限制一个代理的 1 个[environment](/langsmith/agent-environments)，而不是整个代理。没有代理范围，因此限制代理的总跟踪数意味着为每个环境添加一个限制。

用户使用限制仅对归因于该工作区成员的跟踪进行计数。使用未与成员绑定的 API 密钥或服务密钥发送的跟踪不计入任何用户使用限制。

### 如何实施使用限制* **每月重置**：使用限制按 UTC 日历月进行评估，并在每个月初重置。
* **摄取在限制处停止**：一旦工作区、环境或用户达到使用限制，LangSmith 就会删除其新跟踪，直到限制重置。
* **近似执行**：在生效之前，可能会在超出限制的情况下处理少量跟踪。
* **缓存**：限制值被缓存，因此新的或更改的限制可能需要一两分钟才能应用。

## 相关内容

* 关于如何[enforce spend limits](/langsmith/billing#enforce-spend-limits)的教程

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/usage-and-billing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。