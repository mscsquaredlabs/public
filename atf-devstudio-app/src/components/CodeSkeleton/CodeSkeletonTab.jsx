// CodeSkeletonTab.jsx
// Tab content for code skeleton generation

import { useState, useRef, useEffect, useCallback } from 'react';
import { getTemplateTypes, getProperName, getLanguageName, getTemplateName } from './utils/languageUtils';
import { generateCode, formatCodeForDisplay } from './utils/codeGeneration';
import { copyToClipboard as copyHelper } from '../../shared/utils/helpers';

const CodeSkeletonTab = ({
  skeleton,
  updateSkeleton,
  deleteSkeleton,
  setStatusMessage,
  darkMode,
  skeletonStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    language,
    templateType,
    options,
    generatedCode,
    configMode,
  } = skeleton;

  const [currentLanguage, setCurrentLanguage] = useState(language || 'javascript');
  const [currentTemplateType, setCurrentTemplateType] = useState(templateType || 'component');
  const [currentOptions, setCurrentOptions] = useState(options || {
    includeComments: true,
    includeTests: false,
    includeTypeInfo: true,
    className: 'MyComponent',
    functionName: 'myFunction',
    apiName: 'myApi',
    packageName: 'com.example.myapp',
    authorName: '',
    namespace: 'MyApp',
  });
  const [currentGeneratedCode, setCurrentGeneratedCode] = useState(generatedCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConfigMode, setCurrentConfigMode] = useState(configMode || 'simple');

  const codeInputRef = useRef(null);
  const generateTimeoutRef = useRef(null);

  // Toggle config mode
  const handleToggleConfigMode = useCallback(() => {
    const newMode = currentConfigMode === 'simple' ? 'advanced' : 'simple';
    setCurrentConfigMode(newMode);
    updateSkeleton(id, {
      configMode: newMode,
    });
  }, [currentConfigMode, id, updateSkeleton]);

  // Sync with prop changes
  useEffect(() => {
    setCurrentLanguage(language || 'javascript');
    setCurrentTemplateType(templateType || 'component');
    setCurrentOptions(options || {
      includeComments: true,
      includeTests: false,
      includeTypeInfo: true,
      className: 'MyComponent',
      functionName: 'myFunction',
      apiName: 'myApi',
      packageName: 'com.example.myapp',
      authorName: '',
      namespace: 'MyApp',
    });
    setCurrentGeneratedCode(generatedCode || '');
    setCurrentConfigMode(configMode || 'simple');
  }, [language, templateType, options, generatedCode, configMode]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSkeleton(id, {
        language: currentLanguage,
        templateType: currentTemplateType,
        options: currentOptions,
        generatedCode: currentGeneratedCode,
        configMode: currentConfigMode,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentLanguage, currentTemplateType, currentOptions, currentGeneratedCode, currentConfigMode, updateSkeleton]);

  // Update template types when language changes
  useEffect(() => {
    const availableTemplates = getTemplateTypes(currentLanguage);
    const templateExists = availableTemplates.some(t => t.id === currentTemplateType);
    
    if (!templateExists && availableTemplates.length > 0) {
      setCurrentTemplateType(availableTemplates[0].id);
      setStatusMessage?.(`Template type changed to "${availableTemplates[0].name}" for ${getLanguageName(currentLanguage)}`);
    }
  }, [currentLanguage, currentTemplateType, setStatusMessage]);

  // Generate code
  const handleGenerateCode = useCallback(() => {
    // Clear any existing timeout
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current);
    }
    
    setIsLoading(true);
    
    generateTimeoutRef.current = setTimeout(() => {
      try {
        const code = generateCode(currentLanguage, currentTemplateType, currentOptions);
        setCurrentGeneratedCode(code);
        
        updateSkeleton(id, {
          generatedCode: code,
        });
        
        setStatusMessage?.(`Generated ${getLanguageName(currentLanguage)} ${getTemplateName(currentLanguage, currentTemplateType)}`);
      } catch (error) {
        setStatusMessage?.(`Generation Error: ${error.message}`);
      } finally {
        setIsLoading(false);
        generateTimeoutRef.current = null;
      }
    }, 400);
  }, [currentLanguage, currentTemplateType, currentOptions, id, updateSkeleton, setStatusMessage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current);
      }
    };
  }, []);

  // Copy code to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    if (!currentGeneratedCode) {
      setStatusMessage?.('Nothing to copy. Generate code first.');
      return;
    }
    
    try {
      const success = await copyHelper(currentGeneratedCode);
      if (success) {
        setStatusMessage?.('Code copied to clipboard');
      } else {
        setStatusMessage?.('Failed to copy to clipboard');
      }
    } catch (error) {
      setStatusMessage?.(`Copy Error: ${error.message}`);
    }
  }, [currentGeneratedCode, setStatusMessage]);

  // Download code
  const handleDownload = useCallback(() => {
    if (!currentGeneratedCode) {
      setStatusMessage?.('Nothing to download. Generate code first.');
      return;
    }

    try {
      const blob = new Blob([currentGeneratedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get appropriate filename
      let filename = 'code';
      if (currentTemplateType === 'component' || currentTemplateType === 'class') {
        filename = currentOptions.className || 'Component';
      } else if (currentTemplateType === 'function' || currentTemplateType === 'hook') {
        filename = currentOptions.functionName || 'function';
      } else if (currentTemplateType === 'api' || currentTemplateType === 'controller') {
        filename = currentOptions.apiName || 'api';
      }
      
      const extensions = {
        javascript: '.js',
        typescript: '.ts',
        python: '.py',
        java: '.java',
        csharp: '.cs',
        go: '.go',
        php: '.php',
        ruby: '.rb',
        rust: '.rs',
        swift: '.swift'
      };
      
      if (currentLanguage === 'typescript' && currentTemplateType === 'component') {
        link.download = `${filename}.tsx`;
      } else {
        link.download = `${filename}${extensions[currentLanguage] || '.txt'}`;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatusMessage?.(`File downloaded: ${link.download}`);
    } catch (error) {
      setStatusMessage?.(`Download failed: ${error.message}`);
    }
  }, [currentGeneratedCode, currentLanguage, currentTemplateType, currentOptions, setStatusMessage]);

  // Clear code
  const handleClearCode = useCallback(() => {
    setCurrentGeneratedCode('');
    updateSkeleton(id, {
      generatedCode: '',
    });
    setStatusMessage?.('Code cleared');
  }, [id, updateSkeleton, setStatusMessage]);

  // Handle name input change
  const handleNameChange = (e) => {
    const value = e.target.value;
    const newOptions = { ...currentOptions };
    
    if (currentTemplateType === 'function' || currentTemplateType === 'hook') {
      newOptions.functionName = value;
    } else if (currentTemplateType === 'api' || 
               currentTemplateType === 'controller' || 
               currentTemplateType === 'springcontroller') {
      newOptions.apiName = value;
    } else {
      newOptions.className = value;
    }
    
    setCurrentOptions(newOptions);
  };

  // Get the appropriate name label and placeholder
  const getNameLabel = () => {
    if (currentTemplateType === 'function' || currentTemplateType === 'hook') {
      return 'Function Name';
    } else if (currentTemplateType === 'api' || 
               currentTemplateType === 'controller' || 
               currentTemplateType === 'springcontroller') {
      return 'API Name';
    } else {
      return 'Class Name';
    }
  };

  const getNamePlaceholder = () => {
    if (currentTemplateType === 'function' || currentTemplateType === 'hook') {
      return 'myFunction';
    } else if (currentTemplateType === 'api' || 
               currentTemplateType === 'controller' || 
               currentTemplateType === 'springcontroller') {
      return 'myApi';
    } else if (currentTemplateType === 'component') {
      return 'MyComponent';
    } else {
      return 'MyClass';
    }
  };

  const getNameValue = () => {
    return getProperName(currentTemplateType, currentOptions);
  };

  return (
    <div className={`code-skeleton-tab-content ${skeletonStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="code-skeleton-options-section">
        <div className="options-header">
          <h3 className="options-title">Configuration</h3>
          <button
            className="secondary-button mode-toggle-button"
            onClick={handleToggleConfigMode}
            title={`Switch to ${currentConfigMode === 'simple' ? 'Advanced' : 'Simple'} mode`}
          >
            {currentConfigMode === 'simple' ? '⚙️ Advanced' : '📝 Simple'}
          </button>
        </div>

        <div className="options-row">
          <div className="option-group">
            <label htmlFor={`language-select-${id}`} className="required">Language</label>
            <select
              id={`language-select-${id}`}
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="language-select"
            >
              {getTemplateTypes('').map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="option-group">
            <label htmlFor={`template-select-${id}`} className="required">Template Type</label>
            <select
              id={`template-select-${id}`}
              value={currentTemplateType}
              onChange={(e) => setCurrentTemplateType(e.target.value)}
              className="template-select"
            >
              {getTemplateTypes(currentLanguage).map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            <span className="helper-text">Templates vary by programming language</span>
          </div>

          <div className="option-group">
            <label htmlFor={`name-input-${id}`} className="required">{getNameLabel()}</label>
            <input
              id={`name-input-${id}`}
              type="text"
              value={getNameValue()}
              onChange={handleNameChange}
              placeholder={getNamePlaceholder()}
              className="name-input"
            />
            <span className="helper-text">
              {currentTemplateType === 'function' || currentTemplateType === 'hook' 
                ? 'Use camelCase (e.g., myFunction)' 
                : currentTemplateType === 'component' || currentTemplateType === 'class'
                  ? 'Use PascalCase (e.g., MyComponent)'
                  : 'Name for the API endpoint'}
            </span>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="options-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id={`include-comments-${id}`}
              checked={currentOptions.includeComments}
              onChange={(e) => setCurrentOptions({...currentOptions, includeComments: e.target.checked})}
            />
            <label htmlFor={`include-comments-${id}`}>Include Comments</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id={`include-tests-${id}`}
              checked={currentOptions.includeTests}
              onChange={(e) => setCurrentOptions({...currentOptions, includeTests: e.target.checked})}
            />
            <label htmlFor={`include-tests-${id}`}>Include Tests</label>
          </div>

          {(currentLanguage === 'typescript' || currentLanguage === 'javascript') && (
            <div className="checkbox-group">
              <input
                type="checkbox"
                id={`include-type-info-${id}`}
                checked={currentOptions.includeTypeInfo}
                onChange={(e) => setCurrentOptions({...currentOptions, includeTypeInfo: e.target.checked})}
              />
              <label htmlFor={`include-type-info-${id}`}>Include Type Information</label>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        {currentConfigMode === 'advanced' && (
          <div className="advanced-options-row">
            {currentLanguage === 'java' && (
              <div className="option-group">
                <label htmlFor={`package-name-${id}`}>Package Name</label>
                <input
                  id={`package-name-${id}`}
                  type="text"
                  value={currentOptions.packageName}
                  onChange={(e) => setCurrentOptions({...currentOptions, packageName: e.target.value})}
                  placeholder="com.example.myapp"
                  className="name-input"
                />
              </div>
            )}

            {currentLanguage === 'csharp' && (
              <div className="option-group">
                <label htmlFor={`namespace-${id}`}>Namespace</label>
                <input
                  id={`namespace-${id}`}
                  type="text"
                  value={currentOptions.namespace}
                  onChange={(e) => setCurrentOptions({...currentOptions, namespace: e.target.value})}
                  placeholder="MyApp"
                  className="name-input"
                />
              </div>
            )}

            <div className="option-group">
              <label htmlFor={`author-name-${id}`}>Author Name</label>
              <input
                id={`author-name-${id}`}
                type="text"
                value={currentOptions.authorName}
                onChange={(e) => setCurrentOptions({...currentOptions, authorName: e.target.value})}
                placeholder="Your name (optional)"
                className="name-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="code-skeleton-actions-section">
        <button
          className="action-button generate-button"
          onClick={handleGenerateCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-indicator"></span>
              Generating...
            </>
          ) : (
            `Generate ${getLanguageName(currentLanguage)} ${getTemplateName(currentLanguage, currentTemplateType)}`
          )}
        </button>
        <button
          className="secondary-button"
          onClick={handleCopyToClipboard}
          disabled={!currentGeneratedCode}
        >
          Copy
        </button>
        <button
          className="secondary-button"
          onClick={handleDownload}
          disabled={!currentGeneratedCode}
        >
          Download
        </button>
        <button
          className="secondary-button"
          onClick={handleClearCode}
          disabled={!currentGeneratedCode}
        >
          Clear
        </button>
      </div>

      {/* Results Section */}
      {currentGeneratedCode && (
        <div className="code-skeleton-results-section">
          <div className="results-header">
            <span className="status-indicator success">✓</span>
            <span className="results-message">
              {getLanguageName(currentLanguage)} {getTemplateName(currentLanguage, currentTemplateType)} Generated
            </span>
          </div>
          <div
            className="results-content"
            dangerouslySetInnerHTML={{ __html: formatCodeForDisplay(currentGeneratedCode, currentLanguage, currentTemplateType) }}
          />
        </div>
      )}
    </div>
  );
};

export default CodeSkeletonTab;

