<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Deep Agents Code | https://docs.langchain.com/oss/deepagents/code/overview -->

# Deep Agents 代码

基于Deep Agents SDK构建的终端编码代理

Deep Agents Code (`dcode`) is an open source coding agent built on the [Deep Agents SDK](/oss/python/deepagents/quickstart).
它适用于任何大型语言模型，并支持切换提供者或模型。
持久记忆承载跨对话的上下文，可定制的技能塑造行为，批准控制门代码执行。

## 开始吧

Run the following command to install Deep Agents Code and launch an interactive session:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
curl -LsSf https://langch.in/dcode | bash
dcode
```

See the [Quickstart](/oss/deepagents/code/quickstart) to add provider credentials, run your first task, and learn interactive mode.

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
    Trace agent operations in LangSmith for observability and debugging.
  </Card>
</CardGroup>

## 后续步骤

<CardGroup>
  <Card title="Quickstart" icon="player-play" href="/oss/deepagents/code/quickstart">
    Install Deep Agents Code, run your first task, and use interactive or non-interactive modes.
  </Card>

  <Card title="Configuration" icon="settings" href="/oss/deepagents/code/configuration">
    Set up credentials, `config.toml`, environment variables, hooks, and CLI flags.
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/deepagents/code/overview.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>