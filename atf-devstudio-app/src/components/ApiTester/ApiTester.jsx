// ApiTester.jsx
// API Tester component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ApiTesterTab from './ApiTesterTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './ApiTester.css';
import './ApiTesterAdvanced.css';

const STORAGE_KEY = 'atf-dev-studio-api-tester';
const DEFAULT_TAB_TITLE = 'API Tester';

const ApiTester = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [testers, setTesters] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [testerStyle, setTesterStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style testers
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

  // Load saved testers and preferences from localStorage
  useEffect(() => {
    try {
      const savedTesters = localStorage.getItem(STORAGE_KEY);
      if (savedTesters) {
        const parsedTesters = JSON.parse(savedTesters);
        setTesters(parsedTesters);
        
        if (parsedTesters.length > 0) {
          const lastActive = parsedTesters.find(t => t.isActive) || parsedTesters[0];
          setActiveTabId(lastActive.id);
        }
      }

      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.testerStyle) setTesterStyle(prefs.testerStyle);
      }
    } catch (error) {
      console.error('Error loading testers:', error);
    }
  }, []);

  // Save testers to localStorage whenever they change
  useEffect(() => {
    if (testers.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(testers));
        } catch (error) {
          console.error('Error saving testers to storage:', error);
        }
      };
      
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [testers]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        testerStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [testerStyle]);

  // Automatically create one tester tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedTesters = localStorage.getItem(STORAGE_KEY);
    if (savedTesters && JSON.parse(savedTesters).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).testerStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newTester = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        url: '',
        method: 'GET',
        headers: '{\n  "Content-Type": "application/json"\n}',
        body: '',
        bodyFormat: 'json',
        authType: 'none',
        authDetails: {
          username: '',
          password: '',
          token: '',
          apiKey: '',
          apiKeyName: 'X-API-Key'
        },
        activeTab: 'headers',
        configMode: 'simple',
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setTesters([newTester]);
      setActiveTabId(newTester.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new tester tab
  const createTester = useCallback(() => {
    const headerColor = testerStyle === 'modern' ? generateModernColor(testers.length) : '#4f46e5';
    
    const newTester = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${testers.length + 1}`,
      url: '',
      method: 'GET',
      headers: '{\n  "Content-Type": "application/json"\n}',
      body: '',
      bodyFormat: 'json',
      authType: 'none',
      authDetails: {
        username: '',
        password: '',
        token: '',
        apiKey: '',
        apiKeyName: 'X-API-Key'
      },
      activeTab: 'headers',
      configMode: 'simple',
      headerColor: headerColor,
      style: testerStyle,
      isActive: false,
    };
    
    const updatedTesters = testers.map(t => ({ ...t, isActive: false }));
    updatedTesters.push({ ...newTester, isActive: true });
    
    setTesters(updatedTesters);
    setActiveTabId(newTester.id);
    showStatusMessage(setStatusMessage, 'New API tester tab created', statusTimeoutRef);
  }, [testers, testerStyle, generateModernColor]);

  // Update a tester's properties
  const updateTester = useCallback((id, updates) => {
    setTesters(testers => testers.map(tester => 
      tester.id === id ? { ...tester, ...updates } : tester
    ));
  }, []);

  // Delete a tester tab
  const deleteTester = useCallback((id) => {
    const updatedTesters = testers.filter(tester => tester.id !== id);
    
    if (id === activeTabId) {
      if (updatedTesters.length > 0) {
        const newActiveId = updatedTesters[0].id;
        setActiveTabId(newActiveId);
        setTesters(updatedTesters.map((t, index) => ({
          ...t,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = testerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newTester = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          url: '',
          method: 'GET',
          headers: '{\n  "Content-Type": "application/json"\n}',
          body: '',
          bodyFormat: 'json',
          authType: 'none',
          authDetails: {
            username: '',
            password: '',
            token: '',
            apiKey: '',
            apiKeyName: 'X-API-Key'
          },
          activeTab: 'headers',
          configMode: 'simple',
          headerColor: headerColor,
          style: testerStyle,
          isActive: true,
        };
        setTesters([newTester]);
        setActiveTabId(newTester.id);
        showStatusMessage(setStatusMessage, 'New API tester tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setTesters(updatedTesters);
    }
    
    showStatusMessage(setStatusMessage, 'API tester tab closed', statusTimeoutRef);
  }, [testers, activeTabId, testerStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setTesters(testers => testers.map(tester => ({
      ...tester,
      isActive: tester.id === id
    })));
  }, []);

  // Clear all testers (with confirmation)
  const clearAllTesters = useCallback(() => {
    if (testers.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all API tester tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = testerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newTester = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        url: '',
        method: 'GET',
        headers: '{\n  "Content-Type": "application/json"\n}',
        body: '',
        bodyFormat: 'json',
        authType: 'none',
        authDetails: {
          username: '',
          password: '',
          token: '',
          apiKey: '',
          apiKeyName: 'X-API-Key'
        },
        activeTab: 'headers',
        configMode: 'simple',
        headerColor: headerColor,
        style: testerStyle,
        isActive: true,
      };
      setTesters([newTester]);
      setActiveTabId(newTester.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [testers.length, testerStyle, generateModernColor]);

  const activeTester = testers.find(t => t.id === activeTabId);

  return (
    <div className={`api-tester-container ${dashboardDarkMode ? 'dark-mode' : ''} ${testerStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="api-tester-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-tester-button"
            onClick={createTester}
            title="Create a new API tester tab"
          >
            + New Tester
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={testerStyle}
              onChange={(value) => {
                setTesterStyle(value);
                setTesters(testers => testers.map((tester, index) => ({
                  ...tester,
                  style: value,
                  headerColor: value === 'modern' ? generateModernColor(index) : '#4f46e5'
                })));
              }}
              name="testerStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {testers.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllTesters}
              title="Close all API tester tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {testers.length > 0 && (
        <div className="tester-tabs-container">
          <div className="tester-tabs">
            {testers.map((tester, index) => (
              <div
                key={tester.id}
                className={`tester-tab ${tester.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(tester.id)}
                style={{
                  borderTopColor: tester.id === activeTabId ? tester.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{tester.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTester(tester.id);
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

      {/* Tester Content Area */}
      <div className="api-tester-area" onClick={() => {
        if (testers.length === 0) {
          createTester();
        }
      }}>
        {activeTester ? (
          <ApiTesterTab
            tester={activeTester}
            updateTester={updateTester}
            deleteTester={deleteTester}
            setStatusMessage={(message) => {
              // Check if message contains response data
              if (message.startsWith('RESPONSE:')) {
                try {
                  const data = JSON.parse(message.substring(9));
                  handleResultsUpdate({
                    status: data.status,
                    message: data.message,
                    details: '',
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
            testerStyle={activeTester.style || testerStyle}
            headerColor={activeTester.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No API tester tabs yet. Click here or "New Tester" to create one.</p>
            <p className="hint">Test API endpoints by sending requests and viewing responses. Enter a URL and select a method to get started.</p>
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

export default ApiTester;
