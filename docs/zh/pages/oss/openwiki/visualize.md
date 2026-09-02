<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Visualize your wiki | https://docs.langchain.com/oss/openwiki/visualize -->

# 可视化你的维基

为了探索 OpenWiki Markdown wiki，`openwiki visualize` 在浏览器中的实时 Markdown 阅读器旁边提供本地交互式节点图。您还可以将相同的图表和阅读器导出为静态目录以进行托管。

## 打开可视化工具

从已经有 `openwiki/` 目录的存储库：

```bash
openwiki visualize
```

这将在 `127.0.0.1:4321` 上服务 `./openwiki` 并打开浏览器查看图表。服务器运行时会自动获取对 wiki 文件的编辑。图表面板可调整大小并可折叠在 Markdown 阅读器旁边。

## 选项

```bash
openwiki visualize openwiki --port 4400 --no-open
```

|参数/标志 |描述 |
| --- | --- |
| `[path]` |提供服务的 Wiki 目录。默认为 `./openwiki` |
| `--port <port>` |首选端口。默认为`4321`。如果端口已在使用中则增加 |
| `--no-open` |不自动打开浏览器 |
| `--export <dir>` |编写静态可视化工具目录而不是启动本地服务器。不能与`--port`或`--no-open`组合使用 |

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

该图没有显示`INSTRUCTIONS.md`和其他脚手架文件。## 导出静态站点

要在生成的文档旁边发布可视化工具，请导出静态目录而不是启动服务器：

```bash
openwiki visualize <PATH> --export docs/openwiki-visualizer
```

导出包含 `index.html`、`client.js`、`client-lib.js`、`styles.css` 和 `graph.json`。它的客户端读取同级图形文件并且不使用实时重新加载，因此该目录可以由 GitHub Pages、MkDocs 或任何其他静态主机托管。

<Note>
    该页面从公共 CDN 加载其图表、Markdown 和图表库，因此本地和静态查看器都需要互联网连接。
</Note>

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