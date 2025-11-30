// utils/presets.js
// Predefined preset templates for quick configuration

/**
 * Collection of preset templates
 */
export const presets = {
    // JavaScript Presets
    'react-functional': {
      language: 'javascript',
      templateType: 'component',
      options: {
        className: 'UserProfile',
        includeComments: true,
        includeTypeInfo: true,
        includeTests: true
      },
      description: 'React Functional Component with PropTypes and tests'
    },
    
    'react-hook': {
      language: 'javascript',
      templateType: 'hook',
      options: {
        functionName: 'useDataFetcher',
        includeComments: true,
        includeTests: true
      },
      description: 'Custom React Hook for data fetching with tests'
    },
    
    'node-api': {
      language: 'javascript',
      templateType: 'api',
      options: {
        apiName: 'getUserData',
        includeComments: true,
        includeTests: true
      },
      description: 'Node.js API endpoint with error handling and tests'
    },
    
    'js-module': {
      language: 'javascript',
      templateType: 'module',
      options: {
        className: 'DataProcessor',
        includeComments: true,
        includeTypeInfo: true
      },
      description: 'ES6 Module with multiple exports and JSDoc'
    },
    
    // TypeScript Presets
    'typescript-interface': {
      language: 'typescript',
      templateType: 'interface',
      options: {
        className: 'UserData',
        includeComments: true
      },
      description: 'TypeScript Interface with properties and method definitions'
    },
    
    'typescript-component': {
      language: 'typescript',
      templateType: 'component',
      options: {
        className: 'DataTable',
        includeComments: true,
        includeTests: true
      },
      description: 'TypeScript React Component with strongly typed props'
    },
    
    'typescript-api': {
      language: 'typescript',
      templateType: 'api',
      options: {
        apiName: 'processData',
        className: 'DataItem',
        includeComments: true,
        includeTests: true
      },
      description: 'TypeScript Express API with typing and tests'
    },
    
    // Python Presets
    'python-fastapi': {
      language: 'python',
      templateType: 'fastapi',
      options: {
        className: 'Product',
        apiName: 'products',
        includeComments: true,
        includeTests: true
      },
      description: 'FastAPI endpoint with Pydantic models and path operations'
    },
    
    'python-class': {
      language: 'python',
      templateType: 'class',
      options: {
        className: 'DataProcessor',
        includeComments: true,
        includeTests: true
      },
      description: 'Python Class with docstrings and unit tests'
    },
    
    'django-views': {
      language: 'python',
      templateType: 'django',
      options: {
        className: 'Product',
        apiName: 'products',
        includeComments: true
      },
      description: 'Django Views with model examples and URL configurations'
    },
    
    // Java Presets
    'spring-controller': {
      language: 'java',
      templateType: 'springcontroller',
      options: {
        className: 'Product',
        apiName: 'products',
        includeComments: true,
        includeTests: true
      },
      description: 'Spring REST Controller with full CRUD operations'
    },
    
    'java-entity': {
      language: 'java',
      templateType: 'entity',
      options: {
        className: 'User',
        includeComments: true,
        includeTests: true
      },
      description: 'JPA Entity with relationships and validation'
    },
    
    // C# Presets
    'aspnet-controller': {
      language: 'csharp',
      templateType: 'controller',
      options: {
        className: 'Product',
        apiName: 'products',
        includeComments: true,
        includeTests: true
      },
      description: 'ASP.NET Core API Controller with dependency injection'
    },
    
    'csharp-model': {
      language: 'csharp',
      templateType: 'model',
      options: {
        className: 'Order',
        includeComments: true,
        includeTests: true
      },
      description: 'C# Entity model with validation attributes'
    }
  };
  
  /**
   * Get a preset by ID
   * @param {string} presetId - The preset ID
   * @returns {object|null} The preset configuration or null if not found
   */
  export const getPreset = (presetId) => {
    return presets[presetId] || null;
  };
  
  /**
   * Get all presets
   * @returns {object} All available presets
   */
  export const getAllPresets = () => {
    return presets;
  };
  
  /**
   * Get presets for a specific language
   * @param {string} language - The programming language
   * @returns {object} Language-specific presets
   */
  export const getPresetsByLanguage = (language) => {
    const result = {};
    
    Object.entries(presets).forEach(([id, preset]) => {
      if (preset.language === language) {
        result[id] = preset;
      }
    });
    
    return result;
  };
  
  /**
   * Get categorized presets for display
   * @returns {object} Presets categorized by language
   */
  export const getCategorizedPresets = () => {
    const categorized = {};
    
    Object.entries(presets).forEach(([id, preset]) => {
      const language = preset.language;
      
      if (!categorized[language]) {
        categorized[language] = [];
      }
      
      categorized[language].push({
        id,
        name: preset.description,
        templateType: preset.templateType
      });
    });
    
    return categorized;
  };