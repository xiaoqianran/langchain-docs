#!/usr/bin/env node
/**
 * Fetch LangChain docs from docs.langchain.com:
 *  - llms.txt (index)
 *  - llms-full.txt (full corpus) → split by "# Title\\nSource: url"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const PAGES = path.join(DOCS, "pages");
const TIMEOUT_MS = Math.max(30000, Number(process.env.FETCH_TIMEOUT_MS || 180000));
const UA =
  process.env.FETCH_UA ||
  "langchain-docs-mirror/1.0 (+https://github.com/xiaoqianran/langchain-docs)";

const LLMS_TXT = process.env.LC_LLMS_TXT || "https://docs.langchain.com/llms.txt";
const LLMS_FULL = process.env.LC_LLMS_FULL || "https://docs.langchain.com/llms-full.txt";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sanitize(text) {
  let t = String(text);
  t = t.replace(/\bghp_[A-Za-z0-9]{20,}\b/g, "ghp_REDACTED");
  t = t.replace(/\bsk-[A-Za-z0-9]{20,}\b/g, "sk-REDACTED");
  t = t.replace(/\bls[vp]_[A-Za-z0-9]{10,}\b/g, "ls_REDACTED");
  return t;
}

function isHtml(text) {
  const t = String(text).trimStart().slice(0, 200).toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html") || t.startsWith("<head");
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/plain, text/markdown;q=0.9, */*;q=0.1",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return new TextDecoder("utf-8").decode(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

function urlToRel(url) {
  let u = String(url).trim();
  u = u.replace(/^https?:\/\/docs\.langchain\.com\/?/i, "");
  u = u.replace(/\.md$/i, "");
  u = u.replace(/\/+$/, "");
  if (!u) return "index.md";
  return u + ".md";
}

function trackForRel(rel) {
  const segs = rel.replace(/\.md$/, "").split("/");
  const a = segs[0] || "home";
  const b = segs[1] || "";
  if (a === "oss") {
    if (b === "python") return { id: "oss-python", name: "OSS · Python" };
    if (b === "javascript" || b === "js") return { id: "oss-js", name: "OSS · JavaScript" };
    if (b === "deepagents") return { id: "oss-deepagents", name: "OSS · DeepAgents" };
    if (b === "openwiki") return { id: "oss-openwiki", name: "OSS · OpenWiki" };
    return { id: "oss-other", name: "OSS · Other" };
  }
  if (a === "langsmith") {
    if (b === "smith-api") return { id: "langsmith-api", name: "LangSmith API" };
    if (b === "agent-server-api") return { id: "agent-server-api", name: "Agent Server API" };
    if (b === "fleet") return { id: "fleet", name: "Fleet" };
    if (b === "python") return { id: "langsmith-py", name: "LangSmith · Python" };
    if (b === "javascript") return { id: "langsmith-js", name: "LangSmith · JS" };
    return { id: "langsmith", name: "LangSmith" };
  }
  if (a === "api-reference") return { id: "api-reference", name: "API Reference" };
  if (a === "langgraph") return { id: "langgraph", name: "LangGraph" };
  return { id: a.replace(/[^a-z0-9-]+/gi, "-").slice(0, 40) || "other", name: a };
}

function groupForRel(rel) {
  const segs = rel.replace(/\.md$/, "").split("/");
  if (segs.length >= 3) return segs[2];
  if (segs.length >= 2) return segs[1];
  return "pages";
}

function splitFull(text) {
  const parts = text.split(/(?=^# .+\nSource: https?:\/\/)/m);
  const pages = [];
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^# (.+)\nSource: (https?:\/\/\S+)\n+([\s\S]*)$/);
    if (!m) continue;
    const title = m[1].trim();
    const url = m[2].trim().replace(/[)#\s]+$/, "");
    let body = m[3].trim();
    // strip mintlify doc index boilerplate if present at top of body
    body = body.replace(
      /^>\s*##\s*Documentation Index[\s\S]*?further\.\s*/i,
      "",
    );
    if (!body.startsWith("#")) body = `# ${title}\n\n` + body;
    pages.push({ title, url, body, rel: urlToRel(url) });
  }
  return pages;
}

function parseLlmsTxt(text) {
  const links = [];
  const re = /\[([^\]]+)\]\((https?:\/\/docs\.langchain\.com[^)\s]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    links.push({ title: m[1].trim(), url: m[2].trim() });
  }
  return links;
}

async function main() {
  ensureDir(DOCS);
  fs.rmSync(PAGES, { recursive: true, force: true });
  ensureDir(PAGES);

  console.log("Downloading llms.txt …");
  const llms = await fetchText(LLMS_TXT);
  if (isHtml(llms)) throw new Error("llms.txt returned HTML");
  fs.writeFileSync(path.join(DOCS, "llms.txt"), llms);
  const toc = parseLlmsTxt(llms);
  console.log(`TOC links: ${toc.length}`);

  console.log("Downloading llms-full.txt (large) …");
  const full = await fetchText(LLMS_FULL);
  if (isHtml(full)) throw new Error("llms-full returned HTML");
  fs.writeFileSync(path.join(DOCS, "llms-full.txt"), full);
  console.log(`full bytes: ${Buffer.byteLength(full)}`);

  const pages = splitFull(full);
  console.log(`split pages: ${pages.length}`);

  // dedupe by rel (prefer longer body)
  const byRel = new Map();
  for (const p of pages) {
    const prev = byRel.get(p.rel);
    if (!prev || p.body.length > prev.body.length) byRel.set(p.rel, p);
  }

  let ok = 0;
  const written = [];
  for (const p of byRel.values()) {
    if (p.body.trim().length < 20) continue;
    const out = path.join(PAGES, p.rel);
    ensureDir(path.dirname(out));
    const header = `<!-- langchain-docs: ${p.title} | ${p.url} -->\n\n`;
    fs.writeFileSync(out, sanitize(header + p.body));
    const track = trackForRel(p.rel);
    written.push({
      rel: p.rel,
      title: p.title,
      url: p.url,
      track: track.id,
      trackName: track.name,
      group: groupForRel(p.rel),
      bytes: Buffer.byteLength(p.body),
    });
    ok++;
  }

  // index.md
  const byTrack = new Map();
  for (const w of written) {
    if (!byTrack.has(w.track)) byTrack.set(w.track, { name: w.trackName, n: 0 });
    byTrack.get(w.track).n++;
  }
  const indexMd = [
    `# LangChain documentation mirror`,
    ``,
    `Unofficial mirror of [Docs by LangChain](https://docs.langchain.com).`,
    ``,
    `- Source: \`llms-full.txt\` + \`llms.txt\``,
    `- Pages: ${ok}`,
    `- TOC links: ${toc.length}`,
    ``,
    `## Sections`,
    ``,
    ...[...byTrack.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .map(([id, v]) => `- **${v.name}** (\`${id}\`): ${v.n} pages`),
    ``,
  ].join("\n");
  fs.writeFileSync(path.join(PAGES, "index.md"), indexMd);

  const list = {
    fetchedAt: new Date().toISOString(),
    method: "llms-full-split",
    sources: { llmsTxt: LLMS_TXT, llmsFull: LLMS_FULL },
    tocLinks: toc.length,
    ok,
    failed: 0,
    tracks: Object.fromEntries(
      [...byTrack.entries()].map(([id, v]) => [id, { name: v.name, count: v.n }]),
    ),
    pages: written,
  };
  fs.writeFileSync(path.join(DOCS, "list.json"), JSON.stringify(list, null, 2));

  // meta tree for nav (track → group → items)
  const tree = {};
  for (const w of written) {
    if (!tree[w.track]) tree[w.track] = { id: w.track, name: w.trackName, groups: {} };
    if (!tree[w.track].groups[w.group]) tree[w.track].groups[w.group] = [];
    tree[w.track].groups[w.group].push({ title: w.title, rel: w.rel });
  }
  fs.writeFileSync(path.join(DOCS, "meta-tree.json"), JSON.stringify(tree, null, 2));

  console.log(`Done: wrote ${ok} pages`);
  if (ok < 100) {
    console.error("Too few pages");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
