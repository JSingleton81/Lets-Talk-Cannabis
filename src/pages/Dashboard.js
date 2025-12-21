import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; 
import Loader from "../components/Loader"; 
import PersonaVerifyButton from "../components/PersonaVerifyButton"; 
import "../styles/Dashboard.css"; 

const Dashboard = () => {
  const { user, loading, isVerified21 } = useAuth();
  
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState("Unverified");
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * 3. HANDSHAKE & SYNC LOGIC
   * We poll our backend to see if the Persona Webhook has updated MySQL yet.
   */
  const syncProfileStatus = async (attempts = 0) => {
    // Stop polling after 5 attempts (15 seconds) to save resources
    if (attempts > 5) {
      setIsSyncing(false);
      setVerificationStatus("Pending Review");
      return;
    }

    setIsSyncing(true);
    setVerificationStatus("Verifying...");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/auth/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();

      // If the backend says the user is now verified, refresh the page to unlock
      if (data.user && data.user.is_verified_21) {
        console.log("✅ Verification detected in MySQL!");
        window.location.reload(); 
      } else {
        // If not verified yet, wait 3 seconds and try again
        console.log(`Sync attempt ${attempts + 1}: Not verified yet...`);
        setTimeout(() => syncProfileStatus(attempts + 1), 3000);
      }
    } catch (err) {
      console.error("❌ Sync error:", err);
      setIsSyncing(false);
    }
  };

  const handlePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    const postObj = {
      id: Date.now(),
      author: user?.username || "Member",
      content: newPost,
      isVerifiedAuthor: isVerified21
    };
    
    setPosts([postObj, ...posts]);
    setNewPost("");
  };

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="dashboard-container">
        <p>Session expired. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="user-status-info">
          <strong>{user.email}</strong>
          {isVerified21 ? (
            <span className="badge-verified">✅ Verified</span>
          ) : (
            <span className="badge-pending">🕒 {verificationStatus}</span>
          )}
        </div>
      </header>

      {!isVerified21 && (
        <div className="verify-card">
          <h3>{isSyncing ? "Verifying Your Identity..." : "Complete Verification"}</h3>
          <p>
            {isSyncing 
              ? "We are checking your status. Please wait a moment." 
              : "You need to verify your ID before you can post to the community."}
          </p>
          {!isSyncing && (
            <PersonaVerifyButton
              userId={user.uid || user.firebase_uid} 
              onComplete={syncProfileStatus}
            />
          )}
        </div>
      )}

      <div className="composer-container">
        {!isVerified21 && (
          <div className="lock-overlay">
            <span className="lock-text">🔒 ID Verification Required to Post</span>
          </div>
        )}
        <form onSubmit={handlePost}>
          <textarea
            className="post-textarea"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your cannabis insights..."
            disabled={!isVerified21}
          />
          <button 
            className="post-submit-btn" 
            disabled={!isVerified21}
            style={{ opacity: isVerified21 ? 1 : 0.5 }}
          >
            Post Update
          </button>
        </form>
      </div>

      <div className="feed-list">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-meta">
                <strong>{post.author}</strong>
                {post.isVerifiedAuthor && <span className="verified-check">✓</span>}
              </div>
              <p>{post.content}</p>
            </div>
          ))
        ) : (
          <p className="no-posts">No updates yet. Be the first to share!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;