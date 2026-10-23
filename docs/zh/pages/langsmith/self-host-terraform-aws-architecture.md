<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform architecture | https://docs.langchain.com/langsmith/self-host-terraform-aws-architecture -->

# AWS Terraform 架构

AWS EKS 上自托管的 LangSmith 的平台层、服务、IRSA 角色、网络和模块依赖项。

了解 [AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 的配置以及各部分如何组合在一起，以便您可以在运行 `make apply` 之前调整、保护和自定义 LangSmith 部署。

在规划部署或对现有部署进行故障排除时，请使用此页面作为参考。它涵盖：

* 平台层和应用程序核心服务。
* AWS 托管服务、IRSA 角色和集群基础设施。
* 网络拓扑、入口选项和 TLS/DNS 策略。
* LangSmith 部署插件。
* 模块依赖图和选择加入的安全模块。

如果您准备好安装，请从[deployment walkthrough](/langsmith/self-host-terraform-aws-deploy)开始。

## 平台层

AWS 上的LangSmith 分两个阶段部署，并带有一个可选附加组件。基础设施阶段提供云基础。应用阶段安装LangSmithHelm图表。 LangSmith 部署附加组件是可选的，并添加主机后端、侦听器和操作员服务，用于从 UI 管理 LangGraph 应用程序。

![LangSmith on AWS service layout](https://mintcdn.com/langchain-5e9cc07a/D6uoP5M0BV8YGC-1/images/self-hosted-terraform/aws-architecture.png?fit=max\&auto=format\&n=D6uoP5M0BV8YGC-1\&q=85\&s=b5c82e77df6510b1c3d0d8589ffc4ae7)|舞台|层 |添加了什么 |
| - | - | - |
|基础设施| AWS 基础设施 | VPC + 私有/公有子网 + 单个 NAT 网关、EKS 集群 + 托管节点组 + 集群自动缩放程序、RDS PostgreSQL、ElastiCache Redis、S3 存储桶 + VPC 网关端点、ALB + ALB 控制器 + EBS CSI 驱动程序 + 指标服务器、k8s-bootstrap（默认情况下为 KEDA、ESO、Envoy 网关）。可选：网络防火墙、WAF、CloudTrail、ALB 访问日志、SmithDB、沙箱。 |
|应用 | LangSmith 应用 |后端、前端、playground、队列、ace-backend、clickhouse。存储：RDS PostgreSQL（元数据）+ S3（通过 VPC 端点跟踪 blob）。入口：Terraform ALB 转发到 Envoy Gateway（默认）、Istio 或 NGINX。通过`enable_envoy_gateway = false`，ALB 控制器为 Ingress 提供自己的 ALB。 |
|附加组件 (`enable_deployments = true`) | LangSmith 部署 |主机后端、侦听器、操作员。每个部署的图：api-server、queue、redis、postgres（操作员管理）。需要 KEDA（通过 k8s-bootstrap 与基础设施一起安装）。 |

## 组件到存储的映射|组件|存储后端 |访问方式 |
| - | - | - |
| `backend` | RDS PostgreSQL |私有子网、安全组|
| `backend` | S3桶| IRSA + VPC 网关端点 |
| `clickhouse` | EBS 卷（GP3、EKS PVC）|本地|
| `redis` | ElastiCache 或集群内 |私有子网、安全组|
|导光板运营商| RDS PostgreSQL（共享）|私有子网、安全组|

## 应用核心服务

这些 Pod 在每个部署上运行。所有写入日志和指标；较繁忙的组件（后端、队列、摄取队列）水平扩展。|服务 |目的|港口|羟丙胺 |爱尔兰税务局 |取决于 |
| - | - | - | - | - | - |
| `langsmith-frontend` |反应用户界面 | 3000 | 3000 1 到 10 |没有 | `backend`、`platform-backend` |
| `langsmith-backend` |主要 API（跟踪、运行、项目、API 密钥、反馈）| 1984 | 3 至 10 |是（S3）| Postgres、Redis、ClickHouse、S3 |
| `langsmith-platform-backend` |组织和用户管理、身份验证、计费、设置 | 1986 | 1 到 10 |是（S3）| Postgres、Redis、S3 |
| `langsmith-playground` | LLM提示操场UI | 3001 | 3001 1 到 10 |是（基岩，当 `enable_bedrock_access = true` 时）| `backend` |
| `langsmith-queue` |跟踪摄取工作人员（Redis 到 ClickHouse + S3）|无 | 3 至 10 + 科达 |是的 | Redis、ClickHouse、S3 |
| `langsmith-ingest-queue` |专用的高吞吐量摄取工作人员 |无 | 3 至 10 + 科达 |是的 | Redis、S3 |
| `langsmith-ace-backend` |异步计算（数据集运行、评估、后台作业）|无 | 1 至 5 |没有 | Postgres、Redis |
| `langsmith-clickhouse` |列式存储（跟踪范围、运行元数据、评估结果）|无 | StatefulSet，单个副本 |没有 | EBS GP3 PVC |

> [!警告]
>
> 集群内 ClickHouse 仅适用于 dev/POC（单个 pod，无复制，无备份）。对于生产使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)或自我管理的外部集群。> [!注意]
>
> [SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs) 是 LangSmith 专门构建的可观测性后端，从 Chart v16 开始可用于自托管（请参阅 [self-hosted support](/langsmith/smithdb-sdk-migration#about-self-hosted)）。 AWS 模块默认配置 ClickHouse。设置 `enable_smithdb = true` 还提供 SmithDB 的依赖项：专用元存储 RDS PostgreSQL 实例（默认为 `smithdb_metastore_source = "create"`）、S3 对象存储存储桶、IRSA 角色以及用于 NVMe 实例存储节点的 Karpenter NodePools。 ClickHouse 在图表 v16 和 v17 上保持启用状态。请参阅部署指南中的[SmithDB](/langsmith/self-host-terraform-aws-deploy#smithdb)。

### 一次性工作

Helm 图表在安装和升级时运行三个作业：

|工作 |目的|
| - | - |
| `langsmith-backend-migrations` | PostgreSQL 架构迁移 |
| `langsmith-backend-ch-migrations` | ClickHouse 架构迁移 |
| `langsmith-backend-auth-bootstrap` |在 `langsmith-config` 中从 `initial_org_admin_password` 创建初始组织和管理员帐户 |

## LangSmith 部署插件

当`enable_deployments = true`时，安装了三个附加服务并注册了`LangGraphPlatform` CRD。用户在 LangSmith UI 中创建的每个部署都会在 `langsmith` 命名空间中生成一个 Kubernetes 部署，由操作员管理。|服务 |目的|
| - | - |
| `langsmith-host-backend` | LangGraph 控制平面 API。管理部署生命周期，提供部署元数据。用于 S3 访问的 IRSA。 |
| `langsmith-listener` |监视主机后端的部署状态更改，创建和更新 `LangGraphPlatform` CRD。用于 S3 访问的 IRSA。 |
| `langsmith-operator` | Kubernetes 运营商。协调 `LangGraphPlatform` CRD，为每个代理创建和删除部署和服务。 |

## AWS 托管服务

当 `postgres_source = "external"` 和 `redis_source = "external"`（建议的生产设置）时，Terraform 提供以下 AWS 托管服务。

当 Fleet、LangSmith Chat 或 Insights 使用外部存储时，它们共享 RDS 实例和 Redis 集群。集群内作业创建每个功能的逻辑数据库，每个功能都有自己的 Redis DB 索引：1 表示 Fleet，2 表示 LangSmith Chat，3 表示 Insights。 DB 0 属于主安装。

### RDS PostgreSQL* 默认大小：`db.t3.large`，私有子网，端口 5432。
* 默认值：PostgreSQL 16、存储加密、10GB 自动缩放至 100GB、7 天备份、删除保护打开、启用 IAM 数据库身份验证。
* 保存组织、用户、项目、API 密钥、设置。
* 秘密流程：`setup-env.sh`将密码存储在SSM `/langsmith/{base_name}/postgres-password`并将其传递给Terraform，Terraform将其设置在实例上并将`connection_url`写入`langsmith-postgres` Kubernetes Secret。

### ElastiCache Redis

* 默认大小：`cache.m6g.xlarge`，私有子网，TLS 端口 6379。
* Redis 7.1，单个缓存节点，静态和传输中加密。
* 跟踪摄取队列、发布/订阅、短期缓存。
* 秘密流程：`setup-env.sh` 将身份验证令牌存储在 SSM `/langsmith/{base_name}/redis-auth-token` 并将其传递给 Terraform，Terraform 将其设置在复制组上并将 `connection_url` 写入 `langsmith-redis` Kubernetes Secret。

### 沙箱 JuiceFS Redis

当 `enable_sandboxes = true` 时，Terraform 为 JuiceFS 沙盒文件系统提供第二个专用 ElastiCache Redis（`{base_name}-jfs-redis`、默认 `cache.m6g.large`、`noeviction` 参数组、7 天快照）。它还添加了一个 `sandbox-host` 托管节点组（默认 `m5d.metal`，受污染的 `sandbox.langsmith.com/host`）。

### S3桶* 跟踪有效负载：大量输入和输出、附件。
* IRSA 通过 `langsmith_irsa_role` （无静态密钥）。 VPC 网关端点，没有公共互联网。
* 当设置 `s3_kms_key_arn` 时，使用 SSE-S3 或 SSE-KMS 加密。公共访问被阻止，存储桶策略通过 VPC 终端节点授予 LangSmith IRSA 角色访问权限。
* 前缀：`ttl_s/`（短 TTL）和 `ttl_l/`（长 TTL）。
* 无论层级如何，S3 存储桶始终是必需的。禁用 blob 存储会破坏大型负载上的集群。

### SSM 参数存储

* 所有 LangSmith 秘密的集中秘密存储。
* 流程：`source infra/scripts/setup-env.sh`将秘密写入SSM。 ESO `ClusterSecretStore` 读取它们并投射 Helm 图表通过 `config.existingSecretName` 挂载的 `langsmith-config` Kubernetes Secret。
* 前缀：`/langsmith/{name_prefix}-{environment}/`。

## 集群基础设施

两个 Terraform 模块安装LangSmith 所依赖的集群级服务。 `eks` 模块通过 `eks-blueprints-addons` 安装 AWS 集成控制器，并将 EBS CSI 驱动程序作为 EKS 附加组件安装； `k8s-bootstrap` 模块安装工作负载依赖项和入口网关（请参阅[Ingress options](#ingress-options)）：|服务 |安装者 |命名空间 |爱尔兰税务局 |目的|
| - | - | - | - | - |
| `aws-load-balancer-controller` | `eks` | `kube-system` |是的 |通过 `TargetGroupBinding` 向 Terraform 管理的 ALB 注册 pod，并在 ALB Ingress 模式下从 Kubernetes Ingress 对象配置 ALB。 |
| `cluster-autoscaler` | `eks` | `kube-system` |是的 |根据 Pod 调度压力扩展 EC2 节点组。 |
| `ebs-csi-driver` | `eks` | `kube-system` |是的 |为 PersistentVolumeClaims（由 ClickHouse 使用）配置 EBS 卷。 |
|卡彭特| `eks` | `karpenter` |是的 |配置 SmithDB 的 NVMe 实例存储和计算节点。仅当`enable_smithdb = true`时安装。 |
|科达| `k8s-bootstrap` | `keda` |没有 | Kubernetes 事件驱动的自动缩放。在 Redis 队列深度上缩放 `queue` 和 `ingest-queue`。 LangSmith 部署附加组件所需。 |
|特使网关 | `k8s-bootstrap` | `envoy-gateway-system` |没有 | ALB 后面的默认入口网关。当您选择 Istio、NGINX 或 ALB Ingress 时会跳过。 |
|证书经理 | `k8s-bootstrap` | `cert-manager` |可选|自动颁发 TLS 证书。对于 `tls_certificate_source = letsencrypt`，它通过 ALB 使用 HTTP-01 颁发者，不需要 IRSA。对于 `create_cert_manager_irsa = true`，它通过具有 IRSA 角色的 Route 53 使用 DNS-01。仅在这两种情况下安装。 ||外部秘密运营商| `k8s-bootstrap` | `external-secrets` |是的 |将 SSM 参数同步到 `langsmith-config` Kubernetes Secret。 |

## IRSA 角色

IRSA 取代了静态凭证。 IAM 信任 EKS 集群的 OIDC 发行者； `langsmith`、`kube-system`、`external-secrets`、`cert-manager` 和（使用 SmithDB）`karpenter` 中的服务帐户使用角色 ARN 进行注释，并且 pod 通过 EKS 令牌 Webhook 接收临时凭证。

|角色 |定义于 |使用者 |权限|
| - | - | - | - |
| `langsmith_irsa_role` (`{cluster_name}-irsa-role`) | `modules/eks` | LangSmith命名空间中的任何服务帐户：`backend`、`platform-backend`、`queue`、`ingest-queue`、`playground`、主机后端、侦听器、操作员和队列、LangSmith聊天和 Insights 工作线程 | LangSmith 铲斗上的`s3:GetObject`、`s3:PutObject`、`s3:DeleteObject`、`s3:ListBucket`，以及`enable_bedrock_access = true` 时的`bedrock:InvokeModel*`、`bedrock:ListFoundationModels` 和`bedrock:GetFoundationModel` |
| `aws_iam_role.eso` | `aws/infra/main.tf` | ESO控制器|部署区域中`/langsmith/{base_name}/*`上的`ssm:GetParameter`、`ssm:GetParameters`、`ssm:GetParametersByPath` |
| `aws_iam_role.cert_manager` | `modules/cert-manager` | `cert-manager` |该区域内有 53 号公路`ChangeResourceRecordSets` 和 `ListResourceRecordSets`，以及 `GetChange` 和 `ListHostedZonesByName`。仅当`create_cert_manager_irsa = true`时存在。 |
| `aws_iam_role.smithdb` | `modules/smithdb` | SmithDB Pod |对 SmithDB 存储桶进行读取、写入和多部分访问，以及设置该密钥后的 KMS。仅当`enable_smithdb = true`时存在。 |
| `AmazonEKSTFEBSCSIRole-*` | `modules/eks` | `ebs-csi-controller-sa` | EBS 卷管理 |

## 网络拓扑### VPC 和私有端点

通过`create_vpc = true`，该模块可以跨最多三个可用区构建`10.0.0.0/16` VPC，并在`us-west-1`等两个AZ区域中工作。它使用 /21 私有和公共子网以及单个 NAT 网关。

该模块创建一个 VPC 端点，一个 S3 网关端点。当您使用没有 NAT 或互联网出口 (`create_vpc = false`) 的 VPC 时，创建启用了私有 DNS 的 `com.amazonaws.<region>.ecr.api` 和 `com.amazonaws.<region>.ecr.dkr` 接口终端节点，附加到允许来自 VPC CIDR 的 TCP 443 的安全组，以便节点可以提取映像。

设置 `alb_existing_security_group_id`、`postgres_existing_security_group_id`、`redis_existing_security_group_id` 或 `bastion_existing_security_group_id` 以附加您管理的安全组。 Terraform 会附加它，但从不为其编写规则。

### 默认入口（ALB 和 Envoy 网关）

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TD
    Internet(["Internet"])
    ALB["AWS Application Load Balancer<br/>port 80/443, TLS via ACM"]

    subgraph EKS["EKS cluster (private subnets)"]
        EGS["envoy-gateway-system<br/>Envoy proxy, ClusterIP Service,<br/>TargetGroupBinding"]
        KubeSystem["kube-system<br/>aws-load-balancer-controller, cluster-autoscaler,<br/>ebs-csi-driver"]
        LangSmith["langsmith<br/>backend, frontend, playground, queue, clickhouse"]
    end

    RDS[("RDS PostgreSQL<br/>private subnet")]
    Cache[("ElastiCache Redis<br/>private subnet, or in-cluster")]
    S3[("S3 bucket<br/>VPC Gateway Endpoint, no public route")]

    Internet -->|HTTPS| ALB
    ALB -->|target group, pod port 10080| EGS
    EGS -->|HTTPRoute| LangSmith
    LangSmith --> RDS
    LangSmith --> Cache
    LangSmith --> S3

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Internet trigger
    class ALB,EGS,KubeSystem,LangSmith process
    class RDS,Cache,S3 output
```

### Envoy Gateway 分割数据平面

使用默认的 Envoy 网关，ALB 通过内部 `ClusterIP` Envoy 服务（端口 80）上的 `TargetGroupBinding` 转发到端口 10080 上的 Envoy 代理 Pod。 ALB 终止 TLS。代理 Pod 可以在单独的 `langsmith-agents` 命名空间中运行：

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TD
    Internet(["Internet"])
    ALB["AWS Application Load Balancer<br/>ACM TLS termination at 443"]

    subgraph EGS["envoy-gateway-system"]
        Envoy["Envoy proxy<br/>GatewayClass: eg"]
    end

    LangSmith["langsmith namespace<br/>Gateway: langsmith-gateway<br/>backend, frontend, playground, queue, clickhouse"]
    Agents["langsmith-agents namespace (optional dataplane)<br/>langgraph-dataplane listener, operator, agent pods"]

    Internet -->|HTTPS| ALB
    ALB --> Envoy
    Envoy -->|HTTPRoute| LangSmith
    Envoy -->|HTTPRoute| Agents

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Internet trigger
    class ALB process
    class Envoy decision
    class LangSmith,Agents output
```

`langsmith` 和 `langsmith-agents` 都通过 `HTTPRoute` 和 `allowedRoutes: All` 连接到共享的 `langsmith-gateway`。

### 带有网络防火墙的出口路径

当`create_firewall = true`时，来自私有子网的所有出站互联网流量在到达 NAT 网关之前都会受到检查：```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
EKS pods / RDS / ElastiCache (private subnets)
  → AWS Network Firewall (TLS SNI + HTTP Host inspection)
     ALLOWLIST: firewall_allowed_fqdns (default: beacon.langchain.com)
     DROP: all other established connections
  → NAT Gateway (public subnet)
  → Internet
```

Pod 到 Pod、Pod 到 RDS 以及 Pod 到 ElastiCache 流量使用本地 VPC 路由，并且永远不会触及防火墙。

## 入口选项

模块附带四个互斥的入口选项。 Terraform 管理的 ALB 面向 Envoy Gateway、NGINX 和 Istio。在 ALB 入口模式下，AWS 负载均衡器控制器会配置自己的 ALB，而 Terraform ALB 将不被使用。该选择决定是否支持拆分数据平面（单独命名空间中的代理 Pod）。

|选项 |变量|分裂|交通路线|何时使用 |
| - | - | - | - | - |
|特使网关 | *默认*（`enable_envoy_gateway` 未设置）|是的 | `ALB → TGB → Envoy pods:10080 → HTTPRoute → services` |默认。跨命名空间 HTTPRoute 路由和分割数据平面。 |
| ALB 入口 (AWS LBC) | `enable_envoy_gateway = false` |没有 | `ALB (controller-managed, target type ip) → frontend pods` |需要普通 Kubernetes Ingress 的单命名空间部署。 |
| NGINX 入口 | `enable_nginx_ingress = true` |没有 | `ALB → TGB → NGINX controller → frontend ClusterIP` |当 NGINX 成为您组织中的标准入口时。 |
|伊斯蒂奥 | `enable_istio_gateway = true` |是的 | `ALB → TGB → istio-ingressgateway:80 → VirtualService → services` |已安装 Istio 的集群，或者需要 mTLS 网格时。 |

除非您设置 `enable_istio_gateway` 或 `enable_nginx_ingress`，否则 Envoy 将处于开启状态。显式设置 `enable_envoy_gateway = false` 以使用 ALB Ingress。

### 为什么 ALB Ingress 不支持分割数据平面标准 Kubernetes Ingress 是命名空间范围的。 ALB 控制器仅路由到与 Ingress 资源位于同一命名空间中的服务。 `langsmith-agents` 中的代理 Pod 对于 `langsmith` 中的 Ingress 是不可见的。 Envoy Gateway 和 Istio 都支持通过 Kubernetes Gateway API 进行跨命名空间路由。

### ALB 位于 Envoy 网关前

在默认布局中，ALB 处理 TLS 和 DNS，Envoy Gateway 位于其后面。附加到 ALB 的可选 WAF：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Internet
  → ALB (TLS, DNS, optional WAF)
    → Envoy proxy pods (ClusterIP Service, TargetGroupBinding from k8s-bootstrap)
       → HTTPRoute → langsmith namespace        (control plane)
       → HTTPRoute → langsmith-agents namespace (split dataplane)
```

ALB 目标组转发到端口 10080 上的 Envoy 代理 Pod。不需要值覆盖； `make init-values` 写入网关设置。

## TLS 和 DNS

`tls_certificate_source`变量控制证书策略：

|模式|行为 |兼容网关 |
| - | - | - |
| `none` |仅 HTTP，无证书 |任何|
| `acm` | HTTPS:443，带有 HTTP 到 HTTPS 重定向。 ACM 证书，自动配置或 BYO。 |任何（TLS 在 ALB 处终止）|
| `letsencrypt` |通过 cert-manager 和 Let's Encrypt 实现 HTTPS，使用通过 ALB 解决的 HTTP-01 质询 |仅 ALB 入口 |

### 为什么选择 ACM 与 cert-managerACM 证书不可导出。 AWS 将它们直接附加到 ALB，这使得当 TLS 在 ALB 处终止时，ACM 成为正确的选择。对于模块的网关，TLS 仍终止于 ALB，因此 ACM 可与 Envoy、Istio 和 NGINX 配合使用。仅当您希望 TLS 在集群内终止时才需要 cert-manager。

`letsencrypt` 源是 ALB 路径的参考实现：它安装 cert-manager，并将 Let's Encrypt HTTP-01 `ClusterIssuer` 绑定到 ALB 入口类。对于 Istio 上的集群内 TLS，请设置 `create_cert_manager_irsa = true`，它使用通过 Route 53 验证的 DNS-01 `ClusterIssuer`。HTTP-01（通过 ALB）和 DNS-01（通过 Route 53）是互斥的。在生产中，将 `ClusterIssuer` 替换为任何与证书管理器兼容的颁发者。

|发行人 |何时使用 |
| - | - |
|让我们加密*（默认）* |公共领域，互联网接入，免费 |
| ACM 私有 CA (`aws-privateca-issuer`) | AWS 原生、气隙友好、私有域、付费 |
|韦纳菲 (`cert-manager-venafi`) |企业 PKI，受监管的环境 |
| HashiCorp Vault (`cert-manager-vault`) |自托管 PKI |
| DigiCert、Sectigo 等 | ACME 或自定义发行者插件 |通过 `create_cert_manager_irsa = true`，Terraform 模块提供了 cert-manager IRSA 角色和 Route 53 权限。只有 `ClusterIssuer` 清单在发行人之间发生变化。

### 自动配置 DNS

当 `langsmith_domain` 设置且 `acm_certificate_arn` 为空时，Terraform 激活 `dns` 模块，该模块创建：

* 域的 Route 53 公共托管区域，或者使用 `dns_create_zone = false` 和 `dns_existing_zone_id`，现有公共区域中的记录（确切的区域或父区域；不需要 NS 委派）。
* 带有 DNS 验证记录的 ACM 证书。添加带有 `dns_include_wildcard_san = true` 的 `*.<domain>` SAN。
* 将域指向 Terraform 管理的 ALB 的 Route 53 别名记录。在 ALB Ingress 模式下，ALB 未使用，因此请自行将域指向 Ingress 主机名 (`kubectl get ingress -n langsmith`)。

**分阶段部署模式：** 首先设置 `langsmith_domain` 和 `tls_certificate_source = "none"`。 Terraform 创建托管区域和证书，​​而不会阻止验证。将 NS 记录委托给您的注册商，然后在以后的申请中转到 `tls_certificate_source = "acm"`。 Terraform 会阻塞，直到证书验证并将其连接到 HTTPS 侦听器。

### 带上自己的证书直接设置`acm_certificate_arn`可以跳过`dns`模块。对于在集群内部终止的 TLS，请手动创建 Kubernetes TLS Secret 并在网关或 VirtualService 中引用它。

## 模块依赖图

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vpc ─► firewall (optional, create_firewall = true)
│
├─► eks ─► k8s-bootstrap (KEDA, ESO, Envoy Gateway [default])
│            └─► cert-manager (optional: HTTP-01 via ALB, or DNS-01 via the cert_manager IRSA module)
│
├─► postgres    (RDS, private subnets from VPC)
├─► redis       (ElastiCache, private subnets from VPC)
├─► storage     (S3 bucket + VPC Gateway Endpoint)
├─► alb         (always created; public subnets, or private when alb_scheme = internal)
│     └─► alb_access_logs (S3 bucket for access logs, opt-in)
├─► dns         (Route 53 zone + ACM cert, optional)
├─► cert_manager (IRSA role for DNS-01, create_cert_manager_irsa = true)
├─► sandbox_juicefs_redis (dedicated ElastiCache, enable_sandboxes = true)
├─► smithdb     (metastore RDS + S3 + IRSA, enable_smithdb = true)
├─► bastion     (jump host for private EKS access, optional)
├─► cloudtrail  (audit logging, optional)
└─► waf         (WAF ACL on ALB, optional)
       all ─► langsmith (root module)
```

### 选择加入安全模块

|模块|变量|默认|目的|
| - | - | - | - |
|网络防火墙| `create_firewall` | `false` |基于 FQDN 的出口过滤。仅允许`firewall_allowed_fqdns`（TLS SNI + HTTP 主机）中的域。需要`create_vpc = true`。成本 ≈ `$0.40/hr/endpoint + $0.065/GB processed`。 |
| ALB 访问日志 | `alb_access_logs_enabled` | `false` |流量分析与合规 |
|云踪| `create_cloudtrail` | `false` | API 调用记录。如果组织跟踪已存在，则跳过。 |
| WAF | `create_waf` | `false` | WAFv2 Web ACL：OWASP Top 10、IP 声誉、已知不良输入 |

## 默认资源大小

|资源 |默认| vCPU |内存|
| - | - | - | - |
| EKS节点| `m5.4xlarge` | 16 | 16 64GB|
| RDS PostgreSQL | `db.t3.large` | 2 | 8GB|
| ElastiCache Redis | `cache.m6g.xlarge` | 4 | 13.07 GB | 13.07 GB
| RDS存储| 10GB|不适用 |不适用 |`terraform.tfvars.production`、`terraform.tfvars.dev` 和 `terraform.tfvars.minimum` 更改这些尺寸。生产使用`db.r6g.xlarge`。 Dev 使用 `m5.2xlarge` 节点以及 `db.t3.medium` 和 `cache.t3.medium`。最少使用 `m5.xlarge` 与 `db.t3.small` 和 `cache.t3.small`。 `sizing_profile`（`production`、`production-large`、`dev`、`minimum` 或 `default`）选择匹配的 Helm 尺寸覆盖； `default` 保留图表默认值。

有关生产尺寸建议，请参阅 [scaling guide](/langsmith/self-host-scale) 和 [AWS deployment guide](/langsmith/self-host-terraform-aws-deploy#cluster-sizing-reference)。

## 已验证的行为和已知的约束

这些约束在 2026 年 4 月的网关排列测试运行期间得到了验证。| ＃|面积 |约束或修复 |
| - | - | - |
| 1 | ACM 通配符 SAN | `langchain.com` 有 `0 issue "amazon.com"` CAA，但没有 `0 issuewild "amazon.com"`。通配符 SAN 失败并显示 `CAA_ERROR`。默认情况下，`dns`模块仅请求顶点域。 `dns_include_wildcard_san = true` 添加了 `*.<domain>`，它需要 Amazon 的 `issuewild` CAA 记录。 |
| 2 |集群内Redis | LangSmith Helm 图表部署 Redis，无需 `requirepass`。 `k8s_bootstrap`模块写入`redis://langsmith-redis:6379`。除非您还配置了 Helm 图表 Redis 值，否则请勿添加身份验证令牌。 |
| 3 | `name_prefix`长度|最多 15 个字符。诸如 `dz-nginx-tst`（12 个字符）之类的名称是有效的。 |
| 4 | Istio 端口 | Istio 1.23 或更高版本的 ingressgateway 通过 `NET_BIND_SERVICE` 侦听端口 80，而不是端口 8080。ALB TGB 运行状况检查和安全组规则必须以端口 80 为目标。
| 5 | NGINX TGB 端口 | NGINX ingress-nginx 控制器 Pod 侦听端口 80。TargetGroupBinding 目标类型为 `ip`。 |
| 6 | Envoy 网关端口 | Envoy 代理 Pod 侦听端口 10080（网关的端口 80 加上 Envoy 的非 root 端口 10000 偏移量）。 ALB目标组和节点安全组规则使用10080； TargetGroupBinding 引用端口 80 上的 Envoy `ClusterIP` 服务，目标类型为 `ip`。 || 7 |销毁订单 |在 `make destroy` 之前运行 `make uninstall`。有关完整序列，包括删除保护应用和清空跟踪存储桶，请参阅[Teardown](/langsmith/self-host-terraform-aws-quick-reference#teardown)。不要预删除命名空间：Helm 无法干净地卸载到终止命名空间，因此 `helm_release` 资源超时。 |
| 8 |卡住终止名称空间 | KEDA 的陈旧`external.metrics.k8s.io/v1beta1` API 组导致`NamespaceDeletionDiscoveryFailure`。修复：清除命名空间的`spec.finalizers`，并使用`kubectl replace --raw "/api/v1/namespaces/<ns>/finalize" -f -`将结果提交到finalize子资源，然后重新运行`make destroy`。 |

## 验证命令

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# EKS cluster status
aws eks describe-cluster --name <cluster-name> --query "cluster.status"

# Node health
kubectl get nodes -o wide

# ALB target registration and routes (default Envoy Gateway mode)
kubectl get targetgroupbinding -A
kubectl get httproute -n langsmith

# ALB Ingress or NGINX mode only
kubectl get ingress -n langsmith

# RDS status
aws rds describe-db-instances \
  --query "DBInstances[?DBInstanceIdentifier=='<db-id>'].DBInstanceStatus"

# ElastiCache status
aws elasticache describe-replication-groups \
  --query "ReplicationGroups[?ReplicationGroupId=='<group-id>'].Status"

# S3 access from a pod (via VPC endpoint). Run the pod as an annotated service
# account; other service accounts have no AWS credentials. The image entrypoint
# is already `aws`.
kubectl run s3-test --rm -it --image=amazon/aws-cli -n langsmith \
  --overrides='{"spec":{"serviceAccountName":"<annotated-service-account>"}}' -- \
  s3 ls s3://<bucket-name>
```

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-architecture.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。