<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Access & oversight | https://docs.langchain.com/langsmith/fleet/access-and-oversight -->

# 访问和监督

控制谁可以访问代理、他们如何进行身份验证以及审核他们所做的一切。

Fleet 为您提供了在整个组织中扩展代理的控制层：分层权限、凭证管理、人机交互监督以及代理操作的审核跟踪。

## 权限和共享

Fleet 在两个维度上对每个代理提供精细控制：**谁可以访问**和**他们可以做什么**。

* **谁**：与个人用户或整个工作区共享。
* **什么**：三个权限级别：
  * **克隆** — 复制并自定义代理
  * **运行** — 无需修改即可使用
  * **编辑** — 完全访问更改说明、工具和设置

您可以对这些权限进行分层。授予核心团队编辑权限，与更广泛的组织共享仅运行权限，并随时撤销。

有关设置说明，请参阅[Change access to the agent](/langsmith/fleet/manage-agent-settings#change-access-to-the-agent)。

## 代理身份和凭证

Fleet 提供两种凭证模型来控制代理如何使用外部工具进行身份验证：* **固定凭证（“爪子”）**：代理使用一组凭证，无论谁运行它。用于共享资源代理，例如团队 Slack 机器人，其中每个人都通过同一帐户进行交互。
* **用户凭据（“助手”）**：代理代表调用它的单个用户进行操作。每个用户通过 OAuth 使用自己的帐户进行身份验证。用于用户具有不同访问级别的工具，例如个人电子邮件助理。

这是每个代理都可以配置的，因此您可以为每个用例选择正确的模型。

有关设置说明，请参阅[Agent identity](/langsmith/fleet/agent-identity)。

## 工具访问控制

Fleet 为工具提供分层访问控制，涵盖**自定义 MCP 服务器**（用户添加、工作区范围）和**内置集成**（平台提供，例如 Gmail、Slack 和 GitHub）：

* **[Role-based access control (RBAC)](#role-based-permissions)**：控制角色级别的访问。
* **[Attribute-based access control (ABAC)](#attribute-based-access-control)**：在 RBAC 之上添加每个资源的粒度。
* **[Workspace integration policy](#workspace-integration-policy)**：为内置集成提供管理员控制的启用/禁用门。

<Note>
  工具访问控制是一项企业功能。如果您对此功能感兴趣，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

### 基于角色的权限基于角色的访问控制 (RBAC) 根据用户的角色授予或拒绝对工作区中所有 MCP 服务器和集成的访问权限。在 **设置 > 角色** 中配置角色。

以下权限可用于 MCP 服务器和集成：

|许可|描述 |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `mcp-servers:read` |发现并列出 MCP 服务器和集成 |
| `mcp-servers:invoke` |从 MCP 服务器和集成执行工具，包括 OAuth 连接/断开 |
| `mcp-servers:create` |创建新的 MCP 服务器配置 |
| `mcp-servers:update` |修改MCP服务器配置|
| `mcp-servers:delete` |删除 MCP 服务器配置 |

<Note>
  具有 `mcp-servers:read` 和 `mcp-servers:invoke` 的角色可以查看和使用工作区中的所有 MCP 服务器和集成。
</Note>

有关 RBAC 的更多信息，请参阅[Role-based access control](/langsmith/rbac)。

#### 创建具有工具权限的角色<Steps>
  <Step title="Open role settings">
    导航到 **设置 > 角色**，然后单击 **创建角色**。
  </Step>

  <Step title="Configure MCP Servers permissions">
    展开 **MCP 服务器** 部分并选择要包含的权限。例如，为需要使用工具但不需要管理服务器配置的用户授予`Read`和`Invoke`。
  </Step>

  <Step title="Assign the role">
    在 **设置 > 成员** 中将角色分配给工作区中的用户。
  </Step>
</Steps>

### 基于属性的访问控制

基于属性的访问控制 (ABAC) 在 RBAC 之上添加了资源级粒度。管理员可以标记单个 MCP 服务器或集成，并创建基于这些标记授予或限制访问权限的策略。

ABAC 使用两种工具资源类型：

|资源类型|适用于 |
| ------------------- | -------------------------------------------------- |
| `mcp_server` |添加到工作区的自定义 MCP 服务器 |
| `fleet_integration` |内置集成（Gmail、Slack、GitHub 等）|<Note>
  没有 `mcp-servers:*` RBAC 权限的角色仍然可以通过 ABAC 允许策略被授予对特定标记资源（例如仅 Notion 和 Gmail）的访问权限。相反，可以通过 ABAC 拒绝策略限制具有广泛 RBAC 访问权限的角色使用特定资源。
</Note>

有关策略结构、运算符以及通过 API 管理策略的详细信息，请参阅[Attribute-based access control](/langsmith/abac)。

### 工作区集成政策

内置集成有一个额外的控制层：从 **设置 > 集成 > 访问控制** 管理的工作区级别启用/禁用切换。这充当管理员控制的基线，在每用户 RBAC 和 ABAC 之前运行。

如果在工作区级别禁用集成，则任何用户都无法访问它，无论其角色或 ABAC 策略如何。

<Note>
  访问控制页面仅对管理员用户可见（需要 `workspaces:manage` 权限）。
</Note>

### 政策评估顺序

这三个层按顺序进行评估。自定义 MCP 服务器和内置集成之间的评估顺序略有不同：

**自定义 MCP 服务器：**

```
ABAC deny → RBAC → ABAC allow
```

**内置集成：**

```
Workspace policy gate → ABAC deny → RBAC → ABAC allow
```

每一步：1. **工作区策略门**（仅限集成）：如果禁用集成，则访问将被拒绝。没有进一步评价。
2. **ABAC拒绝**：如果拒绝策略匹配，则拒绝访问。否认总是胜利。
3. **RBAC**：如果用户的角色授予所需的权限，则允许访问（除非需要步骤 4）。
4. **ABAC 允许**：如果 RBAC 不授予访问权限，则允许策略仍然可以授予特定标记资源的访问权限。

## 可观察性和审计跟踪

Fleet 中的代理操作以结构化[LangSmith trace](/langsmith/observability) 的形式捕获，包括工具调用、决策和输出。您可以检查、搜索和导出跟踪。

结合代理身份和权限，跟踪可以告诉您哪个代理进行了操作、代表谁、使用什么凭据以及在每个步骤中执行了哪些操作。

## 人在回路监督

Fleet 提供 [central inbox](https://smith.langchain.com/agents/inbox) 用于审查所有代理的代理操作。您可以将代理配置为在采取特定操作之前暂停并请求批准，然后从一处进行审核、批准、编辑或拒绝。

有关设置说明，请参阅[Human-in-the-loop](/langsmith/fleet/essentials#human-in-the-loop)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/access-and-oversight.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>