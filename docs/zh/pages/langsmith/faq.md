<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Frequently asked questions | https://docs.langchain.com/langsmith/faq -->

## 可观察性

### *我无法在 UI 中创建 API 密钥或管理用户，出了什么问题？*

* 您可能在未设置 SSO 的情况下部署了 LangSmith。 LangSmith 需要 SSO 来管理用户和 API 密钥。您可以在 [configuration section.](/langsmith/self-host-sso) 中找到有关设置 SSO 的更多信息

### *负载平衡/入口如何工作*？

* 您将需要向您的应用程序/用户公开前端容器/服务。这将处理到所有下游服务的路由。
* 您需要在入口级别终止 SSL。我们建议使用 AWS ALB、GCP 负载均衡器或 Nginx 等托管服务。

### *我们如何对应用程序进行身份验证？*

* 目前，我们的自托管解决方案支持使用 OAuth2.0 的 SSO 和 OIDC 作为身份验证解决方案。请注意，我们确实提供了无身份验证解决方案，但强烈建议在投入生产之前设置 oauth。

您可以在 [configuration section.](/langsmith/self-host-sso) 中找到有关设置 SSO 的更多信息

### *我可以使用外部存储服务吗？*

* 您可以将 LangSmith 配置为使用所有存储服务的外部版本。在生产环境中，我们强烈建议使用外部存储服务。查看[configuration section](/langsmith/self-hosted)了解更多信息。### *我的应用程序需要出口才能正常运行吗？*

我们的部署仅需要出口来处理一些事情（其中大部分可以驻留在您的 VPC 内）：

* 获取图像（如果镜像图像，可能不需要）

* 与任何LLM端点交谈

* 与您可能配置的任何外部存储服务对话

* 获取OAuth信息

* 订阅指标和操作元数据（如果不在离线模式下运行）

  * 需要出口至`https://beacon.langchain.com`
  * 更多信息请参见[Egress](/langsmith/self-host-egress)

您的 VPC 可以设置规则来限制任何其他访问。注意：我们要求允许将 `X-Organization-Id` 和 `X-Tenant-Id` 标头传递到后端服务。这些用于确定请求针对哪个组织和工作区（以前称为“租户”）。

### *应用程序的资源要求？*

* 在 kubernetes 中，我们推荐最低 Helm 配置，您可以在 [medium size example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/medium_size.yaml) 中看到。对于 docker，我们建议至少 16GB RAM 和 4 个 CPU。
* 对于 Postgres，我们建议至少使用 8GB RAM 和 2 个 CPU。
* 对于 Redis，我们建议 4GB RAM 和 2 个 CPU。
* 对于 Clickhouse，我们建议 32GB RAM 和 8 个 CPU。

### SAML SSO 常见问题解答#### *如何更改 SAML SSO 用户的电子邮件地址？*

一些身份提供商通过电子邮件更改保留原始 `User ID`，而其他身份提供商则不这样做，因此我们建议您按照以下步骤操作以避免 LangSmith 中的重复用户：

1. 从组织中删除用户（参见[manage users](/langsmith/set-up-hierarchy#manage-users)）
2. 更改 IdP 中的电子邮件地址
3. 让他们通过 SAML SSO 再次登录 LangSmith - 这将使用新电子邮件地址触发通常的 [JIT provisioning](/langsmith/user-management#just-in-time-jit-provisioning) 流程

对于具有多种链接登录方法的用户，当前不支持通过 SCIM 或其他方式更改电子邮件地址。显示此错误消息：`email update not supported with linked login methods`。例如，如果用户之前通过电子邮件/密码或 Google 社交登录登录，然后通过 SSO 添加相同的电子邮件地址，则不支持更改其电子邮件地址。这适用于自托管和云。

#### *我可以更改身份提供商吗？*

通过我们的门户网站[https://support.langchain.com](https://support.langchain.com)联系LangChain支持团队以获得迁移支持。

#### *如何修复“405 方法不允许”？*

确保您使用正确的 ACS URL：[https://auth.langchain.com/auth/v1/sso/saml/acs](https://auth.langchain.com/auth/v1/sso/saml/acs)

### SCIM 常见问题解答

#### *我可以在没有 SAML SSO 的情况下使用 SCIM 吗？** **云**：否，云部署中的 SCIM 需要 SAML SSO
* **自托管**：是的，SCIM 与具有客户端密钥身份验证模式的 OAuth 配合使用

#### *如果我同时启用 JIT 配置和 SCIM 会发生什么？*

JIT 配置和 SCIM 可能会相互冲突。我们建议在启用 SCIM 之前禁用 JIT 配置，以确保一致的用户配置行为。

#### *如何更改用户的角色或工作区访问权限？*

更新用户在 IdP 中的组成员身份。更改将根据[role precedence rules](/langsmith/user-management#role-precedence)同步到LangSmith。

#### *当用户从所有组中删除时会发生什么？*

将根据您的 IdP 取消配置设置从您的 LangSmith 组织中取消配置该用户。

#### *我可以使用自定义组名称吗？*

是的。如果您的身份提供商支持将备用字段同步到 `displayName` 组属性，您可以使用备用属性（如 `description`）作为 LangSmith 中的 `displayName`，并保留身份提供商组名称的完全可自定义性。否则，组必须遵循 [Group Naming Convention](/langsmith/user-management#group-naming-convention) 部分中描述的特定命名约定，才能正确映射到 LangSmith 角色和工作区。您还可以使用 [configure a custom separator](/langsmith/user-management#configure-custom-separator)（例如，`-`、`_`、`&`）代替默认冒号 (`:`)，以适应对组名称字符有限制的身份提供者。

#### *为什么我的 Okta 集成不起作用？*

请参阅此处 Okta 的故障排除指南：[https://help.okta.com/en-us/content/topics/users-groups-profiles/usgp-group-push-troubleshoot.htm](https://help.okta.com/en-us/content/topics/users-groups-profiles/usgp-group-push-troubleshoot.htm)。

### *支持降级吗？*

官方不支持降级。 LangSmith 升级可能包括数据库迁移和其他不向后兼容的更改。如果您需要回退到之前的版本，请通过[Support Portal](https://support.langchain.com)联系技术支持指导。

## 部署

### 使用 LangGraph 需要先使用 LangChain 吗？有什么区别？

不会。LangGraph是一个复杂代理系统的编排框架，比LangChain代理更底层、更可控。 LangChain 提供了与模型和其他组件交互的标准接口，对于直接的链和检索流程很有用。

### LangGraph 与其他代理框架有何不同？其他代理框架可以用于简单的通用任务，但无法满足公司需求定制的复杂任务。 LangGraph 提供了一个更具表现力的框架来处理公司的独特任务，而不会将用户限制在单一的黑盒认知架构中。

### LangGraph 会影响我的应用程序的性能吗？

LangGraph 不会给您的代码增加任何开销，并且是专为流式工作流程而设计的。

### LangGraph 开源吗？免费吗？

是的。 LangGraph 是 MIT 许可的开源库，可以免费使用。

### LangGraph 和 LangSmith 有什么不同？

LangGraph 是一个有状态的编排框架，可为代理工作流程带来更多控制。 LangSmith 是一项用于部署和扩展代理应用程序的服务，具有用于构建代理 UX 的固定 API 以及集成的开发人员 UI。|特点| LangGraph（开源）|兰史密斯|
| ------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
|描述 |代理应用程序的状态编排框架|用于部署 LangGraph 应用程序的可扩展基础设施 |
| SDK | Python 和 JavaScript | Python 和 JavaScript |
| HTTP API |无 |是 - 对于检索和更新状态或长期记忆，或创建可配置的助手很有用 |
|流媒体 |基本 |逐个令牌消息的专用模式 ||检查点|社区贡献 |开箱即用的支持 |
|持久层|自我管理|具有高效存储的托管 Postgres |
|部署|自我管理| • 云<br /> • 免费自托管<br /> • 企业（付费自托管） |
|可扩展性|自我管理|任务队列和服务器的自动扩展|
|容错|自我管理|自动重试 |
|并发控制|简单的线程 |支持双短信 ||日程安排|无 | Cron 调度 |
|监控|无 |与 LangSmith 集成以实现可观察性 |
| IDE集成|工作室 |工作室 |

### LangSmith 是开源的吗？

不。LangSmith 是专有软件。

欲了解更多信息，请参阅我们的[LangSmith pricing page](https://www.langchain.com/pricing)。

### LangGraph 是否可以与不支持工具调用的法学硕士一起使用？

是的！您可以将 LangGraph 与任何法学硕士一起使用。我们使用支持工具调用的 LLM 的主要原因是，这通常是让 LLM 决定要做什么的最方便的方式。如果您的 LLM 不支持工具调用，您仍然可以使用它 - 您只需要编写一些逻辑即可将原始 LLM 字符串响应转换为关于要做什么的决定。

### LangGraph 可以与 OSS LLM 一起使用吗？是的！ LangGraph 与法学硕士的幕后用途完全矛盾。我们在大多数教程中使用封闭式 LLM 的主要原因是它们无缝支持工具调用，而 OSS LLM 通常不支持。但工具调用不是必需的（参见[Does LangGraph work with LLMs that don't support tool calling?](#does-langgraph-work-with-llms-that-dont-support-tool-calling)），因此您完全可以将 LangGraph 与 OSS LLM 一起使用。

### 我可以在不登录 LangSmith 的情况下使用 Studio 吗？

是的！您可以使用[development version of Agent Server](/langsmith/local-dev-testing)在本地运行后端。
这将连接到作为 LangSmith 一部分托管的 Studio 前端。
如果您设置环境变量`LANGSMITH_TRACING=false`，则不会将任何跟踪发送到 LangSmith。

### 什么是部署运行？

部署运行是对通过 LangSmith 部署部署的 LangGraph 代理的一次端到端调用。节点和子图不单独计费。对其他 LangGraph 代理的调用（通过 RemoteGraph 或 LangGraph SDK 或直接 API）将根据托管被调用代理的部署单独收费。人机交互中断在恢复时会创建单独的部署运行。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/faq.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>