/**
 * shared/utils/sqlUtils.js
 * -------------------------
 * Utilities specific to SQL operations
 */

/**
 * Split SQL statements by semicolons while respecting comments and strings
 * @param {string} sql - SQL string containing multiple statements
 * @returns {Array<string>} Array of individual SQL statements
 */
export const splitSqlStatements = (sql) => {
    if (!sql || !sql.trim()) {
      return [];
    }
    
    // First remove comments to simplify parsing
    let cleanSql = sql
      // Remove single-line comments
      .replace(/--.*$/mg, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '');
    
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < cleanSql.length; i++) {
      const char = cleanSql[i];
      const nextChar = cleanSql[i + 1] || '';
      
      // Handle string literals
      if ((char === "'" || char === '"') && (i === 0 || cleanSql[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      // Add character to current statement
      currentStatement += char;
      
      // If semicolon outside of string, end the statement
      if (char === ';' && !inString) {
        const trimmed = currentStatement.trim();
        if (trimmed) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }
    
    // Add the last statement if there's no trailing semicolon
    const trimmed = currentStatement.trim();
    if (trimmed) {
      statements.push(trimmed);
    }
    
    return statements;
  };
  
  /**
   * Determine SQL statement type (SELECT, INSERT, CREATE, etc.)
   * @param {string} sql - SQL statement
   * @returns {string} Statement type or 'unknown'
   */
  export const getSqlStatementType = (sql) => {
    if (!sql || !sql.trim()) {
      return 'unknown';
    }
    
    const normalized = sql.trim().toUpperCase();
    
    if (normalized.startsWith('SELECT')) return 'select';
    if (normalized.startsWith('INSERT')) return 'insert';
    if (normalized.startsWith('UPDATE')) return 'update';
    if (normalized.startsWith('DELETE')) return 'delete';
    if (normalized.startsWith('CREATE TABLE')) return 'create_table';
    if (normalized.startsWith('CREATE INDEX')) return 'create_index';
    if (normalized.startsWith('CREATE VIEW')) return 'create_view';
    if (normalized.startsWith('ALTER TABLE')) return 'alter_table';
    if (normalized.startsWith('DROP TABLE')) return 'drop_table';
    if (normalized.startsWith('PRAGMA')) return 'pragma';
    if (normalized.startsWith('BEGIN')) return 'transaction_begin';
    if (normalized.startsWith('COMMIT')) return 'transaction_commit';
    if (normalized.startsWith('ROLLBACK')) return 'transaction_rollback';
    
    return 'unknown';
  };
  
  /**
   * Format cell value for display in results table
   * @param {any} value - Cell value from SQL results
   * @returns {string} Formatted value for display
   */
  export const formatCellValue = (value) => {
    if (value === null) return '<null>';
    if (value === '') return '<empty>';
    
    // Check if the value is a Date object or ISO date string
    if (value instanceof Date) {
      return value.toLocaleString();
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      try {
        return new Date(value).toLocaleString();
      } catch (e) {
        // If date parsing fails, return original
        return String(value);
      }
    }
    
    // Handle special number cases
    if (typeof value === 'number') {
      // Format large numbers with commas
      if (Math.abs(value) >= 1000) {
        return value.toLocaleString();
      }
      // Format decimal places for floating point numbers
      if (Math.floor(value) !== value) {
        return value.toFixed(4).replace(/\.?0+$/, '');
      }
    }
    
    // Truncate very long strings
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Generate SQLite table schema with common data types
   * @param {string} tableName - Name of the table to generate
   * @param {number} numColumns - Number of columns to generate
   * @returns {string} CREATE TABLE statement
   */
  export const generateSampleTableSchema = (tableName = 'sample_table', numColumns = 5) => {
    const columnTypes = [
      { name: 'id', type: 'INTEGER PRIMARY KEY' },
      { name: 'name', type: 'TEXT NOT NULL' },
      { name: 'email', type: 'TEXT UNIQUE' },
      { name: 'age', type: 'INTEGER' },
      { name: 'salary', type: 'REAL' },
      { name: 'hire_date', type: 'DATE' },
      { name: 'active', type: 'BOOLEAN' },
      { name: 'description', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    // Ensure we include at least the ID column plus requested number
    const numToGenerate = Math.min(numColumns, columnTypes.length);
    const selectedColumns = columnTypes.slice(0, numToGenerate);
    
    // Generate the CREATE TABLE statement
    return `CREATE TABLE ${tableName} (
    ${selectedColumns.map(col => `${col.name} ${col.type}`).join(',\n  ')}
  );`;
  };
  
  /**
   * Generate sample data INSERT statements for a table
   * @param {string} tableName - Table name
   * @param {Array<string>} columns - Column names
   * @param {number} numRows - Number of rows to generate
   * @returns {string} INSERT statements
   */
  export const generateSampleData = (tableName, columns, numRows = 5) => {
    if (!tableName || !columns || !columns.length) {
      return '';
    }
    
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      const values = columns.map(col => {
        const colName = col.toLowerCase();
        
        if (colName === 'id') return i + 1;
        if (colName.includes('name')) return `'Sample Name ${i + 1}'`;
        if (colName.includes('email')) return `'user${i + 1}@example.com'`;
        if (colName.includes('age')) return Math.floor(Math.random() * 40) + 20;
        if (colName.includes('salary')) return (Math.random() * 70000 + 30000).toFixed(2);
        if (colName.includes('date')) return `'2023-${(i % 12) + 1}-${(i % 28) + 1}'`;
        if (colName.includes('active')) return Math.random() > 0.3 ? 1 : 0;
        if (colName.includes('description')) return `'Sample description ${i + 1}'`;
        if (colName.includes('created')) return `'2023-01-01 12:00:00'`;
        
        // Default fallback
        return `'Value ${i + 1}'`;
      });
      
      rows.push(`(${values.join(', ')})`);
    }
    
    return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${rows.join(',\n')};`;
  };
  
  /**
   * Generate a common SQL query for a given table
   * @param {string} tableName - Table name
   * @param {Array<string>} columns - Column names
   * @param {string} queryType - Type of query to generate ('select', 'count', 'filter', etc.)
   * @returns {string} SQL query statement
   */
  export const generateSampleQuery = (tableName, columns = [], queryType = 'select') => {
    if (!tableName) {
      return '';
    }
    
    // If no columns provided, use * for SELECT
    const columnList = columns.length ? columns.join(', ') : '*';
    
    switch (queryType.toLowerCase()) {
      case 'select':
        return `SELECT ${columnList} FROM ${tableName};`;
        
      case 'count':
        return `SELECT COUNT(*) AS total_count FROM ${tableName};`;
        
      case 'filter':
        // Find a suitable column for filtering
        let filterColumn = 'id';
        if (columns.includes('active')) filterColumn = 'active';
        else if (columns.some(c => c.includes('name'))) {
          filterColumn = columns.find(c => c.includes('name'));
        }
        
        if (filterColumn === 'id') {
          return `SELECT ${columnList} FROM ${tableName} WHERE ${filterColumn} > 1;`;
        } else if (filterColumn === 'active') {
          return `SELECT ${columnList} FROM ${tableName} WHERE ${filterColumn} = 1;`;
        } else {
          return `SELECT ${columnList} FROM ${tableName} WHERE ${filterColumn} LIKE 'Sample%';`;
        }
        
      case 'order':
        // Find a suitable column for ordering
        let orderColumn = 'id';
        if (columns.includes('created_at')) orderColumn = 'created_at';
        else if (columns.includes('name')) orderColumn = 'name';
        
        return `SELECT ${columnList} FROM ${tableName} ORDER BY ${orderColumn} DESC;`;
        
      default:
        return `SELECT ${columnList} FROM ${tableName};`;
    }
  };