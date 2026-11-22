<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Authenticate Vertex AI with GKE workload identity | https://docs.langchain.com/langsmith/self-host-gke-vertex-ai-workload-identity -->

# 使用 GKE 工作负载身份验证 Vertex AI

在 GKE 上运行的自托管 LangSmith 上为 Playground、Chat、Insights 和 Fleet 配置无密钥 Vertex AI 身份验证。

GKE 工作负载身份联合允许这些自托管 LangSmith 服务调用 Vertex AI，而无需长期服务帐户密钥：

* [Playground](/langsmith/prompt-engineering-concepts#playground)
* [Chat](/langsmith/chat)（头盔中的`polly`）
* [Insights](/langsmith/insights)
* [Fleet](/langsmith/fleet/index)

每个工作负载都使用其 Kubernetes 服务帐户 (KSA) 通过应用程序默认凭证 (ADC) 模拟 Google 服务帐户 (GSA)。

> [!注意]
>
> Chat 和 Insights 的无密钥身份验证需要 Helm 图表版本 0.17.0 或更高版本以及 LangSmith 应用程序版本 0.17.29 或更高版本。对于 Fleet，它需要 Helm 图表版本 0.18.0 或更高版本以及 LangSmith 应用程序版本 0.18.2026112100 或更高版本。

配置无密钥身份验证：

1. **启用 GKE 工作负载联合身份验证。** 在运行 LangSmith 的集群和节点池上启用它。参见[Workload Identity Federation for GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)。

2. **授予 GSA Vertex AI 访问权限。** 为这些模型调用创建或选择 GSA。仅在托管模型的项目中授予它`roles/aiplatform.user`：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   gcloud projects add-iam-policy-binding "<vertex-project-id>" \
     --member="serviceAccount:<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```3. **Allow each KSA to impersonate the GSA.** Grant each calling KSA `roles/iam.workloadIdentityUser` on the GSA.将七个 KSA 占位符替换为您的 Helm 版本呈现的名称：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   for ksa in \
     "<playground-ksa>" \
     "<polly-api-ksa>" \
     "<polly-queue-ksa>" \
     "<insights-api-ksa>" \
     "<insights-queue-ksa>" \
     "<fleet-api-ksa>" \
     "<fleet-queue-ksa>"; do
     gcloud iam service-accounts add-iam-policy-binding \
       "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com" \
       --role="roles/iam.workloadIdentityUser" \
       --member="serviceAccount:<cluster-project-id>.svc.id.goog[<namespace>/${ksa}]"
   done
   ```

   仅绑定这些特定的 KSA 主题。如果工作负载使用不同的命名空间，请针对每个 KSA 的命名空间单独运行该命令。

4. **Annotate every KSA.** Add the GSA annotation through your Helm values. Chat、Insights 和 Fleet 各自在单独的 KSA 下运行一个 API 服务器和一个队列。为每个服务注释两个 KSA，并在上一步中绑定每个 KSA：

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

   # Fleet
   fleet:
     apiServer:
       serviceAccount:
         annotations:
           iam.gke.io/gcp-service-account: "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com"
       deployment:
         extraEnv:
           - name: FLEET_VERTEX_AI_ADC_ENABLED
             value: "true"
           - name: GOOGLE_CLOUD_PROJECT
             value: "<vertex-project-id>"
     queue:
       serviceAccount:
         annotations:
           iam.gke.io/gcp-service-account: "<gsa-name>@<gsa-project-id>.iam.gserviceaccount.com"
       deployment:
         extraEnv:
           - name: FLEET_VERTEX_AI_ADC_ENABLED
             value: "true"
           - name: GOOGLE_CLOUD_PROJECT
             value: "<vertex-project-id>"

   # Lets the Fleet model picker list Vertex AI models without a stored key
   platformBackend:
     deployment:
       extraEnv:
         - name: FLEET_VERTEX_AI_ADC_ENABLED
           value: "true"
   ```

   Set `FLEET_VERTEX_AI_ADC_ENABLED` on the Fleet API server, the Fleet queue, and the platform backend.有关舰队模型的限制，请参阅[Fleet model restrictions](#fleet-model-restrictions)。

5. **使用 ADC 而不是显式凭据。** 在每个 Vertex AI 或 Gemini 提供程序配置中，将 **服务帐户 JSON** 留空。保持 `GOOGLE_VERTEX_AI_WEB_CREDENTIALS` 和 `GOOGLE_APPLICATION_CREDENTIALS` 未设置。当两者都存在时，LangSmith 使用显式 JSON 凭据而不是 ADC。

## 机队型号限制

设置 `FLEET_VERTEX_AI_ADC_ENABLED` 后，每个没有存储密钥的 Fleet Vertex AI 模型都会在安装的每个工作区中调用具有相同 GSA 的 Vertex AI。为了防止该身份的访问令牌到达其他服务器，这样的模型：* 只能通过 HTTPS 调用 Google Vertex AI 端点。
* 必须使用普通位置，例如 `us-central1` 或 `global`。
* 无法设置`client_args`。

使用存储服务帐户密钥的模型没有这些限制。

## 另请参阅

* [Model providers](/langsmith/playground-model-providers#gemini-enterprise-agent-platform)：在 Playground 中选择 Vertex AI 模型。
* [Enable Fleet on self-hosted LangSmith](/langsmith/enable-self-hosted-fleet)：安装Fleet，这是本页面Fleet设置所需要的。
* [Provider authentication](/langsmith/llm-gateway-provider-authentication#configure-gemini-enterprise-agent-platform)：向 Vertex AI 验证 LLM 网关，这仍然需要服务帐户密钥。
* [Configure model providers for Engine](/langsmith/engine-self-hosted-model-providers#use-cloud-identity-for-your-model-providers)：为Engine设置工作负载身份，它使用自己的Helm设置。

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-gke-vertex-ai-workload-identity.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。