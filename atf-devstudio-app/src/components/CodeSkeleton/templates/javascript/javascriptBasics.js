// templates/javascript/javascriptBasics.js
// Provides skeletons for individual JavaScript code constructs

/**
 * Map of basic JavaScript code snippets keyed by template ID
 * Each function returns a string containing the snippet.
 * @param {object} options
 * @param {boolean} options.includeComments - Whether to include explanatory comments
 * @param {string} options.functionName - Name for functions/methods
 * @param {string} options.className - Name for classes
 */
export const javascriptBasics = {
    ifStatement: ({ includeComments = true } = {}) => `
${includeComments ? '// If statement skeleton\n' : ''}if (condition) {
  // Code to run if condition is true
} else if (otherCondition) {
  // Code to run if otherCondition is true
} else {
  // Code to run if no conditions are true
}`,

    forLoop: ({ includeComments = true } = {}) => `
${includeComments ? '// For loop skeleton (traditional)\n' : ''}for (let i = 0; i < array.length; i++) {
  const element = array[i];
  // Code to run for each element
}`,

    // Add for...of loop which is common in modern JS
    forOfLoop: ({ includeComments = true } = {}) => `
${includeComments ? '// For...of loop skeleton (iterating over values)\n' : ''}for (const item of iterable) {
  // Code to run for each item
}`,

    // Add for...in loop
    forInLoop: ({ includeComments = true } = {}) => `
${includeComments ? '// For...in loop skeleton (iterating over object keys)\n' : ''}for (const key in object) {
  if (Object.hasOwnProperty.call(object, key)) {
    const value = object[key];
    // Code to run for each key/value pair
  }
}`,

    whileLoop: ({ includeComments = true } = {}) => `
${includeComments ? '// While loop skeleton\n' : ''}while (condition) {
  // Code to run as long as condition is true
}`,

    doWhileLoop: ({ includeComments = true } = {}) => `
${includeComments ? '// Do-while loop skeleton\n' : ''}do {
  // Code to run at least once, and then as long as condition is true
} while (condition);`,

    switchCase: ({ includeComments = true } = {}) => `
${includeComments ? '// Switch statement skeleton\n' : ''}switch (expression) {
  case value1:
    // Code to run if expression matches value1
    break;
  case value2:
    // Code to run if expression matches value2
    break;
  default:
    // Code to run if no cases match
}`,

    tryCatch: ({ includeComments = true } = {}) => `
${includeComments ? '// Try-catch skeleton\n' : ''}try {
  // Code that might throw an error
} catch (error) {
  console.error('An error occurred:', error);
  // Error handling code
} finally {
  // Code that runs regardless of whether an error occurred
}`,

    arrowFunction: ({ includeComments = true, functionName = 'myArrowFunction' } = {}) => `
${includeComments ? '// Arrow function skeleton\n' : ''}const ${functionName} = (param1, param2) => {
  // Function body
  return result;
};

${includeComments ? '// Concise arrow function (implicit return)\n' : ''}const concise${functionName.charAt(0).toUpperCase() + functionName.slice(1)} = (param) => param * 2;
`,

    // JS doesn't have enums built-in like Java, but objects are common patterns
    enum: ({ includeComments = true, className = 'Status' } = {}) => `
${includeComments ? `// Enum pattern using a frozen object\n` : ''}const ${className} = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

${includeComments ? `// Usage example:\n// let currentStatus = ${className}.PENDING;\n// if (currentStatus === ${className}.COMPLETED) { ... }\n` : ''}`,

    // Method within a class context
    method: ({ includeComments = true, functionName = 'myMethod' } = {}) => `
  ${includeComments ? `/**
   * Method description
   * @param {any} param - Parameter description
   * @returns {any} Return value description
   */
  ` : ''}${functionName}(param) {
    // Method implementation
    console.log('Executing ${functionName}');
    return param;
  }`,

    // Constructor within a class context
    constructor: ({ includeComments = true } = {}) => `
  ${includeComments ? `/**
   * Class constructor
   * @param {object} options - Initialization options
   */
  ` : ''}constructor(options = {}) {
    ${includeComments ? '// Initialize properties\n' : ''}this.config = options.config || {};
    this.state = 'initialized';
  }`,

    importStatement: ({ includeComments = true } = {}) => `
${includeComments ? '// Import statement skeleton (ES6)\n' : ''}import defaultExport from 'module-name';
import * as name from 'module-name';
import { export1 } from 'module-name';
import { export1 as alias1 } from 'module-name';
import { export1 , export2 } from 'module-name';
import 'module-name'; // For side effects

${includeComments ? '// CommonJS require (Node.js)\n// const myModule = require(\'module-name\');\n' : ''}`,

    commentBlock: ({ includeComments = true } = {}) => `
${includeComments ? `/**
 * JSDoc style comment block
 *
 * @param {string} paramName Description
 * @returns {number} Description
 */` : ''}/*
 * Multi-line comment block
 */
// Single-line comment`,
};