<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Use environment variables for model providers | https://docs.langchain.com/langsmith/self-host-playground-environment-settings -->

# 使用模型提供者的环境变量

<Note>
  此功能仅适用于 Helm 图表版本 0.10.27（应用程序版本 0.10.74）及更高版本。
</Note>

许多模型提供程序支持通过环境变量设置凭据和其他配置选项。这对于您希望避免在代码或配置文件中硬编码敏感信息的自托管部署非常有用。在 LangSmith 中，大多数模型交互都是通过 `playground` 服务完成的，该服务允许您直接在 pod 本身上配置许多环境变量。这对于避免在 UI 中设置凭据很有用。

## 要求

* 运行 `playground` 服务的自托管 LangSmith 实例。
* 您要配置的provider必须支持配置环境变量。检查提供商的聊天模型 [documentation](https://docs.langchain.com/oss/python/integrations/providers/overview) 了解更多信息。
* 您可能想要附加到 `playground` 服务的秘密/角色。
  * 请注意，对于 [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)，您可能需要授予 `langsmith-playground` 服务帐户必要的权限来访问云提供商中的机密或角色。

＃＃ 配置使用上面的参数，您可以将 LangSmith 实例配置为使用模型提供程序的环境变量。您可以通过修改 LangSmith Helm Chart 安装的 `langsmith_config.yaml` 文件来完成此操作。

```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
playground:
  deployment:
    extraEnv:
      - name: OPENAI_BASE_URL
        value: https://<my_proxy_url>
      - name: OPENAI_API_KEY
        valueFrom:
          secretKeyRef:
            name: <your_secret_name>
            key: api_key
  serviceAccount: # Can be useful if you want to use IRSA or workload identity
    annotations:
      eks.amazonaws.com/role-arn: <your_role_arn>
```

## VertexAI 配置

您可以使用带有密钥或工作负载身份的环境变量（适用于 GKE 的 GCP 工作负载身份或适用于 EKS 的 AWS IRSA）为 Playground 服务配置 VertexAI 凭证。

### 使用秘密

使用 Kubernetes 密钥配置 VertexAI 凭证：

```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
playground:
  deployment:
    extraEnv:
      # Playground-specific secret (recommended)
      - name: GOOGLE_VERTEX_AI_WEB_CREDENTIALS
        valueFrom:
          secretKeyRef:
            name: gcp-vertexai-secret
            key: credentials_json  # Your full service account JSON as string
      # Standard fallback option
      - name: GOOGLE_APPLICATION_CREDENTIALS
        value: /secrets/gcp-key.json
      # Optional: Set project/location if not in model config
      - name: GOOGLE_CLOUD_PROJECT
        value: "your-gcp-project-id"
      - name: VERTEXAI_PROJECT_ID
        value: "your-gcp-project-id"
      - name: VERTEXAI_LOCATION
        value: "us-central1"
    extraVolumeMounts:
      - name: gcp-secret-volume
        mountPath: /secrets
        readOnly: true
    extraVolumes:
      - name: gcp-secret-volume
        secret:
          secretName: gcp-key-json  # JSON file secret
          defaultMode: 0444
```

### 使用工作负载身份

您可以将 Playground 服务帐户配置为使用工作负载身份来承担 GCP 服务帐户角色，而无需存储凭据。这是 GKE 集群的推荐方法。

#### GCP 工作负载身份 (GKE)

对于 GKE 集群，请使用 GCP Workload Identity：

<CodeGroup>
  ```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  playground:
    deployment:
      extraEnv:
        # Optional: Set project/location if not in model config
        - name: GOOGLE_CLOUD_PROJECT
          value: "your-gcp-project-id"
        - name: VERTEXAI_PROJECT_ID
          value: "your-gcp-project-id"
        - name: VERTEXAI_LOCATION
          value: "us-central1"
      # No credentials needed - pod assumes GCP SA role via annotation
    serviceAccount:
      create: true  # Enable if not exists
      annotations:
        iam.gke.io/gcp-service-account: "vertexai-sa@your-gcp-project.iam.gserviceaccount.com"
  ```
</CodeGroup>

<Note>
  使用 GCP Workload Identity 时，请确保 GCP 服务帐户具有所需的 VertexAI 权限（例如 `roles/aiplatform.user`）。
</Note>

#### AWS IRSA (EKS)

对于 EKS 集群，您可以使用 AWS IRSA 代入 GCP 服务账户角色：

<CodeGroup>
  ```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
  playground:
    deployment:
      extraEnv:
        # Optional: Set project/location if not in model config
        - name: GOOGLE_CLOUD_PROJECT
          value: "your-gcp-project-id"
        - name: VERTEXAI_PROJECT_ID
          value: "your-gcp-project-id"
        - name: VERTEXAI_LOCATION
          value: "us-central1"
      # No credentials needed - pod assumes GCP SA role via AWS IAM role
    serviceAccount:
      create: true  # Enable if not exists
      annotations:
        eks.amazonaws.com/role-arn: arn:aws:iam::<account>:role/LangSmith-VertexAI-Role
  ```
</CodeGroup><Note>
  使用 AWS IRSA 时，请确保您的 AWS IAM 角色具有代入 GCP 服务账户角色所需的权限，并且 GCP 服务账户具有所需的 VertexAI 权限。
</Note>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-playground-environment-settings.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>