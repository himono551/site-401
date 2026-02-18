document.addEventListener('DOMContentLoaded', () => {
    // ヘッダー下のラインを追加（css の .header-line 用）
    const header = document.querySelector('header');
    if (header && !document.querySelector('.header-line')) {
        const line = document.createElement('div');
        line.className = 'header-line';
        header.after(line);
    }

    // ナビの active を現在ページに合わせて設定
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    function markActiveLink(link) {
        navLinks.forEach(a => a.classList.remove('active'));
        if (link) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    }

    // 初期判定
    let foundActive = false;
    navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        const hrefFile = href.split('#')[0].split('/').pop() || 'index.html';
        if (hrefFile === currentFile) {
            a.classList.add('active');
            a.setAttribute('aria-current', 'page');
            foundActive = true;
        } else {
            a.classList.remove('active');
            a.removeAttribute('aria-current');
        }
    });
    if (!foundActive) {
        // デフォルトで最初のリンクに active を付ける（保険）
        if (navLinks[0]) markActiveLink(navLinks[0]);
    }

    // クリック時の振る舞い（同ページアンカーはスムーズスクロール、他ページは通常遷移）
    navLinks.forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href') || '';
            // 純粋なハッシュリンク (#about など)
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', href);
                    markActiveLink(a);
                }
                return;
            }

            // 同一ファイル内のアンカー（index.html#about 等）
            const [filePart, hashPart] = href.split('#');
            const linkFile = filePart.split('/').pop() || 'index.html';
            if (linkFile === currentFile && hashPart) {
                e.preventDefault();
                const target = document.getElementById(hashPart);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', '#' + hashPart);
                    markActiveLink(a);
                }
            } else {
                // 別ページへのリンクは active を一時的に反映（ページ遷移時に再評価される）
                markActiveLink(a);
            }
        });
    });

    // ページ読み込み時にハッシュがあればスムーズスクロール（外部からのリンク対応）
    if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) {
            // 少し遅延してスクロール（レイアウト安定後）
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }
    }
});