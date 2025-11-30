/**
 * Helper functions for Node.js app generation
 */

/**
 * Generates Node.js application files
 * 
 * @param {Object} zip - JSZip instance
 * @param {Object} options - App generation options
 */
export const generateNodeApp = (zip, options) => {
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
    return generateCustomNodeApp(zip, customDirectoryTemplate, options);
  }
  
  // Create package.json
  const packageJson = {
    name: appName,
    version: version,
    description: description,
    main: "index.js",
    scripts: {
      "start": "node index.js",
      "dev": "nodemon index.js",
      "test": includeTests ? "jest" : "echo \"No tests specified\""
    },
    author: author || undefined,
    license: "MIT",
    dependencies: {
      "express": "^4.18.2"
    },
    devDependencies: {
      "nodemon": "^3.0.1",
      ...(includeTests ? { "jest": "^29.6.2" } : {})
    }
  };
  
  zip.file("package.json", JSON.stringify(packageJson, null, 2));
  
  // Create main server file
  zip.file("index.js", `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

app.listen(PORT, () => {
console.log(\`Server is running on port \${PORT}\`);
});
`);
  
  // Add tests if required
  if (includeTests) {
    const testFolder = zip.folder("tests");
    testFolder.file("index.test.js", `const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

describe('GET /', () => {
it('responds with hello world message', async () => {
  const response = await request(app).get('/');
  expect(response.statusCode).toBe(200);
  expect(response.text).toContain('Hello World');
});
});
`);
  }
  
  // Add README.md if required
  if (includeReadme) {
    zip.file("README.md", `# ${appName}

${description}

A simple Node.js Express application.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Start the server:

\`\`\`bash
npm start
\`\`\`

For development with auto-reload:

\`\`\`bash
npm run dev
\`\`\`

${includeTests ? '## Testing\n\n```bash\nnpm test\n```\n' : ''}

## API Endpoints

- \`GET /\`: Returns a Hello World message
`);
  }
  
  // Add .gitignore if required
  if (includeGitignore) {
    zip.file(".gitignore", `# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# dotenv environment variables file
.env
.env.test

# Coverage directory used by tools like istanbul
coverage/
`);
  }
};

/**
* Generate a Node.js app using a custom directory structure
* 
* @param {Object} zip - JSZip instance
* @param {string} directoryTemplate - Custom directory structure template
* @param {Object} options - App generation options
*/
function generateCustomNodeApp(zip, directoryTemplate, options) {
const { 
  appName, 
  description, 
  version, 
  author, 
  includeTests = true, 
  includeReadme = true, 
  includeGitignore = true 
} = options;

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
    const content = getNodeFileContent(path, { 
      appName, 
      description, 
      version, 
      author,
      includeTests
    });
    
    zip.file(path, content);
  }
}

// Ensure required files exist
ensureRequiredNodeFiles(zip, options);

// Add README.md and .gitignore if needed and not already in the structure
if (includeReadme && !paths.some(p => p.includes('README.md'))) {
  zip.file("README.md", `# ${appName}

${description}

A simple Node.js Express application.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Start the server:

\`\`\`bash
npm start
\`\`\`

For development with auto-reload:

\`\`\`bash
npm run dev
\`\`\`

${includeTests ? '## Testing\n\n```bash\nnpm test\n```\n' : ''}

## API Endpoints

- \`GET /\`: Returns a Hello World message
`);
}

if (includeGitignore && !paths.some(p => p.includes('.gitignore'))) {
  zip.file(".gitignore", `# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# dotenv environment variables file
.env
.env.test

# Coverage directory used by tools like istanbul
coverage/
`);
}
}

/**
* Ensure that required Node.js files exist in the generated zip
* 
* @param {Object} zip - JSZip instance
* @param {Object} options - App generation options
*/
function ensureRequiredNodeFiles(zip, options) {
const { appName, description, version, author, includeTests } = options;

// Check if package.json exists
if (!zip.file('package.json')) {
  const packageJson = {
    name: appName,
    version: version,
    description: description,
    main: "index.js",
    scripts: {
      "start": "node index.js",
      "dev": "nodemon index.js",
      "test": includeTests ? "jest" : "echo \"No tests specified\""
    },
    author: author || undefined,
    license: "MIT",
    dependencies: {
      "express": "^4.18.2"
    },
    devDependencies: {
      "nodemon": "^3.0.1",
      ...(includeTests ? { "jest": "^29.6.2" } : {})
    }
  };
  
  zip.file("package.json", JSON.stringify(packageJson, null, 2));
}

// Ensure index.js exists
if (!zip.file('index.js')) {
  zip.file("index.js", `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

app.listen(PORT, () => {
console.log(\`Server is running on port \${PORT}\`);
});
`);
}
}

/**
* Get content for a specific Node.js file based on its path
* 
* @param {string} path - File path
* @param {Object} options - File generation options
* @returns {string} File content
*/
function getNodeFileContent(path, options) {
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
      description: description,
      main: "index.js",
      scripts: {
        "start": "node index.js",
        "dev": "nodemon index.js",
        "test": includeTests ? "jest" : "echo \"No tests specified\""
      },
      author: author || undefined,
      license: "MIT",
      dependencies: {
        "express": "^4.18.2"
      },
      devDependencies: {
        "nodemon": "^3.0.1",
        ...(includeTests ? { "jest": "^29.6.2" } : {})
      }
    };
    return JSON.stringify(packageJson, null, 2);
    
  case 'index.js':
    return `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

app.listen(PORT, () => {
console.log(\`Server is running on port \${PORT}\`);
});
`;
    
  case 'server.js':
    return `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

app.listen(PORT, () => {
console.log(\`Server is running on port \${PORT}\`);
});
`;
  
  case 'app.js':
    return `const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

module.exports = app;
`;
    
  case 'index.test.js':
    if (includeTests) {
      return `const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

describe('GET /', () => {
it('responds with hello world message', async () => {
  const response = await request(app).get('/');
  expect(response.statusCode).toBe(200);
  expect(response.text).toContain('Hello World');
});
});
`;
    }
    return '// Test file';
    
  case 'README.md':
    return `# ${appName}

${description}

A simple Node.js Express application.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Start the server:

\`\`\`bash
npm start
\`\`\`

For development with auto-reload:

\`\`\`bash
npm run dev
\`\`\`

${includeTests ? '## Testing\n\n```bash\nnpm test\n```\n' : ''}

## API Endpoints

- \`GET /\`: Returns a Hello World message
`;
    
  case '.gitignore':
    return `# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# dotenv environment variables file
.env
.env.test

# Coverage directory used by tools like istanbul
coverage/
`;
   
  case '.env':
    return `# Environment Variables
PORT=3000
NODE_ENV=development
`;
    
  case '.env.example':
    return `# Example Environment Variables
PORT=3000
NODE_ENV=development
`;

  case 'routes.js':
    return `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
res.send('${description} - Hello World!');
});

module.exports = router;
`;
    
  case 'controllers.js':
    return `// Controllers for ${appName}

exports.getIndex = (req, res) => {
res.send('${description} - Hello World!');
};
`;
    
  case 'middleware.js':
    return `// Middleware for ${appName}

exports.logger = (req, res, next) => {
console.log(\`\${req.method} \${req.url}\`);
next();
};
`;
    
  default:
    // For other JavaScript files
    if (extension === 'js') {
      return `// ${filename}\n// Generated file for ${appName}\n`;
    }
    
    // For JSON files
    if (extension === 'json') {
      return `{\n  "generated": true,\n  "app": "${appName}"\n}`;
    }
    
    // For configuration files
    if (filename === '.npmrc' || filename === '.eslintrc' || filename === '.babelrc') {
      return `{\n  "generated": true\n}`;
    }
    
    // Default - empty file with comment
    return `// Generated file: ${filename}\n// Part of ${appName}\n`;
}
}