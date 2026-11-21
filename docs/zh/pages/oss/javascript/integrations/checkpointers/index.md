<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Checkpointer integrations | https://docs.langchain.com/oss/javascript/integrations/checkpointers/index -->

# 检查点集成

使用 LangChain JavaScript 与检查点后端集成以实现 LangGraph 持久性。

检查点在LangGraph中启用[persistence](/oss/javascript/langgraph/persistence)，允许代理在交互过程中保存和恢复状态。

要为自定义存储后端实现您自己的检查点，请参阅[Build a custom checkpointer](/oss/javascript/langgraph/checkpointers#build-a-custom-checkpointer)。

|整合|下载 |
| :-| :-|
| [⟦T0⟧](https://reference.langchain.com/javascript/langchain-langgraph/index/MemorySaver) | [  ⟦T6⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint) |
| [⟦T1⟧](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-postgres/index/PostgresSaver) | [  ⟦T7⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-postgres) |
| [⟦T2⟧](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-mongodb/MongoDBSaver) | [  ⟦T8⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-mongodb) |
| [⟦T3⟧](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-sqlite/SqliteSaver) | [  ⟦T9⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-sqlite) |
| [⟦T4⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis) | [  ⟦T10⟧](https://www.npmjs.com/package/@langchain/langgraph-checkpoint-redis) |
| [⟦T5⟧](https://www.betterdb.com/ai) | [  ⟦T11⟧](https://www.npmjs.com/package/@betterdb/agent-cache) |

详细使用方法请参见[Checkpointers](/oss/javascript/langgraph/checkpointers#checkpointer-libraries)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/checkpointers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。