<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deploy agents | https://docs.langchain.com/langsmith/deploy-overview -->

# 部署代理

将代理部署到LangSmith代理服务器、LangSmith云、BYOC、您自己的基础设施或独立服务器上的生产环境。

将代理部署到[LangSmith Agent Server](/langsmith/agent-server)（代理工作负载的运行时）上的生产环境，并具有持久执行、实时流和水平扩展功能。代理服务器托管提供围绕其的基础架构和部署管理。部署到云、BYOC 或您自己的基础设施，或在没有控制平面的情况下运行独立的代理服务器。

> [!注意]
>
> LangSmith 部署现在是 **LangSmith 代理服务器**。

> [!提示]
>
> 此页面涵盖您的代理运行的位置。在哪里运行 LangSmith 本身（用于可观察性、评估和即时工程）是一个单独的选择。有关更多信息，请参阅[Platform setup](/langsmith/platform-setup)。

## 选择您的代理框架

代理服务器与框架无关。您可以部署使用以下工具构建的代理：

> [卡片] [LangGraph (and LangChain)](/langsmith/deployment-quickstart)
>
> 使用 LangGraph CLI 和应用程序模板将应用程序部署到 LangSmith。

> [卡][Google ADK](/langsmith/deploy-google-adk)
>
> 使用 `deployments-wrap-sdk` 软件包将 Google 代理开发工具包 (ADK) 代理部署为 LangGraph。

> [卡片][Other frameworks](/langsmith/deploy-other-frameworks)
>
> 使用功能 API 或 `deployments-wrap-sdk` 部署 Claude Agent SDK、Strands、CrewAI、AutoGen 和其他代理框架。> [卡][Looking to deploy Deep Agents?](/langsmith/python/managed-deep-agents-overview)
>
> 使用托管Deep Agents：用于部署代码优先Deep Agents的托管运行时。

## 选择托管环境

根据您希望运行 [control plane](/langsmith/control-plane) 和 [data plane](/langsmith/data-plane)（代理服务器及其数据库）的位置选择环境。所有基础设施类型都使用相同的[Agent Server](/langsmith/agent-server)运行时。

> [卡][Cloud](/langsmith/deploy-to-cloud-overview)
>
> 由 AWS、Azure 和 GCP 上的LangChain 完全管理。在 LangSmith UI 中或使用 [⟦T2⟧](/langsmith/cli#deploy) 从 GitHub 创建部署。需要[Plus plan or above](https://www.langchain.com/pricing)。

> [卡][Self-hosted with control plane](/langsmith/deploy-with-control-plane)
>
> 在您自己的 Kubernetes 集群中运行 LangSmith 代理服务器控制平面和代理服务器，以及自托管 LangSmith。需要启用代理服务器托管的[Enterprise plan](https://www.langchain.com/pricing)。

> [卡][Hybrid](/langsmith/hybrid)
>
> LangChain 托管控制平面，具有代理服务器及其基础设施中的数据平面。跟踪流向LangSmith云或自托管LangSmith。

> [卡][Standalone server](/langsmith/deploy-standalone-server)
>
> 使用 Docker、Compose 或 Kubernetes 部署代理服务器。带上您自己的 PostgreSQL、Redis 和 LangSmith 许可证；没有控制平面。可选[LangSmith tracing](/langsmith/observability)到云或自托管实例。

## 常用设置* **为您的代理托管托管。** LangSmith [Cloud](/langsmith/deploy-to-cloud-overview) 上的代理服务器。 LangChain 托管控制平面、数据平面和数据库。与LangSmith云配对。
* **VPC 中的代理，由控制平面管理。** LangSmith 代理服务器通过 [Hybrid](/langsmith/hybrid)。 LangChain 托管控制平面；您托管代理服务器及其数据平面。与 LangSmith 云或自托管 LangSmith 配对。
* **完整数据驻留或气隙。** [Self-hosted Agent Server hosting](/langsmith/deploy-with-control-plane)。您可以在自己的基础设施中托管控制平面和代理服务器以及自托管 LangSmith。
* **仅代理运行时，无控制平面。** [Standalone Agent Server](/langsmith/deploy-standalone-server)。在没有控制平面的情况下使用 Docker 或 Kubernetes 运行代理服务器容器，可选择将跟踪发送到 LangSmith 云或自托管。

## 了解定价

LangSmith 云上的代理服务器根据每个代理服务器请求的计算和数据库资源进行计费。

> [!注意]
>
> 托管在 LangSmith 云上的代理服务器需要 Plus 或 Enterprise 计划。欲了解更多信息，请参阅[pricing page](https://www.langchain.com/pricing)。

> [卡片][LangSmith Agent Server billing](/langsmith/billing#langsmith-deployment-billing)
>
> 查看费率、每种部署规模的每小时成本以及降低部署成本的方法。

## 部署后部署的代理使用代理服务器执行模型：**助手**用于配置，**线程**用于状态，**运行**用于工作负载。有关功能、身份验证、服务器自定义和教程，请参阅 [Agent Server](/langsmith/agent-server)。

> [卡][Update prompts and contexts without redeploying](/langsmith/prompt-context-hub)
>
> 管理您部署的代理在运行时提取的提示和版本化上下文，以便您无需完全部署即可更改行为。

> [卡][Interact with your deployment using RemoteGraph](/langsmith/use-remote-graph)
>
> 从客户端代码调用您部署的图，就好像它是本地编译的图一样。

> [卡][Find and fix failures with Engine](/langsmith/engine)
>
> 一旦代理投入生产，使用 LangSmith 引擎来检测其跟踪中重复出现的故障，诊断根本原因并解决它们。

## 全栈网络应用程序

将 LangChain.js 代理和聊天 UI 作为单个 Web 应用程序一起发布。 Vite 示例使用 LangSmith 代理服务器作为单独 UI 后面的代理后端。其他示例将代理嵌入到 Web 框架的路由处理程序中并发送到主机平台。

> [卡][Full-stack web apps](/langsmith/deploy-frameworks-and-platforms)
>
> 发布 LangChain.js 聊天应用程序：将代理嵌入 Next.js、SvelteKit、Nuxt、Cloudflare Workers 或 Deno Deploy（无需代理服务器），或将 LangSmith 代理服务器与 Vite + React UI 配对。
>
> ![LangSmith](https://mintcdn.com/langchain-5e9cc07a/ZPKed1feKJ8F6LVo/images/providers/light/langchain.svg?fit=max\&auto=format\&n=ZPKed1feKJ8F6LVo\&q=85\&s=b910ed9cd0b6b8adb4b6da400882e92c)
>
> ![Next.js](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/nextjs.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=4f3336e9534db50f25f87173a41322d5)
>
> ![SvelteKit](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/svelte.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=07e7e35c40e4522f739feea9ef3e33b7)
>
> ![Nuxt](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/nuxt.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=5d965ed1f93f51ac604e66b935a65368)
>
> ![Cloudflare Workers](https://mintcdn.com/langchain-5e9cc07a/h9vvRKKSgCSjvd_Y/images/providers/light/cloudflare.svg?fit=max\&auto=format\&n=h9vvRKKSgCSjvd_Y\&q=85\&s=ae129fcbfc78ccaece42b1c4d3699311)
>
> ![Deno Deploy](https://mintcdn.com/langchain-5e9cc07a/Tz8fh3A43FeUPf69/images/providers/light/deno.svg?fit=max\&auto=format\&n=Tz8fh3A43FeUPf69\&q=85\&s=8d213b0000104542fcaa7ab160595224)

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/deploy-overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。