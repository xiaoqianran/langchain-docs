<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Personal mode | https://docs.langchain.com/oss/openwiki/personal-mode -->

# 个人模式

使用 OpenWiki 从配置的源构建本地个人大脑 wiki。

个人模式从本地存储库、Gmail、Notion、网络搜索、黑客新闻、Slack 和 X/Twitter 等配置源在 `~/.openwiki/wiki` 中构建本地个人大脑 wiki。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki personal
openwiki personal --init
openwiki personal --update
openwiki personal --update "Refresh the wiki from configured connectors"
```

## 首次运行入门

首次设置时，您可以：

* 配置推理提供者、API 密钥和模型
* 设置 LangSmith API 密钥
* 为支持的源设置连接器
* 选择一个 wiki 模板，自定义其范围，并保存每个源的摄取注释和时间表

**计划**是连接器源的可选 cron，例如定期刷新 Gmail 或网络搜索。 OpenWiki 将这些 cron 表达式和相关设置详细信息以及其余的入门首选项（选定的模板、连接的源和每个源的摄取注释）存储在 `~/.openwiki/onboarding.json` 中。全球个人wiki指令单独保存在`~/.openwiki/INSTRUCTIONS.md`中。

在 macOS 上，OpenWiki 可以作为用户 LaunchAgents 在 `~/Library/LaunchAgents/` 下安装受支持的计划。这些作业运行`openwiki --update --print`并在`~/.openwiki/logs/`下写入日志。

## 连接您的来源在个人模式下，OpenWiki 从您已经使用的工具中获取知识，并将其合成到您本地的 wiki 下的`~/.openwiki/wiki/` 中。首次运行入门可以设置本地 git 存储库、Notion、Gmail、X/Twitter、网络搜索、黑客新闻和 Slack。

在摄取运行期间，连接器工具在 `~/.openwiki/connectors/<connector>/raw/` 下写入原始数据和清单，然后特定于源的代理运行从这些本地文件更新 wiki。

连接器机密由环境变量名称引用并存储在 `~/.openwiki/.env` 中。

<Important>
  连接器配置文件不应包含原始秘密值。
</Important>

### 内置源|来源 |证书 |行为 |
| ------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `git-repo` |本地路径 |读取配置的本地存储库路径并写入紧凑的清单 |
| `x` | OAuth 用户上下文凭据 |通过 X API 的主页时间线、用户帖子、提及、书签和列表帖子 |
| `notion` |概念 OAuth（托管 MCP）|通过 Notion OAuth 进行身份验证，而不是粘贴 Notion 令牌 |
| `google` | Gmail OAuth | `openwiki auth gmail` 之后通过 Gmail API 获取最近的邮件 |
| `web-search` | `TAVILY_API_KEY` |通过LangChain使用Tavily |
| `hackernews` |无 |公共黑客新闻提要和搜索 API |
| `slack` | Slack 应用程序客户端凭据 + OAuth | OAuth 需要 HTTPS 回调设置；参见[Slack OAuth](#slack-oauth)|您可以多次配置同一源。例如，添加一个用于 AI 研究的网络搜索源，另一个用于 NBA 新闻的网络搜索源。 OpenWiki 将它们存储为单独的实例，例如 `web-search-1` 和 `web-search-2`。

### 连接源

对于需要凭据的源，请先进行身份验证，然后摄取。黑客新闻等来源无需授权；网络搜索需要`~/.openwiki/.env`中的`TAVILY_API_KEY`。

<Steps>
  <Step title="Authenticate the provider" icon="key">
    为需要的提供商运行本地浏览器 OAuth 流程。 OpenWiki 将返回的令牌保存到`~/.openwiki/.env`，在可能的情况下创建连接器配置，并为 MCP 支持的提供商发现 MCP 工具：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    openwiki auth notion
    openwiki auth gmail
    openwiki auth x
    openwiki auth slack
    ```

    * Slack 和 Gmail 要求已在 `~/.openwiki/.env` 中设置应用程序客户端凭据
    * Notion 使用动态客户端注册来托管 MCP
    * X 使用带有 PKCE 的 OAuth 2.0
    * `openwiki auth gmail`之后，Google 连接器可以直接接收 Gmail，无需 MCP 传输设置

    高级重试助手：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    openwiki auth configure <provider>
    openwiki auth tools <provider>
    ```
  </Step>

  <Step title="Ingest the source" icon="download">
    将原始数据拉入`~/.openwiki/connectors/`并将更新综合到个人wiki中：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    openwiki ingest all
    openwiki ingest web-search
    openwiki ingest web-search-2
    ```

    配置源后，您还可以通过聊天或使用 `openwiki personal --update` 进行刷新。
  </Step>
</Steps>

### Slack OAuth

Slack OAuth 可能需要 HTTPS 重定向 URL：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki ngrok start
# or with a fixed domain:
openwiki ngrok start https://your-domain.ngrok.app
```OpenWiki 保存 `OPENWIKI_HTTPS_OAUTH_REDIRECT_URI` 并打印回调 URL 以在 Slack 中注册。 X/Twitter 和 Gmail 身份验证会忽略 HTTPS 覆盖，并默认继续使用 `http://127.0.0.1:53682/callback` 处的本地回调。

### 凭证存储

OpenWiki 将秘密存储在：

*目录：`~/.openwiki`（模式`0o700`）
* 文件：`~/.openwiki/.env`（模式`0o600`）

常见的连接器相关密钥包括 Gmail、Notion、Slack 和 X OAuth 令牌，以及用于网络搜索的 `TAVILY_API_KEY`。可选的 OAuth 回调设置：

* `OPENWIKI_OAUTH_CALLBACK_PORT`：本地回调端口
* `OPENWIKI_HTTPS_OAUTH_REDIRECT_URI`：Slack HTTPS 回调 URL

有关模型提供者凭据，请参阅[Model providers](/oss/openwiki/providers)。

## 管理日程

在 macOS 上，通过以下方式管理连接器计划：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki cron list
openwiki cron pause <source|all>
openwiki cron resume <source|all>
openwiki cron delete <source|all>
```

`cron delete` 从 `~/.openwiki/onboarding.json` 中删除已保存的源计划并卸载其 LaunchAgent。它不会删除身份验证、连接器配置、原始数据或 wiki 内容。

## 另请参阅

* [Code mode](/oss/openwiki/code-mode)
* [CLI reference](/oss/openwiki/cli-reference)
* [Customize OpenWiki](/oss/openwiki/customize)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/personal-mode.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>