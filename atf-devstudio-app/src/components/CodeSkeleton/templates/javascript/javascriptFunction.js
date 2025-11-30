// templates/javascript/javascriptFunction.js
// Standalone JavaScript Function Template

export const jsFunction = (options) => { // Renamed to jsFunction
    const {
      includeComments = true,
      includeTypeInfo = true, // Use JSDoc for type info in JS
      includeTests = false,
      functionName = 'myFunction'
    } = options;
  
    return `${includeComments ? `/**
   * ${functionName}
   * ${includeComments ? 'Brief description of what the function does.' : ''}
   ${includeTypeInfo ? `*
   * @param {string} inputParam - Description of the input parameter. Example: A string to process.
   * @param {object} [options={}] - Optional configuration object.
   * @param {boolean} options.isActive - Example boolean option.
   * @returns {boolean|string|null} Description of the possible return values. Null if input is invalid.
   */` : ""}` : ""}
  function ${functionName}(inputParam, options = {}) {
    ${includeComments ? '// --- Input Validation ---\n' : ''}
    if (typeof inputParam !== 'string' || inputParam.length === 0) {
      console.error('${functionName}: Invalid inputParam provided.');
      return null; // Return null or throw error for invalid input
    }
  
    const { isActive = false } = options; ${includeComments ? '// Destructure options with defaults\n' : ''}
  
    ${includeComments ? '// --- Function Logic ---\n' : ''}
    let result = \`Processed: \${inputParam}\`;
  
    if (isActive) {
      result += ' (Active)';
    }
  
    ${includeComments ? '// Example: Perform some calculation or transformation\n' : ''}
    // const transformation = inputParam.toUpperCase();
  
    ${includeComments ? '// --- Return Value ---\n' : ''}
    return result;
  }
  
  ${includeTests ? `
  // ================== TEST FILE (e.g., ${functionName}.test.js) ==================
  // Assuming a testing framework like Jest
  
  // Import the function to test (adjust path as needed)
  // If the function isn't exported by default, use named import:
  // import { ${functionName} } from './${functionName}';
  // If it's a default export:
  // import ${functionName} from './${functionName}';
  
  // Mock console.error to avoid cluttering test output for expected errors
  let consoleErrorMock;
  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorMock.mockRestore();
  });
  
  
  describe('${functionName}', () => {
    test('should process valid string input correctly', () => {
      const input = 'hello world';
      const expected = 'Processed: hello world';
      expect(${functionName}(input)).toBe(expected);
    });
  
    test('should include (Active) when options.isActive is true', () => {
      const input = 'active test';
      const options = { isActive: true };
      const expected = 'Processed: active test (Active)';
      expect(${functionName}(input, options)).toBe(expected);
    });
  
    test('should handle options.isActive being false or missing', () => {
      const input = 'inactive test';
      const options = { isActive: false };
      const expected = 'Processed: inactive test';
      expect(${functionName}(input, options)).toBe(expected);
      expect(${functionName}(input, {})).toBe(expected); // Missing isActive
      expect(${functionName}(input)).toBe(expected);     // Missing options object
    });
  
    test('should return null for non-string input', () => {
      expect(${functionName}(123)).toBeNull();
      expect(${functionName}(null)).toBeNull();
      expect(${functionName}(undefined)).toBeNull();
      expect(${functionName}({})).toBeNull();
      expect(${functionName}([])).toBeNull();
      // Check if console.error was called for invalid input
      expect(consoleErrorMock).toHaveBeenCalled();
    });
  
    test('should return null for empty string input', () => {
      expect(${functionName}('')).toBeNull();
      expect(consoleErrorMock).toHaveBeenCalled();
    });
  
    // Add more tests for edge cases and complex logic if applicable
  });
  ` : ""}
  
  // Choose export style:
  // Option 1: Default export (if it's the main thing in the file)
  // export default ${functionName};
  
  // Option 2: Named export (often preferred for utils/multiple functions)
  // export { ${functionName} };
  `;
  };