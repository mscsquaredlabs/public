// Service Worker for the Developer Cheat Sheet PWA
const CACHE_NAME = 'dev-cheat-sheet-cache-v1';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/static/media/favicon.ico',
  '/manifest.json',
  // Add paths to cheat sheet data files if they're separate
  '/data/cheat-sheets.json',
  // Icons and images
  '/static/media/logo192.png',
  '/static/media/logo512.png',
];

// Install event - cache initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if response is not valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it can only be used once
            const responseToCache = response.clone();

            // Open the cache and store the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails (offline), try to serve the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // Return nothing for other resources when offline and not cached
            return null;
          });
      })
  );
});

// Background sync for favoriting/unfavoriting when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Function to sync favorites with server when back online
async function syncFavorites() {
  try {
    // Get stored actions that need to be synced
    const favoriteActions = await getStoredFavoriteActions();
    
    if (favoriteActions.length === 0) {
      return;
    }
    
    // Process each action
    for (const action of favoriteActions) {
      // Send to server
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });
      
      if (response.ok) {
        // Remove from the list of actions to sync
        await removeActionFromStore(action.id);
      }
    }
  } catch (error) {
    console.error('Error syncing favorites:', error);
  }
}

// Utility functions for storing/retrieving favorite actions
async function getStoredFavoriteActions() {
  const db = await openDatabase();
  const tx = db.transaction('favoriteActions', 'readonly');
  const store = tx.objectStore('favoriteActions');
  return store.getAll();
}

async function removeActionFromStore(id) {
  const db = await openDatabase();
  const tx = db.transaction('favoriteActions', 'readwrite');
  const store = tx.objectStore('favoriteActions');
  await store.delete(id);
  await tx.complete;
}

// Open IndexedDB for storing favorite actions
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cheatSheetOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('favoriteActions')) {
        db.createObjectStore('favoriteActions', { keyPath: 'id' });
      }
    };
  });
}

// Push notification event handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const notification = event.data.json();
  const options = {
    body: notification.body,
    icon: '/static/media/logo192.png',
    badge: '/static/media/badge.png',
    data: notification.data,
  };
  
  event.waitUntil(
    self.registration.showNotification(notification.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open the app and navigate to a specific URL if provided
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no matching client found, open a new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});