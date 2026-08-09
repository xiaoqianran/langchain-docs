<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up Agent Auth | https://docs.langchain.com/langsmith/agent-auth -->

# 设置代理验证

使用 OAuth 2.0 凭证和代理身份验证，启用代理对任何系统的安全访问。

<Note>Agent Auth 处于 **[beta](/langsmith/release-stages)** 状态并正在积极开发中。要提供反馈或使用此功能，请联系 [LangChain team](https://forum.langchain.com/c/help/langsmith/).</Note>

## 安装

<Tabs>
  <Tab title="Python">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langchain-auth
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-auth
      ```
    </CodeGroup>
  </Tab>

  <Tab title="JavaScript">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install @langchain/auth
    ```
  </Tab>
</Tabs>

## 快速入门

### 1.初始化客户端

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain_auth import Client

    client = Client(api_key="your-langsmith-api-key")
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from '@langchain/auth';

    const client = new Client({ apiKey: 'your-langsmith-api-key' });
    ```
  </Tab>
</Tabs>

#### 自托管配置

对于自托管 LangSmith 实例，请使用实例上的 `/api-host` 路径指定 API URL。

<Tabs>
  <Tab title="Environment Variable">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export LANGSMITH_API_URL="https://your-langsmith-instance.com/api-host"
    ```

    然后正常初始化客户端：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    client = Client(api_key="your-langsmith-api-key")
    ```
  </Tab>

  <Tab title="Explicit Configuration (Python)">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    client = Client(
        api_key="your-langsmith-api-key",
        api_url="https://your-langsmith-instance.com/api-host"
    )
    ```
  </Tab>

  <Tab title="Explicit Configuration (JavaScript)">
    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const client = new Client({
        apiKey: 'your-langsmith-api-key',
        apiUrl: 'https://your-langsmith-instance.com/api-host'
    });
    ```
  </Tab>
</Tabs>

### 2. 设置 OAuth 提供程序

在代理进行身份验证之前，您需要使用以下过程配置 OAuth 提供程序：

1. 为您的 OAuth 提供商选择一个在 LangChain 平台中使用的唯一标识符（例如“github-local-dev”、“google-workspace-prod”）。

2. 转到 OAuth 提供商的开发人员控制台并创建新的 OAuth 应用程序。

3. 在 OAuth 提供程序中设置回调 URL：

<Tabs>
  <Tab title="LangSmith Cloud">
    ```
    https://smith.langchain.com/host-oauth-callback/{provider_id}
    ```例如，如果您的提供商\_id 是“github-local-dev”，请使用：

    ```
    https://smith.langchain.com/host-oauth-callback/github-local-dev
    ```
  </Tab>

  <Tab title="Self-hosted">
    ```
    https://{your-langsmith-instance}/host-oauth-callback/{provider_id}
    ```

    例如，如果您的实例是 `langsmith.example.com` 并且provider\_id 是“github”，请使用：

    ```
    https://langsmith.example.com/host-oauth-callback/github
    ```
  </Tab>
</Tabs>

4. 将 `client.create_oauth_provider()` 与 OAuth 应用程序中的凭据结合使用：

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    new_provider = await client.create_oauth_provider(
        provider_id="{provider_id}",  # Provide any unique ID
        name="{provider_display_name}",  # Provide any display name
        client_id="{your_client_id}",
        client_secret="{your_client_secret}",
        auth_url="{auth_url_of_your_provider}",
        token_url="{token_url_of_your_provider}",
    )
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const newProvider = await client.createOAuthProvider({
        providerId: '{provider_id}',  // Provide any unique ID
        name: '{provider_display_name}',  // Provide any display name
        clientId: '{your_client_id}',
        clientSecret: '{your_client_secret}',
        authUrl: '{auth_url_of_your_provider}',
        tokenUrl: '{token_url_of_your_provider}',
    });
    ```
  </Tab>
</Tabs>

### 3. 通过代理进行身份验证

客户端 `authenticate()` API 用于从预配置的提供商获取 OAuth 令牌。在第一次调用时，它会引导调用者通过 OAuth 2.0 身份验证流程。

#### 在 LangGraph 上下文中

默认情况下，令牌的范围仅限于使用助理 ID 参数的呼叫代理。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
auth_result = await client.authenticate(
    provider="{provider_id}",
    scopes=["scopeA"],
    user_id="your_user_id"  # Any unique identifier to scope this token to the human caller
)

# Or explicitly specify an agent_id for agent-scoped tokens
auth_result = await client.authenticate(
    provider="{provider_id}",
    scopes=["scopeA"],
    user_id="your_user_id",
    agent_id="specific-agent-id"  # Optional: explicitly set agent scope
)
```

执行过程中，如果需要认证，SDK会抛出[interrupt](/langsmith/add-human-in-the-loop)。代理执行暂停并向用户显示 OAuth URL：

<Frame>
  <img />
</Frame>

用户完成 OAuth 身份验证并且我们收到提供商的回调后，他们将看到身份验证成功页面。

<Frame>
  <img />
</Frame>

然后，代理从中断处恢复执行，并且令牌可用于任何 API 调用。我们存储和刷新 OAuth 令牌，以便用户或代理将来使用该服务时不需要 OAuth 流程。```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
token = auth_result.token
```

#### LangGraph 上下文之外

向用户提供带外 OAuth 流的 `auth_url`。

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    auth_result = await client.authenticate(
        provider="{provider_id}",
        scopes=["scopeA"],
        user_id="your_user_id"
    )

    if auth_result.status == "pending":
        print(f"Complete OAuth at: {auth_result.url}")
        # Wait for user to complete OAuth
        completed_auth = await client.wait_for_completion(auth_result.auth_id)
        print("Authentication completed!")
    else:
        token = auth_result.token
        print(f"Already authenticated, token: {token}")
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    const authResult = await client.authenticate({
        provider: '{provider_id}',
        scopes: ['scopeA'],
        userId: 'your_user_id'
    });

    if (authResult.status === 'pending') {
        console.log(`Complete OAuth at: ${authResult.authUrl}`);
        // Wait for user to complete OAuth
        const completedAuth = await client.waitForCompletion(authResult.authId);
        console.log('Authentication completed!');
    } else {
        const token = authResult.token;
        console.log(`Already authenticated, token: ${token}`);
    }
    ```
  </Tab>
</Tabs>

## 故障排除

### 自托管：405 方法不允许

如果您收到 `405 Method Not Allowed` 错误，请确保 `LANGSMITH_API_URL` 指向 `/api-host` 路径：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_URL="https://your-instance.com/api-host"
```

### 自托管：格式错误的 OAuth 回调 URL

确保您的 OAuth 提供商的重定向 URI 与您的 LangSmith 实例 URL 匹配：

```
https://your-instance.com/host-oauth-callback/{provider_id}
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/agent-auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>