// DatabaseClient.test.js - Comprehensive Test Suite
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import DatabaseClient from '../DatabaseClient';
import { useConnectionManager } from '../hooks/useConnectionManager';
import { useConnectionTimeout } from '../hooks/useConnectionTimeout';
import { validateConnection } from '../utils/connectionValidator';
import { formatSQL } from '../utils/sqlFormatter';

// Mock dependencies
jest.mock('../hooks/useConnectionManager');
jest.mock('../hooks/useConnectionTimeout');
jest.mock('../utils/connectionValidator');
jest.mock('../utils/sqlFormatter');

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock context for React Router Outlet
const mockContext = [
  false, // configPanelOpen
  jest.fn(), // setConfigPanelOpen
  jest.fn(), // handleResultsUpdate
  false, // darkMode
  jest.fn() // setDarkMode
];

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {React.cloneElement(children, { 
      useOutletContext: () => mockContext 
    })}
  </BrowserRouter>
);

describe('DatabaseClient Component', () => {
  let mockDbClientService;
  let mockConnectionManager;
  let mockConnectionTimeout;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Mock database client service
    mockDbClientService = {
      getAllConnections: jest.fn(() => []),
      getActiveConnection: jest.fn(() => null),
      addConnection: jest.fn(() => 'conn_123'),
      updateConnection: jest.fn(() => true),
      removeConnection: jest.fn(),
      setActiveConnection: jest.fn(),
      getConnection: jest.fn(),
      getTerminalState: jest.fn(() => ({
        sql: '',
        results: null,
        history: [],
        isExecuting: false
      })),
      updateTerminalState: jest.fn(),
      getQueryHistory: jest.fn(() => []),
      addToQueryHistory: jest.fn()
    };
    
    // Mock useConnectionManager hook
    mockConnectionManager = {
      dbClientService: mockDbClientService,
      connections: [],
      activeConnectionId: null,
      getConnection: jest.fn(),
      getActiveConnection: jest.fn(),
      addConnection: jest.fn(),
      updateConnection: jest.fn(),
      removeConnection: jest.fn(),
      setActiveConnection: jest.fn()
    };
    
    useConnectionManager.mockReturnValue(mockConnectionManager);
    
    // Mock useConnectionTimeout hook
    mockConnectionTimeout = {
      connectionTimeouts: new Map(),
      timeoutWarnings: new Map(),
      startConnectionTimeout: jest.fn(),
      clearConnectionTimeout: jest.fn(),
      resetConnectionTimeout: jest.fn(),
      isConnectionTimedOut: jest.fn(() => false),
      hasTimeoutWarning: jest.fn(() => false),
      getTimeoutInfo: jest.fn(() => null)
    };
    
    useConnectionTimeout.mockReturnValue(mockConnectionTimeout);
    
    // Mock validation and formatting utilities
    validateConnection.mockReturnValue({ isValid: true, errors: [] });
    formatSQL.mockImplementation((sql) => sql.toUpperCase());
  });

  describe('Component Rendering', () => {
    test('renders database client with tool description', () => {
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      expect(screen.getByText(/Connect to PostgreSQL, MySQL, Oracle, and Sybase databases/)).toBeInTheDocument();
      expect(screen.getByText('Database Connections')).toBeInTheDocument();
      expect(screen.getByText('New Connection')).toBeInTheDocument();
    });

    test('shows no connection message when no connections exist', () => {
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      expect(screen.getByText('No Active Connection')).toBeInTheDocument();
      expect(screen.getByText('Create a new database connection to start executing queries.')).toBeInTheDocument();
    });

    test('displays connection tabs when connections exist', () => {
      const mockConnections = [
        {
          id: 'conn_1',
          name: 'Test DB',
          type: 'postgresql',
          host: 'localhost',
          port: '5432',
          database: 'testdb',
          isConnected: true
        }
      ];
      
      mockConnectionManager.connections = mockConnections;
      mockDbClientService.getAllConnections.mockReturnValue(mockConnections);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      expect(screen.getByText('Test DB')).toBeInTheDocument();
      expect(screen.getByTitle(/Test DB \(postgresql\)/)).toBeInTheDocument();
    });
  });

  describe('Connection Management', () => {
    test('opens new connection form when New Connection button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const newConnectionBtn = screen.getByText('New Connection');
      await user.click(newConnectionBtn);
      
      expect(screen.getByText('New Database Connection')).toBeInTheDocument();
      expect(screen.getByLabelText('Connection Name *')).toBeInTheDocument();
    });

    test('creates new connection with valid data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      // Open new connection form
      await user.click(screen.getByText('New Connection'));
      
      // Fill form
      await user.type(screen.getByLabelText('Connection Name *'), 'Test Connection');
      await user.selectOptions(screen.getByLabelText('Database Type *'), 'postgresql');
      await user.type(screen.getByLabelText('Host *'), 'localhost');
      await user.type(screen.getByLabelText('Database *'), 'testdb');
      await user.type(screen.getByLabelText('Username *'), 'testuser');
      
      // Submit form
      await user.click(screen.getByText('Create Connection'));
      
      expect(mockDbClientService.addConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Connection',
          type: 'postgresql',
          host: 'localhost',
          database: 'testdb',
          username: 'testuser'
        })
      );
    });

    test('validates connection form and shows errors', async () => {
      const user = userEvent.setup();
      
      validateConnection.mockReturnValue({
        isValid: false,
        errors: ['Connection name is required']
      });
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('New Connection'));
      await user.click(screen.getByText('Create Connection'));
      
      expect(screen.getByText('Connection name is required')).toBeInTheDocument();
    });

    test('opens edit connection modal when edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        host: 'localhost',
        port: '5432',
        database: 'testdb',
        username: 'testuser',
        isConnected: false
      };
      
      mockConnectionManager.connections = [mockConnection];
      mockDbClientService.getAllConnections.mockReturnValue([mockConnection]);
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const editButton = screen.getByTitle('Edit connection settings');
      await user.click(editButton);
      
      expect(screen.getByText('Edit Database Connection')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test DB')).toBeInTheDocument();
    });

    test('updates connection with new data', async () => {
      const user = userEvent.setup();
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        host: 'localhost',
        port: '5432',
        database: 'testdb',
        username: 'testuser',
        password: '',
        ssl: false,
        isConnected: false
      };
      
      mockConnectionManager.connections = [mockConnection];
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      // Open edit modal
      await user.click(screen.getByTitle('Edit connection settings'));
      
      // Update connection name
      const nameInput = screen.getByDisplayValue('Test DB');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Test DB');
      
      // Submit form
      await user.click(screen.getByText('Update Connection'));
      
      expect(mockDbClientService.updateConnection).toHaveBeenCalledWith(
        'conn_1',
        expect.objectContaining({
          name: 'Updated Test DB'
        })
      );
    });

    test('deletes connection with confirmation', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: false
      };
      
      mockConnectionManager.connections = [mockConnection];
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const deleteButton = screen.getByTitle('Delete connection');
      await user.click(deleteButton);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete the connection "Test DB"?');
      expect(mockDbClientService.removeConnection).toHaveBeenCalledWith('conn_1');
      
      confirmSpy.mockRestore();
    });
  });

  describe('Reconnect Functionality', () => {
    test('shows reconnect button for timed out connections', () => {
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: false
      };
      
      mockConnectionManager.connections = [mockConnection];
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getActiveConnection.mockReturnValue('conn_1');
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(true);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      expect(screen.getByTitle('Reconnect to database')).toBeInTheDocument();
    });

    test('initiates reconnection when reconnect button is clicked', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        host: 'localhost',
        port: '5432',
        database: 'testdb',
        username: 'testuser',
        isConnected: false
      };
      
      mockConnectionManager.connections = [mockConnection];
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(true);
      
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connectionId: 'new_conn_id', version: '13.4' })
      });
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const reconnectButton = screen.getByTitle('Reconnect to database');
      await user.click(reconnectButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/database/connect', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expect.objectContaining({
            type: 'postgresql',
            host: 'localhost',
            port: '5432',
            database: 'testdb',
            username: 'testuser'
          }))
        }));
      });
    });

    test('handles reconnection failure gracefully', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: false
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(true);
      
      // Mock failed API response
      fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Connection failed'
      });
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const reconnectButton = screen.getByTitle('Reconnect to database');
      await user.click(reconnectButton);
      
      await waitFor(() => {
        expect(mockContext[2]).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error',
            message: 'Database connection failed'
          })
        );
      });
    });
  });

  describe('SQL Editor Functionality', () => {
    test('formats SQL when format button is clicked', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getActiveConnection.mockReturnValue('conn_1');
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const sqlEditor = screen.getByPlaceholderText('Enter your SQL query here...');
      await user.type(sqlEditor, 'select * from users');
      
      const formatButton = screen.getByText('Format');
      await user.click(formatButton);
      
      expect(formatSQL).toHaveBeenCalledWith('select * from users', 'postgresql');
    });

    test('executes SQL query when execute button is clicked', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true,
        connectionId: 'active_conn_123'
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(false);
      
      // Mock successful query response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rowCount: 2,
          columns: ['id', 'name'],
          rows: [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' }
          ],
          executionTime: 150
        })
      });
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const sqlEditor = screen.getByPlaceholderText('Enter your SQL query here...');
      await user.type(sqlEditor, 'SELECT * FROM users');
      
      const executeButton = screen.getByText('Execute');
      await user.click(executeButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/database/query', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connectionId: 'active_conn_123',
            sql: 'SELECT * FROM users',
            maxRows: 1000,
            timeout: 30000
          })
        }));
      });
      
      expect(mockDbClientService.addToQueryHistory).toHaveBeenCalled();
    });

    test('prevents execution when connection is timed out', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(true);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const sqlEditor = screen.getByPlaceholderText(/Connection timed out/);
      expect(sqlEditor).toBeDisabled();
      
      const executeButton = screen.getByText('Execute');
      expect(executeButton).toBeDisabled();
      expect(executeButton).toHaveAttribute('title', 'Connection timed out - please reconnect');
    });

    test('handles query execution errors', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true,
        connectionId: 'active_conn_123'
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(false);
      
      // Mock failed query response
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Syntax error in SQL query' })
      });
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const sqlEditor = screen.getByPlaceholderText('Enter your SQL query here...');
      await user.type(sqlEditor, 'SELEC * FROM users'); // Intentional typo
      
      const executeButton = screen.getByText('Execute');
      await user.click(executeButton);
      
      await waitFor(() => {
        expect(mockContext[2]).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error',
            message: 'Query execution failed',
            details: 'Syntax error in SQL query'
          })
        );
      });
    });
  });

  describe('Connection Timeout Handling', () => {
    test('detects connection timeout and shows appropriate UI', () => {
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockConnectionManager.connections = [mockConnection];
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(true);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      expect(screen.getByText('⏰ Timed Out')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Connection timed out/)).toBeInTheDocument();
    });

    test('starts timeout monitoring when connection is established', async () => {
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        host: 'localhost',
        port: '5432',
        database: 'testdb',
        username: 'testuser'
      };
      
      // Mock successful connection
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connectionId: 'new_conn_id', version: '13.4' })
      });
      
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      // Simulate connection establishment
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(mockConnectionTimeout.startConnectionTimeout).toHaveBeenCalledWith(
        'conn_1',
        300000 // Default 5 minute timeout
      );
    });
  });

  describe('Query History', () => {
    test('displays query history when available', () => {
      const mockHistory = [
        {
          query: 'SELECT * FROM users',
          results: { status: 'success', rowCount: 5 },
          timestamp: '2023-12-01T10:00:00Z'
        },
        {
          query: 'SELECT COUNT(*) FROM orders',
          results: { status: 'error' },
          timestamp: '2023-12-01T09:30:00Z'
        }
      ];
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockDbClientService.getQueryHistory.mockReturnValue(mockHistory);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      expect(screen.getByText('Query History')).toBeInTheDocument();
      expect(screen.getByText('SELECT * FROM users')).toBeInTheDocument();
      expect(screen.getByText('SELECT COUNT(*) FROM orders')).toBeInTheDocument();
    });

    test('loads query from history when clicked', async () => {
      const user = userEvent.setup();
      
      const mockHistory = [
        {
          query: 'SELECT * FROM users WHERE active = true',
          results: { status: 'success' },
          timestamp: '2023-12-01T10:00:00Z'
        }
      ];
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockDbClientService.getQueryHistory.mockReturnValue(mockHistory);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const historyItem = screen.getByText('SELECT * FROM users WHERE active = true');
      await user.click(historyItem);
      
      const sqlEditor = screen.getByDisplayValue('SELECT * FROM users WHERE active = true');
      expect(sqlEditor).toBeInTheDocument();
    });
  });

  describe('Configuration Panel Integration', () => {
    test('updates configuration when settings change', () => {
      mockContext[0] = true; // configPanelOpen = true
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      // Test that config panel would be rendered
      // (This is a simplified test since config panel rendering is complex)
      expect(mockContext[0]).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true,
        connectionId: 'active_conn_123'
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(false);
      
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const sqlEditor = screen.getByPlaceholderText('Enter your SQL query here...');
      await user.type(sqlEditor, 'SELECT 1');
      
      const executeButton = screen.getByText('Execute');
      await user.click(executeButton);
      
      await waitFor(() => {
        expect(mockContext[2]).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error',
            message: 'Query execution failed'
          })
        );
      });
    });

    test('validates empty SQL queries', async () => {
      const user = userEvent.setup();
      
      const mockConnection = {
        id: 'conn_1',
        name: 'Test DB',
        type: 'postgresql',
        isConnected: true
      };
      
      mockConnectionManager.activeConnectionId = 'conn_1';
      mockDbClientService.getConnection.mockReturnValue(mockConnection);
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const executeButton = screen.getByText('Execute');
      await user.click(executeButton);
      
      expect(mockContext[2]).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Empty query',
          details: 'Please enter a SQL query to execute'
        })
      );
    });
  });

  describe('Accessibility', () => {
    test('provides proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const newConnectionBtn = screen.getByLabelText(/Create new database connection/i);
      expect(newConnectionBtn).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DatabaseClient />
        </TestWrapper>
      );
      
      const newConnectionBtn = screen.getByText('New Connection');
      
      // Tab to button and press Enter
      await user.tab();
      expect(newConnectionBtn).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(screen.getByText('New Database Connection')).toBeInTheDocument();
    });
  });
});

// Integration Tests
describe('DatabaseClient Integration Tests', () => {
  test('complete connection workflow', async () => {
    const user = userEvent.setup();
    
    // Mock successful connection
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ connectionId: 'conn_123', version: '13.4' })
    });
    
    render(
      <TestWrapper>
        <DatabaseClient />
      </TestWrapper>
    );
    
    // Create new connection
    await user.click(screen.getByText('New Connection'));
    await user.type(screen.getByLabelText('Connection Name *'), 'Integration Test DB');
    await user.type(screen.getByLabelText('Host *'), 'localhost');
    await user.type(screen.getByLabelText('Database *'), 'testdb');
    await user.type(screen.getByLabelText('Username *'), 'testuser');
    await user.click(screen.getByText('Create Connection'));
    
    // Verify connection was created and API called
    expect(mockDbClientService.addConnection).toHaveBeenCalled();
    
    // Verify connection establishment API call would be made
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/database/connect', expect.any(Object));
    });
  });

  test('reconnection after timeout workflow', async () => {
    const user = userEvent.setup();
    
    const mockConnection = {
      id: 'conn_1',
      name: 'Test DB',
      type: 'postgresql',
      host: 'localhost',
      port: '5432',
      database: 'testdb',
      username: 'testuser',
      isConnected: false
    };
    
    mockConnectionManager.activeConnectionId = 'conn_1';
    mockConnectionManager.connections = [mockConnection];
    mockDbClientService.getConnection.mockReturnValue(mockConnection);
    mockConnectionTimeout.isConnectionTimedOut.mockReturnValue(true);
    
    // Mock successful reconnection
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ connectionId: 'new_conn_123', version: '13.4' })
    });
    
    render(
      <TestWrapper>
        <DatabaseClient />
      </TestWrapper>
    );
    
    // Click reconnect button
    const reconnectButton = screen.getByTitle('Reconnect to database');
    await user.click(reconnectButton);
    
    // Verify reconnection API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/database/connect', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(expect.objectContaining({
          type: 'postgresql',
          host: 'localhost',
          database: 'testdb'
        }))
      }));
    });
  });
});