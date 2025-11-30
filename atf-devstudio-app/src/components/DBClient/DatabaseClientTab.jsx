// DatabaseClientTab.jsx
// Tab content for database connection and SQL execution

import { useState, useRef, useEffect, useCallback } from 'react';
import { useConnectionManager } from './hooks/useConnectionManager';
import { useConnectionTimeout } from './hooks/useConnectionTimeout';
import { validateConnection } from './utils/connectionValidator';
import { formatSQL } from './utils/sqlFormatter';
import ConnectionEditModal from './ConnectionEditModal';
import ReconnectButton from './ReconnectButton';

const DatabaseClientTab = ({
  client,
  updateClient,
  deleteClient,
  setStatusMessage,
  darkMode,
  clientStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    connectionId,
    currentSQL,
    queryResults,
    queryHistory,
    selectedHistoryIndex,
    config,
  } = client;

  const [currentConnectionId, setCurrentConnectionId] = useState(connectionId || null);
  const [currentSQLText, setCurrentSQLText] = useState(currentSQL || '');
  const [currentQueryResults, setCurrentQueryResults] = useState(queryResults || null);
  const [currentQueryHistory, setCurrentQueryHistory] = useState(queryHistory || []);
  const [currentSelectedHistoryIndex, setCurrentSelectedHistoryIndex] = useState(selectedHistoryIndex || -1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [connectionError, setConnectionError] = useState(null);
  const [showEditConnectionForm, setShowEditConnectionForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showNewConnectionForm, setShowNewConnectionForm] = useState(false);

  const sqlEditorRef = useRef(null);

  // Custom hooks
  const { dbClientService } = useConnectionManager();
  const { 
    startConnectionTimeout, 
    clearConnectionTimeout,
    isConnectionTimedOut 
  } = useConnectionTimeout();

  const currentConfig = config || {
    autoFormat: true,
    formatOnPaste: true,
    maxRows: 1000,
    queryTimeout: 30000,
    showQueryHistory: true,
    confirmDeleteConnection: true,
    connectionTimeout: 300000,
    autoReconnect: true,
    reconnectAttempts: 3
  };

  // Track previous connection ID to detect when switching connections
  const previousConnectionIdRef = useRef(connectionId);
  const isInitialMountRef = useRef(true);
  const currentSQLTextRef = useRef(currentSQLText);

  // Keep ref in sync with state
  useEffect(() => {
    currentSQLTextRef.current = currentSQLText;
  }, [currentSQLText]);

  // Sync with prop changes (only sync on mount or when connectionId changes externally)
  useEffect(() => {
    // Only sync connectionId if it changed externally
    if (connectionId !== previousConnectionIdRef.current) {
      setCurrentConnectionId(connectionId || null);
      previousConnectionIdRef.current = connectionId;
    }
    
    // Only sync other props on initial mount or when connectionId changes
    if (isInitialMountRef.current || connectionId !== previousConnectionIdRef.current) {
      // Don't overwrite SQL text if user has typed something
      if (isInitialMountRef.current || !currentSQLTextRef.current || currentSQLTextRef.current.trim().length === 0) {
        setCurrentSQLText(currentSQL || '');
      }
      setCurrentQueryResults(queryResults || null);
      setCurrentQueryHistory(queryHistory || []);
      setCurrentSelectedHistoryIndex(selectedHistoryIndex || -1);
      isInitialMountRef.current = false;
    }
  }, [connectionId, currentSQL, queryResults, queryHistory, selectedHistoryIndex]);

  // Load connection state when connectionId changes (only when switching connections)
  useEffect(() => {
    if (!currentConnectionId) {
      previousConnectionIdRef.current = null;
      return;
    }

    // Only load terminal state when switching to a different connection
    if (currentConnectionId !== previousConnectionIdRef.current) {
      const terminalState = dbClientService.getTerminalState(currentConnectionId);
      
      // Only load SQL from terminal state if current textarea is empty
      // This preserves user input when they're typing
      if (terminalState.sql && (!currentSQLTextRef.current || currentSQLTextRef.current.trim().length === 0)) {
        setCurrentSQLText(terminalState.sql || '');
      }
      
      setCurrentQueryResults(terminalState.results || null);
      setCurrentQueryHistory(dbClientService.getQueryHistory(currentConnectionId));
      previousConnectionIdRef.current = currentConnectionId;
    }
    
    // Always update connection status
    const connection = dbClientService.getConnection(currentConnectionId);
    if (connection) {
      if (isConnectionTimedOut(currentConnectionId)) {
        setConnectionError('Connection has timed out');
        setConnectionStatus('Connection timed out');
      } else if (connection.isConnected) {
        setConnectionError(null);
        setConnectionStatus('Connected');
        startConnectionTimeout(currentConnectionId, currentConfig.connectionTimeout);
      } else {
        setConnectionStatus('Disconnected');
      }
    }
  }, [currentConnectionId, dbClientService, isConnectionTimedOut, startConnectionTimeout, currentConfig.connectionTimeout]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateClient(id, {
        connectionId: currentConnectionId,
        currentSQL: currentSQLText,
        queryResults: currentQueryResults,
        queryHistory: currentQueryHistory,
        selectedHistoryIndex: currentSelectedHistoryIndex,
      });
      
      // Also save to dbClientService
      if (currentConnectionId) {
        dbClientService.updateTerminalState(currentConnectionId, {
          sql: currentSQLText,
          results: currentQueryResults,
          history: currentQueryHistory,
          isExecuting: isExecuting
        });
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentConnectionId, currentSQLText, currentQueryResults, currentQueryHistory, currentSelectedHistoryIndex, isExecuting, updateClient, dbClientService]);

  // Connect to database
  const connectToDatabase = useCallback(async (connectionConfig) => {
    const validationResult = validateConnection(connectionConfig);
    if (!validationResult.isValid) {
      setConnectionError(validationResult.errors.join(', '));
      setStatusMessage?.(`Connection validation failed: ${validationResult.errors.join(', ')}`);
      return false;
    }

    setIsExecuting(true);
    setConnectionStatus('Connecting...');
    setConnectionError(null);
    
    try {
      const response = await fetch('/api/database/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: connectionConfig.type,
          host: connectionConfig.host,
          port: connectionConfig.port,
          database: connectionConfig.database,
          username: connectionConfig.username,
          password: connectionConfig.password,
          ssl: connectionConfig.ssl,
          timeout: currentConfig.queryTimeout
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Connection failed';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      const connection = dbClientService.getConnection(connectionConfig.id);
      if (connection) {
        connection.isConnected = true;
        connection.lastConnected = new Date().toISOString();
        connection.connectionId = result.connectionId;
        setConnectionStatus('Connected');
        startConnectionTimeout(connectionConfig.id, currentConfig.connectionTimeout);
        setStatusMessage?.(`Connected to ${connectionConfig.type} database: ${connectionConfig.database}`);
      }
      
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      setConnectionStatus(`Connection failed: ${error.message}`);
      setConnectionError(error.message);
      
      const connection = dbClientService.getConnection(connectionConfig.id);
      if (connection) {
        connection.isConnected = false;
      }
      
      setStatusMessage?.(`Connection failed: ${error.message}`);
      return false;
    } finally {
      setIsExecuting(false);
    }
  }, [currentConfig.queryTimeout, currentConfig.connectionTimeout, dbClientService, startConnectionTimeout, setStatusMessage]);

  // Reconnect to database
  const reconnectToDatabase = useCallback(async (connectionId) => {
    const connection = dbClientService.getConnection(connectionId);
    if (!connection) {
      setConnectionError('Connection not found');
      return false;
    }

    setIsReconnecting(true);
    setConnectionError(null);
    clearConnectionTimeout(connectionId);
    
    let attempts = 0;
    const maxAttempts = currentConfig.reconnectAttempts;
    
    while (attempts < maxAttempts) {
      attempts++;
      setConnectionStatus(`Reconnecting... (attempt ${attempts}/${maxAttempts})`);
      
      const success = await connectToDatabase(connection);
      
      if (success) {
        setIsReconnecting(false);
        setConnectionStatus('Reconnected successfully');
        setStatusMessage?.(`Reconnected to ${connection.type} database after ${attempts} attempt(s)`);
        return true;
      }
      
      if (attempts < maxAttempts) {
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    setIsReconnecting(false);
    setConnectionStatus(`Reconnection failed after ${maxAttempts} attempts`);
    setConnectionError(`Failed to reconnect after ${maxAttempts} attempts`);
    setStatusMessage?.(`Reconnection failed after ${maxAttempts} attempts`);
    return false;
  }, [dbClientService, currentConfig.reconnectAttempts, connectToDatabase, clearConnectionTimeout, setStatusMessage]);

  // Execute query
  const executeQuery = useCallback(async (sql) => {
    if (!currentConnectionId) {
      setStatusMessage?.('No active database connection');
      return;
    }

    if (!sql.trim()) {
      setStatusMessage?.('Empty query. Please enter a SQL query to execute');
      return;
    }

    const connection = dbClientService.getConnection(currentConnectionId);
    if (!connection) {
      setStatusMessage?.('Connection not found');
      return;
    }

    if (isConnectionTimedOut(currentConnectionId)) {
      setConnectionError('Connection has timed out');
      setStatusMessage?.('Connection timeout. Please reconnect.');
      return;
    }

    if (!connection.isConnected) {
      setStatusMessage?.('Database connection not available. Please reconnect.');
      return;
    }

    setIsExecuting(true);
    setCurrentQueryResults(null);

    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connection.connectionId,
          sql: sql,
          maxRows: currentConfig.maxRows || 1000,
          timeout: currentConfig.queryTimeout || 30000
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        if (error.code === 'CONNECTION_TIMEOUT' || error.message.includes('timeout')) {
          connection.isConnected = false;
          setConnectionError('Query timed out - connection may be lost');
          throw new Error(`Query timeout: ${error.error || 'Database connection lost'}`);
        }
        
        throw new Error(error.error || 'Query execution failed');
      }
      
      const result = await response.json();
      const executionTime = result.executionTime || (Date.now() - startTime);
      
      const successResult = {
        status: 'success',
        message: 'Query executed successfully',
        rowCount: result.rowCount || 0,
        executionTime: executionTime,
        columns: result.columns || [],
        data: result.rows || []
      };

      setCurrentQueryResults(successResult);
      
      dbClientService.addToQueryHistory(currentConnectionId, sql, successResult);
      setCurrentQueryHistory(dbClientService.getQueryHistory(currentConnectionId));

      setStatusMessage?.(`Query executed successfully: ${result.rowCount || 0} rows returned in ${executionTime}ms`);
      startConnectionTimeout(currentConnectionId, currentConfig.connectionTimeout);

    } catch (error) {
      console.error('Query execution error:', error);
      const errorResult = {
        status: 'error',
        message: `Query execution failed: ${error.message}`,
        executionTime: 0
      };
      
      setCurrentQueryResults(errorResult);
      dbClientService.addToQueryHistory(currentConnectionId, sql, errorResult);
      setCurrentQueryHistory(dbClientService.getQueryHistory(currentConnectionId));
      
      setStatusMessage?.(`Query execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  }, [currentConnectionId, currentConfig.maxRows, currentConfig.queryTimeout, currentConfig.connectionTimeout, 
      dbClientService, isConnectionTimedOut, startConnectionTimeout, setStatusMessage]);

  // Format SQL
  const handleFormatSQL = useCallback(() => {
    if (currentSQLText.trim()) {
      const connection = dbClientService.getConnection(currentConnectionId);
      const dialect = connection?.type || 'sql';
      setCurrentSQLText(formatSQL(currentSQLText, dialect));
      setStatusMessage?.('SQL formatted');
    }
  }, [currentSQLText, currentConnectionId, dbClientService, setStatusMessage]);

  // Handle paste with auto-formatting
  const handlePaste = useCallback((e) => {
    if (currentConfig.formatOnPaste) {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      const connection = dbClientService.getConnection(currentConnectionId);
      const dialect = connection?.type || 'sql';
      setCurrentSQLText(prev => prev + formatSQL(text, dialect));
    }
  }, [currentConfig.formatOnPaste, currentConnectionId, dbClientService]);

  // Handle history selection
  const handleHistorySelect = useCallback((historyItem, index) => {
    setCurrentSQLText(historyItem.query);
    setCurrentSelectedHistoryIndex(index);
  }, []);

  // Handle new connection
  const handleNewConnection = useCallback((connectionConfig) => {
    const newConnectionId = dbClientService.addConnection(connectionConfig);
    setCurrentConnectionId(newConnectionId);
    dbClientService.setActiveConnection(newConnectionId);
    setShowNewConnectionForm(false);
    connectToDatabase(connectionConfig);
  }, [dbClientService, connectToDatabase]);

  // Handle edit connection
  const handleEditConnection = useCallback(() => {
    if (currentConnectionId) {
      const connection = dbClientService.getConnection(currentConnectionId);
      if (connection) {
        setEditingConnection({ ...connection });
        setShowEditConnectionForm(true);
      }
    }
  }, [currentConnectionId, dbClientService]);

  // Handle update connection
  const handleUpdateConnection = useCallback((updatedConnection) => {
    if (updatedConnection.isConnected) {
      clearConnectionTimeout(updatedConnection.id);
    }

    dbClientService.updateConnection(updatedConnection.id, {
      ...updatedConnection,
      isConnected: false,
      lastModified: new Date().toISOString()
    });

    if (currentConnectionId === updatedConnection.id) {
      connectToDatabase(updatedConnection);
    }

    setShowEditConnectionForm(false);
    setEditingConnection(null);
    setStatusMessage?.(`Connection "${updatedConnection.name}" updated successfully`);
  }, [currentConnectionId, dbClientService, connectToDatabase, clearConnectionTimeout, setStatusMessage]);

  const activeConnection = currentConnectionId ? dbClientService.getConnection(currentConnectionId) : null;
  const isTimedOut = currentConnectionId && isConnectionTimedOut(currentConnectionId);
  const connections = dbClientService.getAllConnections();

  return (
    <div className={`database-client-tab-content ${clientStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Connection Selection */}
      <div className="database-client-options-section">
        <div className="options-row">
          <div className="option-group">
            <label htmlFor={`connection-select-${id}`} className="required">Database Connection</label>
            <select
              id={`connection-select-${id}`}
              value={currentConnectionId || ''}
              onChange={(e) => {
                const newConnectionId = e.target.value;
                setCurrentConnectionId(newConnectionId);
                dbClientService.setActiveConnection(newConnectionId);
                if (newConnectionId) {
                  const connection = dbClientService.getConnection(newConnectionId);
                  if (connection && !connection.isConnected && !isConnectionTimedOut(newConnectionId)) {
                    connectToDatabase(connection);
                  }
                }
              }}
              className="connection-select"
            >
              <option value="">-- Select Connection --</option>
              {connections.map(conn => (
                <option key={conn.id} value={conn.id}>
                  {conn.name} ({conn.type}) - {conn.isConnected && !isConnectionTimedOut(conn.id) ? 'Connected' : 'Disconnected'}
                </option>
              ))}
            </select>
          </div>

          <div className="option-group">
            <button
              className="secondary-button"
              onClick={() => setShowNewConnectionForm(true)}
              title="Create new database connection"
            >
              + New Connection
            </button>
            {activeConnection && (
              <button
                className="secondary-button"
                onClick={handleEditConnection}
                title="Edit connection settings"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {activeConnection && (
          <div className="connection-status-section">
            <div className={`connection-status-indicator ${
              isTimedOut ? 'timed-out' : 
              activeConnection.isConnected ? 'connected' : 'disconnected'
            }`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {isTimedOut ? 'Timed Out' : 
                 activeConnection.isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {activeConnection.database && (
                <span className="database-name">({activeConnection.database})</span>
              )}
            </div>
            
            {(isTimedOut || !activeConnection.isConnected) && (
              <ReconnectButton
                connectionId={currentConnectionId}
                onReconnect={reconnectToDatabase}
                isReconnecting={isReconnecting}
                className="secondary-button"
                showText={true}
              />
            )}
          </div>
        )}

        {connectionError && (
          <div className="connection-error-message">
            Error: {connectionError}
          </div>
        )}
      </div>

      {/* SQL Editor */}
      {currentConnectionId ? (
        <>
          <div className="sql-editor-section">
            <div className="editor-header">
              <h3>SQL Editor</h3>
              <div className="editor-actions">
                <button
                  className="secondary-button"
                  onClick={handleFormatSQL}
                  disabled={!currentSQLText.trim()}
                  title="Format SQL query"
                >
                  🔧 Format
                </button>
                <button
                  className="action-button execute-button"
                  onClick={() => executeQuery(currentSQLText)}
                  disabled={isExecuting || !currentSQLText.trim() || isTimedOut || !activeConnection?.isConnected}
                  title={
                    isTimedOut ? 'Connection timed out - please reconnect' :
                    !activeConnection?.isConnected ? 'Not connected to database' :
                    'Execute SQL query'
                  }
                >
                  {isExecuting ? (
                    <>
                      <span className="loading-indicator"></span>
                      Executing...
                    </>
                  ) : (
                    '▶️ Execute'
                  )}
                </button>
              </div>
            </div>

            <textarea
              ref={sqlEditorRef}
              className="sql-editor-textarea"
              value={currentSQLText}
              onChange={(e) => setCurrentSQLText(e.target.value)}
              onPaste={handlePaste}
              placeholder={
                isTimedOut ? 'Connection timed out. Please reconnect to execute queries.' :
                !activeConnection?.isConnected ? 'Please connect to database first to execute queries.' :
                'Enter your SQL query here...'
              }
              spellCheck="false"
              rows={12}
            />
          </div>

          {/* Query Results */}
          {currentQueryResults && (
            <div className="query-results-section">
              <div className="results-header">
                <h3>Query Results</h3>
                <div className="results-meta">
                  {currentQueryResults.status === 'success' ? (
                    <>
                      <span className="results-status success">
                        ✓ {currentQueryResults.rowCount || 0} row{currentQueryResults.rowCount !== 1 ? 's' : ''}
                      </span>
                      {currentQueryResults.executionTime && (
                        <span className="results-time">
                          ({currentQueryResults.executionTime}ms)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="results-status error">
                      ✗ Error
                    </span>
                  )}
                </div>
              </div>

              {currentQueryResults.status === 'success' ? (
                <div className="results-content">
                  {currentQueryResults.data && currentQueryResults.data.length > 0 ? (
                    <div className="results-table-container">
                      <table className="results-table">
                        <thead>
                          <tr>
                            {currentQueryResults.columns.map((col, idx) => (
                              <th key={idx}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentQueryResults.data.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              {currentQueryResults.columns.map((col, colIdx) => (
                                <td key={colIdx}>
                                  {row[col] !== null && row[col] !== undefined 
                                    ? String(row[col]) 
                                    : <span className="null-value">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-results-message">
                      Query executed successfully but returned no rows.
                    </div>
                  )}
                </div>
              ) : (
                <div className="results-error">
                  <p className="error-message">{currentQueryResults.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Query History */}
          {currentConfig.showQueryHistory && currentQueryHistory.length > 0 && (
            <div className="query-history-section">
              <h4>Query History</h4>
              <div className="history-list">
                {currentQueryHistory.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className={`history-item ${currentSelectedHistoryIndex === index ? 'selected' : ''}`}
                    onClick={() => handleHistorySelect(item, index)}
                    title={`${item.timestamp} - Click to load query`}
                  >
                    <div className="history-query">
                      {item.query.substring(0, 100)}
                      {item.query.length > 100 && '...'}
                    </div>
                    <div className="history-meta">
                      <span className={`history-status ${item.results?.status || 'unknown'}`}>
                        {item.results?.status === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="history-time">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-connection-message">
          <h3>No Active Connection</h3>
          <p>Select a connection or create a new one to start executing queries.</p>
          <button
            className="action-button"
            onClick={() => setShowNewConnectionForm(true)}
          >
            + Create Connection
          </button>
        </div>
      )}

      {/* Modals */}
      {showNewConnectionForm && (
        <NewConnectionFormModal
          onSubmit={handleNewConnection}
          onCancel={() => setShowNewConnectionForm(false)}
        />
      )}

      {showEditConnectionForm && editingConnection && (
        <ConnectionEditModal
          connection={editingConnection}
          onUpdate={handleUpdateConnection}
          onCancel={() => {
            setShowEditConnectionForm(false);
            setEditingConnection(null);
          }}
          isOpen={showEditConnectionForm}
        />
      )}
    </div>
  );
};

// New Connection Form Modal Component
const NewConnectionFormModal = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: 'localhost',
    port: '5432',
    database: '',
    username: '',
    password: '',
    ssl: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portDefaults = {
    postgresql: '5432',
    mysql: '3306',
    oracle: '1521',
    sybase: '5000'
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      port: portDefaults[type]
    }));
  };

  const validateForm = () => {
    const validationResult = validateConnection(formData);
    if (!validationResult.isValid) {
      const newErrors = {};
      validationResult.errors.forEach(error => {
        if (error.includes('name')) newErrors.name = error;
        if (error.includes('host')) newErrors.host = error;
        if (error.includes('port')) newErrors.port = error;
        if (error.includes('database')) newErrors.database = error;
        if (error.includes('username')) newErrors.username = error;
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Database Connection</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <form className="connection-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Connection Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Database Connection"
              className={errors.name ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Database Type *</label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="oracle">Oracle</option>
              <option value="sybase">Sybase</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Host *</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                placeholder="localhost"
                className={errors.host ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.host && <span className="error-text">{errors.host}</span>}
            </div>

            <div className="form-group">
              <label>Port *</label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                className={errors.port ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.port && <span className="error-text">{errors.port}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Database *</label>
            <input
              type="text"
              value={formData.database}
              onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
              placeholder="my_database"
              className={errors.database ? 'error' : ''}
              disabled={isSubmitting}
            />
            {errors.database && <span className="error-text">{errors.database}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
                className={errors.username ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.ssl}
                onChange={(e) => setFormData(prev => ({ ...prev, ssl: e.target.checked }))}
                disabled={isSubmitting}
              />
              Use SSL Connection
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="secondary-button" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="action-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatabaseClientTab;

