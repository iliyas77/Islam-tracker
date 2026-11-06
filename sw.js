/* ============================================================
   Nur Prayer — Progressive Web App Service Worker
   Path: sw.js
   Responsibilities:
     - Offline caching and resilient fallback
     - Cache-first strategy for app shell and static resources
     - Network-first strategy with cache fallback for Aladhan prayer times API
     - Automatic cache versioning and cleanup
   ============================================================ */
'use strict';

const CACHE_NAME = 'nur-prayer-v1';

const STATIC_PRECACHE_URLS = [
    './',
    './main.html',
    './production/production.html',
    './manifest.json',
    './favicon.svg',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
    './icons/icon-maskable.svg',
    'https://cdnjs.cloudflare.com/ajax/libs/knockout/3.5.1/knockout-latest.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];

// 1. Install Event: Pre-cache App Shell and Core Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_PRECACHE_URLS).catch((err) => {
                console.warn('[SW] Some static assets failed to pre-cache during install:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch Event: Routing & Caching Strategies
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // A. API Requests (e.g. Aladhan Prayer Times API) -> Network-First with Cache Fallback
    if (url.hostname.includes('aladhan.com') || url.pathname.includes('/v1/timings')) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        return new Response(JSON.stringify({ code: 503, status: 'OFFLINE_FALLBACK', data: null }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    });
                })
        );
        return;
    }

    // B. App Shell Navigation & Static Assets -> Cache-First with Network Revalidation
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version immediately, revalidate in background
                fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                    }
                }).catch(() => { /* Offline, cached response was already served */ });

                return cachedResponse;
            }

            // Not in cache: fetch from network and dynamically cache
            return fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return networkResponse;
            }).catch(() => {
                // If navigation request fails offline, fallback to main.html or production.html
                if (request.mode === 'navigate') {
                    return caches.match('./main.html').then((fallback) => {
                        return fallback || caches.match('./production/production.html');
                    });
                }
            });
        })
    );
});

