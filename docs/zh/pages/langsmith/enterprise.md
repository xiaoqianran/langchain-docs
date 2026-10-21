<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith for Enterprise | https://docs.langchain.com/langsmith/enterprise -->

# LangSmith 企业版

企业用户的托管选项、访问控制、数据隐私、成本控制和安全合规性。

此页面是企业团队的参考中心，包含对您的组织重要的功能的信息，例如 [hosting options](#hosting-options)、[access control](#access-control)、[data privacy](#data-privacy-and-pii) 和 [cost controls](#cost-controls-and-usage)。

有关 Enterprise [pricing](/langsmith/pricing-plans) 或入门的问题，[contact our sales team](https://www.langchain.com/contact-sales)。

## 托管选项

选择如何托管LangSmith以满足您的基础设施和数据驻留要求。

> **[Cloud](/langsmith/cloud)**
>
> 在 LangSmith 的托管云中托管 LangSmith，并具有美国或欧盟数据驻留。

> **[Hybrid](/langsmith/hybrid)**
>
> 在LangSmith的云中运行控制平面，在您自己的VPC中运行数据平面，以实现完全数据隔离。

> **[Self-hosted](/langsmith/self-hosted)**
>
> 使用 Kubernetes 将 LangSmith 完全托管在您自己的基础设施中。

## 用户管理

管理用户并自动化整个组织的配置。

> **[User management](/langsmith/user-management)**
>
> 邀请用户、分配角色并配置 SCIM 以进行自动配置和取消配置。

> **[SSO & JIT provisioning](/langsmith/authentication-methods)**
>
> 为您的身份提供商配置 SAML 或 OIDC 单点登录和即时用户配置。

> **[Organization setup](/langsmith/set-up-hierarchy)**
>
> 在企业内创建和配置组织、工作区和用户层次结构。> **[Manage by API](/langsmith/manage-organization-by-api)**
>
> 通过 API 以编程方式管理用户、配置安全设置并管理您的组织。

## 访问控制

控制谁可以访问组织内的内容。

> **[Role-based access control (RBAC)](/langsmith/rbac)**
>
> 使用内置或自定义角色定义每个工作区的权限。仅适用于企业计划。

> **[Attribute-based access control (ABAC)](/langsmith/abac)**
>
> 应用细粒度、基于标签的访问策略来限制资源访问，包括阻止特定用户的 PII 数据。

> **[Workload isolation](/langsmith/workload-isolation)**
>
> 使用多工作空间模型来隔离团队、建立信任边界并分隔环境。

> **[Resource tags](/langsmith/set-up-resource-tags)**
>
> 标记资源以与 ABAC 策略一起使用并组织开发、登台和生产等环境。

## 数据隐私和 PII

控制敏感数据的存储和访问方式。

> **[Data storage & privacy](/langsmith/data-storage-and-privacy)**
>
> 了解 LangSmith 存储什么、加密的工作原理以及如何选择退出遥测和跟踪。

> **[PII controls with ABAC](/langsmith/abac)**
>
> 使用 ABAC 拒绝策略来限制对包含个人身份信息的跟踪和数据集的访问。

## 数据保留和清理

配置数据保留多长时间以及如何删除数据。> **[Data purging for compliance](/langsmith/data-purging-compliance)**
>
> 设置自定义保留期限，按元数据删除痕迹，满足删除要求。

> **[Data retention settings](/langsmith/usage-and-billing#data-retention)**
>
> 了解基本保留层与扩展保留层、自动升级以及保留如何影响计费。

## 成本控制和使用

跟踪并限制整个组织的支出。

> **[Billing & spend limits](/langsmith/billing)**
>
> 设置每月使用限制、跟踪预付费合同使用情况并优化跟踪支出。

> **[Granular usage reporting](/langsmith/granular-usage)**
>
> 按工作区、项目、用户或 API 密钥细分跟踪使用情况，以归因跨团队的成本。

## 安全与合规性

查看 LangSmith 的安全状况和合规性认证。

> **[Shared responsibility model](/langsmith/shared-responsibility-model)**
>
> 检查 LangChain 和您的组织之间共同承担的安全责任。 LangSmith 拥有 SOC 2 Type II、HIPAA 和 GDPR 认证。

> **[Scalability & resilience](/langsmith/scalability-and-resilience)**
>
> 查看 SLA 保证、灾难恢复策略和高可用性配置。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/enterprise.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。