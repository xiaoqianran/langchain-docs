<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Clone dataset | https://docs.langchain.com/langsmith/smith-api/datasets/clone-dataset -->

# 克隆数据集

/langsmith/langsmith-platform-openapi.json 发布 /api/v1/datasets/clone
将源数据集中的示例复制到现有目标数据集中。

每个复制的示例都会获得一个新的 ID 并保留输入、输出、元数据、
及其源示例的源运行 ID。当 blob 时会复制附件
存储已启用。复制相同的示例两次会将它们添加两次。
需要两个数据集的 datasets:clone 权限。返回 ID，
数据集 ID、创建和修改时间以及每个新数据集的源运行 ID
示例。如果没有示例 ID，则无法找到源或目标
返回一个空列表而不是错误。