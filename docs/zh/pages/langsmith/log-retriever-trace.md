<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log retriever traces | https://docs.langchain.com/langsmith/log-retriever-trace -->

# 记录检索器跟踪

许多法学硕士应用程序从向量数据库、知识图或其他索引中检索文档，作为检索增强生成 (RAG) 管道的一部分。 LangSmith 为检索器步骤提供专用渲染，这使得检查检索到的文档和诊断检索问题变得更加容易。

<Note>
这些步骤是**可选的**。如果您跳过它们，您的检索器数据仍将被记录，但LangSmith不会以检索器特定的格式呈现它。
</Note>

要启用特定于检索器的渲染，请完成以下两个步骤。

## 将 `run_type` 设置为检索器

将 [⟦T4⟧](/langsmith/run-data-format#run-types) 传递给 [traceable](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 装饰器 (Python) 或 `traceable` 包装器 (TypeScript)。这告诉LangSmith将该步骤视为检索运行并在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-log-retriever-trace)中应用特定于检索器的渲染：

```python
from langsmith import traceable

@traceable(run_type="retriever")
def retrieve_docs(query):
    ...
```

如果您使用 [RunTree API](/langsmith/annotate-code#use-the-runtree-api) 而不是 `traceable`，请在创建 `RunTree` 对象时传递 `run_type="retriever"`。

## 以预期格式返回文档

从检索器函数返回字典 (Python) 或对象 (TypeScript) 列表。列表中的每个项目代表一个检索到的文档，并且必须包含以下字段：|领域|类型 |描述 |
|---|---|---|
| `page_content` |字符串|检索到的文档的文本内容。 |
| `type` |字符串|必须始终是`"Document"`。 |
| `metadata` |对象|包含有关文档的元数据的键值对，例如源 URL、块 ID 或分数。此元数据与跟踪中的文档一起显示。 |

以下示例显示了应用了这两个要求的完整检索器实现：

<CodeGroup>

```python Python wrap
from langsmith import traceable

def _convert_docs(results):
    return [
        {
            "page_content": r,
            "type": "Document",
            "metadata": {"foo": "bar"}
        }
        for r in results
    ]

@traceable(run_type="retriever")
def retrieve_docs(query):
    # Returning hardcoded placeholder documents.
    # In production, replace with a real vector database or document index.
    contents = ["Document contents 1", "Document contents 2", "Document contents 3"]
    return _convert_docs(contents)

retrieve_docs("User query")
```

```typescript TypeScript wrap
import { traceable } from "langsmith/traceable";

interface Document {
    page_content: string;
    type: string;
    metadata: { foo: string };
}

function convertDocs(results: string[]): Document[] {
    return results.map((r) => ({
        page_content: r,
        type: "Document",
        metadata: { foo: "bar" }
    }));
}

const retrieveDocs = traceable((query: string): Document[] => {
    // Returning hardcoded placeholder documents.
    // In production, replace with a real vector database or document index.
    const contents = ["Document contents 1", "Document contents 2", "Document contents 3"];
    return convertDocs(contents);
}, {
    name: "retrieveDocs",
    run_type: "retriever"
});

await retrieveDocs("User query");
```

</CodeGroup>

在 LangSmith UI 中，您将找到每个检索到的文档及其内容和元数据。

## 相关

- [Annotate code for tracing](/langsmith/annotate-code)：所有跟踪方法的概述，包括`traceable`、`RunTree`和REST API。
- [Log LLM calls](/langsmith/log-llm-trace)：LLM 步骤的类似自定义日志记录要求。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-retriever-trace.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>