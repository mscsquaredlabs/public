// SqlFiddle.jsx
// SQL Fiddle component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SqlFiddleTab from './SqlFiddleTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './SqlFiddle.css';

const STORAGE_KEY = 'atf-dev-studio-sql-fiddle';
const DEFAULT_TAB_TITLE = 'SQL Fiddle';

const SqlFiddle = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [fiddles, setFiddles] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [fiddleStyle, setFiddleStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style fiddles
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

  // Load saved fiddles and preferences from localStorage
  useEffect(() => {
    try {
      const savedFiddles = localStorage.getItem(STORAGE_KEY);
      if (savedFiddles) {
        const parsedFiddles = JSON.parse(savedFiddles);
        setFiddles(parsedFiddles);
        
        // Set active tab to the first fiddle or the last active one
        if (parsedFiddles.length > 0) {
          const lastActive = parsedFiddles.find(f => f.isActive) || parsedFiddles[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.fiddleStyle) setFiddleStyle(prefs.fiddleStyle);
      }
    } catch (error) {
      console.error('Error loading fiddles:', error);
    }
  }, []);

  // Save fiddles to localStorage whenever they change
  useEffect(() => {
    if (fiddles.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fiddles));
        } catch (error) {
          console.error('Error saving fiddles to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [fiddles]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        fiddleStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [fiddleStyle]);

  // Automatically create one fiddle tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedFiddles = localStorage.getItem(STORAGE_KEY);
    if (savedFiddles && JSON.parse(savedFiddles).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).fiddleStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newFiddle = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        schemaSQL: '',
        querySQL: '',
        activeTab: 'schema',
        formatOnPaste: true,
        autoRunQuery: false,
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setFiddles([newFiddle]);
      setActiveTabId(newFiddle.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new fiddle tab
  const createFiddle = useCallback(() => {
    const headerColor = fiddleStyle === 'modern' ? generateModernColor(fiddles.length) : '#4f46e5';
    
    const newFiddle = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${fiddles.length + 1}`,
      schemaSQL: '',
      querySQL: '',
      activeTab: 'schema',
      formatOnPaste: true,
      autoRunQuery: false,
      headerColor: headerColor,
      style: fiddleStyle,
      isActive: false,
    };
    
    // Mark all existing fiddles as inactive and set new one as active
    const updatedFiddles = fiddles.map(f => ({ ...f, isActive: false }));
    updatedFiddles.push({ ...newFiddle, isActive: true });
    
    setFiddles(updatedFiddles);
    setActiveTabId(newFiddle.id);
    showStatusMessage(setStatusMessage, 'New SQL Fiddle tab created', statusTimeoutRef);
  }, [fiddles, fiddleStyle, generateModernColor]);

  // Update a fiddle's properties
  const updateFiddle = useCallback((id, updates) => {
    setFiddles(fiddles => fiddles.map(fiddle => 
      fiddle.id === id ? { ...fiddle, ...updates } : fiddle
    ));
  }, []);

  // Delete a fiddle tab
  const deleteFiddle = useCallback((id) => {
    const updatedFiddles = fiddles.filter(fiddle => fiddle.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedFiddles.length > 0) {
        const newActiveId = updatedFiddles[0].id;
        setActiveTabId(newActiveId);
        setFiddles(updatedFiddles.map((f, index) => ({
          ...f,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = fiddleStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newFiddle = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          schemaSQL: '',
          querySQL: '',
          activeTab: 'schema',
          formatOnPaste: true,
          autoRunQuery: false,
          headerColor: headerColor,
          style: fiddleStyle,
          isActive: true,
        };
        setFiddles([newFiddle]);
        setActiveTabId(newFiddle.id);
        showStatusMessage(setStatusMessage, 'New SQL Fiddle tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setFiddles(updatedFiddles);
    }
    
    showStatusMessage(setStatusMessage, 'SQL Fiddle tab closed', statusTimeoutRef);
  }, [fiddles, activeTabId, fiddleStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setFiddles(fiddles => fiddles.map(fiddle => ({
      ...fiddle,
      isActive: fiddle.id === id
    })));
  }, []);

  // Clear all fiddles (with confirmation)
  const clearAllFiddles = useCallback(() => {
    if (fiddles.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all SQL Fiddle tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = fiddleStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newFiddle = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        schemaSQL: '',
        querySQL: '',
        activeTab: 'schema',
        formatOnPaste: true,
        autoRunQuery: false,
        headerColor: headerColor,
        style: fiddleStyle,
        isActive: true,
      };
      setFiddles([newFiddle]);
      setActiveTabId(newFiddle.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [fiddles.length, fiddleStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.fiddleStyle !== undefined) {
      setFiddleStyle(prefs.fiddleStyle);
      // Update existing fiddles with new style colors
      if (prefs.fiddleStyle === 'modern') {
        setFiddles(fiddles => fiddles.map((fiddle, index) => ({
          ...fiddle,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setFiddles(fiddles => fiddles.map(fiddle => ({
          ...fiddle,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeFiddle = fiddles.find(f => f.id === activeTabId);

  return (
    <div className={`sql-fiddle-container ${dashboardDarkMode ? 'dark-mode' : ''} ${fiddleStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="sql-fiddle-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-fiddle-button"
            onClick={createFiddle}
            title="Create a new SQL Fiddle tab"
          >
            + New Fiddle
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={fiddleStyle}
              onChange={(value) => {
                setFiddleStyle(value);
                updatePreferences({ fiddleStyle: value });
              }}
              name="fiddleStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {fiddles.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllFiddles}
              title="Close all SQL Fiddle tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {fiddles.length > 0 && (
        <div className="fiddle-tabs-container">
          <div className="fiddle-tabs">
            {fiddles.map((fiddle, index) => (
              <div
                key={fiddle.id}
                className={`fiddle-tab ${fiddle.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(fiddle.id)}
                style={{
                  borderTopColor: fiddle.id === activeTabId ? fiddle.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{fiddle.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFiddle(fiddle.id);
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

      {/* Fiddle Content Area */}
      <div className="sql-fiddle-area" onClick={() => {
        if (fiddles.length === 0) {
          createFiddle();
        }
      }}>
        {activeFiddle ? (
          <SqlFiddleTab
            fiddle={activeFiddle}
            updateFiddle={updateFiddle}
            deleteFiddle={deleteFiddle}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            fiddleStyle={activeFiddle.style || fiddleStyle}
            headerColor={activeFiddle.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No fiddle tabs yet. Click here or "New Fiddle" to create one.</p>
            <p className="hint">SQL Fiddle lets you create an in-memory SQLite database, define tables, and run queries directly in your browser.</p>
          </div>
        )}
      </div>

      {/* Status message - fixed position, bottom right */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default SqlFiddle;
