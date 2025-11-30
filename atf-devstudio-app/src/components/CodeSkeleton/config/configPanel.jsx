// src/components/CodeSkeleton/config/configPanel.js
import { createRoot } from 'react-dom/client';
import CodeSkeletonConfig from '../CodeSkeletonConfig';

// Template presets for quick configuration
const presetTemplates = [
  {
    id: 'component',
    name: 'React Component',
    description: 'A functional React component with state and props',
    language: 'javascript',
    category: 'frontend',
    options: {
      includeComments: true,
      includeTests: true,
      className: 'MyComponent'
    }
  },
  {
    id: 'hook',
    name: 'React Custom Hook',
    description: 'A custom React hook for state management',
    language: 'javascript',
    category: 'frontend',
    options: {
      includeComments: true,
      includeTests: false,
      functionName: 'useCustomHook'
    }
  },
  {
    id: 'function',
    name: 'JavaScript Utility Function',
    description: 'A pure JavaScript utility function',
    language: 'javascript',
    category: 'utility',
    options: {
      includeComments: true,
      includeTests: true,
      functionName: 'formatData'
    }
  },
  {
    id: 'api',
    name: 'Express API Endpoint',
    description: 'An Express.js API endpoint handler',
    language: 'javascript',
    category: 'backend',
    options: {
      includeComments: true,
      includeTests: true,
      apiName: 'getUserData'
    }
  },
  {
    id: 'class',
    name: 'TypeScript Class',
    description: 'A TypeScript class with full type definitions',
    language: 'typescript',
    category: 'backend',
    options: {
      includeComments: true,
      includeTests: true,
      includeTypeInfo: true,
      className: 'DataService'
    }
  },
  {
    id: 'controller',
    name: 'Java Spring Controller',
    description: 'A Java Spring REST controller',
    language: 'java',
    category: 'backend',
    options: {
      includeComments: true,
      includeTests: true,
      className: 'UserController',
      packageName: 'com.example.api.controllers'
    }
  },
  {
    id: 'class',
    name: 'C# Service Class',
    description: 'A C# service class with dependency injection',
    language: 'csharp',
    category: 'backend',
    options: {
      includeComments: true,
      includeTests: true,
      className: 'UserService',
      namespace: 'MyApp.Services'
    }
  }
];

/**
 * Sets up the configuration panel for the Code Skeleton tool
 * 
 * @param {HTMLElement} container - DOM element to render the config panel in
 * @param {Object} state - Current application state
 * @param {Function} setLanguage - Function to update language
 * @param {Function} setTemplateType - Function to update template type
 * @param {Function} setOptions - Function to update options
 * @param {Function} setConfigMode - Function to update config mode
 * @returns {Function} - Cleanup function to unmount panel
 */
export const setupConfigPanel = (
  container,
  { language, templateType, options, configMode },
  setLanguage,
  setTemplateType,
  setOptions,
  setConfigMode
) => {
  // Create a React root in the container
  const root = createRoot(container);
  
  // Render the CodeSkeletonConfig component
  root.render(
    <CodeSkeletonConfig
      configMode={configMode}
      setConfigMode={setConfigMode}
      language={language}
      setLanguage={setLanguage}
      templateType={templateType}
      setTemplateType={setTemplateType}
      options={options}
      setOptions={setOptions}
      presetTemplates={presetTemplates}
    />
  );
  
  // Return cleanup function
  return () => {
    root.unmount();
  };
};

/**
 * Get recommended options for a given language and template type
 * 
 * @param {string} language - Programming language
 * @param {string} templateType - Template type
 * @returns {Object} - Recommended options
 */
export const getRecommendedOptions = (language, templateType) => {
  // Find a matching preset
  const preset = presetTemplates.find(
    t => t.language === language && t.id === templateType
  );
  
  if (preset && preset.options) {
    return preset.options;
  }
  
  // Default options if no preset is found
  return {
    includeComments: true,
    includeTests: language !== 'python', // Python tests are more complex
    includeTypeInfo: language === 'typescript',
    className: templateType === 'component' ? 'MyComponent' : 'MyClass',
    functionName: templateType === 'hook' ? 'useMyHook' : 'myFunction',
    apiName: 'myApi',
    packageName: 'com.example.myapp',
    namespace: 'MyApp'
  };
};