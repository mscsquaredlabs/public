// templates/php/phpBasics.js
// Provides skeletons for individual PHP code constructs

const phpBasics = {
    interface: ({ includeComments = true } = {}) => `
  ${includeComments ? '/**\n * Interface skeleton\n */' : ''}
  interface MyInterface {
      public function doSomething();
  }
    `.trim(),
  
    trait: ({ includeComments = true } = {}) => `
  ${includeComments ? '/**\n * Trait skeleton\n */' : ''}
  trait MyTrait {
      public function sharedBehavior() {
          // ...
      }
  }
    `.trim(),
  
    class: ({ includeComments = true } = {}) => `
  ${includeComments ? '/**\n * Class skeleton\n */' : ''}
  class MyClass {
      // properties
      private \$prop;
  
      public function __construct() {
          // ...
      }
  }
    `.trim(),
  
    function: ({ includeComments = true } = {}) => `
  ${includeComments ? '/**\n * Function skeleton\n */' : ''}
  function myFunction(\$arg) {
      // ...
  }
    `.trim(),
  
    constructor: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Constructor skeleton' : ''}
  public function __construct() {
      // initialization
  }
    `.trim(),
  
    method: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Method skeleton' : ''}
  public function myMethod() {
      // ...
  }
    `.trim(),
  
    forLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '// For loop skeleton' : ''}
  for (\$i = 0; \$i < 10; \$i++) {
      // loop body
  }
    `.trim(),
  
    foreachLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Foreach loop skeleton' : ''}
  foreach (\$items as \$item) {
      // loop body
  }
    `.trim(),
  
    whileLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '// While loop skeleton' : ''}
  while (\$condition) {
      // loop body
  }
    `.trim(),
  
    doWhileLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Do‑while loop skeleton' : ''}
  do {
      // loop body
  } while (\$condition);
    `.trim(),
  
    ifStatement: ({ includeComments = true } = {}) => `
  ${includeComments ? '// If statement skeleton' : ''}
  if (\$condition) {
      // then
  } else {
      // else
  }
    `.trim(),
  
    switchCase: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Switch statement skeleton' : ''}
  switch (\$value) {
      case 1:
          // ...
          break;
      default:
          // ...
          break;
  }
    `.trim(),
  
    tryCatch: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Try‑catch skeleton' : ''}
  try {
      // risky code
  } catch (\\Exception \$e) {
      // handle
  }
    `.trim(),
  
    namespaceDeclaration: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Namespace declaration skeleton' : ''}
  namespace App\\Http\\Controllers;
    `.trim(),
  
    useStatement: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Use statement skeleton' : ''}
  use App\\Models\\User;
    `.trim(),
  
    commentBlock: ({ includeComments = true } = {}) => `
  ${includeComments ? '/*\n * Comment block skeleton\n */' : ''}
    `.trim(),
  
    codeBlock: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Code block skeleton' : ''}
  {
      // ...
  }
    `.trim(),
  
    phpDocBlock: ({ includeComments = true } = {}) => `
  ${includeComments ? '/**\n * PHPDoc Block\n *\n * @param int \$id\n * @return void\n */' : ''}
    `.trim(),
  
    closure: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Closure skeleton' : ''}
  \$fn = function(\$x) {
      return \$x * 2;
  };
    `.trim(),
  
    arrowFunction: ({ includeComments = true } = {}) => `
  ${includeComments ? '// Arrow function skeleton (PHP 7.4+)' : ''}
  \$fn = fn(\$x) => \$x * 2;
    `.trim(),
  };
  
  export default phpBasics;
  