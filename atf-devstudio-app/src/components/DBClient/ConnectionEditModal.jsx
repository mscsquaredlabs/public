// components/ConnectionEditModal.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { validateConnection } from './utils/connectionValidator';

/**
 * Connection Edit Modal Component
 * 
 * Provides a modal interface for editing existing database connections.
 * Includes validation, error handling, and proper form state management.
 * 
 * @component
 * @example
 * ```jsx
 * <ConnectionEditModal
 *   connection={connectionToEdit}
 *   onUpdate={handleConnectionUpdate}
 *   onCancel={handleCancel}
 *   isOpen={true}
 * />
 * ```
 */
const ConnectionEditModal = ({
  connection,
  onUpdate,
  onCancel,
  isOpen = false
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'postgresql',
    host: 'localhost',
    port: '5432',
    database: '',
    username: '',
    password: '',
    ssl: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const portDefaults = {
    postgresql: '5432',
    mysql: '3306',
    oracle: '1521',
    sybase: '5000'
  };

  // Initialize form with connection data
  useEffect(() => {
    if (connection && isOpen) {
      setFormData({
        id: connection.id,
        name: connection.name || '',
        type: connection.type || 'postgresql',
        host: connection.host || 'localhost',
        port: connection.port || portDefaults[connection.type] || '5432',
        database: connection.database || '',
        username: connection.username || '',
        password: connection.password || '',
        ssl: connection.ssl || false
      });
      setErrors({});
      setHasChanges(false);
      setShowPassword(false);
    }
  }, [connection, isOpen]);

  // Track form changes
  useEffect(() => {
    if (!connection) return;

    const hasFormChanges = (
      formData.name !== connection.name ||
      formData.type !== connection.type ||
      formData.host !== connection.host ||
      formData.port !== connection.port ||
      formData.database !== connection.database ||
      formData.username !== connection.username ||
      formData.password !== connection.password ||
      formData.ssl !== connection.ssl
    );

    setHasChanges(hasFormChanges);
  }, [formData, connection]);

  /**
   * Handle database type change and update default port
   * @param {string} type - Database type
   */
  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      port: portDefaults[type] || prev.port
    }));
  };

  /**
   * Handle form field changes
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form data
   * @returns {boolean} - Whether form is valid
   */
  const validateForm = () => {
    const validationResult = validateConnection(formData);
    
    if (!validationResult.isValid) {
      const newErrors = {};
      
      validationResult.errors.forEach(error => {
        const errorLower = error.toLowerCase();
        if (errorLower.includes('name')) newErrors.name = error;
        else if (errorLower.includes('host')) newErrors.host = error;
        else if (errorLower.includes('port')) newErrors.port = error;
        else if (errorLower.includes('database')) newErrors.database = error;
        else if (errorLower.includes('username')) newErrors.username = error;
        else newErrors.general = error;
      });
      
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  /**
   * Handle form submission
   * @param {Event} e - Form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error('Connection update failed:', error);
      setErrors({ general: `Update failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel with unsaved changes check
   */
  const handleCancel = () => {
    if (hasChanges && !isSubmitting) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  /**
   * Handle modal backdrop click
   * @param {Event} e - Click event
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  /**
   * Handle escape key press
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Don't render if not open
  if (!isOpen || !connection) {
    return null;
  }

  return (
    <div 
      className="modal-overlay connection-edit-modal-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-connection-title"
    >
      <div className="modal-content connection-edit-modal">
        <div className="modal-header">
          <h3 id="edit-connection-title">Edit Database Connection</h3>
          <button 
            className="modal-close"
            onClick={handleCancel}
            aria-label="Close edit connection modal"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form className="connection-form" onSubmit={handleSubmit}>
          {/* General Error Display */}
          {errors.general && (
            <div className="form-error general-error">
              {errors.general}
            </div>
          )}

          {/* Connection Name */}
          <div className="form-group">
            <label htmlFor="edit-connection-name">Connection Name *</label>
            <input
              id="edit-connection-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="My Database Connection"
              className={errors.name ? 'error' : ''}
              disabled={isSubmitting}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Database Type */}
          <div className="form-group">
            <label htmlFor="edit-connection-type">Database Type *</label>
            <select
              id="edit-connection-type"
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="oracle">Oracle</option>
              <option value="sybase">Sybase</option>
            </select>
          </div>

          {/* Host and Port */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-connection-host">Host *</label>
              <input
                id="edit-connection-host"
                type="text"
                value={formData.host}
                onChange={(e) => handleFieldChange('host', e.target.value)}
                placeholder="localhost"
                className={errors.host ? 'error' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.host && <span className="error-text">{errors.host}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edit-connection-port">Port *</label>
              <input
                id="edit-connection-port"
                type="text"
                value={formData.port}
                onChange={(e) => handleFieldChange('port', e.target.value)}
                className={errors.port ? 'error' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.port && <span className="error-text">{errors.port}</span>}
            </div>
          </div>

          {/* Database Name */}
          <div className="form-group">
            <label htmlFor="edit-connection-database">Database *</label>
            <input
              id="edit-connection-database"
              type="text"
              value={formData.database}
              onChange={(e) => handleFieldChange('database', e.target.value)}
              placeholder="my_database"
              className={errors.database ? 'error' : ''}
              disabled={isSubmitting}
              required
            />
            {errors.database && <span className="error-text">{errors.database}</span>}
          </div>

          {/* Username and Password */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-connection-username">Username *</label>
              <input
                id="edit-connection-username"
                type="text"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="username"
                className={errors.username ? 'error' : ''}
                disabled={isSubmitting}
                required
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edit-connection-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="edit-connection-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder="password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          </div>

          {/* SSL Option */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.ssl}
                onChange={(e) => handleFieldChange('ssl', e.target.checked)}
                disabled={isSubmitting}
              />
              Use SSL Connection
            </label>
          </div>

          {/* Warning for active connections */}
          {connection.isConnected && (
            <div className="form-warning">
              <span className="warning-icon">⚠️</span>
              <span>
                This connection is currently active. Updating will disconnect and reconnect with new settings.
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? 'Updating...' : 'Update Connection'}
            </button>
          </div>

          {/* Changes Indicator */}
          {hasChanges && !isSubmitting && (
            <div className="changes-indicator">
              <span className="changes-icon">•</span>
              <span>You have unsaved changes</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

ConnectionEditModal.propTypes = {
  /** Connection object to edit */
  connection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    host: PropTypes.string.isRequired,
    port: PropTypes.string.isRequired,
    database: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    password: PropTypes.string,
    ssl: PropTypes.bool,
    isConnected: PropTypes.bool
  }),
  
  /** Function to handle connection update */
  onUpdate: PropTypes.func.isRequired,
  
  /** Function to handle modal cancellation */
  onCancel: PropTypes.func.isRequired,
  
  /** Whether the modal is open */
  isOpen: PropTypes.bool
};

export default ConnectionEditModal;