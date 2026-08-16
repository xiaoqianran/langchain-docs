<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use docs programmatically | https://docs.langchain.com/use-these-docs -->

# 以编程方式使用文档

我们希望使我们的文档尽可能易于访问。我们提供了多种方法，供您通过 AI 助手、代码编辑器和直接集成（例如模型上下文协议 (MCP)）以编程方式使用这些文档。

## 快速访问选项

在我们文档的任何页面上，您都会在右上角找到一个上下文菜单下拉列表：

<img
    className="block dark:hidden"
    src="/images/copy-page-light.png"
    alt="Copy page light mode"
/>

<img
    className="hidden dark:block"
    src="/images/copy-page-dark.png"
    alt="Copy page dark mode"
/>

这包括我们的`llms.txt`、MCP 服务器连接以及其他快速访问选项，例如 ChatGPT 和 Claude。

## 使用我们的 MCP 服务器

我们的文档公开了两个互补的 **模型上下文协议 (MCP) 服务器**，让 AI 应用程序可以实时查询 LangChain 内容。为了获得最佳结果，我们建议连接两者：

|服务器|网址 |它涵盖什么 |
|--------|-----|----------------|
| `docs-langchain` | `https://docs.langchain.com/mcp` | LangChain、LangGraph 和 LangSmith 的概念指南、操作方法、教程和产品文档 |
| `reference-langchain` | `https://reference.langchain.com/mcp` | API 参考：所有 LangChain 包的类、方法、参数和签名 |

添加两者可以让您的编码代理了解完整情况：指南中的**原因和方式**，以及参考文档中的**准确的 API 详细信息**。

### 与克劳德代码联系如果您使用的是 Claude Code，请在终端中运行以下命令以将两台服务器添加到当前项目中：

```bash
claude mcp add --transport http docs-langchain https://docs.langchain.com/mcp
claude mcp add --transport http reference-langchain https://reference.langchain.com/mcp
```

<Note>
    **项目（本地）范围**

    上面的命令仅将 MCP 服务器添加到您当前的项目/工作目录。要全局添加它们并在所有项目中访问它们，请通过包含 `--scope user` 来添加用户范围：

    ```bash
    claude mcp add --transport http docs-langchain --scope user https://docs.langchain.com/mcp
    claude mcp add --transport http reference-langchain --scope user https://reference.langchain.com/mcp
    ```
</Note>

### 连接克劳德桌面

1.打开克劳德桌面
2. 转到设置 > 连接器
3. 添加两个 MCP 服务器 URL：
   - `https://docs.langchain.com/mcp`
   - `https://reference.langchain.com/mcp`

### 使用 Codex CLI 连接

如果您使用 OpenAI Codex CLI，请在终端中运行以下命令以全局添加两个服务器：

```sh
codex mcp add langchain-docs --url https://docs.langchain.com/mcp
codex mcp add langchain-reference --url https://reference.langchain.com/mcp
```

### 连接光标

将以下内容添加到您的 MCP 设置配置文件中：

```json
{
  "mcpServers": {
    "docs-langchain": {
      "url": "https://docs.langchain.com/mcp"
    },
    "reference-langchain": {
      "url": "https://reference.langchain.com/mcp"
    }
  }
}
```

### 使用Deep Agents代码连接

将两个服务器添加到您的用户级 `~/.deepagents/.mcp.json` 文件中，以使它们在每个 Deep Agents 代码项目中可用，或者将它们添加到仅该项目的项目级 `.mcp.json` 文件中：

```json
{
  "mcpServers": {
    "docs-langchain": {
      "type": "http",
      "url": "https://docs.langchain.com/mcp"
    },
    "reference-langchain": {
      "type": "http",
      "url": "https://reference.langchain.com/mcp"
    }
  }
}
```

启动或重新启动`dcode`以加载服务器。在交互式会话中，运行`/mcp`来检查服务器状态和加载的工具。有关发现位置和优先规则，请参阅[MCP tools](/oss/deepagents/code/mcp-tools)。

### 连接 VS Code

将以下内容添加到您的 MCP 设置配置文件中：

```json
{
  "servers": {
    "docs-langchain": {
      "url": "https://docs.langchain.com/mcp"
    },
    "reference-langchain": {
      "url": "https://reference.langchain.com/mcp"
    }
  }
}
```### 与反重力联系

将以下内容添加到您的 MCP 设置配置文件中：

```json
{
  "mcpServers": {
    "docs-langchain": {
      "serverUrl": "https://docs.langchain.com/mcp"
    },
    "reference-langchain": {
      "serverUrl": "https://reference.langchain.com/mcp"
    }
  }
}
```

## 了解更多

有关使用 Mintlify 的 MCP 服务器的更多信息，请参阅 [official Mintlify documentation](https://www.mintlify.com/docs/ai/model-context-protocol)。

有疑问或反馈吗？请通过我们的[community forum](https://forum.langchain.com/)告诉我们。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/use-these-docs.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>