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

<div>
  | Retriever                                                                                                                     | Self-host | Cloud offering | Package                                                                                | Downloads                                                                                                              |
  | :---------------------------------------------------------------------------------------------------------------------------- | :-------- | :------------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
  | [`AWSKendraRetriever`](/oss/javascript/integrations/retrievers/kendra-retriever)                                              | <span />  | <span />       | [`@langchain/aws`](https://www.npmjs.com/package/@langchain/aws)                       | <span><a href="https://www.npmjs.com/package/@langchain/aws">  <img alt="Downloads per month" /></a></span>            |
  | [`Knowledge bases for Amazon Bedrock`](/oss/javascript/integrations/retrievers/bedrock-knowledge-bases)                       | <span />  | <span />       | [`@langchain/aws`](https://www.npmjs.com/package/@langchain/aws)                       | <span><a href="https://www.npmjs.com/package/@langchain/aws">  <img alt="Downloads per month" /></a></span>            |
  | [`ExaRetriever`](/oss/javascript/integrations/retrievers/exa)                                                                 | <span />  | <span />       | [`@langchain/exa`](https://www.npmjs.com/package/@langchain/exa)                       | <span><a href="https://www.npmjs.com/package/@langchain/exa">  <img alt="Downloads per month" /></a></span>            |
  | [`PerplexitySearchRetriever`](/oss/javascript/integrations/retrievers/perplexity_search)                                      | <span />  | <span />       | [`@langchain/perplexity`](https://www.npmjs.com/package/@langchain/perplexity)         | <span><a href="https://www.npmjs.com/package/@langchain/perplexity">  <img alt="Downloads per month" /></a></span>     |
  | [`AlchemystRetriever`](https://getalchemystai.com/docs)                                                                       | <span />  | <span />       | [`@alchemystai/langchain-js`](https://www.npmjs.com/package/@alchemystai/langchain-js) | <span><a href="https://www.npmjs.com/package/@alchemystai/langchain-js">  <img alt="Downloads per month" /></a></span> |
  | [`SourceyRetriever`](/oss/javascript/integrations/retrievers/sourcey)                                                         | <span />  | <span />       | [`langchain-sourcey`](https://www.npmjs.com/package/langchain-sourcey)                 | <span><a href="https://www.npmjs.com/package/langchain-sourcey">  <img alt="Downloads per month" /></a></span>         |
  | [`Hyde`](/oss/javascript/integrations/retrievers/hyde)                                                                        | <span />  | <span />       |                                                                                        | <span>N/A</span>                                                                                                       |
  | [`Self Querying with SAP HANA Cloud Vector Engine`](/oss/javascript/integrations/retrievers/self_query/hanavector_self_query) | <span />  | <span />       |                                                                                        | <span>N/A</span>                                                                                                       |
  | [`Time-weighted`](/oss/javascript/integrations/retrievers/time-weighted-retriever)                                            | <span />  | <span />       |                                                                                        | <span>N/A</span>                                                                                                       |
</div>

<Info>
  If you'd like to contribute an integration, see [Contributing integrations](/oss/javascript/contributing#add-a-new-integration).
</Info>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/retrievers/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>