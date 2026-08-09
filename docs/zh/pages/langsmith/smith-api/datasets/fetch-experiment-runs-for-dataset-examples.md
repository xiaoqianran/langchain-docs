<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fetch experiment runs for dataset examples | https://docs.langchain.com/langsmith/smith-api/datasets/fetch-experiment-runs-for-dataset-examples -->

# 获取数据集示例的实验运行

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/datasets/{dataset_id}/experiment-runs
返回数据集示例的分页页面，其中包含所请求实验的运行。
响应使用规范的 `{items, next_cursor}` 信封。

自托管部署需要 LangSmith `v0.16` 或更高版本。