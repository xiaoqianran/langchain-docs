<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Mistral applications | https://docs.langchain.com/langsmith/trace-with-mistral -->

# 跟踪米斯特拉尔应用程序

[Mistral](https://mistral.ai/) 通过简单的 API 提供对开放权重语言模型的托管访问。

本指南向您展示如何使用 LangSmith 跟踪 Mistral API 调用，允许您记录提示、响应和元数据以进行调试和可观察。使用 [LangSmith SDK](https://reference.langchain.com/python/langsmith/) 和标准跨度仪器将迹线直接发送到 LangSmith。

## 安装

安装 Mistral 的官方库和LangSmith：

<CodeGroup>

```bash Python
pip install mistralai langsmith
```

```bash JavaScript
npm install @mistralai/mistralai langsmith dotenv
```
</CodeGroup>

[⟦T7⟧](https://docs.mistral.ai/getting-started/clients) 提供了一个 Mistral 客户端，用于与 Mistral 的 API 进行交互。

## 设置

设置您的 [API keys](/langsmith/create-account-api-key) 和项目名称：

```bash
export MISTRAL_API_KEY="<your_mistral_api_key>"
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="<your_langsmith_api_key>"
export LANGSMITH_PROJECT="<your_project_name>"  # optional
```

- 确保您拥有来自 [Mistral AI account](https://v2.auth.mistral.ai/login) 的 Mistral API 密钥（将其设置为 `MISTRAL_API_KEY`）。
- 设置 `LANGSMITH_TRACING=true` 并提供您的 LangSmith API 密钥 (`LANGSMITH_API_KEY`) 激活跟踪的自动记录。
- 指定一个[⟦T11⟧](/langsmith/log-traces-to-project)名称来按项目组织轨迹；如果未设置，跟踪将转到默认项目（名为“default”）。
- 对于要记录的任何跟踪，`LANGSMITH_TRACING` 标志必须为 true。

## 配置跟踪

1. 使用 LangSmith 检测 Mistral API 调用。在您的脚本中，创建一个 Mistral 客户端并将调用包装在跟踪函数中：

    <CodeGroup>

    ```python Python
    import os
    from mistralai import Mistral
    from langsmith import traceable

    # Initialize Mistral API client with your API key
    client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

    @traceable(
        run_type="llm",
        metadata={"ls_provider": "mistral", "ls_model_name": "mistral-medium-latest"},
    )
    def query_mistral(prompt: str):
        response = client.chat.complete(
            model="mistral-medium-latest",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message

    # Example usage
    result = query_mistral("Hello, how are you?")
    print("Mistral response:", result.content)
    ```

    ```typescript TypeScript
    import { Client } from "langsmith";
    import { traceable } from "langsmith/traceable";
    import { Mistral } from "@mistralai/mistralai";
    import "dotenv/config";

    const mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const langsmith = new Client();

    const tracedChatCompletion = traceable(
      async (params: {
        model: string;
        messages: Array<{ role: string; content: string }>;
      }) => {
        const response = await mistral.chat.complete(params);
        // Return the message content so LangSmith captures it correctly
        return response.choices[0].message.content;
      },
      {
        name: "Mistral Chat Completion",
        run_type: "llm",
        metadata: {
          ls_provider: "mistral",
          ls_model_name: "mistral-small-latest",
        },
      }
    );

    async function main() {
      const response = await tracedChatCompletion({
        model: "mistral-small-latest",
        messages: [
          { role: "user", content: "Say hello in one short sentence." },
        ],
      });

      console.log(response);
    }

    main();
    ```

    </CodeGroup>在此示例中，您使用 [Mistral SDK](https://docs.mistral.ai/getting-started/clients) 发送聊天完成请求（带有用户提示）并检索模型的答案。

    [⟦T13⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) 装饰器（来自 [LangSmith Python SDK](https://reference.langchain.com/python/langsmith/observability/sdk/)）包装了 `query_mistral` 函数，以便将每个调用记录为类型 `"llm"` 的跟踪运行。 `metadata={"ls_provider": "mistral", "ls_model_name": "mistral-medium-latest"}` 使用提供者 (Mistral) 和模型名称标记跟踪。

    您也可以参考[LangSmith JavaScript SDK](https://reference.langchain.com/javascript/modules/langsmith.html)。

1. 执行脚本以生成跟踪。例如：

    <CodeGroup>

    ```bash Python
    python mistral_trace.py
    ```

    ```bash JavaScript
    node index.js
    ```

    </CodeGroup>

    `query_mistral("Hello, how are you?")` 调用将访问 Mistral API，并且由于 `@traceable`/`traceable` 包装器，LangSmith 会将此调用的输入和输出记录为新跟踪。您会发现模型的响应打印到控制台，并且相应的运行出现在[LangSmith](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-trace-with-mistral)中。

## 查看LangSmith中的踪迹

运行示例后，您可以检查[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-trace-with-mistral)中记录的痕迹：1. 打开LangSmith UI并登录您的帐户。
1. 选择您用于本次集成的项目（例如`LANGSMITH_PROJECT`中设置的名称，如果没有设置则使用默认名称）。
1. 找到与您的 Mistral API 调用相对应的跟踪。它将通过函数名称 (`query_mistral`) 或自定义名称（如果提供）进行标识。
1. 单击轨迹将其打开。您将能够检查模型输入和输出，包括您发送的提示消息和 Mistral 的响应，以及计时信息（延迟）和调用失败时的任何错误详细信息。

通过 LangSmith 的跟踪，您可以全面了解 Mistral 调用，从而可以调试 Mistral 模型的行为、监控性能（例如响应时间和令牌使用情况），并使用元数据标签比较不同参数的运行。

## 成本跟踪

尽管 Mistral 模型是开放式的，但使用托管的 Mistral API 可能会产生基于使用的费用，具体取决于您的计划。LangSmith 可以通过估计代币使用情况并应用特定于模型的定价，自动将成本与跟踪的 LLM 调用关联起来。在跟踪 Mistral API 调用时，LangSmith 使用记录的提示和响应消息来计算令牌计数并将成本信息附加到每次运行。

要启用 LLM 调用的自动成本跟踪，请参阅[Automatically track costs based on token counts](/langsmith/cost-tracking#llm-calls:-automatically-track-costs-based-on-token-counts)。

启用后，成本会与每次跟踪的 Mistral 运行一起直接显示在 LangSmith UI 中，以便您可以监控使用情况并随时间比较实验。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-mistral.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>