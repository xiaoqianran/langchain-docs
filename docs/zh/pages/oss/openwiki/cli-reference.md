<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Command reference | https://docs.langchain.com/oss/openwiki/cli-reference -->

# 命令参考

OpenWiki 作为单个 `openwiki` 二进制文件提供，用于交互式聊天和一次性文档运行。安装和首次使用请参见[Quickstart](/oss/openwiki/quickstart)。

## 核心命令

```bash
# Interactive chat in code mode (current repository)
openwiki
openwiki "Please generate documentation for this repository"

# Personal mode
openwiki personal
openwiki personal --init
openwiki personal --update

# Explicit code mode
openwiki code --init
openwiki code --update
openwiki code --update --print

# Defaults to code mode
openwiki --init
openwiki --update

# One-shot print mode
openwiki -p "Summarize what you can do"

# Explore the wiki locally
openwiki visualize
openwiki visualize openwiki --port 4400 --no-open

# Help
openwiki --help
```

### 常用标志

|旗帜|描述 |
| ---| ---|
| `--init` |生成初始文档。默认为代码模式。在没有 `--print` 的 TTY 中，流代理输出并在成功时自动退出。 `--init` 和 `--update` 不能组合。 |
| `--update` |更新现有文档。默认为代码模式。在没有 `--print` 的 TTY 中，流代理输出并在成功时自动退出。 `--init` 和 `--update` 不能组合。 |
| `--mode <personal\|code>` |选择个人大脑或存储库文档。 |
| `-p`、`--print` |运行一次，打印最终的助手输出，然后退出。提供消息或命令。没有 `--print` 的互动聊天将保持开放以供后续跟进。 |
| `--modelId` / `--model-id` |选择运行的模型 ID。 |
| `--telemetry-file=<path>` |还将运行的遥测有效负载写入本地 JSON 文件。 |
| `-h`、`--help` |打印使用情况。 |

## 可视化

您可以将生成的 wiki 可视化为交互式节点图和实时 Markdown 阅读器。

```bash
openwiki visualize
openwiki visualize openwiki --port 4400 --no-open
openwiki visualize ~/.openwiki/wiki
```

详情请参见[Visualize your wiki](/oss/openwiki/visualize)。

## 身份验证和连接器

```bash
# List supported auth providers and status
openwiki auth

# Browser OAuth; save tokens to ~/.openwiki/.env and create connector config when possible
openwiki auth gmail
openwiki auth notion
openwiki auth slack
openwiki auth x

# Regenerate connector config from saved auth env vars
openwiki auth configure <provider> [--force]

# List live MCP tools for MCP-backed providers
openwiki auth tools <provider>

# Run source-specific connector ingestion
openwiki ingest <source|source-instance|all>

# HTTPS tunnel for Slack OAuth; saves OPENWIKI_HTTPS_OAUTH_REDIRECT_URI
openwiki ngrok start [url] [--port <port>]
```

## 计划任务 (macOS)管理 [personal mode](/oss/openwiki/personal-mode) 源的可选连接器计划。在 macOS 上，OpenWiki 可以将计划安装为定期刷新源（例如 Gmail 或网络搜索）的用户 LaunchAgent。使用以下命令列出、暂停、恢复或删除它们：

```bash
openwiki cron list
openwiki cron pause <source|all>
openwiki cron resume <source|all>
openwiki cron delete <source|all>
```

`cron delete` 删除已保存的计划并卸载其 LaunchAgent。它不会删除身份验证、连接器配置、原始数据或 wiki 内容。

## 斜线命令（交互式）

在交互聊天模式下，您可以使用以下命令：

- `/api-key`：更新当前提供商 API 密钥（屏蔽提示）
- `/langsmith-key`：更新或清除LangSmith跟踪凭证（屏蔽提示）
- `/provider` 和 `/model`：更改会话的提供程序或模型（保留到 `~/.openwiki/.env`）
- `/init` 和 `/update`：从会话启动 init 或 update
- `/exit`：退出应用程序

## 另请参阅

- [Personal mode](/oss/openwiki/personal-mode)
- [Model providers](/oss/openwiki/providers)
- [Automate updates](/oss/openwiki/automate-updates)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/cli-reference.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>