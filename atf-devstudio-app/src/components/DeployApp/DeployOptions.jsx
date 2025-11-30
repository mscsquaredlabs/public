import React from 'react';

/**
 * Component for displaying advanced deployment options
 */
const DeployOptions = ({ 
  configMode, 
  customContextPath, 
  setCustomContextPath, 
  undeployFirst, 
  setUndeployFirst,
  selectedFile,
  isDeploying
}) => {
  // Only render in advanced mode
  if (configMode !== 'advanced') {
    return null;
  }
  
  return (
    <div className="advanced-options">
      <div className="context-path-option">
        <label>Context Path:</label>
        <input 
          type="text" 
          value={customContextPath} 
          onChange={(e) => {
            setCustomContextPath(e.target.value);
            // Save to localStorage
            localStorage.setItem('atf-dev-studio-deploy-context-path', e.target.value);
          }}
          placeholder={selectedFile ? `/${selectedFile.name.replace('.war', '')}` : '/my-application'}
          disabled={isDeploying}
        />
        <small>Leave empty to use WAR filename as context path</small>
      </div>
      
      <div className="checkbox-group">
        <input 
          type="checkbox" 
          id="undeploy-first"
          checked={undeployFirst}
          onChange={(e) => {
            setUndeployFirst(e.target.checked);
            // Save to localStorage
            localStorage.setItem('atf-dev-studio-deploy-undeploy-first', e.target.checked);
          }}
          disabled={isDeploying}
        />
        <label htmlFor="undeploy-first">Undeploy existing application first</label>
      </div>
    </div>
  );
};

export default DeployOptions;