import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_VAULT_ROOT =
  "/Users/user/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian_iCloud";
const vaultRoot = process.env.OBSIDIAN_VAULT_ROOT || DEFAULT_VAULT_ROOT;

const journalDir = process.env.JOURNAL_DIR || path.join(vaultRoot, "Journal");
const scriptsDir = process.env.OBSIDIAN_SCRIPTS_DIR || path.join(vaultRoot, "Scripts");
const addFrontmatterScript = path.join(scriptsDir, "add-frontmatter.mjs");
const publishScript = path.join(scriptsDir, "obsidian-publish.mjs");

const outHtmlDir = process.env.OUT_HTML_DIR || path.join(projectRoot, "generated");
const outMdDir = process.env.OUT_MD_DIR || "";
const cachePath = process.env.PUBLISH_CACHE_PATH || path.join(outHtmlDir, ".publish-cache.json");
const postsJsonPath = path.join(projectRoot, "data", "posts.json");

const requirePublish = process.argv.includes("--require-publish");
const withFrontmatter = process.argv.includes("--with-frontmatter");
const keepCache = process.argv.includes("--keep-cache");
const maskDisplay = "■■■";

function runNode(args, label) {
  const result = spawnSync("node", args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function main() {
  if (!keepCache && fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
  }

  if (withFrontmatter) {
    runNode([addFrontmatterScript, "--src", journalDir], "add-frontmatter");
  }

  const publishArgs = [
    publishScript,
    "--src",
    journalDir,
    "--out-html",
    outHtmlDir,
    "--cache",
    cachePath,
  ];

  if (outMdDir) {
    publishArgs.push("--out-md", outMdDir);
  }
  if (requirePublish) {
    publishArgs.push("--require-publish");
  }

  runNode(publishArgs, "obsidian-publish");
  rewriteMaskDisplay();
  writePostsJson();
}

function applyMaskDisplay(text) {
  return text
    .replace(/\[REDACTED\]/g, maskDisplay)
    .replace(/\[EMAIL\]/g, maskDisplay)
    .replace(/\[PHONE\]/g, maskDisplay)
    .replace(/\[POSTAL\]/g, maskDisplay)
    .replace(/\[CARD\]/g, maskDisplay)
    .replace(/\[ID12\]/g, maskDisplay);
}

function rewriteMaskDisplay() {
  const htmlFiles = fs.readdirSync(outHtmlDir, { withFileTypes: true })
    .filter((ent) => ent.isFile() && ent.name.endsWith(".html"))
    .map((ent) => path.join(outHtmlDir, ent.name));

  for (const htmlPath of htmlFiles) {
    const raw = fs.readFileSync(htmlPath, "utf8");
    const next = applyMaskDisplay(raw);
    if (next !== raw) {
      fs.writeFileSync(htmlPath, next, "utf8");
    }
  }
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractMetaContent(html, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`<meta\\s+[^>]*${escaped}[^>]*content=\"([^\"]*)\"[^>]*>`, "i");
  return decodeHtmlEntities((html.match(regex) || [])[1] || "");
}

function extractFirstParagraph(html) {
  const match = html.match(/<p>([\s\S]*?)<\/p>/i);
  if (!match) return "";
  return applyMaskDisplay(stripTags(decodeHtmlEntities(match[1])));
}

function extractDateFromSlug(slug) {
  return (slug.match(/\d{4}-\d{2}-\d{2}/) || [""])[0];
}

function writePostsJson() {
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
  const slugs = Object.keys(cache)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/i, ""));

  const posts = slugs
    .map((slug) => {
      const htmlPath = path.join(outHtmlDir, `${slug}.html`);
      if (!fs.existsSync(htmlPath)) return null;

      const html = fs.readFileSync(htmlPath, "utf8");
      const title = extractMetaContent(html, 'property="og:title"') || slug;
      const date = extractDateFromSlug(slug) || extractMetaContent(html, 'name="article:published_time"');
      const excerpt = extractFirstParagraph(html).slice(0, 140);

      return { title, date, slug, excerpt };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(path.dirname(postsJsonPath), { recursive: true });
  fs.writeFileSync(postsJsonPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  console.log(`postsJson=${postsJsonPath}`);
}

main();
