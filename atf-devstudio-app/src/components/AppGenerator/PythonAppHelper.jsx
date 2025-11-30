/**
 * Helper functions for Python app generation
 */

/**
 * Generates Python application files
 * 
 * @param {Object} zip - JSZip instance
 * @param {Object} options - App generation options
 */
export const generatePythonApp = (zip, options) => {
  const { 
    appName, 
    description, 
    version, 
    author, 
    includeTests = true, 
    includeReadme = true, 
    includeGitignore = true,
    customDirectoryTemplate
  } = options;
  
  // If custom directory structure is provided, use it instead
  if (customDirectoryTemplate) {
    return generateCustomPythonApp(zip, customDirectoryTemplate, options);
  }
  
  // Convert app name to python package name (snake_case)
  const packageName = appName.replace(/-/g, '_').toLowerCase();
  
  // Create main package folder
  const packageFolder = zip.folder(packageName);
  
  // Create __init__.py
  packageFolder.file("__init__.py", ``);
  
  // Create main.py
  packageFolder.file("main.py", `def main():
  print("${description} - Hello World!")

if __name__ == "__main__":
  main()
`);
  
  // Create setup.py
  zip.file("setup.py", `from setuptools import setup, find_packages

setup(
  name="${appName}",
  version="${version}",
  packages=find_packages(),
  description="${description}",
  author="${author}",
  python_requires=">=3.6",
  entry_points={
      "console_scripts": [
          "${packageName}=${packageName}.main:main",
      ],
  },
)
`);
  
  // Add tests if required
  if (includeTests) {
    const testsFolder = zip.folder("tests");
    testsFolder.file("__init__.py", ``);
    testsFolder.file("test_main.py", `import unittest
from ${packageName}.main import main

class TestMain(unittest.TestCase):
  def test_main(self):
      # This is a placeholder test
      self.assertTrue(True)

if __name__ == "__main__":
  unittest.main()
`);
    
    // Create pytest configuration
    zip.file("pytest.ini", `[pytest]
testpaths = tests
python_files = test_*.py
`);
  }
  
  // Create requirements.txt
  zip.file("requirements.txt", `# Dependencies
${includeTests ? 'pytest>=7.0.0\n' : ''}
`);
  
  // Add README.md if required
  if (includeReadme) {
    zip.file("README.md", `# ${appName}

${description}

A simple Python application.

## Installation

### Local Development

\`\`\`bash
pip install -e .
\`\`\`

## Usage

Run directly:

\`\`\`bash
python -m ${packageName}.main
\`\`\`

Or if installed:

\`\`\`bash
${packageName}
\`\`\`

${includeTests ? '## Testing\n\n```bash\npytest\n```\n' : ''}
`);
  }
  
  // Add .gitignore if required
  if (includeGitignore) {
    zip.file(".gitignore", `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
dist/
build/
*.egg-info/

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE specific files
.idea/
.vscode/
*.swp
*.swo
`);
  }
};

/**
* Generate a Python app using a custom directory structure
* 
* @param {Object} zip - JSZip instance
* @param {string} directoryTemplate - Custom directory structure template
* @param {Object} options - App generation options
*/
function generateCustomPythonApp(zip, directoryTemplate, options) {
  const { 
    appName, 
    description, 
    version, 
    author, 
    includeTests = true, 
    includeReadme = true, 
    includeGitignore = true 
  } = options;

  // Convert app name to python package name (snake_case)
  const packageName = appName.replace(/-/g, '_').toLowerCase();

  // Parse the directory structure
  const lines = directoryTemplate.split('\n');
  const paths = [];

  // Simple parsing to extract file paths
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Remove leading characters like ├ └ │ etc.
    const pathMatch = trimmedLine.match(/[├└│├─]*\s*(.+)$/);
    if (pathMatch && pathMatch[1]) {
      paths.push(pathMatch[1]);
    }
  }

  // Create folders and empty files based on structure
  for (let path of paths) {
    // Skip the root app name if included
    if (path.startsWith(`${appName}/`)) {
      path = path.substring(appName.length + 1);
    }
    
    // Skip empty paths
    if (!path) continue;
    
    // Determine if path is a file or directory
    const isDirectory = !path.includes('.') || path.endsWith('/');
    
    if (isDirectory) {
      // Create directory (remove trailing slash if present)
      zip.folder(path.endsWith('/') ? path.slice(0, -1) : path);
    } else {
      // Create file with appropriate content
      const content = getPythonFileContent(path, { 
        appName, 
        packageName,
        description, 
        version, 
        author,
        includeTests
      });
      
      zip.file(path, content);
    }
  }

  // Ensure required files exist
  ensureRequiredPythonFiles(zip, options);

  // Add README.md and .gitignore if needed and not already in the structure
  if (includeReadme && !paths.some(p => p.includes('README.md'))) {
    zip.file("README.md", `# ${appName}

${description}

A simple Python application.

## Installation

### Local Development

\`\`\`bash
pip install -e .
\`\`\`

## Usage

Run directly:

\`\`\`bash
python -m ${packageName}.main
\`\`\`

Or if installed:

\`\`\`bash
${packageName}
\`\`\`

${includeTests ? '## Testing\n\n```bash\npytest\n```\n' : ''}
`);
  }

  if (includeGitignore && !paths.some(p => p.includes('.gitignore'))) {
    zip.file(".gitignore", `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
dist/
build/
*.egg-info/

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE specific files
.idea/
.vscode/
*.swp
*.swo
`);
  }
}

/**
* Ensure that required Python files exist in the generated zip
* 
* @param {Object} zip - JSZip instance
* @param {Object} options - App generation options
*/
function ensureRequiredPythonFiles(zip, options) {
  const { appName, description, version, author } = options;
  const packageName = appName.replace(/-/g, '_').toLowerCase();

  // Check if setup.py exists
  if (!zip.file('setup.py')) {
    zip.file("setup.py", `from setuptools import setup, find_packages

setup(
  name="${appName}",
  version="${version}",
  packages=find_packages(),
  description="${description}",
  author="${author}",
  python_requires=">=3.6",
  entry_points={
      "console_scripts": [
          "${packageName}=${packageName}.main:main",
      ],
  },
)
`);
  }

  // Ensure package directory exists with __init__.py and main.py
  if (!zip.folder(packageName)) {
    const packageFolder = zip.folder(packageName);
    packageFolder.file("__init__.py", "");
    
    if (!zip.file(`${packageName}/main.py`)) {
      packageFolder.file("main.py", `def main():
  print("${description} - Hello World!")

if __name__ == "__main__":
  main()
`);
    }
  } else if (!zip.file(`${packageName}/__init__.py`)) {
    zip.file(`${packageName}/__init__.py`, "");
  }

  // Ensure main.py exists in package
  if (!zip.file(`${packageName}/main.py`)) {
    zip.file(`${packageName}/main.py`, `def main():
  print("${description} - Hello World!")

if __name__ == "__main__":
  main()
`);
  }
}

/**
* Get content for a specific Python file based on its path
* 
* @param {string} path - File path
* @param {Object} options - File generation options
* @returns {string} File content
*/
function getPythonFileContent(path, options) {
  const { appName, packageName, description, version, author, includeTests } = options;

  // Extract filename and extension
  const filename = path.split('/').pop();
  const extension = filename.includes('.') ? filename.split('.').pop() : '';

  // Return appropriate content based on file type
  switch (filename) {
    case 'setup.py':
      return `from setuptools import setup, find_packages

setup(
  name="${appName}",
  version="${version}",
  packages=find_packages(),
  description="${description}",
  author="${author}",
  python_requires=">=3.6",
  entry_points={
      "console_scripts": [
          "${packageName}=${packageName}.main:main",
      ],
  },
)
`;
    
    case '__init__.py':
      return "";
      
    case 'main.py':
      return `def main():
  print("${description} - Hello World!")

if __name__ == "__main__":
  main()
`;
      
    case 'requirements.txt':
      return `# Dependencies
${includeTests ? 'pytest>=7.0.0\n' : ''}
`;
      
    case 'pytest.ini':
      return `[pytest]
testpaths = tests
python_files = test_*.py
`;
      
    case 'test_main.py':
      if (includeTests) {
        return `import unittest
from ${packageName}.main import main

class TestMain(unittest.TestCase):
  def test_main(self):
      # This is a placeholder test
      self.assertTrue(True)

if __name__ == "__main__":
  unittest.main()
`;
      }
      return "# Test file";
      
    case 'README.md':
      return `# ${appName}

${description}

A simple Python application.

## Installation

### Local Development

\`\`\`bash
pip install -e .
\`\`\`

## Usage

Run directly:

\`\`\`bash
python -m ${packageName}.main
\`\`\`

Or if installed:

\`\`\`bash
${packageName}
\`\`\`

${includeTests ? '## Testing\n\n```bash\npytest\n```\n' : ''}
`;
      
    case '.gitignore':
      return `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
dist/
build/
*.egg-info/

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE specific files
.idea/
.vscode/
*.swp
*.swo
`;
      
    default:
      // For other Python files
      if (extension === 'py') {
        return `# ${filename}
# Generated file for ${appName}

def main():
    """
    Main function for ${path}
    """
    print("Generated file for ${appName}")

if __name__ == "__main__":
    main()
`;
      }
      
      // For other configuration files
      if (extension === 'ini' || extension === 'cfg' || extension === 'conf') {
        return `# Configuration file for ${appName}
# Generated for ${path}

[default]
version = ${version}
`;
      }
      
      // For YAML files
      if (extension === 'yml' || extension === 'yaml') {
        return `# YAML configuration for ${appName}
version: ${version}
name: ${appName}
description: ${description}
`;
      }
      
      // Default - empty file with comment
      return `# Generated file: ${filename}\n# Part of ${appName}\n`;
  }
}