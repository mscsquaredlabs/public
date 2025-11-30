/**
 * shared/utils/networkRequestUtils.js
 * -----------------------------------
 * Utilities for making network requests with proper error handling
 */

import { calculateResponseSize } from './networkUtils';

/**
 * Make a network request with proper error handling
 * @param {string} url - The URL to request
 * @param {Object} options - Request options including method, headers, body
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @returns {Promise<Object>} Response data with standardized format
 */
export const makeNetworkRequest = async (url, options, signal) => {
  const startTime = performance.now();
  
  try {
    // Add the abort signal to options
    options.signal = signal;
    
    // Make the fetch request
    const response = await fetch(url, options);
    
    // Calculate request time
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Extract response headers
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    // Get the content type
    const contentType = response.headers.get('content-type') || '';
    
    // Get response body based on content type
    let responseBody;
    try {
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else if (
        contentType.includes('text/') ||
        contentType.includes('application/xml') ||
        contentType.includes('application/javascript')
      ) {
        responseBody = await response.text();
      } else {
        // For other content types (binary data), just indicate the type
        responseBody = `[Binary data - ${contentType}]`;
        if (contentType.includes('image/')) {
          responseBody = `[Image data - ${contentType}]`;
        }
      }
    } catch (error) {
      // Fallback to text if parsing fails
      responseBody = await response.text();
    }
    
    // Calculate response size
    const size = calculateResponseSize(responseBody, responseHeaders);
    
    // Create standard response object
    return {
      url,
      method: options.method,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      contentType,
      time: duration,
      size,
      timestamp: new Date(),
      error: response.ok ? null : `HTTP Error: ${response.status} ${response.statusText}`
    };
  } catch (error) {
    // Handle network errors
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Return error response in the same format
    return {
      url,
      method: options.method,
      status: 0,
      statusText: 'Network Error',
      headers: {},
      body: null,
      contentType: 'text/plain',
      time: duration,
      size: '0 B',
      timestamp: new Date(),
      error: error.name === 'AbortError' 
        ? 'Request was cancelled'
        : `Network Error: ${error.message}`
    };
  }
};

/**
 * Create a proxy URL to bypass CORS issues
 * @param {string} url - Original URL to proxy
 * @returns {string} Proxied URL
 */
export const createProxyUrl = (url) => {
  // Option 1: Use a service like CORS Anywhere (not recommended for production)
  // return `https://cors-anywhere.herokuapp.com/${url}`;
  
  // Option 2: Simulate a proxy by returning the original URL (works in our simulation)
  // In a real app, you would have a server-side proxy endpoint
  
  // For the dev studio environment, we'll return the URL as-is and handle CORS in the component
  return url;
};