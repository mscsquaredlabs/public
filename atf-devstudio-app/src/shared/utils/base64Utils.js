/**
 * shared/utils/base64Utils.js
 * --------------------------
 * Utilities for Base64 encoding, decoding, and formatting
 */

/**
 * Encode text to Base64
 * @param {string} text - Text to encode
 * @param {Object} options - Encoding options
 * @returns {string} Base64 encoded string
 */
export const encodeToBase64 = (text, options = {}) => {
    if (!text) return '';
    
    const {
      urlSafe = false,
      showLineBreaks = true,
      lineLength = 76,
      autoTrim = false
    } = options;
    
    try {
      // Trim input if requested
      const processedText = autoTrim ? text.trim() : text;
      
      // Create a Uint8Array from the input text
      const encoder = new TextEncoder();
      const data = encoder.encode(processedText);
      
      // Convert to base64
      let base64;
      if (urlSafe) {
        // URL-safe base64 encoding (replace + with - and / with _)
        base64 = btoa(String.fromCharCode(...data))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, ''); // Remove padding for URL-safe
      } else {
        base64 = btoa(String.fromCharCode(...data));
      }
      
      // Format output with line breaks if requested
      if (showLineBreaks && lineLength > 0) {
        base64 = formatWithLineBreaks(base64, lineLength);
      }
      
      return base64;
    } catch (err) {
      throw new Error(`Encoding failed: ${err.message}`);
    }
  };
  
  /**
   * Decode text from Base64
   * @param {string} base64 - Base64 string to decode
   * @param {Object} options - Decoding options
   * @returns {string} Decoded string
   */
  export const decodeFromBase64 = (base64, options = {}) => {
    if (!base64) return '';
    
    const {
      urlSafe = false,
      autoTrim = false
    } = options;
    
    try {
      // Trim input if requested
      let processedInput = autoTrim ? base64.trim() : base64;
      
      // Clean the input (remove whitespace, line breaks)
      processedInput = processedInput.replace(/[\r\n\s]/g, '');
      
      // Handle URL-safe base64
      if (urlSafe || processedInput.includes('-') || processedInput.includes('_')) {
        // Replace URL-safe chars and add padding if needed
        processedInput = processedInput
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        
        // Add padding if necessary
        while (processedInput.length % 4) {
          processedInput += '=';
        }
      }
      
      // Decode base64
      const binary = atob(processedInput);
      
      // Convert binary to UTF-8 text
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (err) {
      throw new Error(`Decoding failed: Invalid Base64 string`);
    }
  };
  
  /**
   * Format base64 with line breaks for readability
   * @param {string} text - Base64 text to format
   * @param {number} lineLength - Length of each line
   * @returns {string} Formatted text with line breaks
   */
  export const formatWithLineBreaks = (text, lineLength = 76) => {
    if (!text || lineLength <= 0) return text;
    
    const result = [];
    for (let i = 0; i < text.length; i += lineLength) {
      result.push(text.slice(i, i + lineLength));
    }
    return result.join('\n');
  };
  
  /**
   * Calculate statistics for Base64 encoded or decoded text
   * @param {string} text - Text to analyze
   * @param {boolean} isBase64 - Whether the text is Base64 encoded
   * @returns {Object} Statistics about the text
   */
  export const calculateBase64Stats = (text, isBase64 = true) => {
    if (!text) {
      return {
        length: 0,
        size: 0,
        padding: 0,
        efficiency: 0
      };
    }
    
    // Clean text of whitespace and line breaks for calculation
    const cleanText = text.replace(/[\r\n\s]/g, '');
    
    if (isBase64) {
      // Calculate Base64 stats
      const paddingCount = (cleanText.match(/=/g) || []).length;
      const rawLength = cleanText.length;
      
      // Base64 encodes 3 bytes of data into 4 characters
      // So size of original data is 3/4 of the Base64 string minus padding
      const originalSize = Math.floor((rawLength - paddingCount) * 3 / 4);
      
      // Efficiency is original size / base64 size
      const efficiency = originalSize > 0 
        ? ((originalSize / rawLength) * 100).toFixed(1) 
        : 0;
      
      return {
        length: rawLength,
        size: originalSize,
        padding: paddingCount,
        efficiency: efficiency
      };
    } else {
      // Stats for plain text
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      
      // Calculate Base64 output size (without padding)
      // Every 3 bytes becomes 4 Base64 characters
      const base64Size = Math.ceil(data.length * 4 / 3);
      
      // Add padding needed (0-2 characters)
      const paddingNeeded = (3 - (data.length % 3)) % 3;
      
      return {
        length: text.length,
        size: data.length,
        base64Size: base64Size,
        paddingNeeded: paddingNeeded,
        totalBase64Length: base64Size + (paddingNeeded > 0 ? paddingNeeded : 0)
      };
    }
  };
  
  /**
   * Validate if a string is valid Base64
   * @param {string} text - Text to validate
   * @param {boolean} isUrlSafe - Whether to check for URL-safe Base64
   * @returns {boolean} Whether the text is valid Base64
   */
  export const isValidBase64 = (text, isUrlSafe = false) => {
    if (!text) return false;
    
    // Clean the input
    const cleanText = text.replace(/[\r\n\s]/g, '');
    
    // Regular expression for standard Base64
    const standardRegex = /^[A-Za-z0-9+/]*={0,2}$/;
    
    // Regular expression for URL-safe Base64
    const urlSafeRegex = /^[A-Za-z0-9_-]*={0,2}$/;
    
    // Check if length is multiple of 4 (potentially with padding removed)
    const validLength = cleanText.length % 4 <= 2;
    
    // Check against appropriate regex
    return validLength && (
      isUrlSafe ? urlSafeRegex.test(cleanText) : standardRegex.test(cleanText)
    );
  };
  
  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  export const escapeHtml = (text) => {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Generate sample inputs for Base64 testing
   * @returns {Array} Array of sample inputs
   */
  export const getSampleInputs = () => {
    return [
      {
        name: 'Hello, World!',
        value: 'Hello, World!',
        description: 'Simple greeting text'
      },
      {
        name: 'URL with parameters',
        value: 'https://example.com/api?param=value&token=abc123',
        description: 'URL with query parameters'
      },
      {
        name: 'JSON data',
        value: '{"name":"John Doe","email":"john@example.com"}',
        description: 'JSON formatted data'
      },
      {
        name: 'Base64 encoded text',
        value: 'SGVsbG8sIFdvcmxkIQ==',
        description: 'Sample Base64 encoded string'
      },
      {
        name: 'Unicode characters',
        value: 'こんにちは世界! Hello World! Привет мир!',
        description: 'Text with non-ASCII characters'
      }
    ];
  };
  
  /**
   * Generate HTML for Base64 result display
   * @param {string} text - Base64 or decoded text
   * @param {Object} options - Display options
   * @returns {string} HTML for result display
   */
  export const generateResultHtml = (text, options = {}) => {
    const {
      mode = 'encode', 
      urlSafe = false,
      showBinary = false
    } = options;
    
    if (!text) return '';
    
    const operationText = mode === 'encode' ? 'Encoded' : 'Decoded';
    const stats = calculateBase64Stats(text, mode === 'encode');
    
    let binaryHtml = '';
    if (showBinary && mode === 'encode') {
      // Show binary representation for encoded text
      try {
        const binary = text
          .replace(/[\r\n\s]/g, '')
          .replace(/=/g, '')
          .split('')
          .map(char => {
            const index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(char);
            return index >= 0 ? index.toString(2).padStart(6, '0') : '';
          })
          .join(' ');
        
        binaryHtml = `
          <div class="binary-representation">
            <div class="binary-header">Binary Representation (6-bit groups):</div>
            <div class="binary-content">${binary}</div>
          </div>
        `;
      } catch (err) {
        // Skip binary representation if it fails
      }
    }
    
    return `
      <div class="base64-result">
        <div class="result-header">
          <div class="result-label">${operationText} ${urlSafe && mode === 'encode' ? 'URL-safe ' : ''}Base64:</div>

        </div>
        <div class="result-content">
          <pre>${escapeHtml(text)}</pre>
        </div>
        ${binaryHtml}
        <div class="result-info">
          <div class="info-item">
            <span class="info-label">Length:</span>
            <span class="info-value">${text.length} characters</span>
          </div>
          <div class="info-item">
            <span class="info-label">Size:</span>
            <span class="info-value">${stats.size} bytes</span>
          </div>
          ${mode === 'encode' && stats.padding > 0 ? `
          <div class="info-item">
            <span class="info-label">Padding:</span>
            <span class="info-value">${stats.padding} chars</span>
          </div>
          ` : ''}
          ${mode === 'encode' && stats.efficiency > 0 ? `
          <div class="info-item">
            <span class="info-label">Efficiency:</span>
            <span class="info-value">${stats.efficiency}%</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };