// wildfly.js - WildFly-specific deployment services
import { getServerBaseUrl } from './serverUtils';

/**
 * Deploys a WAR file to a WildFly server
 * @param {File} file - The WAR file to deploy
 * @param {Object} server - Server configuration
 * @param {Object} options - Deployment options
 * @param {Function} updateResults - Function to update UI with results
 * @param {Function} setCurrentDeployment - Function to save deployment info
 * @returns {Promise<Object>} - Deployment result information
 */
export const deployToWildFly = async (file, server, options, updateResults, setCurrentDeployment) => {
  const { customContextPath, undeployFirst } = options;
  
  // Start deployment log
  let logContent = '<div class="deploy-log"><div class="log-entry">• Starting deployment process to WildFly server...</div></div>';
  
  // Update status to show uploading
  updateResults({
    status: 'info',
    message: 'Uploading and deploying...',
    details: `Uploading ${file.name} to ${server.name} (${server.url})`,
    content: logContent
  });
  
  try {
    // Determine deployment name - WildFly uses original filename by default
    // The context path can be customized with the jboss-web.xml inside the WAR
    const deploymentName = customContextPath 
      ? customContextPath.replace(/^\//, '') + '.war' 
      : file.name;
    
    // Calculate context path based on the deployment name
    const contextPath = customContextPath || `/${file.name.replace('.war', '')}`;
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    
    // Step 1: Connect to server and authenticate
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting deployment process to WildFly server...</div>
      <div class="log-entry">• Connecting to WildFly server at ${server.url}...</div>
    </div>`;
    
    updateResults({
      status: 'info',
      message: 'Connecting to WildFly server...',
      details: `Preparing to deploy ${file.name} to ${server.name}`,
      content: logContent
    });
    
    // Create basic auth credentials
    const credentials = btoa(`${server.username}:${server.password}`);
    
    // Step 2: Check if we need to undeploy first
    if (undeployFirst) {
      await handleWildFlyUndeploy(credentials, deploymentName, server, logContent, updateResults);
    }
    
    // Step 3: Upload and deploy the WAR file
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting deployment process to WildFly server...</div>
      <div class="log-entry">• Connected to server at ${server.url}</div>
      <div class="log-entry">• Authenticated as ${server.username}</div>
      ${undeployFirst ? `<div class="log-entry">• Undeployed existing application "${deploymentName}"</div>` : ''}
      <div class="log-entry">• Uploading ${fileSize} MB to server...</div>
    </div>`;
    
    updateResults({
      status: 'info',
      message: 'Uploading WAR file...',
      details: `Uploading ${file.name} (${fileSize} MB)`,
      content: logContent
    });
    
    // WildFly deployment is a two-step process:
    // 1. Upload the content
    // 2. Deploy it with a management operation
    
    // First, convert the file to a byte array for upload
    const fileBytes = await fileToByteArray(file);
    
    // Upload the content to the content repository
    const uploadPayload = {
      operation: "add",
      address: [{ "deployment": deploymentName }],
      content: [{ bytes: fileBytes }],
      enabled: true
    };
    
    // Use relative path for proxy to work
    const managementUrl = '/management';
    
    console.log('Deploying to WildFly:', deploymentName);
    
    const deployResponse = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadPayload)
    });
    
    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      throw new Error(`WildFly deployment failed: ${errorText}`);
    }
    
    // Get the deployment result
    const deployResult = await deployResponse.json();
    
    if (deployResult.outcome !== 'success') {
      throw new Error(`WildFly deployment failed: ${deployResult.failure-description || 'Unknown error'}`);
    }
    
    // Calculate application URL
    const serverBaseUrl = getServerBaseUrl(server.url);
    const applicationUrl = `${serverBaseUrl}${contextPath}`;
    
    // Update with success message
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting deployment process to WildFly server...</div>
      <div class="log-entry">• Connected to server at ${server.url}</div>
      <div class="log-entry">• Authenticated as ${server.username}</div>
      ${undeployFirst ? `<div class="log-entry">• Undeployed existing application "${deploymentName}"</div>` : ''}
      <div class="log-entry">• Uploaded ${fileSize} MB to server</div>
      <div class="log-entry success-entry">• Deployment complete!</div>
      <div class="log-entry">• Application "${deploymentName}" deployed successfully</div>
      <div class="log-entry">• Expected application URL (context path: ${contextPath}):</div>
      <div class="app-url">
        <a href="${applicationUrl}" target="_blank" rel="noopener noreferrer">
          ${applicationUrl}
        </a>
      </div>
    </div>`;
    
    // Save the deployment info for persistence
    const deploymentInfo = {
      id: `deploy-${Date.now()}`,
      file: {
        name: file.name,
        size: file.size
      },
      server: server.name,
      serverType: 'wildfly',
      deploymentName: deploymentName,
      contextPath: contextPath,
      deployedAt: new Date().toISOString(),
      applicationUrl: applicationUrl,
      status: 'success'
    };
    
    setCurrentDeployment(deploymentInfo);
    
    updateResults({
      status: 'success',
      message: 'Deployment successful',
      details: `Application deployed as "${deploymentName}"`,
      content: logContent
    });
    
    return deploymentInfo;
    
  } catch (error) {
    handleDeploymentError(error, server, logContent, updateResults);
    return null;
  }
};

/**
 * Undeploys an application from a WildFly server
 * @param {string} deploymentName - The deployment name to undeploy
 * @param {Object} server - Server configuration
 * @param {Function} updateResults - Function to update UI with results
 * @returns {Promise<boolean>} - true if successful, false otherwise
 */
export const undeployFromWildFly = async (deploymentName, server, updateResults) => {
  // Start undeploy log
  let logContent = `<div class="deploy-log">
    <div class="log-entry">• Starting undeployment process from WildFly server...</div>
    <div class="log-entry">• Connecting to WildFly server at ${server.url}...</div>
  </div>`;
  
  updateResults({
    status: 'info',
    message: 'Undeploying application...',
    details: `Undeploying "${deploymentName}" from ${server.name}`,
    content: logContent
  });
  
  try {
    // Create basic auth credentials
    const credentials = btoa(`${server.username}:${server.password}`);
    
    // Update log
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting undeployment process from WildFly server...</div>
      <div class="log-entry">• Connected to server at ${server.url}</div>
      <div class="log-entry">• Authenticated as ${server.username}</div>
      <div class="log-entry">• Undeploying application "${deploymentName}"...</div>
    </div>`;
    
    updateResults({
      status: 'info',
      message: 'Undeploying...',
      details: `Removing application "${deploymentName}"`,
      content: logContent
    });
    
    // WildFly uses a JSON-based management API
    const undeployPayload = {
      operation: "remove",
      address: [{ "deployment": deploymentName }]
    };
    
    const managementUrl = '/management';
    
    const undeployResponse = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(undeployPayload)
    });
    
    // Check if undeploy was successful
    if (undeployResponse.ok) {
      const result = await undeployResponse.json();
      
      if (result.outcome === 'success') {
        logContent = `<div class="deploy-log">
          <div class="log-entry">• Starting undeployment process from WildFly server...</div>
          <div class="log-entry">• Connected to server at ${server.url}</div>
          <div class="log-entry">• Authenticated as ${server.username}</div>
          <div class="log-entry success-entry">• Successfully undeployed application "${deploymentName}"</div>
        </div>`;
        
        updateResults({
          status: 'success',
          message: 'Undeployment successful',
          details: `Application "${deploymentName}" was successfully undeployed`,
          content: logContent
        });
        
        return true;
      } else {
        // If we got a response but operation wasn't successful
        throw new Error(result.failure-description || 'Undeploy failed');
      }
    } else {
      // Handle non-OK response
      const errorResponse = await undeployResponse.json();
      const errorText = errorResponse['failure-description'] || 'Unknown error';
      
      // Check if this is a "not found" error, which means it's already undeployed
      if (errorText.includes('not found') || errorText.includes('not exist')) {
        logContent = `<div class="deploy-log">
          <div class="log-entry">• Starting undeployment process from WildFly server...</div>
          <div class="log-entry">• Connected to server at ${server.url}</div>
          <div class="log-entry">• Authenticated as ${server.username}</div>
          <div class="log-entry">• No application "${deploymentName}" found</div>
          <div class="log-entry success-entry">• Undeployment successful (nothing to undeploy)</div>
        </div>`;
        
        updateResults({
          status: 'success',
          message: 'Undeployment successful',
          details: 'No application was found with the specified name (already undeployed)',
          content: logContent
        });
        
        return true;
      } else {
        throw new Error(`Undeployment failed: ${errorText}`);
      }
    }
  } catch (error) {
    // Handle specific error types
    let errorMessage = error.message || 'Unknown error occurred';
    let errorDetails = '';
    
    // Check for authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('Unauthorized')) {
      errorMessage = 'Authentication failed';
      errorDetails = 'Invalid username or password for WildFly Management';
    } 
    // Check for connection errors
    else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Connection to server failed';
      errorDetails = `Could not connect to ${server.url}. Please check that the server is running and the URL is correct.`;
    }
    // Check for permission errors
    else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      errorMessage = 'Permission denied';
      errorDetails = 'The provided credentials do not have permission to undeploy applications';
    }
    // Check if application doesn't exist (treat as success)
    else if (errorMessage.includes('not found') || errorMessage.includes('not exist')) {
      logContent = `<div class="deploy-log">
        <div class="log-entry">• Starting undeployment process from WildFly server...</div>
        <div class="log-entry">• Connected to server at ${server.url}</div>
        <div class="log-entry">• Authenticated as ${server.username}</div>
        <div class="log-entry">• No application "${deploymentName}" found</div>
        <div class="log-entry success-entry">• Undeployment successful (nothing to undeploy)</div>
      </div>`;
      
      updateResults({
        status: 'success',
        message: 'Undeployment successful',
        details: 'No application was found with the specified name (already undeployed)',
        content: logContent
      });
      
      return true;
    }
    
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting undeployment process from WildFly server...</div>
      <div class="log-entry">• Attempting to connect to server at ${server.url}</div>
      <div class="log-entry error-entry">• Error: ${errorMessage}</div>
      ${errorDetails ? `<div class="log-entry">• Details: ${errorDetails}</div>` : ''}
      <div class="log-entry">• Check your server configuration and try again</div>
    </div>`;
    
    updateResults({
      status: 'error',
      message: errorMessage,
      details: errorDetails || 'There was an error during the undeployment process.',
      content: logContent
    });
    
    return false;
  }
};

/**
 * Converts a File object to a Base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 representation of the file
 */
const fileToByteArray = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the "data:application/octet-stream;base64," part
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

/**
 * Handles the undeploy process for WildFly
 * @param {string} credentials - Basic auth credentials
 * @param {string} deploymentName - Deployment name to undeploy
 * @param {Object} server - Server configuration
 * @param {string} logContent - Current log content
 * @param {Function} updateResults - Function to update UI with results
 * @returns {Promise<string>} - Updated log content
 */
async function handleWildFlyUndeploy(credentials, deploymentName, server, logContent, updateResults) {
  logContent = `<div class="deploy-log">
    <div class="log-entry">• Starting deployment process to WildFly server...</div>
    <div class="log-entry">• Connected to server at ${server.url}</div>
    <div class="log-entry">• Authenticated as ${server.username}</div>
    <div class="log-entry">• Undeploying existing application "${deploymentName}"...</div>
  </div>`;
  
  updateResults({
    status: 'info',
    message: 'Undeploying existing application...',
    details: `Undeploying "${deploymentName}"`,
    content: logContent
  });
  
  try {
    // WildFly uses a JSON-based management API
    const undeployPayload = {
      operation: "remove",
      address: [{ "deployment": deploymentName }]
    };
    
    const managementUrl = '/management';
    
    const undeployResponse = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(undeployPayload)
    });
    
    // Check if undeploy was successful
    if (undeployResponse.ok) {
      const result = await undeployResponse.json();
      
      if (result.outcome === 'success') {
        logContent = `<div class="deploy-log">
          <div class="log-entry">• Starting deployment process to WildFly server...</div>
          <div class="log-entry">• Connected to server at ${server.url}</div>
          <div class="log-entry">• Authenticated as ${server.username}</div>
          <div class="log-entry success-entry">• Successfully undeployed application "${deploymentName}"</div>
        </div>`;
      } else {
        // If we got a response but operation wasn't successful
        throw new Error(result.failure-description || 'Undeploy failed');
      }
    } else {
      // Handle non-OK response
      const errorText = await undeployResponse.text();
      throw new Error(`Undeploy failed: ${errorText}`);
    }
    
    updateResults({
      status: 'info',
      message: 'Preparing for deployment...',
      details: 'Undeployment complete, preparing to upload WAR file',
      content: logContent
    });
  } catch (undeployError) {
    // If the deployment doesn't exist, that's fine - continue
    if (undeployError.message.includes('not found') || 
        undeployError.message.includes('not exist') ||
        undeployError.message.includes('404')) {
      logContent = `<div class="deploy-log">
        <div class="log-entry">• Starting deployment process to WildFly server...</div>
        <div class="log-entry">• Connected to server at ${server.url}</div>
        <div class="log-entry">• Authenticated as ${server.username}</div>
        <div class="log-entry">• No existing application "${deploymentName}" found</div>
      </div>`;
    } else {
      // For other errors, we should still try to deploy
      console.warn('Undeploy warning:', undeployError);
      logContent = `<div class="deploy-log">
        <div class="log-entry">• Starting deployment process to WildFly server...</div>
        <div class="log-entry">• Connected to server at ${server.url}</div>
        <div class="log-entry">• Authenticated as ${server.username}</div>
        <div class="log-entry warning-entry">• Warning: Could not undeploy existing application: ${undeployError.message}</div>
        <div class="log-entry">• Continuing with deployment...</div>
      </div>`;
    }
  }
  
  return logContent;
}

/**
 * Handles deployment errors
 * @param {Error} error - The error that occurred
 * @param {Object} server - Server configuration 
 * @param {string} logContent - Current log content
 * @param {Function} updateResults - Function to update UI with results
 */
function handleDeploymentError(error, server, logContent, updateResults) {
  // Handle specific error types
  let errorMessage = error.message || 'Unknown error occurred';
  let errorDetails = '';
  
  // Check for authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('Unauthorized')) {
    errorMessage = 'Authentication failed';
    errorDetails = 'Invalid username or password for WildFly Management';
  } 
  // Check for connection errors
  else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('ECONNREFUSED')) {
    errorMessage = 'Connection to server failed';
    errorDetails = `Could not connect to ${server.url}. Please check that the server is running and the URL is correct.`;
  }
  // Check for permission errors
  else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    errorMessage = 'Permission denied';
    errorDetails = 'The provided credentials do not have permission to deploy applications';
  }
  
  logContent = `<div class="deploy-log">
    <div class="log-entry">• Starting deployment process to WildFly server...</div>
    <div class="log-entry">• Attempting to connect to server at ${server.url}</div>
    <div class="log-entry error-entry">• Error: ${errorMessage}</div>
    ${errorDetails ? `<div class="log-entry">• Details: ${errorDetails}</div>` : ''}
    <div class="log-entry">• Check your server configuration and try again</div>
  </div>`;
  
  updateResults({
    status: 'error',
    message: errorMessage,
    details: errorDetails || 'There was an error during the deployment process.',
    content: logContent
  });
}