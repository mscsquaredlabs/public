/**
 * Helper functions for validating custom Java directory structures
 */

/**
 * Validates if a custom directory structure meets the minimum requirements for a Java app
 * 
 * @param {string} javaType - Java application type
 * @param {string} directoryStructure - Custom directory structure provided by user
 * @returns {Object} Validation result {valid: boolean, message: string, missingPaths: string[]}
 */
export function validateCustomDirectoryStructure(javaType, directoryStructure) {
    const requiredPaths = getRequiredPathsForType(javaType);
    const recommendedPaths = getRecommendedPathsForType(javaType);
    
    // Check for missing required paths
    const missingRequiredPaths = [];
    for (const path of requiredPaths) {
      if (!directoryStructure.includes(path)) {
        missingRequiredPaths.push(path);
      }
    }
    
    // Check for missing recommended paths
    const missingRecommendedPaths = [];
    for (const path of recommendedPaths) {
      if (!directoryStructure.includes(path)) {
        missingRecommendedPaths.push(path);
      }
    }
    
    // Create validation result
    if (missingRequiredPaths.length > 0) {
      return {
        valid: false,
        message: `The directory structure is missing required paths for a ${getAppTypeName(javaType)} application: ${missingRequiredPaths.join(', ')}`,
        missingPaths: missingRequiredPaths,
        hasWarnings: missingRecommendedPaths.length > 0,
        warnings: missingRecommendedPaths.length > 0 
          ? `Consider adding these recommended paths: ${missingRecommendedPaths.join(', ')}`
          : null
      };
    }
    
    return { 
      valid: true, 
      message: 'Directory structure is valid.', 
      missingPaths: [],
      hasWarnings: missingRecommendedPaths.length > 0,
      warnings: missingRecommendedPaths.length > 0 
        ? `Consider adding these recommended paths: ${missingRecommendedPaths.join(', ')}`
        : null
    };
  }
  
  /**
   * Get the required paths for a given Java app type
   * 
   * @param {string} javaType - Java application type
   * @returns {string[]} Array of required paths
   */
  function getRequiredPathsForType(javaType) {
    switch (javaType) {
      case 'java-core':
        return [
          'src/main/java',
          'pom.xml'
        ];
      case 'cli-app':
        return [
          'src/main/java',
          'src/main/resources',
          'pom.xml'
        ];
      case 'j2ee':
        return [
          'src/main/java',
          'src/main/webapp/WEB-INF/web.xml',
          'pom.xml'
        ];
      case 'spring-xml':
        return [
          'src/main/java',
          'src/main/resources/spring-config.xml',
          'pom.xml'
        ];
      case 'spring-mvc':
        return [
          'src/main/java',
          'src/main/webapp/WEB-INF',
          'pom.xml'
        ];
      case 'spring-boot-maven':
        return [
          'src/main/java',
          'src/main/resources',
          'pom.xml'
        ];
      case 'spring-boot-gradle':
        return [
          'src/main/java',
          'src/main/resources',
          'build.gradle'
        ];
      case 'microservices':
        return [
          'api-gateway',
          'discovery-service',
          'docker-compose.yml'
        ];
      case 'hibernate':
        return [
          'src/main/java',
          'src/main/resources/hibernate.cfg.xml',
          'pom.xml'
        ];
      case 'desktop-app':
        return [
          'src/main/java',
          'src/main/resources',
          'pom.xml'
        ];
      default:
        return [
          'src/main/java',
          'pom.xml'
        ];
    }
  }
  
  /**
   * Get the recommended paths for a given Java app type
   * 
   * @param {string} javaType - Java application type
   * @returns {string[]} Array of recommended paths
   */
  function getRecommendedPathsForType(javaType) {
    switch (javaType) {
      case 'java-core':
        return [
          'src/main/resources',
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
      case 'cli-app':
        return [
          'src/test/java',
          'README.md',
          'scripts/run.sh',
          '.gitignore'
        ];
      case 'j2ee':
        return [
          'src/main/webapp/index.jsp',
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
      case 'spring-xml':
        return [
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
      case 'spring-mvc':
        return [
          'src/main/webapp/WEB-INF/views',
          'src/main/resources',
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
      case 'spring-boot-maven':
        return [
          'src/main/resources/application.properties',
          'src/main/resources/templates',
          'src/main/resources/static',
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
      case 'spring-boot-gradle':
        return [
          'src/main/resources/application.yml',
          'src/main/resources/templates',
          'src/main/resources/static',
          'src/test/java',
          'README.md',
          'settings.gradle',
          '.gitignore'
        ];
      case 'microservices':
        return [
          'user-service',
          'order-service',
          'README.md',
          '.gitignore'
        ];
      case 'hibernate':
        return [
          'src/main/resources/sql',
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
      case 'desktop-app':
        return [
          'src/main/resources/images',
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
      default:
        return [
          'src/main/resources',
          'src/test/java',
          'README.md',
          '.gitignore'
        ];
    }
  }
  
  /**
   * Get a user-friendly name for a Java app type
   * 
   * @param {string} javaType - Java application type
   * @returns {string} User-friendly name
   */
  function getAppTypeName(javaType) {
    switch (javaType) {
      case 'java-core':
        return 'Java Core';
      case 'cli-app':
        return 'Java CLI';
      case 'j2ee':
        return 'Java EE';
      case 'spring-xml':
        return 'Spring XML';
      case 'spring-mvc':
        return 'Spring MVC';
      case 'spring-boot-maven':
        return 'Spring Boot (Maven)';
      case 'spring-boot-gradle':
        return 'Spring Boot (Gradle)';
      case 'microservices':
        return 'Java Microservices';
      case 'hibernate':
        return 'Hibernate';
      case 'desktop-app':
        return 'Java Desktop';
      default:
        return 'Java';
    }
  }
  
  /**
   * Parse a text-based directory structure into a tree object
   * 
   * @param {string} directoryText - Text representation of the directory structure
   * @returns {Object} Directory tree
   */
  export function parseDirectoryStructure(directoryText) {
    const lines = directoryText.split('\n');
    const tree = { name: 'root', children: [] };
    let currentPath = [];
    let previousLevel = -1;
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Determine the indentation level and file/directory name
      const match = line.match(/^(\s*)([├└│├─]*)?\s*(.+)$/);
      if (!match) continue;
      
      const [, indent, prefix, name] = match;
      const level = (indent || '').length / 2;
      
      // If we're going back up the tree, adjust the current path
      if (level <= previousLevel) {
        currentPath = currentPath.slice(0, level);
      }
      
      // Get the current node
      let currentNode = tree;
      for (const i of currentPath) {
        currentNode = currentNode.children[i];
      }
      
      // Add the new node
      currentNode.children = currentNode.children || [];
      currentNode.children.push({
        name: name.trim(),
        type: name.includes('.') ? 'file' : 'directory',
        children: []
      });
      
      // Update the path and level
      currentPath.push(currentNode.children.length - 1);
      previousLevel = level;
    }
    
    return tree;
  }
  
  /**
   * Convert a directory tree to a flat list of paths
   * 
   * @param {Object} tree - Directory tree
   * @param {string} basePath - Base path
   * @returns {string[]} Flat list of paths
   */
  export function flattenDirectoryTree(tree, basePath = '') {
    let paths = [];
    
    if (!tree.children) return paths;
    
    for (const child of tree.children) {
      const currentPath = basePath ? `${basePath}/${child.name}` : child.name;
      paths.push(currentPath);
      
      if (child.type === 'directory' && child.children && child.children.length > 0) {
        paths = [...paths, ...flattenDirectoryTree(child, currentPath)];
      }
    }
    
    return paths;
  }
  
  /**
   * Generate a standard directory structure for a Java app type
   * 
   * @param {string} javaType - Java application type
   * @param {string} appName - Application name
   * @returns {Object} Directory tree
   */
  export function generateStandardDirectoryTree(javaType, appName) {
    // This function would generate a standard directory tree for the specified Java app type
    // For now, we'll use a placeholder implementation
    
    const tree = { name: appName, type: 'directory', children: [] };
    
    // Add src directory
    const srcDir = { name: 'src', type: 'directory', children: [] };
    tree.children.push(srcDir);
    
    // Add main directory
    const mainDir = { name: 'main', type: 'directory', children: [] };
    srcDir.children.push(mainDir);
    
    // Add java directory
    const javaDir = { name: 'java', type: 'directory', children: [] };
    mainDir.children.push(javaDir);
    
    // Add com/example directories
    const comDir = { name: 'com', type: 'directory', children: [] };
    javaDir.children.push(comDir);
    
    const exampleDir = { name: 'example', type: 'directory', children: [] };
    comDir.children.push(exampleDir);
    
    // Add resources directory
    const resourcesDir = { name: 'resources', type: 'directory', children: [] };
    mainDir.children.push(resourcesDir);
    
    // Add test directory
    const testDir = { name: 'test', type: 'directory', children: [] };
    srcDir.children.push(testDir);
    
    // Add java directory under test
    const testJavaDir = { name: 'java', type: 'directory', children: [] };
    testDir.children.push(testJavaDir);
    
    // Add pom.xml or build.gradle
    if (javaType === 'spring-boot-gradle') {
      tree.children.push({ name: 'build.gradle', type: 'file', children: [] });
      tree.children.push({ name: 'settings.gradle', type: 'file', children: [] });
    } else {
      tree.children.push({ name: 'pom.xml', type: 'file', children: [] });
    }
    
    // Add README.md
    tree.children.push({ name: 'README.md', type: 'file', children: [] });
    
    // Add .gitignore
    tree.children.push({ name: '.gitignore', type: 'file', children: [] });
    
    return tree;
  }
  
  /**
   * Convert a directory tree to a text representation
   * 
   * @param {Object} tree - Directory tree
   * @param {string} prefix - Prefix for the current line
   * @param {boolean} isLast - Whether the current node is the last child
   * @param {string} indent - Indentation for the current line
   * @returns {string} Text representation of the directory tree
   */
  export function directoryTreeToText(tree, prefix = '', isLast = true, indent = '') {
    if (!tree || tree.name === 'root') {
      if (!tree.children || tree.children.length === 0) return '';
      
      let result = '';
      for (let i = 0; i < tree.children.length; i++) {
        const child = tree.children[i];
        const isLastChild = i === tree.children.length - 1;
        result += directoryTreeToText(child, '', isLastChild, '');
      }
      
      return result;
    }
    
    let result = `${indent}${prefix}${tree.name}\n`;
    
    if (tree.children && tree.children.length > 0) {
      const newIndent = indent + (isLast ? '    ' : '│   ');
      
      for (let i = 0; i < tree.children.length; i++) {
        const child = tree.children[i];
        const isLastChild = i === tree.children.length - 1;
        const newPrefix = isLastChild ? '└── ' : '├── ';
        
        result += directoryTreeToText(child, newPrefix, isLastChild, newIndent);
      }
    }
    
    return result;
  }
  
  /**
   * Suggest improvements to a custom directory structure
   * 
   * @param {string} javaType - Java application type
   * @param {string} directoryStructure - Custom directory structure provided by user
   * @returns {Object} Improvement suggestions
   */
  export function suggestDirectoryImprovements(javaType, directoryStructure) {
    const validationResult = validateCustomDirectoryStructure(javaType, directoryStructure);
    
    if (!validationResult.valid) {
      return {
        canBeImproved: true,
        missingRequired: validationResult.missingPaths,
        missingRecommended: validationResult.hasWarnings ? validationResult.warnings.split(': ')[1].split(', ') : [],
        suggestions: [
          `Add the required paths: ${validationResult.missingPaths.join(', ')}`,
          ...(validationResult.hasWarnings ? [`Consider adding: ${validationResult.warnings.split(': ')[1]}`] : [])
        ]
      };
    }
    
    if (validationResult.hasWarnings) {
      return {
        canBeImproved: true,
        missingRequired: [],
        missingRecommended: validationResult.warnings.split(': ')[1].split(', '),
        suggestions: [
          `Your structure meets all requirements but could be improved by adding: ${validationResult.warnings.split(': ')[1]}`
        ]
      };
    }
    
    return {
      canBeImproved: false,
      missingRequired: [],
      missingRecommended: [],
      suggestions: [
        'Your directory structure meets all requirements and recommendations!'
      ]
    };
  }