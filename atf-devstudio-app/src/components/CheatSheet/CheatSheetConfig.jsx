import React, { useState } from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

/**
 * CheatSheetConfig.jsx
 * Configuration panel component for the Cheat Sheet tool
 * With dark mode support
 */
const CheatSheetConfig = ({
  
  currentCategory,
  setCurrentCategory,
  searchTerm,
  setSearchTerm,
  showFavorites,
  setShowFavorites,
  categories,
  darkMode
}) => {


  const [configMode, setConfigMode] = useState('simple');

  
  return (
    <>
      <h3 className="config-section-title">Cheat Sheet Settings</h3>
  
      <StandardToggleSwitch 
        leftLabel="Simple"
        rightLabel="Advanced"
        isActive={configMode}
        onChange={setConfigMode}
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />
  
      <div className="cheat-sheet-config">
        {configMode === 'simple' ? (
          <>
            {/* SIMPLE MODE: only Categories + Search */}
            <div className="form-group">
              <label>Categories</label>
              <div className="config-types-list">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`config-type-button ${currentCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setCurrentCategory(cat.id)}
                    title={`Show ${cat.name} cheat sheets`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
  
            <div className="form-group">
              <label htmlFor="cheat-search">Search</label>
              <input
                id="cheat-search"
                type="text"
                placeholder="Search cheat sheets..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
          </>
        ) : (
          <>
            {/* ADVANCED MODE: everything */}
            <div className="form-group">
              <label>Categories</label>
              <div className="config-types-list">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`config-type-button ${currentCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setCurrentCategory(cat.id)}
                    title={`Show ${cat.name} cheat sheets`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
  
            <div className="form-group">
              <label htmlFor="cheat-search">Search</label>
              <input
                id="cheat-search"
                type="text"
                placeholder="Search cheat sheets..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
  
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="show-cheat-favorites"
                  checked={showFavorites}
                  onChange={e => setShowFavorites(e.target.checked)}
                />
                <label htmlFor="show-cheat-favorites">Show Favorites Only</label>
              </div>
            </div>
  
            <div className="form-group">
              <label>Display Options</label>
              <div className="checkbox-group">
                <input type="checkbox" id="syntax-highlighting" defaultChecked disabled />
                <label htmlFor="syntax-highlighting">Syntax Highlighting</label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="copy-buttons" defaultChecked disabled />
                <label htmlFor="copy-buttons">Show Copy Buttons</label>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="cheat-dark-theme" checked={darkMode} disabled />
                <label htmlFor="cheat-dark-theme">Dark Theme (app-controlled)</label>
              </div>
            </div>
  
            <div className="form-group">
              <label>Custom Cheat Sheets</label>
              <p className="config-description">
                Add your own cheat sheets for quick reference.
              </p>
              <button className="config-sample-btn" disabled>
                Add Custom Cheat Sheet (coming soon)
              </button>
            </div>
  
            <div className="form-group">
              <label>Import/Export</label>
              <div className="button-group" style={{ gap: '.5rem', marginTop: '.5rem' }}>
                <button className="config-sample-btn" disabled>Export Favorites</button>
                <button className="config-sample-btn" disabled>Import Favorites</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CheatSheetConfig;