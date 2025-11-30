// projectManager.js - Fixed version
// Manages projects and saved API requests

/**
 * Manages projects and their stored API requests
 */
export class ProjectManager {
  constructor() {
    // Map of projectId => project object with requests
    this.projects = {};
    
    // Currently active project
    this.activeProjectId = null;
  }
  
  /**
   * Create a new project
   * @param {string} name - Project name
   * @returns {string|null} - Project ID or null if failed
   */
  createProject(name) {
    if (!name) {
      return null;
    }
    
    const projectId = `project_${Date.now()}`;
    
    this.projects[projectId] = {
      id: projectId,
      name,
      requests: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // If this is the first project, set it as active
    if (!this.activeProjectId) {
      this.activeProjectId = projectId;
    }
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    return projectId;
  }
  
  /**
   * Get a project by ID
   * @param {string} projectId - Project ID
   * @returns {Object|null} - Project object or null if not found
   */
  getProject(projectId) {
    return this.projects[projectId] || null;
  }
  
  /**
   * Get all projects
   * @returns {Object} - Map of all projects
   */
  getAllProjects() {
    return this.projects;
  }
  
  /**
   * Get projects as an array
   * @returns {Array} - Array of project objects
   */
  getProjectsArray() {
    return Object.values(this.projects).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }
  
  /**
   * Delete a project
   * @param {string} projectId - Project ID to delete
   * @returns {boolean} - Success status
   */
  deleteProject(projectId) {
    if (!projectId || !this.projects[projectId]) {
      return false;
    }
    
    delete this.projects[projectId];
    
    // If we deleted the active project, set active to another one if available
    if (this.activeProjectId === projectId) {
      const remaining = Object.keys(this.projects);
      this.activeProjectId = remaining.length > 0 ? remaining[0] : null;
    }
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Rename a project
   * @param {string} projectId - Project ID to rename
   * @param {string} newName - New project name
   * @returns {boolean} - Success status
   */
  renameProject(projectId, newName) {
    if (!projectId || !newName || !this.projects[projectId]) {
      return false;
    }
    
    this.projects[projectId].name = newName;
    this.projects[projectId].updatedAt = new Date().toISOString();
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Get the active project
   * @returns {Object|null} - Active project or null if none
   */
  getActiveProject() {
    if (!this.activeProjectId) {
      return null;
    }
    
    return this.projects[this.activeProjectId] || null;
  }
  
  /**
   * Get the active project ID
   * @returns {string|null} - Active project ID or null if none
   */
  getActiveProjectId() {
    return this.activeProjectId;
  }
  
  /**
   * Set the active project
   * @param {string} projectId - Project ID to set as active
   * @returns {boolean} - Success status
   */
  setActiveProject(projectId) {
    if (!projectId || !this.projects[projectId]) {
      return false;
    }
    
    this.activeProjectId = projectId;
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Create a request in a project
   * @param {string} projectId - Project ID
   * @param {string} name - Request name
   * @param {Object} requestData - Request configuration data
   * @returns {string|null} - Request ID or null if failed
   */
  createRequest(projectId, name, requestData) {
    if (!projectId || !name || !requestData || !this.projects[projectId]) {
      console.error("Failed to create request: invalid parameters", { projectId, name, requestData });
      return null;
    }
    
    // Make sure all required properties are present
    if (!requestData.url || !requestData.method) {
      console.error("Failed to create request: missing required properties", requestData);
      return null;
    }
    
    const requestId = `request_${Date.now()}`;
    
    // Create a deep copy of the request data to avoid reference issues
    const requestCopy = JSON.parse(JSON.stringify({
      id: requestId,
      name,
      url: requestData.url,
      method: requestData.method,
      headers: requestData.headers || '{}',
      body: requestData.body || '',
      bodyFormat: requestData.bodyFormat || 'json',
      authType: requestData.authType || 'none',
      authDetails: requestData.authDetails || {
        username: '',
        password: '',
        token: '',
        apiKey: '',
        apiKeyName: 'X-API-Key'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    // Add the request to the project
    this.projects[projectId].requests[requestId] = requestCopy;
    
    // Update project's updatedAt timestamp
    this.projects[projectId].updatedAt = new Date().toISOString();
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    console.log("Created request:", requestCopy);
    return requestId;
  }
  
  /**
   * Get a request by ID
   * @param {string} projectId - Project ID
   * @param {string} requestId - Request ID
   * @returns {Object|null} - Request object or null if not found
   */
  getRequest(projectId, requestId) {
    if (!projectId || !requestId || !this.projects[projectId]) {
      return null;
    }
    
    const request = this.projects[projectId].requests[requestId];
    if (request) {
      console.log("Retrieved request:", request);
    }
    
    return request || null;
  }
  
  /**
   * Get all requests in a project
   * @param {string} projectId - Project ID
   * @returns {Object|null} - Map of request objects or null if project not found
   */
  getProjectRequests(projectId) {
    if (!projectId || !this.projects[projectId]) {
      return null;
    }
    
    return this.projects[projectId].requests;
  }
  
  /**
   * Get project requests as an array
   * @param {string} projectId - Project ID
   * @returns {Array} - Array of request objects
   */
  getProjectRequestsArray(projectId) {
    if (!projectId || !this.projects[projectId]) {
      return [];
    }
    
    return Object.values(this.projects[projectId].requests).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }
  
  /**
   * Update a request in a project
   * @param {string} projectId - Project ID
   * @param {string} requestId - Request ID
   * @param {Object} requestData - Updated request data
   * @returns {boolean} - Success status
   */
  updateRequest(projectId, requestId, requestData) {
    if (!projectId || !requestId || !requestData || !this.projects[projectId] || !this.projects[projectId].requests[requestId]) {
      return false;
    }
    
    // Preserve ID, name, and creation date
    const { id, name, createdAt } = this.projects[projectId].requests[requestId];
    
    // Create a deep copy with updated data
    this.projects[projectId].requests[requestId] = JSON.parse(JSON.stringify({
      id,
      name,
      createdAt,
      url: requestData.url,
      method: requestData.method,
      headers: requestData.headers || '{}',
      body: requestData.body || '',
      bodyFormat: requestData.bodyFormat || 'json',
      authType: requestData.authType || 'none',
      authDetails: requestData.authDetails || {
        username: '',
        password: '',
        token: '',
        apiKey: '',
        apiKeyName: 'X-API-Key'
      },
      updatedAt: new Date().toISOString()
    }));
    
    // Update project's updatedAt timestamp
    this.projects[projectId].updatedAt = new Date().toISOString();
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Rename a request in a project
   * @param {string} projectId - Project ID
   * @param {string} requestId - Request ID
   * @param {string} newName - New request name
   * @returns {boolean} - Success status
   */
  renameRequest(projectId, requestId, newName) {
    if (!projectId || !requestId || !newName || !this.projects[projectId] || !this.projects[projectId].requests[requestId]) {
      return false;
    }
    
    this.projects[projectId].requests[requestId].name = newName;
    this.projects[projectId].requests[requestId].updatedAt = new Date().toISOString();
    
    // Update project's updatedAt timestamp
    this.projects[projectId].updatedAt = new Date().toISOString();
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Delete a request from a project
   * @param {string} projectId - Project ID
   * @param {string} requestId - Request ID
   * @returns {boolean} - Success status
   */
  deleteRequest(projectId, requestId) {
    if (!projectId || !requestId || !this.projects[projectId] || !this.projects[projectId].requests[requestId]) {
      return false;
    }
    
    delete this.projects[projectId].requests[requestId];
    
    // Update project's updatedAt timestamp
    this.projects[projectId].updatedAt = new Date().toISOString();
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * Save projects to local storage
   * @param {string} storageKey - Key to use for localStorage
   * @returns {boolean} - Success status
   */
  saveToLocalStorage(storageKey = 'api-tester-projects') {
    try {
      const data = {
        projects: this.projects,
        activeProjectId: this.activeProjectId
      };
      
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save projects to local storage:', e);
      return false;
    }
  }
  
  /**
   * Load projects from local storage
   * @param {string} storageKey - Key to use for localStorage
   * @returns {boolean} - Success status
   */
  loadFromLocalStorage(storageKey = 'api-tester-projects') {
    try {
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) {
        return false;
      }
      
      const data = JSON.parse(stored);
      
      if (data.projects) {
        this.projects = data.projects;
        this.activeProjectId = data.activeProjectId || Object.keys(data.projects)[0] || null;
        console.log("Loaded projects from localStorage:", this.projects);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Failed to load projects from local storage:', e);
      return false;
    }
  }
}

// Create a default project manager with a sample project
export const createDefaultProjectManager = () => {
  const manager = new ProjectManager();
  
  // Try to load existing projects from localStorage
  const loaded = manager.loadFromLocalStorage();
  
  // If no projects were loaded, create a sample project
  if (!loaded || Object.keys(manager.projects).length === 0) {
    // Create a sample project
    const projectId = manager.createProject('My API Project');
    
    // Add sample requests if project was created
    if (projectId) {
      manager.createRequest(projectId, 'Get User', {
        url: 'https://jsonplaceholder.typicode.com/users/1',
        method: 'GET',
        headers: JSON.stringify({
          'Accept': 'application/json'
        }, null, 2),
        body: '',
        bodyFormat: 'json',
        authType: 'none',
        authDetails: {
          username: '',
          password: '',
          token: '',
          apiKey: '',
          apiKeyName: 'X-API-Key'
        }
      });
      
      manager.createRequest(projectId, 'Create Post', {
        url: 'https://jsonplaceholder.typicode.com/posts',
        method: 'POST',
        headers: JSON.stringify({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }, null, 2),
        body: JSON.stringify({
          title: 'New Post',
          body: 'This is the content of the post',
          userId: 1
        }, null, 2),
        bodyFormat: 'json',
        authType: 'none',
        authDetails: {
          username: '',
          password: '',
          token: '',
          apiKey: '',
          apiKeyName: 'X-API-Key'
        }
      });
    }
  }
  
  return manager;
};

export default ProjectManager;