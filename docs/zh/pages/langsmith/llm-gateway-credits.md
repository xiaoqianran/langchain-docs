<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Gateway Credits | https://docs.langchain.com/langsmith/llm-gateway-credits -->

# 网关积分

<Note>
**测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。 API 和功能可能会随着我们的迭代而改变。
</Note>

**Gateway Credits** 让您可以通过标准 LLM Gateway API 调用 LangChain 托管模型，而无需设置提供商帐户或密钥。仅使用您的 [LangSmith API key](/langsmith/create-account-api-key) 进行身份验证。不需要[provider secret](/langsmith/llm-gateway-admin-setup#1-add-provider-secrets)。

网关根据其模型 ID 路由每个请求。诸如 `moonshotai/kimi-k3` 之类的托管模型 slug 使用 Gateway Credits。以配置的自带密钥提供程序（例如 `anthropic/claude-opus-5`）开头的模型 ID 会改用该提供程序的密钥。

<Card title="Base URL" icon="link">
将任何受支持的客户端指向标准网关 API：

```text
https://gateway.smith.langchain.com/v1
```

使用您的 LangSmith API 密钥作为不记名令牌进行身份验证。

有关区域基本 URL，请参阅 [Regional gateways](/langsmith/llm-gateway-api-formats#use-a-regional-gateway)。
</Card>

## 可用型号

通过请求正文中的 ID 选择托管模型。型号 ID 不区分大小写。

|型号 ID |描述 |
| ---| ---|
| `moonshotai/kimi-k2.6` | Moonshot AI 的 Kimi K2.6。强大的通用模型。由烟花推理提供支持。 |
| `moonshotai/kimi-k3` | Moonshot AI 的 Kimi K3。由烟花推理提供支持。 |

使用标准模型列表端点列出工作区可用的每个模型，包括配置的自带密钥提供程序和托管模型：

```bash
curl https://gateway.smith.langchain.com/v1/models \
    -H "Authorization: Bearer $LANGSMITH_API_KEY"
```使用与提示请求的 `model` 字段中所示完全相同的返回模型 ID。

## 先决条件

使用 Gateway Credits 之前：

- 您的组织采用付费计划 ([Developer, Plus, Startup, or Premier](/langsmith/pricing-plans))。
- 您有一个工作区范围的 [LangSmith API key](/langsmith/create-account-api-key) 附加到具有 `gateway:invoke` 和 `workspaces:read` [permissions](/langsmith/organization-workspace-operations) 的角色。如果您不确定，请参阅[Admin setup](/langsmith/llm-gateway-admin-setup)。

## 拨打电话

将与 OpenAI 兼容的客户端指向 `https://gateway.smith.langchain.com/v1`，使用您的 LangSmith API 密钥进行身份验证，并将 `model` 设置为托管模型 ID。

<CodeGroup>

```bash cURL
curl https://gateway.smith.langchain.com/v1/chat/completions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"moonshotai/kimi-k3","messages":[{"role":"user","content":"ping"}]}'
```

```python OpenAI SDK
import os

from openai import OpenAI

client = OpenAI(
    base_url="https://gateway.smith.langchain.com/v1",
    api_key=os.environ["LANGSMITH_API_KEY"],
)
response = client.chat.completions.create(
    model="moonshotai/kimi-k3",
    messages=[{"role": "user", "content": "ping"}],
)
print(response.choices[0].message.content)
```

```python LangChain
import os

from langchain.chat_models import init_chat_model

model = init_chat_model(
    model="moonshotai/kimi-k3",
    model_provider="openai",
    base_url="https://gateway.smith.langchain.com/v1",
    api_key=os.environ["LANGSMITH_API_KEY"],
)
print(model.invoke("ping").content)
```

</CodeGroup>

## 支持的端点

托管模型使用与自带密钥模型相同的标准 API 格式：

|方法与路径|行为 |
| ---| ---|
| `POST /v1/chat/completions` | OpenAI 聊天完成，包括流媒体。 |
| `POST /v1/messages` | Anthropic 消息，包括流媒体。 |
| `POST /v1/responses` | OpenAI 回应。 |
| `GET /v1/models` |列出工作区可用的模型。 |

有关请求示例和翻译行为，请参阅[API formats](/langsmith/llm-gateway-api-formats)。

## 定价

Gateway Credits 适用于除 Enterprise 之外的所有付费计划。有关计划详细信息和当前费率，请参阅[the pricing page](https://www.langchain.com/pricing)。 Gateway 积分以 **LangChain 积分单位 (LCU)** 计价，**每 LCU 1.50 美元**；每个调用都会根据令牌使用情况消耗 LCU。标准网关[spend policies](/langsmith/llm-gateway-spend-policies)适用于托管模型流量，因此您配置的任何组织、工作区、API 密钥或用户上限也管理网关积分的使用。您可以使用与自带密钥提供商相同的工具来控制网关信用消耗。例如，将每个提供商的特定 API 密钥上限设置为 200 美元/月，或者设置工作区范围内的每日限额（包括托管模型调用）。

## 追踪

与所有网关流量一样，托管模型调用可追溯到 LangSmith。有关痕迹落在何处以及如何控制对它们的访问，请参阅[Traces, Engine, and access control](/langsmith/llm-gateway-access)。

## 后续步骤

- [Quickstart](/langsmith/llm-gateway-quickstart)：进行第一个网关代理呼叫。
- [API formats](/langsmith/llm-gateway-api-formats)：通过聊天完成、消息或响应调用模型。
- [Spend policies](/langsmith/llm-gateway-spend-policies)：为网关信用使用添加成本限制。
- [Direct model access](/langsmith/llm-gateway-direct-model-access)：使用提供商本机 API 和模型 ID。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-credits.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>