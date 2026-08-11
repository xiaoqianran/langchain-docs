<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Models | https://docs.langchain.com/oss/python/langchain/models -->

# 型号

[LLMs](https://en.wikipedia.org/wiki/Large_language_model)是强大的人工智能工具，可以像人类一样解释和生成文本。他们用途广泛，足以编写内容、翻译语言、总结和回答问题，而无需针对每项任务进行专门培训。

除了文本生成之外，许多模型还支持：

* <Icon icon="hammer" /> [Tool calling](#tool-calling) - 调用外部工具（如数据库查询或 API 调用）并在其响应中使用结果。
* <Icon icon="layout-grid" /> [Structured output](#structured-output) - 模型的响应被限制为遵循定义的格式。
* <Icon icon="photo" /> [Multimodality](#multimodal) - 处理并返回除文本之外的数据，例如图像、音频和视频。
* <Icon icon="brain" /> [Reasoning](#reasoning) - 模型执行多步骤推理以得出结论。

模型是[agents](/oss/python/langchain/agents)的推理引擎。它们驱动代理的决策过程，确定调用哪些工具、如何解释结果以及何时提供最终答案。

您选择的模型的质量和功能直接影响代理的基线可靠性和性能。不同的模型擅长不同的任务——一些模型更擅长遵循复杂的指令，另一些模型更擅长结构化推理，还有一些模型支持更大的上下文窗口来处理更多信息。LangChain 的标准模型接口使您可以访问许多不同的提供商集成，这使得您可以轻松地试验模型并在模型之间切换，以找到最适合您的用例的模型。

有关特定于提供商的集成信息和功能，请参阅提供商的 [chat model page](/oss/python/integrations/chat)。

<Tip>
  [LangSmith](/langsmith/observability) 跟踪每个模型调用，以便您可以比较提供程序、检查工具路由和调试故障。按照[tracing quickstart](/langsmith/trace-with-langchain)进行设置。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine) 来监视您的痕迹、检测问题并提出修复建议。
</Tip>

## 基本用法

模型可以通过两种方式使用：

1. **使用代理** - 创建[agent](/oss/python/langchain/agents#model)时可以动态指定模型。
2. **独立** - 可以直接调用模型（在代理循环之外）执行文本生成、分类或提取等任务，无需代理框架。

相同的模型界面适用于两种上下文，这使您可以灵活地从简单开始并根据需要扩展到更复杂的基于代理的工作流程。

### 初始化模型在 LangChain 中开始使用独立模型的最简单方法是使用 [⟦T88⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model) 从您选择的聊天模型提供商初始化一个模型（示例如下）：

<Tabs>
  <Tab title="OpenAI">
    👉 阅读[OpenAI chat model integration docs](/oss/python/integrations/chat/openai/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[openai]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[openai]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["OPENAI_API_KEY"] = "sk-..."

      model = init_chat_model("gpt-5.5")
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openai import ChatOpenAI

      os.environ["OPENAI_API_KEY"] = "sk-..."

      model = ChatOpenAI(model="gpt-5.5")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Anthropic">
    👉 阅读[Anthropic chat model integration docs](/oss/python/integrations/chat/anthropic/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[anthropic]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[anthropic]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["ANTHROPIC_API_KEY"] = "sk-..."

      model = init_chat_model("claude-sonnet-4-6")
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_anthropic import ChatAnthropic

      os.environ["ANTHROPIC_API_KEY"] = "sk-..."

      model = ChatAnthropic(model="claude-sonnet-4-6")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Azure">
    👉 阅读[Azure chat model integration docs](/oss/python/integrations/chat/azure_chat_openai/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[openai]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[openai]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["AZURE_OPENAI_API_KEY"] = "..."
      os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
      os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

      model = init_chat_model(
          "azure_openai:gpt-5.5",
          azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openai import AzureChatOpenAI

      os.environ["AZURE_OPENAI_API_KEY"] = "..."
      os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
      os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

      model = AzureChatOpenAI(
          model="gpt-5.5",
          azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"]
      )
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Google Gemini">
    👉 阅读[Google GenAI chat model integration docs](/oss/python/integrations/chat/google_generative_ai/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[google-genai]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[google-genai]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["GOOGLE_API_KEY"] = "..."

      model = init_chat_model("google_genai:gemini-2.5-flash-lite")
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_google_genai import ChatGoogleGenerativeAI

      os.environ["GOOGLE_API_KEY"] = "..."

      model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="AWS Bedrock">
    👉 阅读[AWS Bedrock chat model integration docs](/oss/python/integrations/chat/bedrock/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[aws]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[aws]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain.chat_models import init_chat_model

      # Follow the steps here to configure your credentials:
      # https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      model = init_chat_model(
          "us.anthropic.claude-sonnet-4-6",
          model_provider="bedrock_converse",
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain_aws import ChatBedrock

      model = ChatBedrock(model="us.anthropic.claude-sonnet-4-6")
      ```
    </CodeGroup>
  </Tab>

  <Tab title="HuggingFace">
    👉 阅读[HuggingFace chat model integration docs](/oss/python/integrations/chat/huggingface/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[huggingface]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[huggingface]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

      model = init_chat_model(
          "microsoft/Phi-3-mini-4k-instruct",
          model_provider="huggingface",
          temperature=0.7,
          max_tokens=1024,
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

      os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

      llm = HuggingFaceEndpoint(
          repo_id="microsoft/Phi-3-mini-4k-instruct",
          temperature=0.7,
          max_length=1024,
      )
      model = ChatHuggingFace(llm=llm)
      ```
    </CodeGroup>
  </Tab>

  <Tab title="OpenRouter">
    👉 阅读[OpenRouter chat model integration docs](/oss/python/integrations/chat/openrouter/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain-openrouter"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain-openrouter"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model

      os.environ["OPENROUTER_API_KEY"] = "sk-..."

      model = init_chat_model(
          "auto",
          model_provider="openrouter",
      )
      ```

      ```python Model Class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openrouter import ChatOpenRouter

      os.environ["OPENROUTER_API_KEY"] = "sk-..."

      model = ChatOpenRouter(model="auto")
      ```
    </CodeGroup>
  </Tab>
</Tabs>

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response = model.invoke("Why do parrots talk?")
```有关更多详细信息，请参阅[⟦T89⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)，包括有关如何传递模型[parameters](#parameters)的信息。

### 支持的提供商和模型

LangChain 通过专用集成包支持所有主要模型提供商。每个提供程序包都实现相同的标准接口，因此您可以交换提供程序而无需重写应用程序逻辑。新模型名称立即生效 - 无需 LangChain 更新 - 因为提供程序包将模型名称直接传递到提供程序的 API。

浏览 [full list of supported providers](/oss/python/integrations/providers/overview)，或参阅 [Providers and models](/oss/python/concepts/providers-and-models) 了解提供程序、包和模型名称如何在 LangChain 中协同工作的概念概述。

### 关键方法

<Card title="Invoke" href="#invoke" icon="send">
  该模型将消息作为输入，并在生成完整响应后输出消息。
</Card>

<Card title="Stream" href="#stream" icon="broadcast">
  调用模型，但实时生成输出。
</Card>

<Card title="Batch" href="#batch" icon="grip-vertical">
  批量向模型发送多个请求，以实现更高效的处理。
</Card>

<Info>
  除了聊天模型之外，LangChain还提供对其他相邻技术的支持，例如嵌入模型和向量存储。详情请参阅[integrations page](/oss/python/integrations/providers/overview)。
</Info>

## 参数聊天模型采用可用于配置其行为的参数。支持的全套参数因型号和提供商而异，但标准参数包括：

<ParamField type="string">
  您想要与提供商一起使用的特定模型的名称或标识符。您还可以使用“:”格式在单个参数中指定模型及其提供者，例如“openai:o1”。
</ParamField>

<ParamField type="string">
  与模型提供者进行身份验证所需的密钥。这通常是在您注册访问模型时发出的。通常通过设置<Tooltip>环境变量</Tooltip>来访问。
</ParamField>

<ParamField type="number">
  控制模型输出的随机性。数字越高，反应越有创意；较低的值使它们更具确定性。
</ParamField>

<ParamField type="number">
  限制响应中<Tooltip>tokens</Tooltip>的总数，有效控制输出的长度。
</ParamField>

<ParamField type="number">
  取消请求之前等待模型响应的最长时间（以秒为单位）。
</ParamField><ParamField type="number">
  如果由于网络超时或速率限制等问题导致请求失败，系统将尝试重新发送请求的最大次数。重试使用带有抖动的指数退避。网络错误、速率限制 (429) 和服务器错误 (5xx) 会自动重试。不会重试 401（未经授权）或 404 等客户端错误。对于不可靠网络上长时间运行的 [agent](/oss/python/deepagents/overview) 任务，请考虑将其增加到 10-15。
</ParamField>

使用 [⟦T90⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)，将这些参数作为内联 <Tooltip href="https://www.w3schools.com/python/python_args_kwargs.asp">`**kwargs`</Tooltip> 传递：

```python Initialize using model parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
model = init_chat_model(
    "claude-sonnet-4-6",
    # Kwargs passed to the model:
    temperature=0.7,
    timeout=30,
    max_tokens=1000,
    max_retries=6,  # Default; increase for unreliable networks
)
```

### 连接弹性

LangChain 聊天模型会通过指数退避自动重试失败的 API 请求。默认情况下，模型针对网络错误、速率限制 (429) 和服务器错误 (5xx) 最多重试 **6 次**。不会重试 401（未经授权）或 404 等客户端错误。

您可以在创建模型时调整`max_retries`和`timeout`，然后将该实例传递给`create_agent`，`create_deep_agent`，或将其独立调用：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model

model = init_chat_model(
    "google_genai:gemini-3.6-flash",
    max_retries=10,  # Increase for unreliable networks (default: 6)
    timeout=120,  # Seconds; increase for slow connections
)
```

<Tip>
  对于不可靠网络上长时间运行的代理图，请考虑更高的 `max_retries`（例如 10-15）和 [checkpointer](/oss/python/langgraph/persistence)，以便在发生故障时保留进度。
</Tip><Info>
  每个聊天模型集成可能具有用于控制特定于提供者的功能的附加参数。

  例如，[⟦T97⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI)有`use_responses_api`来指示是否使用OpenAI响应或完成API。

  要查找给定聊天模型支持的所有参数，请前往 [chat model integrations](/oss/python/integrations/chat) 页面。
</Info>

***

## 调用

必须调用聊天模型才能生成输出。共有三种主要的调用方法，每种方法适合不同的用例。

### 调用

调用模型最直接的方法是将 [⟦T99⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel/invoke) 与单个消息或消息列表一起使用。

```python Single message theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response = model.invoke("Why do parrots have colorful feathers?")
print(response)
```

可以向聊天模型提供消息列表来表示对话历史记录。每条消息都有一个角色，模型使用该角色来指示对话中消息的发送者。

有关角色、类型和内容的更多详细信息，请参阅 [messages](/oss/python/langchain/messages) 指南。

```python Dictionary format theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
conversation = [
    {"role": "system", "content": "You are a helpful assistant that translates English to French."},
    {"role": "user", "content": "Translate: I love programming."},
    {"role": "assistant", "content": "J'adore la programmation."},
    {"role": "user", "content": "Translate: I love building applications."}
]

response = model.invoke(conversation)
print(response)  # AIMessage("J'adore créer des applications.")
```

```python Message objects theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.messages import HumanMessage, AIMessage, SystemMessage

conversation = [
    SystemMessage("You are a helpful assistant that translates English to French."),
    HumanMessage("Translate: I love programming."),
    AIMessage("J'adore la programmation."),
    HumanMessage("Translate: I love building applications.")
]

response = model.invoke(conversation)
print(response)  # AIMessage("J'adore créer des applications.")
```

<Info>
  如果您的调用的返回类型是字符串，请确保您使用的是聊天模型而不是 LLM。传统的文本完成法学硕士直接返回字符串。 LangChain 聊天模型以“Chat”为前缀，例如 [⟦T100⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI)(/oss/integrations/chat/openai)。
</Info>

### 流大多数模型可以在生成输出内容时流式传输。通过逐步显示输出，流式传输显着改善了用户体验，特别是对于较长的响应。

调用 [⟦T101⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel/stream) 返回一个 <Tooltip>iterator</Tooltip>，它在生成输出块时生成它们。您可以使用循环来实时处理每个块：

<CodeGroup>
  ```python Basic text streaming theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  for chunk in model.stream("Why do parrots have colorful feathers?"):
      print(chunk.text, end="|", flush=True)
  ```

  ```python Stream tool calls, reasoning, and other content theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  for chunk in model.stream("What color is the sky?"):
      for block in chunk.content_blocks:
          if block["type"] == "reasoning" and (reasoning := block.get("reasoning")):
              print(f"Reasoning: {reasoning}")
          elif block["type"] == "tool_call_chunk":
              print(f"Tool call chunk: {block}")
          elif block["type"] == "text":
              print(block["text"])
          else:
              ...
  ```
</CodeGroup>

与 [⟦T102⟧](#invoke) 不同，[⟦T102⟧](#invoke) 在模型完成生成完整响应后返回单个 [⟦T103⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage)，`stream()` 返回多个 [⟦T105⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessageChunk) 对象，每个对象包含输出文本的一部分。重要的是，流中的每个块都被设计为通过求和收集成完整的消息：

```python Construct an AIMessage theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
full = None  # None | AIMessageChunk
for chunk in model.stream("What color is the sky?"):
    full = chunk if full is None else full + chunk
    print(full.text)

# The
# The sky
# The sky is
# The sky is typically
# The sky is typically blue
# ...

print(full.content_blocks)
# [{"type": "text", "text": "The sky is typically blue..."}]
```

生成的消息可以被视为与使用[⟦T106⟧](#invoke)生成的消息相同，例如，它可以聚合到消息历史记录中并作为会话上下文传递回模型。

<Warning>
  仅当程序中的所有步骤都知道如何处理块流时，流式处理才有效。例如，不支持流式传输的应用程序需要将整个输出存储在内存中才能进行处理。
</Warning><Accordion title="Advanced streaming topics">
  <Accordion title="Streaming events">
    LangChain 聊天模型还可以使用 `astream_events()` 流式传输语义事件。

    这简化了基于事件类型和其他元数据的过滤，并将在后台聚合完整消息。请参阅下面的示例。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    async for event in model.astream_events("Hello"):

        if event["event"] == "on_chat_model_start":
            print(f"Input: {event['data']['input']}")

        elif event["event"] == "on_chat_model_stream":
            print(f"Token: {event['data']['chunk'].text}")

        elif event["event"] == "on_chat_model_end":
            print(f"Full message: {event['data']['output'].text}")

        else:
            pass
    ```

    ```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    Input: Hello
    Token: Hi
    Token:  there
    Token: !
    Token:  How
    Token:  can
    Token:  I
    ...
    Full message: Hi there! How can I help today?
    ```

    <Tip>
      有关事件类型和其他详细信息，请参阅[⟦T108⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.astream_events)参考。
    </Tip>
  </Accordion>

  <Accordion title="&#x22;Auto-streaming&#x22; chat models">
    LangChain 通过在某些情况下自动启用流模式来简化聊天模型的流，即使您没有显式调用流方法也是如此。当您使用非流式调用方法但仍希望流式传输整个应用程序（包括聊天模型的中间结果）时，这特别有用。

    例如，在[LangGraph agents](/oss/python/langchain/agents)中，您可以在节点内调用`model.invoke()`，但如果在流模式下运行，LangChain将自动委托给流。

    #### 它是如何工作的当您`invoke()`聊天模型时，如果LangChain检测到您正在尝试流式传输整个应用程序，它将自动切换到内部流式传输模式。就使用 invoke 的代码而言，调用的结果将是相同的；但是，当聊天模型进行流式传输时，LangChain 将负责在 LangChain 的回调系统中调用 [⟦T111⟧](https://reference.langchain.com/python/langchain-core/callbacks/base/AsyncCallbackHandler/on_llm_new_token) 事件。

    回调事件允许 LangGraph `stream()` 和 `astream_events()` 实时显示聊天模型的输出。
  </Accordion>
</Accordion>

### 批次

将一组独立请求批量发送到模型可以显着提高性能并降低成本，因为处理可以并行完成：

```python Batch theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
responses = model.batch([
    "Why do parrots have colorful feathers?",
    "How do airplanes fly?",
    "What is quantum computing?"
])
for response in responses:
    print(response)
```

<Note>
  本节介绍聊天模型方法[⟦T114⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch)，它可以并行化客户端模型调用。

  它与推理提供程序支持的批处理 API（例如[OpenAI](https://platform.openai.com/docs/guides/batch) 或 [Anthropic](https://platform.claude.com/docs/en/build-with-claude/batch-processing#message-batches-api)）**不同**。
</Note>

默认情况下，[⟦T115⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch)只会返回整个批次的最终输出。如果您想在每个单独的输入完成生成后接收其输出，您可以使用 [⟦T116⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch_as_completed) 流式传输结果：

```python Yield batch responses upon completion theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
for response in model.batch_as_completed([
    "Why do parrots have colorful feathers?",
    "How do airplanes fly?",
    "What is quantum computing?"
]):
    print(response)
```<Note>
  使用[⟦T117⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch_as_completed)时，结果可能会乱序。每个都包含用于匹配的输入索引，以根据需要重建原始顺序。
</Note>

<Tip>
  当使用[⟦T118⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch)或[⟦T119⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch_as_completed)处理大量输入时，您可能需要控制最大并行调用数。这可以通过在 [⟦T121⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 字典中设置 [⟦T120⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 属性来完成。

  ```python Batch with max concurrency theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  model.batch(
      list_of_inputs,
      config={
          'max_concurrency': 5,  # Limit to 5 parallel calls
      }
  )
  ```

  有关受支持属性的完整列表，请参阅 [⟦T122⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 参考。
</Tip>

有关批处理的更多详细信息，请参阅[reference](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch)。

***

## 工具调用

模型可以请求调用执行从数据库获取数据、搜索网络或运行代码等任务的工具。工具是以下各项的配对：

1. 模式，包括工具名称、描述和/或参数定义（通常是 JSON 模式）
2. 要执行的函数或<Tooltip>协程</Tooltip>。

<Note>
  您可能听说过“函数调用”这个术语。我们可以将其与“工具调用”互换使用。
</Note>

以下是用户和模型之间的基本工具调用流程：

```mermaid theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
sequenceDiagram
    participant U as User
    participant M as Model
    participant T as Tools

    U->>M: "What's the weather in SF and NYC?"
    M->>M: Analyze request & decide tools needed

    par Parallel Tool Calls
        M->>T: get_weather("San Francisco")
        M->>T: get_weather("New York")
    end

    par Tool Execution
        T-->>M: SF weather data
        T-->>M: NYC weather data
    end

    M->>M: Process results & generate response
    M->>U: "SF: 72°F sunny, NYC: 68°F cloudy"
```要使您定义的工具可供模型使用，您必须使用 [⟦T123⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel/bind_tools) 绑定它们。在后续调用中，模型可以根据需要选择调用任何绑定的工具。

一些模型提供者提供<Tooltip>内置工具</Tooltip>，可以通过模型或调用参数启用（例如[⟦T124⟧](/oss/python/integrations/chat/openai)、[⟦T125⟧](/oss/python/integrations/chat/anthropic)）。详情请查看相应的[provider reference](/oss/python/integrations/providers/overview)。

<Tip>
  有关创建工具的详细信息和其他选项，请参阅[tools guide](/oss/python/langchain/tools)。
</Tip>

```python Binding user tools theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool

@tool
def get_weather(location: str) -> str:
    """Get the weather at a location."""
    return f"It's sunny in {location}."


model_with_tools = model.bind_tools([get_weather])  # [!code highlight]

response = model_with_tools.invoke("What's the weather like in Boston?")
for tool_call in response.tool_calls:
    # View tool calls made by the model
    print(f"Tool: {tool_call['name']}")
    print(f"Args: {tool_call['args']}")
```

绑定用户定义的工具时，模型的响应包括执行工具的**请求**。当与[agent](/oss/python/langchain/agents)分开使用模型时，您可以执行请求的工具并将结果返回到模型以用于后续推理。使用[agent](/oss/python/langchain/agents)时，代理循环将为您处理工具执行循环。

下面，我们展示了一些使用工具调用的常见方法。

<AccordionGroup>
  <Accordion title="Tool execution loop" icon="refresh">
    当模型返回工具调用时，您需要执行工具并将结果传递回模型。这会创建一个对话循环，模型可以在其中使用工具结果生成最终响应。 LangChain 包括为您处理此编排的 [agent](/oss/python/langchain/agents) 抽象。以下是如何执行此操作的简单示例：

    ```python Tool execution loop theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Bind (potentially multiple) tools to the model
    model_with_tools = model.bind_tools([get_weather])

    # Step 1: Model generates tool calls
    messages = [{"role": "user", "content": "What's the weather in Boston?"}]
    ai_msg = model_with_tools.invoke(messages)
    messages.append(ai_msg)

    # Step 2: Execute tools and collect results
    for tool_call in ai_msg.tool_calls:
        # Execute the tool with the generated arguments
        tool_result = get_weather.invoke(tool_call)
        messages.append(tool_result)

    # Step 3: Pass results back to model for final response
    final_response = model_with_tools.invoke(messages)
    print(final_response.text)
    # "The current weather in Boston is 72°F and sunny."
    ```

    该工具返回的每个[⟦T126⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolMessage)都包含一个与原始工具调用匹配的`tool_call_id`，帮助模型将结果与请求关联起来。
  </Accordion>

  <Accordion title="Forcing tool calls" icon="asterisk">
    默认情况下，模型可以根据用户的输入自由选择要使用的绑定工具。但是，您可能想要强制选择一个工具，确保模型使用特定工具或给定列表中的**任何**工具：

    <CodeGroup>
      ```python Force use of any tool theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      model_with_tools = model.bind_tools([tool_1], tool_choice="any")
      ```

      ```python Force use of specific tools theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      model_with_tools = model.bind_tools([tool_1], tool_choice="tool_1")
      ```
    </CodeGroup>
  </Accordion>

  <Accordion title="Parallel tool calls" icon="stack-2">
    许多模型支持在适当的时候并行调用多个工具。这允许模型同时从不同来源收集信息。

    ```python Parallel tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    model_with_tools = model.bind_tools([get_weather])

    response = model_with_tools.invoke(
        "What's the weather in Boston and Tokyo?"
    )


    # The model may generate multiple tool calls
    print(response.tool_calls)
    # [
    #   {'name': 'get_weather', 'args': {'location': 'Boston'}, 'id': 'call_1'},
    #   {'name': 'get_weather', 'args': {'location': 'Tokyo'}, 'id': 'call_2'},
    # ]


    # Execute all tools (can be done in parallel with async)
    results = []
    for tool_call in response.tool_calls:
        if tool_call['name'] == 'get_weather':
            result = get_weather.invoke(tool_call)
        ...
        results.append(result)
    ```

    该模型根据所请求操作的独立性智能地确定何时适合并行执行。

    <Tip>
      大多数支持工具调用的模型默认启用并行工具调用。有些（包括[OpenAI](/oss/python/integrations/chat/openai)和[Anthropic](/oss/python/integrations/chat/anthropic)）允许您禁用此功能。为此，请设置 `parallel_tool_calls=False`：

      ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      model.bind_tools([get_weather], parallel_tool_calls=False)
      ```
    </Tip>
  </Accordion><Accordion title="Streaming tool calls" icon="rss">
    当流式传输响应时，工具调用是通过[⟦T129⟧](https://reference.langchain.com/python/langchain-core/messages/tool/ToolCallChunk)逐步构建的。这使您可以在工具调用生成时查看它们，而不是等待完整的响应。

    ```python Streaming tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    for chunk in model_with_tools.stream(
        "What's the weather in Boston and Tokyo?"
    ):
        # Tool call chunks arrive progressively
        for tool_chunk in chunk.tool_call_chunks:
            if name := tool_chunk.get("name"):
                print(f"Tool: {name}")
            if id_ := tool_chunk.get("id"):
                print(f"ID: {id_}")
            if args := tool_chunk.get("args"):
                print(f"Args: {args}")

    # Output:
    # Tool: get_weather
    # ID: call_SvMlU1TVIZugrFLckFE2ceRE
    # Args: {"lo
    # Args: catio
    # Args: n": "B
    # Args: osto
    # Args: n"}
    # Tool: get_weather
    # ID: call_QMZdy6qInx13oWKE7KhuhOLR
    # Args: {"lo
    # Args: catio
    # Args: n": "T
    # Args: okyo
    # Args: "}
    ```

    您可以积累块来构建完整的工具调用：

    ```python Accumulate tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    gathered = None
    for chunk in model_with_tools.stream("What's the weather in Boston?"):
        gathered = chunk if gathered is None else gathered + chunk
        print(gathered.tool_calls)
    ```
  </Accordion>
</AccordionGroup>

***

## 结构化输出

可以请求模型以与给定模式匹配的格式提供响应。这对于确保输出可以轻松解析并在后续处理中使用非常有用。 LangChain 支持多种模式类型和方法来强制结构化输出。

<Tip>
  要了解结构化输出，请参阅[Structured output](/oss/python/langchain/structured-output)。
</Tip>

<Tabs>
  <Tab title="Pydantic">
    [Pydantic models](https://docs.pydantic.dev/latest/concepts/models/#basic-model-usage) 提供最丰富的功能集，包括字段验证、描述和嵌套结构。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from pydantic import BaseModel, Field

    class Movie(BaseModel):
        """A movie with details."""
        title: str = Field(description="The title of the movie")
        year: int = Field(description="The year the movie was released")
        director: str = Field(description="The director of the movie")
        rating: float = Field(description="The movie's rating out of 10")

    model_with_structure = model.with_structured_output(Movie)
    response = model_with_structure.invoke("Provide details about the movie Inception")
    print(response)  # Movie(title="Inception", year=2010, director="Christopher Nolan", rating=8.8)
    ```
  </Tab>

  <Tab title="TypedDict">
    Python 的 `TypedDict` 提供了 Pydantic 模型的更简单替代方案，是不需要运行时验证时的理想选择。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from typing_extensions import TypedDict, Annotated

    class MovieDict(TypedDict):
        """A movie with details."""
        title: Annotated[str, ..., "The title of the movie"]
        year: Annotated[int, ..., "The year the movie was released"]
        director: Annotated[str, ..., "The director of the movie"]
        rating: Annotated[float, ..., "The movie's rating out of 10"]

    model_with_structure = model.with_structured_output(MovieDict)
    response = model_with_structure.invoke("Provide details about the movie Inception")
    print(response)  # {'title': 'Inception', 'year': 2010, 'director': 'Christopher Nolan', 'rating': 8.8}
    ```
  </Tab>

  <Tab title="JSON Schema">
    提供[JSON Schema](https://json-schema.org/understanding-json-schema/about)以实现最大程度的控制和互操作性。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import json

    json_schema = {
        "title": "Movie",
        "description": "A movie with details",
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "The title of the movie"
            },
            "year": {
                "type": "integer",
                "description": "The year the movie was released"
            },
            "director": {
                "type": "string",
                "description": "The director of the movie"
            },
            "rating": {
                "type": "number",
                "description": "The movie's rating out of 10"
            }
        },
        "required": ["title", "year", "director", "rating"]
    }

    model_with_structure = model.with_structured_output(
        json_schema,
        method="json_schema",
    )
    response = model_with_structure.invoke("Provide details about the movie Inception")
    print(response)  # {'title': 'Inception', 'year': 2010, ...}
    ```
  </Tab>
</Tabs>

<Note>
  **结构化输出的关键考虑因素*** **方法参数**：一些提供程序支持不同的结构化输出方法：
    * `'json_schema'`：使用提供商提供的专用结构化输出功能。
    * `'function_calling'`：通过强制遵循给定模式的 [tool call](#tool-calling) 来导出结构化输出。
    * `'json_mode'`：某些提供商提供的 `'json_schema'` 的前身。生成有效的 JSON，但必须在提示中描述架构。
  * **包含原始**：设置`include_raw=True`以获取解析的输出和原始AI消息。
  * **验证**：Pydantic 模型提供自动验证。 `TypedDict` 和 JSON Schema 需要手动验证。

  请参阅您的 [provider's integration page](/oss/python/integrations/providers/overview) 了解支持的方法和配置选项。
</Note>

<Accordion title="Example: Message output alongside parsed structure">
  返回原始 [⟦T137⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 对象以及解析后的表示以访问响应元数据（例如 [token counts](#token-usage)）可能很有用。为此，请在调用 [⟦T139⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel/with_structured_output) 时设置 [⟦T138⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel/with_structured_output)：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel, Field

  class Movie(BaseModel):
      """A movie with details."""
      title: str = Field(description="The title of the movie")
      year: int = Field(description="The year the movie was released")
      director: str = Field(description="The director of the movie")
      rating: float = Field(description="The movie's rating out of 10")

  model_with_structure = model.with_structured_output(Movie, include_raw=True)  # [!code highlight]
  response = model_with_structure.invoke("Provide details about the movie Inception")
  response
  # {
  #     "raw": AIMessage(...),
  #     "parsed": Movie(title=..., year=..., ...),
  #     "parsing_error": None,
  # }
  ```
</Accordion>

<Accordion title="Example: Nested structures">
  模式可以嵌套：

  <CodeGroup>
    ```python Pydantic BaseModel theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from pydantic import BaseModel, Field

    class Actor(BaseModel):
        name: str
        role: str

    class MovieDetails(BaseModel):
        title: str
        year: int
        cast: list[Actor]
        genres: list[str]
        budget: float | None = Field(None, description="Budget in millions USD")

    model_with_structure = model.with_structured_output(MovieDetails)
    ```

    ```python TypedDict theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from typing_extensions import Annotated, TypedDict

    class Actor(TypedDict):
        name: str
        role: str

    class MovieDetails(TypedDict):
        title: str
        year: int
        cast: list[Actor]
        genres: list[str]
        budget: Annotated[float | None, ..., "Budget in millions USD"]

    model_with_structure = model.with_structured_output(MovieDetails)
    ```
  </CodeGroup>
</Accordion>

***

## 高级主题

### 模型简介

<Info>
  模型配置文件需要`langchain>=1.1`。
</Info>

LangChain 聊天模型可以通过 `profile` 属性公开支持的特性和功能的字典：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
model.profile
# {
#   "max_input_tokens": 400000,
#   "image_inputs": True,
#   "reasoning_output": True,
#   "tool_calling": True,
#   ...
# }
```请参阅[API reference](https://reference.langchain.com/python/langchain-core/language_models/model_profile/ModelProfile) 中的完整字段集。

大部分模型配置文件数据均由 [models.dev](https://github.com/sst/models.dev) 项目提供支持，这是一个提供模型功能数据的开源计划。这些数据通过附加字段进行了扩充，以便与 LangChain 一起使用。随着上游项目的发展，这些增强功能与上游项目保持一致。

模型配置文件数据允许应用程序动态地处理模型功能。例如：

1. [Summarization middleware](/oss/python/langchain/middleware/built-in#summarization)可以根据模型的上下文窗口大小触发摘要。
2. `create_agent`中的[Structured output](/oss/python/langchain/structured-output)策略可以自动推断（例如，通过检查对本机结构化输出功能的支持）。
3. 模型输入可以根据支持的[modalities](#multimodal)和最大输入令牌进行门控。
4. [Deep Agents Code](/oss/deepagents/code) 将 [interactive model switcher](/oss/deepagents/code/providers#which-models-appear-in-the-switcher) 过滤到其配置文件报告 `tool_calling` 支持和文本 I/O 的模型，并在选择器详细视图中显示上下文窗口大小和功能标志。

<Accordion title="Updating or overwriting profile data">
  如果模型配置文件数据丢失、过时或不正确，则可以更改。

  **选项 1（快速修复）**

  您可以使用任何有效的配置文件实例化聊天模型：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  custom_profile = {
      "max_input_tokens": 100_000,
      "tool_calling": True,
      "structured_output": True,
      # ...
  }
  model = init_chat_model("...", profile=custom_profile)
  ````profile`也是常规的`dict`，可以就地更新。如果模型实例是共享的，请考虑使用 `model_copy` 以避免改变共享状态。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  new_profile = model.profile | {"key": "value"}
  model.model_copy(update={"profile": new_profile})
  ```

  **选项 2（修复上游数据）**

  数据的主要来源是[models.dev](https://models.dev/)项目。此数据与 LangChain [integration packages](/oss/python/integrations/providers/overview) 中的其他字段和覆盖合并，并随这些包一起提供。

  模型配置文件数据可以通过以下过程更新：

  1.（如果需要）通过拉取请求将[models.dev](https://models.dev/)处的源数据更新到其[repository on GitHub](https://github.com/sst/models.dev)。
  2.（如果需要）通过向 LangChain [integration package](/oss/python/integrations/providers/overview)\` 发出拉取请求来更新 `langchain_<package>/data/profile_augmentations.toml` 中的其他字段和覆盖。
  3. 使用 [⟦T148⟧](https://pypi.org/project/langchain-model-profiles/) CLI 工具从 [models.dev](https://models.dev/) 提取最新数据，合并增强内容并更新配置文件数据：

  <CodeGroup>
    ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -U langchain-model-profiles
    ```

    ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    uv add langchain-model-profiles
    ```
  </CodeGroup>

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  langchain-profiles refresh --provider <provider> --data-dir <data_dir>
  ```

  这个命令：

  * 从 models.dev 下载`<provider>`的最新数据
  * 将`profile_augmentations.toml`的增强合并到`<data_dir>`
  * 将合并的配置文件写入`<data_dir>`中的`profiles.py`

  例如：从[⟦T154⟧](https://github.com/langchain-ai/langchain/tree/master/libs/partners/anthropic)到[LangChain monorepo](https://github.com/langchain-ai/langchain)：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv run --with langchain-model-profiles --provider anthropic --data-dir langchain_anthropic/data
  ```
</Accordion>

<Warning>
  模型配置文件是测试版功能。配置文件的格式可能会发生变化。
</Warning>

### 多式联运某些模型可以处理和返回非文本数据，例如图像、音频和视频。您可以通过提供 [content blocks](/oss/python/langchain/messages#message-content) 将非文本数据传递给模型。

<Tip>
  所有具有底层多模式功能的LangChain聊天模型都支持：

  1. 跨提供商标准格式的数据（参见[our messages guide](/oss/python/langchain/messages)）
  2. OpenAI [chat completions](https://platform.openai.com/docs/api-reference/chat) 格式
  3. 该特定提供商原生的任何格式（例如，Anthropic 型号接受 Anthropic 原生格式）
</Tip>

详情请参阅消息指南[multimodal section](/oss/python/langchain/messages#multimodal)。

<Tooltip href="https://models.dev/">某些模型</Tooltip>可以返回多模式数据作为其响应的一部分。如果调用这样做，生成的 [⟦T155⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 将具有多模式类型的内容块。

```python Multimodal output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response = model.invoke("Create a picture of a cat")
print(response.content_blocks)
# [
#     {"type": "text", "text": "Here's a picture of a cat"},
#     {"type": "image", "base64": "...", "mime_type": "image/jpeg"},
# ]
```

有关特定提供商的详细信息，请参阅[integrations page](/oss/python/integrations/providers/overview)。

### 推理

许多模型能够执行多步骤推理来得出结论。这涉及将复杂的问题分解为更小、更易于管理的步骤。

**如果得到底层模型的支持，**您可以展示此推理过程，以更好地理解模型如何得出最终答案。

<CodeGroup>
  ```python Stream reasoning output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  for chunk in model.stream("Why do parrots have colorful feathers?"):
      reasoning_steps = [r for r in chunk.content_blocks if r["type"] == "reasoning"]
      print(reasoning_steps if reasoning_steps else chunk.text)
  ```

  ```python Complete reasoning output theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  response = model.invoke("Why do parrots have colorful feathers?")
  reasoning_steps = [b for b in response.content_blocks if b["type"] == "reasoning"]
  print(" ".join(step["reasoning"] for step in reasoning_steps))
  ```
</CodeGroup>根据模型的不同，您有时可以指定推理中应投入的工作量。同样，您可以请求模型完全关闭推理。这可以采取分类推理“层”的形式（例如，`'low'`或`'high'`）或整数代币预算。

<Note>
  `reasoning_effort`作为标准参数需要`langchain-core>=1.5.2`，加上相应的合作伙伴包版本：`langchain-anthropic>=1.5.3`、`langchain-openai>=1.4.1`、`langchain-fireworks>=1.5.2`、`langchain-xai>=1.3.0`、`langchain-google-genai>=4.3.1`或`langchain-aws>=1.6.5`。
</Note>

[⟦T166⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI)、[⟦T167⟧](https://reference.langchain.com/python/langchain-anthropic/chat_models/ChatAnthropic)、[⟦T168⟧](https://reference.langchain.com/python/langchain-fireworks/chat_models/ChatFireworks)、[⟦T169⟧](https://reference.langchain.com/python/langchain-xai/chat_models/ChatXAI)、[⟦T170⟧](https://reference.langchain.com/python/langchain-google-genai/chat_models/ChatGoogleGenerativeAI)和[⟦T171⟧](https://reference.langchain.com/python/langchain-aws/chat_models/bedrock_converse/ChatBedrockConverse)支持标准`reasoning_effort`参数。与`temperature`一样，它可以在模型构建时或每次调用时设置，并且每个提供者将其转换为自己的API格式：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-sonnet-4-6")
response = model.invoke(
    "Why do parrots have colorful feathers?",
    reasoning_effort="high",
)
```

支持的工作级别和提供商记录的默认值因型号而异。检查模型的 [profile](#model-profiles) 支持的级别及其默认值：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
model.profile["reasoning_effort_levels"]  # e.g. ['low', 'medium', 'high']
model.profile["reasoning_effort_default"]  # e.g. 'high'
```

某些提供程序还接受 `reasoning_effort` 的本机别名（例如，`ChatAnthropic` 接受 `effort` 且 `ChatGoogleGenerativeAI` 接受 `thinking_level`）。请参阅 [chat model integrations](/oss/python/integrations/chat) 页面了解特定于提供商的详细信息。

有关详细信息，请参阅相应聊天模型的[integrations page](/oss/python/integrations/providers/overview)或[reference](https://reference.langchain.com/python/integrations/)。

### 本地模特LangChain 支持在您自己的硬件上本地运行模型。这对于以下场景非常有用：数据隐私至关重要、您想要调用自定义模型，或者您想要避免使用基于云的模型时产生的成本。

[Ollama](/oss/python/integrations/chat/ollama) 是在本地运行聊天和嵌入模型的最简单方法之一。

### 提示缓存

许多提供商提供即时缓存功能，以减少重复处理相同令牌的延迟和成本。您可以在三个级别上使用缓存：

* **隐式提供程序缓存：** 如果请求命中缓存，提供程序会自动传递成本节省，无需配置。示例：[OpenAI](/oss/python/integrations/chat/openai) 和 [Gemini](/oss/python/integrations/chat/google_generative_ai)。
* **提供程序级显式控制：** 提供程序允许您手动指示缓存点，以实现更好的控制或保证节省成本。这些反映了底层提供者/API 行为。示例：
  * [⟦T179⟧](https://reference.langchain.com/python/langchain-openai/chat_models/base/ChatOpenAI)（经`prompt_cache_key`）
  * Anthropic 内容块 [⟦T181⟧](/oss/python/integrations/chat/anthropic#prompt-caching)
  * [Gemini](https://reference.langchain.com/python/integrations/langchain_google_genai/)。
  * AWS Bedrock [⟦T182⟧](/oss/python/integrations/chat/bedrock#prompt-caching) 块
* **LangChain中间件：**对于代理，中间件让LangChain优化稳定系统提示和工具内容的缓存。示例：
  * Anthropic 的 [⟦T183⟧](/oss/python/integrations/middleware/anthropic#prompt-caching)
  * AWS Bedrock 的 [⟦T184⟧](/oss/python/integrations/middleware/aws#prompt-caching)<Warning>
  通常仅在高于最小输入令牌阈值时才进行提示缓存。详情请参阅[provider pages](/oss/python/integrations/chat)。
</Warning>

缓存使用情况将反映在模型响应的[usage metadata](/oss/python/langchain/messages#token-usage)中。

### 服务器端工具使用

一些提供商支持服务器端[tool-calling](#tool-calling)循环：模型可以与网络搜索、代码解释器和其他工具交互，并在单个对话轮中分析结果。

如果模型调用服务器端工具，则响应消息的内容将包括表示工具的调用和结果的内容。访问响应的[content blocks](/oss/python/langchain/messages#standard-content-blocks)将返回服务器端工具调用并以与提供者无关的格式返回结果：

```python Invoke with server-side tool use theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model

model = init_chat_model("gpt-5.4-mini")

tool = {"type": "web_search"}
model_with_tools = model.bind_tools([tool])

response = model_with_tools.invoke("What was a positive news story from today?")
print(response.content_blocks)
```

```python Result expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
    {
        "type": "server_tool_call",
        "name": "web_search",
        "args": {
            "query": "positive news stories today",
            "type": "search"
        },
        "id": "ws_abc123"
    },
    {
        "type": "server_tool_result",
        "tool_call_id": "ws_abc123",
        "status": "success"
    },
    {
        "type": "text",
        "text": "Here are some positive news stories from today...",
        "annotations": [
            {
                "end_index": 410,
                "start_index": 337,
                "title": "article title",
                "type": "citation",
                "url": "..."
            }
        ]
    }
]
```

这代表一个对话轮次；没有像客户端[tool-calling](#tool-calling)那样需要传入关联的[ToolMessage](/oss/python/langchain/messages#tool-message)对象。

有关可用工具和使用详细信息，请参阅给定提供商的[integration page](/oss/python/integrations/chat)。

### 速率限制

许多聊天模型提供商对给定时间段内可以进行的调用数量施加限制。如果您达到速率限制，您通常会收到来自提供商的速率限制错误响应，并且需要等待才能发出更多请求。为了帮助管理速率限制，聊天模型集成接受可在初始化期间提供的 `rate_limiter` 参数，以控制发出请求的速率。

<Accordion title="Initialize and use a rate limiter" icon="gauge">
  LangChain 配有（可选）内置[⟦T186⟧](https://reference.langchain.com/python/langchain-core/rate_limiters/InMemoryRateLimiter)。该限制器是线程安全的，可以由同一进程中的多个线程共享。

  ```python Define a rate limiter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.rate_limiters import InMemoryRateLimiter

  rate_limiter = InMemoryRateLimiter(
      requests_per_second=0.1,  # 1 request every 10s
      check_every_n_seconds=0.1,  # Check every 100ms whether allowed to make a request
      max_bucket_size=10,  # Controls the maximum burst size.
  )

  model = init_chat_model(
      model="gpt-5.5",
      model_provider="openai",
      rate_limiter=rate_limiter  # [!code highlight]
  )
  ```

  <Warning>
    提供的速率限制器只能限制单位时间内的请求数量。如果您还需要根据请求的大小进行限制，这将无济于事。
  </Warning>
</Accordion>

### 基本 URL 和代理设置

您可以为实现 OpenAI 聊天完成 API 的提供商配置自定义基本 URL。

<Warning>
  `model_provider="openai"`（或直接使用`ChatOpenAI`）针对官方OpenAI API 规范。可能无法提取或保留来自路由器和代理的提供商特定字段。

  对于 OpenRouter 和 LiteLLM，更喜欢专用集成：

  * [OpenRouter via ⟦T189⟧](/oss/python/integrations/chat/openrouter) (`langchain-openrouter`)
  * [LiteLLM via ⟦T191⟧ / ⟦T192⟧](/oss/python/integrations/chat) (`langchain-litellm`)
</Warning>

<Accordion title="Custom base URL" icon="link">
  许多模型提供商提供OpenAI兼容的API（例如[Together AI](https://www.together.ai/)、[vLLM](https://github.com/vllm-project/vllm)）。您可以通过指定适当的 `base_url` 参数来将 [⟦T194⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model) 与这些提供程序一起使用：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  model = init_chat_model(
      model="MODEL_NAME",
      model_provider="openai",
      base_url="BASE_URL",
      api_key="YOUR_API_KEY",
  )
  ```<Note>
    当使用直接聊天模型类实例化时，参数名称可能因提供者而异。详情请查看相应的[reference](/oss/python/integrations/providers/overview)。
  </Note>
</Accordion>

<Accordion title="HTTP proxy configuration" icon="shield">
  对于需要 HTTP 代理的部署，某些模型集成支持代理配置：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain_openai import ChatOpenAI

  model = ChatOpenAI(
      model="gpt-5.5",
      openai_proxy="http://proxy.example.com:8080"
  )
  ```

  <Note>
    代理支持因集成而异。检查特定模型提供商的 [reference](/oss/python/integrations/providers/overview) 的代理配置选项。
  </Note>
</Accordion>

### 对数概率

通过在初始化模型时设置 `logprobs` 参数，某些模型可以配置为返回表示给定标记的可能性的标记级对数概率：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
model = init_chat_model(
    model="gpt-5.5",
    model_provider="openai"
).bind(logprobs=True)

response = model.invoke("Why do parrots talk?")
print(response.response_metadata["logprobs"])
```

### 代币使用

许多模型提供程序返回令牌使用信息作为调用响应的一部分。如果可用，此信息将包含在相应模型生成的 [⟦T197⟧](https://reference.langchain.com/python/langchain-core/messages/ai/AIMessage) 对象中。有关更多详细信息，请参阅[messages](/oss/python/langchain/messages)指南。

<Note>
  一些提供商 API，特别是 OpenAI 和 Azure OpenAI 聊天完成，要求用户选择在流上下文中接收令牌使用数据。有关详细信息，请参阅集成指南的[streaming usage metadata](/oss/python/integrations/chat/openai#streaming-usage-metadata)部分。
</Note>您可以使用回调或上下文管理器跟踪应用程序中跨模型的聚合令牌计数，如下所示：

<Tabs>
  <Tab title="Callback handler">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.chat_models import init_chat_model
    from langchain_core.callbacks import UsageMetadataCallbackHandler

    model_1 = init_chat_model(model="gpt-5.4-mini")
    model_2 = init_chat_model(model="claude-haiku-4-5-20251001")

    callback = UsageMetadataCallbackHandler()
    result_1 = model_1.invoke("Hello", config={"callbacks": [callback]})
    result_2 = model_2.invoke("Hello", config={"callbacks": [callback]})
    print(callback.usage_metadata)
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
        'gpt-5.4-mini': {
            'input_tokens': 8,
            'output_tokens': 10,
            'total_tokens': 18,
            'input_token_details': {'audio': 0, 'cache_read': 0},
            'output_token_details': {'audio': 0, 'reasoning': 0}
        },
        'claude-haiku-4-5-20251001': {
            'input_tokens': 8,
            'output_tokens': 21,
            'total_tokens': 29,
            'input_token_details': {'cache_read': 0, 'cache_creation': 0}
        }
    }
    ```
  </Tab>

  <Tab title="Context manager">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langchain.chat_models import init_chat_model
    from langchain_core.callbacks import get_usage_metadata_callback

    model_1 = init_chat_model(model="gpt-5.4-mini")
    model_2 = init_chat_model(model="claude-haiku-4-5-20251001")

    with get_usage_metadata_callback() as cb:
        model_1.invoke("Hello")
        model_2.invoke("Hello")
        print(cb.usage_metadata)
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
        'gpt-5.4-mini': {
            'input_tokens': 8,
            'output_tokens': 10,
            'total_tokens': 18,
            'input_token_details': {'audio': 0, 'cache_read': 0},
            'output_token_details': {'audio': 0, 'reasoning': 0}
        },
        'claude-haiku-4-5-20251001': {
            'input_tokens': 8,
            'output_tokens': 21,
            'total_tokens': 29,
            'input_token_details': {'cache_read': 0, 'cache_creation': 0}
        }
    }
    ```
  </Tab>
</Tabs>

### 调用配置

调用模型时，您可以使用 [⟦T199⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 字典通过 `config` 参数传递其他配置。这提供了对执行行为、回调和元数据跟踪的运行时控制。

常见的配置选项包括：

```python Invocation with config theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
response = model.invoke(
    "Tell me a joke",
    config={
        "run_name": "joke_generation",      # Custom name for this run
        "tags": ["humor", "demo"],          # Tags for categorization
        "metadata": {"user_id": "123"},     # Custom metadata
        "callbacks": [my_callback_handler], # Callback handlers
    }
)
```

这些配置值在以下情况下特别有用：

* 使用[LangSmith](/langsmith/observability)跟踪进行调试
* 实现自定义日志记录或监控
* 控制生产中的资源使用
* 跟踪复杂管道中的调用

<Accordion title="Key configuration attributes">
  <ParamField type="string">
    在日志和跟踪中标识此特定调用。不被子调用继承。
  </ParamField>

  <ParamField type="string[]">
    所有子调用继承的标签，用于调试工具中的过滤和组织。
  </ParamField>

  <ParamField type="object">
    用于跟踪其他上下文的自定义键值对，由所有子调用继承。
  </ParamField>

  <ParamField type="number">
    控制使用[⟦T200⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch)或[⟦T201⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.batch_as_completed)时的最大并行调用数。
  </ParamField><ParamField type="array">
    用于在执行期间监视和响应事件的处理程序。
  </ParamField>

  <ParamField type="number">
    链的最大递归深度，以防止复杂管道中的无限循环。
  </ParamField>
</Accordion>

<Tip>
  有关所有支持的属性，请参阅完整的 [⟦T202⟧](https://reference.langchain.com/python/langchain-core/runnables/config/RunnableConfig) 参考。
</Tip>

### 可配置模型

您还可以通过指定 [⟦T203⟧](https://reference.langchain.com/python/langchain_core/language_models/#langchain_core.language_models.chat_models.BaseChatModel.configurable_fields) 创建运行时可配置模型。如果您不指定型号值，则默认情况下可以配置`'model'`和`'model_provider'`。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.chat_models import init_chat_model

configurable_model = init_chat_model(temperature=0)

configurable_model.invoke(
    "what's your name",
    config={"configurable": {"model": "gpt-5-nano"}},  # Run with GPT-5-Nano
)
configurable_model.invoke(
    "what's your name",
    config={"configurable": {"model": "claude-sonnet-4-6"}},  # Run with Claude
)
```

<Accordion title="Configurable model with default values">
  我们可以使用默认模型值创建一个可配置模型，指定哪些参数是可配置的，并向可配置参数添加前缀：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  first_model = init_chat_model(
          model="gpt-5.4-mini",
          temperature=0,
          configurable_fields=("model", "model_provider", "temperature", "max_tokens"),
          config_prefix="first",  # Useful when you have a chain with multiple models
  )

  first_model.invoke("what's your name")
  ```

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  first_model.invoke(
      "what's your name",
      config={
          "configurable": {
              "first_model": "claude-sonnet-4-6",
              "first_temperature": 0.5,
              "first_max_tokens": 100,
          }
      },
  )
  ```

  有关 `configurable_fields` 和 `config_prefix` 的更多详细信息，请参阅 [⟦T206⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model) 参考。
</Accordion>

<Accordion title="Using a configurable model declaratively">
  我们可以在可配置模型上调用 `bind_tools`、`with_structured_output`、`with_configurable` 等声明性操作，并以与定期实例化聊天模型对象相同的方式链接可配置模型。

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from pydantic import BaseModel, Field


  class GetWeather(BaseModel):
      """Get the current weather in a given location"""

          location: str = Field(description="The city and state, e.g. San Francisco, CA")


  class GetPopulation(BaseModel):
      """Get the current population in a given location"""

          location: str = Field(description="The city and state, e.g. San Francisco, CA")


  model = init_chat_model(temperature=0)
  model_with_tools = model.bind_tools([GetWeather, GetPopulation])

  model_with_tools.invoke(
      "what's bigger in 2024 LA or NYC", config={"configurable": {"model": "gpt-5.4-mini"}}
  ).tool_calls
  ```

  ```
  [
      {
          'name': 'GetPopulation',
          'args': {'location': 'Los Angeles, CA'},
          'id': 'call_Ga9m8FAArIyEjItHmztPYA22',
          'type': 'tool_call'
      },
      {
          'name': 'GetPopulation',
          'args': {'location': 'New York, NY'},
          'id': 'call_jh2dEvBaAHRaw5JUDthOs7rt',
          'type': 'tool_call'
      }
  ]
  ```

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  model_with_tools.invoke(
      "what's bigger in 2024 LA or NYC",
      config={"configurable": {"model": "claude-sonnet-4-6"}},
  ).tool_calls
  ```

  ```
  [
      {
          'name': 'GetPopulation',
          'args': {'location': 'Los Angeles, CA'},
          'id': 'toolu_01JMufPf4F4t2zLj7miFeqXp',
          'type': 'tool_call'
      },
      {
          'name': 'GetPopulation',
          'args': {'location': 'New York City, NY'},
          'id': 'toolu_01RQBHcE8kEEbYTuuS8WqY1u',
          'type': 'tool_call'
      }
  ]
  ```
</Accordion>

### 动态模型选择

根据当前 <Tooltip>state</Tooltip> 和上下文，在 <Tooltip>runtime</Tooltip> 选择动态模型。这可以实现复杂的路由逻辑和成本优化。要使用动态模型，请使用 [⟦T212⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/wrap_model_call) 装饰器创建中间件，该装饰器会修改请求中的模型：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse


basic_model = ChatOpenAI(model="gpt-5.4-mini")
advanced_model = ChatOpenAI(model="gpt-5.5")

@wrap_model_call
def dynamic_model_selection(request: ModelRequest, handler) -> ModelResponse:
    """Choose model based on conversation complexity."""
    message_count = len(request.state["messages"])

    if message_count > 10:
        # Use an advanced model for longer conversations
        model = advanced_model
    else:
        model = basic_model

    return handler(request.override(model=model))

agent = create_agent(
    model=basic_model,  # Default model
    tools=tools,
    middleware=[dynamic_model_selection]
)
```

<Warning>
  使用结构化输出时，不支持预绑定模型（已调用[⟦T213⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel/bind_tools)的模型）。如果您需要具有结构化输出的动态模型选择，请确保传递给中间件的模型没有预先绑定。
</Warning>

<Tip>
  型号配置详情请参见[Models](/oss/python/langchain/models)。有关动态模型选择模式，请参阅[Dynamic model in middleware](/oss/python/langchain/middleware#dynamic-model)。
</Tip>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/models.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>