import React from 'react';
import './SqlFiddle.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const SqlFiddleConfig = ({
  configMode,
  setConfigMode,
  formatOnPaste,
  setFormatOnPaste,
  autoRunQuery,
  setAutoRunQuery,
  loadSampleSchema,
  loadSampleQuery
}) => {
  // Database engine options (for future implementation)
  const dbEngines = [
    { id: 'sqlite', name: 'SQLite (In-memory)', status: 'active' },
    { id: 'mysql', name: 'MySQL', status: 'disabled' },
    { id: 'postgres', name: 'PostgreSQL', status: 'disabled' },
    { id: 'mssql', name: 'SQL Server', status: 'disabled' }
  ];

  return (
    <>
      <h3 className="config-section-title">SQL Fiddle Settings</h3>

      {/* Mode toggle (simple / advanced) */}
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
      
      {/* Editor Settings */}
      <div className="form-group">
        <label>Editor Settings</label>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="format-on-paste"
            checked={formatOnPaste}
            onChange={(e) => setFormatOnPaste(e.target.checked)}
            title="Automatically format SQL when pasting"
          />
          <label htmlFor="format-on-paste">Format SQL on paste</label>
        </div>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="auto-run-query"
            checked={autoRunQuery}
            onChange={(e) => setAutoRunQuery(e.target.checked)}
            title="Automatically run query after schema build"
          />
          <label htmlFor="auto-run-query">Auto-run query after schema build</label>
        </div>
      </div>
      
      {/* Database Engine - future feature, currently shows only SQLite */}
      <div className="form-group">
        <label>Database Engine</label>
        <select 
          disabled={true}
          title="Only SQLite is currently supported"
        >
          {dbEngines.map(engine => (
            <option 
              key={engine.id} 
              value={engine.id} 
              disabled={engine.status === 'disabled'}
            >
              {engine.name} {engine.status === 'disabled' ? '(Coming Soon)' : ''}
            </option>
          ))}
        </select>
        <div className="config-note">
          Using SQLite (SQL.js) in-memory database. Data is not persisted between sessions.
        </div>
      </div>
      
      {/* Display Options */}
      <div className="form-group">
        <label>Maximum Rows to Display</label>
        <select 
          id="max-rows"
          defaultValue="100"
          title="Maximum number of rows to display in results"
        >
          <option value="100">100</option>
          <option value="500">500</option>
          <option value="1000">1,000</option>
          <option value="5000">5,000</option>
        </select>
      </div>
      
      {/* Advanced Configuration (shown only in advanced mode) */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <label>Load Sample Data</label>
            <div className="button-group">
              <button 
                className="btn-secondary sample-button"
                onClick={loadSampleSchema}
                title="Load sample schema with tables and data"
              >
                Load Sample Schema
              </button>
              <button 
                className="btn-secondary sample-button"
                onClick={loadSampleQuery}
                title="Load sample queries"
              >
                Load Sample Query
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label>SQL Dialect Specific Features</label>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="enable-sqlite-extensions"
                disabled={true}
                title="This feature is coming soon"
              />
              <label htmlFor="enable-sqlite-extensions">Enable SQLite Extensions</label>
            </div>
            <div className="config-note">
              This feature will be available in a future update.
            </div>
          </div>
        </>
      )}
      
      </>
  );
};

export default SqlFiddleConfig;