<!-- langchain-docs: Ingest runs (batch json) | https://docs.langchain.com/langsmith/smith-api/runs/ingest-runs-batch-json -->

# Ingest runs (batch json)

/langsmith/langsmith-platform-openapi.json post /api/v1/runs/batch
Ingests a batch of runs in a single JSON payload. The payload must have `post` and/or `patch` arrays containing run objects.
Prefer this endpoint over single‑run ingestion when submitting hundreds of runs, but `/runs/multipart` offers better handling for very large fields and attachments.