<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update dataset splits | https://docs.langchain.com/langsmith/smith-api/datasets/update-dataset-splits -->

# 更新数据集分割

/langsmith/langsmith-platform-openapi.json 把 /api/v1/datasets/{dataset_id}/splits
将示例添加到拆分中，或从中删除示例。

返回在数据集中找到的给定示例的 ID。他们每个人都得到
一个新版本，即使它的分割没有改变。示例的其他拆分
被保留，并且没有分割的示例被视为在基本分割中。
删除示例的最后一个分割将使其不再分割。