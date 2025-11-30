// templates/javascript/javascriptClass.js
// JavaScript Class Template

export const jsClass = (options) => { // Renamed to jsClass
    const {
      includeComments = true,
      includeTypeInfo = true, // Use JSDoc for type info
      includeTests = false,
      className = 'MyService'
    } = options;
  
    return `${includeComments ? `/**
   * ${className}
   * ${includeComments ? 'Represents a [Type of Service/Object] with specific functionalities.' : ''}
   * Provides methods for [Summarize primary responsibilities].
   */` : ""}
  class ${className} {
    ${includeComments ? `// --- Static Properties (Optional) ---
    // static defaultTimeout = 5000;
  
    // --- Private Fields (using # syntax - modern JS) ---
    // #apiKey;
    // #internalState = 'idle';
  
    // --- Public Fields (Optional) ---
    // config = {};
  ` : ""}
    ${includeComments ? `/**
     * Creates an instance of ${className}.
     ${includeTypeInfo ? `* @param {object} [options={}] - Configuration options.
     * @param {string} options.endpoint - The API endpoint to connect to.
     * @param {number} options.timeout - Request timeout in milliseconds.
     * @param {string} options.apiKey - API key for authentication. */` : ""}
     */` : ""}
    constructor(options = {}) {
      ${includeComments ? '// Validate required options\n' : ''}
      if (!options.endpoint) {
        throw new Error('Endpoint option is required.');
      }
       if (!options.apiKey) {
        // throw new Error('API key is required.'); // Or handle missing key differently
        console.warn('${className}: API key not provided. Limited functionality may apply.');
      }
  
      ${includeComments ? '// Initialize properties\n' : ''}
      this.endpoint = options.endpoint;
      this.timeout = options.timeout || 5000; // Use default value
      // this.#apiKey = options.apiKey; // Assign to private field if used
      this.apiKey = options.apiKey; // Assign to public field/property
  
      this.isActive = false;
  
      
      ${includeComments ? '// Bind methods to ensure \'this\' context if passed as callbacks (optional)' : ''}
      // this.fetchData = this.fetchData.bind(this);
    }
  
    ${includeComments ? `// --- Public Methods ---
  
    /**
     * Connects to the service endpoint.
     * @returns {Promise<boolean>} True if connection is successful, false otherwise.
     */` : ""}
    async connect() {
      ${includeComments ? `// Simulate connection logic\n` : ''}
      console.log(\`Connecting to \${this.endpoint}...\`);
      // this.#internalState = 'connecting';
      try {
        // Replace with actual connection logic (e.g., WebSocket, initial API ping)
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        this.isActive = true;
        // this.#internalState = 'connected';
        console.log('Connected successfully.');
        return true;
      } catch (error) {
        console.error('Connection failed:', error);
        this.isActive = false;
        // this.#internalState = 'error';
        return false;
      }
    }
  
    ${includeComments ? `/**
     * Fetches data based on the provided ID.
     ${includeTypeInfo ? `* @param {string|number} id - The ID of the data to fetch.
     * @returns {Promise<object|null>} The fetched data object or null if not found/error. */` : ""}
     */` : ""}
    async fetchData(id) {
      if (!this.isActive) {
        console.warn('Cannot fetch data: Service not connected.');
        return null;
      }
      if (!id) {
          console.error('Fetch data requires an ID.');
          return null;
      }
      // console.log(\`Fetching data for ID: \${id} using key: \${this.#apiKey}\`); // Access private field
      console.log(\`Fetching data for ID: \${id}\`);
  
      try {
        // Replace with actual fetch logic using this.endpoint, this.apiKey, this.timeout
        const response = await fetch(\`\${this.endpoint}/\${id}\`, {
           method: 'GET',
           headers: {
             'Authorization': \`Bearer \${this.apiKey || ''}\`, // Handle missing key
             'Content-Type': 'application/json'
           },
           // signal: AbortSignal.timeout(this.timeout) // Modern fetch timeout
        });
  
        if (!response.ok) {
            if (response.status === 404) {
                console.log(\`Data not found for ID: \${id}\`);
                return null;
            }
            throw new Error(\`HTTP error \${response.status} for ID \${id}\`);
        }
        const data = await response.json();
        return data;
  
      } catch (error) {
        console.error(\`Failed to fetch data for ID \${id}:\`, error);
        // this.#internalState = 'error';
        return null;
      }
    }
  
    ${includeComments ? `/**
     * Disconnects from the service.
     */` : ""}
    disconnect() {
      console.log('Disconnecting...');
      this.isActive = false;
      // this.#internalState = 'disconnected';
      // Add cleanup logic if needed
    }
  
    ${includeComments ? `// --- Getters/Setters (Optional) ---
    /**
     * Gets the current connection status.
     * @returns {boolean} True if connected, false otherwise.
     */` : ""}
     get isConnected() {
      return this.isActive;
      // return this.#internalState === 'connected'; // If using private state field
     }
  
     // Example Setter (use with caution, ensure it makes sense)
     // set timeoutDuration(newTimeout) {
     //   if (typeof newTimeout === 'number' && newTimeout > 0) {
     //     this.timeout = newTimeout;
     //   } else {
     //     console.warn('Invalid timeout value provided.');
     //   }
     // }
  
     ${includeComments ? `// --- Private Methods (using # syntax - modern JS) ---
    // async #authenticate() {
    //   console.log('Performing internal authentication...');
    //   // ... authentication logic using this.#apiKey ...
    //   return true;
    // }` : ""}
  }
  
  ${includeTests ? `
  // ================== TEST FILE (e.g., ${className}.test.js) ==================
  // Using Jest
  
  import { ${className} } from './${className}'; // Adjust import path
  
  // Mock global fetch
  global.fetch = jest.fn();
  
  describe('${className}', () => {
    const mockEndpoint = 'https://api.test.com/data';
    const mockApiKey = 'test-api-key';
    let serviceInstance;
  
    beforeEach(() => {
      // Reset fetch mock and create a new instance before each test
      fetch.mockClear();
      serviceInstance = new ${className}({ endpoint: mockEndpoint, apiKey: mockApiKey });
    });
  
    test('constructor should throw error if endpoint is missing', () => {
      expect(() => new ${className}({ apiKey: mockApiKey })).toThrow('Endpoint option is required.');
    });
  
     test('constructor should warn if API key is missing', () => {
       const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
       new ${className}({ endpoint: mockEndpoint });
       expect(consoleWarnMock).toHaveBeenCalledWith(expect.stringContaining('API key not provided'));
       consoleWarnMock.mockRestore();
     });
  
    test('constructor should initialize properties correctly', () => {
      expect(serviceInstance.endpoint).toBe(mockEndpoint);
      expect(serviceInstance.apiKey).toBe(mockApiKey);
      expect(serviceInstance.timeout).toBe(5000); // Default timeout
      expect(serviceInstance.isActive).toBe(false);
    });
  
     test('constructor should use provided timeout', () => {
       const customTimeout = 10000;
       const instanceWithTimeout = new ${className}({ endpoint: mockEndpoint, apiKey: mockApiKey, timeout: customTimeout });
       expect(instanceWithTimeout.timeout).toBe(customTimeout);
     });
  
    test('connect should set isActive to true on success', async () => {
      // Mock any internal logic called by connect if necessary
      const result = await serviceInstance.connect();
      expect(result).toBe(true);
      expect(serviceInstance.isActive).toBe(true);
      expect(serviceInstance.isConnected).toBe(true); // Test getter
    });
  
    // Add test for connect failure if possible (e.g., mock internal logic to throw)
  
    test('disconnect should set isActive to false', () => {
      // Connect first to change state
      serviceInstance.isActive = true;
      serviceInstance.disconnect();
      expect(serviceInstance.isActive).toBe(false);
      expect(serviceInstance.isConnected).toBe(false);
    });
  
    test('fetchData should return null if not connected', async () => {
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
      const result = await serviceInstance.fetchData('123');
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
      expect(consoleWarnMock).toHaveBeenCalledWith(expect.stringContaining('Service not connected'));
      consoleWarnMock.mockRestore();
    });
  
     test('fetchData should return null if ID is missing', async () => {
      await serviceInstance.connect(); // Ensure connected
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
      const result = await serviceInstance.fetchData(); // No ID
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
       expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('requires an ID'));
      consoleErrorMock.mockRestore();
    });
  
  
    test('fetchData should call fetch with correct URL and headers', async () => {
      await serviceInstance.connect(); // Ensure connected
      const testId = 'abc';
      const expectedUrl = \`\${mockEndpoint}/\${testId}\`;
      const expectedData = { id: testId, value: 'some data' };
  
      // Mock successful fetch response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedData,
      });
  
      await serviceInstance.fetchData(testId);
  
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${mockApiKey}\`,
          'Content-Type': 'application/json'
        },
      });
    });
  
    test('fetchData should return data on successful fetch', async () => {
      await serviceInstance.connect();
      const testId = '456';
      const expectedData = { id: testId, value: 'more data' };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => expectedData });
  
      const result = await serviceInstance.fetchData(testId);
      expect(result).toEqual(expectedData);
    });
  
    test('fetchData should return null if fetch fails (404)', async () => {
      await serviceInstance.connect();
      const testId = 'not-found';
      fetch.mockResolvedValueOnce({ ok: false, status: 404 });
  
      const result = await serviceInstance.fetchData(testId);
      expect(result).toBeNull();
    });
  
     test('fetchData should return null if fetch fails (non-404)', async () => {
      await serviceInstance.connect();
      const testId = 'server-error';
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
       const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
  
      const result = await serviceInstance.fetchData(testId);
      expect(result).toBeNull();
      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch data'), expect.any(Error));
      consoleErrorMock.mockRestore();
    });
  
    test('fetchData should return null if fetch throws network error', async () => {
      await serviceInstance.connect();
      const testId = 'network-issue';
      const networkError = new Error('Network failed');
      fetch.mockRejectedValueOnce(networkError);
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
  
      const result = await serviceInstance.fetchData(testId);
      expect(result).toBeNull();
       expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch data'), networkError);
      consoleErrorMock.mockRestore();
    });
  
    // Add tests for private methods if necessary (might require specific testing patterns)
  });
  ` : ""}
  
  // Export the class
  // export default ${className}; // Option 1: Default export
  export { ${className} }; // Option 2: Named export
  `;
  };