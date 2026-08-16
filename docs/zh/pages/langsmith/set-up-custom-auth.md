<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up custom authentication | https://docs.langchain.com/langsmith/set-up-custom-auth -->

# 设置自定义身份验证

在本教程中，我们将构建一个只允许特定用户访问的聊天机器人。我们将从 LangGraph 模板开始，逐步添加基于令牌的安全性。最后，您将拥有一个工作聊天机器人，它会在允许访问之前检查有效令牌。

这是我们的身份验证系列的第 1 部分：

1. 设置自定义身份验证（您在此处）- 控制谁可以访问您的机器人
2. [Make conversations private](/langsmith/resource-auth) - 让用户进行私人对话
3. [Connect an authentication provider](/langsmith/add-auth-server) - 添加真实用户帐户并使用 OAuth2 进行生产验证

本指南假设您基本熟悉以下概念：

* [**Authentication & Access Control**](/langsmith/auth)
* [**LangSmith**](/langsmith/observability)

<Note>
自定义身份验证仅适用于 LangSmith SaaS 部署或企业自托管部署。
</Note>

## 1. 创建您的应用程序

使用 LangGraph 入门模板创建一个新的聊天机器人：

<CodeGroup>
```bash pip
pip install -U "langgraph-cli[inmem]"
langgraph new --template=new-langgraph-project-python custom-auth
cd custom-auth
```

```bash uv
uv add "langgraph-cli[inmem]"
langgraph new --template=new-langgraph-project-python custom-auth
cd custom-auth
```
</CodeGroup>

该模板为我们提供了一个占位符 LangGraph 应用程序。通过安装本地依赖项并运行开发服务器来尝试一下：

<CodeGroup>
```bash pip
pip install -e .
langgraph dev
```

```bash uv
uv add .
langgraph dev
```

```bash npm
npx @langchain/langgraph-cli dev
```
</CodeGroup>

服务器将启动并在浏览器中打开[Studio](/langsmith/studio)：

```
> - 🚀 API: http://127.0.0.1:2024
> - 🎨 Studio UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
> - 📚 API Docs: http://127.0.0.1:2024/docs
>
> This in-memory server is designed for development and testing.
> For production use, please use LangSmith.
```

如果您要在公共互联网上自行托管此内容，则任何人都可以访问它。

![No authentication: the dev server is publicly reachable, anyone can access the bot if exposed to the internet.](/langsmith/images/no-auth.png)

## 2.添加认证现在您已经有了一个基本的 LangGraph 应用程序，请为其添加身份验证。

<Note>
在本教程中，您将从硬编码令牌开始进行示例。您将在第三个教程中获得“生产就绪”的身份验证方案。
</Note>

[Auth](https://reference.langchain.com/python/langgraph-sdk/auth/Auth) 对象允许您注册一个身份验证功能，LangSmith 部署将在每个请求上运行该功能。该函数接收每个请求并决定是接受还是拒绝。

创建一个新文件`src/security/auth.py`。这是您的代码所在的位置，用于检查用户是否被允许访问您的机器人：

```python {highlight={10,15-16}} title="src/security/auth.py"
from langgraph_sdk import Auth

# This is our toy user database. Do not do this in production
VALID_TOKENS = {
    "user1-token": {"id": "user1", "name": "Alice"},
    "user2-token": {"id": "user2", "name": "Bob"},
}

# The "Auth" object is a container that LangGraph will use to mark our authentication function
auth = Auth()


# The `authenticate` decorator tells LangGraph to call this function as middleware
# for every request. This will determine whether the request is allowed or not
@auth.authenticate
async def get_current_user(authorization: str | None) -> Auth.types.MinimalUserDict:
    """Check if the user's token is valid."""
    assert authorization
    scheme, token = authorization.split()
    assert scheme.lower() == "bearer"
    # Check if token is valid
    if token not in VALID_TOKENS:
        raise Auth.exceptions.HTTPException(status_code=401, detail="Invalid token")

    # Return user info if valid
    user_data = VALID_TOKENS[token]
    return {
        "identity": user_data["id"],
    }
```

请注意，您的 [Auth.authenticate](https://reference.langchain.com/python/langgraph-sdk/auth/Auth/authenticate) 处理程序做了两件重要的事情：

1. 检查请求的[Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)中是否提供了有效的令牌
2.返回用户的[MinimalUserDict](https://reference.langchain.com/python/langgraph-sdk/auth/types/MinimalUserDict)

现在通过将以下内容添加到 [langgraph.json](https://reference.langchain.com/python/cloud/reference/cli/#configuration-file) 配置来告诉 LangGraph 使用身份验证：

```json {highlight={7-9}} title="langgraph.json"
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent/graph.py:graph"
  },
  "env": ".env",
  "auth": {
    "path": "src/security/auth.py:auth"
  }
}
```

## 3. 测试你的机器人

再次启动服务器以测试一切：

```bash
langgraph dev --no-browser
```

如果您没有添加 `--no-browser`，Studio UI 将在浏览器中打开。默认情况下，即使使用自定义身份验证，我们也允许从 Studio 进行访问。这使得在 Studio 中开发和测试您的机器人变得更加容易。您可以通过在身份验证配置中设置 `disable_studio_auth: true` 来删除此替代身份验证选项：

```json
{
    "auth": {
        "path": "src/security/auth.py:auth",
        "disable_studio_auth": true
    }
}
```## 4. 与您的机器人聊天

现在，只有在请求标头中提供有效令牌的情况下，您才应该能够访问机器人。但是，用户仍然能够访问彼此的资源，直到您在本教程的下一部分中添加 [resource authorization handlers](/langsmith/auth#resource-specific-handlers)。

![Auth gate passes requests with a valid token, but no per-resource filters are applied yet—so users share visibility until authorization handlers are added in the next step.](/langsmith/images/authentication.png)

在文件或笔记本中运行以下代码：

```python
import asyncio

from langgraph_sdk import get_client


async def main():
    # Try without a token (should fail)
    client = get_client(url="http://localhost:2024")
    try:
        thread = await client.threads.create()
        print("❌ Should have failed without token!")
    except Exception as e:
        print("✅ Correctly blocked access:", e)

    # Try with a valid token
    client = get_client(
        url="http://localhost:2024", headers={"Authorization": "Bearer user1-token"}
    )

    # Create a thread and chat
    thread = await client.threads.create()
    print(f"✅ Created thread as Alice: {thread['thread_id']}")

    response = await client.runs.create(
        thread_id=thread["thread_id"],
        assistant_id="agent",
        input={"messages": [{"role": "user", "content": "Hello!"}]},
    )
    print("✅ Bot responded:")
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
```

你应该看到：

1.没有有效的令牌，我们无法访问机器人
2.有了有效的token，我们就可以创建话题并聊天了

恭喜！您已经构建了一个只允许“经过身份验证”的用户访问的聊天机器人。虽然该系统（尚未）实现生产就绪的安全方案，但我们已经了解了如何控制对机器人的访问的基本机制。在下一个教程中，我们将学习如何为每个用户提供自己的私人对话。

## 后续步骤

现在您可以控制谁访问您的机器人，您可能想要：

1. 继续教程，前往[Make conversations private](/langsmith/resource-auth)了解资源授权。
2. 了解更多关于[authentication concepts](/langsmith/auth)的信息。
3. 查看 [Auth](https://reference.langchain.com/python/langgraph-sdk/auth/Auth)、[Auth.authenticate](https://reference.langchain.com/python/langgraph-sdk/auth/Auth/authenticate) 和 [MinimalUserDict](https://reference.langchain.com/python/langgraph-sdk/auth/types/MinimalUserDict) 的 API 参考，了解更多身份验证详细信息。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/set-up-custom-auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>