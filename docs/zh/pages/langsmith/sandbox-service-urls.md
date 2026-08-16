<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox service URLs | https://docs.langchain.com/langsmith/sandbox-service-urls -->

# 沙盒服务 URL

服务 URL 允许您访问沙箱内运行的 HTTP 服务（REST API、Streamlit 应用程序、Jupyter 笔记本、API 文档），而无需隧道、端口转发或 CLI 工具。每个沙箱 + 端口组合都有自己的 URL，您可以在浏览器中打开该 URL、从代码中调用或与团队成员共享。

![Service URLs view](/images/langsmith/sandboxes/sb-service-feature.png)

## 快速开始

在沙箱内启动 HTTP 服务器，然后获取 URL 来访问它：

```python
from langsmith.sandbox import SandboxClient

client = SandboxClient()

with client.sandbox() as sb:
    handle = sb.run("python -m http.server 8000", timeout=0, wait=False)

    svc = sb.service(port=8000)

    # Open in a browser
    print(svc.browser_url)

    # Or make requests programmatically
    resp = svc.get("/")
    print(resp.status_code)

    handle.kill()
```

## 用例

|场景|如何|
|----------|-----|
|预览 Web 应用程序（Streamlit、Jupyter 等）| `sb.service(port=<PORT>)` 然后打开`browser_url` |
|从代码或 CI 调用 API | `svc.get(...)` / `svc.post(...)` 或 `curl` 以及服务令牌 |
|与队友分享现场演示 |单击 UI 中的 **共享链接** 并发送 URL |

## 从 UI 打开服务

1. 打开沙箱详情页面。
2. 找到**开放服务**小部件。
3. 输入端口号（例如 `3000`）。
4. 单击“**打开**”在新选项卡中启动，或“**共享链接**”复制可发送给团队成员的 URL。

任何知道该链接的人都可以访问该服务，即使没有 LangSmith 帐户。令牌过期后，从 UI 生成新链接。

## 从 SDK 中打开服务

### 获取服务 URL在沙箱实例上或直接在客户端上调用`service()`：

```python
svc = sb.service(port=3000)

# Or from the client, by sandbox name
svc = client.service("my-sandbox", port=3000)

# Customize token lifetime (default: 10 minutes, max: 24 hours)
svc = sb.service(port=3000, expires_in_seconds=3600)
```

<Note>
在请求服务 URL 之前，该服务必须正在运行并侦听指定端口。该 URL 仅路由流量，不会为您启动服务。
</Note>

### 提出请求

返回的 `ServiceURL` 对象具有内置的 HTTP 帮助器，可以自动处理身份验证。令牌在过期前透明刷新，因此无需手动管理。

```python
svc = sb.service(port=8000)

resp = svc.get("/api/items")
resp = svc.post("/api/items", json={"name": "widget"})
resp = svc.put("/api/items/1", json={"name": "updated"})
resp = svc.patch("/api/items/1", json={"status": "active"})
resp = svc.delete("/api/items/1")
```

### 使用您自己的 HTTP 客户端

如果您更喜欢不同的 HTTP 客户端，请使用原始 URL 和令牌：

```python
import httpx

svc = sb.service(port=8000)

resp = httpx.get(
    svc.service_url + "api/items",
    headers={"X-Langsmith-Sandbox-Service-Token": svc.token},
)
```

### 在浏览器中打开

使用`browser_url`在浏览器中打开服务。它会自动设置身份验证 cookie，因此所有后续页面加载、图像和 API 调用都将在 URL 中无需令牌的情况下进行身份验证。

```python
svc = sb.service(port=8000)
print(svc.browser_url)
```

您可以与队友共享此 URL。无需 LangSmith 登录即可访问它。

### 通过 REST API 生成 URL

```bash
curl -X POST \
  "$LANGSMITH_ENDPOINT/api/v2/sandboxes/boxes/{sandbox_name}/service-url" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"port": 3000, "expires_in_seconds": 3600}'
```

回应：

```json
{
  "browser_url": "https://{sandbox-id}--3000.smithbox.dev/_svc/auth?token=ey...",
  "service_url": "https://{sandbox-id}--3000.smithbox.dev/",
  "token": "ey...",
  "expires_at": "2026-04-08T15:30:00Z"
}
```

## 示例：提供 FastAPI 应用程序

```python
from langsmith.sandbox import SandboxClient

client = SandboxClient()

with client.sandbox() as sb:
    sb.write("/app/main.py", """
from fastapi import FastAPI

app = FastAPI()
items = []

@app.get("/items")
def list_items():
    return items

@app.post("/items")
def create_item(item: dict):
    items.append(item)
    return item
""")

    sb.run("pip install fastapi uvicorn", timeout=120)
    handle = sb.run(
        "uvicorn main:app --host 0.0.0.0 --port 8000",
        timeout=0,
        wait=False,
        env={"PYTHONPATH": "/app"},
    )

    import time
    time.sleep(3)

    svc = sb.service(port=8000)

    svc.post("/items", json={"name": "widget", "price": 9.99})
    svc.post("/items", json={"name": "gadget", "price": 24.99})

    resp = svc.get("/items")
    print(resp.json())
    # [{"name": "widget", "price": 9.99}, {"name": "gadget", "price": 24.99}]

    # Open the auto-generated API docs in a browser
    print(svc.browser_url)

    handle.kill()
```

## 服务 URL 与 TCP 隧道| |服务网址 | TCP 隧道 |
|---|---|---|
| **协议** | HTTP |任何 TCP（数据库、Redis、SSH、HTTP）|
| **设置** |零 — 只是一个 URL |需要 SDK 或 CLI |
| **访问自** |浏览器、脚本、CI，随处可见 |仅限本地机器 |
| **分享** |复制网址并发送 |不可分享 |
| **多页网络应用程序** |全面支持（子域路由） |全面支持（本地端口）|
| **非 HTTP 服务** |不支持 |全力支持 |

将 **服务 URL** 用于您想要从浏览器访问或与其他人共享的 HTTP 服务。对于非 HTTP 协议（​​如 `psql` 或 `redis-cli`）或需要仅本地访问时，请使用 **[TCP tunnels](/langsmith/sandbox-sdk#tcp-tunnels-python)**。

## 故障排除

|错误 |原因 |修复 |
|--------|--------|-----|
| **“服务链接已过期”** |超过令牌生命周期 |从 LangSmith 再次打开服务或致电 `sb.service()` 获取新的 URL |
| **“服务无法访问”** |没有任何东西正在监听该端口 |验证服务器是否在沙箱内运行 |
| **“需要身份验证”** |标头或 cookie 中没有令牌 |使用`browser_url`进行浏览器访问或设置`X-Langsmith-Sandbox-Service-Token`标头 |

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-service-urls.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>