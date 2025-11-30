// hooks/useConnectionManager.js
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Enhanced Database Client Service
 * Manages persistent database connections with improved functionality
 */
class DatabaseClientService {
  constructor() {
    this.connections = new Map();
    this.terminals = new Map();
    this.activeConnection = null;
    this.queryHistory = new Map();
    this.eventListeners = new Map();
    this.loadFromStorage();
  }

  /**
   * Save state to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
          id,
          ...conn,
          // Don't save actual connection objects, just config
          connection: null,
          isConnected: false
        })),
        terminals: Array.from(this.terminals.entries()),
        activeConnection: this.activeConnection,
        queryHistory: Array.from(this.queryHistory.entries())
      };
      localStorage.setItem('atf-database-client', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save database client state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('atf-database-client') || '{}');
      
      if (data.connections) {
        this.connections = new Map(data.connections.map(conn => [conn.id, {
          ...conn,
          lastModified: conn.lastModified || conn.createdAt
        }]));
      }
      
      if (data.terminals) {
        this.terminals = new Map(data.terminals);
      }
      
      if (data.activeConnection) {
        this.activeConnection = data.activeConnection;
      }
      
      if (data.queryHistory) {
        this.queryHistory = new Map(data.queryHistory);
      }
    } catch (error) {
      console.error('Failed to load database client state:', error);
    }
  }

  /**
   * Add a new connection
   * @param {Object} connectionConfig - Connection configuration
   * @returns {string} Connection ID
   */
  addConnection(connectionConfig) {
    const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const connection = {
      id,
      ...connectionConfig,
      connection: null,
      isConnected: false,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.connections.set(id, connection);
    this.saveToStorage();
    this.emit('connectionAdded', { connection });
    return id;
  }

  /**
   * Update an existing connection
   * @param {string} connectionId - Connection ID
   * @param {Object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  updateConnection(connectionId, updates) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    const updatedConnection = {
      ...connection,
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.connections.set(connectionId, updatedConnection);
    this.saveToStorage();
    this.emit('connectionUpdated', { connectionId, connection: updatedConnection });
    return true;
  }

  /**
   * Remove a connection
   * @param {string} connectionId - Connection ID
   */
  removeConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    
    this.connections.delete(connectionId);
    this.terminals.delete(connectionId);
    this.queryHistory.delete(connectionId);
    
    if (this.activeConnection === connectionId) {
      this.activeConnection = null;
    }
    
    this.saveToStorage();
    this.emit('connectionRemoved', { connectionId, connection });
  }

  /**
   * Get a connection by ID
   * @param {string} connectionId - Connection ID
   * @returns {Object|undefined} Connection object
   */
  getConnection(connectionId) {
    return this.connections.get(connectionId);
  }

  /**
   * Get all connections
   * @returns {Array} Array of connection objects
   */
  getAllConnections() {
    return Array.from(this.connections.values()).sort((a, b) => 
      new Date(b.lastUsed) - new Date(a.lastUsed)
    );
  }

  /**
   * Get connections by type
   * @param {string} type - Database type
   * @returns {Array} Filtered connections
   */
  getConnectionsByType(type) {
    return this.getAllConnections().filter(conn => conn.type === type);
  }

  /**
   * Set active connection
   * @param {string} connectionId - Connection ID
   */
  setActiveConnection(connectionId) {
    this.activeConnection = connectionId;
    if (connectionId) {
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.lastUsed = new Date().toISOString();
      }
    }
    this.saveToStorage();
    this.emit('activeConnectionChanged', { connectionId });
  }

  /**
   * Get active connection ID
   * @returns {string|null} Active connection ID
   */
  getActiveConnection() {
    return this.activeConnection;
  }

  /**
   * Update terminal state for a connection
   * @param {string} connectionId - Connection ID
   * @param {Object} terminalState - Terminal state
   */
  updateTerminalState(connectionId, terminalState) {
    this.terminals.set(connectionId, {
      ...terminalState,
      lastUpdated: new Date().toISOString()
    });
    this.saveToStorage();
  }

  /**
   * Get terminal state for a connection
   * @param {string} connectionId - Connection ID
   * @returns {Object} Terminal state
   */
  getTerminalState(connectionId) {
    return this.terminals.get(connectionId) || {
      sql: '',
      results: null,
      history: [],
      isExecuting: false,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Add query to history
   * @param {string} connectionId - Connection ID
   * @param {string} query - SQL query
   * @param {Object} results - Query results
   */
  addToQueryHistory(connectionId, query, results) {
    if (!this.queryHistory.has(connectionId)) {
      this.queryHistory.set(connectionId, []);
    }
    
    const history = this.queryHistory.get(connectionId);
    const historyItem = {
      query,
      results: results ? { 
        ...results, 
        data: null // Don't store large result data
      } : null,
      timestamp: new Date().toISOString(),
      executionTime: results?.executionTime || 0
    };
    
    history.unshift(historyItem);
    
    // Keep only last 100 queries
    if (history.length > 100) {
      history.splice(100);
    }
    
    this.saveToStorage();
    this.emit('queryHistoryUpdated', { connectionId, historyItem });
  }

  /**
   * Get query history for a connection
   * @param {string} connectionId - Connection ID
   * @returns {Array} Query history
   */
  getQueryHistory(connectionId) {
    return this.queryHistory.get(connectionId) || [];
  }

  /**
   * Clear query history for a connection
   * @param {string} connectionId - Connection ID
   */
  clearQueryHistory(connectionId) {
    this.queryHistory.set(connectionId, []);
    this.saveToStorage();
    this.emit('queryHistoryCleared', { connectionId });
  }

  /**
   * Get connection statistics
   * @param {string} connectionId - Connection ID
   * @returns {Object} Connection statistics
   */
  getConnectionStats(connectionId) {
    const connection = this.getConnection(connectionId);
    const history = this.getQueryHistory(connectionId);
    
    if (!connection) return null;

    const successfulQueries = history.filter(item => item.results?.status === 'success').length;
    const failedQueries = history.filter(item => item.results?.status === 'error').length;
    const avgExecutionTime = history.length > 0 
      ? history.reduce((sum, item) => sum + (item.executionTime || 0), 0) / history.length 
      : 0;

    return {
      connectionId,
      name: connection.name,
      type: connection.type,
      totalQueries: history.length,
      successfulQueries,
      failedQueries,
      successRate: history.length > 0 ? (successfulQueries / history.length * 100).toFixed(1) : 0,
      avgExecutionTime: Math.round(avgExecutionTime),
      createdAt: connection.createdAt,
      lastUsed: connection.lastUsed,
      lastModified: connection.lastModified
    };
  }

  /**
   * Export connections configuration
   * @returns {Object} Exportable configuration
   */
  exportConnections() {
    const connections = this.getAllConnections().map(conn => ({
      name: conn.name,
      type: conn.type,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      username: conn.username,
      ssl: conn.ssl,
      // Don't export passwords for security
      createdAt: conn.createdAt
    }));

    return {
      connections,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import connections configuration
   * @param {Object} config - Configuration to import
   * @returns {Array} Imported connection IDs
   */
  importConnections(config) {
    if (!config.connections || !Array.isArray(config.connections)) {
      throw new Error('Invalid configuration format');
    }

    const importedIds = [];
    
    config.connections.forEach(connConfig => {
      if (this.validateConnectionConfig(connConfig)) {
        const id = this.addConnection({
          ...connConfig,
          password: '' // Require user to re-enter passwords
        });
        importedIds.push(id);
      }
    });

    return importedIds;
  }

  /**
   * Validate connection configuration
   * @param {Object} config - Connection configuration
   * @returns {boolean} Is valid
   */
  validateConnectionConfig(config) {
    const required = ['name', 'type', 'host', 'port', 'database', 'username'];
    return required.every(field => config[field] && config[field].toString().trim());
  }

  /**
   * Event system for reactive updates
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.eventListeners.clear();
  }
}

// Singleton instance
let dbClientServiceInstance = null;

/**
 * Connection Manager Hook
 * 
 * Provides centralized connection management with reactive updates
 * and persistent state handling.
 * 
 * @returns {Object} Connection manager utilities
 */
export const useConnectionManager = () => {
  const [connections, setConnections] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(null);

  // Create singleton service instance
  const dbClientService = useMemo(() => {
    if (!dbClientServiceInstance) {
      dbClientServiceInstance = new DatabaseClientService();
    }
    return dbClientServiceInstance;
  }, []);

  // Initialize state from service
  useEffect(() => {
    setConnections(dbClientService.getAllConnections());
    setActiveConnectionId(dbClientService.getActiveConnection());
  }, [dbClientService]);

  // Set up event listeners for reactive updates
  useEffect(() => {
    const unsubscribeCallbacks = [
      dbClientService.on('connectionAdded', () => {
        setConnections(dbClientService.getAllConnections());
      }),
      
      dbClientService.on('connectionUpdated', () => {
        setConnections(dbClientService.getAllConnections());
      }),
      
      dbClientService.on('connectionRemoved', () => {
        setConnections(dbClientService.getAllConnections());
      }),
      
      dbClientService.on('activeConnectionChanged', ({ connectionId }) => {
        setActiveConnectionId(connectionId);
      })
    ];

    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    };
  }, [dbClientService]);

  // Memoized helper functions
  const getConnection = useCallback((connectionId) => {
    return dbClientService.getConnection(connectionId);
  }, [dbClientService]);

  const getActiveConnection = useCallback(() => {
    return activeConnectionId ? dbClientService.getConnection(activeConnectionId) : null;
  }, [dbClientService, activeConnectionId]);

  const addConnection = useCallback((connectionConfig) => {
    return dbClientService.addConnection(connectionConfig);
  }, [dbClientService]);

  const updateConnection = useCallback((connectionId, updates) => {
    return dbClientService.updateConnection(connectionId, updates);
  }, [dbClientService]);

  const removeConnection = useCallback((connectionId) => {
    dbClientService.removeConnection(connectionId);
  }, [dbClientService]);

  const setActiveConnection = useCallback((connectionId) => {
    dbClientService.setActiveConnection(connectionId);
  }, [dbClientService]);

  const getConnectionStats = useCallback((connectionId) => {
    return dbClientService.getConnectionStats(connectionId);
  }, [dbClientService]);

  const exportConnections = useCallback(() => {
    return dbClientService.exportConnections();
  }, [dbClientService]);

  const importConnections = useCallback((config) => {
    return dbClientService.importConnections(config);
  }, [dbClientService]);

  return {
    // Service instance
    dbClientService,
    
    // State
    connections,
    activeConnectionId,
    
    // Helper functions
    getConnection,
    getActiveConnection,
    addConnection,
    updateConnection,
    removeConnection,
    setActiveConnection,
    getConnectionStats,
    exportConnections,
    importConnections
  };
};

export default useConnectionManager;