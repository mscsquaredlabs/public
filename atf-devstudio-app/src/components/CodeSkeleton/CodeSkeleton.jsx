// CodeSkeleton.jsx
// Code Skeleton component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import CodeSkeletonTab from './CodeSkeletonTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './CodeSkeleton.css';

const STORAGE_KEY = 'atf-dev-studio-code-skeleton';
const DEFAULT_TAB_TITLE = 'Code Skeleton';

const CodeSkeleton = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [skeletons, setSkeletons] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [skeletonStyle, setSkeletonStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved skeletons and preferences from localStorage
  useEffect(() => {
    try {
      const savedSkeletons = localStorage.getItem(STORAGE_KEY);
      if (savedSkeletons) {
        const parsedSkeletons = JSON.parse(savedSkeletons);
        setSkeletons(parsedSkeletons);
        
        // Set active tab to the first skeleton or the last active one
        if (parsedSkeletons.length > 0) {
          const lastActive = parsedSkeletons.find(s => s.isActive) || parsedSkeletons[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.skeletonStyle) setSkeletonStyle(prefs.skeletonStyle);
      }
    } catch (error) {
      console.error('Error loading skeletons:', error);
    }
  }, []);

  // Save skeletons to localStorage whenever they change
  useEffect(() => {
    if (skeletons.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(skeletons));
        } catch (error) {
          console.error('Error saving skeletons to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [skeletons]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        skeletonStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [skeletonStyle]);

  // Generate color for modern style skeletons
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

  // Create a new skeleton tab
  const createSkeleton = useCallback(() => {
    const headerColor = skeletonStyle === 'modern' ? generateModernColor(skeletons.length) : '#4f46e5';
    
    const newSkeleton = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${skeletons.length + 1}`,
      language: 'javascript',
      templateType: 'component',
      options: {
        includeComments: true,
        includeTests: false,
        includeTypeInfo: true,
        className: 'MyComponent',
        functionName: 'myFunction',
        apiName: 'myApi',
        packageName: 'com.example.myapp',
        authorName: '',
        namespace: 'MyApp',
      },
      generatedCode: '',
      configMode: 'simple',
      headerColor: headerColor,
      style: skeletonStyle,
      isActive: false,
    };
    
    // Mark all existing skeletons as inactive and set new one as active
    const updatedSkeletons = skeletons.map(s => ({ ...s, isActive: false }));
    updatedSkeletons.push({ ...newSkeleton, isActive: true });
    
    setSkeletons(updatedSkeletons);
    setActiveTabId(newSkeleton.id);
    showStatusMessage(setStatusMessage, 'New code skeleton tab created', statusTimeoutRef);
  }, [skeletons, skeletonStyle, generateModernColor]);

  // Update a skeleton's properties
  const updateSkeleton = useCallback((id, updates) => {
    setSkeletons(skeletons => skeletons.map(skeleton => 
      skeleton.id === id ? { ...skeleton, ...updates } : skeleton
    ));
  }, []);

  // Delete a skeleton tab
  const deleteSkeleton = useCallback((id) => {
    const updatedSkeletons = skeletons.filter(skeleton => skeleton.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedSkeletons.length > 0) {
        const newActiveId = updatedSkeletons[0].id;
        setActiveTabId(newActiveId);
        setSkeletons(updatedSkeletons.map((s, index) => ({
          ...s,
          isActive: index === 0
        })));
      } else {
        setActiveTabId(null);
        setSkeletons([]);
      }
    } else {
      setSkeletons(updatedSkeletons);
    }
    
    showStatusMessage(setStatusMessage, 'Code skeleton tab closed', statusTimeoutRef);
  }, [skeletons, activeTabId]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setSkeletons(skeletons => skeletons.map(skeleton => ({
      ...skeleton,
      isActive: skeleton.id === id
    })));
  }, []);

  // Clear all skeletons (with confirmation)
  const clearAllSkeletons = useCallback(() => {
    if (skeletons.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all code skeleton tabs? This action cannot be undone.')) {
      setSkeletons([]);
      setActiveTabId(null);
      localStorage.removeItem(STORAGE_KEY);
      showStatusMessage(setStatusMessage, 'All code skeleton tabs closed', statusTimeoutRef);
    }
  }, [skeletons.length]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.skeletonStyle !== undefined) {
      setSkeletonStyle(prefs.skeletonStyle);
      // Update existing skeletons with new style colors
      if (prefs.skeletonStyle === 'modern') {
        setSkeletons(skeletons => skeletons.map((skeleton, index) => ({
          ...skeleton,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setSkeletons(skeletons => skeletons.map(skeleton => ({
          ...skeleton,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeSkeleton = skeletons.find(s => s.id === activeTabId);

  return (
    <div className={`code-skeleton-container ${dashboardDarkMode ? 'dark-mode' : ''} ${skeletonStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="code-skeleton-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-skeleton-button"
            onClick={createSkeleton}
            title="Create a new code skeleton tab"
          >
            + New Skeleton
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={skeletonStyle}
              onChange={(value) => {
                setSkeletonStyle(value);
                updatePreferences({ skeletonStyle: value });
              }}
              name="skeletonStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {skeletons.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllSkeletons}
              title="Close all code skeleton tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {skeletons.length > 0 && (
        <div className="skeleton-tabs-container">
          <div className="skeleton-tabs">
            {skeletons.map((skeleton, index) => (
              <div
                key={skeleton.id}
                className={`skeleton-tab ${skeleton.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(skeleton.id)}
                style={{
                  borderTopColor: skeleton.id === activeTabId ? skeleton.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{skeleton.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSkeleton(skeleton.id);
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

      {/* Skeleton Content Area */}
      <div className="code-skeleton-area">
        {activeSkeleton ? (
          <CodeSkeletonTab
            skeleton={activeSkeleton}
            updateSkeleton={updateSkeleton}
            deleteSkeleton={deleteSkeleton}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            skeletonStyle={activeSkeleton.style || skeletonStyle}
            headerColor={activeSkeleton.headerColor}
          />
        ) : (
          <div className="empty-state">
            <p>No skeleton tabs yet. Click "New Skeleton" to create one.</p>
            <p className="hint">Define your code structure and generate skeletons for various languages and frameworks.</p>
          </div>
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

export default CodeSkeleton;
