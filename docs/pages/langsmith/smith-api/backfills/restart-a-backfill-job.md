<!-- langchain-docs: Restart a backfill job | https://docs.langchain.com/langsmith/smith-api/backfills/restart-a-backfill-job -->

# Restart a backfill job

/langsmith/langsmith-platform-openapi.json post /api/v1/platform/ops/backfills/restart
Deletes the backfill job record, causing the backfill to restart from the beginning on the next cron tick. Requires instance admin access.