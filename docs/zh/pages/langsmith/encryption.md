<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Encryption at rest | https://docs.langchain.com/langsmith/encryption -->

# 静态加密

为代理服务器数据选择内置 AES 加密和自定义加密处理程序。

Agent Server 支持两种静态应用程序级加密方法。使用内置 AES 加密，除非您需要每个租户密钥或外部密钥管理系统。

## 选择一种加密方法

> **[Built-in AES encryption](/langsmith/aes-encryption)**
>
> 推荐用于大多数部署。配置 AES 密钥以加密检查点数据和选定的 JSON 字段。支持惰性密钥轮换。

> **[Custom encryption](/langsmith/custom-encryption)**
>
> 仅当内置 AES 不能满足您的要求时才使用。通过自定义处理程序支持每个租户密钥和外部密钥管理系统。

如果您需要，请选择[built-in AES encryption](/langsmith/aes-encryption)：

* 一个用于部署的加密密钥
* 钥匙轮换
* JSON字段的选择性加密

仅当您需要时才选择[custom encryption](/langsmith/custom-encryption)：

* 不同租户有不同的加密密钥
* 外部密钥管理系统
* 自定义加密逻辑或审计行为

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/encryption.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。