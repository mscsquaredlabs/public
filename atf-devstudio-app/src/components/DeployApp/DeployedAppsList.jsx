import React, { useState, useEffect } from 'react';
import { deploymentManager } from './DeploymentManager';
import { formatFileSize } from './serverUtils';
import { undeployFromTomcat } from './tomcat';
import { undeployFromWildFly } from './wildfly';

/**
 * Component for displaying deployed applications history
 */
const DeployedAppsList = ({ updateResults, selectedServer }) => {
  const [deployments, setDeployments] = useState([]);
  const [expandedDeploymentId, setExpandedDeploymentId] = useState(null);
  const [isUndeploying, setIsUndeploying] = useState(false);
  
  // Load deployments on mount
  useEffect(() => {
    const loadDeployments = () => {
      const deploymentHistory = deploymentManager.getDeploymentHistory();
      setDeployments(deploymentHistory);
    };
    
    loadDeployments();
    
    // Set up event listener for deployment changes
    window.addEventListener('deploymentUpdated', loadDeployments);
    
    return () => {
      window.removeEventListener('deploymentUpdated', loadDeployments);
    };
  }, []);
  
  // Function to show deployment details in results area
  const showDeploymentDetails = (deployment) => {
    updateResults({
      status: 'success',
      message: `Deployment: ${deployment.file.name}`,
      details: `Deployed to ${deployment.server} on ${new Date(deployment.deployedAt).toLocaleString()}`,
      content: deploymentManager.generateDeploymentContent(deployment)
    });
    
    // Toggle expanded state
    setExpandedDeploymentId(
      expandedDeploymentId === deployment.id ? null : deployment.id
    );
  };

  // Function to undeploy an application
  const undeployApplication = async (e, deployment) => {
    e.stopPropagation();
    
    if (!selectedServer) {
      updateResults({
        status: 'warning',
        message: 'Server not selected',
        details: 'Please select a server from the configuration panel to undeploy the application.',
        content: ''
      });
      return;
    }
    
    if (window.confirm(`Are you sure you want to undeploy ${deployment.file.name} from ${deployment.server}?`)) {
      setIsUndeploying(true);
      
      try {
        let result;
        
        // Call the appropriate undeploy function based on server type
        if (deployment.serverType === 'wildfly') {
          result = await undeployFromWildFly(
            deployment.deploymentName,
            selectedServer, 
            updateResults
          );
        } else {
          // Default to Tomcat
          result = await undeployFromTomcat(
            deployment.contextPath, 
            selectedServer, 
            updateResults
          );
        }
        
        if (result) {
          // Mark the deployment as undeployed in our history
          const updatedDeployment = {
            ...deployment,
            undeployed: true,
            undeployedAt: new Date().toISOString()
          };
          
          deploymentManager.updateDeployment(updatedDeployment);
          
          // Update our local state
          setDeployments(deploymentManager.getDeploymentHistory());
          
          // Update results with success
          updateResults({
            status: 'success',
            message: 'Application Undeployed',
            details: `${deployment.file.name} was successfully undeployed from ${deployment.server}`,
            content: `<div class="deploy-log">
              <div class="log-entry">• Undeployment initiated for ${deployment.file.name}</div>
              <div class="log-entry success-entry">• Undeployment successful!</div>
              <div class="log-entry">• Application was removed from ${deployment.contextPath}</div>
            </div>`
          });
        }
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
      } finally {
        setIsUndeploying(false);
      }
    }
  };
  
  // Function to redeploy an application
  const redeployApplication = async (e, deployment) => {
    e.stopPropagation();
    
    if (!selectedServer) {
      updateResults({
        status: 'warning',
        message: 'Server not selected',
        details: 'Please select a server from the configuration panel to redeploy the application.',
        content: ''
      });
      return;
    }
    
    if (window.confirm(`Do you want to redeploy ${deployment.file.name} to ${selectedServer.name}?`)) {
      // Notify parent component to initiate a new deployment with the file details
      window.dispatchEvent(new CustomEvent('redeployApplication', {
        detail: deployment
      }));
    }
  };
  
  // Function to remove a deployment from history
  const removeDeployment = (e, deploymentId) => {
    e.stopPropagation();
    
    if (window.confirm('Remove this deployment from history?')) {
      deploymentManager.removeDeployment(deploymentId);
      setDeployments(deploymentManager.getDeploymentHistory());
      
      // If this was the expanded deployment, clear selection
      if (expandedDeploymentId === deploymentId) {
        setExpandedDeploymentId(null);
      }
    }
  };
  
  // Function to clear all deployment history
  const clearAllDeployments = () => {
    if (window.confirm('Clear all deployment history? This cannot be undone.')) {
      deploymentManager.clearDeploymentHistory();
      setDeployments([]);
      setExpandedDeploymentId(null);
      
      updateResults({
        status: '',
        message: '',
        details: '',
        content: ''
      });
    }
  };
  
  // If no deployments, show message
  if (deployments.length === 0) {
    return (
      <div className="deployed-apps-container">
        <h3>Deployed Applications</h3>
        <div className="no-deployments-message">
          No deployment history found. Deploy an application to see it here.
        </div>
      </div>
    );
  }
  
  return (
    <div className="deployed-apps-container">
      <div className="deployed-apps-header">
        <h3>Deployed Applications</h3>
        <button 
          className="btn-clear-all"
          onClick={clearAllDeployments}
          title="Clear all deployment history"
        >
          Clear All
        </button>
      </div>
      
      <div className="deployments-list">
        {deployments.map(deployment => (
          <div 
            key={deployment.id}
            className={`deployment-item ${expandedDeploymentId === deployment.id ? 'expanded' : ''} ${deployment.undeployed ? 'undeployed' : ''}`}
            onClick={() => showDeploymentDetails(deployment)}
          >
            <div className="deployment-summary">
              <div className={`deployment-icon ${deployment.undeployed ? 'undeployed-icon' : ''}`}>
                {deployment.serverType === 'wildfly' ? 'W' : 'T'}
              </div>
              <div className="deployment-details">
                <div className="deployment-name">
                  {deployment.file.name}
                  {deployment.undeployed && <span className="undeployed-badge">Undeployed</span>}
                </div>
                <div className="deployment-meta">
                  {deployment.server} • {new Date(deployment.deployedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="deployment-actions">
                {!deployment.undeployed && (
                  <>
                    <a 
                      href={deployment.applicationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-open-app"
                      onClick={(e) => e.stopPropagation()}
                      title="Open application in new tab"
                    >
                      Open
                    </a>
                    <button 
                      className="btn-undeploy"
                      onClick={(e) => undeployApplication(e, deployment)}
                      disabled={isUndeploying}
                      title="Undeploy application from server"
                    >
                      {isUndeploying ? '...' : 'Undeploy'}
                    </button>
                  </>
                )}
                {deployment.undeployed && (
                  <button 
                    className="btn-redeploy"
                    onClick={(e) => redeployApplication(e, deployment)}
                    title="Redeploy this application"
                  >
                    Redeploy
                  </button>
                )}
                <button 
                  className="btn-remove-deployment"
                  onClick={(e) => removeDeployment(e, deployment.id)}
                  title="Remove from history"
                >
                  ×
                </button>
              </div>
            </div>
            
            {expandedDeploymentId === deployment.id && (
              <div className="deployment-expanded-details">
                <div className="deployment-info-row">
                  <span className="info-label">Deployment Date:</span>
                  <span className="info-value">{new Date(deployment.deployedAt).toLocaleString()}</span>
                </div>
                {deployment.undeployed && deployment.undeployedAt && (
                  <div className="deployment-info-row">
                    <span className="info-label">Undeployment Date:</span>
                    <span className="info-value">{new Date(deployment.undeployedAt).toLocaleString()}</span>
                  </div>
                )}
                <div className="deployment-info-row">
                  <span className="info-label">File Size:</span>
                  <span className="info-value">{formatFileSize(deployment.file.size)}</span>
                </div>
                <div className="deployment-info-row">
                  <span className="info-label">Server:</span>
                  <span className="info-value">{deployment.server} ({deployment.serverType === 'wildfly' ? 'WildFly' : 'Tomcat'})</span>
                </div>
                <div className="deployment-info-row">
                  <span className="info-label">Context Path:</span>
                  <span className="info-value">{deployment.contextPath}</span>
                </div>
                {!deployment.undeployed && (
                  <div className="deployment-info-row">
                    <span className="info-label">URL:</span>
                    <span className="info-value">
                      <a href={deployment.applicationUrl} target="_blank" rel="noopener noreferrer">{deployment.applicationUrl}</a>
                    </span>
                  </div>
                )}
                <div className="deployment-info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">
                    {deployment.undeployed ? (
                      <span className="status-undeployed">Undeployed</span>
                    ) : (
                      <span className="status-deployed">Deployed</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeployedAppsList;