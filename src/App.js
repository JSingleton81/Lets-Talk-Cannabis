import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerifyIdentity from "./pages/VerifyIdentity"; // ✅ Dual-template version (ID + Selfie)
import Feed from "./pages/Feed";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { isAuthenticated, isVerified21 } = useAuth();

  return (
    <>
      {/* Global Navigation */}
      <Navbar />

      {/* App Routes */}
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* --- PROTECTED ROUTES (Login Required + Verification Required) --- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireVerification={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute requireVerification={true}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* --- PROTECTED ROUTES (Login Required) --- */}
        {/* Verification status/Persona entry point */}
        <Route
          path="/verify-identity"
          element={
            <ProtectedRoute>
              <VerifyIdentity />
            </ProtectedRoute>
          }
        />

        {/* --- VERIFIED ROUTES (Login + ID Verified 21+ Required) --- */}
        <Route
          path="/feed"
          element={
            <ProtectedRoute requireVerification={true}>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute requireVerification={true}>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: Redirect unknown routes to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;