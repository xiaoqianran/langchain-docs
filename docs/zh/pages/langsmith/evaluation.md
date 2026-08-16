<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith Evaluation | https://docs.langchain.com/langsmith/evaluation -->

#LangSmith评价

LangSmith 的测试工具可帮助您测量代理质量、迭代提示以及在交互式环境中进行实时调试。评估是测试的核心：它根据数据集和标准对代理的输出进行评分，以便您可以对版本进行基准测试、捕获回归并跟踪一段时间内的质量。

LangSmith 支持两种类型的基于运行时间和地点的评估：

<CardGroup cols={2}>
  <Card
    title="Offline Evaluation"
    icon="flask"
  >
    **发货前测试**

    在开发过程中对精选数据集进行评估，以比较版本、基准性能并捕获回归。
  </Card>

  <Card
    title="Online Evaluation"
    icon="radar"
  >
    **生产中的监控**

    实时评估真实的用户交互，以检测问题并衡量实时流量的质量。
  </Card>
</CardGroup>

## 设置您的帐户

<Steps>
    <Step title="Create an account" icon="user-plus">
        在[smith.langchain.com](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=snippets-langsmith-account-api-key-quickstart)注册（无需信用卡）。
        您可以使用 **Google**、**GitHub** 或 **电子邮件** 登录。
    </Step>
    <Step title="Create an API key" icon="key">
        转到您的 [Settings page](https://smith.langchain.com/settings) → **API 密钥** → **创建 API 密钥**。
        复制密钥并安全保存。
    </Step>
</Steps>

一旦您的帐户和 API 密钥准备就绪，[run your first evaluation](/langsmith/evaluation-quickstart)。

## 评估工作流程

<Tabs>
<Tab title="Offline evaluation flow"><Steps>
  <Step title="Create a dataset">
    根据手动策划的测试用例、历史生产跟踪或合成数据生成，使用 <Tooltip tip="Individual test cases with inputs and reference outputs">[examples](/langsmith/evaluation-concepts#examples)</Tooltip> 创建[dataset](/langsmith/manage-datasets)。
  </Step>

  <Step title="Define evaluators">
    创建 <Tooltip tip="Functions that score how well your application performs">[evaluators](/langsmith/evaluation-concepts#evaluators)</Tooltip> 来对性能进行评分：
    - [Human](/langsmith/evaluation-concepts#human)回顾
    - [Code](/langsmith/evaluation-concepts#code)规则
    - [LLM-as-judge](/langsmith/llm-as-judge)
    - [Pairwise](/langsmith/evaluate-pairwise)比较
  </Step>

  <Step title="Run an experiment">
    在数据集上执行您的应用程序以创建 <Tooltip tip="Results of evaluating a specific application version on a dataset">[experiment](/langsmith/evaluation-concepts#experiment)</Tooltip>。配置[repetitions, concurrency, and caching](/langsmith/experiment-configuration)以优化运行。
  </Step>

  <Step title="Analyze results">
    比较 [benchmarking](/langsmith/evaluation-types#benchmarking)、[unit tests](/langsmith/evaluation-types#unit-tests)、[regression tests](/langsmith/evaluation-types#regression-tests) 或 [backtesting](/langsmith/evaluation-types#backtesting) 的实验。
  </Step>
</Steps>

</Tab>

<Tab title="Online evaluation flow">

<Steps>
  <Step title="Deploy your application">
    每次交互都会创建一个没有参考输出的<Tooltip tip="A single execution trace including inputs, outputs, and intermediate steps">[run](/langsmith/evaluation-concepts#runs)</Tooltip>。
  </Step>

  <Step title="Configure online evaluators">
    设置 [evaluators](/langsmith/online-evaluations-llm-as-judge) 在生产跟踪上自动运行：安全检查、格式验证、质量启发法和无参考的法学硕士作为法官。应用[filters and sampling rates](/langsmith/online-evaluations-llm-as-judge#configure-a-sampling-rate)来控制成本。
  </Step>

  <Step title="Monitor in real-time">
    评估器在[runs](/langsmith/evaluation-concepts#runs)或<Tooltip tip="Collections of related runs forming multi-turn conversations">[threads](/langsmith/online-evaluations-multi-turn)</Tooltip>上自动运行，提供实时监控、异常检测和警报。
  </Step>

  <Step title="Establish a feedback loop">
    将失败的生产跟踪添加到您的[dataset](/langsmith/manage-datasets)，创建有针对性的评估器，通过离线实验验证修复，然后重新部署。
  </Step>
</Steps>

</Tab>
</Tabs><Tip>
有关离线和在线评估之间的差异的更多信息，请参阅[Evaluation concepts](/langsmith/evaluation-concepts#quick-reference-offline-vs-online-evaluation)页面。
</Tip>

## 开始吧

<Columns cols={3}>

  <Card
    title="Evaluation quickstart"
    icon="rocket"
    href="/langsmith/evaluation-quickstart"
    arrow="true"
  >
    开始离线评估。
  </Card>

  <Card
    title="Manage datasets"
    icon="database"
    href="/langsmith/manage-datasets"
    arrow="true"
  >
    通过 UI 或 SDK 创建和管理用于评估的数据集。
  </Card>

  <Card
    title="Run offline evaluations"
    icon="microscope"
    href="/langsmith/evaluate-llm-application"
    arrow="true"
  >
    探索综合测试的评估类型、技术和框架。
  </Card>

  <Card
    title="Analyze results"
    icon="chart-bar"
    href="/langsmith/analyze-an-experiment"
    arrow="true"
  >
    查看和分析评估结果、比较实验、过滤数据并导出结果。
  </Card>

  <Card
    title="Run online evaluations"
    icon="radar"
    href="/langsmith/online-evaluations-llm-as-judge"
    arrow="true"
  >
    从“可观察性”选项卡实时监控生产质量。
  </Card>

  <Card
    title="Follow tutorials"
    icon="book"
    href="/langsmith/evaluate-chatbot-tutorial"
    arrow="true"
  >
    通过遵循从简单的聊天机器人到复杂的代理评估的分步教程来学习。
  </Card>

  <Card
    title="Studio"
    icon="window"
    href="/langsmith/studio"
    arrow="true"
  >
    使用交互式环境来开发和调试代理。
  </Card>

</Columns>

<Note>
要设置 LangSmith 实例，请访问 [Platform setup section](/langsmith/platform-setup) 在云、混合或自托管之间进行选择。所有选项都包括可观察性、评估、即时工程和部署。
</Note>

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluation.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>