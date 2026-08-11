<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Customize Deep Agents | https://docs.langchain.com/oss/python/deepagents/customization -->

# 定制Deep Agents

了解如何使用系统提示、工具、子代理等自定义 Deep Agents

围绕您的目标构建安全带。 `create_deep_agent` 为您提供生产就绪的基础：将其连接到您的数据，塑造其行为，并添加您的用例所需的功能。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      system_prompt="You are a helpful assistant.",
      tools=[search, fetch_url],
      memory=["./AGENTS.md"],
      skills=["./skills/"],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  agent = create_deep_agent(
      model="openai:gpt-5.5",
      system_prompt="You are a helpful assistant.",
      tools=[search, fetch_url],
      memory=["./AGENTS.md"],
      skills=["./skills/"],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      system_prompt="You are a helpful assistant.",
      tools=[search, fetch_url],
      memory=["./AGENTS.md"],
      skills=["./skills/"],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      system_prompt="You are a helpful assistant.",
      tools=[search, fetch_url],
      memory=["./AGENTS.md"],
      skills=["./skills/"],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      system_prompt="You are a helpful assistant.",
      tools=[search, fetch_url],
      memory=["./AGENTS.md"],
      skills=["./skills/"],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      system_prompt="You are a helpful assistant.",
      tools=[search, fetch_url],
      memory=["./AGENTS.md"],
      skills=["./skills/"],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      system_prompt="You are a helpful assistant.",
      tools=[search, fetch_url],
      memory=["./AGENTS.md"],
      skills=["./skills/"],
  )
  ```
</CodeGroup>

|参数|它有什么作用 |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ || [⟦T187⟧](#model) |使用哪种型号 |
| [⟦T188⟧](#system-prompt) |代理定制说明 |
| [⟦T189⟧](#tools) |代理可以调用​​的域工具 || [⟦T190⟧](#memory) |启动时加载的 AGENTS.md 文件 |
| [⟦T191⟧](#skills) |按需知识的技能目录 |
| [⟦T192⟧](#backends) |文件系统后端（默认为 StateBackend）|| [⟦T193⟧](/oss/python/deepagents/permissions) |文件系统的路径级访问控制 |
| [⟦T194⟧](#subagents) |用于委派任务的自定义子代理 |
| [⟦T195⟧](#middleware) |额外的中间件合并到[Deep Agents stack](#deep-agents-stack)； `.name` 与内置条目匹配的实例会就地替换它，其他任何内容都会在最后一个核心中间件条目之后、配置文件、提示缓存和内存之前落地 || [⟦T197⟧](#human-in-the-loop) |在工具请求人工批准之前暂停 |
| [⟦T198⟧](#structured-output) |结构化输出模式|
| [⟦T199⟧](/oss/python/deepagents/context-engineering#custom-state-schema) |自定义图状态模式 |
| [⟦T200⟧](/oss/python/deepagents/context-engineering#runtime-context) |每次运行的运行时上下文架构（用户 ID、API 密钥、功能标志）|| [profiles](#profiles) |每个模型默认为可重复使用的捆绑包 |

<Accordion title="Full function signature">
  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  create_deep_agent(
      model: str | BaseChatModel | None = None,
      tools: Sequence[BaseTool | Callable | dict[str, Any]] | None = None,
      *,
      system_prompt: str | SystemMessage | None = None,
      middleware: Sequence[AgentMiddleware[StateT_co, ContextT]] = (),
      subagents: Sequence[SubAgent | CompiledSubAgent | AsyncSubAgent] | None = None,
      skills: list[str] | None = None,
      memory: list[str] | None = None,
      permissions: list[FilesystemPermission] | None = None,
      backend: BackendProtocol | None = None,
      interrupt_on: dict[str, bool | InterruptOnConfig] | None = None,
      response_format: ResponseFormat[ResponseT] | type[ResponseT] | dict[str, Any] | None = None,
      state_schema: type[DeepAgentState] | None = None,
      context_schema: type[ContextT] | None = None,
      checkpointer: Checkpointer | None = None,
      store: BaseStore | None = None,
      debug: bool = False,
      name: str | None = None,
      cache: BaseCache | None = None
  ) -> CompiledStateGraph[AgentState[ResponseT], ContextT, InputAgentState, OutputAgentState[ResponseT]]
  ```
</Accordion>

有关完整参数列表，请参阅 [⟦T201⟧](https://reference.langchain.com/python/deepagents/graph/create_deep_agent) API 参考。要从头开始构建完全自定义的线束，请参阅 [Configure the harness](/oss/python/langchain/agents#configure-the-harness) 或按照分步 [Build a deep agent from scratch](/oss/python/langchain/deep-agent-from-scratch) 指南进行操作。

<Tip>
  当您添加工具、子代理和后端时，使用 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=oss-deepagents-customization) 来跟踪每个部分的行为方式。按照[observability quickstart](/langsmith/observability-quickstart)进行设置，并参阅[Going to production](/oss/python/deepagents/going-to-production)在LangSmith上进行部署。

  我们建议您还设置 [LangSmith Engine](/langsmith/engine)，它可以监视您的痕迹、检测问题并提出修复建议。
</Tip>

## 型号

传递 `provider:model` 格式的 `model` 字符串，或初始化的模型实例。请参阅[supported models](/oss/python/deepagents/models#supported-models)了解所有提供商，并参阅[suggested models](/oss/python/deepagents/models#suggested-models)了解经过测试的建议。

<Tip>
  使用`provider:model`格式（例如`openai:gpt-5.5`）可以在模型之间快速切换。
</Tip>

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
      ```python default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from deepagents import create_deep_agent

      os.environ["OPENAI_API_KEY"] = "sk-..."

      agent = create_deep_agent(model="openai:gpt-5.5")
      # this calls init_chat_model for the specified model with default parameters
      # to use specific model parameters, use init_chat_model directly
      ```

      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model
      from deepagents import create_deep_agent

      os.environ["OPENAI_API_KEY"] = "sk-..."

      model = init_chat_model(model="openai:gpt-5.5")
      agent = create_deep_agent(model=model)
      ``````python model class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openai import ChatOpenAI
      from deepagents import create_deep_agent

      os.environ["OPENAI_API_KEY"] = "sk-..."

      model = ChatOpenAI(model="gpt-5.5")
      agent = create_deep_agent(model=model)
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
      ```python default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from deepagents import create_deep_agent

      os.environ["ANTHROPIC_API_KEY"] = "sk-..."

      agent = create_deep_agent(model="anthropic:claude-sonnet-4-6")
      # this calls init_chat_model for the specified model with default parameters
      # to use specific model parameters, use init_chat_model directly
      ```

      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model
      from deepagents import create_deep_agent

      os.environ["ANTHROPIC_API_KEY"] = "sk-..."

      model = init_chat_model(model="claude-sonnet-4-6")
      agent = create_deep_agent(model=model)
      ```

      ```python model class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_anthropic import ChatAnthropic
      from deepagents import create_deep_agent

      os.environ["ANTHROPIC_API_KEY"] = "sk-..."

      model = ChatAnthropic(model="claude-sonnet-4-6")
      agent = create_deep_agent(model=model)
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
      ```python default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from deepagents import create_deep_agent

      os.environ["AZURE_OPENAI_API_KEY"] = "..."
      os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
      os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

      agent = create_deep_agent(model="azure_openai:gpt-5.5")
      # this calls init_chat_model for the specified model with default parameters
      # to use specific model parameters, use init_chat_model directly
      ```

      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model
      from deepagents import create_deep_agent

      os.environ["AZURE_OPENAI_API_KEY"] = "..."
      os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
      os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

      model = init_chat_model(
          model="azure_openai:gpt-5.5",
          azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
      )
      agent = create_deep_agent(model=model)
      ```

      ```python model class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_openai import AzureChatOpenAI
      from deepagents import create_deep_agent

      os.environ["AZURE_OPENAI_API_KEY"] = "..."
      os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
      os.environ["OPENAI_API_VERSION"] = "2025-03-01-preview"

      model = AzureChatOpenAI(
          model="gpt-5.5",
          azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
      )
      agent = create_deep_agent(model=model)
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
      ```python default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from deepagents import create_deep_agent

      os.environ["GOOGLE_API_KEY"] = "..."

      agent = create_deep_agent(model="google_genai:gemini-3.6-flash")
      # this calls init_chat_model for the specified model with default parameters
      # to use specific model parameters, use init_chat_model directly
      ```

      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model
      from deepagents import create_deep_agent

      os.environ["GOOGLE_API_KEY"] = "..."

      model = init_chat_model(model="google_genai:gemini-3.6-flash")
      agent = create_deep_agent(model=model)
      ```

      ```python model class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_google_genai import ChatGoogleGenerativeAI
      from deepagents import create_deep_agent

      os.environ["GOOGLE_API_KEY"] = "..."

      model = ChatGoogleGenerativeAI(model="gemini-3.6-flash")
      agent = create_deep_agent(model=model)
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
      ```python default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent

      # Follow the steps here to configure your credentials:
      # https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      agent = create_deep_agent(
          model="anthropic.claude-sonnet-4-6",
          model_provider="bedrock_converse",
      )
      # this calls init_chat_model for the specified model with default parameters
      # to use specific model parameters, use init_chat_model directly
      ```

      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain.chat_models import init_chat_model
      from deepagents import create_deep_agent

      # Follow the steps here to configure your credentials:
      # https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      model = init_chat_model(
          model="anthropic.claude-sonnet-4-6",
          model_provider="bedrock_converse",
      )
      agent = create_deep_agent(model=model)
      ```

      ```python model class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain_aws import ChatBedrock
      from deepagents import create_deep_agent

      # Follow the steps here to configure your credentials:
      # https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html

      model = ChatBedrock(model="anthropic.claude-sonnet-4-6")
      agent = create_deep_agent(model=model)
      ```
    </CodeGroup>
  </Tab>

  <Tab title="HuggingFace">
    👉阅读[HuggingFace chat model integration docs](/oss/python/integrations/chat/huggingface/)

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[huggingface]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[huggingface]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from deepagents import create_deep_agent

      os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

      agent = create_deep_agent(
          model="microsoft/Phi-3-mini-4k-instruct",
          model_provider="huggingface",
          temperature=0.7,
          max_tokens=1024,
      )
      # this calls init_chat_model for the specified model with default parameters
      # to use specific model parameters, use init_chat_model directly
      ```

      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain.chat_models import init_chat_model
      from deepagents import create_deep_agent

      os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

      model = init_chat_model(
          model="microsoft/Phi-3-mini-4k-instruct",
          model_provider="huggingface",
          temperature=0.7,
          max_tokens=1024,
      )
      agent = create_deep_agent(model=model)
      ```

      ```python model class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import os
      from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
      from deepagents import create_deep_agent

      os.environ["HUGGINGFACEHUB_API_TOKEN"] = "hf_..."

      llm = HuggingFaceEndpoint(
          repo_id="microsoft/Phi-3-mini-4k-instruct",
          temperature=0.7,
          max_length=1024,
      )
      model = ChatHuggingFace(llm=llm)
      agent = create_deep_agent(model=model)
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Other">
    传递任何[supported model string](/oss/python/deepagents/models#supported-models)，或初始化的模型实例。例如：

    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install -U "langchain[deepseek]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langchain[deepseek]"
      ```
    </CodeGroup>

    <CodeGroup>
      ```python default parameters theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent

      agent = create_deep_agent(model="provider:model-name")
      ```

      ```python init_chat_model theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from langchain.chat_models import init_chat_model

      model = init_chat_model("provider:model-name")
      agent = create_deep_agent(model=model)
      ```

      ```python model class theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from langchain_<provider> import Chat<Provider>
      # from langchain_deepseek import ChatDeepSeek

      from deepagents import create_deep_agent

      model = Chat<Provider>(model="model-name")
      # model = ChatDeepSeek(model="deepseek-v4-pro")

      agent = create_deep_agent(model=model)
      ```
    </CodeGroup>
  </Tab>
</Tabs>

<Tip>
  聊天模型会自动重试短暂的 API 失败（使用指数退避）。有关调整 `max_retries` / `timeout` 的默认值、限制和代码示例，请参见 LangChain [Models](/oss/python/langchain/models#connection-resilience) 页面。
</Tip>

## 工具除了用于文件管理和子代理生成的[built-in tools](/oss/python/deepagents/overview#execution-environment)之外，您还可以提供自定义工具：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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


  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[internet_search],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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


  agent = create_deep_agent(
      model="openai:gpt-5.5",
      tools=[internet_search],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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


  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[internet_search],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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


  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[internet_search],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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


  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[internet_search],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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


  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[internet_search],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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


  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      tools=[internet_search],
  )
  ```
</CodeGroup>

### MCP 工具

<Tip>
  Deep Agents完全支持[Model Context Protocol (MCP)](/oss/python/langchain/mcp)工具。您可以从任何 MCP 服务器（数据库、API、文件系统等）加载工具，并将它们直接传递到 `create_deep_agent`。
</Tip>

安装`langchain-mcp-adapters`以连接到MCP服务器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langchain-mcp-adapters
```

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import asyncio
  from langchain_mcp_adapters.client import MultiServerMCPClient
  from deepagents import create_deep_agent


  async def main():
      async with MultiServerMCPClient(
          {
              "my_server": {
                  "transport": "http",
                  "url": "http://localhost:8000/mcp",
              }
          }
      ) as client:
          tools = await client.get_tools()

          agent = create_deep_agent(
              model="google_genai:gemini-3.6-flash",
              tools=tools,
          )

          result = await agent.ainvoke(
              {"messages": [{"role": "user", "content": "Use the MCP server to help me."}]},
              config={"configurable": {"thread_id": "1"}},
          )


  asyncio.run(main())
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import asyncio
  from langchain_mcp_adapters.client import MultiServerMCPClient
  from deepagents import create_deep_agent


  async def main():
      async with MultiServerMCPClient(
          {
              "my_server": {
                  "transport": "http",
                  "url": "http://localhost:8000/mcp",
              }
          }
      ) as client:
          tools = await client.get_tools()

          agent = create_deep_agent(
              model="openai:gpt-5.5",
              tools=tools,
          )

          result = await agent.ainvoke(
              {"messages": [{"role": "user", "content": "Use the MCP server to help me."}]},
              config={"configurable": {"thread_id": "1"}},
          )


  asyncio.run(main())
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import asyncio
  from langchain_mcp_adapters.client import MultiServerMCPClient
  from deepagents import create_deep_agent


  async def main():
      async with MultiServerMCPClient(
          {
              "my_server": {
                  "transport": "http",
                  "url": "http://localhost:8000/mcp",
              }
          }
      ) as client:
          tools = await client.get_tools()

          agent = create_deep_agent(
              model="anthropic:claude-sonnet-4-6",
              tools=tools,
          )

          result = await agent.ainvoke(
              {"messages": [{"role": "user", "content": "Use the MCP server to help me."}]},
              config={"configurable": {"thread_id": "1"}},
          )


  asyncio.run(main())
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import asyncio
  from langchain_mcp_adapters.client import MultiServerMCPClient
  from deepagents import create_deep_agent


  async def main():
      async with MultiServerMCPClient(
          {
              "my_server": {
                  "transport": "http",
                  "url": "http://localhost:8000/mcp",
              }
          }
      ) as client:
          tools = await client.get_tools()

          agent = create_deep_agent(
              model="openrouter:z-ai/glm-5.2",
              tools=tools,
          )

          result = await agent.ainvoke(
              {"messages": [{"role": "user", "content": "Use the MCP server to help me."}]},
              config={"configurable": {"thread_id": "1"}},
          )


  asyncio.run(main())
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import asyncio
  from langchain_mcp_adapters.client import MultiServerMCPClient
  from deepagents import create_deep_agent


  async def main():
      async with MultiServerMCPClient(
          {
              "my_server": {
                  "transport": "http",
                  "url": "http://localhost:8000/mcp",
              }
          }
      ) as client:
          tools = await client.get_tools()

          agent = create_deep_agent(
              model="fireworks:accounts/fireworks/models/glm-5p2",
              tools=tools,
          )

          result = await agent.ainvoke(
              {"messages": [{"role": "user", "content": "Use the MCP server to help me."}]},
              config={"configurable": {"thread_id": "1"}},
          )


  asyncio.run(main())
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import asyncio
  from langchain_mcp_adapters.client import MultiServerMCPClient
  from deepagents import create_deep_agent


  async def main():
      async with MultiServerMCPClient(
          {
              "my_server": {
                  "transport": "http",
                  "url": "http://localhost:8000/mcp",
              }
          }
      ) as client:
          tools = await client.get_tools()

          agent = create_deep_agent(
              model="baseten:zai-org/GLM-5.2",
              tools=tools,
          )

          result = await agent.ainvoke(
              {"messages": [{"role": "user", "content": "Use the MCP server to help me."}]},
              config={"configurable": {"thread_id": "1"}},
          )


  asyncio.run(main())
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import asyncio
  from langchain_mcp_adapters.client import MultiServerMCPClient
  from deepagents import create_deep_agent


  async def main():
      async with MultiServerMCPClient(
          {
              "my_server": {
                  "transport": "http",
                  "url": "http://localhost:8000/mcp",
              }
          }
      ) as client:
          tools = await client.get_tools()

          agent = create_deep_agent(
              model="ollama:north-mini-code-1.0",
              tools=tools,
          )

          result = await agent.ainvoke(
              {"messages": [{"role": "user", "content": "Use the MCP server to help me."}]},
              config={"configurable": {"thread_id": "1"}},
          )


  asyncio.run(main())
  ```
</CodeGroup>

有关详细的配置选项，包括 stdio 服务器、OAuth 身份验证、工具过滤和有状态会话，请参阅完整的 [MCP guide](/oss/python/langchain/mcp)。

## 系统提示

通过`system_prompt=`给代理您自己的指示：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  research_instructions = """\
  You are an expert researcher. Your job is to conduct \
  thorough research, and then write a polished report. \
  """

  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      system_prompt=research_instructions,
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  research_instructions = """\
  You are an expert researcher. Your job is to conduct \
  thorough research, and then write a polished report. \
  """

  agent = create_deep_agent(
      model="openai:gpt-5.5",
      system_prompt=research_instructions,
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  research_instructions = """\
  You are an expert researcher. Your job is to conduct \
  thorough research, and then write a polished report. \
  """

  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      system_prompt=research_instructions,
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  research_instructions = """\
  You are an expert researcher. Your job is to conduct \
  thorough research, and then write a polished report. \
  """

  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      system_prompt=research_instructions,
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  research_instructions = """\
  You are an expert researcher. Your job is to conduct \
  thorough research, and then write a polished report. \
  """

  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      system_prompt=research_instructions,
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  research_instructions = """\
  You are an expert researcher. Your job is to conduct \
  thorough research, and then write a polished report. \
  """

  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      system_prompt=research_instructions,
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent

  research_instructions = """\
  You are an expert researcher. Your job is to conduct \
  thorough research, and then write a polished report. \
  """

  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      system_prompt=research_instructions,
  )
  ```
</CodeGroup>

<Note>
  除了字符串之外，主代理还接受具有结构化[content blocks](/oss/python/langchain/messages#standard-content-blocks)的[⟦T211⟧](https://reference.langchain.com/python/langchain-core/messages/system/SystemMessage)； Deep Agents 保留这些块（[subagent](/oss/python/deepagents/subagents) 字典规范保留字符串）。
</Note><AccordionGroup>
  <Accordion title="Subagent prompts">
    声明式 [subagents](/oss/python/deepagents/subagents) 根据自己的模型解析配置文件覆盖，然后将解析的配置文件的 `base_system_prompt` / `system_prompt_suffix` 应用到子代理编写的 `system_prompt`。仅附带 `system_prompt_suffix`（内置 Anthropic / OpenAI 配置文件的常见情况）的配置文件会附加到编写的提示中。设置 `base_system_prompt` 的配置文件会完全取代它。
  </Accordion>

  <Accordion title="General-purpose subagent prompt">
    自动添加的 [general-purpose subagent](/oss/python/deepagents/subagents#the-general-purpose-subagent) 将其基本提示解析为 **`general_purpose_subagent.system_prompt`（如果设置）-> `HarnessProfile.base_system_prompt`（如果设置）-> SDK 通用默认**，配置文件后缀位于顶部。当两个覆盖字段都被设置时，通用特定的字段获胜，因此调整这两个字段的调用者永远不会看到他们的 GP 覆盖默默地被丢弃：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import (
        GeneralPurposeSubagentProfile,
        HarnessProfile,
        register_harness_profile,
    )

    register_harness_profile(
        "anthropic",
        HarnessProfile(
            base_system_prompt="You are ACME's support orchestrator.",  # main agent
            general_purpose_subagent=GeneralPurposeSubagentProfile(
                system_prompt="You are a research subagent. Cite sources.",  # GP subagent
            ),
            system_prompt_suffix="Always think step by step.",
        ),
    )
    ```

    |堆栈|最终系统提示|
    | ----------- | ------------------------------------------------------- |
    |主代理| `"You are ACME's support orchestrator." + SUFFIX` |
    | GP 子代理 | `"You are a research subagent. Cite sources." + SUFFIX` |
  </Accordion>
</AccordionGroup>

## 中间件

Deep Agents 支持任何 [middleware](/oss/python/langchain/middleware/overview)，包括下面列出的内置中间件、来自 LangChain 的预构建中间件、特定于提供商的中间件以及您自己编写的自定义中间件。将中间件传递给 `create_deep_agent` 的 `middleware` 参数。每个实例都会通过将其 `.name` 与堆栈中已有的内置条目进行匹配来合并到 [Deep Agents stack](#deep-agents-stack) 中：匹配会替换该实例，任何不匹配的内容都会插入到 [⟦T224⟧](https://reference.langchain.com/python/deepagents/middleware/patch_tool_calls/PatchToolCallsMiddleware) 之后。参见[Override a default middleware instance](#override-a-default-middleware-instance)。

### Deep Agents堆栈

`create_deep_agent` 以固定的顺序构建中间件。只需一个模型即可获得 [bare stack](#bare-stack)。 [full stack](#full-stack) 是完整的汇编顺序，包括仅在您传递可选参数或解析的 [harness profile](/oss/python/deepagents/profiles) 贡献它们时出现的槽。

#### 裸栈

只有一个`model`（没有其他可选参数），主代理通常包括：

1.[⟦T227⟧](https://reference.langchain.com/python/deepagents/middleware/filesystem/FilesystemMiddleware)
2. [⟦T228⟧](https://reference.langchain.com/python/deepagents/middleware/subagents/SubAgentMiddleware)（因为 [general-purpose subagent](/oss/python/deepagents/subagents#default-subagent) 是自动添加的，除非线束配置文件禁用它）
3.[⟦T229⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware)
4.[⟦T230⟧](https://reference.langchain.com/python/deepagents/middleware/patch_tool_calls/PatchToolCallsMiddleware)
5. **提示缓存**中间件（始终注册；每个条目在不支持的型号上无操作）
6. **利用配置文件额外**和**排除工具过滤**，如果解析的模型配置文件定义了它们

#### 全栈

从第一个到最后一个：

1. [⟦T231⟧](https://reference.langchain.com/python/deepagents/middleware/skills/SkillsMiddleware)：仅当您通过`skills`时。 **在**文件系统中间件之前注入，因此技能元数据在文件工具运行之前可用。2. [⟦T233⟧](https://reference.langchain.com/python/deepagents/middleware/filesystem/FilesystemMiddleware)：处理文件系统操作，例如读取、写入和导航目录。当您通过`permissions`时，文件系统权限强制执行包含在此处，因此它可以评估代理可能调用的每个工具。

3. [⟦T235⟧](https://reference.langchain.com/python/deepagents/middleware/subagents/SubAgentMiddleware)：仅当至少有一个同步子代理可用时。生成并协调子代理来委派任务。包含在[bare stack](#bare-stack)中，因为默认情况下会自动添加通用子代理；通过禁用该子代理并不传递同步`subagents`来省略它。参见[Running without subagents](/oss/python/deepagents/subagents#running-without-subagents)。

4. [⟦T237⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware)：当对话变长时，压缩消息历史记录以保持在上下文限制内（通过[create\_summarization\_middleware](https://reference.langchain.com/python/deepagents/middleware/summarization/create_summarization_middleware)）。

5. [⟦T238⟧](https://reference.langchain.com/python/deepagents/middleware/patch_tool_calls/PatchToolCallsMiddleware)：当运行在中断后恢复或收到格式错误的工具调用参数时，修复消息历史记录中悬空的工具调用。 **在** Anthropic 提示符缓存和下面的尾堆栈之前运行。

6. [⟦T239⟧](https://reference.langchain.com/python/deepagents/middleware/async_subagents/AsyncSubAgentMiddleware)：仅当您配置异步子代理时。

7. **您的中间件参数**：作为 `middleware` 参数传递的可选中间件在 Patch 之后、堆栈的其余部分之前合并。 `.name` 与上述内置条目之一匹配的实例将替换该实例，而不是复制它；其他任何东西都会降落在这里。参见[Override a default middleware instance](#override-a-default-middleware-instance)。8. **利用配置文件附加**：来自解析的模型配置文件的特定于提供商的中间件（如果有）。

9. **排除工具过滤**：当线束配置文件列出排除工具时，中间件将从代理中删除这些工具。

10. **提示缓存**（[⟦T242⟧](https://reference.langchain.com/python/langchain-anthropic/middleware/prompt_caching/AnthropicPromptCachingMiddleware)和[⟦T243⟧](https://reference.langchain.com/python/langchain-aws/middleware/prompt_caching/BedrockPromptCachingMiddleware)）：两者始终在**补丁之后和中间件之后注册并运行，以便缓存的前缀与实际发送到模型的内容相匹配。它不支持的模型上的每个无操作 (`unsupported_model_behavior="ignore"`)，因此 Anthropic 中间件适用于 Anthropic 模型，而 Bedrock 中间件适用于具有缓存支持的 AWS Bedrock 模型。

11. [⟦T245⟧](https://reference.langchain.com/python/deepagents/middleware/memory/MemoryMiddleware)：仅当您通过`memory`时。

    <Note>
      `MemoryMiddleware` 放置在配置文件附加功能和提示缓存中间件的**之后，因此对注入内存的更新不太可能使缓存前缀无效。 `create_deep_agent` 实现注释中也提出了相同的排序问题。
    </Note>

12. `HumanInTheLoopMiddleware`：仅当您通过`interrupt_on`时。在配置的工具调用时暂停以供人工批准或输入。

### 同步子代理堆栈内置的**通用**子代理和每个声明性同步`SubAgent`图使用`create_deep_agent`在代码中构建的堆栈。它与主要代理在广义上匹配（文件系统、摘要、补丁、配置文件附加、Anthropic和基岩缓存、可选权限），但有两点不同：

* **技能在这些内部代理上**[⟦T253⟧](https://reference.langchain.com/python/deepagents/middleware/patch_tool_calls/PatchToolCallsMiddleware)之后运行（在主代理上，当设置`skills`时，技能在**文件系统中间件之前运行）。
* 子代理图中**没有** [⟦T255⟧](https://reference.langchain.com/python/deepagents/middleware/subagents/SubAgentMiddleware)（只有父代理公开了`task` 工具）。

当声明性子代理设置 `interrupt_on` 时，该值将转发到子代理的 `create_agent`，从而为已配置的工具调用连接人机交互处理。

### 预构建中间件

LangChain 公开了额外的预构建中间件，让您可以添加各种功能，例如重试、回退或 PII 检测。更多信息请参见[Prebuilt middleware](/oss/python/langchain/middleware/built-in)。

`deepagents` 库还公开了 [⟦T260⟧](https://reference.langchain.com/python/deepagents/middleware/summarization/create_summarization_tool_middleware)，使代理能够在适当的时间（例如在任务之间）触发汇总，而不是按照固定的令牌间隔。欲了解更多详情，请参阅[Summarization](/oss/python/deepagents/context-engineering#summarization)。

### 特定于提供商的中间件

对于针对特定 LLM 提供商进行优化的提供商特定中间件，请参阅 [Middleware integrations](/oss/python/integrations/middleware)。### 自定义中间件

您可以提供额外的中间件来扩展功能、添加工具或实现自定义挂钩：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import wrap_tool_call
  from langchain.tools import tool
  from deepagents import create_deep_agent


  @tool
  def get_weather(city: str) -> str:
      """Get the weather in a city."""
      return f"The weather in {city} is sunny."


  call_count = [0]  # Use list to allow modification in nested function


  @wrap_tool_call
  def log_tool_calls(request, handler):
      """Intercept and log every tool call - demonstrates cross-cutting concern."""
      call_count[0] += 1
      tool_name = request.name if hasattr(request, "name") else str(request)

      print(f"[Middleware] Tool call #{call_count[0]}: {tool_name}")
      print(f"[Middleware] Arguments: {request.args if hasattr(request, 'args') else 'N/A'}")

      # Execute the tool call
      result = handler(request)

      # Log the result
      print(f"[Middleware] Tool call #{call_count[0]} completed")

      return result


  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[get_weather],
      middleware=[log_tool_calls],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import wrap_tool_call
  from langchain.tools import tool
  from deepagents import create_deep_agent


  @tool
  def get_weather(city: str) -> str:
      """Get the weather in a city."""
      return f"The weather in {city} is sunny."


  call_count = [0]  # Use list to allow modification in nested function


  @wrap_tool_call
  def log_tool_calls(request, handler):
      """Intercept and log every tool call - demonstrates cross-cutting concern."""
      call_count[0] += 1
      tool_name = request.name if hasattr(request, "name") else str(request)

      print(f"[Middleware] Tool call #{call_count[0]}: {tool_name}")
      print(f"[Middleware] Arguments: {request.args if hasattr(request, 'args') else 'N/A'}")

      # Execute the tool call
      result = handler(request)

      # Log the result
      print(f"[Middleware] Tool call #{call_count[0]} completed")

      return result


  agent = create_deep_agent(
      model="openai:gpt-5.5",
      tools=[get_weather],
      middleware=[log_tool_calls],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import wrap_tool_call
  from langchain.tools import tool
  from deepagents import create_deep_agent


  @tool
  def get_weather(city: str) -> str:
      """Get the weather in a city."""
      return f"The weather in {city} is sunny."


  call_count = [0]  # Use list to allow modification in nested function


  @wrap_tool_call
  def log_tool_calls(request, handler):
      """Intercept and log every tool call - demonstrates cross-cutting concern."""
      call_count[0] += 1
      tool_name = request.name if hasattr(request, "name") else str(request)

      print(f"[Middleware] Tool call #{call_count[0]}: {tool_name}")
      print(f"[Middleware] Arguments: {request.args if hasattr(request, 'args') else 'N/A'}")

      # Execute the tool call
      result = handler(request)

      # Log the result
      print(f"[Middleware] Tool call #{call_count[0]} completed")

      return result


  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[get_weather],
      middleware=[log_tool_calls],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import wrap_tool_call
  from langchain.tools import tool
  from deepagents import create_deep_agent


  @tool
  def get_weather(city: str) -> str:
      """Get the weather in a city."""
      return f"The weather in {city} is sunny."


  call_count = [0]  # Use list to allow modification in nested function


  @wrap_tool_call
  def log_tool_calls(request, handler):
      """Intercept and log every tool call - demonstrates cross-cutting concern."""
      call_count[0] += 1
      tool_name = request.name if hasattr(request, "name") else str(request)

      print(f"[Middleware] Tool call #{call_count[0]}: {tool_name}")
      print(f"[Middleware] Arguments: {request.args if hasattr(request, 'args') else 'N/A'}")

      # Execute the tool call
      result = handler(request)

      # Log the result
      print(f"[Middleware] Tool call #{call_count[0]} completed")

      return result


  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[get_weather],
      middleware=[log_tool_calls],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import wrap_tool_call
  from langchain.tools import tool
  from deepagents import create_deep_agent


  @tool
  def get_weather(city: str) -> str:
      """Get the weather in a city."""
      return f"The weather in {city} is sunny."


  call_count = [0]  # Use list to allow modification in nested function


  @wrap_tool_call
  def log_tool_calls(request, handler):
      """Intercept and log every tool call - demonstrates cross-cutting concern."""
      call_count[0] += 1
      tool_name = request.name if hasattr(request, "name") else str(request)

      print(f"[Middleware] Tool call #{call_count[0]}: {tool_name}")
      print(f"[Middleware] Arguments: {request.args if hasattr(request, 'args') else 'N/A'}")

      # Execute the tool call
      result = handler(request)

      # Log the result
      print(f"[Middleware] Tool call #{call_count[0]} completed")

      return result


  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[get_weather],
      middleware=[log_tool_calls],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import wrap_tool_call
  from langchain.tools import tool
  from deepagents import create_deep_agent


  @tool
  def get_weather(city: str) -> str:
      """Get the weather in a city."""
      return f"The weather in {city} is sunny."


  call_count = [0]  # Use list to allow modification in nested function


  @wrap_tool_call
  def log_tool_calls(request, handler):
      """Intercept and log every tool call - demonstrates cross-cutting concern."""
      call_count[0] += 1
      tool_name = request.name if hasattr(request, "name") else str(request)

      print(f"[Middleware] Tool call #{call_count[0]}: {tool_name}")
      print(f"[Middleware] Arguments: {request.args if hasattr(request, 'args') else 'N/A'}")

      # Execute the tool call
      result = handler(request)

      # Log the result
      print(f"[Middleware] Tool call #{call_count[0]} completed")

      return result


  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[get_weather],
      middleware=[log_tool_calls],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import wrap_tool_call
  from langchain.tools import tool
  from deepagents import create_deep_agent


  @tool
  def get_weather(city: str) -> str:
      """Get the weather in a city."""
      return f"The weather in {city} is sunny."


  call_count = [0]  # Use list to allow modification in nested function


  @wrap_tool_call
  def log_tool_calls(request, handler):
      """Intercept and log every tool call - demonstrates cross-cutting concern."""
      call_count[0] += 1
      tool_name = request.name if hasattr(request, "name") else str(request)

      print(f"[Middleware] Tool call #{call_count[0]}: {tool_name}")
      print(f"[Middleware] Arguments: {request.args if hasattr(request, 'args') else 'N/A'}")

      # Execute the tool call
      result = handler(request)

      # Log the result
      print(f"[Middleware] Tool call #{call_count[0]} completed")

      return result


  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      tools=[get_weather],
      middleware=[log_tool_calls],
  )
  ```
</CodeGroup>

<Warning>
  **初始化后不要改变属性**

  如果您需要跟踪挂钩调用之间的值（例如计数器或累积数据），请使用图形状态。
  图状态的设计范围仅限于线程，因此更新在并发情况下是安全的。

  **这样做：**

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.agents.middleware import AgentMiddleware


  class CustomMiddleware(AgentMiddleware):
      def __init__(self):
          pass

      def before_agent(self, state, runtime):
          return {"x": state.get("x", 0) + 1}  # Update graph state instead
  ```

  **不要**这样做：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  class CustomMiddlewareBad(AgentMiddleware):
      def __init__(self):
          self.x = 1

      def before_agent(self, state, runtime):
          self.x += 1  # Mutation causes race conditions
  ```

  适当的修改，例如修改 `before_agent` 中的 `self.x` 或更改钩子中的其他共享值，可能会导致微妙的错误和竞争条件，因为许多操作是并发运行的（子代理、并行工具和不同线程上的并行调用）。

  有关使用自定义属性扩展状态的完整详细信息，请参阅[Custom middleware - Custom state schema](/oss/python/langchain/middleware/custom#custom-state-schema)。

  如果必须在自定义中间件中使用突变，请考虑当子代理、并行工具或并发代理调用同时运行时会发生什么情况。
</Warning>

### 覆盖默认中间件实例

<Note>
  通过匹配 `.name` 覆盖默认中间件需要 `deepagents>=0.7`。
</Note>传递一个中间件实例，其 `.name` 与 [Deep Agents stack](#deep-agents-stack) 中的条目匹配，例如 [⟦T266⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware)，以就地替换该内置实例，而不是附加重复项。您传递的任何中间件，其 `.name` **不** 匹配内置条目，都不会被替换，它位于最后一个核心中间件条目之后、配置文件、提示缓存和内存之前。完整订购请参见[Full stack](#full-stack)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import create_deep_agent
from deepagents.backends import StateBackend
from deepagents.middleware import SummarizationMiddleware

backend = StateBackend()
model = "openai:gpt-5.5"

custom_summarization = SummarizationMiddleware(
    model=model,
    backend=backend,
    summary_prompt="Your custom summary prompt here.",
)

agent = create_deep_agent(
    model=model,
    middleware=[custom_summarization],  # replaces the default SummarizationMiddleware
)
```

<Note>
  覆盖**替换**默认的中间件实例，但不会与其合并。这意味着您的替代品必须完全配置其所需的任何设置。这对于`FilesystemMiddleware`尤其重要：如果您覆盖它，则必须将`backend`（和`permissions`，如果适用）直接传递给您的自定义实例，因为它不会继承传递给`create_deep_agent()`的`backend=`和`permissions=`。要限制可用的文件系统工具，请将 `tools` 允许列表传递给您的自定义 [⟦T275⟧](https://reference.langchain.com/python/deepagents/middleware/filesystem/FilesystemMiddleware) 实例；请参阅[Virtual filesystem access](/oss/python/deepagents/overview#virtual-filesystem-access)“限制文件系统工具”示例。
</Note>

Deep Agents 自动添加的通用子代理从主代理继承其默认中间件的覆盖，而不继承特定于主代理的中间件。通过`subagents=`定义的声明性子代理不会继承主代理的中间件定制。直接在该子代理自己的 [⟦T277⟧](/oss/python/deepagents/subagents#subagent-dictionary-based) 字段中传递覆盖以将其应用到那里；该字段与 [synchronous subagent stack](#synchronous-subagent-stack) 匹配，就像 `middleware=` 与主要代理的匹配一样。

#### 示例

<AccordionGroup>
  <Accordion title="Adjust when summarization triggers" icon="adjustments">
    使用自定义 `trigger` 和 `keep` 阈值覆盖 [⟦T279⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware)，以早于或晚于默认值压缩对话历史记录，并控制每次压缩后有多少条最新消息。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import create_deep_agent
    from deepagents.backends import StateBackend
    from deepagents.middleware import SummarizationMiddleware

    backend = StateBackend()
    model = "anthropic:claude-sonnet-4-6"

    agent = create_deep_agent(
        model=model,
        middleware=[
            SummarizationMiddleware(
                model=model,
                backend=backend,
                trigger=("tokens", 100000),  # summarize once the conversation exceeds 100k tokens
                keep=("messages", 20),  # keep the most recent 20 messages verbatim
            ),
        ],
    )
    ```

    `trigger` 还接受 `("fraction", ...)` 作为模型上下文窗口的百分比，并且阈值列表将它们与 OR 语义结合起来。有关全套选项，请参阅[⟦T284⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware) 参考。
  </Accordion>

  <Accordion title="Update the prompt cache TTL" icon="clock">
    覆盖 [⟦T285⟧](https://reference.langchain.com/python/langchain-anthropic/middleware/prompt_caching/AnthropicPromptCachingMiddleware) 以将缓存生命周期延长到默认的 `5m` TTL 之外，这对于轮次间隔较长的代理很有用。请参阅 [Prompt caching](/oss/python/deepagents/overview#prompt-caching) 了解默认情况下如何应用缓存。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import create_deep_agent
    from langchain_anthropic.middleware import AnthropicPromptCachingMiddleware

    agent = create_deep_agent(
        model="anthropic:claude-sonnet-4-6",
        middleware=[
            AnthropicPromptCachingMiddleware(ttl="1h"),  # replaces the default 5m TTL
        ],
    )
    ```
  </Accordion>

  <Accordion title="Restrict the enabled filesystem tools" icon="filter">
    <Note>
      `FilesystemMiddleware` 上的 `tools` 允许列表需要 `deepagents>=0.7`。
    </Note>

    使用 `tools` 白名单覆盖 [⟦T290⟧](https://reference.langchain.com/python/deepagents/middleware/filesystem/FilesystemMiddleware)，以仅向模型公开文件系统工具的子集，而不是完整的默认集。

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import create_deep_agent
    from deepagents.backends import StateBackend
    from deepagents.middleware import FilesystemMiddleware

    backend = StateBackend()

    # Read-only agent: write_file, edit_file, delete, and execute are never shown
    agent = create_deep_agent(
        model="anthropic:claude-sonnet-4-6",
        backend=backend,
        middleware=[
            FilesystemMiddleware(backend=backend, tools=["read_file", "ls", "glob", "grep"]),
        ],
    )
    ```更多详情请参见[Restricting filesystem tools](/oss/python/deepagents/overview#virtual-filesystem-access)​​。
  </Accordion>
</AccordionGroup>

### 口译员

使用 [interpreters](/oss/python/deepagents/interpreters) 添加在限定范围的 QuickJS 运行时中运行 JavaScript 的 `eval` 工具。当代理需要以编程方式组合工具、批处理工作、处理代码中的错误或在没有完整 shell 环境的情况下转换结构化数据时，解释器非常有用。

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from langchain_quickjs import CodeInterpreterMiddleware

  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      middleware=[CodeInterpreterMiddleware()],
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from langchain_quickjs import CodeInterpreterMiddleware

  agent = create_deep_agent(
      model="openai:gpt-5.5",
      middleware=[CodeInterpreterMiddleware()],
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from langchain_quickjs import CodeInterpreterMiddleware

  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      middleware=[CodeInterpreterMiddleware()],
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from langchain_quickjs import CodeInterpreterMiddleware

  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      middleware=[CodeInterpreterMiddleware()],
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from langchain_quickjs import CodeInterpreterMiddleware

  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      middleware=[CodeInterpreterMiddleware()],
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from langchain_quickjs import CodeInterpreterMiddleware

  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      middleware=[CodeInterpreterMiddleware()],
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from deepagents import create_deep_agent
  from langchain_quickjs import CodeInterpreterMiddleware

  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      middleware=[CodeInterpreterMiddleware()],
  )
  ```
</CodeGroup>

有关设置、编程工具调用、子代理编排和限制，请参阅[Interpreters](/oss/python/deepagents/interpreters)。

## 子代理

要隔离详细工作并避免上下文膨胀，请使用子代理：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os
from typing import Literal

from deepagents import create_deep_agent
from tavily import TavilyClient

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


research_subagent = {
    "name": "research-agent",
    "description": "Used to research more in depth questions",
    "system_prompt": "You are a great researcher",
    "tools": [internet_search],
    "model": "openai:gpt-5.5",  # Optional override, defaults to main agent model
}
subagents = [research_subagent]

agent = create_deep_agent(
    model="google_genai:gemini-3.6-flash",
    subagents=subagents,
)
```

有关更多信息，请参阅[Subagents](/oss/python/deepagents/subagents)。

## 后端

深度代理工具可以利用虚拟文件系统来存储、访问和编辑文件。默认情况下，深度代理使用[⟦T293⟧](https://reference.langchain.com/python/deepagents/backends/state/StateBackend)。

如果您使用[skills](#skills)或[memory](#memory)，则必须在创建代理之前将所需的技能或内存文件添加到后端。

<Tabs>
  <Tab title="StateBackend">
    存储在`langgraph`状态的线程范围文件系统后端。

    文件在线程内持续存在（通过检查点），并且不会跨线程共享。

    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend

      # By default we provide a StateBackend
      agent = create_deep_agent(model="google_genai:gemini-3.6-flash")

      # Under the hood, it looks like
      agent2 = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StateBackend(),
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend

      # By default we provide a StateBackend
      agent = create_deep_agent(model="openai:gpt-5.5")

      # Under the hood, it looks like
      agent2 = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StateBackend(),
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend

      # By default we provide a StateBackend
      agent = create_deep_agent(model="anthropic:claude-sonnet-4-6")

      # Under the hood, it looks like
      agent2 = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StateBackend(),
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend

      # By default we provide a StateBackend
      agent = create_deep_agent(model="openrouter:z-ai/glm-5.2")

      # Under the hood, it looks like
      agent2 = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StateBackend(),
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend

      # By default we provide a StateBackend
      agent = create_deep_agent(model="fireworks:accounts/fireworks/models/glm-5p2")

      # Under the hood, it looks like
      agent2 = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StateBackend(),
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend

      # By default we provide a StateBackend
      agent = create_deep_agent(model="baseten:zai-org/GLM-5.2")

      # Under the hood, it looks like
      agent2 = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StateBackend(),
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend

      # By default we provide a StateBackend
      agent = create_deep_agent(model="ollama:north-mini-code-1.0")

      # Under the hood, it looks like
      agent2 = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StateBackend(),
      )
      ```
    </CodeGroup>
  </Tab><Tab title="FilesystemBackend">
    本地计算机的文件系统。

    <Warning>
      该后端授予代理直接文件系统读/写访问权限。
      请谨慎使用，并且仅在适当的环境中使用。
      有关更多信息，请参阅[⟦T295⟧](/oss/python/deepagents/backends#filesystembackend-local-disk)。
    </Warning>

    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=FilesystemBackend(root_dir=".", virtual_mode=True),
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=FilesystemBackend(root_dir=".", virtual_mode=True),
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=FilesystemBackend(root_dir=".", virtual_mode=True),
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=FilesystemBackend(root_dir=".", virtual_mode=True),
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=FilesystemBackend(root_dir=".", virtual_mode=True),
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=FilesystemBackend(root_dir=".", virtual_mode=True),
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=FilesystemBackend(root_dir=".", virtual_mode=True),
      )
      ```
    </CodeGroup>

    <Tip>
      将 `FilesystemBackend` 包装在 `CompositeBackend` 中，以防止内部代理数据（卸载的工具结果、对话历史记录）与项目文件一起写入磁盘。请参阅[recommended pattern](/oss/python/deepagents/backends#filesystembackend-local-disk)。
    </Tip>
  </Tab>

  <Tab title="LocalShellBackend">
    直接在主机上执行 shell 的文件系统。提供文件系统工具以及用于运行命令的`execute`工具。

    <Warning>
      该后端向代理授予直接文件系统读/写访问权限**和**在主机上不受限制的 shell 执行。
      请务必谨慎使用，并且仅在适当的环境中使用。
      有关更多信息，请参阅[⟦T299⟧](/oss/python/deepagents/backends#localshellbackend-local-shell)。
    </Warning>

    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import LocalShellBackend

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=LocalShellBackend(root_dir=".", virtual_mode=True, env={"PATH": "/usr/bin:/bin"}),
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import LocalShellBackend

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=LocalShellBackend(root_dir=".", virtual_mode=True, env={"PATH": "/usr/bin:/bin"}),
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import LocalShellBackend

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=LocalShellBackend(root_dir=".", virtual_mode=True, env={"PATH": "/usr/bin:/bin"}),
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import LocalShellBackend

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=LocalShellBackend(root_dir=".", virtual_mode=True, env={"PATH": "/usr/bin:/bin"}),
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import LocalShellBackend

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=LocalShellBackend(root_dir=".", virtual_mode=True, env={"PATH": "/usr/bin:/bin"}),
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import LocalShellBackend

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=LocalShellBackend(root_dir=".", virtual_mode=True, env={"PATH": "/usr/bin:/bin"}),
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import LocalShellBackend

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=LocalShellBackend(root_dir=".", virtual_mode=True, env={"PATH": "/usr/bin:/bin"}),
      )
      ```
    </CodeGroup>
  </Tab>

  <Tab title="StoreBackend">
    提供“跨线程持久化”长期存储的文件系统。<CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=StoreBackend(
              namespace=lambda rt: (rt.server_info.user.identity,),
          ),
          store=InMemoryStore(),  # Good for local dev; omit for LangSmith Deployment
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StoreBackend(
              namespace=lambda rt: (rt.server_info.user.identity,),
          ),
          store=InMemoryStore(),  # Good for local dev; omit for LangSmith Deployment
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=StoreBackend(
              namespace=lambda rt: (rt.server_info.user.identity,),
          ),
          store=InMemoryStore(),  # Good for local dev; omit for LangSmith Deployment
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=StoreBackend(
              namespace=lambda rt: (rt.server_info.user.identity,),
          ),
          store=InMemoryStore(),  # Good for local dev; omit for LangSmith Deployment
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=StoreBackend(
              namespace=lambda rt: (rt.server_info.user.identity,),
          ),
          store=InMemoryStore(),  # Good for local dev; omit for LangSmith Deployment
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=StoreBackend(
              namespace=lambda rt: (rt.server_info.user.identity,),
          ),
          store=InMemoryStore(),  # Good for local dev; omit for LangSmith Deployment
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=StoreBackend(
              namespace=lambda rt: (rt.server_info.user.identity,),
          ),
          store=InMemoryStore(),  # Good for local dev; omit for LangSmith Deployment
      )
      ```
    </CodeGroup>

    <Note>
      部署到[LangSmith Deployment](/langsmith/deployment)时，省略`store`参数。平台自动为您的代理商提供商店。
    </Note>

    <Tip>
      `namespace`参数控制数据隔离。对于多用户部署，请始终设置 [namespace factory](/oss/python/deepagents/backends#namespace-factories) 来隔离每个用户或租户的数据。
    </Tip>
  </Tab>

  <Tab title="ContextHubBackend">
    LangSmith Hub 存储库中的持久文件系统存储。

    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import ContextHubBackend

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=ContextHubBackend("my-agent"),
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import ContextHubBackend

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=ContextHubBackend("my-agent"),
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import ContextHubBackend

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=ContextHubBackend("my-agent"),
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import ContextHubBackend

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=ContextHubBackend("my-agent"),
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import ContextHubBackend

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=ContextHubBackend("my-agent"),
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import ContextHubBackend

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=ContextHubBackend("my-agent"),
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import ContextHubBackend

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=ContextHubBackend("my-agent"),
      )
      ```
    </CodeGroup>

    欲了解更多详情，请参阅[⟦T302⟧](/oss/python/deepagents/backends#contexthubbackend)。
  </Tab>

  <Tab title="CompositeBackend">
    灵活的后端，您可以在文件系统中指定不同的路由以指向不同的后端。

    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=CompositeBackend(
              default=StateBackend(),
              routes={
                  "/memories/": StoreBackend(namespace=lambda _rt: ("memories",)),
              },
          ),
          store=InMemoryStore(),  # Store passed to create_deep_agent, not backend
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=CompositeBackend(
              default=StateBackend(),
              routes={
                  "/memories/": StoreBackend(namespace=lambda _rt: ("memories",)),
              },
          ),
          store=InMemoryStore(),  # Store passed to create_deep_agent, not backend
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=CompositeBackend(
              default=StateBackend(),
              routes={
                  "/memories/": StoreBackend(namespace=lambda _rt: ("memories",)),
              },
          ),
          store=InMemoryStore(),  # Store passed to create_deep_agent, not backend
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=CompositeBackend(
              default=StateBackend(),
              routes={
                  "/memories/": StoreBackend(namespace=lambda _rt: ("memories",)),
              },
          ),
          store=InMemoryStore(),  # Store passed to create_deep_agent, not backend
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=CompositeBackend(
              default=StateBackend(),
              routes={
                  "/memories/": StoreBackend(namespace=lambda _rt: ("memories",)),
              },
          ),
          store=InMemoryStore(),  # Store passed to create_deep_agent, not backend
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=CompositeBackend(
              default=StateBackend(),
              routes={
                  "/memories/": StoreBackend(namespace=lambda _rt: ("memories",)),
              },
          ),
          store=InMemoryStore(),  # Store passed to create_deep_agent, not backend
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
      from langgraph.store.memory import InMemoryStore

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=CompositeBackend(
              default=StateBackend(),
              routes={
                  "/memories/": StoreBackend(namespace=lambda _rt: ("memories",)),
              },
          ),
          store=InMemoryStore(),  # Store passed to create_deep_agent, not backend
      )
      ```
    </CodeGroup>
  </Tab>
</Tabs>

有关更多信息，请参阅[Backends](/oss/python/deepagents/backends)。

### 沙盒沙箱是专门的 [backends](/oss/python/deepagents/backends)，它在具有自己的文件系统和用于 shell 命令的 `execute` 工具的隔离环境中运行代理代码。
当您希望深度代理写入文件、安装依赖项并运行命令而不更改本地计算机上的任何内容时，请使用沙箱后端。

在创建深度代理时，您可以通过将沙箱后端传递给 `backend` 来配置沙箱：

<Tabs>
  <Tab title="LangSmith">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install "langsmith[sandbox]"
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add "langsmith[sandbox]"
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import create_deep_agent
    from deepagents.backends import LangSmithSandbox
    from langchain_anthropic import ChatAnthropic
    from langsmith.sandbox import SandboxClient

    client = SandboxClient()
    ls_sandbox = client.create_sandbox()
    backend = LangSmithSandbox(sandbox=ls_sandbox)

    agent = create_deep_agent(
        model=ChatAnthropic(model="claude-sonnet-4-6"),
        system_prompt="You are a Python coding assistant with sandbox access.",
        backend=backend,
    )
    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Create a small Python package and run pytest",
                    }
                ]
            }
        )
    finally:
        client.delete_sandbox(ls_sandbox.name)
    ```
  </Tab>

  <Tab title="Daytona">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langchain-daytona
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-daytona
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from daytona import Daytona
    from deepagents import create_deep_agent
    from langchain_anthropic import ChatAnthropic
    from langchain_daytona import DaytonaSandbox

    sandbox = Daytona().create()
    backend = DaytonaSandbox(sandbox=sandbox)

    agent = create_deep_agent(
        model=ChatAnthropic(model="claude-sonnet-4-6"),
        system_prompt="You are a Python coding assistant with sandbox access.",
        backend=backend,
    )

    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Create a small Python package and run pytest",
                    }
                ]
            }
        )
    finally:
        sandbox.stop()
    ```
  </Tab>

  <Tab title="E2B">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langchain-e2b
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-e2b
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from e2b import Sandbox
    from deepagents import create_deep_agent
    from langchain_anthropic import ChatAnthropic
    from langchain_e2b import E2BSandbox

    e2b_sandbox = Sandbox.create()
    backend = E2BSandbox(sandbox=e2b_sandbox)

    agent = create_deep_agent(
        model=ChatAnthropic(model="claude-sonnet-4-6"),
        system_prompt="You are a Python coding assistant with sandbox access.",
        backend=backend,
    )

    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Create a small Python package and run pytest",
                    }
                ]
            }
        )
    finally:
        e2b_sandbox.kill()
    ```
  </Tab>

  <Tab title="Modal">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langchain-modal
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-modal
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import modal
    from deepagents import create_deep_agent
    from langchain_anthropic import ChatAnthropic
    from langchain_modal import ModalSandbox

    app = modal.App.lookup("your-app")
    modal_sandbox = modal.Sandbox.create(app=app)
    backend = ModalSandbox(sandbox=modal_sandbox)

    agent = create_deep_agent(
        model=ChatAnthropic(model="claude-sonnet-4-6"),
        system_prompt="You are a Python coding assistant with sandbox access.",
        backend=backend,
    )
    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Create a small Python package and run pytest",
                    }
                ]
            }
        )
    finally:
        modal_sandbox.terminate()
    ```
  </Tab>

  <Tab title="Runloop">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langchain-runloop
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-runloop
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import os

    from deepagents import create_deep_agent
    from langchain_anthropic import ChatAnthropic
    from langchain_runloop import RunloopSandbox
    from runloop_api_client import RunloopSDK

    client = RunloopSDK(bearer_token=os.environ["RUNLOOP_API_KEY"])

    devbox = client.devbox.create()
    backend = RunloopSandbox(devbox=devbox)

    agent = create_deep_agent(
        model=ChatAnthropic(model="claude-sonnet-4-6"),
        system_prompt="You are a Python coding assistant with sandbox access.",
        backend=backend,
    )

    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Create a small Python package and run pytest",
                    }
                ]
            }
        )
    finally:
        devbox.shutdown()
    ```
  </Tab>

  <Tab title="Vercel">
    <CodeGroup>
      ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      pip install langchain-vercel-sandbox
      ```

      ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      uv add langchain-vercel-sandbox
      ```
    </CodeGroup>

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import create_deep_agent
    from langchain_anthropic import ChatAnthropic
    from langchain_vercel_sandbox import VercelSandbox
    from vercel.sandbox import Sandbox

    sandbox = Sandbox.create(runtime="python3.13")
    backend = VercelSandbox(sandbox=sandbox)

    agent = create_deep_agent(
        model=ChatAnthropic(model="claude-sonnet-4-6"),
        system_prompt="You are a Python coding assistant with sandbox access.",
        backend=backend,
    )

    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": "Create a small Python package and run pytest",
                    }
                ]
            }
        )
    finally:
        sandbox.stop()
    ```
  </Tab>
</Tabs>

有关更多信息，请参阅[Sandboxes](/oss/python/deepagents/sandboxes)。

## 人机交互

某些工具操作可能很敏感，需要人工批准才能执行。
您可以为每个工具配置批准：

<CodeGroup>
  ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from deepagents import create_deep_agent
  from langgraph.checkpoint.memory import MemorySaver


  @tool
  def remove_file(path: str) -> str:
      """Delete a file from the filesystem."""
      return f"Deleted {path}"


  @tool
  def fetch_file(path: str) -> str:
      """Read a file from the filesystem."""
      return f"Contents of {path}"


  @tool
  def notify_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return f"Sent email to {to}"


  # Checkpointer is REQUIRED for human-in-the-loop
  checkpointer = MemorySaver()

  agent = create_deep_agent(
      model="google_genai:gemini-3.6-flash",
      tools=[remove_file, fetch_file, notify_email],
      interrupt_on={
          "remove_file": True,  # Default: approve, edit, reject, respond
          "fetch_file": False,  # No interrupts needed
          "notify_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
      },
      checkpointer=checkpointer,  # Required!
  )
  ```

  ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from deepagents import create_deep_agent
  from langgraph.checkpoint.memory import MemorySaver


  @tool
  def remove_file(path: str) -> str:
      """Delete a file from the filesystem."""
      return f"Deleted {path}"


  @tool
  def fetch_file(path: str) -> str:
      """Read a file from the filesystem."""
      return f"Contents of {path}"


  @tool
  def notify_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return f"Sent email to {to}"


  # Checkpointer is REQUIRED for human-in-the-loop
  checkpointer = MemorySaver()

  agent = create_deep_agent(
      model="openai:gpt-5.5",
      tools=[remove_file, fetch_file, notify_email],
      interrupt_on={
          "remove_file": True,  # Default: approve, edit, reject, respond
          "fetch_file": False,  # No interrupts needed
          "notify_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
      },
      checkpointer=checkpointer,  # Required!
  )
  ```

  ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from deepagents import create_deep_agent
  from langgraph.checkpoint.memory import MemorySaver


  @tool
  def remove_file(path: str) -> str:
      """Delete a file from the filesystem."""
      return f"Deleted {path}"


  @tool
  def fetch_file(path: str) -> str:
      """Read a file from the filesystem."""
      return f"Contents of {path}"


  @tool
  def notify_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return f"Sent email to {to}"


  # Checkpointer is REQUIRED for human-in-the-loop
  checkpointer = MemorySaver()

  agent = create_deep_agent(
      model="anthropic:claude-sonnet-4-6",
      tools=[remove_file, fetch_file, notify_email],
      interrupt_on={
          "remove_file": True,  # Default: approve, edit, reject, respond
          "fetch_file": False,  # No interrupts needed
          "notify_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
      },
      checkpointer=checkpointer,  # Required!
  )
  ```

  ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from deepagents import create_deep_agent
  from langgraph.checkpoint.memory import MemorySaver


  @tool
  def remove_file(path: str) -> str:
      """Delete a file from the filesystem."""
      return f"Deleted {path}"


  @tool
  def fetch_file(path: str) -> str:
      """Read a file from the filesystem."""
      return f"Contents of {path}"


  @tool
  def notify_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return f"Sent email to {to}"


  # Checkpointer is REQUIRED for human-in-the-loop
  checkpointer = MemorySaver()

  agent = create_deep_agent(
      model="openrouter:z-ai/glm-5.2",
      tools=[remove_file, fetch_file, notify_email],
      interrupt_on={
          "remove_file": True,  # Default: approve, edit, reject, respond
          "fetch_file": False,  # No interrupts needed
          "notify_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
      },
      checkpointer=checkpointer,  # Required!
  )
  ```

  ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from deepagents import create_deep_agent
  from langgraph.checkpoint.memory import MemorySaver


  @tool
  def remove_file(path: str) -> str:
      """Delete a file from the filesystem."""
      return f"Deleted {path}"


  @tool
  def fetch_file(path: str) -> str:
      """Read a file from the filesystem."""
      return f"Contents of {path}"


  @tool
  def notify_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return f"Sent email to {to}"


  # Checkpointer is REQUIRED for human-in-the-loop
  checkpointer = MemorySaver()

  agent = create_deep_agent(
      model="fireworks:accounts/fireworks/models/glm-5p2",
      tools=[remove_file, fetch_file, notify_email],
      interrupt_on={
          "remove_file": True,  # Default: approve, edit, reject, respond
          "fetch_file": False,  # No interrupts needed
          "notify_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
      },
      checkpointer=checkpointer,  # Required!
  )
  ```

  ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from deepagents import create_deep_agent
  from langgraph.checkpoint.memory import MemorySaver


  @tool
  def remove_file(path: str) -> str:
      """Delete a file from the filesystem."""
      return f"Deleted {path}"


  @tool
  def fetch_file(path: str) -> str:
      """Read a file from the filesystem."""
      return f"Contents of {path}"


  @tool
  def notify_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return f"Sent email to {to}"


  # Checkpointer is REQUIRED for human-in-the-loop
  checkpointer = MemorySaver()

  agent = create_deep_agent(
      model="baseten:zai-org/GLM-5.2",
      tools=[remove_file, fetch_file, notify_email],
      interrupt_on={
          "remove_file": True,  # Default: approve, edit, reject, respond
          "fetch_file": False,  # No interrupts needed
          "notify_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
      },
      checkpointer=checkpointer,  # Required!
  )
  ```

  ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langchain.tools import tool
  from deepagents import create_deep_agent
  from langgraph.checkpoint.memory import MemorySaver


  @tool
  def remove_file(path: str) -> str:
      """Delete a file from the filesystem."""
      return f"Deleted {path}"


  @tool
  def fetch_file(path: str) -> str:
      """Read a file from the filesystem."""
      return f"Contents of {path}"


  @tool
  def notify_email(to: str, subject: str, body: str) -> str:
      """Send an email."""
      return f"Sent email to {to}"


  # Checkpointer is REQUIRED for human-in-the-loop
  checkpointer = MemorySaver()

  agent = create_deep_agent(
      model="ollama:north-mini-code-1.0",
      tools=[remove_file, fetch_file, notify_email],
      interrupt_on={
          "remove_file": True,  # Default: approve, edit, reject, respond
          "fetch_file": False,  # No interrupts needed
          "notify_email": {"allowed_decisions": ["approve", "reject"]},  # No editing
      },
      checkpointer=checkpointer,  # Required!
  )
  ```
</CodeGroup>您可以在工具调用时以及工具调用内部为代理和子代理配置中断。
有关更多信息，请参阅[Human-in-the-loop](/oss/python/deepagents/human-in-the-loop)。

## 技能

您可以使用[skills](/oss/python/deepagents/overview)为您的深度代理提供新的功能和专业知识。
虽然 [tools](/oss/python/deepagents/customization#tools) 倾向于涵盖较低级别的功能，例如本机文件系统操作，但技能可以包含有关如何完成任务、参考信息和其他资产（例如模板）的详细说明。
仅当代理确定该技能对当前提示有用时，代理才会加载这些文件。
这种渐进式披露减少了代理在启动时必须考虑的令牌和上下文的数量。

例如技能，请参阅[Deep Agents example skills](https://github.com/langchain-ai/deepagentsjs/tree/main/examples/skills)。

要为深度代理添加技能，请将它们作为参数传递给 `create_deep_agent`：

<Tabs>
  <Tab title="StateBackend">
    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      checkpointer = MemorySaver()
      backend = StateBackend()

      skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
      with urlopen(skill_url) as response:
          skill_content = response.read().decode('utf-8')

      skills_files = {
          "/skills/langgraph-docs/SKILL.md": create_file_data(skill_content),
      }

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=backend,
          skills=["/skills/"],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [{"role": "user", "content": "What is langgraph?"}],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": skills_files,
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      checkpointer = MemorySaver()
      backend = StateBackend()

      skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
      with urlopen(skill_url) as response:
          skill_content = response.read().decode('utf-8')

      skills_files = {
          "/skills/langgraph-docs/SKILL.md": create_file_data(skill_content),
      }

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=backend,
          skills=["/skills/"],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [{"role": "user", "content": "What is langgraph?"}],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": skills_files,
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      checkpointer = MemorySaver()
      backend = StateBackend()

      skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
      with urlopen(skill_url) as response:
          skill_content = response.read().decode('utf-8')

      skills_files = {
          "/skills/langgraph-docs/SKILL.md": create_file_data(skill_content),
      }

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=backend,
          skills=["/skills/"],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [{"role": "user", "content": "What is langgraph?"}],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": skills_files,
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      checkpointer = MemorySaver()
      backend = StateBackend()

      skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
      with urlopen(skill_url) as response:
          skill_content = response.read().decode('utf-8')

      skills_files = {
          "/skills/langgraph-docs/SKILL.md": create_file_data(skill_content),
      }

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=backend,
          skills=["/skills/"],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [{"role": "user", "content": "What is langgraph?"}],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": skills_files,
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      checkpointer = MemorySaver()
      backend = StateBackend()

      skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
      with urlopen(skill_url) as response:
          skill_content = response.read().decode('utf-8')

      skills_files = {
          "/skills/langgraph-docs/SKILL.md": create_file_data(skill_content),
      }

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=backend,
          skills=["/skills/"],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [{"role": "user", "content": "What is langgraph?"}],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": skills_files,
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      checkpointer = MemorySaver()
      backend = StateBackend()

      skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
      with urlopen(skill_url) as response:
          skill_content = response.read().decode('utf-8')

      skills_files = {
          "/skills/langgraph-docs/SKILL.md": create_file_data(skill_content),
      }

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=backend,
          skills=["/skills/"],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [{"role": "user", "content": "What is langgraph?"}],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": skills_files,
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen
      from deepagents import create_deep_agent
      from deepagents.backends import StateBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      checkpointer = MemorySaver()
      backend = StateBackend()

      skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
      with urlopen(skill_url) as response:
          skill_content = response.read().decode('utf-8')

      skills_files = {
          "/skills/langgraph-docs/SKILL.md": create_file_data(skill_content),
      }

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=backend,
          skills=["/skills/"],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [{"role": "user", "content": "What is langgraph?"}],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": skills_files,
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```
    </CodeGroup>
  </Tab>

  <Tab title="StoreBackend">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from urllib.request import urlopen
    from deepagents import create_deep_agent
    from deepagents.backends import StoreBackend
    from deepagents.backends.utils import create_file_data
    from langgraph.store.memory import InMemoryStore

    store = InMemoryStore()
    backend = StoreBackend(namespace=lambda _rt: ("filesystem",))

    skill_url = "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/libs/cli/examples/skills/langgraph-docs/SKILL.md"
    with urlopen(skill_url) as response:
        skill_content = response.read().decode('utf-8')

    store.put(
        namespace=("filesystem",),
        key="/skills/langgraph-docs/SKILL.md",
        value=create_file_data(skill_content),
    )

    agent = create_deep_agent(
        model="google_genai:gemini-3.6-flash",
        backend=backend,
        store=store,
        skills=["/skills/"],
    )

    result = agent.invoke(
        {"messages": [{"role": "user", "content": "What is langgraph?"}]},
        config={"configurable": {"thread_id": "12345"}},
    )
    ```
  </Tab>

  <Tab title="FilesystemBackend">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from deepagents import create_deep_agent
    from deepagents.backends.filesystem import FilesystemBackend
    from langgraph.checkpoint.memory import MemorySaver

    # Checkpointer is REQUIRED for human-in-the-loop
    checkpointer = MemorySaver()
    root_dir = "/Users/user/{project}"
    backend = FilesystemBackend(root_dir=root_dir)

    agent = create_deep_agent(
        model="google_genai:gemini-3.6-flash",
        backend=backend,
        skills=[str(Path(root_dir) / "skills")],
        interrupt_on={
            "write_file": True,
            "read_file": False,
            "edit_file": True,
        },
        checkpointer=checkpointer, # Required!
    )

    result = agent.invoke(
        {"messages": [{"role": "user", "content": "What is langgraph?"}]},
        config={"configurable": {"thread_id": "12345"}},
    )
    ```
  </Tab>
</Tabs>

## 内存

使用 [⟦T306⟧ files](https://agents.md/) 为您的深度代理提供额外的上下文。

<Tip>
  要生成编码代理通过`AGENTS.md`发现的存储库wiki，请参阅[OpenWiki](/oss/openwiki/overview)。
</Tip>创建深度代理时，您可以将一个或多个文件路径传递给 `memory` 参数：

<Tabs>
  <Tab title="StateBackend">
    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          memory=[
              "/AGENTS.md"
          ],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "123456"}},
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          memory=[
              "/AGENTS.md"
          ],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "123456"}},
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          memory=[
              "/AGENTS.md"
          ],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "123456"}},
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          memory=[
              "/AGENTS.md"
          ],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "123456"}},
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          memory=[
              "/AGENTS.md"
          ],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "123456"}},
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          memory=[
              "/AGENTS.md"
          ],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "123456"}},
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends.utils import create_file_data
      from langgraph.checkpoint.memory import MemorySaver

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          memory=[
              "/AGENTS.md"
          ],
          checkpointer=checkpointer,
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              # Seed the default StateBackend's in-state filesystem (virtual paths must start with "/").
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "123456"}},
      )
      ```
    </CodeGroup>
  </Tab>

  <Tab title="StoreBackend">
    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.store.memory import InMemoryStore

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")

      # Create the store and add the file to it
      store = InMemoryStore()
      file_data = create_file_data(agents_md)
      store.put(
          namespace=("filesystem",),
          key="/AGENTS.md",
          value=file_data,
      )

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=StoreBackend(namespace=lambda _rt: ("filesystem",)),
          store=store,
          memory=["/AGENTS.md"],
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.store.memory import InMemoryStore

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")

      # Create the store and add the file to it
      store = InMemoryStore()
      file_data = create_file_data(agents_md)
      store.put(
          namespace=("filesystem",),
          key="/AGENTS.md",
          value=file_data,
      )

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=StoreBackend(namespace=lambda _rt: ("filesystem",)),
          store=store,
          memory=["/AGENTS.md"],
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.store.memory import InMemoryStore

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")

      # Create the store and add the file to it
      store = InMemoryStore()
      file_data = create_file_data(agents_md)
      store.put(
          namespace=("filesystem",),
          key="/AGENTS.md",
          value=file_data,
      )

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=StoreBackend(namespace=lambda _rt: ("filesystem",)),
          store=store,
          memory=["/AGENTS.md"],
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.store.memory import InMemoryStore

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")

      # Create the store and add the file to it
      store = InMemoryStore()
      file_data = create_file_data(agents_md)
      store.put(
          namespace=("filesystem",),
          key="/AGENTS.md",
          value=file_data,
      )

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=StoreBackend(namespace=lambda _rt: ("filesystem",)),
          store=store,
          memory=["/AGENTS.md"],
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.store.memory import InMemoryStore

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")

      # Create the store and add the file to it
      store = InMemoryStore()
      file_data = create_file_data(agents_md)
      store.put(
          namespace=("filesystem",),
          key="/AGENTS.md",
          value=file_data,
      )

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=StoreBackend(namespace=lambda _rt: ("filesystem",)),
          store=store,
          memory=["/AGENTS.md"],
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.store.memory import InMemoryStore

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")

      # Create the store and add the file to it
      store = InMemoryStore()
      file_data = create_file_data(agents_md)
      store.put(
          namespace=("filesystem",),
          key="/AGENTS.md",
          value=file_data,
      )

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=StoreBackend(namespace=lambda _rt: ("filesystem",)),
          store=store,
          memory=["/AGENTS.md"],
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from urllib.request import urlopen

      from deepagents import create_deep_agent
      from deepagents.backends import StoreBackend
      from deepagents.backends.utils import create_file_data
      from langgraph.store.memory import InMemoryStore

      with urlopen(
          "https://raw.githubusercontent.com/langchain-ai/deepagents/refs/heads/main/examples/text-to-sql-agent/AGENTS.md"
      ) as response:
          agents_md = response.read().decode("utf-8")

      # Create the store and add the file to it
      store = InMemoryStore()
      file_data = create_file_data(agents_md)
      store.put(
          namespace=("filesystem",),
          key="/AGENTS.md",
          value=file_data,
      )

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=StoreBackend(namespace=lambda _rt: ("filesystem",)),
          store=store,
          memory=["/AGENTS.md"],
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
              "files": {"/AGENTS.md": create_file_data(agents_md)},
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```
    </CodeGroup>
  </Tab>

  <Tab title="FilesystemBackend">
    <CodeGroup>
      ```python Google theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend
      from langgraph.checkpoint.memory import MemorySaver

      # Checkpointer is REQUIRED for human-in-the-loop
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="google_genai:gemini-3.6-flash",
          backend=FilesystemBackend(root_dir="/Users/user/{project}"),
          memory=[
              "./AGENTS.md"
          ],
          interrupt_on={
              "write_file": True,  # Default: approve, edit, reject
              "read_file": False,  # No interrupts needed
              "edit_file": True,   # Default: approve, edit, reject
          },
          checkpointer=checkpointer,  # Required!
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python OpenAI theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend
      from langgraph.checkpoint.memory import MemorySaver

      # Checkpointer is REQUIRED for human-in-the-loop
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="openai:gpt-5.5",
          backend=FilesystemBackend(root_dir="/Users/user/{project}"),
          memory=[
              "./AGENTS.md"
          ],
          interrupt_on={
              "write_file": True,  # Default: approve, edit, reject
              "read_file": False,  # No interrupts needed
              "edit_file": True,   # Default: approve, edit, reject
          },
          checkpointer=checkpointer,  # Required!
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Anthropic theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend
      from langgraph.checkpoint.memory import MemorySaver

      # Checkpointer is REQUIRED for human-in-the-loop
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="anthropic:claude-sonnet-4-6",
          backend=FilesystemBackend(root_dir="/Users/user/{project}"),
          memory=[
              "./AGENTS.md"
          ],
          interrupt_on={
              "write_file": True,  # Default: approve, edit, reject
              "read_file": False,  # No interrupts needed
              "edit_file": True,   # Default: approve, edit, reject
          },
          checkpointer=checkpointer,  # Required!
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python OpenRouter theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend
      from langgraph.checkpoint.memory import MemorySaver

      # Checkpointer is REQUIRED for human-in-the-loop
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="openrouter:z-ai/glm-5.2",
          backend=FilesystemBackend(root_dir="/Users/user/{project}"),
          memory=[
              "./AGENTS.md"
          ],
          interrupt_on={
              "write_file": True,  # Default: approve, edit, reject
              "read_file": False,  # No interrupts needed
              "edit_file": True,   # Default: approve, edit, reject
          },
          checkpointer=checkpointer,  # Required!
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Fireworks theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend
      from langgraph.checkpoint.memory import MemorySaver

      # Checkpointer is REQUIRED for human-in-the-loop
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="fireworks:accounts/fireworks/models/glm-5p2",
          backend=FilesystemBackend(root_dir="/Users/user/{project}"),
          memory=[
              "./AGENTS.md"
          ],
          interrupt_on={
              "write_file": True,  # Default: approve, edit, reject
              "read_file": False,  # No interrupts needed
              "edit_file": True,   # Default: approve, edit, reject
          },
          checkpointer=checkpointer,  # Required!
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Baseten theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend
      from langgraph.checkpoint.memory import MemorySaver

      # Checkpointer is REQUIRED for human-in-the-loop
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="baseten:zai-org/GLM-5.2",
          backend=FilesystemBackend(root_dir="/Users/user/{project}"),
          memory=[
              "./AGENTS.md"
          ],
          interrupt_on={
              "write_file": True,  # Default: approve, edit, reject
              "read_file": False,  # No interrupts needed
              "edit_file": True,   # Default: approve, edit, reject
          },
          checkpointer=checkpointer,  # Required!
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```

      ```python Ollama theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      from deepagents import create_deep_agent
      from deepagents.backends import FilesystemBackend
      from langgraph.checkpoint.memory import MemorySaver

      # Checkpointer is REQUIRED for human-in-the-loop
      checkpointer = MemorySaver()

      agent = create_deep_agent(
          model="ollama:north-mini-code-1.0",
          backend=FilesystemBackend(root_dir="/Users/user/{project}"),
          memory=[
              "./AGENTS.md"
          ],
          interrupt_on={
              "write_file": True,  # Default: approve, edit, reject
              "read_file": False,  # No interrupts needed
              "edit_file": True,   # Default: approve, edit, reject
          },
          checkpointer=checkpointer,  # Required!
      )

      result = agent.invoke(
          {
              "messages": [
                  {
                      "role": "user",
                      "content": "Please tell me what's in your memory files.",
                  }
              ],
          },
          config={"configurable": {"thread_id": "12345"}},
      )
      ```
    </CodeGroup>
  </Tab>
</Tabs>

## 个人资料

[harness profile](/oss/python/deepagents/profiles#harness-profiles) 是每个模型配置的可重用包，当选择匹配模型时，`create_deep_agent` 自动应用。当您想要遵循模型（而不是调用站点）的行为时，配置文件是正确的工具，例如针对 Claude 指令风格调整的系统提示后缀、为 GPT 重写的工具描述或仅对特定提供商有意义的额外中间件。

单个配置文件可以包含：自定义基本系统提示符 (`base_system_prompt`)、附加后缀 (`system_prompt_suffix`)、工具描述覆盖、要排除的工具或中间件、要注入的其他中间件以及对自动添加的通用子代理的编辑。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from deepagents import HarnessProfile, register_harness_profile

# Append a system-prompt suffix whenever gpt-5.5 is selected.
register_harness_profile(
    "openai:gpt-5.5",
    HarnessProfile(system_prompt_suffix="Respond in under 100 words."),
)
```请参阅 [Profiles](/oss/python/deepagents/profiles) 了解注册密钥、合并语义和插件打包。一个更窄的配套 API [provider profiles](/oss/python/deepagents/profiles#provider-profiles)，为提供者打包模型构造参数（API 密钥、超时、重试设置）。

## 结构化输出

Deep Agents支持[structured output](/oss/python/langchain/structured-output)。
您可以通过将其作为`response_format`参数传递给`create_deep_agent()`调用来设置所需的结构化输出模式。
当模型生成结构化数据时，它会被捕获、验证并以深度代理状态的“structed\_response”键返回。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os
from typing import Literal

from pydantic import BaseModel, Field
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


class WeatherReport(BaseModel):
    """A structured weather report with current conditions and forecast."""
    location: str = Field(description="The location for this weather report")
    temperature: float = Field(description="Current temperature in Celsius")
    condition: str = Field(
        description="Current weather condition (e.g., sunny, cloudy, rainy)"
    )
    humidity: int = Field(description="Humidity percentage")
    wind_speed: float = Field(description="Wind speed in km/h")
    forecast: str = Field(description="Brief forecast for the next 24 hours")


agent = create_deep_agent(
    model=model,
    response_format=WeatherReport,
    tools=[internet_search],
)

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "What's the weather like in San Francisco?",
            }
        ]
    }
)

print(result["structured_response"])
# location='San Francisco, California' temperature=18.3 condition='Sunny' humidity=48 wind_speed=7.6 forecast='Pleasant sunny conditions expected to continue with temperatures around 64°F (18°C) during the day, dropping to around 52°F (11°C) at night. Clear skies with minimal precipitation expected.'
```

有关更多信息和示例，请参阅[response format](/oss/python/langchain/structured-output#response-format)。

## 高级

`create_deep_agent` 在[⟦T315⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 之上预组装中间件堆栈。要构建完全自定义的代理（准确选择要包含的功能），请参阅[Configure the harness](/oss/python/langchain/agents#configure-the-harness)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/customization.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>