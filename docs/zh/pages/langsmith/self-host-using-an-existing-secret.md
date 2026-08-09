<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use an existing secret for your installation (Kubernetes) | https://docs.langchain.com/langsmith/self-host-using-an-existing-secret -->

# 使用现有的密钥进行安装 (Kubernetes)

默认情况下，LangSmith 将提供多个 Kubernetes 密钥来存储敏感信息，例如许可证密钥、盐和其他配置参数。但是，您可能希望使用已在 Kubernetes 集群中创建的现有密钥（或通过某种密钥运算符配置）。如果您想要以集中方式管理敏感信息或者您有特定的安全要求，这可能会很有用。

默认情况下，我们将提供与 LangSmith 的不同组件相对应的以下秘密：

* `langsmith-secrets`：此秘密包含许可证密钥和其他一些基本配置参数。首先，请使用 [secrets template](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/templates/secrets.yaml)。
* `langsmith-redis`：此密钥包含 Redis 连接字符串（或节点 URI，如果使用 Redis 集群）和密码。首先，请使用 [Redis secrets template](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/templates/redis/secrets.yaml)。
* `langsmith-postgres`：此机密包含 Postgres 连接字符串和密码。首先，请使用 [Postgres secrets template](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/templates/postgres/secrets.yaml)。
* `langsmith-clickhouse`：此秘密包含 ClickHouse 连接字符串和密码。首先，请使用 [ClickHouse secrets template](https://github.com/langchain-ai/helm/blob/main/charts/langsmith/templates/clickhouse/secrets.yaml)。

＃＃ 要求* 现有的 Kubernetes 集群
* 一种在集群中创建 Kubernetes 机密的方法。这可以使用 `kubectl`、Helm 图表或像 [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) 这样的秘密运算符来完成

## 参数

您将需要创建自己的 Kubernetes 机密，这些机密遵循 LangSmith Helm Chart 提供的机密结构。

<Warning>
  这些机密必须与 LangSmith Helm Chart 提供的机密具有相同的结构（请参阅上面的链接以查看具体的机密）。如果您错过任何必需的密钥，您的 LangSmith 实例可能无法正常工作。
</Warning>

一个秘密示例可能如下所示：

<Warning>
  设置`api_key_salt`一次，不要更改。该值用于对所有静态 API 密钥进行哈希处理。轮换它将使您组织中的每个现有 API 密钥永久失效，从而要求所有用户重新生成其密钥。
</Warning>

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
apiVersion: v1
kind: Secret
metadata:
  name: langsmith-secrets
  namespace: langsmith
stringData:
  oauth_client_id: foo
  oauth_client_secret: foo
  oauth_issuer_url: foo
  langsmith_license_key: foo
  langgraph_cloud_license_key: foo
  api_key_salt: foo
  jwt_secret: foo
  initial_org_admin_password: foo
  blob_storage_access_key: foo
  blob_storage_access_key_secret: foo
  azure_storage_account_key: foo
  azure_storage_connection_string: foo
  agent_builder_encryption_key: foo
  insights_encryption_key: foo
  # Chat (formerly Polly)
  polly_encryption_key: foo
  # Required only when enabling Engine.
  engine_encryption_key: foo
  # Optional; include only while rotating engine_encryption_key. Accepted for
  # decryption only, so runs encrypted just before the swap still complete.
  engine_encryption_key_previous: foo
  # Optional. Ed25519/OKP JWKS (JSON) that signs OAuth Authorization Server /
  # Remote MCP tokens. Required only to enable the LangSmith Remote MCP server
  # (see /langsmith/langsmith-remote-mcp); omit it otherwise.
  langsmith_signing_jwks: foo
  # Required only when enabling LangSmith Sandboxes.
  sandbox_x_service_auth_jwt_secret: foo
  # Ed25519 private JWK.
  sandbox_callback_signing_jwk: '<ed25519-private-jwk>'
  # Optional; include only while rotating sandbox_x_service_auth_jwt_secret.
  sandbox_x_service_auth_jwt_secret_previous: foo
```

## 配置

配置这些机密后，您可以将 LangSmith 实例配置为直接使用这些机密，以避免通过明文传递机密值。您可以通过修改 LangSmith Helm Chart 安装的 `langsmith_config.yaml` 文件来完成此操作。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  existingSecretName: "langsmith-secrets" # The name of the secret that contains the license key and other basic configuration parameters
redis:
  external:
    enabled: true # Set to true to use an external Redis instance. This secret is only needed if you are using an external Redis instance
    existingSecretName: "langsmith-redis" # The name of the secret that contains the Redis connection string and password
postgres:
  external:
    enabled: true # Set to true to use an external Postgres instance. This secret is only needed if you are using an external Postgres instance
    existingSecretName: "langsmith-postgres" # The name of the secret that contains the Postgres connection string and password
clickhouse:
  external:
    enabled: true # Set to true to use an external ClickHouse instance. This secret is only needed if you are using an external ClickHouse instance
    existingSecretName: "langsmith-clickhouse" # The name of the secret that contains the ClickHouse connection string and password
```配置完成后，您将需要更新 LangSmith 安装。您可以按照[upgrade guide](/langsmith/self-host-upgrades)。如果一切配置正确，您的 LangSmith 实例现在应该可以通过 Ingress 访问。您可以运行以下命令来检查您的机密是否被正确使用：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
kubectl describe deployment langsmith-backend | grep -i <secret-name>
```

您应该在输出中看到类似这样的内容：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
POSTGRES_DATABASE_URI:                    <set to the key 'connection_url' in secret <your-secret-name>  Optional: false
CLICKHOUSE_DB:                            <set to the key 'clickhouse_db' in secret <your-secret-name>   Optional: false
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-using-an-existing-secret.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>