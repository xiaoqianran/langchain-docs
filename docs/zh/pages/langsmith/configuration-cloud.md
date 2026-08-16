<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage assistants | https://docs.langchain.com/langsmith/configuration-cloud -->

# 管理助手

本页介绍如何创建、配置和管理[assistants](/langsmith/assistants)。助手允许您通过配置自定义 [deployed](/langsmith/deployment) 图形的行为（例如模型选择、提示和工具可用性），而无需更改底层图形代码。

您可以使用 [SDK](https://reference.langchain.com/python/langsmith/deployment/sdk/) 或在 [LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-configuration-cloud) 中工作。

## 了解助手配置

助手存储在运行时自定义图形行为的_context_值。您可以在图形代码中定义上下文架构，然后在通过 [⟦T17⟧ parameter](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.AssistantsClient.create) 创建助手时提供特定的上下文值。

考虑这个 `call_model` 节点的示例，它从上下文中读取 `model_name`：

<CodeGroup>
```python Python
class ContextSchema(TypedDict):
    model_name: str

builder = StateGraph(AgentState, context_schema=ContextSchema)

def call_model(state, runtime: Runtime[ContextSchema]):
    messages = state["messages"]
    model = _get_model(runtime.context.get("model_name", "anthropic"))
    response = model.invoke(messages)
    return {"messages": [response]}
```

```javascript JavaScript
import { Annotation } from "@langchain/langgraph";

const ContextSchema = Annotation.Root({
    model_name: Annotation<string>,
    system_prompt: Annotation<string>,
});

const builder = new StateGraph(AgentState, ContextSchema)

function callModel(state: State, runtime: Runtime[ContextSchema]) {
  const messages = state.messages;
  const model = _getModel(runtime.context.model_name ?? "anthropic");
  const response = model.invoke(messages);
  return { messages: [response] };
}
```
</CodeGroup>

创建助手时，您可以为这些配置字段提供特定值。助手会存储此配置并在图形运行时应用它。

有关[LangGraph](/oss/python/langgraph/overview)中的配置的更多信息，请参阅[runtime context documentation](/oss/python/langgraph/graph-api#runtime-context)。

**为您的工作流程选择 SDK 或 UI：**

<Tabs>
    <Tab title="SDK">

## 创建助手使用[⟦T20⟧](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.AssistantsClient.create)方法创建一个新的助手。该方法需要：
- **图形 ID**：该助手将使用的已部署图形的名称（例如，`"agent"`）。
- **上下文**：与图形的上下文模式匹配的配置值。
- **名称**：助手的描述性名称。

以下示例创建一个助手，并将 `model_name` 设置为 `openai`：

<CodeGroup>
```python Python
from langgraph_sdk import get_client

# Initialize the client with your deployment URL
client = get_client(url=<DEPLOYMENT_URL>)

# Create an assistant for the "agent" graph
# The first parameter is the graph ID (also called graph name)
openai_assistant = await client.assistants.create(
    "agent",  # Graph ID of the deployed graph
    context={"model_name": "openai"},
    name="Open AI Assistant"
)

print(openai_assistant)
# Output includes the assistant_id (UUID) that uniquely identifies this assistant
```

```javascript JavaScript
import { Client } from "@langchain/langgraph-sdk";

// Initialize the client with your deployment URL
const client = new Client({ apiUrl: <DEPLOYMENT_URL> });

// Create an assistant for the "agent" graph
const openAIAssistant = await client.assistants.create({
    graphId: 'agent',  // Graph ID of the deployed graph
    name: "Open AI Assistant",
    context: { "model_name": "openai" },
});

console.log(openAIAssistant);
// Output includes the assistant_id (UUID) that uniquely identifies this assistant
```

```bash cURL
curl --request POST \
    --url <DEPLOYMENT_URL>/assistants \
    --header 'Content-Type: application/json' \
    --data '{"graph_id":"agent", "context":{"model_name":"openai"}, "name": "Open AI Assistant"}'
```
</CodeGroup>

**回应：**

API 返回一个辅助对象，其中包含：
- `assistant_id`：唯一标识该助手的UUID
- `graph_id`：该助手配置的图表
- `context`：您提供的配置值
- `name`、`metadata`、时间戳等字段

```json
{
  "assistant_id": "62e209ca-9154-432a-b9e9-2d75c7a9219b",
  "graph_id": "agent",
  "name": "Open AI Assistant",
  "context": {
    "model_name": "openai"
  },
  "metadata": {},
  "created_at": "2024-08-31T03:09:10.230718+00:00",
  "updated_at": "2024-08-31T03:09:10.230718+00:00"
}
```

`assistant_id`（类似于 `"62e209ca-9154-432a-b9e9-2d75c7a9219b"` 的 UUID）唯一标识此助理配置。运行图表时您将使用此 ID 来指定要应用的配置。

<Note>
**图形 ID 与助理 ID**

创建助手时，您指定**图ID**（图名称如`"agent"`）。这将返回一个**助手 ID**（UUID，例如 `"62e209ca..."`）。您可以在运行图表时使用：
- **图表 ID**（例如，`"agent"`）：使用该图表的默认助手
- **助手ID** (UUID)：使用特定的助手配置

示例请参见[Use an assistant](#use-an-assistant)。
</Note>## 使用助手

要使用助手，请在创建运行时传递其 `assistant_id`。下面的示例使用我们上面创建的助手：

<CodeGroup>
```python Python
# Create a thread for the conversation
thread = await client.threads.create()

# Prepare the input
input = {"messages": [{"role": "user", "content": "who made you?"}]}

# Run the graph using the assistant's configuration
# Pass the assistant_id (UUID) as the second parameter
async for event in client.runs.stream(
    thread["thread_id"],
    openai_assistant["assistant_id"],  # Assistant ID (UUID)
    input=input,
    stream_mode="updates",
):
    print(f"Receiving event of type: {event.event}")
    print(event.data)
    print("\n\n")
```

```javascript JavaScript
// Create a thread for the conversation
const thread = await client.threads.create();

// Prepare the input
const input = { "messages": [{ "role": "user", "content": "who made you?" }] };

// Run the graph using the assistant's configuration
// Pass the assistant_id (UUID) as the second parameter
const streamResponse = client.runs.stream(
  thread["thread_id"],
  openAIAssistant["assistant_id"],  // Assistant ID (UUID)
  {
    input,
    streamMode: "updates"
  }
);

for await (const event of streamResponse) {
  console.log(`Receiving event of type: ${event.event}`);
  console.log(event.data);
  console.log("\n\n");
}
```

```bash cURL
# First, create a thread
thread_id=$(curl --request POST \
    --url <DEPLOYMENT_URL>/threads \
    --header 'Content-Type: application/json' \
    --data '{}' | jq -r '.thread_id')

# Run the graph with the assistant ID (UUID)
curl --request POST \
    --url "<DEPLOYMENT_URL>/threads/${thread_id}/runs/stream" \
    --header 'Content-Type: application/json' \
    --data '{
        "assistant_id": "<ASSISTANT_ID>",
        "input": {
            "messages": [
                {
                    "role": "user",
                    "content": "who made you?"
                }
            ]
        },
        "stream_mode": ["updates"]
    }' | \
    sed 's/\r$//' | \
    awk '
    /^event:/ {
        if (data_content != "") {
            print data_content "\n"
        }
        sub(/^event: /, "Receiving event of type: ", $0)
        printf "%s...\n", $0
        data_content = ""
    }
    /^data:/ {
        sub(/^data: /, "", $0)
        data_content = $0
    }
    END {
        if (data_content != "") {
            print data_content "\n\n"
        }
    }
'
```
</CodeGroup>

**回应：**

当图表使用助手的配置执行时，流返回事件：

```
Receiving event of type: metadata
{'run_id': '1ef6746e-5893-67b1-978a-0f1cd4060e16'}

Receiving event of type: updates
{'agent': {'messages': [{'content': 'I was created by OpenAI...', ...}]}}
```

<Note>
**使用图形 ID 与助理 ID**

运行图表时，您可以传递 **图表 ID** 或 **助手 ID**：

```python
# Option 1: Use graph ID to get the default assistant
client.runs.stream(thread_id, "agent", input=input)

# Option 2: Use assistant ID (UUID) for a specific configuration
client.runs.stream(thread_id, "62e209ca-9154-432a-b9e9-2d75c7a9219b", input=input)
```
</Note>

## 为你的助手创建一个新版本

使用[⟦T35⟧](https://reference.langchain.com/python/langsmith/deployment/sdk/#langgraph_sdk.client.AssistantsClient.update)方法创建新版本的助手。

<Warning>
**更新需要完整配置**

更新时您必须提供**完整**配置。更新端点从头开始创建新版本，并且不会与以前的版本合并。包括您要保留的所有配置字段。
</Warning>

例如给助手添加系统提示：

<CodeGroup>
```python Python
# Update the assistant with a new configuration
# IMPORTANT: Include ALL configuration fields, not just the ones you're changing
openai_assistant_v2 = await client.assistants.update(
    openai_assistant["assistant_id"],  # Assistant ID (UUID)
    context={
          "model_name": "openai",  # Must include existing fields
          "system_prompt": "You are a mindful assistant!",  # New field
    },
)

# This creates version 2 and sets it as the active version
# Future runs using this assistant_id will use version 2
```

```javascript JavaScript
// Update the assistant with a new configuration
// IMPORTANT: Include ALL configuration fields, not just the ones you're changing
const openaiAssistantV2 = await client.assistants.update(
    openAIAssistant["assistant_id"],  // Assistant ID (UUID)
    {
        context: {
            model_name: 'openai',  // Must include existing fields
            system_prompt: 'You are a mindful assistant!',  // New field
        },
    },
);

// This creates version 2 and sets it as the active version
// Future runs using this assistant_id will use version 2
```

```bash cURL
curl --request PATCH \
--url <DEPLOYMENT_URL>/assistants/<ASSISTANT_ID> \
--header 'Content-Type: application/json' \
--data '{
"context": {"model_name": "openai", "system_prompt": "You are a mindful assistant!"}
}'
```
</CodeGroup>

更新创建一个新版本并自动将其设置为活动状态。以后所有使用此助手 ID 的运行都将使用新配置。

## 使用以前的助手版本

使用 `setLatest` 方法更改哪个版本处于活动状态：

<CodeGroup>
```python Python
# Roll back to version 1 of the assistant
await client.assistants.set_latest(
    openai_assistant['assistant_id'],  # Assistant ID (UUID)
    1  # Version number
)

# All future runs using this assistant_id will now use version 1
```

```javascript JavaScript
// Roll back to version 1 of the assistant
await client.assistants.setLatest(
    openaiAssistant['assistant_id'],  // Assistant ID (UUID)
    1  // Version number
);

// All future runs using this assistant_id will now use version 1
```

```bash cURL
curl --request POST \
--url <DEPLOYMENT_URL>/assistants/<ASSISTANT_ID>/latest \
--header 'Content-Type: application/json' \
--data '{
"version": 1
}'
```
</CodeGroup>更改活动版本后，使用此助手 ID 的所有运行都将使用指定版本的配置。

</Tab>
<Tab title="UI">

## 创建助手

您可以从[LangSmith UI](https://smith.langchain.com?utm_source=docs&utm_medium=cta&utm_campaign=langsmith-signup&utm_content=langsmith-configuration-cloud)创建助手：

1. 导航到您的部署并选择 **Assistants** 选项卡。
1. 单击**+新助手**。
1. 在打开的表格中：
   - 选择该助手所针对的图表。
   - 提供名称和描述。
   - 使用该图的配置模式配置助手。
1. 点击**创建助手**。

这将带您到[Studio](/langsmith/studio)，您可以在其中测试助手。返回**助手**选项卡，在表中查看您新创建的助手。

## 使用助手

要在 LangSmith UI 中使用助手：

1. 导航到您的部署并选择 **Assistants** 选项卡。
1. 找到您要使用的助手。
1. 单击该助手的 **Studio**。

这将使用选定的助手打开[Studio](/langsmith/studio)。当您提交输入（在**图表**或**聊天**模式）时，助手的配置将应用于运行。

## 为你的助手创建一个新版本要从 UI 更新助手并创建新版本，您可以使用“助手”选项卡或 Studio。这两种方法都会创建一个新版本并将其设置为活动版本：

<Tabs>
<Tab title="Assistants tab">
1. 导航到您的部署并选择 **Assistants** 选项卡。
1. 找到您要编辑的助手。
1. 单击“**编辑**”。
1. 修改助手的名称、描述或配置。
1. 保存您的更改。
</Tab>

<Tab title="Studio">
1. 打开助手的Studio。
1. 单击“**管理助手**”。
1. 编辑助手配置。
1. 保存您的更改。
</Tab>
</Tabs>

## 使用以前的助手版本

要将以前的版本从 Studio 设置为活动版本：

1. 打开助手的Studio。
2. 单击“**管理助手**”。
3. 找到助手并选择您要使用的版本。
4. 切换该版本的 **Active** 开关。

这会更新助手以在以后的所有运行中使用所选版本。

<Warning>
删除助手将删除其**所有**版本。目前无法删除单个版本。要跳过某个版本，只需将另一个版本设置为活动版本即可。
</Warning>

</Tab>
</Tabs>

---<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/configuration-cloud.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>