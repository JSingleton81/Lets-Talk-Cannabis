import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import CategoryRow from "../components/CategoryRow";
import "../styles/Categories.css";

/**
 * Categories Page
 * ============================================================
 * Loads:
 *  - Sativa / Indica / Hybrid category rows
 *  - A full index of strains for instant search
 *
 * NOTE:
 * CRA proxy is set to "http://localhost:5000"
 * so axios.get("/api/...") proxies to backend.
 */

// Optional: create a small axios instance with defaults
const api = axios.create({
  timeout: 15000, // 15s timeout so requests don’t hang forever
});

const Categories = () => {
  const [data, setData] = useState({
    sativas: [],
    indicas: [],
    hybrids: [],
    allStrains: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * ✅ React 18 StrictMode runs effects twice in dev.
   * This prevents duplicate fetch spam in development.
   */
  const didFetch = useRef(false);

  /**
   * ✅ Use a real ref for mounted tracking (works for Retry too)
   */
  const isMountedRef = useRef(true);

  /**
   * ✅ Fetch function (reusable for Retry)
   * NOTE: Defined outside useEffect, but we only call it from inside effects
   * or button click, so no need for exhaustive-deps eslint rule.
   */
  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [resSativa, resIndica, resHybrid, resAll] = await Promise.all([
        api.get("/api/strains/category/Sativa"),
        api.get("/api/strains/category/Indica"),
        api.get("/api/strains/category/Hybrid"),
        api.get("/api/strains?limit=250"),
      ]);

      if (!isMountedRef.current) return;

      setData({
        sativas: resSativa.data || [],
        indicas: resIndica.data || [],
        hybrids: resHybrid.data || [],
        allStrains: resAll.data || [],
      });
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;

      console.error("Error loading categories:", {
        message: err?.message,
        status,
        body,
      });

      const msg =
        body?.error ||
        body?.message ||
        body?.details ||
        err?.message ||
        "Failed to load strains. Please try again.";

      if (!isMountedRef.current) return;
      setError(msg);
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    // mark mounted
    isMountedRef.current = true;

    // Prevent StrictMode dev double-call
    if (didFetch.current) return;
    didFetch.current = true;

    load();

    // Cleanup when navigating away
    return () => {
      isMountedRef.current = false;
    };
    // Intentionally empty deps: we want this to run once on mount.
  }, []);

  /**
   * ✅ Derived search results (fast + memoized)
   */
  const filteredResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    return (data.allStrains || []).filter((s) => {
      const name = (s.name || "").toLowerCase();
      const terp = (s.primary_terpene || "").toLowerCase();
      return name.includes(term) || terp.includes(term);
    });
  }, [searchTerm, data.allStrains]);

  // Loading UI
  if (loading) {
    return (
      <div className="categories-page-container">
        <section className="explorer-hero">
          <h1>Strain Explorer</h1>
          <p>Loading strains…</p>
        </section>
      </div>
    );
  }

  // Error UI with retry
  if (error) {
    return (
      <div className="categories-page-container">
        <section className="explorer-hero">
          <h1>Strain Explorer</h1>

          <p style={{ marginTop: 8 }}>⚠️ {error}</p>

          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Make sure the backend is running on port 5000 and your React proxy is enabled.
          </p>

          <button style={{ marginTop: 12 }} onClick={load}>
            Retry
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="categories-page-container">
      <section className="explorer-hero">
        <h1>Strain Explorer</h1>

        <div className="explorer-search-bar">
          <input
            type="text"
            placeholder="Search unique strains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search strains"
          />
        </div>
      </section>

      {searchTerm.trim() ? (
        <div className="explorer-results-grid">
          {filteredResults.length ? (
            filteredResults.map((strain) => (
              <PostCard key={strain.id} post={strain} isStrainView={true} />
            ))
          ) : (
            <p style={{ padding: "12px 0" }}>No matches found.</p>
          )}
        </div>
      ) : (
        <div className="category-sections">
          <CategoryRow title="Uplifting Sativas" strains={data.sativas} />
          <CategoryRow title="Relaxing Indicas" strains={data.indicas} />
          <CategoryRow title="Balanced Hybrids" strains={data.hybrids} />
        </div>
      )}
    </div>
  );
};

export default Categories;
