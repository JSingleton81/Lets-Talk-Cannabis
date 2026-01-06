import React from 'react';
import '../styles/PostCard.css';

const PostCard = ({ post, onFavorite, onShowTerpene }) => {
  // Convert MySQL timestamp to a friendly format
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="post-card">
      <div className="post-header">
        <span className="post-author">{post.username || 'Jams81'}</span>
        <span className="post-date">{formattedDate || 'Dec 25'}</span>
      </div>
      <div className="post-image-wrapper">
        {post.image_url && (
          <img src={post.image_url} alt="User Post" className="post-main-img" />
        )}
      </div>
      <div className="post-content">
        <p>{post.content || 'we good'}</p>
      </div>
      <div className="post-footer">
        <button 
          className="favorite-btn" 
          onClick={() => onFavorite(post.id)}
        >
          ❤️ {post.likes_count || 0}
        </button>
        <div 
          className="strain-tag" 
          onClick={() => onShowTerpene && onShowTerpene(post.primary_terpene)}
          style={{ cursor: 'pointer' }}
        >
          🌿 {post.strain_name} • <span className="terpene-preview">{post.primary_terpene}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;