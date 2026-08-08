<!-- langchain-docs: Ingest runs (multipart) | https://docs.langchain.com/langsmith/smith-api/runs/ingest-runs-multipart -->

# Ingest runs (multipart)

/langsmith/langsmith-platform-openapi.json post /api/v1/runs/multipart
Ingests multiple runs, feedback objects, and binary attachments in a single `multipart/form-data` request.
**Part‑name pattern**: `<event>.<run_id>[.<field>]` where `event` ∈ {`post`, `patch`, `feedback`, `attachment`}.
* `post|patch.<run_id>` – JSON run payload.
* `post|patch.<run_id>.<field>` – out‑of‑band run data (`inputs`, `outputs`, `events`, `error`, `extra`, `serialized`).
* `feedback.<run_id>` – JSON feedback payload (must include `trace_id` and `session_id`).
* `attachment.<run_id>.<filename>` – arbitrary binary attachment stored in S3.
**Headers**: every part must set `Content-Type` **and** either a `Content-Length` header or `length` parameter. Per‑part `Content-Encoding` is **not** allowed; the top‑level request may be `Content-Encoding: gzip` or `Content-Encoding: zstd`.
**Best performance** for high‑volume ingestion.