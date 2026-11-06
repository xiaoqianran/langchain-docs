<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Gateway Credits | https://docs.langchain.com/langsmith/llm-gateway-credits -->

# 网关积分

使用 Gateway Credits 无需提供者密钥即可访问模型，只需使用 LangSmith 进行身份验证。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

**Gateway Credits** 让您可以通过标准 LLM Gateway API 调用 LangChain 托管模型，而无需设置提供商帐户或密钥。仅使用您的 [LangSmith API key](/langsmith/create-account-api-key) 进行身份验证。不需要[provider secret](/langsmith/llm-gateway-provider-authentication#add-a-provider-key)。

网关根据其模型 ID 路由每个请求。诸如 `moonshotai/kimi-k3` 之类的托管模型 slug 使用 Gateway Credits。以已配置的自带密钥提供程序（例如 `anthropic/claude-opus-5`）开头的模型 ID 使用该提供程序的密钥。

> [!注意]
>
> 网关积分可在除 Enterprise 之外的 [paid plans](https://www.langchain.com/pricing) 上使用。

## 可用型号

通过请求正文中的 ID 选择托管模型。型号 ID 不区分大小写。

|型号 ID |描述 |
| - | - |
| `moonshotai/kimi-k2.6` | Moonshot AI 的 Kimi K2.6。强大的通用模型。由烟花推理提供支持。 |
| `moonshotai/kimi-k3` | Moonshot AI 的 Kimi K3。由烟花推理提供支持。 |

> [!提示]
>
> 要列出您工作区可用的每个模型，包括配置的自带密钥提供程序和托管模型，请致电 [⟦T7⟧](/langsmith/llm-gateway-api-formats#list-models)。使用与提示请求的 `model` 字段中所示完全相同的返回模型 ID。## 拨打电话

托管模型使用与自带密钥模型相同的标准[API formats](/langsmith/llm-gateway-api-formats)。将与 OpenAI 兼容的客户端指向 `https://gateway.smith.langchain.com/v1`，使用工作区范围的 LangSmith API 密钥进行身份验证，并将 `model` 设置为托管模型 ID。有关密钥类型、权限和每个客户端发送的标头，请参阅[Authenticate to the LLM Gateway](/langsmith/llm-gateway-authentication)。

```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/chat/completions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"moonshotai/kimi-k3","messages":[{"role":"user","content":"ping"}]}'
```

```python OpenAI SDK theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

```python LangChain theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
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

本例调用LangSmith云上的美国网关。其他地区请参见[Use a regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway)。

## 定价

网关积分以 **LangChain 标准单位 (LSU)** 计价；每个调用都会根据令牌使用情况消耗 LSU。有关计划详细信息和当前费率，请参阅[the pricing page](https://www.langchain.com/pricing)。

标准网关[spend policies](/langsmith/llm-gateway-spend-policies)适用于托管模型流量，因此任何配置的组织、工作区、API 密钥或用户上限也控制网关信用的使用。您可以使用与自带密钥提供商相同的工具来控制网关信用消耗。例如，将每个提供商的特定 API 密钥上限限制为 200 美元/月，或者设置工作区范围内的每日限制（包括托管模型调用）。

## 追踪

与所有网关流量一样，托管模型调用可追溯到 LangSmith。有关痕迹落在何处以及如何控制对它们的访问，请参阅[View LLM Gateway traces](/langsmith/llm-gateway-traces)。

## 后续步骤* [Send your first LLM Gateway request](/langsmith/llm-gateway-first-request)：进行第一个网关代理呼叫。
* [API formats](/langsmith/llm-gateway-api-formats)：通过聊天完成、消息或响应调用模型。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：为 Gateway Credit 使用添加成本限制。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：使用提供商原生 API 和模型 ID。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-credits.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。