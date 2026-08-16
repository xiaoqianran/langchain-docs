<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Automate updates | https://docs.langchain.com/oss/openwiki/automate-updates -->

# 自动更新

OpenWiki 可以按计划刷新存储库文档，并在 wiki 更改时打开拉取请求或合并请求。示例工作流程在 [OpenWiki repository](https://github.com/langchain-ai/openwiki/tree/main/examples) 中提供。

## 添加工作流程

复制您的 Git 提供商的示例：

|供应商|示例|目的地 |
| ---| ---| ---|
| GitHub 操作 | [⟦T2⟧](https://github.com/langchain-ai/openwiki/blob/main/examples/openwiki-update.yml) | `.github/workflows/openwiki-update.yml` |
|亚搏体育appGitLab CI | [⟦T4⟧](https://github.com/langchain-ai/openwiki/blob/main/examples/openwiki-update.gitlab-ci.yml) | `.gitlab-ci.yml`，或从现有管道中包含它 |
| Bitbucket 管道 | [⟦T6⟧](https://github.com/langchain-ai/openwiki/blob/main/examples/openwiki-update.bitbucket-pipelines.yml) | `bitbucket-pipelines.yml`，然后安排`openwiki-update`自定义管道 |

## 在 CI 中运行更新

对于 CI 中的存储库文档，请使用：

```bash
openwiki code --update --print
```

您不需要在 CI 中运行 `--init`。只要工作流提供所需的提供程序和模型环境变量，`--update` 就会创建初始 `openwiki/` 文档（如果它们尚不存在）。

提供凭证作为存储库机密或 CI 变量。典型值包括：

- 提供商 API 密钥（或无密钥提供商的 Copilot OAuth 令牌/云凭证）
- `OPENWIKI_PROVIDER`
- `OPENWIKI_MODEL_ID`
- 可选`LANGSMITH_API_KEY`用于追踪

计划的工作流程包括生成的 wiki 文件、`AGENTS.md`、`CLAUDE.md`，以及这些文件更改时文档拉取请求中的工作流程本身。

## 空更新OpenWiki 自动跟踪 `openwiki/.last-update.json` 中的 wiki 内容，并且仅在 wiki 实际更改时重写该文件。如果计划的 `--update` 运行不会导致更改，则 wiki 文件保持不变，并且 CI 不会打开拉取请求。

## CI 中的遥测

计划运行和 CI 运行在共享 CI 标识符下发送匿名可靠性遥测数据。要在 CI 中禁用遥测，请设置：

```bash
OPENWIKI_TELEMETRY_DISABLED=1
```

您可以取消注释示例工作流程中的相应行。要了解收集的内容以及如何在本地选择退出，请参阅[Customize OpenWiki](/oss/openwiki/customize#telemetry)。

## 另请参阅

- [Code mode](/oss/openwiki/code-mode)
- [Model providers](/oss/openwiki/providers)
- [CLI reference](/oss/openwiki/cli-reference)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/automate-updates.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>