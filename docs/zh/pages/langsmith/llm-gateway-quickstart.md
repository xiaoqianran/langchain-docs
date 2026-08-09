<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Quickstart | https://docs.langchain.com/langsmith/llm-gateway-quickstart -->

# 快速入门

使用 cURL、Python 或 TypeScript 发出第一个 LLM 网关请求。

LLM Gateway 允许您使用一个 LangSmith API 密钥通过一个标准端点跨已配置的提供者调用模型。本快速入门使用 OpenAI 聊天完成格式来调用 Anthropic 模型。

<Note>
  **测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

## 先决条件

在开始之前，请确认：

* 您的[Organization admin](/langsmith/rbac#organization-admin)已启用LLM网关。对于自带密钥模型，管理员还必须将提供程序 API 密钥添加到工作区密钥中。要进行设置，请参阅[Admin setup](/langsmith/llm-gateway-admin-setup)。
* 您有一个工作区范围的 [LangSmith API key](/langsmith/create-account-api-key) 附加到具有 `gateway:invoke` 和 `workspaces:read` [permissions](/langsmith/organization-workspace-operations) 的角色。如果您不确定，请询问您的组织管理员。

您可以在没有提供商机密的情况下调用 [Gateway Credits model](/langsmith/llm-gateway-credits)。下面的示例使用自带密钥 Anthropic 模型。

## 1.设置环境变量

设置标准网关基本 URL 和您的 LangSmith API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_GATEWAY_BASE_URL="https://gateway.smith.langchain.com/v1"
export LANGSMITH_API_KEY="lsv2_..._....cbed3e"
```

统一基本 URL 接受以提供商为前缀的自带密钥模型 ID（例如 `anthropic/claude-opus-5`）和托管模型 slugs（例如 `moonshotai/kimi-k3`）。型号ID决定上游路由。

<Note>
  如果您的 LangSmith 账户位于区域实例上，请使用相应的 [regional gateway](/langsmith/llm-gateway-api-formats#use-a-regional-gateway)。
</Note>要保留提供者的本机 API 而不进行格式转换，请改用 [direct provider route](/langsmith/llm-gateway-direct-model-access)。

### 使用LangChain和Deep Agents

[LangChain](/oss/python/langchain/overview)聊天模型和[Deep Agents](/oss/python/deepagents/overview)（包括[Deep Agents Code](/oss/deepagents/code/overview)）通过两个方便的环境变量支持网关：

<CodeGroup>
  ```bash Bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  export LANGSMITH_GATEWAY="true"
  export LANGSMITH_GATEWAY_API_KEY="$LANGSMITH_API_KEY"
  ```

  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  os.environ["LANGSMITH_GATEWAY"] = "true"
  os.environ["LANGSMITH_GATEWAY_API_KEY"] = os.environ["LANGSMITH_API_KEY"]
  ```
</CodeGroup>

这将通过`https://gateway.smith.langchain.com`处的网关路由所有支持的聊天模型。要使用不同的网关（例如 EU 实例），请设置其 URL 而不是 `true`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_GATEWAY="https://eu.gateway.smith.langchain.com"
export LANGSMITH_GATEWAY_API_KEY="$LANGSMITH_API_KEY"
```

<Note>
  如果网关已启用但`LANGSMITH_GATEWAY_API_KEY`未设置，网关将回退到`LANGSMITH_API_KEY`。
</Note>

您还可以为各个提供商配置基本 URL 和 API 密钥。请参阅以下手风琴以了解提供程序支持以及与特定于提供程序的环境变量的交互。

<Accordion title="More details">
  * 仅在 Python 中受支持。
  * 支持的聊天模式：
    * [Anthropic](/oss/python/integrations/chat/anthropic) (`langchain-anthropic >= 1.5.1`)
    * [Baseten](/oss/python/integrations/chat/baseten) (`langchain-baseten >= 0.2.3`)
    * [Fireworks](/oss/python/integrations/chat/fireworks) (`langchain-fireworks >= 1.5.1`)
    * [Google Gemini](/oss/python/integrations/chat/google_generative_ai) (`langchain-google-genai >= 4.3.2`)
    * [OpenAI](/oss/python/integrations/chat/openai) (`langchain-openai >= 1.4.1`)。
  * 特定于提供商的基本 URL 优先于网关，因此您仍然可以将单个提供商路由到其他地方。例如，启用网关后，`OPENAI_API_BASE` 将 OpenAI 发送到该 URL，而其他所有提供商继续使用该网关：

    ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    export OPENAI_API_BASE="https://my.custom.gateway/openai/v2"
    ```下表显示了如何解析基本 URL 和密钥，以 OpenAI 为例（其他提供商使用自己的 `*_API_BASE` 和 `*_API_KEY` 变量）。 `GW default` 是 `https://gateway.smith.langchain.com/openai/v1`。

  | `LANGSMITH_GATEWAY` | `LANGSMITH_GATEWAY_API_KEY` | `OPENAI_API_BASE` | `OPENAI_API_KEY` | `base_url=` 夸格 |已解析的基本 URL |已解决的关键 |
  | ------------------- | ------------------------ | | ------------------- | ---------------- | ----------------- | ------------------- | ------------ |
  |未设置 / `false` | — | — | — | — | `api.openai.com` |无 |
  |未设置 / `false` | ✓ | — |供应商密钥 | — | `api.openai.com` |供应商密钥 |
  | `true` | ✓ | — | — | — | GW默认|网关密钥 |
  | `true` | — | — | — | — | GW默认|无 |
  | `true` | ✓ | — |供应商密钥 | — | GW默认|网关密钥 || `true` | — | — |供应商密钥 | — | GW默认|供应商密钥 |
  | `true` | ✓ | `api.openai.com/v1` |供应商密钥 | — | `api.openai.com/v1` |供应商密钥 |
  | `true` | ✓ | `api.openai.com/v1` | — | — | `api.openai.com/v1` |网关密钥 |
  | `true` | ✓ | `my.dev.gateway` | — | — | `my.dev.gateway` |网关密钥 |
  | `https://eu…` | ✓ | — | — | — | `eu…/openai/v1` |网关密钥 |
  | `https://eu…` | ✓ | — | — | `https://apac…` | `apac…` |网关密钥 |
  | `https://eu…` | ✓ | — |供应商密钥 | `https://apac…` | `apac…` |供应商密钥 |
</Accordion>

## 2. 拨打电话

<CodeGroup>
  ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl "$LANGSMITH_GATEWAY_BASE_URL/chat/completions" \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"model":"anthropic/claude-opus-5","messages":[{"role":"user","content":"ping"}]}'
  ```

  ```python OpenAI SDK theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  from openai import OpenAI

  client = OpenAI(
      base_url=os.environ["LANGSMITH_GATEWAY_BASE_URL"],
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  response = client.chat.completions.create(
      model="anthropic/claude-opus-5",
      messages=[{"role": "user", "content": "ping"}],
  )
  print(response.choices[0].message.content)
  ```

  ```typescript OpenAI SDK (TypeScript) theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";

  const client = new OpenAI({
    baseURL: process.env.LANGSMITH_GATEWAY_BASE_URL,
    apiKey: process.env.LANGSMITH_API_KEY,
  });
  const response = await client.chat.completions.create({
    model: "anthropic/claude-opus-5",
    messages: [{ role: "user", content: "ping" }],
  });
  console.log(response.choices[0].message.content);
  ```

  ```python LangChain theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  from langchain.agents import create_agent
  from langchain.chat_models import init_chat_model

  model = init_chat_model(
      model="anthropic/claude-opus-5",
      model_provider="openai",
      base_url=os.environ["LANGSMITH_GATEWAY_BASE_URL"],
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  agent = create_agent(model=model, system_prompt="You are a helpful assistant.")
  result = agent.invoke({"messages": [{"role": "user", "content": "ping"}]})
  print(result["messages"][-1].content)
  ```
</CodeGroup>

包含聊天完成的 `200` 响应确认网关、您的 API 密钥、角色权限和所选模型路由正在运行。

## 3. 查看您的踪迹打开 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-llm-gateway-quickstart) 并导航到与您的 API 密钥关联的工作区中名为 `gateway` 或 `gateway-<short_api_key>-<api_key_id>` 的跟踪项目。您应该会看到刚刚拨打的电话的新跟踪。

<Note>
  如果您的应用程序还发出自己的 LangSmith 跟踪（例如通过 [LangChain or LangGraph tracing](/langsmith/observability)），则网关端跟踪和您的应用程序跟踪将显示为单独的运行。尚不支持将网关跟踪链接到父应用程序运行。
</Note>

## 4. 设置支出政策（可选）

转到LangSmith中的**设置→网关→LLM网关**以创建支出政策。例如，您可以为 API 密钥设置每日 10 美元的上限。当达到上限时，网关将返回 `402` 响应，其中包含消息：`"Request blocked by gateway policies: R&D Spend Cap"`。

有关政策维度、时间窗口和冲突解决的完整指南，请参阅[Spend policies](/langsmith/llm-gateway-spend-policies)。

## 网关如何处理请求

网关对每个标准端点请求执行以下步骤：1. **使用 LangSmith API 密钥对请求进行身份验证**。
2. **从模型 ID 中选择**托管模型或配置的自带密钥提供商。
3. **解析**上游凭证。托管模型使用网关积分，而自带密钥模型则使用工作区提供商秘密。
4. **评估**主动策略，包括支出限制、PII 编辑和秘密编辑。
5. 当所选提供商使用不同的 API 格式时，**翻译**请求和响应。
6. **跟踪**对LangSmith的调用，包括代币计数、成本和策略事件。

## 后续步骤

* [Set up coding agents](/langsmith/llm-gateway-coding-agents)：通过网关路由 Claude Code、Codex、Gemini CLI 或 Deep Agents Code。
* [API formats](/langsmith/llm-gateway-api-formats)：通过标准端点使用聊天完成、消息或响应。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：使用提供者本机请求和响应格式。
* [Spend policies](/langsmith/llm-gateway-spend-policies)：配置整个组织的成本限制。
* [Data protection](/langsmith/llm-gateway-data-protection)：防止敏感数据到达提供商。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>