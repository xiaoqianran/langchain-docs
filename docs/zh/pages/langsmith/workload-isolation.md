<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Workload isolation | https://docs.langchain.com/langsmith/workload-isolation -->

# 工作负载隔离

LangSmith 使用分层结构来组织您的工作：[*organizations*](/langsmith/administration-overview#organizations)、[*workspaces*](/langsmith/administration-overview#workspaces)、[*applications*](/langsmith/administration-overview#applications) 和 [*resources*](/langsmith/administration-overview#resources)。此结构可让您平衡协作与访问控制，从而允许您根据团队的需求选择正确的隔离级别。

LangSmith 权限系统建立在这个层次结构之上。使用 [role-based access control (RBAC)](/langsmith/rbac)，用户 [permissions](/langsmith/organization-workspace-operations) 的范围仅限于一个或多个工作区，从而在工作区之间强制隔离。通过更细粒度的[attribute-based access control](/langsmith/organization-workspace-operations#access-policies) (ABAC)，可以根据工作区中的标签或应用程序等属性进一步限制或授予访问权限（例如，允许用户仅访问开发资源或仅访问与特定应用程序关联的资源）。

本页介绍了根据团队的隔离要求组织工作区的三种常见方法：

* [Team-centric workspaces](#team-centric-workspaces)：每个团队单个工作空间（推荐大多数客户使用）
* [Collaborative workspaces](#collaborative-workspaces)：每个工作区有多个团队
* [Project-isolated workspaces](#project-isolated-workspaces)：每个团队多个工作空间（满足严格的隔离要求）

<Tip>
  有关设置组织和工作空间的详细信息，请参阅[Set up hierarchy](/langsmith/set-up-hierarchy)。
</Tip>

## 以团队为中心的工作空间

<Warning>
  这是默认型号，也是大多数客户的推荐选择。
</Warning>此模型（每个团队单个工作区）使用单个组织作为顶级边界。在组织内，多个工作空间用于隔离不同的团队或业务部门。每个工作区代表特定团队的逻辑边界，并控制该团队可以访问哪些数据和资源。在工作区中，团队使用多个应用程序将支持同一代理的资源组合在一起。应用程序还可能包含不同的资源，例如用于开发和生产环境的单独跟踪项目。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Org[Organization]

    WS1[Workspace: Team A]
    WS2[Workspace: Team B]

    App1A[Application]
    App1B[Application]

    DevA[Dev Tracing Project]
    ProdA[Prod Tracing Project]
    DatasetA[Dataset]

    DevB[Dev Tracing Project]
    ProdB[Prod Tracing Project]
    DatasetB[Dataset]

    Org --> WS1
    Org --> WS2

    WS1 --> App1A
    WS2 --> App1B

    App1A --> DevA
    App1A --> ProdA
    App1A --> DatasetA

    App1B --> DevB
    App1B --> ProdB
    App1B --> DatasetB

    classDef orgStyle fill:#B2DEFF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef wsStyle fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef appStyle fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef resourceStyle fill:#F2FAFF,stroke:#40668D,stroke-width:1px,color:#2F4B68

    class Org orgStyle
    class WS1,WS2 wsStyle
    class App1A,App1B appStyle
    class DevA,ProdA,DatasetA,DevB,ProdB,DatasetB resourceStyle
```* **优点：** 单个工作区允许共享所有团队资源，使团队内的协作和迭代变得简单。它还简化了从开发到生产的推广。例如，可以使用标签对相同的[prompt](/langsmith/prompt-context-hub#prompts)进行版本控制并升级到生产，而无需复制或重复。
* **缺点：** 主要的权衡是同一团队的环境之间的隔离有限。开发、测试和生产资源共存于同一应用程序中，因此团队必须依靠标记和约定来避免对生产的意外影响。 [RBAC](/langsmith/rbac) 的范围位于工作区级别。 [ABAC](/langsmith/organization-workspace-operations#access-policies) 通过根据资源属性限制访问，例如允许用户仅访问开发资源，在工作空间内提供更细化的权限。

## 协作工作空间

在此模型中（每个工作区有多个团队），多个团队在组织内共享一个工作区，并使用应用程序和 [ABAC](/langsmith/organization-workspace-operations#access-policies) 来分离资源并管理访问。因此，[prompts](/langsmith/prompt-context-hub#prompts)和[deployments](/langsmith/deployment)等共享资源可以跨团队重用，而对[traces](/langsmith/observability-concepts#traces)和[datasets](/langsmith/evaluation-concepts#datasets)等敏感资源的访问仅限于所属团队。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Org[Organization]

    WS[Shared Workspace]

    AppA[Application: Team A]
    AppB[Application: Team B]

    TracesA[Traces: Team A]
    DatasetA[Dataset: Team A]
    PromptA[Prompt: Shared]

    TracesB[Traces: Team B]
    DatasetB[Dataset: Team B]
    PromptB[Prompt: Shared]

    Org --> WS

    WS --> AppA
    WS --> AppB

    AppA --> TracesA
    AppA --> DatasetA
    AppA --> PromptA

    AppB --> TracesB
    AppB --> DatasetB
    AppB --> PromptB

    classDef orgStyle fill:#B2DEFF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef wsStyle fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef appStyle fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef restrictedStyle fill:#F8E8E6,stroke:#B27D75,stroke-width:1px,color:#634643
    classDef sharedStyle fill:#FDF3FF,stroke:#7E65AE,stroke-width:1px,color:#504B5F

    class Org orgStyle
    class WS wsStyle
    class AppA,AppB appStyle
    class TracesA,DatasetA,TracesB,DatasetB restrictedStyle
    class PromptA,PromptB sharedStyle
```* **优点：** 提示和部署等通用资源可以在团队之间共享和重用，从而增强协作并减少重复工作。与以团队为中心的工作空间模型不同，协作不限于单个团队，可以跨越工作空间内的所有团队。
* **缺点：** 团队和环境之间的隔离比多工作空间模型弱，并且取决于 ABAC 的正确使用。配置错误的标签或策略可能会跨团队暴露敏感的[traces](/langsmith/observability-concepts#traces)或[datasets](/langsmith/evaluation-concepts#datasets)，并且跨多个团队管理权限会增加操作复杂性。

## 项目隔离的工作区

<Callout icon="check">
  仅当需要严格隔离时才应使用此方法。
</Callout>

在此模型（每个团队有多个工作区）中，通过为单个团队创建多个工作区来增强隔离性。工作空间可以按项目或环境组织，例如单独的开发和生产工作空间。每个工作区都是完全隔离的，拥有自己的用户、数据和资源，并且访问权限严格限制在该工作区范围内。

```mermaid actions={false} theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    Org[Organization]

    WSDev[Workspace: Dev]
    WSProd[Workspace: Prod]

    AppDev[Application]
    AppProd[Application]

    TracesDev[Traces]
    DatasetDev[Dataset]
    DeploymentDev[Deployment]

    TracesProd[Traces]
    DatasetProd[Dataset]
    DeploymentProd[Deployment]

    Org --> WSDev
    Org --> WSProd

    WSDev --> AppDev
    WSProd --> AppProd

    AppDev --> TracesDev
    AppDev --> DatasetDev
    AppDev --> DeploymentDev

    AppProd --> TracesProd
    AppProd --> DatasetProd
    AppProd --> DeploymentProd

    classDef orgStyle fill:#B2DEFF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef wsStyle fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef appStyle fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef resourceStyle fill:#F2FAFF,stroke:#40668D,stroke-width:1px,color:#2F4B68

    class Org orgStyle
    class WSDev,WSProd wsStyle
    class AppDev,AppProd appStyle
    class TracesDev,DatasetDev,DeploymentDev,TracesProd,DatasetProd,DeploymentProd resourceStyle
```* **优点：** 团队、项目和环境之间的强隔离。仅有权访问开发工作区的用户无法查看或访问生产数据或任何生产资源，从而降低了意外更改或跨环境误用的风险。
* **缺点：** 资源无法跨工作区共享。即使将代理从开发升级到生产，重用 [prompts](/langsmith/prompt-context-hub#prompts)、[datasets](/langsmith/evaluation-concepts#datasets) 或 [experiments](/langsmith/evaluation-concepts#experiment) 也需要在工作区之间进行手动复制，这会带来摩擦和重复。为了减少这种开销，您可以使用 [LangSmith Data Migration Tool](https://github.com/langchain-ai/langsmith-data-migration-tool) 在工作区之间复制提示、数据集或实验。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/workload-isolation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>