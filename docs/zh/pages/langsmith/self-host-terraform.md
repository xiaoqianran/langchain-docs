<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy LangSmith with Terraform | https://docs.langchain.com/langsmith/self-host-terraform -->

# 使用 Terraform 部署 LangSmith

Provision LangSmith self-hosted on AWS, Azure, or GCP using LangChain's production-ready Terraform modules.

> [!注意]
>
> Self-hosted LangSmith is an add-on to the Enterprise plan designed for LangChain's largest, most security-conscious customers. See [pricing](https://www.langchain.com/pricing) for details, or [contact the LangChain sales team](https://www.langchain.com/contact-sales) to request a license key for trial.

LangChain publishes production-ready Terraform modules for [LangSmith self-hosted](/langsmith/self-hosted) at [github.com/langchain-ai/terraform](https://github.com/langchain-ai/terraform).这些模块提供云基础（网络、集群、数据库、缓存、对象存储、机密、DNS）并使用合理的默认值安装 LangSmith Helm 图表。

Use this path when you want infrastructure as code from day one. If you already manage cloud infrastructure with your own tooling and need only the application install, follow the [Helm installation guide](/langsmith/kubernetes) instead.

Each module release tag deploys one Helm chart line: the `v0.17.*` tags deploy chart 0.17, and the `v0.16.*` tags deploy chart 0.16. Check out the tag for the chart line you want before you configure the module.> [!提示]
>
> **更喜欢 Helm？** [Kubernetes setup guide](/langsmith/kubernetes) 会针对任何符合要求的集群使用 Helm 进行安装，无需 Terraform。 Terraform 路径将集群配置、秘密连接和 Helm 发布捆绑到一个工作流程中。

## 选择一个提供商

> **[AWS (EKS)](/langsmith/self-host-terraform-aws-deploy)**
>
> 配置 EKS、RDS PostgreSQL、ElastiCache、S3 和网络。

> **[Azure (AKS)](/langsmith/self-host-terraform-azure-deploy)**
>
> Provision AKS, Azure Database for PostgreSQL, Azure Managed Redis, Blob Storage, and Key Vault.

> **[GCP (GKE)](/langsmith/self-host-terraform-gcp-deploy)**
>
> 配置 GKE、Cloud SQL、Memorystore、GCS 和工作负载身份。

## 先决条件

在运行模块之前安装以下工具：

|工具|版本 |目的|
| - | - | - |
| `terraform` | 1.11 或更高版本 |运行模块 |
| `kubectl` | 1.34 或更高版本 |配置后检查集群 |
| `helm` | 3.12 或更高版本 |管理LangSmith图表发布|
|云 CLI |最新 |目标提供商的`aws`、`az` 或 `gcloud` |

您还需要：* A LangSmith license key. [Contact the LangChain sales team](https://www.langchain.com/contact-sales) to request one.
* 目标云帐户中创建 VPC 或 VNet 网络、托管 Kubernetes 集群、托管数据库、对象存储、机密和 IAM 角色的权限。
* LangSmith UI 端点的注册域（或子域）。 GCP needs one, set as `langsmith_domain`.它在 AWS 上是可选的，它可以在负载均衡器主机名上提供 LangSmith，而在 Azure 上，它可以在具有除 `none` 之外的任何入口控制器的 `dns_label` 主机名上提供服务。使用 AGIC，`dns_label` 主机名仅提供 HTTP 服务。

## 部署层

每个层都是`terraform.tfvars`中设置的组合：`postgres_source`、`redis_source`和`clickhouse_source`将每个数据存储放置在集群或托管服务中，并且`sizing_profile`调整工作负载的大小。

|等级 | PostgreSQL | Redis |点击屋 |使用案例 |
| - | - | - | - | - |
| `dev` |集群内|集群内|集群内|演示、评估、短暂的 POC |
| `production` |云托管（RDS、Cloud SQL、Azure Database for PostgreSQL）|云托管（ElastiCache、Memorystore、Azure 托管 Redis）| [LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse) | Persistent, scalable production |
| `production-large` | Cloud-managed, larger instance class | Cloud-managed, larger instance class | LangChain Managed ClickHouse |高通量生产|在 AWS 和 Azure 上，从 `terraform.tfvars.example`、`terraform.tfvars.minimum`、`terraform.tfvars.dev` 或 `terraform.tfvars.production` 模板开始。 On GCP, start from `terraform.tfvars.example` or `terraform.tfvars.minimum`.模板不会一对一映射到这些层：每个模板都将 ClickHouse 保留在集群中，并且开发模板使用托管 PostgreSQL 和 Redis。复制一个后，设置三个 `*_source` 值和 `sizing_profile` 以匹配您想要的层。

> [!警告]
>
> 使用集群内 ClickHouse 进行开发和 POC，而不是生产。生产部署必须使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)或自我管理的外部ClickHouse集群。 Blob 存储始终是必需的，因为跟踪有效负载不得存在于 ClickHouse 中。

## What the modules provision* **网络：** 具有公共和私有子网、NAT 和安全组的 VPC 或 VNet。
* **计算：** 托管 Kubernetes（EKS、AKS 或 GKE），具有自动缩放每层大小的节点池。
* **数据平面：** 托管或集群内 PostgreSQL 和 Redis，以及用于跟踪有效负载的 Blob 存储桶。
* **秘密：** 每个模块将应用程序秘密保存在云的秘密存储中，然后以自己的方式将它们写入 Kubernetes。在 AWS 上，[External Secrets Operator](https://external-secrets.io/) 从 SSM 参数存储同步它们。在 GCP 上，`setup-env.sh` 将它们存储在 Secret Manager 中，Terraform 写入 Kubernetes Secret，`make deploy` 构建 `langsmith-config` Secret。在 Azure 上，`secrets.auto.tfvars` 保存 Terraform 输入，Key Vault 保存应用程序机密，`make k8s-secrets` 将它们复制到 `langsmith-config-secret` Kubernetes Secret。
* **Ingress：** Envoy 网关（网关 API）是每个提供商的默认设置。在 AWS 上，ALB 转发到它，并且可以选择 NGINX、Istio 或单独的 ALB Ingress。在 Azure 上，可以选择 NGINX、自管理 Istio、AKS Istio 附加组件和应用程序网关入口控制器 (AGIC)。在 GCP 上，Envoy Gateway 是唯一实施的选项。* **可选强化：** 在 AWS 上，具有 FQDN 出口许可列表的 AWS 网络防火墙、WAFv2、CloudTrail 以及具有 SSM 堡垒访问权限的私有 EKS API 终端节点。在 Azure 上，WAF 策略（OWASP 3.2 加机器人保护，通过 AGIC 附加到应用程序网关）、Azure Monitor 诊断设置、跳转 VM、仅具有 Entra 访问权限的私有 AKS API 服务器以及 Blob 存储和 Key Vault 的私有终结点。 On GCP, `gke_master_authorized_cidrs` limits which CIDRs can reach the GKE control plane.

## 企业功能切换

Each module exposes flags for the optional LangSmith add-ons.在 `terraform.tfvars` 中切换每个。 Each module's deploy scripts read the flags and generate the matching Helm values.* **[LangSmith Deployment](/langsmith/enable-self-hosted-deployment)** (`enable_deployments`): Agent Server plus the host-backend, listener, and operator that run and manage deployed agents.
* **[Fleet](/langsmith/fleet)** (`enable_fleet`): The agent-building product, formerly Agent Builder, deployed as a standalone service.
* **Insights** (`enable_insights`): ClickHouse-backed analytics.
* **Polly** (`enable_polly`): AI evaluation and monitoring.
* **[LLM Gateway](/langsmith/llm-gateway)** (`enable_llm_gateway`): One LangSmith API key for models across the providers your organization configures, in beta. `enable_gateway_pii_redaction` 添加 PII 编辑。
* **[SSO with OIDC](/langsmith/self-host-sso)** (`enable_sso_oidc`): Log in through a standard OIDC provider instead of basic auth. Enable it only after you have logged in as the org admin with basic auth, because the flag disables basic auth.

> [!注意]
>
> 运行 `make init-values && make deploy` 应用标志更改。 `enable_fleet` also creates Terraform resources, so run `make apply` first. Fleet replaces the legacy `enable_agent_builder` flag, and its prerequisites differ by provider. See the Fleet section of the [AWS](/langsmith/self-host-terraform-aws-deploy#fleet), [GCP](/langsmith/self-host-terraform-gcp-deploy#fleet), or [Azure](/langsmith/self-host-terraform-azure-deploy#fleet) deploy guide.
>
> `enable_sso_oidc` is available in all three modules on the `v0.17.*` tags, and in the AWS module from v0.16.83. The LLM Gateway flags are available only in the Azure module, on the `v0.17.*` tags.

## 后续步骤* 选择上面的提供商并遵循部署指南。
* 查看 PostgreSQL、ClickHouse、Redis 和 Kubernetes 的 [required dependency versions](/langsmith/self-host-dependency-versions)。
* 使用 [scaling guide](/langsmith/self-host-scale) 规划容量。
* 应用程序运行后，启用[LangSmith Deployment](/langsmith/enable-self-hosted-deployment)即可在UI上添加代理部署和管理。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。