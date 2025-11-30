/**
 * shared/utils/viewsUtils.js
 * --------------------------
 * Utilities for the Views component (Folder Monitoring)
 */

/**
 * Fetch folder contents from the backend
 * @param {string} folderPath - Path to the folder (e.g., "Documents", "C:\Users\Micks\Documents")
 * @returns {Promise<Object>} Object with path and contents array
 */
export const fetchFolderContents = async (folderPath) => {
  try {
    const response = await fetch('/api/views/folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: folderPath }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch folder contents' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching folder contents:', error);
    throw error;
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "1.5 KB", "2.3 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format date for display
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15, 2024 3:45 PM")
 */
export const formatDate = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return isoString;
  }
};

/**
 * Get file icon based on extension or type
 * @param {string} extension - File extension (without dot)
 * @param {boolean} isDirectory - Whether it's a directory
 * @returns {string} Icon emoji or symbol
 */
export const getFileIcon = (extension, isDirectory) => {
  if (isDirectory) return '📁';
  
  const iconMap = {
    'js': '📜',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'html': '🌐',
    'css': '🎨',
    'json': '📋',
    'xml': '📄',
    'yaml': '⚙️',
    'yml': '⚙️',
    'md': '📝',
    'txt': '📄',
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'xls': '📊',
    'xlsx': '📊',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'zip': '📦',
    'rar': '📦',
    'exe': '⚙️',
    'py': '🐍',
    'java': '☕',
    'cpp': '⚙️',
    'c': '⚙️',
  };
  
  return iconMap[extension?.toLowerCase()] || '📄';
};

/**
 * Show status message
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



