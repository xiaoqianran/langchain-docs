<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Encryption at rest | https://docs.langchain.com/langsmith/encryption -->

# 静态加密

为代理服务器数据选择内置 AES 加密和自定义加密处理程序。

Agent Server 支持两种静态应用程序级加密方法。使用内置 AES 加密，除非您需要每个租户密钥或外部密钥管理系统。

## Choose an encryption approach

<CardGroup>
  <Card title="Built-in AES encryption" icon="shield-lock" href="/langsmith/aes-encryption">
    Recommended for most deployments.配置 AES 密钥以加密检查点数据和选定的 JSON 字段。 Supports lazy key rotation.
  </Card>

  <Card title="Custom encryption" icon="settings-code" href="/langsmith/custom-encryption">
    仅当内置 AES 不能满足您的要求时才使用。通过自定义处理程序支持每个租户密钥和外部密钥管理系统。
  </Card>
</CardGroup>

Choose [built-in AES encryption](/langsmith/aes-encryption) if you need:

* One encryption key for the deployment
* 钥匙轮换
* Selective encryption of JSON fields

Choose [custom encryption](/langsmith/custom-encryption) only if you need:

* 不同租户有不同的加密密钥
* An external key management system
* 自定义加密逻辑或审计行为

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/encryption.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>