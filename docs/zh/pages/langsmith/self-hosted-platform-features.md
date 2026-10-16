<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted platform features | https://docs.langchain.com/langsmith/self-hosted-platform-features -->

# 自托管平台功能

用于 LangSmith 部署的仅自托管平台功能，包括自定义数据库、侦听器和资源自定义。

本页面介绍仅适用于 [self-hosted](/langsmith/self-hosted) 部署的平台功能。

## 自定义 PostgreSQL

可以使用自定义 PostgreSQL 实例代替 [one automatically created by the control plane](/langsmith/cloud-platform-features#database-provisioning)。指定 [⟦T0⟧](/langsmith/env-var-self-hosted) 环境变量以使用自定义 PostgreSQL 实例。要使用云工作负载身份而不是静态密码进行身份验证，请参阅[Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。

多个部署可以共享同一个 PostgreSQL 实例。例如，对于`Deployment A`，`POSTGRES_URI_CUSTOM`可以设置为`postgres://<user>:<password>@/<database_name_1>?host=<hostname_1>`，对于`Deployment B`，`POSTGRES_URI_CUSTOM`可以设置为`postgres://<user>:<password>@/<database_name_2>?host=<hostname_1>`。 `<database_name_1>`和`<database_name_2>`是同一实例中的不同数据库，但`<hostname_1>`是共享的。 **同一数据库不能用于单独的部署**。

## 自定义Redis

可以使用自定义 Redis 实例来代替控制平面自动创建的实例。指定 [⟦T10⟧](/langsmith/env-var-self-hosted) 环境变量以使用自定义 Redis 实例。要使用云工作负载身份而不是静态密码进行身份验证，请参阅[Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。多个部署可以共享同一个 Redis 实例。例如，对于`Deployment A`，`REDIS_URI_CUSTOM`可以设置为`redis://<hostname_1>:<port>/1`，对于`Deployment B`，`REDIS_URI_CUSTOM`可以设置为`redis://<hostname_1>:<port>/2`。 `1` 和 `2` 是同一实例内的不同数据库编号，但`<hostname_1>` 是共享的。 **相同的数据库编号不能用于单独的部署**。

Redis Cluster 仅支持数据库`0`，因此部署无法通过数据库编号共享Redis Cluster。要跨部署共享一台 Redis 服务器，请使用独立的 Redis 实例，并为每个部署使用单独的数据库编号。

## 听众

监听器是[listener application](/langsmith/data-plane#listener-application)的一个实例。侦听器包含有关应用程序的元数据（例如其版本）以及有关应用程序可以部署到的计算基础设施（例如 Kubernetes 命名空间）的元数据。

侦听器数据模型仅适用于自托管部署。控制平面和侦听器协调以配置和协调在您自己的基础设施上运行的部署。

### 监听器版本要求在更改部署的 `resource_spec` 之前，请使侦听器保持最新状态。控制平面根据其自己版本的规则验证`PATCH`。然后，侦听器在应用修订时，根据其自己版本的规则再次验证存储的 `resource_spec`。如果侦听器比控制平面旧，则 `PATCH` 可以返回 `200`，然后修订会失败并显示 `DEPLOY_FAILED`。

被拒绝的值保留在存储的 `resource_spec` 中，因此该部署的每个后续修订也会失败，包括仅图像部署，直到您使用侦听器接受的值进行 `PATCH` 部署。

以下 `resource_spec` 字段取决于侦听器版本：

|领域 |最低监听版本 |
| :- | :- |
|小数 `cpu` 和 `queue_cpu` 值（例如，`0.5`）|晚于 0.12.x。 Listener 0.12.x 拒绝小数值。 |
| `redis_cpu` 和 `redis_cpu_limit` | 0.13.22 或更高版本。早期的听众会忽略这些字段。 |
| `redis_memory_mb`低于`2048`| 0.13.27 或更高版本。早期听众至少需要`2048`。 |

升级侦听器不会重新启动现有部署。升级后，`PATCH` 每个部署及其完整的 `resource_spec` 应用新值。有关可接受的范围和 `PATCH` 行为，请参阅 [Resource spec](/langsmith/api-ref-control-plane#resource-spec)。

## 资源定制您可以通过部署的 `resource_spec` 为每个自托管部署设置资源，包括其 Redis 和 PostgreSQL 实例。与公开固定无服务器和专用[deployment types](/langsmith/cloud-platform-features#deployment-types)的云不同，自托管部署根据您的基础设施配置调整 CPU、内存、副本和存储的大小。某些领域，例如 Redis CPU，需要最低侦听器版本。参见[Listener version requirements](#listener-version-requirements)。

`db_*` 字段调整控制平面创建的 PostgreSQL 实例的大小，`redis_*` 字段调整 Redis 实例的大小。如果部署使用 [custom PostgreSQL](#custom-postgresql) 或 [custom Redis](#custom-redis)，则匹配字段无效。

部署资源没有默认的组织或工作区。您未设置的字段将回退为部署类型的默认值，因此在创建每个部署时发送完整的 `resource_spec`。请参阅 [Configure Agent Server for scale](/langsmith/agent-server-scale) 获取调整指南。

## PodDisruptionBudgets

从 Operator 0.1.60（`langgraph-dataplane` 图 0.2.24）开始，当最小副本数为 2 或更多时，Operator 会为部署的 API 服务器和队列工作线程部署创建一个带有 `minAvailable: 1` 的 PodDisruptionBudget。您无法关闭这些 PodDisruptionBudgets。在升级到 Operator 0.1.60 或更高版本之前，请删除您自己选择相同 Pod 的任何 PodDisruptionBudget。当两个 PodDisruptionBudget 选择同一个 pod 时，Kubernetes 无法驱逐它，因此节点耗尽和其他驱逐会失败。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted-platform-features.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>