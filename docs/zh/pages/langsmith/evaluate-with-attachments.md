<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Run an evaluation with multimodal content | https://docs.langchain.com/langsmith/evaluate-with-attachments -->

# 使用多模式内容运行评估

了解如何使用文件附件创建数据集示例，并在使用多模式内容运行 LangSmith 评估时在提示和评估器中使用它们。

LangSmith 允许您创建带有文件附件（例如图像、音频文件或文档）的数据集示例，并在使用多模式内容运行评估时在提示和评估器中使用它们。

虽然您可以通过 Base64 编码将多模态数据包含在示例中，但这种方法效率低下 - 编码数据比原始二进制文件占用更多空间，导致与 LangSmith 的传输速度变慢。使用附件有两个主要好处：

* 由于更高效的二进制文件传输，上传和下载速度更快。
* 增强了 LangSmith UI 中不同文件类型的可视化。

本指南介绍了如何创建带有附件的示例、构建使用这些附件的多模式提示和评估器以及使用多模式内容运行评估。选择 [**UI**](#ui) 或 [**SDK**](#sdk) 选项卡即可开始。

**选择您首选的方法：**

<Tabs>
  <Tab title="UI" icon="click">
    ## 1. 创建带有附件的示例您可以通过几种不同的方式将带有附件的示例添加到数据集。

    #### 来自现有运行

    将运行添加到 LangSmith 数据集时，可以有选择地将附件从源运行传播到目标示例。要了解更多信息，请参阅[Manage datasets in application](/langsmith/manage-datasets-in-application#manually-from-a-tracing-project)。

    <img alt="Add trace with attachments to dataset" />

    #### 从头开始

    您可以直接从 LangSmith UI 创建带有附件的示例。单击数据集 UI 的 `Examples` 选项卡中的 `+ Example` 按钮。然后使用“上传文件”按钮上传附件：

    <img alt="Create example with attachments" />

    上传后，您可以在 LangSmith UI 中查看带有附件的示例。每个附件都将呈现预览，以便于检查。 <img alt="Attachments with examples" />

    ## 2. 创建多模式提示

    LangSmith UI 允许您在评估多模式模型时在提示中包含附件：

    首先，单击消息中要添加多模式内容的文件图标。接下来，为每个示例要包含的附件​​添加模板变量。* 如果要包含特定附件，可以使用建议的变量名称，例如`{{attachment.file_name}}`，这将在附件列表中映射带有`file_name`的文件以将其传递给评估器
    * 如果要包含所有附件，请使用 `{{attachments}}` 变量。

      <img alt="Adding multimodal variable" />

    ## 3. 定义自定义评估器

    您可以创建使用数据集示例中的多模式内容的评估器。

    <Note>
      评估者必须使用既支持输入模式又支持结构化输出的模型。对于音频附件，目前只有 Gemini。图像和 PDF 附件可与任何返回结构化输出的具有视觉功能的模型配合使用。
    </Note>

    由于您的数据集已经包含带有附件的示例（在步骤 1 中添加），因此您可以直接在评估器中引用它们。为此：

    1. 从数据集页面选择 **+ Evaluator**。
    2. 在 **模板变量** 编辑器中，为附件添加一个变量以包括：* 如果要包含特定附件，可以使用建议的变量名称，例如`{{attachment.file_name}}`，这将在附件列表中映射带有`file_name`的文件，将其传递给评估器。
       * 如果要包含所有附件，请使用 `{{attachments}}` 变量。

       <img alt="Create evaluator modal with an audio attachment selected for output variable." />

       <img alt="Create evaluator modal with an audio attachment selected for output variable." />

    然后，评估者可以使用这些附件以及模型的输出来判断质量。例如，您可以创建一个评估器：

    * 检查图像描述是否与实际图像内容匹配。
    * 验证转录是否准确反映音频。
    * 验证从 PDF 中提取的文本是否正确。

    您还可以创建不使用附件但评估模型文本输出的纯文本评估器：

    * OCR → 文本校正：使用视觉模型从文档中提取文本，然后评估提取输出的准确性。
    * 语音转文本 → 转录质量：使用语音模型将音频转录为文本，然后根据参考评估转录结果。<Tip>
      如果您的跟踪在其输入或输出中包含 base64 编码的多模式内容（例如，如果您遵循 [log multimodal traces](/langsmith/log-multimodal-traces) 指南），则不需要附件来评估它们。在评估器提示中使用标准变量映射（例如 `{{input}}` 或 `{{output}}`），base64 内容将正确传递到 LLM 评估器进行可视化和评估。
    </Tip>

    有关定义自定义求值器的更多信息，请参阅 [LLM as Judge](/langsmith/llm-as-judge) 指南。

    ## 4. 更新带有附件的示例

    <Note>
      UI 中附件的大小限制为 20MB。
    </Note>

    在 UI 中编辑示例时，您可以：

    * 上传新附件
    * 重命名和删除附件
    * 使用快速重置按钮将附件重置为之前的状态

    单击“提交”后，更改才会保存。

    <img alt="Attachment editing" />
  </Tab>

  <Tab title="SDK" icon="code">
    ## 1. 创建带有附件的示例

    要使用 SDK 上传带有附件的示例，请使用 [create\_examples](https://docs.smith.langchain.com/reference/python/client/langsmith.client.Client#langsmith.client.Client.create_examples) / [update\_examples](https://docs.smith.langchain.com/reference/python/client/langsmith.client.Client#langsmith.client.Client.update_examples) Python 方法或 [uploadExamplesMultipart](https://docs.smith.langchain.com/reference/js/classes/client.Client#uploadexamplesmultipart) / [updateExamplesMultipart](https://docs.smith.langchain.com/reference/js/classes/client.Client#updateexamplesmultipart) TypeScript 方法。

    ####Python

    需要`langsmith>=0.3.13`

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import requests
    import uuid
    from pathlib import Path
    from langsmith import Client

    # Publicly available test files
    pdf_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    wav_url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
    img_url = "https://www.w3.org/Graphics/PNG/nurbcup2si.png"

    # Fetch the files as bytes
    pdf_bytes = requests.get(pdf_url).content
    wav_bytes = requests.get(wav_url).content
    img_bytes = requests.get(img_url).content

    # Create the dataset
    ls_client = Client()
    dataset_name = "attachment-test-dataset"
    dataset = ls_client.create_dataset(
      dataset_name=dataset_name,
      description="Test dataset for evals with publicly available attachments",
    )

    inputs = {
      "audio_question": "What is in this audio clip?",
      "image_question": "What is in this image?",
    }

    outputs = {
      "audio_answer": "The sun rises in the east and sets in the west. This simple fact has been observed by humans for thousands of years.",
      "image_answer": "A mug with a blanket over it.",
    }

    # Define an example with attachments
    example_id = uuid.uuid4()
    example = {
      "id": example_id,
      "inputs": inputs,
      "outputs": outputs,
      "attachments": {
          "my_pdf": {"mime_type": "application/pdf", "data": pdf_bytes},
          "my_wav": {"mime_type": "audio/wav", "data": wav_bytes},
          "my_img": {"mime_type": "image/png", "data": img_bytes},
          # Example of an attachment specified via a local file path:
          # "my_local_img": {"mime_type": "image/png", "data": Path(__file__).parent / "my_local_img.png"},
      },
    }

    # Create the example
    ls_client.create_examples(
      dataset_id=dataset.id,
      examples=[example],
      # Uncomment this flag if you'd like to upload attachments from local files:
      # dangerously_allow_filesystem=True
    )
    ```

    #### 打字稿

    需要版本 >= 0.2.13您可以使用`uploadExamplesMultipart`方法上传带有附件的示例。

    请注意，这是与标准 `createExamples` 方法不同的方法，标准 `createExamples` 方法目前不支持附件。每个附件都需要 `Uint8Array` 或 `ArrayBuffer` 作为数据类型。

    * `Uint8Array`：用于直接处理二进制数据。
    * `ArrayBuffer`：表示定长二进制数据，可以根据需要转换为`Uint8Array`。

    请注意，您无法直接在 TypeScript SDK 中传入文件路径，因为并非所有运行时环境都支持访问本地文件。

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import { Client } from "langsmith";
    import { v4 as uuid4 } from "uuid";

    // Publicly available test files
    const pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const wavUrl = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav";
    const pngUrl = "https://www.w3.org/Graphics/PNG/nurbcup2si.png";

    // Helper function to fetch file as ArrayBuffer
    async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return response.arrayBuffer();
    }

    // Fetch files as ArrayBuffer
    const pdfArrayBuffer = await fetchArrayBuffer(pdfUrl);
    const wavArrayBuffer = await fetchArrayBuffer(wavUrl);
    const pngArrayBuffer = await fetchArrayBuffer(pngUrl);

    // Create the LangSmith client (Ensure LANGSMITH_API_KEY is set in env)
    const langsmithClient = new Client();

    // Create a unique dataset name
    const datasetName = "attachment-test-dataset:" + uuid4().substring(0, 8);

    // Create the dataset
    const dataset = await langsmithClient.createDataset(datasetName, {
      description: "Test dataset for evals with publicly available attachments",
    });

    // Define the example with attachments
    const exampleId = uuid4();
    const example = {
      id: exampleId,
      inputs: {
          audio_question: "What is in this audio clip?",
          image_question: "What is in this image?",
      },
      outputs: {
          audio_answer: "The sun rises in the east and sets in the west. This simple fact has been observed by humans for thousands of years.",
          image_answer: "A mug with a blanket over it.",
      },
      attachments: {
        my_pdf: {
          mimeType: "application/pdf",
          data: pdfArrayBuffer
        },
        my_wav: {
          mimeType: "audio/wav",
          data: wavArrayBuffer
        },
        my_img: {
          mimeType: "image/png",
          data: pngArrayBuffer
        },
      },
    };

    // Upload the example with attachments to the dataset
    await langsmithClient.uploadExamplesMultipart(dataset.id, [example]);
    ```

    <Info>
      除了以字节形式传入之外，附件还可以指定为本地文件的路径。为此，传入附件 `data` 值的路径并指定 arg `dangerously_allow_filesystem=True`：

      ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      client.create_examples(..., dangerously_allow_filesystem=True)
      ```
    </Info>

    ## 2. 运行评估

    ### 定义目标函数

    现在我们有了一个包含带有附件的示例的数据集，我们可以定义一个目标函数来运行这些示例。以下示例仅使用 OpenAI 的 GPT-4o 模型来回答有关图像和音频剪辑的问题。

    ＃＃＃＃ Python您正在评估的目标函数必须有两个位置参数才能使用与示例关联的附件，第一个必须称为 `inputs`，第二个必须称为 `attachments`。

    * `inputs` 参数是一个字典，包含示例的输入数据，不包括附件。
    * `attachments` 参数是一个字典，它将附件名称映射到包含预签名 url、mime\_type 和文件字节内容读取器的字典。您可以使用预先签名的 url 或阅读器来获取文件内容。附件字典中的每个值都是具有以下结构的字典：

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
        "presigned_url": str,
        "mime_type": str,
        "reader": BinaryIO
    }
    ```

    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    from langsmith.wrappers import wrap_openai
    import base64
    from openai import OpenAI

    client = wrap_openai(OpenAI())

    # Define target function that uses attachments
    def file_qa(inputs, attachments):
        # Read the audio bytes from the reader and encode them in base64
        audio_reader = attachments["my_wav"]["reader"]
        audio_b64 = base64.b64encode(audio_reader.read()).decode('utf-8')

        audio_completion = client.chat.completions.create(
            model="gpt-4o-audio-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": inputs["audio_question"]
                        },
                        {
                            "type": "input_audio",
                            "input_audio": {
                                "data": audio_b64,
                                "format": "wav"
                            }
                        }
                    ]
                }
            ]
        )

        # Most models support taking in an image URL directly in addition to base64 encoded images
        # You can pipe the image pre-signed URL directly to the model
        image_url = attachments["my_img"]["presigned_url"]
        image_completion = client.chat.completions.create(
            model="gpt-5.4-mini",
            messages=[
              {
                "role": "user",
                "content": [
                  {"type": "text", "text": inputs["image_question"]},
                  {
                    "type": "image_url",
                    "image_url": {
                      "url": image_url,
                    },
                  },
                ],
              }
            ],
        )

        return {
            "audio_answer": audio_completion.choices[0].message.content,
            "image_answer": image_completion.choices[0].message.content,
        }
    ```

    #### 打字稿

    在 TypeScript SDK 中，如果 `includeAttachments` 设置为 `true`，则使用 `config` 参数将附件传递给目标函数。

    `config` 将包含 `attachments`，它是将附件名称映射到以下形式的对象的对象：

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    {
      presigned_url: string,
      mime_type: string,
    }
    ```

    ```typescript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    import OpenAI from "openai";
    import { wrapOpenAI } from "langsmith/wrappers";

    const client: any = wrapOpenAI(new OpenAI());

    async function fileQA(inputs: Record<string, any>, config?: Record<string, any>) {
      const presignedUrl = config?.attachments?.["my_wav"]?.presigned_url;
      if (!presignedUrl) {
        throw new Error("No presigned URL provided for audio.");
      }

      const response = await fetch(presignedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const audioB64 = Buffer.from(uint8Array).toString("base64");

      const audioCompletion = await client.chat.completions.create({
        model: "gpt-4o-audio-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: inputs["audio_question"] },
              {
                type: "input_audio",
                input_audio: {
                  data: audioB64,
                  format: "wav",
                },
              },
            ],
          },
        ],
      });

      const imageUrl = config?.attachments?.["my_img"]?.presigned_url
      const imageCompletion = await client.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: inputs["image_question"] },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      });

      return {
        audio_answer: audioCompletion.choices[0].message.content,
        image_answer: imageCompletion.choices[0].message.content,
      };
    }
    ```

    ### 定义自定义评估器<Note>您还可以在 UI 中定义引用这些附件输入和输出的多模式求值器。基于 UI 的评估器会在每个实验中自动运行，包括从 SDK 调用的实验。有关说明，请参阅[**UI**](#ui)选项卡。</Note>

    应用与上述完全相同的规则来确定评估者是否应接收附件。

    下面的评估者使用LLM来判断推理和答案是否一致。要了解有关如何定义基于 llm 的评估器的更多信息，请参阅[How to define an LLM-as-a-judge evaluator](/langsmith/llm-as-judge)。

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      # Assumes you've installed pydantic
      from pydantic import BaseModel

      def valid_image_description(outputs: dict, attachments: dict) -> bool:
        """Use an LLM to judge if the image description and images are consistent."""
        instructions = """
        Does the description of the following image make sense?
        Please carefully review the image and the description to determine if the description is valid.
        """

        class Response(BaseModel):
            description_is_valid: bool

        image_url = attachments["my_img"]["presigned_url"]
        response = client.beta.chat.completions.parse(
            model="gpt-5.5",
            messages=[
                {
                    "role": "system",
                    "content": instructions
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": image_url}},
                        {"type": "text", "text": outputs["image_answer"]}
                    ]
                }
            ],
            response_format=Response
        )
        return response.choices[0].message.parsed.description_is_valid

      ls_client.evaluate(
        file_qa,
        data=dataset_name,
        evaluators=[valid_image_description],
      )
      ```

      ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { zodResponseFormat } from 'openai/helpers/zod';
      import { z } from 'zod';
      import { evaluate } from "langsmith/evaluation";

      const DescriptionResponse = z.object({
        description_is_valid: z.boolean(),
      });

      async function validImageDescription({
        outputs,
        attachments,
      }: {
        outputs?: any;
        attachments?: any;
      }): Promise<{ key: string; score: boolean}> {
        const instructions = `Does the description of the following image make sense?
      Please carefully review the image and the description to determine if the description is valid.`;

        const imageUrl = attachments?.["my_img"]?.presigned_url
        const completion = await client.beta.chat.completions.parse({
            model: "gpt-5.5",
            messages: [
                {
                    role: "system",
                    content: instructions,
                },
                {
                    role: "user",
                    content: [
                        { type: "image_url", image_url: { url: imageUrl } },
                        { type: "text", text: outputs?.image_answer },
                    ],
                },
            ],
            response_format: zodResponseFormat(DescriptionResponse, 'imageResponse'),
        });

        const score: boolean = completion.choices[0]?.message?.parsed?.description_is_valid ?? false;
        return { key: "valid_image_description", score };
      }

      const resp = await evaluate(fileQA, {
        data: datasetName,
        // Need to pass flag to include attachments
        includeAttachments: true,
        evaluators: [validImageDescription],
        client: langsmithClient
      });
      ```
    </CodeGroup>

    ## 3. 更新带有附件的示例

    在上面的代码中，我们展示了如何将带有附件的示例添加到数据集。还可以使用 SDK 更新这些相同的示例。

    与现有示例一样，当您使用附件更新数据集时，数据集将被版本化。因此，您可以导航到数据集版本历史记录以查看对每个示例所做的更改。要了解更多信息，请参阅[Create and manage datasets in the UI](/langsmith/manage-datasets-in-application)。

    更新带有附件的示例时，您可以通过几种不同的方式更新附件：

    * 传入新附件
    * 重命名现有附件
    * 删除现有附件请注意：

    * 任何未明确重命名或保留的现有附件**将被删除**。
    * 如果您向`retain`或`rename`传递不存在的附件名称，将会引发错误。
    * 如果 `attachments` 和 `attachment_operations` 字段中出现相同的附件名称，则新附件优先于现有附件。

    <CodeGroup>
      ```python Python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      example_update = {
        "id": example_id,
        "attachments": {
            # These are net new attachments
            "my_new_file": ("text/plain", b"foo bar"),
        },
        "inputs": inputs,
        "outputs": outputs,
        # Any attachments not in rename/retain will be deleted.
        # In this case, that would be "my_img" if we uploaded it.
        "attachments_operations": {
            # Retained attachments will stay exactly the same
            "retain": ["my_pdf"],
            # Renaming attachments preserves the original data
            "rename": {
                "my_wav": "my_new_wav",
            }
        },
      }

      ls_client.update_examples(dataset_id=dataset.id, updates=[example_update])
      ```

      ```typescript TypeScript theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
      import { ExampleUpdateWithAttachments } from "langsmith/schemas";

      const exampleUpdate: ExampleUpdateWithAttachments = {
        id: exampleId,
        attachments: {
          // These are net new attachments
          "my_new_file": {
            mimeType: "text/plain",
            data: Buffer.from("foo bar")
          },
        },
        attachments_operations: {
          // Retained attachments will stay exactly the same
          retain: ["my_img"],
          // Renaming attachments preserves the original data
          rename: {
            "my_wav": "my_new_wav",
          },
          // Any attachments not in rename/retain will be deleted
          // In this case, that would be "my_pdf"
        },
      };

      await langsmithClient.updateExamplesMultipart(dataset.id, [exampleUpdate]);
      ```
    </CodeGroup>
  </Tab>
</Tabs>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/evaluate-with-attachments.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>