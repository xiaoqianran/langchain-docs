<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy a Managed Deep Agent | https://docs.langchain.com/langsmith/python/managed-deep-agents-deploy -->

# 部署托管深度代理

部署托管深度代理会将代码优先项目编译为托管 LangGraph 应用程序，将部署拥有的上下文同步到 [Context Hub](/langsmith/use-the-context-hub)，上传已编译的源代码，并触发 LangSmith 托管部署构建。

<Note>
托管 Deep Agents 处于 **公共 [beta](/langsmith/release-stages)** 状态，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

本页介绍秘密路由和部署选项。要在部署之前测试代理，请参阅[Develop locally with LangSmith Studio](/langsmith/python/managed-deep-agents-local-development)。有关命令标志、部署步骤列表和故障排除，请参阅 [CLI reference](/langsmith/python/managed-deep-agents-cli)。

## 先决条件

在部署之前，请确保您拥有：

- 具有托管 Deep Agents 公共测试版访问权限的工作区。
- 该工作空间的 [LangSmith API key](/langsmith/create-account-api-key)，可以在 `.env` 或您的 shell 环境中。
- 从 `managed-deepagents` 安装的 `mda` CLI。
- 使用 `uv sync` 安装生成的 Python 项目的项目依赖项。




- 模型提供者凭据，例如 `.env` 中的 `OPENAI_API_KEY`、您的 shell 环境或 LangSmith 工作区机密。

CLI 默认针对 US LangSmith 云。

## 部署到LangSmith

部署本地项目：

```bash
mda deploy .
```

<Tip>
`mda deploy` 将本地项目输入路由到不同的托管表面：

```text
instructions.md + skills/**  -> Context Hub deploy-owned context
.env                         -> deploy auth + non-reserved hosted secrets, not archived
project source files         -> .mda/build source archive -> hosted deployment
schedules/**                 -> LangSmith cron jobs after the deployment is live
```
</Tip>

当目录名称不是您想要的名称时，显式设置部署名称：

```bash
mda deploy . --name research-assistant
```创建生产部署时使用`--deployment-type prod`：

```bash
mda deploy . --deployment-type prod
```

使用 `--no-wait` 触发构建而不轮询完成：

```bash
mda deploy . --no-wait
```

设置 `--no-wait` 时，将跳过该部署调用的计划协调，因为 CLI 在部署到达 `DEPLOYED` 之前退出。

成功后，CLI 将打印 LangSmith 部署仪表板 URL。有关完整的部署步骤列表，请参阅[CLI reference](/langsmith/python/managed-deep-agents-cli#deploy-projects)。

## 秘密和环境文件

`mda deploy` 在 shell 环境变量之前读取项目 `.env` 值。使用 `.env` 作为验证部署的 LangSmith API 密钥以及托管部署所需的运行时机密：

```text .env
LANGSMITH_API_KEY=<LANGSMITH_API_KEY>
OPENAI_API_KEY=<OPENAI_API_KEY>
GITHUB_MCP_TOKEN=<GITHUB_MCP_TOKEN>
DATABASE_URL=<DATABASE_URL>
```

`LANGSMITH_API_KEY`、`LANGGRAPH_HOST_API_KEY`、`LANGCHAIN_API_KEY`等平台变量被保留。他们可以对部署进行身份验证，但不会作为用户管理的部署机密上传。当 `mda deploy` 创建或更新部署时，非保留的 `.env` 条目（例如模型提供程序密钥、MCP 令牌和自定义工具凭证）将作为托管部署机密转发。如果配置的模型需要提供程序密钥，则部署在上传之前会失败，除非该密钥可从 `.env`、shell 环境或 LangSmith 工作区密钥获得。当提供程序密钥仅位于 shell 环境中时，`mda deploy` 将其作为该部署的秘密转发。

保留的平台变量、空值、`.env`和`.env.*`文件不会复制到已编译的构建存档中。

认证密钥顺序和保留变量请参见[CLI reference](/langsmith/python/managed-deep-agents-cli#authentication)。

## 部署故障排除

有关部署故障排除，请参阅[CLI reference](/langsmith/python/managed-deep-agents-cli#troubleshooting)。

如果部署达到`BUILD_FAILED`或`DEPLOY_FAILED`，请打开LangSmith中打印的部署URL并检查修订日志。

## 后续步骤

<CardGroup cols={2}>
  <Card title="Identity" icon="fingerprint" href="/langsmith/python/managed-deep-agents-identity">
    对调用者进行身份验证并提供私有线程。
  </Card>
  <Card title="Schedules" icon="calendar" href="/langsmith/python/managed-deep-agents-schedules">
    根据托管 cron 计划运行代理。
  </Card>
  <Card title="Custom tools" icon="tool" href="/langsmith/python/managed-deep-agents-tools">
    将创作的 LangChain 工具添加到代理定义中。
  </Card>
  <Card title="CLI reference" icon="terminal" href="/langsmith/python/managed-deep-agents-cli">
    查找每个`mda`命令和标志。
  </Card>
</CardGroup>

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-deploy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>