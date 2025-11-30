import React from 'react';
import './NetworkInspector.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const NetworkInspectorConfig = ({
  configMode,
  setConfigMode,
  autoFormat,
  setAutoFormat,
  showRawResponse,
  setShowRawResponse,
  includeCredentials,
  setIncludeCredentials,
  defaultHeaders,
  setDefaultHeaders,
  useMockResponse,
  setUseMockResponse,
  requestHistory,
  loadFromHistory,
  clearHistory
}) => {
  // Sample request examples
  const requestExamples = {
    getJson: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
      headers: 'Accept: application/json',
      body: '',
    },
    postJson: {
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      headers: 'Content-Type: application/json\nAccept: application/json',
      body: '{\n  "title": "New Post",\n  "body": "This is the post content",\n  "userId": 1\n}',
    },
    putJson: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'PUT',
      headers: 'Content-Type: application/json\nAccept: application/json',
      body: '{\n  "id": 1,\n  "title": "Updated Post",\n  "body": "This post has been updated",\n  "userId": 1\n}',
    },
    deleteRequest: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'DELETE',
      headers: 'Accept: application/json',
      body: '',
    },
    weatherApi: {
      url: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo',
      method: 'GET',
      headers: 'Accept: application/json',
      body: '',
    },
    githubApi: {
      url: 'https://api.github.com/users/octocat',
      method: 'GET',
      headers: 'Accept: application/json',
      body: '',
    }
  };

  return (
    <> <h3 className="config-section-title">Network Inspector Settings</h3>

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

      {/* Request Mode Settings */}
      <div className="form-group">
        <label>Request Mode</label>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="use-mock-response"
            checked={useMockResponse}
            onChange={e => setUseMockResponse(e.target.checked)}
            title="Use simulated responses instead of real network requests"
          />
          <label htmlFor="use-mock-response">Use mock responses (avoids CORS issues)</label>
        </div>
        {useMockResponse && (
          <p className="config-note">
            Using simulated responses. No actual network requests will be made.
          </p>
        )}
        {!useMockResponse && (
          <p className="config-note">
            Making real network requests. May encounter CORS errors with some APIs.
          </p>
        )}
      </div>

      {/* Display Options */}
      <div className="form-group">
        <label>Display Options</label>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="auto-format"
            checked={autoFormat}
            onChange={e => setAutoFormat(e.target.checked)}
            title="Automatically format JSON responses"
          />
          <label htmlFor="auto-format">Auto-format JSON responses</label>
        </div>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="show-raw-response"
            checked={showRawResponse}
            onChange={e => setShowRawResponse(e.target.checked)}
            title="Show raw response data without formatting"
          />
          <label htmlFor="show-raw-response">Show raw response data</label>
        </div>
      </div>
      
      {/* Default Headers */}
      <div className="form-group">
        <label>Default Headers</label>
        <textarea 
          value={defaultHeaders}
          onChange={e => setDefaultHeaders(e.target.value)}
          placeholder="Enter default headers in key: value format"
          title="Set default headers for all requests"
          className="default-headers-textarea"
        />
      </div>
      
      {/* Proxy Settings */}
      <div className="form-group">
        <label>Request Settings</label>
        <p className="config-note">Network requests are proxied to avoid CORS issues when possible.</p>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="include-credentials"
            checked={includeCredentials}
            onChange={e => setIncludeCredentials(e.target.checked)}
            title="Include cookies and authentication with requests"
          />
          <label htmlFor="include-credentials">Include credentials (cookies)</label>
        </div>
      </div>

      {/* Example Requests */}
      <div className="form-group">
        <label>Load Example Request</label>
        <select 
          onChange={(e) => {
            if (e.target.value) {
              // Load example
              const example = requestExamples[e.target.value];
              loadFromHistory({
                url: example.url,
                method: example.method,
                headers: example.headers ? example.headers.split('\n').reduce((obj, line) => {
                  const [key, value] = line.split(':').map(part => part.trim());
                  if (key && value) obj[key] = value;
                  return obj;
                }, {}) : {},
                requestBody: example.body || '',
              });
              
              // Reset the select
              e.target.value = '';
            }
          }}
          defaultValue=""
          title="Load a pre-configured example request"
        >
          <option value="" disabled>Select an example</option>
          <option value="getJson">JSON Placeholder (GET)</option>
          <option value="postJson">JSON Placeholder (POST)</option>
          <option value="putJson">JSON Placeholder (PUT)</option>
          <option value="deleteRequest">JSON Placeholder (DELETE)</option>
          <option value="weatherApi">Weather API</option>
          <option value="githubApi">GitHub API</option>
        </select>
      </div>
      
      {/* Request History */}
      <div className="form-group">
        <label>Request History</label>
        <div className="request-history-list">
          {requestHistory.length > 0 ? (
            requestHistory.map((item, index) => (
              <div key={index} className="history-item" onClick={() => loadFromHistory(item)} title={`Load ${item.method} ${item.url}`}>
                <div className="history-method">{item.method}</div>
                <div className="history-url">{item.url}</div>
                <div className={`history-status status-${Math.floor(item.status / 100)}xx`}>
                  {item.status}
                </div>
                <div className="history-time">{item.timestamp ? formatTimestamp(item.timestamp) : 'Unknown'}</div>
              </div>
            ))
          ) : (
            <div className="empty-history">No requests yet</div>
          )}
        </div>
        {requestHistory.length > 0 && (
          <button 
            className="clear-history-button"
            onClick={clearHistory}
            title="Clear all request history"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Advanced Configuration (shown only in advanced mode) */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <label>Request Timeout (seconds)</label>
            <input 
              type="number" 
              defaultValue={30}
              min={1}
              max={120}
              title="Set request timeout in seconds"
            />
          </div>
          
          <div className="form-group">
            <label>Response Format</label>
            <select 
              defaultValue="auto"
              title="Set preferred response format"
            >
              <option value="auto">Auto-detect</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="text">Plain Text</option>
            </select>
          </div>
        </>
      )}
      </>
  );
};

// Format timestamp for display in history
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today, just show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Otherwise show date and time
  return date.toLocaleString([], { 
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default NetworkInspectorConfig;