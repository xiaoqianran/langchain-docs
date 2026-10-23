<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform architecture | https://docs.langchain.com/langsmith/self-host-terraform-azure-architecture -->

# Azure Terraform 架构

在 AKS 上自托管的 LangSmith 的平台层、服务、工作负载身份、网络、入口选项和模块依赖项。

了解 [Azure Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 的配置以及各部分如何组合在一起，以便您可以在运行 `make apply` 之前调整、保护和自定义 LangSmith 部署。

如果您准备好安装，请从[deployment walkthrough](/langsmith/self-host-terraform-azure-deploy)开始。

## 平台层

Azure 上的LangSmith 分阶段部署。每个阶段都会在前一个阶段的基础上添加一个功能层。所有层共享相同的 AKS 集群和 `langsmith` 命名空间。

![LangSmith on Azure service layout](https://mintcdn.com/langchain-5e9cc07a/D6uoP5M0BV8YGC-1/images/self-hosted-terraform/azure-architecture.png?fit=max\&auto=format\&n=D6uoP5M0BV8YGC-1\&q=85\&s=5ee76baf8bca85d865a4e75e2ab7d4b6)|舞台|层 |添加了什么 |
| - | - | - |
|基础设施| Azure 基础设施 | VNet、AKS、Postgres、Redis、Blob、Key Vault、证书管理器、KEDA、入口控制器、可选的 SmithDB 元存储 |
|应用 | LangSmith底座|前端、后端、平台后端、队列、摄取队列、ace 后端、clickhouse、游乐场 |
| LangSmith 部署插件 | LangSmith 部署|主机后端、侦听器、操作员 + 每个部署的 pod |
|舰队附加组件 |舰队|舰队工具服务器、舰队触发服务器、集群内舰队 Redis |
|见解 + Polly 附加组件 |见解+波莉|见解分析（ClickHouse 支持）、Polly 评估代理（静态 `standalone-polly` Pod）|
| LLM 网关插件 | LLM 网关（测试版）|代理网关，加上具有 PII 编辑功能的 presidio-analyzer |

Terraform 使用 `make apply` 提供基础设施层。应用程序和附加层通过 Helm 使用 `make init-values` 和 `make deploy` 进行部署。

## 部署层

每一层都从`infra/`中的模板开始，每个模板设置匹配的`sizing_profile`：|模板|等级 | `sizing_profile` |
| - | - | - |
| `terraform.tfvars.minimum` |轻部署，全部集群内 | `minimum` |
| `terraform.tfvars.dev` |外部 Postgres 和 Redis，较小的节点池 | `dev` |
| `terraform.tfvars.production` |生产、外部管理服务| `production` |

### 轻量部署（全部在集群内）

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AKS Cluster
├── langsmith namespace
│   ├── frontend, backend, platform-backend, playground, queue, ace-backend
│   ├── clickhouse (in-cluster pod)
│   ├── postgres   (in-cluster pod)
│   └── redis      (in-cluster pod)
├── Envoy Gateway (Azure Load Balancer → Envoy)
└── cert-manager  (Let's Encrypt TLS)

Azure
├── Azure Blob Storage  (trace payloads, always external)
└── Azure Key Vault     (secrets)
```

`terraform.tfvars.minimum`套：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
postgres_source   = "in-cluster"
redis_source      = "in-cluster"
clickhouse_source = "in-cluster"
```

### 生产（外部托管服务）

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AKS Cluster
├── langsmith namespace
│   ├── frontend, backend, platform-backend, playground, queue, ingest-queue, ace-backend
│   └── clickhouse (in-cluster; use LangChain Managed for production scale)
└── Envoy Gateway + cert-manager

Azure Managed Services
├── Azure DB for PostgreSQL Flexible Server (private VNet)
├── Azure Managed Redis (private VNet)
├── Azure Blob Storage (Workload Identity, no static keys)
└── Azure Key Vault
```

## 网络

### 轻型部署

当 `unique_resource_names = true` 时，VNet 被命名为 `ls-vnet-<name_prefix>`，这是每个模板设置的。每个子网名称均以 VNet 名称开头。

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ls-vnet-<name_prefix>
└── subnet-0    (AKS nodes only)
    No Postgres/Redis subnets; chart-managed pods handle both
```

### 生产

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
ls-vnet-<name_prefix>
├── subnet-0              (AKS nodes)
├── subnet-postgres       (Azure DB for PostgreSQL Flexible Server, SmithDB metastore)
└── subnet-redis          (Azure Managed Redis)
```

Terraform 还会在 `enable_smithdb = true` 时创建 `subnet-postgres`，在 `create_bastion = true` 时创建 `subnet-bastion`，在 `ingress_controller = "agic"` 时创建 `subnet-agic`。它仅在其创建的 VNet 中创建堡垒和 AGIC 子网；使用 `create_vnet = false`，供应 `bastion_subnet_id` 和 `agic_subnet_id`。仅当 `enable_subnet_nsgs = true` 时，网络安全组才会附加到子网。AKS 节点没有公共 IP。默认情况下，它们通过 AKS 管理的负载均衡器上的出站公共 IP 传出。要通过您自己的防火墙或 NAT 网关发送出口，请提供 AKS 子网并设置 `aks_outbound_type`（请参阅 [Networking variables](/langsmith/self-host-terraform-azure-variables#networking)）。模块自述文件的“通过网络的出口”部分列出了出口路径必须允许的目的地。 AKS API 服务器可公开访问，除非您使用 `aks_authorized_ip_ranges` 限制它或使用 `aks_private_cluster_enabled` 将其设为私有。 Postgres 和 Redis 没有公共端点；两者都只能通过私有 DNS 解析从 VNet 内部访问。 Terraform 在部署资源组中创建私有 DNS 区域并将它们链接到 VNet。在中心辐射型网络中，为中心区域提供 `postgres_private_dns_zone_id`、`storage_private_dns_zone_id` 和 `keyvault_private_dns_zone_id`，区域所有者将它们链接起来。

## 应用核心服务|服务 |目的|港口|羟丙胺 |工作负载身份 |
| - | - | - | - | - |
| `langsmith-frontend` |反应用户界面 | 3000 | 3000 2 至 10 |没有 |
| `langsmith-backend` |主要 API（跟踪、运行、项目、API 密钥、反馈）| 1984 | 3 至 10 |是的（斑点）|
| `langsmith-platform-backend` |组织和用户管理、身份验证、计费、设置 | 1986 | 2 至 10 |是的（斑点）|
| `langsmith-playground` | LLM提示操场UI | 3001 | 3001 1 至 5 |没有 |
| `langsmith-queue` |跟踪摄取工作人员（Redis → ClickHouse + Blob）|无 | 3 至 10 + 科达 |是的 |
| `langsmith-ingest-queue` |专用的高吞吐量摄取工作人员 |无 | 3 至 10 + 科达 |是的 |
| `langsmith-ace-backend` |异步计算（数据集运行、评估、后台作业）|无 | 1 至 5 |没有 |
| `langsmith-clickhouse` |列式存储（跟踪范围、运行元数据、评估结果）| 8123, 9000 | StatefulSet、单副本、500Gi PVC |没有 |

> [!警告]
>
> 集群内 ClickHouse 仅适用于 dev/POC（单个 pod，无复制，无备份）。对于生产使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)或自我管理的外部集群。> [!注意]
>
> [SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs) 是 LangSmith 专门构建的可观测性后端，从版本 0.16.0 开始可用于自托管 LangSmith（请参阅 [self-hosted support](/langsmith/smithdb-sdk-migration#about-self-hosted)）。这些 Terraform 模块默认配置 ClickHouse，因此前面部分中的指南适用于大多数部署。设置 `enable_smithdb = true` 以添加 SmithDB 基础设施：专用 PostgreSQL 18 元存储、存储帐户和 Blob 容器、工作负载身份和高级 SSD v2 缓存卷。在 Azure 上，SmithDB 需要 LangSmith Helm 图表 0.17 系列上的稳定版本，`v0.17.*` 模块标签部署该版本。在`v0.16.*`线上，SmithDB需要模块标签v0.16.56或更高版本以及`langsmith_helm_chart_version = "~0.17.0"`。

### 一次性工作

|工作 |目的|
| - | - |
| `langsmith-backend-migrations` | PostgreSQL 架构迁移 |
| `langsmith-backend-ch-migrations` | ClickHouse 架构迁移 |
| `langsmith-backend-auth-bootstrap` |在 `langsmith-config-secret` 中从 `initial_org_admin_password` 创建初始组织和管理员帐户 |

## LangSmith 部署插件|服务 |目的|工作负载身份 |
| - | - | - |
| `langsmith-host-backend` | LangSmith 部署控制平面API。管理部署生命周期，提供部署元数据。 |是的 |
| `langsmith-listener` |监视主机后端的状态更改，创建和更新 `LangGraphPlatform` CRD。 |是的 |
| `langsmith-operator` | Kubernetes 运营商。 Azure 特定：注入 `azure.workload.identity/use: "true"` + `langsmith-ksa`，以便每个代理 Pod 通过 Workload Identity 访问 Blob 存储。 |没有 |

## 舰队附加组件

Fleet 取代了旧版 Agent Builder 附加组件。设置`enable_fleet = true`，需要`enable_deployments = true`和`postgres_source = "external"`。 `enable_fleet` 和 `enable_agent_builder` 是互斥的。

|吊舱 |类型 |角色 |工作负载身份 |
| - | - | - | - |
| `langsmith-fleet-tool-server` |静态| MCP工具执行服务器|是的 |
| `langsmith-fleet-trigger-server` |静态| Webhook 接收器和计划触发引擎（单个副本）|是的 |
| `langsmith-standalone-fleet-redis` |状态集 | Fleet 的集群内 Redis，图表捆绑 |没有 |

Fleet 将其数据存储在 Azure PostgreSQL 服务器上的专用 `langsmith_fleet` 数据库中。 Terraform 创建数据库和 `langsmith-fleet-postgres` Kubernetes 密钥。

## Insights 和 Polly 附加组件

**见解**：作为静态 `standalone-insights` api 服务器和队列 Pod 运行。从 `langsmith-config-secret` 读取 `insights_encryption_key`。切勿轮换此密钥：它会永久破坏现有的 Insights 数据。**Polly**：作为静态 `standalone-polly` api 服务器和队列 Pod 运行，并且需要 `enable_deployments = true`。 Reads `polly_encryption_key` from `langsmith-config-secret`. Same rotation warning as Insights.

## Azure managed services

当`postgres_source = "external"`和`redis_source = "external"`（推荐的生产设置）时，Terraform规定：

### Azure DB for PostgreSQL Flexible Server

* 保存组织、用户、项目、API 密钥、设置。
* PostgreSQL 14 or later required. `postgres_version` defaults to `16`.
* 由`postgres`模块自动启用的扩展：`btree_gin`、`btree_gist`、`pgcrypto`、`citext`、`pg_trgm`、`ltree`。
* Private VNet only (`subnet-postgres`), SSL port 5432.
* 秘密：`langsmith-postgres-secret`，由`k8s-bootstrap` Terraform 模块创建。

### Azure 托管 Redis

* 跟踪摄取队列、发布/订阅、短期缓存。
* Azure Managed Redis 管理引擎版本； there is no version variable to set.
* 每个LangSmith安装必须使用自己专用的Redis。共享实例会导致部署任务路由不正确。
* Private VNet only (`subnet-redis`), TLS port 10000.
* 秘密：`langsmith-redis-secret`，由`k8s-bootstrap` Terraform 模块创建。

### Azure Blob 存储* 跟踪有效负载：大量输入和输出、附件。
* 通过 `k8s-app-identity` 托管身份的工作负载身份（无静态密钥）。
* 始终需要。禁用 blob 存储会破坏大型负载上的集群。
* 前缀：`ttl_s/`（14 天 TTL）、`ttl_l/`（400 天 TTL）。

### Azure 密钥保管库

* 所有 LangSmith 秘密的集中秘密存储。
* 默认情况下，公共端点位于 Vault 防火墙后面。 `keyvault_private_endpoint_enabled = true` 将保管库移动到私有端点并关闭公共访问，因此 Terraform 和秘密脚本必须从网络内部运行。
* 秘密流程：`make seed-secrets` 将应用程序秘密写入 Key Vault，然后 `make k8s-secrets` 从它们构建 `langsmith-config-secret`。参见[Secret flow](#secret-flow)。

## 工作负载身份

Microsoft Entra ID 令牌交换通过 AKS OIDC 发行者进行。 Pod 无需静态密钥即可访问 Blob 存储。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'flowchart': {'nodeSpacing': 25, 'rankSpacing': 30}}}%%
graph TB
    OIDC["AKS OIDC issuer"]
    Fed["Federated credential<br/>k8s-app-identity<br/>(one per ServiceAccount)"]
    SA["ServiceAccount<br/>azure.workload.identity/client-id"]
    Pod["Pod<br/>azure.workload.identity/use: true"]
    Token["Short-lived Entra ID token<br/>no storage keys"]
    OIDC --> Fed --> SA --> Pod --> Token

    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class OIDC,Fed,SA neutral
    class Pod process
    class Token output
```

工作负载身份与托管身份和 OIDC 颁发者一起集中在 `infra/modules/k8s-cluster/` 中，这避免了循环依赖并简化了添加新 ServiceAccount 的过程。

### 哪些 pod 需要 Workload Identity

每个读取 blob 存储环境变量的 pod 必须具有：

1. 在 Terraform 中注册的联合凭证 (`infra/modules/k8s-cluster/main.tf`)。
2. 部署上的`azure.workload.identity/use: "true"`标签。
3. ServiceAccount 上的 `azure.workload.identity/client-id` 注释。|吊舱 |舞台|需要WI |
| - | - | - |
| `langsmith-backend` |应用 |是的 |
| `langsmith-platform-backend` |应用 |是的 |
| `langsmith-queue` |应用 |是的 |
| `langsmith-ingest-queue` |应用 |是的 |
| `langsmith-host-backend` | LangSmith 部署插件 |是的 |
| `langsmith-listener` | LangSmith 部署插件 |是的 |
| `langsmith-fleet-tool-server` |舰队附加组件 |是的 |
| `langsmith-fleet-trigger-server` |舰队附加组件 |是的 |
| `langsmith-agent-gateway` | LLM 网关插件 |是的 |
| `langsmith-presidio-analyzer` | LLM Gateway PII 编辑 |是的 |
| `langsmith-frontend` |应用 |没有 |
| `langsmith-playground` |应用 |没有 |
| `langsmith-ace-backend` |应用 |没有 |
| `langsmith-clickhouse` |应用 |没有 |
| `langsmith-operator` | LangSmith 部署插件 |没有 |

所有联合凭据均在 `infra/modules/k8s-cluster/main.tf` 下的 `service_accounts_for_workload_identity` 下注册。每个名称都是 `<release>-<component>`，其中 `<release>` 是图表全名（默认为 `langsmith`）。无论是否设置 `enable_llm_gateway`，Terraform 都会注册两个 LLM 网关凭据。 `v0.16.*` 模块标签注册除两个 LLM 网关凭证之外的所有模块标签。 SmithDB 使用自己的 ServiceAccount 和身份。添加访问 Blob 存储的新 Pod 需要将其 ServiceAccount 名称添加到该列表并运行 `make apply`。

如果 Pod 的 ServiceAccount 没有注册联合凭据，则 Microsoft Entra ID 会拒绝令牌交换，并且 Pod 在启动时会发生恐慌：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
panic: blob-storage health-check failed: get container properties failed:
DefaultAzureCredential: failed to acquire a token.
WorkloadIdentityCredential authentication failed.
  AADSTS700213: No matching federated identity record found for presented assertion subject
```

## 秘密流程```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {'flowchart': {'nodeSpacing': 25, 'rankSpacing': 30}}}%%
graph TB
    subgraph stage1["Set up infrastructure"]
        direction LR
        Start["make setup-env<br/>secrets.auto.tfvars"]
        TF["make apply<br/>(3 stages)"]
        KV["Azure Key Vault<br/>postgres-admin-password<br/>langsmith-license-key"]
        Seed["make seed-secrets<br/>app secrets to Key Vault"]
        Start --> TF --> KV --> Seed
    end
    subgraph stage2["Deploy the application"]
        direction LR
        Kube["make kubeconfig"]
        Secrets["make k8s-secrets<br/>Key Vault to<br/>langsmith-config-secret"]
        Deploy["make init-values<br/>make deploy"]
        Running["LangSmith running<br/>reads langsmith-config-secret"]
        Kube --> Secrets --> Deploy --> Running
    end
    stage1 --> stage2

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef neutral fill:#F2FAFF,stroke:#40668D,stroke-width:2px,color:#2F4B68
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Start trigger
    class TF,Seed,Kube,Secrets,Deploy process
    class KV neutral
    class Running output

    style stage1 fill:none,stroke:#40668D,stroke-width:1px
    style stage2 fill:none,stroke:#40668D,stroke-width:1px
```

秘密流程按此顺序运行。 `make deploy-all` 运行步骤 2 到 5，当 `secrets.auto.tfvars` 缺失时，`make apply` 首先运行 `make setup-env`：

1. `make setup-env` 写入 `secrets.auto.tfvars`，它被 gitignored 并由 Terraform 自动读取。它会提示输入 PostgreSQL 管理员密码、许可证密钥和初始组织管理员电子邮件。设置 `LANGSMITH_PG_PASSWORD`、`LANGSMITH_LICENSE_KEY` 和 `LANGSMITH_ADMIN_EMAIL` 以跳过提示。它永远不会写入 Key Vault。
2. `make apply` 创建密钥保管库。 Terraform 仅向其写入 `postgres-admin-password` 和 `langsmith-license-key`，并且仅在 `keyvault_manage_secrets = true`（默认）时写入。 `k8s-bootstrap` 模块创建 `langsmith-license`，以及用于外部 Postgres 和 Redis 的 `langsmith-postgres-secret` 和 `langsmith-redis-secret`。
3. `make seed-secrets` 将应用程序机密直接写入 Key Vault：管理员密码（提示或`LANGSMITH_ADMIN_PASSWORD`）、API 密钥盐、JWT 机密和四个 Fernet 加密密钥。使用`keyvault_manage_secrets = false`，它还写入了 Terraform 跳过的两个秘密。
4. `make kubeconfig` 获取 AKS 凭据。然后，`make k8s-secrets` 读取 Key Vault 并使用所有八个密钥创建 `langsmith-config-secret`，以及当 Key Vault 中存在 `langsmith-oauth-*` 机密时，加上 `oauth_client_id`、`oauth_client_secret` 和 `oauth_issuer_url`。
5. `make init-values` 和`make deploy` 使用`config.existingSecretName = "langsmith-config-secret"` 安装图表。任何值文​​件中都不会内嵌出现秘密。**关键规则：** `secrets.auto.tfvars` 永远不会被提交。在任何机器上重新运行 `make setup-env` 即可恢复。 The app secrets never pass through Terraform state. `make seed-secrets` never overwrites an existing secret, because a new API key salt, JWT secret, or Fernet key breaks a running deployment.使用`make keyvault`故意轮换秘密。

## 入口选项

|控制器|变量| DNS 标签支持 |笔记|
| - | - | - | - |
| `nginx` | `ingress_controller = "nginx"` |是的 | NGINX 通过 Helm，标准 Kubernetes Ingress。 |
| `istio-addon` | `ingress_controller = "istio-addon"` |是的 | AKS 管理的 Istio 服务网格。使用 `istio_addon_revision` 固定修订版。 |
| `istio` | `ingress_controller = "istio"` |是的 |通过 Helm 自我管理 Istio。完全控制修订和配置。 |
| `agic` | `ingress_controller = "agic"` |是的 | Azure Application Gateway v2 + AKS-managed `ingress_application_gateway` add-on.网关运行`Standard_v2`； `create_waf = true` moves it to `WAF_v2` and attaches the WAF policy. HTTP-only, `dns01` with a custom domain, or `existing` with your own certificate. |
| `envoy-gateway` *（默认）* | `ingress_controller = "envoy-gateway"` |是的 |本机网关 API。使用`envoyproxy/gateway-helm`。 |
| `none` | `ingress_controller = "none"` |没有 |带上你自己的入口。 |Azure Public IP DNS labels (`dns_label`) work with every controller except `none`. For `nginx`, `istio`, and `istio-addon`, `deploy.sh` applies the `service.beta.kubernetes.io/azure-dns-label-name` annotation to the controller's LoadBalancer service. For `envoy-gateway`, the EnvoyProxy resource carries the label. For `agic`, Terraform sets the label on the Application Gateway public IP.

For the full TLS compatibility matrix and per-controller setup, see `INGRESS_CONTROLLERS.md` in the [Azure module repo](https://github.com/langchain-ai/terraform/blob/main/modules/azure/INGRESS_CONTROLLERS.md).

## 资源大小

有四种尺寸可供选择。

|简介 |使用案例 |通过 | 设置
| - | - | - |
| `minimum` | Cost parking, CI smoke tests, single-user demos | `sizing_profile = "minimum"` 在 `terraform.tfvars` |
| `dev` |开发人员使用、集成测试、POC | `sizing_profile = "dev"` |
| `production` |真实流量、多副本+HPA | `sizing_profile = "production"` *（推荐）* |
| `production-large` | \~50 个用户，\~1000 条跟踪/秒 | `sizing_profile = "production-large"` |

### AKS 节点池

|泳池|虚拟机大小 | vCPU |内存 |最小|最大|目的|
| - | - | - | - | - | - | - |
|默认 | `Standard_D8s_v5` | 8 | 32GB| 1 | 10 | 10 Core LangSmith, system pods (set min 3 for production) |
|大| `Standard_D16s_v5` | 16 | 16 64GB| 0 | 2 | ClickHouse (in-cluster), LangSmith Deployment agent pods |> [!注意]
>
> ClickHouse（在集群中时）根据配置文件请求 1 到 4 个 CPU 和 2 到 16 GB RAM。对于 [LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)，仅 LangSmith 部署操作员生成的代理 Pod 才需要 `large` 池。

## 可选模块

每个模块都是计数控制的（`0` 禁用，`1` 启用）。启用任意组合；核心部署无需它们即可工作。

|模块|变量|使用案例 |
| - | - | - |
| `waf` | `create_waf = true` | Azure WAF 策略（OWASP 3.2 + 机器人防护），默认处于 `Detection` 模式 (`waf_mode`)。通过 `ingress_controller = "agic"`，Terraform 将其附加到应用程序网关。对于任何其他控制器，该策略将保持独立状态，直到您拥有的应用程序网关引用它。 Azure 前门无法使用此策略类型。 |
| `diagnostics` | `create_diagnostics = true` | `ingress_controller = "agic"` 时的 Log Analytics 工作区 + AKS、Key Vault、PostgreSQL 和应用程序网关的诊断设置。推荐用于生产可观察性。 |
| `bastion` | `create_bastion = true` |使用静态公共 IP 跳转虚拟机，通过 `az ssh vm` 和 Entra ID SSH 进行私有 AKS 访问。 |
| `dns` | `create_dns_zone = true` | Azure DNS 区域 + A 记录。使用自定义域颁发 DNS-01 证书是必需的。 || `smithdb` | `enable_smithdb = true` | SmithDB 基础设施：PostgreSQL 18 元存储、存储帐户和 Blob 容器以及工作负载身份。要求图表0.17线。 |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-architecture.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。