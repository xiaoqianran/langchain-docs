<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect MCP clients to a Managed Deep Agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-mcp-endpoint -->

# 将 MCP 客户端连接到托管深度代理

托管 Deep Agents 部署在 [LangSmith Agent Server](/langsmith/agent-server-overview) 上运行，因此每个部署都为位于 `/mcp` 的代理服务器 [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) 端点提供服务。任何支持 Streamable HTTP 传输的 MCP 客户端都可以将部署的代理作为工具来调用，因此另一个助手或代理可以将工作委托给它，而无需直接调用部署 API。

本页面介绍如何查找托管 Deep Agents URL 并进行身份验证。有关协议行为和通用代理服务器客户端设置，请参阅[MCP endpoint in Agent Server](/langsmith/server-mcp)。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

终点为出方向。 [MCP connector](/langsmith/python/managed-deep-agents-mcp-connectors) 指出了另一种方式：它将远程 MCP 服务器中的工具添加到您的代理中。部署可以同时使用两者。

## 查找端点 URL

端点是部署的 API URL 上的 `/mcp`：

```text
<DEPLOYMENT_API_URL>/mcp
```

`mda deploy` 打印 LangSmith 部署仪表板 URL，而不是 API URL。打开该仪表板，从部署详细信息视图中复制 **API URL**，然后附加 `/mcp`。

由[⟦T9⟧](/langsmith/python/managed-deep-agents-local-development)启动的本地服务器服务于相同的端点。将 `/mcp` 附加到 CLI 打印的本地服务器 URL。

## 验证请求MCP 端点使用部署的 [identity](/langsmith/python/managed-deep-agents-identity) 配置，与部署上的所有其他路由相同。发送与配置模式匹配的凭证：

|身份模式 |标题 |
| ---| ---|
| LangSmith API 密钥（默认）| `x-api-key: <LANGSMITH_API_KEY>` |
|苏帕巴斯| `Authorization: Bearer <access_token>` |

对于 LangSmith API 密钥默认值，密钥必须属于拥有部署的工作区。对另一个工作区有效的密钥将被拒绝。

身份验证失败返回以下三个响应之一：

|状态 |身体|原因 |
| ---| ---| ---|
| 401 | 401 `{"detail":"missing x-api-key"}` |请求中没有凭证标头。 |
| 403 | 403 `{"detail":"API key is forbidden"}` |密钥无效、已撤销或已过期。 |
| 403 | 403 `{"detail":"API key tenant mismatch"}` |密钥有效，但属于与部署不同的工作区。 |

由`mda dev`启动的本地服务器不需要凭据。它为每个调用者授予一个无范围的本地服务主体，因此计算机上的任何客户端都可以调用 `/mcp` 和所有其他路由。只有部署才会强制执行标头。

<Warning>
任何持有 LangSmith API 密钥的人都可以进行部署，并且 MCP 客户端将标头存储在自己的配置中。将添加到客户端配置的密钥视为整个工作区的共享密钥。
</Warning><Note>
Supabase 身份需要一个访问令牌，该令牌是人们通过登录您的应用程序获得的。仅存储静态标头的 MCP 客户端无法创建静态标头，因此请对 MCP 客户端调用的部署使用默认的 LangSmith API 密钥。
</Note>

## 了解代理暴露的内容

代理服务器将代理公开为 MCP 工具：

- **工具名称**：[agent definition](/langsmith/python/managed-deep-agents-agent-definition#parameters)中设置的代理`name`。
- **工具输入模式**：代理的输入模式。

有关传输详细信息和其他代理服务器 MCP 行为，请参阅 [MCP endpoint in Agent Server](/langsmith/server-mcp)。

## 将代理添加到 Claude 代码中

将端点注册为 HTTP MCP 服务器：

```bash
claude mcp add --transport http research-assistant \
  <DEPLOYMENT_API_URL>/mcp \
  --header "x-api-key: $LANGSMITH_API_KEY"
```

服务器连接后，Claude Code 将代理列为工具。

在 JSON 配置中，Claude Code 在标头值中扩展 `${VAR}`，因此密钥保留在环境中而不是配置文件中：

```json
"headers": { "x-api-key": "${LANGSMITH_API_KEY}" }
```

## 将代理添加到另一个 MCP 客户端

读取 `mcpServers` 配置的客户端直接接受端点和标头：

```json
{
  "mcpServers": {
    "research-assistant": {
      "type": "http",
      "url": "<DEPLOYMENT_API_URL>/mcp",
      "headers": {
        "x-api-key": "<LANGSMITH_API_KEY>"
      }
    }
  }
}
```仅接受 URL 并协商 OAuth 的客户端无法对端点进行身份验证，这需要标头凭据。显式配置标头。如果没有，客户端可能会退回到 OAuth 并报告动态客户端注册失败，而不是报告丢失的标头，这掩盖了真正的原因。

## 从代码中调用端点

通过 MCP 客户端库加载代理的工具，然后将工具传递给模型或另一个代理：

```python
import os

from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient(
    {
        "research-assistant": {
            "transport": "streamable_http",
            "url": "<DEPLOYMENT_API_URL>/mcp",
            "headers": {"x-api-key": os.environ["LANGSMITH_API_KEY"]},
        }
    }
)

tools = await client.get_tools()
```




从环境中读取凭据。不要将它们硬编码到客户端代码中。

## 了解会话行为

代理服务器 MCP 请求为[stateless](/langsmith/server-mcp#session-behavior)：单独的调用不共享线程状态。

为了在通话中保留知识，[opt in to durable memory](/langsmith/python/managed-deep-agents-memory)。持久内存是可选的，并由部署的每个调用者共享。当 MCP 客户端不应相互影响时，请勿启用它。

## 何时使用 MCP 端点|概念|亲切 |它如何到达代理|
| ---| ---| ---|
| **MCP 端点** |部署API |将代理作为工具公开给 MCP 客户端 |
| **[MCP connectors](/langsmith/python/managed-deep-agents-mcp-connectors)** |托管配置|将远程 MCP 服务器托管的工具添加到代理 |
| **[Channels](/langsmith/python/managed-deep-agents-channels)** |托管配置|从启动代理运行并传送响应的外部消息传递服务接收消息 |

## 后续步骤

<CardGroup cols={2}>
  <Card title="Agent Server" icon="server" href="/langsmith/agent-server-overview">
    探索托管每个托管 Deep Agents 部署的运行时。
  </Card>
  <Card title="Agent Server MCP" icon="protocol" href="/langsmith/server-mcp">
    阅读代理服务器 MCP 协议参考。
  </Card>
  <Card title="MCP connectors" icon="plug" href="/langsmith/python/managed-deep-agents-mcp-connectors">
    将工具从远程 MCP 服务器添加到代理。
  </Card>
  <Card title="Identity" icon="fingerprint" href="/langsmith/python/managed-deep-agents-identity">
    对部署的调用者进行身份验证。
  </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-mcp-endpoint.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>