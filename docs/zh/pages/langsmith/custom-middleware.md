<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to add custom middleware | https://docs.langchain.com/langsmith/custom-middleware -->

# 如何添加自定义中间件

将代理部署到 LangSmith 时，您可以向服务器添加自定义中间件，以处理诸如记录请求指标、注入或检查标头以及执行安全策略等问题，而无需修改核心服务器逻辑。这与 [adding custom routes](/langsmith/custom-routes) 的工作方式相同。您只需提供自己的[⟦T5⟧](https://www.starlette.io/applications/)应用程序（包括[⟦T6⟧](https://fastapi.tiangolo.com/)、[⟦T7⟧](https://fastht.ml/)及其他兼容应用程序）。

通过添加中间件，您可以在整个部署中全局拦截和修改请求和响应，无论它们是访问您的自定义端点还是内置的 LangSmith API。

下面是使用 FastAPI 的示例。

<Note>
“仅限Python”
我们目前仅支持使用 `langgraph-api>=0.0.26` 进行 Python 部署中的自定义中间件。
</Note>

## 创建应用程序

从 **现有** LangSmith 应用程序开始，将以下中间件代码添加到您的 `webapp.py` 文件中。如果您是从头开始，则可以使用 CLI 从模板创建新应用程序。

```bash
langgraph new --template=new-langgraph-project-python my_new_project
```

一旦您有了 LangGraph 项目，请添加以下应用程序代码：

```python {highlight={5}}
# ./src/agent/webapp.py
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

class CustomHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers['X-Custom-Header'] = 'Hello from middleware!'
        return response

# Add the middleware to the app
app.add_middleware(CustomHeaderMiddleware)
```

## 配置`langgraph.json`

将以下内容添加到您的 `langgraph.json` 配置文件中。确保路径指向您上面创建的 `webapp.py` 文件。

```json
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent/graph.py:graph"
  },
  "env": ".env",
  "http": {
    "app": "./src/agent/webapp.py:app"
  }
  // Other configuration options like auth, store, etc.
}
```

### 自定义中间件排序默认情况下，自定义中间件在身份验证逻辑之前运行。要在身份验证后运行自定义中间件，请在 `http` 配置中将 `middleware_order` 设置为 `auth_first`。 （从 API 服务器 v0.4.35 及更高版本开始支持此自定义。）

```json
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent/graph.py:graph"
  },
  "env": ".env",
  "http": {
    "app": "./src/agent/webapp.py:app",
    "middleware_order": "auth_first"
  },
  "auth": {
    "path": "./auth.py:my_auth"
  }
}
```

## 启动服务器

在本地测试服务器：

```bash
langgraph dev --no-browser
```

现在，对服务器的任何请求都将在其响应中包含自定义标头 `X-Custom-Header`。

## 部署

您可以将此应用程序按原样部署到云或您的自托管平台。

## 后续步骤

现在您已将自定义中间件添加到部署中，您可以使用类似的技术添加 [custom routes](/langsmith/custom-routes) 或定义 [custom lifespan events](/langsmith/custom-lifespan) 来进一步自定义服务器的行为。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-middleware.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>