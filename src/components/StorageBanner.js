import React from 'react';
import '../styles/StorageBanner.css';

const StorageBanner = ({ layout = 'compact' }) => {
  if (layout === 'compact') {
    return (
      <div className="storage-banner-compact">
        <div className="banner-content">
          <h3>🔒 Protect Your Terpenes</h3>
          <p>If you can smell them in the room, they're leaving the plant. Lock in freshness with professional storage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="storage-banner-full">
      <h2>💎 Preserve Your Perfect Match</h2>
      <p className="banner-subtitle">
        Terpenes are highly volatile. Once you find your ideal strain, proper storage is essential.
      </p>
      
      <div className="storage-methods">
        <div className="method">
          <span className="method-icon">🔒</span>
          <h4>Seal the Aroma</h4>
          <p><strong>Tightvac Vacuum Containers</strong> stop terpene off-gassing with patented vacuum seals.</p>
        </div>
        
        <div className="method">
          <span className="method-icon">💧</span>
          <h4>The Terpene Shield</h4>
          <p><strong>Boveda 62% Packs</strong> create a humidity shield over trichomes, preventing evaporation.</p>
        </div>
        
        <div className="method">
          <span className="method-icon">🌈</span>
          <h4>Block the Energy</h4>
          <p><strong>UV Glass Jars</strong> filter destructive light while maintaining freshness with violet glass technology.</p>
        </div>
      </div>
    </div>
  );
};

export default StorageBanner;
