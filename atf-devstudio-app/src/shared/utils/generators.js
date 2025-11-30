/**
 * shared/utils/generators.js
 * -------------------------
 * Utilities for generating test data and formatting output
 */

// Escape HTML for safe display
const escapeHtml = (str = '') =>
    str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  
  /**
   * Convert JSON Schema format to internal schema format
   * @param {Object} jsonSchema - JSON Schema object
   * @returns {Object} Internal schema format
   */
  const convertJsonSchemaToInternal = (jsonSchema) => {
    // Check if this is JSON Schema format (has 'properties' key)
    if (!jsonSchema.properties) {
      return jsonSchema; // Already in internal format
    }

    const internalSchema = {};
    const properties = jsonSchema.properties || {};
    const required = jsonSchema.required || [];

    for (const [key, prop] of Object.entries(properties)) {
      if (prop.type === 'string') {
        // Check for format hints
        if (prop.format === 'email') {
          internalSchema[key] = 'email';
        } else if (prop.format === 'uuid') {
          internalSchema[key] = 'uuid';
        } else if (prop.pattern && prop.pattern.includes('a-zA-Z0-9') && prop.pattern.includes('^') && prop.pattern.includes('$')) {
          // Alphanumeric pattern (like id field with pattern "^[a-zA-Z0-9_-]+$")
          internalSchema[key] = 'uuid';
        } else if (prop.pattern) {
          // For other patterns, use string type with format option
          internalSchema[key] = {
            type: 'string',
            format: `Pattern: ${prop.pattern}`,
            minLength: prop.minLength,
            maxLength: prop.maxLength
          };
        } else if (prop.minLength !== undefined || prop.maxLength !== undefined) {
          internalSchema[key] = {
            type: 'string',
            minLength: prop.minLength,
            maxLength: prop.maxLength
          };
        } else {
          internalSchema[key] = 'string';
        }
      } else if (prop.type === 'integer' || prop.type === 'number') {
        internalSchema[key] = {
          type: 'number',
          min: prop.minimum !== undefined ? prop.minimum : (prop.type === 'integer' ? 0 : undefined),
          max: prop.maximum !== undefined ? prop.maximum : undefined,
          precision: prop.type === 'integer' ? 0 : 2
        };
      } else if (prop.type === 'boolean') {
        // For boolean, use the default if provided, otherwise use 'boolean' type
        if (prop.default !== undefined) {
          internalSchema[key] = prop.default;
        } else {
          internalSchema[key] = 'boolean';
        }
      } else if (prop.type === 'array') {
        // Handle arrays - generate array of items
        if (prop.items) {
          const itemType = prop.items.type;
          if (itemType === 'string') {
            internalSchema[key] = ['string'];
          } else if (itemType === 'number' || itemType === 'integer') {
            internalSchema[key] = ['number'];
          } else if (itemType === 'boolean') {
            internalSchema[key] = ['boolean'];
          } else if (itemType === 'object' && prop.items.properties) {
            // Nested object array
            internalSchema[key] = [convertJsonSchemaToInternal(prop.items)];
          } else {
            internalSchema[key] = ['string'];
          }
        } else {
          internalSchema[key] = ['string'];
        }
      } else if (prop.type === 'object' && prop.properties) {
        // Nested object
        internalSchema[key] = convertJsonSchemaToInternal(prop);
      } else {
        // Fallback to string
        internalSchema[key] = 'string';
      }
    }

    return internalSchema;
  };

  /**
   * Generate data from a schema
   * @param {Object} schema - The schema object (supports both internal format and JSON Schema format)
   * @param {number} count - Number of items to generate
   * @param {string|null} seed - Optional seed for reproducible results
   * @returns {Array} Array of generated data objects
   */
  export const generateDataFromSchema = (schema, count = 1, seed = null) => {
    // If a seed is provided, use it to initialize the random number generator
    let randomState = seed ? createSeededRandom(seed) : Math.random;
    
    // Check if this is JSON Schema format and convert it
    let internalSchema = schema;
    if (schema.properties && schema.type === 'object') {
      internalSchema = convertJsonSchemaToInternal(schema);
    } else if (schema && typeof schema === 'object' && !schema.properties) {
      // Might be a parsed schema from XML/YAML/TOML/CSV
      // Check if it needs conversion (has nested objects that aren't schemas)
      internalSchema = schema;
    }
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const item = {};
      
      for (const [key, value] of Object.entries(internalSchema)) {
        if (typeof value === 'string') {
          // Simple type definition
          item[key] = generateValueForType(value, i, randomState);
        } else if (typeof value === 'object') {
          if (Array.isArray(value)) {
            // Array of values
            item[key] = value.map((v, idx) => {
              if (typeof v === 'string') {
                return generateValueForType(v, idx, randomState);
              } else if (typeof v === 'object') {
                return generateValueForTypeWithOptions(v, idx, randomState);
              }
              return v;
            });
          } else if (value !== null) {
            // Check if it's a nested object with its own schema
            if (value.type === undefined && !value.properties) {
              item[key] = generateDataFromSchema(value, 1, seed)[0];
            } else {
              // Complex type with options
              item[key] = generateValueForTypeWithOptions(value, i, randomState);
            }
          } else {
            item[key] = null;
          }
        }
      }
      
      results.push(item);
    }
    
    return results;
  };
  
  /**
   * Generate a seeded random function
   * @param {string} seed - The seed string
   * @returns {Function} A function that returns seeded random values
   */
  const createSeededRandom = (seed) => {
    // Simple seeded random function
    let value = 0;
    for (let i = 0; i < seed.length; i++) {
      value = ((value << 5) - value) + seed.charCodeAt(i);
      value |= 0; // Convert to 32bit integer
    }
    
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };
  
  /**
   * Generate a value for a simple type
   */
  const generateValueForType = (type, index, randomFn = Math.random) => {
    switch (type) {
      case 'string':
        return `String ${index + 1}`;
      case 'number':
        return Math.floor(randomFn() * 100);
      case 'boolean':
        return randomFn() > 0.5;
      case 'date':
        return new Date(Date.now() - Math.floor(randomFn() * 10000000000)).toISOString().split('T')[0];
      case 'name':
        const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
        const firstName = firstNames[Math.floor(randomFn() * firstNames.length)];
        const lastName = lastNames[Math.floor(randomFn() * lastNames.length)];
        return `${firstName} ${lastName}`;
      case 'firstName':
        const firstNamesOnly = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona'];
        return firstNamesOnly[Math.floor(randomFn() * firstNamesOnly.length)];
      case 'lastName':
        const lastNamesOnly = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
        return lastNamesOnly[Math.floor(randomFn() * lastNamesOnly.length)];
      case 'email':
        const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'company.co'];
        const domain = emailDomains[Math.floor(randomFn() * emailDomains.length)];
        return `user${index + 1}@${domain}`;
      case 'phone':
        return `+1-${Math.floor(randomFn() * 800) + 200}-${String(Math.floor(randomFn() * 900) + 100).padStart(3, '0')}-${String(Math.floor(randomFn() * 9000) + 1000).padStart(4, '0')}`;
      case 'address':
        const streets = ['Main St', 'Park Ave', 'Oak Ln', 'Maple Dr', 'Washington Blvd'];
        const street = streets[Math.floor(randomFn() * streets.length)];
        return `${Math.floor(randomFn() * 1000) + 1} ${street}`;
      case 'city':
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
        return cities[Math.floor(randomFn() * cities.length)];
      case 'country':
        const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'Brazil'];
        return countries[Math.floor(randomFn() * countries.length)];
      case 'zipCode':
        return `${Math.floor(randomFn() * 90000) + 10000}`;
      case 'uuid':
        return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
          const r = Math.floor(randomFn() * 16);
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      case 'id':
        return index + 1;
      case 'url':
        const urlPaths = ['products', 'services', 'about', 'contact', 'blog', 'news'];
        const path = urlPaths[Math.floor(randomFn() * urlPaths.length)];
        return `https://example.com/${path}/${index + 1}`;
      case 'hexColor':
        return `#${Math.floor(randomFn() * 16777215).toString(16).padStart(6, '0')}`;
      case 'ipAddress':
        return `${Math.floor(randomFn() * 256)}.${Math.floor(randomFn() * 256)}.${Math.floor(randomFn() * 256)}.${Math.floor(randomFn() * 256)}`;
      case 'lorem':
        return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
      case 'company':
        const companies = ['Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems', 'Aperture Science'];
        return companies[Math.floor(randomFn() * companies.length)];
      case 'jobTitle':
        const titles = ['Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer', 'Marketing Specialist', 'Sales Representative', 'HR Manager', 'CEO'];
        return titles[Math.floor(randomFn() * titles.length)];
      case 'creditCard':
        return `4242-4242-4242-${String(Math.floor(randomFn() * 9000) + 1000).padStart(4, '0')}`;
      case 'currency':
        return `$${(randomFn() * 1000).toFixed(2)}`;
      case 'username':
        const usernamePrefixes = ['user', 'person', 'member', 'guest', 'customer'];
        const prefix = usernamePrefixes[Math.floor(randomFn() * usernamePrefixes.length)];
        return `${prefix}_${index + 1}`;
      case 'password':
        return `Password${index + 1}!`;
      default:
        return `Value ${index + 1}`;
    }
  };
  
  /**
   * Generate a value for a type with options
   */
  const generateValueForTypeWithOptions = (typeObj, index, randomFn = Math.random) => {
    const type = typeObj.type || 'string';
    
    switch (type) {
      case 'number':
      case 'integer':
        const min = typeObj.min !== undefined ? typeObj.min : (typeObj.minimum !== undefined ? typeObj.minimum : 0);
        const max = typeObj.max !== undefined ? typeObj.max : (typeObj.maximum !== undefined ? typeObj.maximum : 100);
        const precision = typeObj.precision !== undefined ? typeObj.precision : (type === 'integer' ? 0 : 2);
        let value = min + randomFn() * (max - min);
        return precision === 0 ? Math.floor(value) : parseFloat(value.toFixed(precision));
        
      case 'date':
        const fromDate = typeObj.from ? new Date(typeObj.from) : new Date(2000, 0, 1);
        const toDate = typeObj.to === 'now' ? new Date() : (typeObj.to ? new Date(typeObj.to) : new Date());
        const randomDate = new Date(fromDate.getTime() + randomFn() * (toDate.getTime() - fromDate.getTime()));
        return randomDate.toISOString().split('T')[0];
        
      case 'enum':
        const values = typeObj.values || typeObj.enum || ['Value1', 'Value2', 'Value3'];
        return values[Math.floor(randomFn() * values.length)];
        
      case 'string':
        // Handle format hints
        if (typeObj.format) {
          if (typeObj.format.startsWith('Pattern:')) {
            // For patterns, generate a simple string
            return `String ${index + 1}`;
          }
          // Check for known formats
          if (typeObj.format === 'email') {
            return generateValueForType('email', index, randomFn);
          } else if (typeObj.format === 'uuid') {
            return generateValueForType('uuid', index, randomFn);
          }
        }
        // Handle minLength/maxLength
        let generatedString = typeObj.format || `Item ${index + 1}`;
        if (typeObj.minLength !== undefined || typeObj.maxLength !== undefined) {
          const minLen = typeObj.minLength || 1;
          const maxLen = typeObj.maxLength || 50;
          const targetLen = Math.floor(minLen + randomFn() * (maxLen - minLen));
          generatedString = generatedString.padEnd(targetLen, 'x').substring(0, targetLen);
        }
        return generatedString.replace('{{index}}', index + 1);
        
      default:
        return generateValueForType(type, index, randomFn);
    }
  };
  
  /**
   * Format the output data based on the selected format
   * @param {Array} data - The generated data
   * @param {string} format - The output format (json, yaml, csv, xml)
   * @returns {string} The formatted output
   */
  export const formatOutput = (data, format) => {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
        
      case 'yaml':
        return formatYaml(data);
        
      case 'csv':
        return formatCsv(data);
        
      case 'xml':
        return formatXml(data);
        
      default:
        return JSON.stringify(data, null, 2);
    }
  };
  
  /**
   * Format data as YAML
   */
  const formatYaml = (data) => {
    // Simple YAML conversion for demonstration
    const yamlLines = [];
    data.forEach((item, index) => {
      yamlLines.push(`- # Item ${index + 1}`);
      for (const [key, value] of Object.entries(item)) {
        const yamlValue = formatYamlValue(value, 2);
        yamlLines.push(`  ${key}: ${yamlValue}`);
      }
    });
    return yamlLines.join('\n');
  };
  
  /**
   * Helper function for YAML formatting
   */
  const formatYamlValue = (value, indentLevel) => {
    const indent = ' '.repeat(indentLevel);
    
    if (value === null || value === undefined) {
      return 'null';
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        
        let result = '\n';
        value.forEach(item => {
          result += `${indent}- ${formatYamlValue(item, indentLevel + 2)}\n`;
        });
        return result.trimEnd();
      } else {
        if (Object.keys(value).length === 0) return '{}';
        
        let result = '\n';
        for (const [k, v] of Object.entries(value)) {
          result += `${indent}${k}: ${formatYamlValue(v, indentLevel + 2)}\n`;
        }
        return result.trimEnd();
      }
    } else if (typeof value === 'string') {
      // Check if we need to quote the string
      if (value.includes('\n') || value.includes(':') || /^[0-9]/.test(value) || /^(true|false|yes|no|null)$/.test(value.toLowerCase())) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    } else {
      return value.toString();
    }
  };
  
  /**
   * Format data as CSV
   */
  const formatCsv = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(',')
    ];
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        return typeof value === 'string' ? `"${stringValue}"` : stringValue;
      });
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  };
  
  /**
   * Format data as XML
   */
  const formatXml = (data) => {
    const xmlLines = ['<?xml version="1.0" encoding="UTF-8"?>', '<items>'];
    data.forEach((item, index) => {
      xmlLines.push(`  <item id="${index + 1}">`);
      for (const [key, value] of Object.entries(item)) {
        xmlLines.push(formatXmlValue(key, value, 4));
      }
      xmlLines.push('  </item>');
    });
    xmlLines.push('</items>');
    return xmlLines.join('\n');
  };
  
  /**
   * Helper function for XML formatting
   */
  const formatXmlValue = (key, value, indentLevel) => {
    const indent = ' '.repeat(indentLevel);
    
    if (value === null || value === undefined) {
      return `${indent}<${key}></${key}>`;
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        let result = `${indent}<${key}>`;
        if (value.length > 0) {
          result += '\n';
          value.forEach((item, idx) => {
            if (typeof item === 'object' && item !== null) {
              result += `${indent}  <item id="${idx + 1}">\n`;
              for (const [itemKey, itemValue] of Object.entries(item)) {
                result += formatXmlValue(itemKey, itemValue, indentLevel + 4) + '\n';
              }
              result += `${indent}  </item>\n`;
            } else {
              result += `${indent}  <item>${escapeXml(item)}</item>\n`;
            }
          });
          result += `${indent}</${key}>`;
        } else {
          result += `</${key}>`;
        }
        return result;
      } else {
        let result = `${indent}<${key}>\n`;
        for (const [objKey, objValue] of Object.entries(value)) {
          result += formatXmlValue(objKey, objValue, indentLevel + 2) + '\n';
        }
        result += `${indent}</${key}>`;
        return result;
      }
    } else {
      return `${indent}<${key}>${escapeXml(value)}</${key}>`;
    }
  };
  
  /**
   * Helper function to escape XML content
   */
  const escapeXml = (str) => {
    if (typeof str !== 'string') {
      str = String(str);
    }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
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
        const highlightedTag = `&lt;<span class="tag">${tag}</span>`;
        
        // Highlight attributes if present
        let highlightedAttributes = '';
        if (attributes) {
          highlightedAttributes = attributes.replace(/([^\s=]+)=(?:"([^"]*)"|'([^']*)')/g, 
            (attrMatch, name, value1, value2) => {
              const value = value1 || value2 || '';
              return ` <span class="attribute">${name}</span>=<span class="attribute-value">"${value}"</span>`;
            }
          );
        }
        
        return `${highlightedTag}${highlightedAttributes}&gt;`;
      })
      // Add text content class for better reading
      .replace(/&gt;([^&<]+)&lt;/g, (match, content) => {
        return `&gt;<span class="text-content">${content}</span>&lt;`;
      });
  };