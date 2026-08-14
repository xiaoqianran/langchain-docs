<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Custom Apps | https://docs.langchain.com/langsmith/custom-apps -->

# 自定义应用程序

构建和部署在 LangSmith 内运行并与 LangSmith API 通信的自定义 UI。

<Note>
  自定义应用程序仅适用于**企业**计划。
</Note>

自定义应用程序是由您构建的自定义 UI，在 LangSmith 内运行并与 LangSmith API 通信。您可以使用自己的编码代理在本地构建应用程序，将其推送到LangSmith，然后您和您的团队就可以在工作区中使用它。

LangSmith UI 不可能是适合每个工作流程的正确形状 - 自定义应用程序是逃生舱口。需要专门构建的注释表面？定制实验比较？仪表板范围仅限于您自己的痕迹？构建一次，推送它，团队中的每个人都可以在 LangSmith 中使用它，而无需建立单独的基础设施。

`langsmith apps init` 在起始代码旁边搭建了一个 `AGENTS.md`，它会提示编码代理提供在第一次传递时生成工作应用程序所需的约定和 API 界面。

## 开始吧

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# 0. Set your credentials
export LANGSMITH_ENDPOINT=<your-langsmith-endpoint>
export LANGSMITH_API_KEY=<your-langsmith-api-key>

# 1. Scaffold a new app
langsmith apps init --name my-annotation-view --template annotation-queue

# 2. Iterate locally — the app runs in a live sandbox connected to LangSmith
cd my-annotation-view
langsmith apps dev

# 3. Push to LangSmith when ready
langsmith apps push

# 4. Open it — the app is now available to your whole team under Custom Apps in the LangSmith sidebar
```

## CLI 参考|命令|它有什么作用 |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `langsmith apps init --name NAME [--template annotation-queue\|annotation-queue-grid\|coding-agent-dashboard\|experiment-comparison]` |将入门应用程序放在以应用程序命名的新目录中。     |
| `langsmith apps dev` |在真实沙箱中本地运行当前目录的应用程序。         |
| `langsmith apps push` |将当前目录上传为自定义应用程序（创建或更新）。 |
| `langsmith apps pull APP_ID_OR_NAME` |将应用程序的源下载到新目录中。                     || `langsmith apps list` |列出自定义应用程序。                                                  |
| `langsmith apps delete APP_ID_OR_NAME` |按 ID 或名称删除应用程序。                                       |

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/custom-apps.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>