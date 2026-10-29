<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace with the Claude Agent SDK | https://docs.langchain.com/langsmith/trace-claude-agent-sdk -->

# 使用 Claude Agent SDK 进行跟踪

[Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) 是一个用于与 Claude 一起构建代理的 SDK。 LangSmith 提供与 Claude Agent SDK 的本机集成，以自动跟踪代理执行、工具调用以及与 Claude 模型的交互。

> [!注意]
>
> 在发送跟踪之前，在[agent-based workspace](/langsmith/agents)、[create an agent](/langsmith/create-an-agent) 中进行一次。使用[agent addressing](/langsmith/log-traces-to-agent)选择其标识符和环境。如果集成需要 `project_name`，请使用所选环境的 [⟦T9⟧](/langsmith/create-an-agent#use-an-environment-project) 作为兼容性值。

## 安装

安装 Claude Agent SDK 的 LangSmith 集成

```bash uv theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
uv add "langsmith[claude-agent-sdk]"
```

```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install langsmith[claude-agent-sdk]
```

```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pnpm add @anthropic-ai/claude-agent-sdk langsmith zod
```

```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install @anthropic-ai/claude-agent-sdk langsmith zod
```

## 设置

设置您的[API keys](/langsmith/create-account-api-key)：

```bash shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_TRACING=true
export LANGSMITH_ENDPOINT=https://api.smith.langchain.com
export LANGSMITH_API_KEY=<your_langsmith_api_key>
export LANGSMITH_PROJECT=<your_langsmith_project>

export ANTHROPIC_API_KEY=<your_anthropic_api_key>
```

```dotenv .env theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=<your_langsmith_api_key>
LANGSMITH_PROJECT=<your_langsmith_project>

ANTHROPIC_API_KEY=<your_anthropic_api_key>
```

从 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-claude-agent-sdk) 中的 **设置** 获取您的 LangSmith API 密钥。使用设置期间选择的代理标识符和环境。

对于Anthropic API 密钥，请参阅[Claude console](https://console.anthropic.com/settings/keys)。

## 快速入门

要为您的 Claude Agent SDK 代码启用 LangSmith 跟踪，请在运行代理之前调用 `configure_claude_agent_sdk()`：

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import asyncio
from typing import Any

from claude_agent_sdk import (
    ClaudeAgentOptions,
    ClaudeSDKClient,
    create_sdk_mcp_server,
    tool,
)
from langsmith.integrations.claude_agent_sdk import configure_claude_agent_sdk

configure_claude_agent_sdk()


@tool(
    "get_weather",
    "Gets the current weather for a given city",
    {"city": str},
)
async def get_weather(args: dict[str, Any]) -> dict[str, Any]:
    city = args["city"]
    weather_data = {
        "San Francisco": "Foggy, 62°F",
        "New York": "Sunny, 75°F",
        "London": "Rainy, 55°F",
        "Tokyo": "Clear, 68°F",
    }
    weather = weather_data.get(city, "Weather data not available")
    return {"content": [{"type": "text", "text": f"Weather in {city}: {weather}"}]}


async def main() -> None:
    weather_server = create_sdk_mcp_server(
        name="weather",
        version="1.0.0",
        tools=[get_weather],
    )

    options = ClaudeAgentOptions(
        model="claude-sonnet-5-5",
        system_prompt="You are a friendly travel assistant who helps with weather information.",
        mcp_servers={"weather": weather_server},
        allowed_tools=["mcp__weather__get_weather"],
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("What's the weather like in San Francisco and Tokyo?")

        async for message in client.receive_response():
            print(message)


if __name__ == "__main__":
    asyncio.run(main())
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import * as originalSdk from '@anthropic-ai/claude-agent-sdk';

import { wrapClaudeAgentSDK } from 'langsmith/experimental/anthropic';
import { z } from 'zod/v4';

const sdk = wrapClaudeAgentSDK(originalSdk);

const getWeather = sdk.tool(
  'get_weather',
  'Gets the current weather for a given city',
  {
    city: z.string(),
  },
  async ({ city }) => {
    const weatherData: Record<string, string> = {
      'San Francisco': 'Foggy, 62°F',
      'New York': 'Sunny, 75°F',
      London: 'Rainy, 55°F',
      Tokyo: 'Clear, 68°F',
    };
    const weather = weatherData[city] ?? 'Weather data not available';
    return {
      content: [{ type: 'text' as const, text: weather }],
    };
  }
);

const weatherServer = sdk.createSdkMcpServer({
  name: 'weather',
  version: '1.0.0',
  tools: [getWeather],
});

const query = sdk.query({
  prompt: "What's the weather like in San Francisco and Tokyo?",
  options: {
    model: 'claude-sonnet-5-5',
    systemPrompt:
      'You are a friendly travel assistant who helps with weather information.',
    mcpServers: { weather: weatherServer },
    allowedTools: ['mcp__weather__get_weather'],
  },
});

for await (const chunk of query) {
  console.log(chunk);
}
```

配置完成后，所有Claude Agent SDK操作都会自动追踪到LangSmith，包括：

* 代理查询和回复
* 工具调用和结果
* 克劳德模型交互
* MCP服务器操作

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-claude-agent-sdk.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。