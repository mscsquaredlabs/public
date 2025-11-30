import React, { useState, useEffect, useRef, useCallback } from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import { testServerConnection } from './serverUtils';

const DeployAppConfig = ({
  servers,
  setServers,
  selectedServer,
  setSelectedServer,
  configMode,
  setConfigMode,
  customContextPath,
  setCustomContextPath,
  undeployFirst,
  setUndeployFirst,
  updateResults
}) => {
  // State for adding new servers
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    type: 'tomcat' // Default to Tomcat
  });
  
  // State for editing existing servers
  const [isEditingServer, setIsEditingServer] = useState(false);
  const [editingServer, setEditingServer] = useState(null);

  // Track the last mode to prevent unnecessary re-renders
  const lastMode = useRef(configMode);

  // Properly handle the toggle switch for simple/advanced mode
  const handleModeToggle = useCallback((isAdvanced) => {
    const newMode = isAdvanced ? 'advanced' : 'simple';
    
    // Only update if the mode is actually changing
    if (newMode === lastMode.current) return;
    
    console.log("Setting config mode to:", newMode);
    lastMode.current = newMode;
    setConfigMode(newMode);
    
    // Save to localStorage directly here
    localStorage.setItem('atf-dev-studio-deploy-config-mode', newMode);
  }, [setConfigMode]);

  // Update lastMode ref when configMode changes
  useEffect(() => {
    lastMode.current = configMode;
  }, [configMode]);

  // Begin editing a server
  const startEditingServer = (server) => {
    setEditingServer({...server});
    setIsEditingServer(true);
    setIsAddingServer(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingServer(null);
    setIsEditingServer(false);
  };

  // Handle input change for editing server
  const handleEditServerChange = (e) => {
    const { name, value } = e.target;
    setEditingServer({
      ...editingServer,
      [name]: value
    });
  };

  // Save edited server
  const handleSaveEditedServer = () => {
    // Validation
    if (!editingServer.name || !editingServer.url || !editingServer.username || !editingServer.password) {
      alert('All fields are required');
      return;
    }

    // Find and update the server in the array
    const updatedServers = servers.map(server => 
      server.id === editingServer.id ? editingServer : server
    );
    
    // Update servers state
    setServers(updatedServers);
    
    // Update the selected server if editing the currently selected one
    if (selectedServer?.id === editingServer.id) {
      setSelectedServer(editingServer);
    }
    
    // Reset state
    setIsEditingServer(false);
    setEditingServer(null);
  };

  // Toggle add server form
  const toggleAddServerForm = () => {
    setIsAddingServer(!isAddingServer);
    if (isEditingServer) {
      setIsEditingServer(false);
      setEditingServer(null);
    }
  };

  // Handle input change for new server
  const handleNewServerChange = (e) => {
    const { name, value } = e.target;
    setNewServer({
      ...newServer,
      [name]: value
    });
  };

  // Add new server
  const handleAddServer = () => {
    // Validation
    if (!newServer.name || !newServer.url || !newServer.username || !newServer.password) {
      alert('All fields are required');
      return;
    }

    // Create new server with ID
    const newServerWithId = { ...newServer, id: `server-${Date.now()}` };

    // Add to servers list using the proper setState function
    const updatedServers = [...servers, newServerWithId];
    setServers(updatedServers);
    
    // Select the new server
    setSelectedServer(newServerWithId);
    
    // Reset form
    setNewServer({
      name: '',
      url: '',
      username: '',
      password: '',
      type: 'tomcat'
    });
    setIsAddingServer(false);
  };

  // Test server connection - ensure proper event handling
  const handleTestServerConnection = (server, e) => {
    if (e) {
      e.stopPropagation();  // Prevent event bubbling
    }
    testServerConnection(server, updateResults);
  };

  // Delete server with proper event handling
  const handleDeleteServer = (server, e) => {
    if (e) {
      e.stopPropagation();  // Prevent event bubbling
    }
    
    if (window.confirm(`Are you sure you want to delete the server "${server.name}"?`)) {
      const updatedServers = servers.filter(s => s.id !== server.id);
      setServers(updatedServers);
      
      // If we're deleting the currently selected server, clear selection
      if (selectedServer?.id === server.id) {
        setSelectedServer(updatedServers.length > 0 ? updatedServers[0] : null);
      }
    }
  };

  return (
    <>
      <h3 className="config-section-title">Deploy App Settings</h3>
      
      {/* Toggle switch for Simple/Advanced modes - fixed event handling */}
      <div className="mode-toggle-container">
        <StandardToggleSwitch 
          leftLabel="Simple" 
          rightLabel="Advanced" 
          isActive={configMode === 'advanced'}
          onChange={handleModeToggle}
        />
      </div>
      
      <div className="deploy-app-config">
        {/* Server Management Section */}
        <div className="form-group">
          <label>Application Servers</label>
          
          {servers.length > 0 ? (
            <div className="server-list">
              {servers.map(server => (
                <div 
                  key={server.id} 
                  className={`server-item ${selectedServer?.id === server.id ? 'selected' : ''}`}
                >
                  <div 
                    className="server-content" 
                    onClick={() => setSelectedServer(server)}
                  >
                    <div className="server-name">
                      {server.name} 
                      <span className="server-type-badge">
                        {server.type === 'wildfly' ? 'WildFly' : 'Tomcat'}
                      </span>
                    </div>
                    <div className="server-url">{server.url}</div>
                  </div>
                  <div className="server-actions">
                    <button 
                      className="btn-test-connection" 
                      onClick={(e) => handleTestServerConnection(server, e)}
                      title="Test connection to this server"
                      type="button"
                    >
                      Test
                    </button>
                    <button 
                      className="btn-edit-server" 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingServer(server);
                      }}
                      title="Edit this server"
                      type="button"
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete-server" 
                      onClick={(e) => handleDeleteServer(server, e)}
                      title="Delete this server"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-servers-message">
              No servers configured. Add a server to deploy applications.
            </div>
          )}
          
          {!isAddingServer && !isEditingServer ? (
            <button 
              className="btn-add-server"
              onClick={toggleAddServerForm}
              type="button"
            >
              Add Server
            </button>
          ) : isAddingServer ? (
            <div className="add-server-form">
              <h4>Add New Server</h4>
              
              <div className="form-field">
                <label htmlFor="server-name">Server Name:</label>
                <input 
                  type="text" 
                  id="server-name" 
                  name="name"
                  value={newServer.name}
                  onChange={handleNewServerChange}
                  placeholder="e.g., Production Server"
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="server-type">Server Type:</label>
                <select
                  id="server-type"
                  name="type"
                  value={newServer.type}
                  onChange={handleNewServerChange}
                >
                  <option value="tomcat">Tomcat</option>
                  <option value="wildfly">WildFly</option>
                </select>
              </div>
              
              <div className="form-field">
                <label htmlFor="server-url">
                  {newServer.type === 'wildfly' ? 'Management URL:' : 'Manager URL:'}
                </label>
                <input 
                  type="text" 
                  id="server-url" 
                  name="url"
                  value={newServer.url}
                  onChange={handleNewServerChange}
                  placeholder={newServer.type === 'wildfly' 
                    ? 'e.g., http://hostname:9990/management' 
                    : 'e.g., http://hostname:8080/manager'}
                />
                <small>
                  {newServer.type === 'wildfly' 
                    ? 'WildFly management port is typically 9990' 
                    : 'Tomcat manager path is typically /manager'}
                </small>
              </div>
              
              <div className="form-field">
                <label htmlFor="server-username">
                  {newServer.type === 'wildfly' ? 'Management Username:' : 'Manager Username:'}
                </label>
                <input 
                  type="text" 
                  id="server-username" 
                  name="username"
                  value={newServer.username}
                  onChange={handleNewServerChange}
                  placeholder="Username"
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="server-password">
                  {newServer.type === 'wildfly' ? 'Management Password:' : 'Manager Password:'}
                </label>
                <input 
                  type="password" 
                  id="server-password" 
                  name="password"
                  value={newServer.password}
                  onChange={handleNewServerChange}
                  placeholder="Password"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn-cancel"
                  onClick={toggleAddServerForm}
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  className="btn-save"
                  onClick={handleAddServer}
                  type="button"
                >
                  Save Server
                </button>
              </div>
            </div>
          ) : (
            <div className="edit-server-form">
              <h4>Edit Server</h4>
              
              <div className="form-field">
                <label htmlFor="edit-server-name">Server Name:</label>
                <input 
                  type="text" 
                  id="edit-server-name" 
                  name="name"
                  value={editingServer?.name || ''}
                  onChange={handleEditServerChange}
                  placeholder="e.g., Production Server"
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="edit-server-type">Server Type:</label>
                <select
                  id="edit-server-type"
                  name="type"
                  value={editingServer?.type || 'tomcat'}
                  onChange={handleEditServerChange}
                >
                  <option value="tomcat">Tomcat</option>
                  <option value="wildfly">WildFly</option>
                </select>
              </div>
              
              <div className="form-field">
                <label htmlFor="edit-server-url">
                  {editingServer?.type === 'wildfly' ? 'Management URL:' : 'Manager URL:'}
                </label>
                <input 
                  type="text" 
                  id="edit-server-url" 
                  name="url"
                  value={editingServer?.url || ''}
                  onChange={handleEditServerChange}
                  placeholder={editingServer?.type === 'wildfly' 
                    ? 'e.g., http://hostname:9990/management' 
                    : 'e.g., http://hostname:8080/manager'}
                />
                <small>
                  {editingServer?.type === 'wildfly' 
                    ? 'WildFly management port is typically 9990' 
                    : 'Tomcat manager path is typically /manager'}
                </small>
              </div>
              
              <div className="form-field">
                <label htmlFor="edit-server-username">
                  {editingServer?.type === 'wildfly' ? 'Management Username:' : 'Manager Username:'}
                </label>
                <input 
                  type="text" 
                  id="edit-server-username" 
                  name="username"
                  value={editingServer?.username || ''}
                  onChange={handleEditServerChange}
                  placeholder="Username"
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="edit-server-password">
                  {editingServer?.type === 'wildfly' ? 'Management Password:' : 'Manager Password:'}
                </label>
                <input 
                  type="password" 
                  id="edit-server-password" 
                  name="password"
                  value={editingServer?.password || ''}
                  onChange={handleEditServerChange}
                  placeholder="Password"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn-cancel"
                  onClick={cancelEditing}
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  className="btn-save"
                  onClick={handleSaveEditedServer}
                  type="button"
                >
                  Update Server
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Advanced Deployment Options - only shown in advanced mode */}
        {configMode === 'advanced' && (
          <div className="form-group">
            <label>Advanced Deployment Options</label>
            
            <div className="form-field">
              <label htmlFor="custom-context">Custom Context Path:</label>
              <input 
                type="text" 
                id="custom-context" 
                value={customContextPath}
                onChange={(e) => setCustomContextPath(e.target.value)}
                placeholder="/my-app"
              />
              <small>Leave empty to use WAR filename as context path</small>
            </div>
            
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="undeploy-first"
                checked={undeployFirst}
                onChange={(e) => setUndeployFirst(e.target.checked)}
              />
              <label htmlFor="undeploy-first">Undeploy existing application first</label>
            </div>
          </div>
        )}
        
        {/* Help section for Tomcat Manager setup */}
        <div className="form-group">
          <label>Help: Server Setup</label>
          <div className="help-content">
            <p>To use this tool, you need to configure your application server with proper access rights.</p>
            
            <h5>Tomcat Manager Setup:</h5>
            <ol>
              <li>Edit <code>tomcat-users.xml</code> in your Tomcat installation's <code>conf</code> directory.</li>
              <li>Add a user with the manager roles:</li>
            </ol>
            
            <pre className="code-sample">
{`<role rolename="manager-gui"/>
<role rolename="manager-script"/>
<role rolename="manager-jmx"/>
<role rolename="manager-status"/>
<user username="tomcat" password="password" 
  roles="manager-gui,manager-script,manager-jmx,manager-status"/>`}
            </pre>
            
            <h5>WildFly Management Setup:</h5>
            <ol>
              <li>Use the add-user.sh/bat script in the bin directory:</li>
            </ol>
            
            <pre className="code-sample">
{`$ ./add-user.sh

What type of user do you wish to add? 
 a) Management User (mgmt-users.properties) 
 b) Application User (application-users.properties)
(a): a

Enter the details of the new user to add.
Using realm 'ManagementRealm' as discovered from the existing property files.
Username : wildfly-admin
Password : 
Re-enter Password : 
What groups do you want this user to belong to? (Please enter a comma separated list, or leave blank for none)[  ]: 
About to add user 'wildfly-admin' for realm 'ManagementRealm'
Is this correct yes/no? yes
Added user 'wildfly-admin' to file '/wildfly/standalone/configuration/mgmt-users.properties'
Added user 'wildfly-admin' to file '/wildfly/domain/configuration/mgmt-users.properties'`}
            </pre>
            
            <h5>Documentation Links:</h5>
            <ul>
              <li><a href="https://tomcat.apache.org/tomcat-9.0-doc/manager-howto.html" target="_blank" rel="noopener noreferrer">Tomcat Manager Documentation</a></li>
              <li><a href="https://docs.wildfly.org/23/Admin_Guide.html" target="_blank" rel="noopener noreferrer">WildFly Admin Guide</a></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeployAppConfig;