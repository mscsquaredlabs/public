// NetworkInspector.jsx
// Network Inspector component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import NetworkInspectorTab from './NetworkInspectorTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './NetworkInspector.css';

const STORAGE_KEY = 'atf-dev-studio-network-inspector';
const DEFAULT_TAB_TITLE = 'Network Inspector';

const NetworkInspector = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [inspectors, setInspectors] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [inspectorStyle, setInspectorStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style inspectors
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

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved inspectors and preferences from localStorage
  useEffect(() => {
    try {
      const savedInspectors = localStorage.getItem(STORAGE_KEY);
      if (savedInspectors) {
        const parsedInspectors = JSON.parse(savedInspectors);
        setInspectors(parsedInspectors);
        
        if (parsedInspectors.length > 0) {
          const lastActive = parsedInspectors.find(i => i.isActive) || parsedInspectors[0];
          setActiveTabId(lastActive.id);
        }
      }

      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.inspectorStyle) setInspectorStyle(prefs.inspectorStyle);
      }
    } catch (error) {
      console.error('Error loading inspectors:', error);
    }
  }, []);

  // Save inspectors to localStorage whenever they change
  useEffect(() => {
    if (inspectors.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(inspectors));
        } catch (error) {
          console.error('Error saving inspectors to storage:', error);
        }
      };
      
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [inspectors]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        inspectorStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [inspectorStyle]);

  // Automatically create one inspector tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedInspectors = localStorage.getItem(STORAGE_KEY);
    if (savedInspectors && JSON.parse(savedInspectors).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).inspectorStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newInspector = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        url: '',
        method: 'GET',
        headers: 'Accept: application/json',
        body: '',
        activeTab: 'headers',
        configMode: 'simple',
        autoFormat: true,
        showRawResponse: false,
        includeCredentials: true,
        defaultHeaders: 'Accept: application/json\nContent-Type: application/json',
        useMockResponse: false,
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setInspectors([newInspector]);
      setActiveTabId(newInspector.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new inspector tab
  const createInspector = useCallback(() => {
    const headerColor = inspectorStyle === 'modern' ? generateModernColor(inspectors.length) : '#4f46e5';
    
    const newInspector = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${inspectors.length + 1}`,
      url: '',
      method: 'GET',
      headers: 'Accept: application/json',
      body: '',
      activeTab: 'headers',
      configMode: 'simple',
      autoFormat: true,
      showRawResponse: false,
      includeCredentials: true,
      defaultHeaders: 'Accept: application/json\nContent-Type: application/json',
      useMockResponse: false,
      headerColor: headerColor,
      style: inspectorStyle,
      isActive: false,
    };
    
    const updatedInspectors = inspectors.map(i => ({ ...i, isActive: false }));
    updatedInspectors.push({ ...newInspector, isActive: true });
    
    setInspectors(updatedInspectors);
    setActiveTabId(newInspector.id);
    showStatusMessage(setStatusMessage, 'New network inspector tab created', statusTimeoutRef);
  }, [inspectors, inspectorStyle, generateModernColor]);

  // Update an inspector's properties
  const updateInspector = useCallback((id, updates) => {
    setInspectors(inspectors => inspectors.map(inspector => 
      inspector.id === id ? { ...inspector, ...updates } : inspector
    ));
  }, []);

  // Delete an inspector tab
  const deleteInspector = useCallback((id) => {
    const updatedInspectors = inspectors.filter(inspector => inspector.id !== id);
    
    if (id === activeTabId) {
      if (updatedInspectors.length > 0) {
        const newActiveId = updatedInspectors[0].id;
        setActiveTabId(newActiveId);
        setInspectors(updatedInspectors.map((i, index) => ({
          ...i,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = inspectorStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newInspector = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          url: '',
          method: 'GET',
          headers: 'Accept: application/json',
          body: '',
          activeTab: 'headers',
          configMode: 'simple',
          autoFormat: true,
          showRawResponse: false,
          includeCredentials: true,
          defaultHeaders: 'Accept: application/json\nContent-Type: application/json',
          useMockResponse: false,
          headerColor: headerColor,
          style: inspectorStyle,
          isActive: true,
        };
        setInspectors([newInspector]);
        setActiveTabId(newInspector.id);
        showStatusMessage(setStatusMessage, 'New network inspector tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setInspectors(updatedInspectors);
    }
    
    showStatusMessage(setStatusMessage, 'Network inspector tab closed', statusTimeoutRef);
  }, [inspectors, activeTabId, inspectorStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setInspectors(inspectors => inspectors.map(inspector => ({
      ...inspector,
      isActive: inspector.id === id
    })));
  }, []);

  // Clear all inspectors (with confirmation)
  const clearAllInspectors = useCallback(() => {
    if (inspectors.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all network inspector tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = inspectorStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newInspector = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        url: '',
        method: 'GET',
        headers: 'Accept: application/json',
        body: '',
        activeTab: 'headers',
        configMode: 'simple',
        autoFormat: true,
        showRawResponse: false,
        includeCredentials: true,
        defaultHeaders: 'Accept: application/json\nContent-Type: application/json',
        useMockResponse: false,
        headerColor: headerColor,
        style: inspectorStyle,
        isActive: true,
      };
      setInspectors([newInspector]);
      setActiveTabId(newInspector.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [inspectors.length, inspectorStyle, generateModernColor]);

  const activeInspector = inspectors.find(i => i.id === activeTabId);

  return (
    <div className={`network-inspector-container ${dashboardDarkMode ? 'dark-mode' : ''} ${inspectorStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="network-inspector-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-inspector-button"
            onClick={createInspector}
            title="Create a new network inspector tab"
          >
            + New Inspector
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={inspectorStyle}
              onChange={(value) => {
                setInspectorStyle(value);
                setInspectors(inspectors => inspectors.map((inspector, index) => ({
                  ...inspector,
                  style: value,
                  headerColor: value === 'modern' ? generateModernColor(index) : '#4f46e5'
                })));
              }}
              name="inspectorStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {inspectors.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllInspectors}
              title="Close all network inspector tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {inspectors.length > 0 && (
        <div className="inspector-tabs-container">
          <div className="inspector-tabs">
            {inspectors.map((inspector, index) => (
              <div
                key={inspector.id}
                className={`inspector-tab ${inspector.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(inspector.id)}
                style={{
                  borderTopColor: inspector.id === activeTabId ? inspector.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{inspector.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteInspector(inspector.id);
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

      {/* Inspector Content Area */}
      <div className="network-inspector-area" onClick={() => {
        if (inspectors.length === 0) {
          createInspector();
        }
      }}>
        {activeInspector ? (
          <NetworkInspectorTab
            inspector={activeInspector}
            updateInspector={updateInspector}
            deleteInspector={deleteInspector}
            setStatusMessage={(message) => {
              // Check if message contains response data
              if (message.startsWith('RESPONSE:')) {
                try {
                  const data = JSON.parse(message.substring(9));
                  handleResultsUpdate({
                    status: data.status,
                    message: data.message,
                    details: data.details || '',
                    content: data.content
                  });
                  showStatusMessage(setStatusMessage, data.message, statusTimeoutRef);
                } catch (e) {
                  showStatusMessage(setStatusMessage, message, statusTimeoutRef);
                }
              } else {
                showStatusMessage(setStatusMessage, message, statusTimeoutRef);
              }
            }}
            darkMode={dashboardDarkMode}
            inspectorStyle={activeInspector.style || inspectorStyle}
            headerColor={activeInspector.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No network inspector tabs yet. Click here or "New Inspector" to create one.</p>
            <p className="hint">Inspect HTTP requests and responses with detailed headers, timing information, and body content.</p>
          </div>
        )}
      </div>

      {/* Status message - fixed position, bottom right */}
      {statusMessage && (
        <div className={`status-message ${dashboardDarkMode ? 'dark-mode' : ''}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default NetworkInspector;
