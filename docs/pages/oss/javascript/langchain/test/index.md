<!-- langchain-docs: Test | https://docs.langchain.com/oss/javascript/langchain/test/index -->

# Test

Strategies for testing LangChain agents, including unit tests, integration tests, and trajectory evaluations.

Agentic applications let an LLM decide its own next steps to solve a problem. That flexibility is powerful, but the model's black-box nature makes it hard to predict how a tweak in one part of your agent will affect the whole. To build production-ready agents, thorough testing is essential.

There are a few approaches to testing your agents:

* **Unit tests** exercise small, deterministic pieces of your agent in isolation using in-memory fakes so you can assert exact behavior quickly and deterministically.
* **Integration tests** test the agent using real network calls to confirm that components work together, credentials and schemas line up, and latency is acceptable.
* **Evals** use evaluators to assess your agent's execution trajectory, either via deterministic matching or an LLM judge.

Agentic applications tend to lean more on integration because they chain multiple components together and must deal with flakiness due to the nondeterministic nature of LLMs.

> [!TIP]
>
> Run evaluations at scale, track results over time, and compare experiments with [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-test-index). See [Evaluate an LLM application](/langsmith/evaluate-llm-application) to get started.

> [card] [Unit testing](/oss/javascript/langchain/test/unit-testing)
>
> Mock chat models and use in-memory persistence to test agent logic without API calls.

> [card] [Integration testing](/oss/javascript/langchain/test/integration-testing)
>
> Test your agent with real LLM APIs. Organize tests, manage keys, handle flakiness, and control costs.

> [card] [Evals](/oss/javascript/langchain/test/evals)
>
> Evaluate agent trajectories with deterministic matching or LLM-as-judge evaluators.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/test/index.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).