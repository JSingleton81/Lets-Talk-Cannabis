// src/pages/Profile.js
import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Profile</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>User Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <button style={styles.button} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "400px", margin: "50px auto" },
  button: {
    padding: "10px 20px",
    backgroundColor: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Profile;
