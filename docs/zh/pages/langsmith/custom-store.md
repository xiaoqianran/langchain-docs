<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to use a custom store | https://docs.langchain.com/langsmith/custom-store -->

# 如何使用自定义商店

在代理部署中将内置 Postgres 存储替换为自定义 BaseStore 实现。

将代理部署到 LangSmith 时，服务器提供内置的 Postgres 支持的长期内存存储，并通过 pgvector 进行可选向量搜索。您可以将其替换为您自己的 [BaseStore](https://reference.langchain.com/python/langchain-core/stores/BaseStore) 实现，以使用不同的存储后端、自定义索引或专门的搜索功能。

您提供一个生成 `BaseStore` 实例的异步上下文管理器的路径，并且服务器自动管理存储的生命周期。

<Warning>
  定制商店处于 **alpha** 阶段。此功能可能会在次要版本更新中经历重大更改。
</Warning>

## 定义商店

从**现有** LangSmith 应用程序开始，创建一个文件来定义生成自定义存储的异步上下文管理器。如果您要开始一个新项目，您可以使用 CLI 从模板创建应用程序。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph new --template=new-langgraph-project-python my_new_project
```

异步上下文管理器模式允许服务器在应用程序生命周期的正确点打开和关闭存储连接。以下示例使用 `AsyncSqliteStore` 进行语义搜索：<Note>
  不建议在生产部署中使用 SQLite。
</Note>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# ./src/agent/store.py
import contextlib

from langchain.embeddings import init_embeddings
from langgraph.store.base import IndexConfig
from langgraph.store.sqlite import AsyncSqliteStore

embeddings = init_embeddings("openai:text-embedding-3-small")


@contextlib.asynccontextmanager
async def generate_store():
    """Yield a BaseStore, open for the duration of the server."""
    async with AsyncSqliteStore.from_conn_string(
        "./custom_store.sql",
        index=IndexConfig(
            dims=1536,
            embed=embeddings,
            fields=["$"],
        ),
    ) as store:
        await store.setup()
        yield store
```

<Note>
  配置自定义存储后，它会完全替换内置的 Postgres 存储。语义搜索和 TTL 扫描等功能取决于您的实现。
</Note>

## 配置`langgraph.json`

将 `store` 密钥添加到您的 [⟦T9⟧ configuration file](/langsmith/application-structure#configuration-file-concepts)。 `path` 指向您[defined earlier](#define-the-store) 的异步上下文管理器。

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "dependencies": ["."],
  "graphs": {
    "agent": "./src/agent/graph.py:graph"
  },
  "env": ".env",
  "store": {
    "path": "./src/agent/store.py:generate_store"
  }
}
```

## 启动服务器

在本地测试服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langgraph dev --no-browser
```

服务器日志将确认您的自定义商店处于活动状态：

```
Using custom store. Skipping store TTL sweeper.
```

## 部署

您可以将此应用程序按原样部署到 LangSmith 或您的自托管平台。

## 后续步骤

* [Use a custom checkpointer](/langsmith/custom-checkpointer) 替换内置检查点存储。
* 了解 LangGraph 中的[persistence and memory](/oss/python/langgraph/persistence)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-store.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>