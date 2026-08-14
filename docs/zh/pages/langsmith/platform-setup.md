<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up LangSmith | https://docs.langchain.com/langsmith/platform-setup -->

# 设置LangSmith

托管和管理用于可观察性、评估和即时工程的LangSmith基础设施。

<div>
  <div>
    <h1>概述</h1>

    为 [observability](/langsmith/observability)、[evaluation](/langsmith/evaluation) 和 [prompt engineering](/langsmith/prompt-context-hub#prompts) 设置 **LangSmith**。 LangSmith 提供云、自带云 (BYOC) 和自托管选项。

    如果您还想在生产中部署代理，则可以将 [**LangSmith Deployment**](/langsmith/deployment) 与云、BYOC 或自托管结合使用。

    <CardGroup>
      <Card title="Cloud" href="/langsmith/cloud" icon="cloud">
        全面管理的可观察性、评估和即时工程。
      </Card>

      <Card title="BYOC" href="/langsmith/byoc" icon="cloud-cog">
        **（企业）** 完全控制您的数据，而 LangChain 管理基础设施。
      </Card>

      <Card title="Self-hosted" href="/langsmith/self-hosted" icon="server">
        **（企业）** 通过基础设施中的可观察性、评估和及时工程进行完全控制。
      </Card>
    </CardGroup>

    <Callout>
      [Enterprise plan](/langsmith/pricing-plans) 上提供自托管和 BYOC。 [Get a demo](https://www.langchain.com/contact-sales) 了解更多。
    </Callout>

    <h2>比较云、BYOC 和自托管</h2>|特色 | **云** | **自带设备** | **自托管** |
    | ------------------------------------------- | ----------------- | ---------------------------------------------------------------------- | ---------------- |
    | **谁运行基础设施** | LangChain | LangChain 运行控制平面，您运行数据平面 |你|
    | **敏感数据所在的地方** | LangChain的云 |您的 VPC |您的 VPC |
    | **升级和补丁** |自动|自动|手册|
    | **缩放** |自动|自动，由LangChain管理 |手册|

    针对代理工作负载的云、BYOC 和自托管支持[LangSmith Deployment](/langsmith/deployment)。请参阅 [LangSmith Deployment overview](/langsmith/deployment) 选择拓扑（云托管、BYOC、混合、带控制平面的自托管或独立）。

    <h2>常用设置</h2>* **启动速度最快，管理一切。** [LangSmith Cloud](/langsmith/cloud) 与[LangSmith Deployment](/langsmith/deployment) 在云端配对。 LangChain 托管平台，并且当您使用 LangSmith 部署时，还托管您的 [Agent Servers](/langsmith/agent-server)。
    * **自带云。** 数据保留在您的 VPC 中，LangChain 管理基础设施。请参阅[BYOC overview](/langsmith/byoc)。
    * **可观测性数据必须保留在您的基础设施中。** 自托管 LangSmith，与任何 LangSmith 部署拓扑配对，包括用于代理工作负载的 [self-hosted LangSmith Deployment](/langsmith/deploy-with-control-plane)。
    * **托管可观察性，VPC 中的代理。** LangSmith 云与 [Hybrid](/langsmith/hybrid) LangSmith 部署配对。跟踪和评估保留在 SaaS 上，而代理工作负载保留在您的基础设施中。
    * **仅可观察性，无代理托管。** LangSmith 云或自托管，无需 LangSmith 部署。在您已经运行应用程序的地方运行您的代理并将跟踪发送到LangSmith。

    <h2>相关</h2>

    <CardGroup>
      <Card title="Account setup" href="/langsmith/admin" icon="user-cog">
        创建帐户、管理 API 密钥并选择定价层。
      </Card>

      <Card title="Plans and pricing" href="https://www.langchain.com/pricing" icon="credit-card">
        比较 LangSmith 计划和等级。
      </Card>

      <Card title="Observability" href="/langsmith/observability" icon="chart-line">
        跟踪和监控您的 LLM 申请。
      </Card>
    </CardGroup>
  </div>
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/platform-setup.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>