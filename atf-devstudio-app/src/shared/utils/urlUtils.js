/**
 * shared/utils/urlUtils.js
 * --------------------------
 * Utilities for URL parsing, validation, and formatting
 */

/**
 * Parse a URL into its components
 * @param {string} url - URL to parse
 * @param {Object} options - Parsing options
 * @returns {Object|null} Parsed URL object or null if invalid
 */
export const parseUrl = (url, options = {}) => {
    if (!url || !url.trim()) return null;
  
    const {
      decodeComponents = true,
      autoAddProtocol = true
    } = options;
  
    try {
      // Add protocol if missing to avoid URL constructor errors
      let urlToParse = url.trim();
      if (autoAddProtocol && !/^[a-zA-Z]+:\/\//.test(urlToParse)) {
        urlToParse = 'http://' + urlToParse;
      }
  
      const urlObj = new URL(urlToParse);
      
      // Parse URL components
      const protocol = urlObj.protocol;
      const host = urlObj.hostname;
      // Only include port if it's explicitly specified in the URL
      // Don't add default ports (80 for http, 443 for https) as they're implicit
      const port = urlObj.port || '';
      const path = urlObj.pathname;
      const search = urlObj.search;
      
      // Parse query parameters
      const queryParams = [];
      for (const [key, value] of urlObj.searchParams.entries()) {
        queryParams.push({
          key: decodeComponents ? decodeURIComponent(key) : key,
          value: decodeComponents ? decodeURIComponent(value) : value
        });
      }
      
      // Parse hash (fragment)
      const hash = urlObj.hash;
      
      // Create parsed URL object
      return {
        url: urlToParse,
        protocol,
        host,
        port,
        path,
        search,
        queryParams,
        hash,
        original: url // Keep the original URL
      };
    } catch (error) {
      return null;
    }
  };
  
  /**
   * Validate if a string is a valid URL
   * @param {string} url - URL to validate
   * @param {boolean} requireProtocol - Whether to require protocol
   * @returns {boolean} Whether the URL is valid
   */
  export const isValidUrl = (url, requireProtocol = false) => {
    if (!url || !url.trim()) return false;
    
    try {
      let urlToCheck = url.trim();
      if (!requireProtocol && !/^[a-zA-Z]+:\/\//.test(urlToCheck)) {
        urlToCheck = 'http://' + urlToCheck;
      }
      
      // Use URL constructor to validate
      new URL(urlToCheck);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Generate HTML for URL structure visualization
   * @param {Object} parsedUrl - Parsed URL object
   * @returns {string} HTML for URL structure visualization
   */
  export const generateUrlStructureHtml = (parsedUrl) => {
    if (!parsedUrl) return '';
    
    return `
      <div class="url-diagram">
        <div class="url-part protocol">${escapeHtml(parsedUrl.protocol)}</div>
        <div class="separator">//</div>
        <div class="url-part host">${escapeHtml(parsedUrl.host)}</div>
        ${parsedUrl.port ? `
        <div class="separator">:</div>
        <div class="url-part port">${escapeHtml(parsedUrl.port)}</div>
        ` : ''}
        <div class="url-part path">${escapeHtml(parsedUrl.path)}</div>
        ${parsedUrl.search ? `
        <div class="url-part search">${escapeHtml(parsedUrl.search)}</div>
        ` : ''}
        ${parsedUrl.hash ? `
        <div class="url-part hash">${escapeHtml(parsedUrl.hash)}</div>
        ` : ''}
      </div>
    `;
  };
  
  /**
   * Generate code examples for parsed URL
   * @param {Object} parsedUrl - Parsed URL object
   * @returns {string} HTML for code examples
   */
  export const generateCodeExamples = (parsedUrl) => {
    if (!parsedUrl) return '';
    
    return `
      <div class="code-examples">
        <div class="code-example">
          <h4>JavaScript</h4>
          <pre><code>const url = new URL("${escapeHtml(parsedUrl.url)}");
  console.log(url.hostname); // "${escapeHtml(parsedUrl.host)}"
  console.log(url.pathname); // "${escapeHtml(parsedUrl.path)}"</code></pre>
        </div>
        
        <div class="code-example">
          <h4>Python</h4>
          <pre><code>from urllib.parse import urlparse
  parsed = urlparse("${escapeHtml(parsedUrl.url)}")
  print(parsed.netloc)  # "${escapeHtml(parsedUrl.host)}${parsedUrl.port ? `:${parsedUrl.port}` : ''}"
  print(parsed.path)    # "${escapeHtml(parsedUrl.path)}"</code></pre>
        </div>
        
        <div class="code-example">
          <h4>PHP</h4>
          <pre><code>$url = parse_url("${escapeHtml(parsedUrl.url)}");
  echo $url['host'];  // "${escapeHtml(parsedUrl.host)}"
  echo $url['path'];  // "${escapeHtml(parsedUrl.path)}"</code></pre>
        </div>
      </div>
    `;
  };
  
  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  export const escapeHtml = (text) => {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Format a URL for display
   * @param {string} url - URL to format
   * @returns {string} Formatted URL
   */
  export const formatUrl = (url) => {
    if (!url) return '';
    
    // Simple formatting for now
    return url.trim();
  };
  
  /**
   * Get a list of sample URLs for testing
   * @returns {Array} Array of sample URLs with descriptions
   */
  export const getSampleUrls = () => {
    return [
      {
        name: 'Complete URL with all components',
        url: 'https://example.com/path/to/page?name=test&id=123#section',
        description: 'Contains protocol, host, path, query parameters, and fragment'
      },
      {
        name: 'API URL with query parameters',
        url: 'https://api.example.com/v1/users?limit=10&offset=20',
        description: 'Common format for REST API endpoints with pagination'
      },
      {
        name: 'FTP URL with port',
        url: 'ftp://files.example.org:21/public/document.pdf',
        description: 'File Transfer Protocol URL with explicit port'
      },
      {
        name: 'URL with encoded characters',
        url: 'https://example.com/search?q=url%20encoding&lang=en',
        description: 'Contains URL-encoded spaces and special characters'
      },
      {
        name: 'Subdomain URL',
        url: 'https://blog.example.com/posts/2023/05/url-structure',
        description: 'Uses a subdomain with a hierarchical path'
      }
    ];
  };