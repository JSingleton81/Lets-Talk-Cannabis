import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; 
import { auth } from "../firebase"; 
import Loader from "../components/Loader"; 
import PostCard from "../components/PostCard";
import PersonaVerifyButton from "../components/PersonaVerifyButton"; 
import "../styles/Dashboard.css"; 

const Dashboard = () => {
  const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  const { user, loading, isVerified21 } = useAuth();
  
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState("Unverified");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to ensure we always have a valid JWT with the "kid" claim
  const getFreshToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(true);
  };

  /**
   * 1. FETCH FEED
   */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = await getFreshToken();
        if (!token) return;

        const response = await fetch(`${API_BASE}/api/posts/all`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true" 
          }
        });
        
        const data = await response.json();
        if (Array.isArray(data)) setPosts(data);
      } catch (err) {
        console.error("[Dashboard] Fetch error:", err);
      }
    };

    if (user) fetchPosts();
  }, [user, isVerified21, API_BASE]);

  /**
   * 2. HANDSHAKE & SYNC LOGIC
   */
  const syncProfileStatus = async (attempts = 0) => {
    if (attempts > 5) {
      setIsSyncing(false);
      setVerificationStatus("Pending Review");
      return;
    }

    setIsSyncing(true);
    setVerificationStatus("Verifying...");

    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
      });

      const data = await response.json();

      if (data.user && data.user.is_verified_21) {
        window.location.reload(); 
      } else {
        setTimeout(() => syncProfileStatus(attempts + 1), 3000);
      }
    } catch (err) {
      console.error("❌ Sync error:", err);
      setIsSyncing(false);
    }
  };

  /**
   * 3. SUBMIT POST
   */
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_BASE}/api/posts/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ content: newPost.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const freshPost = {
          id: data.postId,
          username: user.displayName || "Me",
          content: newPost,
          is_verified_21: isVerified21,
          created_at: new Date().toISOString()
        };
        setPosts([freshPost, ...posts]);
        setNewPost("");
      } else {
        alert(data.message || "Error creating post");
      }
    } catch (err) {
      console.error("Post failed:", err);
    } finally {
      setIsSubmitting(false);
    }
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
        <h1 className="dashboard-title">Community Feed</h1>
        <div className="user-status-info">
          <strong>{user.email}</strong>
          {isVerified21 ? (
            <span className="badge-verified">✅ Verified Member</span>
          ) : (
            <span className="badge-pending">🕒 {verificationStatus}</span>
          )}
        </div>
      </header>

      {/* Verification Card - Shows only if user is NOT 21+ Verified */}
      {!isVerified21 && (
        <div className="verify-card">
          <h3>{isSyncing ? "Verifying..." : "Access Restricted"}</h3>
          <p>
            {isSyncing 
              ? "Confirming your ID status with the database..." 
              : "Verify your age (21+) to unlock posting privileges."}
          </p>
          {!isSyncing && (
            <PersonaVerifyButton
              userId={user.uid} 
              onComplete={syncProfileStatus}
            />
          )}
        </div>
      )}

      {/* Composer Section */}
      <div className="composer-container">
        {!isVerified21 && (
          <div className="lock-overlay">
            <span className="lock-text">🔒 Verification Required</span>
          </div>
        )}
        <form onSubmit={handlePost}>
          <textarea
            className="post-textarea"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share an insight with the community..."
            disabled={!isVerified21 || isSubmitting}
          />
          <button 
            className="post-submit-btn" 
            disabled={!isVerified21 || isSubmitting}
            style={{ opacity: isVerified21 ? 1 : 0.5 }}
          >
            {isSubmitting ? "Posting..." : "Post Insight"}
          </button>
        </form>
      </div>

      {/* Community Feed List */}
      <div className="feed-list">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p className="no-posts">The feed is quiet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;