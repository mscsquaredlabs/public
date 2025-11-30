import React, { useState, useEffect } from 'react';
import './ApiTester.css';
import './ApiTesterAdvanced.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import PostmanImport from './PostmanImport';

const ApiTesterConfig = ({
  configMode, setConfigMode,
  requestHistory, loadRequest,
  authType, setAuthType,
  authDetails, setAuthDetails,
  loadExampleRequest,
  // New props for advanced features
  projectManager,
  environmentManager,
  responseHistoryManager,
  onSaveRequest,
  onLoadRequest,
  onDeleteRequest,
  onCreateProject,
  onDeleteProject,
  activeRequest,
  suggestName,
  onCompareResponses
}) => {
  // Sample request examples
  const requestExamples = {
    getJson: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
      headers: '{\n  "Accept": "application/json"\n}',
      body: '',
      bodyFormat: 'json'
    },
    postJson: {
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      headers: '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}',
      body: '{\n  "title": "Test Post",\n  "body": "This is a test post",\n  "userId": 1\n}',
      bodyFormat: 'json'
    },
    putJson: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'PUT',
      headers: '{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}',
      body: '{\n  "id": 1,\n  "title": "Updated Post",\n  "body": "This post has been updated",\n  "userId": 1\n}',
      bodyFormat: 'json'
    },
    deleteRequest: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'DELETE',
      headers: '{\n  "Accept": "application/json"\n}',
      body: '',
      bodyFormat: 'json'
    }
  };

  // State for new UI elements
  const [activeTab, setActiveTab] = useState('general');
  const [newProjectName, setNewProjectName] = useState('');
  const [newRequestName, setNewRequestName] = useState('');
  const [newEnvironmentName, setNewEnvironmentName] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState(
    environmentManager ? environmentManager.getActiveEnvironmentName() : null
  );
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [selectedProject, setSelectedProject] = useState(
    projectManager ? projectManager.getActiveProjectId() : null
  );
  const [responseHistorySize, setResponseHistorySize] = useState(
    responseHistoryManager ? responseHistoryManager.maxHistoryPerRequest : 10
  );
  const [selectedResponseId, setSelectedResponseId] = useState(null);
  const [selectedCompareResponseId, setSelectedCompareResponseId] = useState(null);
  const [authHelperEnabled, setAuthHelperEnabled] = useState(authType !== 'none');

  // Effect to update selected project when projectManager changes
  useEffect(() => {
    if (projectManager) {
      setSelectedProject(projectManager.getActiveProjectId());
    }
  }, [projectManager]);

  // Effect to update selected environment when environmentManager changes
  useEffect(() => {
    if (environmentManager) {
      setSelectedEnvironment(environmentManager.getActiveEnvironmentName());
    }
  }, [environmentManager]);

  // Effect to automatically suggest a name when the Save Current Request section is focused
  useEffect(() => {
    if (suggestName && activeRequest && selectedProject) {
      const suggested = suggestName();
      if (suggested && !newRequestName) {
        setNewRequestName(suggested);
      }
    }
  }, [selectedProject, activeRequest, suggestName, newRequestName]);

  // Handler for environment selection
  const handleEnvironmentChange = (e) => {
    const envName = e.target.value;
    setSelectedEnvironment(envName);
    
    if (environmentManager) {
      environmentManager.setActiveEnvironment(envName);
    }
  };

  // Handler for project selection
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    
    if (projectManager) {
      projectManager.setActiveProject(projectId);
    }
  };

  // Handler for creating a new project
  const handleCreateProject = () => {
    if (!newProjectName.trim() || !projectManager) return;
    
    const projectId = projectManager.createProject(newProjectName);
    
    if (projectId) {
      setSelectedProject(projectId);
      setNewProjectName('');
      
      if (onCreateProject) {
        onCreateProject(projectId);
      }
    }
  };

  // Handler for creating a new environment
  const handleCreateEnvironment = () => {
    if (!newEnvironmentName.trim() || !environmentManager) return;
    
    const success = environmentManager.createEnvironment(newEnvironmentName);
    
    if (success) {
      setSelectedEnvironment(newEnvironmentName);
      setNewEnvironmentName('');
    }
  };

  // Handler for adding a new environment variable
  const handleAddVariable = () => {
    if (!newVarKey.trim() || !environmentManager || !selectedEnvironment) return;
    
    environmentManager.setVariable(newVarKey, newVarValue);
    
    setNewVarKey('');
    setNewVarValue('');
  };

  // Handler for deleting an environment variable
  const handleDeleteVariable = (key) => {
    if (!environmentManager || !selectedEnvironment) return;
    
    environmentManager.deleteVariable(key);
    
    // Force UI update
    setNewVarKey(newVarKey + ' ');
    setTimeout(() => setNewVarKey(newVarKey.trim()), 0);
  };

  // Handler for saving a request
  const handleSaveRequest = () => {
    if (!projectManager || !selectedProject || !activeRequest) {
      console.error("Cannot save request: missing projectManager, selectedProject, or activeRequest");
      return;
    }
    
    // Make sure we have a name (use suggested if empty)
    if (!newRequestName.trim() && suggestName) {
      setNewRequestName(suggestName());
    }
    
    const requestName = newRequestName.trim() || 'Unnamed Request';
    
    // Prepare a clean request object with all necessary properties
    const requestToSave = {
      url: activeRequest.url,
      method: activeRequest.method,
      headers: activeRequest.headers,
      body: activeRequest.body || '',
      bodyFormat: activeRequest.bodyFormat || 'json',
      authType: activeRequest.authType || 'none',
      authDetails: {
        username: activeRequest.authDetails?.username || '',
        password: activeRequest.authDetails?.password || '',
        token: activeRequest.authDetails?.token || '',
        apiKey: activeRequest.authDetails?.apiKey || '',
        apiKeyName: activeRequest.authDetails?.apiKeyName || 'X-API-Key'
      }
    };
    
    // Log what we're about to save
    console.log("Saving request:", requestName, requestToSave);
    
    // Call projectManager to create the request
    const requestId = projectManager.createRequest(selectedProject, requestName, requestToSave);
    
    if (requestId) {
      console.log("Successfully saved request with ID:", requestId);
      
      // Call the provided callback if available
      if (onSaveRequest) {
        onSaveRequest(selectedProject, requestId);
      }
      
      // Reset the name input
      setNewRequestName('');
      
      // Show success message
      alert(`Request "${requestName}" saved successfully!`);
    } else {
      console.error("Failed to save request");
      alert("Failed to save request. Please check the console for details.");
    }
  };

  // Suggest a name for the current request
  const suggestRequestName = () => {
    if (suggestName && typeof suggestName === 'function') {
      const suggested = suggestName();
      if (suggested) {
        setNewRequestName(suggested);
      }
    }
  };

  // Handler for loading a request
  const handleLoadSavedRequest = (projectId, requestId) => {
    if (!projectManager) return;
    
    const request = projectManager.getRequest(projectId, requestId);
    
    if (request && onLoadRequest) {
      onLoadRequest(request);
    }
  };

  // Handler for deleting a request
  const handleDeleteRequest = (projectId, requestId) => {
    if (!projectManager) return;
    
    const success = projectManager.deleteRequest(projectId, requestId);
    
    if (success && onDeleteRequest) {
      onDeleteRequest(projectId, requestId);
    }
  };

  // Handler for Postman import completion
  const handlePostmanImportComplete = (result) => {
    if (result.success) {
      console.log('Postman collection imported successfully:', result);
      
      // Set the imported project as active
      if (projectManager && result.projectId) {
        projectManager.setActiveProject(result.projectId);
        setSelectedProject(result.projectId);
      }
      
      // Change to projects tab if requested
      if (result.action === 'view-project') {
        setTimeout(() => {
          setActiveTab('projects');
        }, 100);
      }
    }
  };

  // Helper for rendering environment variables
  const renderEnvironmentVariables = () => {
    if (!environmentManager || !selectedEnvironment) return null;
    
    const variables = environmentManager.getActiveEnvironment();
    
    if (!variables || Object.keys(variables).length === 0) {
      return <div className="empty-message">No variables defined</div>;
    }
    
    return (
      <div className="variable-list">
        {Object.entries(variables).map(([key, value]) => (
          <div key={key} className="variable-item">
            <div className="variable-key">{key}</div>
            <div className="variable-value">{value}</div>
            <button 
              className="delete-button"
              onClick={() => handleDeleteVariable(key)}
              title="Delete variable"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Helper for rendering projects and their requests
  const renderProjects = () => {
    if (!projectManager) return null;
    
    const projects = projectManager.getProjectsArray();
    
    if (projects.length === 0) {
      return <div className="empty-message">No projects defined</div>;
    }
    
    return (
      <div className="projects-container">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <div className="project-title">{project.name}</div>
              <button 
                className="delete-button"
                onClick={() => {
                  if (window.confirm(`Delete project "${project.name}" and all its requests?`)) {
                    projectManager.deleteProject(project.id);
                    if (onDeleteProject) onDeleteProject(project.id);
                  }
                }}
                title="Delete project"
              >
                ×
              </button>
            </div>
            <div className="request-list">
              {Object.values(project.requests).length > 0 ? (
                Object.values(project.requests).map(request => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <div className="request-name">
                        <span className={`method-badge method-${request.method.toLowerCase()}`}>{request.method}</span>
                        {request.name}
                      </div>
                      <div className="request-url">{request.url}</div>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="action-btn btn-load"
                        onClick={() => handleLoadSavedRequest(project.id, request.id)}
                        title="Load request"
                      >
                        Load
                      </button>
                      <button 
                        className="action-btn btn-delete"
                        onClick={() => handleDeleteRequest(project.id, request.id)}
                        title="Delete request"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">No saved requests</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper for rendering response history
  const renderResponseHistory = () => {
    if (!responseHistoryManager || !activeRequest) return null;
    
    const responses = responseHistoryManager.getResponseHistory(activeRequest.id);
    
    if (responses.length === 0) {
      return <div className="empty-message">No response history for this request</div>;
    }
    
    return (
      <div className="response-history-list">
        {responses.map(response => (
          <div 
            key={response.id} 
            className={`response-history-item ${selectedResponseId === response.id ? 'selected' : ''}`}
            onClick={() => setSelectedResponseId(response.id)}
          >
            <div className="response-history-status">
              <span className={`status-badge status-${Math.floor(response.status / 100)}xx`}>
                {response.status}
              </span>
            </div>
            <div className="response-history-info">
              <div className="response-history-time">
                {new Date(response.timestamp).toLocaleString()}
              </div>
              <div className="response-history-duration">
                {response.responseTime}ms
              </div>
            </div>
            <div className="response-history-actions">
              <input 
                type="checkbox" 
                checked={selectedCompareResponseId === response.id}
                onChange={() => setSelectedCompareResponseId(
                  selectedCompareResponseId === response.id ? null : response.id
                )}
                onClick={e => e.stopPropagation()}
                title="Select for comparison"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <h3 className="config-section-title">API Tester Settings</h3>

    {/* Toggle switch */}
    <StandardToggleSwitch 
        leftLabel="Simple" 
        rightLabel="Advanced" 
        isActive={configMode}  // Pass the actual configMode value
        onChange={(value) => setConfigMode(value)} // This will receive 'simple' or 'advanced'
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />

      {/* Tab navigation in advanced mode */}
      {configMode === 'advanced' && (
        <div className="config-tabs">
          <button 
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`tab-button ${activeTab === 'environments' ? 'active' : ''}`}
            onClick={() => setActiveTab('environments')}
          >
            Environments
          </button>
          <button 
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            Import
          </button>
        </div>
      )}

      {/* General Tab Content */}
      {(configMode === 'simple' || activeTab === 'general') && (
        <>
          {/* Authentication Helper Toggle */}
          {configMode === 'advanced' && (
            <div className="form-group">
              <div className="auth-helper-toggle">
                <span className={`mode-label ${!authHelperEnabled ? 'active' : ''}`}>Auth Helper Off</span>
                <label className="switch" title="Toggle Authentication Helper">
                  <input
                    type="checkbox"
                    checked={authHelperEnabled}
                    onChange={e => {
                      setAuthHelperEnabled(e.target.checked);
                      if (!e.target.checked) {
                        setAuthType('none');
                      }
                    }}
                  />
                  <span className="slider round" />
                </label>
                <span className={`mode-label ${authHelperEnabled ? 'active' : ''}`}>Auth Helper On</span>
              </div>
            </div>
          )}

          {/* Authentication Section */}
          <div className="form-group">
            <label>Default Authentication</label>
            <select 
              value={authType}
              onChange={(e) => setAuthType(e.target.value)}
              title="Set default authentication type"
              disabled={configMode === 'advanced' && !authHelperEnabled}
            >
              <option value="none">None</option>
              <option value="basic">Basic Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apiKey">API Key</option>
            </select>
          </div>
          
          {authType === 'basic' && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={authDetails.username}
                  onChange={(e) => setAuthDetails({...authDetails, username: e.target.value})}
                  placeholder="Username"
                  title="Default basic auth username"
                  disabled={configMode === 'advanced' && !authHelperEnabled}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={authDetails.password}
                  onChange={(e) => setAuthDetails({...authDetails, password: e.target.value})}
                  placeholder="Password"
                  title="Default basic auth password"
                  disabled={configMode === 'advanced' && !authHelperEnabled}
                />
              </div>
            </>
          )}
          
          {authType === 'bearer' && (
            <div className="form-group">
              <label>Bearer Token</label>
              <input 
                type="text" 
                value={authDetails.token}
                onChange={(e) => setAuthDetails({...authDetails, token: e.target.value})}
                placeholder="Bearer token"
                title="Default bearer token"
                disabled={configMode === 'advanced' && !authHelperEnabled}
              />
            </div>
          )}
          
          {authType === 'apiKey' && (
            <>
              <div className="form-group">
                <label>API Key Name</label>
                <input 
                  type="text" 
                  value={authDetails.apiKeyName}
                  onChange={(e) => setAuthDetails({...authDetails, apiKeyName: e.target.value})}
                  placeholder="Header name (e.g. X-API-Key)"
                  title="Default API key header name"
                  disabled={configMode === 'advanced' && !authHelperEnabled}
                />
              </div>
              <div className="form-group">
                <label>API Key</label>
                <input 
                  type="text" 
                  value={authDetails.apiKey}
                  onChange={(e) => setAuthDetails({...authDetails, apiKey: e.target.value})}
                  placeholder="API key value"
                  title="Default API key value"
                  disabled={configMode === 'advanced' && !authHelperEnabled}
                />
              </div>
            </>
          )}

          {/* Example Requests */}
          <div className="form-group">
            <label>Load Example Request</label>
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  // Load example
                  loadExampleRequest(requestExamples[e.target.value]);
                  
                  // Reset the select
                  e.target.value = '';
                }
              }}
              defaultValue=""
              title="Load a pre-configured example request"
            >
              <option value="" disabled>Select an example</option>
              <option value="getJson">GET Example</option>
              <option value="postJson">POST Example</option>
              <option value="putJson">PUT Example</option>
              <option value="deleteRequest">DELETE Example</option>
            </select>
          </div>
          
          {/* Request History */}
          {configMode === 'simple' && (
            <div className="form-group">
              <label>Request History</label>
              <div className="request-history-list">
                {requestHistory.length > 0 ? (
                  requestHistory.map(item => (
                    <div key={item.id} className="history-item" onClick={() => loadRequest(item)} title={`Load ${item.method} ${item.url}`}>
                      <div className="history-method">{item.method}</div>
                      <div className="history-url">{item.url}</div>
                      <div className="history-time">{new Date(item.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))
                ) : (
                  <div className="empty-history">No requests yet</div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Configuration (shown only in advanced mode) */}
          {configMode === 'advanced' && (
            <>
              <div className="form-group">
                <label>Request Timeout (seconds)</label>
                <input 
                  type="number" 
                  defaultValue={30}
                  min={1}
                  max={120}
                  title="Set request timeout in seconds"
                />
              </div>
              
              <div className="form-group">
                <label>Follow Redirects</label>
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="follow-redirects"
                    defaultChecked={true}
                    title="Follow HTTP redirects automatically"
                  />
                  <label htmlFor="follow-redirects">Automatically follow redirects</label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Response Format</label>
                <select 
                  defaultValue="auto"
                  title="Set preferred response format"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="text">Plain Text</option>
                </select>
              </div>
            </>
          )}
        </>
      )}

      {/* Environments Tab Content */}
      {configMode === 'advanced' && activeTab === 'environments' && environmentManager && (
        <>
          <div className="form-group">
            <label>Select Environment</label>
            <select
              value={selectedEnvironment || ''}
              onChange={handleEnvironmentChange}
              title="Select active environment"
            >
              <option value="" disabled>Select environment</option>
              {environmentManager.getEnvironmentNames().map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>New Environment</label>
            <div className="input-with-button">
              <input
                type="text"
                value={newEnvironmentName}
                onChange={(e) => setNewEnvironmentName(e.target.value)}
                placeholder="Environment name"
              />
              <button
                onClick={handleCreateEnvironment}
                disabled={!newEnvironmentName.trim()}
                title="Create new environment"
              >
                Create
              </button>
            </div>
          </div>
          
          {selectedEnvironment && (
            <>
              <h4 className="subsection-title">Variables for {selectedEnvironment}</h4>
              
              <div className="form-group">
                <label>Add Variable</label>
                <div className="variable-form">
                  <input
                    type="text"
                    value={newVarKey}
                    onChange={(e) => setNewVarKey(e.target.value)}
                    placeholder="Variable name"
                    className="variable-key-input"
                  />
                  <input
                    type="text"
                    value={newVarValue}
                    onChange={(e) => setNewVarValue(e.target.value)}
                    placeholder="Value"
                    className="variable-value-input"
                  />
                  <button
                    onClick={handleAddVariable}
                    disabled={!newVarKey.trim()}
                    title="Add variable"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Environment Variables</label>
                {renderEnvironmentVariables()}
              </div>
              
              <div className="info-box">
                <div className="info-title">Using Variables</div>
                <div className="info-content">
                  <p>Use the syntax <code>{`{{variableName}}`}</code> in your URLs, headers, and body to reference environment variables.</p>
                  <p>Example: <code>https://api.example.com/{`{{apiVersion}}`}/users</code></p>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Projects Tab Content */}
      {configMode === 'advanced' && activeTab === 'projects' && projectManager && (
        <>
          <div className="form-group">
            <label>Select Project</label>
            <select
              value={selectedProject || ''}
              onChange={handleProjectChange}
              title="Select active project"
            >
              <option value="" disabled>Select project</option>
              {projectManager.getProjectsArray().map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>New Project</label>
            <div className="input-with-button">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
              />
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                title="Create new project"
              >
                Create
              </button>
            </div>
          </div>
          
          {selectedProject && activeRequest && (
            <div className="form-group">
              <label>Save Current Request</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={newRequestName}
                  onChange={(e) => setNewRequestName(e.target.value)}
                  placeholder="Request name"
                  title="Enter a name for the current request"
                />
                <button 
                  className="suggest-name-button"
                  onClick={suggestRequestName}
                  title="Auto-suggest name based on URL and method"
                >
                  Suggest
                </button>
                <button
                  onClick={handleSaveRequest}
                  disabled={!selectedProject}
                  title="Save current request"
                >
                  Save
                </button>
              </div>
              <div className="save-request-info">
                Method: <span className={`method-badge method-${activeRequest.method.toLowerCase()}`}>{activeRequest.method}</span>
                <span className="save-request-url">{activeRequest.url}</span>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Saved Requests</label>
            {renderProjects()}
          </div>
        </>
      )}

      {/* History Tab Content */}
      {configMode === 'advanced' && activeTab === 'history' && responseHistoryManager && (
        <>
          <div className="form-group">
            <label>History Size</label>
            <div className="input-with-info">
              <input
                type="number"
                value={responseHistorySize}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 100) {
                    setResponseHistorySize(value);
                    responseHistoryManager.setMaxHistorySize(value);
                  }
                }}
                min="1"
                max="100"
                title="Maximum responses to keep per request"
              />
              <div className="input-info">responses per request</div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Response History</label>
            {renderResponseHistory()}
          </div>
          
          {selectedResponseId && selectedCompareResponseId && (
            <div className="form-group">
              <button
                className="compare-button"
                onClick={() => {
                  if (onCompareResponses) {
                    onCompareResponses(selectedResponseId, selectedCompareResponseId);
                  }
                }}
                title="Compare selected responses"
              >
                Compare Selected Responses
              </button>
            </div>
          )}
        </>
      )}

      {/* Import Tab Content */}
      {configMode === 'advanced' && activeTab === 'import' && projectManager && (
        <PostmanImport 
          projectManager={projectManager}
          onImportComplete={handlePostmanImportComplete}
        />
      )}
    </>
  );
};

export default ApiTesterConfig;