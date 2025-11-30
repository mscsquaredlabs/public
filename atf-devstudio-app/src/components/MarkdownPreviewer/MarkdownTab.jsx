// MarkdownTab.jsx
// Tab content for Markdown preview operations

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  renderMarkdown,
  insertMarkdownElement,
  generateHtmlDocument,
  downloadTextFile
} from '../../shared/utils/markdownUtils';
import { copyToClipboard } from '../../shared/utils/helpers';

const MarkdownTab = ({
  markdown,
  updateMarkdown,
  deleteMarkdown,
  setStatusMessage,
  darkMode,
  markdownStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    markdownInput,
    markdownRender,
    previewMode,
    renderOptions,
  } = markdown;

  const [input, setInput] = useState(markdownInput || '');
  const [render, setRender] = useState(markdownRender || '');
  const [currentMode, setCurrentMode] = useState(previewMode || 'split');
  const [isRendering, setIsRendering] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentOptions, setCurrentOptions] = useState(renderOptions || {
    autoRender: true,
    syntaxHighlighting: true,
    showLineNumbers: false,
    sanitize: true,
  });

  const markdownEditorRef = useRef(null);
  const previewRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // Sync with prop changes
  useEffect(() => {
    setInput(markdownInput || '');
    setRender(markdownRender || '');
    setCurrentMode(previewMode || 'split');
    setCurrentOptions(renderOptions || {
      autoRender: true,
      syntaxHighlighting: true,
      showLineNumbers: false,
      sanitize: true,
    });
  }, [markdownInput, markdownRender, previewMode, renderOptions]);

  // Render markdown content
  const handleRender = useCallback(() => {
    setIsRendering(true);
    
    try {
      const renderedHtml = renderMarkdown(input, currentOptions);
      setRender(renderedHtml);
      updateMarkdown(id, {
        markdownInput: input,
        markdownRender: renderedHtml,
      });
      setStatusMessage?.('Markdown rendered successfully');
    } catch (err) {
      console.error('Error rendering markdown:', err);
      setStatusMessage?.(`Error: ${err.message}`);
    } finally {
      setIsRendering(false);
    }
  }, [input, currentOptions, id, updateMarkdown, setStatusMessage]);

  // Auto-render when input changes (if auto-render is enabled)
  useEffect(() => {
    if (currentOptions.autoRender && input) {
      const timeoutId = setTimeout(() => {
        handleRender();
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [input, currentOptions.autoRender, handleRender]);

  // Insert a Markdown element at cursor position
  const insertMarkdownElementHandler = useCallback((elementType) => {
    const textArea = markdownEditorRef.current;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    
    const result = insertMarkdownElement(input, start, end, elementType);
    setInput(result.text);
    updateMarkdown(id, { markdownInput: result.text });
    
    // Focus back on textarea and place cursor after the inserted text
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(result.newPosition, result.newPosition);
    }, 0);
  }, [input, id, updateMarkdown]);

  // Copy markdown to clipboard
  const handleCopyMarkdown = useCallback(() => {
    if (!input) return;
    
    copyToClipboard(input)
      .then(() => {
        setStatusMessage?.('Markdown copied to clipboard');
      })
      .catch(() => {
        setStatusMessage?.('Failed to copy to clipboard');
      });
  }, [input, setStatusMessage]);

  // Copy HTML to clipboard
  const handleCopyHtml = useCallback(() => {
    if (!render) return;
    
    const htmlDoc = generateHtmlDocument(input, render, false);
    
    copyToClipboard(htmlDoc)
      .then(() => {
        setStatusMessage?.('HTML copied to clipboard');
      })
      .catch(() => {
        setStatusMessage?.('Failed to copy HTML');
      });
  }, [input, render, setStatusMessage]);

  // Download markdown
  const handleDownloadMarkdown = useCallback(() => {
    downloadTextFile(input, 'document.md', 'text/markdown');
    setStatusMessage?.('Markdown file downloaded');
  }, [input, setStatusMessage]);

  // Download HTML
  const handleDownloadHtml = useCallback(() => {
    const htmlDoc = generateHtmlDocument(input, render, true);
    downloadTextFile(htmlDoc, 'document.html', 'text/html');
    setStatusMessage?.('HTML file downloaded');
  }, [input, render, setStatusMessage]);

  // Clear editor
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setInput('');
      setRender('');
      updateMarkdown(id, {
        markdownInput: '',
        markdownRender: '',
      });
      setTimeout(() => {
        markdownEditorRef.current?.focus();
      }, 0);
      setStatusMessage?.('Editor cleared');
    }
  }, [id, updateMarkdown, setStatusMessage]);

  return (
    <div className={`markdown-tab-content ${darkMode ? 'dark-mode' : ''} ${markdownStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Actions */}
      <div className="markdown-actions-section">
        <div className="edit-preview-buttons">
          <button
            className={`edit-markdown-button ${currentMode === 'edit' ? 'active' : ''}`}
            onClick={() => {
              setCurrentMode('edit');
              updateMarkdown(id, { previewMode: 'edit' });
            }}
          >
            <span className="button-icon">✏️</span>
            <span className="button-text">Edit</span>
          </button>
          <button
            className={`split-markdown-button ${currentMode === 'split' ? 'active' : ''}`}
            onClick={() => {
              setCurrentMode('split');
              updateMarkdown(id, { previewMode: 'split' });
            }}
          >
            <span className="button-icon">📄</span>
            <span className="button-text">Split View</span>
          </button>
          <button
            className={`preview-markdown-button ${currentMode === 'preview' ? 'active' : ''}`}
            onClick={() => {
              setCurrentMode('preview');
              updateMarkdown(id, { previewMode: 'preview' });
            }}
          >
            <span className="button-icon">👁️</span>
            <span className="button-text">Preview</span>
          </button>
        </div>
        <div className="secondary-actions">
          <button
            className="render-button"
            onClick={handleRender}
            disabled={currentOptions.autoRender || isRendering || !input.trim()}
            title={currentOptions.autoRender ? "Auto-render is enabled" : "Render markdown preview"}
          >
            {isRendering ? 'Rendering...' : 'Render'}
          </button>
          <button
            className="clear-button"
            onClick={handleClear}
            disabled={!input.trim()}
            title="Clear the editor content"
          >
            🗑️ Clear
          </button>
          <div className="dropdown" ref={dropdownRef}>
            <button 
              className="dropdown-toggle" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="More options"
            >
              Options
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu show">
                <div className="dropdown-item" onClick={() => {
                  handleCopyMarkdown();
                  setDropdownOpen(false);
                }}>
                  📋 Copy Markdown
                </div>
                <div className="dropdown-item" onClick={() => {
                  handleCopyHtml();
                  setDropdownOpen(false);
                }}>
                  📋 Copy HTML
                </div>
                <div className="dropdown-item" onClick={() => {
                  handleDownloadMarkdown();
                  setDropdownOpen(false);
                }}>
                  💾 Download MD
                </div>
                <div className="dropdown-item" onClick={() => {
                  handleDownloadHtml();
                  setDropdownOpen(false);
                }}>
                  💾 Download HTML
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options Section */}
      <div className="markdown-options-section">
        <div className="options-row">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={currentOptions.autoRender}
              onChange={(e) => {
                const newOptions = { ...currentOptions, autoRender: e.target.checked };
                setCurrentOptions(newOptions);
                updateMarkdown(id, { renderOptions: newOptions });
              }}
            />
            <span>Auto Render</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={currentOptions.syntaxHighlighting}
              onChange={(e) => {
                const newOptions = { ...currentOptions, syntaxHighlighting: e.target.checked };
                setCurrentOptions(newOptions);
                updateMarkdown(id, { renderOptions: newOptions });
              }}
            />
            <span>Syntax Highlighting</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={currentOptions.showLineNumbers}
              onChange={(e) => {
                const newOptions = { ...currentOptions, showLineNumbers: e.target.checked };
                setCurrentOptions(newOptions);
                updateMarkdown(id, { renderOptions: newOptions });
              }}
            />
            <span>Show Line Numbers</span>
          </label>
        </div>
      </div>

      {/* Markdown Container */}
      <div className={`markdown-container ${currentMode}`}>
        {(currentMode === 'edit' || currentMode === 'split') && (
          <div className="markdown-edit-panel">
            <div className="markdown-toolbar">
              <div className="toolbar-group">
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('h1')}
                  title="Insert Heading 1"
                >
                  H1
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('h2')}
                  title="Insert Heading 2"
                >
                  H2
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('h3')}
                  title="Insert Heading 3"
                >
                  H3
                </button>
              </div>
              
              <div className="toolbar-group">
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('bold')}
                  title="Make text bold"
                >
                  B
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('italic')}
                  title="Make text italic"
                >
                  I
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('strike')}
                  title="Strikethrough text"
                >
                  S
                </button>
              </div>
              
              <div className="toolbar-group">
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('link')}
                  title="Insert link"
                >
                  🔗
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('image')}
                  title="Insert image"
                >
                  🖼️
                </button>
              </div>
              
              <div className="toolbar-group">
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('code')}
                  title="Insert inline code"
                >
                  `
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('codeblock')}
                  title="Insert code block"
                >
                  ```
                </button>
              </div>
              
              <div className="toolbar-group">
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('ul')}
                  title="Insert unordered list"
                >
                  •
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('ol')}
                  title="Insert ordered list"
                >
                  1.
                </button>
              </div>
              
              <div className="toolbar-group">
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('quote')}
                  title="Insert blockquote"
                >
                  "
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('hr')}
                  title="Insert horizontal rule"
                >
                  —
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => insertMarkdownElementHandler('table')}
                  title="Insert table"
                >
                  ⊞
                </button>
              </div>
            </div>
            
            <textarea
              ref={markdownEditorRef}
              className="markdown-editor"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                updateMarkdown(id, { markdownInput: e.target.value });
              }}
              placeholder="Enter Markdown here..."
              title="Markdown editor"
            />
          </div>
        )}
        
        {(currentMode === 'preview' || currentMode === 'split') && (
          <div className="markdown-preview-panel">
            <div className="preview-header">
              <h3>Preview</h3>
            </div>
            <div 
              ref={previewRef}
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: render }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownTab;

