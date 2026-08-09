<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to an external ClickHouse database | https://docs.langchain.com/langsmith/self-host-external-clickhouse -->

# 连接到外部 ClickHouse 数据库

ClickHouse是一个高性能、面向列的数据库系统。它允许快速摄取数据并针对分析查询进行了优化。

LangSmith 使用 ClickHouse 作为跟踪和反馈的主要数据存储。默认情况下，自托管 LangSmith 将使用与 LangSmith 实例捆绑在一起的内部 ClickHouse 数据库。它作为有状态集在与 LangSmith 应用程序相同的 Kubernetes 集群中运行。

但是，您可以将 LangSmith 配置为使用外部 ClickHouse 数据库，以便于管理和扩展。通过配置外部 ClickHouse 数据库，您可以管理数据库的备份、扩展和其他操作任务。虽然 ClickHouse 还不是 Azure、AWS 或 Google Cloud 中的本机服务，但您可以通过以下方式使用外部 ClickHouse 数据库运行 LangSmith：

* [LangSmith-managed ClickHouse](/langsmith/langsmith-managed-clickhouse)

* 直接或通过云提供商市场配置[ClickHouse Cloud](https://clickhouse.cloud/)：

  * [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud?tab=Overview)
  * [Google Cloud Marketplace](https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse-cloud)
  * [AWS Marketplace](https://aws.amazon.com/marketplace/seller-profile?id=adb43736-8b95-4d49-8009-3693cbee8578)

* 在您的云提供商的虚拟机上<Note>
  使用前两个选项（LangSmith 管理的 ClickHouse 或 ClickHouse Cloud）将在您的 VPC 外部配置 Clickhouse 服务。但是，这两个选项都支持私有端点，这意味着您可以将流量定向到 ClickHouse 服务，而无需将其暴露到公共互联网（例如通过 AWS PrivateLink 或 GCP Private Service Connect）。

  此外，敏感信息可以配置为不存储在 Clickhouse 中。请通过[support.langchain.com](https://support.langchain.com)联系支持人员以获取更多信息。
</Note>

## 要求

* 您的 LangSmith 应用程序将可以通过网络访问已配置的 ClickHouse 实例（请参阅上面的选项）。
* 对 ClickHouse 数据库具有管理员访问权限的用户。该用户将用于创建必要的表、索引和视图。
* 我们支持独立的 ClickHouse 和外部管理的集群部署。对于集群部署，请确保所有节点都运行相同的版本。请注意，捆绑的 ClickHouse 安装不支持集群设置。
* 我们仅支持 ClickHouse 版本 >= 23.9。使用 ClickHouse 版本 >= 24.2 需要 LangSmith v0.6 或更高版本。<Warning>
  将 ClickHouse 降级到早期版本可能会导致系统表数据损坏并导致严重停机。如果您需要有关 ClickHouse 版本更改的帮助或在升级后遇到问题，请在尝试降级之前通过 [support.langchain.com](https://support.langchain.com) 联系支持人员。
</Warning>

* 我们依赖于在 ClickHouse 实例上设置的一些配置参数。这些详细信息如下：

```xml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
<profiles>
  <default>
      <async_insert>1</async_insert> # Turn on async insert
      <async_insert_max_data_size>25000000</async_insert_max_data_size> # Flush data to disk after 25MB. You may need to adjust this based on your workload.
      <wait_for_async_insert>0</wait_for_async_insert> # Disable waiting for async insert by default
      <parallel_view_processing>1</parallel_view_processing> # Enable parallel view processing
      <materialize_ttl_after_modify>0</materialize_ttl_after_modify> # Disable TTL materialization after modify
      <wait_for_async_insert_timeout>120</wait_for_async_insert_timeout> # Set the timeout for waiting for async insert
      <lightweight_deletes_sync>0</lightweight_deletes_sync> # Disable lightweight deletes sync
      <allow_materialized_view_with_bad_select>1</allow_materialized_view_with_bad_select> # Allow materialized views with legacy SELECT statements that cause CH to fail
  </default>
</profiles>
```

<Warning>
  我们的系统已经过调整，可以使用上述配置参数。更改这些参数可能会导致意外行为。
</Warning>

## HA 复制 Clickhouse 集群

<Warning>
  默认情况下，上述设置过程仅适用于单节点 Clickhouse 集群。
</Warning>

如果您想使用多节点 Clickhouse 集群进行 HA，我们可以通过额外的所需配置来支持这一点。此设置可以使用具有多个节点的 Clickhouse 集群，其中数据通过 Zookeeper 或 Clickhouse Keeper 复制。有关 Clickhouse 复制的更多信息，请参阅[Clickhouse Data Replication Docs](https://clickhouse.com/docs/architecture/replication)。

为了使用复制的多节点 Clickhouse 设置来设置 LangSmith：* 您需要有一个使用 Keeper 或 Zookeeper 设置的 Clickhouse 集群，用于数据复制和适当的设置。参见[Clickhouse Replication Setup Docs](https://clickhouse.com/docs/architecture/replication)。
* 您需要在 [LangSmith Configuration](#configuration) 部分中设置集群设置，特别是 `cluster` 设置以匹配您的 Clickhouse 集群名称。这将在运行 Clickhouse 迁移时使用 `Replicated` 表引擎。
* 如果除了 HA 之外，您还想在 Clickhouse 节点之间进行负载平衡（以分配读取或写入），我们建议使用负载平衡器或 DNS 负载平衡在 Clickhouse 服务器之间进行循环。
* **注意**：在首次启动 LangSmith 并运行 Clickhouse 迁移之前，您需要启用 `cluster` 设置。这是一个要求，因为表引擎需要创建为`Replicated`表引擎而不是非复制引擎类型。

在启用 `cluster` 的情况下运行迁移时，迁移将创建 `Replicated` 表引擎风格。这意味着数据将在集群中的服务器之间复制。这是主-主设置，任何服务器都可以处理读取、写入或合并。<Note>
  有关复制 ClickHouse 集群的示例设置，请参阅 LangSmith Helm 图表存储库中示例下的 [replicated ClickHouse section](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/replicated-clickhouse/README.md)。
</Note>

## LangSmith 管理的 ClickHouse

* 如果使用 LangSmith 管理的 ClickHouse，您需要在 LangSmith VPC 和 ClickHouse VPC 之间设置 VPC 对等连接。请通过[support.langchain.com](https://support.langchain.com)联系支持人员以获取更多信息。
* 您还需要设置 Blob 存储。您可以在 [Blob Storage documentation](/langsmith/self-host-blob-storage) 中阅读有关 Blob 存储的更多信息。

<Note>
  由 LangSmith 管理的 ClickHouse 安装使用 SharedMerge 引擎，该引擎会自动对它们进行集群并将计算与存储分开。
</Note>

欲了解更多信息，请参阅[managed ClickHouse](/langsmith/langsmith-managed-clickhouse)页面。

## 参数

您需要向 LangSmith 安装提供多个参数来配置外部 ClickHouse 数据库。这些参数包括：* **主机**：ClickHouse数据库的主机名或IP地址
* **HTTP Port**：ClickHouse数据库监听HTTP连接的端口
* **本机端口**：ClickHouse数据库监听[native connections](https://clickhouse.com/docs/en/interfaces/tcp)的端口
* **数据库**：LangSmith 应使用的 ClickHouse 数据库的名称
* **用户名**：用于连接 ClickHouse 数据库的用户名
* **密码**：用于连接 ClickHouse 数据库的密码
* **集群（可选）**：如果使用外部 Clickhouse 集群，则为 ClickHouse 集群的名称。设置后，LangSmith 将在集群上运行迁移并跨实例复制数据。

<Warning>
  集群部署的重要注意事项：

  * 必须在新架构上配置集群设置 - 现有的独立 ClickHouse 实例无法转换为集群模式。

  * 仅外部管理的 ClickHouse 部署支持集群。它与捆绑的 ClickHouse 安装不兼容，因为这些安装不包括所需的 ZooKeeper 配置。

  * 当使用集群部署时，LangSmith会自动：* 在集群中的所有节点上运行数据库迁移
    * 配置表以进行跨集群的数据复制

  请注意，虽然数据跨节点复制，但 LangSmith 不配置分布式表或处理查询路由 - 查询将定向到指定主机。如果需要，您将需要在基础设施级别处理任何负载平衡或查询分配。
</Warning>

## 配置

有了这些参数，您就可以配置 LangSmith 实例以使用预配的 ClickHouse 数据库。您可以通过修改 LangSmith Helm Chart 安装的 `config.yaml` 文件来完成此操作。

```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
clickhouse:
  external:
    enabled: true
    host: "host"
    port: "http port"
    nativePort: "native port"
    user: "default"
    password: "password"
    database: "default"
    tls: false
    cluster: "my_cluster_name"  # Optional: Set this if using an external Clickhouse cluster
```

配置完成后，您应该能够重新安装 LangSmith 实例。如果一切配置正确，您的 LangSmith 实例现在应该使用外部 ClickHouse 数据库。

## TLS 与 ClickHouse

使用此部分为 ClickHouse 连接配置 TLS。要安装内部/公共 CA 以便 LangSmith 信任您的 ClickHouse 服务器证书，请参阅 [Configure custom TLS certificates](/langsmith/self-host-custom-tls-certificates#mount-internal-cas-for-tls)。

### 服务器 TLS（单向）

要为 ClickHouse 连接启用 TLS：* 在您的配置中设置`tls: true`（或将`tlsSecretKey`与外部秘密一起使用）。
* 使用适当的 TLS 端口（通常为 HTTP 连接使用 `8443`，为本机 TCP 连接使用 `9440`）。
* 如果使用内部 CA，请使用 `config.customCa.secretName` 和 `config.customCa.secretKey` 提供 CA 捆绑包。

<Warning>
  仅当您的 ClickHouse 服务器使用内部或私有 CA 时才挂载自定义 CA。公众信任的 CA 不需要此配置。
</Warning>

<CodeGroup>
  ```yaml Helm (server TLS) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  config:
    customCa:
      secretName: "langsmith-custom-ca"  # Secret containing your CA bundle
      secretKey: "ca.crt"    # Key in the Secret with the CA bundle
  clickhouse:
    external:
      enabled: true
      host: "your-clickhouse-host.example.com"
      port: "8443"
      nativePort: "9440"
      user: "default"
      password: "password"
      database: "default"
      tls: true
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

从 LangSmith Helm Chart 版本 **0.12.29** 开始，我们支持 ClickHouse 客户端的 mTLS。对于 mTLS 中的服务器端身份验证，除了以下客户端证书配置之外，还可以使用 [Server TLS steps](#server-tls-one-way)（自定义 CA）。

如果您的 ClickHouse 服务器需要客户端证书身份验证：

* 提供包含您的客户端证书和密钥的 Secret。
* 通过`clickhouse.external.clientCert.secretName`引用它，并用`certSecretKey`和`keySecretKey`指定键。

<CodeGroup>
  ```yaml Helm (client auth) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  clickhouse:
    external:
      enabled: true
      host: "your-clickhouse-host.example.com"
      port: "8443"
      nativePort: "9440"
      user: "default"
      password: "password"
      database: "default"
      tls: true
      clientCert:
        secretName: "clickhouse-client-cert"
        certSecretKey: "tls.crt"
        keySecretKey: "tls.key"
  ```

  ```yaml Kubernetes Secret (client cert/key) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: Secret
  metadata:
    name: clickhouse-client-cert
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

#### 用于迁移的非 TLS 本机端口<Warning>
  将 mTLS 与 ClickHouse 结合使用时，您必须**为我们的迁移作业保持开放的非 TLS 本机 (TCP) 端口**，该作业在 helm 安装和升级时运行。应用程序本身不会通过此端口进行通信，它**仅由迁移作业使用**。
</Warning>

默认情况下，迁移作业连接到端口`9000`进行迁移。如果您的 ClickHouse 实例使用不同的非 TLS 本机端口，您可以使用 `CLICKHOUSE_MIGRATE_NATIVE_PORT` 环境变量对其进行配置：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
backend:
  clickhouseMigrations:
    extraEnv:
      - name: CLICKHOUSE_MIGRATE_NATIVE_PORT
        value: "9000"  # Change to your non-TLS native port
```

#### 证书卷的 Pod 安全上下文

为 mTLS 安装的证书卷受文件访问限制的保护。为了确保所有 LangSmith pod 都可以读取证书文件，您必须在 pod 安全上下文中设置`fsGroup: 1000`。

您可以通过以下两种方式之一进行配置：

**选项 1：使用 `commonPodSecurityContext`**

将 `fsGroup` 设置在顶层以将其应用于所有 pod：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonPodSecurityContext:
  fsGroup: 1000
```

**选项 2：添加到各个 pod 安全上下文**

如果您需要更精细的控制，请将 `fsGroup` 单独添加到每个 pod 的安全上下文。请参阅 [mTLS configuration example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/mtls_config.yaml) 以获得完整参考。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-external-clickhouse.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>