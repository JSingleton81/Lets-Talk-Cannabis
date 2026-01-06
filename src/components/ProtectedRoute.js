import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ children, requireVerification = false }) => {
  const { isAuthenticated, isVerified21, loading } = useAuth();
  const location = useLocation();

  // 1️⃣ Loading state - ALWAYS wait for auth to load before rendering anything
  if (loading) {
    return <Loader />;
  }

  // 2️⃣ Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3️⃣ Logged in BUT not verified (and the route requires it)
  // Send them to the verification hub to complete Persona
  if (requireVerification && !isVerified21) {
    return <Navigate to="/verify-identity" replace state={{ from: location }} />;
  }

  // 4️⃣ Success -> Render the page
  return children;
};

export default ProtectedRoute;
