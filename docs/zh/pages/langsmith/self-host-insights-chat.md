<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure Insights and Chat on self-hosted LangSmith | https://docs.langchain.com/langsmith/self-host-insights-chat -->

# 在自托管 LangSmith 上配置 Insights 和 Chat

在自托管 LangSmith 上配置 Insights 和 Chat 的加密密钥和模型访问权限、禁用任一功能或升级旧配置。

[Insights](/langsmith/insights) 分析痕迹，[Chat](/langsmith/chat)（以前称为 Polly）帮助您处理 LangSmith 数据。两者都是基本安装的一部分，并且在 Helm Chart 0.15.1 或更高版本中默认启用。它们不需要任何 [additional features](/langsmith/self-host-additional-features)，例如沙箱、队列或 LangSmith 部署。

<Note>
  对于 0.15.1 之前的图表，默认情况下不启用 Insights 和 Chat。使用固定图表支持的配置，或在遵循本指南之前进行升级。
</Note>

每个功能都需要自己的 Fernet 加密密钥和模型访问权限。如果您遵循[Kubernetes installation guide](/langsmith/kubernetes)，则您已经在`langsmith_config.yaml`中设置了密钥。继续[Configure model access](#configure-model-access)。

## 设置加密密钥

要为每个功能生成一个密钥，请参阅[Keys and secrets](/langsmith/kubernetes#keys-and-secrets)。不要将加密密钥提交给版本控制。

通过以下两种方式之一提供密钥：

* **内联**：在`langsmith_config.yaml`中设置`insights.encryptionKey`和`polly.encryptionKey`，如在[minimum configuration](/langsmith/kubernetes#configure-your-helm-charts)中。
* **现有秘密**：将`insights_encryption_key`和`polly_encryption_key`添加到您的[existing LangSmith app Secret](/langsmith/self-host-using-an-existing-secret#parameters)。通过`config.existingSecretName`参考。

应用您的 Helm 配置：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
```

## 配置模型访问通过您的 [provider credentials and model configurations](/langsmith/model-configurations) 进行见解和聊天呼叫模型。有关 GKE 上的无密钥 Vertex AI，请参阅 [Configure GKE workload identity](/langsmith/self-host-gke-vertex-ai-workload-identity)。

## 禁用见解或聊天

当您的安装不需要时，禁用任一功能。在 [⟦T11⟧](/langsmith/kubernetes#configure-your-helm-charts) 中将相应的顶级标志设置为 `false`。对于禁用的功能，您不需要加密密钥。

```yaml theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
insights:
  enabled: false

polly:
  enabled: false
```

应用您的 Helm 配置：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
helm upgrade -i langsmith langchain/langsmith --values langsmith_config.yaml --version <version> -n <namespace> --wait --debug
```

当 `engine.enabled` 为 `true` 时，禁用 Insights 不会禁用引擎或删除其共享部署。

## 升级现有配置

本节仅适用于从早期图表版本升级的安装。

当前图表拒绝旧版 `config.insights`、`config.polly` 和 `backend.agentBootstrap` 设置。删除这些设置而不是将它们设置为 `false`。通过 [Support Portal](https://support.langchain.com) 联系技术支持以获取旧部署迁移指南。

从图表 0.16.0 开始，Insights 和 Engine 共享 `langsmith-insights-engine` 映像和部署。这不会启用引擎。将旧版 `insights.apiServer`、`insights.queue`、`insights.postgres`、`insights.redis` 和 `insights.namePrefix` 值移至 `engineInsightsAgent`。将 `insights.enabled` 和 `insights.encryptionKey` 保留在 `insights` 之下。

如果您固定已停用的 `langsmith-clio` 映像，请在升级之前删除或更新该固定。对于私有注册表，镜像`langsmith-insights-engine`。参见[Mirroring images](/langsmith/self-host-mirroring-images#additional-images-for-engine)。

一般升级流程请参见[Upgrade an installation](/langsmith/self-host-upgrades)。

## 另请参阅* [Self-host LangSmith on Kubernetes](/langsmith/kubernetes)
* [Configure model access](/langsmith/model-configurations)
* [Configure additional self-hosted features](/langsmith/self-host-additional-features)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-insights-chat.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>