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

## 所有猎犬<div>
  |猎犬 |自托管 |云产品|套餐 |下载 |
  | :---------------------------------------------------------------------------------------------------------------------------- | :-------- | :------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
  | [⟦T1⟧](/oss/javascript/integrations/retrievers/kendra-retriever) | <span /> | <span /> | [⟦T2⟧](https://www.npmjs.com/package/@langchain/aws) | <span><a href="https://www.npmjs.com/package/@langchain/aws"><img alt="Downloads per month" /></a></span> |
  | [⟦T3⟧](/oss/javascript/integrations/retrievers/bedrock-knowledge-bases) | <span /> | <span /> | [⟦T4⟧](https://www.npmjs.com/package/@langchain/aws) | <span><a href="https://www.npmjs.com/package/@langchain/aws"><img alt="Downloads per month" /></a></span> |
  | [⟦T5⟧](/oss/javascript/integrations/retrievers/exa) | <span /> | <span /> | [⟦T6⟧](https://www.npmjs.com/package/@langchain/exa) | <span><a href="https://www.npmjs.com/package/@langchain/exa"><img alt="Downloads per month" /></a></span> || [⟦T7⟧](/oss/javascript/integrations/retrievers/perplexity_search) | <span /> | <span /> | [⟦T8⟧](https://www.npmjs.com/package/@langchain/perplexity) | <span><a href="https://www.npmjs.com/package/@langchain/perplexity"><img alt="Downloads per month" /></a></span> |
  | [⟦T9⟧](https://getalchemystai.com/docs) | <span /> | <span /> | [⟦T10⟧](https://www.npmjs.com/package/@alchemystai/langchain-js) | <span><a href="https://www.npmjs.com/package/@alchemystai/langchain-js"><img alt="Downloads per month" /></a></span> |
  | [⟦T11⟧](/oss/javascript/integrations/retrievers/sourcey) | <span /> | <span /> | [⟦T12⟧](https://www.npmjs.com/package/langchain-sourcey) | <span><a href="https://www.npmjs.com/package/langchain-sourcey"><img alt="Downloads per month" /></a></span> |
  | [⟦T13⟧](/oss/javascript/integrations/retrievers/hyde) | <span /> | <span /> |                                                                                        | <span>N/A</span> |
  | [⟦T14⟧](/oss/javascript/integrations/retrievers/self_query/hanavector_self_query) | <span /> | <span /> |                                                                                        | <span>N/A</span> || [⟦T15⟧](/oss/javascript/integrations/retrievers/time-weighted-retriever) | <span /> | <span /> |                                                                                        | <span>N/A</span> |
</div>

<Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/javascript/contributing#add-a-new-integration)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/retrievers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>