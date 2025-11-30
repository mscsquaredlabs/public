// server/terminal-ws.js
// WebSocket-based terminal service with PTY support
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Store active terminal sessions
const terminalSessions = new Map();

/**
 * Initialize WebSocket terminal server
 * @param {http.Server} httpServer - HTTP server instance
 */
export function initializeTerminalWS(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: '/socket.io'
  });

  io.on('connection', (socket) => {
    console.log(`[Terminal WS] Client connected: ${socket.id}`);

    // Create a new terminal session
    socket.on('terminal:create', async (data) => {
      const { sessionId, shellType, cwd } = data;
      console.log(`[Terminal WS] Creating terminal session: ${sessionId}, shell: ${shellType}, cwd: ${cwd}`);

      try {
        const workingDir = cwd || (os.platform() === 'win32' ? 'C:\\' : os.homedir());
        
        // Determine shell and arguments based on platform and shell type
        let shell, args, env;
        
        if (os.platform() === 'win32') {
          switch (shellType) {
            case 'powershell':
              shell = 'powershell.exe';
              args = ['-NoLogo', '-NoProfile'];
              break;
            case 'cmd':
              shell = 'cmd.exe';
              args = [];
              break;
            default:
              shell = 'cmd.exe';
              args = [];
          }
        } else {
          switch (shellType) {
            case 'bash':
              shell = '/bin/bash';
              args = [];
              break;
            case 'zsh':
              shell = '/bin/zsh';
              args = [];
              break;
            default:
              shell = '/bin/sh';
              args = [];
          }
        }

        // Create child process
        const pty = spawn(shell, args, {
          cwd: workingDir,
          env: { ...process.env },
          shell: false,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Store session
        terminalSessions.set(sessionId, {
          pty,
          socketId: socket.id,
          cwd: workingDir,
          shellType,
          createdAt: new Date()
        });

        // Handle stdout
        pty.stdout.on('data', (data) => {
          socket.emit('terminal:data', {
            sessionId,
            data: data.toString()
          });
        });

        // Handle stderr
        pty.stderr.on('data', (data) => {
          socket.emit('terminal:data', {
            sessionId,
            data: data.toString()
          });
        });

        // Handle process exit
        pty.on('exit', (code) => {
          console.log(`[Terminal WS] Terminal ${sessionId} exited with code ${code}`);
          socket.emit('terminal:exit', {
            sessionId,
            code
          });
          terminalSessions.delete(sessionId);
        });

        // Handle process error
        pty.on('error', (error) => {
          console.error(`[Terminal WS] Terminal ${sessionId} error:`, error);
          socket.emit('terminal:error', {
            sessionId,
            error: error.message
          });
        });

        // Send initial welcome message
        socket.emit('terminal:created', {
          sessionId,
          shellType,
          cwd: workingDir
        });

      } catch (error) {
        console.error(`[Terminal WS] Error creating terminal:`, error);
        socket.emit('terminal:error', {
          sessionId,
          error: error.message
        });
      }
    });

    // Write to terminal
    socket.on('terminal:input', (data) => {
      const { sessionId, input } = data;
      const session = terminalSessions.get(sessionId);
      
      if (session && session.pty && !session.pty.killed) {
        session.pty.stdin.write(input);
      } else {
        socket.emit('terminal:error', {
          sessionId,
          error: 'Terminal session not found or terminated'
        });
      }
    });

    // Resize terminal
    socket.on('terminal:resize', (data) => {
      const { sessionId, cols, rows } = data;
      const session = terminalSessions.get(sessionId);
      
      if (session && session.pty && !session.pty.killed) {
        // Note: resize requires node-pty for proper support
        // For now, we'll just acknowledge the resize
        socket.emit('terminal:resized', { sessionId });
      }
    });

    // Kill terminal
    socket.on('terminal:kill', (data) => {
      const { sessionId } = data;
      const session = terminalSessions.get(sessionId);
      
      if (session && session.pty && !session.pty.killed) {
        session.pty.kill();
        terminalSessions.delete(sessionId);
        socket.emit('terminal:killed', { sessionId });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Terminal WS] Client disconnected: ${socket.id}`);
      
      // Clean up all sessions for this socket
      for (const [sessionId, session] of terminalSessions.entries()) {
        if (session.socketId === socket.id) {
          if (session.pty && !session.pty.killed) {
            session.pty.kill();
          }
          terminalSessions.delete(sessionId);
        }
      }
    });
  });

  return io;
}

/**
 * Get file system information for browsing
 */
export function browseDirectory(dirPath) {
  try {
    const resolvedPath = path.resolve(dirPath);
    
    if (!fs.existsSync(resolvedPath)) {
      return { error: 'Directory does not exist' };
    }

    const stats = fs.statSync(resolvedPath);
    if (!stats.isDirectory()) {
      return { error: 'Path is not a directory' };
    }

    const items = fs.readdirSync(resolvedPath).map(item => {
      const itemPath = path.join(resolvedPath, item);
      const itemStats = fs.statSync(itemPath);
      
      return {
        name: item,
        path: itemPath,
        type: itemStats.isDirectory() ? 'directory' : 'file',
        size: itemStats.isFile() ? itemStats.size : null,
        modified: itemStats.mtime
      };
    });

    return {
      path: resolvedPath,
      items: items.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Run a batch file or executable
 */
export function runExecutable(filePath, args = [], cwd = null) {
  return new Promise((resolve, reject) => {
    try {
      const resolvedPath = path.resolve(filePath);
      
      if (!fs.existsSync(resolvedPath)) {
        reject(new Error('File does not exist'));
        return;
      }

      const workingDir = cwd || path.dirname(resolvedPath);
      const isWindows = os.platform() === 'win32';
      
      // Determine how to run the file
      let command, commandArgs;
      
      if (isWindows) {
        const ext = path.extname(resolvedPath).toLowerCase();
        if (ext === '.bat' || ext === '.cmd') {
          command = resolvedPath;
          commandArgs = args;
        } else if (ext === '.ps1') {
          command = 'powershell.exe';
          commandArgs = ['-ExecutionPolicy', 'Bypass', '-File', resolvedPath, ...args];
        } else if (ext === '.exe') {
          command = resolvedPath;
          commandArgs = args;
        } else {
          // Try to execute directly
          command = resolvedPath;
          commandArgs = args;
        }
      } else {
        // Unix-like systems
        const stats = fs.statSync(resolvedPath);
        if (stats.mode & 0o111) {
          // Executable
          command = resolvedPath;
          commandArgs = args;
        } else {
          // Try to run with appropriate interpreter
          const ext = path.extname(resolvedPath).toLowerCase();
          if (ext === '.sh') {
            command = '/bin/bash';
            commandArgs = [resolvedPath, ...args];
          } else {
            command = resolvedPath;
            commandArgs = args;
          }
        }
      }

      const process = spawn(command, commandArgs, {
        cwd: workingDir,
        env: { ...process.env },
        shell: false,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0
        });
      });

      process.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}



