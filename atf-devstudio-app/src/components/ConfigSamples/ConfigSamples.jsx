// ConfigSamples.jsx
// Config Samples component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ConfigSamplesTab from './ConfigSamplesTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import { configTypes } from '../../shared/utils/config-data';
import './ConfigSamples.css';

const STORAGE_KEY = 'atf-dev-studio-config-samples';

// Select 10 configuration types for tabs
const SELECTED_CONFIG_TYPES = [
  { id: 'docker', name: 'Docker' },
  { id: 'kubernetes', name: 'Kubernetes' },
  { id: 'nginx', name: 'Nginx' },
  { id: 'apache', name: 'Apache' },
  { id: 'eslint', name: 'ESLint' },
  { id: 'babel', name: 'Babel' },
  { id: 'webpack', name: 'Webpack' },
  { id: 'tsconfig', name: 'TypeScript' },
  { id: 'github', name: 'GitHub Actions' },
  { id: 'aws', name: 'AWS' }
];

const ConfigSamples = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [samples, setSamples] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [configStyle, setConfigStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Generate color for modern style samples
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

  // Initialize tabs from selected config types
  useEffect(() => {
    try {
      // Load preferences first
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      let loadedConfigStyle = 'simple';
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.configStyle) {
          loadedConfigStyle = prefs.configStyle;
          setConfigStyle(prefs.configStyle);
        }
      }

      const savedSamples = localStorage.getItem(STORAGE_KEY);
      if (savedSamples) {
        const parsedSamples = JSON.parse(savedSamples);
        // Sync sample styles with loaded configStyle preference
        const syncedSamples = parsedSamples.map((sample, index) => ({
          ...sample,
          style: loadedConfigStyle,
          headerColor: loadedConfigStyle === 'modern' ? generateModernColor(index) : '#4f46e5'
        }));
        setSamples(syncedSamples);
        
        if (syncedSamples.length > 0) {
          const lastActive = syncedSamples.find(s => s.isActive) || syncedSamples[0];
          setActiveTabId(lastActive.id);
        }
      } else {
        // Create initial tabs from selected config types
        const initialSamples = SELECTED_CONFIG_TYPES.map((type, index) => ({
          id: uuidv4(),
          title: type.name,
          configType: type.id,
          headerColor: loadedConfigStyle === 'modern' ? generateModernColor(index) : '#4f46e5',
          style: loadedConfigStyle,
          isActive: index === 0,
        }));
        
        setSamples(initialSamples);
        if (initialSamples.length > 0) {
          setActiveTabId(initialSamples[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading config samples:', error);
      // Fallback to initial tabs
      const initialSamples = SELECTED_CONFIG_TYPES.map((type, index) => ({
        id: uuidv4(),
        title: type.name,
        configType: type.id,
        headerColor: configStyle === 'modern' ? generateModernColor(index) : '#4f46e5',
        style: configStyle,
        isActive: index === 0,
      }));
      setSamples(initialSamples);
      if (initialSamples.length > 0) {
        setActiveTabId(initialSamples[0].id);
      }
    }
  }, [generateModernColor]); // Remove configStyle from dependencies to prevent re-initialization

  // Save samples to localStorage whenever they change
  useEffect(() => {
    if (samples.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
        } catch (error) {
          console.error('Error saving config samples to storage:', error);
        }
      };
      
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [samples]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        configStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [configStyle]);

  // Create a new sample tab
  const createSample = useCallback(() => {
    // Find the next config type that's not already in use
    const usedTypes = samples.map(s => s.configType);
    const availableType = SELECTED_CONFIG_TYPES.find(type => !usedTypes.includes(type.id));
    
    if (!availableType) {
      showStatusMessage(setStatusMessage, 'All configuration types are already open', statusTimeoutRef);
      return;
    }
    
    const headerColor = configStyle === 'modern' ? generateModernColor(samples.length) : '#4f46e5';
    
    const newSample = {
      id: uuidv4(),
      title: availableType.name,
      configType: availableType.id,
      headerColor: headerColor,
      style: configStyle,
      isActive: false,
    };
    
    const updatedSamples = samples.map(s => ({ ...s, isActive: false }));
    updatedSamples.push({ ...newSample, isActive: true });
    
    setSamples(updatedSamples);
    setActiveTabId(newSample.id);
    showStatusMessage(setStatusMessage, `Opened ${availableType.name} configuration`, statusTimeoutRef);
  }, [samples, configStyle, generateModernColor]);

  // Update a sample's properties
  const updateSample = useCallback((id, updates) => {
    setSamples(samples => samples.map(sample => 
      sample.id === id ? { ...sample, ...updates } : sample
    ));
  }, []);

  // Delete a sample tab
  const deleteSample = useCallback((id) => {
    const updatedSamples = samples.filter(sample => sample.id !== id);
    
    if (id === activeTabId) {
      if (updatedSamples.length > 0) {
        const newActiveId = updatedSamples[0].id;
        setActiveTabId(newActiveId);
        setSamples(updatedSamples.map((s, index) => ({
          ...s,
          isActive: index === 0
        })));
      } else {
        setActiveTabId(null);
        setSamples([]);
      }
    } else {
      setSamples(updatedSamples);
    }
    
    showStatusMessage(setStatusMessage, 'Configuration tab closed', statusTimeoutRef);
  }, [samples, activeTabId]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setSamples(samples => samples.map(sample => ({
      ...sample,
      isActive: sample.id === id
    })));
  }, []);

  // Clear all samples (with confirmation)
  const clearAllSamples = useCallback(() => {
    if (samples.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all configuration tabs? This action cannot be undone.')) {
      setSamples([]);
      setActiveTabId(null);
      localStorage.removeItem(STORAGE_KEY);
      showStatusMessage(setStatusMessage, 'All configuration tabs closed', statusTimeoutRef);
    }
  }, [samples.length]);

  const activeSample = samples.find(s => s.id === activeTabId);

  return (
    <div className={`config-samples-container ${dashboardDarkMode ? 'dark-mode' : ''} ${configStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="config-samples-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-sample-button"
            onClick={createSample}
            title="Open a new configuration type"
          >
            + New Config
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={configStyle}
              onChange={(value) => {
                setConfigStyle(value);
                setSamples(samples => samples.map((sample, index) => ({
                  ...sample,
                  style: value,
                  headerColor: value === 'modern' ? generateModernColor(index) : '#4f46e5'
                })));
              }}
              name="configStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {samples.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllSamples}
              title="Close all configuration tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {samples.length > 0 && (
        <div className="samples-tabs-container">
          <div className="samples-tabs">
            {samples.map((sample, index) => (
              <div
                key={sample.id}
                className={`samples-tab ${sample.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(sample.id)}
                style={{
                  borderTopColor: sample.id === activeTabId ? sample.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{sample.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSample(sample.id);
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

      {/* Sample Content Area */}
      <div className="config-samples-area">
        {activeSample ? (
          <ConfigSamplesTab
            configType={activeSample.configType}
            updateConfigType={(newType) => updateSample(activeSample.id, { configType: newType })}
            setStatusMessage={(message) => {
              showStatusMessage(setStatusMessage, message, statusTimeoutRef);
            }}
            darkMode={dashboardDarkMode}
            configStyle={activeSample.style || configStyle}
            headerColor={activeSample.headerColor}
          />
        ) : (
          <div className="empty-state">
            <p>No configuration tabs yet. Click "New Config" to open a configuration type.</p>
            <p className="hint">Browse and use common configuration templates for various technologies. Select a configuration type to view available templates.</p>
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

export default ConfigSamples;
