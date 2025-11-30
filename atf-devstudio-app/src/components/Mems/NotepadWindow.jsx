// NotepadWindow.jsx
// Draggable notepad with improved usability and navigation

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { getTextStats, exportNotepad, generateFilename } from '../../shared/utils/memsUtils';
import ConfirmationModal from './ConfirmationModal';

/* ─────────────────────── main component ─────────────────────── */
const NotepadWindow = ({
  notepad,
  updateNotepad,
  deleteNotepad,
  bringToFront,
  containerRef,
  setStatusMessage,
  darkMode,
  noteStyle = 'simple',
  headerColor = '#4f46e5',
  onSave,
  isSaved = false,
}) => {
  const {
    id,
    title,
    content,
    position,
    size,
    isMinimized,
    zIndex,
    syntax,
  } = notepad;

  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableContent, setEditableContent] = useState(content);
  const [syntaxOption, setSyntaxOption] = useState(syntax || 'plain');
  const [showStats, setShowStats] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  /* Rnd / DOM refs */
  const rndRef = useRef(null);
  const domRef = useRef(null);
  const textareaRef = useRef(null);
  const contentChangeTimeoutRef = useRef(null);

  /* Grab the actual DOM node once <Rnd> is mounted */
  useEffect(() => {
    if (rndRef.current) {
      domRef.current = rndRef.current.resizableElement.current;
    }
  }, []);

  /* Sync notepad content with state */
  useEffect(() => {
    setEditableContent(content);
    setEditableTitle(title);
    setSyntaxOption(syntax || 'plain');
    // Reset unsaved changes when note is updated externally
    setHasUnsavedChanges(false);
  }, [content, title, syntax]);

  // Track content changes - only mark as unsaved if content actually differs
  useEffect(() => {
    // Use a small delay to avoid false positives during debounced updates
    const timeoutId = setTimeout(() => {
      if (editableContent !== content || editableTitle !== title || syntaxOption !== syntax) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [editableContent, content, editableTitle, title, syntaxOption, syntax]);

  /* ──────────────── navigation improvement ──────────────── */
  // Handle keyboard navigation (improved)
  const handleKeyDown = (e) => {
    // Allow normal keyboard navigation
    if (e.key === 'Tab') {
      e.preventDefault();
      // Insert tab when tab key is pressed
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      const spaces = '  '; // 2 spaces for a tab
      const newValue = editableContent.substring(0, start) + spaces + editableContent.substring(end);
      
      setEditableContent(newValue);
      
      // Update cursor position after the inserted tab
      requestAnimationFrame(() => {
        e.target.selectionStart = start + spaces.length;
        e.target.selectionEnd = start + spaces.length;
      });
    }
  };

  /* ──────────────── generic handlers ──────────────── */
  const stats = getTextStats(editableContent);

  const focusTitle = () => setIsEditing(true);

  const handleTitleBlur = () => {
    const newTitle = editableTitle.trim() || title;
    setEditableTitle(newTitle);
    updateNotepad(id, { title: newTitle });
    setIsEditing(false);
    if (newTitle !== title) {
      setHasUnsavedChanges(true);
    }
  };

  const handleContentChange = (e) => {
    const newVal = e.target.value;
    setEditableContent(newVal);
    setHasUnsavedChanges(true);

    // Clear any existing timeout
    if (contentChangeTimeoutRef.current) {
      clearTimeout(contentChangeTimeoutRef.current);
    }

    // Set new timeout for debounced update
    contentChangeTimeoutRef.current = setTimeout(() => {
      updateNotepad(id, { content: newVal });
    }, 250);
  };

  const handleSyntaxChange = (e) => {
    const newSyn = e.target.value;
    setSyntaxOption(newSyn);
    updateNotepad(id, { syntax: newSyn });
    if (newSyn !== syntax) {
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!editableContent.trim() && !onSave) return;
    
    if (onSave) {
      const savedNotepad = {
        ...notepad,
        title: editableTitle,
        content: editableContent,
        syntax: syntaxOption
      };
      await onSave(savedNotepad);
      // The parent component will update the notepad and mark it as saved
      // The useEffect will detect when content matches and reset hasUnsavedChanges
    } else {
      handleExport();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    bringToFront(id);
    // Move cursor to the end
    if (textareaRef.current) {
      const length = textareaRef.current.value.length;
      textareaRef.current.selectionStart = length;
      textareaRef.current.selectionEnd = length;
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  /* ─────────────── actions (copy / clear / export) ─────────────── */
  const copyAll = () => {
    navigator.clipboard.writeText(editableContent).then(
      () => setStatusMessage?.('Copied to clipboard'),
      () => setStatusMessage?.('Copy failed!')
    );
  };

  const clearContent = () => {
    if (!editableContent.trim()) {
      setEditableContent('');
      updateNotepad(id, { content: '' });
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title: 'Clear Note',
      message: 'Clear this note?',
      onConfirm: () => {
        setEditableContent('');
        updateNotepad(id, { content: '' });
      },
      confirmText: 'Clear',
      cancelText: 'Cancel'
    });
  };

  const handleExport = () => {
    if (!editableContent) return;
    
    const notepadData = {
      title: editableTitle,
      content: editableContent,
      syntax: syntaxOption
    };
    
    const filename = exportNotepad(notepadData);
    setStatusMessage?.(`Exported ${filename}`);
  };

  /* Cleanup timeouts on unmount */
  useEffect(() => {
    return () => {
      if (contentChangeTimeoutRef.current) {
        clearTimeout(contentChangeTimeoutRef.current);
      }
    };
  }, []);

  /* ─────────────────────── visual body ─────────────────────── */
  const NoteBody = (
    <div className={`notepad-window ${isMinimized ? 'minimized' : ''} ${isFocused ? 'focused' : ''} ${darkMode ? 'dark-mode' : ''} ${noteStyle === 'modern' ? 'modern-style' : ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Header */}
      <div 
        className={`notepad-header ${noteStyle === 'modern' ? 'modern-style' : 'simple-style'}`}
        style={{ backgroundColor: headerColor }}
        onDoubleClick={() => updateNotepad(id, { isMinimized: !isMinimized })}
      >
        <div className="notepad-title">
          {isEditing ? (
            <input
              className="title-input"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              autoFocus
            />
          ) : (
            <span className="title-text" onClick={focusTitle}>{editableTitle}</span>
          )}
        </div>
        <div className="notepad-controls">
          {hasUnsavedChanges && !isSaved && (
            <span className="unsaved-indicator" title="Unsaved changes">●</span>
          )}
          {isSaved && !hasUnsavedChanges && (
            <span className="saved-indicator" title="Saved">✓</span>
          )}
          <button className="minimize-button" onClick={() => updateNotepad(id, { isMinimized: !isMinimized })} title={isMinimized ? 'Expand' : 'Minimize'}>
            {isMinimized ? '□' : '−'}
          </button>
          <button 
            className="close-button" 
            onClick={() => {
              if (hasUnsavedChanges) {
                setConfirmationModal({
                  isOpen: true,
                  title: 'Close Note',
                  message: 'This note has unsaved changes. Are you sure you want to close it?',
                  onConfirm: () => {
                    deleteNotepad(id);
                  },
                  confirmText: 'Close',
                  cancelText: 'Cancel'
                });
                return;
              }
              deleteNotepad(id);
            }} 
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Toolbar + stats */}
      {!isMinimized && (
        <>
          <div className="notepad-toolbar">
            <select value={syntaxOption} onChange={handleSyntaxChange} className="syntax-select" title="Syntax highlighting">
              {[
                'plain','javascript','typescript','python','java','csharp','css','html','json','xml','yaml','bash','sql',
              ].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="notepad-actions">
              <button 
                onClick={handleSave} 
                disabled={!editableContent} 
                className={hasUnsavedChanges ? 'save-button unsaved' : 'save-button'}
                title={hasUnsavedChanges ? 'Save note (unsaved changes)' : 'Save note'}
              >
                {hasUnsavedChanges ? 'Save' : 'Saved'}
              </button>
              <button onClick={copyAll} disabled={!editableContent} title="Copy all content">Copy</button>
              <button onClick={clearContent} disabled={!editableContent} title="Clear all content">Clear</button>
              <button onClick={handleExport} disabled={!editableContent} title="Export as file">Export</button>
              <button onClick={() => setShowStats((s) => !s)} title="Toggle statistics">Stats</button>
            </div>
          </div>
          {showStats && (
            <div className="stats-panel">
              <span>{stats.words} words</span>
              <span>{stats.chars} chars</span>
              <span>{stats.lines} lines</span>
            </div>
          )}
          <div className="notepad-content">
            {syntaxOption === 'plain' ? (
              <textarea
                ref={textareaRef}
                className="notepad-textarea"
                value={editableContent}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                spellCheck={notepad.spellCheckEnabled !== false}
                placeholder="Type here…"
              />
            ) : (
              <div className="syntax-highlighting-container">
                <textarea
                  ref={textareaRef}
                  className="notepad-textarea syntax-input"
                  value={editableContent}
                  onChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  spellCheck={notepad.spellCheckEnabled !== false}
                  placeholder={`Type your ${syntaxOption} code here…`}
                />
                <div className="syntax-output">
                  <SyntaxHighlighter 
                    language={syntaxOption} 
                    style={vs2015} 
                    customStyle={{ margin: 0, padding: '12px' }}
                    lineNumberStyle={{ minWidth: '3em', opacity: 0.5 }}
                    showLineNumbers={true}
                  >
                    {editableContent || ' '}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  /* ─────────────────────── render root ─────────────────────── */
  return (
    <>
      <Rnd
        ref={rndRef}
        position={{ x: position.x, y: position.y }}
        size={{ width: size.width, height: isMinimized ? 40 : size.height }} // Adjust height when minimized
        style={{ zIndex, position: 'absolute' }}
        minWidth={200}
        minHeight={40} // Minimum height is the header height
        bounds="parent"
        enableResizing={!isMinimized}
        onMouseDown={() => bringToFront(id)}
        onDragStart={() => bringToFront(id)}
        onDragStop={(e, d) => updateNotepad(id, { position: { x: d.x, y: d.y } })}
        onResizeStop={(e, dir, ref, delta, pos) => {
          updateNotepad(id, {
            size: { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) },
            position: { x: pos.x, y: pos.y },
          });
        }}
      >
        {NoteBody}
      </Rnd>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm || (() => {})}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        darkMode={darkMode}
      />
    </>
  );
};

export default NotepadWindow;