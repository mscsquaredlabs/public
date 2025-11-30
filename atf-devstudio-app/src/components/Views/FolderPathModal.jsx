// FolderPathModal.jsx
// Modern modal for entering folder path

import { useState, useEffect, useRef } from 'react';
import './FolderPathModal.css';

const FolderPathModal = ({ isOpen, onClose, onConfirm, darkMode }) => {
  const [folderPath, setFolderPath] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset input when modal closes
      setFolderPath('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderPath.trim()) {
      onConfirm(folderPath.trim());
      setFolderPath('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`folder-path-modal-overlay ${darkMode ? 'dark-mode' : ''}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={`folder-path-modal ${darkMode ? 'dark-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Open Folder View</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-content">
            <label htmlFor="folder-path-input" className="modal-label">
              Enter folder path or name
            </label>
            <input
              ref={inputRef}
              id="folder-path-input"
              type="text"
              className="modal-input"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder='e.g., "Documents", "Desktop", or "C:\\Users\\YourName\\Documents"'
              autoFocus
            />
            <div className="modal-hint">
              <span className="hint-icon">💡</span>
              <span className="hint-text">
                You can use special folder names like "Documents" or "Desktop", or provide a full path.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-button primary"
              disabled={!folderPath.trim()}
            >
              Open Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderPathModal;



