<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace n8n workflows | https://docs.langchain.com/langsmith/trace-with-n8n -->

# 跟踪 n8n 工作流程

了解如何在 LangSmith 中跟踪 n8n AI 工作流程。

[n8n](https://n8n.io/)是一个工作流程自动化平台，包含基于LangChain构建的高级人工智能功能。您可以将 n8n 实例连接到 LangSmith 来记录和监控 AI 工作流程运行。

> [!注意]
>
> LangSmith 跟踪仅适用于 **自托管 n8n 实例**。

> [!注意]
>
> 此集成不支持[agent addressing](/langsmith/log-traces-to-agent)。它通过 `tracer_session_name` 追踪到代理环境。

## 先决条件

* A [LangSmith account](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-n8n) 和 [API key](/langsmith/create-account-api-key)
* 一个自托管的n8n实例
* LangSmith 中的[agent](/langsmith/create-an-agent)。 n8n 不支持代理寻址，因此它通过名称跟踪代理的环境之一。

## 设置跟踪

1. 在托管 n8n 实例的环境中设置以下环境变量，与 [n8n configuration](https://docs.n8n.io/hosting/configuration/configuration-methods/) 的其余部分相同。

   所需的环境变量：

   * `LANGCHAIN_TRACING_V2`：设置为`true`以启用跟踪。
   * `LANGCHAIN_API_KEY`：您的 LangSmith API 密钥。

   可选环境变量：* `LANGCHAIN_ENDPOINT`: LangSmith API 端点。默认为`https://api.smith.langchain.com`。如果使用自托管 LangSmith、GCP EU (`https://eu.api.smith.langchain.com`)、GCP APAC (`https://apac.api.smith.langchain.com`) 或 AWS US (`https://aws.api.smith.langchain.com`)，请设置此选项。
   * `LANGCHAIN_PROJECT`：设置为代理环境的[⟦T10⟧](/langsmith/create-an-agent#use-an-environment-project)。如果省略，跟踪将发送至名为 `default` 的代理。
   * `LANGCHAIN_CALLBACKS_BACKGROUND`：设置为 `true` 进行异步跟踪上传（默认），或设置为 `false` 进行同步上传。 （默认：`true`）

2. 重启n8n实例以使环境变量生效。

## 查看LangSmith中的踪迹

运行 AI 工作流程后：

1. 打开[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-n8n)。
2. 选择您的代理，进入**跟踪**，然后选择您在`LANGCHAIN_PROJECT`中设置的`tracer_session_name`的环境。
3. 找到与您的工作流程执行相对应的跟踪。

## 其他资源

* [n8n LangSmith integration guide](https://docs.n8n.io/advanced-ai/langchain/langsmith/)
* [n8n Advanced AI documentation](https://docs.n8n.io/advanced-ai/)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-n8n.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。