// UrlParser.jsx
// URL Parser component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import UrlParserTab from './UrlParserTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './UrlParser.css';

const STORAGE_KEY = 'atf-dev-studio-url-parser';
const DEFAULT_TAB_TITLE = 'URL Parser';

const UrlParser = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [parsers, setParsers] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [parserStyle, setParserStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style parsers
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

  // Load saved parsers and preferences from localStorage
  useEffect(() => {
    try {
      const savedParsers = localStorage.getItem(STORAGE_KEY);
      if (savedParsers) {
        const parsedParsers = JSON.parse(savedParsers);
        setParsers(parsedParsers);
        
        // Set active tab to the first parser or the last active one
        if (parsedParsers.length > 0) {
          const lastActive = parsedParsers.find(p => p.isActive) || parsedParsers[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.parserStyle) setParserStyle(prefs.parserStyle);
      }
    } catch (error) {
      console.error('Error loading parsers:', error);
    }
  }, []);

  // Save parsers to localStorage whenever they change
  useEffect(() => {
    if (parsers.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsers));
        } catch (error) {
          console.error('Error saving parsers to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [parsers]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        parserStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [parserStyle]);

  // Automatically create one parser tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedParsers = localStorage.getItem(STORAGE_KEY);
    if (savedParsers && JSON.parse(savedParsers).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).parserStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newParser = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        url: '',
        parsedUrl: null,
        errorMessage: '',
        parsingOptions: {
          showQueryParams: true,
          decodeComponents: true,
          autoAddProtocol: true,
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setParsers([newParser]);
      setActiveTabId(newParser.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new parser tab
  const createParser = useCallback(() => {
    const headerColor = parserStyle === 'modern' ? generateModernColor(parsers.length) : '#4f46e5';
    
    const newParser = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${parsers.length + 1}`,
      url: '',
      parsedUrl: null,
      errorMessage: '',
      parsingOptions: {
        showQueryParams: true,
        decodeComponents: true,
        autoAddProtocol: true,
      },
      headerColor: headerColor,
      style: parserStyle,
      isActive: false,
    };
    
    // Mark all existing parsers as inactive and set new one as active
    const updatedParsers = parsers.map(p => ({ ...p, isActive: false }));
    updatedParsers.push({ ...newParser, isActive: true });
    
    setParsers(updatedParsers);
    setActiveTabId(newParser.id);
    showStatusMessage(setStatusMessage, 'New URL parser tab created', statusTimeoutRef);
  }, [parsers, parserStyle, generateModernColor]);

  // Update a parser's properties
  const updateParser = useCallback((id, updates) => {
    setParsers(parsers => parsers.map(parser => 
      parser.id === id ? { ...parser, ...updates } : parser
    ));
  }, []);

  // Delete a parser tab
  const deleteParser = useCallback((id) => {
    const updatedParsers = parsers.filter(parser => parser.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedParsers.length > 0) {
        const newActiveId = updatedParsers[0].id;
        setActiveTabId(newActiveId);
        setParsers(updatedParsers.map((p, index) => ({
          ...p,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = parserStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newParser = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          url: '',
          parsedUrl: null,
          errorMessage: '',
          parsingOptions: {
            showQueryParams: true,
            decodeComponents: true,
            autoAddProtocol: true,
          },
          headerColor: headerColor,
          style: parserStyle,
          isActive: true,
        };
        setParsers([newParser]);
        setActiveTabId(newParser.id);
        showStatusMessage(setStatusMessage, 'New URL parser tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setParsers(updatedParsers);
    }
    
    showStatusMessage(setStatusMessage, 'URL parser tab closed', statusTimeoutRef);
  }, [parsers, activeTabId, parserStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setParsers(parsers => parsers.map(parser => ({
      ...parser,
      isActive: parser.id === id
    })));
  }, []);

  // Clear all parsers (with confirmation)
  const clearAllParsers = useCallback(() => {
    if (parsers.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all URL parser tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = parserStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newParser = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        url: '',
        parsedUrl: null,
        errorMessage: '',
        parsingOptions: {
          showQueryParams: true,
          decodeComponents: true,
          autoAddProtocol: true,
        },
        headerColor: headerColor,
        style: parserStyle,
        isActive: true,
      };
      setParsers([newParser]);
      setActiveTabId(newParser.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [parsers.length, parserStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.parserStyle !== undefined) {
      setParserStyle(prefs.parserStyle);
      // Update existing parsers with new style colors
      if (prefs.parserStyle === 'modern') {
        setParsers(parsers => parsers.map((parser, index) => ({
          ...parser,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setParsers(parsers => parsers.map(parser => ({
          ...parser,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeParser = parsers.find(p => p.id === activeTabId);

  return (
    <div className={`url-parser-container ${dashboardDarkMode ? 'dark-mode' : ''} ${parserStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="url-parser-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-parser-button"
            onClick={createParser}
            title="Create a new URL parser tab"
          >
            + New Parser
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={parserStyle}
              onChange={(value) => {
                setParserStyle(value);
                updatePreferences({ parserStyle: value });
              }}
              name="parserStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {parsers.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllParsers}
              title="Close all URL parser tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {parsers.length > 0 && (
        <div className="parser-tabs-container">
          <div className="parser-tabs">
            {parsers.map((parser, index) => (
              <div
                key={parser.id}
                className={`parser-tab ${parser.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(parser.id)}
                style={{
                  borderTopColor: parser.id === activeTabId ? parser.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{parser.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteParser(parser.id);
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

      {/* Parser Content Area */}
      <div className="url-parser-area" onClick={() => {
        if (parsers.length === 0) {
          createParser();
        }
      }}>
        {activeParser ? (
          <UrlParserTab
            parser={activeParser}
            updateParser={updateParser}
            deleteParser={deleteParser}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            parserStyle={activeParser.style || parserStyle}
            headerColor={activeParser.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No parser tabs yet. Click here or "New Parser" to create one.</p>
            <p className="hint">Break down URLs into their components: protocol, host, port, path, query parameters, and fragment.</p>
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

export default UrlParser;
