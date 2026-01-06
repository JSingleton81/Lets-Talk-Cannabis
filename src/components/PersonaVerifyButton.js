import React, { useState } from 'react';
import '../styles/PersonaVerifyButton.css';

/**
 * PersonaVerifyButton
 * ----------------------------------------
 * 1. Calls your backend to create a secure Inquiry ID.
 * 2. Launches the Persona Modal using the global window.Persona object.
 */
const PersonaVerifyButton = ({ userId, token, onComplete }) => {
  const [loading, setLoading] = useState(false);

  // 📡 API Configuration: Handles local vs production URLs
  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  const startVerification = async () => {
    // 🛡️ The crash happens if window.Persona is checked during the render phase
    // Ensure it is only accessed inside this async click handler
    if (typeof window === 'undefined' || !window.Persona) {
      alert('Verification module is still loading. Please wait a moment.');
      return;
    }

    setLoading(true);

    try {
      /**
       * 1. REQUEST INQUIRY ID
       * We pass the Firebase UID to link the verification to the MySQL user row.
       * We use the JWT token to authenticate the request.
       */
      const res = await fetch(`${API_URL}/verify/persona/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Added token for security
        },
        body: JSON.stringify({ firebaseUid: userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Backend error');

      /**
       * 2. INITIALIZE PERSONA CLIENT
       * Uses the Inquiry ID provided by your server.
       */
      const client = new window.Persona.Client({
        inquiryId: data.inquiryId,
        onReady: () => {
          setLoading(false);
          client.open(); // Launches the modal overlay
        },
        onComplete: (inquiryId) => {
          console.log(`✅ Verification finished: ${inquiryId}`);
          // 🔄 Trigger status refresh in the Hub or Dashboard
          if (onComplete) onComplete();
        },
        onCancel: () => {
          setLoading(false);
          console.log('User cancelled verification');
        },
        onError: (error) => {
          setLoading(false);
          console.error('Persona error:', error);
          alert('Verification failed. Please try again.');
        },
      });
    } catch (error) {
      setLoading(false);
      console.error('Error starting verification:', error);
      alert('Could not start verification: ' + error.message);
    }
  };

  return (
    <button
      onClick={startVerification}
      disabled={loading}
      className="persona-action-btn"
      style={{
        marginTop: '10px',
        padding: '10px 20px',
        backgroundColor: loading ? '#cccccc' : '#2a5c2a',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Starting Verification...' : 'Verify Identity (21+)'}
    </button>
  );
};

export default PersonaVerifyButton;
