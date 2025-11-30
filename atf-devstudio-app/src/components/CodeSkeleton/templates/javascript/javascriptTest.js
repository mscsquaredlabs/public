// templates/javascript/javascriptTest.js
// JavaScript Test Suite Template (using Jest)

export const jsTest = (options) => { // Renamed to jsTest
    const {
      includeComments = true,
      className = 'MyComponent', // For component tests
      functionName = 'myFunction', // For function tests
      testType = 'component' // 'component' or 'function' or 'module'
    } = options;
  
    const targetName = testType === 'component' ? className : functionName;
    const targetFile = `./${targetName}`; // Adjust path as needed
  
    // Determine imports based on test type
    let importStatement = '';
    if (testType === 'component') {
      importStatement = `import React from 'react';\nimport { render, screen, fireEvent, waitFor } from '@testing-library/react';\nimport '@testing-library/jest-dom'; // For extra matchers\nimport ${targetName} from '${targetFile}';`;
    } else if (testType === 'function') {
       importStatement = `// Assuming named export, adjust if default: import { ${targetName} } from '${targetFile}';\n// import ${targetName} from '${targetFile}'; // If default export`;
    } else { // module or other
       importStatement = `// Import necessary parts from the module\nimport * as moduleUnderTest from '${targetFile}';\n// import specificNamedExport from '${targetFile}';`;
    }
  
  
    // Generate test content based on type
    let testContent = '';
    if (testType === 'component') {
      testContent = `
  describe('${targetName} Component Tests', () => {
  
    // Mock any dependencies the component might have (e.g., fetch, context)
    beforeEach(() => {
      // Reset mocks if needed
      // global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    });
  
    test('renders without crashing', () => {
      render(<${targetName} />);
      // Add assertions to check for specific elements presence
      expect(screen.getByRole('heading')).toBeInTheDocument(); // Example assertion
    });
  
    test('renders correctly with default props', () => {
      const { container } = render(<${targetName} />);
      // Check for default content or state
      expect(screen.getByText(/default content/i)).toBeInTheDocument(); // Example
      // Optional: Snapshot testing
      expect(container).toMatchSnapshot();
    });
  
    test('renders correctly with specific props', () => {
      const testProps = { title: 'Test Title Prop', value: 123 };
      render(<${targetName} {...testProps} />);
      expect(screen.getByRole('heading', { name: testProps.title })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(testProps.value.toString()))).toBeInTheDocument();
    });
  
    test('handles user interaction (e.g., button click)', () => {
      const handleClickMock = jest.fn();
      render(<${targetName} onClick={handleClickMock} />);
  
      const button = screen.getByRole('button', { name: /click me/i }); // Adjust selector
      fireEvent.click(button);
  
      expect(handleClickMock).toHaveBeenCalledTimes(1);
      // Optionally check for state changes if interaction modifies component state
      // expect(screen.getByText(/state changed/i)).toBeInTheDocument();
    });
  
    test('handles async operations (e.g., data fetching)', async () => {
       // Mock the async operation (e.g., fetch)
       global.fetch = jest.fn().mockResolvedValueOnce({
         ok: true,
         json: async () => ({ data: 'Fetched Successfully' }),
       });
  
      render(<${targetName} />);
  
      // Check for loading state initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument(); // Adjust selector
  
      // Wait for the async operation to complete and UI to update
      const dataElement = await screen.findByText(/Fetched Successfully/i); // Adjust selector
      expect(dataElement).toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  
    // Add tests for different states, edge cases, accessibility (axe-core)
  });
  `;
    } else if (testType === 'function') {
       testContent = `
  // Mock any global dependencies or setup needed for the function
  // let consoleErrorMock;
  // beforeEach(() => {
  //   consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  // });
  // afterEach(() => {
  //   consoleErrorMock?.mockRestore();
  // });
  
  describe('${targetName} Function Tests', () => {
  
    test('should return the expected value for valid inputs', () => {
      const input = /* Provide valid input */;
      const expected = /* Define expected output */;
      expect(${targetName}(input)).toEqual(expected); // Use .toEqual for objects/arrays
    });
  
    test('should handle specific edge case inputs', () => {
      // Example: Empty string
      expect(${targetName}('')).toBe(/* Expected output for empty string */);
      // Example: Null or Undefined
      expect(${targetName}(null)).toBe(/* Expected output for null */);
      expect(${targetName}(undefined)).toBe(/* Expected output for undefined */);
      // Example: Zero or Negative numbers
      expect(${targetName}(0)).toBe(/* Expected output for 0 */);
    });
  
    test('should handle invalid input types correctly', () => {
      // Example: Expecting a string, passing a number
      const invalidInput = 123;
      // Option 1: Function returns a specific value (e.g., null, empty string)
      // expect(${targetName}(invalidInput)).toBeNull();
      // Option 2: Function throws an error
      expect(() => ${targetName}(invalidInput)).toThrow(/Invalid input type/i); // Check error message
  
      // Verify mocks if errors are logged
      // expect(consoleErrorMock).toHaveBeenCalled();
    });
  
     test('should perform correctly with optional parameters', () => {
      const input = /* Input requiring optional params */;
      const options = { /* Optional parameters */ };
      const expected = /* Expected output with options */;
      expect(${targetName}(input, options)).toEqual(expected);
  
      // Test without optional parameters if defaults exist
      const expectedWithoutOptions = /* Expected output without options */;
      expect(${targetName}(input)).toEqual(expectedWithoutOptions);
    });
  
    // Add tests for more complex logic, different branches, async behavior if applicable
  });
  `;
    } else { // Module tests (example)
       testContent = `
  describe('${targetName} Module Tests', () => {
  
    test('should export expected constants', () => {
      expect(moduleUnderTest.SOME_CONSTANT).toBeDefined();
      expect(moduleUnderTest.SOME_CONSTANT).toEqual(/* Expected value */);
    });
  
    test('exported function should work correctly', () => {
       const input = /* ... */;
       const expected = /* ... */;
       expect(moduleUnderTest.exportedFunction(input)).toEqual(expected);
    });
  
     test('exported class should instantiate and have methods', () => {
       const instance = new moduleUnderTest.ExportedClass(/* constructor args */);
       expect(instance).toBeInstanceOf(moduleUnderTest.ExportedClass);
       expect(instance.someMethod(/* args */)).toEqual(/* expected result */);
     });
  
    // Add more tests for different parts of the module
  });
      `;
    }
  
  
    return `${includeComments ? `/**
   * Test suite for ${targetName}.
   * Uses Jest and @testing-library/react (for components).
   */
  ` : ""}
  ${importStatement}
  
  ${testContent}
  `;
  };