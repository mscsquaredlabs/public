// ConfirmationModal.jsx
// Custom confirmation modal to replace browser default prompt/alert windows

import { useEffect } from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'action-button',
  darkMode = false
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div 
      className={`confirmation-modal-overlay ${darkMode ? 'dark-mode' : ''}`}
      onClick={handleCancel}
    >
      <div 
        className={`confirmation-modal-content ${darkMode ? 'dark-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-modal-header">
          <h3 className="confirmation-modal-title">{title}</h3>
          <button 
            className="confirmation-modal-close"
            onClick={handleCancel}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>
        
        <div className="confirmation-modal-body">
          <p className="confirmation-modal-message">{message}</p>
        </div>
        
        <div className="confirmation-modal-actions">
          <button
            className="secondary-button"
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button
            className={confirmButtonClass}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;


