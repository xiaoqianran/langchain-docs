<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Log multimodal traces | https://docs.langchain.com/langsmith/log-multimodal-traces -->

# 记录多模式痕迹

LangSmith 支持记录和渲染图像作为跟踪的一部分。目前，多模式 LLM 运行支持此功能。

为了记录图像，请分别在 Python 或 TypeScript 中使用 `wrap_openai`/ `wrapOpenAI` 并传递图像 URL 或 base64 编码图像作为输入的一部分。

<CodeGroup>
  ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  from openai import OpenAI
  from langsmith.wrappers import wrap_openai
  client = wrap_openai(OpenAI())
  response = client.chat.completions.create(
      model="gpt-4-turbo",
      messages=[
        {
          "role": "user",
          "content": [
            {"type": "text", "text": "What's in this image?"},
            {
              "type": "image_url",
              "image_url": {
                "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
              },
            },
          ],
        }
      ],
  )
  print(response.choices[0])
  ```

  ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  import OpenAI from "openai";
  import { wrapOpenAI } from "langsmith/wrappers";
  // Wrap the OpenAI client to automatically log traces
  const wrappedClient = wrapOpenAI(new OpenAI());
  const response = await wrappedClient.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image_url",
            image_url: {
              "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
  ```
</CodeGroup>

图像将被渲染为[ LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-log-multimodal-traces)中轨迹的一部分。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/log-multimodal-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>