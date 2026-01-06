import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import Loader from './Loader';
import '../styles/CategoryTabs.css';

/**
 * 🌿 GardenCategory Component:
 * Provides a tabbed interface to filter strains by their type (Sativa, Indica, Hybrid).
 * Includes an internal search filter and connects to the MySQL /filter endpoint.
 */
const GardenCategory = () => {
  // --- STATE MANAGEMENT ---
  const [category, setCategory] = useState('Sativa'); // Active tab state
  const [strains, setStrains] = useState([]);         // MySQL data state
  const [searchTerm, setSearchTerm] = useState('');   // Search bar state
  const [loading, setLoading] = useState(true);       // Loading tracker
  const [error, setError] = useState(null);           // Error message state

  /**
   * 📡 fetchStrains:
   * Reaches out to the backend filter route. 
   * Handles empty responses and non-JSON data gracefully.
   */
  const fetchStrains = async () => {
    setLoading(true);
    setError(null);
    try {
      // 📡 Request data based on current tab category
      const response = await fetch(`/api/strains/filter?type=${category}`, {
        headers: { 
          "ngrok-skip-browser-warning": "true", // Required for Ngrok tunnels
          "Content-Type": "application/json"
        }
      });

      // 🛑 Network Check: Verify if the server is even responding
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      // 🧪 Safety Check: Capture the raw text body first
      const text = await response.text();
      
      // If the body is empty, we set an empty array instead of failing
      if (!text || text.trim().length === 0) {
        console.warn(`[Garden] Received empty body for category: ${category}`);
        setStrains([]);
        return;
      }

      // Parse the validated text as JSON
      const data = JSON.parse(text);
      setStrains(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("Failed to pull strain info:", err.message);
      setError("The garden is currently resting. Please try again later.");
      setStrains([]); // Fallback to empty array to prevent filtering errors
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data whenever the user clicks a different category tab
  useEffect(() => {
    fetchStrains();
  }, [category]);

  // --- UI FILTERING LOGIC ---
  const filteredStrains = strains.filter(strain =>
    strain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="garden-category-container">
      {/* 🔍 Search Input: Filter results within the active tab */}
      <div className="search-bar-container">
        <input 
          type="text" 
          className="garden-search-input"
          placeholder={`Search for a ${category} strain...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🧭 Navigation Tabs: Changes the MySQL query category */}
      <div className="category-tabs">
        {['Sativa', 'Indica', 'Hybrid'].map(tab => (
          <button 
            key={tab}
            className={`tab-btn ${category === tab ? 'active-tab' : ''}`}
            onClick={() => {
              setCategory(tab);
              setSearchTerm(''); // Clear search for a fresh view on new tabs
            }}
          >
            {tab === 'Sativa' ? '🚀 Uplifting' : tab === 'Indica' ? '😴 Relaxing' : '⚖️ Balanced'}
          </button>
        ))}
      </div>

      {/* 🧪 Results Grid */}
      {loading ? (
        <Loader /> 
      ) : error ? (
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={fetchStrains} className="retry-btn">Retry Load</button>
        </div>
      ) : (
        <div className="strain-results-grid">
          {filteredStrains.length > 0 ? (
            filteredStrains.map(strain => (
              /* Mapping MySQL data into the existing PostCard component */
              <PostCard key={strain.id} post={strain} /> 
            ))
          ) : (
            <p className="no-results">No matches found in the {category} garden.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GardenCategory;