<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Traces and access control | https://docs.langchain.com/langsmith/llm-gateway-access -->

# 跟踪和访问控制

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

通过 LLM 网关的每个调用都会被追踪到 LangSmith，并且策略违规会在 [LangSmith Engine](/langsmith/engine) 中出现以进行分类。

## 网关痕迹出现的位置

默认情况下，所有网关代理的调用都会跟踪到与调用方 API 密钥关联的 [workspace](/langsmith/administration-overview#workspaces) 中名为 `gateway` 的项目，以及具有方案 `gateway-<short_api_key>-<api_key_id>` 的 API 密钥特定项目。

使用 [RBAC](/langsmith/rbac) 和 [ABAC](/langsmith/abac) 控制对这些跟踪项目的访问

### 跟踪元数据

网关代理调用与直接 LLM 调用的区别在于它们所在的项目以及附加到其跨度的元数据：- **网关项目：** 所有网关流量都写入每个工作区中的中央网关项目，以及名为 `gateway` 的固定 LangSmith 项目，并在 `gateway-<short_api_key>-<api_key_id>` 处有每个 API 密钥副本，用于 UI 隔离。按项目（或按`langsmith.metadata.gateway.*` span 属性的存在）过滤以查找网关代理的调用。
- **策略评估结果：**每个网关跨度通过`langsmith.metadata.gateway.policy.matched_ids/_names`、`passed_ids/_names`和`violated_ids/_names`记录评估了哪些策略及其结果，因此传递和阻止都会被捕获。
- **防护规则匹配：** 当应用密文策略时，防护管道会发出一个 `rule_id → count` 映射，标记为 `policy.matched_rules`、`passed_rules` 和 `violated_rules`。这些是规则 ID，而不是 PII 或秘密类别标签。
- **成本数据：** 代币计数和成本是内联计算的，并提供给支出上限策略所针对的相同支出累加器。

### 跟踪内容和计费

当在网关数据保留策略中禁用**跟踪内容**时，不会存储请求和响应正文。网关仍然发出仅元数据跟踪，其中可以包括令牌使用情况、延迟、状态和模型信息。网关发出的仅元数据跟踪被排除在基于跟踪的计费之外。模型使用仍然有助于网关支出跟踪。## LangSmith 发动机集成

当治理策略触发时（例如达到支出限制、检测到并编辑 PII 或捕获秘密时），该事件将作为元数据记录在跟踪上。这些违反政策的行为在 LangSmith 引擎中表现为问题。

对于引擎问题，您可以：

1. **查看违规行为：** 触发了哪些政策，哪些内容被阻止或编辑。
1. **点击跟踪：** 准确查看策略触发时代理正在执行的操作。
1. **诊断根本原因：** 是否是重试循环消耗预算、用户将凭据粘贴到提示中或超出其上限的合法工作负载等。
1. **采取行动：**更新代理配置、调整策略或升级。

## 审计日志记录

网关记录两类事件：

|类别 |记录了什么 |
| ---| ---|
| **行政变更** |策略创建、修改和删除。与网关访问相关的角色和权限更改。 |
| **网关调用** |每个代理呼叫，包括呼叫者身份和匹配的策略 ID。 |

[Audit logs](/langsmith/audit-logs) 可供组织管理员在 [Enterprise plan](/langsmith/pricing-plans) 上使用。

## 权限

### 所需权限|行动|需要许可 |谁默认拥有它 |
| ---| ---| ---|
|通过网关拨打电话 | `gateway:invoke` + `workspaces:read` |仅限`WORKSPACE_ADMIN` |
|创建、编辑或删除策略 | `organization:manage` |组织管理员 |
|查看网关痕迹 | `projects:read` + `runs:read` | `WORKSPACE_ADMIN`、`WORKSPACE_USER`、`WORKSPACE_VIEWER` |
|查看审核日志 | `organization:manage` |组织管理员 |

内置 `WORKSPACE_USER` 和 `WORKSPACE_VIEWER` 角色**不**包括 `gateway:invoke` 并且无法编辑。要在没有完整工作区管理权限的情况下授予网关访问权限，请使用 `gateway:invoke` 和 `workspaces:read` 创建自定义工作区角色（需要启用 RBAC 的计划）。有关说明，请参阅[Admin setup](/langsmith/llm-gateway-admin-setup)。

### API 密钥范围

始终对网关使用工作区范围的 API 密钥。不支持组织范围的密钥调用网关。

### 集中提供者凭证

网关将提供商 API 密钥集中在 LangSmith 工作区机密中。个人开发人员和代理使用他们的[LangSmith API key](/langsmith/create-account-api-key)进行身份验证，并且永远不需要直接访问提供商密钥。

这意味着：- **凭证控制：** 提供商密钥位于一处，由管理员管理。撤销访问意味着撤销LangSmith API 密钥，而不是查找提供者密钥的分布式副本。
- **策略执行：** 因为所有呼叫都流经网关，所以策略得到一致执行。无法通过直接调用提供商来绕过成本限制（只要开发人员无法单独访问提供商密钥）。

为了使其按预期工作，请勿将提供商 API 密钥与网关访问一起分发给开发人员。默认情况下，网关集中提供者凭据。基于 OAuth 的流程（例如 Claude Code Max）还存在传递模式 - 如果您的组织想要允许或限制它，请联系我们。

### 限制跟踪可见性

网关跟踪被写入工作区项目中，并遵循 LangSmith 的标准工作区成员资格模型。工作区中具有 `runs:read`（以及 `projects:read` 查看项目本身）的任何人都可以查看该工作区的网关项目中的跟踪。内置角色 `WORKSPACE_ADMIN`、`WORKSPACE_USER` 和 `WORKSPACE_VIEWER` 默认情况下都包含这两种权限。

如果您需要限制谁可以查看网关跟踪，您有两种选择：- **单独的工作区**（适用于任何[plan](/langsmith/pricing-plans)）：创建一个具有有限成员资格的工作区，并为具有更广泛成员资格的开发人员编码代理创建另一个工作区。每个工作区都有自己的提供者机密和跟踪项目。
- **项目级访问策略**（需要[Enterprise plan](/langsmith/pricing-plans)）：编写ABAC策略，将网关项目上的`projects:read`和`runs:read`限制为特定用户或角色。

## 后续步骤

- [Admin setup](/langsmith/llm-gateway-admin-setup)：配置所有这些的分步指南。
- [Spend policies](/langsmith/llm-gateway-spend-policies)：对 API 密钥和用户附加成本限制。
- [Data protection](/langsmith/llm-gateway-data-protection)：配置数据保护策略。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-access.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>