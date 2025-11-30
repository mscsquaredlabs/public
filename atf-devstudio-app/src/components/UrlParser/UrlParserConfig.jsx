// UrlParserConfig.jsx
// Configuration panel for the URL Parser component

import React from 'react';
import './UrlParser.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const UrlParserConfig = ({
  configMode, setConfigMode,
  parsingOptions, setParsingOptions,
  history, loadFromHistory
}) => {
  // Sample URLs for quick testing
  const sampleUrls = [
    {
      name: 'Complete URL with all components',
      url: 'https://example.com/path/to/page?name=test&id=123#section'
    },
    {
      name: 'API URL with query parameters',
      url: 'https://api.example.com/v1/users?limit=10&offset=20'
    },
    {
      name: 'FTP URL with port',
      url: 'ftp://files.example.org:21/public/document.pdf'
    },
    {
      name: 'URL with special characters',
      url: 'https://example.com/search?q=url%20encoding&lang=en&cat=web'
    }
  ];

  return (
    <>
      <h3 className="config-section-title">URL Parser Settings</h3>

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
              checked={parsingOptions.showQueryParams}
              onChange={() => setParsingOptions({
                ...parsingOptions,
                showQueryParams: !parsingOptions.showQueryParams
              })}
            />
            Show query parameters
          </label>
        </div>
        
        <div className="config-option">
          <label>
            <input
              type="checkbox"
              checked={parsingOptions.decodeComponents}
              onChange={() => setParsingOptions({
                ...parsingOptions,
                decodeComponents: !parsingOptions.decodeComponents
              })}
            />
            Decode URL components
          </label>
        </div>
      </div>

      {/* Advanced Options - Only visible in advanced mode */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="validate-url"
                defaultChecked={true}
                title="Automatically validate URL as you type"
              />
              <label htmlFor="validate-url">Validate URL as you type</label>
            </div>
          </div>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="auto-add-protocol"
                defaultChecked={true}
                title="Automatically add http:// if no protocol is specified"
              />
              <label htmlFor="auto-add-protocol">Auto-add protocol if missing</label>
            </div>
          </div>
        </>
      )}

      {/* URL History - Always visible */}
      <div className="form-group">
        <h4 className="section-title">URL History</h4>
        <div className="url-history-list">
          {history.length > 0 ? (
            history.map((historyUrl, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => loadFromHistory(historyUrl)}
                title={`Load ${historyUrl}`}
              >
                {historyUrl}
              </div>
            ))
          ) : (
            <div className="empty-history">No URLs in history</div>
          )}
        </div>
      </div>
      
      {/* Sample URLs - Always visible */}
      <div className="form-group">
        <h4 className="section-title">Sample URLs</h4>
        <div className="sample-urls">
          {sampleUrls.map((item, index) => (
            <div
              key={index}
              className="sample-url-item"
              onClick={() => loadFromHistory(item.url)}
              title={`Load example: ${item.url}`}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
      </>
  );
};

export default UrlParserConfig;