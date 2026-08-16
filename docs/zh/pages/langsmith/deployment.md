<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Deployment | https://docs.langchain.com/langsmith/deployment -->

# LangSmith 部署

**LangSmith 部署** 是专为代理工作负载构建的工作流编排运行时。它提供了在生产中大规模可靠运行所需的托管基础​​设施代理，支持从本地开发到部署的整个生命周期。

<Note>
本页介绍了您的 **代理** 如何通过 **LangSmith 部署** 在生产环境中运行。

您运行 LangSmith 来进行可观察性、评估和提示工程是独立的；详情请参阅[Platform setup](/langsmith/platform-setup)。
</Note>

## 可部署的产品

LangSmith 部署与框架无关，这意味着您可以部署使用以下方式构建的代理：

<CardGroup cols={2}>

<Card
  title="LangGraph (and LangChain)"
  cta="Open quickstart"
  href="/langsmith/deployment-quickstart"
  icon="chart-dots-3"
>
使用 LangGraph CLI 和应用程序模板将应用程序部署到 LangSmith。
</Card>

<Card
  title="Google ADK"
  cta="View guide"
  href="/langsmith/deploy-google-adk"
  icon="google"
>
使用 `deployments-wrap-sdk` 软件包将 Google 代理开发工具包 (ADK) 代理部署为 LangGraph。
</Card>

<Card
  title="Other frameworks"
  cta="View guide"
  href="/langsmith/deploy-other-frameworks"
  icon="packages"
>
使用功能 API 或 `deployments-wrap-sdk` 部署 Claude Agent SDK、Strands、CrewAI、AutoGen 和其他代理框架。
</Card>

<Card
  title="Looking to deploy Deep Agents?"
  cta="View Managed Deep Agents"
  href="/langsmith/python/managed-deep-agents-overview"
  type="tip"
  className="card-tip"
>
使用托管Deep Agents：用于部署代码优先Deep Agents的托管运行时。
</Card>

</CardGroup>

## LangSmith 部署环境

根据您希望运行 [control plane](/langsmith/control-plane) 和 [data plane](/langsmith/data-plane)（代理服务器及其数据库）的位置选择环境。所有基础设施类型都使用相同的[Agent Server](/langsmith/agent-server)运行时。

<CardGroup cols={2}><Card
  title="Cloud"
  cta="View guide"
  href="/langsmith/deploy-to-cloud-overview"
  icon="cloud"
>
  由AWS和GCP上的LangChain完全管理。在 LangSmith UI 中或使用 [⟦T2⟧](/langsmith/cli#deploy) 从 GitHub 创建部署。需要[Plus plan or above](https://www.langchain.com/pricing)。
</Card>

<Card
  title="Self-hosted with control plane"
  cta="View guide"
  href="/langsmith/deploy-with-control-plane"
  icon="buildings"
>
  在您自己的 Kubernetes 集群中运行 LangSmith 部署控制平面和代理服务器，以及自托管 LangSmith。需要启用 LangSmith 部署的 [Enterprise plan](https://www.langchain.com/pricing)。
</Card>

<Card
  title="Hybrid"
  cta="View guide"
  href="/langsmith/hybrid"
  icon="cloud-network"
>
  LangChain-托管控制平面，具有代理服务器及其基础设施中的数据平面。跟踪流向LangSmith云或自托管LangSmith。
</Card>

<Card
  title="Standalone server"
  cta="View guide"
  href="/langsmith/deploy-standalone-server"
  icon="server"
>
  使用 Docker、Compose 或 Kubernetes 部署代理服务器。带上您自己的 PostgreSQL、Redis 和 LangSmith 许可证；没有控制平面。可选[LangSmith tracing](/langsmith/observability)到云或自托管实例。
</Card>

</CardGroup>

## 常用设置- **为您的代理托管托管。** LangSmith 在 [Cloud](/langsmith/deploy-to-cloud-overview) 上部署。 LangChain 托管控制平面、数据平面和数据库。与LangSmith云配对。
- **您的 VPC 中的代理，受控制平面管理。** LangSmith 通过 [Hybrid](/langsmith/hybrid) 部署。 LangChain 承载控制平面；您托管代理服务器及其数据平面。与 LangSmith 云或自托管 LangSmith 配对。
- **完整数据驻留或气隙。** [Self-hosted LangSmith Deployment](/langsmith/deploy-with-control-plane)。您可以在自己的基础设施中托管控制平面和代理服务器以及自托管 LangSmith。
- **仅代理运行时，无控制平面。** [Standalone Agent Server](/langsmith/deploy-standalone-server)。在没有控制平面的情况下使用 Docker 或 Kubernetes 运行代理服务器容器，可选择将跟踪发送到 LangSmith 云或自托管。

LangSmith平台运行位置请参见[Platform setup](/langsmith/platform-setup)。

## 部署后

部署后，代理将使用[Agent Server](/langsmith/assistants)的执行模型：**助手**用于配置，**线程**用于状态，**运行**用于工作负载。能力、教程、服务器定制和操作请参见[Agent Server](/langsmith/develop-agents-overview)。

<CardGroup cols={2}>

<Card
  title="Update prompts and contexts without redeploying"
  icon="edit"
  href="/langsmith/prompt-context-hub"
>
管理已部署的代理在运行时提取的提示和版本化上下文，以便您无需完全部署即可更改行为。
</Card><Card
  title="Interact with your deployment using RemoteGraph"
  icon="link"
  href="/langsmith/use-remote-graph"
>
从客户端代码调用您部署的图，就好像它是本地编译的图一样。
</Card>

</CardGroup>

<CardGroup cols={1}>

<Card
  title="Find and fix failures with Engine"
  icon="/images/brand/engine-icon-dark.png"
  href="/langsmith/engine-overview"
>
一旦代理投入生产，使用LangSmith引擎来检测其跟踪中反复出现的故障，诊断根本原因并解决它们。
</Card>

</CardGroup>

## 全栈网络应用程序

将 LangChain.js 代理和聊天 UI 作为单个 Web 应用程序一起发布。 Vite 示例使用 LangSmith Deployment 作为单独 UI 后面的代理后端。其他示例将代理嵌入到 Web 框架的路由处理程序中并发送到主机平台。

<Card
  title="Full-stack web apps"
  cta="View examples"
  href="/langsmith/deploy-frameworks-and-platforms"
  icon="code"
>
发布 LangChain.js 聊天应用程序：将代理嵌入 Next.js、SvelteKit、Nuxt、Cloudflare Workers 或 Deno Deploy（不需要代理服务器），或将 LangSmith 部署与 Vite + React UI 配对。

<div className="not-prose mt-4 grid grid-cols-6 items-center justify-items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
  <span className="inline-flex h-8 w-8 items-center justify-center">
    <img className="h-5 w-5" src="/images/providers/light/langchain.svg" alt="LangSmith" />
  </span>
  <span className="inline-flex h-8 w-8 items-center justify-center">
    <img className="h-5 w-5" src="/images/providers/light/nextjs.svg" alt="Next.js" />
  </span>
  <span className="inline-flex h-8 w-8 items-center justify-center">
    <img className="h-5 w-5" src="/images/providers/light/svelte.svg" alt="SvelteKit" />
  </span>
  <span className="inline-flex h-8 w-8 items-center justify-center">
    <img className="h-5 w-5" src="/images/providers/light/nuxt.svg" alt="Nuxt" />
  </span>
  <span className="inline-flex h-8 w-8 items-center justify-center">
    <img className="h-5 w-5" src="/images/providers/light/cloudflare.svg" alt="Cloudflare Workers" />
  </span>
  <span className="inline-flex h-8 w-8 items-center justify-center">
    <img className="h-5 w-5" src="/images/providers/light/deno.svg" alt="Deno Deploy" />
  </span>
</div>
</Card>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deployment.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>