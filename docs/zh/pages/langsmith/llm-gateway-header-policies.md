<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Per-customer policies | https://docs.langchain.com/langsmith/llm-gateway-header-policies -->

# 每个客户的政策

通过自定义请求标头拆分网关支出上限和速率限制，以便每个最终客户在单个 API 密钥下获得自己的限制。

<Note>
  **测试版：** LLM Gateway 位于 [beta](/langsmith/release-stages)。
</Note>

[spend policy](/langsmith/llm-gateway-spend-policies) 或 [rate limit policy](/langsmith/llm-gateway-rate-limit-policies) 可以在自定义请求标头上携带条件，因此来自单个主题的流量按标头值分成单独的限制。使用它来限制您自己的每个最终客户、租户或团队，而无需为每个人单独发布 [LangSmith API key](/langsmith/create-account-api-key)。

例如，范围为 [workspace](/langsmith/administration-overview#workspaces) 且条件为 `X-Gateway-Customer-Id: acme` 的策略仅限制来自该工作区且携带该标头值的请求。来自同一工作区且携带 `X-Gateway-Customer-Id: globex` 的请求将根据不同的策略进行计数。

## 可匹配的标头

网关匹配前缀为 `X-Gateway-` 的请求标头以及`X-Gateway-Metadata` JSON 标头内的键。没有其他请求标头可匹配。标头名称在匹配之前进行规范化：删除 `X-Gateway-` 前缀，其余部分小写，`a-z`、`0-9` 和 `_` 之外的每个字符都替换为 `_`。标头 `X-Gateway-Customer-Id`、`x-gateway-customer_id` 和 `X-Gateway-CUSTOMER.ID` 均解析为匹配器键 `customer_id`。标头值作为精确的、区分大小写的字符串进行比较，没有通配符或模式匹配。

网关本身标记呼叫者身份并忽略客户端尝试覆盖它。解析为 `organization_id`、`workspace_id`、`workspace_handle`、`user_id`、`user_email`、`api_key_id`、`api_key_short`、`auth_mode`、`user_agent`、`applied_policy_ids` 的标头，或`applied_policy_names` 以及任何规范化名称以 `gateway` 开头的标头都将被丢弃。

## 标头条件规则* **每个策略一个条件**：策略接受具有单个值的单个标头键。
* **与一个主题范围配对**：将标头条件与组织、工作区、用户或 API 密钥范围相结合。主题方接受多个值并匹配其中的任何一个。标头一侧仅接受一个值。
* **仅限支出上限和速率限制**：默认策略无法携带标头条件，因此网关绝不会自行创建每个标头策略。要限制多个标头值，请为每个标头值创建一个策略。
* **A Missing header matches Nothing**：不携带该标头的请求与策略不匹配。将每个标头策略与主题本身的更广泛策略配对，因此未标记的流量仍然受到限制。
* **强制执行每个匹配策略**：同时匹配普通主题策略和具有标头条件的策略的请求对两者都计数，并且任何一个都可以阻止它。
* **最多 10 个条件**：一份保单包含的主题条件总数不超过 10 个。

## 添加标题条件

<Warning>
  创建和管理策略需要`organization:manage`权限。有关完整权限细分，请参阅[Traces, Engine, and access control](/langsmith/llm-gateway-access)。
</Warning>1. 转到**设置 → 网关 → LLM 网关**。
2. 单击**创建策略**。
3. 选择策略类型和主题范围，然后设置限制。
4. 在 **自定义标头条件（可选）** 下，输入不带 `X-Gateway-` 前缀的 **标头名称**（例如，`Customer-Id`）和要匹配的 **标头值**（例如，`acme`）。
5. 保存。

创建策略后，您无法在 UI 中编辑标头条件。要更改它，请删除策略并创建新策略，或通过 API 更新 `subject_matchers`。

## 每个最终客户的支出上限

经销商或多租户应用程序通常从其自己的后端调用网关，代表许多最终客户使用一个工作区范围的 API 密钥。标头条件为每个最终客户提供了该单一密钥下的单独上限。

<Warning>
  网关信任传入请求中的 `X-Gateway-*` 标头。对最终用户进行身份验证后，在您自己的后端设置标头，并且不要将网关 API 密钥分发给最终用户。控制密钥和标头的调用者可以选择花费的上限。
</Warning>

### 步骤 1. 在每次通话时发送客户标头

将标头附加到后端代表最终客户发出的每个请求：<CodeGroup>
  ```bash curl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl https://gateway.smith.langchain.com/openai/v1/chat/completions \
      -H "Authorization: Bearer $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -H "X-Gateway-Customer-Id: acme" \
      -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ping"}]}'
  ```

  ```python OpenAI SDK theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import os

  from openai import OpenAI

  client = OpenAI(
      base_url=os.environ["OPENAI_BASE_URL"],
      api_key=os.environ["LANGSMITH_API_KEY"],
  )
  customer_id = "acme"
  response = client.chat.completions.create(
      model="gpt-4o-mini",
      messages=[{"role": "user", "content": "ping"}],
      extra_headers={"X-Gateway-Customer-Id": customer_id},
  )
  print(response.choices[0].message.content)
  ```
</CodeGroup>

<Note>
  如果您的 LangSmith 帐户位于区域实例上，请使用相应的 [regional gateway](/langsmith/llm-gateway-api-formats#use-a-regional-gateway)。
</Note>

### 步骤 2. 为一位客户创建上限

通过 [LangSmith REST API](/langsmith/smith-api-ref) 为每个最终客户创建一项支出政策：

<CodeGroup>
  ```bash curl theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  curl -X POST "https://api.smith.langchain.com/v1/platform/gateway-policies" \
      -H "X-Api-Key: $LANGSMITH_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
            "name": "customer-acme-monthly-cap",
            "policy_type": "spend_cap",
            "action": "block",
            "subject_matchers": [
              {"key": "workspace_id", "value": "0b1c2d3e-4f56-7890-abcd-ef1234567890"},
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
              {"key": "workspace_id", "value": "0b1c2d3e-4f56-7890-abcd-ef1234567890"},
              {"key": "customer_id", "value": "acme"},
          ],
          "config": {"window": "monthly", "limit_usd": 250},
      },
      timeout=30.0,
  )
  response.raise_for_status()
  ```
</CodeGroup>

匹配器键是规范化名称`customer_id`，而不是标头名称`X-Gateway-Customer-Id`。该策略属于拥有 API 密钥的组织。

发布 `subject_matchers` 已存在的策略会更新该策略，而不是添加重复项，因此可以安全地重复此调用。

### 步骤 3. 将政策与您的客户列表同步

由于每个最终客户都需要自己的策略，因此请使策略设置与您的客户列表保持一致。以下脚本为每个当前客户创建或更新上限，然后删除已消失客户的上限：

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
    """Return the current per-customer spend caps, keyed by customer identifier."""
    response = client.get(API_URL, params={"policy_type": "spend_cap"})
    response.raise_for_status()
    return {
        matcher["value"]: policy
        for policy in response.json()
        for matcher in policy["subject_matchers"]
        if matcher["key"] == "customer_id"
    }


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

        # Deletes any per-customer cap missing from CUSTOMER_CAPS, including
        # caps created outside this script.
        for customer, policy in existing.items():
            if customer not in CUSTOMER_CAPS:
                client.delete(f"{API_URL}/{policy['id']}").raise_for_status()


if __name__ == "__main__":
    sync()
```

每当客户注册、流失或转向不同的计划时运行该脚本。

### 步骤 4. 读取每个客户的支出API 返回的每个支出策略都会报告 `current_spend_usd`，即策略的活动窗口中累积的支出。用它来向每个最终客户展示他们的使用情况，或者在他们达到上限之前警告他们。当支出查找失败时，该字段将被省略，因此将缺失值视为未知而不是零。

仅当该键与值配对时，列表端点才会通过主题匹配器键缩小范围，因此请列出支出上限并在您自己的代码中选择每个客户的支出上限：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import os

import httpx

response = httpx.get(
    "https://api.smith.langchain.com/v1/platform/gateway-policies",
    headers={"X-Api-Key": os.environ["LANGSMITH_API_KEY"]},
    params={"policy_type": "spend_cap"},
    timeout=30.0,
)
response.raise_for_status()

for policy in response.json():
    customer = next(
        (m["value"] for m in policy["subject_matchers"] if m["key"] == "customer_id"),
        None,
    )
    if customer is None:
        continue  # A cap on the workspace itself, not on one end customer.
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
            {"key": "workspace_id", "value": "0b1c2d3e-4f56-7890-abcd-ef1234567890"},
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

[step 3](#step-3-sync-policies-with-your-customer-list) 中的同步脚本适用于具有相同两个替换的速率限制。支出上限和费率限制是不同的系列，因此最终客户可以在同一标头值上分别持有其中一项。

## 后续步骤

* [Spend policies](/langsmith/llm-gateway-spend-policies)：为组织、工作区、用户和 API 密钥设置成本上限。
* [Rate limit policies](/langsmith/llm-gateway-rate-limit-policies)：在滚动窗口中限制请求和令牌。
* [Traces and access control](/langsmith/llm-gateway-access)：了解网关追踪到哪里以及谁可以配置策略。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-header-policies.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>