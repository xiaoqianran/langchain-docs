<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Isolate store data per user | https://docs.langchain.com/langsmith/store-auth -->

# 隔离每个用户的存储数据

每个[LangSmith Deployment](/langsmith/deployment)都包含一个Postgres支持的[store](/oss/python/langgraph/stores)，用于长期内存和跨线程数据。默认情况下，存储命名空间在所有调用者之间共享。要为每个用户提供自己的独立存储，请配置 [custom authentication](/langsmith/custom-auth) 并添加一个存储 [authorization handler](/langsmith/auth#authorization) ，该存储重写命名空间以包含经过身份验证的用户身份。

本指南展示了如何在 LangSmith 部署中配置该隔离。相同的模式适用于启用自定义身份验证的 [self-hosted](/langsmith/self-hosted) 部署。

## 它是如何工作的

存储项由 **命名空间** 元组（例如，`("memories", "preferences")`）和 **键** 组织。与线程和助手不同，存储命名空间是由您的应用程序定义的，因此授权的工作方式不同：

1. 您的 `@auth.authenticate` 处理程序验证调用者并为每个用户返回唯一的 `identity`。
2. 您的 `@auth.on.store` 处理程序要么 **验证** 命名空间是否以该标识开头，要么 **重写** 命名空间以将其添加到前面。
3. 服务器使用经过验证或重写的命名空间进行实际的读取或写入。通过自动前缀重写写入逻辑命名空间`("memories",)`的用户实际上将数据存储在`("user-123", "memories")`。其他用户无法读取或覆盖该数据，因为他们的请求范围仅限于 `("user-456", ...)`。

<Note>
存储授权处理程序接收一个 **可变** `value` 字典。对 `value["namespace"]` 的更改将对操作生效。您不会像为线程那样返回元数据过滤器。
</Note>

## 先决条件

- 配置了 [custom authentication](/langsmith/set-up-custom-auth) 的 LangSmith 部署。
- 一个 `@auth.authenticate` 处理程序，为每个最终用户返回稳定、唯一的 `identity`。

## 在 LangSmith 部署中配置身份验证

将您的部署指向 [⟦T18⟧](/langsmith/application-structure#configuration-file-concepts) 中的身份验证模块：

```json
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent/graph.py:graph"
  },
  "auth": {
    "path": "./src/security/auth.py:auth"
  }
}
```

`auth` 对象必须公开 `langgraph_sdk.Auth` 的实例（通常称为 `auth`）。

## 选择商店授权模式

存储隔离需要一个 `@auth.on.store` 处理程序。两种常见的模式效果很好；根据您希望用户范围界定所在的位置选择一个。|图案|用户范围在哪里设置 |最佳时间 |
| ---| ---| ---|
| **显式命名空间 + 拒绝** |应用程序代码将`user_id`放在每个命名空间中 |您已经将用户身份传递到图形代码中，或者您希望命名空间反映完整的存储路径 |
| **自动前缀重写** |身份验证处理程序将 `ctx.user.identity` 添加到逻辑命名空间 |您想要更简单的代理代码和 API 层的透明隔离 |

两种模式都使用单个 `@auth.on.store` 处理程序，涵盖所有存储操作（`put`、`get`、`search`、`delete` 和 `list_namespaces`）。如果您希望每个操作有不同的规则，则只需要特定于操作的处理程序，例如 `@auth.on.store.put`。

<Tip>
如果您使用拒绝未处理请求的全局 `@auth.on` 处理程序，请显式注册 `@auth.on.store` 以便允许存储操作。请参阅 [Auth reference](https://reference.langchain.com/python/langgraph-sdk/auth/Auth) 了解特定于操作的处理程序名称。
</Tip>

### 显式命名空间 + 拒绝

您的应用程序代码将用户身份包含为每个命名空间的第一段（例如，`("user-123", "memories")`）。身份验证处理程序验证调用者是否匹配该前缀并拒绝不匹配：

```python
from langgraph_sdk import Auth

auth = Auth()

# ... your @auth.authenticate handler ...

@auth.on.store
async def authorize_store(
    ctx: Auth.types.AuthContext,
    value: Auth.types.on.store.value,
):
    """Require the user identity as the first namespace segment."""
    namespace = tuple(value["namespace"])
    if not namespace or namespace[0] != ctx.user.identity:
        raise Auth.exceptions.HTTPException(
            status_code=403,
            detail="Not authorized to access this namespace.",
        )
```此模式使存储布局在图形代码中明确。如果经过身份验证的用户是 `user-123`，则对命名空间 `("user-456", "memories")` 的请求会立即失败。权衡是代理中的每个存储调用都必须包含用户前缀，通常来自运行时上下文，例如`config["configurable"]["langgraph_auth_user_id"]`。

### 自动前缀重写

您的应用程序代码使用不带用户前缀的逻辑命名空间（例如，`("memories", "preferences")`）。身份验证处理程序在每个存储操作上预先考虑经过身份验证的用户身份：

```python
from langgraph_sdk import Auth

auth = Auth()

# ... your @auth.authenticate handler ...

@auth.on.store
async def scope_store(
    ctx: Auth.types.AuthContext,
    value: Auth.types.on.store.value,
):
    """Isolate store data per user by rewriting namespaces."""
    namespace = tuple(value["namespace"]) if value.get("namespace") else ()
    if not namespace or namespace[0] != ctx.user.identity:
        namespace = (ctx.user.identity, *namespace)
    value["namespace"] = namespace
```

当客户端调用不带前缀的`list_namespaces`时，`value["namespace"]`为空。上面的处理程序将空命名空间视为 `(ctx.user.identity,)`，因此用户只能看到自己的命名空间。

这种模式使代理代码更加简单，因为身份验证层透明地处理用户隔离。权衡是您不能在应用程序代码中也添加命名空间前缀，否则您将双重作用域数据并中断读取。选择一个范围层：身份验证重写**或**应用程序级命名空间，而不是两者兼而有之。

## 在代理代码中使用命名空间如果您使用自动前缀重写，您的图形代码将使用不带用户前缀的逻辑命名空间。身份验证层在请求时自动添加用户范围。将以下内容放入图形节点或工具中（例如，`graph.py`）：

```python
from langgraph.store.base import BaseStore

async def save_preference(state: State, *, store: BaseStore):
    await store.aput(
        ("memories", "preferences"),  # logical namespace
        "settings",
        {"theme": "dark"},
    )

async def load_preference(state: State, *, store: BaseStore):
    item = await store.aget(
        ("memories", "preferences"),
        "settings",
    )
    return item.value if item else {}
```

当用户A调用store API时，服务器将数据持久化到`("user-a", "memories", "preferences")`。用户 B 的请求永远不会到达该命名空间。

如果您使用 **显式命名空间 + 拒绝**，请在图形代码中的每个命名空间中包含用户身份：

```python
from langchain_core.runnables import RunnableConfig
from langgraph.store.base import BaseStore

async def save_preference(state: State, *, store: BaseStore, config: RunnableConfig):
    user_id = config["configurable"]["langgraph_auth_user_id"]
    await store.aput(
        (user_id, "memories", "preferences"),
        "settings",
        {"theme": "dark"},
    )
```

### Deep Agents 和 StoreBackend

如果将 [Deep Agents](/oss/python/deepagents/overview) 与 [⟦T44⟧](https://reference.langchain.com/python/deepagents/backends/store/StoreBackend) 一起使用，请将命名空间工厂与 auth 范围的布局对齐。当 auth 前置 `ctx.user.identity` 时，在后端使用逻辑命名空间并让 auth 处理用户隔离：

```python
from deepagents.backends import StoreBackend

StoreBackend(
    namespace=lambda rt: ("memories",),  # auth adds user identity
)
```




或者，如果您在图表内按用户确定范围（例如，使用 `rt.server_info.user.identity`），请确保您的身份验证处理程序不会使用双前缀命名空间。选择一个范围层：身份验证重写**或**应用程序级命名空间，而不是两者兼而有之。

有关命名空间设计的更多信息，请参阅[Deep Agents backends](/oss/python/deepagents/backends#namespace-factories)和[user-scoped memory](/oss/python/deepagents/memory#user-scoped-memory)。

## 测试存储隔离

在 `langgraph dev` 运行并在身份验证处理程序中配置两个测试用户的情况下，验证存储数据不会在用户之间泄漏：

```python
import asyncio

from langgraph_sdk import get_client


async def main():
    alice = get_client(
        url="http://localhost:60058",
        headers={"Authorization": "Bearer user1-token"},
    )
    bob = get_client(
        url="http://localhost:60058",
        headers={"Authorization": "Bearer user2-token"},
    )

    # Alice writes a store item
    await alice.store.put_item(
        ["memories"],
        key="note",
        value={"text": "Alice private note"},
    )

    # Bob cannot read Alice's item
    bob_item = await bob.store.get_item(["memories"], key="note")
    if bob_item is None or bob_item["value"]["text"] != "Alice private note":
        print("✅ Bob correctly denied access to Alice's item")
    else:
        print("❌ Bob should not see Alice's store item")

    # Bob writes his own item at the same logical namespace
    await bob.store.put_item(
        ["memories"],
        key="note",
        value={"text": "Bob private note"},
    )

    alice_item = await alice.store.get_item(["memories"], key="note")
    bob_item = await bob.store.get_item(["memories"], key="note")
    assert alice_item["value"]["text"] == "Alice private note"
    assert bob_item["value"]["text"] == "Bob private note"
    print("✅ Each user sees only their own store data")


if __name__ == "__main__":
    asyncio.run(main())
```

## 与线程隔离结合存储隔离和[thread isolation](/langsmith/resource-auth)解决不同的问题：

|关注|机制|范围 |
| ---| ---| ---|
|对话历史 |线程元数据过滤器 (`owner`) |每线程检查点和消息 |
|长期记忆 |存储命名空间重写 |跨线程记忆、首选项和文档 |

对于多用户代理，请配置两者。有关线程和运行范围，请参阅 [Make conversations private](/langsmith/resource-auth)。

## 另请参阅

- [Authentication and access control](/langsmith/auth)
- [Set up custom authentication](/langsmith/set-up-custom-auth)
- [Make conversations private](/langsmith/resource-auth)
- [Semantic search in deployments](/langsmith/semantic-search)
- [LangGraph stores](/oss/python/langgraph/stores)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/store-auth.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>