<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted LangSmith on Azure | https://docs.langchain.com/langsmith/azure-self-hosted -->

# Azure 上自托管 LangSmith

当在[Microsoft Azure](https://azure.microsoft.com/)上运行LangSmith时，[self-hosted](/langsmith/self-hosted)模式会部署一个完整的具有可观察性功能的LangSmith平台。

此页面提供：

* [Initial setup steps](#initial-setup) 用于部署到 AKS、配置托管服务和设置身份验证。
* [Azure-specific architecture patterns](#reference-architecture) 和参考图。
* [Compute and networking guidance](#compute-and-networking-on-azure) 和最佳实践。
* 针对 Azure 部署的[Security and access control](#security-and-access-control) 建议。

<Note>
  LangChain 发布了生产就绪的 [Terraform modules for Azure](https://github.com/langchain-ai/terraform/tree/main/modules/azure)，可在单个工作流程中配置 AKS、Azure Database for PostgreSQL、Azure 托管 Redis、Blob 存储和 Key Vault。从 [Deploy with Terraform overview](/langsmith/self-host-terraform) 开始，在 Terraform 和仅 Helm 路径之间进行选择。
</Note>

## 初始设置

<Steps>
  <Step title="Deploy to Kubernetes">
    沿[Kubernetes installation guide](/langsmith/kubernetes)行驶。 LangSmith 在 Azure Kubernetes 服务 (AKS) 上进行了测试。

    **AKS 特定说明：**

    * LangSmith 可与标准 AKS 集群配合使用
    * 使用 Azure 磁盘存储类作为持久卷
  </Step>

  <Step title="Configure external services">
    对于生产部署，请连接到 Azure 托管服务：

    <CardGroup>
      <Card title="Azure Blob Storage" icon="database" href="/langsmith/self-host-blob-storage#azure-blob-storage">
        将跟踪数据存储在 Azure Blob 中
      </Card>

      <Card title="Azure Database" icon="database" href="/langsmith/self-host-external-postgres#azure-database-for-postgresql">
        PostgreSQL数据库
      </Card>

      <Card title="Azure Cache" icon="cpu" href="/langsmith/self-host-external-redis#azure-cache-for-redis">
        Redis 用于缓存
      </Card><Card title="ClickHouse Cloud" icon="chart-line" href="/langsmith/self-host-external-clickhouse">
        分析数据库
      </Card>
    </CardGroup>
  </Step>

  <Step title="Set up authentication">
    使用 [Azure Workload Identity](https://azure.github.io/azure-workload-identity/docs/introduction.html) 对 Azure 服务的 LangSmith Pod 进行身份验证。

    **关键页面：**

    * [Azure Blob managed identity](/langsmith/self-host-blob-storage#azure-blob-storage)
    * [Azure Database Entra authentication](/langsmith/self-host-external-postgres#iam-authentication)
    * [Azure Cache Entra authentication](/langsmith/self-host-external-redis#iam-authentication)
  </Step>
</Steps>

完成这些初始设置步骤后，您可以查看下面的完整 Azure 体系结构和最佳实践。

## 参考架构

我们建议使用 Azure 的托管服务来提供可扩展、安全且有弹性的平台。以下架构适用于自托管和混合部署。|                            |组件|如何安装 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **LangSmith Helm 发布** |前端、后端、队列、平台后端、Playground、ACE 以及可选的 LangSmith 部署控制/数据平面 | [⟦T1⟧](https://github.com/langchain-ai/helm/tree/main/charts/langsmith) 图表中的一个`helm upgrade --install` |
| **您提供** | AKS、PostgreSQL、托管 Redis、Blob 存储、Key Vault、入口和 ClickHouse |安装 LangSmith 之前的 IaC 工具（Terraform、ARM 模板或 Azure 门户）|

<img alt="Architecture diagram showing Azure relations to LangSmith services" />

<img alt="Architecture diagram showing Azure relations to LangSmith services" />**安装顺序：**配置Azure基础设施→配置或订阅ClickHouse→配置Entra ID和Workload Identity→运行`helm upgrade --install`。 LangSmith Deployment、Fleet、Insights 和 Chat 是通过同一 Helm 版本启用的，而不是单独安装。

**合规性表面：** LangSmith 图表及其容器映像的一项应用程序审查，以及每个托管资源的标准 Azure 服务审查。 ClickHouse Cloud 添加了一项第三方 SaaS 评论。

* **客户端界面**：用户通过网络浏览器或LangChain SDK与LangSmith交互。所有流量都终止于 [Azure Load Balancer](https://azure.microsoft.com/en-us/products/load-balancer/) 并路由到 [AKS](https://azure.microsoft.com/en-us/products/kubernetes-service/) 集群中的前端 (NGINX)，然后在必要时路由到集群中的另一个服务。
* **存储服务**：平台需要持久存储痕迹、元数据和缓存。在 Azure 上推荐的服务是：
  * <Icon icon="database" /> **[Azure Database for PostgreSQL (Flexible Server)](https://azure.microsoft.com/en-us/products/postgresql/)** 用于事务数据（例如运行、项目）。 Azure 的高可用性选项在另一个区域中配置备用副本；数据同步提交到主服务器和备用服务器。 LangSmith 需要 PostgreSQL 版本 14 或更高版本。* <Icon icon="database" /> **[Azure Managed Redis](https://azure.microsoft.com/en-us/products/managed-redis/)** 用于队列和缓存。最佳实践包括存储小值并将大对象分解为多个键，使用管道来最大化吞吐量并确保客户端和服务器驻留在同一区域。您还可以使用[Azure Cache for Redis](https://azure.microsoft.com/en-us/products/cache)，以单实例或集群模式运行。 LangSmith 需要 Redis OSS 版本 5 或更高版本。
  * <Icon icon="chart-line" /> **ClickHouse** 用于大量跟踪分析。我们建议使用[externally managed ClickHouse solution](/langsmith/self-host-external-clickhouse)。如果出于安全或合规性原因，这不是一个选项，请使用开源 Operator 在 AKS 上部署 ClickHouse 集群。确保跨[availability zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview)进行复制以实现持久性。混合部署不需要 Clickhouse。
  * <Icon icon="cube" /> **[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs/)** 适用于大型工件。使用冗余存储配置，例如读取访问异地冗余 (RA-GRS) 或异地区域冗余 (RA-GZRS) 存储，并设计应用程序以在中断期间从次要区域进行读取。

## Azure 上的计算和网络

### Azure Kubernetes 服务 (AKS)

[AKS](https://azure.microsoft.com/en-us/products/kubernetes-service/) 是推荐用于生产部署的计算平台。本节概述了规划设置的关键注意事项。

#### 网络模型将 [Azure CNI](https://learn.microsoft.com/en-us/azure/aks/configure-azure-cni) 网络用于生产集群。此模型将集群集成到现有虚拟网络中，为每个 Pod 和节点分配 IP 地址，并允许直接连接到本地或其他 Azure 服务。确保子网有足够的 IP 用于节点和 Pod，避免地址范围重叠，并为横向扩展事件分配额外的 IP 空间。

#### 入口和负载平衡

使用 Kubernetes Ingress 资源和控制器来分发 HTTP/HTTPS 流量。入口控制器在第 7 层运行，可以根据 URL 路径路由流量并处理 TLS 终止。与第 4 层负载均衡器相比，它们减少了公共 IP 地址的数量。将 [application routing add-on](https://learn.microsoft.com/en-us/azure/aks/app-routing) 用于与 SSL 证书集成的 [Azure DNS](https://azure.microsoft.com/en-us/products/dns/) 和 [Key Vault](https://azure.microsoft.com/en-us/products/key-vault/) 的托管 NGINX 入口控制器。

#### Web 应用程序防火墙 (WAF)

为了针对攻击提供额外保护，请部署[WAF](https://learn.microsoft.com/en-us/azure/web-application-firewall/overview)，例如[Azure Application Gateway](https://azure.microsoft.com/en-us/products/application-gateway/)。 WAF 使用 OWASP 规则筛选流量，并可以在流量到达 AKS 群集之前终止 TLS。

#### 网络政策应用 [Kubernetes network policies](https://learn.microsoft.com/en-us/azure/aks/use-network-policies) 限制 Pod 到 Pod 的流量并减少受损工作负载的影响。创建集群时启用网络策略支持并基于应用程序连接设计规则。

#### 高可用性

跨 [availability zones](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview) 配置节点池，并为所有部署使用 Pod 中断预算 (PDB) 和多个副本。设置 pod 资源请求和限制； [AKS resource management best practices](https://learn.microsoft.com/en-us/azure/aks/developer-best-practices-resource-management) 建议设置 CPU 和内存限制，以防止 pod 消耗所有资源。使用[Cluster Autoscaler](https://learn.microsoft.com/en-us/azure/aks/cluster-autoscaler)和[Vertical Pod Autoscaler](https://learn.microsoft.com/en-us/azure/aks/vertical-pod-autoscaler)来扩展节点池并自动调整Pod资源。

### 网络和身份

#### 虚拟网络集成

将 AKS 部署到其自己的 [virtual network](https://azure.microsoft.com/en-us/products/virtual-network/) 中，并为集群、数据库、Redis 和存储端点创建单独的子网。使用 [Private Link](https://azure.microsoft.com/en-us/products/private-link/) 和 [service endpoints](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-service-endpoints-overview) 将流量保留在虚拟网络内并避免暴露于公共互联网。

#### 身份验证

将 LangSmith 与 [Microsoft Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id) (Azure AD) 集成以实现单点登录。使用 Azure AD OAuth2 作为不记名令牌并分配角色来控制对 UI 和 API 的访问。

## 存储和数据服务

### Azure PostgreSQL 数据库

#### 高可用性在高可用性模式下使用 [Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/overview)。 Azure 在同一可用区域（区域）或跨区域（区域冗余）内配置备用副本。数据同步提交到主备服务器，保证提交的数据不丢失。区域冗余配置将备用数据库放置在不同的区域中以防止区域中断，但可能会增加写入延迟。

#### 备份和灾难恢复

启用[automatic backups](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-backup-restore)并配置异地冗余备份存储以防止区域范围内的中断。对于关键应用程序，在次要区域中创建只读副本。

#### 缩放

选择与您的工作负载相匹配的合适 SKU；灵活的服务器允许独立扩展计算和存储。通过[Azure Monitor](https://azure.microsoft.com/en-us/products/monitor/)监控指标并配置警报。

### Azure 托管 Redis

#### 持久性和冗余

选择提供复制和持久性的层。配置 Redis 持久性或数据备份以实现持久性。为了获得高可用性，请根据层使用[active geo-replication](https://learn.microsoft.com/en-us/azure/redis/how-to-active-geo-replication)或区域冗余缓存。

### Azure 上的 ClickHouseClickHouse 用于分析工作负载（跟踪和反馈）。如果无法使用外部管理的解决方案，请使用 Helm 或官方运营商在 AKS 上部署 ClickHouse 集群。为了实现弹性，跨节点和可用区复制数据。考虑使用 [Azure Disks](https://azure.microsoft.com/en-us/products/storage/disks/) 进行本地存储并将它们挂载为 StatefulSet。

### Azure Blob 存储

#### 冗余

根据您的恢复目标选择冗余配置。使用 [read-access geo-redundant (RA-GRS) or geo-zone-redundant (RA-GZRS) storage](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy) 并设计应用程序以在主要区域中断期间将读取切换到次要区域。

#### 命名和分区

使用命名约定来改善分区之间的负载平衡并规划并发客户端的最大数量。保持在 Azure 的可扩展性和容量目标范围内，并在必要时跨多个存储帐户对数据进行分区。

#### 网络

通过 [private endpoints](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints) 或使用 SAS 令牌和 CORS 规则访问 Blob 存储以实现直接客户端访问。

## 安全和访问控制

### Azure 密钥保管库

#### 每个应用程序和环境都有单独的保管库在 [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault/) 中存储数据库连接字符串和 API 密钥等机密。为每个应用程序和环境（开发、测试、生产）使用专用保管库，以限制安全漏洞的影响。

#### 访问控制

使用 [RBAC permission model](https://learn.microsoft.com/en-us/azure/key-vault/general/rbac-guide) 在保管库范围内分配角色并限制对所需主体的访问。使用专用链接和防火墙限制网络访问。

#### 数据保护和日志记录

启用[soft delete and purge protection](https://learn.microsoft.com/en-us/azure/key-vault/general/soft-delete-overview)以防止意外删除。打开日志记录并配置 Key Vault 访问事件的警报。

### 网络安全

#### 入口隔离

通过入口控制器或WAF仅公开前端服务。其他服务应该是内部的，并通过集群网络进行通信。

#### RBAC 和 Pod 安全

使用[Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)来控制谁可以部署、修改或读取资源。启用 [pod security admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/) 以强制执行基线、受限或特权配置文件。

#### 秘密管理

使用 [CSI Secret Store](https://learn.microsoft.com/en-us/azure/aks/csi-secrets-store-driver) 将密钥从 Key Vault 安装到 pod 中。避免将机密存储在环境变量或配置文件中。

## 可观察性和监控

将您的 LangSmith 实例配置为[export telemetry data](/langsmith/export-backend)，以便您可以使用 Azure 的服务来监控它。

### Azure 监视器使用 [Azure Monitor](https://azure.microsoft.com/en-us/products/monitor/) 来获取指标、日志和警报。主动监控涉及针对节点 CPU/内存利用率、Pod 状态和服务延迟等关键信号配置警报。当超过预定义阈值时，Azure Monitor 警报会通知你。

### 管理 Prometheus 和 Grafana

启用[Azure Monitor managed Prometheus](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/prometheus-metrics-overview)收集Kubernetes指标。将其与[Grafana dashboards](https://azure.microsoft.com/en-us/products/managed-grafana/)结合起来进行可视化。定义服务级别目标 (SLO) 并相应配置警报。

### 容器洞察

安装 [Container Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-overview) 以从 AKS 节点和 Pod 捕获日志和指标。使用[Azure Log Analytics workspaces](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-overview)查询分析日志。

### 应用程序日志记录

确保 LangSmith 服务将日志发送到 stdout/stderr 并通过 [Fluent Bit](https://fluentbit.io/) 或 Azure Monitor 代理转发它们。

## 持续集成

* 管理[LangSmith deployments](/langsmith/deployment)的首选方法是创建一个CI进程来构建[Agent Server](/langsmith/agent-server)图像并将其推送到[Azure Container Registry](https://azure.microsoft.com/en-us/products/container-registry)。在 PR 合并时将新修订部署到暂存或生产之前，为拉取请求创建测试部署。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/azure-self-hosted.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>