/**
 * PWA registration utility
 * Registers the service worker for offline capabilities
 */

// Function to register the service worker
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/serviceWorker.js')
          .then(registration => {
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Setup for push notifications if needed
            setupPushNotifications(registration);
            
            // Setup background sync for favorites
            setupBackgroundSync(registration);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }
  
  // Function to setup push notifications
  function setupPushNotifications(registration) {
    // Request permission for notifications
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // You can subscribe the user to push notifications here
        }
      });
    }
  }
  
  // Function to setup background sync for favorites
  function setupBackgroundSync(registration) {
    if ('SyncManager' in window) {
      // Register a sync event to handle offline favorites
      navigator.serviceWorker.ready.then(registration => {
        // Check for pending sync registrations
        registration.sync.getTags().then(tags => {
          if (!tags.includes('sync-favorites')) {
            registration.sync.register('sync-favorites');
          }
        });
      });
    }
  }
  
  // Function to check if app can be installed
  export function checkForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      window.deferredPrompt = e;
      // Show your custom "Add to Home Screen" button or UI element
      showInstallPrompt();
    });
    
    // Handle the installation completion
    window.addEventListener('appinstalled', () => {
      // Log or track the installation
      console.log('PWA was installed');
      // Hide the install promotion
      hideInstallPrompt();
      // Clear the deferredPrompt
      window.deferredPrompt = null;
    });
  }
  
  // Function to show the install prompt UI
  function showInstallPrompt() {
    const installPrompt = document.createElement('div');
    installPrompt.className = 'install-prompt';
    installPrompt.innerHTML = `
      <div class="install-prompt-content">
        <p>Add the Developer Cheat Sheet to your home screen for quick access!</p>
        <div class="install-buttons">
          <button id="install-button" class="install-btn">Install</button>
          <button id="dismiss-button" class="dismiss-btn">Not Now</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(installPrompt);
    
    // Handle install button click
    document.getElementById('install-button').addEventListener('click', () => {
      const promptEvent = window.deferredPrompt;
      if (!promptEvent) {
        return;
      }
      
      // Show the install prompt
      promptEvent.prompt();
      
      // Wait for the user to respond to the prompt
      promptEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Clear the deferredPrompt variable
        window.deferredPrompt = null;
        // Remove the install prompt from UI
        hideInstallPrompt();
      });
    });
    
    // Handle dismiss button click
    document.getElementById('dismiss-button').addEventListener('click', () => {
      hideInstallPrompt();
    });
  }
  
  // Function to hide the install prompt
  function hideInstallPrompt() {
    const installPrompt = document.querySelector('.install-prompt');
    if (installPrompt) {
      installPrompt.remove();
    }
  }
  
  // Export functions for offline data management
  export function storeDataLocally(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error storing data locally:', error);
      return false;
    }
  }
  
  export function getLocalData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving local data:', error);
      return null;
    }
  }
  
  // Function to queue actions for background sync
  export async function queueFavoriteAction(action) {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported - cannot queue offline actions');
      return false;
    }
    
    try {
      const db = await openDatabase();
      const tx = db.transaction('favoriteActions', 'readwrite');
      const store = tx.objectStore('favoriteActions');
      
      // Add action to store
      await store.add({
        id: `favorite-${Date.now()}`,
        timestamp: Date.now(),
        ...action
      });
      
      await tx.complete;
      
      // Trigger background sync if online
      if (navigator.onLine && 'serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-favorites');
      }
      
      return true;
    } catch (error) {
      console.error('Error queuing favorite action:', error);
      return false;
    }
  }
  
  // Helper function to open IndexedDB
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