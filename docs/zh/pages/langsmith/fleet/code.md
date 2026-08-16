<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use Fleet agents in code | https://docs.langchain.com/langsmith/fleet/code -->

# 在代码中使用舰队代理

以编程方式使用 Fleet 代理的主要方法有两种：

- **[Call from code](#call-from-code)**：通过LangGraph SDK 或 REST API 远程调用您的代理，无需下载任何内容。
- **[Export to code](#export-to-code)**：下载代理的配置并使用 `fleet-deepagents-export` 包将其作为独立的 Python 项目在本地运行。


## 从代码中调用

您可以使用 [LangGraph SDK](/langsmith/reference) 或 REST API 从应用程序调用 LangSmith 队列代理。舰队代理在[Agent Server](/langsmith/agent-server)上运行，因此您可以使用与任何其他[LangSmith deployment](/langsmith/deployment)相同的API方法。

REST API 允许您从支持 HTTP 请求的任何语言或平台调用代理。

### 先决条件

- 舰队代理的LangSmith账户
- 用于身份验证的[Personal Access Token (PAT)](/langsmith/create-account-api-key)
-（仅限 SDK）已安装的[LangGraph SDK](/langsmith/reference)：

<CodeGroup>
    ```bash Python
    pip install langgraph-sdk python-dotenv
    ```

    ```bash TypeScript
    yarn add @langchain/langgraph-sdk
    ```
</CodeGroup>

### 身份验证
要对代理的队列部署进行身份验证，请在实例化 LangGraph SDK 客户端时或通过 `X-API-Key` 标头向 `api_key` 参数提供 LangSmith [Personal Access Token (PAT)](/langsmith/create-account-api-key)。如果使用 `X-API-Key`，还必须将 `X-Auth-Scheme` 标头设置为 `langsmith-api-key`。


如果您传递的 PAT 与代理所有者无关，您的请求将被拒绝，并出现 `404 Not Found` 错误。如果您尝试调用的代理是<Tooltip tip="Agents shared with all members of a LangSmith workspace. Private agents are only visible to the creator." cta="Learn more" href="/langsmith/fleet/manage-agent-settings">工作空间代理</Tooltip>并且您不是所有者，则可以执行与在 UI 中执行的所有相同操作（只读）。

### 1.获取代理ID和URL

要获取您的代理的 `agent_id` 和 `api_url`：

1. 在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-code)中，打开您的代理。
1. 在边栏中，展开 **高级设置** 抽屉。
1. 在 **开发人员** 下，单击 **查看代码片段** 以查看代理的预填充值。

复制下面的代码，并将 `agent_id` 和 `api_url` 替换为代理代码片段中的值。

使用 [Personal Access Token](/langsmith/create-account-api-key) 在项目根目录中创建一个 `.env` 文件：

```bash .env
LANGGRAPH_API_KEY=your-personal-access-token
```

### 2.获取代理配置

通过获取代理的配置来验证您的连接：

<Tabs>
    <Tab title="Python">
```python
import os
from dotenv import load_dotenv
from langgraph_sdk.client import get_client

load_dotenv()

agent_id = "your-agent-id"

api_key = os.getenv("LANGGRAPH_API_KEY")
api_url = "<AGENT-BUILDER-URL>.us.langgraph.app"

client = get_client(
    url=api_url,
    api_key=api_key,
    headers={
        "X-Auth-Scheme": "langsmith-api-key",
    },
)

async def get_assistant(agent_id: str):
    agent = await client.assistants.get(agent_id)
    print(agent)

if __name__ == "__main__":
    import asyncio
    asyncio.run(get_assistant(agent_id))
```
    </Tab>
    <Tab title="TypeScript">
```ts
import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";

const agentId = "your-agent-id";

const apiKey = process.env.LANGGRAPH_API_KEY;
const apiUrl = "<AGENT-BUILDER-URL>.us.langgraph.app";

const client = new Client({
  apiUrl,
  apiKey,
  defaultHeaders: {
    "X-Auth-Scheme": "langsmith-api-key",
  },
});

async function main(agentId: string) {
  const agent = await client.assistants.get(agentId);
  console.log(agent);
}

main(agentId).catch(console.error);
```
    </Tab>
    <Tab title="cURL">
```bash
curl --request GET \
    --url "<AGENT-BUILDER-URL>.us.langgraph.app/assistants/your-agent-id" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: your-personal-access-token' \
    --header 'X-Auth-Scheme: langsmith-api-key'
```
    </Tab>
</Tabs>

<Callout icon="key" color="#FEF3C7" iconType="regular">
    使用与您的 LangSmith 帐户绑定的 [Personal Access Token (PAT)](/langsmith/create-account-api-key)。将 `X-Auth-Scheme` 标头设置为 `langsmith-api-key` 进行身份验证。
</Callout>

### 3.调用代理

下面的示例展示了如何向您的代理发送消息并接收响应。您可以使用**无状态**运行（无线程，无对话历史记录）或**有状态**运行（使用线程来维护多个回合的对话历史记录）。#### 无状态运行

无状态运行发送单个请求并返回完整响应。没有保留任何对话历史记录。这是致电您的代理的最简单方法：

<Tabs>
    <Tab title="Python">
```python
import os
from dotenv import load_dotenv
from langgraph_sdk.client import get_client

load_dotenv()

agent_id = "your-agent-id"

api_key = os.getenv("LANGGRAPH_API_KEY")
api_url = "https://<AGENT-BUILDER-URL>.us.langgraph.app"

client = get_client(
    url=api_url,
    api_key=api_key,
    headers={
        "X-Auth-Scheme": "langsmith-api-key",
    },
)

result = await client.runs.wait(
    None,
    agent_id,
    input={
        "messages": [
            {"role": "user", "content": "What can you help me with?"}
        ]
    },
)
print(result)
```
    </Tab>
    <Tab title="TypeScript">
```ts
import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";

const agentId = "your-agent-id";

const apiKey = process.env.LANGGRAPH_API_KEY;
const apiUrl = "<AGENT-BUILDER-URL>.us.langgraph.app";

const client = new Client({
  apiUrl,
  apiKey,
  defaultHeaders: {
    "X-Auth-Scheme": "langsmith-api-key",
  },
});

const result = await client.runs.wait(
  null,
  agentId,
  {
    input: {
      messages: [
        { role: "user", content: "What can you help me with?" }
      ]
    }
  }
);
console.log(result);
```
    </Tab>
    <Tab title="cURL">
```bash
curl --request POST \
    --url "<AGENT-BUILDER-URL>.us.langgraph.app/runs/wait" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: your-personal-access-token' \
    --header 'X-Auth-Scheme: langsmith-api-key' \
    --data '{
        "assistant_id": "your-agent-id",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": "What can you help me with?"
                }
            ]
        }
    }'
```
    </Tab>
</Tabs>

#### 无状态流式运行

要在生成时流式传输响应而不是等待完整结果，请使用流式传输端点：

<Tabs>
    <Tab title="Python">
```python
async for chunk in client.runs.stream(
    None,
    agent_id,
    input={
        "messages": [
            {"role": "user", "content": "What can you help me with?"}
        ]
    },
    stream_mode="updates",
):
    if chunk.data and "run_id" not in chunk.data:
        print(chunk.data)
```
    </Tab>
    <Tab title="TypeScript">
```ts
const streamResponse = client.runs.stream(
  null,
  agentId,
  {
    input: {
      messages: [
        { role: "user", content: "What can you help me with?" }
      ]
    },
    streamMode: "updates"
  }
);
for await (const chunk of streamResponse) {
  if (chunk.data && !("run_id" in chunk.data)) {
    console.log(chunk.data);
  }
}
```
    </Tab>
    <Tab title="cURL">
```bash
curl --request POST \
    --url "<AGENT-BUILDER-URL>.us.langgraph.app/runs/stream" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: your-personal-access-token' \
    --header 'X-Auth-Scheme: langsmith-api-key' \
    --data '{
        "assistant_id": "your-agent-id",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": "What can you help me with?"
                }
            ]
        },
        "stream_mode": [
            "updates"
        ]
    }'
```
    </Tab>
</Tabs>

#### 使用线程进行有状态运行

要维护多个交互中的对话历史记录，请首先创建一个线程，然后在其上运行代理。同一线程上的每次后续运行都可以访问完整的消息历史记录：

<Tabs>
    <Tab title="Python">
```python
import os
from dotenv import load_dotenv
from langgraph_sdk.client import get_client

load_dotenv()

agent_id = "your-agent-id"

api_key = os.getenv("LANGGRAPH_API_KEY")
api_url = "<AGENT-BUILDER-URL>.us.langgraph.app"

client = get_client(
    url=api_url,
    api_key=api_key,
    headers={
        "X-Auth-Scheme": "langsmith-api-key",
    },
)

thread = await client.threads.create()

async for chunk in client.runs.stream(
    thread["thread_id"],
    agent_id,
    input={
        "messages": [
            {"role": "user", "content": "Hi, my name is Alice."}
        ]
    },
    stream_mode="updates",
):
    if chunk.data and "run_id" not in chunk.data:
        print(chunk.data)

async for chunk in client.runs.stream(
    thread["thread_id"],
    agent_id,
    input={
        "messages": [
            {"role": "user", "content": "What is my name?"}
        ]
    },
    stream_mode="updates",
):
    if chunk.data and "run_id" not in chunk.data:
        print(chunk.data)
```
    </Tab>
    <Tab title="TypeScript">
```ts
import "dotenv/config";
import { Client } from "@langchain/langgraph-sdk";

const agentId = "your-agent-id";

const apiKey = process.env.LANGGRAPH_API_KEY;
const apiUrl = "<AGENT-BUILDER-URL>.us.langgraph.app";

const client = new Client({
  apiUrl,
  apiKey,
  defaultHeaders: {
    "X-Auth-Scheme": "langsmith-api-key",
  },
});

const thread = await client.threads.create();

let streamResponse = client.runs.stream(
  thread["thread_id"],
  agentId,
  {
    input: {
      messages: [
        { role: "user", content: "Hi, my name is Alice." }
      ]
    },
    streamMode: "updates"
  }
);
for await (const chunk of streamResponse) {
  if (chunk.data && !("run_id" in chunk.data)) {
    console.log(chunk.data);
  }
}

streamResponse = client.runs.stream(
  thread["thread_id"],
  agentId,
  {
    input: {
      messages: [
        { role: "user", content: "What is my name?" }
      ]
    },
    streamMode: "updates"
  }
);
for await (const chunk of streamResponse) {
  if (chunk.data && !("run_id" in chunk.data)) {
    console.log(chunk.data);
  }
}
```
    </Tab>
    <Tab title="cURL">
首先，创建一个线程：

```bash
curl --request POST \
    --url "<AGENT-BUILDER-URL>.us.langgraph.app/threads" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: your-personal-access-token' \
    --header 'X-Auth-Scheme: langsmith-api-key' \
    --data '{}'
```

使用响应中的 `thread_id` 在线程上发送消息：

```bash
curl --request POST \
    --url "<AGENT-BUILDER-URL>.us.langgraph.app/threads/<THREAD_ID>/runs/stream" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: your-personal-access-token' \
    --header 'X-Auth-Scheme: langsmith-api-key' \
    --data '{
        "assistant_id": "your-agent-id",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": "Hi, my name is Alice."
                }
            ]
        },
        "stream_mode": [
            "updates"
        ]
    }'
```

在同一线程上发送后续消息：

```bash
curl --request POST \
    --url "<AGENT-BUILDER-URL>.us.langgraph.app/threads/<THREAD_ID>/runs/stream" \
    --header 'Content-Type: application/json' \
    --header 'X-Api-Key: your-personal-access-token' \
    --header 'X-Auth-Scheme: langsmith-api-key' \
    --data '{
        "assistant_id": "your-agent-id",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": "What is my name?"
                }
            ]
        },
        "stream_mode": [
            "updates"
        ]
    }'
```
    </Tab>
</Tabs>

### REST API 参考

下表总结了关键终点。将 `<API_URL>` 替换为代理的部署 URL。|运营|方法|端点 |
|---|---|---|
| [Get agent info](/langsmith/agent-server-api/assistants/get-assistant) | `GET` | `<API_URL>/assistants/<AGENT_ID>` |
| [Create a thread](/langsmith/agent-server-api/threads/create-thread) | `POST` | `<API_URL>/threads` |
| [Run (wait for result)](https://docs.langchain.com/langsmith/agent-server-api/stateless-runs/create-run-wait-for-output) | `POST` | `<API_URL>/runs/wait` |
| [Run (streaming)](/langsmith/agent-server-api/stateless-runs/create-run-stream-output) | `POST` | `<API_URL>/runs/stream` |
| [Run on thread (wait)](/langsmith/agent-server-api/thread-runs/create-run-wait-for-output) | `POST` | `<API_URL>/threads/<THREAD_ID>/runs/wait` |
| /langsmith/agent-server-api/thread-runs/create-run-stream-output | /langsmith/agent-server-api/thread-runs/create-run-stream-output | `POST` | `<API_URL>/threads/<THREAD_ID>/runs/stream` |

所有端点都需要以下标头：
- `Content-Type: application/json`
- `X-Api-Key:` 你的[Personal Access Token](/langsmith/create-account-api-key)
- `X-Auth-Scheme: langsmith-api-key`

有关完整的 API 规范，请参阅[Agent Server API reference](/langsmith/server-api-ref)。


## 导出到代码

**导出到代码** 功能允许您将 Fleet 代理下载为独立的 Python 项目并在本地运行。当您想要执行以下操作时，这很有用：

- 在您自己的基础设施中运行代理，无需调用 Fleet API
- 扩展或自定义代理超出 Fleet UI 支持范围（添加自定义工具、中间件或技能）
- 检查或版本控制完整的代理实施
- 使用LangGraph Studio进行本地开发和图形检查

[⟦T56⟧](https://pypi.org/project/fleet-deepagents-export/) 包 ([GitHub](https://github.com/langchain-ai/fleet-deepagents-export)) 负责读取导出的配置并使用 MCP 工具、子代理和技能连接代理。

### 先决条件

- Python 3.11+
- [⟦T57⟧](https://docs.astral.sh/uv/getting-started/installation/)（推荐）用于依赖管理
- LangSmith车队代理出口

### 1.复制起始项目[⟦T58⟧](https://github.com/langchain-ai/fleet-deepagents-export/tree/main/examples/template-agent) 的入门项目是推荐的起点。克隆存储库并复制启动器：

```bash
git clone https://github.com/langchain-ai/fleet-deepagents-export.git
cp -R fleet-deepagents-export/examples/template-agent my-agent
cd my-agent
```

### 2. 从 Fleet 导出您的代理

在[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-fleet-code)中，打开代理并将其导出为`.zip`文件。

![fleet-export-code](/langsmith/images/fleet-export-code.gif)

然后将内容放入启动项目的 `fleet/` 目录中：

```bash
unzip path/to/my-export.zip -d fleet/
```

`fleet/` 目录包含您的代理所需的所有内容：
- `AGENTS.md` — 系统提示符
- `config.json` — 模型配置和工作区元数据
- `tools.json` — MCP 服务器连接
- `subagents/`（可选）— 子代理定义
- `skills/`（可选）——技能说明

### 3. 配置您的环境

复制示例 env 文件并填写所需的值：

```bash
cp .env.example .env
```

三个 `LANGSMITH_*_ID` 值位于 `metadata` 下的 `fleet/config.json` 中。打开该文件并将 `tenant_id`、`organization_id` 和 `ls_user_id` 复制到 `.env` 中：

```bash .env
# Model provider — set the key for whichever provider your agent uses
ANTHROPIC_API_KEY=your-anthropic-api-key

# LangSmith credentials — copy IDs from fleet/config.json → metadata
LANGSMITH_API_KEY=your-langsmith-pat
LANGSMITH_TENANT_ID=your-tenant-id
LANGSMITH_ORGANIZATION_ID=your-organization-id
LANGSMITH_USER_ID=your-user-id       # required if your agent uses OAuth tools

# Built-in MCP tools (Gmail, Calendar, GitHub)
BUILTIN_MCP_URL=https://tools.langchain.com/mcp
```

### 4.安装依赖并运行

```bash
make setup    # installs dependencies via uv sync
```

然后选择如何与您的代理互动：

```bash
make dev    # LangGraph Studio — browser UI for chat and graph inspection
make run    # terminal REPL via cli.py — text-only chat
```

### 5.自定义代理

启动器将舰队拥有的文件与您拥有的文件分开，并且可以自由编辑：|文件/目录|业主|目的|
|---|---|---|
| `fleet/` |舰队|将导出内容拖放到此处。重新解压即可更新；没有其他的东西被触及。 |
| `agent.py` |你|图形接线。通过替换 `model = components.pop("model")` 行来覆盖模型。 |
| `custom_tools.py` |你|添加代码定义工具；在运行时与 Fleet MCP 工具合并。 |
| `custom_middleware.py` |你|添加`AgentMiddleware`实例用于日志记录、过滤器、前/后挂钩等。
| `custom_skills/` |你|删除`<skill-name>/SKILL.md`文件；分层在`fleet/skills/`之上。 |
| `cli.py` |你|终端 REPL；自由编辑。 |

这是开头的完整`agent.py`：

```python
"""Standalone deepagent exported from LangSmith Fleet.

LangGraph Studio / dev server:  make dev
Terminal:                        make run  (see cli.py)

Extension points (edit these, not this file):
- ``custom_tools.py``      — add code-defined tools
- ``custom_middleware.py`` — wrap the agent loop with logging, filters, etc.
- ``custom_skills/``       — drop ``<skill-name>/SKILL.md`` files
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv()

from custom_middleware import custom_middleware
from custom_tools import custom_tools
from deepagents import create_deep_agent
from fleet_deepagents_export import StaticSkillsLoader, load_agent_components

PROJECT_DIR = Path(__file__).parent
FLEET_DIR = PROJECT_DIR / "fleet"
CUSTOM_SKILLS_DIR = PROJECT_DIR / "custom_skills"

# Read SKILL.md from disk once; middleware injects into state on first turn.
_SKILL_LOADER = StaticSkillsLoader(
    [
        (FLEET_DIR / "skills", "/skills/fleet"),
        (CUSTOM_SKILLS_DIR, "/skills/custom"),
    ]
)


async def graph(runtime: Any):
    """Build and return the agent graph."""
    components = await load_agent_components(FLEET_DIR)
    model = components.pop("model")  # from fleet/config.json; replace to override
    components["tools"] = list(components["tools"]) + list(custom_tools)

    if _SKILL_LOADER.files:
        components["skills"] = _SKILL_LOADER.skill_paths

    return create_deep_agent(
        model=model,
        middleware=[_SKILL_LOADER, *custom_middleware],
        **components,
    ).with_config({"recursion_limit": 1000})
```

### 重新导出

当您从 Fleet 导出代理的新版本时，只需擦除并重新解压缩即可 - 您的自定义设置不会受到影响：

```bash
rm -rf fleet && unzip path/to/my-new-export.zip -d fleet/
```

### 支持的模型提供者

入门版附带 `langchain-anthropic`、`langchain-openai` 和 `langchain-google-genai`。对于任何其他提供商（例如 `bedrock`、`fireworks`），请将匹配的 `langchain-<provider>` 包添加到 `pyproject.toml`。

### MCP 身份验证

启动时，每个工具的 `mcp_server_url` 都会根据 LangSmith 的 MCP 服务器注册表进行解析：- **内置 LangSmith 工具**（Gmail、日历、GitHub）— 通过您的 `LANGSMITH_API_KEY` 进行身份验证。
- **静态凭证服务器** (`auth_type: "headers"`) — 凭证来自注册表记录。需要`mcp-servers:invoke`许可。
- **OAuth 服务器** (`auth_type: "oauth"`) — 从 LangSmith 的 OAuth 代理获取的不记名令牌。对于尚未授权的任何每用户服务器，首次运行时会打开一个浏览器窗口。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/code.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>