/**
 * utils/codeGeneration.js
 * -----------------------
 * Utilities for generating and formatting code skeletons
 */

import { getLanguageName, getTemplateName } from './languageUtils';

/**
 * Format the generated code with proper syntax highlighting for display
 * @param {string} code - The generated code
 * @param {string} language - The programming language
 * @param {string} templateType - The template type
 * @returns {string} HTML-formatted code with syntax highlighting
 */
export const formatCodeForDisplay = (code, language, templateType) => {
  // Escape HTML characters for safe display
  const escapedCode = escapeHtml(code);
  
  // Return formatted code in a pre element with language class
  return `<pre class="formatted-code language-${language}">${escapedCode}</pre>`;
};

/**
 * Helper function to escape HTML characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
const escapeHtml = (str = '') =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

/**
 * Copy generated code to clipboard
 * @param {string} code - The code to copy
 * @returns {Promise<boolean>} Promise resolving to true if successful, false otherwise
 */
export const copyToClipboard = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (err) {
    console.error('Failed to copy code to clipboard:', err);
    return false;
  }
};

/**
 * Generate code based on language, template type, and options
 * @param {string} language - The programming language
 * @param {string} templateType - The template type
 * @param {Object} options - Options for code generation
 * @returns {string} Generated code skeleton
 */
export const generateCode = (language, templateType, options) => {
  // Get template generator function based on language and template type
  const templateGenerator = getTemplateGenerator(language, templateType);
  
  if (!templateGenerator) {
    throw new Error(`No template generator found for ${getLanguageName(language)} ${getTemplateName(language, templateType)}`);
  }
  
  // Generate the code using the template generator
  return templateGenerator(options);
};

/**
 * Get the appropriate template generator function
 * @param {string} language - The programming language
 * @param {string} templateType - The template type
 * @returns {Function|null} Template generator function or null if not found
 */
const getTemplateGenerator = (language, templateType) => {
  // Create a key for the template generator map
  const key = `${language}_${templateType}`;
  
  // Return the appropriate generator function or null if not found
  return templateGenerators[key] || null;
};

/**
 * Map of template generators for different language and template combinations
 */
const templateGenerators = {
  // JavaScript template generators
  javascript_function: (options) => generateJavaScriptFunction(options),
  javascript_component: (options) => generateJavaScriptReactComponent(options),
  javascript_hook: (options) => generateJavaScriptReactHook(options),
  javascript_class: (options) => generateJavaScriptClass(options),
  javascript_module: (options) => generateJavaScriptModule(options),
  javascript_api: (options) => generateJavaScriptApiEndpoint(options),
  
  // TypeScript template generators
  typescript_function: (options) => generateTypeScriptFunction(options),
  typescript_component: (options) => generateTypeScriptReactComponent(options),
  typescript_hook: (options) => generateTypeScriptReactHook(options),
  typescript_class: (options) => generateTypeScriptClass(options),
  typescript_interface: (options) => generateTypeScriptInterface(options),
  typescript_type: (options) => generateTypeScriptType(options),
  typescript_module: (options) => generateTypeScriptModule(options),
  typescript_api: (options) => generateTypeScriptApiEndpoint(options),
  
  // Java template generators
  java_class: (options) => generateJavaClass(options),
  java_interface: (options) => generateJavaInterface(options),
  java_controller: (options) => generateJavaController(options),
  java_service: (options) => generateJavaService(options),
  java_repository: (options) => generateJavaRepository(options),
  java_model: (options) => generateJavaModel(options),
  
  // Python template generators
  python_function: (options) => generatePythonFunction(options),
  python_class: (options) => generatePythonClass(options),
  python_module: (options) => generatePythonModule(options),
  python_flask: (options) => generatePythonFlaskEndpoint(options),
  python_fastapi: (options) => generatePythonFastApiEndpoint(options),
  python_django: (options) => generatePythonDjangoView(options),
  
  // C# template generators
  csharp_class: (options) => generateCSharpClass(options),
  csharp_interface: (options) => generateCSharpInterface(options),
  csharp_controller: (options) => generateCSharpController(options),
  csharp_service: (options) => generateCSharpService(options),
  csharp_model: (options) => generateCSharpModel(options),
  
  // Add export statement
  code += `\n`;
  code += `export default ${functionName};\n`;
  
  // Add tests if required
  if (includeTests) {
    code += `\n`;
    code += `// Example test\n`;
    code += `if (require.main === module) {\n`;
    code += `  console.log('Testing ${functionName}...');\n`;
    code += `  const result = ${functionName}('test');\n`;
    code += `  console.log('Result:', result);\n`;
    code += `}\n`;
  }
  
  return code;
};

const generateTypeScriptReactComponent = (options) => {
  const { className, includeComments, includeTypeInfo, authorName } = options;
  
  let code = '';
  
  // Add imports
  code += `import React, { useState } from 'react';\n`;
  code += `\n`;
  
  // Add TypeScript interface for props
  if (includeTypeInfo) {
    code += `interface ${className}Props {\n`;
    code += `  title?: string;\n`;
    code += `  subtitle?: string;\n`;
    code += `  onAction?: () => void;\n`;
    code += `}\n`;
    code += `\n`;
  }
  
  // Add header comment
  if (includeComments) {
    code += `/**\n`;
    code += ` * ${className} Component\n`;
    if (authorName) code += ` * @author ${authorName}\n`;
    code += ` * @description A React component that displays content\n`;
    code += ` */\n`;
  }
  
  // Generate component
  if (includeTypeInfo) {
    code += `const ${className}: React.FC<${className}Props> = ({ title, subtitle, onAction }) => {\n`;
  } else {
    code += `const ${className} = (props: any) => {\n`;
    code += `  const { title, subtitle, onAction } = props;\n`;
  }
  
  code += `  const [count, setCount] = useState<number>(0);\n`;
  code += `\n`;
  code += `  const handleClick = (): void => {\n`;
  code += `    setCount(prevCount => prevCount + 1);\n`;
  code += `    if (onAction) {\n`;
  code += `      onAction();\n`;
  code += `    }\n`;
  code += `  };\n`;
  code += `\n`;
  code += `  return (\n`;
  code += `    <div className="${className.toLowerCase()}-container">\n`;
  code += `      <h2>{title}</h2>\n`;
  code += `      {subtitle && <h3>{subtitle}</h3>}\n`;
  code += `      <p>Count: {count}</p>\n`;
  code += `      <button onClick={handleClick}>Increment</button>\n`;
  code += `    </div>\n`;
  code += `  );\n`;
  code += `};\n`;
  
  // Add default props
  code += `\n`;
  code += `${className}.defaultProps = {\n`;
  code += `  title: 'Default Title'\n`;
  code += `};\n`;
  
  // Add export statement
  code += `\n`;
  code += `export default ${className};\n`;
  
  return code;
};

const generateJavaScriptClass = (options) => {
  const { className, includeComments, includeTypeInfo, includeTests, authorName } = options;
  
  let code = '';
  
  // Add header comment
  if (includeComments) {
    code += `/**\n`;
    code += ` * ${className} Class\n`;
    if (authorName) code += ` * @author ${authorName}\n`;
    code += ` * @description A class that encapsulates related functionality\n`;
    code += ` */\n`;
  }
  
  // Generate class
  code += `class ${className} {\n`;
  
  // Add constructor
  if (includeComments) {
    code += `  /**\n`;
    code += `   * Constructor for ${className}\n`;
    code += `   */\n`;
  }
  code += `  constructor(config) {\n`;
  code += `    this.config = config || {};\n`;
  code += `    this.initialized = false;\n`;
  code += `  }\n`;
  code += `\n`;
  
  // Add methods
  if (includeComments) {
    code += `  /**\n`;
    code += `   * Initialize the instance\n`;
    code += `   */\n`;
  }
  code += `  initialize() {\n`;
  code += `    if (this.initialized) {\n`;
  code += `      return false;\n`;
  code += `    }\n`;
  code += `    \n`;
  code += `    // Initialization logic here\n`;
  code += `    this.initialized = true;\n`;
  code += `    return true;\n`;
  code += `  }\n`;
  code += `\n`;
  
  if (includeComments) {
    code += `  /**\n`;
    code += `   * Process data\n`;
    if (includeTypeInfo) {
      code += `   * @param {any} data - Data to process\n`;
      code += `   * @returns {any} - Processed data\n`;
    }
    code += `   */\n`;
  }
  code += `  process(data) {\n`;
  code += `    if (!this.initialized) {\n`;
  code += `      throw new Error('Class not initialized');\n`;
  code += `    }\n`;
  code += `    \n`;
  code += `    // Processing logic here\n`;
  code += `    return data;\n`;
  code += `  }\n`;
  
  code += `}\n`;
  
  // Add export statement
  code += `\n`;
  code += `export default ${className};\n`;
  
  // Add tests if required
  if (includeTests) {
    code += `\n`;
    code += `// Example test\n`;
    code += `if (require.main === module) {\n`;
    code += `  console.log('Testing ${className}...');\n`;
    code += `  const instance = new ${className}();\n`;
    code += `  instance.initialize();\n`;
    code += `  const result = instance.process('test');\n`;
    code += `  console.log('Result:', result);\n`;
    code += `}\n`;
  }
  
  return code;
};

// Java Template Generators

const generateJavaClass = (options) => {
  const { className, packageName, includeComments, includeTests, authorName } = options;
  
  let code = '';
  
  // Add package statement
  if (packageName) {
    code += `package ${packageName};\n\n`;
  }
  
  // Add imports
  code += `import java.util.Objects;\n`;
  code += `import java.util.logging.Logger;\n\n`;
  
  // Add header comment
  if (includeComments) {
    code += `/**\n`;
    code += ` * ${className} Class\n`;
    if (authorName) code += ` * @author ${authorName}\n`;
    code += ` * @description A class that encapsulates related functionality\n`;
    code += ` */\n`;
  }
  
  // Generate class
  code += `public class ${className} {\n\n`;
  
  // Add logger
  code += `    private static final Logger logger = Logger.getLogger(${className}.class.getName());\n\n`;
  
  // Add fields
  code += `    private String id;\n`;
  code += `    private boolean initialized;\n\n`;
  
  // Add constructor
  if (includeComments) {
    code += `    /**\n`;
    code += `     * Default constructor\n`;
    code += `     */\n`;
  }
  code += `    public ${className}() {\n`;
  code += `        this.initialized = false;\n`;
  code += `    }\n\n`;
  
  if (includeComments) {
    code += `    /**\n`;
    code += `     * Constructor with ID\n`;
    code += `     * @param id Unique identifier\n`;
    code += `     */\n`;
  }
  code += `    public ${className}(String id) {\n`;
  code += `        this.id = id;\n`;
  code += `        this.initialized = false;\n`;
  code += `    }\n\n`;
  
  // Add methods
  if (includeComments) {
    code += `    /**\n`;
    code += `     * Initialize the instance\n`;
    code += `     * @return true if initialization was successful, false if already initialized\n`;
    code += `     */\n`;
  }
  code += `    public boolean initialize() {\n`;
  code += `        if (initialized) {\n`;
  code += `            logger.info("Already initialized");\n`;
  code += `            return false;\n`;
  code += `        }\n`;
  code += `        \n`;
  code += `        // Initialization logic here\n`;
  code += `        initialized = true;\n`;
  code += `        logger.info("Successfully initialized");\n`;
  code += `        return true;\n`;
  code += `    }\n\n`;
  
  if (includeComments) {
    code += `    /**\n`;
    code += `     * Process data\n`;
    code += `     * @param data Data to process\n`;
    code += `     * @return Processed data\n`;
    code += `     * @throws IllegalStateException if not initialized\n`;
    code += `     */\n`;
  }
  code += `    public String process(String data) {\n`;
  code += `        if (!initialized) {\n`;
  code += `            throw new IllegalStateException("Not initialized");\n`;
  code += `        }\n`;
  code += `        \n`;
  code += `        // Processing logic here\n`;
  code += `        return data;\n`;
  code += `    }\n\n`;
  
  // Add getters and setters
  if (includeComments) {
    code += `    /**\n`;
    code += `     * Get the ID\n`;
    code += `     * @return The ID\n`;
    code += `     */\n`;
  }
  code += `    public String getId() {\n`;
  code += `        return id;\n`;
  code += `    }\n\n`;
  
  if (includeComments) {
    code += `    /**\n`;
    code += `     * Set the ID\n`;
    code += `     * @param id The new ID\n`;
    code += `     */\n`;
  }
  code += `    public void setId(String id) {\n`;
  code += `        this.id = id;\n`;
  code += `    }\n\n`;
  
  if (includeComments) {
    code += `    /**\n`;
    code += `     * Check if initialized\n`;
    code += `     * @return Initialization status\n`;
    code += `     */\n`;
  }
  code += `    public boolean isInitialized() {\n`;
  code += `        return initialized;\n`;
  code += `    }\n`;
  
  code += `}\n`;
  
  return code;
};

// Python Template Generators

const generatePythonClass = (options) => {
  const { className, includeComments, includeTests, authorName } = options;
  
  let code = '';
  
  // Add header comment
  if (includeComments) {
    code += `#!/usr/bin/env python\n`;
    code += `# -*- coding: utf-8 -*-\n\n`;
    code += `"""\n`;
    code += `${className} Class\n\n`;
    if (authorName) code += `@author: ${authorName}\n`;
    code += `A class that encapsulates related functionality\n`;
    code += `"""\n\n`;
  }
  
  // Add imports
  code += `import logging\n`;
  code += `from typing import Any, Dict, Optional, Union\n\n`;
  
  // Set up logger
  code += `# Set up logging\n`;
  code += `logger = logging.getLogger(__name__)\n\n`;
  
  // Generate class
  code += `class ${className}:\n`;
  if (includeComments) {
    code += `    """\n`;
    code += `    ${className} implementation\n`;
    code += `    """\n`;
  }
  
  // Add constructor
  code += `    def __init__(self, config: Optional[Dict] = None):\n`;
  if (includeComments) {
    code += `        """\n`;
    code += `        Initialize the ${className}\n`;
    code += `        \n`;
    code += `        Args:\n`;
    code += `            config: Configuration dictionary\n`;
    code += `        """\n`;
  }
  code += `        self.config = config or {}\n`;
  code += `        self.initialized = False\n`;
  code += `        logger.debug("${className} created with config: %s", self.config)\n\n`;
  
  # Add methods
  code += `    def initialize(self) -> bool:\n`;
  if (includeComments) {
    code += `        """\n`;
    code += `        Initialize the instance\n`;
    code += `        \n`;
    code += `        Returns:\n`;
    code += `            bool: True if initialization was successful, False if already initialized\n`;
    code += `        """\n`;
  }
  code += `        if self.initialized:\n`;
  code += `            logger.info("Already initialized")\n`;
  code += `            return False\n`;
  code += `        \n`;
  code += `        # Initialization logic here\n`;
  code += `        self.initialized = True\n`;
  code += `        logger.info("Successfully initialized")\n`;
  code += `        return True\n\n`;
  
  code += `    def process(self, data: Any) -> Any:\n`;
  if (includeComments) {
    code += `        """\n`;
    code += `        Process data\n`;
    code += `        \n`;
    code += `        Args:\n`;
    code += `            data: Data to process\n`;
    code += `            \n`;
    code += `        Returns:\n`;
    code += `            Processed data\n`;
    code += `            \n`;
    code += `        Raises:\n`;
    code += `            RuntimeError: If not initialized\n`;
    code += `        """\n`;
  }
  code += `        if not self.initialized:\n`;
  code += `            raise RuntimeError("Not initialized")\n`;
  code += `        \n`;
  code += `        # Processing logic here\n`;
  code += `        return data\n`;
  
  # Add tests if required
  if (includeTests) {
    code += `\n\n# Example test\n`;
    code += `if __name__ == "__main__":\n`;
    code += `    # Configure logging\n`;
    code += `    logging.basicConfig(level=logging.INFO)\n`;
    code += `    \n`;
    code += `    # Test the class\n`;
    code += `    print(f"Testing {${className}.__name__}...")\n`;
    code += `    instance = ${className}()\n`;
    code += `    instance.initialize()\n`;
    code += `    result = instance.process("test")\n`;
    code += `    print(f"Result: {result}")\n`;
  }
  
  return code;
};d more template generators for other languages...
};

// JavaScript Template Generators

const generateJavaScriptFunction = (options) => {
  const { functionName, includeComments, includeTypeInfo, includeTests, authorName } = options;
  
  let code = '';
  
  // Add header comment
  if (includeComments) {
    code += `/**\n`;
    code += ` * ${functionName}\n`;
    if (authorName) code += ` * @author ${authorName}\n`;
    code += ` * @description A function that performs a specific task\n`;
    if (includeTypeInfo) {
      code += ` * @param {any} input - Input parameter description\n`;
      code += ` * @returns {any} - Return value description\n`;
    }
    code += ` */\n`;
  }
  
  // Generate function
  code += `function ${functionName}(input) {\n`;
  code += `  // TODO: Implement function logic\n`;
  code += `  return input;\n`;
  code += `}\n`;
  
  // Add export statement
  code += `\n`;
  code += `// Export the function\n`;
  code += `export default ${functionName};\n`;
  
  // Add tests if required
  if (includeTests) {
    code += `\n`;
    code += `// Example test\n`;
    code += `if (require.main === module) {\n`;
    code += `  console.log('Testing ${functionName}...');\n`;
    code += `  const result = ${functionName}('test');\n`;
    code += `  console.log('Result:', result);\n`;
    code += `}\n`;
  }
  
  return code;
};

const generateJavaScriptReactComponent = (options) => {
  const { className, includeComments, includeTypeInfo, includeTests, authorName } = options;
  
  let code = '';
  
  // Add imports
  code += `import React, { useState } from 'react';\n`;
  code += `\n`;
  
  // Add header comment
  if (includeComments) {
    code += `/**\n`;
    code += ` * ${className} Component\n`;
    if (authorName) code += ` * @author ${authorName}\n`;
    code += ` * @description A React component that displays content\n`;
    if (includeTypeInfo) {
      code += ` * @param {object} props - Component props\n`;
      code += ` * @param {string} props.title - Title to display\n`;
    }
    code += ` */\n`;
  }
  
  // Generate component
  if (includeTypeInfo) {
    code += `const ${className} = ({ title }) => {\n`;
  } else {
    code += `const ${className} = (props) => {\n`;
    code += `  const { title } = props;\n`;
  }
  
  code += `  const [count, setCount] = useState(0);\n`;
  code += `\n`;
  code += `  const handleClick = () => {\n`;
  code += `    setCount(prevCount => prevCount + 1);\n`;
  code += `  };\n`;
  code += `\n`;
  code += `  return (\n`;
  code += `    <div className="${className.toLowerCase()}-container">\n`;
  code += `      <h2>{title}</h2>\n`;
  code += `      <p>Count: {count}</p>\n`;
  code += `      <button onClick={handleClick}>Increment</button>\n`;
  code += `    </div>\n`;
  code += `  );\n`;
  code += `};\n`;
  
  // Add default props
  code += `\n`;
  code += `${className}.defaultProps = {\n`;
  code += `  title: 'Default Title'\n`;
  code += `};\n`;
  
  // Add export statement
  code += `\n`;
  code += `export default ${className};\n`;
  
  return code;
};

const generateJavaScriptReactHook = (options) => {
  const { functionName, includeComments, includeTypeInfo, authorName } = options;
  
  let code = '';
  
  // Add imports
  code += `import { useState, useEffect } from 'react';\n`;
  code += `\n`;
  
  // Add header comment
  if (includeComments) {
    code += `/**\n`;
    code += ` * ${functionName} Hook\n`;
    if (authorName) code += ` * @author ${authorName}\n`;
    code += ` * @description A custom React hook for managing state\n`;
    if (includeTypeInfo) {
      code += ` * @param {any} initialValue - Initial value for the state\n`;
      code += ` * @returns {Array} - Array containing state value and setter function\n`;
    }
    code += ` */\n`;
  }
  
  // Generate hook
  code += `const ${functionName} = (initialValue) => {\n`;
  code += `  const [value, setValue] = useState(initialValue);\n`;
  code += `\n`;
  code += `  useEffect(() => {\n`;
  code += `    // Side effect logic here\n`;
  code += `    console.log('Value changed:', value);\n`;
  code += `    \n`;
  code += `    // Optional cleanup function\n`;
  code += `    return () => {\n`;
  code += `      // Cleanup logic here\n`;
  code += `    };\n`;
  code += `  }, [value]);\n`;
  code += `\n`;
  code += `  const updateValue = (newValue) => {\n`;
  code += `    setValue(newValue);\n`;
  code += `  };\n`;
  code += `\n`;
  code += `  return [value, updateValue];\n`;
  code += `};\n`;
  
  // Add export statement
  code += `\n`;
  code += `export default ${functionName};\n`;
  
  return code;
};

// TypeScript Template Generators

const generateTypeScriptFunction = (options) => {
  const { functionName, includeComments, includeTypeInfo, includeTests, authorName } = options;
  
  let code = '';
  
  // Add header comment
  if (includeComments) {
    code += `/**\n`;
    code += ` * ${functionName}\n`;
    if (authorName) code += ` * @author ${authorName}\n`;
    code += ` * @description A function that performs a specific task\n`;
    code += ` */\n`;
  }
  
  // Generate function with TypeScript syntax
  if (includeTypeInfo) {
    code += `function ${functionName}<T>(input: T): T {\n`;
  } else {
    code += `function ${functionName}(input: any): any {\n`;
  }
  
  code += `  // TODO: Implement function logic\n`;
  code += `  return input;\n`;
  code += `}\n`;
  
  // Ad