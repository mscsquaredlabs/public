// templates/javascript/javascriptHook.js
// JavaScript React Hook Template

export const jsHook = (options) => { // Renamed to jsHook
    const {
      includeComments = true,
      includeTests = false,
      functionName = 'useCustomState' // Example hook name
    } = options || {}; // Added default object for safety
  
    // Extract noun from hook name for comments if possible (e.g., "useCustomState" -> "CustomState")
    const stateName = functionName.startsWith('use') ? functionName.substring(3) : functionName;
  
    // Use regular spaces for indentation
    return `${includeComments ? `/**
   * ${functionName} Hook
   *
   * A custom React Hook to manage [describe state purpose, e.g., a counter with validation].
   * Encapsulates state logic and provides a simple interface.
   *
   * @param {*} initialValue - The initial value for the state.
   * @param {object} [options={}] - Configuration options for the hook.
   * @param {number} options.step - The amount to increment/decrement by (default: 1).
   * @returns {Array} A tuple containing:
   * - The current state value.
   * - A function to update the state.
   * - A function to increment the state (example).
   * - A function to decrement the state (example).
   * - A memoized boolean indicating if the value is positive (example).
   */` : ""}
  import { useState, useEffect, useCallback, useMemo } from 'react';
  
  function ${functionName}(initialValue, options = {}) {
    const { step = 1 } = options;
  
    ${includeComments ? '// --- State ---' : ''}
    const [value, setValue] = useState(initialValue);
  
    ${includeComments ? '// --- Effects (Optional) ---' : ''}
    useEffect(() => {
      ${includeComments ? '// Example: Log when the value changes\n' : ''}
      console.log(\`${stateName} value changed:\`, value);
  
      ${includeComments ? '// Example: Perform an action when value reaches a threshold\n' : ''}
      // if (value > 10) {
      //   console.warn(\`${stateName} value exceeded threshold!\`);
      // }
  
      ${includeComments ? '// Cleanup function (optional)\n' : ''}
      return () => {
        console.log(\`Cleaning up ${stateName} effect for value:\`, value);
      };
    }, [value]); ${includeComments ? '// Re-run effect only when \'value\' changes' : ''}
  
    ${includeComments ? `// --- Memoized Callbacks (using useCallback) ---
    // Ensures these functions have stable identities across re-renders
    // unless their dependencies (like 'step') change.
    // Useful if passed down to memoized child components.
    ` : ''}
    const updateValue = useCallback((newValue) => {
      ${includeComments ? '// Add validation or transformation logic if needed\n' : ''}
      // if (typeof newValue !== 'number') {
      //   console.error('Invalid value passed to updateValue');
      //   return;
      // }
      setValue(newValue);
    }, []); ${includeComments ? '// No dependencies, function identity is stable' : ''}
  
    const increment = useCallback(() => {
      setValue(prevValue => prevValue + step);
    }, [step]); ${includeComments ? '// Dependency: \'step\'' : ''}
  
    const decrement = useCallback(() => {
      setValue(prevValue => prevValue - step);
    }, [step]); ${includeComments ? '// Dependency: \'step\'' : ''}
  
    ${includeComments ? `// --- Memoized Value (using useMemo) ---
    // Example: Calculate a derived value only when dependencies change.
    ` : ''}
    const isPositive = useMemo(() => {
      ${includeComments ? '// Log to see when calculation happens\n' : ''}
      console.log(\`Calculating isPositive for value: \${value}\`);
      return value > 0;
    }, [value]); ${includeComments ? '// Dependency: \'value\'' : ''}
  
  
    ${includeComments ? `// --- Return Value ---
    // Return state and functions as a tuple (array) or an object
    ` : ''}
    return [value, updateValue, increment, decrement, isPositive];
  }
  
  ${includeTests ? `
  // ================== TEST FILE (e.g., ${functionName}.test.js) ==================
  // Using @testing-library/react-hooks
  
  import { renderHook, act } from '@testing-library/react-hooks';
  import ${functionName} from './${functionName}'; // Adjust import path
  
  describe('${functionName} Hook', () => {
    test('should initialize with initialValue', () => {
      const initial = 10;
      const { result } = renderHook(() => ${functionName}(initial));
  
      expect(result.current[0]).toBe(initial); // Check initial state value
    });
  
    test('updateValue should update the state', () => {
      const { result } = renderHook(() => ${functionName}(0));
  
      act(() => {
        result.current[1](5); // Call updateValue
      });
      expect(result.current[0]).toBe(5);
  
      act(() => {
        result.current[1](-2);
      });
      expect(result.current[0]).toBe(-2);
    });
  
    test('increment should increase value by default step (1)', () => {
      const { result } = renderHook(() => ${functionName}(0));
  
      act(() => {
        result.current[2](); // Call increment
      });
      expect(result.current[0]).toBe(1);
  
      act(() => {
        result.current[2]();
      });
      expect(result.current[0]).toBe(2);
    });
  
    test('decrement should decrease value by default step (1)', () => {
      const { result } = renderHook(() => ${functionName}(5));
  
      act(() => {
        result.current[3](); // Call decrement
      });
      expect(result.current[0]).toBe(4);
  
      act(() => {
        result.current[3]();
      });
      expect(result.current[0]).toBe(3);
    });
  
     test('increment should increase value by custom step', () => {
      const customStep = 5;
      const { result } = renderHook(() => ${functionName}(10, { step: customStep }));
  
      act(() => {
        result.current[2](); // Call increment
      });
      expect(result.current[0]).toBe(15);
  
      act(() => {
        result.current[2]();
      });
      expect(result.current[0]).toBe(20);
    });
  
     test('decrement should decrease value by custom step', () => {
      const customStep = 3;
      const { result } = renderHook(() => ${functionName}(10, { step: customStep }));
  
      act(() => {
        result.current[3](); // Call decrement
      });
      expect(result.current[0]).toBe(7);
  
       act(() => {
        result.current[3]();
      });
      expect(result.current[0]).toBe(4);
    });
  
     test('isPositive should reflect the sign of the value', () => {
      const { result, rerender } = renderHook(
          ({ val }) => ${functionName}(val),
          { initialProps: { val: 5 } }
       );
  
      expect(result.current[4]).toBe(true); // isPositive for initial value 5
  
      act(() => { result.current[1](-3); }); // Update value to -3
      rerender({ val: -3 }); // Rerender might be needed depending on hook implementation details
      expect(result.current[4]).toBe(false); // isPositive should be false
  
      act(() => { result.current[1](0); }); // Update value to 0
      rerender({ val: 0 });
      expect(result.current[4]).toBe(false); // isPositive should be false (0 is not > 0)
  
       act(() => { result.current[1](1); }); // Update value to 1
      rerender({ val: 1 });
      expect(result.current[4]).toBe(true); // isPositive should be true
    });
  
    // Add tests for useEffect cleanup if important, or other complex logic
  });
  ` : ""}
  
  export default ${functionName};
  `;
  };