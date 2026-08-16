<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: GCP Terraform architecture | https://docs.langchain.com/langsmith/self-host-terraform-gcp-architecture -->

# GCP Terraform 架构

了解 [GCP Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/gcp) 的配置以及各个部分如何组合在一起，以便您可以在运行 `make apply` 之前调整、保护和自定义 LangSmith 部署。

在规划部署或对现有部署进行故障排除时，请使用此页面作为参考。它涵盖：

- 平台层和部署层（轻型与生产）。
- 模块描述和依赖关系。
- 网络、工作负载身份和流量。
- 附加组件：LangSmith 部署、舰队、洞察和 Polly。
- GCP 托管服务和 Secret Manager 集成。

如果您准备好安装，请从[deployment walkthrough](/langsmith/self-host-terraform-gcp-deploy)开始。

## 平台层

GCP 上的LangSmith 最多可分为五个阶段进行部署。每个阶段都会在前一个阶段的基础上添加一个功能层。所有层共享相同的 GKE 集群和 `langsmith` 命名空间。

<img src="/images/self-hosted-terraform/gcp-architecture.png" alt="LangSmith on GCP deployment stages and service layout" />|舞台|层|添加了什么 |
|---|---|---|
| 1 | GCP 基础设施 | VPC、GKE、Cloud SQL、Memorystore、GCS、K8s 引导程序、证书管理器、KEDA、Envoy 网关 |
| 2 | LangSmith底座|前端、后端、平台后端、队列、ace 后端、clickhouse、游乐场 |
| 3 | LangSmith 部署|主机后端、侦听器、操作员 + 每个部署的 pod |
| 4 |舰队|独立舰队 API 服务器、独立舰队工具服务器、独立舰队触发服务器、独立舰队队列 |
| 5 |见解+波莉| Clio 分析（ClickHouse 支持）、Polly 评估代理 |

<Note>
Fleet（图表 v0.15+）是以前称为 Agent Builder 的功能的当前形式。使用`enable_fleet`启用它。与已弃用的 `enable_agent_builder` 路径不同，它不需要 LangSmith 部署层。这两个标志是互斥的并且共享相同的加密密钥。请参阅部署指南中的[Enable add-ons](/langsmith/self-host-terraform-gcp-deploy#enable-add-ons)。
</Note>

## 模块说明|模块|路径|目的|
|---|---|---|
| `networking` | `infra/modules/networking/` | VPC、具有辅助范围的子网、Cloud Router、Cloud NAT、Cloud SQL 和 Memorystore 的专用服务连接 |
| `k8s-cluster` | `infra/modules/k8s-cluster/` | GKE Standard 或 Autopilot 集群、私有节点、具有自动扩展功能的节点池、启用 Workload Identity |
| `postgres` | `infra/modules/postgres/` | Cloud SQL PostgreSQL实例，区域HA备用，私有IP，删除保护 |
| `redis` | `infra/modules/redis/` | Memorystore Redis STANDARD_HA 层，VPC 内的私有 IP |
| `storage` | `infra/modules/storage/` |具有 `ttl_s/`（14 天）和 `ttl_l/`（400 天）前缀的版本控制和生命周期规则的 GCS 存储桶 |
| `k8s-bootstrap` | `infra/modules/k8s-bootstrap/` | `langsmith` 命名空间、Postgres 和 Redis URL 的 Kubernetes Secret、证书管理器和 KEDA Helm 版本 |
| `ingress` | `infra/modules/ingress/` | Envoy Gateway Helm 发布、GatewayClass、HTTPRoute、可选 HTTPS 网关监听器 |
| `iam` | `infra/modules/iam/` |用于 GCS 访问的 GCP 服务帐户和工作负载身份绑定（默认情况下已连接）|
| `dns` | `infra/modules/dns/` | Cloud DNS 托管区域和托管证书（可选，通过 `enable_dns_module` 启用）|
| `secrets` | `infra/modules/secrets/` | Secret Manager 秘密捆绑包（可选，通过 `enable_secret_manager_module` 启用）|

## 部署层

### 轻量部署（全部在集群内）

```txt
VPC
└── subnet (10.0.0.0/20, GKE nodes only)
    No Cloud SQL or Memorystore; chart pods handle both

GKE Cluster
├── langsmith namespace
│   ├── frontend, backend, platform-backend, queue, ace-backend, playground
│   ├── clickhouse (in-cluster)
│   ├── postgres   (in-cluster)
│   └── redis      (in-cluster)
├── cert-manager
├── keda
└── envoy-gateway-system

GCS Bucket (trace payloads, always external)
```

设置于`terraform.tfvars`：

```hcl
postgres_source   = "in-cluster"
redis_source      = "in-cluster"
clickhouse_source = "in-cluster"
```### 生产（外部托管服务）

```txt
VPC
├── subnet (10.0.0.0/20, GKE nodes, pods, services)
│   └── Secondary ranges: pods 10.4.0.0/14, services 10.8.0.0/20
└── Private service connection (VPC peering to Google managed network)
    ├── Cloud SQL PostgreSQL  (private IP, regional standby)
    └── Memorystore Redis     (private IP, STANDARD_HA tier)

GKE Cluster
├── langsmith namespace
│   ├── frontend, backend, platform-backend, queue, ace-backend, playground
│   └── clickhouse (in-cluster; use LangChain Managed for production scale)
├── cert-manager
├── keda
└── envoy-gateway-system

GCS Bucket (Workload Identity, no static keys)
```

## 应用核心服务

|服务 |目的|港口|羟丙胺 |工作负载身份 |取决于 |
|---|---|---|---|---|---|
| `langsmith-frontend` |反应用户界面 | 3000 | 1 到 10 |没有 | `backend`、`platform-backend` |
| `langsmith-backend` |主要 API（跟踪、运行、项目、API 密钥、反馈）| 1984 | 3 至 10 |是（GCS）| Postgres、Redis、ClickHouse、GCS |
| `langsmith-platform-backend` |组织和用户管理、身份验证、计费、设置 | 1986 | 1 到 10 |是（GCS）| Postgres、Redis、GCS |
| `langsmith-playground` | LLM提示操场UI | 3001 | 3001 1 到 10 |没有 | `backend` |
| `langsmith-queue` |跟踪摄取工作人员（Redis 到 ClickHouse + GCS）| — | 3 至 10 + 科达 |是的 | Redis、ClickHouse、GCS |
| `langsmith-ingest-queue` |专用的高吞吐量摄取工作人员 | — | 3 至 10 + 科达 |是的 | Redis、GCS |
| `langsmith-ace-backend` |异步计算（数据集运行、评估、后台作业）| — | 1 至 5 |没有 | Postgres、Redis |
| `langsmith-clickhouse` |列式存储（跟踪范围、运行元数据、评估结果）| — | StatefulSet，单个副本 |没有 | 500Gi `premium-rwo` PVC |

<Warning>
集群内 ClickHouse 仅是 dev/POC（单个 pod，无复制，无备份）。对于生产，请使用 [LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse) 或自我管理的外部集群。
</Warning><Note>
[SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs) 是 LangSmith 专门构建的可观察性后端，从自托管版本 0.16.0 开始可用于自托管（请参阅 [self-hosted support](/langsmith/smithdb-sdk-migration#about-self-hosted)）。这些 Terraform 模块提供 ClickHouse，因此前面部分中的指南适用于当前部署。
</Note>

### 一次性工作

|工作 |目的|
|---|---|
| `langsmith-backend-migrations` | PostgreSQL 架构迁移 |
| `langsmith-backend-ch-migrations` | ClickHouse 架构迁移 |
| `langsmith-backend-auth-bootstrap` |创建初始组织和管理员帐户 |

## LangSmith 部署插件

|服务 |目的|工作负载身份 |
|---|---|---|
| `langsmith-host-backend` | LangGraph 控制平面 API。管理部署生命周期，提供部署元数据。 |是（GCS）|
| `langsmith-listener` |监视主机后端的状态更改，创建和更新 `LangGraphPlatform` CRD。 |是（GCS）|
| `langsmith-operator` | Kubernetes 运营商。协调 `LangGraphPlatform` CRD，创建和删除部署和服务。 |用于部署和服务的 RBAC |

在 UI 中创建的每个 LangGraph 部署都会在 `langsmith` 命名空间中生成一个 Kubernetes 部署，其中 pod 作为 `langsmith-ksa` ServiceAccount 运行。该 ServiceAccount 必须携带 `iam.gke.io/gcp-service-account` 注释，`deploy.sh` 以幂等方式应用。

## GCP 托管服务当`postgres_source = "external"`和`redis_source = "external"`（推荐的生产设置）时，Terraform规定：

### 云 SQL PostgreSQL

- 默认大小`db-custom-2-8192`（2 个 vCPU，8 GB），私有 IP，端口 5432。
- 具有自动故障转移功能的区域可用性。
- 保存组织、用户、项目、API 密钥、设置。
- Terraform 将连接 URL 直接写入 `langsmith-postgres-credentials` Kubernetes Secret。

### 内存存储Redis

- 默认 5 GB、STANDARD_HA 层、私有 IP、端口 6379。
- 跟踪摄取队列、发布/订阅、短期缓存。
- 不需要身份验证令牌。访问仅由 VPC 私有 IP 控制。
- Terraform 将连接 URL 直接写入 `langsmith-redis-credentials` Kubernetes Secret。

### 云存储桶

- 跟踪有效负载：大量输入和输出、附件。
- 附带的 Helm 值使用本机 GCS 模式（`engine: GCS`、`apiURL: https://storage.googleapis.com`），通过 Workload Identity 进行身份验证，无需 HMAC 密钥。
- 还支持 S3 兼容模式 (`engine: S3`)，如`helm/values/examples/langsmith-values.yaml` 所示。它需要 HMAC 密钥：在 Cloud Storage → 设置 → 互操作性下创建一个密钥，并通过 `config.blobStorage.accessKey` 和 `config.blobStorage.accessKeySecret` 将它们传递给 Helm。
- 生命周期规则：`ttl_s/`前缀（默认14天），`ttl_l/`前缀（默认400天）。
- 无论层级如何，GCS 存储桶始终是必需的。### 秘密管理器（可选模块）

- 当 `enable_secret_manager_module = true` 时，存储单个 JSON 秘密包（生成的 LangSmith 秘密密钥、Postgres 密码、Redis 密码）。
- 无论此模块如何，核心机密（`langsmith-postgres-credentials`、`langsmith-redis-credentials`）始终按`k8s-bootstrap`存储在 Kubernetes Secrets 中。 Secret Manager 为必须在集群重建中幸存的秘密提供了额外的持久存储。

## 集群基础设施

|服务 |命名空间 |安装者 |需要 |
|---|---|---|---|
|特使网关 | `envoy-gateway-system` | `ingress`模块（`install_ingress = true`，默认）|所有入口 |
|科达| `keda` | `k8s-bootstrap`模块当`enable_langsmith_deployment = true` | LangSmith 部署附加组件及更高版本 |
|证书经理 | `cert-manager` |当 `tls_certificate_source = "letsencrypt"` 或 `install_cert_manager = true` 时，`k8s-bootstrap` 模块 |让我们加密 TLS |

<Note>
`Gateway`资源由Terraform管理； `HTTPRoute` 由 Helm 管理。不要手动删除网关资源。删除网关时，GCP 会释放外部 IP，然后在重新创建时发出新 IP。
</Note>

## 工作负载身份

GKE Pod 通过 Workload Identity 访问 GCS。 Kubernetes ServiceAccount 通过 IAM 绑定与 GCP 服务帐户绑定； Pod 接收临时凭证，Secret 或环境变量中没有静态密钥。

```txt
GKE pod
  └── Kubernetes ServiceAccount (annotated with iam.gke.io/gcp-service-account)
        └── IAM binding: roles/iam.workloadIdentityUser
              └── GCP Service Account
                    └── roles/storage.objectAdmin on the GCS bucket
```|组件|注释|权限 |
|---|---|---|
| `langsmith-backend` | `iam.gke.io/gcp-service-account: <gsa>` | LangSmith 铲斗上的 GCS `storage.objectAdmin` |
| `langsmith-platform-backend` |相同| GCS `storage.objectAdmin` |
| `langsmith-queue` |相同| GCS `storage.objectAdmin` |
| `langsmith-ingest-queue` |相同| GCS `storage.objectAdmin` |
| `langsmith-host-backend` |相同| GCS `storage.objectAdmin` |
| `langsmith-listener` |相同| GCS `storage.objectAdmin` |
| `langsmith-ksa`（操作员吊舱）|相同| GCS `storage.objectAdmin` |

GSA 由`iam` 模块定义并输出为`workload_identity_annotation`。 `init-values.sh` 自动将这些注释写入`values-overrides.yaml`。

在本机 GCS 模式（出厂默认模式）下，上面的 GSA 绑定就足够了。可选的 S3 兼容模式 (`engine: S3`) 还需要 HMAC 密钥：在 Cloud Storage → 设置 → 互操作性下创建一个密钥并将其传递给 Helm。

## 网络拓扑

|范围 | CIDR |使用者 |
|---|---|---|
|子网| `10.0.0.0/20` | GKE 节点 |
|豆荚 | `10.4.0.0/14` | GKE Pod IP（次要范围）|
|服务 | `10.8.0.0/20` | GKE ClusterIP 服务（次要范围）|
|私人服务连接 | `/16` 由 Google 分配 | Cloud SQL、Memorystore 私有 IP |

Cloud SQL 和 Memorystore 仅通过私有 IP 访问。每当 `postgres_source = "external"` 或 `redis_source = "external"` 时，网络模块都会建立专用服务连接（VPC 对等到 Google 的托管网络）。

## 交通流量

```txt
Internet (HTTPS :443)
  ↓
Envoy Gateway  (envoy-gateway-system, external LoadBalancer IP)
  TLS terminated: cert-manager + Let's Encrypt or existing certificate
  │
  ├── /                     → frontend:80
  ├── /api/*                → backend:1984
  └── /api/v1/deployments/* → host-backend:1985  (LangSmith Deployment add-on)

Internal traffic (private IPs, never leaving VPC):
  backend       → Cloud SQL:5432    via private IP
  backend       → Memorystore:6379  via private IP
  backend       → GCS               via Workload Identity (native GCS mode)
  host-backend  → K8s API           reads deployment pod status
  listener      → K8s API           reconciles Deployment CRDs
  operator      → K8s API           creates and manages deployment pods
```## 组件到存储的映射

|组件| PostgreSQL | Redis |点击屋|地面站 |
|---|---|---|---|---|
| `backend` |组织配置，运行元数据 |摄取队列 | — |跟踪对象|
| `platform-backend` | — | — | — | Blob 路由 |
| `queue` | — |流行音乐职位 | — |写入跟踪 blob |
| `clickhouse` | — | — |跟踪搜索索引 | — |
| `host-backend` |部署生命周期状态 | — | — | — |

## 秘密管理器集成

没有秘密经理：

```txt
terraform.tfvars → terraform apply → kubernetes_secret (postgres, redis)
```

与秘密经理：

```txt
terraform.tfvars → terraform apply ─┬─→ kubernetes_secret (postgres, redis)
                                    └─→ Secret Manager (durable copy, survives cluster recreation)
```

在这两种情况下，Terraform 都会直接写入 Kubernetes Secret。启用 Secret Manager 会在集群外部添加 Postgres 密码、Redis 密码和生成的密钥的持久副本。没有任何内容将 Secret Manager 同步回集群，因此 GCP 上未安装任何外部 Secrets Operator（与 AWS 模块不同，AWS 模块使用它从 SSM 参数存储进行同步）。

## Terraform 模块图

```txt
google_project_service (APIs enabled)
  └── module.networking
        ├── module.gke_cluster
        │     └── time_sleep.wait_for_cluster
        │           ├── module.cloudsql      (count = postgres_source == "external")
        │           ├── module.redis         (count = redis_source    == "external")
        │           ├── module.storage
        │           ├── module.iam           (count = enable_gcp_iam_module)
        │           ├── module.secrets       (count = enable_secret_manager_module)
        │           ├── module.dns           (count = enable_dns_module)
        │           ├── module.k8s_bootstrap
        │           └── module.ingress       (count = install_ingress)
        └── (private_service_connection when external services)
```

`infra` 图层不安装LangSmith 图表。应用程序阶段以两种方式之一安装它，两者都使用 `helm/values/` 下的相同分层值文件：- 部署脚本：`make init-values && make deploy`运行`helm upgrade --install`。
- Terraform `app` 层：`make init-values && make init-app && make apply-app` 将图表作为 `helm_release` 资源进行管理。 `make init-app` 将`infra` 输出（集群、存储桶、Workload Identity 注释）拉入`app/infra.auto.tfvars.json`，因此`app` 层无需远程状态数据源即可读取它们。

## 验证命令

```bash
# Cluster connectivity
gcloud container clusters get-credentials <cluster-name> --region <region> --project <project-id>
kubectl cluster-info
kubectl get nodes -o wide

# All LangSmith pods
kubectl get pods -n langsmith

# Envoy Gateway
kubectl get pods -n envoy-gateway-system
kubectl get svc -n envoy-gateway-system

# cert-manager
kubectl get pods -n cert-manager
kubectl get certificate -n langsmith

# KEDA (LangSmith Deployment add-on)
kubectl get pods -n keda

# Cloud SQL connectivity test
kubectl run psql-test --rm -it --image=postgres:15 -n langsmith -- \
  psql "postgresql://langsmith:<password>@<cloud-sql-private-ip>:5432/langsmith" -c "SELECT version();"

# Memorystore connectivity test
kubectl run redis-test --rm -it --image=redis:7 -n langsmith -- \
  redis-cli -h <redis-private-ip> ping

# GCS connectivity test
kubectl run gcs-test --rm -it --image=google/cloud-sdk -n langsmith -- \
  gsutil ls gs://<bucket-name>
```

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-gcp-architecture.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>