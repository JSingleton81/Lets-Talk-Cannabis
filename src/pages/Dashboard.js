import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PersonaVerifyButton from "../components/PersonaVerifyButton";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);

  // Verification state
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verificationError, setVerificationError] = useState("");

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // 1) Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2) Fetch status from Backend
  const fetchVerificationStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationStatus(data?.user?.verification_status || "pending");
      }
    } catch (err) {
      setVerificationError("Could not update verification status.");
    } finally {
      setVerificationLoading(false);
    }
  };

  // 3) Polling Logic: Auto-refresh status while pending
  useEffect(() => {
    fetchVerificationStatus(); // Check immediately on load

    let interval;
    if (verificationStatus === "pending") {
      interval = setInterval(() => {
        console.log("Polling for verification update...");
        fetchVerificationStatus();
      }, 5000); // Check every 5 seconds
    }

    // Clean up interval if status changes or user leaves page
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verificationStatus, token]);

  // 4) Firestore Posts
  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snap) => {
        setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || verificationStatus !== "approved") return;

    try {
      await addDoc(collection(db, "posts"), {
        content: newPost,
        author: user.email,
        timestamp: serverTimestamp(),
      });
      setNewPost("");
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  if (loading) return <div style={styles.loader}>Loading...</div>;
  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      <p style={styles.welcome}>
        Logged in as: <strong>{user.email}</strong> 
        {verificationStatus === "approved" ? (
          <span style={styles.badgeApproved}>✅ Verified</span>
        ) : (
          <span style={styles.badgePending}>🕒 {verificationStatus}</span>
        )}
      </p>

      {/* Persona Section */}
      {verificationStatus !== "approved" && (
        <div style={styles.verifyCard}>
          <h3>Complete Verification</h3>
          <p>You need to verify your ID before you can post to the community.</p>
          <PersonaVerifyButton
            userId={user.uid} // Using Firebase UID as reference
            token={token}
            onComplete={() => fetchVerificationStatus()}
          />
        </div>
      )}

      {/* Post Form */}
      <div style={styles.postForm}>
        {verificationStatus !== "approved" && (
          <div style={styles.lockOverlay}>
            <p>🔒 Verify identity to unlock posting</p>
          </div>
        )}
        <form onSubmit={handlePost}>
          <textarea
            style={styles.textarea}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your cannabis insights..."
            disabled={verificationStatus !== "approved"}
          />
          <button 
            style={{...styles.button, opacity: verificationStatus === "approved" ? 1 : 0.5}} 
            disabled={verificationStatus !== "approved"}
          >
            Post Update
          </button>
        </form>
      </div>

      {/* Post List */}
      <div style={styles.postsList}>
        {posts.map(post => (
          <div key={post.id} style={styles.postCard}>
            <small>{post.author}</small>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "700px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" },
  title: { color: "#2d5a27" },
  welcome: { display: "flex", alignItems: "center", gap: "10px", color: "#555" },
  badgeApproved: { backgroundColor: "#e6f4ea", color: "#1e7e34", padding: "4px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "bold" },
  badgePending: { backgroundColor: "#fff3cd", color: "#856404", padding: "4px 12px", borderRadius: "15px", fontSize: "12px", fontWeight: "bold", textTransform: "capitalize" },
  verifyCard: { backgroundColor: "#f8f9fa", border: "1px solid #ddd", padding: "20px", borderRadius: "8px", margin: "20px 0" },
  postForm: { position: "relative", marginBottom: "30px" },
  lockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1, borderRadius: "8px" },
  textarea: { width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "100px", boxSizing: "border-box" },
  button: { marginTop: "10px", padding: "10px 20px", backgroundColor: "#2d5a27", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  postCard: { padding: "15px", borderBottom: "1px solid #eee" },
  loader: { textAlign: "center", marginTop: "100px" }
};

export default Dashboard;