import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VerifyIdentity from "./pages/VerifyIdentity";
import Feed from "./pages/Feed";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import AboutMe from "./pages/AboutMe";
import PublicStash from "./pages/PublicStash";
import Categories from "./pages/Categories";

// 🚀 FIXED: Added necessary imports to prevent ReferenceErrors
import StrainDetail from "./pages/StrainDetail"; 
import CategoryExplorer from "./pages/CategoryExplorer"; 

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { isAuthenticated, isVerified21 } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutMe />} />
        
        {/* 🔗 Dynamic Strain Detail: Connects to unique MySQL IDs */}
        <Route path="/strain/:strainId" element={<StrainDetail />} />
        
        {/* 🔗 Category Explorer: Used by 'View All' buttons */}
        <Route path="/category/:type" element={<CategoryExplorer />} />
        <Route path="/categories" element={<Categories />} />

        <Route path="/public-stash/:uid" element={<PublicStash />} />

        {/* --- PROTECTED & VERIFIED ROUTES --- */}
        <Route path="/dashboard" element={<ProtectedRoute requireVerification={true}><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute requireVerification={true}><Profile /></ProtectedRoute>} />
        <Route path="/feed" element={<ProtectedRoute requireVerification={true}><Feed /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute requireVerification={true}><Chat /></ProtectedRoute>} />

        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;