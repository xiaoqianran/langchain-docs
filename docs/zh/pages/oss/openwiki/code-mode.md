<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Code mode | https://docs.langchain.com/oss/openwiki/code-mode -->

# 代码模式

使用 OpenWiki 生成和维护编码代理的存储库文档

代码模式在 `openwiki/` 中构建了一个存储库 wiki，其中包含架构、集成和工作流程等持久细节。编码代理使用该 wiki 作为上下文，以便它们可以更有效地在包中工作，减少重新发现和更少的标记。人类可以阅读相同的 Markdown，但代理是主要受众。代理通过 OpenWiki 添加到 `AGENTS.md` 和 `CLAUDE.md` 的指针发现 wiki。

`openwiki`、`openwiki --init` 和 `openwiki --update` 在代码模式下运行。您还可以显式传递模式：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki code --init
openwiki code --update
openwiki code --update --print
```

## 代码模式产生什么

成功初始化或更新后，存储库通常包括：* **`openwiki/`**：生成的 Markdown wiki（快速入门、架构、操作和相关主题）
* **`openwiki/INSTRUCTIONS.md`**：用户撰写的范围和优先级简介。 OpenWiki 在初始化和更新时读取它。自己编辑，或者在聊天中要求 OpenWiki 更改；正常的`--init`和`--update`运行不会重写它
* **`openwiki/.last-update.json`**：最后一次成功的文档更改的元数据（用于避免无操作更新循环）
* **`AGENTS.md` / `CLAUDE.md`**：OpenWiki 插入或刷新 `<!-- OPENWIKI:START -->` … `<!-- OPENWIKI:END -->` 块，告诉编码代理何时查阅 wiki。该块之外的现有内容保持不变

## 降价输出

OpenWiki 的持久输出是 Markdown (OKF)，而不是静态 HTML 站点。要在浏览器中浏览 wiki，请运行 [⟦T19⟧](/oss/openwiki/visualize)。该命令仅为本地计算机上的查看器提供服务 (`127.0.0.1`)。要托管人类可读的网站，请使用其他工具（例如 GitHub Pages、MkDocs 或与 OKF 兼容的查看器）呈现 Markdown。

## 开放知识格式

OpenWiki 在代码和个人模式下发布 [Google Open Knowledge Format (OKF)](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) v0.1 包：* **概念** 是一个普通的 wiki Markdown 页面（一个主题文件）。每个概念都有 YAML 前面的内容和非空 `type`；其他标准字段是可选的
* `index.md`和`log.md`是**保留**脚手架文件，不是概念：`index.md`是目录列表，`log.md`是更新历史记录。嵌套索引不包含前项，而根索引声明 `okf_version: "0.1"`
* 在更新和迁移期间接受并保留有效的`timestamp`值和生产者定义的扩展字段
* 概念文档之间的标准 Markdown 链接表达了关系

## 忽略路径

在存储库根目录中创建一个 `.openwikiignore` 文件，以防止生成的文档读取或描述私有、生成或不相关的路径。该语法支持注释、空行、`*`和`**`通配符、目录规则和`!`否定：

```txt theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
secrets/
*.log
!logs/keep.log
```

当 `.openwikiignore` 具有活动规则时，OpenWiki 会过滤文件系统发现并限制 shell 执行，以便忽略的路径不会运行。<Note>
  这是一个读取边界：忽略的路径永远不会在生成的文档中读取、扫描或复制。它并不保证某个主题永远不会被提及，因为代理仍然可以从其他允许的证据（例如测试、自述文件、提交消息或现有的 wiki）推断出被忽略的区域。
</Note>

## 图表

OpenWiki 嵌入了美人鱼图，它们比散文更好地阐明了概念。每次运行后，它都会验证美人鱼围栏。验证失败的图表将就地转换为带有简短注释的普通 `text` 栅栏，然后在可能的情况下在稍后的 `--update` 运行中进行修复。

为了更紧密地匹配 GitHub 渲染的验证，请在运行 OpenWiki 的任何位置安装 Mermaid 解析器：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
npm install mermaid jsdom
```

当解析器存在时，OpenWiki 使用它。当它不存在时，OpenWiki 会退回到轻量级检查。无论哪种方式，图表生成都是有效的。

## 自定义 wiki 简介

编辑 `openwiki/INSTRUCTIONS.md` 来引导存储库文档的范围、优先级和首选写作约定（例如语气、术语以及要强调或跳过的内容）。 OpenWiki 在初始化和更新运行时读取此文件。您还可以在聊天中询问 OpenWiki 修改简介：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
openwiki "Update openwiki/INSTRUCTIONS.md to prioritize the public API and skip internal tooling"
```正常的 `--init` 和 `--update` 运行不会重写此文件。

## 另请参阅

* [Visualize your wiki](/oss/openwiki/visualize)
* [Automate updates](/oss/openwiki/automate-updates)
* [Customize OpenWiki](/oss/openwiki/customize)
* [Personal mode](/oss/openwiki/personal-mode)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/code-mode.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>