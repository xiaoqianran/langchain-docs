<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to add custom lifespan events | https://docs.langchain.com/langsmith/custom-lifespan -->

# 如何添加自定义生命周期事件

将代理部署到 LangSmith 时，您通常需要在服务器启动时初始化数据库连接等资源，并确保它们在服务器关闭时正确关闭。生命周期事件可让您连接到服务器的启动和关闭序列来处理这些关键的设置和拆卸任务。

这与 [adding custom routes](/langsmith/custom-routes) 的工作方式相同。您只需提供自己的[⟦T4⟧](https://www.starlette.io/applications/)应用程序（包括[⟦T5⟧](https://fastapi.tiangolo.com/)、[⟦T6⟧](https://fastht.ml/)及其他兼容应用程序）。

下面是使用 FastAPI 的示例。

<Note>
  “仅限Python”
  目前，我们仅支持使用 `langgraph-api>=0.0.26` 进行 Python 部署中的自定义生命周期事件。
</Note>

## 创建应用程序

从 **现有** LangSmith 应用程序开始，将以下生命周期代码添加到您的 `webapp.py` 文件中。如果您是从头开始，则可以使用 CLI 从模板创建新应用程序。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph new --template=new-langgraph-project-python my_new_project
```

拥有 LangGraph 项目后，添加以下应用程序代码：

```python {highlight={19}} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# ./src/agent/webapp.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

@asynccontextmanager
async def lifespan(app: FastAPI):
    # for example...
    engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
    # Create reusable session factory
    async_session = sessionmaker(engine, class_=AsyncSession)
    # Store in app state
    app.state.db_session = async_session
    yield
    # Clean up connections
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

# ... can add custom routes if needed.
```

## 配置`langgraph.json`

将以下内容添加到您的 `langgraph.json` 配置文件中。确保路径指向您上面创建的 `webapp.py` 文件。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

## 启动服务器

在本地测试服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph dev --no-browser
```当服务器启动时，您应该看到打印的启动消息，当您使用 `Ctrl+C` 停止服务器时，您应该看到打印的清理消息。

## 部署

您可以将应用程序按原样部署到云或自托管平台。

## 后续步骤

现在您已将生命周期事件添加到部署中，您可以使用类似的技术添加 [custom routes](/langsmith/custom-routes) 或 [custom middleware](/langsmith/custom-middleware) 来进一步自定义服务器的行为。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-lifespan.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>