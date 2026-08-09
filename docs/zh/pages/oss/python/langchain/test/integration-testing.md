<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Integration testing | https://docs.langchain.com/oss/python/langchain/test/integration-testing -->

# 集成测试

通过组织测试、管理密钥、处理不稳定和控制成本，使用真正的 LLM API 来测试代理。

集成测试验证您的代理是否可以与模型 API 和外部服务正常工作。与使用伪造和模拟的[unit tests](/oss/python/langchain/test/unit-testing)不同，集成测试会进行实际的网络调用，以确认组件可以协同工作、凭证有效并且延迟是可以接受的。

由于 LLM 响应是不确定的，因此集成测试需要与传统软件测试不同的策略。本指南介绍了如何为代理组织、编写和运行集成测试。对于LangChain本身贡献时的一般测试基础设施，请参阅[Contributing to code](/oss/python/contributing/code#running-tests)。

## 单独的单元测试和集成测试

集成测试速度较慢并且需要 API 凭据，因此请将它们与单元测试分开。这使您可以对每次更改运行快速单元测试，并为 CI 或预部署检查保留集成测试。

使用 pytest 标记来标记集成测试：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import pytest

@pytest.mark.integration
def test_agent_with_real_model():
    agent = create_agent("claude-sonnet-4-6", tools=[get_weather])
    result = agent.invoke({
        "messages": [HumanMessage(content="What's the weather in SF?")]
    })
    assert len(result["messages"]) > 1
```

配置 pytest 以识别标记并从默认运行中排除集成测试：

<CodeGroup>
  ```ini pytest.ini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  [pytest]
  markers =
      integration: tests that call real LLM APIs
  addopts = -m "not integration"
  ```

  ```toml pyproject.toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  [tool.pytest.ini_options]
  markers = [
    "integration: tests that call real LLM APIs"
  ]
  addopts = "-m 'not integration'"
  ```
</CodeGroup>

显式运行集成测试：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pytest -m integration
```

## 管理 API 密钥集成测试需要真实的 API 凭据。从环境变量加载它们，以便密钥不受源代码控制。

使用 `conftest.py` 夹具来验证所需的密钥是否可用：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os
import pytest

@pytest.fixture(autouse=True)
def check_api_keys():
    if not os.environ.get("OPENAI_API_KEY"):
        pytest.skip("OPENAI_API_KEY not set")
```

对于本地开发，将密钥存储在 `.env` 文件中并使用 [⟦T15⟧](https://pypi.org/project/python-dotenv/) 加载它们：

```bash .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
OPENAI_API_KEY=sk-...
```

```python conftest.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from dotenv import load_dotenv

load_dotenv()
```

<Warning>
  将 `.env` 添加到您的 `.gitignore` 以避免提交凭据。在 CI 中，通过提供商的机密管理（例如 GitHub Actions 机密）注入机密。
</Warning>

## 断言结构，而不是内容

LLM 的反应因运行而异。不要对确切的输出字符串进行断言，而是验证响应的结构属性：消息类型、工具调用名称、参数形状和消息计数。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def test_agent_calls_weather_tool():
    agent = create_agent("claude-sonnet-4-6", tools=[get_weather])
    result = agent.invoke({
        "messages": [HumanMessage(content="What's the weather in SF?")]
    })

    messages = result["messages"]
    tool_calls = [
        tc
        for msg in messages
        if hasattr(msg, "tool_calls")
        for tc in (msg.tool_calls or [])
    ]

    assert any(tc["name"] == "get_weather" for tc in tool_calls)
    assert isinstance(messages[-1], AIMessage)
    assert len(messages[-1].content) > 0
```

<Tip>
  对于更严格的轨迹断言，请使用支持模糊匹配模式的[AgentEvals](/oss/python/langchain/test/evals)评估器，例如`unordered`和`superset`。
</Tip>

## 降低成本和延迟

调用 LLM API 的集成测试会产生实际成本。一些做法有助于保持测试套件快速且经济实惠：* **使用较小的模型**：`gemini-3.1-flash-lite`或等效模型，用于仅需要验证工具调用和响应结构的测试。
* **设置`maxTokens`**：限制响应长度以避免长时间、昂贵的完成。
* **限制测试范围**：每个测试测试一种行为。当单轮测试就足够时，避免链接许多 LLM 调用的端到端场景。
* **选择性运行**：使用[above](#separate-unit-and-integration-tests)的测试分离仅在 CI 中或部署之前运行集成测试，而不是在每个文件保存时运行。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
agent = create_agent(
    "gemini-3.1-flash-lite",
    tools=[get_weather],
    model_kwargs={"max_tokens": 256},
)
```

## 记录和重放 HTTP 调用

对于在 CI 中频繁运行的测试，您可以在第一次运行时记录 HTTP 交互，并在后续运行时重播它们，而无需进行真正的 API 调用。这消除了初始录制后的成本和延迟。

[⟦T22⟧](https://pypi.org/project/vcrpy/1.5.2/) 将 HTTP 请求/响应对记录到 YAML“盒式”文件中。 [⟦T23⟧](https://pypi.org/project/pytest-recording/) 插件将其与 pytest 集成。

设置您的 `conftest.py` 以过滤磁带中的敏感信息：

```py conftest.py theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import pytest

@pytest.fixture(scope="session")
def vcr_config():
    return {
        "filter_headers": [
            ("authorization", "XXXX"),
            ("x-api-key", "XXXX"),
        ],
        "filter_query_parameters": [
            ("api_key", "XXXX"),
            ("key", "XXXX"),
        ],
    }
```

配置您的项目以识别 `vcr` 标记：

<CodeGroup>
  ```ini pytest.ini theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  [pytest]
  markers =
      vcr: record/replay HTTP via VCR
  addopts = --record-mode=once
  ```

  ```toml pyproject.toml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  [tool.pytest.ini_options]
  markers = [
    "vcr: record/replay HTTP via VCR"
  ]
  addopts = "--record-mode=once"
  ```
</CodeGroup>

<Info>
  `--record-mode=once` 选项在第一次运行时记录 HTTP 交互，并在后续运行时重放它们。
</Info>

使用 `vcr` 标记装饰您的测试：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@pytest.mark.vcr()
def test_agent_trajectory():
    agent = create_agent("claude-sonnet-4-6", tools=[get_weather])
    result = agent.invoke({
        "messages": [HumanMessage(content="What's the weather in SF?")]
    })
    assert any(
        tc["name"] == "get_weather"
        for msg in result["messages"]
        if hasattr(msg, "tool_calls")
        for tc in (msg.tool_calls or [])
    )
```第一次运行进行真正的网络调用并在`tests/cassettes/`中生成盒式磁带文件。随后的运行将重放记录的响应。

<Warning>
  当您修改提示、添加新工具或更改预期轨迹时，您保存的包埋盒将变得过时，并且您现有的测试**将失败**。删除相应的盒式磁带文件并重新运行测试以记录新的交互。
</Warning>

## 后续步骤

了解如何使用确定性匹配或 LLM-as-judge 评估器来评估代理轨迹[Evals](/oss/python/langchain/test/evals)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/test/integration-testing.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>