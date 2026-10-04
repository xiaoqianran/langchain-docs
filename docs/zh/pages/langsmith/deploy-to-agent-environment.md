<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy to an agent environment | https://docs.langchain.com/langsmith/deploy-to-agent-environment -->

# 部署到代理环境

LangGraph 和托管 Deep Agents CLI 如何将部署绑定到代理和环境、每个标志所采用的值以及哪些 CLI 版本接受它们。

部署到代理环境会将 [deployment](/langsmith/deployment) 绑定到一个 [agent](/langsmith/agents) 以及该代理的其中一个 [environments](/langsmith/agent-environments)。两个标志携带绑定，LangGraph CLI 和`mda` CLI 都接受它们。

使用它可以将同一代理的暂存构建和生产构建分开，以便每个代理都报告到自己的环境中。

<Note>
  **测试版。** 基于代理的工作区位于 [beta](/langsmith/release-stages) 中。 LangChain 支持组织进行更改，并且适用于此后创建的工作区。现有的 [project-based](/langsmith/observability-concepts#tracing-projects) 工作区不会自动转换，但 LangChain 可以对其进行转换。要询问访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

## 先决条件

两个 CLI 都需要以下内容：

* `.env` 或您的 shell 环境中的 [LangSmith API key](/langsmith/create-account-api-key)。
* 包含`langgraph.json`的项目文件夹。从该文件夹运行 CLI。
* 基于代理的工作区，因为标志需要工作区上的代理模式。组织范围的 API 密钥也需要工作区，并且每个 CLI 从不同的变量中读取它：`LANGSMITH_TENANT_ID` 对于 LangGraph CLI，`LANGSMITH_WORKSPACE_ID` 对于`mda` CLI。工作区范围的密钥两者都不需要。当键属于组织范围时，LangGraph CLI 会提示输入值。在脚本或 CI 作业中，提前设置 `LANGSMITH_TENANT_ID`，并传递 `--no-input`，以便 LangGraph CLI 失败而不是等待输入。 Python 和 TypeScript LangGraph CLI 都接受 `--no-input`。

## 寻址标志

两个 CLI 都采用相同的两个标志：

* **`--agent-id`**：要部署到的代理。该值是代理的标识符，而不是其显示名称。对于哪个值是哪个，请参阅[Identifiers and display names](/langsmith/agents#identifiers-and-display-names)。
* **`--agent-environment`**：部署报告到的环境，以及`development`、`staging` 或`production` 之一。部署不能占用`local`。那个环境[does not display on deployments](/langsmith/agent-environments#select-an-environment)根本就是这个集合与[agent addressing](/langsmith/log-traces-to-agent#addressing-variables)接受的四个值不同的一种方式。

这些标志与 [agent addressing](/langsmith/log-traces-to-agent) 在跟踪端命名的名称相同。 LangGraph CLI 还从相同的两个变量`LANGSMITH_AGENT_ID` 和 `LANGSMITH_AGENT_ENVIRONMENT` 读取标志。 `mda` CLI 不会读取这些变量，因此直接将标志传递给它。

## 使用 LangGraph CLI 进行部署这些标志在 Python 中需要 `langgraph-cli` v0.4.32 或更高版本，在 TypeScript 中需要 `@langchain/langgraph-cli` 1.5.2-dev.0。 TypeScript 版本是预发行版本。准确安装它，因为当前的稳定版本 1.5.1 不接受这些标志。部署：

1. 安装 CLI：

   <CodeGroup>
     ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     uv tool install --force "langgraph-cli>=0.4.32"
     ```

     ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     npm install -g "@langchain/langgraph-cli@1.5.2-dev.0"
     ```
   </CodeGroup>

2. 部署、命名代理和环境：

   <CodeGroup>
     ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     langgraph deploy --agent-id my-agent --agent-environment staging --remote
     ```

     ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     langgraphjs deploy --agent-id my-agent --agent-environment staging --remote
     ```
   </CodeGroup>

传递两个标志或都不传递，因为其中任何一个标志都会被拒绝。不要将它们与 `--name` 或 `--deployment-id` 结合使用，它们直接命名部署并与代理一起被拒绝。

`--remote` 强制远程构建。如果没有它，只要 Docker 可用，CLI 就会在本地构建。对于其余标志，请参阅[⟦T31⟧](/langsmith/cli#deploy)。

## 使用 mda CLI 进行部署

这些标志在 Python 中需要 `managed-deepagents` 0.7.5.dev4，在 TypeScript 中需要 0.7.5-dev.4。两者都是预发行版本。准确安装该版本，因为 0.8.0 及更高版本不接受这些标志，并且版本范围解析为拒绝它们的构建。部署：

1. 安装 CLI：

   <CodeGroup>
     ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     uv tool install --force --prerelease allow "managed-deepagents==0.7.5.dev4"
     uv add --prerelease allow "managed-deepagents==0.7.5.dev4"
     ```

     ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     npm install "managed-deepagents@0.7.5-dev.4"
     ```
   </CodeGroup>

2. 在当前文件夹中部署项目：

   <CodeGroup>
     ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     mda deploy . --agent-id my-agent --agent-environment staging
     ```

     ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     npx mda deploy . --agent-id my-agent --agent-environment staging
     ```
   </CodeGroup>在 Python 中，将 CLI 作为工具安装并将相同版本固定为项目依赖项，可以使全局 `mda` 二进制文件和项目自身的依赖项保持在一个版本上。对于其余标志，请参阅 [Deploy projects](/langsmith/python/managed-deep-agents-cli#deploy-projects)，对于不使用代理标志的部署，请参阅 [Deploy a Managed Deep Agent](/langsmith/python/managed-deep-agents-deploy)。

## 确认绑定

打开代理并阅读其 [Overview](/langsmith/navigate-agents#read-the-agent-overview) 的 **部署** 部分。部署成功后，新部署将立即显示为一行，并且该行链接到该部署。

如果新部署没有行，或者概述没有 **Deployments** 部分，则部署不会绑定到代理。当您设置 `LANGSMITH_AGENT_ID` 和 `LANGSMITH_AGENT_ENVIRONMENT` 变量并使用 `mda` CLI 进行部署时，通常会发生这种情况，该 CLI 会忽略它们。将 `--agent-id` 和 `--agent-environment` 添加到部署命令中。

## 另请参阅

* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)
* [Log traces to an agent](/langsmith/log-traces-to-agent)
* [Deployment](/langsmith/deployment)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-to-agent-environment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>