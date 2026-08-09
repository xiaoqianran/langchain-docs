<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Manage workspace administration | https://docs.langchain.com/langsmith/fleet/workspace-admin -->

# 管理工作区管理

配置队列的工作区级别设置。

配置工作区机密并管理队列代理和用户的支出限制。

## 工作区秘密

Fleet 使用 [workspace secrets](/langsmith/set-up-hierarchy#configure-workspace-settings) 存储模型和工具的 API 密钥。可以使用以下秘密类型：

* **模型提供者密钥**：默认情况下，Fleet 使用 LangChain 管理的模型，不需要模型提供者 API 密钥。仅当您使用 [custom models](/langsmith/fleet/essentials#custom-models) 时才需要 OpenAI 或 Anthropic API 密钥。设置后，代理图会从工作区机密加载此密钥以进行推理。
* **特定于队列的机密**：以 `FLEET_` 为前缀的机密优先于队列内的工作区机密。这样，您可以更好地跟踪 Fleet 的使用情况以及 LangSmith 中使用相同密钥的其他部分的情况。如果您同时拥有 `OPENAI_API_KEY` 和 `FLEET_OPENAI_API_KEY`，则将使用 `FLEET_OPENAI_API_KEY` 秘密。
* **可选工具键**：为您启用的任何工具添加键。这些是在运行时从工作区机密中读取的。
  * `EXA_API_KEY`：Exa 搜索工具（一般 Web 和 LinkedIn 个人资料搜索）所需。
  * `TAVILY_API_KEY`：Tavilly 网络搜索所需。
  * `TWITTER_API_KEY` 和 `TWITTER_API_KEY_SECRET`：Twitter/X 读取操作所需（仅限应用程序承载）。未启用发布/媒体上传。* **MCP 服务器配置**：Fleet 可以从一台或多台远程 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器提取工具。在 [workspace](/langsmith/administration-overview#workspaces) 设置中配置 MCP 服务器和标头。 Fleet 会自动发现工具并在调用它们时应用配置的标头。欲了解更多信息，请参阅[Remote MCP servers](/langsmith/fleet/remote-mcp-servers)页面。

<Note icon="wand">
  定制模型可用于企业部署。请参阅[Custom models](/langsmith/fleet/essentials#custom-models)了解更多信息。
</Note>

### 添加一个秘密

添加秘密：

1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-fleet-workspace-admin) 中，导航至 <Icon icon="settings" /> **设置**，然后移至 **秘密** 选项卡。

2. 选择 **添加密钥** 并输入密钥**名称**（例如，`OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`）以及您的密钥作为**值**。

   <Note>
     确保密钥与模型提供者期望的环境变量名称匹配。
   </Note>

3. 选择**保存机密**。

## 使用和支出限制

**使用情况**页面使工作区管理员可以了解队列支出，并能够为代理和用户设置支出限制。此页面仅对具有 `fleet:read-admin-config` 权限的用户可见。

### 查看当前支出

**使用情况**页面显示您的工作区在选定时间段（**过去 7 天**或 **过去 14 天**）的总支出，以及总线程数和总运行数。每日支出图表提供了选定时间段内成本的直观明细。 **细分**部分可让您通过两种方式查看支出详细信息：

* **按代理**：查看每个代理的总成本、运行次数、首次和最后使用日期、所有者和每周限制。
* **按用户**：查看每个用户的支出和活动。

### 设置支出限额

支出限制让您可以控制代理和用户可以支出的金额。管理支出限额需要`fleet:write-admin-config`权限。

#### 默认每周支出限额

在 **默认每周支出限额** 部分中，您可以配置：

* **每个客服人员默认限额（美元）**：设置适用于工作区中所有客服人员的默认每周支出限额。
* **每用户默认限额（美元）**：设置适用于工作区中所有用户的默认每周支出限额。

限制是每周至今的，并在周一重置。

#### 覆盖单个代理和用户的限制

您可以覆盖单个代理或用户的默认支出限额，以设置自定义每周限额。

#### 支出限制行为* 支出限额的更改可能需要几分钟时间才能在所有正在运行的代理中传播。
* 每次运行开始时都会检查支出限额。如果运行在使用量低于限制时开始，则即使最终成本超出限制，也将允许运行完成。
* 支出计算基于痕迹。删除痕迹将影响报告的使用情况和支出执行。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/workspace-admin.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>