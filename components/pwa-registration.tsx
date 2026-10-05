"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      return;
    }

    // Mod dev: buang service worker & cache lama supaya CSS/JS terkini sentiasa dimuat.
    navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      if (!registrations.length) return;
      await Promise.all(registrations.map((r) => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      window.location.reload();
    }).catch(() => undefined);
  }, []);

  return null;
}
