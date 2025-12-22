import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input"; // 🟢 Reusable Component
import "../styles/SignUp.css";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", class: "" };
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score, label: "Weak", class: "weak" };
    if (score === 2) return { score, label: "Fair", class: "fair" };
    if (score === 3) return { score, label: "Strong", class: "strong" };
    return { score: 0, label: "", class: "" };
  };

  const strength = getPasswordStrength(password);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    if (age < 21) {
      setError("You must be 21 or older to join the community.");
      return;
    }

    if (strength.score < 2) {
      setError("Please choose a stronger password.");
      return;
    }

    try {
      setLoading(true);
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const firebaseUser = userCredential.user;

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          uid: firebaseUser.uid,
          dob,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Backend synchronization failed.");

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("🔥 Signup Process Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {loading ? (
        <div className="loading-state">
          <h2 className="loading-title">🌿 Setting up your garden...</h2>
          <p className="loading-subtitle">Syncing your profile and preparing your dashboard.</p>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <h1 className="signup-title">Join the Community</h1>
          <p className="signup-subtitle">Connect with others and share your experience.</p>

          <form className="signup-form" onSubmit={handleSignUp}>
            {/* 🟢 Using your new Input component for Username */}
            <Input
              label="Username"
              placeholder="Pick a community name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* 🟢 Using your new Input component for Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password section with custom toggle logic */}
            <div className="password-wrapper">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="hide-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {password && (
              <div className="meter-section">
                <div className="strength-meter">
                  <div className={`strength-bar ${strength.class}`}></div>
                </div>
                <p className="strength-text" style={{ color: strength.score === 3 ? '#2d6a4f' : '#666' }}>
                  Strength: <strong>{strength.label}</strong>
                </p>
              </div>
            )}

            {/* 🟢 Date of Birth Input */}
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />

            {error && <p className="signup-error">{error}</p>}

            <button className="signup-button" type="submit" disabled={loading}>
              Create Account
            </button>
          </form>

          <p className="login-redirect">
            Already have an account? <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </>
      )}
    </div>
  );
};

export default SignUp;