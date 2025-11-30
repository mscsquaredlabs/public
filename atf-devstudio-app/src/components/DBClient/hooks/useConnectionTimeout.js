// hooks/useConnectionTimeout.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Connection Timeout Hook
 * 
 * Manages database connection timeouts, provides timeout monitoring,
 * and handles automatic cleanup of timed-out connections.
 * 
 * Features:
 * - Individual timeout tracking per connection
 * - Configurable timeout durations
 * - Automatic timeout detection
 * - Event-based timeout notifications
 * - Cleanup on component unmount
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Timeout management utilities
 */
export const useConnectionTimeout = (options = {}) => {
  const {
    defaultTimeout = 300000, // 5 minutes default
    onTimeout = null,
    warningThreshold = 0.8 // Show warning at 80% of timeout
  } = options;

  // State to track active timeouts
  const [connectionTimeouts, setConnectionTimeouts] = useState(new Map());
  const [timeoutWarnings, setTimeoutWarnings] = useState(new Map());
  
  // Refs to store timeout and warning intervals
  const timeoutRefs = useRef(new Map());
  const warningRefs = useRef(new Map());
  const lastActivityRefs = useRef(new Map());

  /**
   * Start timeout monitoring for a connection
   * @param {string} connectionId - Connection ID
   * @param {number} timeoutDuration - Timeout duration in milliseconds
   */
  const startConnectionTimeout = useCallback((connectionId, timeoutDuration = defaultTimeout) => {
    // Clear existing timeout if any
    clearConnectionTimeout(connectionId);

    const startTime = Date.now();
    lastActivityRefs.current.set(connectionId, startTime);

    // Set up warning timeout (at warningThreshold of total timeout)
    const warningDelay = timeoutDuration * warningThreshold;
    const warningTimeoutId = setTimeout(() => {
      setTimeoutWarnings(prev => new Map(prev.set(connectionId, {
        connectionId,
        warningTime: Date.now(),
        remainingTime: timeoutDuration - warningDelay
      })));

      // Trigger warning callback if provided
      if (onTimeout) {
        onTimeout({
          type: 'warning',
          connectionId,
          remainingTime: timeoutDuration - warningDelay
        });
      }
    }, warningDelay);

    warningRefs.current.set(connectionId, warningTimeoutId);

    // Set up actual timeout
    const timeoutId = setTimeout(() => {
      // Mark connection as timed out
      setConnectionTimeouts(prev => new Map(prev.set(connectionId, {
        connectionId,
        timedOutAt: Date.now(),
        duration: timeoutDuration
      })));

      // Remove warning since we've timed out
      setTimeoutWarnings(prev => {
        const newWarnings = new Map(prev);
        newWarnings.delete(connectionId);
        return newWarnings;
      });

      // Trigger timeout callback if provided
      if (onTimeout) {
        onTimeout({
          type: 'timeout',
          connectionId,
          duration: timeoutDuration
        });
      }

      // Clean up refs
      timeoutRefs.current.delete(connectionId);
      warningRefs.current.delete(connectionId);
      lastActivityRefs.current.delete(connectionId);
    }, timeoutDuration);

    timeoutRefs.current.set(connectionId, timeoutId);
  }, [defaultTimeout, warningThreshold, onTimeout]);

  /**
   * Clear timeout for a connection
   * @param {string} connectionId - Connection ID
   */
  const clearConnectionTimeout = useCallback((connectionId) => {
    // Clear timeout
    const timeoutId = timeoutRefs.current.get(connectionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(connectionId);
    }

    // Clear warning timeout
    const warningId = warningRefs.current.get(connectionId);
    if (warningId) {
      clearTimeout(warningId);
      warningRefs.current.delete(connectionId);
    }

    // Remove from state
    setConnectionTimeouts(prev => {
      const newTimeouts = new Map(prev);
      newTimeouts.delete(connectionId);
      return newTimeouts;
    });

    setTimeoutWarnings(prev => {
      const newWarnings = new Map(prev);
      newWarnings.delete(connectionId);
      return newWarnings;
    });

    // Clean up activity tracking
    lastActivityRefs.current.delete(connectionId);
  }, []);

  /**
   * Reset timeout for a connection (restart the timer)
   * @param {string} connectionId - Connection ID
   * @param {number} timeoutDuration - New timeout duration
   */
  const resetConnectionTimeout = useCallback((connectionId, timeoutDuration = defaultTimeout) => {
    const wasTimedOut = connectionTimeouts.has(connectionId);
    
    // Clear existing timeout
    clearConnectionTimeout(connectionId);
    
    // Start new timeout
    startConnectionTimeout(connectionId, timeoutDuration);

    // If connection was previously timed out, notify about reset
    if (wasTimedOut && onTimeout) {
      onTimeout({
        type: 'reset',
        connectionId,
        duration: timeoutDuration
      });
    }
  }, [defaultTimeout, connectionTimeouts, clearConnectionTimeout, startConnectionTimeout, onTimeout]);

  /**
   * Check if a connection is timed out
   * @param {string} connectionId - Connection ID
   * @returns {boolean} True if connection is timed out
   */
  const isConnectionTimedOut = useCallback((connectionId) => {
    return connectionTimeouts.has(connectionId);
  }, [connectionTimeouts]);

  /**
   * Check if a connection has a timeout warning
   * @param {string} connectionId - Connection ID
   * @returns {boolean} True if connection has warning
   */
  const hasTimeoutWarning = useCallback((connectionId) => {
    return timeoutWarnings.has(connectionId);
  }, [timeoutWarnings]);

  /**
   * Get timeout information for a connection
   * @param {string} connectionId - Connection ID
   * @returns {Object|null} Timeout information
   */
  const getTimeoutInfo = useCallback((connectionId) => {
    const timeout = connectionTimeouts.get(connectionId);
    const warning = timeoutWarnings.get(connectionId);
    const lastActivity = lastActivityRefs.current.get(connectionId);

    if (timeout) {
      return {
        status: 'timed_out',
        timedOutAt: timeout.timedOutAt,
        duration: timeout.duration,
        timeSinceTimeout: Date.now() - timeout.timedOutAt
      };
    }

    if (warning) {
      return {
        status: 'warning',
        warningTime: warning.warningTime,
        remainingTime: warning.remainingTime,
        timeSinceWarning: Date.now() - warning.warningTime
      };
    }

    if (lastActivity) {
      return {
        status: 'active',
        lastActivity: lastActivity,
        timeSinceActivity: Date.now() - lastActivity
      };
    }

    return null;
  }, [connectionTimeouts, timeoutWarnings]);

  /**
   * Get all timed out connections
   * @returns {Array} Array of timed out connection IDs
   */
  const getTimedOutConnections = useCallback(() => {
    return Array.from(connectionTimeouts.keys());
  }, [connectionTimeouts]);

  /**
   * Get all connections with warnings
   * @returns {Array} Array of connection IDs with warnings
   */
  const getWarningConnections = useCallback(() => {
    return Array.from(timeoutWarnings.keys());
  }, [timeoutWarnings]);

  /**
   * Clear all timeouts (useful for cleanup)
   */
  const clearAllTimeouts = useCallback(() => {
    // Clear all timeout timers
    timeoutRefs.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });

    // Clear all warning timers
    warningRefs.current.forEach((warningId) => {
      clearTimeout(warningId);
    });

    // Clear all refs and state
    timeoutRefs.current.clear();
    warningRefs.current.clear();
    lastActivityRefs.current.clear();
    setConnectionTimeouts(new Map());
    setTimeoutWarnings(new Map());
  }, []);

  /**
   * Update activity timestamp for a connection
   * @param {string} connectionId - Connection ID
   */
  const updateActivity = useCallback((connectionId) => {
    lastActivityRefs.current.set(connectionId, Date.now());
  }, []);

  /**
   * Get remaining time before timeout
   * @param {string} connectionId - Connection ID
   * @param {number} originalTimeout - Original timeout duration
   * @returns {number} Remaining time in milliseconds
   */
  const getRemainingTime = useCallback((connectionId, originalTimeout = defaultTimeout) => {
    const lastActivity = lastActivityRefs.current.get(connectionId);
    
    if (!lastActivity) return originalTimeout;
    if (isConnectionTimedOut(connectionId)) return 0;

    const elapsed = Date.now() - lastActivity;
    const remaining = originalTimeout - elapsed;
    
    return Math.max(0, remaining);
  }, [defaultTimeout, isConnectionTimedOut]);

  /**
   * Format remaining time as human-readable string
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} Formatted time string
   */
  const formatRemainingTime = useCallback((milliseconds) => {
    if (milliseconds <= 0) return 'Expired';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Return hook interface
  return {
    // State
    connectionTimeouts,
    timeoutWarnings,
    
    // Core functions
    startConnectionTimeout,
    clearConnectionTimeout,
    resetConnectionTimeout,
    
    // Query functions
    isConnectionTimedOut,
    hasTimeoutWarning,
    getTimeoutInfo,
    getTimedOutConnections,
    getWarningConnections,
    getRemainingTime,
    
    // Utility functions
    updateActivity,
    formatRemainingTime,
    clearAllTimeouts
  };
};

export default useConnectionTimeout;