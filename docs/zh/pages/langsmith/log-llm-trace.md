<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log LLM calls | https://docs.langchain.com/langsmith/log-llm-trace -->

# 记录 LLM 通话

当您在 [LangChain](/oss/python/langchain/overview) 或 LangSmith [supported integration](/langsmith/integrations) 之外直接调用 LLM 时，您需要提供特定的元数据，以便 LangSmith 可以显示代币计数、计算成本，并让您使用正确的提供商和模型在 [Playground](/langsmith/prompt-engineering-concepts#playground) 中打开 [run](/langsmith/observability-concepts#runs)。

功能齐全的 LLM 跟踪有四个要求：

|要求|该怎么办 |启用|
| --------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| 1. 设置[⟦T10⟧](/langsmith/run-data-format#run-types) |通过 `run_type="llm"` 至 `@traceable` | LLM 特定渲染、代币/成本显示 |
| 2. 格式化输入/输出 |使用 OpenAI、Anthropic 或 LangChain 消息格式 |结构化消息渲染、Playground 支持 |
| 3. 设置`ls_provider`和`ls_model_name` | `metadata` 均通过 |成本跟踪、Playground 模型选择 || 4. 提供代币数量 |在运行时设置`usage_metadata` |代币数量和成本计算 |

<Note>
  如果您使用LangChain OSS、[OpenAI wrapper](/langsmith/trace-openai)或[Anthropic wrapper](/langsmith/trace-anthropic)，这些细节会自动处理。

  本页上的示例使用 `traceable` 装饰器/包装器（Python 和 JS/TS 的推荐方法）。如果直接使用[RunTree](/langsmith/annotate-code#use-the-runtree-api)或[API](/langsmith/smith-api-ref)，则适用相同的要求。
</Note>

## 消息格式

跟踪自定义模型或自定义输入/输出格式时，它必须遵循 LangChain 格式、OpenAI 补全格式或 Anthropic 消息格式。有关更多详细信息，请参阅[OpenAI Chat Completions](https://platform.openai.com/docs/api-reference/chat/create)或[Anthropic Messages](https://platform.claude.com/docs/en/api/messages)文档。 LangChain格式为：

<Expandable title="LangChain format">
  <ParamField type="array">
    包含对话内容的消息列表。

    <ParamField type="string">
      标识消息类型。其中之一：<code>系统</code>| <code>推理</code> | <code>用户</code> | <code>助理</code> | <code>工具</code>
    </ParamField>

    <ParamField type="array">
      消息内容。类型化词典列表。<Expandable title="Content options">
        <ParamField type="string">
          其中之一：<code>文本</code> | <code>图片</code> | <code>文件</code> | <code>音频</code> | <code>视频</code> | <code>工具\_call</code> | <code>服务器\_工具\_call</code> | <code>服务器\_工具\_结果</code>。
        </ParamField>

        <Expandable title="text">
          <ParamField type="literal('text')" />

          <ParamField type="string">
            文字内容。
          </ParamField>

          <ParamField type="object[]">
            文本注释列表
          </ParamField>

          <ParamField type="object">
            其他特定于提供商的数据。
          </ParamField>
        </Expandable>

        <Expandable title="reasoning">
          <ParamField type="literal('reasoning')" />

          <ParamField type="string">
            文字内容。
          </ParamField>

          <ParamField type="object">
            其他特定于提供商的数据。
          </ParamField>
        </Expandable>

        <Expandable title="image">
          <ParamField type="literal('image')" />

          <ParamField type="string">
            指向图像位置的 URL。
          </ParamField>

          <ParamField type="string">
            Base64 编码的图像数据。
          </ParamField>

          <ParamField type="string">
            外部存储图像的参考 ID（例如，在提供商的文件系统或存储桶中）。
          </ParamField>

          <ParamField type="string">
            图片[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)（例如`image/jpeg`、`image/png`）。
          </ParamField>
        </Expandable>

        <Expandable title="file (e.g., PDFs)">
          <ParamField type="literal('file')" /><ParamField type="string">
            指向该文件的 URL。
          </ParamField>

          <ParamField type="string">
            Base64 编码的文件数据。
          </ParamField>

          <ParamField type="string">
            外部存储文件的参考 ID（例如，在提供商的文件系统或存储桶中）。
          </ParamField>

          <ParamField type="string">
            文件[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)（例如，`application/pdf`）。
          </ParamField>
        </Expandable>

        <Expandable title="audio">
          <ParamField type="literal('audio')" />

          <ParamField type="string">
            指向音频文件的 URL。
          </ParamField>

          <ParamField type="string">
            Base64 编码的音频数据。
          </ParamField>

          <ParamField type="string">
            外部存储的音频文件的参考 ID（例如，在提供商的文件系统或存储桶中）。
          </ParamField>

          <ParamField type="string">
            音频[MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)（例如`audio/mpeg`、`audio/wav`）。
          </ParamField>
        </Expandable>

        <Expandable title="video">
          <ParamField type="literal('video')" />

          <ParamField type="string">
            指向视频文件的 URL。
          </ParamField>

          <ParamField type="string">
            Base64 编码的视频数据。
          </ParamField>

          <ParamField type="string">
            外部存储的视频文件的参考 ID（例如，在提供商的文件系统或存储桶中）。
          </ParamField><ParamField type="string">
            视频 [MIME type](https://www.iana.org/assignments/media-types/media-types.xhtml#image)（例如，`video/mp4`、`video/webm`）。
          </ParamField>
        </Expandable>

        <Expandable title="tool_call">
          <ParamField type="literal('tool_call')" />

          <ParamField type="string" />

          <ParamField type="object">
            要传递给工具的参数。
          </ParamField>

          <ParamField type="string">
            该工具调用的唯一标识符。
          </ParamField>
        </Expandable>

        <Expandable title="server_tool_call">
          <ParamField type="literal('server_tool_call')" />

          <ParamField type="string">
            该工具调用的唯一标识符。
          </ParamField>

          <ParamField type="string">
            要调用的工具的名称。
          </ParamField>

          <ParamField type="object">
            要传递给工具的参数。
          </ParamField>
        </Expandable>

        <Expandable title="server_tool_result">
          <ParamField type="literal('server_tool_result')" />

          <ParamField type="string">
            相应服务器工具调用的标识符。
          </ParamField>

          <ParamField type="string">
            该工具调用的唯一标识符。
          </ParamField>

          <ParamField type="string">
            服务器端工具的执行状态。其中之一：<code>成功</code>| <code>错误</code>。
          </ParamField>

          <ParamField>
            已执行工具的输出。
          </ParamField>
        </Expandable>
      </Expandable>
    </ParamField><ParamField type="string">
      必须与先前 <code>assistant</code> 消息的 <code>tool\_calls\[i]</code> 条目的 <code>id</code> 匹配。仅当<code>角色</code>为<code>工具</code>时有效。
    </ParamField>

    <ParamField type="object">
      使用此字段可随模型的输出一起发送令牌计数和/或成本。更多详情请参见[Provide token and cost information](/langsmith/log-llm-trace#provide-token-and-cost-information)。
    </ParamField>
  </ParamField>
</Expandable>

<CodeGroup>
  ```python Text and reasoning theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   inputs = {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Hi, can you tell me the capital of France?"
          }
        ]
      }
    ]
  }

  outputs = {
    "messages": [
      {
        "role": "assistant",
        "content": [
          {
            "type": "text",
            "text": "The capital of France is Paris."
          },
          {
            "type": "reasoning",
            "text": "The user is asking about..."
          }
        ]
      }
    ]
  }

  ```

  ```python Tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  input = {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's the weather in San Francisco?"
          }
        ]
      }
    ]
  }

  outputs = {
    "messages": [
      {
        "role": "assistant",
        "content": [{"type": "tool_call", "name": "get_weather", "args": {"city": "San Francisco"}, "id": "call_1"}],
      },
      {
        "role": "tool",
        "tool_call_id": "call_1",
        "content": [
          {
            "type": "text",
            "text": "{\"temperature\": \"18°C\", \"condition\": \"Sunny\"}"
          }
        ]
      },
      {
        "role": "assistant",
        "content": [
          {
            "type": "text",
            "text": "The weather in San Francisco is 18°C and sunny."
          }
        ]
      }
    ]
  }
  ```

  ```python Multimodal theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  inputs = {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What breed is this dog?"
          },
          {
            "type": "image",
            "url": "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U",
            # alternative to a url, you can provide a base64 encoded image
            # "base64": "<base64 encoded image>",
            "mime_type": "image/jpeg",
          }
        ]
      }
    ]
  }

  outputs = {
    "messages": [
      {
        "role": "assistant",
        "content": [
          {
            "type": "text",
            "text": "This looks like a Black Labrador."
          }
        ]
      }
    ]
  }
  ```

  ```python Server-side tool calls theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  input = {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is the price of AAPL?"
          }
        ]
      }
    ]
  }

  output = {
    "messages": [
      {
        "role": "assistant",
        "content": [
          {
            "type": "server_tool_call",
            "name": "web_search",
            "args": {
              "query": "price of AAPL",
              "type": "search"
            },
            "id": "call_1"
          },
          {
            "type": "server_tool_result",
            "tool_call_id": "call_1",
            "status": "success"
          },
          {
            "type": "text",
            "text": "The price of AAPL is $150.00"
          }
        ]
      }
    ]
  }
  ```
</CodeGroup>

## 将自定义 I/O 格式转换为 LangSmith 兼容格式

如果您使用自定义输入或输出格式，则可以使用 [⟦T29⟧ decorator](https://docs.smith.langchain.com/reference/python/run_helpers/langsmith.run_helpers.traceable) (Python) 或 [⟦T30⟧ function](https://docs.smith.langchain.com/reference/js/functions/traceable.traceable) (TS) 上的 `process_inputs`/`processInputs` 和 `process_outputs`/`processOutputs` 函数将其转换为 LangSmith 兼容格式。

`process_inputs`/`processInputs` 和 `process_outputs`/`processOutputs` 接受的函数允许您在将特定跟踪的输入和输出记录到 LangSmith 之前对其进行转换。他们可以访问跟踪的输入和输出，并且可以返回包含处理后的数据的新字典。

以下是如何使用 `process_inputs` 和 `process_outputs` 将自定义 I/O 格式转换为 LangSmith 兼容格式的样板示例：

```python expandable theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
class OriginalInputs(BaseModel):
    """Your app's custom request shape"""

class OriginalOutputs(BaseModel):
    """Your app's custom response shape."""

class LangSmithInputs(BaseModel):
    """The input format LangSmith expects."""

class LangSmithOutputs(BaseModel):
    """The output format LangSmith expects."""

def process_inputs(inputs: dict) -> dict:
    """Dict -> OriginalInputs -> LangSmithInputs -> dict"""

def process_outputs(output: Any) -> dict:
    """OriginalOutputs -> LangSmithOutputs -> dict"""


@traceable(run_type="llm", process_inputs=process_inputs, process_outputs=process_outputs)
def chat_model(inputs: dict) -> dict:
    """
    Your app's model call. Keeps your custom I/O shape.
    The decorators call process_* to log LangSmith-compatible format.
    """

```

## 识别跟踪中的自定义模型使用自定义模型时，建议还提供以下 `metadata` 字段，以便在查看迹线和 [filtering](/langsmith/filter-traces-in-application) 时识别模型。

* `ls_provider`：模型的提供者，例如`"openai"`、`"anthropic"`。
* `ls_model_name`：型号名称，例如`"gpt-5.4-mini"`、`"claude-opus-4-8"`。

<CodeGroup>
  ```python Python wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import traceable

  inputs = [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "I'd like to book a table for two."},
  ]
  output = {
      "choices": [
          {
              "message": {
                  "role": "assistant",
                  "content": "Sure, what time would you like to book the table for?"
              }
          }
      ]
  }

  @traceable(
      run_type="llm",
      metadata={"ls_provider": "my_provider", "ls_model_name": "my_model"}
  )
  def chat_model(messages: list):
      return output

  chat_model(inputs)
  ```

  ```typescript TypeScript wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable } from "langsmith/traceable";

  const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "I'd like to book a table for two." }
  ];
  const output = {
      choices: [
          {
              message: {
                  role: "assistant",
                  content: "Sure, what time would you like to book the table for?",
              },
          },
      ],
      usage_metadata: {
          input_tokens: 27,
          output_tokens: 13,
          total_tokens: 40,
      },
  };

  // Can also use one of:
  // const output = {
  //     message: {
  //         role: "assistant",
  //         content: "Sure, what time would you like to book the table for?"
  //     }
  // };
  //
  // const output = {
  //     role: "assistant",
  //     content: "Sure, what time would you like to book the table for?"
  // };
  //
  // const output = ["assistant", "Sure, what time would you like to book the table for?"];

  const chatModel = traceable(
      async ({ messages }: { messages: { role: string; content: string }[] }) => {
          return output;
      },
      {
          run_type: "llm",
          name: "chat_model",
          metadata: {
              ls_provider: "my_provider",
              ls_model_name: "my_model"
          }
      }
  );

  await chatModel({ messages });
  ```
</CodeGroup>

如果您实现自定义流`chat_model`，您可以将输出“减少”为与非流版本相同的格式。仅 Python 支持：

```python expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def _reduce_chunks(chunks: list):
    all_text = "".join([chunk["choices"][0]["message"]["content"] for chunk in chunks])
    return {"choices": [{"message": {"content": all_text, "role": "assistant"}}]}

@traceable(
    run_type="llm",
    reduce_fn=_reduce_chunks,
    metadata={"ls_provider": "my_provider", "ls_model_name": "my_model"}
)
def my_streaming_chat_model(messages: list):
    for chunk in ["Hello, " + messages[1]["content"]]:
        yield {
            "choices": [
                {
                    "message": {
                        "content": chunk,
                        "role": "assistant",
                    }
                }
            ]
        }

list(
    my_streaming_chat_model(
        [
            {"role": "system", "content": "You are a helpful assistant. Please greet the user."},
            {"role": "user", "content": "assistant"},
        ],
    )
)
```

<Check>
  LangSmith 需要在 `metadata` 中设置 `ls_model_name` 来识别模型并计算自定义 LLM 跟踪的成本。如果没有它，令牌计数可能仍会被记录，但不会估计成本。
</Check>

要了解有关如何使用 `metadata` 字段的更多信息，请参阅 [Add metadata and tags](/langsmith/add-metadata-tags) 指南。要自定义自定义代理运行在消息视图中的显示方式，请参阅 [Customize the Messages view](/langsmith/view-traces#customize-the-messages-view)。

## 提供代币和费用信息

令牌计数启用成本计算，LangSmith 将其显示在[Tracing Projects UI](https://smith.langchain.com/projects) 中。有两种方式提供它们：* **在运行树上设置 `usage_metadata`**：在 [⟦T51⟧](/langsmith/annotate-code#use-%40traceable-%2F-traceable) 函数中调用 [⟦T49⟧ / ⟦T50⟧](/langsmith/access-current-span) 并设置 `usage_metadata` 字段。这不会改变函数的返回值。
* **在输出中返回 `usage_metadata`**：将 `usage_metadata` 作为顶级键包含在函数返回的字典中。

### 支持的 `usage_metadata` 字段

|领域|类型 |描述 |
| ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `input_tokens` | `int` |输入/提示令牌总数 |
| `output_tokens` | `int` |总输出/完成代币 || `total_tokens` | `int` |输入+输出之和（可选，可以推断）|
| `input_token_details` | `object` |细分：`cache_read`、`cache_creation`、`cache_read_over_200k`、`ephemeral_5m_input_tokens`、`ephemeral_1h_input_tokens`、`audio`、`text`、`image` |
| `output_token_details` | `object` |细分：`reasoning`、`audio`、`text`、`image` |

要直接发送成本（对于非线性定价），您还可以包含 `input_cost`、`output_cost` 和 `total_cost` 字段。有关在 UI 中配置模型定价和查看成本的详细信息，请参阅[Cost tracking](/langsmith/cost-tracking) 页面。

## 第一个令牌的时间

如果您使用 `traceable` 或其中一个 SDK 包装器，LangSmith 将自动填充流式 LLM 运行的首次令牌时间。但是，如果您直接使用 [⟦T82⟧ API](/langsmith/annotate-code#use-the-runtree-api)，则需要将 `new_token` 事件添加到运行树中，以便正确填充首次令牌时间。

这是一个例子：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith.run_trees import RunTree
  run_tree = RunTree(
      name="CustomChatModel",
      run_type="llm",
      inputs={ ... }
  )
  run_tree.post()
  llm_stream = ...
  first_token = None
  for token in llm_stream:
      if first_token is None:
        first_token = token
        run_tree.add_event({
          "name": "new_token"
        })
  run_tree.end(outputs={ ... })
  run_tree.patch()
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { RunTree } from "langsmith";
  const runTree = new RunTree({
      name: "CustomChatModel",
      run_type: "llm",
      inputs: { ... },
  });
  await runTree.postRun();
  const llmStream = ...;
  let firstToken;
  for (const token of llmStream) {
      if (firstToken == null) {
          firstToken = token;
          runTree.addEvent({ name: "new_token" });
      }
  }
  await runTree.end({
      outputs: { ... },
  });
  await runTree.patchRun();
  ```
</CodeGroup>

## 相关* [Custom instrumentation](/langsmith/annotate-code)：核心`@traceable`和`RunTree`模式。
* [Access the current run (span) within a traced function](/langsmith/access-current-span)：使用`get_current_run_tree()`在运行时设置`usage_metadata`等字段。
* [Trace OpenAI applications](/langsmith/trace-openai)：使用 OpenAI 包装器时自动跟踪代币和成本。
* [Trace Anthropic applications](/langsmith/trace-anthropic)：使用 Anthropic 包装器时自动跟踪令牌和成本。
* [Integrations overview](/langsmith/integrations)：具有内置 LangSmith 支持的提供商和框架的完整列表。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-llm-trace.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>