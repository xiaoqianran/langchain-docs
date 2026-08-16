<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted LangSmith on GCP | https://docs.langchain.com/langsmith/gcp-self-hosted -->

# 在 GCP 上自托管 LangSmith

当在[Google Cloud Platform (GCP)](https://cloud.google.com/)上运行LangSmith时，[self-hosted](/langsmith/self-hosted)模式会部署一个完整的具有可观察性功能的LangSmith平台。

此页面提供：

- [Initial setup steps](#initial-setup) 用于部署到 GKE、配置托管服务和设置身份验证。
- [GCP-specific architecture patterns](#reference-architecture) 和参考图。
- [Service recommendations](#compute-options) 和最佳实践。
- [Google Cloud Well-Architected best practices](#google-cloud-well-architected-best-practices) 实现卓越运营、安全性和可靠性。

<Note>
LangChain 发布生产就绪的 [Terraform modules for GCP](https://github.com/langchain-ai/terraform/tree/main/modules/gcp)，可在单个工作流程中配置 GKE、Cloud SQL、Memorystore、Cloud Storage 和网络。从 [Deploy with Terraform overview](/langsmith/self-host-terraform) 开始，在 Terraform 和仅 Helm 路径之间进行选择。
</Note>

## 初始设置

<Steps>
  <Step title="Deploy to Kubernetes">
    遵循[Kubernetes installation guide](/langsmith/kubernetes)。 LangSmith 在 Google Kubernetes Engine (GKE) 上进行了测试。

    **GKE 特定说明：**
    - LangSmith 适用于标准 GKE 集群
    - 使用GCE持久磁盘存储类
  </Step>

  <Step title="Configure external services">
    对于生产部署，请连接到 GCP 托管服务：

    <CardGroup cols={2}>
      <Card title="Google Cloud Storage" icon="database" href="/langsmith/self-host-blob-storage#google-cloud-storage">
        将跟踪数据存储在 GCS 中
      </Card>
      <Card title="Cloud SQL" icon="database" href="/langsmith/self-host-external-postgres#google-cloud-sql">
        PostgreSQL数据库
      </Card>
      <Card title="Memorystore" icon="cpu" href="/langsmith/self-host-external-redis#google-cloud-memorystore">
        Redis 或 Valkey 用于缓存
      </Card>
      <Card title="ClickHouse Cloud" icon="chart-line" href="/langsmith/self-host-external-clickhouse">
        分析数据库
      </Card>
    </CardGroup>
  </Step><Step title="Set up authentication">
    使用 [Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) 向 GCP 服务验证 LangSmith Pod。

    **关键页面：**
    - [GCS HMAC key authentication](/langsmith/self-host-blob-storage#google-cloud-storage)
    - [Cloud SQL IAM authentication](/langsmith/self-host-external-postgres#iam-authentication)
    - [Memorystore IAM authentication](/langsmith/self-host-external-redis#iam-authentication)
  </Step>
</Steps>

完成这些初始设置步骤后，您可以查看下面的完整 GCP 架构和最佳实践。

## 参考架构

我们建议利用 GCP 的托管服务来提供可扩展、安全且有弹性的平台。以下架构适用于自托管和混合，并与 [Google Cloud Well-Architected Framework](https://docs.cloud.google.com/architecture/framework) 保持一致：

![Architecture diagram showing GCP relations to LangSmith services](/langsmith/images/gcp-architecture-self-hosted.png)- <Icon icon="globe" /> **入口和网络**：请求通过 [Cloud Load Balancing](https://cloud.google.com/load-balancing) 在 [VPC](https://cloud.google.com/vpc) 内输入，使用基于 [Cloud Armor](https://cloud.google.com/armor) 和 [IAM](https://cloud.google.com/iam) 的身份验证进行保护。
- <Icon icon="cube" /> **前端和后端服务：** 容器在 [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine) 上运行，在负载均衡器后面进行编排。根据需要将请求路由到集群内的其他服务。
- <Icon icon="database" /> **存储和数据库：**
  - [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)：已部署代理的元数据、项目、用户以及短期和长期内存。 LangSmith 支持 PostgreSQL 版本 14 或更高版本。
  - [Memorystore](https://cloud.google.com/memorystore)（[Redis](https://cloud.google.com/memorystore/docs/redis) 或 [Valkey](https://cloud.google.com/memorystore/docs/valkey)）：缓存和作业队列。 Memorystore可以是单实例或集群模式。 LangSmith 需要 Redis OSS 版本 5 或更高版本，或 Valkey 8。
  - ClickHouse + [Persistent Disks](https://cloud.google.com/compute/docs/disks)：分析和跟踪存储。
    - 我们建议使用[externally managed ClickHouse solution](/langsmith/self-host-external-clickhouse)，除非出于安全或合规原因
    阻止你这样做。
    - 混合部署不需要 ClickHouse。
  - [Cloud Storage](https://cloud.google.com/storage)：用于跟踪工件和遥测的对象存储。

- <Icon icon="sparkles" /> **LLM 集成：** 可选择将请求代理到 [Vertex AI](https://cloud.google.com/vertex-ai) 以进行 LLM 推理。
- <Icon icon="chart-line" /> **监控和可观察性：** 与 [Cloud Monitoring](https://cloud.google.com/monitoring) 和 [Cloud Logging](https://cloud.google.com/logging) 集成


## 计算选项

LangSmith 根据您的要求支持多种计算选项：|计算选项 |描述 |适合 |
|-----------------|-------------|--------------|
| **Google Kubernetes Engine（首选）** |高级扩展和多租户支持 |大型企业|
| **基于计算引擎** |完全控制，BYO-infra |受监管或气隙环境 |

## Google 云架构完善的最佳实践

本参考旨在与 Google Cloud 架构完善框架的六大支柱保持一致：

### 卓越运营

- 使用 IaC ([Terraform](https://www.terraform.io/) / [Deployment Manager](https://cloud.google.com/deployment-manager)) 自动化部署。
- 使用[Secret Manager](https://cloud.google.com/secret-manager)进行配置和敏感数据。
- 将您的 LangSmith 实例配置为 [export telemetry data](/langsmith/export-backend) 并通过 [Cloud Logging](https://cloud.google.com/logging) 持续监控。
- 管理[LangSmith deployments](/langsmith/deployment)的首选方法是创建一个CI进程来构建[Agent Server](/langsmith/agent-server)图像并将其推送到[Artifact Registry](https://cloud.google.com/artifact-registry)。在 PR 合并时将新修订部署到暂存或生产之前，为拉取请求创建测试部署。

＃＃＃ 安全- 使用具有最低权限策略的 [IAM](https://cloud.google.com/iam) 角色和 [Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) 进行安全的 Pod 到 GCP 服务身份验证。
- 启用静态加密（[Cloud SQL](https://docs.cloud.google.com/sql/docs/postgres/cmek)、[Cloud Storage](https://cloud.google.com/storage/docs/encryption)、持久磁盘）和传输中加密 (TLS 1.2+)。
- 与[Secret Manager](https://cloud.google.com/secret-manager)集成以获得凭证。
- 使用 [Identity Platform](https://cloud.google.com/identity-platform) 或 [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) 作为 IDP 与 LangSmith 的内置身份验证和授权功能结合使用，以保护对代理及其工具的访问。

### 可靠性

- 跨地域复制LangSmith[data plane](/langsmith/data-plane)：将相同的数据平面部署到不同地域的Kubernetes集群上，进行LangSmith部署。跨多个可用区部署[Cloud SQL](https://cloud.google.com/sql/docs/postgres/high-availability)和[GKE](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/configuration-overview)服务。
- 使用 [Horizontal Pod Autoscaler](https://cloud.google.com/kubernetes-engine/docs/concepts/horizontalpodautoscaler) 和 [Cluster Autoscaler](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler) 为后端工作人员实施 [autoscaling](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)。
- 使用[Cloud DNS](https://cloud.google.com/dns)健康检查和故障转移策略。

### 性能优化

- 利用 [Compute Engine](https://cloud.google.com/compute) 实例通过 [machine type selection](https://cloud.google.com/compute/docs/machine-types) 优化计算。
- 将 [Cloud Storage lifecycle policies](https://cloud.google.com/storage/docs/lifecycle) 用于不经常访问的跟踪数据，移动到 [Nearline](https://cloud.google.com/storage/docs/storage-classes#nearline) 或 [Coldline](https://cloud.google.com/storage/docs/storage-classes#coldline) 存储类。

### 成本优化

- 使用[Committed Use Discounts](https://cloud.google.com/compute/docs/instances/signing-up-committed-use-discounts)和[Sustained Use Discounts](https://cloud.google.com/compute/docs/sustained-use-discounts)调整[GKE](https://cloud.google.com/kubernetes-engine)集群的大小。
- 使用 [Cloud Billing](https://cloud.google.com/billing/docs) 仪表板和 [Cost Management](https://cloud.google.com/cost-management) 工具监控成本 KPI。

### 可持续性- 通过按需计算和[autoscaling](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)最大限度地减少空闲工作负载。
- 使用 [Cloud Storage lifecycle policies](https://cloud.google.com/storage/docs/lifecycle) 将遥测数据存储在低延迟、低成本的层中。
- 使用 [scheduled actions](https://cloud.google.com/compute/docs/instances/schedule-instance-start-stop) 为非生产环境启用自动关闭。

## 安全性和合规性

LangSmith 可配置为：

- 仅[Private Service Connect](https://cloud.google.com/vpc/docs/private-service-connect) 访问（除了计费所需的出口外，没有公共互联网暴露）。
- 适用于 Cloud Storage、Cloud SQL 和持久磁盘的基于[Cloud KMS](https://cloud.google.com/kms) 的加密密钥。
- 审计日志记录到[Cloud Logging](https://cloud.google.com/logging)和[Cloud Audit Logs](https://cloud.google.com/logging/docs/audit)。

客户可以根据需要在[Assured Workloads](https://cloud.google.com/assured-workloads)区域进行部署，以符合 ISO、HIPAA 或其他监管要求。

## 监控和评估

使用 LangSmith 可以：

- 从 [Vertex AI](https://cloud.google.com/vertex-ai) 上运行的 LLM 应用程序捕获跟踪。
- 通过[LangSmith datasets](/langsmith/manage-datasets)评估模型输出。
- 跟踪延迟、令牌使用情况和成功率。

集成：

- [Cloud Monitoring](https://cloud.google.com/monitoring) 仪表板。
- [OpenTelemetry](https://opentelemetry.io/) 和 [Prometheus](https://prometheus.io/) 出口商。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/gcp-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>