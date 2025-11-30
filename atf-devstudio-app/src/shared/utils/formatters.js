/**
 * shared/utils/formatters.js
 * -------------------------
 * Utilities for formatting output data from various components
 */

// Escape HTML for safe display
export const escapeHtml = (str = '') =>
    str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');


/**
 * Escape XML special characters to prevent XSS, also used for HTML
 * @param {*} value - Value to escape
 * @returns {string} - Escaped string
 */
export const escapeXml = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
  
  /**
   * Format API response for display
   * @param {Object} response - The API response object
   * @returns {string} Formatted HTML string for display
   */
  export const formatResponse = (response) => {
    if (!response) {
      return '<div class="no-response-message">No response received</div>';
    }
  
    const { status, statusText, headers, body } = response;
    const statusClass = status >= 200 && status < 300 ? 'status-2xx' :
                       status >= 300 && status < 400 ? 'status-3xx' :
                       'status-4xx';
  
    // Format headers
    let headersHtml = '';
    if (headers && Object.keys(headers).length > 0) {
      headersHtml = Object.entries(headers).map(([key, value]) => 
        `<div class="header-item"><span class="header-name">${escapeHtml(key)}:</span> ${escapeHtml(String(value))}</div>`
      ).join('');
    }
  
    // Format body based on content type
    let bodyHtml = '';
    if (body) {
      const contentType = headers['content-type'] || '';
      
      if (contentType.includes('application/json') || typeof body === 'object') {
        try {
          const formattedJson = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
          bodyHtml = `<pre class="response-body json">${highlightJson(formattedJson)}</pre>`;
        } catch (e) {
          bodyHtml = `<pre class="response-body">${escapeHtml(String(body))}</pre>`;
        }
      } else if (contentType.includes('text/html')) {
        bodyHtml = `<pre class="response-body html">${escapeHtml(String(body))}</pre>`;
      } else if (contentType.includes('text/xml') || contentType.includes('application/xml')) {
        bodyHtml = `<pre class="response-body xml">${highlightXml(String(body))}</pre>`;
      } else {
        bodyHtml = `<pre class="response-body">${escapeHtml(String(body))}</pre>`;
      }
    }
  
    // Build complete response HTML
    return `
      <div class="response-container">
        <div class="response-header">
          <div class="status-code ${statusClass}">
            ${status} ${statusText}
          </div>
          <div class="response-time">
            Received at ${new Date().toLocaleTimeString()}
          </div>
        </div>
        <div class="response-headers">
          ${headersHtml}
        </div>
        ${bodyHtml}
      </div>
    `;
  };
  
  /**
 * Format config content with syntax highlighting based on format
 * @param {string} content - The configuration content to format
 * @param {string} format - The format type (json, yaml, docker, nginx, etc.)
 * @returns {string} - HTML string with syntax highlighting
 */
export const formatConfigContent = (content, format) => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Escape the HTML
  const escaped = escapeHtml(content);
  
  // Apply syntax highlighting based on format
  switch (format) {
    case 'json':
      return highlightJson(escaped);
    case 'yaml':
      return highlightYaml(escaped);
    case 'docker':
      return highlightDocker(escaped);
    case 'nginx':
      return highlightNginx(escaped);
    default:
      return `<pre>${escaped}</pre>`;
  }
};


  /**
   * Create a cURL command from request parameters
   * @param {string} url - Request URL
   * @param {string} method - HTTP method
   * @param {Object} headers - Headers object
   * @param {string} body - Request body
   * @param {string} bodyFormat - Body format (json, form, text)
   * @returns {string} cURL command
   */
  export const createCurlCommand = (url, method, headers = {}, body = '', bodyFormat = 'json') => {
    if (!url) {
      throw new Error('URL is required');
    }
  
    let curlCommand = `curl -X ${method} "${url}"`;
  
    // Add headers
    if (headers && Object.keys(headers).length > 0) {
      Object.entries(headers).forEach(([key, value]) => {
        curlCommand += ` \\\n  -H "${key}: ${value.replace(/"/g, '\\"')}"`;
      });
    }
  
    // Add body for appropriate methods
    if (['POST', 'PUT', 'PATCH'].includes(method) && body && body.trim()) {
      if (bodyFormat === 'json') {
        try {
          // Format JSON nicely for the command
          const jsonBody = JSON.stringify(JSON.parse(body)).replace(/"/g, '\\"');
          curlCommand += ` \\\n  -d "${jsonBody}"`;
        } catch (e) {
          // If JSON parsing fails, add the raw body
          curlCommand += ` \\\n  -d "${body.replace(/"/g, '\\"')}"`;
        }
      } else if (bodyFormat === 'form') {
        // For form data, format as form fields
        const formFields = body.split('\n')
          .map(line => {
            const [key, value] = line.split(':').map(item => item.trim());
            if (key && value) {
              return `-F "${key}=${value.replace(/"/g, '\\"')}"`;
            }
            return null;
          })
          .filter(Boolean)
          .join(' \\\n  ');
  
        if (formFields) {
          curlCommand += ` \\\n  ${formFields}`;
        }
      } else {
        // Plain text body
        curlCommand += ` \\\n  -d "${body.replace(/"/g, '\\"')}"`;
      }
    }
  
    return curlCommand;
  };
  
  /**
   * Apply syntax highlighting to formatted output
   * @param {string} output - The formatted output
   * @param {string} format - The output format
   * @returns {string} HTML string with syntax highlighting
   */
  export const applyHighlighting = (output, format) => {
    switch (format) {
      case 'json':
        return `<pre class="formatted-json">${highlightJson(output)}</pre>`;
      case 'yaml':
        return `<pre class="formatted-yaml">${escapeHtml(output)}</pre>`;
      case 'csv':
        return `<pre class="formatted-csv">${escapeHtml(output)}</pre>`;
      case 'xml':
        return `<pre class="formatted-xml">${highlightXml(output)}</pre>`;
      default:
        return `<pre class="formatted-data">${escapeHtml(output)}</pre>`;
    }
  };
  
  /**
   * Highlight JSON syntax
   */
  const highlightJson = (json) => {
    // Simple JSON syntax highlighting
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
  
  /**
   * Highlight XML syntax
   */
  const highlightXml = (xml) => {
    return xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;(\/?[^\s>]+)([^>]*)&gt;/g, (match, tag, attributes) => {
        // Highlight tag names
        const highlightedTag = `&lt;<span class="xml-tag">${tag}</span>`;
  
        // Highlight attributes if present
        let highlightedAttributes = '';
        if (attributes) {
          highlightedAttributes = attributes.replace(/([^\s=]+)=(?:"([^"]*)"|'([^']*)')/g,
            (attrMatch, name, value1, value2) => {
              const value = value1 || value2 || '';
              return ` <span class="xml-attr">${name}</span>=<span class="xml-value">"${value}"</span>`;
            }
          );
        }
  
        return `${highlightedTag}${highlightedAttributes}&gt;`;
      })
      // Add text content class for better reading
      .replace(/&gt;([^&<]+)&lt;/g, (match, content) => {
        return `&gt;<span class="xml-content">${content}</span>&lt;`;
      });
  };

  /**
 * Highlight YAML syntax for display
 * @param {string} content - Escaped YAML string
 * @returns {string} - HTML with syntax highlighting
 */
const highlightYaml = (content) => {
  return content
    .replace(/^([\w-]+):(.*)/gm, '<span class="yaml-key">$1</span>:$2')
    .replace(/^(\s+)([\w-]+):(.*)/gm, '$1<span class="yaml-key">$2</span>:$3')
    .replace(/"([^"]*)"/g, '<span class="yaml-string">"$1"</span>')
    .replace(/'([^']*)'/g, '<span class="yaml-string">\'$1\'</span>')
    .replace(/\b(true|false|yes|no|on|off)\b/gi, '<span class="yaml-boolean">$1</span>')
    .replace(/\b(null|~)\b/g, '<span class="yaml-null">$1</span>')
    .replace(/\b(-?\d+\.?\d*(?:e[+-]?\d+)?)\b/gi, '<span class="yaml-number">$1</span>')
    .replace(/^(\s*)(- )/gm, '$1<span class="yaml-list">$2</span>')
    .replace(/^(#.*)/gm, '<span class="yaml-comment">$1</span>');
};

/**
 * Highlight Docker syntax for display
 * @param {string} content - Escaped Dockerfile content
 * @returns {string} - HTML with syntax highlighting
 */
const highlightDocker = (content) => {
  return content
    .replace(/^(FROM|RUN|CMD|LABEL|MAINTAINER|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)(\s+)/gmi, 
      '<span class="docker-keyword">$1</span>$2')
    .replace(/^(#.*)/gm, '<span class="docker-comment">$1</span>');
};

/**
 * Highlight Nginx syntax for display
 * @param {string} content - Escaped Nginx config content
 * @returns {string} - HTML with syntax highlighting
 */
const highlightNginx = (content) => {
  return content
    .replace(/^(\s*)(server|location|http|events|upstream|include|proxy_pass|listen|server_name|root|index)(\s+)/gm, 
      '$1<span class="nginx-directive">$2</span>$3')
    .replace(/^(#.*)/gm, '<span class="nginx-comment">$1</span>')
    .replace(/[{}:;]/g, '<span class="nginx-symbol">$&</span>');
};


  
  /**
   * Format generated application files for nice display in the results area
   * @param {Object} files - Object containing file paths and content
   * @param {string} appType - Application type (react, node, java, python)
   * @returns {string} Formatted HTML string for display
   */
  export const formatGeneratedOutput = (files, appType) => {
    if (!files || Object.keys(files).length === 0) {
        return '<div class="no-files-message">No files generated</div>';
    }
  
    // Group files by type for better organization
    const fileGroups = {
        config: [], // package.json, pom.xml, etc
        source: [], // .js, .java, .py, etc
        markup: [], // .html, .jsx, etc
        style: [],  // .css, .scss, etc
        other: []   // Everything else
    };
  
    // Sort files into groups based on extension
    Object.entries(files).forEach(([path, content]) => {
        const extension = path.split('.').pop().toLowerCase();
  
        if (['json', 'xml', 'yml', 'yaml', 'ini', 'toml', 'gradle', 'properties'].includes(extension) ||
            path.includes('pom.xml') || path.includes('.gitignore')) {
            fileGroups.config.push({ path, content });
        } else if (['js', 'ts', 'java', 'py', 'rb', 'php', 'go', 'c', 'cpp', 'cs'].includes(extension)) {
            fileGroups.source.push({ path, content });
        } else if (['html', 'htm', 'jsx', 'tsx', 'vue', 'svelte'].includes(extension)) {
            fileGroups.markup.push({ path, content });
        } else if (['css', 'scss', 'sass', 'less', 'styl'].includes(extension)) {
            fileGroups.style.push({ path, content });
        } else {
            fileGroups.other.push({ path, content });
        }
    });
  
    // Build HTML output
    let html = '<div class="generated-files-container">';
  
    // Add file summary
    const totalFiles = Object.values(fileGroups).reduce((sum, group) => sum + group.length, 0);
    html += `<div class="files-summary">
        <h3>Generated ${totalFiles} file${totalFiles !== 1 ? 's' : ''} for ${appType.toUpperCase()} application</h3>
    </div>`;
  
    // Add file groups content
    html += '<div class="file-groups-content">';
    Object.entries(fileGroups).forEach(([groupName, files]) => {
        if (files.length > 0) {
             // Add data-group attribute for styling/js targeting
            html += `<div class="file-group" data-group="${groupName}">`;
  
            // Sort files by path
            files.sort((a, b) => a.path.localeCompare(b.path));
  
            // Add file listing
            files.forEach(({ path, content }) => {
                const extension = path.split('.').pop().toLowerCase();
                const fileName = path.split('/').pop();
                const displayContent = formatFileContent(content, extension);
  
                html += `<div class="file-item">
                    <div class="file-header">
                        <span class="file-name">${fileName}</span>
                        <span class="file-path">${path}</span>
                    </div>
                    <pre class="file-content ${getLanguageClass(extension)}">${escapeHtml(displayContent)}</pre>
                </div>`;
            });
  
            html += '</div>';
        }
    });
    html += '</div>';
  
    // Close container
    html += '</div>';
  
    return html;
  };
  
  /**
   * Format file content for display based on extension
   * @param {string} content - File content
   * @param {string} extension - File extension
   * @returns {string} Formatted content
   */
  function formatFileContent(content, extension) {
    // Limit content length for display
    const maxLength = 2000;
    if (content.length > maxLength) {
        return content.substring(0, maxLength) + '\n\n// ... (content truncated for display) ...';
    }
  
    return content;
  }
  
  /**
   * Get CSS class for syntax highlighting based on file extension
   * @param {string} extension - File extension
   * @returns {string} CSS class name
   */
  function getLanguageClass(extension) {
    switch (extension) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return 'language-javascript';
        case 'html':
        case 'htm':
            return 'language-html';
        case 'css':
        case 'scss':
        case 'sass':
            return 'language-css';
        case 'java':
            return 'language-java';
        case 'py':
            return 'language-python';
        case 'json':
            return 'language-json';
        case 'xml':
            return 'language-xml';
        case 'md':
            return 'language-markdown';
        default:
            return 'language-plaintext';
    }
  }

  /**
 * Format SQL code with proper indentation and keyword capitalization
 * @param {string} sql - SQL code to format
 * @param {string} dialect - SQL dialect (mysql, sqlite, postgres, etc.)
 * @returns {string} Formatted SQL
 */
export const formatSQL = (sql, dialect = 'standard') => {
  if (!sql || !sql.trim()) {
    return '';
  }
  
  try {
    // This is a basic implementation of SQL formatting
    // In a real application, you would use a dedicated SQL formatter library

    // Step 1: Normalize whitespace and remove excessive spaces
    let formatted = sql.replace(/\s+/g, ' ').trim();
    
    // Step 2: Add newlines after common SQL statements
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT',
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
      'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
      'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN',
      'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
      'BEGIN', 'COMMIT', 'ROLLBACK'
    ];
    
    // Replace keywords with uppercase versions followed by newlines
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, `\n${keyword.toUpperCase()}`);
    });
    
    // Step 3: Handle indentation within parentheses
    let indentLevel = 0;
    let result = '';
    
    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      
      if (char === '(') {
        result += char;
        indentLevel++;
        
        // Only add newline if there's content after the open parenthesis
        if (i < formatted.length - 1 && formatted[i + 1] !== ')') {
          result += '\n' + '  '.repeat(indentLevel);
        }
      } else if (char === ')') {
        indentLevel = Math.max(0, indentLevel - 1);
        
        // Add newline before closing parenthesis if it's not immediately after an opening one
        const prevNonSpace = result.trim().slice(-1);
        if (prevNonSpace !== '(') {
          result += '\n' + '  '.repeat(indentLevel);
        }
        
        result += char;
      } else if (char === ',') {
        result += char;
        
        // Add newlines after commas in specific contexts (but not all)
        const nextChar = formatted[i + 1] || '';
        if (nextChar === ' ' && indentLevel > 0) {
          result += '\n' + '  '.repeat(indentLevel);
        }
      } else if (char === '\n') {
        result += '\n' + '  '.repeat(indentLevel);
      } else {
        result += char;
      }
    }
    
    // Step 4: Handle SQL comments
    // Preserve single line comments and make sure they have a newline after
    result = result.replace(/--(.*)(?!\n)/g, '--$1\n');
    
    // Step 5: Ensure newline at the start (trim any leading whitespace first)
    result = result.trimStart();
    
    // Step 6: Normalize consecutive newlines to maximum of 2
    result = result.replace(/\n{3,}/g, '\n\n');
    
    // Step 7: Adjust specific dialect formatting
    if (dialect === 'sqlite') {
      // SQLite specific formatting (e.g., handle PRAGMA statements)
      result = result.replace(/\bPRAGMA\b/gi, '\nPRAGMA');
    }
    
    return result.trim();
  } catch (err) {
    console.error('SQL formatting error:', err);
    return sql; // Return original if formatting fails
  }
};