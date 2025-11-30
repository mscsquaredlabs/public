// utils/sqlFormatter.js

/**
 * SQL Formatting Utility
 * Provides SQL formatting capabilities for different database dialects
 * with customizable formatting options and syntax highlighting support.
 */

// --------------------------------------------
// SQL Keywords by Category
// --------------------------------------------
const SQL_KEYWORDS = {
  DML: [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'MERGE', 'UPSERT'
  ],
  DDL: [
    'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'COMMENT'
  ],
  DCL: [
    'GRANT', 'REVOKE', 'DENY'
  ],
  TCL: [
    'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'BEGIN', 'START', 'TRANSACTION'
  ],
  CLAUSES: [
    'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
    'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'MINUS'
  ],
  JOINS: [
    'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 
    'FULL OUTER JOIN', 'CROSS JOIN', 'NATURAL JOIN'
  ],
  FUNCTIONS: [
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'CAST', 'CONVERT', 'SUBSTRING', 'LENGTH', 'TRIM', 'UPPER', 'LOWER'
  ],
  LOGICAL: [
    'AND', 'OR', 'NOT', 'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'IS', 'IS NOT'
  ],
  DATA_TYPES: [
    'VARCHAR', 'CHAR', 'TEXT', 'INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'DECIMAL', 'NUMERIC',
    'FLOAT', 'DOUBLE', 'REAL', 'DATE', 'TIME', 'TIMESTAMP', 'BOOLEAN', 'BOOL'
  ]
};

// --------------------------------------------
// Default Formatting Options
// --------------------------------------------
const DEFAULT_OPTIONS = {
  indentSize: 2,
  keywordCase: 'upper',         // 'upper', 'lower', 'preserve'
  identifierCase: 'preserve',   // 'upper', 'lower', 'preserve'
  newlineBeforeKeywords: true,
  indentSubqueries: true,
  alignCommas: false,
  removeTrailingWhitespace: true,
  maxLineLength: 120,
  dialectSpecific: true
};

// --------------------------------------------
// Main Formatting Function
// --------------------------------------------
export const formatSQL = (sql, dialect = 'sql', options = {}) => {
  if (!sql || typeof sql !== 'string') return sql || '';
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    let formattedSQL = cleanSQL(sql);
    formattedSQL = applyBasicFormatting(formattedSQL, opts);
    if (opts.dialectSpecific) {
      formattedSQL = applyDialectSpecificFormatting(formattedSQL, dialect, opts);
    }
    formattedSQL = finalCleanup(formattedSQL, opts);
    return formattedSQL;
  } catch (error) {
    console.error('SQL formatting error:', error);
    return sql;
  }
};

// --------------------------------------------
// Helper Functions for Formatting
// --------------------------------------------

const cleanSQL = (sql) => {
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*;\s*/g, '; ')
    .trim();
};

const applyBasicFormatting = (sql, options) => {
  let formatted = sql;
  formatted = applyKeywordCase(formatted, options.keywordCase);
  if (options.newlineBeforeKeywords) {
    formatted = addNewlinesBeforeKeywords(formatted);
  }
  formatted = applyIndentation(formatted, options.indentSize);
  return formatted;
};

const applyKeywordCase = (sql, caseType) => {
  if (caseType === 'preserve') return sql;
  const allKeywords = [
    ...SQL_KEYWORDS.DML, ...SQL_KEYWORDS.DDL, ...SQL_KEYWORDS.DCL,
    ...SQL_KEYWORDS.TCL, ...SQL_KEYWORDS.CLAUSES, ...SQL_KEYWORDS.JOINS,
    ...SQL_KEYWORDS.FUNCTIONS, ...SQL_KEYWORDS.LOGICAL, ...SQL_KEYWORDS.DATA_TYPES
  ];
  let result = sql;
  allKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const replacement = caseType === 'upper' ? keyword.toUpperCase() : keyword.toLowerCase();
    result = result.replace(regex, replacement);
  });
  return result;
};

const addNewlinesBeforeKeywords = (sql) => {
  const majorKeywords = [
    'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 
    'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'MINUS',
    'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'
  ];
  let result = sql;
  majorKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, `\n${keyword}`);
  });
  SQL_KEYWORDS.JOINS.forEach(join => {
    const regex = new RegExp(`\\b${join}\\b`, 'gi');
    result = result.replace(regex, `\n${join}`);
  });
  return result;
};

const applyIndentation = (sql, indentSize) => {
  const lines = sql.split('\n');
  let indentLevel = 0;
  const indent = ' '.repeat(indentSize);

  return lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return '';
    if (trimmedLine.match(/^(END|ELSE|\))/i)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    const indentedLine = indent.repeat(indentLevel) + trimmedLine;
    if (trimmedLine.match(/^(SELECT|CASE|WHEN|\()/i)) {
      indentLevel++;
    }
    return indentedLine;
  }).join('\n');
};

const applyDialectSpecificFormatting = (sql, dialect, options) => {
  switch (dialect.toLowerCase()) {
    case 'postgresql': return formatPostgreSQL(sql, options);
    case 'mysql':      return formatMySQL(sql, options);
    case 'oracle':     return formatOracle(sql, options);
    case 'sybase':     return formatSybase(sql, options);
    default:           return sql;
  }
};

// --------------------------------------------
// Dialect-Specific Formatters
// --------------------------------------------

const formatPostgreSQL = (sql, options) => {
  let formatted = sql;
  formatted = formatted.replace(/\bILIKE\b/gi, 'ILIKE');
  formatted = formatted.replace(/\bSERIAL\b/gi, 'SERIAL');
  formatted = formatted.replace(/\bBIGSERIAL\b/gi, 'BIGSERIAL');
  formatted = formatted.replace(/\[\s*\]/g, '[]');
  const pgFunctions = ['EXTRACT', 'DATE_PART', 'AGE', 'NOW', 'CURRENT_TIMESTAMP'];
  pgFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b`, 'gi');
    formatted = formatted.replace(regex, func.toUpperCase());
  });
  return formatted;
};

const formatMySQL = (sql, options) => {
  let formatted = sql;
  formatted = formatted.replace(/\bLIMIT\s+\d+\s+OFFSET\s+\d+/gi, (match) => {
    return match.replace(/OFFSET/gi, ',');
  });
  formatted = formatted.replace(/`([^`]+)`/g, '`$1`');
  const mysqlFunctions = ['CONCAT', 'SUBSTRING', 'DATE_FORMAT', 'STR_TO_DATE'];
  mysqlFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b`, 'gi');
    formatted = formatted.replace(regex, func.toUpperCase());
  });
  return formatted;
};

const formatOracle = (sql, options) => {
  let formatted = sql;
  formatted = formatted.replace(/\bROWNUM\b/gi, 'ROWNUM');
  formatted = formatted.replace(/\bDUAL\b/gi, 'DUAL');
  const oracleFunctions = ['DECODE', 'NVL', 'NVL2', 'TO_CHAR', 'TO_DATE', 'TO_NUMBER'];
  oracleFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b`, 'gi');
    formatted = formatted.replace(regex, func.toUpperCase());
  });
  return formatted;
};

const formatSybase = (sql, options) => {
  let formatted = sql;
  formatted = formatted.replace(/\bTOP\s+\d+/gi, (match) => match.toUpperCase());
  const sybaseFunctions = ['CONVERT', 'ISNULL', 'DATEDIFF', 'DATEADD'];
  sybaseFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b`, 'gi');
    formatted = formatted.replace(regex, func.toUpperCase());
  });
  return formatted;
};

// --------------------------------------------
// Final Cleanup
// --------------------------------------------
const finalCleanup = (sql, options) => {
  let cleaned = sql;
  if (options.removeTrailingWhitespace) {
    cleaned = cleaned.replace(/[ \t]+$/gm, '');
  }
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/\n+$/, '\n');
  return cleaned.trim();
};

// --------------------------------------------
// Validation, Extraction, and Helpers
// --------------------------------------------
export const validateSQL = (sql) => {
  if (!sql || !sql.trim()) {
    return { isValid: false, errors: ['SQL query is empty'] };
  }
  const errors = [];
  const warnings = [];
  const parenthesesCount = (sql.match(/\(/g) || []).length - (sql.match(/\)/g) || []).length;
  if (parenthesesCount !== 0) {
    errors.push(`Unmatched parentheses: ${Math.abs(parenthesesCount)} ${parenthesesCount > 0 ? 'opening' : 'closing'} parentheses`);
  }
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
  dangerousKeywords.forEach(keyword => {
    if (sql.toUpperCase().includes(keyword + ' ')) {
      warnings.push(`Potentially dangerous keyword detected: ${keyword}`);
    }
  });
  if (sql.toUpperCase().includes('SELECT *') && sql.length > 50) {
    warnings.push('Consider specifying column names instead of using SELECT *');
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const extractTables = (sql) => {
  const tables = new Set();
  const fromMatches = sql.match(/FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
  const joinMatches = sql.match(/JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
  if (fromMatches) {
    fromMatches.forEach(match => {
      const tableName = match.replace(/^FROM\s+/i, '').trim();
      tables.add(tableName);
    });
  }
  if (joinMatches) {
    joinMatches.forEach(match => {
      const tableName = match.replace(/^JOIN\s+/i, '').trim();
      tables.add(tableName);
    });
  }
  return Array.from(tables);
};

export const getQueryType = (sql) => {
  if (!sql || typeof sql !== 'string') return 'UNKNOWN';
  const trimmedSQL = sql.trim().toUpperCase();
  if (trimmedSQL.startsWith('SELECT'))   return 'SELECT';
  if (trimmedSQL.startsWith('INSERT'))   return 'INSERT';
  if (trimmedSQL.startsWith('UPDATE'))   return 'UPDATE';
  if (trimmedSQL.startsWith('DELETE'))   return 'DELETE';
  if (trimmedSQL.startsWith('CREATE'))   return 'CREATE';
  if (trimmedSQL.startsWith('ALTER'))    return 'ALTER';
  if (trimmedSQL.startsWith('DROP'))     return 'DROP';
  if (trimmedSQL.startsWith('TRUNCATE')) return 'TRUNCATE';
  if (trimmedSQL.startsWith('GRANT'))    return 'GRANT';
  if (trimmedSQL.startsWith('REVOKE'))   return 'REVOKE';
  if (trimmedSQL.startsWith('COMMIT'))   return 'COMMIT';
  if (trimmedSQL.startsWith('ROLLBACK')) return 'ROLLBACK';
  return 'UNKNOWN';
};

export const isReadOnlyQuery = (sql) => {
  const queryType = getQueryType(sql);
  const readOnlyTypes = ['SELECT'];
  return readOnlyTypes.includes(queryType);
};

export const formatSQLForDisplay = (sql, maxLength = 100) => {
  if (!sql) return '';
  const formatted = formatSQL(sql);
  if (formatted.length <= maxLength) return formatted;
  return formatted.substring(0, maxLength - 3) + '...';
};

export const minifySQL = (sql) => {
  if (!sql) return '';
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*=\s*/g, '=')
    .replace(/\s*<\s*/g, '<')
    .replace(/\s*>\s*/g, '>')
    .replace(/\s*;\s*/g, ';')
    .trim();
};

export const splitSQLStatements = (sql) => {
  if (!sql) return [];
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar) {
      if (i > 0 && sql[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }
    } else if (!inString && char === ';') {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
      continue;
    }
    currentStatement += char;
  }
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  return statements;
};

// --------------------------------------------
// Syntax Highlighting
// --------------------------------------------
export const highlightSQL = (sql) => {
  if (!sql) return '';
  let highlighted = sql;

  // Highlight keywords
  const allKeywords = [
    ...SQL_KEYWORDS.DML, ...SQL_KEYWORDS.DDL, ...SQL_KEYWORDS.DCL,
    ...SQL_KEYWORDS.TCL, ...SQL_KEYWORDS.CLAUSES, ...SQL_KEYWORDS.JOINS,
    ...SQL_KEYWORDS.FUNCTIONS, ...SQL_KEYWORDS.LOGICAL, ...SQL_KEYWORDS.DATA_TYPES
  ];
  allKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlighted = highlighted.replace(regex, `<span class="sql-keyword">${keyword.toUpperCase()}</span>`);
  });

  // Highlight strings (single and double quotes)
  highlighted = highlighted.replace(/'([^']*)'/g, `<span class="sql-string">'$1'</span>`);
  highlighted = highlighted.replace(/"([^"]*)"/g, `<span class="sql-string">"$1"</span>`);

  // Highlight numbers
  highlighted = highlighted.replace(/\b\d+\b/g, '<span class="sql-number">$&</span>');

  // Highlight comments (line and block)
  highlighted = highlighted.replace(/--.*$/gm, '<span class="sql-comment">$&</span>');
  highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="sql-comment">$&</span>');

  return highlighted;
};

// --------------------------------------------
// Formatting Suggestions
// --------------------------------------------
export const getSQLFormattingSuggestions = (sql) => {
  if (!sql) return [];
  const suggestions = [];
  if (sql.includes('select')) suggestions.push('Consider using uppercase for SQL keywords (SELECT instead of select)');
  if (sql.includes('  ')) suggestions.push('Multiple consecutive spaces found - consider normalizing whitespace');
  if (!sql.includes('\n') && sql.length > 80) suggestions.push('Long query without line breaks - consider adding line breaks for readability');
  if (sql.includes('SELECT *')) suggestions.push('Consider specifying column names instead of using SELECT *');
  if (!sql.trim().endsWith(';')) suggestions.push('Consider adding a semicolon at the end of your query');
  const parenthesesCount = (sql.match(/\(/g) || []).length - (sql.match(/\)/g) || []).length;
  if (parenthesesCount !== 0) suggestions.push('Unmatched parentheses detected - please check your query syntax');
  return suggestions;
};

// --------------------------------------------
// Export Utilities
// --------------------------------------------
export default {
  formatSQL,
  validateSQL,
  extractTables,
  getQueryType,
  isReadOnlyQuery,
  formatSQLForDisplay,
  minifySQL,
  splitSQLStatements,
  highlightSQL,
  getSQLFormattingSuggestions
};
