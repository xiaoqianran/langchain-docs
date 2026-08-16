<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Upload files with traces | https://docs.langchain.com/langsmith/upload-files-with-traces -->

# 上传带有痕迹的文件

当您使用 [⟦T3⟧ decorator or ⟦T4⟧ wrapper](/langsmith/annotate-code#use-%40traceable-%2F-traceable) 进行跟踪时，LangSmith 支持在跟踪的同时上传二进制文件（例如图像、音频、视频、PDF 和 CSV）。当使用多模式输入或输出处理 LLM 管道时，这特别有用。

在 [Python](#python) 和 [TypeScript](#typescript) SDK 中，您可以通过指定每个文件的 MIME 类型和二进制内容来向跟踪添加附件。本页介绍如何使用 Python 中的 `Attachment` 类型和 TypeScript 中的 `Uint8Array` / `ArrayBuffer` 定义和跟踪附件。

##Python

在[Python SDK](/langsmith/smith-python-sdk)中，您可以使用`Attachment`类型将文件添加到轨迹中。每个`Attachment`需要：

- `mime_type` (str)：文件的 MIME 类型（例如，`"image/png"`）。
- `data` (bytes | Path)：文件的二进制内容，或者文件路径。

为了方便起见，您还可以使用 `(mime_type, data)` 形式的元组定义附件。

有两种方式提供文件数据：

- 自己加载字节并直接传递它们（适用于所有环境），或者
- 传递一个 `Path` 对象，并通过在 `@traceable` 装饰器上设置 `dangerously_allow_filesystem=True` 来让 SDK 读取文件。<Note>
    `dangerously_allow_filesystem` 标志的存在是为了保护服务器和多租户环境，其中用户控制的输入可能会影响文件路径。在受信任的环境（本地脚本或您拥有文件路径的受控管道）中，启用它是安全的。
    </Note>

使用 `@traceable` 装饰函数并包含 `Attachment` 实例作为参数。以下示例演示了两种方法：手动将文件字节加载到 `Attachment` 中，并使用 `dangerously_allow_filesystem=True` 传递 `Path` 对象：

```python Python
from langsmith import traceable
from langsmith.schemas import Attachment
from pathlib import Path
import os

# Must set dangerously_allow_filesystem to True if you want to use file paths
@traceable(dangerously_allow_filesystem=True)
def trace_with_attachments(
    val: int,
    text: str,
    image: Attachment,
    audio: Attachment,
    video: Attachment,
    pdf: Attachment,
    csv: Attachment,
):
    return f"Processed: {val}, {text}, {len(image.data)}, {len(audio.data)}, {len(video.data)}, {len(pdf.data), {len(csv.data)}}"

# Helper function to load files as bytes
def load_file(file_path: str) -> bytes:
    with open(file_path, "rb") as f:
        return f.read()

# Load files and create attachments
image_data = load_file("my_image.png")
audio_data = load_file("my_mp3.mp3")
video_data = load_file("my_video.mp4")
pdf_data = load_file("my_document.pdf")

image_attachment = Attachment(mime_type="image/png", data=image_data)
audio_attachment = Attachment(mime_type="audio/mpeg", data=audio_data)
video_attachment = Attachment(mime_type="video/mp4", data=video_data)
pdf_attachment = ("application/pdf", pdf_data) # Can just define as tuple of (mime_type, data)
csv_attachment = Attachment(mime_type="text/csv", data=Path(os.getcwd()) / "my_csv.csv")

# Define other parameters
val = 42
text = "Hello, world!"

# Call the function with traced attachments
result = trace_with_attachments(
    val=val,
    text=text,
    image=image_attachment,
    audio=audio_attachment,
    video=video_attachment,
    pdf=pdf_attachment,
    csv=csv_attachment,
)
```

## 打字稿

在[TypeScript SDK](/langsmith/smith-js-ts-sdk)中，您可以使用`Uint8Array`或`ArrayBuffer`作为数据类型向跟踪添加附件。每个附件的 MIME 类型在 `extractAttachments` 中指定：

- `Uint8Array`：用于直接处理二进制数据。
- `ArrayBuffer`：表示定长二进制数据，您可以根据需要转换为`Uint8Array`。

在 TypeScript SDK 中，`extractAttachments` 函数是`traceable` 配置中的可选参数。当调用可跟踪包装函数时，它会从您的输入中提取二进制数据（例如图像、音频文件），并将它们与其他跟踪数据一起记录，并指定其 MIME 类型。<Note>
TypeScript SDK 中不能直接传入文件路径，因为并非所有运行时环境都支持访问本地文件。
</Note>

使用 `traceable` 包装您的函数，并将附件包含在 `extractAttachments` 选项中。签名是：

```typescript TypeScript
type AttachmentData = Uint8Array | ArrayBuffer;
type Attachments = Record<string, [string, AttachmentData]>;

extractAttachments?: (
    ...args: Parameters<Func>
) => [Attachments | undefined, KVMap];
```

以下示例显示了完整的实现：

```typescript TypeScript
import { traceable } from "langsmith/traceable";

const traceableWithAttachments = traceable(
    (
        val: number,
        text: string,
        attachment: Uint8Array,
        attachment2: ArrayBuffer,
        attachment3: Uint8Array,
        attachment4: ArrayBuffer,
        attachment5: Uint8Array,
    ) =>
        `Processed: ${val}, ${text}, ${attachment.length}, ${attachment2.byteLength}, ${attachment3.length}, ${attachment4.byteLength}, ${attachment5.byteLength}`,
    {
        name: "traceWithAttachments",
        extractAttachments: (
            val: number,
            text: string,
            attachment: Uint8Array,
            attachment2: ArrayBuffer,
            attachment3: Uint8Array,
            attachment4: ArrayBuffer,
            attachment5: Uint8Array,
        ) => [
            {
                "image inputs": ["image/png", attachment],
                "mp3 inputs": ["audio/mpeg", new Uint8Array(attachment2)],
                "video inputs": ["video/mp4", attachment3],
                "pdf inputs": ["application/pdf", new Uint8Array(attachment4)],
                "csv inputs": ["text/csv", new Uint8Array(attachment5)],
            },
            { val, text },
        ],
    }
);

const fs = Deno // or Node.js fs module
const image = await fs.readFile("my_image.png"); // Uint8Array
const mp3Buffer = await fs.readFile("my_mp3.mp3");
const mp3ArrayBuffer = mp3Buffer.buffer; // Convert to ArrayBuffer
const video = await fs.readFile("my_video.mp4"); // Uint8Array
const pdfBuffer = await fs.readFile("my_document.pdf");
const pdfArrayBuffer = pdfBuffer.buffer; // Convert to ArrayBuffer
const csv = await fs.readFile("test-vals.csv"); // Uint8Array

// Define example parameters
const val = 42;
const text = "Hello, world!";

// Call traceableWithAttachments with the files
const result = await traceableWithAttachments(
    val, text, image, mp3ArrayBuffer, video, pdfArrayBuffer, csv
);
```

## 相关

- [Manage datasets](/langsmith/manage-datasets)
- [Set up LLM-as-a-judge online evaluators](/langsmith/online-evaluations-llm-as-judge)

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/upload-files-with-traces.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>