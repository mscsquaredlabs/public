// CronTab.jsx
// Tab content for Cron Expression operations

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  validateCronExpression,
  explainCronExpression,
  generateCronExpression,
  updateFieldValueByType,
  generateResultsHtml,
  getCommonExpressions
} from '../../shared/utils/cronUtils';
import { copyToClipboard } from '../../shared/utils/helpers';

const CronTab = ({
  cron,
  updateCron,
  deleteCron,
  setStatusMessage,
  darkMode,
  cronStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    cronExpression,
    mode,
    explanationResult,
    errorMessage,
    generateFields,
  } = cron;

  const [expression, setExpression] = useState(cronExpression || '* * * * *');
  const [currentMode, setCurrentMode] = useState(mode || 'explain');
  const [currentExplanation, setCurrentExplanation] = useState(explanationResult || null);
  const [currentError, setCurrentError] = useState(errorMessage || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFields, setCurrentFields] = useState(generateFields || {
    minutes: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '59' }, every: { start: '0', step: '1' } },
    hours: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '23' }, every: { start: '0', step: '1' } },
    dayOfMonth: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '31' }, every: { start: '1', step: '1' } },
    month: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '12' }, every: { start: '1', step: '1' } },
    dayOfWeek: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '6' }, every: { start: '0', step: '1' } },
  });

  const cronInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Common cron expressions
  const commonExpressions = getCommonExpressions();

  // Field definitions
  const fields = [
    { name: 'minutes', label: 'Minutes', range: '0-59' },
    { name: 'hours', label: 'Hours', range: '0-23' },
    { name: 'dayOfMonth', label: 'Day of Month', range: '1-31' },
    { name: 'month', label: 'Month', range: '1-12 or JAN-DEC' },
    { name: 'dayOfWeek', label: 'Day of Week', range: '0-6 or SUN-SAT' },
  ];

  // Sync with prop changes
  useEffect(() => {
    setExpression(cronExpression || '* * * * *');
    setCurrentMode(mode || 'explain');
    setCurrentExplanation(explanationResult || null);
    setCurrentError(errorMessage || '');
    setCurrentFields(generateFields || {
      minutes: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '59' }, every: { start: '0', step: '1' } },
      hours: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '23' }, every: { start: '0', step: '1' } },
      dayOfMonth: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '31' }, every: { start: '1', step: '1' } },
      month: { type: 'every', value: '*', specific: '1', range: { start: '1', end: '12' }, every: { start: '1', step: '1' } },
      dayOfWeek: { type: 'every', value: '*', specific: '0', range: { start: '0', end: '6' }, every: { start: '0', step: '1' } },
    });
  }, [cronExpression, mode, explanationResult, errorMessage, generateFields]);

  // Explain cron expression
  const handleExplain = useCallback(() => {
    setIsProcessing(true);
    setCurrentError('');
    setCurrentExplanation(null);

    if (!expression.trim()) {
      const error = 'Please enter a cron expression';
      setCurrentError(error);
      setIsProcessing(false);
      updateCron(id, {
        cronExpression: expression,
        errorMessage: error,
        explanationResult: null,
      });
      setStatusMessage?.(error);
      return;
    }

    try {
      const validationResult = validateCronExpression(expression);
      if (!validationResult.valid) {
        setCurrentError(validationResult.message);
        setIsProcessing(false);
        updateCron(id, {
          cronExpression: expression,
          errorMessage: validationResult.message,
          explanationResult: null,
        });
        setStatusMessage?.(validationResult.message);
        return;
      }

      const result = explainCronExpression(expression);
      setCurrentExplanation(result);
      setCurrentError('');
      updateCron(id, {
        cronExpression: expression,
        errorMessage: '',
        explanationResult: result,
      });
      setStatusMessage?.(`Cron expression explained successfully`);
    } catch (err) {
      const errorMsg = `Invalid cron expression: ${err.message}`;
      setCurrentError(errorMsg);
      setCurrentExplanation(null);
      updateCron(id, {
        cronExpression: expression,
        errorMessage: errorMsg,
        explanationResult: null,
      });
      setStatusMessage?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [expression, id, updateCron, setStatusMessage]);

  // Generate cron expression
  const handleGenerate = useCallback(() => {
    setIsProcessing(true);
    try {
      const generatedExpression = generateCronExpression(currentFields);
      setExpression(generatedExpression);
      updateCron(id, {
        cronExpression: generatedExpression,
        generateFields: currentFields,
      });
      
      // Automatically explain the generated expression
      setTimeout(() => {
        setIsProcessing(false);
        handleExplain();
      }, 0);
    } catch (err) {
      setIsProcessing(false);
      const errorMsg = `Failed to generate cron expression: ${err.message}`;
      setCurrentError(errorMsg);
      updateCron(id, {
        errorMessage: errorMsg,
      });
      setStatusMessage?.(errorMsg);
    }
  }, [currentFields, id, updateCron, handleExplain, setStatusMessage]);

  // Handle field type change
  const handleFieldTypeChange = (field, type) => {
    const newFields = { ...currentFields };
    newFields[field] = updateFieldValueByType(newFields[field], type);
    setCurrentFields(newFields);
    updateCron(id, { generateFields: newFields });
  };

  // Handle field value change
  const handleFieldValueChange = (field, subfield, value) => {
    const newFields = { ...currentFields };
    
    if (subfield.includes('.')) {
      const [mainSubfield, nestedSubfield] = subfield.split('.');
      newFields[field][mainSubfield][nestedSubfield] = value;
    } else {
      newFields[field][subfield] = value;
    }
    
    switch (newFields[field].type) {
      case 'specific':
        newFields[field].value = newFields[field].specific;
        break;
      case 'range':
        newFields[field].value = `${newFields[field].range.start}-${newFields[field].range.end}`;
        break;
      case 'every-n':
        newFields[field].value = `*/${newFields[field].every.step}`;
        break;
      case 'specific-every-n':
        newFields[field].value = `${newFields[field].every.start}/${newFields[field].every.step}`;
        break;
    }
    
    setCurrentFields(newFields);
    updateCron(id, { generateFields: newFields });
  };

  // Copy expression to clipboard
  const handleCopy = useCallback(() => {
    if (!expression) return;
    
    copyToClipboard(expression)
      .then(() => {
        setStatusMessage?.('Cron expression copied to clipboard');
      })
      .catch(() => {
        setStatusMessage?.('Failed to copy to clipboard');
      });
  }, [expression, setStatusMessage]);

  // Load from common expressions
  const loadCommonExpression = useCallback((expr) => {
    setExpression(expr);
    updateCron(id, { cronExpression: expr });
    // Automatically explain after loading
    setTimeout(() => {
      setIsProcessing(true);
      setCurrentError('');
      setCurrentExplanation(null);

      try {
        const validationResult = validateCronExpression(expr);
        if (!validationResult.valid) {
          setCurrentError(validationResult.message);
          setIsProcessing(false);
          updateCron(id, {
            cronExpression: expr,
            errorMessage: validationResult.message,
            explanationResult: null,
          });
          return;
        }

        const result = explainCronExpression(expr);
        setCurrentExplanation(result);
        setCurrentError('');
        updateCron(id, {
          cronExpression: expr,
          errorMessage: '',
          explanationResult: result,
        });
        setStatusMessage?.(`Cron expression explained successfully`);
      } catch (err) {
        const errorMsg = `Invalid cron expression: ${err.message}`;
        setCurrentError(errorMsg);
        setCurrentExplanation(null);
        updateCron(id, {
          cronExpression: expr,
          errorMessage: errorMsg,
          explanationResult: null,
        });
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  }, [id, updateCron, setStatusMessage]);

  // Clear all
  const handleClear = useCallback(() => {
    setExpression('* * * * *');
    setCurrentExplanation(null);
    setCurrentError('');
    updateCron(id, {
      cronExpression: '* * * * *',
      explanationResult: null,
      errorMessage: '',
    });
    setTimeout(() => {
      cronInputRef.current?.focus();
    }, 0);
  }, [id, updateCron]);

  // Generate results HTML
  const generateResultsHtmlContent = () => {
    if (currentError) {
      return `
        <div class="cron-error">
          <p style="color: #ef4444; padding: 12px; background-color: ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'}; border-radius: 6px; border-left: 4px solid #ef4444;">
            ${currentError}
          </p>
        </div>
      `;
    }

    if (!currentExplanation) {
      return '';
    }

    return generateResultsHtml(expression, currentExplanation.explanation, currentExplanation.nextExecutions);
  };

  return (
    <div className={`cron-tab-content ${darkMode ? 'dark-mode' : ''} ${cronStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Input Section */}
      <div className="cron-input-section">
        <div className="input-group">
          <div className="input-header">
            <label className="input-label">Cron Expression</label>
            <div className="input-actions">
              <button
                className="copy-button-small"
                onClick={handleCopy}
                disabled={!expression}
                title="Copy expression"
              >
                📋
              </button>
            </div>
          </div>
          <div className="cron-format-hint">
            Format: minute hour day-of-month month day-of-week (e.g., "0 12 * * 1-5" for weekdays at noon)
          </div>
          <input
            ref={cronInputRef}
            type="text"
            className="cron-input-field"
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value);
              updateCron(id, { cronExpression: e.target.value });
            }}
            placeholder="* * * * *"
            title="Enter a cron expression"
          />
        </div>
      </div>

      {/* Common Expressions */}
      <div className="common-expressions-section">
        <span className="common-expressions-label">Common patterns:</span>
        <div className="common-expressions-buttons">
          {commonExpressions.slice(0, 5).map((expr, index) => (
            <button
              key={index}
              className="common-expression-button"
              onClick={() => loadCommonExpression(expr.value)}
              title={expr.label}
            >
              {expr.value}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="cron-actions-section">
        <div className="explain-generate-buttons">
          <button
            className={`explain-cron-button ${currentMode === 'explain' ? 'active' : ''}`}
            onClick={() => {
              setCurrentMode('explain');
              updateCron(id, { mode: 'explain' });
              if (expression.trim()) {
                handleExplain();
              }
            }}
            disabled={!expression.trim() || (isProcessing && currentMode === 'explain')}
          >
            <span className="button-icon">🔍</span>
            <span className="button-text">
              {isProcessing && currentMode === 'explain' ? 'Explaining...' : 'Explain Expression'}
            </span>
            {!isProcessing && currentMode === 'explain' && <span className="button-arrow">→</span>}
          </button>
          <button
            className={`generate-cron-button ${currentMode === 'generate' ? 'active' : ''}`}
            onClick={() => {
              setCurrentMode('generate');
              updateCron(id, { mode: 'generate' });
              if (currentFields) {
                handleGenerate();
              }
            }}
            disabled={isProcessing && currentMode === 'generate'}
          >
            <span className="button-icon">⚙️</span>
            <span className="button-text">
              {isProcessing && currentMode === 'generate' ? 'Generating...' : 'Generate Expression'}
            </span>
            {!isProcessing && currentMode === 'generate' && <span className="button-arrow">→</span>}
          </button>
        </div>
        <div className="secondary-actions">
          <button
            className="clear-button"
            onClick={handleClear}
            disabled={expression === '* * * * *' && !currentExplanation}
            title="Reset to default expression"
          >
            🗑️ Reset
          </button>
        </div>
      </div>

      {/* Generate Mode Fields */}
      {currentMode === 'generate' && (
        <div className="generate-fields-section">
          <div className="generator-form">
            {fields.map(field => (
              <div key={field.name} className="generator-field">
                <div className="field-label">
                  <div className="field-name">{field.label}</div>
                  <div className="field-range">{field.range}</div>
                </div>
                <div className="field-input">
                  <div className="field-type-selector">
                    <select
                      value={currentFields[field.name].type}
                      onChange={(e) => handleFieldTypeChange(field.name, e.target.value)}
                      title={`Select type for ${field.label} field`}
                    >
                      <option value="every">Every</option>
                      <option value="specific">Specific</option>
                      <option value="range">Range</option>
                      <option value="every-n">Every n</option>
                      <option value="specific-every-n">Starting at, every n</option>
                    </select>
                  </div>
                  
                  <div className="field-value-input">
                    {currentFields[field.name].type === 'specific' && (
                      <input
                        type="text"
                        value={currentFields[field.name].specific}
                        onChange={(e) => handleFieldValueChange(field.name, 'specific', e.target.value)}
                        title={`Enter specific ${field.label} value`}
                      />
                    )}
                    
                    {currentFields[field.name].type === 'range' && (
                      <div className="range-inputs">
                        <input
                          type="text"
                          value={currentFields[field.name].range.start}
                          onChange={(e) => handleFieldValueChange(field.name, 'range.start', e.target.value)}
                          title={`Enter range start for ${field.label}`}
                        />
                        <span>to</span>
                        <input
                          type="text"
                          value={currentFields[field.name].range.end}
                          onChange={(e) => handleFieldValueChange(field.name, 'range.end', e.target.value)}
                          title={`Enter range end for ${field.label}`}
                        />
                      </div>
                    )}
                    
                    {currentFields[field.name].type === 'every-n' && (
                      <div className="every-n-inputs">
                        <span>Every</span>
                        <input
                          type="text"
                          value={currentFields[field.name].every.step}
                          onChange={(e) => handleFieldValueChange(field.name, 'every.step', e.target.value)}
                          title={`Enter step value for ${field.label}`}
                        />
                        <span>{field.label.toLowerCase()}</span>
                      </div>
                    )}
                    
                    {currentFields[field.name].type === 'specific-every-n' && (
                      <div className="specific-every-n-inputs">
                        <span>Starting at</span>
                        <input
                          type="text"
                          value={currentFields[field.name].every.start}
                          onChange={(e) => handleFieldValueChange(field.name, 'every.start', e.target.value)}
                          title={`Enter start value for ${field.label}`}
                        />
                        <span>every</span>
                        <input
                          type="text"
                          value={currentFields[field.name].every.step}
                          onChange={(e) => handleFieldValueChange(field.name, 'every.step', e.target.value)}
                          title={`Enter step value for ${field.label}`}
                        />
                        <span>{field.label.toLowerCase()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="field-value-preview" title="Current value for this field">
                    {currentFields[field.name].value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {(currentExplanation || currentError) && (
        <div className="cron-results-section">
          <div
            ref={resultsRef}
            className="cron-results-content"
            dangerouslySetInnerHTML={{ __html: generateResultsHtmlContent() }}
          />
        </div>
      )}
    </div>
  );
};

export default CronTab;

