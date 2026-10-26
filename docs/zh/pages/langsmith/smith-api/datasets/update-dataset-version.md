<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update dataset version | https://docs.langchain.com/langsmith/smith-api/datasets/update-dataset-version -->

# 更新数据集版本

/langsmith/langsmith-platform-openapi.json 把 /api/v1/datasets/{dataset_id}/tags
标记数据集版本。

将标签指向 as_of 给出的版本，创建标签或移动它
如果数据集已经有它。其他标签不变。需要许可
更新数据集。返回版本的时间及其所有标签。退货
如果标签是最新的，则返回 400；如果数据集或 as_of 标签不是最新的，则返回 404
存在。