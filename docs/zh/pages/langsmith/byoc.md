<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Bring Your Own Cloud (BYOC) | https://docs.langchain.com/langsmith/byoc -->

# 自带云 (BYOC)

在您自己的云环境中部署 LangSmith 服务并存储数据，同时 LangChain 运行、扩展和升级基础设施。

<Warning>
  BYOC 仅适用于 [Enterprise plan](https://www.langchain.com/pricing) 的客户。
</Warning>

自带云 (BYOC) 允许您在自己的云环境中部署 LangSmith 服务并存储数据，而 LangChain 则运行、扩展和升级基础设施。 BYOC 适合需要对其数据拥有完全主权，但又不想承担配置和管理基础设施开销的组织。

BYOC 使用责任分离模型：控制平面在 LangChain 的云中运行，数据平面完全在您的云环境中运行。

## 开始吧

部署LangSmith BYOC、[contact the LangChain sales team](https://www.langchain.com/contact-sales)。在LangChain团队为您的组织启用BYOC后，请按照[onboarding guide](/langsmith/byoc-onboarding)创建您的第一个数据平面。

## 区域和云提供商

BYOC 在 AWS 上全面可用 (GA)。计划于 2026 年下半年支持更多云提供商。

您可以在以下任何 AWS 区域部署 LangSmith BYOC：|面积 | AWS 区域 |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| **美国** | `us-east-1`、`us-east-2`、`us-west-1`、`us-west-2` |
| **欧盟** | `eu-central-1`、`eu-west-1`、`eu-west-2`、`eu-west-3`、`eu-north-1` |
| **亚太地区** | `ap-south-1`、`ap-northeast-1`、`ap-northeast-2`、`ap-northeast-3`、`ap-southeast-1`、`ap-southeast-2` |

无论您将数据平面放置在何处，控制平面都以 `us-east-2` 运行。如果您在欧盟或亚太地区配置数据平面，您的敏感应用程序数据将保留在该区域，而控制平面元数据将保留在美国：|控制平面（美国）|数据平面（您所在的地区）|
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
|用户、角色、计费、组织配置、SSO 配置、API 密钥 |跟踪、实验、数据集、见解运行、注释队列、工作区机密和所有其他敏感应用程序数据 |

## 可用功能

支持以下功能：* **[Observability](/langsmith/observability)**：跟踪、项目、仪表板和警报。
* **[Evaluation](/langsmith/evaluation)**：数据集、实验、评估器和注释队列。
* **[Insights](/langsmith/insights)**：自动分析表面使用模式、常见代理行为和故障模式的痕迹。
* **[LangSmith Chat](/langsmith/chat)**：从工作区内部分析跟踪、线程、提示和评估。
* **[Prompt engineering](/langsmith/prompt-context-hub#prompts)**：提示并提示提交。
* **[LangSmith Deployment](/langsmith/deployment)**：LangSmith 部署控制平面在数据平面的集群内部运行，因此代理管理层和代理都在您的 VPC 中运行。
* **[Sandboxes](/langsmith/sandboxes)**：通过 CLI 和 SDK 的使用与云相同，只是您指向数据平面的端点。
* **[LLM Gateway](/langsmith/llm-gateway)**：使用一个 LangSmith API 密钥跨提供商调用模型，并集中实施支出、速率限制和数据保护策略。
* **[LangSmith MCP](/langsmith/langsmith-remote-mcp)**：将MCP兼容的客户端连接到LangSmith查询数据。
* **[Fleet](/langsmith/fleet/index)**：从模板、连接器和通道构建并运行无代码代理。
* **[SmithDB](/langsmith/smithdb-sdk-migration)**：专门构建的跟踪数据可观察性后端，持久保存到您帐户中的 S3。

以下功能已计划但尚未支持：* **[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)**：LangChain托管的深度代理，具有连接器、通道和时间表。
* **[LLM auth proxy](/langsmith/llm-auth-proxy-self-hosted)**：对模型调用强制执行您自己的身份验证流程，以便提供程序凭据永远不会暴露给最终用户。
* **[Engine](/langsmith/engine-overview)**：自动检测、诊断和解决生产跟踪中发现的重复出现的问题。

## 先决条件

在 LangChain 可以配置数据平面之前，您需要满足以下条件：

* **AWS 上的 LangSmith 组织**：在 [aws.smith.langchain.com](https://aws.smith.langchain.com) 创建一个组织，然后将您的组织 ID 发送到 LangChain 团队以启用 BYOC。
* **AWS 账户**：LangChain 建议使用专用于 LangSmith BYOC 的新账户，但这不是必需的。
* **受支持的区域**：选择上面列出的 AWS 区域之一。
* **IAM 角色和外部 ID**：应用 [⟦T16⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 创建角色 LangChain 假定配置和管理您的数据平面。您必须使用此模块。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>