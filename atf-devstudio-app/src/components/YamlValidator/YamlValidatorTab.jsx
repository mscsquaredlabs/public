// YamlValidatorTab.jsx
// Tab content for YAML validation

import { useState, useRef, useEffect, useCallback } from 'react';
import yaml from 'js-yaml';
import { escapeXml } from '../../shared/utils/converters';
import { jsonToXml } from '../../shared/utils/json-utils';
import { copyToClipboard } from '../../shared/utils/helpers';

// Helper functions (from original component)
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const highlightJson = (json) => {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
};

const highlightXml = (xml) => {
  return escapeHtml(xml)
    .replace(/(&lt;\?xml.*?\?&gt;)/g, '<span class="xml-declaration">$1</span>')
    .replace(/(&lt;!--.*?--&gt;)/gs, '<span class="xml-comment">$1</span>')
    .replace(/(&lt;)(\/?)([^!&gt;\s]+)(.*?)?(&gt;)/g,
      (match, lt, slash, tagName, attrs, gt) =>
        `${lt}${slash}<span class="xml-tag">${tagName}</span>${
          (attrs || '').replace(/([\w-]+)=&quot;(.*?)&quot;/g,
            ' <span class="xml-attribute">$1</span>=<span class="xml-value">&quot;$2&quot;</span>'
          )
        }${gt}`
    );
};

const formatXml = (xml) => {
  let formatted = '';
  let indent = '';
  const indentSpaces = 2;

  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      indent = indent.substring(indentSpaces);
    }
    formatted += indent + '<' + node + '>\n';
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
      indent += ' '.repeat(indentSpaces);
    }
  });

  return formatted.substring(1, formatted.length - 2);
};

const yamlToHtmlForm = (obj) => {
  try {
    const formatTitle = (key) => {
      if (typeof key !== 'string') return String(key);
      return key.replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, (str) => str.toUpperCase());
    };

    const findDisplayName = (item) => {
      if (typeof item !== 'object' || item === null) return null;
      const commonKeys = ['name', 'title', 'label', 'id', 'key'];
      for (const key of commonKeys) {
        if (typeof item[key] === 'string' || typeof item[key] === 'number') {
          return item[key];
        }
      }
      return null;
    };

    const buildFormHtml = (obj, parentKey = '', isRoot = true) => {
      let formHtml = '';

      if (Array.isArray(obj)) {
        const legend = parentKey ? formatTitle(parentKey) : 'Array';
        formHtml += `<fieldset class="yaml-fieldset"><legend>${escapeHtml(legend)}</legend>`;
        obj.forEach((item, index) => {
          if (typeof item !== 'object' || item === null) {
            const currentKey = `${parentKey}[${index}]`;
            const itemLabel = `${formatTitle(parentKey.endsWith('s') ? parentKey.slice(0, -1) : parentKey) || 'Item'} ${index + 1}`;
            formHtml += `<div class="form-group array-primitive-item">`;
            formHtml += `<label for="${escapeHtml(currentKey)}">${escapeHtml(itemLabel)}:</label>`;
            formHtml += `<input type="text" id="${escapeHtml(currentKey)}" name="${escapeHtml(currentKey)}" value="${escapeHtml(String(item))}" disabled>`;
            formHtml += `</div>`;
          } else {
            const displayName = findDisplayName(item);
            const singularParentKey = (typeof parentKey === 'string' && parentKey.endsWith('s')) ? parentKey.slice(0, -1) : parentKey || 'Item';
            const itemHeader = displayName ?
              `${formatTitle(singularParentKey)} : ${escapeHtml(displayName)}` :
              `${formatTitle(singularParentKey)} ${index + 1}`;

            formHtml += `<div class="array-item">`;
            formHtml += `<div class="array-item-header">${itemHeader}</div>`;
            formHtml += buildFormHtml(item, `${parentKey}[${index}]`, false);
            formHtml += `</div>`;
          }
        });
        formHtml += `</fieldset>`;
      } else if (typeof obj === 'object' && obj !== null) {
        const needsFieldset = !isRoot && parentKey && !parentKey.endsWith(']');
        if (needsFieldset) {
          formHtml += `<fieldset class="yaml-fieldset"><legend>${escapeHtml(formatTitle(parentKey))}</legend>`;
        }

        Object.keys(obj).forEach(key => {
          const value = obj[key];
          const currentKey = parentKey ? `${parentKey}.${key}` : key;
          const formattedLabel = formatTitle(key);

          if (typeof value === 'object' && value !== null) {
            formHtml += buildFormHtml(value, key, false);
          } else {
            formHtml += `<div class="form-group">`;
            formHtml += `<label for="${escapeHtml(currentKey)}">${escapeHtml(formattedLabel)}:</label>`;

            let inputType = 'text';
            let inputValue = value;
            if (typeof value === 'number') inputType = 'number';
            if (typeof value === 'boolean') inputType = 'checkbox';
            if (value === null) inputValue = '';

            if (inputType === 'checkbox') {
              formHtml += `<input type="checkbox" id="${escapeHtml(currentKey)}" name="${escapeHtml(currentKey)}" ${value ? 'checked' : ''} disabled>`;
            } else {
              formHtml += `<input type="${inputType}" id="${escapeHtml(currentKey)}" name="${escapeHtml(currentKey)}" value="${escapeHtml(String(inputValue))}" disabled>`;
            }

            formHtml += `</div>`;
          }
        });

        if (needsFieldset) {
          formHtml += `</fieldset>`;
        }
      }

      if (isRoot && typeof obj === 'object' && obj !== null) {
        return `<div class="yaml-form">${formHtml}</div>`;
      }

      return formHtml;
    };

    return buildFormHtml(obj);
  } catch (error) {
    console.error("Error generating form from YAML:", error);
    throw new Error("Could not generate form representation.");
  }
};

const YamlValidatorTab = ({
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
    yamlInput,
    validationMode,
    indentSpaces,
    sortKeys,
    inputType,
    isFormatted,
    results,
  } = validator;

  const [yamlText, setYamlText] = useState(yamlInput || '');
  const [currentMode, setCurrentMode] = useState(validationMode || 'syntax');
  const [currentIndent, setCurrentIndent] = useState(indentSpaces || 2);
  const [currentSortKeys, setCurrentSortKeys] = useState(sortKeys || false);
  const [currentInputType, setCurrentInputType] = useState(inputType || 'direct');
  const [currentFormatted, setCurrentFormatted] = useState(isFormatted || false);
  const [currentResults, setCurrentResults] = useState(results || {
    status: '',
    message: '',
    details: '',
    content: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const yamlInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setYamlText(yamlInput || '');
    setCurrentMode(validationMode || 'syntax');
    setCurrentIndent(indentSpaces || 2);
    setCurrentSortKeys(sortKeys || false);
    setCurrentInputType(inputType || 'direct');
    setCurrentFormatted(isFormatted || false);
    setCurrentResults(results || {
      status: '',
      message: '',
      details: '',
      content: ''
    });
  }, [yamlInput, validationMode, indentSpaces, sortKeys, inputType, isFormatted, results]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateValidator(id, {
        yamlInput: yamlText,
        validationMode: currentMode,
        indentSpaces: currentIndent,
        sortKeys: currentSortKeys,
        inputType: currentInputType,
        isFormatted: currentFormatted,
        results: currentResults,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, yamlText, currentMode, currentIndent, currentSortKeys, currentInputType, currentFormatted, currentResults, updateValidator]);

  // Helper function to get parsed YAML
  const getParsedYaml = useCallback(async () => {
    if (!yamlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter or upload YAML before validating.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      return null;
    }
    try {
      const parsedYaml = yaml.load(yamlText);
      if (typeof parsedYaml !== 'object' && !Array.isArray(parsedYaml)) {
        console.warn(`YAML input resulted in a primitive type (${typeof parsedYaml}), which might affect conversion.`);
      }
      return parsedYaml;
    } catch (error) {
      let details = error.message;
      if (error.mark) {
        details += ` at line ${error.mark.line + 1}, column ${error.mark.column + 1}`;
      }
      setCurrentResults({
        status: 'error',
        message: 'Invalid YAML',
        details: details,
        content: `<pre>${escapeHtml(yamlText)}</pre>`
      });
      setStatusMessage?.(`Invalid YAML: ${error.message}`);
      return null;
    }
  }, [yamlText, setStatusMessage]);

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(yaml|yml)$/i)) {
      setCurrentResults({
        status: 'warning',
        message: 'Invalid file type',
        details: 'Please upload a .yaml or .yml file.',
        content: ''
      });
      setStatusMessage?.('Invalid file type');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setYamlText(e.target.result);
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

  // Validate YAML
  const handleValidate = useCallback(async () => {
    setIsProcessing(true);
    if (!yamlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter YAML before validating.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      setIsProcessing(false);
      return;
    }

    try {
      const parsedYaml = yaml.load(yamlText);
      const formattedYaml = yaml.dump(parsedYaml, {
        indent: currentIndent,
        lineWidth: -1,
        noRefs: true,
        sortKeys: currentSortKeys
      });

      let highlightedYaml = escapeHtml(formattedYaml);
      highlightedYaml = highlightedYaml
        .replace(/^([^:]+):/gm, '<span class="yaml-key">$1</span>:')
        .replace(/: (.+)$/gm, ': <span class="yaml-value">$1</span>')
        .replace(/^([ \t]*-)/gm, '<span class="yaml-list-marker">$1</span>')
        .replace(/^(#.*)$/gm, '<span class="yaml-comment">$1</span>');

      setCurrentResults({
        status: 'success',
        message: 'YAML is valid',
        details: 'Syntax check passed successfully.',
        content: `<pre class="formatted-yaml">${highlightedYaml}</pre>`
      });
      setStatusMessage?.('YAML is valid');
    } catch (error) {
      let details = error.message;
      if (error.mark) {
        details += ` at line ${error.mark.line + 1}, column ${error.mark.column + 1}`;
      }
      setCurrentResults({
        status: 'error',
        message: 'Invalid YAML',
        details: details,
        content: `<pre>${escapeHtml(yamlText)}</pre>`
      });
      setStatusMessage?.(`Invalid YAML: ${error.message}`);
    }
    setIsProcessing(false);
  }, [yamlText, currentIndent, currentSortKeys, setStatusMessage]);

  // Format YAML
  const handleFormat = useCallback(async () => {
    setIsProcessing(true);
    const parsedYaml = await getParsedYaml();
    if (!parsedYaml) {
      setIsProcessing(false);
      return;
    }

    try {
      const formattedYaml = yaml.dump(parsedYaml, {
        indent: currentIndent,
        lineWidth: -1,
        noRefs: true,
        sortKeys: currentSortKeys
      });
      setYamlText(formattedYaml);
      setCurrentFormatted(true);

      let highlightedYaml = escapeHtml(formattedYaml);
      highlightedYaml = highlightedYaml
        .replace(/^([^:]+):/gm, '<span class="yaml-key">$1</span>:')
        .replace(/: (.+)$/gm, ': <span class="yaml-value">$1</span>')
        .replace(/^([ \t]*-)/gm, '<span class="yaml-list-marker">$1</span>')
        .replace(/^(#.*)$/gm, '<span class="yaml-comment">$1</span>');

      setCurrentResults({
        status: 'success',
        message: 'YAML Formatted',
        details: `Indentation set to ${currentIndent} spaces. ${currentSortKeys ? 'Keys sorted alphabetically.' : ''}`,
        content: `<pre class="formatted-yaml">${highlightedYaml}</pre>`
      });
      setStatusMessage?.('YAML formatted');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Error formatting YAML',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Error formatting YAML: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedYaml, currentIndent, currentSortKeys, setStatusMessage]);

  // Convert to JSON
  const handleConvertToJson = useCallback(async () => {
    setIsProcessing(true);
    const parsedYaml = await getParsedYaml();
    if (parsedYaml === null) {
      setIsProcessing(false);
      return;
    }
    try {
      const formattedJson = JSON.stringify(parsedYaml, null, currentIndent);
      setCurrentResults({
        status: 'success',
        message: 'Converted YAML to JSON',
        details: 'YAML structure converted to JSON format.',
        content: `<pre class="formatted-json">${highlightJson(formattedJson)}</pre>`
      });
      setStatusMessage?.('Converted YAML to JSON');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Failed to convert YAML to JSON',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Failed to convert YAML to JSON: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedYaml, currentIndent, setStatusMessage]);

  // Convert to XML
  const handleConvertToXml = useCallback(async () => {
    setIsProcessing(true);
    const parsedYaml = await getParsedYaml();
    if (parsedYaml === null) {
      setIsProcessing(false);
      return;
    }
    try {
      const xmlString = jsonToXml(parsedYaml, 'root');
      const formattedXmlResult = formatXml(xmlString);
      setCurrentResults({
        status: 'success',
        message: 'Converted YAML to XML',
        details: 'YAML structure converted to XML format.',
        content: `<pre class="formatted-xml">${highlightXml(formattedXmlResult)}</pre>`
      });
      setStatusMessage?.('Converted YAML to XML');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Failed to convert YAML to XML',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Failed to convert YAML to XML: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedYaml, setStatusMessage]);

  // Convert to Form
  const handleConvertToForm = useCallback(async () => {
    setIsProcessing(true);
    const parsedYaml = await getParsedYaml();
    if (parsedYaml === null) {
      setIsProcessing(false);
      return;
    }
    if (typeof parsedYaml !== 'object' && !Array.isArray(parsedYaml)) {
      setCurrentResults({
        status: 'warning',
        message: 'Cannot convert primitive YAML to Form',
        details: 'Conversion requires an object or array structure.',
        content: `<pre>${escapeHtml(String(parsedYaml))}</pre>`
      });
      setStatusMessage?.('Cannot convert primitive YAML to Form');
      setIsProcessing(false);
      return;
    }
    try {
      const formHtml = yamlToHtmlForm(parsedYaml);
      setCurrentResults({
        status: 'success',
        message: 'Converted YAML to HTML Form',
        details: 'Basic HTML form generated. Fields are disabled.',
        content: `<div class="formatted-form">${formHtml}</div>`
      });
      setStatusMessage?.('Converted YAML to HTML Form');
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Failed to convert YAML to Form',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Failed to convert YAML to Form: ${error.message}`);
    }
    setIsProcessing(false);
  }, [getParsedYaml, setStatusMessage]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!yamlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to copy',
        details: 'Input area is empty.',
        content: ''
      });
      setStatusMessage?.('Nothing to copy');
      return;
    }

    copyToClipboard(yamlText)
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
  }, [yamlText, setStatusMessage]);

  // Download YAML
  const handleDownload = useCallback(async () => {
    const contentToDownload = yamlText;
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
      yaml.load(contentToDownload); // Validate
      const blob = new Blob([contentToDownload], { type: 'text/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `yaml-${new Date().toISOString().slice(0, 10)}.yaml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCurrentResults({
        status: 'success',
        message: 'YAML downloaded successfully',
        details: '',
        content: ''
      });
      setStatusMessage?.(`YAML downloaded: ${link.download}`);
    } catch (error) {
      const confirmDownload = window.confirm("The current input is not valid YAML. Download as a text file instead?");
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
          message: 'Downloaded input as text (Invalid YAML)',
          details: `Parse Error: ${error.message}`,
          content: ''
        });
        setStatusMessage?.('Downloaded as text file');
      } else {
        setCurrentResults({
          status: 'info',
          message: 'Download cancelled',
          details: 'Invalid YAML was not downloaded.',
          content: ''
        });
        setStatusMessage?.('Download cancelled');
      }
    }
  }, [yamlText, setStatusMessage]);

  // Clear content
  const handleClear = useCallback(() => {
    setYamlText('');
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
    <div className={`yaml-validator-tab-content ${validatorStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="yaml-validator-options-section">
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
                checked={currentSortKeys}
                onChange={(e) => setCurrentSortKeys(e.target.checked)}
              />
              Sort Keys
            </label>
          </div>

          <div className="option-group">
            <label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".yaml,.yml"
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
      <div className="yaml-validator-input-section">
        <textarea
          ref={yamlInputRef}
          value={yamlText}
          onChange={(e) => {
            setYamlText(e.target.value);
            setCurrentFormatted(false);
          }}
          placeholder={`# Enter your YAML here\nname: Example\nversion: 1.0\ndescription: Simple YAML example\nitems:\n  - item1\n  - item2: value`}
          className="yaml-validator-textarea"
          spellCheck="false"
          rows={20}
        />
      </div>

      {/* Actions Section */}
      <div className="yaml-validator-actions-section">
        <button
          className="action-button validate-yaml-button"
          onClick={handleValidate}
          disabled={!yamlText.trim() || isProcessing}
        >
          {isProcessing ? 'Validating...' : 'Validate YAML'}
        </button>
        <button
          className="secondary-button"
          onClick={handleFormat}
          disabled={!yamlText.trim() || isProcessing}
        >
          Format
        </button>
        <button
          className="secondary-button"
          onClick={handleCopy}
          disabled={!yamlText.trim()}
        >
          Copy
        </button>
        <button
          className="secondary-button"
          onClick={handleDownload}
          disabled={!yamlText.trim()}
        >
          Download
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToJson}
          disabled={!yamlText.trim() || isProcessing}
        >
          To JSON
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToXml}
          disabled={!yamlText.trim() || isProcessing}
        >
          To XML
        </button>
        <button
          className="secondary-button"
          onClick={handleConvertToForm}
          disabled={!yamlText.trim() || isProcessing}
        >
          To Form
        </button>
        <button
          className="secondary-button"
          onClick={handleClear}
          disabled={!yamlText.trim()}
        >
          Clear
        </button>
      </div>

      {/* Results Section */}
      {currentResults.status && (
        <div className={`yaml-validator-results-section ${currentResults.status}`}>
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

export default YamlValidatorTab;



