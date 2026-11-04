<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up the LLM Gateway | https://docs.langchain.com/langsmith/llm-gateway-admin-setup -->

# 设置LLM网关

通过添加提供商密钥、授予调用网关的权限、颁发 API 密钥以及设置治理策略，为您的组织设置 LLM 网关。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

此页面引导管理员为其组织准备[LLM Gateway](/langsmith/llm-gateway)：连接提供商、授予访问权限、颁发 API 密钥和设置策略。按顺序完成以下部分。每个链接都链接到完整涵盖其主题的页面。

> [!提示]
>
> 某些用户无需此设置即可启动。 [Workspace Admin](/langsmith/rbac#workspace-admin) 已经可以调用网关，并且可以从模拟器的 **需要密钥** 提示中添加提供者密钥。如果您是组织中的唯一用户，请转至 [Send your first LLM Gateway request](/langsmith/llm-gateway-first-request)。

## 在自托管LangSmith上启用网关

在其他步骤之前，在自托管 LangSmith、[enable the gateway in the Helm chart](/langsmith/llm-gateway-self-hosted) 上。对于其他部署，请跳过此部分。

## 添加提供商密钥

添加提供程序密钥需要该工作区中的 [permission to manage secrets](/langsmith/rbac#workspace-roles)。网关使用作为秘密存储在调用方 API 密钥所属工作区中的密钥来调用每个提供程序。在其 API 密钥发送这些请求的每个工作区中，为您将请求路由到的每个提供商添加一个密钥。对于这些调用，网关不会回退到组织机密。

如果您仅将请求路由到不需要提供程序密钥的[Gateway Credits](/langsmith/llm-gateway-credits)模型，请跳过此部分。

有关每个提供者使用的步骤和秘密名称，请参阅[Add a provider key](/langsmith/llm-gateway-provider-authentication#add-a-provider-key)。

## 授予调用网关的权限

API密钥需要`gateway:invoke`和`workspaces:read`权限才能调用网关。在没有工作区角色的计划中，每个用户都具有工作区管理员角色，其中包括两者，因此无需执行任何操作。

在企业计划中，内置的工作区编辑者和工作区查看者角色不包含这两种权限。作为[Organization Admin](/langsmith/rbac#organization-admin)，创建具有这两种权限的[custom role](/langsmith/rbac#custom-roles)，并将其分配给调用网关的用户，或为其分配工作区管理员角色。

有关更多信息，请参阅[Grant permission to call the gateway](/langsmith/llm-gateway-authentication#grant-permission-to-call-the-gateway)。

## 决定开发人员如何获取 API 密钥每个请求都使用工作区范围的 LangSmith API 密钥进行身份验证。开发人员可以创建自己的个人访问令牌（PAT）来承载他们的角色，或者模拟器为他们创建一个。对于共享代理或通过移动设备管理 (MDM) 在公司范围内部署，您可以改为创建服务密钥。

键类型还决定了“使用情况”选项卡如何对支出进行归因。使用个人访问令牌发出的请求计入用户，而使用服务密钥发出的请求仅计入密钥。如果您计划退还 LLM 费用，请在发放密钥之前参阅[Attribute spend for chargebacks](/langsmith/llm-gateway-monitoring#attribute-spend-for-chargebacks)。

有关键类型和范围，请参阅[Choose a key type](/langsmith/llm-gateway-authentication#choose-a-key-type)。有关编码代理的推出，请参阅[Set up coding agents](/langsmith/llm-gateway-coding-agents)。

## 可选：设置策略

创建策略需要 `organization:gateway:manage` 权限，组织管理员和组织操作员默认拥有该权限。在早于应用程序版本 0.18.9 的自托管 LangSmith（0.18.0-rc.22 之前的 Helm 图表版本）上，它需要 `organization:manage`。

使用 **LLM Gateway** 页面上的选项卡创建以下任何策略类型：* **[Spend limits](/langsmith/llm-gateway-spend-policies)**：组织、工作区、API 密钥或用户级​​别的硬上限。您的组织可能已在 **成本控制** 选项卡上设置了默认限制。
* **[Rate limits](/langsmith/llm-gateway-rate-limit-policies)**：时间窗口内的请求或令牌限制。
* **[Model access](/langsmith/llm-gateway-model-access-policies)**：用户可以调用哪些型号。
* **[Header-based policies](/langsmith/llm-gateway-header-policies)**：由自定义请求标头（例如客户、租户或成本中心标识符）限定的支出上限、速率限制和模型访问范围。
* **[Data policies](/langsmith/llm-gateway-data-policy)**：在 PII 和机密到达模型之前检测并编辑它们，并控制是否跟踪请求和响应主体。

在企业计划中，创建、更新和删除策略记录在[audit logs](/langsmith/audit-logs)中。

## 发送测试请求

要确认设置，请按照[Send your first LLM Gateway request](/langsmith/llm-gateway-first-request)操作。它从模拟器和代码发送请求，并显示其跟踪。与开发人员共享同一页面作为他们的入门指南。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-admin-setup.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。