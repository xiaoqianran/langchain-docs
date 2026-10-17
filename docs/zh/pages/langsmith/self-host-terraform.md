<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy LangSmith with Terraform | https://docs.langchain.com/langsmith/self-host-terraform -->

# 使用 Terraform 部署 LangSmith

使用 LangChain 的生产就绪 Terraform 模块在 AWS、Azure 或 GCP 上配置 LangSmith 自托管。

<Info>
  自托管 LangSmith 是企业计划的附加组件，专为 LangChain 最大、最注重安全的客户而设计。请参阅[pricing](https://www.langchain.com/pricing)了解详细信息，或参阅[contact the LangChain sales team](https://www.langchain.com/contact-sales)申请试用许可证密钥。
</Info>

LangChain 在 [github.com/langchain-ai/terraform](https://github.com/langchain-ai/terraform) 发布了适用于 [LangSmith self-hosted](/langsmith/self-hosted) 的生产就绪 Terraform 模块。这些模块配置云基础（网络、集群、数据库、缓存、对象存储、机密、DNS）并使用合理的默认值安装 LangSmith Helm 图表。

当您从一开始就希望基础架构即代码时，请使用此路径。如果您已经使用自己的工具管理云基础设施并且只需要安装应用程序，请改为遵循 [Helm installation guide](/langsmith/kubernetes)。

每个模块发布标签都会部署一个 Helm 图表行：`v0.17.*` 标签部署图表 0.17，`v0.16.*` 标签部署图表 0.16。在配置模块之前，请检查所需图表线的标签。<Tip>
  **更喜欢 Helm？** [Kubernetes setup guide](/langsmith/kubernetes) 会针对任何符合要求的集群使用 Helm 进行安装，无需 Terraform。 Terraform 路径将集群配置、秘密连接和 Helm 发布捆绑到一个工作流程中。
</Tip>

## 选择一个提供商

<CardGroup>
  <Card title="AWS (EKS)" icon="brand-aws" href="/langsmith/self-host-terraform-aws-deploy">
    配置 EKS、RDS PostgreSQL、ElastiCache、S3 和网络。
  </Card>

  <Card title="Azure (AKS)" icon="brand-windows" href="/langsmith/self-host-terraform-azure-deploy">
    配置 AKS、Azure Database for PostgreSQL、Azure 托管 Redis、Blob 存储和 Key Vault。
  </Card>

  <Card title="GCP (GKE)" icon="brand-google" href="/langsmith/self-host-terraform-gcp-deploy">
    配置 GKE、Cloud SQL、Memorystore、GCS 和工作负载身份。
  </Card>
</CardGroup>

## 先决条件

在运行模块之前安装以下工具：

|工具|版本 |目的|
| - | - | - |
| `terraform` | 1.11 或更高版本 |运行模块 |
| `kubectl` | 1.34 或更高版本 |配置后检查集群 |
| `helm` | 3.12 或更高版本 |管理LangSmith图表发布|
|云 CLI |最新 |目标提供商的`aws`、`az` 或 `gcloud` |

您还需要：* LangSmith 许可证密钥。 [Contact the LangChain sales team](https://www.langchain.com/contact-sales) 索取一份。
* 目标云帐户中创建 VPC 或 VNet 网络、托管 Kubernetes 集群、托管数据库、对象存储、机密和 IAM 角色的权限。
* LangSmith UI 端点的注册域（或子域）。 GCP需要一个，设置为`langsmith_domain`。它在 AWS 上是可选的，AWS 可以在负载均衡器主机名上提供 LangSmith，而在 Azure 上，它可以通过除 `none` 之外的任何入口控制器在 `dns_label` 主机名上提供服务。使用 AGIC，`dns_label` 主机名仅提供 HTTP 服务。

## 部署层

每个层都是`terraform.tfvars`中设置的组合：`postgres_source`、`redis_source`和`clickhouse_source`将每个数据存储放置在集群或托管服务中，并且`sizing_profile`调整工作负载的大小。

|等级 | PostgreSQL | Redis |点击屋 |使用案例 |
| - | - | - | - | - |
| `dev` |集群内|集群内|集群内|演示、评估、短暂的 POC |
| `production` |云托管（RDS、Cloud SQL、Azure Database for PostgreSQL）|云托管（ElastiCache、Memorystore、Azure 托管 Redis）| [LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse) |持续、可扩展的生产 |
| `production-large` |云管理的更大实例类 |云管理的更大实例类 | LangChain 托管 ClickHouse |高通量生产|在 AWS 和 Azure 上，从 `terraform.tfvars.example`、`terraform.tfvars.minimum`、`terraform.tfvars.dev` 或 `terraform.tfvars.production` 模板开始。在 GCP 上，从 `terraform.tfvars.example` 或 `terraform.tfvars.minimum` 开始。模板不会一对一映射到这些层：每个模板都将 ClickHouse 保留在集群中，并且开发模板使用托管 PostgreSQL 和 Redis。复制一个后，设置三个 `*_source` 值和 `sizing_profile` 以匹配您想要的层。

<Warning>
  使用集群内 ClickHouse 进行开发和 POC，而不是生产。生产部署必须使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)或自我管理的外部ClickHouse集群。 Blob 存储始终是必需的，因为跟踪有效负载不得存在于 ClickHouse 中。
</Warning>

## 模块提供什么* **网络：** 具有公共和私有子网、NAT 和安全组的 VPC 或 VNet。
* **计算：** 托管 Kubernetes（EKS、AKS 或 GKE），具有自动缩放每层大小的节点池。
* **数据平面：** 托管或集群内 PostgreSQL 和 Redis，以及用于跟踪有效负载的 Blob 存储桶。
* **秘密：** 每个模块将应用程序秘密保存在云的秘密存储中，然后以自己的方式将它们写入 Kubernetes。在 AWS 上，[External Secrets Operator](https://external-secrets.io/) 从 SSM 参数存储同步它们。在 GCP 上，`setup-env.sh` 将它们存储在 Secret Manager 中，Terraform 写入 Kubernetes Secret，`make deploy` 构建 `langsmith-config` Secret。在 Azure 上，`secrets.auto.tfvars` 保存 Terraform 输入，Key Vault 保存应用程序机密，`make k8s-secrets` 将它们复制到 `langsmith-config-secret` Kubernetes Secret。
* **Ingress：** Envoy 网关（网关 API）是每个提供商的默认设置。在 AWS 上，ALB 转发到它，并且可以选择 NGINX、Istio 或单独的 ALB Ingress。在 Azure 上，可以选择 NGINX、自管理 Istio、AKS Istio 附加组件和应用程序网关入口控制器 (AGIC)。在 GCP 上，Envoy Gateway 是唯一实施的选项。* **可选强化：** 在 AWS 上，具有 FQDN 出口许可列表的 AWS 网络防火墙、WAFv2、CloudTrail 以及具有 SSM 堡垒访问权限的私有 EKS API 终端节点。在 Azure 上，WAF 策略（OWASP 3.2 加机器人保护，通过 AGIC 附加到应用程序网关）、Azure Monitor 诊断设置、跳转 VM、仅具有 Entra 访问权限的私有 AKS API 服务器以及 Blob 存储和 Key Vault 的私有终结点。在 GCP 上，`gke_master_authorized_cidrs` 限制哪些 CIDR 可以到达 GKE 控制平面。

## 企业功能切换

每个模块都公开可选的 LangSmith 附加组件的标志。在 `terraform.tfvars` 中切换每个。每个模块的部署脚本都会读取标志并生成匹配的 Helm 值。* **[LangSmith Deployment](/langsmith/enable-self-hosted-deployment)** (`enable_deployments`)：代理服务器加上运行和管理已部署代理的主机后端、侦听器和操作员。
* **[Fleet](/langsmith/fleet)** (`enable_fleet`)：代理构建产品，以前称为 Agent Builder，作为独立服务部署。
* **Insights** (`enable_insights`)：ClickHouse 支持的分析。
* **Polly** (`enable_polly`)：AI 评估和监控。
* **[LLM Gateway](/langsmith/llm-gateway)** (`enable_llm_gateway`)：一个 LangSmith API 密钥，适用于您的组织配置的跨提供商的模型（处于测试阶段）。 `enable_gateway_pii_redaction` 添加 PII 编辑。
* **[SSO with OIDC](/langsmith/self-host-sso)** (`enable_sso_oidc`)：通过标准 OIDC 提供商而不是基本身份验证登录。仅在您以组织管理员身份使用基本身份验证登录后才启用它，因为该标志会禁用基本身份验证。

<Note>
  运行 `make init-values && make deploy` 以应用标志更改。 `enable_fleet` 还会创建 Terraform 资源，因此首先运行 `make apply`。 Fleet 取代了旧版 `enable_agent_builder` 标志，其先决条件因提供商而异。请参阅 [AWS](/langsmith/self-host-terraform-aws-deploy#fleet)、[GCP](/langsmith/self-host-terraform-gcp-deploy#fleet) 或 [Azure](/langsmith/self-host-terraform-azure-deploy#fleet) 部署指南的舰队部分。

  `enable_sso_oidc` 可在 `v0.17.*` 标签上的所有三个模块以及 v0.16.83 版本的 AWS 模块中使用。 LLM 网关标志仅在 Azure 模块中的 `v0.17.*` 标签上可用。
</Note>

## 后续步骤* 选择上面的提供商并遵循部署指南。
* 查看 PostgreSQL、ClickHouse、Redis 和 Kubernetes 的 [required dependency versions](/langsmith/self-host-dependency-versions)。
* 使用 [scaling guide](/langsmith/self-host-scale) 规划容量。
* 应用程序运行后，启用[LangSmith Deployment](/langsmith/enable-self-hosted-deployment)即可在UI上添加代理部署和管理。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>