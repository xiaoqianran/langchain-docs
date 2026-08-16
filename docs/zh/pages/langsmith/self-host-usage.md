<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Interact with your self-hosted instance of LangSmith | https://docs.langchain.com/langsmith/self-host-usage -->

# 与您的自托管实例 LangSmith 交互

本指南将引导您完成使用自托管实例 LangSmith 的过程。

<Info>
本指南假设您已经部署了自托管 LangSmith 实例。如果还没有，请参阅[kubernetes deployment guide](/langsmith/kubernetes)。
</Info>

### 配置您想要与 LangSmith 一起使用的应用程序

LangSmith 有一个 API 可与集线器和 LangSmith 后端进行交互。

1. 部署实例后，您可以在 `http(s)://<host>` 访问 LangSmith UI。
2. LangSmith API将于`http(s)://<host>/api/v1`上线
3. LangSmith控制平面将于`http(s)://<host>/api-host`上线

要使用实例的 API，您需要在应用程序中设置以下环境变量：

```bash
LANGSMITH_ENDPOINT=http://<host>/api/v1
LANGSMITH_API_KEY=foo # Set to a legitimate API key if using OAuth
```

您也可以直接在LangSmith SDK客户端中配置这些变量：

```python
import langsmith
langsmith_client = langsmith.Client(
    api_key='<api_key>',
    api_url='http(s)://<host>/api/v1',
)
```

设置上述内容后，您应该能够运行代码并在自托管实例中查看结果。我们建议运行[*quickstart guide*](https://docs.smith.langchain.com/#quick-start)来感受如何使用LangSmith。

### 自签名证书如果您对自托管 LangSmith 实例使用自签名证书，这可能会出现问题，因为 Python 附带了自己的一组受信任证书，其中可能不包括您的自签名证书。要解决此问题，您可能需要使用类似 `truststore` 的工具将系统证书加载到您的 Python 环境中。

你可以这样做：

1. pip install truststore（或类似的命令，具体取决于您使用的包管理器）

然后使用以下代码加载系统证书：

```python
import truststore
truststore.inject_into_ssl()
# The rest of your code
import langsmith
langsmith_client = langsmith.Client(
    api_key='<api_key>',
    api_url='http(s)://<host>/api/v1',
)
```

---

## API 参考

要访问 API 参考，请在浏览器中导航至 `http://<host>/api/docs`。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-usage.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>