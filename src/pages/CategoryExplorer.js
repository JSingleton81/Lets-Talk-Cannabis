import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PostCard from "../components/PostCard";
import "../styles/CategoryExplorer.css";

const CategoryExplorer = () => {
  const { type } = useParams(); // e.g. "Sativa"
  const navigate = useNavigate();

  const [strains, setStrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Normalize the route param to match backend
   * /category/sativas → Sativa
   * /category/Sativa → Sativa
   */
  const normalizedType = useMemo(() => {
    if (!type) return "Hybrid";
    const t = String(type).toLowerCase();

    if (t.startsWith("sativa")) return "Sativa";
    if (t.startsWith("indica")) return "Indica";
    if (t.startsWith("hybrid")) return "Hybrid";

    return "Hybrid";
  }, [type]);

  /**
   * Fetch strains for this category
   */
  const fetchFullCategory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/api/strains/category/${normalizedType}`);

      setStrains(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Explorer Load Error:", err);
      setError(
        err?.response?.data?.error ||
          "The garden is currently resting. Try again."
      );
      setStrains([]);
    } finally {
      setLoading(false);
    }
  }, [normalizedType]);

  useEffect(() => {
    fetchFullCategory();
  }, [fetchFullCategory]);

  if (loading) {
    return <div className="explorer-loading">Loading unique strains...</div>;
  }

  return (
    <div className="explorer-page">
      <div className="explorer-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Garden
        </button>

        <h1 className="explorer-title">All {normalizedType} Varieties</h1>

        {error ? (
          <div className="error-zone">
            <p className="error-text">⚠️ {error}</p>
            <button onClick={fetchFullCategory} className="retry-btn">
              Retry Load
            </button>
          </div>
        ) : (
          <p className="explorer-subtitle">
            Showing {strains.length} unique strains.
          </p>
        )}
      </div>

      <div className="explorer-grid">
        {!error &&
          strains.map((strain) => (
            <div
              key={strain.id}
              className="explorer-card-wrapper"
              onClick={() => navigate(`/strain/${strain.id}`)}
            >
              <PostCard post={strain} isStrainView={true} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default CategoryExplorer;
