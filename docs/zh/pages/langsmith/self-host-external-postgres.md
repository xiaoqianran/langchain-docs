<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to an external PostgreSQL database | https://docs.langchain.com/langsmith/self-host-external-postgres -->

# 连接到外部 PostgreSQL 数据库

LangSmith 使用 PostgreSQL 数据库作为事务工作负载和操作数据（几乎除了运行之外的所有数据）的主要数据存储。默认情况下，LangSmith自托管将使用内部 PostgreSQL 数据库。但是，您可以配置 LangSmith 使用外部 PostgreSQL 数据库。通过配置外部 PostgreSQL 数据库，您可以更轻松地管理数据库的备份、扩展和其他操作任务。

<Tip>
  **如果您使用托管 PostgreSQL 服务**，我们建议：

  * [Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html) (AWS)
  * [Google Cloud SQL](https://cloud.google.com/curated-resources/cloud-sql#section-1) (GCP)
  * [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql#features) (天蓝色)

  对于特定于云的 IAM/工作负载身份验证，请参阅[IAM authentication section](#iam-authentication)。
</Tip>

## 要求

* 您的 LangSmith 实例将具有网络访问权限的预配置 PostgreSQL 数据库。我们建议使用托管 PostgreSQL 服务，例如：

  * [Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html)
  * [Google Cloud SQL](https://cloud.google.com/curated-resources/cloud-sql#section-1)
  * [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql#features)

* 注意：我们仅正式支持 PostgreSQL 14 或更高版本。

* 我们支持密码和[IAM/Workload Identity](#iam-authentication)认证。

* 对 PostgreSQL 数据库具有管理员访问权限的用户。该用户将用于创建必要的表、索引和架构。* 该用户还需要能够在数据库中创建扩展。我们使用/将尝试安装 `btree_gin`、`btree_gist`、`pgcrypto`、`citext`、`ltree` 和 `pg_trgm` 扩展。

* 如果使用公共架构以外的架构，请确保您没有启用扩展的任何其他架构，或者必须将其包含在搜索路径中。

* 对 pgbouncer 和其他连接池的支持是基于社区的。社区成员报告说 pgbouncer 已使用 `pool_mode` = `session` 以及 `ignore_startup_parameters` 的合适设置（截至撰写本文时，`search_path` 和 `lock_timeout` 需要被忽略）。需要注意避免污染连接池；建议具备一定程度的 PostgreSQL 专业知识。 LangChain Inc 目前没有 pgbouncer 或 amazon rds proxy 或任何其他池化器的正式测试覆盖或商业支持的路线图计划，但欢迎社区通过 GitHub issues 讨论和协作支持。

* 默认情况下，我们建议实例具有**至少 2 个 vCPU 和 8GB 内存**。但是，实际要求将取决于您的工作负载和用户数量。我们建议监控您的 PostgreSQL 实例并根据需要进行扩展。

## 连接字符串You will need to provide a connection string to your PostgreSQL database. This connection string should include the following information:

* 主持人
* 端口
* 数据库
* 用户名
* 密码（如果有任何特殊字符，请确保对其进行 URL 编码） - **注意：** 使用 IAM 身份验证时，连接字符串中不需要密码。更多内容见下文。
* 网址参数

这将采取以下形式：

```
username:password@host:port/database?<url_params>
```

连接字符串示例可能如下所示：

```
myuser:mypassword@myhost:5432/mydatabase?sslmode=disable
```

Without URL parameters, the connection string would look like:

```
myuser:mypassword@myhost:5432/mydatabase
```

For IAM authentication, omit the password and use the identity name as the username:

```
my-workload-identity@myhost:5432/mydatabase?sslmode=require
```

## 配置

With your connection string in hand, you can configure your LangSmith instance to use an external PostgreSQL database. You can do this by modifying the `values` file for your LangSmith Helm Chart installation.

```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
postgres:
  external:
    enabled: true
    connectionUrl: "Your connection url"
```

Once configured, you should be able to reinstall your LangSmith instance. If everything is configured correctly, your LangSmith instance should now be using your external PostgreSQL database.

## PostgreSQL 的 TLS使用此部分为 PostgreSQL 连接配置 TLS。 For mounting internal/public CAs so LangSmith trusts your PostgreSQL server certificate, see [Configure custom TLS certificates](/langsmith/self-host-custom-tls-certificates#mount-internal-cas-for-tls).

### 服务器 TLS（单向）

验证 PostgreSQL 服务器证书：

* 使用 `config.customCa.secretName` 和 `config.customCa.secretKey` 提供 CA 捆绑包。
* Use `sslmode=require` or `sslmode=verify-full`, as well as `sslrootcert=system` to your connection URL.

<Warning>
  仅当您的 PostgreSQL 服务器使用内部或私有 CA 时才安装自定义 CA。 Publicly trusted CAs do not require this configuration.
</Warning>

<CodeGroup>
  ```yaml Helm (server TLS) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  config:
    customCa:
      secretName: "langsmith-custom-ca"  # Secret containing your CA bundle
      secretKey: "ca.crt"    # Key in the Secret with the CA bundle
  postgres:
    external:
      enabled: true
      connectionUrl: "myuser:mypassword@myhost:5432/mydatabase?sslmode=verify-full&sslrootcert=system"
      customTls: true
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

As of LangSmith helm chart version **0.12.29**, we support mTLS for PostgreSQL clients. For server-side authentication in mTLS, use the [Server TLS steps](#server-tls-one-way) (custom CA) in addition to the following client certificate configuration.

如果您的 PostgreSQL 服务器需要客户端证书身份验证：

* 提供包含您的客户端证书和密钥的 Secret。
* Reference it via `postgres.external.clientCert.secretName` and specify the keys with `certSecretKey` and `keySecretKey`.
* Use `sslmode=verify-full` and `sslrootcert=system` in your connection URL.

<CodeGroup>
  ```yaml Helm (client Auth) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  postgres:
    external:
      enabled: true
      connectionUrl: "myuser:mypassword@myhost:5432/mydatabase?sslmode=verify-full&sslrootcert=system"
      customTls: true
      clientCert:
        secretName: "postgres-mtls-secret"
        certSecretKey: "tls.crt"
        keySecretKey: "tls.key"
  ```

  ```yaml Kubernetes Secret (client cert/key) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  apiVersion: v1
  kind: Secret
  metadata:
    name: postgres-mtls-secret
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

#### Pod security context for certificate volumesThe certificate volumes mounted for mTLS are protected by file access restrictions. To ensure all LangSmith pods can read the certificate files, you must set `fsGroup: 1000` in the pod security context.

您可以通过以下两种方式之一进行配置：

**选项 1：使用 `commonPodSecurityContext`**

Set the `fsGroup` at the top level to apply it to all pods:

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
commonPodSecurityContext:
  fsGroup: 1000
```

**Option 2: Add to individual pod security contexts**

If you need more granular control, add the `fsGroup` to each pod's security context individually.有关完整参考，请参阅[mTLS configuration example](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/examples/mtls_config.yaml)。

## IAM 身份验证

As of LangSmith helm chart version **0.12.34**, we support IAM authentication for PostgreSQL. This allows you to use cloud provider workload identity instead of static passwords.

<Warning>
  IAM authentication only handles connection authentication.您可能仍需要在数据库中运行 SQL 命令来创建 IAM 用户/角色并授予其访问 LangSmith 架构所需的权限和特权。
</Warning>

<Tabs>
  <Tab title="AWS">
    ### Amazon RDS IAM 身份验证

    Amazon RDS 支持 [IAM database authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html)，它允许您使用 AWS IAM 凭证而不是数据库密码对 PostgreSQL 实例进行身份验证。

    #### 先决条件1. **Configure workload identity** in your Kubernetes cluster using [AWS IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) or [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html)
    2. **Enable IAM authentication** on your RDS PostgreSQL instance and grant access to your workload identity

    #### 配置

    <Warning>
      如果您在 LangSmith 运行初始迁移后切换到新的 IAM 用户，您可能需要将现有表的所有权转移给新的 IAM 用户。 Otherwise, migrations may fail due to insufficient privileges on tables owned by the previous user.
    </Warning>

    Set the `iamAuthProvider` to `"aws"` and provide an IAM-compatible connection string (without password):

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    postgres:
      external:
        enabled: true
        existingSecretName: "postgres-secret"
        iamAuthProvider: "aws"
    ```

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: v1
    kind: Secret
    metadata:
      name: postgres-secret
    type: Opaque
    stringData:
      # IAM connection URL - note no password, username is the IAM identity name
      connection_url: "<iam-identity-name>@<rds-host>:5432/<database>?sslmode=require"
    ```

    <Warning>
      IAM 身份验证需要 TLS。 You must include `sslmode=require` in your connection string.
    </Warning>

    #### 必需的注释

    You must apply the ServiceAccount annotations required by AWS IRSA to all LangSmith components that connect to PostgreSQL:

    **Deployments:** `backend`, `queue`, `platformBackend`, `hostBackend`, `ingestQueue`

    **工作：** `migrations`、`authBootstrap`、`feedbackConfigMigration`、`feedbackDataMigration`、`e2eTest`

    <Note>
      上面列出的所有作业（`e2eTest` 除外）都使用 `backend` 服务帐户。 `e2eTest`作业使用自己的服务帐户，并且需要单独的注释配置。
    </Note>后端服务的配置示例：

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
    ### Cloud SQL IAM 身份验证

    Cloud SQL 支持 [IAM authentication](https://cloud.google.com/sql/docs/postgres/iam-authentication)，它允许您使用 GCP 服务帐户而不是数据库密码进行身份验证。

    #### 先决条件

    1. 使用 [GCP Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) 在 Kubernetes 集群中**配置工作负载身份**
    2. **在您的 Cloud SQL 实例上启用 IAM 身份验证**并授予对您的工作负载身份的访问权限

    #### 配置

    <Warning>
      如果您在 LangSmith 运行初始迁移后切换到新的 IAM 用户，您可能需要将现有表的所有权转移给新的 IAM 用户。否则，迁移可能会由于前一个用户拥有的表的权限不足而失败。
    </Warning>

    将 `iamAuthProvider` 设置为 `"gcp"` 并提供 IAM 兼容的连接字符串（无密码）：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    postgres:
      external:
        enabled: true
        existingSecretName: "postgres-secret"
        iamAuthProvider: "gcp"
    ```

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: v1
    kind: Secret
    metadata:
      name: postgres-secret
    type: Opaque
    stringData:
      # IAM connection URL - note no password, username is the service account email
      connection_url: "<service-account>@<project>.iam@<cloud-sql-host>:5432/<database>?sslmode=require"
    ```

    <Warning>
      IAM 身份验证需要 TLS。您必须在连接字符串中包含 `sslmode=require`。
    </Warning>

    #### 必需的注释您必须将 GCP Workload Identity 所需的 ServiceAccount 注释应用到连接到 PostgreSQL 的所有 LangSmith 组件：

    **部署：** `backend`、`queue`、`platformBackend`、`hostBackend`、`ingestQueue`

    **工作：** `migrations`、`authBootstrap`、`feedbackConfigMigration`、`feedbackDataMigration`、`e2eTest`

    <Note>
      上面列出的所有作业（`e2eTest` 除外）都使用 `backend` 服务帐户。 `e2eTest`作业使用自己的服务帐户，并且需要单独的注释配置。
    </Note>

    后端服务的配置示例：

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
    ### 具有 Microsoft Entra 身份验证的 Azure Database for PostgreSQL

    Azure Database for PostgreSQL 支持 [Microsoft Entra authentication](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-azure-ad-authentication)，它允许你使用 Azure 托管标识而不是数据库密码进行身份验证。

    #### 先决条件

    1. 使用 [Azure Workload Identity](https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview) 在 Kubernetes 集群中**配置工作负载身份**
    2. **在 Azure Database for PostgreSQL 实例上启用 Microsoft Entra 身份验证**并授予对工作负载身份的访问权限

    #### 配置<Warning>
      如果您在 LangSmith 运行初始迁移后切换到新的 IAM 用户，您可能需要将现有表的所有权转移给新的 IAM 用户。否则，迁移可能会由于前一个用户拥有的表的权限不足而失败。
    </Warning>

    将 `iamAuthProvider` 设置为 `"azure"` 并提供 IAM 兼容的连接字符串（无密码）：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    postgres:
      external:
        enabled: true
        existingSecretName: "postgres-secret"
        iamAuthProvider: "azure"
    ```

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    apiVersion: v1
    kind: Secret
    metadata:
      name: postgres-secret
    type: Opaque
    stringData:
      # IAM connection URL - note no password, username is the managed identity name
      connection_url: "<managed-identity-name>@<azure-postgres-host>:5432/<database>?sslmode=require"
    ```

    <Warning>
      IAM 身份验证需要 TLS。您必须在连接字符串中包含 `sslmode=require`。
    </Warning>

    #### 必需的注释

    您必须将 Azure Workload Identity 所需的 ServiceAccount 注释和 pod 标签应用到连接到 PostgreSQL 的所有 LangSmith 组件：

    **部署：** `backend`、`queue`、`platformBackend`、`hostBackend`、`ingestQueue`

    **工作：** `migrations`、`authBootstrap`、`feedbackConfigMigration`、`feedbackDataMigration`、`e2eTest`

    <Note>
      上面列出的所有作业（`e2eTest` 除外）都使用 `backend` 服务帐户。对于这些作业，您只需要配置 pod 标签（Azure 要求 pod 上使用`azure.workload.identity/use: "true"`）。 `e2eTest`作业使用自己的服务帐户，并且需要单独的注释配置。
    </Note>

    后端服务的配置示例：

    ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    backend:
      serviceAccount:
        annotations:
          azure.workload.identity/client-id: "<managed-identity-client-id>"
      deployment:
        labels:
          azure.workload.identity/use: "true"
      migrations:
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
    ```有关可配置服务的完整列表，请参阅[Helm values reference](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/values.yaml)。
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-external-postgres.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>