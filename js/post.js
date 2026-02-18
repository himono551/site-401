// URLパラメータから記事のslugを取得
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");

function extractDateFromSlug(value) {
  return value.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "";
}

async function loadPostList() {
  try {
    const response = await fetch("./data/posts.json");
    if (response.ok) {
      const posts = await response.json();
      if (Array.isArray(posts) && posts.length > 0) {
        return posts
          .filter((post) => post && post.slug)
          .sort((a, b) => new Date(b.date || extractDateFromSlug(b.slug)) - new Date(a.date || extractDateFromSlug(a.slug)));
      }
    }
  } catch (error) {
    console.warn("posts.json load failed:", error);
  }

  const cacheResponse = await fetch("./generated/.publish-cache.json");
  if (!cacheResponse.ok) {
    throw new Error("Failed to load posts list.");
  }

  const cache = await cacheResponse.json();
  return Object.keys(cache || {})
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""))
    .map((entrySlug) => ({ slug: entrySlug, title: entrySlug, date: extractDateFromSlug(entrySlug) }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function createFooterNav(currentSlug, posts) {
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);
  if (currentIndex === -1) return null;

  const newerPost = posts[currentIndex - 1] || null;
  const olderPost = posts[currentIndex + 1] || null;

  const container = document.createElement("nav");
  container.className = "article-footer-nav";
  container.setAttribute("aria-label", "記事ナビゲーション");

  const backLink = document.createElement("a");
  backLink.className = "article-nav-link back";
  backLink.href = "archive.html";
  backLink.textContent = "一覧に戻る";

  const newerLink = document.createElement("a");
  newerLink.className = "article-nav-link";
  if (newerPost) {
    newerLink.href = `post.html?slug=${encodeURIComponent(newerPost.slug)}`;
    newerLink.textContent = `前の記事（新しい）: ${newerPost.title || newerPost.slug}`;
  } else {
    newerLink.classList.add("disabled");
    newerLink.setAttribute("aria-disabled", "true");
    newerLink.textContent = "前の記事（新しい）: なし";
  }

  const olderLink = document.createElement("a");
  olderLink.className = "article-nav-link";
  if (olderPost) {
    olderLink.href = `post.html?slug=${encodeURIComponent(olderPost.slug)}`;
    olderLink.textContent = `次の記事（古い）: ${olderPost.title || olderPost.slug}`;
  } else {
    olderLink.classList.add("disabled");
    olderLink.setAttribute("aria-disabled", "true");
    olderLink.textContent = "次の記事（古い）: なし";
  }

  container.append(backLink, newerLink, olderLink);
  return container;
}

async function loadPost() {
  const postContent = document.getElementById("post-content");
  const postTitleContainer = document.getElementById("post-title");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (!slug) {
    postContent.innerHTML = "<p>記事が見つかりません</p>";
    return;
  }

  try {
    // 事前生成済みのHTMLを読み込む（generated直下を優先）
    const candidatePaths = [`./generated/${slug}.html`, `./generated/posts/${slug}.html`];
    let response = null;

    for (const candidatePath of candidatePaths) {
      const res = await fetch(candidatePath);
      if (res.ok) {
        response = res;
        break;
      }
    }

    if (!response) throw new Error("記事が見つかりません");

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const metaTitle = parsed.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim();
    const parsedTitle = parsed.querySelector("header.post-meta h1, h1")?.textContent?.trim();
    const metaDate = parsed
      .querySelector('meta[name="article:published_time"]')
      ?.getAttribute("content")
      ?.trim();
    const slugDate = slug.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "";

    // index と同じ優先順で表示値を決定
    const displayTitle = metaTitle || parsedTitle || slug;
    const displayDate = metaDate || slugDate;

    if (parsed.body) {
      const sanitizedBody = parsed.body.cloneNode(true);
      sanitizedBody
        .querySelectorAll("style,script,link,meta,title")
        .forEach((el) => el.remove());
      sanitizedBody.querySelector("header.post-meta")?.remove();
      postContent.innerHTML = sanitizedBody.innerHTML.trim() || html;
    } else {
      postContent.innerHTML = html;
    }

    document.title = `${displayTitle} - site 401`;

    if (postTitleContainer) {
      const safeTitle = escapeHtml(displayTitle);
      const safeDate = escapeHtml(displayDate);
      postTitleContainer.innerHTML = `
        <div class="post-item">
          <div class="post-inner">
            <div class="post-left">
              <h1 class="post-title">${safeTitle}</h1>
              ${safeDate ? `<span class="post-date">${safeDate}</span>` : ""}
            </div>
          </div>
        </div>
      `;
    }

    try {
      const posts = await loadPostList();
      const footerNav = createFooterNav(slug, posts);
      if (footerNav) {
        postContent.appendChild(footerNav);
      }
    } catch (navError) {
      console.warn("記事ナビの生成に失敗:", navError);
    }
  } catch (error) {
    console.error("エラー:", error);
    postContent.innerHTML = "<p>記事の読み込みに失敗しました</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadPost);
