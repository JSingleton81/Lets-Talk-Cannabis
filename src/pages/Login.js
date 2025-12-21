import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input"; // 🟢 Reusable Component
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Environment variable with fallback
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Clear session data on mount to prevent stale state
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. The Handshake: Sync with MySQL Backend
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        }),
      });

      // Handle cases where the server might return HTML (like 404 or crash pages)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Received non-JSON response. Check backend routes.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Backend login failed.");
      }

      // 3. Success: Store JWT and User Data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 4. Redirect to dashboard
      navigate("/dashboard");
      
    } catch (err) {
      console.error("🔥 Login sequence error:", err);
      
      if (err.message.includes("auth/invalid-credential") || err.message.includes("auth/user-not-found")) {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "An error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Welcome Back</h1>
      <p className="login-subtitle">Sign in to join the conversation.</p>

      <form className="login-form" onSubmit={handleLogin}>
        {/* 🟢 Reusable Input for Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* 🟢 Reusable Input for Password */}
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error-box">{error}</div>}

        <button 
          className="login-button" 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>

      <div className="login-footer">
        Don't have an account?{" "}
        <span className="login-link" onClick={() => navigate("/signup")}>
          Create one here
        </span>
      </div>
    </div>
  );
};

export default Login;