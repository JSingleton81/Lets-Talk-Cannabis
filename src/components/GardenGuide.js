import React from 'react';
import '../styles/GardenGuide.css';

const GardenGuide = () => {
  return (
    <section className="preservation-station">
      <div className="station-header">
        <h2>🌿 Preserve Your Perfect Match</h2>
        <p>Protect your terpenes from disappearing. If you can smell them in the room, they're leaving the plant.</p>
      </div>

      <div className="preservation-grid">
        {/* Card 1: Air Control */}
        <div className="preservation-card">
          <div className="card-icon">🔒</div>
          <h3>Seal the Aroma</h3>
          <p>The <strong>Tightvac Vacuum Container</strong> stops "off-gassing" with a patented seal, keeping Limonene and Myrcene locked inside.</p>
        </div>

        {/* Card 2: Moisture Control */}
        <div className="preservation-card">
          <div className="card-icon">💧</div>
          <h3>The Terpene Shield</h3>
          <p><strong>Boveda 62% Packs</strong> create a monolayer of purified water over trichomes, physically preventing terpene evaporation.</p>
        </div>

        {/* Card 3: Light Control */}
        <div className="preservation-card">
          <div className="card-icon">🌈</div>
          <h3>Block the Energy</h3>
          <p>The <strong>Herb Guard UV Jar</strong> uses violet glass to filter out destructive light waves while letting in beneficial infrared rays.</p>
        </div>
      </div>

      <div className="pro-tip-banner">
        <p>💡 <strong>Pro Tip:</strong> Combine all three for maximum preservation. Your strains will maintain their aroma and potency for months.</p>
      </div>
    </section>
  );
};

export default GardenGuide;
