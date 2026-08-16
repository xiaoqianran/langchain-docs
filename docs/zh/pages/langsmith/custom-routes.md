<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to add custom routes | https://docs.langchain.com/langsmith/custom-routes -->

# 如何添加自定义路由

将代理部署到 LangSmith 部署时，您的服务器会自动公开用于创建运行和线程、与长期内存存储交互、管理可配置助手和其他核心功能 ([see all default API endpoints](/langsmith/server-api-ref)) 的路由。

您可以通过提供自己的应用程序对象并在 `langgraph.json` 中传递其路径（例如，Python 中的 [⟦T9⟧](https://www.starlette.io/applications/) 应用程序或 TypeScript 中的 [⟦T10⟧](https://hono.dev/) 应用程序）来添加自定义路由。

定义自定义应用程序对象可让您添加所需的任何路由，因此您可以执行任何操作，从添加 `/login` 端点到编写整个全栈 Web 应用程序，所有这些都部署在单个代理服务器中。

以下是 Python 和 TypeScript 的示例。

## 创建应用程序

从 **现有** LangSmith 应用程序开始，将以下自定义路由代码添加到您的应用程序文件中。如果您是从头开始，则可以使用 CLI 从模板创建新应用程序。

<Tabs>
    <Tab title="Python">
    ```bash
    langgraph new --template=new-langgraph-project-python my_new_project
    ```

    一旦您有了 LangGraph 项目，请添加以下应用程序代码：

    ```python {highlight={4}}
    # ./src/agent/webapp.py
    from fastapi import FastAPI

    app = FastAPI()


    @app.get("/hello")
    def read_root():
        return {"Hello": "World"}
    ```
    </Tab>
    <Tab title="TypeScript">
    ```bash
    yarn create langgraph
    npm install hono
    ```

    一旦您有了 LangGraph 项目，请添加以下应用程序代码：

    ```typescript
    // ./src/custom-routes.ts
    import { Hono } from "hono";

    export const app = new Hono()
      .get("/custom/hello", (c) => {
        return c.json({ hello: "world" });
      })
      .post("/custom/webhook", async (c) => {
        const body = await c.req.json();
        return c.json({ received: true, payload: body });
      });
    ```

    `hono` 包必须在您的项目依赖项中可用。
    </Tab>
</Tabs>

## 配置`langgraph.json`将以下内容添加到您的 `langgraph.json` 配置文件中。确保路径指向您在 [previous section](#create-app) 中创建的应用程序实例。

<Tabs>
    <Tab title="Python">
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
    </Tab>
    <Tab title="TypeScript">
    ```json
    {
      "node_version": "20",
      "dependencies": ["."],
      "graphs": { "agent": "./src/agent.ts:graph" },
      "http": { "app": "./src/custom-routes.ts:app" },
      "env": ".env"
    }
    ```
    </Tab>
</Tabs>

## 启动服务器

在本地测试服务器：

<Tabs>
    <Tab title="Python">
    ```bash
    langgraph dev --no-browser
    ```
    </Tab>
    <Tab title="TypeScript">
    ```bash
    npx @langchain/langgraph-cli@latest dev --no-browser
    ```
    </Tab>
</Tabs>

如果您在浏览器中导航到 `localhost:2024/hello`（`2024` 是默认开发端口），您应该会看到 `/hello` 端点返回 JSON 响应。对于 TypeScript 示例，导航至 `localhost:2024/custom/hello`。

TypeScript `http.app` 配置适用于使用 `langgraph dev` 的本地开发和使用 `langgraph up` 的 Docker。

<Note>
**隐藏默认端点**
您在应用程序中创建的路由优先于系统默认值，这意味着您可以隐藏和重新定义任何默认端点的行为。
</Note>

## 部署

您可以将此应用程序按原样部署到 LangSmith 或您的自托管平台。

## 后续步骤

现在您已经向部署添加了自定义路由，您可以使用相同的技术来进一步自定义服务器的行为方式，例如定义 [custom middleware](/langsmith/custom-middleware) 和 [custom lifespan events](/langsmith/custom-lifespan)。

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-routes.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>