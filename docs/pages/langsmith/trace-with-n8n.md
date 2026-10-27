<!-- langchain-docs: Trace n8n workflows | https://docs.langchain.com/langsmith/trace-with-n8n -->

# Trace n8n workflows

Learn how to trace n8n AI workflows in LangSmith.

[n8n](https://n8n.io/) is a workflow automation platform that includes advanced AI capabilities built on LangChain. You can connect your n8n instance to LangSmith to record and monitor AI workflow runs.

> [!NOTE]
>
> LangSmith tracing is available for **self-hosted n8n instances** only.

> [!NOTE]
>
> This integration uses a legacy destination setting such as `project_name` or `LANGSMITH_PROJECT`. [Create an agent](/langsmith/create-an-agent), choose its environment, and [retrieve that environment's `tracer_session_name`](/langsmith/create-an-agent#use-an-environment-project). Use that returned value in the destination setting and any overrides. For integrations that support agent addressing, use the [agent identifier and environment](/langsmith/log-traces-to-agent) directly.

## Prerequisites

* A [LangSmith account](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-n8n) and [API key](/langsmith/create-account-api-key)
* A self-hosted n8n instance

## Set up tracing

1. Set the following environment variables in the environment where you host your n8n instance, in the same way as the rest of your [n8n configuration](https://docs.n8n.io/hosting/configuration/configuration-methods/).

   Required environment variables:

   * `LANGCHAIN_TRACING_V2`: Set to `true` to enable tracing.
   * `LANGCHAIN_API_KEY`: Your LangSmith API key.

   Optional environment variables:

   * `LANGCHAIN_ENDPOINT`: LangSmith API endpoint. Defaults to `https://api.smith.langchain.com`. Set this if using self-hosted LangSmith, GCP EU (`https://eu.api.smith.langchain.com`), GCP APAC (`https://apac.api.smith.langchain.com`), or AWS US (`https://aws.api.smith.langchain.com`).
   * `LANGCHAIN_PROJECT`: Set to the selected agent environment's `tracer_session_name`. If omitted, the integration uses `"default"`.
   * `LANGCHAIN_CALLBACKS_BACKGROUND`: Set to `true` for asynchronous trace upload (default), or `false` for synchronous uploads. (default: `true`)

2. Restart your n8n instance for the environment variables to take effect.

## View traces in LangSmith

After running an AI workflow:

1. Open [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-n8n).
2. Select the agent and environment whose `tracer_session_name` you configured in `LANGCHAIN_PROJECT`.
3. Locate the trace corresponding to your workflow execution.

## Additional resources

* [n8n LangSmith integration guide](https://docs.n8n.io/advanced-ai/langchain/langsmith/)
* [n8n Advanced AI documentation](https://docs.n8n.io/advanced-ai/)

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-n8n.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).