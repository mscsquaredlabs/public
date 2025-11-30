// deploymentManager.js - Manages deployment history and operations
import { deployToTomcat, undeployFromTomcat } from './tomcat';
import { deployToWildFly, undeployFromWildFly } from './wildfly';
import { formatFileSize } from './serverUtils';

// Key for storing deployments in localStorage
const DEPLOYMENTS_STORAGE_KEY = 'atf-dev-studio-deployments';
const CURRENT_DEPLOYMENT_KEY = 'atf-dev-studio-current-deployment';

/**
 * Manages all deployment operations and history
 */
export class DeploymentManager {
  constructor() {
    this.deployments = this.loadDeployments();
  }
  
  /**
   * Loads deployment history from localStorage
   * @returns {Array} Array of deployment records
   */
  loadDeployments() {
    try {
      const storedDeployments = localStorage.getItem(DEPLOYMENTS_STORAGE_KEY);
      return storedDeployments ? JSON.parse(storedDeployments) : [];
    } catch (error) {
      console.error('Failed to load deployments:', error);
      return [];
    }
  }
  
  /**
   * Saves deployments to localStorage
   */
  saveDeployments() {
    try {
      localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(this.deployments));
    } catch (error) {
      console.error('Failed to save deployments:', error);
    }
  }
  
  /**
   * Gets the current deployment info
   * @returns {Object|null} Current deployment or null
   */
  getCurrentDeployment() {
    try {
      const currentDeployment = localStorage.getItem(CURRENT_DEPLOYMENT_KEY);
      return currentDeployment ? JSON.parse(currentDeployment) : null;
    } catch (error) {
      console.error('Failed to get current deployment:', error);
      return null;
    }
  }
  
  /**
   * Sets the current deployment and adds it to history
   * @param {Object} deploymentInfo - Deployment information
   */
  setCurrentDeployment(deploymentInfo) {
    try {
      // Save as current deployment
      localStorage.setItem(CURRENT_DEPLOYMENT_KEY, JSON.stringify(deploymentInfo));
      
      // Add to deployments history if successful
      if (deploymentInfo.status === 'success') {
        this.deployments.unshift(deploymentInfo);
        // Cap history at a reasonable length (e.g., 20 deployments)
        if (this.deployments.length > 20) {
          this.deployments = this.deployments.slice(0, 20);
        }
        this.saveDeployments();
      }
    } catch (error) {
      console.error('Failed to set current deployment:', error);
    }
  }
  
  /**
   * Updates an existing deployment in history
   * @param {Object} deploymentInfo - Updated deployment information
   */
  updateDeployment(deploymentInfo) {
    try {
      // Find and update the deployment in our history
      const index = this.deployments.findIndex(d => d.id === deploymentInfo.id);
      
      if (index !== -1) {
        this.deployments[index] = deploymentInfo;
        this.saveDeployments();
        
        // If this was the current deployment, update that too
        const currentDeployment = this.getCurrentDeployment();
        if (currentDeployment && currentDeployment.id === deploymentInfo.id) {
          localStorage.setItem(CURRENT_DEPLOYMENT_KEY, JSON.stringify(deploymentInfo));
        }
        
        // Dispatch an event to notify components that deployment history has changed
        window.dispatchEvent(new CustomEvent('deploymentUpdated'));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update deployment:', error);
      return false;
    }
  }
  
  /**
   * Deploys a WAR file to the specified server
   * @param {File} file - WAR file to deploy
   * @param {Object} server - Server configuration
   * @param {Object} options - Deployment options
   * @param {Function} updateResults - Function to update UI with results
   * @returns {Promise<Object|null>} Deployment info or null if failed
   */
  async deployApplication(file, server, options, updateResults) {
    if (!file || !server) {
      updateResults({
        status: 'warning',
        message: 'Deployment requirements not met',
        details: !file 
          ? 'Please select a .war file to deploy.' 
          : 'Please select a target server for deployment.',
        content: ''
      });
      return null;
    }
    
    try {
      let deploymentInfo = null;
      
      // Call the appropriate deployment function based on server type
      if (server.type === 'wildfly') {
        deploymentInfo = await deployToWildFly(
          file, 
          server, 
          options, 
          updateResults, 
          this.setCurrentDeployment.bind(this)
        );
      } else {
        // Default to Tomcat
        deploymentInfo = await deployToTomcat(
          file, 
          server, 
          options, 
          updateResults, 
          this.setCurrentDeployment.bind(this)
        );
      }
      
      return deploymentInfo;
    } catch (error) {
      console.error('Deployment error:', error);
      
      updateResults({
        status: 'error',
        message: 'Deployment failed',
        details: error.message || 'An unknown error occurred during deployment',
        content: `<div class="deploy-log">
          <div class="log-entry error-entry">• Error: ${error.message || 'Unknown error'}</div>
        </div>`
      });
      
      return null;
    }
  }
  
  /**
   * Undeploys an application from the specified server
   * @param {Object} deployment - Deployment to undeploy
   * @param {Object} server - Server configuration
   * @param {Function} updateResults - Function to update UI with results
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async undeployApplication(deployment, server, updateResults) {
    if (!deployment || !server) {
      updateResults({
        status: 'warning',
        message: 'Undeployment requirements not met',
        details: !deployment 
          ? 'No deployment specified for undeployment.' 
          : 'Please select a target server for undeployment.',
        content: ''
      });
      return false;
    }
    
    try {
      let result = false;
      
      // Call the appropriate undeploy function based on server type
      if (server.type === 'wildfly') {
        result = await undeployFromWildFly(
          deployment.deploymentName || deployment.file.name, 
          server, 
          updateResults
        );
      } else {
        // Default to Tomcat
        result = await undeployFromTomcat(
          deployment.contextPath, 
          server, 
          updateResults
        );
      }
      
      if (result) {
        // Mark deployment as undeployed in history
        const updatedDeployment = {
          ...deployment,
          undeployed: true,
          undeployedAt: new Date().toISOString()
        };
        
        this.updateDeployment(updatedDeployment);
      }
      
      return result;
    } catch (error) {
      console.error('Undeployment error:', error);
      
      updateResults({
        status: 'error',
        message: 'Undeployment failed',
        details: error.message || 'An unknown error occurred during undeployment',
        content: `<div class="deploy-log">
          <div class="log-entry error-entry">• Error: ${error.message || 'Unknown error'}</div>
        </div>`
      });
      
      return false;
    }
  }
  
  /**
   * Gets all deployment history
   * @returns {Array} Array of deployment records
   */
  getDeploymentHistory() {
    return this.deployments;
  }
  
  /**
   * Removes a deployment from history
   * @param {string} deploymentId - ID of deployment to remove
   */
  removeDeployment(deploymentId) {
    this.deployments = this.deployments.filter(dep => dep.id !== deploymentId);
    this.saveDeployments();
    
    // If this was the current deployment, clear it
    const currentDeployment = this.getCurrentDeployment();
    if (currentDeployment && currentDeployment.id === deploymentId) {
      localStorage.removeItem(CURRENT_DEPLOYMENT_KEY);
    }
    
    // Dispatch an event to notify components that deployment history has changed
    window.dispatchEvent(new CustomEvent('deploymentUpdated'));
  }
  
  /**
   * Clears all deployment history
   */
  clearDeploymentHistory() {
    this.deployments = [];
    this.saveDeployments();
    localStorage.removeItem(CURRENT_DEPLOYMENT_KEY);
    
    // Dispatch an event to notify components that deployment history has changed
    window.dispatchEvent(new CustomEvent('deploymentUpdated'));
  }
  
  /**
   * Generates HTML content for showing a deployment in the UI
   * @param {Object} deployment - Deployment record
   * @returns {string} HTML content
   */
  generateDeploymentContent(deployment) {
    const date = new Date(deployment.deployedAt).toLocaleString();
    const serverType = deployment.serverType === 'wildfly' ? 'WildFly' : 'Tomcat';
    
    let content = `<div class="deploy-log">
      <div class="log-entry">• Deployed on: ${date}</div>
      <div class="log-entry">• File: ${deployment.file.name} (${formatFileSize(deployment.file.size)})</div>
      <div class="log-entry">• Server: ${deployment.server} (${serverType})</div>`;
    
    if (deployment.undeployed) {
      const undeployDate = new Date(deployment.undeployedAt).toLocaleString();
      content += `
        <div class="log-entry warning-entry">• Deployment status: Undeployed on ${undeployDate}</div>
        <div class="log-entry">• Application was deployed at: ${deployment.contextPath}</div>
      </div>`;
    } else {
      content += `
        <div class="log-entry success-entry">• Deployment status: Running</div>
        <div class="log-entry">• Application is running at: ${deployment.contextPath}</div>
        <div class="app-url">
          <a href="${deployment.applicationUrl}" target="_blank" rel="noopener noreferrer">
            ${deployment.applicationUrl}
          </a>
        </div>
      </div>`;
    }
    
    return content;
  }
}

// Export a singleton instance
export const deploymentManager = new DeploymentManager();

// Export general deployment function that directs to the right server type
export const deployApplication = async (file, server, options, updateResults) => {
  return await deploymentManager.deployApplication(file, server, options, updateResults);
};

// Export general undeploy function that directs to the right server type
export const undeployApplication = async (deployment, server, updateResults) => {
  return await deploymentManager.undeployApplication(deployment, server, updateResults);
};