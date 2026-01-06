import React, { useState } from 'react';

const ShareStash = ({ userUid }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/public-stash/${userUid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-box">
      <p className="share-label">Share your stash with friends:</p>
      <div className="share-url-display">
        <input 
          type="text" 
          value={shareUrl} 
          readOnly 
          className="share-url-input"
        />
      </div>
      <button onClick={copyToClipboard} className="btn-secondary">
        {copied ? '✅ Copied!' : 'Share My Stash 📤'}
      </button>
    </div>
  );
};

export default ShareStash;
