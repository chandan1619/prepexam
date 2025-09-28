// Service Worker for enhanced caching
const CACHE_NAME = 'edmissions-v1';
const API_CACHE_NAME = 'edmissions-api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  API_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  STATIC_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
};

// URLs to cache
const STATIC_ASSETS = [
  '/',
  '/exams',
  '/blog',
  '/manifest.json',
];

const API_ENDPOINTS = [
  '/api/courses',
  '/api/blog/featured',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle images
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }
});

// API request handler - stale-while-revalidate
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // If we have a cached response, return it immediately
  if (cachedResponse) {
    // Check if cache is still fresh
    const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
    const now = new Date();
    const isStale = (now - cacheTime) > CACHE_STRATEGIES.API_CACHE_DURATION;
    
    if (!isStale) {
      return cachedResponse;
    }
    
    // Cache is stale, fetch in background and return stale data
    fetchAndCache(request, cache);
    return cachedResponse;
  }
  
  // No cached response, fetch and cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(cache, request, response.clone());
    }
    return response;
  } catch (error) {
    // Network error, return cached response if available
    return cachedResponse || new Response('Network error', { status: 503 });
  }
}

// Static request handler - cache first
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Network error', { status: 503 });
  }
}

// Image request handler - cache first with long TTL
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return a placeholder image or error response
    return new Response('Image not found', { status: 404 });
  }
}

// Helper function to fetch and cache
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(cache, request, response);
    }
  } catch (error) {
    console.error('Background fetch failed:', error);
  }
}

// Helper function to cache response with timestamp
async function cacheResponse(cache, request, response) {
  const responseToCache = response.clone();
  responseToCache.headers.set('sw-cache-time', new Date().toISOString());
  await cache.put(request, responseToCache);
}