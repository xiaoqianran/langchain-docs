<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: What changes in LangSmith v0.18 | https://docs.langchain.com/langsmith/self-host-agent-migration -->

# LangSmith v0.18 有哪些变化

自托管 LangSmith v0.18 如何将现有跟踪项目移动到代理和环境、迁移时间表以及每个工作区中的更改。

自托管 LangSmith v0.18 通过 [agent](/langsmith/agent-registry#agent) 组织每个工作区，而不是通过跟踪项目。每个代理将其踪迹划分为来自固定集合的[environments](/langsmith/agent-environments)：**生产**、**暂存**、**开发**和**本地**。每个跟踪都会记录生成它的代理及其运行的环境，因此警报、仪表板和评估器可以定位一个环境，而无需对其进行过滤。当您升级现有安装时，LangSmith 会自动将您的跟踪项目迁移到代理。

此页面适用于自托管安装的管理员。对于升级本身，请参阅[Upgrade an installation](/langsmith/self-host-upgrades)。 v0.18 或更高版本上的新安装从代理开始，因此无需迁移任何内容。

## 升级之前

> [!警告]
>
> 迁移无法撤消。一旦运行，请勿从迁移之前降级到 LangSmith 版本。如果降级，旧版本创建的跟踪项目可能永远不会迁移到代理。* **一次升级一个主要版本**：在升级到 0.18 之前先升级到最新的 0.17 图表。参见[Upgrade an installation](/langsmith/self-host-upgrades)。
* **无需身份验证的安装**：LangSmith 不会迁移既未启用基本身份验证也未启用 SSO 的安装。其工作区在升级后保留了跟踪项目体验。要将其移动到代理，请配置 [basic auth](/langsmith/self-host-basic-auth) 或 [SSO](/langsmith/self-host-sso)，然后 LangSmith 运行迁移。

## 迁移如何运行

Helm 图表值 `config.agentMigration.enabled` 控制迁移，默认为 `true`。它不需要额外的基础设施或权限。所需时间取决于安装有多少工作区和跟踪项目。

1. 升级后的服务启动后约10分钟，迁移自行开始。重新启动不会重置此延迟。
2. LangSmith 单独迁移每个工作空间。工作区在其自身的迁移完成后立即切换到代理，而无需等待安装的其余部分。
3. 迁移处于活动状态时，LangSmith 检查迁移的工作区以跟踪迁移后创建的项目，并迁移这些项目。
4. 24 小时后，如果没有新的跟踪项目要迁移，则迁移停止。以后升级就不再运行了。跟踪在整个迁移过程中持续发挥作用。在工作区迁移之前，用户会看到跟踪项目体验。

要暂停迁移，请将 `enabled` 值设置为 `false`：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  agentMigration:
    enabled: false
```

使用 `helm upgrade` 应用更改，这会重新启动读取设置的 LangSmith Pod。要恢复，请将值设置回 `true`。迁移从停止的地方继续。暂停并不结束迁移。恢复后，仅当完整检查发现没有任何内容需要迁移并且过去 24 小时内没有发生任何迁移工作（包括暂停的时间）时，迁移才会永久停止。

## 检查工作空间是否已迁移

迁移后的工作区会在顶部栏中显示 [agent switcher](/langsmith/navigate-agents)，左上角的控件将成为为您的工作区命名的工作区切换器。尚未迁移的工作区仍显示跟踪项目体验。

## 跟踪项目如何映射到代理

LangSmith 不会重新摄取、移动或重命名您的痕迹。每个跟踪项目都会保留其 ID、名称和历史记录：* **每个跟踪项目一个代理**：每个跟踪项目都成为自己的代理，具有 **生产** 环境。该环境是原始的跟踪项目。迁移不会创建**暂存**、**开发**或**本地**环境。
* **不按名称合并**：名为 `checkout`、`checkout-prod` 和 `checkout-staging` 的跟踪项目成为三个独立的代理，而不是一个具有三个环境的代理。
* **代理标识符**：LangSmith从项目名称中派生标识符，转换为小写字母、数字和连字符。当 [deployment](/langsmith/deploy-overview) 拥有跟踪项目时，标识符和显示名称将改为来自部署的名称。如果标识符已被使用，或者跟踪项目已使用代理未来环境之一所需的名称（例如 `checkout-staging` 代表 `checkout`），LangSmith 将添加一个连字符和八个数字，例如 `checkout-12345678`。要查找代理的最终标识符，请在[Agent Registry](/langsmith/agent-registry)中打开它。
* **保持原样的项目**：LangSmith 不会转换实验、LangSmith 为其自身功能创建的项目，或跟踪属于代理预览部署的项目。您稍后添加的新环境将获取一个以代理标识符、连字符和环境命名的跟踪项目。例如，标识符为 `billing` 的代理在 `billing-staging` 中具有其暂存痕迹。迁移后创建的跟踪项目（例如通过将跟踪发送到新项目名称的代码）将成为具有 **生产** 环境的新代理。

## 每个工作区有什么变化

您的跟踪、数据集、提示和实验保持相同的记录。按名称将跟踪发送到现有跟踪项目的代码仍然有效，因为该项目现在是代理的 **生产** 环境。参见[Configure integrations that require a project name](/langsmith/create-an-agent#use-an-environment-project)。

工作区迁移后，LangSmith 的这些部分的作用域为代理和环境，而不是跟踪项目：* **跟踪**：分组在代理及其环境之一下，而不是在您命名的跟踪项目下。
* **预构建仪表板**：为每个代理环境而不是为指定项目生成。参见[Dashboards](/langsmith/dashboards)。
* **警报**：适用于代理的一个环境。参见[Alerts](/langsmith/alerts)。
* **评估者**：附加到环境。参见[Manage evaluators](/langsmith/evaluators)。
* **数据集**：附加到一个或多个代理而不是一个项目，并且不附加到任何环境，因此一个数据集可以为多个代理提供服务。参见[Create and manage datasets in the UI](/langsmith/manage-datasets-in-application)。
* **导航**：在顶部栏中获得一个代理切换器，可在代理列表和单个代理的概述之间移动。参见[Navigate agents](/langsmith/navigate-agents)。

## 另请参阅

* [Agent Registry](/langsmith/agent-registry)
* [Agent environments](/langsmith/agent-environments)
* [Navigate agents](/langsmith/navigate-agents)
* [Create an agent](/langsmith/create-an-agent)
* [Self-hosted changelog](/langsmith/self-hosted-changelog)
* [Administration overview](/langsmith/administration-overview#agents)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-agent-migration.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。