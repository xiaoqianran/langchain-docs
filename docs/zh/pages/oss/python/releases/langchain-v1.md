<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: What's new in LangChain v1 | https://docs.langchain.com/oss/python/releases/langchain-v1 -->

# LangChain v1 的新功能

**LangChain v1 是一个专注于构建代理的生产就绪基础。**我们围绕三个核心改进简化了框架：

<CardGroup>
  <Card title="create_agent" icon="robot" href="#create_agent">
    LangChain构建代理新标准，取代`langgraph.prebuilt.create_react_agent`。
  </Card>

  <Card title="Standard content blocks" icon="cube" href="#standard-content-blocks">
    新的 `content_blocks` 属性提供对跨提供商的现代 LLM 功能的统一访问。
  </Card>

  <Card title="Simplified namespace" icon="sitemap" href="#simplified-package">
    `langchain`命名空间已经过简化，专注于代理的基本构建块，并将遗留功能移至`langchain-classic`。
  </Card>
</CardGroup>

要升级，

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install -U langchain
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain
  ```
</CodeGroup>

有关更改的完整列表，请参阅 [migration guide](/oss/python/migrate/langchain-v1)。

## `create_agent`

[⟦T16⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)是LangChain1.0中构建代理的标准方式。它提供了比 [⟦T17⟧](https://reference.langchain.com/python/langchain-classic/agents/react/agent/create_react_agent) 更简单的界面，同时通过使用 [middleware](#middleware) 提供了更大的定制潜力。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent

agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[search_web, analyze_data, send_email],
    system_prompt="You are a helpful research assistant."
)

result = agent.invoke({
    "messages": [
        {"role": "user", "content": "Research AI safety trends"}
    ]
})
```

在底层，[⟦T18⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)构建在基本代理循环之上——调用模型，让它选择要执行的工具，然后在不再调用工具时完成：

<div>
  <img alt="Core agent loop diagram" />
</div>

欲了解更多信息，请参阅[Agents](/oss/python/langchain/agents)。

### 中间件

中间件是 [⟦T19⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 的定义特征。它提供了一个高度可定制的入口点，提高了您可以构建的上限。优秀的代理需要[context engineering](/oss/python/langchain/context-engineering)：在正确的时间向模型提供正确的信息。中间件可帮助您通过可组合的抽象来控制动态提示、对话摘要、选择性工具访问、状态管理和护栏。

#### 预构建中间件

LangChain为常见模式提供了一些[prebuilt middlewares](/oss/python/langchain/middleware#built-in-middleware)，包括：

* [⟦T20⟧](https://reference.langchain.com/python/langchain/agents/middleware/pii/PIIMiddleware)：在发送给模型之前编辑敏感信息
* [⟦T21⟧](https://reference.langchain.com/python/langchain/agents/middleware/summarization/SummarizationMiddleware)：当对话历史记录太长时压缩它
* [⟦T22⟧](https://reference.langchain.com/python/langchain/agents/middleware/human_in_the_loop/HumanInTheLoopMiddleware)：敏感工具调用需要批准

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.middleware import (
    PIIMiddleware,
    SummarizationMiddleware,
    HumanInTheLoopMiddleware
)


agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[read_email, send_email],
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        PIIMiddleware(
            "phone_number",
            detector=(
                r"(?:\+?\d{1,3}[\s.-]?)?"
                r"(?:\(?\d{2,4}\)?[\s.-]?)?"
                r"\d{3,4}[\s.-]?\d{4}"
			),
			strategy="block"
        ),
        SummarizationMiddleware(
            model="claude-sonnet-4-6",
            trigger={"tokens": 500}
        ),
        HumanInTheLoopMiddleware(
            interrupt_on={
                "send_email": {
                    "allowed_decisions": ["approve", "edit", "reject"]
                }
            }
        ),
    ]
)
```

#### 自定义中间件

您还可以构建自定义中间件来满足您的需求。中间件在代理执行的每个步骤中公开钩子：

<div>
  <img alt="Middleware flow diagram" />
</div>

通过在 [⟦T23⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentMiddleware) 类的子类上实现任何这些钩子来构建自定义中间件：|钩|当它运行时 |使用案例 |
| ----------------- | ------------------------ | --------------------------------------- |
| `before_agent` |致电代理之前 |加载内存，验证输入 |
| `before_model` |在每次LLM通话之前|更新提示、修剪消息 |
| `wrap_model_call` |围绕每个法学硕士通话|拦截并修改请求/响应 |
| `wrap_tool_call` |围绕每个工具调用|拦截并修改工具执行 |
| `after_model` |每次LLM回复后|验证输出，应用护栏 |
| `after_agent` |代理完成后 |保存结果，清理|

自定义中间件示例：

```python expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from dataclasses import dataclass
from typing import Callable

from langchain_openai import ChatOpenAI

from langchain.agents.middleware import (
    AgentMiddleware,
    ModelRequest
)
from langchain.agents.middleware.types import ModelResponse

@dataclass
class Context:
    user_expertise: str = "beginner"

class ExpertiseBasedToolMiddleware(AgentMiddleware):
    def wrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse]
    ) -> ModelResponse:
        user_level = request.runtime.context.user_expertise

        if user_level == "expert":
            # More powerful model
            model = ChatOpenAI(model="gpt-5.5")
            tools = [advanced_search, data_analysis]
        else:
            # Less powerful model
            model = ChatOpenAI(model="gpt-5-nano")
            tools = [simple_search, basic_calculator]

        return handler(request.override(model=model, tools=tools))

agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[
        simple_search,
        advanced_search,
        basic_calculator,
        data_analysis
    ],
    middleware=[ExpertiseBasedToolMiddleware()],
    context_schema=Context
)
```

欲了解更多信息，请参阅[the complete middleware guide](/oss/python/langchain/middleware)。

### 建立在 LangGraph 上

由于 [⟦T30⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 构建于 [LangGraph](/oss/python/langgraph) 之上，因此您可以通过以下方式自动获得对长期运行且可靠的代理的内置支持：

<CardGroup>
  <Card title="Persistence" icon="database">
    通过内置检查点，对话自动在会话之间持续存在
  </Card>

  <Card title="Streaming" icon="droplet">
    实时流式传输令牌、工具调用和推理跟踪
  </Card>

  <Card title="Human-in-the-loop" icon="hand-stop">
    在敏感操作之前暂停代理执行以供人工批准
  </Card><Card title="Time travel" icon="history">
    将对话倒回到任意点并探索替代路径和提示
  </Card>
</CardGroup>

您无需学习 LangGraph 即可使用这些功能——它们开箱即用。

### 结构化输出

[⟦T31⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent) 改进了结构化输出生成：

* **主循环集成**：结构化输出现在在主循环中生成，而不需要额外的 LLM 调用
* **结构化输出策略**：模型可以选择调用工具或使用提供者端结构化输出生成
* **降低成本**：消除额外的法学硕士通话带来的额外费用

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from pydantic import BaseModel


class Weather(BaseModel):
    temperature: float
    condition: str

def weather_tool(city: str) -> str:
    """Get the weather for a city."""
    return f"it's sunny and 70 degrees in {city}"

agent = create_agent(
    "gpt-5.4-mini",
    tools=[weather_tool],
    response_format=ToolStrategy(Weather)
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "What's the weather in SF?"}]
})

print(repr(result["structured_response"]))
# results in `Weather(temperature=70.0, condition='sunny')`
```

**错误处理**：通过`handle_errors`参数到`ToolStrategy`控制错误处理：

* **解析错误**：模型生成的数据与所需的结构不匹配
* **多个工具调用**：模型为结构化输出模式生成 2 个以上的工具调用

***

## 标准内容块

<Note>
  内容块支持当前仅适用于以下集成：

  * [⟦T34⟧](https://pypi.org/project/langchain-anthropic/)
  * [⟦T35⟧](https://pypi.org/project/langchain-aws/)
  * [⟦T36⟧](https://pypi.org/project/langchain-openai/)
  * [⟦T37⟧](https://pypi.org/project/langchain-google-genai/)
  * [⟦T38⟧](https://pypi.org/project/langchain-ollama/)

  更多提供商将逐步推出对内容块的更广泛支持。
</Note>新的 [⟦T39⟧](https://reference.langchain.com/python/langchain-core/messages/base/BaseMessage) 属性引入了跨提供商工作的消息内容的标准表示形式：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-sonnet-4-6")
response = model.invoke("What's the capital of France?")

# Unified access to content blocks
for block in response.content_blocks:
    if block["type"] == "reasoning":
        print(f"Model reasoning: {block['reasoning']}")
    elif block["type"] == "text":
        print(f"Response: {block['text']}")
    elif block["type"] == "tool_call":
        print(f"Tool call: {block['name']}({block['args']})")
```

### 好处

* **与提供商无关**：无论提供商如何，都可以使用相同的 API 访问推理跟踪、引文、内置工具（网络搜索、代码解释器等）和其他功能
* **类型安全**：所有内容块类型的完整类型提示
* **向后兼容**：标准内容可以是[loaded lazily](/oss/python/langchain/messages#standard-content-blocks)，因此没有相关的重大更改

有关更多信息，请参阅我们的 [content blocks](/oss/python/langchain/messages#standard-content-blocks) 指南。

***

## 简化包

LangChain v1 简化了[⟦T40⟧](https://pypi.org/project/langchain/)包命名空间，以专注于代理的基本构建块。精炼的命名空间公开了最有用和最相关的功能：

### 命名空间|模块|有什么可用的 |笔记|
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| [⟦T41⟧](https://reference.langchain.com/python/langchain/agents) | [⟦T42⟧](https://reference.langchain.com/python/langchain/agents/factory/create_agent)、[⟦T43⟧](https://reference.langchain.com/python/langchain/agents/middleware/types/AgentState) |核心代理创建功能 |
| [⟦T44⟧](https://reference.langchain.com/python/langchain/messages) |消息类型，[content blocks](https://reference.langchain.com/python/langchain-core/messages/content/ContentBlock)，[⟦T45⟧](https://reference.langchain.com/python/langchain-core/messages/utils/trim_messages) |从[⟦T46⟧](https://reference.langchain.com/python/langchain-core/)转口|
| [⟦T47⟧](https://reference.langchain.com/python/langchain/tools) | [⟦T48⟧](https://reference.langchain.com/python/langchain-core/tools/convert/tool)、[⟦T49⟧](https://reference.langchain.com/python/langchain-core/tools/base/BaseTool)、注射助手|从[⟦T50⟧](https://reference.langchain.com/python/langchain-core/)转口|| [⟦T51⟧](https://reference.langchain.com/python/langchain/models) | [⟦T52⟧](https://reference.langchain.com/python/langchain/chat_models/base/init_chat_model)、[⟦T53⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel) |统一模型初始化 |
| [⟦T54⟧](https://reference.langchain.com/python/langchain/embeddings) | [⟦T55⟧](https://reference.langchain.com/python/langchain-core/embeddings/embeddings/Embeddings)、[⟦T56⟧](https://reference.langchain.com/python/langchain/embeddings/base/init_embeddings) |嵌入模型|

为了方便起见，其中大部分都是从 `langchain-core` 重新导出的，这为您提供了一个用于构建代理的集中 API 界面。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# Agent building
from langchain.agents import create_agent

# Messages and content
from langchain.messages import AIMessage, HumanMessage

# Tools
from langchain.tools import tool

# Model initialization
from langchain.chat_models import init_chat_model
from langchain.embeddings import init_embeddings
```

### `langchain-classic`

旧功能已转移到[⟦T59⟧](https://pypi.org/project/langchain-classic)，以保持核心包的精简和集中。

**`langchain-classic`中有什么：**

* 遗留链和链实现
* 检索器（例如 `MultiQueryRetriever` 或之前的 `langchain.retrievers` 模块中的任何内容）
* 索引API
* hub模块（用于以编程方式管理提示）
* [⟦T63⟧](https://pypi.org/project/langchain-community) 出口
* 其他已弃用的功能

如果您使用任何此功能，请安装[⟦T64⟧](https://pypi.org/project/langchain-classic)：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langchain-classic
  ```

  ```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  uv add langchain-classic
  ```
</CodeGroup>

然后更新您的导入：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain import ...  # [!code --]
from langchain_classic import ...  # [!code ++]

from langchain.chains import ...  # [!code --]
from langchain_classic.chains import ...  # [!code ++]

from langchain.retrievers import ...  # [!code --]
from langchain_classic.retrievers import ...  # [!code ++]

from langchain import hub  # [!code --]
from langchain_classic import hub  # [!code ++]
```

## 迁移指南

请参阅我们的[migration guide](/oss/python/migrate/langchain-v1)以获取将代码更新到 LangChain v1 的帮助。

## 报告问题

请使用 `'v1'` [label](https://github.com/langchain-ai/langchain/issues?q=state%3Aopen%20label%3Av1) 报告 1.0 在 [GitHub](https://github.com/langchain-ai/langchain/issues) 上发现的任何问题。

## 其他资源

<CardGroup>
  <Card title="LangChain 1.0" icon="rocket" href="https://blog.langchain.com/langchain-langchain-1-0-alpha-releases/">
    阅读公告
  </Card>

  <Card title="Middleware guide" icon="puzzle" href="https://blog.langchain.com/agent-middleware/">
    深入研究中间件
  </Card><Card title="Agents Documentation" icon="book" href="/oss/python/langchain/agents">
    完整的代理文档
  </Card>

  <Card title="Message Content" icon="message" href="/oss/python/langchain/messages#message-content">
    新内容块 API
  </Card>

  <Card title="Migration guide" icon="arrows-exchange" href="/oss/python/migrate/langchain-v1">
    如何迁移到LangChain v1
  </Card>

  <Card title="GitHub" icon="brand-github" href="https://github.com/langchain-ai/langchain">
    报告问题或贡献
  </Card>
</CardGroup>

## 另请参阅

* [Versioning](/oss/python/versioning) – 了解版本号
* [Release policy](/oss/python/release-policy) – 详细发布政策

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/releases/langchain-v1.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>