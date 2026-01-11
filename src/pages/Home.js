import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GardenGuide from "../components/GardenGuide";
import StorageBanner from '../components/StorageBanner';
import '../styles/Home.css';

/**
 * 🏠 Home Page (The Portal)
 * Purpose: Lightweight landing zone with clear entry points to major features.
 * Performance: Zero heavy data fetching here to ensure instant load times.
 */
const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="home-container">
      {/* --- MINIMALIST NAVIGATION --- */}
      <nav className="navbar">
        <div className="logo">🌿 Garden</div>
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="bar"></div><div className="bar"></div><div className="bar"></div>
        </div>
      </nav>

      {/* --- SIDEBAR MENU --- */}
      <div className={`menu-window ${isMenuOpen ? 'open' : ''}`}>
        <div className="close-btn" onClick={toggleMenu}>×</div>
        <ul className="menu-links">
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          {/* Linked to verified community feed */}
          <li><Link to="/feed" onClick={toggleMenu}>Feed</Link></li>
          {/* Linked to the new searchable Explorer */}
          <li><Link to="/categories" onClick={toggleMenu}>Explorer</Link></li>
          <li><Link to="/profile" onClick={toggleMenu}>Profile</Link></li>
        </ul>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="hero">
        <div className="hero-content">
          <h1>🌿 Welcome to the Community</h1>
          <p>Your portal for strain discovery and community insights.</p>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
             {/* Main action: Opens the page with unique MySQL strains */}
             <Link to="/categories" className="tab-btn active-tab" style={{ textDecoration: 'none' }}>
               Open Explorer
             </Link>
             
             {/* Secondary action: Community interaction */}
             <Link to="/feed" className="tab-btn" style={{ textDecoration: 'none' }}>
               Community Feed
             </Link>
          </div>
        </div>
      </section>

      {/* --- EDUCATIONAL CONTENT --- */}
      <div className="home-content">
        {/* Provides the Terpene Legend */}
        <GardenGuide />
        
        {/* Offers dynamic storage advice */}
        <StorageBanner />
      </div>
    </div>
  );
};

export default Home;