// DatabaseClientConfig.jsx
import React from 'react';
import './DatabaseClient.css';

const DatabaseClientConfig = ({
  config,
  setConfig,
  connections,
  onNewConnection,
  onDeleteConnection,
  activeConnectionId,
  onConnectionSelect
}) => {

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatConnectionUptime = (connection) => {
    if (!connection.lastConnected) return 'Never';
    
    const now = new Date();
    const connected = new Date(connection.lastConnected);
    const diffMs = now - connected;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <>
      <h3 className="config-section-title">Database Client Settings</h3>

      {/* Editor Settings */}
      <div className="form-group">
        <label>Editor Settings</label>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="auto-format"
            checked={config.autoFormat}
            onChange={(e) => handleConfigChange('autoFormat', e.target.checked)}
            title="Automatically format SQL queries"
          />
          <label htmlFor="auto-format">Auto-format SQL</label>
        </div>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="format-on-paste"
            checked={config.formatOnPaste}
            onChange={(e) => handleConfigChange('formatOnPaste', e.target.checked)}
            title="Automatically format SQL when pasting"
          />
          <label htmlFor="format-on-paste">Format on paste</label>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="show-query-history"
            checked={config.showQueryHistory}
            onChange={(e) => handleConfigChange('showQueryHistory', e.target.checked)}
            title="Show query history panel"
          />
          <label htmlFor="show-query-history">Show query history</label>
        </div>
      </div>

      {/* Query Settings */}
      <div className="form-group">
        <label>Query Settings</label>
        
        <div className="config-item">
          <label htmlFor="max-rows">Maximum rows to display</label>
          <select 
            id="max-rows"
            value={config.maxRows}
            onChange={(e) => handleConfigChange('maxRows', parseInt(e.target.value))}
            title="Maximum number of rows to display in results"
          >
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1,000</option>
            <option value="5000">5,000</option>
            <option value="10000">10,000</option>
          </select>
        </div>

        <div className="config-item">
          <label htmlFor="query-timeout">Query timeout (seconds)</label>
          <select 
            id="query-timeout"
            value={config.queryTimeout / 1000}
            onChange={(e) => handleConfigChange('queryTimeout', parseInt(e.target.value) * 1000)}
            title="Maximum time to wait for query execution"
          >
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
            <option value="300">5 minutes</option>
            <option value="600">10 minutes</option>
          </select>
        </div>
      </div>

      {/* Safety Settings */}
      <div className="form-group">
        <label>Safety Settings</label>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="confirm-delete-connection"
            checked={config.confirmDeleteConnection}
            onChange={(e) => handleConfigChange('confirmDeleteConnection', e.target.checked)}
            title="Ask for confirmation before deleting connections"
          />
          <label htmlFor="confirm-delete-connection">Confirm connection deletion</label>
        </div>

        <div className="config-note">
          Safety settings help prevent accidental data loss and unwanted operations.
        </div>
      </div>

      {/* Connection Management */}
      <div className="form-group">
        <label>Connection Management</label>
        
        <div className="button-group">
          <button 
            className="btn-primary"
            onClick={onNewConnection}
            title="Create a new database connection"
          >
            <span className="btn-icon">➕</span>
            New Connection
          </button>
        </div>

        {connections.length > 0 && (
          <div className="connections-list">
            <h4>Existing Connections ({connections.length})</h4>
            {connections.map(conn => (
              <div 
                key={conn.id} 
                className={`connection-item ${activeConnectionId === conn.id ? 'active' : ''}`}
              >
                <div className="connection-info">
                  <div className="connection-header">
                    <span className="connection-icon">
                      {conn.type === 'postgresql' && '🐘'}
                      {conn.type === 'mysql' && '🐬'}
                      {conn.type === 'oracle' && '🔶'}
                      {conn.type === 'sybase' && '🏢'}
                    </span>
                    <span className="connection-name">{conn.name}</span>
                    <span className={`connection-status-dot ${conn.isConnected ? 'connected' : 'disconnected'}`}></span>
                  </div>
                  
                  <div className="connection-details">
                    <div className="connection-detail">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{conn.type.toUpperCase()}</span>
                    </div>
                    <div className="connection-detail">
                      <span className="detail-label">Host:</span>
                      <span className="detail-value">{conn.host}:{conn.port}</span>
                    </div>
                    <div className="connection-detail">
                      <span className="detail-label">Database:</span>
                      <span className="detail-value">{conn.database}</span>
                    </div>
                    <div className="connection-detail">
                      <span className="detail-label">Last used:</span>
                      <span className="detail-value">{formatConnectionUptime(conn)}</span>
                    </div>
                  </div>
                </div>

                <div className="connection-actions">
                  {activeConnectionId !== conn.id && (
                    <button
                      className="btn-secondary small"
                      onClick={() => onConnectionSelect(conn.id)}
                      title="Switch to this connection"
                    >
                      Select
                    </button>
                  )}
                  
                  <button
                    className="btn-secondary small danger"
                    onClick={() => onDeleteConnection(conn.id)}
                    title="Delete this connection"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Features */}
      <div className="form-group">
        <label>Database Features</label>
        
        <div className="feature-info">
          <h5>Supported Database Types</h5>
          <ul className="feature-list">
            <li>
              <span className="feature-icon">🐘</span>
              <span className="feature-name">PostgreSQL</span>
              <span className="feature-status available">Available</span>
            </li>
            <li>
              <span className="feature-icon">🐬</span>
              <span className="feature-name">MySQL</span>
              <span className="feature-status available">Available</span>
            </li>
            <li>
              <span className="feature-icon">🔶</span>
              <span className="feature-name">Oracle</span>
              <span className="feature-status available">Available</span>
            </li>
            <li>
              <span className="feature-icon">🏢</span>
              <span className="feature-name">Sybase</span>
              <span className="feature-status available">Available</span>
            </li>
          </ul>
        </div>

        <div className="config-note">
          All database connections are persistent across component navigation. 
          Your SQL sessions will remain active when switching between tools.
        </div>
      </div>

      {/* Performance Settings */}
      <div className="form-group">
        <label>Performance Settings</label>
        
        <div className="config-item">
          <label htmlFor="connection-pool-size">Connection pool size</label>
          <select 
            id="connection-pool-size"
            defaultValue="5"
            title="Maximum number of concurrent connections per database"
          >
            <option value="1">1 connection</option>
            <option value="5">5 connections</option>
            <option value="10">10 connections</option>
            <option value="20">20 connections</option>
          </select>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="enable-query-cache"
            defaultChecked={true}
            title="Cache frequently used query results"
          />
          <label htmlFor="enable-query-cache">Enable query result caching</label>
        </div>

        <div className="config-note">
          Higher connection pool sizes improve performance but consume more resources.
        </div>
      </div>

      {/* Export/Import Settings */}
      <div className="form-group">
        <label>Data Export/Import</label>
        
        <div className="button-group">
          <button 
            className="btn-secondary"
            title="Export connections configuration"
          >
            <span className="btn-icon">📤</span>
            Export Connections
          </button>
          
          <button 
            className="btn-secondary"
            title="Import connections configuration"
          >
            <span className="btn-icon">📥</span>
            Import Connections
          </button>
        </div>

        <div className="config-note">
          Export/import connection configurations (passwords are not included for security).
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="form-group">
        <label>Advanced Settings</label>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="enable-sql-syntax-highlighting"
            defaultChecked={true}
            title="Enable syntax highlighting in SQL editor"
          />
          <label htmlFor="enable-sql-syntax-highlighting">SQL syntax highlighting</label>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="enable-auto-complete"
            defaultChecked={true}
            title="Enable auto-completion in SQL editor"
          />
          <label htmlFor="enable-auto-complete">SQL auto-completion</label>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="enable-query-validation"
            defaultChecked={true}
            title="Validate SQL queries before execution"
          />
          <label htmlFor="enable-query-validation">Query validation</label>
        </div>

        <div className="config-note">
          Advanced features enhance the development experience but may impact performance.
        </div>
      </div>
    </>
  );
};

export default DatabaseClientConfig;