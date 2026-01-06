import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../styles/Navbar.css';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="garden-navbar">
      {/* 🍔 LEFT: Hamburger (Visible only on mobile) */}
      <div className="nav-left">
        <div className="hamburger" onClick={() => setMenuOpen(true)}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>

      {/* 🔗 CENTER/RIGHT: Restoration of Desktop Links */}
      <div className="nav-center">
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          {currentUser ? (
            <>
              <Link to="/feed">Feed</Link>
              <Link to= "/chat">Chat</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-pill">
              Login / Verify
            </Link>
          )}
        </div>
      </div>

      {/* 🌿 RIGHT: Garden Logo */}
      <div className="nav-right" onClick={() => navigate("/")}>
        <span className="logo-text">Lets-Talk-Cannabis</span>
        <span className="logo-icon">🌿</span>
      </div>

      {/* 🚪 LEFT SLIDING SIDEBAR */}
      <div className={`menu-window ${menuOpen ? "active" : ""}`}>
        <div className="menu-header">
          {/* ❌ The Close Button - Positioned carefully to avoid cutoff */}
          <button className="menu-close-x" onClick={() => setMenuOpen(false)}>
            &times;
          </button>
        </div>

        <div className="menu-links">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          {currentUser && (
            <>
              <Link to="/feed" onClick={() => setMenuOpen(false)}>
                Feed
              </Link>
              <Link to="/categories" onClick={() => setMenuOpen(false)}>
                Categories
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                My Profile
              </Link>
              <button onClick={handleLogout} className="menu-logout-btn">
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;