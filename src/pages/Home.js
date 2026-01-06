import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import CategoryRow from "../components/CategoryRow";
import GardenGuide from "../components/GardenGuide";
import StorageBanner from '../components/StorageBanner';

import '../styles/Home.css';

/**
 * 🎴 StrainCard Component:
 * Defines the visual structure for individual strains within category rows.
 * Includes dynamic badges based on the strain type from MySQL.
 */
const StrainCard = ({ strain }) => (
  <div className="strain-card">
    <div className="strain-image-wrapper">
       <img src={strain.image_url || 'default-leaf.png'} alt={strain.name} />
       <span className={`type-badge ${strain.type.toLowerCase()}`}>{strain.type}</span>
    </div>
    <div className="strain-info">
      <h3>{strain.name}</h3>
      <p className="terpene">🧬 Primary Terpene: {strain.primary_terpene}</p>
      <p className="effects">✨ {strain.effects}</p>
      <button className="learn-more-btn">View Details</button>
    </div>
  </div>
);


const Home = () => {
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sativas, setSativas] = useState([]);
  const [indicas, setIndicas] = useState([]);
  const [hybrids, setHybrids] = useState([]);
  const [spotlight, setSpotlight] = useState({ terpene: '', strains: [] });
  const [matchedStrains, setMatchedStrains] = useState([]);
  const [matchedTerpene, setMatchedTerpene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- GLOBAL SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const handleGlobalSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Combine all strains for global search
  const allStrains = [...sativas, ...indicas, ...hybrids];
  const filteredStrains = searchTerm
    ? allStrains.filter((strain) => {
        const term = searchTerm.toLowerCase();
        return (
          strain.name?.toLowerCase().includes(term) ||
          strain.primary_terpene?.toLowerCase().includes(term) ||
          strain.effects?.toLowerCase().includes(term) ||
          strain.type?.toLowerCase().includes(term)
        );
      })
    : [];

  const handleClearSearch = () => setSearchTerm("");

  // Toggle Sidebar Menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  /**
   * 🧪 handleTerpeneMatch:
   * Connects the Terpene Legend clicks to the MySQL database.
   * Fetches all strains that share a specific terpene profile.
   */
  const handleTerpeneMatch = async (terpeneName) => {
    try {
      const res = await axios.get(`/api/strains/match/${terpeneName}`);
      setMatchedStrains(res.data);
      setMatchedTerpene(terpeneName);
      // Smooth scroll back to top to show results immediately
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Match error", err);
      setError(`Failed to find strains with ${terpeneName}`);
    }
  };

  // Reset view to original category categories
  const clearMatchView = () => {
    setMatchedStrains([]);
    setMatchedTerpene(null);
  };

  /**
   * 📡 useEffect - Initial Data Pull:
   * Connects to multiple MySQL endpoints to populate the home categories.
   * Handles error states to prevent app crashes on database timeout.
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Concurrent requests for faster loading
        const [resSativa, resIndica, resHybrid, resSpotlight] = await Promise.all([
          axios.get('/api/strains/category/Sativa'),
          axios.get('/api/strains/category/Indica'),
          axios.get('/api/strains/category/Hybrid'),
          axios.get('/api/strains/terpene-spotlight')
        ]);

        setSativas(Array.isArray(resSativa.data) ? resSativa.data : []);
        setIndicas(Array.isArray(resIndica.data) ? resIndica.data : []);
        setHybrids(Array.isArray(resHybrid.data) ? resHybrid.data : []);
        setSpotlight(resSpotlight.data || { terpene: '', strains: [] });
        setError(null);
      } catch (err) {
        console.error("Error loading categories", err);
        setError("Failed to load strain categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);


  return (
    <div className="home-container">
      {/* --- NAVIGATION BAR --- */}
      <nav className="navbar">
        <div className="logo">🌿 Garden</div>
        {/* Hamburger Icon: Triggers the sliding menu window */}
        <div className="menu-icon" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </nav>

      {/* --- SLIDING MENU WINDOW --- 
          Positioned left-side with z-index 2001 to prevent X sign cut-off
      */}
      <div className={`menu-window ${isMenuOpen ? 'open' : ''}`}>
        <div className="close-btn" onClick={toggleMenu}>×</div>
        <ul className="menu-links">
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
          <li><Link to="/feed" onClick={toggleMenu}>Feed</Link></li>
          <li><Link to="/categories" onClick={toggleMenu}>Categories</Link></li>
          <li><Link to="/profile" onClick={toggleMenu}>My Profile</Link></li>
          <li><button className="logout-link" onClick={() => {/* TODO: implement logout */}}>Log Out</button></li>
        </ul>
      </div>

      {/* --- HERO & PRIMARY SEARCH --- */}

      <section className="hero">
        <div className="hero-content">
          <h1>🌿 Welcome to the Community</h1>
          <p>Discover, preserve, and share your favorite strains.</p>
          {/* Top-level search bar with clear button */}
          <div className="global-search-bar">
            <input
              type="text"
              placeholder="Search all strains, terpenes, or effects..."
              value={searchTerm}
              onChange={handleGlobalSearch}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={handleClearSearch} aria-label="Clear search">✕</button>
            )}
          </div>
        </div>
      </section>



      {/* --- SEARCH RESULTS OR DEFAULT FEED ROWS --- */}
      {searchTerm ? (
        <div className="search-results-view">
          <h2>🔍 Search Results</h2>
          {filteredStrains.length === 0 ? (
            <p>No strains found matching "{searchTerm}".</p>
          ) : (
            <div className="search-results-grid">
              {filteredStrains.map((strain) => (
                <StrainCard key={strain.id} strain={strain} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="home-feed">
          <CategoryRow title="🚀 Uplifting Sativas" strains={sativas} />
          <CategoryRow title="😴 Relaxing Indicas" strains={indicas} />
          <CategoryRow title="⚖️ Balanced Hybrids" strains={hybrids} />
          <GardenGuide />
        </div>
      )}
    </div>
  );
};

export default Home;