<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy LangSmith with Terraform | https://docs.langchain.com/langsmith/self-host-terraform -->

# 使用 Terraform 部署 LangSmith

使用 LangChain 的生产就绪 Terraform 模块在 AWS、Azure 或 GCP 上配置自托管的 LangSmith。

<Info>
  自托管 LangSmith 是企业计划的附加产品，专为 LangChain 最大、最注重安全的客户而设计。请参阅[pricing](https://www.langchain.com/pricing)了解详细信息，或参阅[contact sales](https://www.langchain.com/contact-sales)申请试用许可证密钥。
</Info>

LangChain 在 [github.com/langchain-ai/terraform](https://github.com/langchain-ai/terraform) 发布了 [LangSmith self-hosted](/langsmith/self-hosted) 生产就绪的 Terraform 模块。这些模块提供云基础（网络、集群、数据库、缓存、对象存储、机密、DNS）并使用合理的默认值安装 LangSmith Helm 图表。

当您从一开始就希望基础架构即代码时，请使用此路径。如果您已经使用自己的工具管理云基础设施并且只需要安装应用程序，请改为遵循 [Helm installation guide](/langsmith/kubernetes)。

<Tip>
  **更喜欢 Helm？** [Kubernetes setup guide](/langsmith/kubernetes) 会针对任何符合要求的集群使用 Helm 进行安装，无需 Terraform。 Terraform 路径将集群配置、秘密连接和 Helm 发布捆绑到一个工作流程中。
</Tip>

## 选择一个提供商

<CardGroup>
  <Card title="AWS (EKS)" icon="brand-aws" href="/langsmith/self-host-terraform-aws-deploy">
    配置 EKS、RDS PostgreSQL、ElastiCache、S3 和网络。
  </Card><Card title="Azure (AKS)" icon="brand-windows" href="/langsmith/self-host-terraform-azure-deploy">
    配置 AKS、Azure Database for PostgreSQL、Azure 托管 Redis、Blob 存储和 Key Vault。
  </Card>

  <Card title="GCP (GKE)" icon="brand-google" href="/langsmith/self-host-terraform-gcp-deploy">
    配置 GKE、Cloud SQL、Memorystore、GCS 和工作负载身份。
  </Card>
</CardGroup>

## 先决条件

在运行模块之前安装以下工具：

|工具|版本 |目的|
| ----------- | -------- | ------------------------------------------------ |
| `terraform` | 1.5 | 1.5运行模块 |
| `kubectl` | 1.33 | 1.33配置后检查集群 |
| `helm` | 3.12 | 3.12管理 LangSmith 图表发布 |
|云 CLI |最新 |目标提供商的`aws`、`az` 或`gcloud` |

您还需要：

* LangSmith 许可证密钥。 [Contact sales](https://www.langchain.com/contact-sales) 索取一份。
* 目标云帐户中创建 VPC 或 VNet 网络、托管 Kubernetes 集群、托管数据库、对象存储、机密和 IAM 角色的权限。
* LangSmith UI 端点的注册域（或子域）。

## 部署层

选择具有单个 Terraform 变量的层。模块相应地调整每个依赖资源的大小。|等级 | PostgreSQL | Redis |点击屋|使用案例|
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| `dev` |集群内|集群内|集群内|演示、评估、短暂的 POC |
| `production` |云管理（RDS、Cloud SQL、Azure 数据库）|云管理（ElastiCache、Memorystore、Azure 缓存）| [LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse) |持续、可扩展的生产 |
| `production-large` |云管理的更大实例类 |云管理的更大实例类 | LangChain托管ClickHouse |高通量生产|<Warning>
  使用集群内 ClickHouse 进行开发和 POC，而不是生产。生产部署必须使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)或自我管理的外部ClickHouse集群。 Blob 存储始终是必需的，因为跟踪有效负载不得存在于 ClickHouse 中。
</Warning>

## 模块提供什么

* **网络：** 具有公共和私有子网、NAT 和安全组的 VPC 或 VNet。
* **计算：** 托管 Kubernetes（EKS、AKS 或 GKE），具有自动缩放每层大小的节点池。
* **数据平面：** 托管 PostgreSQL、托管 Redis 或缓存以及用于跟踪有效负载的 Blob 存储桶。
* **秘密：** 云原生秘密存储（AWS SSM 参数存储、Azure Key Vault、GCP Secret Manager）通过 [External Secrets Operator](https://external-secrets.io/) 同步到 Kubernetes。
* **Ingress：** 默认情况下云原生负载均衡器。 Envoy Gateway（网关 API）可用于多命名空间数据平面部署。
* **可选强化（目前的 AWS）：** AWS 网络防火墙，具有 FQDN 出口允许列表、WAFv2、CloudTrail 以及具有 SSM 堡垒访问权限的私有 EKS API 端点。

## 企业功能切换

每个模块都公开可选的 LangSmith 附加组件的标志。在运行 `make apply` 之前切换 `tfvars` 文件中的每个内容。* **[LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform)** (`enable_deployments`)：代理服务器加上运行和管理已部署代理的主机后端、侦听器和操作员。
* **[Fleet](/langsmith/fleet)** (`enable_fleet`)：代理构建产品，以前称为 Agent Builder，作为独立服务部署（图表 v0.15+）。
* **Insights** (`enable_insights`)：ClickHouse 支持的分析。
* **Polly** (`enable_polly`)：AI 评估和监控。

## 后续步骤

* 选择上面的提供商并遵循部署指南。
* 查看 PostgreSQL、ClickHouse、Redis 和 Kubernetes 的 [required dependency versions](/langsmith/self-host-dependency-versions)。
* 使用 [scaling guide](/langsmith/self-host-scale) 规划容量。
* 应用程序运行后，启用[LangSmith Deployment](/langsmith/deploy-self-hosted-full-platform)即可在UI上添加代理部署和管理。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>