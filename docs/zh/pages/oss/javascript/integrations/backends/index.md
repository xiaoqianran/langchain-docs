<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Backend integrations | https://docs.langchain.com/oss/javascript/integrations/backends/index -->

# 后端集成

社区为 Deep Agents 构建的文件系统后端。

浏览 Deep Agents 的可用文件系统后端或为生态系统贡献您自己的后端。了解有关后端如何在 [backends docs](/oss/javascript/deepagents/backends) 中工作的更多信息。

## 分享你的后端

自定义后端将Deep Agents连接到数据库、对象存储和虚拟文件系统等存储系统。与社区分享您的：

<CardGroup>
  <Card title="Implement a custom backend" icon="database" href="/oss/javascript/deepagents/backends#custom-backends">
    按照自定义后端指南构建您自己的后端。
  </Card>

  <Card title="Share a community backend" icon="users" href="https://github.com/langchain-ai/docs">
    打开文档存储库的 PR，将您的后端添加到下表中。
  </Card>
</CardGroup>

## 社区整合

<Note>
  社区维护这些后端集成。它们是在开源基础上贡献的，不由 LangChain 管理或维护。
</Note>|后端|描述 |来源 |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MongoDB VFS Adapter](https://github.com/mongodb-developer/MongoDB-LangChain-DeepAgents-VFS-Adapter) |由 MongoDB Atlas 支持的虚拟文件系统后端。将代理文件（包括内存、工件和对话历史记录）保留在 MongoDB 集合中。 | [⟦T0⟧](https://github.com/mongodb-developer/MongoDB-LangChain-DeepAgents-VFS-Adapter) |

有后台可以分享吗？ [Open a PR](https://github.com/langchain-ai/docs) 将其添加到此处。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/integrations/backends/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>