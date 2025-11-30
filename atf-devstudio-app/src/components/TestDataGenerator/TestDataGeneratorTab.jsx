// TestDataGeneratorTab.jsx
// Tab content for test data generation

import { useState, useRef, useEffect, useCallback } from 'react';
import { validateSchema } from '../../shared/utils/validators';
import { 
  formatOutput, 
  applyHighlighting,
  generateDataFromSchema
} from '../../shared/utils/generators';
import { copyToClipboard } from '../../shared/utils/helpers';
import { parseSchema, detectSchemaFormat } from '../../shared/utils/schemaParsers';

const escapeHtml = (str = '') =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

const TestDataGeneratorTab = ({
  generator,
  updateGenerator,
  deleteGenerator,
  setStatusMessage,
  darkMode,
  generatorStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    schema,
    schemaFormat: savedSchemaFormat,
    generatorOptions,
    results,
  } = generator;

  const [schemaText, setSchemaText] = useState(schema || '');
  const [schemaFormat, setSchemaFormat] = useState(savedSchemaFormat || 'json'); // 'json', 'yaml', 'xml', 'toml', 'csv'
  const [currentOptions, setCurrentOptions] = useState(generatorOptions || {
    outputFormat: 'json',
    count: 5,
    seed: '',
    useRandomSeed: true
  });
  const [currentResults, setCurrentResults] = useState(results || {
    status: '',
    message: '',
    details: '',
    content: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const schemaInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setSchemaText(schema || '');
    if (schema) {
      // Auto-detect format when schema is loaded
      try {
        const detected = detectSchemaFormat(schema);
        setSchemaFormat(detected);
      } catch (e) {
        // Keep current format if detection fails
      }
    }
    setCurrentOptions(generatorOptions || {
      outputFormat: 'json',
      count: 5,
      seed: '',
      useRandomSeed: true
    });
    setCurrentResults(results || {
      status: '',
      message: '',
      details: '',
      content: ''
    });
  }, [schema, generatorOptions, results]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateGenerator(id, {
        schema: schemaText,
        schemaFormat: schemaFormat,
        generatorOptions: currentOptions,
        results: currentResults,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, schemaText, schemaFormat, currentOptions, currentResults, updateGenerator]);

  // Generate data
  const handleGenerate = useCallback(async () => {
    if (!schemaText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Schema is empty',
        details: 'Please enter a schema before generating data.',
        content: ''
      });
      setStatusMessage?.('Schema is empty');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Auto-detect format if not set
      let format = schemaFormat;
      if (!format || format === 'json') {
        try {
          format = detectSchemaFormat(schemaText);
          setSchemaFormat(format);
        } catch (e) {
          format = 'json';
        }
      }
      
      const validationResult = await validateSchema(schemaText, format);
      
      if (!validationResult.valid) {
        setCurrentResults({
          status: 'error',
          message: 'Schema Error',
          details: validationResult.message,
          content: ''
        });
        setStatusMessage?.(`Schema Error: ${validationResult.message}`);
        setIsProcessing(false);
        return;
      }
      
      // Parse schema based on format
      const schemaObj = await parseSchema(schemaText, format);
      const { count, outputFormat, seed, useRandomSeed } = currentOptions;
      const generatedData = generateDataFromSchema(schemaObj, count, useRandomSeed ? null : seed);
      
      const formattedOutput = formatOutput(generatedData, outputFormat);
      const highlightedOutput = applyHighlighting(formattedOutput, outputFormat);
      
      setCurrentResults({
        status: 'success',
        message: `Generated ${count} data ${count === 1 ? 'item' : 'items'}`,
        details: `Output format: ${outputFormat.toUpperCase()}`,
        content: highlightedOutput
      });
      setStatusMessage?.(`Generated ${count} data ${count === 1 ? 'item' : 'items'}`);
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Generation Error',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Generation Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [schemaText, currentOptions, setStatusMessage]);

  // Format schema
  const handleFormat = useCallback(async () => {
    if (!schemaText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Schema is empty',
        details: 'Please enter a schema before formatting.',
        content: ''
      });
      setStatusMessage?.('Schema is empty');
      return;
    }

    try {
      let format = schemaFormat;
      if (!format || format === 'json') {
        format = detectSchemaFormat(schemaText);
        setSchemaFormat(format);
      }
      
      const validationResult = await validateSchema(schemaText, format);
      
      if (!validationResult.valid) {
        setCurrentResults({
          status: 'error',
          message: 'Schema Error',
          details: validationResult.message,
          content: ''
        });
        setStatusMessage?.(`Schema Error: ${validationResult.message}`);
        return;
      }
      
      // Parse and format as JSON
      const schemaObj = await parseSchema(schemaText, format);
      const formattedSchema = JSON.stringify(schemaObj, null, 2);
      setSchemaText(formattedSchema);
      setSchemaFormat('json'); // Convert to JSON after formatting
      
      setCurrentResults({
        status: 'success',
        message: 'Schema formatted',
        details: 'Schema has been formatted with proper indentation.',
        content: `<pre class="formatted-json">${escapeHtml(formattedSchema)}</pre>`
      });
      setStatusMessage?.('Schema formatted');
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Format Error',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Format Error: ${err.message}`);
    }
  }, [schemaText, setStatusMessage]);

  // Validate schema
  const handleValidate = useCallback(async () => {
    if (!schemaText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Schema is empty',
        details: 'Please enter a schema before validating.',
        content: ''
      });
      setStatusMessage?.('Schema is empty');
      return;
    }

    try {
      let format = schemaFormat;
      if (!format || format === 'json') {
        format = detectSchemaFormat(schemaText);
        setSchemaFormat(format);
      }
      
      const validationResult = await validateSchema(schemaText, format);
      
      if (validationResult.valid) {
        setCurrentResults({
          status: 'success',
          message: 'Schema is valid',
          details: 'The schema is well-formed and can be used to generate data.',
          content: ''
        });
        setStatusMessage?.('Schema is valid');
      } else {
        setCurrentResults({
          status: 'error',
          message: 'Schema Error',
          details: validationResult.message,
          content: ''
        });
        setStatusMessage?.(`Schema Error: ${validationResult.message}`);
      }
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Validation Error',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Validation Error: ${err.message}`);
    }
  }, [schemaText, setStatusMessage]);

  // Generate sample
  const handleSample = useCallback(async () => {
    if (!schemaText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Schema is empty',
        details: 'Please enter a schema before generating a sample.',
        content: ''
      });
      setStatusMessage?.('Schema is empty');
      return;
    }

    try {
      let format = schemaFormat;
      if (!format || format === 'json') {
        format = detectSchemaFormat(schemaText);
        setSchemaFormat(format);
      }
      
      const validationResult = await validateSchema(schemaText, format);
      
      if (!validationResult.valid) {
        setCurrentResults({
          status: 'error',
          message: 'Schema Error',
          details: validationResult.message,
          content: ''
        });
        setStatusMessage?.(`Schema Error: ${validationResult.message}`);
        return;
      }
      
      const schemaObj = await parseSchema(schemaText, format);
      const sampleData = generateDataFromSchema(schemaObj, 1);
      const formattedOutput = formatOutput(sampleData, currentOptions.outputFormat);
      const highlightedOutput = applyHighlighting(formattedOutput, currentOptions.outputFormat);
      
      setCurrentResults({
        status: 'success',
        message: 'Sample data generated',
        details: `Output format: ${currentOptions.outputFormat.toUpperCase()}`,
        content: highlightedOutput
      });
      setStatusMessage?.('Sample data generated');
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Generation Error',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Generation Error: ${err.message}`);
    }
  }, [schemaText, currentOptions.outputFormat, setStatusMessage]);

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setSchemaText(content);
      
      // Auto-detect format from file extension
      const fileName = file.name.toLowerCase();
      let detectedFormat = 'json';
      if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
        detectedFormat = 'yaml';
      } else if (fileName.endsWith('.xml')) {
        detectedFormat = 'xml';
      } else if (fileName.endsWith('.toml')) {
        detectedFormat = 'toml';
      } else if (fileName.endsWith('.csv')) {
        detectedFormat = 'csv';
      } else {
        // Try to detect from content
        try {
          detectedFormat = detectSchemaFormat(content);
        } catch (e) {
          // Keep default
        }
      }
      setSchemaFormat(detectedFormat);
      
      setCurrentResults({
        status: 'info',
        message: `Loaded "${file.name}"`,
        details: `${(content.length / 1024).toFixed(2)} KB loaded. Format: ${detectedFormat.toUpperCase()}`,
        content: ''
      });
      setStatusMessage?.(`Loaded "${file.name}" (${detectedFormat.toUpperCase()})`);
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
  const handleCopy = useCallback(async () => {
    if (!schemaText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to copy',
        details: 'Generate data first before copying.',
        content: ''
      });
      setStatusMessage?.('Nothing to copy');
      return;
    }
    
    try {
      let format = schemaFormat;
      if (!format || format === 'json') {
        format = detectSchemaFormat(schemaText);
        setSchemaFormat(format);
      }
      
      const validationResult = await validateSchema(schemaText, format);
      
      if (!validationResult.valid) {
        setCurrentResults({
          status: 'error',
          message: 'Schema Error',
          details: validationResult.message,
          content: ''
        });
        setStatusMessage?.(`Schema Error: ${validationResult.message}`);
        return;
      }
      
      const schemaObj = await parseSchema(schemaText, format);
      const { count, outputFormat, seed, useRandomSeed } = currentOptions;
      const generatedData = generateDataFromSchema(schemaObj, count, useRandomSeed ? null : seed);
      const formattedOutput = formatOutput(generatedData, outputFormat);
      
      copyToClipboard(formattedOutput)
        .then(() => {
          setCurrentResults({
            status: 'success',
            message: 'Data copied to clipboard',
            details: `${count} ${count === 1 ? 'item' : 'items'} in ${outputFormat.toUpperCase()} format.`,
            content: ''
          });
          setStatusMessage?.(`Copied ${count} ${count === 1 ? 'item' : 'items'} to clipboard`);
        })
        .catch(err => {
          setCurrentResults({
            status: 'error',
            message: 'Copy Error',
            details: err.message,
            content: ''
          });
          setStatusMessage?.(`Copy Error: ${err.message}`);
        });
    } catch (err) {
      setCurrentResults({
        status: 'error',
        message: 'Copy Error',
        details: err.message,
        content: ''
      });
      setStatusMessage?.(`Copy Error: ${err.message}`);
    }
  }, [schemaText, currentOptions, setStatusMessage]);

  // Download generated data
  const handleDownload = useCallback(async () => {
    if (!schemaText.trim()) {
      setCurrentResults({
        status: 'warning',
        message: 'Nothing to download',
        details: 'Generate data first before downloading.',
        content: ''
      });
      setStatusMessage?.('Nothing to download');
      return;
    }

    try {
      let format = schemaFormat;
      if (!format || format === 'json') {
        format = detectSchemaFormat(schemaText);
        setSchemaFormat(format);
      }
      
      const validationResult = await validateSchema(schemaText, format);
      
      if (!validationResult.valid) {
        setCurrentResults({
          status: 'error',
          message: 'Schema Error',
          details: validationResult.message,
          content: ''
        });
        setStatusMessage?.(`Schema Error: ${validationResult.message}`);
        return;
      }
      
      const schemaObj = await parseSchema(schemaText, format);
      const { count, outputFormat, seed, useRandomSeed } = currentOptions;
      const generatedData = generateDataFromSchema(schemaObj, count, useRandomSeed ? null : seed);
      const formattedOutput = formatOutput(generatedData, outputFormat);
      
      const blob = new Blob([formattedOutput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-data-${new Date().toISOString().slice(0, 10)}.${outputFormat}`;
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
  }, [schemaText, currentOptions, setStatusMessage]);

  // Clear schema
  const handleClear = useCallback(() => {
    setSchemaText('');
    setCurrentResults({
      status: 'info',
      message: 'Schema Cleared',
      details: 'The schema has been cleared.',
      content: ''
    });
    setStatusMessage?.('Schema cleared');
  }, [setStatusMessage]);

  return (
    <div className={`test-data-generator-tab-content ${generatorStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="test-data-generator-options-section">
        <div className="options-row">
          <div className="option-group">
            <label htmlFor={`schema-format-${id}`}>Schema Format:</label>
            <select
              id={`schema-format-${id}`}
              value={schemaFormat}
              onChange={(e) => setSchemaFormat(e.target.value)}
            >
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="xml">XML</option>
              <option value="toml">TOML</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="option-group">
            <label htmlFor={`output-format-${id}`}>Output Format:</label>
            <select
              id={`output-format-${id}`}
              value={currentOptions.outputFormat}
              onChange={(e) => setCurrentOptions({ ...currentOptions, outputFormat: e.target.value })}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
              <option value="yaml">YAML</option>
            </select>
          </div>

          <div className="option-group">
            <label htmlFor={`count-${id}`}>Count:</label>
            <input
              id={`count-${id}`}
              type="number"
              min="1"
              max="1000"
              value={currentOptions.count}
              onChange={(e) => setCurrentOptions({ ...currentOptions, count: parseInt(e.target.value) || 1 })}
              style={{ width: '80px' }}
            />
          </div>

          <div className="option-group">
            <label>
              <input
                type="checkbox"
                checked={currentOptions.useRandomSeed}
                onChange={(e) => setCurrentOptions({ ...currentOptions, useRandomSeed: e.target.checked })}
              />
              Random Seed
            </label>
          </div>

          {!currentOptions.useRandomSeed && (
            <div className="option-group">
              <label htmlFor={`seed-${id}`}>Seed:</label>
              <input
                id={`seed-${id}`}
                type="text"
                value={currentOptions.seed}
                onChange={(e) => setCurrentOptions({ ...currentOptions, seed: e.target.value })}
                placeholder="Enter seed"
                style={{ width: '120px' }}
              />
            </div>
          )}

          <div className="option-group">
            <label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,.yaml,.yml,.xml,.toml,.csv"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Schema
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="test-data-generator-input-section">
        <textarea
          ref={schemaInputRef}
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
          placeholder="Type or paste your schema here (JSON, YAML, XML, TOML, or CSV)…"
          className="test-data-generator-textarea"
          spellCheck="false"
          rows={20}
        />
      </div>

      {/* Actions Section */}
      <div className="test-data-generator-actions-section">
        <button
          className="action-button generate-button"
          onClick={handleGenerate}
          disabled={!schemaText.trim() || isProcessing}
        >
          {isProcessing ? 'Generating...' : `Generate ${currentOptions.count} Data ${currentOptions.count === 1 ? 'Item' : 'Items'}`}
        </button>
        <button
          className="secondary-button"
          onClick={handleFormat}
          disabled={!schemaText.trim()}
        >
          Format Schema
        </button>
        <button
          className="secondary-button"
          onClick={handleValidate}
          disabled={!schemaText.trim()}
        >
          Validate
        </button>
        <button
          className="secondary-button"
          onClick={handleSample}
          disabled={!schemaText.trim()}
        >
          Sample
        </button>
        <button
          className="secondary-button"
          onClick={handleCopy}
          disabled={!schemaText.trim()}
        >
          Copy
        </button>
        <button
          className="secondary-button"
          onClick={handleDownload}
          disabled={!schemaText.trim()}
        >
          Download
        </button>
        <button
          className="secondary-button"
          onClick={handleClear}
          disabled={!schemaText.trim()}
        >
          Clear
        </button>
      </div>

      {/* Results Section */}
      {currentResults.status && (
        <div className={`test-data-generator-results-section ${currentResults.status}`}>
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

export default TestDataGeneratorTab;

