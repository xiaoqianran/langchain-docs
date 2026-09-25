<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Built-in search powered by Parallel | https://docs.langchain.com/langsmith/javascript/managed-deep-agents-search -->

# 由 Parallel 提供支持的内置搜索

[Managed Deep Agents](/langsmith/javascript/managed-deep-agents-overview) 包括由 [Parallel](https://parallel.ai) 提供支持的内置网络搜索。让您的代理能够访问网络上的最新信息以帮助回答问题。

LangSmith 管理搜索基础设施，因此您无需托管服务或创建单独的并行帐户或 API 密钥即可添加搜索。该集成提供零数据保留。

<Note>
内置搜索仅适用于 LangSmith Plus 和 Startup 计划。内测期间免费使用。
</Note>

## 开始之前

您需要现有的 [Managed Deep Agents project](/langsmith/javascript/managed-deep-agents-quickstart)、LangSmith 工作区 ID 和个人 LangSmith API 密钥才能在 Studio 中使用。

## 添加并行搜索

要将并行搜索添加到您的代理：

### 步骤 1. 设置您的工作区 ID

在项目的 `.env` 文件中，设置您的 LangSmith 工作区 ID：

```shell .env
LANGSMITH_WORKSPACE_ID=YOUR_WORKSPACE_ID
```

### 步骤 2. 设置您的 LangSmith API 密钥

在同一个 `.env` 文件中，设置个人 LangSmith API 密钥以在 Studio 中使用：

```shell .env
LANGSMITH_API_KEY=YOUR_LANGSMITH_API_KEY
```

您不需要并行 API 密钥。

### 步骤 3. 配置搜索服务器

如果文件已经定义了`mcp`，请将`Parallel`添加到现有的`servers`映射中。仅定义一次`mcp`。

<Tabs>
<Tab title="Python">
将`Parallel`添加到`tools/mcp.py`中的`servers`地图。

```python tools/mcp.py
from managed_deepagents import define_mcp

mcp = define_mcp(
    servers={
        "Parallel": {
            "transport": "http",
            "url": "https://api.smith.langchain.com/v1/managed-tools/servers/parallel/mcp",
        },
    },
)
```
</Tab>
<Tab title="TypeScript">
将`Parallel`添加到`tools/mcp.ts`中的`servers`地图。

```typescript tools/mcp.ts
import { defineMcp } from "managed-deepagents";

export const mcp = defineMcp({
  servers: {
    "Parallel": {
      transport: "http",
      url: "https://api.smith.langchain.com/v1/managed-tools/servers/parallel/mcp",
    },
  },
});
```
</Tab>
</Tabs>您的代理现在可以将并行搜索与其其他工具一起使用。

## 使用条款

您对该集成的使用必须遵守 Parallel 的服务条款，包括其对禁止或滥用使用的限制。

## 另请参阅

- [Connect to MCP servers](/langsmith/javascript/managed-deep-agents-mcp-connectors)
- [Add custom tools](/langsmith/javascript/managed-deep-agents-tools)

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-search.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>