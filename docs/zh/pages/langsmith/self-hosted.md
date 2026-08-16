<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted LangSmith | https://docs.langchain.com/langsmith/self-hosted -->

# 自托管LangSmith

<Note>
**重要**<br></br>
自托管 LangSmith 是企业计划的附加组件，专为我们最大、最注重安全的客户而设计。更多详情请参考[Pricing](https://www.langchain.com/pricing)。 [Contact our sales team](https://www.langchain.com/contact-sales) 如果您想获得许可证密钥以在您的环境中试用LangSmith。
</Note>

在您自己的基础设施中为 [observability](/langsmith/observability)、[evaluation](/langsmith/evaluation) 和 [prompt engineering](/langsmith/prompt-context-hub#prompts) 托管 LangSmith 实例。您可以选择启用 [LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform) 通过 LangSmith UI 部署和管理代理。

<Tip>
**有关 AWS、GCP 或 Azure 上自托管 LangSmith 的分步设置说明，请参阅我们的云架构指南：[AWS](/langsmith/aws-self-hosted)、[GCP](/langsmith/gcp-self-hosted) 或 [Azure](/langsmith/azure-self-hosted)。
</Tip>

<Note>
在安装或升级之前，请查看[minimum versions for self-hosting dependencies](/langsmith/self-host-dependency-versions)。
</Note>

<a id="langsmith"></a>

## 包含什么

自托管 LangSmith 实例包括：

**服务：**
- LangSmith前端UI
- LangSmith后端API
- LangSmith 平台后端
- LangSmith 游乐场
- LangSmith队列
- LangSmith ACE（任意代码执行）后端

**存储服务：**
- ClickHouse（痕迹和反馈数据）
- PostgreSQL（操作数据）
- Redis（排队和缓存）
- Blob 存储（可选，但建议用于生产）

<img
    className="block dark:hidden"
    src="/langsmith/images/cloud-arch-light.png"
    alt="LangSmith architecture showing services and datastores"
/>

<img
    className="hidden dark:block"
    src="/langsmith/images/cloud-arch-dark.png"
    alt="LangSmith architecture showing services and datastores"
/>要访问 LangSmith UI 并发送 API 请求，您需要公开 [LangSmith frontend](#services) 服务。根据您的安装方法，这可以是负载平衡器或主机上公开的端口。

### 服务

|服务 |描述 |
|---------|-------------|
| <a id="langsmith-frontend"></a> **LangSmith 前端** |前端使用 Nginx 来服务 LangSmith UI 并将 API 请求路由到其他服务器。它充当应用程序的入口点，并且是唯一必须向用户公开的组件。 |
| <a id="langsmith-backend"></a> **LangSmith 后端** |后端是 CRUD API 请求的主要入口点，并处理应用程序的大部分业务逻辑。这包括处理来自前端和 SDK 的请求、准备摄取跟踪以及支持集线器 API。 |
| <a id="langsmith-queue"></a> **LangSmith 队列** |队列处理传入的跟踪和反馈，以确保它们被异步摄取并持久保存到跟踪和反馈数据存储中，处理数据完整性检查并确保成功插入到数据存储中，处理数据库错误或暂时无法连接到数据库等情况下的重试。 || <a id="langsmith-platform-backend"></a> **LangSmith 平台后端** |平台后端是另一个关键服务，主要处理身份验证、运行摄取和其他大容量任务。 |
| <a id="langsmith-playground"></a> **LangSmith 游乐场** | Playground 是一项处理转发请求到各种 LLM API 以支持 Playground 功能的服务。这也可用于连接到您自己的自定义模型服务器。 |
| <a id="langsmith-ace-arbitrary-code-execution-backend"></a> **LangSmith ACE（任意代码执行）后端** | ACE 后端是一种在安全环境中处理执行任意代码的服务。这用于支持在 LangSmith 中运行自定义代码。 |

### 存储服务

<Note>
LangSmith默认捆绑所有存储服务。您可以将其配置为使用所有存储服务的外部版本。在生产环境中，我们**强烈建议使用外部存储服务**。
</Note>|服务 |描述 |
|---------|-------------|
| <a id="clickhouse"></a> **ClickHouse** | [ClickHouse](https://clickhouse.com/docs/en/intro)是一个高性能、面向列的SQL数据库管理系统（DBMS），用于在线分析处理（OLAP）。<br/><br/>LangSmith使用ClickHouse作为跟踪和反馈（大容量数据）的主要数据存储。<br/><br/>💡[Connect to external ClickHouse](/langsmith/self-host-external-clickhouse) |
| <a id="postgresql"></a> **PostgreSQL** | [PostgreSQL](https://www.postgresql.org/about/) 是一个功能强大的开源对象关系数据库系统，它使用和扩展了 SQL 语言，并结合了许多功能，可以安全地存储和扩展最复杂的数据工作负载。<br/><br/>LangSmith 使用 PostgreSQL 作为事务工作负载和操作数据的主要数据存储（几乎除了跟踪和数据之外的所有数据）反馈）。<br/><br/>💡[Connect to external PostgreSQL](/langsmith/self-host-external-postgres) - AWS RDS、GCP Cloud SQL、Azure 数据库 |
| <a id="redis"></a> **Redis / Valkey** | [Redis](https://github.com/redis/redis) 是一个强大的内存键值数据库，可持久保存在磁盘上。通过将数据保存在内存中，Redis 为缓存等操作提供了高性能。<br/><br/>LangSmith 使用 Redis 来支持队列和缓存操作。 [Valkey](https://valkey.io/) 也得到官方支持，可作为 Redis 的直接替代品。<br/><br/>💡 [Connect to external Redis or Valkey](/langsmith/self-host-external-redis) - AWS ElastiCache、GCP Memorystore、Azure Cache || <a id="blob-storage"></a> **Blob 存储** | LangSmith 支持多个 Blob 存储提供程序，包括 [AWS S3](https://aws.amazon.com/s3/)、[Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) 和 [Google Cloud Storage](https://cloud.google.com/storage)。<br/><br/>LangSmith 使用 Blob 存储来存储大型文件，例如跟踪工件、反馈附件和其他大型数据对象。 Blob 存储是可选的，但强烈建议用于生产部署。<br/><br/>💡[Enable blob storage](/langsmith/self-host-blob-storage) - AWS S3、GCP GCS、Azure Blob |

要安装，请遵循[Kubernetes setup guide](/langsmith/kubernetes)。

## 后续步骤

- **[Enable LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform)**：添加[control plane](/langsmith/control-plane)和[data plane](/langsmith/data-plane)以通过LangSmith UI部署和管理代理。
- **[Enable LangSmith Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)**：允许用户运行代码、公开临时服务以及从自托管的LangSmith创建内存快照。
- **[Deploy standalone Agent Servers](/langsmith/deploy-standalone-server)**：直接部署代理服务器，无需启用LangSmith部署。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>