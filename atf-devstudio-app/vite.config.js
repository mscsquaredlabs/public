// vite.config.js - Updated with your existing configuration + database fixes
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for global variable issues in some packages
    global: 'globalThis',
  },
  resolve: {
    // This helps with certain library imports like JSZip
    mainFields: ['browser', 'module', 'main'],
    alias: {
      // Add any path aliases here if needed
    },
  },
  optimizeDeps: {
    include: [
      // Pre-bundle these dependencies
      'jszip',
      'react-router-dom',
      'lodash',
      'papaparse',
      'yaml',
      'js-yaml',
      'xml-formatter',
      'xml2js',
      'axios',
    ],
    // Exclude database packages from bundling (they should be used in backend only)
    exclude: [
      'oracledb', 
      'pg', 
      'mysql2', 
      'mssql',
      'tedious', // SQL Server driver dependency
      'oci-common',
      'oci-objectstorage',
      'oci-secrets',
      '@azure/app-configuration',
      '@azure/keyvault-secrets'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Mark database packages as external to prevent bundling errors
      external: [
        'oracledb',
        'pg',
        'mysql2', 
        'mssql',
        'tedious',
        'oci-common',
        'oci-objectstorage', 
        'oci-secrets',
        '@azure/app-configuration',
        '@azure/keyvault-secrets'
      ],
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['jszip', 'lodash', 'papaparse', 'yaml', 'js-yaml']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Database API proxy - ADD THIS
      '/api/database': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res, options) => {
            // Preserve authorization header for database connections
            const auth = req.headers.authorization;
            if (auth) {
              proxyReq.setHeader('Authorization', auth);
            }
            // Set content type for JSON requests
            if (req.headers['content-type']) {
              proxyReq.setHeader('Content-Type', req.headers['content-type']);
            }
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('Database API Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({ 
              error: 'Database API Proxy error: ' + err.message 
            }));
          });
        }
      },
      // Terminal API proxy
      '/api/terminal': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Views API proxy
      '/api/views': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Tomcat Manager API proxy
      '/manager': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Configure proxy to handle preflight requests (OPTIONS)
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res, options) => {
            // Preserve authorization header
            const auth = req.headers.authorization;
            if (auth) {
              proxyReq.setHeader('Authorization', auth);
            }
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('Tomcat Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            res.end('Tomcat Proxy error: ' + err.message);
          });
        }
      },
      // WildFly Management API proxy
      '/management': {
        target: 'http://localhost:9990',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res, options) => {
            // Preserve authorization header
            const auth = req.headers.authorization;
            if (auth) {
              proxyReq.setHeader('Authorization', auth);
            }
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('WildFly Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            res.end('WildFly Proxy error: ' + err.message);
          });
        }
      }
    }
  }
});