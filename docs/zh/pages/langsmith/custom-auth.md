<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Add custom authentication | https://docs.langchain.com/langsmith/custom-auth -->

# 添加自定义认证

本指南向您展示如何向您的 LangSmith 应用程序添加自定义身份验证。此页面上的步骤适用于 [cloud](/langsmith/cloud) 和 [self-hosted](/langsmith/self-hosted) 部署。它不适用于在您自己的自定义服务器中单独使用[LangGraph open source library](/oss/python/langgraph/overview)。

## 将自定义身份验证添加到您的部署中

要在部署中利用自定义身份验证并访问用户级元数据，请设置自定义身份验证以通过自定义身份验证处理程序自动填充 `config["configurable"]["langgraph_auth_user"]` 对象。然后，您可以使用 `langgraph_auth_user` 键到 [allow an agent to perform authenticated actions on behalf of the user](#enable-agent-authentication) 访问图中的该对象。

1、实施认证：

    <Note>
    如果没有自定义 `@auth.authenticate` 处理程序，LangGraph 只能看到 API 密钥所有者（通常是开发人员），因此请求的范围不限于单个最终用户。要传播自定义令牌，您必须实现自己的处理程序。
    </Note>

    ```python
    from langgraph_sdk import Auth
    import requests

    auth = Auth()

    def is_valid_key(api_key: str) -> bool:
        is_valid = # your API key validation logic
        return is_valid

    @auth.authenticate # (1)!
    async def authenticate(headers: dict) -> Auth.types.MinimalUserDict:
        api_key = headers.get(b"x-api-key")
        if not api_key or not is_valid_key(api_key):
            raise Auth.exceptions.HTTPException(status_code=401, detail="Invalid API key")

        # Fetch user-specific tokens from your secret store
        user_tokens = await fetch_user_tokens(api_key)

        return { # (2)!
            "identity": api_key,  #  fetch user ID from LangSmith
            "github_token" : user_tokens.github_token
            "jira_token" : user_tokens.jira_token
            # ... custom fields/secrets here
        }
    ```
  - 该处理程序接收请求（标头等），验证用户，并返回至少包含一个身份字段的字典。
  - 您可以添加任何所需的自定义字段（例如，OAuth 令牌、角色、组织 ID 等）。

2. 在您的[⟦T12⟧](/langsmith/application-structure#configuration-file)中，添加您的身份验证文件的路径：```json highlight={7-9}
    {
        "dependencies": ["."],
        "graphs": {
        "agent": "./agent.py:graph"
        },
        "env": ".env",
        "auth": {
            "path": "./auth.py:my_auth"
        }
    }
    ```
3. 在服务器中设置身份验证后，请求必须包含基于您选择的方案所需的授权信息。假设您使用 JWT 令牌身份验证，您可以使用以下任一方法访问您的部署：

    <Tabs>
        <Tab title="Python Client">
      ```python
      from langgraph_sdk import get_client

      my_token = "your-token" # In practice, you would generate a signed token with your auth provider
      client = get_client(
          url="http://localhost:2024",
          headers={"Authorization": f"Bearer {my_token}"}
      )
      threads = await client.threads.search()
      ```
        </Tab>
        <Tab title="Python RemoteGraph">
      ```python
      from langgraph.pregel.remote import RemoteGraph

      my_token = "your-token" # In practice, you would generate a signed token with your auth provider
      remote-graph = RemoteGraph(
          "agent",
          url="http://localhost:2024",
          headers={"Authorization": f"Bearer {my_token}"}
      )
      threads = await remote-graph.ainvoke(...)
      ```
        </Tab>
        <Tab title="JavaScript Client">
      ```javascript
      import { Client } from "@langchain/langgraph-sdk";

      const my_token = "your-token"; // In practice, you would generate a signed token with your auth provider
      const client = new Client({
      apiUrl: "http://localhost:2024",
      defaultHeaders: { Authorization: `Bearer ${my_token}` },
      });
      const threads = await client.threads.search();
      ```
        </Tab>
        <Tab title="JavaScript RemoteGraph">
      ```javascript
      import { RemoteGraph } from "@langchain/langgraph/remote";

      const my_token = "your-token"; // In practice, you would generate a signed token with your auth provider
      const remoteGraph = new RemoteGraph({
      graphId: "agent",
      url: "http://localhost:2024",
      headers: { Authorization: `Bearer ${my_token}` },
      });
      const threads = await remoteGraph.invoke(...);
      ```
        </Tab>
        <Tab title="cURL">
      ```bash
      curl -H "Authorization: Bearer ${your-token}" http://localhost:2024/threads
      ```
        </Tab>
    </Tabs>

    有关 RemoteGraph 的更多详细信息，请参阅 [Use RemoteGraph](/langsmith/use-remote-graph) 指南。

## 启用代理身份验证

在[authentication](#add-custom-authentication-to-your-deployment)之后，平台创建一个特殊的配置对象（`config`），并传递给LangSmith部署。该对象包含有关当前用户的信息，包括从 `@auth.authenticate` 处理程序返回的任何自定义字段。

要允许代理代表用户执行经过身份验证的操作，请使用 `langgraph_auth_user` 键访问图中的此对象：

```python
def my_node(state, config):
    user_config = config["configurable"].get("langgraph_auth_user")
    # token was resolved during the @auth.authenticate function
    token = user_config.get("github_token","")
    ...
```

<Note>
从安全秘密存储中获取用户凭据。不建议以图状态存储机密。
</Note>

### 授权用户使用 Studio默认情况下，如果您在资源上添加自定义授权，这也将适用于通过 [Studio](/langsmith/studio) 进行的交互。如果需要，您可以通过检查[is_studio_user()](https://langchain-ai.github.io/langgraph/cloud/reference/sdk/python_sdk_ref/#langgraph_sdk.auth.types.StudioUser)以不同方式处理登录的 Studio 用户。

<Note>
`is_studio_user` 是在 langgraph-sdk 0.1.73 版本中添加的。如果您使用的是旧版本，您仍然可以检查是否`isinstance(ctx.user, StudioUser)`。
</Note>

```python
from langgraph_sdk.auth import is_studio_user, Auth
auth = Auth()

# ... Setup authenticate, etc.

@auth.on
async def add_owner(
    ctx: Auth.types.AuthContext,
    value: dict  # The payload being sent to this access method
) -> dict:  # Returns a filter dict that restricts access to resources
    if is_studio_user(ctx.user):
        return {}

    filters = {"owner": ctx.user.identity}
    metadata = value.setdefault("metadata", {})
    metadata.update(filters)
    return filters
```

仅当您希望允许开发人员访问部署在托管 LangSmith SaaS 上的图表时才使用此选项。

## 了解更多

* [Authentication & Access Control](/langsmith/auth)
* [Setting up custom authentication tutorial](/langsmith/set-up-custom-auth)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>