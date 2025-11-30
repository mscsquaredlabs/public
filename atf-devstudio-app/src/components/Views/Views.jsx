// Views.jsx
// Folder monitoring component similar to Mems

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ViewWindow from './ViewWindow';
import FolderPathModal from './FolderPathModal';
import { v4 as uuidv4 } from 'uuid';
import { fetchFolderContents, showStatusMessage } from '../../shared/utils/viewsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './Views.css';

const STORAGE_KEY = 'atf-dev-studio-views';
const DEFAULT_WINDOW_SIZE = { width: 500, height: 400 };

const Views = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [views, setViews] = useState([]);
  const [highestZIndex, setHighestZIndex] = useState(100);
  const [statusMessage, setStatusMessage] = useState('');
  const [viewStyle, setViewStyle] = useState('simple'); // 'simple' or 'modern'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  // Auto-align views helper function
  const alignViews = useCallback((viewsToAlign) => {
    if (!viewsToAlign || viewsToAlign.length === 0) return viewsToAlign;
    
    const cols = Math.ceil(Math.sqrt(viewsToAlign.length));
    const padding = 20;
    const viewWidth = DEFAULT_WINDOW_SIZE.width;
    const viewHeight = DEFAULT_WINDOW_SIZE.height;
    
    const startX = padding;
    const startY = padding;
    const spacingX = viewWidth + padding;
    const spacingY = viewHeight + padding;
    
    return viewsToAlign.map((view, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        ...view,
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

  // Load saved views and preferences from localStorage
  useEffect(() => {
    try {
      const savedViews = localStorage.getItem(STORAGE_KEY);
      if (savedViews) {
        const parsedViews = JSON.parse(savedViews);
        setViews(parsedViews);
        
        // Determine highest z-index from loaded views
        const maxZ = parsedViews.reduce((max, view) => {
          return Math.max(max, view.zIndex || 100);
        }, 100);
        setHighestZIndex(maxZ);
      } else {
        // Create default Documents view
        const defaultView = {
          id: uuidv4(),
          title: 'Documents',
          folderPath: 'Documents',
          position: { x: 100, y: 100 },
          size: { ...DEFAULT_WINDOW_SIZE },
          isMinimized: false,
          zIndex: 100,
          contents: [],
          lastUpdated: null,
        };
        setViews([defaultView]);
        
        // Load initial contents for default view
        fetchFolderContents('Documents')
          .then(data => {
            setViews(prevViews => prevViews.map(view => 
              view.id === defaultView.id 
                ? { ...view, contents: data.contents, lastUpdated: new Date().toISOString() }
                : view
            ));
          })
          .catch(err => {
            console.error('Error loading default Documents folder:', err);
          });
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.viewStyle) setViewStyle(prefs.viewStyle);
      }
    } catch (error) {
      console.error('Error loading views:', error);
      // Create default view on error
      const defaultView = {
        id: uuidv4(),
        title: 'Documents',
        folderPath: 'Documents',
        position: { x: 100, y: 100 },
        size: { ...DEFAULT_WINDOW_SIZE },
        isMinimized: false,
        zIndex: 100,
        contents: [],
        lastUpdated: null,
      };
      setViews([defaultView]);
    }
  }, []);

  // Save views to localStorage whenever they change
  useEffect(() => {
    if (views.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
        } catch (error) {
          console.error('Error saving views to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [views]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        viewStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [viewStyle]);

  // Generate color for modern style views
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

  // Create a new view
  const createView = useCallback(async (folderPath, title = null) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    // Calculate position for new view (offset to avoid complete overlap)
    const offsetX = (views.length % 5) * 30;
    const offsetY = (views.length % 5) * 30;
    
    // Generate color based on style
    const headerColor = viewStyle === 'modern' ? generateModernColor(views.length) : '#4f46e5';
    
    const displayTitle = title || folderPath.split(/[/\\]/).pop() || folderPath;
    
    const newView = {
      id: uuidv4(),
      title: displayTitle,
      folderPath: folderPath,
      position: { x: 100 + offsetX, y: 100 + offsetY },
      size: { ...DEFAULT_WINDOW_SIZE },
      isMinimized: false,
      zIndex: newZIndex,
      contents: [],
      lastUpdated: null,
      headerColor: headerColor,
      style: viewStyle
    };
    
    // Load initial contents
    try {
      const data = await fetchFolderContents(folderPath);
      newView.contents = data.contents;
      newView.lastUpdated = new Date().toISOString();
    } catch (error) {
      console.error('Error loading folder contents:', error);
    }
    
    setViews([...views, newView]);
    showStatusMessage(setStatusMessage, `Created view: ${displayTitle}`, statusTimeoutRef);
  }, [highestZIndex, views, viewStyle, generateModernColor]);

  // Open folder path modal
  const browseForFolder = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Handle folder path confirmation from modal
  const handleFolderPathConfirm = useCallback(async (folderPath) => {
    setIsModalOpen(false);
    try {
      await createView(folderPath);
    } catch (error) {
      console.error('Error creating view:', error);
      showStatusMessage(setStatusMessage, 'Error creating folder view', statusTimeoutRef);
    }
  }, [createView]);

  // Update a view's properties
  const updateView = useCallback((id, updates) => {
    setViews(views => views.map(view => 
      view.id === id ? { ...view, ...updates } : view
    ));
  }, []);

  // Delete a view
  const deleteView = useCallback((id) => {
    setViews(views => views.filter(view => view.id !== id));
    showStatusMessage(setStatusMessage, 'View closed', statusTimeoutRef);
  }, []);

  // Bring a view to the front
  const bringToFront = useCallback((id) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    updateView(id, { zIndex: newZIndex });
  }, [highestZIndex, updateView]);

  // Auto-align all views
  const autoAlignViews = useCallback(() => {
    if (views.length === 0) return;
    
    const alignedViews = alignViews(views);
    setViews(alignedViews);
    showStatusMessage(setStatusMessage, 'Views aligned', statusTimeoutRef);
  }, [views, alignViews]);

  // Clear all views (with confirmation)
  const clearAllViews = useCallback(() => {
    if (views.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all views? This action cannot be undone.')) {
      setViews([]);
      localStorage.removeItem(STORAGE_KEY);
      showStatusMessage(setStatusMessage, 'All views closed', statusTimeoutRef);
    }
  }, [views.length]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.viewStyle !== undefined) {
      setViewStyle(prefs.viewStyle);
      // Update existing views with new style colors
      if (prefs.viewStyle === 'modern') {
        setViews(views => views.map((view, index) => ({
          ...view,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setViews(views => views.map(view => ({
          ...view,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  return (
    <div className="views-container" ref={containerRef}>
      <div className="views-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-view-button"
            onClick={browseForFolder}
            title="Open a new folder view"
          >
            + New View
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={viewStyle}
              onChange={(value) => {
                setViewStyle(value);
                updatePreferences({ viewStyle: value });
              }}
              name="viewStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {views.length > 0 && (
            <>
              <button
                className="secondary-button auto-align-button"
                onClick={autoAlignViews}
                title="Auto-align all views in a grid"
              >
                Auto Align
              </button>
              <button
                className="secondary-button clear-all-button"
                onClick={clearAllViews}
                title="Close all views (with confirmation)"
              >
                Close All Views
              </button>
            </>
          )}
        </div>
      </div>

      <div className="views-area">
        {views.length === 0 ? (
          <div className="empty-state">
            <p>No folder views yet. Click "New View" to open a folder.</p>
            <p className="hint">Views automatically refresh every 30 seconds.</p>
          </div>
        ) : (
          views.map(view => (
            <ViewWindow
              key={view.id}
              view={view}
              updateView={updateView}
              deleteView={deleteView}
              bringToFront={bringToFront}
              containerRef={containerRef}
              setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
              darkMode={dashboardDarkMode}
              viewStyle={view.style || viewStyle}
              headerColor={view.headerColor}
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

      {/* Folder Path Modal */}
      <FolderPathModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFolderPathConfirm}
        darkMode={dashboardDarkMode}
      />
    </div>
  );
};

export default Views;

