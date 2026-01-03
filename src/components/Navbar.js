import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  // Initialize as null to avoid "flickering" guest links during load
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Firebase Auth changes directly
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.debug("[Navbar] Auth state changed:", user?.email);
      setCurrentUser(user);
      setLoading(false);
    });

    // Safety timeout in case Firebase check hangs
    const timeout = setTimeout(() => {
      console.debug("[Navbar] Auth check timeout; showing UI while Firebase initializes");
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Clear everything to be safe
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Prevent showing wrong links while Firebase is checking the session
  if (loading) return <nav className="navbar"><div className="nav-logo">Loading...</div></nav>;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo-link">
        <h2 className="nav-logo">Let's Talk Cannabis</h2>
      </Link>
      
      <div className="nav-links">
        <Link className="nav-item" to="/">Home</Link>

        {currentUser ? (
          /* Links for Authenticated Users */
          <>
            <Link className="nav-item" to="/dashboard">Dashboard</Link>
            <Link className="nav-item" to="/feed">Feed</Link>
            <Link className="nav-item" to="/chat">Chat</Link>
            <Link className="nav-item" to="/profile">Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          /* Links for Guests */
          <>
            <Link className="nav-item" to="/signup">Sign Up</Link>
            <Link className="nav-item" to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;