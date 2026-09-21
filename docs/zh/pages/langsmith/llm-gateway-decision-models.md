<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Decision models | https://docs.langchain.com/langsmith/llm-gateway-decision-models -->

# 决策模型

<Note>
LLM 网关位于[beta](/langsmith/release-stages)。
</Note>

决策模型返回结构化答案而不是生成的聊天消息。通过 [LLM Gateway](/langsmith/llm-gateway) 使用它们对文本进行分类并根据评分标准对其进行评分。 System One API 接受状态和命名问题，然后返回每个问题的答案。

## 半假设法

SemIf 是一个 LangChain 托管的决策模型，模型 ID 为 `semif-qwen3.5-4b`。 2026 年 9 月 28 日之前免费。无需提供提供商密钥或购买[Gateway Credits](/langsmith/llm-gateway-credits)。

### 先决条件

- 您的组织必须使用启用 SemIf 的付费非企业 [plan](/langsmith/pricing-plans)。可用性取决于您的组织和地区。
- 您需要一个工作空间范围的 [LangSmith API key](/langsmith/create-account-api-key) 以及 `gateway:invoke` 和 `workspaces:read` [permissions](/langsmith/organization-workspace-operations)。请参阅[Admin setup](/langsmith/llm-gateway-admin-setup)以授予访问权限。

### 调用 SemIf

通过 `POST /v1/systemone` 呼叫 `semif-qwen3.5-4b`，而不是聊天完成、消息或响应。将 `LANGSMITH_API_KEY` 设置为工作区范围的 LangSmith API 密钥。

TypeSafe SDK 将 `/v1/systemone` 附加到基本 URL。将 Python 中的 `base_url` 或 JavaScript 中的 `baseURL` 设置为 `https://gateway.smith.langchain.com`，不带 `/v1`。

<Tabs>
<Tab title="Python">

安装 TypeSafe SDK：

```bash
pip install typesafe-sdk
```

```python
import os

from typesafe_sdk import Noul, TypeSafeClient

client = TypeSafeClient(
    api_key=os.environ["LANGSMITH_API_KEY"],
    base_url="https://gateway.smith.langchain.com",
)

response = client.system_one(
    state="Hello!",
    model="semif-qwen3.5-4b",
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

```bash
npm install @typesafe-ai/sdk
```

```javascript
import { noul, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({
  apiKey: process.env.LANGSMITH_API_KEY,
  baseURL: "https://gateway.smith.langchain.com",
});

const response = await client.systemOne({
  state: "Hello!",
  model: "semif-qwen3.5-4b",
  questions: {
    is_helpful: noul("Does this explain what an LLM gateway does?"),
  },
});
```

</Tab>
<Tab title="cURL">

```bash
curl https://gateway.smith.langchain.com/v1/systemone \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "state": "Hello!",
      "model": "semif-qwen3.5-4b",
      "questions": {
        "is_helpful": {
          "type": "noul",
          "instructions": "Does this explain what an LLM gateway does?"
        }
      }
    }'
```

</Tab>
</Tabs>在 `state` 中传递要评估的文本，并在 `questions` 中传递 1 到 32 个命名问题。 SemIf 支持三种问题类型：

- **`noul`**：返回答案为真的概率。
- **`choice`**：将状态分类为提供的选项之一。
- **`score`**：根据评分标准对州进行评分。

响应包含由问题名称而不是聊天消息键入的`answers`。不支持流式传输。

您还可以从网关主页上的托管模型中选择 SemIf 以获取请求示例。有关区域基本 URL，请参阅 [Regional gateways](/langsmith/llm-gateway-direct-model-access#use-a-regional-gateway)。

### 应用网关策略

SemIf 调用不消耗网关积分。网关[access](/langsmith/llm-gateway-model-access-policies)、[rate-limit](/langsmith/llm-gateway-rate-limit-policies)和[budget policies](/langsmith/llm-gateway-spend-policies)仍然适用。

## 类型安全

该网关还支持带有自带密钥 (BYOK) 的 TypeSafe 决策模型。将 `TYPESAFE_API_KEY` 配置为工作区 [provider secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)。请参阅 [TypeSafe setup](/oss/python/integrations/providers/typesafe#setup) 创建密钥并安装 LangChain 集成。

将 `LANGSMITH_API_KEY` 设置为工作区范围的 LangSmith API 密钥。 `typesafe/` 前缀通过工作区的 TypeSafe 提供程序密钥（而不是托管的 SemIf 模型）路由请求。调用网关时，请勿将 TypeSafe API 密钥作为 SDK 的 `api_key` 或 `apiKey` 传递。对 SDK 使用不带 `/v1` 的网关基本 URL：

<Tabs>
<Tab title="Python">安装 TypeSafe SDK：

```bash
pip install typesafe-sdk
```

```python
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

```bash
npm install @typesafe-ai/sdk
```

```javascript
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

```bash
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

## 另请参阅

- [Admin setup](/langsmith/llm-gateway-admin-setup)：授予网关访问权限，无需为 SemIf 配置提供者密钥。
- [TypeSafe integration](/oss/python/integrations/providers/typesafe)：通过LangChain使用TypeSafe决策模型。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-decision-models.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>