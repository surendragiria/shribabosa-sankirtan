/* eslint-disable */
// बाबोसा संकीर्तन - Service Worker for Offline Support
// IMPORTANT: This file MUST be placed in the `public/` folder, NOT in `src/`

var CACHE_NAME = 'babosa-sankirtan-v1';
var RUNTIME_CACHE = 'babosa-sankirtan-runtime-v1';

var PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install - pre-cache essentials
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).catch(function(err) {
        console.warn('Precache failed for some items:', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', function(event) {
  var currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return currentCaches.indexOf(name) === -1;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch - serve from cache, fall back to network
self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  var url = new URL(request.url);
  
  // Skip cross-origin requests except known CDNs
  if (url.origin !== self.location.origin) {
    if (url.hostname.indexOf('cdn.jsdelivr.net') === -1 && 
        url.hostname.indexOf('cdnjs.cloudflare.com') === -1) {
      return;
    }
  }

  // Network-first for HTML navigations
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function(response) {
        var clone = response.clone();
        caches.open(RUNTIME_CACHE).then(function(cache) {
          cache.put(request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(request).then(function(cached) {
          return cached || caches.match('/index.html') || caches.match('/');
        });
      })
    );
    return;
  }

  // Cache-first for everything else (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(request).then(function(cached) {
      if (cached) {
        // Update cache in background
        fetch(request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(RUNTIME_CACHE).then(function(cache) {
              cache.put(request, networkResponse);
            });
          }
        }).catch(function() {
          // Background update failed, but we already have cached version
        });
        return cached;
      }

      return fetch(request).then(function(response) {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        var clone = response.clone();
        caches.open(RUNTIME_CACHE).then(function(cache) {
          cache.put(request, clone);
        });
        return response;
      });
    })
  );
});

// Allow the app to tell SW to skip waiting
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
