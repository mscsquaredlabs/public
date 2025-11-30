// apiUtils-helpers.js
// Utility functions for API Tester component

/**
 * Process environment variables in a string
 * @param {string} inputString - String that may contain environment variables like {{variable}}
 * @param {Object} environment - Object containing environment variables
 * @returns {string} - String with environment variables replaced with their values
 */
export const processEnvironmentVariables = (inputString, environment) => {
  if (!inputString || !environment) return inputString;
  
  // Use regex to find all {{variable}} patterns
  const variableRegex = /\{\{([^}]+)\}\}/g;
  
  return inputString.replace(variableRegex, (match, variableName) => {
    const variableValue = environment[variableName.trim()];
    
    // If variable not found, keep the original pattern
    if (variableValue === undefined) {
      console.warn(`Environment variable "${variableName}" not found`);
      return match;
    }
    
    return variableValue;
  });
};

/**
 * Process environment variables in a JSON object or string
 * @param {Object|string} input - JSON object or string that may contain environment variables
 * @param {Object} environment - Object containing environment variables
 * @returns {Object|string} - Input with environment variables replaced
 */
export const processJsonEnvironmentVariables = (input, environment) => {
  if (!input || !environment) return input;
  
  // If input is a string, try to parse it as JSON
  let jsonObject;
  let isString = false;
  
  if (typeof input === 'string') {
    isString = true;
    try {
      jsonObject = JSON.parse(input);
    } catch (e) {
      // If it's not valid JSON, process it as a regular string
      return processEnvironmentVariables(input, environment);
    }
  } else {
    jsonObject = input;
  }
  
  // Process the JSON object
  const processObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    }
    
    // Handle objects
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        // Process object keys that might contain variables
        const processedKey = processEnvironmentVariables(key, environment);
        
        // Process value based on its type
        if (typeof value === 'string') {
          result[processedKey] = processEnvironmentVariables(value, environment);
        } else if (value && typeof value === 'object') {
          result[processedKey] = processObject(value);
        } else {
          result[processedKey] = value;
        }
      }
    }
    
    return result;
  };
  
  const processedJson = processObject(jsonObject);
  
  // Return as string if input was a string
  return isString ? JSON.stringify(processedJson, null, 2) : processedJson;
};

/**
 * Process environment variables in request URL, headers, and body
 * @param {Object} request - Request configuration object
 * @param {Object} environment - Object containing environment variables
 * @returns {Object} - Request with environment variables replaced
 */
export const processRequestWithEnvironment = (request, environment) => {
  if (!request || !environment) return request;
  
  const { url, method, headers, body, bodyFormat } = request;
  
  // Process URL
  const processedUrl = processEnvironmentVariables(url, environment);
  
  // Process headers
  let processedHeaders = headers;
  try {
    // If headers is a string, try to parse it as JSON
    if (typeof headers === 'string') {
      processedHeaders = processJsonEnvironmentVariables(headers, environment);
    }
  } catch (e) {
    console.error('Error processing headers with environment variables:', e);
  }
  
  // Process body
  let processedBody = body;
  try {
    if (body && bodyFormat === 'json') {
      processedBody = processJsonEnvironmentVariables(body, environment);
    } else if (body) {
      processedBody = processEnvironmentVariables(body, environment);
    }
  } catch (e) {
    console.error('Error processing body with environment variables:', e);
  }
  
  return {
    ...request,
    url: processedUrl,
    headers: processedHeaders,
    body: processedBody
  };
};

/**
 * Build authentication headers based on authentication settings
 * @param {string} authType - Authentication type (basic, bearer, apiKey)
 * @param {Object} authDetails - Authentication details
 * @returns {Object} - Authentication headers
 */
export const buildAuthHeaders = (authType, authDetails) => {
  const headers = {};
  
  if (!authType || authType === 'none') return headers;
  
  switch (authType) {
    case 'basic':
      if (authDetails.username) {
        const credentials = btoa(`${authDetails.username}:${authDetails.password || ''}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;
    
    case 'bearer':
      if (authDetails.token) {
        headers['Authorization'] = `Bearer ${authDetails.token}`;
      }
      break;
    
    case 'apiKey':
      if (authDetails.apiKey && authDetails.apiKeyName) {
        headers[authDetails.apiKeyName] = authDetails.apiKey;
      }
      break;
    
    // Add support for other auth types here in the future
  }
  
  return headers;
};

/**
 * Parse headers from string, object, or form data
 * @param {string|Object} headersInput - Headers as string, object, or FormData
 * @param {string} authType - Authentication type
 * @param {Object} authDetails - Authentication details
 * @returns {Object} - Parsed headers object
 */
export const parseHeaders = (headersInput, authType, authDetails) => {
  let headers = {};
  
  // Parse headers from string or object
  if (typeof headersInput === 'string') {
    try {
      headers = JSON.parse(headersInput);
    } catch (e) {
      console.error('Invalid header format:', e);
      // Try to parse headers line by line (key: value format)
      headersInput.split('\n').forEach(line => {
        const [key, value] = line.split(':').map(item => item.trim());
        if (key && value) {
          headers[key] = value;
        }
      });
    }
  } else if (typeof headersInput === 'object' && headersInput !== null) {
    headers = { ...headersInput };
  }
  
  // Add authentication headers
  const authHeaders = buildAuthHeaders(authType, authDetails);
  
  return { ...headers, ...authHeaders };
};

/**
 * Create a cURL command from request configuration
 * @param {string} url - Request URL
 * @param {string} method - HTTP method
 * @param {Object} headers - Request headers
 * @param {string} body - Request body
 * @param {string} bodyFormat - Body format (json, form, text)
 * @returns {string} - cURL command
 */
export const createCurlCommand = (url, method, headers, body, bodyFormat) => {
  if (!url) return '';
  
  let curl = `curl -X ${method} "${url}"`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value.replace(/"/g, '\\"')}"`;
  });
  
  // Add body
  if (body && method !== 'GET' && method !== 'HEAD') {
    if (bodyFormat === 'json') {
      try {
        // Format as JSON
        const jsonBody = typeof body === 'string' ? JSON.parse(body) : body;
        curl += ` \\\n  -d '${JSON.stringify(jsonBody)}'`;
      } catch (e) {
        // If parsing fails, add body as-is
        curl += ` \\\n  -d '${body.replace(/'/g, "\\'")}'`;
      }
    } else {
      curl += ` \\\n  -d '${body.replace(/'/g, "\\'")}'`;
    }
  }
  
  return curl;
};

/**
 * Compare two API responses for visual diff
 * @param {Object} response1 - First response object
 * @param {Object} response2 - Second response object
 * @returns {Object} - Comparison result with highlighted differences
 */
export const compareResponses = (response1, response2) => {
  if (!response1 || !response2) {
    return { error: 'Two valid responses are required for comparison' };
  }
  
  const comparison = {
    statusComparison: {
      different: response1.status !== response2.status,
      response1: response1.status,
      response2: response2.status
    },
    headersComparison: compareHeaders(response1.headers, response2.headers),
    bodyComparison: compareResponseBodies(response1.body, response2.body)
  };
  
  return comparison;
};

/**
 * Compare headers between two responses
 * @param {Object} headers1 - Headers from first response
 * @param {Object} headers2 - Headers from second response
 * @returns {Object} - Header comparison results
 */
const compareHeaders = (headers1, headers2) => {
  const allHeaderKeys = new Set([
    ...Object.keys(headers1 || {}),
    ...Object.keys(headers2 || {})
  ]);
  
  const comparison = {
    different: false,
    headers: []
  };
  
  allHeaderKeys.forEach(key => {
    const value1 = headers1?.[key];
    const value2 = headers2?.[key];
    const isDifferent = value1 !== value2;
    
    if (isDifferent) {
      comparison.different = true;
    }
    
    comparison.headers.push({
      key,
      response1Value: value1,
      response2Value: value2,
      different: isDifferent
    });
  });
  
  return comparison;
};

/**
 * Compare response bodies
 * @param {any} body1 - Body from first response
 * @param {any} body2 - Body from second response
 * @returns {Object} - Body comparison results
 */
const compareResponseBodies = (body1, body2) => {
  // Try to normalize bodies to JSON if possible
  const normalizedBody1 = normalizeResponseBody(body1);
  const normalizedBody2 = normalizeResponseBody(body2);
  
  // Check if bodies are equal in their normalized form
  const areDifferent = JSON.stringify(normalizedBody1) !== JSON.stringify(normalizedBody2);
  
  return {
    different: areDifferent,
    response1: normalizedBody1,
    response2: normalizedBody2
  };
};

/**
 * Normalize response body for comparison
 * @param {any} body - Response body
 * @returns {any} - Normalized body
 */
const normalizeResponseBody = (body) => {
  // If body is already a string, try to parse it as JSON
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (e) {
      // Not JSON, return as is
      return body;
    }
  }
  
  // If body is an object, return it as is
  if (body && typeof body === 'object') {
    return body;
  }
  
  // Default case
  return body;
};

/**
 * Format API response for display with improved dark mode support
 * @param {Object} response - API response object
 * @returns {string} - Formatted HTML string for display
 */
export const formatResponse = (response) => {
  if (!response) return '';
  
  const { status, statusText, headers, body, responseTime } = response;
  
  // Determine status class for styling
  const statusClass = status >= 200 && status < 300 
    ? 'status-2xx' 
    : status >= 300 && status < 400 
      ? 'status-3xx' 
      : status >= 400 && status < 500 
        ? 'status-4xx' 
        : 'status-5xx';
  
  // Format the response headers with better structure
  let headersHtml = '';
  if (headers && Object.keys(headers).length > 0) {
    headersHtml = Object.entries(headers)
      .map(([key, value]) => `
        <div class="header-row">
          <span class="header-key">${escapeHtml(key)}:</span>
          <span class="header-value">${escapeHtml(String(value))}</span>
        </div>
      `).join('');
  } else {
    headersHtml = '<div class="no-content">No headers received</div>';
  }
  
  // Format the response body with improved JSON handling
  let bodyHtml = '';
  if (body !== undefined && body !== null) {
    if (typeof body === 'object') {
      try {
        // Pretty-print JSON objects with syntax highlighting
        const jsonString = JSON.stringify(body, null, 2);
        bodyHtml = `<pre class="json-content">${syntaxHighlightJson(jsonString)}</pre>`;
      } catch (e) {
        bodyHtml = `<pre class="text-content">${escapeHtml(String(body))}</pre>`;
      }
    } else if (typeof body === 'string') {
      // Try to parse as JSON for syntax highlighting
      try {
        const jsonBody = JSON.parse(body);
        const jsonString = JSON.stringify(jsonBody, null, 2);
        bodyHtml = `<pre class="json-content">${syntaxHighlightJson(jsonString)}</pre>`;
      } catch (e) {
        // Not JSON, display as plain text with proper formatting
        bodyHtml = `<pre class="text-content">${escapeHtml(String(body))}</pre>`;
      }
    } else {
      bodyHtml = `<pre class="text-content">${escapeHtml(String(body))}</pre>`;
    }
  } else {
    bodyHtml = '<div class="no-content">No response body</div>';
  }
  
  // Format and return the complete response with improved structure
  return `
    <div class="api-response-container">
      <div class="response-status-section">
        <div class="status-info">
          <span class="status-badge ${statusClass}">${status}</span>
          <span class="status-text">${statusText || ''}</span>
        </div>
        ${responseTime ? `<div class="timing-info">
          <span class="response-time-label">Response time:</span>
          <span class="response-time-value">${responseTime}ms</span>
        </div>` : ''}
      </div>
      
      <div class="response-section">
        <div class="section-header">
          <h3 class="section-title">Headers</h3>
          <div class="section-count">${headers ? Object.keys(headers).length : 0} headers</div>
        </div>
        <div class="headers-content">
          ${headersHtml}
        </div>
      </div>
      
      <div class="response-section">
        <div class="section-header">
          <h3 class="section-title">Response Body</h3>
          <div class="section-info">
            ${typeof body === 'object' ? 'JSON' : typeof body === 'string' ? 'Text' : typeof body}
            ${body && typeof body === 'string' ? ` • ${body.length} characters` : ''}
            ${body && typeof body === 'object' ? ` • ${JSON.stringify(body).length} characters` : ''}
          </div>
        </div>
        <div class="body-content">
          ${bodyHtml}
        </div>
      </div>
    </div>
  `;
};

/**
 * Enhanced syntax highlight JSON for display with better color coding
 * @param {string} json - JSON string
 * @returns {string} - HTML with syntax highlighting
 */
const syntaxHighlightJson = (json) => {
  if (!json) return '';
  
  // Replace potentially dangerous characters
  json = escapeHtml(json);
  
  // Enhanced syntax highlighting with more precise regex
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
    (match) => {
      let className = 'json-number';
      
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          // JSON key
          className = 'json-key';
        } else {
          // JSON string value
          className = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        className = 'json-boolean';
      } else if (/null/.test(match)) {
        className = 'json-null';
      }
      
      return `<span class="${className}">${match}</span>`;
    }
  );
};


/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export const escapeHtml = (str = '') =>
  str.replace(/&/g,'&amp;')
     .replace(/</g,'&lt;')
     .replace(/>/g,'&gt;')
     .replace(/"/g,'&quot;')
     .replace(/'/g,'&#039;');