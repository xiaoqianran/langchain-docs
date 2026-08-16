<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure LangSmith for scale | https://docs.langchain.com/langsmith/self-host-scale -->

# 配置LangSmith进行缩放

<Warning>
本页上的扩展指南和示例配置适用于 **LangSmith 版本 v0.13.0 或更高版本**。
</Warning>

自托管 LangSmith 实例可以处理大量跟踪和用户。自托管部署的默认配置可以处理大量负载，您可以配置您的部署以实现更高的规模。本页面介绍了扩展注意事项并提供了一些示例来帮助配置您的自托管实例。

配置示例请参考[Example LangSmith configurations for scale](#example-langsmith-configurations-for-scale)。

## 总结

下表概述了不同负载模式（读/写）的不同LangSmith配置的比较：|  | **[Low / low](#low-reads-low-writes)** | **[Low / high](#low-reads-high-writes)** | **[High / low](#high-reads-low-writes)** | [Medium / medium](#medium-reads-medium-writes) | [High / high](#high-reads-high-writes) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <Tooltip tip="Number of users actively viewing traces on the frontend">并发前端用户</Tooltip> | 5 | 5 | 50 | 50 20 | 50 | 50
| <Tooltip tip="Number of traces being ingested via SDKs or API endpoints">每秒提交的跟踪数</Tooltip> | 10 | 10 1000 | 1000 10 | 10 100 | 100 1000 | 1000
| **前端副本**<br />（500m CPU，每个副本 1Gi）| 1（默认）| 4 | 2 | 2 | 4 |
| **平台后端副本**<br />（1 个 CPU，每个副本 2Gi）| 3（默认）| 20 | 3（默认）| 3（默认）| 20 |
| **摄取队列副本**<br />（1 个 CPU，每个副本 2Gi）| 3（默认）| 24 | 3（默认）| 6 | 24 |
| **后端副本**<br />（1 个 CPU，每个副本 2Gi）| 2（默认）| 5 | 40 | 40 16 | 16 50 | 50
| **Redis 资源** | 8 Gi（默认）| 26 Gi 外部 | 8 Gi（默认）| 13Gi 外部 | 26 Gi 外部 |
| **ClickHouse 资源** | 4 CPU<br />16 Gi（默认）| 10 CPU<br />32Gi 内存 |每个副本 8 个 CPU<br />16 Gi | 16 CPU<br />24Gi 内存 |每个副本 14 个 CPU<br />24 Gi |
| **ClickHouse 设置** |单实例 |单实例 | 3 节点<Tooltip tip="Recommended for high read loads to prevent degraded performance. Another option would be ⟦T30⟧.">复制集群</Tooltip> |单实例 | 3 节点<Tooltip tip="Recommended for high read loads to prevent degraded performance. Another option would be ⟦T31⟧.">复制集群</Tooltip> || <Tooltip tip="We recommend using an external instance and enabling autoexpansion for the disk to handle growing data requirements.">Postgres 资源</Tooltip> | 2 CPU<br />8 GB 内存<br />10 GB 存储（外部）| 2 CPU<br />8 GB 内存<br />10 GB 存储（外部）| 2 CPU<br />8 GB 内存<br />10 GB 存储（外部）| 2 CPU<br />8 GB 内存<br />10 GB 存储（外部）| 2 CPU<br />8 GB 内存<br />10 GB 存储（外部）|
| **Blob 存储** |已禁用 |已启用 |已启用 |已启用 |已启用 |


下面我们将详细介绍读写路径，并提供一个 `values.yaml` 代码片段，供您开始构建自托管 LangSmith 实例。

## 跟踪摄取（写入路径）

在写入路径上施加负载的常见用法：

- 通过 Python 或 JavaScript LangSmith SDK 摄取痕迹
- 通过 `@traceable` 包装器摄取痕迹
- 通过`/runs/multipart`端点提交跟踪

在跟踪摄取中发挥重要作用的服务：

- 平台后端服务：接收初始请求以提取跟踪并将跟踪放置在 Redis 队列上
- Redis缓存：用于对需要持久化的痕迹进行排队
- 摄取队列服务：保留查询痕迹
- ClickHouse：用于跟踪的持久存储当扩展写入路径（跟踪摄取）时，监视上面列出的四个服务/资源会很有帮助。以下是一些有助于提高跟踪摄取性能的典型更改：

- 如果 ClickHouse 接近资源限制，则为其提供更多资源（CPU 和内存）。
- 如果摄取请求需要很长时间才能响应，请增加平台后端 Pod 的数量。
- 如果 Redis 处理跟踪的速度不够快，则增加摄取队列服务 Pod 副本。
- 如果您发现当前 Redis 实例达到资源限制，请使用更大的 Redis 缓存。这也可能是摄取请求需要很长时间的原因。

## 跟踪查询（读取路径）

在读取路径上施加负载的常见用法：

- 前端用户查看跟踪项目或单个跟踪
- 用于查询跟踪信息的脚本
- 点击 `/runs/query` 或 `/runs/<run-id>` api 端点

在查询跟踪中发挥重要作用的服务：

- 后端服务：接收请求并向ClickHouse提交查询，然后响应请求
- ClickHouse：痕迹的持久存储。这是请求跟踪信息时查询的主数据库。当扩展读取路径（跟踪查询）时，监视上面列出的两个服务/资源会很有帮助。以下是一些有助于提高跟踪查询性能的典型更改：

- 增加后端服务 Pod 的数量。如果后端服务 Pod 达到 1 核 CPU 使用率，这将是最有影响的。
- 为 ClickHouse 提供更多资源（CPU 或内存）。 ClickHouse 可能会占用大量资源，但它应该会带来更好的性能。
- 移动到[replicated ClickHouse cluster](/langsmith/self-host-external-clickhouse#ha-replicated-clickhouse-cluster)。添加 ClickHouse 副本有助于提高读取性能，但我们建议将副本数量保持在 5 个以下（从 3 个开始）。

有关如何将其转换为舵图值的更精确指导，请参阅以下示例[section](#example-langsmith-configurations-for-scale)。如果您不确定为什么您的 LangSmith 实例无法处理特定负载模式，请联系 LangChain 团队。

## LangSmith 队列的 KEDA 自动缩放

<Note>
适用于 LangSmith v0.13.0 及更高版本。
</Note>我们强烈建议您在集群上安装[KEDA](https://keda.sh/)（Kubernetes 事件驱动的自动缩放）。 KEDA 使 `queue` 和 `ingest-queue` 服务能够根据队列积压大小以及 CPU 和内存自动扩展。这可以提高资源利用率并更好地处理流量峰值。

### 安装科达

```bash
helm repo add kedacore https://kedacore.github.io/charts
helm install keda kedacore/keda --namespace keda --create-namespace
```

### 配置 KEDA 自动缩放

安装 KEDA 后，您可以为 `values.yaml` 中的 `queue` 和 `ingest-queue` 服务启用基于 KEDA 的自动缩放：

```yaml
queue:
  autoscaling:
    keda:
      enabled: true

ingestQueue:
  autoscaling:
    keda:
      enabled: true
```

启用 KEDA 后，队列服务将在积压增加时自动扩展，并在处理积压时自动缩小。这对于处理可变跟踪摄取负载而无需过度配置资源特别有用。

<Note>
您还可以为其他服务（`backend`、`platformBackend` 等）启用 KEDA，但它们仍然只能根据 CPU 和内存进行扩展。
</Note>

## LangSmith 规模配置示例

下面我们提供一些基于预期读写负载的 LangSmith 配置示例。

对于读取负载（跟踪查询）：- 低意味着大约 5 个用户同时查看跟踪（每秒大约 10 个请求）
- 中意味着大约 20 个用户同时查看跟踪（每秒大约 40 个请求）
- 高意味着大约 50 个用户同时查看跟踪（每秒大约 100 个请求）

对于写入负载（跟踪摄取）：

- 低意味着每秒最多提交 10 条跟踪
- 中意味着每秒最多提交 100 条跟踪
- 高意味着每秒最多提交 1000 条跟踪

<Note>
确切的最佳配置取决于您的使用情况和跟踪负载。使用以下示例并结合上述信息和您的具体用法来更新您认为合适的 LangSmith 配置。如果您有任何疑问，请联系LangChain团队。
</Note>

### 低读取，低写入<a name="low-reads-low-writes"></a>

默认的 LangSmith 配置将处理此负载。这里不需要自定义资源配置。

### 低读取，高写入<a name="low-reads-high-writes"></a>

您的跟踪摄取规模非常大，但前端每次查询跟踪的用户数量仅为个位数。

为此，我们推荐这样的配置：

```yaml
config:
  blobStorage:
    # Please also set the other keys to connect to your blob storage. See configuration section.
    enabled: true
  settings:
    redisRunsExpirySeconds: "3600"
# ttl:
#   enabled: true
#   ttl_period_seconds:
#     longlived: "7776000"  # 90 days (default is 400 days)
#     shortlived: "604800"  # 7 days (default is 14 days)

frontend:
  deployment:
    replicas: 4 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 2
#     maxReplicas: 4

platformBackend:
  deployment:
    replicas: 20 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 8
#     maxReplicas: 20

ingestQueue:
  deployment:
    replicas: 24 # OR enable KEDA autoscaling below
# autoscaling:
#   keda:
#     enabled: true
#     minReplicaCount: 8
#     maxReplicaCount: 24

backend:
  deployment:
    replicas: 5 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 3
#     maxReplicas: 5

## Ensure your Redis cache is at least 26 GB for high write scale
redis:
  external:
    enabled: true
    existingSecretName: langsmith-redis-secret # Set the connection url for your external Redis instance (26+ GB)

clickhouse:
  statefulSet:
    persistence:
      # This may depend on your configured TTL (see config section).
      # We recommend 600Gi for every shortlived TTL day if operating at this scale constantly.
      size: 4200Gi # This assumes 7 days TTL and operating a this scale constantly.
    resources:
      requests:
        cpu: "10"
        memory: "32Gi"
      limits:
        cpu: "16"
        memory: "48Gi"

commonEnv:
  - name: "CLICKHOUSE_ASYNC_INSERT_WAIT_PCT_FLOAT"
    value: "0"
```

### 高读取，低写入<a name="high-reads-low-writes"></a>您的跟踪摄取规模相对较低，但许多前端用户查询跟踪和/或拥有频繁命中 `/runs/query` 或 `/runs/<run-id>` 端点的脚本。

**为此，我们强烈建议设置复制 ClickHouse 集群，以低延迟实现高读取规模。** 有关如何设置复制 ClickHouse 集群的更多指导，请参阅我们的 [external ClickHouse doc](/langsmith/self-host-external-clickhouse#ha-replicated-clickhouse-cluster)。对于此负载模式，我们建议使用 3 节点复制设置，其中集群中的每个副本应具有 8 个以上核心和 16 GB 以上内存的资源请求，以及 12 个核心和 32 GB 内存的资源限制。

为此，我们推荐这样的配置：

```yaml
config:
  blobStorage:
    # Please also set the other keys to connect to your blob storage. See configuration section.
    enabled: true

frontend:
  deployment:
    replicas: 2

ingestQueue:
  deployment:
    replicas: 3 # OR enable KEDA autoscaling below
# autoscaling:
#   keda:
#     enabled: true
#     minReplicaCount: 2
#     maxReplicaCount: 3

backend:
  deployment:
    replicas: 40 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 16
#     maxReplicas: 40

# We strongly recommend setting up a replicated clickhouse cluster for this load.
# Update these values as needed to connect to your replicated clickhouse cluster.
clickhouse:
  external:
    # If using a 3 node replicated setup, each replica in the cluster should have resource requests of 8+ cores and 16+ GB memory, and resource limit of 12 cores and 32 GB memory.
    enabled: true
    host: langsmith-ch-clickhouse-replicated.default.svc.cluster.local
    port: "8123"
    nativePort: "9000"
    user: "default"
    password: "password"
    database: "default"
    cluster: "replicated"
```

### 中等读取，中等写入<a name="medium-reads-medium-writes"></a>

这是一个很好的全方位配置，应该能够处理 LangSmith 的大多数使用模式。在内部测试中，此配置允许我们扩展到每秒摄取 100 个跟踪和每秒 40 个读取请求。

为此，我们推荐这样的配置：

```yaml
config:
  blobStorage:
    # Please also set the other keys to connect to your blob storage. See configuration section.
    enabled: true
  settings:
    redisRunsExpirySeconds: "3600"

frontend:
  deployment:
    replicas: 2

ingestQueue:
  deployment:
    replicas: 6 # OR enable KEDA autoscaling below
# autoscaling:
#   keda:
#     enabled: true
#     minReplicaCount: 3
#     maxReplicaCount: 6

backend:
  deployment:
    replicas: 16 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 8
#     maxReplicas: 16

redis:
  statefulSet:
    resources:
      requests:
        memory: 13Gi
      limits:
        memory: 13Gi

  # -- For external redis instead use something like below --
  # external:
  #   enabled: true
  #   connectionUrl: "<URL>" OR existingSecretName: "<SECRET-NAME>"

clickhouse:
  statefulSet:
    persistence:
      # This may depend on your configured TTL.
      # We recommend 60Gi for every shortlived TTL day if operating at this scale constantly.
      size: 420Gi # This assumes 7 days TTL and operating a this scale constantly.
    resources:
      requests:
        cpu: "16"
        memory: "24Gi"
      limits:
        cpu: "28"
        memory: "40Gi"

commonEnv:
  - name: "CLICKHOUSE_ASYNC_INSERT_WAIT_PCT_FLOAT"
    value: "0"
```

<Warning>
如果您仍然发现上述配置读取速度缓慢，我们建议您改用[replicated Clickhouse cluster setup](/langsmith/self-host-external-clickhouse#ha-replicated-clickhouse-cluster)
</Warning>

### 高读取，高写入<a name="high-reads-high-writes"></a>您的跟踪摄取率非常高（接近每秒提交 1000 个跟踪），并且还有许多用户在前端查询跟踪（超过 50 个用户）和/或脚本持续向 `/runs/query` 或 `/runs/<run-id>` 端点发出请求。

**为此，我们强烈建议设置复制 ClickHouse 集群，以防止高写入规模下读取性能下降。** 有关如何设置复制 ClickHouse 集群的更多指导，请参阅我们的 [external ClickHouse doc](/langsmith/self-host-external-clickhouse#ha-replicated-clickhouse-cluster)。对于此负载模式，我们建议使用 3 节点复制设置，其中集群中的每个副本应具有 14 个以上核心和 24 GB 以上内存的资源请求，以及 20 个核心和 48 GB 内存的资源限制。我们还建议 ClickHouse 的每个节点/实例为您启用的每天 TTL 提供 600 Gi 的卷存储（根据下面的配置）。

总的来说，我们推荐这样的配置：

```yaml
config:
  blobStorage:
    # Please also set the other keys to connect to your blob storage. See configuration section.
    enabled: true
  settings:
    redisRunsExpirySeconds: "3600"
# ttl:
#   enabled: true
#   ttl_period_seconds:
#     longlived: "7776000"  # 90 days (default is 400 days)
#     shortlived: "604800"  # 7 days (default is 14 days)

frontend:
  deployment:
    replicas: 4 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 2
#     maxReplicas: 4

platformBackend:
  deployment:
    replicas: 20 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 8
#     maxReplicas: 20

ingestQueue:
  deployment:
    replicas: 24 # OR enable KEDA autoscaling below
# autoscaling:
#   keda:
#     enabled: true
#     minReplicaCount: 8
#     maxReplicaCount: 24

backend:
  deployment:
    replicas: 50 # OR enable autoscaling below
# autoscaling:
#   hpa:
#     enabled: true
#     minReplicas: 20
#     maxReplicas: 50

## Ensure your Redis cache is at least 26 GB for high write scale
redis:
  external:
    enabled: true
    existingSecretName: langsmith-redis-secret # Set the connection url for your external Redis instance (26+ GB)

# We strongly recommend setting up a replicated clickhouse cluster for this load.
# Update these values as needed to connect to your replicated clickhouse cluster.
clickhouse:
  external:
    # If using a 3 node replicated setup, each replica in the cluster should have resource requests of 14+ cores and 24+ GB memory, and resource limit of 20 cores and 48 GB memory.
    enabled: true
    host: langsmith-ch-clickhouse-replicated.default.svc.cluster.local
    port: "8123"
    nativePort: "9000"
    user: "default"
    password: "password"
    database: "default"
    cluster: "replicated"

commonEnv:
  - name: "CLICKHOUSE_ASYNC_INSERT_WAIT_PCT_FLOAT"
    value: "0"
```

<Note>
确保 Kubernetes 集群配置了足够的资源以扩展到建议的大小。部署后，Kubernetes 集群中的所有 Pod 都应处于`Running` 状态。 Pod 陷入`Pending` 可能表明您已达到节点池限制或需要更大的节点。此外，请确保集群上部署的任何入口控制器都能够处理所需的负载，以防止出现瓶颈。
</Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-scale.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>