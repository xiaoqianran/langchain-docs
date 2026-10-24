<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Anthropic applications | https://docs.langchain.com/langsmith/trace-anthropic -->

# 跟踪Anthropic应用程序

从 Claude 平台、通过 OpenTelemetry 的 Claude SDK 或使用 LangSmith SDK 包装器跟踪 LangSmith 中的 Anthropic 应用程序。

您可以从 Anthropic 的服务器或您自己的应用程序将 Anthropic 跟踪发送到 LangSmith：

* **[From the Claude Platform](#trace-from-the-claude-platform)**：Claude 平台直接从 Anthropic 的服务器发送跟踪。您可以在 Claude Console 中对其进行配置，无需更改应用程序代码。
* **[From your application](#trace-from-your-application)**：您的应用程序通过以下两种方式之一发送跟踪：
  * **[Claude SDKs](#use-the-claude-sdks)**：Claude SDK 发出 OpenTelemetry (OTel) 范围，OTel 导出器库将它们发送到 LangSmith。
  * **[LangSmith SDK wrapper](#use-the-langsmith-sdk-wrapper)**：您使用 LangSmith SDK（Python 或 TypeScript）包装 Anthropic 客户端。您可以将其余代码的跟踪与 `@traceable` 跨度合并到单个跟踪中。

> [!注意]
>
> 来自 Claude 平台和 Claude SDK 的跟踪处于公开测试阶段。

## 来自 Claude 平台的追踪Claude 平台导出您的 [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) 会话和 [Messages API](https://platform.claude.com/docs/en/api/messages) 请求的 OTel 跟踪记录。它将它们发送到*目的地*，即您在 Claude 控制台中注册的 OTel 端点。您可以添加 LangSmith 作为目标并查看这些跟踪，而无需更改应用程序代码。有关目的地和交付的详细信息，请参阅Anthropic文档中的[Use OpenTelemetry with the Claude API](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api)。

在开始之前，您需要：

* 您的 Claude Console 组织中的管理员角色或同等权限。如果没有它，您将无法查看或管理目的地。
* LangSmith API 密钥。当您希望跟踪独立于您的用户帐户时，您可以使用 [personal access token](/langsmith/administration-overview#personal-access-tokens-pats) 或 [service key](/langsmith/administration-overview#service-keys)。要创建密钥，请参阅[Create an account and API key](/langsmith/create-account-api-key)。
* 对于自托管 LangSmith，Claude 平台可以访问的端点：端口 443 上的 HTTPS，主机名解析为公共 IP 地址。

### 步骤 1. 添加 LangSmith 作为目的地

添加目的地：1. 在 Claude Console 中，打开您组织的 [OpenTelemetry settings page](https://platform.claude.com/settings/telemetry-destinations)，然后单击 **添加目的地**。
2. 在 **提供商** 下拉列表中，选择 **LangSmith**。表单更改为显示 LangSmith 字段。
3. 填写字段：
   * **名称**：（可选）目的地的标签，例如`LangSmith`。
   * **区域**：您的 LangSmith 部署的区域：**美国**、**欧盟**、**亚太地区**或**美国 AWS 上**。对于自托管 LangSmith，选择 **自托管** 并在 **LangSmith URL** 字段中输入实例的 OTel 端点 URL，例如 `https://<your-langsmith-host>/api/v1/otel`。
   * **API 密钥**：您的 LangSmith API 密钥。
   * **项目**：（可选）要将跟踪发送到的 [tracing project](/langsmith/log-traces-to-project) 的名称。如果将其留空，则跟踪将转到 `default` 项目。
   * **LangSmith 工作区 ID**：（可选）要将跟踪发送到的 LangSmith 工作区的 ID。如果将其留空，跟踪将转到 API 密钥所属的工作区。组织范围的服务密钥需要它。要查找 ID，请参阅[Create an account and API key](/langsmith/create-account-api-key)。
   * **内容模式**：选择**完整内容**以在跨度中包含提示和响应。对于**仅元数据**，跨度会省略输入和输出内容。* **工作空间**：将跟踪发送到此目标的 Claude 工作空间：**全部**、**选定**或**除**之外的所有**。有关每个选项的详细信息，请参阅 Anthropic 文档中的 [Choose workspaces for a destination](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#choose-workspaces-for-a-destination)。
4. 单击“**添加目的地**”。

当您稍后编辑目标时，表单将显示通用 **OTLP 端点 URL** 和 **请求标头** 字段，而不是 LangSmith 字段。 **OTLP 端点 URL** 保存您所在区域的 URL，并且 LangSmith 字段将成为以下请求标头：

* `x-api-key`：**API 密钥**。
* `Langsmith-Project`：**项目**，如果您设置了一个。
* `X-Tenant-Id`：**LangSmith 工作区 ID**（如果您设置了）。

如果您更改 **OTLP 端点 URL** 的主机，请再次输入标头值。

### 步骤 2. 检查跟踪是否到达

要检查设置：

1. 发送消息 API 请求或在使用目标的 Claude 工作区中运行 Claude Managed Agents 会话。
2. 在 Claude Console OpenTelemetry 设置页面上，检查目标的 **Delivery** 列是否显示 **Healthy**。这可能需要大约一分钟的时间。
3. 在 LangSmith 中，打开您在 **Project** 字段中命名的项目，或 `default` 项目。

### 解决交付问题如果 Claude 控制台 [OpenTelemetry settings page](https://platform.claude.com/settings/telemetry-destinations) 上的 **Delivery** 列显示 **Failing**，请将指针悬停在其上方以查看最后一个错误：

* **HTTP 401**：目标不发送 API 密钥。
* **HTTP 403**：API 密钥错误，或者已过期或已删除。对于没有工作区 ID 的组织范围服务密钥，LangSmith 还会返回 403。
* **HTTP 404**：端点 URL 错误。编辑目标并检查 **OTLP 端点 URL** 以 `/otel` 结尾（`/api/v1/otel` 对于自托管 LangSmith）并且不包含 `/v1/traces`。

对于其他错误，请参阅Anthropic文档中的[Delivery errors](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#delivery-errors)。

如果 **Delivery** 列显示 **Disabled**，请将指针悬停在其上方以查看原因。例如，Claude 平台会禁用主机名解析为非公共 IP 地址的目标。请参阅 Anthropic 文档中的 [Delivery and health](https://platform.claude.com/docs/en/manage-claude/opentelemetry/api#delivery-and-health)。

## 从您的应用程序中跟踪

当您的应用程序应发送跟踪时，请使用这些方法之一。要在单个跟踪中跟踪您的 Anthropic 调用以及其余代码，请使用 LangSmith SDK 包装器。

### 使用 Claude SDKClaude SDK 在您的应用程序中针对其发送的每个请求以及工具运行程序运行的每个工具使用发出 OTel 跨度。 OTel 导出器库将跨度发送到LangSmith。有关 SDK 选项和 SDK 发出的范围的详细信息，请参阅 Anthropic 文档中的 [Set up SDK tracing](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk)。

要将 Claude SDK span 发送到 LangSmith：

1. [Install or upgrade the Claude SDK](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk#install-the-sdk) 和 [register a tracer provider](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk#register-a-tracer-provider)。
2. 使用 LangSmith 部署的 OTel 端点 URL 配置 OTel 导出器：

   | LangSmith部署| OTel 端点 URL |
   | - | - |
   |基仕伯美国 | `https://api.smith.langchain.com/otel` |
   | GCP 欧盟 | `https://eu.api.smith.langchain.com/otel` |
   |基仕伯亚太区 | `https://apac.api.smith.langchain.com/otel` |
   | AWS 美国 | `https://aws.api.smith.langchain.com/otel` |
   |自托管 | `https://<your-langsmith-host>/api/v1/otel` |

   设置以下请求标头：

   * `x-api-key`：您的 LangSmith API 密钥。
   * `Langsmith-Project`：（可选）要将跟踪发送到的跟踪项目的名称。如果没有此标头，跟踪将转到 `default` 项目。
   * `X-Tenant-Id`：（可选）要将跟踪发送到的LangSmith工作区的 ID。如果没有此标头，跟踪将转到 API 密钥所属的工作区。组织范围的服务密钥需要它。

   例如，使用标准 OTel 环境变量：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.smith.langchain.com/otel
   export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=<your-langsmith-api-key>,Langsmith-Project=<your-project-name>"
   ```有关导出器设置的更多信息，请参阅[Trace a non-LangChain application](/langsmith/trace-with-opentelemetry#trace-a-non-langchain-application)。
3. （可选）默认情况下，Claude SDK 仅记录元数据。要在跨度中包含提示和响应，请设置内容模式。请参阅 Anthropic 文档中的 [Configure the SDK](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk#configure-the-sdk)。

### 使用LangSmith SDK 包装器

Python ([⟦T23⟧](https://reference.langchain.com/python/langsmith/wrappers/_anthropic/wrap_anthropic)) 和 TypeScript ([⟦T24⟧](https://reference.langchain.com/javascript/langsmith/wrappers/anthropic/wrapAnthropic)) 中的 Anthropic 包装器方法包装您的 Anthropic 客户端以自动记录跟踪。通过包装器，LangSmith以可读格式呈现消息，包括工具调用和多模式内容块。该包装器与 `@traceable` 装饰器 (Python) 或 `traceable` 函数 (TypeScript) 一起工作，因此您可以使用包装器跟踪 Anthropic 调用，并使用装饰器或函数跟踪应用程序的其他部分。> [!注意]
>
> 将 `LANGSMITH_TRACING` 环境变量设置为 `'true'`，以将跟踪记录到 LangSmith，即使您使用 `wrap_anthropic` 或 `wrapAnthropic` 也是如此。这使您可以在不更改代码的情况下打开和关闭跟踪。
>
> 还将 `LANGSMITH_API_KEY` 环境变量设置为您的 API 密钥。要创建密钥，请参阅[Create an account and API key](/langsmith/create-account-api-key)。
>
> 如果您的 LangSmith API 密钥链接到多个工作区，请设置 `LANGSMITH_WORKSPACE_ID` 环境变量以指定要使用的工作区。
>
> 默认情况下，LangSmith 将跟踪记录到名为 `default` 的项目。要将跟踪记录到不同的项目，请参阅[Log traces to a specific project](/langsmith/log-traces-to-project)。

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import anthropic
from langsmith import traceable
from langsmith.wrappers import wrap_anthropic

client = wrap_anthropic(anthropic.Anthropic())

@traceable(run_type="tool", name="Retrieve Context")
def my_tool(question: str) -> str:
  return "During this morning's meeting, we solved all world conflict."

@traceable(name="Chat Pipeline")
def chat_pipeline(question: str):
  context = my_tool(question)
  messages = [
      { "role": "user", "content": f"Question: {question}\nContext: {context}"}
  ]
  message = client.messages.create(
      model="claude-sonnet-5-5",
      messages=messages,
      max_tokens=1024,
      system="You are a helpful assistant. Please respond to the user's request only based on the given context."
  )
  return message

chat_pipeline("Can you summarize this morning's meetings?")
```

```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import Anthropic from "@anthropic-ai/sdk";
import { traceable } from "langsmith/traceable";
import { wrapAnthropic } from "langsmith/wrappers/anthropic";

const client = wrapAnthropic(new Anthropic());

const myTool = traceable(async (question: string) => {
  return "During this morning's meeting, we solved all world conflict.";
}, { name: "Retrieve Context", run_type: "tool" });

const chatPipeline = traceable(async (question: string) => {
  const context = await myTool(question);
  const messages = [
      { role: "user", content: `Question: ${question}\nContext: ${context}` }
  ];
  const message = await client.messages.create({
      model: "claude-sonnet-5-5",
      messages: messages,
      max_tokens: 1024,
      system: "You are a helpful assistant. Please respond to the user's request only based on the given context."
  });
  return message;
}, { name: "Chat Pipeline" });

await chatPipeline("Can you summarize this morning's meetings?");
```

要使用 TypeScript `wrapAnthropic` 包装器跟踪 [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) 会话，请参阅 [Trace Claude Managed Agents](/langsmith/trace-with-claude-managed-agents)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-anthropic.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。