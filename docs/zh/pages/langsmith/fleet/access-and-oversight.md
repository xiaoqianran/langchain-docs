<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Access & oversight | https://docs.langchain.com/langsmith/fleet/access-and-oversight -->

# 访问和监督

控制谁可以访问代理、他们如何进行身份验证以及审核他们所做的一切。

Fleet 为您提供了在整个组织中扩展代理的控制层：分层权限、凭证管理、人机交互监督以及代理操作的审核跟踪。

## 权限和共享

Fleet 将工作区角色权限与代理共享相结合。您的角色决定了您可以执行哪些操作。代理所有权和共享决定您可以访问哪些代理。

<Note>
  自定义角色是一项企业功能。当为您的工作区启用队列 RBAC 时，以下权限适用。对于自托管 v0.17，Fleet RBAC 需要 LangSmith 0.17.44 或更高版本的 v0.17 补丁以及 [deployment flag](#enable-fleet-rbac-on-self-hosted)。
</Note>

### 配置舰队角色

要让用户使用和管理 Fleet，请创建具有以下权限的 [custom workspace role](/langsmith/rbac#custom-roles)：|面积 |权限 |需要 |
| - | - | - |
|工作空间 | <span>`workspaces:read`</span> |访问工作区。 |
|代理| <span>`fleet-agents:read`<br />`fleet-agents:invoke`<br />`fleet-agents:create`<br />`fleet-agents:update`<br />`fleet-agents:delete`</span> |查看、运行、创建、编辑、克隆和删除代理。管理代理连接。 |
|技能 | <span>`fleet-skills:read`<br />`fleet-skills:create`<br />`fleet-skills:update`<br />`fleet-skills:delete`</span> |浏览、创建、编辑和删除工作区技能。 |
| MCP 服务器 | <span>`mcp-servers:read`<br />`mcp-servers:invoke`<br />`mcp-servers:create`<br />`mcp-servers:update`<br />`mcp-servers:delete`</span> |使用工具并安装、更新或删除工作区集成。 |
|部署| <span>`deployments:read`<br />`deployments:create`<br />`deployments:update`<br />`deployments:delete`</span> |通过当前的舰队 UI 配置 OAuth 提供商并管理连接的帐户。 |

明确授予每项权限。创建、更新、删除和调用权限不包括读取权限。现有的代理和技能所有权以及共享检查仍然适用。

`deployments:*` 权限还授予对舰队外部部署资源的访问权限。

### 可选的管理权限* **查看队列使用情况和限制**：添加`fleet:read-admin-config`以查看使用报告和使用限制。
* **管理车队限制**：添加`fleet:write-admin-config`以创建、更新和删除使用限制。授予两个队列管理员查看和管理限制的权限。
* **管理工作区设置**：在 **设置** 中添加用于工作区设置、集成访问控制和 OAuth 提供程序管理的 `workspaces:manage`。

欲了解更多信息，请参阅[Workspace administration](/langsmith/fleet/workspace-admin)。

### 分享代理

Fleet 在两个维度上对每个代理提供精细控制：**谁可以访问**和**他们可以做什么**。

* **谁**：与个人用户或整个工作区共享。
* **什么**：三个权限级别：
  * **克隆**：复制并自定义代理
  * **运行**：无需修改即可使用
  * **编辑**：完全访问更改说明、工具和设置

您可以对这些权限进行分层。授予核心团队编辑权限，与更广泛的组织共享仅运行权限，并随时撤销。

有关设置说明，请参阅[Change access to the agent](/langsmith/fleet/manage-agent-settings#change-access-to-the-agent)。

### 在自托管上启用队列 RBAC

完全自托管 LangSmith 安装可通过部署标志启用基于角色的队列访问控制 (RBAC)。云和混合 (BYOC) 部署不需要此步骤。<Note>
  自托管上的队列 RBAC 需要 LangSmith 0.17.44 或更高版本的 v0.17 补丁。
</Note>

要启用队列 RBAC：

1. 将所有服务升级至所需的LangSmith版本。
2. 创建或更新具有舰队权限的[custom roles](#configure-a-fleet-role)，并将其分配给用户。升级不会向现有角色添加队列权限。
3. 将标志添加到您的 Helm 值中，保留现有的 `extraEnv` 条目：

   ```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   platformBackend:
     deployment:
       extraEnv:
         - name: FLEET_RBAC_PERMISSIONS_ENABLED
           value: "true"
   ```

   该标志默认为`false`。将其设置为 `true` 可以在部署中的所有工作区中启用队列 RBAC。
4. 通过正常的 Helm 升级过程应用这些值。
5. 使用您的 API 密钥和工作区 ID 调用 `GET /v1/fleet/config`。确认响应包含`"rbac_permissions_enabled": true`。

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

|许可 |描述 |
| - | - |
| `mcp-servers:read` |发现并列出 MCP 服务器和集成 |
| `mcp-servers:invoke` |从 MCP 服务器和集成执行工具 |
| `mcp-servers:create` |创建新的 MCP 服务器配置 |
| `mcp-servers:update` |修改MCP服务器配置|
| `mcp-servers:delete` |删除 MCP 服务器配置 |

<Note>
  具有 `mcp-servers:read` 和 `mcp-servers:invoke` 的角色可以查看和使用工作区中的所有 MCP 服务器和集成。
</Note>

有关 RBAC 的更多信息，请参阅[Role-based access control](/langsmith/rbac)。

#### 创建具有工具权限的角色

<Steps>
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

### 基于属性的访问控制基于属性的访问控制 (ABAC) 在 RBAC 之上添加了资源级粒度。管理员可以标记各个 MCP 服务器或集成，并创建基于这些标签授予或限制访问权限的策略。

ABAC 使用两种工具资源类型：

|资源类型|适用于 |
| - | - |
| `mcp_server` |添加到工作区的自定义 MCP 服务器 |
| `fleet_integration` |内置集成（Gmail、Slack、GitHub 等）|

<Note>
  没有 `mcp-servers:*` RBAC 权限的角色仍然可以通过 ABAC 允许策略被授予对特定标记资源（例如仅 Notion 和 Gmail）的访问权限。相反，可以通过 ABAC 拒绝策略限制具有广泛 RBAC 访问权限的角色使用特定资源。
</Note>

有关策略结构、运算符以及通过 API 管理策略的详细信息，请参阅[Attribute-based access control](/langsmith/abac)。

### 工作区集成政策

内置集成有一个额外的控制层：从 **设置 > 集成 > 访问控制** 管理的工作区级别启用/禁用切换。这充当管理员控制的基线，在每用户 RBAC 和 ABAC 之前运行。

如果在工作区级别禁用集成，则任何用户都无法访问它，无论其角色或 ABAC 策略如何。<Note>
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

每一步：

1. **工作区策略门**（仅限集成）：如果禁用集成，则访问将被拒绝。没有进一步评价。
2. **ABAC拒绝**：如果拒绝策略匹配，则拒绝访问。否认总是胜利。
3. **RBAC**：如果用户的角色授予所需的权限，则允许访问（除非需要步骤 4）。
4. **ABAC 允许**：如果 RBAC 不授予访问权限，则允许策略仍然可以授予特定标记资源的访问权限。

## 可观察性和审计追踪

Fleet 中的代理操作以结构化[LangSmith trace](/langsmith/observability) 的形式捕获，包括工具调用、决策和输出。您可以检查、搜索和导出跟踪。

结合代理身份和权限，跟踪可以告诉您哪个代理进行了操作、代表谁、使用什么凭据以及在每个步骤中执行了哪些操作。

## 人在回路监督Fleet 提供 [central inbox](https://smith.langchain.com/agents/inbox) 用于审查所有代理的代理操作。您可以将代理配置为在采取特定操作之前暂停并请求批准，然后从一处进行审核、批准、编辑或拒绝。

有关设置说明，请参阅[Human-in-the-loop](/langsmith/fleet/essentials#human-in-the-loop)。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/access-and-oversight.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>