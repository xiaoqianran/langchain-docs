<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Set up hierarchy | https://docs.langchain.com/langsmith/set-up-hierarchy -->

# 设置层次结构

本页介绍了设置和管理您的 LangSmith [_organization_](/langsmith/administration-overview#organizations) 和 [_workspaces_](/langsmith/administration-overview#workspaces)：

- [Set up an organization](#set-up-an-organization)：创建和管理团队协作的组织，包括用户管理和角色分配。
- [Set up a workspace](#set-up-a-workspace)：设置和配置工作区以组织您的 LangSmith 资源、管理工作区成员以及配置团队协作设置。
- [Set up applications](#set-up-applications)：在工作区中设置应用程序以进一步组织LangSmith资源，并利用ABAC许可。

<Check>
在阅读此设置页面之前，您可能会发现参考[overview on LangSmith resource hierarchy](/langsmith/administration-overview)很有帮助。
</Check>

## 成立组织

<Note>
如果您有兴趣以编程方式管理您的组织和工作区，请参阅[Manage organizations using the API](/langsmith/manage-organization-by-api)。
</Note>

### 创建一个组织

当您第一次登录[UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-set-up-hierarchy)时，LangSmith会自动为您创建个人组织。如果您想与其他人协作，您可以创建一个单独的组织并邀请您的团队成员加入。

1. 单击左下角的个人资料图标，打开 **组织** 抽屉
1. 选择菜单顶部的组织配置文件下拉列表。
1. 单击**+ 创建组织**。共享组织需要信用卡才能使用。您需要[set up billing](/langsmith/billing#set-up-billing-for-your-account)才能继续。

### 管理和导航工作区

一旦您订阅了允许每个组织使用多个用户的 [plan](/langsmith/pricing-plans)，您就可以设置 [workspaces](/langsmith/administration-overview#workspaces) 以更有效地协作并隔离不同用户组之间的 LangSmith 资源。要在工作区之间导航并访问每个工作区中的资源（跟踪项目、注释队列等），请从 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-set-up-hierarchy) 左下角的选择器中选择所需的工作区。

### 管理用户

在 [Settings page](https://smith.langchain.com/settings) 上的 **成员和角色** 选项卡中管理共享组织中的成员资格。在这里您可以：

- 邀请新用户加入您的组织，选择工作区成员资格和（如果启用 [RBAC](/langsmith/rbac)）工作区角色。
- 编辑用户的组织角色。
- 从您的组织中删除用户。

[Enterprise plan](/langsmith/pricing-plans) 上的组织可以在 **角色** 选项卡中设置自定义工作区角色。详情请参阅[access control setup guide](/langsmith/user-management)。

#### 组织角色

组织范围的角色用于确定对组织设置的访问权限。所选角色也会对工作区成员资格产生影响：- **组织管理员** 授予管理所有组织配置、用户、计费和工作区的完全访问权限。任何组织管理员都拥有对组织中所有工作区的 `Admin` 访问权限。
- **组织用户**可以读取组织信息，但无法在组织级别执行任何写入操作。您可以像往常一样将组织用户添加到工作区子集并分配工作区角色（如果启用了[RBAC](/langsmith/rbac)），这指定了工作区级别的权限。

<Info>
[Organization User](/langsmith/rbac#organization-user) 和 [Organization Viewer](/langsmith/rbac#organization-viewer) 角色仅在[Plus and Enterprise plans](https://langchain.com/pricing) 上的组织中可用。在开发者组织（单个工作区）中，默认情况下为所有用户分配 [Organization Admin](/langsmith/rbac#organization-admin) 角色。自定义组织范围的角色不可用。
</Info>

有关与每个角色关联的权限的完整列表，请参阅 [Administration overview](/langsmith/administration-overview#organization-roles) 页面。

## 设置工作空间当您第一次登录时，LangSmith会在您的个人组织中为您创建一个默认的[workspace](/langsmith/administration-overview#workspaces)。您可以使用工作区来分隔不同团队或业务部门之间的资源，以在它们之间建立清晰的信任边界。在每个工作区中，[Role-Based Access Control (RBAC)](/langsmith/rbac) 管理权限和访问级别，这确保用户只能访问其角色所需的资源和设置。大多数 LangSmith 活动发生在工作空间的上下文中，每个工作空间都有自己的设置和访问控制。

有关为您的团队选择正确的工作区组织模型（每个团队单个工作区、每个工作区多个团队或每个团队多个工作区）的指南，请参阅[Workload isolation](/langsmith/workload-isolation)。

### 创建工作区

要创建新工作区，请导航至共享组织中的 [**Settings** page](https://smith.langchain.com/settings) **工作区** 选项卡，然后单击 **添加工作区**。

创建工作区后，您可以通过在 **设置** 页面上选择工作区来管理其成员和其他配置。

<Note>
不同的计划对组织中可以使用的工作空间数量有不同的限制。欲了解更多信息，请参阅[pricing page](https://www.langchain.com/pricing-langsmith)。
</Note>

### 管理用户<Info>
只有 [workspace admins](/langsmith/rbac#workspace-admin) 可以管理工作区成员资格，并且如果启用 RBAC，则可以更改用户的工作区角色。
</Info>

对于已经是组织成员的用户，工作区管理员可以将其添加到 [**Workspaces settings** page](https://smith.langchain.com/settings/workspaces) 上的 **工作区成员** 选项卡中的工作区。当用户被邀请加入某个组织时，也可能会被直接邀请到一个或多个工作区。

### 配置工作区设置

工作区配置位于 [**Workspaces settings** page](https://smith.langchain.com/settings/workspaces) 选项卡中。选择要配置的工作区，然后选择所需的配置子选项卡。
配置选项包括：

- **工作区成员**
- **API 密钥**
- **秘密**
- **反馈配置**
- **型号**
- **规则**
- **共享 URL**

### 删除工作区

<Warning>
删除工作区将永久删除该工作区和所有关联数据。此操作无法撤消。
</Warning>

您可以通过[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-set-up-hierarchy)或[API](/langsmith/smith-api/workspaces/delete-workspace)删除工作空间。您必须是 [workspace admin](/langsmith/rbac#workspace-admin) 才能删除工作区。

在 LangSmith 用户界面中：

1. 导航至**设置**。
1. 选择要删除的工作区。
1. 单击屏幕右上角的删除图标<Icon icon="trash" iconType="solid"/>。

## 设置应用程序您可以在工作区中创建应用程序以进一步组织资源，例如跟踪项目和数据集。一个工作区可能有零个或多个应用程序。

您可以通过从 LangSmith UI 主页中选择“**所有应用程序**”来查看工作区中的所有资源。您可以通过将资源添加到 **设置** 页面上 **资源标签** 下的 `Application` 标签来将资源标记到多个应用程序。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/set-up-hierarchy.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>