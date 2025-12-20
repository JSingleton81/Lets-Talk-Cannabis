// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // redirect to Home
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>
      <form style={styles.form} onSubmit={handleLogin}>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    margin: "50px auto",
    padding: "40px",
    maxWidth: "400px",
    textAlign: "center",
    backgroundColor: "#f6fff0",
    borderRadius: "10px",
  },
  title: { marginBottom: "20px", color: "#2a5c2a", fontSize: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "12px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" },
  button: { padding: "12px", border: "none", borderRadius: "5px", backgroundColor: "#3b7c3b", color: "white", fontSize: "16px", cursor: "pointer" },
  error: { color: "red", fontSize: "14px" },
};

export default Login;
