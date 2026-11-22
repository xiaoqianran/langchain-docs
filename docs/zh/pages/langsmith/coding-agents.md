<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Monitor coding agent cost and pull requests | https://docs.langchain.com/langsmith/coding-agents -->

# 监控编码代理成本和拉取请求

跟踪您团队的编码代理的成本并将支出链接到他们打开的 GitHub 或 GitLab 拉取请求。

发送来自团队编码代理（例如 Claude Code、Codex 和 Cursor）的跟踪，以了解每个编码代理的成本。连接 GitHub 或 GitLab 将每个[thread](/langsmith/threads)链接到它打开的拉取请求，这样您就可以看到每个拉取请求背后的支出。当图表显示拉取请求或用户的支出非常突出时，请打开该支出背后的线程以查看编码代理做了什么。

> [!注意]
>
> 编码代理类型位于[beta](/langsmith/release-stages)。

## 设置

代理概览上的拉取请求连接和编码图表仅出现在具有编码类型的代理上。

### 创建一个编码类型的代理

如果您使用官方 LangSmith 插件将跟踪发送到尚不存在的代理 ID，LangSmith 将创建代理并将其类型设置为 **Coding**。遵循 [Coding agent metadata contract](/langsmith/coding-agent-metadata-contract) 的集成具有相同的行为。

要自行设置类型，请在 [create an agent](/langsmith/create-an-agent) 时将 **Agent type** 设置为 **Coding**。更改现有代理的类型需要管理工作区设置的权限。要更改它，请单击代理概述上的 **代理设置** 图标，然后选择 **更改代理类型**。

### 将跟踪发送给代理

为您的团队使用的每个编码代理设置跟踪，并将其跟踪发送到具有编码类型的 LangSmith 代理。每个指南都展示了如何将跟踪发送给该代理。

您可以将所有编码代理的跟踪发送到一个 LangSmith 代理。这使您可以在每个编码代理上运行相同的[evaluators](/langsmith/evaluators)，并通过工具（编码代理，例如 Claude Code）对它们进行比较。

|喷码剂|设置追踪 |
| - | - |
|克劳德·代码 | [Install the plugin](/langsmith/trace-claude-code#install-the-plugin) |
| OpenAI 法典 | [Install the plugin](/langsmith/trace-with-codex#install-the-plugin) |
|光标| [Install the plugin](/langsmith/trace-with-cursor#install-the-plugin) |
| GitHub 副驾驶 | [Configure tracing](/langsmith/trace-with-vscode-copilot#configure-tracing) |
| Deep Agents 代码 | [Trace with LangSmith](/oss/deepagents/code/quickstart#trace-with-langsmith) |

要跟踪每个工程师的会话，管理员可以使用移动设备管理 (MDM) 工具安装 Claude Code、Codex 和 Cursor 插件，并锁定跟踪所在的代理和工作区。有关托管文件和您可以锁定的设置，请参阅 [Claude Code](/langsmith/trace-claude-code#lock-settings)、[Codex](/langsmith/trace-with-codex#lock-settings) 和 [Cursor](/langsmith/trace-with-cursor#lock-settings) 的锁定设置。

### 连接 GitHub 或 GitLab拉取请求跟踪使用与 [LangSmith Engine](/langsmith/engine) 相同的 GitHub 和 GitLab 连接。要连接帐户，您需要更新所有代理环境的权限。每个提供商都会添加自己的要求：

* **GitHub**：首次安装 GitHub 应用程序需要在您的存储库上安装它的权限，并且您的 GitHub 组织可能需要管理员批准。如果您已经将存储库连接到 Engine，这些安装将显示在连接对话框中，您可以链接它们而无需再次授权 GitHub。
* **GitLab**：工作区管理员在工作区设置中连接帐户。

详情请参见[Connect repositories to Engine](/langsmith/engine-repositories)。

在 BYOC 和自托管 LangSmith 上，GitHub 连接使用管理员为安装注册的引擎 GitHub 应用程序，而不是 LangSmith 拥有的应用程序。在将 GitHub 连接到编码代理之前设置该应用程序。参见[Configure GitHub for Engine on self-hosted and BYOC](/langsmith/engine-self-hosted-github)。

在代理概述上，单击 **跟踪拉取请求** 并连接 GitHub 或 GitLab 帐户。您可以重复使用已连接到工作区中另一个代理的安装。当 GitHub 或 GitLab 报告拉取请求的活动（例如打开、更新或合并它）时，LangSmith 链接拉取请求。它链接其跟踪在其 Git 元数据中记录拉取请求的存储库和源分支的线程。连接之前合并的拉取请求不会出现。合并时间、每个合并拉取请求的成本以及开发人员打开和合并拉取请求时填写的拉取请求卡。

如果拉取请求没有显示线程，请检查其跟踪是否记录了存储库和分支：

* **GitHub Copilot**：仅在 [Local harness](/langsmith/trace-with-vscode-copilot#choose-your-harness) 上记录它们，并且仅针对具有 Git 远程的文件夹。
* **Deep Agents代码**：记录它们，除非您[turn off Git trace attribution](/oss/deepagents/code/config-file#disable-git-trace-attribution)。

## 阅读代理概述

顶部的摘要卡将每个指标与之前的时期进行比较：

* **始终显示**：**LLM 成本**、**线程**和**匝数/线程**。
* **在连接 GitHub 或 GitLab 之前**：**令牌**和 **成本/1M 令牌**。
* **连接后**：**成本/合并 PR**、**缓存率**和**合并时间**，其中还显示合并率。这些取代了 **令牌** 和 **成本/1M 令牌**。选择一张卡片来绘制该指标随时间变化的图表。您可以按维度对图表进行分组，例如拉取请求状态、用户、用户组、Git 用户、存储库、工具、提供程序、模型或元数据键。单击栏或类别可打开其后面线程的过滤视图。

在摘要下方，概述显示了这些卡片：

* **工作类型**：按他们要求的工作类型划分的线程：功能、错误修复、重构、调查、审查或偏离主题。该卡需要预构建的编码工作类型评估器，并引导您完成设置。
* **技能使用**：编码代理调用哪些技能。
* **各州每个 PR 的成本**：打开、关闭和合并拉取请求的平均成本。
* **按成本排名最高的 PR**：时间范围内最昂贵的拉取请求，包括每个拉取请求的状态、作者、线程、轮次和成本。每行都链接到拉取请求。
* **按会话长度计算的成本**：按轮数分组的线程，以及每线程和每轮的总成本和平均成本。

## 使用示例

### 查找昂贵的拉取请求

使用 **按成本排名最高的 PR** 查找成本最高的拉取请求。打开拉取请求的线程以查看模型及其背后的用户。### 检查较短线程的效果

到目前为止，每个新回合都会发送对话，因此长线程每回合的成本更高。如果您要求工程师更频繁地启动新线程，请使用**按会话长度计算的成本**来检查长线程是否变得不那么常见。

### 比较模型

当您的团队切换模型时，按模型对一段时间内的成本进行分组，以比较前后的支出。检查同一时间范围内“合并时间”卡上的合并率，以查看拉取请求是否仍会被合并。

## 另请参阅

* [Trace Claude Code sessions](/langsmith/trace-claude-code)
* [Trace OpenAI Codex](/langsmith/trace-with-codex)
* [Trace Cursor](/langsmith/trace-with-cursor)
* [Trace GitHub Copilot](/langsmith/trace-with-vscode-copilot)
* [Trace Deep Agents Code](/oss/deepagents/code/quickstart#trace-with-langsmith)
* [Route coding agents through the LLM Gateway](/langsmith/llm-gateway-coding-agents)
* [Coding agent metadata contract](/langsmith/coding-agent-metadata-contract)
* [Cost tracking](/langsmith/cost-tracking)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/coding-agents.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。