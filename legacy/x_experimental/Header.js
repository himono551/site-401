import React from 'react';

const Header = () => {
    return (
        <header>
            <h1 className="site-title">My Personal Blog</h1>
            <nav>
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="posts.html">Posts</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;