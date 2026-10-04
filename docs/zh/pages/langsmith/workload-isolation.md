<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Workload isolation | https://docs.langchain.com/langsmith/workload-isolation -->

# 工作负载隔离

LangSmith 使用分层结构来组织您的工作：[*organizations*](/langsmith/administration-overview#organizations)、[*workspaces*](/langsmith/administration-overview#workspaces)、[*agents or applications*](/langsmith/administration-overview#agents-and-applications) 和 [*resources*](/langsmith/administration-overview#resources)。此结构可让您平衡协作与访问控制，从而使您能够根据团队的需求选择正确的隔离级别。

分组级别的名称取决于您的工作区使用的信息架构，左上角的控件会告诉您您所在的信息架构。基于代理的工作区按 [agent](/langsmith/agents) 对资源进行分组，每个代理的踪迹划分为从固定的四个集合中提取的 [environments](/langsmith/agent-environments)。基于项目的工作区按应用程序对它们进行分组，没有环境层，因此环境近似于单独的跟踪项目。基于代理的组织位于[beta](/langsmith/release-stages)。下面的模型适用于两者，并且在重要的地方指出了差异。

LangSmith 权限系统建立在这个层次结构之上。使用 [role-based access control (RBAC)](/langsmith/rbac)，用户 [permissions](/langsmith/organization-workspace-operations) 的范围仅限于一个或多个工作区，从而强制工作区之间的隔离。通过更细粒度的 [attribute-based access control](/langsmith/organization-workspace-operations#access-policies) (ABAC)，可以根据工作区中的标签、代理或应用程序等属性进一步限制或授予访问权限。本页介绍了根据团队的隔离要求组织工作区的两种常见方法：

* [Team-centric workspaces](#team-centric-workspaces)：每个团队单个工作空间（推荐大多数客户）
* [Collaborative workspaces](#collaborative-workspaces)：每个工作区有多个团队

<Tip>
  有关设置组织和工作空间的详细信息，请参阅[Set up hierarchy](/langsmith/set-up-hierarchy)。
</Tip>

## 以团队为中心的工作空间

<Warning>
  这是默认型号，也是大多数客户的推荐选择。
</Warning>

此模型（每个团队单个工作区）使用单个组织作为顶级边界。在组织内，多个工作空间用于隔离不同的团队或业务部门。每个工作区代表特定团队的逻辑边界，并控制该团队可以访问哪些数据和资源。在工作区中，团队根据工作区使用多个组、代理或应用程序来收集支持同一应用程序的资源。

在下图中，生产和登台是基于代理的工作区中的代理环境，以及基于项目的工作区中的独立跟踪项目。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Org[Organization]

    WS1[Workspace: Team A]
    WS2[Workspace: Team B]

    AgentA[Agent or application]
    AgentB[Agent or application]

    ProdA[Production]
    StagingA[Staging]
    DatasetA[Dataset]

    ProdB[Production]
    StagingB[Staging]
    DatasetB[Dataset]

    Org --> WS1
    Org --> WS2

    WS1 --> AgentA
    WS2 --> AgentB

    AgentA --> ProdA
    AgentA --> StagingA
    AgentA --> DatasetA

    AgentB --> ProdB
    AgentB --> StagingB
    AgentB --> DatasetB

    classDef orgStyle fill:#B2DEFF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef wsStyle fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef appStyle fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef resourceStyle fill:#F2FAFF,stroke:#40668D,stroke-width:1px,color:#2F4B68

    class Org orgStyle
    class WS1,WS2 wsStyle
    class AgentA,AgentB appStyle
    class ProdA,StagingA,DatasetA,ProdB,StagingB,DatasetB resourceStyle
```* **优点：** 单个工作区允许共享所有团队资源，使团队内的协作和迭代变得简单。它还简化了从开发到生产的推广。例如，可以使用标签对相同的[prompt](/langsmith/prompt-context-hub#prompts)进行版本控制并升级到生产，而无需复制或重复。
* **缺点：** 开发、测试和生产工作共存于一个工作区中，因此工作区范围的 [RBAC](/langsmith/rbac) 本身并不能将它们分开。在基于代理的工作区中，环境划分代理的跟踪，无需维护任何约定。在基于项目的工作空间中，分离取决于标记规则。 [ABAC](/langsmith/organization-workspace-operations#access-policies) 通过根据资源属性限制访问，在工作空间内提供更细化的权限。

在基于项目的工作空间中，团队通常使用命名约定来近似环境，运行配对项目，例如 `checkout-production` 和 `checkout-staging`。代理环境取代了该约定，因此代理路径上的工作区不需要它。

## 协作工作空间在此模型中（每个工作区有多个团队），多个团队在组织内共享一个工作区，并使用代理或应用程序以及[ABAC](/langsmith/organization-workspace-operations#access-policies)来分离资源并管理访问。因此，[prompts](/langsmith/prompt-context-hub#prompts)和[deployments](/langsmith/deployment)等共享资源可以跨团队重用，而对[traces](/langsmith/observability-concepts#traces)和[datasets](/langsmith/evaluation-concepts#datasets)等敏感资源的访问仅限于所属团队。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Org[Organization]

    WS[Shared Workspace]

    AgentA[Agent or application: Team A]
    AgentB[Agent or application: Team B]

    TracesA[Traces: Team A]
    DatasetA[Dataset: Team A]
    PromptA[Prompt: Shared]

    TracesB[Traces: Team B]
    DatasetB[Dataset: Team B]
    PromptB[Prompt: Shared]

    Org --> WS

    WS --> AgentA
    WS --> AgentB

    AgentA --> TracesA
    AgentA --> DatasetA
    AgentA --> PromptA

    AgentB --> TracesB
    AgentB --> DatasetB
    AgentB --> PromptB

    classDef orgStyle fill:#B2DEFF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef wsStyle fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef appStyle fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef restrictedStyle fill:#F8E8E6,stroke:#B27D75,stroke-width:1px,color:#634643
    classDef sharedStyle fill:#FDF3FF,stroke:#7E65AE,stroke-width:1px,color:#504B5F

    class Org orgStyle
    class WS wsStyle
    class AgentA,AgentB appStyle
    class TracesA,DatasetA,TracesB,DatasetB restrictedStyle
    class PromptA,PromptB sharedStyle
```

* **优点：** 提示和部署等通用资源可以在团队之间共享和重用，从而增强协作并减少重复工作。与以团队为中心的工作空间模型不同，协作不限于单个团队，可以跨越工作空间内的所有团队。
* **缺点：** 团队之间的隔离比多工作空间模型弱，并且取决于 ABAC 的正确使用。配置错误的标签或策略可能会跨团队暴露敏感的[traces](/langsmith/observability-concepts#traces)或[datasets](/langsmith/evaluation-concepts#datasets)，并且跨多个团队管理权限会增加操作复杂性。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/workload-isolation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>