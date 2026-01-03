import React, { useState, useEffect } from "react";
import axios from "axios";
/** * 🟢 FIX: Use Namespace import (* as Persona).
 * This is the most reliable way to avoid the 'undefined' error 
 * when a package has complex build exports.
 */
import * as Persona from "persona-react"; 
import { useAuth } from "../hooks/useAuth";
import "../styles/Verification.css"; 

/**
 * 🛠️ Environment Variables
 * Inquiry Template ID from your Persona Dashboard (itmpl_...)
 * This requires creating the inquiry on the backend first.
 */
const TEMPLATE_ID = process.env.REACT_APP_PERSONA_TEMPLATE_ID;
const PERSONA_ENVIRONMENT_ID = process.env.REACT_APP_PERSONA_ENVIRONMENT_ID;
const API_URL = process.env.REACT_APP_API_URL;

// 🔍 Debug: Log template IDs and environment to verify they're loaded
console.log("Template ID:", TEMPLATE_ID);
console.log("Persona Environment ID:", PERSONA_ENVIRONMENT_ID);

// 🟢 Single inquiry template flow (ID + Selfie combined)
const VerifyIdentity = () => {
  const { user } = useAuth();
  
  const [isReady, setIsReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryId, setInquiryId] = useState(null);

  // Use Firebase UID as the reference for the inquiry
  const firebaseUid = user?.uid;

  /**
   * 🔍 DYNAMIC COMPONENT RESOLVER
   * Checks multiple common export names to find the actual React function.
   * This clears the "type is invalid -- got: undefined" crash.
   */
  const InquiryComponent = 
    Persona.Inquiry || 
    Persona.PersonaInquiry || 
    (Persona.default && (Persona.default.Inquiry || Persona.default.PersonaInquiry)) ||
    Persona.default;



  // 🛡️ Safety Check: If SDK fails to load or IDs are missing
  if (!InquiryComponent || !TEMPLATE_ID) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h2>❌ Configuration Error</h2>
          <p>Persona verification is not properly configured.</p>
          {!InquiryComponent && <p className="error-small">Persona SDK not found.</p>}
          {!TEMPLATE_ID && (
            <p className="error-small">Missing REACT_APP_PERSONA_TEMPLATE_ID in .env</p>
          )}
          {(!TEMPLATE_ID) && (
            <p style={{fontSize: '0.85rem', marginTop: '10px'}}>
              1. Go to Persona Dashboard → Templates<br/>
              2. Copy your template ID (start with itmpl_)<br/>
              3. Add to your .env file<br/>
              4. Restart the dev server
            </p>
          )}
        </div>
      </div>
    );
  }



  /**
   * Final Step: Redirect to Feed
   * We wait 3 seconds to ensure the Persona Webhook hits our server
   * and updates the MySQL database status.
   */
  const handleContinue = () => {
    setIsProcessing(true);
    setTimeout(() => { 
      window.location.href = "/feed"; 
    }, 3000);
  };

  /**
   * Create inquiry via backend using the inquiry template (itmpl_)
   */
  useEffect(() => {
    const createInquiry = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken(true);
        const res = await axios.post(
          `${API_URL}/verify/persona/create-inquiry`,
          {
            firebaseUid,
            templateId: TEMPLATE_ID,
            templateType: 'combined',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setInquiryId(res.data.inquiryId);
        console.log('✅ Inquiry created:', res.data.inquiryId);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error creating inquiry:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to create inquiry');
        setLoading(false);
      }
    };

    if (firebaseUid) {
      createInquiry();
    }
  }, [firebaseUid]);

  // Show loading while creating inquiry
  if (loading) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h2>🌿 Preparing Verification...</h2>
          <p>Setting up secure verification module.</p>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Show error if inquiry creation failed
  if (error) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h2>❌ Setup Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="primary-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-card">
        {isProcessing ? (
          <div className="processing-status">
            <h2>🌿 Finalizing Access...</h2>
            <p>Syncing your status with the community garden.</p>
            <div className="spinner"></div> 
          </div>
        ) : (
          <>
            <header className="verification-header">
              <h2>🌿 Members Only</h2>
              <p>Verify your identity once to unlock the 21+ community feed.</p>
            </header>
            
            <div className="verification-grid">
              <div className="verify-step">
                <h3>📸 ID + Selfie Verification</h3>
                {isCompleted ? (
                  <p className="status-badge verified">Verified</p>
                ) : (
                  <InquiryComponent
                    inquiryId={inquiryId}
                    environmentId={PERSONA_ENVIRONMENT_ID}
                    onReady={() => {
                      console.log('Inquiry Ready');
                      setIsReady(true);
                    }}
                    onComplete={({ inquiryId }) => {
                      console.log(`✅ Verification Done: ${inquiryId}`);
                      setIsCompleted(true);
                    }}
                    onError={(error) => {
                      console.error('❌ Verification Error:', error);
                      alert(`Verification failed: ${error.message || 'Unknown error'}`);
                    }}
                  />
                )}
                {!isReady && !isCompleted && <p className="hint">Loading secure verification module...</p>}
              </div>
            </div>

            {isCompleted && (
              <div className="continue-section">
                <button onClick={handleContinue} className="primary-btn">
                  Continue to Community Feed
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyIdentity;