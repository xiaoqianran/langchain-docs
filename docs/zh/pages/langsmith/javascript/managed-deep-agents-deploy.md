<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy a Managed Deep Agent | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-deploy -->

# Deploy a Managed Deep Agent

Test and deploy a Managed Deep Agent with the mda CLI.

部署托管深度代理会将代码优先项目编译为托管 LangGraph 应用程序，将部署拥有的上下文同步到 [Context Hub](/langsmith/javascript/managed-deep-agents-context-hub)，上传已编译的源代码，并触发 LangSmith 托管部署构建。 The result is an [Agent Server](/langsmith/agent-server-overview) deployment, including the Agent Server API and [MCP endpoint](/langsmith/javascript/managed-deep-agents-mcp-endpoint).

> [!注意]
>
> Managed Deep Agents is in **public [beta](/langsmith/release-stages)** on [LangSmith Cloud](/langsmith/cloud).

This page covers secrets routing and deploy options. To test the agent before deploying, see [Develop locally with LangSmith Studio](/langsmith/javascript/managed-deep-agents-local-development). For command flags, the deploy step list, and troubleshooting, see the [CLI reference](/langsmith/javascript/managed-deep-agents-cli).

## 先决条件

Before you deploy, make sure you have:

* A workspace with Managed Deep Agents public beta access.

* A [LangSmith API key](/langsmith/create-account-api-key) for that workspace, in `.env` or your shell environment. On an interactive terminal, `mda deploy` prompts for a key or signs you in through the browser instead.

* The `mda` CLI installed from `managed-deepagents`.

* Project dependencies installed with `npm install` for TypeScript projects.

* Model provider credentials, such as `OPENAI_API_KEY`, in `.env`, your shell environment, or LangSmith workspace secrets.

## 选择 SaaS 区域`LANGSMITH_ENDPOINT` selects the LangSmith region the CLI deploys to.默认情况下，CLI 以 GCP US 为目标。

Set `LANGSMITH_ENDPOINT` in your project's `.env` or your shell environment before your first deploy:

|地区 |端点 |部署支持 |
| - | - | - |
| GCP 美国 (`smith.langchain.com`) | `https://api.smith.langchain.com` |支持 |
| GCP 欧盟 (`eu.smith.langchain.com`) | `https://eu.api.smith.langchain.com` |支持 |
| GCP 亚太地区 (`apac.smith.langchain.com`) | `https://apac.api.smith.langchain.com` |支持 |
| AWS 美国 (`aws.smith.langchain.com`) | `https://aws.api.smith.langchain.com` |支持 |

例如，要部署到 GCP EU：

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com
```

凭证必须属于目标区域。在第一次部署之前设置 `LANGSMITH_ENDPOINT`，因为它还会选择浏览器登录进行身份验证的区域。 A non-interactive run cannot fall back to browser sign-in, so in CI set `LANGSMITH_API_KEY` for the target region.

For more information on regions, see the [Regions FAQ](/langsmith/regions-faq).

> [!注意]
>
> LangSmith managed tools are available in GCP US only.

## 部署到LangSmith

部署本地项目：

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx mda deploy
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm exec mda deploy
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx mda deploy
```

> [!提示]
>
> `mda deploy` routes local project inputs to different managed surfaces:
>
> ```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
> instructions.md + skills/**  -> Context Hub deploy-owned context
> .env                         -> deploy auth + non-reserved hosted secrets, not archived
> project source files         -> .mda/build source archive -> hosted deployment
> schedules/**                 -> LangSmith cron jobs after the deployment is live
> ```

当目录名称不是您想要的名称时，显式设置部署名称：

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx mda deploy --name research-assistant
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm exec mda deploy --name research-assistant
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx mda deploy --name research-assistant
```

Use `--deployment-type prod` when creating a production deployment:

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx mda deploy --deployment-type prod
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm exec mda deploy --deployment-type prod
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx mda deploy --deployment-type prod
```

Use `--no-wait` to trigger the build without polling for completion:```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npx mda deploy --no-wait
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm exec mda deploy --no-wait
```

```bash bun theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
bunx mda deploy --no-wait
```

设置 `--no-wait` 时，将跳过该部署调用的计划协调，因为 CLI 在部署到达 `DEPLOYED` 之前退出。

成功后，CLI 将打印 LangSmith 部署仪表板 URL。有关完整的部署步骤列表，请参阅[CLI reference](/langsmith/javascript/managed-deep-agents-cli#deploy-projects)。

## 秘密和环境文件

`mda deploy` 在 shell 环境变量之前读取项目 `.env` 值。使用 `.env` 作为验证部署的 LangSmith API 密钥以及托管部署所需的运行时机密：

```text .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
OPENAI_API_KEY=<OPENAI_API_KEY>
GITHUB_MCP_TOKEN=<GITHUB_MCP_TOKEN>
DATABASE_URL=<DATABASE_URL>
MDA_INGRESS_SECRET=<MDA_INGRESS_SECRET>
```

仅当项目声明[backend identity](/langsmith/javascript/managed-deep-agents-identity#configure-identity-with-your-own-backend)时才需要`MDA_INGRESS_SECRET`。当存在该声明且缺少该值时，部署将在预检中失败。

`LANGSMITH_API_KEY`、`LANGGRAPH_HOST_API_KEY`、`LANGCHAIN_API_KEY`等平台变量被保留。他们可以对部署进行身份验证，但不会作为用户管理的部署机密上传。当 `mda deploy` 创建或更新部署时，非保留的 `.env` 条目（例如模型提供程序密钥、MCP 令牌和自定义工具凭证）将作为托管部署机密转发。如果配置的模型需要提供程序密钥，则部署在上传之前会失败，除非该密钥可从 `.env`、shell 环境或 LangSmith 工作区密钥获得。当提供程序密钥仅位于 shell 环境中时，`mda deploy` 将其作为该部署的秘密转发。

保留的平台变量、空值、`.env`和`.env.*`文件不会复制到已编译的构建存档中。

认证密钥顺序和保留变量请参见[CLI reference](/langsmith/javascript/managed-deep-agents-cli#authentication)。

## 部署故障排除

有关部署故障排除，请参阅[CLI reference](/langsmith/javascript/managed-deep-agents-cli#troubleshooting)。

如果部署达到`BUILD_FAILED`或`DEPLOY_FAILED`，请打开LangSmith中打印的部署URL并检查修订日志。

## 后续步骤

> **[Agent Server](/langsmith/agent-server-overview)**
>
> 探索托管部署的运行时。

> **[MCP endpoint](/langsmith/javascript/managed-deep-agents-mcp-endpoint)**
>
> 将部署的代理作为工具公开给 MCP 客户端。

> **[Identity](/langsmith/javascript/managed-deep-agents-identity)**
>
> 对调用者进行身份验证并提供私有线程。

> **[Schedules](/langsmith/javascript/managed-deep-agents-schedules)**
>
> 根据托管 cron 计划运行代理。

> **[Custom tools](/langsmith/javascript/managed-deep-agents-tools)**
>
> 将编写的LangChain工具添加到代理定义中。> **[CLI reference](/langsmith/javascript/managed-deep-agents-cli)**
>
> 查找每个 `mda` 命令和标志。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-deploy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。