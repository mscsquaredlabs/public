// src/shared/services/terminalService.js
// Fixed with throttling, caching and proper error handling

// Simple request throttling implementation
const RequestThrottler = {
  lastRequest: 0,
  minInterval: 1000, // Minimum 1 second between requests
  
  canMakeRequest() {
    const now = Date.now();
    return now - this.lastRequest >= this.minInterval;
  },
  
  trackRequest() {
    this.lastRequest = Date.now();
  }
};

// Cache for test connection results
const ConnectionCache = {
  cachedResult: null,
  cachedTime: 0,
  cacheTTL: 5000, // 5 seconds
  
  getCachedResult() {
    if (!this.cachedResult) return null;
    
    const now = Date.now();
    if (now - this.cachedTime > this.cacheTTL) {
      this.cachedResult = null;
      return null;
    }
    
    return this.cachedResult;
  },
  
  setCachedResult(result) {
    this.cachedResult = result;
    this.cachedTime = Date.now();
  }
};

/**
 * Client-side service for terminal command execution via the API
 */
// Check terminalService.js to ensure executeCommand is properly implemented

const executeCommand = async (command, currentDirectory) => {
  try {
    console.log(`Client sending command: "${command}" in directory: "${currentDirectory}"`);
    
    const startTime = performance.now();
    
    const response = await fetch('/api/terminal/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Request-Time': Date.now().toString()
      },
      body: JSON.stringify({
        command,
        cwd: currentDirectory
      }),
      cache: 'no-store'
    });
    
    const endTime = performance.now();
    console.log(`API response received in ${Math.round(endTime - startTime)}ms with status:`, response.status);
    
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('Command response data:', data);
    
    return data;
  } catch (error) {
    console.error('Terminal service error:', error);
    return {
      output: `Error: ${error.message}`,
      newDirectory: currentDirectory,
      success: false
    };
  }
};

/**
 * Test the connection to the terminal API with throttling and caching
 */
const testConnection = async (forceRefresh = false) => {
  try {
    console.log('Testing API connection...');
    
    // Return cached result if available and fresh
    if (!forceRefresh) {
      const cachedResult = ConnectionCache.getCachedResult();
      if (cachedResult) {
        console.log('Returning cached API test result');
        return cachedResult;
      }
    }
    
    // Throttle requests to prevent flooding
    if (!RequestThrottler.canMakeRequest() && !forceRefresh) {
      console.log('Request throttled, returning busy status');
      return { 
        message: 'API test throttled',
        inProgress: true,
        timestamp: new Date().toISOString()
      };
    }
    
    // Track this request
    RequestThrottler.trackRequest();
    
    // Generate a unique request identifier
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('/api/terminal/test', {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Request-Id': requestId,
        'X-Client-Time': Date.now().toString()
      },
      // Ensure fresh request
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    console.log('API test response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    
    // Parse response as JSON directly
    const data = await response.json();
    console.log('API test response data:', data);
    
    // Cache the successful result
    ConnectionCache.setCachedResult(data);
    
    return data;
  } catch (error) {
    console.error('API connection test failed:', error);
    
    // Format the error with detailed information
    const errorResult = { 
      error: error.message,
      timestamp: new Date().toISOString(),
      errorType: error.name,
      isNetworkError: error.message.includes('NetworkError') || 
                    error.message.includes('Failed to fetch') ||
                    error.message.includes('Network request failed')
    };
    
    // Cache the error result too to prevent repeated failures
    ConnectionCache.setCachedResult(errorResult);
    
    return errorResult;
  }
};

export default {
  executeCommand,
  testConnection
};