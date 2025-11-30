// BCrypts.jsx
// BCrypt hash generator component similar to Views

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import BCryptWindow from './BCryptWindow';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './BCrypts.css';

const STORAGE_KEY = 'atf-dev-studio-bcrypts';
const DEFAULT_WINDOW_SIZE = { width: 500, height: 500 };

const BCrypts = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [bcrypts, setBCrypts] = useState([]);
  const [highestZIndex, setHighestZIndex] = useState(100);
  const [statusMessage, setStatusMessage] = useState('');
  const [bcryptStyle, setBCryptStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style bcrypts
  const generateModernColor = useCallback((index) => {
    const colors = [
      '#4f46e5', // indigo
      '#7c3aed', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#ef4444', // red
      '#14b8a6', // teal
      '#8b5cf6', // purple
      '#f97316', // orange
    ];
    return colors[index % colors.length];
  }, []);

  // Auto-align bcrypts helper function
  const alignBCrypts = useCallback((bcryptsToAlign) => {
    if (!bcryptsToAlign || bcryptsToAlign.length === 0) return bcryptsToAlign;
    
    const cols = Math.ceil(Math.sqrt(bcryptsToAlign.length));
    const padding = 20;
    const bcryptWidth = DEFAULT_WINDOW_SIZE.width;
    const bcryptHeight = DEFAULT_WINDOW_SIZE.height;
    
    const startX = padding;
    const startY = padding;
    const spacingX = bcryptWidth + padding;
    const spacingY = bcryptHeight + padding;
    
    return bcryptsToAlign.map((bcrypt, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        ...bcrypt,
        position: {
          x: startX + col * spacingX,
          y: startY + row * spacingY
        }
      };
    });
  }, []);

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved bcrypts and preferences from localStorage
  useEffect(() => {
    try {
      const savedBCrypts = localStorage.getItem(STORAGE_KEY);
      if (savedBCrypts) {
        const parsedBCrypts = JSON.parse(savedBCrypts);
        setBCrypts(parsedBCrypts);
        
        // Determine highest z-index from loaded bcrypts
        const maxZ = parsedBCrypts.reduce((max, bcrypt) => {
          return Math.max(max, bcrypt.zIndex || 100);
        }, 100);
        setHighestZIndex(maxZ);
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.bcryptStyle) setBCryptStyle(prefs.bcryptStyle);
      }
    } catch (error) {
      console.error('Error loading bcrypts:', error);
    }
  }, []);

  // Automatically create one BCrypt window when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return; // Prevent multiple auto-creations
    
    // Check localStorage directly to avoid dependency on bcrypts state
    const savedBCrypts = localStorage.getItem(STORAGE_KEY);
    if (savedBCrypts && JSON.parse(savedBCrypts).length > 0) {
      hasAutoCreatedRef.current = true;
      return; // BCrypts already exist, don't create one
    }
    
    hasAutoCreatedRef.current = true;
    
    // Use setTimeout to ensure state is initialized
    setTimeout(() => {
      // Get current style from localStorage or use default
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).bcryptStyle || 'simple' : 'simple';
      
      setHighestZIndex(prev => {
        const newZIndex = prev + 1;
        const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        
        const newBCrypt = {
          id: uuidv4(),
          title: 'BCrypt 1',
          text: '',
          hash: '',
          rounds: 10,
          position: { x: 100, y: 100 },
          size: { ...DEFAULT_WINDOW_SIZE },
          isMinimized: false,
          zIndex: newZIndex,
          headerColor: headerColor,
          style: currentStyle
        };
        
        setBCrypts([newBCrypt]);
        return newZIndex;
      });
    }, 100);
  }, [generateModernColor]); // Only depend on generateModernColor which is now defined before this

  // Save bcrypts to localStorage whenever they change
  useEffect(() => {
    if (bcrypts.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(bcrypts));
        } catch (error) {
          console.error('Error saving bcrypts to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [bcrypts]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        bcryptStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [bcryptStyle]);

  // Create a new bcrypt window
  const createBCrypt = useCallback(() => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    // Calculate position for new bcrypt (offset to avoid complete overlap)
    const offsetX = (bcrypts.length % 5) * 30;
    const offsetY = (bcrypts.length % 5) * 30;
    
    // Generate color based on style
    const headerColor = bcryptStyle === 'modern' ? generateModernColor(bcrypts.length) : '#4f46e5';
    
    const newBCrypt = {
      id: uuidv4(),
      title: `BCrypt ${bcrypts.length + 1}`,
      text: '',
      hash: '',
      rounds: 10,
      position: { x: 100 + offsetX, y: 100 + offsetY },
      size: { ...DEFAULT_WINDOW_SIZE },
      isMinimized: false,
      zIndex: newZIndex,
      headerColor: headerColor,
      style: bcryptStyle
    };
    
    setBCrypts([...bcrypts, newBCrypt]);
    showStatusMessage(setStatusMessage, 'New BCrypt window created', statusTimeoutRef);
  }, [highestZIndex, bcrypts, bcryptStyle, generateModernColor]);

  // Update a bcrypt's properties
  const updateBCrypt = useCallback((id, updates) => {
    setBCrypts(bcrypts => bcrypts.map(bcrypt => 
      bcrypt.id === id ? { ...bcrypt, ...updates } : bcrypt
    ));
  }, []);

  // Delete a bcrypt
  const deleteBCrypt = useCallback((id) => {
    setBCrypts(bcrypts => bcrypts.filter(bcrypt => bcrypt.id !== id));
    showStatusMessage(setStatusMessage, 'BCrypt window closed', statusTimeoutRef);
  }, []);

  // Bring a bcrypt to the front
  const bringToFront = useCallback((id) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    updateBCrypt(id, { zIndex: newZIndex });
  }, [highestZIndex, updateBCrypt]);

  // Auto-align all bcrypts
  const autoAlignBCrypts = useCallback(() => {
    if (bcrypts.length === 0) return;
    
    const alignedBCrypts = alignBCrypts(bcrypts);
    setBCrypts(alignedBCrypts);
    showStatusMessage(setStatusMessage, 'BCrypt windows aligned', statusTimeoutRef);
  }, [bcrypts, alignBCrypts]);

  // Clear all bcrypts (with confirmation)
  const clearAllBCrypts = useCallback(() => {
    if (bcrypts.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all BCrypt windows? This action cannot be undone.')) {
      setBCrypts([]);
      localStorage.removeItem(STORAGE_KEY);
      showStatusMessage(setStatusMessage, 'All BCrypt windows closed', statusTimeoutRef);
    }
  }, [bcrypts.length]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.bcryptStyle !== undefined) {
      setBCryptStyle(prefs.bcryptStyle);
      // Update existing bcrypts with new style colors
      if (prefs.bcryptStyle === 'modern') {
        setBCrypts(bcrypts => bcrypts.map((bcrypt, index) => ({
          ...bcrypt,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setBCrypts(bcrypts => bcrypts.map(bcrypt => ({
          ...bcrypt,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  return (
    <div className={`bcrypts-container ${dashboardDarkMode ? 'dark-mode' : ''} ${bcryptStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="bcrypts-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-bcrypt-button"
            onClick={createBCrypt}
            title="Create a new BCrypt hash generator window"
          >
            + New BCrypt
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={bcryptStyle}
              onChange={(value) => {
                setBCryptStyle(value);
                updatePreferences({ bcryptStyle: value });
              }}
              name="bcryptStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {bcrypts.length > 0 && (
            <>
              <button
                className="secondary-button auto-align-button"
                onClick={autoAlignBCrypts}
                title="Auto-align all BCrypt windows in a grid"
              >
                Auto Align
              </button>
              <button
                className="secondary-button clear-all-button"
                onClick={clearAllBCrypts}
                title="Close all BCrypt windows (with confirmation)"
              >
                Close All Windows
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bcrypts-area">
        {bcrypts.length === 0 ? (
          <div className="empty-state" onClick={createBCrypt} style={{ cursor: 'pointer' }}>
            <p>No BCrypt windows yet. Click here or "New BCrypt" to create one.</p>
            <p className="hint">Enter text and generate secure BCrypt hashes.</p>
          </div>
        ) : (
          bcrypts.map(bcrypt => (
            <BCryptWindow
              key={bcrypt.id}
              bcrypt={bcrypt}
              updateBCrypt={updateBCrypt}
              deleteBCrypt={deleteBCrypt}
              bringToFront={bringToFront}
              containerRef={containerRef}
              setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
              darkMode={dashboardDarkMode}
              bcryptStyle={bcrypt.style || bcryptStyle}
              headerColor={bcrypt.headerColor}
            />
          ))
        )}
      </div>

      {/* Status message - fixed position, bottom right */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default BCrypts;


