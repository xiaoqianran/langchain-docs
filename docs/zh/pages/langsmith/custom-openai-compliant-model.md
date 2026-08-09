<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to an OpenAI compliant model provider/proxy | https://docs.langchain.com/langsmith/custom-openai-compliant-model -->

# 连接到符合 OpenAI 标准的模型提供者/代理

Playground 允许您使用任何符合 OpenAI API 的模型。您可以通过在 Playground 中设置代理提供程序来使用您的模型。

## 部署 OpenAI 兼容模型

许多提供商提供 OpenAI 兼容模型或代理服务。这方面的一些例子包括：

* [LiteLLM Proxy](https://github.com/BerriAI/litellm?tab=readme-ov-file#quick-start-proxy---cli)
* [Ollama](https://ollama.com/)

您可以使用这些提供程序来部署您的模型并获取与 OpenAI API 兼容的 API 端点。

请查看完整的 [specification](https://platform.openai.com/docs/api-reference/chat) 了解更多信息。

## 在 Playground 中使用模型

部署模型服务器后，您可以在[Playground](/langsmith/prompt-engineering-concepts#playground)中使用它。

要访问 **提示设置** 菜单：

1. 在 **提示** 标题下，选择型号名称旁边的齿轮 <Icon icon="settings" /> 图标。
2. 在 **模型配置** 选项卡中，从下拉列表中选择要编辑的模型。
3. 对于 **Provider** 下拉列表，选择 **OpenAI Compatible Endpoint**。
4. 将您的 OpenAI 兼容端点添加到 **Base URL** 输入。示例请参见[Base URL format](#base-url-format)。

   <div>
     <img alt="Model Configuration window in the LangSmith UI with a model selected and the Provider dropdown with OpenAI Compatible Endpoint selected." />

     <img alt="Model Configuration window in the LangSmith UI with a model selected and the Provider dropdown with OpenAI Compatible Endpoint selected." />
   </div>如果一切设置正确，您应该在 Playground 中看到模型的响应。您还可以使用此功能来调用下游管道。

有关如何存储模型配置的信息，请参阅[Configure prompt settings](/langsmith/managing-model-configurations)。

如果您的 OpenAI 兼容端点位于 OAuth2 网关后面，请将 OAuth `client_credentials` 存储在模型配置上，而不是将静态 API 密钥作为工作区机密进行分发。参见[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)。

## 基本 URL 格式

**基本 URL** 应指向 OpenAI 兼容 API 服务器的根目录。
LangSmith 自动附加 `/chat/completions` — 不要将其包含在基本 URL 中。

### 基本 URL 示例

|供应商|示例基本 URL |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| [Ollama](https://ollama.com/)（本地）| `http://localhost:11434/v1` |
| [LiteLLM Proxy](https://github.com/BerriAI/litellm)（本地）| `http://localhost:4000` |
| [vLLM](https://docs.vllm.ai/)（本地）| `http://localhost:8000/v1` |
|自托管（远程）| `https://my-model-server.example.com/v1` |

支持自定义路径前缀。如果您的服务器在`/api/v2/chat/completions`公开完成，
将基本 URL 设置为 `https://my-server.example.com/api/v2`。

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-openai-compliant-model.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>