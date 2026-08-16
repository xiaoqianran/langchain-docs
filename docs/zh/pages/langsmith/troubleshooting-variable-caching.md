<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Troubleshoot variable caching | https://docs.langchain.com/langsmith/troubleshooting-variable-caching -->

# 解决变量缓存问题

如果您在跟踪项目中没有看到跟踪或注意到记录到错误的项目/工作空间的跟踪，则问题可能是由于 LangSmith 的默认环境变量缓存造成的。在 Jupyter 笔记本中运行 LangSmith 时，这种情况尤其常见。请按照以下步骤诊断并解决问题：

## 1. 验证您的环境变量

首先，通过运行以下命令检查环境变量是否设置正确：

```python
import os
print(os.getenv("LANGSMITH_PROJECT"))
print(os.getenv("LANGSMITH_TRACING"))
print(os.getenv("LANGSMITH_ENDPOINT"))
print(os.getenv("LANGSMITH_API_KEY"))
```

如果输出与 .env 文件中定义的内容不匹配，则可能是由于环境变量缓存所致。

## 2.清除缓存

使用以下命令清除缓存的环境变量：

```python
utils.get_env_var.cache_clear()
```

## 3.重新加载环境变量

通过执行以下命令从 .env 文件重新加载环境变量：

```python
from dotenv import load_dotenv
import os
load_dotenv(<path to .env file>, override=True)
```

重新加载后，您的环境变量应该设置正确。

如果您仍然遇到问题，请通过共享 Slack 渠道或电子邮件支持（适用于 Plus 和 Enterprise 计划）或通过 [LangChain Forum](https://forum.langchain.com/) 与我们联系。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/troubleshooting-variable-caching.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>