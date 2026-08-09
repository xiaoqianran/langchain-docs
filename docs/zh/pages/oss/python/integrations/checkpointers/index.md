<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Checkpointer integrations | https://docs.langchain.com/oss/python/integrations/checkpointers/index -->

# 检查点集成

与检查点后端集成以实现 LangGraph 持久性。

检查点在 LangGraph 中启用[persistence](/oss/python/langgraph/persistence)，允许代理在交互中保存和恢复状态。

要为自定义存储后端实现您自己的检查点，请参阅[Build a custom checkpointer](/oss/python/langgraph/checkpointers#build-a-custom-checkpointer)。

|后端|套餐 |来源 |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [In-memory](https://reference.langchain.com/python/langgraph.checkpoint/memory/InMemorySaver) | [⟦T0⟧](https://pypi.org/project/langgraph-checkpoint/) | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint) |
| [SQLite](https://reference.langchain.com/python/langgraph.checkpoint.sqlite/SqliteSaver) | [⟦T1⟧](https://pypi.org/project/langgraph-checkpoint-sqlite/) | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-sqlite) |
| [PostgreSQL](https://reference.langchain.com/python/langgraph.checkpoint.postgres/PostgresSaver) | [⟦T2⟧](https://pypi.org/project/langgraph-checkpoint-postgres/) | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres) || AWS（DynamoDB、Bedrock、Valkey）| [⟦T3⟧](https://pypi.org/project/langgraph-checkpoint-aws/) | [langchain-ai/langchain-aws](https://github.com/langchain-ai/langchain-aws/tree/main/libs/langgraph-checkpoint-aws) |
| MongoDB | [⟦T4⟧](https://pypi.org/project/langgraph-checkpoint-mongodb/) | [langchain-ai/langchain-mongodb](https://github.com/langchain-ai/langchain-mongodb/tree/main/libs/langgraph-checkpoint-mongodb) |
| Azure Cosmos DB NoSQL | Azure Cosmos DB [⟦T5⟧](https://pypi.org/project/langchain-azure-cosmosdb/) | [langchain-ai/langchain-azure](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-cosmosdb) |
| Redis | [⟦T6⟧](https://pypi.org/project/langgraph-checkpoint-redis/) | [redis-developer/langgraph-redis](https://github.com/redis-developer/langgraph-redis) |
| [Cockroach DB](/oss/python/integrations/providers/cockroachdb#langgraph-checkpointer) | [⟦T7⟧](https://pypi.org/project/langchain-cockroachdb/) | [cockroachdb/langchain-cockroachdb](https://github.com/cockroachdb/langchain-cockroachdb) |
| [Aerospike](/oss/python/integrations/providers/aerospike#langgraph-checkpointer) | [⟦T8⟧](https://pypi.org/project/langgraph-checkpoint-aerospike/) | [aerospike-community/aerospike-langgraph](https://github.com/aerospike-community/aerospike-langgraph) |
| [ScyllaDB](https://docs.scylladb.com) | [⟦T9⟧](https://pypi.org/project/langgraph-checkpoint-scylladb/) | [scylladb/langchain-scylladb](https://github.com/scylladb/langchain-scylladb/tree/main/libs/langgraph-checkpoint-scylladb) |
| [Tigris](https://www.tigrisdata.com/docs/) | [⟦T10⟧](https://pypi.org/project/langgraph-checkpoint-tigris/) | [tigrisdata/tigris-langgraph](https://github.com/tigrisdata/tigris-langgraph/tree/main/libs/checkpoint-tigris) |
| [TypeDB](https://typedb.com/docs) | [⟦T11⟧](https://pypi.org/project/langgraph-checkpoint-typedb/) | [typedb/langgraph-checkpoint-typedb](https://github.com/typedb/langgraph-checkpoint-typedb) || [Inspeximus](https://dancenitra.github.io/inspeximus/) | [⟦T12⟧](https://pypi.org/project/langgraph-checkpoint-inspeximus/) | [DanceNitra/inspeximus](https://github.com/DanceNitra/inspeximus) |
|苏帕巴斯| [⟦T13⟧](https://pypi.org/project/langgraph-checkpoint-supabase/) | [Tghez/langgraph-checkpoint-supabase](https://github.com/Tghez/langgraph-checkpoint-supabase) |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/checkpointers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>