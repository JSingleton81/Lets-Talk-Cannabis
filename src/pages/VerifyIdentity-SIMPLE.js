import React, { useState } from "react";
import * as Persona from "persona-react"; 
import { useAuth } from "../hooks/useAuth";
import "../styles/Verification.css"; 

/**
 * Simplified ONE-TEMPLATE version for testing
 * ⚠️ FIRST: Get a valid template ID from your Persona Dashboard
 */
const TEMPLATE_ID = process.env.REACT_APP_PERSONA_TEMPLATE_ID;

console.log("🔍 Template ID:", TEMPLATE_ID);

const VerifyIdentity = () => {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const firebaseUid = user?.uid;

  // Find the Inquiry component
  const InquiryComponent = 
    Persona.Inquiry || 
    Persona.PersonaInquiry || 
    Persona.default;

  if (!InquiryComponent) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h2>❌ Persona SDK Error</h2>
          <p>The Persona SDK failed to load.</p>
        </div>
      </div>
    );
  }

  if (!TEMPLATE_ID) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h2>❌ Missing Template ID</h2>
          <p style={{ marginBottom: '15px' }}>
            REACT_APP_PERSONA_TEMPLATE_ID is not set in your .env file.
          </p>
          <div style={{ textAlign: 'left', fontSize: '0.9rem', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <strong>To fix this:</strong>
            <ol>
              <li>Log into your Persona Dashboard</li>
              <li>Go to Templates section</li>
              <li>Create or select a template</li>
              <li>Copy the template ID (starts with itmpl_ or vtmpl_)</li>
              <li>Add to .env: REACT_APP_PERSONA_TEMPLATE_ID=your_template_id</li>
              <li>Restart npm start</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    setIsProcessing(true);
    setTimeout(() => { 
      window.location.href = "/feed"; 
    }, 3000);
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        {isProcessing ? (
          <div className="processing-status">
            <h2>🌿 Finalizing...</h2>
            <p>Syncing with database</p>
            <div className="spinner"></div> 
          </div>
        ) : isCompleted ? (
          <div style={{ textAlign: 'center' }}>
            <h2>✅ Verified!</h2>
            <p className="status-badge verified">Identity Confirmed</p>
            <button onClick={handleContinue} className="dashboard-btn" style={{ marginTop: '20px' }}>
              Continue to Feed
            </button>
          </div>
        ) : (
          <>
            <h2>🌿 Members Only</h2>
            <p>Verify your identity to unlock the community.</p>
            
            {error && (
              <div style={{ 
                backgroundColor: '#ffebee', 
                padding: '12px', 
                borderRadius: '8px',
                color: '#c62828',
                marginTop: '15px',
                fontSize: '0.9rem'
              }}>
                <strong>Error:</strong> {error}
                <br/>
                <small>Check that your template ID exists and is published in Persona Dashboard.</small>
              </div>
            )}
            
            <div style={{ marginTop: '30px' }}>
              {!isReady && !error && <p style={{ fontSize: '0.85rem', color: '#666' }}>Loading verification...</p>}
              
              <InquiryComponent
                templateId={TEMPLATE_ID}
                referenceId={firebaseUid}
                onReady={() => {
                  console.log('✅ Inquiry Ready');
                  setIsReady(true);
                  setError(null);
                }}
                onComplete={({ inquiryId }) => {
                  console.log(`✅ Complete: ${inquiryId}`);
                  setIsCompleted(true);
                }}
                onError={(err) => {
                  console.error('❌ Error:', err);
                  const msg = err?.code === 'invalid_config' 
                    ? `Template ID "${TEMPLATE_ID}" does not exist or is not published in your Persona account.`
                    : err?.message || JSON.stringify(err);
                  setError(msg);
                  
                  // Show detailed alert
                  alert(
                    `❌ Persona Verification Failed\n\n` +
                    `Error: ${err?.code || 'unknown'}\n\n` +
                    `Your template ID (${TEMPLATE_ID}) is invalid.\n\n` +
                    `TO FIX:\n` +
                    `1. Log into https://withpersona.com/dashboard\n` +
                    `2. Go to Templates section\n` +
                    `3. Create a NEW template or find an existing one\n` +
                    `4. Copy the EXACT template ID\n` +
                    `5. Make sure the template is PUBLISHED (not draft)\n` +
                    `6. Update REACT_APP_PERSONA_TEMPLATE_ID in .env\n` +
                    `7. Restart npm start`
                  );
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyIdentity;
