<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Update dataset | https://docs.langchain.com/langsmith/smith-api/datasets/update-dataset -->

# 更新数据集

/langsmith/langsmith-platform-openapi.json 补丁 /api/v1/datasets/{dataset_id}
更新数据集。

仅请求中的字段发生变化；省略的字段保留其值。
设置模式或转换会检查每个现有示例
结果。返回 400，保持数据集不变（如果示例这样做）
不匹配，数据集不是键值数据集，也不是转换
指向没有模式的输入或输出。的
X-Updated-Examples-Count 响应标头保存示例数量
通过 patch_examples 更改。如果数据集不存在则返回404
如果新名称已被使用，则返回 409。