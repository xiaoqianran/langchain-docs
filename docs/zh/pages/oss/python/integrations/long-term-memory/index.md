<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Store integrations | https://docs.langchain.com/oss/python/integrations/long-term-memory/index -->

# 商店集成

与商店后端集成以实现 LangGraph 长期记忆。

存储在LangGraph中启用[long-term memory](/oss/python/langgraph/stores)，允许代理跨线程持久保存和检索信息。

要为自定义存储后端实现您自己的存储，请参阅[Build a custom store](/oss/python/langgraph/stores#build-a-custom-store)。

|后端 |套餐 |来源 |
| - | - | - |
| [In-memory](https://reference.langchain.com/python/langgraph.store/memory/InMemoryStore) | [⟦T0⟧](https://pypi.org/project/langgraph-checkpoint/) | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint) |
| [PostgreSQL](https://reference.langchain.com/python/langgraph.store.postgres/PostgresStore) | [⟦T1⟧](https://pypi.org/project/langgraph-checkpoint-postgres/) | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres) |
| Redis | [⟦T2⟧](https://pypi.org/project/langgraph-checkpoint-redis/) | [redis-developer/langgraph-redis](https://github.com/redis-developer/langgraph-redis) |
| [MongoDB](/oss/python/integrations/memory/mongodb-long-term-memory) | [⟦T3⟧](https://pypi.org/project/langgraph-store-mongodb/) | [langchain-ai/langchain-mongodb](https://github.com/langchain-ai/langchain-mongodb/tree/main/libs/langgraph-store-mongodb) |
| Upstash Redis | [⟦T4⟧](https://pypi.org/project/langgraph-store-upstash/) | [Tghez/langgraph-store-upstash](https://github.com/Tghez/langgraph-store-upstash) |
|奥姆 | [⟦T5⟧](https://pypi.org/project/omem-infrastructure/) | [OMEM docs](https://infrastructure.omem-cloud.com/docs) |
| [SingleStore](https://www.singlestore.com/docs/) | [⟦T6⟧](https://pypi.org/project/langgraph-singlestore/) | [singlestore-labs/langchain-singlestore](https://github.com/singlestore-labs/langchain-singlestore) |
| [Amazon DynamoDB (agentstate)](https://skamalj.github.io/agentstate-reducer/langgraph/stores/) | [⟦T7⟧](https://pypi.org/project/langgraph-store-dynamodb/) | [skamalj/langgraph-store](https://github.com/skamalj/langgraph-store/tree/main/providers/dynamodb) |
| [PostgreSQL / pgvector (agentstate)](https://skamalj.github.io/agentstate-reducer/langgraph/stores/) | [⟦T8⟧](https://pypi.org/project/langgraph-store-postgres/) | [skamalj/langgraph-store](https://github.com/skamalj/langgraph-store/tree/main/providers/postgres) |
| [Azure Cosmos DB NoSQL (agentstate)](https://skamalj.github.io/agentstate-reducer/langgraph/stores/) | [⟦T9⟧](https://pypi.org/project/langgraph-store-cosmosdb/) | [skamalj/langgraph-store](https://github.com/skamalj/langgraph-store/tree/main/providers/cosmosdb) |
| [Google Firestore (agentstate)](https://skamalj.github.io/agentstate-reducer/langgraph/stores/) | [⟦T10⟧](https://pypi.org/project/langgraph-store-firestore/) | [skamalj/langgraph-store](https://github.com/skamalj/langgraph-store/tree/main/providers/firestore) |

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/long-term-memory/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>