/**
 * windowManager.js
 * Utility for managing detached windows in the Mems component
 */

// Store references to all detached windows
const detachedWindows = new Map();

/**
 * Register a new detached window
 * @param {string} id - Unique ID for the notepad
 * @param {Window} windowRef - Reference to the Window object
 * @returns {boolean} - Success status
 */
export const registerWindow = (id, windowRef) => {
  if (!id || !windowRef) return false;
  
  detachedWindows.set(id, {
    window: windowRef,
    timestamp: Date.now()
  });
  
  // Set up event listener to auto-remove on window close
  windowRef.addEventListener('unload', () => {
    removeWindow(id);
  });
  
  return true;
};

/**
 * Remove a window from the registry
 * @param {string} id - Unique ID for the notepad
 * @returns {boolean} - Success status
 */
export const removeWindow = (id) => {
  if (!id || !detachedWindows.has(id)) return false;
  detachedWindows.delete(id);
  return true;
};

/**
 * Get a window reference by ID
 * @param {string} id - Unique ID for the notepad
 * @returns {Window|null} - Reference to the Window object or null
 */
export const getWindow = (id) => {
  if (!id || !detachedWindows.has(id)) return null;
  
  const entry = detachedWindows.get(id);
  if (!entry.window || entry.window.closed) {
    // Clean up closed windows
    detachedWindows.delete(id);
    return null;
  }
  
  return entry.window;
};

/**
 * Close all detached windows
 * @returns {number} - Number of windows closed
 */
export const closeAllWindows = () => {
  let count = 0;
  
  detachedWindows.forEach((entry, id) => {
    if (entry.window && !entry.window.closed) {
      try {
        entry.window.close();
        count++;
      } catch (error) {
        console.error(`Error closing window ${id}:`, error);
      }
    }
  });
  
  detachedWindows.clear();
  return count;
};

/**
 * Check if a window is still open
 * @param {string} id - Unique ID for the notepad
 * @returns {boolean} - True if window exists and is open
 */
export const isWindowOpen = (id) => {
  if (!id || !detachedWindows.has(id)) return false;
  
  const entry = detachedWindows.get(id);
  return entry.window && !entry.window.closed;
};

/**
 * Get the number of currently detached windows
 * @returns {number} - Count of detached windows
 */
export const getWindowCount = () => {
  let count = 0;
  
  detachedWindows.forEach((entry) => {
    if (entry.window && !entry.window.closed) {
      count++;
    }
  });
  
  return count;
};

/**
 * Bring a specific window to the front
 * @param {string} id - Unique ID for the notepad
 * @returns {boolean} - Success status
 */
export const focusWindow = (id) => {
  const win = getWindow(id);
  if (!win) return false;
  
  try {
    win.focus();
    return true;
  } catch (error) {
    console.error(`Error focusing window ${id}:`, error);
    return false;
  }
};

// Export the window manager API
export default {
  registerWindow,
  removeWindow,
  getWindow,
  closeAllWindows,
  isWindowOpen,
  getWindowCount,
  focusWindow
};