<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Configure AES encryption at rest | https://docs.langchain.com/langsmith/aes-encryption -->

# 配置静态 AES 加密

Configure built-in AES encryption and lazy key rotation for Agent Server data.

内置 AES 加密是对代理服务器静态数据进行加密的推荐方法。仅当您需要每个租户密钥或外部密钥管理系统时才使用 [custom encryption handlers](/langsmith/custom-encryption)。

## 配置AES加密

设置 `LANGGRAPH_AES_KEY` 自动加密检查点 blob：

1. Add `pycryptodome` to your dependencies in `langgraph.json`:
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

Set `LANGGRAPH_AES_JSON_KEYS` to a comma-separated list of JSON keys to encrypt:

```bash theme={"theme":{"light":"catppuccin-latte","dark":"catppuccin-mocha"}}
export LANGGRAPH_AES_KEY="your-16-24-or-32-byte-key"
export LANGGRAPH_AES_JSON_KEYS="api_key,secret_token,user_credentials"
```

这些密钥无论出现在线程、助手、运行、cron 和存储数据中的任何位置都会被加密。

<Warning>
  无法搜索或过滤加密字段。
</Warning>

System fields cannot be encrypted: `langgraph_version`, `langgraph_api_version`, `langgraph_plan`, `langgraph_host`, `langgraph_api_url`, `langgraph_request_id`, `langgraph_auth_user_id`, and `langgraph_auth_permissions`.

## 轮换 AES 密钥

<Note>
  AES key rotation requires Agent Server version `0.17.0.dev3` or later, the PostgreSQL checkpointer with `PREFER_GRPC_CHECKPOINTER=true`, and the Go store with `LANGGRAPH_STORE_BACKEND=grpc`. Python, custom, SQLite, and MongoDB checkpointers do not support rotation.
</Note>Agent Server 使用`LANGGRAPH_AES_KEY` 加密新数据。密钥信封标识哪个配置的密钥解密每个值。当代理服务器读取使用旧密钥加密的数据时，它会返回明文并使用当前密钥延迟重新加密存储的值。

To rotate a key:

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

<Warning>
  * 在每个副本都可以解密两个密钥之前，切勿更改主密钥。
  * 延迟旋转仅更新访问的行。冷行和比较和交换未命中可能会保留旧的密文。
  * 过早删除密钥可能会使保留的数据不可读。
  * 一旦存在密钥-信封密文，不支持信封支持的 Agent Server 版本将无法读取它。
</Warning>

## 相关

* [Choose an encryption approach](/langsmith/encryption)
* [Configure custom encryption](/langsmith/custom-encryption)

***<div>
  <Callout icon="terminal-2">
    [Connect these docs](/use-these-docs) 通过 MCP 发送给您选择的代理以获得实时解答。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/langsmith/aes-encryption.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>