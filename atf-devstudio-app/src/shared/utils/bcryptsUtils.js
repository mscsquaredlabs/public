/**
 * shared/utils/bcryptsUtils.js
 * --------------------------
 * Utilities for the BCrypts component
 */

/**
 * Generate BCrypt hash from text
 * @param {string} text - Text to hash
 * @param {number} rounds - Number of rounds (default: 10)
 * @returns {Promise<string>} BCrypt hash
 */
export const generateBCryptHash = async (text, rounds = 10) => {
  try {
    const response = await fetch('/api/bcrypt/hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, rounds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate BCrypt hash' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.hash;
  } catch (error) {
    console.error('Error generating BCrypt hash:', error);
    throw error;
  }
};

/**
 * Verify text against BCrypt hash
 * @param {string} text - Text to verify
 * @param {string} hash - BCrypt hash to verify against
 * @returns {Promise<boolean>} True if text matches hash
 */
export const verifyBCryptHash = async (text, hash) => {
  try {
    const response = await fetch('/api/bcrypt/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, hash }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to verify BCrypt hash' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.match;
  } catch (error) {
    console.error('Error verifying BCrypt hash:', error);
    throw error;
  }
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



