<!-- langchain-docs: LangSmith Evaluation | https://docs.langchain.com/langsmith/evaluation -->

# LangSmith Evaluation

Evaluate and test agent quality at scale with datasets, evaluators, prompts, and Studio.

LangSmith's testing tools help you measure agent quality, iterate on prompts, and debug live in an interactive environment. Evaluation is the core of testing: it scores your agent's outputs against datasets and criteria so you can benchmark versions, catch regressions, and track quality over time.

LangSmith supports two types of evaluation based on when and where they run:

<CardGroup>
  <Card title="Offline Evaluation" icon="flask">
    **Test before you ship**

    Run evaluations on curated datasets during development to compare versions, benchmark performance, and catch regressions.
  </Card>

  <Card title="Online Evaluation" icon="radar">
    **Monitor in production**

    Evaluate real user interactions in real-time to detect issues and measure quality on live traffic.
  </Card>
</CardGroup>

## Set up your account

<Steps>
  <Step title="Create an account" icon="user-plus">
    Sign up at [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=snippets-langsmith-account-api-key-quickstart) (no credit card required).
    You can log in with **Google**, **GitHub**, or **email**.
  </Step>

  <Step title="Create an API key" icon="key">
    Go to your [Settings page](https://smith.langchain.com/settings) → **API Keys** → **Create API Key**.
    Copy the key and save it securely.
  </Step>
</Steps>

Once your account and API key are ready, [run your first evaluation](/langsmith/evaluation-quickstart).

## Evaluation workflow

<Tabs>
  <Tab title="Offline evaluation flow">
    <Steps>
      <Step title="Create a dataset">
        Create a [dataset](/langsmith/manage-datasets) with <Tooltip>[examples](/langsmith/evaluation-concepts#examples)</Tooltip> from manually curated test cases, historical production traces, or synthetic data generation.
      </Step>

      <Step title="Define evaluators">
        Create <Tooltip>[evaluators](/langsmith/evaluation-concepts#evaluators)</Tooltip> to score performance:

        * [Human](/langsmith/evaluation-concepts#human) review
        * [Code](/langsmith/evaluation-concepts#code) rules
        * [LLM-as-judge](/langsmith/llm-as-judge)
        * [Pairwise](/langsmith/evaluate-pairwise) comparison
      </Step>

      <Step title="Run an experiment">
        Execute your application on the dataset to create an <Tooltip>[experiment](/langsmith/evaluation-concepts#experiment)</Tooltip>. Configure [repetitions, concurrency, and caching](/langsmith/experiment-configuration) to optimize runs.
      </Step>

      <Step title="Analyze results">
        Compare experiments for [benchmarking](/langsmith/evaluation-types#benchmarking), [unit tests](/langsmith/evaluation-types#unit-tests), [regression tests](/langsmith/evaluation-types#regression-tests), or [backtesting](/langsmith/evaluation-types#backtesting).
      </Step>
    </Steps>
  </Tab>

  <Tab title="Online evaluation flow">
    <Steps>
      <Step title="Deploy your application">
        Each interaction creates a <Tooltip>[run](/langsmith/evaluation-concepts#runs)</Tooltip> without reference outputs.
      </Step>

      <Step title="Configure online evaluators">
        Set up [evaluators](/langsmith/online-evaluations-llm-as-judge) to run automatically on production traces: safety checks, format validation, quality heuristics, and reference-free LLM-as-judge. Apply [filters and sampling rates](/langsmith/online-evaluations-llm-as-judge#configure-a-sampling-rate) to control costs.
      </Step>

      <Step title="Monitor in real-time">
        Evaluators run automatically on [runs](/langsmith/evaluation-concepts#runs) or <Tooltip>[threads](/langsmith/online-evaluations-multi-turn)</Tooltip>, providing real-time monitoring, anomaly detection, and alerting.
      </Step>

      <Step title="Establish a feedback loop">
        Add failing production traces to your [dataset](/langsmith/manage-datasets), create targeted evaluators, validate fixes with offline experiments, and redeploy.
      </Step>
    </Steps>
  </Tab>
</Tabs>

<Tip>
  For more on the differences between offline and online evaluation, refer to the [Evaluation concepts](/langsmith/evaluation-concepts#quick-reference-offline-vs-online-evaluation) page.
</Tip>

## Get started

<Columns>
  <Card title="Evaluation quickstart" icon="rocket" href="/langsmith/evaluation-quickstart">
    Get started with offline evaluation.
  </Card>

  <Card title="Manage datasets" icon="database" href="/langsmith/manage-datasets">
    Create and manage datasets for evaluation through the UI or SDK.
  </Card>

  <Card title="Run offline evaluations" icon="microscope" href="/langsmith/evaluate-llm-application">
    Explore evaluation types, techniques, and frameworks for comprehensive testing.
  </Card>

  <Card title="Analyze results" icon="chart-bar" href="/langsmith/analyze-an-experiment">
    View and analyze evaluation results, compare experiments, filter data, and export findings.
  </Card>

  <Card title="Run online evaluations" icon="radar" href="/langsmith/online-evaluations-llm-as-judge">
    Monitor production quality in real-time from the Observability tab.
  </Card>

  <Card title="Follow tutorials" icon="book" href="/langsmith/evaluate-chatbot-tutorial">
    Learn by following step-by-step tutorials, from simple chatbots to complex agent evaluations.
  </Card>

  <Card title="Studio" icon="window" href="/langsmith/studio">
    Use an interactive environment for developing and debugging agents.
  </Card>
</Columns>

<Note>
  To set up a LangSmith instance, visit the [Platform setup section](/langsmith/platform-setup) to choose between cloud, hybrid, or self-hosted. All options include observability, evaluation, prompt engineering, and deployment.
</Note>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluation.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).
  </Callout>
</div>