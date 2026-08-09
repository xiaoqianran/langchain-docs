<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy your app to cloud | https://docs.langchain.com/langsmith/deployment-quickstart -->

# 将您的应用程序部署到云端

使用 LangGraph CLI 将您的第一个应用程序部署到 LangSmith 云（AWS 和 GCP）。

本快速入门向您展示如何使用 [⟦T13⟧](/langsmith/cli#deploy) 命令将应用程序部署到 LangSmith 云（AWS 和 GCP）。任何从 [⟦T14⟧](/langsmith/application-structure#configuration-file-concepts) 配置导出图表的应用程序都以相同的方式部署，无论您使用哪个框架来编写代理。

<Tip>
  有关全面的云部署指南（包括基于 GitHub 的部署和所有配置选项），请参阅[Cloud deployment setup guide](/langsmith/deploy-to-cloud)。
</Tip>

<Note>
  `langgraph deploy` 命令位于 **[beta](/langsmith/release-stages)** 中。
</Note>

## 先决条件

在开始之前，请确保您拥有：

* [Plus plan or above](https://www.langchain.com/pricing) 上有一个 [LangSmith account](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deployment-quickstart) 和一个 [API key](/langsmith/create-account-api-key)。
*（可选）已安装 **Docker** 并为本地构建运行 Docker 守护进程。远程构建不需要。 [Install Docker Desktop](https://docs.docker.com/get-docker/)。如果 Docker 不可用，`langgraph deploy` 会自动触发远程构建。
*（可选）在 Apple Silicon (M1/M2/M3) 上：[Docker Buildx](https://docs.docker.com/build/install-buildx/)，用于在本地构建期间交叉编译为 `linux/amd64`。
* [LangGraph CLI](/langsmith/cli)：

  ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv tool install langgraph-cli
  ```

## 1. 创建一个可部署的应用程序

`langgraph deploy` 部署其 `langgraph.json` 导出图表的任何项目。选择与您编写代理的方式相匹配的路径：

<Tabs>
  <Tab title="LangGraph template">
    从 [⟦T20⟧ template](https://github.com/langchain-ai/new-langgraph-project) 创建一个新应用程序：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph new path/to/your/app --template new-langgraph-project-python
    cd path/to/your/app
    ```<Tip>
      在不运行 `--template` 的情况下运行 `langgraph new` 即可获得可用模板的交互式菜单。
    </Tip>
  </Tab>

  <Tab title="Bring your own framework">
    使用 Claude Agent SDK、Strands、CrewAI、AutoGen 或 Google ADK 编写的代理一旦公开来自 `langgraph.json` 的图表，就会通过相同的 CLI 进行部署。有关端到端示例，请参阅[Deploy other frameworks](/langsmith/deploy-other-frameworks)。当您的项目导出图表后，请返回此处执行其余步骤。
  </Tab>
</Tabs>

## 2. 设置您的 API 密钥

将您的 LangSmith API 密钥添加到项目根目录中的 `.env` 文件中：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=lsv2_...
```

`langgraph deploy` 命令会自动读取此内容。或者，内联传递：

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=lsv2_... langgraph deploy
```

## 3. 部署

直接从 CLI 或通过 UI 进行部署。

<Tabs>
  <Tab title="Deploy from CLI">
    从项目目录运行部署命令：

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph deploy
    ```

    默认情况下，这将创建一个以您的项目目录命名的无服务器部署。使用 `--name` 或 `--deployment-type dedicated` 覆盖。

    <Note>
      在 2026 年 10 月 1 日之前仍采用之前定价的组织可使用 `--deployment-type prod` 或 `--deployment-type dev`。详情请参见[⟦T30⟧](/langsmith/cli#deploy)和[Manage billing](/langsmith/billing#langsmith-deployment-billing)。
    </Note>

    <Tip>
      要在更改代码后更新现有部署，请重新运行 `langgraph deploy`。它按名称查找现有部署并就地更新它。
    </Tip>您还可以使用 `langgraph deploy list` 查看所有部署，使用 `langgraph deploy logs` 跟踪运行时日志，使用 `langgraph deploy delete <ID>` 删除部署。详情请参阅[CLI reference](/langsmith/cli#deploy)。
  </Tab>

  <Tab title="Deploy from Studio">
    从工作室部署：

    1. 启动[local development server](/langsmith/local-dev-testing#langgraph-dev)。这将自动打开[Studio](/langsmith/studio)，一个交互式代理IDE。

    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    langgraph dev
    ```

    2. 单击`deploy`按钮。
       <img alt="Deploy from Studio" />
  </Tab>
</Tabs>

## 4. 在 Studio 中测试

[Studio](/langsmith/studio) 是直接连接到您的部署的交互式代理 IDE。使用它来发送消息、检查每个节点的中间状态、编辑运行中的状态以及从任何先前的检查点重放，而无需编写代码。

部署准备就绪后：

1. 转到[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-deployment-quickstart)并选择左侧边栏中的**部署**。
2. 选择您的部署以查看其详细信息。
3、点击右上角**Studio**，打开[Studio](/langsmith/studio)。

## 5. 测试 API

从部署详细信息视图中复制 **API URL**，然后使用它来调用您的应用程序：

<Tabs>
  <Tab title="Python SDK (Async)">
    1.安装LangGraphPython SDK：
       ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       pip install langgraph-sdk
       ```
    2、向助手发送消息（无状态运行）：
       ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       from langgraph_sdk import get_client

       client = get_client(url="your-deployment-url", api_key="your-langsmith-api-key")

       async for chunk in client.runs.stream(
           None,  # Threadless run
           "agent", # Name of assistant. Defined in langgraph.json.
           input={
               "messages": [{
                   "role": "human",
                   "content": "Say hello.",
               }],
           },
           stream_mode="updates",
       ):
           print(f"Receiving new event of type: {chunk.event}...")
           print(chunk.data)
           print("\n\n")
       ```
  </Tab>

  <Tab title="Python SDK (Sync)">
    1.安装LangGraphPython SDK：
       ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       pip install langgraph-sdk
       ```
    2.向助手发送消息（无线程运行）：
       ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       from langgraph_sdk import get_sync_client

       client = get_sync_client(url="your-deployment-url", api_key="your-langsmith-api-key")

       for chunk in client.runs.stream(
           None,  # Threadless run
           "agent", # Name of assistant. Defined in langgraph.json.
           input={
               "messages": [{
                   "role": "human",
                   "content": "Say hello.",
               }],
           },
           stream_mode="updates",
       ):
           print(f"Receiving new event of type: {chunk.event}...")
           print(chunk.data)
           print("\n\n")
       ```
  </Tab><Tab title="JavaScript SDK">
    1.安装LangGraphJS SDK：
       ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       npm install @langchain/langgraph-sdk
       ```
    2.向助手发送消息（无线程运行）：
       ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       const { Client } = await import("@langchain/langgraph-sdk");

       const client = new Client({ apiUrl: "your-deployment-url", apiKey: "your-langsmith-api-key" });

       const streamResponse = client.runs.stream(
           null, // Threadless run
           "agent", // Assistant ID
           {
               input: {
                   "messages": [
                       { "role": "user", "content": "Say hello."}
                   ]
               },
               streamMode: "messages",
           }
       );

       for await (const chunk of streamResponse) {
           console.log(`Receiving new event of type: ${chunk.event}...`);
           console.log(JSON.stringify(chunk.data));
           console.log("\n\n");
       }
       ```
  </Tab>

  <Tab title="Rest API">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl -s --request POST \
        --url <DEPLOYMENT_URL>/runs/stream \
        --header 'Content-Type: application/json' \
        --header "X-Api-Key: <LANGSMITH API KEY>" \
        --data "{
            \"assistant_id\": \"agent\",
            \"input\": {
                \"messages\": [
                    {
                        \"role\": \"human\",
                        \"content\": \"Say hello.\"
                    }
                ]
            },
            \"stream_mode\": \"updates\"
        }"
    ```
  </Tab>
</Tabs>

## 后续步骤

<CardGroup>
  <Card title="Assistants" icon="robot" href="/langsmith/assistants">
    每个助手使用不同的模型、提示或工具部署相同的图表。
  </Card>

  <Card title="Threads" icon="messages" href="/langsmith/use-threads">
    在多次运行中保留状态，以便您的代理记住交互之间的上下文。
  </Card>

  <Card title="Runs" icon="player-play" href="/langsmith/background-run">
    启动长时间运行作业的后台运行，并将结果流式传输回您的客户端。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deployment-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>