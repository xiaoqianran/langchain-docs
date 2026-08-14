<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure IAM authentication for data stores | https://docs.langchain.com/langsmith/configure-iam-auth -->

# 为数据存储配置 IAM 身份验证

配置代理服务器以使用云工作负载身份进行 PostgreSQL 和 Redis 身份验证。

代理服务器可以使用云工作负载身份在运行时生成短期 PostgreSQL 和 Redis 凭据。这将从部署配置中删除静态数据库和缓存密码。连接和池行为保持不变。

<Note>
  数据存储 IAM 身份验证需要 `langgraph-api>=0.12.0`。
</Note>

## 支持的服务|供应商价值 | PostgreSQL | Redis |凭证来源|
| -------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `aws` | Amazon RDS 或 Aurora PostgreSQL | Amazon ElastiCache 预配置缓存集群或复制组 | AWS SDK默认凭证链|
| `azure` | Azure Database for PostgreSQL 灵活服务器 | Azure 托管 Redis 或 Azure Redis 缓存 |微软 Entra `DefaultAzureCredential` |
| `gcp` | PostgreSQL 的云 SQL | Redis 集群的内存存储 | Google 应用程序默认凭据 (ADC) |

<Warning>
  GCP PostgreSQL 提供商支持 Cloud SQL。它不支持 AlloyDB，这需要不同的令牌范围。
</Warning>

提供者设置仅控制身份验证。在启动代理服务器之前配置网络访问、TLS、数据库用户、缓存用户和提供程序权限。## 启用 IAM 身份验证

要启用 IAM 身份验证：

1. 在托管数据存储上启用 IAM 或基于身份的身份验证。
2. 创建数据库或缓存主体并仅向其授予代理服务器所需的权限。
3. 使工作负载身份凭证可供每个代理服务器 API 和队列进程使用。
4. 设置包含主体名称但不包含静态密码的连接 URI。
5. 将相应的提供者选择器设置为`aws`、`azure`或`gcp`：

   ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   AGENT_POSTGRES_IAM_AUTH_PROVIDER=<provider>
   AGENT_REDIS_IAM_AUTH_PROVIDER=<provider>
   ```

您可以为 PostgreSQL、Redis 或两者启用 IAM 身份验证。取消设置选择器后，代理服务器将继续使用该数据存储的连接 URI 中的密码。

将这些连接 URI 变量用于您的部署类型：

|部署| PostgreSQL URI | Redis URI |
| ------------------------------------------- | -------------------- | ------------------ |
|独立代理服务器| `DATABASE_URI` | `REDIS_URI` |
|带有控制平面的自托管部署 | `POSTGRES_URI_CUSTOM` | `REDIS_URI_CUSTOM` |

连接 URI 必须满足以下要求：* **传输安全**：对于 PostgreSQL 使用`sslmode=require`或更严格的验证模式，对于 Redis 使用`rediss://`。
* **字符编码**：对用户名中的 URI 保留字符进行百分比编码，例如 `@` 为 `%40`。
* **私有证书颁发机构**：如果 Redis TLS 使用私有证书颁发机构，请将 `REDIS_TLS_CA_CERT` 设置为 base64 编码的 PEM CA 捆绑包。
* **集群模式**：如果Redis服务使用集群模式，还要设置`REDIS_CLUSTER=true`。

## 配置AWS

代理服务器使用 AWS 开发工具包默认凭证链创建 RDS 身份验证令牌和 ElastiCache SigV4 身份验证令牌。

配置代理服务器之前：

* [Enable IAM database authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html) 适用于 RDS 或 Aurora PostgreSQL。授予数据库用户 `rds_iam` 角色，并为该用户授予工作负载身份 `rds-db:connect`。
* [Enable IAM authentication](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/auth-iam.html) 适用于 ElastiCache 用户。为 ElastiCache 缓存或复制组以及 ElastiCache 用户授予工作负载身份 `elasticache:Connect`。
* 通过 EKS Pod Identity、服务账户的 IAM 角色 (IRSA)、实例配置文件或其他 AWS 开发工具包凭证源配置 AWS 凭证。将 `AWS_REGION` 或 `AWS_DEFAULT_REGION` 设置为数据存储的区域。

在连接 URI 中设置数据库用户名：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AWS_REGION=<region>
AGENT_POSTGRES_IAM_AUTH_PROVIDER=aws
AGENT_REDIS_IAM_AUTH_PROVIDER=aws
DATABASE_URI="postgresql://<rds-user>@<rds-endpoint>:5432/<database>?sslmode=require"
REDIS_URI="rediss://<elasticache-iam-user>@<elasticache-endpoint>:6379"
```Redis 用户名必须与启用 IAM 的 ElastiCache 用户匹配。 Agent Server 支持配置的 ElastiCache 缓存集群和复制组。 ElastiCache IAM 身份验证需要传输中加密以及 Valkey 7.2 或更高版本或者 Redis OSS 7.0 或更高版本。

## 配置 Azure

代理服务器使用 `DefaultAzureCredential` 获取 PostgreSQL 和 Redis 的 Microsoft Entra 令牌。凭据链支持 Azure 工作负载标识、托管标识和服务主体。

配置代理服务器之前：

* [Configure Microsoft Entra authentication](https://learn.microsoft.com/azure/postgresql/security/security-connect-with-managed-identity) 适用于 Azure Database for PostgreSQL 灵活服务器。为托管标识或服务主体创建数据库角色。使用该角色名称作为 PostgreSQL URI 用户名。
* [Configure Microsoft Entra authentication](https://learn.microsoft.com/azure/redis/entra-for-authentication) 以及 Azure 托管 Redis 的数据访问策略。使用托管标识或服务主体对象 ID 作为 Redis URI 用户名。
* 为每个代理服务器工作负载配置 Azure 工作负载标识、托管标识或其他 `DefaultAzureCredential` 源。

在连接 URI 中设置 Microsoft Entra 主体标识符：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AGENT_POSTGRES_IAM_AUTH_PROVIDER=azure
AGENT_REDIS_IAM_AUTH_PROVIDER=azure
DATABASE_URI="postgresql://<entra-principal-name>@<postgres-host>:5432/<database>?sslmode=require"
REDIS_URI="rediss://<entra-object-id>@<redis-host>:<port>"
```

在集群模式下使用 Azure 托管 Redis 时设置 `REDIS_CLUSTER=true`。代理服务器刷新 Microsoft Entra 令牌并在令牌过期之前重新验证打开的 Redis 连接。## 配置 GCP

代理服务器使用 Google ADC 获取 Cloud SQL 登录令牌和 Memorystore 访问令牌。 ADC 支持 GKE 工作负载身份联合、附加服务帐户、服务帐户模拟和`GOOGLE_APPLICATION_CREDENTIALS`。

配置代理服务器之前：

* [Configure Cloud SQL IAM database authentication](https://cloud.google.com/sql/docs/postgres/iam-logins)，添加 IAM 主体作为数据库用户，并授予其`roles/cloudsql.instanceUser`。单独授予数据库权限。
* [Configure Memorystore IAM authentication](https://cloud.google.com/memorystore/docs/cluster/manage-iam-auth) 并授予工作负载身份`roles/redis.dbConnectionUser`。
* 为每个代理服务器工作负载配置 ADC。优先选择工作负载身份联合或附加服务帐户而不是服务帐户密钥。

在 PostgreSQL URI 中设置 Cloud SQL IAM 数据库用户。 Memorystore 仅支持 `default` Redis 用户名：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AGENT_POSTGRES_IAM_AUTH_PROVIDER=gcp
AGENT_REDIS_IAM_AUTH_PROVIDER=gcp
DATABASE_URI="postgresql://<cloud-sql-iam-user>@<cloud-sql-host>:5432/<database>?sslmode=require"
REDIS_URI="rediss://default@<memorystore-discovery-endpoint>:<port>"
REDIS_CLUSTER=true
```

对于服务帐号，Cloud SQL 数据库用户名是其电子邮件地址，不带 `.gserviceaccount.com` 后缀。

## 配置独立 Helm 图表

对于 Kubernetes 上的 [standalone Agent Server deployment](/langsmith/deploy-standalone-server)，请在每个代理服务器工作负载上设置提供程序选择器。如果启用了单独队列部署，请使用相同的身份和环境变量配置 API 和队列部署。

以下示例将 AWS 用于两个数据存储。使用其他云提供商时，将每个提供商值设置为 `azure` 或 `gcp`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
postgres:
  external:
    enabled: true
    connectionUrl: "postgresql://<database-user>@<postgres-host>:5432/<database>?sslmode=require"
redis:
  external:
    enabled: true
    connectionUrl: "rediss://<redis-user>@<redis-host>:<port>"

apiServer:
  deployment:
    extraEnv:
      - name: AGENT_POSTGRES_IAM_AUTH_PROVIDER
        value: "aws"
      - name: AGENT_REDIS_IAM_AUTH_PROVIDER
        value: "aws"

queue:
  enabled: true
  deployment:
    extraEnv:
      - name: AGENT_POSTGRES_IAM_AUTH_PROVIDER
        value: "aws"
      - name: AGENT_REDIS_IAM_AUTH_PROVIDER
        value: "aws"
```使用云提供商的工作负载身份机制配置 `apiServer.serviceAccount` 和 `queue.serviceAccount`。两个工作负载都必须能够获取凭据并连接到数据存储。

## 另请参阅

* [Self-host standalone servers](/langsmith/deploy-standalone-server)
* [Self-hosted Agent Server environment variables](/langsmith/env-var-self-hosted)
* [Self-hosted platform features](/langsmith/self-hosted-platform-features)
* [Configure Agent Server for scale](/langsmith/agent-server-scale)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/configure-iam-auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>