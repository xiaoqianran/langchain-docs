<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Stateless runs | https://docs.langchain.com/langsmith/stateless-runs -->

# 无状态运行

大多数时候，您在运行图形时向客户端提供 `thread_id`，以便通过 LangSmith 部署中实现的持久状态跟踪之前的运行情况。但是，如果您不需要持久化运行，则无需使用内置持久状态，并且可以创建无状态运行。

## 设置

首先，让我们设置我们的客户端：

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langgraph_sdk import get_client

    client = get_client(url=<DEPLOYMENT_URL>)
    # Using the graph deployed with the name "agent"
    assistant_id = "agent"
    ```
  </Tab>

  <Tab title="Javascript">
    ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "@langchain/langgraph-sdk";

    const client = new Client({ apiUrl: <DEPLOYMENT_URL> });
    // Using the graph deployed with the name "agent"
    const assistantId = "agent";
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
        --url <DEPLOYMENT_URL>/assistants/search \
        --header 'Content-Type: application/json' \
        --data '{
            "limit": 10,
            "offset": 0
        }' | jq -c 'map(select(.config == null or .config == {})) | .[0].graph_id' && \
    curl --request POST \
        --url <DEPLOYMENT_URL>/threads \
        --header 'Content-Type: application/json' \
        --data '{}'
    ```
  </Tab>
</Tabs>

## 无状态流式传输

我们可以以几乎与使用状态属性从运行流式传输的方式流式传输无状态运行的结果，但我们不是将值传递给`thread_id`参数，而是传递`None`：

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    input = {
        "messages": [
            {"role": "user", "content": "Hello! My name is Bagatur and I am 26 years old."}
        ]
    }

    async for chunk in client.runs.stream(
        # Don't pass in a thread_id and the stream will be stateless
        None,
        assistant_id,
        input=input,
        stream_mode="updates",
    ):
        if chunk.data and "run_id" not in chunk.data:
            print(chunk.data)
    ```
  </Tab>

  <Tab title="Javascript">
    ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    let input = {
      messages: [
        { role: "user", content: "Hello! My name is Bagatur and I am 26 years old." }
      ]
    };

    const streamResponse = client.runs.stream(
      // Don't pass in a thread_id and the stream will be stateless
      null,
      assistantId,
      {
        input,
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
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
        --url <DEPLOYMENT_URL>/runs/stream \
        --header 'Content-Type: application/json' \
        --data "{
            \"assistant_id\": \"agent\",
            \"input\": {\"messages\": [{\"role\": \"human\", \"content\": \"Hello! My name is Bagatur and I am 26 years old.\"}]},
            \"stream_mode\": [
                \"updates\"
            ]
        }" | jq -c 'select(.data and (.data | has("run_id") | not)) | .data'
    ```
  </Tab>
</Tabs>

输出：

```
{'agent': {'messages': [{'content': "Hello Bagatur! It's nice to meet you. Thank you for introducing yourself and sharing your age. Is there anything specific you'd like to know or discuss? I'm here to help with any questions or topics you're interested in.", 'additional_kwargs': {}, 'response_metadata': {}, 'type': 'ai', 'name': None, 'id': 'run-489ec573-1645-4ce2-a3b8-91b391d50a71', 'example': False, 'tool_calls': [], 'invalid_tool_calls': [], 'usage_metadata': None}]}}
```

## 等待无状态结果

除了流式传输之外，您还可以使用 `.wait` 函数等待无状态结果，如下所示：

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    stateless_run_result = await client.runs.wait(
        None,
        assistant_id,
        input=input,
    )
    print(stateless_run_result)
    ```
  </Tab>

  <Tab title="Javascript">
    ```js theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    let statelessRunResult = await client.runs.wait(
      null,
      assistantId,
      { input: input }
    );
    console.log(statelessRunResult);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl --request POST \
        --url <DEPLOYMENT_URL>/runs/wait \
        --header 'Content-Type: application/json' \
        --data '{
            "assistant_id": <ASSISTANT_IDD>,
        }'
    ```
  </Tab>
</Tabs>

输出：

```
{
    'messages': [
        {
            'content': 'Hello! My name is Bagatur and I am 26 years old.',
            'additional_kwargs': {},
            'response_metadata': {},
            'type': 'human',
            'name': None,
            'id': '5e088543-62c2-43de-9d95-6086ad7f8b48',
            'example': False
        },
        {
            'content': 'Hello Bagatur! It's nice to meet you. Thank you for introducing yourself and sharing your age. Is there anything specific you'd like to know or discuss? I'm here to help with any questions or topics you'd like to explore.',
            'additional_kwargs': {},
            'response_metadata': {},
            'type': 'ai',
            'name': None,
            'id': 'run-d6361e8d-4d4c-45bd-ba47-39520257f773',
            'example': False,
            'tool_calls': [],
            'invalid_tool_calls': [],
            'usage_metadata': None
        }
    ]
}
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/stateless-runs.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>