<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Backend integrations | https://docs.langchain.com/oss/javascript/integrations/backends/index -->

# 后端集成

Deep Agents 的文件系统后端。

浏览 Deep Agents 的可用文件系统后端或为生态系统贡献自己的后端。了解有关后端如何在 [backends docs](/oss/javascript/deepagents/backends) 中工作的更多信息。

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

## 所有后端

|后端|描述 |套餐 |来源 |
| - | - | - | - |
| [Azure Blob Backend](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-storage) | Deep Agents `BackendProtocol` 的 Azure Blob 存储实现。将代理工作区文件、内存和工件保留在 Blob 容器中。 | `langchain-azure-storage` | [⟦T2⟧](https://github.com/langchain-ai/langchain-azure/tree/main/libs/azure-storage) |
| [MongoDB VFS Adapter](https://github.com/langchain-ai/langchain-mongodb/tree/main/libs/langchain-mongodb-deepagents-vfs) |由 MongoDB Atlas 支持的虚拟文件系统后端。将代理文件（包括内存、工件和对话历史记录）保留在 MongoDB 集合中。 | `langchain-mongodb-deepagents-vfs` | [⟦T4⟧](https://github.com/langchain-ai/langchain-mongodb/tree/main/libs/langchain-mongodb-deepagents-vfs) |

有后台可以分享吗？ [Open a PR](https://github.com/langchain-ai/docs) 将其添加到此处。

<Info>
  如果您想贡献集成，请参阅[Contributing integrations](/oss/javascript/contributing#add-a-new-integration)。
</Info>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout><Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/integrations/backends/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>