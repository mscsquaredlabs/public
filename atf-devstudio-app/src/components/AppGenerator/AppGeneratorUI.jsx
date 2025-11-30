import React from 'react';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

/**
 * Main form for the App Generator
 */
export const AppGeneratorForm = ({
  appType,
  setAppType,
  javaAppType,
  setJavaAppType,
  appName,
  setAppName,
  javaAppTypes,
  customDirectoryTemplate,
  setCustomDirectoryTemplate,
  setShowDirectoryTemplateInput,
  generateZipFile,
  getJavaAppTypeDescription,
  renderJavaDirectoryExample,
  showDirectoryTemplateInput,
  toggleCustomDirectoryTemplate,
  validationResult,
  renderValidationResults,
  isValidatingDirectory,
  isGenerateButtonDisabled,
  loading
}) => {
  return (
    <div className="app-generator-form">
      <div className="form-group">
        <label htmlFor="app-type">Application Type</label>
        <select 
          id="app-type"
          value={appType}
          onChange={(e) => {
            setAppType(e.target.value);
            setShowDirectoryTemplateInput(e.target.value === 'custom');
          }}
          className="app-type-select"
          title="Select the type of application to generate"
        >
          <option value="react">React Application</option>
          <option value="node">Node.js Express Application</option>
          <option value="java">Java Application</option>
          <option value="python">Python Application</option>
          <option value="custom">Custom Directory Structure</option>
        </select>
      </div>
      
      {appType === 'java' && (
        <div className="form-group">
          <label htmlFor="java-app-type">Java Application Type</label>
          <select 
            id="java-app-type"
            value={javaAppType}
            onChange={(e) => setJavaAppType(e.target.value)}
            className="java-app-type-select"
            title="Select the type of Java application framework or structure"
          >
            {javaAppTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="app-name">Application Name</label>
        <input 
          id="app-name"
          type="text" 
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="app-name"
          className="app-name-input"
          title="Enter the name for your application (use lowercase with hyphens)"
        />
        <p className="hint-text">Use lowercase letters, numbers, and hyphens only.</p>
      </div>
      
      <div className="info-panel">
        {appType === 'java' ? (
          <>
            <h3>About {javaAppTypes.find(t => t.id === javaAppType)?.name || 'Java'} Directory Structure</h3>
            <p>{getJavaAppTypeDescription(javaAppType)}</p>
            {renderJavaDirectoryExample()}
          </>
        ) : appType === 'react' ? (
          <>
            <h3>About React Applications</h3>
            <p>Creates a React single-page application with a basic component structure. Includes React DOM, React Scripts, and basic styling.</p>
            
            <div className="directory-structure-example">
              <h3>Standard Directory Structure</h3>
              <pre className="directory-structure-code">
{`${appName}/
├── node_modules/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md`}
              </pre>
              
              {/* Custom directory input toggle */}
              <div className="custom-directory-toggle">
                <button 
                  onClick={toggleCustomDirectoryTemplate}
                  className="secondary-button"
                  title={showDirectoryTemplateInput ? "Switch back to standard directory structure" : "Customize the directory structure for your application"}
                >
                  {showDirectoryTemplateInput ? "Use Standard Structure" : "Customize Directory Structure"}
                </button>
              </div>
              
              {/* Custom directory input */}
              {showDirectoryTemplateInput && (
                <div className="custom-directory-input">
                  <p className="hint-text">
                    Customize the directory structure below. The structure must include all required files and directories for a React application.
                    <br />
                    <strong>Required elements:</strong> package.json, src/ directory, public/ directory.
                  </p>
                  <textarea 
                    value={customDirectoryTemplate}
                    onChange={(e) => setCustomDirectoryTemplate(e.target.value)}
                    placeholder={`${appName}/\n├── node_modules/\n├── public/\n│   └── index.html\n├── src/\n│   ├── App.js\n│   ├── App.css\n│   ├── index.js\n│   └── index.css\n├── package.json\n└── README.md`}
                    rows={15}
                    className="directory-template-textarea"
                    title="Edit your custom directory structure"
                  ></textarea>
                  
                  {/* Validation results */}
                  {isValidatingDirectory && <p>Validating directory structure...</p>}
                  {renderValidationResults && renderValidationResults()}
                </div>
              )}
            </div>
          </>
        ) : appType === 'node' ? (
          <>
            <h3>About Node.js Express Applications</h3>
            <p>Creates a Node.js Express application with a basic server setup. Includes Express and a simple route configuration.</p>
            
            <div className="directory-structure-example">
              <h3>Standard Directory Structure</h3>
              <pre className="directory-structure-code">
{`${appName}/
├── node_modules/
├── index.js
├── package.json
├── tests/
│   └── index.test.js
└── README.md`}
              </pre>
              
              {/* Custom directory input toggle */}
              <div className="custom-directory-toggle">
                <button 
                  onClick={toggleCustomDirectoryTemplate}
                  className="secondary-button"
                  title={showDirectoryTemplateInput ? "Switch back to standard directory structure" : "Customize the directory structure for your application"}
                >
                  {showDirectoryTemplateInput ? "Use Standard Structure" : "Customize Directory Structure"}
                </button>
              </div>
              
              {/* Custom directory input */}
              {showDirectoryTemplateInput && (
                <div className="custom-directory-input">
                  <p className="hint-text">
                    Customize the directory structure below. The structure must include all required files and directories for a Node.js application.
                    <br />
                    <strong>Required elements:</strong> package.json, index.js
                  </p>
                  <textarea 
                    value={customDirectoryTemplate}
                    onChange={(e) => setCustomDirectoryTemplate(e.target.value)}
                    placeholder={`${appName}/\n├── node_modules/\n├── index.js\n├── package.json\n├── tests/\n│   └── index.test.js\n└── README.md`}
                    rows={15}
                    className="directory-template-textarea"
                    title="Edit your custom directory structure"
                  ></textarea>
                  
                  {/* Validation results */}
                  {isValidatingDirectory && <p>Validating directory structure...</p>}
                  {renderValidationResults && renderValidationResults()}
                </div>
              )}
            </div>
          </>
        ) : appType === 'python' ? (
          <>
            <h3>About Python Applications</h3>
            <p>Creates a Python application with package structure. Includes setup.py for installation and a main module.</p>
            
            <div className="directory-structure-example">
              <h3>Standard Directory Structure</h3>
              <pre className="directory-structure-code">
{`${appName}/
├── ${appName.replace(/-/g, '_').toLowerCase()}/
│   ├── __init__.py
│   └── main.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── setup.py
├── pytest.ini
├── requirements.txt
└── README.md`}
              </pre>
              
              {/* Custom directory input toggle */}
              <div className="custom-directory-toggle">
                <button 
                  onClick={toggleCustomDirectoryTemplate}
                  className="secondary-button"
                  title={showDirectoryTemplateInput ? "Switch back to standard directory structure" : "Customize the directory structure for your application"}
                >
                  {showDirectoryTemplateInput ? "Use Standard Structure" : "Customize Directory Structure"}
                </button>
              </div>
              
              {/* Custom directory input */}
              {showDirectoryTemplateInput && (
                <div className="custom-directory-input">
                  <p className="hint-text">
                    Customize the directory structure below. The structure must include all required files and directories for a Python application.
                    <br />
                    <strong>Required elements:</strong> package directory, setup.py
                  </p>
                  <textarea 
                    value={customDirectoryTemplate}
                    onChange={(e) => setCustomDirectoryTemplate(e.target.value)}
                    placeholder={`${appName}/\n├── ${appName.replace(/-/g, '_').toLowerCase()}/\n│   ├── __init__.py\n│   └── main.py\n├── tests/\n│   ├── __init__.py\n│   └── test_main.py\n├── setup.py\n├── pytest.ini\n├── requirements.txt\n└── README.md`}
                    rows={15}
                    className="directory-template-textarea"
                    title="Edit your custom directory structure"
                  ></textarea>
                  
                  {/* Validation results */}
                  {isValidatingDirectory && <p>Validating directory structure...</p>}
                  {renderValidationResults && renderValidationResults()}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h3>About Custom Directory Structure</h3>
            <p>Create your own custom directory structure by providing a template in the format shown below:</p>
            <pre className="directory-example-format">
{`myapp/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   └── resources/
├── README.md
└── pom.xml`}
            </pre>
            <textarea 
              value={customDirectoryTemplate}
              onChange={(e) => setCustomDirectoryTemplate(e.target.value)}
              placeholder="Paste your directory structure here in the format shown above"
              rows={12}
              className="directory-template-textarea"
              title="Enter your custom directory structure"
            ></textarea>
            
            {/* Validation results for custom directory structure */}
            {renderValidationResults && renderValidationResults()}
          </>
        )}
      </div>
      
      <button 
        onClick={generateZipFile}
        className="generate-button btn-primary"
        disabled={isGenerateButtonDisabled() || loading}
        title={isGenerateButtonDisabled() ? "Please fix any validation issues before generating" : "Generate and download your application as a ZIP file"}
      >
        {loading ? "Generating..." : "Generate Application"}
      </button>
    </div>
  );
};

/**
 * Configuration Panel for the App Generator
 */
export const ConfigPanel = ({
  configMode,
  setConfigMode,
  appType,
  javaAppType,
  setJavaAppType,
  appName,
  setAppName,
  description,
  setDescription,
  version,
  setVersion,
  author,
  setAuthor,
  includeTests,
  setIncludeTests,
  includeReadme,
  setIncludeReadme,
  includeGitignore,
  setIncludeGitignore,
  outputDirectory,
  setOutputDirectory,
  customDirectoryTemplate,
  setCustomDirectoryTemplate,
  showDirectoryTemplateInput,
  javaAppTypes
}) => {
  return (
    <div className="app-generator-config-scrollable"> 
      <h3 className="config-section-title">Application Settings</h3>

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
      
      <div className="form-group">
        <label>App Type</label>
        <select 
          value={appType}
          onChange={(e) => {}} // Disabled in config panel
          disabled
          title="Change app type in the main panel"
        >
          <option value="react">React Application</option>
          <option value="node">Node.js Express Application</option>
          <option value="java">Java Application</option>
          <option value="python">Python Application</option>
          <option value="custom">Custom Directory Structure</option>
        </select>
      </div>
      
      {appType === 'java' && (
        <div className="form-group">
          <label>Java Application Type</label>
          <select 
            value={javaAppType}
            onChange={(e) => setJavaAppType(e.target.value)}
            title="Select the specific Java framework or application structure"
          >
            {javaAppTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      )}
      
      <div className="form-group">
        <label>App Name</label>
        <input 
          type="text" 
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="app-name"
          title="Enter the name for your application (use lowercase with hyphens)"
        />
        <p className="hint-text">Use lowercase letters, numbers, and hyphens only.</p>
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Application description"
          title="Enter a brief description of your application"
        />
      </div>
      
      <div className="form-group">
        <label>Version</label>
        <input 
          type="text" 
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0.0"
          title="Enter the version number (semver format recommended)"
        />
      </div>
      
      <div className="form-group">
        <label>Author</label>
        <input 
          type="text" 
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your Name"
          title="Enter the author name"
        />
      </div>
      
      <div className="form-group">
        <label>Output Directory (Optional)</label>
        <input 
          type="text" 
          value={outputDirectory}
          onChange={(e) => setOutputDirectory(e.target.value)}
          placeholder="Leave blank to use app name as directory"
          title="Specify a custom output directory name (optional)"
        />
      </div>
      
      <div className="form-group">
        <label>Include</label>
        <div className="checkbox-group">
          <input 
            id="include-tests" 
            type="checkbox" 
            checked={includeTests}
            onChange={(e) => setIncludeTests(e.target.checked)}
            title="Include test files and configuration"
          />
          <label htmlFor="include-tests">Tests</label>
        </div>
        <div className="checkbox-group">
          <input 
            id="include-readme" 
            type="checkbox" 
            checked={includeReadme}
            onChange={(e) => setIncludeReadme(e.target.checked)}
            title="Include a README.md file"
          />
          <label htmlFor="include-readme">README</label>
        </div>
        <div className="checkbox-group">
          <input 
            id="include-gitignore" 
            type="checkbox" 
            checked={includeGitignore}
            onChange={(e) => setIncludeGitignore(e.target.checked)}
            title="Include a .gitignore file"
          />
          <label htmlFor="include-gitignore">.gitignore</label>
        </div>
      </div>
    </div>
  );
};