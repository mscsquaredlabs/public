// DatabaseClient.jsx
// Database Client component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import DatabaseClientTab from './DatabaseClientTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import { useConnectionManager } from './hooks/useConnectionManager';
import './DatabaseClient.css';

const STORAGE_KEY = 'atf-dev-studio-database-client';
const DEFAULT_TAB_TITLE = 'Database Client';

const DatabaseClient = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [clients, setClients] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [clientStyle, setClientStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style clients
  const generateModernColor = useCallback((index) => {
    const colors = [
      '#4f46e5', // indigo
      '#7c3aed', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#ef4444', // red
      '#14b8a6', // teal
      '#8b5cf6', // purple
      '#f97316', // orange
    ];
    return colors[index % colors.length];
  }, []);

  // Custom hooks
  const { dbClientService } = useConnectionManager();

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved clients and preferences from localStorage
  useEffect(() => {
    try {
      const savedClients = localStorage.getItem(STORAGE_KEY);
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        setClients(parsedClients);
        
        // Set active tab to the first client or the last active one
        if (parsedClients.length > 0) {
          const lastActive = parsedClients.find(c => c.isActive) || parsedClients[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.clientStyle) setClientStyle(prefs.clientStyle);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (clients.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
        } catch (error) {
          console.error('Error saving clients to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [clients]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        clientStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [clientStyle]);

  // Automatically create one client tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedClients = localStorage.getItem(STORAGE_KEY);
    if (savedClients && JSON.parse(savedClients).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).clientStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      
      const newClient = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        connectionId: null,
        currentSQL: '',
        queryResults: null,
        queryHistory: [],
        selectedHistoryIndex: -1,
        config: {
          autoFormat: true,
          formatOnPaste: true,
          maxRows: 1000,
          queryTimeout: 30000,
          showQueryHistory: true,
          confirmDeleteConnection: true,
          connectionTimeout: 300000,
          autoReconnect: true,
          reconnectAttempts: 3
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setClients([newClient]);
      setActiveTabId(newClient.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new client tab
  const createClient = useCallback(() => {
    const headerColor = clientStyle === 'modern' ? generateModernColor(clients.length) : '#4f46e5';
    
    const newClient = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${clients.length + 1}`,
      connectionId: null,
      currentSQL: '',
      queryResults: null,
      queryHistory: [],
      selectedHistoryIndex: -1,
      config: {
        autoFormat: true,
        formatOnPaste: true,
        maxRows: 1000,
        queryTimeout: 30000,
        showQueryHistory: true,
        confirmDeleteConnection: true,
        connectionTimeout: 300000,
        autoReconnect: true,
        reconnectAttempts: 3
      },
      headerColor: headerColor,
      style: clientStyle,
      isActive: false,
    };
    
    // Mark all existing clients as inactive and set new one as active
    const updatedClients = clients.map(c => ({ ...c, isActive: false }));
    updatedClients.push({ ...newClient, isActive: true });
    
    setClients(updatedClients);
    setActiveTabId(newClient.id);
    showStatusMessage(setStatusMessage, 'New database client tab created', statusTimeoutRef);
  }, [clients, clientStyle, generateModernColor]);

  // Update a client's properties
  const updateClient = useCallback((id, updates) => {
    setClients(clients => clients.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  }, []);

  // Delete a client tab
  const deleteClient = useCallback((id) => {
    const updatedClients = clients.filter(client => client.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedClients.length > 0) {
        const newActiveId = updatedClients[0].id;
        setActiveTabId(newActiveId);
        setClients(updatedClients.map((c, index) => ({
          ...c,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = clientStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const newClient = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          connectionId: null,
          currentSQL: '',
          queryResults: null,
          queryHistory: [],
          selectedHistoryIndex: -1,
          config: {
            autoFormat: true,
            formatOnPaste: true,
            maxRows: 1000,
            queryTimeout: 30000,
            showQueryHistory: true,
            confirmDeleteConnection: true,
            connectionTimeout: 300000,
            autoReconnect: true,
            reconnectAttempts: 3
          },
          headerColor: headerColor,
          style: clientStyle,
          isActive: true,
        };
        setClients([newClient]);
        setActiveTabId(newClient.id);
        showStatusMessage(setStatusMessage, 'New database client tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setClients(updatedClients);
    }
    
    showStatusMessage(setStatusMessage, 'Database client tab closed', statusTimeoutRef);
  }, [clients, activeTabId, clientStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setClients(clients => clients.map(client => ({
      ...client,
      isActive: client.id === id
    })));
  }, []);

  // Clear all clients (with confirmation)
  const clearAllClients = useCallback(() => {
    if (clients.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all database client tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = clientStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const newClient = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        connectionId: null,
        currentSQL: '',
        queryResults: null,
        queryHistory: [],
        selectedHistoryIndex: -1,
        config: {
          autoFormat: true,
          formatOnPaste: true,
          maxRows: 1000,
          queryTimeout: 30000,
          showQueryHistory: true,
          confirmDeleteConnection: true,
          connectionTimeout: 300000,
          autoReconnect: true,
          reconnectAttempts: 3
        },
        headerColor: headerColor,
        style: clientStyle,
        isActive: true,
      };
      setClients([newClient]);
      setActiveTabId(newClient.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [clients.length, clientStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.clientStyle !== undefined) {
      setClientStyle(prefs.clientStyle);
      // Update existing clients with new style colors
      if (prefs.clientStyle === 'modern') {
        setClients(clients => clients.map((client, index) => ({
          ...client,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setClients(clients => clients.map(client => ({
          ...client,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeClient = clients.find(c => c.id === activeTabId);

  return (
    <div className={`database-client-container ${dashboardDarkMode ? 'dark-mode' : ''} ${clientStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="database-client-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-client-button"
            onClick={createClient}
            title="Create a new database client tab"
          >
            + New Client
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={clientStyle}
              onChange={(value) => {
                setClientStyle(value);
                updatePreferences({ clientStyle: value });
              }}
              name="clientStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {clients.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllClients}
              title="Close all database client tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {clients.length > 0 && (
        <div className="client-tabs-container">
          <div className="client-tabs">
            {clients.map((client, index) => (
              <div
                key={client.id}
                className={`client-tab ${client.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(client.id)}
                style={{
                  borderTopColor: client.id === activeTabId ? client.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{client.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteClient(client.id);
                  }}
                  title="Close tab"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Content Area */}
      <div className="database-client-area" onClick={() => {
        if (clients.length === 0) {
          createClient();
        }
      }}>
        {activeClient ? (
          <DatabaseClientTab
            client={activeClient}
            updateClient={updateClient}
            deleteClient={deleteClient}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            clientStyle={activeClient.style || clientStyle}
            headerColor={activeClient.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No client tabs yet. Click here or "New Client" to create one.</p>
            <p className="hint">Connect to PostgreSQL, MySQL, Oracle, and Sybase databases. Execute queries, browse schemas, and manage multiple database connections.</p>
          </div>
        )}
      </div>

      {/* Status message - fixed position, bottom right */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default DatabaseClient;
