<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set Tool Gateway policies | https://docs.langchain.com/langsmith/tool-gateway-policies -->

# 设置工具网关策略

阻止工具网关工具调用或在运行之前需要批准，并查看调用者在应用策略时会得到什么。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

策略是[Tool Gateway](/langsmith/tool-gateway) 检查每个工具调用的规则。它根据调用者和工具来匹配调用，并阻止它们或要求调用者在运行之前批准每个调用。使用策略阻止代理调用写入、删除或发送数据的工具，或在调用之前添加确认步骤。

策略控制调用者可以调用的内容。 [Tool kits](/langsmith/tool-gateway-tool-kits) 仅控制代理看到哪些工具。因此，不要依赖套件来限制访问。参见[Tool kits curate, policies enforce](/langsmith/tool-gateway-how-it-works#tool-kits-curate-policies-enforce)。

查看策略需要`organization:read`权限。创建、更改或删除策略需要个人访问令牌或LangSmith会话，而不是服务密钥，并且需要以下角色之一：

* **组织管理员**：管理组织中的每个策略，包括适用于每个工作区的策略。
* **工作区管理员**：仅管理仅限于他们登录的工作区或`X-Tenant-Id`标头名称的策略。工作区管理员无法将策略应用于每个工作区或将其移动到另一个工作区。有关角色，请参阅[Role-based access control](/langsmith/rbac)。

## 政策如何运作

每项政策都有以下两种效果之一：

|效果（用户界面）| `effect`（API）|匹配的调用会发生什么情况？
| - | - | - |
| **阻止** | `FORBID` |呼叫不运行。 |
| **请求批准** | `REQUIRE_APPROVAL` |仅当呼叫者在其 MCP 客户端中批准呼叫后，呼叫才会运行。 |

工具网关在每次调用时应用这些规则：

* **默认允许**：没有策略匹配的调用运行。
* **阻止成功**：如果呼叫匹配阻止策略和批准策略，则呼叫将被阻止。
* **每个端点**：策略适用于通过工具包、me 套件和单个服务器端点进行的调用。在[search mode](/langsmith/tool-gateway-clients)中，它们适用于`call_tool`运行的工具。
* **组织或工作区**：策略适用于组织中的每个工作区或您选择的一个工作区。
* **立即**：创建、更改、关闭或删除策略在下次调用时生效。

策略检查调用，而不是工具列表。被阻止的工具仍会出现在工具包列出的工具中。代理可以使用绑定到其[agent environment](/langsmith/agent-environments)的API密钥进行调用。然后，工具网关检查密钥的策略和代理的策略。任一方的阻塞都会阻塞该呼叫。策略只能限制呼叫，因此代理上的策略永远不会解除对密钥的阻止。

## 创建策略

此示例需要在任何人使用 [quickstart](/langsmith/tool-gateway-quickstart) 中的 `save_issue` 工具创建线性问题之前获得批准。

> [选项卡] 用户界面
>
> 1. 转到**工具** > **策略**，然后单击**创建策略**。
> 2. 输入 **名称**，例如 `approve-linear-issues`，以及可选的 **说明**。如果将描述留空，LangSmith 将使用策略摘要。
> 3. 在**当呼叫匹配时**下，选择**请求批准**。要停止匹配呼叫，请选择“**阻止**”。
> 4. 在**工作空间**下，保留**所有工作空间**，或选择一个工作空间。工作区管理员只能选择当前工作区。
> 5. 在 **适用于** 下，选择 **所有人**，或选择一种呼叫者并选择呼叫者。参见[Choose who a policy applies to](#choose-who-a-policy-applies-to)。
> 6. （可选）在**例外**下，选择不应应用该策略的呼叫者。
> 7. 在 **工具** 下，从 Linear 中搜索并选择 `save_issue`。您还可以选择服务器上的每个工具，或**所有工具**。> 8. 单击**创建策略**。
>
> 工具选择器列出当前工作区中的服务器。要选择另一个工作区的服务器，请先切换到该工作区。
>
> 新政策已生效。 **策略**选项卡列出了带有**打开**或**关闭**开关的每个策略。

> [选项卡] API
>
> 发送`POST /v1/agent-policies`。策略 API 不属于 `/v1/managed-tools/`。本页上的 API 示例使用 [quickstart](/langsmith/tool-gateway-quickstart) 中的环境变量。
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X POST "$LANGSMITH_ENDPOINT/v1/agent-policies" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{
>     "name": "approve-linear-issues",
>     "description": "Approve each Linear issue before it is created",
>     "effect": "REQUIRE_APPROVAL",
>     "workspace_id": "<workspace-id>",
>     "scope": {
>       "principals": [{"type": "*", "id": "*"}],
>       "actions": ["<linear-server-id>_save_issue"]
>     }
>   }'
> ```
>
> 请求返回 `201` 以及策略，包括其 `id`。
>
> * **`name`**：必填。参见[Policy names and limits](#policy-names-and-limits)。
> * **`description`**：API 中必填，最多 1,024 个字符。
> * **`effect`**：`FORBID` 或 `REQUIRE_APPROVAL`。
> * **`workspace_id`**：策略应用的工作区。将其保留以将策略应用到组织中的每个工作区。
> * **`scope.principals`**：策略适用的呼叫者。参见[Choose who a policy applies to](#choose-who-a-policy-applies-to)。
> * **`scope.except_principals`**：（可选）该政策不适用于的呼叫者。
> * **`scope.actions`**：策略适用的工具。参见[Choose which tools a policy applies to](#choose-which-tools-a-policy-applies-to)。
> * **`is_enabled`**：（可选）设置为 `false` 以创建关闭的策略。默认为`true`。

### 选择政策适用对象

`scope.principals`和`scope.except_principals`中的每个条目都是一个带有`type`和`id`的对象。使用 `"*"` 作为 `id` 来匹配该类型的每个呼叫者。|适用于 (UI) | API入口|匹配呼叫 |
| - | - | - |
| **大家** | `{"type": "*", "id": "*"}` |来自任何来电者。必须是 `principals` 中的唯一条目。 |
| **用户** | `{"type": "User", "id": "<user-id>"}` |用户使用自己的个人访问令牌或LangSmith会话进行创建。 |
| **用户组** | `{"type": "Team", "id": "<user-group-id>"}` |来自[user group](/langsmith/user-groups)的成员。 |
| **服务键** | `{"type": "ServiceKey", "id": "<api-key-id>"}` |服务密钥使。 |
| **代理** | `{"type": "AgentIdentity", "id": "<agent-environment-id>"}` |代理使用绑定到该 [agent environment](/langsmith/agent-environments) 的 API 密钥进行制作。 |
|仅限 API | `{"type": "Role", "id": "<role-id>"}` |来自工作区角色为该角色的用户，直接或通过用户组。 |
|仅限 API | `{"type": "FleetAgent", "id": "<assistant-id>"}` | [Fleet](/langsmith/fleet/index) 代理商制作的。 |

使用 `"*"` 作为 **用户**、**服务密钥**和 **代理** 的 `id` 来匹配该类型的所有呼叫者。 UI 将其显示为 **所有用户**、**所有服务密钥** 和 **所有代理**。用户组和角色必须命名一个ID。

当您的组织使用用户组时，**用户组** 将显示在 UI 中。 **除了**接受相同的呼叫者，除了**每个人**。

### 选择策略适用的工具

`scope.actions` 中的每个条目都通过其服务器及其在该服务器上的名称来命名工具：|工具| API入口|
| - | - |
|您添加的服务器上的一个工具 | `<server-id>_<tool-name>`，如`<linear-server-id>_save_issue` |
|您添加的服务器上的每个工具 | `<server-id>_*` |
|内置服务器上的一个工具 | `langsmith_<key>_<tool-name>`，如`langsmith_parallel_parallel_web_search` |
|内置服务器上的每个工具 | `langsmith_<key>_*` |
|每台服务器上的每一个工具 | `*`，作为唯一条目|

> [!注意]
>
> 策略通过其 ID 来命名您添加的服务器，而不是通过套件中工具前缀的服务器名称来命名。例如，套件列出了`linear_save_issue`，但保单条目为`<linear-server-id>_save_issue`。要查找服务器的 ID，请列出带有 `GET /v1/managed-tools/servers` 的服务器。

策略可以命名任何服务器上的工具，包括尚未包含工具包的服务器。一旦调用者可以使用该工具，该策略就会立即生效。

### 策略名称和限制

* **名称**：1 到 63 个小写字母、数字或连字符。它必须以字母开头，以字母或数字结尾，并且在组织中是唯一的。重复的名称返回 `409`。
* **调用者和工具**：`principals`、`except_principals` 和 `actions` 中各最多 100 个条目。
* **策略**：最多 1,000 个适用于每个工作区的策略，加上最多 100 个仅限于每个工作区的策略。创建超过任一限制的策略都会返回 `422`。

## 调用者看到的内容* **阻止**：调用返回 `403` 和 `"code": "tool_call_blocked"`。
* **请求批准**：支持表单获取的 MCP 客户端向调用者显示批准表单。该表单命名了工具、其服务器、需要批准的策略以及调用的参数。如果调用者接受，则调用运行。如果调用者拒绝，调用将返回工具错误并且不会运行。无法显示表单的客户将获得`403`。

呼叫者批准呼叫，而不是单独的审阅者。批准会在运行之前确认每个呼叫，但不会将呼叫路由至管理员。无人在场的情况下运行的代理无法批准呼叫。要阻止此类代理调用工具，请使用阻止策略。

有关响应以及调用者如何处理它们，请参阅[Approve a tool call](/langsmith/tool-gateway-call-tools#approve-a-tool-call)。

## 关闭、编辑或删除策略

### 关闭或打开策略

关闭的策略仍会保存，但不适用于任何呼叫。

* **UI**：在 **工具** > **策略** 上，使用策略的 **打开** 开关。
* **API**：发送`PATCH /v1/agent-policies/<policy-id>`。 `is_enabled` 是`PATCH` 接受的唯一字段。

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -sS -X PATCH "$LANGSMITH_ENDPOINT/v1/agent-policies/<policy-id>" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
    -H "Content-Type: application/json" \
    -d '{"is_enabled": false}'
  ```

### 编辑政策* **UI**：在 **工具** > **策略** 上，单击策略的编辑操作，进行更改，然后单击 **保存**。
* **API**：发送 `PUT /v1/agent-policies/<policy-id>` 以及整个策略，格式与您创建策略时的格式相同。 `PUT` 替换每个字段并保留策略的 ID。如果您省略 `is_enabled`，则会启用该策略。

### 删除策略

* **UI**：在 **工具** > **策略** 上，单击策略的删除操作，然后确认。
* **API**：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -sS -X DELETE "$LANGSMITH_ENDPOINT/v1/agent-policies/<policy-id>" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID"
  ```

  该请求返回 `204`，包括当策略已被删除时。

要查找策略的 ID，请列出带有 `GET /v1/agent-policies` 的策略。响应在 `items` 中保存最多 20 条策略。设置 `page_size` 返回最多 100，并将响应的 `next_cursor` 作为 `cursor` 传递以获取下一页。

创建、更改和删除策略都记录在组织的审核日志中。参见[Traces and audit log](/langsmith/tool-gateway-traces)。

## 另请参阅

* [Approve a tool call](/langsmith/tool-gateway-call-tools#approve-a-tool-call)
* [How Tool Gateway works](/langsmith/tool-gateway-how-it-works)
* [Act as users and agents](/langsmith/tool-gateway-identity)
* [Traces and audit log](/langsmith/tool-gateway-traces)
* [Role-based access control](/langsmith/rbac)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。