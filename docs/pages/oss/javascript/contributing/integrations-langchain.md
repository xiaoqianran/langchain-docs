<!-- langchain-docs: Contributing integrations | https://docs.langchain.com/oss/javascript/contributing/integrations-langchain -->

# Contributing integrations

**Integrations are a core component of LangChain.**

LangChain provides standard interfaces for several different components (language models, vector stores, etc) that are crucial when building LLM applications. Implementing a new integration helps expand LangChain's ecosystem and makes your service discoverable to millions of developers.

> [!WARNING]
>
> New integrations are **not accepted as PRs** to any `langchain-ai` repository. All new integrations must be published as independent packages to PyPI (e.g., `langchain-yourprovider`). The only PR you should open to a `langchain-ai` repo is to list your published package in the docs: either a YAML row for the download table, or a hosted guide if you meet the [eligibility criteria](/oss/javascript/contributing/publish-langchain#eligibility-for-hosted-guides).

## Why implement a LangChain integration?

> [card] Discoverability
>
> LangChain is the most used framework for building LLM applications, with over 200 million monthly downloads.

> [card] Interoperability
>
> LangChain components expose a standard interface, allowing developers to easily swap them for each other. If you implement a LangChain integration, any developer using a different component will easily be able to swap yours in.

> [card] Best Practices
>
> Through their standard interface, LangChain components encourage and facilitate best practices (streaming, async, etc.) that improve developer experience and application performance.

## Components to integrate

While any component can be integrated into LangChain, there are specific types of integrations we encourage more:

**Integrate these ✅**:

* [**Chat Models**](/oss/javascript/integrations/chat): Most actively used component type
* [**Tools/Toolkits**](/oss/javascript/integrations/tools): Enable agent capabilities
* [**Retrievers**](/oss/javascript/integrations/retrievers): Core to RAG applications
* [**Embedding Models**](/oss/javascript/integrations/embeddings): Foundation for vector operations
* [**Vector Stores**](/oss/javascript/integrations/vectorstores): Essential for semantic search
* [**Middleware**](/oss/javascript/integrations/middleware): Extend agent behavior with hooks
* [**Sandboxes**](/oss/javascript/deepagents/sandboxes): Run code safely with Deep Agents

**Not these ❌**:

* **LLMs (Text-Completion Models)**: Deprecated in favor of [Chat Models](/oss/javascript/integrations/chat)
* [**Document Loaders**](/oss/javascript/integrations/document_loaders): High maintenance burden
* [**Key-Value Stores**](/oss/javascript/integrations/stores): Limited usage
* **Document Transformers**: Niche use cases
* **Model Caches**: Infrastructure concerns
* **Graphs**: Complex abstractions
* **Message Histories**: Storage abstractions
* **Callbacks**: System-level components
* **Chat Loaders**: Limited demand
* **Adapters**: Edge case utilities

## How to contribute an integration

**1. Implement your package**

> [card] [How to implement a LangChain integration](/oss/javascript/contributing/implement-langchain)

**2. Pass standard tests**

If applicable, implement support for LangChain's [standard test](/oss/javascript/contributing/standard-tests-langchain) suite for your integration and successfully run them.

**3. Publish integration**

> [card] [How to publish an integration](/oss/javascript/contributing/publish-langchain)

**4. List your integration**

Open a PR in the LangChain [docs repo](https://github.com/langchain-ai/docs) so users can find your package. Hosted guides are limited; most integrations are listed via YAML.

> [accordion] How listing works
>
> **Default (under 50,000 monthly downloads, not featured):** File an [Integration listing issue](https://github.com/langchain-ai/docs/issues/new?template=06-integration-submission.yml). After a maintainer applies `integration-run`, automation opens a PR that adds a row to [`scripts/data/integration_external_docs.yaml`](https://github.com/langchain-ai/docs/blob/main/scripts/data/integration_external_docs.yaml). The name column links to your `docs_url` (partner docs preferred, then GitHub, then PyPI or npm). Do not open a manual listing PR or add a new MDX page; automation closes those PRs and redirects to the issue form.
>
> **Hosted guide (50,000+ monthly downloads, or featured by maintainers):** Create a page under `src/oss/python/integrations/<component_type>/` from a template:
>
> * [Chat models](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/chat/TEMPLATE.mdx)
> * [Tools and toolkits](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/tools/TEMPLATE.mdx)
> * [Middleware](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/middleware/TEMPLATE.mdx)
> * [Vector stores](https://github.com/langchain-ai/docs/blob/main/src/oss/python/integrations/vectorstores/TEMPLATE.mdx)
>
> For full steps, eligibility details, and rejection criteria, see [Publish an integration](/oss/javascript/contributing/publish-langchain#make-your-integration-discoverable).

**5. Co-marketing**

(Optional) Engage with the LangChain team for joint [co-marketing](/oss/javascript/contributing/comarketing).

***

[Connect these docs](/use-these-docs) to your agent of choice via MCP for real-time answers.

[Edit this page on GitHub](https://github.com/langchain-ai/docs/edit/main/src/oss/contributing/integrations-langchain.mdx) or [file an issue](https://github.com/langchain-ai/docs/issues/new/choose).