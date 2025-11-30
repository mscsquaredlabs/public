// MarkdownPreviewerConfig.jsx
// Configuration panel for the Markdown Previewer component

import React from 'react';
import './MarkdownPreviewer.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const MarkdownPreviewerConfig = ({
  configMode, setConfigMode,
  renderOptions, setRenderOptions,
  templates, loadTemplate, removeTemplate,
  showSaveTemplateModal,
  downloadMarkdown, downloadHtml,
  copyMarkdown, copyHtml
}) => {
  return (
    <>
      <h3 className="config-section-title">Markdown Settings</h3>

         {/* Toggle switch */}
         <StandardToggleSwitch 
        leftLabel="Simple" 
        rightLabel="Advanced" 
        isActive={configMode}  // Pass the actual configMode value
        onChange={(value) => setConfigMode(value)} // This will receive 'simple' or 'advanced'
        name="configMode"
        leftValue="simple"
        rightValue="advanced"
      />

      {/* Basic Options - Visible in both modes */}
      <div className="form-group">
        <div className="config-option">
          <label title="Update preview automatically as you type">
            <input
              type="checkbox"
              checked={renderOptions.autoRender}
              onChange={() => setRenderOptions({
                ...renderOptions,
                autoRender: !renderOptions.autoRender
              })}
            />
            Auto-render preview
          </label>
        </div>
        
        <div className="config-option">
          <label title="Add syntax highlighting to code blocks">
            <input
              type="checkbox"
              checked={renderOptions.syntaxHighlighting}
              onChange={() => setRenderOptions({
                ...renderOptions,
                syntaxHighlighting: !renderOptions.syntaxHighlighting
              })}
            />
            Syntax highlighting for code
          </label>
        </div>
      </div>

      {/* Templates - Visible in both modes */}
      <div className="form-group">
        <h4 className="section-title">Templates</h4>
        <div className="templates-list">
          {templates.map((template, index) => (
            <div key={index} className="template-item">
              <div className="template-name">{template.name}</div>
              <div className="template-actions">
                <button
                  className="template-load"
                  onClick={() => loadTemplate(template.content)}
                  title={`Load the ${template.name} template`}
                >
                  Load
                </button>
                <button
                  className="template-remove"
                  onClick={() => removeTemplate(index)}
                  title={`Remove the ${template.name} template`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="save-template-button"
          onClick={showSaveTemplateModal}
          title="Save current Markdown content as a template for future use"
        >
          Save Current as Template
        </button>
      </div>

      {/* Advanced Options - Only visible in advanced mode */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <div className="config-option">
              <label title="Add line numbers to code blocks">
                <input
                  type="checkbox"
                  checked={renderOptions.showLineNumbers}
                  onChange={() => setRenderOptions({
                    ...renderOptions,
                    showLineNumbers: !renderOptions.showLineNumbers
                  })}
                />
                Show line numbers in code
              </label>
            </div>
            
            <div className="config-option">
              <label title="Sanitize HTML to prevent XSS attacks">
                <input
                  type="checkbox"
                  checked={renderOptions.sanitize}
                  onChange={() => setRenderOptions({
                    ...renderOptions,
                    sanitize: !renderOptions.sanitize
                  })}
                />
                Sanitize HTML (recommended)
              </label>
            </div>
          </div>

          <div className="form-group">
            <h4 className="section-title">Export Options</h4>
            <div className="export-buttons">
              <button 
                className="export-button"
                onClick={downloadMarkdown}
                title="Download Markdown content as a .md file"
              >
                Download Markdown
              </button>
              
              <button 
                className="export-button"
                onClick={downloadHtml}
                title="Download rendered HTML as a .html file"
              >
                Download HTML
              </button>
              
              <button 
                className="export-button"
                onClick={copyMarkdown}
                title="Copy Markdown content to clipboard"
              >
                Copy Markdown
              </button>
              
              <button 
                className="export-button"
                onClick={copyHtml}
                title="Copy rendered HTML to clipboard"
              >
                Copy HTML
              </button>
            </div>
          </div>
        </>
      )}
     </>
  );
};

export default MarkdownPreviewerConfig;