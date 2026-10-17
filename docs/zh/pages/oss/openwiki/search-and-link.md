<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Search and link wikis | https://docs.langchain.com/oss/openwiki/search-and-link -->

# 搜索并链接 wiki

通过 MCP 搜索 OpenWiki 页面并将相关存储库 wiki 分组到工作区中

OpenWiki 公开了本地只读检索工具，因此编码代理可以回答现有 wiki 中的具体问题，而无需启动生成运行。使用 `openwiki link` 将相关存储库 wiki 分组到指定的工作区中，然后在该工作区中搜索和阅读。

## 搜索并阅读

请您的编码代理在 wiki 中查找问题：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
Search this repository's OpenWiki for how retry handling works, then read the
relevant sections.
```

* **`openwiki_search`**：返回具体问题的紧凑、排名结果
* **`openwiki_read`**：检索您的代理从这些结果中选择的完整部分

指导代理使用检索来解决具体架构或依赖性问题，阅读相关部分，并在落地后停止。检索是可选的上下文，而不是每个任务开始时的例行步骤。这些工具是无模型的：它们不会启动生成运行或进行自己的模型调用。

当存储库链接到工作区时，`openwiki_list_workspaces`和`openwiki_list_wikis`提供发现。工作空间搜索结果识别其供应`wiki`；将该 ID 与结果的页面和部分锚点一起传递给 `openwiki_read`。这些工具随[coding-agent integrations](/oss/openwiki/integrations)一起提供。安装集成后，重新启动主机并要求其搜索 wiki。

## 创建 wiki 工作区

一项服务通常跨越多个存储库。使用 `openwiki link` 将其现有 wiki 分组到指定工作区中，以便您的代理可以在整个服务中进行搜索并阅读任何成员 wiki 中的部分。

从包含存储库的目录启动工作区管理器，例如 `~/dev`：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
cd ~/dev
openwiki link
```

创建一个工作区，例如 `Payments`，然后选择要包含的存储库。成员存储库保留自己的 wiki，可以属于多个工作区，并且不需要共享父目录。查找器将 Git 存储库流式传输到从启动目录开始的可编辑路径下。没有 OpenWiki 文档的存储库呈灰色显示。注册表存储在`~/.openwiki`（或`OPENWIKI_CONFIG_DIR`）下。

### 搜索范围

搜索选择其范围如下：

1. 没有工作空间的 wiki 会自行搜索。
2. 一个工作区中的 wiki 自动搜索该工作区。
3. 多个工作区中的 wiki 使用其活动工作区。
4. 如果它属于多个工作区而没有主动选择，搜索将返回`workspace_required`，并且代理会询问要使用哪个工作区。从存储库内的任何位置设置、检查或清除存储库的持久活动工作区：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki workspace use payments
openwiki workspace current
openwiki workspace clear
```

## 另请参阅

* [Coding-agent integrations](/oss/openwiki/integrations)
* [Code mode](/oss/openwiki/code-mode)
* [CLI reference](/oss/openwiki/cli-reference)
* [Visualize your wiki](/oss/openwiki/visualize)

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/search-and-link.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>