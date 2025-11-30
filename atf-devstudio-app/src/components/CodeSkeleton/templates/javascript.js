// templates/javascript.js
// Aggregator for JavaScript code templates

import { javascriptBasics } from './javascript/javascriptBasics.js';
import { jsComponent } from './javascript/javascriptComponent.js';
import { jsFunction } from './javascript/javascriptFunction.js';
import { jsApi } from './javascript/javascriptApi.js';
import { jsHook } from './javascript/javascriptHook.js';
import { jsClass } from './javascript/javascriptClass.js';
import { jsModule } from './javascript/javascriptModule.js';
import { jsCrud } from './javascript/javascriptCrud.js';
import { jsTest } from './javascript/javascriptTest.js';

// Merge basic JS snippets with full templates
const javascriptTemplates = {
  // Basic constructs (mapped from javascriptBasics)
  ...javascriptBasics,

  // Use case / specific file templates
  'component': jsComponent,
  'function': jsFunction, // Maps to the standalone function template
  'api': jsApi,           // Maps to the API endpoint template
  'hook': jsHook,
  'class': jsClass,       // Maps to the class template
  'module': jsModule,
  'crud': jsCrud,
  'test': jsTest,

  // Add mappings for any other specific templates if created
  // e.g., 'expressRoute': jsExpressRoute,
};

export default javascriptTemplates;