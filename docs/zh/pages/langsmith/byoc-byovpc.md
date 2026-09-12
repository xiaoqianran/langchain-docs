<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Bring your own VPC on AWS | https://docs.langchain.com/langsmith/byoc-byovpc -->

# 在 AWS 上引入您自己的 VPC

自带 VPC (BYOVPC) 将 LangSmith BYOC 数据平面部署到您创建和管理的现有 VPC 中。它允许您控制网络配置，同时LangChain配置和操作EKS集群、数据库、存储和其他工作负载资源。对于LangChain开通的VPC，请遵循[BYOC onboarding guide](/langsmith/byoc-onboarding)标准。

您拥有：

- 专有网络
- 子网
- 路由
- 网关
- VPC端点
- 流日志
- 出口控制。

LangChain 保留管理工作负载安全组、用于访问数据平面的 EKS API 的 PrivateLink 终端节点服务以及 VPC 内的其他 LangSmith 基础设施（例如数据库）所需的权限。

## 开始之前

完成 [BYOC prerequisites](/langsmith/byoc#prerequisites) 并在您的组织上启用 BYOC。创建专有网络：

- 与跨账户 IAM 角色位于同一 AWS 账户中，并且
- 您计划部署数据平面的区域。

## 满足网络要求

当您提供 VPC（包括使用参考模块创建的 VPC）时，LangSmith 检查以下要求。

### 配置VPC和子网- **所有权和区域**：VPC 和每个提供的子网必须属于包含 IAM 角色的 AWS 账户，存在于请求的区域中，并且处于 `available` 状态。
- **VPC 配置**：使用默认实例租赁和从 `/16` 到 `/18` 的主 RFC 1918 IPv4 CIDR。启用 DNS 支持和 DNS 主机名。
- **可用区**：在两个或三个标准区域可用区中的每一个中恰好提供一个应用程序子网和一个数据库子网。如果您提供公共子网，请在每个相同区域中提供一个。
- **子网范围**：每个子网必须在 VPC 的主 CIDR 内有一个私有 IPv4 CIDR。提供的子网 CIDR 不得重叠。
- **子网 ID 和标签**：每个子网 ID 在所有层中必须是唯一的。

|子网层 |最小子网大小 |每个子网的最小可用 IPv4 地址 |
|------------------------|--------------------------------|--------------------------------------------|
|私人申请| `/20` 或更大 | 256 | 256
|私人数据库| `/26` 或更大 | 16 | 16
|公开，当提供时 | `/26` 或更大 | 16 | 16

较大的子网具有较小的前缀长度。子网大小和可用地址数都必须满足要求。### 配置路由

VPC必须有一个主路由表。验证使用每个子网的显式路由表关联，如果没有显式关联，则使用主路由表。

- **私有应用程序子网**：每个子网都必须具有到客户管理的出口（例如 NAT 网关或中转网关）的活动 IPv4 默认路由 (`0.0.0.0/0`)。到 Internet 网关的直接路由不能满足此要求。
- **公有子网**：每个提供的公有子网必须具有通往附加到 VPC 的互联网网关的活动 IPv4 默认路由。
- **数据库子网**：参考模块将这些子网保持隔离，没有默认出口路由。

### 配置网络 ACL

每个提供的子网必须有一个允许以下流量的关联网络 ACL。验证按优先级顺序评估规则，包括拒绝规则。|子网层 |方向 |协议和端口|来源或目的地|
|------------------------|----------|--------------------|------------------------|
|所有提供的子网 |入境和出境| TCP 和 UDP，端口 1–65535 | VPC 主 CIDR |
|私人申请|出境 | TCP 443 | TCP 443 `0.0.0.0/0` |
|私人申请|入境 | TCP 1024–65535，用于返回流量 | `0.0.0.0/0` |
|公共|入境 | TCP 443 | TCP 443 `0.0.0.0/0` |
|公共|出境 | TCP 1024–65535，用于返回流量 | `0.0.0.0/0` |

这些是网络 ACL 要求。工作负载安全组和您的出口控制还控制哪些连接成功。

## 使用 Terraform 创建 VPC

<Note>
使用 Terraform 模块是可选的。您可以使用自己的工具创建VPC，并使用该模块作为参考来满足[network requirements](#meet-the-network-requirements)。
</Note>

{/* 发布依赖项：在发布本指南之前，在 Terraform 存储库中发布modules/byoc/aws/byovpc 以及角色模块的allow_vpc_creation_permissions 和vpc_ids 输入。 */}

[⟦T12⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byovpc) 创建符合 LangSmith 数据平面要求的网络。使用它来创建VPC，或配置现有VPC以满足[network requirements](#meet-the-network-requirements)。

创建 VPC：1. 为您的目标账户和 [supported region](/langsmith/byoc#regions-and-cloud-providers) 配置 AWS 提供商。
2. 将模块添加到您的 Terraform 配置中。选择不与您计划对等的网络重叠的专用 CIDR 范围。
3. 初始化 Terraform，查看计划并将其应用到您的帐户中。

以下配置使用模块的默认子网布局并启用 AWS 服务终端节点、控制平面 PrivateLink 和流日志：

```hcl
provider "aws" {
  region = "us-west-2"
}

module "langsmith_byovpc" {
  source = "github.com/langchain-ai/terraform//modules/byoc/aws/byovpc?ref=main"

  name           = "langsmith-production"
  vpc_cidr_block = "10.0.0.0/16"

  enable_vpc_endpoints             = true
  enable_control_plane_privatelink = true
  enable_vpc_flow_logs             = true
}

output "langsmith_network_config" {
  value = module.langsmith_byovpc.langsmith_network_config
}
```

`langsmith_network_config` 输出包含创建数据平面时要提供的 VPC ID 和子网 ID。

### 配置连接

VPC 模块允许您配置：

- AWS 服务端点。
- 控制平面 PrivateLink 和私有 DNS。
- VPC 流日志。
- 面向互联网的负载均衡器的公共子网。
- NAT 和互联网网关，或客户管理的集中出口。

有关配置选项和要求，请参阅[⟦T14⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/byovpc)。

## 创建权限缩减的 IAM 角色

[⟦T15⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/aws/langsmith-byoc-role) 创建跨账户角色 LangChain 负责管理数据平面。

创建角色：1. 使用 **设置 > 数据平面** 中 **数据平面** 标题旁边的按钮复制外部 ID。将其传递为 `external_id`。角色的信任策略必须在其 `ExternalId` 条件下使用此值。
2. 设置 `allow_vpc_creation_permissions = false` 并在 `vpc_ids` 输入中提供 VPC ID。
3. 如果您需要面向互联网的负载均衡器，请设置`allow_public_ingress = true`。否则，请将其禁用。
4. 检查并应用角色模块，然后保留其`crossplane_role_arn` 输出以用于数据平面创建。

禁用 VPC 创建权限后，角色无法创建或管理基础 VPC、子网、互联网和 NAT 网关、弹性 IP、路由表和路由、客户端 VPC 终端节点或 VPC 流日志。它保留工作负载网络权限，包括标记的安全组、VPC 端点服务以及 Karpenter 所需的权限。创建安全组仅限`vpc_ids`中的VPC ID。

## 提供 VPC 和子网 ID

创建数据平面时，请提供来自 [onboarding](/langsmith/byoc-onboarding) 的名称、AWS 区域和 IAM 角色 ARN，以及以下网络值：|价值| Terraform 模块输出 |数据平面创建领域|
|--------|-------------------------------------|----------------------------|
|专有网络ID | `vpc_id` | `byovpc_id` |
|私有应用程序子网 ID | `private_app_subnet_ids` | `byovpc_private_app_subnet_ids` |
|私有数据库子网 ID | `private_db_subnet_ids` | `byovpc_private_db_subnet_ids` |
|公共负载均衡器所需的公共子网 ID | `public_subnet_ids` | `byovpc_public_subnet_ids` |

LangSmith 在配置之前验证网络。更正所有报告的网络或 IAM 权限错误，然后再次提交请求。验证检查AWS配置；您仍然负责通过任何自定义路由、DNS、端点策略和出口过滤器进行工作连接。

创建完成后，继续[provisioning and private connectivity (Step 4)](/langsmith/byoc-onboarding)。

## 维护网络

在数据平面的整个生命周期中保持客户管理的网络可用。您可以管理对路由、网关、端点、DNS、网络 ACL 和流日志的更改。

VPC、可用区和私有子网配置创建后无法更改。您无法在 LangChain 管理的 VPC 和 BYOVPC 之间转换数据平面。删除数据平面会删除 LangChain 管理的资源。您的 VPC 和其他客户管理的网络资源仍由您控制，并且在取消配置数据平面后需要单独清理。

## 另请参阅

- [BYOC onboarding](/langsmith/byoc-onboarding)
- [BYOC architecture](/langsmith/byoc-architecture)
- [BYOC shared responsibility model](/langsmith/byoc-shared-responsibility)
- [BYOC FAQ](/langsmith/byoc-faq)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-byovpc.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>