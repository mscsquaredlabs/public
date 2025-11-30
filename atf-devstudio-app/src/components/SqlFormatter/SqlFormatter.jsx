// SqlFormatter.jsx
// SQL Formatter component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SqlFormatterTab from './SqlFormatterTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './SqlFormatter.css';

const STORAGE_KEY = 'atf-dev-studio-sql-formatter';
const DEFAULT_TAB_TITLE = 'SQL Formatter';

const SqlFormatter = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [formatters, setFormatters] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [formatterStyle, setFormatterStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style formatters
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

  // Load saved formatters and preferences from localStorage
  useEffect(() => {
    try {
      const savedFormatters = localStorage.getItem(STORAGE_KEY);
      if (savedFormatters) {
        const parsedFormatters = JSON.parse(savedFormatters);
        setFormatters(parsedFormatters);
        
        // Set active tab to the first formatter or the last active one
        if (parsedFormatters.length > 0) {
          const lastActive = parsedFormatters.find(f => f.isActive) || parsedFormatters[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.formatterStyle) setFormatterStyle(prefs.formatterStyle);
      }
    } catch (error) {
      console.error('Error loading formatters:', error);
    }
  }, []);

  // Save formatters to localStorage whenever they change
  useEffect(() => {
    if (formatters.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formatters));
        } catch (error) {
          console.error('Error saving formatters to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [formatters]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        formatterStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [formatterStyle]);

  // Automatically create one formatter tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedFormatters = localStorage.getItem(STORAGE_KEY);
    if (savedFormatters && JSON.parse(savedFormatters).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).formatterStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newFormatter = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        sqlInput: '',
        inputType: 'sql',
        formatOptions: {
          language: 'sql',
          indent: '  ',
          uppercase: true,
          linesBetweenQueries: 1
        },
        results: {
          status: '',
          message: '',
          details: '',
          content: ''
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setFormatters([newFormatter]);
      setActiveTabId(newFormatter.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new formatter tab
  const createFormatter = useCallback(() => {
    const headerColor = formatterStyle === 'modern' ? generateModernColor(formatters.length) : '#4f46e5';
    
    const newFormatter = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${formatters.length + 1}`,
      sqlInput: '',
      inputType: 'sql',
      formatOptions: {
        language: 'sql',
        indent: '  ',
        uppercase: true,
        linesBetweenQueries: 1
      },
      results: {
        status: '',
        message: '',
        details: '',
        content: ''
      },
      headerColor: headerColor,
      style: formatterStyle,
      isActive: false,
    };
    
    // Mark all existing formatters as inactive and set new one as active
    const updatedFormatters = formatters.map(f => ({ ...f, isActive: false }));
    updatedFormatters.push({ ...newFormatter, isActive: true });
    
    setFormatters(updatedFormatters);
    setActiveTabId(newFormatter.id);
    showStatusMessage(setStatusMessage, 'New SQL formatter tab created', statusTimeoutRef);
  }, [formatters, formatterStyle, generateModernColor]);

  // Update a formatter's properties
  const updateFormatter = useCallback((id, updates) => {
    setFormatters(formatters => formatters.map(formatter => 
      formatter.id === id ? { ...formatter, ...updates } : formatter
    ));
  }, []);

  // Delete a formatter tab
  const deleteFormatter = useCallback((id) => {
    const updatedFormatters = formatters.filter(formatter => formatter.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedFormatters.length > 0) {
        const newActiveId = updatedFormatters[0].id;
        setActiveTabId(newActiveId);
        setFormatters(updatedFormatters.map((f, index) => ({
          ...f,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = formatterStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newFormatter = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          sqlInput: '',
          inputType: 'sql',
          formatOptions: {
            language: 'sql',
            indent: '  ',
            uppercase: true,
            linesBetweenQueries: 1
          },
          results: {
            status: '',
            message: '',
            details: '',
            content: ''
          },
          headerColor: headerColor,
          style: formatterStyle,
          isActive: true,
        };
        setFormatters([newFormatter]);
        setActiveTabId(newFormatter.id);
        showStatusMessage(setStatusMessage, 'New SQL formatter tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setFormatters(updatedFormatters);
    }
    
    showStatusMessage(setStatusMessage, 'SQL formatter tab closed', statusTimeoutRef);
  }, [formatters, activeTabId, formatterStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setFormatters(formatters => formatters.map(formatter => ({
      ...formatter,
      isActive: formatter.id === id
    })));
  }, []);

  // Clear all formatters (with confirmation)
  const clearAllFormatters = useCallback(() => {
    if (formatters.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all SQL formatter tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = formatterStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newFormatter = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        sqlInput: '',
        inputType: 'sql',
        formatOptions: {
          language: 'sql',
          indent: '  ',
          uppercase: true,
          linesBetweenQueries: 1
        },
        results: {
          status: '',
          message: '',
          details: '',
          content: ''
        },
        headerColor: headerColor,
        style: formatterStyle,
        isActive: true,
      };
      setFormatters([newFormatter]);
      setActiveTabId(newFormatter.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [formatters.length, formatterStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.formatterStyle !== undefined) {
      setFormatterStyle(prefs.formatterStyle);
      // Update existing formatters with new style colors
      if (prefs.formatterStyle === 'modern') {
        setFormatters(formatters => formatters.map((formatter, index) => ({
          ...formatter,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setFormatters(formatters => formatters.map(formatter => ({
          ...formatter,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeFormatter = formatters.find(f => f.id === activeTabId);

  return (
    <div className={`sql-formatter-container ${dashboardDarkMode ? 'dark-mode' : ''} ${formatterStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="sql-formatter-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-formatter-button"
            onClick={createFormatter}
            title="Create a new SQL formatter tab"
          >
            + New Formatter
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={formatterStyle}
              onChange={(value) => {
                setFormatterStyle(value);
                updatePreferences({ formatterStyle: value });
              }}
              name="formatterStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {formatters.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllFormatters}
              title="Close all SQL formatter tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {formatters.length > 0 && (
        <div className="formatter-tabs-container">
          <div className="formatter-tabs">
            {formatters.map((formatter, index) => (
              <div
                key={formatter.id}
                className={`formatter-tab ${formatter.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(formatter.id)}
                style={{
                  borderTopColor: formatter.id === activeTabId ? formatter.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{formatter.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFormatter(formatter.id);
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

      {/* Formatter Content Area */}
      <div className="sql-formatter-area" onClick={() => {
        if (formatters.length === 0) {
          createFormatter();
        }
      }}>
        {activeFormatter ? (
          <SqlFormatterTab
            formatter={activeFormatter}
            updateFormatter={updateFormatter}
            deleteFormatter={deleteFormatter}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            formatterStyle={activeFormatter.style || formatterStyle}
            headerColor={activeFormatter.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No formatter tabs yet. Click here or "New Formatter" to create one.</p>
            <p className="hint">Format, minify, visualize, and convert SQL queries. Also convert CSV, JSON, and XML to SQL.</p>
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

export default SqlFormatter;
