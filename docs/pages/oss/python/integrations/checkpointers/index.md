<!-- langchain-docs: Checkpointer integrations | https://docs.langchain.com/oss/python/integrations/checkpointers/index -->

# Checkpointer integrations

Integrate with checkpointer backends for LangGraph persistence.

Checkpointers enable [persistence](/oss/python/langgraph/persistence) in LangGraph, allowing agents to save and resume state across interactions.

To implement your own checkpointer for a custom storage backend, see [Build a custom checkpointer](/oss/python/langgraph/checkpointers#build-a-custom-checkpointer).

Integration components
Arrows show a typical retrieval flow. The highlighted component is the one this page covers.

### Typical retrieval flow

### Agent capabilities

### Execution and state

| Integration | Downloads |
| :- | :- |
| [`InMemorySaver`](https://reference.langchain.com/python/langgraph.checkpoint/memory/InMemorySaver) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint/month)](https://pypi.org/project/langgraph-checkpoint/) |
| [`PostgresSaver`](https://reference.langchain.com/python/langgraph.checkpoint.postgres/PostgresSaver) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-postgres/month)](https://pypi.org/project/langgraph-checkpoint-postgres/) |
| [`SqliteSaver`](https://reference.langchain.com/python/langgraph.checkpoint.sqlite/SqliteSaver) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-sqlite/month)](https://pypi.org/project/langgraph-checkpoint-sqlite/) |
| [`RedisSaver`](https://github.com/redis-developer/langgraph-redis) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-redis/month)](https://pypi.org/project/langgraph-checkpoint-redis/) |
| [`BedrockSessionSaver`](https://github.com/langchain-ai/langchain-aws/tree/main/libs/langgraph-checkpoint-aws) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-aws/month)](https://pypi.org/project/langgraph-checkpoint-aws/) |
| [`DynamoDBSaver`](https://github.com/langchain-ai/langchain-aws/tree/main/libs/langgraph-checkpoint-aws) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-aws/month)](https://pypi.org/project/langgraph-checkpoint-aws/) |
| [`ValkeySaver`](https://github.com/langchain-ai/langchain-aws/tree/main/libs/langgraph-checkpoint-aws) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-aws/month)](https://pypi.org/project/langgraph-checkpoint-aws/) |
| [`MongoDBSaver`](/oss/python/integrations/memory/mongodb-short-term-memory) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-mongodb/month)](https://pypi.org/project/langgraph-checkpoint-mongodb/) |
| [`FirestoreSaver (agentstate)`](https://skamalj.github.io/agentstate-reducer/langgraph/firestore/) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-firestore/month)](https://pypi.org/project/langgraph-checkpoint-firestore/) |
| [`CosmosDBSaverSync`](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-cosmosdb) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-azure-cosmosdb/month)](https://pypi.org/project/langchain-azure-cosmosdb/) |
| [`CosmosDBSaver (agentstate)`](https://skamalj.github.io/agentstate-reducer/langgraph/cosmosdb/) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-cosmosdb/month)](https://pypi.org/project/langgraph-checkpoint-cosmosdb/) |
| [`DynamoDBSaver (agentstate)`](https://skamalj.github.io/agentstate-reducer/langgraph/dynamodb/) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-dynamodb-checkpoint/month)](https://pypi.org/project/langgraph-dynamodb-checkpoint/) |
| [`CockroachDBSaver`](/oss/python/integrations/providers/cockroachdb#langgraph-checkpointer) | [  ![Downloads per month](https://static.pepy.tech/badge/langchain-cockroachdb/month)](https://pypi.org/project/langchain-cockroachdb/) |
| [`GridGainCheckpointSaver`](https://pypi.org/project/langgraph-checkpoint-gridgain/) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-gridgain/month)](https://pypi.org/project/langgraph-checkpoint-gridgain/) |
| [`AerospikeSaver`](/oss/python/integrations/providers/aerospike#langgraph-checkpointer) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-aerospike/month)](https://pypi.org/project/langgraph-checkpoint-aerospike/) |
| [`SupabaseSaver`](https://github.com/Tghez/langgraph-checkpoint-supabase) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-supabase/month)](https://pypi.org/project/langgraph-checkpoint-supabase/) |
| [`SingleStoreSaver`](https://www.singlestore.com/docs/) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-singlestore/month)](https://pypi.org/project/langgraph-singlestore/) |
| [`TigrisSaver`](https://www.tigrisdata.com/docs/) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-tigris/month)](https://pypi.org/project/langgraph-checkpoint-tigris/) |
| [`InspeximusSaver`](https://dancenitra.github.io/inspeximus/) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-inspeximus/month)](https://pypi.org/project/langgraph-checkpoint-inspeximus/) |
| [`ScyllaDBSaver`](https://docs.scylladb.com) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-scylladb/month)](https://pypi.org/project/langgraph-checkpoint-scylladb/) |
| [`TypeDBSaver`](https://typedb.com/docs) | [  ![Downloads per month](https://static.pepy.tech/badge/langgraph-checkpoint-typedb/month)](https://pypi.org/project/langgraph-checkpoint-typedb/) |

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/checkpointers/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).