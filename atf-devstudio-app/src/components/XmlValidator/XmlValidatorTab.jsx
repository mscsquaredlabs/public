// XmlValidatorTab.jsx
// Tab content for XML validation

import { useState, useRef, useEffect, useCallback } from 'react';
import { escapeXml } from '../../shared/utils/converters';
import {
  xmlToJson,
  xmlToYaml,
  xmlToHtmlForm,
  minifyXml,
  formatXml,
  xmlToHtml,
  validateXml
} from '../../shared/utils/xml-utils';
import { copyToClipboard } from '../../shared/utils/helpers';

const XmlValidatorTab = ({
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
    xmlInput,
    validationMode,
    indentSpaces,
    strictValidation,
    validateDtd,
    inputType,
    isFormatted,
    results,
  } = validator;

  const [xmlText, setXmlText] = useState(xmlInput || '');
  const [currentMode, setCurrentMode] = useState(validationMode || 'syntax');
  const [currentIndent, setCurrentIndent] = useState(indentSpaces || 2);
  const [currentStrictMode, setCurrentStrictMode] = useState(strictValidation || false);
  const [currentValidateDtd, setCurrentValidateDtd] = useState(validateDtd || false);
  const [currentInputType, setCurrentInputType] = useState(inputType || 'direct');
  const [currentFormatted, setCurrentFormatted] = useState(isFormatted || false);
  const [currentResults, setCurrentResults] = useState(results || {
    status: '',
    message: '',
    details: '',
    content: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const xmlInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setXmlText(xmlInput || '');
    setCurrentMode(validationMode || 'syntax');
    setCurrentIndent(indentSpaces || 2);
    setCurrentStrictMode(strictValidation || false);
    setCurrentValidateDtd(validateDtd || false);
    setCurrentInputType(inputType || 'direct');
    setCurrentFormatted(isFormatted || false);
    setCurrentResults(results || {
      status: '',
      message: '',
      details: '',
      content: ''
    });
  }, [xmlInput, validationMode, indentSpaces, strictValidation, validateDtd, inputType, isFormatted, results]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateValidator(id, {
        xmlInput: xmlText,
        validationMode: currentMode,
        indentSpaces: currentIndent,
        strictValidation: currentStrictMode,
        validateDtd: currentValidateDtd,
        inputType: currentInputType,
        isFormatted: currentFormatted,
        results: currentResults,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, xmlText, currentMode, currentIndent, currentStrictMode, currentValidateDtd, currentInputType, currentFormatted, currentResults, updateValidator]);

  // Helper function to get parsed XML
  const getParsedXml = useCallback(() => {
    if (!xmlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter or upload XML before validating.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      return null;
    }
    const result = validateXml(xmlText);
    if (!result.valid) {
      setCurrentResults({
        status: 'error',
        message: 'Invalid XML',
        details: result.error,
        content: ''
      });
      setStatusMessage?.(`Invalid XML: ${result.error}`);
      return null;
    }
    return result.xmlDoc;
  }, [xmlText, setStatusMessage]);

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setXmlText(e.target.result);
      setCurrentFormatted(false);
      setCurrentInputType('direct');
      setCurrentResults({
        status: 'info',
        message: `Loaded "${file.name}"`,
        details: `${(e.target.result.length / 1024).toFixed(2)} KB loaded. Use "Validate" to check the content.`,
        content: ''
      });
      setStatusMessage?.(`Loaded "${file.name}"`);
    };
    reader.onerror = () => {
      setCurrentResults({
        status: 'error',
        message: 'Failed to read file',
        details: 'There was an error reading the uploaded file.',
        content: ''
      });
      setStatusMessage?.('Failed to read file');
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [setStatusMessage]);

  // Validate XML
  const handleValidate = useCallback(() => {
    setIsProcessing(true);
    const xmlDoc = getParsedXml();
    if (!xmlDoc) {
      setIsProcessing(false);
      return;
    }

    const formatted = currentFormatted ? xmlText : formatXml(xmlText, currentIndent);
    const highlighted = xmlToHtml(formatted);

    if (currentMode === 'schema') {
      setCurrentResults({
        status: 'warning',
        message: 'XML syntax is valid, but no schema provided',
        details: 'Schema validation not yet implemented.',
        content: `<pre class="formatted-xml">${highlighted}</pre>`
      });
      setStatusMessage?.('XML syntax is valid');
    } else {
      setCurrentResults({
        status: 'success',
        message: 'XML is valid',
        details: 'Syntax check passed.',
        content: `<pre class="formatted-xml">${highlighted}</pre>`
      });
      setStatusMessage?.('XML is valid');
    }
    setIsProcessing(false);
  }, [getParsedXml, currentFormatted, xmlText, currentIndent, currentMode, setStatusMessage]);

  // Format XML
  const handleFormat = useCallback(() => {
    setIsProcessing(true);
    const xmlDoc = getParsedXml();
    if (!xmlDoc) {
      setIsProcessing(false);
      return;
    }
    
    try {
      const formatted = formatXml(xmlText, currentIndent);
      setXmlText(formatted);
      setCurrentFormatted(true);
      
      const highlightedXml = xmlToHtml(formatted);
      setCurrentResults({
        status: 'success',
        message: 'XML Formatted',
        details: `Indentation set to ${currentIndent} spaces.`,
        content: `<pre class="formatted-xml">${highlightedXml}</pre>`
      });
      setStatusMessage?.('XML formatted');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Error formatting XML',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Error formatting XML: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedXml, xmlText, currentIndent, setStatusMessage]);

  // Minify XML
  const handleMinify = useCallback(() => {
    setIsProcessing(true);
    const xmlDoc = getParsedXml();
    if (!xmlDoc) {
      setIsProcessing(false);
      return;
    }
    
    try {
      const minified = minifyXml(xmlText);
      setXmlText(minified);
      setCurrentFormatted(false);
      
      setCurrentResults({
        status: 'success',
        message: 'XML Minified',
        details: 'All non-essential whitespace removed.',
        content: ''
      });
      setStatusMessage?.('XML minified');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Error minifying XML',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Error minifying XML: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedXml, xmlText, setStatusMessage]);

  // Convert to JSON
  const handleConvertToJson = useCallback(() => {
    setIsProcessing(true);
    const xmlDoc = getParsedXml();
    if (!xmlDoc) {
      setIsProcessing(false);
      return;
    }
    
    try {
      const jsonObj = xmlToJson(xmlText);
      const jsonString = JSON.stringify(jsonObj, null, currentIndent);
      
      setCurrentResults({
        status: 'success',
        message: 'Converted XML to JSON',
        details: 'XML structure converted to JSON format.',
        content: `<pre class="formatted-json">${escapeXml(jsonString)}</pre>`
      });
      setStatusMessage?.('Converted XML to JSON');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Failed to convert XML to JSON',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Failed to convert XML to JSON: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedXml, xmlText, currentIndent, setStatusMessage]);

  // Convert to YAML
  const handleConvertToYaml = useCallback(() => {
    setIsProcessing(true);
    const xmlDoc = getParsedXml();
    if (!xmlDoc) {
      setIsProcessing(false);
      return;
    }
    
    try {
      const yamlOutput = xmlToYaml(xmlText, '  ');
      
      setCurrentResults({
        status: 'success',
        message: 'Converted XML to YAML',
        details: 'XML structure converted to YAML format.',
        content: `<pre class="formatted-yaml">${escapeXml(yamlOutput)}</pre>`
      });
      setStatusMessage?.('Converted XML to YAML');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Failed to convert XML to YAML',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Failed to convert XML to YAML: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedXml, xmlText, setStatusMessage]);

  // Convert to Form
  const handleConvertToForm = useCallback(() => {
    setIsProcessing(true);
    const xmlDoc = getParsedXml();
    if (!xmlDoc) {
      setIsProcessing(false);
      return;
    }
    
    try {
      const formHtml = xmlToHtmlForm(xmlText);
      
      setCurrentResults({
        status: 'success',
        message: 'Converted XML to HTML Form',
        details: 'Basic HTML form generated from XML structure.',
        content: `<div class="formatted-form">${formHtml}</div>`
      });
      setStatusMessage?.('Converted XML to HTML Form');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Failed to convert XML to Form',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Failed to convert XML to Form: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedXml, xmlText, setStatusMessage]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!xmlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to copy',
        details: 'Input area is empty.',
        content: ''
      });
      setStatusMessage?.('Nothing to copy');
      return;
    }
    
    copyToClipboard(xmlText)
      .then(() => {
        setCurrentResults({
          status: 'success',
          message: 'Input content copied to clipboard',
          details: '',
          content: ''
        });
        setStatusMessage?.('Copied to clipboard');
      })
      .catch(err => {
        setCurrentResults({
          status: 'error',
          message: 'Failed to copy to clipboard',
          details: err.message,
          content: ''
        });
        setStatusMessage?.(`Failed to copy: ${err.message}`);
      });
  }, [xmlText, setStatusMessage]);

  // Download XML
  const handleDownload = useCallback(() => {
    const contentToDownload = xmlText;
    if (!contentToDownload.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to download',
        details: 'Input area is empty.',
        content: ''
      });
      setStatusMessage?.('Nothing to download');
      return;
    }
    
    try {
      const result = validateXml(contentToDownload);
      if (!result.valid) {
        throw new Error(result.error);
      }
      
      const blob = new Blob([contentToDownload], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `xml-${new Date().toISOString().slice(0, 10)}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setCurrentResults({
        status: 'success',
        message: 'XML input downloaded successfully',
        details: '',
        content: ''
      });
      setStatusMessage?.(`XML downloaded: ${link.download}`);
    } catch (error) {
      const confirmDownload = window.confirm("The current input is not valid XML. Download as a text file instead?");
      if (confirmDownload) {
        const blob = new Blob([contentToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setCurrentResults({
          status: 'warning',
          message: 'Downloaded input as text (Invalid XML)',
          details: `Parse Error: ${error.message}`,
          content: ''
        });
        setStatusMessage?.('Downloaded as text file');
      } else {
        setCurrentResults({
          status: 'info',
          message: 'Download cancelled',
          details: 'Invalid XML was not downloaded.',
          content: ''
        });
        setStatusMessage?.('Download cancelled');
      }
    }
  }, [xmlText, setStatusMessage]);

  // Clear content
  const handleClear = useCallback(() => {
    setXmlText('');
    setCurrentFormatted(true);
    setCurrentInputType('direct');
    setCurrentResults({
      status: '',
      message: '',
      details: '',
      content: ''
    });
    setStatusMessage?.('Content cleared');
  }, [setStatusMessage]);

  return (
    <div className={`xml-validator-tab-content ${validatorStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="xml-validator-options-section">
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
              Strict Validation
            </label>
          </div>

          <div className="option-group">
            <label>
              <input
                type="checkbox"
                checked={currentValidateDtd}
                onChange={(e) => setCurrentValidateDtd(e.target.checked)}
              />
              Validate DTD
            </label>
          </div>

          <div className="option-group">
            <label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xml"
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
      <div className="xml-validator-input-section">
        <textarea
          ref={xmlInputRef}
          value={xmlText}
          onChange={(e) => {
            setXmlText(e.target.value);
            setCurrentFormatted(false);
          }}
          placeholder='<root>\n  <element attribute="value">Content</element>\n</root>'
          className="xml-validator-textarea"
          spellCheck="false"
          rows={20}
        />
      </div>

      {/* Actions Section */}
      <div className="xml-validator-actions-section">
        <button
          className="action-button validate-xml-button"
          onClick={handleValidate}
          disabled={!xmlText.trim() || isProcessing}
        >
          {isProcessing ? 'Validating...' : 'Validate XML'}
        </button>
        <button
          className="secondary-button"
          onClick={handleFormat}
          disabled={!xmlText.trim() || isProcessing}
        >
          Format
        </button>
        <button
          className="secondary-button"
          onClick={handleMinify}
          disabled={!xmlText.trim() || isProcessing}
        >
          Minify
        </button>
        <button
          className="secondary-button"
          onClick={handleCopy}
          disabled={!xmlText.trim()}
        >
          Copy
        </button>
        <button
          className="secondary-button"
          onClick={handleDownload}
          disabled={!xmlText.trim()}
        >
          Download
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToJson}
          disabled={!xmlText.trim() || isProcessing}
        >
          To JSON
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToYaml}
          disabled={!xmlText.trim() || isProcessing}
        >
          To YAML
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToForm}
          disabled={!xmlText.trim() || isProcessing}
        >
          To Form
        </button>
        <button
          className="secondary-button"
          onClick={handleClear}
          disabled={!xmlText.trim()}
        >
          Clear
        </button>
      </div>

      {/* Results Section */}
      {currentResults.status && (
        <div className={`xml-validator-results-section ${currentResults.status}`}>
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

export default XmlValidatorTab;



