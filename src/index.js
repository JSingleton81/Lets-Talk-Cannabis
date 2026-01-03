import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { registerServiceWorker } from "./utils/notificationService";

// Load global styles for the entire app
import "./styles/global.css";

// Register service worker only in production to avoid dev HMR/WebSocket issues
if (process.env.NODE_ENV === "production") {
  registerServiceWorker();
} else {
  // In development, ensure any existing SW is unregistered to prevent caching/HMR conflicts
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
  </React.StrictMode>
);
