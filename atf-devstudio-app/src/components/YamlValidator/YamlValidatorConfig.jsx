import React from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

// Note: Using direct rendering instead of createPortal for stability
const YamlValidatorConfig = ({
  validationMode,
  setValidationMode,
  sortKeys,
  setSortKeys,
  indentSpaces,
  setIndentSpaces,
  inputType,
  setInputType,
  configMode,
  setConfigMode,
  handleFileUpload,
  loadSample,
  simpleSample,
  complexSample
}) => {
  return (
    <>
      {/* Header with title and mode switch */}
      <h3 className="config-section-title">YAML Validator Settings</h3>
      
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
      
      <div className="yaml-validator-config">
        {/* Input Type */}
        <div className="form-group">
          <label htmlFor="yaml-input-type-select">Input Type</label>
          <select 
            id="yaml-input-type-select"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
          >
            <option value="direct">Direct Input</option>
            <option value="file">File Upload</option>
            <option value="url" disabled>URL (coming soon)</option>
          </select>
          
          {inputType === 'file' && (
            <div id="yaml-file-upload-container" style={{ marginTop: '0.5rem' }}>
              <input 
                type="file" 
                accept=".yaml,.yml" 
                id="yaml-file-upload" 
                className="file-upload"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
        
        {/* Validation Mode */}
        <div className="form-group">
          <label htmlFor="yaml-validation-mode-select">Validation Mode</label>
          <select 
            id="yaml-validation-mode-select"
            value={validationMode}
            onChange={(e) => setValidationMode(e.target.value)}
          >
            <option value="syntax">Syntax Only</option>
            <option value="schema" disabled>Schema (coming soon)</option>
          </select>
        </div>
        
        {/* Advanced options - only show if in advanced mode */}
        {configMode === 'advanced' && (
          <div className="form-group">
            <label>Formatting Options</label>
            <div className="indent-options" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="yaml-indent-spaces-select" style={{ marginBottom: 0 }}>Indent:</label>
              <select 
                id="yaml-indent-spaces-select" 
                className="indent-select"
                style={{ flexGrow: 1 }}
                value={indentSpaces}
                onChange={(e) => setIndentSpaces(Number(e.target.value))}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="8">8 spaces</option>
              </select>
            </div>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="yaml-sort-keys"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
              />
              <label htmlFor="yaml-sort-keys">Sort Keys Alphabetically</label>
            </div>
          </div>
        )}
        
        {/* Sample Templates (both modes) */}
        <div className="form-group">
          <label>Load Sample</label>
          <button 
            id="simple-yaml-sample-btn"
            className="config-sample-btn" 
            title="Load a simple YAML example"
            onClick={() => loadSample(simpleSample)}
          >
            Simple YAML
          </button>
          <button 
            id="complex-yaml-sample-btn"
            className="config-sample-btn" 
            title="Load a complex YAML example with nested structures"
            onClick={() => loadSample(complexSample)}
          >
            Complex YAML
          </button>
        </div>
      </div>
    </>
  );
};

export default YamlValidatorConfig;