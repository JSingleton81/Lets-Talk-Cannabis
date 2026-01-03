import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified21, setIsVerified21] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // 📡 Get fresh token with "kid" claim
          const token = await currentUser.getIdToken(true);
          
          if (!token) {
            // No token yet, use localStorage fallback
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              setIsVerified21(!!parsed.is_verified_21);
            } else {
              // Brand new signup - default to unverified
              setIsVerified21(false);
            }
            setLoading(false);
            return;
          }

          try {
            const res = await axios.get(`${API_BASE}/api/auth/status`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
              }
            });
            setIsVerified21(!!res.data.is_verified_21);
            
            // Sync localStorage so it stays updated for other components
            localStorage.setItem("user", JSON.stringify({ ...res.data }));
          } catch (apiErr) {
            // Backend endpoint not available yet, check localStorage
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              setIsVerified21(!!parsed.is_verified_21);
            } else {
              // New user - keep unverified until backend confirms
              setIsVerified21(false);
            }
          }
        } catch (tokenErr) {
          console.error("Token retrieval error:", tokenErr);
          setIsVerified21(false);
        }
      } else {
        setIsVerified21(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isVerified21 // 🟢 Now ProtectedRoute can find this!
  };
};