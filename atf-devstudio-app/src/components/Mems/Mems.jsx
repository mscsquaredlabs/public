// Mems.jsx
// Updated to integrate with Dashboard dark mode

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import NotepadWindow from './NotepadWindow';
import MemsConfig from './MemsConfig';
import ConfirmationModal from './ConfirmationModal';
import { createRoot } from 'react-dom/client';
import { v4 as uuidv4 } from 'uuid';
import { 
  saveNotepadsToStorage, 
  loadNotepadsFromStorage,
  generateUniqueTitle,
  showStatusMessage,
  getDefaultContent,
  saveNotepad,
  generateFilename,
  saveDirectoryHandle,
  loadDirectoryHandle,
  loadAtfmemFiles
} from '../../shared/utils/memsUtils';
import { hideResultsArea, restoreResultsArea } from '../../shared/utils/resultsAreaToggle';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';
import './Mems.css';

const STORAGE_KEY = 'atf-dev-studio-mems';
const DEFAULT_WINDOW_SIZE = { width: 350, height: 300 };

const Mems = () => {
  // Get the dark mode state from Dashboard context
  const [configPanelOpen, setConfigPanelOpen, handleResultsUpdate, dashboardDarkMode, setDashboardDarkMode] = useOutletContext();
  
  const [notepads, setNotepads] = useState([]);
  const [highestZIndex, setHighestZIndex] = useState(100);
  const [statusMessage, setStatusMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });
  
  // User preferences - use Dashboard's dark mode state
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [defaultTabSize, setDefaultTabSize] = useState(2);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [defaultNoteSize, setDefaultNoteSize] = useState(DEFAULT_WINDOW_SIZE);
  const [saveToLocalFolder, setSaveToLocalFolder] = useState(true);
  const [saveFolderPath, setSaveFolderPath] = useState('');
  const [noteStyle, setNoteStyle] = useState('simple'); // 'simple' or 'modern'
  const [savedNotes, setSavedNotes] = useState(new Set()); // Track which notes have been saved
  const [directoryHandle, setDirectoryHandle] = useState(null); // Store directory handle for saving
  
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const folderInputRef = useRef(null);
  
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

  // Auto-align notepads helper function (defined early so it can be used in load effects)
  const alignNotepads = useCallback((notepadsToAlign) => {
    if (!notepadsToAlign || notepadsToAlign.length === 0) return notepadsToAlign;
    
    const cols = Math.ceil(Math.sqrt(notepadsToAlign.length));
    const padding = 20;
    const noteWidth = defaultNoteSize.width;
    const noteHeight = defaultNoteSize.height;
    
    const startX = padding;
    const startY = padding;
    const spacingX = noteWidth + padding;
    const spacingY = noteHeight + padding;
    
    return notepadsToAlign.map((notepad, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        ...notepad,
        position: {
          x: startX + col * spacingX,
          y: startY + row * spacingY
        }
      };
    });
  }, [defaultNoteSize]);
  
  // Load saved notepads and preferences from localStorage
  useEffect(() => {
    // Load notepads - keep their saved positions (no auto-align on initial load)
    const savedNotepads = loadNotepadsFromStorage(STORAGE_KEY);
    if (savedNotepads && savedNotepads.length > 0) {
      setNotepads(savedNotepads);
      
      // Determine highest z-index from loaded notepads
      const maxZ = savedNotepads.reduce((max, notepad) => {
        return Math.max(max, notepad.zIndex || 100);
      }, 100);
      setHighestZIndex(maxZ);
    }
    
    // Load preferences
    try {
      const savedPrefs = localStorage.getItem(`${STORAGE_KEY}-prefs`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.spellCheckEnabled !== undefined) setSpellCheckEnabled(prefs.spellCheckEnabled);
        if (prefs.defaultTabSize) setDefaultTabSize(prefs.defaultTabSize);
        if (prefs.autoSaveInterval) setAutoSaveInterval(prefs.autoSaveInterval);
        if (prefs.defaultNoteSize) setDefaultNoteSize(prefs.defaultNoteSize);
        // Default saveToLocalFolder to true if not set
        setSaveToLocalFolder(prefs.saveToLocalFolder !== undefined ? prefs.saveToLocalFolder : true);
        if (prefs.saveFolderPath) setSaveFolderPath(prefs.saveFolderPath);
        if (prefs.noteStyle) setNoteStyle(prefs.noteStyle);
      } else {
        // If no saved preferences, ensure saveToLocalFolder defaults to true
        setSaveToLocalFolder(true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // On error, ensure saveToLocalFolder defaults to true
      setSaveToLocalFolder(true);
    }

    // Load saved directory handle from IndexedDB and load files
    const loadSavedHandle = async () => {
      try {
        const handle = await loadDirectoryHandle();
        if (handle) {
          setDirectoryHandle(handle);
          // Update the folder path display with the handle name
          // Note: Browser security prevents showing full path, only folder name is available
          const folderName = handle.name;
          setSaveFolderPath(folderName);
          console.log('Restored directory handle:', folderName);
          
          // Load all atfmem- files from the restored folder
          try {
            const loadedNotepads = await loadAtfmemFiles(handle);
            
            if (loadedNotepads.length > 0) {
              // Set z-index for loaded notepads
              const notepadsWithZIndex = loadedNotepads.map((notepad, index) => ({
                ...notepad,
                zIndex: 100 + index + 1
              }));
              
              // Update highest z-index
              const maxZ = Math.max(...notepadsWithZIndex.map(n => n.zIndex), 100);
              setHighestZIndex(maxZ + 1);
              
              // Add loaded notepads to existing notepads (if any)
              setNotepads(prevNotepads => {
                // Check if notepads already exist to avoid duplicates (check by title and content)
                const existingNotepads = new Map(prevNotepads.map(n => [`${n.title}|${n.content}`, n]));
                const newNotepads = notepadsWithZIndex.filter(n => {
                  const key = `${n.title}|${n.content}`;
                  return !existingNotepads.has(key);
                });
                return [...prevNotepads, ...newNotepads];
              });
              
              // Mark all loaded notes as saved since they came from files
              setSavedNotes(prev => {
                const newSet = new Set(prev);
                notepadsWithZIndex.forEach(notepad => {
                  newSet.add(notepad.id);
                });
                return newSet;
              });
              
              console.log(`Loaded ${loadedNotepads.length} note(s) from restored folder`);
            }
          } catch (loadError) {
            console.error('Error loading files from restored folder:', loadError);
          }
        }
      } catch (error) {
        console.error('Error loading directory handle:', error);
      }
    };
    
    loadSavedHandle();
  }, []);

  // Save notepads to localStorage whenever they change
  useEffect(() => {
    if (notepads.length > 0) {
      const saveToStorage = () => {
        saveNotepadsToStorage(notepads, STORAGE_KEY);
      };
      
      // Debounce saving to localStorage
      const timeoutId = setTimeout(saveToStorage, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [notepads]);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        spellCheckEnabled,
        defaultTabSize,
        autoSaveInterval,
        defaultNoteSize,
        saveToLocalFolder,
        saveFolderPath,
        noteStyle
      };
      localStorage.setItem(`${STORAGE_KEY}-prefs`, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [spellCheckEnabled, defaultTabSize, autoSaveInterval, defaultNoteSize, saveToLocalFolder, saveFolderPath, noteStyle]);

  // Set up auto-save timer
  useEffect(() => {
    if (autoSaveInterval > 0 && notepads.length > 0) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setInterval(() => {
        saveNotepadsToStorage(notepads, STORAGE_KEY);
      }, autoSaveInterval * 1000);
      
      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
  }, [autoSaveInterval, notepads]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear status message after timeout
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Check if there are unsaved notes (only count notes with content)
  const hasUnsavedNotes = useCallback(() => {
    return notepads.some(notepad => {
      const hasContent = notepad.content && notepad.content.trim().length > 0;
      return hasContent && !savedNotes.has(notepad.id);
    });
  }, [notepads, savedNotes]);

  // Warn before leaving if there are unsaved notes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedNotes()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved notes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedNotes]);

  // Generate color for modern style notes
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

  // Create a new notepad
  const createNotepad = useCallback((syntax = 'plain') => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    // Calculate position for new notepad (offset to avoid complete overlap)
    const offsetX = (notepads.length % 5) * 30;
    const offsetY = (notepads.length % 5) * 30;
    
    // Generate color based on style
    const headerColor = noteStyle === 'modern' ? generateModernColor(notepads.length) : '#4f46e5';
    
    const newNotepad = {
      id: uuidv4(),
      title: generateUniqueTitle(notepads),
      content: getDefaultContent(syntax),
      position: { x: 100 + offsetX, y: 100 + offsetY },
      size: { ...defaultNoteSize },
      isMinimized: false,
      zIndex: newZIndex,
      syntax: syntax,
      spellCheckEnabled: spellCheckEnabled,
      headerColor: headerColor,
      style: noteStyle
    };
    
    setNotepads([...notepads, newNotepad]);
    // New notes start as unsaved
    setSavedNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(newNotepad.id); // Ensure it's not marked as saved
      return newSet;
    });
    showStatusMessage(setStatusMessage, 'New note created', statusTimeoutRef);
  }, [highestZIndex, notepads, defaultNoteSize, spellCheckEnabled, noteStyle, generateModernColor]);
  
  // Create a new notepad with template
  const createNotepadWithTemplate = useCallback((syntax) => {
    createNotepad(syntax);
    setDropdownOpen(false);
  }, [createNotepad]);

  // Update a notepad's properties
  const updateNotepad = useCallback((id, updates, markAsUnsaved = true) => {
    setNotepads(notepads => notepads.map(notepad => 
      notepad.id === id ? { ...notepad, ...updates } : notepad
    ));
    // Mark as unsaved when content or title changes (unless explicitly told not to)
    if (markAsUnsaved && (updates.content !== undefined || updates.title !== undefined || updates.syntax !== undefined)) {
      setSavedNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);

  // Delete a notepad
  const deleteNotepad = useCallback((id) => {
    // Check if note has unsaved changes
    const notepad = notepads.find(n => n.id === id);
    if (notepad && !savedNotes.has(id) && notepad.content.trim().length > 0) {
      setConfirmationModal({
        isOpen: true,
        title: 'Delete Note',
        message: 'This note has unsaved changes. Are you sure you want to delete it?',
        onConfirm: () => {
          setNotepads(notepads => notepads.filter(notepad => notepad.id !== id));
          setSavedNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          showStatusMessage(setStatusMessage, 'Note deleted', statusTimeoutRef);
        },
        confirmText: 'Delete',
        cancelText: 'Cancel'
      });
      return;
    }
    
    setNotepads(notepads => notepads.filter(notepad => notepad.id !== id));
    setSavedNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    showStatusMessage(setStatusMessage, 'Note deleted', statusTimeoutRef);
  }, [notepads, savedNotes]);

  // Bring a notepad to the front
  const bringToFront = useCallback((id) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);
    
    updateNotepad(id, { zIndex: newZIndex });
  }, [highestZIndex, updateNotepad]);

  // Clear all notepads (with confirmation)
  const clearAllNotepads = useCallback(() => {
    if (notepads.length === 0) return;
    
    setConfirmationModal({
      isOpen: true,
      title: 'Clear All Notes',
      message: 'Are you sure you want to delete all notes? This action cannot be undone.',
      onConfirm: () => {
        setNotepads([]);
        localStorage.removeItem(STORAGE_KEY);
        showStatusMessage(setStatusMessage, 'All notes cleared', statusTimeoutRef);
      },
      confirmText: 'Delete All',
      cancelText: 'Cancel'
    });
  }, [notepads.length]);

  // Toggle dropdown menu
  const toggleDropdown = useCallback(() => {
    setDropdownOpen(!dropdownOpen);
  }, [dropdownOpen]);

  // Toggle dark mode - now updates the Dashboard state
  const toggleDarkMode = useCallback(() => {
    setDashboardDarkMode(!dashboardDarkMode);
  }, [dashboardDarkMode, setDashboardDarkMode]);

  // Update preferences
  const updatePreferences = useCallback((prefs) => {
    // Update Dashboard dark mode if this preference is being changed
    if (prefs.darkMode !== undefined) {
      setDashboardDarkMode(prefs.darkMode);
    }
    
    // Update local preferences
    if (prefs.spellCheckEnabled !== undefined) setSpellCheckEnabled(prefs.spellCheckEnabled);
    if (prefs.defaultTabSize) setDefaultTabSize(prefs.defaultTabSize);
    if (prefs.autoSaveInterval) setAutoSaveInterval(prefs.autoSaveInterval);
    if (prefs.defaultNoteSize) setDefaultNoteSize(prefs.defaultNoteSize);
    if (prefs.saveToLocalFolder !== undefined) setSaveToLocalFolder(prefs.saveToLocalFolder);
    if (prefs.saveFolderPath !== undefined) setSaveFolderPath(prefs.saveFolderPath);
    if (prefs.noteStyle !== undefined) {
      setNoteStyle(prefs.noteStyle);
      // Update existing notepads with new style colors
      if (prefs.noteStyle === 'modern') {
        setNotepads(notepads => notepads.map((notepad, index) => ({
          ...notepad,
          style: 'modern',
          headerColor: generateModernColor(index)
        })));
      } else {
        setNotepads(notepads => notepads.map(notepad => ({
          ...notepad,
          style: 'simple',
          headerColor: '#4f46e5'
        })));
      }
    }
    
    // Apply spell check to all existing notepads
    if (prefs.spellCheckEnabled !== undefined) {
      setNotepads(notepads => notepads.map(notepad => ({
        ...notepad,
        spellCheckEnabled: prefs.spellCheckEnabled
      })));
    }
    
    showStatusMessage(setStatusMessage, 'Settings updated', statusTimeoutRef);
  }, [setDashboardDarkMode, generateModernColor]);

  // Browse for folder - always shows the directory picker
  const browseForFolder = useCallback(async () => {
    try {
      // Check if File System Access API is available
      if ('showDirectoryPicker' in window) {
        // Always show the directory picker
        const handle = await window.showDirectoryPicker({
          mode: 'readwrite'
        });
        
        // Get the folder name (we can't get full path in browser for security)
        const folderName = handle.name;
        setSaveFolderPath(folderName);
        setDirectoryHandle(handle); // Store handle for saving files
        
        // Save handle to IndexedDB for persistence
        await saveDirectoryHandle(handle);
        
        updatePreferences({ saveFolderPath: folderName });
        showStatusMessage(setStatusMessage, `Selected folder: ${folderName}`, statusTimeoutRef);
        
        // Load all atfmem- files from the selected folder
        try {
          showStatusMessage(setStatusMessage, 'Loading notes from folder...', statusTimeoutRef);
          const loadedNotepads = await loadAtfmemFiles(handle);
          
          if (loadedNotepads.length > 0) {
            // Set z-index for loaded notepads
            const notepadsWithZIndex = loadedNotepads.map((notepad, index) => ({
              ...notepad,
              zIndex: highestZIndex + index + 1
            }));
            
            // Update highest z-index
            const maxZ = Math.max(...notepadsWithZIndex.map(n => n.zIndex), highestZIndex);
            setHighestZIndex(maxZ + 1);
            
            // Add loaded notepads to existing notepads (avoid duplicates)
            setNotepads(prevNotepads => {
              // Check if notepads already exist to avoid duplicates (check by title and content)
              const existingNotepads = new Map(prevNotepads.map(n => [`${n.title}|${n.content}`, n]));
              const newNotepads = notepadsWithZIndex.filter(n => {
                const key = `${n.title}|${n.content}`;
                return !existingNotepads.has(key);
              });
              return [...prevNotepads, ...newNotepads];
            });
            
            // Mark all loaded notes as saved since they came from files
            setSavedNotes(prev => {
              const newSet = new Set(prev);
              notepadsWithZIndex.forEach(notepad => {
                newSet.add(notepad.id);
              });
              return newSet;
            });
            
            showStatusMessage(setStatusMessage, `Loaded ${loadedNotepads.length} note(s) from folder`, statusTimeoutRef);
          } else {
            showStatusMessage(setStatusMessage, `No atfmem- files found in ${folderName}`, statusTimeoutRef);
          }
        } catch (loadError) {
          console.error('Error loading files from folder:', loadError);
          showStatusMessage(setStatusMessage, 'Error loading notes from folder', statusTimeoutRef);
        }
      } else {
        // Fallback: Show message that folder selection requires modern browser
        showStatusMessage(setStatusMessage, 'Folder selection requires a modern browser with File System Access API support', statusTimeoutRef);
        // For now, just set a default path
        const defaultPath = 'Documents';
        setSaveFolderPath(defaultPath);
        updatePreferences({ saveFolderPath: defaultPath });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting folder:', error);
        showStatusMessage(setStatusMessage, 'Error selecting folder', statusTimeoutRef);
      }
    }
  }, [updatePreferences, highestZIndex]);

  // Handle folder path click - allows user to change the folder
  const handleFolderPathClick = useCallback(async () => {
    // When clicking the folder path, show the directory picker to change it
    await browseForFolder();
  }, [browseForFolder]);

  // Save a single note
  const saveNote = useCallback(async (notepad) => {
    try {
      // Only save if note has content
      if (!notepad.content || !notepad.content.trim()) {
        showStatusMessage(setStatusMessage, 'Note is empty, nothing to save', statusTimeoutRef);
        return null;
      }
      
      const filename = await saveNotepad(notepad, directoryHandle);
      setSavedNotes(prev => new Set([...prev, notepad.id]));
      showStatusMessage(setStatusMessage, `Saved: ${filename}`, statusTimeoutRef);
      
      // Update the notepad to reflect saved state (don't mark as unsaved)
      updateNotepad(notepad.id, {
        title: notepad.title,
        content: notepad.content,
        syntax: notepad.syntax
      }, false);
      
      return filename;
    } catch (error) {
      console.error('Error saving note:', error);
      showStatusMessage(setStatusMessage, 'Error saving note', statusTimeoutRef);
      return null;
    }
  }, [directoryHandle, updateNotepad]);

  // Save all notes
  const saveAllNotes = useCallback(async () => {
    // Filter notes with content
    const notesToSave = notepads.filter(notepad => notepad.content && notepad.content.trim().length > 0);
    
    if (notesToSave.length === 0) {
      showStatusMessage(setStatusMessage, 'No notes with content to save', statusTimeoutRef);
      return;
    }

    try {
      // If directory handle is available, save all to folder
      if (directoryHandle) {
        let savedCount = 0;
        for (const notepad of notesToSave) {
          try {
            await saveNotepad(notepad, directoryHandle);
            setSavedNotes(prev => new Set([...prev, notepad.id]));
            savedCount++;
          } catch (error) {
            console.error(`Error saving note ${notepad.id}:`, error);
          }
        }
        showStatusMessage(setStatusMessage, `Saved ${savedCount} note(s)`, statusTimeoutRef);
      } else {
        // Fallback: download all notes
        notesToSave.forEach(notepad => {
          saveNotepad(notepad);
          setSavedNotes(prev => new Set([...prev, notepad.id]));
        });
        showStatusMessage(setStatusMessage, `Downloaded ${notesToSave.length} note(s)`, statusTimeoutRef);
      }
    } catch (error) {
      console.error('Error saving all notes:', error);
      showStatusMessage(setStatusMessage, 'Error saving notes', statusTimeoutRef);
    }
  }, [notepads, directoryHandle]);

  // Auto-align all notepads
  const autoAlignNotepads = useCallback(() => {
    if (notepads.length === 0) return;
    
    const alignedNotepads = alignNotepads(notepads);
    setNotepads(alignedNotepads);
    showStatusMessage(setStatusMessage, 'Notes aligned', statusTimeoutRef);
  }, [notepads, alignNotepads]);

  // create/unmount root when panel opens/closes
  useEffect(() => {
    if (configPanelOpen) {
      const host = document.querySelector('.config-content');
      if (!host) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'mems-config-wrapper';
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
      <MemsConfig
        notepads={notepads}
        createNotepad={createNotepad}
        darkMode={dashboardDarkMode}
        spellCheckEnabled={spellCheckEnabled}
        defaultTabSize={defaultTabSize}
        autoSaveInterval={autoSaveInterval}
        defaultNoteSize={defaultNoteSize}
        saveToLocalFolder={saveToLocalFolder}
        saveFolderPath={saveFolderPath}
        noteStyle={noteStyle}
        updatePreferences={updatePreferences}
        setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
      />
    );
  }, [
    configPanelOpen, 
    notepads, 
    createNotepad,
    dashboardDarkMode, 
    spellCheckEnabled, 
    defaultTabSize, 
    autoSaveInterval, 
    defaultNoteSize,
    saveToLocalFolder,
    saveFolderPath,
    noteStyle,
    updatePreferences
  ]);

  return (
    <div className="mems-container" ref={containerRef}>

      <div className="mems-toolbar">
        <div className="toolbar-left">
          <button 
            className="action-button create-note-button"
            onClick={() => createNotepad()}
            title="Create a new empty note"
          >
            New Note
          </button>
          
          <div className="style-toggle-container">
            <StandardToggleSwitch
              leftLabel="Simple"
              rightLabel="Modern"
              isActive={noteStyle}
              onChange={(value) => {
                setNoteStyle(value);
                updatePreferences({ noteStyle: value });
              }}
              name="noteStyle"
              leftValue="simple"
              rightValue="modern"
            />
          </div>
          
          {notepads.length > 0 && (
            <>
              <button 
                className="secondary-button auto-align-button" 
                onClick={autoAlignNotepads}
                title="Auto-align all notes in a grid"
              >
                Auto Align
              </button>
              <button 
                className="action-button save-all-button" 
                onClick={saveAllNotes}
                title="Save all notes"
              >
                Save All Notes
              </button>
            </>
          )}

          {/* Save to Local Folder Controls */}
          <div className="save-folder-controls">
            <label className="save-folder-toggle">
              <input
                type="checkbox"
                checked={saveToLocalFolder}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  updatePreferences({ saveToLocalFolder: enabled });
                  if (enabled && !saveFolderPath) {
                    updatePreferences({ saveFolderPath: 'Documents' });
                  }
                }}
                title="Enable saving notes to local folder"
              />
              <span>Save to Folder</span>
            </label>
            
            {saveToLocalFolder && (
              <>
                <div 
                  className="folder-path-display clickable" 
                  onClick={handleFolderPathClick}
                  title={`Click to change folder\n\nPersisted folder: ${saveFolderPath || 'Documents (default)'}\n(Full path not available due to browser security restrictions)`}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-path-text">{saveFolderPath || 'Documents (default)'}</span>
                </div>
                <button
                  className="secondary-button browse-folder-button"
                  onClick={browseForFolder}
                  title="Browse for folder to save notes"
                >
                  Browse
                </button>
              </>
            )}
          </div>
        </div>

        <div className="toolbar-center">
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={toggleDropdown}
              title="Create a note with a template"
            >
              Template Options
            </button>
            
            {dropdownOpen && (
              <div className="dropdown-menu show">
                <div 
                  className="dropdown-item" 
                  onClick={() => createNotepadWithTemplate('javascript')}
                  title="Create a note with JavaScript syntax highlighting"
                >
                  <span className="button-icon">📄</span> JavaScript Note
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => createNotepadWithTemplate('html')}
                  title="Create a note with HTML syntax highlighting"
                >
                  <span className="button-icon">📄</span> HTML Note
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => createNotepadWithTemplate('css')}
                  title="Create a note with CSS syntax highlighting"
                >
                  <span className="button-icon">📄</span> CSS Note
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => createNotepadWithTemplate('sql')}
                  title="Create a note with SQL syntax highlighting"
                >
                  <span className="button-icon">📄</span> SQL Note
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => createNotepadWithTemplate('json')}
                  title="Create a note with JSON syntax highlighting"
                >
                  <span className="button-icon">📄</span> JSON Note
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => createNotepadWithTemplate('markdown')}
                  title="Create a note with Markdown syntax highlighting"
                >
                  <span className="button-icon">📄</span> Markdown Note
                </div>
              </div>
            )}
          </div>
          
          {notepads.length > 0 && (
            <button 
              className="secondary-button clear-all-button" 
              onClick={clearAllNotepads}
              title="Delete all notes (with confirmation)"
            >
              Clear All Notes
            </button>
          )}
        </div>
      </div>
      
      <div className="notepads-area">
        {notepads.length === 0 ? (
          <div className="empty-state">
            <p>No notes yet. Click "New Note" to create one.</p>
            <p className="hint">Notes are saved automatically and will persist even after you close the browser.</p>
          </div>
        ) : (
          notepads.map(notepad => (
            <NotepadWindow
              key={notepad.id}
              notepad={notepad}
              updateNotepad={updateNotepad}
              deleteNotepad={deleteNotepad}
              bringToFront={bringToFront}
              containerRef={containerRef}
              setStatusMessage={(message) => showStatusMessage(setStatusMessage, message, statusTimeoutRef)}
              darkMode={dashboardDarkMode}
              noteStyle={notepad.style || noteStyle}
              headerColor={notepad.headerColor}
              onSave={() => saveNote(notepad)}
              isSaved={savedNotes.has(notepad.id)}
            />
          ))
        )}
      </div>

      {/* Status message - fixed position, bottom right, outside normal flow */}
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm || (() => {})}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        darkMode={dashboardDarkMode}
      />
    </div>
  );
};

export default Mems;