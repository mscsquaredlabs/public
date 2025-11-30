// Terms.jsx
// Main component for the Terminal Windows feature

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import TerminalWindow from './TerminalWindow';
import TermsConfig from './TermsConfig';
import SessionManager from './SessionManager';
import ErrorBoundary from './ErrorBoundary';
import RunExecutable from './RunExecutable';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

import { 
  saveTerminalsToStorage, 
  loadTerminalsFromStorage,
  generateUniqueTitle,
  showStatusMessage,
  hideResultsArea,
  restoreResultsArea
} from '../../shared/utils/termsUtils';
import './Terms.css';

const STORAGE_KEY = 'atf-dev-studio-terms';
const DEFAULT_WINDOW_SIZE = { width: 600, height: 400 };

const Terms = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [terminals, setTerminals] = useState([]);
  const [highestZIndex, setHighestZIndex] = useState(100);
  const [statusMessage, setStatusMessage] = useState('');
  const [sessionManagerVisible, setSessionManagerVisible] = useState(false);
  const [defaultShellType, setDefaultShellType] = useState(() => {
    // Detect OS and set default shell
    const isWindows = navigator.userAgent.includes('Windows');
    return isWindows ? 'cmd' : 'bash';
  });
  const [autoCloseTerminated, setAutoCloseTerminated] = useState(false);
  const [defaultTerminalSize, setDefaultTerminalSize] = useState(DEFAULT_WINDOW_SIZE);
  const [runExecutableVisible, setRunExecutableVisible] = useState(false);
  const [terminalStyle, setTerminalStyle] = useState('classic'); // 'classic' or 'modern'
  
  // Detect OS
  const isWindows = navigator.userAgent.includes('Windows');
  const isMac = navigator.userAgent.includes('Mac');
  
  // Generate color for modern style terminals
  const generateModernColor = useCallback((index) => {
    const colors = [
      '#4f46e5', // indigo
      '#7c3aed', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#ef4444', // red
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
    ];
    return colors[index % colors.length];
  }, []);
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const saveTimerRef = useRef(null);
  
  // Config panel refs
  const panelRootRef = useRef(null);
  const panelWrapperRef = useRef(null);

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    // Hide results area when component mounts
    hideResultsArea();
    
    // Restore results area when component unmounts
    return () => {
      restoreResultsArea();
    };
  }, []);
  
  // Load saved terminals and preferences from localStorage
  useEffect(() => {
    // Load preferences first to get terminalStyle
    let loadedTerminalStyle = 'classic';
    try {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.defaultShellType) setDefaultShellType(prefs.defaultShellType);
        if (prefs.autoCloseTerminated !== undefined) setAutoCloseTerminated(prefs.autoCloseTerminated);
        if (prefs.defaultTerminalSize) setDefaultTerminalSize(prefs.defaultTerminalSize);
        if (prefs.terminalStyle) {
          setTerminalStyle(prefs.terminalStyle);
          loadedTerminalStyle = prefs.terminalStyle;
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    
    // Load terminals
    const savedTerminals = loadTerminalsFromStorage(STORAGE_KEY);
    if (savedTerminals && savedTerminals.length > 0) {
      // Mark all terminals as active but not attached yet, and ensure proper colors
      const initializedTerminals = savedTerminals.map((terminal, index) => {
        const terminalStyle = terminal.style || loadedTerminalStyle;
        const headerColor = terminalStyle === 'modern' 
          ? (terminal.headerColor || generateModernColor(index))
          : (terminal.headerColor || '#4f46e5');
        
        return {
          ...terminal,
          isActive: true,
          isAttached: false,
          isVisible: true,  // Make all terminals visible when returning to the component
          lastActiveAt: new Date().toISOString(), // Update last active time
          style: terminalStyle,
          headerColor: headerColor
        };
      });
      
      setTerminals(initializedTerminals);
      
      // Determine highest z-index from loaded terminals
      const maxZ = initializedTerminals.reduce((max, terminal) => {
        return Math.max(max, terminal.zIndex || 100);
      }, 100);
      setHighestZIndex(maxZ + 1); // Increment to ensure new terminals appear on top
      
      // Show status indicating terminals were restored
      showStatusMessage(setStatusMessage, `${initializedTerminals.length} terminal${initializedTerminals.length > 1 ? 's' : ''} restored`, statusTimeoutRef);
    }
  }, [generateModernColor]);

  // Save terminals to localStorage whenever they change
  useEffect(() => {
    if (terminals.length > 0) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      saveTimerRef.current = setTimeout(() => {
        saveTerminalsToStorage(terminals, STORAGE_KEY);
      }, 300);
    }
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [terminals]);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        defaultShellType,
        autoCloseTerminated,
        defaultTerminalSize,
        terminalStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [defaultShellType, autoCloseTerminated, defaultTerminalSize, terminalStyle]);

  // Clear status message after timeout
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Create a new terminal
  const createTerminal = useCallback((shellType = defaultShellType) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    // Calculate position for new terminal (offset to avoid complete overlap)
    const offsetX = (terminals.length % 5) * 30;
    const offsetY = (terminals.length % 5) * 30;
    
    // Generate header color for modern style terminals
    const headerColor = terminalStyle === 'modern' ? generateModernColor(terminals.length) : '#4f46e5';
    
    const newTerminal = {
      id: uuidv4(),
      title: generateUniqueTitle(terminals),
      position: { x: 100 + offsetX, y: 100 + offsetY },
      size: { ...defaultTerminalSize },
      isMinimized: false,
      zIndex: newZIndex,
      shellType: shellType,
      lastDirectory: isWindows ? 'C:\\' : '~',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isActive: true,
      isVisible: true,
      isAttached: true,
      backgroundProcesses: [],
      style: terminalStyle,
      headerColor: headerColor
    };
    
    setTerminals(prevTerminals => [...prevTerminals, newTerminal]);
    showStatusMessage(setStatusMessage, 'New terminal created', statusTimeoutRef);
  }, [highestZIndex, terminals.length, defaultShellType, defaultTerminalSize, terminalStyle, isWindows, generateModernColor]);

  // Update a terminal's properties
  const updateTerminal = useCallback((id, updates) => {
    setTerminals(prevTerminals => prevTerminals.map(terminal => 
      terminal.id === id ? { ...terminal, ...updates } : terminal
    ));
  }, []);

  // Close a terminal (hide and mark as inactive)
  const closeTerminal = useCallback((id) => {
    updateTerminal(id, { 
      isVisible: false,
      lastActiveAt: new Date().toISOString()
    });
    
    showStatusMessage(setStatusMessage, 'Terminal session running in background', statusTimeoutRef);
  }, [updateTerminal]);
  
  // Terminate a terminal session completely
  const terminateTerminal = useCallback((id) => {
    setTerminals(prevTerminals => prevTerminals.filter(terminal => terminal.id !== id));
    showStatusMessage(setStatusMessage, 'Terminal session terminated', statusTimeoutRef);
  }, []);

  // Bring a terminal to the front
  const bringToFront = useCallback((id) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    updateTerminal(id, { 
      zIndex: newZIndex,
      lastActiveAt: new Date().toISOString()
    });
  }, [highestZIndex, updateTerminal]);
  
  // Reattach a background terminal
  const reattachTerminal = useCallback((id) => {
    updateTerminal(id, { 
      isVisible: true,
      isAttached: true,
      lastActiveAt: new Date().toISOString()
    });
  }, [updateTerminal]);

  // Toggle the visibility of the session manager
  const toggleSessionManager = useCallback(() => {
    setSessionManagerVisible(prevState => !prevState);
  }, []);
  
  // Terminate all terminal sessions
  const terminateAllTerminals = useCallback(() => {
    if (terminals.length === 0) return;
    
    if (window.confirm('Are you sure you want to terminate all terminal sessions? This will close all running processes.')) {
      setTerminals([]);
      localStorage.removeItem(STORAGE_KEY);
      showStatusMessage(setStatusMessage, 'All terminal sessions terminated', statusTimeoutRef);
    }
  }, [terminals.length]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    // Update local preferences
    if (prefs.defaultShellType) setDefaultShellType(prefs.defaultShellType);
    if (prefs.autoCloseTerminated !== undefined) setAutoCloseTerminated(prefs.autoCloseTerminated);
    if (prefs.defaultTerminalSize) setDefaultTerminalSize(prefs.defaultTerminalSize);
    if (prefs.terminalStyle !== undefined) {
      setTerminalStyle(prefs.terminalStyle);
      // Update existing terminals' colors when style changes
      if (prefs.terminalStyle === 'modern') {
        setTerminals(prevTerminals => prevTerminals.map((terminal, index) => ({
          ...terminal,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setTerminals(prevTerminals => prevTerminals.map(terminal => ({
          ...terminal,
          style: 'classic',
          headerColor: '#4f46e5'
        })));
      }
    }
    
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);
  
  // Count active background sessions
  const backgroundSessionCount = terminals.filter(t => t.isActive && !t.isVisible).length;

  // Auto-align all terminals
  const autoAlignTerminals = useCallback(() => {
    if (terminals.length === 0) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const cols = Math.ceil(Math.sqrt(terminals.length));
    const padding = 20;
    const terminalWidth = defaultTerminalSize.width;
    const terminalHeight = defaultTerminalSize.height;
    
    const startX = padding;
    const startY = padding;
    const spacingX = terminalWidth + padding;
    const spacingY = terminalHeight + padding;
    
    terminals.forEach((terminal, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      updateTerminal(terminal.id, {
        position: {
          x: startX + col * spacingX,
          y: startY + row * spacingY
        }
      });
    });
    
    showStatusMessage(setStatusMessage, 'Terminals aligned', statusTimeoutRef);
  }, [terminals, defaultTerminalSize, updateTerminal]);

  // create/unmount root when panel opens/closes
  useEffect(() => {
    if (configPanelOpen) {
      const host = document.querySelector('.config-content');
      if (!host) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'terms-config-wrapper';
      host.appendChild(wrapper);
      panelWrapperRef.current = wrapper;
      panelRootRef.current = createRoot(wrapper);
    } else {
      panelRootRef.current?.unmount();
      panelRootRef.current = null;
      panelWrapperRef.current?.remove();
      panelWrapperRef.current = null;
    }
    return () => {
      panelRootRef.current?.unmount();
      panelWrapperRef.current?.remove();
    };
  }, [configPanelOpen]);

  // render panel when props change & panel is open
  useEffect(() => {
    if (!configPanelOpen || !panelRootRef.current) return;
    panelRootRef.current.render(
      <TermsConfig
        terminals={terminals}
        createTerminal={createTerminal}
        darkMode={dashboardDarkMode}
        defaultShellType={defaultShellType}
        autoCloseTerminated={autoCloseTerminated}
        defaultTerminalSize={defaultTerminalSize}
        terminalStyle={terminalStyle}
        updatePreferences={updatePreferences}
        setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
      />
    );
  }, [
    configPanelOpen, 
    terminals, 
    createTerminal, 
    dashboardDarkMode, 
    defaultShellType, 
    autoCloseTerminated, 
    defaultTerminalSize, 
    terminalStyle,
    updatePreferences
  ]);

  return (
    <div className={`terms-container ${dashboardDarkMode ? 'dark-mode' : ''}`} ref={containerRef}>
      <div className="terms-toolbar">
        <div className="toolbar-left">
          <button 
            className="action-button create-terminal-button"
            onClick={() => createTerminal()}
            title="Create a new terminal session"
          >
            New Terminal
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Classic"
              rightLabel="Modern"
              isActive={terminalStyle}
              onChange={(value) => {
                setTerminalStyle(value);
                updatePreferences({ terminalStyle: value });
              }}
              name="terminalStyle"
              leftValue="classic"
              rightValue="modern"
            />
          </div>
          
          {terminals.length > 0 && (
            <button
              className="secondary-button auto-align-button"
              onClick={autoAlignTerminals}
              title="Auto-align all terminals in a grid"
            >
              Auto Align
            </button>
          )}
          
          <button
            className="secondary-button"
            onClick={() => setRunExecutableVisible(true)}
            title="Run batch file or executable"
          >
            Run Executable
          </button>
        </div>

        <div className="toolbar-center">
          <button
            className="secondary-button"
            onClick={toggleSessionManager}
            title="Manage background sessions"
          >
            {backgroundSessionCount > 0 && (
              <span className="badge">{backgroundSessionCount}</span>
            )}
            <span>Background Sessions</span>
          </button>
        </div>
        
        {terminals.length > 0 && (
          <button 
            className="secondary-button" 
            onClick={terminateAllTerminals}
            title="Terminate all terminal sessions"
          >
            Terminate All
          </button>
        )}
      </div>
      
      <div className="terminals-area">
        {terminals.filter(t => t.isVisible).length === 0 ? (
          <div className="empty-state">
            <p>No active terminals. Click "New Terminal" to create one.</p>
            <p className="hint">Terminal sessions will continue running in the background when closed.</p>
          </div>
        ) : (
          terminals
            .filter(terminal => terminal.isVisible)
            .map(terminal => (
              <ErrorBoundary key={terminal.id}>
                <TerminalWindow
                  terminal={terminal}
                  updateTerminal={updateTerminal}
                  closeTerminal={closeTerminal}
                  terminateTerminal={terminateTerminal}
                  bringToFront={bringToFront}
                  containerRef={containerRef}
                  setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
                  darkMode={dashboardDarkMode}
                  terminalStyle={terminal.style || terminalStyle}
                  isWindows={isWindows}
                  isMac={isMac}
                  headerColor={terminal.headerColor}
                />
              </ErrorBoundary>
            ))
        )}
      </div>
      
      {sessionManagerVisible && (
        <SessionManager
          terminals={terminals.filter(t => t.isActive)}
          closeManager={() => setSessionManagerVisible(false)}
          reattachTerminal={reattachTerminal}
          terminateTerminal={terminateTerminal}
          darkMode={dashboardDarkMode}
        />
      )}

      {runExecutableVisible && (
        <RunExecutable
          darkMode={dashboardDarkMode}
          onClose={() => setRunExecutableVisible(false)}
          onRun={(result) => {
            if (result.success) {
              showStatusMessage(setStatusMessage, 'Executable ran successfully', statusTimeoutRef);
            } else {
              showStatusMessage(setStatusMessage, `Error: ${result.error || 'Execution failed'}`, statusTimeoutRef);
            }
          }}
        />
      )}

      {/* Status message - fixed position, outside normal flow */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default Terms;