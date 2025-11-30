// src/components/TestDataGenerator/TestDataGeneratorConfig.jsx
// -----------------------------------------------------------------------------
//  ‑ Settings drawer for the Test Data Generator tool
//  ‑ Handles output format, sample count, seed, and sample loading
// -----------------------------------------------------------------------------

import React from 'react';
import './TestDataGenerator.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const TestDataGeneratorConfig = ({
  /* props from parent */
  configMode, setConfigMode,
  generatorOptions, setGeneratorOptions,
  loadSample, sampleSchemas,
  fieldTypes
}) => {
  /* ------------------------------------------------------------------------- */
  /* helpers                                                                   */
  /* ------------------------------------------------------------------------- */
  const updateOption = (key, value) => {
    setGeneratorOptions(prev => ({ ...prev, [key]: value }));
  };

  /* ------------------------------------------------------------------------- */
  /* UI                                                                        */
  /* ------------------------------------------------------------------------- */
  return (
    <>
      <h2 className="config-section-title"> Test Data Generator Settings </h2>


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

      {/* sample schemas selector */}
      <div className="form-group">
        <label>Load Sample Schema</label>
        <select
          onChange={e => e.target.value && loadSample(e.target.value)}
          value=""
        >
          <option value="" disabled>Select a sample</option>
          {sampleSchemas.map(sample => (
            <option key={sample.id} value={sample.id}>
              {sample.name}
            </option>
          ))}
        </select>
      </div>

      {/* output format selector */}
      <div className="form-group">
        <label>Output Format</label>
        <select
          value={generatorOptions.outputFormat}
          onChange={e => updateOption('outputFormat', e.target.value)}
        >
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="csv">CSV</option>
          <option value="xml">XML</option>
        </select>
      </div>

      {/* item count */}
      <div className="form-group">
        <label>Number of Items</label>
        <input
          type="number"
          min="1"
          max="100"
          value={generatorOptions.count}
          onChange={e => updateOption('count', Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      {/* seed control */}
      <div className="form-group">
        <label>Random Seed (Optional)</label>
        <div className="checkbox-group">
          <input
            id="use-random-seed"
            type="checkbox"
            checked={generatorOptions.useRandomSeed}
            onChange={e => updateOption('useRandomSeed', e.target.checked)}
          />
          <label htmlFor="use-random-seed">Use random seed</label>
        </div>
        
        {!generatorOptions.useRandomSeed && (
          <input
            type="text"
            placeholder="Enter seed value"
            value={generatorOptions.seed}
            onChange={e => updateOption('seed', e.target.value)}
            className="seed-input"
          />
        )}
        <p className="helper-text">Using the same seed will generate identical data each time</p>
      </div>

      {/* Show field types in advanced mode */}
      {configMode === 'advanced' && (
        <div className="form-group">
          <label>Available Field Types</label>
          <div className="field-types-list">
            {fieldTypes.map(type => (
              <div key={type.id} className="field-type-item">
                <code>{type.id}</code>
                <span className="field-type-name">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
     </>
  );
};

export default TestDataGeneratorConfig;
               