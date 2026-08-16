<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure run input and output preview | https://docs.langchain.com/langsmith/configure-input-output-preview -->

# 配置运行输入和输出预览

默认情况下，LangSmith 使用启发式方法来确定在 **Runs** 表的 **Input** 和 **Output** 列中显示的内容。但是，您可以通过为特定跟踪类型配置自定义预览路径来准确自定义这些列中显示的内容。

这在以下情况下特别有用：

- 您的痕迹具有深层嵌套的结构。
- 您想要关注数据中的特定字段。
- 默认启发式不会显示与您的用例最相关的信息。

## 在UI中配置预览格式

### 访问预览设置

1. 导航到项目中的跟踪。
1. 选择 **运行** 选项卡。
1. 找到运行表右上角的格式图标 <Icon icon="adjustments-horizontal" />。
1. 在 **配置输入和输出预览** 侧窗口中，从下拉列表中选择跟踪名称。


当您选择跟踪名称时，LangSmith 加载成功的跟踪示例并将其结构呈现为可扩展树。树中的每个节点代表数据中的一个字段，显示：- 字段名称（例如，LLM 对话历史记录的`messages`、`output`、`metadata`）。
- 数组索引（例如，最后一项为 [0]、[1]、[-1]）。
- 数组的项目计数（例如，(3) 表示 3 个项目）。
- 预览内联显示的字符串和数字的值。

<img
className="block dark:hidden"
src="/langsmith/images/configure-preview.png"
alt="Configure Input and Output previews side panel showing the tree view of trace data structure"
/>

<img
className="hidden dark:block"
src="/langsmith/images/configure-preview-dark.png"
alt="Configure Input and Output previews side panel showing the tree view of trace data structure"
/>

### 设置路径

1. 选择 **输入** 或 **输出** 选项卡。然后，要么：
    - 下拉菜单直接指定应在预览中显示的输入数据的路径。
    - 示例跟踪数据结构的交互式树视图，您可以浏览并选择要显示的确切字段。

    要选择一个字段：

    1. 通过单击箭头图标 (▶) 浏览树以展开或折叠嵌套对象和数组。
    1. 单击要在预览中显示的字段旁边的复选框。所选路径出现在树前面的文本输入中。

    当您选择复选框时，系统会使用正确的语法自动构建路径（例如 messages[-1].content）。|方法|最适合 |示例|
| ---| ---| ---|
|树种选择|探索不熟悉的数据结构，查看样本值 |点击：消息 → [-1] → 内容 |
|手动打字 |当您确切知道自己想要什么时，深度路径会更快 |类型：output.data.results[0].answer |

超过 3 个项目的数组会自动压缩，以防止出现过多的视图：

```
☐ messages (15)
  ☐ [0]
  ☐ [1]
  ... (click to expand all 15 items)
```

单击 **...** 按钮展开并查看所有数组项。

## 示例

例如，您的跟踪输入是这样的：

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "What is the weather today?"}
  ],
  "metadata": {
    "user_id": "user123",
    "session_id": "sess456"
  }
}
```

在此示例中，`messages`是一个消息对象数组，每个消息对象都有一个`role`（例如`system`或`user`）和一个`content`字段。

显示用户的问题：

1. 展开 **messages** 节点（显示数组项）。
1. 展开`[1]`（第二条消息，即用户消息）。
1. 单击**内容**旁边的复选框。
1. 输入栏显示：`messages[1].content`。

或者，对最后一条消息使用负索引：

1. 展开**消息**。
1. 展开`[-1]`。
1. 单击**内容**。
1. 结果：`messages[-1].content`（始终显示最后一条消息）。

<Note>
如果您在树中看到`"No paths available"`：- 确保您在过去 7 天内至少有一个具有所选跟踪名称的成功跟踪。
- 跟踪必须在您配置的输入/输出字段中包含数据。
- 如果需要，尝试发送测试跟踪。
</Note>

## 后续步骤

- 了解更多关于[viewing and filtering traces](/langsmith/filter-traces-in-application)的信息。
- 探索[custom output rendering](/langsmith/custom-output-rendering)以实现高级可视化。
- 设置[metadata and tags](/langsmith/add-metadata-tags)来整理您的踪迹。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/configure-input-output-preview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>