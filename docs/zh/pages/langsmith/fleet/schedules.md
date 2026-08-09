<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Schedules | https://docs.langchain.com/langsmith/fleet/schedules -->

# 时间表

配置计划以定期运行您的队列代理。

时间表按照基于时间的循环时间表运行您的代理。当您的客服人员需要主动工作而不仅仅是响应消息或事件时，请使用计划。

常见用例包括：

* **每日简报**：每天早上总结电子邮件、日历事件或 Slack 活动。
* **内存综合**：定期检查和整合代理的内存文件，以保持上下文干净且相关。
* **主动外展**：起草每周状态更新、后续提醒或定期报告。
* **数据监控**：按设定的节奏检查仪表板、指标或源，并显示任何值得注意的内容。

<Tip>
  要根据事件（例如 Slack 消息或电子邮件）启动代理，请改用 [channels](/langsmith/fleet/channels)。
</Tip>

## 添加时间表

要添加时间表：

1. 在 **计划** 部分中，单击 **+ 添加**。

2. 选择计划运行的时间。

   <Note>
     时间表采用 UTC 时间。配置计划时将所需的执行时间转换为 UTC。
   </Note>

3. （可选）添加 **提示**。通过自定义提示，您可以告诉代理在每次计划运行时要做什么。例如：*“总结过去 24 小时内我未读的电子邮件，并将摘要发布到 Slack 中的#team-updates。”
   *“检查您的内存文件并合并任何冗余或过时的条目。”

4. 单击“**创建计划**”。

5. 单击**保存更改**。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/fleet/schedules.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>