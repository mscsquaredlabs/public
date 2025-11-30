// templates/python.js
// Aggregator for Python code templates

import { pythonBasics } from './python/pythonBasics.js';
import { pyFunction } from './python/pythonFunction.js';
import { pyClass } from './python/pythonClass.js';
import { pyFastApi } from './python/pythonFastApi.js';
import { pyFlask } from './python/pythonFlask.js';
import { pyDjango } from './python/pythonDjango.js';
import { pyScript } from './python/pythonScript.js';
import { pyTest } from './python/pythonTest.js';

// Merge basic Python snippets with full templates
const pythonTemplates = {
  // Basic constructs (mapped from pythonBasics)
  ...pythonBasics,
  // Map common tryCatch ID to Python's tryExcept
  'tryCatch': pythonBasics.tryExcept,

  // Core / specific file templates (using common IDs where applicable)
  'function': pyFunction,
  'class': pyClass,
  'api': pyFastApi, // Default API endpoint to FastAPI
  'crud': pyFastApi, // Map CRUD to FastAPI as it includes CRUD concepts
  'test': pyTest,   // Generic pytest structure

  // Framework-specific templates
  'fastapi': pyFastApi,
  'flask': pyFlask,
  'django': pyDjango,

  // Other specific templates
  'script': pyScript,

  // Add mappings for any other specific templates if created
  // e.g., 'dataClass': pyDataClass,
};

// Use default export for consistency
export default pythonTemplates;