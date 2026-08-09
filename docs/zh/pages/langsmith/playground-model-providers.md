<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Model providers | https://docs.langchain.com/langsmith/playground-model-providers -->

# 模型提供者

[Playground](/langsmith/prompt-engineering-concepts#playground) 支持多种模型提供商。您可以选择提供商，配置您的首选设置，然后保存这些配置以在多个提示中重复使用。

使用此页面获取可用提供程序及其配置选项的列表：

<div>
  <a href="#amazon-bedrock">
    <img alt="" />

    <img alt="" />

    <span>亚马逊基岩</span>
  </a>

  <a href="#anthropic">
    <img alt="" />

    <img alt="" />

    <span>人类</span>
  </a>

  <a href="#azure-openai">
    <img alt="" />

    <img alt="" />

    <span>Azure OpenAI</span>
  </a>

  <a href="#deepseek">
    <img alt="" />

    <img alt="" />

    <span>DeepSeek</span>
  </a>

  <a href="#fireworks">
    <img alt="" />

    <img alt="" />

    <span>烟花</span>
  </a>

  <a href="#google-gemini">
    <img alt="" />

    <img alt="" />

    <span>谷歌双子座</span>
  </a>

  <a href="#google-vertex-ai">
    <img alt="" />

    <img alt="" />

    <span>Google Vertex AI</span>
  </a>

  <a href="#groq">
    <img alt="" />

    <img alt="" />

    <span>Groq</span>
  </a>

  <a href="#mistral-ai">
    <img alt="" />

    <img alt="" />

    <span>米斯特拉尔AI</span>
  </a>

  <a href="#openai">
    <img alt="" />

    <img alt="" />

    <span>OpenAI</span>
  </a>

  <a href="#openai-compatible-endpoint">
    <Icon icon="link" />

    <span>OpenAI兼容端点</span>
  </a>

  <a href="#xai">
    <img alt="" />

    <img alt="" />

    <span>XAI</span>
  </a>
</div>有关创建和管理模型配置的详细信息，请参阅[Configure prompt settings](/langsmith/managing-model-configurations)页面。

## 亚马逊基岩

在使用此模型之前，请确保您拥有[AWS credentials or IAM role](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)。

### 身份验证

Amazon Bedrock 支持两种身份验证方法。 **推荐使用 IAM 可信实体方法**，因为它可以避免与 LangSmith 共享长期存在的 AWS 访问密钥。

#### IAM 可信实体（推荐）

<Note>
  **不适用于 [self-hosted LangSmith](/langsmith/self-hosted)。** 请改用访问密钥（或 Bedrock API 密钥）。
</Note>

通过 IAM 可信实体身份验证，您可以在 AWS 账户中创建 IAM 角色并允许 LangSmith 代入该角色。 LangSmith 中不存储任何访问密钥。相反，LangSmith 使用 [AWS STS](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html) 来承担每个请求的角色。

要进行此设置：

1. 在您的 AWS 账户中创建一个 IAM 角色，该角色具有调用 Bedrock 模型的权限（例如，`bedrock:InvokeModel`）。
2. 添加允许 LangSmith 的 AWS 账户 (`808407022534`) 代入该角色的信任策略，使用您的 LangSmith 工作区 ID 作为外部 ID：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::808407022534:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<your-langsmith-workspace-id>"
        }
      }
    }
  ]
}
```

<Tip>
  您可以在[LangSmith workspace settings](https://smith.langchain.com/settings)中找到您的工作区ID。
</Tip>3. 在 LangSmith Playground 中，通过单击 **Key** 图标打开 Bedrock 提供程序的机密配置（模型配置下拉列表本身不提供 IAM 受信任实体选项）。然后展开 **IAM 受信任实体** 部分并输入您创建的角色的 ARN。

   <img alt="Bedrock secrets and API keys configuration with the IAM Trusted Entity section" />

有关信任策略的更多详细信息，请参阅[AWS documentation](https://aws.amazon.com/blogs/security/how-to-use-trust-policies-with-iam-roles/)。

#### 访问键

或者，您可以使用 AWS 访问密钥（`AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`）进行身份验证。在 Playground 的基岩提供程序配置中输入这些内容。此方法设置更简单，但安全性较低，因为它需要存储长期凭据。

### 可用型号

AWS Bedrock 提供对来自多个提供商的基础模型的访问：

* **人择：** 克劳德模型。
* **亚马逊：** 泰坦型号。
* **连贯：** 命令模型。
* **元：** 骆驼模型。
* **其他：** 根据地区提供其他可用的提供商。

有关当前可用型号的列表，请参阅[AWS Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html)。

### 配置参数

参数取决于底层模型提供者：

#### 对于人择模型

使用人择配置（参见下面的[Anthropic](#anthropic)部分）。

#### 对于亚马逊泰坦|参数|范围 |描述 |
| ---------------- | ---------| ----------------------- |
| **温度** | 0.0 - 1.0 |响应随机性 |
| **最大代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|

#### AWS 特定设置

* **区域：** 用于模型部署的 AWS 区域。

### 工具调用

取决于底层模型：

* **人择模型：** `auto`、`any`。
* **Cohere 型号：** `auto`。

## 人择

在使用此型号之前，请确保您拥有[Anthropic API key](https://console.anthropic.com/settings/keys)。

### 可用型号

Anthropic 为 Claude 一代提供了三层模型：

* **作品：** 最高的智力和能力。
* **十四行诗：** 平衡性能和成本。
* **俳句：** 快速且经济高效。

最近的克劳德模型支持扩展思维能力来显示推理过程。

有关当前可用型号的列表，请参阅[Anthropic documentation](https://docs.anthropic.com/claude/docs/models-overview)。

### 配置参数|参数|范围 |默认 |描述 |
| -------------------- | ---------| -------- | -------------------------------------------------- |
| **温度** | 0.0 - 1.0 |可选|随机性控制（取消选中以使用模型默认值）|
| **最大输出代币** | 1+ | 1024 | 1024最大响应长度|
| **顶P** | 0.0 - 1.0 |可选|细胞核采样（取消选中模型默认值）|
| **前 K** | 1+ |可选|限制前 K 个代币（取消选中模型默认值）|

<Note>
  温度、Top P 和 Top K 是可选的。未选中时，Claude 使用其内部默认值。
</Note>

#### 延伸思考

适用于受支持的 Claude 型号。使模型能够在响应之前显示推理，类似于 OpenAI 的 o 系列。|参数|范围 |描述 |
| ---------------------------- | ------ | --------------------------------------- |
| **启用扩展思维** |切换 |显示/隐藏思维过程 |
| **预算代币** | 1+ |思考的最大令牌数（默认值：1024）|

启用后，响应包括：

1. 模型推理的“思考”部分。
2.最终回应。

#### 高级选项

* **基本 URL：** 覆盖自定义部署的 API 端点。

### 工具调用

* **支持的工具选择：** `auto`、`any`（需要至少一种工具）。
* **并行执行：** 否（仅顺序执行）。

## Azure OpenAI

在使用此模型之前，请确保您拥有 [Azure OpenAI credentials](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart)（端点 + API 密钥）。

### 可用型号

Azure OpenAI 提供与 OpenAI 相同的模型系列：

* **GPT 系列：** 通用聊天模型。
* **o 系列：** 以推理为中心的模型。
* **旧型号：** GPT-3.5 和 GPT-4 变体。

模型可用性因 Azure 区域而异，并且需要在使用前进行部署。

有关当前可用型号的列表，请参阅[Azure OpenAI documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models)。

### 配置参数Azure OpenAI 支持与 OpenAI 相同的参数：

#### 标准参数

|参数|范围 |描述 |
| -------------------- | ---------- | ------------------------------------------------------------------ |
| **温度** | 0.0 - 2.0 |控制随机性。较低=更专注，较高=更具创造力。 |
| **最大输出代币** | 1+ |响应的最大长度 |
| **顶P** | 0.0 - 1.0 |细胞核采样阈值。温度的替代品。            |
| **在场处罚** | -2.0 - 2.0 |惩罚新主题（正面）或鼓励它们（负面）|
| **频率惩罚** | -2.0 - 2.0 |惩罚重复（积极）或允许重复（消极）|
| **种子** |整数|对于可重复的输出 |

#### 高级参数

**推理工作量：** 适用于推理优化模型（o 系列和较新的 GPT 模型）。

**服务等级：** 适用于较新的型号。

**其他参数：*** **JSON 模式：** 强制有效的 JSON 响应。
* **并行工具调用：** 同时执行多个工具。

#### Azure 特定功能

* **部署管理：** 模型在使用前必须进行部署。
* **区域可用性：** 选择 Azure 区域作为数据驻留。
* **内容过滤：** 内置内容审核和安全功能。
* **托管身份：** Azure AD 身份验证支持。
* **私有端点：** VNet 集成以实现安全访问。

### 工具调用

* **支持的工具选择：** `auto`、`required`、`none` 或特定工具名称。
* **并行执行：** 是的。

## 深度搜索

在使用此型号之前，请确保您拥有[DeepSeek API key](https://platform.deepseek.com/api_keys)。

### 可用型号

DeepSeek 提供通用模型、推理优化模型（R 系列）和编码专用模型。

有关当前可用型号的列表，请参阅[DeepSeek's documentation](https://platform.deepseek.com/api-docs/)。

### 配置参数|参数|范围 |描述 |
| -------------------- | ---------- | ----------------------- |
| **温度** | 0.0 - 2.0 |响应随机性 |
| **最大代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|
| **在场处罚** | -2.0 - 2.0 |                         |
| **频率惩罚** | -2.0 - 2.0 |                         |

## 烟花

在使用此型号之前，请确保您拥有[Fireworks API key](https://fireworks.ai/api-keys)。

### 可用型号

Fireworks 为流行的开源模型和微调变体提供高速推理，包括：

* **Llama：** Meta 的 Llama 模型有各种尺寸。
* **Mixtral：** Mistral 的专家混合模型。
* **Qwen:** 阿里巴巴的多语言模型。
* **DeepSeek：** DeepSeek 模型。
* **其他开放型号：** Gemma、Phi 等。

有关当前可用型号的列表，请参阅[Fireworks' model documentation](https://docs.fireworks.ai/models)。

### 配置参数|参数|范围 |描述 |
| ---------------- | ---------| ----------------------- |
| **温度** | 0.0 - 2.0 |响应随机性 |
| **最大代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|

### 工具调用

* **支持的工具选择：** `auto`、`required`、`none`。
* **并行执行：** 是的。

## 谷歌双子座

在使用此型号之前，请确保您拥有[Google AI API key](https://aistudio.google.com/app/apikey)。

### 可用型号

Google 提供针对不同用例进行优化的多个级别（Ultra、Pro、Flash）的 Gemini 模型。

有关当前可用型号的列表，请参阅[Google's Gemini documentation](https://ai.google.dev/models/gemini)。

### 配置参数

|参数|范围 |描述 |
| -------------------- | ---------| ----------------------- |
| **温度** | 0.0 - 2.0 |响应随机性 |
| **最大输出代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|
| **前 K** | 1+ | Top-k 采样 |

### 工具调用

* **支持的工具选择：** `auto`、`any`、`none`。
* **并行执行：** 否。

## 谷歌顶点人工智能在使用此型号之前，请确保您拥有 [Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects) 和 [Vertex AI API enabled](https://cloud.google.com/vertex-ai/docs/start/client-libraries)。

### 身份验证

Google Vertex AI 使用 **服务帐户 JSON 密钥** 在 LangSmith Playground 中进行身份验证。这是您从 Google Cloud Console 下载的 JSON 文件，其中包含具有 Vertex AI 访问权限的服务帐户的凭据。

#### 第 1 步：创建服务帐户

1. 前往[Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)。
2. 选择您的项目并单击“**创建服务帐户**”。
3. 为其命名（例如，`langsmith-vertex-ai`），然后单击“**创建并继续**”。
4. 分配角色 **Vertex AI User** (`roles/aiplatform.user`) 并单击 **完成**。

#### 第 2 步：下载 JSON 密钥

1. 单击您刚刚创建的服务帐户。
2. 转至 **密钥** 选项卡并单击 **添加密钥 → 创建新密钥**。
3. 选择 **JSON** 并单击 **创建**。 `.json` 文件将下载到您的计算机上。

下载的文件如下所示：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "langsmith-vertex-ai@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

#### 步骤 3：在 LangSmith Playground 中配置

在 LangSmith Playground 中，打开 Google Vertex AI 提供程序配置，并将下载的 JSON 密钥文件的 **全部内容** 粘贴到 **服务帐户 JSON** 字段中。<Warning>
  将您的服务帐户 JSON 密钥视为密码。不要共享它或将其提交给源代码管理。如果密钥被泄露，请立即从 [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) 撤销它并创建一个新密钥。
</Warning>

### 可用型号

Google 提供针对不同用例进行优化的多层 Gemini 模型（Ultra、Pro、Flash），以及通过 Vertex AI 提供的其他模型。

有关当前可用型号的列表，请参阅[Vertex AI documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/models)。

### 配置参数

|参数|范围 |描述 |
| -------------------- | ---------| ----------------------- |
| **温度** | 0.0 - 2.0 |响应随机性 |
| **最大输出代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|
| **前 K** | 1+ | Top-k 采样 |

#### 高级选项

* **区域选择：** 在特定 Google Cloud 区域中部署。
* **安全设置：** 配置内容过滤阈值。

### 工具调用

* **支持的工具选择：** `auto`、`any`、`none`。
* **并行执行：** 否。

## 格罗克

在使用此型号之前，请确保您拥有[Groq API key](https://console.groq.com/keys)。

### 可用型号Groq 为流行的开源模型（包括 Llama、Mixtral 和 Gemma 变体）提供高速推理。

有关当前可用型号的列表，请参阅[Groq's model documentation](https://console.groq.com/docs/models)。

### 配置参数

|参数|范围 |描述 |
| ---------------- | ---------| ----------------------- |
| **温度** | 0.0 - 2.0 |响应随机性 |
| **最大代币** | 1+ |最大响应长度|

### 工具调用

* **支持的工具选择：** `auto`、`required`、`none`。
* **并行执行：** 是的。

## 米斯特拉尔人工智能

在使用此型号之前，请确保您拥有[Mistral AI API key](https://console.mistral.ai/api-keys/)。

### 可用型号

Mistral 提供针对不同性能和成本要求进行优化的多层（大、中、小）型号。

有关当前可用型号的列表，请参阅[Mistral's documentation](https://docs.mistral.ai/platform/endpoints/)。

### 配置参数

|参数|范围 |描述 |
| ---------------- | ---------| ----------------------- |
| **温度** | 0.0 - 1.0 |响应随机性 |
| **最大代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|

### 工具调用* **支持的工具选择：** `auto`、`any`、`none`。
* **并行执行：** 否。

## 开放人工智能

在使用此型号之前，请确保您拥有 [OpenAI API key](https://platform.openai.com/api-keys) 或 [Azure OpenAI credentials](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart)。

### 可用型号

OpenAI 提供了多个具有不同功能和价位的模型系列：

* **GPT 系列：** 具有各种大小/功能级别的通用聊天模型。
* **o 系列：** 针对复杂问题解决而优化的以推理为中心的模型。
* **旧型号：** 较旧的 GPT-3.5 和 GPT-4 变体。

有关当前可用型号的列表，请参阅[OpenAI documentation](https://platform.openai.com/docs/models)。

### 配置参数

标准：|参数|范围 |描述 |
| -------------------- | ---------- | ------------------------------------------------------------------ |
| **温度** | 0.0 - 2.0 |控制随机性。较低=更专注，较高=更具创造力。 |
| **最大输出代币** | 1+ |响应的最大长度 |
| **顶P** | 0.0 - 1.0 |细胞核采样阈值。温度的替代品。            |
| **在场处罚** | -2.0 - 2.0 |惩罚新主题（正面）或鼓励它们（负面）|
| **频率惩罚** | -2.0 - 2.0 |惩罚重复（积极）或允许重复（消极）|
| **种子** |整数|对于可重复的输出 |

高级：

**推理工作**：适用于推理优化模型（o 系列和较新的 GPT 模型）。

在回应之前控制推理深度。更高的努力=复杂任务的更好质量，更长的延迟。|价值|描述 |
| ---------| -------------------------------------------------------- |
| `none` |禁用推理（标准聊天行为）|
| `minimal` |最小推理 |
| `low` |光推理|
| `medium` |适度推理（默​​认）|
| `high` |深度推理|
| `xhigh` |超深层推理（如果模型支持）|

<Note>
  当推理\_effort 处于活动状态时（不是`none`），温度、top\_p 和惩罚会自动禁用。
</Note>

**服务等级**：适用于较新的型号。

控制请求优先级和处理分配。

|价值|描述 |
| ---------- | ---------------------------------------------------------------- |
| `auto` |系统根据负载决定（默认） |
| `default` |标准处理队列 |
| `flex` |成本更低、延迟可变（如果型号支持）|
| `priority` |高优先级队列，延迟更低，成本更高 |

**其他参数：*** **JSON 模式：** 强制有效的 JSON 响应。
* **响应 API：** 改进的流式传输（默认：启用）。
* **并行工具调用：** 同时执行多个工具。

### 工具调用

* **支持的工具选择：** `auto`、`required`、`none` 或特定工具名称
* **并行执行：** 是

## OpenAI 兼容端点

身份验证因端点而异。常用选项：

* **API 密钥**：存储为 [workspace secret](/langsmith/administration-overview#workspaces) 并转发为 `Authorization: Bearer <key>`。
* **无**：适用于未经身份验证的本地端点（例如，`localhost` 上的 Ollama）。
* **OAuth2 `client_credentials`**：存储在模型配置上。 LangSmith 在请求时铸造一个短期持有者，并在到期前刷新它。参见[OAuth client credentials](/langsmith/model-configurations#oauth-client-credentials)。

### 配置

**必填：**

* **基本 URL：** 您的端点 URL（例如，`https://your-endpoint.com/v1`）。
* **型号名称：** 您的型号标识符。

可与实现 OpenAI 兼容 API 格式的任何框架或服务配合使用，包括：

* 自托管开源推理服务器
* 路由代理模型
* 自定义模型端点

### 配置参数

所有 OpenAI 兼容参数：|参数|范围 |描述 |
| -------------------- | ---------- | ----------------------- |
| **温度** | 0.0 - 2.0 |响应随机性 |
| **最大代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|
| **频率惩罚** | -2.0 - 2.0 |减少重复 |
| **在场处罚** | -2.0 - 2.0 |鼓励新话题|

**高级：**

* **JSON 模式：** 如果端点支持。
* **流式传输：** 如果端点支持。
* **函数调用：** 如果端点实现OpenAI格式。

### 工具调用

* **支持的工具选择：** `auto`、`required`、`none`（如果端点支持）。
* **并行执行：** 是（如果端点支持）。

### 端点示例

**当地奥拉马：**

```
Base URL: http://localhost:11434/v1
Model: llama3.1
```

**vLLM 服务器：**

```
Base URL: https://your-server.com/v1
Model: mistral-7b-instruct
```

**LiteLLM 代理：**

```
Base URL: https://litellm.example.com
Model: gpt-4 (routes to configured backend)
```

## 赛艾

在使用此型号之前，请确保您拥有[xAI API key](https://console.x.ai/)。

### 可用型号

xAI 为不同的用例提供多种尺寸的 Grok 模型。

有关当前可用型号的列表，请参阅[xAI's documentation](https://docs.x.ai/docs)。

### 配置参数

标准 OpenAI 兼容参数：|参数|范围 |描述 |
| -------------------- | ---------| -------------------------- |
| **温度** | 0.0 - 2.0 |响应随机性 |
| **最大代币** | 1+ |最大响应长度|
| **顶P** | 0.0 - 1.0 |细胞核取样|
| **在场处罚** | 0 - 2.0 |隐藏在推理模型中 |
| **频率惩罚** | 0 - 2.0 |隐藏在推理模型中 |

### 工具调用

* **支持的工具选择：** OpenAI 兼容。
* **并行执行：** 是（如果支持）。

## 所有提供商的通用配置

### 额外参数

所有提供程序都支持 **JSON 编辑器以获取 UI 中未公开的额外参数**：

```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
{
  "logprobs": true,
  "top_logprobs": 5,
  "custom_parameter": "value"
}
```

**使用案例：**

* 特定于提供商的测试版功能
* UI 中尚未包含高级参数
* 用于跟踪的自定义元数据

**限制：** 无法覆盖 UI 中已有的参数（例如，如果上面设置了温度，则无法在此处设置温度）

### 速率限制

**每秒请求数 (RPS)** - 在数据集上运行时可用于所有提供者：

* **范围：** 0 - 500 RPS
* **目的：** 尊重 API 速率限制，控制成本
* **默认值：** 因提供商而异在运行实验或评估时设置此值以避免达到速率限制。

## 后续步骤

<CardGroup>
  <Card title="Configure prompt settings" icon="settings" href="/langsmith/managing-model-configurations">
    了解如何在 Playground 中创建和管理模型配置。
  </Card>

  <Card title="Create a prompt" icon="edit" href="/langsmith/create-a-prompt">
    开始与您选择的模型提供商一起构建提示。
  </Card>
</CardGroup>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/playground-model-providers.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>