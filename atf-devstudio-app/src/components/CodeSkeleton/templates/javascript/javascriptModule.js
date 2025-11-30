// templates/javascript/javascriptModule.js
// JavaScript ES6 Module Template

export const jsModule = (options) => { // Renamed to jsModule
    const {
      includeComments = true,
      // includeTypeInfo = true, // Use JSDoc for type info
      // className = 'MyModule', // Less relevant for modules, use function/variable names
      functionName = 'utilityFunction'
    } = options;
  
    return `${includeComments ? `/**
   * @module MyUtilityModule
   * Provides a collection of utility functions for [specific purpose].
   * Demonstrates various export patterns in ES6 modules.
   */
  ` : ""}
  
  ${includeComments ? '// --- Named Exports ---' : ''}
  
  ${includeComments ? `/**
   * A constant value exported from the module.
   * @type {string}
   */` : ""}
  export const MODULE_VERSION = '1.0.0';
  
  ${includeComments ? `/**
   * ${functionName}
   * Performs a specific utility task.
   * @param {number} a - First number.
   * @param {number} b - Second number.
   * @returns {number} The sum of a and b.
   */` : ""}
  export function ${functionName}(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      console.warn('${functionName}: Both inputs should be numbers.');
      return 0; // Or throw error
    }
    return a + b;
  }
  
  ${includeComments ? `/**
   * Another utility function example.
   * @param {string} text - Text to process.
   * @returns {string} The processed text.
   */` : ""}
  const processTextInternal = (text) => {
    return \`Processed: \${text.trim().toUpperCase()}\`;
  };
  // Export an existing constant/function
  export { processTextInternal as processText };
  
  ${includeComments ? `/**
   * An asynchronous function example.
   * @param {number} delay - Milliseconds to wait.
   * @returns {Promise<string>} A message after the delay.
   */` : ""}
  export const waitAndReturn = async (delay = 100) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(\`Waited for \${delay}ms\`);
      }, delay);
    });
  };
  
  
  ${includeComments ? '// --- Default Export (Optional - only one per module) ---' : ''}
  ${includeComments ? `/**
   * Default export - can be a function, class, or object.
   * Often used for the primary export of the module.
   *
   * @param {object} config - Configuration for the default functionality.
   * @returns {object} An object containing module info and utilities.
   */` : ""}
  // const defaultModuleObject = {
  //   version: MODULE_VERSION,
  //   mainUtility: ${functionName},
  //   textProcessor: processText,
  //   asyncWaiter: waitAndReturn,
  //   initialize: (config = {}) => {
  //     console.log('Default module object initialized with config:', config);
  //     return true;
  //   }
  // };
  // export default defaultModuleObject;
  
  // Or default export a function directly:
  // export default function initializeModule(config = {}) {
  //   console.log('Module initialized via default function export:', config);
  //   return { MODULE_VERSION, ${functionName}, processText };
  // }
  
  // Or default export a class:
  // export default class ModuleManager {
  //   constructor() { ... }
  //   getVersion() { return MODULE_VERSION; }
  // }
  
  ${includeComments ? `
  // --- Usage Example (in another file) ---
  // import defaultThing, { MODULE_VERSION, utilityFunction, processText, waitAndReturn } from './myUtilityModule';
  //
  // console.log(MODULE_VERSION); // -> 1.0.0
  // console.log(utilityFunction(5, 3)); // -> 8
  // console.log(processText('  some text  ')); // -> Processed: SOME TEXT
  //
  // waitAndReturn(500).then(msg => console.log(msg));
  //
  // if (defaultThing) {
  //   defaultThing.initialize?.({ setting: true }); // Call initialize if it exists
  //   console.log(defaultThing.version); // Access properties if default export is object
  // }
  ` : ""}
  `;
  };