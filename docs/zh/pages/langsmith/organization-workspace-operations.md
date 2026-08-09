<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Organization and workspace operations reference | https://docs.langchain.com/langsmith/organization-workspace-operations -->

# 组织和工作区操作参考

本页面提供了 [workspace](/langsmith/administration-overview#workspaces) 和 [organization](/langsmith/administration-overview#organizations) 操作以及哪些角色可以执行这些操作的综合参考表。

该列表包括 LangSmith 中的 API 操作以及：

* 哪些系统角色可以执行每个操作。
* 所需的特定权限字符串。
* 有关部分访问或特殊情况的注释。

<Info>
  有关 LangSmith 的 RBAC 系统、角色定义和权限概念的概述，请参阅[Role-based access control](/langsmith/rbac)。
</Info>

## 内容|组织级运营|工作区级操作 || ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **核心管理：**<br />• [Organization settings](#organization-settings)：组织信息和配置<br />• [Workspaces](#workspaces)：工作空间管理<br />• [Organization members](#organization-members)：成员管理<br />• [Roles and permissions](#roles-and-permissions)：自定义角色 | **核心资源：**<br />• [Projects](#projects)：组织跟踪和运行<br />• [Runs](#runs)：单独的执行跟踪<br />• [Datasets](#datasets)：用于评估的测试数据集<br />• [Examples](#examples)：单独的数据集示例<br />• [Experiments](#experiments)：比较实验|| **安全和身份验证：**<br />• [SSO and authentication](#sso-and-authentication)：单点登录设置<br />• [SCIM](#scim)：身份配置<br />• [Access policies](#access-policies)：基于属性的访问控制| **监控和分析：**<br />• [Rules](#rules)：自动运行规则<br />• [Alerts](#alerts)：监控警报规则<br />• [Feedback](#feedback)：输出的分数和标签<br />• [Annotation Queues](#annotation-queues)：人工审核队列<br />• [Charts](#charts)：自定义可视化|
| **计费和帐户：**<br />• [Billing and payments](#billing-and-payments)：订阅管理<br />• [API keys](#api-keys)：组织级别密钥 | **开发与配置：**<br />• [Prompts](#prompts)：提示模板（LangChain Hub）<br />• [Deployments](#deployments)：部署配置<br />• [MCP Servers](#mcp-servers)：模型上下文协议服务器<br />• [Fleet](#fleet)：车队管理操作 || **分析：**<br />• [Charts and dashboards](#organization-charts-and-dashboards)：组织级别可视化<br />• [Usage and analytics](#usage-and-analytics)：使用情况跟踪和 TTL 设置 | **工作区管理：**<br />• [Workspace settings](#workspace-settings-and-management)：成员、设置<br />• [Tags](#tags)：元数据标记系统<br />• [Bulk Exports](#bulk-exports)：数据导出操作|

**附加信息：**

* [User-level operations](#user-level-operations)：所有认证用户的操作
* [Permission inheritance](#permission-inheritance)：角色如何跨组织/工作空间继承

## 传说

* ✓ **允许**：具有此角色的用户可以执行此操作
* ✗ **不允许**：具有此角色的用户无法执行此操作
* ⚠ **部分**：用户具有有限的访问权限（请参阅注释）

## 组织级运营

<Info>
  组织级操作由组织角色控制，与 RBAC 功能分开。在 [Role-based access control](/langsmith/rbac#organization-roles) 指南中了解更多信息。
</Info>

### 组织设置|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| ------------------------ | | :-----: | :----------: | :------: | :--------: | -------------------- |
|查看组织信息 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|查看组织仪表板 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|更新组织信息 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|查看账单信息 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|查看公司信息 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|设置公司信息 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |

### 工作区

组织级工作区管理操作。

|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| ------------------- | :-----: | :----------: | :------: | :--------: | -------------------- |
|列出所有工作区 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|创建工作区 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |### 组织成员

|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |笔记|
| ------------------------------------------- | :-----: | :----------: | :------: | :--------: | -------------------- | ------------------------------------------------------ |
|查看组织成员 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |                                                        |
|查看活跃的组织成员 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |                                                        |
|查看待定的组织成员 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |                                                        |
|邀请成员加入组织 |     ✓ |       ⚠ |     ✗ |      ✗ | `organization:manage` |组织操作员只能邀请组织用户和组织查看者 |
|邀请会员（批量）|     ✓ |       ⚠ |     ✗ |      ✗ | `organization:manage` |组织操作员只能邀请组织用户和组织查看者 ||添加基本​​授权成员 |     ✓ |       ⚠ |     ✗ |      ✗ | `organization:manage` |组织操作员只能添加组织用户和组织查看者 |
|删除组织成员 |     ✓ |       ⚠ |     ✗ |      ✗ | `organization:manage` |组织操作员无法删除组织管理员 |
|更新组织成员角色 |     ✓ |       ⚠ |     ✗ |      ✗ | `organization:manage` |组织操作员只能修改组织用户和组织查看者 |
|删除待定的组织成员 |     ✓ |       ⚠ |     ✗ |      ✗ | `organization:manage` |组织操作员无法删除待处理的组织管理员邀请 |

### 角色和权限|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| -------------------------- | :-----: | :----------: | :------: | :--------: | -------------------- |
|列出组织角色 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|列出可用权限 |     ✓ |       ✓ |     ✓ |      ✓ |不适用（用户级）|
|创建自定义角色 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|更新自定义角色 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|删除自定义角色 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |

### SSO 和身份验证|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| ---------------------------- | :-----: | :----------: | :------: | :--------: | -------------------- |
|查看 SSO 设置 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|创建 SSO 设置 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|更新 SSO 设置 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|删除 SSO 设置 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|查看登录方式 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|更新允许的登录方式 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|设置默认 SSO 规定 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |

### SCIM

用于用户配置的跨域身份管理系统。有关设置说明，请参阅[SCIM setup guide](/langsmith/user-management#set-up-scim-for-your-organization)。|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| ----------------- | :-----: | :----------: | :------: | :--------: | -------------------- |
|列出 SCIM 代币 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|获取 SCIM 代币 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|创建 SCIM 令牌 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|更新 SCIM 令牌 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|删除 SCIM 令牌 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |

### 访问策略

基于属性的访问控制 (ABAC) 策略，实现细粒度的权限。|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| ---------------------------- | :-----: | :----------: | :------: | :--------: | -------------------- |
|列出访问策略 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|获取访问策略 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|创建访问策略 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|删除访问策略|     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|将访问策略附加到角色 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |

### 账单和付款|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| ------------------------------------------ | :-----: | :----------: | :------: | :--------: | -------------------- |
|创建 Stripe 设置意图 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|处理付款方式创建 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|更改付款计划 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|创建 Stripe 结账会话 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|确认结账完成 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|创建 Stripe 帐户链接 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |

### API 密钥|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| -------------------------------------------------- | :-----: | :----------: | :------: | :--------: | -------------------------------------------------- |
|列出组织范围的服务键 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|创建组织范围的服务密钥（工作空间范围）\* |     ✓ |       ✓ |     ⚠ |      ✗ | `organization:pats:create` |
|创建组织范围的服务密钥（组织范围）\* |     ✓ |       ✗ |     ✗ |      ✗ | `organization:pats:create` + `organization:manage` |
|更新服务关键角色 |     ✓ |       ✗ |     ✗ |      ✗ | `organization:manage` |
|列出个人访问令牌 (PAT) |     ✓ |       ✓ |     ✓ |      ✗ | `organization:read` |
|创建个人访问令牌 (PAT) |     ✓ |       ✓ |     ✓ |      ✗ | `organization:pats:create` ||删除个人访问令牌 (PAT) |     ✓ |       ✓ |     ✓ |      ✗ | `organization:read` |

<Note>
  \* 组织操作员和组织用户只能为他们作为工作区管理员的工作区创建工作区范围的服务密钥。组织范围的服务密钥需要组织管理员角色。
</Note>

### 组织结构图和仪表板

|运营|组织管理员 |组织运营商|组织用户 |组织查看器 |所需权限 |
| ------------------------ | :-----: | :----------: | :------: | :--------: | -------------------- |
|列出组织结构图 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|按 ID 获取组织结构图 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|创建组织结构图 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|更新组织结构图 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|删除组织结构图 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|渲染组织结构图 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` ||获取组织结构图部分 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |
|创建组织结构图部分 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|更新组织结构图部分 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|删除组织结构图部分 |     ✓ |       ✓ |     ✗ |      ✗ | `organization:manage` |
|渲染组织结构图部分 |     ✓ |       ✓ |     ✓ |      ✓ | `organization:read` |

### 使用和分析

|运营|组织管理员 |组织运营商|组织用户 |      组织查看器 |所需权限 |
| -------------------------------------------------------------------------------- | :-----: | :----------: | :------: | :-----------------: | -------------------- |
|查看组织使用情况 |     ✓ |       ✓ |     ✓ |          ✓ | `organization:read` |
| [View granular billable usage](/langsmith/granular-usage) |     ✓ |       ✓ |     ✓ | `organization:read` |                       |
| [Export granular usage as CSV](/langsmith/granular-usage#csv-export) |     ✓ |       ✓ |     ✓ | `organization:read` |                       ||查看工作区跟踪保留设置 |     ✓ |       ✓ |     ✓ |          ✓ | `organization:read` |
|设置工作区默认跟踪层（基本/扩展）|     ✓ |       ✓ |     ✗ |          ✗ | `organization:manage` |
|设置工作区延长保留期限（企业） |     ✓ |       ✓ |     ✗ |          ✗ | `organization:manage` |

## 工作区级别的操作

这些操作由[workspace-level roles and permissions](/langsmith/rbac#workspace-roles)控制。

<Tip>
  要了解每个角色的含义及其总体能力，请参阅[Role-based access control](/langsmith/rbac)指南。
</Tip>

### 项目

项目从您的 LLM 申请中组织跟踪和运行。|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| -------------------------------------------------- | :-------------: | :--------------: | :--------------: | -------------------------------- |
|创建一个新项目 |        ✓ |         ✗ |         ✗ | `projects:create` |
|在项目创建中应用资源标签 |        ✓ |         ✗ |         ✗ | `projects:tag_on_create` |
|查看项目列表 |        ✓ |         ✓ |         ✓ | `projects:read` |
|查看项目详情 |        ✓ |         ✓ |         ✓ | `projects:read` |
|查看预建仪表板 |        ✓ |         ✓ |         ✓ | `projects:read` |
|查看项目元数据（前 K 个值） |        ✓ |         ✓ |         ✓ | `projects:read` ||更新项目元数据（名称、描述、标签）|        ✓ |         ✓ |         ✗ | `projects:update` |
|增加项目跟踪保留（基础→扩展）|        ✓ |         ✓ |         ✗ | `projects:increase-trace-tier`\* |
|减少项目痕迹保留（扩展 → 基础）|        ✓ |         ✓ |         ✗ | `projects:decrease-trace-tier`\* |
|创建过滤视图 |        ✓ |         ✗ |         ✗ | `projects:create` |
|查看筛选视图 |        ✓ |         ✓ |         ✓ | `projects:read` |
|查看特定过滤器视图 |        ✓ |         ✓ |         ✓ | `projects:read` |
|更新过滤器视图 |        ✓ |         ✓ |         ✗ | `projects:update` |
|删除筛选视图 |        ✓ |         ✗ |         ✗ | `projects:delete` |
|删除项目 |        ✓ |         ✗ |         ✗ | `projects:delete` ||删除多个项目 |        ✓ |         ✗ |         ✗ | `projects:delete` |
|获取洞察职位 |        ✓ |         ✓ |         ✓ | `projects:read` |
|获得具体的工作见解 |        ✓ |         ✓ |         ✓ | `projects:read` |
|创建洞察工作 |        ✓ |         ✓ |         ✓ | `projects:read` + `rules:create` |
|更新洞察工作 |        ✓ |         ✓ |         ✗ | `projects:update` |
|删除见解作业 |        ✓ |         ✗ |         ✗ | `projects:delete` |
|获取作业配置见解 |        ✓ |         ✓ |         ✓ | `rules:read` |
|创建见解作业配置 |        ✓ |         ✓ |         ✗ | `rules:create` ||自动生成见解作业配置 |        ✓ |         ✓ |         ✗ | `rules:create` |
|更新见解作业配置 |        ✓ |         ✓ |         ✗ | `rules:update` |
|删除见解作业配置 |        ✓ |         ✓ |         ✗ | `rules:delete` |
|从见解作业中获取运行集群 |        ✓ |         ✓ |         ✓ | `projects:read` |
|从见解作业获取运行 |        ✓ |         ✓ |         ✓ | `projects:read` |

<Note>
  \* `projects:increase-trace-tier` 和 `projects:decrease-trace-tier` 是独立的，可以在自定义角色中单独授予。例如，您可以允许角色减少保留率，但不允许其增加保留率。如果用户缺乏这两种权限，则保留设置 UI 将完全隐藏。如果只有一个，则 UI 部分启用（禁止的方向被禁用）。
</Note>

### 运行

单独的执行跟踪和跨度来自您的 LLM 申请。|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ---------------------------------------------------------------------------------- | :-------------: | :--------------: | :--------------: | ------------------- |
|从 SDK 发送跟踪（包括单次运行、批量、多部分和 OTEL）|        ✓ |         ✓ |         ✗ | `runs:create` |
|查看特定运行 |        ✓ |         ✓ |         ✓ | `runs:read` |
|查看线程预览 |        ✓ |         ✓ |         ✓ | `runs:read` |
|查询/列表运行 |        ✓ |         ✓ |         ✓ | `runs:read` |
|查看运行统计信息 |        ✓ |         ✓ |         ✓ | `runs:read` |
|查看分组运行统计信息 |        ✓ |         ✓ |         ✓ | `runs:read` ||按表达式 | 分组运行        ✓ |         ✓ |         ✓ | `runs:read` |
|从自然语言生成过滤查询 |        ✓ |         ✓ |         ✓ | `runs:read` |
|预取运行 |        ✓ |         ✓ |         ✓ | `runs:read` |
|更新运行（补丁）|        ✓ |         ✓ |         ✗ | `runs:create` |
|查看运行共享状态 |        ✓ |         ✓ |         ✓ | `runs:read` |
|公开分享跑步 |        ✓ |         ✓ |         ✗ | `runs:share` |
|取消分享跑步 |        ✓ |         ✓ |         ✗ | `runs:share` |
|按跟踪 ID 或元数据删除运行 |        ✓ |         ✗ |         ✗ | `runs:delete` |

### 规则根据运行条件触发操作的自动运行规则。

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ----------------------------------- | :-------------: | :--------------: | :--------------: | ------------------------ | |
|列出所有运行规则 |        ✓ |         ✓ |         ✓ | `rules:read` |
|创建运行规则 |        ✓ |         ✓ |         ✗ | `rules:create` |
|更新运行规则 |        ✓ |         ✓ |         ✗ | `rules:update` |
|删除运行规则 |        ✓ |         ✓ |         ✗ | `rules:delete` |
|查看规则日志 |        ✓ |         ✓ |         ✓ | `rules:read` |
|获取最后应用的规则 |        ✓ |         ✓ |         ✓ | `rules:read` |
|手动触发规则 |        ✓ |         ✓ |         ✗ | `rules:update` ||触发多个规则 |        ✓ |         ✓ |         ✗ | `rules:update` |
|配置每个操作的数据保留 |        ✓ |         ✗ |         ✗ | `rules:configure-retention` |

### 警报

用于监控运行条件的警报规则。

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ----------------- | :-------------: | :--------------: | :--------------: | ------------------- |
|创建警报规则 |        ✓ |         ✓ |         ✓ | `runs:read` |
|更新警报规则 |        ✓ |         ✓ |         ✓ | `runs:read` |
|删除警报规则 |        ✓ |         ✓ |         ✓ | `runs:read` |
|获取报警规则 |        ✓ |         ✓ |         ✓ | `runs:read` |
|列出警报规则 |        ✓ |         ✓ |         ✓ | `runs:read` |
|测试警报动作 |        ✓ |         ✓ |         ✓ | `runs:read` |

### 数据集

使用评估示例测试数据集。|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| -------------------------------------------------------- | :-------------: | :--------------: | :--------------: | ---------------------------------------------------------------- |
|创建数据集 |        ✓ |         ✓ |         ✗ | `datasets:create` |
|在数据集创建中应用资源标签 |        ✓ |         ✓ |         ✗ | `datasets:tag_on_create` |
|列出数据集 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|查看数据集详细信息 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|更新数据集元数据 |        ✓ |         ✓ |         ✗ | `datasets:update` ||删除数据集 |        ✓ |         ✗ |         ✗ | `datasets:delete` |
|上传 CSV 数据集 |        ✓ |         ✓ |         ✗ | `datasets:create` |
|克隆数据集 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|获取数据集版本 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|获取数据集版本 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|差异数据集版本 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|更新数据集版本（标签）|        ✓ |         ✓ |         ✗ | `datasets:update` |
|下载数据集（OpenAI 格式）|        ✓ |         ✓ |         ✓ | `datasets:download` ||下载数据集（OpenAI微调格式）|        ✓ |         ✓ |         ✓ | `datasets:download` |
|下载数据集 (CSV) |        ✓ |         ✓ |         ✓ | `datasets:download` |
|下载数据集 (JSONL) |        ✓ |         ✓ |         ✓ | `datasets:download` |
|查看数据集共享状态 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|公开分享数据集 |        ✓ |         ✗ |         ✗ | `datasets:share` |
|取消共享数据集 |        ✓ |         ✗ |         ✗ | `datasets:share` |
|获取索引信息 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|索引数据集 |        ✓ |         ✓ |         ✗ | `datasets:update` ||同步数据集索引 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|删除数据集索引 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|搜索数据集 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|生成综合示例 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|获取数据集分割 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|更新数据集分割 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|运行游乐场实验（批量）|        ✓ |         ⚠ |         ✗ | `prompts:read` + `datasets:read` + `projects:create` |
|运行游乐场实验（流）|        ✓ |         ⚠ |         ✗ | `prompts:read` + `datasets:read` + `projects:create` ||运行工作室实验 |        ✓ |         ⚠ |         ✗ | `datasets:read` + `projects:create` |

<Note>
  工作区编辑者具有部分访问权限，因为他们无法创建项目，这限制了他们创建新实验的能力。
</Note>

### 示例

数据集中的单个示例。

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ------------------------------------------- | :-------------: | :--------------: | :--------------: | ------------------- |
|数个例子 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|查看具体示例|        ✓ |         ✓ |         ✓ | `datasets:read` |
|列出示例 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|创建一个新示例 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|创建示例（批量）|        ✓ |         ✓ |         ✗ | `datasets:update` |
|更新单个示例 |        ✓ |         ✓ |         ✗ | `datasets:update` ||更新示例（批量）|        ✓ |         ✓ |         ✗ | `datasets:update` |
|更新示例（多部分）|        ✓ |         ✓ |         ✗ | `datasets:update` |
|从 CSV 上传示例 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|从 JSONL 上传示例 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|删除单个示例 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|删除示例（批量）|        ✓ |         ✓ |         ✗ | `datasets:update` |
|查看运行示例 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|查看带有运行的分组示例 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|验证单个示例 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|验证示例（批量）|        ✓ |         ✓ |         ✓ | `datasets:read` |

### 实验

评估法学硕士输出的比较实验。|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ------------------------------------------- | :-------------: | :--------------: | :--------------: | ------------------------------------------------------------------------------------ |
|查看对比实验|        ✓ |         ✓ |         ✓ | `projects:read` |
|创建对比实验 |        ✓ |         ⚠ |         ✗ | `projects:create` |
|删除对比实验|        ✓ |         ✗ |         ✗ | `projects:delete` |
|查看运行示例 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|查看带有运行的分组示例 |        ✓ |         ✓ |         ✓ | `datasets:read` ||查看分组实验 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|查看反馈增量 |        ✓ |         ✓ |         ✓ | `datasets:read` |
|上传实验结果 |        ✓ |         ⚠ |         ✗ | `datasets:create` + `datasets:update` + `projects:create` + `runs:create` |
|获取实验视图覆盖 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|创建实验视图覆盖 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|更新实验视图覆盖 |        ✓ |         ✓ |         ✗ | `datasets:update` |
|删除实验视图覆盖 |        ✓ |         ✓ |         ✗ | `datasets:update` |<Note>
  工作区编辑者具有部分访问权限，因为他们无法创建项目，这限制了他们创建新实验的能力。
</Note>

### 反馈

LLM 输出的分数、标签和更正。

<Note>反馈公式运算已弃用，取而代之的是[composite evaluators](/langsmith/composite-evaluators-ui)，并计划于 2026 年 8 月 20 日删除。</Note>

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| -------------------------------------------------------- | :-------------: | :--------------: | :--------------: | ------------------- |
|列出反馈公式（已弃用）|        ✓ |         ✓ |         ✓ | `feedback:read` |
|获取反馈公式（已弃用）|        ✓ |         ✓ |         ✓ | `feedback:read` |
|创建反馈公式（已弃用） |        ✓ |         ✓ |         ✗ | `feedback:create` |
|更新反馈公式（已弃用）|        ✓ |         ✓ |         ✗ | `feedback:update` |
|删除反馈公式（已弃用）|        ✓ |         ✓ |         ✗ | `feedback:delete` ||查看具体反馈 |        ✓ |         ✓ |         ✓ | `feedback:read` |
|列出反馈 |        ✓ |         ✓ |         ✓ | `feedback:read` |
|创建反馈 |        ✓ |         ✓ |         ✗ | `feedback:create` |
|积极创建反馈 |        ✓ |         ✓ |         ✗ | `feedback:create` |
|更新反馈 |        ✓ |         ✓ |         ✗ | `feedback:update` |
|删除反馈 |        ✓ |         ✓ |         ✗ | `feedback:delete` |
|批量摄取反馈|        ✓ |         ✓ |         ✗ | `feedback:create` |
|创建反馈摄取令牌 |        ✓ |         ✓ |         ✗ | `feedback:create` |
|列出反馈摄取令牌 |        ✓ |         ✓ |         ✗ | `feedback:create` |
|使用令牌创建反馈（无需身份验证）|        ✓ |         ✓ |         ✓ |不适用（基于代币）||列出反馈配置 |        ✓ |         ✓ |         ✓ | `feedback:read` |
|创建反馈配置 |        ✓ |         ✓ |         ✗ | `feedback:create` |
|更新反馈配置 |        ✓ |         ✓ |         ✗ | `feedback:update` |

### 注释队列

LLM 输出的人工审核队列。

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ------------------------------------------- | :-------------: | :--------------: | :--------------: | -------------------------- |
|列出注释队列 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|获取注释队列 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|创建注释队列 |        ✓ |         ✓ |         ✗ | `annotation-queues:create` |
|更新注释队列 |        ✓ |         ✓ |         ✗ | `annotation-queues:update` ||删除注释队列|        ✓ |         ✗ |         ✗ | `annotation-queues:delete` |
|填充注释队列 |        ✓ |         ✓ |         ✗ | `annotation-queues:update` |
|从队列中获取运行 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|从队列中获取运行（按索引）|        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|获取运行队列 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|获取队列总大小 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|获取已归档队列总数 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|获取队列大小 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |
|将运行添加到队列 |        ✓ |         ✓ |         ✗ | `annotation-queues:update` |
|更新在队列中运行 |        ✓ |         ✓ |         ✗ | `annotation-queues:update` ||从队列中删除运行 |        ✓ |         ✓ |         ✗ | `annotation-queues:update` |
|从队列中删除运行（批量）|        ✓ |         ✓ |         ✗ | `annotation-queues:update` |
|创建身份标注队列运行状态|        ✓ |         ✓ |         ✗ | `annotation-queues:update` |
|导出存档的运行 |        ✓ |         ✓ |         ✓ | `annotation-queues:read` |

### 提示

LangChain Hub中的提示模板和链。|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| -------------------------------------- | :-------------: | :--------------: | :--------------: | ----------------------- |
|列出提示存储库 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|查看提示存储库 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|创建提示存储库 |        ✓ |         ✓ |         ✗ | `prompts:create` |
|在提示创建时应用资源标签 |        ✓ |         ✓ |         ✗ | `prompts:tag_on_create` |
| Fork 提示存储库 |        ✓ |         ✓ |         ✗ | `prompts:create` |
|更新提示存储库 |        ✓ |         ✓ |         ✗ | `prompts:update` |
|删除提示存储库 |        ✓ |         ✓ |         ✗ | `prompts:delete` |
|列出提交 |        ✓ |         ✓ |         ✓ | `prompts:read` ||查看提交 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|推送提交 |        ✓ |         ✓ |         ✗ | `prompts:update` |
|列出存储库标签 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|获取所有标签 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|创建标签 |        ✓ |         ✓ |         ✗ | `prompts:tag` |
|更新标签 |        ✓ |         ✓ |         ✗ | `prompts:tag` |
|删除标签 |        ✓ |         ✓ |         ✗ | `prompts:tag` |
|查看活动 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|列出评论 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|创建评论 |        ✓ |         ✓ |         ✗ | `prompts:read` ||删除评论 |        ✓ |         ✓ |         ✗ | `prompts:read` |
|切换类似 |        ✓ |         ✓ |         ✗ | `prompts:read` |
|优化提示 |        ✓ |         ✓ |         ✗ | `prompts:update` |
|列出优化工作 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|创建优化作业 |        ✓ |         ✓ |         ✗ | `prompts:create` |
|更新优化作业 |        ✓ |         ✓ |         ✗ | `prompts:update` |
|删除优化作业 |        ✓ |         ✓ |         ✗ | `prompts:delete` |
|调用提示画布 |        ✓ |         ✓ |         ✗ | `prompts:update` |
|列出快速行动 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|创建快速行动 |        ✓ |         ✓ |         ✓ | `prompts:read` ||删除快速行动 |        ✓ |         ✓ |         ✓ | `prompts:read` |
|更新快动作|        ✓ |         ✓ |         ✓ | `prompts:read` |

<Note>
  某些提示操作支持共享提示的公共访问。
</Note>

### 图表

自定义可视化和仪表板。

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ----------------------- | :-------------: | :--------------: | :--------------: | ------------------- |
|列表图表 |        ✓ |         ✓ |         ✓ | `charts:read` |
|通过 ID 获取图表 |        ✓ |         ✓ |         ✓ | `charts:read` |
|创建图表 |        ✓ |         ✓ |         ✗ | `charts:create` |
|更新图表 |        ✓ |         ✓ |         ✗ | `charts:update` |
|删除图表 |        ✓ |         ✓ |         ✗ | `charts:delete` |
|渲染图表 |        ✓ |         ✓ |         ✓ | `charts:read` ||列出图表部分 |        ✓ |         ✓ |         ✓ | `charts:read` |
|按 ID 获取图表部分 |        ✓ |         ✓ |         ✓ | `charts:read` |
|创建图表部分 |        ✓ |         ✓ |         ✗ | `charts:create` |
|更新图表部分 |        ✓ |         ✓ |         ✗ | `charts:update` |
|删除图表部分 |        ✓ |         ✓ |         ✗ | `charts:delete` |
|渲染图表部分 |        ✓ |         ✓ |         ✓ | `charts:read` |

### 部署

[LangSmith Deployment](/langsmith/deployment) 配置。

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ----------------- | :-------------: | :--------------: | :--------------: | -------------------- |
|创建部署 |        ✓ |         ✓ |         ✗ | `deployments:create` |
|查看部署 |        ✓ |         ✓ |         ✓ | `deployments:read` |
|更新部署 |        ✓ |         ✓ |         ✗ | `deployments:update` |
|删除部署 |        ✓ |         ✗ |         ✗ | `deployments:delete` |### 工作区设置和管理

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| -------------------------------------------------------------------- | :-------------: | :--------------: | :--------------: | ------------------------ | |
|查看工作区信息 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|查看工作区统计信息 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|更新工作区（名称、描述）|        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|删除工作区 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|查看工作区成员 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|查看活动工作区成员 |        ✓ |         ✓ |         ✓ | `workspaces:read` ||查看待处理的工作区成员 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|将成员添加到工作区 |        ✓ |         ✗ |         ✗ | `workspaces:manage-members` |
|添加会员（批量）|        ✓ |         ✗ |         ✗ | `workspaces:manage-members` |
|更新工作区成员角色 |        ✓ |         ✗ |         ✗ | `workspaces:manage-members` |
|删除工作区成员 |        ✓ |         ✗ |         ✗ | `workspaces:manage-members` |
|删除待处理的工作区成员 |        ✓ |         ✗ |         ✗ | `workspaces:manage-members` |
|查看工作区跟踪保留设置 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|更新工作区延长保留期限（企业）|        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|查看使用限制 |        ✓ |         ✓ |         ✓ | `workspaces:read` ||查看共享实体 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|批量取消共享实体 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |

### 标签

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ------------------------------------------- | :-------------: | :--------------: | :--------------: | ------------------- |
|列表标签键 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|获取标签密钥 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|创建标签键 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|更新标签键 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|删除标签键 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|列出标签值 |        ✓ |         ✓ |         ✓ | `workspaces:read` ||获取标签值 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|创建标签值 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|更新标签值 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|删除标签值|        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|列表标签 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|列出资源标签 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|列出资源标签（批量）|        ✓ |         ✓ |         ✓ | `workspaces:read` |
|列表标签 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|创建标签 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |
|删除标签 |        ✓ |         ✗ |         ✗ | `workspaces:manage` |

### 批量导出|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ------------------------------------------ | :-------------: | :--------------: | :--------------: | -------------------- |
|批量出口清单|        ✓ |         ✓ |         ✓ | `bulk-exports:read` |
|获取批量导出 |        ✓ |         ✓ |         ✓ | `bulk-exports:read` |
|获取批量导出运行 |        ✓ |         ✓ |         ✓ | `bulk-exports:read` |
|获取批量导出运行 |        ✓ |         ✓ |         ✓ | `bulk-exports:read` |
|创建批量导出|        ✓ |         ✗ |         ✗ | `bulk-exports:manage` |
|取消批量导出 |        ✓ |         ✗ |         ✗ | `bulk-exports:manage` |
|获取批量出口目的地 |        ✓ |         ✓ |         ✓ | `bulk-exports:read` |
|获取批量出口目的地 |        ✓ |         ✓ |         ✓ | `bulk-exports:read` |
|创建批量导出目的地 |        ✓ |         ✗ |         ✗ | `bulk-exports:manage` ||更新批量导出目的地 |        ✓ |         ✗ |         ✗ | `bulk-exports:manage` |
|获取过滤的导出运行 |        ✓ |         ✓ |         ✓ | `bulk-exports:read` |

<Tip>
  `bulk-exports:read` 和 `bulk-exports:manage` 是专用权限，允许您通过 [custom role](/langsmith/rbac#custom-roles) 授予导出访问权限，而无需授予更广泛的 `workspaces:manage` 范围。这对于需要导出跟踪但不能管理工作区、成员或机密的安全团队服务密钥非常有用。
</Tip>

### MCP 服务器

用于扩展功能的模型上下文协议服务器。|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| ----------------- | :-------------: | :--------------: | :--------------: | ------------------- |
|列出 MCP 服务器 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|获取 MCP 服务器 |        ✓ |         ✓ |         ✓ | `workspaces:read` |
|创建MCP服务器|        ✓ |         ✓ |         ✓ | `workspaces:read` |
|更新MCP服务器|        ✓ |         ✓ |         ✓ | `workspaces:read` |
|删除 MCP 服务器 |        ✓ |         ✓ |         ✓ | `workspaces:read` |

### 舰队

[Fleet](/langsmith/fleet/index) 工作区管理操作。

|运营|工作区管理员 |工作区编辑器 |工作区查看器 |所需权限 |
| --------------------------------------- | :-------------: | :--------------: | :--------------: | -------------------------- |
|查看车队管理部分（使用情况、支出）|        ✓ |         ✗ |         ✗ | `fleet:read-admin-config` |
|管理车队支出限额 |        ✓ |         ✗ |         ✗ | `fleet:write-admin-config` |## 用户级操作

这些操作可供所有经过身份验证的用户使用，不需要特定的工作区或组织权限：

* 查看自己的用户资料
* 更新自己的用户资料
* 列出用户的组织
* 创建新组织
* 列出待处理的工作区邀请
* 删除待处理的工作区邀请
* 领取待处理的工作区邀请
* 列出待处理的组织邀请
* 删除待处理的组织邀请
* 领取待定组织邀请

## 权限继承

### 组织到工作区

* [Organization Admin](/langsmith/rbac#organization-admin) 自动拥有所有工作区的完全权限。
* [Organization Operator](/langsmith/rbac#organization-operator) 仅在显式添加到具有工作区级别角色的工作区（或他们创建的工作区）时才获得工作区访问权限。
* [Organization User](/langsmith/rbac#organization-user) 和 [Organization Viewer](/langsmith/rbac#organization-viewer) 仅在显式添加到具有工作区级别角色的工作区时才获得工作区访问权限。

详细的角色定义请参考[Organization roles](/langsmith/rbac#organization-roles)和[Workspace roles](/langsmith/rbac#workspace-roles)。

### 工作区角色独立性

* 用户在不同的工作空间中可以拥有不同的工作空间角色。
* 用户可能在一个工作空间中是 [Workspace Admin](/langsmith/rbac#workspace-admin)，在另一个工作空间中是 [Workspace Viewer](/langsmith/rbac#workspace-viewer)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/organization-workspace-operations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>