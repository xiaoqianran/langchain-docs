<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom output rendering | https://docs.langchain.com/langsmith/custom-output-rendering -->

# 自定义输出渲染

Custom output rendering allows you to visualize run outputs and dataset reference outputs using your own custom HTML pages.这对于以下情况特别有用：

* **Domain-specific formatting**: Display medical records, legal documents, or other specialized data types in their native format.
* **Custom visualizations**: Create charts, graphs, or diagrams from numeric or structured output data.

在此页面中，您将学习如何：

* **[Configure custom rendering](#configure-custom-output-rendering)** 在 LangSmith UI 中。
* **[Build a custom renderer](#build-a-custom-renderer)** 显示输出数据。
* **[Understand where custom rendering appears](#where-custom-rendering-appears)** 在 LangSmith。

## 配置自定义输出渲染

在两个级别配置自定义渲染：

* **对于数据集**：将自定义渲染应用于与该数据集关联的所有运行，无论它们出现在实验、运行详细信息窗格或注释队列中。
* **对于注释队列**：将自定义渲染应用于特定注释队列中的所有运行，无论它们来自哪个数据集。 This takes precedence over dataset-level configuration.

### 用于跟踪项目

To configure custom output rendering for a tracing project:

![Tracing project settings showing custom output rendering configuration](https://mintcdn.com/langchain-5e9cc07a/oyRHf9tRXOU-EPbv/langsmith/images/tracing-project-custom-output-rendering-settings.png?fit=max\&auto=format\&n=oyRHf9tRXOU-EPbv\&q=85\&s=034f982fa3174c1649e5188bbb11ca03)1. 导航到 **跟踪项目** 页面。
2. 单击现有跟踪项目或创建一个新项目。
3. 在编辑跟踪项目窗格中，滚动到 **自定义输出渲染** 部分。
4. 切换**启用自定义输出渲染**。
5. 在 **URL** 字段中输入网页 URL。
6. 单击“**保存**”。

### 对于数据集

要为数据集配置自定义输出呈现：

![Dataset page with three-dot menu showing Custom Output Rendering option](https://mintcdn.com/langchain-5e9cc07a/l7rhdSRpjWBkaCke/langsmith/images/custom-output-rendering-menu.png?fit=max\&auto=format\&n=l7rhdSRpjWBkaCke\&q=85\&s=7daf042ebae80eec20cd90a25c1d6087)

1. 导航到 **数据集和实验** 页面中的数据集。
2. 单击右上角的**⋮**（三点菜单）。
3. 选择**自定义输出渲染**。
4. 切换**启用自定义输出渲染**。
5. 在 **URL** 字段中输入网页 URL。
6. 单击“**保存**”。

![Custom Output Rendering modal with fields filled in](https://mintcdn.com/langchain-5e9cc07a/l7rhdSRpjWBkaCke/langsmith/images/custom-output-rendering-modal.png?fit=max\&auto=format\&n=l7rhdSRpjWBkaCke\&q=85\&s=bffd3b40ca14bbebc05c998d1cb5fa7e)

### 对于注释队列

要为注释队列配置自定义输出渲染：

![Annotation queue settings showing custom output rendering configuration](https://mintcdn.com/langchain-5e9cc07a/optUJrLvYf4z4j5I/langsmith/images/annotation-queue-custom-output-rendering-settings.png?fit=max\&auto=format\&n=optUJrLvYf4z4j5I\&q=85\&s=579aad04fa6990b220514280eef799f4)

1. 导航到 **注释队列** 页面。
2. 单击现有注释队列或创建一个新注释队列。
3. 在注释队列设置窗格中，滚动到 **自定义输出渲染** 部分。
4. 切换**启用自定义输出渲染**。
5. 在 **URL** 字段中输入网页 URL。
6. 单击“**保存**”或“**创建**”。> [!注意]
>
> 当自定义渲染设置应用于多个级别时，优先级如下：注释队列 > 数据集 > 跟踪项目。

## 构建自定义渲染器

### 了解消息格式

您的 HTML 页面将通过 [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) 接收输出数据。 LangSmith 发送具有以下结构的消息：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  type: "output" | "reference",
  data: {
    // The outputs (actual output or reference output)
    // Structure varies based on your application
  },
  metadata: {
    inputs: {
      // The inputs that generated this output
      // Structure varies based on your application
    }
  }
}
```

* `type`：指示这是实际输出（`"output"`）还是参考输出（`"reference"`）。
* `data`：输出数据本身。
* `metadata.inputs`：生成此输出的输入数据，为上下文提供。

> [!注意]
>
> **消息传递时机**：LangSmith使用指数退避重试机制来确保您的页面即使加载缓慢也能收到数据。消息最多发送 6 次，延迟逐渐增加（100ms、200ms、400ms、800ms、1600ms、3200ms）。

### 示例实现

此示例侦听传入的 postMessage 事件并将它们显示在页面上。每条消息都编号并格式化为 JSON，从而可以轻松检查 LangSmith 发送到渲染器的数据结构。

```html theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>PostMessage Echo</title>
        <link rel="stylesheet" href="https://unpkg.com/sakura.css/css/sakura.css" />
    </head>
    <body>
        <h1>PostMessage Messages</h1>
        <div id="messages"></div>
        <script>
            let count = 0;
            window.addEventListener("message", (event) => {
                count++;
                const header = document.createElement("h3");
                header.appendChild(document.createTextNode(`Message ${count}`));
                const code = document.createElement("code");
                code.appendChild(document.createTextNode(JSON.stringify(event.data, null, 2)));
                const pre = document.createElement("pre");
                pre.appendChild(code);
                document.getElementById("messages").appendChild(header);
                document.getElementById("messages").appendChild(pre);
            });
        </script>
    </body>
</html>
```

## 自定义渲染出现的位置

启用后，您的自定义渲染将替换以下位置的默认输出视图：* **实验比较视图**：比较多个实验的输出时：

![Experiment comparison view showing custom rendering](https://mintcdn.com/langchain-5e9cc07a/l7rhdSRpjWBkaCke/langsmith/images/custom-output-rendering-experiment-comparison.png?fit=max\&auto=format\&n=l7rhdSRpjWBkaCke\&q=85\&s=6f1fd9d3ca4be55aa9a0b40140771e08)

* **运行详细信息窗格**：查看与数据集关联的运行时：

![Run detail pane showing custom rendering](https://mintcdn.com/langchain-5e9cc07a/l7rhdSRpjWBkaCke/langsmith/images/custom-output-rendering-run-details.png?fit=max\&auto=format\&n=l7rhdSRpjWBkaCke\&q=85\&s=abec759e27bb3dfa827354d13746cf61)

* **注释队列**：检查注释队列中的运行时：

![Annotation queue showing custom rendering](https://mintcdn.com/langchain-5e9cc07a/l7rhdSRpjWBkaCke/langsmith/images/custom-output-rendering-annotation-queue.png?fit=max\&auto=format\&n=l7rhdSRpjWBkaCke\&q=85\&s=8d1b66541ea7dcd0246354fca1568719)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-output-rendering.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。