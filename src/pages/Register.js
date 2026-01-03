import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  /**
   * FIX: Added a more robust fallback. 
   * If REACT_APP_API_URL is missing from .env, it defaults to localhost:5000.
   */
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    // DEBUG: Look at your browser console (F12) to see if this URL looks correct!
    console.log("Registering at:", `${API_URL}/auth/register`);

    try {
      // STEP 1: Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // STEP 2: MySQL Sync
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        }),
      });

      /**
       * FIX: Content-Type Check
       * This prevents the "Unexpected token <" crash. 
       * If the server sends HTML (an error page), we catch it here.
       */
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        console.error("Server returned non-JSON response:", textError);
        throw new Error("Server error: Received HTML instead of JSON. Check backend routes.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create your profile in our database.");
      }

      // STEP 3: Handle Session Data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // STEP 4: Redirect
      navigate("/verification");

    } catch (err) {
      console.error("Registration Error Sequence:", err);
      
      // Better error messaging
      if (err.message.includes("Unexpected token")) {
        setError("Backend configuration error (HTML returned instead of JSON).");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Create Account</h1>
      <p className="register-subtitle">
        Join the community to start sharing and learning.
      </p>

      <form className="register-form" onSubmit={handleRegister}>
        <input
          id="register-email"
          name="email"
          className="register-input"
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          id="register-password"
          name="password"
          className="register-input"
          type="password"
          placeholder="Password (6+ characters)"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          id="register-confirm-password"
          name="confirmPassword"
          className="register-input"
          type="password"
          placeholder="Confirm Password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <div className="error-box">{error}</div>}

        <button className="register-button" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Create Account"}
        </button>
      </form>

      <div className="register-footer">
        Already have an account?{" "}
        <span className="register-link" onClick={() => navigate("/login")}>
          Login
        </span>
      </div>
    </div>
  );
};

export default Register;