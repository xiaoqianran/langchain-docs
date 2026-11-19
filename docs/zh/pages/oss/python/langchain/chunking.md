<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Chunk documents for retrieval | https://docs.langchain.com/oss/python/langchain/chunking -->

# 用于检索的块文档

在LangChain中为RAG选择分块策略，包括递归和基于标记的分割、结构感知和语义分块、从小到大检索以及块元数据。

在嵌入和索引源文档之前，分块会将源文档分割成更小的部分。块边界决定检索器可以返回的内容：混合多个主题的块会稀释其嵌入，而将一个想法分成两部分的块会隐藏模型的上下文。分块是[RAG](/oss/python/deepagents/retrieval)质量的最大因素之一，也是最不明显的调整因素之一。

本指南介绍了如何选择和调整分块策略。有关每个分离器的结构，请参阅[text splitter integrations](/oss/python/integrations/splitters)。这些示例假设 `docs` 是加载的 [Document](https://reference.langchain.com/python/langchain-core/documents/base/Document) 对象的列表，如 [RAG with Deep Agents](/oss/python/deepagents/rag) 中生成的。

> [!提示]
>
> 分块选择是经验性的。使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-chunking) 对它们进行跟踪和评分：[RAG evaluation tutorial](/langsmith/evaluate-rag-tutorial) 展示了如何衡量数据集上的检索和答案质量，以便您可以比较策略而不是猜测。

## 平衡块大小和重叠

块大小会牺牲上下文的精度，并且不存在普遍的最佳值。这取决于您的文档、嵌入模型以及您期望的问题。* **小块**产生集中的嵌入和精确的匹配，但单个块可能缺乏模型需要回答的周围上下文。
* **大块** 每个块承载更多上下文，但它们的嵌入将多个主题模糊在一起，这使得它们更难匹配并且每个检索到的块花费更多令牌。

块重叠会重复相邻块之间的一部分文本，以便边界处的想法分裂在至少一个块中仍然显得完整。常见的起点是块大小的 10% 到 20% 的重叠。

|如果检索|调整|
| - | - |
|返回缺乏上下文来回答的片段 |增加块大小或重叠 |
|返回用不相关文本填充的长块 |减少块大小 |
|将相关想法分成两个部分 |增加结构上的重叠或分割 |

将这些作为起点并通过[evaluating your chunking](#evaluate-your-chunking)进行确认。

## 从递归字符分割开始

从[RecursiveCharacterTextSplitter](https://reference.langchain.com/python/langchain-text-splitters/character/RecursiveCharacterTextSplitter)开始。它按降序的分隔符列表（段落、句子、单词）进行拆分，只要符合目标大小，就会将语义相关的文本保持在一起。这是通用文本的推荐默认值。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # target chunk size (characters)
    chunk_overlap=200,  # overlap between adjacent chunks (characters)
)
chunks = splitter.split_documents(docs)
```

## 按标记调整块大小字符数代表了真正重要的事情：嵌入模型有令牌限制并按令牌计费。通过令牌调整块的大小可以使每个块保持在模型的限制内，并使成本可预测。当块必须适合特定模型时，或者当您想要直接控制令牌成本时，请使用基于令牌的拆分器。

`RecursiveCharacterTextSplitter.from_tiktoken_encoder` 保留递归分隔符策略并以标记而不是字符来测量块大小：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    encoding_name="cl100k_base",
    chunk_size=256,  # target chunk size (tokens)
    chunk_overlap=32,  # overlap (tokens)
)
chunks = splitter.split_documents(docs)
```

> [!注意]
>
> `cl100k_base` 编码是多个 OpenAI 模型使用的分词器。其他提供商的代币化方式不同，因此跨模型的代币计数是近似值。当精确限制很重要时，选择与您的嵌入模型相匹配的编码。有关更多令牌分割选项，请参阅[Split by tokens](/oss/python/integrations/splitters/split_by_token)。

## 根据文档结构进行拆分

当文档具有结构（例如 Markdown、HTML 或源代码）时，请沿该结构进行拆分。结构边界将相关内容保持在一起，并且允许您将结构本身捕获为元数据。Markdown 文件按标题组织。 [⟦T8⟧](/oss/python/integrations/splitters/markdown_header_metadata_splitter) 拆分您指定的标头，并将每个标头记录在块的元数据中，您稍后可以将其用于 [filter retrieval](/oss/python/integrations/vectorstores#metadata-filtering)。标头拆分是整个部分，因此当部分可能超出目标块大小时，请使用基于大小的拆分器：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]
markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)
header_chunks = markdown_splitter.split_text(markdown_text)
# Each chunk's metadata includes the headers that contain it.

size_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)
chunks = size_splitter.split_documents(header_chunks)
```

使用 `from_language` 沿其自身边界（函数、类和块）分割源代码：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_text_splitters import Language, RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=500,
    chunk_overlap=0,
)
chunks = splitter.create_documents([source_code])
```

对于 HTML 和 JSON 拆分器，请参阅 [text splitter integrations](/oss/python/integrations/splitters)。

## 按含义分块

语义分块在主题移动的地方设置边界，而不是固定大小。它比较相邻句子的嵌入，并在相似性下降时开始一个新的块，这为缺乏清晰结构的散文产生了更连贯的块。代价是成本：它在分割文档时嵌入文档。

`SemanticChunker` 位于未维护的 [⟦T11⟧](https://pypi.org/project/langchain-experimental/) 包中。对于新工作，更喜欢递归或结构感知的分割。仅当固定大小的分割跨越思想并且结构感知的分割不适用时才考虑语义分块，并将结果视为实验性的。

## 检索比嵌入更多的上下文小块精确匹配，但它们可能会遗漏模型需要回答的周围上下文。小到大模式将两个问题分开：嵌入和索引小块以进行精确匹配，然后将包含匹配块的较大段落返回给模型。

要实现它，请在每个小块的元数据中存储对父段落的引用。检索后，查找并返回父段落而不是匹配的块。

`ParentDocumentRetriever` 帮助器实现了此模式并位于 [⟦T13⟧](https://pypi.org/project/langchain-classic/) 包中。

## 将元数据附加到块

每个块上的元数据可以在检索时进行过滤和引用。携带源、部分和块的位置，以便您可以确定搜索范围和属性答案。

设置 `add_start_index=True` 记录每个块在源文档中的开始位置。来自源 `Document` 的元数据会延续到其块中，并且您可以添加自定义字段：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    add_start_index=True,  # record each chunk's start offset in metadata
)
chunks = splitter.split_documents(docs)
# chunks[0].metadata includes "start_index" plus any metadata from the source document.
```

结构感知拆分器添加自己的元数据，例如包含每个块的 Markdown 标头。使用这些字段来[filter retrieval](/oss/python/integrations/vectorstores#metadata-filtering)。

## 选择策略

将策略与您的文档类型相匹配，然后通过测量调整大小和重叠。|文件类型|战略|
| - | - |
|结构不清晰的散文 | [Recursive character splitting](#start-with-recursive-character-splitting)，或[semantic chunking](#chunk-by-meaning) |
| Markdown 或 HTML | [Split on document structure](#split-on-document-structure) 并将标头保留为元数据 |
|源代码 | [Language-aware splitting](#split-on-document-structure) |
|需要周围环境的匹配 | [Retrieve more context than you embed](#retrieve-more-context-than-you-embed) |
|严格的模型代币限制或成本约束 | [Size chunks by tokens](#size-chunks-by-tokens) |

## 评估你的分块

从抽象意义上讲，没有任何分块策略是正确的。正确的方法是为您的查询检索正确的上下文。改变块大小、重叠和策略，重新索引，然后比较固定数据集上的检索和答案质量。请参阅 [Evaluate a RAG application](/langsmith/evaluate-rag-tutorial) 设置数据集和评估器。

## 另请参阅

* [Retrieval](/oss/python/deepagents/retrieval)：概念和RAG架构
* [Improve retrieval quality](/oss/python/langchain/retrieval-optimization)：元数据过滤器、混合搜索、MMR 和重新排名
* [RAG with Deep Agents](/oss/python/deepagents/rag)：加载、索引、查询文档
* [Text splitter integrations](/oss/python/integrations/splitters)：分离器的完整目录
* [Evaluate a RAG application](/langsmith/evaluate-rag-tutorial)：衡量检索和答案质量

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/chunking.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。