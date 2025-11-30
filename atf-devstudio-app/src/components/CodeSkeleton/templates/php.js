// templates/php.js
// Aggregator for all PHP code skeleton templates

import class_      from './php/class_.js';
import controller  from './php/controller.js';
import model       from './php/model.js';
import api         from './php/api.js';
import service     from './php/service.js';
import repository  from './php/repository.js';
import phpBasics   from './php/phpBasics.js';

const phpTemplates = {
  // common “full” templates
  class:       class_,
  controller:  controller,
  model:       model,
  api:         api,
  service:     service,
  repository:  repository,

  // alias
  crud:        api,

  // now flatten in all the basics
  ...phpBasics
};

export default phpTemplates;
