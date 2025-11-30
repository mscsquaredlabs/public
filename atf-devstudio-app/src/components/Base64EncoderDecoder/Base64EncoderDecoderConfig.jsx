// Base64EncoderDecoderConfig.jsx
// Configuration panel for the Base64 Encoder/Decoder component

import React from 'react';
import './Base64EncoderDecoder.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const Base64EncoderDecoderConfig = ({
  configMode, setConfigMode,
  options, setOptions,
  history, loadFromHistory
}) => {
  // Sample inputs for quick testing
  const sampleInputs = [
    {
      name: 'Hello, World!',
      value: 'Hello, World!',
      description: 'Simple greeting text'
    },
    {
      name: 'URL with parameters',
      value: 'https://example.com/api?param=value&token=abc123',
      description: 'URL with query parameters'
    },
    {
      name: 'JSON data',
      value: '{"name":"John Doe","email":"john@example.com"}',
      description: 'JSON formatted data'
    },
    {
      name: 'Base64 encoded text',
      value: 'SGVsbG8sIFdvcmxkIQ==',
      description: 'Sample Base64 encoded string'
    },
    {
      name: 'Unicode characters',
      value: 'こんにちは世界! Hello World! Привет мир!',
      description: 'Text with non-ASCII characters'
    }
  ];

  return (
    <>
      <h3 className="config-section-title">Base64 Settings</h3>

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
          <label title="Use URL-safe Base64 encoding (replaces + with - and / with _)">
            <input
              type="checkbox"
              checked={options.urlSafe}
              onChange={() => setOptions({
                ...options,
                urlSafe: !options.urlSafe
              })}
            />
            URL-safe Base64 (use - and _ instead of + and /)
          </label>
        </div>
        
        <div className="config-option">
          <label title="Automatically execute operation when input changes">
            <input
              type="checkbox"
              checked={options.autoExecute}
              onChange={() => setOptions({
                ...options,
                autoExecute: !options.autoExecute
              })}
            />
            Auto-execute on input change
          </label>
        </div>
      </div>

      {/* Advanced Options - Only visible in advanced mode */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <div className="config-option">
              <label title="Add line breaks to encoded output for better readability">
                <input
                  type="checkbox"
                  checked={options.showLineBreaks}
                  onChange={() => setOptions({
                    ...options,
                    showLineBreaks: !options.showLineBreaks
                  })}
                />
                Add line breaks to encoded output
              </label>
            </div>
            
            <div className="config-option">
              <label title="Automatically trim whitespace from input">
                <input
                  type="checkbox"
                  checked={options.autoTrim || false}
                  onChange={() => setOptions({
                    ...options,
                    autoTrim: !(options.autoTrim || false)
                  })}
                />
                Auto-trim whitespace
              </label>
            </div>
            
            <div className="config-option">
              <label title="Show binary representation in results">
                <input
                  type="checkbox"
                  checked={options.showBinary || false}
                  onChange={() => setOptions({
                    ...options,
                    showBinary: !(options.showBinary || false)
                  })}
                />
                Show binary representation
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Line break length:</label>
            <select
              value={options.lineLength || 76}
              onChange={(e) => setOptions({
                ...options,
                lineLength: parseInt(e.target.value, 10)
              })}
              title="Number of characters per line in encoded output"
            >
              <option value="64">64 characters</option>
              <option value="76">76 characters (MIME standard)</option>
              <option value="80">80 characters</option>
              <option value="0">No line breaks</option>
            </select>
          </div>
        </>
      )}

      {/* Recent Inputs - Always visible */}
      <div className="form-group">
        <h4 className="section-title">Recent Inputs</h4>
        <div className="history-list">
          {history.length > 0 ? (
            history.map((historyItem, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => loadFromHistory(historyItem)}
                title="Load this text"
              >
                <div className="history-preview">
                  {historyItem.length > 40
                    ? historyItem.substring(0, 40) + '...'
                    : historyItem}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-history">No history yet</div>
          )}
        </div>
      </div>
      
      {/* Sample Inputs - Always visible */}
      <div className="form-group">
        <h4 className="section-title">Sample Inputs</h4>
        <div className="sample-list">
          {sampleInputs.map((item, index) => (
            <div
              key={index}
              className="sample-item"
              onClick={() => loadFromHistory(item.value)}
              title={item.description}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      </>
  );
};

export default Base64EncoderDecoderConfig;