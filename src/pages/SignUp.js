import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input"; // 🟢 Reusable Component
import { requestPermissionAndSyncToken } from "../utils/notificationService";
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
  const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

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

      // ✅ FORCE a fresh ID Token with the "kid" claim
      const freshToken = await firebaseUser.getIdToken(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s safety timeout

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${freshToken}`, // Send the fresh JWT
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          username,
          email,
          uid: firebaseUser.uid,
          dob,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Backend returned non-JSON response (${res.status}). ${text?.slice(0, 200)}`
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.message || `Internal server error during registration sync (status ${res.status}).`
        );
      }

      if (data.token) {
        // 💾 Store session data for the /auth/me polling we added to Verification.js
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // 🔔 SYNC: Links the device to the user in MySQL for the "Verified" push notification
        await requestPermissionAndSyncToken(firebaseUser.uid, API_BASE);
        
        // 🚀 GATEWAY: Sends the user to the dedicated Persona page we just built
        navigate("/verify-identity");
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
              id="signup-username"
              name="username"
              placeholder="Pick a community name"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* 🟢 Using your new Input component for Email */}
            <Input
              label="Email Address"
              id="signup-email"
              name="email"
              type="email"
              placeholder="email@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password section with custom toggle logic */}
            <div className="password-wrapper">
              <Input
                label="Password"
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Choose a password"
                autoComplete="new-password"
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
              id="signup-dob"
              name="dob"
              type="date"
              autoComplete="bday"
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