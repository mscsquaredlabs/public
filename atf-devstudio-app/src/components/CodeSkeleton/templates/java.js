// src/templates/java.js
// Aggregator for all Java code templates, including basic constructs

import { javaApi } from './java/javaApi.js';
import { javaClass } from './java/javaClass.js';
import { javaEntity } from './java/javaEntity.js';
import { javaFunction } from './java/javaFunction.js';
import { javaSpringController } from './java/javaSpringController.js';
import { javaBasics } from './java/javaBasics.js';

// Merge basic Java snippets (interface, enum, etc.) with full templates
const javaTemplates = {
  // Basic constructs (mapped from javaBasics)
  ...javaBasics,

  // Core templates
  'function': javaFunction,
  'class': javaClass,
  'api': javaApi,

  // Java-specific templates
  'springcontroller': javaSpringController,
  'entity': javaEntity,

  // Alias for CRUD operations
  'crud': javaApi
};

export default javaTemplates;
