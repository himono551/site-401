const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..", "..");
const postsDir = path.join(rootDir, "legacy", "posts_local_copy");
const outputDir = path.join(rootDir, "generated", "posts");
const dataDir = path.join(rootDir, "data");
const postsJsonPath = path.join(dataDir, "posts.json");

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return { frontMatter: {}, content: markdown };
  }

  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) {
    return { frontMatter: {}, content: markdown };
  }

  const raw = markdown.slice(4, end).split("\n");
  const frontMatter = {};

  for (const line of raw) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    if (key) frontMatter[key] = value;
  }

  const content = markdown.slice(end + 5);
  return { frontMatter, content };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseInline(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inList = false;
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    html.push(`<p>${parseInline(paragraphBuffer.join(" "))}</p>`);
    paragraphBuffer = [];
  };

  const closeList = () => {
    if (!inList) return;
    html.push("</ul>");
    inList = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${parseInline(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${parseInline(listItem[1])}</li>`);
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  closeList();

  return `${html.join("\n")}\n`;
}

function extractTitle(content, fallbackSlug) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match && match[1]) return match[1].trim();

  return fallbackSlug
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function stripMarkdown(mdText) {
  return mdText
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]+\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

function extractExcerpt(content) {
  const paragraphs = content
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !p.startsWith("#"));

  const first = paragraphs[0] || "";
  const plain = stripMarkdown(first);

  if (plain.length <= 100) return plain;
  return `${plain.slice(0, 97)}...`;
}

function extractDate(slug, frontMatterDate) {
  if (frontMatterDate) return frontMatterDate;
  const match = slug.match(/^(\d{4}-\d{2}-\d{2})-/);
  if (match) return match[1];
  return new Date().toISOString().slice(0, 10);
}

async function build() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

  const entries = await fs.readdir(postsDir, { withFileTypes: true });
  const mdFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name);

  const metadata = [];

  for (const fileName of mdFiles) {
    const slug = path.basename(fileName, ".md");
    const filePath = path.join(postsDir, fileName);
    const markdown = await fs.readFile(filePath, "utf8");

    const { frontMatter, content } = parseFrontMatter(markdown);
    const title = frontMatter.title || extractTitle(content, slug);
    const excerpt = frontMatter.excerpt || extractExcerpt(content);
    const date = extractDate(slug, frontMatter.date);

    const html = markdownToHtml(content);
    const htmlPath = path.join(outputDir, `${slug}.html`);
    await fs.writeFile(htmlPath, html, "utf8");

    metadata.push({
      title,
      date,
      slug,
      excerpt,
    });
  }

  metadata.sort((a, b) => new Date(b.date) - new Date(a.date));

  await fs.writeFile(postsJsonPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

  console.log(`Built ${metadata.length} posts.`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
