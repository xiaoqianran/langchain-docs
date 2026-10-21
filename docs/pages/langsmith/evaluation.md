<!-- langchain-docs: LangSmith Evaluation | https://docs.langchain.com/langsmith/evaluation -->

# LangSmith Evaluation

Evaluate and test agent quality at scale with datasets, evaluators, prompts, and Studio.

LangSmith's testing tools help you measure agent quality, iterate on prompts, and debug live in an interactive environment. Evaluation is the core of testing: it scores your agent's outputs against datasets and criteria so you can benchmark versions, catch regressions, and track quality over time.

Add real traces to a dataset so a failure you saw once becomes a test you run every time.

LangSmith supports two types of evaluation based on when and where they run:

> **Offline Evaluation**
>
> **Test before you ship**
>
> Run evaluations on curated datasets during development to compare versions, benchmark performance, and catch regressions.

> **Online Evaluation**
>
> **Monitor in production**
>
> Evaluate real user interactions in real-time to detect issues and measure quality on live traffic.

## Set up your account

**1. Create an account**

Sign up at [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=snippets-langsmith-account-api-key-quickstart) (no credit card required).
You can log in with **Google**, **GitHub**, or **email**.

**2. Create an API key**

Go to your [Settings page](https://smith.langchain.com/settings) > **API Keys** > **Create API Key**.
Copy the key and save it securely.

Once your account and API key are ready, [run your first evaluation](/langsmith/evaluation-quickstart).

## Evaluation workflow

**Offline evaluation flow**

**1. Create a dataset**

Create a [dataset](/langsmith/manage-datasets) with [examples](/langsmith/evaluation-concepts#examples) (Individual test cases with inputs and reference outputs) from manually curated test cases, historical production traces, or synthetic data generation.

**2. Define evaluators**

Create [evaluators](/langsmith/evaluation-concepts#evaluators) (Functions that score how well your application performs) to score performance:

* [Human](/langsmith/evaluation-concepts#human) review
* [Code](/langsmith/evaluation-concepts#code) rules
* [LLM-as-judge](/langsmith/llm-as-judge)
* [Pairwise](/langsmith/evaluate-pairwise) comparison

**3. Run an experiment**

Execute your application on the dataset to create an [experiment](/langsmith/evaluation-concepts#experiment) (Results of evaluating a specific application version on a dataset). Configure [repetitions, concurrency, and caching](/langsmith/experiment-configuration) to optimize runs.

**4. Analyze results**

Compare experiments for [benchmarking](/langsmith/evaluation-types#benchmarking), [unit tests](/langsmith/evaluation-types#unit-tests), [regression tests](/langsmith/evaluation-types#regression-tests), or [backtesting](/langsmith/evaluation-types#backtesting).

**Online evaluation flow**

**1. Deploy your application**

Each interaction creates a [run](/langsmith/evaluation-concepts#runs) (A single execution trace including inputs, outputs, and intermediate steps) without reference outputs.

**2. Configure online evaluators**

Set up [evaluators](/langsmith/online-evaluations-llm-as-judge) to run automatically on production traces: safety checks, format validation, quality heuristics, and reference-free LLM-as-judge. Apply [filters and sampling rates](/langsmith/online-evaluations-llm-as-judge#configure-a-sampling-rate) to control costs.

**3. Monitor in real-time**

Evaluators run automatically on [runs](/langsmith/evaluation-concepts#runs) or [threads](/langsmith/online-evaluations-multi-turn) (Collections of related runs forming multi-turn conversations), providing real-time monitoring, anomaly detection, and alerting.

**4. Establish a feedback loop**

Add failing production traces to your [dataset](/langsmith/manage-datasets), create targeted evaluators, validate fixes with offline experiments, and redeploy.

> [!TIP]
>
> For more on the differences between offline and online evaluation, refer to the [Evaluation concepts](/langsmith/evaluation-concepts#quick-reference-offline-vs-online-evaluation) page.

## Get started

> **[Evaluation quickstart](/langsmith/evaluation-quickstart)**
>
> Get started with offline evaluation.

> **[Manage datasets](/langsmith/manage-datasets)**
>
> Create and manage datasets for evaluation through the UI or SDK.

> **[Run offline evaluations](/langsmith/evaluate-llm-application)**
>
> Explore evaluation types, techniques, and frameworks for comprehensive testing.

> **[Analyze results](/langsmith/analyze-an-experiment)**
>
> View and analyze evaluation results, compare experiments, filter data, and export findings.

> **[Run online evaluations](/langsmith/online-evaluations-llm-as-judge)**
>
> Monitor production quality in real-time from the Observability tab.

> **[Follow tutorials](/langsmith/evaluate-chatbot-tutorial)**
>
> Learn by following step-by-step tutorials, from simple chatbots to complex agent evaluations.

> **[Studio](/langsmith/studio)**
>
> Use an interactive environment for developing and debugging agents.

> [!NOTE]
>
> To set up a LangSmith instance, visit the [Platform setup section](/langsmith/platform-setup) to choose between cloud, hybrid, or self-hosted. All options include observability, evaluation, prompt engineering, and deployment.

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluation.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).