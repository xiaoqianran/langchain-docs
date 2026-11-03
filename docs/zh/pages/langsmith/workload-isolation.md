<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Workload isolation | https://docs.langchain.com/langsmith/workload-isolation -->

# 工作负载隔离

LangSmith 使用层次结构来组织您的工作：组织、工作区、代理或应用程序以及资源。此结构可让您平衡协作与访问控制，从而使您能够根据组织的需求选择正确的隔离级别。

分组级别的名称取决于您的工作区使用的信息架构。左上角的控件会告诉您您所在的位置：

* 基于代理的工作区按 [agent](/langsmith/agent-registry#agent) 对资源进行分组，每个代理的跟踪记录划分为从固定的四个集合中提取的 [environments](/langsmith/agent-environments)。
* 基于项目的工作区按应用程序对它们进行分组，没有环境层，因此环境近似于单独的跟踪项目。

下面介绍的模型对两者都适用，并且在重要的地方指出了差异。

本页介绍了根据组织的隔离要求组织工作区的两种常见方法：

* [Isolate by workspace](#isolate-by-workspace)：每个业务部门一个工作空间（推荐大多数客户使用）
* [Isolate by agent or application](#isolate-by-agent-or-application)：每个工作区多个业务部门

> [!提示]
>
> 有关设置组织和工作空间的详细信息，请参阅[Set up hierarchy](/langsmith/set-up-hierarchy)。## 使用 RBAC 和 ABAC 控制访问

LangSmith权限系统建立在[resource hierarchy](/langsmith/administration-overview#resource-hierarchy)之上：

* 使用[role-based access control (RBAC)](/langsmith/rbac)，用户权限范围仅限于一个或多个工作区，从而强制工作区之间的隔离。
* 通过更细粒度的[attribute-based access control](/langsmith/organization-workspace-operations#access-policies) (ABAC)，可以根据工作区中的标签、代理或应用程序等属性进一步限制或授予访问权限。例如，ABAC 可以限制仅访问开发资源或仅访问与特定代理或应用程序关联的资源。

## 按工作区隔离

> [!警告]
>
> 这是默认型号，也是大多数客户的推荐选择。

在此模型中，组织中的每个业务部门都有自己的工作空间。工作区是隔离边界：它控制业务部门可以访问哪些数据和资源。在工作区中，业务部门根据工作区按代理或应用程序对支持同一应用程序的资源进行分组。

在下图中，生产和登台是基于代理的工作区中的代理环境，以及基于项目的工作区中的独立跟踪项目。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Org[Organization]

    WS1[Workspace: Business Unit A]
    WS2[Workspace: Business Unit B]

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
```* **优点：** 单个工作区允许属于某个业务部门的所有资源在该业务部门内共享。这使得单元内的协作和迭代变得简单。它还简化了从开发到生产的推广。例如，可以使用标签对相同的[prompt](/langsmith/prompt-context-hub#prompts)进行版本控制并升级到生产，而无需复制或重复。
* **缺点：** 开发、测试和生产工作共存于一个工作区中，因此工作区范围的 [RBAC](/langsmith/rbac) 本身并不能将它们分开。在基于代理的工作区中，环境划分代理的跟踪，无需维护任何约定。在基于项目的工作空间中，分隔取决于命名约定，例如配对项目`checkout-production`和`checkout-staging`。 [ABAC](/langsmith/organization-workspace-operations#access-policies) 通过根据资源属性限制访问，例如允许用户仅访问开发资源，在工作区中提供更细化的权限。

## 通过代理或应用程序隔离在此模型中，多个业务部门在组织内共享一个工作区。他们使用代理或应用程序以及[ABAC](/langsmith/organization-workspace-operations#access-policies)来分离资源并管理访问。因此，[prompts](/langsmith/prompt-context-hub#prompts)和[deployments](/langsmith/deployment)等共享资源可以跨业务部门重用。对[traces](/langsmith/observability-concepts#traces)和[datasets](/langsmith/evaluation-concepts#datasets)等敏感资源的访问仅限于所属业务部门。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Org[Organization]

    WS[Shared Workspace]

    AgentA[Agent or application: Business Unit A]
    AgentB[Agent or application: Business Unit B]

    TracesA[Traces: Business Unit A]
    DatasetA[Dataset: Business Unit A]
    PromptA[Prompt: Shared]

    TracesB[Traces: Business Unit B]
    DatasetB[Dataset: Business Unit B]
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

* **优点：** 提示和部署等通用资源可以在业务部门之间共享和重用，从而增强协作并减少重复工作。与按工作空间隔离不同，协作可以跨越工作空间内的多个业务部门。
* **缺点：** 业务部门之间的隔离比多工作空间模型弱，并且取决于 ABAC 的正确使用。配置错误的标签或策略可能会暴露跨业务部门的敏感[traces](/langsmith/observability-concepts#traces)或[datasets](/langsmith/evaluation-concepts#datasets)。跨多个业务部门管理权限可能会增加操作复杂性。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/workload-isolation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。