<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Checkpointer integrations | https://docs.langchain.com/oss/python/integrations/checkpointers/index -->

# 检查点集成

与检查点后端集成以实现 LangGraph 持久性。

检查点在LangGraph中启用[persistence](/oss/python/langgraph/persistence)，允许代理在交互中保存和恢复状态。

要为自定义存储后端实现您自己的检查点，请参阅[Build a custom checkpointer](/oss/python/langgraph/checkpointers#build-a-custom-checkpointer)。

集成组件
箭头显示了典型的检索流程。突出显示的组件是本页所涵盖的组件。

### 典型检索流程

### 代理能力

### 执行和状态

|整合|下载 |
| :-| :-|
| [⟦T0⟧](https://reference.langchain.com/python/langgraph.checkpoint/memory/InMemorySaver) | [  ⟦T21⟧](https://pypi.org/project/langgraph-checkpoint/) |
| [⟦T1⟧](https://reference.langchain.com/python/langgraph.checkpoint.postgres/PostgresSaver) | [  ⟦T22⟧](https://pypi.org/project/langgraph-checkpoint-postgres/) |
| [⟦T2⟧](https://reference.langchain.com/python/langgraph.checkpoint.sqlite/SqliteSaver) | [  ⟦T23⟧](https://pypi.org/project/langgraph-checkpoint-sqlite/) |
| [⟦T3⟧](https://github.com/redis-developer/langgraph-redis) | [  ⟦T24⟧](https://pypi.org/project/langgraph-checkpoint-redis/) |
| [⟦T4⟧](https://github.com/langchain-ai/langchain-aws/tree/main/libs/langgraph-checkpoint-aws) | [  ⟦T25⟧](https://pypi.org/project/langgraph-checkpoint-aws/) |
| [⟦T5⟧](https://github.com/langchain-ai/langchain-aws/tree/main/libs/langgraph-checkpoint-aws) | [  ⟦T26⟧](https://pypi.org/project/langgraph-checkpoint-aws/) |
| [⟦T6⟧](https://github.com/langchain-ai/langchain-aws/tree/main/libs/langgraph-checkpoint-aws) | [  ⟦T27⟧](https://pypi.org/project/langgraph-checkpoint-aws/) |
| [⟦T7⟧](/oss/python/integrations/memory/mongodb-short-term-memory) | [  ⟦T28⟧](https://pypi.org/project/langgraph-checkpoint-mongodb/) |
| [⟦T8⟧](https://skamalj.github.io/agentstate-reducer/langgraph/firestore/) | [  ⟦T29⟧](https://pypi.org/project/langgraph-checkpoint-firestore/) |
| [⟦T9⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-cosmosdb) | [  ⟦T30⟧](https://pypi.org/project/langchain-azure-cosmosdb/) |
| [⟦T10⟧](https://skamalj.github.io/agentstate-reducer/langgraph/cosmosdb/) | [  ⟦T31⟧](https://pypi.org/project/langgraph-checkpoint-cosmosdb/) |
| [⟦T11⟧](https://skamalj.github.io/agentstate-reducer/langgraph/dynamodb/) | [  ⟦T32⟧](https://pypi.org/project/langgraph-dynamodb-checkpoint/) |
| [⟦T12⟧](/oss/python/integrations/providers/cockroachdb#langgraph-checkpointer) | [  ⟦T33⟧](https://pypi.org/project/langchain-cockroachdb/) |
| [⟦T13⟧](https://pypi.org/project/langgraph-checkpoint-gridgain/) | [  ⟦T34⟧](https://pypi.org/project/langgraph-checkpoint-gridgain/) |
| [⟦T14⟧](/oss/python/integrations/providers/aerospike#langgraph-checkpointer) | [  ⟦T35⟧](https://pypi.org/project/langgraph-checkpoint-aerospike/) |
| [⟦T15⟧](https://github.com/Tghez/langgraph-checkpoint-supabase) | [  ⟦T36⟧](https://pypi.org/project/langgraph-checkpoint-supabase/) |
| [⟦T16⟧](https://www.singlestore.com/docs/) | [  ⟦T37⟧](https://pypi.org/project/langgraph-singlestore/) |
| [⟦T17⟧](https://www.tigrisdata.com/docs/) | [  ⟦T38⟧](https://pypi.org/project/langgraph-checkpoint-tigris/) |
| [⟦T18⟧](https://dancenitra.github.io/inspeximus/) | [  ⟦T39⟧](https://pypi.org/project/langgraph-checkpoint-inspeximus/) |
| [⟦T19⟧](https://docs.scylladb.com) | [  ⟦T40⟧](https://pypi.org/project/langgraph-checkpoint-scylladb/) |
| [⟦T20⟧](https://typedb.com/docs) | [  ⟦T41⟧](https://pypi.org/project/langgraph-checkpoint-typedb/) |

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/checkpointers/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。