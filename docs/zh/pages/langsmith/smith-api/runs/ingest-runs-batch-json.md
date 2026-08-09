<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Ingest runs (batch json) | https://docs.langchain.com/langsmith/smith-api/runs/ingest-runs-batch-json -->

# 摄取运行（批量 json）

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/runs/batch
在单个 JSON 负载中摄取一批运行。有效负载必须具有包含运行对象的`post`和/或`patch`数组。
在提交数百次运行时，与单次运行摄取相比，更喜欢使用此端点，但`/runs/multipart`可以更好地处理非常大的字段和附件。