<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Cost tracking | https://docs.langchain.com/langsmith/cost-tracking -->

# 成本跟踪

大规模构建代理会带来不小的、基于使用的成本，而且很难跟踪。 LangSmith 自动记录主要提供商的 LLM 代币使用情况和成本，还允许您提交任何其他组件的自定义成本数据。

这为您提供了整个应用程序成本的单一、统一视图，从而可以轻松监控、了解和调试您的支出。

<Note>要限制评估器运行的 LLM 成本，请参阅[Track and limit evaluator spend](/langsmith/evaluator-spend)。评估者支出跟踪和限制使用[Model pricing](#create-a-new-or-modify-an-existing-model-price-entry).</Note>下配置的每个模型定价

## 在 LangSmith UI 中查看成本

在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-cost-tracking) 中，您可以通过三种方式探索使用情况和支出：作为单个跟踪中的细分、作为项目统计数据中的聚合指标以及在仪表板中。

### 代币和成本明细

UI 将代币使用和成本分为三类：

* **输入**：发送到模型的提示中的令牌。子类型包括：缓存读取、文本标记、图像标记等。
* **输出**：模型响应中生成的令牌。子类型包括：推理标记、文本标记、图像标记等。
* **其他**：工具调用、检索步骤或任何自定义运行的成本。您可以通过将鼠标悬停在 UI 中的成本部分来查看详细的细分。如果可用，每个部分都按子类型进一步分类。

<img alt="Cost tooltip" />

<img alt="Cost tooltip" />

您可以在 LangSmith UI 中检查这些故障：

#### 在跟踪树中

跟踪树显示了令牌使用和成本的最详细视图（对于单个跟踪）。它显示整个跟踪的总使用量、每个父运行的聚合值以及每个子运行的令牌和成本细分。

打开跟踪项目内的任何运行以查看其跟踪树。

<Note>
  跨线程跟踪成本时，请确保所有子运行都包含线程元数据（`session_id` 或 `thread_id`）。如果子运行中没有线程元数据，这些运行的令牌计数和成本将不会包含在线程级聚合中。有关设置线程元数据的详细信息，请参阅[configuring threads](/langsmith/threads)。
</Note>

#### 在项目统计中

项目统计面板显示项目中所有跟踪的总代币使用量和成本。

#### 在仪表板中

仪表板可帮助您探索一段时间内的成本和代币使用趋势。跟踪项目的[prebuilt dashboard](/langsmith/dashboards/#prebuilt-dashboards)显示总成本以及按输入和输出代币划分的成本细分。您还可以在[custom dashboards](https://docs.langchain.com/langsmith/dashboards#custom-dashboards)中配置自定义成本跟踪图表。

## 成本跟踪

您可以通过两种方式跟踪成本：

1. **自动**：根据 LLM 调用的代币数量和模型价格得出。
2. **手动**：在任何运行中直接指定，包括非 LLM 类型。

|方法|运行类型：法学硕士|运行类型: 其他|| ----------------- | —————————————————————————————————————————————————————————————————————————————————————————————————— -------------------------------------------------------------------------- |
| **自动** | <ul><li>使用[LangChain](/oss/python/langchain/overview)</li><li>使用`@traceable`</li><li>跟踪对OpenAI、Anthropic或遵循OpenAI兼容格式的模型的LLM调用使用LangSmith包装器[OpenAI](/langsmith/trace-openai) 或 [Anthropic](/langsmith/trace-anthropic)</li><li>对于其他模型提供商，请阅读[token and cost information guide](/langsmith/log-llm-trace#provide-token-and-cost-information)</li></ul> |不适用。                                                || **手动** |如果LLM通话成本是非线性的（例如遵循自定义成本函数）|发送任何运行类型的成本，例如工具调用、检索步骤|

### LLM 调用：根据代币计数自动跟踪成本

要根据代币使用情况自动计算成本，您需要提供**代币计数**、**模型和提供商**以及**模型价格**。

<Note>
  如果您使用 [LangChain](/oss/python/langchain/overview) 调用 LLM，将 `@traceable` 与 OpenAI 或 Anthropic（或 OpenAI 兼容模型）一起使用，或者使用 [OpenAI](/langsmith/trace-openai) 或 [Anthropic](/langsmith/trace-anthropic) 的 LangSmith 包装器，请跳过此部分。
</Note>

1. 发送令牌计数。许多模型都将令牌计数作为响应的一部分。您必须使用以下方法之一提取此信息并将其包含在运行中：* 在运行的元数据上设置 `usage_metadata` 字段。这种方法的优点是您不需要更改跟踪函数的运行时输出：

     <CodeGroup>
       ```python Python expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       from langsmith import traceable, get_current_run_tree

       inputs = [
           {"role": "system", "content": "You are a helpful assistant."},
           {"role": "user", "content": "I'd like to book a table for two."},
       ]

       @traceable(
           run_type="llm",
           metadata={"ls_provider": "my_provider", "ls_model_name": "my_model"}
       )
       def chat_model(messages: list):
           # Imagine this is the real model output format your application expects
           assistant_message = {
               "role": "assistant",
               "content": "Sure, what time would you like to book the table for?"
           }

           # Token usage you compute or receive from the provider
           token_usage = {
               "input_tokens": 27,
               "output_tokens": 13,
               "total_tokens": 40,
               "input_token_details": {"cache_read": 10}
           }

           # Attach token usage to the LangSmith run
           run = get_current_run_tree()
           run.set(usage_metadata=token_usage)

           return assistant_message

       chat_model(inputs)
       ```

       ```typescript TypeScript expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       import { traceable, getCurrentRunTree } from "langsmith/traceable";

       const inputs = [
       { role: "system", content: "You are a helpful assistant." },
       { role: "user", content: "I'd like to book a table for two." },
       ];

       const chatModel = traceable(
       async ({ messages }) => {
           // The output your application expects
           const assistantMessage = {
           role: "assistant",
           content: "Sure, what time would you like to book the table for?",
           };

           // Token usage you compute or receive from the provider
           const tokenUsage = {
           input_tokens: 27,
           output_tokens: 13,
           total_tokens: 40,
           input_token_details: { cache_read: 10 },
           };

           // Attach usage to the LangSmith run
           const runTree = getCurrentRunTree();
           runTree.metadata.usage_metadata = tokenUsage;

           return assistantMessage;
       },
       {
           run_type: "llm",
           name: "chat_model",
           metadata: {
           ls_provider: "my_provider",
           ls_model_name: "my_model",
           },
       }
       );

       await chatModel({ messages: inputs });
       ```

       ```java Java expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       import com.langchain.smith.client.LangsmithClient;
       import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
       import com.langchain.smith.tracing.RunTree;
       import com.langchain.smith.tracing.RunType;
       import com.langchain.smith.tracing.TraceConfig;
       import com.langchain.smith.tracing.Tracing;
       import java.util.Arrays;
       import java.util.HashMap;
       import java.util.List;
       import java.util.Map;
       import java.util.concurrent.ExecutorService;
       import java.util.concurrent.Executors;
       import java.util.concurrent.TimeUnit;
       import java.util.function.Function;

       class CostTrackingUsageMetadataRun {
         public static void main(String[] args) throws InterruptedException {
           if (System.getenv("LANGSMITH_API_KEY") == null
               || System.getenv("LANGSMITH_API_KEY").isBlank()) {
             System.out.println(
                 "[cost-tracking-usage-metadata-run] Skipping (LANGSMITH_API_KEY is not set).");
             return;
           }

           LangsmithClient langsmith = LangsmithOkHttpClient.fromEnv();
           ExecutorService executor = Executors.newSingleThreadExecutor();

           try {
             List<Map<String, String>> inputs =
                 Arrays.asList(
                     message("system", "You are a helpful assistant."),
                     message("user", "I'd like to book a table for two."));

             Map<String, Object> metadata = new HashMap<>();
             metadata.put("ls_provider", "my_provider");
             metadata.put("ls_model_name", "my_model");

             Function<List<Map<String, String>>, Map<String, String>> chatModel =
                 Tracing.traceFunction(
                     messages -> {
                       Map<String, String> assistantMessage =
                           message(
                               "assistant",
                               "Sure, what time would you like to book the table for?");

                       Map<String, Object> inputTokenDetails = new HashMap<>();
                       inputTokenDetails.put("cache_read", 10);

                       Map<String, Object> tokenUsage = new HashMap<>();
                       tokenUsage.put("input_tokens", 27);
                       tokenUsage.put("output_tokens", 13);
                       tokenUsage.put("total_tokens", 40);
                       tokenUsage.put("input_token_details", inputTokenDetails);

                       RunTree run = Tracing.getCurrentRunTree();
                       if (run != null) {
                         run.getMetadata().put("usage_metadata", tokenUsage);
                       }

                       return assistantMessage;
                     },
                     TraceConfig.builder()
                         .name("chat_model")
                         .runType(RunType.LLM)
                         .client(langsmith)
                         .executor(executor)
                         .metadata(metadata)
                         .build());

             chatModel.apply(inputs);
           } finally {
             executor.shutdown();
             if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
               throw new IllegalStateException("Timed out waiting for LangSmith traces to submit");
             }
           }
         }

         private static Map<String, String> message(String role, String content) {
           Map<String, String> message = new HashMap<>();
           message.put("role", role);
           message.put("content", content);
           return message;
         }
       }
       ```

       ```kotlin Kotlin expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
       import com.langchain.smith.tracing.RunType
       import com.langchain.smith.tracing.TraceConfig
       import com.langchain.smith.tracing.getCurrentRunTree
       import com.langchain.smith.tracing.traceable
       import java.util.concurrent.Executors
       import java.util.concurrent.TimeUnit

       val langsmith = LangsmithOkHttpClient.fromEnv()
       val executor = Executors.newSingleThreadExecutor()

       fun message(role: String, content: String) = mapOf("role" to role, "content" to content)

       try {
           val inputs =
               listOf(
                   message("system", "You are a helpful assistant."),
                   message("user", "I'd like to book a table for two."),
               )

           val chatModel =
               traceable(
                   { _: List<Map<String, String>> ->
                       val assistantMessage =
                           message(
                               "assistant",
                               "Sure, what time would you like to book the table for?",
                           )
                       val tokenUsage =
                           mapOf(
                               "input_tokens" to 27,
                               "output_tokens" to 13,
                               "total_tokens" to 40,
                               "input_token_details" to mapOf("cache_read" to 10),
                           )
                       getCurrentRunTree()?.metadata?.put("usage_metadata", tokenUsage)
                       assistantMessage
                   },
                   TraceConfig.builder()
                       .name("chat_model")
                       .runType(RunType.LLM)
                       .client(langsmith)
                       .executor(executor)
                       .metadata(
                           mapOf(
                               "ls_provider" to "my_provider",
                               "ls_model_name" to "my_model",
                           ),
                       )
                       .build(),
               )

           chatModel(inputs)
       } finally {
           executor.shutdown()
           check(executor.awaitTermination(10, TimeUnit.SECONDS)) {
               "Timed out waiting for LangSmith traces to submit"
           }
       }
       ```
     </CodeGroup>

     Java 和 Kotlin 示例使用专用执行器。关闭执行器并等待终止可确保后台跟踪提交在进程退出之前完成。

   * 在跟踪函数的输出中返回一个 `usage_metadata` 字段。将 `usage_metadata` 键直接包含在跟踪函数返回的对象中。 LangSmith 将从输出中提取它：

     <CodeGroup>
       ```python Python expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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
           ],
           "usage_metadata": {
               "input_tokens": 27,
               "output_tokens": 13,
               "total_tokens": 40,
               "input_token_details": {"cache_read": 10}
           },
       }

       @traceable(
           run_type="llm",
           metadata={"ls_provider": "my_provider", "ls_model_name": "my_model"}
       )
       def chat_model(messages: list):
           return output

       chat_model(inputs)
       ```

       ```typescript TypeScript expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

       const chatModel = traceable(
           async ({
               messages,
           }: {
               messages: { role: string; content: string }[];
               model: string;
           }) => {
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

       ```java Java expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       import com.langchain.smith.client.LangsmithClient;
       import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
       import com.langchain.smith.tracing.RunType;
       import com.langchain.smith.tracing.TraceConfig;
       import com.langchain.smith.tracing.Tracing;
       import java.util.Arrays;
       import java.util.HashMap;
       import java.util.List;
       import java.util.Map;
       import java.util.concurrent.ExecutorService;
       import java.util.concurrent.Executors;
       import java.util.concurrent.TimeUnit;
       import java.util.function.Function;

       class CostTrackingUsageMetadataOutput {
         public static void main(String[] args) throws InterruptedException {
           if (System.getenv("LANGSMITH_API_KEY") == null
               || System.getenv("LANGSMITH_API_KEY").isBlank()) {
             System.out.println(
                 "[cost-tracking-usage-metadata-output] Skipping (LANGSMITH_API_KEY is not set).");
             return;
           }

           LangsmithClient langsmith = LangsmithOkHttpClient.fromEnv();
           ExecutorService executor = Executors.newSingleThreadExecutor();

           try {
             List<Map<String, String>> messages =
                 Arrays.asList(
                     message("system", "You are a helpful assistant."),
                     message("user", "I'd like to book a table for two."));

             Map<String, Object> metadata = new HashMap<>();
             metadata.put("ls_provider", "my_provider");
             metadata.put("ls_model_name", "my_model");

             Function<List<Map<String, String>>, Map<String, Object>> chatModel =
                 Tracing.traceFunction(
                     inputMessages -> output(),
                     TraceConfig.builder()
                         .name("chat_model")
                         .runType(RunType.LLM)
                         .client(langsmith)
                         .executor(executor)
                         .metadata(metadata)
                         .build());

             chatModel.apply(messages);
           } finally {
             executor.shutdown();
             if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
               throw new IllegalStateException("Timed out waiting for LangSmith traces to submit");
             }
           }
         }

         private static Map<String, Object> output() {
           Map<String, Object> output = new HashMap<>();
           Map<String, Object> choice = new HashMap<>();
           choice.put(
               "message",
               message("assistant", "Sure, what time would you like to book the table for?"));
           output.put("choices", Arrays.asList(choice));

           Map<String, Object> inputTokenDetails = new HashMap<>();
           inputTokenDetails.put("cache_read", 10);

           Map<String, Object> usageMetadata = new HashMap<>();
           usageMetadata.put("input_tokens", 27);
           usageMetadata.put("output_tokens", 13);
           usageMetadata.put("total_tokens", 40);
           usageMetadata.put("input_token_details", inputTokenDetails);
           output.put("usage_metadata", usageMetadata);
           return output;
         }

         private static Map<String, String> message(String role, String content) {
           Map<String, String> message = new HashMap<>();
           message.put("role", role);
           message.put("content", content);
           return message;
         }
       }
       ```

       ```kotlin Kotlin expandable wrap theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
       import com.langchain.smith.tracing.RunType
       import com.langchain.smith.tracing.TraceConfig
       import com.langchain.smith.tracing.traceable
       import java.util.concurrent.Executors
       import java.util.concurrent.TimeUnit

       val langsmith = LangsmithOkHttpClient.fromEnv()
       val executor = Executors.newSingleThreadExecutor()

       fun message(role: String, content: String) = mapOf("role" to role, "content" to content)

       val output =
           mapOf(
               "choices" to
                   listOf(
                       mapOf(
                           "message" to
                               message(
                                   "assistant",
                                   "Sure, what time would you like to book the table for?",
                               ),
                       ),
                   ),
               "usage_metadata" to
                   mapOf(
                       "input_tokens" to 27,
                       "output_tokens" to 13,
                       "total_tokens" to 40,
                       "input_token_details" to mapOf("cache_read" to 10),
                   ),
           )

       try {
           val messages =
               listOf(
                   message("system", "You are a helpful assistant."),
                   message("user", "I'd like to book a table for two."),
               )

           val chatModel =
               traceable(
                   { _: List<Map<String, String>> -> output },
                   TraceConfig.builder()
                       .name("chat_model")
                       .runType(RunType.LLM)
                       .client(langsmith)
                       .executor(executor)
                       .metadata(
                           mapOf(
                               "ls_provider" to "my_provider",
                               "ls_model_name" to "my_model",
                           ),
                       )
                       .build(),
               )

           chatModel(messages)
       } finally {
           executor.shutdown()
           check(executor.awaitTermination(10, TimeUnit.SECONDS)) {
               "Timed out waiting for LangSmith traces to submit"
           }
       }
       ```
     </CodeGroup>

   无论哪种情况，使用元数据都应包含以下 LangSmith 识别字段的子集：

   <Accordion title="Usage Metadata Schema and Cost Calculation">
     LangSmith 可以识别 `usage_metadata` 字典中的以下字段。您可以直接查看完整的[Python types](https://github.com/langchain-ai/langsmith-sdk/blob/e705fbd362be69dd70229f94bc09651ef8056a61/python/langsmith/schemas.py#L1196-L1227)或[TypeScript interfaces](https://github.com/langchain-ai/langsmith-sdk/blob/e705fbd362be69dd70229f94bc09651ef8056a61/js/src/schemas.ts#L637-L689)。

     <ParamField type="number">
       模型输入中使用的标记数量。所有输入标记类型的总和。
     </ParamField>

     <ParamField type="number">
       模型响应中使用的令牌数量。所有输出令牌类型的总和。
     </ParamField><ParamField type="number">
       输入和输出中使用的令牌数量。可选的，可以推断。输入令牌+输出令牌之和。
     </ParamField>

     <ParamField type="object">
       输入令牌类型的细分。键是标记类型的字符串，值是计数。示例`{"cache_read": 5}`。

       已知字段包括：`audio`、`text`、`image`、`cache_read`、`cache_creation`、`cache_read_over_200k`（Gemini）、`ephemeral_5m_input_tokens`、`ephemeral_1h_input_tokens`（人择临时缓存层）。根据型号或提供商的不同，可能还会有其他字段。
     </ParamField>

     <ParamField type="object">
       输出令牌类型的细分。键是标记类型的字符串，值是计数。示例`{"reasoning": 5}`。

       已知字段包括：`audio`、`text`、`image`、`reasoning`。根据型号或提供商的不同，可能还会有其他字段。
     </ParamField>

     <ParamField type="number">
       输入代币的成本。
     </ParamField>

     <ParamField type="number">
       输出代币的成本。
     </ParamField>

     <ParamField type="number">
       代币的成本。可选的，可以推断。  输入成本+输出成本之和。
     </ParamField>

     <ParamField type="object">
       输入成本的详细信息。键是令牌类型的字符串，值是成本金额。
     </ParamField>

     <ParamField type="object">
       输出成本的详细信息。键是令牌类型的字符串，值是成本金额。
     </ParamField>**成本计算**

     运行的成本是根据特定令牌类型从大到小的贪婪计算的。假设您将每 1M 个输入代币的价格设置为 \$2，每 1M `cache_read` 输入代币的详细价格为 \$1，每 1M 个输出代币的详细价格为 \$3。如果您上传了以下使用情况元数据：

     ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     {
     "input_tokens": 20,
     "input_token_details": {"cache_read": 5},
     "output_tokens": 10,
     "total_tokens": 30,
     }
     ```

     然后，代币成本将计算如下：

     ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
     # Notice that LangSmith computes the cache_read cost and then for any
     # remaining input_tokens, the default input price is applied.
     input_cost = 5 * 1e-6 + (20 - 5) * 2e-6  # 3.5e-5
     output_cost = 10 * 3e-6  # 3e-5
     total_cost = input_cost + output_cost  # 6.5e-5
     ```
   </Accordion>

2. 指定型号名称。使用自定义模型时，需要在 [run's metadata](/langsmith/add-metadata-tags) 中指定以下字段，以便将令牌计数与成本相关联。在查看跟踪和过滤时提供这些元数据字段来识别模型也很有帮助。

   * `ls_provider`：模型的提供者，例如“openai”、“anthropic”
   * `ls_model_name`：型号名称，例如“gpt-5.4-mini”、“claude-opus-4-8”

3.设定型号价格。 LangSmith 使用 [model pricing table](https://smith.langchain.com/settings/workspaces/models) 将模型名称映射到每个代币价格，以根据代币数量计算成本。

   <Note>
     该表包含大多数 OpenAI、Anthropic 和 Gemini 模型的定价信息。如果您有自定义定价，您可以创建新的型号价格条目或覆盖默认型号的定价。
   </Note>对于针对不同令牌类型（例如多模式或缓存令牌）具有不同定价的模型，您可以指定每种令牌类型的价格细目。将鼠标悬停在 **输入价格** 和 **输出价格** 条目旁边的 **...** 上会显示按代币类型划分的价格细分。

   <Note>
     LangSmith 不会在**已**记录的跟踪成本中反映模型定价图的更新。不支持回填模型定价更改。
   </Note>

#### 创建新的或修改现有的模型价格条目

要修改默认型号价格，请创建一个与默认条目具有相同型号、提供商和匹配模式的新条目。

要在型号定价图中创建新条目，请单击右上角的 **+ 型号** 按钮。

在这里，您可以指定以下字段：* **模型名称**：人类可读的模型名称。
* **输入价格**：模型每 100 万个输入代币的成本。该数字乘以提示中的令牌数量即可计算提示成本。
* **输入价格细分**（可选）：每种不同类型输入代币的价格细分，例如`cache_read`、`video`、`audio`。
* **输出价格**：模型每 100 万个输出代币的成本。这个数字乘以完成中的代币数量来计算完成成本。
* **输出价格细分**（可选）：每种不同类型输出代币的价格细分，例如`reasoning`、`image`等。
* **模型激活日期**（可选）：定价适用的日期。仅在此日期之后运行才会应用此型号价格。
* **匹配模式**：匹配模型名称的正则表达式模式。这用于匹配运行元数据中`ls_model_name`的值。
* **Provider** （可选）：模型的提供者。如果指定，则会与运行元数据中的 `ls_provider` 进行匹配。一旦您设置了模型定价图，LangSmith 将根据 LLM 调用中提供的代币计数自动计算和聚合跟踪的基于代币的成本。

### LLM 电话：直接发送费用

Gemini 2.5 Pro Preview 和 Gemini 2.5 Pro 使用逐步成本函数，LangSmith 默认支持该函数。对于任何其他具有非线性定价的模型，计算客户端成本并将其作为 `usage_metadata` 发送，如以下代码所示：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import traceable, get_current_run_tree

  inputs = [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "I'd like to book a table for two."},
  ]

  @traceable(
      run_type="llm",
      metadata={"ls_provider": "my_provider", "ls_model_name": "my_model"}
  )
  def chat_model(messages: list):
      llm_output = {
          "choices": [
              {
                  "message": {
                      "role": "assistant",
                      "content": "Sure, what time would you like to book the table for?"
                  }
              }
          ],
          "usage_metadata": {
              # Specify cost (in dollars) for the inputs and outputs
              "input_cost": 1.1e-6,
              "input_cost_details": {"cache_read": 2.3e-7},
              "output_cost": 5.0e-6,
          },
      }
      run = get_current_run_tree()
      run.set(usage_metadata=llm_output["usage_metadata"])
      return llm_output["choices"][0]["message"]

  chat_model(inputs)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable, getCurrentRunTree } from "langsmith/traceable";

  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "I'd like to book a table for two." }
  ];

  const chatModel = traceable(
    async (messages: { role: string; content: string }[]) => {
      const llmOutput = {
        choices: [
          {
            message: {
              role: "assistant",
              content: "Sure, what time would you like to book the table for?",
            },
          },
        ],
        // Specify cost (in dollars) for the inputs and outputs
        usage_metadata: {
          input_cost: 1.1e-6,
          input_cost_details: { cache_read: 2.3e-7 },
          output_cost: 5.0e-6,
        },
      };

      // Attach usage metadata to the run
      const runTree = getCurrentRunTree();
      runTree.metadata.usage_metadata = llmOutput.usage_metadata;

      // Return only the assistant message
      return llmOutput.choices[0].message;
    },
    {
      run_type: "llm",
      name: "chat_model",
      metadata: {
        ls_provider: "my_provider",
        ls_model_name: "my_model",
      },
    }
  );

  await chatModel(messages);
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.LangsmithClient;
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
  import com.langchain.smith.tracing.RunTree;
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import java.util.Arrays;
  import java.util.HashMap;
  import java.util.List;
  import java.util.Map;
  import java.util.concurrent.ExecutorService;
  import java.util.concurrent.Executors;
  import java.util.concurrent.TimeUnit;
  import java.util.function.Function;

  class CostTrackingLlmCostDirect {
    public static void main(String[] args) throws InterruptedException {
      LangsmithClient langsmith = LangsmithOkHttpClient.fromEnv();
      ExecutorService executor = Executors.newSingleThreadExecutor();

      try {
        List<Map<String, String>> messages =
            Arrays.asList(
                message("system", "You are a helpful assistant."),
                message("user", "I'd like to book a table for two."));

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("ls_provider", "my_provider");
        metadata.put("ls_model_name", "my_model");

        Function<List<Map<String, String>>, Map<String, String>> chatModel =
            Tracing.traceFunction(
                inputMessages -> {
                  Map<String, Object> inputCostDetails = new HashMap<>();
                  inputCostDetails.put("cache_read", 2.3e-7);

                  Map<String, Object> usageMetadata = new HashMap<>();
                  usageMetadata.put("input_cost", 1.1e-6);
                  usageMetadata.put("input_cost_details", inputCostDetails);
                  usageMetadata.put("output_cost", 5.0e-6);

                  RunTree run = Tracing.getCurrentRunTree();
                  if (run != null) {
                    run.getMetadata().put("usage_metadata", usageMetadata);
                  }

                  return message(
                      "assistant", "Sure, what time would you like to book the table for?");
                },
                TraceConfig.builder()
                    .name("chat_model")
                    .runType(RunType.LLM)
                    .client(langsmith)
                    .executor(executor)
                    .metadata(metadata)
                    .build());

        chatModel.apply(messages);
      } finally {
        executor.shutdown();
        if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
          throw new IllegalStateException("Timed out waiting for LangSmith traces to submit");
        }
      }
    }

    private static Map<String, String> message(String role, String content) {
      Map<String, String> message = new HashMap<>();
      message.put("role", role);
      message.put("content", content);
      return message;
    }
  }
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.langchain.smith.tracing.getCurrentRunTree
  import com.langchain.smith.tracing.traceable
  import java.util.concurrent.Executors
  import java.util.concurrent.TimeUnit

  val langsmith = LangsmithOkHttpClient.fromEnv()
  val executor = Executors.newSingleThreadExecutor()

  fun message(role: String, content: String) = mapOf("role" to role, "content" to content)

  try {
      val messages =
          listOf(
              message("system", "You are a helpful assistant."),
              message("user", "I'd like to book a table for two."),
          )

      val chatModel =
          traceable(
              { _: List<Map<String, String>> ->
                  val usageMetadata =
                      mapOf(
                          "input_cost" to 1.1e-6,
                          "input_cost_details" to mapOf("cache_read" to 2.3e-7),
                          "output_cost" to 5.0e-6,
                      )
                  getCurrentRunTree()?.metadata?.put("usage_metadata", usageMetadata)
                  message(
                      "assistant",
                      "Sure, what time would you like to book the table for?",
                  )
              },
              TraceConfig.builder()
                  .name("chat_model")
                  .runType(RunType.LLM)
                  .client(langsmith)
                  .executor(executor)
                  .metadata(
                      mapOf(
                          "ls_provider" to "my_provider",
                          "ls_model_name" to "my_model",
                      ),
                  )
                  .build(),
          )

      chatModel(messages)
  } finally {
      executor.shutdown()
      check(executor.awaitTermination(10, TimeUnit.SECONDS)) {
          "Timed out waiting for LangSmith traces to submit"
      }
  }
  ```
</CodeGroup>

### 其他运行：发送成本

您还可以发送任何非 LLM 运行的成本信息，例如工具调用。在运行的 `usage_metadata` 的 `total_cost` 字段中指定成本：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import traceable, get_current_run_tree

  # Example tool: get_weather
  @traceable(run_type="tool", name="get_weather")
  def get_weather(city: str):
      # Your tool logic goes here
      result = {
          "temperature_f": 68,
          "condition": "sunny",
          "city": city,
      }

      # Cost for this tool call (computed however you like)
      tool_cost = 0.0015

      # Attach usage metadata to the LangSmith run
      run = get_current_run_tree()
      run.set(usage_metadata={"total_cost": tool_cost})

      # Return only the actual tool result (no usage info)
      return result

  tool_response = get_weather("San Francisco")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable, getCurrentRunTree } from "langsmith/traceable";

  // Example tool: get_weather
  const getWeather = traceable(
    async ({ city }) => {
      // Your tool logic goes here
      const result = {
        temperature_f: 68,
        condition: "sunny",
        city,
      };

      // Cost for this tool call (computed however you like)
      const toolCost = 0.0015;

      // Attach usage metadata to the LangSmith run
      const runTree = getCurrentRunTree();
      runTree.metadata.usage_metadata = {
        total_cost: toolCost,
      };

      // Return only the actual tool result (no usage info)
      return result;
    },
    {
      run_type: "tool",
      name: "get_weather",
    }
  );

  const toolResponse = await getWeather({ city: "San Francisco" });
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.LangsmithClient;
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
  import com.langchain.smith.tracing.RunTree;
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import java.util.HashMap;
  import java.util.Map;
  import java.util.concurrent.ExecutorService;
  import java.util.concurrent.Executors;
  import java.util.concurrent.TimeUnit;
  import java.util.function.Function;

  class CostTrackingToolCostRun {
    public static void main(String[] args) throws InterruptedException {
      LangsmithClient langsmith = LangsmithOkHttpClient.fromEnv();
      ExecutorService executor = Executors.newSingleThreadExecutor();

      try {
        Function<String, Map<String, Object>> getWeather =
            Tracing.traceFunction(
                city -> {
                  Map<String, Object> result = new HashMap<>();
                  result.put("temperature_f", 68);
                  result.put("condition", "sunny");
                  result.put("city", city);

                  RunTree run = Tracing.getCurrentRunTree();
                  if (run != null) {
                    Map<String, Object> usageMetadata = new HashMap<>();
                    usageMetadata.put("total_cost", 0.0015);
                    run.getMetadata().put("usage_metadata", usageMetadata);
                  }

                  return result;
                },
                TraceConfig.builder()
                    .name("get_weather")
                    .runType(RunType.TOOL)
                    .client(langsmith)
                    .executor(executor)
                    .build());

        Map<String, Object> toolResponse = getWeather.apply("San Francisco");
      } finally {
        executor.shutdown();
        if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
          throw new IllegalStateException("Timed out waiting for LangSmith traces to submit");
        }
      }
    }
  }
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.langchain.smith.tracing.getCurrentRunTree
  import com.langchain.smith.tracing.traceable
  import java.util.concurrent.Executors
  import java.util.concurrent.TimeUnit

  val langsmith = LangsmithOkHttpClient.fromEnv()
  val executor = Executors.newSingleThreadExecutor()

  try {
      val getWeather =
          traceable(
              { city: String ->
                  val result =
                      mapOf(
                          "temperature_f" to 68,
                          "condition" to "sunny",
                          "city" to city,
                      )
                  getCurrentRunTree()
                      ?.metadata
                      ?.put("usage_metadata", mapOf("total_cost" to 0.0015))
                  result
              },
              TraceConfig.builder()
                  .name("get_weather")
                  .runType(RunType.TOOL)
                  .client(langsmith)
                  .executor(executor)
                  .build(),
          )

      val toolResponse = getWeather("San Francisco")
  } finally {
      executor.shutdown()
      check(executor.awaitTermination(10, TimeUnit.SECONDS)) {
          "Timed out waiting for LangSmith traces to submit"
      }
  }
  ```
</CodeGroup>

或者，直接将 `usage_metadata` 包含在跟踪函数的返回值中：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from langsmith import traceable

  # Example tool: get_weather
  @traceable(run_type="tool", name="get_weather")
  def get_weather(city: str):
      # Your tool logic goes here
      result = {
          "temperature_f": 68,
          "condition": "sunny",
          "city": city,
      }

      # Attach tool call costs here
      return {
          **result,
          "usage_metadata": {
              "total_cost": 0.0015,   # <-- cost for this tool call
          },
      }

  tool_response = get_weather("San Francisco")
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { traceable } from "langsmith/traceable";

  // Example tool: get_weather
  const getWeather = traceable(
    async ({ city }) => {
      // Your tool logic goes here
      const result = {
        temperature_f: 68,
        condition: "sunny",
        city,
      };

      // Attach tool call costs here
      return {
        ...result,
        usage_metadata: {
          total_cost: 0.0015,  // <-- cost for this tool call
        },
      };
    },
    {
      run_type: "tool",
      name: "get_weather",
    }
  );

  const toolResponse = await getWeather({ city: "San Francisco" });
  ```

  ```java Java theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.LangsmithClient;
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient;
  import com.langchain.smith.tracing.RunType;
  import com.langchain.smith.tracing.TraceConfig;
  import com.langchain.smith.tracing.Tracing;
  import java.util.HashMap;
  import java.util.Map;
  import java.util.concurrent.ExecutorService;
  import java.util.concurrent.Executors;
  import java.util.concurrent.TimeUnit;
  import java.util.function.Function;

  class CostTrackingToolCostOutput {
    public static void main(String[] args) throws InterruptedException {
      if (System.getenv("LANGSMITH_API_KEY") == null
          || System.getenv("LANGSMITH_API_KEY").isBlank()) {
        System.out.println(
            "[cost-tracking-tool-cost-output] Skipping (LANGSMITH_API_KEY is not set).");
        return;
      }

      LangsmithClient langsmith = LangsmithOkHttpClient.fromEnv();
      ExecutorService executor = Executors.newSingleThreadExecutor();

      try {
        Function<String, Map<String, Object>> getWeather =
            Tracing.traceFunction(
                city -> {
                  Map<String, Object> result = new HashMap<>();
                  result.put("temperature_f", 68);
                  result.put("condition", "sunny");
                  result.put("city", city);

                  Map<String, Object> usageMetadata = new HashMap<>();
                  usageMetadata.put("total_cost", 0.0015);
                  result.put("usage_metadata", usageMetadata);
                  return result;
                },
                TraceConfig.builder()
                    .name("get_weather")
                    .runType(RunType.TOOL)
                    .client(langsmith)
                    .executor(executor)
                    .build());

        Map<String, Object> toolResponse = getWeather.apply("San Francisco");
      } finally {
        executor.shutdown();
        if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
          throw new IllegalStateException("Timed out waiting for LangSmith traces to submit");
        }
      }
    }
  }
  ```

  ```kotlin Kotlin theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import com.langchain.smith.client.okhttp.LangsmithOkHttpClient
  import com.langchain.smith.tracing.RunType
  import com.langchain.smith.tracing.TraceConfig
  import com.langchain.smith.tracing.traceable
  import java.util.concurrent.Executors
  import java.util.concurrent.TimeUnit

  val langsmith = LangsmithOkHttpClient.fromEnv()
  val executor = Executors.newSingleThreadExecutor()

  try {
      val getWeather =
          traceable(
              { city: String ->
                  mapOf(
                      "temperature_f" to 68,
                      "condition" to "sunny",
                      "city" to city,
                      "usage_metadata" to mapOf("total_cost" to 0.0015),
                  )
              },
              TraceConfig.builder()
                  .name("get_weather")
                  .runType(RunType.TOOL)
                  .client(langsmith)
                  .executor(executor)
                  .build(),
          )

      val toolResponse = getWeather("San Francisco")
  } finally {
      executor.shutdown()
      check(executor.awaitTermination(10, TimeUnit.SECONDS)) {
          "Timed out waiting for LangSmith traces to submit"
      }
  }
  ```
</CodeGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cost-tracking.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>