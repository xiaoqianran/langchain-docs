<!-- langchain-docs: Retriever integrations | https://docs.langchain.com/oss/javascript/integrations/retrievers/index -->

# Retriever integrations

Integrate with retrievers using LangChain JavaScript.

A [retriever](/oss/javascript/deepagents/retrieval) is an interface that returns documents given an unstructured query.
It is more general than a vector store.
A retriever does not need to be able to store documents, only to return (or retrieve) them.

Retrievers accept a string query as input and return a list of `Document` objects.

For specifics on how to use retrievers, see the [relevant how-to guides here](/oss/javascript/deepagents/retrieval).

Note that all [vector stores](/oss/javascript/integrations/vectorstores) can be [cast to retrievers](/oss/javascript/deepagents/retrieval).
Refer to the vector store [integration docs](/oss/javascript/integrations/vectorstores/) for available vector store retrievers.

## All retrievers

| Retriever | Self-host | Cloud offering | Package | Downloads |
| :- | :- | :- | :- | :- |
| [`AWSKendraRetriever`](/oss/javascript/integrations/retrievers/kendra-retriever) | | | [`@langchain/aws`](https://www.npmjs.com/package/@langchain/aws) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/aws?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/aws) |
| [`Knowledge bases for Amazon Bedrock`](/oss/javascript/integrations/retrievers/bedrock-knowledge-bases) | | | [`@langchain/aws`](https://www.npmjs.com/package/@langchain/aws) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/aws?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/aws) |
| [`ExaRetriever`](/oss/javascript/integrations/retrievers/exa) | | | [`@langchain/exa`](https://www.npmjs.com/package/@langchain/exa) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/exa?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/exa) |
| [`PerplexitySearchRetriever`](/oss/javascript/integrations/retrievers/perplexity_search) | | | [`@langchain/perplexity`](https://www.npmjs.com/package/@langchain/perplexity) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/perplexity?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/perplexity) |
| [`AlchemystRetriever`](https://getalchemystai.com/docs) | | | [`@alchemystai/langchain-js`](https://www.npmjs.com/package/@alchemystai/langchain-js) | [  ![Downloads per month](https://img.shields.io/npm/dm/@alchemystai/langchain-js?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@alchemystai/langchain-js) |
| [`RecallRetriever`](https://recallmem.dev/guides/langchain) | ✅ | ✅ | [`@recall-memory/langchain`](https://www.npmjs.com/package/@recall-memory/langchain) | [  ![Downloads per month](https://img.shields.io/npm/dm/@recall-memory/langchain?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@recall-memory/langchain) |
| [`FoxNoseRetriever`](https://github.com/FoxNoseTech/langchain-foxnose-js#readme) | ❌ | ✅ | [`@foxnose/langchain`](https://www.npmjs.com/package/@foxnose/langchain) | [  ![Downloads per month](https://img.shields.io/npm/dm/@foxnose/langchain?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@foxnose/langchain) |
| [`SourceyRetriever`](/oss/javascript/integrations/retrievers/sourcey) | | | [`langchain-sourcey`](https://www.npmjs.com/package/langchain-sourcey) | [  ![Downloads per month](https://img.shields.io/npm/dm/langchain-sourcey?style=flat-square\&label=%20&)](https://www.npmjs.com/package/langchain-sourcey) |
| [`Hyde`](/oss/javascript/integrations/retrievers/hyde) | | | | N/A |
| [`Self Querying with SAP HANA Cloud Vector Engine`](/oss/javascript/integrations/retrievers/self_query/hanavector_self_query) | | | | N/A |
| [`Time-weighted`](/oss/javascript/integrations/retrievers/time-weighted-retriever) | | | | N/A |

> [!NOTE]
>
> If you'd like to contribute an integration, see [Contributing integrations](/oss/javascript/contributing#add-a-new-integration).

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/retrievers/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).