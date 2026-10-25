<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: OpenWiki | https://docs.langchain.com/oss/openwiki/overview -->

# 开放维基

用于编写和维护代理 wiki 的 CLI，以便编码代理更快地工作

OpenWiki 是一个开源 CLI，用于编写和维护有关您的代码库或个人知识的 Markdown wiki。该 wiki 捕获了架构、集成、评估和工作流程等详细信息，因此 [coding agents](/oss/python/deepagents/overview) 可以将其用作持久上下文，而不是在每个任务上重新发现存储库。

这使得代理工作速度更快、代币成本更低：代理首先阅读精选的 wiki，然后仅在需要更多详细信息的地方检查源。人类可以浏览相同的 Markdown（以及本地的[visualizer](/oss/openwiki/visualize)），但主要受众是代理。

OpenWiki 构建于 [Deep Agents](/oss/python/deepagents/overview) 之上，并支持使用 [LangSmith](/langsmith/observability-quickstart) 进行跟踪。

## 开始吧

安装 CLI，然后初始化当前存储库的文档：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install -g openwiki
openwiki --init
```

请参阅 [Quickstart](/oss/openwiki/quickstart) 选择模型提供商、生成文档并使其保持最新。要在编码代理而不是独立模型会话中运行 OpenWiki，请参阅[Coding-agent integrations](/oss/openwiki/integrations)。要搜索现有的 wiki 或组相关存储库，请参阅 [Search and link wikis](/oss/openwiki/search-and-link)。

## 模式

OpenWiki 有两种模式：|模式|命令|输出|使用时 |
| - | - | - | - |
| **代码**（默认）| `openwiki` / `openwiki code` |当前存储库中的`openwiki/` |您需要编码代理的存储库上下文和文档 |
| **个人** | `openwiki personal` | `~/.openwiki/wiki` |您想要来自配置来源的本地个人大脑 |

裸`openwiki --init`和`openwiki --update`在代码模式下运行。对于个人维基，请使用 `openwiki personal --init` 或 `openwiki personal --update`。

## 能力

> **[Repository wikis](/oss/openwiki/code-mode)**
>
> 在`openwiki/`下生成Markdown文档，然后将它们连接到`AGENTS.md`（和`CLAUDE.md`，如果存在），以便编码代理可以找到它们。

> **[Coding-agent integrations](/oss/openwiki/integrations)**
>
> 在 Codex、Claude Code、OpenCode、Cursor、IBM Bob、Kiro、Oh My Pi、Antigravity 或 Pi 中运行 OpenWiki。

> **[Search and link](/oss/openwiki/search-and-link)**
>
> 通过 MCP 查询 wiki 页面，并将相关存储库 wiki 分组到工作区中。

> **[Personal brain](/oss/openwiki/personal-mode)**
>
> 从 git 存储库、自定义 MCP、Gmail、Notion、网络搜索、黑客新闻和 X/Twitter 构建本地 wiki。

> **[Grounded Claims](/oss/openwiki/code-mode#grounded-claims)**
>
> 将重要事实跟踪回版本化源证据，并在证据发生变化时刷新页面。

> **[Automatic updates](/oss/openwiki/automate-updates)**
>
> 从 GitHub Actions、GitLab CI 或 Bitbucket Pipelines 刷新文档，并在内容更改时打开 PR。> **[Model providers](/oss/openwiki/providers)**
>
> 开箱即用地使用 OpenAI、Anthropic、Gemini、Bedrock、OpenRouter、GitHub Copilot、IBM Bob 和其他提供商。

> **[Open Knowledge Format](/oss/openwiki/code-mode#open-knowledge-format)**
>
> 发布 OKF v0.2 Markdown 捆绑包，其中包含前言、索引和链接概念。

> **[LangSmith tracing](/oss/openwiki/quickstart#trace-with-langsmith)**
>
> 跟踪文档使用 LangSmith 运行。

## 后续步骤

> **[Quickstart](/oss/openwiki/quickstart)**
>
> 安装 OpenWiki、配置提供程序并生成您的第一个 wiki。

> **[CLI reference](/oss/openwiki/cli-reference)**
>
> 查看命令、标志和连接器子命令。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。