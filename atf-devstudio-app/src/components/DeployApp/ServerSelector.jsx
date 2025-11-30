import React from 'react';

/**
 * Component for selecting the target server for deployment
 */
const ServerSelector = ({ 
  servers, 
  selectedServer, 
  setSelectedServer, 
  isDeploying 
}) => {
  return (
    <div className="server-selection">
      <label>Target Server:</label>
      <select 
        value={selectedServer?.id || ''} 
        onChange={(e) => {
          const serverId = e.target.value;
          const server = servers.find(s => s.id === serverId);
          setSelectedServer(server);
          
          // Save selection to localStorage
          if (server) {
            localStorage.setItem('atf-dev-studio-selected-server-id', server.id);
          }
        }}
        disabled={isDeploying}
      >
        <option value="" disabled>Select a server</option>
        {servers.map(server => (
          <option key={server.id} value={server.id}>
            {server.name} ({server.type === 'wildfly' ? 'WildFly' : 'Tomcat'})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ServerSelector;