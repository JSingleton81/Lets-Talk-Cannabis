import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; 
import { auth } from "../firebase"; 
import Loader from "../components/Loader"; 
import PersonaVerifyButton from "../components/PersonaVerifyButton"; 
import "../styles/Dashboard.css"; 

const Dashboard = () => {
  const { user, loading, isVerified21 } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // New: State for tagged strain (simulate strain picker integration)
  const [selectedStrain, setSelectedStrain] = useState(null); // { id, name, type, image_url }
  const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || isSubmitting) return;
    
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
          strain_id: selectedStrain?.id || null,
          strain_name: selectedStrain?.name || null,
          strain_type: selectedStrain?.type || null,
          strain_image_url: selectedStrain?.image_url || null
        })
      });

      if (response.ok) {
        setNewPost("");
        alert("Insight posted to the community feed!");
        // Optional: Redirect user to the Feed page to see their post
        // window.location.href = "/feed";
      }
    } catch (err) {
      console.error("Post failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Control Center</h1>
        <div className="user-status">
          <strong>{user?.email}</strong>
          {isVerified21 && <span className="badge-verified">✅ 21+ Verified</span>}
        </div>
      </header>

      {!isVerified21 && (
        <div className="verify-card">
          <h3>Verification Required</h3>
          <p>You must verify your ID to post insights.</p>
          <PersonaVerifyButton userId={user?.uid} onComplete={() => window.location.reload()} />
        </div>
      )}

      <div className="composer-container">
        {!isVerified21 && <div className="lock-overlay">🔒 Verification Required</div>}
        <form onSubmit={handlePost}>
          <textarea
            className="post-textarea"
            id="dashboard-post"
            name="dashboardPost"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share an insight..."
            disabled={!isVerified21}
          />
          {/* Simulated Strain Picker UI (replace with your real picker) */}
          <div style={{ margin: '10px 0' }}>
            <button type="button" onClick={() => setSelectedStrain({ id: 1, name: 'Blue Dream', type: 'Sativa', image_url: '/images/blue-dream.jpg' })}>
              Tag Blue Dream (Demo)
            </button>
            <button type="button" onClick={() => setSelectedStrain(null)} style={{ marginLeft: 8 }}>
              Remove Tag
            </button>
            {selectedStrain && (
              <div style={{ marginTop: 6, fontSize: 14 }}>
                <strong>Tagged:</strong> {selectedStrain.name} ({selectedStrain.type})
              </div>
            )}
          </div>
          <button className="post-submit-btn" disabled={!isVerified21 || isSubmitting}>
            {isSubmitting ? "Posting..." : "Post to Feed"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;