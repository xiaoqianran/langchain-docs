<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: BYOC onboarding on GCP | https://docs.langchain.com/langsmith/byoc-onboarding-gcp -->

# GCP 上的 BYOC 入门

在您的 GCP 项目中设置 LangSmith BYOC 数据平面，从配置者服务帐户到使用 API 创建、更改和删除数据平面。

GCP 上的 BYOC 在 GCP 项目中运行 LangSmith 数据平面，位于 [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-byoc-onboarding-gcp) 的 LangSmith US 控制平面上。您创建服务帐户 LangSmith 规定，然后使用 LangSmith API 创建数据平面。对于 AWS 上的 BYOC，请参阅 [BYOC onboarding](/langsmith/byoc-onboarding-aws)。

> [!注意]
>
> GCP 上的 BYOC 位于 [beta](/langsmith/release-stages)。输入和行为可能会在版本之间发生变化。

有关LangSmith在您的项目中部署的内容及其获得的访问权限，请参阅[BYOC architecture on GCP](/langsmith/byoc-architecture-gcp)。

## 开始之前

您需要以下内容：* **在您的组织上启用 BYOC**：在 [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-byoc-onboarding-gcp) 在 LangSmith 中创建一个组织，或重复使用现有组织，并将其组织 ID 发送到 LangChain 团队以启用 BYOC。
* **组织管理员**：创建数据平面需要组织管理员角色以及该用户的 API 密钥。
* **数据平面的 GCP 项目**：使用仅包含 LangSmith 资源的项目，因为配置者的访问权限涵盖整个项目。详情请参见[What LangChain can and cannot access](/langsmith/byoc-architecture-gcp#what-langchain-can-and-cannot-access)。
* **该项目中的权限**：创建服务帐户、授予项目 IAM 角色和启用 API 的权限。
* **Terraform**：Terraform 1.11.0 或更高版本，带有 Google 提供商 `~> 6.0`。
* **GCP 区域**：GCP 上的 BYOC 可以在任何 GCP 区域中运行。如果您需要的区域尚未启用，请联系LangChain团队添加。
* **资源位置策略**：如果您的 GCP 组织限制资源位置，请允许数据平面区域和 `us-central1`。数据平面在`us-central1`中创建其到LangSmith的私有服务连接端点。

## 设置数据平面

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
flowchart LR
  A["1. Get the<br>external ID"] --> B["2. Run the<br>Terraform module"]
  B --> C["3. Send your project<br>number to LangChain"]
  C --> D["4. Create the<br>data plane"]
  D --> E["5. Wait until<br>active"]

  classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
  class A,B,C,D,E process
```

### 步骤 1. 获取外部 ID导航到 LangSmith 中的 **设置 > 数据平面**，然后使用 **数据平面** 标题旁边的复制按钮复制外部 ID。不要编造自己的价值。

### 步骤 2. 运行 Terraform 模块

在您的项目中应用[⟦T8⟧ Terraform module](https://github.com/langchain-ai/terraform/tree/main/modules/byoc/gcp/langsmith-byoc-service-account)。该模块：

* 启用数据平面使用的 API。如果您在其他地方管理项目的 API，请设置 `enable_apis = false`。
* 创建配置者服务帐户 `langsmith-byoc-provisioner`，其描述设置为您的外部 ID。
* 授予其自定义角色，仅具有配置和拆卸使用的权限。
* 让 LangSmith 控制平面服务帐户 `byoc-crossplane@langchain-prod.iam.gserviceaccount.com` 通过服务帐户令牌创建者角色来模拟它。该模块不信任其他LangSmith身份。

```hcl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
provider "google" {
  project = "<project-id>"
}

module "langsmith_byoc_service_account" {
  source = "github.com/langchain-ai/terraform//modules/byoc/gcp/langsmith-byoc-service-account?ref=v0.17.60"

  project_id                 = "<project-id>"
  crossplane_service_account = "byoc-crossplane@langchain-prod.iam.gserviceaccount.com"
  external_id                = "<external-id-from-langsmith>"
}

output "provisioner_service_account" {
  value = module.langsmith_byoc_service_account.provisioner_service_account
}
```

使用该模块的版本 v0.17.58 或更高版本。早期版本缺乏项目中的第一个数据平面创建其 Private Service Connect 端点所需的权限。

要自行创建数据平面服务帐户及其项目角色，请在项目中创建数据平面之前设置 `byo_iam = true`。然后，配置者无法创建服务账户或更改项目 IAM 策略。创建数据平面，并将 `byoiam_enabled` 设置为 `true`。欲了解更多信息，请参阅[Bring your own IAM](/langsmith/byoc-architecture-gcp#bring-your-own-iam)。### 步骤 3. 将您的项目编号发送至LangChain

LangChain 必须允许您的项目通过 Private Service Connect 连接到 LangSmith。在此之前，配置无法完成。

获取您的项目编号：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
gcloud projects describe <project-id> --format='value(projectNumber)'
```

将其发送给LangChain团队，等待确认后即可创建数据平面。

### 步骤 4. 创建数据平面

使用组织管理员的 API 密钥，通过 LangSmith API 创建数据平面：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST https://api.smith.langchain.com/orgs/current/data-planes \
  -H "X-API-Key: $LANGSMITH_API_KEY" \
  -H "X-Organization-Id: <organization-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prod",
    "region": "<gcp-region>",
    "gcp_project_id": "<project-id>",
    "provisioner_service_account": "langsmith-byoc-provisioner@<project-id>.iam.gserviceaccount.com",
    "vpc_cidr": "10.80.0.0/16",
    "public_load_balancer": false
  }'
```

该请求包含以下字段：

|领域|规则|
| - | - |
| `name` |最多 21 个字符：小写字母、数字和连字符。必须以字母开头，以字母或数字结尾，并且不能以 `internal` 开头。在您的组织中必须是唯一的。 |
| `region` |数据平面的 GCP 区域。 GCP 上的 BYOC 可以在任何 GCP 区域中运行。如果您需要的区域尚未启用，请联系LangChain团队添加。 |
| `gcp_project_id` |来自[Step 2](#step-2-run-the-terraform-module)的项目。 |
| `provisioner_service_account` | `provisioner_service_account` Terraform 输出。一定是在项目里的。 |
| `vpc_cidr` | LangSmith创建的VPC范围。私有 RFC 1918 范围从 `/16` 到 `/18`。它不得与 GKE Pod 和服务使用的 `192.168.0.0/17` 重叠。 |
| `public_load_balancer` | `true` 用于公共端点。 `false`（默认）用于内部端点。参见[Choose a public or internal endpoint](#choose-a-public-or-internal-endpoint)。 || `byoiam_enabled` |选修的。 `true` 如果您使用`byo_iam = true`应用模块。 |
| `sandboxes_enabled` |选修的。 `true` 在数据平面部署[LangSmith sandboxes](/langsmith/sandboxes)。默认为`false`。 |

API 返回 `202` 以及数据平面的 `id`、`api_url` 和 `status`。在接受请求之前，LangSmith 检查它是否可以模拟配置程序，并且配置程序位于项目中并带有您的外部 ID。如果检查失败，响应会指出问题所在。参见[Troubleshoot create errors](#troubleshoot-create-errors)。

### 步骤 5. 等待激活

LangSmith 配置项目中的基础设施。数据平面状态从`requested`移动到`provisioning`再到`active`。在 **设置 > 数据平面** 中或使用 `GET /orgs/current/data-planes/<id>` 进行跟踪。

> [!注意]
>
> 配置最多可能需要 3 小时。 3小时后，状态变为`provisioning_failed`。如果发生这种情况，请联系 LangChain 团队。

数据平面处于活动状态后，其中将提供一个名为 `dp-<data_plane_name>` 的工作区，您可以像在 AWS 上一样创建更多工作区。请参阅 [BYOC onboarding](/langsmith/byoc-onboarding-aws) 中的 **创建工作区** 步骤。

## 使用您的数据平面

### 查找数据平面 URL

数据平面 URL 是数据平面的`api_url`：`https://<first 8 characters of the data plane ID>.gcp.langchain-byoc.com`。您还可以在 **设置 > 数据平面** 中找到它。

要将应用程序和 API 客户端指向数据平面，请参阅 [BYOC usage](/langsmith/byoc-usage)。### 选择公共或内部端点

您在创建数据平面时选择端点类型：

* **公共**：用户从互联网到达数据平面。
* **内部**（默认）：入口位于内部负载均衡器上，主机名仅在数据平面 VPC 内部解析。将您的网络连接到该 VPC（例如使用 VPC 对等互连或 Cloud VPN），并从您的网络解析主机名。

来自数据平面的出站流量通过具有静态 IP 地址的 Cloud NAT 离开，因此您可以将数据平面列入白名单。

### 更改数据平面设置

在 GCP 上，您可以更改维护时段。 Blob TTL、队列 OIDC 和网络防火墙设置不可用。

维护时段为 UTC 两小时，整点，例如 `sun:07:00-sun:09:00`。它适用于 Cloud SQL 和 Memorystore，其窗口持续一小时，因此 LangSmith 仅使用开始。当它被取消设置时，Google 会选择该窗口。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X PATCH https://api.smith.langchain.com/orgs/current/data-planes/<id> \
  -H "X-API-Key: $LANGSMITH_API_KEY" \
  -H "X-Organization-Id: <organization-id>" \
  -H "Content-Type: application/json" \
  -d '{"maintenance_window": "sun:07:00-sun:09:00"}'
```

GKE 节点在 GKE `REGULAR` 发布通道上自动升级。

## 解决创建错误

创建请求返回以下错误代码：|代码| HTTP |原因 |修复 |
| - | - | - | - |
| `gcp_permissions` | 403 | 403 LangSmith 无法冒充配置者，或者配置者缺乏权限。 |应用 Terraform 模块，并选中 `crossplane_service_account`。 |
| `gcp_api_disabled` | 400 |项目中禁用了所需的 API。 |启用消息中指定的 API，或保留`enable_apis = true`。 |
| `gcp_project_not_found` | 400 |该项目不存在，或者配置者看不到它。 |检查`gcp_project_id`。 |
| `gcp_service_account_not_found` | 400 |项目中不存在配置者服务帐户。 |检查`provisioner_service_account`和`gcp_project_id`。 |
| `gcp_provisioner_project_mismatch` | 400 |配置者位于不同的项目中。 |使用在数据平面项目中创建的模块的配置程序。 |
| `gcp_provisioner_not_owned` | 403 | 403配置者的描述不是您的外部 ID。 |使用 **设置 > 数据平面** 中的外部 ID 重新应用模块。 |
| `byoiam_validation` | 400 | `byoiam_enabled` 是 `true`，但项目缺少 LangSmith 服务帐户。 |使用`byo_iam = true`应用模块。 |
| `gcp_policy_denied` | 403 | 403组织策略拒绝了请求，例如资源位置限制。 |在策略中允许数据平面区域和`us-central1`。 |
| `gcp_throttled` | 429 | 429 GCP 速率限制了请求。 |一分钟后重试。 || `gcp_unavailable` | 502 | 502 GCP 返回错误。 |一分钟后重试。 |
| `organization_admin_required` | 403 | 403 API 密钥的用户不是组织管理员。 |使用组织管理员的 API 密钥。 |
| `organization_external_id_missing` | 409 | 409未为您的组织设置 BYOC。 |联系LangChain团队。 |
| `data_plane_name_taken` | 409 | 409您的组织已有一个具有此名称的数据平面。 |选择另一个`name`。 |

字段验证失败的请求（例如未启用的区域或与 GKE 范围重叠的 `vpc_cidr`）将返回 `400` 以及字段和原因。

## 删除数据平面

> [!警告]
>
> 在删除 LangSmith 中的数据平面之前，请勿销毁 Terraform 模块。 LangSmith需要配置者删除数据平面资源。

删除数据平面：

1. 删除`DELETE /orgs/current/data-planes/<id>`数据平面。您可以在`active`、`provisioning`或`provisioning_failed`时将其删除。 LangSmith 删除它在项目中创建的资源以及其中的所有数据。
2. 等待数据平面从 **设置 > 数据平面** 消失。
3. 如果没有其他数据平面使用该项目，则运行`terraform destroy`。

## 获取帮助

当某些功能不起作用时，[contact LangChain support](https://support.langchain.com)：* 您的组织 ID 和数据平面名称。
* 你做了什么，发生了什么。
* 错误消息、屏幕截图和时间戳。
* 对于配置问题：您的 GCP 项目 ID、项目编号和区域。

## 另请参阅

* [BYOC architecture on GCP](/langsmith/byoc-architecture-gcp)
* [BYOC overview](/langsmith/byoc)
* [BYOC usage](/langsmith/byoc-usage)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/byoc-onboarding-gcp.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。