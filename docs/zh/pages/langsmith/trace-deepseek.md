<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace DeepSeek applications | https://docs.langchain.com/langsmith/trace-deepseek -->

# 跟踪 DeepSeek 应用程序

[DeepSeek](https://deepseek.com/)提供高性能、OpenAI兼容的语言模型，包括`deepseek-chat`（用于一般对话）和`deepseek-reasoner`（用于高级推理任务）。使用 LangSmith 允许您通过捕获输入、输出和元数据的结构化跟踪来调试、监控和评估您的 LLM 应用程序。

本指南向您展示如何在 Python 和 TypeScript 中将 DeepSeek 与 LangSmith 集成，使用 LangSmith 的 [⟦T10⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) (Python) 和 [⟦T11⟧](https://reference.langchain.com/javascript/modules/langsmith.html) (TypeScript) 实用程序自动记录 LLM 调用。


## 安装

安装[OpenAI](https://platform.openai.com/docs/libraries)和LangSmith：

<CodeGroup>

```bash pip
pip install openai langsmith
```

```bash uv
uv add openai langsmith
```

```bash npm
npm install openai langsmith dotenv
```

</CodeGroup>

DeepSeek 提供了[OpenAI-compatible API](https://api-docs.deepseek.com/)，这意味着您可以使用OpenAI SDK 与 DeepSeek 模型进行交互。唯一的区别是您将客户端配置为指向 DeepSeek 的基本 URL (`https://api.deepseek.com/v1`)，而不是OpenAI 的端点。

## 设置

设置您的 [API keys](/langsmith/create-account-api-key) 和项目名称：

```bash
export LANGSMITH_API_KEY="your-langsmith-api-key"
export LANGSMITH_TRACING="true"
export LANGSMITH_PROJECT="deepseek-integration"
export DEEPSEEK_API_KEY="your-deepseek-api-key"
```
- 确保您拥有来自 [DeepSeek account](https://platform.deepseek.com/) 的 DeepSeek API 密钥。
- 设置 `LANGSMITH_TRACING=true` 并提供您的 LangSmith API 密钥 (`LANGSMITH_API_KEY`) 激活跟踪的自动记录。
- 指定一个[⟦T15⟧](/langsmith/log-traces-to-project)名称来按项目组织跟踪；如果未设置，跟踪将转到默认项目（名为“default”）。
- 对于要记录的任何跟踪，`LANGSMITH_TRACING` 标志必须为 true。## 配置跟踪

1. 使用 LangSmith 检测 DeepSeek API 调用。在您的脚本中，创建一个 OpenAI 客户端，配置为使用 DeepSeek 的 API 端点并将调用包装在跟踪函数中：

    <CodeGroup>

    ```python Python
    import os
    from openai import OpenAI
    from langsmith import traceable

    # Create a client pointing to DeepSeek
    client = OpenAI(
        api_key=os.environ["DEEPSEEK_API_KEY"],
        base_url="https://api.deepseek.com/v1"
    )

    @traceable(
        run_type="llm",
        name="DeepSeek Chat Completion",
        metadata={"ls_provider": "deepseek", "ls_model_name": "deepseek-chat"},
    )
    def call_deepseek(messages: list[dict]):
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages
        )
        return response.choices[0].message

    if __name__ == "__main__":
        messages = [
            {"role": "system", "content": "You are a helpful assistant that translates English to French."},
            {"role": "user", "content": "I love programming."}
        ]
        result = call_deepseek(messages=messages)
        print("Model reply:", result.content)
    ```

    ```typescript TypeScript
    import { config } from "dotenv";
    import OpenAI from "openai";
    import { traceable } from "langsmith/traceable";

    config(); // Load env vars from .env

    const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1"
    });

    type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
    };

    const callDeepSeek = traceable(
    async (messages: ChatMessage[]) => {
        const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages
        });

        return response.choices[0].message;
    },
    {
        name: "DeepSeek Chat Completion",
        run_type: "llm",
        metadata: {
        ls_provider: "deepseek",
        ls_model_name: "deepseek-chat"
        }
    }
    );

    (async () => {
    const messages: ChatMessage[] = [
        {
        role: "system",
        content: "You are a helpful assistant that translates English to French."
        },
        {
        role: "user",
        content: "I love programming."
        }
    ];

    const result = await callDeepSeek(messages);
    console.log("Model reply:", result.content);
    })();

    ```

    </CodeGroup>

    在此示例中，您使用OpenAI SDK 与[DeepSeek's API](https://api-docs.deepseek.com/) 进行交互。 OpenAI 客户端配置有 `base_url="https://api.deepseek.com/v1"`，以将请求路由到 DeepSeek 的端点，同时保持 OpenAI 兼容语法。

    `@traceable` 装饰器 (Python) 或 `traceable` 函数 (TypeScript) 包装您的函数，以便将每次调用记录为 `"llm"` 类型的跟踪运行。 `metadata` 参数用以下方式标记跟踪：

    - `ls_provider`：标识用于过滤痕迹的提供者（DeepSeek）。
    - `ls_model_name`：指定用于成本跟踪和分析的模型。

    该函数返回完整的消息对象 (`response.choices[0].message`)，其中包括响应内容以及角色和任何其他字段等元数据。 LangSmith自动捕捉：

    - 发送到模型的输入消息。
    - 模型的完整响应（内容、角色等）。
    - 模型名称和代币使用统计信息。
    - 执行时间和任何错误。

2. 执行脚本以生成跟踪：

    <CodeGroup>

    ```bash Python
    python deepseek_trace.py
    ``````bash TypeScript
    node deepseek_trace.js
    ```

    </CodeGroup>

    该函数调用将访问 DeepSeek 的 API，并且由于 `@traceable`/`traceable` 包装器，LangSmith 会将此调用的输入和输出记录为新跟踪。您会发现模型的响应打印到控制台，并且相应的运行出现在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-trace-deepseek) 中。

## 查看LangSmith中的踪迹

运行示例后，您可以检查[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-trace-deepseek)中记录的痕迹：

1. 打开LangSmith UI并登录您的帐户。
1. 选择您用于此集成的项目（例如，`LANGSMITH_PROJECT` 中设置的名称，如果未设置，则选择“默认”）。
1. 找到与您的 DeepSeek API 调用相对应的跟踪。它将通过函数名称（`DeepSeek Chat Completion`）进行识别。
1. 单击轨迹将其打开。您将能够检查模型输入和输出，包括您发送的提示消息和 DeepSeek 的响应，以及计时信息（延迟）和令牌使用情况。

通过 LangSmith 的跟踪，您可以全面了解 DeepSeek 调用，从而可以调试 DeepSeek 模型的行为、监控性能（响应时间和令牌使用情况）以及比较不同参数的运行。

## 成本跟踪尽管 DeepSeek 模型是开放式的，但使用托管的 DeepSeek API 可能会产生基于使用的费用，具体取决于您的计划。

LangSmith 可以通过估计代币使用情况并应用特定于模型的定价，自动将成本与跟踪的 LLM 调用关联起来。在跟踪 DeepSeek API 调用时，LangSmith 使用记录的提示和响应消息来计算令牌计数并将成本信息附加到每次运行。

要启用 LLM 呼叫的自动成本跟踪，请参阅[Automatically track costs based on token counts](/langsmith/cost-tracking#llm-calls:-automatically-track-costs-based-on-token-counts)。

启用后，成本会与每次跟踪的 DeepSeek 运行一起直接显示在 LangSmith UI 中，让您可以监控使用情况并随时间比较实验。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-deepseek.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>