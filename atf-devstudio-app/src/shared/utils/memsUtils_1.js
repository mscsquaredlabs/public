/**
 * Simple utility functions for Mems component
 */

// Save notepads to localStorage
export const saveNotepadsToStorage = (notepads, storageKey) => {
  localStorage.setItem(storageKey, JSON.stringify(notepads));
};

// Load notepads from localStorage
export const loadNotepadsFromStorage = (storageKey) => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Error loading notepads:', err);
    return [];
  }
};

// Generate unique title for a new notepad
export const generateUniqueTitle = (notepads) => {
  const existingNumbers = notepads
    .map(notepad => {
      const match = notepad.title.match(/^Note (\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));
  
  const nextNumber = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;
  
  return `Note ${nextNumber}`;
};

// Show status message with auto-timeout
export const showStatusMessage = (setStatusMessage, message, statusTimeoutRef) => {
  setStatusMessage(message);
  
  if (statusTimeoutRef.current) {
    clearTimeout(statusTimeoutRef.current);
  }
  
  statusTimeoutRef.current = setTimeout(() => {
    setStatusMessage('');
  }, 3000);
};

// Calculate text statistics
export const getTextStats = (text = '') => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const lines = text.split('\n').length;
  
  return { words, chars, lines };
};

// Simple export to file
export const exportNotepad = (notepad) => {
  const extension = notepad.syntax === 'plain' ? 'txt' : notepad.syntax;
  const filename = `${notepad.title.replace(/\s+/g, '_')}.${extension}`;
  
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