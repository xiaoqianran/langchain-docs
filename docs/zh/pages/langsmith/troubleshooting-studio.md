<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Studio troubleshooting | https://docs.langchain.com/langsmith/troubleshooting-studio -->

## Safari 连接问题

Safari 会阻止本地主机上的纯 HTTP 流量。当使用 `langgraph dev` 运行 Studio 时，您可能会看到“无法加载助手”错误。

### 解决方案 1：使用 Cloudflare Tunnel

<Tabs>
  <Tab title="Python">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -U langgraph-cli>=0.2.6
    langgraph dev --tunnel
    ```
  </Tab>

  <Tab title="JS">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Requires @langchain/langgraph-cli>=0.0.26
    npx @langchain/langgraph-cli dev --tunnel
    ```
  </Tab>
</Tabs>

该命令输出隧道 URL。连接工作室：

1. 复制隧道 URL（例如 `https://hamilton-praise-heart-costumes.trycloudflare.com`）
2. `https://smith.langchain.com/studio/`开放工作室
3. 单击“**连接到本地服务器**”
4. 粘贴隧道 URL 并将其添加到 **允许的来源**
5. 单击“**连接**”

为了安全起见，需要执行此手动步骤 - Studio 在连接到外部 URL 之前需要明确的用户确认。

<Note>
  Cloudflare 隧道可能不可靠，并且可能会间歇性断开连接。
</Note>

### 解决方案 2：使用 Chromium 浏览器

Chrome 和其他 Chromium 浏览器允许在本地主机上使用 HTTP。使用`langgraph dev`无需额外配置。

## Chrome 连接问题

从 Chrome 版本 142 开始，当尝试通过 [⟦T12⟧](/langsmith/cli) 将 [LangSmith Studio](/langsmith/studio) 连接到本地开发服务器时，您可能会遇到“未能初始化 Studio”错误，并显示“TypeError: Failed to fetch”。即使 `http://127.0.0.1:2024/docs` 处的 API 服务器成功加载，也会发生这种情况。**根本原因：** Chrome 142 完全强制执行专用网络访问 (PNA) 规范，没有回退，默认情况下会阻止 HTTPS 站点（如 `https://smith.langchain.com`）访问 HTTP 本地主机服务器。

### 症状

* 运行`langgraph dev`成功启动服务器。
* 导航到 `http://127.0.0.1:2024/docs` 可以正确显示 API 文档。
* `https://smith.langchain.com` 的 LangSmith Studio 显示：“无法初始化 Studio - 请验证 API 服务器是否正在运行或可从浏览器访问。类型错误：无法获取”。
* 浏览器控制台显示错误，例如：`Permission was denied for this request to access the 'unknown' address space`。

### 解决方案：在 Chrome 中允许本地网络访问

1. 在 Chrome 中打开位于`https://smith.langchain.com`的 LangSmith Studio。
2. 单击地址栏左侧的**锁定图标**（或站点信息图标）。
3. 在下拉列表中查找**“本地网络访问”**选项。
4. 将设置从 **“询问（默认）”** 或 **“阻止”** 更改为 **“允许”**。
5. 重新加载页面。

Studio 现在应该成功连接到您的本地开发服务器。

### 其他故障排除

**检查浏览器扩展冲突**

浏览器扩展（尤其是 Ollama Chrome 扩展或 AI 模型扩展）可能会干扰本地主机连接：1. 暂时禁用所有浏览器扩展。
2. 重新启动 Chrome。
3. 尝试再次连接到 Studio。
4. 如果有效，请一一重新启用扩展程序以找出罪魁祸首。

**验证依赖项是否是最新的**

```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
pip install -U "langgraph-cli[inmem]"
```

**清除浏览器缓存和站点数据**

1. 在 Chrome 中，转至 **设置** > **隐私和安全** > **网站设置**。
2. 在列表中找到`https://smith.langchain.com`。
3. 单击**清除数据**。
4. 重新启动 Chrome 并重试。

## 勇敢的连接问题

当启用 Brave Shields 时，Brave 会阻止本地主机上的纯 HTTP 流量。当使用 `langgraph dev` 运行 Studio 时，您可能会看到“无法加载助手”错误。

### 解决方案 1：禁用 Brave 护盾

使用 URL 栏中的 Brave 图标禁用 LangSmith 的 Brave Shields。

### 解决方案 2：使用 Cloudflare Tunnel

<Tabs>
  <Tab title="Python">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    pip install -U langgraph-cli>=0.2.6
    langgraph dev --tunnel
    ```
  </Tab>

  <Tab title="JS">
    ```shell theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    # Requires @langchain/langgraph-cli>=0.0.26
    npx @langchain/langgraph-cli dev --tunnel
    ```
  </Tab>
</Tabs>

该命令输出隧道 URL。连接工作室：

1. 复制隧道 URL（例如`https://hamilton-praise-heart-costumes.trycloudflare.com`）
2. `https://smith.langchain.com/studio/`开放工作室
3. 单击“**连接到本地服务器**”
4. 粘贴隧道 URL 并将其添加到 **允许的来源**
5. 单击“**连接**”

为了安全起见，需要执行此手动步骤 - Studio 在连接到外部 URL 之前需要明确的用户确认。## 图边问题

未定义的条件边可能会在图表中显示意外的连接。这是
因为如果没有正确的定义，Studio 会假设条件边可以访问所有其他节点。要解决此问题，请使用以下方法之一显式定义路由路径：

### 解决方案1：路径图

定义路由器输出和目标节点之间的映射：

<Tabs>
  <Tab title="Python">
    ```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    graph.add_conditional_edges("node_a", routing_function, {True: "node_b", False: "node_c"})
    ```
  </Tab>

  <Tab title="Javascript">
    ```ts theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
    graph.addConditionalEdges("node_a", routingFunction, { true: "node_b", false: "node_c" });
    ```
  </Tab>
</Tabs>

<a />

### 解决方案 2：路由器类型定义

使用 Python 的 `Literal` 类型指定可能的路由目的地：

```python theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
def routing_function(state: GraphState) -> Literal["node_b","node_c"]:
    if state['some_condition'] == True:
        return "node_b"
    else:
        return "node_c"
```

## 在 Studio 中进行实验故障排除

### **运行实验**按钮被禁用

检查以下内容：

* **部署的应用程序**：如果您的应用程序部署在 LangSmith 上，您可能需要创建新的修订版才能启用此功能。
* **本地开发服务器**：如果您在本地运行应用程序，请确保您已升级到最新版本的`langgraph-cli`（`pip install -U langgraph-cli`）。此外，请通过在项目的 `.env` 文件中设置 `LANGSMITH_API_KEY` 来确保启用跟踪。

### 评估器结果缺失当您运行实验时，任何附加的评估器都会被安排在队列中执行。如果您没有立即看到结果，则可能意味着结果仍在等待中。

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/troubleshooting-studio.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>