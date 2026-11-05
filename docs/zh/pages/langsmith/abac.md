<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Attribute-based access control | https://docs.langchain.com/langsmith/abac -->

# 基于属性的访问控制

本参考资料介绍了LangSmith的基于属性的访问控制（ABAC）系统，该系统能够基于资源属性进行细粒度的访问控制，是对[RBAC](/langsmith/rbac)的补充。有关自动将用户配置为角色的信息，请参阅[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)。

> [!注意]
>
> ABAC（基于属性的访问控制）是一项用于管理细粒度访问控制的企业功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用管理员角色。

ABAC 通过添加基于标签的条件来访问决策来补充[Role-Based Access Control (RBAC)](/langsmith/rbac)。 RBAC 根据用户角色授予一揽子权限（例如，“可以读取所有项目”），而 ABAC 允许您根据资源标签限制或授予访问权限（例如，“只能读取带有环境 = 开发标签的项目”）。在项目中，ABAC 还可以根据根运行元数据限制用户可以读取哪些跟踪。详情请参阅[Control trace access with root run metadata](#control-trace-access-with-root-run-metadata)。

> [!注意]
>
> 角色、资源标签和ABAC策略可以通过UI或[API](https://api.smith.langchain.com/docs#/access_policies)进行管理。配置完成后，策略将在 API 和 UI 中自动实施。

## 开始之前* [Set up resource tags](/langsmith/set-up-resource-tags) 在您的工作空间中。
* ABAC 支持策略中 `attribute_name` 的两个值：`resource_tag_key`，用于评估资源标签；`root_run_metadata`，用于评估项目中每个跟踪的根运行元数据。

## 为自托管部署启用 ABAC

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
   ```## 访问策略结构

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

###效果

`effect` 确定条件匹配时会发生什么：

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

#### 资源类型和权限|资源类型|支持的权限 |
| - | - |
| `project` | `projects:read`、`projects:update`、`projects:delete`、`runs:read`、`runs:read-inputs`、`runs:read-outputs`、`runs:share`、`runs:delete`、`projects:increase-trace-tier`、`projects:decrease-trace-tier` |
| `prompt` | `prompts:read`、`prompts:update`、`prompts:delete`、`prompts:share`、`prompts:tag` |
| `dataset` | `datasets:read`、`datasets:update`、`datasets:delete`、`datasets:share`、`datasets:download`、`datasets:clone` |
| `deployment` | `deployments:read`、`deployments:update`、`deployments:delete` |
| `queues` | `annotation-queues:create`、`annotation-queues:delete`、`annotation-queues:read`、`annotation-queues:update` |
| `mcp_server` | `mcp-servers:read`、`mcp-servers:invoke`、`mcp-servers:update`、`mcp-servers:delete`。参见[Fleet tool access control](/langsmith/fleet/access-and-oversight#tool-access-control)。 |
| `fleet_integration` | `mcp-servers:read`、`mcp-servers:invoke`。参见[Fleet tool access control](/langsmith/fleet/access-and-oversight#tool-access-control)。 |

> [!注意]
>
> 运行没有自己的标签。运行权限（`runs:read`、`runs:read-inputs`、`runs:read-outputs`、`runs:create`、`runs:share`、`runs:delete`）根据父项目的标签进行评估。输入输出权限如何影响响​​应，请参考[Control access to run inputs and outputs](#control-access-to-run-inputs-and-outputs)。

> [!注意]
>
> 克隆将示例从源数据集复制到目标数据集。对两个数据集检查`datasets:clone`权限：一次使用源数据集的标签，一次使用目标数据集的标签。要成功克隆，策略必须授予 `datasets:clone` 对两个数据集的访问权限。

#### 条件

`conditions` 数组中的每个条件指定：* **`attribute_name`** - `resource_tag_key` 匹配资源标签，或 `root_run_metadata` 匹配根运行元数据
* **`attribute_key`** - 要匹配的标签键或元数据键（例如，`Environment`、`Application`）
* **`operator`** - 比较运算符
* **`attribute_value`** - 要比较的值

以下运算符适用于`resource_tag_key` 条件。 `root_run_metadata`条件仅支持`equals`。其规则请参阅[Control trace access with root run metadata](#control-trace-access-with-root-run-metadata)。

#### 运算符

|操作员|描述 |
| - | - |
| `equals` |精确匹配（区分大小写）|
| `not_equals` |值不同（区分大小写）|
| `equals_ignore_case` |精确匹配（不区分大小写）|
| `not_equals_ignore_case` |值不同（不区分大小写）|
| `matches` |与 `*` 和 `?` 通配符匹配的 Glob 模式 |
| `not_matches` |当值与全局模式不匹配时匹配 |

#### `_if_exists` 变体

Each operator has an `_if_exists` variant that matches by default when the tag key is absent, or evaluates the condition normally when the tag exists:|操作员|描述 |
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

创建策略时，可以将策略附加到 [workspace roles](/langsmith/rbac#workspace-roles)（内置或 [custom](/langsmith/rbac#custom-roles)），或者稍后在 UI 中或使用 API 附加。

保单也可以附加到[teams](/langsmith/teams#access-policies)。团队的策略适用于团队可以访问的工作区中的成员。

## 管理访问策略在组织设置中或使用 LangSmith API 管理访问策略。创建、编辑或删除策略需要 `organization:access-control:manage`，[Organization Admins](/langsmith/rbac#organization-admin) 和 [Organization Operators](/langsmith/rbac#organization-operator) 持有。在创建策略之前，请在您的工作区中[set up resource tags](/langsmith/set-up-resource-tags)。

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
| ✓ | ✗ |标准RBAC——基于角色权限的访问|
| ✓ | ✓ | RBAC + ABAC - 基于标签的细粒度访问控制|

**同时启用 RBAC 和 ABAC 时：**

| RBAC 许可 |允许策略匹配 |拒绝策略匹配 |结果 |
| - | - | - | - |
| ✓ | ✓ | ✗ | **允许** |
| ✓ | ✗ | ✗ | **允许**（RBAC 后备）|
| ✓ | ✓ | ✓ | **被拒绝**（否认获胜）|
| ✓ | ✗ | ✓ | **被拒绝**（否认获胜）|
| ✗ | ✓ | ✗ | **允许**（ABAC 授予访问权限）|
| ✗ | ✗ | ✗ | **被拒绝** |
| ✗ | ✓ | ✓ | **被拒绝**（否认获胜）|

## 控制对运行输入和输出的访问

`runs:read` 控制用户是否可以看到跑步。 `runs:read-inputs`和`runs:read-outputs`控制是否可以看到其输入和输出。这些权限的访问策略使用 `resource_type: "project"` 并针对每个运行的父项目进行评估，因此您可以隐藏某些项目中的输入、输出或两者，同时保持工作区中的其他项目不变。 RBAC 和 ABAC 组合这些权限的方式与组合任何其他权限的方式相同。详情请参阅[How ABAC works with RBAC](#how-abac-works-with-rbac)。

## 使用 root 运行元数据控制跟踪访问`root_run_metadata` 条件根据每个跟踪的根运行元数据中的键来限制用户可以在项目中读取哪些跟踪。使用它可以隐藏项目中的某些跟踪，或者仅向用户显示为其标记的跟踪，而不将跟踪移动到单独的项目中。

`root_run_metadata` 条件仅在包含 `permission: "runs:read"` 和 `resource_type: "project"` 的条件组中有效。它接受以下字段：

* **`attribute_key`**：根运行元数据中的顶级密钥。不支持嵌套键，因此键不能包含`.`。
* **`operator`**：仅限`equals`。匹配区分大小写。
* **`attribute_value`**：要匹配的值，或占位符`${user.ls_user_id}`。占位符与发出请求的用户的 `ls_user_id` 匹配。从 [⟦T124⟧](/langsmith/smith-api/auth/get-public-auth-info) 检索该值。使用响应的 `ls_user_id` 字段，该字段不同于 `user_id` 或用户对象的 `id`。

`attribute_key` 和 `attribute_value` 都不能包含双引号或反斜杠，并且每个都限制为 255 个字节。以 `${` 开头的值必须恰好是 `${user.ls_user_id}`。

条件组可以将 `root_run_metadata` 条件与 `resource_tag_key` 条件组合起来。标记条件选择组应用到的项目，元数据条件选择这些项目中的跟踪。组中的所有条件都必须匹配。条件仅评估根运行，因此跟踪中的所有运行都可见或隐藏在一起。在引入之前在根运行上设置元数据键和值。根运行元数据在摄取后是不可变的，因此您以后无法添加或更改它以使跟踪与策略匹配。如何添加元数据请参考[Add metadata and tags to traces](/langsmith/add-metadata-tags)。

### 元数据条件如何与 RBAC 结合

元数据条件遵循与其他策略相同的优先级：首先应用拒绝策略，然后应用 RBAC，最后应用允许策略。

* **拒绝策略**：带有元数据条件的拒绝策略会隐藏匹配的痕迹，而不是阻止整个项目。用户可以访问项目中的其他跟踪。当应用多个拒绝策略时，与其中任何一个匹配的跟踪都会被隐藏。
* **允许策略**：具有元数据条件的允许策略仅在匹配的跟踪上授予`runs:read`。当应用多个允许策略时，用户可以读取与其中任何一个匹配的跟踪。
* **RBAC**：如果用户的角色授予`runs:read`，则用户可以读取拒绝策略未隐藏的每个跟踪，并且允许策略无效。要将角色限制为允许策略匹配的跟踪，请从角色中删除 `runs:read`。使用服务密钥进行身份验证的请求没有关联的`ls_user_id`，因此使用`${user.ls_user_id}`的条件不匹配。使用个人访问令牌 (PAT) 或登录的浏览器会话进行身份验证的请求具有用户的 `ls_user_id`。有关PAT和服务密钥的详细信息，请参阅[API keys](/langsmith/create-account-api-key#api-keys)。

### 元数据条件下的响应

当元数据条件应用于项目中的用户时，LangSmith 会将该用户在项目中的读取过滤到他们可以看到的跟踪：

* 运行列表、跟踪列表和运行分析会忽略隐藏的跟踪。
* 通过 ID 请求隐藏跟踪或其运行之一返回`404 Not Found`。这包括下载跟踪并打开其消息或轨迹。
* 项目列表省略了项目的运行和反馈统计。

## 示例场景

### 1. 将注释者限制在其数据集上

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

### 2. 阻止敏感数据

拒绝访问包含 PII 的数据集。由于拒绝策略会覆盖允许策略，因此即使具有 RBAC 权限的用户也会阻止访问：

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

### 3. 使用通配符进行基于应用程序的访问允许工程师使用 glob 模式访问“聊天机器人”系列中任何应用程序的项目：

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

### 4. 客户端和目的隔离（AND 逻辑）

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

### 5. 使用 `_if_exists` 的客户端数据加上没有 `Client` 标签的资源

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

### 6.隐藏敏感项目中的运行输入和输出

让用户继续浏览包含 PII 的项目中的运行，但隐藏运行的输入和输出。每个权限都有自己的条件组，并且使用 OR 逻辑对这些组进行评估。用户仍然需要 `runs:read` 才能查看运行情况：

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

### 7. 通过 root 运行元数据隐藏跟踪

在每个项目中隐藏根运行将 `source` 设置为 `customer` 的跟踪。角色授予 `runs:read` 的用户仍然可以看到所有其他跟踪：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Hide Customer Traces",
  "effect": "deny",
  "condition_groups": [{
    "permission": "runs:read",
    "resource_type": "project",
    "conditions": [{
      "attribute_name": "root_run_metadata",
      "attribute_key": "source",
      "operator": "equals",
      "attribute_value": "customer"
    }]
  }]
}
```

### 8. 仅向用户显示为他们标记的痕迹仅显示每个用户的根运行将 `allowed_ls_user_id` 设置为该用户的 LangSmith 用户 ID 的跟踪。将此策略附加到不授予 `runs:read` 的角色，因为 RBAC 权限优先于允许策略：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Traces Labeled for the Caller",
  "effect": "allow",
  "condition_groups": [{
    "permission": "runs:read",
    "resource_type": "project",
    "conditions": [{
      "attribute_name": "root_run_metadata",
      "attribute_key": "allowed_ls_user_id",
      "operator": "equals",
      "attribute_value": "${user.ls_user_id}"
    }]
  }]
}
```

### 9. 生产项目中的团队跟踪

仅在标记为 `Environment=prod` 的项目中，授予对其根运行将 `team` 设置为 `payments` 的跟踪的访问权限。标签条件选择项目，元数据条件选择其中的跟踪：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Payments Traces in Prod",
  "effect": "allow",
  "condition_groups": [{
    "permission": "runs:read",
    "resource_type": "project",
    "conditions": [
      {
        "attribute_name": "resource_tag_key",
        "attribute_key": "Environment",
        "operator": "equals",
        "attribute_value": "prod"
      },
      {
        "attribute_name": "root_run_metadata",
        "attribute_key": "team",
        "operator": "equals",
        "attribute_value": "payments"
      }
    ]
  }]
}
```

## 在创建时标记资源

当 ABAC 策略处于活动状态时，资源将根据其标签进行访问控制。为了确保资源在创建后立即受到保护，您可以使用 `tag_value_ids` 参数直接在创建请求中提供标签。

项目、数据集和提示创建端点（包括分叉和克隆操作）支持此功能。标签在与资源创建相同的数据库事务中以原子方式应用。

有关完整的详细信息和示例，请参阅资源标签指南中的[Tag a resource at creation time](/langsmith/set-up-resource-tags#tag-a-resource-at-creation-time)。> [!注意]
>
> 如果您依赖 LangSmith SDK 在跟踪提取期间自动创建跟踪项目，则 `tag_value_ids` 参数在该自动创建路径上不可用。为了确保 ABAC 策略从一开始就适用，请在开始跟踪会话之前通过 `POST /api/v1/sessions` 使用所需的 `tag_value_ids` 预先创建项目。

## 故障排除

**访问意外被拒绝？**

* 检查拒绝策略是否匹配（拒绝始终优先）
* 检查用户是否具有RBAC权限或匹配的允许策略
* 验证资源是否具有预期的标签和值
* 使用 `_if_exists` 运算符的拒绝策略会阻止缺少该标签键的资源
* 对于区分大小写的运算符（`equals`、`not_equals`），检查大小写不匹配
* 一组中有多个条件，所有条件都必须匹配（AND 逻辑）

**意外授予访问权限？**

* 检查 RBAC 权限（用户可以通过其角色进行访问）
* 检查允许策略是否太宽泛（例如，使用通配符）
* `_if_exists` 运算符匹配缺少该标签键的资源

**运行输入或输出丢失？*** 检查用户的角色是否授予 `runs:read-inputs` 和 `runs:read-outputs`，或者允许策略是否为运行的项目授予它们
* 检查 `runs:read-inputs` 或 `runs:read-outputs` 上是否有与项目标签匹配的拒绝策略
* 消息和轨迹视图返回`403 Forbidden`，除非这两个权限都被授予

**痕迹丢失或返回`404 Not Found`？**

* 检查是否有与跟踪的根运行元数据匹配的 `root_run_metadata` 条件的拒绝策略
* 如果用户的访问来自具有 `root_run_metadata` 条件的允许策略，请检查 root 运行是否具有元数据键和准确的值，包括大小写
* 条件仅匹配根运行上的顶级键，而不匹配子运行上的元数据

**主题、分享或实验比较返回 `403 Forbidden`？**

* 这些表面在用户适用 `root_run_metadata` 条件的任何项目中均不可用。完整列表请参考[Responses under metadata conditions](#responses-under-metadata-conditions)

**政策未生效？**

* 确认策略已附加到正确的角色
* 验证用户在工作区中具有该角色
* 检查`resource_type`和`permission`是否与正在访问的资源匹配

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/abac.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。