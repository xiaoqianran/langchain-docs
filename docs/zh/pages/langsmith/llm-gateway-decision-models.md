<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Decision models | https://docs.langchain.com/langsmith/llm-gateway-decision-models -->

# 决策模型

使用 System One API 或 OpenAI Decisions API 通过 LangSmith LLM 网关调用 TypeSafe 和 OpenAI 决策模型。

决策模型对文本进行分类或评分，并返回结构化答案，而不是生成的聊天消息。通过[LLM Gateway](/langsmith/llm-gateway)致电他们。每个模型都使用自己的 API：

|型号|应用程序接口 |端点|证书 |
| - | - | - | - |
| [TypeSafe (Jev)](#use-typesafe-jev) |系统一| `/v1/systemone` | `TYPESAFE_API_KEY` 提供商秘密 |
| [OpenAI decision models](#use-openai-decision-models) | OpenAI 决定 | `/openai/v1/decisions` | `OPENAI_API_KEY` 提供商秘密 |

两种模型都需要工作空间范围的 [LangSmith API key](/langsmith/create-account-api-key) 和匹配的工作空间 [provider secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)。在运行此页面上的示例之前设置您的 LangSmith API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY="<your-api-key>"
```

## 使用 TypeSafe (Jev)

该网关支持带有自带密钥 (BYOK) 的 TypeSafe 决策模型。将 `TYPESAFE_API_KEY` 配置为工作区 [provider secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)。请参阅 [TypeSafe setup](/oss/python/integrations/providers/typesafe#setup) 创建密钥并安装 LangChain 集成。

TypeSafe (Jev) 使用 System One API。在 `state` 中传递要评估的文本，并在 `questions` 中传递一个或多个命名问题。系统一支持三种问题类型：

* **`noul`**：返回答案为真的概率。
* **`choice`**：将状态分类为提供的选项之一。
* **`score`**：根据评分标准对州进行评分。响应包含由问题名称而不是聊天消息键入的`answers`。不支持流式传输。

`typesafe/` 前缀通过工作区的 TypeSafe 提供程序密钥路由请求。传递您的 LangSmith API 密钥，而不是 TypeSafe API 密钥，作为 SDK 的 `api_key` 或 `apiKey`。对 SDK 使用不带 `/v1` 的网关基本 URL：

<Tabs>
  <Tab title="Python">
    安装 TypeSafe SDK：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install typesafe-sdk
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import os

    from typesafe_sdk import Noul, TypeSafeClient

    client = TypeSafeClient(
        api_key=os.environ["LANGSMITH_API_KEY"],
        base_url="https://gateway.smith.langchain.com",
    )

    response = client.system_one(
        state="Hello!",
        model="typesafe/jev-1.13.0",
        questions={
            "is_helpful": Noul(
                instructions="Does this explain what an LLM gateway does?"
            ),
        },
    )
    ```
  </Tab>

  <Tab title="JavaScript">
    安装 TypeSafe SDK：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    npm install @typesafe-ai/sdk
    ```

    ```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { noul, TypeSafeClient } from "@typesafe-ai/sdk";

    const client = new TypeSafeClient({
      apiKey: process.env.LANGSMITH_API_KEY,
      baseURL: "https://gateway.smith.langchain.com",
    });

    const response = await client.systemOne({
      state: "Hello!",
      model: "typesafe/jev-1.13.0",
      questions: {
        is_helpful: noul("Does this explain what an LLM gateway does?"),
      },
    });
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    curl https://gateway.smith.langchain.com/v1/systemone \
        -H "Authorization: Bearer $LANGSMITH_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
          "state": "Hello!",
          "model": "typesafe/jev-1.13.0",
          "questions": {
            "is_helpful": {
              "type": "noul",
              "instructions": "Does this explain what an LLM gateway does?"
            }
          }
        }'
    ```
  </Tab>
</Tabs>

## 使用OpenAI决策模型

OpenAI 决策模型使用 OpenAI Decisions API，该 API 有自己的请求和响应格式，与 System One 分开。网关通过 [direct model access](/langsmith/llm-gateway-direct-model-access) 支持 OpenAI Decisions API。将 `OPENAI_API_KEY` 配置为工作区 [provider secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)。

使用工作区范围的 LangSmith API 密钥向 `POST /openai/v1/decisions` 发送请求。将 `model` 设置为原生 OpenAI 模型名称，不带 `openai/` 前缀：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/openai/v1/decisions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-luna",
      "input": "The package arrived with a broken screen.",
      "questions": [
        {
          "type": "predicate",
          "name": "damaged",
          "instructions": "Does the customer report a damaged item?"
        }
      ]
    }'
```

网关保留本机请求和响应格式：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "model": "gpt-6-luna",
  "answers": [
    {
      "type": "predicate",
      "name": "damaged",
      "probability": 1.0
    }
  ],
  "usage": {
    "input_tokens": 164,
    "input_tokens_details": {
      "cached_tokens": 0,
      "cache_write_tokens": 0
    },
    "output_tokens": 0,
    "output_tokens_details": {
      "reasoning_tokens": 0
    },
    "total_tokens": 164
  }
}
```

网关[access](/langsmith/llm-gateway-model-access-policies)、[rate-limit](/langsmith/llm-gateway-rate-limit-policies)和[budget policies](/langsmith/llm-gateway-spend-policies)适用于决策请求，并且令牌使用量计入支出上限。网关将每个请求跟踪到LangSmith，并将请求作为输入，将答案和令牌使用情况作为输出。

## 另请参阅* [Admin setup](/langsmith/llm-gateway-admin-setup)：配置提供商机密并授予网关访问权限。
* [TypeSafe integration](/oss/python/integrations/providers/typesafe)：通过LangChain使用TypeSafe决策模型。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-decision-models.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>