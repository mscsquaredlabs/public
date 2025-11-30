// LogAnalyzerTab.jsx
// Tab content for log analysis

import { useState, useRef, useEffect, useCallback } from 'react';
import { detectLogFormat, parseLogsByFormat, applyFilters, calculateStatistics, generateStatsSummary, generateLogsHtml } from '../../shared/utils/logUtils';
import { delay } from '../../shared/utils/helpers';

const LogAnalyzerTab = ({
  analyzer,
  updateAnalyzer,
  deleteAnalyzer,
  setStatusMessage,
  darkMode,
  analyzerStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    logInput,
    logFormat,
    configMode,
    displayOptions,
    parsingOptions,
    filters,
  } = analyzer;

  const [currentLogInput, setCurrentLogInput] = useState(logInput || '');
  const [currentLogFormat, setCurrentLogFormat] = useState(logFormat || 'auto');
  const [currentConfigMode, setCurrentConfigMode] = useState(configMode || 'simple');
  const [currentDisplayOptions, setCurrentDisplayOptions] = useState(displayOptions || {
    showLineNumbers: true,
    wrapLines: true,
    highlightLevels: true
  });
  const [currentParsingOptions, setCurrentParsingOptions] = useState(parsingOptions || {
    expandJson: true,
    groupRelated: false
  });
  const [currentFilters, setCurrentFilters] = useState(filters || {
    search: '',
    logLevel: 'all',
    timeRange: {
      start: '',
      end: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [parsedLogs, setParsedLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    byLevel: {},
    timespan: {
      start: null,
      end: null
    }
  });

  const textareaRef = useRef(null);

  const logLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'trace', label: 'TRACE' },
    { value: 'debug', label: 'DEBUG' },
    { value: 'info', label: 'INFO' },
    { value: 'warn', label: 'WARN' },
    { value: 'error', label: 'ERROR' },
    { value: 'fatal', label: 'FATAL' }
  ];

  // Sync with prop changes
  useEffect(() => {
    setCurrentLogInput(logInput || '');
    setCurrentLogFormat(logFormat || 'auto');
    setCurrentConfigMode(configMode || 'simple');
    setCurrentDisplayOptions(displayOptions || {
      showLineNumbers: true,
      wrapLines: true,
      highlightLevels: true
    });
    setCurrentParsingOptions(parsingOptions || {
      expandJson: true,
      groupRelated: false
    });
    setCurrentFilters(filters || {
      search: '',
      logLevel: 'all',
      timeRange: {
        start: '',
        end: ''
      }
    });
  }, [logInput, logFormat, configMode, displayOptions, parsingOptions, filters]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateAnalyzer(id, {
        logInput: currentLogInput,
        logFormat: currentLogFormat,
        configMode: currentConfigMode,
        displayOptions: currentDisplayOptions,
        parsingOptions: currentParsingOptions,
        filters: currentFilters,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentLogInput, currentLogFormat, currentConfigMode, currentDisplayOptions, currentParsingOptions, currentFilters, updateAnalyzer]);

  // Handle search input change
  const handleSearchChange = useCallback((value) => {
    const newFilters = { ...currentFilters, search: value };
    setCurrentFilters(newFilters);
    
    if (parsedLogs.length > 0) {
      const filtered = applyFilters(parsedLogs, newFilters);
      setFilteredLogs(filtered);
      
      const stats = calculateStatistics(filtered);
      setStatistics(stats);
      
      // Update results
      const logsHtml = generateLogsHtml(filtered, currentParsingOptions.expandJson, currentParsingOptions.groupRelated);
      setStatusMessage?.(`ANALYZE:${JSON.stringify({
        status: 'success',
        message: `Showing ${filtered.length} of ${parsedLogs.length} log entries`,
        details: generateStatsSummary(stats),
        content: logsHtml
      })}`);
    }
  }, [parsedLogs, currentFilters, currentParsingOptions, setStatusMessage]);

  // Handle log level filter change
  const handleLevelChange = useCallback((value) => {
    const newFilters = { ...currentFilters, logLevel: value };
    setCurrentFilters(newFilters);
    
    if (parsedLogs.length > 0) {
      const filtered = applyFilters(parsedLogs, newFilters);
      setFilteredLogs(filtered);
      
      const stats = calculateStatistics(filtered);
      setStatistics(stats);
      
      // Update results
      const logsHtml = generateLogsHtml(filtered, currentParsingOptions.expandJson, currentParsingOptions.groupRelated);
      setStatusMessage?.(`ANALYZE:${JSON.stringify({
        status: 'success',
        message: `Showing ${filtered.length} of ${parsedLogs.length} log entries`,
        details: generateStatsSummary(stats),
        content: logsHtml
      })}`);
    }
  }, [parsedLogs, currentFilters, currentParsingOptions, setStatusMessage]);

  // Function to analyze log data
  const analyzeLogData = useCallback(async () => {
    if (!currentLogInput.trim()) {
      setStatusMessage?.('Please enter log data first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await delay(100);
      
      const logLines = currentLogInput.split('\n').filter(line => line.trim());
      
      const detectedFormat = currentLogFormat === 'auto' ? detectLogFormat(logLines) : currentLogFormat;
      
      const parsed = parseLogsByFormat(logLines, detectedFormat);
      setParsedLogs(parsed);
      
      const filtered = applyFilters(parsed, currentFilters);
      setFilteredLogs(filtered);
      
      const stats = calculateStatistics(filtered);
      setStatistics(stats);
      
      const logsHtml = generateLogsHtml(filtered, currentParsingOptions.expandJson, currentParsingOptions.groupRelated);
      
      setStatusMessage?.(`ANALYZE:${JSON.stringify({
        status: 'success',
        message: `Analyzed ${filtered.length} of ${logLines.length} log entries`,
        details: generateStatsSummary(stats),
        content: logsHtml
      })}`);
    } catch (error) {
      console.error('Log analysis error:', error);
      setStatusMessage?.(`Failed to analyze logs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentLogInput, currentLogFormat, currentFilters, currentParsingOptions, setStatusMessage]);

  // Load a sample log
  const loadSampleLog = useCallback((sampleData) => {
    setCurrentLogInput(sampleData);
    setCurrentFilters({
      search: '',
      logLevel: 'all',
      timeRange: {
        start: '',
        end: ''
      }
    });
    setStatusMessage?.('Sample log loaded');
  }, [setStatusMessage]);

  // Clear all inputs and results
  const clearAll = useCallback(() => {
    setCurrentLogInput('');
    setParsedLogs([]);
    setFilteredLogs([]);
    setCurrentFilters({
      search: '',
      logLevel: 'all',
      timeRange: {
        start: '',
        end: ''
      }
    });
    setStatistics({
      total: 0,
      byLevel: {},
      timespan: {
        start: null,
        end: null
      }
    });
    setStatusMessage?.('Content cleared');
  }, [setStatusMessage]);

  // Update display option
  const updateDisplayOption = useCallback((key, value) => {
    const newOptions = { ...currentDisplayOptions, [key]: value };
    setCurrentDisplayOptions(newOptions);
    
    // If logs are already parsed, regenerate HTML with new options
    if (filteredLogs.length > 0) {
      const logsHtml = generateLogsHtml(filteredLogs, currentParsingOptions.expandJson, currentParsingOptions.groupRelated);
      setStatusMessage?.(`ANALYZE:${JSON.stringify({
        status: 'success',
        message: `Showing ${filteredLogs.length} log entries`,
        details: generateStatsSummary(statistics),
        content: logsHtml
      })}`);
    }
  }, [currentDisplayOptions, filteredLogs, currentParsingOptions, statistics, setStatusMessage]);

  // Update parsing option
  const updateParsingOption = useCallback((key, value) => {
    const newOptions = { ...currentParsingOptions, [key]: value };
    setCurrentParsingOptions(newOptions);
    
    // If logs are already parsed, regenerate HTML with new options
    if (filteredLogs.length > 0) {
      const logsHtml = generateLogsHtml(filteredLogs, newOptions.expandJson, newOptions.groupRelated);
      setStatusMessage?.(`ANALYZE:${JSON.stringify({
        status: 'success',
        message: `Showing ${filteredLogs.length} log entries`,
        details: generateStatsSummary(statistics),
        content: logsHtml
      })}`);
    }
  }, [currentParsingOptions, filteredLogs, statistics, setStatusMessage]);

  return (
    <div className={`log-analyzer-tab-content ${analyzerStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="log-analyzer-options-section">
        <div className="options-row">
          <div className="option-group">
            <label>Configuration Mode</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`config-mode-${id}`}
                  value="simple"
                  checked={currentConfigMode === 'simple'}
                  onChange={() => setCurrentConfigMode('simple')}
                />
                <span>Simple</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`config-mode-${id}`}
                  value="advanced"
                  checked={currentConfigMode === 'advanced'}
                  onChange={() => setCurrentConfigMode('advanced')}
                />
                <span>Advanced</span>
              </label>
            </div>
          </div>
          
          <div className="option-group">
            <label>Log Format</label>
            <select 
              value={currentLogFormat}
              onChange={(e) => setCurrentLogFormat(e.target.value)}
              className="format-select"
              title="Select the format of your log files"
            >
              <option value="auto">Auto-detect</option>
              <option value="apache">Apache / Nginx Access Log</option>
              <option value="php">PHP Error Log</option>
              <option value="java">Java / Spring Log</option>
              <option value="nodejs">Node.js / Winston Log</option>
              <option value="python">Python Log</option>
              <option value="json">JSON Log</option>
            </select>
          </div>
        </div>

        {currentConfigMode === 'advanced' && (
          <>
            <div className="options-row">
              <div className="option-group">
                <label>Display Options</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentDisplayOptions.showLineNumbers}
                      onChange={(e) => updateDisplayOption('showLineNumbers', e.target.checked)}
                    />
                    <span>Show Line Numbers</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentDisplayOptions.wrapLines}
                      onChange={(e) => updateDisplayOption('wrapLines', e.target.checked)}
                    />
                    <span>Wrap Lines</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentDisplayOptions.highlightLevels}
                      onChange={(e) => updateDisplayOption('highlightLevels', e.target.checked)}
                    />
                    <span>Highlight Log Levels</span>
                  </label>
                </div>
              </div>
              
              <div className="option-group">
                <label>Parsing Options</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentParsingOptions.expandJson}
                      onChange={(e) => updateParsingOption('expandJson', e.target.checked)}
                    />
                    <span>Expand JSON Payloads</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={currentParsingOptions.groupRelated}
                      onChange={(e) => updateParsingOption('groupRelated', e.target.checked)}
                    />
                    <span>Group Related Logs</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="search-filter">
          <input
            type="text"
            className="search-input"
            placeholder="Search logs..."
            value={currentFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={filteredLogs.length === 0}
            title={filteredLogs.length === 0 ? "Analyze logs first to enable search" : "Search in log content"}
          />
        </div>
        
        <div className="level-filter">
          <select
            className="level-select"
            value={currentFilters.logLevel}
            onChange={(e) => handleLevelChange(e.target.value)}
            disabled={filteredLogs.length === 0}
            title={filteredLogs.length === 0 ? "Analyze logs first to enable filtering" : "Filter by log level"}
          >
            {logLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Input Area */}
      <div className="log-input-section">
        <div className="input-header">
          <label htmlFor={`log-input-${id}`}>Log Data</label>
          <div className="input-actions">
            <button
              className="secondary-button"
              onClick={() => loadSampleLog(`2023-08-15 08:12:34.523 INFO  [http-nio-8080-exec-1] com.example.controller.UserController: User authenticated: user123
2023-08-15 08:12:35.128 DEBUG [http-nio-8080-exec-1] com.example.service.UserService: Loading user profile for user123
2023-08-15 08:12:36.247 INFO  [http-nio-8080-exec-1] com.example.controller.UserController: Profile loaded for user123
2023-08-15 08:15:42.876 INFO  [http-nio-8080-exec-3] com.example.controller.OrderController: New order created: ORD-7843 for user123
2023-08-15 08:15:44.532 ERROR [async-thread-2] com.example.service.EmailService: Failed to send email
java.io.IOException: Connection timeout
\tat com.example.service.EmailService.sendEmail(EmailService.java:42)
\tat com.example.service.NotificationService.sendOrderConfirmation(NotificationService.java:28)
2023-08-15 08:15:45.124 WARN  [async-thread-2] com.example.service.NotificationService: Email delivery failed, scheduling retry`)}
              title="Load a sample log for demonstration"
            >
              📋 Load Sample
            </button>
            <button
              className="secondary-button"
              onClick={clearAll}
              disabled={!currentLogInput}
              title="Clear all log data and results"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          id={`log-input-${id}`}
          className="log-textarea"
          value={currentLogInput}
          onChange={(e) => setCurrentLogInput(e.target.value)}
          placeholder="Paste your log data here..."
          spellCheck="false"
          autoComplete="off"
          rows={15}
          title="Paste log data to analyze"
        />
      </div>

      {/* Statistics Bar */}
      {statistics.total > 0 && (
        <div className="log-statistics">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{statistics.total} entries</span>
          </div>
          
          {Object.entries(statistics.byLevel).map(([level, count]) => (
            <div className="stat-item" key={level}>
              <span className={`stat-label level-${level}`}>{level.toUpperCase()}:</span>
              <span className="stat-value">{count}</span>
            </div>
          ))}
          
          {statistics.timespan.start && statistics.timespan.end && (
            <div className="stat-item">
              <span className="stat-label">Timespan:</span>
              <span className="stat-value">
                {statistics.timespan.start.toLocaleString()} to {statistics.timespan.end.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions Section */}
      <div className="log-analyzer-actions-section">
        <button 
          onClick={analyzeLogData}
          className="action-button analyze-button"
          disabled={isLoading || !currentLogInput.trim()}
          title={!currentLogInput.trim() ? "Please enter log data first" : "Analyze log data"}
        >
          {isLoading ? (
            <>
              <span className="loading-indicator"></span>
              Analyzing...
            </>
          ) : (
            '🔍 Analyze Logs'
          )}
        </button>
      </div>
    </div>
  );
};

export default LogAnalyzerTab;



