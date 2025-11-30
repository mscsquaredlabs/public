// server/index.js - Clean version with Database Client functionality
import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { createServer } from 'http';
import { initializeTerminalWS, browseDirectory, runExecutable } from './terminal-ws.js';

// Database imports - using dynamic imports for ESM compatibility
let Pool, mysql; // Will be initialized when needed

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for database operations
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist folder in production
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log(`📦 Serving static files from: ${distPath}`);
  }
}

// Add debugging middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path.includes('/database/')) {
    console.log('Request body:', { ...req.body, password: req.body.password ? '***hidden***' : undefined });
  }
  next();
});

// Request ID middleware for debugging
app.use((req, res, next) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  console.log(`[${requestId}] ${req.method} ${req.path}`);
  
  // Add requestId to response
  res.locals.requestId = requestId;
  
  // Capture and log response for database endpoints
  if (req.path.includes('/database/')) {
    const oldSend = res.send;
    res.send = function(data) {
      console.log(`[${requestId}] Response:`, typeof data === 'string' ? data.substr(0, 200) : '[object]');
      return oldSend.apply(res, arguments);
    };
  }
  
  next();
});

// ============================================================================
// DATABASE CLIENT FUNCTIONALITY
// ============================================================================

// Store active database connections
const activeConnections = new Map();

// Helper function to generate connection ID
const generateConnectionId = (type) => {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to cleanup connection
const cleanupConnection = async (connectionId) => {
  if (activeConnections.has(connectionId)) {
    const connection = activeConnections.get(connectionId);
    
    try {
      if (connection.pool) {
        switch (connection.type) {
          case 'postgresql':
          case 'mysql':
            await connection.pool.end();
            break;
        }
      }
    } catch (error) {
      console.error('Error cleaning up connection:', error);
    }
    
    activeConnections.delete(connectionId);
    console.log(`🗑️  Database connection ${connectionId} cleaned up`);
  }
};

// Initialize database drivers dynamically
const initializeDatabaseDrivers = async () => {
  try {
    // Dynamic import for PostgreSQL
    const pgModule = await import('pg');
    Pool = pgModule.Pool;
    console.log('✅ PostgreSQL driver loaded');
  } catch (error) {
    console.log('⚠️  PostgreSQL driver not available:', error.message);
  }
  
  try {
    // Dynamic import for MySQL
    const mysqlModule = await import('mysql2/promise');
    mysql = mysqlModule.default;
    console.log('✅ MySQL driver loaded');
  } catch (error) {
    console.log('⚠️  MySQL driver not available:', error.message);
  }
};

// Helper function to provide specific error help
function getConnectionErrorHelp(error) {
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'ENOTFOUND':
      return 'DNS lookup failed. Check if the hostname/IP address is correct and accessible.';
    case 'ECONNREFUSED':
      return 'Connection refused. Check if PostgreSQL is running and accepting connections on the specified port.';
    case 'ETIMEDOUT':
      return 'Connection timed out. Check network connectivity and firewall settings.';
    case 'ECONNRESET':
      return 'Connection was reset. This might be a network or server configuration issue.';
    case '28P01':
      return 'Authentication failed. Check username and password.';
    case '3D000':
      return 'Database does not exist. Check the database name.';
    case '28000':
      return 'Invalid authorization specification. Check user permissions.';
    default:
      return `PostgreSQL error code: ${errorCode}. Check PostgreSQL documentation for details.`;
  }
}

// DATABASE API ROUTES

// Test database connection endpoint
app.post('/api/database/test-connection', async (req, res) => {
  const requestId = res.locals.requestId;
  
  try {
    const { type, host, port, database, username, password, ssl } = req.body;
    
    console.log(`[${requestId}] 🧪 Testing database connection parameters:`);
    console.log(`[${requestId}] - Type: ${type}`);
    console.log(`[${requestId}] - Host: ${host}`);
    console.log(`[${requestId}] - Port: ${port}`);
    console.log(`[${requestId}] - Database: ${database}`);
    console.log(`[${requestId}] - Username: ${username}`);
    console.log(`[${requestId}] - SSL: ${ssl}`);
    
    if (type === 'postgresql') {
      if (!Pool) {
        console.log(`[${requestId}] ❌ PostgreSQL Pool not initialized`);
        return res.status(500).json({ 
          error: 'PostgreSQL driver not available',
          details: 'The pg package may not be installed or imported correctly'
        });
      }
      
      console.log(`[${requestId}] ✅ PostgreSQL Pool available, attempting connection...`);
      
      // Test connection with detailed logging
      const testPool = new Pool({
        host,
        port: parseInt(port),
        database,
        user: username,
        password,
        ssl: ssl ? { rejectUnauthorized: false } : false,
        max: 1, // Just one connection for testing
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 5000,
      });
      
      console.log(`[${requestId}] 🔌 Pool created, getting client...`);
      
      const client = await testPool.connect();
      console.log(`[${requestId}] 🎉 Client connected successfully!`);
      
      const result = await client.query('SELECT version() as version, current_database() as database, current_user as user');
      console.log(`[${requestId}] 📊 Query result:`, result.rows[0]);
      
      client.release();
      await testPool.end();
      
      console.log(`[${requestId}] ✅ Test connection successful and cleaned up`);
      
      res.json({
        success: true,
        message: 'Connection test successful',
        serverInfo: result.rows[0],
        connectionDetails: {
          host,
          port,
          database,
          username,
          ssl: ssl ? 'enabled' : 'disabled'
        }
      });
      
    } else {
      res.status(400).json({ 
        error: 'Only PostgreSQL testing implemented',
        supportedTypes: ['postgresql']
      });
    }
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Connection test failed:`, error);
    console.error(`[${requestId}] Error details:`, {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      hostname: error.hostname,
      address: error.address
    });
    
    res.status(500).json({
      error: error.message,
      code: error.code,
      details: getConnectionErrorHelp(error)
    });
  }
});

// POST /api/database/connect
app.post('/api/database/connect', async (req, res) => {
  const requestId = res.locals.requestId;
  
  try {
    const { type, host, port, database, username, password, ssl } = req.body;
    
    console.log(`[${requestId}] 🔌 Attempting to connect to ${type} database: ${host}:${port}/${database}`);
    
    let connection = null;
    let connectionId = generateConnectionId(type);
    
    switch (type) {
      case 'postgresql':
        if (!Pool) {
          return res.status(500).json({ error: 'PostgreSQL driver not available. Install pg package.' });
        }
        
        const pgPool = new Pool({
          host,
          port: parseInt(port),
          database,
          user: username,
          password,
          ssl: ssl ? { rejectUnauthorized: false } : false,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
        
        // Test connection
        const pgClient = await pgPool.connect();
        const pgResult = await pgClient.query('SELECT version() as version, current_database() as database');
        pgClient.release();
        
        connection = {
          pool: pgPool,
          type: 'postgresql',
          version: pgResult.rows[0].version,
          database: pgResult.rows[0].database
        };
        break;
        
      case 'mysql':
        if (!mysql) {
          return res.status(500).json({ error: 'MySQL driver not available. Install mysql2 package.' });
        }
        
        const mysqlPool = mysql.createPool({
          host,
          port: parseInt(port),
          database,
          user: username,
          password,
          ssl: ssl ? {} : false,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          acquireTimeout: 10000,
          timeout: 60000,
        });
        
        // Test connection
        const [mysqlRows] = await mysqlPool.execute('SELECT VERSION() as version, DATABASE() as database_name');
        
        connection = {
          pool: mysqlPool,
          type: 'mysql',
          version: mysqlRows[0].version,
          database: mysqlRows[0].database_name || database
        };
        break;
        
      case 'oracle':
        return res.status(501).json({ 
          error: 'Oracle support not implemented',
          message: 'Oracle support requires additional setup. Contact administrator.'
        });
        
      case 'sybase':
        return res.status(501).json({ 
          error: 'Sybase support not implemented',
          message: 'Sybase support requires additional setup. Contact administrator.'
        });
        
      default:
        return res.status(400).json({ error: `Unsupported database type: ${type}` });
    }
    
    // Store connection
    activeConnections.set(connectionId, {
      ...connection,
      createdAt: new Date(),
      lastUsed: new Date(),
      config: { type, host, port, database, username } // Store config without password
    });
    
    // Auto-cleanup after 1 hour of inactivity
    setTimeout(() => {
      cleanupConnection(connectionId);
    }, 60 * 60 * 1000);
    
    console.log(`[${requestId}] ✅ Successfully connected to ${type} database. Connection ID: ${connectionId}`);
    
    res.json({
      success: true,
      connectionId,
      version: connection.version,
      database: connection.database,
      message: `Connected to ${type} database successfully`
    });
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Database connection error:`, error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      details: getConnectionErrorHelp(error)
    });
  }
});

// POST /api/database/query
app.post('/api/database/query', async (req, res) => {
  const requestId = res.locals.requestId;
  
  try {
    const { connectionId, sql, maxRows = 1000, timeout = 30000 } = req.body;
    
    if (!activeConnections.has(connectionId)) {
      return res.status(400).json({ error: 'Connection not found or expired' });
    }
    
    const connection = activeConnections.get(connectionId);
    connection.lastUsed = new Date(); // Update last used time
    
    const startTime = Date.now();
    
    console.log(`[${requestId}] 🔍 Executing query on ${connection.type}: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
    
    let result = null;
    
    switch (connection.type) {
      case 'postgresql':
        const pgClient = await connection.pool.connect();
        try {
          const pgResult = await pgClient.query(sql);
          result = {
            rows: pgResult.rows,
            rowCount: pgResult.rowCount,
            columns: pgResult.fields?.map(f => f.name) || []
          };
        } finally {
          pgClient.release();
        }
        break;
        
      case 'mysql':
        const [mysqlRows, mysqlFields] = await connection.pool.execute(sql);
        result = {
          rows: mysqlRows,
          rowCount: Array.isArray(mysqlRows) ? mysqlRows.length : 0,
          columns: mysqlFields?.map(f => f.name) || []
        };
        break;
        
      default:
        return res.status(400).json({ error: `Unsupported database type: ${connection.type}` });
    }
    
    const executionTime = Date.now() - startTime;
    
    console.log(`[${requestId}] ✅ Query executed successfully. Rows: ${result.rowCount}, Time: ${executionTime}ms`);
    
    res.json({
      success: true,
      rows: result.rows.slice(0, maxRows),
      rowCount: result.rowCount,
      columns: result.columns,
      executionTime,
      hasMoreRows: result.rows.length > maxRows
    });
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Query execution error:`, error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check your SQL syntax and ensure you have proper permissions'
    });
  }
});

// POST /api/database/disconnect
app.post('/api/database/disconnect', async (req, res) => {
  const requestId = res.locals.requestId;
  
  try {
    const { connectionId } = req.body;
    
    await cleanupConnection(connectionId);
    
    console.log(`[${requestId}] ✅ Database connection disconnected successfully`);
    res.json({ success: true, message: 'Connection closed successfully' });
    
  } catch (error) {
    console.error(`[${requestId}] ❌ Disconnect error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/database/connections
app.get('/api/database/connections', (req, res) => {
  const requestId = res.locals.requestId;
  
  const connections = Array.from(activeConnections.entries()).map(([id, conn]) => ({
    connectionId: id,
    type: conn.type,
    database: conn.database,
    host: conn.config?.host,
    port: conn.config?.port,
    createdAt: conn.createdAt,
    lastUsed: conn.lastUsed
  }));
  
  console.log(`[${requestId}] 📊 Listed ${connections.length} active database connections`);
  res.json({ connections, count: connections.length });
});

// GET /api/database/health
app.get('/api/database/health', (req, res) => {
  const requestId = res.locals.requestId;
  
  res.json({ 
    status: 'ok', 
    service: 'ATF Dev Studio Database API',
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size,
    supportedDatabases: [
      Pool ? 'postgresql ✅' : 'postgresql ❌',
      mysql ? 'mysql ✅' : 'mysql ❌',
      'oracle ⚠️ (not implemented)',
      'sybase ⚠️ (not implemented)'
    ],
    requestId
  });
});

// ============================================================================
// EXISTING TERMINAL API FUNCTIONALITY - PRESERVED
// ============================================================================

// Improved terminal API test endpoint
app.get('/api/terminal/test', (req, res) => {
  const requestId = res.locals.requestId;
  console.log(`[${requestId}] Terminal API test endpoint called`);
  
  // Explicitly set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/json');
  
  // Return a more detailed response
  res.status(200).json({ 
    message: 'Terminal API is working',
    timestamp: new Date().toISOString(),
    serverVersion: '1.0.0',
    platform: process.platform,
    nodePath: process.execPath,
    requestId: requestId
  });
});

// Terminal command execution endpoint with improved logging and error handling
app.post('/api/terminal/exec', async (req, res) => {
  const requestId = res.locals.requestId;
  try {
    const { command, cwd, clientTimestamp } = req.body;
    
    console.log(`[${requestId}] Executing command: "${command}" in directory: "${cwd}" (client timestamp: ${clientTimestamp})`);
    
    if (!command) {
      console.log(`[${requestId}] Error: Command is required`);
      return res.status(400).json({ 
        error: 'Command is required',
        success: false,
        requestId
      });
    }

    // Set a default working directory if none provided
    let workingDir = cwd;
    
    // Validate and set default working directory
    if (!workingDir) {
      workingDir = process.platform === 'win32' ? process.cwd() || 'C:\\' : process.cwd() || '/';
    }
    
    // Ensure the directory exists
    if (!fs.existsSync(workingDir)) {
      console.log(`[${requestId}] Warning: Working directory does not exist: "${workingDir}", using current directory`);
      workingDir = process.cwd();
    }
    
    // For non-CD commands, execute normally
    const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
    const args = process.platform === 'win32' ? ['/c', command] : ['-c', command];
    
    console.log(`[${requestId}] Executing with ${shell}: ${args.join(' ')} in directory: "${workingDir}"`);
    
    // Add a promise wrapper around the child process
    const execResult = await new Promise((resolve, reject) => {
      const childProcess = spawn(shell, args, { 
        cwd: workingDir, 
        shell: true,
        windowsHide: true
      });
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        console.log(`[${requestId}] Command output chunk:`, chunk);
      });
      
      childProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        console.error(`[${requestId}] Command error chunk:`, chunk);
      });
      
      childProcess.on('close', (code) => {
        console.log(`[${requestId}] Command exited with code ${code}`);
        console.log(`[${requestId}] Final stdout:`, stdout);
        if (stderr) console.log(`[${requestId}] Final stderr:`, stderr);
        
        resolve({
          code,
          stdout,
          stderr
        });
      });
      
      childProcess.on('error', (error) => {
        console.error(`[${requestId}] Command execution error: ${error.message}`);
        reject(error);
      });
      
      // Add timeout to kill process if it runs too long
      const timeout = setTimeout(() => {
        console.log(`[${requestId}] Command timeout exceeded, killing process`);
        childProcess.kill();
        reject(new Error('Command execution timed out after 30 seconds'));
      }, 30000); // 30 seconds timeout
      
      childProcess.on('close', () => clearTimeout(timeout));
    });
    
    // Log the success/failure of the command
    console.log(`[${requestId}] Command execution ${execResult.code === 0 ? 'successful' : 'failed'}`);
    
    // Send the response with the execution result
    if (execResult.code === 0) {
      // For CD commands, try to detect directory changes
      let newDirectory = workingDir;
      if (command.match(/^(cd|chdir)\s+/i)) {
        // Simple directory change detection for cd commands
        const dirArg = command.replace(/^(cd|chdir)\s+/i, '').trim();
        if (dirArg === '..') {
          // Move up one directory
          newDirectory = path.dirname(workingDir);
        } else if (dirArg.match(/^[A-Za-z]:/i)) {
          // Drive letter change on Windows
          newDirectory = dirArg;
        } else if (!dirArg.includes('/') && !dirArg.includes('\\')) {
          // Simple subdirectory
          newDirectory = path.join(workingDir, dirArg);
        } else {
          // Use the argument directly for other paths
          newDirectory = dirArg;
        }
        console.log(`[${requestId}] Directory changed to:`, newDirectory);
      } else if (/^[A-Za-z]:$/i.test(command.trim())) {
        // Windows "C:" / "D:" style drive switch
        newDirectory = command.trim().toUpperCase() + '\\';
        console.log(`[${requestId}] Drive changed to:`, newDirectory);
      }
      
      // Format the output for special commands
      let formattedOutput = execResult.stdout;
      
      // For directory listings, add formatting if output is empty
      if (command.match(/^(dir|ls)/i) && !formattedOutput.trim()) {
        formattedOutput = `Directory listing for ${workingDir}:\n(No files found or directory is empty)\n`;
      }
      
      res.json({ 
        output: formattedOutput, 
        newDirectory,
        success: true,
        requestId,
        commandExecuted: command
      });
    } else {
      res.json({ 
        output: execResult.stderr || `Process exited with code ${execResult.code}`, 
        newDirectory: workingDir,
        success: false,
        requestId,
        commandExecuted: command
      });
    }
  } catch (error) {
    console.error(`[${requestId}] Server error:`, error);
    res.status(500).json({ 
      error: `Server error: ${error.message}`,
      newDirectory: req.body?.cwd || 'C:\\',
      success: false,
      requestId
    });
  }
});

// Add a debug endpoint to test complex command options
app.post('/api/terminal/debug', (req, res) => {
  const requestId = res.locals.requestId;
  const { command, options } = req.body;
  
  console.log(`[${requestId}] Debug endpoint called with command: "${command}"`);
  
  // Echo back what we received with timestamps for debugging
  res.json({
    receivedCommand: command,
    receivedOptions: options,
    timestamp: new Date().toISOString(),
    serverTime: process.uptime(),
    requestId
  });
});

// ============================================================================
// SERVER STARTUP AND GRACEFUL SHUTDOWN
// ============================================================================

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  // Close all database connections
  const promises = [];
  for (const [connectionId] of activeConnections) {
    promises.push(cleanupConnection(connectionId));
  }
  
  await Promise.all(promises);
  console.log('✅ All database connections closed');
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Initialize database drivers and start server
// File browser endpoint
app.post('/api/terminal/browse', (req, res) => {
  try {
    const { path: dirPath } = req.body;
    const result = browseDirectory(dirPath || (process.platform === 'win32' ? 'C:\\' : '/'));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run executable/batch file endpoint
// ============================================================================
// VIEWS API - Folder Monitoring
// ============================================================================

app.post('/api/views/folder', async (req, res) => {
  try {
    const { path: folderPath } = req.body;
    
    console.log(`[Views API] Received request for folder: ${folderPath}`);
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }

    // Normalize path - use same approach as browseDirectory in terminal-ws.js
    let normalizedPath = folderPath;
    const isWindows = process.platform === 'win32';
    
    console.log(`[Views API] Platform: ${process.platform}, isWindows: ${isWindows}`);
    console.log(`[Views API] Received folder path: ${folderPath}`);
    
    // Handle special folder names like "Desktop" and "Documents" on Windows
    if (isWindows && (folderPath === 'Desktop' || folderPath === 'Documents')) {
      // Use os.homedir() which reliably gets the user's home directory (C:\Users\Micks)
      const homeDir = os.homedir();
      console.log(`[Views API] Windows special folder detected.`);
      console.log(`[Views API] Home directory: ${homeDir}`);
      
      // Join home directory with folder name
      normalizedPath = path.join(homeDir, folderPath);
      console.log(`[Views API] Resolved to: ${normalizedPath}`);
    } else if (folderPath.startsWith('~')) {
      // Handle ~ paths for Mac/Linux
      const homeDir = os.homedir();
      normalizedPath = path.join(homeDir, folderPath.slice(1));
      console.log(`[Views API] Expanded ~ path to: ${normalizedPath}`);
    } else {
      // Use path.resolve() like browseDirectory does - this handles all path resolution
      normalizedPath = path.resolve(folderPath);
      console.log(`[Views API] Resolved path: ${normalizedPath}`);
    }

    // Check if path exists and is a directory
    if (!fs.existsSync(normalizedPath)) {
      console.error(`[Views API] Path does not exist: ${normalizedPath}`);
      return res.status(404).json({ error: `Folder does not exist: ${normalizedPath}` });
    }

    const stats = fs.statSync(normalizedPath);
    if (!stats.isDirectory()) {
      console.error(`[Views API] Path is not a directory: ${normalizedPath}`);
      return res.status(400).json({ error: `Path is not a directory: ${normalizedPath}` });
    }

    // Read directory contents
    const entries = fs.readdirSync(normalizedPath, { withFileTypes: true });
    const contents = entries.map(entry => {
      const fullPath = path.join(normalizedPath, entry.name);
      let fileStats;
      try {
        fileStats = fs.statSync(fullPath);
      } catch (err) {
        // Skip files we can't access
        return null;
      }

      return {
        name: entry.name,
        isDirectory: entry.isDirectory(),
        size: fileStats.isFile() ? fileStats.size : null,
        modified: fileStats.mtime.toISOString(),
        extension: entry.isFile() ? path.extname(entry.name).slice(1) : null
      };
    }).filter(item => item !== null); // Remove null entries

    // Sort: directories first, then files, both alphabetically
    contents.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    console.log(`[Views API] Successfully read ${contents.length} items from ${normalizedPath}`);

    res.json({
      path: normalizedPath,
      contents: contents
    });
  } catch (error) {
    console.error('Error reading folder:', error);
    res.status(500).json({ error: error.message || 'Failed to read folder' });
  }
});

// ============================================================================
// BCRYPT API - Hash Generation and Verification
// ============================================================================

// Cache bcrypt module
let bcryptCache = null;

const getBCrypt = async () => {
  if (bcryptCache) {
    return bcryptCache;
  }
  
  try {
    const bcryptModule = await import('bcryptjs');
    // bcryptjs exports both default and named exports
    // Use default if available, otherwise use the module itself
    bcryptCache = bcryptModule.default || bcryptModule;
    return bcryptCache;
  } catch (error) {
    console.error('Error importing bcryptjs:', error);
    throw new Error('BCrypt library not available. Please install bcryptjs: npm install bcryptjs');
  }
};

app.post('/api/bcrypt/hash', async (req, res) => {
  try {
    const { text, rounds = 10 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (rounds < 4 || rounds > 15) {
      return res.status(400).json({ error: 'Rounds must be between 4 and 15' });
    }

    const bcrypt = await getBCrypt();
    
    // bcryptjs.hash() returns a promise when called without a callback
    const hash = await bcrypt.hash(text, rounds);
    
    res.json({ hash });
  } catch (error) {
    console.error('Error generating BCrypt hash:', error);
    res.status(500).json({ error: error.message || 'Failed to generate BCrypt hash' });
  }
});

app.post('/api/bcrypt/verify', async (req, res) => {
  try {
    const { text, hash } = req.body;
    
    if (!text || !hash) {
      return res.status(400).json({ error: 'Text and hash are required' });
    }

    const bcrypt = await getBCrypt();
    
    // bcryptjs.compare() returns a promise when called without a callback
    const match = await bcrypt.compare(text, hash);
    
    res.json({ match });
  } catch (error) {
    console.error('Error verifying BCrypt hash:', error);
    res.status(500).json({ error: error.message || 'Failed to verify BCrypt hash' });
  }
});

app.post('/api/terminal/run', async (req, res) => {
  try {
    const { filePath, args = [], cwd } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const result = await runExecutable(filePath, args, cwd);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

(async () => {
  await initializeDatabaseDrivers();
  
  // Initialize WebSocket terminal server
  try {
    initializeTerminalWS(httpServer);
    console.log('✅ WebSocket terminal server initialized');
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket terminal server:', error);
    // Continue without WebSocket - HTTP endpoints will still work
  }
  
  // Serve React app for all non-API routes (must be after all API routes)
  if (isProduction) {
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      // Catch-all handler: send back React's index.html file for client-side routing
      app.get('*', (req, res) => {
        // Don't serve index.html for API routes
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log(`✅ React app catch-all route configured`);
    } else {
      console.warn(`⚠️  Dist folder not found at ${distPath}. Run 'npm run build' first.`);
    }
  }
  
  httpServer.listen(PORT, () => {
    console.log('\n🚀 ATF Dev Studio Server Started');
    console.log(`📡 Server running on port ${PORT}`);
    if (isProduction) {
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
    } else {
      console.log(`🌐 Frontend: http://localhost:5173 (Vite dev server)`);
    }
    console.log(`📂 Current working directory: ${process.cwd()}`);
    console.log(`📂 Server directory: ${__dirname}`);
    
    // Terminal API
    console.log(`🖥️  Terminal API: http://localhost:${PORT}/api/terminal`);
    console.log(`🔌 Terminal WebSocket: ws://localhost:${PORT}/socket.io`);
    
    // Database API
    console.log(`🗄️  Database API: http://localhost:${PORT}/api/database`);
    console.log(`🧪 Database Test: http://localhost:${PORT}/api/database/test-connection`);
    console.log(`❤️  Database Health: http://localhost:${PORT}/api/database/health`);
    console.log(`📊 Active DB connections: ${activeConnections.size}`);
    
    // System info
    console.log(`🔧 Node.js version: ${process.version}`);
    console.log(`🖥️  Platform: ${process.platform}`);
    console.log(`🏗️  Architecture: ${process.arch}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Database drivers status
    console.log(`🐘 PostgreSQL: ${Pool ? '✅ Available' : '❌ Not available'}`);
    console.log(`🐬 MySQL: ${mysql ? '✅ Available' : '❌ Not available'}`);
    console.log(`🔶 Oracle: ⚠️  Not implemented`);
    console.log(`🏢 Sybase: ⚠️  Not implemented`);
  });
})();