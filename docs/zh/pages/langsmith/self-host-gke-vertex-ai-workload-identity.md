<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Authenticate Vertex AI with GKE workload identity | https://docs.langchain.com/langsmith/self-host-gke-vertex-ai-workload-identity -->

# 使用 GKE 工作负载身份验证 Vertex AI

在 GKE 上运行的自托管 LangSmith 上为 Playground、Chat 和 Insights 配置无密钥 Vertex AI 身份验证。

GKE 工作负载身份联合允许这些自托管 LangSmith 服务调用 Vertex AI，而无需长期服务帐户密钥：

* 游乐场
* 聊天（Helm 中的`polly`）
* 见解

每个工作负载都使用其 Kubernetes 服务帐户 (KSA) 通过应用程序默认凭证 (ADC) 模拟 Google 服务帐户 (GSA)。

<Note>
  Chat 和 Insights 的无密钥身份验证需要 Helm 图表版本 0.17.0 或更高版本以及 LangSmith 应用程序版本 0.17.29 或更高版本。
</Note>

配置无密钥身份验证：

1. **启用 GKE 工作负载联合身份验证。** 在运行 LangSmith 的集群和节点池上启用它。参见[Workload Identity Federation for GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)。

2. **授予 GSA Vertex AI 访问权限。** 为这些模型调用创建或选择 GSA。仅在托管模型的项目中授予它`roles/aiplatform.user`：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   gcloud projects add-iam-policy-binding "<vertex-project-id>" \
     --member="serviceAccount:<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **允许每个 KSA 模拟 GSA。** 在 GSA 上授予每个调用 KSA `roles/iam.workloadIdentityUser`。将五个 KSA 占位符替换为您的 Helm 版本呈现的名称：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   for ksa in \
     "<playground-ksa>" \
     "<polly-api-ksa>" \
     "<polly-queue-ksa>" \
     "<insights-api-ksa>" \
     "<insights-queue-ksa>"; do
     gcloud iam service-accounts add-iam-policy-binding \
       "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com" \
       --role="roles/iam.workloadIdentityUser" \
       --member="serviceAccount:<cluster-project-id>.svc.id.goog[<namespace>/${ksa}]"
   done
   ```仅绑定这些特定的 KSA 主题。如果工作负载使用不同的命名空间，请针对每个 KSA 的命名空间单独运行该命令。

4. **注释每个 KSA。** 通过您的 Helm 值添加 GSA 注释。 Chat 和 Insights API 以及队列身份是单独的调用者。每个 API 和队列身份都需要注释和 IAM 绑定：

   ```yaml Helm theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   # Playground
   playground:
     deployment:
       extraEnv:
         - name: GOOGLE_CLOUD_PROJECT
           value: "<vertex-project-id>"
     serviceAccount:
       annotations:
         iam.gke.io/gcp-service-account: "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com"

   # Chat
   polly:
     apiServer:
       serviceAccount:
         annotations:
           iam.gke.io/gcp-service-account: "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com"
     queue:
       serviceAccount:
         annotations:
           iam.gke.io/gcp-service-account: "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com"

   # Insights
   engineInsightsAgent:
     apiServer:
       serviceAccount:
         annotations:
           iam.gke.io/gcp-service-account: "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com"
       deployment:
         extraEnv:
           - name: CLIO_VERTEX_AI_ADC_ENABLED
             value: "true"
           - name: GOOGLE_CLOUD_PROJECT
             value: "<vertex-project-id>"
     queue:
       serviceAccount:
         annotations:
           iam.gke.io/gcp-service-account: "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com"
       deployment:
         extraEnv:
           - name: CLIO_VERTEX_AI_ADC_ENABLED
             value: "true"
           - name: GOOGLE_CLOUD_PROJECT
             value: "<vertex-project-id>"
   ```

5. **使用 ADC 而不是显式凭据。** 在每个 Vertex AI 或 Gemini 提供程序配置中，将 **服务帐户 JSON** 留空。保持 `GOOGLE_VERTEX_AI_WEB_CREDENTIALS` 和 `GOOGLE_APPLICATION_CREDENTIALS` 未设置。当两者都存在时，LangSmith 使用显式 JSON 凭据而不是 ADC。

***

<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-gke-vertex-ai-workload-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>