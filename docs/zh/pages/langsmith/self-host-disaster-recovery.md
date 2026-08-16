<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Disaster recovery for self-hosted LangSmith | https://docs.langchain.com/langsmith/self-host-disaster-recovery -->

# 自托管灾难恢复LangSmith

本页面介绍如何规划、配置和操作自托管 LangSmith 可观察性和评估的灾难恢复 (DR)。它涵盖了必须保护哪些数据、数据存放在哪里、如何备份以及如何在区域或分区故障后恢复平台。

<Note>
**共同责任。** 对于自托管部署，您负责每个组件的备份、复制、恢复测试和恢复过程，包括 LangSmith Pod 和所有后备数据存储。 LangChain 仅对LangSmith 软件本身负责。有关等效的 SaaS 职责，请参阅[Shared responsibility model](/langsmith/shared-responsibility-model)。
</Note>

<Tip>
有关本页假定的架构原语（无状态服务、队列心跳、一次性语义）的详细信息，请参阅[Scalability and resilience](/langsmith/scalability-and-resilience)。
</Tip>

## 您正在恢复什么

自托管 LangSmith 由四个状态存储支持的无状态服务组成。恢复计划几乎完全是关于国有商店的。您可以随时通过重新应用 Helm 图表来重新创建无状态服务。|层|组件|状态|恢复行动|
|--------|------------|--------------------|------------------|
| LangSmith服务 | `langsmith-frontend`、`langsmith-backend`、`langsmith-platform-backend`、`langsmith-queue`、`langsmith-ingest-queue`、`langsmith-playground`、`langsmith-ace-backend` |无国籍|重新安装 Helm 图表 |
| PostgreSQL |运营数据：组织、工作区、用户、API 密钥、数据集、提示、项目、部署元数据 | **耐用** |从备份或副本恢复 |
|点击屋|跟踪和反馈（大量分析数据）| **耐用** |从备份或副本恢复 |
| Blob 存储（S3/GCS/Azure Blob）|运行输入、输出、错误、清单、额外内容、事件、附件（启用时）| **耐用** |从版本化存储桶或副本恢复 |
| Redis（或 Valkey）|临时队列状态、发布/订阅、缓存、运行心跳 |短暂的|重新配置；无需恢复 |
| Kubernetes 对象 | Helm 值、`Secret`s、TLS 材料、IRSA / 工作负载身份绑定 |配置|从源代码管理重新应用或备份集群状态 |<Warning>
所有持久数据存储必须一起受到保护。 Postgres、ClickHouse 和 Blob 存储是保存持久数据的三种存储； Redis 是短暂的，不需要备份。在没有 ClickHouse 和 blob 存储的情况下恢复 Postgres（反之亦然）会产生不一致的安装。从 Postgres 到 ClickHouse 中的运行以及 Blob 存储中的对象的引用突破了分歧点。始终采取协调备份，或使用跨存储区靠近的时间点恢复 (PITR) 目标。
</Warning>

## 规划您的 RPO 和 RTO

在设计 DR 架构之前，定义两个目标：

- **恢复点目标 (RPO)：** 您的组织可以容忍的最大数据丢失量（按时间衡量）。通过托管 Postgres PITR，RPO 通常不到 5 分钟。仅使用夜间快照，RPO 可达 24 小时。
- **恢复时间目标 (RTO)：** 发生故障后恢复服务所需的最长时间。跨地域温副本可实现分钟级RTO；从快照进行冷恢复可能需要数小时，尤其是对于大型 ClickHouse 数据集。

以下部署模式采用三个目标配置文件之一：|简介 |典型 RPO |典型RTO |方法|
|--------|-------------|-------------|---------|
|仅快照 | 6 至 24 小时 |营业时间 |每个商店的日常管理备份。成本最低，恢复时间最长。 |
|多可用区 HA |秒|分钟（区域故障）|在另一个可用区同步备用 Postgres 和 ClickHouse、多可用区 Redis、区域冗余 Blob 存储。标准生产姿势。 |
|跨区域容灾 |分钟到小时 |营业时间 | Postgres、ClickHouse 和 Blob 存储的备份复制到第二个区域，并按需恢复。可选的 Postgres 跨区域副本，以实现更严格的 Postgres RPO。成本最高，恢复速度比多可用区慢，但可以防止区域中断。 |

## Postgres

LangSmith 使用 PostgreSQL 作为操作和事务数据的主要存储。 **与 Postgres 的所有通信都使用重试来处理可重试的错误**，因此故障转移期间的短暂中断通常不会作为用户可见的错误出现。长时间中断将导致 LangSmith API 不可用。

### 使用托管服务我们强烈建议在生产中的托管服务上运行 Postgres。托管服务提供内置自动备份、PITR 和 HA 故障转移。设置请参考[Connect external Postgres](/langsmith/self-host-external-postgres)。

<Tabs>
  <Tab title="AWS">
    在多可用区模式下运行[Amazon RDS for PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html)或[Aurora PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.html)。

    - **备份：** 启用 [automated backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html)，并设置与您的合规状况相匹配的保留窗口（通常为 7 到 35 天）。
    - **PITR：** 自动备份包括保留窗口内的 PITR。
    - **HA：** 多可用区部署通过自动故障转移在第二个可用区中保持同步备用。
    - **跨区域容灾：** Aurora 配置[Aurora Global Database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html)。对于 RDS，使用 [cross-region read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.XRgn.html) 或将自动快照复制到辅助区域。
    - **加密：** 使用客户管理的 [KMS](https://aws.amazon.com/kms/) 密钥启用存储加密。
  </Tab>
  <Tab title="GCP">
    在启用 [high availability](https://cloud.google.com/sql/docs/postgres/high-availability) 的情况下运行 [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)。

    - **备份：** 使用 PITR 启用 [automated backups](https://cloud.google.com/sql/docs/postgres/backup-recovery/backups)。
    - **HA:** 区域实例同步复制到第二个区域中的备用实例。
    - **跨区域容灾：** 配置[cross-region read replicas](https://cloud.google.com/sql/docs/postgres/replication/cross-region-replicas)，并在区域故障时提升它们。
    - **加密：** 使用[Cloud KMS customer-managed encryption keys](https://docs.cloud.google.com/sql/docs/postgres/cmek)。
  </Tab>
  <Tab title="Azure">
    使用区域冗余 HA 运行 [Azure Database for PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/overview)。- **备份：** 使用异地冗余备份存储启用 [automatic backups](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-backup-restore)。
    - **HA：** 区域冗余 HA 在不同的可用区域中维护同步备用。
    - **跨区域容灾：** 在次要区域使用[read replicas](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-read-replicas)，针对区域故障进行提升。
  </Tab>
</Tabs>

### 集群内 Postgres

如果您必须从捆绑图表中在集群内运行 Postgres，则您有责任备份底层 PersistedVolume。使用 CSI 驱动程序的快照类定期对 PVC 进行快照，并将快照复制到对象存储或其他区域。 **不建议在生产环境中使用此路径。**

## ClickHouse

ClickHouse 拥有大量跟踪和反馈数据，通常是 LangSmith 部署中最大的数据存储。需要针对成本和恢复时间的影响来规划备份和复制。

### 托管 ClickHouse

实现弹性 ClickHouse 的最快途径是托管选项。参见[Connect external ClickHouse](/langsmith/self-host-external-clickhouse)。

- **[LangSmith Managed ClickHouse](/langsmith/langsmith-managed-clickhouse):** LangChain 操作 ClickHouse 集群，包括备份和复制。 VPC 对等连接将其连接到您的 LangSmith 安装。
- **[ClickHouse Cloud](https://clickhouse.cloud/)：** 提供内置备份、复制和 HA。可在 AWS、GCP 和 Azure 市场上使用。### 自管理复制集群

如果出于合规性或气隙原因自行管理 ClickHouse，请使用复制集群。单节点ClickHouse实例无法满足有意义的RPO。

- 通过 [Keeper or ZooKeeper](https://clickhouse.com/docs/architecture/replication) 配置具有复制功能的多节点 ClickHouse 集群。
- 在 LangSmith 图表中设置 `cluster` 值，以便迁移从一开始就创建 `Replicated` 表引擎。 **必须针对新架构配置集群设置**，您以后无法将独立实例转换为集群实例。
- 跨可用区传播副本。
- 按照与您的 RPO 匹配的频率将 [⟦T10⟧ or ⟦T11⟧](https://clickhouse.com/docs/operations/backup) 安排到对象存储。社区 [⟦T12⟧](https://github.com/Altinity/clickhouse-backup) 工具也是一种流行的计划增量备份选项，具有内置 S3、GCS 和 Azure Blob 支持。
- 跨地域容灾，将备份桶复制到次要地域。自我管理部署中通常不支持跨区域 ClickHouse 复制，ClickHouse Cloud 也不提供跨区域 ClickHouse 复制，因此请规划备份/恢复故障转移模型而不是热副本。

有关复制配置的示例，请参阅 Helm 存储库中的 [replicated ClickHouse example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/replicated-clickhouse/README.md)。<Warning>
在相同的数据量下，恢复 ClickHouse 可能比恢复 Postgres 花费的时间要长得多，因为跟踪表很大。设置 RTO 时要考虑到这一点。在灾难恢复演练期间验证代表性数据集的恢复时间。
</Warning>

## Blob 存储

如果您已启用 [blob storage](/langsmith/self-host-blob-storage)（建议用于生产），则您的运行输入、输出、错误、清单、额外内容、事件和附件位于 S3、GCS 或 Azure Blob 存储中。云 blob 服务在设计上是持久的，但您仍然应该配置针对意外删除和区域中断的保护。<Tabs>
  <Tab title="AWS">
    - 启用[S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)以防止意外删除和覆盖。
    - 为高安全性存储桶启用[MFA Delete](https://docs.aws.amazon.com/AmazonS3/latest/userguide/MultiFactorAuthenticationDelete.html)。
    - 对于跨区域灾难恢复，将[Cross-Region Replication (CRR)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)配置到您的灾难恢复区域中的存储桶。
    - 使用 [S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html) 进行一次写入多次读取 (WORM) 保留。
    - 使用[SSE-KMS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html)加密。 LangSmith 支持传递特定的 KMS 密钥 ARN，请参阅[KMS encryption header support](/langsmith/self-host-blob-storage#kms-encryption-header-support)。
  </Tab>
  <Tab title="GCP">
    - 在存储桶上启用[Object Versioning](https://cloud.google.com/storage/docs/object-versioning)。
    - 使用[dual-region or multi-region buckets](https://cloud.google.com/storage/docs/locations)实现异地冗余。
    - 对于跨区域容灾，请使用[Storage Transfer Service](https://cloud.google.com/storage-transfer-service)或[Object Lifecycle Management](https://cloud.google.com/storage/docs/lifecycle)配合复制策略。
    - 使用[Customer-Managed Encryption Keys (CMEK)](https://cloud.google.com/storage/docs/encryption/customer-managed-keys)加密。
  </Tab>
  <Tab title="Azure">
    - 选择符合您的灾难恢复目标的[redundancy tier](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy)。在主要区域中断期间，使用 **RA-GRS** 或 **RA-GZRS** 进行跨区域读取访问。
    - 启用[soft delete and blob versioning](https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-blob-overview)。
    - 使用 [customer-managed key in Key Vault](https://learn.microsoft.com/en-us/azure/storage/common/customer-managed-keys-overview) 加密。
  </Tab>
</Tabs>

<Warning>
**将 TTL 生命周期规则保留在 DR 存储桶中。** 如果将数据复制到 DR 存储桶，请复制 `ttl_s/`、`ttl_l/` 以及任何自定义 `ttl_XXd/` 前缀的生命周期规则。 DR 存储桶中缺少规则将导致故障转移后数据无限期保留。参见[TTL configuration](/langsmith/self-host-blob-storage#ttl-configuration)。
</Warning>

## RedisRedis 存储临时元数据、队列状态和跨实例发布/订阅。 **Redis 中不存储持久数据，因此您无需备份。** 对于可重试错误，将重试与 Redis 的通信。恢复设计是为了使Redis在活动区域​​内高可用，并在DR区域从头开始重新配置它。

- 使用适用于您的云的托管服务：[Amazon ElastiCache](https://aws.amazon.com/elasticache/redis/)、[Google Cloud Memorystore](https://cloud.google.com/memorystore) 或 [Azure Cache for Redis](https://azure.microsoft.com/en-us/products/cache)。
- 启用多可用区故障转移。
- 对于跨区域灾难恢复，在故障转移期间在灾难恢复区域中配置一个新的Redis实例； **不要**在新集群中重用活动区域的 Redis URI。

<Warning>
每个 LangSmith 安装必须使用自己专用的 Redis 实例。 **不要在两个安装之间共享 Redis 实例**，包括可能在任何时候都处于活动状态的主实例和 DR 副本。共享 Redis 会导致部署任务路由到错误的集群。参见[Connect external Redis](/langsmith/self-host-external-redis)。
</Warning>

## Kubernetes 配置和秘密

Helm 图表值、Kubernetes `Secret`s 和身份绑定与数据备份一样重要。完整的恢复需要两者。- **Helm 值：** 将 `values.yaml` 存储在源代码管理中。单独跟踪每个环境的覆盖。
- **图像版本：** 固定LangSmith图表版本和图像标签，以便恢复安装相同的软件版本。参见[Self-host upgrades](/langsmith/self-host-upgrades)和[Dependency versions](/langsmith/self-host-dependency-versions)。
- **秘密：** LangSmith 从 Kubernetes `Secret` 读取数据库、blob 和许可凭证。将这些镜像到 DR 集群的机密管理器（[AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)、[GCP Secret Manager](https://cloud.google.com/secret-manager) 或 [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault/)）。参见[Use an existing secret](/langsmith/self-host-using-an-existing-secret)。
- **TLS 材料：** 如果您在 LangSmith 入口终止 TLS，请备份证书和密钥，或从 DR 区域中的私有 CA 重新颁发。参见[Custom TLS certificates](/langsmith/self-host-custom-tls-certificates)。
- **IRSA / 工作负载身份绑定：** 在 DR 区域中重新创建 IAM 角色和服务帐户绑定；服务帐户 ARN 和注释是区域范围的。
- **许可证密钥：** 将 LangSmith 许可证密钥与其他恢复密钥一起保存。

## 参考部署模式

### 具有多可用区 HA 的单区域（推荐基线）

这是最低的生产状态，可以防止区域故障。它不能防止区域性停电。- 跨至少两个可用区的 Kubernetes 节点池。
- 多可用区 HA 模式下的 Postgres（RDS 多可用区、云 SQL HA 或灵活服务器区域冗余）。
- ClickHouse 作为托管服务，或分布在可用区的 3 节点复制集群。
- 启用了多可用区故障转移的 Redis。
- 启用版本控制且至少具有区域冗余的冗余层的 Blob 存储。
- 每个数据存储的每日快照保留至少 7 天。

### 跨区域主动/被动容灾

这可以防止区域性停电。它的成本要高得多，但对于一级部署来说是正确的模式。- DR 区域中的第二个 Kubernetes 集群安装了 LangSmith Helm 图表，但扩展到低副本数（热）或零（冷）。
- Postgres 跨区域副本（RDS 或 Aurora 跨区域副本、Cloud SQL 跨区域副本、Azure 灵活服务器跨区域副本）。促进故障转移。
- ClickHouse Cloud 或 LangSmith 具有区域故障转移计划的托管 ClickHouse，**或** ClickHouse 备份复制到 DR 区域并在故障转移时恢复到新的自管理集群中。通常不支持跨区域 ClickHouse 复制（ClickHouse Cloud 也不提供），因此请规划备份/恢复而不是热灾难恢复副本。
- Blob 存储复制到具有版本控制和匹配生命周期规则的 DR 存储桶。
- 在故障转移期间，Redis 在 DR 区域中进行了全新配置。
- DNS 由 [Route 53](https://aws.amazon.com/route53/)、[Cloud DNS](https://cloud.google.com/dns) 或 [Azure DNS](https://azure.microsoft.com/en-us/products/dns/) 管理，健康检查和故障转移策略指向每个区域的 LangSmith 前端入口。

<Note>
LangSmith是一个单写平台。跨区域部署应该是**主动/被动**，而不是主动/主动。不支持针对同一逻辑安装同时写入两个区域，这会产生数据不一致。
</Note>## 恢复程序

### 区域故障后恢复

在单区域多可用区部署中，区域故障由您的云提供商自动处理：

1. 托管 Postgres 故障转移到另一个可用区中的备用数据库。重试后，LangSmith Pod 通过集群端点重新连接。
2.托管Redis的故障转移类似。 LangSmith 自动重试重新连接。
3. Kubernetes 在剩余可用区的健康节点上重新调度 LangSmith Pod。验证节点池和 Horizo​​ntal Pod Autoscaler 限制是否允许此余量。
4. 通过从 SDK 提交测试跟踪并确认其显示在 UI 中来验证摄取。

### 区域故障后恢复

这是跨区域故障转移操作手册。适应您的特定基础设施。<Steps>
  <Step title="Declare failover">
    确认主要区域不可用。与利益相关者沟通您正在进行故障转移以及预期的 RTO 是多少。
  </Step>
  <Step title="Promote data stores">
    将 Postgres 跨区域副本提升为 DR 区域中的主副本。对于 ClickHouse Cloud 或 LangSmith Managed ClickHouse，启动记录的区域故障转移。对于自管理的 ClickHouse，将最新的备份恢复到 DR 集群中（这通常是最长的步骤）。
  </Step>
  <Step title="Repoint blob storage">
    更新 LangSmith Helm `config.blobStorage.bucketName` 和 `apiURL` 以指向 DR 存储桶。确认存储桶具有相同的 TTL 生命周期规则。参见[Blob storage configuration](/langsmith/self-host-blob-storage#configuration)。
  </Step>
  <Step title="Provision Redis">
    在 DR 区域中创建新的托管 Redis 实例。更新 LangSmith Helm `redis.external` 值以指向它。 **不要从主 Redis 导入转储**；规定空了。
  </Step>
  <Step title="Scale the DR cluster">
    如果运行热/冷，请将 LangSmith 部署扩展到其生产副本数量。应用来自源代码管理的任何挂起的 Helm 值更新。
  </Step>
  <Step title="Run smoke tests">
    提交测试跟踪，验证其是否位于 ClickHouse 中以及（如果启用了 Blob 存储）是否位于 DR 存储桶中。打开 UI 并确认跟踪、数据集和项目加载。验证身份验证。参见[Diagnostics](/langsmith/diagnostics-self-hosted)。
  </Step>
  <Step title="Cut DNS over">更新 DNS 以将流量路由到 DR 入口。向利益相关者传达切换情况。
  </Step>
  <Step title="Plan failback">
    一旦主要区域正常，就计划受控故障恢复。这通常被安排在维护窗口中，并涉及在再次交换之前将主数据库重建为新的 DR 副本。
  </Step>
</Steps>

### 从快照恢复

如果您完全丢失了主数据存储并需要从快照恢复：

<Steps>
  <Step title="Stop ingestion">
    将 `langsmith-queue` 和 `langsmith-ingest-queue` 缩放为零，以便在恢复时不会写入新的跟踪。
  </Step>
  <Step title="Restore Postgres">
    将 Postgres 备份恢复到新实例或对最新的事件发生前时间戳执行 PITR。更新 LangSmith Helm `postgres.external` 连接详细信息以指向已恢复的实例。
  </Step>
  <Step title="Restore ClickHouse">
    恢复与 Postgres 恢复点时间一致的最新 ClickHouse 备份。恢复时间尺度与数据大小。
  </Step>
  <Step title="Restore blob storage">
    如果丢失 Blob 数据（罕见），请从 S3/GCS/Azure 还原版本化对象或从复制的 DR 存储桶进行复制。
  </Step>
  <Step title="Resume ingestion">
    将 `langsmith-queue` 和 `langsmith-ingest-queue` 缩放回生产副本计数。提交烟雾测试跟踪并验证其着陆。
  </Step>
</Steps><Warning>
始终将 Postgres、ClickHouse 和 Blob 存储恢复到最接近的可能协调时间点。将 Postgres 恢复到比 ClickHouse 更新的时间点可能会在 UI 中产生悬空的项目引用和丢失的跟踪。
</Warning>

## 测试您的灾难恢复计划

备份的效果与上次成功恢复的效果相同。安排以下练习：

- **季度：** 将 Postgres 和 ClickHouse 快照恢复到非生产环境中，并运行 [diagnostics tooling](/langsmith/diagnostics-self-hosted) 和烟雾跟踪测试。测量实际恢复时间并确认其在 RTO 之内。
- **每年两次：** 针对临时安装执行完整的跨区域故障转移演练。提升副本、重新指向 blob 存储、扩展 DR 集群、运行冒烟测试和回滚。
- **在每次图表升级时：** 验证升级路径不会使您的 DR 计划失效（例如，仅应用于主数据库的架构迁移需要复制到 DR 副本）。参见[Self-host upgrades](/langsmith/self-host-upgrades)。

## 相关页面

- [Scalability and resilience](/langsmith/scalability-and-resilience)
- [Shared responsibility model](/langsmith/shared-responsibility-model)
- [Connect external Postgres](/langsmith/self-host-external-postgres)
- [Connect external ClickHouse](/langsmith/self-host-external-clickhouse)
- [Connect external Redis](/langsmith/self-host-external-redis)
- [Enable blob storage](/langsmith/self-host-blob-storage)
- [Self-host upgrades](/langsmith/self-host-upgrades)
- [Use an existing secret](/langsmith/self-host-using-an-existing-secret)
- [Diagnostics for self-hosted](/langsmith/diagnostics-self-hosted)
- [AWS self-hosted reference architecture](/langsmith/aws-self-hosted)
- [GCP self-hosted reference architecture](/langsmith/gcp-self-hosted)
- [Azure self-hosted reference architecture](/langsmith/azure-self-hosted)

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-disaster-recovery.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>