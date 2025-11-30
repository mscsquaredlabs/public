// utils/connectionValidator.js

/**
 * Connection Validation Utility
 * 
 * Provides comprehensive validation for database connection configurations
 * with security checks, format validation, and helpful error messages.
 */

/**
 * Validate database connection configuration
 * @param {Object} connectionConfig - Connection configuration object
 * @returns {Object} Validation result with isValid flag and errors array
 */
export const validateConnection = (connectionConfig) => {
  const errors = [];
  
  if (!connectionConfig || typeof connectionConfig !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid connection configuration object']
    };
  }

  // Required fields validation
  const requiredFields = [
    { field: 'name', label: 'Connection name' },
    { field: 'type', label: 'Database type' },
    { field: 'host', label: 'Host' },
    { field: 'port', label: 'Port' },
    { field: 'database', label: 'Database name' },
    { field: 'username', label: 'Username' }
  ];

  requiredFields.forEach(({ field, label }) => {
    if (!connectionConfig[field] || 
        (typeof connectionConfig[field] === 'string' && !connectionConfig[field].trim())) {
      errors.push(`${label} is required`);
    }
  });

  // If required fields are missing, return early
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Connection name validation
  if (!validateConnectionName(connectionConfig.name)) {
    errors.push('Connection name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores');
  }

  // Database type validation
  if (!validateDatabaseType(connectionConfig.type)) {
    errors.push('Database type must be one of: postgresql, mysql, oracle, sybase');
  }

  // Host validation
  if (!validateHost(connectionConfig.host)) {
    errors.push('Host must be a valid hostname or IP address');
  }

  // Port validation
  if (!validatePort(connectionConfig.port)) {
    errors.push('Port must be a number between 1 and 65535');
  }

  // Database name validation
  if (!validateDatabaseName(connectionConfig.database)) {
    errors.push('Database name must be 1-63 characters and contain only letters, numbers, and underscores');
  }

  // Username validation
  if (!validateUsername(connectionConfig.username)) {
    errors.push('Username must be 1-63 characters and cannot contain special characters');
  }

  // Password validation (optional but if provided, should meet criteria)
  if (connectionConfig.password && !validatePassword(connectionConfig.password)) {
    errors.push('Password contains invalid characters or is too long (max 128 characters)');
  }

  // SSL validation
  if (connectionConfig.ssl !== undefined && typeof connectionConfig.ssl !== 'boolean') {
    errors.push('SSL setting must be a boolean value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate connection name
 * @param {string} name - Connection name
 * @returns {boolean} Is valid
 */
const validateConnectionName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 50) return false;
  
  // Allow letters, numbers, spaces, hyphens, underscores
  const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  return nameRegex.test(trimmedName);
};

/**
 * Validate database type
 * @param {string} type - Database type
 * @returns {boolean} Is valid
 */
const validateDatabaseType = (type) => {
  const validTypes = ['postgresql', 'mysql', 'oracle', 'sybase'];
  return validTypes.includes(type?.toLowerCase());
};

/**
 * Validate host (hostname or IP address)
 * @param {string} host - Host
 * @returns {boolean} Is valid
 */
const validateHost = (host) => {
  if (!host || typeof host !== 'string') return false;
  
  const trimmedHost = host.trim();
  if (trimmedHost.length < 1 || trimmedHost.length > 253) return false;
  
  // Check for valid hostname or IP address
  return validateHostname(trimmedHost) || validateIPAddress(trimmedHost);
};

/**
 * Validate hostname
 * @param {string} hostname - Hostname
 * @returns {boolean} Is valid
 */
const validateHostname = (hostname) => {
  if (hostname === 'localhost') return true;
  
  // RFC 1123 hostname validation
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(hostname);
};

/**
 * Validate IP address (IPv4 or IPv6)
 * @param {string} ip - IP address
 * @returns {boolean} Is valid
 */
const validateIPAddress = (ip) => {
  return validateIPv4(ip) || validateIPv6(ip);
};

/**
 * Validate IPv4 address
 * @param {string} ip - IPv4 address
 * @returns {boolean} Is valid
 */
const validateIPv4 = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

/**
 * Validate IPv6 address (basic validation)
 * @param {string} ip - IPv6 address
 * @returns {boolean} Is valid
 */
const validateIPv6 = (ip) => {
  // Basic IPv6 validation - more complex validation would be needed for production
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  return ipv6Regex.test(ip);
};

/**
 * Validate port number
 * @param {string|number} port - Port number
 * @returns {boolean} Is valid
 */
const validatePort = (port) => {
  const portNum = parseInt(port, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
};

/**
 * Validate database name
 * @param {string} database - Database name
 * @returns {boolean} Is valid
 */
const validateDatabaseName = (database) => {
  if (!database || typeof database !== 'string') return false;
  
  const trimmedDatabase = database.trim();
  if (trimmedDatabase.length < 1 || trimmedDatabase.length > 63) return false;
  
  // Allow letters, numbers, underscores, hyphens (common across most databases)
  const databaseRegex = /^[a-zA-Z0-9_\-]+$/;
  return databaseRegex.test(trimmedDatabase);
};

/**
 * Validate username
 * @param {string} username - Username
 * @returns {boolean} Is valid
 */
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  
  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 1 || trimmedUsername.length > 63) return false;
  
  // Allow letters, numbers, underscores, dots, hyphens
  const usernameRegex = /^[a-zA-Z0-9_.\-]+$/;
  return usernameRegex.test(trimmedUsername);
};

/**
 * Validate password
 * @param {string} password - Password
 * @returns {boolean} Is valid
 */
const validatePassword = (password) => {
  if (typeof password !== 'string') return false;
  
  // Allow empty password (some databases allow this)
  if (password.length === 0) return true;
  
  // Check maximum length (128 characters is reasonable for most databases)
  if (password.length > 128) return false;
  
  // Check for null bytes and other problematic characters
  if (password.includes('\0') || password.includes('\r') || password.includes('\n')) {
    return false;
  }
  
  return true;
};

/**
 * Validate connection configuration for specific database types
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Object} Validation result with database-specific checks
 */
export const validateConnectionForDatabaseType = (connectionConfig) => {
  const baseValidation = validateConnection(connectionConfig);
  
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  const errors = [];
  const type = connectionConfig.type?.toLowerCase();
  
  switch (type) {
    case 'postgresql':
      errors.push(...validatePostgreSQLConnection(connectionConfig));
      break;
    case 'mysql':
      errors.push(...validateMySQLConnection(connectionConfig));
      break;
    case 'oracle':
      errors.push(...validateOracleConnection(connectionConfig));
      break;
    case 'sybase':
      errors.push(...validateSybaseConnection(connectionConfig));
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * PostgreSQL-specific validation
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Array} Array of validation errors
 */
const validatePostgreSQLConnection = (connectionConfig) => {
  const errors = [];
  
  // PostgreSQL default port check
  const port = parseInt(connectionConfig.port, 10);
  if (port !== 5432) {
    // This is just a warning, not an error
    console.warn('PostgreSQL typically uses port 5432');
  }
  
  // PostgreSQL database name rules are stricter
  if (connectionConfig.database && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(connectionConfig.database)) {
    errors.push('PostgreSQL database name must start with a letter and contain only letters, numbers, and underscores');
  }
  
  return errors;
};

/**
 * MySQL-specific validation
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Array} Array of validation errors
 */
const validateMySQLConnection = (connectionConfig) => {
  const errors = [];
  
  // MySQL default port check
  const port = parseInt(connectionConfig.port, 10);
  if (port !== 3306) {
    console.warn('MySQL typically uses port 3306');
  }
  
  // MySQL database name validation
  if (connectionConfig.database && connectionConfig.database.length > 64) {
    errors.push('MySQL database name cannot exceed 64 characters');
  }
  
  return errors;
};

/**
 * Oracle-specific validation
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Array} Array of validation errors
 */
const validateOracleConnection = (connectionConfig) => {
  const errors = [];
  
  // Oracle default port check
  const port = parseInt(connectionConfig.port, 10);
  if (port !== 1521) {
    console.warn('Oracle typically uses port 1521');
  }
  
  // Oracle service name/SID validation
  if (connectionConfig.database && connectionConfig.database.length > 30) {
    errors.push('Oracle service name/SID cannot exceed 30 characters');
  }
  
  return errors;
};

/**
 * Sybase-specific validation
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Array} Array of validation errors
 */
const validateSybaseConnection = (connectionConfig) => {
  const errors = [];
  
  // Sybase default port check
  const port = parseInt(connectionConfig.port, 10);
  if (port !== 5000) {
    console.warn('Sybase typically uses port 5000');
  }
  
  return errors;
};

/**
 * Sanitize connection configuration for security
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Object} Sanitized connection configuration
 */
export const sanitizeConnectionConfig = (connectionConfig) => {
  if (!connectionConfig || typeof connectionConfig !== 'object') {
    return {};
  }
  
  return {
    id: connectionConfig.id || '',
    name: sanitizeString(connectionConfig.name, 50),
    type: sanitizeString(connectionConfig.type, 20).toLowerCase(),
    host: sanitizeString(connectionConfig.host, 253),
    port: sanitizePort(connectionConfig.port),
    database: sanitizeString(connectionConfig.database, 63),
    username: sanitizeString(connectionConfig.username, 63),
    password: sanitizePassword(connectionConfig.password),
    ssl: Boolean(connectionConfig.ssl),
    createdAt: connectionConfig.createdAt || new Date().toISOString(),
    lastUsed: connectionConfig.lastUsed || new Date().toISOString(),
    lastModified: connectionConfig.lastModified || new Date().toISOString()
  };
};

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} Sanitized string
 */
const sanitizeString = (input, maxLength = 255) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\0\r\n]/g, ''); // Remove null bytes and newlines
};

/**
 * Sanitize port input
 * @param {string|number} port - Port input
 * @returns {string} Sanitized port
 */
const sanitizePort = (port) => {
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return '5432'; // Default to PostgreSQL port
  }
  return portNum.toString();
};

/**
 * Sanitize password input
 * @param {string} password - Password input
 * @returns {string} Sanitized password
 */
const sanitizePassword = (password) => {
  if (typeof password !== 'string') return '';
  
  return password
    .slice(0, 128) // Limit length
    .replace(/[\0\r\n]/g, ''); // Remove problematic characters
};

/**
 * Test connection configuration (dry run validation)
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Object} Test result
 */
export const testConnectionConfig = (connectionConfig) => {
  const validation = validateConnectionForDatabaseType(connectionConfig);
  const sanitized = sanitizeConnectionConfig(connectionConfig);
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: [], // Could add warnings here
    sanitizedConfig: sanitized,
    recommendations: getConnectionRecommendations(connectionConfig)
  };
};

/**
 * Get connection recommendations
 * @param {Object} connectionConfig - Connection configuration
 * @returns {Array} Array of recommendations
 */
const getConnectionRecommendations = (connectionConfig) => {
  const recommendations = [];
  
  if (!connectionConfig.ssl) {
    recommendations.push('Consider enabling SSL for secure connections');
  }
  
  if (connectionConfig.password && connectionConfig.password.length < 8) {
    recommendations.push('Consider using a stronger password (8+ characters)');
  }
  
  if (connectionConfig.host === 'localhost' || connectionConfig.host === '127.0.0.1') {
    recommendations.push('Localhost connections are only accessible from this machine');
  }
  
  return recommendations;
};

export default {
  validateConnection,
  validateConnectionForDatabaseType,
  sanitizeConnectionConfig,
  testConnectionConfig
};