import React from "react";
import App from "./App";
import { createBrowserRouter } from "react-router-dom";

// Opt-in to React Router v7 transition behavior
export const router = createBrowserRouter(
  [
    // Render the existing App which defines <Routes> internally
    { path: "*", element: <App /> },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);
