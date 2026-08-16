<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: How to customize the Dockerfile | https://docs.langchain.com/langsmith/custom-docker -->

# 如何自定义 Dockerfile

用户可以在从父 LangGraph 映像导入后添加一系列附加行以添加到 Dockerfile 中。为此，您只需将要运行的命令传递给 `dockerfile_lines` 键来修改 `langgraph.json` 文件。例如，如果我们想在图表中使用`Pillow`，则需要添加以下依赖项：

```
{
    "dependencies": ["."],
    "graphs": {
        "openai_agent": "./openai_agent.py:agent",
    },
    "env": "./.env",
    "dockerfile_lines": [
        "RUN apt-get update && apt-get install -y libjpeg-dev zlib1g-dev libpng-dev",
        "RUN pip install Pillow"
    ]
}
```

如果我们使用 `jpeg` 或 `png` 图像格式，这将安装使用 Pillow 所需的系统软件包。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-docker.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>