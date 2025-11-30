# Enhanced Database Client

A comprehensive ReactJS database client component with advanced connection management, timeout handling, and reconnection capabilities. Supports PostgreSQL, MySQL, Oracle, and Sybase databases with persistent sessions and real-time connection monitoring.

## 🚀 New Features

### 1. **Reconnect Button**
- Automatically detects connection timeouts
- Provides one-click reconnection functionality
- Implements exponential backoff retry logic
- Shows visual feedback during reconnection attempts
- Supports configurable retry attempts and timeout durations

### 2. **Edit Connection Button**
- Edit existing database connections without deletion
- Real-time validation with user-friendly error messages
- Automatic reconnection with updated credentials
- Form state management with unsaved changes detection
- Password visibility toggle for security

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Component Architecture](#component-architecture)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **Multi-Database Support**: PostgreSQL, MySQL, Oracle, Sybase
- **Persistent Sessions**: Maintains connection state across component navigation
- **SQL Editor**: Syntax highlighting, formatting, and auto-completion
- **Query History**: Tracks and replays previous queries
- **Real-time Results**: Displays query results with pagination
- **Connection Management**: Create, edit, delete, and switch connections
- **Timeout Monitoring**: Automatic connection timeout detection
- **Reconnection Logic**: Smart reconnection with retry mechanisms

### Advanced Features
- **Connection Pooling**: Configurable connection pool management
- **Query Validation**: SQL syntax validation and security checks
- **Export/Import**: Connection configuration backup and restore
- **Dark Mode Support**: Complete dark theme compatibility
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Mobile and tablet friendly interface

## 🛠 Installation

### Prerequisites
- Node.js 16+ 
- React 18+
- A backend API supporting database connections

### Install Dependencies

```bash
npm install react react-dom react-router-dom prop-types
```

### Install Component Files

Copy the following files to your project:

```
components/
├── DBClient/
│   ├── DatabaseClient.jsx
│   ├── DatabaseClient.css
│   ├── DatabaseClientConfig.jsx
│   ├── components/
│   │   ├── ConnectionEditModal.jsx
│   │   └── ReconnectButton.jsx
│   ├── hooks/
│   │   ├── useConnectionManager.js
│   │   └── useConnectionTimeout.js
│   └── utils/
│       ├── connectionValidator.js
│       └── sqlFormatter.js
```

## 🚀 Quick Start

### Basic Usage

```jsx
import DatabaseClient from './components/DBClient/DatabaseClient';

function App() {
  return (
    <div className="app">
      <DatabaseClient />
    </div>
  );
}
```

### With React Router

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DatabaseClient from './components/DBClient/DatabaseClient';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/database" element={<DatabaseClient />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Backend API Requirements

Your backend must provide these endpoints:

```javascript
// Connection endpoints
POST /api/database/connect
POST /api/database/test-connection
POST /api/database/query
DELETE /api/database/disconnect
```

Example API implementation:

```javascript
// Express.js example
app.post('/api/database/connect', async (req, res) => {
  const { type, host, port, database, username, password, ssl } = req.body;
  
  try {
    const connection = await connectToDatabase({
      type, host, port, database, username, password, ssl
    });
    
    res.json({
      connectionId: connection.id,
      version: connection.serverVersion
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🏗 Component Architecture

### Main Components

#### DatabaseClient (Main Component)
- **Purpose**: Primary container managing all database interactions
- **Props**: None (uses React Router context)
- **State Management**: Connections, active connection, query state
- **Key Features**: Connection management, SQL execution, timeout handling

#### ReconnectButton
- **Purpose**: Provides reconnection functionality for timed-out connections
- **Props**: 
  ```typescript
  interface ReconnectButtonProps {
    connectionId: string;
    onReconnect: (connectionId: string) => Promise<boolean>;
    isReconnecting?: boolean;
    className?: string;
    showText?: boolean;
    size?: 'small' | 'normal' | 'large';
  }
  ```

#### ConnectionEditModal
- **Purpose**: Modal interface for editing existing connections
- **Props**:
  ```typescript
  interface ConnectionEditModalProps {
    connection: Connection;
    onUpdate: (connection: Connection) => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
  }
  ```

### Custom Hooks

#### useConnectionManager
- **Purpose**: Centralized connection state management
- **Returns**: Connection CRUD operations, state, and event handlers
- **Features**: Persistent storage, reactive updates, validation

#### useConnectionTimeout
- **Purpose**: Connection timeout monitoring and management
- **Returns**: Timeout tracking, warning systems, cleanup utilities
- **Features**: Configurable timeouts, exponential backoff, cleanup

### Utility Functions

#### connectionValidator.js
- **Purpose**: Validates database connection configurations
- **Functions**: `validateConnection()`, `sanitizeConnectionConfig()`, `testConnectionConfig()`
- **Features**: Multi-database validation, security checks, helpful error messages

#### sqlFormatter.js
- **Purpose**: SQL formatting and syntax validation
- **Functions**: `formatSQL()`, `validateSQL()`, `highlightSQL()`
- **Features**: Dialect-specific formatting, syntax highlighting, query analysis

## 📖 API Reference

### DatabaseClient Component

```jsx
<DatabaseClient />
```

**Context Requirements:**
- Must be used within React Router `<Outlet>` context
- Expects context array: `[configPanelOpen, setConfigPanelOpen, handleResultsUpdate]`

### ReconnectButton Component

```jsx
<ReconnectButton
  connectionId="conn_123"
  onReconnect={handleReconnect}
  isReconnecting={false}
  showText={true}
  size="normal"
  className="custom-class"
/>
```

**Props:**
- `connectionId` (string, required): Connection ID to reconnect
- `onReconnect` (function, required): Async function that returns Promise<boolean>
- `isReconnecting` (boolean): Whether reconnection is in progress
- `showText` (boolean): Show text alongside icon
- `size` ('small'|'normal'|'large'): Button size variant
- `className` (string): Additional CSS classes

### ConnectionEditModal Component

```jsx
<ConnectionEditModal
  connection={connectionObject}
  onUpdate={handleUpdate}
  onCancel={handleCancel}
  isOpen={true}
/>
```

**Props:**
- `connection` (object, required): Connection object to edit
- `onUpdate` (function, required): Called when connection is updated
- `onCancel` (function, required): Called when modal is canceled
- `isOpen` (boolean): Whether modal is visible

### Hook Usage Examples

#### useConnectionManager

```javascript
import { useConnectionManager } from './hooks/useConnectionManager';

function MyComponent() {
  const {
    connections,
    activeConnectionId,
    addConnection,
    updateConnection,
    removeConnection,
    getConnectionStats
  } = useConnectionManager();

  const handleNewConnection = async (config) => {
    const connectionId = addConnection(config);
    return connectionId;
  };

  return (
    <div>
      {connections.map(conn => (
        <div key={conn.id}>{conn.name}</div>
      ))}
    </div>
  );
}
```

#### useConnectionTimeout

```javascript
import { useConnectionTimeout } from './hooks/useConnectionTimeout';

function MyComponent() {
  const {
    startConnectionTimeout,
    isConnectionTimedOut,
    reconnectToDatabase
  } = useConnectionTimeout({
    defaultTimeout: 300000, // 5 minutes
    onTimeout: ({ type, connectionId }) => {
      if (type === 'timeout') {
        console.log(`Connection ${connectionId} timed out`);
      }
    }
  });

  const handleConnect = (connectionId) => {
    startConnectionTimeout(connectionId, 300000);
  };

  return null;
}
```

## ⚙️ Configuration

### Default Configuration

```javascript
const defaultConfig = {
  autoFormat: true,
  formatOnPaste: true,
  maxRows: 1000,
  queryTimeout: 30000,
  showQueryHistory: true,
  confirmDeleteConnection: true,
  connectionTimeout: 300000, // 5 minutes
  autoReconnect: true,
  reconnectAttempts: 3
};
```

### Environment Variables

```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:3001

# Default database ports
REACT_APP_POSTGRESQL_PORT=5432
REACT_APP_MYSQL_PORT=3306
REACT_APP_ORACLE_PORT=1521
REACT_APP_SYBASE_PORT=5000

# Security settings
REACT_APP_MAX_QUERY_LENGTH=10000
REACT_APP_ENABLE_DANGEROUS_QUERIES=false
```

### CSS Custom Properties

```css
:root {
  --db-client-primary-color: #4f46e5;
  --db-client-success-color: #10b981;
  --db-client-warning-color: #f59e0b;
  --db-client-error-color: #ef4444;
  --db-client-timeout-color: #f59e0b;
  --db-client-border-radius: 0.375rem;
  --db-client-font-family: 'Inter', system-ui, sans-serif;
  --db-client-mono-font: 'Fira Code', 'Consolas', monospace;
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test DatabaseClient.test.js
```

### Test Structure

```
__tests__/
├── DatabaseClient.test.js         # Main component tests
├── ReconnectButton.test.js        # Reconnect button tests
├── ConnectionEditModal.test.js    # Edit modal tests
├── hooks/
│   ├── useConnectionManager.test.js
│   └── useConnectionTimeout.test.js
└── utils/
    ├── connectionValidator.test.js
    └── sqlFormatter.test.js
```

### Example Test

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatabaseClient from '../DatabaseClient';

test('creates new connection successfully', async () => {
  const user = userEvent.setup();
  
  render(<DatabaseClient />);
  
  await user.click(screen.getByText('New Connection'));
  await user.type(screen.getByLabelText('Connection Name *'), 'Test DB');
  await user.click(screen.getByText('Create Connection'));
  
  expect(screen.getByText('Test DB')).toBeInTheDocument();
});
```

### Test Coverage Goals
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## 🔒 Security

### Input Validation
- All connection parameters are validated and sanitized
- SQL injection prevention through parameterized queries
- Dangerous SQL keywords detection and warnings
- Connection string validation with security checks

### Data Protection
- Passwords are not stored in localStorage for security
- Connection configurations exclude sensitive data in exports
- API communication uses secure HTTP headers
- Input sanitization prevents XSS attacks

### Security Best Practices

```javascript
// Example: Secure connection configuration
const secureConfig = {
  name: sanitizeString(userInput.name),
  host: validateHost(userInput.host),
  port: validatePort(userInput.port),
  ssl: true, // Always recommend SSL
  // Password is handled separately and never logged
};
```

## ⚡ Performance

### Optimization Features
- **Connection Pooling**: Reuses database connections efficiently
- **Lazy Loading**: Components load only when needed
- **Memoization**: Expensive operations are cached
- **Virtual Scrolling**: Large result sets render efficiently
- **Debounced Input**: Reduces API calls during typing

### Performance Monitoring

```javascript
// Built-in performance metrics
const stats = getConnectionStats(connectionId);
console.log({
  totalQueries: stats.totalQueries,
  avgExecutionTime: stats.avgExecutionTime,
  successRate: stats.successRate
});
```

### Memory Management
- Automatic cleanup of unused connections
- Query result pagination to limit memory usage
- Event listener cleanup on component unmount
- Connection timeout cleanup prevents memory leaks

## 🐛 Troubleshooting

### Common Issues

#### Connection Timeout Issues
```javascript
// Problem: Connections timing out too quickly
// Solution: Increase timeout duration
const config = {
  connectionTimeout: 600000, // 10 minutes
  reconnectAttempts: 5
};
```

#### SQL Formatting Problems
```javascript
// Problem: SQL not formatting correctly
// Solution: Specify correct dialect
formatSQL(sql, 'postgresql'); // Instead of 'sql'
```

#### Performance Issues
```javascript
// Problem: Large result sets causing slowdown
// Solution: Limit rows and use pagination
const config = {
  maxRows: 100, // Reduce from default 1000
  enablePagination: true
};
```

### Debug Mode

```javascript
// Enable debug logging
window.DB_CLIENT_DEBUG = true;

// This will log detailed information about:
// - Connection attempts and failures
// - Query execution times
// - Timeout events
// - State changes
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `CONN_001` | Connection timeout | Check network and increase timeout |
| `CONN_002` | Invalid credentials | Verify username/password |
| `CONN_003` | Database not found | Check database name |
| `SQL_001` | Syntax error | Review SQL query syntax |
| `SQL_002` | Permission denied | Check user permissions |

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd database-client

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```

### Code Style
- Follow Airbnb JavaScript Style Guide
- Use Prettier for code formatting
- ESLint for code quality
- 2-space indentation
- Meaningful variable and function names

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

### Adding New Database Support

```javascript
// 1. Add database type to validation
const SUPPORTED_DATABASES = ['postgresql', 'mysql', 'oracle', 'sybase', 'newdb'];

// 2. Add dialect-specific formatting
const formatNewDB = (sql, options) => {
  // Database-specific SQL formatting logic
  return formattedSQL;
};

// 3. Add connection validation
const validateNewDBConnection = (config) => {
  // Database-specific validation rules
  return { isValid: true, errors: [] };
};

// 4. Update tests and documentation
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the excellent framework
- Database driver maintainers
- Open source community for inspiration and feedback
- Beta testers for valuable bug reports and feature requests

## 📞 Support

- **Documentation**: [Link to full documentation]
- **Issues**: [GitHub Issues page]
- **Discussions**: [GitHub Discussions page]
- **Email**: support@yourproject.com

## 🗺 Roadmap

### Version 2.0 (Next Release)
- [ ] GraphQL support
- [ ] Advanced query builder interface
- [ ] Database schema visualization
- [ ] Query performance analytics
- [ ] Real-time collaboration features

### Version 2.1 (Future)
- [ ] MongoDB support
- [ ] Elasticsearch integration
- [ ] Advanced security features
- [ ] Mobile app companion
- [ ] Cloud deployment options

---

**Made with ❤️ by the ATF Team**