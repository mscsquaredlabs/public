// CheatSheet.jsx
// Dev Cheat Sheet component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import CheatSheetTab from './CheatSheetTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import { cheatSheetCategories, cheatSheetItems } from '../../shared/utils/cheatSheetData';
import './CheatSheet.css';

const STORAGE_KEY = 'atf-dev-studio-cheat-sheet';

// Cheat sheet categories for tabs
const SELECTED_CATEGORIES = [
  { id: 'ide-shortcuts', name: 'IDE Shortcuts', icon: '⌨️' },
  { id: 'javascript', name: 'JavaScript', icon: 'JS' },
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'css', name: 'CSS', icon: '🎨' },
  { id: 'git', name: 'Git', icon: '📜' },
  { id: 'data-structures', name: 'Data Structures', icon: '🏗️' },
  { id: 'algorithms', name: 'Algorithms', icon: '🧮' },
  { id: 'database', name: 'Database', icon: '💾' },
  { id: 'devops', name: 'DevOps', icon: '🔄' },
  { id: 'best-practices', name: 'Best Practices', icon: '✅' },
  { id: 'app-creation', name: 'App Creation', icon: '🚀' }
];

const CheatSheet = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [sheets, setSheets] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [cheatStyle, setCheatStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Generate color for modern style sheets
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

  // Initialize tabs from selected categories
  useEffect(() => {
    try {
      // Load preferences first
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      let loadedCheatStyle = 'simple';
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.cheatStyle) {
          loadedCheatStyle = prefs.cheatStyle;
          setCheatStyle(prefs.cheatStyle);
        }
      }

      const savedSheets = localStorage.getItem(STORAGE_KEY);
      if (savedSheets) {
        const parsedSheets = JSON.parse(savedSheets);
        // Sync sheet styles with loaded cheatStyle preference
        const syncedSheets = parsedSheets.map((sheet, index) => ({
          ...sheet,
          style: loadedCheatStyle,
          headerColor: loadedCheatStyle === 'modern' ? generateModernColor(index) : '#4f46e5'
        }));
        setSheets(syncedSheets);
        
        if (syncedSheets.length > 0) {
          const lastActive = syncedSheets.find(s => s.isActive) || syncedSheets[0];
          setActiveTabId(lastActive.id);
        }
      } else {
        // Create initial tabs from selected categories
        const initialSheets = SELECTED_CATEGORIES.map((category, index) => ({
          id: uuidv4(),
          title: category.name,
          categoryId: category.id,
          headerColor: loadedCheatStyle === 'modern' ? generateModernColor(index) : '#4f46e5',
          style: loadedCheatStyle,
          isActive: index === 0,
        }));
        
        setSheets(initialSheets);
        if (initialSheets.length > 0) {
          setActiveTabId(initialSheets[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading cheat sheets:', error);
      // Fallback to initial tabs
      const initialSheets = SELECTED_CATEGORIES.map((category, index) => ({
        id: uuidv4(),
        title: category.name,
        categoryId: category.id,
        headerColor: cheatStyle === 'modern' ? generateModernColor(index) : '#4f46e5',
        style: cheatStyle,
        isActive: index === 0,
      }));
      setSheets(initialSheets);
      if (initialSheets.length > 0) {
        setActiveTabId(initialSheets[0].id);
      }
    }
  }, [generateModernColor]); // Remove cheatStyle from dependencies to prevent re-initialization

  // Save sheets to localStorage whenever they change
  useEffect(() => {
    if (sheets.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
        } catch (error) {
          console.error('Error saving cheat sheets to storage:', error);
        }
      };
      
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [sheets]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        cheatStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [cheatStyle]);

  // Create a new sheet tab
  const createSheet = useCallback(() => {
    // Find the next category that's not already in use
    const usedCategories = sheets.map(s => s.categoryId);
    const availableCategory = SELECTED_CATEGORIES.find(cat => !usedCategories.includes(cat.id));
    
    if (!availableCategory) {
      showStatusMessage(setStatusMessage, 'All cheat sheet categories are already open', statusTimeoutRef);
      return;
    }
    
    const headerColor = cheatStyle === 'modern' ? generateModernColor(sheets.length) : '#4f46e5';
    
    const newSheet = {
      id: uuidv4(),
      title: availableCategory.name,
      categoryId: availableCategory.id,
      headerColor: headerColor,
      style: cheatStyle,
      isActive: false,
    };
    
    const updatedSheets = sheets.map(s => ({ ...s, isActive: false }));
    updatedSheets.push({ ...newSheet, isActive: true });
    
    setSheets(updatedSheets);
    setActiveTabId(newSheet.id);
    showStatusMessage(setStatusMessage, `Opened ${availableCategory.name} cheat sheet`, statusTimeoutRef);
  }, [sheets, cheatStyle, generateModernColor]);

  // Update a sheet's properties
  const updateSheet = useCallback((id, updates) => {
    setSheets(sheets => sheets.map(sheet => 
      sheet.id === id ? { ...sheet, ...updates } : sheet
    ));
  }, []);

  // Delete a sheet tab
  const deleteSheet = useCallback((id) => {
    const updatedSheets = sheets.filter(sheet => sheet.id !== id);
    
    if (id === activeTabId) {
      if (updatedSheets.length > 0) {
        const newActiveId = updatedSheets[0].id;
        setActiveTabId(newActiveId);
        setSheets(updatedSheets.map((s, index) => ({
          ...s,
          isActive: index === 0
        })));
      } else {
        setActiveTabId(null);
        setSheets([]);
      }
    } else {
      setSheets(updatedSheets);
    }
    
    showStatusMessage(setStatusMessage, 'Cheat sheet tab closed', statusTimeoutRef);
  }, [sheets, activeTabId]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setSheets(sheets => sheets.map(sheet => ({
      ...sheet,
      isActive: sheet.id === id
    })));
  }, []);

  // Clear all sheets (with confirmation)
  const clearAllSheets = useCallback(() => {
    if (sheets.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all cheat sheet tabs? This action cannot be undone.')) {
      setSheets([]);
      setActiveTabId(null);
      localStorage.removeItem(STORAGE_KEY);
      showStatusMessage(setStatusMessage, 'All cheat sheet tabs closed', statusTimeoutRef);
    }
  }, [sheets.length]);

  const activeSheet = sheets.find(s => s.id === activeTabId);

  return (
    <div className={`cheat-sheet-container ${dashboardDarkMode ? 'dark-mode' : ''} ${cheatStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="cheat-sheet-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-sheet-button"
            onClick={createSheet}
            title="Open a new cheat sheet category"
          >
            + New Sheet
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={cheatStyle}
              onChange={(newStyle) => {
                setCheatStyle(newStyle);
                setSheets(prevSheets => prevSheets.map((sheet, index) => ({
                  ...sheet,
                  style: newStyle,
                  headerColor: newStyle === 'modern' ? generateModernColor(index) : '#4f46e5'
                })));
              }}
              name="cheatStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {sheets.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllSheets}
              title="Close all cheat sheet tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {sheets.length > 0 && (
        <div className="sheet-tabs-container">
          <div className="sheet-tabs">
            {sheets.map((sheet, index) => (
              <div
                key={sheet.id}
                className={`sheet-tab ${sheet.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(sheet.id)}
                style={{
                  borderTopColor: sheet.id === activeTabId ? sheet.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{sheet.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSheet(sheet.id);
                  }}
                  title="Close tab"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sheet Content Area */}
      <div className="cheat-sheet-area">
        {activeSheet ? (
          <CheatSheetTab
            categoryId={activeSheet.categoryId}
            cheatSheetItems={cheatSheetItems}
            updateCategoryId={(newCategoryId) => updateSheet(activeSheet.id, { categoryId: newCategoryId })}
            setStatusMessage={(message) => {
              showStatusMessage(setStatusMessage, message, statusTimeoutRef);
            }}
            darkMode={dashboardDarkMode}
            cheatStyle={activeSheet.style || cheatStyle}
            headerColor={activeSheet.headerColor}
          />
        ) : (
          <div className="empty-state">
            <p>No cheat sheet tabs yet. Click "New Sheet" to open a cheat sheet category.</p>
            <p className="hint">Browse and utilize cheat sheets for various programming languages, technologies, and development concepts. Select a category to view available cheat sheets.</p>
          </div>
        )}
      </div>

      {/* Status message - fixed position, bottom right */}
      {statusMessage && (
        <div className={`status-message ${dashboardDarkMode ? 'dark-mode' : ''}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default CheatSheet;
