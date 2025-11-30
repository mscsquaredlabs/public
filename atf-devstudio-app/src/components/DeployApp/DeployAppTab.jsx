// DeployAppTab.jsx
// Tab content for deployment operations

import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import FileUpload from './FileUpload';
import ServerSelector from './ServerSelector';
import DeployOptions from './DeployOptions';
import DeployedAppsList from './DeployedAppsList';
import { deployApplication, deploymentManager, undeployApplication } from './DeploymentManager';
import { AppContext } from '../../AppContext';

const DeployAppTab = ({
  deployer,
  updateDeployer,
  deleteDeployer,
  setStatusMessage,
  darkMode,
  deployerStyle = 'simple',
  headerColor = '#4f46e5',
  servers,
  setServers,
}) => {
  const {
    id,
    title,
    selectedFileInfo,
    selectedServerId,
    customContextPath,
    undeployFirst,
    configMode,
  } = deployer;

  const [currentSelectedFile, setCurrentSelectedFile] = useState(null);
  const [currentSelectedServer, setCurrentSelectedServer] = useState(null);
  const [currentCustomContextPath, setCurrentCustomContextPath] = useState(customContextPath || '');
  const [currentUndeployFirst, setCurrentUndeployFirst] = useState(undeployFirst !== undefined ? undeployFirst : true);
  const [currentConfigMode, setCurrentConfigMode] = useState(configMode || 'simple');
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [isUndeploying, setIsUndeploying] = useState(false);

  const fileInputRef = useRef(null);
  const { currentDeployment, setCurrentDeployment } = useContext(AppContext);

  // Sync with prop changes
  useEffect(() => {
    setCurrentCustomContextPath(customContextPath || '');
    setCurrentUndeployFirst(undeployFirst !== undefined ? undeployFirst : true);
    setCurrentConfigMode(configMode || 'simple');
    
    // Restore selected server
    if (selectedServerId && servers.length > 0) {
      const server = servers.find(s => s.id === selectedServerId);
      if (server) {
        setCurrentSelectedServer(server);
      }
    }
  }, [customContextPath, undeployFirst, configMode, selectedServerId, servers]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateDeployer(id, {
        selectedFileInfo: currentSelectedFile ? {
          name: currentSelectedFile.name,
          size: currentSelectedFile.size,
          type: currentSelectedFile.type,
          lastModified: currentSelectedFile.lastModified
        } : null,
        selectedServerId: currentSelectedServer?.id || null,
        customContextPath: currentCustomContextPath,
        undeployFirst: currentUndeployFirst,
        configMode: currentConfigMode,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentSelectedFile, currentSelectedServer, currentCustomContextPath, currentUndeployFirst, currentConfigMode, updateDeployer]);

  // Handle file selection - FileUpload component calls setSelectedFile directly
  // This wrapper ensures we also update status message
  const handleFileSelect = useCallback((file) => {
    setCurrentSelectedFile(file);
    if (file) {
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      localStorage.setItem(`atf-dev-studio-deploy-file-${id}`, JSON.stringify(fileInfo));
      setStatusMessage?.(`Selected "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    } else {
      localStorage.removeItem(`atf-dev-studio-deploy-file-${id}`);
      setStatusMessage?.('File cleared');
    }
  }, [id, setStatusMessage]);

  // Handle server selection
  const handleServerSelect = useCallback((server) => {
    setCurrentSelectedServer(server);
    if (server) {
      localStorage.setItem(`atf-dev-studio-deploy-server-${id}`, server.id);
      setStatusMessage?.(`Selected server: ${server.name}`);
    }
  }, [id, setStatusMessage]);

  // Handle deployment
  const handleDeploy = useCallback(async () => {
    if (!currentSelectedFile || !currentSelectedServer) {
      setStatusMessage?.('Please select a WAR file and target server');
      return;
    }
    
    setIsDeploying(true);
    
    try {
      const updateResults = (results) => {
        if (results.status === 'success') {
          setStatusMessage?.(results.message || 'Deployment successful');
        } else if (results.status === 'error') {
          setStatusMessage?.(results.message || 'Deployment failed');
        }
      };
      
      await deployApplication(
        currentSelectedFile,
        currentSelectedServer,
        { customContextPath: currentCustomContextPath, undeployFirst: currentUndeployFirst },
        updateResults
      );
      
      window.dispatchEvent(new CustomEvent('deploymentUpdated'));
      setStatusMessage?.('Deployment successful');
    } catch (error) {
      console.error('Deployment error:', error);
      setStatusMessage?.(`Deployment failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
    }
  }, [currentSelectedFile, currentSelectedServer, currentCustomContextPath, currentUndeployFirst, setStatusMessage]);

  // Handle undeployment
  const handleUndeploy = useCallback(async (deployment) => {
    if (!currentSelectedServer) {
      setStatusMessage?.('Please select a target server');
      return;
    }
    
    setIsUndeploying(true);
    
    try {
      const updateResults = (results) => {
        if (results.status === 'success') {
          setStatusMessage?.(results.message || 'Undeployment successful');
        } else if (results.status === 'error') {
          setStatusMessage?.(results.message || 'Undeployment failed');
        }
      };
      
      await undeployApplication(deployment, currentSelectedServer, updateResults);
      window.dispatchEvent(new CustomEvent('deploymentUpdated'));
      setStatusMessage?.('Undeployment successful');
    } catch (error) {
      console.error('Undeployment error:', error);
      setStatusMessage?.(`Undeployment failed: ${error.message}`);
    } finally {
      setIsUndeploying(false);
    }
  }, [currentSelectedServer, setStatusMessage]);

  // Handle redeployment
  const handleRedeploy = useCallback((deploymentInfo) => {
    if (!currentSelectedServer) {
      setStatusMessage?.('Please select a target server');
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
      localStorage.setItem(`atf-dev-studio-redeploy-${id}`, JSON.stringify(deploymentInfo));
    }
  }, [id, currentSelectedServer, setStatusMessage]);

  // Listen for redeployment requests
  useEffect(() => {
    const handleRedeployRequest = (event) => {
      const deploymentInfo = event.detail;
      handleRedeploy(deploymentInfo);
    };
    
    window.addEventListener('redeployApplication', handleRedeployRequest);
    return () => {
      window.removeEventListener('redeployApplication', handleRedeployRequest);
    };
  }, [handleRedeploy]);

  return (
    <div className={`deploy-app-tab-content ${deployerStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="deploy-app-options-section">
        <div className="options-row">
          <div className="option-group">
            <label>Configuration Mode</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`config-mode-${id}`}
                  value="simple"
                  checked={currentConfigMode === 'simple'}
                  onChange={() => setCurrentConfigMode('simple')}
                />
                <span>Simple</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`config-mode-${id}`}
                  value="advanced"
                  checked={currentConfigMode === 'advanced'}
                  onChange={() => setCurrentConfigMode('advanced')}
                />
                <span>Advanced</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Section */}
      <div className="deploy-app-deployment-section">
        <FileUpload
          selectedFile={currentSelectedFile}
          setSelectedFile={handleFileSelect}
          updateResults={(results) => {
            if (results && results.status) {
              setStatusMessage?.(results.message || results.details || '');
            }
          }}
          isDeploying={isDeploying}
          fileInputRef={fileInputRef}
        />

        {currentSelectedFile && (
          <div className="deployment-controls">
            <ServerSelector
              servers={servers}
              selectedServer={currentSelectedServer}
              setSelectedServer={handleServerSelect}
              isDeploying={isDeploying}
            />

            <DeployOptions
              configMode={currentConfigMode}
              customContextPath={currentCustomContextPath}
              setCustomContextPath={setCurrentCustomContextPath}
              undeployFirst={currentUndeployFirst}
              setUndeployFirst={setCurrentUndeployFirst}
              selectedFile={currentSelectedFile}
              isDeploying={isDeploying}
            />

            <div className="deployment-actions">
              <button
                className="action-button deploy-button"
                onClick={handleDeploy}
                disabled={isDeploying || isUndeploying || !currentSelectedServer}
                title={!currentSelectedServer ? "Please select a target server" : "Deploy application"}
              >
                {isDeploying ? (
                  <>
                    <span className="loading-indicator"></span>
                    Deploying...
                  </>
                ) : (
                  `🚀 Deploy to ${currentSelectedServer?.type === 'wildfly' ? 'WildFly' : 'Tomcat'}`
                )}
              </button>

              {currentDeployment && !currentDeployment.undeployed && (
                <button
                  className="secondary-button undeploy-button"
                  onClick={() => handleUndeploy(currentDeployment)}
                  disabled={isDeploying || isUndeploying}
                  title="Undeploy current application"
                >
                  {isUndeploying ? 'Undeploying...' : 'Undeploy'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Deployed Apps List */}
      <DeployedAppsList
        updateResults={(results) => {
          if (results.status) {
            setStatusMessage?.(results.message);
          }
        }}
        selectedServer={currentSelectedServer}
      />
    </div>
  );
};

export default DeployAppTab;

