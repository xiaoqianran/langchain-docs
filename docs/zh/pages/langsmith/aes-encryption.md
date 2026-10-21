<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure AES encryption at rest | https://docs.langchain.com/langsmith/aes-encryption -->

# 配置静态 AES 加密

为代理服务器数据配置内置 AES 加密和惰性密钥轮换。

内置 AES 加密是对代理服务器静态数据进行加密的推荐方法。仅当您需要每个租户密钥或外部密钥管理系统时才使用 [custom encryption handlers](/langsmith/custom-encryption)。

## 配置AES加密

设置 `LANGGRAPH_AES_KEY` 自动加密检查点 blob：

1. 将 `pycryptodome` 添加到 `langgraph.json` 中的依赖项：
   ```json theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   {
     "dependencies": [".", "pycryptodome"],
     "graphs": {
       "agent": "./agent.py:graph"
     }
   }
   ```

2. 将 `LANGGRAPH_AES_KEY` 分别设置为 AES-128、AES-192 或 AES-256 的 16、24 或 32 字节密钥。

### 加密 JSON 字段

将 `LANGGRAPH_AES_JSON_KEYS` 设置为要加密的 JSON 密钥的逗号分隔列表：

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGGRAPH_AES_KEY="your-16-24-or-32-byte-key"
export LANGGRAPH_AES_JSON_KEYS="api_key,secret_token,user_credentials"
```

这些密钥无论出现在线程、助手、运行、cron 和存储数据中的任何位置都会被加密。

> [!警告]
>
> 无法搜索或过滤加密字段。

系统字段无法加密：`langgraph_version`、`langgraph_api_version`、`langgraph_plan`、`langgraph_host`、`langgraph_api_url`、`langgraph_request_id`、`langgraph_auth_user_id`、`langgraph_auth_permissions`。

## 轮换 AES 密钥

> [!注意]
>
> AES 密钥轮换需要 Agent Server 版本`0.17.0.dev3` 或更高版本、带有 `PREFER_GRPC_CHECKPOINTER=true` 的 PostgreSQL 检查点以及带有 `LANGGRAPH_STORE_BACKEND=grpc` 的 Go 存储。 Python、自定义、SQLite 和 MongoDB 检查指针不支持轮换。Agent Server 使用`LANGGRAPH_AES_KEY` 加密新数据。密钥信封标识哪个配置的密钥解密每个值。当代理服务器读取使用旧密钥加密的数据时，它会返回明文并使用当前密钥延迟重新加密存储的值。

要轮换密钥：

1. 在每个副本上配置当前主键和未来键：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGGRAPH_AES_KEY="your-current-16-24-or-32-byte-key"
   export LANGGRAPH_AES_FALLBACK_KEYS="your-future-16-24-or-32-byte-key"
   ```

2. 将此配置推广到每个副本。

3. 当每个副本都可以解密两个密钥后，将`LANGGRAPH_AES_KEY`切换为未来的密钥。

4. 在两个兼容性设置中保留旧密钥：

   ```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
   export LANGGRAPH_AES_KEY="your-future-16-24-or-32-byte-key"
   export LANGGRAPH_AES_LEGACY_KEY="your-old-16-24-or-32-byte-key"
   export LANGGRAPH_AES_FALLBACK_KEYS="your-old-16-24-or-32-byte-key"
   ```

   `LANGGRAPH_AES_LEGACY_KEY` 解密未标记的历史密文。 `LANGGRAPH_AES_FALLBACK_KEYS` 解密使用旧密钥创建的标记密文。

5. 保留旧密钥的配置，直到遥测确认不再需要它们。

> [!警告]
>
> * 在每个副本都可以解密两个密钥之前，切勿更改主密钥。
> * 延迟旋转仅更新访问的行。冷行和比较和交换未命中可能会保留旧的密文。
> * 过早删除密钥可能会使保留的数据不可读。
> * 一旦存在密钥-信封密文，不支持信封的 Agent Server 版本将无法读取它。

## 相关

* [Choose an encryption approach](/langsmith/encryption)
* [Configure custom encryption](/langsmith/custom-encryption)

***

[Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/aes-encryption.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。