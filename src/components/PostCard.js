import React from "react";
import "../styles/PostCard.css"; 

const PostCard = ({ post }) => {
  // Format the date to be human-readable
  const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-info">
          <span className="post-username">{post.username}</span>
          
          {/* Display the green checkmark if the author is 21+ verified */}
          {(post.is_verified_21 === 1 || post.is_verified_21 === true) && (
            <span className="verified-badge" title="21+ Verified Member">
              <span className="checkmark-icon">✓</span>
            </span>
          )}
        </div>
        <span className="post-timestamp">{formattedDate}</span>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <div className="post-footer">
        {/* Future home for Likes/Comments buttons */}
        <button className="footer-action-btn">Like</button>
        <button className="footer-action-btn">Comment</button>
      </div>
    </div>
  );
};

export default PostCard;