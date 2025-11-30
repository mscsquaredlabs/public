/**
 * shared/utils/validators.js
 * --------------------------
 * Validation utilities for various data formats
 */

/**
 * Validates a request before sending
 * @param {string} url - Request URL
 * @param {string} method - HTTP method
 * @param {string} headers - Headers as a JSON string
 * @param {string} body - Request body
 * @param {string} bodyFormat - Body format (json, form, text)
 * @returns {Object} Result with valid flag and error message if invalid
 */
export const validateRequest = (url, method, headers, body, bodyFormat) => {
    // Check URL
    if (!url || !url.trim()) {
      return { valid: false, message: 'URL cannot be empty' };
    }
  
    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return { valid: false, message: 'Invalid URL format' };
    }
  
    // Check method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(method)) {
      return { valid: false, message: `Invalid HTTP method: ${method}` };
    }
  
    // Check headers if provided
    if (headers && headers.trim()) {
      try {
        JSON.parse(headers);
      } catch (e) {
        return { valid: false, message: `Invalid headers format: ${e.message}` };
      }
    }
  
    // Check body for non-GET methods
    if (['POST', 'PUT', 'PATCH'].includes(method) && body && body.trim()) {
      if (bodyFormat === 'json') {
        try {
          JSON.parse(body);
        } catch (e) {
          return { valid: false, message: `Invalid JSON body: ${e.message}` };
        }
      }
      // For form and text formats, we don't need specific validation
    }
  
    return { valid: true, message: 'Request is valid' };
  };
  
  /**
   * Parse headers from JSON string and add authentication headers
   * @param {string} headersStr - Headers as a JSON string
   * @param {string} authType - Authentication type (none, basic, bearer, apiKey)
   * @param {Object} authDetails - Authentication details
   * @returns {Object} Parsed headers object with authentication
   */
  export const parseHeaders = (headersStr, authType, authDetails) => {
    let headers = {};
    
    // Parse headers JSON
    try {
      if (headersStr && headersStr.trim()) {
        headers = JSON.parse(headersStr);
      }
    } catch (e) {
      console.error('Error parsing headers:', e);
      // Return empty headers object if parsing fails
      return {};
    }
    
    // Add authentication headers
    if (authType === 'basic' && authDetails.username) {
      // Base64 encode username:password for Basic Auth
      const credentials = btoa(`${authDetails.username}:${authDetails.password || ''}`);
      headers['Authorization'] = `Basic ${credentials}`;
    } else if (authType === 'bearer' && authDetails.token) {
      headers['Authorization'] = `Bearer ${authDetails.token}`;
    } else if (authType === 'apiKey' && authDetails.apiKey) {
      const keyName = authDetails.apiKeyName || 'X-API-Key';
      headers[keyName] = authDetails.apiKey;
    }
    
    return headers;
  };
  
  // Keep all existing functions from the original validators.js below
  // (validateSQL, validateCSV, validateJSON, validateXML, validateSchema, etc.)
  
  /**
   * Check if a field type string is a known/valid type for schema generation.
   * This is a helper specifically for validateSchema.
   * @param {string} type - Field type string to check
   * @returns {boolean} True if the type is considered valid, false otherwise
   */
  const isValidFieldType = (type) => {
    // This list should ideally be synced with the available field types
    // in the Test Data Generator logic.
    const validTypes = [
        'string', 'number', 'boolean', 'date', 'name', 'firstName', 'lastName',
        'email', 'phone', 'address', 'city', 'country', 'zipCode', 'uuid',
        'id', 'url', 'hexColor', 'ipAddress', 'lorem', 'company', 'jobTitle',
        'creditCard', 'currency', 'username', 'password', 'enum'
        // Add other specific types as needed
    ];
  
    return validTypes.includes(type);
  };
  
  /**
  * Minifies SQL - removes comments, extra whitespace, normalizes spacing around punctuation.
  * @param {string} sql - SQL string to minify
  * @returns {string} Minified SQL string
  */
  export const minifySql = (sql) => {
    if (!sql || !sql.trim()) return '';
  
    try {
        let minified = sql;
        // Replace multi-line comments (/* ... */)
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, ' ');
        // Replace single line comments (-- ...)
        minified = minified.replace(/--.*$/gm, '');
        // Replace multiple spaces with a single space
        minified = minified.replace(/\s+/g, ' ');
        // Trim leading/trailing spaces and normalize whitespace around specific punctuation
        minified = minified.replace(/\s*([,;()])\s*/g, '$1').trim();
        return minified;
    } catch (err) {
        // If any error occurs during minification, return the original string
        console.error("Error during SQL minification:", err);
        return sql;
    }
  };
  
  /**
  * Minifies input data based on its type.
  * @param {string} input - Input text to minify
  * @param {string} type - Type of input ('sql', 'json', 'csv', 'xml')
  * @returns {string} Minified input
  */
  export const minifyInput = (input, type) => {
    if (!input || !input.trim()) return '';
  
    try {
        switch (type) {
            case 'sql':
                return minifySql(input);
            case 'json':
                // Attempt to parse and stringify with no whitespace
                try {
                    const parsed = JSON.parse(input);
                    return JSON.stringify(parsed);
                } catch {
                    // If parsing fails, return original (it's not valid JSON anyway)
                    return input;
                }
            case 'csv':
                // For CSV, just trim lines and normalize line endings, remove empty lines
                return input.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .join('\n');
            case 'xml':
                 // For XML, preserve the structure but remove comments and excessive whitespace between tags
                 // Corrected regex that was missing in the original input
                 return input
                   .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                   .replace(/>\s+</g, '><')         // Remove whitespace between tags
                   .replace(/\s+</g, '<')           // Remove whitespace before opening tags
                   .replace(/>\s+/g, '>')           // Remove whitespace after closing tags
                   .trim();
            default:
                return input;
        }
    } catch (err) {
        // If any error occurs during minification, return the original input
         console.error(`Error during ${type} minification:`, err);
        return input;
    }
  };
  
  /**
  * Validates SQL format by checking for basic syntax patterns and balance.
  * This is a simplified validation and not a full SQL parser.
  * @param {string} sqlString - The SQL string to validate
  * @returns {Object} Result with valid flag, error message if invalid, and minified SQL
  */
  export const validateSQL = (sqlString) => {
    if (!sqlString || !sqlString.trim()) {
        return { valid: false, message: 'SQL query cannot be empty' };
    }
  
    // Minify the SQL before validation
    const minified = minifyInput(sqlString, 'sql');
    if (!minified) {
        return { valid: false, message: 'SQL query contains only comments or whitespace' };
    }
  
    let valid = true;
    let message = 'SQL looks syntactically balanced (basic check)';
  
    try {
        // Check for balanced parentheses
        const openParens = (minified.match(/\(/g) || []).length;
        const closeParens = (minified.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            valid = false;
            message = `Unbalanced parentheses: ${openParens} opening vs ${closeParens} closing`;
        }
  
        // Check for unclosed single quotes (basic check, doesn't handle escaped quotes like \')
        const singleQuotes = (minified.match(/'/g) || []).length;
        if (singleQuotes % 2 !== 0) {
            valid = false;
            message = 'Unclosed single quotes detected (basic check)';
        }
  
        // Check for unclosed double quotes (basic check)
        const doubleQuotes = (minified.match(/"/g) || []).length;
        if (doubleQuotes % 2 !== 0) {
            valid = false;
            message = 'Unclosed double quotes detected (basic check)';
        }
  
        // Check for basic SQL structure (e.g., SELECT should have FROM)
        if (/^\s*SELECT\b/i.test(minified) && !/\bFROM\b/i.test(minified)) {
            valid = false;
            message = 'SELECT query is missing FROM clause (basic check)';
        }
  
        // Check for common command keywords
        if (!/(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(minified)) {
            valid = false;
            message = 'Query does not start with a recognized SQL command (SELECT, INSERT, etc.)';
        }
  
  
        return { valid, message, minified };
    } catch (err) {
        // Catch unexpected errors during regex or checks
        return { valid: false, message: `SQL validation error: ${err.message}`, minified };
    }
  };
  
  /**
  * Validates CSV format by checking for basic structure and consistent column count.
  * This is a simplified validation and does not fully parse CSV with complex quoting/escaping.
  * @param {string} csvString - The CSV string to validate
  * @returns {Object} Result with valid flag, error message if invalid, and minified CSV
  */
  export const validateCSV = (csvString) => {
    if (!csvString || !csvString.trim()) {
        return { valid: false, message: 'CSV content cannot be empty' };
    }
  
    // Clean up the CSV before validation (removes empty lines, trims)
    const minified = minifyInput(csvString, 'csv');
    if (!minified) {
         return { valid: false, message: 'CSV content is empty after cleaning' };
    }
  
    try {
        // Basic CSV validation - check for consistent column count using simple split
        // NOTE: This basic split does NOT handle commas or newlines within quoted fields.
        // For robust validation, use a proper CSV parsing library.
        const lines = minified.split('\n');
  
        if (lines.length < 2) {
            return { valid: false, message: 'CSV must have at least a header row and one data row', minified };
        }
  
        const headerCols = lines[0].split(',').length;
  
        // Check if all subsequent rows have the same number of columns
        for (let i = 1; i < lines.length; i++) {
            const rowCols = lines[i].split(',').length;
            if (rowCols !== headerCols) {
                return {
                    valid: false,
                    message: `Inconsistent column count: row ${i + 1} has ${rowCols} columns, expected ${headerCols}`,
                    minified
                };
            }
        }
  
        return { valid: true, message: 'CSV format appears valid (basic check)', minified };
    } catch (err) {
        // Catch unexpected errors
        return { valid: false, message: `CSV validation error: ${err.message}`, minified };
    }
  };
  
  
  /**
  * Validates JSON format.
  * @param {string} jsonString - The JSON string to validate
  * @returns {Object} Result with valid flag, error message if invalid, and minified JSON
  */
  export const validateJSON = (jsonString) => {
    if (!jsonString || !jsonString.trim()) {
        return { valid: false, message: 'JSON content cannot be empty' };
    }
  
    let minified = jsonString; // Start with original in case parsing fails
  
    try {
        // Try to parse the JSON. This is the primary validation step.
        const parsed = JSON.parse(jsonString);
  
        // If parsing succeeds, stringify it back to normalize formatting (minified)
        minified = JSON.stringify(parsed);
  
        // Optional: Add checks for expected data structures, common for conversions
        // Check if it's an array (e.g., [{}, {}])
        if (Array.isArray(parsed)) {
            if (parsed.length === 0) {
                return { valid: true, message: 'JSON is a valid empty array', minified };
            }
  
            // Check if the first element is an object (common for rows)
            if (typeof parsed[0] !== 'object' || parsed[0] === null) {
                return { valid: true, message: 'JSON is a valid array, but first element is not an object', minified };
            }
  
            // Looks like a valid array of objects structure
            return { valid: true, message: 'JSON format is valid (array of objects structure)', minified };
        }
        // Check if it's an object with a 'rows' property (e.g., { rows: [...] })
        else if (typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.rows)) {
            if (parsed.rows.length === 0) {
                return { valid: true, message: 'JSON is valid, has empty "rows" array', minified };
            }
            // Check if the first element in 'rows' is an object
            if (typeof parsed.rows[0] !== 'object' || parsed.rows[0] === null) {
                return { valid: true, message: 'JSON has "rows" array, but first element is not an object', minified };
            }
            // Looks like a valid object with a 'rows' array of objects structure
            return { valid: true, message: 'JSON format is valid ({rows:[{...}]})', minified };
        }
        // If it's a valid JSON but not one of the expected data structures
        else {
            return { valid: true, message: 'JSON format is valid (not array or {rows})', minified };
        }
  
    } catch (err) {
        // JSON.parse failed - it's invalid JSON
        return { valid: false, message: `Invalid JSON: ${err.message}`, minified: jsonString }; // Return original as minification failed
    }
  };
  
  /**
   * Validates XML format
   * @param {string} xmlString - The XML string to validate
   * @returns {Object} Result with valid flag and error message if invalid
   */
  export const validateXML = (xmlString) => {
      if (!xmlString || !xmlString.trim()) {
        return { valid: false, message: 'XML content cannot be empty' };
      }
    
      // Minify the XML before validation
      const minified = minifyInput(xmlString, 'xml');
    
      try {
        // Use regex to check for basic XML structure (simplified validation)
        // Check for opening and closing tags
        const rootTagMatch = minified.match(/<(\w+)[^>]*>[\s\S]*<\/\1>/);
        if (!rootTagMatch) {
          return { valid: false, message: 'XML is missing root element', minified };
        }
    
        // Check for <row> elements which are expected for SQL conversion
        const rowsMatch = minified.match(/<row>[\s\S]*?<\/row>/g);
        if (!rowsMatch || rowsMatch.length === 0) {
          return { valid: false, message: 'XML must contain at least one <row> element for SQL conversion', minified };
        }
    
        // Check for balanced tags (simplified check)
        const openTags = (minified.match(/<\w+[^>]*>/g) || []).length;
        const closeTags = (minified.match(/<\/\w+>/g) || []).length;
        if (openTags !== closeTags) {
          return { valid: false, message: `Unbalanced XML tags: ${openTags} opening vs ${closeTags} closing`, minified };
        }
    
        return { valid: true, message: 'XML format is valid', minified };
      } catch (err) {
        return { valid: false, message: `Validation error: ${err.message}`, minified };
      }
  };
  
  /**
   * Validates the schema structure and contents.
   * Checks for valid syntax and verifies field definitions.
   * Supports JSON, YAML, XML, TOML, CSV formats and both internal schema format and JSON Schema (draft 2020-12) format.
   * @param {string} schemaString - The schema string to validate
   * @param {string} format - Schema format ('json', 'yaml', 'xml', 'toml', 'csv'). Auto-detected if not provided.
   * @returns {Promise<Object>} Result with valid flag and error message if invalid
   */
  export const validateSchema = async (schemaString, format = null) => {
      if (!schemaString || !schemaString.trim()) {
        return { valid: false, message: 'Schema cannot be empty' };
      }
    
      // Import schema parsers dynamically
      let parsedSchema;
      try {
        const { parseSchema, detectSchemaFormat } = await import('./schemaParsers.js');
        
        // Auto-detect format if not provided
        if (!format) {
          format = detectSchemaFormat(schemaString);
        }
        
        // Parse schema based on format
        parsedSchema = await parseSchema(schemaString, format);
      } catch (err) {
        return { valid: false, message: `Invalid schema syntax: ${err.message}` };
      }
    
      // Check if the top level is an object
      if (typeof parsedSchema !== 'object' || parsedSchema === null || Array.isArray(parsedSchema)) {
        return { valid: false, message: 'Schema must be a JSON object ({...})' };
      }
    
      // Check if this is JSON Schema format (has 'properties' key)
      if (parsedSchema.properties) {
        // Validate JSON Schema format
        if (parsedSchema.type && parsedSchema.type !== 'object') {
          return { valid: false, message: 'JSON Schema root type must be "object" for data generation' };
        }
        
        const properties = parsedSchema.properties || {};
        if (Object.keys(properties).length === 0) {
          return { valid: false, message: 'JSON Schema must define at least one property in "properties"' };
        }
        
        // Validate each property
        for (const [propName, propDef] of Object.entries(properties)) {
          if (typeof propDef !== 'object' || propDef === null) {
            return { valid: false, message: `Property "${propName}" must be an object definition` };
          }
          
          if (!propDef.type) {
            return { valid: false, message: `Property "${propName}" is missing a "type" field` };
          }
          
          const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
          if (!validTypes.includes(propDef.type)) {
            return { valid: false, message: `Property "${propName}" has invalid type "${propDef.type}". Supported types: ${validTypes.join(', ')}` };
          }
          
          // Validate type-specific constraints
          if (propDef.type === 'string') {
            if (propDef.minLength !== undefined && typeof propDef.minLength !== 'number') {
              return { valid: false, message: `Property "${propName}" minLength must be a number` };
            }
            if (propDef.maxLength !== undefined && typeof propDef.maxLength !== 'number') {
              return { valid: false, message: `Property "${propName}" maxLength must be a number` };
            }
            if (propDef.minLength !== undefined && propDef.maxLength !== undefined && propDef.minLength > propDef.maxLength) {
              return { valid: false, message: `Property "${propName}" minLength cannot be greater than maxLength` };
            }
          } else if (propDef.type === 'number' || propDef.type === 'integer') {
            if (propDef.minimum !== undefined && typeof propDef.minimum !== 'number') {
              return { valid: false, message: `Property "${propName}" minimum must be a number` };
            }
            if (propDef.maximum !== undefined && typeof propDef.maximum !== 'number') {
              return { valid: false, message: `Property "${propName}" maximum must be a number` };
            }
            if (propDef.minimum !== undefined && propDef.maximum !== undefined && propDef.minimum > propDef.maximum) {
              return { valid: false, message: `Property "${propName}" minimum cannot be greater than maximum` };
            }
          } else if (propDef.type === 'array') {
            if (!propDef.items) {
              return { valid: false, message: `Property "${propName}" of type "array" must define "items"` };
            }
          } else if (propDef.type === 'object') {
            if (propDef.properties && Object.keys(propDef.properties).length === 0) {
              return { valid: false, message: `Property "${propName}" of type "object" must define at least one property` };
            }
          }
        }
        
        // JSON Schema format is valid
        return { valid: true, message: 'JSON Schema format is valid.' };
      }
    
      // Validate internal schema format
      const fieldNames = Object.keys(parsedSchema);
      if (fieldNames.length === 0) {
        return { valid: false, message: 'Schema object cannot be empty, must define fields' };
      }
    
      for (const fieldName of fieldNames) {
        const fieldDefinition = parsedSchema[fieldName];
    
        // A field definition can be a simple string (type) or an object (type with options)
        if (typeof fieldDefinition === 'string') {
          // Simple type string (e.g., "firstName")
          if (!isValidFieldType(fieldDefinition)) {
            return { valid: false, message: `Invalid field type "${fieldDefinition}" for field "${fieldName}"` };
          }
        } else if (typeof fieldDefinition === 'object' && fieldDefinition !== null) {
          // Complex type object (e.g., {"type": "number", ...})
          if (!fieldDefinition.hasOwnProperty('type')) {
            return { valid: false, message: `Field "${fieldName}" definition object is missing the "type" property` };
          }
          if (typeof fieldDefinition.type !== 'string' || !isValidFieldType(fieldDefinition.type)) {
             return { valid: false, message: `Invalid or missing field type property "${fieldDefinition.type}" for field "${fieldName}"` };
          }
          // You might add more specific checks here for options based on type (min/max for number, values for enum, etc.)
        } else {
          // Neither a string nor a valid object
          return { valid: false, message: `Invalid definition for field "${fieldName}". Must be a string type or an object definition.` };
        }
      }
    
      // If all checks pass
      return { valid: true, message: 'Schema is valid.' };
  };