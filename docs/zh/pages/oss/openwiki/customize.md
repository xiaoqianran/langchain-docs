<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Customize OpenWiki | https://docs.langchain.com/oss/openwiki/customize -->

# 自定义 OpenWiki

忽略 OpenWiki 的路径、wiki 指令、代理指针和遥测

使用忽略规则、wiki 简介、代理指令指针和遥测来自定义 OpenWiki。

## 忽略路径

在存储库根目录中创建`.openwikiignore`，以从文档运行中排除私有、生成或不相关的路径。有关语法和行为，请参阅[Code mode](/oss/openwiki/code-mode#ignore-paths)。

## 维基说明

OpenWiki 在运行期间读取以下文件。自己编辑它们，或者在聊天中要求 OpenWiki 修改摘要（例如，`openwiki "Update openwiki/INSTRUCTIONS.md to focus on the public API"`）。

|模式|路径|目的|
| -------- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
|代码| `openwiki/INSTRUCTIONS.md` |共享的、用户编写的存储库文档范围和优先级简介 |
|个人| `~/.openwiki/INSTRUCTIONS.md` |全球个人wiki说明|

正常的 `--init` 和 `--update` 运行不会重写这些文件。

## 代理指令文件

每次运行代码时，OpenWiki 都会在存储库根目录维护 `AGENTS.md` 和 `CLAUDE.md`：* 如果文件不存在则创建
* 当文件已经存在时，仅重写 `<!-- OPENWIKI:START -->` … `<!-- OPENWIKI:END -->` 块
* 其余内容保持不变

该块指示编码代理在需要存储库上下文时查阅生成的 wiki。

## 本地配置目录

代码和个人模式都在`~/.openwiki/`下存储机器本地状态：

|路径|模式|目的|
| -------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `~/.openwiki/.env` |两者 |提供商配置、API 密钥和连接器 OAuth 令牌 |
| `~/.openwiki/openwiki.sqlite` |两者 |对话检查点数据库 |
| `~/.openwiki/install-id` |两者 |匿名遥测的随机安装 ID || `~/.openwiki/wiki/` |个人|个人模式 wiki 输出 |
| `~/.openwiki/INSTRUCTIONS.md` |个人|个人维基简介 |
| `~/.openwiki/onboarding.json` |个人|个人入职偏好和连接器时间表|
| `~/.openwiki/connectors/` |主要是个人的|连接器原始数据和配置。个人来源使用此路径；代码模式 LangSmith 摄取也可以在这里缓存原始数据 |

代码模式存储库工件（例如生成的 wiki、`openwiki/INSTRUCTIONS.md` 和 `openwiki/.last-update.json`）位于项目中，而不是位于 `~/.openwiki/` 下。有关更多详细信息，请参阅[Code mode](/oss/openwiki/code-mode)和[Personal mode](/oss/openwiki/personal-mode)。

## 遥测

OpenWiki 默认收集匿名的聚合使用数据，以便项目可以了解该工具的使用方式并对其进行改进。

**在单个 `openwiki_run` 事件中收集**，由存储在 `~/.openwiki/install-id` 中的随机安装 ID 键入：* 每次记录的运行：命令 (`init` / `update`) 和结果 (`success` / `failure` / `no-op`)，加上失败时的粗略错误类别（而不是错误消息）。互动聊天、`auth`、`ingest`不记录
* 在设置时（仅在初始化时）：大脑模式 (`code` / `personal`)、模型提供程序和配置的连接器名称（绝不是其内容）

**从未收集：** 文件内容、存储库数据或名称、凭据、提示、模型输出、连接器有效负载、错误消息、文件路径、URL、模型 ID、运行持续时间、IP 地址或个人信息。 GeoIP 丰富已禁用。

计划运行和 CI 运行在共享 CI 标识符下单独标记，并且不计为不同的安装。

### 选择退出

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export OPENWIKI_TELEMETRY_DISABLED=1
# or
export DO_NOT_TRACK=1
```

要永久禁用遥测收集，请将 `OPENWIKI_TELEMETRY_DISABLED=1` 添加到 `~/.openwiki/.env`。在CI中，在工作流环境中设置。

要准确检查运行将发送的内容，请将 `--telemetry-file=<path>` 添加到任何运行中。

## 另请参阅

* [Code mode](/oss/openwiki/code-mode)
* [Personal mode](/oss/openwiki/personal-mode)
* [Automate updates](/oss/openwiki/automate-updates)
* [Model providers](/oss/openwiki/providers)

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/openwiki/customize.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>