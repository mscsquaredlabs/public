// environmentManager.js
// Responsible for managing environment variables in the API Tester

/**
 * Handles creating, updating, and using environment variables
 */
export class EnvironmentManager {
    constructor(initialEnvironments = {}) {
      // Map of named environments with their variables
      this.environments = initialEnvironments;
      
      // Current active environment name
      this.activeEnvironment = Object.keys(initialEnvironments)[0] || null;
    }
    
    /**
     * Get all available environments
     * @returns {Object} - Map of all environments
     */
    getAllEnvironments() {
      return this.environments;
    }
    
    /**
     * Get environment names as an array
     * @returns {string[]} - Array of environment names
     */
    getEnvironmentNames() {
      return Object.keys(this.environments);
    }
    
    /**
     * Create a new environment
     * @param {string} name - Environment name
     * @param {Object} variables - Initial variables (optional)
     * @returns {boolean} - Success status
     */
    createEnvironment(name, variables = {}) {
      if (!name || this.environments[name]) {
        return false;
      }
      
      this.environments[name] = variables;
      
      // If this is the first environment, make it active
      if (!this.activeEnvironment) {
        this.activeEnvironment = name;
      }
      
      return true;
    }
    
    /**
     * Get the active environment
     * @returns {Object} - Currently active environment variables
     */
    getActiveEnvironment() {
      if (!this.activeEnvironment) {
        return {};
      }
      
      return this.environments[this.activeEnvironment] || {};
    }
    
    /**
     * Get the active environment name
     * @returns {string|null} - Name of active environment or null
     */
    getActiveEnvironmentName() {
      return this.activeEnvironment;
    }
    
    /**
     * Set the active environment
     * @param {string} name - Environment name to set as active
     * @returns {boolean} - Success status
     */
    setActiveEnvironment(name) {
      if (!name || !this.environments[name]) {
        return false;
      }
      
      this.activeEnvironment = name;
      return true;
    }
    
    /**
     * Delete an environment
     * @param {string} name - Environment name to delete
     * @returns {boolean} - Success status
     */
    deleteEnvironment(name) {
      if (!name || !this.environments[name]) {
        return false;
      }
      
      delete this.environments[name];
      
      // If we deleted the active environment, set active to another one if available
      if (this.activeEnvironment === name) {
        const remaining = Object.keys(this.environments);
        this.activeEnvironment = remaining.length > 0 ? remaining[0] : null;
      }
      
      return true;
    }
    
    /**
     * Rename an environment
     * @param {string} oldName - Current environment name
     * @param {string} newName - New environment name
     * @returns {boolean} - Success status
     */
    renameEnvironment(oldName, newName) {
      if (!oldName || !newName || !this.environments[oldName] || this.environments[newName]) {
        return false;
      }
      
      // Create environment with new name and copy variables
      this.environments[newName] = { ...this.environments[oldName] };
      
      // Delete old environment
      delete this.environments[oldName];
      
      // Update active environment if needed
      if (this.activeEnvironment === oldName) {
        this.activeEnvironment = newName;
      }
      
      return true;
    }
    
    /**
     * Get a variable value from the active environment
     * @param {string} key - Variable name
     * @returns {string|null} - Variable value or null if not found
     */
    getVariable(key) {
      if (!key || !this.activeEnvironment) {
        return null;
      }
      
      const env = this.environments[this.activeEnvironment];
      return env && env[key] !== undefined ? env[key] : null;
    }
    
    /**
     * Set a variable in the active environment
     * @param {string} key - Variable name
     * @param {string} value - Variable value
     * @returns {boolean} - Success status
     */
    setVariable(key, value) {
      if (!key || !this.activeEnvironment) {
        return false;
      }
      
      if (!this.environments[this.activeEnvironment]) {
        this.environments[this.activeEnvironment] = {};
      }
      
      this.environments[this.activeEnvironment][key] = value;
      return true;
    }
    
    /**
     * Delete a variable from the active environment
     * @param {string} key - Variable name to delete
     * @returns {boolean} - Success status
     */
    deleteVariable(key) {
      if (!key || !this.activeEnvironment || !this.environments[this.activeEnvironment]) {
        return false;
      }
      
      if (this.environments[this.activeEnvironment][key] !== undefined) {
        delete this.environments[this.activeEnvironment][key];
        return true;
      }
      
      return false;
    }
    
    /**
     * Set multiple variables at once in the active environment
     * @param {Object} variables - Object containing multiple variables
     * @returns {boolean} - Success status
     */
    setVariables(variables) {
      if (!variables || !this.activeEnvironment) {
        return false;
      }
      
      if (!this.environments[this.activeEnvironment]) {
        this.environments[this.activeEnvironment] = {};
      }
      
      this.environments[this.activeEnvironment] = { 
        ...this.environments[this.activeEnvironment], 
        ...variables 
      };
      
      return true;
    }
    
    /**
     * Export all environments as JSON
     * @returns {string} - JSON string representation of all environments
     */
    exportEnvironments() {
      return JSON.stringify(this.environments, null, 2);
    }
    
    /**
     * Import environments from JSON
     * @param {string} json - JSON string containing environments
     * @returns {boolean} - Success status
     */
    importEnvironments(json) {
      try {
        const imported = JSON.parse(json);
        
        if (typeof imported !== 'object') {
          return false;
        }
        
        this.environments = imported;
        
        // Set active environment to first one if current active doesn't exist
        if (!this.environments[this.activeEnvironment]) {
          const firstEnv = Object.keys(this.environments)[0];
          this.activeEnvironment = firstEnv || null;
        }
        
        return true;
      } catch (e) {
        console.error('Failed to import environments:', e);
        return false;
      }
    }
    
    /**
     * Save environments to local storage
     * @param {string} storageKey - Key to use for localStorage
     * @returns {boolean} - Success status
     */
    saveToLocalStorage(storageKey = 'api-tester-environments') {
      try {
        const data = {
          environments: this.environments,
          activeEnvironment: this.activeEnvironment
        };
        
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Failed to save environments to local storage:', e);
        return false;
      }
    }
    
    /**
     * Load environments from local storage
     * @param {string} storageKey - Key to use for localStorage
     * @returns {boolean} - Success status
     */
    loadFromLocalStorage(storageKey = 'api-tester-environments') {
      try {
        const stored = localStorage.getItem(storageKey);
        
        if (!stored) {
          return false;
        }
        
        const data = JSON.parse(stored);
        
        if (data.environments) {
          this.environments = data.environments;
          this.activeEnvironment = data.activeEnvironment || Object.keys(data.environments)[0] || null;
          return true;
        }
        
        return false;
      } catch (e) {
        console.error('Failed to load environments from local storage:', e);
        return false;
      }
    }
  }
  
  // Create a default environment manager instance with sample environments
  export const createDefaultEnvironmentManager = () => {
    const manager = new EnvironmentManager();
    
    // Development environment example
    manager.createEnvironment('Development', {
      baseUrl: 'https://dev-api.example.com',
      apiKey: 'dev-api-key-123',
      username: 'dev-user',
      password: 'dev-password'
    });
    
    // Staging environment example
    manager.createEnvironment('Staging', {
      baseUrl: 'https://staging-api.example.com',
      apiKey: 'staging-api-key-456',
      username: 'staging-user',
      password: 'staging-password'
    });
    
    // Production environment example
    manager.createEnvironment('Production', {
      baseUrl: 'https://api.example.com',
      apiKey: 'prod-api-key-789',
      username: 'prod-user',
      password: 'prod-password'
    });
    
    // Set Development as the active environment
    manager.setActiveEnvironment('Development');
    
    return manager;
  };
  
  export default EnvironmentManager;