<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Overview | https://docs.langchain.com/langsmith/administration-overview -->

# 概述

了解 LangSmith 如何组织组织、工作区和资源，以及用户、API 密钥和角色如何工作。

本概述涵盖与管理 LangSmith 中的用户、组织、工作区和代理相关的主题。

## 资源层次结构

LangSmith 将访问和数据组织为四个级别。 [organization](#organizations) 包含工作区。每个[workspace](#workspaces)都包含特工。 [Agents](#agents) 按环境组织您的跟踪并对您使用的 [resources](#resources) 进行分组，例如数据集和提示。

自托管 LangSmith 按应用程序而不是代理对资源进行分组。详情请参见[Self-hosted workspaces](#self-hosted-workspaces)。

下图显示了组织、工作区、代理、环境和资源之间的关系：

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Inter, system-ui, sans-serif","lineColor":"#40668D","primaryColor":"#E5F4FF","primaryTextColor":"#030710","primaryBorderColor":"#006DDD","clusterBkg":"transparent"}}}%%
flowchart TD
    ORG("<div style='padding:2px 6px'><b>Organization</b></div>")
    WSA("<div style='padding:2px 6px'><b>Workspace</b></div>")
    WSB("<div style='padding:2px 6px'><b>Workspace</b></div>")
    AG1("<div style='padding:2px 6px'>Agent</div>")
    AG2("<div style='padding:2px 6px'>Agent</div>")
    AG3("<div style='padding:2px 6px'>Agent</div>")
    AG4("<div style='padding:2px 6px'>Agent</div>")
    ENV("<div style='padding:2px 6px'><b>Environments</b><br/>Traces</div>")
    RES("<div style='text-align:left;padding:2px 6px'><b>Resources</b><br/>&nbsp;•&nbsp; Datasets<br/>&nbsp;•&nbsp; Annotation queues<br/>&nbsp;•&nbsp; Prompts<br/>&nbsp;•&nbsp; Deployments</div>")

    ORG ==> WSA & WSB
    WSA ==> AG1 & AG2
    WSB ==> AG3 & AG4
    AG1 ==> ENV & RES

    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68,rx:10,ry:10
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710,rx:10,ry:10
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33,rx:10,ry:10

    class ORG,WSA,WSB process
    class AG1,AG2,AG3,AG4 neutral
    class ENV,RES output
```

### 组织

组织是 LangSmith 中用户的逻辑分组，定义了应用于其所有工作区的共享设置。这些设置管理组织范围内的问题，而不是工作区中的代理和资源。常见的组织级配置包括用户管理、单点登录 (SSO)、OAuth 提供程序配置、自定义角色创建、计费和使用情况跟踪。通常，每个公司有一个组织。一个组织可以有多个工作区。详细配置请参见[Set up an organization](/langsmith/set-up-hierarchy#set-up-an-organization)。

当您第一次登录时，系统会自动为您创建一个个人组织。如果您想与其他人协作，您可以创建一个单独的组织并邀请您的团队成员加入。您的个人组织和共享组织之间存在一些重要区别：

|特色 |个人|共享|
| - | - | - |
|最大工作空间 | 1 |可变，取决于计划（参见[pricing page](https://www.langchain.com/pricing)）|
|合作|无法邀请用户 |可以邀请用户 |
|计费：付费计划|仅限开发者计划 |所有其他可用计划 |

### 工作区

> [!注意]
>
> 工作空间以前称为租户。在过渡期间的一段时间内，某些代码和 API 可能仍引用旧名称。

工作区是组织内用户、代理和 [resources](#resources) 的逻辑分组。工作空间通常用于隔离业务单元，因此每个单元的代理和资源与其他单元保持分离。工作区分隔资源和访问控制的信任边界。用户在工作区级别被授予权限，这决定了他们对该工作区中资源的访问权限，包括数据集、注释队列和提示。要配置其中一个，请参阅[Set up a workspace](/langsmith/set-up-hierarchy#set-up-a-workspace)。权限详情请参见[Workspace roles](#workspace-roles)。

> [!提示]
>
> 为组织内的每个团队创建单独的工作区。要进一步组织资源，您可以按 [agent](#agents) 将它们分组在工作区中。
>
> 有关基于团队隔离要求的不同工作区组织模型的指南，请参阅[Workload isolation](/langsmith/workload-isolation)。

### 代理

[agent](/langsmith/agent-registry#agent) 是工作区中资源的逻辑分组，位于工作区本身的下一层。分组通过仅显示与当前上下文中的代理关联的资源来保持 UI 的组织。特工的痕迹进一步分为从固定的四个一组中提取的[environments](/langsmith/agent-environments)。

从顶部栏中的代理切换器中选择一个代理，或选择“**所有代理**”。欲了解更多信息，请参阅[Navigate agents](/langsmith/navigate-agents)。

LangSmith 通过代理的环境将跟踪链接到代理，并使用保留的 `Agent` [resource tag](#resource-tags) 键将数据集、提示、注释队列和部署链接到代理。跟踪页面要求您选择代理。数据集、提示、注释队列和部署可以在没有代理的情况下存在。选择**所有代理**会显示这些未链接的资源以及每个代理的资源。选择特定代理仅显示该代理的资源。

### 资源

资源是用于构建、运行和观察代理的具体实体。示例包括 [prompts](/langsmith/prompt-context-hub)、[datasets](/langsmith/manage-datasets)、[annotation queues](/langsmith/annotation-queues) 和 [deployments](/langsmith/deploy-overview)。资源可以限定在特定代理的范围内。

### 设置所在位置

有关哪些功能在哪些范围内可用的详细信息，请参阅下表：|资源/设置 |范围 |
| - | - |
|追踪项目 |工作空间或代理 |
|注释队列 |工作空间或代理 |
|部署|工作空间或代理 |
|数据集和实验 |工作空间或代理 |
|提示|工作空间或代理 |
| [Resource Tags](#resource-tags) |工作空间 |
| API 密钥 |工作空间 |
|设置包括秘密、反馈配置、模型、规则和共享 URL |工作空间 |
|用户管理：邀请用户加入工作区 |工作空间 |
| RBAC：分配工作区角色 |工作空间 |
|数据保留、使用限制 |工作区\* |
|计划和账单、积分、发票 |组织|
|用户管理：邀请用户加入组织|组织\*\* |
|添加工作区 |组织|
|分配组织角色 |组织|
| RBAC：创建/编辑/删除自定义角色 |组织|

> [!注意]
>
> \* 数据保留设置和使用限制也将很快适用于组织级别。
>
> \*\* 自托管安装可以通过功能标志启用工作区级别的用户邀请到组织。详情请参阅[self-hosted user management docs](/langsmith/self-host-user-management)。

### 资源标签资源标签允许您进一步隔离工作区中的资源以与 [ABAC](/langsmith/organization-workspace-operations#access-policies) 一起使用。每个标签都是一个可以分配给资源的键值对。

LangSmith 资源标签与[AWS](https://docs.aws.amazon.com/tag-editor/latest/userguide/tagging.html) 等云服务中的标签非常相似。

导航至[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-administration-overview)中的**设置**，选择侧边栏中的**资源标签**页面。

### 单独的环境

环境是发布过程中的一个阶段，例如开发、登台或生产。代理具有内置环境，取自固定的四个环境。 [agent](/langsmith/agent-registry#agent) 将其轨迹划分在它们之间，因此不需要标记约定。有关更多信息，请参阅[Agent environments](/langsmith/agent-environments)。

自托管 LangSmith 使用资源标签分隔环境。详情请参见[Self-hosted workspaces](#self-hosted-workspaces)。

无论哪种情况，都应避免使用单独的工作区进行环境隔离，因为资源无法跨工作区共享，这会阻止您在环境之间提升资源（例如提示）。> [!注意]
>
> **用于提示管理的资源标签与提交标签**
>
> 虽然两种类型的标签都可以使用 `dev`、`staging` 和 `prod` 等环境术语，但它们有不同的用途：
>
> * **资源标签** (`Environment: prod`)：使用这些标签来*组织*整个工作区的资源。将资源标签应用于跟踪项目、数据集和其他资源（包括提示），以按环境对它们进行分组。
> * [Commit tags](/langsmith/manage-prompts#commit-tags)（`prod` 标签）：使用它们来管理代码引用的 [prompt version](/langsmith/prompt-context-hub#prompts)。提交标签是指向提示历史记录中特定提交的标签。当您的代码通过标签名称（例如，`client.pull_prompt("prompt-name:prod")`）提取提示时，它会检索该标签当前指向的任何提交。要将提示从 `staging` 升级到 `prod`，请将提交标记移动到所需的版本。
>
> 资源标签组织**哪些资源**属于某个环境。提交标签使您可以控制代码引用的提示的**哪个版本**，而无需更改代码本身。

### 自托管工作区自托管 LangSmith 使用基于项目的工作区，按应用程序而不是代理对资源进行分组。应用程序可以将团队中的任何项目分组。从侧边栏顶部的“**应用程序**”下拉列表中选择一个，或选择“**所有应用程序**”以查看工作区中的每个资源。

基于项目的工作区使用 [resource tags](#resource-tags) 分隔环境：默认标签键 `Environment`，每个环境具有不同的值（例如，`dev`、`staging`、`prod`）。

要检查您拥有哪种类型的工作空间，请参阅[How agent-based workspaces differ](/langsmith/migrate-to-agent-based-workspaces#check-which-one-you-have)。

## 用户和角色

本节介绍谁可以访问 LangSmith 以及他们可以做什么：用户、三种类型的 API 密钥以及授予权限的角色。

### 用户

用户是有权访问LangSmith的人。用户可以是一个或多个组织以及这些组织内工作空间的成员。

从 **设置** 页面管理成员，该页面具有针对组织和工作区的单独部分：

* **组织** > **成员**：管理组织的成员。
* **工作空间** > **成员**：管理当前工作空间的成员。

### API 密钥LangSmith API 密钥验证对 LangSmith 的请求。它们与应用程序用来调用模型的模型提供程序密钥（例如 OpenAI 或 Anthropic 键）是分开的。

> [!警告]
>
> 我们于 2024 年 10 月 22 日终止了对前缀为 `ls__` 的旧版 API 密钥的支持，转而使用个人访问令牌 (PAT) 和服务密钥。我们要求对所有新集成使用 PAT 和服务密钥。自 2024 年 10 月 22 日起，以 `ls__` 为前缀的 API 密钥将不再有效。

#### 有效期

创建 API 密钥时，您可以选择设置到期日期。为密钥添加过期日期可以增强安全性并最大限度地降低未经授权访问的风险。例如，您可以为需要提升访问权限的临时任务设置密钥的到期日期。

一旦过期，API 密钥将不再有效，并且无法重新激活或修改其过期时间。

#### 个人访问令牌 (PAT)

个人访问令牌 (PAT) 用于验证对 LangSmith API 的请求。它们由用户创建并限定用户范围。 PAT 将具有与创建它的用户相同的权限。

PAT 前缀为 `lsv2_pt_`成员可以停用、重新激活或删除自己的 PAT。 [Organization Admins](/langsmith/rbac#organization-admin)和[Organization Operators](/langsmith/rbac#organization-operator)还可以列出、停用、重新激活和删除任何成员的PAT。

停用令牌会停止身份验证，但会通过 **停用** 徽章保持其记录、所有者和上次使用情况可见。停用是可逆的；删除会永久删除该记录。重新激活会保留原始到期日期，并且一旦过了该日期，将不可用。由于身份验证结果会被缓存，因此这些更改会在一分钟内生效，而不是立即生效。

具体步骤和认证缓存时序请参考[Deactivate or delete a personal access token](/langsmith/create-account-api-key#deactivate-or-delete-a-personal-access-token)。

> [!提示]
>
> 避免使用 PAT 来验证来自应用程序的请求。相反，将它们用于与 LangSmith API 交互的个人脚本或工具。如果与 PAT 关联的用户从组织中删除，则 PAT 将不再起作用。

#### 服务键服务密钥与 PAT 类似，但用于代表服务帐户对LangSmith API 的请求进行身份验证。组织管理员可以创建任何服务密钥。组织操作员和组织用户可以在其角色授予`workspaces:manage-keys`的工作区中创建工作区范围的服务密钥，例如工作区管理员。有关完整细分，请参阅[API keys operations](/langsmith/organization-workspace-operations#api-keys)。我们建议对需要与LangSmith API 交互的应用程序或服务使用服务密钥，例如LangGraph 代理或其他集成。

服务密钥的范围可以是单个工作区、多个工作区或整个组织。它们可用于验证对 LangSmith API 有权访问的任何工作区的请求。

服务密钥以 `lsv2_sk_` 为前缀。

服务密钥只能删除，不能停用。

> [!警告]
>
> 使用 `X-Tenant-Id` 标题指定目标工作空间。
>
> * **使用 PAT 时**：如果省略此标头，请求将针对与密钥关联的默认工作区运行。
> * **使用组织范围的服务密钥时**：访问工作区范围的资源时必须包含 `X-Tenant-Id` 标头。如果没有它，请求将失败并出现 `403 Forbidden` 错误。> [!注意]
>
> 要创建任何类型的 API 密钥，请参阅 [Create an account and API key](/langsmith/create-account-api-key)。

#### 跟踪键

跟踪密钥是组织拥有的凭据，具有提交跟踪和在选定工作区中创建项目的固定权限。他们不授予对存储的跟踪、实验、保存的视图或管理的访问权限。

跟踪键使用 `lsv2_tr_` 前缀。它们的范围在创建时固定，并且在创建者离开组织时仍然有效。它们遵循服务密钥过期限制。创建权限、范围限制、删除规则请参考[Tracing keys](/langsmith/create-account-api-key#tracing-keys)。

### 角色

每个用户都有一个组织角色，该角色适用于整个组织。在企业计划中，每个用户在其所属的每个工作区中还拥有一个工作区角色。在 **设置** > **角色** 中管理两者。有关更多信息，请参阅[Role-based access control](/langsmith/rbac)。

#### 组织角色

您的组织角色决定了您的 [organization-level permissions](/langsmith/organization-workspace-operations) 和工作区成员资格。组织角色与[workspace roles](#workspace-roles)（一项企业功能）不同，并且适用于组织中的所有工作区。

每个组织角色都会影响工作区成员身份，如下所示：* [Organization Admin](/langsmith/rbac#organization-admin) 的角色授予用户完全访问权限来管理所有组织配置、用户、计费和工作区。
  * 组织管理员拥有对组织中所有工作区的`Admin` 访问权限。
* [Organization Operator](/langsmith/rbac#organization-operator) 的角色授予用户对工作区和非管理员用户进行日常操作的管理访问权限，而无需管理员级别的权限，例如管理组织管理员。
  * 组织操作员仅添加到他们创建或受邀加入的工作区。
* [Organization User](/langsmith/rbac#organization-user)角色授予用户读取组织信息的权限。但是，他们无法在组织级别执行任何写入操作。组织用户可以创建[Personal Access Tokens](#personal-access-tokens-pats)。
  * 可以像往常一样将组织用户添加到工作区子集并分配工作区角色（如果启用 RBAC），这些角色指定工作区级别的权限。
* [Organization Viewer](/langsmith/rbac#organization-viewer)的角色相当于组织用户，但具有此角色的用户**不能**创建个人访问令牌。自托管安装需要 Helm 图表版本 0.11.25 或更高版本才能发挥此作用。* [Organization Restricted](/langsmith/rbac#organization-restricted) 的角色授予用户对其分配的工作区的访问权限，而无需组织范围的读取访问权限，因此用户无法列出组织成员。工作区范围的服务密钥也可以担任此角色。

> [!注意]
>
> 组织用户和组织查看者角色仅在 [Plus and Enterprise plans](https://langchain.com/pricing) 上的组织中可用。在开发人员组织（单个工作区）中，默认情况下为所有用户分配组织管理员角色。
>
> 有关如何禁用整个组织的 PAT 创建的说明，请参阅 [Security settings](/langsmith/manage-organization-by-api#security-settings)。

有关设置组织和工作区的更多信息，请参阅[organization setup guide](/langsmith/set-up-hierarchy#organization-roles)。

按角色划分的组织级权限：| |组织限制|组织查看器 |组织用户|组织运营商|组织管理|
| - | - | - | - | - | - |
|查看组织配置 | ✅ | ✅ | ✅ | ✅ | ✅ |
|查看组织角色 | ✅ | ✅ | ✅ | ✅ | ✅ |
|查看组织成员 | ❌ | ✅ | ✅ | ✅ | ✅ |
|查看数据保留设置 | ❌ | ✅ | ✅ | ✅ | ✅ |
|查看使用限制 | ❌ | ✅ | ✅ | ✅ | ✅ |
|创建个人访问令牌 (PAT) | ❌ | ❌ | ✅ | ✅ | ✅ |
|查看、停用、重新激活和删除任何成员的 PAT | ❌ | ❌ | ❌ | ✅ | ✅ |
|对所有工作区的管理员访问权限 | ❌ | ❌ | ❌ | ❌ | ✅ |
|管理计费设置 | ❌ | ❌ | ❌ | ✅ | ✅ |
|创建工作区 | ❌ | ❌ | ❌ | ✅ | ✅ |
|创建、编辑和删除组织角色 | ❌ | ❌ | ❌ | ✅ | ✅ |
|邀请新用户加入组织 | ❌ | ❌ | ❌ | ✅\* | ✅ |
|删除用户邀请 | ❌ | ❌ | ❌ | ✅\* | ✅ |
|从组织中删除用户 | ❌ | ❌ | ❌ | ✅\* | ✅ |
|更新数据保留设置 | ❌ | ❌ | ❌ | ✅ | ✅ |
|更新使用限制 | ❌ | ❌ | ❌ | ✅ | ✅ |

\* 组织操作员无法邀请、移除或删除组织管理员的邀请。有关所需权限以及可以执行这些权限的操作和角色的完整列表，请参阅[Organization and workspace reference](/langsmith/organization-workspace-operations)。

#### 工作区角色

> [!注意]
>
> RBAC（基于角色的访问控制）仅适用于企业客户。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用管理员角色。

在企业计划中，工作区角色定义用户在工作区中拥有的权限。共有三种无法编辑的内置工作区角色：

* [Workspace Admin](/langsmith/rbac#workspace-admin) 拥有工作空间内所有资源的完全访问权限。
* [Workspace Editor](/langsmith/rbac#workspace-editor) 可以创建、编辑和删除大多数资源，但无法删除运行、更改工作区设置或管理工作区成员。
* [Workspace Viewer](/langsmith/rbac#workspace-viewer) 对工作区中的所有资源具有只读访问权限。

[Organization Admins](/langsmith/rbac#organization-admin)还可以创建和编辑对不同资源具有特定权限的自定义角色。

> [!提示]
>
> 要同时为团队分配多个工作区中的角色，请创建 [user group](/langsmith/user-groups)。

## 使用和计费

有关跟踪保留期、速率限制和使用限制，请参阅[Usage and billing](/langsmith/usage-and-billing)。要管理发票和支出，请参阅[Manage billing](/langsmith/billing)。

## 另请参阅

* **[Release policy](/langsmith/release-versions)**：了解自托管发布渠道、节奏和版本编号。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/administration-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。