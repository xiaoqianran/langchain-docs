<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox download links | https://docs.langchain.com/langsmith/sandbox-download-links -->

# 沙盒下载链接

下载链接将一个沙箱文件传递给无法携带 LangSmith 凭证的东西：浏览器选项卡、电子邮件中的 `<a href>`、Webhook 使用者或获取您提供的 URL 的第三方服务。

该链接带有自己的令牌。使用 SDK 的 `read()` 读取文件时，每次请求都需要工作区 API 密钥；下载链接除了 URL 本身之外不需要任何其他内容。

## 快速开始

```python
from langsmith.sandbox import SandboxClient

client = SandboxClient()

with client.sandbox() as sb:
    sb.run("python -c \"open('/app/report.csv','w').write('a,b\\n1,2\\n')\"")

    link = sb.generate_download_url("/app/report.csv")
    print(link.download_url)
```

然后任何人都可以在没有凭据的情况下获取它：

```bash
curl -LO "<download_url>"
```

## 链接固定到什么位置

该令牌对沙箱、租户、确切的文件路径和响应标头进行编码，因此无法编辑链接以指向不同的文件或不同的沙箱。每个链接仅服务于一条路径。

链接固定到该路径，而不是文件的快照。创建链接时，不会捕获或复制文件本身。

<Warning>
为文件创建链接后请勿修改该文件。稍后对该路径的写入可能会也可能不会反映在链接所服务的内容中，因此在链接的生命周期内将该文件视为不可变。当内容发生变化时，编写一个新文件并为其创建一个新链接。
</Warning>链接是从沙箱自己的主机上的沙箱服务域提供的，而不是从 LangSmith API 主机提供的。因此，下载的内容与您的 LangSmith 会话隔离。

## 创建链接

<CodeGroup>

```python Python
# Never expires
link = sb.generate_download_url("/app/report.csv")

# Expires in an hour
link = sb.generate_download_url("/app/report.csv", expires_in_seconds=3600)

# Rendered in the browser instead of downloaded
link = sb.generate_download_url(
    "/app/page.html",
    content_type="text/html",
    content_disposition="inline",
)

print(link.download_url)
print(link.expires_at)  # None when the link never expires
```

```ts TypeScript
// Never expires
let link = await sandbox.generateDownloadURL("/app/report.csv");

// Expires in an hour
link = await sandbox.generateDownloadURL("/app/report.csv", {
  expiresInSeconds: 3600,
});

// Rendered in the browser instead of downloaded
link = await sandbox.generateDownloadURL("/app/page.html", {
  contentType: "text/html",
  contentDisposition: "inline",
});

console.log(link.download_url);
console.log(link.expires_at); // null when the link never expires
```

</CodeGroup>

在客户端而不是沙箱实例上调用它，以按沙箱名称创建链接：

<CodeGroup>

```python Python
link = client.generate_download_url("my-sandbox", "/app/report.csv")
```

```ts TypeScript
const link = await client.generateDownloadURL("my-sandbox", "/app/report.csv");
```

</CodeGroup>

### 选项

|选项 |默认 |效果|
|--------|---------|--------|
| `expires_in_seconds` |省略，因此链接永不过期 |链接生命周期（以秒为单位）|
| `content_type` |从文件扩展名推断 | `Content-Type` 链接响应 |
| `content_disposition` | `attachment` | `attachment` 下载文件； `inline` 在浏览器中呈现它 |

## 从 CLI 创建链接

```bash
langsmith sandbox generate-download-url my-sandbox --path /app/report.csv
```

```bash
langsmith sandbox generate-download-url my-sandbox \
  --path /app/page.html \
  --expires-in-seconds 3600 \
  --content-disposition inline
```

## 通过 REST API 创建链接

```bash
curl -X POST \
  "$LANGSMITH_ENDPOINT/api/v2/sandboxes/boxes/{sandbox_name}/download-url" \
  -H "x-api-key: $LANGSMITH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"path": "/app/report.csv", "expires_in_seconds": 3600}'
```

回应：

```json
{
  "download_url": "https://{sandbox-id}--dl.smithbox.dev/ey...",
  "token": "ey...",
  "expires_at": "2026-04-08T15:30:00Z"
}
```

当省略 `expires_in_seconds` 时，`expires_at` 为 `null`。

创建链接需要 `sandboxes:exec` 权限，与经过认证的下载所需的访问权限相同。参见[Sandbox permissions](/langsmith/sandbox-permissions)。

## 获取链接

支持`GET`和`HEAD`，以及`Range`（用于可恢复下载和部分下载）、`If-Range`和`If-None-Match`。不需要或接受任何标头、查询字符串或正文。获取链接**唤醒停止的沙箱**，因此空闲停止后的第一个请求与启动一样长。当您创建链接时，沙箱不需要运行。

## 安全考虑

<Warning>
下载链接是嵌入在 URL 中的不记名凭证。任何获得该文件的人都可以读取该文件，直至其过期。将链接视为密码：通过您信任的渠道发送，对于任何敏感内容，最好使用简短的 `expires_in_seconds`。
</Warning>

- **链接无法撤销。** 创建的链接在过期之前保持有效，即使创建它的 API 密钥被删除或丢失 `sandboxes:exec` 也是如此。在重要的时候设置一个有效期。
- **链接随沙箱消失。** 删除沙箱会使其中的每个链接失效。
- **文件不得更改。** 链接固定到路径，因此创建后对该路径的写入可能会也可能不会反映在链接的服务内容中。
- **来宾标头被删除。** 响应是根据内容、范围和验证器标头的白名单重建的。沙箱内的代码设置的 Cookie 或其他标头永远不会被转发。- **渲染的内容是沙盒的。** 每个响应都带有 `X-Content-Type-Options: nosniff` 和 `Content-Security-Policy: sandbox`，因此使用 `content_disposition=inline` 提供的文件不会呈现任何功能，也无法访问您的 LangSmith 会话。

## 下载链接与其他文件访问

| |下载链接| `read()` | [Service URLs](/langsmith/sandbox-service-urls) |
|---|---|---|---|
| **需要凭证** |无 |工作区 API 密钥 |服务令牌或浏览器 cookie |
| **范围** |一个文件，一个路径|任何文件 |沙箱中的任何 HTTP 服务 |
| **沙盒必须正在运行** |否（获取会唤醒它）|否（按需唤醒）|否（获取会唤醒它）|
| **可分享** |是的 |没有 |是的 |
| **到期前可撤销** |没有 |是（旋转钥匙）|没有 |

使用下载链接将一个文件交给外部消费者。使用 `read()` 将文件字节拉入您自己的代码中。使用服务 URL 访问沙箱内运行的 HTTP 服务器。

## 故障排除|错误|原因 |修复 |
|--------|--------|-----|
| **`501` 完好** |未为此部署配置下载链接 |自托管部署需要配置沙箱服务域；参见[Sandbox service URLs](/langsmith/sandbox-service-urls) |
| **`403` 获取** |链接已过期、已更改或出现在错误的主机上 |创建一个新的链接；逐字复制 URL |
| **`404` 获取** |该文件不再存在于该路径 |链接固定到路径，而不是文件内容。为存在的路径创建链接 |
| **浏览器下载而不是渲染** |默认处置是 `attachment` |薄荷与 `content_disposition="inline"` 和明确的 `content_type` |
| **陈旧或部分内容** |链接创建后文件被写入或替换 |不要修改链接指向的文件。写入一个新文件并创建一个新链接 |

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-download-links.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>