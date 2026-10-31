<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Remote MCP servers | https://docs.langchain.com/langsmith/fleet/remote-mcp-servers -->

# 远程 MCP 服务器

将 Fleet 连接到流行的远程 MCP 服务器

您可以将 LangSmith Fleet 连接到远程 MCP 服务器，以通过其他工具和集成来扩展您的代理。本页面介绍如何添加自定义 MCP 服务器并提供流行远程服务器的配置详细信息。

[MCP (Model Context Protocol) server](https://modelcontextprotocol.io/docs/getting-started/intro) 公开了代理可以在运行时调用的工具。

远程 MCP 服务器：

* 在 LangSmith 之外运行（通常通过 HTTPS）。
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

> [!注意]
>
> 添加 MCP 服务器需要 **MCP 服务器创建** 权限。工作区管理员可以从工作区设置中向用户授予此权限。

### 添加到特定代理

要将远程 MCP 服务器添加到特定代理：

**1.打开连接抽屉**

打开您的代理，然后在侧边栏中展开 **连接** 抽屉。

**2.添加 MCP 服务器**

1. 单击“**添加连接**”，然后单击“**+ 添加自定义 MCP**”。
2. 输入服务器名称和 URL，然后配置身份验证（请参阅[authentication types](#authentication-types)）。

**3.发现工具**

Fleet 从您的 MCP 服务器发现可用工具，并使它们在此代理中可用。

### 添加到工作区中的所有代理

要将远程 MCP 服务器添加到工作区中的所有代理：> [选项卡] 来自舰队 > 集成
>
> **1。导航到舰队 > 集成**
>
> 在 LangSmith UI 中，导航至 [**Fleet** > **Integrations**](https://smith.langchain.com/agents/tools) 选项卡。
>
> **2。添加服务器**
>
> 1. 单击左侧边栏底部的 **+ 自定义 MCP**。
> 2. 为 MCP 服务器添加**名称**。
> 3. 添加 MCP **URL**（例如，`https://api.example.com/mcp`）
> 4. 选择**身份验证**类型。更多详情请参见[Authentication types](#authentication-types)。
>
> **3。保存服务器**
>
> 单击**保存服务器**。 Fleet 将自动从您的 MCP 服务器发现可用工具，并使它们在您的代理中可用。配置的标头适用于工具发现请求和工具执行请求。

> [选项卡] 从工作区设置
>
> **1。导航到 MCP 服务器设置**
>
> 在 LangSmith UI 中，导航至 [Settings > MCP servers](https://smith.langchain.com/settings/workspaces/mcp-servers) 选项卡。
>
> **2。添加服务器**
>
> 点击**添加服务器**并输入服务器名称和URL，然后配置身份验证（参见[authentication types](#authentication-types)）。
>
> **3。保存服务器**
>
> 单击**保存服务器**。 Fleet 将自动从您的 MCP 服务器发现可用工具，并使它们在您的代理中可用。配置的标头适用于工具发现请求和工具执行请求。

### 身份验证类型根据服务器的要求选择身份验证类型：

* **静态标头**：添加随每个请求发送的键值对。最常见的模式是使用授权不记名令牌：

  * **密钥**：`Authorization`
  * **值**：`Bearer API_KEY`

  > [!注意]
  >
  > 如果您的 MCP 服务器需要额外的身份验证或配置参数，您可以添加多个标头。每个标头键值对都会随每个请求一起发送到服务器。

* **OAuth 2.1（自动）**：为通过动态客户端注册 (DCR) 支持 OAuth 的服务器选择此选项。 Fleet 会为您注册一个客户端，并提示您使用该服务的帐户登录。无需设置，因此当服务器支持时首选此选项。* **OAuth 2.1（手动）**：为支持 OAuth 但不支持动态客户端注册的服务器选择此选项。选择您事先[registered](#register-an-oauth-provider) 使用您的客户端 ID 和密码的 OAuth 提供商。提供者使用两种资助类型之一：
  * **授权代码**：每个用户使用自己的帐户登录该服务。提供商必须启用 **PKCE**。
  * **客户端凭据**：代理将机器对机器验证为您的应用程序，因此没有用户登录。Fleet 在调用服务器时从提供商的令牌 URL 请求新的访问令牌。

### 注册 OAuth 提供商

OAuth 提供程序在组织级别存储 OAuth 应用程序的客户端 ID、机密和端点。注册提供程序一次，然后每当您使用 **OAuth 2.1（手动）** 添加 MCP 服务器时选择它。

> [!注意]
>
> 管理 OAuth 提供程序需要 `workspaces:manage` 权限，包含在 [Workspace Admin](/langsmith/rbac#workspace-admin) 角色中。

> [!注意]
>
> 在自托管 LangSmith v0.17 上，客户端凭证授予需要 v0.17.32 或更高版本（Helm Chart 0.17.5 或更高版本）。还要在 `hostBackend` 和 `platformBackend` 上设置 `FF_FLEET_OAUTH_CLIENT_CREDENTIALS_ENABLED=true`，例如通过 `hostBackend.deployment.extraEnv` 和 `platformBackend.deployment.extraEnv`。

要注册 OAuth 提供程序：

**1.使用您的身份提供商创建 OAuth 应用程序**在您的身份提供商（例如 GitHub 或 Google）中，创建 OAuth 应用程序。记下其客户端 ID 和客户端密钥。

对于授权代码授予，将应用程序的重定向（回调）URL 设置为：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
https://<your-langsmith-host>/host-oauth-callback/<provider-id>
```

将 `<provider-id>` 替换为您在下一步中选择的提供商 ID。客户端凭据授予不使用重定向 URL。

**2.在 LangSmith** 中注册提供商

转至 **设置** > **OAuth 提供商**，然后单击 **OAuth 提供商**。填写每个提供商的字段：

* **提供商 ID**：使用字母、数字、连字符和下划线的简短标识符（例如，`github`）。该值出现在重定向 URL 中。
* **显示名称**：人类可读的名称（例如，`GitHub OAuth`）。
* **客户端 ID** 和 **客户端密钥**：来自您创建的 OAuth 应用程序。
* **授权类型**：**授权代码** 或 **客户凭证**。
* **令牌 URL**：提供商的令牌端点（例如，`https://example.com/oauth/token`）。

对于**授权码**，还设置：* **授权 URL**：提供商的授权端点（例如，`https://example.com/oauth/authorize`）。
* **启用 PKCE**：打开此功能。添加手动 OAuth MCP 服务器时，仅显示启用了 PKCE 的提供程序。
* **范围**（在**高级**下）：可选。覆盖发送到授权 URL 的 `scope` 参数。

对于**客户端凭据**，还设置：

* **令牌身份验证**：Fleet 如何将客户端 ID 和密钥发送到令牌 URL，**HTTP 基本**（默认）或 **请求正文**。
* **范围**（在**高级**下）：可选。与令牌请求一起发送的以空格分隔的范围。
* **观众**（在**高级**下）：可选。某些提供商（例如 Auth0）需要它。

**3.添加服务器时选择提供商**

当您[add the MCP server](#add-a-remote-mcp-server)时，选择**OAuth 2.1（手动）**并选择您注册的提供商。对于授权代码提供商，每个用户都连接他们的帐户。对于客户端凭据提供程序，Fleet 授权为代理，因此不会提示用户连接。

## 更新您的 MCP 服务器 URL

> [!警告]
>
> 更改自定义 MCP 服务器的 URL 将破坏使用该服务器工具的任何代理。Fleet 通过 MCP 服务器 URL 存储工具引用。如果您更新自定义 MCP 服务器的 URL，现有代理在尝试调用这些工具时将会失败，因为存储的 URL 不再匹配。

要更新 MCP 服务器 URL：

1. 在工作区设置中更新您的 MCP 服务器 URL。
2. 对于使用该服务器中的工具的每个代理：
   * 从代理配置中删除受影响的工具。
   * 重新添加工具（它们现在将引用新的 URL）。
3. 测试代理以确认工具正常工作。

## 支持的服务器

要查看所有可用的 MCP 服务器和配置详细信息，请导航至 [Fleet > Integrations tab](https://smith.langchain.com/agents/tools)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/remote-mcp-servers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。