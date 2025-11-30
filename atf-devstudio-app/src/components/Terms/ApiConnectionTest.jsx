// ApiConnectionTest.jsx - Fixed with request throttling
import React, { useState, useEffect, useRef } from 'react';
// Import from the server directory where the file actually is
import terminalService from '../../shared/services/terminalService';

const ApiConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [requestInProgress, setRequestInProgress] = useState(false);
  
  // Use refs to track component mounted state and prevent multiple requests
  const isMounted = useRef(true);
  const testTimeoutRef = useRef(null);
  const retryCount = useRef(0);
  
  // Function to test connection with throttling
  const testConnection = async (force = false) => {
    // Prevent multiple simultaneous requests
    if (requestInProgress && !force) return;
    
    try {
      setRequestInProgress(true);
      setStatus('Testing...');
      
      console.log(`Testing terminal API connection... (Attempt: ${retryCount.current + 1})`);
      const result = await terminalService.testConnection();
      console.log('API test result:', result);
      
      if (!isMounted.current) return;
      
      setLastChecked(new Date().toLocaleTimeString());
      
      if (result.error) {
        setStatus('Failed');
        setError(result.error);
        
        // Limit retry attempts to prevent flooding
        if (retryCount.current < 3) {
          // Exponential backoff for retries
          const retryDelay = Math.min(2000 * Math.pow(2, retryCount.current), 30000);
          console.log(`Will retry in ${retryDelay}ms (attempt ${retryCount.current + 1}/3)`);
          
          // Clear any existing timeout
          if (testTimeoutRef.current) {
            clearTimeout(testTimeoutRef.current);
          }
          
          // Set up retry with backoff
          testTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              retryCount.current++;
              testConnection();
            }
          }, retryDelay);
        }
      } else {
        setStatus('Connected');
        setError(null);
        retryCount.current = 0;
        
        // Don't hide automatically for debugging purposes
        // setTimeout(() => isMounted.current && setIsVisible(false), 5000);
      }
    } catch (err) {
      if (!isMounted.current) return;
      
      console.error('API test error:', err);
      setStatus('Failed');
      setError(err.message);
      
      // Same retry logic as above
      if (retryCount.current < 3) {
        const retryDelay = Math.min(2000 * Math.pow(2, retryCount.current), 30000);
        console.log(`Will retry in ${retryDelay}ms (attempt ${retryCount.current + 1}/3)`);
        
        if (testTimeoutRef.current) {
          clearTimeout(testTimeoutRef.current);
        }
        
        testTimeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            retryCount.current++;
            testConnection();
          }
        }, retryDelay);
      }
    } finally {
      if (isMounted.current) {
        setRequestInProgress(false);
      }
    }
  };
  
  // Run the test only once on component mount
  useEffect(() => {
    testConnection();
    
    return () => {
      isMounted.current = false;
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
    };
  }, []);
  
  // Don't render anything if not visible
  if (!isVisible) return null;
  
  return (
    <div 
      className={`api-connection-test ${status.toLowerCase()} ${expanded ? 'expanded' : ''}`} 
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        borderRadius: '4px',
        zIndex: 1000,
        backgroundColor: status === 'Connected' ? '#d4edda' : status === 'Testing...' ? '#fff3cd' : '#f8d7da',
        color: status === 'Connected' ? '#155724' : status === 'Testing...' ? '#856404' : '#721c24',
        border: `1px solid ${status === 'Connected' ? '#c3e6cb' : status === 'Testing...' ? '#ffeeba' : '#f5c6cb'}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '220px',
        maxWidth: '350px',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: status === 'Testing...' ? '#ffc107' : status === 'Connected' ? '#28a745' : '#dc3545'
          }} />
          <div style={{ fontWeight: 'bold' }}>Terminal API: {status}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => {
              retryCount.current = 0;
              testConnection(true);
            }}
            disabled={requestInProgress}
            title="Retest connection"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: requestInProgress ? 'not-allowed' : 'pointer',
              color: 'inherit',
              padding: '0 4px',
              opacity: requestInProgress ? 0.5 : 1
            }}
          >
            🔄
          </button>
          <button 
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Show less" : "Show more info"}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              color: 'inherit',
              padding: '0 4px'
            }}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            title="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: 'inherit',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>
      </div>
      
      {expanded && (
        <div style={{ 
          marginTop: '8px',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px' 
        }}>
          {lastChecked && (
            <div>Last checked: {lastChecked}</div>
          )}
          
          {error && (
            <div style={{ 
              marginTop: '4px', 
              padding: '4px 8px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '3px',
              wordBreak: 'break-word'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={() => {
                window.open('http://localhost:3001/test.html', '_blank');
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              Open Test Page
            </button>
            
            <button
              onClick={() => {
                const serverStatus = {
                  nodeVersion: process.versions ? process.versions.node : 'Unknown',
                  browser: navigator.userAgent,
                  connectionStatus: status,
                  lastChecked: lastChecked || 'Never',
                  error: error || 'None'
                };
                console.log('Terminal Server Status:', serverStatus);
                alert('Diagnostic info logged to console');
              }}
              style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiConnectionTest;