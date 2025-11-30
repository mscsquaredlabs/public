/**
 * shared/utils/logUtils.js
 * --------------------------
 * Utilities for log parsing, analysis, and formatting
 */

/**
 * Detect the log format based on content
 * @param {Array<string>} logLines - Array of log lines
 * @returns {string} Detected log format
 */
export const detectLogFormat = (logLines) => {
    if (logLines.length === 0) return 'auto';
    
    // Sample the first few lines (up to 10)
    const sampleSize = Math.min(10, logLines.length);
    const samples = logLines.slice(0, sampleSize);
    
    // Check if it's JSON format
    try {
      JSON.parse(samples[0]);
      return 'json'; // First line is valid JSON
    } catch (e) {
      // Not JSON, continue checking
    }
    
    // Check for common log patterns
    let formatScores = {
      apache: 0,
      php: 0,
      java: 0,
      nodejs: 0,
      python: 0
    };
    
    for (const line of samples) {
      // Apache/Nginx access log pattern
      if (/\d+\.\d+\.\d+\.\d+.+\[\d+\/\w+\/\d+:.+\].+(GET|POST|PUT|DELETE).+/.test(line)) {
        formatScores.apache += 2;
      }
      
      // PHP error log pattern
      if (/\[\d+-\w+-\d+ \d+:\d+:\d+\] PHP (Notice|Warning|Error|Fatal error)/.test(line)) {
        formatScores.php += 2;
      }
      
      // Java/Spring log pattern
      if (/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}.\d{3}\s+\w+\s+\[.+\]\s+\w+\s+/.test(line)) {
        formatScores.java += 2;
      }
      
      // Node.js/Winston log pattern
      if (/\{\s*"level"\s*:\s*"(info|error|warn|debug)".+\}/.test(line) || 
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\s+(info|error|warn|debug):/.test(line)) {
        formatScores.nodejs += 2;
      }
      
      // Python log pattern
      if (/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2},\d{3}\s+-\s+(DEBUG|INFO|WARNING|ERROR|CRITICAL)\s+-/.test(line)) {
        formatScores.python += 2;
      }
      
      // Add additional points for specific keywords or patterns
      if (line.includes('RuntimeException') || line.includes('NullPointerException')) {
        formatScores.java += 1;
      }
      
      if (line.includes('Traceback (most recent call last)') || line.includes('File "')) {
        formatScores.python += 1;
      }
    }
    
    // Find the format with the highest score
    let detectedFormat = 'auto';
    let highestScore = 0;
    
    for (const [format, score] of Object.entries(formatScores)) {
      if (score > highestScore) {
        highestScore = score;
        detectedFormat = format;
      }
    }
    
    return highestScore > 0 ? detectedFormat : 'auto';
  };
  
  /**
   * Parse logs based on detected format
   * @param {Array<string>} logLines - Array of log lines
   * @param {string} format - Log format (auto, json, apache, php, java, nodejs, python)
   * @returns {Array<Object>} Array of parsed log objects
   */
  export const parseLogsByFormat = (logLines, format) => {
    const parsedLogs = [];
    
    for (let i = 0; i < logLines.length; i++) {
      const line = logLines[i];
      if (!line.trim()) continue;
      
      try {
        let parsedLog = {
          lineNumber: i + 1,
          raw: line,
          timestamp: null,
          level: null,
          message: line,
          source: null,
          data: null
        };
        
        switch (format) {
          case 'json':
            try {
              const jsonData = JSON.parse(line);
              parsedLog.timestamp = jsonData.timestamp || jsonData.time || jsonData.date || null;
              parsedLog.level = jsonData.level || jsonData.severity || jsonData.log_level || null;
              parsedLog.message = jsonData.message || jsonData.msg || jsonData.content || line;
              parsedLog.source = jsonData.logger || jsonData.source || jsonData.class || null;
              parsedLog.data = jsonData;
            } catch (e) {
              // Not valid JSON, use default parsing
              parsedLog = parseGenericLog(line, i + 1);
            }
            break;
            
          case 'apache':
            // Apache/Nginx access log format
            const apacheMatch = line.match(/^(\S+) \S+ \S+ \[([^\]]+)\] "([^"]*)" (\d+) (\d+|-) "([^"]*)" "([^"]*)"/);
            if (apacheMatch) {
              parsedLog.timestamp = apacheMatch[2];
              parsedLog.level = apacheMatch[4].startsWith('2') ? 'info' : 
                               (apacheMatch[4].startsWith('4') ? 'warn' : 
                               (apacheMatch[4].startsWith('5') ? 'error' : 'debug'));
              parsedLog.message = apacheMatch[3];
              parsedLog.source = apacheMatch[1]; // IP address
              parsedLog.data = {
                ip: apacheMatch[1],
                request: apacheMatch[3],
                status: apacheMatch[4],
                bytes: apacheMatch[5],
                referer: apacheMatch[6],
                userAgent: apacheMatch[7]
              };
            }
            break;
            
          case 'php':
            // PHP error log format
            const phpMatch = line.match(/\[(\d+-\w+-\d+ \d+:\d+:\d+)\] PHP (Notice|Warning|Error|Fatal error):\s+(.+) in (.+) on line (\d+)/);
            if (phpMatch) {
              parsedLog.timestamp = phpMatch[1];
              parsedLog.level = phpMatch[2].toLowerCase();
              parsedLog.message = phpMatch[3];
              parsedLog.source = `${phpMatch[4]}:${phpMatch[5]}`;
              parsedLog.data = {
                file: phpMatch[4],
                line: phpMatch[5]
              };
            }
            break;
            
          case 'java':
            // Java/Spring log format
            const javaMatch = line.match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}.\d{3})\s+(\w+)\s+\[(.+?)\]\s+(\S+)\s+(.+)/);
            if (javaMatch) {
              parsedLog.timestamp = javaMatch[1];
              parsedLog.level = javaMatch[2].toLowerCase();
              parsedLog.source = javaMatch[4];
              parsedLog.message = javaMatch[5];
              parsedLog.data = {
                thread: javaMatch[3]
              };
            }
            break;
            
          case 'nodejs':
            // Node.js/Winston log format
            const nodejsMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s+(info|error|warn|debug):\s+(.+)/);
            if (nodejsMatch) {
              parsedLog.timestamp = nodejsMatch[1];
              parsedLog.level = nodejsMatch[2];
              parsedLog.message = nodejsMatch[3];
            } else {
              try {
                // Try JSON format for structured Node.js logs
                const jsonData = JSON.parse(line);
                parsedLog.timestamp = jsonData.timestamp || jsonData.time || jsonData.date || null;
                parsedLog.level = jsonData.level || jsonData.severity || null;
                parsedLog.message = jsonData.message || jsonData.msg || line;
                parsedLog.data = jsonData;
              } catch (e) {
                // Not JSON, keep default
              }
            }
            break;
            
          case 'python':
            // Python log format
            const pythonMatch = line.match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2},\d{3})\s+-\s+(DEBUG|INFO|WARNING|ERROR|CRITICAL)\s+-\s+(.+?)\s*(?:\[(.+?)\])?\s*:\s*(.+)/);
            if (pythonMatch) {
              parsedLog.timestamp = pythonMatch[1];
              parsedLog.level = pythonMatch[2].toLowerCase();
              parsedLog.source = pythonMatch[3] + (pythonMatch[4] ? `[${pythonMatch[4]}]` : '');
              parsedLog.message = pythonMatch[5];
            }
            break;
            
          default:
            // Generic pattern matching for common log formats
            parsedLog = parseGenericLog(line, i + 1);
            break;
        }
        
        parsedLogs.push(parsedLog);
      } catch (error) {
        console.warn(`Error parsing log line ${i + 1}:`, error);
        parsedLogs.push({
          lineNumber: i + 1,
          raw: line,
          timestamp: null,
          level: null,
          message: line,
          source: null,
          data: null
        });
      }
    }
    
    return parsedLogs;
  };
  
  /**
   * Generic log parsing for common patterns
   * @param {string} line - Log line
   * @param {number} lineNumber - Line number
   * @returns {Object} Parsed log object
   */
  export const parseGenericLog = (line, lineNumber) => {
    const parsed = {
      lineNumber,
      raw: line,
      timestamp: null,
      level: null,
      message: line,
      source: null,
      data: null
    };
    
    // Try to extract timestamp
    const timestampRegex = /(\d{4}[-./]\d{2}[-./]\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?(?:Z|[-+]\d{2}:\d{2})?)/;
    const timestampMatch = line.match(timestampRegex);
    if (timestampMatch) {
      parsed.timestamp = timestampMatch[1];
      // Remove timestamp from message to prevent duplication
      parsed.message = line.replace(timestampMatch[0], '').trim();
    }
    
    // Try to extract log level
    const levelRegex = /\b(DEBUG|INFO|NOTICE|WARNING|WARN|ERROR|CRITICAL|FATAL|EMERGENCY)\b/i;
    const levelMatch = line.match(levelRegex);
    if (levelMatch) {
      parsed.level = levelMatch[1].toLowerCase();
    }
    
    return parsed;
  };
  
  /**
   * Apply filters to parsed logs
   * @param {Array<Object>} parsedLogs - Array of parsed log objects
   * @param {Object} filters - Filter criteria
   * @returns {Array<Object>} Filtered logs
   */
  export const applyFilters = (parsedLogs, filters) => {
    return parsedLogs.filter(log => {
      // Filter by search term
      if (filters.search && 
          !(log.message.toLowerCase().includes(filters.search.toLowerCase()) || 
            (log.source && log.source.toLowerCase().includes(filters.search.toLowerCase())) ||
            log.raw.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Filter by log level
      if (filters.logLevel !== 'all' && log.level !== filters.logLevel) {
        return false;
      }
      
      // Filter by time range
      if (filters.timeRange.start && log.timestamp) {
        try {
          const logTime = new Date(log.timestamp);
          const startTime = new Date(filters.timeRange.start);
          if (logTime < startTime) return false;
        } catch (e) {
          // Invalid date, skip time filtering
        }
      }
      
      if (filters.timeRange.end && log.timestamp) {
        try {
          const logTime = new Date(log.timestamp);
          const endTime = new Date(filters.timeRange.end);
          if (logTime > endTime) return false;
        } catch (e) {
          // Invalid date, skip time filtering
        }
      }
      
      return true;
    });
  };
  
  /**
   * Calculate statistics from filtered logs
   * @param {Array<Object>} logs - Array of log objects
   * @returns {Object} Statistics object
   */
  export const calculateStatistics = (logs) => {
    const stats = {
      total: logs.length,
      byLevel: {},
      timespan: {
        start: null,
        end: null
      }
    };
    
    for (const log of logs) {
      // Count by log level
      if (log.level) {
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      }
      
      // Calculate timespan
      if (log.timestamp) {
        try {
          const timestamp = new Date(log.timestamp);
          if (!isNaN(timestamp)) {
            if (!stats.timespan.start || timestamp < stats.timespan.start) {
              stats.timespan.start = timestamp;
            }
            
            if (!stats.timespan.end || timestamp > stats.timespan.end) {
              stats.timespan.end = timestamp;
            }
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
    }
    
    return stats;
  };
  
  /**
   * Generate HTML summary of statistics
   * @param {Object} stats - Statistics object
   * @returns {string} HTML summary
   */
  export const generateStatsSummary = (stats) => {
    const levelCounts = Object.entries(stats.byLevel)
      .map(([level, count]) => `${level.toUpperCase()}: ${count}`)
      .join(', ');
    
    let timespan = 'Unknown timespan';
    if (stats.timespan.start && stats.timespan.end) {
      const start = stats.timespan.start.toLocaleString();
      const end = stats.timespan.end.toLocaleString();
      const durationMs = stats.timespan.end - stats.timespan.start;
      
      // Format duration nicely
      let duration;
      if (durationMs < 1000) {
        duration = `${durationMs}ms`;
      } else if (durationMs < 60000) {
        duration = `${Math.round(durationMs / 1000)}s`;
      } else if (durationMs < 3600000) {
        duration = `${Math.round(durationMs / 60000)}m`;
      } else {
        duration = `${Math.round(durationMs / 3600000)}h`;
      }
      
      timespan = `${start} to ${end} (${duration})`;
    }
    
    return `Total: ${stats.total} entries | ${levelCounts} | ${timespan}`;
  };
  
  /**
   * Generate HTML for displaying logs
   * @param {Array<Object>} logs - Array of log objects
   * @param {boolean} expandJson - Whether to expand JSON data
   * @param {boolean} groupRelated - Whether to group related logs
   * @returns {string} HTML for displaying logs
   */
  export const generateLogsHtml = (logs, expandJson = true, groupRelated = false) => {
    if (logs.length === 0) {
      return '<p class="no-logs">No log entries match the current filters.</p>';
    }
    
    let html = '<div class="logs-wrapper with-line-numbers wrap-lines highlight-levels">';
    
    if (groupRelated) {
      // Group related logs (e.g., exceptions with stack traces)
      // Implementation simplified - would need more complex logic for production
      const grouped = [];
      let currentGroup = [];
      
      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        
        if (i > 0 && 
            (!log.timestamp && logs[i-1].timestamp) || 
            (log.level === null && logs[i-1].level) ||
            (log.message.startsWith('\t') || log.message.startsWith('  at '))) {
          // Likely a continuation (stack trace)
          currentGroup.push(log);
        } else {
          if (currentGroup.length > 0) {
            grouped.push([...currentGroup]);
          }
          currentGroup = [log];
        }
      }
      
      if (currentGroup.length > 0) {
        grouped.push(currentGroup);
      }
      
      // Render grouped logs
      for (const group of grouped) {
        const primaryLog = group[0];
        const level = primaryLog.level || 'unknown';
        
        html += `<div class="log-group level-${level}">`;
        html += `<div class="log-entry primary-log">`;
        html += `<span class="log-number">${primaryLog.lineNumber}</span>`;
        
        if (primaryLog.timestamp) {
          html += `<span class="log-timestamp">${primaryLog.timestamp}</span>`;
        }
        
        if (primaryLog.level) {
          html += `<span class="log-level level-${primaryLog.level}">${primaryLog.level.toUpperCase()}</span>`;
        }
        
        if (primaryLog.source) {
          html += `<span class="log-source">${escapeHtml(primaryLog.source)}</span>`;
        }
        
        html += `<span class="log-message">${escapeHtml(primaryLog.message)}</span>`;
        
        if (expandJson && primaryLog.data && typeof primaryLog.data === 'object') {
          html += `<div class="log-data"><pre>${JSON.stringify(primaryLog.data, null, 2)}</pre></div>`;
        }
        
        html += '</div>';
        
        // Add related logs (usually stack traces)
        if (group.length > 1) {
          html += '<div class="related-logs">';
          
          for (let i = 1; i < group.length; i++) {
            const relatedLog = group[i];
            html += `<div class="log-entry related-log">`;
            html += `<span class="log-number">${relatedLog.lineNumber}</span>`;
            html += `<span class="log-message">${escapeHtml(relatedLog.message)}</span>`;
            html += '</div>';
          }
          
          html += '</div>';
        }
        
        html += '</div>';
      }
    } else {
      // Render logs line by line without grouping
      for (const log of logs) {
        const level = log.level || 'unknown';
        
        html += `<div class="log-entry level-${level}">`;
        html += `<span class="log-number">${log.lineNumber}</span>`;
        
        if (log.timestamp) {
          html += `<span class="log-timestamp">${log.timestamp}</span>`;
        }
        
        if (log.level) {
          html += `<span class="log-level level-${log.level}">${log.level.toUpperCase()}</span>`;
        }
        
        if (log.source) {
          html += `<span class="log-source">${escapeHtml(log.source)}</span>`;
        }
        
        html += `<span class="log-message">${escapeHtml(log.message)}</span>`;
        
        if (expandJson && log.data && typeof log.data === 'object') {
          html += `<div class="log-data"><pre>${JSON.stringify(log.data, null, 2)}</pre></div>`;
        }
        
        html += '</div>';
      }
    }
    
    html += '</div>';
    return html;
  };
  
  /**
   * Escape HTML special characters
   * @param {string} unsafe - Unsafe string
   * @returns {string} Escaped string
   */
  const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') {
      unsafe = String(unsafe);
    }
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };