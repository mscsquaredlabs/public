// responseHistoryManager.js
// Manages the history of API responses for each saved request

/**
 * Manages response history for API requests
 */
export class ResponseHistoryManager {
    constructor(maxHistoryPerRequest = 10) {
      // Map of requestId => array of response objects
      this.responseHistory = {};
      
      // Maximum number of historical responses to keep per request
      this.maxHistoryPerRequest = maxHistoryPerRequest;
    }
    
    /**
     * Add a response to the history for a request
     * @param {string} requestId - ID of the request
     * @param {Object} response - Response object to add to history
     * @returns {boolean} - Success status
     */
    addResponse(requestId, response) {
      if (!requestId || !response) {
        return false;
      }
      
      // Initialize history array for this request if needed
      if (!this.responseHistory[requestId]) {
        this.responseHistory[requestId] = [];
      }
      
      // Add timestamp and unique ID to the response
      const enhancedResponse = {
        ...response,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      // Add to the beginning of the array (newest first)
      this.responseHistory[requestId].unshift(enhancedResponse);
      
      // Trim history if it exceeds maximum size
      if (this.responseHistory[requestId].length > this.maxHistoryPerRequest) {
        this.responseHistory[requestId] = this.responseHistory[requestId].slice(0, this.maxHistoryPerRequest);
      }
      
      return true;
    }
    
    /**
     * Get response history for a request
     * @param {string} requestId - ID of the request
     * @returns {Array} - Array of response objects (newest first)
     */
    getResponseHistory(requestId) {
      if (!requestId || !this.responseHistory[requestId]) {
        return [];
      }
      
      return [...this.responseHistory[requestId]];
    }
    
    /**
     * Get a specific response from history
     * @param {string} requestId - ID of the request
     * @param {string} responseId - ID of the response
     * @returns {Object|null} - Response object or null if not found
     */
    getResponse(requestId, responseId) {
      if (!requestId || !responseId || !this.responseHistory[requestId]) {
        return null;
      }
      
      return this.responseHistory[requestId].find(r => r.id === responseId) || null;
    }
    
    /**
     * Delete a specific response from history
     * @param {string} requestId - ID of the request
     * @param {string} responseId - ID of the response
     * @returns {boolean} - Success status
     */
    deleteResponse(requestId, responseId) {
      if (!requestId || !responseId || !this.responseHistory[requestId]) {
        return false;
      }
      
      const initialLength = this.responseHistory[requestId].length;
      this.responseHistory[requestId] = this.responseHistory[requestId].filter(r => r.id !== responseId);
      
      return this.responseHistory[requestId].length < initialLength;
    }
    
    /**
     * Clear all response history for a request
     * @param {string} requestId - ID of the request
     * @returns {boolean} - Success status
     */
    clearResponseHistory(requestId) {
      if (!requestId || !this.responseHistory[requestId]) {
        return false;
      }
      
      delete this.responseHistory[requestId];
      return true;
    }
    
    /**
     * Clear all response history
     * @returns {boolean} - Success status
     */
    clearAllHistory() {
      this.responseHistory = {};
      return true;
    }
    
    /**
     * Set maximum history size per request
     * @param {number} maxSize - Maximum number of responses to keep
     * @returns {boolean} - Success status
     */
    setMaxHistorySize(maxSize) {
      if (!Number.isInteger(maxSize) || maxSize < 1) {
        return false;
      }
      
      this.maxHistoryPerRequest = maxSize;
      
      // Trim existing histories to fit new max size
      Object.keys(this.responseHistory).forEach(requestId => {
        if (this.responseHistory[requestId].length > maxSize) {
          this.responseHistory[requestId] = this.responseHistory[requestId].slice(0, maxSize);
        }
      });
      
      return true;
    }
    
    /**
     * Get summary data for all responses in a request's history
     * @param {string} requestId - ID of the request
     * @returns {Array} - Array of response summary objects
     */
    getResponseSummaries(requestId) {
      if (!requestId || !this.responseHistory[requestId]) {
        return [];
      }
      
      return this.responseHistory[requestId].map(response => ({
        id: response.id,
        timestamp: response.timestamp,
        status: response.status,
        statusText: response.statusText,
        responseTime: response.responseTime
      }));
    }
    
    /**
     * Save response history to local storage
     * @param {string} storageKey - Key to use for localStorage
     * @returns {boolean} - Success status
     */
    saveToLocalStorage(storageKey = 'api-tester-response-history') {
      try {
        const data = {
          responseHistory: this.responseHistory,
          maxHistoryPerRequest: this.maxHistoryPerRequest
        };
        
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Failed to save response history to local storage:', e);
        return false;
      }
    }
    
    /**
     * Load response history from local storage
     * @param {string} storageKey - Key to use for localStorage
     * @returns {boolean} - Success status
     */
    loadFromLocalStorage(storageKey = 'api-tester-response-history') {
      try {
        const stored = localStorage.getItem(storageKey);
        
        if (!stored) {
          return false;
        }
        
        const data = JSON.parse(stored);
        
        if (data.responseHistory) {
          this.responseHistory = data.responseHistory;
          
          if (data.maxHistoryPerRequest) {
            this.maxHistoryPerRequest = data.maxHistoryPerRequest;
          }
          
          return true;
        }
        
        return false;
      } catch (e) {
        console.error('Failed to load response history from local storage:', e);
        return false;
      }
    }
  }
  
  // Create a default response history manager
  export const createDefaultResponseHistoryManager = () => {
    return new ResponseHistoryManager(10);
  };
  
  export default ResponseHistoryManager;