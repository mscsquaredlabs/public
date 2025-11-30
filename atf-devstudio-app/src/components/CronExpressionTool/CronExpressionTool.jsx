// CronExpressionTool.jsx
// Cron Expression Tool component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import CronTab from './CronTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './CronExpressionTool.css';

const STORAGE_KEY = 'atf-dev-studio-cron-expression-tool';
const DEFAULT_TAB_TITLE = 'Cron';

const CronExpressionTool = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [crons, setCrons] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [cronStyle, setCronStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style crons
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

  // Load saved crons and preferences from localStorage
  useEffect(() => {
    try {
      const savedCrons = localStorage.getItem(STORAGE_KEY);
      if (savedCrons) {
        const parsedCrons = JSON.parse(savedCrons);
        
        // Convert date strings back to Date objects in explanationResult.nextExecutions
        const restoredCrons = parsedCrons.map(cron => {
          if (cron.explanationResult && cron.explanationResult.nextExecutions) {
            return {
              ...cron,
              explanationResult: {
                ...cron.explanationResult,
                nextExecutions: cron.explanationResult.nextExecutions.map(dateStr => {
                  // If it's already a Date object, return it; otherwise convert string to Date
                  if (dateStr instanceof Date) {
                    return dateStr;
                  }
                  // Handle both ISO strings and other date formats
                  const dateObj = new Date(dateStr);
                  return isNaN(dateObj.getTime()) ? null : dateObj;
                }).filter(Boolean) // Remove any invalid dates
              }
            };
          }
          return cron;
        });
        
        setCrons(restoredCrons);
        
        // Set active tab to the first cron or the last active one
        if (restoredCrons.length > 0) {
          const lastActive = restoredCrons.find(c => c.isActive) || restoredCrons[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.cronStyle) setCronStyle(prefs.cronStyle);
      }
    } catch (error) {
      console.error('Error loading crons:', error);
    }
  }, []);

  // Save crons to localStorage whenever they change
  useEffect(() => {
    if (crons.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(crons));
        } catch (error) {
          console.error('Error saving crons to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [crons]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        cronStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [cronStyle]);

  // Automatically create one cron tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedCrons = localStorage.getItem(STORAGE_KEY);
    if (savedCrons && JSON.parse(savedCrons).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).cronStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newCron = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        cronExpression: '* * * * *',
        mode: 'explain',
        explanationResult: null,
        errorMessage: '',
        generateFields: {
          minutes: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '59' }, every: { start: '0', step: '1' } },
          hours: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '23' }, every: { start: '0', step: '1' } },
          dayOfMonth: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '31' }, every: { start: '1', step: '1' } },
          month: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '12' }, every: { start: '1', step: '1' } },
          dayOfWeek: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '6' }, every: { start: '0', step: '1' } },
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setCrons([newCron]);
      setActiveTabId(newCron.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new cron tab
  const createCron = useCallback(() => {
    const headerColor = cronStyle === 'modern' ? generateModernColor(crons.length) : '#4f46e5';
    
    const newCron = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${crons.length + 1}`,
      cronExpression: '* * * * *',
      mode: 'explain',
      explanationResult: null,
      errorMessage: '',
      generateFields: {
        minutes: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '59' }, every: { start: '0', step: '1' } },
        hours: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '23' }, every: { start: '0', step: '1' } },
        dayOfMonth: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '31' }, every: { start: '1', step: '1' } },
        month: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '12' }, every: { start: '1', step: '1' } },
        dayOfWeek: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '6' }, every: { start: '0', step: '1' } },
      },
      headerColor: headerColor,
      style: cronStyle,
      isActive: false,
    };
    
    // Mark all existing crons as inactive and set new one as active
    const updatedCrons = crons.map(c => ({ ...c, isActive: false }));
    updatedCrons.push({ ...newCron, isActive: true });
    
    setCrons(updatedCrons);
    setActiveTabId(newCron.id);
    showStatusMessage(setStatusMessage, 'New Cron expression tab created', statusTimeoutRef);
  }, [crons, cronStyle, generateModernColor]);

  // Update a cron's properties
  const updateCron = useCallback((id, updates) => {
    setCrons(crons => crons.map(cron => 
      cron.id === id ? { ...cron, ...updates } : cron
    ));
  }, []);

  // Delete a cron tab
  const deleteCron = useCallback((id) => {
    const updatedCrons = crons.filter(cron => cron.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedCrons.length > 0) {
        const newActiveId = updatedCrons[0].id;
        setActiveTabId(newActiveId);
        setCrons(updatedCrons.map((c, index) => ({
          ...c,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = cronStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newCron = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          cronExpression: '* * * * *',
          mode: 'explain',
          explanationResult: null,
          errorMessage: '',
          generateFields: {
            minutes: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '59' }, every: { start: '0', step: '1' } },
            hours: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '23' }, every: { start: '0', step: '1' } },
            dayOfMonth: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '31' }, every: { start: '1', step: '1' } },
            month: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '12' }, every: { start: '1', step: '1' } },
            dayOfWeek: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '6' }, every: { start: '0', step: '1' } },
          },
          headerColor: headerColor,
          style: cronStyle,
          isActive: true,
        };
        setCrons([newCron]);
        setActiveTabId(newCron.id);
        showStatusMessage(setStatusMessage, 'New Cron expression tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setCrons(updatedCrons);
    }
    
    showStatusMessage(setStatusMessage, 'Cron expression tab closed', statusTimeoutRef);
  }, [crons, activeTabId, cronStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setCrons(crons => crons.map(cron => ({
      ...cron,
      isActive: cron.id === id
    })));
  }, []);

  // Clear all crons (with confirmation)
  const clearAllCrons = useCallback(() => {
    if (crons.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all Cron expression tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = cronStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newCron = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        cronExpression: '* * * * *',
        mode: 'explain',
        explanationResult: null,
        errorMessage: '',
        generateFields: {
          minutes: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '59' }, every: { start: '0', step: '1' } },
          hours: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '23' }, every: { start: '0', step: '1' } },
          dayOfMonth: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '31' }, every: { start: '1', step: '1' } },
          month: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '12' }, every: { start: '1', step: '1' } },
          dayOfWeek: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '6' }, every: { start: '0', step: '1' } },
        },
        headerColor: headerColor,
        style: cronStyle,
        isActive: true,
      };
      setCrons([newCron]);
      setActiveTabId(newCron.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [crons.length, cronStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.cronStyle !== undefined) {
      setCronStyle(prefs.cronStyle);
      // Update existing crons with new style colors
      if (prefs.cronStyle === 'modern') {
        setCrons(crons => crons.map((cron, index) => ({
          ...cron,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setCrons(crons => crons.map(cron => ({
          ...cron,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeCron = crons.find(c => c.id === activeTabId);

  return (
    <div className={`cron-expression-tool-container ${dashboardDarkMode ? 'dark-mode' : ''} ${cronStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="cron-expression-tool-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-cron-button"
            onClick={createCron}
            title="Create a new Cron expression tab"
          >
            + New Cron
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={cronStyle}
              onChange={(value) => {
                setCronStyle(value);
                updatePreferences({ cronStyle: value });
              }}
              name="cronStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {crons.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllCrons}
              title="Close all Cron expression tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {crons.length > 0 && (
        <div className="cron-tabs-container">
          <div className="cron-tabs">
            {crons.map((cron, index) => (
              <div
                key={cron.id}
                className={`cron-tab ${cron.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(cron.id)}
                style={{
                  borderTopColor: cron.id === activeTabId ? cron.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{cron.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCron(cron.id);
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

      {/* Cron Content Area */}
      <div className="cron-expression-tool-area" onClick={() => {
        if (crons.length === 0) {
          createCron();
        }
      }}>
        {activeCron ? (
          <CronTab
            cron={activeCron}
            updateCron={updateCron}
            deleteCron={deleteCron}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            cronStyle={activeCron.style || cronStyle}
            headerColor={activeCron.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No cron expression tabs yet. Click here or "New Cron" to create one.</p>
            <p className="hint">Create and explain cron expressions for scheduling tasks.</p>
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

export default CronExpressionTool;
