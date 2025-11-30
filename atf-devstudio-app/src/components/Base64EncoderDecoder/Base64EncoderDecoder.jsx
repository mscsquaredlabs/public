// Base64EncoderDecoder.jsx
// Base64 encoder/decoder component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Base64Tab from './Base64Tab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './Base64EncoderDecoder.css';

const STORAGE_KEY = 'atf-dev-studio-base64-encoder-decoder';
const DEFAULT_TAB_TITLE = 'Base64';

const Base64EncoderDecoder = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [base64s, setBase64s] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [base64Style, setBase64Style] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style base64s
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

  // Load saved base64s and preferences from localStorage
  useEffect(() => {
    try {
      const savedBase64s = localStorage.getItem(STORAGE_KEY);
      if (savedBase64s) {
        const parsedBase64s = JSON.parse(savedBase64s);
        setBase64s(parsedBase64s);
        
        // Set active tab to the first base64 or the last active one
        if (parsedBase64s.length > 0) {
          const lastActive = parsedBase64s.find(b => b.isActive) || parsedBase64s[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.base64Style) setBase64Style(prefs.base64Style);
      }
    } catch (error) {
      console.error('Error loading base64s:', error);
    }
  }, []);

  // Save base64s to localStorage whenever they change
  useEffect(() => {
    if (base64s.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(base64s));
        } catch (error) {
          console.error('Error saving base64s to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [base64s]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        base64Style
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [base64Style]);

  // Automatically create one base64 tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedBase64s = localStorage.getItem(STORAGE_KEY);
    if (savedBase64s && JSON.parse(savedBase64s).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).base64Style || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newBase64 = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        inputText: '',
        outputText: '',
        mode: 'encode',
        errorMessage: '',
        options: {
          urlSafe: false,
          autoExecute: true,
          showLineBreaks: true,
          lineLength: 76,
          autoTrim: false,
          showBinary: false,
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setBase64s([newBase64]);
      setActiveTabId(newBase64.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new base64 tab
  const createBase64 = useCallback(() => {
    const headerColor = base64Style === 'modern' ? generateModernColor(base64s.length) : '#4f46e5';
    
    const newBase64 = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${base64s.length + 1}`,
      inputText: '',
      outputText: '',
      mode: 'encode',
      errorMessage: '',
      options: {
        urlSafe: false,
        autoExecute: true,
        showLineBreaks: true,
        lineLength: 76,
        autoTrim: false,
        showBinary: false,
      },
      headerColor: headerColor,
      style: base64Style,
      isActive: false,
    };
    
    // Mark all existing base64s as inactive and set new one as active
    const updatedBase64s = base64s.map(b => ({ ...b, isActive: false }));
    updatedBase64s.push({ ...newBase64, isActive: true });
    
    setBase64s(updatedBase64s);
    setActiveTabId(newBase64.id);
    showStatusMessage(setStatusMessage, 'New Base64 encoder/decoder tab created', statusTimeoutRef);
  }, [base64s, base64Style, generateModernColor]);

  // Update a base64's properties
  const updateBase64 = useCallback((id, updates) => {
    setBase64s(base64s => base64s.map(base64 => 
      base64.id === id ? { ...base64, ...updates } : base64
    ));
  }, []);

  // Delete a base64 tab
  const deleteBase64 = useCallback((id) => {
    const updatedBase64s = base64s.filter(base64 => base64.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedBase64s.length > 0) {
        const newActiveId = updatedBase64s[0].id;
        setActiveTabId(newActiveId);
        setBase64s(updatedBase64s.map((b, index) => ({
          ...b,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = base64Style === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newBase64 = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          inputText: '',
          outputText: '',
          mode: 'encode',
          errorMessage: '',
          options: {
            urlSafe: false,
            autoExecute: true,
            showLineBreaks: true,
            lineLength: 76,
            autoTrim: false,
            showBinary: false,
          },
          headerColor: headerColor,
          style: base64Style,
          isActive: true,
        };
        setBase64s([newBase64]);
        setActiveTabId(newBase64.id);
        showStatusMessage(setStatusMessage, 'New Base64 encoder/decoder tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setBase64s(updatedBase64s);
    }
    
    showStatusMessage(setStatusMessage, 'Base64 encoder/decoder tab closed', statusTimeoutRef);
  }, [base64s, activeTabId, base64Style, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setBase64s(base64s => base64s.map(base64 => ({
      ...base64,
      isActive: base64.id === id
    })));
  }, []);

  // Clear all base64s (with confirmation)
  const clearAllBase64s = useCallback(() => {
    if (base64s.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all Base64 encoder/decoder tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = base64Style === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newBase64 = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        inputText: '',
        outputText: '',
        mode: 'encode',
        errorMessage: '',
        options: {
          urlSafe: false,
          autoExecute: true,
          showLineBreaks: true,
          lineLength: 76,
          autoTrim: false,
          showBinary: false,
        },
        headerColor: headerColor,
        style: base64Style,
        isActive: true,
      };
      setBase64s([newBase64]);
      setActiveTabId(newBase64.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [base64s.length, base64Style, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.base64Style !== undefined) {
      setBase64Style(prefs.base64Style);
      // Update existing base64s with new style colors
      if (prefs.base64Style === 'modern') {
        setBase64s(base64s => base64s.map((base64, index) => ({
          ...base64,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setBase64s(base64s => base64s.map(base64 => ({
          ...base64,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeBase64 = base64s.find(b => b.id === activeTabId);

  return (
    <div className={`base64-encoder-decoder-container ${dashboardDarkMode ? 'dark-mode' : ''} ${base64Style === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="base64-encoder-decoder-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-base64-button"
            onClick={createBase64}
            title="Create a new Base64 encoder/decoder tab"
          >
            + New Encoder/Decoder
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={base64Style}
              onChange={(value) => {
                setBase64Style(value);
                updatePreferences({ base64Style: value });
              }}
              name="base64Style"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {base64s.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllBase64s}
              title="Close all Base64 encoder/decoder tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {base64s.length > 0 && (
        <div className="base64-tabs-container">
          <div className="base64-tabs">
            {base64s.map((base64, index) => (
              <div
                key={base64.id}
                className={`base64-tab ${base64.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(base64.id)}
                style={{
                  borderTopColor: base64.id === activeTabId ? base64.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{base64.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBase64(base64.id);
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

      {/* Base64 Content Area */}
      <div className="base64-encoder-decoder-area" onClick={() => {
        if (base64s.length === 0) {
          createBase64();
        }
      }}>
        {activeBase64 ? (
          <Base64Tab
            base64={activeBase64}
            updateBase64={updateBase64}
            deleteBase64={deleteBase64}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            base64Style={activeBase64.style || base64Style}
            headerColor={activeBase64.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No encoder/decoder tabs yet. Click here or "New Encoder/Decoder" to create one.</p>
            <p className="hint">Encode text to Base64 format or decode Base64 strings back to plain text.</p>
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

export default Base64EncoderDecoder;
