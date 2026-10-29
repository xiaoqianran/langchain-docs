<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace an agent | https://docs.langchain.com/langsmith/observability-llm-tutorial -->

# 追踪代理

在原型设计、Beta 测试和生产过程中为代理添加 LangSmith 可观察性。

在本教程中，您将使用检索增强生成 (RAG) 构建客户支持聊天机器人，并在从早期原型设计到生产的每个开发阶段添加 LangSmith 可观察性。

到最后，您将知道如何：

* 跟踪各个 LLM 呼叫和完整的代理管道。
* 收集并查询用户反馈。
* 记录元数据并将其用于过滤和 A/B 测试。
* 使用监控仪表板来跟踪生产绩效。

代理将检索相关文档片段并使用它们来回答用户问题。本教程中对检索器进行了模拟；在真实的代理中，您可以将其替换为矢量搜索或类似的内容。

## 先决条件

在开始之前，请确保您拥有：

* **LangSmith帐户**：在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-llm-tutorial)注册或登录。
* **A LangSmith API 密钥**：遵循 [Create an API key](/langsmith/create-account-api-key) 指南。
* **OpenAI API 密钥**：从 [OpenAI dashboard](https://platform.openai.com/account/api-keys) 生成此密钥。
* **LangSmith CLI**（可选）：安装以检查来自终端的跟踪。有关说明，请参阅[LangSmith CLI](/langsmith/langsmith-cli)。

安装所需的软件包：

```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langsmith openai
```

```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install langsmith openai
npm install -D typescript tsx
```

## 原型设计从一开始就设置可观察性可以让您更快地迭代。您可以准确地看到发送到模型的内容、返回的内容以及时间花费在哪里，而无需添加打印语句或运行调试器。

### 设置您的环境

在 shell 中设置以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="<your-api-key>"
export OPENAI_API_KEY="<your-openai-api-key>"
```

在发送跟踪之前，请在LangSmith中创建代理：

1. 在 [agent-based workspace](/langsmith/agents) 中，打开 **+ Agent**，选择 **Observability**，并使用 **Agent name** 和 **Agent ID** 创建一个 Agent。这需要`projects:create`许可。如果代理已存在，请重用它。
2. 复制 **代理 ID** 并选择环境：`local`、`development`、`staging` 或 `production`。
3. 在运行代理之前配置[agent addressing](/langsmith/log-traces-to-agent)：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGSMITH_AGENT_ID="<your-agent-id>"
   export LANGSMITH_AGENT_ENVIRONMENT="production"
   ```

注册代理一次，而不是每次跟踪。从代码运行环境中删除 `LANGSMITH_PROJECT`、`LANGCHAIN_PROJECT` 和 `LANGCHAIN_SESSION`。请勿将旧目标设置与代理寻址结合起来。要使用 SDK 调用或 API 请求创建代理，请参阅 [Create an agent programmatically](/langsmith/create-an-agent#create-an-agent-programmatically)。> **基于项目的工作区和自托管 LangSmith**
>
> 代理寻址可在 LangSmith 云上基于代理的工作区中使用。在基于项目的工作区（包括自托管 LangSmith）中，将 `LANGSMITH_PROJECT` 设置为跟踪项目名称，而不是设置两个代理变量。

> [!注意]
>
> 您可能会在其他地方看到这些变量被引用为 `LANGCHAIN_*`。两者都可以，但推荐名称为 `LANGSMITH_TRACING` 和 `LANGSMITH_API_KEY`。

### 跟踪 LLM 通话

首先跟踪实际调用模型的 OpenAI 调用。这使您可以立即查看应用程序发送的提示和模型返回的响应。

使用 [⟦T26⟧](https://reference.langchain.com/python/langsmith/wrappers/_openai/wrap_openai) (Python) 或 [⟦T27⟧](https://reference.langchain.com/javascript/langsmith/wrappers/wrapOpenAI) (TypeScript) 包装 OpenAI 客户端。使用以下代码创建一个名为 `app.py` （或 `app.ts`）的文件：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from openai import OpenAI
from langsmith.wrappers import wrap_openai

client = wrap_openai(OpenAI())

docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
]

def retriever(query: str) -> list[str]:
    return docs

def support_bot(question: str) -> str:
    context = retriever(question)
    system_message = (
        "You are a helpful customer support agent. "
        "Answer using only the information provided below:\n\n"
        + "\n".join(context)
    )
    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    print(support_bot("How many users can I have on the Starter plan?"))
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers";

const client = wrapOpenAI(new OpenAI());

const docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
];

function retriever(query: string): string[] {
    return docs;
}

async function supportBot(question: string): Promise<string> {
    const context = retriever(question);
    const systemMessage =
        "You are a helpful customer support agent. " +
        "Answer using only the information provided below:\n\n" +
        context.join("\n");
    const response = await client.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: question },
        ],
    });
    return response.choices[0].message?.content ?? "";
}

(async () => {
    console.log(await supportBot("How many users can I have on the Starter plan?"));
})();
```

调用 `support_bot("How many users can I have on the Starter plan?")` 会产生 OpenAI 调用的跟踪。

### 跟踪整个管道

跟踪 LLM 调用很有用，但跟踪完整的管道（包括检索）可以让您全面了解代理的行为。将 [⟦T31⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) (Python) 或 [⟦T32⟧](https://reference.langchain.com/javascript/langsmith/traceable) (TypeScript) 添加到 main 函数中：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from openai import OpenAI
from langsmith import traceable
from langsmith.wrappers import wrap_openai

client = wrap_openai(OpenAI())

docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
]

def retriever(query: str) -> list[str]:
    return docs

@traceable  # [!code highlight]
def support_bot(question: str) -> str:
    context = retriever(question)
    system_message = (
        "You are a helpful customer support agent. "
        "Answer using only the information provided below:\n\n"
        + "\n".join(context)
    )
    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    print(support_bot("How many users can I have on the Starter plan?"))
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers";
import { traceable } from "langsmith/traceable";

const client = wrapOpenAI(new OpenAI());

const docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
];

function retriever(query: string): string[] {
    return docs;
}

const supportBot = traceable(async function supportBot(question: string): Promise<string> {  // [!code highlight]
    const context = retriever(question);
    const systemMessage =
        "You are a helpful customer support agent. " +
        "Answer using only the information provided below:\n\n" +
        context.join("\n");
    const response = await client.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: question },
        ],
    });
    return response.choices[0].message?.content ?? "";
});  // [!code highlight]

(async () => {
    console.log(await supportBot("How many users can I have on the Starter plan?"));
})();
```

现在调用 `support_bot("How many users can I have on the Starter plan?")` 会生成完整 RAG 管道的跟踪。

![LangSmith UI showing a trace with an outer agent span and a nested LLM call span.](https://mintcdn.com/langchain-5e9cc07a/EKYgNtnIIDPnseTv/langsmith/images/trace-whole-pipeline.png?fit=max\&auto=format\&n=EKYgNtnIIDPnseTv\&q=85\&s=158b82743e86bc48be7ccbd2ddf79e4a)

### 从终端检查您的痕迹如果您安装了 [LangSmith CLI](/langsmith/langsmith-cli)，请列出代理环境的最新跟踪记录，而无需打开 UI。 CLI 的 `--project` 选项采用环境的 [⟦T35⟧](/langsmith/create-an-agent#use-an-environment-project)：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith trace list --project "<environment-tracer-session-name>" --limit 5
```

要查看特定跟踪的完整运行层次结构和输入/输出：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith trace get <trace-id> --full
```

## Beta 测试

一旦您的应用程序在原型设计中运行良好，您就可以将其发布给一小群真实用户。在这个阶段，您通常不确切地知道用户将如何与您的应用程序交互，因此您需要更丰富的可观察性。您不仅想了解应用程序做了什么，还想了解用户对其的反应。

### 收集反馈

将 [user feedback](/langsmith/attach-user-feedback) 链接到特定跟踪可以让您确定哪些响应有帮助或无帮助。更新上一步中的 `app.py` （或 `app.ts`），为每个调用添加运行 ID，然后附加分数：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio  # [!code highlight]
import os  # [!code highlight]

from openai import OpenAI
from langsmith import Client, agent_address, traceable, uuid7  # [!code highlight]
from langsmith.wrappers import wrap_openai

client = wrap_openai(OpenAI())

docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
]

def retriever(query: str) -> list[str]:
    return docs

@traceable
def support_bot(question: str) -> str:
    context = retriever(question)
    system_message = (
        "You are a helpful customer support agent. "
        "Answer using only the information provided below:\n\n"
        + "\n".join(context)
    )
    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    run_id = str(uuid7())  # [!code highlight]
    support_bot(  # [!code highlight]
        "How many users can I have on the Starter plan?",  # [!code highlight]
        langsmith_extra={"run_id": run_id},  # [!code highlight]
    )  # [!code highlight]
    ls_client = Client()  # [!code highlight]
    # Feedback requires the session_id for the agent environment  # [!code highlight]
    address = agent_address(  # [!code highlight]
        os.environ["LANGSMITH_AGENT_ID"], os.environ["LANGSMITH_AGENT_ENVIRONMENT"]  # [!code highlight]
    )  # [!code highlight]
    resolved = asyncio.run(ls_client.sessions.resolve(**address))  # [!code highlight]
    session_id = resolved.session_id  # [!code highlight]
    ls_client.create_feedback(  # [!code highlight]
        run_id, key="user-score", score=1.0, session_id=session_id  # [!code highlight]
    )  # [!code highlight]
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers";
import { traceable, getCurrentRunTree } from "langsmith/traceable"; // [!code highlight]
import { AgentAddress, Client } from "langsmith"; // [!code highlight]

const client = wrapOpenAI(new OpenAI());

const docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
];

function retriever(query: string): string[] {
    return docs;
}

let capturedRunId: string; // [!code highlight]

const supportBot = traceable(async function supportBot(question: string): Promise<string> {
    const runTree = getCurrentRunTree(); // [!code highlight]
    capturedRunId = runTree.id; // [!code highlight]
    const context = retriever(question);
    const systemMessage =
        "You are a helpful customer support agent. " +
        "Answer using only the information provided below:\n\n" +
        context.join("\n");
    const response = await client.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: question },
        ],
    });
    return response.choices[0].message?.content ?? "";
});

(async () => {
    await supportBot("How many users can I have on the Starter plan?"); // [!code highlight]
    const lsClient = new Client(); // [!code highlight]
    // Feedback requires the session_id for the agent environment // [!code highlight]
    const address = new AgentAddress( // [!code highlight]
        process.env.LANGSMITH_AGENT_ID!, process.env.LANGSMITH_AGENT_ENVIRONMENT! // [!code highlight]
    ); // [!code highlight]
    const { session_id: sessionId } = await lsClient.sessions.resolve(address); // [!code highlight]
    await lsClient.createFeedback({ // [!code highlight]
        runId: capturedRunId, // [!code highlight]
        sessionId, // [!code highlight]
        key: "user-score", // [!code highlight]
        score: 1.0, // [!code highlight]
    }); // [!code highlight]
    await lsClient.flush(); // [!code highlight]
})();
```> [!注意]
>
> 在生产中，这两部分将位于不同的位置：`support_bot` 与 `run_id` 的调用保留在您的代理代码中，`create_feedback` 移动到接收用户反馈的端点（例如，`/feedback` API 路由）。 `run_id` 从一个传递到另一个，以便反馈可以链接到正确的迹线。由于反馈还需要环境的跟踪存储 UUID，因此将 `session_id` 与 `run_id` 一起传递。

在基于项目的工作区中，使用 `read_project` / `readProject` 查找项目 UUID，而不是解析代理地址。有关地址解析要求，请参阅[Resolve an agent environment](/langsmith/resolve-an-agent)。

当您在 UI 中检查运行时，反馈将显示在 **反馈** 选项卡中。然后，您可以使用 **运行** 表中的过滤控件按反馈分数过滤运行。

### 记录元数据

[Metadata](/langsmith/add-metadata-tags) 允许您使用对过滤和比较有用的属性来标记运行。例如，使用了哪个型号版本或哪个用户提出了请求。

以下示例跟踪检索器（使用 `run_type="retriever"`）和主函数（使用模型名称的 `metadata` 属性）：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from openai import OpenAI
from langsmith import traceable
from langsmith.wrappers import wrap_openai

client = wrap_openai(OpenAI())

docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
]

@traceable(run_type="retriever")  # [!code highlight]
def retriever(query: str) -> list[str]:
    return docs

@traceable(metadata={"llm": "gpt-5.4-mini"})  # [!code highlight]
def support_bot(question: str) -> str:
    context = retriever(question)
    system_message = (
        "You are a helpful customer support agent. "
        "Answer using only the information provided below:\n\n"
        + "\n".join(context)
    )
    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    support_bot("How many users can I have on the Starter plan?")
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers";
import { traceable } from "langsmith/traceable";

const client = wrapOpenAI(new OpenAI());

const docs = [
    "Acme Cloud supports unlimited users on Enterprise plans. Starter plans are limited to 5 users.",
    "To reset your password, click 'Forgot password' on the login page and follow the instructions sent to your email.",
    "API rate limits are 1,000 requests per hour on the Starter plan and 10,000 requests per hour on Enterprise.",
];

const retriever = traceable(  // [!code highlight]
    function retriever(query: string): string[] {  // [!code highlight]
        return docs;  // [!code highlight]
    },  // [!code highlight]
    { run_type: "retriever" }  // [!code highlight]
);  // [!code highlight]

const supportBot = traceable(
    async function supportBot(question: string): Promise<string> {
        const context = await retriever(question);
        const systemMessage =
            "You are a helpful customer support agent. " +
            "Answer using only the information provided below:\n\n" +
            context.join("\n");
        const response = await client.chat.completions.create({
            model: "gpt-5.4-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: question },
            ],
        });
        return response.choices[0].message?.content ?? "";
    },
    { metadata: { llm: "gpt-5.4-mini" } }  // [!code highlight]
);

(async () => {
    await supportBot("How many users can I have on the Starter plan?");
})();
```两个元数据值都出现在跟踪上。您可以使用 **运行** 表中的过滤控件按元数据过滤运行。

## 生产

凭借强大的可观察性，您可以放心地交付生产。在生产中，您的流量明显增加，并且无法单独检查每个跟踪。 LangSmith 提供监控工具来帮助您了解聚合行为并在出现问题时进行深入分析。

### 监控

选择您的代理，然后在侧栏中选择“**监控**”。在**环境**下选择[environment](/langsmith/agent-environments)。图表显示该环境随时间变化的指标，包括跟踪计数、延迟、错误率、反馈分数和成本。有关可用指标和图表配置的更多信息，请参阅[Dashboards](/langsmith/dashboards)。

![LangSmith UI showing the monitoring page with the trace count chart and available tabs.](https://mintcdn.com/langchain-5e9cc07a/EKYgNtnIIDPnseTv/langsmith/images/monitoring-page-light.png?fit=max\&auto=format\&n=EKYgNtnIIDPnseTv\&q=85\&s=43b082b4db51b58f74d98d4d99f747cc)

### A/B 测试

> [!注意]
>
> 分组依据功能需要给定元数据键至少有两个不同的值。由于您一直在记录 `llm` 元数据属性，因此您可以按该属性对监控图表进行分组，以比较模型随时间的变化情况。从 UI 侧栏中的 **监控**，单击左上角的 **分组依据**，从下拉列表中选择 **元数据**，然后选择 `llm`。图表会更新以显示按该属性分组的结果。有关分组和自定义图表的更多信息，请参阅[Dashboards](/langsmith/dashboards)。

### 深入分析

当监控图表显示意外情况时，单击数据点以冻结工具提示，然后单击指标名称（例如，**输入**）以跳转到该时间窗口的已筛选运行表。有关搜索和过滤运行的更多信息，请参阅[Filter traces](/langsmith/filter-traces)。

![LangSmith UI showing the monitoring page with a specific point on the Input Tokens chart highlighted.](https://mintcdn.com/langchain-5e9cc07a/EKYgNtnIIDPnseTv/langsmith/images/drilldown-monitoring-light.png?fit=max\&auto=format\&n=EKYgNtnIIDPnseTv\&q=85\&s=d3e8433d168cfdd019822b93d05f4420)

## 结论

在本教程中，您在代理的整个开发生命周期中添加了 LangSmith 可观察性。帮助您在原型设计过程中快速迭代的相同跟踪设置将继续在生产中提供价值。您将可以看到各个跟踪和聚合性能趋势。

有关更多信息，请参阅：

* [Observability concepts](/langsmith/observability-concepts)：术语和核心思想。
* [Tracing integrations](/langsmith/integrations)：LangChain、LangGraph、Anthropic 和其他提供商。
* [Automations](/langsmith/rules)：在您的轨迹上自动运行的规则和在线评估。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-llm-tutorial.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。