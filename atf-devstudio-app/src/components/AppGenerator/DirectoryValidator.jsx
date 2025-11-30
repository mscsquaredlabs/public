/**
 * Generic directory structure validator for all application types
 */

/**
 * Validates a custom directory structure against requirements for any app type
 * 
 * @param {string} appType - Application type (react, node, java, python, custom)
 * @param {string} javaAppType - Java application type (if appType is 'java')
 * @param {string} directoryStructure - Custom directory structure provided by user
 * @returns {Object} Validation result {valid: boolean, message: string, missingPaths: string[]}
 */
export function validateDirectoryStructure(appType, javaAppType, directoryStructure) {
  try {
    if (!directoryStructure || !directoryStructure.trim()) {
      return {
        valid: false,
        message: `Please provide a directory structure for ${appType} application.`,
        missingPaths: [],
        hasWarnings: false,
        warnings: null
      };
    }

    // Extract paths from the directory structure
    const paths = extractPathsFromDirectoryStructure(directoryStructure);
    
    // If Java app, use the Java validator
    if (appType === 'java') {
      return validateJavaDirectoryStructure(javaAppType, paths);
    }
    
    // For other app types, use general validator
    return validateGeneralDirectoryStructure(appType, paths);
  } catch (error) {
    console.error("Validation error:", error);
    return {
      valid: false,
      message: `Error validating ${appType} directory structure: ${error.message}`,
      missingPaths: [],
      hasWarnings: false,
      warnings: null
    };
  }
}

/**
 * Extract paths from a directory structure string
 * 
 * @param {string} directoryStructure - Directory structure text
 * @returns {string[]} Array of extracted paths
 */
function extractPathsFromDirectoryStructure(directoryStructure) {
  const lines = directoryStructure.trim().split('\n');
  const paths = [];
  
  // First, identify the root directory name from the first line
  let rootName = '';
  if (lines.length > 0) {
    rootName = lines[0].trim().replace(/\/$/, '');
    paths.push(rootName); // Add the root directory itself
  }
  
  // Process remaining lines to extract paths
  const pathParts = [rootName];
  let currentIndentLevel = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines
    
    // Calculate indentation level based on spaces
    const indentMatch = line.match(/^(\s*)/);
    const indentLength = indentMatch ? indentMatch[0].length : 0;
    const indentLevel = Math.ceil(indentLength / 2); // Assuming 2-space indentation
    
    // Extract the file/dir name without tree characters
    const nameMatch = line.replace(/^[\s│├└─]+/, '').trim();
    if (!nameMatch) continue;
    
    // Adjust path parts based on current indent level
    if (indentLevel > currentIndentLevel) {
      // Going deeper - add to path parts
    } else if (indentLevel < currentIndentLevel) {
      // Going back up - remove excess path parts
      while (pathParts.length > indentLevel + 1) {
        pathParts.pop();
      }
    } else if (indentLevel === currentIndentLevel) {
      // Same level - replace last part
      pathParts.pop();
    }
    
    // Add current path part
    pathParts.push(nameMatch);
    
    // Add full path to paths array
    const fullPath = pathParts.join('/');
    paths.push(fullPath);
    
    // Also add path without root to handle validation more flexibly
    if (pathParts.length > 1) {
      const pathWithoutRoot = pathParts.slice(1).join('/');
      paths.push(pathWithoutRoot);
    }
    
    // Update current indent level for next iteration
    currentIndentLevel = indentLevel;
  }
  
  // Add additional paths for better matching - each path segment separately
  const additionalPaths = [];
  for (const path of paths) {
    const segments = path.split('/');
    if (segments.length > 1) {
      for (let i = 0; i < segments.length; i++) {
        const partial = segments.slice(0, i + 1).join('/');
        if (!paths.includes(partial)) {
          additionalPaths.push(partial);
        }
      }
    }
  }
  
  return [...paths, ...additionalPaths];
}

/**
 * Validate directory structure for non-Java app types
 * 
 * @param {string} appType - Application type
 * @param {string[]} paths - Extracted paths
 * @returns {Object} Validation result
 */
function validateGeneralDirectoryStructure(appType, paths) {
  const requiredPaths = getRequiredPathsForType(appType);
  const recommendedPaths = getRecommendedPathsForType(appType);
  
  // Check for missing required paths
  const missingRequiredPaths = [];
  for (const requiredPath of requiredPaths) {
    if (!pathExistsInStructure(paths, requiredPath)) {
      missingRequiredPaths.push(requiredPath);
    }
  }
  
  // Check for missing recommended paths
  const missingRecommendedPaths = [];
  for (const recommendedPath of recommendedPaths) {
    if (!pathExistsInStructure(paths, recommendedPath)) {
      missingRecommendedPaths.push(recommendedPath);
    }
  }
  
  // Create validation result
  if (missingRequiredPaths.length > 0) {
    return {
      valid: false,
      message: `The directory structure is missing required paths for a ${getAppTypeName(appType)} application: ${missingRequiredPaths.join(', ')}`,
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
 * Check if a path exists in the extracted structure
 * 
 * @param {string[]} paths - Extracted paths
 * @param {string} pathToFind - Path to check for
 * @returns {boolean} True if path exists
 */
function pathExistsInStructure(paths, pathToFind) {
  // Direct match
  if (paths.includes(pathToFind)) {
    return true;
  }
  
  // Check if this is a file or directory
  const isFile = pathToFind.includes('.');
  
  // For files, check if it exists anywhere in the paths
  if (isFile) {
    const fileName = pathToFind.split('/').pop();
    return paths.some(path => 
      path.endsWith('/' + fileName) || path === fileName
    );
  } 
  
  // For directories, check if any path contains this directory
  return paths.some(path => 
    path === pathToFind || 
    path.startsWith(pathToFind + '/') || 
    path.includes('/' + pathToFind + '/')
  );
}

/**
 * Get the required paths for a given app type
 * 
 * @param {string} appType - Application type
 * @returns {string[]} Array of required paths
 */
function getRequiredPathsForType(appType) {
  switch (appType) {
    case 'react':
      return [
        'package.json',
        'src',
        'public'
      ];
    case 'node':
      return [
        'package.json',
        'index.js'
      ];
    case 'python':
      return [
        'setup.py'
      ];
    case 'custom':
      // For fully custom structures, no specific requirements
      return [];
    default:
      return [];
  }
}

/**
 * Get the recommended paths for a given app type
 * 
 * @param {string} appType - Application type
 * @returns {string[]} Array of recommended paths
 */
function getRecommendedPathsForType(appType) {
  switch (appType) {
    case 'react':
      return [
        'src/App.js',
        'src/index.js',
        'public/index.html',
        'README.md',
        '.gitignore'
      ];
    case 'node':
      return [
        'tests',
        'README.md',
        '.gitignore'
      ];
    case 'python':
      return [
        'tests',
        'requirements.txt',
        'README.md',
        '.gitignore'
      ];
    case 'custom':
      return [
        'README.md',
        '.gitignore'
      ];
    default:
      return [];
  }
}

/**
 * Get a user-friendly name for an app type
 * 
 * @param {string} appType - Application type
 * @returns {string} User-friendly name
 */
function getAppTypeName(appType) {
  switch (appType) {
    case 'react':
      return 'React';
    case 'node':
      return 'Node.js';
    case 'python':
      return 'Python';
    case 'java':
      return 'Java';
    case 'custom':
      return 'Custom';
    default:
      return appType;
  }
}

/**
 * Validates a Java directory structure
 * 
 * @param {string} javaType - Java application type
 * @param {string[]} paths - Extracted paths from directory structure
 * @returns {Object} Validation result
 */
function validateJavaDirectoryStructure(javaType, paths) {
  // Define required files/directories for each Java app type
  const requiredPaths = {
    'java-core': [
      'src/main/java', 
      'pom.xml'
    ],
    'cli-app': [
      'src/main/java',
      'src/main/resources',
      'pom.xml'
    ],
    'j2ee': [
      'src/main/java',
      'src/main/webapp/WEB-INF/web.xml',
      'pom.xml'
    ],
    'spring-xml': [
      'src/main/java',
      'src/main/resources/spring-config.xml',
      'pom.xml'
    ],
    'spring-mvc': [
      'src/main/java',
      'src/main/webapp/WEB-INF',
      'pom.xml'
    ],
    'spring-boot-maven': [
      'src/main/java',
      'src/main/resources',
      'pom.xml'
    ],
    'spring-boot-gradle': [
      'src/main/java',
      'src/main/resources',
      'build.gradle'
    ],
    'microservices': [
      'api-gateway',
      'discovery-service',
      'docker-compose.yml'
    ],
    'hibernate': [
      'src/main/java',
      'src/main/resources/hibernate.cfg.xml',
      'pom.xml'
    ],
    'desktop-app': [
      'src/main/java',
      'src/main/resources',
      'pom.xml'
    ]
  };
  
  // Get recommended paths for warnings
  const recommendedPaths = {
    'java-core': [
      'src/main/resources',
      'src/test/java',
      'README.md',
      '.gitignore'
    ],
    'cli-app': [
      'src/test/java',
      'README.md',
      'scripts/run.sh',
      '.gitignore'
    ],
    'j2ee': [
      'src/main/webapp/index.jsp',
      'src/test/java',
      'README.md',
      '.gitignore'
    ],
    'spring-xml': [
      'src/test/java',
      'README.md',
      '.gitignore'
    ],
    'spring-mvc': [
      'src/main/webapp/WEB-INF/views',
      'src/main/resources',
      'src/test/java',
      'README.md',
      '.gitignore'
    ],
    'spring-boot-maven': [
      'src/main/resources/application.properties',
      'src/main/resources/templates',
      'src/main/resources/static',
      'src/test/java',
      'README.md',
      '.gitignore'
    ],
    'spring-boot-gradle': [
      'src/main/resources/application.yml',
      'src/main/resources/templates',
      'src/main/resources/static',
      'src/test/java',
      'README.md',
      'settings.gradle',
      '.gitignore'
    ],
    'microservices': [
      'user-service',
      'order-service',
      'README.md',
      '.gitignore'
    ],
    'hibernate': [
      'src/test/java',
      'README.md',
      '.gitignore'
    ],
    'desktop-app': [
      'src/test/java',
      'README.md',
      '.gitignore'
    ]
  };
  
  // Check for missing required paths
  const required = requiredPaths[javaType] || [];
  const missingPaths = [];
  
  for (const requiredPath of required) {
    if (!pathExistsInStructure(paths, requiredPath)) {
      missingPaths.push(requiredPath);
    }
  }
  
  // Check for missing recommended paths
  const recommended = recommendedPaths[javaType] || [];
  const missingRecommended = [];
  
  for (const recommendedPath of recommended) {
    if (!pathExistsInStructure(paths, recommendedPath)) {
      missingRecommended.push(recommendedPath);
    }
  }
  
  if (missingPaths.length > 0) {
    return {
      valid: false,
      message: `The directory structure is missing required paths for a ${javaType} application: ${missingPaths.join(', ')}`,
      missingPaths,
      hasWarnings: missingRecommended.length > 0,
      warnings: missingRecommended.length > 0 
        ? `Consider adding these recommended paths: ${missingRecommended.join(', ')}`
        : null
    };
  }
  
  return { 
    valid: true, 
    message: 'Directory structure is valid.',
    missingPaths: [],
    hasWarnings: missingRecommended.length > 0,
    warnings: missingRecommended.length > 0 
      ? `Consider adding these recommended paths: ${missingRecommended.join(', ')}`
      : null
  };
}

// DirectoryValidator.jsx   ← keep it in this file

/** util: translate leading whitespace into a nesting level */
const getIndentLevel = (line) => line.search(/\S|$/);   // # of spaces before first non-space

/** main parser – drop this in place of your old extractPathsFromDirectoryStructure */
export const parseDirectoryStructure = (template) => {
  const paths = [];
  const stack = [];          // keeps track of parent dirs for each indent

  template
    .split(/\r?\n/)
    .filter(Boolean)         // skip blank lines
    .forEach((raw) => {
      // strip the tree-drawing characters ├──, │, └── and any leading spaces
      const cleaned = raw.replace(/[│├└─]+/g, '').trimStart();
      if (!cleaned) return;   // skip lines that were only tree glyphs

      const indent = getIndentLevel(raw);

      // update stack so stack.length === current depth
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parentPath = stack.length ? stack[stack.length - 1].path : '';
      const fullPath   = parentPath ? `${parentPath}/${cleaned}` : cleaned;

      paths.push(fullPath);
      if (cleaned.endsWith('/')) {           // it’s a directory – track it
        stack.push({ indent, path: fullPath.replace(/\/$/, '') });
      }
    });

  return paths;
};
