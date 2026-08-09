<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Amazon Bedrock applications | https://docs.langchain.com/langsmith/trace-bedrock -->

# 跟踪 Amazon Bedrock 应用程序

本指南向您展示如何使用本机 AWS 开发工具包通过 LangSmith 跟踪 [Amazon Bedrock](https://aws.amazon.com/bedrock) 模型调用。 LangSmith 还可以与 [LangChain's Bedrock integrations](/oss/python/integrations/providers/aws) 无缝协作。这两种方法都提供了以下方面的见解：

* 请求和响应负载
* 代币使用和费用
* 延迟和性能指标
* 用于过滤和分析的自定义标签和元数据
* 多步骤链和代理工作流程

## 安装

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install boto3 langsmith
  ```

  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @aws-sdk/client-bedrock-runtime langsmith
  ```
</CodeGroup>

此集成使用具有 LangSmith 跟踪功能的本机 AWS 软件开发工具包。对于 Python，您将使用 [⟦T6⟧](https://pypi.org/project/boto3/)（适用于 Python 的 AWS 开发工具包）和 [⟦T7⟧](https://pypi.org/project/langsmith/) 来捕获跟踪。对于 JavaScript/TypeScript，您将使用 [⟦T8⟧](https://www.npmjs.org/package/@aws-sdk/client-bedrock-runtime) 和 [⟦T9⟧](https://www.npmjs.org/package/langsmith) 包。两种实现都使用[Bedrock Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)，它提供了与基础模型交互的统一接口。

## 设置

要启用 LangSmith 跟踪，请配置您的 [LangSmith API key](/langsmith/create-account-api-key) 和项目设置。您还需要设置 AWS 凭证以通过 Bedrock 进行身份验证。

### LangSmith配置

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your_langsmith_api_key>
export LANGSMITH_PROJECT=<your_project_name> # optional, defaults to "default"
export LANGSMITH_TRACING=true
```

您可以通过导航至 **设置** > **API 密钥**，从 [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-bedrock) 获取 LangSmith API 密钥。 `LANGSMITH_PROJECT` 变量允许您将跟踪组织到不同的项目中。

### AWS 凭证配置您的 AWS 凭证以通过 Bedrock 进行身份验证。您需要一个启用了 Bedrock 访问权限的 AWS 账户。按照 [AWS setup instructions](https://docs.aws.amazon.com/bedrock/latest/userguide/setting-up.html) 创建您的凭证和 [enable model access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
export AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
export AWS_SESSION_TOKEN=<your_session_token> # only if using temporary credentials
export AWS_DEFAULT_REGION=<your_bedrock_region> # e.g., us-east-1 or us-west-2
```

## 配置跟踪

设置环境变量后，您可以通过使用 LangSmith 的 `@traceable` 装饰器 (Python) 或 `traceable` 函数 (TypeScript) 包装调用函数来跟踪 Bedrock 模型调用。

以下示例演示了如何将 Bedrock Converse API 与 LangSmith 跟踪结合使用。 Converse API 是 AWS 推荐的基础模型统一接口，可跨不同模型提供商提供一致的请求和响应处理。您可以使用自定义标签和元数据增强跟踪 - 标签帮助您对跟踪进行分类（例如，按环境、功能或测试类型），而元数据允许您附加任意键值对以获取详细上下文：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import boto3
  from langsmith import traceable

  # Initialize Bedrock runtime client (ensure AWS creds and region are set)
  bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")
  model_id = "anthropic.claude-haiku-4-5-20251001-v1:0"  # Example Bedrock model ID

  # Decorate the model invocation function to auto-capture a trace with tags/metadata
  @traceable(tags=["aws-bedrock", "langsmith", "integration-test"],
             metadata={"env": "dev", "model_provider": "bedrock", "model_id": "claude-3-haiku"})
  def generate_text(prompt: str) -> str:
      # Prepare a single-turn conversation input for the Converse API
      messages = [
          {"role": "user", "content": [{"text": prompt}]}
      ]
      # Invoke the Bedrock model using the unified Converse API
      response = bedrock.converse(
          modelId=model_id,
          messages=messages,
          inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9}
      )
      # Extract the model's reply text from the response
      output_text = response["output"]["message"]["content"][0]["text"]
      return output_text

  # Call the traced function with a prompt
  result = generate_text("How can I trace AWS Bedrock model outputs to LangSmith for debugging?")
  print(result)
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
  import { traceable } from "langsmith";

  const client = new BedrockRuntimeClient({ region: "us-east-1" });
  const modelId = "anthropic.claude-haiku-4-5-20251001-v1:0";

  // Wrap the Bedrock invocation in a traceable function with tags and metadata
  const invokeBedrock = traceable(
    async (userInput: string) => {
      // Prepare the conversation message for the Bedrock Converse API
      const conversation = [
        { role: "user", content: [{ text: userInput }] }
      ];
      // Create and send a Bedrock Converse command (single-turn chat)
      const command = new ConverseCommand({
        modelId,
        messages: conversation,
        inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 }
      });
      const response = await client.send(command);
      // Extract the assistant's reply text from the response
      const outputText = response.output?.message?.content[0]?.text;
      return outputText;
    },
    {
      tags: ["aws-bedrock", "langsmith", "integration-test"],
      metadata: { env: "dev", model_provider: "bedrock", model_id: "claude-3-haiku" }
    }
  );

  // Invoke the traced function with a prompt
  const answer = await invokeBedrock("How can I trace AWS Bedrock model outputs to LangSmith for debugging?");
  console.log(answer);
  ```
</CodeGroup><Tabs>
  <Tab title="Python">
    * `boto3.client("bedrock-runtime")` 创建一个 Bedrock Runtime 客户端。
    * `converse` 方法将聊天提示（作为消息列表）发送到指定模型并返回结构化响应。
    * `generate_text` 函数用 `@traceable` 修饰，将对 LangSmith 的每个调用记录为跟踪（使用函数名称作为默认跟踪名称）。
    * 自定义标签（`aws-bedrock`、`langsmith`、`integration-test`）和元数据（环境、模型信息）被传递到装饰器中并附加到跟踪记录以在 LangSmith UI 中进行过滤。
    * 当您运行此代码（使用 `LANGSMITH_TRACING=true` 和您的 API 密钥集）时，LangSmith 会自动捕获输入提示、模型输出、令牌使用情况和延迟。
  </Tab><Tab title="TypeScript">
    * AWS SDK v3中的`BedrockRuntimeClient`提供了Bedrock运行时接口。
    * `ConverseCommand` 提供统一的聊天界面，发送用户消息并以结构化格式返回助手的响应（无需手动 JSON 解析）。
    * Bedrock 调用用 LangSmith 的 `traceable` 函数包装，将 `invokeBedrock` 转换为跟踪函数，将其执行记录到 LangSmith。
    * 自定义标签和元数据在可跟踪选项对象中提供并附加到每个跟踪。
    * 当您运行此脚本时（使用 `LANGSMITH_TRACING=true` 并配置您的 API 密钥），请检查您的 LangSmith 仪表板中的跟踪条目，其中包括输入提示、模型输出、计时信息和指定的标签/元数据。
  </Tab>
</Tabs>

## 在 LangSmith 中查看痕迹

运行代码后，导航到位于 [smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-bedrock) 的 LangSmith 项目以查看跟踪。每个跟踪包括：

* **请求详细信息**：输入消息、模型参数和配置
* **响应详细信息**：模型输出、令牌使用和响应元数据
* **性能指标**：延迟、每秒令牌数和成本估算
* **自定义元数据**：您提供给 `@traceable` 装饰器的标签和元数据您可以按标签（例如，`aws-bedrock`或`integration-test`）过滤跟踪，按元数据字段搜索，或深入研究特定跟踪以调试问题。

## 后续步骤

* 了解有关[LangSmith features](/langsmith)的更多信息，包括评估、数据集和反馈
* 探索[Bedrock model capabilities](https://docs.aws.amazon.com/bedrock/latest/userguide/models-features.html)，如工具调用、流式传输和提示缓存
* 查看 [LangChain Bedrock integration documentation](/oss/python/integrations/chat/bedrock) 以获得扩展思维和引用等高级功能

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-bedrock.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>