// JsonValidatorTab.jsx
// Tab content for JSON validation

import { useState, useRef, useEffect, useCallback } from 'react';
import { escapeXml } from '../../shared/utils/converters';
import {
  jsonToXml,
  jsonToYaml,
  jsonToHtmlForm,
  highlightJson,
  getJsonErrorPosition
} from '../../shared/utils/json-utils';
import { copyToClipboard } from '../../shared/utils/helpers';

const JsonValidatorTab = ({
  validator,
  updateValidator,
  deleteValidator,
  setStatusMessage,
  darkMode,
  validatorStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    jsonInput,
    validationMode,
    indentSpaces,
    strictMode,
    inputType,
    isFormatted,
    results,
  } = validator;

  const [jsonText, setJsonText] = useState(jsonInput || '');
  const [currentMode, setCurrentMode] = useState(validationMode || 'syntax');
  const [currentIndent, setCurrentIndent] = useState(indentSpaces || 2);
  const [currentStrictMode, setCurrentStrictMode] = useState(strictMode || false);
  const [currentInputType, setCurrentInputType] = useState(inputType || 'direct');
  const [currentFormatted, setCurrentFormatted] = useState(isFormatted || false);
  const [currentResults, setCurrentResults] = useState(results || {
    status: '',
    message: '',
    details: '',
    content: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const jsonInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setJsonText(jsonInput || '');
    setCurrentMode(validationMode || 'syntax');
    setCurrentIndent(indentSpaces || 2);
    setCurrentStrictMode(strictMode || false);
    setCurrentInputType(inputType || 'direct');
    setCurrentFormatted(isFormatted || false);
    setCurrentResults(results || {
      status: '',
      message: '',
      details: '',
      content: ''
    });
  }, [jsonInput, validationMode, indentSpaces, strictMode, inputType, isFormatted, results]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateValidator(id, {
        jsonInput: jsonText,
        validationMode: currentMode,
        indentSpaces: currentIndent,
        strictMode: currentStrictMode,
        inputType: currentInputType,
        isFormatted: currentFormatted,
        results: currentResults,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, jsonText, currentMode, currentIndent, currentStrictMode, currentInputType, currentFormatted, currentResults, updateValidator]);

  // Helper functions
  const getErrorPosition = useCallback(
    (error) => getJsonErrorPosition(error, jsonText),
    [jsonText]
  );

  const getParsedJson = useCallback(() => {
    if (!jsonText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter or upload JSON before validating.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      return null;
    }
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      const pos = getErrorPosition(error);
      const lineInfo = pos ? `Error near line ${pos.line}, column ${pos.column}` : '';
      setCurrentResults({
        status: 'error',
        message: 'Invalid JSON',
        details: `${error.message}. ${lineInfo}`,
        content: ''
      });
      setStatusMessage?.(`Invalid JSON: ${error.message}`);
      return null;
    }
  }, [jsonText, getErrorPosition, setStatusMessage]);

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json') && !file.type.includes('json')) {
      setCurrentResults({
        status: 'error',
        message: 'Invalid file type',
        details: 'Please select a JSON file (.json)',
        content: ''
      });
      setStatusMessage?.('Invalid file type');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // Validate that it's valid JSON
        JSON.parse(content);
        setJsonText(content);
        setCurrentFormatted(false);
        setCurrentInputType('direct');
        setCurrentResults({
          status: 'info',
          message: `Loaded "${file.name}"`,
          details: `${(content.length / 1024).toFixed(2)} KB loaded`,
          content: ''
        });
        setStatusMessage?.(`Loaded "${file.name}"`);
      } catch (error) {
        // File loaded but invalid JSON - still set it so user can see and fix
        setJsonText(e.target.result);
        setCurrentFormatted(false);
        setCurrentInputType('direct');
        setCurrentResults({
          status: 'warning',
          message: `Loaded "${file.name}" (invalid JSON)`,
          details: `File loaded but contains invalid JSON: ${error.message}`,
          content: ''
        });
        setStatusMessage?.(`Loaded "${file.name}" (invalid JSON)`);
      }
      event.target.value = '';
    };
    reader.onerror = () => {
      setCurrentResults({
        status: 'error',
        message: 'Failed to read file',
        details: 'An error occurred while reading the file. Please try again.',
        content: ''
      });
      setStatusMessage?.('Failed to read file');
      event.target.value = '';
    };
    reader.readAsText(file);
  }, [setStatusMessage]);

  // Validate JSON
  const handleValidate = useCallback(() => {
    setIsProcessing(true);
    const parsed = getParsedJson();
    if (!parsed) {
      setIsProcessing(false);
      return;
    }
    setCurrentResults({
      status: 'success',
      message: 'JSON is valid',
      details: 'Syntax check passed.',
      content: `<pre class="formatted-output">${highlightJson(parsed, currentIndent)}</pre>`
    });
    setStatusMessage?.('JSON is valid');
    setIsProcessing(false);
  }, [getParsedJson, currentIndent, setStatusMessage]);

  // Format JSON
  const handleFormat = useCallback(() => {
    setIsProcessing(true);
    const parsed = getParsedJson();
    if (!parsed) {
      setIsProcessing(false);
      return;
    }
    const formatted = JSON.stringify(parsed, null, currentIndent);
    setJsonText(formatted);
    setCurrentFormatted(true);
    setCurrentResults({
      status: 'success',
      message: 'JSON formatted',
      details: `Indentation: ${currentIndent} spaces`,
      content: `<pre class="formatted-output">${highlightJson(parsed, currentIndent)}</pre>`
    });
    setStatusMessage?.('JSON formatted');
    setIsProcessing(false);
  }, [getParsedJson, currentIndent, setStatusMessage]);

  // Minify JSON
  const handleMinify = useCallback(() => {
    setIsProcessing(true);
    const parsed = getParsedJson();
    if (!parsed) {
      setIsProcessing(false);
      return;
    }
    const minified = JSON.stringify(parsed);
    setJsonText(minified);
    setCurrentFormatted(false);
    setCurrentResults({
      status: 'success',
      message: 'JSON minified',
      details: `Size reduced from ${jsonText.length} to ${minified.length} characters`,
      content: ''
    });
    setStatusMessage?.('JSON minified');
    setIsProcessing(false);
  }, [getParsedJson, jsonText, setStatusMessage]);

  // Convert to XML
  const handleConvertToXml = useCallback(() => {
    setIsProcessing(true);
    const parsed = getParsedJson();
    if (!parsed) {
      setIsProcessing(false);
      return;
    }
    try {
      const xml = jsonToXml(parsed, 'root', 0, '  ');
      const highlighted = escapeXml(xml)
        .replace(/(&lt;\?xml.*?&gt;)/g, '<span class="xml-declaration">$1</span>')
        .replace(/(&lt;!--.*?--&gt;)/gs, '<span class="xml-comment">$1</span>')
        .replace(/(&lt;)(\/?)([^!&gt;\s]+)(.*?)?(&gt;)/g,
          (_, lt, slash, tag, attrs, gt) => `${lt}${slash}<span class="xml-tag">${tag}</span>${(attrs || '')}${gt}`);
      setCurrentResults({
        status: 'success',
        message: 'Converted to XML',
        details: '',
        content: `<pre class="formatted-output">${highlighted}</pre>`
      });
      setStatusMessage?.('Converted to XML');
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'XML conversion failed',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`XML conversion failed: ${err.message}`);
    }
    setIsProcessing(false);
  }, [getParsedJson, setStatusMessage]);

  // Convert to YAML
  const handleConvertToYaml = useCallback(() => {
    setIsProcessing(true);
    const parsed = getParsedJson();
    if (!parsed) {
      setIsProcessing(false);
      return;
    }
    try {
      const yaml = jsonToYaml(parsed, 0, '  ');
      setCurrentResults({
        status: 'success',
        message: 'Converted to YAML',
        details: '',
        content: `<pre class="formatted-output">${escapeXml(yaml)}</pre>`
      });
      setStatusMessage?.('Converted to YAML');
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'YAML conversion failed',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`YAML conversion failed: ${err.message}`);
    }
    setIsProcessing(false);
  }, [getParsedJson, setStatusMessage]);

  // Convert to HTML Form
  const handleConvertToForm = useCallback(() => {
    setIsProcessing(true);
    const parsed = getParsedJson();
    if (!parsed) {
      setIsProcessing(false);
      return;
    }
    try {
      const formHtml = jsonToHtmlForm(parsed);
      setCurrentResults({
        status: 'success',
        message: 'Converted to HTML Form',
        details: '',
        content: `<div class="formatted-form">${formHtml}</div>`
      });
      setStatusMessage?.('Converted to HTML Form');
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Form conversion failed',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Form conversion failed: ${err.message}`);
    }
    setIsProcessing(false);
  }, [getParsedJson, setStatusMessage]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!jsonText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to copy',
        details: 'Please enter JSON before copying',
        content: ''
      });
      setStatusMessage?.('Nothing to copy');
      return;
    }
    copyToClipboard(jsonText)
      .then(() => {
        setCurrentResults({
          status: 'success',
          message: 'Copied to clipboard',
          details: `${jsonText.length} characters copied`,
          content: ''
        });
        setStatusMessage?.('Copied to clipboard');
      })
      .catch(err => {
        setCurrentResults({
          status: 'error',
          message: 'Copy failed',
          details: err.message || 'Failed to access clipboard. Please check browser permissions.',
          content: ''
        });
        setStatusMessage?.(`Copy failed: ${err.message || 'Failed to access clipboard'}`);
      });
  }, [jsonText, setStatusMessage]);

  // Download JSON
  const handleDownload = useCallback(() => {
    if (!jsonText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to download',
        details: 'Please enter JSON before downloading',
        content: ''
      });
      setStatusMessage?.('Nothing to download');
      return;
    }
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `json-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCurrentResults({
        status: 'success',
        message: 'JSON downloaded',
        details: `File saved as ${a.download}`,
        content: ''
      });
      setStatusMessage?.(`JSON downloaded: ${a.download}`);
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Download failed',
        details: err.message || 'Failed to create download file',
        content: ''
      });
      setStatusMessage?.(`Download failed: ${err.message || 'Failed to create download file'}`);
    }
  }, [jsonText, setStatusMessage]);

  // Clear content
  const handleClear = useCallback(() => {
    setJsonText('');
    setCurrentFormatted(false);
    setCurrentInputType('direct');
    setCurrentResults({
      status: '',
      message: '',
      details: '',
      content: ''
    });
    setStatusMessage?.('Content cleared');
  }, [setStatusMessage]);

  // Load sample
  const handleLoadSample = useCallback((sample) => {
    setJsonText(JSON.stringify(sample, null, currentIndent));
    setCurrentFormatted(true);
    setCurrentInputType('direct');
    setCurrentResults({
      status: 'info',
      message: 'Sample loaded',
      details: '',
      content: ''
    });
    setStatusMessage?.('Sample loaded');
  }, [currentIndent, setStatusMessage]);

  return (
    <div className={`json-validator-tab-content ${validatorStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="json-validator-options-section">
        <div className="options-row">
          <div className="option-group">
            <label htmlFor={`indent-${id}`}>Indentation:</label>
            <select
              id={`indent-${id}`}
              value={currentIndent}
              onChange={(e) => setCurrentIndent(Number(e.target.value))}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>

          <div className="option-group">
            <label>
              <input
                type="checkbox"
                checked={currentStrictMode}
                onChange={(e) => setCurrentStrictMode(e.target.checked)}
              />
              Strict Mode
            </label>
          </div>

          <div className="option-group">
            <label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="json-validator-input-section">
        <textarea
          ref={jsonInputRef}
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setCurrentFormatted(false);
          }}
          placeholder='{ "example": "Paste your JSON here or upload a file" }'
          className="json-validator-textarea"
          spellCheck="false"
          rows={20}
        />
      </div>

      {/* Actions Section */}
      <div className="json-validator-actions-section">
        <button
          className="action-button validate-json-button"
          onClick={handleValidate}
          disabled={!jsonText.trim() || isProcessing}
        >
          {isProcessing ? 'Validating...' : 'Validate JSON'}
        </button>
        <button
          className="secondary-button"
          onClick={handleFormat}
          disabled={!jsonText.trim() || isProcessing}
        >
          Format
        </button>
        <button
          className="secondary-button"
          onClick={handleMinify}
          disabled={!jsonText.trim() || isProcessing}
        >
          Minify
        </button>
        <button
          className="secondary-button"
          onClick={handleCopy}
          disabled={!jsonText.trim()}
        >
          Copy
        </button>
        <button
          className="secondary-button"
          onClick={handleDownload}
          disabled={!jsonText.trim()}
        >
          Download
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToXml}
          disabled={!jsonText.trim() || isProcessing}
        >
          To XML
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToYaml}
          disabled={!jsonText.trim() || isProcessing}
        >
          To YAML
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToForm}
          disabled={!jsonText.trim() || isProcessing}
        >
          To Form
        </button>
        <button
          className="secondary-button"
          onClick={handleClear}
          disabled={!jsonText.trim()}
        >
          Clear
        </button>
      </div>

      {/* Results Section */}
      {currentResults.status && (
        <div className={`json-validator-results-section ${currentResults.status}`}>
          <div className="results-header">
            <span className={`status-indicator ${currentResults.status}`}>
              {currentResults.status === 'success' && '✓'}
              {currentResults.status === 'error' && '✗'}
              {currentResults.status === 'warning' && '⚠'}
              {currentResults.status === 'info' && 'ℹ'}
            </span>
            <span className="results-message">{currentResults.message}</span>
          </div>
          {currentResults.details && (
            <div className="results-details">{currentResults.details}</div>
          )}
          {currentResults.content && (
            <div
              className="results-content"
              dangerouslySetInnerHTML={{ __html: currentResults.content }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default JsonValidatorTab;

