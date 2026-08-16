<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Hybrid | https://docs.langchain.com/langsmith/hybrid -->

# 混合动力

Hybrid 是[LangSmith Deployment](/langsmith/deployment) 的平台设置，**在生产中部署和运行代理**。

在混合平台设置中，您在自己的基础设施中自行托管 [Agent Servers](/langsmith/agent-server) 并将其跟踪发送到 LangSmith，其中 LangSmith 可以是 [self-hosted](/langsmith/self-hosted) 实例或 [LangSmith Cloud](/langsmith/cloud)。

此设置使您可以控制代理工作负载的运行位置，同时让您选择最适合您的可观察性和合规性要求的[LangSmith platform option](/langsmith/platform-setup)。

## 组件

|组件|它在哪里运行 |谁来管理|
|----------|--------------|----------------|
| <Tooltip tip="The server that runs your applications.">代理服务器</Tooltip> <br></br>适用于[LangSmith Deployment](/langsmith/deployment) |您的基础设施|你|
| LangSmith <br></br>(追踪、评估、提示) |在您的基础设施中自托管，或LangSmith SaaS |您（自托管）或LangSmith (SaaS) |

<Note>
Hybrid 是用于LangSmith 部署（代理服务）的平台设置。要仅为可观察性、评估和提示工程设置LangSmith，请参阅[Set up LangSmith](/langsmith/platform-setup)。
</Note>

## 工作流程

1. 在本地构建并测试您的代理。
1. 将您的代理部署到[Agent Server running in your infrastructure](#self-host-your-agent-servers)。
1. 将特工踪迹发送至[LangSmith (self-hosted or SaaS) for observability and evaluation](#choose-where-traces-are-sent)。

### 自托管您的代理服务器使用 Docker、Docker Compose 或 Kubernetes 部署独立代理服务器。请参阅 [standalone server guide](/langsmith/deploy-standalone-server) 了解先决条件、环境变量和特定于平台的说明。

### 选择跟踪的发送位置

代理服务器根据 `LANGSMITH_ENDPOINT` 环境变量将跟踪发送到 LangSmith：

- **LangSmith SaaS**：省略 `LANGSMITH_ENDPOINT` 以使用默认值 (GCP US)，或将其设置为您所在区域的终端节点：

    {/* 通过 `prefix` 更改“.langchain.com”之前的主机名（默认：“api.smith”）。
    传递 `suffix` 将路径（例如“/mcp”）附加到每个 URL。
    传递 `protocol={false}` 来渲染不带“https://”的主机名。 */}

<table>
  <thead>
    <tr>
      <th>地区</th>
      <th>{协议===假？ “主机”：“URL”}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GCP 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 欧盟</td>
      <td><code>{`${protocol === false ? "" : "https://"}eu.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>GCP 亚太地区</td>
      <td><code>{`${protocol === false ? "" : "https://"}apac.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
    <tr>
      <td>AWS 美国</td>
      <td><code>{`${protocol === false ? "" : "https://"}aws.${prefix || "api.smith"}.langchain.com${suffix || ""}`}</code></td>
    </tr>
  </tbody>
</table>

- **自托管 LangSmith**：将 `LANGSMITH_ENDPOINT` 设置为 [self-hosted LangSmith](/langsmith/self-hosted) 实例的主机名。在这两种情况下，请使用您要跟踪的 LangSmith 实例颁发的 [LangSmith API key](/langsmith/create-account-api-key) 进行身份验证。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/hybrid.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>