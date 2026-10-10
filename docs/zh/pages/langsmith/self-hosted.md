<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted LangSmith | https://docs.langchain.com/langsmith/self-hosted -->

# 自托管LangSmith

在您自己的 Kubernetes 集群中运行 LangSmith，默认启用 Insights 和 Chat，以及沙盒、引擎、队列、LLM 网关和 LangSmith 部署等可选功能。

<Note>
  自托管 LangSmith 是企业计划的附加组件，专为 LangChain 最大、最具安全意识的客户而设计。更多详情请参考[Pricing](https://www.langchain.com/pricing)。 [Contact our sales team](https://www.langchain.com/contact-sales) 如果您想要许可证密钥在您的环境中试用LangSmith。
</Note>

自托管 LangSmith 在您自己的基础设施中运行 LangSmith 平台，以便跟踪和操作数据保留在您的环境中。基本安装包括 [observability](/langsmith/observability)、[evaluation](/langsmith/evaluation)、[prompt engineering](/langsmith/prompt-context-hub#prompts)、[Insights](/langsmith/insights) 和 [Chat](/langsmith/chat)。当您的用例需要时，您可以添加 [Sandboxes](/langsmith/sandboxes)、[Engine](/langsmith/engine-overview)、[Fleet](/langsmith/fleet/index)、[LLM Gateway](/langsmith/llm-gateway) 和 [LangSmith Deployment](/langsmith/deployment)。

＃＃ 特征|特色 |可用性 |需要什么设置 |
| - | - | - |
|可观察性、评估和及时工程 |包含 | [base installation](/langsmith/kubernetes)。 |
| [Insights](/langsmith/insights) 和 [Chat](/langsmith/chat)（以前称为 Polly）|在 Helm Chart 0.15.1 或更高版本中默认启用 |每个功能和模型访问一个加密密钥。参见[Configure Insights and Chat](/langsmith/self-host-insights-chat)。 |
| [Sandboxes](/langsmith/enable-self-hosted-sandboxes) |可选| EKS、GKE 或 AKS 上支持 KVM 的节点和 JuiceFS 存储。 |
| [Engine](/langsmith/engine-self-hosted) |可选|沙盒、具有引擎权利的许可证以及 Helm 图表版本 0.16.0 或更高版本。气隙安装需要 Helm Chart 0.17.0 或更高版本。 |
| [Fleet](/langsmith/enable-self-hosted-fleet) |可选|集群中的队列服务。不需要LangSmith部署。 |
| [LLM Gateway](/langsmith/llm-gateway-self-hosted) |可选（测试版）| Helm 图表版本 0.17.1 或更高版本。 `agent-gateway` 服务需要访问 PostgreSQL、Redis 和其他 LangSmith Pod。 |
| [LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform) |可选| KEDA、入口、控制平面和数据平面。要在没有控制平面的情况下运行代理服务器，请参阅[standalone servers](/langsmith/deploy-standalone-server)。 |

## 架构

自托管 LangSmith 实例运行一组由多个存储服务支持的应用程序服务。

<img alt="LangSmith architecture showing services and datastores" />

<img alt="LangSmith architecture showing services and datastores" />要访问 LangSmith UI 并发送 API 请求，请公开 [LangSmith frontend](#services) 服务。根据您的安装方法，这可以是负载平衡器或主机上公开的端口。

有关每个云提供商的架构模式和最佳实践，请参阅 [AWS](/langsmith/aws-self-hosted)、[GCP](/langsmith/gcp-self-hosted) 和 [Azure](/langsmith/azure-self-hosted) 指南。

### 服务

|服务 |描述 |
| - | - |
|  **LangSmith前端** |前端使用 Nginx 为 LangSmith UI 提供服务，并将 API 请求路由到其他服务器。它作为应用程序的入口点，并且是唯一必须向用户公开的组件。 |
|  **LangSmith后端** |后端是 CRUD API 请求的主要入口点，并处理应用程序的大部分业务逻辑。这包括处理来自前端和 SDK 的请求、准备摄取跟踪以及支持集线器 API。 ||  **LangSmith队列** |队列处理传入的跟踪和反馈，以确保它们被异步摄取并持久保存到跟踪和反馈数据存储中，处理数据完整性检查并确保成功插入到数据存储中，处理数据库错误或暂时无法连接到数据库等情况下的重试。 |
|  **LangSmith平台后端** |平台后端是另一个关键服务，主要处理身份验证、运行摄取和其他大容量任务。 |
|  **LangSmith 游乐场** | Playground 是一项处理转发请求到各种 LLM API 以支持 Playground 功能的服务。这也可用于连接到您自己的自定义模型服务器。 |
|  **LangSmith ACE（任意代码执行）后端** | ACE 后端是一种在安全环境中处理执行任意代码的服务。这用于支持在LangSmith内运行自定义代码。 |

### 存储服务

<Note>
  LangSmith 默认捆绑所有存储服务。您可以将其配置为使用所有存储服务的外部版本。对于生产，请使用外部存储服务。
</Note>|服务 |描述 |
| - | - |
|  **点击屋** | [ClickHouse](https://clickhouse.com/docs/en/intro)是一个高性能、面向列的SQL数据库管理系统（DBMS），用于在线分析处理（OLAP）。<br /><br />LangSmith使用ClickHouse作为跟踪和反馈（大容量数据）的主要数据存储。<br /><br />💡[Connect to external ClickHouse](/langsmith/self-host-external-clickhouse) |
|  **史密斯数据库** | SmithDB 是为代理跟踪数据构建的可选列式数据存储：深度嵌套的跨度、多模式内容以及保持打开状态数小时的跨度。<br /><br />SmithDB 在 LangSmith 0.17 及更高版本上可用。<br /><br />💡 [Enable SmithDB](/langsmith/self-host-smithdb) |
|  **PostgreSQL** | [PostgreSQL](https://www.postgresql.org/about/) 是一个功能强大的开源对象关系数据库系统，它使用和扩展了 SQL 语言，并结合了许多功能，可以安全地存储和扩展最复杂的数据工作负载。<br /><br />LangSmith 使用 PostgreSQL 作为事务工作负载和操作数据的主要数据存储（除了跟踪和操作数据之外的几乎所有内容）。反馈）。<br /><br />💡[Connect to external PostgreSQL](/langsmith/self-host-external-postgres) - AWS RDS、GCP Cloud SQL、Azure 数据库 ||  **Redis / Valkey** | [Redis](https://github.com/redis/redis) 是一个强大的内存键值数据库，可持久保存在磁盘上。通过将数据保存在内存中，Redis 为缓存等操作提供了高性能。<br /><br />LangSmith 使用 Redis 来支持队列和缓存操作。 [Valkey](https://valkey.io/) 也得到官方支持，可作为 Redis 的直接替代品。<br /><br />💡 [Connect to external Redis or Valkey](/langsmith/self-host-external-redis) - AWS ElastiCache、GCP Memorystore、Azure Cache |
|  **Blob 存储** | LangSmith 支持多个 Blob 存储提供程序，包括 [AWS S3](https://aws.amazon.com/s3/)、[Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) 和 [Google Cloud Storage](https://cloud.google.com/storage)。<br /><br />LangSmith 使用 Blob 存储来存储大型文件，例如跟踪工件、反馈附件和其他大型数据对象。 Blob 存储是可选的，但强烈建议用于生产部署。<br /><br />💡[Enable blob storage](/langsmith/self-host-blob-storage) - AWS S3、GCP GCS、Azure Blob |

## 安装步骤

此页面是概述。安装本身发生在[Kubernetes installation guide](/langsmith/kubernetes)中，可选功能有自己的安装指南。

要从此页面转到正在运行的实例：<Steps>
  <Step title="Install the base platform">
    从头到尾遵循[Self-host LangSmith on Kubernetes](/langsmith/kubernetes)。它涵盖先决条件、Helm 配置、Insights 和 Chat 加密密钥、部署和验证。完成后，您将拥有一个正在运行的 LangSmith 实例，具有可观察性、评估、提示工程、见解和聊天功能。

    在开始之前，请先查看[minimum versions for self-hosting dependencies](/langsmith/self-host-dependency-versions)。要一起配置集群、数据存储和 Helm 版本，请使用 [Deploy with Terraform](/langsmith/self-host-terraform) 而不是仅 Helm 指南。
  </Step>

  <Step title="(Optional) Add features">
    基础平台运行后，从 [Features](#features) 表中启用您的用例所需的可选功能。参见[Configure additional self-hosted features](/langsmith/self-host-additional-features)。如果基本安装涵盖您的用例，请跳过此步骤。
  </Step>
</Steps>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>