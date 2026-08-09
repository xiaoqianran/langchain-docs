<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Evaluate experiment adhoc | https://docs.langchain.com/langsmith/smith-api/experiments/evaluate-experiment-adhoc -->

# 评估临时实验

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/runs/experiments/{experiment_id}/evaluate
与特定评估者一起评估现有实验。

这会使用 run_over_dataset 方法触发立即评估，
处理批量运行以有效地处理大型实验。