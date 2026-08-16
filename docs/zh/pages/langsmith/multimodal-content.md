<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Include multimodal content in a prompt | https://docs.langchain.com/langsmith/multimodal-content -->

# 在提示中包含多模式内容

一些应用程序基于多模式内容，例如可以回答有关 PDF 或图像问题的聊天机器人。在这些情况下，您需要在提示中包含多模式内容并测试模型回答有关内容的问题的能力。

Playground 支持两种将多模式内容合并到提示中的方法：

1. 内联内容：直接在提示中嵌入静态文件（图像、PDF、音频）。当您希望在提示的所有使用中一致地包含相同的多模式内容时，这是理想的选择。例如，您可以添加一个参考图像来帮助确定模型的响应。

2. 模板变量：为附件创建动态占位符，每次可以填充不同的内容。这种方法提供了更大的灵活性，使您能够：

   * 测试模型如何处理不同的输入
   * 创建适用于不同内容的可重复使用的提示

<Note>
并非所有模型都支持多模式内容。在 Playground 中使用多模式功能之前，请确保您选择的模型支持您要使用的文件类型。
</Note>

## 内嵌内容单击消息中要添加多模式内容的文件图标。在 `Upload content` 选项卡下，您可以上传文件并将其内嵌在提示中。

![Upload inline multimodal content](/langsmith/images/upload-inline-multimodal-content.png)

## 模板变量

单击消息中要添加多模式内容的文件图标。在 `Template variables` 选项卡下，您可以为特定附件类型创建模板变量。目前仅支持图像、PDF 和音频文件（.wav、.mp3）。

![Template variable multimodal content](/langsmith/images/template-variable-multimodal-content.png)

## 填充模板变量

添加模板变量后，您可以使用屏幕右侧的面板为其提供内容。只需单击 `+` 按钮即可上传或选择将用于填充模板变量的内容。

![Manual prompt multimodal](/langsmith/images/manual-prompt-multimodal.png)

## 运行评估

手动测试提示后，您可以 [run an evaluation](/langsmith/evaluate-with-attachments?mode=ui) 查看提示在黄金示例数据集上的执行情况。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/multimodal-content.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>