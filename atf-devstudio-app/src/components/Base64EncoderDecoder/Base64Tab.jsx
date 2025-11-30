// Base64Tab.jsx
// Tab content for Base64 encoding/decoding

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  encodeToBase64,
  decodeFromBase64,
  generateResultHtml,
  isValidBase64
} from '../../shared/utils/base64Utils';
import { copyToClipboard } from '../../shared/utils/helpers';

const Base64Tab = ({
  base64,
  updateBase64,
  deleteBase64,
  setStatusMessage,
  darkMode,
  base64Style = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    inputText,
    outputText,
    mode,
    errorMessage,
    options,
  } = base64;

  const [input, setInput] = useState(inputText || '');
  const [output, setOutput] = useState(outputText || '');
  const [currentMode, setCurrentMode] = useState(mode || 'encode');
  const [currentError, setCurrentError] = useState(errorMessage || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOptions, setCurrentOptions] = useState(options || {
    urlSafe: false,
    autoExecute: true,
    showLineBreaks: true,
    lineLength: 76,
    autoTrim: false,
    showBinary: false,
  });

  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const resultsRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setInput(inputText || '');
    setOutput(outputText || '');
    setCurrentMode(mode || 'encode');
    setCurrentError(errorMessage || '');
    setCurrentOptions(options || {
      urlSafe: false,
      autoExecute: true,
      showLineBreaks: true,
      lineLength: 76,
      autoTrim: false,
      showBinary: false,
    });
  }, [inputText, outputText, mode, errorMessage, options]);

  // Execute the selected operation (encode or decode)
  const executeOperation = useCallback((modeOverride = null) => {
    const modeToUse = modeOverride || currentMode;
    setIsProcessing(true);
    setCurrentError('');

    if (!input.trim()) {
      const error = 'Please enter text to process';
      setCurrentError(error);
      setOutput('');
      setIsProcessing(false);
      updateBase64(id, {
        inputText: input,
        outputText: '',
        errorMessage: error,
      });
      return;
    }

    try {
      if (modeToUse === 'encode') {
        // Encode to Base64
        const result = encodeToBase64(input, {
          urlSafe: currentOptions.urlSafe,
          showLineBreaks: currentOptions.showLineBreaks,
          lineLength: currentOptions.lineLength || 76,
          autoTrim: currentOptions.autoTrim
        });
        
        setOutput(result);
        setCurrentError('');
        updateBase64(id, {
          inputText: input,
          outputText: result,
          errorMessage: '',
        });
        setStatusMessage?.(`Text encoded to Base64`);
      } else if (modeToUse === 'decode') {
        // Validate input before decoding
        const cleanInput = input.replace(/[\r\n\s]/g, '');
        if (!isValidBase64(cleanInput, currentOptions.urlSafe)) {
          const error = 'The input doesn\'t appear to be a valid Base64 string';
          setCurrentError(error);
          setOutput('');
          setIsProcessing(false);
          updateBase64(id, {
            inputText: input,
            outputText: '',
            errorMessage: error,
          });
          setStatusMessage?.(error);
          return;
        }
        
        // Decode from Base64
        const result = decodeFromBase64(input, {
          urlSafe: currentOptions.urlSafe,
          autoTrim: currentOptions.autoTrim
        });
        
        setOutput(result);
        setCurrentError('');
        updateBase64(id, {
          inputText: input,
          outputText: result,
          errorMessage: '',
        });
        setStatusMessage?.(`Base64 decoded successfully`);
      }
    } catch (err) {
      const errorMsg = `Operation failed: ${err.message}`;
      setCurrentError(errorMsg);
      setOutput('');
      updateBase64(id, {
        inputText: input,
        outputText: '',
        errorMessage: errorMsg,
      });
      setStatusMessage?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [input, currentMode, currentOptions, id, updateBase64, setStatusMessage]);

  // Auto-execute when input changes if enabled
  useEffect(() => {
    if (currentOptions.autoExecute && input) {
      const timeoutId = setTimeout(() => {
        executeOperation();
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [input, currentMode, currentOptions.urlSafe, currentOptions.showLineBreaks, currentOptions.lineLength, currentOptions.autoTrim, currentOptions.autoExecute, executeOperation]);

  // Swap input and output
  const handleSwap = useCallback(() => {
    if (!output) return;
    
    setInput(output);
    setOutput('');
    setCurrentError('');
    updateBase64(id, {
      inputText: output,
      outputText: '',
      errorMessage: '',
    });
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [output, id, updateBase64]);

  // Copy output to clipboard
  const handleCopyOutput = useCallback(() => {
    if (!output) return;
    
    copyToClipboard(output)
      .then(() => {
        setStatusMessage?.('Output copied to clipboard');
      })
      .catch(() => {
        setStatusMessage?.('Failed to copy to clipboard');
      });
  }, [output, setStatusMessage]);

  // Copy input to clipboard
  const handleCopyInput = useCallback(() => {
    if (!input) return;
    
    copyToClipboard(input)
      .then(() => {
        setStatusMessage?.('Input copied to clipboard');
      })
      .catch(() => {
        setStatusMessage?.('Failed to copy to clipboard');
      });
  }, [input, setStatusMessage]);

  // Clear all fields
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setCurrentError('');
    updateBase64(id, {
      inputText: '',
      outputText: '',
      errorMessage: '',
    });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [id, updateBase64]);

  // Generate results HTML
  const generateResultsHtml = () => {
    if (currentError) {
      return `
        <div class="base64-error">
          <p style="color: #ef4444; padding: 12px; background-color: ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'}; border-radius: 6px; border-left: 4px solid #ef4444;">
            ${currentError}
          </p>
        </div>
      `;
    }

    if (!output) {
      return '';
    }

    return generateResultHtml(output, {
      mode: currentMode,
      urlSafe: currentOptions.urlSafe,
      showBinary: currentOptions.showBinary
    });
  };

  // Handle encode button click
  const handleEncode = useCallback(() => {
    setCurrentMode('encode');
    updateBase64(id, { mode: 'encode' });
    if (input.trim()) {
      executeOperation('encode');
    }
  }, [input, id, updateBase64, executeOperation]);

  // Handle decode button click
  const handleDecode = useCallback(() => {
    setCurrentMode('decode');
    updateBase64(id, { mode: 'decode' });
    if (input.trim()) {
      executeOperation('decode');
    }
  }, [input, id, updateBase64, executeOperation]);

  return (
    <div className={`base64-tab-content ${darkMode ? 'dark-mode' : ''} ${base64Style === 'modern' ? 'modern-style' : ''}`}>
      {/* Input Section */}
      <div className="base64-input-section">
        <div className="input-group">
          <div className="input-header">
            <label className="input-label">
              Text to Encode or Base64 to Decode
            </label>
            <div className="input-actions">
              <button
                className="copy-button-small"
                onClick={handleCopyInput}
                disabled={!input}
                title="Copy input"
              >
                📋
              </button>
            </div>
          </div>
          <textarea
            ref={inputRef}
            className="base64-textarea"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              updateBase64(id, { inputText: e.target.value });
            }}
            placeholder="Enter text to encode or Base64 string to decode..."
            rows={10}
          />
        </div>
      </div>

      {/* Options Section */}
      <div className="base64-options-section">
        <div className="options-row">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={currentOptions.urlSafe}
              onChange={(e) => {
                const newOptions = { ...currentOptions, urlSafe: e.target.checked };
                setCurrentOptions(newOptions);
                updateBase64(id, { options: newOptions });
              }}
            />
            <span>URL-safe Base64</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={currentOptions.autoExecute}
              onChange={(e) => {
                const newOptions = { ...currentOptions, autoExecute: e.target.checked };
                setCurrentOptions(newOptions);
                updateBase64(id, { options: newOptions });
              }}
            />
            <span>Auto Execute</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={currentOptions.showLineBreaks}
              onChange={(e) => {
                const newOptions = { ...currentOptions, showLineBreaks: e.target.checked };
                setCurrentOptions(newOptions);
                updateBase64(id, { options: newOptions });
              }}
            />
            <span>Show Line Breaks</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={currentOptions.showBinary}
              onChange={(e) => {
                const newOptions = { ...currentOptions, showBinary: e.target.checked };
                setCurrentOptions(newOptions);
                updateBase64(id, { options: newOptions });
              }}
            />
            <span>Show Binary</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="base64-actions-section">
        <div className="encode-decode-buttons">
          <button
            className={`encode-base64-button ${currentMode === 'encode' ? 'active' : ''}`}
            onClick={handleEncode}
            disabled={!input.trim() || (isProcessing && currentMode === 'encode')}
          >
            <span className="button-icon">🔐</span>
            <span className="button-text">
              {isProcessing && currentMode === 'encode' ? 'Encoding...' : 'Encode to Base64'}
            </span>
            {!isProcessing && currentMode === 'encode' && <span className="button-arrow">→</span>}
          </button>
          <button
            className={`decode-base64-button ${currentMode === 'decode' ? 'active' : ''}`}
            onClick={handleDecode}
            disabled={!input.trim() || (isProcessing && currentMode === 'decode')}
          >
            <span className="button-icon">🔓</span>
            <span className="button-text">
              {isProcessing && currentMode === 'decode' ? 'Decoding...' : 'Decode from Base64'}
            </span>
            {!isProcessing && currentMode === 'decode' && <span className="button-arrow">→</span>}
          </button>
        </div>
        <div className="secondary-actions">
          <button
            className="swap-button"
            onClick={handleSwap}
            disabled={!output}
            title="Swap input and output"
          >
            🔄 Swap
          </button>
          <button
            className="clear-button"
            onClick={handleClear}
            disabled={!input && !output}
            title="Clear all"
          >
            🗑️ Clear
          </button>
          {output && (
            <button
              className="copy-output-button"
              onClick={handleCopyOutput}
              title="Copy output to clipboard"
            >
              📋 Copy Output
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {(output || currentError) && (
        <div className="base64-results-section">
          <div
            ref={resultsRef}
            className="base64-results-content"
            dangerouslySetInnerHTML={{ __html: generateResultsHtml() }}
          />
        </div>
      )}
    </div>
  );
};

export default Base64Tab;

