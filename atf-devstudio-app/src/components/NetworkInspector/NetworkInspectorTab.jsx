// NetworkInspectorTab.jsx
// Tab content for network inspection

import { useState, useRef, useEffect, useCallback } from 'react';
import { formatNetworkResponse, parseHeadersString, createSampleResponse, formatTimestamp, validateNetworkRequest } from '../../shared/utils/networkUtils';
import { makeNetworkRequest, createProxyUrl } from '../../shared/utils/networkRequestUtils';
import { copyToClipboard } from '../../shared/utils/helpers';

const NetworkInspectorTab = ({
  inspector,
  updateInspector,
  deleteInspector,
  setStatusMessage,
  darkMode,
  inspectorStyle = 'simple',
  headerColor = '#4f46e5',
}) => {
  const {
    id,
    title,
    url,
    method,
    headers,
    body,
    activeTab,
    configMode,
    autoFormat,
    showRawResponse,
    includeCredentials,
    defaultHeaders,
    useMockResponse,
  } = inspector;

  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [currentMethod, setCurrentMethod] = useState(method || 'GET');
  const [currentHeaders, setCurrentHeaders] = useState(headers || 'Accept: application/json');
  const [currentBody, setCurrentBody] = useState(body || '');
  const [currentActiveTab, setCurrentActiveTab] = useState(activeTab || 'headers');
  const [currentConfigMode, setCurrentConfigMode] = useState(configMode || 'simple');
  const [currentAutoFormat, setCurrentAutoFormat] = useState(autoFormat !== undefined ? autoFormat : true);
  const [currentShowRawResponse, setCurrentShowRawResponse] = useState(showRawResponse !== undefined ? showRawResponse : false);
  const [currentIncludeCredentials, setCurrentIncludeCredentials] = useState(includeCredentials !== undefined ? includeCredentials : true);
  const [currentDefaultHeaders, setCurrentDefaultHeaders] = useState(defaultHeaders || 'Accept: application/json\nContent-Type: application/json');
  const [currentUseMockResponse, setCurrentUseMockResponse] = useState(useMockResponse !== undefined ? useMockResponse : false);
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);

  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // Sync with prop changes
  useEffect(() => {
    setCurrentUrl(url || '');
    setCurrentMethod(method || 'GET');
    setCurrentHeaders(headers || 'Accept: application/json');
    setCurrentBody(body || '');
    setCurrentActiveTab(activeTab || 'headers');
    setCurrentConfigMode(configMode || 'simple');
    setCurrentAutoFormat(autoFormat !== undefined ? autoFormat : true);
    setCurrentShowRawResponse(showRawResponse !== undefined ? showRawResponse : false);
    setCurrentIncludeCredentials(includeCredentials !== undefined ? includeCredentials : true);
    setCurrentDefaultHeaders(defaultHeaders || 'Accept: application/json\nContent-Type: application/json');
    setCurrentUseMockResponse(useMockResponse !== undefined ? useMockResponse : false);
  }, [url, method, headers, body, activeTab, configMode, autoFormat, showRawResponse, includeCredentials, defaultHeaders, useMockResponse]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateInspector(id, {
        url: currentUrl,
        method: currentMethod,
        headers: currentHeaders,
        body: currentBody,
        activeTab: currentActiveTab,
        configMode: currentConfigMode,
        autoFormat: currentAutoFormat,
        showRawResponse: currentShowRawResponse,
        includeCredentials: currentIncludeCredentials,
        defaultHeaders: currentDefaultHeaders,
        useMockResponse: currentUseMockResponse,
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [id, currentUrl, currentMethod, currentHeaders, currentBody, currentActiveTab, currentConfigMode, currentAutoFormat, currentShowRawResponse, currentIncludeCredentials, currentDefaultHeaders, currentUseMockResponse, updateInspector]);

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
      const validationResult = validateNetworkRequest(currentUrl, currentMethod, currentHeaders);
      
      if (!validationResult.valid) {
        setError(`Invalid request: ${validationResult.message}`);
        setStatusMessage?.(`Invalid request: ${validationResult.message}`);
        setLoading(false);
        return;
      }

      const timestamp = new Date();
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      const parsedHeaders = parseHeadersString(currentHeaders);
      
      const options = {
        method: currentMethod,
        headers: parsedHeaders,
        signal: abortControllerRef.current.signal,
        credentials: currentIncludeCredentials ? 'include' : 'omit'
      };

      if (['POST', 'PUT', 'PATCH'].includes(currentMethod) && currentBody.trim()) {
        if (parsedHeaders['Content-Type'] && parsedHeaders['Content-Type'].includes('application/json')) {
          try {
            options.body = JSON.stringify(JSON.parse(currentBody));
          } catch (e) {
            setError(`Invalid JSON body: ${e.message}`);
            setStatusMessage?.(`Invalid JSON body: ${e.message}`);
            setLoading(false);
            return;
          }
        } else {
          options.body = currentBody;
        }
      }

      const historyItem = {
        id: Date.now(),
        url: currentUrl,
        method: currentMethod,
        timestamp,
        requestBody: currentBody
      };

      let responseData;

      if (currentUseMockResponse) {
        await new Promise(resolve => setTimeout(resolve, 500));
        responseData = createSampleResponse(currentUrl, currentMethod);
      } else {
        try {
          const requestUrl = createProxyUrl(currentUrl);
          responseData = await makeNetworkRequest(requestUrl, options, abortControllerRef.current.signal);
          
          if (responseData.error && responseData.status === 0) {
            throw new Error(responseData.error);
          }
        } catch (networkError) {
          if (networkError.message && networkError.message.includes('CORS')) {
            await new Promise(resolve => setTimeout(resolve, 500));
            responseData = createSampleResponse(currentUrl, currentMethod);
            responseData.warning = 'CORS error with real request - showing simulated response. Try enabling CORS in your browser or using a proxy server.';
          } else {
            throw networkError;
          }
        }
      }
      
      historyItem.status = responseData.status;
      historyItem.statusText = responseData.statusText;
      historyItem.headers = responseData.headers;
      historyItem.body = responseData.body;
      historyItem.contentType = responseData.contentType;
      historyItem.time = responseData.time;
      historyItem.size = responseData.size;
      historyItem.warning = responseData.warning;
      
      setRequestHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      setResponse(responseData);
      
      const formattedResponse = formatNetworkResponse(responseData, currentShowRawResponse);
      
      setStatusMessage?.(`RESPONSE:${JSON.stringify({
        status: responseData.status < 400 ? 'success' : 'error',
        message: `${currentMethod} ${currentUrl} - ${responseData.status} ${responseData.statusText}`,
        details: responseData.warning || '',
        content: formattedResponse
      })}`);
      
      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
        setLoading(false);
        return;
      }
      
      setError(`Request failed: ${err.message}`);
      setStatusMessage?.(`Request failed: ${err.message}`);
      setLoading(false);
    } finally {
      abortControllerRef.current = null;
    }
  }, [currentUrl, currentMethod, currentHeaders, currentBody, currentIncludeCredentials, currentUseMockResponse, currentShowRawResponse, setStatusMessage]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setStatusMessage?.('Request cancelled');
    }
  }, [setStatusMessage]);

  // Generate and copy cURL command
  const generateCurl = useCallback(() => {
    try {
      const parsedHeaders = parseHeadersString(currentHeaders);
      
      let curlCommand = `curl -X ${currentMethod} "${currentUrl}"`;
      
      for (const [key, value] of Object.entries(parsedHeaders)) {
        curlCommand += ` \\\n  -H "${key}: ${value.replace(/"/g, '\\"')}"`;
      }
      
      if (['POST', 'PUT', 'PATCH'].includes(currentMethod) && currentBody.trim()) {
        curlCommand += ` \\\n  -d "${currentBody.replace(/"/g, '\\"')}"`;
      }

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
  }, [currentUrl, currentMethod, currentHeaders, currentBody, setStatusMessage]);

  // Clear form
  const clearForm = useCallback(() => {
    setCurrentUrl('');
    setCurrentHeaders(currentDefaultHeaders);
    setCurrentBody('');
    setError(null);
    setResponse(null);
    setStatusMessage?.('Form cleared');
  }, [currentDefaultHeaders, setStatusMessage]);

  return (
    <div className={`network-inspector-tab-content ${inspectorStyle === 'modern' ? 'modern-style' : ''}`}>
      {/* Options Section */}
      <div className="network-inspector-options-section">
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

        {currentConfigMode === 'advanced' && (
          <div className="options-row">
            <div className="option-group">
              <label>Request Options</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentUseMockResponse}
                    onChange={(e) => setCurrentUseMockResponse(e.target.checked)}
                  />
                  <span>Use mock responses</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentIncludeCredentials}
                    onChange={(e) => setCurrentIncludeCredentials(e.target.checked)}
                  />
                  <span>Include credentials</span>
                </label>
              </div>
            </div>
            <div className="option-group">
              <label>Display Options</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentAutoFormat}
                    onChange={(e) => setCurrentAutoFormat(e.target.checked)}
                  />
                  <span>Auto-format JSON</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentShowRawResponse}
                    onChange={(e) => setCurrentShowRawResponse(e.target.checked)}
                  />
                  <span>Show raw response</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* URL and Method Section */}
      <div className="network-inspector-url-section">
        <div className="url-row">
          <select 
            value={currentMethod}
            onChange={(e) => setCurrentMethod(e.target.value)}
            className="method-select"
            title="Select HTTP method"
          >
            {httpMethods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
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
            
            <button 
              className="secondary-button"
              onClick={() => setCurrentUseMockResponse(!currentUseMockResponse)}
              title={currentUseMockResponse ? "Switch to real network requests" : "Switch to mock responses"}
            >
              {currentUseMockResponse ? '🌐 Use Real Requests' : '🔄 Use Mock Responses'}
            </button>
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
        {['POST', 'PUT', 'PATCH'].includes(currentMethod) && (
          <button 
            className={`tab-button ${currentActiveTab === 'body' ? 'active' : ''}`} 
            onClick={() => setCurrentActiveTab('body')}
            title="Edit request body"
          >
            Body
          </button>
        )}
      </div>
      
      {/* Request Content */}
      <div className="request-content">
        {currentActiveTab === 'headers' && (
          <div className="headers-tab">
            <textarea
              ref={textareaRef}
              value={currentHeaders}
              onChange={(e) => setCurrentHeaders(e.target.value)}
              placeholder="Accept: application/json
Content-Type: application/json"
              className="headers-textarea"
              title="Enter request headers in key: value format, one per line"
              rows={8}
            />
          </div>
        )}
        
        {currentActiveTab === 'body' && ['POST', 'PUT', 'PATCH'].includes(currentMethod) && (
          <div className="body-tab">
            <textarea
              value={currentBody}
              onChange={(e) => setCurrentBody(e.target.value)}
              placeholder={'{\n  "key": "value"\n}'}
              className="body-textarea"
              title="Enter request body"
              rows={10}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Mock Indicator */}
      {currentUseMockResponse && (
        <div className="mock-indicator">
          <span>⚠️ Using mock responses</span>
        </div>
      )}

      {/* Actions Section */}
      <div className="network-inspector-actions-section">
        {loading ? (
          <button 
            onClick={cancelRequest}
            className="secondary-button cancel-button"
            title="Cancel the current request"
          >
            Cancel Request
          </button>
        ) : (
          <button 
            onClick={sendRequest}
            className="action-button inspect-button"
            disabled={!currentUrl.trim()}
            title={!currentUrl.trim() ? "Please enter a URL first" : "Send request"}
          >
            {loading ? (
              <>
                <span className="loading-indicator"></span>
                Inspecting...
              </>
            ) : (
              '🔍 Inspect Request'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default NetworkInspectorTab;



