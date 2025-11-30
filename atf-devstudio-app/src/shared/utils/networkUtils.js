/**
   * shared/utils/networkUtils.js
   * --------------------------
   * Utilities for network operations and formatting
   */
  
  /**
   * Escape HTML for safe display
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  export const escapeHtml = (str = '') =>
    str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  
  /**
   * Format a timestamp for display in history or logs
   * @param {Date|string} timestamp - The timestamp to format
   * @returns {string} Formatted timestamp string
   */
  export const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, just show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    // Otherwise show date and time
    return date.toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  /**
   * Calculate and format the size of response data
   * @param {Object|string} body - Response body
   * @param {Object} headers - Response headers
   * @returns {string} Formatted size string
   */
  export const calculateResponseSize = (body, headers = {}) => {
    let size = 0;
    
    // Add headers size
    for (const [key, value] of Object.entries(headers)) {
      size += key.length + String(value).length + 4; // 4 bytes for ': ' and '\r\n'
    }
    
    // Add body size
    if (typeof body === 'string') {
      size += body.length;
    } else if (body) {
      size += JSON.stringify(body).length;
    }
    
    // Format size
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  /**
   * Parse headers from a string format
   * @param {string} headersString - Headers in key: value format
   * @returns {Object} Headers as an object
   */
  export const parseHeadersString = (headersString) => {
    const headers = {};
    
    if (!headersString || !headersString.trim()) {
      return headers;
    }
    
    headersString.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        const value = valueParts.join(':').trim(); // Handle values that might contain colons
        if (value) {
          headers[key.trim()] = value;
        }
      }
    });
    
    return headers;
  };
  
  /**
   * Check if a request is valid before sending
   * @param {string} url - Request URL
   * @param {string} method - HTTP method
   * @param {string} headersString - Headers as a string (not JSON)
   * @returns {Object} Result with valid flag and error message if invalid
   */
  export const validateNetworkRequest = (url, method, headersString) => {
    // Check URL
    if (!url || !url.trim()) {
      return { valid: false, message: 'URL cannot be empty' };
    }
  
    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return { valid: false, message: 'Invalid URL format' };
    }
  
    // Check method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(method)) {
      return { valid: false, message: `Invalid HTTP method: ${method}` };
    }
  
    // Check headers if provided
    if (headersString && headersString.trim()) {
      try {
        // Simple validation for header format (key: value pairs)
        const lines = headersString.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
              return { valid: false, message: `Invalid header format: "${line.trim()}" - missing colon` };
            }
            
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            if (!key) {
              return { valid: false, message: `Invalid header format: "${line.trim()}" - missing header name` };
            }
          }
        }
      } catch (e) {
        return { valid: false, message: `Invalid header format: ${e.message}` };
      }
    }
  
    return { valid: true, message: 'Request is valid' };
  };
  
  /**
   * Format a network response for display
   * @param {Object} responseData - The network response data
   * @param {boolean} showRaw - Whether to show raw response
   * @returns {string} HTML formatted response
   */
  export const formatNetworkResponse = (responseData, showRaw = false) => {
    if (!responseData) return '';
    
    const statusClass = responseData.status < 300 ? 'success' : 
                       (responseData.status < 400 ? 'warning' : 'error');
    
    // Create the display content based on the response
    let displayContent;
    
    if (showRaw) {
      // Show raw response data
      displayContent = `<pre class="raw-response">${
        typeof responseData.body === 'string' 
          ? escapeHtml(responseData.body) 
          : escapeHtml(JSON.stringify(responseData.body, null, 2))
      }</pre>`;
    } else {
      // Show formatted response with headers and body
      let bodyContent;
      
      if (responseData.contentType && responseData.contentType.includes('application/json')) {
        // Format JSON response
        try {
          const jsonBody = typeof responseData.body === 'string' 
            ? JSON.parse(responseData.body) 
            : responseData.body;
            
          bodyContent = `<pre class="json-response">${escapeHtml(JSON.stringify(jsonBody, null, 2))}</pre>`;
        } catch (e) {
          bodyContent = `<pre class="response-body">${escapeHtml(String(responseData.body))}</pre>`;
        }
      } else if (
        responseData.contentType && (
        responseData.contentType.includes('text/html') || 
        responseData.contentType.includes('application/xml'))
      ) {
        // Format HTML/XML with syntax highlighting
        bodyContent = `<pre class="html-response">${escapeHtml(String(responseData.body))}</pre>`;
      } else {
        // Default text response
        bodyContent = `<pre class="response-body">${escapeHtml(String(responseData.body))}</pre>`;
      }
      
      displayContent = `
        <div class="response-info">
          <div class="response-status ${statusClass}">
            Status: ${responseData.status} ${responseData.statusText}
          </div>
          <div class="response-meta">
            <span>Time: ${responseData.time}ms</span>
            <span>Size: ${responseData.size || calculateResponseSize(responseData.body, responseData.headers)}</span>
          </div>
        </div>
        
        <div class="response-tabs">
          <button class="response-tab active" data-tab="body">Body</button>
          <button class="response-tab" data-tab="headers">Headers</button>
        </div>
        
        <div class="response-content body-tab active">
          ${bodyContent}
        </div>
        
        <div class="response-content headers-tab">
          <table class="headers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(responseData.headers || {}).map(([key, value]) => `
                <tr>
                  <td>${escapeHtml(key)}</td>
                  <td>${escapeHtml(String(value))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
    
    return displayContent;
  };

  
  /**
   * Create a sample response object (for testing or demo purposes)
   * @param {string} url - The request URL
   * @param {string} method - The HTTP method
   * @returns {Object} Sample response data
   */
  export const createSampleResponse = (url, method) => {
    // Create a timestamp for this request
    const timestamp = new Date();
    const startTime = performance.now();
    
    // Simulate a network delay (for realism)
    const delay = Math.floor(Math.random() * 200) + 50; // 50-250ms
    
    // Sample response for demo purposes
    return {
      url,
      method,
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=86400',
        'x-powered-by': 'ATF Dev Studio',
        'x-request-id': `req-${Math.random().toString(36).substring(2, 8)}`
      },
      body: {
        success: true,
        message: 'Sample response (simulated)',
        data: {
          id: Math.floor(Math.random() * 1000),
          timestamp: timestamp.toISOString(),
          method,
          url
        }
      },
      contentType: 'application/json',
      time: delay,
      size: '0.75 KB',
      timestamp
    };
  };