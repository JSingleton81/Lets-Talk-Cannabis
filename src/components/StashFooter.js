import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StashFooter.css';

const StashFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="stash-cta-footer">
      <div className="cta-content">
        <h2>Want to grow your own Garden? 🌿</h2>
        <p>Join our verified 21+ community to track your favorite strains, discover new terpenes, and connect with enthusiasts.</p>
        <button className="btn-main" onClick={() => navigate('/signup')}>
          Get Verified & Join Now
        </button>
      </div>
      <p className="copyright">&copy; 2026 Let's Talk Cannabis. All rights reserved.</p>
    </footer>
  );
};

export default StashFooter;
