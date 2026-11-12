<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Self-hosted platform features | https://docs.langchain.com/langsmith/self-hosted-platform-features -->

# 自托管平台功能

LangSmith代理服务器的仅自托管平台功能，包括自定义数据库、侦听器和资源自定义。

本页面介绍仅适用于 [self-hosted](/langsmith/self-hosted) 部署的平台功能。

## 自定义 PostgreSQL

可以使用自定义 PostgreSQL 实例代替 [one automatically created by the control plane](/langsmith/cloud-platform-features#database-provisioning)。指定 [⟦T2⟧](/langsmith/env-var-self-hosted) 环境变量以使用自定义 PostgreSQL 实例。要使用云工作负载身份而不是静态密码进行身份验证，请参阅[Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。

多个部署可以共享同一个 PostgreSQL 实例。例如，对于`Deployment A`，`POSTGRES_URI_CUSTOM`可以设置为`postgres://<user>:<password>@/<database_name_1>?host=<hostname_1>`，对于`Deployment B`，`POSTGRES_URI_CUSTOM`可以设置为`postgres://<user>:<password>@/<database_name_2>?host=<hostname_1>`。 `<database_name_1>`和`<database_name_2>`是同一实例中的不同数据库，但`<hostname_1>`是共享的。 **同一数据库不能用于单独的部署**。

## 自定义 Redis

可以使用自定义 Redis 实例来代替控制平面自动创建的实例。指定 [⟦T12⟧](/langsmith/env-var-self-hosted) 环境变量以使用自定义 Redis 实例。要使用云工作负载身份而不是静态密码进行身份验证，请参阅[Configure IAM authentication for data stores](/langsmith/configure-iam-auth)。多个部署可以共享同一个 Redis 实例。例如，对于`Deployment A`，`REDIS_URI_CUSTOM`可以设置为`redis://<hostname_1>:<port>/1`，对于`Deployment B`，`REDIS_URI_CUSTOM`可以设置为`redis://<hostname_1>:<port>/2`。 `1` 和`2` 是同一实例内的不同数据库编号，但`<hostname_1>` 是共享的。 **相同的数据库编号不能用于单独的部署**。

Redis Cluster 仅支持数据库`0`，因此部署无法按数据库编号共享Redis Cluster。要跨部署共享一台 Redis 服务器，请使用独立的 Redis 实例，并为每个部署使用单独的数据库编号。

## 听众

监听器是[listener application](/langsmith/data-plane#listener-application)的一个实例。侦听器包含有关应用程序的元数据（例如其版本）以及有关应用程序可以部署到的计算基础设施（例如 Kubernetes 命名空间）的元数据。

侦听器数据模型仅适用于自托管部署。控制平面和侦听器协调以配置和协调在您自己的基础设施上运行的部署。

### 监听器版本要求在更改部署的 `resource_spec` 之前，请使侦听器保持最新状态。控制平面根据其自己版本的规则验证`PATCH`。然后，侦听器在应用修订版时，根据其自己版本的规则再次验证存储的 `resource_spec`。如果侦听器比控制平面旧，则 `PATCH` 可以返回 `200`，然后修订会失败并显示 `DEPLOY_FAILED`。

被拒绝的值保留在存储的 `resource_spec` 中，因此该部署的每个后续修订也会失败，包括仅图像部署，直到您使用侦听器接受的值进行 `PATCH` 部署。

以下 `resource_spec` 字段取决于侦听器版本：

|领域 |最低监听版本 |
| :- | :- |
|小数 `cpu` 和 `queue_cpu` 值（例如，`0.5`）|晚于 0.12.x。 Listener 0.12.x 拒绝小数值。 |
| `redis_cpu` 和 `redis_cpu_limit` | 0.13.22 或更高版本。早期的听众会忽略这些字段。 |
| `redis_memory_mb`低于`2048`| 0.13.27 或更高版本。早期听众至少需要`2048`。 |
| `volumes` 和 `volume_mounts` | 30 年 11 月 0 日或更高版本。早期的侦听器会忽略这些字段，并且部署会在没有卷的情况下开始。 |升级侦听器不会重新启动现有部署。升级后，`PATCH` 每个部署及其完整的 `resource_spec` 应用新值。有关可接受的范围和 `PATCH` 行为，请参阅 [Resource spec](/langsmith/api-ref-control-plane#resource-spec)。

## 资源定制

您可以通过部署的 `resource_spec` 为每个自托管部署设置资源，包括其 Redis 和 PostgreSQL 实例。与公开固定无服务器和专用[deployment types](/langsmith/cloud-platform-features#deployment-types)的云不同，自托管部署根据您的基础设施配置调整 CPU、内存、副本和存储的大小。某些领域，例如 Redis CPU，需要最低侦听器版本。参见[Listener version requirements](#listener-version-requirements)。

`db_*` 字段调整控制平面创建的 PostgreSQL 实例的大小，`redis_*` 字段调整 Redis 实例的大小。如果部署使用[custom PostgreSQL](#custom-postgresql)或[custom Redis](#custom-redis)，则匹配字段无效。

部署资源没有默认的组织或工作区。您未设置的字段将回退为部署类型的默认值，因此在创建每个部署时发送完整的 `resource_spec`。请参阅[Configure Agent Server for scale](/langsmith/agent-server-scale) 获取调整指南。

## 卷您可以将 Kubernetes 卷挂载到部署的 Pod 中。例如，挂载由 Amazon EFS、NFS 或其他 CSI 驱动程序支持的 PersistentVolumeClaim。已安装的卷可让您的代理读取和写入在重新启动后仍保留的文件或多个副本共享的文件。操作员将卷添加到 API 服务器和队列工作容器的主容器中。

这些卷是代理运行时的存储。它们与LangSmith平台本身使用的存储分开，例如PostgreSQL、Redis和blob存储。 LangSmith 不配置存储或创建 PersistentVolumeClaim。您可以在集群中创建这两者，并且部署仅挂载它们。

在两个位置之一设置音量：* **一次部署**：通过[control plane API](/langsmith/api-ref-control-plane)在部署的`resource_spec`中设置`volumes`和`volume_mounts`。这些字段需要侦听器 0.11.30 或更高版本。参见[Listener version requirements](#listener-version-requirements)。您无法在 LangSmith UI 中添加 PersistentVolumeClaims 或其他通用卷。在 UI 中保存部署设置会保留您通过 API 设置的卷和安装。
* **每次部署**：将 `volumes` 和 `volumeMounts` 添加到 Helm 值中操作员的基本部署模板 (`operator.templates.deployment`)。有关编辑该模板的示例，请参阅[Configure authentication for private registries](/langsmith/enable-self-hosted-deployment#configure-authentication-for-private-registries)。

如果基本模板和部署的 `resource_spec` 都设置了具有相同 `name` 的卷或卷挂载，则部署的 `resource_spec` 优先。

要在一个部署上安装卷：1. 在运行部署的 Kubernetes 命名空间中创建 PersistentVolumeClaim。对于 Amazon EFS，安装 [Amazon EFS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/efs-csi.html)，并使用具有 `ReadWriteMany` 访问模式的 EFS StorageClass。 `ReadWriteMany` 让每个副本都挂载该卷。
2. 使用卷及其在 `source_config.resource_spec` 中的安装来调用 `PATCH /v2/deployments/{deployment_id}`。包含 `resource_spec` 的 `PATCH` 会替换整个对象，因此请包含现有的 `min_scale`、`max_scale`、`cpu`、`memory_mb` 和其他 `resource_spec` 值。每个`volumes`条目采用一个`name`和一个卷源：`persistentVolumeClaim`、`csi`、`nfs`、`configMap`、`secret`、`emptyDir`、`projected`，或`downwardAPI`。控制平面将源对象原封不动地传递给 Kubernetes。使用 Kubernetes 驼峰命名法编写其密钥，例如 `claimName`：

   ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   {
     "source_config": {
       "resource_spec": {
         "min_scale": 1,
         "max_scale": 3,
         "cpu": 1,
         "memory_mb": 2048,
         "volumes": [
           {
             "name": "shared-files",
             "persistentVolumeClaim": { "claimName": "efs-claim" }
           }
         ],
         "volume_mounts": [
           { "name": "shared-files", "mountPath": "/mnt/shared" }
         ]
       }
     }
   }
   ```

   卷名称必须是唯一的、有效的 DNS 标签：小写字母、数字和连字符，最多 63 个字符。每个`mountPath`必须是绝对路径。 `volume_mounts` 中的两个条目不能使用相同的 `mountPath`。欲了解更多信息，请参阅[Resource spec](/langsmith/api-ref-control-plane#resource-spec)。
3. 轮询新版本，直到其 `status` 为 `DEPLOYED`。
4. 确认应用程序容器可以在 API 服务器和队列工作 Pod 中以 `mountPath` 读写。 `Bound` PersistentVolumeClaim 不保证容器的用户对卷具有写入权限。要检查写入访问权限，请对每个 pod 运行以下命令：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   kubectl exec <pod-name> -n <namespace> -- sh -c 'touch /mnt/shared/.write-test && rm /mnt/shared/.write-test'
   ```

## PodDisruptionBudgets

从 Operator 0.1.60（`langgraph-dataplane` 图 0.2.24）开始，当最小副本数为 2 或更多时，Operator 会为部署的 API 服务器和队列工作线程部署创建一个带有 `minAvailable: 1` 的 PodDisruptionBudget。您无法关闭这些 PodDisruptionBudgets。

在升级到 Operator 0.1.60 或更高版本之前，请删除您自己选择相同 Pod 的任何 PodDisruptionBudget。当两个 PodDisruptionBudget 选择同一个 pod 时，Kubernetes 无法驱逐它，因此节点耗尽和其他驱逐会失败。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-hosted-platform-features.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。