// CodeDiffCheckerConfig.jsx
// Configuration panel for the Code Diff Checker component

import React from 'react';
import './CodeDiffChecker.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';


const CodeDiffCheckerConfig = ({
  configMode, setConfigMode,
  diffOptions, setDiffOptions,
  clearAll, examples = {}
}) => {
  // Handle loading examples
  const handleLoadExample = (exampleKey) => {
    if (examples[exampleKey]) {
      examples[exampleKey]();
    }
  };

  return (
    <>
      <h3 className="config-section-title">Code Diff Settings</h3>

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

      {/* Basic Options - Visible in both modes */}
      <div className="form-group">
        <div className="config-option">
          <label>
            <input
              type="checkbox"
              checked={diffOptions.ignoreWhitespace}
              onChange={() => setDiffOptions({
                ...diffOptions,
                ignoreWhitespace: !diffOptions.ignoreWhitespace
              })}
            />
            Ignore whitespace
          </label>
        </div>
        
        <div className="config-option">
          <label>
            <input
              type="checkbox"
              checked={diffOptions.ignoreCase}
              onChange={() => setDiffOptions({
                ...diffOptions,
                ignoreCase: !diffOptions.ignoreCase
              })}
            />
            Ignore case
          </label>
        </div>
        
        <div className="config-option">
          <label>
            <input
              type="checkbox"
              checked={diffOptions.showLineNumbers}
              onChange={() => setDiffOptions({
                ...diffOptions,
                showLineNumbers: !diffOptions.showLineNumbers
              })}
            />
            Show line numbers
          </label>
        </div>
        
        <div className="config-option">
          <label>
            <input
              type="checkbox"
              checked={diffOptions.splitView}
              onChange={() => setDiffOptions({
                ...diffOptions,
                splitView: !diffOptions.splitView
              })}
            />
            Split view
          </label>
        </div>
      </div>

      {/* Advanced Options - Only visible in advanced mode */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <label>Context lines</label>
            <select
              value={diffOptions.contextLines}
              onChange={(e) => setDiffOptions({
                ...diffOptions,
                contextLines: parseInt(e.target.value, 10)
              })}
              title="Number of unchanged context lines to show around changes"
            >
              <option value="0">0 lines</option>
              <option value="1">1 line</option>
              <option value="3">3 lines</option>
              <option value="5">5 lines</option>
              <option value="10">10 lines</option>
              <option value="9999">All lines</option>
            </select>
          </div>

          <div className="form-group">
            <label>Load Example</label>
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  handleLoadExample(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              title="Load a pre-configured example"
            >
              <option value="" disabled>Select an example</option>
              <option value="javaCode">Java Code Example</option>
              <option value="htmlCode">HTML Example</option>
              <option value="javascriptCode">JavaScript Example</option>
              <option value="cssCode">CSS Example</option>
            </select>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="word-wrap"
                defaultChecked={true}
                title="Wrap long lines"
              />
              <label htmlFor="word-wrap">Wrap long lines</label>
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="highlight-intraline"
                defaultChecked={false}
                title="Highlight changes within lines"
              />
              <label htmlFor="highlight-intraline">Highlight intra-line changes</label>
            </div>
          </div>
        </>
      )}

      <div className="config-actions">
        <button
          className="config-button"
          onClick={clearAll}
          title="Clear all input and results"
        >
          Clear All
        </button>
      </div>
      </>
  );
};

export default CodeDiffCheckerConfig;