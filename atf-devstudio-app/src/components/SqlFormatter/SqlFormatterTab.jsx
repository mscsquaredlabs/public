// SqlFormatterTab.jsx
// Tab content for SQL formatting

import { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { format as sqlFormat } from 'sql-formatter';
import SqlVisualizer from './SqlVisualizer';
import SqlTableVisualizer, { parseCreateTable } from './SqlTableVisualizer';
import {
  validateSQL, validateCSV, validateJSON, validateXML, minifySql
} from '../../shared/utils/validators';
import {
  sqlToJson, sqlToCsv, sqlToXml, csvToSql, jsonToSql, xmlToSql, suggestTableName
} from '../../shared/utils/converters';
import { copyToClipboard } from '../../shared/utils/helpers';
import './SqlTableVisualizer.css';

const escapeHtml = (str = '') =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

const SqlFormatterTab = ({
  formatter,
  updateFormatter,
  deleteFormatter,
  setStatusMessage,
  darkMode,
  formatterStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    sqlInput,
    inputType,
    formatOptions,
    results,
  } = formatter;

  const [sqlText, setSqlText] = useState(sqlInput || '');
  const [currentInputType, setCurrentInputType] = useState(inputType || 'sql');
  const [currentFormatOptions, setCurrentFormatOptions] = useState(formatOptions || {
    language: 'sql',
    indent: '  ',
    uppercase: true,
    linesBetweenQueries: 1
  });
  const [currentResults, setCurrentResults] = useState(results || {
    status: '',
    message: '',
    details: '',
    content: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateTable, setIsCreateTable] = useState(false);
  const [showFormatted, setShowFormatted] = useState(false);

  const sqlInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setSqlText(sqlInput || '');
    setCurrentInputType(inputType || 'sql');
    setCurrentFormatOptions(formatOptions || {
      language: 'sql',
      indent: '  ',
      uppercase: true,
      linesBetweenQueries: 1
    });
    setCurrentResults(results || {
      status: '',
      message: '',
      details: '',
      content: ''
    });
  }, [sqlInput, inputType, formatOptions, results]);

  // Check if the current SQL is a CREATE TABLE statement
  useEffect(() => {
    if (currentInputType === 'sql' && sqlText.trim()) {
      const isCreate = /CREATE\s+TABLE/i.test(sqlText);
      if (isCreate) {
        const parsed = parseCreateTable(sqlText);
        setIsCreateTable(!!parsed);
      } else {
        setIsCreateTable(false);
      }
    } else {
      setIsCreateTable(false);
    }
  }, [sqlText, currentInputType]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFormatter(id, {
        sqlInput: sqlText,
        inputType: currentInputType,
        formatOptions: currentFormatOptions,
        results: currentResults,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, sqlText, currentInputType, currentFormatOptions, currentResults, updateFormatter]);

  // Validate input based on current type
  const validateInput = useCallback((input, type) => {
    switch (type) {
      case 'sql':
        return validateSQL(input);
      case 'csv':
        return validateCSV(input);
      case 'json':
        return validateJSON(input);
      case 'xml':
        return validateXML(input);
      default:
        return { valid: false, message: 'Unknown input type' };
    }
  }, []);

  // Format SQL
  const handleFormat = useCallback(() => {
    if (!sqlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter SQL before formatting.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      return;
    }

    setIsProcessing(true);
    const validationResult = validateSQL(sqlText);
    
    try {
      const sql = validationResult.minified || sqlText;
      const result = sqlFormat(sql, currentFormatOptions);
      
      setSqlText(result);
      setShowFormatted(true);
      setCurrentResults({
        status: validationResult.valid ? 'success' : 'warning',
        message: validationResult.valid ? 'SQL formatted successfully' : validationResult.message,
        content: `<pre class="formatted-sql">${escapeHtml(result)}</pre>`
      });
      setStatusMessage?.(validationResult.valid ? 'SQL formatted' : validationResult.message);
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Formatting failed',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Formatting failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [sqlText, currentFormatOptions, setStatusMessage]);

  // Minify SQL
  const handleMinify = useCallback(() => {
    if (!sqlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter SQL before minifying.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      return;
    }

    setIsProcessing(true);
    const validationResult = validateSQL(sqlText);
    
    try {
      const result = validationResult.minified || minifySql(sqlText);
      setSqlText(result);
      setShowFormatted(true);
      setCurrentResults({
        status: validationResult.valid ? 'success' : 'warning',
        message: validationResult.valid ? 'SQL minified successfully' : validationResult.message,
        content: `<pre class="formatted-sql">${escapeHtml(result)}</pre>`
      });
      setStatusMessage?.(validationResult.valid ? 'SQL minified' : validationResult.message);
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Minification failed',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Minification failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [sqlText, setStatusMessage]);

  // Visualize SQL
  const handleVisualize = useCallback(() => {
    if (!sqlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter SQL before visualizing.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      return;
    }

    setIsProcessing(true);
    const validationResult = validateSQL(sqlText);
    
    try {
      const sql = validationResult.minified || sqlText;
      const formattedForViz = sqlFormat(sql, currentFormatOptions);
      
      setSqlText(formattedForViz);
      setShowFormatted(true);
      
      const container = document.createElement('div');
      container.className = 'sql-viz-container';
      
      const root = createRoot(container);
      root.render(<SqlVisualizer sql={formattedForViz} />);
      
      setCurrentResults({
        status: validationResult.valid ? 'success' : 'warning',
        message: validationResult.valid ? 'SQL visualization generated' : validationResult.message,
        content: container.outerHTML
      });
      setStatusMessage?.(validationResult.valid ? 'SQL visualization generated' : validationResult.message);
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Visualization failed',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Visualization failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [sqlText, currentFormatOptions, setStatusMessage]);

  // Visualize table structure
  const handleTableVisualize = useCallback(() => {
    if (!sqlText.trim() || !isCreateTable) {
      setCurrentResults({
        status: 'warning',
        message: 'Not a CREATE TABLE statement',
        details: 'Please enter a valid CREATE TABLE statement.',
        content: ''
      });
      setStatusMessage?.('Not a CREATE TABLE statement');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formattedForViz = sqlFormat(sqlText, currentFormatOptions);
      
      setSqlText(formattedForViz);
      setShowFormatted(true);
      
      const container = document.createElement('div');
      container.className = 'sql-table-viz-container';
      
      if (darkMode) {
        container.classList.add('dark-mode');
      }
      
      const root = createRoot(container);
      root.render(<SqlTableVisualizer sql={formattedForViz} />);
      
      setCurrentResults({
        status: 'success',
        message: 'Table structure visualization generated',
        content: container.outerHTML
      });
      setStatusMessage?.('Table structure visualization generated');
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Table visualization failed',
        details: 'Could not parse the CREATE TABLE statement. Please check your syntax.',
        content: ''
      });
      setStatusMessage?.('Table visualization failed');
    } finally {
      setIsProcessing(false);
    }
  }, [sqlText, currentFormatOptions, darkMode, isCreateTable, setStatusMessage]);

  // Convert between formats
  const handleConvert = useCallback((sourceType, targetType) => {
    if (!sqlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Input is empty',
        details: 'Please enter data before converting.',
        content: ''
      });
      setStatusMessage?.('Input is empty');
      return;
    }

    setIsProcessing(true);
    
    try {
      const validationResult = validateInput(sqlText, sourceType);
      if (!validationResult.valid) {
        setCurrentResults({
          status: 'error',
          message: 'Conversion failed - invalid input',
          details: validationResult.message,
          content: ''
        });
        setStatusMessage?.(`Invalid input: ${validationResult.message}`);
        setIsProcessing(false);
        return;
      }
      
      const input = validationResult.minified || sqlText;
      let result = '';
      
      // SQL to other formats
      if (sourceType === 'sql' && targetType === 'json') {
        result = JSON.stringify(sqlToJson(input), null, 2);
        setCurrentResults({
          status: 'success',
          message: 'SQL converted to JSON',
          content: `<pre class="formatted-json">${escapeHtml(result)}</pre>`
        });
        setStatusMessage?.('SQL converted to JSON');
      } else if (sourceType === 'sql' && targetType === 'csv') {
        result = sqlToCsv(input);
        setCurrentResults({
          status: 'success',
          message: 'SQL converted to CSV',
          content: `<pre class="formatted-csv">${escapeHtml(result)}</pre>`
        });
        setStatusMessage?.('SQL converted to CSV');
      } else if (sourceType === 'sql' && targetType === 'xml') {
        result = sqlToXml(input);
        setCurrentResults({
          status: 'success',
          message: 'SQL converted to XML',
          content: `<pre class="formatted-xml">${escapeHtml(result)}</pre>`
        });
        setStatusMessage?.('SQL converted to XML');
      }
      // Other formats to SQL
      else if (sourceType === 'csv' && targetType === 'sql') {
        const tableName = suggestTableName(input, 'csv');
        result = csvToSql(input, tableName);
        setSqlText(result);
        setShowFormatted(true);
        setCurrentResults({
          status: 'success',
          message: 'CSV converted to SQL',
          content: `<pre class="formatted-sql">${escapeHtml(result)}</pre>`
        });
        setStatusMessage?.('CSV converted to SQL');
      } else if (sourceType === 'json' && targetType === 'sql') {
        const tableName = suggestTableName(input, 'json');
        result = jsonToSql(input, tableName);
        setSqlText(result);
        setShowFormatted(true);
        setCurrentResults({
          status: 'success',
          message: 'JSON converted to SQL',
          content: `<pre class="formatted-sql">${escapeHtml(result)}</pre>`
        });
        setStatusMessage?.('JSON converted to SQL');
      } else if (sourceType === 'xml' && targetType === 'sql') {
        const tableName = suggestTableName(input, 'xml');
        result = xmlToSql(input, tableName);
        setSqlText(result);
        setShowFormatted(true);
        setCurrentResults({
          status: 'success',
          message: 'XML converted to SQL',
          content: `<pre class="formatted-sql">${escapeHtml(result)}</pre>`
        });
        setStatusMessage?.('XML converted to SQL');
      }
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Conversion failed',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Conversion failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [sqlText, validateInput, setStatusMessage]);

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSqlText(e.target.result);
      setShowFormatted(false);
      setCurrentResults({
        status: 'info',
        message: `Loaded "${file.name}"`,
        details: `${(e.target.result.length / 1024).toFixed(2)} KB loaded.`,
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

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!sqlText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to copy',
        details: 'Input area is empty.',
        content: ''
      });
      setStatusMessage?.('Nothing to copy');
      return;
    }

    copyToClipboard(sqlText)
      .then(() => {
        setCurrentResults({
          status: 'success',
          message: 'Content copied to clipboard',
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
  }, [sqlText, setStatusMessage]);

  // Download SQL
  const handleDownload = useCallback(() => {
    const contentToDownload = sqlText;
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
      const blob = new Blob([contentToDownload], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sql-${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCurrentResults({
        status: 'success',
        message: 'File downloaded successfully',
        details: '',
        content: ''
      });
      setStatusMessage?.(`File downloaded: ${link.download}`);
    } catch (error) {
      setCurrentResults({
        status: 'error',
        message: 'Download failed',
        details: error.message,
        content: ''
      });
      setStatusMessage?.(`Download failed: ${error.message}`);
    }
  }, [sqlText, setStatusMessage]);

  // Clear content
  const handleClear = useCallback(() => {
    setSqlText('');
    setShowFormatted(false);
    setCurrentResults({
      status: '',
      message: '',
      details: '',
      content: ''
    });
    setStatusMessage?.('Content cleared');
  }, [setStatusMessage]);

  // Toggle input type
  const toggleInputType = useCallback((type) => {
    if (type === currentInputType) return;
    setCurrentInputType(type);
    setShowFormatted(false);
    setCurrentResults({
      status: '',
      message: '',
      details: '',
      content: ''
    });
  }, [currentInputType]);

  return (
    <div className={`sql-formatter-tab-content ${formatterStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="sql-formatter-options-section">
        <div className="options-row">
          <div className="option-group">
            <label htmlFor={`input-type-${id}`}>Input Type:</label>
            <select
              id={`input-type-${id}`}
              value={currentInputType}
              onChange={(e) => toggleInputType(e.target.value)}
            >
              <option value="sql">SQL</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </select>
          </div>

          {currentInputType === 'sql' && (
            <>
              <div className="option-group">
                <label htmlFor={`dialect-${id}`}>Dialect:</label>
                <select
                  id={`dialect-${id}`}
                  value={currentFormatOptions.language}
                  onChange={(e) => setCurrentFormatOptions({ ...currentFormatOptions, language: e.target.value })}
                >
                  <option value="sql">Standard SQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mariadb">MariaDB</option>
                  <option value="mssql">SQL Server</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>

              <div className="option-group">
                <label htmlFor={`indent-${id}`}>Indent:</label>
                <select
                  id={`indent-${id}`}
                  value={currentFormatOptions.indent}
                  onChange={(e) => setCurrentFormatOptions({ ...currentFormatOptions, indent: e.target.value })}
                >
                  <option value="  ">2 spaces</option>
                  <option value="    ">4 spaces</option>
                  <option value="        ">8 spaces</option>
                  <option value="\t">Tab</option>
                </select>
              </div>

              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={currentFormatOptions.uppercase}
                    onChange={(e) => setCurrentFormatOptions({ ...currentFormatOptions, uppercase: e.target.checked })}
                  />
                  Uppercase Keywords
                </label>
              </div>
            </>
          )}

          <div className="option-group">
            <label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".sql,.csv,.json,.xml"
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
      <div className="sql-formatter-input-section">
        <textarea
          ref={sqlInputRef}
          value={sqlText}
          onChange={(e) => {
            setSqlText(e.target.value);
            setShowFormatted(false);
          }}
          placeholder={`Type or paste ${currentInputType.toUpperCase()} here…`}
          className={`sql-formatter-textarea ${showFormatted ? 'formatted' : ''}`}
          spellCheck="false"
          rows={20}
        />
      </div>

      {/* Actions Section */}
      <div className="sql-formatter-actions-section">
        {currentInputType === 'sql' ? (
          <>
            <button
              className="action-button format-sql-button"
              onClick={handleFormat}
              disabled={!sqlText.trim() || isProcessing}
            >
              {isProcessing ? 'Formatting...' : 'Format SQL'}
            </button>
            <button
              className="secondary-button"
              onClick={handleMinify}
              disabled={!sqlText.trim() || isProcessing}
            >
              Minify
            </button>
            <button
              className="secondary-button"
              onClick={handleVisualize}
              disabled={!sqlText.trim() || isProcessing}
            >
              Visualize
            </button>
            {isCreateTable && (
              <button
                className="secondary-button"
                onClick={handleTableVisualize}
                disabled={!sqlText.trim() || isProcessing}
              >
                Table Structure
              </button>
            )}
            <button
              className="secondary-button"
              onClick={() => handleConvert('sql', 'json')}
              disabled={!sqlText.trim() || isProcessing}
            >
              SQL → JSON
            </button>
            <button
              className="secondary-button"
              onClick={() => handleConvert('sql', 'csv')}
              disabled={!sqlText.trim() || isProcessing}
            >
              SQL → CSV
            </button>
            <button
              className="secondary-button"
              onClick={() => handleConvert('sql', 'xml')}
              disabled={!sqlText.trim() || isProcessing}
            >
              SQL → XML
            </button>
            <button
              className="secondary-button"
              onClick={handleCopy}
              disabled={!sqlText.trim()}
            >
              Copy
            </button>
            <button
              className="secondary-button"
              onClick={handleDownload}
              disabled={!sqlText.trim()}
            >
              Download
            </button>
            <button
              className="secondary-button"
              onClick={handleClear}
              disabled={!sqlText.trim()}
            >
              Clear
            </button>
          </>
        ) : (
          <>
            <button
              className="action-button convert-button"
              onClick={() => handleConvert(currentInputType, 'sql')}
              disabled={!sqlText.trim() || isProcessing}
            >
              {isProcessing ? 'Converting...' : `Convert ${currentInputType.toUpperCase()} → SQL`}
            </button>
            <button
              className="secondary-button"
              onClick={handleCopy}
              disabled={!sqlText.trim()}
            >
              Copy
            </button>
            <button
              className="secondary-button"
              onClick={handleDownload}
              disabled={!sqlText.trim()}
            >
              Download
            </button>
            <button
              className="secondary-button"
              onClick={handleClear}
              disabled={!sqlText.trim()}
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Results Section */}
      {currentResults.status && (
        <div className={`sql-formatter-results-section ${currentResults.status}`}>
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

export default SqlFormatterTab;



