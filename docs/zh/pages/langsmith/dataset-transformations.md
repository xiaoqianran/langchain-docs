<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Dataset transformations | https://docs.langchain.com/langsmith/dataset-transformations -->

# 数据集转换

LangSmith 允许您将转换附加到数据集架构中的字段，这些字段在将数据添加到数据集之前适用于您的数据，无论是来自 UI、API 还是运行规则。

与 [LangSmith's prebuilt JSON schema types](/langsmith/dataset-json-types) 结合使用，您可以在将数据保存到数据集之前轻松对其进行预处理。

## 转换类型

|转型类型 |目标类型 |功能性|
| ------------------------ | | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ || `remove_system_messages` | `Array[Message]` |过滤消息列表以删除任何系统消息。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               || `convert_to_openai_message` |留言`Array[Message]` |使用langchain的[⟦T7⟧](https://reference.langchain.com/python/langchain_core/utils/#langchain_core.utils.function_calling.convert_to_openai_messages)将任何传入数据从LangChain的内部序列化格式转换为OpenAI的标准消息格式。如果目标字段被标记为必填，并且在输入时没有找到匹配的消息，它将尝试从几种众所周知的 LangSmith 跟踪格式（例如，任何跟踪的 LangChain [⟦T8⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel) run 或从 [LangSmith OpenAI wrapper](/langsmith/annotate-code#use-%40traceable-%2F-traceable) 跟踪的运行）中提取消息（或消息列表），并删除包含该消息的原始密钥。 || `convert_to_openai_tool` | `Array[Tool]` 仅适用于输入字典中的顶级字段。 |使用 langchain 的 [⟦T11⟧](https://reference.langchain.com/python/langchain-core/utils/function_calling/convert_to_openai_tool) 将任何传入数据转换为 OpenAI 标准工具格式 如果存在/在指定键处找不到工具，将从运行的调用参数中提取工具定义。这很有用，因为 LangChain 聊天将工具定义跟踪到运行的 `extra.invocation_params` 字段而不是输入。                                                                                                                                                                                                                                                                                                                                    || `remove_extra_fields` | `Object` |删除此目标对象的架构中未定义的任何字段。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

## 聊天模型预建架构

转换的主要用例是简化将生产跟踪收集到数据集中的格式，该格式可以跨模型提供者标准化，以便在下游评估/少量镜头提示等中使用。为了简化最终用户的转换设置，LangSmith 提供了一个预定义的架构，该架构将执行以下操作：

* 从收集的运行中提取消息并将其转换为 openai 标准格式，这使得它们兼容所有 LangChain ChatModels 和大多数模型提供商的 SDK，用于下游评估和实验
* 提取法学硕士使用的任何工具并将其添加到示例的输入中，以用于下游评估的可重复性

<Check>
  使用我们的聊天模型架构时，想要迭代系统提示的用户通常还会在其输入消息中添加删除系统消息转换，这将阻止您将系统提示保存到数据集。
</Check>

### 兼容性

LLM 运行收集模式旨在从 LangChain [⟦T15⟧](https://reference.langchain.com/python/langchain-core/language_models/chat_models/BaseChatModel) 运行或从 [LangSmith OpenAI wrapper](/langsmith/annotate-code#use-%40traceable-%2F-traceable) 跟踪运行中收集数据。

如果您正在跟踪的 LLM 运行不兼容，请通过 [support.langchain.com](https://support.langchain.com) 联系支持人员，我们可以提供支持。

如果您想将转换应用于其他类型的运行（例如，用消息历史记录表示 LangGraph 状态），请直接定义您的架构并手动添加相关转换。### 启用

将跟踪项目或注释队列中的运行添加到数据集时，如果它具有 LLM 运行类型，我们将默认应用聊天模型架构。

有关新数据集的启用，请参阅我们的[dataset management how-to guide](/langsmith/manage-datasets-in-application)。

### 规格

有关预构建架构的完整 API 规范，请参阅以下部分：

#### 输入模式

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "type": "object",
  "properties": {
    "messages": {
      "type": "array",
      "items": {
        "$ref": "https://api.smith.langchain.com/public/schemas/v1/message.json"
      }
    },
    "tools": {
      "type": "array",
      "items": {
        "$ref": "https://api.smith.langchain.com/public/schemas/v1/tooldef.json"
      }
    }
  },
  "required": ["messages"]
}
```

#### 输出模式

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "type": "object",
  "properties": {
    "message": {
      "$ref": "https://api.smith.langchain.com/public/schemas/v1/message.json"
    }
  },
  "required": ["message"]
}
```

#### 转换

转换如下所示：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
  {
    "path": ["inputs"],
    "transformation_type": "remove_extra_fields"
  },
  {
    "path": ["inputs", "messages"],
    "transformation_type": "convert_to_openai_message"
  },
  {
    "path": ["inputs", "tools"],
    "transformation_type": "convert_to_openai_tool"
  },
  {
    "path": ["outputs"],
    "transformation_type": "remove_extra_fields"
  },
  {
    "path": ["outputs", "message"],
    "transformation_type": "convert_to_openai_message"
  }
]
```

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/dataset-transformations.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>