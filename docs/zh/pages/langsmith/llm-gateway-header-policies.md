<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Header-based policies | https://docs.langchain.com/langsmith/llm-gateway-header-policies -->

# 基于标头的策略

通过单个 API 密钥下的自定义请求标头（例如客户、租户或团队标识符）确定范围网关支出上限、速率限制和模型访问。

> [!注意]
>
> LLM 网关位于[beta](/langsmith/release-stages)。

基于标头的策略通过应用程序发送的请求标头（例如最终客户、租户、团队或环境标识符）来确定网关策略的范围。使用 1 为每个标头值在单个 [LangSmith API key](/langsmith/create-account-api-key) 下赋予其自己的限制，而无需为每个值发布单独的密钥。

策略通过以下两种方式之一使用标头：

* **默认由标头分隔**：默认的 [spend](/langsmith/llm-gateway-spend-policies) 或 [rate limit](/langsmith/llm-gateway-rate-limit-policies) 策略将其限制独立应用于每个标头值。例如，由 `X-Gateway-Customer-Id` 分隔的默认工作空间支出限制在每个 [workspace](/langsmith/administration-overview#workspaces) 内给出 `acme` 和 `globex` 独立限制。
* **显式标头条件**：支出、速率限制或 [model access](/langsmith/llm-gateway-model-access-policies) 策略与一个确切的标头值匹配。例如，条件为`X-Gateway-Customer-Id: acme`的策略仅限制携带该值的请求。

> [!警告]
>
> 创建和管理策略需要`organization:gateway:manage` 权限。组织管理员和组织操作员默认拥有它。有关每个组织角色可以执行的操作，请参阅[Organization roles](/langsmith/rbac#organization-roles)。## 可匹配的标头

网关匹配以 `X-Gateway-` 为前缀的请求标头以及`X-Gateway-Metadata` JSON 标头内的键。没有其他请求标头可匹配。

标头名称在匹配之前进行规范化：

* 删除 `X-Gateway-` 前缀，其余部分小写，`a-z`、`0-9` 和 `_` 之外的每个字符都替换为 `_`。
* 标头 `X-Gateway-Customer-Id`、`x-gateway-customer_id` 和 `X-Gateway-CUSTOMER.ID` 均解析为匹配器键 `customer_id`。
* 标头值作为精确、区分大小写的字符串进行比较，没有通配符或模式匹配。

网关本身标记呼叫者身份并忽略客户端尝试覆盖它。它会丢弃解析为以下任一内容的标头和 `X-Gateway-Metadata` 键：

* **来电身份**：`organization_id`、`workspace_id`、`workspace_handle`、`user_id`、`user_email`、`api_key_id`、`api_key_short` 和 `auth_mode`。
* **凭证和客户端**：`credential_source`、`provider_key_hint` 和 `user_agent`。
* **适用政策**：`applied_policy_ids` 和 `applied_policy_names`。
* **代理**：`agent_uuid`、`agent_id`和`agent_environment_id`。
* **网关前缀密钥**：规范化名称以 `gateway` 开头的任何密钥。

将 `ls_metadata_only` 或 `content_quota_exceeded` 设置为标头或 `X-Gateway-Metadata` 密钥的请求将被拒绝并显示 `400` 错误，因为网关自行设置这些密钥。> [!警告]
>
> 网关信任传入请求中的 `X-Gateway-*` 标头。对最终用户进行身份验证后，在您自己的后端设置标头，并且不要将网关 API 密钥分发给最终用户。控制密钥和标头的调用者可以选择要使用的限制。

## 通过标头分隔默认限制

默认支出或费率限制对主题维度的每个成员（例如每个工作区或每个 API 密钥）应用相同的限制。通过标头将其分隔，该限制独立地应用于每个主题和标头值对，而不需要为每个值制定策略。

单独的默认值遵循以下规则：* **每个默认一个标头**：仅输入标头名称。该请求提供标识存储桶的值。
* **独立限制**：每个主题和标头值对都会收到配置的限制。网关在请求第一次携带新标头值时创建每个限制。
* **回退限制**：没有配置标头的请求共享其主题的回退限制。
* **每个主题类型一个默认值**：创建默认值会替换相同主题类型的相同策略类型的现有默认值，即使两个默认值使用不同的标头也是如此。

UI 仅针对默认支出限制提供标头分隔。要按标题分隔默认支出限额：1. 转至 **LLM Gateway** 并选择 **成本控制**。
2. 单击**创建支出限额**。
3. 选择**工作空间**、**用户**或**API 密钥**
4. 选中将限制应用于该类型的每个主题的复选框。
5. 选择**通过自定义标头单独限制**。仅当您默认应用限制后，此复选框才会出现。
6. 在**标头名称**中，输入`X-Gateway-`之后的标头名称部分，表单将其显示在字段前面。例如，为 `X-Gateway-Customer-Id` 请求标头输入 `Customer-Id`。
7. 设置支出限额，然后单击“**创建支出限额**”。

策略表显示策略范围下的标题，例如“由 X-Gateway-Customer-Id 分隔的限制”。您还可以编辑现有的默认支出限额以添加、更改或删除标题。

要按标头分隔默认速率限制，请通过 [LangSmith REST API](/langsmith/smith-api-ref) 创建`default_rate_limit` 策略。 **速率限制** 表不显示具有默认速率限制的标头。在通过 API 创建默认值之前，请使用 `policy_type=default_spend_cap` 或 `policy_type=default_rate_limit` 列出现有默认值，这样您就不会替换其他人配置的默认值。

当不同的标头值需要不同的限制时，请使用显式策略。## 添加显式标头条件

明确的支出、速率限制或模型访问策略可以匹配一个精确的标头值。使用显式策略为不同的标头值分配不同的限制。

显式标头条件遵循以下规则：

* **每个策略一个条件**：策略接受一个标头名称和一个值。
* **一个主题范围**：将条件与组织、工作区、用户或 API 密钥范围相结合。主题方接受多个值并匹配其中的任何一个。
* **缺少标头不匹配**：没有配置标头的请求与策略不匹配。
* **强制执行每个匹配策略**：同时匹配普通主题策略和具有标头条件的策略的请求对两者都计数，并且任何一个都可以阻止它。
* **最多 10 个条件**：一份保单包含的主题条件总数不超过 10 个。

UI 提供了有关支出限制和速率限制的明确标头条件，但不提供默认标头条件。添加一个：1. 转至 **LLM Gateway**，然后选择 **Cost Controls** 作为支出限制，或选择 **Rate Limiting** 作为速率限制。
2. 单击**创建支出限制**或**创建费率限制**。
3. 选择主题范围并设置限制。清除 **默认情况下应用于每个...** 复选框，因为选择它会隐藏标题条件。
4. 在 **自定义标头条件（可选）** 下，输入不带 `X-Gateway-` 前缀的 **标头名称**（例如，`Customer-Id`）和要匹配的 **标头值**（例如，`acme`）。填写两个字段或都不填写：创建按钮保持禁用状态，而只有一个字段具有值。
5. 单击**创建支出限制**或**创建费率限制**。

策略表显示主题旁边的标头值，例如 `my-key, acme`，但不显示标头名称。

创建策略后，您无法在 UI 中编辑标头条件。要更改它，请删除策略并创建新策略，或通过 API 更新 `subject_matchers`。模型访问策略仅通过 API 接受标头条件。该条件缩小了策略范围，但不更改其层：模型访问策略的范围仅限于工作区，标头与其他工作区策略一起排名，因此匹配的请求必须满足所有这些策略。有关层如何相互覆盖的信息，请参阅[Policy overrides](/langsmith/llm-gateway-model-access-policies#policy-overrides)。 **模型访问**表显示工作区名称旁边的标题值。编辑表单不显示标题条件，但在 UI 中编辑策略会保留它。

## 每个最终客户的支出上限

经销商或多租户应用程序通常从其自己的后端调用网关，并代表许多最终客户使用一个工作区范围的 API 密钥。当每个客户需要不同的上限时，请使用显式标头条件。如果每个顾客都使用相同的盖子，则改为[separate one default spend limit by header](#separate-a-default-limit-by-header)。

### 步骤 1. 在每次通话时发送客户标头

将标头附加到后端代表最终客户发出的每个请求。将 `<MODEL_ID>` 替换为 [model ID](/langsmith/llm-gateway-api-formats#choose-a-model-id)：

```bash curl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl https://gateway.smith.langchain.com/v1/chat/completions \
    -H "Authorization: Bearer $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -H "X-Gateway-Customer-Id: acme" \
    -d '{"model":"<MODEL_ID>","messages":[{"role":"user","content":"ping"}]}'
```

```python OpenAI SDK theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

from openai import OpenAI

client = OpenAI(
    base_url="https://gateway.smith.langchain.com/v1",
    api_key=os.environ["LANGSMITH_API_KEY"],
)
customer_id = "acme"
response = client.chat.completions.create(
    model="<MODEL_ID>",
    messages=[{"role": "user", "content": "ping"}],
    extra_headers={"X-Gateway-Customer-Id": customer_id},
)
print(response.choices[0].message.content)
```

> [!注意]
>
> 如果您的LangSmith账户位于区域实例上，请使用相应的[regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway)。

### 步骤 2. 为一位客户创建上限通过[LangSmith REST API](/langsmith/smith-api-ref)为每个最终客户创建一项支出政策。将 `<WORKSPACE_ID>` 替换为拥有后端使用的 API 密钥的工作区的 ID：

```bash curl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "https://api.smith.langchain.com/v1/platform/gateway-policies" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
          "name": "customer-acme-monthly-cap",
          "policy_type": "spend_cap",
          "action": "block",
          "subject_matchers": [
            {"key": "workspace_id", "value": "<WORKSPACE_ID>"},
            {"key": "customer_id", "value": "acme"}
          ],
          "config": {"window": "monthly", "limit_usd": 250}
        }'
```

```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

import httpx

response = httpx.post(
    "https://api.smith.langchain.com/v1/platform/gateway-policies",
    headers={"X-Api-Key": os.environ["LANGSMITH_API_KEY"]},
    json={
        "name": "customer-acme-monthly-cap",
        "policy_type": "spend_cap",
        "action": "block",
        "subject_matchers": [
            {"key": "workspace_id", "value": "<WORKSPACE_ID>"},
            {"key": "customer_id", "value": "acme"},
        ],
        "config": {"window": "monthly", "limit_usd": 250},
    },
    timeout=30.0,
)
response.raise_for_status()
```

匹配器键是规范化名称`customer_id`，而不是标头名称`X-Gateway-Customer-Id`。该策略属于拥有 API 密钥的组织。

发布 `subject_matchers` 已存在的策略会更新该策略，而不是添加重复项，因此可以安全地重复此调用。

如果默认工作区支出限制为 [separated by the same header](#separate-a-default-limit-by-header)，则显式上限将替换此工作区中该客户的默认上限。当默认值已经为客户创建了限制时，过帐上限会将该限制转换为显式限制。删除显式上限将使客户恢复到默认限制。另一种主题类型的默认设置（例如由同一标头分隔的默认 API 密钥限制）仍然会为客户强制执行其自己的限制以及显式上限。

### 步骤 3. 将政策与您的客户列表同步由于每个最终客户都需要自己的策略，因此请使策略设置与您的客户列表保持一致。以下脚本管理一个工作区中的上限。它为每个当前客户创建或更新上限，然后删除已消失客户的上限：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

import httpx

API_URL = "https://api.smith.langchain.com/v1/platform/gateway-policies"
WORKSPACE_ID = os.environ["LANGSMITH_WORKSPACE_ID"]

# Your source of truth: end customer identifier mapped to a monthly cap in USD.
CUSTOMER_CAPS = {"acme": 250.0, "globex": 1000.0, "initech": 50.0}


def matchers_for(customer: str) -> list[dict[str, str]]:
    return [
        {"key": "workspace_id", "value": WORKSPACE_ID},
        {"key": "customer_id", "value": customer},
    ]


def existing_caps(client: httpx.Client) -> dict[str, dict]:
    """Return this workspace's explicit per-customer spend caps, keyed by customer."""
    response = client.get(
        API_URL,
        params={
            "policy_type": "spend_cap",
            "subject_matcher_key": "workspace_id",
            "subject_matcher_value": WORKSPACE_ID,
        },
    )
    response.raise_for_status()
    caps = {}
    for policy in response.json():
        if policy.get("parent_policy_id"):
            continue  # Created by a default spend limit, not by this script.
        matchers = policy["subject_matchers"]
        customer = next((m["value"] for m in matchers if m["key"] == "customer_id"), None)
        if customer is None or len(matchers) != 2:
            continue  # Not a workspace and customer cap.
        caps[customer] = policy
    return caps


def sync() -> None:
    headers = {"X-Api-Key": os.environ["LANGSMITH_API_KEY"]}
    with httpx.Client(headers=headers, timeout=30.0) as client:
        existing = existing_caps(client)

        # Posting an existing matcher set updates that policy, so this both
        # creates caps for new customers and corrects caps that changed.
        for customer, limit_usd in CUSTOMER_CAPS.items():
            client.post(
                API_URL,
                json={
                    "name": f"customer-{customer}-monthly-cap",
                    "policy_type": "spend_cap",
                    "action": "block",
                    "subject_matchers": matchers_for(customer),
                    "config": {"window": "monthly", "limit_usd": limit_usd},
                },
            ).raise_for_status()

        # Deletes this workspace's caps for customers missing from
        # CUSTOMER_CAPS, including caps created outside this script.
        for customer, policy in existing.items():
            if customer not in CUSTOMER_CAPS:
                client.delete(f"{API_URL}/{policy['id']}").raise_for_status()


if __name__ == "__main__":
    sync()
```

列表端点返回组织中的每个策略，因此脚本仅询问匹配器包含此工作区的策略。它还会跳过任何带有 `parent_policy_id` 的策略：当默认支出限制由相同标头分隔时，网关会为每个标头值创建一个限制，并且这些限制也带有 `customer_id` 匹配器。如果没有跳过，脚本会将它们视为自己的大写字母并将其删除。

每当客户注册、流失或转向不同的计划时运行该脚本。使用未更改的客户列表重新运行它是安全的。

### 步骤 4. 读取每个客户的支出

API 返回的每个支出策略都会报告 `current_spend_usd`，即策略的活动窗口中累积的支出。用它来向每个最终客户展示他们的使用情况，或者在他们达到上限之前警告他们。当支出查找失败时，该字段将被省略，因此将缺失值视为未知而不是零。如步骤 3 所示，使用 `subject_matcher_key` 和 `subject_matcher_value` 将列表过滤到一个工作区，并跳过默认支出限制创建的限制。否则，由同一标头分隔的默认客户会出现两次，并具有两个不同的限制：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

import httpx

WORKSPACE_ID = os.environ["LANGSMITH_WORKSPACE_ID"]

response = httpx.get(
    "https://api.smith.langchain.com/v1/platform/gateway-policies",
    headers={"X-Api-Key": os.environ["LANGSMITH_API_KEY"]},
    params={
        "policy_type": "spend_cap",
        "subject_matcher_key": "workspace_id",
        "subject_matcher_value": WORKSPACE_ID,
    },
    timeout=30.0,
)
response.raise_for_status()

for policy in response.json():
    if policy.get("parent_policy_id"):
        continue  # Created by a default spend limit, not one of your caps.
    matchers = policy["subject_matchers"]
    customer = next((m["value"] for m in matchers if m["key"] == "customer_id"), None)
    if customer is None or len(matchers) != 2:
        continue  # Not a workspace and customer cap.
    # current_spend_usd is absent when the spend lookup fails.
    print(customer, policy.get("current_spend_usd"), policy["config"]["limit_usd"])
```

## 限制每个最终客户的吞吐量

速率限制使用相同的主题匹配器。交换 `policy_type` 和 `config` 为最终客户提供自己的请求和代币限额：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -X POST "https://api.smith.langchain.com/v1/platform/gateway-policies" \
    -H "X-Api-Key: $LANGSMITH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
          "name": "customer-acme-rate-limit",
          "policy_type": "rate_limit",
          "action": "block",
          "subject_matchers": [
            {"key": "workspace_id", "value": "<WORKSPACE_ID>"},
            {"key": "customer_id", "value": "acme"}
          ],
          "config": {
            "version": 1,
            "limits": [
              {"metric": "requests", "window": "minute", "value": 100},
              {"metric": "tokens", "window": "hour", "value": 1000000}
            ]
          }
        }'
```

要使速率限制与您的客户列表保持一致，请调整 [step 3 sync script](#step-3-sync-policies-with-your-customer-list)：将每个客户映射到限制列表而不是一个 `limit_usd`，从该列表构建 `config`，在列表和创建呼叫中使用 `rate_limit` 作为 `policy_type`，然后更改策略名称。保留工作区过滤器和 `parent_policy_id` 跳过，因为由标头分隔的默认速率限制也会为每个标头值创建限制。

支出上限和费率限制是不同的系列，因此最终客户可以在同一标头值上分别持有其中一项。

## 另请参阅

* [Spend policies](/langsmith/llm-gateway-spend-policies)：为组织、工作区、用户和 API 密钥设置成本上限。
* [Rate limit policies](/langsmith/llm-gateway-rate-limit-policies)：在滚动窗口中限制请求和令牌。
* [Model access policies](/langsmith/llm-gateway-model-access-policies)：控制每个主体可以调用哪些模型。
* [View LLM Gateway traces](/langsmith/llm-gateway-traces)：了解网关追踪到的地点以及谁可以配置策略。

***[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-header-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。