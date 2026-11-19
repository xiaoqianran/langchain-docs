<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Tool Gateway traces and audit log | https://docs.langchain.com/langsmith/tool-gateway-traces -->

# 工具网关跟踪和审核日志

记录每个工具网关工具调用的跟踪，并在组织的审核日志中查看工具调用和策略更改。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

[Tool Gateway](/langsmith/tool-gateway) 在两个地方记录其工具调用。跟踪显示您的代理做了什么：运行哪个工具、在哪个服务器上、以谁的身份运行以及呼叫如何结束。 [audit log](/langsmith/audit-logs) 显示谁调用了哪个工具以及谁更改了策略，以进行安全和合规性审查。

您可以通过两种方式记录跟踪，并使用其中一种或两种方式：

* **在代理的跟踪中**：每个工具调用都显示为生成它的代理运行下的子运行。您的代理会在每次呼叫时发送 LangSmith 跟踪标头。参见[Nest tool calls under your agent run](#nest-tool-calls-under-your-agent-run)。
* **在工作区中**：工作区中的每个工具调用都会成为一个项目中自己的跟踪，无论客户端如何创建。工作区管理员将其打开。参见[Record every tool call in the workspace](#record-every-tool-call-in-the-workspace)。

## 一条痕迹记录了什么

工具网关跟踪记录有关调用的元数据，而不是发送到工具或由工具返回的数据。它从不包含工具参数或结果。

每个跟踪记录：* **工具**：该工具在其服务器上的名称，例如`save_issue`。
* **服务器**：呼叫到达的 MCP 服务器或内置服务器。
* **工具包**：呼叫通过的工具包（如果有）。
* **充当**：调用使用的凭据：LangSmith 用户、后端指定的最终用户、代理、配置文件或工作区。
* **结果**：通话如何结束。参见下表。
* **策略**：阻止呼叫的策略（如果有）。参见[Set policies](/langsmith/tool-gateway-policies)。
* **计时**：工具网关中调用的总时间，以及 MCP 服务器开始响应所需的时间。

|结果（用户界面）| `ls_tool_gateway_outcome` |意义|
| - | - | - |
| **成功** | `success` |该工具运行并返回结果。 |
| **工具错误** | `tool_error` |该工具运行并返回错误。 |
| **需要凭证** | `credential_required` |调用者必须先连接或重新连接服务器，然后才能运行调用。参见[Connect accounts](/langsmith/tool-gateway-connect-accounts)。 |
| **失败** | `failed` |工具网关或 MCP 服务器无法完成调用，例如因为服务器超时或返回服务器错误。 |
| **被政策阻止** | `failed`，`ls_tool_gateway_blocked` 设置为 `true` | [block policy](/langsmith/tool-gateway-policies)挂断了电话。 |

要查找工具网关运行，请过滤这些元数据键：* `ls_tool_gateway`：每次工具网关运行时`true`。
* `ls_tool_gateway_tool`：该工具在其服务器上的名称。
* `ls_tool_gateway_server_id`：服务器的ID，或者内置服务器的密钥，如`parallel`。
* `ls_tool_gateway_kit_id`：工具包的ID。
* `ls_tool_gateway_outcome`：上表中的结果之一。处理此处未列出的值，因为工具网关可以添加新结果。
* `ls_tool_gateway_reason`：用于说明通话结束原因的简短标签，例如 `upstream_timeout` 或 `tool_call_blocked`。 `none` 成功。
* `ls_tool_gateway_blocked`：当策略阻止呼叫时`true`。

有关如何按元数据过滤运行，请参阅[Filter traces](/langsmith/filter-traces-in-application)。

## 在代理运行下嵌套工具调用

如果您在 LangSmith 中使用 [trace your agent](/langsmith/observability-quickstart)，请在每次工具调用时发送代理的跟踪标头。然后，工具网关在发出调用的代理运行下添加名为 `Tool Gateway: <server name>` 的运行。运行在同一个项目中，带有 `tool_gateway` 标签。

标头是标准 LangSmith [distributed tracing](/langsmith/distributed-tracing) 标头：

* **`langsmith-trace`**：标识父运行。
* **`baggage`**：携带父级的项目、元数据和标签。工具网关运行继承父级的元数据和标签。

在每个工具调用上设置标头，而不是在创建客户端时设置一次，以便每个调用都嵌套在生成它的运行下。工具网关使用发出调用的 API 密钥写入运行。该密钥必须能够将跟踪写入代理的项目。仅使用身份提供者令牌进行身份验证的调用者不会以这种方式进行跟踪。这种形式的跟踪不依赖于下一节中的工作区设置。

### 使用LangChain MCP 适配器

使用 `langchain-mcp-adapters`，在工具拦截器中添加标头。这适用于基于 LangChain 构建的任何代理，例如使用 [create_agent](https://reference.langchain.com/python/langchain/agents/factory/create_agent)、Deep Agents 或 LangGraph 制作的代理。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient
from langsmith.run_helpers import get_current_run_tree


async def trace_headers(request, handler):
    # Nest each Tool Gateway call under the tool run that made it.
    run = get_current_run_tree()
    if run:
        request = request.override(
            headers={**(request.headers or {}), **run.to_headers()}
        )
    return await handler(request)


client = MultiServerMCPClient(
    {
        "support-agent": {
            "transport": "streamable_http",
            "url": "https://api.smith.langchain.com/v1/managed-tools/kits/<kit-id>/mcp",
            "headers": {
                "X-Api-Key": "<langsmith-api-key>",
                "X-Tenant-Id": "<workspace-id>",
            },
        }
    },
    tool_interceptors=[trace_headers],
)


async def main():
    agent = create_agent("anthropic:claude-sonnet-5-5", tools=await client.get_tools())
    result = await agent.ainvoke({"messages": [{"role": "user", "content": "List my open issues."}]})
    print(result["messages"][-1].content)


asyncio.run(main())
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";
import { getCurrentRunTree } from "langsmith/singletons/traceable";

const client = new MultiServerMCPClient({
  mcpServers: {
    "support-agent": {
      transport: "http",
      url: "https://api.smith.langchain.com/v1/managed-tools/kits/<kit-id>/mcp",
      headers: {
        "X-Api-Key": "<langsmith-api-key>",
        "X-Tenant-Id": "<workspace-id>",
      },
    },
  },
  // Send the current run's tracing headers with each tool call.
  beforeToolCall: () => ({ headers: getCurrentRunTree(true)?.toHeaders() }),
});

const agent = createAgent({
  model: "anthropic:claude-sonnet-5-5",
  tools: await client.getTools(),
});
```

### 使用另一个客户端

使用每个 `tools/call` 请求发送当前运行中的 `langsmith-trace` 和 `baggage` 标头。在 LangSmith SDK 中，`run_tree.to_headers()` (Python) 和 `runTree.toHeaders()` (TypeScript) 返回它们。详情请参阅[Distributed tracing](/langsmith/distributed-tracing)。

## 记录工作区中的每个工具调用

工作区跟踪将工作区中的每个工具调用记录为自己的跟踪，无论调用的客户端是什么以及调用者是谁。跟踪会转到名为 `tool-gateway` 的跟踪项目，该项目是 Tool Gateway 在记录第一次调用时创建的。

工作区跟踪是免费的，不计入您的跟踪限制。打开或关闭工作区跟踪需要工作区管理员角色 (`workspaces:settings:manage`)。查看跟踪需要读取 `tool-gateway` 项目中的运行的权限。有关角色，请参阅[Role-based access control](/langsmith/rbac)。

> [选项卡] 用户界面
>
> 1. 转到 **工具** > **使用**。
> 2. 打开**记录工具调用痕迹**。
>
> **使用情况**选项卡列出了过去 7 天内最近的 100 个工具调用，以及每个调用的工具、服务器、结果、延迟和开始时间。单击一个调用以打开其跟踪。要使用寻呼和过滤器查看每个呼叫，请单击“**查看跟踪中的所有呼叫**”。

> [选项卡] API
>
> 发送`PATCH /v1/platform/workspaces/current/info`。本页上的 API 示例使用 [quickstart](/langsmith/tool-gateway-quickstart) 中的环境变量。
>
> ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> curl -sS -X PATCH "$LANGSMITH_ENDPOINT/v1/platform/workspaces/current/info" \
>   -H "X-Api-Key: $LANGSMITH_API_KEY" \
>   -H "X-Tenant-Id: $LANGSMITH_WORKSPACE_ID" \
>   -H "Content-Type: application/json" \
>   -d '{"tool_gateway_traces_enabled": true}'
> ```
>
> 将 `tool_gateway_traces_enabled` 设置为 `false` 以关闭工作区跟踪。要检查当前设置，请将`GET`发送到同一路径并读取响应中的`config.tool_gateway_traces_enabled`。

更改可能需要几分钟才能应用到工具调用。

## 在审核日志中查看工具调用

> [!注意]
>
> 审核日志可在 [Enterprise plans](/langsmith/pricing-plans) 上找到。工具网关在组织的审核日志中记录工具调用以及对其服务器、工具包、配置文件和策略的更改。每个事件记录谁执行的、何时执行、操作以及是否成功。工具调用事件还命名工具包、服务器和工具。

审核日志仅记录工具调用。它不记录列出工具的请求。

要查看审核日志，请转至 **组织设置** > **审核日志**。查看它需要组织管理员或组织操作员角色。有关 API、过滤器和保留，请参阅[Audit logs](/langsmith/audit-logs)。

工具网关记录这些操作：|操作（`api.operation`）|录制时间 |
| - | - |
| `invoke_mcp_gateway` |工具通过工具包或me 包来调用。 |
| `invoke_mcp_server` |通过单个服务器的端点调用工具。 |
| `create_mcp_server`、`update_mcp_server`、`delete_mcp_server`、`register_mcp_server_oauth` |添加、更改或删除服务器，或者注册其 OAuth 客户端。 |
| `create_mcp_credential_session` |有人开始将帐户连接到服务器。 |
| `create_mcp_gateway`、`update_mcp_gateway`、`delete_mcp_gateway`、`refresh_mcp_gateway_tools` |创建、更改、删​​除工具包或刷新其工具。 |
| `create_mcp_profile`、`update_mcp_profile`、`delete_mcp_profile` |创建、更改或删除配置文件。 |
| `update_mcp_oidc_connection`、`delete_mcp_oidc_connection` |身份提供者已链接到工作区或从工作区取消链接。 |
| `create_agent_policy`、`update_agent_policy`、`delete_agent_policy` |创建、更改、打开或关闭或删除策略。 |

## 另请参阅

* [How Tool Gateway works](/langsmith/tool-gateway-how-it-works)
* [Set policies](/langsmith/tool-gateway-policies)
* [Connect an MCP client to a tool kit](/langsmith/tool-gateway-clients)
* [Distributed tracing](/langsmith/distributed-tracing)
* [Audit logs](/langsmith/audit-logs)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。