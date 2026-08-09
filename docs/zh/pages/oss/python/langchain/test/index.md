<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Test | https://docs.langchain.com/oss/python/langchain/test/index -->

# 测试

LangChain代理的测试策略，包括单元测试、集成测试和轨迹评估。

代理应用程序让法学硕士可以决定自己的后续步骤来解决问题。这种灵活性非常强大，但模型的黑盒性质使得很难预测代理的某一部分的调整将如何影响整体。要构建可投入生产的代理，彻底的测试至关重要。

有几种方法可以测试您的代理：

* **单元测试** 使用内存中的伪造来独立地测试代理的小型、确定性部分，以便您可以快速、确定性地断言准确的行为。
* **集成测试** 使用真实的网络调用来测试代理，以确认组件可以协同工作、凭据和模式对齐以及延迟是可以接受的。
* **Evals** 使用评估器通过确定性匹配或 LLM 判断来评估代理的执行轨迹。

代理应用程序往往更依赖于集成，因为它们将多个组件链接在一起，并且由于法学硕士的不确定性而必须处理不稳定的问题。<Tip>
  大规模运行评估，跟踪一段时间内的结果，并将实验与 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-langchain-test-index) 进行比较。请参阅[Evaluate an LLM application](/langsmith/evaluate-llm-application)开始。
</Tip>

<CardGroup>
  <Card title="Unit testing" icon="flask" href="/oss/python/langchain/test/unit-testing">
    模拟聊天模型并使用内存持久性来测试代理逻辑，而无需 API 调用。
  </Card>

  <Card title="Integration testing" icon="plug" href="/oss/python/langchain/test/integration-testing">
    使用真实的 LLM API 测试您的代理。组织测试、管理密钥、处理不稳定问题并控制成本。
  </Card>

  <Card title="Evals" icon="scale" href="/oss/python/langchain/test/evals">
    使用确定性匹配或 LLM-as-judge 评估器评估代理轨迹。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/test/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>