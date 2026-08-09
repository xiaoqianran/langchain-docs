<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Store integrations | https://docs.langchain.com/oss/python/integrations/long-term-memory/index -->

# 商店集成

与 LangGraph 长期记忆的存储后端集成。

存储在 LangGraph 中启用[long-term memory](/oss/python/langgraph/stores)，允许代理跨线程持久保存和检索信息。

要为自定义存储后端实现您自己的存储，请参阅[Build a custom store](/oss/python/langgraph/stores#build-a-custom-store)。

|后端 |套餐 |来源 |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| [In-memory](https://reference.langchain.com/python/langgraph.store/memory/InMemoryStore) | [⟦T0⟧](https://pypi.org/project/langgraph-checkpoint/) | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint) |
| [PostgreSQL](https://reference.langchain.com/python/langgraph.store.postgres/PostgresStore) | [⟦T1⟧](https://pypi.org/project/langgraph-checkpoint-postgres/) | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres) |
| Redis | [⟦T2⟧](https://pypi.org/project/langgraph-checkpoint-redis/) | [redis-developer/langgraph-redis](https://github.com/redis-developer/langgraph-redis) || MongoDB | [⟦T3⟧](https://pypi.org/project/langgraph-store-mongodb/) | [langchain-ai/langchain-mongodb](https://github.com/langchain-ai/langchain-mongodb/tree/main/libs/langgraph-store-mongodb) |
| Upstash Redis | [⟦T4⟧](https://pypi.org/project/langgraph-store-upstash/) | [Tghez/langgraph-store-upstash](https://github.com/Tghez/langgraph-store-upstash) |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/long-term-memory/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>