// components/ReconnectButton.jsx
import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Reconnect Button Component
 * 
 * Provides a user-friendly way to reconnect to a database after
 * connection timeout or failure. Shows loading state and provides
 * visual feedback for reconnection attempts.
 * 
 * @component
 * @example
 * ```jsx
 * <ReconnectButton
 *   connectionId="conn_123"
 *   onReconnect={handleReconnect}
 *   isReconnecting={false}
 *   className="custom-btn"
 *   showText={true}
 * />
 * ```
 */
const ReconnectButton = ({
  connectionId,
  onReconnect,
  isReconnecting = false,
  className = '',
  showText = false,
  size = 'normal',
  disabled = false,
  tooltip = 'Reconnect to database'
}) => {
  const [lastReconnectAttempt, setLastReconnectAttempt] = useState(null);
  const [reconnectSuccess, setReconnectSuccess] = useState(false);

  /**
   * Handle reconnect button click
   * Manages reconnection state and provides user feedback
   */
  const handleReconnectClick = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isReconnecting || disabled) return;

    setLastReconnectAttempt(Date.now());
    setReconnectSuccess(false);

    try {
      const success = await onReconnect(connectionId);
      setReconnectSuccess(success);
      
      // Reset success indicator after 3 seconds
      if (success) {
        setTimeout(() => setReconnectSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Reconnect failed:', error);
      setReconnectSuccess(false);
    }
  }, [connectionId, onReconnect, isReconnecting, disabled]);

  // Determine button state and appearance
  const getButtonState = () => {
    if (reconnectSuccess) return 'success';
    if (isReconnecting) return 'loading';
    return 'default';
  };

  const buttonState = getButtonState();

  // Button classes
  const buttonClasses = [
    'reconnect-button',
    className,
    `reconnect-button--${size}`,
    `reconnect-button--${buttonState}`,
    disabled && 'reconnect-button--disabled'
  ].filter(Boolean).join(' ');

  // Button content based on state
  const getButtonContent = () => {
    const iconOnly = !showText;

    switch (buttonState) {
      case 'loading':
        return (
          <>
            <span className="reconnect-icon reconnect-icon--loading">🔄</span>
            {!iconOnly && <span className="reconnect-text">Reconnecting...</span>}
          </>
        );
      case 'success':
        return (
          <>
            <span className="reconnect-icon reconnect-icon--success">✅</span>
            {!iconOnly && <span className="reconnect-text">Connected!</span>}
          </>
        );
      default:
        return (
          <>
            <span className="reconnect-icon">🔌</span>
            {!iconOnly && <span className="reconnect-text">Reconnect</span>}
          </>
        );
    }
  };

  // Tooltip text based on state
  const getTooltipText = () => {
    if (disabled) return 'Reconnection not available';
    if (isReconnecting) return 'Reconnecting to database...';
    if (reconnectSuccess) return 'Successfully reconnected!';
    if (lastReconnectAttempt) {
      const timeSince = Date.now() - lastReconnectAttempt;
      if (timeSince < 10000) return 'Click to retry connection';
    }
    return tooltip;
  };

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleReconnectClick}
      disabled={disabled || isReconnecting}
      title={getTooltipText()}
      aria-label={`Reconnect to database ${connectionId}`}
    >
      {getButtonContent()}
    </button>
  );
};

ReconnectButton.propTypes = {
  /** Connection ID to reconnect */
  connectionId: PropTypes.string.isRequired,
  
  /** Function to handle reconnection - should return Promise<boolean> */
  onReconnect: PropTypes.func.isRequired,
  
  /** Whether reconnection is currently in progress */
  isReconnecting: PropTypes.bool,
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** Whether to show text alongside icon */
  showText: PropTypes.bool,
  
  /** Button size variant */
  size: PropTypes.oneOf(['small', 'normal', 'large']),
  
  /** Whether button is disabled */
  disabled: PropTypes.bool,
  
  /** Tooltip text */
  tooltip: PropTypes.string
};

export default ReconnectButton;