// UrlParserTab.jsx
// Tab content for URL parsing

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  parseUrl,
  isValidUrl,
  generateUrlStructureHtml,
  generateCodeExamples,
  escapeHtml
} from '../../shared/utils/urlUtils';
import { copyToClipboard } from '../../shared/utils/helpers';

const UrlParserTab = ({
  parser,
  updateParser,
  deleteParser,
  setStatusMessage,
  darkMode,
  parserStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    url,
    parsedUrl,
    errorMessage,
    parsingOptions,
  } = parser;

  const [urlText, setUrlText] = useState(url || '');
  const [currentParsedUrl, setCurrentParsedUrl] = useState(parsedUrl || null);
  const [currentError, setCurrentError] = useState(errorMessage || '');
  const [isParsing, setIsParsing] = useState(false);
  const [options, setOptions] = useState(parsingOptions || {
    showQueryParams: true,
    decodeComponents: true,
    autoAddProtocol: true,
  });

  const urlInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setUrlText(url || '');
    setCurrentParsedUrl(parsedUrl || null);
    setCurrentError(errorMessage || '');
    setOptions(parsingOptions || {
      showQueryParams: true,
      decodeComponents: true,
      autoAddProtocol: true,
    });
  }, [url, parsedUrl, errorMessage, parsingOptions]);

  // Parse the URL
  const handleParse = () => {
    setIsParsing(true);
    setCurrentError('');

    if (!urlText.trim()) {
      setCurrentError('Please enter a URL to parse');
      setCurrentParsedUrl(null);
      setIsParsing(false);
      updateParser(id, {
        url: urlText,
        parsedUrl: null,
        errorMessage: 'Please enter a URL to parse',
      });
      return;
    }

    try {
      const result = parseUrl(urlText, {
        decodeComponents: options.decodeComponents,
        autoAddProtocol: options.autoAddProtocol
      });

      if (!result) {
        const error = 'Invalid URL. Please check the format and try again.';
        setCurrentError(error);
        setCurrentParsedUrl(null);
        updateParser(id, {
          url: urlText,
          parsedUrl: null,
          errorMessage: error,
        });
        setStatusMessage?.('Invalid URL format');
      } else {
        setCurrentParsedUrl(result);
        setCurrentError('');
        updateParser(id, {
          url: urlText,
          parsedUrl: result,
          errorMessage: '',
        });
        setStatusMessage?.(`URL parsed successfully: ${result.host}`);
      }
    } catch (error) {
      const errorMsg = `Invalid URL: ${error.message}`;
      setCurrentError(errorMsg);
      setCurrentParsedUrl(null);
      updateParser(id, {
        url: urlText,
        parsedUrl: null,
        errorMessage: errorMsg,
      });
      setStatusMessage?.(errorMsg);
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleParse();
    }
  };

  // Copy URL component
  const handleCopyComponent = useCallback((component, value) => {
    if (!value) return;
    
    copyToClipboard(value)
      .then(() => {
        setStatusMessage?.(`${component} copied to clipboard`);
      })
      .catch(err => {
        setStatusMessage?.(`Failed to copy: ${err.message}`);
      });
  }, [setStatusMessage]);

  // Copy full URL
  const handleCopyUrl = () => {
    if (!urlText) return;
    
    copyToClipboard(urlText)
      .then(() => {
        setStatusMessage?.('URL copied to clipboard');
      })
      .catch(() => {
        setStatusMessage?.('Failed to copy URL');
      });
  };

  // Clear URL
  const handleClear = () => {
    setUrlText('');
    setCurrentParsedUrl(null);
    setCurrentError('');
    updateParser(id, {
      url: '',
      parsedUrl: null,
      errorMessage: '',
    });
    urlInputRef.current?.focus();
  };

  // Generate results HTML
  const generateResultsHtml = () => {
    if (currentError) {
      return `
        <div class="url-error">
          <p style="color: #ef4444; padding: 12px; background-color: ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'}; border-radius: 6px; border-left: 4px solid #ef4444;">
            ${escapeHtml(currentError)}
          </p>
        </div>
      `;
    }

    if (!currentParsedUrl) {
      return '';
    }

    return `
      <div class="url-results">
        <div class="url-preview">
          <h3>URL Structure</h3>
          <div class="url-structure">
            ${generateUrlStructureHtml(currentParsedUrl)}
          </div>
        </div>
        
        <div class="url-components">
          <h3>URL Components</h3>
          <table class="components-table">
            <tbody>
              <tr>
                <td class="component-name">Protocol</td>
                <td class="component-value">
                  ${escapeHtml(currentParsedUrl.protocol)}
                  <button class="copy-button-small" onclick="window.copyComponent_${id}('Protocol', '${escapeHtml(currentParsedUrl.protocol)}')" title="Copy protocol">📋</button>
                </td>
              </tr>
              <tr>
                <td class="component-name">Host</td>
                <td class="component-value">
                  ${escapeHtml(currentParsedUrl.host)}
                  <button class="copy-button-small" onclick="window.copyComponent_${id}('Host', '${escapeHtml(currentParsedUrl.host)}')" title="Copy host">📋</button>
                </td>
              </tr>
              ${currentParsedUrl.port ? `
              <tr>
                <td class="component-name">Port</td>
                <td class="component-value">
                  ${escapeHtml(currentParsedUrl.port)}
                  <button class="copy-button-small" onclick="window.copyComponent_${id}('Port', '${escapeHtml(currentParsedUrl.port)}')" title="Copy port">📋</button>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td class="component-name">Path</td>
                <td class="component-value">
                  ${escapeHtml(currentParsedUrl.path)}
                  <button class="copy-button-small" onclick="window.copyComponent_${id}('Path', '${escapeHtml(currentParsedUrl.path)}')" title="Copy path">📋</button>
                </td>
              </tr>
              ${currentParsedUrl.search ? `
              <tr>
                <td class="component-name">Query String</td>
                <td class="component-value">
                  ${escapeHtml(currentParsedUrl.search)}
                  <button class="copy-button-small" onclick="window.copyComponent_${id}('Query String', '${escapeHtml(currentParsedUrl.search)}')" title="Copy query string">📋</button>
                </td>
              </tr>
              ` : ''}
              ${currentParsedUrl.hash ? `
              <tr>
                <td class="component-name">Fragment</td>
                <td class="component-value">
                  ${escapeHtml(currentParsedUrl.hash)}
                  <button class="copy-button-small" onclick="window.copyComponent_${id}('Fragment', '${escapeHtml(currentParsedUrl.hash)}')" title="Copy fragment">📋</button>
                </td>
              </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
        
        ${options.showQueryParams && currentParsedUrl.queryParams && currentParsedUrl.queryParams.length > 0 ? `
        <div class="query-parameters">
          <h3>Query Parameters</h3>
          <table class="params-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${currentParsedUrl.queryParams.map(param => `
              <tr>
                <td class="param-name">${escapeHtml(param.key)}</td>
                <td class="param-value">${escapeHtml(param.value)}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div class="url-usage">
          <h3>Usage Examples</h3>
          ${generateCodeExamples(currentParsedUrl)}
        </div>
      </div>
    `;
  };

  // Set up copy function for this tab - always available
  useEffect(() => {
    window[`copyComponent_${id}`] = (component, value) => {
      handleCopyComponent(component, value);
    };
    return () => {
      delete window[`copyComponent_${id}`];
    };
  }, [id, handleCopyComponent]);

  return (
    <div className={`url-parser-tab-content ${darkMode ? 'dark-mode' : ''} ${parserStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* URL Input Section */}
      <div className="url-input-section">
        <div className="input-group">
          <div className="input-header">
            <label className="input-label">URL to Parse</label>
            <div className="input-actions">
              <button
                className="copy-button-small"
                onClick={handleCopyUrl}
                disabled={!urlText}
                title="Copy URL"
              >
                📋
              </button>
              <button
                className="clear-button-small"
                onClick={handleClear}
                disabled={!urlText}
                title="Clear URL"
              >
                🗑️
              </button>
            </div>
          </div>
          <input
            ref={urlInputRef}
            type="text"
            className="url-input-field"
            value={urlText}
            onChange={(e) => {
              setUrlText(e.target.value);
              updateParser(id, { url: e.target.value });
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter a URL (e.g., https://example.com/path?query=value#fragment)"
            title="Enter a URL to parse"
          />
        </div>
      </div>

      {/* Options Section */}
      <div className="url-options-section">
        <div className="options-row">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.showQueryParams}
              onChange={(e) => {
                const newOptions = { ...options, showQueryParams: e.target.checked };
                setOptions(newOptions);
                updateParser(id, { parsingOptions: newOptions });
              }}
            />
            <span>Show Query Parameters</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.decodeComponents}
              onChange={(e) => {
                const newOptions = { ...options, decodeComponents: e.target.checked };
                setOptions(newOptions);
                updateParser(id, { parsingOptions: newOptions });
              }}
            />
            <span>Decode Components</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.autoAddProtocol}
              onChange={(e) => {
                const newOptions = { ...options, autoAddProtocol: e.target.checked };
                setOptions(newOptions);
                updateParser(id, { parsingOptions: newOptions });
              }}
            />
            <span>Auto Add Protocol</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="url-actions-section">
        <button
          className="parse-url-button"
          onClick={handleParse}
          disabled={!urlText.trim() || isParsing}
        >
          <span className="parse-icon">🔍</span>
          <span className="parse-text">
            {isParsing ? 'Parsing URL...' : 'Parse URL'}
          </span>
          {!isParsing && <span className="parse-arrow">→</span>}
        </button>
      </div>

      {/* Results */}
      {(currentParsedUrl || currentError) && (
        <div className="url-results-section">
          <div
            ref={resultsRef}
            className="url-results-content"
            dangerouslySetInnerHTML={{ __html: generateResultsHtml() }}
          />
        </div>
      )}
    </div>
  );
};

export default UrlParserTab;

