<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to add semantic search to your agent deployment | https://docs.langchain.com/langsmith/semantic-search -->

# 如何将语义搜索添加到代理部署中

语义搜索可让您的代理通过含义而不是确切的措辞来回忆存储的记忆和文档。例如，对“UI首选项”的查询会显示写为“用户更喜欢深色界面”的记忆。本指南向您展示如何在部署的跨线程[store](/oss/python/langgraph/stores)上启用语义搜索，以便您的代理保留跨对话的上下文并根据之前的交互个性化响应。

## 先决条件

* 部署（参考[how to set up an application for deployment](/langsmith/setup-app-requirements-txt)）和[hosting options](/langsmith/platform-setup)的详细信息。
* 您的嵌入提供商（在本例中为 OpenAI）的 API 密钥。
* `langchain >= 0.3.8`（如果您指定使用本指南中的字符串格式）。

## 步骤

1. 更新您的 [⟦T10⟧ configuration file](/langsmith/application-structure#configuration-file) 以包含商店配置：

   ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   {
       ...
       "store": {
           "index": {
               "embed": "openai:text-embedding-3-small",
               "dims": 1536,
               "fields": ["$"]
           }
       }
   }
   ```

   这个配置：

   * 使用 OpenAI 的 text-embedding-3-small 模型来生成嵌入。
   * 将嵌入维度设置为 1536（与模型的输出匹配）。
   * 索引存储数据中的所有字段（`["$"]` 表示索引所有内容，或指定特定字段，如`["text", "metadata.title"]`）。<Note>
     每个部署都支持单个嵌入模型。 LangSmith 不支持配置多个嵌入模型，因为这会导致 `/store` 端点不明确并导致混合索引问题。
   </Note>

2. 要使用字符串嵌入格式，请确保您的依赖项包含`langchain >= 0.3.8`：

   ```toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   # In pyproject.toml
   [project]
   dependencies = [
       "langchain>=0.3.8"
   ]
   ```

   或者，如果使用 [requirements.txt](/langsmith/setup-app-requirements-txt)：

   ```
   langchain>=0.3.8
   ```

## 用法

配置完成后，您可以在 [nodes](/oss/python/langgraph/graph-api#nodes) 中使用语义搜索。存储需要一个命名空间元组来组织内存：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
async def search_memory(state: State, *, store: BaseStore):
    # Search the store using semantic similarity
    # The namespace tuple helps organize different types of memories
    # e.g., ("user_facts", "preferences") or ("conversation", "summaries")
    results = await store.asearch(
        namespace=("memory", "facts"),  # Organize memories by type
        query="your search query",
        limit=3  # number of results to return
    )
    return results
```

每个结果都是一个`SearchItem`（使用附加的`score`字段扩展`Item`）。当配置语义搜索时，`score`包含相似度分数：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
results[0].key       # "07e0caf4-1631-47b7-b15f-65515d4c1843"
results[0].value     # {"text": "User prefers dark mode"}
results[0].namespace # ("memory", "facts")
results[0].score     # 0.92 (similarity score, present when semantic search is configured)
```

### 改变你的嵌入模型

<Warning>
  更改嵌入模型或维度需要重新嵌入所有现有数据。没有用于此目的的自动迁移工具。如果您需要切换型号，请相应计划。
</Warning>

## 自定义嵌入

如果您想使用自定义嵌入，您可以将路径传递给自定义嵌入函数：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
    ...
    "store": {
        "index": {
            "embed": "path/to/embedding_function.py:embed",
            "dims": 1536,
            "fields": ["$"]
        }
    }
}
```

部署将在指定路径中查找该函数。该函数必须是异步的并接受字符串列表：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# path/to/embedding_function.py
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def aembed_texts(texts: list[str]) -> list[list[float]]:
    """Custom embedding function that must:
    1. Be async
    2. Accept a list of strings
    3. Return a list of float arrays (embeddings)
    """
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    return [e.embedding for e in response.data]
```

## 通过API查询您也可以使用[LangGraph SDK](/langsmith/langgraph-python-sdk)查询商店。由于 SDK 使用异步操作：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langgraph_sdk import get_client

async def search_store():
    client = get_client()
    results = await client.store.search_items(
        ("memory", "facts"),
        query="your search query",
        limit=3  # number of results to return
    )
    return results

# Use in an async context
results = await search_store()
```

配置语义搜索时，每个结果项都包含一个 `score` 字段：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
results["items"][0]["key"]       # "07e0caf4-1631-47b7-b15f-65515d4c1843"
results["items"][0]["value"]     # {"text": "User prefers dark mode"}
results["items"][0]["namespace"] # ["memory", "facts"]
results["items"][0]["score"]     # 0.92 (similarity score)
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/semantic-search.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>