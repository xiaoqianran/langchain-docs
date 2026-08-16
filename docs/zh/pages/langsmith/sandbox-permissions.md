<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Sandbox access permissions | https://docs.langchain.com/langsmith/sandbox-permissions -->

# 沙箱访问权限

每个沙箱都有一个记录的**创建者**，即其 API 密钥或会话创建它的工作区成员。默认情况下，只有创建者才能运行命令、读取或写入文件、打开隧道或访问该沙箱上的服务 URL。其他工作区成员需要 `sandboxes:exec` [permission](/langsmith/rbac) 才能与他们未创建的沙箱进行交互。除了创建沙箱的工作区之外，无法从其他工作区访问沙箱。

## 谁能做什么

|来电者 |默认 |与 `sandboxes:exec` |
| ---| ---| ---|
|沙盒创建者 | ✅ 所有运行时操作 | ✅ 所有运行时操作 |
|其他工作区成员 | ❌ 拒绝 | ✅ 所有运行时操作 |
|不同的工作空间| ❌隐藏（视为未找到）| ❌隐藏（视为未找到）|

“运行时操作”涵盖了创建后与正在运行的沙箱交互的四种方式：

- **执行**命令（`langsmith sandbox exec`，`SandboxClient.exec`）
- **文件**操作（读、写、列出沙箱内的路径）
- **隧道** TCP 端口返回您的计算机 (`langsmith sandbox tunnel`)
- **代理**通过[service URL](/langsmith/sandbox-service-urls)请求

生命周期操作（创建、列出、更新、删除沙箱）继续使用现有的 `sandboxes:create` / `sandboxes:read` / `sandboxes:update` / `sandboxes:delete` 权限。这些都没有改变。

## 拒绝请求当请求被拒绝时，沙箱会返回 `HTTP 403` ，其中包含一个命名触发规则的正文：

```json
{
  "detail": {
    "error": "Forbidden",
    "message": "sandbox access denied: not the creator and missing sandboxes:exec"
  }
}
```

对另一个工作区中存在的沙箱的请求返回 `404 Not Found` 而不是 `403`，因此响应不会显示该沙箱是否存在于其他地方。

## 共享沙箱

您可以通过两种方式让队友使用您拥有的沙箱：

1. **将 `sandboxes:exec`** 授予自定义角色并在工作区中分配该角色。具有该角色的任何人都可以与工作区中的每个沙箱进行交互。
2. **对在沙箱内运行的 HTTP 服务使用 [service URL](/langsmith/sandbox-service-urls)**。服务 URL 使用自己的访问令牌，并且不要求接收者是工作区成员。

对于临时协作，服务 URL 方法通常更简单；当队友需要广泛的访问权限来操作他们未创建的沙箱时，请使用`sandboxes:exec`。

---

<div className="source-links">
<Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
</Callout>
<Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/sandbox-permissions.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
</Callout>
</div>