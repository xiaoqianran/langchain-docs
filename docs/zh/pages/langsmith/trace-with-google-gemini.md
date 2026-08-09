<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Trace Google Gemini applications | https://docs.langchain.com/langsmith/trace-with-google-gemini -->

# 跟踪 Google Gemini 应用程序

本指南向您展示如何在 LangSmith 中跟踪和记录 [Google's Gemini](https://ai.google.dev/gemini-api/docs) 模型。您将使用最新的 [⟦T5⟧ SDK](https://googleapis.github.io/python-genai/) (Python) 或 [⟦T6⟧ SDK](https://googleapis.github.io/js-genai/release_docs/index.html) (JavaScript) 检测 Gemini 调用，包装 Gemini 客户端以进行跟踪，并尝试包括基本提示、元数据标记和多轮对话在内的示例。

<Note>
  LangSmith Gemini 包装纸采用 **[beta](/langsmith/release-stages)**。 API 可能会在未来版本中发生变化。
</Note>

## 安装

使用您首选的包管理器安装所需的包：

<CodeGroup>
  ```bash pip theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pip install langsmith google-genai
  ```

  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install langsmith@latest @google/genai
  ```
</CodeGroup>

## 设置

设置您的 [API keys](/langsmith/create-account-api-key) 和项目名称：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGSMITH_API_KEY=<your_langsmith_api_key>
export LANGSMITH_PROJECT=<your_project_name>
export LANGSMITH_TRACING=true
export GOOGLE_API_KEY=<your_google_api_key>
```

要创建 Google API 密钥，请参阅[Google AI Studio](https://aistudio.google.com/apikey)。

## 配置跟踪

要跟踪 Gemini API 调用，请使用 LangSmith 的 [⟦T7⟧](https://reference.langchain.com/python/langsmith/wrappers/_gemini/wrap_gemini) (Python) 或 [⟦T8⟧](https://reference.langchain.com/javascript/functions/langsmith.wrappers_gemini.wrapGemini.html) (JavaScript) 包装函数。该包装器拦截对 Gemini 客户端的调用，并自动将它们记录为 LangSmith 中的跟踪。包装器保留了原始客户端的所有功能，同时添加了可观察性：

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from google import genai
  from langsmith import wrappers

  def main():
      # genai.Client() reads GOOGLE_API_KEY / GEMINI_API_KEY from the environment
      gemini_client = genai.Client()

      # Wrap the Gemini client to enable LangSmith tracing
      client = wrappers.wrap_gemini(
          gemini_client,
          tracing_extra={
              "tags": ["gemini", "python"],
              "metadata": {
                  "integration": "google-genai",
              },
          },
      )

      # Make a traced Gemini call
      response = client.models.generate_content(
          model="gemini-2.5-flash",
          contents="Explain quantum computing in simple terms.",
      )

      print(response.text)


  if __name__ == "__main__":
      main()
  ```

  ```javascript JavaScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import { GoogleGenAI } from "@google/genai";
  import { wrapGemini } from "langsmith/wrappers/gemini";

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  // Initialize the Gemini client
  const geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Wrap the client to enable LangSmith tracing
  // Configuration is applied to ALL calls made with this wrapped client
  const client = wrapGemini(geminiClient, {
    tags: ["gemini", "javascript"],
    metadata: {
      integration: "google-genai",
    },
  });

  // Make a traced call - tracing happens automatically
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain quantum computing in simple terms.",
  });

  console.log(response.text);
  ```
</CodeGroup><Tabs>
  <Tab title="Python" icon="brand-python">
    您可以通过在调用`wrap_gemini()`时传递[⟦T9⟧](https://reference.langchain.com/python/langsmith/wrappers/_gemini/wrap_gemini)来自定义跟踪。此参数适用于您使用该包装的客户端发出的所有后续请求，它允许您附加标签和元数据以过滤和组织 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-google-gemini) 中的跟踪。 `tracing_extra` 参数接受：

    * `tags`：用于对跟踪进行分类的字符串列表（例如，`["production", "gemini"]`）。
    * `metadata`：附加上下文的键值对字典（例如，`{"team": "ml-research", "integration": "google-genai"}`）。
    * `client`：可选的自定义 LangSmith 客户端实例。

    这些设置一致地应用于来自包装客户端的所有跟踪，以便您可以包含应在整个应用程序中保持不变的环境级标签或团队元数据。
  </Tab>

  <Tab title="JavaScript" icon="brand-javascript">
    您可以通过将配置选项传递给[⟦T17⟧](https://reference.langchain.com/javascript/functions/langsmith.wrappers_gemini.wrapGemini.html)来自定义跟踪。这些选项适用于您使用该包装的客户端发出的所有后续请求，这允许您附加标签和元数据以过滤和组织 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-google-gemini) 中的跟踪。配置接受：* `tags`：用于对跟踪进行分类的字符串数组（例如，`["production", "gemini"]`）。
    * `metadata`：具有用于附加上下文的键值对的对象（例如，`{ team: "ml-research", integration: "google-genai" }`）。
    * `client`：可选的自定义 LangSmith 客户端实例。

    这些设置一致地应用于来自包装客户端的所有跟踪，以便您可以包含应在整个应用程序中保持不变的环境级标签或团队元数据。
  </Tab>
</Tabs>

## 在 LangSmith 中查看痕迹

运行应用程序后，您可以在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-trace-with-google-gemini) 中查看跟踪记录，其中包括：

* **模型请求**：发送给 Gemini 模型的完整提示
* **模型响应**：生成的文本和结构化输出
* **函数调用**：使用函数调用时的工具调用和结果
* **聊天会话**：多轮对话上下文
* **性能指标**：延迟和令牌使用信息

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/trace-with-google-gemini.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>