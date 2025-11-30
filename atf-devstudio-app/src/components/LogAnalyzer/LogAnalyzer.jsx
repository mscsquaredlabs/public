// LogAnalyzer.jsx
// Log Analyzer component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import LogAnalyzerTab from './LogAnalyzerTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './LogAnalyzer.css';

const STORAGE_KEY = 'atf-dev-studio-log-analyzer';
const DEFAULT_TAB_TITLE = 'Log Analyzer';

const LogAnalyzer = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [analyzers, setAnalyzers] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [analyzerStyle, setAnalyzerStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style analyzers
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

  // Load saved analyzers and preferences from localStorage
  useEffect(() => {
    try {
      const savedAnalyzers = localStorage.getItem(STORAGE_KEY);
      if (savedAnalyzers) {
        const parsedAnalyzers = JSON.parse(savedAnalyzers);
        setAnalyzers(parsedAnalyzers);
        
        if (parsedAnalyzers.length > 0) {
          const lastActive = parsedAnalyzers.find(a => a.isActive) || parsedAnalyzers[0];
          setActiveTabId(lastActive.id);
        }
      }

      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.analyzerStyle) setAnalyzerStyle(prefs.analyzerStyle);
      }
    } catch (error) {
      console.error('Error loading analyzers:', error);
    }
  }, []);

  // Save analyzers to localStorage whenever they change
  useEffect(() => {
    if (analyzers.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(analyzers));
        } catch (error) {
          console.error('Error saving analyzers to storage:', error);
        }
      };
      
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [analyzers]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        analyzerStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [analyzerStyle]);

  // Automatically create one analyzer tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedAnalyzers = localStorage.getItem(STORAGE_KEY);
    if (savedAnalyzers && JSON.parse(savedAnalyzers).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).analyzerStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newAnalyzer = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        logInput: '',
        logFormat: 'auto',
        configMode: 'simple',
        displayOptions: {
          showLineNumbers: true,
          wrapLines: true,
          highlightLevels: true
        },
        parsingOptions: {
          expandJson: true,
          groupRelated: false
        },
        filters: {
          search: '',
          logLevel: 'all',
          timeRange: {
            start: '',
            end: ''
          }
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setAnalyzers([newAnalyzer]);
      setActiveTabId(newAnalyzer.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new analyzer tab
  const createAnalyzer = useCallback(() => {
    const headerColor = analyzerStyle === 'modern' ? generateModernColor(analyzers.length) : '#4f46e5';
    
    const newAnalyzer = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${analyzers.length + 1}`,
      logInput: '',
      logFormat: 'auto',
      configMode: 'simple',
      displayOptions: {
        showLineNumbers: true,
        wrapLines: true,
        highlightLevels: true
      },
      parsingOptions: {
        expandJson: true,
        groupRelated: false
      },
      filters: {
        search: '',
        logLevel: 'all',
        timeRange: {
          start: '',
          end: ''
        }
      },
      headerColor: headerColor,
      style: analyzerStyle,
      isActive: false,
    };
    
    const updatedAnalyzers = analyzers.map(a => ({ ...a, isActive: false }));
    updatedAnalyzers.push({ ...newAnalyzer, isActive: true });
    
    setAnalyzers(updatedAnalyzers);
    setActiveTabId(newAnalyzer.id);
    showStatusMessage(setStatusMessage, 'New log analyzer tab created', statusTimeoutRef);
  }, [analyzers, analyzerStyle, generateModernColor]);

  // Update an analyzer's properties
  const updateAnalyzer = useCallback((id, updates) => {
    setAnalyzers(analyzers => analyzers.map(analyzer => 
      analyzer.id === id ? { ...analyzer, ...updates } : analyzer
    ));
  }, []);

  // Delete an analyzer tab
  const deleteAnalyzer = useCallback((id) => {
    const updatedAnalyzers = analyzers.filter(analyzer => analyzer.id !== id);
    
    if (id === activeTabId) {
      if (updatedAnalyzers.length > 0) {
        const newActiveId = updatedAnalyzers[0].id;
        setActiveTabId(newActiveId);
        setAnalyzers(updatedAnalyzers.map((a, index) => ({
          ...a,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = analyzerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newAnalyzer = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          logInput: '',
          logFormat: 'auto',
          configMode: 'simple',
          displayOptions: {
            showLineNumbers: true,
            wrapLines: true,
            highlightLevels: true
          },
          parsingOptions: {
            expandJson: true,
            groupRelated: false
          },
          filters: {
            search: '',
            logLevel: 'all',
            timeRange: {
              start: '',
              end: ''
            }
          },
          headerColor: headerColor,
          style: analyzerStyle,
          isActive: true,
        };
        setAnalyzers([newAnalyzer]);
        setActiveTabId(newAnalyzer.id);
        showStatusMessage(setStatusMessage, 'New log analyzer tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setAnalyzers(updatedAnalyzers);
    }
    
    showStatusMessage(setStatusMessage, 'Log analyzer tab closed', statusTimeoutRef);
  }, [analyzers, activeTabId, analyzerStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setAnalyzers(analyzers => analyzers.map(analyzer => ({
      ...analyzer,
      isActive: analyzer.id === id
    })));
  }, []);

  // Clear all analyzers (with confirmation)
  const clearAllAnalyzers = useCallback(() => {
    if (analyzers.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all log analyzer tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = analyzerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newAnalyzer = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        logInput: '',
        logFormat: 'auto',
        configMode: 'simple',
        displayOptions: {
          showLineNumbers: true,
          wrapLines: true,
          highlightLevels: true
        },
        parsingOptions: {
          expandJson: true,
          groupRelated: false
        },
        filters: {
          search: '',
          logLevel: 'all',
          timeRange: {
            start: '',
            end: ''
          }
        },
        headerColor: headerColor,
        style: analyzerStyle,
        isActive: true,
      };
      setAnalyzers([newAnalyzer]);
      setActiveTabId(newAnalyzer.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [analyzers.length, analyzerStyle, generateModernColor]);

  const activeAnalyzer = analyzers.find(a => a.id === activeTabId);

  return (
    <div className={`log-analyzer-container ${dashboardDarkMode ? 'dark-mode' : ''} ${analyzerStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="log-analyzer-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-analyzer-button"
            onClick={createAnalyzer}
            title="Create a new log analyzer tab"
          >
            + New Analyzer
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={analyzerStyle}
              onChange={(value) => {
                setAnalyzerStyle(value);
                setAnalyzers(analyzers => analyzers.map((analyzer, index) => ({
                  ...analyzer,
                  style: value,
                  headerColor: value === 'modern' ? generateModernColor(index) : '#4f46e5'
                })));
              }}
              name="analyzerStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {analyzers.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllAnalyzers}
              title="Close all log analyzer tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {analyzers.length > 0 && (
        <div className="analyzer-tabs-container">
          <div className="analyzer-tabs">
            {analyzers.map((analyzer, index) => (
              <div
                key={analyzer.id}
                className={`analyzer-tab ${analyzer.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(analyzer.id)}
                style={{
                  borderTopColor: analyzer.id === activeTabId ? analyzer.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{analyzer.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAnalyzer(analyzer.id);
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

      {/* Analyzer Content Area */}
      <div className="log-analyzer-area" onClick={() => {
        if (analyzers.length === 0) {
          createAnalyzer();
        }
      }}>
        {activeAnalyzer ? (
          <LogAnalyzerTab
            analyzer={activeAnalyzer}
            updateAnalyzer={updateAnalyzer}
            deleteAnalyzer={deleteAnalyzer}
            setStatusMessage={(message) => {
              // Check if message contains analysis data
              if (message.startsWith('ANALYZE:')) {
                try {
                  const data = JSON.parse(message.substring(8));
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
            analyzerStyle={activeAnalyzer.style || analyzerStyle}
            headerColor={activeAnalyzer.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No log analyzer tabs yet. Click here or "New Analyzer" to create one.</p>
            <p className="hint">Analyze log files with syntax highlighting, filtering, and pattern recognition. Supports multiple log formats.</p>
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

export default LogAnalyzer;
