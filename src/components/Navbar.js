import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Ensure your firebase config is imported
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Listen for Auth changes to keep Navbar in sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!user && !!token);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Clear Local Storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // 2. Sign out from Firebase
      await signOut(auth);
      
      // 3. UI Update
      setIsLoggedIn(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo-link">
        <h2 className="nav-logo">Let's Talk Cannabis</h2>
      </Link>
      
      <div className="nav-links">
        <Link className="nav-item" to="/">Home</Link>

        {isLoggedIn ? (
          <>
            <Link className="nav-item" to="/dashboard">Dashboard</Link>
            <Link className="nav-item" to="/feed">Feed</Link>
            <Link className="nav-item" to="/chat">Chat</Link>
            <Link className="nav-item" to="/profile">Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
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