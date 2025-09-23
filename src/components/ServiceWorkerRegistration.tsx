'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Clean up any existing service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
      
      // Clear all caches
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }
  }, []);

  return null; // No service worker registration
}