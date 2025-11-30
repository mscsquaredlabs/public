// TerminalWindow.jsx
// Draggable terminal window with xterm.js integration

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import {
  getPrompt,
  getTabCompletions,
  detectDirectoryChange
} from '../../shared/utils/termsUtils';
import 'xterm/css/xterm.css';

import path from 'path';
import terminalService from '../../shared/services/terminalService';

const isWindows = navigator.userAgent.includes('Windows');

/* ─────────────────────── main component ─────────────────────── */
const TerminalWindow = ({
  terminal,
  updateTerminal,
  closeTerminal,
  terminateTerminal,
  bringToFront,
  containerRef,
  setStatusMessage,
  darkMode,
  terminalStyle = 'classic',
  isWindows = false,
  isMac = false,
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    position,
    size,
    isMinimized,
    zIndex,
    shellType,
    lastDirectory,
    isAttached
  } = terminal;

  // Component state
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState(terminal.commandHistory || []);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 means current input, 0 is most recent history
  const [isFocused, setIsFocused] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState(lastDirectory || '~');
  const currentDirRef = useRef(currentDirectory);

  // Refs
  const inputBufferRef = useRef(''); // Move inside component to avoid shared state
  const rndRef = useRef(null);
  const domRef = useRef(null);
  const terminalRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);
  const searchAddonRef = useRef(null);
  const cursorPositionRef = useRef(0);
  const resizeObserverRef = useRef(null);

  // First, let's add debugging to see what's happening with currentInput
  useEffect(() => {
    console.log('currentInput updated:', currentInput);
    console.log('Cursor position:', cursorPositionRef.current);
  }, [currentInput]);

  /* Initialize xterm terminal */
  useEffect(() => {
    if (!terminalRef.current || terminalInstanceRef.current) return;

    const initializeTerminal = setTimeout(() => {
      try {
        const term = new Terminal({
          fontFamily: '"Cascadia Code", Menlo, monospace',
          fontSize: 14,
          lineHeight: 1.2,
          cursorBlink: true,
          cursorStyle: 'block',
          scrollback: 1000,
          theme: darkMode ? {
            background: '#1a1a1a',
            foreground: '#f0f0f0',
            cursor: '#f0f0f0',
            selectionBackground: 'rgba(255, 255, 255, 0.3)'
          } : {
            background: '#ffffff',
            foreground: '#1a1a1a',
            cursor: '#1a1a1a',
            selectionBackground: 'rgba(0, 0, 0, 0.3)'
          }
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        const searchAddon = new SearchAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        term.loadAddon(searchAddon);

        terminalInstanceRef.current = term;
        fitAddonRef.current = fitAddon;
        searchAddonRef.current = searchAddon;

        term.open(terminalRef.current);

        // Fit after a short delay
        setTimeout(() => {
          if (fitAddonRef.current && terminalRef.current && terminalRef.current.offsetWidth > 0) {
            try {
              fitAddonRef.current.fit();
            } catch (error) {
              console.log('Error fitting terminal on init: ', error);
            }
          }
        }, 100);

        // Initialize proper starting directory for Windows cmd
        if (shellType === 'cmd' && currentDirectory === '~') {
          setCurrentDirectory('C:\\');
        }

        // Write initial prompt
        term.write(getPrompt(shellType === 'cmd' ? 'C:\\' : currentDirectory, shellType));
        
        // Test API connection on startup
        term.write('Checking terminal server connection...\r\n');
        terminalService.testConnection()
          .then(result => {
            if (result.error) {
              term.write(`⚠️ Terminal server connection error: ${result.error}\r\n`);
            } else {
              term.write(`✓ Terminal server connected successfully\r\n`);
            }
            term.write(getPrompt(shellType === 'cmd' ? 'C:\\' : currentDirectory, shellType));
          })
          .catch(err => {
            term.write(`⚠️ Terminal server connection error: ${err.message}\r\n`);
            term.write(getPrompt(shellType === 'cmd' ? 'C:\\' : currentDirectory, shellType));
          });
        
        cursorPositionRef.current = 0; // Reset cursor position
        inputBufferRef.current = ''; // Reset input buffer

        initializeTerminalEvents(term);

        // Create ResizeObserver
        if (window.ResizeObserver) {
          const observer = new ResizeObserver(() => {
            if (fitAddonRef.current && terminalRef.current && terminalRef.current.offsetWidth > 0) {
              // Debounced fit
              setTimeout(() => {
                try {
                  fitAddonRef.current.fit();
                } catch (error) {
                  console.log('Error fitting terminal on resize: ', error);
                }
              }, 50);
            }
          });
          if (terminalRef.current) {
            observer.observe(terminalRef.current);
            resizeObserverRef.current = observer;
          }
        }

        // Mark as attached if it wasn't already
        if (!isAttached) {
          updateTerminal(id, { 
            isAttached: true,
            isVisible: true, // Ensure it's visible
            lastActiveAt: new Date().toISOString() // Update timestamp
          });
        }

      } catch (error) {
        console.error('Failed to initialize terminal: ', error);
      }
    }, 10); // Small delay

    return () => {
      clearTimeout(initializeTerminal);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (terminalInstanceRef.current) {
        try {
          terminalInstanceRef.current.dispose();
          terminalInstanceRef.current = null;
        } catch (error) {
          console.log('Error disposing terminal: ', error);
        }
      }
    };
  }, [id, darkMode, isAttached, shellType]);   // 🟢 removed currentDirectory & commandHistory

  // Update terminal theme when dark mode changes
  useEffect(() => {
    if (!terminalInstanceRef.current) return;
    try {
        terminalInstanceRef.current.options.theme = darkMode ? {
            background: '#1a1a1a',
            foreground: '#f0f0f0',
            cursor: '#f0f0f0',
            selectionBackground: 'rgba(255, 255, 255, 0.3)'
          } : {
            background: '#ffffff',
            foreground: '#1a1a1a',
            cursor: '#1a1a1a',
            selectionBackground: 'rgba(0, 0, 0, 0.3)'
          };
    } catch (err) {
      console.log('Unable to update terminal theme dynamically: ', err);
    }
  }, [darkMode]);

  // Update directory state in parent when it changes locally
  useEffect(() => {

    currentDirRef.current = currentDirectory;

    if (currentDirectory !== lastDirectory && isAttached) {
      updateTerminal(id, { lastDirectory: currentDirectory, commandHistory });
    }
  }, [currentDirectory, lastDirectory, id, updateTerminal, isAttached, commandHistory]);

  /* Grab the actual DOM node once <Rnd> is mounted for potential direct manipulation */
  useEffect(() => {
    if (rndRef.current) {
      domRef.current = rndRef.current.resizableElement?.current;
    }
  }, []);

  /* ──────────────── terminal event handling ──────────────── */
  const initializeTerminalEvents = (term) => {
    // Handle data for paste events (but not for copy operations)
    term.onData(data => {
      // If it looks like a paste (multiple characters) and not an escape sequence
      // Also check if it's not a single character that might be from keyboard
      if (data.length > 1 && !data.startsWith('\x1b') && !data.match(/^[\x00-\x1F]$/)) {
        handlePaste(data);
      }
    });
    
    // Handle individual keystrokes
    term.onKey(({ key, domEvent }) => {
      const ev = domEvent;
      
      // Check if printable character
      const isPrintable = ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey;
      
      if (ev.keyCode === 13) { // Enter
        handleEnterKey();
      } else if (ev.keyCode === 8) { // Backspace
        handleBackspace();
      } else if (ev.keyCode === 46) { // Delete
        handleDelete();
      } else if (ev.keyCode === 37) { // Left Arrow
        handleLeftArrow();
      } else if (ev.keyCode === 39) { // Right Arrow
        handleRightArrow();
      } else if (ev.keyCode === 38) { // Up Arrow
        handleUpArrow();
      } else if (ev.keyCode === 40) { // Down Arrow
        handleDownArrow();
      } else if (ev.keyCode === 9) { // Tab
        ev.preventDefault(); // Prevent focus change
        handleTabCompletion();
      } else if (ev.ctrlKey && ev.keyCode === 67) { // Ctrl+C
        // Check if text is selected - if so, let browser handle copy, otherwise interrupt
        const selection = term.getSelection();
        if (!selection || selection.length === 0) {
          ev.preventDefault();
          handleCtrlC();
        }
        // If text is selected, let the browser handle the copy (don't prevent default)
      } else if (ev.ctrlKey && ev.keyCode === 86) { // Ctrl+V (Paste)
        ev.preventDefault();
        // Handle paste manually to prevent automatic command execution
        navigator.clipboard.readText().then(text => {
          if (text) {
            // Insert text into input buffer instead of writing directly
            const currentBuffer = inputBufferRef.current;
            const textBeforeCursor = currentBuffer.slice(0, cursorPositionRef.current);
            const textAfterCursor = currentBuffer.slice(cursorPositionRef.current);
            const sanitizedText = text.replace(/\r\n?/g, ' ').replace(/\n/g, ' ').trim();
            
            if (sanitizedText) {
              const newInput = textBeforeCursor + sanitizedText + textAfterCursor;
              inputBufferRef.current = newInput;
              setCurrentInput(newInput);
              cursorPositionRef.current += sanitizedText.length;
              redrawInputLine();
            }
          }
        }).catch(err => {
          console.error('Paste failed:', err);
        });
      } else if (ev.ctrlKey && ev.keyCode === 76) { // Ctrl+L
        handleCtrlL();
      } else if (isPrintable) {
        handlePrintableChar(key);
      }
    });
    
    // Focus handlers
    term.element?.addEventListener('click', () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.focus();
        setIsFocused(true);
      }
    });
    
    term.onFocus(() => setIsFocused(true));
    term.onBlur(() => setIsFocused(false));
  };

  /* ──────────────── input handling functions ──────────────── */
  const handlePrintableChar = (char) => {
    const term = terminalInstanceRef.current;
    if (!term) return;
  
    console.log('handlePrintableChar called with:', char);
    
    // Get the current buffer from the ref
    const currentBuffer = inputBufferRef.current;
    console.log('Current buffer:', currentBuffer);
    
    // Calculate cursor-relative positions
    const textBeforeCursor = currentBuffer.slice(0, cursorPositionRef.current);
    const textAfterCursor = currentBuffer.slice(cursorPositionRef.current);
  
    // Create the new input by combining parts
    const newInput = textBeforeCursor + char + textAfterCursor;
    console.log('New buffer:', newInput);
    
    // Update both the ref and state
    inputBufferRef.current = newInput;
    setCurrentInput(newInput);
  
    // Visual updates to the terminal
    if (cursorPositionRef.current < currentBuffer.length) {
      // When inserting in the middle: redraw everything after cursor
      term.write(char + textAfterCursor);
      // Move cursor back to position just after inserted char
      term.write('\x1b[D'.repeat(textAfterCursor.length));
    } else {
      // When appending at the end: just write the character
      term.write(char);
    }
  
    // Update cursor position
    cursorPositionRef.current++;
    console.log('Cursor position:', cursorPositionRef.current);
  };

  const handleBackspace = () => {
    const term = terminalInstanceRef.current;
    if (!term || cursorPositionRef.current === 0) return;

    // Get the current buffer from the ref
    const currentBuffer = inputBufferRef.current;
    
    // Calculate the new buffer with character removed
    const textBeforeCursor = currentBuffer.slice(0, cursorPositionRef.current - 1);
    const textAfterCursor = currentBuffer.slice(cursorPositionRef.current);
    const newInput = textBeforeCursor + textAfterCursor;
    
    // Update both the ref and state
    inputBufferRef.current = newInput;
    setCurrentInput(newInput);

    // Visual update to the terminal
    term.write('\b' + textAfterCursor + ' ' + '\x1b[D'.repeat(textAfterCursor.length + 1));

    // Update cursor position
    cursorPositionRef.current--;
  };

  const handleDelete = () => {
    const term = terminalInstanceRef.current;
    if (!term || cursorPositionRef.current >= inputBufferRef.current.length) return;

    // Get the current buffer from the ref
    const currentBuffer = inputBufferRef.current;
    
    // Calculate the new buffer with character removed
    const textBeforeCursor = currentBuffer.slice(0, cursorPositionRef.current);
    const textAfterCursor = currentBuffer.slice(cursorPositionRef.current + 1);
    const newInput = textBeforeCursor + textAfterCursor;
    
    // Update both the ref and state
    inputBufferRef.current = newInput;
    setCurrentInput(newInput);

    // Visual update to the terminal
    term.write(textAfterCursor + ' ' + '\x1b[D'.repeat(textAfterCursor.length + 1));
  };

  const handleLeftArrow = () => {
    const term = terminalInstanceRef.current;
    if (!term || cursorPositionRef.current === 0) return;
    
    term.write('\x1b[D'); // Move cursor left
    cursorPositionRef.current--;
  };

  const handleRightArrow = () => {
    const term = terminalInstanceRef.current;
    if (!term || cursorPositionRef.current >= inputBufferRef.current.length) return;
    
    term.write('\x1b[C'); // Move cursor right
    cursorPositionRef.current++;
  };

  const redrawInputLine = () => {
    const term = terminalInstanceRef.current;
    if (!term) return;
    
    const prompt = getPrompt(currentDirectory, shellType);
    const buffer = inputBufferRef.current;
    
    // Move to start of line, clear line, write prompt and buffer
    term.write('\r\x1b[K' + prompt + buffer);
    
    // Move cursor to correct position
    const targetPos = prompt.length + cursorPositionRef.current;
    term.write('\r\x1b[' + targetPos + 'C');
  };

  const handleUpArrow = () => {
    if (commandHistory.length === 0) return;
    
    let newIndex = historyIndex;
    
    // If at current input, move to the most recent command
    if (newIndex === -1) {
      newIndex = 0;
    }
    // Otherwise, move to the next older command if available
    else if (newIndex < commandHistory.length - 1) {
      newIndex++;
    }
    
    if (newIndex !== historyIndex) {
      setHistoryIndex(newIndex);
      const historyCommand = commandHistory[newIndex];
      
      // Update both ref and state
      inputBufferRef.current = historyCommand;
      setCurrentInput(historyCommand);
      cursorPositionRef.current = historyCommand.length;
      
      // Redraw the line
      redrawInputLine();
    }
  };

  const handleDownArrow = () => {
    if (historyIndex === -1) return; // Already at the newest input line
    
    let newIndex = historyIndex - 1;
    let newCommand = '';
    
    if (newIndex >= 0) {
      newCommand = commandHistory[newIndex];
    } else {
      newIndex = -1; // Reached the current input line
      newCommand = ''; // Or potentially store a temporary current line buffer
    }
    
    setHistoryIndex(newIndex);
    
    // Update both ref and state
    inputBufferRef.current = newCommand;
    setCurrentInput(newCommand);
    cursorPositionRef.current = newCommand.length;
    
    // Redraw the line
    redrawInputLine();
  };

  const handleTabCompletion = () => {
    const term = terminalInstanceRef.current;
    if (!term || !inputBufferRef.current.trim()) return;

    const completions = getTabCompletions(inputBufferRef.current, currentDirectory, shellType);

    if (completions.length === 1) {
      const completion = completions[0]; // This should be the full completed string
      inputBufferRef.current = completion;
      setCurrentInput(completion);
      cursorPositionRef.current = completion.length;
      redrawInputLine();
    } else if (completions.length > 1) {
      // Find common prefix
      let commonPrefix = completions[0];
      for (let i = 1; i < completions.length; i++) {
        let j = 0;
        while (j < commonPrefix.length && j < completions[i].length && commonPrefix[j] === completions[i][j]) {
          j++;
        }
        commonPrefix = commonPrefix.substring(0, j);
      }

      // Complete up to the common prefix if it's longer than current input
      if (commonPrefix.length > inputBufferRef.current.length) {
        inputBufferRef.current = commonPrefix;
        setCurrentInput(commonPrefix);
        cursorPositionRef.current = commonPrefix.length;
        redrawInputLine();
      }

      // Show all completions below the current line
      term.write('\r\n'); // New line for completions
      const maxTermCols = term.cols || 80; // Get terminal width
      const maxLength = Math.max(...completions.map(c => c.length));
      const numCols = Math.max(1, Math.floor(maxTermCols / (maxLength + 2))); // +2 for spacing
      const numRows = Math.ceil(completions.length / numCols);

      for (let row = 0; row < numRows; row++) {
        let line = '';
        for (let col = 0; col < numCols; col++) {
          const index = row + col * numRows;
          if (index < completions.length) {
            line += completions[index].padEnd(maxLength + 2, ' ');
          }
        }
        term.write(line + '\r\n');
      }
      // Redraw the original prompt and input line
      term.write(getPrompt(currentDirectory, shellType) + inputBufferRef.current);
      
      // Reposition cursor
      const targetPos = getPrompt(currentDirectory, shellType).length + cursorPositionRef.current;
      term.write('\r\x1b[' + targetPos + 'C'); // Move cursor absolute
    }
  };

  const handleEnterKey = () => {
    const term = terminalInstanceRef.current;
    if (!term) return;

    // Get the command from our buffer ref
    const commandToExecute = inputBufferRef.current.trim();
    console.log('Command to execute:', commandToExecute);
    
    // Move to next line
    term.write('\r\n');

    // Add to history if not empty and different from the last command
    if (commandToExecute && (commandHistory.length === 0 || commandToExecute !== commandHistory[0])) {
      setCommandHistory(prev => [commandToExecute, ...prev.slice(0, 99)]); // Limit history size
    }

    // Process the command
    if (commandToExecute) {
      if (commandToExecute === 'clear' || commandToExecute === 'cls') {
        clearTerminal();
      } else {
        // Execute command via direct fetch to server
        executeCommand(commandToExecute);
      }
    } else {
      // Empty command, just show a new prompt
      //term.write(getPrompt(currentDirectory, shellType));
      term.write(getPrompt(currentDirRef.current, shellType));
      terminalInstanceRef.current?.focus();
    }

    // Reset input state
    inputBufferRef.current = '';
    setCurrentInput('');
    cursorPositionRef.current = 0;
    setHistoryIndex(-1);
  };

  const executeCommand = async (command) => {
    const term = terminalInstanceRef.current;
    if (!term || !command) return;
  
    //let nextDirectory = currentDirectory;          // ← keep our own copy
    let nextDirectory = currentDirRef.current;     // keep our own copy
  
    try {
      //term.write(`Executing: ${command}...\r\n`);
  
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //body: JSON.stringify({ command, cwd: currentDirectory })
        body: JSON.stringify({ command, cwd: currentDirRef.current })
      });
  
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
  
      if (data.output) {
        const out = data.output.replace(/\r?\n/g, '\r\n');
        term.write(out.endsWith('\r\n') ? out : out + '\r\n');
      } else {
        //term.write('Command executed successfully (no output)\r\n');
        term.write('');
      }
  
      if (data.success && data.newDirectory) {
        nextDirectory = data.newDirectory;         // ← drive-switch or cd
      }
  
    } catch (err) {
      term.write(`Error: ${err.message}\r\n`);
    } finally {
      setCurrentDirectory(nextDirectory);          // ← update React state
      currentDirRef.current = nextDirectory;       // **update the ref**


      term.write(getPrompt(nextDirectory, shellType));
      term.focus();                                // ← keep typing!
    }
  };
  

  const handlePaste = (data) => {
    const term = terminalInstanceRef.current;
    if (!term) return;

    // Sanitize pasted data - replace newlines with spaces to keep it on one line
    // This prevents automatic command execution when pasting multi-line text
    const pastedText = data.replace(/\r\n?/g, ' ').replace(/\n/g, ' ').trim();
    
    if (!pastedText) return;

    // Insert the pasted text at the current cursor position
    const currentBuffer = inputBufferRef.current;
    const textBeforeCursor = currentBuffer.slice(0, cursorPositionRef.current);
    const textAfterCursor = currentBuffer.slice(cursorPositionRef.current);

    // Update buffer with pasted text inserted
    const newInputStart = textBeforeCursor + pastedText + textAfterCursor;
    inputBufferRef.current = newInputStart;
    setCurrentInput(newInputStart);
    cursorPositionRef.current += pastedText.length;

    // Visually update the current line
    redrawInputLine();
  };

  const handleCtrlC = () => {
    const term = terminalInstanceRef.current;
    if (!term) return;
    
    // Write ^C representation
    term.write('^C\r\n');
    
    // Show a new prompt
    term.write(getPrompt(currentDirectory, shellType));
    
    // Reset all input state
    inputBufferRef.current = '';
    setCurrentInput('');
    cursorPositionRef.current = 0;
    setHistoryIndex(-1);
  };

  const handleCtrlL = () => {
    clearTerminal();
  };

  /* ──────────────── general handlers ──────────────── */
  const focusTitle = () => {
    // Allow editing only if not minimized
    if (!isMinimized) {
      setIsEditing(true);
    }
  };

  const handleTitleBlur = () => {
    const newTitle = editableTitle.trim() || `Terminal ${id.substring(0, 4)}`;
    setEditableTitle(newTitle);
    updateTerminal(id, { title: newTitle });
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setEditableTitle(title);
      setIsEditing(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    bringToFront(id);

    if (terminalInstanceRef.current) {
      try {
        terminalInstanceRef.current.focus();
      } catch (error) {
        console.log('Error focusing terminal instance: ', error);
      }
    }
  };

  const handleShellTypeChange = (e) => {
    const newShellType = e.target.value;
    updateTerminal(id, { shellType: newShellType });

    if (terminalInstanceRef.current) {
      try {
        inputBufferRef.current = '';
        setCurrentInput('');
        cursorPositionRef.current = 0;
        setHistoryIndex(-1);
        terminalInstanceRef.current.write('\r\n\x1b[K' + getPrompt(currentDirectory, newShellType));
      } catch (error) {
        console.log('Error updating shell type visually: ', error);
      }
    }
  };

  /* ─────────────── actions (clear/copy/terminate) ─────────────── */
  const clearTerminal = () => {
    const term = terminalInstanceRef.current;
    if (term) {
      try {
        term.clear();
        term.write(getPrompt(currentDirectory, shellType));
        inputBufferRef.current = '';
        setCurrentInput('');
        cursorPositionRef.current = 0;
        setHistoryIndex(-1);
      } catch (error) {
        console.log('Error clearing terminal: ', error);
      }
    }
  };

  const copyToClipboard = () => {
    const term = terminalInstanceRef.current;
    if (term) {
      try {
        const selection = term.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection).then(
            () => setStatusMessage?.('Selection copied!'),
            (err) => {
              console.error('Clipboard copy failed: ', err);
              setStatusMessage?.('Copy failed!');
            }
          );
        } else {
          setStatusMessage?.('No text selected');
        }
      } catch (error) {
        console.log('Error copying from terminal: ', error);
        setStatusMessage?.(`Copy failed: ${error.message}`);
      }
    }
  };

  const handleTerminate = () => {
    if (window.confirm(`Terminate terminal "${title}"? This cannot be undone.`)) {
      terminateTerminal(id);
    }
  };

  /* ─────────────────────── visual body ─────────────────────── */
  /* ─────────────────────── visual body ─────────────────────── */
  const TerminalBody = (
    <div
      className={`terminal-window ${isMinimized ? 'minimized' : ''} ${isFocused ? 'focused' : ''} ${darkMode ? 'dark-mode' : ''} ${terminalStyle === 'modern' ? 'modern-style' : ''}`}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      onMouseDownCapture={handleFocus} // Capture clicks on the body to focus
    >
      {/* Header */}
      <div
         className={`terminal-header ${terminalStyle === 'modern' ? 'modern-style' : 'classic-style'}`}
         onDoubleClick={() => updateTerminal(id, { isMinimized: !isMinimized })}
         // Rnd component handles drag, but we might need to prevent text selection here
         style={{ 
           cursor: 'move', 
           userSelect: 'none',
           backgroundColor: terminalStyle === 'modern' ? headerColor : (darkMode ? '#4338ca' : '#4f46e5')
         }}
         >
        <div className="terminal-title">
          {isEditing ? (
            <input
              className="title-input"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown} // Use onKeyDown for Enter/Escape
              autoFocus
              onClick={(e) => e.stopPropagation()} // Prevent header click from blurring input
            />
          ) : (
            // Make the span clickable to edit, ensure sufficient click target size
            <span className="title-text" onClick={focusTitle} style={{ display: 'inline-block', minWidth: '20px' }}>
                {editableTitle}
            </span>
          )}
        </div>
        <div className="terminal-controls">
          <button
             className="minimize-button"
             onClick={(e) => { e.stopPropagation(); updateTerminal(id, { isMinimized: !isMinimized }); }}
             title={isMinimized ? 'Restore' : 'Minimize'}
             >
            {isMinimized ? '□' : '−'}
          </button>
          <button
             className="close-button"
             onClick={(e) => { e.stopPropagation(); closeTerminal(id); }}
             title="Close (Keep in Background)" // Clarify behavior
             >
             ×
          </button>
        </div>
      </div>

      {/* Toolbar - Conditionally render based on minimized state */}
      {!isMinimized && (
        <div className="terminal-toolbar">
          <select value={shellType} onChange={handleShellTypeChange} className="shell-select" title="Change Shell Type">
            {isWindows ? (
              <>
                <option value="cmd">CMD</option>
                <option value="powershell">PowerShell</option>
              </>
            ) : isMac ? (
              <>
                <option value="bash">Bash</option>
                <option value="zsh">ZSH</option>
              </>
            ) : (
              <>
                <option value="bash">Bash</option>
                <option value="zsh">ZSH</option>
              </>
            )}
          </select>
          <div className="terminal-actions">
            <button onClick={clearTerminal} title="Clear Terminal Screen">Clear</button>
            <button onClick={copyToClipboard} title="Copy Selected Text">Copy</button>
            <button onClick={handleTerminate} title="Terminate Session (Permanent)">Terminate</button>
          </div>
        </div>
      )}

      {/* Terminal content area - Conditionally render based on minimized state */}
      {!isMinimized && (
        <div className="terminal-content" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Container for xterm */}
          <div ref={terminalRef} className="xterm-container" style={{ width: '100%', height: '100%' }}></div>
        </div>
      )}
    </div>
  );

  /* ─────────────────────── render root ─────────────────────── */
  return (
    <Rnd
      ref={rndRef}
      // Use position and size from state
      position={{ x: position.x, y: position.y }}
      size={{ width: size.width, height: isMinimized ? 40 : size.height }} // Adjust height when minimized
      style={{ zIndex, position: 'absolute' }} // Let Rnd handle position
      minWidth={300}
      minHeight={40} // Minimum height is the header height
      bounds="parent" // Constrain to parent element
      enableResizing={!isMinimized} // Disable resize when minimized
      disableDragging={isEditing} // Prevent dragging while editing title
      onMouseDown={handleFocus} // Bring to front on any interaction with Rnd frame
      // Use onDragStart to ensure it comes to front immediately
      onDragStart={handleFocus}
      onDragStop={(e, d) => updateTerminal(id, { position: { x: d.x, y: d.y } })}
      onResizeStop={(e, dir, ref, delta, pos) => {
          // Update state with new size and position
          const newWidth = parseInt(ref.style.width, 10);
          const newHeight = parseInt(ref.style.height, 10);
          updateTerminal(id, {
              size: { width: newWidth, height: newHeight },
              position: { x: pos.x, y: pos.y }, // Position might change during resize from corner
          });

          // Refit terminal after resize operation stops and state update likely processed
         if (fitAddonRef.current && terminalRef.current) {
            // Use a small timeout to allow React state updates and DOM changes to settle
            setTimeout(() => {
              try {
                  fitAddonRef.current.fit();
              } catch (error) {
                  console.log('Error fitting terminal after resize stop: ', error);
              }
            }, 50); // Adjust delay if needed
         }
      }}
      // Pass className for potential styling
      className={`terminal-rnd-wrapper ${isMinimized ? 'minimized' : ''}`}
    >
      {TerminalBody}
    </Rnd>
  );
};

export default TerminalWindow;