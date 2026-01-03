import React, { useEffect, useState } from "react";
import PersonaVerifyButton from "../components/PersonaVerifyButton";
import { auth } from "../firebase";
import "../styles/Verification.css";

/**
 * Verification Hub
 * ----------------
 * This page serves as the central location for users to manage their identity status.
 * It uses a "polling" strategy to detect when the Persona Webhook has updated the 
 * MySQL database in the background.
 */
const Verification = () => {
  // Pull API URL from environment variables (defaults to localhost:5000)
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Local State
  const [status, setStatus] = useState("pending"); // 'pending', 'approved', or 'rejected'
  const [loading, setLoading] = useState(true);    // Global page loading
  const [error, setError] = useState("");          // Error messaging

  /**
   * Function: fetchVerificationStatus
   * Calls the backend /auth/me endpoint to get the latest user data from MySQL.
   */
  const fetchVerificationStatus = async () => {
    try {
      // 🔄 Get fresh token with "kid" claim
      const token = await auth.currentUser?.getIdToken(true);
      
      if (!token) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Pass JWT for security
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load verification status");
      }

      // 🟢 Access the columns shown in your MySQL screenshot
      const statusFromDB = data?.user?.verification_status; // 'pending', 'approved', or 'rejected'
      const isVerified = !!data?.user?.is_verified_21;      // 0 or 1 converted to boolean
      
      setStatus(statusFromDB || "pending");

      // If the user just became verified, move them to the feed automatically
      if (isVerified) {
        window.location.href = "/feed";
      }
    } catch (err) {
      console.error("Fetch Status Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Lifecycle & Polling
   * 1. Runs immediately on mount to check current status.
   * 2. If status is 'pending', sets up a 5-second interval to check for updates.
   */
  useEffect(() => {
    fetchVerificationStatus();

    let interval;
    // Only poll if the user is currently in the 'pending' state
    if (status === "pending") {
      interval = setInterval(() => {
        console.log("Polling for status update...");
        fetchVerificationStatus();
      }, 5000); 
    }

    // Cleanup: Clear interval when status changes to approved/rejected or user leaves page
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  /**
   * Helper: renderStatus
   * Returns the appropriate badge based on current MySQL status
   */
  const renderStatus = () => {
    switch (status) {
      case "approved":
      case "verified":
        return <span className="status-badge verified">Verified ✅</span>;
      case "rejected":
      case "failed":
        return <span className="status-badge failed">Verification Failed ❌</span>;
      default:
        return <span className="status-badge pending">Pending ⏳</span>;
    }
  };

  if (loading) {
    return <div className="verification-loading">Checking status...</div>;
  }

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h1>Age & Identity Verification</h1>
        
        <p className="description">
          To comply with legal regulations and maintain a safe 21+ cannabis community, 
          we require a one-time identity check.
        </p>

        {error && <div className="error-alert">{error}</div>}

        {/* Status Display Area */}
        <div className="status-section">
          <h3>Your Current Status:</h3>
          {renderStatus()}
        </div>

        <hr />

        {/* Conditional Logic: Show Persona button ONLY if not verified */}
        {status !== "approved" && status !== "verified" ? (
          <div className="action-section">
            <div className="instructions">
              <h4>How it works:</h4>
              <ul>
                <li>Have your Valid Govt. ID ready.</li>
                <li>Ensure you are in a well-lit area for a selfie.</li>
                <li>Persona will securely verify your details in real-time.</li>
              </ul>
            </div>

            <div className="btn-wrapper">
              <PersonaVerifyButton 
                onComplete={() => fetchVerificationStatus()} 
              />
            </div>
          </div>
        ) : (
          <div className="success-section">
            <p className="success-text">
              Congratulations! Your identity is verified. You now have full 
              access to post and engage with the community.
            </p>
            <button className="dashboard-btn" onClick={() => window.location.href = '/dashboard'}>
              Go to Community Feed
            </button>
          </div>
        )}

        <div className="privacy-footer">
          <p>🔒 Your data is encrypted and handled by Persona. We never store your ID documents.</p>
        </div>
      </div>
    </div>
  );
};

export default Verification;