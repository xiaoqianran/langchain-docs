<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Attribute-based access control | https://docs.langchain.com/langsmith/abac -->

# 基于属性的访问控制

本参考文献介绍了 LangSmith 的基于属性的访问控制 (ABAC) 系统，该系统支持基于资源属性的细粒度访问控制，是对 [RBAC](/langsmith/rbac) 的补充。有关自动将用户配置为角色的信息，请参阅[SCIM](/langsmith/user-management#set-up-scim-for-your-organization)。

<Note>
  ABAC（基于属性的访问控制）是一项用于管理细粒度访问控制的企业功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。其他计划默认为所有用户使用管理员角色。
</Note>

ABAC 通过添加基于标签的条件来访问决策来补充[Role-Based Access Control (RBAC)](/langsmith/rbac)。 RBAC 根据用户角色授予一揽子权限（例如，“可以读取所有项目”），而 ABAC 允许您根据资源标签限制或授予访问权限（例如，“只能读取带有环境 = 开发标签的项目”）。

<Note>
  角色和资源标签可以通过 UI 或 API 进行管理。 ABAC 策略可通过 [API](https://api.smith.langchain.com/docs#/access_policies) 配置。配置完成后，策略将在 API 和 UI 中自动实施。
</Note>

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

     <Note>
       该环境变量对个人组织没有影响，因为个人组织未启用[RBAC](/langsmith/rbac)。
     </Note>

2. 设置身份验证。要通过 API 管理访问策略，您需要来自 [Organization Admin](/langsmith/rbac#organization-admin) 用户的个人访问令牌 (PAT)，或具有组织管理员权限的组织范围的服务密钥。在运行任何脚本之前设置以下环境变量：

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

###效果

`effect` 确定条件匹配时会发生什么：* **`allow`** - 条件匹配时授予访问权限
* **`deny`** - 条件匹配时阻止访问

<Note>
  拒绝策略始终优先。如果允许和拒绝策略均匹配，则访问将被拒绝。
</Note>

### 条件组

`condition_groups` 数组包含一个或多个条件组。使用 **OR 逻辑** 评估多个条件组 - 如果任何组匹配，则应用策略。

每个条件组指定：

* **`permission`** - 该组适用的权限
* **`resource_type`** - 要匹配的资源类型
* **`conditions`** - 条件数组（在组内使用 **AND 逻辑** 进行评估）

#### 资源类型和权限|资源类型|支持的权限 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project` | `projects:read`、`projects:update`、`projects:delete`、`runs:read`、`runs:share`、`runs:delete`、`projects:increase-trace-tier`、`projects:decrease-trace-tier` |
| `prompt` | `prompts:read`、`prompts:update`、`prompts:delete`、`prompts:share`、`prompts:tag` |
| `dataset` | `datasets:read`、`datasets:update`、`datasets:delete`、`datasets:share`、`datasets:download` |
| `deployment` | `deployments:read`、`deployments:update`、`deployments:delete` |
| `queues` | `annotation-queues:create`、`annotation-queues:delete`、`annotation-queues:read`、`annotation-queues:update` |
| `mcp_server` | `mcp-servers:read`、`mcp-servers:invoke`、`mcp-servers:update`、`mcp-servers:delete`。参见[Fleet tool access control](/langsmith/fleet/access-and-oversight#tool-access-control)。 || `fleet_integration` | `mcp-servers:read`，`mcp-servers:invoke`。参见[Fleet tool access control](/langsmith/fleet/access-and-oversight#tool-access-control)。                                             |

<Note>
  运行没有自己的标签。运行权限（`runs:read`、`runs:create`、`runs:share`、`runs:delete`）根据父项目的标签进行评估。
</Note>

#### 条件

`conditions` 数组中的每个条件指定：

* **`attribute_name`** - 目前仅支持`resource_tag_key`
* **`attribute_key`** - 要匹配的标签键（例如，`Environment`、`Team`）
* **`operator`** - 比较运算符
* **`attribute_value`** - 要比较的值

##### 运算符

|操作员|描述 |
| ------------------------ | ------------------------------------------------ |
| `equals` |精确匹配（区分大小写）|
| `not_equals` |值不同（区分大小写）|
| `equals_ignore_case` |精确匹配（不区分大小写）|
| `not_equals_ignore_case` |值不同（不区分大小写）|
| `matches` |与 `*` 和 `?` 通配符匹配的 Glob 模式 |
| `not_matches` |当值与全局模式不匹配时匹配 |

##### `_if_exists` 变体每个运算符都有一个 `_if_exists` 变体，当标签键不存在时默认匹配，或者当标签存在时正常评估条件：

|操作员|描述 |
| ---------------------------------- | ------------------------------------------------------------------ |
| `equals_if_exists` |完全匹配（区分大小写），或者如果标签键不存在 |
| `not_equals_if_exists` |值不同（区分大小写），或者标签键不存在 |
| `equals_ignore_case_if_exists` |完全匹配（不区分大小写），或者如果标签键不存在 |
| `not_equals_ignore_case_if_exists` |值不同（不区分大小写），或者如果标签键不存在 |
| `matches_if_exists` |全局模式匹配，或者如果标签键不存在 |
| `not_matches_if_exists` |当值与全局模式不匹配或标签键不存在时匹配 |

<Tip>
  在 **允许** 策略中，`_if_exists` 变体授予对匹配条件或不具有指定标签键的资源的访问权限。在“拒绝”策略中，它们会阻止匹配条件或没有标签键的资源。
</Tip>

### 角色`role_ids` 数组指定策略适用于哪些工作区角色。当具有该角色的用户访问资源时，将评估策略条件。

可以在创建策略时将策略附加到角色，或者稍后通过 API 附加。

## 管理访问策略

访问策略由 [Organization Admins](/langsmith/rbac#organization-admin) 通过 LangSmith API 进行管理。在创建策略之前，请在您的工作区中[set up resource tags](/langsmith/set-up-resource-tags)。

## ABAC 如何与 RBAC 配合使用

在确定对资源的访问权限时，会同时考虑[RBAC](/langsmith/rbac) 权限和 ABAC 策略：

* ABAC **拒绝**策略覆盖 RBAC 权限
* ABAC **允许** 策略即使没有 RBAC 权限也可以授予访问权限
* 如果没有ABAC策略匹配，系统回退到RBAC

### 政策评估结果

**功能组合：**

|启用 RBAC | ABAC 已启用 |行为 |
| ------------ | ------------ | --------------------------------------------------- |
| ✗ | ✗ |所有工作区成员都具有管理员级别访问权限 |
| ✓ | ✗ |标准RBAC——基于角色权限的访问|
| ✓ | ✓ | RBAC + ABAC - 基于标签的细粒度访问控制 |**同时启用 RBAC 和 ABAC 时：**

| RBAC 许可 |允许策略匹配 |拒绝策略匹配 |结果 |
| ------------ | -------------------- | ------------------- | -------------------------------- |
| ✓ | ✓ | ✗ | **允许** |
| ✓ | ✗ | ✗ | **允许**（RBAC 后备）|
| ✓ | ✓ | ✓ | **被拒绝**（否认获胜）|
| ✓ | ✗ | ✓ | **被拒绝**（否认获胜）|
| ✗ | ✓ | ✗ | **允许**（ABAC 授予访问权限）|
| ✗ | ✗ | ✗ | **被拒绝** |
| ✗ | ✓ | ✓ | **被拒绝**（否认获胜）|

## 示例场景

### 1. 注释者团队分配

允许注释者仅访问为其团队标记的数据集：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "name": "Annotator Team A Access",
  "effect": "allow",
  "condition_groups": [{
    "permission": "datasets:read",
    "resource_type": "dataset",
    "conditions": [{
      "attribute_name": "resource_tag_key",
      "attribute_key": "Annotation-Team",
      "operator": "equals",
      "attribute_value": "Team-A"
    }]
  }]
}
```

### 2. 阻止敏感数据拒绝访问包含 PII 的数据集。由于拒绝策略会覆盖允许策略，因此即使具有 RBAC 权限的用户也会阻止访问：

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

### 3. 使用通配符进行基于应用程序的访问

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

### 4. 客户端和目的隔离（AND 逻辑）

仅当满足两个条件时才授予访问权限 - 数据集用于训练并且属于特定客户端：

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

## 在创建时标记资源

当 ABAC 策略处于活动状态时，资源将根据其标签进行访问控制。为了确保资源在创建后立即受到保护，您可以使用 `tag_value_ids` 参数直接在创建请求中提供标签。项目、数据集和提示创建端点（包括分叉和克隆操作）支持此功能。标签在与资源创建相同的数据库事务中以原子方式应用。

有关完整的详细信息和示例，请参阅资源标签指南中的[Tag a resource at creation time](/langsmith/set-up-resource-tags#tag-a-resource-at-creation-time)。

<Note>
  如果您在跟踪摄取期间依赖 LangSmith SDK 自动创建跟踪项目，则 `tag_value_ids` 参数在该自动创建路径上不可用。为了确保 ABAC 策略从一开始就适用，请在开始跟踪会话之前通过 `POST /api/v1/sessions` 使用所需的 `tag_value_ids` 预先创建项目。
</Note>

## 故障排除

**访问意外被拒绝？**

* 检查拒绝策略是否匹配（拒绝始终优先）
* 检查用户是否具有RBAC权限或匹配的允许策略
* 验证资源是否具有预期的标签和值
* 使用 `_if_exists` 运算符的拒绝策略会阻止缺少该标签键的资源
* 对于区分大小写的运算符（`equals`、`not_equals`），检查大小写不匹配
* 一组中有多个条件，所有条件都必须匹配（AND 逻辑）

**意外授予访问权限？*** 检查 RBAC 权限（用户可以通过其角色进行访问）
* 检查允许策略是否太宽泛（例如，使用通配符）
* `_if_exists` 运算符匹配缺少该标签键的资源

**政策未生效？**

* 确认策略已附加到正确的角色
* 验证用户在工作区中具有该角色
* 检查`resource_type`和`permission`是否与正在访问的资源匹配

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/abac.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>