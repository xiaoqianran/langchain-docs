<!-- langchain-docs: machine-translated zh-CN from English source -->

<!-- langchain-docs: Store integrations | https://docs.langchain.com/oss/javascript/integrations/stores/index -->

# 商店集成

使用 LangChain JavaScript 与商店集成。

## 概述

LangChain 提供键值存储接口，用于通过键存储和检索数据。 LangChain中的键值存储接口主要用于缓存[embeddings](/oss/javascript/integrations/embeddings)。

## 接口

所有[⟦T0⟧](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore)都是**通用**并支持以下接口，其中`K`代表键类型，`V`代表值类型：

* `mget(keys: K[]): Promise<(V | undefined)[]>`：获取多个key的值，如果key不存在则返回`undefined`
* `mset(keyValuePairs: [K, V][]): Promise<void>`：设置多个key的值
* `mdelete(keys: K[]): Promise<void>`: 删除多个key
* `yieldKeys(prefix?: string): AsyncGenerator<K | string>`：异步生成存储中的所有键，可以选择按前缀过滤

接口的通用性质允许您使用不同类型的键和值。例如，`BaseStore<string, BaseMessage>`将存储带有字符串键的消息，而`BaseStore<string, number[]>`将存储数字数组。

<Note>
  基础存储旨在同时处理**多个**键值对以提高效率。这可以节省网络往返次数，并可以在底层存储中实现更高效的批处理操作。
</Note>

## 本地开发内置商店

<Columns>
  <Card title="InMemoryStore" icon="link" href="/oss/javascript/integrations/stores/in_memory" />

  <Card title="LocalFileStore" icon="link" href="/oss/javascript/integrations/stores/file_system" />
</Columns>

## 定制商店您还可以通过扩展 [⟦T10⟧](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore) 类来实现自己的自定义商店。更多详情请参阅[store interface documentation](https://reference.langchain.com/javascript/langchain-core/stores/BaseStore)。

## 所有键值存储

<div>
  |整合|下载 |
  | :------------------------------------------------------------------ | ：-------------- |
  | [⟦T11⟧](/oss/javascript/integrations/stores/in_memory) | <span>N/A</span> |
  | [⟦T12⟧](/oss/javascript/integrations/stores/file_system) | <span>N/A</span> |
</div>

***

<div>
  <Callout icon="terminal-2">
    通过 MCP 向 Claude、VSCode 等发送[Connect these docs](/use-these-docs) 以获得实时答案。
  </Callout>

  <Callout icon="edit">
    [Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/javascript/integrations/stores/index.mdx) 或 [file an issue](https://github.com/langchain-ai/docs/issues/new/choose)。
  </Callout>
</div>