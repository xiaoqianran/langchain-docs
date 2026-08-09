<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use server-side caching | https://docs.langchain.com/langsmith/caching -->

# 使用服务器端缓存

使用 stale-while-revalidate 和键值缓存 API 在代理部署中的服务器端缓存值。

[Agent Server](/langsmith/agent-server) 包含一个内置缓存，您可以在部署的图表中使用。使用密钥和加载器函数调用`swr`，服务器会缓存结果，在后台重新验证过时的条目，并在每次读取时返回新数据。

所有缓存 API **仅限服务器端**，并且需要 LangGraph Agent Server 运行时。值必须是 JSON 可序列化的。

<Note>
  `swr` 需要代理服务器运行时 **v0.7.79** 或更高版本，当前处于 **[beta](/langsmith/release-stages)**。
  `cache_get` 和 `cache_set` 需要 **v0.7.29** 或更高版本。
</Note>

## 快速开始

传递一个密钥和一个异步加载器函数。 `swr` 返回缓存值（如果可用），或者调用加载器来获取它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_sdk.cache import swr

result = await swr("config:global", load_config)
config_data = result.value
```

在第一次调用时，`swr`等待`load_config()`并缓存结果。在后续调用中，它会立即返回缓存的值并在后台重新验证。

## 配置新鲜度

控制缓存值被视为新鲜的时间以及过期时间：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from datetime import timedelta
from langgraph_sdk.cache import swr

result = await swr(
    "config:global",
    load_config,
    fresh_for=timedelta(minutes=5),
    max_age=timedelta(hours=1),
)
```|参数|默认|描述 |
| ----------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `fresh_for` | `timedelta(0)` |将缓存值视为新鲜值的持续时间。在此窗口期间，`swr` 返回缓存的值，无需重新验证。 |
| `max_age` | `timedelta(days=1)` |缓存条目的最大生命周期。此后，`swr`在返回之前阻塞加载器。上限为 1 天。       |

### 重新验证如何运作|缓存状态|状况 |行为 |
| ----------- | ---------------------------- | -------------------------------------------------------------------------- |
| **小姐** |密钥不在缓存中 |等待`loader()`，存储结果，返回它。                  |
| **新鲜** | `age < fresh_for` |返回缓存值，无需重新验证。                         |
| **陈旧** | `fresh_for <= age < max_age` |立即返回缓存值，触发后台刷新。 |
| **已过期** | `age >= max_age` |等待`loader()`，存储结果，返回它。                  |

## 与 Pydantic 模型一起使用

传递一个 `model` 参数来自动序列化和反序列化 Pydantic 模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from pydantic import BaseModel
from langgraph_sdk.cache import swr

class UserProfile(BaseModel):
    name: str
    email: str
    role: str

result = await swr(
    f"profile:{user_id}",
    lambda: fetch_profile(user_id),
    model=UserProfile,
)
profile: UserProfile = result.value  # deserialized automatically
```

`swr`在存储之前调用`model_dump(mode="json")`，在读回时调用`model.model_validate()`。

## 缓存身份验证凭据

您可以将凭证验证缓存在 [custom auth handler](/langsmith/custom-auth) 中，以避免每次请求时都影响您的身份提供者：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from datetime import timedelta
from langgraph_sdk import Auth
from langgraph_sdk.cache import swr

auth = Auth()

@auth.authenticate
async def authenticate(headers: dict) -> Auth.types.MinimalUserDict:
    token = (headers.get(b"authorization") or b"").decode()
    if not token:
        raise Auth.exceptions.HTTPException(status_code=401, detail="Missing token")

    result = await swr(
        f"auth:token:{token}",
        lambda: validate_and_fetch_user(token),
        fresh_for=timedelta(minutes=5),
        max_age=timedelta(hours=1),
    )
    return result.value
```

通过此设置，服务器将返回缓存的用户 5 分钟而不重新验证，然后在后台重新验证长达 1 小时。 1 小时后，下一个请求将被阻塞，直到 `validate_and_fetch_user` 完成。

## 检查缓存状态`swr` 返回一个 `SWRResult` 对象，其中包含值和缓存状态：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
result = await swr("my-key", my_loader)

result.value   # the cached or freshly loaded value
result.status  # "miss" | "fresh" | "stale" | "expired"
```

调用 `.mutate()` 更新缓存值或强制重新验证：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
await result.mutate(new_value)  # update the cache with a new value
await result.mutate()           # force revalidation by calling the loader
```

## 低级缓存API

对于无需重新验证的简单获取/设置缓存，请直接使用 `cache_get` 和 `cache_set`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from datetime import timedelta
from langgraph_sdk.cache import cache_get, cache_set

value = await cache_get("my-key")

if value is None:
    value = await expensive_computation()
    await cache_set("my-key", value, ttl=timedelta(hours=1))
```

### `cache_get`

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def cache_get(key: str) -> Any | None
```

返回反序列化的值，如果密钥不存在或已过期，则返回 `None`。

### `cache_set`

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def cache_set(key: str, value: Any, *, ttl: timedelta | None = None) -> None
```

|参数|类型 |默认 |描述 |
| ---------| ------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `key` | `str` |必填|缓存键 |
| `value` | `Any` |必填|要缓存的值。必须是 JSON 可序列化的 |
| `ttl` | `timedelta \| None` | `None` |生存时间。服务器的上限为 1 天。 `None` 或零默认为 1 天 |

## 后续步骤

* [Add custom authentication](/langsmith/custom-auth) 到您的部署。
* [Add custom lifespan events](/langsmith/custom-lifespan) 在服务器启动时初始化资源。
* 了解[agent server architecture](/langsmith/agent-server)。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/caching.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>