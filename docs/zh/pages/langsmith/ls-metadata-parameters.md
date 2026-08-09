<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Metadata parameters reference | https://docs.langchain.com/langsmith/ls-metadata-parameters -->

# 元数据参数参考

当您使用 LangSmith 跟踪 LLM 调用时，您通常需要[track costs](/langsmith/cost-tracking)、比较模型配置并分析不同提供商的性能。 LangSmith 的本机集成（如 [LangChain](/langsmith/trace-with-langchain) 或 [OpenAI](/langsmith/trace-openai)/[Anthropic](/langsmith/trace-anthropic) 包装器）会自动处理此问题，但自定义模型包装器和自托管模型需要标准化的方式来提供此信息。 LangSmith 使用 `ls_` 元数据参数来实现此目的。

这些元数据参数（均以 `ls_` 为前缀）允许您通过标准 `metadata` 字段传递模型配置和标识信息。设置后，LangSmith 可以自动计算成本，在 UI 中显示模型信息，并启用 [filtering](/langsmith/filter-traces-in-application) 和跨跟踪分析。

使用 `ls_` 元数据参数可以：* **通过识别提供商和模型名称，为自定义或自托管模型启用自动成本跟踪**。
* **跟踪模型配置**，如温度、最大令牌和其他参数以进行实验比较。
* **按提供商或配置设置过滤和分析跟踪**
* **自定义消息视图呈现**以用于自定义代理检测。
* **标记中断的错误**，以便 LangSmith 可以将中断的运行与其他错误分开渲染。
* **通过准确记录每次运行使用的模型设置来改进调试**。

## 基本使用示例

最常见的用例是启用自定义模型包装器的成本跟踪。为此，您需要提供两个关键信息：提供商名称 (`ls_provider`) 和模型名称 (`ls_model_name`)。这些一起工作以匹配 LangSmith 的定价数据库。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import traceable

  @traceable(
      run_type="llm",
      metadata={
          "ls_provider": "my_provider",
          "ls_model_name": "my_custom_model"
      }
  )
  def my_custom_llm(prompt: str):
      return call_custom_api(prompt)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable } from "langsmith/traceable";

  const myCustomLlm = traceable(
    async (prompt: string) => {
      return callCustomApi(prompt);
    },
    {
      run_type: "llm",
      metadata: {
        ls_provider: "my_provider",
        ls_model_name: "my_custom_model"
      }
    }
  );
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import java.util.HashMap;
  import java.util.Map;
  import java.util.function.Function;

  Map<String, Object> metadata = new HashMap<>();
  metadata.put("ls_provider", "my_provider");
  metadata.put("ls_model_name", "my_custom_model");

  Function<String, String> myCustomLlm =
      Tracing.traceFunction(
          prompt -> callCustomApi(prompt),
          TraceConfig.builder()
              .runType(RunType.LLM)
              .metadata(metadata)
              .build());
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.langchain.smith.tracing.traceable

  val myCustomLlm =
      traceable(
          { prompt: String -> callCustomApi(prompt) },
          TraceConfig.builder()
              .runType(RunType.LLM)
              .metadata(
                  mapOf(
                      "ls_provider" to "my_provider",
                      "ls_model_name" to "my_custom_model",
                  ),
              )
              .build(),
      )
  ```
</CodeGroup>

这个最小的设置告诉 LangSmith 您正在使用什么模型，如果该模型存在于定价数据库中或者您有[configured custom pricing](/langsmith/cost-tracking#llm-calls-automatically-track-costs-based-on-token-counts)，则可以自动计算成本。为了进行更全面的跟踪，您可以包含其他配置参数。这在 [running experiments](/langsmith/evaluation-quickstart) 或比较不同模型设置时特别有用：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  @traceable(
      run_type="llm",
      metadata={
          "ls_provider": "openai",
          "ls_model_name": "gpt-5.5",
          "ls_temperature": 0.7,
          "ls_max_tokens": 4096,
          "ls_stop": ["END"],
          "ls_invocation_params": {
              "top_p": 0.9,
              "frequency_penalty": 0.5
          }
      }
  )
  def my_configured_llm(messages: list):
      return call_llm(messages)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  const myConfiguredLlm = traceable(
    async (messages: Array<any>) => {
      return callLlm(messages);
    },
    {
      run_type: "llm",
      metadata: {
        ls_provider: "openai",
        ls_model_name: "gpt-5.5",
        ls_temperature: 0.7,
        ls_max_tokens: 4096,
        ls_stop: ["END"],
        ls_invocation_params: {
          top_p: 0.9,
          frequency_penalty: 0.5
        }
      }
    }
  );
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import java.util.Collections;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;
  import java.util.function.Function;

  Map<String, Object> metadata = new HashMap<>();
  metadata.put("ls_provider", "openai");
  metadata.put("ls_model_name", "gpt-5.5");
  metadata.put("ls_temperature", 0.7);
  metadata.put("ls_max_tokens", 4096);
  metadata.put("ls_stop", Collections.singletonList("END"));

  Map<String, Object> invocationParams = new HashMap<>();
  invocationParams.put("top_p", 0.9);
  invocationParams.put("frequency_penalty", 0.5);
  metadata.put("ls_invocation_params", invocationParams);

  Function<List<Map<String, String>>, String> myConfiguredLlm =
      Tracing.traceFunction(
          messages -> callLlm(messages),
          TraceConfig.builder()
              .runType(RunType.LLM)
              .metadata(metadata)
              .build());
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  val myConfiguredLlm =
      traceable(
          { messages: List<Map<String, String>> -> callLlm(messages) },
          TraceConfig.builder()
              .runType(RunType.LLM)
              .metadata(
                  mapOf(
                      "ls_provider" to "openai",
                      "ls_model_name" to "gpt-5.5",
                      "ls_temperature" to 0.7,
                      "ls_max_tokens" to 4096,
                      "ls_stop" to listOf("END"),
                      "ls_invocation_params" to
                          mapOf(
                              "top_p" to 0.9,
                              "frequency_penalty" to 0.5,
                          ),
                  ),
              )
              .build(),
      )
  ```
</CodeGroup>

通过此设置，您可以稍后按温度过滤迹线，比较不同最大令牌设置的运行，或分析哪些配置参数产生最佳结果。除了成本跟踪所需的 `ls_provider` 和 `ls_model_name` 对之外，所有这些参数都是可选的。

## 所有参数

### 用户可配置的参数|参数|类型 |必填|描述 |
| ---------------------------------------------------------------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| [⟦T29⟧](#ls_provider) | `string` |是\* |用于成本跟踪的 LLM 提供商名称 |
| [⟦T31⟧](#ls_model_name) | `string` |是\* |用于成本跟踪的型号标识符 |
| [⟦T33⟧](#ls_temperature) | `number` |没有 |使用的温度参数|
| [⟦T35⟧](#ls_max_tokens) | `number` |没有 |使用的最大令牌参数 |
| [⟦T37⟧](#ls_stop) | `string[]` |没有 |使用的停止序列 || [⟦T39⟧](#ls_invocation_params) | `object` |没有 |附加调用参数|
| [⟦T41⟧](#ls_agent_type) | `string` |没有 |控制代理运行在消息视图中的显示方式：`"root"`、`"subagent"` 或 `"middleware"` |
| [⟦T46⟧](#ls_message_view_exclude) | `boolean` |没有 |从消息视图隐藏运行 |
| [⟦T48⟧](#ls_is_error_interrupt) | `boolean` |没有 |当设置为 `true` 时，将错误运行标记为中断 |

\* `ls_provider` 和 `ls_model_name` 必须一起提供以进行成本跟踪

### 系统生成的参数

|参数|类型 |描述 |
| ------------------------------------------- | ---------| ---------------------------------------------------------------------------------- |
| [⟦T53⟧](#ls_run_depth) | `integer` |跟踪树的深度（0=根，1=子，等等）- 自动计算 |
| [⟦T55⟧](#ls_method) | `string` |使用的跟踪方法（例如“可跟踪”）- 由 SDK 设置 |

### 实验参数|参数|类型 |描述 |
| --------------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| [⟦T57⟧](#ls_example_) | `any` |前缀为 `ls_example_` 的示例元数据 - 在实验期间添加 |
| [⟦T60⟧](#ls_experiment_id) | `string`（UUID）|唯一的实验标识符 - 在实验期间添加 |

## 参数详细信息

### `ls_provider`

* **类型：** `string`
* **必填：** 是（使用 [⟦T64⟧](#ls_model_name)）

**它的作用：**
标识 LLM 提供者。与`ls_model_name`结合，可通过与[LangSmith's model pricing database](https://smith.langchain.com/settings/workspaces/models)匹配来自动计算成本。

**共同价值观：**

* `"openai"`
* `"anthropic"`
* `"azure"`
* `"bedrock"`
* `"google_vertexai"`
* `"google_genai"`
* `"fireworks"`
* `"mistral"`
* `"groq"`
* 或者，任何自定义字符串

**何时使用：**
当您需要 [automatic cost tracking](/langsmith/cost-tracking) 来自定义模型包装器或自托管模型时。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@traceable(
    run_type="llm",
    metadata={
        "ls_provider": "openai",
        "ls_model_name": "gpt-5.5"
    }
)
def my_llm_call(prompt: str):
    return call_api(prompt)
```

**关系：**

* **需要** [⟦T75⟧](#ls_model_name) 才能进行成本跟踪。
* 使用代币使用数据来计算成本。

### `ls_model_name`

* **类型：** `string`
* **必填：** 是（使用 `ls_provider`）**它的作用：**
标识具体型号。结合`ls_provider`，与定价数据库匹配，自动计算成本。

**共同价值观：**

* OpenAI：`"gpt-5.5"`、`"gpt-5.4-mini"`、`"gpt-3.5-turbo"`
* 人择：`"claude-sonnet-4-6"`、`"claude-opus-4-8"`
* 自定义：任何型号标识符

**何时使用：**
当您需要自动识别 [cost tracking](/langsmith/cost-tracking) 并在 [UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-ls-metadata-parameters) 中识别型号时。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
@traceable(
    run_type="llm",
    metadata={
        "ls_provider": "anthropic",
        "ls_model_name": "claude-3-5-sonnet-20241022"
    }
)
def my_claude_call(messages: list):
    return call_claude(messages)
```

**关系：**

* **需要** [⟦T85⟧](#ls_provider) 才能进行成本跟踪。
* 使用代币使用数据来计算成本。

### `ls_temperature`

* **类型：** `number`（可为空）
* **必填：** 否

**它的作用：**
记录使用的温度设置。这仅用于跟踪，不影响 LangSmith 行为。

**何时使用：**
当您想要跟踪模型配置以进行实验或调试时。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata={
    "ls_provider": "openai",
    "ls_model_name": "gpt-5.5",
    "ls_temperature": 0.7
}
```

**关系：**

* 独立；只是为了跟踪。
* 与其他配置参数一起用于实验比较。

### `ls_max_tokens`

* **类型：** `number`（可为空）
* **必填：** 否

**它的作用：**
记录使用的最大令牌设置。这仅用于跟踪，不影响 LangSmith 行为。

**何时使用：**
当您想要跟踪模型配置以进行实验或调试时。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata={
    "ls_provider": "openai",
    "ls_model_name": "gpt-5.5",
    "ls_max_tokens": 4096
}
```**关系：**

* 独立；只是为了跟踪。
* 结合实际代币使用情况，可用于成本分析。

### `ls_stop`

* **类型：** `string[]`（可为空）
* **必填：** 否

**它的作用：**
记录使用的停止序列。这仅用于跟踪，不影响 LangSmith 行为。

**何时使用：**
当您想要跟踪模型配置以进行实验或调试时。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata={
    "ls_provider": "openai",
    "ls_model_name": "gpt-5.5",
    "ls_stop": ["END", "STOP", "\n\n"]
}
```

**关系：**

* 独立；只是为了跟踪。

### `ls_invocation_params`

* **类型：** `object`（任何键值对）
* **必填：** 否

**它的作用：**
存储不适合特定 `ls_` 参数的其他模型参数。可以包括特定于提供商的设置。

**常用参数：**
`top_p`、`frequency_penalty`、`presence_penalty`、`top_k`、`seed` 或任何自定义参数

**何时使用：**
当您需要跟踪标准参数之外的其他配置时。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata={
    "ls_provider": "openai",
    "ls_model_name": "gpt-5.5",
    "ls_invocation_params": {
        "top_p": 0.9,
        "frequency_penalty": 0.5,
        "presence_penalty": 0.3,
        "seed": 12345
    }
}
```

**关系：**

* 独立；存储任意配置。

### `ls_agent_type`

* **类型：** `"root" | "subagent" | "middleware"`
* **必填：** 否

**它的作用：**
控制来自自定义代理运行的消息如何显示在 [Messages view](/langsmith/view-traces#messages-view) 中。最新版本 LangSmith SDK 中的跟踪包装器集成会在需要时自动设置此元数据。对于自定义检测，请在代表代理或中间件步骤的运行上设置此键。

**数值：**

* `"root"`：来自此运行的消息出现在主消息视图中。
* `"subagent"`：来自此运行的消息出现在与主对话分开的副线程中。
* `"middleware"`：来自此运行的消息在消息视图中隐藏。

**何时使用：**
当您构建自定义代理检测并希望消息视图区分根代理、子代理和中间件时。

欲了解更多详情，请参阅[Customize the Messages view](/langsmith/view-traces#customize-the-messages-view)。

**关系：**

* 独立于模型识别和成本跟踪元数据。
* 通过识别运行在代理跟踪中扮演的角色来补充跟踪父子结构。

### `ls_message_view_exclude`

* **类型：** `boolean`（基于存在）
* **必填：** 否

**它的作用：**
隐藏 [Messages view](/langsmith/view-traces#messages-view) 的运行。排除的运行仍显示在常规跟踪视图、运行资源管理器和指标中。

过滤器检查**是否存在密钥**，而不是真实性。 `{LS_MESSAGE_VIEW_EXCLUDE: False}` 仍然排除运行。完全省略该键以包含运行。**导入常数：**
该密钥从 `langsmith`（Python 和 JS）导出为 `LS_MESSAGE_VIEW_EXCLUDE` 常量，其值为字符串 `"ls_message_view_exclude"`。更喜欢常量以避免拼写错误；文字字符串仍然有效。

**何时使用：**
对于非对话回合的 LLM 子跨度，例如分类调用、嵌入查找、安全过滤器或路由/护栏决策，您仍然希望在 LangSmith 的其他位置可见，但不希望对话记录变得混乱。

**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langsmith import LS_MESSAGE_VIEW_EXCLUDE, traceable

@traceable(run_type="llm", metadata={LS_MESSAGE_VIEW_EXCLUDE: True})
def classify_intent(query: str) -> str:
    return llm.predict(f"Classify: {query}")
```

有关 Python 和 JS 上下文（`@traceable`、`trace`、`wrap_openai`、`RunnableConfig`、`wrapAISDK`、`RunTree.createChild`）的其他代码示例，请参阅[Exclude runs from the Messages view](/langsmith/messages-view-integrations#exclude-runs-from-the-messages-view)。

**关系：**

* 独立于模型识别和成本跟踪元数据。
* 补充[⟦T117⟧](#ls_agent_type)，它按角色路由消息而不是完全隐藏运行。

### `ls_is_error_interrupt`

* **类型：** `boolean`
* **必填：** 否

**它的作用：**
当运行出现错误时设置为 `true` 时，将运行状态标记为已中断而不是错误。

**何时使用：**
当您的仪器可以识别出错误代表运行中断时，例如用户中断或人机交互中断，并且您希望 LangSmith 将其与其他错误分开呈现。**示例：**

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
metadata={
    "ls_is_error_interrupt": True
}
```

**关系：**

* 仅影响包含错误的运行。
* 独立于模型识别和成本跟踪元数据。

### `ls_run_depth`

* **类型：** `integer`
* **设置者：** LangSmith 后端（自动）
* **不能被覆盖**

**它的作用：**
指示跟踪树中的深度：

* `0` = 根运行（顶层）
* `1` = 直系子代
* `2` = 孙子
* 等

**使用时：**
在跟踪摄取期间自动计算。用于过滤（例如，“仅显示根运行”）和 UI 可视化。

**查询示例：**

```
metadata_key = 'ls_run_depth' AND metadata_value = 0
```

**关系：**

* 由trace父子结构决定。
* 无法手动设置。

### `ls_method`

* **类型：** `string`
* **设置者：** SDK（自动）

**它的作用：**
指示哪个 SDK 方法创建了跟踪（通常为 `@traceable` 装饰器使用 `"traceable"`）。

**使用时：**
由跟踪SDK自动设置。用于调试和分析。

**关系：**

* 由 SDK 根据跟踪的创建方式进行设置。
* 无法手动设置。

### `ls_example_*`

* **类型：** 任何（取决于示例元数据）
* **图案：** `ls_example_{original_key}`
* **设定者：** LangSmith实验系统（自动）**它的作用：**
运行 [experiments on datasets](/langsmith/evaluation-quickstart) 时，示例中的元数据会自动添加 `ls_example_` 前缀并添加到跟踪中。

**特殊参数：**

* `ls_example_dataset_split`：数据集分割（例如“训练”、“测试”、“验证”）

**使用时：**
在数据集实验期间。允许按示例特征进行过滤/分组。

**示例：**
如果示例具有元数据`{"category": "technical", "difficulty": "hard"}`，则跟踪得到：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "metadata": {
    "ls_example_category": "technical",
    "ls_example_difficulty": "hard",
    "ls_example_dataset_split": "test"
  }
}
```

**关系：**

* 从示例元数据自动派生。
* 无法在轨迹上手动设置。

### `ls_experiment_id`

* **类型：** `string` (UUID)
* **设定者：** LangSmith实验系统（自动）

**它的作用：**
实验运行的唯一标识符。

**使用时：**
运行[experiments/evaluations on datasets](/langsmith/evaluation-quickstart)时自动添加。用于对同一实验的所有运行进行分组。

**关系：**

* 运行特定实验的链接。
* 无法手动设置。

## 参数关系

### 成本跟踪依赖项

为了让 LangSmith 自动计算成本，多个参数必须协同工作。这是需要的：

**主要要求：** [⟦T137⟧](#ls_provider) + [⟦T138⟧](#ls_model_name)* 两者都应存在以进行自动成本计算。
* 如果[⟦T139⟧](#ls_model_name)缺失，系统将回退到检查[⟦T140⟧](#ls_invocation_params)的型号名称。
* [⟦T141⟧](#ls_provider) 必须与 [pricing database](https://smith.langchain.com/settings/workspaces/models) 中的提供商匹配（或使用自定义定价）。

**附加要求：**

* 运行必须有`run_type="llm"`（或者必须启用[arbitrary cost tracking](/langsmith/cost-tracking#other-runs-send-costs)）。
* [Token usage data](/langsmith/log-llm-trace#provide-token-and-cost-information) 必须出现在跟踪中（prompt\_tokens、completion\_tokens）。
* 型号必须存在于定价数据库中或具有[custom pricing configured](/langsmith/cost-tracking#llm-calls-automatically-track-costs-based-on-token-counts)。

**回退行为：**
如果 [⟦T143⟧](#ls_model_name) 不在元数据中，系统会在放弃成本跟踪之前检查 [⟦T144⟧](#ls_invocation_params) 中是否有像 `"model"` 这样的模型标识符。

### 配置跟踪组

这些参数可帮助您跟踪模型设置，但不会影响 LangSmith 的核心功能：

**可选，独立工作：** [⟦T146⟧](#ls_temperature)、[⟦T147⟧](#ls_max_tokens)、[⟦T148⟧](#ls_stop)

* 这些用于跟踪/显示。
* 不影响 LangSmith 行为或成本计算。
* 用于实验比较和调试。

### 中断渲染

当运行错误应呈现为中断而不是错误时，将 [⟦T149⟧](#ls_is_error_interrupt) 设置为 `true`。此参数仅影响包含错误的运行。

### 调用参数特殊情况

`ls_invocation_params`参数具有跟踪字段和后备机制的双重作用：**[⟦T152⟧](#ls_invocation_params)**;部分独立并具有后备角色：

* 主要存储用于跟踪的任意配置。
* **如果缺少 [⟦T153⟧](#ls_model_name)，可以作为成本跟踪的后备**。
* 当[⟦T154⟧](#ls_model_name)存在时，不会直接影响成本计算。

###系统参数

这些参数由 LangSmith 自动生成，无法手动设置：

**不能由用户设置：** [⟦T155⟧](#ls_run_depth)、[⟦T156⟧](#ls_method)、[⟦T157⟧](#ls_example_)、[⟦T158⟧](#ls_experiment_id)

* 由系统自动设置。
* 用于过滤、分析和系统跟踪。

## 通过元数据参数过滤跟踪

将 `ls_` 元数据参数添加到跟踪后，您可以使用它们通过 [API](/langsmith/smith-api/run/query-runs) 以编程方式或在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-ls-metadata-parameters) 中以交互方式过滤和搜索跟踪。这使您可以按模型、提供程序、配置设置或跟踪深度缩小跟踪范围。

### 使用 API

将 [⟦T160⟧](https://docs.smith.langchain.com/reference/python/client/langsmith.client.Client) 类与 [⟦T161⟧](https://docs.smith.langchain.com/reference/python/client/langsmith.client.Client#langsmith.client.Client.list_runs) 方法 (Python) 或 [⟦T162⟧](https://docs.smith.langchain.com/reference/js/classes/client.Client#listruns) 方法 (TypeScript) 结合使用，根据元数据值查询跟踪。 [filter syntax](/langsmith/trace-query-syntax) 支持相等检查、比较和逻辑运算符。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import Client

  client = Client()

  # Filter runs by provider
  runs = client.list_runs(
      project_name="my-app",
      filter='metadata_key = "ls_provider" AND metadata_value = "openai"'
  )

  # Filter by specific model
  runs = client.list_runs(
      project_name="my-app",
      filter='metadata_key = "ls_model_name" AND metadata_value = "gpt-5.5"'
  )

  # Filter root runs only (top-level traces)
  runs = client.list_runs(
      project_name="my-app",
      filter='metadata_key = "ls_run_depth" AND metadata_value = 0'
  )

  # Filter by temperature threshold
  runs = client.list_runs(
      project_name="my-app",
      filter='metadata_key = "ls_temperature" AND metadata_value > 0.5'
  )
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { Client } from "langsmith";

  const client = new Client();

  // Filter runs by provider
  const runsByProvider: any[] = [];
  for await (const run of client.listRuns({
    projectName: "my-app",
    filter: 'metadata_key = "ls_provider" AND metadata_value = "openai"'
  })) {
    runsByProvider.push(run);
  }

  // Filter by specific model
  const runsByModel: any[] = [];
  for await (const run of client.listRuns({
    projectName: "my-app",
    filter: 'metadata_key = "ls_model_name" AND metadata_value = "gpt-5.5"'
  })) {
    runsByModel.push(run);
  }

  // Filter root runs only (top-level traces)
  const rootRuns: any[] = [];
  for await (const run of client.listRuns({
    projectName: "my-app",
    filter: 'metadata_key = "ls_run_depth" AND metadata_value = 0'
  })) {
    rootRuns.push(run);
  }

  // Filter by temperature threshold
  const highTempRuns: any[] = [];
  for await (const run of client.listRuns({
    projectName: "my-app",
    filter: 'metadata_key = "ls_temperature" AND metadata_value > 0.5'
  })) {
    highTempRuns.push(run);
  }
  ```
</CodeGroup>

这些示例显示了常见的过滤模式：* **按提供商或型号过滤**以分析特定型号的使用模式或成本
* **按运行深度过滤**，仅获取根跟踪（深度 0）或特定嵌套级别的子运行
* **按配置过滤**以比较不同温度、最大令牌或其他设置的实验

### 使用用户界面

在[LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-ls-metadata-parameters)中，将过滤器/搜索栏与[filter syntax](/langsmith/trace-query-syntax)一起使用：

```
metadata_key = 'ls_provider' AND metadata_value = 'openai'
metadata_key = 'ls_model_name' AND metadata_value = 'gpt-5.5'
metadata_key = 'ls_run_depth' AND metadata_value = 0
```

## 相关

* [Cost tracking guide](/langsmith/cost-tracking)：了解如何在 LangSmith 中跟踪和分析 LLM 成本。
* [Log LLM traces](/langsmith/log-llm-trace)：使用适当的令牌跟踪记录 LLM 调用的格式要求。
* [Trace query syntax](/langsmith/trace-query-syntax)：过滤和搜索痕迹的完整参考。
* [Evaluation quickstart](/langsmith/evaluation-quickstart)：在数据集上运行实验以比较模型配置。
* [Add metadata and tags](/langsmith/add-metadata-tags)：向跟踪添加元数据的一般指南。
* [Filter traces in application](/langsmith/filter-traces-in-application)：以编程方式过滤代码中的跟踪。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/ls-metadata-parameters.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>