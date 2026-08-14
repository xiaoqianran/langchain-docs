<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC architecture | https://docs.langchain.com/langsmith/byoc-architecture -->

# BYOC 架构

如何跨 AWS 账户中的 LangChain 控制平面和数据平面构建 LangSmith BYOC 部署。

## 控制平面和数据平面模型

BYOC 部署分为两个平面。本页描述了每个平面的组件、它们如何通信以及您帐户中的 LangChain 规定。

**控制平面**在LangChain的云中运行并处理身份验证、组织配置和计费。它配置、监控和编排您的部署，但不保存任何敏感的应用程序数据。

**数据平面**在您的 AWS 账户中运行，并摄取、存储和查询您的所有敏感应用程序数据。它保存您的 VPC、EKS 集群、数据库和其他资源。

下表总结了拆分情况：|飞机|它在哪里运行 |它包含什么 |
| ----------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **控制平面** | LangChain的云，`us-east-2` |身份验证、组织和工作区配置、计费和使用元数据、LangSmith API 密钥以及静态前端资产 |
| **数据平面** |您选择的区域中的 AWS 账户 |跟踪、提示、数据集、评估器、实验、见解运行、注释队列、代理部署、工作区机密和其他应用程序数据 |

<img alt="BYOC architecture diagram. The LangSmith UI and the client apps in your application VPC both reach the data plane over one private connection, using PrivateLink, VPC peering, or Tailscale, which terminates at a network load balancer. The load balancer feeds an Istio ingress in an EKS cluster in your AWS account, which routes to the LangSmith services that run the backend, SmithDB, and sandboxes, and those services read and write S3, RDS, and ElastiCache. The LangChain cloud control plane holds Crossplane, on-call engineers, alerting, and the LangSmith control plane services. It reaches the cluster over PrivateLink for scaling and upgrades, receives auth and telemetry back over a second PrivateLink, and assumes an IAM role in your account to provision resources." />

## 配置资源

LangChain 在您的帐户中提供以下内容：* **VPC**：分布在区域可用区的专用 VPC，默认情况下完全私有。它使用 VPC 终端节点与 AWS 服务进行私有通信，并使用 PrivateLink 在数据平面和控制平面之间进行通信。
* **托管数据库**：用于关系工作负载的 RDS，以及用于缓存的 ElastiCache。
* **存储**：用于保存跟踪数据、VPC 流日志和 ClickHouse 备份的 Blob 存储的 S3 存储桶。
* **EKS**：具有托管附加组件的私有 EKS 集群。
* **计算**：用于平台工作负载的系统节点组，以及通过 Karpenter 的应用程序节点组。
* **集群内资源**：LangSmith Helm Chart、Istio、KEDA 和其他集群内资源。
* **IAM角色**：Kubernetes资源所需的角色和权限。

## 跨账户 IAM 权限

LangChain 需要跨账户 IAM 权限来预置和管理您的 AWS 账户内的资源。这些权限让LangChain：* **配置基础设施**：创建和配置 VPC、子网、安全组和其他网络组件。
* **管理 Kubernetes 集群**：部署和维护 EKS 集群、其节点组和集群附加组件。
* **创建存储资源**：配置用于应用程序数据和备份的 RDS、ElastiCache 和 S3 存储桶。
* **创建 IAM 角色**：创建和配置 Kubernetes 服务帐户和支持服务使用的角色。
* **运营支持服务**：部署和管理入口和自动扩展，以及扩展和升级 LangSmith 工作负载。

权限是通过您在入职期间应用 [⟦T1⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 创建的单个跨账户 IAM 角色授予的。

### 如何强制执行最小权限

该角色的范围仅限于 BYOC 操作所需的范围：* **作用域为 LangSmith 拥有的资源**：只要 AWS 支持资源级作用域，权限就仅限于带有特定标签和名称前缀的资源，因此角色无法对账户中不相关的资源执行操作。
* **基础设施范围，而非数据范围**：该角色可以管理保存数据的资源，但无法通过 AWS 数据 API 读取数据本身。它在跟踪存储桶上不保存 `s3:GetObject`，不保存 PostgreSQL 的 `rds-db:connect`，也不保存 Redis 的 `elasticache:Connect`。

## 网络

### 数据流量

敏感数据不会离开您的VPC，也不会经过LangChain的VPC。

1. 当用户打开 `aws.smith.langchain.com` 时，浏览器会从 LangChain 的云端获取由 HTML、JavaScript、CSS 和图像组成的 LangSmith UI 包。这些资产与每个 BYOC 和云租户运行的代码相同，并且不包含客户数据。
2. 加载后，应用程序将解析所选工作区的数据平面终端节点，并将敏感数据的每个请求路由到您的 VPC。

要以编程方式摄取或查询数据，请将您的客户端直接指向您的数据平面。数据流始终为`browser or client → data plane → back to client`。

<img alt="Data traffic diagram. A user on their own machine, VPC, or network opens aws.smith.langchain.com in a browser. The browser makes two requests: first it fetches the UI bundle of HTML, CSS, and JavaScript from the static assets in LangChain's cloud, which hold no customer data; second it sends data plane API requests to the network load balancer in your BYOC VPC, which routes to the EKS cluster running LangSmith and on to S3, RDS, and the cache." />

### 连接性控制平面和数据平面之间的所有通信都通过 AWS PrivateLink 双向传输。 LangChain 无法通过公共互联网到达您的环境。 BYOC 建立两个 PrivateLink 连接：

* **控制平面到数据平面（管理路径）**：仅公开集群的 Kubernetes API 服务器，LangChain 用于安装和协调 LangSmith 组件。无法通过此连接访问您的数据。
* **数据平面到控制平面（运行时路径）**：数据平面调用控制平面来验证请求、验证 API 密钥、解析角色和权限以及加载组织和工作区配置。

容器镜像通过 VPC 端点从 LangChain 的控制平面 ECR 存储库中以只读方式拉取。

### DNS 和入口

流量通过 AWS NLB 前面的 Istio 入口到达LangSmith，使用 Route 53 进行 DNS 解析。创建数据平面后，其 API URL 将列在 LangSmith UI 中的 **设置 > 数据平面** 下。

## 另请参阅

* [BYOC overview](/langsmith/byoc)
* [Operations](/langsmith/byoc-operations)
* [Egress for billing and operational telemetry](/langsmith/self-host-egress)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-architecture.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>