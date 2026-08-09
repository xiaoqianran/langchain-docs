# LangChain Docs Mirror

Unofficial mirror of **[Docs by LangChain](https://docs.langchain.com)** — **EN + 简体中文**.

- Live: https://xiaoqianran.github.io/langchain-docs/
- Chinese: https://xiaoqianran.github.io/langchain-docs/zh/

## Source

- [`llms.txt`](https://docs.langchain.com/llms.txt) — page index
- [`llms-full.txt`](https://docs.langchain.com/llms-full.txt) — full Markdown corpus (~1500+ pages)

Covers OSS (Python / JavaScript / DeepAgents), LangSmith, Fleet, Agent Server API, and more.

Chinese pages are **machine-translated** (hash-cached under `docs/zh/`) from the English source. Prefer English for API precision.

## Local

```bash
npm install --no-save marked@15
npm run fetch
npm run translate          # zh-CN cache (optional; hash-skip)
PAGES_BASE=/langchain-docs npm run build
node scripts/serve-pages.mjs
```

## GitHub Actions

Daily fetch → zh-CN translate → build dual-locale site → GitHub Pages.
