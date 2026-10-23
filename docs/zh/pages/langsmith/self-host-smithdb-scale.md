<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure SmithDB for scale | https://docs.langchain.com/langsmith/self-host-smithdb-scale -->

# 配置 SmithDB 规模

选择经过测试的 SmithDB 资源层以及 Kubernetes 工作负载和 PostgreSQL 元存储的大小。

> [!注意]
>
> 对于非 SmithDB LangSmith 服务，请参阅 [Configure LangSmith for scale](/langsmith/self-host-scale)。

使用这些经过测试的层作为 SmithDB 的起始配置。在调整容量之前将 SmithDB 连接到监控堆栈，以便您可以观察每次更改的效果。参见[Configure SmithDB observability](/langsmith/self-host-smithdb-observability)。

## 选择部署模式

> [!注意]
>
> `smithdb.topology` 需要 Helm 图表 `0.18.0` 或更高版本。

将`smithdb.topology`设置为`unified`或`cluster`，并在需要时在`cluster`之上启用专用查询服务：

|模式|运行什么 |用它来 |
| - | - | - |
| `unified` |一个运行摄取、查询和压缩的`smithdb all` Pod |测试环境和小批量安装 |
| `cluster`（默认）|单独的摄取、查询和压缩工作负载，由集群管理器协调 |生产装置|
| `cluster` 与 [dedicated query services](#dedicated-query-services) |集群模式加上用于运行统计、运行规则或突变的单独服务 |生产安装中一种查询负载会减慢其他查询负载 |

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  topology: unified
```统一模式运行一个 `smithdb all` 副本，大小由 [unified tiers](#unified-tiers) 决定。当 Pod 重新启动或从节点故障中恢复时，查询会失败。 LangSmith 在 Redis 中对传入跟踪进行排队，并在 Pod 再次运行时写入它们，因此摄取会被延迟而不是被丢弃。 PodDisruptionBudget 可防止节点耗尽驱逐 pod。

### 专用查询服务

在集群模式下，查询服务为所有 SmithDB 读取提供服务。要隔离工作负载，请启用专用服务：

|服务 |服务 |启用 |
| - | - | - |
|统计查询 |运行统计信息，例如运行计数、延迟和错误率 | `smithdb.statsQuery.enabled` |
|运行规则|自动化规则和在线评估| `smithdb.runRules.enabled` |
|突变|反馈更新并运行删除| `smithdb.mutations.enabled` |

每个服务都有自己的副本和自动缩放，并使用查询层的资源。

## 选择并扩展层级

这些层不是吞吐量限制或规定的配置。 CPU、内存和缓存大小是每个副本的。缓存大小是每个副本获取的卷：网络连接磁盘上的声明大小，或本地 SSD 上的 `emptyDir` 限制。选择测试的摄取率和查询率最接近或超过您预期的稳态负载的层。要估计当前的跟踪量，请打开 LangSmith 中的 **设置 > 使用**。参见[Granular billable usage](/langsmith/granular-usage)。

如果您无法测量负载，请从 `small` 开始并按比例增加。

应用每个副本资源和所选层的起始副本计数。如果工作负载后来超出了该起点，您可以水平扩展 SmithDB 计算。

> [!注意]
>
> SmithDB 查询、摄取和压缩工作 HPA 默认启用。它们需要 Kubernetes Metrics Server 或其他 `metrics.k8s.io` 提供商。使用 `kubectl get --raw /apis/metrics.k8s.io/v1beta1` 验证可用性。

### 使用 KEDA 进行扩展

> [!注意]
>
> SmithDB 压缩工作器的 KEDA 扩展需要 Helm 图表 `0.17.0` 或更高版本。

SmithDB 压缩工作线程可以通过[KEDA](https://keda.sh/)而不是基于 CPU 的 HPA 来扩展队列深度。这适合突发压缩积压，即队列深度先于 CPU 增加的情况。 LangSmith 对自己的队列使用相同的 KEDA 安装；请参阅[KEDA autoscaling for LangSmith queues](/langsmith/self-host-scale#keda-autoscaling-for-langsmith-queues)来安装和配置它。

为压实工人启用 KEDA 缩放器：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  compactionWorker:
    autoscaling:
      hpa:
        enabled: false
      keda:
        enabled: true
```

对组件使用 HPA 或 KEDA，而不是同时使用两者。

## 基线层在集群模式下，每一层为每个组件设置每个副本的资源：

|组件|小型 10 摄取/10 查询 QPS |中 100 次摄取/40 次查询 QPS |大型1000次摄取/100次查询QPS |
| - | - | - | - |
|食入| 1 个副本 4 个 CPU 8 Gi 内存 100 Gi 缓存 | 1 个副本 16 CPU 32 Gi 内存 100 Gi 缓存 | 2 个副本 56 个 CPU 150 Gi 内存 1000 Gi 缓存 |
|查询 | 1 个副本 4 个 CPU 8 Gi 内存 200 Gi 缓存 | 1 个副本 28 个 CPU 48 Gi 内存 200 Gi 缓存 | 4 个副本 28 个 CPU 50 Gi 内存 1000 Gi 缓存 |
|压实| 1 个副本 2 个 CPU 4 Gi 内存 | 1 个副本 4 CPU 8 Gi 内存 | 1 个副本 8 CPU 16 Gi 内存 |
|压实工| 1 个副本 8 个 CPU 16 Gi 内存 100 Gi 缓存 | 1 个副本 16 CPU 32 Gi 内存 100 Gi 缓存 | 4 个副本 28 个 CPU 50 Gi 内存 300 Gi 缓存 |
|集群管理器| 1 副本 250m CPU 256 Mi 内存 | 1 副本 250m CPU 256 Mi 内存 | 1 个副本 2 个 CPU 2 Gi 内存 |

### 统一层级

在统一模式下，`smithdb.resourceTier`调整SmithDB pod的大小：

|组件|小|中等|大|
| - | - | - | - |
|统一| 1 个副本 4 个 CPU 16 Gi 内存 100 Gi 缓存 | 1 个副本 16 个 CPU 64 Gi 内存 300 Gi 缓存 | 1 个副本 32 个 CPU 128 Gi 内存 1000 Gi 缓存 |要覆盖层的 CPU 和内存，请设置 `smithdb.unified.deployment.resources`。当工作负载超过大型层时，切换到集群模式。

## 使用 Helm 配置资源

图表默认为`small`。选择`small`、`medium`或`large`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
smithdb:
  resourceTier: medium
```

在 LangSmith 0.17 上，层的缓存大小成为生成的声明的容量。在 0.16 上，它是 `ephemeral-storage` 请求和限制，它也调整了生成的 `emptyDir` 的大小。副本计数和自动缩放是单独配置的。

显式组件`resources`块取代了层的CPU和内存。在 0.17 上它不会改变缓存大小；为此选择不同的层或覆盖`deployment.volumes`。有关本地 SSD 值，请参阅[Cache storage](/langsmith/self-host-smithdb-infrastructure#cache-storage)。

有关当前值和图表详细信息，请参阅[SmithDB resource tiers](https://github.com/langchain-ai/helm/tree/main/charts/langsmith#smithdb-resource-tiers)。

> **显式资源配置示例**
>
> 此示例覆盖中等层大小的查询组件。
>
> **LangSmith 0.17**
>
> 缓存声明保持在层大小。这些值不需要节点存储。
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> smithdb:
>   resourceTier: medium
>   query:
>     deployment:
>       resources:
>         requests:
>           cpu: "28"
>           memory: "48Gi"
>         limits:
>           cpu: "28"
>           memory: "48Gi"
> ```
>
> **LangSmith 0.16**
>
> 存储限制还调整默认 `emptyDir` 的大小。
>
> ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> smithdb:
>   resourceTier: medium
>   query:
>     deployment:
>       resources:
>         requests:
>           cpu: "28"
>           memory: "48Gi"
>           ephemeral-storage: "200Gi"
>         limits:
>           cpu: "28"
>           memory: "48Gi"
>           ephemeral-storage: "200Gi"
> ```

## 元存储容量

基准层仅涵盖 SmithDB Kubernetes 工作负载。它们不包括 PostgreSQL 元存储。使用专用元存储的以下起点：|等级 | vCPU |内存|
| - | - | - |
|小| 2 | 16 GiB |
|中等| 4 | 32 GiB |
|大| 8 | 64 GiB |

从您的提供商处选择最近支持的 PostgreSQL 实例配置，并在部署期间监控数据库资源使用情况和事务延迟。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-smithdb-scale.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。