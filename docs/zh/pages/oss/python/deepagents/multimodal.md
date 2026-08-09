<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Multimodal inputs and outputs | https://docs.langchain.com/oss/python/deepagents/multimodal -->

# 多模式输入和输出

当您的模型支持多模式输入和工具结果时，将图像、音频、视频和文档与 Deep Agent 结合使用

当您使用接受多模式输入和工具结果或返回多模式输出的[Large Language Model](/oss/python/integrations/chat)时，Deep Agents 支持多模式工作流程。您可以将图像和其他媒体附加到用户消息中，使用内置 `read_file` 工具读取非文本文件，并从自定义工具返回多模式内容。

内置[context compression](/oss/python/deepagents/context-engineering#context-compression)主要是面向文本的。相应地规划多模式工作负载：在后端存储大型媒体并在可能的情况下传递引用。

## 多模式用户输入

将您发送给代理的`messages`中的多模式内容传递给代理，使用与LangChain聊天模型相同的[standard content blocks](/oss/python/langchain/messages#standard-content-blocks)：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
result = agent.invoke({
    "messages": [{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is in this screenshot?"},
            {"type": "image", "url": "https://example.com/screenshot.png"},
        ],
    }],
})
```

有关块类型、提供商特定要求以及其他示例（PDF、音频、视频），请参阅[Multimodal messages](/oss/python/langchain/messages#multimodal)。

## 内置`read_file`工具

对于受支持的多模式文件，harness `read_file` 工具会返回 [standard content blocks](/oss/python/langchain/messages#standard-content-blocks)，而不是纯文本。当所选模型支持相应的模态时，代理可以检查存储在其[filesystem](/oss/python/deepagents/overview#virtual-filesystem-access)中的图像、文档和媒体。检查提供商的文档以了解您的模型支持的 MIME 类型。<Accordion title="Supported multimodal file extensions">
  |类型 |扩展 |
  | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
  | [Image](/oss/python/langchain/messages#multimodal) | `.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.heic`、`.heif` |
  | [Video](/oss/python/langchain/messages#multimodal) | `.mp4`、`.mpeg`、`.mov`、`.avi`、`.flv`、`.mpg`、`.webm`、`.wmv`、`.3gpp` |
  | [Audio](/oss/python/langchain/messages#multimodal) | `.wav`、`.mp3`、`.aiff`、`.aac`、`.ogg`、`.flac` |
  | [File](/oss/python/langchain/messages#multimodal) | `.pdf`、`.ppt`、`.pptx` |
</Accordion>

## 自定义工具输出

[Custom tools](/oss/python/deepagents/tools#custom-tools)可以包含多模式文件，例如图像：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain.tools import tool


@tool
def capture_screenshot() -> list[dict]:
    """Capture a screenshot of the current page."""
    return [
        {"type": "text", "text": "Screenshot of the current page:"},
        {"type": "image", "url": "https://example.com/page.png"},
    ]
```

返回值将转换为模型在下一回合读取的`ToolMessage`。使用结果消息上的`content_blocks`访问标准化表示。有关返回类型选项、序列化行为和 MCP 示例，请参阅 [Tool return values](/oss/python/langchain/tools#tool-return-values) 和 [Multimodal tool content](/oss/python/langchain/mcp#multimodal-tool-content)。

<Tip>
  当工具生成图像或其他大型二进制数据时，将工件保存到 [backend](/oss/python/deepagents/backends) 并返回简洁的文本描述以及路径或 URL。这可以使消息历史记录更小，并且与 [context compression](/oss/python/deepagents/context-engineering#context-compression) 配合使用效果更好。
</Tip>

## 上下文压缩和多模式内容内置卸载和摘要针对文本和消息历史记录进行了优化：

* **卸载** 仅测量文本标记。非文本块（包括图像）保留在替换消息中而不是压缩。仅包含图像的消息不会仅根据图像大小进行卸载。
* **摘要** 将旧消息压缩为纯文本摘要。该范围内的图像、音频、视频和文件块不会被继承——模型只能看到摘要器写的关于它们的内容。最近低于保持阈值的消息保持不变。

  当摘要运行时，旧回合中的媒体块会从活动上下文中删除：

  ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  # Before — model receives image blocks in older turns
  [
      HumanMessage(
          content=[
              {"type": "text", "text": "What trends do you see in this chart?"},
              {"type": "image", "base64": IMG, "mime_type": "image/png"},
          ]
      ),
      ToolMessage(
          content=[
              {"type": "text", "text": "Updated chart:"},
              {"type": "image", "base64": IMG, "mime_type": "image/png"},
          ],
          tool_call_id="call_chart_1",
      ),
      AIMessage(content="Revenue rose in Q3 based on the chart trend."),
      HumanMessage(content="Reply with one sentence summarizing our analysis."),
  ]

  # After — those turns collapse to text; image blocks are gone
  {"content": (
      "User asked about trends in a chart screenshot. "
      "Tool returned an updated chart. Agent identified Q3 revenue growth."
  )}
  ```

  原始对话仍以文本形式写入文件系统。请参阅[Summarization](/oss/python/deepagents/context-engineering#summarization)了解触发器、保持阈值和完整流程。

对于多模式繁重的工作负载：* 将图像、屏幕截图和图表存储在文件系统后端或外部对象存储中，然后通过消息传递文件路径或 URL。
* 在长时间运行的对话中，优先使用引用而不是 base64 编码的图像块。
* 使用 [subagents](/oss/python/deepagents/subagents) 进行图像密集型检查，以便主代理收到紧凑的文本结果。
* 当您的提供商对图像收取大量令牌时，调整摘要阈值或提供自定义令牌计数器。

有关卸载阈值、汇总触发器和自定义选项，请参阅[Context compression](/oss/python/deepagents/context-engineering#context-compression)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/multimodal.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>