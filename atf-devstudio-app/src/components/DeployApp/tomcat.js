// tomcat.js - Tomcat-specific deployment services
import { getServerBaseUrl } from './serverUtils';

/**
 * Deploys a WAR file to a Tomcat server
 * @param {File} file - The WAR file to deploy
 * @param {Object} server - Server configuration
 * @param {Object} options - Deployment options
 * @param {Function} updateResults - Function to update UI with results
 * @param {Function} setCurrentDeployment - Function to save deployment info
 * @returns {Promise<Object>} - Deployment result information
 */
export const deployToTomcat = async (file, server, options, updateResults, setCurrentDeployment) => {
  const { customContextPath, undeployFirst } = options;
  
  // Start deployment log
  let logContent = '<div class="deploy-log"><div class="log-entry">• Starting deployment process...</div></div>';
  
  // Update status to show uploading
  updateResults({
    status: 'info',
    message: 'Uploading and deploying...',
    details: `Uploading ${file.name} to ${server.name} (${server.url})`,
    content: logContent
  });
  
  try {
    // Determine context path
    const contextPath = customContextPath || `/${file.name.replace('.war', '')}`;
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    
    // Step 1: Connect to server and authenticate
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting deployment process...</div>
      <div class="log-entry">• Connecting to Tomcat server at ${server.url}...</div>
    </div>`;
    
    updateResults({
      status: 'info',
      message: 'Connecting to server...',
      details: `Preparing to deploy ${file.name} to ${server.name}`,
      content: logContent
    });
    
    // Create basic auth credentials
    const credentials = btoa(`${server.username}:${server.password}`);
    
    // Step 2: Check if we need to undeploy first
    if (undeployFirst) {
      await handleTomcatUndeploy(credentials, contextPath, server, logContent, updateResults);
    }
    
    // Step 3: Upload and deploy the WAR file
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting deployment process...</div>
      <div class="log-entry">• Connected to server at ${server.url}</div>
      <div class="log-entry">• Authenticated as ${server.username}</div>
      ${undeployFirst ? `<div class="log-entry">• Undeployed existing application from ${contextPath}</div>` : ''}
      <div class="log-entry">• Uploading ${fileSize} MB to server...</div>
    </div>`;
    
    updateResults({
      status: 'info',
      message: 'Uploading WAR file...',
      details: `Uploading ${file.name} (${fileSize} MB)`,
      content: logContent
    });
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('war', file);
    
    // Use relative path for proxy to work
    const deployUrl = `/manager/text/deploy?path=${encodeURIComponent(contextPath)}&update=true`;
    
    console.log('Deploying to URL:', deployUrl);
    
    const deployResponse = await fetch(deployUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${credentials}`
      },
      body: formData
    });
    
    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      throw new Error(`Deployment failed: ${errorText}`);
    }
    
    // Get the deployment result
    const deployResult = await deployResponse.text();
    
    // Calculate application URL
    const serverBaseUrl = getServerBaseUrl(server.url);
    const applicationUrl = `${serverBaseUrl}${contextPath}`;
    
    // Update with success message
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting deployment process...</div>
      <div class="log-entry">• Connected to server at ${server.url}</div>
      <div class="log-entry">• Authenticated as ${server.username}</div>
      ${undeployFirst ? `<div class="log-entry">• Undeployed existing application from ${contextPath}</div>` : ''}
      <div class="log-entry">• Uploaded ${fileSize} MB to server</div>
      <div class="log-entry success-entry">• Deployment complete!</div>
      <div class="log-entry">• Server response: ${deployResult.trim()}</div>
      <div class="log-entry">• Application is running at context path: ${contextPath}</div>
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
      serverType: 'tomcat',
      contextPath: contextPath,
      deployedAt: new Date().toISOString(),
      applicationUrl: applicationUrl,
      status: 'success'
    };
    
    setCurrentDeployment(deploymentInfo);
    
    updateResults({
      status: 'success',
      message: 'Deployment successful',
      details: `Application deployed to ${contextPath}`,
      content: logContent
    });
    
    return deploymentInfo;
    
  } catch (error) {
    handleDeploymentError(error, server, logContent, updateResults);
    return null;
  }
};

/**
 * Undeploys an application from a Tomcat server
 * @param {string} contextPath - The context path to undeploy
 * @param {Object} server - Server configuration
 * @param {Function} updateResults - Function to update UI with results
 * @returns {Promise<boolean>} - true if successful, false otherwise
 */
export const undeployFromTomcat = async (contextPath, server, updateResults) => {
  // Start undeploy log
  let logContent = `<div class="deploy-log">
    <div class="log-entry">• Starting undeployment process...</div>
    <div class="log-entry">• Connecting to Tomcat server at ${server.url}...</div>
  </div>`;
  
  updateResults({
    status: 'info',
    message: 'Undeploying application...',
    details: `Undeploying from ${contextPath} on ${server.name}`,
    content: logContent
  });
  
  try {
    // Create basic auth credentials
    const credentials = btoa(`${server.username}:${server.password}`);
    
    // Update log
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting undeployment process...</div>
      <div class="log-entry">• Connected to server at ${server.url}</div>
      <div class="log-entry">• Authenticated as ${server.username}</div>
      <div class="log-entry">• Undeploying application from context path ${contextPath}...</div>
    </div>`;
    
    updateResults({
      status: 'info',
      message: 'Undeploying...',
      details: `Removing application from ${contextPath}`,
      content: logContent
    });
    
    // Use relative path for proxy to work
    const undeployUrl = `/manager/text/undeploy?path=${encodeURIComponent(contextPath)}`;
    
    const undeployResponse = await fetch(undeployUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    
    if (!undeployResponse.ok) {
      const errorText = await undeployResponse.text();
      
      // Check if this is a "not found" error, which means it's already undeployed
      if (errorText.includes('not found') || undeployResponse.status === 404) {
        logContent = `<div class="deploy-log">
          <div class="log-entry">• Starting undeployment process...</div>
          <div class="log-entry">• Connected to server at ${server.url}</div>
          <div class="log-entry">• Authenticated as ${server.username}</div>
          <div class="log-entry">• No application found at context path ${contextPath}</div>
          <div class="log-entry success-entry">• Undeployment successful (nothing to undeploy)</div>
        </div>`;
        
        updateResults({
          status: 'success',
          message: 'Undeployment successful',
          details: 'No application was found at the specified context path (already undeployed)',
          content: logContent
        });
        
        return true;
      } else {
        throw new Error(`Undeployment failed: ${errorText}`);
      }
    }
    
    // Get the undeploy result
    const undeployResult = await undeployResponse.text();
    
    // Update with success message
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting undeployment process...</div>
      <div class="log-entry">• Connected to server at ${server.url}</div>
      <div class="log-entry">• Authenticated as ${server.username}</div>
      <div class="log-entry">• Server response: ${undeployResult.trim()}</div>
      <div class="log-entry success-entry">• Undeployment successful!</div>
      <div class="log-entry">• Application has been removed from context path: ${contextPath}</div>
    </div>`;
    
    updateResults({
      status: 'success',
      message: 'Undeployment successful',
      details: `Application removed from ${contextPath}`,
      content: logContent
    });
    
    return true;
    
  } catch (error) {
    // Handle specific error types
    let errorMessage = error.message || 'Unknown error occurred';
    let errorDetails = '';
    
    // Check for authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('Unauthorized')) {
      errorMessage = 'Authentication failed';
      errorDetails = 'Invalid username or password for Tomcat Manager';
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
    
    logContent = `<div class="deploy-log">
      <div class="log-entry">• Starting undeployment process...</div>
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
 * Handles the undeploy process for Tomcat
 * @param {string} credentials - Basic auth credentials
 * @param {string} contextPath - Context path to undeploy
 * @param {Object} server - Server configuration
 * @param {string} logContent - Current log content
 * @param {Function} updateResults - Function to update UI with results
 * @returns {Promise<string>} - Updated log content
 */
async function handleTomcatUndeploy(credentials, contextPath, server, logContent, updateResults) {
  logContent = `<div class="deploy-log">
    <div class="log-entry">• Starting deployment process...</div>
    <div class="log-entry">• Connected to server at ${server.url}</div>
    <div class="log-entry">• Authenticated as ${server.username}</div>
    <div class="log-entry">• Undeploying existing application at context path ${contextPath}...</div>
  </div>`;
  
  updateResults({
    status: 'info',
    message: 'Undeploying existing application...',
    details: `Undeploying from context path ${contextPath}`,
    content: logContent
  });
  
  try {
    // Use relative path for proxy to work
    const undeployUrl = `/manager/text/undeploy?path=${encodeURIComponent(contextPath)}`;
    const undeployResponse = await fetch(undeployUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    
    if (!undeployResponse.ok) {
      const errorText = await undeployResponse.text();
      // Check if this is a "not found" error, which is okay
      if (errorText.includes('not found') || undeployResponse.status === 404) {
        logContent = logContent.replace('• Undeploying existing application at context path', 
          '• No existing application found at context path');
      } else {
        throw new Error(`Undeploy failed: ${errorText}`);
      }
    } else {
      const undeployResult = await undeployResponse.text();
      logContent = `<div class="deploy-log">
        <div class="log-entry">• Starting deployment process...</div>
        <div class="log-entry">• Connected to server at ${server.url}</div>
        <div class="log-entry">• Authenticated as ${server.username}</div>
        <div class="log-entry success-entry">• Successfully undeployed application from ${contextPath}</div>
      </div>`;
    }
    
    updateResults({
      status: 'info',
      message: 'Preparing for deployment...',
      details: 'Undeployment complete, preparing to upload WAR file',
      content: logContent
    });
  } catch (undeployError) {
    // If it's not found, that's okay, otherwise it's a real error
    if (undeployError.message.includes('not found') || undeployError.message.includes('404')) {
      logContent = `<div class="deploy-log">
        <div class="log-entry">• Starting deployment process...</div>
        <div class="log-entry">• Connected to server at ${server.url}</div>
        <div class="log-entry">• Authenticated as ${server.username}</div>
        <div class="log-entry">• No existing application found at context path ${contextPath}</div>
      </div>`;
    } else {
      throw undeployError;
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
    errorDetails = 'Invalid username or password for Tomcat Manager';
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
    <div class="log-entry">• Starting deployment process...</div>
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