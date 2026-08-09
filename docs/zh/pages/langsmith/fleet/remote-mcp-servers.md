<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Remote MCP servers | https://docs.langchain.com/langsmith/fleet/remote-mcp-servers -->

# 远程 MCP 服务器

将 Fleet 连接到流行的远程 MCP 服务器

您可以将 LangSmith Fleet 连接到远程 MCP 服务器，以通过其他工具和集成来扩展您的代理。本页面介绍如何添加自定义 MCP 服务器并提供流行远程服务器的配置详细信息。

[MCP (Model Context Protocol) server](https://modelcontextprotocol.io/docs/getting-started/intro) 公开了代理可以在运行时调用的工具。

远程 MCP 服务器：

* 在 LangSmith 外部运行（通常通过 HTTPS）。
* 拥有自己的认证和授权。
* 充当您的代理和外部系统之间的桥梁。

LangSmith Fleet 本身并不执行这些工具，它会将请求转发到 MCP 服务器并将结果返回给代理。

### 它是如何工作的

* Fleet 通过标准 MCP 协议从远程 MCP 服务器发现工具。
* 获取工具或调用工具时，会自动附加工作区中配置的标头。标头是随每个 HTTP 请求发送到 MCP 服务器的键值对。它们通常用于身份验证（如 API 密钥或不记名令牌），但也可以提供配置信息、内容类型或自定义元数据。
* 来自远程服务器的工具与 Fleet 中的内置工具一起可用。**运行时**：Fleet 自动连接到您的 MCP 服务器并使用其工具。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant Agent as Fleet
    participant MCP as Remote MCP Server

    Agent->>MCP: Discover available tools<br/>(with configured headers)
    MCP-->>Agent: Return tool list

    Note over Agent,MCP: Later, when agent needs a tool...

    Agent->>MCP: Call tool<br/>(with configured headers)
    MCP-->>Agent: Return result
```

## 添加远程MCP服务器

您可以直接从代理或工作区设置添加 MCP 服务器。

<Note>
  添加 MCP 服务器需要 **MCP 服务器创建** 权限。工作区管理员可以从工作区设置中向用户授予此权限。
</Note>

### 添加到特定代理

要将远程 MCP 服务器添加到特定代理：

<Steps>
  <Step title="Open the Connections drawer">
    打开您的代理，然后在侧边栏中展开 **连接** 抽屉。
  </Step>

  <Step title="Add the MCP server">
    1. 单击“**添加连接**”，然后单击“**+ 添加自定义 MCP**”。
    2. 输入服务器名称和 URL，然后配置身份验证（参见[authentication types](#authentication-types)）。
  </Step>

  <Step title="Discover tools">
    Fleet 从您的 MCP 服务器发现可用工具，并使它们在此代理中可用。
  </Step>
</Steps>

### 添加到工作区中的所有代理

要将远程 MCP 服务器添加到工作区中的所有代理：

<Tabs>
  <Tab title="From Fleet > 集成">
    <Steps>
      <Step title="Navigate to Fleet > 集成">
        在 LangSmith UI 中，导航至 [**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools) 选项卡。
      </Step><Step title="Add the server">
        1. 单击左侧边栏底部的 **+ 自定义 MCP**。
        2. 为 MCP 服务器添加**名称**。
        3. 添加 MCP **URL**（例如，`https://api.example.com/mcp`）
        4. 选择**身份验证**类型。更多详情请参见[Authentication types](#authentication-types)。
      </Step>

      <Step title="Save the server">
        单击**保存服务器**。 Fleet 将自动从您的 MCP 服务器发现可用工具，并使它们在您的代理中可用。配置的标头适用于工具发现请求和工具执行请求。
      </Step>
    </Steps>
  </Tab>

  <Tab title="From workspace settings">
    <Steps>
      <Step title="Navigate to MCP server settings">
        在 LangSmith UI 中，导航至 [Settings > MCP servers](https://smith.langchain.com/settings/workspaces/mcp-servers) 选项卡。
      </Step>

      <Step title="Add the server">
        单击“**添加服务器**”并输入服务器名称和 URL，然后配置身份验证（请参阅[authentication types](#authentication-types)）。
      </Step>

      <Step title="Save the server">
        单击**保存服务器**。 Fleet 将自动从您的 MCP 服务器发现可用工具，并使它们在您的代理中可用。配置的标头适用于工具发现请求和工具执行请求。
      </Step>
    </Steps>
  </Tab>
</Tabs>

### 身份验证类型

根据服务器的要求选择身份验证类型：* **标头**：添加随每个请求发送的键值对。最常见的模式是使用授权不记名令牌：

  * **密钥**：`Authorization`
  * **值**：`Bearer API_KEY`

  <Info>
    如果您的 MCP 服务器需要其他身份验证或配置参数，您可以添加多个标头。每个标头键值对随每个请求一起发送到服务器。
  </Info>

* **OAuth 2.1（自动）**：为通过动态客户端注册支持 OAuth 的服务器选择此选项。系统将提示您使用该服务的帐户登录。

* **OAuth 2.1（手动）**：为支持 OAuth 但需要事先指定客户端 ID/密码的服务器选择此选项。此流程中使用的 OAuth 提供程序必须启用 **PKCE**。

## 更新您的 MCP 服务器 URL

<Warning>
  更改自定义 MCP 服务器的 URL 将破坏使用该服务器中的工具的任何代理。
</Warning>

Fleet 通过 MCP 服务器 URL 存储工具引用。如果您更新自定义 MCP 服务器的 URL，现有代理在尝试调用这些工具时将会失败，因为存储的 URL 不再匹配。

要更新 MCP 服务器 URL：1. 在工作区设置中更新您的 MCP 服务器 URL。
2. 对于使用该服务器中的工具的每个代理：
   * 从代理配置中删除受影响的工具。
   * 重新添加工具（它们现在将引用新的 URL）。
3. 测试代理以确认工具正常工作。

## 支持的服务器

要查看所有可用的 MCP 服务器和配置详细信息，请导航至 [Fleet > Integrations tab](https://smith.langchain.com/agents/tools)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/remote-mcp-servers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>