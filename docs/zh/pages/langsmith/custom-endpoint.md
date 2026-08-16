<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to a custom model | https://docs.langchain.com/langsmith/custom-endpoint -->

# 连接到自定义模型

Playground 允许您使用自己的自定义模型。您可以部署一个模型服务器，通过 [LangServe](https://github.com/langchain-ai/langserve) 公开模型的 API，[LangServe](https://github.com/langchain-ai/langserve) 是一个用于服务 LangChain 应用程序的开源库。在幕后，Playground 将与您的模型服务器交互以生成响应。

## 部署自定义模型服务器

为了您的方便，我们提供了[sample model server](https://github.com/langchain-ai/langsmith-model-server)供您参考。我们强烈建议使用示例模型服务器作为起点。

根据您的模型是指令风格还是聊天风格模型，您将需要分别实现`custom_model.py`或`custom_chat_model.py`。

## 添加可配置字段

使用不同的参数配置模型通常很有用。这些可能包括温度、型号\_名称、最大\_令牌等。

要使您的模型在 Playground 中可配置，您需要将可配置字段添加到模型服务器。这些字段可用于更改 Playground 中的模型参数。

您可以通过在 `config.py` 文件中实现 `with_configurable_fields` 函数来添加可配置字段。你可以

```python
def with_configurable_fields(self) -> Runnable:
    """Expose fields you want to be configurable in the Playground. We will automatically expose these to the
    Playground. If you don't want to expose any fields, you can remove this method."""
    return self.configurable_fields(n=ConfigurableField(
        id="n",
        name="Num Characters",
        description="Number of characters to return from the input prompt.",
    ))
```

## 在 Playground 中使用模型部署模型服务器后，您可以在 Playground 中使用它。进入 Playground 并为聊天式模型或指令式模型选择 `ChatCustomModel` 或 `CustomModel` 提供程序。

输入`URL`。 Playground 将自动检测可用端点和可配置字段。然后，您可以使用所需的参数调用模型。

![ChatCustomModel in Playground](/langsmith/images/playground-custom-model.png)

如果一切设置正确，您应该在 Playground 中看到模型的响应以及 `with_configurable_fields` 中指定的可配置字段。

有关更多信息，请参阅[how to store your model configuration for later use](/langsmith/managing-model-configurations)。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-endpoint.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>