// ナビゲーション機能
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    // 初期状態: homeを表示
    showSection('home');

    // ナビゲーションリンクのクリックイベント
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // アクティブなリンクのスタイルを更新
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // 対応するセクションを表示
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // セクション表示関数
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });

        // URLハッシュを更新（ブラウザの戻る/進むボタンに対応）
        window.location.hash = sectionId;
    }

    // ページロード時にURLハッシュがある場合、そのセクションを表示
    if (window.location.hash) {
        const hashSection = window.location.hash.substring(1);
        showSection(hashSection);
        
        // 対応するナビリンクをアクティブに
        navLinks.forEach(link => {
            if (link.getAttribute('href') === '#' + hashSection) {
                link.classList.add('active');
            }
        });
    } else {
        // デフォルトでhomeをアクティブに
        navLinks[0].classList.add('active');
    }

    // ブラウザの戻る/進むボタンに対応
    window.addEventListener('hashchange', function() {
        const currentHash = window.location.hash.substring(1) || 'home';
        showSection(currentHash);

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentHash) {
                link.classList.add('active');
            }
        });
    });
});
