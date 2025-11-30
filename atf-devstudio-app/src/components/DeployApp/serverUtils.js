// serverUtils.js - Shared utilities for server operations

/**
 * Tests connection to a server based on its type
 * @param {Object} server - Server configuration
 * @param {Function} updateResults - Function to update UI with results
 * @returns {Promise<boolean>} - True if connection successful, false otherwise
 */
export const testServerConnection = async (server, updateResults) => {
    if (!server) return false;
    
    // Show initial connecting message
    updateResults({
      status: 'info',
      message: 'Testing connection...',
      details: `Attempting to connect to ${server.name} (${server.url})`,
      content: `<div class="deploy-log">
        <div class="log-entry">• Testing connection to ${server.url}...</div>
      </div>`
    });
    
    try {
      let response;
      
      // Call the appropriate test method based on server type
      if (server.type === 'wildfly') {
        response = await testWildflyConnection(server);
      } else {
        // Default to Tomcat
        response = await testTomcatConnection(server);
      }
      
      updateResults({
        status: 'success',
        message: 'Connection successful',
        details: `Connected to ${server.name}`,
        content: `<div class="deploy-log">
          <div class="log-entry">• Testing connection to ${server.url}...</div>
          <div class="log-entry success-entry">• Connection successful!</div>
          <div class="log-entry">• Authenticated as ${server.username}</div>
          <div class="log-entry">• Server running ${server.type === 'wildfly' ? 'WildFly' : 'Tomcat'} Management API</div>
          <div class="log-entry">• Currently deployed applications:</div>
          <pre class="server-apps-list">${response}</pre>
        </div>`
      });
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      
      // Handle specific error types
      let errorMessage = error.message || 'Unknown error occurred';
      let errorDetails = '';
      
      // Check for authentication errors
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Authentication failed';
        errorDetails = `Invalid username or password for ${server.type === 'wildfly' ? 'WildFly' : 'Tomcat'} Management`;
      } 
      // Check for connection errors
      else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = 'Connection to server failed';
        errorDetails = `Could not connect to ${server.url}. Please check that the server is running and the URL is correct.`;
      }
      // Check for permission errors
      else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'Permission denied';
        errorDetails = 'The provided credentials do not have permission to manage applications';
      }
      
      updateResults({
        status: 'error',
        message: errorMessage,
        details: errorDetails || error.message,
        content: `<div class="deploy-log">
          <div class="log-entry">• Testing connection to ${server.url}...</div>
          <div class="log-entry error-entry">• Error: ${errorMessage}</div>
          ${errorDetails ? `<div class="log-entry">• Details: ${errorDetails}</div>` : ''}
          <div class="log-entry">• Check your server configuration and try again</div>
          <div class="log-entry">• Make sure your server allows remote access</div>
          <div class="log-entry">• Full error: ${error.message}</div>
        </div>`
      });
      
      return false;
    }
  };
  
  /**
   * Tests connection to Tomcat server
   * @param {Object} server - Server configuration
   * @returns {Promise<string>} - Server response or error message
   */
  const testTomcatConnection = async (server) => {
    // Create basic auth credentials
    const credentials = btoa(`${server.username}:${server.password}`);
    
    // Use relative path for proxy to work
    const listUrl = '/manager/text/list';
    
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  };
  
  /**
   * Tests connection to WildFly server
   * @param {Object} server - Server configuration
   * @returns {Promise<string>} - Server response or error message
   */
  const testWildflyConnection = async (server) => {
    // Create basic auth credentials
    const credentials = btoa(`${server.username}:${server.password}`);
    
    // WildFly has a different management API, uses JSON
    const managementUrl = '/management';
    
    // Create the JSON payload to request deployment information
    const payload = {
      operation: "read-resource",
      address: [{"deployment": "*"}],
      recursive: true
    };
    
    const response = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Format the deployment list for display
    let deploymentList = '';
    
    if (result.result && Object.keys(result.result).length > 0) {
      for (const [deploymentName, deploymentInfo] of Object.entries(result.result)) {
        deploymentList += `${deploymentName} : ${deploymentInfo.enabled ? 'running' : 'not running'}\n`;
      }
    } else {
      deploymentList = 'No applications currently deployed';
    }
    
    return deploymentList;
  };
  
  /**
   * Extracts the base URL from a server URL
   * @param {string} serverUrl - Full server URL including management path
   * @returns {string} - Base URL (protocol + host + port)
   */
  export const getServerBaseUrl = (serverUrl) => {
    try {
      const urlObj = new URL(serverUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
      console.error('Invalid URL:', e);
      return serverUrl; // Return original as fallback
    }
  };
  
  /**
   * Formats file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted size with units
   */
  export const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };