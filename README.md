# LangChain Docs Mirror

Unofficial mirror of **[Docs by LangChain](https://docs.langchain.com)**.

## Source

- [`llms.txt`](https://docs.langchain.com/llms.txt) — page index
- [`llms-full.txt`](https://docs.langchain.com/llms-full.txt) — full Markdown corpus (~1500+ pages)

Covers OSS (Python / JavaScript / DeepAgents), LangSmith, Fleet, Agent Server API, and more.

## Local

```bash
npm install --no-save marked@15
npm run fetch
PAGES_BASE=/langchain-docs npm run build
node scripts/serve-pages.mjs
```

## GitHub Actions

Daily fetch → build → GitHub Pages.
