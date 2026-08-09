<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace LangChain applications (Python and JS/TS) | https://docs.langchain.com/langsmith/trace-with-langchain -->

# 追踪 LangChain 应用程序（Python 和 JS/TS）

LangSmith 与 LangChain（Python 和 JavaScript）无缝集成，LangChain 是用于构建 LLM 应用程序的流行开源框架。

## 安装

针对 Python 或 JS 安装以下内容（代码片段使用 OpenAI 集成）。

有关可用软件包的完整列表，请参阅[LangChain docs](/oss/python/integrations/providers/overview)。

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain_openai
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/openai @langchain/core
  ```

  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/openai @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/openai @langchain/core
  ```
</CodeGroup>

## 快速开始

### 1.配置您的环境

```bash wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
# This example uses OpenAI, but you can use any LLM provider of choice
export OPENAI_API_KEY=<your-openai-api-key>
# For LangSmith API keys linked to multiple workspaces, set the LANGSMITH_WORKSPACE_ID environment variable to specify which workspace to use.
export LANGSMITH_WORKSPACE_ID=<your-workspace-id>
```

<Note>
  如果您的帐户位于美国以外的区域（默认），还需将 `LANGSMITH_ENDPOINT` 设置为您所在区域的 API URL。如果没有这个，您的 API 密钥将不会被识别，并且请求将无法通过身份验证。

  <table>
    <thead>
      <tr>
        <th>地区</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>GCP 美国</td>
      </tr>

      <tr>
        <td>GCP 欧盟</td>
      </tr>

      <tr>
        <td>GCP 亚太地区</td>
      </tr>

      <tr>
        <td>AWS 美国</td>
      </tr>
    </tbody>
  </table>

  例如，欧盟账户：`export LANGSMITH_ENDPOINT="https://eu.api.smith.langchain.com"`。不要在 URL 中添加尾部斜杠，因为这可能会导致身份验证错误。
</Note><Info>
  如果您将 LangChain.js 与 LangSmith 一起使用并且不在无服务器环境中，我们还建议显式设置以下内容以减少延迟：

  `export LANGCHAIN_CALLBACKS_BACKGROUND=true`

  如果您处于无服务器环境中，我们建议相反设置以允许跟踪在函数结束之前完成：

  `export LANGCHAIN_CALLBACKS_BACKGROUND=false`
</Info>

### 2. 记录跟踪

不需要额外的代码即可将跟踪记录到 LangSmith。只需像平常一样运行 LangChain 代码即可。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_openai import ChatOpenAI
  from langchain_core.prompts import ChatPromptTemplate
  from langchain_core.output_parsers import StrOutputParser

  prompt = ChatPromptTemplate.from_messages([
      ("system", "You are a helpful assistant. Please respond to the user's request only based on the given context."),
      ("user", "Question: {question}\nContext: {context}")
  ])

  model = ChatOpenAI(model="gpt-5.4-mini")
  output_parser = StrOutputParser()
  chain = prompt | model | output_parser

  question = "Can you summarize this morning's meetings?"
  context = "During this morning's meeting, we solved all world conflict."

  chain.invoke({"question": question, "context": context})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { ChatPromptTemplate } from "@langchain/core/prompts";
  import { StringOutputParser } from "@langchain/core/output_parsers";

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant. Please respond to the user's request only based on the given context."],
    ["user", "Question: {question}\nContext: {context}"],
  ]);

  const model = new ChatOpenAI({ modelName: "gpt-5.4-mini" });
  const outputParser = new StringOutputParser();
  const chain = prompt.pipe(model).pipe(outputParser);

  const question = "Can you summarize this morning's meetings?"
  const context = "During this morning's meeting, we solved all world conflict."

  await chain.invoke({ question: question, context: context });
  ```
</CodeGroup>

### 3.查看您的踪迹

默认情况下，跟踪将记录到名为 `default` 的项目中。

## 有选择地跟踪

[previous section](#quick-start) 展示了如何通过设置单个环境变量来跟踪应用程序中 LangChain 可运行对象的所有调用。虽然这是一种方便的入门方法，但您可能只想跟踪应用程序的特定调用或部分。

在 Python 中，有两种方法可以实现此目的：手动传入 `LangChainTracer` 实例作为 [callback](https://reference.langchain.com/python/langchain_core/callbacks/)，或者使用 [⟦T38⟧ context manager](https://reference.langchain.com/python/langsmith/observability/sdk/run_helpers/#langsmith.run_helpers.tracing_context)。

在 JS/TS 中，您可以传递 [⟦T39⟧](https://reference.langchain.com/javascript/classes/_langchain_core.tracers_tracer_langchain.LangChainTracer.html) 实例作为回调。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # You can opt-in to specific invocations..
  import langsmith as ls

  with ls.tracing_context(enabled=True):
      chain.invoke({"question": "Am I using a callback?", "context": "I'm using a callback"})

  # This will NOT be traced (assuming LANGSMITH_TRACING is not set)
  chain.invoke({"question": "Am I being traced?", "context": "I'm not being traced"})

  # This would not be traced, even if LANGSMITH_TRACING=true
  with ls.tracing_context(enabled=False):
      chain.invoke({"question": "Am I being traced?", "context": "I'm not being traced"})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // You can configure a LangChainTracer instance to trace a specific invocation.
  import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

  const tracer = new LangChainTracer();
  await chain.invoke(
    {
      question: "Am I using a callback?",
      context: "I'm using a callback"
    },
    { callbacks: [tracer] }
  );
  ```
</CodeGroup>

## 登录到特定项目

### 静态正如[tracing conceptual guide](/langsmith/observability-concepts)中提到的，LangSmith 使用项目的概念对跟踪进行分组。如果未指定，跟踪器项目将设置为默认值。您可以设置 `LANGSMITH_PROJECT` 环境变量来为整个应用程序运行配置自定义项目名称。这应该在执行您的应用程序之前完成。

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_PROJECT=my-project
```

<Warning>
  `LANGSMITH_PROJECT` 标志仅在 JS SDK 版本 >= 0.2.16 中受支持，如果您使用的是旧版本，请使用 `LANGCHAIN_PROJECT` 代替。
</Warning>

### 动态地

这很大程度上是基于 [previous section](#trace-selectively) 构建的，并允许您为特定的 `LangChainTracer` 实例设置项目名称或作为 Python 中 `tracing_context` 上下文管理器的参数。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # You can set the project name using the project_name parameter.
  import langsmith as ls

  with ls.tracing_context(project_name="My Project", enabled=True):
      chain.invoke({"question": "Am I using a context manager?", "context": "I'm using a context manager"})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // You can set the project name for a specific tracer instance:
  import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";

  const tracer = new LangChainTracer({ projectName: "My Project" });
  await chain.invoke(
    {
      question: "Am I using a callback?",
      context: "I'm using a callback"
    },
    { callbacks: [tracer] }
  );
  ```
</CodeGroup>

## 将元数据和标签添加到跟踪中

您可以通过在 [⟦T45⟧](https://reference.langchain.com/python/langchain_core/runnables/?h=runnablecon#langchain_core.runnables.RunnableConfig) 中提供任意元数据和标签来注释您的跟踪。这对于将附加信息与跟踪相关联非常有用，例如执行跟踪的环境或启动跟踪的用户。有关如何通过元数据和标签查询跟踪和运行的信息，请参阅[Query traces (SDK)](/langsmith/export-traces)<Note>
  当您将元数据或标签附加到可运行时（通过 [⟦T46⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 或在运行时使用调用参数），它们将被该可运行的所有子可运行继承。
</Note>

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_openai import ChatOpenAI
  from langchain_core.prompts import ChatPromptTemplate
  from langchain_core.output_parsers import StrOutputParser

  prompt = ChatPromptTemplate.from_messages([
      ("system", "You are a helpful AI."),
      ("user", "{input}")
  ])

  # The tag "model-tag" and metadata {"model-key": "model-value"} will be attached to the ChatOpenAI run only
  chat_model = ChatOpenAI().with_config({"tags": ["model-tag"], "metadata": {"model-key": "model-value"}})
  output_parser = StrOutputParser()

  # Tags and metadata can be configured with RunnableConfig
  chain = (prompt | chat_model | output_parser).with_config({"tags": ["config-tag"], "metadata": {"config-key": "config-value"}})

  # Tags and metadata can also be passed at runtime
  chain.invoke({"input": "What is the meaning of life?"}, {"tags": ["invoke-tag"], "metadata": {"invoke-key": "invoke-value"}})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { ChatPromptTemplate } from "@langchain/core/prompts";
  import { StringOutputParser } from "@langchain/core/output_parsers";

  const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful AI."],
      ["user", "{input}"]
  ])

  // The tag "model-tag" and metadata {"model-key": "model-value"} will be attached to the ChatOpenAI run only
  const model = new ChatOpenAI().withConfig({ tags: ["model-tag"], metadata: { "model-key": "model-value" } });
  const outputParser = new StringOutputParser();

  // Tags and metadata can be configured with RunnableConfig
  const chain = (prompt.pipe(model).pipe(outputParser)).withConfig({"tags": ["config-tag"], "metadata": {"config-key": "top-level-value"}});

  // Tags and metadata can also be passed at runtime
  await chain.invoke({input: "What is the meaning of life?"}, {tags: ["invoke-tag"], metadata: {"invoke-key": "invoke-value"}})
  ```
</CodeGroup>

## 自定义运行名称

在调用或流式传输 LangChain 代码时，您可以通过在 [Config](https://reference.langchain.com/python/langchain_core/runnables/?h=runnablecon#langchain_core.runnables.RunnableConfig) 中提供给定运行的名称来自定义它。该名称用于标识 LangSmith 中的运行，并可用于过滤和分组运行。该名称还用作 LangSmith UI 中运行的标题。这可以通过在构造时在 [⟦T48⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 对象中设置 `run_name` 或在 JS/TS 中的调用参数中传递 `run_name` 来完成。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # When tracing within LangChain, run names default to the class name of the traced object (e.g., 'ChatOpenAI').
  configured_chain = chain.with_config({"run_name": "MyCustomChain"})
  configured_chain.invoke({"input": "What is the meaning of life?"})

  # You can also configure the run name at invocation time, like below
  chain.invoke({"input": "What is the meaning of life?"}, {"run_name": "MyCustomChain"})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  // When tracing within LangChain, run names default to the class name of the traced object (e.g., 'ChatOpenAI').
  const configuredChain = chain.withConfig({ runName: "MyCustomChain" });
  await configuredChain.invoke({ input: "What is the meaning of life?" });

  // You can also configure the run name at invocation time, like below
  await chain.invoke({ input: "What is the meaning of life?" }, {runName: "MyCustomChain"})
  ```
</CodeGroup>

<Note>
  `run_name` 参数仅更改您调用的可运行对象的名称（例如，链、函数）。它不会重命名当您调用 LLM 对象（如 [⟦T51⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI) (`gpt-5.4-mini`)）时自动创建的嵌套运行。在示例中，封闭的运行将在 LangSmith 中显示为 `MyCustomChain`，而嵌套的 LLM 运行仍显示模型的默认名称。

  要给 LLM 运行一个更有意义的名称，您可以：* 将模型包装在另一个可运行的文件中，并为该步骤分配一个 `run_name`。
  * 使用跟踪装饰器或帮助器（例如，Python 中的 `@traceable`，或 JS/TS 中的 `langsmith` 中的 `traceable`）围绕模型调用创建自定义运行。
</Note>

## 覆盖跟踪中的模型名称

在追踪LangChain模型调用时，LangSmith会自动捕获API调用中使用的模型标识符。但是，出于组织目的或区分不同的模型配置，您可能希望在跟踪中显示不同的、更具描述性的名称。您可以通过在构建或配置 LangChain 模型时传递 `ls_model_name` [metadata parameter](/langsmith/ls-metadata-parameters#ls_model_name) 来实现此目的。

这在以下情况下特别有用：

* 使用自托管或本地模型，其中模型 ID 可能不具有描述性。
* 使用相同型号不同配置并希望在痕迹中区分它们。
* 为模型创建别名，使跟踪对您的团队来说更具可读性。
* 标准化不同部署环境中的模型名称。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_openai import ChatOpenAI
  from langchain_ollama import ChatOllama

  # Override model name for a local model
  llm = ChatOllama(
      model="llama2:13b-chat",  # Actual model ID
      metadata={"ls_model_name": "llama2-13b-production"}  # Name shown in LangSmith
  )

  # Or with OpenAI to distinguish configurations
  llm_creative = ChatOpenAI(
      model="gpt-5.5",
      temperature=0.9,
      metadata={"ls_model_name": "gpt-5.4-creative"}
  )

  llm_factual = ChatOpenAI(
      model="gpt-5.5",
      temperature=0.1,
      metadata={"ls_model_name": "gpt-5.4-factual"}
  )

  # The metadata is inherited when the model is used in a chain
  result = llm.invoke("What is the meaning of life?")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { ChatOllama } from "@langchain/ollama";

  // Override model name for a local model
  const llm = new ChatOllama({
    model: "llama2:13b-chat",  // Actual model ID
    metadata: { ls_model_name: "llama2-13b-production" }  // Name shown in LangSmith
  });

  // Or with OpenAI to distinguish configurations
  const llmCreative = new ChatOpenAI({
    modelName: "gpt-5.5",
    temperature: 0.9,
    metadata: { ls_model_name: "gpt-5.4-creative" }
  });

  const llmFactual = new ChatOpenAI({
    modelName: "gpt-5.5",
    temperature: 0.1,
    metadata: { ls_model_name: "gpt-5.4-factual" }
  });

  // The metadata is inherited when the model is used in a chain
  const result = await llm.invoke("What is the meaning of life?");
  ```
</CodeGroup>当您在模型的元数据中传递 `ls_model_name` 时，该名称将出现在涉及该模型实例的所有跟踪的 LangSmith UI 中。这适用于任何 LangChain 聊天模型或 LLM，并且由使用该模型的所有运行继承，包括当它是链的一部分时。

<Note>
  `ls_model_name` 元数据参数也用于[cost tracking](/langsmith/cost-tracking)。与 `ls_provider` 参数结合使用时，LangSmith 可以自动计算自定义或自托管模型的成本。有关所有可用元数据参数的更多信息，请参阅[metadata parameters reference](/langsmith/ls-metadata-parameters)。
</Note>

## 自定义运行ID

在调用或流式传输 LangChain 代码时，您可以通过在[Config](https://reference.langchain.com/python/langchain_core/runnables/?h=runnablecon#langchain_core.runnables.RunnableConfig)中提供给定运行的 ID 进行自定义。此 ID 用于唯一标识 LangSmith 中的运行，并可用于查询特定运行。 ID 对于跨不同系统链接运行或实现自定义跟踪逻辑非常有用。这可以通过在构造时在 [⟦T63⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 对象中设置 `run_id` 或在调用参数中传递 `run_id` 来完成。

<Note>
  LLM 对象目前不直接支持此功能。
</Note>

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import uuid

  my_uuid = uuid.uuid4()

  # You can configure the run ID at invocation time:
  chain.invoke({"input": "What is the meaning of life?"}, {"run_id": my_uuid})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const myUuid = crypto.randomUUID();

  // You can configure the run ID at invocation time, like below
  await chain.invoke({ input: "What is the meaning of life?" }, { runId: myUuid });
  ```
</CodeGroup>请注意，如果您在跟踪的 **根** 处执行此操作（即顶级运行，则该运行 ID 将用作 `trace_id`）。

## 访问 LangChain 调用的运行（跨度）ID

当您调用LangChain对象时，您可以手动指定调用的运行ID。该运行 ID 可用于查询 LangSmith 中的运行。

在 JS/TS 中，您可以使用 `RunCollectorCallbackHandler` 实例来访问运行 ID。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import uuid

  from langchain_openai import ChatOpenAI
  from langchain_core.prompts import ChatPromptTemplate
  from langchain_core.output_parsers import StrOutputParser

  prompt = ChatPromptTemplate.from_messages([
      ("system", "You are a helpful assistant. Please respond to the user's request only based on the given context."),
      ("user", "Question: {question}\n\nContext: {context}")
  ])
  model = ChatOpenAI(model="gpt-5.4-mini")
  output_parser = StrOutputParser()

  chain = prompt | model | output_parser

  question = "Can you summarize this morning's meetings?"
  context = "During this morning's meeting, we solved all world conflict."
  my_uuid = uuid.uuid4()
  result = chain.invoke({"question": question, "context": context}, {"run_id": my_uuid})
  print(my_uuid)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { ChatOpenAI } from "@langchain/openai";
  import { ChatPromptTemplate } from "@langchain/core/prompts";
  import { StringOutputParser } from "@langchain/core/output_parsers";
  import { RunCollectorCallbackHandler } from "@langchain/core/tracers/run_collector";

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant. Please respond to the user's request only based on the given context."],
    ["user", "Question: {question}\n\nContext: {context}"],
  ]);
  const model = new ChatOpenAI({ modelName: "gpt-5.4-mini" });
  const outputParser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);
  const runCollector = new RunCollectorCallbackHandler();

  const question = "Can you summarize this morning's meetings?"
  const context = "During this morning's meeting, we solved all world conflict."
  await chain.invoke(
      { question: question, context: context },
      { callbacks: [runCollector] }
  );
  const runId = runCollector.tracedRuns[0].id;
  console.log(runId);
  ```
</CodeGroup>

## 确保退出前所有跟踪都已提交

在LangChain Python中，LangSmith的跟踪是在后台线程中完成的，以避免阻碍您的生产应用程序。这意味着您的进程可能会在所有跟踪成功发布到 LangSmith 之前结束。这在无服务器环境中尤其普遍，在这种环境中，一旦链或代理完成，您的虚拟机可能会立即终止。

您可以通过将 `LANGCHAIN_CALLBACKS_BACKGROUND` 环境变量设置为 `"false"` 来使回调同步。

对于这两种语言，LangChain 都公开了在退出应用程序之前等待跟踪提交的方法。下面是一个例子：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_openai import ChatOpenAI
  from langchain_core.tracers.langchain import wait_for_all_tracers

  llm = ChatOpenAI()

  try:
    llm.invoke("Hello, World!")
  finally:
    wait_for_all_tracers()
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { awaitAllCallbacks } from "@langchain/core/callbacks/promises";

  try {
      const llm = new ChatOpenAI();
      const response = await llm.invoke("Hello, World!");
  } catch (e) {
      // handle error
  } finally {
      await awaitAllCallbacks();
  }
  ```
</CodeGroup>

## 不设置环境变量的跟踪正如其他指南中提到的，以下环境变量允许您配置启用跟踪、api 端点、api 密钥和跟踪项目：

* `LANGSMITH_TRACING`
* `LANGSMITH_API_KEY`
* `LANGSMITH_ENDPOINT`
* `LANGSMITH_PROJECT`

但是，在某些环境中，无法设置环境变量。在这些情况下，您可以通过编程方式设置跟踪配置。

这很大程度上是基于 [previous section](#trace-selectively) 构建的。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import langsmith as ls

  # You can create a client instance with an api key and api url
  client = ls.Client(
      api_key="YOUR_API_KEY",  # This can be retrieved from a secrets manager
      api_url="https://api.smith.langchain.com",  # Self-hosted, GCP EU (`eu.api...`), GCP APAC (`apac.api...`), or AWS US (`aws.api...`) as needed
  )

  # You can pass the client and project_name to the tracing_context
  with ls.tracing_context(client=client, project_name="test-no-env", enabled=True):
      chain.invoke({"question": "Am I using a callback?", "context": "I'm using a callback"})
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
  import { Client } from "langsmith";

  // You can create a client instance with an api key and api url
  const client = new Client(
      {
          apiKey: "YOUR_API_KEY",
          apiUrl: "https://api.smith.langchain.com", // Self-hosted, GCP EU (`eu.api...`), GCP APAC (`apac.api...`), or AWS US (`aws.api...`) as needed
      }
  );

  // You can pass the client and project_name to the LangChainTracer instance
  const tracer = new LangChainTracer({client, projectName: "test-no-env"});
  await chain.invoke(
    {
      question: "Am I using a callback?",
      context: "I'm using a callback",
    },
    { callbacks: [tracer] }
  );
  ```
</CodeGroup>

## 使用 LangChain 进行分布式追踪 (Python)

LangSmith 支持使用 LangChain Python 进行分布式跟踪。这允许您跨不同的服务和应用程序链接运行（跨度）。其原理与 LangSmith SDK 的[distributed tracing guide](/langsmith/distributed-tracing)类似。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import langsmith
from langchain_core.runnables import chain
from langsmith.run_helpers import get_current_run_tree

# -- This code should be in a separate file or service --
@chain
def child_chain(inputs):
    return inputs["test"] + 1

def child_wrapper(x, headers):
    with langsmith.tracing_context(parent=headers):
        child_chain.invoke({"test": x})

# -- This code should be in a separate file or service --
@chain
def parent_chain(inputs):
    rt = get_current_run_tree()
    headers = rt.to_headers()
    # ... make a request to another service with the headers
    # The headers should be passed to the other service, eventually to the child_wrapper function

parent_chain.invoke({"test": 1})
```

## LangChain (Python) 和 LangSmith SDK 之间的互操作性

如果您的应用程序的一部分使用LangChain，其他部分使用LangSmith SDK（参见[Custom instrumentation](/langsmith/annotate-code)），您仍然可以无缝跟踪整个应用程序。

LangChain 对象在 `traceable` 函数中调用时将被跟踪，并被绑定为 `traceable` 函数的子运行。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langsmith import traceable

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Please respond to the user's request only based on the given context."),
    ("user", "Question: {question}\nContext: {context}")
])

model = ChatOpenAI(model="gpt-5.4-mini")
output_parser = StrOutputParser()
chain = prompt | model | output_parser

# The above chain will be traced as a child run of the traceable function
@traceable(
    tags=["openai", "chat"],
    metadata={"foo": "bar"}
)
def invoke_runnnable(question, context):
    result = chain.invoke({"question": question, "context": context})
    return "The response is: " + result

invoke_runnnable("Can you summarize this morning's meetings?", "During this morning's meeting, we solved all world conflict.")
```

这将产生以下跟踪树：<img alt="Trace tree python interop" />

## LangChain.JS 和 LangSmith SDK 之间的互操作性### 追踪`traceable`内的LangChain对象（仅限JS）

从`langchain@0.2.x`开始，LangChain对象在`@traceable`函数内部使用时会自动被追踪，继承了可追踪函数的客户端、标签、元数据和项目名称。

对于`0.2.x`以下的旧版本LangChain，您需要手动传递从`@traceable`中找到的跟踪上下文创建的实例`LangChainTracer`。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getLangchainCallbacks } from "langsmith/langchain";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant. Please respond to the user's request only based on the given context.",
  ],
  ["user", "Question: {question}\nContext: {context}"],
]);

const model = new ChatOpenAI({ modelName: "gpt-5.4-mini" });
const outputParser = new StringOutputParser();
const chain = prompt.pipe(model).pipe(outputParser);

const main = traceable(
  async (input: { question: string; context: string }) => {
    const callbacks = await getLangchainCallbacks();
    const response = await chain.invoke(input, { callbacks });
    return response;
  },
  { name: "main" }
);
```

### 通过 `traceable` / RunTree API 跟踪 LangChain 子进程（仅限 JS）

<Note>
  我们正在努力提高`traceable`和LangChain之间的互操作性。 LangChain与`traceable`结合使用时存在以下限制：

  1. 改变从 RunnableLambda 上下文的`getCurrentRunTree()`获得的 RunTree 将导致空操作。
  2. 不鼓励通过`getCurrentRunTree()`遍历从RunnableLambda获得的RunTree，因为它可能不包含所有RunTree节点。
  3. 不同的子运行可能具有相同的`execution_order`和`child_execution_order`值。因此，在极端情况下，某些运行可能会以不同的顺序结束，具体取决于`start_time`。
</Note>在某些用例中，您可能希望将 `traceable` 函数作为 RunnableSequence 的一部分运行，或者通过 `RunTree` API 命令式跟踪 LangChain 的子运行。从 LangSmith 0.1.39 和 @langchain/core 0.2.18 开始，您可以直接在 RunnableLambda 中调用 `traceable` 包装的函数。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { traceable } from "langsmith/traceable";
import { RunnableLambda } from "@langchain/core/runnables";
import { RunnableConfig } from "@langchain/core/runnables";

const tracedChild = traceable((input: string) => `Child Run: ${input}`, {
  name: "Child Run",
});

const parrot = new RunnableLambda({
  func: async (input: { text: string }, config?: RunnableConfig) => {
    return await tracedChild(input.text);
  },
});
```

<img alt="Trace Tree" />

或者，您可以使用 `RunTree.fromRunnableConfig` 将 LangChain 的 [⟦T92⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 转换为等效的 RunTree 对象，或者将 [⟦T94⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 作为 `traceable` 包装函数的第一个参数传递。

<CodeGroup>
  ```typescript Traceable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable } from "langsmith/traceable";
  import { RunnableLambda } from "@langchain/core/runnables";
  import { RunnableConfig } from "@langchain/core/runnables";

  const tracedChild = traceable((input: string) => `Child Run: ${input}`, {
    name: "Child Run",
  });

  const parrot = new RunnableLambda({
    func: async (input: { text: string }, config?: RunnableConfig) => {
      // Pass the config to existing traceable function
      await tracedChild(config, input.text);
      return input.text;
    },
  });
  ```

  ```typescript Run Tree theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { RunTree } from "langsmith/run_trees";
  import { RunnableLambda } from "@langchain/core/runnables";
  import { RunnableConfig } from "@langchain/core/runnables";

  const parrot = new RunnableLambda({
    func: async (input: { text: string }, config?: RunnableConfig) => {
      // create the RunTree from the RunnableConfig of the RunnableLambda
      const childRunTree = RunTree.fromRunnableConfig(config, {
        name: "Child Run",
      });

      childRunTree.inputs = { input: input.text };
      await childRunTree.postRun();

      childRunTree.outputs = { output: `Child Run: ${input.text}` };
      await childRunTree.patchRun();

      return input.text;
    },
  });
  ```
</CodeGroup>

如果您更喜欢视频教程，请查看 LangSmith 简介课程中的[Alternative Ways to Trace video](https://academy.langchain.com/pages/intro-to-langsmith-preview)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-langchain.mdx) 或[file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>