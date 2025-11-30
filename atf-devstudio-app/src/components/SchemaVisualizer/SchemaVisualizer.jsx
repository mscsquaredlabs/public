// SchemaVisualizer.jsx
// Schema Visualizer component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import SchemaVisualizerTab from './SchemaVisualizerTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import { 
  extractDatabaseMetadata,
  generateERDiagramHtml,
  generateSchemaJsonHtml,
  generateMarkdownTablesHtml,
  parseDDL
} from '../../shared/utils/schemaUtils';
import { 
  initializeMermaidDiagrams
} from '../../shared/utils/mermaidInitializer';
import './SchemaVisualizer.css';

const STORAGE_KEY = 'atf-dev-studio-schema-visualizer';
const DEFAULT_TAB_TITLE = 'Schema Visualizer';

const SchemaVisualizer = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [visualizers, setVisualizers] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [visualizerStyle, setVisualizerStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style visualizers
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

  // Load saved visualizers and preferences from localStorage
  useEffect(() => {
    try {
      const savedVisualizers = localStorage.getItem(STORAGE_KEY);
      if (savedVisualizers) {
        const parsedVisualizers = JSON.parse(savedVisualizers);
        setVisualizers(parsedVisualizers);
        
        // Set active tab to the first visualizer or the last active one
        if (parsedVisualizers.length > 0) {
          const lastActive = parsedVisualizers.find(v => v.isActive) || parsedVisualizers[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.visualizerStyle) setVisualizerStyle(prefs.visualizerStyle);
      }
    } catch (error) {
      console.error('Error loading visualizers:', error);
    }
  }, []);

  // Save visualizers to localStorage whenever they change
  useEffect(() => {
    if (visualizers.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(visualizers));
        } catch (error) {
          console.error('Error saving visualizers to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [visualizers]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        visualizerStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [visualizerStyle]);

  // Automatically create one visualizer tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedVisualizers = localStorage.getItem(STORAGE_KEY);
    if (savedVisualizers && JSON.parse(savedVisualizers).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).visualizerStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newVisualizer = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        ddlInput: '',
        visualizationMode: 'diagram',
        displayOptions: {
          showDataTypes: true,
          showConstraints: true,
          highlightKeys: true,
          showRelationships: true,
          compactView: false
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setVisualizers([newVisualizer]);
      setActiveTabId(newVisualizer.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new visualizer tab
  const createVisualizer = useCallback(() => {
    const headerColor = visualizerStyle === 'modern' ? generateModernColor(visualizers.length) : '#4f46e5';
    
    const newVisualizer = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${visualizers.length + 1}`,
      ddlInput: '',
      visualizationMode: 'diagram',
      displayOptions: {
        showDataTypes: true,
        showConstraints: true,
        highlightKeys: true,
        showRelationships: true,
        compactView: false
      },
      headerColor: headerColor,
      style: visualizerStyle,
      isActive: false,
    };
    
    // Mark all existing visualizers as inactive and set new one as active
    const updatedVisualizers = visualizers.map(v => ({ ...v, isActive: false }));
    updatedVisualizers.push({ ...newVisualizer, isActive: true });
    
    setVisualizers(updatedVisualizers);
    setActiveTabId(newVisualizer.id);
    showStatusMessage(setStatusMessage, 'New schema visualizer tab created', statusTimeoutRef);
  }, [visualizers, visualizerStyle, generateModernColor]);

  // Update a visualizer's properties
  const updateVisualizer = useCallback((id, updates) => {
    setVisualizers(visualizers => visualizers.map(visualizer => 
      visualizer.id === id ? { ...visualizer, ...updates } : visualizer
    ));
  }, []);

  // Delete a visualizer tab
  const deleteVisualizer = useCallback((id) => {
    const updatedVisualizers = visualizers.filter(visualizer => visualizer.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedVisualizers.length > 0) {
        const newActiveId = updatedVisualizers[0].id;
        setActiveTabId(newActiveId);
        setVisualizers(updatedVisualizers.map((v, index) => ({
          ...v,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = visualizerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newVisualizer = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          ddlInput: '',
          visualizationMode: 'diagram',
          displayOptions: {
            showDataTypes: true,
            showConstraints: true,
            highlightKeys: true,
            showRelationships: true,
            compactView: false
          },
          headerColor: headerColor,
          style: visualizerStyle,
          isActive: true,
        };
        setVisualizers([newVisualizer]);
        setActiveTabId(newVisualizer.id);
        showStatusMessage(setStatusMessage, 'New schema visualizer tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setVisualizers(updatedVisualizers);
    }
    
    showStatusMessage(setStatusMessage, 'Schema visualizer tab closed', statusTimeoutRef);
  }, [visualizers, activeTabId, visualizerStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setVisualizers(visualizers => visualizers.map(visualizer => ({
      ...visualizer,
      isActive: visualizer.id === id
    })));
  }, []);

  // Clear all visualizers (with confirmation)
  const clearAllVisualizers = useCallback(() => {
    if (visualizers.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all schema visualizer tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = visualizerStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newVisualizer = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        ddlInput: '',
        visualizationMode: 'diagram',
        displayOptions: {
          showDataTypes: true,
          showConstraints: true,
          highlightKeys: true,
          showRelationships: true,
          compactView: false
        },
        headerColor: headerColor,
        style: visualizerStyle,
        isActive: true,
      };
      setVisualizers([newVisualizer]);
      setActiveTabId(newVisualizer.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [visualizers.length, visualizerStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.visualizerStyle !== undefined) {
      setVisualizerStyle(prefs.visualizerStyle);
      // Update existing visualizers with new style colors
      if (prefs.visualizerStyle === 'modern') {
        setVisualizers(visualizers => visualizers.map((visualizer, index) => ({
          ...visualizer,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setVisualizers(visualizers => visualizers.map(visualizer => ({
          ...visualizer,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  // Handle visualization generation and update results
  const handleVisualizationGenerated = useCallback((ddlInput, visualizationMode, displayOptions) => {
    try {
      const schema = parseDDL(ddlInput);
      const metadata = extractDatabaseMetadata(ddlInput);
      
      let visualizationContent = '';
      switch (visualizationMode) {
        case 'diagram':
          visualizationContent = generateERDiagramHtml(schema, displayOptions);
          setTimeout(() => {
            initializeMermaidDiagrams();
          }, 200);
          break;
        case 'json':
          visualizationContent = generateSchemaJsonHtml(schema, displayOptions);
          break;
        case 'markdown':
          visualizationContent = generateMarkdownTablesHtml(schema, displayOptions);
          break;
        default:
          visualizationContent = generateERDiagramHtml(schema, displayOptions);
      }
      
      handleResultsUpdate({
        status: 'success',
        message: `Schema visualization generated with ${metadata.tableCount} tables and ${metadata.relationshipCount} relationships`,
        details: `Created tables: ${metadata.tableCount}, Relationships: ${metadata.relationshipCount}`,
        content: visualizationContent
      });
    } catch (error) {
      console.error('Visualization generation error:', error);
      handleResultsUpdate({
        status: 'error',
        message: 'Failed to generate visualization',
        details: error.message
      });
    }
  }, [handleResultsUpdate]);

  const activeVisualizer = visualizers.find(v => v.id === activeTabId);

  return (
    <div className={`schema-visualizer-container ${dashboardDarkMode ? 'dark-mode' : ''} ${visualizerStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="schema-visualizer-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-visualizer-button"
            onClick={createVisualizer}
            title="Create a new schema visualizer tab"
          >
            + New Visualizer
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={visualizerStyle}
              onChange={(value) => {
                setVisualizerStyle(value);
                updatePreferences({ visualizerStyle: value });
              }}
              name="visualizerStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {visualizers.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllVisualizers}
              title="Close all schema visualizer tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {visualizers.length > 0 && (
        <div className="visualizer-tabs-container">
          <div className="visualizer-tabs">
            {visualizers.map((visualizer, index) => (
              <div
                key={visualizer.id}
                className={`visualizer-tab ${visualizer.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(visualizer.id)}
                style={{
                  borderTopColor: visualizer.id === activeTabId ? visualizer.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{visualizer.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteVisualizer(visualizer.id);
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

      {/* Visualizer Content Area */}
      <div className="schema-visualizer-area" onClick={() => {
        if (visualizers.length === 0) {
          createVisualizer();
        }
      }}>
        {activeVisualizer ? (
          <SchemaVisualizerTab
            visualizer={activeVisualizer}
            updateVisualizer={(id, updates) => {
              updateVisualizer(id, updates);
              // If visualization was generated, update results
              if (updates.ddlInput && updates.visualizationMode && updates.displayOptions) {
                const updatedVisualizer = { ...activeVisualizer, ...updates };
                handleVisualizationGenerated(
                  updatedVisualizer.ddlInput,
                  updatedVisualizer.visualizationMode,
                  updatedVisualizer.displayOptions
                );
              }
            }}
            deleteVisualizer={deleteVisualizer}
            setStatusMessage={(message) => {
              // Check if message contains visualization data
              if (message.startsWith('VISUALIZE:')) {
                try {
                  const data = JSON.parse(message.substring(11));
                  handleResultsUpdate({
                    status: 'success',
                    message: `Schema visualization generated with ${data.metadata.tableCount} tables and ${data.metadata.relationshipCount} relationships`,
                    details: `Created tables: ${data.metadata.tableCount}, Relationships: ${data.metadata.relationshipCount}`,
                    content: data.content
                  });
                  showStatusMessage(setStatusMessage, `Schema visualization generated with ${data.metadata.tableCount} tables and ${data.metadata.relationshipCount} relationships`, statusTimeoutRef);
                } catch (e) {
                  showStatusMessage(setStatusMessage, message, statusTimeoutRef);
                }
              } else {
                showStatusMessage(setStatusMessage, message, statusTimeoutRef);
              }
            }}
            darkMode={dashboardDarkMode}
            visualizerStyle={activeVisualizer.style || visualizerStyle}
            headerColor={activeVisualizer.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No visualizer tabs yet. Click here or "New Visualizer" to create one.</p>
            <p className="hint">Visualize database schema from SQL CREATE TABLE statements. Generate ER diagrams, JSON structure, or Markdown tables.</p>
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

export default SchemaVisualizer;
