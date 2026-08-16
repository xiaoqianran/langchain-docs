<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Visualize your wiki | https://docs.langchain.com/oss/openwiki/visualize -->

# 可视化你的维基

为了探索 OpenWiki Markdown wiki，`openwiki visualize` 在浏览器中的实时 Markdown 阅读器旁边提供本地交互式节点图。

## 打开可视化工具

从已经有 `openwiki/` 目录的存储库：

```bash
openwiki visualize
```

这将在 `127.0.0.1:4321` 上提供 `./openwiki` 并打开浏览器查看图表。服务器运行时会自动获取对 wiki 文件的编辑。

## 选项

```bash
openwiki visualize openwiki --port 4400 --no-open
```

|参数/标志 |描述 |
| ---| ---|
| `[path]` |提供服务的 Wiki 目录。默认为 `./openwiki` |
| `--port <port>` |首选端口。默认为`4321`。如果端口已在使用中则增加 |
| `--no-open` |不自动打开浏览器 |

探索个人维基：

```bash
openwiki visualize ~/.openwiki/wiki
```

<Frame>
    <img
        src="/oss/images/openwiki/visualizer.gif"
        alt="OpenWiki visualizer with an interactive node graph beside a live Markdown reader"
    />
</Frame>

可视化工具显示：

- wiki 概念的交互式节点图以及它们之间的 Markdown 链接
- 所选页面的并排实时 Markdown 阅读器

该图未显示`INSTRUCTIONS.md`和其他脚手架文件。

## 另请参阅

- [Quickstart](/oss/openwiki/quickstart)
- [Code mode](/oss/openwiki/code-mode)
- [CLI reference](/oss/openwiki/cli-reference)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/visualize.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>