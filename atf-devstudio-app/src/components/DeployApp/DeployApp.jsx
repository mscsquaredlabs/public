// DeployApp.jsx
// Deploy App component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DeployAppTab from './DeployAppTab';
import DeployAppConfig from './DeployAppConfig';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import { deploymentManager } from './DeploymentManager';
import './DeployApp.css';

const STORAGE_KEY = 'atf-dev-studio-deploy-app';
const DEFAULT_TAB_TITLE = 'Deploy App';

const DeployApp = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [deployers, setDeployers] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [deployerStyle, setDeployerStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);
  const [configContainer, setConfigContainer] = useState(null);

  // Load servers from localStorage
  const [servers, setServers] = useState(() => {
    const savedServers = localStorage.getItem('atf-dev-studio-tomcat-servers');
    if (savedServers) {
      try {
        const parsedServers = JSON.parse(savedServers);
        return parsedServers.map(server => ({
          ...server,
          type: server.type || 'tomcat'
        }));
      } catch (e) {
        console.error('Failed to parse saved servers', e);
        return [
          { id: 'server1', name: 'Local Tomcat', url: 'http://localhost:8080/manager', username: 'ctoatf', password: 'pa55word$1', type: 'tomcat' }
        ];
      }
    } else {
      return [
        { id: 'server1', name: 'Local Tomcat', url: 'http://localhost:8080/manager', username: 'ctoatf', password: 'pa55word$1', type: 'tomcat' },
        { id: 'server2', name: 'Local WildFly', url: 'http://localhost:9990/management', username: 'admin', password: 'admin123', type: 'wildfly' }
      ];
    }
  });

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved deployers and preferences from localStorage
  useEffect(() => {
    try {
      const savedDeployers = localStorage.getItem(STORAGE_KEY);
      if (savedDeployers) {
        const parsedDeployers = JSON.parse(savedDeployers);
        setDeployers(parsedDeployers);
        
        if (parsedDeployers.length > 0) {
          const lastActive = parsedDeployers.find(d => d.isActive) || parsedDeployers[0];
          setActiveTabId(lastActive.id);
        }
      }

      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.deployerStyle) setDeployerStyle(prefs.deployerStyle);
      }
    } catch (error) {
      console.error('Error loading deployers:', error);
    }
  }, []);

  // Save deployers to localStorage whenever they change
  useEffect(() => {
    if (deployers.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(deployers));
        } catch (error) {
          console.error('Error saving deployers to storage:', error);
        }
      };
      
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [deployers]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        deployerStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [deployerStyle]);

  // Save servers to localStorage when they change
  useEffect(() => {
    localStorage.setItem('atf-dev-studio-tomcat-servers', JSON.stringify(servers));
  }, [servers]);

  // Generate color for modern style deployers
  const generateModernColor = useCallback((index) => {
    const colors = [
      '#4f46e5', // indigo
      '#7c3aed', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#ef4444', // red
      '#14b8a6', // teal
      '#8b5cf6', // purple
      '#f97316', // orange
    ];
    return colors[index % colors.length];
  }, []);

  // Automatically create one deployer tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedDeployers = localStorage.getItem(STORAGE_KEY);
    if (savedDeployers && JSON.parse(savedDeployers).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).deployerStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newDeployer = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        selectedFileInfo: null,
        selectedServerId: null,
        customContextPath: '',
        undeployFirst: true,
        configMode: 'simple',
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setDeployers([newDeployer]);
      setActiveTabId(newDeployer.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new deployer tab
  const createDeployer = useCallback(() => {
    const headerColor = deployerStyle === 'modern' ? generateModernColor(deployers.length) : '#4f46e5';
    
    const newDeployer = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${deployers.length + 1}`,
      selectedFileInfo: null,
      selectedServerId: null,
      customContextPath: '',
      undeployFirst: true,
      configMode: 'simple',
      headerColor: headerColor,
      style: deployerStyle,
      isActive: false,
    };
    
    const updatedDeployers = deployers.map(d => ({ ...d, isActive: false }));
    updatedDeployers.push({ ...newDeployer, isActive: true });
    
    setDeployers(updatedDeployers);
    setActiveTabId(newDeployer.id);
    showStatusMessage(setStatusMessage, 'New deployment tab created', statusTimeoutRef);
  }, [deployers, deployerStyle, generateModernColor]);

  // Update a deployer's properties
  const updateDeployer = useCallback((id, updates) => {
    setDeployers(deployers => deployers.map(deployer => 
      deployer.id === id ? { ...deployer, ...updates } : deployer
    ));
  }, []);

  // Delete a deployer tab
  const deleteDeployer = useCallback((id) => {
    const updatedDeployers = deployers.filter(deployer => deployer.id !== id);
    
    if (id === activeTabId) {
      if (updatedDeployers.length > 0) {
        const newActiveId = updatedDeployers[0].id;
        setActiveTabId(newActiveId);
        setDeployers(updatedDeployers.map((d, index) => ({
          ...d,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = deployerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newDeployer = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          selectedFileInfo: null,
          selectedServerId: null,
          customContextPath: '',
          undeployFirst: true,
          configMode: 'simple',
          headerColor: headerColor,
          style: deployerStyle,
          isActive: true,
        };
        setDeployers([newDeployer]);
        setActiveTabId(newDeployer.id);
        showStatusMessage(setStatusMessage, 'New deployment tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setDeployers(updatedDeployers);
    }
    
    showStatusMessage(setStatusMessage, 'Deployment tab closed', statusTimeoutRef);
  }, [deployers, activeTabId, deployerStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setDeployers(deployers => deployers.map(deployer => ({
      ...deployer,
      isActive: deployer.id === id
    })));
  }, []);

  // Clear all deployers (with confirmation)
  const clearAllDeployers = useCallback(() => {
    if (deployers.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all deployment tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = deployerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newDeployer = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        selectedFileInfo: null,
        selectedServerId: null,
        customContextPath: '',
        undeployFirst: true,
        configMode: 'simple',
        headerColor: headerColor,
        style: deployerStyle,
        isActive: true,
      };
      setDeployers([newDeployer]);
      setActiveTabId(newDeployer.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [deployers.length, deployerStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.deployerStyle !== undefined) {
      setDeployerStyle(prefs.deployerStyle);
      if (prefs.deployerStyle === 'modern') {
        setDeployers(deployers => deployers.map((deployer, index) => ({
          ...deployer,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setDeployers(deployers => deployers.map(deployer => ({
          ...deployer,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  // Find the config container element when component mounts or config panel opens
  useEffect(() => {
    if (configPanelOpen) {
      const container = document.querySelector('.config-content');
      if (container) {
        container.style.pointerEvents = 'auto';
        setConfigContainer(container);
      }
    } else {
      const c = document.querySelector('.config-content');
      if (c) c.style.pointerEvents = '';
    }
  }, [configPanelOpen]);

  // Config Panel component
  const ConfigPanel = useCallback(() => {
    if (!configPanelOpen || !configContainer) return null;

    return createPortal(
      <DeployAppConfig
        servers={servers}
        setServers={setServers}
        selectedServer={null}
        setSelectedServer={() => {}}
        configMode="simple"
        setConfigMode={() => {}}
        customContextPath=""
        setCustomContextPath={() => {}}
        undeployFirst={true}
        setUndeployFirst={() => {}}
        updateResults={handleResultsUpdate}
      />,
      configContainer
    );
  }, [configPanelOpen, configContainer, servers, setServers, handleResultsUpdate]);

  const activeDeployer = deployers.find(d => d.id === activeTabId);

  return (
    <div className={`deploy-app-container ${dashboardDarkMode ? 'dark-mode' : ''} ${deployerStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="deploy-app-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-deployer-button"
            onClick={createDeployer}
            title="Create a new deployment tab"
          >
            + New Deployment
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={deployerStyle}
              onChange={(value) => {
                setDeployerStyle(value);
                updatePreferences({ deployerStyle: value });
              }}
              name="deployerStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {deployers.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllDeployers}
              title="Close all deployment tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {deployers.length > 0 && (
        <div className="deployer-tabs-container">
          <div className="deployer-tabs">
            {deployers.map((deployer, index) => (
              <div
                key={deployer.id}
                className={`deployer-tab ${deployer.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(deployer.id)}
                style={{
                  borderTopColor: deployer.id === activeTabId ? deployer.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{deployer.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDeployer(deployer.id);
                  }}
                  title="Close tab"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deployer Content Area */}
      <div className="deploy-app-area" onClick={() => {
        if (deployers.length === 0) {
          createDeployer();
        }
      }}>
        {activeDeployer ? (
          <DeployAppTab
            deployer={activeDeployer}
            updateDeployer={updateDeployer}
            deleteDeployer={deleteDeployer}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            deployerStyle={activeDeployer.style || deployerStyle}
            headerColor={activeDeployer.headerColor}
            servers={servers}
            setServers={setServers}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No deployment tabs yet. Click here or "New Deployment" to create one.</p>
            <p className="hint">Upload and deploy WAR files to Tomcat or WildFly servers. Configure your servers in the Settings panel (⚙️).</p>
          </div>
        )}
      </div>

      {/* Status message - fixed position, bottom right */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}

      {/* Render config panel using createPortal */}
      <ConfigPanel />
    </div>
  );
};

export default DeployApp;
