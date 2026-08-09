<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LangSmith-managed ClickHouse | https://docs.langchain.com/langsmith/langsmith-managed-clickhouse -->

# LangSmith 管理的 ClickHouse

<Check>
  在继续阅读本指南之前，请先阅读[LangSmith architectural overview](/langsmith/self-hosted)和[guide on connecting to external ClickHouse](/langsmith/self-host-external-clickhouse)。
</Check>

LangSmith 使用 ClickHouse 作为**跟踪**和**反馈**的主要存储引擎。为了更轻松地管理和扩展，建议将自托管 LangSmith 实例连接到外部 ClickHouse 实例。 LangSmith 管理的 ClickHouse 是一个选项，允许您使用由 LangSmith 团队监控和维护的完全托管的 ClickHouse 实例。

## 架构概述

将 LangSmith 管理的 ClickHouse 与自托管 LangSmith 实例结合使用的架构类似于使用完全自托管的 ClickHouse 实例，但有一些关键区别：* 您需要在 LangSmith 实例和 LangSmith 管理的 ClickHouse 实例之间设置专用网络连接。这是为了确保您的数据安全，并且您可以从自托管的 LangSmith 实例连接到 ClickHouse 实例。
* 使用此选项，您的跟踪的敏感信息（输入和输出）将存储在云中的云对象存储（S3 或 GCS）中，而不是 ClickHouse 中，以确保敏感信息不会离开您的 VPC。有关特定数据字段存储位置的更多详细信息，请参阅[Data storage](#data-storage)。
* LangSmith 团队将监控您的 ClickHouse 实例并确保其顺利运行。这使我们能够跟踪运行摄取延迟和查询性能等指标。

整体架构如下：

<img alt="LangSmith managed ClickHouse architecture." />

<img alt="LangSmith managed ClickHouse architecture." />

## 要求* **您必须使用受支持的 blob 存储选项。** 请阅读 [blob storage guide](/langsmith/self-host-blob-storage) 了解更多信息。
* 要使用私有端点，请确保您的 VPC 位于支持的 ClickHouse Cloud [region](https://clickhouse.com/docs/en/cloud/reference/supported-regions) 中。否则，您将需要使用我们将通过防火墙规则保护的公共端点。您的 VPC 需要有 NAT 网关，以便我们将您的流量列入白名单。
* 您必须拥有可以连接到 LangSmith 管理的 ClickHouse 服务的 VPC。您需要与我们的团队合作建立必要的网络。
* 您必须有一个正在运行的 LangSmith 自托管实例。您可以通过 [Kubernetes](/langsmith/kubernetes) 安装使用我们的托管 ClickHouse 服务。

## 数据存储

ClickHouse 存储**运行**和**反馈**数据，具体来说：

* 所有反馈数据字段。
* 一些运行数据字段。

有关字段列表，请参阅 [Stored run data fields](#stored-run-data-fields) 和 [Stored feedback data fields](#stored-feedback-data-fields)。LangChain将敏感应用数据定义为运行的`inputs`、`outputs`、`errors`、`manifests`、`extras`和`events`，因为这些字段可能包含LLM提示和完成。通过 LangSmith 管理的 ClickHouse，这些敏感字段存储在云中的云对象存储（S3 或 GCS）中，而其余运行数据存储在 ClickHouse 中，确保敏感信息永远不会离开您的 VPC。

### 存储的反馈数据字段

<Note>
  由于所有反馈数据都存储在 ClickHouse 中，因此请勿在反馈（分数和注释/评论）或[Stored run data fields](#stored-run-data-fields)中提到的任何其他运行字段中发送敏感信息。
</Note>

使用 LangSmith 管理的 ClickHouse 设置，**所有反馈数据字段都存储在 ClickHouse 中**：|字段名称 |类型 |描述 |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id` | UUID |记录本身的唯一标识符 |
| `created_at` |日期时间 |创建记录时的时间戳 |
| `modified_at` |日期时间 |上次修改记录的时间戳 |
| `session_id` | UUID |运行所属的实验或跟踪项目的唯一标识符。创建运行反馈时需要。 |
| `run_id` | UUID |会话中特定运行的唯一标识符 || `start_time` |日期时间 |反馈所针对的运行的开始时间。可选，但提供它可以让 LangSmith 更快地处理反馈。        |
| `key` |字符串|描述反馈标准的键，例如`'correctness'` |
| `score` |数量 |与反馈键相关的数字分数 |
| `value` |字符串|保留用于存储与分数关联的值。对于分类反馈很有用。                                  |
| `comment` |字符串|与记录相关的任何评论或注释。这可以作为给出分数的理由。                    |
| `correction` |对象|保留用于存储更正详细信息（如果有）|
| `feedback_source` |对象|包含反馈源信息的对象 || `feedback_source.type` |字符串|反馈来源的类型，例如`'api'`、`'app'`、`'evaluator'` |
| `feedback_source.metadata` |对象|目前保留用于附加元数据 |
| `feedback_source.user_id` | UUID |提供反馈的用户的唯一标识符|

这个[reference doc](/langsmith/feedback-data-format)解释了存储的反馈格式，这是LangSmith表示评估分数和运行注释的方式。

### 存储的运行数据字段

运行数据字段在托管 ClickHouse 数据库和云对象存储（例如 S3 或 GCS）之间划分。

<Note>
  对于存储在对象存储中的运行字段，ClickHouse 中仅保留引用或指针。例如，`inputs`和`outputs`内容被卸载到S3/GCS，ClickHouse记录在`inputs_s3_urls`和`outputs_s3_urls`字段中存储相应的S3 URL。
</Note>

该表详细介绍了每个运行字段及其存储位置：|领域|储存地点 |
| ------------------------------------------ | ------------------ |
| `id` |点击屋 |
| `name` |点击屋 |
| `inputs` | **对象存储** |
| `run_type` |点击屋 |
| `start_time` |点击屋 |
| `end_time` |点击屋 |
| `extra` | **对象存储** |
| `error` | **对象存储** |
| `outputs` | **对象存储** |
| `events` | **对象存储** |
| `tags` |点击屋 |
| `trace_id` |点击屋 |
| `dotted_order` |点击屋 |
| `status` |点击屋 |
| `child_run_ids` |点击屋 |
| `direct_child_run_ids` |点击屋 |
| `parent_run_ids` |点击屋 |
| `feedback_stats` |点击屋 |
| `reference_example_id` |点击屋 |
| `total_tokens` |点击屋 |
| `prompt_tokens` |点击屋 |
| `completion_tokens` |点击屋 || `total_cost` |点击屋 |
| `prompt_cost` |点击屋 |
| `completion_cost` |点击屋 |
| `first_token_time` |点击屋 |
| `session_id` |点击屋 |
| `in_dataset` |点击屋 |
| `parent_run_id` |点击屋 |
| `execution_order`（已弃用）|点击屋 |
| `serialized` |点击屋 |
| `manifest_id`（已弃用）|点击屋 |
| `manifest_s3_id` |点击屋 |
| `inputs_s3_urls` |点击屋 |
| `outputs_s3_urls` |点击屋 |
| `price_model_id` |点击屋 |
| `app_path` |点击屋 |
| `last_queued_at` |点击屋 |
| `share_token` |点击屋 |

这个[reference doc](/langsmith/run-data-format)解释了存储的运行（跨度）的格式，它们是迹线的构建块。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/langsmith-managed-clickhouse.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>