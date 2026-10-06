<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Create an agent | https://docs.langchain.com/langsmith/create-an-agent -->

# 创建代理

在LangSmith中创建代理的四种方式，每条路由决定其创建的代理的内容，以及标识符必须遵循的规则。

您可以通过四个路线创建[agent](/langsmith/agents)。您选择的路线设置代理如何获取其标识符以及代理以多少个[environments](/langsmith/agent-environments)开始。

根据代理运行的位置选择路线。如果您在 LangSmith 中构建代理，LangSmith 将在您构建代理时创建该代理。如果代理在您自己的计算机上运行，​​LangSmith 可以在代理发送第一个跟踪时创建代理。

<Note>
  **测试版。** 基于代理的工作区位于 [beta](/langsmith/release-stages) 中。 LangChain 为组织启用基于代理的工作区，并且更改适用于之后创建的工作区。现有的 [project-based](/langsmith/observability-concepts#tracing-projects) 工作区不会自动转换，但 LangChain 可以对其进行转换。要询问访问权限，[contact our sales team](https://www.langchain.com/contact-sales)。
</Note>

## 比较四种路线

可以通过四种方式创建代理，这四种方式的不同之处在于标识符的设置方式以及代理启动的环境：|路线 |当 | 时使用它标识符 |创作时的环境 |
| - | - | - | - |
| [Build tab](/langsmith/build-an-agent) | LangSmith 为您运行代理 |为您生成 |独自生产|
| **创建新代理**对话框 |您希望代理在首次运行之前命名 |你设定吧|所有四个 |
| [Tracing](/langsmith/log-traces-to-agent) 为不存在的标识符 |代理已经在其他地方运行 |您发送的值 |所有四个 |
| [Deploying a project](/langsmith/deploy-to-agent-environment) |您从项目部署代理 |您传递的或从部署名称派生的代理 ID |所有四个 |

并非每个特工都能拥有[deployment](/langsmith/deployment)。通过部署项目创建的代理从一开始就具有部署。通过跟踪、[**New Agent** panel](#start-from-the-new-agent-panel) 中的可观察性选项或通过 **创建新代理** 对话框创建的代理最初不会部署，但稍后您可以 [deploy to it](/langsmith/deploy-to-agent-environment)。 UI 中内置的代理无法进行部署，因为它在 Studio 运行时上运行。部署后，代理的概述会显示 **部署** 部分。

在 UI 中创建的代理在第一次将跟踪寻址到某个环境时就获得了其其他环境。关于这四个是什么，请参见[Agent environments](/langsmith/agent-environments#environment-names)。

## 标识符规则标识符长度为1～63个字符，由小写字母、数字和连字符组成。它必须以字母开头并以字母或数字结尾，因此 `support-agent` 和 `billing-v2` 有效。其他任何事情都会被拒绝。

这些规则适用于您提供值的任何位置：**代理 ID** 字段、您跟踪到的标识符以及您部署到的代理 ID。 “构建”选项卡会生成一个标识符。没有代理 ID 的部署会从部署名称中派生一个 ID，并在已采用该值时附加后缀，因此部署的代理最终会得到一个接近部署名称而不是等于部署名称的标识符。

创建代理后，标识符无法更改。显示名称即可。对于哪个值是哪个，请参阅[Identifiers and display names](/langsmith/agents#identifiers-and-display-names)。

## 从“新建代理”面板开始四个控件可打开 **新代理** 面板：**+ 代理**位于代理列表上方，**+ 创建新代理** 和 **跟踪现有代理** 在列表末尾的创建卡上（也标题为 **新代理**），以及代理切换器中搜索框旁边的 **+** 按钮，该按钮会在悬停时显示 **新代理** 工具提示。 **跟踪现有代理** 打开“可观察性”选项上的面板，其他三个在其选项网格上打开它。 **所有选项**按钮返回到网格。

面板将工作交给四个流程。只有 Observability 在面板内创建代理：

* **Builder**（“在 LangSmith 内构建和配置”）：将面板保留到 **Build** 选项卡，在其中提交表单创建代理。参见[Build an agent in the UI](/langsmith/build-an-agent)。
* **托管深度代理**（“本地构建并部署”）：代理在部署时创建。参见[Managed Deep Agents](/langsmith/python/managed-deep-agents-overview)。此路线需要付费计划。
* **开源**（“使用我们的开源框架构建代理”）：代理由第一个跟踪创建。参见[LangChain](/oss/python/langchain/overview)。
* **可观察性**（“跟踪现有代理”）：在面板中命名代理，LangSmith 创建它并打开其跟踪页面，其中包含设置步骤。请参阅[tracing quickstart](/langsmith/observability-quickstart)。

## 指定从外部追踪到的特工 LangSmith要在任何跟踪到达之前创建代理，请在两个位置之一中为其命名：

* **新代理** 面板中的可观察性选项。
* 当未选择代理时，**创建新代理** 对话框可从跟踪上代理列表下方的 **+ 新代理** 打开。

两者都采用 **代理名称** 以及在其自己的字段中的 **代理 ID**，并注意该 ID 用于 URL 和 API 调用，并且以后无法更改。两者都需要创建项目的权限。代理切换器在其搜索框旁边具有相同的 **+** 按钮，对于具有相同权限的用户，无论切换器出现在何处，它都会打开 **新代理** 面板而不是对话框。

首先创建代理是可选的。 [Tracing to an identifier that does not exist](/langsmith/log-traces-to-agent#addressing-an-agent-that-does-not-exist) 根据您发送的值创建代理，因此该对话框用于在首次运行之前命名代理。

## 另请参阅

* [Agents](/langsmith/agents)
* [Agent environments](/langsmith/agent-environments)
* [Build an agent in the UI](/langsmith/build-an-agent)
* [Deploy to an agent environment](/langsmith/deploy-to-agent-environment)
* [Log traces to an agent](/langsmith/log-traces-to-agent)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/create-an-agent.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>