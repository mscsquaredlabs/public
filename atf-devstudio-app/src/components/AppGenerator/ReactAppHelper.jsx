/**
 * Helper functions for React app generation with improved directory structure handling
 */

import getIndentLevel from './CustomAppHelper';

const BRANCH_PREFIX = /^[\s│]*[├└]──\s*/;   // strips guides + “├── ” / “└── ”

/**
 * Generates React application files
 * 
 * @param {Object} zip - JSZip instance
 * @param {Object} options - App generation options
 */
export const generateReactApp = (zip, options) => {
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
    return generateCustomReactApp(zip, customDirectoryTemplate, options);
  }
  
  // Create main app folder
  const appFolder = zip.folder(appName);
  
  // Create package.json
  const packageJson = {
    name: appName,
    version: version,
    private: true,
    description: description,
    author: author || undefined,
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1"
    },
    scripts: {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    eslintConfig: {
      "extends": ["react-app", "react-app/jest"]
    },
    browserslist: {
      "production": [">0.2%", "not dead", "not op_mini all"],
      "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
    }
  };
  
  appFolder.file("package.json", JSON.stringify(packageJson, null, 2));
  
  // Create public folder
  const publicFolder = appFolder.folder("public");
  publicFolder.file("index.html", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${description}" />
  <title>${description}</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>`);
  
  // Create src folder
  const srcFolder = appFolder.folder("src");
  srcFolder.file("index.js", `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<React.StrictMode>
  <App />
</React.StrictMode>
);
`);
  
  srcFolder.file("App.js", `import React from 'react';
import './App.css';

function App() {
return (
  <div className="App">
    <header className="App-header">
      <h1>${description}</h1>
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
    </header>
  </div>
);
}

export default App;
`);
  
  srcFolder.file("App.css", `.App {
text-align: center;
}

.App-header {
background-color: #282c34;
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
font-size: calc(10px + 2vmin);
color: white;
}
`);
  
  srcFolder.file("index.css", `body {
margin: 0;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

code {
font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
  monospace;
}
`);
  
  // Add tests if required
  if (includeTests) {
    srcFolder.file("App.test.js", `import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
render(<App />);
const titleElement = screen.getByText(/${description}/i);
expect(titleElement).toBeInTheDocument();
});
`);
  }
  
  // Add README.md if required
  if (includeReadme) {
    appFolder.file("README.md", `# ${appName}

${description}

## Available Scripts

In the project directory, you can run:

### \`npm install\`

Installs all the required dependencies.

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
`);
  }
  
  // Add .gitignore if required
  if (includeGitignore) {
    appFolder.file(".gitignore", `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`);
  }
};

/**
* Generate a React app using a custom directory structure
* 
* @param {Object} zip - JSZip instance
* @param {string} directoryTemplate - Custom directory structure template
* @param {Object} options - App generation options
*/
function generateCustomReactApp(zip, directoryTemplate, options) {
  const { 
    appName, 
    description, 
    version, 
    author, 
    includeTests = true, 
    includeReadme = true, 
    includeGitignore = true 
  } = options;
  
  // Initialize with the root folder, which is often the app name
  let rootFolder = appName;
  
  // Parse the directory structure
  const lines = directoryTemplate.split('\n');
  const paths = [];
  const stack = [{ path: '', indent: -1 }];
  
  // First, determine the root folder name
  const firstLine = lines.filter(line => line.trim())[0];
  if (firstLine) {
    // Extract root folder name (might contain '/' at the end)
    const rootMatch = firstLine.trim().replace(/\/$/, '');
    rootFolder = rootMatch;
  }
  
  // Now process all lines
  for (let i = 0; i < lines.length; i++) {
    //const line = lines[i].trim();
    const line = lines[i];  
    //if (!line) continue;
    if (!line.trim()) continue;
    
    // Skip the root line (first line)
    //if (i === 0 && line.indexOf('/') > -1) continue;
    if (i === 0) continue;

    // Calculate indentation to determine nesting level
      //const originalLine = lines[i];
    //const originalLine = lines[i];
    //const indentMatch = originalLine.match(/^(\s*)/);
      //const indentSize = indentMatch ? indentMatch[1].length : 0;
      //const indentSize = getIndentLevel(originalLine);
    
    //const indentSize   = getIndentLevel(originalLine); 
    
      // Extract the path without tree characters
      //  const pathMatch = line.replace(/^[├└│├─\s]+/, '').trim();
      //if (!pathMatch) continue;

    // clean node name (removes │ pipes, branch glyphs and dashes)
    //const pathMatch    = originalLine.replace(BRANCH_PREFIX, '').trim();
    const indentSize   = getIndentLevel(line); 
    const rawName      = line.replace(BRANCH_PREFIX, '').trim();
    if (!rawName) continue;
    
    // strip trailing slash so we never end with “ …/” here
    const nodeName     = rawName.replace(/\/$/, '');

    // Maintain a stack for nesting
    while (stack.length > 1 && stack[stack.length - 1].indent >= indentSize) {
      stack.pop();
    }
    
    // Build full path
    //const parentPath = stack[stack.length - 1].path;
    //const currentPath = parentPath ? `${parentPath}/${pathMatch}` : pathMatch;
    const parentPath  = stack[stack.length - 1].path.replace(/\/$/, '');
    const currentPath = parentPath ? `${parentPath}/${nodeName}` : nodeName;
    
    // Add to stack
    stack.push({ path: currentPath, indent: indentSize });
    
    // Add to flat paths list
    paths.push(currentPath);
  }
  
  // Process each path to create directories and files
  for (const path of paths) {
    const isFile = !path.endsWith('/') && path.includes('.');
    // Strip leading tree characters and adjust path
    //const cleanPath = `${rootFolder}/${path.replace(/^[├└│\s─]+/, '')}`;
    const cleanPath = `${rootFolder}/${path}`;
    
    if (isFile) {
      // Generate appropriate content based on file type
      const content = getFileContent(cleanPath, { appName, description, version, author, includeTests });
      zip.file(cleanPath, content);
    } else {
      // Create directory (ensure no trailing slash)
      const dirPath = cleanPath.replace(/\/$/, '');
      zip.folder(dirPath);
    }
  }
  
  // Ensure required files exist in expected locations
  ensureRequiredReactFiles(zip, rootFolder, options);
}

/**
* Ensure that required React files exist in the generated zip
* 
* @param {Object} zip - JSZip instance
* @param {Object} options - App generation options
*/
function ensureRequiredReactFiles(zip, rootFolder, options) {
  const { appName, description, version, author, includeTests } = options;

  // Check if package.json exists
  if (!zip.file(`${rootFolder}/package.json`)) {
    const packageJson = {
      name: appName,
      version: version,
      private: true,
      description: description,
      author: author || undefined,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1"
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      eslintConfig: {
        "extends": ["react-app", "react-app/jest"]
      },
      browserslist: {
        "production": [">0.2%", "not dead", "not op_mini all"],
        "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
      }
    };
    
    zip.file(`${rootFolder}/package.json`, JSON.stringify(packageJson, null, 2));
  }

  // Ensure public/index.html exists
  if (!zip.file(`${rootFolder}/public/index.html`)) {
    const publicFolder = zip.folder(`${rootFolder}/public`);
    publicFolder.file("index.html", `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${description}" />
  <title>${description}</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>`);
  }

  // Ensure src/ directory with required files
  const srcFolder = zip.folder(`${rootFolder}/src`);
  
  // src/index.js
  if (!zip.file(`${rootFolder}/src/index.js`)) {
    srcFolder.file("index.js", `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<React.StrictMode>
  <App />
</React.StrictMode>
);
`);
  }

  // src/App.js
  if (!zip.file(`${rootFolder}/src/App.js`)) {
    srcFolder.file("App.js", `import React from 'react';
import './App.css';

function App() {
return (
  <div className="App">
    <header className="App-header">
      <h1>${description}</h1>
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
    </header>
  </div>
);
}

export default App;
`);
  }

  // src/App.css
  if (!zip.file(`${rootFolder}/src/App.css`)) {
    srcFolder.file("App.css", `.App {
text-align: center;
}

.App-header {
background-color: #282c34;
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
font-size: calc(10px + 2vmin);
color: white;
}
`);
  }

  // src/index.css
  if (!zip.file(`${rootFolder}/src/index.css`)) {
    srcFolder.file("index.css", `body {
margin: 0;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

code {
font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
  monospace;
}
`);
  }
}

/**
* Get content for a specific file based on its path
* 
* @param {string} path - File path
* @param {Object} options - File generation options
* @returns {string} File content
*/
function getFileContent(path, options) {
  const { appName, description, version, author, includeTests } = options;

  // Extract filename and extension
  const filename = path.split('/').pop();
  const extension = filename.includes('.') ? filename.split('.').pop() : '';

  // Return appropriate content based on file type
  switch (filename) {
    case 'package.json':
      const packageJson = {
        name: appName,
        version: version,
        private: true,
        description: description,
        author: author || undefined,
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1"
        },
        scripts: {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        },
        eslintConfig: {
          "extends": ["react-app", "react-app/jest"]
        },
        browserslist: {
          "production": [">0.2%", "not dead", "not op_mini all"],
          "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
        }
      };
      return JSON.stringify(packageJson, null, 2);
    
    case 'index.html':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${description}" />
  <title>${description}</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>`;
    
    case 'index.js':
      return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<React.StrictMode>
  <App />
</React.StrictMode>
);
`;
    
    case 'App.js':
      return `import React from 'react';
import './App.css';

function App() {
return (
  <div className="App">
    <header className="App-header">
      <h1>${description}</h1>
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
    </header>
  </div>
);
}

export default App;
`;
    
    case 'App.css':
      return `.App {
text-align: center;
}

.App-header {
background-color: #282c34;
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
font-size: calc(10px + 2vmin);
color: white;
}
`;
    
    case 'index.css':
      return `body {
margin: 0;
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}

code {
font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
  monospace;
}
`;
    
    case 'App.test.js':
      if (includeTests) {
        return `import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
render(<App />);
const titleElement = screen.getByText(/${description}/i);
expect(titleElement).toBeInTheDocument();
});
`;
      }
      return '// Test file';
    
    case 'README.md':
      return `# ${appName}

${description}

## Available Scripts

In the project directory, you can run:

### \`npm install\`

Installs all the required dependencies.

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!
`;
    
    case '.gitignore':
      return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
    
    default:
      // For other JavaScript files
      if (extension === 'js') {
        return `// ${filename}\n// Generated file for ${appName}\n`;
      }
      
      // For other CSS files
      if (extension === 'css') {
        return `/* ${filename} */\n/* Generated styles for ${appName} */\n`;
      }
      
      // For JSON files
      if (extension === 'json') {
        return `{\n  "generated": true,\n  "app": "${appName}"\n}`;
      }
      
      // For HTML files
      if (extension === 'html' || extension === 'htm') {
        return `<!DOCTYPE html>\n<html>\n<head>\n  <title>${appName}</title>\n</head>\n<body>\n  <h1>${description}</h1>\n</body>\n</html>`;
      }
      
      // Default - empty file with comment
      return `// Generated file: ${filename}\n// Part of ${appName}\n`;
  }
}