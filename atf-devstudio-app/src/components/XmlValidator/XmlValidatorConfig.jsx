import React from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

// Matching style of JsonValidatorConfig.jsx for consistency
const XmlValidatorConfig = ({
  validationMode,
  setValidationMode,
  schema,
  setSchema,
  indentSpaces,
  setIndentSpaces,
  strictValidation, 
  setStrictValidation,
  validateDtd,
  setValidateDtd,
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
      <h3 className="config-section-title">XML Validator Settings</h3>
      
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
      
      <div className="xml-validator-config">
        {/* Input Type */}
        <div className="form-group">
          <label htmlFor="xml-input-type-select">Input Type</label>
          <select 
            id="xml-input-type-select"
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
          >
            <option value="direct">Direct Input</option>
            <option value="file">File Upload</option>
            <option value="url" disabled>URL (coming soon)</option>
          </select>
          
          {inputType === 'file' && (
            <div id="xml-file-upload-container" style={{ marginTop: '0.5rem' }}>
              <input 
                type="file" 
                accept=".xml,application/xml,text/xml" 
                id="xml-file-upload" 
                className="file-upload"
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>
        
        {/* Validation Mode */}
        <div className="form-group">
          <label htmlFor="xml-validation-mode-select">Validation Mode</label>
          <select 
            id="xml-validation-mode-select"
            value={validationMode}
            onChange={(e) => setValidationMode(e.target.value)}
          >
            <option value="syntax">Syntax Only</option>
            <option value="schema" disabled>Schema (coming soon)</option>
          </select>
          
          {validationMode === 'schema' && (
            <div id="schema-container" style={{ marginTop: '0.5rem' }}>
              <label htmlFor="xml-schema-textarea">XML Schema</label>
              <textarea 
                id="xml-schema-textarea" 
                className="schema-textarea" 
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder={'<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">\n  <!-- Schema definition here -->\n</xs:schema>'}
              />
            </div>
          )}
        </div>
        
        {/* Advanced options - only show if in advanced mode */}
        {configMode === 'advanced' && (
          <div className="form-group">
            <label>Formatting Options</label>
            <div className="indent-options" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="xml-indent-spaces-select" style={{ marginBottom: 0 }}>Indent:</label>
              <select 
                id="xml-indent-spaces-select" 
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
                id="xml-strict-mode"
                checked={strictValidation}
                onChange={(e) => setStrictValidation(e.target.checked)}
              />
              <label htmlFor="xml-strict-mode">Strict Mode (coming soon)</label>
            </div>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="xml-validate-dtd"
                checked={validateDtd}
                onChange={(e) => setValidateDtd(e.target.checked)}
              />
              <label htmlFor="xml-validate-dtd">Validate DTD (coming soon)</label>
            </div>
          </div>
        )}
        
        {/* Sample Templates (both modes) */}
        <div className="form-group">
          <label>Load Sample</label>
          <button 
            id="simple-xml-sample-btn"
            className="config-sample-btn" 
            title="Load a simple XML example"
            onClick={() => loadSample(
              `<?xml version="1.0" encoding="UTF-8"?>
<person>
  <name>Jane Doe</name>
  <age>32</age>
  <email>jane@example.com</email>
  <active>true</active>
  <skills>
    <skill>XML</skill>
    <skill>HTML</skill>
    <skill>CSS</skill>
  </skills>
</person>`
            )}
          >
            Simple XML
          </button>
          <button 
            id="complex-xml-sample-btn"
            className="config-sample-btn" 
            title="Load a complex XML example with attributes and CDATA"
            onClick={() => loadSample(
              `<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product id="p1" status="in-stock">
    <name>Laptop</name>
    <price currency="USD">1200.00</price>
    <description>
      <![CDATA[High-performance laptop with 16GB RAM & SSD storage]]>
    </description>
    <specifications>
      <spec name="processor">Intel i7</spec>
      <spec name="memory">16GB</spec>
      <spec name="storage">512GB SSD</spec>
    </specifications>
    <reviews>
      <review>
        <rating>4.5</rating>
        <comment>Great product, fast shipping!</comment>
      </review>
      <review>
        <rating>5</rating>
        <comment>Excellent performance for the price</comment>
      </review>
    </reviews>
  </product>
  <product id="p2" status="out-of-stock">
    <name>Wireless Mouse</name>
    <price currency="USD">25.99</price>
    <description>
      <![CDATA[Ergonomic wireless mouse with long battery life]]>
    </description>
    <specifications>
      <spec name="connectivity">Bluetooth</spec>
      <spec name="battery">500mAh</spec>
    </specifications>
    <reviews>
      <review>
        <rating>4</rating>
        <comment>Works well but battery drains quickly</comment>
      </review>
    </reviews>
  </product>
</products>`
            )}
          >
            Complex XML
          </button>
        </div>
      </div>
    </>
  );
};

export default XmlValidatorConfig;