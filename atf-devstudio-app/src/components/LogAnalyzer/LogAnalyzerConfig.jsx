import React from 'react';
import './LogAnalyzer.css';
import StandardToggleSwitch from '../../shared/uicomponent/StandardToggleSwitch';

const LogAnalyzerConfig = ({
  configMode, setConfigMode,
  logFormat, setLogFormat,
  displayOptions, setDisplayOptions,
  parsingOptions, setParsingOptions,
  loadSampleLog
}) => {
  // Log format options
  const logFormats = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'apache', label: 'Apache / Nginx Access Log' },
    { value: 'php', label: 'PHP Error Log' },
    { value: 'java', label: 'Java / Spring Log' },
    { value: 'nodejs', label: 'Node.js / Winston Log' },
    { value: 'python', label: 'Python Log' },
    { value: 'json', label: 'JSON Log' }
  ];

  // Sample log options
  const sampleLogs = {
    java: {
      name: "Java Application Logs",
      data: `2023-08-15 08:12:34.523 INFO  [http-nio-8080-exec-1] com.example.controller.UserController: User authenticated: user123
2023-08-15 08:12:35.128 DEBUG [http-nio-8080-exec-1] com.example.service.UserService: Loading user profile for user123
2023-08-15 08:12:35.843 DEBUG [http-nio-8080-exec-1] com.example.repository.UserRepository: Executing SQL: SELECT * FROM users WHERE username = 'user123'
2023-08-15 08:12:36.247 INFO  [http-nio-8080-exec-1] com.example.controller.UserController: Profile loaded for user123
2023-08-15 08:15:42.876 INFO  [http-nio-8080-exec-3] com.example.controller.OrderController: New order created: ORD-7843 for user123
2023-08-15 08:15:43.124 DEBUG [async-thread-2] com.example.service.NotificationService: Sending order confirmation email for ORD-7843
2023-08-15 08:15:44.532 ERROR [async-thread-2] com.example.service.EmailService: Failed to send email
java.io.IOException: Connection timeout
\tat com.example.service.EmailService.sendEmail(EmailService.java:42)
\tat com.example.service.NotificationService.sendOrderConfirmation(NotificationService.java:28)
\tat com.example.service.OrderService.lambda$processOrder$0(OrderService.java:65)
\tat java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128)
2023-08-15 08:15:45.124 WARN  [async-thread-2] com.example.service.NotificationService: Email delivery failed, scheduling retry
2023-08-15 08:17:21.532 DEBUG [async-thread-5] com.example.service.NotificationService: Retrying email delivery for ORD-7843
2023-08-15 08:17:22.986 INFO  [async-thread-5] com.example.service.EmailService: Email sent successfully to user123@example.com`
    },
    apache: {
      name: "Apache Access Logs",
      data: `192.168.1.20 - - [15/Aug/2023:10:32:15 +0000] "GET /index.html HTTP/1.1" 200 2326 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.35 - - [15/Aug/2023:10:32:18 +0000] "GET /css/main.css HTTP/1.1" 200 4388 "http://example.com/index.html" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.35 - - [15/Aug/2023:10:32:19 +0000] "GET /js/scripts.js HTTP/1.1" 200 1947 "http://example.com/index.html" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.42 - - [15/Aug/2023:10:33:42 +0000] "POST /api/login HTTP/1.1" 401 173 "http://example.com/login" "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15"
192.168.1.42 - - [15/Aug/2023:10:33:58 +0000] "POST /api/login HTTP/1.1" 200 347 "http://example.com/login" "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15"
192.168.1.42 - - [15/Aug/2023:10:34:12 +0000] "GET /dashboard HTTP/1.1" 200 5823 "http://example.com/login" "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15"
192.168.1.18 - - [15/Aug/2023:10:35:23 +0000] "GET /images/banner.jpg HTTP/1.1" 404 211 "http://example.com/products" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
192.168.1.57 - - [15/Aug/2023:10:36:44 +0000] "GET /api/products HTTP/1.1" 200 8732 "http://example.com/shop" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:85.0) Gecko/20100101 Firefox/85.0"`
    },
    nodejs: {
      name: "Node.js JSON Logs",
      data: `{"level":"info","message":"Server started on port 3000","timestamp":"2023-08-15T11:42:13.428Z","service":"api-server"}
{"level":"debug","message":"Connected to database","timestamp":"2023-08-15T11:42:13.985Z","service":"database"}
{"level":"info","message":"User authenticated: john_doe","timestamp":"2023-08-15T11:43:24.187Z","userId":"5f8d43e1c9e77c001f25e134","service":"auth"}
{"level":"debug","message":"Processing payment","timestamp":"2023-08-15T11:44:12.572Z","amount":129.99,"currency":"USD","service":"payment"}
{"level":"error","message":"Payment gateway timeout","timestamp":"2023-08-15T11:44:13.852Z","error":"ETIMEDOUT","service":"payment","requestId":"req-728ac53f"}
{"level":"warn","message":"Retrying payment processing","timestamp":"2023-08-15T11:44:14.123Z","attempt":1,"maxRetries":3,"service":"payment"}
{"level":"info","message":"Payment processed successfully","timestamp":"2023-08-15T11:44:16.427Z","transactionId":"tx-94832ab","service":"payment"}
{"level":"debug","message":"User session extended","timestamp":"2023-08-15T11:48:43.127Z","userId":"5f8d43e1c9e77c001f25e134","service":"auth"}
{"level":"info","message":"API rate limit reached","timestamp":"2023-08-15T11:52:17.438Z","clientIp":"203.0.113.42","endpoint":"/api/search","service":"rate-limiter"}`
    }
  };

  const handleDisplayOptionChange = (option, value) => {
    setDisplayOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleParsingOptionChange = (option, value) => {
    setParsingOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <>
      <h3 className="config-section-title">Log Analyzer Settings</h3>

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

      {/* Log Format Section */}
      <div className="form-group">
        <label>Log Format</label>
        <select 
          value={logFormat}
          onChange={(e) => setLogFormat(e.target.value)}
          title="Select the format of your log files"
        >
          {logFormats.map(format => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Display Options */}
      <div className="form-group">
        <label>Display Options</label>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="show-line-numbers"
            checked={displayOptions.showLineNumbers}
            onChange={(e) => handleDisplayOptionChange('showLineNumbers', e.target.checked)}
            title="Show line numbers for each log entry"
          />
          <label htmlFor="show-line-numbers">Show Line Numbers</label>
        </div>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="wrap-lines"
            checked={displayOptions.wrapLines}
            onChange={(e) => handleDisplayOptionChange('wrapLines', e.target.checked)}
            title="Wrap long lines instead of horizontal scrolling"
          />
          <label htmlFor="wrap-lines">Wrap Lines</label>
        </div>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="highlight-levels"
            checked={displayOptions.highlightLevels}
            onChange={(e) => handleDisplayOptionChange('highlightLevels', e.target.checked)}
            title="Highlight log levels with different colors"
          />
          <label htmlFor="highlight-levels">Highlight Log Levels</label>
        </div>
      </div>
      
      {/* Parsing Options */}
      <div className="form-group">
        <label>Parsing Options</label>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="expand-json"
            checked={parsingOptions.expandJson}
            onChange={(e) => handleParsingOptionChange('expandJson', e.target.checked)}
            title="Expand and format JSON data in log entries"
          />
          <label htmlFor="expand-json">Expand JSON Payloads</label>
        </div>
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="group-related"
            checked={parsingOptions.groupRelated}
            onChange={(e) => handleParsingOptionChange('groupRelated', e.target.checked)}
            title="Group related log entries (like exceptions with stack traces)"
          />
          <label htmlFor="group-related">Group Related Logs</label>
        </div>
      </div>

      {/* Advanced options when in advanced mode */}
      {configMode === 'advanced' && (
        <>
          <div className="form-group">
            <label>Date/Time Format</label>
            <select 
              defaultValue="auto"
              title="Specify the date/time format in your logs"
            >
              <option value="auto">Auto-detect</option>
              <option value="iso8601">ISO 8601 (2023-08-15T08:12:34Z)</option>
              <option value="rfc3339">RFC 3339 (2023-08-15 08:12:34+00:00)</option>
              <option value="unix">Unix Timestamp (1629010354)</option>
              <option value="custom">Custom Format</option>
            </select>
          </div>

          <div className="form-group">
            <label>Error Detection</label>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="highlight-errors"
                defaultChecked={true}
                title="Highlight error and warning messages"
              />
              <label htmlFor="highlight-errors">Highlight Errors & Warnings</label>
            </div>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="extract-stack-traces"
                defaultChecked={true}
                title="Extract and format stack traces from logs"
              />
              <label htmlFor="extract-stack-traces">Extract Stack Traces</label>
            </div>
          </div>
        </>
      )}

      {/* Sample Logs */}
      <div className="form-group">
        <label>Load Sample Logs</label>
        <select 
          onChange={(e) => {
            if (e.target.value) {
              loadSampleLog(sampleLogs[e.target.value].data);
              e.target.value = '';
            }
          }}
          defaultValue=""
          title="Load pre-configured sample logs"
        >
          <option value="" disabled>Select a sample</option>
          <option value="java">Java Application Logs</option>
          <option value="apache">Apache Access Logs</option>
          <option value="nodejs">Node.js JSON Logs</option>
        </select>
      </div>
     </>
  );
};

export default LogAnalyzerConfig;