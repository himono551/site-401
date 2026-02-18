import React, { useEffect, useState } from 'react';
import PostItem from './PostItem';
import postsData from '../data/posts.json';

const PostsList = () => {
    const [latestPosts, setLatestPosts] = useState([]);

    useEffect(() => {
        // 最新記事5件を取得
        const fetchLatestPosts = () => {
            const sortedPosts = postsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setLatestPosts(sortedPosts.slice(0, 5));
        };

        fetchLatestPosts();
    }, []);

    return (
        <div className="posts-list">
            <h2>Latest Posts</h2>
            <div className="post-items">
                {latestPosts.map(post => (
                    <PostItem 
                        key={post.slug} 
                        title={post.title} 
                        date={post.date} 
                        excerpt={post.excerpt} 
                        slug={post.slug} 
                    />
                ))}
            </div>
        </div>
    );
};

export default PostsList;