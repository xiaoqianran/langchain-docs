<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deep Agents Code | https://docs.langchain.com/oss/deepagents/code/overview -->

# Deep Agents 代码

基于Deep Agents SDK构建的终端编码代理

Deep Agents Code (`dcode`) 是一个基于 [Deep Agents SDK](/oss/python/deepagents/quickstart) 构建的开源编码代理。
它适用于任何大型语言模型，并支持切换提供者或模型。
持久记忆在对话中承载上下文，可定制的技能塑造行为，批准控制门代码执行。

## 开始吧

运行以下命令安装Deep Agents代码并启动交互式会话：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -LsSf https://langch.in/dcode | bash
dcode
```

请参阅 [Quickstart](/oss/deepagents/code/quickstart) 添加提供者凭据、运行您的第一个任务并学习交互模式。

<Frame>
  <video aria-label="Deep Agents Code terminal demo">
    您的浏览器不支持视频标签。
  </video>
</Frame>

## 能力

<CardGroup>
  <Card title="Remote sandboxes" icon="cloud" href="/oss/deepagents/code/remote-sandboxes">
    远程运行代理工具，而不是在本地计算机上。
  </Card>

  <Card title="Goals and rubrics" icon="target-arrow" href="/oss/deepagents/code/goals-and-rubrics">
    定义可衡量的目标或评分标准，以便代理可以检查工作是否完成。
  </Card>

  <Card title="Subagents" icon="users" href="/oss/deepagents/code/subagents">
    将工作委托给特定于任务的子代理以并行执行。
  </Card>

  <Card title="Memory" icon="brain" href="/oss/deepagents/code/memory-and-skills#memory">
    跨会话存储和检索信息，包括项目约定和学习模式。
  </Card>

  <Card title="Context compaction" icon="arrows-minimize" href="/oss/deepagents/code/quickstart#interactive-mode">
    总结较旧的消息并将原始消息卸载到存储中。
  </Card><Card title="Human-in-the-loop" icon="user" href="/oss/deepagents/code/quickstart#interactive-mode">
    敏感工具操作需要人工批准。
  </Card>

  <Card title="Skills" icon="puzzle" href="/oss/deepagents/code/memory-and-skills#skills">
    通过定制专业知识和说明扩展代理的能力。
  </Card>

  <Card title="MCP tools" icon="plug" href="/oss/deepagents/code/mcp-tools">
    从模型上下文协议服务器加载外部工具。
  </Card>

  <Card title="Tracing" icon="chart-dots" href="/oss/deepagents/code/quickstart#trace-with-langsmith">
    跟踪LangSmith中的代理操作以实现可观察性和调试。
  </Card>
</CardGroup>

## 后续步骤

<CardGroup>
  <Card title="Quickstart" icon="player-play" href="/oss/deepagents/code/quickstart">
    安装Deep Agents代码，运行您的第一个任务，并使用交互或非交互模式。
  </Card>

  <Card title="Configuration" icon="settings" href="/oss/deepagents/code/configuration">
    设置凭据、`config.toml`、环境变量、挂钩和 CLI 标志。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>