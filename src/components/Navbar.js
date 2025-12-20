// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Let's Talk Cannabis</h2>
      <div>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/dashboard">Dashboard</Link>
        <Link style={styles.link} to="/feed">Feed</Link>
        <Link style={styles.link} to="/chat">Chat</Link>
        <Link style={styles.link} to="/profile">Profile</Link>
        <Link style={styles.link} to="/signup">Sign Up</Link>
        <Link style={styles.link} to="/login">Login</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "#3b7c3b",
    color: "white",
  },
  logo: { margin: 0 },
  link: {
    marginLeft: "20px",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Navbar;
