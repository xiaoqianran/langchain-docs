<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Customize the UI | https://docs.langchain.com/langsmith/self-host-ui-customization -->

# 自定义用户界面

自托管 LangSmith 部署允许进行一些 UI 自定义。
 
## 设置自定义徽标

对于自托管部署，您可以将 LangSmith 徽标替换为您自己的徽标。该徽标出现在导航侧边栏和错误屏幕上，位于 LangSmith 文字标记旁边。

在 Helm 值中设置 `config.customLogo`：

```yaml Helm
config:
  customLogo:
    enabled: true
    logoUrl: "https://example.com/logo.svg"
```

`logoUrl` 接受 PNG、JPG 或 SVG。数据 URI 被拒绝。

### 浅色和深色模式使用不同的徽标

```yaml Helm
config:
  customLogo:
    enabled: true
    lightModeLogoUrl: "https://example.com/logo-dark-text.svg"
    darkModeLogoUrl: "https://example.com/logo-white-text.svg"
```

每个名称均指徽标出现的方案。当您仅设置一个值时，LangSmith 在两个方案中都使用它。需要 Helm 图表版本 0.17.0-rc.38 或更高版本。

### 从文件中提供徽标

每个徽标值还接受根相对路径，例如 `/logos/acme.svg`。当浏览器无法到达外部主机时使用路径。 LangSmith 从其自身来源请求路径，因此该文件必须存在于前端容器内。

要安装徽标文件：

1. 将图像存储在 ConfigMap 中。文件名成为 URL 的最后一段：

   ```bash
   kubectl create configmap langsmith-custom-logo \
     --from-file=acme.svg=./your-logo.svg \
     -n <your-namespace>
   ```

2. 将 ConfigMap 挂载到前端 pod 中，并将 `logoUrl` 指向路径：

   ```yaml Helm
   config:
     customLogo:
       enabled: true
       logoUrl: "/logos/acme.svg"

   frontend:
     deployment:
       volumes:
         - name: custom-logo
           configMap:
             name: langsmith-custom-logo
       volumeMounts:
         - name: custom-logo
           mountPath: /usr/share/nginx/html/build/logos
           readOnly: true
   ```

3. 升级版本，然后确认文件已提供：

   ```bash
   curl -sI https://<your-langsmith-host>/logos/acme.svg
   ````image/svg+xml` 的 `content-type` 确认徽标已就位。丢失的文件会返回 HTTP 200 以及应用程序的 HTML，而不是 404，因此请检查内容类型而不是状态代码。

<Note>
当您的值已设置 `frontend.deployment.volumes` 或 `frontend.deployment.volumeMounts` 时，请附加到这些列表。替换它们会删除其他设置所依赖的安装。
</Note>

当您在基本路径下提供 LangSmith 时，请将其包含在值中：`/<base-path>/logos/acme.svg`。有关 Helm 值的完整列表，请参阅 [Environment variables](/langsmith/self-host-environment-variables)。

## 设置自定义错误支持消息

默认情况下，LangSmith 中的错误消息会将用户引导至[Support Portal](https://support.langchain.com)。您可以将其替换为您自己的支持联系信息。

设置后，整个 UI 中的所有错误和支持消息都将显示您的自定义文本，而不是默认的 LangChain 支持电子邮件。

<Note>
自定义消息仅呈现为**纯文本**。 HTML 标签不会被解释，并将显示为文字文本。
</Note>

```yaml Helm
config:
  customErrorSupportMessage: "For help, contact your internal IT team at helpdesk@example.com"
```

要恢复为默认行为，请删除该设置或将其设置为空字符串。

---

<div className="source-links">
<Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/self-host-ui-customization.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>