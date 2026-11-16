<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Browserbase integrations | https://docs.langchain.com/oss/python/integrations/providers/browserbase -->

# 浏览器库集成

使用 LangChain Python 与 Browserbase 集成。

[Browserbase](https://www.browserbase.com) 为代理运行云浏览器，并使用 [session recordings](https://docs.browserbase.com/platform/browser/observability/observability) 和 [live view](https://docs.browserbase.com/platform/browser/observability/session-live-view) 进行调试。相同的 API 密钥涵盖 [Search](https://docs.browserbase.com/platform/search/overview) 和 [Fetch](https://docs.browserbase.com/platform/fetch/overview)，它们无需启动浏览器会话即可查找和读取页面。

本页介绍如何使用 Browserbase 和 [Deep Agents](/oss/python/deepagents/overview)：Stagehand 驱动的云浏览器，以及作为代理工具的 Search 和 Fetch。

## 安装和设置

从 [Browserbase](https://www.browserbase.com) 获取 API 密钥并将其设置为环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export BROWSERBASE_API_KEY="your-browserbase-api-key"
```

安装[Browserbase Python SDK](https://github.com/browserbase/sdk-python)：

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install "browserbase>=1.21.0"
```

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add "browserbase>=1.21.0"
```

## Deep Agents

[deep agent](/oss/python/deepagents/overview) 可以通过两种方式使用 Browserbase：通过 Stagehand 工具驱动的云浏览器，以及用于不需要浏览器的页面的搜索和获取工具。有关何时为代理提供浏览器的信息，请参阅[Browser use](/oss/python/deepagents/browser-use)。

### 带有 Stagehand 的浏览器工具

[Stagehand integration](/oss/python/integrations/tools/stagehand)通过原生Python中间件添加了`run`、`snapshot`和`screenshot`。将配置好的 Stagehand 客户端传递给 `StagehandMiddleware`，然后将其包含在代理的 `middleware` 列表中。不需要 MCP 服务器或自定义浏览器系统提示。

您的应用程序拥有浏览器，并且可以在运行期间保持其打开状态以重用选项卡和登录名。有关安装、完整代理和清理的信息，请参阅[Use with a deep agent](/oss/python/integrations/tools/stagehand#use-with-a-deep-agent)。关于会话隔离，请参见[Choose a browser scope](/oss/python/deepagents/browser-use#choose-a-browser-scope)。

### 搜索和获取工具将搜索和获取公开为代理工具。这些 API 无需启动浏览器会话即可查找和读取页面。 Fetch 不执行 JavaScript。

在运行此示例之前安装代理包并设置模型提供者凭据：

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install "browserbase>=1.21.0" deepagents langchain-openai
```

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add "browserbase>=1.21.0" deepagents langchain-openai
```

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENAI_API_KEY="your-openai-api-key"
```

该示例使用 OpenAI 的 [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol) 模型。省略 `search.web` 上的 `provider` 以使用项目的默认搜索提供程序：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from browserbase import Browserbase
from deepagents import create_deep_agent
from langchain.tools import tool

bb = Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])


@tool
def web_search(query: str) -> str:
    """Search the web and return result titles and URLs."""
    response = bb.search.web(query=query, num_results=5)
    return "\n".join(f"{result.title}: {result.url}" for result in response.results)


@tool
def fetch_page(url: str) -> str:
    """Fetch a page as markdown without opening a browser."""
    return bb.fetch_api.create(url=url, format="markdown").content


agent = create_deep_agent(
    model="openai:gpt-6.1-sol",
    tools=[web_search, fetch_page],
    system_prompt="Search to find pages, then fetch the pages you need to read.",
)
```

有关结合了 Search、Fetch 和 Stagehand 的完整示例，请参阅 Browserbase 的 [Deep Agents guide](https://docs.browserbase.com/integrations/langchain/deepagents)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/browserbase.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。