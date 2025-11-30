/**
 * schemaParsers.js
 * Parsers for different schema formats (JSON, XML, YAML, TOML, CSV)
 * Converts all formats to internal schema format
 */

import * as yaml from 'js-yaml';
import xml2js from 'xml2js';

/**
 * Parse JSON schema (already in correct format or JSON Schema format)
 * @param {string} schemaText - JSON schema text
 * @returns {Object} Parsed schema object
 */
export const parseJsonSchema = (schemaText) => {
  try {
    return JSON.parse(schemaText);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
};

/**
 * Parse YAML schema
 * @param {string} schemaText - YAML schema text
 * @returns {Object} Parsed schema object
 */
export const parseYamlSchema = (schemaText) => {
  try {
    const parsed = yaml.load(schemaText);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('YAML schema must be an object');
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid YAML: ${error.message}`);
  }
};

/**
 * Parse XML schema
 * @param {string} schemaText - XML schema text
 * @returns {Object} Parsed schema object
 */
export const parseXmlSchema = async (schemaText) => {
  try {
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(schemaText);
    
    // Convert XML structure to schema format
    const schema = xmlToSchema(result);
    return schema;
  } catch (err) {
    throw new Error(`Invalid XML: ${err.message}`);
  }
};

/**
 * Convert XML structure to schema format
 * @param {Object} xmlObj - Parsed XML object
 * @returns {Object} Schema object
 */
const xmlToSchema = (xmlObj) => {
  const schema = {};
  
  // Get root element
  const rootKey = Object.keys(xmlObj)[0];
  const root = xmlObj[rootKey];
  
  if (!root || typeof root !== 'object') {
    throw new Error('XML schema must have a root element with child elements');
  }
  
  // Process each child element
  for (const [key, value] of Object.entries(root)) {
    if (key === '_' || key === '$') {
      // Skip XML attributes and text content markers
      continue;
    }
    
    if (Array.isArray(value)) {
      // Array of elements
      if (value.length > 0) {
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          // Complex object array
          schema[key] = [xmlToSchema({ [key]: firstItem })];
        } else {
          // Simple value array
          schema[key] = inferType(value[0]);
        }
      } else {
        schema[key] = 'string';
      }
    } else if (typeof value === 'object' && value !== null) {
      // Nested object
      if (value._) {
        // Has text content
        schema[key] = inferType(value._);
      } else if (value.$) {
        // Has attributes only
        schema[key] = 'string';
      } else {
        // Nested object structure
        schema[key] = xmlToSchema({ [key]: value });
      }
    } else {
      // Simple value
      schema[key] = inferType(value);
    }
  }
  
  return schema;
};

/**
 * Infer type from value
 * @param {*} value - Value to infer type from
 * @returns {string} Type string
 */
const inferType = (value) => {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'number' : 'number';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else if (typeof value === 'string') {
    // Try to detect common patterns
    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      return 'email';
    } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return 'uuid';
    } else if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return 'date';
    }
    return 'string';
  }
  return 'string';
};

/**
 * Parse TOML schema
 * @param {string} schemaText - TOML schema text
 * @returns {Object} Parsed schema object
 */
export const parseTomlSchema = (schemaText) => {
  try {
    // Simple TOML parser (basic implementation)
    // For production, consider using a library like @iarna/toml or toml
    const schema = {};
    const lines = schemaText.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      // Section header [section]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1).trim();
        if (!schema[currentSection]) {
          schema[currentSection] = {};
        }
        continue;
      }
      
      // Key-value pair
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        const value = trimmed.substring(equalIndex + 1).trim();
        
        // Remove quotes
        const cleanValue = value.replace(/^["']|["']$/g, '');
        
        // Infer type
        let type = 'string';
        if (cleanValue === 'true' || cleanValue === 'false') {
          type = 'boolean';
        } else if (/^-?\d+$/.test(cleanValue)) {
          type = 'number';
        } else if (/^-?\d+\.\d+$/.test(cleanValue)) {
          type = 'number';
        } else if (cleanValue === 'email') {
          type = 'email';
        } else if (cleanValue === 'uuid') {
          type = 'uuid';
        } else if (cleanValue === 'date') {
          type = 'date';
        }
        
        if (currentSection) {
          schema[currentSection][key] = type;
        } else {
          schema[key] = type;
        }
      }
    }
    
    return schema;
  } catch (error) {
    throw new Error(`Invalid TOML: ${error.message}`);
  }
};

/**
 * Parse CSV schema
 * @param {string} schemaText - CSV schema text
 * @returns {Object} Parsed schema object
 */
export const parseCsvSchema = (schemaText) => {
  try {
    const lines = schemaText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('CSV schema must have at least a header row');
    }
    
    const schema = {};
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    // Process each header
    for (const header of headers) {
      if (!header) continue;
      
      // Check if header has type annotation (e.g., "name:string", "age:number")
      const colonIndex = header.indexOf(':');
      if (colonIndex > 0) {
        const fieldName = header.substring(0, colonIndex).trim();
        const typeHint = header.substring(colonIndex + 1).trim().toLowerCase();
        
        // Map common type hints
        let type = 'string';
        if (typeHint === 'number' || typeHint === 'int' || typeHint === 'integer') {
          type = 'number';
        } else if (typeHint === 'bool' || typeHint === 'boolean') {
          type = 'boolean';
        } else if (typeHint === 'email') {
          type = 'email';
        } else if (typeHint === 'uuid' || typeHint === 'id') {
          type = 'uuid';
        } else if (typeHint === 'date') {
          type = 'date';
        }
        
        schema[fieldName] = type;
      } else {
        // No type hint, infer from header name
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('email')) {
          schema[header] = 'email';
        } else if (lowerHeader.includes('id') && (lowerHeader.includes('uuid') || lowerHeader.includes('guid'))) {
          schema[header] = 'uuid';
        } else if (lowerHeader.includes('age') || lowerHeader.includes('count') || lowerHeader.includes('number')) {
          schema[header] = 'number';
        } else if (lowerHeader.includes('active') || lowerHeader.includes('enabled') || lowerHeader.includes('is')) {
          schema[header] = 'boolean';
        } else if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
          schema[header] = 'date';
        } else {
          schema[header] = 'string';
        }
      }
    }
    
    return schema;
  } catch (error) {
    throw new Error(`Invalid CSV: ${error.message}`);
  }
};

/**
 * Detect schema format from text
 * @param {string} schemaText - Schema text
 * @returns {string} Format ('json', 'yaml', 'xml', 'toml', 'csv')
 */
export const detectSchemaFormat = (schemaText) => {
  const trimmed = schemaText.trim();
  
  // Check for XML
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return 'xml';
  }
  
  // Check for TOML (section headers)
  if (trimmed.includes('[') && trimmed.includes(']') && !trimmed.startsWith('{')) {
    return 'toml';
  }
  
  // Check for CSV (comma-separated, no indentation)
  if (trimmed.includes(',') && !trimmed.includes('\n  ') && !trimmed.includes('\n\t')) {
    const lines = trimmed.split('\n');
    if (lines.length > 0 && lines[0].split(',').length > 1) {
      return 'csv';
    }
  }
  
  // Check for YAML (starts with key: or has ---)
  if (trimmed.startsWith('---') || /^[a-zA-Z_][a-zA-Z0-9_]*:\s/.test(trimmed)) {
    return 'yaml';
  }
  
  // Default to JSON
  return 'json';
};

/**
 * Parse schema in any format
 * @param {string} schemaText - Schema text
 * @param {string} format - Schema format ('json', 'yaml', 'xml', 'toml', 'csv')
 * @returns {Promise<Object>} Parsed schema object
 */
export const parseSchema = async (schemaText, format = null) => {
  if (!format) {
    format = detectSchemaFormat(schemaText);
  }
  
  switch (format.toLowerCase()) {
    case 'json':
      return parseJsonSchema(schemaText);
    
    case 'yaml':
    case 'yml':
      return parseYamlSchema(schemaText);
    
    case 'xml':
      return await parseXmlSchema(schemaText);
    
    case 'toml':
      return parseTomlSchema(schemaText);
    
    case 'csv':
      return parseCsvSchema(schemaText);
    
    default:
      throw new Error(`Unsupported schema format: ${format}`);
  }
};

