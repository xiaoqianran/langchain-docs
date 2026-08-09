<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Hugging Face integrations | https://docs.langchain.com/oss/python/integrations/providers/huggingface -->

# 拥抱脸部集成

使用 LangChain Python 与 Hugging Face 集成。

本页面涵盖了 LangChain 与[Hugging Face Hub](https://huggingface.co/)以及[transformers](https://huggingface.co/docs/transformers/index)、[sentence transformers](https://sbert.net/)和[datasets](https://huggingface.co/docs/datasets/index)等库的所有集成。

## 聊天模型

### 聊天拥抱脸

我们可以使用`Hugging Face`LLM课程或直接使用`ChatHuggingFace`课程。

请参阅[usage example](/oss/python/integrations/chat/huggingface)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_huggingface import ChatHuggingFace
```

## 法学硕士

### HuggingFaceEndpoint

我们可以使用`HuggingFaceEndpoint`类通过无服务器[Inference Providers](https://huggingface.co/docs/inference-providers)或专用[Inference Endpoints](https://huggingface.co/inference-endpoints/dedicated)来运行开源模型。

请参阅[usage example](/oss/python/integrations/llms/huggingface_endpoint)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_huggingface import HuggingFaceEndpoint
```

### HuggingFacePipeline

我们可以使用`HuggingFacePipeline`类在本地运行开源模型。

请参阅[usage example](/oss/python/integrations/llms/huggingface_pipelines)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_huggingface import HuggingFacePipeline
```

## 嵌入模型

### HuggingFaceEmbeddings

我们可以使用`HuggingFaceEmbeddings`类在本地运行开源嵌入模型。

请参阅[usage example](/oss/python/integrations/embeddings/huggingfacehub)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_huggingface import HuggingFaceEmbeddings
```

### HuggingFaceEndpointEmbeddings

我们可以使用`HuggingFaceEndpointEmbeddings`类通过专用的[Inference Endpoint](https://huggingface.co/inference-endpoints/dedicated)运行开源嵌入模型。

请参阅[usage example](/oss/python/integrations/embeddings/huggingfacehub)。

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
from langchain_huggingface import HuggingFaceEndpointEmbeddings
```

### 文本嵌入推理 (TEI)

对于 Sentence Transformers 模型的自托管生产服务，Hugging Face 发布了[Text Embeddings Inference](https://github.com/huggingface/text-embeddings-inference)，这是一款具有批处理和 GPU 支持的专用推理服务器。 TEI公开了兼容OpenAI的API，因此LangChain通过`OpenAIEmbeddings`指向TEI部署。参见专用[TEI integration guide](/oss/python/integrations/embeddings/text_embeddings_inference)。

### BGE 嵌入模型> [BGE models on Hugging Face](https://huggingface.co/BAAI) 是来自 [Beijing Academy of Artificial Intelligence (BAAI)](https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence) 的强大开源嵌入系列。

BGE 模型是 Sentence Transformers 模型，因此将 `HuggingFaceEmbeddings` 与 `encode_kwargs={"normalize_embeddings": True}` 一起使用。请参阅[usage example](/oss/python/integrations/embeddings/bge_huggingface)。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/python/integrations/providers/huggingface.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>