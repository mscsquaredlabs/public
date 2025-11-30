import React from 'react';
import './JsonValidator.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';


// Matching style of YamlValidatorConfig.jsx for consistency
const JsonValidatorConfig = ({
  validationMode,
  setValidationMode,
  indentSpaces,
  setIndentSpaces,
  strictMode,
  setStrictMode,
  inputType,
  setInputType,
  configMode,
  setConfigMode,
  handleFileUpload,
  loadSample
}) => {
  return (
    <>
      {/* Header with title and mode switch */}
      <h3 className="config-section-title">JSON Validator Settings</h3>
      
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
      
      <div className="json-validator-config">
        {/* Input Type */}
        <div className="form-group">
          <label htmlFor="json-input-type-select">Input Type</label>
          <select 
            id="json-input-type-select"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
          >
            <option value="direct">Direct Input</option>
            <option value="file">File Upload</option>
            <option value="url" disabled>URL (coming soon)</option>
          </select>
          
          {inputType === 'file' && (
            <div id="json-file-upload-container" style={{ marginTop: '0.5rem' }}>
              <input 
                type="file" 
                accept=".json,application/json" 
                id="json-file-upload" 
                className="file-upload"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
        
        {/* Validation Mode */}
        <div className="form-group">
          <label htmlFor="json-validation-mode-select">Validation Mode</label>
          <select 
            id="json-validation-mode-select"
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
              <label htmlFor="json-indent-spaces-select" style={{ marginBottom: 0 }}>Indent:</label>
              <select 
                id="json-indent-spaces-select" 
                className="indent-select"
                style={{ flexGrow: 1 }}
                value={indentSpaces}
                onChange={(e) => setIndentSpaces(Number(e.target.value))}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="8">8 spaces</option>
                <option value="1">1 space</option>
              </select>
            </div>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="json-strict-mode"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
              />
              <label htmlFor="json-strict-mode">Strict Mode (coming soon)</label>
            </div>
          </div>
        )}
        
        {/* Sample Templates (both modes) */}
        <div className="form-group">
          <label>Load Sample</label>
          <button 
            id="person-template-btn"
            className="config-sample-btn" 
            title="Load a sample person object"
            onClick={() => loadSample({ 
              "person": { 
                "name": "Jane Doe", 
                "age": 32, 
                "email": "jane@example.com", 
                "isActive": true, 
                "skills": ["React", "Node.js", "CSS"] 
              }
            })}
          >
            Person Object
          </button>
          <button 
            id="products-template-btn"
            className="config-sample-btn" 
            title="Load a sample products array"
            onClick={() => loadSample({ 
              "products": [ 
                { "id": "p1", "name": "Laptop", "price": 1200, "inStock": true }, 
                { "id": "p2", "name": "Mouse", "price": 25, "inStock": false } 
              ]
            })}
          >
            Products Array
          </button>
          <button 
            id="nested-template-btn"
            className="config-sample-btn" 
            title="Load a sample nested structure"
            onClick={() => loadSample({
              "company": {
                "name": "Tech Solutions Inc.",
                "founded": 2010,
                "active": true,
                "address": {
                  "street": "123 Innovation Way",
                  "city": "Tech Valley",
                  "zip": "94043",
                  "country": "USA"
                },
                "departments": [
                  {
                    "name": "Engineering",
                    "employees": 42,
                    "teams": ["Frontend", "Backend", "DevOps"]
                  },
                  {
                    "name": "Marketing",
                    "employees": 18,
                    "campaigns": {
                      "digital": true,
                      "print": false,
                      "tv": false
                    }
                  }
                ]
              }
            })}
          >
            Nested Structure
          </button>
        </div>
      </div>
    </>
  );
};

export default JsonValidatorConfig;