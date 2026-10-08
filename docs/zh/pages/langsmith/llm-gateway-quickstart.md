<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: LLM Gateway quickstart | https://docs.langchain.com/langsmith/llm-gateway-quickstart -->

# LLM 网关快速入门

使用一个 LangSmith API 密钥跨提供商调用模型，然后查看跟踪并设置支出限额。

<Note>
  LLM Gateway 位于[beta](/langsmith/release-stages)。
</Note>

LLM 网关通过一个端点使用一个 [LangSmith API key](/langsmith/create-account-api-key) 跨配置的提供者调用模型。发送请求，查看其跟踪，然后设置支出限额。

<Note>
  本快速入门在美国区域使用LangSmith云：网关位于`gateway.smith.langchain.com`，LangSmith UI位于`smith.langchain.com`。在 Deep Agents 示例中设置 `LANGSMITH_GATEWAY="true"` 也会解析为 US 网关。

  * **其他云区域和 BYOC**：将每个示例中的网关主机名替换为您的 [regional gateway](/langsmith/llm-gateway-how-it-works#use-a-regional-gateway) 或 [BYOC data plane](/langsmith/llm-gateway-how-it-works#use-a-byoc-data-plane) 基本 URL。对于 Deep Agents，将 `LANGSMITH_GATEWAY` 设置为该网关的根 URL，而不是 `true`。
  * **自托管**：遵循 [Enable the LLM Gateway on self-hosted](/langsmith/llm-gateway-self-hosted)，其中包括其自己的第一次调用。
</Note>

<Info>
  管理员必须为您的工作区[enable the gateway, add a provider secret, and grant access](/langsmith/llm-gateway-admin-setup) 一次。之后，您只需将工作区范围的 LangSmith API 密钥附加到具有 `gateway:invoke` 和 `workspaces:read` [permissions](/langsmith/organization-workspace-operations) 的角色。
</Info><Steps>
  <Step title="Send a request" icon="send">
    网关调用是指向网关基本 URL 的普通模型请求，并使用您的 LangSmith API 密钥进行身份验证。使用聊天完成从您已有的应用程序调用网关，或使用Deep Agents构建通过它路由的代理。

    <Tabs>
      <Tab title="Chat completions">
        将任何 OpenAI 兼容客户端指向 `https://gateway.smith.langchain.com/v1` 并将 `model` 设置为提供商前缀 ID。

        <CodeGroup>
          ```bash cURL theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          export LANGSMITH_API_KEY="lsv2_..."

          curl https://gateway.smith.langchain.com/v1/chat/completions \
              -H "Authorization: Bearer $LANGSMITH_API_KEY" \
              -H "Content-Type: application/json" \
              -d '{"model":"anthropic/claude-opus-5","messages":[{"role":"user","content":"Explain what an LLM gateway does in one sentence."}]}'
          ```

          ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import os

          from openai import OpenAI

          client = OpenAI(
              base_url="https://gateway.smith.langchain.com/v1",
              api_key=os.environ["LANGSMITH_API_KEY"],
          )
          response = client.chat.completions.create(
              model="anthropic/claude-opus-5",
              messages=[{"role": "user", "content": "Explain what an LLM gateway does in one sentence."}],
          )
          print(response.choices[0].message.content)
          ```

          ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          import OpenAI from "openai";

          const client = new OpenAI({
            baseURL: "https://gateway.smith.langchain.com/v1",
            apiKey: process.env.LANGSMITH_API_KEY,
          });
          const response = await client.chat.completions.create({
            model: "anthropic/claude-opus-5",
            messages: [{ role: "user", content: "Explain what an LLM gateway does in one sentence." }],
          });
          console.log(response.choices[0].message.content);
          ```
        </CodeGroup>

        同一端点还接受 Anthropic 消息和 OpenAI 响应请求。参见[API formats](/langsmith/llm-gateway-api-formats)。
      </Tab>

      <Tab title="Deep Agents">
        设置 `LANGSMITH_GATEWAY` 通过网关路由流程中每个支持的聊天模型。

        <CodeGroup>
          ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          # pip install "deepagents>=0.1.0"
          # export LANGSMITH_API_KEY="lsv2_..."
          # export LANGSMITH_GATEWAY="true"
          from deepagents import create_deep_agent

          agent = create_deep_agent(model="anthropic:claude-opus-5")
          result = agent.invoke({"messages": [{"role": "user", "content": "Explain what an LLM gateway does in one sentence."}]})
          print(result["messages"][-1].content)
          ```

          ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
          // npm install deepagents
          // export LANGSMITH_API_KEY="lsv2_..."
          // export LANGSMITH_GATEWAY="true"
          import { createDeepAgent } from "deepagents";

          const agent = createDeepAgent({ model: "anthropic:claude-opus-5" });
          const result = await agent.invoke({
            messages: [{ role: "user", content: "Explain what an LLM gateway does in one sentence." }],
          });
          console.log(result.messages[result.messages.length - 1].content);
          ```
        </CodeGroup>

        要路由特定呼叫而不是所有呼叫，请使用“聊天完成”选项卡中的标准端点，并将 `model` 设置为提供商前缀 ID。
      </Tab>
    </Tabs>
  </Step>

  <Step title="View the trace" icon="activity">
    打开 [LangSmith](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-llm-gateway-quickstart) 并转到工作区中名为 `gateway` 的跟踪项目。您的请求及其令牌计数、成本和延迟会显示在那里。
  </Step><Step title="Set a spend limit" icon="shield">
    转到 LangSmith 中的 **LLM Gateway** 并创建支出政策，例如 API 密钥每日上限为 10 美元。一旦达到上限，网关就会返回一个`402`，其中包含一条消息，其中指定了阻止请求的策略：

    ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {"type": "error", "error": {"message": "request blocked by gateway policies: R&D Spend Cap"}}
    ```

    有关完整指南，请参阅[Spend policies](/langsmith/llm-gateway-spend-policies)。
  </Step>
</Steps>

## 后续步骤

* [Overview](/langsmith/llm-gateway)：网关提供什么、如何管理凭证以及何时使用标准 API。
* [How the gateway works](/langsmith/llm-gateway-how-it-works)：每个请求会发生什么、凭证如何解析以及网关在哪里可用。
* [API formats](/langsmith/llm-gateway-api-formats)：通过标准端点使用聊天完成、消息或响应。
* [Set up coding agents](/langsmith/llm-gateway-coding-agents)：通过网关路由 Claude Code、Codex、Gemini CLI 或 Deep Agents Code。
* [Direct model access](/langsmith/llm-gateway-direct-model-access)：使用提供者本机请求和响应格式。
* [Prompt Hub with the gateway](/langsmith/manage-prompts-programmatically#use-with-the-langsmith-gateway)：通过网关路由 Prompt Hub 模型呼叫。
* [Data policy](/langsmith/llm-gateway-data-policy)：防止敏感数据到达提供商。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/llm-gateway-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>