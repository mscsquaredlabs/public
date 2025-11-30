// MarkdownPreviewer.jsx
// Markdown Previewer component with tabbed interface

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import MarkdownTab from './MarkdownTab';
import { v4 as uuidv4 } from 'uuid';
import { showStatusMessage } from '../../shared/utils/bcryptsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import { getWelcomeTemplate, loadTemplatesFromStorage } from '../../shared/utils/markdownUtils';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './MarkdownPreviewer.css';

const STORAGE_KEY = 'atf-dev-studio-markdown-previewer';
const DEFAULT_TAB_TITLE = 'Markdown';

const MarkdownPreviewer = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [markdowns, setMarkdowns] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [markdownStyle, setMarkdownStyle] = useState('simple'); // 'simple' or 'modern'
  
  const containerRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const hasAutoCreatedRef = useRef(false);

  // Generate color for modern style markdowns
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

  // Hide results area when component mounts and restore when it unmounts
  useEffect(() => {
    hideResultsArea();
    return () => {
      restoreResultsArea();
    };
  }, []);

  // Load saved markdowns and preferences from localStorage
  useEffect(() => {
    try {
      const savedMarkdowns = localStorage.getItem(STORAGE_KEY);
      if (savedMarkdowns) {
        const parsedMarkdowns = JSON.parse(savedMarkdowns);
        setMarkdowns(parsedMarkdowns);
        
        // Set active tab to the first markdown or the last active one
        if (parsedMarkdowns.length > 0) {
          const lastActive = parsedMarkdowns.find(m => m.isActive) || parsedMarkdowns[0];
          setActiveTabId(lastActive.id);
        }
      }

      // Load preferences
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.markdownStyle) setMarkdownStyle(prefs.markdownStyle);
      }
    } catch (error) {
      console.error('Error loading markdowns:', error);
    }
  }, []);

  // Save markdowns to localStorage whenever they change
  useEffect(() => {
    if (markdowns.length > 0) {
      const saveToStorage = () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(markdowns));
        } catch (error) {
          console.error('Error saving markdowns to storage:', error);
        }
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [markdowns]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        markdownStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [markdownStyle]);

  // Automatically create one markdown tab when component mounts if none exist
  useEffect(() => {
    if (hasAutoCreatedRef.current) return;
    
    const savedMarkdowns = localStorage.getItem(STORAGE_KEY);
    if (savedMarkdowns && JSON.parse(savedMarkdowns).length > 0) {
      hasAutoCreatedRef.current = true;
      return;
    }
    
    hasAutoCreatedRef.current = true;
    
    setTimeout(() => {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      const currentStyle = savedPrefs ? JSON.parse(savedPrefs).markdownStyle || 'simple' : 'simple';
      
      const headerColor = currentStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const welcomeTemplate = getWelcomeTemplate();
      
      const newMarkdown = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        markdownInput: welcomeTemplate,
        markdownRender: '',
        previewMode: 'split',
        renderOptions: {
          autoRender: true,
          syntaxHighlighting: true,
          showLineNumbers: false,
          sanitize: true,
        },
        headerColor: headerColor,
        style: currentStyle,
        isActive: true,
      };
      
      setMarkdowns([newMarkdown]);
      setActiveTabId(newMarkdown.id);
    }, 100);
  }, [generateModernColor]);

  // Create a new markdown tab
  const createMarkdown = useCallback(() => {
    const headerColor = markdownStyle === 'modern' ? generateModernColor(markdowns.length) : '#4f46e5';
    const welcomeTemplate = getWelcomeTemplate();
    
    const newMarkdown = {
      id: uuidv4(),
      title: `${DEFAULT_TAB_TITLE} ${markdowns.length + 1}`,
      markdownInput: welcomeTemplate,
      markdownRender: '',
      previewMode: 'split',
      renderOptions: {
        autoRender: true,
        syntaxHighlighting: true,
        showLineNumbers: false,
        sanitize: true,
      },
      headerColor: headerColor,
      style: markdownStyle,
      isActive: false,
    };
    
    // Mark all existing markdowns as inactive and set new one as active
    const updatedMarkdowns = markdowns.map(m => ({ ...m, isActive: false }));
    updatedMarkdowns.push({ ...newMarkdown, isActive: true });
    
    setMarkdowns(updatedMarkdowns);
    setActiveTabId(newMarkdown.id);
    showStatusMessage(setStatusMessage, 'New Markdown previewer tab created', statusTimeoutRef);
  }, [markdowns, markdownStyle, generateModernColor]);

  // Update a markdown's properties
  const updateMarkdown = useCallback((id, updates) => {
    setMarkdowns(markdowns => markdowns.map(markdown => 
      markdown.id === id ? { ...markdown, ...updates } : markdown
    ));
  }, []);

  // Delete a markdown tab
  const deleteMarkdown = useCallback((id) => {
    const updatedMarkdowns = markdowns.filter(markdown => markdown.id !== id);
    
    // If we deleted the active tab, activate another one
    if (id === activeTabId) {
      if (updatedMarkdowns.length > 0) {
        const newActiveId = updatedMarkdowns[0].id;
        setActiveTabId(newActiveId);
        setMarkdowns(updatedMarkdowns.map((m, index) => ({
          ...m,
          isActive: index === 0
        })));
      } else {
        // If no tabs remain, create a new one automatically
        const headerColor = markdownStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
        const welcomeTemplate = getWelcomeTemplate();
        const newMarkdown = {
          id: uuidv4(),
          title: `${DEFAULT_TAB_TITLE} 1`,
          markdownInput: welcomeTemplate,
          markdownRender: '',
          previewMode: 'split',
          renderOptions: {
            autoRender: true,
            syntaxHighlighting: true,
            showLineNumbers: false,
            sanitize: true,
          },
          headerColor: headerColor,
          style: markdownStyle,
          isActive: true,
        };
        setMarkdowns([newMarkdown]);
        setActiveTabId(newMarkdown.id);
        showStatusMessage(setStatusMessage, 'New Markdown previewer tab created automatically', statusTimeoutRef);
        return;
      }
    } else {
      setMarkdowns(updatedMarkdowns);
    }
    
    showStatusMessage(setStatusMessage, 'Markdown previewer tab closed', statusTimeoutRef);
  }, [markdowns, activeTabId, markdownStyle, generateModernColor]);

  // Switch to a different tab
  const switchTab = useCallback((id) => {
    setActiveTabId(id);
    setMarkdowns(markdowns => markdowns.map(markdown => ({
      ...markdown,
      isActive: markdown.id === id
    })));
  }, []);

  // Clear all markdowns (with confirmation)
  const clearAllMarkdowns = useCallback(() => {
    if (markdowns.length === 0) return;
    
    if (window.confirm('Are you sure you want to close all Markdown previewer tabs? A new tab will be created automatically.')) {
      localStorage.removeItem(STORAGE_KEY);
      
      const headerColor = markdownStyle === 'modern' ? generateModernColor(0) : '#4f46e5';
      const welcomeTemplate = getWelcomeTemplate();
      const newMarkdown = {
        id: uuidv4(),
        title: `${DEFAULT_TAB_TITLE} 1`,
        markdownInput: welcomeTemplate,
        markdownRender: '',
        previewMode: 'split',
        renderOptions: {
          autoRender: true,
          syntaxHighlighting: true,
          showLineNumbers: false,
          sanitize: true,
        },
        headerColor: headerColor,
        style: markdownStyle,
        isActive: true,
      };
      setMarkdowns([newMarkdown]);
      setActiveTabId(newMarkdown.id);
      showStatusMessage(setStatusMessage, 'All tabs closed, new tab created', statusTimeoutRef);
    }
  }, [markdowns.length, markdownStyle, generateModernColor]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    if (prefs.markdownStyle !== undefined) {
      setMarkdownStyle(prefs.markdownStyle);
      // Update existing markdowns with new style colors
      if (prefs.markdownStyle === 'modern') {
        setMarkdowns(markdowns => markdowns.map((markdown, index) => ({
          ...markdown,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setMarkdowns(markdowns => markdowns.map(markdown => ({
          ...markdown,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [generateModernColor]);

  const activeMarkdown = markdowns.find(m => m.id === activeTabId);

  return (
    <div className={`markdown-previewer-container ${dashboardDarkMode ? 'dark-mode' : ''} ${markdownStyle === 'modern' ? 'modern-style' : ''}`} ref={containerRef}>
      <div className="markdown-previewer-toolbar">
        <div className="toolbar-left">
          <button
            className="action-button create-markdown-button"
            onClick={createMarkdown}
            title="Create a new Markdown previewer tab"
          >
            + New Previewer
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={markdownStyle}
              onChange={(value) => {
                setMarkdownStyle(value);
                updatePreferences({ markdownStyle: value });
              }}
              name="markdownStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>

          {markdowns.length > 0 && (
            <button
              className="secondary-button clear-all-button"
              onClick={clearAllMarkdowns}
              title="Close all Markdown previewer tabs (with confirmation)"
            >
              Close All Tabs
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {markdowns.length > 0 && (
        <div className="markdown-tabs-container">
          <div className="markdown-tabs">
            {markdowns.map((markdown, index) => (
              <div
                key={markdown.id}
                className={`markdown-tab ${markdown.id === activeTabId ? 'active' : ''}`}
                onClick={() => switchTab(markdown.id)}
                style={{
                  borderTopColor: markdown.id === activeTabId ? markdown.headerColor : 'transparent'
                }}
              >
                <span className="tab-title">{markdown.title}</span>
                <button
                  className="tab-close-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMarkdown(markdown.id);
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

      {/* Markdown Content Area */}
      <div className="markdown-previewer-area" onClick={() => {
        if (markdowns.length === 0) {
          createMarkdown();
        }
      }}>
        {activeMarkdown ? (
          <MarkdownTab
            markdown={activeMarkdown}
            updateMarkdown={updateMarkdown}
            deleteMarkdown={deleteMarkdown}
            setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
            darkMode={dashboardDarkMode}
            markdownStyle={activeMarkdown.style || markdownStyle}
            headerColor={activeMarkdown.headerColor}
          />
        ) : (
          <div className="empty-state" style={{ cursor: 'pointer' }}>
            <p>No previewer tabs yet. Click here or "New Previewer" to create one.</p>
            <p className="hint">Edit Markdown and see a live preview. Use this tool for writing documentation, README files, or any Markdown content.</p>
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

export default MarkdownPreviewer;
