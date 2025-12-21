import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "./Loader";

const ProtectedRoute = ({ children, requireVerification = false }) => {
  const { isAuthenticated, isVerified21, loading } = useAuth(); // Ensure useAuth provides isVerified21
  const location = useLocation();

  // 1️⃣ Loading state
  if (loading) {
    return <Loader />;
  }

  // 2️⃣ Not Logged In -> Go to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3️⃣ Logged in BUT not verified (and the route requires it)
  // This redirects them to the Dashboard to complete their ID check
  if (requireVerification && !isVerified21) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4️⃣ Success -> Render the page
  return children;
};

export default ProtectedRoute;