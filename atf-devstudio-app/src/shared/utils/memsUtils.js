/**
 * shared/utils/memsUtils.js
 * --------------------------
 * Utilities for the Mems component (Multi-Window Notepad)
 */

/**
 * Save notepads to localStorage with debounce support
 * @param {Array} notepads - Array of notepad objects
 * @param {string} storageKey - Key to use for localStorage
 */
export const saveNotepadsToStorage = (notepads, storageKey) => {
  if (notepads.length > 0) {
    try {
      // Before saving, we need to sanitize the notepads data
      // by converting detached windows back to regular windows
      const sanitizedNotepads = notepads.map(notepad => ({
        ...notepad,
        // We don't want to save the detached state to localStorage
        // because when the user reopens the app, the popup windows won't exist
        isDetached: false
      }));
      
      localStorage.setItem(storageKey, JSON.stringify(sanitizedNotepads));
      return true;
    } catch (error) {
      console.error('Error saving notepads to storage:', error);
      return false;
    }
  }
  return false;
};

/**
 * Load notepads from localStorage
 * @param {string} storageKey - Key used in localStorage
 * @returns {Array} Array of notepad objects or empty array
 */
export const loadNotepadsFromStorage = (storageKey) => {
  try {
    const savedNotepads = localStorage.getItem(storageKey);
    if (savedNotepads) {
      return JSON.parse(savedNotepads);
    }
  } catch (error) {
    console.error('Error loading notepads from storage:', error);
  }
  return [];
};

/**
 * Check if a point is within an element's bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Element} element - DOM element to check against
 * @returns {boolean} True if point is within element bounds
 */
export const isPointWithinElement = (x, y, element) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
};

/**
 * Get the screen dimensions
 * @returns {Object} Screen width and height
 */
export const getScreenDimensions = () => {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  };
};

/**
 * Ensure a window position is within screen bounds
 * @param {Object} position - Position coordinates
 * @param {Object} size - Window size
 * @returns {Object} Adjusted position coordinates
 */
export const keepWindowInScreen = (position, size) => {
  const screen = getScreenDimensions();
  
  // Add a small padding
  const padding = 20;
  
  return {
    x: Math.min(Math.max(position.x, padding), screen.width - size.width - padding),
    y: Math.min(Math.max(position.y, padding), screen.height - size.height - padding)
  };
};

/**
 * Get default notepad content based on syntax
 * @param {string} syntax - Syntax type
 * @returns {string} Default content
 */
export const getDefaultContent = (syntax) => {
  const examples = {
    javascript: `// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`,
    
    html: `<!-- HTML Example -->
<!DOCTYPE html>
<html>
<head>
  <title>Sample Page</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a sample HTML page.</p>
</body>
</html>`,
    
    css: `/* CSS Example */
.container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}`,
    
    sql: `-- SQL Example
SELECT 
  users.name, 
  orders.order_date,
  SUM(order_items.price) as total
FROM users
JOIN orders ON users.id = orders.user_id
JOIN order_items ON orders.id = order_items.order_id
GROUP BY users.id, orders.id
ORDER BY orders.order_date DESC;`,
    
    json: `{
  "name": "Sample Project",
  "version": "1.0.0",
  "description": "A sample project configuration",
  "dependencies": {
    "react": "^18.2.0",
    "lodash": "^4.17.21"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}`,
    
    markdown: `# Sample Markdown

## Introduction
This is a sample markdown document.

## Features
- Simple syntax
- Easy to learn
- Converts to HTML

## Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\``,
    
    plain: ''
  };
  
  return examples[syntax] || '';
};

/**
 * Generate a unique title for a new notepad
 * @param {Array} notepads - Existing notepads
 * @returns {string} Unique title
 */
export const generateUniqueTitle = (notepads) => {
  // Extract numbers from existing "Note X" titles
  const existingNumbers = notepads
    .map(notepad => {
      const match = notepad.title.match(/^Note (\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));
  
  // Find the highest number and increment by 1
  const nextNumber = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;
  
  return `Note ${nextNumber}`;
};

/**
 * Get file extension based on syntax
 * @param {string} syntax - Syntax type
 * @returns {string} File extension
 */
export const getFileExtension = (syntax) => {
  const extensions = {
    javascript: 'js',
    html: 'html',
    css: 'css',
    sql: 'sql',
    json: 'json',
    markdown: 'md',
    python: 'py',
    typescript: 'ts',
    java: 'java',
    csharp: 'cs',
    xml: 'xml',
    yaml: 'yaml',
    bash: 'sh',
    plain: 'txt'
  };
  return extensions[syntax] || 'txt';
};

/**
 * Get syntax type from file extension
 * @param {string} extension - File extension (without dot)
 * @returns {string} Syntax type
 */
export const getSyntaxFromExtension = (extension) => {
  const syntaxMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'sql': 'sql',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'ts': 'typescript',
    'tsx': 'typescript',
    'java': 'java',
    'cs': 'csharp',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'bash',
    'txt': 'plain'
  };
  return syntaxMap[extension.toLowerCase()] || 'plain';
};

/**
 * Parse filename to extract title and syntax
 * @param {string} filename - Filename (e.g., "atfmem-My-Note.js")
 * @returns {Object} Object with title and syntax
 */
export const parseFilename = (filename) => {
  // Remove "atfmem-" prefix and extension
  const withoutPrefix = filename.replace(/^atfmem-/, '');
  const lastDotIndex = withoutPrefix.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    // No extension, treat as plain text
    return {
      title: withoutPrefix.replace(/-/g, ' '),
      syntax: 'plain'
    };
  }
  
  const titlePart = withoutPrefix.substring(0, lastDotIndex);
  const extension = withoutPrefix.substring(lastDotIndex + 1);
  
  return {
    title: titlePart.replace(/-/g, ' '),
    syntax: getSyntaxFromExtension(extension)
  };
};

/**
 * Load all atfmem- files from a directory
 * @param {FileSystemDirectoryHandle} directoryHandle - Directory handle
 * @returns {Promise<Array>} Array of notepad objects
 */
export const loadAtfmemFiles = async (directoryHandle) => {
  if (!directoryHandle) {
    return [];
  }

  try {
    const notepads = [];
    const entries = [];
    
    // Read all entries from the directory
    for await (const entry of directoryHandle.values()) {
      entries.push(entry);
    }
    
    // Filter and process files that start with "atfmem-"
    for (const entry of entries) {
      if (entry.kind === 'file' && entry.name.startsWith('atfmem-')) {
        try {
          // Get file handle and read content
          const fileHandle = await directoryHandle.getFileHandle(entry.name);
          const file = await fileHandle.getFile();
          const content = await file.text();
          
          // Parse filename to get title and syntax
          const { title, syntax } = parseFilename(entry.name);
          
          // Create notepad object
          notepads.push({
            id: `loaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: title || entry.name,
            content: content,
            syntax: syntax,
            position: { x: 100, y: 100 },
            size: { width: 350, height: 300 },
            isMinimized: false,
            zIndex: 100,
            spellCheckEnabled: true,
            headerColor: '#4f46e5',
            style: 'simple'
          });
        } catch (error) {
          console.error(`Error loading file ${entry.name}:`, error);
        }
      }
    }
    
    return notepads;
  } catch (error) {
    console.error('Error loading atfmem files:', error);
    return [];
  }
};

/**
 * Generate filename with atfmem prefix
 * @param {Object} notepad - Notepad object
 * @returns {string} Filename
 */
export const generateFilename = (notepad) => {
  const extension = getFileExtension(notepad.syntax);
  const title = notepad.title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  return `atfmem-${title}.${extension}`;
};

/**
 * Export a notepad to a file (download)
 * @param {Object} notepad - Notepad object
 */
export const exportNotepad = (notepad) => {
  const filename = generateFilename(notepad);
  
  // Create and download file
  const element = document.createElement('a');
  const file = new Blob([notepad.content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
  
  return filename;
};

/**
 * Save a notepad to a file using File System Access API or download
 * @param {Object} notepad - Notepad object
 * @param {FileSystemDirectoryHandle} directoryHandle - Optional directory handle
 * @returns {Promise<string>} Filename or error message
 */
export const saveNotepad = async (notepad, directoryHandle = null) => {
  const filename = generateFilename(notepad);
  
  try {
    // If directory handle is provided, use File System Access API
    if (directoryHandle) {
      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(notepad.content);
      await writable.close();
      return filename;
    }
    
    // Fallback to download
    exportNotepad(notepad);
    return filename;
  } catch (error) {
    console.error('Error saving notepad:', error);
    // Fallback to download if File System Access fails
    exportNotepad(notepad);
    return filename;
  }
};

/**
 * Save directory handle to IndexedDB
 * @param {FileSystemDirectoryHandle} handle - Directory handle to save
 * @returns {Promise<boolean>} Success status
 */
export const saveDirectoryHandle = async (handle) => {
  try {
    if (!handle || !('showDirectoryPicker' in window)) {
      return false;
    }

    // Open IndexedDB
    const dbName = 'atf-dev-studio-mems';
    const dbVersion = 1;
    const storeName = 'directoryHandles';

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Store the handle with a key
        const putRequest = store.put({ id: 'selectedFolder', handle: handle });
        
        putRequest.onsuccess = () => {
          console.log('Directory handle saved to IndexedDB');
          resolve(true);
        };
        
        putRequest.onerror = () => {
          console.error('Error saving directory handle:', putRequest.error);
          reject(putRequest.error);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  } catch (error) {
    console.error('Error saving directory handle:', error);
    return false;
  }
};

/**
 * Load directory handle from IndexedDB
 * @returns {Promise<FileSystemDirectoryHandle|null>} Directory handle or null
 */
export const loadDirectoryHandle = async () => {
  try {
    if (!('showDirectoryPicker' in window)) {
      return null;
    }

    const dbName = 'atf-dev-studio-mems';
    const storeName = 'directoryHandles';

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        resolve(null);
      };

      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          resolve(null);
          return;
        }

        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getRequest = store.get('selectedFolder');

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (result && result.handle) {
            // Verify the handle is still valid by checking if we can query it
            result.handle.queryPermission({ mode: 'readwrite' }).then(permission => {
              if (permission === 'granted') {
                console.log('Directory handle restored from IndexedDB');
                resolve(result.handle);
              } else {
                console.log('Directory handle permission not granted, need to re-request');
                resolve(null);
              }
            }).catch(() => {
              resolve(null);
            });
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = () => {
          console.error('Error loading directory handle:', getRequest.error);
          resolve(null);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  } catch (error) {
    console.error('Error loading directory handle:', error);
    return null;
  }
};

/**
 * Trigger a notification/status message
 * @param {Function} setStatusMessage - State setter for status message
 * @param {string} message - Message to display
 * @param {Object} statusTimeoutRef - Ref for tracking the timeout
 */
export const showStatusMessage = (setStatusMessage, message, statusTimeoutRef) => {
  setStatusMessage(message);
  
  if (statusTimeoutRef.current) {
    clearTimeout(statusTimeoutRef.current);
  }
  
  statusTimeoutRef.current = setTimeout(() => {
    setStatusMessage('');
  }, 3000);
};

/**
 * Count words in text
 * @param {string} text - Text to count words in
 * @returns {number} Word count
 */
export const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Count characters in text
 * @param {string} text - Text to count characters in
 * @param {boolean} countSpaces - Whether to count spaces
 * @returns {number} Character count
 */
export const countChars = (text, countSpaces = true) => {
  if (!text) return 0;
  return countSpaces ? text.length : text.replace(/\s+/g, '').length;
};

/**
 * Generate text statistics
 * @param {string} text - Text to analyze
 * @returns {Object} Statistics object
 */
export const getTextStats = (text) => {
  if (!text) {
    return { words: 0, chars: 0, charsNoSpaces: 0, lines: 0 };
  }
  
  const words = countWords(text);
  const chars = countChars(text);
  const charsNoSpaces = countChars(text, false);
  const lines = text.split('\n').length;
  
  return {
    words,
    chars,
    charsNoSpaces,
    lines
  };
};