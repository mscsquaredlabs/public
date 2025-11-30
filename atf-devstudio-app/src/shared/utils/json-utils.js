/**
 * json-utils.js
 * Utility functions for JSON formatting, conversion, and display
 */

// Import the escapeXml utility from the shared folder
import { escapeXml } from '../../shared/utils/converters';

/**
 * Convert JSON object to XML string
 * @param {Object} obj - JSON object to convert
 * @param {string} rootName - Name for the XML root element
 * @param {number} indentLevel - Current indentation level
 * @param {string} indentChar - Character(s) to use for indentation
 * @returns {string} XML representation of the JSON object
 */
export const jsonToXml = (obj, rootName = 'root', indentLevel = 0, indentChar = '  ') => {
  const currentIndent = indentChar.repeat(indentLevel);
  let xml = '';

  if (Array.isArray(obj)) {
    obj.forEach(item => {
      let tagName = 'item';
      xml += `${currentIndent}<${tagName}>\n`;
      xml += jsonToXml(item, null, indentLevel + 1, indentChar);
      xml += `${currentIndent}</${tagName}>\n`;
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      const tagName = key.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^[^a-zA-Z_]+/, '_');
      const value = obj[key];

      xml += `${currentIndent}<${tagName}`;

      if (typeof value === 'object' && value !== null) {
        xml += `>\n`;
        xml += jsonToXml(value, null, indentLevel + 1, indentChar);
        xml += `${currentIndent}</${tagName}>\n`;
      } else {
        xml += `>${escapeXml(value)}</${tagName}>\n`;
      }
    });
  } else {
    xml += `${currentIndent}${escapeXml(obj)}\n`;
  }

  if (rootName) {
    const declaration = '<?xml version="1.0" encoding="UTF-8"?>\n';
    return declaration + `<${rootName}>\n${xml}</${rootName}>`;
  }

  return xml;
};

/**
 * Convert JSON object to YAML string
 * @param {Object} obj - JSON object to convert
 * @param {number} indentLevel - Current indentation level
 * @param {string} indentChar - Character(s) to use for indentation
 * @param {boolean} isListItem - Whether the current object is part of a list
 * @returns {string} YAML representation of the JSON object
 */
export const jsonToYaml = (obj, indentLevel = 0, indentChar = '  ', isListItem = false) => {
  const currentIndent = indentChar.repeat(indentLevel);
  let yaml = '';

  if (obj === null) {
    return 'null\n';
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]\n';
    obj.forEach((item) => {
      yaml += `${currentIndent}- `;
      const valueYaml = jsonToYaml(item, indentLevel + 1, indentChar, true);

      if (typeof item === 'object' && item !== null) {
        yaml += "\n" + valueYaml;
      } else {
        yaml += valueYaml.trimEnd() + '\n';
      }
    });
    yaml = yaml.trimEnd() + '\n';
  } else if (typeof obj === 'object') {
    if (Object.keys(obj).length === 0) return '{}\n';
    let firstKey = true;
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const keyIndent = (isListItem && firstKey) ? '' : currentIndent;
      yaml += `${keyIndent}${key}: `;
      firstKey = false;

      const valueYaml = jsonToYaml(value, indentLevel + 1, indentChar, false);

      if (typeof value === 'object' && value !== null) {
        yaml += "\n" + valueYaml;
      } else {
        yaml += valueYaml.trimEnd() + '\n';
      }
    });
    yaml = yaml.trimEnd() + '\n';
  } else if (typeof obj === 'string') {
    if (obj.includes(': ') || obj.includes('#') || obj.match(/^[\s\-]/) || /^\d/.test(obj) || ['true', 'false', 'null', 'yes', 'no', 'on', 'off', '', '{}', '[]'].includes(obj.toLowerCase())) {
      yaml += `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`;
    } else if (obj.includes('\n')) {
      yaml += '|\n';
      obj.split('\n').forEach(line => {
        yaml += `${currentIndent}${indentChar}${line}\n`;
      });
    }
    else {
      yaml += `${obj}\n`;
    }
  } else {
    yaml += `${obj}\n`;
  }

  if (indentLevel === 0) yaml = yaml.trimEnd();
  return yaml;
};

/**
 * Convert JSON object to HTML form representation
 * @param {Object} obj - JSON object to convert
 * @param {string} parentKey - Current key in the hierarchy
 * @param {boolean} isRoot - Whether this is the root object
 * @returns {string} HTML form representation of the JSON object
 */
export const jsonToHtmlForm = (obj, parentKey = '', isRoot = true) => {
  let formHtml = '';

  const formatTitle = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

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

  if (Array.isArray(obj)) {
    const legend = parentKey ? formatTitle(parentKey) : 'Array';
    formHtml += `<fieldset class="json-fieldset"><legend>${escapeXml(legend)}</legend>`;
    obj.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        const currentKey = `${parentKey}[${index}]`;
        const itemLabel = `${formatTitle(parentKey.slice(0,-1) || 'Item')} ${index + 1}`;
        formHtml += `<div class="form-group array-primitive-item">`;
        formHtml += `<label for="${escapeXml(currentKey)}">${escapeXml(itemLabel)}:</label>`;
        formHtml += `<input type="text" id="${escapeXml(currentKey)}" name="${escapeXml(currentKey)}" value="${escapeXml(String(item))}" disabled>`;
        formHtml += `</div>`;
      } else {
        const displayName = findDisplayName(item);
        const singularParentKey = (typeof parentKey === 'string' && parentKey.length > 0) ? parentKey.slice(0, -1) : 'Item';
        const itemHeader = displayName ? `${formatTitle(singularParentKey)} : ${escapeXml(displayName)}` : `${formatTitle(singularParentKey)} ${index + 1}`;
    
        formHtml += `<div class="array-item">`;
        formHtml += `<div class="array-item-header">${itemHeader}</div>`;
        formHtml += jsonToHtmlForm(item, `${parentKey}[${index}]`, false);
        formHtml += `</div>`;
      }
    });
    formHtml += `</fieldset>`;
  } else if (typeof obj === 'object' && obj !== null) {
    const needsFieldset = !isRoot && parentKey && !parentKey.endsWith(']');
    if (needsFieldset) {
      formHtml += `<fieldset class="json-fieldset"><legend>${escapeXml(formatTitle(parentKey))}</legend>`;
    }

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const currentKey = parentKey ? `${parentKey}.${key}` : key;
      const formattedLabel = formatTitle(key);

      if (typeof value === 'object' && value !== null) {
        formHtml += jsonToHtmlForm(value, key, false);
      } else {
        formHtml += `<div class="form-group">`;
        formHtml += `<label for="${escapeXml(currentKey)}">${escapeXml(formattedLabel)}:</label>`;

        let inputType = 'text';
        let inputValue = value;
        if (typeof value === 'number') inputType = 'number';
        if (typeof value === 'boolean') inputType = 'checkbox';
        if (value === null) inputValue = '';

        if (inputType === 'checkbox') {
          formHtml += `<input type="checkbox" id="${escapeXml(currentKey)}" name="${escapeXml(currentKey)}" ${value ? 'checked' : ''} disabled>`;
        } else {
          formHtml += `<input type="${inputType}" id="${escapeXml(currentKey)}" name="${escapeXml(currentKey)}" value="${escapeXml(String(inputValue))}" disabled>`;
        }

        formHtml += `</div>`;
      }
    });
    if (needsFieldset) {
      formHtml += `</fieldset>`;
    }
  }

  if (isRoot && typeof obj === 'object' && obj !== null) {
    return `<div class="json-form">${formHtml}</div>`;
  }

  return formHtml;
};

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Highlight JSON for display with syntax coloring
 * @param {Object} json - JSON object to highlight
 * @param {number} spaces - Number of spaces for indentation
 * @returns {string} HTML string with syntax highlighting
 */
export const highlightJson = (json, spaces) => {
  // Format the JSON with proper indentation
  const formatted = JSON.stringify(json, null, spaces);
  
  // First escape HTML to prevent XSS, then apply highlighting
  // After escaping, quotes become &quot;
  const escaped = escapeHtml(formatted);
  
  // Apply syntax highlighting in correct order (more specific patterns first)
  let result = escaped
    // Match JSON keys (escaped quotes followed by colon and optional whitespace) - must come first
    .replace(/&quot;([^&]+)&quot;:\s*/g, '<span class="json-key">&quot;$1&quot;</span>: ')
    // Match boolean values (must come before string matching to avoid false positives)
    .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
    // Match null values
    .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
    // Match numbers (must come before string matching to avoid false positives)
    .replace(/\b(-?\d+\.?\d*(?:e[+-]?\d+)?)\b/gi, '<span class="json-number">$1</span>')
    // Match remaining string values (escaped quotes not already matched as keys)
    // This regex will only match strings that are not followed by a colon
    .replace(/&quot;([^&]*)&quot;/g, (match, value, offset, string) => {
      // Check if this is already inside a span tag (already highlighted as key)
      // Look backwards to see if there's a closing span tag before a colon
      const beforeMatch = string.substring(0, offset);
      const afterMatch = string.substring(offset + match.length);
      
      // If after the match there's a colon (with optional whitespace), it's a key (already matched)
      // If before the match ends with a closing span tag, it's already highlighted
      if (afterMatch.match(/^\s*:/) || beforeMatch.endsWith('</span>:')) {
        return match; // Already highlighted, skip
      }
      
      return `<span class="json-string">&quot;${value}&quot;</span>`;
    });
  
  return result;
};

/**
 * Extract line and column information from a JSON parsing error
 * @param {Error} error - The JSON parsing error object
 * @param {string} jsonInput - The original JSON input string
 * @returns {Object|null} The line and column position of the error or null
 */
export const getJsonErrorPosition = (error, jsonInput) => {
  let match = error.message.match(/at position (\d+)/);
  if (!match) {
    match = error.message.match(/Unexpected token . in JSON at position (\d+)/);
  }
  if (!match) {
    match = error.message.match(/JSON.parse:.*? at line (\d+) column (\d+)/);
    if (match) {
      return { line: parseInt(match[1], 10), column: parseInt(match[2], 10) };
    }
    if (error.lineNumber && error.columnNumber) {
      return { line: error.lineNumber, column: error.columnNumber };
    }
    return null;
  }

  const position = parseInt(match[1], 10);
  if (isNaN(position) || !jsonInput) return null;

  const lines = jsonInput.slice(0, position).split('\n');
  const lineNum = lines.length;
  const colNum = lines[lines.length - 1].length + 1;

  return { line: lineNum, column: colNum };
};