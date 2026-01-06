import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth"; // Added to check verification status
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";
import "../styles/Feed.css";

// 📡 API Base configuration
const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const Feed = () => {
  const { user, isVerified21 } = useAuth(); // Hook to gate the posting privileges
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [taggedStrain, setTaggedStrain] = useState("");
  const [availableStrains, setAvailableStrains] = useState([]);
  const [selectedStrain, setSelectedStrain] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 📡 Fetch Posts Logic:
   * Retrieves the latest community insights from MySQL.
   */
  const fetchPosts = async () => {
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/posts/all`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true" 
        },
      });
      console.log("Raw response:", response);
      const text = await response.text();
      console.log("Raw response text:", text);
      let data;
      try {
        data = JSON.parse(text);
        console.log("Parsed data:", data);
      } catch (err) {
        console.error("[Feed] JSON parse error:", err, text);
        data = [];
      }
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("[Feed] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✍️ handlePost:
   * Submits a new post to the global feed. Gated by is_verified_21 status.
   */
  const handlePost = async (e) => {
    e.preventDefault();
    if (!isVerified21 || !newPost.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await auth.currentUser.getIdToken(true);
      const response = await fetch(`${API_BASE}/api/posts/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ 
          content: newPost.trim(),
          strain_id: selectedStrain // Connects post to MySQL strain ID
        })
      });

      if (response.ok) {
        setNewPost(""); // Clear the input
        setSelectedStrain(""); // Clear the dropdown
        fetchPosts(); // 🔄 Refresh the list to show the new post instantly
      }
    } catch (err) {
      console.error("Post failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Fetch strain names for dropdown
    const fetchStrainNames = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/strains/names`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        console.log("Raw strains response:", response);
        // Check if response is empty or invalid
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Backend returned ${response.status}: ${errorText}`);
          setAvailableStrains([]);
          return;
        }

        // Capture the text first to see what it actually is
        const text = await response.text();
        console.log("Raw strains response text:", text);
        if (!text) {
          console.error("Server returned an empty body.");
          setAvailableStrains([]);
          return;
        }

        try {
          const data = JSON.parse(text);
          console.log("Parsed strains data:", data);
          setAvailableStrains(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Frontend Fetch Error (invalid JSON):", err, text);
          setAvailableStrains([]);
        }
      } catch (err) {
        console.error("Frontend Fetch Error:", err);
        setAvailableStrains([]);
      }
    };
    fetchStrainNames();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="feed-page-container">
      <h1 className="feed-title">Community Feed</h1>

      {/* 📝 Integrated Composer: Users can now post directly from the feed */}
      <div className="feed-composer">
        <form onSubmit={handlePost}>
          <textarea
            className="post-textarea"
            id="feed-post"
            name="feedPost"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share an insight with the community..."
            disabled={!isVerified21 || isSubmitting}
          />
          <select
            className="strain-select-dropdown"
            value={selectedStrain}
            onChange={e => setSelectedStrain(e.target.value)}
            disabled={!isVerified21 || isSubmitting}
            style={{ marginBottom: '10px', width: '100%', borderRadius: '8px', border: '1px solid #ddd', padding: '10px', fontSize: '1rem' }}
          >
            <option value="">Tag a strain (optional)</option>
            {availableStrains.map(strain => (
              <option key={strain.id} value={strain.id}>{strain.name}</option>
            ))}
          </select>
          <button 
            className="post-submit-btn" 
            disabled={!isVerified21 || isSubmitting}
            style={{ opacity: isVerified21 ? 1 : 0.5 }}
          >
            {isSubmitting ? "Posting..." : "Post to Feed"}
          </button>
        </form>
        {!isVerified21 && <p className="lock-text">🔒 Verify your ID to unlock posting.</p>}
      </div>

      <div className="feed-list">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="no-posts">No insights shared yet. Be the first!</p>
        )}
      </div>
    </div>
  );
};

export default Feed;