<!-- langchain-docs: Fine-tune models with Smithtune | https://docs.langchain.com/langsmith/smithtune -->

# Fine-tune models with Smithtune

Use Smithtune to fine-tune models on LangSmith conversations and compare the results in LangSmith.

> [!NOTE]
>
> Smithtune is in [beta](/langsmith/release-stages).

Smithtune is a command-line tool for fine-tuning models on [trajectories](/langsmith/observability-concepts#trajectories) recorded in LangSmith. It trains a model with [Fireworks](https://fireworks.ai/) or [Baseten](https://www.baseten.co/) and compares the base and tuned models in a LangSmith [experiment](/langsmith/evaluation-concepts#experiment). You can optionally deploy the tuned model as an endpoint for your application.

## How Smithtune works

**1. Create a dataset**

Select trajectories from a tracing project with a [trace query](/langsmith/trace-query-syntax) filter, a model judge, or both.

**2. Prepare data**

Validate the trajectories, then split them into training, validation, and test data. Each trajectory stays in one split.

**3. Train a model**

Preview the run, then fine-tune a supported model with your provider.

**4. Compare results**

Evaluate the base and tuned models on the test data, then [compare the experiments](/langsmith/compare-experiment-results) in LangSmith. Evaluation does not require a deployed endpoint.

**5. Deploy an endpoint (optional)**

Serve the tuned model for your application. To run an agent that uses it in production, see [LangSmith Deployment](/langsmith/deployment).

> [!TIP]
>
> To have your coding agent drive the fine-tuning process end to end, use the [Smithtune skill](https://github.com/langchain-ai/smithtune/blob/main/src/smithtune/skills/smithtune/SKILL.md).

Evaluation scores measure how closely each model matches the recorded behavior, not whether it completes tasks end to end. Smithtune does not execute the tool calls the model generates.

## Set up Smithtune

Smithtune requires trajectories in a tracing project or a LangSmith trajectory dataset. You also need API keys for LangSmith, your training provider, and a judge model. Training, evaluation, and deployed endpoints incur charges from the services you use.

To set up Smithtune:

1. Install Smithtune and the [LangSmith CLI](/langsmith/langsmith-cli), and set your API keys. Follow the [Smithtune README](https://github.com/langchain-ai/smithtune#readme) for the install command and the environment variables each provider needs.

2. Read the [data rights and permitted use terms](https://github.com/langchain-ai/smithtune/blob/main/docs/data-rights-and-permitted-use.md) linked from the [README](https://github.com/langchain-ai/smithtune#readme), then acknowledge them before your first run:

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   smithtune acknowledge-data-rights
   ```

3. Check your local setup:

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   smithtune doctor
   ```

For the commands in each step, see the [README](https://github.com/langchain-ai/smithtune#readme) or run `smithtune --help`.

## See also

* [Trajectory evaluations](/langsmith/trajectory-evals)
* [Query threads](/langsmith/query-threads)
* [Manage datasets](/langsmith/manage-datasets)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/smithtune.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).