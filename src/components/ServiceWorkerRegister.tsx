"use client";

import { useEffect } from "react";

// Registers the PWA service worker (app-shell caching). No-ops if unsupported.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Ignore registration failures; the app still works online.
    });
  }, []);

  return null;
}
