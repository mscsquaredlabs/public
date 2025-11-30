// ApiTesterTab.jsx
// Tab content for API testing

import { useState, useRef, useEffect, useCallback } from 'react';
import PostmanImportButton from './PostmanImportButton';
import { validateRequest } from '../../shared/utils/validators';
import { copyToClipboard } from '../../shared/utils/helpers';
import { processRequestWithEnvironment, processEnvironmentVariables, processJsonEnvironmentVariables, parseHeaders, createCurlCommand, formatResponse, escapeHtml } from './apiUtils-helpers';
import { EnvironmentManager, createDefaultEnvironmentManager } from './environmentManager';
import { ResponseHistoryManager, createDefaultResponseHistoryManager } from './responseHistoryManager';
import { ProjectManager, createDefaultProjectManager } from './projectManager';

const ApiTesterTab = ({
  tester,
  updateTester,
  deleteTester,
  setStatusMessage,
  darkMode,
  testerStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    url,
    method,
    headers,
    body,
    bodyFormat,
    authType,
    authDetails,
    activeTab,
    configMode,
  } = tester;

  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [currentMethod, setCurrentMethod] = useState(method || 'GET');
  const [currentHeaders, setCurrentHeaders] = useState(headers || '{\n  "Content-Type": "application/json"\n}');
  const [currentBody, setCurrentBody] = useState(body || '');
  const [currentBodyFormat, setCurrentBodyFormat] = useState(bodyFormat || 'json');
  const [currentAuthType, setCurrentAuthType] = useState(authType || 'none');
  const [currentAuthDetails, setCurrentAuthDetails] = useState(authDetails || {
    username: '',
    password: '',
    token: '',
    apiKey: '',
    apiKeyName: 'X-API-Key'
  });
  const [currentActiveTab, setCurrentActiveTab] = useState(activeTab || 'headers');
  const [currentConfigMode, setCurrentConfigMode] = useState(configMode || 'simple');
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState({ valid: true, message: '' });

  const textareaRef = useRef(null);

  // Advanced feature managers (shared per tab)
  const [environmentManager, setEnvironmentManager] = useState(null);
  const [responseHistoryManager, setResponseHistoryManager] = useState(null);
  const [projectManager, setProjectManager] = useState(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [currentRequestId] = useState(`request_${id}_${Date.now()}`);

  // Initialize advanced features managers
  useEffect(() => {
    const envManager = createDefaultEnvironmentManager();
    envManager.loadFromLocalStorage();
    setEnvironmentManager(envManager);

    const historyManager = createDefaultResponseHistoryManager();
    historyManager.loadFromLocalStorage();
    setResponseHistoryManager(historyManager);

    const projManager = createDefaultProjectManager();
    projManager.loadFromLocalStorage();
    setProjectManager(projManager);
  }, []);

  // Toggle advanced mode
  useEffect(() => {
    setAdvancedMode(currentConfigMode === 'advanced');
  }, [currentConfigMode]);

  // Sync with prop changes
  useEffect(() => {
    setCurrentUrl(url || '');
    setCurrentMethod(method || 'GET');
    setCurrentHeaders(headers || '{\n  "Content-Type": "application/json"\n}');
    setCurrentBody(body || '');
    setCurrentBodyFormat(bodyFormat || 'json');
    setCurrentAuthType(authType || 'none');
    setCurrentAuthDetails(authDetails || {
      username: '',
      password: '',
      token: '',
      apiKey: '',
      apiKeyName: 'X-API-Key'
    });
    setCurrentActiveTab(activeTab || 'headers');
    setCurrentConfigMode(configMode || 'simple');
  }, [url, method, headers, body, bodyFormat, authType, authDetails, activeTab, configMode]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateTester(id, {
        url: currentUrl,
        method: currentMethod,
        headers: currentHeaders,
        body: currentBody,
        bodyFormat: currentBodyFormat,
        authType: currentAuthType,
        authDetails: currentAuthDetails,
        activeTab: currentActiveTab,
        configMode: currentConfigMode,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentUrl, currentMethod, currentHeaders, currentBody, currentBodyFormat, currentAuthType, currentAuthDetails, currentActiveTab, currentConfigMode, updateTester]);

  // Handle sending the request
  const sendRequest = useCallback(async () => {
    setResponse(null);
    setError(null);
    setLoading(true);

    if (!currentUrl.trim()) {
      setError('Please enter a URL for the request');
      setStatusMessage?.('Please enter a URL for the request');
      setLoading(false);
      return;
    }

    try {
      let requestConfig = {
        url: currentUrl,
        method: currentMethod,
        headers: currentHeaders,
        body: currentBody,
        bodyFormat: currentBodyFormat,
        authType: currentAuthType,
        authDetails: currentAuthDetails,
        id: currentRequestId
      };
      
      if (advancedMode && environmentManager) {
        requestConfig = processRequestWithEnvironment(
          requestConfig, 
          environmentManager.getActiveEnvironment()
        );
      }

      const validationResult = validateRequest(
        requestConfig.url, 
        requestConfig.method, 
        requestConfig.headers, 
        requestConfig.body, 
        requestConfig.bodyFormat
      );
      
      setValidation(validationResult);

      if (!validationResult.valid) {
        setError(`Invalid request: ${validationResult.message}`);
        setStatusMessage?.(`Invalid request: ${validationResult.message}`);
        setLoading(false);
        return;
      }

      const requestOptions = {
        method: requestConfig.method,
        headers: parseHeaders(requestConfig.headers, requestConfig.authType, requestConfig.authDetails),
      };

      if (requestConfig.method !== 'GET' && requestConfig.method !== 'HEAD' && requestConfig.body.trim()) {
        try {
          if (requestConfig.bodyFormat === 'json') {
            requestOptions.body = JSON.stringify(JSON.parse(requestConfig.body));
          } else if (requestConfig.bodyFormat === 'form') {
            const formData = new FormData();
            const formValues = requestConfig.body.split('\n');
            formValues.forEach(line => {
              const [key, value] = line.split(':').map(item => item.trim());
              if (key && value) {
                formData.append(key, value);
              }
            });
            requestOptions.body = formData;
            delete requestOptions.headers['Content-Type'];
          } else {
            requestOptions.body = requestConfig.body;
          }
        } catch (e) {
          setError(`Invalid body format: ${e.message}`);
          setStatusMessage?.(`Invalid body format: ${e.message}`);
          setLoading(false);
          return;
        }
      }

      const startTime = new Date();
      
      try {
        const response = await fetch(requestConfig.url, requestOptions);
        const responseTime = new Date() - startTime;
        
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        
        let responseBody;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          try {
            responseBody = await response.json();
          } catch (e) {
            responseBody = await response.text();
          }
        } else if (contentType.includes('text/')) {
          responseBody = await response.text();
        } else {
          responseBody = `[Binary ${contentType} data]`;
        }
        
        const apiResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
          responseTime
        };
        
        setResponse(apiResponse);
        
        if (advancedMode && responseHistoryManager) {
          responseHistoryManager.addResponse(currentRequestId, apiResponse);
        }
        
        const formattedResponse = formatResponse(apiResponse);
        
        setStatusMessage?.(`${requestConfig.method} ${requestConfig.url} - ${apiResponse.status} ${apiResponse.statusText}`);
        
        // Update results via status message with formatted response
        setStatusMessage?.(`RESPONSE:${JSON.stringify({
          status: apiResponse.status >= 200 && apiResponse.status < 300 ? 'success' : 'error',
          message: `${requestConfig.method} ${requestConfig.url} - ${apiResponse.status} ${apiResponse.statusText}`,
          content: formattedResponse
        })}`);
      } catch (fetchError) {
        setError(`Request failed: ${fetchError.message}`);
        setStatusMessage?.(`Request failed: ${fetchError.message}`);
      }
      
      setLoading(false);
    } catch (err) {
      setError(`Error preparing request: ${err.message}`);
      setStatusMessage?.(`Error preparing request: ${err.message}`);
      setLoading(false);
    }
  }, [currentUrl, currentMethod, currentHeaders, currentBody, currentBodyFormat, currentAuthType, currentAuthDetails, currentRequestId, advancedMode, environmentManager, responseHistoryManager, setStatusMessage]);

  // Generate and copy cURL command
  const generateCurl = useCallback(() => {
    try {
      let processedUrl = currentUrl;
      let processedHeaders = currentHeaders;
      let processedBody = currentBody;
      
      if (advancedMode && environmentManager) {
        const env = environmentManager.getActiveEnvironment();
        processedUrl = processEnvironmentVariables(processedUrl, env);
        
        try {
          if (typeof processedHeaders === 'string') {
            processedHeaders = processJsonEnvironmentVariables(processedHeaders, env);
          }
        } catch (e) {
          console.error('Error processing headers with environment variables:', e);
        }
        
        if (processedBody && currentBodyFormat === 'json') {
          processedBody = processJsonEnvironmentVariables(processedBody, env);
        } else if (processedBody) {
          processedBody = processEnvironmentVariables(processedBody, env);
        }
      }
      
      const curlCommand = createCurlCommand(
        processedUrl, 
        currentMethod, 
        parseHeaders(processedHeaders, currentAuthType, currentAuthDetails), 
        processedBody, 
        currentBodyFormat
      );
      
      copyToClipboard(curlCommand)
        .then(() => {
          setStatusMessage?.('cURL command copied to clipboard');
        })
        .catch(() => {
          setStatusMessage?.('Failed to copy to clipboard');
        });
    } catch (err) {
      setStatusMessage?.(`Failed to generate cURL command: ${err.message}`);
    }
  }, [currentUrl, currentMethod, currentHeaders, currentBody, currentBodyFormat, currentAuthType, currentAuthDetails, advancedMode, environmentManager, setStatusMessage]);

  // Clear form
  const clearForm = useCallback(() => {
    setCurrentUrl('');
    setCurrentHeaders('{\n  "Content-Type": "application/json"\n}');
    setCurrentBody('');
    setCurrentAuthType('none');
    setCurrentAuthDetails({
      username: '',
      password: '',
      token: '',
      apiKey: '',
      apiKeyName: 'X-API-Key'
    });
    setResponse(null);
    setError(null);
    setStatusMessage?.('Form cleared');
  }, [setStatusMessage]);

  // Handle Postman import completion
  const handlePostmanImportComplete = useCallback((result) => {
    if (result.success) {
      setStatusMessage?.(`Imported Postman collection: ${result.name} (${result.requestCount} requests)`);
    }
  }, [setStatusMessage]);

  return (
    <div className={`api-tester-tab-content ${testerStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="api-tester-options-section">
        <div className="options-row">
          <div className="option-group">
            <label>Configuration Mode</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`config-mode-${id}`}
                  value="simple"
                  checked={currentConfigMode === 'simple'}
                  onChange={() => setCurrentConfigMode('simple')}
                />
                <span>Simple</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`config-mode-${id}`}
                  value="advanced"
                  checked={currentConfigMode === 'advanced'}
                  onChange={() => setCurrentConfigMode('advanced')}
                />
                <span>Advanced</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* URL and Method Section */}
      <div className="api-tester-url-section">
        <div className="url-row">
          <select 
            value={currentMethod}
            onChange={(e) => setCurrentMethod(e.target.value)}
            className="method-select"
            title="Select HTTP method"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
          
          <input 
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="url-input"
            title="Enter request URL"
          />
        </div>

        {currentConfigMode === 'advanced' && (
          <div className="advanced-actions">
            <button 
              className="secondary-button"
              onClick={generateCurl}
              disabled={!currentUrl.trim()}
              title="Generate and copy cURL command"
            >
              📋 Copy as cURL
            </button>
            
            <button 
              className="secondary-button"
              onClick={clearForm}
              title="Clear all input fields"
            >
              🗑️ Clear Form
            </button>
            
            <PostmanImportButton 
              projectManager={projectManager}
              onImportComplete={handlePostmanImportComplete}
            />
          </div>
        )}
      </div>

      {/* Request Tabs */}
      <div className="request-tabs">
        <button 
          className={`tab-button ${currentActiveTab === 'headers' ? 'active' : ''}`} 
          onClick={() => setCurrentActiveTab('headers')}
          title="Edit request headers"
        >
          Headers
        </button>
        <button 
          className={`tab-button ${currentActiveTab === 'body' ? 'active' : ''}`} 
          onClick={() => setCurrentActiveTab('body')}
          title="Edit request body"
        >
          Body
        </button>
        <button 
          className={`tab-button ${currentActiveTab === 'auth' ? 'active' : ''}`} 
          onClick={() => setCurrentActiveTab('auth')}
          title="Configure authentication"
        >
          Auth
        </button>
      </div>
      
      {/* Request Content */}
      <div className="request-content">
        {currentActiveTab === 'headers' && (
          <div className="headers-tab">
            <textarea
              ref={textareaRef}
              value={currentHeaders}
              onChange={(e) => setCurrentHeaders(e.target.value)}
              placeholder='{\n  "Content-Type": "application/json",\n  "Accept": "application/json"\n}'
              className="headers-textarea"
              title="Enter request headers as JSON object"
              rows={8}
            />
          </div>
        )}
        
        {currentActiveTab === 'body' && (
          <div className="body-tab">
            <div className="body-format">
              <label>Format:</label>
              <select 
                value={currentBodyFormat}
                onChange={(e) => setCurrentBodyFormat(e.target.value)}
                className="body-format-select"
                title="Select body format"
              >
                <option value="json">JSON</option>
                <option value="form">Form Data</option>
                <option value="text">Plain Text</option>
              </select>
            </div>
            
            <textarea
              value={currentBody}
              onChange={(e) => setCurrentBody(e.target.value)}
              placeholder={currentBodyFormat === 'json' 
                ? '{\n  "key": "value"\n}' 
                : currentBodyFormat === 'form' 
                  ? 'key1: value1\nkey2: value2' 
                  : 'Plain text body'}
              className="body-textarea"
              title="Enter request body"
              rows={10}
            />
          </div>
        )}
        
        {currentActiveTab === 'auth' && (
          <div className="auth-tab">
            <div className="auth-type">
              <label>Type:</label>
              <select 
                value={currentAuthType}
                onChange={(e) => setCurrentAuthType(e.target.value)}
                className="auth-type-select"
                title="Select authentication type"
              >
                <option value="none">None</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="apiKey">API Key</option>
              </select>
            </div>
            
            {currentAuthType === 'basic' && (
              <>
                <div className="auth-field">
                  <label>Username:</label>
                  <input 
                    type="text" 
                    value={currentAuthDetails.username}
                    onChange={(e) => setCurrentAuthDetails({...currentAuthDetails, username: e.target.value})}
                    placeholder="Username"
                    title="Enter basic auth username"
                  />
                </div>
                <div className="auth-field">
                  <label>Password:</label>
                  <input 
                    type="password" 
                    value={currentAuthDetails.password}
                    onChange={(e) => setCurrentAuthDetails({...currentAuthDetails, password: e.target.value})}
                    placeholder="Password"
                    title="Enter basic auth password"
                  />
                </div>
              </>
            )}
            
            {currentAuthType === 'bearer' && (
              <div className="auth-field">
                <label>Token:</label>
                <input 
                  type="text" 
                  value={currentAuthDetails.token}
                  onChange={(e) => setCurrentAuthDetails({...currentAuthDetails, token: e.target.value})}
                  placeholder="Bearer token"
                  title="Enter bearer token"
                />
              </div>
            )}
            
            {currentAuthType === 'apiKey' && (
              <>
                <div className="auth-field">
                  <label>Key Name:</label>
                  <input 
                    type="text" 
                    value={currentAuthDetails.apiKeyName}
                    onChange={(e) => setCurrentAuthDetails({...currentAuthDetails, apiKeyName: e.target.value})}
                    placeholder="Header name (e.g. X-API-Key)"
                    title="Enter API key header name"
                  />
                </div>
                <div className="auth-field">
                  <label>Key Value:</label>
                  <input 
                    type="text" 
                    value={currentAuthDetails.apiKey}
                    onChange={(e) => setCurrentAuthDetails({...currentAuthDetails, apiKey: e.target.value})}
                    placeholder="API key value"
                    title="Enter API key value"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Validation Error */}
      {!validation.valid && (
        <div className="validation-error">
          <p>{validation.message}</p>
        </div>
      )}

      {/* Actions Section */}
      <div className="api-tester-actions-section">
        <button 
          onClick={sendRequest}
          className="action-button test-endpoint-button"
          disabled={loading || !currentUrl.trim()}
          title={!currentUrl.trim() ? "Please enter a URL first" : "Send request"}
        >
          {loading ? (
            <>
              <span className="loading-indicator"></span>
              Sending...
            </>
          ) : (
            '🚀 Test Endpoint'
          )}
        </button>
      </div>

      {/* Advanced Mode Indicator */}
      {currentConfigMode === 'advanced' && (
        <div className="advanced-mode-indicator">
          {environmentManager && environmentManager.getActiveEnvironmentName() && (
            <div className="environment-badge">
              Environment: {environmentManager.getActiveEnvironmentName()}
            </div>
          )}
          {projectManager && projectManager.getActiveProject() && (
            <div className="project-badge">
              Project: {projectManager.getActiveProject().name}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTesterTab;

