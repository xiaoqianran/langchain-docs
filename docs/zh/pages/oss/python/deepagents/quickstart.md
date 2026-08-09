<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Quickstart | https://docs.langchain.com/oss/python/deepagents/quickstart -->

# 快速入门

在几分钟内构建您的第一个深度代理

本指南将引导您使用文件系统工具和子代理功能创建第一个深度代理。您将建立一个可以进行研究和撰写报告的研究代理。

<Tip>
  **使用人工智能编码助手？**

  * 安装[LangChain Docs MCP server](/use-these-docs)，让您的代理能够访问最新的LangChain文档和示例。
  * 安装[LangChain Skills](https://github.com/langchain-ai/langchain-skills)以提高代理在LangChain生态系统任务上的性能。
</Tip>

## 先决条件

在开始之前，请确保您拥有模型提供商（例如 Gemini、Anthropic、OpenAI）提供的 API 密钥。

<Note>
  深度代理需要支持[tool calling](/oss/python/langchain/models#tool-calling)的模型。请参阅[customization](/oss/python/deepagents/customization#model)了解如何配置模型。
</Note>

## 第 1 步：安装依赖项

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install deepagents
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv init
  uv add deepagents
  uv sync
  ```
</CodeGroup>

<Note>
  Google、OpenAI 和 Anthropic 都提供内置网络搜索工具：无需额外的软件包或 API 密钥。如果您使用不同的提供商或更喜欢使用 [Tavily](https://tavily.com/) 进行搜索，请同时安装 Tavily 软件包：

  ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install tavily-python
  ```
</Note>

## 第 2 步：设置您的 API 密钥

<Tabs>
  <Tab title="Google">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export GOOGLE_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="OpenAI">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export OPENAI_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="Anthropic">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export ANTHROPIC_API_KEY="your-api-key"
    ```
  </Tab>

  <Tab title="OpenRouter">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export OPENROUTER_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab>

  <Tab title="Fireworks">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export FIREWORKS_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab>

  <Tab title="Baseten">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export BASETEN_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab><Tab title="Ollama">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Local: Ollama must be running on your machine
    # Cloud: Set your Ollama API key for hosted inference
    export OLLAMA_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```
  </Tab>

  <Tab title="Other">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Set the API key for your provider
    export <PROVIDER>_API_KEY="your-api-key"
    export TAVILY_API_KEY="your-tavily-api-key"
    ```

    深度代理可与任何 [LangChain chat model](/oss/python/deepagents/models#supported-models) 配合使用。为您的提供商设置 API 密钥。
  </Tab>
</Tabs>

<Tip>
  **使用 LangSmith 网关**

  [LangSmith Gateway](/langsmith/llm-gateway) 通过 LangSmith 路由大多数主要提供商。您可以使用 [bring your own provider keys](/langsmith/llm-gateway-quickstart#2-make-a-call) 或使用 [Gateway Credits](/langsmith/llm-gateway-credits) 在没有提供程序密钥的情况下访问模型。
</Tip>

## 第三步：创建搜索工具

Google、OpenAI 和 Anthropic 提供在服务器端运行的内置网络搜索工具：无需额外的软件包或 API 密钥。将提供者工具字典直接传递给`create_deep_agent`。

<Tabs>
  <Tab title="Provider search (recommended)">
    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent

      # Google's built-in search — no extra install or API key needed
      internet_search = {"google_search": {}}
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent

      # OpenAI's built-in web search — no extra install or API key needed
      internet_search = {"type": "web_search"}
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent

      # Anthropic's built-in web search — no extra install or API key needed
      internet_search = {"type": "web_search_20260209", "name": "web_search"}
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Tavily (any provider)">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import os
    from typing import Literal

    from tavily import TavilyClient
    from deepagents import create_deep_agent

    tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])


    def internet_search(
        query: str,
        max_results: int = 5,
        topic: Literal["general", "news", "finance"] = "general",
        include_raw_content: bool = False,
    ):
        """Run a web search"""
        return tavily_client.search(
            query,
            max_results=max_results,
            include_raw_content=include_raw_content,
            topic=topic,
        )
    ```
  </Tab>
</Tabs>

## 步骤 4：创建深度代理

将您的搜索工具和型号传递给`create_deep_agent`。传递 `provider:model` 格式的 `model` 字符串，或 [initialized model instance](/oss/python/deepagents/models#configure-model-parameters)。请参阅[supported models](/oss/python/deepagents/models#supported-models)了解所有提供商，并参阅[suggested models](/oss/python/deepagents/models#suggested-models)了解经过测试的建议。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # System prompt to steer the agent to be an expert researcher
  research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## `internet_search`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  """

  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[internet_search],
      system_prompt=research_instructions,
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # System prompt to steer the agent to be an expert researcher
  research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## `internet_search`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  """

  agent = create_deep_agent(
      model="openai:gpt-5.5",
      tools=[internet_search],
      system_prompt=research_instructions,
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # System prompt to steer the agent to be an expert researcher
  research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## `internet_search`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  """

  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[internet_search],
      system_prompt=research_instructions,
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # System prompt to steer the agent to be an expert researcher
  research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## `internet_search`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  """

  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[internet_search],
      system_prompt=research_instructions,
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # System prompt to steer the agent to be an expert researcher
  research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## `internet_search`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  """

  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[internet_search],
      system_prompt=research_instructions,
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # System prompt to steer the agent to be an expert researcher
  research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## `internet_search`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  """

  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[internet_search],
      system_prompt=research_instructions,
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # System prompt to steer the agent to be an expert researcher
  research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

  You have access to an internet search tool as your primary means of gathering information.

  ## `internet_search`

  Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
  """

  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      tools=[internet_search],
      system_prompt=research_instructions,
  )
  ```
</CodeGroup>

## 步骤 5：设置 LangSmith 跟踪

[LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-quickstart) 为您提供代理执行的可见性，允许您查看工具调用、子代理委托和 LLM 响应。

在 [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-quickstart) 注册，创建 API 密钥，并设置以下环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="your-langsmith-api-key"
```

## 第 6 步：运行代理

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
result = agent.invoke({"messages": [{"role": "user", "content": "What is langgraph?"}]})

# Print the agent's response
print(result["messages"][-1].content)
```

## 它是如何工作的？您的深度代理会自动：

1. **通过调用`internet_search`工具收集信息进行研究**。
2. **通过使用文件系统工具（[⟦T29⟧](/oss/python/deepagents/overview#virtual-filesystem-access)、[⟦T30⟧](/oss/python/deepagents/overview#virtual-filesystem-access)）管理上下文**以卸载大型搜索结果。
3. **根据需要生成子代理**，将复杂的子任务委托给专门的子代理。
4. **综合报告**，将调查结果汇编成连贯的回应。

要使用 `write_todos` 添加结构化任务计划，请选择使用 [⟦T32⟧](https://reference.langchain.com/python/langchain/agents/middleware/todo/TodoListMiddleware)。参见[Task planning](/oss/python/deepagents/overview#task-planning)。

## 示例

有关可以使用深度代理构建的代理、模式和应用程序，请参阅[Examples](https://github.com/langchain-ai/deepagents/tree/main/examples)。

## 流媒体

深度代理具有内置的[streaming](/oss/python/langchain/event-streaming)，用于使用 LangGraph 从代理执行中进行实时更新。
这使您可以逐步观察输出并检查和调试代理和子代理的工作，例如工具调用、工具结果和 LLM 响应。

## 后续步骤

现在您已经构建了第一个深度代理：* **自定义您的代理**：了解[customization options](/oss/python/deepagents/customization)，包括自定义系统提示、工具和子代理。
* **添加长期记忆**：跨对话启用[persistent memory](/oss/python/deepagents/memory)。
* **部署到生产**：使用 [Managed Deep Agents](/langsmith/python/managed-deep-agents-overview) 在 LangSmith 中创建、运行和操作深度代理。
* **测试和评估**：使用 [LangSmith evaluation](/langsmith/evaluation-quickstart) 运行自动化测试并根据数据集衡量代理的性能。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>