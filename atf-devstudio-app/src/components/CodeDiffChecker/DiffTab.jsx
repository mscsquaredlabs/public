// DiffTab.jsx
// Tab content for code diff comparison

import { useState, useRef, useEffect } from 'react';
import {
  calculateDiffStats,
  generateDiffSummary,
  createLCSMatrix,
  extractDiffOperations,
  generateSplitViewHtml,
  generateUnifiedViewHtml,
} from '../../shared/utils/diffUtils';

const DiffTab = ({
  diff,
  updateDiff,
  deleteDiff,
  setStatusMessage,
  darkMode,
  diffStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    originalCode,
    modifiedCode,
    diffOptions,
    diffResults,
    diffStats,
  } = diff;

  const [originalText, setOriginalText] = useState(originalCode || '');
  const [modifiedText, setModifiedText] = useState(modifiedCode || '');
  const [currentDiffResults, setCurrentDiffResults] = useState(diffResults || null);
  const [currentDiffStats, setCurrentDiffStats] = useState(diffStats || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState(diffOptions || {
    ignoreWhitespace: false,
    ignoreCase: false,
    showLineNumbers: true,
    contextLines: 3,
    splitView: true,
  });

  const originalTextareaRef = useRef(null);
  const modifiedTextareaRef = useRef(null);
  const diffContentRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    setOriginalText(originalCode || '');
    setModifiedText(modifiedCode || '');
    setCurrentDiffResults(diffResults || null);
    setCurrentDiffStats(diffStats || null);
    setOptions(diffOptions || {
      ignoreWhitespace: false,
      ignoreCase: false,
      showLineNumbers: true,
      contextLines: 3,
      splitView: true,
    });
  }, [originalCode, modifiedCode, diffResults, diffStats, diffOptions]);

  // Scroll sync for split view
  useEffect(() => {
    if (!currentDiffResults || !options.splitView) return;

    const leftPane = diffContentRef.current?.querySelector('.split-view .left-panel .diff-content');
    const rightPane = diffContentRef.current?.querySelector('.split-view .right-panel .diff-content');
    if (!leftPane || !rightPane) return;

    let syncingLeft = false;
    let syncingRight = false;

    const onLeftScroll = () => {
      if (syncingLeft) { syncingLeft = false; return; }
      syncingRight = true;
      rightPane.scrollTop = leftPane.scrollTop;
    };
    const onRightScroll = () => {
      if (syncingRight) { syncingRight = false; return; }
      syncingLeft = true;
      leftPane.scrollTop = rightPane.scrollTop;
    };

    leftPane.addEventListener('scroll', onLeftScroll);
    rightPane.addEventListener('scroll', onRightScroll);

    return () => {
      leftPane.removeEventListener('scroll', onLeftScroll);
      rightPane.removeEventListener('scroll', onRightScroll);
    };
  }, [currentDiffResults, options.splitView]);

  const handleGenerate = () => {
    if (!originalText.trim() || !modifiedText.trim()) {
      setStatusMessage?.('Please enter both original and modified code');
      return;
    }

    setIsGenerating(true);
    try {
      const originalLines = originalText.split('\n');
      const modifiedLines = modifiedText.split('\n');

      const matrix = createLCSMatrix(originalLines, modifiedLines, {
        ignoreWhitespace: options.ignoreWhitespace,
        ignoreCase: options.ignoreCase,
      });

      const operations = extractDiffOperations(matrix, originalLines, modifiedLines, {
        ignoreWhitespace: options.ignoreWhitespace,
        ignoreCase: options.ignoreCase,
      });
      const stats = calculateDiffStats(operations);
      setCurrentDiffStats(stats);

      let diffHtml = `<div class="diff-container" style="display:flex; flex-direction:column; height:100%; min-height:400px; overflow:hidden;">`;

      if (options.splitView) {
        diffHtml += `
          <div class="split-view" style="display:flex; flex:1; min-height:0; overflow:hidden;">
            <div class="left-panel" style="display:flex; flex-direction:column; width:50%; min-height:0; overflow:hidden;">
              <h3 style="flex:0 0 auto; margin:0; padding:8px 12px; background-color:${darkMode ? '#374151' : '#f9fafb'}; border-bottom:1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}; color:${darkMode ? '#f9fafb' : '#1f2937'};">Original</h3>
              <div class="diff-content" style="flex:1; margin:0; padding:0; overflow:auto;">
                ${generateSplitViewHtml(operations, 'original', options.showLineNumbers, operations)}
              </div>
            </div>
            <div class="right-panel" style="display:flex; flex-direction:column; width:50%; min-height:0; overflow:hidden; border-left:1px solid ${darkMode ? '#4b5563' : '#e5e7eb'};">
              <h3 style="flex:0 0 auto; margin:0; padding:8px 12px; background-color:${darkMode ? '#374151' : '#f9fafb'}; border-bottom:1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}; color:${darkMode ? '#f9fafb' : '#1f2937'};">Modified</h3>
              <div class="diff-content" style="flex:1; margin:0; padding:0; overflow:auto;">
                ${generateSplitViewHtml(operations, 'modified', options.showLineNumbers, operations)}
              </div>
            </div>
          </div>
        `;
      } else {
        diffHtml += `
          <div class="unified-view" style="display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden;">
            <h3 style="flex:0 0 auto; margin:0; padding:8px 12px; background-color:${darkMode ? '#374151' : '#f9fafb'}; border-bottom:1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}; color:${darkMode ? '#f9fafb' : '#1f2937'};">Unified Diff</h3>
            <div class="diff-content" style="flex:1; overflow:auto; min-height:0;">
              ${generateUnifiedViewHtml(operations, options.showLineNumbers)}
            </div>
          </div>
        `;
      }

      diffHtml += `</div>`;
      setCurrentDiffResults(diffHtml);

      updateDiff(id, {
        originalCode: originalText,
        modifiedCode: modifiedText,
        diffResults: diffHtml,
        diffStats: stats,
        diffOptions: options,
      });

      setStatusMessage?.(`Diff generated: +${stats.addedLines} added, -${stats.removedLines} removed`);
    } catch (error) {
      console.error('Error generating diff:', error);
      setStatusMessage?.(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    updateDiff(id, {
      originalCode: modifiedText,
      modifiedCode: originalText,
    });
    setStatusMessage?.('Code swapped');
  };

  const handleCopyOriginal = () => {
    if (originalText) {
      navigator.clipboard.writeText(originalText).then(
        () => setStatusMessage?.('Original code copied'),
        () => setStatusMessage?.('Failed to copy')
      );
    }
  };

  const handleCopyModified = () => {
    if (modifiedText) {
      navigator.clipboard.writeText(modifiedText).then(
        () => setStatusMessage?.('Modified code copied'),
        () => setStatusMessage?.('Failed to copy')
      );
    }
  };

  const handleExportHtml = () => {
    if (!currentDiffResults) return;

    try {
      const exportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Code Diff - ${title}</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 20px; background: ${darkMode ? '#1f2937' : '#ffffff'}; color: ${darkMode ? '#f9fafb' : '#1f2937'}; }
            .container { max-width: 1200px; margin: 0 auto; }
            h1 { margin-top: 0; color: #4f46e5; }
            ${document.querySelector('#diff-styles')?.textContent || ''}
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Code Difference - ${title}</h1>
            ${currentDiffStats ? generateDiffSummary(currentDiffStats) : ''}
            ${currentDiffResults}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([exportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-diff-${title.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage?.('Diff exported as HTML');
    } catch (err) {
      setStatusMessage?.(`Error: ${err.message}`);
    }
  };

  return (
    <div className={`diff-tab-content ${darkMode ? 'dark-mode' : ''} ${diffStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Input Section */}
      <div className="diff-input-section">
        <div className="input-panel">
          <div className="panel-header">
            <label className="panel-label">Original Code</label>
            <button
              className="copy-button-small"
              onClick={handleCopyOriginal}
              disabled={!originalText}
              title="Copy original code"
            >
              📋
            </button>
          </div>
          <textarea
            ref={originalTextareaRef}
            className="diff-textarea"
            value={originalText}
            onChange={(e) => {
              setOriginalText(e.target.value);
              updateDiff(id, { originalCode: e.target.value });
            }}
            placeholder="Enter original code..."
            rows={12}
          />
        </div>

        <div className="input-panel">
          <div className="panel-header">
            <label className="panel-label">Modified Code</label>
            <button
              className="copy-button-small"
              onClick={handleCopyModified}
              disabled={!modifiedText}
              title="Copy modified code"
            >
              📋
            </button>
          </div>
          <textarea
            ref={modifiedTextareaRef}
            className="diff-textarea"
            value={modifiedText}
            onChange={(e) => {
              setModifiedText(e.target.value);
              updateDiff(id, { modifiedCode: e.target.value });
            }}
            placeholder="Enter modified code..."
            rows={12}
          />
        </div>
      </div>

      {/* Options */}
      <div className="diff-options-section">
        <div className="options-row">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.ignoreWhitespace}
              onChange={(e) => {
                const newOptions = { ...options, ignoreWhitespace: e.target.checked };
                setOptions(newOptions);
                updateDiff(id, { diffOptions: newOptions });
              }}
            />
            <span>Ignore Whitespace</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.ignoreCase}
              onChange={(e) => {
                const newOptions = { ...options, ignoreCase: e.target.checked };
                setOptions(newOptions);
                updateDiff(id, { diffOptions: newOptions });
              }}
            />
            <span>Ignore Case</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.showLineNumbers}
              onChange={(e) => {
                const newOptions = { ...options, showLineNumbers: e.target.checked };
                setOptions(newOptions);
                updateDiff(id, { diffOptions: newOptions });
              }}
            />
            <span>Show Line Numbers</span>
          </label>
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={options.splitView}
              onChange={(e) => {
                const newOptions = { ...options, splitView: e.target.checked };
                setOptions(newOptions);
                updateDiff(id, { diffOptions: newOptions });
              }}
            />
            <span>Split View</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="diff-actions-section">
        <button
          className="generate-diff-button"
          onClick={handleGenerate}
          disabled={!originalText.trim() || !modifiedText.trim() || isGenerating}
        >
          <span className="generate-icon">🔍</span>
          <span className="generate-text">
            {isGenerating ? 'Generating Diff...' : 'Generate Diff'}
          </span>
          {!isGenerating && <span className="generate-arrow">→</span>}
        </button>
        <button
          className="swap-button"
          onClick={handleSwap}
          disabled={!originalText && !modifiedText}
          title="Swap original and modified code"
        >
          🔄 Swap
        </button>
        {currentDiffResults && (
          <button
            className="export-button"
            onClick={handleExportHtml}
            title="Export diff as HTML"
          >
            💾 Export HTML
          </button>
        )}
      </div>

      {/* Diff Results */}
      {currentDiffResults && (
        <div className="diff-results-section">
          {currentDiffStats && (
            <div className="diff-stats-bar">
              <span className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{currentDiffStats.totalLines}</span>
              </span>
              <span className="stat-item added">
                <span className="stat-label">Added:</span>
                <span className="stat-value">+{currentDiffStats.addedLines}</span>
              </span>
              <span className="stat-item removed">
                <span className="stat-label">Removed:</span>
                <span className="stat-value">-{currentDiffStats.removedLines}</span>
              </span>
              <span className="stat-item">
                <span className="stat-label">Unchanged:</span>
                <span className="stat-value">{currentDiffStats.unchangedLines}</span>
              </span>
            </div>
          )}
          <div
            ref={diffContentRef}
            className="diff-results-content"
            dangerouslySetInnerHTML={{ __html: currentDiffResults }}
          />
        </div>
      )}
    </div>
  );
};

export default DiffTab;

