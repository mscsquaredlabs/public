// utils/languageUtils.js
// Utility functions for language selection and processing

/**
 * Available programming languages
 */
export const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'rust', name: 'Rust' },
  { id: 'swift', name: 'Swift' }
];

/**
 * Get language name from ID
 * @param {string} langId - The language ID
 * @returns {string} The language name
 */
export const getLanguageName = (langId) => {
  const lang = languages.find(l => l.id === langId);
  return lang ? lang.name : langId;
};

// --- Template Definitions ---

/**
 * Common high-level use case templates.
 */
const commonUseCaseTemplates = [
  { id: 'function', name: 'Function' }, // Note: Java doesn't have standalone functions
  { id: 'class',    name: 'Class' },
  { id: 'api',      name: 'API Endpoint' },
  { id: 'crud',     name: 'CRUD Operations' },
  { id: 'test',     name: 'Test Suite' }
];

/**
 * Common basic programming constructs found in many languages.
 */
const commonBasicConstructs = [
    { id: 'interface',    name: 'Interface' }, // Common but not universal syntax (e.g., Python duck typing)
    { id: 'enum',         name: 'Enum' }, // Common concept, syntax varies
    { id: 'method',       name: 'Method' }, // Often within a class context
    { id: 'constructor',  name: 'Constructor' }, // Often within a class context
    { id: 'forLoop',      name: 'For Loop' },
    { id: 'whileLoop',    name: 'While Loop' },
    { id: 'doWhileLoop',  name: 'Do-While Loop' },
    { id: 'ifStatement',  name: 'If Statement' },
    { id: 'switchCase',   name: 'Switch Statement' }, // Syntax/availability varies (e.g., Python match)
    { id: 'tryCatch',     name: 'Try-Catch Block' }, // Python uses try-except
    { id: 'commentBlock', name: 'Comment Block' },
    { id: 'importStatement', name: 'Import/Include Statement' }, // Covers import, require, use etc.
];

/**
 * Templates specific to certain languages or frameworks.
 */
const languageSpecificTemplates = {
  javascript: [
    { id: 'component', name: 'React Component' },
    { id: 'hook',      name: 'React Hook' },
    { id: 'module',    name: 'ES6 Module' },
    { id: 'arrowFunction', name: 'Arrow Function' },
    // Added JS loops from basics for explicit listing if needed, but they are common
    { id: 'forOfLoop', name: 'For...of Loop'},
    { id: 'forInLoop', name: 'For...in Loop'},
  ],
  typescript: [
    { id: 'component', name: 'React Component' },
    { id: 'hook',      name: 'React Hook' },
    // 'interface' is now common
    { id: 'type',      name: 'Type Definition' },
    { id: 'arrowFunction', name: 'Arrow Function' },
  ],
  java: [
    { id: 'springcontroller', name: 'Spring Controller' },
    { id: 'entity',           name: 'JPA Entity' },
    { id: 'basics',           name: 'Java Basics Class' }, // Renamed for clarity
    // 'interface', 'class', 'method', 'constructor', 'enum', loops, conditional, try-catch are common
    { id: 'annotation',       name: 'Annotation' },
    { id: 'staticBlock',      name: 'Static Initializer Block' },
    { id: 'synchronizedBlock', name: 'Synchronized Block' },
    { id: 'packageDeclaration', name: 'Package Declaration' },
    // 'importStatement' is now common
  ],
  python: [
    // Framework-specific
    { id: 'fastapi', name: 'FastAPI Endpoint' },
    { id: 'flask',   name: 'Flask Route' },
    { id: 'django',  name: 'Django View' },
    // Python-specific / Basic Constructs
    { id: 'script', name: 'Standalone Script' },
    { id: 'listComprehension', name: 'List Comprehension' },
    { id: 'dictComprehension', name: 'Dictionary Comprehension' },
    { id: 'tryExcept', name: 'Try/Except Block'}, // Python's version of try/catch
    // Note: 'function', 'class' are covered by commonUseCaseTemplates
    // Note: 'ifStatement', 'forLoop', 'whileLoop', 'enum' (stdlib), 'method', 'constructor' (__init__), 'importStatement', 'commentBlock' are covered by commonBasicConstructs conceptually
  ],
  csharp: [
    { id: 'controller', name: 'ASP.NET Controller' },
    { id: 'model',      name: 'Entity Model' },
    // 'class', 'interface', 'enum', 'method', 'constructor', loops, conditional, try-catch are common
  ],
  go: [
    { id: 'handler', name: 'HTTP Handler' },
    { id: 'struct',  name: 'Struct Definition' },
    // Go uses 'func' for functions/methods. 'interface' exists. No 'class', 'enum', 'tryCatch' keywords.
    // Loops: only 'for'. Conditionals: 'if', 'switch'.
  ],
  php: [
    { id: 'controller', name: 'Laravel Controller' },
    { id: 'model',      name: 'Eloquent Model' },
    { id: 'trait',      name: 'Trait' },
    { id: 'foreachLoop', name: 'Foreach Loop' }, // Specific loop construct
    { id: 'namespaceDeclaration', name: 'Namespace Declaration' },
    // 'useStatement' covered by common 'importStatement'
    { id: 'phpDocBlock', name: 'PHPDoc Block' },
    { id: 'closure',     name: 'Closure' },
    { id: 'arrowFunction', name: 'Arrow Function (Short Closure)' },
    // 'interface', 'class', 'function', 'method', 'constructor', loops, conditional, try-catch are common
  ],
  ruby: [
    { id: 'controller', name: 'Rails Controller' },
    { id: 'model',      name: 'ActiveRecord Model' },
    { id: 'module',     name: 'Module' }, // Ruby's mixin construct
    // 'class', 'def'(method/function), loops (each, while, etc.), conditional (if, case), begin-rescue (try-catch) are common concepts
  ],
  rust: [
    { id: 'struct', name: 'Struct' },
    { id: 'trait',  name: 'Trait' }, // Similar to interfaces
    { id: 'impl',   name: 'Implementation Block (impl)' },
    // 'fn'(function/method), 'enum', loops, 'match'(switch), 'if', error handling (Result/panic) are common concepts
  ],
  swift: [
    { id: 'viewcontroller', name: 'UIViewController' },
    { id: 'swiftui',      name: 'SwiftUI View' },
    { id: 'protocol',     name: 'Protocol' }, // Swift's interface equivalent
    { id: 'extension',    name: 'Extension' },
    // 'class', 'struct', 'enum', 'func'(function/method), loops, 'if', 'switch', 'do-catch'(try-catch) are common concepts
  ]
};


/**
 * Get template types based on selected language
 * Combines common use cases, common basic constructs, and language-specific ones.
 * @param {string} language - The selected language ID (e.g., 'javascript', 'java')
 * @returns {Array<{id: string, name: string}>} Array of template options
 */
export const getTemplateTypes = (language) => {
  // Start with common templates
  let combinedTemplates = [
    ...commonUseCaseTemplates,
    ...commonBasicConstructs,
    ...(languageSpecificTemplates[language] || [])
  ];

  // --- Language Specific Adjustments ---

  // 1. Java: Remove standalone 'function' as it's not valid. Methods exist within classes.
  if (language === 'java') {
    combinedTemplates = combinedTemplates.filter(t => t.id !== 'function');
  }

  // 2. Go: Doesn't have traditional try-catch, classes, or enums (though iota can be used).
  //    Let's remove constructs not directly applicable.
  if (language === 'go') {
      combinedTemplates = combinedTemplates.filter(t => t.id !== 'tryCatch' && t.id !== 'class' && t.id !== 'enum' && t.id !== 'doWhileLoop');
  }

  // 3. Python: Doesn't use 'interface' keyword (duck typing). No do-while loop. Uses try-except.
  if (language === 'python') {
      combinedTemplates = combinedTemplates.filter(t => t.id !== 'interface' && t.id !== 'doWhileLoop');
      // Remove generic 'tryCatch' if specific 'tryExcept' is listed
      if (languageSpecificTemplates.python.some(t => t.id === 'tryExcept')) {
          combinedTemplates = combinedTemplates.filter(t => t.id !== 'tryCatch');
      }
       // Remove generic 'switchCase' as Python uses if/elif or match (3.10+)
       combinedTemplates = combinedTemplates.filter(t => t.id !== 'switchCase');
  }

  // 4. Ruby: No interface keyword, no do-while, uses begin-rescue not try-catch keywords. Uses 'case'.
  if (language === 'ruby') {
      combinedTemplates = combinedTemplates.filter(t => t.id !== 'interface' && t.id !== 'doWhileLoop' && t.id !== 'tryCatch' && t.id !== 'switchCase'); // uses 'case'
  }

  // 5. Rust: Uses Result/panic, not try-catch keywords. No do-while. Uses 'match' not 'switch'. No class keyword. Uses 'trait'.
  if (language === 'rust') {
      combinedTemplates = combinedTemplates.filter(t => t.id !== 'tryCatch' && t.id !== 'doWhileLoop' && t.id !== 'switchCase' && t.id !== 'class' && t.id !== 'interface');
  }

   // 6. Swift: Uses 'protocol', not 'interface'. Uses 'do-catch', not 'try-catch'.
  if (language === 'swift') {
      combinedTemplates = combinedTemplates.filter(t => t.id !== 'interface' && t.id !== 'tryCatch');
  }


  // Remove duplicates (preferring the last occurrence, which would be language-specific if ID clashes)
  const uniqueTemplates = combinedTemplates.reduceRight((acc, current) => {
      if (!acc.some(item => item.id === current.id)) {
          acc.push(current);
      }
      return acc;
  }, []).reverse(); // Reverse to maintain original-like order

  // Sort alphabetically by name for consistent display
  uniqueTemplates.sort((a, b) => a.name.localeCompare(b.name));


  return uniqueTemplates;
};

/**
 * Get template name from ID
 * @param {string} language - The selected language
 * @param {string} templateId - The template ID
 * @returns {string} The template name
 */
export const getTemplateName = (language, templateId) => {
  const template = getTemplateTypes(language).find(t => t.id === templateId);
  return template ? template.name : templateId;
};

/**
 * Get the appropriate name property (e.g., Class Name, Function Name) based on template type.
 * This helps decide which user input field ('className', 'functionName', etc.) is most relevant.
 * @param {string} templateType - The template type ID (e.g., 'class', 'function')
 * @param {object} options - The options object containing potential names
 * @returns {string} The appropriate name to use
 */
export const getProperName = (templateType, options) => {
  const {
    className    = 'MyClass',       // Default for class-like structures
    functionName = 'myFunction',  // Default for function-like structures
    apiName      = 'myApi',       // Default for API/endpoint structures
    variableName = 'myVariable',  // Default for simple variables/structs? (Less common need)
    moduleName   = 'myModule',    // Default for modules/namespaces
    scriptName   = 'myScript'     // Default for scripts
  } = options || {}; // Added safety default

  // Map template types to the most appropriate name category
  const classLike = ['class', 'component', 'interface', 'type', 'entity', 'model', 'struct', 'viewcontroller', 'swiftui', 'basics', 'annotation', 'protocol', 'enum', 'trait', 'impl'];
  const functionLike = ['function', 'hook', 'method', 'constructor', 'closure', 'arrowFunction', 'handler']; // Added handler
  const apiLike = ['api', 'springcontroller', 'controller', 'fastapi', 'flask', 'django', 'crud'];
  const moduleLike = ['module', 'packageDeclaration', 'namespaceDeclaration', 'importStatement'];
  const scriptLike = ['script']; // Added script

  if (classLike.includes(templateType)) {
    return className;
  } else if (functionLike.includes(templateType)) {
    return functionName;
  } else if (apiLike.includes(templateType)) {
    return apiName;
  } else if (moduleLike.includes(templateType)) {
    // Module/namespace related might use moduleName or className depending on context
    return moduleName;
  } else if (scriptLike.includes(templateType)) { // Handle script name
     return scriptName;
  }

  // Fallback for loops, conditionals, basic constructs etc., which don't have a primary identifier name
  // Returning a generic name might be acceptable.
  return functionName; // Defaulting to functionName might be slightly better than className for generic constructs
};


/**
 * Get file extension for language
 * @param {string} language - The programming language ID
 * @returns {string} The file extension
 */
export const getFileExtension = (language) => {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    java:       'java',
    python:     'py',
    csharp:     'cs',
    go:         'go',
    php:        'php',
    ruby:       'rb',
    rust:       'rs',
    swift:      'swift'
  };

  return extensions[language] || 'txt';
};

/**
 * Get appropriate syntax highlighting class for libraries like Prism or highlight.js
 * @param {string} language - The programming language ID
 * @returns {string} The syntax highlighting class
 */
export const getSyntaxHighlightClass = (language) => {
  // Ensure mapping matches the library's conventions (e.g., 'language-xxx' or just 'xxx')
  const syntaxMap = {
    javascript: 'language-javascript',
    typescript: 'language-typescript',
    java:       'language-java',
    python:     'language-python',
    csharp:     'language-csharp', // Often 'cs' or 'dotnet' in libraries
    go:         'language-go',
    php:        'language-php',
    ruby:       'language-ruby',
    rust:       'language-rust',
    swift:      'language-swift'
  };

  // Check common aliases if the primary doesn't map directly in your chosen highlighter
  if (language === 'csharp' && !syntaxMap[language]) return 'language-csharp' || 'language-cs'; // Example fallback

  return syntaxMap[language] || 'language-plaintext';
};

/**
 * Escape HTML characters to prevent XSS when displaying code or text in HTML.
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return text; // Handle non-string inputs gracefully
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};