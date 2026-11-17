<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Forward audit logs to a SIEM | https://docs.langchain.com/langsmith/audit-logs-siem -->

# 将审核日志转发到 SIEM

按计划提取 LangSmith 审核日志事件并将其发送到 SIEM，并提供 Splunk 的工作示例。

> [!注意]
>
> 审核日志可在 [**Enterprise** plans](/langsmith/pricing-plans) 上找到。

组织管理员和组织操作员可以将 LangSmith [audit logs](/langsmith/audit-logs) 转发到安全信息和事件管理 (SIEM) 系统。预定脚本从 [audit logs API](/langsmith/audit-logs#query-audit-logs-via-api) 提取事件并将其发布到 SIEM 的摄取端点。然后，您的安全团队可以在其他系统的日志旁边搜索 LangSmith 活动，例如代理访问令牌请求。

本页面以Splunk为例。相同的方法适用于任何通过 HTTP 接受 JSON 事件的 SIEM。

## 先决条件

来认识一下[audit logs prerequisites](/langsmith/audit-logs#prerequisites)。在 [self-hosted](/langsmith/self-hosted) 实例上，首先是 [enable audit logs](/langsmith/audit-logs#enable-audit-logs-for-self-hosted-deployments)。您还需要：

* 具有组织管理员或组织操作员角色的[personal access token or service key](/langsmith/create-account-api-key)。
* 您的组织 ID。
* SIEM 的 HTTP 端点和令牌。
* Python 3.10 或更高版本，用于运行示例脚本。

## 按计划安排事件

LangSmith 不会将审核日志推送到其他系统。相反，您按计划运行的脚本会拉取每个新的事件窗口。事件遵循 [OCSF API Activity](https://schema.ocsf.io/1.7.0/classes/api_activity) 模式，完整的 LangSmith 记录位于 `unmapped.original_audit_log` 下。

当你编写脚本时：* **滞后窗口**：LangSmith批量写入审核事件，因此事件可以在请求后大约一分钟出现。每个窗口在当前时间前 2 分钟结束。
* **保持窗口背对背**：对计划和窗口使用相同的长度。例如，在 5 分钟窗口内每 5 分钟运行一次。
* **跟随光标**：每个响应最多返回 100 个事件。传递返回的`cursor`以获取下一页，直到响应没有光标。
* **在`metadata.uid`**上进行重复数据删除：`start_time`和`end_time`都包含在内，因此窗口边界上的事件可以出现在两个窗口中。 `metadata.uid` 每个活动都是独一无二的。
* **重试失败的窗口**：失败的运行会跳过其窗口。具有死信队列的调度程序（例如[AWS Lambda with EventBridge Scheduler](https://docs.aws.amazon.com/lambda/latest/dg/with-eventbridge-scheduler.html)）会记录要重试的窗口。

[Splunk example](#forward-events-to-splunk) 遵循除重试之外的所有这些操作。它使用 `dedup metadata.uid` 删除每次搜索中的重复项。要将事件发送到另一个 SIEM，请替换其 `send_to_splunk` 函数。

## 查找代理访问令牌请求

代理访问令牌是一种短期令牌，用于向其他服务标识已部署的代理。每次LangSmith发出一个，它都会通过操作`mint_agent_access_token`记录一个事件：* 该活动属于代理的组织和工作空间。这包括 [Fleet](/langsmith/fleet/index) 代理，其代币 LangSmith 代表您请求。
* 失败的请求不会记录事件。
* 令牌本身永远不会被记录。

代币的详细信息位于`unmapped.original_audit_log.enrichments.agent_access_token`下。每个字段都使用令牌中匹配声明的名称。要将事件与令牌匹配，请使用其 `jti` 或 `sub`。

|领域 |描述 |
| - | - |
| `sub` |令牌的主题，格式为`ws:<workspace_id>:agent:<agent_uuid>:env:<environment>`。 |
| `ls_agent_id` |代理人的身份证。 |
| `ls_agent_uuid` |代理的 UUID。 |
| `ls_env` |代理环境，例如`PRODUCTION`。 |
| `ls_deployment_id` |请求令牌的部署。 |
| `ls_proof` |部署如何证明其身份：`deployment_key`、`pod_token`或`sandbox_callback`。 |
| `ls_user_id` |代理所代表的用户。仅当运行对用户起作用时才存在。 |
| `ls_trigger` |是什么启动了运行，例如 cron 作业，如 `kind` 和 `id`。仅适用于触发运行。 |
| `aud` |受众：令牌所针对的服务。 |
| `jti` |令牌的唯一 ID。 |
| `exp` |当令牌过期时，采用 RFC 3339 格式。 |

事件的参与者取决于部署如何证明其身份，如`ls_proof`所示：* **`deployment_key`**: `actor.user.credential_uid` 是密钥的 ID。
* **`sandbox_callback`**：沙箱为用户请求令牌，`unmapped.original_audit_log.ls_user_id` 就是该用户。
* **`pod_token`**：两个字段均为空。这适用于您自己使用 pod 令牌的部署以及为您运行的代理 LangSmith，例如舰队代理。

`resources` 列出代理的 UUID 和部署 ID。要通过 [API](/langsmith/smith-api/audit-logs/get-audit-logs) 查找某个代理的令牌，请将代理的 UUID 作为 `resource_ids` 传递。

AWS、Azure 和 Google Cloud 的令牌也会记录事件。要将其与云提供商的日志进行匹配，请使用 `sub`、`aud` 和时间。

## 将事件转发到 Splunk

此示例将事件发送到 Splunk [HTTP Event Collector](https://help.splunk.com/en/splunk-enterprise/get-started/get-data-in/10.6/get-data-with-http-event-collector/set-up-and-use-http-event-collector-in-splunk-web) (HEC)，然后在它们中搜索代理访问令牌请求。

### 创建 HEC 代币

按照 Splunk 的 [setting up HEC in Splunk Web](https://help.splunk.com/en/splunk-enterprise/get-started/get-data-in/10.6/get-data-with-http-event-collector/set-up-and-use-http-event-collector-in-splunk-web) 指南在 Splunk 中创建 HEC 令牌。为令牌指定一个可识别的名称，例如 `langsmith-audit-logs`，并记下它写入的索引。此页面上的搜索使用`main`。复制转发器的令牌值。

在 Splunk Enterprise 上，事件端点为 `https://<splunk-host>:8088/services/collector/event`，其中 `8088` 是默认 HEC 端口。

### 运行转发器

将以下脚本保存为`splunk_forwarder.py`。每次运行都会读取一个事件窗口，并通过单个请求将它们发布到 HEC。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
"""Forward LangSmith audit log events to the Splunk HTTP Event Collector."""
import argparse
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

LANGSMITH_URL = os.environ.get("LANGSMITH_API_URL", "https://api.smith.langchain.com")
LANGSMITH_HEADERS = {
    "X-API-Key": os.environ["LANGSMITH_API_KEY"],
    "X-Organization-Id": os.environ["LANGSMITH_ORG_ID"],
}
HEC_URL = os.environ["SPLUNK_HEC_URL"]
HEC_HEADERS = {"Authorization": "Splunk " + os.environ["SPLUNK_HEC_TOKEN"]}


def audit_events(start, end):
    cursor = None
    while True:
        query = {"start_time": start.isoformat(), "end_time": end.isoformat(), "limit": 100}
        if cursor:
            query["cursor"] = cursor
        url = f"{LANGSMITH_URL}/api/v1/audit-logs?{urllib.parse.urlencode(query)}"
        page = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=LANGSMITH_HEADERS)))
        yield from page["items"]
        cursor = page.get("cursor")
        if not cursor or not page["items"]:
            return


def send_to_splunk(events):
    body = "".join(
        json.dumps({"time": event["time"], "source": "langsmith:audit_logs", "sourcetype": "_json", "event": event})
        for event in events
    )
    urllib.request.urlopen(urllib.request.Request(HEC_URL, data=body.encode(), headers=HEC_HEADERS))


parser = argparse.ArgumentParser()
parser.add_argument("--minutes", type=int, default=5)
args = parser.parse_args()

# Events can take about a minute to appear, so read a window that ended 2 minutes ago.
end = datetime.now(timezone.utc).replace(second=0, microsecond=0) - timedelta(minutes=2)
start = end - timedelta(minutes=args.minutes)
events = list(audit_events(start, end))
if events:
    send_to_splunk(events)
print(f"sent {len(events)} events from {start:%H:%M} to {end:%H:%M} UTC")
```设置四个环境变量，然后运行脚本：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<api-key>
export LANGSMITH_ORG_ID=<organization-id>
export SPLUNK_HEC_URL=https://<splunk-host>:8088/services/collector/event
export SPLUNK_HEC_TOKEN=<hec-token>
python3 splunk_forwarder.py --minutes 5
```

`LANGSMITH_API_URL` 默认为 GCP US API URL。对于另一个区域，将其设置为来自 [Regions](/langsmith/cloud#regions) 的该区域的 API URL。在自托管实例上，将其设置为实例的基本 URL，不带 `/api/v1`。

要每 5 分钟运行一次脚本，请添加一个 cron 条目：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
*/5 * * * * python3 /path/to/splunk_forwarder.py --minutes 5
```

Cron 不会加载您的 shell 配置文件，因此请在 crontab 或包装脚本中设置环境变量。

### 搜索代理访问令牌请求

每次搜索都从删除重复事件并将令牌的长字段路径缩短为 `token.*` 开始：

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
index=main source="langsmith:audit_logs" api.operation=mint_agent_access_token
| dedup metadata.uid
| rename unmapped.original_audit_log.enrichments.agent_access_token.* as token.*
```

然后添加其中之一：

|寻找|添加|
| - | - |
|一个代理的每个代币 | `\| search token.ls_agent_id="<agent-id>" \| table _time token.ls_env token.ls_proof token.aud token.jti` |
|按环境和证据划分的令牌请求 | `\| stats count by token.ls_env token.ls_proof` |
|一枚代币| `\| search token.jti="<jti>"` |
|代理为一名用户请求的令牌 | `\| search token.ls_user_id="<user-id>"` |
|云提供商令牌 | `\| search token.aud IN ("sts.amazonaws.com/langsmith-agents", "api://AzureADTokenExchange/langsmith-agents", "https://iam.googleapis.com/langsmith-agents") \| table _time token.sub token.aud token.exp` |

## 另请参阅

* [Audit logs](/langsmith/audit-logs)
* [OCSF API Activity class](https://schema.ocsf.io/1.7.0/classes/api_activity)
* [Set up and use HTTP Event Collector in Splunk Web](https://help.splunk.com/en/splunk-enterprise/get-started/get-data-in/10.6/get-data-with-http-event-collector/set-up-and-use-http-event-collector-in-splunk-web)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/audit-logs-siem.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。