// src/shared/services/terminalWS.js
// WebSocket-based terminal service client
import { io } from 'socket.io-client';

class TerminalWSClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.sessions = new Map();
  }

  connect() {
    if (this.socket && this.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const socketUrl = window.location.origin;
        this.socket = io(socketUrl, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
          console.log('[Terminal WS] Connected to server');
          this.connected = true;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('[Terminal WS] Disconnected from server');
          this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('[Terminal WS] Connection error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('[Terminal WS] Failed to connect:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  createSession(sessionId, shellType = 'bash', cwd = null) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        this.connect().then(() => {
          this.createSession(sessionId, shellType, cwd).then(resolve).catch(reject);
        }).catch(reject);
        return;
      }

      const handlers = {
        onData: null,
        onExit: null,
        onError: null
      };

      // Set up event listeners
      this.socket.on('terminal:created', (data) => {
        if (data.sessionId === sessionId) {
          resolve({
            sessionId,
            write: (data) => this.write(sessionId, data),
            resize: (cols, rows) => this.resize(sessionId, cols, rows),
            kill: () => this.kill(sessionId),
            on: (event, callback) => {
              if (event === 'data') handlers.onData = callback;
              if (event === 'exit') handlers.onExit = callback;
              if (event === 'error') handlers.onError = callback;
            },
            off: () => {
              handlers.onData = null;
              handlers.onExit = null;
              handlers.onError = null;
            }
          });
        }
      });

      this.socket.on('terminal:data', (data) => {
        if (data.sessionId === sessionId && handlers.onData) {
          handlers.onData(data.data);
        }
      });

      this.socket.on('terminal:exit', (data) => {
        if (data.sessionId === sessionId && handlers.onExit) {
          handlers.onExit(data.code);
          this.sessions.delete(sessionId);
        }
      });

      this.socket.on('terminal:error', (data) => {
        if (data.sessionId === sessionId && handlers.onError) {
          handlers.onError(data.error);
        }
      });

      // Create the terminal session
      this.socket.emit('terminal:create', { sessionId, shellType, cwd });
      this.sessions.set(sessionId, { handlers });
    });
  }

  write(sessionId, data) {
    if (this.connected) {
      this.socket.emit('terminal:input', { sessionId, input: data });
    }
  }

  resize(sessionId, cols, rows) {
    if (this.connected) {
      this.socket.emit('terminal:resize', { sessionId, cols, rows });
    }
  }

  kill(sessionId) {
    if (this.connected) {
      this.socket.emit('terminal:kill', { sessionId });
      this.sessions.delete(sessionId);
    }
  }
}

// Browse directory
export async function browseDirectory(path) {
  try {
    const response = await fetch('/api/terminal/browse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

// Run executable/batch file
export async function runExecutable(filePath, args = [], cwd = null) {
  try {
    const response = await fetch('/api/terminal/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, args, cwd })
    });
    return await response.json();
  } catch (error) {
    return { error: error.message, success: false };
  }
}

// Singleton instance
const terminalWSClient = new TerminalWSClient();

export default terminalWSClient;



