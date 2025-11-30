// SchemaVisualizerTab.jsx
// Tab content for schema visualization

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  validateDDL, 
  extractDatabaseMetadata, 
  generateSampleDDL,
  generateERDiagramHtml,
  generateSchemaJsonHtml,
  generateMarkdownTablesHtml,
  parseDDL
} from '../../shared/utils/schemaUtils';
import { 
  initializeMermaidDiagrams, 
  setupMermaidDiagrams
} from '../../shared/utils/mermaidInitializer';

const SchemaVisualizerTab = ({
  visualizer,
  updateVisualizer,
  deleteVisualizer,
  setStatusMessage,
  darkMode,
  visualizerStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    ddlInput,
    visualizationMode,
    displayOptions,
  } = visualizer;

  const [currentDdlInput, setCurrentDdlInput] = useState(ddlInput || '');
  const [currentVisualizationMode, setCurrentVisualizationMode] = useState(visualizationMode || 'diagram');
  const [currentDisplayOptions, setCurrentDisplayOptions] = useState(displayOptions || {
    showDataTypes: true,
    showConstraints: true,
    highlightKeys: true,
    showRelationships: true,
    compactView: false
  });
  
  const [parsedSchema, setParsedSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const diagramRef = useRef(null);
  const ddlTextareaRef = useRef(null);

  // Initialize mermaid when the component mounts
  useEffect(() => {
    const observer = setupMermaidDiagrams();
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Generate visualization based on the current mode
  const generateVisualization = useCallback((schema, mode, options = {}) => {
    const visualizationOptions = { ...currentDisplayOptions, ...options };
    
    switch (mode) {
      case 'diagram':
        const diagramHtml = generateERDiagramHtml(schema, visualizationOptions);
        setTimeout(() => {
          initializeMermaidDiagrams();
        }, 200);
        return diagramHtml;
      case 'json':
        return generateSchemaJsonHtml(schema, visualizationOptions);
      case 'markdown':
        return generateMarkdownTablesHtml(schema, visualizationOptions);
      default:
        return generateERDiagramHtml(schema, visualizationOptions);
    }
  }, [currentDisplayOptions]);

  // Initialize Mermaid diagrams after content changes
  useEffect(() => {
    if (parsedSchema && currentVisualizationMode === 'diagram') {
      setTimeout(() => {
        initializeMermaidDiagrams();
      }, 200);
    }
  }, [parsedSchema, currentVisualizationMode]);

  // Re-render visualization when visualization mode or options change (if schema is already parsed)
  useEffect(() => {
    if (parsedSchema && currentDdlInput.trim()) {
      try {
        const visualizationContent = generateVisualization(parsedSchema, currentVisualizationMode, currentDisplayOptions);
        const metadata = extractDatabaseMetadata(currentDdlInput);
        
        // Trigger visualization update via status message
        setStatusMessage?.(`VISUALIZE:${JSON.stringify({
          content: visualizationContent,
          metadata: {
            tableCount: metadata.tableCount,
            relationshipCount: metadata.relationshipCount
          }
        })}`);
      } catch (error) {
        console.error('Error regenerating visualization:', error);
      }
    }
  }, [parsedSchema, currentVisualizationMode, currentDisplayOptions, currentDdlInput, generateVisualization, setStatusMessage]);

  // Sync with prop changes
  useEffect(() => {
    setCurrentDdlInput(ddlInput || '');
    setCurrentVisualizationMode(visualizationMode || 'diagram');
    setCurrentDisplayOptions(displayOptions || {
      showDataTypes: true,
      showConstraints: true,
      highlightKeys: true,
      showRelationships: true,
      compactView: false
    });
  }, [ddlInput, visualizationMode, displayOptions]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateVisualizer(id, {
        ddlInput: currentDdlInput,
        visualizationMode: currentVisualizationMode,
        displayOptions: currentDisplayOptions,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentDdlInput, currentVisualizationMode, currentDisplayOptions, updateVisualizer]);

  // Parse DDL and generate visualization
  const parseSchema = useCallback(() => {
    if (!currentDdlInput.trim()) {
      setErrorMessage('Please enter SQL DDL statements to visualize');
      setStatusMessage?.('Please enter SQL DDL statements to visualize');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const validation = validateDDL(currentDdlInput);
      if (!validation.valid) {
        setErrorMessage(validation.message);
        setStatusMessage?.(`Validation failed: ${validation.message}`);
        setIsLoading(false);
        return;
      }
      
      const schema = parseDDL(currentDdlInput);
      setParsedSchema(schema);
      
      const metadata = extractDatabaseMetadata(currentDdlInput);
      const visualizationContent = generateVisualization(schema, currentVisualizationMode, currentDisplayOptions);
      
      // Update results via status message - this will trigger parent to update results area
      setStatusMessage?.(`VISUALIZE:${JSON.stringify({
        content: visualizationContent,
        metadata: {
          tableCount: metadata.tableCount,
          relationshipCount: metadata.relationshipCount
        }
      })}`);
      
    } catch (error) {
      console.error('Schema parsing error:', error);
      setErrorMessage(error.message);
      setStatusMessage?.(`Failed to parse schema: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentDdlInput, currentVisualizationMode, currentDisplayOptions, generateVisualization, setStatusMessage]);

  // Load sample DDL
  const loadSample = useCallback((sampleType) => {
    const sampleDDL = generateSampleDDL(sampleType);
    setCurrentDdlInput(sampleDDL);
    setErrorMessage('');
    setStatusMessage?.(`Loaded ${sampleType} sample schema`);
  }, [setStatusMessage]);

  // Clear all content
  const clearAll = useCallback(() => {
    if (currentDdlInput.trim() && !window.confirm('Are you sure you want to clear all content?')) {
      return;
    }
    
    setCurrentDdlInput('');
    setParsedSchema(null);
    setErrorMessage('');
    setStatusMessage?.('Content cleared');
  }, [currentDdlInput, setStatusMessage]);

  // Update display option
  const updateDisplayOption = useCallback((key, value) => {
    setCurrentDisplayOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className={`schema-visualizer-tab-content ${visualizerStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="schema-visualizer-options-section">
        <div className="options-row">
          <div className="option-group">
            <label>Visualization Mode</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`visualization-mode-${id}`}
                  value="diagram"
                  checked={currentVisualizationMode === 'diagram'}
                  onChange={() => setCurrentVisualizationMode('diagram')}
                />
                <span>ER Diagram</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`visualization-mode-${id}`}
                  value="json"
                  checked={currentVisualizationMode === 'json'}
                  onChange={() => setCurrentVisualizationMode('json')}
                />
                <span>JSON Structure</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`visualization-mode-${id}`}
                  value="markdown"
                  checked={currentVisualizationMode === 'markdown'}
                  onChange={() => setCurrentVisualizationMode('markdown')}
                />
                <span>Markdown Tables</span>
              </label>
            </div>
          </div>
        </div>

        <div className="options-row">
          <div className="option-group">
            <label>Display Options</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentDisplayOptions.showDataTypes}
                  onChange={(e) => updateDisplayOption('showDataTypes', e.target.checked)}
                />
                <span>Show Data Types</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentDisplayOptions.showConstraints}
                  onChange={(e) => updateDisplayOption('showConstraints', e.target.checked)}
                />
                <span>Show Constraints</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentDisplayOptions.highlightKeys}
                  onChange={(e) => updateDisplayOption('highlightKeys', e.target.checked)}
                />
                <span>Highlight Keys</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentDisplayOptions.showRelationships}
                  onChange={(e) => updateDisplayOption('showRelationships', e.target.checked)}
                />
                <span>Show Relationships</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentDisplayOptions.compactView}
                  onChange={(e) => updateDisplayOption('compactView', e.target.checked)}
                />
                <span>Compact View</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="schema-visualizer-input-section">
        <div className="input-header">
          <label htmlFor={`ddl-input-${id}`}>SQL DDL Statements</label>
          <div className="input-actions">
            <button
              className="secondary-button"
              onClick={() => loadSample('ecommerce')}
              title="Load e-commerce sample schema"
            >
              📋 E-commerce
            </button>
            <button
              className="secondary-button"
              onClick={() => loadSample('blog')}
              title="Load blog sample schema"
            >
              📋 Blog
            </button>
            <button
              className="secondary-button"
              onClick={() => loadSample('complex')}
              title="Load complex sample schema"
            >
              📋 Complex
            </button>
            <button
              className="secondary-button"
              onClick={clearAll}
              disabled={!currentDdlInput.trim()}
              title="Clear all content"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        <textarea
          ref={ddlTextareaRef}
          id={`ddl-input-${id}`}
          className="ddl-input-textarea"
          value={currentDdlInput}
          onChange={(e) => setCurrentDdlInput(e.target.value)}
          placeholder="Paste your SQL CREATE TABLE statements here..."
          spellCheck="false"
          autoComplete="off"
          rows={15}
        />

        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="schema-visualizer-actions-section">
        <button
          className="action-button visualize-button"
          onClick={parseSchema}
          disabled={!currentDdlInput.trim() || isLoading}
          title={!currentDdlInput.trim() ? "Please enter SQL DDL statements first" : "Generate schema visualization"}
        >
          {isLoading ? (
            <>
              <span className="loading-indicator"></span>
              Generating...
            </>
          ) : (
            '📊 Visualize Schema'
          )}
        </button>
      </div>

      {/* Hidden div for mermaid diagram rendering reference */}
      <div ref={diagramRef} style={{ display: 'none' }}></div>
    </div>
  );
};

export default SchemaVisualizerTab;

