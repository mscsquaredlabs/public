// src/components/SqlFormatter/SqlTableVisualizer.jsx
// -----------------------------------------------------------------------------
//  - SQL Table Structure Visualizer 
//  - Extracts and displays table structure from CREATE TABLE statements
//  - Supports dark mode and integrates with the SQL Formatter component
// -----------------------------------------------------------------------------

import React from 'react';
import './SqlTableVisualizer.css';

/**
 * Parses a CREATE TABLE SQL statement and extracts column definitions
 * @param {string} sql - The SQL CREATE TABLE statement
 * @returns {object|null} Parsed table data or null if not a valid CREATE TABLE
 */
export const parseCreateTable = (sql) => {
  // Clean up the SQL for easier parsing
  const cleanSql = sql.replace(/\n/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim();
  
  // Check if this is a CREATE TABLE statement
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|"|')?([^`"'\s(]+)(?:`|"|')?(?:\.(?:`|"|')?([^`"'\s(]+)(?:`|"|')?)?/i;
  const tableMatch = cleanSql.match(createTableRegex);
  
  if (!tableMatch) {
    return null;
  }
  
  // Extract schema and table name
  const schema = tableMatch[2] || tableMatch[1].includes('.') ? tableMatch[1].split('.')[0] : null;
  const tableName = tableMatch[2] || (tableMatch[1].includes('.') ? tableMatch[1].split('.')[1] : tableMatch[1]);
  
  // Extract the content between parentheses
  const parenthesesContent = cleanSql.substring(
    cleanSql.indexOf('(') + 1,
    cleanSql.lastIndexOf(')')
  );
  
  // If we couldn't extract content, return null
  if (!parenthesesContent) {
    return null;
  }
  
  // Split the content by commas, but handle commas inside parentheses carefully
  const columns = [];
  const constraints = [];
  let level = 0;
  let currentItem = '';
  
  for (let i = 0; i < parenthesesContent.length; i++) {
    const char = parenthesesContent[i];
    
    if (char === '(') {
      level++;
      currentItem += char;
    } else if (char === ')') {
      level--;
      currentItem += char;
    } else if (char === ',' && level === 0) {
      // We've found a top-level comma, so this is a separator
      const trimmedItem = currentItem.trim();
      if (trimmedItem) {
        if (/^(?:CONSTRAINT|PRIMARY\s+KEY|UNIQUE|FOREIGN\s+KEY|CHECK)/i.test(trimmedItem)) {
          constraints.push(trimmedItem);
        } else {
          columns.push(trimmedItem);
        }
      }
      currentItem = '';
    } else {
      currentItem += char;
    }
  }
  
  // Don't forget the last item
  if (currentItem.trim()) {
    if (/^(?:CONSTRAINT|PRIMARY\s+KEY|UNIQUE|FOREIGN\s+KEY|CHECK)/i.test(currentItem.trim())) {
      constraints.push(currentItem.trim());
    } else {
      columns.push(currentItem.trim());
    }
  }
  
  // Parse each column definition
  const parsedColumns = columns.map(column => {
    // Format: column_name data_type [constraints...]
    const parts = column.split(/\s+/);
    const columnName = parts[0].replace(/[`"']/g, '');
    
    // Extract data type (this can be complex with things like varchar(255))
    let dataType = '';
    let i = 1;
    let bracketLevel = 0;
    
    while (i < parts.length) {
      const part = parts[i];
      dataType += (i > 1 && !dataType.endsWith('(') ? ' ' : '') + part;
      
      // Count brackets to make sure we get the full type like "varchar(255)"
      bracketLevel += (part.match(/\(/g) || []).length;
      bracketLevel -= (part.match(/\)/g) || []).length;
      
      // If we have a balanced data type (no open brackets) and there's more to the line,
      // we've probably hit the constraints section
      if (bracketLevel === 0 && !part.match(/^(?:with|precision|scale)$/i)) {
        i++;
        break;
      }
      i++;
    }
    
    // The rest is constraints
    const constraintText = parts.slice(i).join(' ');
    
    // Parse specific constraints
    const constraints = {
      notNull: /NOT\s+NULL/i.test(constraintText),
      primaryKey: /PRIMARY\s+KEY/i.test(constraintText),
      unique: /UNIQUE/i.test(constraintText),
      defaultValue: constraintText.match(/DEFAULT\s+([^,)]+)/i)?.[1] || null,
      others: []
    };
    
    // Catch other constraints
    const otherConstraints = constraintText.match(/(?:CHECK|REFERENCES|COLLATE)[^,)]+/gi);
    if (otherConstraints) {
      constraints.others = otherConstraints;
    }
    
    return {
      name: columnName,
      dataType,
      constraints
    };
  });

  // Parse table constraints (PRIMARY KEY, UNIQUE, etc.)
  const tableConstraints = constraints.map(constraint => {
    // Extract the type of constraint
    const type = constraint.match(/^(?:CONSTRAINT\s+[^\s]+\s+)?(PRIMARY\s+KEY|UNIQUE|FOREIGN\s+KEY|CHECK)/i)?.[1] || 'CONSTRAINT';
    
    // Extract the columns affected
    const columnsMatch = constraint.match(/\(([^)]+)\)/);
    const columns = columnsMatch ? columnsMatch[1].split(',').map(col => col.trim().replace(/[`"']/g, '')) : [];
    
    return {
      type,
      columns,
      definition: constraint
    };
  });
  
  return {
    schema,
    tableName,
    columns: parsedColumns,
    tableConstraints
  };
};

/**
 * Component to visualize a table structure from SQL CREATE TABLE statement
 */
const SqlTableVisualizer = ({ sql }) => {
  const tableData = parseCreateTable(sql);
  
  if (!tableData) {
    return (
      <div className="sql-table-error">
        <p>Unable to parse SQL as a CREATE TABLE statement.</p>
        <p>This visualization only works with CREATE TABLE statements.</p>
      </div>
    );
  }
  
  return (
    <div className="sql-table-visualizer">
      <div className="table-header">
        <h3 className="table-name">
          {tableData.schema ? `${tableData.schema}.${tableData.tableName}` : tableData.tableName}
        </h3>
      </div>
      
      <div className="table-content">
        <table className="table-structure">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Constraints/Defaults</th>
            </tr>
          </thead>
          <tbody>
            {tableData.columns.map((column, index) => (
              <tr key={index}>
                <td>
                  <span className="column-name">{column.name}</span>
                </td>
                <td>
                  <span className="data-type">{column.dataType}</span>
                </td>
                <td className="constraints-cell">
                  {column.constraints.notNull && 
                    <span className="constraint not-null">NOT NULL</span>
                  }
                  {column.constraints.primaryKey && 
                    <span className="constraint primary-key">PRIMARY KEY</span>
                  }
                  {column.constraints.unique && 
                    <span className="constraint unique">UNIQUE</span>
                  }
                  {column.constraints.defaultValue && 
                    <span className="constraint default">DEFAULT {column.constraints.defaultValue}</span>
                  }
                  {column.constraints.others.map((constraint, i) => (
                    <span key={i} className="constraint other">{constraint}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {tableData.tableConstraints.length > 0 && (
          <div className="table-constraints">
            <h4>Table Constraints</h4>
            <ul>
              {tableData.tableConstraints.map((constraint, index) => (
                <li key={index}>
                  <span className="constraint-type">{constraint.type}</span>
                  {constraint.columns.length > 0 && (
                    <span className="constraint-columns">({constraint.columns.join(', ')})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlTableVisualizer;