<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: AWS Terraform architecture | https://docs.langchain.com/langsmith/self-host-terraform-aws-architecture -->

# AWS Terraform 架构

LangSmith 在 AWS EKS 上自托管的平台层、服务、IRSA 角色、网络和模块依赖项。

了解 [AWS Terraform modules](https://github.com/langchain-ai/terraform/tree/main/modules/aws) 的内容以及各部分如何组合在一起，以便您可以在运行 `make apply` 之前调整、保护和自定义 LangSmith 部署。

在规划部署或对现有部署进行故障排除时，请使用此页面作为参考。它涵盖：

* 平台层和应用程序核心服务。
* AWS 托管服务、IRSA 角色和集群基础设施。
* 网络拓扑、入口选项和 TLS/DNS 策略。
* LangSmith 部署插件。
* 模块依赖图和选择加入的安全模块。

如果您准备好安装，请从[deployment walkthrough](/langsmith/self-host-terraform-aws-deploy)开始。

## 平台层

AWS 上的 LangSmith 通过一个可选附加组件分两个阶段进行部署。基础设施阶段提供云基础。应用程序阶段安装 LangSmith Helm 图表。 LangSmith 部署附加组件是可选的，它添加了主机后端、侦听器和操作员服务，用于从 UI 管理 LangGraph 应用程序。

<img alt="LangSmith on AWS service layout" />|舞台|层 |添加了什么 |
| ------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ||基础设施| AWS 基础设施 | VPC + 私有/公有子网 + 单个 NAT 网关、EKS 集群 + 托管节点组 + 集群自动缩放程序、RDS PostgreSQL、ElastiCache Redis、S3 存储桶 + VPC 网关端点、ALB 控制器 + EBS CSI 驱动程序 + 指标服务器、k8s-bootstrap（KEDA、ESO、可选 Envoy 网关）。可选：网络防火墙、WAF、CloudTrail、ALB 访问日志。 |
|应用 |朗史密斯应用|后端、前端、playground、队列、ace-backend、clickhouse。存储：RDS PostgreSQL（元数据）+ S3（通过 VPC 端点跟踪 blob）。入口：ALB、NGINX、Envoy Gateway 或 Istio。                                                                                                                                                              |
|附加组件 (`enable_deployments = true`) | LangSmith 部署 |主机后端、侦听器、操作员。每个部署的图：api-server、queue、redis、postgres（操作员管理）。需要 KEDA（通过 k8s-bootstrap 与基础设施一起安装）。                                                                                                                                                                |## 组件到存储的映射

|组件|存储后端 |访问方式|
| ------------ | ---------------------------------- | ------------------------------------------ |
| `backend` | RDS PostgreSQL |私有子网、安全组|
| `backend` | S3桶| IRSA + VPC 网关端点 |
| `clickhouse` | EBS 卷（GP3、EKS PVC）|本地|
| `redis` | ElastiCache 或集群内 |私有子网、安全组|
|导光板运营商| RDS PostgreSQL（共享）|私有子网、安全组|

## 应用核心服务

这些 Pod 在每个部署上运行。所有写入日志和指标；较繁忙的组件（后端、队列、摄取队列）水平扩展。|服务 |目的|港口|羟丙胺 |爱尔兰税务局 |取决于 |
| ---------------------------- | ---------------------------------------------------------------------- | ---- | ------------------------ | | -------- | ------------------------------------------- |
| `langsmith-frontend` |反应用户界面 | 3000 | 3000 1 到 10 |没有 | `backend`、`platform-backend` |
| `langsmith-backend` |主要 API（跟踪、运行、项目、API 密钥、反馈）| 1984 | 3 至 10 |是（S3）| Postgres、Redis、ClickHouse、S3 |
| `langsmith-platform-backend` |组织和用户管理、身份验证、计费、设置 | 1986 | 1 到 10 |是（S3）| Postgres、Redis、S3 |
| `langsmith-playground` | LLM提示游乐场UI | 3001 | 3001 1 到 10 |没有 | `backend` |
| `langsmith-queue` |跟踪摄取工作人员（Redis 到 ClickHouse + S3）| — | 3 至 10 + 科达 |是的 | Redis、ClickHouse、S3 || `langsmith-ingest-queue` |专用的高吞吐量摄取工作人员 | — | 3 至 10 + 科达 |是的 | Redis、S3 |
| `langsmith-ace-backend` |异步计算（数据集运行、评估、后台作业）| — | 1 至 5 |没有 | Postgres、Redis |
| `langsmith-clickhouse` |列式存储（跟踪范围、运行元数据、评估结果）| — | StatefulSet，单个副本 |没有 | EBS GP3 PVC |

<Warning>
  集群内 ClickHouse 仅是 dev/POC（单个 pod，无复制，无备份）。对于生产使用[LangChain Managed ClickHouse](/langsmith/langsmith-managed-clickhouse)或自我管理的外部集群。
</Warning>

<Note>
  [SmithDB](https://www.langchain.com/blog/introducing-smithdb?utm_source=docs) 是 LangSmith 专门构建的可观测性后端，从自托管版本 0.16.0 开始可用于自托管（请参阅 [self-hosted support](/langsmith/smithdb-sdk-migration#about-self-hosted)）。这些 Terraform 模块提供 ClickHouse，因此前面部分中的指南适用于当前部署。
</Note>

### 一次性工作

Helm 图表在安装和升级时运行三个作业：|工作 |目的|
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `langsmith-backend-migrations` | PostgreSQL 架构迁移 |
| `langsmith-backend-ch-migrations` | ClickHouse 架构迁移 |
| `langsmith-backend-auth-bootstrap` |在 `langsmith-config` 中从 `initial_org_admin_password` 创建初始组织和管理员帐户 |

## LangSmith 部署插件

当`enable_deployments = true`时，安装了三个附加服务并注册了`LangGraphPlatform` CRD。用户在 LangSmith UI 中创建的每个部署都会在 `langsmith` 命名空间中生成一个 Kubernetes 部署，由操作员管理。|服务 |目的|
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `langsmith-host-backend` | LangGraph 控制平面 API。管理部署生命周期，提供部署元数据。用于 S3 访问的 IRSA。             |
| `langsmith-listener` |监视主机后端的部署状态更改，创建和更新 `LangGraphPlatform` CRD。用于 S3 访问的 IRSA。   |
| `langsmith-operator` | Kubernetes 运营商。协调 `LangGraphPlatform` CRD，为每个代理创建和删除部署和服务。 |

## AWS 托管服务

当 `postgres_source = "external"` 和 `redis_source = "external"`（建议的生产设置）时，Terraform 提供以下 AWS 托管服务：

### RDS PostgreSQL

* 默认大小：`db.t3.large`，私有子网，端口 5432。
* 保存组织、用户、项目、API 密钥、设置。
*秘密流程：SSM`/langsmith/{base_name}/postgres-password`→ESO→`langsmith-config`。

### ElastiCache Redis

* 默认大小：`cache.m6g.xlarge`，私有子网，TLS 端口 6379。
* 跟踪摄取队列、发布/订阅、短期缓存。
*秘密流程：SSM`/langsmith/{base_name}/redis-auth-token`→ESO→`langsmith-config`。

### S3桶* 跟踪有效负载：大量输入和输出、附件。
* IRSA 通过 `langsmith_irsa_role` （无静态密钥）。 VPC 网关端点，没有公共互联网。
* 前缀：`ttl_s/`（短 TTL）和 `ttl_l/`（长 TTL）。
* 无论层级如何，S3 存储桶始终是必需的。禁用 blob 存储会破坏大型负载上的集群。

### SSM 参数存储

* 所有 LangSmith 秘密的集中秘密存储。
* 流程：`source infra/scripts/setup-env.sh`将秘密写入SSM。 ESO `ClusterSecretStore` 读取它们并投射 Helm 图表通过 `config.existingSecretName` 挂载的 `langsmith-config` Kubernetes Secret。
* 前缀：`/langsmith/{name_prefix}-{environment}/`。

## 集群基础设施

两个 Terraform 模块安装 LangSmith 所依赖的集群级服务。 `eks`模块通过`eks-blueprints-addons`安装AWS集成控制器； `k8s-bootstrap` 模块安装工作负载依赖项和可选的入口网关（请参阅[Ingress options](#ingress-options)）：|服务 |安装者 |命名空间 |爱尔兰税务局 |目的|
| ------------------------------------------ | ---------------- | ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aws-load-balancer-controller` | `eks` | `kube-system` |是的 |从 Kubernetes Ingress 对象配置 AWS ALB。删除入口会取消配置 ALB 并在重新创建时分配新的 DNS 名称，这会破坏 DNS 记录和 OIDC 重定向 URI。 |
| `cluster-autoscaler` | `eks` | `kube-system` |是的 |根据 Pod 调度压力扩展 EC2 节点组。                                                                                                                                   || `ebs-csi-driver` | `eks` | `kube-system` |是的 |为 PersistentVolumeClaims（由 ClickHouse 使用）配置 EBS 卷。                                                                                                                    |
|科达| `k8s-bootstrap` | `keda` |没有 | Kubernetes 事件驱动的自动缩放。在 Redis 队列深度上缩放 `queue` 和 `ingest-queue`。 LangSmith 部署附加组件所需。                                                 |
|证书经理 | `k8s-bootstrap` | `cert-manager` |可选|使用 Route 53 IRSA 进行 DNS-01 质询，自动颁发 TLS 证书。仅当`tls_certificate_source = letsencrypt`或`create_cert_manager_irsa = true`时安装。         |
|外部秘密运营商| `k8s-bootstrap` | `external-secrets` |是的 |将 SSM 参数同步到 `langsmith-config` Kubernetes Secret。                                                                                                                        |

## IRSA 角色

IRSA 取代了静态凭证。 EKS集群的OIDC发行者是信任锚； `langsmith` 和 `kube-system` 中的服务帐户使用角色 ARN 进行注释，并且 Pod 通过 EKS 令牌 Webhook 接收临时凭证。|角色 |定义于 |使用者 |权限 |
| -------------------- | ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `langsmith_irsa_role` | `modules/eks` | `backend`、`platform-backend`、`queue`、`ingest-queue`、主机后端、侦听器 | LangSmith 铲斗上的`s3:GetObject`、`s3:PutObject`、`s3:DeleteObject`、`s3:ListBucket` |
| `aws_iam_role.eso` | `aws/infra/main.tf` | ESO控制器| `ssm:GetParameter`、`ssm:GetParameters`、`ssm:GetParametersByPath` 于 `/langsmith/*` |

## 网络拓扑

### 默认 ALB 入口

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TD
    Internet(["Internet"])
    ALB["AWS Application Load Balancer<br/>port 80/443, TLS via ACM or Let's Encrypt"]

    subgraph EKS["EKS cluster (private subnets)"]
        KubeSystem["kube-system<br/>aws-load-balancer-controller, cluster-autoscaler,<br/>ebs-csi-driver, keda"]
        LangSmith["langsmith<br/>backend, frontend, playground, queue, clickhouse"]
    end

    RDS[("RDS PostgreSQL<br/>private subnet")]
    Cache[("ElastiCache Redis<br/>private subnet, or in-cluster")]
    S3[("S3 bucket<br/>VPC Gateway Endpoint, no public route")]

    Internet -->|HTTPS| ALB
    ALB --> LangSmith
    LangSmith --> RDS
    LangSmith --> Cache
    LangSmith --> S3

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Internet trigger
    class ALB,KubeSystem,LangSmith process
    class RDS,Cache,S3 output
```

### Envoy 网关（选择加入）

使用 Terraform 默认值 (`enable_envoy_gateway = true`)，预配置的 ALB 位于前面，并通过 `TargetGroupBinding` 绑定到端口 8080 上的 Envoy 服务，如 [ingress options](#ingress-options) 表中所示。下面的独立网络负载均衡器路径是一个覆盖变体 (`helm/values/examples/langsmith-values-ingress-envoy-gateway.yaml`)，其中 NLB 直接终止 TLS：

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph TD
    Internet(["Internet"])
    NLB["AWS Network Load Balancer<br/>ACM TLS termination at 443"]

    subgraph EGS["envoy-gateway-system"]
        Envoy["Envoy proxy<br/>GatewayClass: eg, Gateway: langsmith-gateway"]
    end

    LangSmith["langsmith namespace<br/>backend, frontend, playground, queue, clickhouse"]
    Agents["langsmith-agents namespace (optional dataplane)<br/>langgraph-dataplane listener, operator, agent pods"]

    Internet -->|HTTPS| NLB
    NLB --> Envoy
    Envoy -->|HTTPRoute| LangSmith
    Envoy -->|HTTPRoute| Agents

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F
    classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33

    class Internet trigger
    class NLB process
    class Envoy decision
    class LangSmith,Agents output
```

`langsmith` 和 `langsmith-agents` 都通过 `HTTPRoute` 和 `allowedRoutes: All` 连接到共享的 `langsmith-gateway`。### 带有网络防火墙的出口路径

当`create_firewall = true`时，来自私有子网的所有出站互联网流量在到达 NAT 网关之前都会受到检查：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
EKS pods / RDS / ElastiCache (private subnets)
  → AWS Network Firewall (TLS SNI + HTTP Host inspection)
     ALLOWLIST: firewall_allowed_fqdns (default: beacon.langchain.com)
     DROP: all other established connections
  → NAT Gateway (public subnet)
  → Internet
```

Pod 到 Pod、Pod 到 RDS 以及 Pod 到 ElastiCache 流量使用本地 VPC 路由，并且永远不会触及防火墙。

## 入口选项

模块附带四个互斥的入口选项。该选择决定是否支持拆分数据平面（单独命名空间中的代理 Pod）。

|选项|变量|分裂|交通路线|何时使用 |
| ------------- | -------------------------------------- | -----| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| ALB（AWS LBC）| *默认* |没有 | `ALB → frontend NodePort` |默认。单命名空间部署、POC、通过 ACM 的最简单的 TLS。                          || NGINX 入口 | `enable_nginx_ingress = true` |没有 | `ALB → TGB → NGINX controller → frontend ClusterIP` |当 NGINX 成为您组织中的标准入口时。                                   |
|特使网关 | `enable_envoy_gateway = true` |是的 | `ALB → TGB → Envoy service:8080 → HTTPRoute → services` |跨命名空间 HTTPRoute 路由。建议在新的 AWS 部署上分割数据平面。 |
|伊斯蒂奥 | `enable_istio_gateway = true` |是的 | `ALB → TGB → istio-ingressgateway:80 → VirtualService → services` |已安装 Istio 的集群，或者需要 mTLS 网格时。                   |

### 为什么 ALB 不支持分割数据平面

标准 Kubernetes Ingress 是命名空间范围的。 ALB 控制器仅路由到与 Ingress 资源位于同一命名空间中的服务。 `langsmith-agents` 中的代理 Pod 对于 `langsmith` 中的 Ingress 是不可见的。 Envoy Gateway 和 Istio 都支持通过 Kubernetes Gateway API 进行跨命名空间路由。

### ALB 加 Envoy Gateway（链式）

当现有 ALB 已提供 SSO（Okta 或 Cognito OIDC）、WAF 和 TLS 时，Envoy Gateway 将插在其后面而不是替换它：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Internet
  → ALB (unchanged: WAF, SSO, TLS, DNS)
    → Envoy Gateway NLB (internal-scheme, auto-provisioned by k8s-bootstrap)
       → HTTPRoute → langsmith namespace        (control plane)
       → HTTPRoute → langsmith-agents namespace (split dataplane)
```

默认 ALB 路径的唯一更改是将 ALB 目标组重新定位到 Envoy NLB。请参阅模块存储库中的`helm/values/examples/langsmith-values-ingress-envoy-gateway.yaml`以了解值叠加。

## TLS 和 DNS

`tls_certificate_source`变量控制证书策略：|模式|行为 |兼容网关 |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ------------------- |
| `none` |仅 HTTP，无证书 |任何|
| `acm` | HTTPS:443，带有 HTTP→HTTPS 重定向。 ACM 证书，自动配置或 BYO。               | ALB、NGINX |
| `letsencrypt` |通过 cert-manager 和 Let's Encrypt 实现 HTTPS，使用通过 ALB 解决的 HTTP-01 质询 | ALB |

### 为什么选择 ACM 与 cert-manager

ACM 证书不可导出。 AWS 将它们直接附加到 ALB，这使得当 TLS 在 ALB 处终止时，ACM 成为正确的选择。当 TLS 在集群（Istio 网关、Envoy 网关）内部终止时，无法使用 ACM，因为这些网关需要证书材料作为 Kubernetes Secret。`letsencrypt` 源是 ALB 路径的参考实现：它安装 cert-manager，并将 Let's Encrypt HTTP-01 `ClusterIssuer` 绑定到 ALB 入口类。对于 Istio 或 Envoy 上的集群内 TLS，请设置 `create_cert_manager_irsa = true`，它使用通过 Route 53 验证的 DNS-01 `ClusterIssuer`。HTTP-01（通过 ALB）和 DNS-01（通过 Route 53）是互斥的。在生产中，将 `ClusterIssuer` 替换为任何与证书管理器兼容的颁发者。

|发行人 |何时使用 |
| --------------------------------------- | --------------------------------------------------- |
|让我们加密*（默认）* |公共领域，互联网接入，免费 |
| ACM 私有 CA (`aws-privateca-issuer`) | AWS 原生、气隙友好、私有域、付费 |
|韦纳菲 (`cert-manager-venafi`) |企业 PKI，受监管的环境 |
| HashiCorp Vault (`cert-manager-vault`) |自托管 PKI |
| DigiCert、Sectigo 等 | ACME 或自定义发行人插件 |

Terraform 模块提供 cert-manager IRSA 角色和 Route 53 权限。只有 `ClusterIssuer` 清单在发行人之间发生变化。### 自动配置 DNS

当 `langsmith_domain` 设置且 `acm_certificate_arn` 为空时，Terraform 激活 `dns` 模块，该模块创建：

* 域的 Route 53 托管区域。
* 带有 DNS 验证记录的 ACM 证书。
* 将域指向 ALB 的 Route 53 别名记录。

**分阶段部署模式：** 首先设置 `langsmith_domain` 和 `tls_certificate_source = "none"`。 Terraform 创建托管区域和证书，​​而不会阻止验证。将 NS 记录委托给您的注册商，然后在以后的申请中转到 `tls_certificate_source = "acm"`。 Terraform 会阻塞，直到证书验证并将其连接到 HTTPS 侦听器。

### 带上自己的证书

直接设置`acm_certificate_arn`可以跳过`dns`模块。对于集群内网关，请手动创建 Kubernetes TLS Secret 并在 Gateway 或 VirtualService 中引用它。

## 模块依赖图

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
vpc ─► firewall (optional, create_firewall = true)
│
├─► eks ─► k8s-bootstrap (KEDA, ESO, Envoy Gateway [opt-in])
│            └─► cert-manager (Let's Encrypt DNS-01 via Route 53 IRSA)
│
├─► postgres    (RDS, private subnets from VPC)
├─► redis       (ElastiCache, private subnets from VPC)
├─► storage     (S3 bucket + VPC Gateway Endpoint)
├─► alb         (pre-provisioned ALB, public subnets)
│     └─► alb_access_logs (S3 bucket for access logs, opt-in)
├─► dns         (Route 53 zone + ACM cert, optional)
├─► bastion     (jump host for private EKS access, optional)
├─► cloudtrail  (audit logging, optional)
├─► waf         (WAF ACL on ALB, optional)
└─► firewall    (Network Firewall egress filter, optional)
       all ─► langsmith (root module)
```

### 选择加入安全模块|模块|变量|默认 |目的|
| ---------------- | ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|网络防火墙| `create_firewall` | `false` |基于 FQDN 的出口过滤。仅允许`firewall_allowed_fqdns`（TLS SNI + HTTP 主机）中的域。需要`create_vpc = true`。成本 ≈ `$0.40/hr/endpoint + $0.065/GB processed`。 |
| ALB 访问日志 | `alb_access_logs_enabled` | `false` |流量分析与合规 |
|云踪 | `create_cloudtrail` | `false` | API 调用记录。如果组织跟踪已存在，则跳过。                                                                                                                     || WAF | `create_waf` | `false` | WAFv2 Web ACL：OWASP Top 10、IP 声誉、已知不良输入 |

## 默认资源大小

|资源 |默认| vCPU |内存|
| ----------------- | ------------------ | ---- | -------- |
| EKS节点| `m5.4xlarge` | 16 | 16 64GB|
| RDS PostgreSQL | `db.t3.large` | 2 | 8GB|
| ElastiCache Redis | `cache.m6g.xlarge` | 4 | 13.07 GB | 13.07 GB
| RDS存储| 10GB| — | — |

有关生产尺寸建议，请参阅 [scaling guide](/langsmith/self-host-scale) 和 [AWS deployment guide](/langsmith/self-host-terraform-aws-deploy#cluster-sizing-reference)。

## 已验证的行为和已知的约束

这些约束在 2026 年 4 月的网关排列测试运行期间得到了验证。| ＃|面积 |约束或修复 |
| - | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | ACM 通配符 SAN | `langchain.com` 有 `0 issue "amazon.com"` CAA，但没有 `0 issuewild "amazon.com"`。通配符 SAN 失败并显示 `CAA_ERROR`。 `dns` 模块仅请求顶点域。                                                                        |
| 2 |集群内Redis | LangSmith Helm 图表在没有 `requirepass` 的情况下部署 Redis。 `k8s_bootstrap`模块写入`redis://langsmith-redis:6379`。除非您还配置了 Helm 图表 Redis 值，否则请勿添加身份验证令牌。                                || 3 | `name_prefix`长度|最多 15 个字符。 `dz-nginx-tst`（12 个字符）之类的名称是有效的。                                                                                                                                                                    |
| 4 | Istio 端口 | Istio 1.23+ ingressgateway 通过 `NET_BIND_SERVICE` 侦听端口 80，而不是端口 8080。ALB TGB 运行状况检查和安全组规则必须以端口 80 为目标。
| 5 | NGINX TGB 端口 | NGINX ingress-nginx 控制器 Pod 侦听端口 80。TargetGroupBinding 目标类型为 `ip`。                                                                                                                                             |
| 6 | Envoy 网关端口 | Envoy Gateway 代理在 Kubernetes 服务的端口 8080 上公开。ALB TargetGroupBinding `servicePort` 必须为 8080，目标类型为 `ip`。                                                                                         || 7 |销毁订单|始终首先运行 `terraform destroy` 并让 Terraform 处理命名空间和 Helm 发布生命周期。预删除命名空间会导致 `helm_release` 资源超时，因为 Helm 无法干净地卸载到终止命名空间。 |
| 8 |卡住终止名称空间 | KEDA 的过时`external.metrics.k8s.io/v1beta1` API 组导致`NamespaceDeletionDiscoveryFailure`。修复：重新运行 `terraform destroy` 之前的`kubectl delete apiservice v1beta1.external.metrics.k8s.io`。                                   |

## 验证命令

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# EKS cluster status
aws eks describe-cluster --name <cluster-name> --query "cluster.status"

# Node health
kubectl get nodes -o wide

# ALB status
kubectl get ingress -n langsmith

# RDS status
aws rds describe-db-instances \
  --query "DBInstances[?DBInstanceIdentifier=='<db-id>'].DBInstanceStatus"

# ElastiCache status
aws elasticache describe-replication-groups \
  --query "ReplicationGroups[?ReplicationGroupId=='<group-id>'].Status"

# S3 access from a pod (via VPC endpoint)
kubectl run s3-test --rm -it --image=amazon/aws-cli -n langsmith -- \
  aws s3 ls s3://<bucket-name>
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-terraform-aws-architecture.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>