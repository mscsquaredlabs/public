// AppGenerator.jsx
// App Generator component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import AppGeneratorTab from './AppGeneratorTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './AppGenerator.css';

const STORAGE_KEY = 'atf-dev-studio-app-generator';
const DEFAULT_TAB_TITLE = 'App Generator';

const AppGenerator = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [generators, setGenerators] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatorStyle, setGeneratorStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved generators and preferences from localStorage
  useEffect(() => {
    try {
      const savedGenerators = localStorage.getItem(STORAGE_KEY);
      if (savedGenerators) {
        const parsedGenerators = JSON.parse(savedGenerators);
        setGenerators(parsedGenerators);
        
        // Set active tab to the first generator or the last active one
        if (parsedGenerators.length > 0) {
          const lastActive = parsedGenerators.find(g => g.isActive) || parsedGenerators[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.generatorStyle) setGeneratorStyle(prefs.generatorStyle);
      }
    } catch (error) {
      console.error('Error loading generators:', error);
    }
  }, []);

  // Save generators to localStorage whenever they change
  useEffect(() => {
    if (generators.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(generators));
        } catch (error) {
          console.error('Error saving generators to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [generators]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        generatorStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [generatorStyle]);

  // Generate color for modern style generators
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

  // Create a new generator tab
  const createGenerator = useCallback(() => {
    const headerColor = generatorStyle === 'modern' ? generateModernColor(generators.length) : '#4f46e5';
    
    const newGenerator = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${generators.length + 1}`,
      appType: 'react',
      javaAppType: 'java-core',
      appName: 'atf-app',
      description: 'ATF Dev Studio - Sample Application',
      version: '1.0.0',
      author: '',
      includeTests: true,
      includeReadme: true,
      includeGitignore: true,
      customDirectoryTemplate: '',
      showDirectoryTemplateInput: false,
      outputDirectory: '',
      headerColor: headerColor,
      style: generatorStyle,
      isActive: false,
    };
    
    // Mark all existing generators as inactive and set new one as active
    const updatedGenerators = generators.map(g => ({ ...g, isActive: false }));
    updatedGenerators.push({ ...newGenerator, isActive: true });
    
    setGenerators(updatedGenerators);
    setActiveTabId(newGenerator.id);
    showStatusMessage(setStatusMessage, 'New app generator tab created', statusTimeoutRef);
  }, [generators, generatorStyle, generateModernColor]);

  // Update a generator's properties
  const updateGenerator = useCallback((id, updates) => {
    setGenerators(generators => generators.map(generator => 
      generator.id === id ? { ...generator, ...updates } : generator
    ));
  }, []);

  // Delete a generator tab
  const deleteGenerator = useCallback((id) => {
    const updatedGenerators = generators.filter(generator => generator.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedGenerators.length > 0) {
        const newActiveId = updatedGenerators[0].id;
        setActiveTabId(newActiveId);
        setGenerators(updatedGenerators.map((g, index) => ({
          ...g,
          isActive: index === 0
        })));
      } else {
        setActiveTabId(null);
        setGenerators([]);
      }
    } else {
      setGenerators(updatedGenerators);
    }
    
    showStatusMessage(setStatusMessage, 'App generator tab closed', statusTimeoutRef);
  }, [generators, activeTabId]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setGenerators(generators => generators.map(generator => ({
      ...generator,
      isActive: generator.id === id
    })));
  }, []);

  // Clear all generators (with confirmation)
  const clearAllGenerators = useCallback(() => {
    if (generators.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all app generator tabs? This action cannot be undone.')) {
      setGenerators([]);
      setActiveTabId(null);
      localStorage.removeItem(STORAGE_KEY);
      showStatusMessage(setStatusMessage, 'All app generator tabs closed', statusTimeoutRef);
    }
  }, [generators.length]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.generatorStyle !== undefined) {
      setGeneratorStyle(prefs.generatorStyle);
      // Update existing generators with new style colors
      if (prefs.generatorStyle === 'modern') {
        setGenerators(generators => generators.map((generator, index) => ({
          ...generator,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setGenerators(generators => generators.map(generator => ({
          ...generator,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeGenerator = generators.find(g => g.id === activeTabId);

  return (
    <div className={`app-generator-container ${dashboardDarkMode ? 'dark-mode' : ''} ${generatorStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="app-generator-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-generator-button"
            onClick={createGenerator}
            title="Create a new app generator tab"
          >
            + New Generator
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={generatorStyle}
              onChange={(value) => {
                setGeneratorStyle(value);
                updatePreferences({ generatorStyle: value });
              }}
              name="generatorStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {generators.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllGenerators}
              title="Close all app generator tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {generators.length > 0 && (
        <div className="generator-tabs-container">
          <div className="generator-tabs">
            {generators.map((generator, index) => (
              <div
                key={generator.id}
                className={`generator-tab ${generator.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(generator.id)}
                style={{
                  borderTopColor: generator.id === activeTabId ? generator.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{generator.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGenerator(generator.id);
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

      {/* Generator Content Area */}
      <div className="app-generator-area">
        {activeGenerator ? (
          <AppGeneratorTab
            generator={activeGenerator}
            updateGenerator={updateGenerator}
            deleteGenerator={deleteGenerator}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            generatorStyle={activeGenerator.style || generatorStyle}
            headerColor={activeGenerator.headerColor}
          />
        ) : (
          <div className="empty-state">
            <p>No generator tabs yet. Click "New Generator" to create one.</p>
            <p className="hint">Generate starter applications for different platforms and frameworks.</p>
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

export default AppGenerator;
