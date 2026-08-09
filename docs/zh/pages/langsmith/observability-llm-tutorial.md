<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace an LLM application tutorial | https://docs.langchain.com/langsmith/observability-llm-tutorial -->

#追踪LLM申请教程

将 LangSmith 可观察性添加到跨原型设计、beta 测试和生产的 LLM 应用程序中。

在本教程中，您将使用检索增强生成 (RAG) 构建客户支持聊天机器人，并在从早期原型设计到生产的每个开发阶段添加 LangSmith 可观察性。

到最后，您将知道如何：

* 跟踪各个 LLM 调用和完整的申请流程。
* 收集并查询用户反馈。
* 记录元数据并将其用于过滤和 A/B 测试。
* 使用监控仪表板来跟踪生产绩效。

该应用程序将检索相关文档片段并使用它们来回答用户问题。本教程中对检索器进行了模拟；在实际的应用程序中，您可以将其替换为矢量搜索或类似的内容。

## 先决条件

在开始之前，请确保您拥有：

* **LangSmith 帐户**：在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-observability-llm-tutorial) 注册或登录。
* **LangSmith API 密钥**：遵循 [Create an API key](/langsmith/create-account-api-key) 指南。
* **OpenAI API 密钥**：从 [OpenAI dashboard](https://platform.openai.com/account/api-keys) 生成。
* **LangSmith CLI**（可选）：安装以检查来自终端的跟踪。有关说明，请参阅[LangSmith CLI](/langsmith/langsmith-cli)。

安装所需的软件包：

<CodeGroup>
  ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langsmith openai
  ``````bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langsmith openai
  npm install -D typescript tsx
  ```
</CodeGroup>

## 原型设计

从一开始就设置可观察性可以让您更快地迭代。您可以准确地看到发送到模型的内容、返回的内容以及时间花费在哪里，而无需添加打印语句或运行调试器。

### 设置您的环境

在 shell 中设置以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="<your-api-key>"
export OPENAI_API_KEY="<your-openai-api-key>"
```

要将跟踪发送到特定项目，请使用[⟦T13⟧ environment variable](/langsmith/log-traces-to-project)。如果未设置，LangSmith 将在跟踪摄取时自动创建默认跟踪项目。

<Note>
  您可能会在其他地方看到这些变量被引用为 `LANGCHAIN_*`。两者都可以，但推荐名称为 `LANGSMITH_TRACING` 和 `LANGSMITH_API_KEY`。
</Note>

### 跟踪 LLM 通话

首先跟踪实际调用模型的 OpenAI 调用。这使您可以立即查看应用程序发送的提示和模型返回的响应。

使用 [⟦T17⟧](https://reference.langchain.com/python/langsmith/wrappers/_openai/wrap_openai) (Python) 或 [⟦T18⟧](https://reference.langchain.com/javascript/langsmith/wrappers/wrapOpenAI) (TypeScript) 包装 OpenAI 客户端。使用以下代码创建一个名为 `app.py` （或 `app.ts`）的文件：

<CodeGroup>
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
</CodeGroup>

调用 `support_bot("How many users can I have on the Starter plan?")` 会产生 OpenAI 调用的痕迹。

### 跟踪整个管道跟踪 LLM 调用很有用，但跟踪完整的管道（包括检索）可以让您全面了解应用程序的行为。将 [⟦T22⟧](https://reference.langchain.com/python/langsmith/run_helpers/traceable) (Python) 或 [⟦T23⟧](https://reference.langchain.com/javascript/langsmith/traceable) (TypeScript) 添加到 main 函数中：

<CodeGroup>
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
</CodeGroup>

调用 `support_bot("How many users can I have on the Starter plan?")` 现在会生成完整 RAG 管道的跟踪。

<img alt="LangSmith UI showing a trace with an outer application span and a nested LLM call span." />

<img alt="LangSmith UI showing a trace with an outer application span and a nested LLM call span." />

### 从终端检查您的痕迹

如果您安装了 [LangSmith CLI](/langsmith/langsmith-cli)，请在不打开 UI 的情况下列出项目的最新跟踪：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith trace list --project <your-project> --limit 5
```

要查看特定跟踪的完整运行层次结构和输入/输出：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
langsmith trace get <trace-id> --full
```

## Beta 测试

一旦您的应用程序在原型设计中运行良好，您就可以将其发布给一小群真实用户。在这个阶段，您通常不确切地知道用户将如何与您的应用程序交互，因此您需要更丰富的可观察性。您不仅想了解应用程序做了什么，还想了解用户对其的反应。

### 收集反馈

将 [user feedback](/langsmith/attach-user-feedback) 链接到特定跟踪可以让您确定哪些响应是有帮助的或无帮助的。更新上一步中的 `app.py` （或 `app.ts`），为每个调用添加运行 ID，并在之后附加分数：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os  # [!code highlight]

  from openai import OpenAI
  from langsmith import traceable, Client, uuid7  # [!code highlight]
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
      # Feedback requires the UUID of the tracing project that owns the run  # [!code highlight]
      project_name = os.environ.get("LANGSMITH_PROJECT", "default")  # [!code highlight]
      session_id = ls_client.create_project(project_name=project_name, upsert=True).id  # [!code highlight]
      ls_client.create_feedback(  # [!code highlight]
          run_id, key="user-score", score=1.0, session_id=session_id  # [!code highlight]
      )  # [!code highlight]
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";
  import { wrapOpenAI } from "langsmith/wrappers";
  import { traceable, getCurrentRunTree } from "langsmith/traceable"; // [!code highlight]
  import { Client } from "langsmith"; // [!code highlight]

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
  let capturedProjectName: string; // [!code highlight]

  const supportBot = traceable(async function supportBot(question: string): Promise<string> {
      const runTree = getCurrentRunTree(); // [!code highlight]
      capturedRunId = runTree.id; // [!code highlight]
      capturedProjectName = runTree.project_name; // [!code highlight]
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
      // Feedback requires the UUID of the tracing project that owns the run // [!code highlight]
      const { id: sessionId } = await lsClient.createProject({ // [!code highlight]
          projectName: capturedProjectName, // [!code highlight]
          upsert: true, // [!code highlight]
      }); // [!code highlight]
      await lsClient.createFeedback({ // [!code highlight]
          runId: capturedRunId, // [!code highlight]
          sessionId, // [!code highlight]
          key: "user-score", // [!code highlight]
          score: 1.0, // [!code highlight]
      }); // [!code highlight]
      await lsClient.flush(); // [!code highlight]
  })();
  ```
</CodeGroup><Note>
  在生产中，这两个部分将位于不同的位置：`support_bot` 与 `run_id` 的调用保留在您的应用程序中，`create_feedback` 移动到接收用户反馈的端点（例如，`/feedback` API 路由）。 `run_id` 从一个传递到另一个，以便反馈可以链接到正确的跟踪。由于反馈还需要项目 UUID，因此将 `session_id` 与 `run_id` 一起传递。
</Note>

当您在 UI 中检查运行时，反馈将显示在 **反馈** 选项卡中。然后，您可以使用 **运行** 表中的过滤控件按反馈分数过滤运行。

### 记录元数据

[Metadata](/langsmith/add-metadata-tags) 允许您使用对过滤和比较有用的属性来标记运行。例如，使用了哪个型号版本或哪个用户提出了请求。

以下示例跟踪检索器（使用 `run_type="retriever"`）和主函数（使用模型名称的 `metadata` 属性）：

<CodeGroup>
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
  ```
</CodeGroup>

两个元数据值都出现在跟踪上。您可以使用 **运行** 表中的过滤控件按元数据过滤运行。

＃＃ 生产凭借强大的可观察性，您可以放心地交付生产。在生产中，您的流量明显增加，并且无法单独检查每个跟踪。 LangSmith 提供监控工具来帮助您了解聚合行为并在出现问题时进行深入分析。

### 监控

在 UI 侧栏中，选择 **监控**，然后从左上角的下拉列表中选择一个跟踪项目。图表显示项目随时间变化的关键指标，包括跟踪计数、延迟、错误率、反馈分数和成本。有关可用指标和图表配置的更多信息，请参阅[Dashboards](/langsmith/dashboards)。

<img alt="LangSmith UI showing the monitoring page with the trace count chart and available tabs." />

<img alt="LangSmith UI showing the monitoring page with the trace count chart and available tabs." />

### A/B 测试

<Note>
  分组依据功能需要给定元数据键至少有两个不同的值。
</Note>

由于您一直在记录 `llm` 元数据属性，因此您可以按该属性对监控图表进行分组，以比较模型随时间的变化情况。在 UI 侧边栏中的 **监控** 中，单击左上角的 **分组依据**，从下拉列表中选择 **元数据**，然后选择 `llm`。图表会更新以显示按该属性分组的结果。有关分组和自定义图表的更多信息，请参阅[Dashboards](/langsmith/dashboards)。

### 深入分析当监控图表显示意外情况时，单击数据点以冻结工具提示，然后单击指标名称（例如，**输入**）以跳转到该时间窗口的筛选运行表。有关搜索和过滤运行的更多信息，请参阅[Filter traces](/langsmith/filter-traces-in-application)。

<img alt="LangSmith UI showing the monitoring page with a specific point on the Input Tokens chart highlighted." />

<img alt="LangSmith UI showing the monitoring page with a specific point on the Input Tokens chart highlighted." />

## 结论

在本教程中，您向应用程序的整个开发生命周期添加了 LangSmith 可观察性。帮助您在原型设计过程中快速迭代的相同跟踪设置将继续在生产中提供价值。您将可以了解各个跟踪和聚合性能趋势。

有关更多信息，请参阅：

* [Observability concepts](/langsmith/observability-concepts)：术语和核心思想。
* [Tracing integrations](/langsmith/integrations)：LangChain、LangGraph、Anthropic 等提供商。
* [Automations](/langsmith/rules)：在您的轨迹上自动运行的规则和在线评估。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/observability-llm-tutorial.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>