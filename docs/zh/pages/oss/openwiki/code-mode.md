<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Code mode | https://docs.langchain.com/oss/openwiki/code-mode -->

# 代码模式

代码模式在 `openwiki/` 中构建了一个存储库 wiki，其中包含架构、集成和工作流程等持久细节。编码代理使用该 wiki 作为上下文，以便它们可以更有效地在包中工作，减少重新发现和更少的标记。人类可以阅读相同的 Markdown，但代理是主要受众。代理通过 OpenWiki 添加到 `AGENTS.md` 和 `CLAUDE.md` 的指针发现 wiki。

`openwiki`、`openwiki --init` 和 `openwiki --update` 在代码模式下运行。您还可以显式传递模式：

```bash
openwiki code --init
openwiki code --update
openwiki code --update --print
```

再次运行 `openwiki --init` 会用新一代替换现有生成的存储库 wiki 和声明，同时保留用户编写的 `openwiki/INSTRUCTIONS.md` 简介。在持久签出时，OpenWiki 在 `openwiki/.run.json` 中记录正在进行的生成，因此在中断后重新运行相同的命令可以恢复持久页面队列。除非保留其工作空间，否则短暂的 CI 运行程序会在失败后重新开始。在新的运行状态持久之前设置失败会恢复之前的 wiki。

要生成其他语言的 wiki 页面，请传递 BCP-47 语言环境，例如 `ko`、`zh-CN` 或 `pt-BR`：

```bash
openwiki --init --language ko
```

您还可以在 Codex、Claude Code、OpenCode 或 Cursor 中运行 OpenWiki。参见[Coding-agent integrations](/oss/openwiki/integrations)。

## 代码模式产生什么成功初始化或更新后，存储库通常包括：

- **`openwiki/`**：生成的 Markdown wiki（快速入门、架构、操作和相关主题）
- **`openwiki/INSTRUCTIONS.md`**：用户撰写的范围和优先事项简介。 OpenWiki 在初始化和更新时读取它。自己编辑，或者在聊天中要求 OpenWiki 更改；正常的`--init`和`--update`运行不会重写它
- **`openwiki/.claims/`**：结构化声明 sidecar，将事实页面置于版本化存储库证据中
- **`openwiki/.page-manifest.json`**：可恢复生成的每页进度和源检查点
- **`openwiki/.last-update.json`**：上次成功文档检查的元数据（包括无操作更新）
- **`AGENTS.md` / `CLAUDE.md`**：OpenWiki 插入或刷新 `<!-- OPENWIKI:START -->` … `<!-- OPENWIKI:END -->` 块，告诉编码代理何时查阅 wiki。该块之外的现有内容保持不变

在活动运行期间，`openwiki/.run.json` 检查有序页面队列。成功完成后 OpenWiki 会删除该文件。

## 有根据的主张OpenWiki 通过跟踪事实页面背后的实质性命题，使代码 wiki 能够自我纠正，而不仅仅是上次生成 Markdown 文件时。声明涵盖了未来代理所依赖的事实：行为、职责、架构、数据流、不变量、故障语义、配置和安全边界。每个声明都指向确切的存储库证据，例如`repo://src/server.ts#L40-L82`，以及声明成立时 OpenWiki 观察到的证据版本。

Markdown 保持干净。结构化索赔状态位于`openwiki/.claims/`下。页面完成会保留已核对的索赔，将验证项目纳入 OKF 前端内容，并在标记页面作业完成之前证明完整的结果。接地声明适用于存储库代码维基和存储库证据。连接器派生的事实，包括仅LangSmith 的观察结果，不包含在声明中。

## 降价输出

OpenWiki 的持久输出是 Markdown (OKF)，而不是静态 HTML 站点。要在浏览器中浏览 wiki，请运行 [⟦T32⟧](/oss/openwiki/visualize)。该命令仅在本地计算机 (`127.0.0.1`) 上为查看器提供服务，或者您也可以使用 [export a static visualizer](/oss/openwiki/visualize#export-a-static-site) 进行托管。

## 开放知识格式

OpenWiki 在代码和个人模式下发布 [Google Open Knowledge Format (OKF)](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) v0.2 包：- **概念**是一个普通的 wiki Markdown 页面（一个主题文件）。每个概念都有 YAML 前面的内容和非空 `type`；其他标准字段是可选的
- 新的和新初始化的页面接收`generated: {by, at}`。在更新期间，任何正文变化（包括空白）都会使标记前进；未改变的正文会保留其先前的事件，而仅前部内容的更改不会推进它。生产者被标记为`openwiki/<version>`（或编码代理主机）
- 存储库页面项目将索赔证据扎根到`sources`。 OpenWiki 协调其确定性识别的条目，同时保留独立创作的来源
- 仅在成功提交页面协调非空完整声明集、通过最终证据复查并保留声明 sidecar 后，存储库页面才会收到`verified: {by: openwiki/<version>, at: ...}`
- `index.md`和`log.md`是**保留**脚手架文件，而不是概念。根索引声明 `okf_version: "0.2"`
- 可选的 v0.2 出处、信任和生命周期系列（`sources`、`verified`、`status`、`stale_after`）在存在时进行验证。生产者定义的扩展字段在更新和迁移中保留
- 概念文档之间的标准 Markdown 链接表达关系

## LangSmith 连接器**LangSmith** 连接器丰富了代码 wiki：它为您选择的项目提取最近的 LangSmith 跟踪（工具调用、结果和延迟），因此存储库文档反映了代码在运行时的行为方式，而不仅仅是源代码的内容。

在`openwiki --init`期间以代码模式进行配置。从源菜单中，添加 LangSmith，选择您的工作区区域（美国、欧盟或亚太地区），然后列出要记录的项目。 OpenWiki 编写了一个提交的 `openwiki/.langsmith.json` 来命名工作空间和项目（而不是密钥本身）。 API 密钥是从环境中读取的：

```bash
OPENWIKI_LANGSMITH_API_KEY="<your-langsmith-key>"
```

设置向导可以在本地将其保存到`~/.openwiki/.env`。在 CI 中，将其设置为存储库机密并将其导出以供运行。

LangSmith 键是受工作空间和区域限制的。要跨多个工作区记录项目，请为每个工作区添加一个条目，每个条目都有自己的密钥，名为 `OPENWIKI_LANGSMITH_API_KEY_2`、`OPENWIKI_LANGSMITH_API_KEY_3` 等。连接器与美国 (`api.smith.langchain.com`)、欧盟 (`eu.api.smith.langchain.com`) 和亚太地区 (`apac.api.smith.langchain.com`) 官方主机进行通信。

## 忽略路径

在存储库根目录中创建一个 `.openwikiignore` 文件，以防止生成的文档读取或描述私有、生成或不相关的路径。该语法支持注释、空行、`*`和`**`通配符、目录规则和`!`否定：

```txt
secrets/
*.log
!logs/keep.log
```当 `.openwikiignore` 具有活动规则时，OpenWiki 会过滤文件系统发现并限制 shell 执行，以便忽略的路径不会运行。

<Note>
    这是一个读取边界：忽略的路径永远不会在生成的文档中读取、扫描或复制。它并不保证某个主题永远不会被提及，因为代理仍然可以从其他允许的证据（例如测试、自述文件、提交消息或现有的 wiki）推断出被忽略的区域。
</Note>

## 图表

OpenWiki 嵌入了美人鱼图，它们比散文更好地阐明了概念。每次运行后，它都会验证美人鱼围栏。验证失败的图表将就地转换为带有简短注释的普通 `text` 栅栏，然后在可能的情况下在稍后的 `--update` 运行中进行修复。

为了更紧密地匹配 GitHub 渲染的验证，请在运行 OpenWiki 的任何位置安装 Mermaid 解析器：

```bash
npm install mermaid jsdom
```

当解析器存在时，OpenWiki 使用它。当它不存在时，OpenWiki 会退回到轻量级检查。无论哪种方式，图表生成都是有效的。

## 自定义 wiki 简介编辑 `openwiki/INSTRUCTIONS.md` 来引导存储库文档的范围、优先级和首选写作约定（例如语气、术语以及要强调或跳过的内容）。 OpenWiki 在初始化和更新运行时读取此文件。您还可以在聊天中询问 OpenWiki 修改简介：

```bash
openwiki "Update openwiki/INSTRUCTIONS.md to prioritize the public API and skip internal tooling"
```

正常的 `--init` 和 `--update` 运行不会重写此文件。

## 另请参阅

- [Coding-agent integrations](/oss/openwiki/integrations)
- [Visualize your wiki](/oss/openwiki/visualize)
- [Automate updates](/oss/openwiki/automate-updates)
- [Customize OpenWiki](/oss/openwiki/customize)
- [Personal mode](/oss/openwiki/personal-mode)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/code-mode.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>