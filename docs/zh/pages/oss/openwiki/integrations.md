<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Coding-agent integrations | https://docs.langchain.com/oss/openwiki/integrations -->

# 编码代理集成

OpenWiki 可以在现有的编码代理内运行，而不是启动自己的模型。编码代理调查存储库，规划 wiki，并使用其本机存储库工具编写每个分配的页面。 OpenWiki 拥有持久的页面作业生命周期、声明验证和持久性、源漂移处理和确定性最终确定。

主机驱动的运行仅支持存储库[code mode](/oss/openwiki/code-mode) wiki，而不支持[personal mode](/oss/openwiki/personal-mode)。它们使用编码代理的经过身份验证的模型会话，因此不需要 OpenWiki 提供者凭据。此路径尚不支持来自连接器的上下文，包括 LangSmith。

## 安装集成

支持的主机有 **Codex**、**Claude Code**、**OpenCode** 和 **Cursor**。安装默认为用户级别，因此可以从任何 Git 存储库进行一次安装：

```bash
openwiki integrations install codex
openwiki integrations install claude
openwiki integrations install opencode
openwiki integrations install cursor
```

安装后重新启动编码代理。然后打开存储库并询问：

```txt
Initialize this repository's OpenWiki from the current source and tests.
```

对于现有的 wiki，请询问：

```txt
Update this repository's OpenWiki for changes since its last successful run.
```

### 检查或卸载

```bash
openwiki integrations list
openwiki integrations uninstall <codex|claude|opencode|cursor>
```

将 `--project [path]` 添加到 `list`、`install` 或 `uninstall` 以获取存储库范围内的状态。项目路径解析为 Git 存储库根目录。用户级 OpenCode 集成位于 `~/.config/opencode` 下。

## 主机驱动的运行如何工作主机驱动的运行遵循与本机`openwiki --init`和`openwiki --update`相同的可恢复页面作业生命周期。编码代理驱动存储库研究和页面创作； OpenWiki 验证每个完成情况，保留[Grounded Claims](/oss/openwiki/code-mode#grounded-claims)，并通过 MCP 最终确定元数据。

## 另请参阅

- [Code mode](/oss/openwiki/code-mode)
- [CLI reference](/oss/openwiki/cli-reference)
- [Quickstart](/oss/openwiki/quickstart)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/integrations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>