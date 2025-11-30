// SqlFiddleTab.jsx
// Tab content for SQL Fiddle

import { useState, useRef, useEffect, useCallback } from 'react';
import initSqlJs from 'sql.js';
import { formatSQL } from '../../shared/utils/formatters';

const SqlFiddleTab = ({
  fiddle,
  updateFiddle,
  deleteFiddle,
  setStatusMessage,
  darkMode,
  fiddleStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    schemaSQL,
    querySQL,
    activeTab,
    formatOnPaste,
    autoRunQuery,
  } = fiddle;

  const [currentSchemaSQL, setCurrentSchemaSQL] = useState(schemaSQL || '');
  const [currentQuerySQL, setCurrentQuerySQL] = useState(querySQL || '');
  const [currentActiveTab, setCurrentActiveTab] = useState(activeTab || 'schema');
  const [currentFormatOnPaste, setCurrentFormatOnPaste] = useState(formatOnPaste !== undefined ? formatOnPaste : true);
  const [currentAutoRunQuery, setCurrentAutoRunQuery] = useState(autoRunQuery !== undefined ? autoRunQuery : false);
  
  const [database, setDatabase] = useState(null);
  const [schemaBuildStatus, setSchemaBuildStatus] = useState({ status: '', message: '' });
  const [queryResults, setQueryResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbError, setDbError] = useState('');

  const schemaTextareaRef = useRef(null);
  const queryTextareaRef = useRef(null);
  const runQueryRef = useRef(null);

  // Load SQL.js
  useEffect(() => {
    const loadSqlJs = async () => {
      try {
        setIsLoading(true);
        setDbError('');
        
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/sql-wasm.wasm`
        });
        
        const db = new SQL.Database();
        window.SQL = SQL;
        setDatabase(db);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load SQL.js:', error);
        setDbError(`Database not initialized: ${error.message}. Please reload the page.`);
        setIsLoading(false);
      }
    };

    loadSqlJs();

    return () => {
      if (database) {
        try {
          database.close();
        } catch (e) {
          console.error('Error closing database:', e);
        }
      }
    };
  }, []);

  // Sync with prop changes
  useEffect(() => {
    setCurrentSchemaSQL(schemaSQL || '');
    setCurrentQuerySQL(querySQL || '');
    setCurrentActiveTab(activeTab || 'schema');
    setCurrentFormatOnPaste(formatOnPaste !== undefined ? formatOnPaste : true);
    setCurrentAutoRunQuery(autoRunQuery !== undefined ? autoRunQuery : false);
  }, [schemaSQL, querySQL, activeTab, formatOnPaste, autoRunQuery]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFiddle(id, {
        schemaSQL: currentSchemaSQL,
        querySQL: currentQuerySQL,
        activeTab: currentActiveTab,
        formatOnPaste: currentFormatOnPaste,
        autoRunQuery: currentAutoRunQuery,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentSchemaSQL, currentQuerySQL, currentActiveTab, currentFormatOnPaste, currentAutoRunQuery, updateFiddle]);

  // Split SQL statements
  const splitSqlStatements = useCallback((sql) => {
    return sql
      .replace(/--.*$/mg, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt);
  }, []);

  // Format cell value for display
  const formatCellValue = useCallback((value) => {
    if (value === null) return '<null>';
    if (value === '') return '<empty>';
    
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }, []);

  // Run a query
  const runQuery = useCallback(() => {
    if (!database) {
      setDbError('Database not initialized. Please reload the page.');
      setStatusMessage?.('Database not initialized. Please reload the page.');
      return;
    }
    
    if (!currentQuerySQL.trim()) {
      setQueryResults({ 
        status: 'error', 
        message: 'Query SQL is empty. Please enter a SQL query.'
      });
      setStatusMessage?.('Query SQL is empty. Please enter a SQL query.');
      return;
    }
    
    setIsLoading(true);
    setDbError('');
    setQueryResults(null);
    
    try {
      const statements = splitSqlStatements(currentQuerySQL);
      
      if (statements.length === 0) {
        setQueryResults({ 
          status: 'error', 
          message: 'No valid SQL statements found.'
        });
        setIsLoading(false);
        setStatusMessage?.('No valid SQL statements found.');
        return;
      }
      
      let lastSelectResult = null;
      let affectedRows = 0;
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        try {
          const isSelect = statement.trim().toUpperCase().startsWith('SELECT');
          
          if (isSelect) {
            const result = database.exec(statement);
            if (result.length > 0) {
              lastSelectResult = {
                columns: result[0].columns,
                values: result[0].values,
                sql: statement
              };
            } else {
              lastSelectResult = {
                columns: [],
                values: [],
                sql: statement
              };
            }
          } else {
            const result = database.run(statement);
            affectedRows += database.getRowsModified();
          }
        } catch (error) {
          setQueryResults({ 
            status: 'error', 
            message: `Error executing: ${statement.substring(0, 50)}... - ${error.message}`
          });
          
          setStatusMessage?.(`Query execution failed: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }
      
      if (lastSelectResult) {
        setQueryResults({
          status: 'success',
          message: `Query executed successfully (${lastSelectResult.values.length} rows returned)`,
          data: lastSelectResult
        });
        
        setStatusMessage?.(`Query executed successfully: ${lastSelectResult.values.length} rows returned`);
      } else {
        setQueryResults({
          status: 'success',
          message: `Query executed successfully (${affectedRows} rows affected)`,
          data: { affectedRows }
        });
        
        setStatusMessage?.(`Query executed successfully: ${affectedRows} rows affected`);
      }
    } catch (error) {
      console.error('Query execution error:', error);
      setQueryResults({ 
        status: 'error', 
        message: `Query execution failed: ${error.message}`
      });
      
      setStatusMessage?.(`Query execution failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [database, currentQuerySQL, splitSqlStatements, formatCellValue, setStatusMessage]);

  // Store runQuery in ref
  useEffect(() => {
    runQueryRef.current = runQuery;
  }, [runQuery]);

  // Build schema function
  const buildSchema = useCallback(() => {
    if (!database) {
      setDbError('Database not initialized. Please reload the page.');
      setStatusMessage?.('Database not initialized. Please reload the page.');
      return;
    }
    
    if (!currentSchemaSQL.trim()) {
      setSchemaBuildStatus({ 
        status: 'error', 
        message: 'Schema SQL is empty. Please enter CREATE TABLE statements.'
      });
      setStatusMessage?.('Schema SQL is empty. Please enter CREATE TABLE statements.');
      return;
    }
    
    setIsLoading(true);
    setDbError('');
    setSchemaBuildStatus({ status: '', message: '' });
    
    try {
      const SQL = window.SQL;
      if (!SQL) {
        throw new Error('SQL.js not loaded properly');
      }
      
      if (database) {
        try {
          database.close();
        } catch (e) {
          console.error('Error closing database:', e);
        }
      }
      
      const db = new SQL.Database();
      setDatabase(db);
      
      const statements = splitSqlStatements(currentSchemaSQL);
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        try {
          db.run(statement);
        } catch (error) {
          setSchemaBuildStatus({ 
            status: 'error', 
            message: `Error executing: ${statement.substring(0, 50)}... - ${error.message}`
          });
          
          setStatusMessage?.(`Schema build failed: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }
      
      const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      
      if (tablesResult.length === 0 || tablesResult[0].values.length === 0) {
        setSchemaBuildStatus({ 
          status: 'warning', 
          message: 'No tables were created. Check your SQL syntax.'
        });
        setStatusMessage?.('No tables were created. Check your SQL syntax.');
      } else {
        const tableNames = tablesResult[0].values.map(row => row[0]);
        
        setSchemaBuildStatus({
          status: 'success',
          message: `Schema built successfully: ${tableNames.length} tables created`
        });
        
        setStatusMessage?.(`Schema built successfully: ${tableNames.length} tables created`);
        
        if (currentAutoRunQuery) {
          setCurrentActiveTab('query');
          
          if (currentQuerySQL.trim()) {
            setTimeout(() => {
              if (runQueryRef.current) {
                runQueryRef.current();
              }
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('Schema build error:', error);
      setSchemaBuildStatus({ 
        status: 'error', 
        message: `Schema build failed: ${error.message}`
      });
      
      setStatusMessage?.(`Schema build failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [database, currentSchemaSQL, splitSqlStatements, currentAutoRunQuery, currentQuerySQL]);

  // Handle paste with auto-formatting
  const handlePaste = useCallback((e, setter) => {
    if (currentFormatOnPaste) {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      setter(formatSQL(text, 'sqlite'));
    }
  }, [currentFormatOnPaste]);

  // Format current SQL in editor
  const handleFormat = useCallback((sql, setter) => {
    setter(formatSQL(sql, 'sqlite'));
    setStatusMessage?.('SQL formatted');
  }, [setStatusMessage]);

  // Clear schema SQL
  const clearSchema = useCallback(() => {
    if (currentSchemaSQL.trim() && !window.confirm('Are you sure you want to clear the schema SQL?')) {
      return;
    }
    
    setCurrentSchemaSQL('');
    setSchemaBuildStatus({ status: '', message: '' });
    setStatusMessage?.('Schema cleared');
  }, [currentSchemaSQL, setStatusMessage]);

  // Clear query SQL
  const clearQuery = useCallback(() => {
    if (currentQuerySQL.trim() && !window.confirm('Are you sure you want to clear the query SQL?')) {
      return;
    }
    
    setCurrentQuerySQL('');
    setQueryResults(null);
    setStatusMessage?.('Query cleared');
  }, [currentQuerySQL, setStatusMessage]);

  // Generate sample schema SQL
  const getSampleSchema = useCallback(() => {
    return `CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending',
  total_amount REAL NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (order_id),
  FOREIGN KEY (product_id) REFERENCES products (product_id)
);

INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code) 
VALUES 
('John', 'Doe', 'john.doe@example.com', '555-123-4567', '123 Main St', 'Springfield', 'IL', '62701'),
('Jane', 'Smith', 'jane.smith@example.com', '555-987-6543', '456 Oak Ave', 'Riverdale', 'NY', '10471'),
('Alice', 'Johnson', 'alice.johnson@example.com', '555-555-5555', '789 Pine Rd', 'Portland', 'OR', '97209');

INSERT INTO products (product_name, description, price, stock_quantity, category) 
VALUES 
('Laptop', 'High-performance laptop', 1299.99, 45, 'Electronics'),
('Smartphone', 'Latest smartphone model', 899.99, 120, 'Electronics'),
('Headphones', 'Noise-cancelling headphones', 199.99, 78, 'Audio'),
('Coffee Maker', 'Automatic coffee machine', 149.99, 32, 'Kitchen Appliances'),
('Desk Chair', 'Ergonomic office chair', 249.99, 15, 'Furniture');

INSERT INTO orders (customer_id, order_date, status, total_amount)
VALUES
(1, '2023-01-15 10:30:00', 'completed', 1299.99),
(2, '2023-02-03 14:45:00', 'completed', 1099.98),
(1, '2023-03-20 09:15:00', 'shipped', 199.99),
(3, '2023-04-05 16:20:00', 'processing', 349.98);

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES
(1, 1, 1, 1299.99),
(2, 2, 1, 899.99),
(2, 3, 1, 199.99),
(3, 3, 1, 199.99),
(4, 4, 1, 149.99),
(4, 5, 1, 199.99);`;
  }, []);

  // Generate sample query SQL
  const getSampleQuery = useCallback(() => {
    return `-- Query to get total sales per product with customer count
SELECT
    p.product_id,
    p.product_name,
    COUNT(DISTINCT o.customer_id) AS unique_customers,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM
    products p
JOIN
    order_items oi ON p.product_id = oi.product_id
JOIN
    orders o ON oi.order_id = o.order_id
GROUP BY
    p.product_id,
    p.product_name
ORDER BY
    total_revenue DESC;

-- Query to get customer order history with order details
SELECT
    c.customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    o.order_id,
    o.order_date,
    o.status,
    COUNT(oi.order_item_id) AS item_count,
    o.total_amount
FROM
    customers c
JOIN
    orders o ON c.customer_id = o.customer_id
JOIN
    order_items oi ON o.order_id = oi.order_id
GROUP BY
    c.customer_id,
    o.order_id
ORDER BY
    o.order_date DESC;`;
  }, []);

  return (
    <div className={`sql-fiddle-tab-content ${fiddleStyle === 'modern' ? 'modern-style' : ''}`}>
      {dbError && (
        <div className="db-error-message">
          <p>{dbError}</p>
        </div>
      )}

      {/* Options Section */}
      <div className="sql-fiddle-options-section">
        <div className="options-row">
          <div className="option-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id={`format-on-paste-${id}`}
                checked={currentFormatOnPaste}
                onChange={(e) => setCurrentFormatOnPaste(e.target.checked)}
              />
              <span>Format on Paste</span>
            </label>
          </div>

          <div className="option-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id={`auto-run-query-${id}`}
                checked={currentAutoRunQuery}
                onChange={(e) => setCurrentAutoRunQuery(e.target.checked)}
              />
              <span>Auto-run Query after Schema Build</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="sql-fiddle-tab-buttons">
        <button 
          className={`sql-fiddle-tab-button ${currentActiveTab === 'schema' ? 'active' : ''}`}
          onClick={() => setCurrentActiveTab('schema')}
          title="Define database schema"
        >
          Schema
        </button>
        <button 
          className={`sql-fiddle-tab-button ${currentActiveTab === 'query' ? 'active' : ''}`}
          onClick={() => setCurrentActiveTab('query')}
          title="Write and execute SQL queries"
        >
          Query
        </button>
      </div>

      {/* Schema Panel */}
      {currentActiveTab === 'schema' && (
        <div className="sql-fiddle-panel">
          <div className="panel-header">
            <h3>Schema Definition</h3>
            {schemaBuildStatus.message && (
              <div className={`build-status ${schemaBuildStatus.status}`}>
                {schemaBuildStatus.message}
              </div>
            )}
          </div>

          <div className="panel-actions">
            <button
              className="secondary-button"
              onClick={() => handleFormat(currentSchemaSQL, setCurrentSchemaSQL)}
              disabled={!currentSchemaSQL.trim()}
              title="Format SQL code"
            >
              🔧 Format SQL
            </button>
            <button
              className="secondary-button"
              onClick={() => setCurrentSchemaSQL(getSampleSchema())}
              title="Load sample schema with tables and data"
            >
              📋 Load Sample
            </button>
            <button
              className="secondary-button"
              onClick={clearSchema}
              disabled={!currentSchemaSQL.trim()}
              title="Clear schema SQL"
            >
              🗑️ Clear
            </button>
          </div>

          <div className="sql-editor-section">
            <textarea
              ref={schemaTextareaRef}
              className="sql-editor-textarea"
              value={currentSchemaSQL}
              onChange={(e) => setCurrentSchemaSQL(e.target.value)}
              onPaste={(e) => handlePaste(e, setCurrentSchemaSQL)}
              placeholder="Enter CREATE TABLE statements and sample data here..."
              spellCheck="false"
              rows={15}
            />
          </div>

          <div className="panel-actions-bottom">
            <button
              className="action-button build-schema-button"
              onClick={buildSchema}
              disabled={isLoading || !currentSchemaSQL.trim()}
              title={!currentSchemaSQL.trim() ? "Please enter schema SQL first" : "Execute schema SQL to build database structure"}
            >
              {isLoading ? (
                <>
                  <span className="loading-indicator"></span>
                  Building...
                </>
              ) : (
                'Build Schema'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Query Panel */}
      {currentActiveTab === 'query' && (
        <div className="sql-fiddle-panel">
          <div className="panel-header">
            <h3>Query Editor</h3>
            {queryResults?.message && (
              <div className={`query-status ${queryResults.status}`}>
                {queryResults.message}
              </div>
            )}
          </div>

          <div className="panel-actions">
            <button
              className="secondary-button"
              onClick={() => handleFormat(currentQuerySQL, setCurrentQuerySQL)}
              disabled={!currentQuerySQL.trim()}
              title="Format SQL code"
            >
              🔧 Format SQL
            </button>
            <button
              className="secondary-button"
              onClick={() => setCurrentQuerySQL(getSampleQuery())}
              title="Load sample queries"
            >
              📋 Load Sample
            </button>
            <button
              className="secondary-button"
              onClick={clearQuery}
              disabled={!currentQuerySQL.trim()}
              title="Clear query SQL"
            >
              🗑️ Clear
            </button>
          </div>

          <div className="sql-editor-section">
            <textarea
              ref={queryTextareaRef}
              className="sql-editor-textarea"
              value={currentQuerySQL}
              onChange={(e) => setCurrentQuerySQL(e.target.value)}
              onPaste={(e) => handlePaste(e, setCurrentQuerySQL)}
              placeholder="Enter SQL queries here..."
              spellCheck="false"
              rows={15}
            />
          </div>

          <div className="panel-actions-bottom">
            <button
              className="action-button run-query-button"
              onClick={runQuery}
              disabled={isLoading || !currentQuerySQL.trim()}
              title={!currentQuerySQL.trim() ? "Please enter a SQL query first" : "Execute SQL query"}
            >
              {isLoading ? (
                <>
                  <span className="loading-indicator"></span>
                  Running...
                </>
              ) : (
                '▶️ Run Query'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlFiddleTab;



