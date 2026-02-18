// 投稿取得・一覧表示ロジック(最新5件と全件タブ)
async function fetchPosts() {
    const response = await fetch('./data/posts.json');
    const posts = await response.json();
    return posts;
}

// index.html用：最新5件を表示
async function displayLatestPosts() {
    const postsList = document.querySelector('.latest-posts');
    if (!postsList) return; // 要素がない場合は何もしない
    
    const posts = await fetchPosts();
    const latestPosts = posts.slice(0, 5);

    latestPosts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');
        postItem.innerHTML = `
            <h3><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
            <p>${post.excerpt}</p>
            <span>${post.date}</span>
        `;
        postsList.appendChild(postItem);
    });
}

// archive.html用：全記事を表示
async function displayAllPosts() {
    const postsList = document.querySelector('.all-posts');
    if (!postsList) return; // 要素がない場合は何もしない
    
    const posts = await fetchPosts();

    posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');
        postItem.innerHTML = `
            <h3><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
            <p>${post.excerpt}</p>
            <span>${post.date}</span>
        `;
        postsList.appendChild(postItem);
    });
}

// ページ読み込み時に適切な関数を実行
document.addEventListener('DOMContentLoaded', () => {
    displayLatestPosts(); // index.html用
    displayAllPosts();    // archive.html用
});
