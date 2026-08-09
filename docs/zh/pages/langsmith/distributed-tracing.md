<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Implement distributed tracing | https://docs.langchain.com/langsmith/distributed-tracing -->

# 实现分布式追踪

有时，您需要跨多个服务跟踪请求。

LangSmith 支持开箱即用的分布式跟踪，使用上下文传播标头（元数据/标签的`langsmith-trace`和可选的`baggage`）在跨服务的跟踪中链接运行。

客户端-服务器设置示例：

* 跟踪在客户端启动
* 在服务器上继续

<Warning>
  **仅接受来自可信服务的分布式跟踪标头。** `langsmith-trace` 和 `baggage` 标头用作可信跟踪上下文。不要在直接从不受信任的第三方或公共互联网接收请求的服务上添加`TracingMiddleware`（或传递入站请求标头作为跟踪`parent`）。保持对内部、服务到服务调用的分布式跟踪，并从网关或代理处不受信任的入站请求中剥离这些标头。信任来自外部呼叫者的`baggage`，可以让他们影响您的跑步记录方式。
</Warning>

## Python 中的分布式跟踪

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# client.py
from langsmith.run_helpers import get_current_run_tree, traceable
import httpx

@traceable
async def my_client_function():
    headers = {}
    async with httpx.AsyncClient(base_url="...") as client:
        if run_tree := get_current_run_tree():
            # add langsmith-id to headers
            headers.update(run_tree.to_headers())
        return await client.post("/my-route", headers=headers)
```

然后服务器（或其他服务）可以通过适当处理标头来继续跟踪。如果您使用 asgi 应用程序 Starlette 或 FastAPI，则可以使用 LangSmith 的 `TracingMiddleware` 连接分布式跟踪。<Info>
  `TracingMiddleware`类已添加到`langsmith==0.1.133`中。
</Info>

使用 FastAPI 的示例：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import traceable
from langsmith.middleware import TracingMiddleware
from fastapi import FastAPI, Request

app = FastAPI()  # Or Flask, Django, or any other framework
app.add_middleware(TracingMiddleware)

@traceable
async def some_function():
    ...

@app.post("/my-route")
async def fake_route(request: Request):
    return await some_function()
```

或者在 Starlette 中：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from starlette.applications import Starlette
from starlette.middleware import Middleware
from langsmith.middleware import TracingMiddleware

routes = ...
middleware = [
    Middleware(TracingMiddleware),
]
app = Starlette(..., middleware=middleware)
```

如果您使用其他服务器框架，您始终可以通过 `langsmith_extra` 传递标头来“接收”分布式跟踪：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# server.py
import langsmith as ls
from fastapi import FastAPI, Request

@ls.traceable
async def my_application():
    ...

app = FastAPI()  # Or Flask, Django, or any other framework

@app.post("/my-route")
async def fake_route(request: Request):
    # request.headers:  {"langsmith-trace": "..."}
    # as well as optional metadata/tags in `baggage`
    with ls.tracing_context(parent=request.headers):
        return await my_application()
```

上面的示例使用 `tracing_context` 上下文管理器。您还可以直接在用 `@traceable` 包装的方法的 `langsmith_extra` 参数中指定父运行上下文。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# ... same as above

@app.post("/my-route")
async def fake_route(request: Request):
    # request.headers:  {"langsmith-trace": "..."}
    my_application(langsmith_extra={"parent": request.headers})
```

## TypeScript 中的分布式跟踪

<Note>
  TypeScript 中的分布式跟踪需要 `langsmith` 版本 `>=0.1.31`
</Note>

首先，我们从客户端获取当前的运行树并将其转换为 `langsmith-trace` 和 `baggage` 标头值，我们可以将其传递给服务器：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
// client.mts
import { getCurrentRunTree, traceable } from "langsmith/traceable";

const client = traceable(
    async () => {
        const runTree = getCurrentRunTree();
        return await fetch("...", {
            method: "POST",
            headers: runTree.toHeaders(),
        }).then((a) => a.text());
    },
    { name: "client" }
);

await client();
```

然后，服务器将标头转换回运行树，用于进一步继续跟踪。

要将新创建的运行树传递给可跟踪函数，我们可以使用 `withRunTree` 帮助器，这将确保运行树在可跟踪调用中传播。

<CodeGroup>
  ```typescript Express.JS theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // server.mts
  import { RunTree } from "langsmith";
  import { traceable, withRunTree } from "langsmith/traceable";
  import express from "express";
  import bodyParser from "body-parser";

      const server = traceable(
          (text: string) => `Hello from the server! Received "${text}"`,
          { name: "server" }
      );

      const app = express();
      app.use(bodyParser.text());

  app.post("/", async (req, res) => {
      const runTree = RunTree.fromHeaders(req.headers);
      const result = await withRunTree(runTree, () => server(req.body));
      res.send(result);
  });
  ```

  ```typescript Hono theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // server.mts
  import { RunTree } from "langsmith";
  import { traceable, withRunTree } from "langsmith/traceable";
  import { Hono } from "hono";

      const server = traceable(
          (text: string) => `Hello from the server! Received "${text}"`,
          { name: "server" }
      );

      const app = new Hono();

  app.post("/", async (c) => {
      const body = await c.req.text();
      const runTree = RunTree.fromHeaders(c.req.raw.headers);
      const result = await withRunTree(runTree, () => server(body));
      return c.body(result);
  });
  ```
</CodeGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/distributed-tracing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>