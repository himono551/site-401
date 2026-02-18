// ユーティリティ関数を定義するJavaScriptファイルです。
// データの取得や処理に役立つ関数を含みます。

const fetchPosts = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const truncateExcerpt = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

export { fetchPosts, formatDate, truncateExcerpt };