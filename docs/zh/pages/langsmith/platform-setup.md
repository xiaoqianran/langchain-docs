<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up LangSmith | https://docs.langchain.com/langsmith/platform-setup -->

# 设置 LangSmith

托管和管理 LangSmith 基础设施，以实现可观察性、评估和即时工程。

<div>
  <div>
    <h1>设置 LangSmith</h1>

    为 [observability](/langsmith/observability)、[evaluation](/langsmith/evaluation) 和 [prompt engineering](/langsmith/prompt-context-hub#prompts) 设置 **LangSmith**。 LangSmith 提供两种托管模式：完全托管的云或用于完全控制的自托管（企业）。

    如果您还想在生产中部署代理，则可以将[**LangSmith Deployment**](/langsmith/deployment)与任一托管模型一起使用。

    <CardGroup>
      <Card title="Cloud" href="/langsmith/cloud" icon="cloud">
        全面管理的可观察性、评估和即时工程。
      </Card>

      <Card title="Self-hosted" href="/langsmith/self-hosted" icon="server">
        **（企业）** 通过基础设施中的可观察性、评估和及时工程进行完全控制。
      </Card>
    </CardGroup>

    <Callout>
      自托管可在 [Enterprise plan](/langsmith/pricing-plans) 上使用。 [Get a demo](https://www.langchain.com/contact-sales) 了解更多。
    </Callout>

    <h2>比较云和自托管</h2>|特色 | **云** | **自托管** |
    | ------------------------------------------------ | ----------------------------------- | ------------------------------------------------ |
    | **基础设施位置** |LangChain云|您的基础设施|
    | **谁管理更新** |LangChain |你|
    | **可观测性数据位置** |LangChain云 |您的基础设施|
    | **与 LangSmith 部署配对** |是的 |当您启用 LangSmith 部署 |
    | **[Pricing](https://www.langchain.com/pricing)** |高级 |企业 |
    | **最适合** |快速设置、托管基础架构 |全程掌控，数据隔离 |两种托管模型都支持代理工作负载的[LangSmith Deployment](/langsmith/deployment)。请参阅 [LangSmith Deployment overview](/langsmith/deployment) 选择拓扑（云管理、混合、带控制平面的自托管或独立）。

    <h2>常用设置</h2>

    * **启动速度最快，管理一切。** [LangSmith Cloud](/langsmith/cloud) 与[LangSmith Deployment](/langsmith/deployment) 在云端配对。 LangChain 托管该平台，并且当您使用 LangSmith Deployment 时，还托管您的[Agent Servers](/langsmith/agent-server)。
    * **可观测性数据必须保留在您的基础设施中。** 自托管 LangSmith，与任何 LangSmith 部署拓扑配对，包括用于代理工作负载的 [self-hosted LangSmith Deployment](/langsmith/deploy-with-control-plane)。
    * **托管可观测性，VPC 中的代理。** LangSmith 云与 [Hybrid](/langsmith/hybrid) LangSmith 部署配对。跟踪和评估保留在 SaaS 上，而代理工作负载保留在您的基础设施中。
    * **仅可观察性，无代理托管。** LangSmith 云或自托管，无需 LangSmith 部署。在您已经运行应用程序的地方运行您的代理并将跟踪发送到 LangSmith。

    <h2>相关</h2>

    <CardGroup>
      <Card title="Account setup" href="/langsmith/admin" icon="user-cog">
        创建帐户、管理 API 密钥并选择定价层。
      </Card>

      <Card title="Plans and pricing" href="https://www.langchain.com/pricing" icon="credit-card">
        比较 LangSmith 计划和等级。
      </Card><Card title="Observability" href="/langsmith/observability" icon="chart-line">
        跟踪和监控您的 LLM 申请。
      </Card>
    </CardGroup>
  </div>
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/platform-setup.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>