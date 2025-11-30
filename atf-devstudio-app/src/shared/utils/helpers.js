/**
 * shared/utils/helpers.js
 * --------------------------
 * Common utility functions shared across components
 */

/**
 * Delay execution for a specified time
 * @param {number} ms - Time to delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Promise resolving to true if successful, false otherwise
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Format a file size for display
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size with unit
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = '') => {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (!(d instanceof Date) || isNaN(d)) {
    return 'Invalid Date';
  }
  
  // Simple formatting function - for more complex formats, consider a library like date-fns
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Parse URL and extract components
 * @param {string} url - URL to parse
 * @returns {Object} Parsed URL components
 */
export const parseUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    
    // Extract query parameters into an object
    const queryParams = {};
    parsedUrl.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    return {
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80'),
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash,
      queryParams
    };
  } catch (err) {
    console.error('Invalid URL:', err);
    return null;
  }
};

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty, false otherwise
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Get file extension from filename or path
 * @param {string} filename - Filename or path
 * @returns {string} File extension without dot
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * Base64 encode a string
 * @param {string} str - String to encode
 * @returns {string} Base64 encoded string
 */
export const base64Encode = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

/**
 * Base64 decode a string
 * @param {string} str - Base64 encoded string
 * @returns {string} Decoded string
 */
export const base64Decode = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    console.error('Invalid Base64 string:', e);
    return '';
  }
};

/**
 * Format duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (ms) => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${minutes}m ${seconds}s`;
  }
};

/**
 * Extract hostname from URL
 * @param {string} url - URL to extract hostname from
 * @returns {string} Hostname
 */
export const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
};