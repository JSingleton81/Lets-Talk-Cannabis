import React, { useState } from "react";

/**
 * PersonaVerifyButton
 * 1. Calls your backend to create a secure Inquiry ID.
 * 2. Launches the Persona Modal on top of your app.
 */
const PersonaVerifyButton = ({ userId, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  const startVerification = async () => {
    // Basic safety check
    if (!window.Persona) {
      alert("Persona SDK failed to load. Please refresh the page.");
      return;
    }

    setLoading(true);

    try {
      // 1. Request the Inquiry ID from your backend
      // We pass the Firebase UID to link the records
      const res = await fetch(`${API_URL}/verify/persona/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Backend error");

      // 2. Initialize the Persona Client
      const client = new window.Persona.Client({
        inquiryId: data.inquiryId,
        onReady: () => {
          setLoading(false);
          client.open();
        },
        onComplete: (inquiryId) => {
          console.log(`Verification finished: ${inquiryId}`);
          // Trigger the refresh in your Dashboard
          if (onComplete) onComplete();
        },
        onCancel: () => {
          setLoading(false);
          console.log("User closed the verification modal.");
        },
        onError: (error) => {
          setLoading(false);
          console.error("Persona SDK Error:", error);
          alert("An error occurred during verification setup.");
        },
      });

    } catch (err) {
      setLoading(false);
      console.error("Verification Start Error:", err);
      alert(err.message || "Failed to start verification");
    }
  };

  return (
    <button
      onClick={startVerification}
      disabled={loading}
      style={{
        ...styles.button,
        backgroundColor: loading ? "#cccccc" : "#2a5c2a",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Preparing..." : "Verify My Identity"}
    </button>
  );
};

const styles = {
  button: {
    marginTop: "10px",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  },
};

export default PersonaVerifyButton;