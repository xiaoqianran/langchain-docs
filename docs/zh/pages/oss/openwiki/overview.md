<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: OpenWiki | https://docs.langchain.com/oss/openwiki/overview -->

# 开放维基

OpenWiki 是一个开源 CLI，用于编写和维护有关您的代码库或个人知识的 Markdown wiki。该 wiki 捕获了架构、集成、评估和工作流程等详细信息，因此 [coding agents](/oss/python/deepagents/overview) 可以将其用作持久上下文，而不是在每个任务上重新发现存储库。

这使得代理工作速度更快、代币成本更低：代理首先阅读精选的 wiki，然后仅在需要更多详细信息的地方检查源。人类可以浏览相同的 Markdown（以及本地的[visualizer](/oss/openwiki/visualize)），但主要受众是代理。

OpenWiki 构建于 [Deep Agents](/oss/python/deepagents/overview) 之上，并支持使用 [LangSmith](/langsmith/observability-quickstart) 进行跟踪。

## 开始吧

安装 CLI，然后初始化当前存储库的文档：

```bash
npm install -g openwiki
openwiki --init
```

请参阅 [Quickstart](/oss/openwiki/quickstart) 选择模型提供商、生成文档并使其保持最新。

<Note>
    OpenWiki 不为 Claude 或 Codex 提供正式的连接器。在代码模式下，它在存储库根`AGENTS.md`和`CLAUDE.md`文件中添加指向生成的wiki的指针，以便兼容的编码代理可以发现并查阅wiki。
</Note>

## 模式

OpenWiki 有两种模式：|模式|命令 |输出|使用时 |
| ---| ---| ---| ---|
| **代码**（默认）| `openwiki` / `openwiki code` |当前存储库中的`openwiki/` |您需要编码代理的存储库上下文和文档 |
| **个人** | `openwiki personal` | `~/.openwiki/wiki` |您想要来自配置来源的本地个人大脑 |

裸`openwiki --init`和`openwiki --update`在代码模式下运行。对于个人维基，请使用 `openwiki personal --init` 或 `openwiki personal --update`。

## 能力

<CardGroup cols={2}>
    <Card title="Repository wikis" icon="folder-code" href="/oss/openwiki/code-mode">
        在`openwiki/`下生成Markdown文档，然后将它们连接到`AGENTS.md`和`CLAUDE.md`，以便编码代理可以找到它们。
    </Card>
    <Card title="Personal brain" icon="brain" href="/oss/openwiki/personal-mode">
        从 git 存储库、Gmail、Notion、网络搜索、黑客新闻和 X/Twitter 构建本地 wiki。
    </Card>
    <Card title="Automatic updates" icon="clock" href="/oss/openwiki/automate-updates">
        从 GitHub Actions、GitLab CI 或 Bitbucket Pipelines 刷新文档，并在内容更改时打开 PR。
    </Card>
    <Card title="Model providers" icon="cpu" href="/oss/openwiki/providers">
        使用 OpenAI、Anthropic、Gemini、Bedrock、OpenRouter、GitHub Copilot 和其他开箱即用的提供程序。
    </Card>
    <Card title="Open Knowledge Format" icon="file-text" href="/oss/openwiki/code-mode#open-knowledge-format">
        发出 OKF v0.1 Markdown 捆绑包，其中包含前言、索引和链接概念。
    </Card>
    <Card title="LangSmith tracing" icon="chart-dots" href="/oss/openwiki/quickstart#trace-with-langsmith">
        跟踪文档使用 LangSmith 运行。
    </Card>
</CardGroup>

## 后续步骤<CardGroup cols={2}>
    <Card title="Quickstart" icon="player-play" href="/oss/openwiki/quickstart">
        安装 OpenWiki、配置提供程序并生成您的第一个 wiki。
    </Card>
    <Card title="CLI reference" icon="terminal" href="/oss/openwiki/cli-reference">
        查看命令、标志和连接器子命令。
    </Card>
</CardGroup>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>