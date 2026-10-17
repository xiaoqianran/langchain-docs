<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Quickstart | https://docs.langchain.com/oss/openwiki/quickstart -->

# 快速入门

安装 OpenWiki、配置模型提供程序并生成您的第一个 wiki。

OpenWiki 是一个 CLI，可以为您的代码库或个人知识编写和维护 Markdown wiki。编码代理使用该 wiki 作为持久上下文，因此他们花费更少的时间和更少的令牌来重新发现架构、集成和其他存储库详细信息。人类可以阅读相同的文档，但代理是主要受众。本指南涵盖安装、提供程序设置和您的首次文档运行。有关功能概述，请参阅[OpenWiki overview](/oss/openwiki/overview)。

## 安装并生成存储库文档

<Steps>
  <Step title="Install the CLI" icon="package">
    OpenWiki 需要[Node.js 22.22.0 or later](https://nodejs.org)。

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install -g openwiki
    ```

    在 Windows 上，首选 `npm` 或 `pnpm`。使用 Bun 进行安装可以回退到编译本机 `better-sqlite3` 依赖项，并且可能需要 Visual Studio 构建工具以及使用 C++ 工作负载进行桌面开发。
  </Step>

  <Step title="Initialize in your repository" icon="player-play">
    从存储库根目录运行以下命令：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    openwiki --init
    ```

    在第一次交互式运行时，OpenWiki 会提示：

    * 推理提供者和模型
    * 提供商 API 密钥（或等效凭据）
    * 用于跟踪的可选 LangSmith API 密钥
    * LangSmith 项目从运行时跟踪中丰富 wikiOpenWiki 将其配置和机密保存到`~/.openwiki/.env`。

    再次运行 `--init` 会从头开始重新生成存储库 wiki 和声明，同时保留 `openwiki/INSTRUCTIONS.md`。 `openwiki/.run.json` 的持久结帐恢复运行中断。

    要在编码代理而不是独立模型会话中运行 OpenWiki，请参阅[Coding-agent integrations](/oss/openwiki/integrations)。维基存在后，您可以[search it or link related repositories](/oss/openwiki/search-and-link)。
  </Step>

  <Step title="Review the generated wiki" icon="book">
    OpenWiki 将文档写入存储库中的`openwiki/`，包括快速入门入口点和主题页面。它使用一个块在存储库根创建或刷新`AGENTS.md`，该块指示编码代理查阅 wiki 以获取代码库上下文。当 `CLAUDE.md` 已经存在时，OpenWiki 会刷新导入 `@AGENTS.md` 的托管块。事实页面以`openwiki/.claims/`下的声明为基础。

    存储库特定的 wiki 说明位于 `openwiki/INSTRUCTIONS.md`。 OpenWiki 读取此文件以了解范围和优先级。 To change it, edit the file, or ask OpenWiki in chat to change the brief (for example, `openwiki "Update openwiki/INSTRUCTIONS.md to focus on the public API"`). Normal `--init` and `--update` runs do not rewrite it.

    要在浏览器中浏览 wiki，请运行：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    openwiki visualize
    ```

    This opens a local interactive node graph with a side-by-side Markdown reader.参见[Visualize your wiki](/oss/openwiki/visualize)。
  </Step><Step title="Keep docs up to date" icon="refresh">
    代码更改后刷新文档：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    openwiki --update
    ```

    在代码模式下，当源证据发生变化时，更新还会协调陈旧的声明。有关 CI 中的自动更新，请参阅[Automate updates](/oss/openwiki/automate-updates)。
  </Step>
</Steps>

## 个人维基（可选）

要初始化本地个人大脑而不是存储库文档：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki personal --init
```

个人模式写入 `~/.openwiki/wiki` 并可以摄取已配置的连接器，例如本地 git 存储库、自定义 MCP、Gmail、Notion、网络搜索、黑客新闻和 X/Twitter。参见[Personal mode](/oss/openwiki/personal-mode)。

## 交互式和一次性运行

Bare `openwiki` 以代码模式为当前存储库打开一个交互式会话。传递消息以开始请求：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki "Please generate documentation for this repository"
```

使用 `-p` / `--print` 进行一次性非交互式运行，打印最终助手输出并退出：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki -p "Summarize what you can do"
```

在聊天中，使用 `/api-key` 更新当前提供商 API 密钥，使用 `/langsmith-key` 更新或清除 LangSmith 跟踪凭证，并使用 `/effort` 设置受支持模型的推理工作。

## 使用 LangSmith 进行追踪

During onboarding, provide a LangSmith API key to trace OpenWiki runs to a LangSmith project named `openwiki`.您还可以在 `~/.openwiki/.env` 或进程环境中设置这些值：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_API_KEY=your-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=openwiki
```要从 LangSmith 跟踪（与跟踪 OpenWiki 本身分开）丰富存储库 wiki，请参阅 [LangSmith connector](/oss/openwiki/code-mode#langsmith-connector)。

## 后续步骤

* [Code mode](/oss/openwiki/code-mode)：存储库 wiki、声明、OKF 输出和代理指令文件
* [Coding-agent integrations](/oss/openwiki/integrations)：在 Codex、Claude Code、OpenCode、Cursor、IBM Bob、Kiro、Oh My Pi、Antigravity 或 Pi 中运行 OpenWiki
* [Search and link wikis](/oss/openwiki/search-and-link)：MCP 搜索和读取，以及多存储库工作区
* [Personal mode](/oss/openwiki/personal-mode)：本地大脑和连接器
* [Model providers](/oss/openwiki/providers)：支持的提供商和凭证
* [Automate updates](/oss/openwiki/automate-updates)：GitHub Actions、GitLab CI 和 Bitbucket Pipelines
* [CLI reference](/oss/openwiki/cli-reference)：命令和标志

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>