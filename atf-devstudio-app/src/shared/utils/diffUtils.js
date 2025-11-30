/**
 * shared/utils/diffUtils.js
 * --------------------------
 * Utilities for code diffing, comparison, and formatting
 */

/**
 * Calculate statistics for the diff
 * @param {Array} operations - Diff operations
 * @returns {Object} Diff statistics
 */
export const calculateDiffStats = (operations) => {
    if (!operations || operations.length === 0) {
      return {
        totalLines: 0,
        changedLines: 0,
        addedLines: 0,
        removedLines: 0,
        unchangedLines: 0,
        charsDiff: 0,
        wordsDiff: 0
      };
    }
  
    let stats = {
      totalLines: operations.length,
      changedLines: 0,
      addedLines: 0,
      removedLines: 0,
      unchangedLines: 0,
      charsDiff: 0,
      wordsDiff: 0
    };
  
    // Calculate line stats
    operations.forEach(op => {
      if (op.type === 'added') {
        stats.addedLines++;
        stats.changedLines++;
        stats.charsDiff += op.value.length;
        stats.wordsDiff += countWords(op.value);
      } else if (op.type === 'removed') {
        stats.removedLines++;
        stats.changedLines++;
        stats.charsDiff -= op.value.length;
        stats.wordsDiff -= countWords(op.value);
      } else if (op.type === 'unchanged') {
        stats.unchangedLines++;
      }
    });
  
    return stats;
  };

  
  const stripLeading = s => s.replace(/^\s+/, '');
  
  /**
   * Count words in a string
   * @param {string} str - String to count words in
   * @returns {number} Word count
   */
  export const countWords = (str) => {
    if (!str || str.trim() === '') return 0;
    return str.trim().split(/\s+/).length;
  };
  
  /**
   * Generate a summary HTML for diff statistics
   * @param {Object} stats - Diff statistics
   * @returns {string} HTML summary
   */
  export const generateDiffSummary = (stats) => {
    if (!stats) return '';
    
    const absCharsDiff = Math.abs(stats.charsDiff);
    const absWordsDiff = Math.abs(stats.wordsDiff);
    const charsDirection = stats.charsDiff >= 0 ? 'added' : 'removed';
    const wordsDirection = stats.wordsDiff >= 0 ? 'added' : 'removed';
    
    return `
      <div class="diff-summary">
        <div class="summary-header">Diff Summary</div>
        <div class="summary-content">
          <div class="summary-item">
            <span class="summary-label">Lines:</span>
            <span class="summary-value">${stats.totalLines} total, ${stats.unchangedLines} unchanged</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Changes:</span>
            <span class="summary-value added">+${stats.addedLines} added</span>,
            <span class="summary-value removed">-${stats.removedLines} removed</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Characters:</span>
            <span class="summary-value ${charsDirection}">${absCharsDiff} ${charsDirection}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Words:</span>
            <span class="summary-value ${wordsDirection}">${absWordsDiff} ${wordsDirection}</span>
          </div>
        </div>
      </div>
    `;
  };
  
  /**
   * Create a matrix for the Longest Common Subsequence algorithm
   * @param {Array} originalLines - Original text lines
   * @param {Array} modifiedLines - Modified text lines
   * @param {Object} options - Comparison options
   * @returns {Array} LCS matrix
   */
  export const createLCSMatrix = (originalLines, modifiedLines, options) => {
    const { ignoreWhitespace, ignoreCase } = options;
    
    const matrix = Array(originalLines.length + 1).fill().map(() => Array(modifiedLines.length + 1).fill(0));
    
    for (let i = 1; i <= originalLines.length; i++) {
      for (let j = 1; j <= modifiedLines.length; j++) {
        let original = originalLines[i - 1];
        let modified = modifiedLines[j - 1];
        
        if (ignoreWhitespace) {
          original = original.replace(/\s+/g, '');
          modified = modified.replace(/\s+/g, '');
        }
        
        if (ignoreCase) {
          original = original.toLowerCase();
          modified = modified.toLowerCase();
        }
        
        if (original === modified) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }
    
    return matrix;
  };
  
  /**
   * Extract diff operations from the LCS matrix
   * @param {Array} matrix - LCS matrix
   * @param {Array} originalLines - Original text lines
   * @param {Array} modifiedLines - Modified text lines
   * @param {Object} options - Comparison options (optional, for consistency)
   * @returns {Array} Diff operations
   */
  export const extractDiffOperations = (matrix, originalLines, modifiedLines, options = {}) => {
    const operations = [];
    let i = originalLines.length;
    let j = modifiedLines.length;
    
    // Helper function to normalize lines for comparison (matching matrix creation logic)
    const normalizeLine = (line) => {
      let normalized = line;
      if (options.ignoreWhitespace) {
        normalized = normalized.replace(/\s+/g, '');
      }
      if (options.ignoreCase) {
        normalized = normalized.toLowerCase();
      }
      return normalized;
    };
    
    while (i > 0 || j > 0) {
      // Compare normalized lines to match matrix logic
      const origNormalized = i > 0 ? normalizeLine(originalLines[i - 1]) : '';
      const modNormalized = j > 0 ? normalizeLine(modifiedLines[j - 1]) : '';
      
      if (i > 0 && j > 0 && origNormalized === modNormalized) {
        operations.unshift({
          type: 'unchanged',
          originalIndex: i - 1,
          modifiedIndex: j - 1,
          value: originalLines[i - 1]
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        operations.unshift({
          type: 'added',
          modifiedIndex: j - 1,
          value: modifiedLines[j - 1]
        });
        j--;
      } else if (i > 0) {
        operations.unshift({
          type: 'removed',
          originalIndex: i - 1,
          value: originalLines[i - 1]
        });
        i--;
      }
    }
    
    return operations;
  };
  
  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  export const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Calculate character-level differences between two strings
   * @param {string} original - Original text
   * @param {string} modified - Modified text
   * @returns {Array} Array of segments with type ('same', 'removed', 'added')
   */
  const calculateCharDiff = (original, modified) => {
    const segments = [];
    let i = 0, j = 0;
    const orig = original || '';
    const mod = modified || '';
    
    while (i < orig.length || j < mod.length) {
      if (i < orig.length && j < mod.length && orig[i] === mod[j]) {
        // Find the longest common substring
        let commonEnd = i + 1;
        while (commonEnd < orig.length && j + (commonEnd - i) < mod.length && 
               orig[commonEnd] === mod[j + (commonEnd - i)]) {
          commonEnd++;
        }
        const commonLength = commonEnd - i;
        segments.push({ type: 'same', text: orig.substring(i, commonEnd) });
        i = commonEnd;
        j += commonLength;
      } else {
        // Find deletions
        let delEnd = i;
        while (delEnd < orig.length && (j >= mod.length || orig[delEnd] !== mod[j])) {
          delEnd++;
        }
        if (delEnd > i) {
          segments.push({ type: 'removed', text: orig.substring(i, delEnd) });
          i = delEnd;
        }
        
        // Find additions
        let addEnd = j;
        while (addEnd < mod.length && (i >= orig.length || mod[addEnd] !== orig[i])) {
          addEnd++;
        }
        if (addEnd > j) {
          segments.push({ type: 'added', text: mod.substring(j, addEnd) });
          j = addEnd;
        }
      }
    }
    
    return segments;
  };

  /**
   * Generate HTML for the split view with enhanced highlighting
   * @param {Array} operations - Diff operations
   * @param {string} side - Which side to generate ('original' or 'modified')
   * @param {boolean} showLineNumbers - Whether to show line numbers
   * @param {Array} allOperations - All operations for comparison (to find matching lines)
   * @returns {string} Generated HTML
   */
  export const generateSplitViewHtml = (operations, side, showLineNumbers, allOperations = null) => {
    let html = '<table class="diff-table">';
    
    if (showLineNumbers) {
      html += '<colgroup><col class="line-number-col"><col class="code-col"></colgroup>';
    }
    
    // If allOperations provided, use it for better comparison
    const ops = allOperations || operations;
    
    // Build a map to find corresponding lines
    const originalToModified = new Map();
    const modifiedToOriginal = new Map();
    
    ops.forEach(op => {
      if (op.type === 'unchanged' && op.originalIndex !== undefined && op.modifiedIndex !== undefined) {
        originalToModified.set(op.originalIndex, op.modifiedIndex);
        modifiedToOriginal.set(op.modifiedIndex, op.originalIndex);
      }
    });
    
    operations.forEach((op, idx) => {
      if (side === 'original') {
        if (op.type === 'unchanged' || op.type === 'removed') {
          html += '<tr class="' + op.type + '">';
          
          if (showLineNumbers) {
            html += '<td class="line-number">' + (op.originalIndex !== undefined ? op.originalIndex + 1 : '') + '</td>';
          }
          
          let codeContent = '';
          if (op.type === 'removed') {
            // For removed lines, highlight the entire line
            codeContent = '<span class="diff-highlight-removed">' + escapeHtml(stripLeading(op.value)) + '</span>';
          } else if (op.type === 'unchanged') {
            // For unchanged lines, find the corresponding modified line
            const modIndex = originalToModified.get(op.originalIndex);
            if (modIndex !== undefined) {
              const matchingOp = ops.find(o => o.modifiedIndex === modIndex && o.type === 'unchanged');
              if (matchingOp && matchingOp.value !== op.value) {
                // Lines have character-level differences, highlight them
                const segments = calculateCharDiff(op.value, matchingOp.value);
                codeContent = segments.map(seg => {
                  if (seg.type === 'same') {
                    return escapeHtml(seg.text);
                  } else if (seg.type === 'removed') {
                    return '<span class="diff-highlight-removed-inline">' + escapeHtml(seg.text) + '</span>';
                  } else {
                    return '';
                  }
                }).join('');
              } else {
                codeContent = escapeHtml(stripLeading(op.value));
              }
            } else {
              codeContent = escapeHtml(stripLeading(op.value));
            }
          }
          
          html += '<td class="code">' + codeContent + '</td>';
          html += '</tr>';
        } else {
          html += '<tr class="spacer">';
          
          if (showLineNumbers) {
            html += '<td class="line-number"></td>';
          }
          
          html += '<td class="code"></td>';
          html += '</tr>';
        }
      } else if (side === 'modified') {
        if (op.type === 'unchanged' || op.type === 'added') {
          html += '<tr class="' + op.type + '">';
          
          if (showLineNumbers) {
            html += '<td class="line-number">' + (op.modifiedIndex !== undefined ? op.modifiedIndex + 1 : '') + '</td>';
          }
          
          let codeContent = '';
          if (op.type === 'added') {
            // For added lines, highlight the entire line
            codeContent = '<span class="diff-highlight-added">' + escapeHtml(op.value) + '</span>';
          } else if (op.type === 'unchanged') {
            // For unchanged lines, find the corresponding original line
            const origIndex = modifiedToOriginal.get(op.modifiedIndex);
            if (origIndex !== undefined) {
              const matchingOp = ops.find(o => o.originalIndex === origIndex && o.type === 'unchanged');
              if (matchingOp && matchingOp.value !== op.value) {
                // Lines have character-level differences, highlight them
                const segments = calculateCharDiff(matchingOp.value, op.value);
                codeContent = segments.map(seg => {
                  if (seg.type === 'same') {
                    return escapeHtml(seg.text);
                  } else if (seg.type === 'added') {
                    return '<span class="diff-highlight-added-inline">' + escapeHtml(seg.text) + '</span>';
                  } else {
                    return '';
                  }
                }).join('');
              } else {
                codeContent = escapeHtml(op.value);
              }
            } else {
              codeContent = escapeHtml(op.value);
            }
          }
          
          html += '<td class="code">' + codeContent + '</td>';
          html += '</tr>';
        } else {
          html += '<tr class="spacer">';
          
          if (showLineNumbers) {
            html += '<td class="line-number"></td>';
          }
          
          html += '<td class="code"></td>';
          html += '</tr>';
        }
      }
    });
    
    html += '</table>';
    return html;
  };
  
  /**
   * Generate HTML for the unified view
   * @param {Array} operations - Diff operations
   * @param {boolean} showLineNumbers - Whether to show line numbers
   * @returns {string} Generated HTML
   */
  export const generateUnifiedViewHtml = (operations, showLineNumbers) => {
    let html = '<table class="diff-table">';
    
    if (showLineNumbers) {
      html += '<colgroup><col class="line-number-col"><col class="line-number-col"><col class="code-col"></colgroup>';
    }
    
    operations.forEach(op => {
      html += '<tr class="' + op.type + '">';
      
      if (showLineNumbers) {
        if (op.type === 'unchanged' || op.type === 'removed') {
          html += '<td class="line-number">' + (op.originalIndex + 1) + '</td>';
        } else {
          html += '<td class="line-number"></td>';
        }
        
        if (op.type === 'unchanged' || op.type === 'added') {
          html += '<td class="line-number">' + (op.modifiedIndex + 1) + '</td>';
        } else {
          html += '<td class="line-number"></td>';
        }
      }
      
      html += '<td class="code">';
      if (op.type === 'added') {
        html += '+ ' + escapeHtml(op.value);
      } else if (op.type === 'removed') {
        html += '- ' + escapeHtml(op.value);
      } else {
        html += '  ' + escapeHtml(op.value);
      }
      html += '</td>';
      html += '</tr>';
    });
    
    html += '</table>';
    return html;
  };
  
  /**
   * Get code examples for different languages
   * @returns {Object} Object with code examples
   */
  export const getCodeExamples = () => {
    return {
      javaCode: {
        original: `public class Hello {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
          int x = 5;
          int y = 10;
          int sum = x + y;
          System.out.println("Sum: " + sum);
      }
  }`,
        modified: `public class Hello {
      public static void main(String[] args) {
          System.out.println("Hello, Java World!");
          int x = 10;  // Changed value
          int y = 20;  // Changed value
          int sum = x + y;
          int product = x * y;  // Added line
          System.out.println("Sum: " + sum);
          System.out.println("Product: " + product);  // Added line
      }
  }`
      },
      htmlCode: {
        original: `<!DOCTYPE html>
  <html>
  <head>
      <title>My Webpage</title>
      <meta charset="UTF-8">
  </head>
  <body>
      <h1>Welcome to my site</h1>
      <p>This is a paragraph.</p>
      <ul>
          <li>Item 1</li>
          <li>Item 2</li>
      </ul>
  </body>
  </html>`,
        modified: `<!DOCTYPE html>
  <html>
  <head>
      <title>My New Webpage</title>
      <meta charset="UTF-8">
      <link rel="stylesheet" href="styles.css">
  </head>
  <body>
      <header>
          <h1>Welcome to my updated site</h1>
      </header>
      <p>This is a modified paragraph.</p>
      <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
      </ul>
      <footer>Copyright 2025</footer>
  </body>
  </html>`
      },
      javascriptCode: {
        original: `function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      total += items[i].price;
    }
    return total;
  }
  
  const items = [
    { name: 'Book', price: 10 },
    { name: 'Pen', price: 2 },
    { name: 'Notebook', price: 5 }
  ];
  
  console.log('Total: $' + calculateTotal(items));`,
        modified: `function calculateTotal(items, discount = 0) {
    let total = 0;
    
    // Use forEach instead of for loop
    items.forEach(item => {
      total += item.price;
    });
    
    // Apply discount
    if (discount > 0) {
      total -= (total * discount);
    }
    
    return total;
  }
  
  const items = [
    { name: 'Book', price: 10 },
    { name: 'Pen', price: 2 },
    { name: 'Notebook', price: 5 },
    { name: 'Marker', price: 3 }
  ];
  
  // Apply 10% discount
  console.log('Total: $' + calculateTotal(items, 0.1));`
      },
      cssCode: {
        original: `.container {
    width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f0f0f0;
  }
  
  .header {
    color: #333;
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  .content {
    line-height: 1.5;
    color: #666;
  }`,
        modified: `.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    color: #222;
    font-size: 28px;
    margin-bottom: 20px;
    font-weight: bold;
  }
  
  .content {
    line-height: 1.6;
    color: #444;
    font-size: 16px;
  }
  
  .footer {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 15px;
    color: #888;
  }`
      }
    };
  };