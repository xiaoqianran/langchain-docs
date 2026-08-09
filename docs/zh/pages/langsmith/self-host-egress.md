<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Egress for billing and operational telemetry | https://docs.langchain.com/langsmith/self-host-egress -->

# 用于计费和操作遥测的出口

<Info>
  此页面仅适用于未在离线（气隙）模式下运行的客户，并假设您使用的是服务版本 0.9.0 或更高版本的自托管 LangSmith 实例。
</Info>

自托管 LangSmith 将平台数据存储在您的环境中。除非您在离线模式下运行，否则 LangSmith 需要出口到 `https://beacon.langchain.com` 才能进行以下操作：

* **计费遥测**：许可证验证和订阅/使用报告（必需）
* **操作遥测**：用于支持诊断的日志、指标和跟踪（可选，可以禁用）
* **使用情况遥测**：用于产品洞察的匿名使用情况快照（可选，可以禁用）

<Warning>
  **需要到 `https://beacon.langchain.com` 的出口。** 如果需要，请参阅 [allowlisting IP section](/langsmith/cloud#allowlisting-ip-addresses) 了解静态 IP 地址。
</Warning>

<Note>
  如果您启用 [Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine)，它需要第二个出口目的地，并且引擎内容通过它离开您的环境。参见[LangSmith Intelligence for Engine](#langsmith-intelligence-for-engine)。
</Note>

## 计费遥测

对于不以离线模式运行的自托管 LangSmith 实例，**需要**计费遥测。这包括许可证验证和订阅/使用报告。<Info>
  计费遥测**无法禁用**。如果您需要在没有任何出口的情况下运行，请联系您的客户团队以获取离线（气隙）许可证。
</Info>

### 它的作用

* **许可证验证**：在启动时以及此后定期验证您的 LangSmith 许可证密钥。
* **订阅/使用报告**：根据订单中的权利报告平台使用指标以用于计费目的。

### 我们收集什么

* 许可证密钥验证请求
* 聚合使用计数（跟踪数、分配的席位、使用中的席位）
* 组织和工作区标识符

### 负载示例

#### 许可证验证

**端点：** `POST beacon.langchain.com/v1/beacon/verify`

**要求：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "license": "<YOUR_LICENSE_KEY>"
}
```

**回应：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "token": "Valid JWT" //Short-lived JWT token to avoid repeated license checks
}
```

#### 订阅/使用报告

**端点：** `POST beacon.langchain.com/v1/beacon/ingest-traces`

**要求：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "license": "<YOUR_LICENSE_KEY>",
  "trace_transactions": [
    {
      "id": "af28dfea-5358-463d-a2dc-37df1da72498",
      "tenant_id": "3a1c2b6f-4430-4b92-8a5b-79b8b567bbc1",
      "session_id": "b26ae531-cdb3-42a5-8bcf-05355199fe27",
      "trace_count": 5,
      "start_insertion_time": "2025-01-06T10:00:00Z",
      "end_insertion_time": "2025-01-06T11:00:00Z",
      "start_interval_time": "2025-01-06T09:00:00Z",
      "end_interval_time": "2025-01-06T10:00:00Z",
      "status": "completed",
      "num_failed_send_attempts": 0,
      "transaction_type": "type1",
      "organization_id": "c5b5f53a-4716-4326-8967-d4f7f7799735"
    }
  ]
}
```

**回应：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "inserted_count": 1 //Number of transactions successfully ingested
}
```

## 操作遥测

从版本 **0.11** 开始，LangSmith 部署默认发送操作遥测数据。这种遥测有助于 LangChain 团队为自托管实例提供主动支持和更快的故障排除。

<Info>
  操作遥测与计费遥测**分开。您可以在计费遥测保持活动状态时禁用操作遥测。
</Info>### 它的作用

* 实现主动支持并更快地排除自托管实例的故障
* 协助性能调整
* 帮助根据现实世界的使用模式确定改进的优先顺序

### 我们收集什么

* **请求元数据**：匿名请求计数、大小和持续时间
* **数据库指标**：查询持续时间、错误率和性能计数器
* **操作跟踪**：高延迟或失败请求的计时和错误信息（这些**不是**客户跟踪 - 它们是有关 LangSmith 实例本身功能的跟踪）
* **日志消息**：仅警告和错误日志消息

<Info>
  我们不会收集实际的有效负载内容、数据库记录或任何可以识别您的最终用户或客户的数据。所有遥测数据都与组织和部署相关联，但从未与个人用户标识。我们**不以任何形式收集 PII**（个人身份信息）。
</Info>

### 如何禁用

您可以通过在 `langsmith_config.yaml` 文件中设置以下值来禁用操作遥测：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
config:
  telemetry:
    logs: false
    metrics: false
    traces: false
```

您还可以通过仅将特定值设置为 `false` 来禁用单个遥测类型。<Warning>
  禁用操作遥测会停止导出本节中描述的日志、指标和跟踪。它**不会**禁用计费遥测（许可证验证和订阅/使用报告）。
</Warning>

### 负载示例

#### 运营指标

**端点：** `POST beacon.langchain.com/v1/beacon/v1/metrics`

**要求：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "resourceMetrics": [
    {
      "resource": {
        "attributes": [
          {
            "key": "resource.name",
            "value": { "stringValue": "langsmith-metrics" }
          },
          {
            "key": "env",
            "value": { "stringValue": "ls_self_hosted" }
          }
        ]
      },
      "scopeMetrics": [
        {
          "scope": {
            "name": "langsmith.metrics",
            "version": "0.1.0"
          },
          "metrics": [
            {
              "name": "langsmith_http_requests_latency",
              "unit": "seconds",
              "description": "Request latency of LangSmith services",
              "gauge": {
                "dataPoints": [
                  {
                    "asDouble": 12.34,
                    "startTimeUnixNano": 1678886400000000000,
                    "timeUnixNano": 1678886400000000000,
                    "attributes": [
                      {
                        "key": "endpoint",
                        "value": { "stringValue": "/sessions" }
                      },
                      { "key": "method", "value": { "stringValue": "GET" } },
                      {
                        "key": "service_name",
                        "value": { "stringValue": "langsmith_backend" }
                      }
                    ]
                  }
                ]
              }
            },
            {
              "name": "langsmith_http_requests_failed",
              "unit": "1",
              "description": "Counter of failed requests for LangSmith services",
              "sum": {
                "dataPoints": [
                  {
                    "asInt": 456,
                    "startTimeUnixNano": 1678886400000000000,
                    "timeUnixNano": 1678886400000000000,
                    "attributes": [
                      {
                        "key": "endpoint",
                        "value": { "stringValue": "/info" }
                      },
                      { "key": "method", "value": { "stringValue": "POST" } },
                      {
                        "key": "service_name",
                        "value": { "stringValue": "langsmith_platform_backend" }
                      }
                    ],
                    "aggregationTemporality": 2,
                    "isMonotonic": true
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

#### 操作痕迹

**端点：** `POST beacon.langchain.com/v1/beacon/v1/traces`

**要求：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          {
            "key": "env",
            "value": {
              "stringValue": "ls_self_hosted"
            }
          },
          {
            "key": "service.name",
            "value": {
              "stringValue": "langsmith_backend"
            }
          }
        ]
      },
      "scopeSpans": [
        {
          "scope": {},
          "spans": [
            {
              "traceId": "71699b6fe85982c7c8995ea3d9c95df2",
              "spanId": "3c191d03fa8be0",
              "parentSpanId": "",
              "name": "receive_request",
              "startTimeUnixNano": "1581452772000000321",
              "endTimeUnixNano": "1581452773000000789",
              "droppedAttributesCount": 1,
              "events": [
                {
                  "timeUnixNano": "1581452773000000123",
                  "name": "parse_request",
                  "attributes": [
                    {
                      "key": "request_size",
                      "value": {
                        "stringValue": "100"
                      }
                    }
                  ],
                  "droppedAttributesCount": 2
                },
                {
                  "timeUnixNano": "1581452773000000123",
                  "name": "event",
                  "droppedAttributesCount": 2
                }
              ],
              "droppedEventsCount": 1,
              "status": {
                "message": "status-cancelled",
                "code": 2
              }
            },
            {
              "traceId": "71699b6fe85982c7c8995ea3d9c95df2",
              "spanId": "0932ksdka12345",
              "parentSpanId": "3c191d03fa8be0",
              "name": "process_request",
              "startTimeUnixNano": "1581452772000000321",
              "endTimeUnixNano": "1581452773000000789",
              "links": [],
              "droppedLinksCount": 3,
              "status": {}
            }
          ]
        }
      ]
    }
  ]
}
```

#### 操作日志消息

我们仅从自托管 LangSmith 实例导出错误日志消息。这使得LangChain团队能够排除应用程序错误，而无需与您的团队来回沟通。

**端点：** `POST beacon.langchain.com/v1/beacon/v1/logs`

**要求：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "resourceLogs": [
    {
      "resource": {
        "attributes": [
          {
            "key": "service.name",
            "value": {
              "stringValue": "langsmith_backend"
            }
          }
        ]
      },
      "scopeLogs": [
        {
          "scope": {},
          "logRecords": [
            {
              "timeUnixNano": "1581452773000009875",
              "severityNumber": 13,
              "severityText": "Warning",
              "body": {
                "stringValue": "Database connection pool approaching capacity"
              },
              "attributes": [
                {
                  "key": "component",
                  "value": {
                    "stringValue": "langsmith_backend"
                  }
                },
                {
                  "key": "pool_size",
                  "value": {
                    "intValue": "95"
                  }
                }
              ],
              "droppedAttributesCount": 0,
              "traceId": "08040201000000000000000000000000",
              "spanId": "0102040800000000"
            },
            {
              "timeUnixNano": "1581452773000000789",
              "severityNumber": 17,
              "severityText": "Error",
              "body": {
                "stringValue": "Failed to process trace batch"
              },
              "attributes": [
                {
                  "key": "component",
                  "value": {
                    "stringValue": "langsmith_queue_worker"
                  }
                },
                {
                  "key": "error_type",
                  "value": {
                    "stringValue": "timeout"
                  }
                }
              ],
              "droppedAttributesCount": 0,
              "traceId": "",
              "spanId": ""
            }
          ]
        }
      ]
    }
  ]
}
```

## 使用遥测

使用情况遥测收集 LangSmith 实例使用指标的匿名快照。这些数据有助于 LangChain 了解平台采用模式并为产品开发决策提供信息。

<Info>
  使用情况遥测**默认启用**并且可以禁用。与计费遥测不同，您可以完全控制这些快照是否发送到 LangChain。
</Info>

### 它的作用* 定期捕获聚合使用指标
* 提供对功能采用和平台增长的深入了解
* 帮助LangChain根据实际使用情况确定改进和新功能的优先顺序

### 我们收集什么

* **平台指标**：工作区、项目、实验、数据集、评估器和其他平台资源的计数
* **功能使用**：运行规则、注释队列、提示和提示相关活动的计数
* **用户**：过去 30 天内的注册用户总数和活跃 PAT（个人访问令牌）数量
* **时间戳**：快照的时间范围（从/到 UTC 时间戳）

<Info>
  所有指标均为**仅聚合计数**。不会收集任何单独的资源数据、标识符或使用模式。我们不会收集任何可以识别您的最终用户或客户的信息。
</Info>

### 负载示例

**端点：** `POST /v1/beacon/usage-snapshot`

**要求：**

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "license_key": "<YOUR_LICENSE_KEY>",
  "from_timestamp": "2026-03-25T02:00:00+00:00",
  "to_timestamp": "2026-03-26T02:00:00+00:00",
  "measures": {
    "workspaces": 12,
    "users": 63,
    "projects": 87,
    "experiments": 34,
    "datasets": 15,
    "evaluators": 8,
    "run_rules": 5,
    "annotation_queues": 3,
    "prompts": 22,
    "prompt_commits": 156,
    "prompt_pulls": 1043,
    "active_pats_30d": 47
  }
}
```

### 如何禁用

您可以通过在部署配置中设置以下环境变量来禁用使用情况遥测：

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
PHONE_HOME_USAGE_REPORTING_ENABLED: false
```

将此添加到 Helm 配置的 `commonEnv` 部分，以永久禁用使用情况遥测报告。<Warning>
  禁用使用遥测不会影响计费或操作遥测。许可证验证和订阅/使用报告将继续正常运行。
</Warning>

## 朗史密斯发动机智能

本节仅在您启用 [Engine](/langsmith/deploy-self-hosted-full-platform#enable-engine) 时适用。 LangSmith Intelligence 是由 LangChain 管理的服务，为 Engine 提供支持。没有其他 LangSmith 功能依赖于它，并且不需要超出本页已描述的出口。

引擎无法完全在集群内运行。它将请求发送到 LangSmith Intelligence，这是一项由 LangChain 管理的零数据保留 (ZDR) 服务，该服务将请求路由到 LangChain 环境内的模型提供商。允许出站 HTTPS 到您的云网关：AWS 上的`beacon.aws.langchain.com`，或 GCP 上的`beacon.langchain.com`。在 GCP 上，该页面已需要同一主机，因此引擎添加了路径而不是新目的地。

<Note>
  引擎可用于 **AWS US** 和 **GCP US** 中的 LangSmith 自托管。 AWS EU 和 Azure 已规划。参见[Availability by cloud and region](/langsmith/engine-self-hosted#availability-by-cloud-and-region)。
</Note><Warning>
  将网关添加为特定的允许列表条目，而不是打开常规出站访问。请求使用在 LangSmith 许可证验证期间获得的短期许可证 JWT 进行身份验证。不需要额外的模型提供商凭据。
</Warning>

### 它的作用

* **为引擎提供动力**：引擎依赖于 LangSmith Intelligence，没有它就无法运行。

### 我们收集什么

每个请求可能携带跟踪内容、源代码和引擎完成其工作所需的中间输出。 LangSmith Intelligence 和模型提供商处理该内容以满足请求。 LangSmith Intelligence 不保留提示或完成主体。

LangSmith Intelligence 保留以下元数据用于使用归因和计费：

* 用于归因使用情况的帐户、工作区和项目标识符。
* 用于计费的模型和令牌使用元数据。

有关完整的数据流和模型提供商承诺，请参阅[Engine on Self-hosted](/langsmith/engine-self-hosted)。

<Info>
  脱机（气隙）自承载无法运行引擎，因为它无法到达 LangSmith Intelligence。 LangSmith 的所有其他功能都可以继续离线工作。
</Info>

## 我们的承诺以下承诺适用于本页所述的计费、操作和使用遥测。 LangChain不会在该遥测数据中存储敏感信息或与第三方共享。日志消息被过滤为仅包含错误严重性级别，并且我们不会捕获可能包含敏感应用程序数据的日志消息。引擎对 LangSmith Intelligence 的使用是[Engine on Self-hosted](/langsmith/engine-self-hosted) 中描述的单独数据流。如果您对发送的数据有任何疑问，请禁用可选遥测或联系您的客户团队。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-egress.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>