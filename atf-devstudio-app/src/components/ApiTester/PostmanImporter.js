// PostmanImporter.js
// Handles importing Postman collections into the API Tester

/**
 * Process and import a Postman collection
 */
export class PostmanImporter {
    constructor(projectManager) {
      this.projectManager = projectManager;
    }
    
    /**
     * Import a Postman collection from a JSON string
     * @param {string} jsonString - The Postman collection JSON
     * @returns {Object} - Result object with success status and details
     */
    importFromJson(jsonString) {
      try {
        // Parse the JSON
        const collection = JSON.parse(jsonString);
        
        // Validate that this is a Postman collection
        if (!this.isValidPostmanCollection(collection)) {
          return {
            success: false,
            message: 'Invalid Postman collection format',
            details: 'The JSON does not appear to be a valid Postman collection.'
          };
        }
        
        // Extract variables from the collection first
        const collectionVariables = this.extractCollectionVariables(collection);
        
        // Create an environment for the collection variables if any exist
        const environmentName = `${collection.info.name} Environment`;
        if (Object.keys(collectionVariables).length > 0 && this.projectManager.environmentManager) {
          // Create a new environment with the collection name
          this.projectManager.environmentManager.createEnvironment(environmentName, collectionVariables);
          // Set it as the active environment
          this.projectManager.environmentManager.setActiveEnvironment(environmentName);
        }
        
        // Create a project for the collection
        const projectId = this.createProjectFromCollection(collection);
        
        if (!projectId) {
          return {
            success: false,
            message: 'Failed to create project',
            details: 'Could not create a project for the Postman collection.'
          };
        }
        
        // Import all requests from the collection
        const importedRequests = this.importRequests(collection, projectId);
        
        return {
          success: true,
          message: `Imported Postman collection: ${collection.info.name}`,
          details: `Imported ${importedRequests.length} requests into project "${collection.info.name}"${
            Object.keys(collectionVariables).length > 0 
              ? ` and created environment "${environmentName}" with ${Object.keys(collectionVariables).length} variables` 
              : ''
          }`,
          projectId,
          requestCount: importedRequests.length,
          name: collection.info.name,
          environmentName: Object.keys(collectionVariables).length > 0 ? environmentName : null,
          variableCount: Object.keys(collectionVariables).length
        };
      } catch (error) {
        console.error('Error importing Postman collection:', error);
        return {
          success: false,
          message: 'Failed to import Postman collection',
          details: error.message
        };
      }
    }
    
    /**
     * Check if the JSON is a valid Postman collection
     * @param {Object} collection - The parsed JSON object
     * @returns {boolean} - True if valid Postman collection
     */
    isValidPostmanCollection(collection) {
      // Basic validation of Postman collection structure
      return (
        collection &&
        collection.info &&
        collection.info._postman_id &&
        collection.info.name &&
        collection.item &&
        Array.isArray(collection.item)
      );
    }
    
    /**
     * Create a project from the Postman collection
     * @param {Object} collection - The Postman collection
     * @returns {string|null} - Project ID or null if failed
     */
    createProjectFromCollection(collection) {
      if (!this.projectManager) {
        console.error('Project manager not available');
        return null;
      }
      
      // Create a project with the collection name
      const projectId = this.projectManager.createProject(collection.info.name);
      
      return projectId;
    }
    
    /**
     * Import requests from the collection into the project
     * @param {Object} collection - The Postman collection
     * @param {string} projectId - The project ID to import into
     * @returns {Array} - Array of imported request IDs
     */
    importRequests(collection, projectId) {
      const importedRequests = [];
      
      // Process collection variables if any
      const collectionVariables = this.extractCollectionVariables(collection);
      
      // Process each item (could be a folder or request)
      this.processItems(collection.item, projectId, importedRequests, '');
      
      return importedRequests;
    }
    
    /**
     * Process items recursively (handling nested folders)
     * @param {Array} items - The items to process
     * @param {string} projectId - The project ID
     * @param {Array} importedRequests - List to collect imported request IDs
     * @param {string} folderPrefix - Prefix for request names based on folder hierarchy
     */
    processItems(items, projectId, importedRequests, folderPrefix) {
      items.forEach(item => {
        if (item.item && Array.isArray(item.item)) {
          // This is a folder, process its children
          const newPrefix = folderPrefix ? `${folderPrefix}/${item.name}` : item.name;
          this.processItems(item.item, projectId, importedRequests, newPrefix);
        } else {
          // This is a request
          const requestName = folderPrefix 
            ? `${folderPrefix}/${item.name}`
            : item.name;
            
          const importedRequestId = this.importRequest(item, projectId, requestName);
          
          if (importedRequestId) {
            importedRequests.push(importedRequestId);
          }
        }
      });
    }
    
    /**
     * Import a single request from the collection
     * @param {Object} item - The request item
     * @param {string} projectId - The project ID
     * @param {string} requestName - The name to use for the request
     * @returns {string|null} - The imported request ID or null if failed
     */
    importRequest(item, projectId, requestName) {
      try {
        if (!item.request) {
          console.error('Invalid request item:', item);
          return null;
        }
        
        // Extract request details
        const { method, url, header, body } = item.request;
        
        // Format headers
        const headers = this.formatHeaders(header);
        
        // Format URL
        const formattedUrl = this.formatUrl(url);
        
        // Format body
        const { formattedBody, bodyFormat } = this.formatBody(body);
        
        // Detect auth type and details
        const { authType, authDetails } = this.extractAuth(item.request);
        
        // Create the request in the project
        const requestData = {
          url: formattedUrl,
          method: method,
          headers: headers,
          body: formattedBody,
          bodyFormat: bodyFormat,
          authType: authType,
          authDetails: authDetails
        };
        
        const requestId = this.projectManager.createRequest(
          projectId, 
          requestName, 
          requestData
        );
        
        return requestId;
      } catch (error) {
        console.error(`Error importing request "${requestName}":`, error);
        return null;
      }
    }
    
    /**
     * Extract collection variables 
     * @param {Object} collection - The Postman collection
     * @returns {Object} - The collection variables
     */
    extractCollectionVariables(collection) {
      const variables = {};
      
      // Extract from collection variables
      if (collection.variable && Array.isArray(collection.variable)) {
        collection.variable.forEach(v => {
          if (v.key && v.value !== undefined) {
            variables[v.key] = v.value;
          }
        });
      }
      
      // Add default host and context variables if not present
      if (!variables.host && collection.item && collection.item.length > 0) {
        // Try to extract a default host from the first request
        try {
          const firstRequestWithUrl = this.findFirstRequestWithUrl(collection.item);
          if (firstRequestWithUrl && firstRequestWithUrl.request && firstRequestWithUrl.request.url) {
            const url = firstRequestWithUrl.request.url;
            if (typeof url === 'string') {
              const urlObj = new URL(url);
              variables.host = `${urlObj.protocol}//${urlObj.host}`;
            } else if (url.host) {
              // Handle Postman URL object format
              const protocol = url.protocol || 'http';
              const host = Array.isArray(url.host) ? url.host.join('.') : url.host;
              variables.host = `${protocol}://${host}`;
            }
          }
        } catch (e) {
          console.warn('Could not extract default host from requests:', e);
          variables.host = 'http://localhost:8080';
        }
      }
      
      // If not found, add some defaults
      if (!variables.host) {
        variables.host = 'http://localhost:8080';
      }
      
      // Try to extract context from path patterns
      if (!variables.context && collection.item && collection.item.length > 0) {
        try {
          const commonContextPath = this.extractCommonContextPath(collection.item);
          if (commonContextPath) {
            variables.context = commonContextPath;
          }
        } catch (e) {
          console.warn('Could not extract common context path:', e);
        }
      }
      
      return variables;
    }
    
    /**
     * Find the first request with a URL in the collection
     * @param {Array} items - Collection items (could be folders or requests)
     * @returns {Object|null} - First request with URL or null if none found
     */
    findFirstRequestWithUrl(items) {
      for (const item of items) {
        if (item.request && item.request.url) {
          return item;
        } else if (item.item && Array.isArray(item.item)) {
          const nestedRequest = this.findFirstRequestWithUrl(item.item);
          if (nestedRequest) {
            return nestedRequest;
          }
        }
      }
      return null;
    }
    
    /**
     * Extract common context path from requests
     * @param {Array} items - Collection items
     * @returns {string|null} - Common context path or null if none found
     */
    extractCommonContextPath(items) {
      const paths = [];
      
      // Collect all paths
      const collectPaths = (items) => {
        for (const item of items) {
          if (item.request && item.request.url) {
            try {
              let path = '';
              if (typeof item.request.url === 'string') {
                const urlObj = new URL(item.request.url);
                path = urlObj.pathname;
              } else if (item.request.url.path && Array.isArray(item.request.url.path)) {
                path = '/' + item.request.url.path.join('/');
              }
              
              // Only add non-empty paths
              if (path && path !== '/') {
                paths.push(path);
              }
            } catch (e) {
              // Skip this URL if it can't be parsed
            }
          } else if (item.item && Array.isArray(item.item)) {
            collectPaths(item.item);
          }
        }
      };
      
      collectPaths(items);
      
      if (paths.length === 0) {
        return null;
      }
      
      // Find common prefix of all paths
      let commonPrefix = paths[0].split('/');
      
      for (let i = 1; i < paths.length; i++) {
        const pathParts = paths[i].split('/');
        const newCommonPrefix = [];
        
        for (let j = 0; j < Math.min(commonPrefix.length, pathParts.length); j++) {
          if (commonPrefix[j] === pathParts[j]) {
            newCommonPrefix.push(commonPrefix[j]);
          } else {
            break;
          }
        }
        
        commonPrefix = newCommonPrefix;
        
        if (commonPrefix.length <= 1) {
          break; // No common context found
        }
      }
      
      // Remove the first empty element (from the leading slash)
      if (commonPrefix.length > 0 && commonPrefix[0] === '') {
        commonPrefix.shift();
      }
      
      // If we have at least one segment, it's the context
      if (commonPrefix.length >= 1 && !commonPrefix[0].includes('{')) {
        return '/' + commonPrefix[0];
      }
      
      return null;
    }
    
    /**
     * Format headers from Postman format to API Tester format
     * @param {Array} headers - Postman headers
     * @returns {string} - Formatted headers JSON string
     */
    formatHeaders(headers) {
      if (!headers || !Array.isArray(headers)) {
        return '{\n  "Content-Type": "application/json"\n}';
      }
      
      const headersObj = {};
      
      headers.forEach(header => {
        if (header.key && header.value !== undefined) {
          headersObj[header.key] = header.value;
        }
      });
      
      return JSON.stringify(headersObj, null, 2);
    }
    
    /**
     * Format URL from Postman format to API Tester format
     * @param {Object|string} url - Postman URL object or string
     * @returns {string} - Formatted URL string
     */
    formatUrl(url) {
      if (typeof url === 'string') {
        return url;
      }
      
      if (!url || !url.raw) {
        return '';
      }
      
      return url.raw;
    }
    
    /**
     * Format body from Postman format to API Tester format
     * @param {Object} body - Postman body object
     * @returns {Object} - Object with formattedBody and bodyFormat
     */
    formatBody(body) {
      if (!body) {
        return { formattedBody: '', bodyFormat: 'json' };
      }
      
      let formattedBody = '';
      let bodyFormat = 'json';
      
      if (body.mode === 'raw') {
        formattedBody = body.raw || '';
        
        // Check for language options
        if (body.options && body.options.raw && body.options.raw.language) {
          switch (body.options.raw.language) {
            case 'json':
              bodyFormat = 'json';
              break;
            case 'text':
              bodyFormat = 'text';
              break;
            default:
              bodyFormat = 'json';
          }
        }
      } else if (body.mode === 'urlencoded' && Array.isArray(body.urlencoded)) {
        // Format as form data
        bodyFormat = 'form';
        formattedBody = body.urlencoded
          .filter(param => param.key)
          .map(param => `${param.key}: ${param.value || ''}`)
          .join('\n');
      } else if (body.mode === 'formdata' && Array.isArray(body.formdata)) {
        // Format as form data
        bodyFormat = 'form';
        formattedBody = body.formdata
          .filter(param => param.key)
          .map(param => `${param.key}: ${param.value || ''}`)
          .join('\n');
      }
      
      return { formattedBody, bodyFormat };
    }
    
    /**
     * Extract authentication details from Postman request
     * @param {Object} request - Postman request object
     * @returns {Object} - Object with authType and authDetails
     */
    extractAuth(request) {
      const authDetails = {
        username: '',
        password: '',
        token: '',
        apiKey: '',
        apiKeyName: 'X-API-Key'
      };
      
      let authType = 'none';
      
      // Check for auth property
      if (request.auth) {
        const auth = request.auth;
        
        // Basic auth
        if (auth.type === 'basic' && auth.basic) {
          authType = 'basic';
          
          const username = this.findAuthValue(auth.basic, 'username');
          const password = this.findAuthValue(auth.basic, 'password');
          
          if (username) authDetails.username = username;
          if (password) authDetails.password = password;
        }
        
        // Bearer token
        else if (auth.type === 'bearer' && auth.bearer) {
          authType = 'bearer';
          
          const token = this.findAuthValue(auth.bearer, 'token');
          if (token) authDetails.token = token;
        }
        
        // API Key
        else if (auth.type === 'apikey' && auth.apikey) {
          authType = 'apiKey';
          
          const key = this.findAuthValue(auth.apikey, 'key');
          const value = this.findAuthValue(auth.apikey, 'value');
          
          if (key) authDetails.apiKeyName = key;
          if (value) authDetails.apiKey = value;
        }
      }
      
      // Check for auth in headers as fallback
      else if (request.header && Array.isArray(request.header)) {
        const authHeader = request.header.find(h => 
          h.key && h.key.toLowerCase() === 'authorization'
        );
        
        if (authHeader && authHeader.value) {
          const authValue = authHeader.value;
          
          // Check for bearer token
          if (authValue.startsWith('Bearer ')) {
            authType = 'bearer';
            authDetails.token = authValue.substring(7);
          }
          // Check for basic auth
          else if (authValue.startsWith('Basic ')) {
            authType = 'basic';
            try {
              const decoded = atob(authValue.substring(6));
              const [username, password] = decoded.split(':');
              
              if (username) authDetails.username = username;
              if (password) authDetails.password = password;
            } catch (e) {
              console.error('Failed to decode Basic auth:', e);
            }
          }
        }
      }
      
      return { authType, authDetails };
    }
    
    /**
     * Find auth value in Postman auth array
     * @param {Array} authArray - Postman auth array
     * @param {string} key - Key to find
     * @returns {string} - Value or empty string
     */
    findAuthValue(authArray, key) {
      if (!authArray || !Array.isArray(authArray)) return '';
      
      const item = authArray.find(i => i.key === key);
      return item && item.value !== undefined ? item.value : '';
    }
  }
  
  export default PostmanImporter;