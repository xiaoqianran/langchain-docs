<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC operations | https://docs.langchain.com/langsmith/byoc-operations-aws -->

# BYOC 操作

LangChain 如何操作 LangSmith BYOC 数据平面、您在自己的 AWS 账户中管理哪些操作，以及打破玻璃访问的工作原理。

LangChain 在配置后操作您的数据平面，包括升级、扩展、监控和安全修补。大多数维护都是非中断性的，不需要您执行任何操作。

操作分为三组：

* **[LangChain-managed operations](#langchain-managed-operations)**：LangChain 为您执行扩展、升级和维护。
* **[Customer-managed operations](#customer-managed-operations)**：您自己配置的数据平面设置、可观察性、跨账户访问和审核。
* **[Break-glass access](#break-glass-access)**：在故障排除需要时授予 LangChain 工程师临时访问权限。

## LangChain 托管运营

LangChain 在每个数据平面上执行以下操作，无需您执行任何操作。要更改某些默认设置，例如高可用性或实例大小，请联系 LangChain 团队。

### 自动缩放

LangChain 随着负载变化缩放数据平面，因此您无需调整大小或调整它：* **无状态LangSmith服务**：通过水平 Pod 自动缩放器进行水平缩放，随着 Pod 需求的变化，通过 Karpenter 进行配置和删除节点容量。
* **数据库**：LangChain 大小和比例 RDS 和 ElastiCache。

### 高可用性

默认情况下，数据平面是为了实现高可用性而配置的。该部署跨越您所在区域的多个可用区，并且 RDS 和 ElastiCache 运行具有自动故障转移功能的多可用区。

> [!注意]
>
> 要运行没有高可用性的数据平面，请联系 LangChain 团队。

### 实例大小

数据平面为数据库和节点组配置了默认实例大小。要在较小的实例上运行数据平面，请联系 LangChain 团队。

### LangSmith升级

LangChain 每天都会升级数据平面中的LangSmith 版本。升级是滚动的、逐个副本的，因此不会出现整个服务停机。

有两种机制可确保升级不停机：* **水平 Pod 自动缩放**：LangSmith 服务运行多个副本，由水平 Pod 自动缩放器调整大小，因此一次替换几个 Pod，而其余副本继续提供流量。
* **Pod 中断预算**：Pod 中断预算限制了一次可以有多少个服务副本不可用，因此滚动更新和节点消耗都不会导致服务低于保持可用所需的容量。

### 支持服务升级

Istio 和 KEDA 等后台服务定期升级。仍然运行 ClickHouse 的数据平面也会收到 ClickHouse 运营商升级。这些升级是非侵入式的，预计不会出现服务中断。

### Kubernetes集群升级

托管数据平面的 EKS 集群需要定期升级，以保持安全性、兼容性和对新功能的访问。 LangChain 在 AWS 支持终止日期之前在数据平面的 [maintenance window](#maintenance-window) 中主动执行这些升级。

集群升级分为两种：* **控制平面升级**：涵盖 Kubernetes API 服务器以及 AWS 与之一起管理的组件。这些对于您的工作负载是透明的，并且不会重新启动 Pod。
* **节点组升级**：使用 make-before-break 语义将节点一一滚动。在更新的版本上配置新节点，pod 移动到它们上，迁移完成后旧节点将被终止。 Pod 中断预算适用于排水，因此每项服务都保持可用，尽管您可能会在各个 Pod 重新启动时看到短暂的连接重置。没有数据丢失。

## 客户管理的运营

您可以通过 LangSmith UI 和 API 或在您自己的 AWS 账户中自行配置以下操作。

### 数据平面设置

要编辑数据平面的设置：

1. 导航到 **设置 > 数据平面**。
2. 找到您的数据平面并选择**设置**。
3. 打开要更改的设置的选项卡，然后保存。

您还可以使用 [Update data plane settings](/langsmith/smith-api/data_planes/update-data-plane-settings) 端点。

#### 维护窗口维护时段是LangChain在数据平面上运行操作的时间，例如EKS版本升级和RDS数据库升级。任何可能导致停机的维护（例如重新启动 RDS 或 ElastiCache）都发生在此窗口中。

* 窗口持续 2 小时，每周一次。所有时间均采用 UTC 时间。
* 在 **维护** 选项卡上选择日期和开始时间。
* 默认为星期日 07:00–09:00 UTC (`sun:07:00-sun:09:00`)。

#### TTL 保留

数据平面的 TTL 设置为其跟踪设置默认保留期。这些值是默认值，不是限制值。选择 [extended durations](/langsmith/usage-and-billing#retention-periods) 之一的工作区会保留该持续时间，即使它比数据平面的长期 TTL 长。 Blob 存储桶针对每个保留期都有一个 S3 生命周期规则，因此跟踪有效负载会按照与其跟踪相同的计划被删除。

在 **TTL 保留** 选项卡上配置 TTL 保留：

* **启用 TTL 保留**：默认开启。
* **短期 TTL（天）**：基本跟踪的默认保留期。默认值为 14 天。
* **长期 TTL（天）**：延长跟踪的默认保留期。默认值为 400 天。它必须大于或等于短期 TTL。每个值必须是大于0的整数。通过API发送`ttl.short_days`和`ttl.long_days`。

#### 入口允许列表

在 **Ingress** 选项卡上，您可以限制负载均衡器接受的源 IP 范围。最多添加 50 个 IPv4 CIDR 范围。然后，负载均衡器仅在端口 443 上接受来自这些范围的流量。

* **空列表**：负载均衡器允许所有源。
* **私有负载均衡器**：始终允许数据平面 VPC CIDR。

> [!警告]
>
> * API 更新取代了整个列表。包括您想要保留的每个范围，否则负载均衡器将停止接受您遗漏的范围中的流量。
> * 请勿直接在 AWS 中编辑网络负载均衡器安全组。 LangSmith 定期协调数据平面并恢复对托管资源的任何手动更改。

### 可观察性

您可以将可观察性工具部署到集群中，例如 Datadog 代理或 OpenTelemetry 收集器，以及您自己的安全监控代理，只要它们不干扰 LangSmith 工作负载即可。

LangSmith 服务发出日志、指标和跟踪的方式与自托管相同，因此适用相同的配置。参见[Export LangSmith telemetry to your observability backend](/langsmith/export-backend)。

### 跨账户访问私有 BYOC 数据平面在数据平面 VPC 内公开其负载均衡器。如果没有显式的跨账户网络路径，不同 AWS 账户中的应用程序无法访问该账户。

消费者网络和数据平面 VPC 之间的任何专用网络路径都可以工作。 LangChain不需要特定的方法。常见选项包括：

* AWS 专用链接
* VPC对等
* 中转网关
* VPN

> [!注意]
>
> LangChain 规定 [two PrivateLink connections](/langsmith/byoc-architecture-aws#connectivity) 在 LangChain 控制平面和数据平面之间传输流量。对于来自您自己的网络的应用程序流量，没有 LangChain 托管端点服务或网络路径。您自己创建和管理该路径。

无论 LangChain 创建 VPC 还是您提供自己的 VPC，以下步骤均适用。要管理 VPC 本身（其子网、路由、网关和终端节点），请改用 [Bring your own VPC on AWS](/langsmith/byoc-byovpc-aws)。

#### 允许消费者源范围

如果您[restrict the load balancer's source IP ranges](#ingress-allowlist)，请将每个消费者网络的 CIDR 范围添加到该列表中。私有负载均衡器始终允许数据平面 VPC CIDR，但不允许消费者范围。如果没有它们，负载均衡器就会降低消费者流量。

#### 使用 AWS PrivateLink 连接

要在数据平面帐户中创建端点服务：1. 识别数据平面入口的网络负载均衡器 (NLB)。在您的数据平面账户和区域的 **负载均衡器** 下的 AWS EC2 控制台中找到它。它的名字以`-sm-istio`结尾。
2. 创建由该 NLB 支持的 **VPC 端点服务**。根据您的安全策略将接受模式设置为**自动**或**手动**。
3. 将每个消费者 AWS 账户添加为**主体**，允许为服务创建接口终端节点。
4. 记下端点服务名称（例如，`com.amazonaws.vpce.us-east-1.vpce-svc-xxxxxxxxxxxxxxxxx`）。

> [!警告]
>
> 请勿修改 NLB 本身。 LangSmith 定期协调数据平面，并将手动更改恢复到托管资源。如果入口模式或子网发生变化，LangChain 会与您协调任何 NLB 更新。

连接每个消费者帐户：

1. 在运行应用程序的 VPC 中，为上一步中的终端节点服务名称创建 **VPC 接口终端节点**。
2. 在 **设置 > 数据平面**下显示的 API URL 中找到数据平面主机名。
3. 为该主机名创建一个与消费者 VPC 关联的 **私有 Route 53 托管区域**。
4. 在该托管区域中添加别名或 CNAME 记录，将主机名指向接口终端节点的 DNS 名称。您的应用程序使用标准数据平面 API URL，无需任何更改。 DNS 将其解析为消费者 VPC 中的接口终端节点。

#### 使用 VPC 对等、中转网关或 VPN 连接

要将消费者 VPC 与数据平面 VPC 对等：

1. 在数据平面账户中，创建从数据平面 VPC 到消费者 VPC 的对等连接请求。
2. 在消费者帐户中，接受请求。
3. 在两个 VPC 中添加路由，以便到彼此 CIDR 范围的流量穿过对等连接。
4. 更新需要允许对等互连范围的任何网络 ACL 或安全组。

要使用中转网关，请将两个 VPC 连接到共享中转网关并配置路由表，以便每个 VPC 都可以访问另一个 VPC。

要使用 VPN，请将 VPN 连接到数据平面 VPC 或连接到其的中转网关，并添加路由，以便消费者网络可以到达数据平面 VPC CIDR 范围。

这些选项路由流量，但不承载 DNS。数据平面主机名仅在数据平面 VPC 内部解析。要在每个消费者 VPC 中配置 DNS：1. 为数据平面主机名创建私有 Route 53 托管区域。
2. 将托管区域与消费者VPC 关联。
3. 添加别名或 CNAME 记录，将主机名指向数据平面负载均衡器的 DNS 名称。

For a consumer network outside AWS, forward DNS queries for the data plane hostname to a Route 53 Resolver inbound endpoint in the data plane VPC.

### 审计

* **LangSmith 审核日志**：对数据平面资源的操作记录在数据平面中，并可在数据平面端点访问。控制平面操作（例如创建用户）在控制平面中进行审核。有关如何访问两者的信息，请参阅[Audit logs](/langsmith/audit-logs)。
* **EKS 审核日志**：发送到您帐户中的 CloudWatch，以便您可以监控运行的命令。
* **VPC 流日志**：记录在您账户的 S3 存储桶中。使用[BYOVPC](/langsmith/byoc-byovpc-aws)，您可以自行配置VPC流日志。

您有责任对这些日志设置警报。

## 打破玻璃访问

LangChain 团队无法长期访问您的数据，只能管理您的数据平面的基础设施。当故障排除需要访问数据时，有两种路径：* **You run the query**: You run the query yourself. Then validate and sanitize the output before sharing it with LangChain.
* **Break-glass access**: You grant a specific LangChain engineer temporary access to perform the operation.您可以随时撤销该访问权限。

### 授予访问权限

Break-glass access uses the `LangSmithBYOCBreakGlass` IAM role that the [⟦T13⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) creates in your account.角色的信任策略默认为`Effect: Deny`。

The role carries only `eks:DescribeCluster` permission at the IAM layer. Kubernetes-level access is controlled separately through EKS access entries that you create for the break-glass role in each target cluster and region.提供三种访问级别：

|水平| EKS 访问策略或组 |使用 |
| - | - | - |
|只读 | `AmazonEKSAdminViewPolicy` |检查集群状态而不进行更改 |
|集群管理| `langsmith-cluster-management` Kubernetes 小组 |在事件期间管理 LangSmith 工作负载 |
|完整集群管理| `AmazonEKSClusterAdminPolicy` | Last resort for critical incidents or data access |

When a LangChain engineer requires access, they send you:

* 他们的 AWS IAM Identity Center 用户 ID。
* 他们的 LangChain 电子邮件地址。
* 请求的访问级别。
* 目标集群名称和AWS区域。

授予访问权限：1. 在 `langsmith-byoc-role` 模块中设置以下输入并应用：

   ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   allow_break_glass_access = true

   break_glass_identitystore_user_ids = [
     "<langchain-identity-store-user-id>",
   ]

   break_glass_source_identities = [
     "<langchain-engineer-email>",
   ]
   ```

   身份存储用户 ID 确保只有指定工程师的凭据才能担任该角色。源身份电子邮件提高了 CloudTrail 审核记录的可读性。

2. 与LangChain工程师共享模块的`break_glass_role_arn`输出。

3. 设置目标集群的值：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export ROLE_ARN="arn:aws:iam::<customer-account-id>:role/LangSmithBYOCBreakGlass"
   export CLUSTER="<deployment>-smith-eks"
   export REGION="<cluster-region>"
   ```

4. 为请求的访问级别创建 EKS 访问条目。每个集群的每个主体仅创建一个访问条目。

   ```bash Read-only theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   aws eks create-access-entry \
     --region "$REGION" \
     --cluster-name "$CLUSTER" \
     --principal-arn "$ROLE_ARN" \
     --type STANDARD

   aws eks associate-access-policy \
     --region "$REGION" \
     --cluster-name "$CLUSTER" \
     --principal-arn "$ROLE_ARN" \
     --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSAdminViewPolicy \
     --access-scope type=cluster
   ```

   ```bash Cluster management theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   aws eks create-access-entry \
     --region "$REGION" \
     --cluster-name "$CLUSTER" \
     --principal-arn "$ROLE_ARN" \
     --type STANDARD \
     --kubernetes-groups langsmith-cluster-management
   ```

   ```bash Full cluster admin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   aws eks create-access-entry \
     --region "$REGION" \
     --cluster-name "$CLUSTER" \
     --principal-arn "$ROLE_ARN" \
     --type STANDARD

   aws eks associate-access-policy \
     --region "$REGION" \
     --cluster-name "$CLUSTER" \
     --principal-arn "$ROLE_ARN" \
     --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy \
     --access-scope type=cluster
   ```

授予适合问题的最低级别。活动显示在 CloudTrail 以及您账户中 CloudWatch 的 EKS 审核日志中。

### 撤销访问权限

一旦工程师不再需要访问权限，就立即撤销访问权限。按顺序执行步骤：首先禁用信任可防止工程师在您撤销活动会话后启动新会话。

撤销访问权限：

1. 设置 `allow_break_glass_access = false`，删除身份存储用户 ID 和源身份，然后应用：

   ```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   allow_break_glass_access = false

   break_glass_identitystore_user_ids = []
   break_glass_source_identities      = []
   ```

   这会阻止新的 `sts:AssumeRole` 调用`LangSmithBYOCBreakGlass` 角色。

2. 删除您创建的每个集群中的 EKS 访问条目：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   aws eks delete-access-entry \
     --region "$REGION" \
     --cluster-name "$CLUSTER" \
     --principal-arn "$ROLE_ARN"
   ```3. 在 IAM 控制台中，转至 **角色** > **LangSmithBYOCBreakGlass** > **撤销会话**，然后选择 **撤销活动会话**。现有会话在过期之前一直有效，因此撤销它们会立即关闭访问权限。

## 另请参阅

* [BYOC architecture](/langsmith/byoc-architecture-aws)
* [BYOC onboarding on AWS](/langsmith/byoc-onboarding-aws)
* [Bring your own VPC on AWS](/langsmith/byoc-byovpc-aws)
* [Using BYOC](/langsmith/byoc-usage)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-operations-aws.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。