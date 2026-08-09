<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith for Enterprise | https://docs.langchain.com/langsmith/enterprise -->

# LangSmith 企业版

企业用户的托管选项、访问控制、数据隐私、成本控制和安全合规性。

此页面是企业团队的参考中心，包含对您的组织重要的功能的信息，例如 [hosting options](#hosting-options)、[access control](#access-control)、[data privacy](#data-privacy-and-pii) 和 [cost controls](#cost-controls-and-usage)。

<Callout>
  有关 Enterprise [pricing](/langsmith/pricing-plans) 或入门的问题，[contact our sales team](https://www.langchain.com/contact-sales)。
</Callout>

## 托管选项

选择如何托管 LangSmith 以满足您的基础架构和数据驻留要求。

<CardGroup>
  <Card title="Cloud" icon="cloud" href="/langsmith/cloud">
    在具有美国或欧盟数据驻留的 LangSmith 托管云中托管 LangSmith。
  </Card>

  <Card title="Hybrid" icon="topology-complex" href="/langsmith/hybrid">
    在 LangSmith 的云中运行控制平面，在您自己的 VPC 中运行数据平面，以实现完全数据隔离。
  </Card>

  <Card title="Self-hosted" icon="server-2" href="/langsmith/self-hosted">
    使用 Kubernetes 将 LangSmith 完全托管在您自己的基础设施中。
  </Card>
</CardGroup>

## 用户管理

管理用户并自动化整个组织的配置。

<CardGroup>
  <Card title="User management" icon="users" href="/langsmith/user-management">
    邀请用户、分配角色并配置 SCIM 以进行自动配置和取消配置。
  </Card>

  <Card title="SSO & JIT provisioning" icon="login" href="/langsmith/authentication-methods">
    为您的身份提供商配置 SAML 或 OIDC 单点登录和即时用户配置。
  </Card><Card title="Organization setup" icon="building" href="/langsmith/set-up-hierarchy">
    在企业内创建和配置组织、工作区和用户层次结构。
  </Card>

  <Card title="Manage by API" icon="terminal-2" href="/langsmith/manage-organization-by-api">
    以编程方式管理用户、配置安全设置并通过 API 管理您的组织。
  </Card>
</CardGroup>

## 访问控制

控制谁可以访问组织内的内容。

<CardGroup>
  <Card title="Role-based access control (RBAC)" icon="shield-lock" href="/langsmith/rbac">
    使用内置或自定义角色定义每个工作区的权限。仅适用于企业计划。
  </Card>

  <Card title="Attribute-based access control (ABAC)" icon="tag" href="/langsmith/abac">
    应用细粒度、基于标签的访问策略来限制资源访问，包括阻止特定用户的 PII 数据。
  </Card>

  <Card title="Workload isolation" icon="layout-sidebar" href="/langsmith/workload-isolation">
    使用多工作空间模型来隔离团队、建立信任边界并分隔环境。
  </Card>

  <Card title="Resource tags" icon="tag" href="/langsmith/set-up-resource-tags">
    标记资源以与 ABAC 策略一起使用并组织开发、登台和生产等环境。
  </Card>
</CardGroup>

## 数据隐私和 PII

控制敏感数据的存储和访问方式。

<CardGroup>
  <Card title="Data storage & privacy" icon="database" href="/langsmith/data-storage-and-privacy">
    了解 LangSmith 存储的内容、加密的工作原理以及如何选择退出遥测和跟踪。
  </Card>

  <Card title="PII controls with ABAC" icon="eye-off" href="/langsmith/abac">
    使用 ABAC 拒绝策略来限制对包含个人身份信息的跟踪和数据集的访问。
  </Card>
</CardGroup>## 数据保留和清理

配置数据保留多长时间以及如何删除数据。

<CardGroup>
  <Card title="Data purging for compliance" icon="trash" href="/langsmith/data-purging-compliance">
    设置自定义保留期限，按元数据删除痕迹，并满足删除要求。
  </Card>

  <Card title="Data retention settings" icon="clock" href="/langsmith/usage-and-billing#data-retention">
    了解基本保留层与扩展保留层、自动升级以及保留如何影响计费。
  </Card>
</CardGroup>

## 成本控制和使用

跟踪并限制整个组织的支出。

<CardGroup>
  <Card title="Billing & spend limits" icon="credit-card" href="/langsmith/billing">
    设置每月使用限制、跟踪预付费合同使用情况并优化跟踪支出。
  </Card>

  <Card title="Granular usage reporting" icon="chart-bar" href="/langsmith/granular-usage">
    按工作区、项目、用户或 API 密钥细分跟踪使用情况，以归因跨团队的成本。
  </Card>
</CardGroup>

## 安全与合规性

查看 LangSmith 的安全状况和合规性认证。

<CardGroup>
  <Card title="Shared responsibility model" icon="shield-check" href="/langsmith/shared-responsibility-model">
    审查LangChain和您的组织之间共同承担的安全责任。 LangSmith 拥有 SOC 2 Type II、HIPAA 和 GDPR 认证。
  </Card>

  <Card title="Scalability & resilience" icon="chart-arrows-vertical" href="/langsmith/scalability-and-resilience">
    查看 SLA 保证、灾难恢复策略和高可用性配置。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/enterprise.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>