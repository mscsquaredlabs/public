// SessionManager.jsx
// Component for managing background terminal sessions
import React from 'react';
import { formatTimestamp } from '../../shared/utils/termsUtils';

const SessionManager = ({
  terminals,
  closeManager,
  reattachTerminal,
  terminateTerminal,
  darkMode
}) => {
  // Filter terminals to only show active ones
  const activeTerminals = terminals.filter(terminal => terminal.isActive);
  
  // Sort terminals by visibility (background first) and then by last active time
  const sortedTerminals = [...activeTerminals].sort((a, b) => {
    // Background sessions first
    if (a.isVisible !== b.isVisible) {
      return a.isVisible ? 1 : -1;
    }
    
    // Then sort by last active time (most recent first)
    return new Date(b.lastActiveAt) - new Date(a.lastActiveAt);
  });
  
  const handleReattach = (id) => {
    reattachTerminal(id);
    
    // Don't close the manager if there are still background sessions
    const remainingBackgroundSessions = sortedTerminals.filter(
      t => !t.isVisible && t.id !== id
    ).length;
    
    if (remainingBackgroundSessions === 0) {
      closeManager();
    }
  };
  
  const handleTerminate = (id, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to terminate this session?')) {
      terminateTerminal(id);
    }
  };

  return (
    <div className={`session-manager ${darkMode ? 'dark-mode' : ''}`}>
      <div className="session-manager-header">
        <div className="session-manager-title">Terminal Sessions</div>
        <button 
          className="close-button" 
          onClick={closeManager}
          style={{ color: 'white', fontSize: '16px' }}
        >
          ×
        </button>
      </div>
      
      <div className="session-manager-content">
        {sortedTerminals.length === 0 ? (
          <div className="empty-sessions">
            <p>No active terminal sessions</p>
          </div>
        ) : (
          sortedTerminals.map(terminal => (
            <div
              key={terminal.id}
              className={`session-item ${terminal.isVisible ? 'visible' : 'background'}`}
              onClick={() => !terminal.isVisible && handleReattach(terminal.id)}
              style={{ cursor: terminal.isVisible ? 'default' : 'pointer' }}
            >
              <div className="session-info">
                <div className="session-name">{terminal.title}</div>
                <div className="session-details">
                  <span>{terminal.shellType}</span>
                  <span> • </span>
                  <span>{formatTimestamp(terminal.lastActiveAt)}</span>
                  <span> • </span>
                  <span>{terminal.isVisible ? 'Visible' : 'Background'}</span>
                </div>
                {terminal.backgroundProcesses && terminal.backgroundProcesses.length > 0 && (
                  <div className="background-processes">
                    <span>{terminal.backgroundProcesses.length} background process(es)</span>
                  </div>
                )}
              </div>
              
              <div className="session-actions">
                {!terminal.isVisible && (
                  <button 
                    onClick={() => handleReattach(terminal.id)}
                    title="Reattach terminal"
                  >
                    🔄
                  </button>
                )}
                <button 
                  onClick={(e) => handleTerminate(terminal.id, e)}
                  title="Terminate session"
                >
                  ⛔
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionManager;