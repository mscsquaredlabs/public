// MemsConfig.jsx
import React, { useState } from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const MemsConfig = ({
  notepads,
  createNotepad,
  darkMode,
  spellCheckEnabled,
  defaultTabSize,
  autoSaveInterval,
  defaultNoteSize,
  saveToLocalFolder,
  saveFolderPath,
  noteStyle,
  updatePreferences,
  setStatusMessage
}) => {
  const [configMode, setConfigMode] = useState('simple');

  const handlePreferenceChange = (key, value) => {
    updatePreferences({ [key]: value });
  };
  
  const handleSizeChange = (dimension, value) => {
    const newSize = { ...defaultNoteSize, [dimension]: parseInt(value, 10) };
    updatePreferences({ defaultNoteSize: newSize });
  };

  const totalNotes     = notepads.length;
  const codeNotes      = notepads.filter(n => n.syntax !== 'plain').length;
  const plainTextNotes = notepads.filter(n => n.syntax === 'plain').length;

  return (
    <div className={`mems-config ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className="config-section-title">Notes Settings</h3>

      <StandardToggleSwitch 
        leftLabel="Simple"
        rightLabel="Advanced"
        isActive={configMode}
        onChange={setConfigMode}
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />

      {/* NOTE STYLE OPTION */}
      <div className="config-section">
        <h4 className="section-title">Note Style</h4>
        <StandardToggleSwitch 
          leftLabel="Simple"
          rightLabel="Modern"
          isActive={noteStyle}
          onChange={(value) => updatePreferences({ noteStyle: value })}
          name="noteStyle"
          leftValue="simple"
          rightValue="modern"
        />
        <p className="config-hint">
          {noteStyle === 'simple' 
            ? 'Simple: All notes use the same classic color scheme' 
            : 'Modern: Each new note gets a different vibrant color'}
        </p>
      </div>

      {configMode === 'simple' ? (
        <>
          {/* NOTE TEMPLATES */}
          <div className="config-section">
            <h4 className="section-title">Note Templates</h4>
            <div className="template-grid">
              <button className="template-button" onClick={() => createNotepad('javascript')}>JS Note</button>
              <button className="template-button" onClick={() => createNotepad('html')}>HTML Note</button>
              <button className="template-button" onClick={() => createNotepad('css')}>CSS Note</button>
              <button className="template-button" onClick={() => createNotepad('json')}>JSON Note</button>
            </div>
          </div>

          {/* EDITOR PREFERENCES */}
          <div className="config-section">
            <h4 className="section-title">Editor Preferences</h4>
            <div className="config-option">
              <label>
                Tab Size:
                <select
                  value={defaultTabSize}
                  onChange={e => handlePreferenceChange('defaultTabSize', parseInt(e.target.value, 10))}
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </label>
            </div>
            <div className="config-option">
              <label>
                <input
                  type="checkbox"
                  checked={spellCheckEnabled}
                  onChange={() => handlePreferenceChange('spellCheckEnabled', !spellCheckEnabled)}
                />
                Spell check
              </label>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* NOTE TEMPLATES */}
          <div className="config-section">
            <h4 className="section-title">Note Templates</h4>
            <div className="template-grid">
              <button className="template-button" onClick={() => createNotepad('javascript')}>New JavaScript Note</button>
              <button className="template-button" onClick={() => createNotepad('html')}>New HTML Note</button>
              <button className="template-button" onClick={() => createNotepad('css')}>New CSS Note</button>
              <button className="template-button" onClick={() => createNotepad('sql')}>New SQL Note</button>
              <button className="template-button" onClick={() => createNotepad('json')}>New JSON Note</button>
              <button className="template-button" onClick={() => createNotepad('markdown')}>New Markdown Note</button>
            </div>
          </div>

          {/* YOUR NOTES STATS */}
          <div className="config-section">
            <h4 className="section-title">Your Notes</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{totalNotes}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Code:</span> 
                <span className="stat-value">{codeNotes}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Plain:</span> 
                <span className="stat-value">{plainTextNotes}</span>
              </div>
            </div>
          </div>

          {/* EDITOR PREFERENCES */}
          <div className="config-section">
            <h4 className="section-title">Editor Preferences</h4>
            <div className="config-option">
              <label>
                Tab Size:
                <select
                  value={defaultTabSize}
                  onChange={e => handlePreferenceChange('defaultTabSize', parseInt(e.target.value, 10))}
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="8">8 spaces</option>
                </select>
              </label>
            </div>
            <div className="config-option">
              <label>
                <input
                  type="checkbox"
                  checked={spellCheckEnabled}
                  onChange={() => handlePreferenceChange('spellCheckEnabled', !spellCheckEnabled)}
                />
                Enable spell check
              </label>
            </div>
            <div className="config-option">
              <label>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => handlePreferenceChange('darkMode', !darkMode)}
                />
                Dark theme
              </label>
            </div>
          </div>

          {/* DEFAULT NOTE SIZE */}
          <div className="config-section">
            <h4 className="section-title">Default Note Size</h4>
            <div className="config-option">
              <label>
                Width:
                <div className="range-with-value">
                  <input
                    type="range"
                    min="250"
                    max="600"
                    value={defaultNoteSize.width}
                    onChange={e => handleSizeChange('width', e.target.value)}
                  />
                  <span>{defaultNoteSize.width}px</span>
                </div>
              </label>
            </div>
            <div className="config-option">
              <label>
                Height:
                <div className="range-with-value">
                  <input
                    type="range"
                    min="200"
                    max="500"
                    value={defaultNoteSize.height}
                    onChange={e => handleSizeChange('height', e.target.value)}
                  />
                  <span>{defaultNoteSize.height}px</span>
                </div>
              </label>
            </div>
          </div>

          {/* AUTO-SAVE SETTINGS */}
          <div className="config-section">
            <h4 className="section-title">Auto-Save Settings</h4>
            <div className="config-option">
              <label>
                Interval:
                <select
                  value={autoSaveInterval}
                  onChange={e => handlePreferenceChange('autoSaveInterval', parseInt(e.target.value, 10))}
                >
                  <option value="5">5s</option>
                  <option value="15">15s</option>
                  <option value="30">30s</option>
                  <option value="60">60s</option>
                </select>
              </label>
            </div>
          </div>

          {/* COMING SOON */}
          <div className="config-section">
            <h4 className="section-title">Coming Soon</h4>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-card-icon">☁️</div>
                <div className="feature-card-title">Cloud Sync</div>
                <div className="feature-card-description">Sync across devices</div>
              </div>
              <div className="feature-card">
                <div className="feature-card-icon">👥</div>
                <div className="feature-card-title">Collaboration</div>
                <div className="feature-card-description">Real-time editing</div>
              </div>
              <div className="feature-card">
                <div className="feature-card-icon">📤</div>
                <div className="feature-card-title">Batch I/O</div>
                <div className="feature-card-description">Import/export many</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemsConfig;
