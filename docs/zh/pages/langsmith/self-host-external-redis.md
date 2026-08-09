<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to an external Redis or Valkey database | https://docs.langchain.com/langsmith/self-host-external-redis -->

# 连接到外部 Redis 或 Valkey 数据库

LangSmith 使用 Redis 来支持我们的排队/缓存操作。默认情况下，LangSmith 自托管将使用内部 Redis 实例。但是，您可以将 LangSmith 配置为使用外部 Redis 实例。通过配置外部 Redis 实例，您可以更轻松地管理 Redis 实例的备份、扩展和其他操作任务。

[Valkey](https://valkey.io/) 也得到官方支持作为 Redis 的直接替代品。此页面在任何涉及 Redis 的地方，您都可以使用兼容的 Valkey 实例。有关支持的版本，请参阅[Requirements](#requirements)。

<Warning>
  每个 LangSmith 安装都必须使用自己的专用 Redis 实例。 Redis 无法在单独的 LangSmith 安装之间共享（例如，迁移期间在现有集群和新集群之间）。跨安装共享它会导致部署任务被路由到错误的集群。
</Warning>

<Tip>
  **如果您使用托管 Redis 服务**，我们建议：

  * [Amazon ElastiCache](https://aws.amazon.com/elasticache/redis/) (AWS)
  * [Google Cloud Memorystore](https://cloud.google.com/memorystore) (GCP)
  * [Azure Cache for Redis](https://azure.microsoft.com/en-us/services/cache/) (天蓝色)

  对于特定于云的 IAM/工作负载身份验证，请参阅[IAM authentication section](#iam-authentication)。
</Tip>

## 要求* 您的 LangSmith 实例将具有网络访问权限的已配置 Redis 或 [Valkey](https://valkey.io/) 实例。我们建议使用托管服务，例如：

  * [Amazon ElastiCache](https://aws.amazon.com/elasticache/redis/)（Redis 或 Valkey）
  * [Google Cloud Memorystore](https://cloud.google.com/memorystore)（Redis 或 Valkey）
  * [Azure Cache for Redis](https://azure.microsoft.com/en-us/services/cache/)

* **支持的版本：** Redis >= 5 或 Valkey 8。在本指南中，Valkey 被视为 Redis 的直接替代品。

* 我们支持Standalone和Redis Cluster（包括Valkey Cluster）。有关部署说明，请参阅相应部分。

* 支持免认证、密码、[IAM/Workload Identity](#iam-authentication)认证。

* 默认情况下，我们建议实例至少具有 2 个 vCPU 和 8GB 内存。但是，实际要求将取决于您的跟踪工作负载。我们建议监控您的 Redis 实例并根据需要进行扩展。

<Tip>
  如果您启用[LangSmith Sandboxes](/langsmith/deploy-self-hosted-full-platform#enable-sandboxes)，我们建议将沙箱存储使用的Redis元数据存储的Redis `maxmemory-policy`设置为`noeviction`。这可以避免在内存压力下驱逐文件系统元数据。
  使用`noeviction`，当实例达到最大内存时，Redis 写入可能会失败，因此请为沙箱元数据增长保留足够的内存空间。
</Tip>

## 独立Redis

### 连接字符串您需要为 Redis 实例组装连接字符串。该连接字符串应包含以下信息：

* 主持人
* 数据库
* 端口
* 网址参数

这将采取以下形式：

```
"redis://host:port/db?<url_params>"
```

连接字符串示例可能如下所示：

```
"redis://langsmith-redis:6379/0"
```

注意：如果您的独立 Redis 需要身份验证或 TLS，请直接在连接 URL 中包含这些内容：

* 当 Redis 服务器上启用 TLS 时，使用 `rediss://`。
* 在连接字符串中提供密码。

例如：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
rediss://langsmith-redis:6380/0?password=foo
```

对于 IAM 身份验证，请使用身份作为用户名（无密码）：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
rediss://<iam-identity>@host:6380
```

### 配置

有了连接字符串，您就可以将 LangSmith 实例配置为使用外部 Redis 实例。您可以通过修改 LangSmith Helm Chart 安装的 `values` 文件来完成此操作。

```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
redis:
  external:
    enabled: true
    connectionUrl: "Your connection url"
```

您还可以将连接 URL 存储在现有的 Kubernetes Secret 中，并在 Helm 值中引用它。

<CodeGroup>
  ```yaml Helm (using an existing Secret) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  redis:
    external:
      enabled: true
      # Name of an existing Secret that contains the connection URL
      existingSecretName: "my-redis-secret"
      # Key in the Secret that stores the connection URL (default shown)
      connectionUrlSecretKey: "connection_url"
  ```

  ```yaml Kubernetes Secret theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: Secret
  metadata:
    name: my-redis-secret
  type: Opaque
  stringData:
    # Full connection URL, e.g., using TLS with password
    connection_url: "rediss://langsmith-redis:6380/0?password=foo"
  ```
</CodeGroup>

配置完成后，您应该能够重新安装 LangSmith 实例。如果一切配置正确，您的 LangSmith 实例现在应该使用外部 Redis 实例。

## Redis集群从 LangSmith helm 版本 **0.12.25** 开始，我们正式支持 **Redis Cluster**。

### 主机名

使用 Redis 集群时，请提供节点主机名和端口的列表。每个节点 URI 必须采用以下形式：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
redis://hostname:port
```

例如：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
redis://redis-node-0:6379
redis://redis-node-1:6379
redis://redis-node-2:6379
```

不要在这些 URI 中包含密码，并且不要在此处使用 `rediss`。对于 Redis 集群：

* 通过 `redis.external.cluster.password` 或通过使用 `passwordSecretKey` 的 Secret 单独提供密码。
* Redis 集群 (`redis.external.cluster.tlsEnabled: true`) 默认启用 TLS。如果您的集群不使用 TLS，请设置 `tlsEnabled: false`。

### 配置

连接到外部 Redis 集群时，请在 `redis.external.cluster` 下配置 Helm 值。您可以：

* 直接在 `values.yaml` 中提供节点 URI 和（可选）密码。
* 或者引用包含节点 URI 和密码的现有 Kubernetes `Secret`。

<CodeGroup>
  ```yaml Helm (inline values) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  redis:
    external:
      enabled: true
      cluster:
        enabled: true
        # List of cluster node URIs. Format: redis://host:port
        nodeUris:
          - "redis://redis-node-0:6379"
          - "redis://redis-node-1:6379"
          - "redis://redis-node-2:6379"
        # Optional. If your cluster requires auth, set a password or use a Secret (recommended).
        password: "your_redis_password"
        # TLS is enabled by default. Set to false if your cluster does not use TLS.
        tlsEnabled: true
  ```

  ```yaml Helm (using an existing Secret) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  redis:
    external:
      enabled: true
      # Name of an existing Secret that contains cluster connection details
      existingSecretName: "my-redis-cluster-secret"
      cluster:
        enabled: true
        # Keys in the Secret. Defaults shown here; override if your Secret uses different keys.
        nodeUrisSecretKey: "redis_cluster_node_uris"
        passwordSecretKey: "redis_cluster_password"
        tlsEnabled: true
  ```
</CodeGroup>

如果使用现有的 Secret，它应该包含：

<CodeGroup>
  ```yaml Kubernetes Secret theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: Secret
  metadata:
    name: my-redis-cluster-secret
  type: Opaque
  stringData:
    # JSON array of node URIs (as a string)
    redis_cluster_node_uris: '["redis://redis-node-0:6379","redis://redis-node-1:6379","redis://redis-node-2:6379"]'
    # Optional if your cluster requires a password
    redis_cluster_password: "your_redis_password"
  ```
</CodeGroup>

## Azure 托管 Redis

[Azure Managed Redis](https://azure.microsoft.com/en-us/products/managed-redis) 支持两种影响 LangSmith 连接方式的集群策略。根据您实例的集群策略选择以下配置。

### OSS集群

LangSmith使用Redis Cluster模式连接OSS集群策略实例。从 LangSmith Helm Chart 版本 **0.13.33** 开始，支持 `ssl_check_hostname=false` 作为节点 URI 参数。在我们的测试中，OSS集群策略要求禁用SSL主机名验证。 Azure 的代理解析与证书 SAN 中不存在的内部节点 IP 的连接，从而导致主机名验证失败。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
redis:
  external:
    enabled: true
    cluster:
      enabled: true
      nodeUris:
        - "redis://<node_url>:10000?ssl_check_hostname=false"
      tlsEnabled: true
```

### 企业集群

从 LangSmith Helm Chart 版本 **0.13.33** 开始，LangSmith 通过 EnterpriseCluster 策略支持 Azure 托管 Redis。此策略公开了在内部处理分片的单个端点。 LangSmith 必须作为独立（单实例）客户端连接到它，但它不支持集群不安全操作，例如 MULTI/EXEC。设置`redis.external.clusterSafeMode: true`以禁用不安全的集群操作。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
redis:
  external:
    enabled: true
    connectionUrl: "rediss://<azure-redis-host>:6380"
    # Required for EnterpriseCluster: use a single-instance client and disable unsafe cluster operations
    clusterSafeMode: true
```

对于 EnterpriseCluster 的 Microsoft Entra (IAM) 身份验证，请参阅 [Azure tab in IAM authentication](#azure-cache-for-redis) 并在 Helm 值中包含 `clusterSafeMode: true`。

## TLS 与 Redis

使用此部分为 Redis 连接配置 TLS。要安装内部/公共 CA 以便 LangSmith 信任您的 Redis 服务器证书，请参阅[Configure custom TLS certificates](/langsmith/self-host-custom-tls-certificates#mount-internal-cas-for-tls)。

### 服务器 TLS（单向）

验证 Redis 服务器证书：* 使用 `config.customCa.secretName` 和 `config.customCa.secretKey` 提供 CA 捆绑包。
* 对于独立 Redis，请在连接 URL 中使用 `rediss://`。
* 对于 Redis 集群，`redis.external.cluster.tlsEnabled` 默认为 `true`。确保其未设置为`false`。

<Warning>
  仅当您的 Redis 服务器使用内部或私有 CA 时才安装自定义 CA。公众信任的 CA 不需要此配置。
</Warning>

<CodeGroup>
  ```yaml Helm (Standalone - server TLS) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  config:
    customCa:
      secretName: "langsmith-custom-ca"  # Secret containing your CA bundle
      secretKey: "ca.crt"    # Key in the Secret with the CA bundle
  redis:
    external:
      enabled: true
      # Use rediss:// and include password if required by your server
      connectionUrl: "rediss://host:6380/0?password=<PASSWORD>"
  ```

  ```yaml Helm (Cluster - server TLS) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  config:
    customCa:
      secretName: "langsmith-custom-ca"  # Secret containing your CA bundle
      secretKey: "ca.crt"    # Key in the Secret with the CA bundle
  redis:
    external:
      enabled: true
      cluster:
        enabled: true
        tlsEnabled: true
        nodeUris:
          - "redis://redis-node-0:6379"
          - "redis://redis-node-1:6379"
          - "redis://redis-node-2:6379"
        password: "<PASSWORD>"
  ```

  ```yaml Kubernetes Secret (CA bundle) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: Secret
  metadata:
    name: langsmith-custom-ca
  type: Opaque
  stringData:
    ca.crt: |
      -----BEGIN CERTIFICATE-----
      <ROOT_OR_INTERMEDIATE_CA_CERT_CHAIN>
      -----END CERTIFICATE-----
  ```
</CodeGroup>

### 具有客户端身份验证的双向 TLS (mTLS)

从 LangSmith helm Chart 版本 **0.12.29** 开始，我们支持 Redis 客户端的 mTLS。对于 mTLS 中的服务器端身份验证，除了以下客户端证书配置之外，还可以使用[Server TLS steps](#server-tls-one-way)（自定义 CA）。

如果您的 Redis 服务器需要客户端证书身份验证：

* 提供包含您的客户端证书和密钥的 Secret。
* 通过`redis.external.clientCert.secretName`引用它，并用`certSecretKey`和`keySecretKey`指定键。
* 对于独立 Redis，请在连接 URL 中继续使用 `rediss://`。
* 对于 Redis 集群，`redis.external.cluster.tlsEnabled` 默认为 `true`。确保其未设置为 `false`。

<CodeGroup>
  ```yaml Helm (client Auth) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  redis:
    external:
      enabled: true
      clientCert:
        secretName: "redis-mtls-secret"
        certSecretKey: "tls.crt"
        keySecretKey: "tls.key"
      # Standalone example:
      # connectionUrl: "rediss://host:6380/0?password=<PASSWORD>"
      # Or, for Cluster:
      cluster:
        enabled: true
        tlsEnabled: true
        nodeUris:
          - "redis://redis-node-0:6379"
          - "redis://redis-node-1:6379"
          - "redis://redis-node-2:6379"
        password: "<PASSWORD>"
  ```

  ```yaml Kubernetes Secret (client cert/key) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: Secret
  metadata:
    name: redis-mtls-secret
  type: Opaque
  stringData:
    tls.crt: |
      -----BEGIN CERTIFICATE-----
      <CLIENT_CERT>
      -----END CERTIFICATE-----
    tls.key: |
      -----BEGIN PRIVATE KEY-----
      <CLIENT_KEY>
      -----END PRIVATE KEY-----
  ```
</CodeGroup>

#### 证书卷的 Pod 安全上下文为 mTLS 安装的证书卷受文件访问限制的保护。为了确保所有 LangSmith Pod 都可以读取证书文件，您必须在 Pod 安全上下文中设置`fsGroup: 1000`。

您可以通过以下两种方式之一进行配置：

**选项 1：使用 `commonPodSecurityContext`**

将 `fsGroup` 设置在顶层以将其应用于所有 pod：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonPodSecurityContext:
  fsGroup: 1000
```

**选项 2：添加到各个 pod 安全上下文**

如果您需要更精细的控制，请将 `fsGroup` 单独添加到每个 pod 的安全上下文。请参阅 [mtls configuration example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/mtls_config.yaml) 以获得完整参考。

## IAM 身份验证

从 LangSmith Helm Chart 版本 **0.12.34** 开始，LangSmith 支持独立 Redis 的 IAM 身份验证。从 LangSmith 版本 **v0.16.0** (v16) 开始，Redis Cluster 还支持 IAM 身份验证。这允许您使用云提供商工作负载身份而不是静态密码。<Note>
  具有 IAM 身份验证的 Redis 集群需要 LangSmith v0.16.0 或更高版本。早期的 LangSmith 版本仅支持独立 Redis 的 IAM 身份验证。此外，并非所有云提供商都支持所有 Redis 产品的 IAM 身份验证。检查您的云提供商的文档，以验证 IAM 对您的特定 Redis 设置的支持（例如，GCP 仅支持 Memorystore 集群的 IAM，而不支持独立的 Memorystore）。
</Note>

<Tabs>
  <Tab title="AWS">
    <a />

    ### 用于 Redis IAM 身份验证的 ElastiCache

    ElastiCache for Redis 支持 [IAM authentication](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/auth-iam.html)，它允许您使用 AWS IAM 凭证而不是 Redis AUTH 密码进行身份验证。

    #### 先决条件

    1. 使用 [AWS IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) 或 [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html) 在 Kubernetes 集群中**配置工作负载身份**
    2. **在您的 ElastiCache 实例上启用 IAM 身份验证**并授予对您的工作负载身份的访问权限

    #### 配置

    **独立Redis：**

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    redis:
      external:
        enabled: true
        existingSecretName: "redis-secret"
        iamAuthProvider: "aws"
    ```

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: v1
    kind: Secret
    metadata:
      name: redis-secret
    type: Opaque
    stringData:
      # IAM connection URL - identity as username, no password
      connection_url: "rediss://<iam-identity>@<elasticache-host>:6380"
    ```

    **Redis 集群：**

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    redis:
      external:
        enabled: true
        existingSecretName: "redis-cluster-secret"
        iamAuthProvider: "aws"
        cluster:
          enabled: true
          nodeUrisSecretKey: "redis_cluster_node_uris"
          tlsEnabled: true
    ```

    #### 必需的注释

    您必须将 AWS IRSA 所需的 ServiceAccount 注释应用到连接到 Redis 的所有 LangSmith 组件：

    **部署：** `backend`、`queue`、`platformBackend`、`hostBackend`、`ingestQueue`配置示例：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    backend:
      serviceAccount:
        annotations:
          eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<role-name>"

    queue:
      serviceAccount:
        annotations:
          eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<role-name>"

    platformBackend:
      serviceAccount:
        annotations:
          eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<role-name>"

    hostBackend:
      serviceAccount:
        annotations:
          eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<role-name>"

    ingestQueue:
      serviceAccount:
        annotations:
          eks.amazonaws.com/role-arn: "arn:aws:iam::<account-id>:role/<role-name>"
    ```

    有关可配置服务的完整列表，请参阅[Helm values reference](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml)。
  </Tab>

  <Tab title="GCP">
    <a />

    ### 用于 Redis IAM 身份验证的 Memorystore

    Memorystore for Redis 仅支持[IAM authentication](https://docs.cloud.google.com/memorystore/docs/cluster/about-iam-auth) **集群实例**（不是独立的 Memorystore）。这允许您使用 GCP 服务帐户进行身份验证。

    <Note>
      IAM 身份验证仅适用于 Memorystore 集群，不适用于独立的 Memorystore 实例。
    </Note>

    #### 先决条件

    1. 使用 [GCP Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) 在 Kubernetes 集群中**配置工作负载身份**
    2. **在您的 Memorystore 集群上启用 IAM 身份验证**并授予对您的工作负载身份的访问权限

    #### 配置

    **具有 IAM 的 Memorystore 集群：**

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    redis:
      external:
        enabled: true
        existingSecretName: "redis-cluster-secret"
        iamAuthProvider: "gcp"
        cluster:
          enabled: true
          nodeUrisSecretKey: "redis_cluster_node_uris"
          tlsEnabled: true
    ```

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: v1
    kind: Secret
    metadata:
      name: redis-cluster-secret
    type: Opaque
    stringData:
      redis_cluster_node_uris: '["redis://node-0:6379","redis://node-1:6379","redis://node-2:6379"]'
    ```

    #### 必需的注释

    您必须将 GCP Workload Identity 所需的 ServiceAccount 注释应用到连接到 Redis 的所有 LangSmith 组件：

    **部署：** `backend`、`queue`、`platformBackend`、`hostBackend`、`ingestQueue`

    配置示例：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    backend:
      serviceAccount:
        annotations:
          iam.gke.io/gcp-service-account: "<service-account>@<project>.iam.gserviceaccount.com"

    queue:
      serviceAccount:
        annotations:
          iam.gke.io/gcp-service-account: "<service-account>@<project>.iam.gserviceaccount.com"

    platformBackend:
      serviceAccount:
        annotations:
          iam.gke.io/gcp-service-account: "<service-account>@<project>.iam.gserviceaccount.com"

    hostBackend:
      serviceAccount:
        annotations:
          iam.gke.io/gcp-service-account: "<service-account>@<project>.iam.gserviceaccount.com"

    ingestQueue:
      serviceAccount:
        annotations:
          iam.gke.io/gcp-service-account: "<service-account>@<project>.iam.gserviceaccount.com"
    ```

    有关可配置服务的完整列表，请参阅[Helm values reference](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml)。
  </Tab>

  <Tab title="Azure">
    <a />

    ### 使用 Microsoft Entra 身份验证的 Azure Redis 缓存Azure Redis 缓存支持[Microsoft Entra authentication](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-azure-active-directory-for-authentication)，它允许你使用 Azure 托管标识进行身份验证。

    #### 先决条件

    1. 使用 [Azure Workload Identity](https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview) 在 Kubernetes 集群中**配置工作负载身份**
    2. **在 Azure Cache for Redis 上启用 Microsoft Entra 身份验证**，并授予对工作负载身份的访问权限

    #### 配置

    **独立Redis：**

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    redis:
      external:
        enabled: true
        existingSecretName: "redis-secret"
        iamAuthProvider: "azure"
        # Include if using EnterpriseCluster policy. See the Azure managed Redis section for details.
        # clusterSafeMode: true
    ```

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: v1
    kind: Secret
    metadata:
      name: redis-secret
    type: Opaque
    stringData:
      # IAM connection URL - managed identity as username, no password
      connection_url: "rediss://<managed-identity>@<azure-redis-host>:6380"
    ```

    **Redis 集群：**

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    redis:
      external:
        enabled: true
        existingSecretName: "redis-cluster-secret"
        iamAuthProvider: "azure"
        cluster:
          enabled: true
          nodeUrisSecretKey: "redis_cluster_node_uris"
          tlsEnabled: true
    ```

    #### 必需的注释

    您必须将 Azure Workload Identity 所需的 ServiceAccount 注释和 Pod 标签应用到连接到 Redis 的所有 LangSmith 组件：

    **部署：** `backend`、`queue`、`platformBackend`、`hostBackend`、`ingestQueue`

    配置示例：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    backend:
      serviceAccount:
        annotations:
          azure.workload.identity/client-id: "<managed-identity-client-id>"
      deployment:
        labels:
          azure.workload.identity/use: "true"

    queue:
      serviceAccount:
        annotations:
          azure.workload.identity/client-id: "<managed-identity-client-id>"
      deployment:
        labels:
          azure.workload.identity/use: "true"

    platformBackend:
      serviceAccount:
        annotations:
          azure.workload.identity/client-id: "<managed-identity-client-id>"
      deployment:
        labels:
          azure.workload.identity/use: "true"

    hostBackend:
      serviceAccount:
        annotations:
          azure.workload.identity/client-id: "<managed-identity-client-id>"
      deployment:
        labels:
          azure.workload.identity/use: "true"

    ingestQueue:
      serviceAccount:
        annotations:
          azure.workload.identity/client-id: "<managed-identity-client-id>"
      deployment:
        labels:
          azure.workload.identity/use: "true"
    ```

    有关可配置服务的完整列表，请参阅[Helm values reference](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml)。
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-external-redis.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>