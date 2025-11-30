// utils/codeGeneration.js
// Utilities for code generation and processing

import { getTemplatesByLanguage, getTemplate } from '../templates';
import { escapeHtml, getSyntaxHighlightClass, getLanguageName, getTemplateName } from './languageUtils';

/**
 * Generate code based on selected options
 * @param {string} language - Selected language
 * @param {string} templateType - Selected template type
 * @param {object} options - Configuration options
 * @returns {string} Generated code
 */
export const generateCode = (language, templateType, options) => {
  try {
    return getTemplate(language, templateType, options);
  } catch (error) {
    console.error('Error generating code:', error);
    throw new Error(`Failed to generate code: ${error.message}`);
  }
};

/**
 * Format the generated code for display in results area
 * @param {string} code - The generated code
 * @param {string} language - The programming language
 * @param {string} templateType - The template type
 * @returns {string} Formatted HTML content for display
 */
export const formatCodeForDisplay = (code, language, templateType) => {
  if (!code) return '';
  
  const escapedCode = escapeHtml(code);
  const syntaxClass = getSyntaxHighlightClass(language);
  
  return `<pre class="formatted-code ${syntaxClass}">${escapedCode}</pre>`;
};

/**
 * Copy code to clipboard
 * @param {string} code - The code to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (code) => {
  if (!code) return false;
  
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Convert template options for a specific language
 * Some templates might need different default options
 * @param {string} language - Selected language
 * @param {string} templateType - Selected template type 
 * @param {object} baseOptions - Base configuration options
 * @returns {object} Converted options
 */
export const convertOptionsForTemplate = (language, templateType, baseOptions) => {
  const options = { ...baseOptions };
  
  // Special case for TypeScript - ensure type info is included
  if (language === 'typescript') {
    options.includeTypeInfo = true;
  }
  
  // Special case for Python docstrings
  if (language === 'python' && options.includeComments) {
    options.includeDocstrings = true;
  }
  
  // Adjust options for specific template types
  if (templateType === 'api' || 
      templateType === 'controller' || 
      templateType === 'springcontroller' ||
      templateType === 'fastapi' ||
      templateType === 'flask') {
    options.generateHandlers = true;
  }
  
  return options;
};

/**
 * Get an appropriate filename for the generated code
 * @param {string} language - Selected language
 * @param {string} templateType - Selected template type
 * @param {object} options - Configuration options
 * @returns {string} Appropriate filename with extension
 */
export const getFilename = (language, templateType, options) => {
  const extensions = {
    javascript: '.js',
    typescript: '.ts',
    python: '.py',
    java: '.java',
    csharp: '.cs',
    go: '.go',
    php: '.php',
    ruby: '.rb',
    rust: '.rs',
    swift: '.swift'
  };
  
  // Get the appropriate name based on template type
  let baseName = '';
  
  if (templateType === 'component') {
    baseName = options.className || 'Component';
    
    // Special case for React components
    if (language === 'javascript') {
      return `${baseName}${extensions[language]}`;
    } else if (language === 'typescript') {
      return `${baseName}.tsx`;
    }
  } else if (templateType === 'function' || templateType === 'hook') {
    baseName = options.functionName || 'function';
  } else if (templateType === 'api' || 
             templateType === 'controller' || 
             templateType === 'springcontroller') {
    baseName = options.apiName ? `${options.apiName.charAt(0).toUpperCase() + options.apiName.slice(1)}Controller` : 'ApiController';
  } else if (templateType === 'class' || 
             templateType === 'interface' ||
             templateType === 'type' ||
             templateType === 'model' ||
             templateType === 'entity') {
    baseName = options.className || 'Class';
  } else {
    baseName = options.className || 'Code';
  }
  
  return `${baseName}${extensions[language] || '.txt'}`;
};

/**
 * Generate formatted results from code
 * @param {string} code - The generated code
 * @param {string} language - The programming language
 * @param {string} templateType - The template type
 * @returns {object} Results object to update UI
 */
export const generateResults = (code, language, templateType) => {
  if (!code) {
    return {
      status: 'warning',
      message: 'No Code Generated',
      details: 'Please select options and try again.',
      content: ''
    };
  }
  
  const languageName = getLanguageName(language);
  const templateName = getTemplateName(language, templateType);
  
  return {
    status: 'success',
    message: 'Code Generated Successfully',
    details: `${languageName} ${templateName}`,
    content: formatCodeForDisplay(code, language, templateType)
  };
};
