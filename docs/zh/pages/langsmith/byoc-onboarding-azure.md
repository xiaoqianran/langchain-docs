<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC onboarding on Azure | https://docs.langchain.com/langsmith/byoc-onboarding-azure -->

# Azure 上的 BYOC 入门

在 Azure 订阅中设置 LangSmith BYOC 数据平面，从授予 LangSmith 对资源组的访问权限到创建、更改和删除数据平面。

> [!注意]
>
> Azure 上的 BYOC 位于 **[beta](/langsmith/release-stages)**。首先，[contact our sales team](https://www.langchain.com/contact-sales)。

本页面介绍如何在 Azure 订阅中创建 LangSmith BYOC 数据平面。有关如何构建和保护数据平面的信息，请参阅[BYOC architecture on Azure](/langsmith/byoc-architecture-azure)。有关 AWS 指南，请参阅 [BYOC onboarding](/langsmith/byoc-onboarding-aws)。

每个数据平面都在您的订阅中自己的资源组中运行。 Terraform 模块在其中创建资源组和 Key Vault，并仅授予该资源组上的 LangSmith BYOC 应用程序角色。 LangChain然后创建并操作资源组中的数据面资源。

## 开始之前

您需要以下内容：* **Azure 上的LangSmith 组织**：使用 Azure 上的 LangSmith 控制平面，位于 [azure.smith.langchain.com](https://azure.smith.langchain.com)。将您的组织 ID 发送给LangChain 团队以启用 BYOC。
* **Azure 订阅**：LangChain 建议专用于 LangSmith BYOC 的订阅，但这不是必需的。
* **Azure 权限**：应用 Terraform 的人需要订阅上的 `Owner` 角色，因为 Terraform 模块创建自定义角色和角色分配并注册资源提供程序。您还需要一个 Microsoft Entra 角色，可以在租户中创建和更新多租户应用程序的服务主体，例如 `Cloud Application Administrator`。
* **Terraform**：Terraform 1.11.0 或更高版本。
* **LangSmith** 中的组织管理员：创建、更改和删除数据平面需要组织管理员角色。
* **vCPU 配额**：AKS 系统节点池使用三个 `Standard_D2s_v6` VM。 LangSmith 在创建时检查该区域在**区域 vCPU 总数**配额和 Dsv6 VM 系列配额中至少有 6 个可用 vCPU。应用节点使用版本5及以上版本的D、E、F系列虚拟机，因此还要为这些系列规划配额。参见[Node pools](/langsmith/byoc-architecture-azure#compute)。* **区域**：Azure 上的 BYOC 可以在任何 Azure 区域中运行。如果您需要尚未启用的区域，请联系 LangChain 团队，他们可以添加它。

## 创建数据平面

**1.复制外部 ID**

LangChain 为您的组织分配一个外部 ID。导航到 LangSmith 中的 **设置 > 数据平面**，然后使用 **数据平面** 标题旁边的复制按钮进行复制。不创造自己的价值。

LangSmith 使用外部 ID 来确认订阅中的角色分配属于您的组织。

**2.使用 Terraform** 授予 LangSmith 访问权限

使用您复制的外部 ID 在 Azure 订阅中应用 [⟦T7⟧ Terraform module](https://github.com/langchain-ai/terraform/blob/main/modules/byoc/azure/langsmith-byoc-access/main.tf)。您必须使用此模块。对于其 `data_planes` 输入中的每个数据平面，它创建：* **LangSmith BYOC 服务主体**：Microsoft Entra 租户中的 LangSmith BYOC 多租户应用程序的服务主体（应用程序（客户端）ID `5b0a74cb-9f37-4797-b557-c15d7be80d3b`）。它为每个租户创建一次，并且应用程序不请求 Microsoft Graph 权限。
* **专用资源组**，`langsmith-byoc-<key>`：LangSmith将数据平面部署到其中。不要将其他工作负载放入其中。
* **资源组中的 Key Vault**：它使用 Azure RBAC 授权并禁用公共网络访问。 LangSmith 将数据平面的引导密钥写入其中，数据平面通过专用端点读取它。
* **资源组上服务主体的两个角色分配**：具有操作 LangSmith 需求和 `User Access Administrator` 的 `langsmith-byoc-<key>-<suffix>` 自定义角色。这两个角色只能在该资源组中使用，并且这两个分配都将您的外部 ID 作为其描述。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.42.0, < 5.0.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  subscription_id = "<subscription-id>"
  features {}

  # The data plane needs these resource providers. LangSmith cannot
  # register them, because its roles stop at the resource group.
  resource_providers_to_register = [
    "Microsoft.Cache",
    "Microsoft.Compute",
    "Microsoft.ContainerService",
    "Microsoft.DBforPostgreSQL",
    "Microsoft.KeyVault",
    "Microsoft.ManagedIdentity",
    "Microsoft.Network",
    "Microsoft.Storage",
  ]
}

provider "azuread" {}

variable "external_id" {
  description = "The external ID from Settings > Data Planes in LangSmith."
  type        = string
}

module "langsmith_byoc_access" {
  source = "github.com/langchain-ai/terraform//modules/byoc/azure/langsmith-byoc-access?ref=main"

  langsmith_app_client_id = "5b0a74cb-9f37-4797-b557-c15d7be80d3b"
  external_id             = var.external_id

  data_planes = {
    prod = {
      location = "eastus"
    }
  }
}

output "langsmith_byoc_access" {
  value = module.langsmith_byoc_access
}
```

替换订阅 ID 和区域。 `data_planes` 键（示例中为`prod`）命名资源组：1 到 63 个小写字母、数字和连字符，以字母开头，以字母或数字结尾，连字符不能连续。使用您的外部 ID 应用配置，例如 `terraform apply -var 'external_id=<external-id>'`。然后读取下一步的输出：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
terraform output -json langsmith_byoc_access
```

您需要`azure_entra_tenant_id`，以及`data_planes`下数据平面的`region`和`resource_group_id`。

有关每个角色允许的内容，请参阅[Access and permissions](/langsmith/byoc-architecture-azure#access-and-permissions)。对于所有模块输入，请参阅[module README](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/azure/langsmith-byoc-access)。

**3.创建数据平面**

1. 在[LangSmith on Azure](https://azure.smith.langchain.com)中，进入**设置 > 数据平面**，然后单击**+数据平面**。

2. 使用上一步中的 Terraform 输出填写 **创建数据平面** 表单：

   |领域 |描述 |
   | - | - |
   | **姓名** |最多 24 个小写字母、数字和连字符。以字母或数字开头和结尾，且不以 `internal` 开头。例如，`prod`。 |
   | **蔚蓝区域** |选择资源组的区域。 |
   | **Microsoft Entra 租户 ID** |使用 `azure_entra_tenant_id` 输出，采用 `8-4-4-4-12` UUID 形式。 |
   | **Azure 资源组 ID** |使用 `resource_group_id` 输出，格式为 `/subscriptions/<subscription-id>/resourceGroups/<name>`。每个资源组服务于一个数据平面。 |
   | **使用现有的托管身份** |仅当您在模块的 `data_planes` 输入中为此数据平面设置 `byo_iam = true` 时才选择此选项，以便 Terraform 创建身份及其角色分配。在创建数据平面之前设置`byo_iam`，因为它以后无法更改。参见[Bring your own identities](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/azure/langsmith-byoc-access#bring-your-own-identities-optional)。否则，请将其清除。 || **VNet CIDR 范围** | LangSmith 为数据平面创建的 VNet 的地址范围。使用从 `/16` 到 `/18` 的私有 RFC 1918 范围，该范围不与其他网络重叠。 |
   | **负载均衡器访问** |保留默认值**专用**，仅用于从数据平面 VNet 和连接的网络进行访问。对于面向互联网的端点，切换到**公共**。 |

3. 单击**创建数据平面**。 LangSmith 确认**请求数据平面**。

在 LangSmith 接受请求之前，它会检查：

* 资源组上 LangSmith 服务主体的角色分配以您的外部 ID 作为其描述。
* 服务主体拥有其对资源组所需的权限。
* 资源组仅包含一个 Key Vault，并且该保管库使用 Azure RBAC。
* 您的订阅可以在区域内创建AKS系统节点大小和PostgreSQL大小，并且具有足够的系统节点池vCPU配额。

如果检查失败，表单会显示错误。修复问题并再次单击“**创建数据平面**”。参见[Troubleshoot data plane creation](#troubleshoot-data-plane-creation)。

**4.等待配置**LangChain 在您的资源组中配置数据平面资源。数据平面从`requested`移动到`provisioning`再到`active`。在 **设置 > 数据平面** 中跟踪其状态。

如果数据平面在 3 小时内没有变为活动状态，则会移动到`provisioning_failed`。如果发生这种情况，请联系 LangChain 团队。

**5.连接到数据平面**

数据平面 URL 的格式为 `https://<data_plane_id>.azure.langchain-byoc.com`。在 **设置 > 数据平面** 下找到它。

* **内部负载均衡器** (`public_load_balancer: false`)：用户和应用程序仅从其 VNet 到达数据平面。将您的网络连接到该 VNet，例如使用 VNet 对等互连或 VPN 网关。配置从网络到 VNet 链接的专用 DNS 区域的 DNS 解析。单独的对等互连或 VPN 不提供 DNS 解析。
* **公共负载均衡器** (`public_load_balancer: true`)：用户和应用程序通过互联网到达数据平面。

如果LangSmith UI无法访问您的数据平面，它会提示您切换到可访问的数据平面上的工作区。

**6。创建工作区**

在新数据平面中自动创建一个名为 `dp-<data_plane_name>` 的工作空间。在数据平面可达之前，它是不可访问的。您可以在数据平面中创建更多工作区。创建每个数据平面时选择目标数据平面：一个工作空间只属于一个数据平面，一个数据平面可以容纳多个工作空间。

> [!警告]
>
> 工作空间创建后无法移动到另一个数据平面。

**7. （可选）迁移现有数据**

如果您要从 LangSmith 云或 [self-hosted](/langsmith/self-hosted) 实例迁移，请联系 LangChain 团队安排迁移。仅 AWS 支持跟踪迁移。

有关更多信息，请参阅[Migrate to BYOC](/langsmith/byoc-migration)。

要将跟踪和 API 请求发送到数据平面，请参阅[BYOC usage](/langsmith/byoc-usage)。

## 数据平面创建故障排除|代码| HTTP 状态 |原因 |修复|
| - | - | - | - |
| `azure_external_id_mismatch` | 403 | 403资源组上 LangSmith 服务主体的角色分配没有您组织的外部 ID 作为其描述。 |使用 **设置 > 数据平面** 中的外部 ID 应用 Terraform 模块，然后重试。 |
| `azure_permissions` | 403 | 403 LangSmith 服务主体无法访问资源组，或缺少所需的权限。补救措施列出了缺失的操作。 |检查资源组是否存在以及您应用的 Terraform 模块是否没有 `reduced_access`，然后重试。 |
| `azure_policy_denied` | 403 | 403订阅中的 Azure Policy 分配拒绝了请求。 |从策略中免除数据平面资源组，然后重试。 |
| `azure_resource_group_invalid` | 400 |资源组不存在、不包含一个 Key Vault，或其保管库不使用 Azure RBAC。 |修复资源组，然后重试。 |
| `azure_region_unavailable` | 400 |您的订阅无法使用该区域，或者无法在其中创建 AKS 系统节点大小或 PostgreSQL 大小。 |选择其他区域，或请求 Azure 支持为您在该区域中的订阅启用 VM 大小或 PostgreSQL。 || `insufficient_azure_quota` | 422 | 422该区域没有足够的可用 vCPU 配额用于 AKS 系统节点池。 |请求增加配额，或选择其他区域。 |
| `azure_resource_group_in_use` | 409 | 409另一个数据平面使用该资源组。 |为数据平面创建新的资源组。 |
| `data_plane_name_taken` | 409 | 409您的组织已有一个具有此名称的数据平面。 |选择另一个名称。 |
| `azure_throttled` | 429 | 429 Azure 对您的订阅请求进行速率限制。 |稍等一下，然后重试。 |
| `azure_unavailable` | 502 或 503 | Azure 返回服务器错误，或未报告 vCPU 配额。 |稍等一下，然后重试。 |

无效字段值会返回 HTTP 400 以及字段名称和该值违反的规则。

## 更改数据平面设置

LangSmith UI 中的设置表单仅支持 AWS 维护时段。要更改 Azure 数据平面的维护时段，请使用 [Update data plane settings](/langsmith/smith-api/data_planes/update-data-plane-settings) API：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X PATCH 'https://azure.api.smith.langchain.com/orgs/current/data-planes/<data-plane-id>' \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: <api-key>' \
  -H 'X-Organization-Id: <organization-id>' \
  -d '{"maintenance_window": "sun:07:00-sun:11:00"}'
```

您可以在 Azure 数据平面为 `provisioning` 或 `active` 时更改其以下设置：|设置|领域 |天蓝色|
| - | - | - |
|维护窗口| `maintenance_window` |每周 UTC 窗口正好 4 小时，从整点开始，格式为 `ddd:HH:00-ddd:HH:00`。默认为`sun:07:00-sun:11:00`。 AKS 升级和 PostgreSQL 维护在此窗口中进行。 |
|跟踪有效负载保留| `ttl` |支持。默认情况下，`short_days` 为 14，`long_days` 为 400。
|网络防火墙| `firewall` |在 Azure 上不可用。 |
|舰队 OIDC | `fleet_oidc` |在 Azure 上不可用。 |

## 部署后减少访问

一旦数据平面为`active`，您可以减少其`langsmith-byoc-<key>-<suffix>`自定义角色的权限。在 Terraform 模块中为数据平面设置 `reduced_access = true` 并运行 `terraform apply`：

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
data_planes = {
  prod = {
    location       = "eastus"
    reduced_access = true
  }
}
```

Terraform 更新自定义角色操作并删除 `User Access Administrator` 分配。自定义角色分配保留，因此 LangSmith 保留访问权限。 Azure 在最多 5 分钟内应用更改。角色减少后，LangChain 仍然可以升级、扩展和修复数据平面，但无法删除数据平面、其数据库、存储帐户或网络，​​也无法创建角色分配。在添加角色分配的升级之前以及删除或重新创建数据平面之前，将 `reduced_access` 设置回 `false`。

## 删除数据平面> [!警告]
>
> 在 LangSmith 中删除数据平面之前，请勿从 Terraform 模块中删除数据平面。 LangSmith 需要其角色分配来删除数据平面资源。

1. 如果数据平面有`reduced_access = true`，请将其设置为`false`，运行`terraform apply`，并等待 5 分钟让 Azure 应用角色更改。
2. 在 **设置 > 数据平面** 中删除数据平面，或使用 `DELETE /orgs/current/data-planes/<data-plane-id>` API。您可以删除处于 `provisioning`、`active` 或 `provisioning_failed` 状态的 Azure 数据平面。 LangSmith 首先检查它是否仍然可以访问您的资源组。
3. 等待数据平面从 **设置 > 数据平面** 消失。

LangSmith 删除 AKS 群集、PostgreSQL、Redis、网络和私有 DNS 区域。它将以下内容保留在您的资源组中：

* 资源组和 Key Vault。
* 保存跟踪数据和 SmithDB 数据的 Blob 存储帐户。

Azure 会将已删除的 PostgreSQL 服务器的备份保留一段有限的时间，在此期间您可以将其恢复。参见[Restore a dropped Azure Database for PostgreSQL flexible server](https://learn.microsoft.com/azure/postgresql/flexible-server/how-to-restore-dropped-server)。

如果在同一资源组中创建具有相同名称的新数据平面，它将重用 Key Vault 和保留的 Blob 存储帐户。当不再需要保留的数据时，删除资源组中的 Blob 存储帐户，然后从 `data_planes` 中删除数据平面的密钥并运行 `terraform apply`。然后，Terraform 删除资源组、Key Vault 和角色分配。使用默认的 `features {}` 块，AzureRM 提供程序拒绝删除仍包含 Terraform 不管理的资源的资源组，例如保留的存储帐户。

## 删除 LangSmith 访问权限

要阻止 LangSmith 更改或删除数据平面，请删除 LangSmith 服务主体在其资源组及其 AKS 群集上的角色分配。删除 Terraform 模块会删除服务主体和所有角色分配，因此 LangSmith 会失去对租户中每个数据平面的访问权限。数据平面资源保留在您的订阅中，LangChain 无法再升级或修复它们。如果您希望LangSmith清理其资源，请先删除数据平面。

## 后续步骤

* [BYOC architecture on Azure](/langsmith/byoc-architecture-azure) 涵盖您订阅中的资源、网络路径以及 LangSmith 如何访问它们。
* [BYOC usage](/langsmith/byoc-usage) 涵盖了如何将应用程序和 API 客户端指向数据平面。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-onboarding-azure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。