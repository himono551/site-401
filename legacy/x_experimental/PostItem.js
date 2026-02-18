import React from 'react';

const PostItem = ({ title, date, excerpt }) => {
    return (
        <div className="post-item">
            <h2 className="post-title">{title}</h2>
            <p className="post-date">{date}</p>
            <p className="post-excerpt">{excerpt}</p>
        </div>
    );
};

export default PostItem;