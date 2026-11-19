<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect an MCP client to a tool kit | https://docs.langchain.com/langsmith/tool-gateway-clients -->

# 将 MCP 客户端连接到工具包

将 Claude Code、Cursor、Managed Deep Agents 或其他 MCP 客户端连接到工具网关工具包，并打开大型工具包的搜索模式。

> [!注意]
>
> 工具网关位于[beta](/langsmith/release-stages)。

每个[tool kit](/langsmith/tool-gateway-tool-kits)都是一个标准的MCP端点。因此，任何MCP客户端都可以调用其工具。客户端发送 LangSmith API 密钥，[Tool Gateway](/langsmith/tool-gateway) 为每个服务器附加存储的凭据。这样，客户端就不会拥有自己的服务令牌或 API 密钥。

## 客户要求

客户端必须支持 Streamable HTTP 并允许您设置自定义请求标头。标头携带一个 LangSmith API 密钥，它决定每个调用使用谁的凭据：

* **个人访问令牌**：使用您[connected](/langsmith/tool-gateway-connect-accounts)的帐户以您身份运行呼叫。将其用作您自己的编码助手。
* **服务密钥或代理密钥**：呼叫作为用户、代理或配置文件运行，由额外标头或密钥本身选择。参见[Act as users and agents](/langsmith/tool-gateway-identity)。

如果您使用组织范围的 API 密钥，还请在 `X-Tenant-Id` 标头中发送您的工作区 ID。

## 找到套件的 MCP URL

套件的 MCP URL 格式为 `<langsmith-api-url>/v1/managed-tools/kits/<kit-id>/mcp`。例如，在美国LangSmith云上：`https://api.smith.langchain.com/v1/managed-tools/kits/<kit-id>/mcp`。

要复制它，请转至 **工具** > **工具包** 并打开该工具包。该套件的面板显示：* **MCP URL**，填写您所在区域的 API URL。
* 设置 **Claude Code**、**Managed Deep Agents** 和 **Cursor**，套件的 URL 已存在于每个片段中。
* **搜索模式**开关，将 URL 和每个片段更改为 [search mode](#use-search-mode-for-large-kits)。

要为客户提供您可以使用的所有工具，请使用 [me kit](/langsmith/tool-gateway-tool-kits#use-the-me-kit) 而不是精选套件。它的路径是 `/v1/managed-tools/kits/me/mcp`，它会替换以下任意步骤中的套件 URL。

## 将套件添加到客户端

每个客户端都需要相同的两个值：套件的 MCP URL 和 LangSmith API 密钥。只是您输入它们的位置不同。在下面选择您的客户，或遵循[Other MCP clients](#other-mcp-clients)中的模式。

### 克劳德·代码

在您的项目中运行 `claude mcp add`，并在 `X-Api-Key` 标头中使用套件的 URL 和 API 密钥。此页面上的命令使用 [quickstart](/langsmith/tool-gateway-quickstart#before-you-begin) 中的环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
claude mcp add --transport http support-agent \
  "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>/mcp" \
  --header "X-Api-Key: $LANGSMITH_API_KEY"
```

运行`claude mcp list`并确认服务器显示为已连接。有关将 MCP 服务器添加到 Claude Code 的更多信息，请参阅 [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)。

Claude Code 列出了套件中的每个工具，包括您尚未连接的服务器上的工具。第一次调用其中一个工具时，Claude Code 会显示一个连接服务器的链接。

### 光标

将套件添加到您的 `mcp.json` 文件中，并将 `<langsmith-api-key>` 替换为您的 API 密钥：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "mcpServers": {
    "support-agent": {
      "url": "https://api.smith.langchain.com/v1/managed-tools/kits/<kit-id>/mcp",
      "headers": {
        "X-Api-Key": "<langsmith-api-key>"
      }
    }
  }
}
```保存`mcp.json`后，打开Cursor中的**设置** > **MCP**，然后单击**重新加载**，以便Cursor拾取该套件。

### 托管Deep Agents

[Managed Deep Agents](/langsmith/python/managed-deep-agents) 项目将该套件声明为具有 `"auth": "langsmith"` 的 MCP 服务器。然后，代理在每次调用时发送部署的 LangSmith API 密钥和工作区。工具网关使用运行代理的人员的凭据，或代理拥有的计划中代理的凭据。

> [!注意]
>
> 将工具网关与托管 Deep Agents 一起使用需要 `managed-deepagents` 版本 0.10.5 或更高版本（在 Python 和 TypeScript 包中）。

在`tools/mcp.py`或`tools/mcp.ts`中，将套件添加到`servers`地图：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from managed_deepagents import define_mcp

mcp = define_mcp(
    servers={
        "support-agent": {
            "transport": "http",
            "url": "https://api.smith.langchain.com/v1/managed-tools/kits/<kit-id>/mcp",
            "auth": "langsmith",
        },
    },
)
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { defineMcp } from "managed-deepagents";

export const mcp = defineMcp({
  servers: {
    "support-agent": {
      transport: "http",
      url: "https://api.smith.langchain.com/v1/managed-tools/kits/<kit-id>/mcp",
      auth: "langsmith",
    },
  },
});
```

每个项目定义一次`mcp`，并将每个套件或服务器添加为其`servers`映射中的条目。要在 Studio 中本地运行代理，请将 `LANGSMITH_WORKSPACE_ID` 设置为您的工作区 ID，并将 `LANGSMITH_API_KEY` 设置为您环境中的个人访问令牌。

`"auth": "langsmith"` 不能与 `connection` 组合，也不能与选择要使用的凭据的标头组合。要在每次运行时使用 [profile](/langsmith/tool-gateway-connect-accounts#connect-an-account-for-a-profile)，请设置 `"auth": {"type": "langsmith", "profile": "<profile-id>"}`。有关其他 MCP 服务器选项，请参阅[MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors)。

### 其他 MCP 客户端

任何满足 [requirements](#client-requirements) 的客户端都以相同的方式工作：为其提供套件的 URL 和 `X-Api-Key` 标头。例如，使用 LangChain 代理和 `langchain-mcp-adapters`：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio

from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient

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
    }
)


async def main():
    tools = await client.get_tools()
    agent = create_agent("anthropic:claude-sonnet-5-5", tools=tools)
    result = await agent.ainvoke({"messages": [{"role": "user", "content": "List my open issues."}]})
    print(result["messages"][-1].content)


asyncio.run(main())
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent } from "langchain";

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
});

const agent = createAgent({
  model: "anthropic:claude-sonnet-5-5",
  tools: await client.getTools(),
});
```要将每个工具调用嵌套在代理的跟踪下，请参阅[Nest tool calls under your agent run](/langsmith/tool-gateway-traces#nest-tool-calls-under-your-agent-run)。要在没有客户端的情况下发送 MCP 请求，请参阅[Call tools](/langsmith/tool-gateway-call-tools)。

## 对大型套件使用搜索模式

许多客户端将服务器列出的每个工具都放入模型的提示中。包含许多工具的套件可能会用工具定义填充提示，并使工具选择不太准确。在搜索模式下，该套件列出了三个工具，模型使用它们来查找和调用所需的工具。

要打开搜索模式，请将 `?mode=search` 添加到套件的 URL，或在套件面板中打开 **搜索模式**：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
https://api.smith.langchain.com/v1/managed-tools/kits/<kit-id>/mcp?mode=search
```

在 shell 命令中，引用 URL，因为 shell 将 `?` 读取为通配符：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
claude mcp add --transport http support-agent \
  "$LANGSMITH_ENDPOINT/v1/managed-tools/kits/<kit-id>/mcp?mode=search" \
  --header "X-Api-Key: $LANGSMITH_API_KEY"
```

搜索模式适用于已保存的套件和我的套件。它在单个服务器的端点上不可用。

该套件列出了这些工具：|工具|论点|返回|
| - | - | - |
| `search_tools` | `query`（必填）、`limit`（默认 10 个，最多 50 个）、`full_results`（默认 `false`）|最佳匹配，每个匹配都有其名称、服务器、描述以及调用者是否已连接其服务器。将 `full_results` 设置为 `true` 时，每个匹配项还包含其输入模式。 |
| `get_tool` | `name`，来自 `search_tools` |一种工具的完整定义，包括其输入模式。 |
| `call_tool` |与工具的输入模式匹配的`name`和`arguments` |该工具的结果，作为直接调用返回的结果。 |

该模型通常调用 `search_tools`，然后调用 `get_tool`，然后调用 `call_tool`。要跳过`get_tool`，模型可以调用`search_tools`，并将`full_results`设置为`true`。 Claude Code 等客户无需额外设置即可使用这三个工具。

搜索模式仅更改套件列出的内容：

* **您未连接的服务器**：他们的工具仍然出现在搜索结果中，`connected`设置为`false`，并且仅按名称匹配。与直接呼叫一样，呼叫某人会要求您连接。
* **直接调用**：通过工具包名称调用工具，例如`linear_list_issues`，在搜索模式下仍然有效。
* **策略**：[Policies](/langsmith/tool-gateway-policies) 适用于 `call_tool` 运行的工具，就像直接调用一样。

## 另请参阅

* [Create tool kits](/langsmith/tool-gateway-tool-kits)
* [Connect accounts](/langsmith/tool-gateway-connect-accounts)
* [Act as users and agents](/langsmith/tool-gateway-identity)
* [Call tools](/langsmith/tool-gateway-call-tools)
* [MCP connectors in Managed Deep Agents](/langsmith/python/managed-deep-agents-mcp-connectors)

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/tool-gateway-clients.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。