<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Share dataset | https://docs.langchain.com/langsmith/smith-api/datasets/share-dataset -->

# 共享数据集

/langsmith/langsmith-platform-openapi.json 把 /api/v1/datasets/{dataset_id}/share
公开共享数据集并返回其共享令牌。

拥有共享令牌的任何人都可以查看数据集、其示例及其内容
实验，包括其运行和反馈，无需登录。
数据集已共享，返回其现有共享令牌。失败，返回 403
当组织禁用公共共享时。