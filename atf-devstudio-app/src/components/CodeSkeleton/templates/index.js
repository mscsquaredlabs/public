// templates/index.js
// Import and export all templates for code skeletons

// Import language-specific templates
//import * as javascriptTemplates from './javascript';
import * as typescriptTemplates from './typescript';
//import * as pythonTemplates from './python';
//import * as javaTemplates from './java';
import * as csharpTemplates from './csharp';
import * as goTemplates from './go';
//import * as phpTemplates from './php';
import * as rubyTemplates from './ruby';
import * as rustTemplates from './rust';
import * as swiftTemplates from './swift';
import javaTemplates           from './java';
import phpTemplates from './php';
import javascriptTemplates from './javascript';
import pythonTemplates from './python';

// Map language IDs to template modules
const templates = {
  'javascript': javascriptTemplates,
  'typescript': typescriptTemplates,
  'python': pythonTemplates,
  'java': javaTemplates,
  'csharp': csharpTemplates,
  'go': goTemplates,
  'php': phpTemplates,
  'ruby': rubyTemplates,
  'rust': rustTemplates,
  'swift': swiftTemplates
};

/**
 * Get template generator function by language and template type
 * @param {string} language - The programming language
 * @param {string} templateType - The template type
 * @param {object} options - Template options
 * @returns {string} Generated code
 */
export const getTemplate = (language, templateType, options = {}) => {
  // Check if the language templates exist
  if (!templates[language]) {
    throw new Error(`Templates for ${language} are not available.`);
  }
  
  // Handle naming inconsistency with underscore suffix
  // For example, 'function' might be implemented as 'function_'
  const templateFunc = templates[language][templateType] || 
                      templates[language][`${templateType}_`];
  
  if (!templateFunc) {
    throw new Error(`Template type '${templateType}' is not available for ${language}.`);
  }
  
  // Generate the template with the provided options
  return templateFunc(options);
};

/**
 * Get all available templates for a specific language
 * @param {string} language - The programming language
 * @returns {object} Map of template types to generator functions
 */
export const getTemplatesByLanguage = (language) => {
  return templates[language] || {};
};

/**
 * Check if a specific template type is available for a language
 * @param {string} language - The programming language
 * @param {string} templateType - The template type
 * @returns {boolean} True if the template is available
 */
export const hasTemplate = (language, templateType) => {
  if (!templates[language]) return false;
  
  // Check both with and without underscore suffix
  return !!(templates[language][templateType] || 
          templates[language][`${templateType}_`]);
};

// Export all template modules
export { 
  javascriptTemplates,
  typescriptTemplates,
  pythonTemplates,
  javaTemplates,
  csharpTemplates,
  goTemplates,
  phpTemplates,
  rubyTemplates,
  rustTemplates,
  swiftTemplates
};