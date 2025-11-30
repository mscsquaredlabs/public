// TermsConfig.jsx
// Updated to include Windows Command Prompt options
import React, { useState } from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import { formatTimestamp } from '../../shared/utils/termsUtils';

const TermsConfig = ({
  terminals,
  createTerminal,
  darkMode,
  defaultShellType,
  autoCloseTerminated,
  defaultTerminalSize,
  terminalStyle,
  updatePreferences,
  setStatusMessage
}) => {
  const [configMode, setConfigMode] = useState('simple');
  
  // Detect OS
  const isWindows = navigator.userAgent.includes('Windows');
  const isMac = navigator.userAgent.includes('Mac');

  const handlePreferenceChange = (key, value) => {
    updatePreferences({ [key]: value });
  };
  
  const handleSizeChange = (dimension, value) => {
    const newSize = { ...defaultTerminalSize, [dimension]: parseInt(value, 10) };
    updatePreferences({ defaultTerminalSize: newSize });
  };

  // Terminal statistics
  const totalTerminals = terminals.length;
  const activeTerminals = terminals.filter(t => t.isActive).length;
  const visibleTerminals = terminals.filter(t => t.isVisible).length;
  const backgroundTerminals = terminals.filter(t => t.isActive && !t.isVisible).length;

  return (
    <div className={`terms-config ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className="config-section-title">Terminal Settings</h3>

      <StandardToggleSwitch 
        leftLabel="Simple"
        rightLabel="Advanced"
        isActive={configMode}
        onChange={setConfigMode}
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />

      {configMode === 'simple' ? (
        <>
          {/* QUICK ACTIONS */}
          <div className="config-section">
            <h4 className="section-title">Quick Actions</h4>
            <div className="template-grid">
              {isWindows ? (
                <>
                  <button className="template-button" onClick={() => createTerminal('cmd')}>Command Prompt</button>
                  <button className="template-button" onClick={() => createTerminal('powershell')}>PowerShell</button>
                </>
              ) : (
                <>
                  <button className="template-button" onClick={() => createTerminal('bash')}>Bash Terminal</button>
                  <button className="template-button" onClick={() => createTerminal('zsh')}>ZSH Terminal</button>
                </>
              )}
            </div>
          </div>

          {/* BASIC PREFERENCES */}
          <div className="config-section">
            <h4 className="section-title">Basic Preferences</h4>
            <div className="config-option">
              <label>
                Default Shell:
                <select
                  value={defaultShellType}
                  onChange={e => handlePreferenceChange('defaultShellType', e.target.value)}
                  className="preference-select"
                >
                  {isWindows ? (
                    <>
                      <option value="cmd">Command Prompt</option>
                      <option value="powershell">PowerShell</option>
                    </>
                  ) : (
                    <>
                      <option value="bash">Bash</option>
                      <option value="zsh">ZSH</option>
                    </>
                  )}
                </select>
              </label>
            </div>
            <div className="config-option">
              <label>
                <input
                  type="checkbox"
                  checked={autoCloseTerminated}
                  onChange={() => handlePreferenceChange('autoCloseTerminated', !autoCloseTerminated)}
                />
                Auto-close terminated sessions
              </label>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* TERMINAL TYPES */}
          <div className="config-section">
            <h4 className="section-title">Terminal Types</h4>
            <div className="template-grid">
              {isWindows ? (
                <>
                  <button className="template-button" onClick={() => createTerminal('cmd')}>Command Prompt</button>
                  <button className="template-button" onClick={() => createTerminal('powershell')}>PowerShell</button>
                </>
              ) : (
                <>
                  <button className="template-button" onClick={() => createTerminal('bash')}>Bash Terminal</button>
                  <button className="template-button" onClick={() => createTerminal('zsh')}>ZSH Terminal</button>
                </>
              )}
            </div>
          </div>

          {/* TERMINAL STATISTICS */}
          <div className="config-section">
            <h4 className="section-title">Terminal Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{totalTerminals}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active:</span> 
                <span className="stat-value">{activeTerminals}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Visible:</span> 
                <span className="stat-value">{visibleTerminals}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Background:</span> 
                <span className="stat-value">{backgroundTerminals}</span>
              </div>
            </div>
          </div>

          {/* ACTIVE TERMINALS */}
          {terminals.length > 0 && (
            <div className="config-section">
              <h4 className="section-title">Active Terminals</h4>
              <div className="terminals-list">
                {terminals.map(terminal => (
                  <div key={terminal.id} className="terminal-item">
                    <div className="terminal-info">
                      <div className="terminal-name">{terminal.title}</div>
                      <div className="terminal-details">
                        <span>{terminal.shellType}</span>
                        <span>•</span>
                        <span>{formatTimestamp(terminal.lastActiveAt)}</span>
                        <span>•</span>
                        <span>{terminal.isVisible ? 'Visible' : 'Background'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADVANCED PREFERENCES */}
          <div className="config-section">
            <h4 className="section-title">Advanced Preferences</h4>
            <div className="config-option">
              <label>
                Default Shell:
                <select
                  value={defaultShellType}
                  onChange={e => handlePreferenceChange('defaultShellType', e.target.value)}
                  className="preference-select"
                >
                  {isWindows ? (
                    <>
                      <option value="cmd">Command Prompt</option>
                      <option value="powershell">PowerShell</option>
                    </>
                  ) : (
                    <>
                      <option value="bash">Bash</option>
                      <option value="zsh">ZSH</option>
                    </>
                  )}
                </select>
              </label>
            </div>
            <div className="config-option">
              <label>
                <input
                  type="checkbox"
                  checked={autoCloseTerminated}
                  onChange={() => handlePreferenceChange('autoCloseTerminated', !autoCloseTerminated)}
                />
                Auto-close terminated sessions
              </label>
            </div>
          </div>

          {/* DEFAULT TERMINAL SIZE */}
          <div className="config-section">
            <h4 className="section-title">Default Terminal Size</h4>
            <div className="config-option">
              <label>
                Width:
                <div className="range-with-value">
                  <input
                    type="range"
                    min="400"
                    max="800"
                    value={defaultTerminalSize.width}
                    onChange={e => handleSizeChange('width', e.target.value)}
                  />
                  <span>{defaultTerminalSize.width}px</span>
                </div>
              </label>
            </div>
            <div className="config-option">
              <label>
                Height:
                <div className="range-with-value">
                  <input
                    type="range"
                    min="300"
                    max="600"
                    value={defaultTerminalSize.height}
                    onChange={e => handleSizeChange('height', e.target.value)}
                  />
                  <span>{defaultTerminalSize.height}px</span>
                </div>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TermsConfig;