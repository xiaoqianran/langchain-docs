<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Attribute-based access control | https://docs.langchain.com/langsmith/abac -->

# 基于属性的访问控制

本参考资料介绍了LangSmith基于属性的访问控制（ABAC）系统，该系统能够基于资源属性进行细粒度的访问控制，是对[RBAC](/langsmith/rbac)的补充。有关自动将用户配置为角色的信息，请参阅[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)。

> [!注意]
>
> ABAC（基于属性的访问控制）是一项用于管理细粒度访问控制的企业功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用管理员角色。

ABAC 通过添加基于标签的条件来访问决策来补充[Role-Based Access Control (RBAC)](/langsmith/rbac)。 RBAC 根据用户角色授予一揽子权限（例如，“可以读取所有项目”），而 ABAC 允许您根据资源标签限制或授予访问权限（例如，“只能读取带有环境 = 开发标签的项目”）。

> [!注意]
>
> 角色、资源标签和ABAC策略可以通过UI或[API](https://api.smith.langchain.com/docs#/access_policies)进行管理。配置完成后，策略将在 API 和 UI 中自动实施。

## 开始之前

* [Set up resource tags](/langsmith/set-up-resource-tags) 在您的工作空间中。
* ABAC 目前仅支持 `resource_tag_key` 作为策略中的 `attribute_name`，用于根据资源标签进行评估。尚不支持其他属性。## 为自托管部署启用 ABAC

1. ABAC 需要运行 Helm Chart 0.11.28 或更高版本（应用程序版本 0.12.1）的 [self-hosted](/langsmith/self-hosted) LangSmith 部署。升级后，请使用以下选项之一启用 ABAC：

   * **为特定组织启用：** 针对您的 LangSmith PostgreSQL 数据库运行以下命令，将 `<organization_id>` 替换为从 UI 中的组织设置页面复制的 ID：

     ```sql theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     UPDATE organizations SET config = config || '{"can_use_abac": true}' WHERE id = '<organization_id>' AND NOT is_personal;
     ```

   * **为所有组织启用：** 将以下环境变量添加到 `values.yaml` 中的 `commonEnv`：

     ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     DEFAULT_ORG_FEATURE_CAN_USE_ABAC: "true"
     ```

     > [!注意]
     >
     > 该环境变量对个人组织没有影响，因为个人组织未启用[RBAC](/langsmith/rbac)。

2. 设置身份验证。要通过 API 管理访问策略，您需要具有 `organization:access-control:manage` 的用户的个人访问令牌 (PAT)，例如 [Organization Admin](/langsmith/rbac#organization-admin) 或 [Organization Operator](/langsmith/rbac#organization-operator)，或具有组织管理员权限的组织范围服务密钥。在运行任何脚本之前设置以下环境变量：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_API_KEY="your_admin_api_key"
   # Required for self-hosted or regional SaaS deployments:
   # export LANGCHAIN_ENDPOINT="https://eu.api.smith.langchain.com"
   # export LANGCHAIN_ENDPOINT="https://aws.api.smith.langchain.com"
   # export LANGCHAIN_ENDPOINT="https://apac.api.smith.langchain.com"
   # export LANGCHAIN_ENDPOINT="https://langsmith.yourdomain.com/api"
   ```

## 访问策略结构

访问策略定义授予或拒绝访问的条件。结构如下：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Policy Name",
  "description": "Optional description",
  "effect": "allow | deny",
  "condition_groups": [
    {
      "permission": "projects:read",
      "resource_type": "project",
      "conditions": [
        {
          "attribute_name": "resource_tag_key",
          "attribute_key": "Environment",
          "operator": "equals",
          "attribute_value": "Production"
        }
      ]
    }
  ],
  "role_ids": ["<role-uuid>"]
}
```

###效果`effect` 确定条件匹配时会发生什么：

* **`allow`** - 条件匹配时授予访问权限
* **`deny`** - 条件匹配时阻止访问

> [!注意]
>
> 拒绝策略始终优先。如果允许和拒绝策略均匹配，则访问将被拒绝。

### 条件组

`condition_groups` 数组包含一个或多个条件组。使用 **OR 逻辑** 评估多个条件组 - 如果任何组匹配，则应用策略。

每个条件组指定：

* **`permission`** - 该组适用的权限
* **`resource_type`** - 要匹配的资源类型
* **`conditions`** - 条件数组（在组内使用 **AND 逻辑** 进行评估）

#### 资源类型和权限

|资源类型|支持的权限 |
| - | - |
| `project` | `projects:read`、`projects:update`、`projects:delete`、`runs:read`、`runs:read-inputs`、`runs:read-outputs`、`runs:share`、`runs:delete`、`projects:increase-trace-tier`、`projects:decrease-trace-tier` |
| `prompt` | `prompts:read`、`prompts:update`、`prompts:delete`、`prompts:share`、`prompts:tag` |
| `dataset` | `datasets:read`、`datasets:update`、`datasets:delete`、`datasets:share`、`datasets:download`、`datasets:clone` |
| `deployment` | `deployments:read`、`deployments:update`、`deployments:delete` |
| `queues` | `annotation-queues:create`、`annotation-queues:delete`、`annotation-queues:read`、`annotation-queues:update` |
| `mcp_server` | `mcp-servers:read`、`mcp-servers:invoke`、`mcp-servers:update`、`mcp-servers:delete`。参见[Fleet tool access control](/langsmith/fleet/access-and-oversight#tool-access-control)。 |
| `fleet_integration` | `mcp-servers:read`、`mcp-servers:invoke`。参见[Fleet tool access control](/langsmith/fleet/access-and-oversight#tool-access-control)。 |> [!注意]
>
> 运行没有自己的标签。运行权限（`runs:read`、`runs:read-inputs`、`runs:read-outputs`、`runs:create`、`runs:share`、`runs:delete`）根据父项目的标签进行评估。输入输出权限如何影响响​​应，请参考[Control access to run inputs and outputs](#control-access-to-run-inputs-and-outputs)。

> [!注意]
>
> 克隆将示例从源数据集复制到目标数据集。对两个数据集检查`datasets:clone`权限：一次使用源数据集的标签，一次使用目标数据集的标签。要成功克隆，策略必须授予 `datasets:clone` 对两个数据集的访问权限。

#### 条件

`conditions` 数组中的每个条件指定：

* **`attribute_name`** - 目前仅支持`resource_tag_key`
* **`attribute_key`** - 要匹配的标签键（例如，`Environment`、`Application`）
* **`operator`** - 比较运算符
* **`attribute_value`** - 要比较的值

#### 运算符

|操作员|描述 |
| - | - |
| `equals` |精确匹配（区分大小写）|
| `not_equals` |值不同（区分大小写）|
| `equals_ignore_case` |精确匹配（不区分大小写）|
| `not_equals_ignore_case` |值不同（不区分大小写）|
| `matches` |与 `*` 和 `?` 通配符匹配的 Glob 模式 |
| `not_matches` |当值与全局模式不匹配时匹配 |

#### `_if_exists` 变种每个运算符都有一个 `_if_exists` 变体，当标签键不存在时默认匹配，或者当标签存在时正常评估条件：

|操作员|描述 |
| - | - |
| `equals_if_exists` |完全匹配（区分大小写），或者如果标签键不存在 |
| `not_equals_if_exists` |值不同（区分大小写），或者标签键不存在 |
| `equals_ignore_case_if_exists` |完全匹配（不区分大小写），或者如果标签键不存在 |
| `not_equals_ignore_case_if_exists` |值不同（不区分大小写），或者如果标签键不存在 |
| `matches_if_exists` |全局模式匹配，或者如果标签键不存在 |
| `not_matches_if_exists` |当值与全局模式不匹配或标记键不存在时匹配 |

> [!提示]
>
> 在 **允许** 策略中，`_if_exists` 变体授予对匹配条件或不具有指定标签键的资源的访问权限。在“拒绝”策略中，它们会阻止匹配条件或不具有标记键的资源。

### 角色

`role_ids` 数组指定策略适用于哪些工作区角色。当具有该角色的用户访问资源时，将评估策略条件。

创建策略时，可以将策略附加到 [workspace roles](/langsmith/rbac#workspace-roles)（内置或 [custom](/langsmith/rbac#custom-roles)），或者稍后在 UI 中或使用 API 附加。保单也可以附加到[teams](/langsmith/teams#access-policies)。团队的策略适用于团队可以访问的工作区中的成员。

## 管理访问策略

在您的组织设置中或使用 LangSmith API 管理访问策略。创建、编辑或删除策略需要 `organization:access-control:manage`，[Organization Admins](/langsmith/rbac#organization-admin) 和 [Organization Operators](/langsmith/rbac#organization-operator) 持有。在创建策略之前，请在您的工作区中[set up resource tags](/langsmith/set-up-resource-tags)。

团队不制定政策。他们附加现有的：

* 将策略附加到团队需要`organization:teams:manage-policies`。
* 工作区管理员可以将现有策略作为工作区中的 [workspace-only policy](/langsmith/teams#add-workspace-only-members-and-policies) 附加到团队，并使用 `workspaces:teams:manage-policies`。

## ABAC 如何与 RBAC 配合使用

在确定对资源的访问权限时，会同时考虑[RBAC](/langsmith/rbac) 权限和 ABAC 策略：

* ABAC **拒绝**策略覆盖 RBAC 权限
* ABAC **允许** 策略即使没有 RBAC 权限也可以授予访问权限
* 如果没有ABAC策略匹配，系统回退到RBAC

当用户属于[teams](/langsmith/teams)时，LangSmith会从用户的角色和每个团队一起评估权限和策略。来自任何来源的匹配拒绝策略仍会阻止访问。

### 政策评估结果

**功能组合：**|启用 RBAC | ABAC 已启用 |行为 |
| - | - | - |
| ✗ | ✗ |所有工作区成员都具有管理员级别访问权限 |
| ✓ | ✗ | Standard RBAC - access based on role permissions |
| ✓ | ✓ | RBAC + ABAC - fine-grained tag-based access control |

**同时启用 RBAC 和 ABAC 时：**

| RBAC 许可 | Allow policy matches | Deny policy matches | Result |
| - | - | - | - |
| ✓ | ✓ | ✗ | **允许** |
| ✓ | ✗ | ✗ | **允许**（RBAC 后备）|
| ✓ | ✓ | ✓ | **被拒绝**（否认获胜）|
| ✓ | ✗ | ✓ | **Denied** (deny wins) |
| ✗ | ✓ | ✗ | **允许**（ABAC 授予访问权限）|
| ✗ | ✗ | ✗ | **被拒绝** |
| ✗ | ✓ | ✓ | **Denied** (deny wins) |

## 控制对运行输入和输出的访问

`runs:read` 控制用户是否可以看到跑步。 `runs:read-inputs` and `runs:read-outputs` control whether they can see its inputs and outputs. Access policies for these permissions use `resource_type: "project"` and are evaluated against each run's parent project, so you can hide inputs, outputs, or both in some projects while leaving other projects in the workspace unchanged. RBAC and ABAC combine for these permissions the same way they do for any other permission.详情请参阅[How ABAC works with RBAC](#how-abac-works-with-rbac)。

## Example scenarios### 1. Restrict annotators to their datasets

允许注释者仅访问为其注释组标记的数据集：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Annotator Group A Access",
  "effect": "allow",
  "condition_groups": [{
    "permission": "datasets:read",
    "resource_type": "dataset",
    "conditions": [{
      "attribute_name": "resource_tag_key",
      "attribute_key": "Annotation-Group",
      "operator": "equals",
      "attribute_value": "Group-A"
    }]
  }]
}
```

### 2. Block sensitive data

Deny access to datasets containing PII.由于拒绝策略会覆盖允许策略，因此即使具有 RBAC 权限的用户也会阻止访问：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Block PII Datasets",
  "effect": "deny",
  "condition_groups": [{
    "permission": "datasets:read",
    "resource_type": "dataset",
    "conditions": [{
      "attribute_name": "resource_tag_key",
      "attribute_key": "Contains-PII",
      "operator": "equals",
      "attribute_value": "true"
    }]
  }]
}
```

### 3. Application-based access with wildcards

允许工程师使用 glob 模式访问“聊天机器人”系列中任何应用程序的项目：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Chatbot Apps Access",
  "effect": "allow",
  "condition_groups": [{
    "permission": "projects:read",
    "resource_type": "project",
    "conditions": [{
      "attribute_name": "resource_tag_key",
      "attribute_key": "Application",
      "operator": "matches",
      "attribute_value": "chatbot-*"
    }]
  }]
}
```

### 4. Client and purpose isolation (AND logic)

仅当满足两个条件时才授予访问权限 - 数据集用于训练且属于特定客户端：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Client Training Data Access",
  "effect": "allow",
  "condition_groups": [{
    "permission": "datasets:read",
    "resource_type": "dataset",
    "conditions": [
      {
        "attribute_name": "resource_tag_key",
        "attribute_key": "Purpose",
        "operator": "equals",
        "attribute_value": "Training"
      },
      {
        "attribute_name": "resource_tag_key",
        "attribute_key": "Client",
        "operator": "equals",
        "attribute_value": "Acme-Corp"
      }
    ]
  }]
}
```

### 5. 客户端数据加上没有使用 `_if_exists` `Client` 标签的资源

顾问没有 RBAC `datasets:read` 权限，但此策略允许他们访问标记为 `Client=Acme-Corp` 的数据集，以及根本没有 `Client` 标签的数据集。用不同客户端标记的数据集（例如，`Client=Other-Corp`）仍然被阻止：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Acme Consultant Access",
  "effect": "allow",
  "condition_groups": [{
    "permission": "datasets:read",
    "resource_type": "dataset",
    "conditions": [{
      "attribute_name": "resource_tag_key",
      "attribute_key": "Client",
      "operator": "equals_if_exists",
      "attribute_value": "Acme-Corp"
    }]
  }]
}
```

### 6.隐藏敏感项目中的运行输入和输出Let users keep browsing runs in projects that contain PII, but hide the runs' inputs and outputs. Each permission gets its own condition group, and the groups are evaluated with OR logic. Users still need `runs:read` to see the runs:

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Hide PII Run Payloads",
  "effect": "deny",
  "condition_groups": [
    {
      "permission": "runs:read-inputs",
      "resource_type": "project",
      "conditions": [{
        "attribute_name": "resource_tag_key",
        "attribute_key": "Contains-PII",
        "operator": "equals",
        "attribute_value": "true"
      }]
    },
    {
      "permission": "runs:read-outputs",
      "resource_type": "project",
      "conditions": [{
        "attribute_name": "resource_tag_key",
        "attribute_key": "Contains-PII",
        "operator": "equals",
        "attribute_value": "true"
      }]
    }
  ]
}
```

## Tag resources at creation time

When ABAC policies are active, resources are access-controlled based on their tags.为了确保资源在创建后立即受到保护，您可以使用 `tag_value_ids` 参数直接在创建请求中提供标签。

This is supported on project, dataset, and prompt creation endpoints (including fork and clone operations). Tags are applied atomically in the same database transaction as resource creation.

For full details and examples, see [Tag a resource at creation time](/langsmith/set-up-resource-tags#tag-a-resource-at-creation-time) in the resource tags guide.

> [!注意]
>
> 如果您依赖 LangSmith SDK 在跟踪提取期间自动创建跟踪项目，则 `tag_value_ids` 参数在该自动创建路径上不可用。为了确保 ABAC 策略从一开始就适用，请在开始跟踪会话之前通过 `POST /api/v1/sessions` 使用所需的 `tag_value_ids` 预先创建项目。

## 故障排除

**Access unexpectedly denied?*** Check if a deny policy is matching (deny always takes precedence)
* Check if the user has RBAC permissions or a matching allow policy
* Verify the resource has the expected tag and value
* 使用 `_if_exists` 运算符的拒绝策略会阻止缺少该标签键的资源
* 对于区分大小写的运算符（`equals`、`not_equals`），检查大小写不匹配
* With multiple conditions in a group, all must match (AND logic)

**意外授予访问权限？**

* Review RBAC permissions (users may have access via their role)
* Check if an allow policy is too broad (e.g., using wildcards)
* `_if_exists` operators match resources missing that tag key

**运行输入或输出丢失？**

* Check that the user's role grants `runs:read-inputs` and `runs:read-outputs`, or that an allow policy grants them for the run's project
* Check for a deny policy on `runs:read-inputs` or `runs:read-outputs` that matches the project's tags
* Message and trajectory views return `403 Forbidden` unless both permissions are granted

**政策未生效？**

* Confirm the policy is attached to the correct role
* 验证用户在工作区中具有该角色
* Check that `resource_type` and `permission` match the resource being accessed

***[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/abac.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。