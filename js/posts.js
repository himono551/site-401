// 投稿取得・一覧表示ロジック(最新5件と全件)
async function fetchPosts() {
    const slugs = await loadSlugs();

    const posts = await Promise.all(
        slugs.map(async (slug) => {
            const response = await fetch(`./generated/${slug}.html`);
            if (!response.ok) return null;

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, "text/html");

            const title =
                doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
                doc.querySelector("header.post-meta h1, h1")?.textContent?.trim() ||
                slug;

            // ファイル名(slug)の日付を基準にし、取れない場合だけmeta日付にフォールバックする。
            const date =
                extractDateFromSlug(slug) ||
                doc.querySelector('meta[name="article:published_time"]')?.getAttribute("content") ||
                "";

            const excerpt =
                doc.querySelector("p")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 140) || "";

            return { title, date, slug, excerpt };
        })
    );

    return posts
        .filter(Boolean)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function loadSlugs() {
    try {
        const postsResponse = await fetch("./data/posts.json");
        if (postsResponse.ok) {
            const posts = await postsResponse.json();
            if (Array.isArray(posts) && posts.length > 0) {
                const slugs = posts.map((post) => post.slug).filter(Boolean);
                if (slugs.length > 0) return slugs;
            }
        }
    } catch (error) {
        console.warn("posts.json fallback:", error);
    }

    try {
        const cacheResponse = await fetch("./generated/.publish-cache.json");
        if (!cacheResponse.ok) throw new Error("publish cache not available");
        const cache = await cacheResponse.json();
        const slugs = Object.keys(cache || {})
            .filter((fileName) => fileName.endsWith(".md"))
            .map((fileName) => fileName.replace(/\.md$/, ""));
        if (slugs.length > 0) return slugs;
    } catch (error) {
        console.warn("publish cache fallback:", error);
    }

    throw new Error("Failed to load post list from posts.json and publish-cache.");
}

function extractDateFromSlug(slug) {
    const matched = slug.match(/\d{4}-\d{2}-\d{2}/);
    return matched ? matched[0] : "";
}

function createPostItem(post) {
    const postItem = document.createElement("div");
    postItem.classList.add("post-item");
    const postUrl = `post.html?slug=${encodeURIComponent(post.slug)}`;

    postItem.innerHTML = `
        <a class="post-card-link" href="${postUrl}">
            <div class="post-inner">
                <div class="post-left">
                    <h3 class="post-title">${post.title}</h3>
                    <span class="post-date">${post.date}</span>
                </div>
                <div class="post-right">
                    <p class="post-excerpt">${post.excerpt}</p>
                </div>
            </div>
        </a>
    `;
    return postItem;
}

// index.html用：最新5件を表示
async function displayLatestPosts() {
    const postsList = document.querySelector(".latest-posts");
    if (!postsList) return;

    try {
        const posts = await fetchPosts();
        const latestPosts = posts.slice(0, 5);
        latestPosts.forEach((post) => {
            postsList.appendChild(createPostItem(post));
        });
    } catch (error) {
        console.error(error);
        postsList.innerHTML = "<p>記事の読み込みに失敗しました。</p>";
    }
}

// archive.html用：全記事を表示
async function displayAllPosts() {
    const postsList = document.querySelector(".all-posts");
    if (!postsList) return;

    try {
        const posts = await fetchPosts();
        posts.forEach((post) => {
            postsList.appendChild(createPostItem(post));
        });
    } catch (error) {
        console.error(error);
        postsList.innerHTML = "<p>記事の読み込みに失敗しました。</p>";
    }
}

// ページ読み込み時に適切な関数を実行
document.addEventListener("DOMContentLoaded", () => {
    displayLatestPosts();
    displayAllPosts();
});
