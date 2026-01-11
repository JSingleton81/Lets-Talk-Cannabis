import React from "react";
import App from "./App";
import { createHashRouter } from "react-router-dom";

/**
 * Hash Router (GitHub Pages friendly)
 * ============================================================
 * GitHub Pages does NOT support server-side routing (refreshing deep links).
 * Hash routing avoids that by keeping the route after a #:
 *
 *   https://jsingleton81.github.io/Lets-Talk-Cannabis/#/categories
 *
 * ✅ Works on GitHub Pages
 * ✅ Works in local dev
 * ✅ No basename needed
 *
 * We render <App /> for all paths. <App /> contains <Routes> internally.
 *
 * React Router v6 -> v7 warnings:
 * - These "future flags" silence the warnings and opt you into the new behavior early.
 * - Totally optional, but keeps the console clean.
 */
export const router = createHashRouter(
  [
    {
      path: "*",
      element: <App />,
    },
  ],
  {
    future: {
      /**
       * React Router will wrap state updates in React.startTransition in v7.
       * This improves perceived performance during navigations.
       */
      v7_startTransition: true,

      /**
       * Relative route resolution in splat ("*") routes changes in v7.
       * Since we use a catch-all "*" route, opting in now prevents warnings.
       */
      v7_relativeSplatPath: true,
    },
  }
);
