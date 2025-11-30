// ConfigSamplesTab.jsx
// Tab content for configuration samples

import { useState, useEffect, useCallback } from 'react';
import { configTemplates, samplesByType } from '../../shared/utils/config-data';
import { escapeHtml } from '../../shared/utils/formatters';

const ConfigSamplesTab = ({
  configType,
  updateConfigType,
  setStatusMessage,
  darkMode,
  configStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const [activeSample, setActiveSample] = useState(null);
  const [configSample, setConfigSample] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('config-samples-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('config-samples-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  // Load first sample when config type changes
  useEffect(() => {
    const availableSamples = samplesByType[configType] || [];
    if (availableSamples.length > 0) {
      const firstSample = availableSamples[0];
      setActiveSample(firstSample);
      const templateContent = getConfigTemplate(configType, firstSample.id);
      setConfigSample(templateContent);
    } else {
      setActiveSample(null);
      setConfigSample('');
    }
  }, [configType]);

  // Get the config template for a specific type and sample
  const getConfigTemplate = useCallback((type, sampleId) => {
    const typeTemplates = configTemplates[type] || {};
    return typeTemplates[sampleId] || 'Config sample not available';
  }, []);

  // Load a specific sample
  const loadSample = useCallback((sample) => {
    setActiveSample(sample);
    const templateContent = getConfigTemplate(configType, sample.id);
    setConfigSample(templateContent);
    setStatusMessage?.(`Loaded ${sample.name} template`);
  }, [configType, getConfigTemplate, setStatusMessage]);

  // Copy config to clipboard
  const copyToClipboard = useCallback(() => {
    if (!configSample.trim()) {
      setStatusMessage?.('Nothing to copy. Please select a configuration first.');
      return;
    }
    
    navigator.clipboard.writeText(configSample).then(() => {
      setCopied(true);
      setStatusMessage?.('Configuration copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      setStatusMessage?.(`Failed to copy to clipboard: ${err.message}`);
    });
  }, [configSample, setStatusMessage]);

  // Download the config as a file
  const downloadConfig = useCallback(() => {
    if (!configSample.trim()) {
      setStatusMessage?.('Nothing to download. Please select a configuration first.');
      return;
    }

    try {
      let fileExtension = '.txt';
      if (activeSample) {
        switch (activeSample.format) {
          case 'json': fileExtension = '.json'; break;
          case 'yaml': fileExtension = '.yaml'; break;
          case 'docker': fileExtension = '.dockerfile'; break;
          case 'nginx': fileExtension = '.conf'; break;
          case 'apache': fileExtension = '.conf'; break;
          case 'js': fileExtension = '.js'; break;
          default: fileExtension = '.txt';
        }
      }

      const blob = new Blob([configSample], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeSample ? activeSample.id : 'config'}${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage?.(`Configuration downloaded: ${activeSample ? activeSample.name : 'config'}`);
    } catch (error) {
      setStatusMessage?.(`Failed to download configuration: ${error.message}`);
    }
  }, [configSample, activeSample, setStatusMessage]);

  // Toggle favorite status for a sample
  const toggleFavorite = useCallback((sample) => {
    setFavorites(prev => {
      const isFavorite = prev.some(f => f.id === sample.id && f.type === configType);
      if (isFavorite) {
        return prev.filter(f => !(f.id === sample.id && f.type === configType));
      } else {
        return [...prev, { ...sample, type: configType }];
      }
    });
  }, [configType]);

  // Check if a sample is in favorites
  const isFavorite = useCallback((sample) => {
    return favorites.some(f => f.id === sample.id && f.type === configType);
  }, [favorites, configType]);

  // Filter samples based on search term
  const filteredSamples = useCallback(() => {
    let samples = samplesByType[configType] || [];
    
    if (showFavorites) {
      samples = favorites.filter(f => f.type === configType);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      samples = samples.filter(
        sample => sample.name.toLowerCase().includes(term) || 
                 sample.description.toLowerCase().includes(term)
      );
    }
    
    return samples;
  }, [configType, searchTerm, showFavorites, favorites]);

  const availableSamples = filteredSamples();

  return (
    <div className={`config-samples-tab-content ${configStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      {configStyle === 'modern' && (
        <div className="config-samples-options-section">
          <div className="options-row">
            <div className="option-group">
              <label>Search Templates</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="option-group">
              <label>Filter</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showFavorites}
                    onChange={(e) => setShowFavorites(e.target.checked)}
                  />
                  <span>Show Favorites Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Browser container */}
      <div className="config-browser-container">
        <div className="config-browser">
          <div className="config-list">
            <div className="config-list-header">
              <h3>Available Templates</h3>
              
              {configStyle === 'modern' && (
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              )}
            </div>
            
            <div className="samples-list">
              {availableSamples.map(sample => (
                <div
                  key={sample.id}
                  className={`sample-item ${activeSample?.id === sample.id ? 'active' : ''}`}
                  onClick={() => loadSample(sample)}
                  title={sample.description}
                >
                  <div className="sample-content">
                    <div className="sample-name">{sample.name}</div>
                    <div className="sample-description">{sample.description}</div>
                  </div>
                  {configStyle === 'modern' && (
                    <button 
                      className={`favorite-button ${isFavorite(sample) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(sample);
                      }}
                      title={isFavorite(sample) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {isFavorite(sample) ? '★' : '☆'}
                    </button>
                  )}
                </div>
              ))}
              {availableSamples.length === 0 && (
                <div className="empty-samples">
                  {searchTerm 
                    ? `No samples found matching "${searchTerm}"`
                    : showFavorites 
                      ? "No favorites in this category" 
                      : "No samples available for this category"}
                </div>
              )}
            </div>
          </div>

          <div className="config-preview">
            <div className="config-preview-header">
              <div className="preview-title">
                {activeSample ? activeSample.name : 'Preview'}
                {activeSample && <span className="format-badge">{activeSample.format}</span>}
              </div>
            </div>
            <pre className={`config-code language-${activeSample?.format || 'plaintext'}`}>
              {configSample}
            </pre>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="config-samples-actions-section">
        <button 
          onClick={copyToClipboard}
          className="action-button copy-button"
          disabled={!configSample.trim()}
          title={!configSample.trim() ? "Please select a configuration first" : "Copy configuration to clipboard"}
        >
          {copied ? '✓ Copied!' : '📋 Copy Configuration'}
        </button>
        
        {configStyle === 'modern' && (
          <button 
            onClick={downloadConfig}
            className="action-button download-button"
            disabled={!configSample.trim()}
            title={!configSample.trim() ? "Please select a configuration first" : "Download configuration as a file"}
          >
            💾 Download
          </button>
        )}
      </div>
    </div>
  );
};

export default ConfigSamplesTab;



