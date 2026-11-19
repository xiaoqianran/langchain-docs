<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Improve retrieval quality | https://docs.langchain.com/oss/javascript/langchain/retrieval-optimization -->

# 提高检索质量

通过元数据过滤、查询转换、混合搜索、最大边际相关性和重新排名，提高 LangChain 中的 RAG 检索质量。

检索质量为 [RAG](/oss/javascript/deepagents/retrieval) 应用程序设定了上限：模型只能从它接收到的上下文中进行回答。当答案不完整或错误时，原因通常是检索器，而不是模型。本指南涵盖了改进检索器返回内容的技术，从廉价的配置更改到两阶段重新排名管道。

每种技术都会改变下面的基线检索工具的主体。根据需要将它们组合起来，并根据固定数据集衡量每个更改，以便保留有用的内容。

> [!提示]
>
> 使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-retrieval-optimization) 对这些实验进行评分。 [RAG evaluation tutorial](/langsmith/evaluate-rag-tutorial) 展示了如何衡量检索和答案质量。

## 开始之前

本指南假设您有一个索引的 `vector_store` 并将检索作为 [tool](/oss/javascript/langchain/tools) 公开给代理。有关索引，请参阅[Build a semantic search engine](/oss/javascript/langchain/knowledge-base)。

基线检索工具运行单个相似性搜索：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { tool } from "@langchain/core/tools";

const retrieve = tool(
  async ({ query }) => {
    const docs = await vectorStore.similaritySearch(query, 4);
    const serialized = docs
      .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join("\n\n");
    return [serialized, docs];
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: z.object({ query: z.string() }),
    responseFormat: "content_and_artifact",
  },
);
```

使用 [createAgent](https://reference.langchain.com/javascript/langchain/index/createAgent) 将工具传递给代理：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { createAgent } from "langchain";

const agent = createAgent({ model: "claude-sonnet-4-6", tools: [retrieve] });
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

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const docs = await vectorStore.similaritySearch(query, 4, {
  section: "introduction",  // [!code highlight]
});
```

要让模型选择范围，请将过滤器公开为工具参数。该模型从对话中填充它：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { tool } from "@langchain/core/tools";

const retrieve = tool(
  async ({ query, section }) => {
    const docs = await vectorStore.similaritySearch(query, 4, { section });
    const serialized = docs
      .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join("\n\n");
    return [serialized, docs];
  },
  {
    name: "retrieve",
    description: "Retrieve information from a specific section of the document.",
    schema: z.object({
      query: z.string(),
      section: z.enum(["introduction", "methods", "results"]),
    }),
    responseFormat: "content_and_artifact",
  },
);
```

> [!注意]
>
> 过滤器语法是特定于向量存储的。此处显示的字典形式适用于大多数生产商店，例如 Pinecone 和 PGVector。一些存储，包括`InMemoryVectorStore`，采用谓词函数。有关详细信息，请参阅您的[vector store integration](/oss/javascript/integrations/vectorstores)。

## 转换查询

用户问题并不总是好的搜索查询。它可以是模糊的、对话式的，或者包含几个不同的信息需求。在检索之前将问题转换为一个或多个集中查询可以提高召回率。

使用 [structured output](/oss/javascript/langchain/structured-output) 生成重点查询，对每个查询运行搜索，然后合并结果：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import { ChatAnthropic } from "@langchain/anthropic";

const SearchQueries = z.object({
  queries: z.array(z.string()).describe("One to three search queries."),
});

const queryModel = new ChatAnthropic({ model: "claude-sonnet-4-6" }).withStructuredOutput(
  SearchQueries,
);

async function expandQuery(question: string): Promise<string[]> {
  const result = await queryModel.invoke(
    `Generate one to three focused search queries for: ${question}`,
  );
  return result.queries;
}
```

检索每个生成的查询并对结果进行重复数据删除：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "@langchain/core/tools";

const retrieve = tool(
  async ({ query }) => {
    const seen = new Set<string>();
    const docs = [];
    for (const expanded of await expandQuery(query)) {
      for (const doc of await vectorStore.similaritySearch(expanded, 4)) {
        if (!seen.has(doc.pageContent)) {
          seen.add(doc.pageContent);
          docs.push(doc);
        }
      }
    }
    const serialized = docs
      .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join("\n\n");
    return [serialized, docs];
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: z.object({ query: z.string() }),
    responseFormat: "content_and_artifact",
  },
);
```> [!提示]
>
> 代理已经在某种程度上重写了查询：它根据对话决定搜索什么。当您每轮检索一次（如在两步 RAG 链中）或当单个搜索错过相关文档时，查询转换最有用。

## 结合语义和关键词搜索

语义（密集）搜索与含义匹配，但可能会错过确切的产品代码、标识符、名称和罕见的关键字。关键字（稀疏）搜索与这些术语完全匹配。混合搜索运行两者并结合排名，从而提高混合概念与特定术语的查询的召回率。

> [!注意]
>
> 许多矢量存储集成本身支持混合搜索，这对于大型语料库来说是最有效的选择。请查看您的 [vector store integration](/oss/javascript/integrations/vectorstores) 来启用它，然后在检索工具中请求混合结果。

没有第一方 BM25 猎犬。首选在 [vector store](/oss/javascript/integrations/vectorstores) 上进行本机混合搜索（如果可用）。对于可移植的回退，请对用于构建商店的相同 `chunks` 运行关键字搜索（该示例使用简单术语重叠；将其替换为商店的关键字 API 或 BM25 库），然后将排名与倒数排名融合合并：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as z from "zod";
import type { Document } from "@langchain/core/documents";
import { tool } from "@langchain/core/tools";

function keywordSearch(query: string, k = 10): Document[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return chunks
    .map((doc) => ({
      doc,
      score: terms.reduce(
        (acc, term) => acc + (doc.pageContent.toLowerCase().includes(term) ? 1 : 0),
        0,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ doc }) => doc);
}

function reciprocalRankFusion(resultLists: Document[][], smoothing = 60): Document[] {
  const scores = new Map<string, number>();
  const docsByKey = new Map<string, Document>();
  for (const docs of resultLists) {
    docs.forEach((doc, rank) => {
      const key = doc.pageContent;
      docsByKey.set(key, doc);
      scores.set(key, (scores.get(key) ?? 0) + 1 / (smoothing + rank));
    });
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => docsByKey.get(key)!);
}

const retrieve = tool(
  async ({ query }) => {
    const dense = await vectorStore.similaritySearch(query, 10);
    const sparse = keywordSearch(query, 10);
    const docs = reciprocalRankFusion([dense, sparse]).slice(0, 4);
    const serialized = docs
      .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join("\n\n");
    return [serialized, docs];
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: z.object({ query: z.string() }),
    responseFormat: "content_and_artifact",
  },
);
```## 以最大边际相关性使结果多样化

简单的相似性搜索可以返回几个接近重复的块，这会浪费重复信息的上下文。最大边际相关性 (MMR) 选择与查询相关且彼此不同的结果。

使用向量存储的最大边际相关性搜索代替 `similarity_search`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const docs = await vectorStore.maxMarginalRelevanceSearch(query, {
  k: 4, // number of documents to return
  fetchK: 20, // number of candidates to consider before selecting
  lambda: 0.5, // 1.0 favors relevance, 0.0 favors diversity
});
```

MMR 通过相似性获取`fetch_k` 候选者，然后选择平衡相关性和冗余的`k`。并非所有向量存储都实现 MMR；检查您的[vector store integration](/oss/javascript/integrations/vectorstores)。

## 对检索到的文档重新排序

嵌入相似度是一个粗略的相关信号，因此相似度最高的结果并不总是最相关的。重新排序器直接针对查询对每个候选进行评分并对它们重新排序，这通常会产生最大的单一质量增益。使用两阶段检索：通过相似性搜索获取广泛的候选集，然后重新排序为一个小的高精度集。

在工具内调用重新排序器。此示例使用 `@langchain/cohere` 中的 `CohereRerank`：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "@langchain/core/tools";
import { CohereRerank } from "@langchain/cohere";

const reranker = new CohereRerank({ model: "rerank-v5.0-pro", topN: 4 });

const retrieve = tool(
  async ({ query }) => {
    const candidates = await vectorStore.similaritySearch(query, 20);
    const docs = await reranker.compressDocuments(candidates, query);
    const serialized = docs
      .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join("\n\n");
    return [serialized, docs];
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: z.object({ query: z.string() }),
    responseFormat: "content_and_artifact",
  },
);
```> [!注意]
>
> 重新排名增加了一个额外的步骤，托管的重新排名程序为每次检索添加了一个 API 调用，这会增加延迟。在大多数 RAG 应用中，质量增益是值得付出成本的。请参阅 [Cohere reranker integration](/oss/javascript/integrations/document_compressors/cohere_rerank) 进行设置，或参阅 [retriever integration](/oss/javascript/integrations/retrievers) 进行其他选项。

## 另请参阅

* [Retrieval](/oss/javascript/deepagents/retrieval)：概念和RAG架构
* [Build a semantic search engine](/oss/javascript/langchain/knowledge-base)：将文档索引到向量存储中
* [RAG with Deep Agents](/oss/javascript/deepagents/rag)：使用Deep Agents进行端到端检索和生成
* [Build a custom RAG agent with LangGraph](/oss/javascript/langgraph/agentic-rag)：对文档进行评分并使用自定义图表重写查询
* [Evaluate a RAG application](/langsmith/evaluate-rag-tutorial)：衡量检索和答案质量
* [Retriever integrations](/oss/javascript/integrations/retrievers) 和 [vector store integrations](/oss/javascript/integrations/vectorstores)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/retrieval-optimization.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。