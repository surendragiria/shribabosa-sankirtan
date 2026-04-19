// बाबोसा संकीर्तन - Service Worker for Offline Support
// Version 1.0.0

const CACHE_NAME = 'babosa-sankirtan-v1';
const RUNTIME_CACHE = 'babosa-sankirtan-runtime-v1';

// Files to cache immediately when SW installs
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache the essentials
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS).catch((error) => {
          console.warn('[Service Worker] Precache failed for some items:', error);
          // Continue even if some precaching fails
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !currentCaches.includes(cacheName))
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except for known CDNs)
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('cdn.jsdelivr.net') &&
      !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  // Network-first for HTML (so users always get latest app version when online)
  if (request.mode === 'navigate' || 
      (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the fresh copy
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed - serve from cache
          console.log('[Service Worker] Network failed, serving from cache:', request.url);
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/index.html') || caches.match('/');
            });
        })
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately
          // Also update cache in background (stale-while-revalidate pattern)
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {
            // Background update failed, but we already have cached version
          });
          return cachedResponse;
        }

        // Not in cache - fetch from network and cache it
        return fetch(request).then((response) => {
          // Don't cache errors or non-200 responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        }).catch((error) => {
          console.log('[Service Worker] Fetch failed:', request.url, error);
          // For image requests, could return a placeholder here if desired
          throw error;
        });
      })
  );
});

// Listen for skip-waiting message from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
