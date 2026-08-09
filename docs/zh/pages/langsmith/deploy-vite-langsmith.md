<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy with LangSmith and Vite | https://docs.langchain.com/langsmith/deploy-vite-langsmith -->

# 使用 LangSmith 和 Vite 进行部署

将 LangChain 深度代理部署到 LangSmith Deployment，并从 Vercel、Netlify 或 Cloudflare 页面上的 Vite React 聊天 UI 进行流式传输。

此示例将您从本地结账转移到已部署的 LangChain 深度代理（具有可用的聊天 UI）。后端作为[LangSmith Deployment](/langsmith/deployment)运行，前端是一个从其流式传输的 Vite + React 应用程序。

当您想要在本地运行代理、将其部署到 LangSmith 并将 UI 指向已部署的代理服务器时，请使用本指南。

来源：部署手册中的[⟦T17⟧](https://github.com/langchain-ai/deployment-cookbook/tree/main/js-langsmith)。

## 您正在部署什么

**LangSmith 部署** 在 LangSmith 的托管代理服务器上运行 LangGraph 图表。在这个例子中：

* `agent/` 包含深层代理图、子代理、中间件和工具。
* `langgraph.json` 告诉 LangGraph CLI 服务和部署哪个图。
* `src/` 包含 React 聊天 UI。
* UI 通过 LangGraph SDK 和 `@langchain/react` 与代理服务器 API 进行通信。

部署的代理是一个具有两个子代理的协调器：

* `researcher` 使用本地`search_web` 工具。
* `math-whiz` 使用本地`calculator` 工具。

### 各部分如何搭配

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
%%{init: {"themeVariables": {"lineColor": "#40668D", "primaryColor": "#E5F4FF", "primaryTextColor": "#030710", "primaryBorderColor": "#006DDD"}}}%%
flowchart LR
  A["agent/<br/>createDeepAgent graph"] -->|"pnpm run deploy"| B["LangSmith Deployment<br/>Agent Server"]
  C["React chat UI<br/>src/"] -->|"LangGraph SDK<br/>threads + streaming"| B

  classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
  classDef output fill:#EBD0F0,stroke:#885270,stroke-width:2px,color:#441E33
  class A,C process
  class B output
```在本地开发过程中，`pnpm run dev`同时启动LangGraph开发服务器和Vite应用程序。在生产中，LangSmith 托管代理，静态主机为 Vite 构建的 UI 提供服务。

### 先决条件

* 具有部署访问权限的[LangSmith API key](/langsmith/create-account-api-key)。
* 代理模型的 OpenAI API 密钥。
* `pnpm`。

## 本地运行

<Steps>
  <Step title="Install dependencies">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    cd js-langsmith
    pnpm install
    ```
  </Step>

  <Step title="Create your environment file">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    cp .env.example .env
    ```

    打开`.env`并设置：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    OPENAI_API_KEY=<your OpenAI API key>
    ```

    将`LANGSMITH_API_KEY`和`VITE_AGENT_API_URL`留空以供本地开发。仅在针对远程 LangSmith 部署部署或测试 UI 时才需要 `LANGSMITH_API_KEY`。
  </Step>

  <Step title="Start the agent and UI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm run dev
    ```

    这将启动两个进程：

    * LangGraph 开发服务器位于[http://localhost:2024](http://localhost:2024)。
    * Vite 开发服务器位于[http://localhost:5173](http://localhost:5173)。
  </Step>

  <Step title="Open the chat">
    打开[http://localhost:5173](http://localhost:5173)。尝试使用两个子代理的提示：

    ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    Research LangGraph streaming, and separately calculate 42 * 17.
    ```

    当`VITE_AGENT_API_URL`为空时，Vite应用程序使用`/api/langgraph`的本地代理，将请求转发到LangGraph开发服务器并避免CORS问题。
  </Step>
</Steps>

## 将代理部署到 LangSmith

<Steps>
  <Step title="Confirm your environment">
    您的 `.env` 必须包括：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    OPENAI_API_KEY=<your OpenAI API key>
    LANGSMITH_API_KEY=<your LangSmith API key>
    ```

    （可选）设置部署名称：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    LANGSMITH_DEPLOYMENT_NAME=deployment-cookbook-agent
    ```

    如果未设置 `LANGSMITH_DEPLOYMENT_NAME`，则部署名称默认为目录名称。
  </Step>

  <Step title="Deploy the agent to LangSmith">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm run deploy
    ```这运行`langgraphjs deploy`。 CLI 使用 `langgraph.json` 部署来自 `agent/index.ts` 的 `agent` 图。
  </Step>

  <Step title="Copy the deployment API URL">
    部署后，在 LangSmith 中打开部署并复制其 **API URL**。它应该看起来像：

    ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    https://your-app.us.langgraph.app/
    ```

    仅使用根 URL。不要添加任何 API 路径后缀。
  </Step>

  <Step title="Test the UI against the remote deployment">
    将 `VITE_AGENT_API_URL` 设置为 `.env`：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    VITE_AGENT_API_URL=https://your-app.us.langgraph.app
    ```

    然后运行用户界面：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm run dev
    ```

    浏览器客户端在与远程部署通信时重用`LANGSMITH_API_KEY`。

    <Warning>
      该演示将 `LANGSMITH_API_KEY` 暴露给浏览器包，以便 UI 可以直接调用 LangSmith 部署。这对于本地测试来说很方便，但不利于生产安全。对于真正的应用程序，通过您自己的后端代理请求并将密钥保留在服务器端。
    </Warning>
  </Step>
</Steps>

## 部署前端

代理和 UI 分开部署。 `pnpm run deploy`成功后，在任何静态平台上托管Vite构建（`dist/`）并将其指向您的LangSmith部署URL。

<Tabs>
  <Tab title="Vercel">
    <Steps>
      <Step title="Import the repository">
        单击下面的 **使用 Vercel 部署**，或手动导入 [⟦T46⟧](https://github.com/langchain-ai/deployment-cookbook)。

        <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flangchain-ai%2Fdeployment-cookbook&root-directory=js-langsmith&env=VITE_AGENT_API_URL,LANGSMITH_API_KEY&envDescription=LangSmith%20deployment%20URL%20and%20API%20key">
          <img alt="Deploy with Vercel" />
        </a>
      </Step><Step title="Configure the project">
        1. 将**根目录**设置为`js-langsmith`。
        2. 使用默认的Vite版本。构建输出是`dist/`。
        3. 设置这些环境变量：
           * `VITE_AGENT_API_URL`：LangSmith 部署根 URL。
           * `LANGSMITH_API_KEY`：演示客户端使用的 LangSmith API 密钥。
      </Step>
    </Steps>
  </Tab>

  <Tab title="Netlify">
    <Steps>
      <Step title="Import the repository">
        单击下面的 **部署到 Netlify**，或手动导入 [⟦T51⟧](https://github.com/langchain-ai/deployment-cookbook)。

        <a href="https://app.netlify.com/start/deploy?repository=https://github.com/langchain-ai/deployment-cookbook&base=js-langsmith">
          <img alt="Deploy to Netlify" />
        </a>
      </Step>

      <Step title="Configure the project">
        将**基目录**设置为`js-langsmith`。使用默认构建命令（`pnpm build`或`npm run build`）并发布目录`dist/`。
      </Step>

      <Step title="Set environment variables">
        部署之前在 Netlify 中添加这些变量：

        * `VITE_AGENT_API_URL`：LangSmith 部署根 URL。
        * `LANGSMITH_API_KEY`：演示客户端使用的 LangSmith API 密钥。
      </Step>
    </Steps>
  </Tab>

  <Tab title="Cloudflare Pages">
    <Steps>
      <Step title="Connect the repository">
        在 [Cloudflare dashboard](https://dash.cloudflare.com/) 中，从 [⟦T58⟧](https://github.com/langchain-ai/deployment-cookbook) 创建 **Workers & Pages** 项目。
      </Step>

      <Step title="Configure the build">
        * **根目录**：`js-langsmith`
        * **构建命令**：`pnpm install && pnpm build`
        * **构建输出目录**：`dist`
      </Step>

      <Step title="Set environment variables">
        在 Pages 项目设置中添加这些变量：* `VITE_AGENT_API_URL`：LangSmith 部署根 URL。
        * `LANGSMITH_API_KEY`：演示客户端使用的 LangSmith API 密钥。
      </Step>
    </Steps>
  </Tab>
</Tabs>

## 故障排除

* `pnpm run dev`启动但无法连接UI：本地开发者将`VITE_AGENT_API_URL`留空，然后重新启动`pnpm run dev`。
* 座席本地无法应答：确认`OPENAI_API_KEY`设置为`.env`。
* `pnpm run deploy` 失败并出现身份验证错误：确认 `LANGSMITH_API_KEY` 具有部署访问权限。
* 远程UI连接失败：确认`VITE_AGENT_API_URL`是部署根URL，不带路径后缀。
* 重启本地开发后线程消失：本地`langgraph dev`使用内存中的`MemorySaver`； LangSmith Deployment 在生产中提供持久存储。
* 您更改了`agent/`中的文件，但生产没有改变：再次运行`pnpm run deploy`。

## 了解该项目

<AccordionGroup>
  <Accordion title="Agent files">
    LangSmith 后端位于 `agent/`：

    ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    agent/
    ├── index.ts       # createDeepAgent graph
    ├── middleware.ts  # response middleware
    └── tools.ts       # custom code tools
    ```

    `agent/index.ts` 导出 LangGraph 本地服务和 LangSmith 部署的图。本地`MemorySaver`检查指针仅由`langgraph dev`使用。 LangSmith 部署将其替换为生产中由 Postgres 支持的持久存储，无需更改代码。
  </Accordion>

  <Accordion title="LangGraph config">
    `langgraph.json` 将 CLI 指向图表：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      "graphs": {
        "agent": "./agent/index.ts:agent"
      },
      "env": ".env"
    }
    ```图ID是`agent`。前端在流式传输时使用该 id 作为助手 id。
  </Accordion>

  <Accordion title="Chat UI">
    `src/` 中的 React 应用程序提供流式聊天、线程历史记录、子代理渲染和工具调用渲染。

    前端使用：

    * `client.threads.search()` 用于线程侧边栏。
    * `client.threads.create()` 和 `client.threads.delete()` 用于对话管理。
    * `StreamProvider` 与 `assistantId: "agent"` 用于流媒体聊天。

    有关底层线程和流 API，请参阅[Agent Server API reference](/langsmith/server-api-ref)。
  </Accordion>

  <Accordion title="Local commands">
    运行两个本地进程：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm run dev
    ```

    分别运行它们：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm run dev:agent
    pnpm run dev:web
    ```

    构建并预览前端：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pnpm build
    pnpm preview
    ```
  </Accordion>

  <Accordion title="CI/CD">
    当 `js-langsmith/agent/` 下的文件或共享配置文件发生更改时，代理会通过 GitHub Actions 进行部署：

    * 工作流程：[⟦T89⟧](https://github.com/langchain-ai/deployment-cookbook/blob/main/.github/workflows/deploy-langsmith-agent.yml)
    *行动：`langgraphjs deploy`给LangSmith。
    * 所需秘密：`LANGSMITH_API_KEY`。
    * 可选变量：`LANGSMITH_DEPLOYMENT_NAME`。

    前端通过静态主机的 Git 集成（例如 Vercel、Netlify 或 Cloudflare Pages）进行部署。
  </Accordion>
</AccordionGroup>

## 另请参阅

* [Frameworks and platforms overview](/langsmith/deploy-frameworks-and-platforms)
* [LangSmith Deployment overview](/langsmith/deployment)
* [LangGraph CLI](/langsmith/cli)
* [Deep Agents going to production](/oss/python/deepagents/going-to-production)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-vite-langsmith.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>