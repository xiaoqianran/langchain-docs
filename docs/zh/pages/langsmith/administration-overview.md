<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Overview | https://docs.langchain.com/langsmith/administration-overview -->

# 概述

本概述涵盖与管理 LangSmith 中的用户、组织、工作区和应用程序相关的主题。

## 资源层次结构

### 组织

组织是 LangSmith 中用户的逻辑分组，定义了应用于其所有工作区的共享设置。这些设置管理组织范围内的问题，而不是工作区中的单个项目。常见的组织级配置包括用户管理、单点登录 (SSO)、OAuth 提供程序配置、自定义角色创建、计费和使用情况跟踪。通常，每个公司有一个组织。一个组织可以有多个工作区。欲了解更多详情，请参阅[setup guide](/langsmith/set-up-hierarchy#set-up-an-organization)。

当您第一次登录时，系统会自动为您创建一个个人组织。如果您想与其他人协作，您可以创建一个单独的组织并邀请您的团队成员加入。您的个人组织和共享组织之间存在一些重要区别：|特色|个人|共享|
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
|最大工作空间| 1 |可变，取决于计划（参见[pricing page](https://www.langchain.com/pricing-langsmith)）|
|合作|无法邀请用户 |可以邀请用户 |
|计费：付费计划|仅限开发者计划 |所有其他可用计划 |

### 工作区

<Info>
  工作空间以前称为租户。在过渡期间的一段时间内，某些代码和 API 可能仍引用旧名称。
</Info>工作空间是组织内用户和资源的逻辑分组。工作空间通常用于隔离团队或业务部门，从而在项目及其相关资源之间提供分离。工作区分隔资源和访问控制的信任边界。用户在工作区级别被授予权限，这决定了他们对该工作区中资源的访问权限，包括跟踪项目、数据集、注释队列和提示。有关设置的详细信息，请参阅[setup guide](/langsmith/set-up-hierarchy#set-up-a-workspace)，有关权限的详细信息，请参阅[Workspaces (RBAC)](/langsmith/administration-overview#workspace-roles-rbac)。

我们建议为组织内的每个团队创建一个单独的工作区。要进一步组织资源，您可以使用 [Applications](#applications) 对工作区中的资源进行分组。有关基于团队隔离要求的不同工作区组织模型的指南，请参阅[Workload isolation](/langsmith/workload-isolation)。

### 应用程序

应用程序是工作区中资源的逻辑分组。应用程序通常是代理，但您可以将它们用于团队内的任何项目。应用程序通过仅显示与当前上下文中的应用程序关联的资源来保持 UI 的组织。应用程序构建在[resource tags](/langsmith/administration-overview#resource-tags)之上，可用于使用[ABAC](/langsmith/organization-workspace-operations#access-policies)控制资源访问。

从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-administration-overview) 的主导航侧边栏切换应用程序。使用侧边栏顶部的 **应用程序** 下拉列表来选择应用程序。

任何资源都可以在不标记到应用程序的情况下创建。当选择 **所有应用程序** 选项时，这些资源将可见。

### 资源

资源是用于构建、运行和观察应用程序和代理的具体实体，例如跟踪项目、提示、数据集和部署。资源的范围仅限于特定的应用程序。

### 附加信息

下图解释了组织、工作区、应用程序和资源之间的关系：<img alt="Resource Hierarchy" />

有关哪些功能在哪些范围内可用的详细信息，请参阅下表：|资源/设置 |范围 |
| --------------------------------------------------------------------------- | ------------------------ |
|追踪项目 |工作空间或应用程序 |
|注释队列 |工作空间或应用程序 |
|部署|工作空间或应用程序 |
|数据集和实验|工作空间或应用程序 |
|提示|工作空间或应用程序 |
|资源标签 |工作空间 |
| API 密钥 |工作空间 |
|设置包括秘密、反馈配置、模型、规则和共享 URL |工作空间 |
|用户管理：邀请用户加入工作区 |工作空间 || RBAC：分配工作区角色 |工作空间 |
|数据保留、使用限制 |工作区\* |
|计划和账单、积分、发票 |组织|
|用户管理：邀请用户加入组织|组织\*\* |
|添加工作区 |组织|
|分配组织角色 |组织|
| RBAC：创建/编辑/删除自定义角色 |组织|

\* 数据保留设置和使用限制也将很快适用于组织级别

\*\* 自托管安装可以通过功能标志启用工作区级别的用户邀请到组织。详情请参阅[self-hosted user management docs](/langsmith/self-host-user-management)。

### 资源标签

资源标签允许您进一步隔离工作区中的资源以与 [ABAC](/langsmith/organization-workspace-operations#access-policies) 一起使用。每个标签都是一个可以分配给资源的键值对。LangSmith 资源标签与[AWS](https://docs.aws.amazon.com/tag-editor/latest/userguide/tagging.html) 等云服务中的标签非常相似。

导航至[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-administration-overview)中的**设置**，选择侧边栏中的**资源标签**页面。

## 用户管理和RBAC

### 用户

用户是有权访问LangSmith的人。用户可以是一个或多个组织以及这些组织内工作空间的成员。

组织成员在**设置**页面的**成员和角色**下进行管理。

工作区成员在**设置**下的**工作区**页面上进行管理。

### API 密钥

<Warning>
  我们于 2024 年 10 月 22 日终止了对前缀为 `ls__` 的旧版 API 密钥的支持，转而使用个人访问令牌 (PAT) 和服务密钥。我们要求对所有新集成使用 PAT 和服务密钥。自 2024 年 10 月 22 日起，以 `ls__` 为前缀的 API 密钥将不再有效。
</Warning>

#### 有效期

创建 API 密钥时，您可以选择设置到期日期。为密钥添加过期日期可以增强安全性并最大限度地降低未经授权访问的风险。例如，您可以为需要提升访问权限的临时任务设置密钥的到期日期。默认情况下，密钥永不过期。一旦过期，API 密钥将不再有效，并且无法重新激活或修改其过期时间。

#### 个人访问令牌 (PAT)

个人访问令牌 (PAT) 用于验证对 LangSmith API 的请求。它们由用户创建并限定用户范围。 PAT 将具有与创建它的用户相同的权限。我们建议不要使用它们来验证来自应用程序的请求，而是将它们用于与 LangSmith API 交互的个人脚本或工具。如果与 PAT 关联的用户从组织中删除，则 PAT 将不再起作用。

PAT 前缀为 `lsv2_pt_`

#### 服务键

服务密钥与 PAT 类似，但用于代表服务帐户对LangSmith API 的请求进行身份验证。只有管​​理员可以创建服务密钥。我们建议将这些用于需要与LangSmith API 交互的应用程序/服务，例如LangGraph 代理或其他集成。服务密钥的范围可以是单个工作区、多个工作区或整个组织，并且可用于验证对其有权访问的任何工作区的LangSmith API 的请求。服务键以 `lsv2_sk_` 为前缀

<Warning>
  使用 `X-Tenant-Id` 标头指定目标工作空间。

  * **使用 PAT 时**：如果省略此标头，请求将针对与密钥关联的默认工作区运行。
  * **使用组织范围的服务密钥时**：访问工作区范围的资源时，必须包含 `X-Tenant-Id` 标头。如果没有它，请求将失败并出现 `403 Forbidden` 错误。
</Warning>

<Note>
  要了解如何创建服务密钥或个人访问令牌，请参阅 [setup guide](/langsmith/create-account-api-key)
</Note>

### 组织角色

组织角色与[Enterprise feature workspace RBAC](#workspace-roles-rbac)不同，并且在多个[workspaces](#workspaces)的上下文中使用。您的组织角色决定了您的工作区成员特征和您的 [organization-level permissions](/langsmith/organization-workspace-operations)。

选择的组织角色还会影响工作区成员身份，如下所述：* [Organization Admin](/langsmith/rbac#organization-admin) 授予管理所有组织配置、用户、计费和工作区的完全访问权限。
  * 组织管理员拥有对组织中所有工作区的`Admin` 访问权限。
* [Organization User](/langsmith/rbac#organization-user) 可以读取组织信息，但不能在组织级别执行任何写入操作。组织用户可以创建[Personal Access Tokens](#personal-access-tokens-pats)。
  * 可以像往常一样将组织用户添加到工作区子集并分配工作区角色（如果启用 RBAC），这些角色指定工作区级别的权限。
* [Organization Viewer](/langsmith/rbac#organization-viewer) 相当于组织用户，但**不能**创建个人访问令牌。 （对于自托管，可在 Helm 图表版本 0.11.25+ 中使用）。

<Info>
  组织用户和组织查看者角色仅在 [Plus and Enterprise plans](https://langchain.com/pricing) 上的组织中可用。在开发人员组织（单个工作区）中，默认情况下为所有用户分配组织管理员角色。

  有关如何禁用整个组织的 PAT 创建的说明，请参阅 [security settings](/langsmith/manage-organization-by-api#security-settings)。
</Info>

有关设置组织和工作空间的更多信息，请参阅[organization setup guide](/langsmith/set-up-hierarchy#organization-roles) 了解更多信息。

下表提供了组织级别权限的概述：|                                             |组织查看器 |组织用户|组织管理|
| ------------------------------------------- | ------------------- | ----------------- | ------------------ |
|查看组织配置 | ✅ | ✅ | ✅ |
|查看组织角色 | ✅ | ✅ | ✅ |
|查看组织成员 | ✅ | ✅ | ✅ |
|查看数据保留设置 | ✅ | ✅ | ✅ |
|查看使用限制 | ✅ | ✅ | ✅ |
|创建个人访问令牌 (PAT) | ❌ | ✅ | ✅ |
|对所有工作区的管理员访问权限 | ❌ | ❌ | ✅ |
|管理计费设置 | ❌ | ❌ | ✅ ||创建工作区 | ❌ | ❌ | ✅ |
|创建、编辑和删除组织角色 | ❌ | ❌ | ✅ |
|邀请新用户加入组织 | ❌ | ❌ | ✅ |
|删除用户邀请 | ❌ | ❌ | ✅ |
|从组织中删除用户 | ❌ | ❌ | ✅ |
|更新数据保留设置 | ❌ | ❌ | ✅ |
|更新使用限制 | ❌ | ❌ | ✅ |

有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

### 工作区角色 (RBAC)

<Note>
  RBAC（基于角色的访问控制）是一项仅适用于企业客户的功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用管理员角色。
</Note>角色用于定义用户在工作区中拥有的一组权限。共有三种内置系统角色无法编辑：

* [Workspace Admin](/langsmith/rbac#workspace-admin) 拥有工作空间内所有资源的完全访问权限。
* [Workspace Editor](/langsmith/rbac#workspace-editor) 拥有除工作区管理（添加/删除用户、更改角色、配置服务密钥）之外的所有权限。
* [Workspace Viewer](/langsmith/rbac#workspace-viewer) 对工作区中的所有资源具有只读访问权限。

[Organization admins](/langsmith/rbac#organization-admin)还可以创建/编辑对不同资源具有特定权限的自定义角色。

您可以在 **组织设置** > **成员和角色** 下管理角色，然后选择 **角色** 选项卡。

* 有关角色和权限的完整文档，请参阅 [Role-based access control](/langsmith/rbac) 指南​​。
* 有关分配和创建角色的更多详细信息，请参阅[User Management](/langsmith/user-management)指南。
* 有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

## 最佳实践

### 环境分离使用 [resource tags](#resource-tags) 使用默认标签键 `Environment` 和环境的不同值（例如 `dev`、`staging`、`prod`）来按环境组织资源。我们不建议使用单独的工作区进行环境隔离，因为资源无法跨工作区共享，这会阻止您在环境之间提升资源（如提示）。

<Note>
  **用于提示管理的资源标签与提交标签**

  虽然两种类型的标签都可以使用 `dev`、`staging` 和 `prod` 等环境术语，但它们有不同的用途：

  * **资源标签** (`Environment: prod`)：使用这些标签来*组织和过滤*工作区中的资源。将资源标签应用于跟踪项目、数据集和其他资源（包括提示），以按环境对它们进行分组，从而可以在 UI 中进行过滤。
  * [Commit tags](/langsmith/manage-prompts#commit-tags)（`prod`标签）：使用它们来管理您的代码引用了哪些[prompt version](/langsmith/prompt-context-hub#prompts)。提交标签是指向提示历史记录中特定提交的标签。当您的代码通过标签名称（例如，`client.pull_prompt("prompt-name:prod")`）提取提示时，它会检索该标签当前指向的任何提交。要将提示从 `staging` 升级到 `prod`，请将提交标记移动到所需的版本。资源标签组织**哪些资源**属于某个环境。提交标签使您可以控制代码引用的提示的**哪个版本**，而无需更改代码本身。
</Note>

## 使用和计费

### 数据保留

本节介绍数据保留的工作原理以及它在 LangSmith 中的定价方式。

#### 为什么保留很重要

* **隐私**：许多数据隐私法规（例如欧洲的 GDPR 或加利福尼亚州的 CCPA）要求组织在个人数据不再用于其收集目的时将其删除。设置保留期限有助于遵守此类法规。
* **成本**：LangSmith 对于数据保留率较低的跟踪收费较低。如需了解更多信息，请了解如何[enforce spend limits](/langsmith/billing#enforce-spend-limits)。

<Tip>
  在开始发送跟踪之前规划您的保留层。更改仅适用于新跟踪 - 现有跟踪保留其原始层。参见[Change project-level default retention](/langsmith/billing#change-project-level-default-retention)。
</Tip>

#### 它是如何工作的

LangSmith 有两层基于数据保留的跟踪，具有以下特征：|                      |基地|扩展|
| -------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **价格** | [See pricing page](https://www.langchain.com/pricing-langsmith) | [See pricing page](https://www.langchain.com/pricing-langsmith) |
| **保留期限** | 14 天 | 400 天 |

<Note>
  企业客户可以自定义每个工作区的延长保留期。更改仅适用于新跟踪，现有跟踪不受影响。参见[Customize extended retention policy](/langsmith/data-purging-compliance#customize-extended-retention-policy)。
</Note>

**保留结束后数据删除**

在指定的保留期之后，将无法再在跟踪项目 UI 中或通过 API 访问跟踪。与跟踪相关的所有用户数据（例如输入和输出）将在一天内从我们的内部系统中删除。与每个跟踪关联的一些元数据可能会无限期保留以用于分析和计费目的。

#### 数据保留自动升级<Warning>
  自动升级可能会对您的账单产生影响。请仔细阅读本节，以充分了解您预计的 LangSmith 追踪费用。
</Warning>

大多数迹线都使用碱基保留。某些操作（例如在线评估器和自动化规则）可以以更高的成本将跟踪延长到更长的保留期。您可以控制哪些操作可以延长保留时间。

当您将某些功能与 `base` 层跟踪一起使用时，其数据保留可能会自动升级到 `extended` 层。这会增加跟踪的保留期限和成本。

按操作保留行为：* **通过 API 或 SDK 进行反馈**：通过显式传递 `extend_trace_retention=true`（在 TypeScript 中为`extendTraceRetention: true`）的 API 或 SDK 调用，将反馈添加到跟踪（或线程中的任何跟踪）上的任何运行。欲了解更多信息，请参阅[Attach user feedback](/langsmith/attach-user-feedback)。 LangSmith UI 发送反馈和注释，但不会延长保留时间。
* **在线评估器**：在线评估器对跟踪进行评分并启用其保留设置。跟踪级和线程级评估器都可以选择退出此升级。
* **自动化规则**：启用保留扩展的[automation rule](/langsmith/rules#create-a-rule)匹配跟踪中的任何运行。
* **手动注释队列添加**（不升级）：默认情况下，手动将运行或线程添加到 [annotation queue](/langsmith/annotation-queues#assign-runs-and-threads-to-a-single-run-queue) 不会升级保留。

此更改仅适用于新操作。已通过先前操作升级的跟踪将保持其长期保留。

<Note>
  当您在跟踪项目上创建或编辑在线评估器时，您可以选择不升级评估器评分的跟踪，将其保持在基本保留状态。仅当项目的默认保留为基础层时，此选项才可用。有关分步说明，请参阅[Manage evaluator trace retention](/langsmith/evaluators#manage-evaluator-trace-retention)。
</Note><Note>
  默认情况下，新的在线评估器和自动化规则启用保留扩展。您可以在配置每个评估器或规则时选择退出。
</Note>

**为什么要自动升级痕迹？**

我们采用自动升级跟踪模型有两个原因：

1. 我们认为，符合任何这些条件的痕迹从根本上来说比其他痕迹更有趣，因此用户能够将它们保留更长时间是有好处的。
2. 从理念上讲，我们希望对可能无法进行有意义交互的痕迹向客户收取较低的费用。我们认为自动升级使我们的定价模型与LangSmith带来的价值保持一致，只有具有有意义的交互的痕迹才会被收取更高的费用。

如果您对我们的定价模型有疑问或疑虑，请随时通过[support.langchain.com](https://support.langchain.com)联系支持人员，让我们知道您的想法！

**数据保留如何影响下游功能？**

以下功能与保留的交互作用不同：* **实验**：默认情况下，运行是在延长保留时创建的。
* **自动化规则和评估器**：启用保留设置后，将匹配跟踪升级为延长保留。
* **UI 反馈、注释和注释队列**：保持跟踪的保留层不变。

其他功能的行为独立于跟踪的保留层：

* **监控**：即使基础层跟踪的数据保留期结束，监控选项卡也将继续工作。它由存在超过 30 天的跟踪元数据提供支持，这意味着即使在 `base` 层跟踪上，您的监控图表也将继续保持准确。
* **数据集**：数据集具有无限的数据保留期。换句话说，如果将跟踪的输入和输出添加到数据集，它们将永远不会被删除。我们建议，如果您使用LangSmith进行数据收集，请利用数据集功能。

#### 计费模型

**计费指标**

在您的 LangSmith 发票上，您将看到我们收取的两个指标：

* LangSmith 迹线（基本电荷）
* LangSmith 跟踪（扩展数据保留升级）。第一个指标包括所有跟踪，无论层如何。第二个指标仅计算扩展保留跟踪的数量。

**为什么要测量所有迹线+升级而不是基本迹线和扩展迹线？**

在考虑我们的定价时，一个自然要问的问题是，为什么不直接在发票上显示 `base` 层和 `extended` 层跟踪的数量？

虽然我们知道这会更简单，但它不适合跟踪升级。考虑 6 月 30 日记录的 `base` 层跟踪，并于 7 月 3 日升级到 `extended` 层。`base` 层跟踪发生在 6 月计费周期，但升级发生在 7 月计费周期。因此，我们需要能够独立地衡量这两个事件，以便正确地向客户计费。

如果您的跟踪被记录为扩展保留跟踪，则 `base` 和 `extended` 指标都将使用相同的时间戳进行记录。

### 速率限制

LangSmith具有速率限制，旨在确保所有用户的服务稳定性。

为了保证访问和稳定性，在以下情况下，LangSmith将响应 HTTP 状态代码 429，表明已超出速率或使用限制：#### 我们的应用程序负载均衡器 1 分钟内的临时吞吐量限制

此 429 是基于每个服务密钥或 PAT 在 1 分钟窗口内超过固定数量的 API 调用的结果。窗口的开始时间会略有不同（不保证在时钟分钟开始时开始），并且可能会根据应用程序部署事件而变化。

收到最大事件数后，我们将响应 429，直到达到评估窗口开始后 60 秒，然后重复该过程。

此 429 由我们的应用程序负载均衡器抛出，是一种为所有LangSmith 用户建立的独立于计划层的机制，以确保所有用户的服务连续性。

|方法|端点 |限制|窗口|
| ----------------- | ------------- | -----| -------- |
| `DELETE` | `/sessions*` | 30| 1 分钟 |
| `POST` 或 `PATCH` | `/runs*` | 5000 | 1 分钟 |
| `GET` | `/runs/:id` | 30| 1 分钟 |
| `POST` | `/feedbacks*` | 5000 | 1 分钟 |
| `*` | `*` | 2000 | 2000 1 分钟 |<Note>
  LangSmith SDK 采取措施，通过将单个会话 ID 中的最多 100 次运行批处理到单个 API 调用中，最大限度地降低在运行相关端点上达到这些限制的可能性。
</Note>

#### 计划级每小时跟踪事件限制

此 429 是达到每小时最大摄取事件数的结果，并在 UTC 每个时钟小时开始时的固定窗口中进行评估，并在每个新小时的顶部重置。

此上下文中的事件是运行的创建或更新。如果创建运行并随后在同一小时窗口中更新，则针对此限制计为 2 个事件。

这是由我们的应用程序引发的，并因计划级别而异，我们的 Startup/Plus 和 Enterprise 计划级别的组织的每小时限制高于专为个人使用而设计的免费和开发人员计划级别。|计划|限制|窗口|
| -------------------------------- | -------------- | ------ |
|开发商（档案中无付款）| 50,000 场活动 | 1小时|
|开发商（已付款存档）| 250,000 场活动 | 1小时|
|启动/增强 | 500,000 个事件 | 1小时|
|企业 |定制|定制|

#### 计划级每小时跟踪数据摄取限制

此 429 是在跟踪输入、输出和元数据中获取的最大数据量达到的结果，并在 UTC 每个时钟小时开始时的固定窗口中进行评估，并在每个新小时的顶部重置。

通常，输入、输出和元数据都会在运行创建和更新事件上发送。如果以 2.0MB 创建运行并在同一小时窗口内更新为 3.0MB，则相对于此限制计为 5.0MB 存储。

这是由我们的应用程序引发的，并因计划级别而异，我们的 Startup/Plus 和 Enterprise 计划级别的组织的每小时限制高于专为个人使用而设计的免费和开发人员计划级别。|计划|限制|窗口|
| -------------------------------- | ------ | ------ |
|开发商（档案中无付款）| 500MB | 1小时|
|开发商（已付款存档）| 2.5GB | 2.5GB 1小时|
|启动/增强 | 5.0GB| 1小时|
|企业 |定制|定制|

#### 计划级别每月唯一跟踪限制

此 429 是达到每月最大摄取痕迹的结果，并在 UTC 每个日历月月初开始的固定窗口中进行评估，并在每个新月月初重置。

这是由我们的应用程序抛出的，并且仅适用于当文件中没有付款方式时的开发者计划层。

|计划|限制|窗口|
| ------------------------------------------ | ------------ | -------- |
|开发商（档案中无付款）| 5,000 条痕迹 | 1 个月 |

#### 自行配置每月使用限额

此 429 是达到组织管理员配置的使用限制的结果，并在 UTC 每个日历月月初开始的固定窗口中进行评估，并在每个新月月初重置。这是由我们的应用程序引发的，并且根据组织的配置设置而有所不同。

#### 每条轨迹的最大运行次数

<MaxRunsPerTrace />

#### 运行查询端点

[⟦T43⟧](/langsmith/smith-api/run/query-runs) 端点具有基于查询参数的额外每租户速率限制。详情请参阅[Query traces using the SDK](/langsmith/export-traces#rate-limits)。

#### 在应用程序中处理 429 响应

由于某些 429 响应是临时的，并且可能会在连续调用时成功，因此如果您在应用程序中直接调用 LangSmith API，我们建议实现具有指数退避和抖动的重试逻辑。

为了方便起见，使用 LangSmith SDK 构建的 LangChain 应用程序内置了此功能。

<Note>
  值得注意的是，如果端点长时间处于饱和状态，重试可能不会有效，因为您的应用程序最终将运行足够大的积压，耗尽所有重试。

  如果是这样，我们愿意更具体地讨论您的需求。请通过 [LangSmith Support](https://support.langchain.com) 联系支持人员，提供有关您的应用程序吞吐量需求和示例代码的详细信息，我们可以与您合作，更好地了解最佳方法是否是修复错误、更改应用程序代码或不同的 LangSmith 计划。
</Note>### 使用限制

LangSmith 允许您配置跟踪的使用限制。请注意，这些是“使用”限制，而不是“支出”限制，这意味着它们可以让您限制某些事件发生的数量，而不是您将花费的总金额。

LangSmith 允许您设置两个不同的每月限额，反映了上述数据保留指南中讨论的计费指标：

* 所有痕迹限制
* 扩展数据保留痕迹限制

这些可让您分别限制总跟踪数和扩展数据保留跟踪数。

<Note>有关评估器运行的*花费*具体限制，请参阅[Track and limit evaluator spend](/langsmith/evaluator-spend)。</Note>

#### 使用限制的属性

使用限制是近似的，这意味着我们不保证限制的准确性。在极少数情况下，在开始应用使用限制之前，可能会在一小段时间内处理超出限制阈值的额外跟踪。

#### 延长数据保留跟踪限制的副作用延长数据保留跟踪限制有副作用。如果已达到限制，则任何可能导致跟踪层自动升级的功能都将无法访问。这是因为跟踪的自动升级会导致创建另一个扩展保留跟踪，而这又不应受到限制的允许。因此，您不能再：

1.比赛运行规则
2. 给轨迹添加反馈
3. 将运行添加到注释队列

这些功能中的每一个都可能会导致自动升级，因此我们在达到限制时将其关闭。

#### 更新使用限制

使用限制可以从`Settings`页面的`Usage and Billing`下更新。限制值会被缓存，因此可能需要一两分钟才能应用新限制。

#### 每个项目和每个用户的跟踪限制

除了 [workspace-wide limits](#usage-limits) 之外，您还可以限制单个跟踪项目或单个工作区成员的每月跟踪。这可以防止一个项目或用户消耗过多的工作空间跟踪预算。

要配置这些限制，请打开 **设置**，转到 **使用配置**，然后选择 **项目和用户限制** 选项卡。选择**添加限制**，然后设置：* **范围**： **项目** 限制单个跟踪项目，或 **用户** 限制单个工作区成员。
* **工作空间**：包含项目或成员的工作空间。
* **项目** 或 **用户**：要限制的目标。
* **每月跟踪限制**：每个日历月允许的最大跟踪数。

更新这些限制需要与工作区使用限制 (`Update usage limits`) 相同的权限。

与工作区限制一样，每个项目和每个用户的限制按照 UTC 的每个日历月进行评估，并在每个新月开始时重置。一旦项目或用户达到其限制，其新跟踪将被丢弃，并且不会再次被摄取，直到限制重置。强制执行是近似的，因此在限制生效之前，可能会在阈值以上处理少量跟踪。这些限制适用于 [Cloud](/langsmith/cloud) 和 [Self-hosted](/langsmith/self-hosted)。

<Note>
  每个项目和每个用户的限制是您的工作区范围和计划限制的**附加**。痕迹必须在每个适用的摄入限值内。

  每用户限制仅计算归因于特定工作区成员的跟踪。使用未与成员绑定的 API 密钥或服务密钥发送的跟踪不计入每用户限制。限制值会被缓存，因此可能需要一两分钟才能应用新的或更改的限制。
</Note>

###相关内容

* 关于如何[enforce spend limits](/langsmith/billing#enforce-spend-limits)的教程

## 其他资源

* **[Release policy](/langsmith/release-versions)**：了解自托管发布渠道、节奏和版本编号。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/administration-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>