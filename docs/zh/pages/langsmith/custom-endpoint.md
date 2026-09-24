<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Connect to a custom model | https://docs.langchain.com/langsmith/custom-endpoint -->

# Connect to a custom model

The Playground allows you to use your own custom models.您可以部署一个模型服务器，通过 [LangServe](https://github.com/langchain-ai/langserve) 公开模型的 API，[LangServe](https://github.com/langchain-ai/langserve) 是一个用于服务 LangChain 应用程序的开源库。 Behind the scenes, the Playground will interact with your model server to generate responses.

## Deploy a custom model server

For your convenience, we have provided a [sample model server](https://github.com/langchain-ai/langsmith-model-server) that you can use as a reference. We highly recommend using the sample model server as a starting point.

Depending on your model is an instruct-style or chat-style model, you will need to implement either `custom_model.py` or `custom_chat_model.py` respectively.

## Adding configurable fields

It is often useful to configure your model with different parameters. These might include temperature, model\_name, max\_tokens, etc.

To make your model configurable in the Playground, you need to add configurable fields to your model server. These fields can be used to change model parameters from the Playground.

You can add configurable fields by implementing the `with_configurable_fields` function in the `config.py` file.你可以

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

## Use the model in the Playground部署模型服务器后，您可以在 Playground 中使用它。进入 Playground 并为聊天式模型或指令式模型选择 `ChatCustomModel` 或 `CustomModel` 提供程序。

输入`URL`。 Playground 将自动检测可用端点和可配置字段。然后，您可以使用所需的参数调用模型。

![ChatCustomModel in Playground](/langsmith/images/playground-custom-model.png)

如果一切设置正确，您应该在 Playground 中看到模型的响应以及 `with_configurable_fields` 中指定的可配置字段。

有关更多信息，请参阅[how to store your model configuration for later use](/langsmith/managing-model-configurations)。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-endpoint.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>