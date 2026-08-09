<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom workflow | https://docs.langchain.com/oss/python/langchain/multi-agent/custom-workflow -->

# 自定义工作流程

在**自定义工作流程**架构中，您可以使用[LangGraph](/oss/python/langgraph/overview)定义自己的定制执行流程。您可以完全控制图形结构，包括顺序步骤、条件分支、循环和并行执行。

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
graph LR
    A([Input]) --> B{{Conditional}}
    B -->|path_a| C[Deterministic step]
    B -->|path_b| D((Agentic step))
    C --> G([Output])
    D --> G([Output])

    classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
    classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710
    classDef decision fill:#FDF3FF,stroke:#7E65AE,stroke-width:2px,color:#504B5F

    class A,G trigger
    class C,D process
    class B decision
```

## 主要特征

* 完全控制图结构
* 将确定性逻辑与代理行为相结合
* 支持顺序步骤、条件分支、循环和并行执行
* 将其他模式作为节点嵌入到您的工作流程中

## 何时使用

当标准模式（子代理、技能等）不符合您的要求、您需要将确定性逻辑与代理行为混合或者您的用例需要复杂的路由或多阶段处理时，请使用自定义工作流。

工作流程中的每个节点可以是一个简单的函数、一个 LLM 调用或一个完整的 [agent](/oss/python/langchain/agents) 和 [tools](/oss/python/langchain/tools)。您还可以在自定义工作流程中构建其他架构，例如，将多代理系统嵌入为单个节点。

有关自定义工作流程的完整示例，请参阅下面的教程。<Card title="Tutorial: Build a multi-source knowledge base with routing" icon="book" href="/oss/python/langchain/multi-agent/router-knowledge-base">
  [router pattern](/oss/python/langchain/multi-agent/router) 是自定义工作流程的示例。本教程将逐步构建一个并行查询 GitHub、Notion 和 Slack 的路由器，然后综合结果。

  >
</Card>

## 基本实现

核心见解是，您可以直接在任何 LangGraph 节点内调用 LangChain 代理，将自定义工作流程的灵活性与预构建代理的便利性相结合：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langgraph.graph import StateGraph, START, END

agent = create_agent(model="openai:gpt-5.5", tools=[...])

def agent_node(state: State) -> dict:
    """A LangGraph node that invokes a LangChain agent."""
    result = agent.invoke({
        "messages": [{"role": "user", "content": state["query"]}]
    })
    return {"answer": result["messages"][-1].content}

# Build a simple workflow
workflow = (
    StateGraph(State)
    .add_node("agent", agent_node)
    .add_edge(START, "agent")
    .add_edge("agent", END)
    .compile()
)
```

## 示例：RAG 管道

一个常见的用例是将 [retrieval](/oss/python/deepagents/retrieval) 与代理结合起来。此示例构建了一个 WNBA 统计助手，可以从知识库中检索并获取实时新闻。

<Accordion title="Custom RAG workflow">
  该工作流程演示了三种类型的节点：

  * **模型节点**（重写）：使用[structured output](/oss/python/langchain/structured-output)重写用户查询以便更好地检索。
  * **确定性节点**（检索）：执行向量相似性搜索 - 不涉及法学硕士。
  * **代理节点**（代理）：检索上下文的原因，并可以通过工具获取附加信息。

  ```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  graph LR
      A([Query]) --> B{{Rewrite}}
      B --> C[(Retrieve)]
      C --> D((Agent))
      D --> E([Response])

      classDef trigger fill:#F6FFDB,stroke:#6E8900,stroke-width:2px,color:#2E3900
      classDef process fill:#E5F4FF,stroke:#006DDD,stroke-width:2px,color:#030710

      class A,E trigger
      class B,C,D process
  ```

  <Tip>
    您可以使用 LangGraph 状态在工作流程步骤之间传递信息。这允许工作流程的每个部分读取和更新结构化字段，从而轻松跨节点共享数据和上下文。
  </Tip>

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from typing import TypedDict
  from pydantic import BaseModel
  from langgraph.graph import StateGraph, START, END
  from langchain.agents import create_agent
  from langchain.tools import tool
  from langchain_openai import ChatOpenAI, OpenAIEmbeddings
  from langchain_core.vectorstores import InMemoryVectorStore

  class State(TypedDict):
      question: str
      rewritten_query: str
      documents: list[str]
      answer: str

  # WNBA knowledge base with rosters, game results, and player stats
  embeddings = OpenAIEmbeddings()
  vector_store = InMemoryVectorStore(embeddings)
  vector_store.add_texts([
      # Rosters
      "New York Liberty 2024 roster: Breanna Stewart, Sabrina Ionescu, Jonquel Jones, Courtney Vandersloot.",
      "Las Vegas Aces 2024 roster: A'ja Wilson, Kelsey Plum, Jackie Young, Chelsea Gray.",
      "Indiana Fever 2024 roster: Caitlin Clark, Aliyah Boston, Kelsey Mitchell, NaLyssa Smith.",
      # Game results
      "2024 WNBA Finals: New York Liberty defeated Minnesota Lynx 3-2 to win the championship.",
      "June 15, 2024: Indiana Fever 85, Chicago Sky 79. Caitlin Clark had 23 points and 8 assists.",
      "August 20, 2024: Las Vegas Aces 92, Phoenix Mercury 84. A'ja Wilson scored 35 points.",
      # Player stats
      "A'ja Wilson 2024 season stats: 26.9 PPG, 11.9 RPG, 2.6 BPG. Won MVP award.",
      "Caitlin Clark 2024 rookie stats: 19.2 PPG, 8.4 APG, 5.7 RPG. Won Rookie of the Year.",
      "Breanna Stewart 2024 stats: 20.4 PPG, 8.5 RPG, 3.5 APG.",
  ])
  retriever = vector_store.as_retriever(search_kwargs={"k": 5})

  @tool
  def get_latest_news(query: str) -> str:
      """Get the latest WNBA news and updates."""
      # Your news API here
      return "Latest: The WNBA announced expanded playoff format for 2025..."

  agent = create_agent(
      model="openai:gpt-5.5",
      tools=[get_latest_news],
  )

  model = ChatOpenAI(model="gpt-5.5")

  class RewrittenQuery(BaseModel):
      query: str

  def rewrite_query(state: State) -> dict:
      """Rewrite the user query for better retrieval."""
      system_prompt = """Rewrite this query to retrieve relevant WNBA information.
  The knowledge base contains: team rosters, game results with scores, and player statistics (PPG, RPG, APG).
  Focus on specific player names, team names, or stat categories mentioned."""
      response = model.with_structured_output(RewrittenQuery).invoke([
          {"role": "system", "content": system_prompt},
          {"role": "user", "content": state["question"]}
      ])
      return {"rewritten_query": response.query}

  def retrieve(state: State) -> dict:
      """Retrieve documents based on the rewritten query."""
      docs = retriever.invoke(state["rewritten_query"])
      return {"documents": [doc.page_content for doc in docs]}

  def call_agent(state: State) -> dict:
      """Generate answer using retrieved context."""
      context = "\n\n".join(state["documents"])
      prompt = f"Context:\n{context}\n\nQuestion: {state['question']}"
      response = agent.invoke({"messages": [{"role": "user", "content": prompt}]})
      return {"answer": response["messages"][-1].content_blocks}

  workflow = (
      StateGraph(State)
      .add_node("rewrite", rewrite_query)
      .add_node("retrieve", retrieve)
      .add_node("agent", call_agent)
      .add_edge(START, "rewrite")
      .add_edge("rewrite", "retrieve")
      .add_edge("retrieve", "agent")
      .add_edge("agent", END)
      .compile()
  )

  result = workflow.invoke({"question": "Who won the 2024 WNBA Championship?"})
  print(result["answer"])
  ```<Info>
    在生产中，使用持久向量存储，例如 [Valkey](/oss/python/integrations/vectorstores/valkey)、[Databricks Vector Search](/oss/python/integrations/vectorstores/databricks_vector_search) 或 [MongoDB Atlas](/oss/python/integrations/vectorstores/mongodb_atlas)，而不是 `InMemoryVectorStore`。参见[all vector stores](/oss/python/integrations/vectorstores)。
  </Info>
</Accordion>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/multi-agent/custom-workflow.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>