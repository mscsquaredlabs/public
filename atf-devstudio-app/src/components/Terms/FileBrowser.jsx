// FileBrowser.jsx
// Component for browsing local directories
import { useState, useEffect, useRef } from 'react';
import { browseDirectory } from '../../shared/services/terminalWS';
import './FileBrowser.css';

const FileBrowser = ({ onSelectFile, onSelectDirectory, darkMode, onClose }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const pathInputRef = useRef(null);

  useEffect(() => {
    loadDirectory(process.platform === 'win32' ? 'C:\\' : '/');
  }, []);

  const loadDirectory = async (path) => {
    setLoading(true);
    setError(null);
    try {
      const result = await browseDirectory(path);
      if (result.error) {
        setError(result.error);
        setItems([]);
      } else {
        setCurrentPath(result.path);
        setItems(result.items || []);
      }
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'directory') {
      loadDirectory(item.path);
      setSelectedPath(null);
    } else {
      setSelectedPath(item.path);
    }
  };

  const handleDoubleClick = (item) => {
    if (item.type === 'directory') {
      loadDirectory(item.path);
    } else if (onSelectFile) {
      onSelectFile(item.path);
      onClose?.();
    }
  };

  const handleNavigate = () => {
    const path = pathInputRef.current?.value || currentPath;
    loadDirectory(path);
  };

  const handleSelect = () => {
    if (selectedPath) {
      if (onSelectFile) {
        onSelectFile(selectedPath);
      }
      onClose?.();
    } else if (onSelectDirectory) {
      onSelectDirectory(currentPath);
      onClose?.();
    }
  };

  const handleGoUp = () => {
    const parentPath = currentPath.split(/[/\\]/).slice(0, -1).join(process.platform === 'win32' ? '\\' : '/') || 
                      (process.platform === 'win32' ? 'C:\\' : '/');
    loadDirectory(parentPath);
  };

  return (
    <div className={`file-browser ${darkMode ? 'dark-mode' : ''}`}>
      <div className="file-browser-header">
        <h3>Browse Files</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="file-browser-path">
        <input
          ref={pathInputRef}
          type="text"
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          placeholder="Enter path..."
          className="path-input"
        />
        <button onClick={handleNavigate} title="Navigate">Go</button>
        <button onClick={handleGoUp} title="Go up one directory">↑</button>
      </div>

      {error && (
        <div className="file-browser-error">
          {error}
        </div>
      )}

      <div className="file-browser-content">
        {loading ? (
          <div className="file-browser-loading">Loading...</div>
        ) : (
          <div className="file-browser-list">
            {items.map((item, index) => (
              <div
                key={index}
                className={`file-browser-item ${item.type} ${selectedPath === item.path ? 'selected' : ''}`}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleDoubleClick(item)}
                title={item.path}
              >
                <span className="item-icon">
                  {item.type === 'directory' ? '📁' : '📄'}
                </span>
                <span className="item-name">{item.name}</span>
                {item.size && (
                  <span className="item-size">
                    {item.size > 1024 * 1024 
                      ? `${(item.size / (1024 * 1024)).toFixed(2)} MB`
                      : item.size > 1024
                      ? `${(item.size / 1024).toFixed(2)} KB`
                      : `${item.size} B`}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="file-browser-footer">
        <button 
          onClick={handleSelect} 
          disabled={!selectedPath && !onSelectDirectory}
          className="select-button"
        >
          {selectedPath ? 'Select File' : 'Select Directory'}
        </button>
      </div>
    </div>
  );
};

export default FileBrowser;



