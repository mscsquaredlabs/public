// src/components/SchemaVisualizer/SchemaVisualizerConfig.jsx
// -----------------------------------------------------------------------------
//  ‑ Settings drawer for the Schema Visualizer tool
//  ‑ Handles visualization options, display options, and sample loading
// -----------------------------------------------------------------------------

import React, { useEffect } from 'react';
import './SchemaVisualizer.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const SchemaVisualizerConfig = ({
  /* props from parent */
  configMode, setConfigMode,
  visualizationMode, setVisualizationMode,
  displayOptions, setDisplayOptions,
  loadSample
}) => {
  /* ------------------------------------------------------------------------- */
  /* helpers                                                                   */
  /* ------------------------------------------------------------------------- */
  const updateDisplayOption = (key, value) => {
    setDisplayOptions(prev => ({ ...prev, [key]: value }));
  };

  /* ------------------------------------------------------------------------- */
  /* UI                                                                        */
  /* ------------------------------------------------------------------------- */
  return (
    <>
      <h3 className="config-section-title">
        Schema Visualizer Settings
      </h3>

         {/* Toggle switch */}
      <StandardToggleSwitch 
        leftLabel="Simple" 
        rightLabel="Advanced" 
        isActive={configMode}  // Pass the actual configMode value
        onChange={(value) => setConfigMode(value)} // This will receive 'simple' or 'advanced'
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />

      {/* visualization mode selector */}
      <div className="form-group">
        <label>Visualization Mode</label>
        <div className="radio-group">
          <div className="radio-option">
            <input
              type="radio"
              id="view-diagram"
              name="view-mode"
              value="diagram"
              checked={visualizationMode === 'diagram'}
              onChange={() => setVisualizationMode('diagram')}
            />
            <label htmlFor="view-diagram">ER Diagram</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              id="view-json"
              name="view-mode"
              value="json"
              checked={visualizationMode === 'json'}
              onChange={() => setVisualizationMode('json')}
            />
            <label htmlFor="view-json">JSON Structure</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              id="view-markdown"
              name="view-mode"
              value="markdown"
              checked={visualizationMode === 'markdown'}
              onChange={() => setVisualizationMode('markdown')}
            />
            <label htmlFor="view-markdown">Markdown Tables</label>
          </div>
        </div>
      </div>

      {/* Display options - always show these regardless of mode */}
      <div className="form-group">
        <label>Display Options</label>
        <div className="checkbox-group">
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="show-data-types"
              checked={displayOptions.showDataTypes}
              onChange={e => updateDisplayOption('showDataTypes', e.target.checked)}
            />
            <label htmlFor="show-data-types">Show Data Types</label>
          </div>
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="show-constraints"
              checked={displayOptions.showConstraints}
              onChange={e => updateDisplayOption('showConstraints', e.target.checked)}
            />
            <label htmlFor="show-constraints">Show Constraints</label>
          </div>
          <div className="checkbox-option">
            <input
              type="checkbox"
              id="highlight-keys"
              checked={displayOptions.highlightKeys}
              onChange={e => updateDisplayOption('highlightKeys', e.target.checked)}
            />
            <label htmlFor="highlight-keys">Highlight Keys</label>
          </div>
        </div>
      </div>

      {/* Advanced options - only show in advanced mode */}
      {configMode === 'advanced' && (
        <div className="form-group">
          <label>Advanced Options</label>
          <div className="checkbox-group">
            <div className="checkbox-option">
              <input
                type="checkbox"
                id="show-relationships"
                checked={displayOptions.showRelationships}
                onChange={e => updateDisplayOption('showRelationships', e.target.checked)}
              />
              <label htmlFor="show-relationships">Show Relationships</label>
            </div>
            <div className="checkbox-option">
              <input
                type="checkbox"
                id="compact-view"
                checked={displayOptions.compactView}
                onChange={e => updateDisplayOption('compactView', e.target.checked)}
              />
              <label htmlFor="compact-view">Compact View</label>
            </div>
          </div>
        </div>
      )}

      {/* Sample loading buttons */}
      <div className="form-group">
        <label>Load Sample</label>
        <div className="sample-buttons">
          <button 
            className="config-sample-btn" 
            onClick={() => loadSample('ecommerce')}
            title="Load an e-commerce database schema sample"
          >
            E-commerce
          </button>
          <button 
            className="config-sample-btn" 
            onClick={() => loadSample('blog')}
            title="Load a blog database schema sample"
          >
            Blog
          </button>
          {configMode === 'advanced' && (
            <button 
              className="config-sample-btn" 
              onClick={() => loadSample('complex')}
              title="Load a complex database schema with many relationships"
            >
              Complex
            </button>
          )}
        </div>
      </div>
      </>
  );
};

export default SchemaVisualizerConfig;