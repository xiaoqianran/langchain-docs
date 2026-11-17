<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: API rate limits | https://docs.langchain.com/langsmith/cloud-rate-limits -->

# API 速率限制

对 LangSmith Cloud API 端点实施的速率限制，表示为每个时间间隔的请求计数，以及每个区域和每个身份的细分。

## API 速率限制

LangSmith 对API端点实施速率限制，以确保服务稳定性和公平使用。下表显示了 GCP US 和 GCP EU 区域中不同端点的速率限制。 GCP APAC 和 AWS US 强制实施类似的服务特定限制；如果您的组织需要确切的限制，请联系支持人员。请注意：

* 速率限制表示为 `count / interval`，其中 count 是时间间隔内允许的请求数（以秒为单位）。例如，`2000 / 10`表示每10秒2000个请求。
* 当端点列中未指定 HTTP 方法时，速率限制适用于该端点的所有 HTTP 方法。
* 当列出特定方法时（例如，`POST`、`GET`），速率限制仅适用于该方法。|匹配/端点（方法）|身份密钥 |美国产品限价|欧盟产品限制|类别 |
| - | - | - | - | - |
|选项，`/info`，`*/v1/metadata/submit` |知识产权| 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/auth` | `x-api-key` | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/auth` | `x-user-id` + IP | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/v1/beacon` |知识产权| 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `/repos` | `x-api-key` | 100 / 60 | 100 / 60 100 / 60 | 100 / 60 [Repository](#rate-limit-categories) |
| `/repos` | `x-user-id` + IP | 100 / 60 | 100 / 60 100 / 60 | 100 / 60 [Repository](#rate-limit-categories) |
| `POST /runs/batch` | `x-api-key` | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `POST /otel/v1/traces` | `x-api-key` | 2000 / 10 | 2000 / 10 | [Run ingest](#rate-limit-categories) |
| `POST` 包含 `/charts` | `x-api-key` | 750 / 600 | 750 / 600 | [Charts](#rate-limit-categories) |
| `POST` 包含 `/charts` | `x-user-id` + IP | 750 / 600 | 750 / 600 | [Charts](#rate-limit-categories) |
| `POST /runs/multipart` | `x-api-key` | 6000 / 10 | 6000 / 10 | [Multipart ingest](#rate-limit-categories) |
| `POST /runs/query` | `x-api-key` | 15 / 10 | 15 / 10 | [Run query (API)](#rate-limit-categories) |
| `POST /runs/query` | `x-user-id`+IP | 300 / 10 | 300 / 10 | [Run query (User)](#rate-limit-categories) |
| `/generate` | `x-api-key` | 30 / 3600 | 30 / 3600 | [Generation](#rate-limit-categories) |
| `/generate` | `x-user-id` + IP | 30 / 3600 | 30 / 3600 | [Generation](#rate-limit-categories) |
| `/commits` | `x-api-key` | 10000 / 60 | 2000 / 60 | [Commits](#rate-limit-categories) |
| `/commits` | `x-user-id` + IP | 10000 / 60 | 2000 / 60 | [Commits](#rate-limit-categories) |
| `DELETE /sessions` 或 `*/trigger` | `x-api-key` | 10 / 60 | 10 / 60 | [Deletion](#rate-limit-categories) |
| `DELETE /sessions` 或 `*/trigger` | `x-user-id` + IP | 30 / 60 | 30 / 60 | [Deletion](#rate-limit-categories) || `POST /runs`（单次运行摄取）| `x-api-key` | 2000 / 10 | 2000 / 10 | [Run ingest](#rate-limit-categories) |
| `PATCH` 包含 `/runs` | `x-api-key` | 2000 / 10 | 2000 / 10 | [Run ingest](#rate-limit-categories) |
| `POST /feedback` | `x-api-key` | 2000 / 10 | 2000 / 10 | [High throughput](#rate-limit-categories) |
| `GET /runs/{uuid}` 或 `/api/v1/runs/{uuid}` | `x-api-key` | 30 / 60 | 30 / 60 | [Run lookup](#rate-limit-categories) |
| `GET` 包含 `/examples` | `x-api-key` | 5000 / 60 | 5000 / 60 | [Examples](#rate-limit-categories) |
|任何与 `x-api-key` 的请求 | `x-api-key` | 1000 / 10 | 1000 / 10 1000 / 10 | 1000 / 10 [Default (API key)](#rate-limit-categories) |
|任何与 `x-user-id` 的请求 | `x-user-id`+IP | 1000 / 10 | 1000 / 10 1000 / 10 | 1000 / 10 [Default (User)](#rate-limit-categories) |
| `/public/download` |知识产权| 5000 / 60 | 5000 / 60 | [Public download](#rate-limit-categories) |
| `/runs/stats` | `x-api-key` | 1 / 10 | 20 / 10 | [Stats](#rate-limit-categories) |
|所有其他 IP（包罗万象）|知识产权| 100 / 60 | 100 / 60 100 / 60 | 100 / 60 [Public (catch-all)](#rate-limit-categories) |

### 速率限制类别* **高吞吐量**：用于身份验证、元数据和反馈等核心操作的一般大容量端点。
* **Repository**：存储库和提示管理操作。
* **运行摄取**：单独的跟踪/运行摄取端点以实现可观察性。
* **图表**：图表生成和可视化端点。
* **分段摄取**：通过分段上传进行批量运行摄取，以进行大容量跟踪。
* **运行查询 (API)**：基于 API 密钥的运行查询操作，对复杂查询具有更严格的限制。
* **运行查询（用户）**：基于用户的运行查询操作，具有更高的交互使用限制。
* **生成**：人工智能驱动的代码和内容生成端点（仅限于防止滥用）。
* **Commits**：提示版本控制和提交操作。
* **删除**：会话删除和工作流触发操作。
* **运行查找**：通过 UUID 检索特定运行。
* **示例**：获取数据集示例以进行少量提示。
* **默认（API 密钥）**：经过身份验证的 API 请求与特定模式不匹配的回退速率限制。
* **默认（用户）**：经过身份验证的用户请求与特定模式不匹配的回退速率限制。* **公共下载**：共享资源的大容量公共下载端点。
* **统计**：运行统计和分析端点（适用区域特定限制）。
* **公共（包罗万象）**：未经身份验证的公共访问的默认速率限制。

有关速率限制和其他服务限制的更多信息，请参阅[Administration overview](/langsmith/usage-and-billing#rate-limits)。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/cloud-rate-limits.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。