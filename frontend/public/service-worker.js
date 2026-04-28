/**
 * Progressive Web App (PWA) Service Worker
 * Enables offline functionality, service worker caching, background sync
 */

// Service Worker Installation
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open('yourOwn-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/app/layout.tsx',
        '/app/page.tsx',
        '/app/patient/dashboard.tsx',
        '/app/doctor/dashboard.tsx',
        '/globals.css',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
      ]);
    })
  );

  self.skipWaiting();
});

// Service Worker Activation
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'yourOwn-v1') {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch Interception - Cache First / Network Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API requests: Network first, then cache
  if (request.url.includes('/api/') || request.url.includes('/assist') || request.url.includes('/doctor')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open('yourOwn-api-v1').then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((response) => {
            if (response) {
              console.log('[ServiceWorker] Serving from cache (offline):', request.url);
              return response;
            }

            // If not in cache, return offline page
            return caches.match('/offline.html');
          });
        })
    );
  } else {
    // Static assets: Cache first
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseClone = response.clone();
          caches.open('yourOwn-v1').then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        });
      })
    );
  }
});

// Background Sync - Sync queued alerts when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncQueuedAlerts());
  }
});

async function syncQueuedAlerts() {
  try {
    const db = await openDB();
    const queuedAlerts = await db.getAll('queuedAlerts');

    for (const alert of queuedAlerts) {
      try {
        const response = await fetch('/api/alerts/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });

        if (response.ok) {
          const db = await openDB();
          await db.delete('queuedAlerts', alert.id);
        }
      } catch (error) {
        console.error('[BackgroundSync] Error syncing alert:', error);
      }
    }
  } catch (error) {
    console.error('[BackgroundSync] Error:', error);
  }
}

// Open IndexedDB for offline data storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('yourOwn-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store for queued alerts
      if (!db.objectStoreNames.contains('queuedAlerts')) {
        db.createObjectStore('queuedAlerts', { keyPath: 'id', autoIncrement: true });
      }

      // Store for patient data cache
      if (!db.objectStoreNames.contains('patientData')) {
        db.createObjectStore('patientData', { keyPath: 'patientId' });
      }

      // Store for dashboard cache
      if (!db.objectStoreNames.contains('dashboardCache')) {
        db.createObjectStore('dashboardCache', { keyPath: 'key' });
      }
    };
  });
}

// Message handling from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[ServiceWorker] Loaded');
