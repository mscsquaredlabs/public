// AppGeneratorTab.jsx
// Tab content for app generation

import { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { getJavaDirectoryStructure, getJavaAppTypeDescription, generateJavaApp } from './JavaAppHelper';
import { generateReactApp } from './ReactAppHelper';
import { generateNodeApp } from './NodeAppHelper';
import { generatePythonApp } from './PythonAppHelper';
import { generateCustomApp } from './CustomAppHelper';
import { validateDirectoryStructure } from './DirectoryValidator';

const AppGeneratorTab = ({
  generator,
  updateGenerator,
  deleteGenerator,
  setStatusMessage,
  darkMode,
  generatorStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    appType,
    javaAppType,
    appName,
    description,
    version,
    author,
    includeTests,
    includeReadme,
    includeGitignore,
    customDirectoryTemplate,
    showDirectoryTemplateInput,
    outputDirectory,
  } = generator;

  const [currentAppType, setCurrentAppType] = useState(appType || 'react');
  const [currentJavaAppType, setCurrentJavaAppType] = useState(javaAppType || 'java-core');
  const [currentAppName, setCurrentAppName] = useState(appName || 'atf-app');
  const [currentDescription, setCurrentDescription] = useState(description || 'ATF Dev Studio - Sample Application');
  const [currentVersion, setCurrentVersion] = useState(version || '1.0.0');
  const [currentAuthor, setCurrentAuthor] = useState(author || '');
  const [currentIncludeTests, setCurrentIncludeTests] = useState(includeTests !== undefined ? includeTests : true);
  const [currentIncludeReadme, setCurrentIncludeReadme] = useState(includeReadme !== undefined ? includeReadme : true);
  const [currentIncludeGitignore, setCurrentIncludeGitignore] = useState(includeGitignore !== undefined ? includeGitignore : true);
  const [currentCustomDirectoryTemplate, setCurrentCustomDirectoryTemplate] = useState(customDirectoryTemplate || '');
  const [currentShowDirectoryTemplateInput, setCurrentShowDirectoryTemplateInput] = useState(showDirectoryTemplateInput || false);
  const [currentOutputDirectory, setCurrentOutputDirectory] = useState(outputDirectory || '');
  const [validationResult, setValidationResult] = useState(null);
  const [isValidatingDirectory, setIsValidatingDirectory] = useState(false);
  const [loading, setLoading] = useState(false);

  const javaAppTypes = [
    { id: 'java-core', name: 'Java Core (Basic Java Application)' },
    { id: 'j2ee', name: 'J2EE (Traditional Java EE App)' },
    { id: 'spring-xml', name: 'Java with Spring Framework (XML Configuration)' },
    { id: 'spring-mvc', name: 'Java with Spring MVC (Web Application)' },
    { id: 'spring-boot-maven', name: 'Java with Spring Boot (Maven)' },
    { id: 'spring-boot-gradle', name: 'Java with Spring Boot (Gradle)' },
    { id: 'microservices', name: 'Java Microservices (Spring Boot)' },
    { id: 'hibernate', name: 'Java with Hibernate (Standalone or Spring)' },
    { id: 'desktop-app', name: 'Java Desktop Application (Swing or JavaFX)' },
    { id: 'cli-app', name: 'Java CLI Application (Command Line Interface)' }
  ];

  // Sync with prop changes
  useEffect(() => {
    setCurrentAppType(appType || 'react');
    setCurrentJavaAppType(javaAppType || 'java-core');
    setCurrentAppName(appName || 'atf-app');
    setCurrentDescription(description || 'ATF Dev Studio - Sample Application');
    setCurrentVersion(version || '1.0.0');
    setCurrentAuthor(author || '');
    setCurrentIncludeTests(includeTests !== undefined ? includeTests : true);
    setCurrentIncludeReadme(includeReadme !== undefined ? includeReadme : true);
    setCurrentIncludeGitignore(includeGitignore !== undefined ? includeGitignore : true);
    setCurrentCustomDirectoryTemplate(customDirectoryTemplate || '');
    setCurrentShowDirectoryTemplateInput(showDirectoryTemplateInput || false);
    setCurrentOutputDirectory(outputDirectory || '');
  }, [appType, javaAppType, appName, description, version, author, includeTests, includeReadme, includeGitignore, customDirectoryTemplate, showDirectoryTemplateInput, outputDirectory]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateGenerator(id, {
        appType: currentAppType,
        javaAppType: currentJavaAppType,
        appName: currentAppName,
        description: currentDescription,
        version: currentVersion,
        author: currentAuthor,
        includeTests: currentIncludeTests,
        includeReadme: currentIncludeReadme,
        includeGitignore: currentIncludeGitignore,
        customDirectoryTemplate: currentCustomDirectoryTemplate,
        showDirectoryTemplateInput: currentShowDirectoryTemplateInput,
        outputDirectory: currentOutputDirectory,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentAppType, currentJavaAppType, currentAppName, currentDescription, currentVersion, currentAuthor, currentIncludeTests, currentIncludeReadme, currentIncludeGitignore, currentCustomDirectoryTemplate, currentShowDirectoryTemplateInput, currentOutputDirectory, updateGenerator]);

  // Effect to reset template when app type changes
  useEffect(() => {
    if (currentAppType === 'java') {
      const defaultStructure = getJavaDirectoryStructure(currentJavaAppType, currentAppName);
      setCurrentCustomDirectoryTemplate(defaultStructure);
    } else if (currentAppType === 'react') {
      setCurrentCustomDirectoryTemplate(`${currentAppName}/
├── node_modules/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md`);
    } else if (currentAppType === 'node') {
      setCurrentCustomDirectoryTemplate(`${currentAppName}/
├── node_modules/
├── index.js
├── package.json
├── tests/
│   └── index.test.js
└── README.md`);
    } else if (currentAppType === 'python') {
      const packageName = currentAppName.replace(/-/g, '_').toLowerCase();
      setCurrentCustomDirectoryTemplate(`${currentAppName}/
├── ${packageName}/
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── setup.py
├── pytest.ini
├── requirements.txt
└── README.md`);
    } else {
      setCurrentCustomDirectoryTemplate('');
    }
    
    setValidationResult(null);
    setCurrentShowDirectoryTemplateInput(currentAppType === 'custom');
  }, [currentAppType, currentAppName, currentJavaAppType]);

  // Effect to update Java template when Java app type changes
  useEffect(() => {
    if (currentAppType === 'java') {
      const defaultStructure = getJavaDirectoryStructure(currentJavaAppType, currentAppName);
      setCurrentCustomDirectoryTemplate(defaultStructure);
      setValidationResult(null);
    }
  }, [currentJavaAppType, currentAppName, currentAppType]);

  // Effect to validate custom directory structure when it changes
  useEffect(() => {
    if (currentShowDirectoryTemplateInput && currentCustomDirectoryTemplate.trim()) {
      setIsValidatingDirectory(true);
      
      try {
        const validationResult = validateDirectoryStructure(currentAppType, currentJavaAppType, currentCustomDirectoryTemplate);
        setValidationResult(validationResult);
      } catch (error) {
        console.error('Error validating directory structure:', error);
        setValidationResult({
          valid: false,
          message: `Error validating ${currentAppType} directory structure: ${error.message}`,
          hasWarnings: false
        });
      }
      
      setIsValidatingDirectory(false);
    } else {
      setValidationResult(null);
    }
  }, [currentAppType, currentCustomDirectoryTemplate, currentJavaAppType, currentShowDirectoryTemplateInput]);

  // Generate zip file
  const handleGenerateZipFile = useCallback(async () => {
    try {
      setLoading(true);
      
      if (typeof JSZip === 'undefined') {
        setStatusMessage?.('JSZip library not available. Please install jszip.');
        setLoading(false);
        return;
      }
      
      const zip = new JSZip();
      
      const options = { 
        appName: currentAppName, 
        description: currentDescription, 
        version: currentVersion, 
        author: currentAuthor, 
        includeTests: currentIncludeTests, 
        includeReadme: currentIncludeReadme, 
        includeGitignore: currentIncludeGitignore
      };
      
      if (currentShowDirectoryTemplateInput && currentCustomDirectoryTemplate.trim() && (!validationResult || validationResult.valid)) {
        options.customDirectoryTemplate = currentCustomDirectoryTemplate;
      }
      
      if (currentAppType === 'react') {
        generateReactApp(zip, options);
      } else if (currentAppType === 'node') {
        generateNodeApp(zip, options);
      } else if (currentAppType === 'java') {
        generateJavaApp(zip, currentJavaAppType, options);
      } else if (currentAppType === 'python') {
        generatePythonApp(zip, options);
      } else if (currentAppType === 'custom' && currentCustomDirectoryTemplate) {
        generateCustomApp(zip, currentCustomDirectoryTemplate, { appName: currentAppName, description: currentDescription, version: currentVersion, author: currentAuthor });
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentOutputDirectory || currentAppName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatusMessage?.(`${currentAppType.toUpperCase()} app "${currentAppName}" generated successfully`);
    } catch (error) {
      console.error('Error generating zip file:', error);
      setStatusMessage?.(`Generation Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentAppType, currentAppName, currentDescription, currentVersion, currentAuthor, currentIncludeTests, currentIncludeReadme, currentIncludeGitignore, currentJavaAppType, currentShowDirectoryTemplateInput, currentCustomDirectoryTemplate, validationResult, currentOutputDirectory, setStatusMessage]);

  // Toggle custom directory template input
  const toggleCustomDirectoryTemplate = useCallback(() => {
    const newState = !currentShowDirectoryTemplateInput;
    setCurrentShowDirectoryTemplateInput(newState);
    
    if (newState) {
      if (currentAppType === 'java') {
        setCurrentCustomDirectoryTemplate(getJavaDirectoryStructure(currentJavaAppType, currentAppName));
      } else if (currentAppType === 'react') {
        setCurrentCustomDirectoryTemplate(`${currentAppName}/
├── node_modules/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md`);
      } else if (currentAppType === 'node') {
        setCurrentCustomDirectoryTemplate(`${currentAppName}/
├── node_modules/
├── index.js
├── package.json
├── tests/
│   └── index.test.js
└── README.md`);
      } else if (currentAppType === 'python') {
        const packageName = currentAppName.replace(/-/g, '_').toLowerCase();
        setCurrentCustomDirectoryTemplate(`${currentAppName}/
├── ${packageName}/
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── setup.py
├── pytest.ini
├── requirements.txt
└── README.md`);
      }
    } else {
      setValidationResult(null);
    }
  }, [currentShowDirectoryTemplateInput, currentAppType, currentJavaAppType, currentAppName]);

  // Check if generate button should be disabled
  const isGenerateButtonDisabled = () => {
    if (loading) return true;
    if (currentShowDirectoryTemplateInput && validationResult && !validationResult.valid) return true;
    if (currentAppType === 'custom' && !currentCustomDirectoryTemplate.trim()) return true;
    return false;
  };

  return (
    <div className={`app-generator-tab-content ${generatorStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="app-generator-options-section">
        <div className="options-row">
          <div className="option-group">
            <label htmlFor={`app-type-${id}`} className="required">Application Type</label>
            <select
              id={`app-type-${id}`}
              value={currentAppType}
              onChange={(e) => {
                setCurrentAppType(e.target.value);
                setCurrentShowDirectoryTemplateInput(e.target.value === 'custom');
              }}
              className="app-type-select"
            >
              <option value="react">React Application</option>
              <option value="node">Node.js Express Application</option>
              <option value="java">Java Application</option>
              <option value="python">Python Application</option>
              <option value="custom">Custom Directory Structure</option>
            </select>
          </div>

          {currentAppType === 'java' && (
            <div className="option-group">
              <label htmlFor={`java-app-type-${id}`}>Java Application Type</label>
              <select
                id={`java-app-type-${id}`}
                value={currentJavaAppType}
                onChange={(e) => setCurrentJavaAppType(e.target.value)}
                className="java-app-type-select"
              >
                {javaAppTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="option-group">
            <label htmlFor={`app-name-${id}`} className="required">Application Name</label>
            <input
              id={`app-name-${id}`}
              type="text"
              value={currentAppName}
              onChange={(e) => setCurrentAppName(e.target.value)}
              placeholder="app-name"
              className="app-name-input"
            />
            <span className="helper-text">Use lowercase letters, numbers, and hyphens only.</span>
          </div>

          <div className="option-group">
            <label htmlFor={`description-${id}`}>Description</label>
            <input
              id={`description-${id}`}
              type="text"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              placeholder="Application description"
              className="description-input"
            />
          </div>

          <div className="option-group">
            <label htmlFor={`version-${id}`}>Version</label>
            <input
              id={`version-${id}`}
              type="text"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
              placeholder="1.0.0"
              className="version-input"
            />
          </div>

          <div className="option-group">
            <label htmlFor={`author-${id}`}>Author</label>
            <input
              id={`author-${id}`}
              type="text"
              value={currentAuthor}
              onChange={(e) => setCurrentAuthor(e.target.value)}
              placeholder="Your Name"
              className="author-input"
            />
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="options-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id={`include-tests-${id}`}
              checked={currentIncludeTests}
              onChange={(e) => setCurrentIncludeTests(e.target.checked)}
            />
            <label htmlFor={`include-tests-${id}`}>Include Tests</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id={`include-readme-${id}`}
              checked={currentIncludeReadme}
              onChange={(e) => setCurrentIncludeReadme(e.target.checked)}
            />
            <label htmlFor={`include-readme-${id}`}>Include README</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id={`include-gitignore-${id}`}
              checked={currentIncludeGitignore}
              onChange={(e) => setCurrentIncludeGitignore(e.target.checked)}
            />
            <label htmlFor={`include-gitignore-${id}`}>Include .gitignore</label>
          </div>
        </div>

        {/* Directory Structure Section */}
        {(currentAppType === 'java' || currentAppType === 'react' || currentAppType === 'node' || currentAppType === 'python' || currentAppType === 'custom') && (
          <div className="directory-structure-section">
            <div className="directory-structure-header">
              <h3>Directory Structure</h3>
              {(currentAppType !== 'custom') && (
                <button
                  className="secondary-button"
                  onClick={toggleCustomDirectoryTemplate}
                  title={currentShowDirectoryTemplateInput ? "Switch back to standard directory structure" : "Customize the directory structure"}
                >
                  {currentShowDirectoryTemplateInput ? "Use Standard Structure" : "Customize Directory Structure"}
                </button>
              )}
            </div>

            {currentShowDirectoryTemplateInput || currentAppType === 'custom' ? (
              <div className="custom-directory-input">
                <textarea
                  value={currentCustomDirectoryTemplate}
                  onChange={(e) => setCurrentCustomDirectoryTemplate(e.target.value)}
                  placeholder="Enter directory structure..."
                  rows={12}
                  className="directory-template-textarea"
                />
                {isValidatingDirectory && <p>Validating directory structure...</p>}
                {validationResult && (
                  <div className={`validation-results ${validationResult.valid ? 'valid' : 'invalid'}`}>
                    <h4>{validationResult.valid ? 'Valid Structure' : 'Invalid Structure'}</h4>
                    <p>{validationResult.message}</p>
                    {validationResult.hasWarnings && validationResult.warnings && (
                      <div className="validation-warnings">
                        <p><strong>Warnings:</strong> {validationResult.warnings}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="directory-structure-example">
                <pre className="directory-structure-code">
                  {currentAppType === 'java' 
                    ? getJavaDirectoryStructure(currentJavaAppType, currentAppName)
                    : currentAppType === 'react'
                      ? `${currentAppName}/
├── node_modules/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md`
                      : currentAppType === 'node'
                        ? `${currentAppName}/
├── node_modules/
├── index.js
├── package.json
├── tests/
│   └── index.test.js
└── README.md`
                        : `${currentAppName}/
├── ${currentAppName.replace(/-/g, '_').toLowerCase()}/
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── setup.py
├── pytest.ini
├── requirements.txt
└── README.md`
                  }
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="app-generator-actions-section">
        <button
          className="action-button generate-button"
          onClick={handleGenerateZipFile}
          disabled={isGenerateButtonDisabled()}
        >
          {loading ? (
            <>
              <span className="loading-indicator"></span>
              Generating...
            </>
          ) : (
            'Generate Application'
          )}
        </button>
      </div>

      {/* JSZip Warning */}
      {typeof JSZip === 'undefined' && (
        <div className="jszip-warning">
          <h3>JSZip Library Required</h3>
          <p>To use the App Generator feature, you need to install the JSZip library:</p>
          <div className="code-block">
            <code>npm install jszip</code>
          </div>
          <p>After installation, restart the application and try again.</p>
        </div>
      )}
    </div>
  );
};

export default AppGeneratorTab;

