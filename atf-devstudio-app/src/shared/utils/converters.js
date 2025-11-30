/**
 * shared/utils/converters.js
 * --------------------------
 * Utilities for converting between data formats
 */

/**
 * Helper function to escape XML content
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export const escapeXml = (str) => {
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
 * Parse a CSV line handling quoted fields
 * @param {string} line - CSV line
 * @returns {Array<string>} Array of field values
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
      continue;
    }

    if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        // Escaped quote inside quotes
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  // Add the last field
  result.push(current);
  return result;
};


/**
 * Convert SQL to JSON format
 * @param {string} sql - SQL query string
 * @returns {Object} JSON representation of the SQL statement structure
 */
export const sqlToJson = (sql) => {
  // This is a simplified implementation for demonstration
  // In a real application, you would use a proper SQL parser library

  const result = {
    type: 'unknown'
  };

  // Detect statement type
  if (sql.match(/\bSELECT\b/i)) {
    result.type = 'select';

    // Extract from clause
    const fromMatch = sql.match(/\bFROM\s+([^\s;,]+)/i);
    if (fromMatch) {
      result.table = fromMatch[1];
    }

    // Extract where clause
    const whereMatch = sql.match(/\bWHERE\s+(.+?)(?:\bGROUP BY\b|\bORDER BY\b|\bLIMIT\b|;|$)/is);
    if (whereMatch) {
      result.where = whereMatch[1].trim();
    }

    // Extract selected columns
    const selectMatch = sql.match(/\bSELECT\s+(.+?)\s+\bFROM\b/is);
    if (selectMatch) {
      const columns = selectMatch[1].split(',').map(col => col.trim());
      result.columns = columns;
    }
  } else if (sql.match(/\bINSERT\b/i)) {
    result.type = 'insert';

    // Extract table name
    const intoMatch = sql.match(/\bINTO\s+([^\s(;]+)/i);
    if (intoMatch) {
      result.table = intoMatch[1];
    }

    // Extract columns
    const columnsMatch = sql.match(/\(([^)]+)\)\s+\bVALUES\b/i);
    if (columnsMatch) {
      const columns = columnsMatch[1].split(',').map(col => col.trim());
      result.columns = columns;
    }

    // Extract values
    const valuesMatches = sql.match(/\bVALUES\b\s*\(([^)]+)\)/ig);
    if (valuesMatches) {
      result.values = valuesMatches.map(valuesStr => {
        const valueMatch = valuesStr.match(/\(([^)]+)\)/);
        if (valueMatch) {
          return valueMatch[1].split(',').map(val => val.trim());
        }
        return [];
      });
    }
  } else if (sql.match(/\bUPDATE\b/i)) {
    result.type = 'update';

    // Extract table name
    const updateMatch = sql.match(/\bUPDATE\s+([^\s;]+)/i);
    if (updateMatch) {
      result.table = updateMatch[1];
    }

    // Extract set clause
    const setMatch = sql.match(/\bSET\s+(.+?)(?:\bWHERE\b|;|$)/is);
    if (setMatch) {
      const setPairs = setMatch[1].split(',').map(pair => {
        const [column, value] = pair.split('=').map(p => p.trim());
        return { column, value };
      });
      result.set = setPairs;
    }

    // Extract where clause
    const whereMatch = sql.match(/\bWHERE\s+(.+?)(?:;|$)/is);
    if (whereMatch) {
      result.where = whereMatch[1].trim();
    }
  } else if (sql.match(/\bDELETE\b/i)) {
    result.type = 'delete';

    // Extract table name
    const fromMatch = sql.match(/\bFROM\s+([^\s;,]+)/i);
    if (fromMatch) {
      result.table = fromMatch[1];
    }

    // Extract where clause
    const whereMatch = sql.match(/\bWHERE\s+(.+?)(?:;|$)/is);
    if (whereMatch) {
      result.where = whereMatch[1].trim();
    }
  } else if (sql.match(/\bCREATE\s+TABLE\b/i)) {
    result.type = 'create_table';

    // Extract table name
    const tableMatch = sql.match(/\bCREATE\s+TABLE\s+([^\s(;]+)/i);
    if (tableMatch) {
      result.table = tableMatch[1];
    }

    // Extract columns and their types
    const columnsMatch = sql.match(/\(([^)]+)\)/s);
    if (columnsMatch) {
      const columnDefs = columnsMatch[1].split(',').map(col => col.trim());
      result.columns = columnDefs.map(def => {
        const parts = def.split(/\s+/);
        return {
          name: parts[0],
          type: parts[1],
          constraints: parts.slice(2).join(' ')
        };
      });
    }
  }

  return result;
};

/**
 * Convert SQL to CSV format (supports INSERT statements primarily)
 * @param {string} sql - SQL query string
 * @returns {string} CSV representation of the SQL data or info message
 */
export const sqlToCsv = (sql) => {
  // This is a simplified implementation for demonstration
  // In a real application, you would use a SQL parser library

  const json = sqlToJson(sql);

  if (json.type === 'insert' && json.columns && json.values) {
    // Create CSV header row
    const header = json.columns.join(',');

    // Create data rows
    const rows = json.values.map(valueRow => {
      return valueRow.map(val => {
        // Remove quotes from string values for CSV
        let cleanVal = val.replace(/^['"]|['"]$/g, '');
        // Escape quotes within the value if necessary (for CSV)
        cleanVal = cleanVal.replace(/"/g, '""');
        // Enclose in quotes if contains comma or newline or quote
        if (cleanVal.includes(',') || cleanVal.includes('\n') || cleanVal.includes('"')) {
             cleanVal = `"${cleanVal}"`;
        }
        return cleanVal;
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }

  // Default fallback for other SQL types
  return `# Unable to convert this SQL type to CSV\n# Original SQL:\n# ${sql.replace(/\n/g, '\n# ')}`;
};

/**
 * Convert SQL to XML format (supports INSERT and CREATE TABLE statements primarily)
 * @param {string} sql - SQL query string
 * @returns {string} XML representation of the SQL data/schema or info message
 */
export const sqlToXml = (sql) => {
  // This is a simplified implementation for demonstration
  // In a real application, you would use a SQL parser library

  const json = sqlToJson(sql);

  if (json.type === 'insert' && json.columns && json.values && json.table) {
    // For INSERT statements, convert to XML data
    const rows = json.values.map((valueRow, idx) => {
      const fields = valueRow.map((val, colIdx) => {
        // Remove quotes from string values
        const cleanVal = val.replace(/^['"]|['"]$/g, '');
        const column = json.columns[colIdx];
         // Basic XML element naming - needs sanitization for invalid chars
        const safeColumn = column.replace(/[^a-zA-Z0-9_]/g, '_'); // Simple sanitization
        return `    <${safeColumn}>${escapeXml(cleanVal)}</${safeColumn}>`;
      }).join('\n');

      return `  <row id="${idx + 1}">\n${fields}\n  </row>`;
    }).join('\n');

     // Basic XML root naming - needs sanitization
    const safeRoot = json.table.replace(/[^a-zA-Z0-9_]/g, '_'); // Simple sanitization
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${safeRoot}>\n${rows}\n</${safeRoot}>`;

  } else if (json.type === 'create_table' && json.columns && json.table) {
    // For CREATE TABLE statements, convert to XML schema representation
    const columns = json.columns.map(col => {
      // Basic XML element naming - needs sanitization
      const safeName = col.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const safeType = col.type ? escapeXml(col.type) : '';
      const safeConstraints = col.constraints ? ` constraints="${escapeXml(col.constraints)}"` : '';
      return `  <column name="${safeName}" type="${safeType}"${safeConstraints}/>`;
    }).join('\n');

     // Basic XML root naming - needs sanitization
    const safeTable = json.table.replace(/[^a-zA-Z0-9_]/g, '_');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<table name="${safeTable}">\n${columns}\n</table>`;
  }

  // Default fallback for other SQL types
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sql>\n  <![CDATA[\n${sql}\n  ]]>\n</sql>`;
};

/**
 * Convert CSV to SQL format (generates INSERT statements)
 * @param {string} csv - CSV data string
 * @param {string} tableName - Table name to use in SQL
 * @returns {string} SQL INSERT statements generated from CSV or error message
 */
export const csvToSql = (csv, tableName = 'imported_data') => {
  try {
    // Parse CSV
    const lines = csv.trim().split('\n');
    if (lines.length === 0) {
      return '-- Empty CSV data';
    }

    // Extract headers and escape them for SQL identifiers
    const headers = parseCSVLine(lines[0]).map(header => {
      // Remove quotes if they exist from parsed header
      header = header.replace(/^["']|["']$/g, '');
      // Escape header for SQL identifier (using backticks)
      return `\`${header.replace(/`/g, '``')}\``;
    });

    // Generate SQL
    // Escape table name as well
    const escapedTableName = `\`${tableName.replace(/`/g, '``')}\``;
    let sql = `INSERT INTO ${escapedTableName} (${headers.join(', ')}) VALUES\n`;

    // Add data rows
    const valueRows = [];
    for (let i = 1; i < lines.length; i++) {
       if (lines[i].trim() === '') continue; // Skip empty lines
      const values = parseCSVLine(lines[i]);

      // Ensure number of values matches headers
      if (values.length !== headers.length) {
           // Handle potential errors gracefully, perhaps add a comment and skip the row
           console.warn(`Skipping row ${i+1} due to mismatching column count: ${values.length} vs ${headers.length}`);
           valueRows.push(`-- Skipping row ${i+1} due to column count mismatch`);
           continue;
       }

      // Format values for SQL
      const sqlValues = values.map(val => {
        if (val === '' || val === null || val === undefined) {
          return 'NULL';
        }
        // Remove quotes if they exist from parsed value
        val = val.replace(/^["']|["']$/g, '');

        // Check if it's a number (allowing for optional sign and decimal)
        if (/^-?\d+(\.\d+)?$/.test(val)) {
          return val;
        }
        // Otherwise treat as string and escape single quotes
        return `'${val.replace(/'/g, "''")}'`;
      });

      valueRows.push(`(${sqlValues.join(', ')})`);
    }

    if (valueRows.length === 0 || valueRows.every(row => row.startsWith('-- Skipping'))) {
         return `-- No valid data rows found to generate INSERT statements`;
    }


    sql += valueRows.join(',\n') + ';';
    return sql;
  } catch (err) {
    return `-- Error converting CSV to SQL: ${err.message}`;
  }
};

/**
 * Convert JSON to SQL format (generates INSERT statements)
 * @param {string} json - JSON data string
 * @param {string} tableName - Table name to use in SQL
 * @returns {string} SQL INSERT statements generated from JSON or error message
 */
export const jsonToSql = (json, tableName = 'imported_data') => {
  try {
    // Parse JSON
    const data = JSON.parse(json);

    if (!Array.isArray(data) || data.length === 0) {
      return '-- Empty or invalid JSON data (expected an array)';
    }

    // Extract column names from the first object and escape them for SQL identifiers
    const firstObj = data[0];
    if (typeof firstObj !== 'object' || firstObj === null) {
         return '-- Invalid JSON data (expected an array of objects)';
    }
    const columns = Object.keys(firstObj).map(col =>
      `\`${col.replace(/`/g, '``')}\``
    );

    if (columns.length === 0) {
        return '-- No columns found in JSON data';
    }

    // Generate SQL
    // Escape table name as well
    const escapedTableName = `\`${tableName.replace(/`/g, '``')}\``;
    let sql = `INSERT INTO ${escapedTableName} (${columns.join(', ')}) VALUES\n`;

    // Add data rows
    const valueRows = data.map(obj => {
       // Ensure object is valid
       if (typeof obj !== 'object' || obj === null) {
            console.warn(`Skipping invalid object in JSON array:`, obj);
            return `-- Skipping invalid object`;
       }
      const values = columns.map(col => {
        // Remove backticks for accessing the raw key
        const rawCol = col.replace(/`/g, '');
        const val = obj[rawCol];

        if (val === null || val === undefined) {
          return 'NULL';
        } else if (typeof val === 'number') {
          return val; // Numbers don't need quotes
        } else if (typeof val === 'boolean') {
          return val ? 1 : 0; // Convert boolean to 0 or 1
        } else if (typeof val === 'object') {
           // Stringify nested objects/arrays for storage (adjust as needed)
          try {
             return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          } catch {
             console.warn(`Could not stringify nested object for column ${rawCol}:`, val);
             return 'NULL'; // Fallback if stringification fails
          }
        } else {
           // Treat as string and escape single quotes
          return `'${String(val).replace(/'/g, "''")}'`;
        }
      });

      return `(${values.join(', ')})`;
    });

     if (valueRows.length === 0 || valueRows.every(row => row.startsWith('-- Skipping'))) {
         return `-- No valid data rows found to generate INSERT statements`;
    }

    // Filter out skipping comments before joining
    const validValueRows = valueRows.filter(row => !row.startsWith('-- Skipping'));

    if (validValueRows.length === 0) {
         return `-- No valid data rows found to generate INSERT statements`;
    }

    sql += validValueRows.join(',\n') + ';';
    return sql;
  } catch (err) {
    return `-- Error converting JSON to SQL: ${err.message}`;
  }
};

/**
 * Convert XML to SQL format (generates INSERT statements)
 * @param {string} xml - XML data string
 * @param {string} tableName - Table name to use in SQL
 * @returns {string} SQL INSERT statements generated from XML or error message
 */
export const xmlToSql = (xml, tableName = 'imported_data') => {
  try {
    // This is a simplified implementation for demonstration
    // In a real application, you would use a robust XML parser library (e.g., DOMParser, xml2js)

    // Trim XML content
    const trimmedXml = xml.trim();

    // Try to detect the row element pattern
    // Look for the first element that is a direct child of the root or main repeating element
    const rootMatch = trimmedXml.match(/<(\w+)[^>]*>/);
    if (!rootMatch) {
        return '-- Unable to find root element in XML';
    }
    const rootElement = rootMatch[1];

    // A very basic attempt to find a repeating child element name
    // This regex looks for an element immediately following the root element, then tries to find a repeating pattern
    const repeatingElementMatch = trimmedXml.match(new RegExp(`<${rootElement}[^>]*>\\s*<(\\w+)[^>]*>`, 's'));
    let rowElement = repeatingElementMatch ? repeatingElementMatch[1] : null;

     // If no repeating element found immediately, try looking for *any* repeating element name inside the root
    if (!rowElement) {
         const innerElementMatch = trimmedXml.substring(trimmedXml.indexOf('>') + 1).match(/<(\w+)[^>]*>[\s\S]*?<\/\1>/s);
         if (innerElementMatch && innerElementMatch[1] !== rootElement) {
            // Check if this element name appears more than once
            const countRegex = new RegExp(`<${innerElementMatch[1]}[^>]*>[\\s\\S]*?<\\/${innerElementMatch[1]}>`, 'g');
             if ((trimmedXml.match(countRegex) || []).length > 1) {
                 rowElement = innerElementMatch[1];
             }
         }
    }


    if (!rowElement) {
      return '-- Unable to identify repeating data elements in XML (expected elements like <row> or specific entity names)';
    }

    // Extract all row elements
    const rowRegex = new RegExp(`<${rowElement}[^>]*>([\\s\\S]*?)<\\/${rowElement}>`, 'g');
    const rows = [];
    let match;
    while ((match = rowRegex.exec(trimmedXml)) !== null) {
      rows.push(match[1]); // Capture group 1 contains the inner content
    }

    if (rows.length === 0) {
      return '-- No data rows found for element <' + rowElement + '>';
    }

    // Extract all column names (unique) from the first row's direct child elements
    const fieldRegex = /<(\w+)[^>]*>([\s\S]*?)<\/\1>/g;
    const firstRow = rows[0];
    const columns = [];
    const columnSet = new Set();

    // Reset regex lastIndex for a new string/match
    fieldRegex.lastIndex = 0;
    while ((match = fieldRegex.exec(firstRow)) !== null) {
      if (!columnSet.has(match[1])) {
        columns.push(match[1]); // The tag name is in capture group 1
        columnSet.add(match[1]);
      }
    }

    if (columns.length === 0) {
      return '-- No child elements found within the first <' + rowElement + '> element to use as columns';
    }

    // Generate SQL
    // Escape table and column names for SQL identifiers
    const escapedTableName = `\`${tableName.replace(/`/g, '``')}\``;
    const escapedColumns = columns.map(col => `\`${col.replace(/`/g, '``')}\``);

    let sql = `INSERT INTO ${escapedTableName} (${escapedColumns.join(', ')}) VALUES\n`;

    // Extract values from each row
    const valueRows = rows.map((rowStr, rowIndex) => {
      const values = [];

      for (const col of columns) {
        // Regex to find the specific column within the current row string
        // Make sure to handle potential attributes in the opening tag
        const valueMatch = new RegExp(`<${col}[^>]*>([\\s\\S]*?)<\\/${col}>`, 'i').exec(rowStr);

        if (valueMatch) {
          let value = valueMatch[1].trim(); // Captured content is in group 1

          // Try to determine if it's a number
          if (/^-?\d+(\.\d+)?$/.test(value)) {
            values.push(value); // Numbers don't need quotes
          } else {
            // Treat as string and escape single quotes
            values.push(`'${value.replace(/'/g, "''")}'`);
          }
        } else {
          values.push('NULL'); // Column not found in this row
        }
      }

      return `(${values.join(', ')})`;
    });

    if (valueRows.length === 0) {
         return `-- No data rows found to generate INSERT statements`;
    }

    sql += valueRows.join(',\n') + ';';
    return sql;
  } catch (err) {
    return `-- Error converting XML to SQL: ${err.message}`;
  }
};


/**
 * Generate a suggested table name based on the input data and type
 * @param {string} input - Input data string
 * @param {string} type - Data type ('csv', 'json', 'xml')
 * @returns {string} A suggested table name
 */
export const suggestTableName = (input, type) => {
  const defaultName = 'imported_data';
  try {
    if (typeof input !== 'string' || input.trim() === '') {
         return defaultName;
    }

    switch (type) {
      case 'csv':
        // Try to extract a name from the first column of the header row
        const lines = input.trim().split('\n');
        if (lines.length > 0) {
          const headerRow = lines[0];
          const headers = parseCSVLine(headerRow);

          if (headers.length > 0) {
             // Use the first header, sanitize it
             let header = headers[0].replace(/^["']|["']$/g, '').trim();

             // Convert to snake_case and sanitize for SQL identifier
             const tableName = header
               .toLowerCase()
               .replace(/\s+/g, '_') // Replace spaces with underscores
               .replace(/[^a-z0-9_]/g, '') // Remove characters not allowed in SQL names
               .replace(/_+/g, '_') // Collapse multiple underscores
               .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

            // Basic check: if the sanitized name is meaningful
             if (tableName && tableName !== 'id' && tableName !== 'name' && tableName !== 'value') {
               // Check if it suggests a singular entity and make it plural
               return tableName.endsWith('s') ? tableName : `${tableName}s`;
             }
          }
        }
        return defaultName;

      case 'json':
        try {
          const jsonData = JSON.parse(input);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            // If it's an array, try to determine the entity type from the first object's keys or values
            const firstObj = jsonData[0];
            if (firstObj && typeof firstObj === 'object') {
              const keys = Object.keys(firstObj);

              // Common entity identifier keys (prioritize)
              const entityKeys = ['type', 'kind', 'entity', 'category'];
              for (const key of entityKeys) {
                if (keys.includes(key) && typeof firstObj[key] === 'string' && firstObj[key].trim() !== '') {
                  const value = firstObj[key].trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                  if (value) {
                    return value.endsWith('s') ? value : `${value}s`;
                  }
                }
              }

              // If 'id' exists, look for another key that might indicate the entity
              if (keys.includes('id')) {
                 for (const key of keys) {
                   if (key !== 'id' && typeof firstObj[key] === 'string' && firstObj[key].trim() !== '') {
                      const value = key.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                       if (value) {
                           return value.endsWith('s') ? value : `${value}s`;
                       }
                   }
                 }
              }

              // As a fallback, try the first non-ID key
               if (keys.length > 0) {
                   const firstMeaningfulKey = keys.find(key => key.toLowerCase() !== 'id');
                   if (firstMeaningfulKey) {
                        const value = firstMeaningfulKey.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                        if (value) {
                            return value.endsWith('s') ? value : `${value}s`;
                        }
                   }
               }

            }
          }
        } catch {
          // Ignore parsing errors, return default name
        }
        return defaultName;

      case 'xml':
        // Try to extract the root element name or a common child element name
        const rootMatch = input.match(/<(\w+)[^>]*>/);
        if (rootMatch && rootMatch[1]) {
          const rootName = rootMatch[1].toLowerCase();
           // If the root is generic, look for a child element
           if (rootName === 'root' || rootName === 'data' || rootName.endsWith('list')) {
                // Look for the first element that repeats (a potential row element)
                 const repeatingElementMatch = input.match(new RegExp(`<${rootName}[^>]*>\\s*<(\\w+)[^>]*>`, 's'));
                 let childName = repeatingElementMatch ? repeatingElementMatch[1] : null;

                 // If not found immediately, search more broadly for any repeating tag inside root
                 if (!childName) {
                      const innerElementMatch = input.substring(input.indexOf('>') + 1).match(/<(\w+)[^>]*>[\s\S]*?<\/\1>/s);
                      if (innerElementMatch && innerElementMatch[1] !== rootName) {
                         const countRegex = new RegExp(`<${innerElementMatch[1]}[^>]*>[\\s\\S]*?<\\/${innerElementMatch[1]}>`, 'g');
                         if ((input.match(countRegex) || []).length > 1) {
                              childName = innerElementMatch[1];
                         }
                      }
                 }

                if (childName) {
                    const cleanChildName = childName.replace(/[^a-z0-9_]/g, '_').toLowerCase();
                    return cleanChildName.endsWith('s') ? cleanChildName : `${cleanChildName}s`;
                }

           } else {
             // If root name is specific, use it (sanitize)
             const cleanRootName = rootName.replace(/[^a-z0-9_]/g, '_');
              return cleanRootName.endsWith('s') ? cleanRootName : `${cleanRootName}s`;
           }
        }
        return defaultName;

      default:
        return defaultName;
    }
  } catch {
    return defaultName; // Return default on any error
  }
};