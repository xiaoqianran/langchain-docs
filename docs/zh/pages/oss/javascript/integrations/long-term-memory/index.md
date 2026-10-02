<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Store integrations | https://docs.langchain.com/oss/javascript/integrations/long-term-memory/index -->

# 商店集成

与商店后端集成以实现 LangGraph 长期记忆。

存储在LangGraph中启用[long-term memory](/oss/javascript/langgraph/stores)，允许代理跨线程持久保存和检索信息。

要为自定义存储后端实现您自己的存储，请扩展 [BaseStore](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint/BaseStore) 接口。要在代理服务器上部署自定义存储，请参阅[Add a custom store](/langsmith/custom-store)。

|后端|套餐 |来源 |
| - | - | - |
| [In-memory](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint/InMemoryStore) | [⟦T0⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint) | [langchain-ai/langgraphjs](https://github.com/langchain-ai/langgraphjs/tree/main/libs/checkpoint) |
| [PostgreSQL](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-postgres/store/PostgresStore) | [⟦T1⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-postgres) | [langchain-ai/langgraphjs](https://github.com/langchain-ai/langgraphjs/tree/main/libs/checkpoint-postgres) |
| [Redis](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-redis/store/RedisStore) | [⟦T2⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis) | [langchain-ai/langgraphjs](https://github.com/langchain-ai/langgraphjs/tree/main/libs/checkpoint-redis) |
| [MongoDB](/oss/javascript/integrations/memory/mongodb-long-term-memory) | [⟦T3⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-mongodb) | [langchain-ai/langgraphjs](https://github.com/langchain-ai/langgraphjs/tree/main/libs/checkpoint-mongodb) |

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/long-term-memory/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>