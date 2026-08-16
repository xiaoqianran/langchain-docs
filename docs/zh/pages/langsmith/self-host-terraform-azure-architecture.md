<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Azure Terraform architecture | https://docs.langchain.com/langsmith/self-host-terraform-azure-architecture -->

# Azure Terraform 架构

了解 [Azure Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/azure) 的配置以及各部分如何组合在一起，以便您可以在运行 `make apply` 之前调整、保护和自定义 LangSmith 部署。

在规划部署或对现有部署进行故障排除时，请使用此页面作为参考。它涵盖：

- 平台层和部署层（轻型与生产）。
- 应用程序部署路径（Helm 与 Terraform）。
- 网络、工作负载身份和秘密流。
- 附加组件：LangSmith 部署、Agent Builder、Insights 和 Polly。
- 入口控制器、资源大小和可选模块。

如果您准备好安装，请从[deployment walkthrough](/langsmith/self-host-terraform-azure-deploy)开始。

## 平台层

Azure 上的LangSmith 分阶段部署。每个阶段都会在前一个阶段的基础上添加一个功能层。所有层共享相同的 AKS 集群和 `langsmith` 命名空间。

<img src="/images/self-hosted-terraform/azure-architecture.png" alt="LangSmith on Azure service layout" />|舞台|层|添加了什么 |
|---|---|---|
|基础设施| Azure 基础设施 | VNet、AKS、Postgres、Redis、Blob、Key Vault、证书管理器、KEDA、入口控制器 |
|应用 | LangSmith底座|前端、后端、平台后端、队列、摄取队列、ace 后端、clickhouse、游乐场 |
| LangSmith 部署插件 | LangSmith 部署|主机后端、侦听器、操作员 + 每个部署的 pod |
|代理生成器附加组件 |代理生成器|代理构建器工具服务器、代理构建器触发服务器 + 深度代理 LGP |
|见解 + Polly 附加组件 |见解+波莉| Clio 分析（ClickHouse 支持）、Polly 评估代理（操作员管理、动态）|

## 应用程序部署路径

|路径|如何|何时使用 |
|---|---|---|
|掌舵之路| `make init-values && make deploy` |默认。 Shell 脚本，交互式，动态读取 TF 输出。最适合首次部署和第二天重新部署。 |
|地形路径| `make init-app && make apply-app` |声明性的。 Kubernetes Secrets + `langsmith-ksa` SA + Helm 在 Terraform 状态下发布。最适合 GitOps 和 CI/CD 管道。 |

Terraform 路径使用 `app/` 模块。 `make init-app` 调用`app/scripts/pull-infra-outputs.sh` 读取所有基础设施输出并将其写入`app/infra.auto.tfvars.json`。

## 部署层

### 轻量部署（全部在集群内）

```txt
AKS Cluster
├── langsmith namespace
│   ├── frontend, backend, platform-backend, playground, queue, ace-backend
│   ├── clickhouse (in-cluster pod)
│   ├── postgres   (in-cluster pod)
│   └── redis      (in-cluster pod)
├── ingress-nginx (Azure Load Balancer → NGINX)
└── cert-manager  (Let's Encrypt TLS)

Azure
├── Azure Blob Storage  (trace payloads, always external)
└── Azure Key Vault     (secrets)
```设置于`terraform.tfvars`：

```hcl
postgres_source   = "in-cluster"
redis_source      = "in-cluster"
clickhouse_source = "in-cluster"
```

有关完整的全集群演练（使用 Let's Encrypt HTTP-01 TLS 的 NGINX、全集群数据库），请参阅 [Azure module repo](https://github.com/langchain-ai/terraform/blob/main/modules/azure/BUILDING_LIGHT_LANGSMITH.md) 中的 `BUILDING_LIGHT_LANGSMITH.md`。

### 生产（外部托管服务）

```txt
AKS Cluster
├── langsmith namespace
│   ├── frontend, backend, platform-backend, playground, queue, ingest-queue, ace-backend
│   └── clickhouse (in-cluster; use LangChain Managed for production scale)
└── ingress-nginx + cert-manager

Azure Managed Services
├── Azure DB for PostgreSQL Flexible Server (private VNet)
├── Azure Managed Redis (private VNet)
├── Azure Blob Storage (Workload Identity, no static keys)
└── Azure Key Vault
```

## 网络

### 轻型部署

```txt
langsmith-vnet<identifier>
└── subnet-0    (AKS nodes only)
    No Postgres/Redis subnets; chart-managed pods handle both
```

### 生产

```txt
langsmith-vnet<identifier>
├── subnet-0              (AKS nodes)
├── subnet-postgres       (Azure DB for PostgreSQL Flexible Server)
└── subnet-redis          (Azure Managed Redis)
```

所有子网都是私有的。 Postgres 和 Redis 没有公共端点；两者都只能通过私有 DNS 解析从 VNet 内部访问。

## 应用核心服务

|服务 |目的|港口|羟丙胺 |工作负载身份 |
|---|---|---|---|---|
| `langsmith-frontend` |反应用户界面 | 3000 | 2 至 10 |没有 |
| `langsmith-backend` |主要 API（跟踪、运行、项目、API 密钥、反馈）| 1984 | 3 至 10 |是的（斑点）|
| `langsmith-platform-backend` |组织和用户管理、身份验证、计费、设置 | 1986 | 2 至 10 |是的（斑点）|
| `langsmith-playground` | LLM提示操场UI | 3001 | 3001 1 至 5 |没有 |
| `langsmith-queue` |跟踪摄取工作人员（Redis → ClickHouse + Blob）| — | 3 至 10 + 科达 |是的 |
| `langsmith-ingest-queue` |专用的高吞吐量摄取工作人员 | — | 3 至 10 + 科达 |是的 |
| `langsmith-ace-backend` |异步计算（数据集运行、评估、后台作业）| — | 1 至 5 |没有 |
| `langsmith-clickhouse` |列式存储（跟踪范围、运行元数据、评估结果）| — | StatefulSet、单副本、500Gi PVC |没有 |<Warning>
集群内 ClickHouse 仅是 dev/POC（单个 pod，无复制，无备份）。对于生产使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)或自我管理的外部集群。
</Warning>

<Note>
[SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs) 是 LangSmith 专门构建的可观测性后端，从自托管版本 0.16.0 开始可用于自托管（请参阅 [self-hosted support](/langsmith/smithdb-sdk-migration#about-self-hosted)）。这些 Terraform 模块提供 ClickHouse，因此前面部分中的指南适用于当前部署。
</Note>

### 一次性工作

|工作 |目的|
|---|---|
| `langsmith-backend-migrations` | PostgreSQL 架构迁移 |
| `langsmith-backend-ch-migrations` | ClickHouse 架构迁移 |
| `langsmith-backend-auth-bootstrap` |在 `langsmith-config-secret` 中从 `initial_org_admin_password` 创建初始组织和管理员帐户 |

## LangSmith 部署插件

|服务 |目的|工作负载身份 |
|---|---|---|
| `langsmith-host-backend` | LangGraph 控制平面 API。管理部署生命周期，提供部署元数据。 |是的 |
| `langsmith-listener` |监视主机后端的状态更改，创建和更新 `LangGraphPlatform` CRD。 |是的 |
| `langsmith-operator` | Kubernetes 运营商。 Azure 特定：注入 `azure.workload.identity/use: "true"` + `langsmith-ksa`，以便每个代理 Pod 通过 Workload Identity 访问 Blob 存储。 |没有 |

## 代理生成器附加组件|吊舱 |类型 |角色 |工作负载身份 |
|---|---|---|---|
| `langsmith-agent-builder-tool-server` |静态| MCP工具执行服务器|是的 |
| `langsmith-agent-builder-trigger-server` |静态| Webhook 接收器和预定触发引擎 |是的 |
| `langsmith-agent-bootstrap` |工作 |注册捆绑的 Agent Builder 代理 | — |
| `agent-builder-<hash>` + 队列 + Redis + `lg-<hash>-0` |动态 | Agent Builder 部署，由操作员管理 |继承|

## Insights 和 Polly 附加组件

**见解/Clio：** 无静态 Pod。在第一次 UI 调用时通过操作员延迟部署为动态 LangGraph 部署。从 `langsmith-config-secret` 读取 `insights_encryption_key`。切勿轮换此密钥：它会永久破坏现有的 Insights 数据。

**Polly：** 作为动态 LangGraph 部署运行，由操作员管理。从 `langsmith-config-secret` 读取 `polly_encryption_key`。与 Insights 相同的轮换警告。

## Azure 托管服务

当`postgres_source = "external"`和`redis_source = "external"`（推荐的生产设置）时，Terraform规定：

### Azure DB for PostgreSQL 灵活服务器

- 保存组织、用户、项目、API 密钥、设置。
- 需要 PostgreSQL ≥ 14。 `postgres`模块默认将`postgres_version`设置为`14`。
- 由`postgres`模块自动启用的扩展：`btree_gin`、`btree_gist`、`pgcrypto`、`citext`、`pg_trgm`。
- 仅专用 VNet (`subnet-postgres`)，SSL 端口 5432。
- 秘密：`langsmith-postgres-secret`，由`k8s-bootstrap` Terraform 模块创建。### Azure 托管 Redis

- 跟踪摄取队列、发布/订阅、短期缓存。
- Azure Managed Redis 管理引擎版本；没有要设置的版本变量。
- 每个LangSmith安装必须使用自己专用的Redis。共享实例会导致部署任务路由不正确。
- 仅专用 VNet (`subnet-redis`)，TLS 端口 10000。
- 秘密：`langsmith-redis-secret`，由`k8s-bootstrap` Terraform 模块创建。

### Azure Blob 存储

- 跟踪有效负载：大量输入和输出、附件。
- 通过`k8s-app-identity`托管身份的工作负载身份（无静态密钥）。
- 始终需要。禁用 blob 存储会破坏大型负载上的集群。
- 前缀：`ttl_s/`（14 天 TTL）、`ttl_l/`（400 天 TTL）。

### Azure 密钥保管库

- 所有LangSmith秘密的集中秘密存储。
- 秘密流程：`az keyvault secret show`→`kubectl create secret generic langsmith-config-secret`。

## 工作负载身份

Azure AD 令牌交换通过 AKS OIDC 颁发者进行。 Pod 无需静态密钥即可访问 Blob 存储。

```txt
AKS OIDC issuer
  → Federated credential on Azure Managed Identity (one per Kubernetes ServiceAccount)
  → Kubernetes ServiceAccount annotated with azure.workload.identity/client-id
  → Pod labeled with azure.workload.identity/use: "true"
  → Azure AD issues a short-lived token; no storage keys in any Secret or env var
```

工作负载身份与托管身份和 OIDC 颁发者一起集中在 `modules/k8s-cluster/` 中，这避免了循环依赖并简化了添加新 ServiceAccount 的过程。

### 哪些 pod 需要 Workload Identity

每个读取 blob 存储环境变量的 pod 必须具有：1. 在 Terraform 中注册的联合凭证 (`modules/k8s-cluster/main.tf`)。
2. 部署上的`azure.workload.identity/use: "true"`标签。
3. ServiceAccount 上的 `azure.workload.identity/client-id` 注释。

|吊舱 |舞台|需要WI |
|---|---|---|
| `langsmith-backend` |应用 |是的 |
| `langsmith-platform-backend` |应用 |是的 |
| `langsmith-queue` |应用 |是的 |
| `langsmith-ingest-queue` |应用 |是的 |
| `langsmith-host-backend` | LangSmith 部署插件 |是的 |
| `langsmith-listener` | LangSmith 部署插件 |是的 |
| `langsmith-agent-builder-tool-server` |代理生成器附加组件 |是的 |
| `langsmith-agent-builder-trigger-server` |代理生成器附加组件 |是的 |
| `langsmith-frontend` |应用 |没有 |
| `langsmith-playground` |应用 |没有 |
| `langsmith-ace-backend` |应用 |没有 |
| `langsmith-clickhouse` |应用 |没有 |
| `langsmith-operator` | LangSmith 部署插件 |没有 |

所有联合凭据均在 `service_accounts_for_workload_identity` 下的 `modules/k8s-cluster/main.tf` 中注册。添加访问 Blob 存储的新 Pod 需要将其 ServiceAccount 名称添加到该列表并运行 `terraform apply -target=module.aks`。

如果 Pod 的 ServiceAccount 没有注册联合凭据，Azure AD 会拒绝令牌交换，并且 Pod 在启动时会发生恐慌：

```txt
panic: blob-storage health-check failed: get container properties failed:
DefaultAzureCredential: failed to acquire a token.
WorkloadIdentityCredential authentication failed.
  AADSTS700213: No matching federated identity record found for presented assertion subject
```

## 秘密流程

```txt
Infrastructure stage

  ./setup-env.sh   (read-only against Key Vault; never writes to KV directly)
    First run:  prompts for postgres password, license key, admin password, admin email.
                Generates api_key_salt, jwt_secret, Fernet keys locally.
                Key Vault does not exist yet → writes to local dot-files + secrets.auto.tfvars.
    Subsequent: Key Vault exists → reads the six generated secrets (api_key_salt,
                jwt_secret, four Fernet keys) from KV. Re-prompts for postgres password,
                license key, admin password, and admin email unless LANGSMITH_PG_PASSWORD,
                LANGSMITH_LICENSE_KEY, LANGSMITH_ADMIN_PASSWORD, and LANGSMITH_ADMIN_EMAIL
                are set. Writes secrets.auto.tfvars. No generation, no KV writes.
    Output:     secrets.auto.tfvars  (gitignored, chmod 600)
                Terraform picks this up automatically; no shell session coupling.

  terraform apply
    Reads:  terraform.tfvars (non-sensitive config)
            secrets.auto.tfvars (sensitive values; sole input for KV secret creation)
    Creates: Azure Key Vault + all secrets as KV secrets (Terraform is the sole KV writer)

Application stage

  ./setup-env.sh   (re-run on any machine; reads generated secrets from Key Vault,
                    re-prompts for user-provided ones unless LANGSMITH_* env vars are set)

  kubectl create secret generic langsmith-config-secret
    Reads:  Key Vault secrets + Terraform outputs (postgres/redis URLs, blob account)
    Writes: K8s secrets: langsmith-config-secret, langsmith-postgres-secret,
                          langsmith-redis-secret

  helm upgrade --install langsmith ...
    Chart reads config.existingSecretName = "langsmith-config-secret".
    No secrets inline in any YAML file.
```**关键规则：** `secrets.auto.tfvars` 永远不会被提交。在任何计算机上运行 `./setup-env.sh` 都会恢复它：生成的机密来自 Key Vault，并且会重新提示用户提供的机密，除非通过 `LANGSMITH_*` 环境变量提供。 Terraform 是 Key Vault 的唯一编写者； `setup-env.sh` 仅在第一次应用后读取。

## 入口选项

|控制器|变量| DNS 标签支持 |笔记|
|---|---|---|---|
| `nginx` _（默认）_ | `ingress_controller = "nginx"` |是的 | NGINX 通过 Helm，标准 Kubernetes Ingress。 |
| `istio-addon` | `ingress_controller = "istio-addon"` |是的 | AKS 管理的 Istio 服务网格。使用 `istio_addon_revision` 固定修订版。 |
| `istio` | `ingress_controller = "istio"` |是的 |通过 Helm 自我管理 Istio。完全控制修订和配置。 |
| `agic` | `ingress_controller = "agic"` |是的 | Azure 应用程序网关 v2 + AKS 管理的 `ingress_application_gateway` 附加组件。原生 L7 WAF。仅 HTTP 或 dns01 + 自定义域。 |
| `envoy-gateway` | `ingress_controller = "envoy-gateway"` |是的 |本机网关 API。使用`envoyproxy/gateway-helm`。 |
| `none` | `ingress_controller = "none"` | — |带上你自己的入口。 |

Azure 公共 IP DNS 标签 (`dns_label`) 适用于所有控制器。 `deploy.sh` 根据所选控制器将 `service.beta.kubernetes.io/azure-dns-label-name` 注解应用于正确的 LoadBalancer 服务。

有关完整的 TLS 兼容性矩阵和每个控制器设置，请参阅 [Azure module repo](https://github.com/langchain-ai/terraform/blob/main/modules/azure/INGRESS_CONTROLLERS.md) 中的`INGRESS_CONTROLLERS.md`。## 资源大小

有四种尺寸可供选择。

|简介 |使用案例|通过 | 设置
|---|---|---|
| `minimum` |停车成本、CI 冒烟测试、单用户演示 | `sizing_profile = "minimum"` 于 `terraform.tfvars` |
| `dev` |开发人员使用、集成测试、POC | `sizing_profile = "dev"` |
| `production` |真实流量、多副本+HPA | `sizing_profile = "production"`_（推荐）_ |
| `production-large` | 〜50 个用户，〜1000 条跟踪/秒 | `sizing_profile = "production-large"` |

### AKS 节点池

|泳池|虚拟机大小 | vCPU |内存 |最小 |最大|目的|
|---|---|---|---|---|---|---|
|默认 | `Standard_D8s_v3` | 8 | 32GB| 1 | 10 | 10核心 LangSmith，系统 Pod（生产时至少设置 3 个）|
|大| `Standard_D16s_v3` | 16 | 16 64GB| 0 | 2 | ClickHouse（集群内）、LGP 代理 Pod |

<Note>
ClickHouse（在集群中时）根据配置文件请求 1 到 4 个 CPU 和 2 到 16 GB RAM。对于 [LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)，仅 LGP 操作员生成的代理 Pod 才需要 `large` 池。
</Note>

## 可选模块

每个模块都是计数控制的（`0`禁用，`1`启用）。启用任意组合；核心部署（第 1 到 5 步）无需它们即可工作。|模块|变量|使用案例|
|---|---|---|
| `waf` | `create_waf = true` | Azure WAF 策略（OWASP 3.2 + 机器人保护）。连接到应用程序网关。 |
| `diagnostics` | `create_diagnostics = true` | Log Analytics 工作区 + AKS、Key Vault 和 PostgreSQL 的诊断设置。推荐用于生产可观察性。 |
| `bastion` | `create_bastion = true` |使用静态公共 IP 跳转虚拟机，通过 `az ssh vm` 和 Entra ID SSH 进行私有 AKS 访问。 |
| `dns` | `create_dns_zone = true` | Azure DNS 区域 + A 记录。使用自定义域颁发 DNS-01 证书是必需的。 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-azure-architecture.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>