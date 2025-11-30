// CodeDiffChecker.jsx
// Code diff comparison component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import DiffTab from './DiffTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './CodeDiffChecker.css';

const STORAGE_KEY = 'atf-dev-studio-code-diff-checker';
const DEFAULT_TAB_TITLE = 'Diff';

const CodeDiffChecker = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [diffs, setDiffs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [diffStyle, setDiffStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style diffs
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

  // Load saved diffs and preferences from localStorage
  useEffect(() => {
    try {
      const savedDiffs = localStorage.getItem(STORAGE_KEY);
      if (savedDiffs) {
        const parsedDiffs = JSON.parse(savedDiffs);
        setDiffs(parsedDiffs);
        
        // Set active tab to the first diff or the last active one
        if (parsedDiffs.length > 0) {
          const lastActive = parsedDiffs.find(d => d.isActive) || parsedDiffs[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.diffStyle) setDiffStyle(prefs.diffStyle);
      }
    } catch (error) {
      console.error('Error loading diffs:', error);
    }
  }, []);

  // Automatically create one diff tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return; // Prevent multiple auto-creations
    
    // Check localStorage directly to avoid dependency on diffs state
    const savedDiffs = localStorage.getItem(STORAGE_KEY);
    if (savedDiffs && JSON.parse(savedDiffs).length > 0) {
      hasAutoCreatedRef.current = true;
      return; // Diffs already exist, don't create one
    }
    
    hasAutoCreatedRef.current = true;
    
    // Use setTimeout to ensure state is initialized
    setTimeout(() => {
      // Get current style from localStorage or use default
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).diffStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newDiff = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        originalCode: '',
        modifiedCode: '',
        diffOptions: {
          ignoreWhitespace: false,
          ignoreCase: false,
          showLineNumbers: true,
          contextLines: 3,
          splitView: true,
        },
        diffResults: null,
        diffStats: null,
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setDiffs([newDiff]);
      setActiveTabId(newDiff.id);
    }, 100);
  }, [generateModernColor]); // Only depend on generateModernColor which is now defined before this

  // Save diffs to localStorage whenever they change
  useEffect(() => {
    if (diffs.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(diffs));
        } catch (error) {
          console.error('Error saving diffs to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [diffs]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        diffStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [diffStyle]);

  // Create a new diff tab
  const createDiff = useCallback(() => {
    const headerColor = diffStyle === 'modern' ? generateModernColor(diffs.length) : '#4f46e5';
    
    const newDiff = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${diffs.length + 1}`,
      originalCode: '',
      modifiedCode: '',
      diffOptions: {
        ignoreWhitespace: false,
        ignoreCase: false,
        showLineNumbers: true,
        contextLines: 3,
        splitView: true,
      },
      diffResults: null,
      diffStats: null,
      headerColor: headerColor,
      style: diffStyle,
      isActive: false,
    };
    
    // Mark all existing diffs as inactive and set new one as active
    const updatedDiffs = diffs.map(d => ({ ...d, isActive: false }));
    updatedDiffs.push({ ...newDiff, isActive: true });
    
    setDiffs(updatedDiffs);
    setActiveTabId(newDiff.id);
    showStatusMessage(setStatusMessage, 'New diff tab created', statusTimeoutRef);
  }, [diffs, diffStyle, generateModernColor]);

  // Update a diff's properties
  const updateDiff = useCallback((id, updates) => {
    setDiffs(diffs => diffs.map(diff => 
      diff.id === id ? { ...diff, ...updates } : diff
    ));
  }, []);

  // Delete a diff tab
  const deleteDiff = useCallback((id) => {
    const updatedDiffs = diffs.filter(diff => diff.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedDiffs.length > 0) {
        const newActiveId = updatedDiffs[0].id;
        setActiveTabId(newActiveId);
        setDiffs(updatedDiffs.map((d, index) => ({
          ...d,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = diffStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newDiff = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          originalCode: '',
          modifiedCode: '',
          diffOptions: {
            ignoreWhitespace: false,
            ignoreCase: false,
            showLineNumbers: true,
            contextLines: 3,
            splitView: true,
          },
          diffResults: null,
          diffStats: null,
          headerColor: headerColor,
          style: diffStyle,
          isActive: true,
        };
        setDiffs([newDiff]);
        setActiveTabId(newDiff.id);
        showStatusMessage(setStatusMessage, 'New diff tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setDiffs(updatedDiffs);
    }
    
    showStatusMessage(setStatusMessage, 'Diff tab closed', statusTimeoutRef);
  }, [diffs, activeTabId, diffStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setDiffs(diffs => diffs.map(diff => ({
      ...diff,
      isActive: diff.id === id
    })));
  }, []);

  // Clear all diffs (with confirmation)
  const clearAllDiffs = useCallback(() => {
    if (diffs.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all diff tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      // Create a new tab automatically after clearing all
      const headerColor = diffStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newDiff = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        originalCode: '',
        modifiedCode: '',
        diffOptions: {
          ignoreWhitespace: false,
          ignoreCase: false,
          showLineNumbers: true,
          contextLines: 3,
          splitView: true,
        },
        diffResults: null,
        diffStats: null,
        headerColor: headerColor,
        style: diffStyle,
        isActive: true,
      };
      setDiffs([newDiff]);
      setActiveTabId(newDiff.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [diffs.length, diffStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.diffStyle !== undefined) {
      setDiffStyle(prefs.diffStyle);
      // Update existing diffs with new style colors
      if (prefs.diffStyle === 'modern') {
        setDiffs(diffs => diffs.map((diff, index) => ({
          ...diff,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setDiffs(diffs => diffs.map(diff => ({
          ...diff,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeDiff = diffs.find(d => d.id === activeTabId);

  return (
    <div className={`code-diff-checker-container ${dashboardDarkMode ? 'dark-mode' : ''} ${diffStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="code-diff-checker-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-diff-button"
            onClick={createDiff}
            title="Create a new code diff comparison tab"
          >
            + New Diff
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={diffStyle}
              onChange={(value) => {
                setDiffStyle(value);
                updatePreferences({ diffStyle: value });
              }}
              name="diffStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {diffs.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllDiffs}
              title="Close all diff tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {diffs.length > 0 && (
        <div className="diff-tabs-container">
          <div className="diff-tabs">
            {diffs.map((diff, index) => (
              <div
                key={diff.id}
                className={`diff-tab ${diff.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(diff.id)}
                style={{
                  borderTopColor: diff.id === activeTabId ? diff.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{diff.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDiff(diff.id);
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

      {/* Diff Content Area */}
      <div className="code-diff-checker-area" onClick={() => {
        // If no tabs exist when clicking the area, create one
        if (diffs.length === 0) {
          createDiff();
        }
      }}>
        {activeDiff ? (
          <DiffTab
            diff={activeDiff}
            updateDiff={updateDiff}
            deleteDiff={deleteDiff}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            diffStyle={activeDiff.style || diffStyle}
            headerColor={activeDiff.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No diff tabs yet. Click here or "New Diff" to create one.</p>
            <p className="hint">Compare two versions of code and highlight differences.</p>
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

export default CodeDiffChecker;
