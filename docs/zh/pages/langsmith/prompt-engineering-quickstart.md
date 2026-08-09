<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Prompt engineering quickstart | https://docs.langchain.com/langsmith/prompt-engineering-quickstart -->

# 提示工程快速入门

提示指导大型语言模型 (LLM) 的行为。 [*Prompt engineering*](/langsmith/prompt-engineering-concepts) 是精心设计、测试和完善您向法学硕士提供的说明的过程，以便产生可靠且有用的答复。

LangSmith 提供用于创建、版本化、测试和协作提示的工具。您还将遇到一些常见概念，例如 [*prompt templates*](/langsmith/prompt-engineering-concepts#prompts-vs-prompt-templates)（它允许您重用结构化提示）和 [*variables*](/langsmith/prompt-engineering-concepts#f-string-vs-mustache)（它允许您动态地将值（例如用户的问题）插入到提示中）。

在本快速入门中，您将使用 UI 或 SDK 创建、测试和改进提示。本快速入门将使用 OpenAI 作为示例 LLM 提供商，但相同的工作流程适用于其他提供商。

## 先决条件

在开始之前，请确保您拥有：

* **LangSmith帐户**：在[smith.langchain.com](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-prompt-engineering-quickstart)注册或登录。
* **A LangSmith API 密钥**：遵循 [Create an API key](/langsmith/create-account-api-key) 指南。
* **OpenAI API 密钥**：从 [OpenAI dashboard](https://platform.openai.com/account/api-keys) 生成。

选择 UI 或 SDK 工作流程选项卡：

<Tabs>
  <Tab title="UI" icon="window">
    ## 1. 设置工作空间秘密

    在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=snippets-langsmith-set-workspace-secrets) 中，确保您的 API 密钥设置为 [workspace secret](/langsmith/set-up-hierarchy#configure-workspace-settings)。1. 导航至 <Icon icon="settings" /> **设置**，然后移至 **秘密** 选项卡。
    2. 选择 **添加密钥** 并输入密钥环境变量（例如`OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`）以及您的 API 密钥作为 **值**。
    3. 选择**保存机密**。

    <Note> 在 LangSmith UI 中添加工作区密钥时，请确保密钥与模型提供程序期望的环境变量名称匹配。</Note>

    <Note>如果您的提供商使用 OAuth2 `client_credentials` 进行身份验证，请改为在模型配置上配置凭据。在这种情况下，不需要工作空间机密。参见[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)。</Note>

    ## 2. 创建提示

    1. 在 [LangSmith UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-prompt-engineering-quickstart) 中，导航至左侧菜单中的 **提示** 部分。
    2. 单击 **+ 提示** 创建提示。
    3. 通过根据需要编辑或添加提示和输入变量来修改提示。

    <div>
      <img alt="Playground with the system prompt ready for editing." />

      <img alt="Playground with the system prompt ready for editing." />
    </div>

    ## 3. 测试提示

    1. 在 **提示** 标题下，选择模型名称旁边的齿轮 <Icon icon="settings" /> 图标，这将启动 **模型配置** 选项卡上的 **提示设置** 窗口。2. 设置您要使用的[model configuration](/langsmith/managing-model-configurations)。您选择的 **Provider** 和 **Model** 将决定在此配置页面上可配置的参数。设置完成后，单击“**另存为**”。

       <div>
         <img alt="Model Configuration window in the LangSmith UI, settings for Provider, Model, Temperature, Max Output Tokens, Top P, Presence Penalty, Frequency Penalty, Reasoning Effort, etc." />

         <img alt="Model Configuration window in the LangSmith UI, settings for Provider, Model, Temperature, Max Output Tokens, Top P, Presence Penalty, Frequency Penalty, Reasoning Effort, etc." />
       </div>

    3. 在 **输入** 框中指定要测试的输入变量，然后单击 <Icon icon="player-play" /> **开始**。

       <div>
         <img alt="The input box with a question entered. The output box contains the response to the prompt." />

         <img alt="The input box with a question entered. The output box contains the response to the prompt." />
       </div>

       要了解有关在 Playground 中配置提示的更多选项，请参阅[Configure prompt settings](/langsmith/managing-model-configurations)。

    4. 测试并完善提示后，单击 **保存** 将其存储以供将来使用。

    ## 4. 根据提示进行迭代

    LangSmith 允许基于团队的快速迭代。 [Workspace](/langsmith/administration-overview#workspaces) 成员可以在 Playground 中尝试提示，并在准备好后将其更改保存为新的 [*commit*](/langsmith/prompt-engineering-concepts#commits)。

    要改进您的提示：* 请参考模型提供商提供的文档，了解提示创建的最佳实践，例如：
      * [Best practices for prompt engineering with the OpenAI API](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)
      * [Gemini's Introduction to prompt design](https://ai.google.dev/gemini-api/docs/prompting-intro)
    * 使用提示画布（LangSmith 中的交互式工具）构建和完善您的提示。了解更多信息[Prompt Canvas guide](/langsmith/write-prompt-with-ai)。
    * 标记特定提交以标记提交历史记录中的重要时刻。
      1. 要创建提交，请导航至 **Playground** 并选择 **Commit**。选择要提交更改的提示，然后**提交**。
      2. 导航至左侧菜单中的**提示**。选择提示。在提示详情页面，选择右上角的**标签**，添加一个[commit tag](/langsmith/manage-prompts#commit-tags)。
  </Tab>

  <Tab title="SDK" icon="code">
    ## 1. 设置您的环境

    1. 在您的终端中，准备您的环境：

       <CodeGroup>
         ```bash Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         mkdir ls-prompt-quickstart && cd ls-prompt-quickstart
         python -m venv .venv
         source .venv/bin/activate
         pip install -qU langsmith openai langchain_core
         ```

         ```bash TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         mkdir ls-prompt-quickstart-ts && cd ls-prompt-quickstart-ts
         npm init -y
         npm install langsmith openai typescript ts-node
         npx tsc --init
         ```
       </CodeGroup>

    2. 设置您的 API 密钥：

       ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
       export LANGSMITH_API_KEY='<your_api_key>'
       export OPENAI_API_KEY='<your_api_key>'
       ```

    ## 2. 创建提示

    要创建提示，您需要定义提示中所需的消息列表，然后推送到 LangSmith。

    使用特定于语言的构造函数和push方法：

    * Python: [⟦T18⟧](https://reference.langchain.com/python/langchain-core/prompts/chat/ChatPromptTemplate) → [⟦T19⟧](https://docs.smith.langchain.com/reference/python/client/langsmith.client.Client#langsmith.client.Client.push_prompt)
    * 打字稿：[⟦T20⟧](https://reference.langchain.com/javascript/langchain-core/prompts/ChatPromptTemplate) → [⟦T21⟧](https://reference.langchain.com/javascript/langsmith/client/Client/pushPrompt)

    1. 将以下代码添加到`create_prompt`文件中：

       <CodeGroup>
         ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         from langsmith import Client
         from langchain_core.prompts import ChatPromptTemplate

         client = Client()

         prompt = ChatPromptTemplate([
             ("system", "You are a helpful chatbot."),
             ("user", "{question}"),
         ])

         client.push_prompt("prompt-quickstart", object=prompt)
         ```

         ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         import { Client } from "langsmith";
         import { ChatPromptTemplate } from "@langchain/core/prompts";

         const client = new Client();

         const prompt = ChatPromptTemplate.fromMessages([
         ["system", "You are a helpful chatbot."],
         ["user", "{question}"],
         ]);

         await client.pushPrompt("prompt-quickstart", {
         object: prompt,
         });
         ```
       </CodeGroup>这将创建一个有序的消息列表，将它们包装在 `ChatPromptTemplate` 中，然后按名称将提示推送到您的 [workspace](/langsmith/administration-overview#workspaces) 进行版本控制和重用。

    2.运行`create_prompt`：

       <CodeGroup>
         ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         python create_prompt.py
         ```

         ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         npx tsx create_prompt.ts
         ```
       </CodeGroup>

    按照生成的链接在 LangSmith UI 中查看新创建的提示中心提示。

    ## 3. 测试提示

    在此步骤中，您将按名称 (`"prompt-quickstart"`) 提取在 [step 2](#2-create-a-prompt) 中创建的提示，使用测试输入对其进行格式化，将其转换为 OpenAI 的聊天格式，然后调用 OpenAI 聊天完成 API。

    然后，您将通过创建新版本来迭代提示。工作区的成员可以打开现有提示符，试验[UI](https://smith.langchain.com?utm_source=docs\&utm_medium=cta\&utm_campaign=langsmith-signup\&utm_content=langsmith-prompt-engineering-quickstart)中的更改，并将这些更改保存为同一提示符上的新提交，这会保留整个团队的历史记录。

    1. 将以下内容添加到 `test_prompt` 文件中：

       <CodeGroup>
         ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         from langsmith import Client
         from openai import OpenAI
         from langchain_core.messages import convert_to_openai_messages

         client = Client()
         oai_client = OpenAI()

         prompt = client.pull_prompt("prompt-quickstart")

         # Since the prompt only has one variable you could also pass in the value directly
         # Equivalent to formatted_prompt = prompt.invoke("What is the color of the sky?")
         formatted_prompt = prompt.invoke({"question": "What is the color of the sky?"})

         response = oai_client.chat.completions.create(
             model="gpt-5.5",
             messages=convert_to_openai_messages(formatted_prompt.messages),
         )
         ```

         ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         import { OpenAI } from "openai";
         import { pull } from "langchain/hub"
         import { convertPromptToOpenAI } from "@langchain/openai";

         const oaiClient = new OpenAI();

         const prompt = await pull("prompt-quickstart");

         // Format the prompt with the question
         const formattedPrompt = await prompt.invoke({ question: "What is the color of the sky?" });

         const response = await oaiClient.chat.completions.create({
             model: "gpt-5.5",
             messages: convertPromptToOpenAI(formattedPrompt).messages,
         });
         ```
       </CodeGroup>

       这将使用 `pull` 按名称加载提示，以获取您正在测试的提示的最新提交版本。您还可以通过传递提交哈希`"<prompt-name>:<commit-hash>"`来指定特定提交

    2.运行`test_prompt`：

       <CodeGroup>
         ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         python test_prompt.py
         ```

         ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         npx tsx test_prompt.ts
         ```
       </CodeGroup>3. 要创建新版本的提示，请使用相同的提示名称和更新的模板调用您最初使用的相同推送方法。 LangSmith 将其记录为新的提交并保留以前的版本。

       将以下代码复制到`iterate_prompt`文件中：

       <CodeGroup>
         ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         from langsmith import Client
         from langchain_core.prompts import ChatPromptTemplate

         client = Client()

         new_prompt = ChatPromptTemplate([
             ("system", "You are a helpful chatbot. Respond in Spanish."),
             ("user", "{question}"),
         ])

         client.push_prompt("prompt-quickstart", object=new_prompt)
         ```

         ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         import { Client } from "langsmith";
         import { ChatPromptTemplate } from "@langchain/core/prompts";

         const client = new Client();

         const newPrompt = ChatPromptTemplate.fromMessages([
             ["system", "You are a helpful chatbot. Speak in Spanish."],
             ["user", "{question}"]
         ]);

         await client.pushPrompt("prompt-quickstart", {
             object: newPrompt
         });
         ```
       </CodeGroup>

    4.运行`iterate_prompt`：

       <CodeGroup>
         ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         python iterate_prompt.py
         ```

         ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
         npx tsx iterate_prompt.ts
         ```
       </CodeGroup>

       现在您的提示将包含两个提交。

    要改进您的提示：

    * 请参考模型提供商提供的文档，了解提示创建的最佳实践，例如：
      * [Best practices for prompt engineering with the OpenAI API](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)
      * [Gemini's Introduction to prompt design](https://ai.google.dev/gemini-api/docs/prompting-intro)
    * 使用提示画布（LangSmith 中的交互式工具）构建和完善您的提示。了解更多信息[Prompt Canvas guide](/langsmith/write-prompt-with-ai)。
  </Tab>
</Tabs>

## 后续步骤

* 了解有关如何使用[Create a prompt guide](/langsmith/create-a-prompt)中的提示中心存储和管理提示的更多信息。
* 在本教程中了解如何将 Playground 设置为[Test multi-turn conversations](/langsmith/multiple-messages)。
* 了解如何在数据集而不是单个示例上测试提示的性能，请参阅[Run an evaluation from the Playground](/langsmith/run-evaluation-from-playground)。

<Callout type="info" icon="feather">
  使用 Playground 中的 **[Chat](/langsmith/chat)** 来帮助优化提示、生成工具和创建输出模式。
</Callout>

***<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/prompt-engineering-quickstart.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>