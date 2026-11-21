<!-- langchain-docs: Checkpointer integrations | https://docs.langchain.com/oss/javascript/integrations/checkpointers/index -->

# Checkpointer integrations

Integrate with checkpointer backends for LangGraph persistence using LangChain JavaScript.

Checkpointers enable [persistence](/oss/javascript/langgraph/persistence) in LangGraph, allowing agents to save and resume state across interactions.

To implement your own checkpointer for a custom storage backend, see [Build a custom checkpointer](/oss/javascript/langgraph/checkpointers#build-a-custom-checkpointer).

| Integration | Downloads |
| :- | :- |
| [`MemorySaver`](https://reference.langchain.com/javascript/langchain-langgraph/index/MemorySaver) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/langgraph-checkpoint?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/langgraph-checkpoint) |
| [`PostgresSaver`](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-postgres/index/PostgresSaver) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/langgraph-checkpoint-postgres?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-postgres) |
| [`MongoDBSaver`](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-mongodb/MongoDBSaver) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/langgraph-checkpoint-mongodb?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-mongodb) |
| [`SqliteSaver`](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-sqlite/SqliteSaver) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/langgraph-checkpoint-sqlite?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-sqlite) |
| [`RedisSaver`](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis) | [  ![Downloads per month](https://img.shields.io/npm/dm/@langchain/langgraph-checkpoint-redis?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis) |
| [`BetterDBSaver`](https://www.betterdb.com/ai) | [  ![Downloads per month](https://img.shields.io/npm/dm/@betterdb/agent-cache?style=flat-square\&label=%20&)](https://www.npmjs.com/package/@betterdb/agent-cache) |

For usage details, see [Checkpointers](/oss/javascript/langgraph/checkpointers#checkpointer-libraries).

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/checkpointers/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).