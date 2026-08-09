<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith shared responsibility model | https://docs.langchain.com/langsmith/shared-responsibility-model -->

# LangSmith 共同责任模型

概述LangChain和客户如何分担LangSmith平台的安全责任。

LangSmith 作为多租户 SaaS 解决方案运营。我们的安全模型设计得很简单：LangChain 保护平台基础设施和应用程序，同时您保护您的特定使用、数据输入和您构建的人工智能代理。

## 责任矩阵

|域名 | LangChain责任（提供商）|客户责任（用户）|
| ：------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- || **基础设施** |我们管理底层云基础设施（通过 GCP），包括服务器、网络、操作系统补丁和容量规划。 GCP 拥有物理数据中心。 |不适用。您无需在 SaaS 环境中配置或维护计算资源。                                 |
| **应用** |我们保护 LangSmith 应用程序代码、API 端点和数据库集群，包括代码扫描和渗透测试。                                |您对使用我们的 SDK 构建的 AI 链和代理的安全负责。            |
| **数据** |我们使用 AES-256 强制执行租户隔离并加密静态数据，并使用 TLS 1.2 或更高版本加密传输中的数据。                                                      |您可以控制发送给我们的数据，并且必须在敏感 PII 离开您的环境之前通过 SDK 对其进行过滤。 |
| **身份** |我们提供护栏，包括 SSO/SCIM、MFA 实施选项和 RBAC 框架。                                                                    |您可以管理您的用户名册、分配角色（例如管理员与查看者）并撤销已离职员工的访问权限。  || **秘密** |我们安全地存储您委托给平台的秘密。                                                                                                      |您负责轮换您的 API 密钥并确保它们没有硬编码在您的应用程序中。        |

## LangChain职责（平台）

* 我们保持 SOC 2 Type II、GDPR 和 HIPAA 合规性，并接受年度第三方审核和渗透测试。
* 我们管理 Google Cloud Platform (GCP) 上的所有底层基础设施，包括网络防火墙、通过 Cloud Armor 进行的 DDoS 防护以及容器安全。
* 我们根据 SLA 维护高可用性，维护每日备份，并处理 LangSmith 服务的灾难恢复。
* 我们在严格的服务级别协议内修补已确认的平台漏洞，严重程度的问题在不到 2 周的时间内得到修复，高度严重的问题在 30 天内得到修复。
* 我们使用 AES-256 对所有静态客户数据进行加密，并使用 TLS 1.2 或更高版本对传输中的客户数据进行加密。

## 客户责任（使用）* 您必须强制执行最低权限访问，并立即删除离开组织的员工的访问权限。
* 您必须确保没有禁止的数据（例如 PCI DSS 持卡人数据）发送到平台，并使用 SDK 中的屏蔽功能从源头编辑 PII。
* 您对运行LangChain SDK的环境的安全负责，包括您的笔记本电脑和服务器。
* 您必须定期轮换 API 密钥，并确保它们存储在环境变量中，而不是硬编码在源代码中。

## 客户安全最佳实践

为了与我们的 SOC 2 Type II 框架中的安全假设保持一致，我们建议客户遵循以下内部准则：* 在您的租户设置中维护最新的技术和安全联系方式，以便我们的团队在发生事件时能够与您联系。
* 如果您怀疑遭到泄露，请立即通过自助门户循环使用您的密钥。如果您有疑问或需要针对漏洞的帮助，您可以随时联系LangChain安全团队。
* 为您的特定应用程序制定灾难恢复计划，以处理 LangSmith 服务可能不可用的情况。
* 确保用于访问 LangSmith UI 的工作站和端点定期修补和保护。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/shared-responsibility-model.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>