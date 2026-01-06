import React, { useState } from 'react';
import axios from 'axios';

const FavoriteButton = ({ strainId, initialStatus }) => {
  const [isFavorite, setIsFavorite] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    // Optimistic update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    setLoading(true);

    try {
      await axios.post('/api/favorites/toggle', { strain_id: strainId });
    } catch (err) {
      // Rollback on error
      setIsFavorite(previousState);
      console.error('Toggle failed', err);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFavorite} 
      className={`fav-btn ${isFavorite ? 'active' : ''}`}
      disabled={loading}
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
};

export default FavoriteButton;
