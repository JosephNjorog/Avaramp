"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Check for updates every 60 minutes
          setInterval(() => reg.update(), 60 * 60 * 1000);
        })
        .catch(() => {/* SW registration failed — non-fatal */});
    });
  }, []);

  return null;
}
