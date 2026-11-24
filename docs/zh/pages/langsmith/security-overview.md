<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith security overview | https://docs.langchain.com/langsmith/security-overview -->

# LangSmith 安全概述

查看 LangSmith 合规性认证、部署模型以及身份、访问、API 密钥、审核、数据保护和代理治理的安全控制。

LangSmith是用于测试、部署、监控和改进代理的平台。保护您的代理包括谁可以访问您的组织、他们的踪迹会发生什么以及他们可以使用哪些模型和工具。 LangChain 通过 SOC 2 Type II 认证以及 I​​SO/IEC 27001 和 42001 认证为平台提供支持。

LangChain 和您的组织共同承担保护 LangSmith 的责任。 [shared responsibility model](/langsmith/shared-responsibility-model) 规定了每个职责的负责人，[BYOC shared responsibility model](/langsmith/byoc-shared-responsibility) 对“自带云”也做了同样的规定。对于审阅者关于 LangSmith 数据所在位置以及谁可以访问它的说明，请从 [LangChain Trust Center](https://trust.langchain.com/resources) 中的 LangSmith 安全概述开始。

## 合规性和认证

LangChain 保持 SOC 2 Type II 认证，每年进行审核，并持有 ISO/IEC 27001:2022 和 ISO/IEC 42001:2023 认证。 LangChain 符合 GDPR、CCPA 和 HIPAA。

[LangChain Trust Center](https://trust.langchain.com)发布LangChain的安全报告和策略，并列出LangChain的子处理者及其处理位置。您可以在那里请求访问以下文档：* SOC 2 Type II 审核报告和过渡函
* ISO/IEC 27001:2022 证书和适用性声明
* ISO/IEC 42001:2023 证书和适用性声明
* 渗透测试执行摘要
* 共识评估倡议问卷 (CAIQ)
* 安全政策

对于安全问题或报告请求，请联系[trust@langchain.dev](mailto:trust@langchain.dev)。要报告安全事件，请联系[security@langchain.dev](mailto:security@langchain.dev)。要报告 LangSmith 漏洞，请使用 Intigriti 上的 [LangChain VDP](https://app.intigriti.com/researcher/programs/langchain/langchain-vdp)。对于其他安全问题，请参阅[Security policy](/oss/python/security-policy)。

## 部署模型

您的部署模型决定了谁操作LangSmith的每一层，以及谁配置和保护此页面上的每个控件。

|型号|控制平面|数据平面|数据所在 |
| - | - | - | - |
| [Cloud](/langsmith/cloud) | LangChain | LangChain |您在注册时选择的[region](/langsmith/cloud#regions)：GCP 美国、欧盟或亚太地区、AWS 美国或 Azure 美国。 |
| [BYOC](/langsmith/byoc) | LangChain | LangChain，在您的云帐户中 |您的云帐户，位于您选择的区域。 |
| [Self-hosted](/langsmith/self-hosted) |你|你|您的环境，在您运行的任何区域。 |

[Hybrid](/langsmith/hybrid) 仅更改代理服务器运行的位置。您托管代理服务器，它们将跟踪发送到LangSmith云或自托管实例，因此跟踪数据位于该实例运行的任何地方。BYOC 在 AWS 上全面可用 (GA)，在 GCP 和 Azure 上则处于测试阶段。自托管 LangSmith 和 BYOC 需要 [Enterprise plan](/langsmith/pricing-plans)。

云将您组织的数据存储在您注册的区域。您不能将组织移动到另一个区域。对于存储在您所在区域之外的数据，例如身份验证和计费数据，请参阅[Regional storage](/langsmith/cloud#regional-storage)和[Regions FAQ](/langsmith/regions-faq)。

## 身份和访问

### 身份验证

单点登录 (SSO) 允许用户通过您自己的身份提供商 (IdP) 进行身份验证，并且您可以要求每次登录都进行 SSO。

* **云和 BYOC**：将 [SAML SSO](/langsmith/user-management) 与任何 SAML 2.0 IdP（例如 Okta 或 Microsoft Entra ID）结合使用，或使用 OIDC。 SAML SSO 需要企业计划。
* **自托管**：使用[SSO with OAuth 2.0 and OIDC](/langsmith/self-host-sso)。

对于每个登录选项，请参阅 [Authentication methods](/langsmith/authentication-methods)。

### 授权

一个[organization](/langsmith/administration-overview#organizations)包含一个或多个[workspaces](/langsmith/administration-overview#workspaces)。跟踪项目、数据集和提示等资源属于工作区，用户在他们加入的每个工作区中获得一个角色。使用单独的工作区来隔离业务部门、团队或用例。有关模式，请参阅[Workload isolation](/langsmith/workload-isolation)。

工作区 RBAC、自定义角色、角色限制、ABAC 和用户组需要企业计划。其他计划为每个用户提供管理工作区角色。* **[Role-based access control (RBAC)](/langsmith/rbac)**：分配内置管理员、编辑者或查看者工作区角色，或根据精细权限构建自定义角色。 [Mark sensitive roles as restricted](/langsmith/rbac#restrict-roles)，以便只有允许分配受限角色的成员（例如工作区管理员）才能分配它们。
* **[Attribute-based access control (ABAC)](/langsmith/abac)**：使用基于资源标签或根运行元数据的访问策略来缩小工作空间内的访问范围。
* **[User groups](/langsmith/user-groups)**：将工作区成员资格和角色分配给一组用户而不是每个用户。

### 用户配置

配置将 LangSmith 连接到您的 IdP，以便访问遵循您的员工生命周期。

* **[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)**：从 IdP 中添加、更新和删除用户及其角色。在云上，SCIM 需要 SAML SSO。
* **[SSO Groups Sync](/langsmith/user-management#sso-groups-sync-alternative)**：每次登录时从 SSO 令牌读取组成员身份，作为 SCIM 的替代方案。
* **[JIT provisioning](/langsmith/jit-invite-sso)**：首次使用 SSO 登录时将用户添加到您的组织及其默认工作区。

## API 密钥

API 密钥向 LangSmith 验证您的应用程序和脚本。共有三种类型：* **[Personal access tokens (PATs)](/langsmith/administration-overview#personal-access-tokens-pats)**：继承创建它们的用户的权限。将 PAT 用于个人脚本和工具。
* **[Service keys](/langsmith/administration-overview#service-keys)**：范围到特定工作区或整个组织，独立于任何用户。将服务密钥用于代理、CI 和生产服务。
* **[Tracing keys](/langsmith/create-account-api-key#tracing-keys)**：仅通过跟踪摄取 API 提交跟踪。使用跟踪密钥来检测仅需要发送跟踪的代理。

您可以控制密钥的持续时间以及它可以达到的范围：

* **过期**：每个密钥都可以带有过期日期。在企业计划中，管理员还可以在 **设置** > **最大过期设置** 下限制服务密钥和跟踪密钥的有效时间。过期的密钥无法重新激活。
* **撤销**：随时删除任何密钥。组织管理员和组织操作员可以停用、重新激活或删除任何成员的 PAT。
* **范围**：为服务密钥分配一个 [organization role](/langsmith/rbac#organization-roles)，在企业计划中分配一个 [workspace role](/langsmith/administration-overview#workspace-roles)，包括自定义角色，因此它仅包含集成所需的权限。

要创建和管理密钥，请参阅[Create an account and API key](/langsmith/create-account-api-key)。

## 审计日志记录[Audit logs](/langsmith/audit-logs) 记录组织中的管理和配置操作，例如成员资格和角色更改、API 密钥更改和 SSO 配置。每个事件都会记录时间、参与者、操作、受影响的资源和结果。 LangSmith 最多保留审核日志 400 天。

审核日志需要企业计划。自托管 LangSmith 需要 Helm 图表版本 0.12.33 或更高版本。

审核日志 API 以 [OCSF](https://schema.ocsf.io/) v1.7.0 API 活动格式返回事件。要将事件拉入 Splunk 或其他安全信息和事件管理 (SIEM) 工具，请参阅 [Send audit logs to a SIEM](/langsmith/audit-logs-siem)。

## 数据保护

### 传输中和静态的数据

您的应用程序通过 SDK、REST API 或 [OpenTelemetry](/langsmith/trace-with-opentelemetry) 将跟踪发送到 LangSmith。跟踪是可选的，您可以决定每个跟踪包含的内容。在 BYOC 和自托管部署中，跟踪摄取结束于您自己的数据平面。

LangSmith 云使用 AES-256 对静态数据进行加密，并使用 TLS 1.2 或更高版本对传输中的数据进行加密。在运行数据平面的地方，您还可以携带自己的密钥：* **AWS 上的 BYOC**：使用您自己的 AWS KMS 密钥加密数据平面。参见[Bring your own keys (CMK)](/langsmith/byoc-byok-aws)。
* **代理服务器**：使用内置 AES 加密或您自己的加密处理程序来加密代理数据，例如检查点。参见[Encryption at rest](/langsmith/encryption)。

### 数据保留和删除

默认跟踪保留取决于您的部署模型，而不是您的计划。您可以为跟踪选择基本或扩展保留层。在 Cloud 上，基本保留期为 14 天，延长保留期为 180 天。对于 BYOC 和自托管默认设置，请参阅 [Retention periods](/langsmith/usage-and-billing#retention-periods)。

企业计划让您为每个工作区提供 [set the extended retention period](/langsmith/data-purging-compliance#customize-extended-retention-policy) 30 到 180 天的云服务。管理员还可以关闭工作区的延长保留。您可以随时通过 API 删除轨迹和数据集示例。参见[Data purging for compliance](/langsmith/data-purging-compliance)。

数据集会一直存在，直到您将其删除，即使它们的源跟踪已过期。

### 痕迹中的敏感数据

LangSmith 在跟踪生命周期的每个阶段提供控制，以防止敏感数据出现。* **数据离开您的环境之前**：SDK 中的[Mask or hide trace inputs and outputs](/langsmith/mask-inputs-outputs)、API 密钥和令牌等[redact secrets](/langsmith/redact-secrets)，或您运行的[redact with an OpenTelemetry collector](/langsmith/otel-gateway-trace-redaction)。
* **内部LangSmith**：使用`runs:read-inputs`和`runs:read-outputs`[permissions](/langsmith/rbac)限制谁可以读取跟踪输入和输出，并使用[access policy](/langsmith/abac#control-access-to-run-inputs-and-outputs)将它们隐藏在特定项目中。没有这些权限的用户仍然可以看到运行树、延迟、成本和元数据。要限制用户可以在项目中读取哪些跟踪，请使用 [root run metadata policy](/langsmith/abac#control-trace-access-with-root-run-metadata)。
* **共享时**：在有人创建公共链接之前，跟踪对您的工作区是私有的。查看 **设置** > **共享 URL** 下的每个公共链接，并取消共享不再需要的链接。参见[Share a trace](/langsmith/manage-trace#share-a-trace)。

有关输入、输出和跟踪级别访问控制的演练，请阅读 LangChain 博客上的 [Protect sensitive data in your traces](https://www.langchain.com/blog/protect-sensitive-data-in-your-traces-new-controls-in-langsmith)。

### 评估和评论功能中的数据

评估和审查功能适用于跟踪数据的副本，有些功能会将其发送到您选择的系统：* **[Datasets](/langsmith/manage-datasets)**：存储您作为示例添加的跟踪输入和输出的副本。源跟踪过期后数据集仍然存在。
* **[LLM-as-judge evaluators](/langsmith/llm-as-judge)**：将评估者评分的运行数据发送到您为该评估者选择的模型提供商。这也适用于生产痕迹上的[online evaluators](/langsmith/online-evaluations-llm-as-judge)。
* **[Automation rules](/langsmith/rules)**：将匹配跟踪添加到数据集或注释队列，延长其保留时间，或将它们发送到您选择的 [webhook](/langsmith/webhooks) 端点。
* **[Annotation queues](/langsmith/annotation-queues)**：向工作区中的审阅者显示排队的运行。工作区角色和 [access policies](/langsmith/abac) 控制谁可以读取审阅者处理的队列和数据集。

在 BYOC 和自托管部署中，数据集、实验和注释队列保留在数据平面中。

## 代理和模型治理

这些控制措施控制您的代理使用哪些模型和工具，并使提供商凭据远离最终用户。* **[Model configurations](/langsmith/model-configurations)**：选择可在 LangSmith 功能（例如 Playground 和评估器）中使用的模型提供程序和模型。 LangSmith 在服务器端存储提供商机密。
* **[LLM Gateway](/langsmith/llm-gateway)**（测试版）：通过 LangSmith 路由模型调用以应用编辑敏感数据的 [spend policies](/langsmith/llm-gateway-spend-policies) 和 [data policies](/langsmith/llm-gateway-data-policy)。
* **[Tool Gateway](/langsmith/tool-gateway)**（测试版）：将 MCP 服务器凭据存储在 LangSmith 中，并设置阻止工具调用或需要批准的 [policies](/langsmith/tool-gateway-policies)。
* **[Agent Auth](/langsmith/agent-auth)**（测试版）：让代理使用 OAuth 2.0 代表用户向外部服务进行身份验证。
* **[Sandboxes](/langsmith/sandboxes)**：在隔离环境中运行代理生成的代码。
* **[LLM auth proxy](/langsmith/llm-auth-proxy-self-hosted)**：在您的环境中运行基于 Envoy 的代理来验证每个模型调用，因此提供程序凭证永远不会暴露给最终用户。 LLM 身份验证代理需要企业计划。

要标记生产中的敏感或不安全内容，请在实时跟踪上运行 [online evaluators](/langsmith/online-evaluations-llm-as-judge)，并使用 [automation rules](/langsmith/rules) 将匹配的跟踪发送到注释队列或 Webhook。

[Fleet](/langsmith/fleet/access-and-oversight) 和 [Engine](/langsmith/engine-security) 基于相同的工作区权限、保留和屏蔽控制构建。每个都有自己的安全页面。

## 数据处理和模型训练对于 LangChain 管理模型的 AI 功能，推理通过配置为零数据保留 (ZDR) 的模型提供程序运行。他们与LangChain的协议禁止对客户数据进行培训。当您自带模型提供商时，该提供商的数据条款适用。

LangChain 为需要就 LangSmith 如何处理其数据做出合同承诺的客户提供企业协议、[Enterprise Terms of Service](https://www.langchain.com/terms-of-service) 和 [Enterprise DPA](https://www.langchain.com/enterprise-data-processing-addendum)。根据这些条款，LangChain 不会使用客户数据来训练、开发或改进其产品，包括其模型。要了解更多信息，[contact sales](https://www.langchain.com/contact-sales)。

## 安全最佳实践

当您向组织推出 LangSmith 时，请使用此清单。 SSO、自定义角色、最长密钥过期时间、审核日志和保留设置需要企业计划。* **需要 SSO**：强制执行仅 SSO 登录，并为用户提供 SCIM 或 SSO 组同步，以便在有人离开您的 IdP 时访问结束。
* **授予最低权限**：为用户提供他们所需的最低角色。使用自定义角色来执行狭窄的职责，并将管理员级别的角色标记为受限。
* **谨慎选择工作区边界**：遵循 [workload isolation](/langsmith/workload-isolation) 模式，建议每个业务部门分配一个工作区。将环境和客户保留在同一工作区中，而不是为每个工作区创建一个工作区，这样可能会增加到数百个工作区。
* **隐藏敏感输入和输出**：从仅需要调试性能的角色中删除`runs:read-inputs`和`runs:read-outputs`，并通过访问策略将它们重新授予每个项目。
* **每个服务使用一个服务密钥**：不要在服务之间共享密钥，并且不要将 PAT 用于生产服务。仅为每个服务键赋予其所需的角色。
* **设置密钥过期和轮换密钥**：为每个密钥指定过期日期。在企业计划中，还可以设置服务密钥和跟踪密钥的最长过期时间。将密钥存储在环境变量或机密管理器中，而不是源代码中。如果您怀疑某个密钥已泄露，请将其删除并创建一个新密钥。* **在源头进行编辑**：在痕迹离开您的环境之前，在 SDK 或 OpenTelemetry 收集器中屏蔽 PII 和机密。请勿发送禁止数据，例如支付卡数据。
* **禁用或查看公共共享**：在 **设置** > **安全策略** > **公共共享** 下关闭整个组织的公共共享，或使用 [organization API](/langsmith/manage-organization-by-api#security-settings) 中的 `disable_public_sharing` 字段。如果您继续共享，请定期审核**设置** > **共享 URL**。无论哪种方式，在与任何人共享跟踪之前，请编辑敏感内容，包括 LangChain 支持。
* **监控审核日志**：将审核日志转发到您的 SIEM，并对角色更改、密钥创建和 SSO 配置更改发出警报。
* **将保留期与您的策略相匹配**：在企业计划中，将延长保留期设置为您的用例允许的最短期限。在每个计划中，删除不再需要的数据集示例。

## 另请参阅

* [Shared responsibility model](/langsmith/shared-responsibility-model)
* [BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)
* [Scalability and resilience](/langsmith/scalability-and-resilience)
* [LangChain Trust Center](https://trust.langchain.com)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/security-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。