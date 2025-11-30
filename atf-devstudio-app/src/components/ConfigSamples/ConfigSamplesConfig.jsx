import React from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

/**
 * ConfigSamplesConfig.jsx
 * Configuration panel component for the Config Samples tool
 * Updated with dark mode integration
 */
const ConfigSamplesConfig = ({
  configType,
  setConfigType,
  configMode,
  setConfigMode,
  searchTerm,
  setSearchTerm,
  showFavorites,
  setShowFavorites,
  configTypes,
  darkMode
}) => {
  return (
    <>
      {/* Header with title and mode switch */}
      <h3 className="config-section-title">Config Samples Settings</h3>
      
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
      
      <div className="config-samples-config">
        {/* Sample Categories */}
        <div className="form-group">
          <label>Configuration Categories</label>
          <div className="config-types-list">
            {configTypes.map(type => (
              <button
                key={type.id}
                className={`config-type-button ${configType === type.id ? 'active' : ''}`}
                onClick={() => setConfigType(type.id)}
                title={`Show ${type.name} configuration templates`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Advanced options - only show if in advanced mode */}
        {configMode === 'advanced' && (
          <>
            <div className="form-group">
              <label htmlFor="config-search">Search Templates</label>
              <input 
                id="config-search"
                type="text" 
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="show-favorites"
                  checked={showFavorites}
                  onChange={(e) => setShowFavorites(e.target.checked)}
                />
                <label htmlFor="show-favorites">Show Favorites Only</label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Display Options</label>
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="syntax-highlighting"
                  defaultChecked={true}
                  disabled
                />
                <label htmlFor="syntax-highlighting">Syntax Highlighting</label>
              </div>
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="line-numbers"
                  defaultChecked={false}
                  disabled
                />
                <label htmlFor="line-numbers">Show Line Numbers (coming soon)</label>
              </div>
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="dark-theme"
                  checked={darkMode}
                  disabled
                />
                <label htmlFor="dark-theme">
                  Dark Theme (controlled by application)
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>Custom Templates</label>
              <button 
                className="config-sample-btn" 
                title="Add your own configuration template (coming soon)"
                disabled
              >
                Add Custom Template (coming soon)
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ConfigSamplesConfig;