<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Fetch shared experiment runs for dataset examples | https://docs.langchain.com/langsmith/smith-api/datasets/fetch-shared-experiment-runs-for-dataset-examples -->

# 获取数据集示例的共享实验运行

/langsmith/langsmith-platform-openapi.json 发布 /api/v2/datasets/public/{share_token}/experiment-runs
POST /v2/datasets/{dataset_id}/experiment-runs 的公共共享令牌变体。
返回数据集示例的分页页面，其中包含所请求实验的运行。

自托管部署需要 LangSmith `v0.16` 或更高版本。