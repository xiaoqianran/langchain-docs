<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Improve retrieval quality | https://docs.langchain.com/oss/python/langchain/retrieval-optimization -->

# 提高检索质量

通过元数据过滤、查询转换、混合搜索、最大边际相关性和重新排名，提高 LangChain 中的 RAG 检索质量。

检索质量为 [RAG](/oss/python/deepagents/retrieval) 应用程序设定了上限：模型只能从它接收到的上下文中进行回答。当答案不完整或错误时，原因通常是检索器，而不是模型。本指南涵盖了改进检索器返回内容的技术，从廉价的配置更改到两阶段重新排名管道。

每种技术都会改变下面的基线检索工具的主体。根据需要将它们组合起来，并根据固定数据集衡量每个更改，以便保留有用的内容。

> [!提示]
>
> 使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-retrieval-optimization) 对这些实验进行评分。 [RAG evaluation tutorial](/langsmith/evaluate-rag-tutorial) 展示了如何衡量检索和答案质量。

## 开始之前

本指南假设您有一个索引的 `vector_store` 并将检索作为 [tool](/oss/python/langchain/tools) 公开给代理。有关索引，请参阅[Build a semantic search engine](/oss/python/langchain/knowledge-base)。

基线检索工具运行单个相似性搜索：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool


@tool(response_format="content_and_artifact")
def retrieve(query: str):
    """Retrieve information related to a query."""
    docs = vector_store.similarity_search(query, k=4)
    serialized = "\n\n".join(
        f"Source: {doc.metadata}\nContent: {doc.page_content}" for doc in docs
    )
    return serialized, docs
```

将工具传递给具有 [create_agent](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 的代理：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent

agent = create_agent("claude-sonnet-4-6", [retrieve])
```

## 选择一种技术从与您观察到的故障相匹配的技术开始，然后根据需要分层使用其他技术。重新排序为大多数应用程序提供了最大的收益，并且与广泛的第一阶段检索很好地结合在一起。

|症状|技术|
| - | - |
|结果来自错误的子集（错误的租户、日期或类别）| [Filter by metadata](#filter-by-metadata) |
|当措辞与问题不同时，相关文档就会被遗漏 | [Transform the query](#transform-the-query) |
|遗漏了确切的名称、代码或罕见的关键字 | [Combine semantic and keyword search](#combine-semantic-and-keyword-search) |
|几个近乎重复的块挤出了其他信息| [Diversify results with maximal marginal relevance](#diversify-results-with-maximal-marginal-relevance) |
|结果大致相关，但顺序不佳 | [Rerank retrieved documents](#rerank-retrieved-documents) |

常见的高质量管道结合了几个：过滤到正确的范围，通过混合搜索检索广泛的候选集，然后重新排序到一个小的集合。在发货前使用 [LangSmith evaluation](/langsmith/evaluate-rag-tutorial) 验证数据集上的组合。

以下部分更改了基线工具的主体。每个都是独立的，因此仅采用能够解决您观察到的问题的那些。

## 按元数据过滤元数据过滤在运行相似性搜索之前将搜索限制为文档子集。它通过缩小候选集来提高精度并减少延迟，并且是将检索范围限定为租户、日期范围、类别或部分的最可靠方法。

过滤要求您在索引时将元数据附加到每个块。当范围固定时应用静态过滤器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docs = vector_store.similarity_search(
    query,
    k=4,
    filter={"section": "introduction"},  # [!code highlight]
)
```

要让模型选择范围，请将过滤器公开为工具参数。该模型从对话中填充它：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from typing import Literal

from langchain.tools import tool


@tool(response_format="content_and_artifact")
def retrieve(query: str, section: Literal["introduction", "methods", "results"]):
    """Retrieve information from a specific section of the document."""
    docs = vector_store.similarity_search(query, k=4, filter={"section": section})
    serialized = "\n\n".join(
        f"Source: {doc.metadata}\nContent: {doc.page_content}" for doc in docs
    )
    return serialized, docs
```

> [!注意]
>
> 过滤器语法是特定于向量存储的。此处显示的字典形式适用于大多数生产商店，例如 Pinecone 和 PGVector。一些存储，包括`InMemoryVectorStore`，采用谓词函数。有关详细信息，请参阅您的[vector store integration](/oss/python/integrations/vectorstores)。

## 转换查询

用户问题并不总是好的搜索查询。它可以是模糊的、对话式的，或者包含几个不同的信息需求。在检索之前将问题转换为一个或多个集中查询可以提高召回率。

使用 [structured output](/oss/python/langchain/structured-output) 生成重点查询，对每个查询运行搜索，然后合并结果：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field


class SearchQueries(BaseModel):
    """Focused search queries derived from a user question."""

    queries: list[str] = Field(description="One to three search queries.")


query_model = init_chat_model("claude-sonnet-4-6").with_structured_output(SearchQueries)


def expand_query(question: str) -> list[str]:
    result = query_model.invoke(
        f"Generate one to three focused search queries for: {question}"
    )
    return result.queries
```

检索每个生成的查询并对结果进行重复数据删除：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool


@tool(response_format="content_and_artifact")
def retrieve(query: str):
    """Retrieve information related to a query."""
    seen, docs = set(), []
    for expanded in expand_query(query):
        for doc in vector_store.similarity_search(expanded, k=4):
            if doc.page_content not in seen:
                seen.add(doc.page_content)
                docs.append(doc)
    serialized = "\n\n".join(
        f"Source: {doc.metadata}\nContent: {doc.page_content}" for doc in docs
    )
    return serialized, docs
```> [!提示]
>
> 代理已经在某种程度上重写了查询：它根据对话决定搜索什么。当您每轮检索一次（如在两步 RAG 链中）或当单个搜索错过相关文档时，查询转换最有用。

## 结合语义和关键词搜索

语义（密集）搜索与含义匹配，但可能会错过确切的产品代码、标识符、名称和罕见的关键字。关键字（稀疏）搜索与这些术语完全匹配。混合搜索运行两者并结合排名，从而提高混合概念与特定术语的查询的召回率。

> [!注意]
>
> 许多矢量存储集成本身支持混合搜索，这对于大型语料库来说是最有效的选择。请查看您的 [vector store integration](/oss/python/integrations/vectorstores) 来启用它，然后在检索工具中请求混合结果。

要自己组合检索器，请将向量存储与关键字检索器（例如 [⟦T11⟧](/oss/python/integrations/retrievers)）配对，并通过倒数排名融合合并两个排名。 `BM25Retriever` 需要 `rank_bm25` 包并从相同的块构建内存索引：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool
from langchain_community.retrievers import BM25Retriever

keyword_retriever = BM25Retriever.from_documents(chunks)
keyword_retriever.k = 10


def reciprocal_rank_fusion(result_lists, smoothing=60):
    scores, docs_by_key = {}, {}
    for docs in result_lists:
        for rank, doc in enumerate(docs):
            key = doc.page_content
            docs_by_key[key] = doc
            scores[key] = scores.get(key, 0) + 1 / (smoothing + rank)
    ranked = sorted(scores, key=scores.get, reverse=True)
    return [docs_by_key[key] for key in ranked]


@tool(response_format="content_and_artifact")
def retrieve(query: str):
    """Retrieve information related to a query."""
    dense = vector_store.similarity_search(query, k=10)
    sparse = keyword_retriever.invoke(query)
    docs = reciprocal_rank_fusion([dense, sparse])[:4]
    serialized = "\n\n".join(
        f"Source: {doc.metadata}\nContent: {doc.page_content}" for doc in docs
    )
    return serialized, docs
```

## 以最大边际相关性使结果多样化简单的相似性搜索可以返回几个接近重复的块，这会浪费重复信息的上下文。最大边际相关性 (MMR) 选择与查询相关且彼此不同的结果。

使用向量存储的最大边际相关性搜索代替 `similarity_search`：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
docs = vector_store.max_marginal_relevance_search(
    query,
    k=4,  # number of documents to return
    fetch_k=20,  # number of candidates to consider before selecting
    lambda_mult=0.5,  # 1.0 favors relevance, 0.0 favors diversity
)
```

MMR 通过相似性获取`fetch_k` 候选者，然后选择平衡相关性和冗余的`k`。并非所有向量存储都实现 MMR；检查您的[vector store integration](/oss/python/integrations/vectorstores)。

## 对检索到的文档重新排序

嵌入相似度是一个粗略的相关信号，因此相似度最高的结果并不总是最相关的。重新排序器直接针对查询对每个候选进行评分并对它们重新排序，这通常会产生最大的单一质量增益。使用两阶段检索：通过相似性搜索获取广泛的候选集，然后重新排序为一个小的高精度集。

在工具内调用重新排序器。此示例使用 [⟦T17⟧](/oss/python/integrations/retrievers/cohere-reranker)：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool
from langchain_cohere import CohereRerank

reranker = CohereRerank(model="rerank-v5.0-pro", top_n=4)


@tool(response_format="content_and_artifact")
def retrieve(query: str):
    """Retrieve information related to a query."""
    candidates = vector_store.similarity_search(query, k=20)  # [!code highlight]
    docs = reranker.compress_documents(candidates, query)  # [!code highlight]
    serialized = "\n\n".join(
        f"Source: {doc.metadata}\nContent: {doc.page_content}" for doc in docs
    )
    return serialized, docs
```> [!注意]
>
> 重新排名增加了一个额外的步骤，托管的重新排名程序为每次检索添加了一个 API 调用，这会增加延迟。在大多数 RAG 应用中，质量增益是值得付出成本的。对于没有 API 调用的本地选项，请使用 [cross-encoder reranker](/oss/python/integrations/document_transformers/cross_encoder_reranker)。其他托管选项包括[Voyage AI](/oss/python/integrations/document_transformers/voyageai-reranker)。

## 另请参阅

* [Retrieval](/oss/python/deepagents/retrieval)：概念和RAG架构
* [Build a semantic search engine](/oss/python/langchain/knowledge-base)：将文档索引到向量存储中
* [RAG with Deep Agents](/oss/python/deepagents/rag)：使用Deep Agents进行端到端检索和生成
* [Build a custom RAG agent with LangGraph](/oss/python/langgraph/agentic-rag)：对文档进行评分并使用自定义图表重写查询
* [Evaluate a RAG application](/langsmith/evaluate-rag-tutorial)：衡量检索和答案质量
* [Retriever integrations](/oss/python/integrations/retrievers) 和 [vector store integrations](/oss/python/integrations/vectorstores)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/retrieval-optimization.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。