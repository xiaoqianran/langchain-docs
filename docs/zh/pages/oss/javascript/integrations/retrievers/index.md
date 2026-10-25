<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Retriever integrations | https://docs.langchain.com/oss/javascript/integrations/retrievers/index -->

# 检索器集成

使用 LangChain JavaScript 与检索器集成。

[retriever](/oss/javascript/deepagents/retrieval) 是一个根据非结构化查询返回文档的接口。
它比矢量存储更通用。
检索器不需要能够存储文档，只需返回（或检索）它们即可。

检索器接受字符串查询作为输入并返回 `Document` 对象列表。

有关如何使用检索器的具体信息，请参阅[relevant how-to guides here](/oss/javascript/deepagents/retrieval)。

请注意，所有[vector stores](/oss/javascript/integrations/vectorstores)都可以是[cast to retrievers](/oss/javascript/deepagents/retrieval)。
请参阅向量存储 [integration docs](/oss/javascript/integrations/vectorstores/) 了解可用的向量存储检索器。

## 所有猎犬

|猎犬 |自托管 |云产品|套餐 |下载 |
| :-| :-| :-| :-| :-|
| [⟦T1⟧](/oss/javascript/integrations/retrievers/kendra-retriever) | | | [⟦T2⟧](https://www.npmjs.com/package/@langchain/aws) | [  ⟦T20⟧](https://www.npmjs.com/package/@langchain/aws) |
| [⟦T3⟧](/oss/javascript/integrations/retrievers/bedrock-knowledge-bases) | | | [⟦T4⟧](https://www.npmjs.com/package/@langchain/aws) | [  ⟦T21⟧](https://www.npmjs.com/package/@langchain/aws) |
| [⟦T5⟧](/oss/javascript/integrations/retrievers/exa) | | | [⟦T6⟧](https://www.npmjs.com/package/@langchain/exa) | [  ⟦T22⟧](https://www.npmjs.com/package/@langchain/exa) |
| [⟦T7⟧](/oss/javascript/integrations/retrievers/perplexity_search) | | | [⟦T8⟧](https://www.npmjs.com/package/@langchain/perplexity) | [  ⟦T23⟧](https://www.npmjs.com/package/@langchain/perplexity) |
| [⟦T9⟧](https://getalchemystai.com/docs) | | | [⟦T10⟧](https://www.npmjs.com/package/@alchemystai/langchain-js) | [  ⟦T24⟧](https://www.npmjs.com/package/@alchemystai/langchain-js) |
| [⟦T11⟧](https://recallmem.dev/guides/langchain) | ✅ | ✅ | [⟦T12⟧](https://www.npmjs.com/package/@recall-memory/langchain) | [  ⟦T25⟧](https://www.npmjs.com/package/@recall-memory/langchain) |
| [⟦T13⟧](https://github.com/FoxNoseTech/langchain-foxnose-js#readme) | ❌ | ✅ | [⟦T14⟧](https://www.npmjs.com/package/@foxnose/langchain) | [  ⟦T26⟧](https://www.npmjs.com/package/@foxnose/langchain) |
| [⟦T15⟧](/oss/javascript/integrations/retrievers/sourcey) | | | [⟦T16⟧](https://www.npmjs.com/package/langchain-sourcey) | [  ⟦T27⟧](https://www.npmjs.com/package/langchain-sourcey) |
| [⟦T17⟧](/oss/javascript/integrations/retrievers/hyde) | | | |不适用 |
| [⟦T18⟧](/oss/javascript/integrations/retrievers/self_query/hanavector_self_query) | | | |不适用 |
| [⟦T19⟧](/oss/javascript/integrations/retrievers/time-weighted-retriever) | | | |不适用 |

> [!注意]
>
> 如果您想贡献集成，请参阅[Contributing integrations](/oss/javascript/contributing#add-a-new-integration)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/retrievers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。