/**
 * Helper functions for custom directory structure generation
 */

/**
 * Generates a custom application directory structure from a template
 * 
 * @param {Object} zip - JSZip instance
 * @param {string} template - Directory structure template
 * @param {Object} options - App generation options
 */
export const generateCustomApp = (zip, template, options) => {
  const { appName, description, version, author } = options;

  // Initialize with the root folder, which is often the app name
  let rootFolder = appName;
  
  // Parse the directory structure
  const lines = template.split('\n');
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
    const line = lines[i].trim();
    if (!line) continue;
    
    // Skip the root line (first line)
    if (i === 0 && line.indexOf('/') > -1) continue;
    
    // Calculate indentation to determine nesting level
    const originalLine = lines[i];
    const indentMatch = originalLine.match(/^(\s*)/);
    //const indentSize = indentMatch ? indentMatch[1].length : 0;
    const indentSize = getIndentLevel(originalLine);
    
    // Extract the path without tree characters
    const pathMatch = line.replace(/^[├└│├─\s]+/, '').trim();
    if (!pathMatch) continue;
    
    // Maintain a stack for nesting
    while (stack.length > 1 && stack[stack.length - 1].indent >= indentSize) {
      stack.pop();
    }
    
    // Build full path
    const parentPath = stack[stack.length - 1].path;
    const currentPath = parentPath ? `${parentPath}/${pathMatch}` : pathMatch;
    
    // Add to stack
    stack.push({ path: currentPath, indent: indentSize });
    
    // Add to flat paths list
    paths.push(currentPath);
  }
  
  // Process each path to create directories and files
  for (const path of paths) {
    const isFile = !path.endsWith('/') && path.includes('.');
    // Strip leading tree characters and adjust path
    const cleanPath = `${rootFolder}/${path.replace(/^[├└│\s─]+/, '')}`;
    
    if (isFile) {
      // Generate appropriate content based on file type
      const content = getFileContent(cleanPath, { appName, description, version, author });
      zip.file(cleanPath, content);
    } else {
      // Create directory (ensure no trailing slash)
      const dirPath = cleanPath.replace(/\/$/, '');
      zip.folder(dirPath);
    }
  }
  
  // Ensure required files exist in expected locations
  ensureRequiredFiles(zip, rootFolder, options);
};

/**
 * Ensure that critical files exist in the expected locations
 * 
 * @param {Object} zip - JSZip instance
 * @param {string} rootFolder - Root folder name
 * @param {Object} options - App generation options
 */
function ensureRequiredFiles(zip, rootFolder, options) {
  const { appName, description, version, author } = options;
  
  // Check for package.json
  if (!zip.file(`${rootFolder}/package.json`)) {
    const packageJson = {
      name: appName,
      version: version,
      description: description,
      main: "index.js",
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      author: author || "",
      license: "MIT",
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1"
      }
    };
    zip.file(`${rootFolder}/package.json`, JSON.stringify(packageJson, null, 2));
  }
  
  // Check for index.html in public folder
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
  
  // Check for essential files in src folder
  const srcFolder = zip.folder(`${rootFolder}/src`);
  
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
  
  // Check for README.md
  if (!zip.file(`${rootFolder}/README.md`)) {
    zip.file(`${rootFolder}/README.md`, `# ${appName}

${description}

## Available Scripts

In the project directory, you can run:

### \`npm install\`

Installs all the required dependencies.

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.
`);
  }
  
  // Check for .gitignore
  if (!zip.file(`${rootFolder}/.gitignore`)) {
    zip.file(`${rootFolder}/.gitignore`, `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

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
}

/**
 * Get appropriate content for a file based on its name and extension
 * 
 * @param {string} filePath - File path
 * @param {Object} options - Content generation options
 * @returns {string} Generated file content
 */
function getFileContent(filePath, options) {
  const { appName, description, version, author } = options;
  
  // Extract filename from path
  const fileName = filePath.split('/').pop();
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
  
  switch (fileName) {
    case 'package.json':
      const packageJson = {
        name: appName,
        version: version,
        description: description,
        main: "index.js",
        scripts: {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        },
        author: author || "",
        license: "MIT",
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1"
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

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.
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
      // Generic content based on file extension
      if (extension === 'js') {
        return `// ${fileName}\n// Generated file for ${appName}\n`;
      } else if (extension === 'css') {
        return `/* ${fileName} */\n/* Generated styles for ${appName} */\n`;
      } else if (extension === 'json') {
        return `{\n  "name": "${appName}",\n  "description": "${description}"\n}`;
      } else if (extension === 'html') {
        return `<!DOCTYPE html>\n<html>\n<head>\n  <title>${appName}</title>\n</head>\n<body>\n  <h1>${description}</h1>\n</body>\n</html>`;
      } else {
        return `# Generated file: ${fileName}\n# Part of ${appName}\n`;
      }
  }
}

export default function getIndentLevel(rawLine) {
  // first branch char ├ or └ (root lines return -1)
 
  /* first branch glyph ├ or └ …
     ───┬── pos = 0  → level 1
     │  └── pos = 4  → level 2  (4 chars = "│   ")
  */

    //const pos = rawLine.search(/[├└]/);
  const pos = rawLine.search(/[├└]/);
    //if (pos <= 0) return 0;          // root level
    //return Math.floor(pos / 4);      // every "│   " or "    " block = one level

  return pos === -1 ? 0 : Math.floor(pos / 4) + 1;
}

// …
//const indentSize = getIndentLevel(originalLine);   // use this value everywhere
