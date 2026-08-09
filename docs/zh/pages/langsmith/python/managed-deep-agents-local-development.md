<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Develop locally with LangSmith Studio | https://docs.langchain.com/langsmith/python/managed-deep-agents-local-development -->

# 使用 LangSmith Studio 进行本地开发

使用 mda dev 和 LangSmith Studio 在本地运行和测试托管深度代理。

`mda dev` 编译托管深度代理项目并在本地代理服务器上运行它。它会打开 [LangSmith Studio](/langsmith/studio)，以便您可以在部署之前与代理交互并检查其行为。

<Note>
  托管深度代理在 **公共 [beta](/langsmith/release-stages)** 中提供，并且仅在美国地区的 [LangSmith Cloud](/langsmith/cloud) 上可用。
</Note>

## 启动本地工作室

安装项目依赖项并将模型提供程序凭据添加到 `.env`。

Python 项目还需要 [⟦T3⟧](https://docs.astral.sh/uv/)。

从项目根目录运行：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
mda dev .
```

CLI 打印本地服务器和 Studio URL 并在浏览器中打开 Studio。在 Studio 中发送消息以检查模型响应、工具调用、状态和中断。

更改项目文件后，停止并重新运行`mda dev`以重新编译项目。

## `mda dev` 的作用

`mda dev`：

1. 验证项目并将其编译为`.mda/build`。
2. 将项目`.env`复制到本地构建中，并在需要时添加仅限本地的身份配置。
3. 创建本地 Context Hub 模拟以获取说明、技能和记忆。
4. 启动特定语言的 LangGraph 开发服务器。
5. 在 Studio 中打开代理。本地开发不会创建或更新托管部署。

## 配置本地服务器

|旗帜|使用 |
| -------------------- | ------------------------------------------------------ |
| `--port PORT` |设置本地服务器端口。                             |
| `--hostname HOSTNAME` |设置服务器侦听的主机名。          |
| `--no-browser` |启动服务器而不自动打开 Studio。 |
| `--no-reload` |禁用 LangGraph 开发服务器的热重载。 |

有关所有命令的详细信息，请参阅[⟦T13⟧ CLI reference](/langsmith/python/managed-deep-agents-cli#develop-locally)。

## 了解当地行为

`mda dev` 使用本地默认值使测试更容易：

* 如果代理使用身份，Studio 会自动提供本地测试用户。
* 如果配置的沙箱不可用，代理将使用临时本地文件夹。 CLI 打印文件夹路径。

这些默认值与部署的代理不同。在生产中使用代理之前，请在开发部署中测试身份和沙箱行为。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/managed-deep-agents-local-development.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>