/**
 * shared/utils/markdownUtils.js
 * --------------------------
 * Utilities for markdown parsing, rendering, and exporting
 */

/**
 * Render markdown content to HTML
 * @param {string} markdown - Markdown content to render
 * @param {Object} options - Rendering options
 * @returns {string} Rendered HTML
 */
export const renderMarkdown = (markdown, options = {}) => {
    if (!markdown) return '';
    
    const {
      syntaxHighlighting = true,
      showLineNumbers = false,
      sanitize = true
    } = options;
    
    try {
      // In a real app, you would use a library like marked or remark
      // For demo purposes, we'll use a simplified approach
      
      // 1. Process headings
      let processed = markdown
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>');
      
      // 2. Process emphasis (bold, italic, strikethrough)
      processed = processed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>');
      
      // 3. Process lists
      // This is a simplified approach - real Markdown parsers handle nesting properly
      processed = processed
        .replace(/^\s*- (.*$)/gm, '<li>$1</li>')
        .replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
      processed = processed
        .replace(/(<li>.*<\/li>)\s*(<li>)/g, '$1<li>')
        .replace(/(<li>.*<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
      
      // 4. Process links and images
      processed = processed
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />');
      
      // 5. Process code blocks and inline code
      if (syntaxHighlighting) {
        processed = processed
          .replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
            const langClass = lang ? ` class="language-${lang}"` : '';
            const lines = code.split('\n');
            let codeHtml = '';
            
            if (showLineNumbers) {
              codeHtml = '<table class="code-with-line-numbers">';
              lines.forEach((line, i) => {
                codeHtml += `<tr><td class="line-number">${i + 1}</td><td class="line-content">${escapeHtml(line)}</td></tr>`;
              });
              codeHtml += '</table>';
            } else {
              codeHtml = escapeHtml(code);
            }
            
            return `<pre><code${langClass}>${codeHtml}</code></pre>`;
          })
          .replace(/`([^`]+)`/g, '<code>$1</code>');
      } else {
        processed = processed
          .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
          .replace(/`([^`]+)`/g, '<code>$1</code>');
      }
      
      // 6. Process blockquotes
      processed = processed
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
      
      // 7. Process horizontal rules
      processed = processed
        .replace(/^---$/gm, '<hr />');
      
      // 8. Process tables
      processed = processed
        .replace(/\|(.+)\|/g, '<tr><td>$1</td></tr>')
        .replace(/<td>(.+?)<\/td>/g, '<td>$1</td>');
      
      // 9. Convert line breaks to paragraphs
      processed = processed
        .replace(/\n\n([^<].*)/g, '<p>$1</p>');
      
      // 10. Simple sanitization if enabled
      if (sanitize) {
        processed = sanitizeHtml(processed);
      }
      
      return processed;
    } catch (err) {
      console.error('Error rendering markdown:', err);
      return `<p>Error rendering markdown: ${err.message}</p>`;
    }
  };
  
  /**
   * Simple HTML sanitization to prevent XSS
   * @param {string} html - HTML to sanitize
   * @returns {string} Sanitized HTML
   */
  export const sanitizeHtml = (html) => {
    // In a real app, you would use a library like DOMPurify
    // This is a very simplistic sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, 'removed:')
      .replace(/on\w+=/gi, 'removed=');
  };
  
  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  export const escapeHtml = (text) => {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Insert a Markdown element at cursor position
   * @param {string} currentText - Current text content
   * @param {number} start - Selection start position
   * @param {number} end - Selection end position
   * @param {string} elementType - Type of element to insert
   * @returns {Object} New text and cursor position
   */
  export const insertMarkdownElement = (currentText, start, end, elementType) => {
    const selectedText = currentText.substring(start, end);
    let insertText = '';
    
    switch (elementType) {
      case 'h1':
        insertText = `# ${selectedText || 'Heading 1'}`;
        break;
      case 'h2':
        insertText = `## ${selectedText || 'Heading 2'}`;
        break;
      case 'h3':
        insertText = `### ${selectedText || 'Heading 3'}`;
        break;
      case 'bold':
        insertText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        insertText = `*${selectedText || 'italic text'}*`;
        break;
      case 'strike':
        insertText = `~~${selectedText || 'strikethrough text'}~~`;
        break;
      case 'link':
        insertText = `[${selectedText || 'link text'}](https://example.com)`;
        break;
      case 'image':
        insertText = `![${selectedText || 'alt text'}](https://via.placeholder.com/150)`;
        break;
      case 'code':
        insertText = `\`${selectedText || 'inline code'}\``;
        break;
      case 'codeblock':
        insertText = `\`\`\`javascript\n${selectedText || 'function example() {\n  return "Hello world!";\n}'}\n\`\`\``;
        break;
      case 'ul':
        insertText = `- ${selectedText || 'List item'}\n- Another item\n- And another`;
        break;
      case 'ol':
        insertText = `1. ${selectedText || 'First item'}\n2. Second item\n3. Third item`;
        break;
      case 'quote':
        insertText = `> ${selectedText || 'Blockquote text'}`;
        break;
      case 'hr':
        insertText = `\n---\n`;
        break;
      case 'table':
        insertText = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |`;
        break;
      default:
        return { text: currentText, newPosition: end };
    }
    
    const newText = currentText.substring(0, start) + insertText + currentText.substring(end);
    const newPosition = start + insertText.length;
    
    return { text: newText, newPosition };
  };
  
  /**
   * Generate HTML document from Markdown content
   * @param {string} markdownContent - Original Markdown content
   * @param {string} renderedHtml - HTML rendered from Markdown
   * @param {boolean} fullDocument - Whether to create a full HTML document
   * @returns {string} HTML content
   */
  export const generateHtmlDocument = (markdownContent, renderedHtml, fullDocument = true) => {
    if (!fullDocument) return renderedHtml;
    
    // Extract title from markdown (first h1)
    const titleMatch = markdownContent.match(/^# (.*$)/m);
    const title = titleMatch ? titleMatch[1] : 'Markdown Document';
    
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        color: #333;
      }
      h1, h2 {
        border-bottom: 1px solid #eaecef;
        padding-bottom: 0.3em;
      }
      pre {
        background-color: #f6f8fa;
        padding: 1rem;
        border-radius: 0.375rem;
        overflow-x: auto;
      }
      code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        background-color: #f6f8fa;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-size: 85%;
      }
      pre code {
        background-color: transparent;
        padding: 0;
        font-size: 100%;
      }
      blockquote {
        border-left: 4px solid #dfe2e5;
        padding-left: 1rem;
        margin-left: 0;
        color: #6a737d;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 1rem;
      }
      th, td {
        border: 1px solid #dfe2e5;
        padding: 0.5rem;
      }
      th {
        background-color: #f6f8fa;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      a {
        color: #0366d6;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .code-with-line-numbers {
        width: 100%;
        border-collapse: collapse;
      }
      .code-with-line-numbers .line-number {
        text-align: right;
        padding-right: 1em;
        color: #6a737d;
        width: 2em;
        user-select: none;
        border-right: 1px solid #dfe2e5;
      }
      .code-with-line-numbers .line-content {
        padding-left: 1em;
        white-space: pre;
      }
    </style>
  </head>
  <body>
    ${renderedHtml}
  </body>
  </html>`;
  };
  
  /**
   * Load templates from local storage
   * @returns {Array} Array of loaded templates or default templates
   */
  export const loadTemplatesFromStorage = () => {
    try {
      const savedTemplates = localStorage.getItem('markdown-templates');
      if (savedTemplates) {
        return JSON.parse(savedTemplates);
      } else {
        // Set default templates if none exists
        const defaultTemplates = [
          {
            name: 'Basic Structure',
            content: `# Document Title\n\n## Section 1\n\nYour content here.\n\n## Section 2\n\nMore content here.`
          },
          {
            name: 'README Template',
            content: `# Project Name\n\n## Description\nA brief description of what this project does.\n\n## Installation\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Usage\n\`\`\`javascript\nconst example = require('example');\nexample.doSomething();\n\`\`\`\n\n## License\nMIT`
          },
          {
            name: 'Table Example',
            content: `| Name | Type | Description |\n|------|------|-------------|\n| id | string | Unique identifier |\n| name | string | User's name |\n| age | number | User's age |`
          }
        ];
        localStorage.setItem('markdown-templates', JSON.stringify(defaultTemplates));
        return defaultTemplates;
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      return [];
    }
  };
  
  /**
   * Save a template to local storage
   * @param {Array} currentTemplates - Current templates array
   * @param {string} name - Template name
   * @param {string} content - Template content
   * @returns {Array} Updated templates array
   */
  export const saveTemplate = (currentTemplates, name, content) => {
    try {
      const newTemplate = { name, content };
      const updatedTemplates = [...currentTemplates, newTemplate];
      localStorage.setItem('markdown-templates', JSON.stringify(updatedTemplates));
      return updatedTemplates;
    } catch (err) {
      console.error('Error saving template:', err);
      return currentTemplates;
    }
  };
  
  /**
   * Remove a template from storage
   * @param {Array} currentTemplates - Current templates array
   * @param {number} index - Index to remove
   * @returns {Array} Updated templates array
   */
  export const removeTemplate = (currentTemplates, index) => {
    try {
      const updatedTemplates = currentTemplates.filter((_, i) => i !== index);
      localStorage.setItem('markdown-templates', JSON.stringify(updatedTemplates));
      return updatedTemplates;
    } catch (err) {
      console.error('Error removing template:', err);
      return currentTemplates;
    }
  };
  
  /**
   * Get welcome template for initial content
   * @returns {string} Welcome template markdown
   */
  export const getWelcomeTemplate = () => {
    return `# Welcome to the Markdown Previewer
  
  This tool allows you to write and preview Markdown content in real-time.
  
  ## Features
  
  - **Live Preview:** See your Markdown rendered as you type
  - **Syntax Highlighting:** Code blocks are highlighted
  - **Save Templates:** Store commonly used Markdown snippets
  - **Export:** Download your Markdown content
  
  ## Basic Markdown Guide
  
  ### Headings
  
  # Heading 1
  ## Heading 2
  ### Heading 3
  
  ### Emphasis
  
  *Italic text* or _Italic text_
  **Bold text** or __Bold text__
  ~~Strikethrough~~
  
  ### Lists
  
  Unordered list:
  - Item 1
  - Item 2
    - Nested item
  
  Ordered list:
  1. First item
  2. Second item
     1. Nested item
  
  ### Links and Images
  
  [Link text](https://example.com)
  ![Alt text for image](https://via.placeholder.com/150)
  
  ### Code
  
  Inline code: \`const example = "Hello World";\`
  
  Code block:
  \`\`\`javascript
  function greeting(name) {
    return \`Hello, \${name}!\`;
  }
  \`\`\`
  
  ### Tables
  
  | Header 1 | Header 2 |
  |----------|----------|
  | Cell 1   | Cell 2   |
  | Cell 3   | Cell 4   |
  
  ### Blockquotes
  
  > This is a blockquote
  > > Nested blockquote
  
  ### Horizontal Rule
  
  ---
  
  Try editing this content to see the preview update in real-time!`;
  };
  
  /**
   * Create a download for a text file
   * @param {string} content - File content
   * @param {string} filename - File name
   * @param {string} type - MIME type
   */
  export const downloadTextFile = (content, filename, type) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };