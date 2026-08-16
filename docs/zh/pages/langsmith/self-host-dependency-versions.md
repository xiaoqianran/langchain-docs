<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Minimum versions for self-hosting dependencies | https://docs.langchain.com/langsmith/self-host-dependency-versions -->

# 自托管依赖项的最低版本

此页面列出了自托管 LangSmith 使用的数据库、工具和基础设施的最低支持版本。在部署或升级之前安装满足或超过最低要求的版本。不支持使用低于最低版本的版本，并且可能会导致安装或运行时失败。

<Tip>
如果您使用的是托管服务（例如 Amazon RDS、Google Cloud SQL 或 Azure 数据库），请选择此处列出的最低版本或更高版本。有关连接和身份验证的详细信息，请参阅链接的“外部服务”页面。
</Tip>

## 数据存储|依赖|最低版本 |笔记|
|------------|--------------------|--------|
| [PostgreSQL](/langsmith/self-host-external-postgres) | 14 | 14操作数据的主要关系存储。 LangSmith 和独立代理服务器部署都是必需的。用于安装 `btree_gin`、`btree_gist`、`pgcrypto`、`citext`、`ltree` 和 `pg_trgm` 扩展。 |
| [Redis](/langsmith/self-host-external-redis) | 5 |用于排队和缓存。独立模式和 Redis 集群模式均受支持。 |
| [Valkey](/langsmith/self-host-external-redis) | 8 |官方支持作为 Redis 的直接替代品。独立模式和集群模式均受支持。 |
| [ClickHouse](/langsmith/self-host-external-clickhouse) | [LangSmith Helm chart](https://github.com/langchain-ai/helm/releases) 或更高 | 中指定的版本存储痕迹和反馈。 ClickHouse 版本 >= 24.2 需要 LangSmith v0.6 或更高版本。不支持降级。 |

<Warning>
**Redis < 5 and PostgreSQL < 14 are not supported.** A LangSmith installation pointed at an older Redis or PostgreSQL instance may fail to start or behave unpredictably. Upgrade your datastore before installing or upgrading LangSmith.
</Warning>

## 计算和编排

|依赖|最低版本 |笔记|
|------------|--------------------|--------|
| [Kubernetes](/langsmith/kubernetes) | [upstream Kubernetes release cycle](https://kubernetes.io/releases/) 支持的任何版本 | LangSmith 定期在 GKE、EKS、AKS、Minikube 和 Kind 上进行测试。 |
| [OpenShift](/langsmith/kubernetes) | 4.14 | 4.14作为 LangSmith 的 Kubernetes 发行版受支持。 |
| [Helm](https://helm.sh/docs/intro/install/) | 3 |用于安装和升级LangSmith Helm图表。 |
|码头工人 |兼容[Docker Compose v2](https://docs.docker.com/compose/)的版本 |基于 Docker 的独立代理服务器部署所需。 |## LangSmith 图表和平台

|依赖|最低版本 |笔记|
|------------|--------------------|--------|
| [LangSmith Helm chart](https://github.com/langchain-ai/helm/releases) |最新稳定版本 |我们建议固定到最新的稳定图表版本。请参阅 [self-hosted changelog](/langsmith/self-hosted-changelog) 了解每个版本的升级说明。 |
|出口至 `https://beacon.langchain.com` | LangSmith 0.9.0 或更高版本 |除非在 [offline mode](/langsmith/self-host-egress) 中运行，否则许可证验证和使用报告是必需的。 |

## 这些版本的执行地点

- PostgreSQL`>= 14`：参考[Connect to an external PostgreSQL database](/langsmith/self-host-external-postgres#requirements)。
- Redis `>= 5` 和 Valkey `8`：参考[Connect to an external Redis or Valkey database](/langsmith/self-host-external-redis#requirements)。
- ClickHouse：使用[LangSmith Helm chart](https://github.com/langchain-ai/helm/releases)中指定的版本或更高版本：参考[Connect to an external ClickHouse database](/langsmith/self-host-external-clickhouse#requirements)。
- Kubernetes集群必备条件：参考[Self-host LangSmith on Kubernetes](/langsmith/kubernetes#prerequisites)。

如果您不确定当前正在运行哪个版本，请联系您的数据库管理员或参考云提供商的控制台。如果您需要在升级 LangSmith 之前升级依赖项，请参阅供应商的文档。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-dependency-versions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>