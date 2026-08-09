<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: ChatGoogleGenerativeAI integration | https://docs.langchain.com/oss/javascript/integrations/chat/google_generative_ai -->

# ChatGoogleGenerativeAI 集成

使用 LangChain JavaScript 与 ChatGoogleGenerativeAI 聊天模型集成。

[Google AI](https://ai.google.dev/)提供了多种不同的聊天模式，包括功能强大的Gemini系列。有关最新型号、其功能、上下文窗口等的信息，请前往[Google AI docs](https://ai.google.dev/gemini-api/docs/models/gemini)。

这将帮助您开始使用 `ChatGoogleGenerativeAI` [chat models](/oss/javascript/langchain/models)。有关所有 `ChatGoogleGenerativeAI` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-google-genai/ChatGoogleGenerativeAI)。

<Note>
  **该库将被弃用**

  该库基于 Google 已弃用的库，并将
  被[ChatGoogle](/oss/javascript/integrations/chat/google)库取代。
  新的实现应该使用 [ChatGoogle](/oss/javascript/integrations/chat/google) 库，并且
  现有的实现应考虑迁移。
</Note>

## 概述

### 集成细节|班级 |套餐 |可串行化| [PY support](https://python.langchain.com/docs/integrations/chat/google_generative_ai) |                                                下载 |                                                版本 |
| :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ | :----------: | :----------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: |
| [⟦T24⟧](https://reference.langchain.com/javascript/langchain-google-genai/ChatGoogleGenerativeAI) | [⟦T25⟧](https://www.npmjs.com/package/@langchain/google-genai) |       ✅ |                                            ✅ | ![NPM - Downloads](https://img.shields.io/npm/dm/@langchain/google-genai?style=flat-square\&label=%20&) | ![NPM - Version](https://img.shields.io/npm/v/@langchain/google-genai?style=flat-square\&label=%20&) |

### 模型特点有关如何使用特定功能的指南，请参阅下面表标题中的链接。

| [Tool calling](/oss/javascript/langchain/tools) | [Structured output](/oss/javascript/langchain/structured-output) | [Image input](/oss/javascript/langchain/messages#multimodal) |音频输入|视频输入| [Token-level streaming](/oss/javascript/langchain/streaming/) | [Token usage](/oss/javascript/langchain/models#token-usage) | [Logprobs](/oss/javascript/langchain/models#log-probabilities) |
| :---------------------------------------------: | :--------------------------------------------------------------------------: | :----------------------------------------------------------: | :---------: | :---------: | :------------------------------------------------------------------------: | :---------------------------------------------------------: | :------------------------------------------------------------------------: |
|                        ✅ |                                 ✅ |                               ✅ |      ✅ |      ✅ |                               ✅ |                              ✅ |                                ❌ |

## 设置

您可以访问 Google 的 `gemini` 和 `gemini-vision` 型号以及其他型号
LangChain中的生成模型通过`ChatGoogleGenerativeAI`类
`@langchain/google-genai`集成包。<Tip>
  您还可以通过 LangChain VertexAI 和 VertexAI-web 集成访问 Google 的 `gemini` 系列模型。请参阅[Vertex AI integration docs](/oss/javascript/integrations/chat/google_vertex_ai)。
</Tip>

### 凭证

在此处获取 API 密钥：[https://ai.google.dev/tutorials/setup](https://ai.google.dev/tutorials/setup)

然后设置`GOOGLE_API_KEY`环境变量：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export GOOGLE_API_KEY="your-api-key"
```

如果您想自动跟踪模型调用，您还可以通过取消下面的注释来设置您的 [LangSmith](/langsmith/observability) API 密钥：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
# export LANGSMITH_TRACING="true"
# export LANGSMITH_API_KEY="your-api-key"
```

### 安装

LangChain `ChatGoogleGenerativeAI` 集成位于 `@langchain/google-genai` 包中：

<CodeGroup>
  ```bash npm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  npm install @langchain/google-genai @langchain/core
  ```

  ```bash yarn theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  yarn add @langchain/google-genai @langchain/core
  ```

  ```bash pnpm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  pnpm add @langchain/google-genai @langchain/core
  ```
</CodeGroup>

## 实例化

现在我们可以实例化我们的模型对象并生成聊天完成：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro",
    temperature: 0,
    maxRetries: 2,
    // other params...
})
```

## 调用

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const aiMsg = await llm.invoke([
    [
        "system",
        "You are a helpful assistant that translates English to French. Translate the user sentence.",
    ],
    ["human", "I love programming."],
])
aiMsg
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
AIMessage {
  "content": "J'adore programmer. \n",
  "additional_kwargs": {
    "finishReason": "STOP",
    "index": 0,
    "safetyRatings": [
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "probability": "NEGLIGIBLE"
      }
    ]
  },
  "response_metadata": {
    "finishReason": "STOP",
    "index": 0,
    "safetyRatings": [
      {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "probability": "NEGLIGIBLE"
      },
      {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "probability": "NEGLIGIBLE"
      }
    ]
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 21,
    "output_tokens": 5,
    "total_tokens": 26
  }
}
```

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
console.log(aiMsg.content)
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
J'adore programmer.
```

## 安全设置

Gemini 型号具有可以覆盖的默认安全设置。如果您从模型中收到大量“安全警告”，您可以尝试调整模型的 safety\_settings 属性。例如，要关闭对危险内容的安全阻止，您可以从 `@google/generative-ai` 包导入枚举，然后按如下方式构建 LLM：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const llmWithSafetySettings = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  temperature: 0,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ],
  // other params...
});
```

## 工具调用

使用 Google AI 的工具调用基本相同 [as tool calling with other models](/oss/javascript/langchain/tools)，但对架构有一些限制。Google AI API 不允许工具架构包含具有未知属性的对象。例如，以下 Zod 模式将引发错误：

`const invalidSchema = z.object({ properties: z.record(z.unknown()) });`

和

`const invalidSchema2 = z.record(z.unknown());`

相反，您应该显式定义对象字段的属性。这是一个例子：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod";

// Define your tool
const fakeBrowserTool = tool((_) => {
  return "The search result is xyz..."
}, {
  name: "browser_tool",
  description: "Useful for when you need to find something on the web or summarize a webpage.",
  schema: z.object({
    url: z.string().describe("The URL of the webpage to search."),
    query: z.string().optional().describe("An optional search query to use."),
  }),
})

const llmWithTool = new ChatGoogleGenerativeAI({
  model: "gemini-pro",
}).bindTools([fakeBrowserTool]) // Bind your tools to the model

const toolRes = await llmWithTool.invoke([
  [
    "human",
    "Search the web and tell me what the weather will be like tonight in new york. use a popular weather website",
  ],
]);

console.log(toolRes.tool_calls);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
  {
    name: 'browser_tool',
    args: {
      url: 'https://www.weather.com',
      query: 'weather tonight in new york'
    },
    type: 'tool_call'
  }
]
```

### 内置 Google 搜索检索

谷歌还提供了一个内置的搜索工具，您可以使用它来根据现实世界的信息生成内容。以下是如何使用它的示例：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { DynamicRetrievalMode, GoogleSearchRetrievalTool } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const searchRetrievalTool: GoogleSearchRetrievalTool = {
  googleSearchRetrieval: {
    dynamicRetrievalConfig: {
      mode: DynamicRetrievalMode.MODE_DYNAMIC,
      dynamicThreshold: 0.7, // default is 0.7
    }
  }
};
const searchRetrievalModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  temperature: 0,
  maxRetries: 0,
}).bindTools([searchRetrievalTool]);

const searchRetrievalResult = await searchRetrievalModel.invoke("Who won the 2024 MLB World Series?");

console.log(searchRetrievalResult.content);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
The Los Angeles Dodgers won the 2024 World Series, defeating the New York Yankees in Game 5 on October 30, 2024, by a score of 7-6. This victory marks the Dodgers' eighth World Series title and their first in a full season since 1988.  They achieved this win by overcoming a 5-0 deficit, making them the first team in World Series history to win a clinching game after being behind by such a margin.  The Dodgers also became the first team in MLB postseason history to overcome a five-run deficit, fall behind again, and still win.  Walker Buehler earned the save in the final game, securing the championship for the Dodgers.
```

响应还包括有关搜索结果的元数据：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
console.dir(searchRetrievalResult.response_metadata?.groundingMetadata, { depth: null });
```

```javascript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  searchEntryPoint: {
    renderedContent: '<style>\n' +
      '.container {\n' +
      '  align-items: center;\n' +
      '  border-radius: 8px;\n' +
      '  display: flex;\n' +
      '  font-family: Google Sans, Roboto, sans-serif;\n' +
      '  font-size: 14px;\n' +
      '  line-height: 20px;\n' +
      '  padding: 8px 12px;\n' +
      '}\n' +
      '.chip {\n' +
      '  display: inline-block;\n' +
      '  border: solid 1px;\n' +
      '  border-radius: 16px;\n' +
      '  min-width: 14px;\n' +
      '  padding: 5px 16px;\n' +
      '  text-align: center;\n' +
      '  user-select: none;\n' +
      '  margin: 0 8px;\n' +
      '  -webkit-tap-highlight-color: transparent;\n' +
      '}\n' +
      '.carousel {\n' +
      '  overflow: auto;\n' +
      '  scrollbar-width: none;\n' +
      '  white-space: nowrap;\n' +
      '  margin-right: -12px;\n' +
      '}\n' +
      '.headline {\n' +
      '  display: flex;\n' +
      '  margin-right: 4px;\n' +
      '}\n' +
      '.gradient-container {\n' +
      '  position: relative;\n' +
      '}\n' +
      '.gradient {\n' +
      '  position: absolute;\n' +
      '  transform: translate(3px, -9px);\n' +
      '  height: 36px;\n' +
      '  width: 9px;\n' +
      '}\n' +
      '@media (prefers-color-scheme: light) {\n' +
      '  .container {\n' +
      '    background-color: #fafafa;\n' +
      '    box-shadow: 0 0 0 1px #0000000f;\n' +
      '  }\n' +
      '  .headline-label {\n' +
      '    color: #1f1f1f;\n' +
      '  }\n' +
      '  .chip {\n' +
      '    background-color: #ffffff;\n' +
      '    border-color: #d2d2d2;\n' +
      '    color: #5e5e5e;\n' +
      '    text-decoration: none;\n' +
      '  }\n' +
      '  .chip:hover {\n' +
      '    background-color: #f2f2f2;\n' +
      '  }\n' +
      '  .chip:focus {\n' +
      '    background-color: #f2f2f2;\n' +
      '  }\n' +
      '  .chip:active {\n' +
      '    background-color: #d8d8d8;\n' +
      '    border-color: #b6b6b6;\n' +
      '  }\n' +
      '  .logo-dark {\n' +
      '    display: none;\n' +
      '  }\n' +
      '  .gradient {\n' +
      '    background: linear-gradient(90deg, #fafafa 15%, #fafafa00 100%);\n' +
      '  }\n' +
      '}\n' +
      '@media (prefers-color-scheme: dark) {\n' +
      '  .container {\n' +
      '    background-color: #1f1f1f;\n' +
      '    box-shadow: 0 0 0 1px #ffffff26;\n' +
      '  }\n' +
      '  .headline-label {\n' +
      '    color: #fff;\n' +
      '  }\n' +
      '  .chip {\n' +
      '    background-color: #2c2c2c;\n' +
      '    border-color: #3c4043;\n' +
      '    color: #fff;\n' +
      '    text-decoration: none;\n' +
      '  }\n' +
      '  .chip:hover {\n' +
      '    background-color: #353536;\n' +
      '  }\n' +
      '  .chip:focus {\n' +
      '    background-color: #353536;\n' +
      '  }\n' +
      '  .chip:active {\n' +
      '    background-color: #464849;\n' +
      '    border-color: #53575b;\n' +
      '  }\n' +
      '  .logo-light {\n' +
      '    display: none;\n' +
      '  }\n' +
      '  .gradient {\n' +
      '    background: linear-gradient(90deg, #1f1f1f 15%, #1f1f1f00 100%);\n' +
      '  }\n' +
      '}\n' +
      '</style>\n' +
      '<div class="container">\n' +
      '  <div class="headline">\n' +
      '    <svg class="logo-light" width="18" height="18" viewBox="9 9 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
      '      <path fill-rule="evenodd" clip-rule="evenodd" d="M42.8622 27.0064C42.8622 25.7839 42.7525 24.6084 42.5487 23.4799H26.3109V30.1568H35.5897C35.1821 32.3041 33.9596 34.1222 32.1258 35.3448V39.6864H37.7213C40.9814 36.677 42.8622 32.2571 42.8622 27.0064V27.0064Z" fill="#4285F4"/>\n' +
      '      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.3109 43.8555C30.9659 43.8555 34.8687 42.3195 37.7213 39.6863L32.1258 35.3447C30.5898 36.3792 28.6306 37.0061 26.3109 37.0061C21.8282 37.0061 18.0195 33.9811 16.6559 29.906H10.9194V34.3573C13.7563 39.9841 19.5712 43.8555 26.3109 43.8555V43.8555Z" fill="#34A853"/>\n' +
      '      <path fill-rule="evenodd" clip-rule="evenodd" d="M16.6559 29.8904C16.3111 28.8559 16.1074 27.7588 16.1074 26.6146C16.1074 25.4704 16.3111 24.3733 16.6559 23.3388V18.8875H10.9194C9.74388 21.2072 9.06992 23.8247 9.06992 26.6146C9.06992 29.4045 9.74388 32.022 10.9194 34.3417L15.3864 30.8621L16.6559 29.8904V29.8904Z" fill="#FBBC05"/>\n' +
      '      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.3109 16.2386C28.85 16.2386 31.107 17.1164 32.9095 18.8091L37.8466 13.8719C34.853 11.082 30.9659 9.3736 26.3109 9.3736C19.5712 9.3736 13.7563 13.245 10.9194 18.8875L16.6559 23.3388C18.0195 19.2636 21.8282 16.2386 26.3109 16.2386V16.2386Z" fill="#EA4335"/>\n' +
      '    </svg>\n' +
      '    <svg class="logo-dark" width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">\n' +
      '      <circle cx="24" cy="23" fill="#FFF" r="22"/>\n' +
      '      <path d="M33.76 34.26c2.75-2.56 4.49-6.37 4.49-11.26 0-.89-.08-1.84-.29-3H24.01v5.99h8.03c-.4 2.02-1.5 3.56-3.07 4.56v.75l3.91 2.97h.88z" fill="#4285F4"/>\n' +
      '      <path d="M15.58 25.77A8.845 8.845 0 0 0 24 31.86c1.92 0 3.62-.46 4.97-1.31l4.79 3.71C31.14 36.7 27.65 38 24 38c-5.93 0-11.01-3.4-13.45-8.36l.17-1.01 4.06-2.85h.8z" fill="#34A853"/>\n' +
      '      <path d="M15.59 20.21a8.864 8.864 0 0 0 0 5.58l-5.03 3.86c-.98-2-1.53-4.25-1.53-6.64 0-2.39.55-4.64 1.53-6.64l1-.22 3.81 2.98.22 1.08z" fill="#FBBC05"/>\n' +
      '      <path d="M24 14.14c2.11 0 4.02.75 5.52 1.98l4.36-4.36C31.22 9.43 27.81 8 24 8c-5.93 0-11.01 3.4-13.45 8.36l5.03 3.85A8.86 8.86 0 0 1 24 14.14z" fill="#EA4335"/>\n' +
      '    </svg>\n' +
      '    <div class="gradient-container"><div class="gradient"></div></div>\n' +
      '  </div>\n' +
      '  <div class="carousel">\n' +
      '    <a class="chip" href="https://vertexaisearch.cloud.google.com/grounding-api-redirect/AZnLMfyXqJN3K4FKueRIZDY2Owjs5Rw4dqgDOc6ZjYKsFo4GgENxLktR2sPHtNUuEBIUeqmUYc3jz9pLRq2cgSpc-4EoGBwQSTTpKk71CX7revnXUa54r9LxcxKgYxrUNBm5HpEm6JDNeJykc6NacPYv43M2wgkrhHCHCzHRyjEP2YR0Pxq4JQMUuOrLeTAYWB9oUb87FE5ksfuB6gimqO5-6uS3psR6">who won the 2024 mlb world series</a>\n' +
      '  </div>\n' +
      '</div>\n'
  },
  groundingChunks: [
    {
      web: {
        uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AZnLMfwvs0gpiM4BbIcNXZnnp4d4ED_rLnIYz2ZwM-lwFnoUxXNlKzy7ZSbbs_E27yhARG6Gx2AuW7DsoqkWPfDFMqPdXfvG3n0qFOQxQ4MBQ9Ox9mTk3KH5KPRJ79m8V118RQRyhi6oK5qg5-fLQunXUVn_a42K7eMk7Kjb8VpZ4onl8Glv1lQQsAK7YWyYkQ7WkTHDHVGB-vrL2U2yRQ==',
        title: 'foxsports.com'
      }
    },
    {
      web: {
        uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AZnLMfwxwBq8VYgKAhf3UC8U6U5D-i0lK4TwP-2Jf8ClqB-sI0iptm9GxgeaH1iHFbSi-j_C3UqYj8Ok0YDTyvg87S7JamU48pndrd467ZQbI2sI0yWxsCCZ_dosXHwemBHFL5TW2hbAqasq93CfJ09cp1jU',
        title: 'mlb.com'
      }
    }
  ],
  groundingSupports: [
    {
      segment: {
        endIndex: 131,
        text: 'The Los Angeles Dodgers won the 2024 World Series, defeating the New York Yankees in Game 5 on October 30, 2024, by a score of 7-6.'
      },
      groundingChunkIndices: [ 0, 1 ],
      confidenceScores: [ 0.7652759, 0.7652759 ]
    },
    {
      segment: {
        startIndex: 401,
        endIndex: 531,
        text: 'The Dodgers also became the first team in MLB postseason history to overcome a five-run deficit, fall behind again, and still win.'
      },
      groundingChunkIndices: [ 1 ],
      confidenceScores: [ 0.8487609 ]
    }
  ],
  retrievalMetadata: { googleSearchDynamicRetrievalScore: 0.93359375 },
  webSearchQueries: [ 'who won the 2024 mlb world series' ]
}
```

### 代码执行

Google Generative AI 还支持代码执行。使用内置的`CodeExecutionTool`，您可以使模型生成代码，执行它，并在最终完成中使用结果：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { CodeExecutionTool } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const codeExecutionTool: CodeExecutionTool = {
  codeExecution: {}, // Simply pass an empty object to enable it.
};
const codeExecutionModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro",
  temperature: 0,
  maxRetries: 0,
}).bindTools([codeExecutionTool]);

const codeExecutionResult = await codeExecutionModel.invoke("Use code execution to find the sum of the first and last 3 numbers in the following list: [1, 2, 3, 72638, 8, 727, 4, 5, 6]");

console.dir(codeExecutionResult.content, { depth: null });
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
[
  {
    type: 'text',
    text: "Here's how to find the sum of the first and last three numbers in the given list using Python:\n" +
      '\n'
  },
  {
    type: 'executableCode',
    executableCode: {
      language: 'PYTHON',
      code: '\n' +
        'my_list = [1, 2, 3, 72638, 8, 727, 4, 5, 6]\n' +
        '\n' +
        'first_three_sum = sum(my_list[:3])\n' +
        'last_three_sum = sum(my_list[-3:])\n' +
        'total_sum = first_three_sum + last_three_sum\n' +
        '\n' +
        'print(f"{first_three_sum=}")\n' +
        'print(f"{last_three_sum=}")\n' +
        'print(f"{total_sum=}")\n' +
        '\n'
    }
  },
  {
    type: 'codeExecutionResult',
    codeExecutionResult: {
      outcome: 'OUTCOME_OK',
      output: 'first_three_sum=6\nlast_three_sum=15\ntotal_sum=21\n'
    }
  },
  {
    type: 'text',
    text: 'Therefore, the sum of the first three numbers (1, 2, 3) is 6, the sum of the last three numbers (4, 5, 6) is 15, and their total sum is 21.\n'
  }
]
```

您还可以将这一代作为聊天历史记录传递回模型：

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
const codeExecutionExplanation = await codeExecutionModel.invoke([
  codeExecutionResult,
  {
    role: "user",
    content: "Please explain the question I asked, the code you wrote, and the answer you got.",
  }
])

console.log(codeExecutionExplanation.content);
```

```text theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
You asked for the sum of the first three and the last three numbers in the list `[1, 2, 3, 72638, 8, 727, 4, 5, 6]`.

Here's a breakdown of the code:

1. **`my_list = [1, 2, 3, 72638, 8, 727, 4, 5, 6]`**: This line defines the list of numbers you provided.

2. **`first_three_sum = sum(my_list[:3])`**: This calculates the sum of the first three numbers.  `my_list[:3]` is a slice of the list that takes elements from the beginning up to (but not including) the index 3.  So, it takes elements at indices 0, 1, and 2, which are 1, 2, and 3. The `sum()` function then adds these numbers together.

3. **`last_three_sum = sum(my_list[-3:])`**: This calculates the sum of the last three numbers. `my_list[-3:]` is a slice that takes elements starting from the third element from the end and goes to the end of the list. So it takes elements at indices -3, -2, and -1 which correspond to 4, 5, and 6. The `sum()` function adds these numbers.

4. **`total_sum = first_three_sum + last_three_sum`**: This adds the sum of the first three numbers and the sum of the last three numbers to get the final result.

5. **`print(f"{first_three_sum=}")`**, **`print(f"{last_three_sum=}")`**, and **`print(f"{total_sum=}")`**: These lines print the calculated sums in a clear and readable format.


The output of the code was:

* `first_three_sum=6`
* `last_three_sum=15`
* `total_sum=21`

Therefore, the answer to your question is 21.
```

## 上下文缓存

上下文缓存允许您将一些内容传递给模型一次，缓存输入令牌，然后在后续请求中引用缓存的令牌以降低成本。您可以使用 `GoogleAICacheManager` 类创建 `CachedContent` 对象，然后使用 `enableCachedContent()` 方法将 `CachedContent` 对象传递给 `ChatGoogleGenerativeAIModel` 。

```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  GoogleAICacheManager,
  GoogleAIFileManager,
} from "@google/generative-ai/server";

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);
const cacheManager = new GoogleAICacheManager(process.env.GOOGLE_API_KEY);

// uploads file for caching
const pathToVideoFile = "/path/to/video/file";
const displayName = "example-video";
const fileResult = await fileManager.uploadFile(pathToVideoFile, {
    displayName,
    mimeType: "video/mp4",
});

// creates cached content AFTER uploading is finished
const cachedContent = await cacheManager.create({
    model: "models/gemini-2.5-flash",
    displayName: displayName,
    systemInstruction: "You are an expert video analyzer, and your job is to answer " +
      "the user's query based on the video file you have access to.",
    contents: [
        {
            role: "user",
            parts: [
                {
                    fileData: {
                        mimeType: fileResult.file.mimeType,
                        fileUri: fileResult.file.uri,
                    },
                },
            ],
        },
    ],
    ttlSeconds: 300,
});

// passes cached video to model
const model = new ChatGoogleGenerativeAI({});
model.useCachedContent(cachedContent);

// invokes model with cached video
await model.invoke("Summarize the video");
```

**注意*** 上下文缓存的最小输入令牌计数为 32,768，最大值与给定模型的最大值相同。

## 双子座提示常见问题解答

截至本文档撰写时（2023/12/12），Gemini对其接受的提示类型和结构有一些限制。具体来说：

1. 提供多模式（图像）输入时，最多只能显示 1 条“人类”（用户）类型的消息。您不能传递多条消息（尽管单个人工消息可能有多个内容条目）
2. 系统消息不受本机支持，并且将与第一条人工消息（如果存在）合并。
3. 对于常规聊天对话，消息必须遵循人类/人工智能/人类/人工智能交替模式。您不得按顺序提供 2 条 AI 或人类消息。
4. 如果违反LLM的安全检查，消息可能会被屏蔽。在这种情况下，模型将返回空响应。

***

## API 参考

有关所有 `ChatGoogleGenerativeAI` 功能和配置的详细文档，请前往 [API reference](https://reference.langchain.com/javascript/langchain-google-genai/ChatGoogleGenerativeAI)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/chat/google_generative_ai.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>