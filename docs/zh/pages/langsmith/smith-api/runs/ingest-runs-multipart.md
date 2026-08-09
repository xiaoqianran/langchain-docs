<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Ingest runs (multipart) | https://docs.langchain.com/langsmith/smith-api/runs/ingest-runs-multipart -->

# 摄取运行（多部分）

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/runs/multipart
在单个 `multipart/form-data` 请求中摄取多个运行、反馈对象和二进制附件。
**零件名称模式**：`<event>.<run_id>[.<field>]`，其中`event` ∈ {`post`，`patch`，`feedback`，`attachment`}。
* `post|patch.<run_id>` – JSON 运行负载。
* `post|patch.<run_id>.<field>` – 带外运行数据（`inputs`、`outputs`、`events`、`error`、`extra`、`serialized`）。
* `feedback.<run_id>` – JSON 反馈负载（必须包含 `trace_id` 和 `session_id`）。
* `attachment.<run_id>.<filename>` – 存储在 S3 中的任意二进制附件。
**标头**：每个部分都必须设置 `Content-Type` **和** `Content-Length` 标头或 `length` 参数。每部分`Content-Encoding` **不允许**；顶级请求可能是`Content-Encoding: gzip`或`Content-Encoding: zstd`。
**大容量摄取的最佳性能**。