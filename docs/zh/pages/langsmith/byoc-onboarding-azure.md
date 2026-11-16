<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC onboarding on Azure | https://docs.langchain.com/langsmith/byoc-onboarding-azure -->

# Azure 上的 BYOC 入门

在 Azure 订阅中设置 LangSmith BYOC 数据平面，从授予 LangSmith 对资源组的访问权限到创建、更改和删除数据平面。

> [!注意]
>
> Azure 上的 BYOC 位于 **[beta](/langsmith/release-stages)**。首先，[contact our sales team](https://www.langchain.com/contact-sales)。

本页面介绍如何在 Azure 订阅中创建 LangSmith BYOC 数据平面。每个数据平面都在其自己的资源组中运行。 Terraform 模块仅允许 LangSmith 访问该资源组，然后 LangChain 在其中创建并操作数据平面。设计参见[BYOC architecture on Azure](/langsmith/byoc-architecture-azure)。对于 AWS，请参阅 [BYOC onboarding](/langsmith/byoc-onboarding-aws)。

## 开始之前

您需要以下内容：* **Azure 上的 LangSmith 组织**：使用 Azure 上的 LangSmith 控制平面，位于 [azure.smith.langchain.com](https://azure.smith.langchain.com)。将您的组织 ID 发送给 LangChain 团队以启用 BYOC。
* **Azure 订阅**：建议使用专用订阅，但不是必需的。
* **Azure 权限**：`Owner`、或 `Contributor` 和 `User Access Administrator`，在订阅范围内应用 Terraform。 Microsoft Entra 角色，可以为每个租户创建一次服务主体，例如 `Cloud Application Administrator`。两个人可以共享这些，如下面的 Terraform 步骤所示。如果您的 `User Access Administrator` 授予阻止特权角色，请设置 `byo_iam = true` 并自行创建身份。
* **Terraform**：Terraform 1.11.0 或更高版本。
* **LangSmith** 中的组织管理员：创建、更改和删除数据平面。
* **vCPU 配额**：对于三个 `Standard_D2s_v6` 系统节点，该区域中至少有 6 个可用 vCPU，无论是**区域 vCPU 总数**配额还是 Dsv6 系列配额。应用程序节点使用 D、E 和 F 系列 v5 或更高版本，因此也要为这些节点规划配额。参见[Node pools](/langsmith/byoc-architecture-azure#compute)。
* **区域**：任何 Azure 区域。要启用新区域，请联系 LangChain 团队。

## 创建数据平面

**1.复制外部 ID**在 LangSmith 中，转到 **设置 > 数据平面**，然后单击 **数据平面** 标题旁边的复制按钮。不创造自己的价值。 LangSmith 使用外部 ID 来确认订阅中的角色分配属于您的组织。

**2.使用 Terraform** 授予 LangSmith 访问权限

在您的订阅中应用[⟦T11⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/azure/langsmith-byoc-access)。您必须使用此模块。它创建：

* **LangSmith 服务主体**，每个租户一次：Entra 租户中LangSmith 应用程序的身份（客户端 ID `5b0a74cb-9f37-4797-b557-c15d7be80d3b`）。 LangSmith 控制平面在您的租户外部运行并以其身份登录。它没有 Microsoft Graph 权限。资源组中的托管身份适用于数据平面内的工作负载。
* **资源组** `langsmith-byoc-<key>` 适用于 `data_planes` 中的每个条目。不要将其他工作负载放入其中。
* **每个资源组中都有一个 Key Vault**，具有 Azure RBAC 并且没有公共网络访问权限。 LangSmith 将数据平面的引导密钥写入其中。
* **每个资源组上有两个角色分配**：`langsmith-byoc-<key>-<suffix>` 自定义角色和 `User Access Administrator`。两者都带有您的外部 ID 作为其描述。

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
    "Microsoft.ContainerRegistry",
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

  # Set to false if an Entra admin already ran `az ad sp create`.
  # create_service_principal = false

  data_planes = {
    prod = {
      location = "eastus"
    }
  }
}

output "langsmith_byoc_access" {
  value = module.langsmith_byoc_access
}
```1. 将配置保存为 `main.tf` 到空文件夹中。替换订阅 ID 和区域。 `data_planes` 键（`prod`）命名资源组：最多 63 个小写字母、数字和连字符，以字母开头，以字母或数字结尾，并且没有连续的连字符。

2. 如果应用 Terraform 的人无法创建服务主体，则 Entra 管理员首先运行 `az ad sp create --id 5b0a74cb-9f37-4797-b557-c15d7be80d3b`。那么你必须设置`create_service_principal = false`。然后，Terraform 仅读取服务主体。

3. 运行：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   az login
   terraform init
   terraform apply -var 'external_id=<external-id>'
   terraform output -json langsmith_byoc_access
   ```

4. 注意`azure_entra_tenant_id`，以及`data_planes`下的`region`和`resource_group_id`。

有关每个角色允许的内容，请参阅[Access and permissions](/langsmith/byoc-architecture-azure#access-and-permissions)。对于所有输入，请参阅[module README](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/azure/langsmith-byoc-access)。

**3.创建数据平面**

1. 在[LangSmith on Azure](https://azure.smith.langchain.com)中，转到**设置 > 数据平面**，然后单击**+ 数据平面**。

2. 使用上一步中的 Terraform 输出填写 **创建数据平面** 表单：|领域 |描述 |
   | - | - |
   | **姓名** |最多 24 个小写字母、数字和连字符。以字母或数字开头和结尾，且不以 `internal` 开头。例如，`prod`。 |
   | **蔚蓝区域** |选择资源组的区域。 |
   | **Microsoft Entra 租户 ID** |使用 `azure_entra_tenant_id` 输出，采用 `8-4-4-4-12` UUID 形式。 |
   | **Azure 资源组 ID** |使用 `resource_group_id` 输出，格式为 `/subscriptions/<subscription-id>/resourceGroups/<name>`。每个资源组服务于一个数据平面。 |
   | **使用现有的托管身份** |仅当您在模块的 `data_planes` 输入中为此数据平面设置 `byo_iam = true` 时才选择此选项，以便 Terraform 创建身份及其角色分配。在创建数据平面之前设置`byo_iam`，因为它以后无法更改。参见[Bring your own identities](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/azure/langsmith-byoc-access#bring-your-own-identities-optional)。否则，请将其清除。 |
   | **VNet CIDR 范围** | LangSmith 为数据平面创建的 VNet 的地址范围。使用从 `/16` 到 `/18` 的私有 RFC 1918 范围，该范围不与其他网络重叠。 |
   | **负载均衡器访问** |保留默认值**专用**，仅适用于从数据平面 VNet 和连接的网络进行访问。对于面向互联网的端点，切换到**公共**。 |3. 单击**创建数据平面**。 LangSmith 确认**请求数据平面**。

LangSmith 首先检查外部 ID、其权限、Key Vault、区域和 vCPU 配额。如果检查失败，表单会显示错误。参见[Troubleshoot data plane creation](#troubleshoot-data-plane-creation)。

**4.等待配置**

在 **设置 > 数据平面** 中，数据平面从 `requested` 移动到 `provisioning` 再到 `active`。如果 3 小时内未激活，则移至`provisioning_failed`。然后联系LangChain团队。

**5.连接到数据平面**

数据平面 URL 的格式为 `https://<data_plane_id>.azure.langchain-byoc.com`。在 **设置 > 数据平面** 下找到它。

* **内部负载均衡器** (`public_load_balancer: false`)：仅从其 VNet 到达数据平面。将您的网络连接到该 VNet（例如使用对等互连或 VPN 网关），并通过其私有 DNS 区域解析 DNS。单独的对等互连或 VPN 无法提供 DNS 解析。
* **公共负载均衡器** (`public_load_balancer: true`)：用户和应用程序通过互联网到达数据平面。

如果LangSmith UI无法访问您的数据平面，它会提示您切换到可访问的数据平面上的工作区。

**6。创建工作区**

在新数据平面中自动创建一个名为 `dp-<data_plane_name>` 的工作空间。在数据平面可达之前，它是不可访问的。您可以在数据平面中创建更多工作区。创建每个数据平面时选择目标数据平面：一个工作空间只属于一个数据平面，一个数据平面可以容纳多个工作空间。

> [!警告]
>
> 工作空间创建后无法移动到另一个数据平面。

**7. （可选）迁移现有数据**

如果您要从 LangSmith 云或 [self-hosted](/langsmith/self-hosted) 实例迁移，请联系 LangChain 团队安排迁移。仅 AWS 支持跟踪迁移。

欲了解更多信息，请参阅[Migrate to BYOC](/langsmith/byoc-migration)。

要将跟踪和 API 请求发送到数据平面，请参阅[BYOC usage](/langsmith/byoc-usage)。

## 数据平面创建故障排除|代码| HTTP 状态 |原因 |修复 |
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

当 Azure 数据平面为 `provisioning` 或 `active` 时，您可以更改其以下设置：|设置|领域 |天蓝色|
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

Terraform 减少了自定义角色并删除了 `User Access Administrator` 分配。 Azure 在最多 5 分钟内应用更改。 LangChain 仍然可以升级、扩展和修复数据平面。它无法删除数据平面、其数据库、存储或网络，也无法创建角色分配。在删除或重新创建数据平面之前以及在添加角色分配的升级之前，将 `reduced_access` 设置回 `false`。

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

如果在同一资源组中创建具有相同名称的新数据平面，它将重用 Key Vault 和保留的 Blob 存储帐户。当不再需要数据时，请先删除 Blob 存储帐户。然后从 `data_planes` 中删除密钥并运行 `terraform apply` 以删除资源组、Key Vault 和角色分配。

## 删除 LangSmith 访问权限

要阻止 LangSmith 更改数据平面，请删除 LangSmith 服务主体在其资源组和 AKS 群集上的角色分配。删除 Terraform 模块会删除对租户中每个数据平面的访问权限。资源保留在您的订阅中，LangChain 无法再升级或修复它们。如果要清理LangSmith，请先删除数据平面。

## 后续步骤

* [BYOC architecture on Azure](/langsmith/byoc-architecture-azure) 涵盖您订阅中的资源、网络路径以及 LangSmith 访问它们的方式。
* [BYOC usage](/langsmith/byoc-usage) 涵盖如何将应用程序和 API 客户端指向数据平面。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-onboarding-azure.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。