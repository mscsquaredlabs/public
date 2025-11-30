// templates/python/pythonBasics.js
// Provides skeletons for individual Python code constructs

/**
 * Map of basic Python code snippets keyed by template ID.
 * Each function returns a string containing the snippet.
 * Python uses indentation, not braces. Uses docstrings for function/class comments.
 * @param {object} options
 * @param {boolean} options.includeComments - Whether to include explanatory comments/docstrings
 * @param {string} options.functionName - Name for functions/methods
 * @param {string} options.className - Name for classes
 */
export const pythonBasics = {
    ifStatement: ({ includeComments = true } = {}) => `
  ${includeComments ? '# If statement skeleton\n' : ''}if condition:
      # Code to run if condition is true
      pass
  elif other_condition:
      # Code to run if other_condition is true
      pass
  else:
      # Code to run if no conditions are true
      pass`,
  
    forLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '# For loop skeleton (iterating over sequence)\n' : ''}my_list = [1, 2, 3, 4]
  for item in my_list:
      # Code to run for each item
      print(item)`,
  
    whileLoop: ({ includeComments = true } = {}) => `
  ${includeComments ? '# While loop skeleton\n' : ''}count = 0
  while count < 5:
      # Code to run as long as condition is true
      print(f"Count is {count}")
      count += 1`,
  
    // Python uses try...except
    tryExcept: ({ includeComments = true } = {}) => `
  ${includeComments ? '# Try...except block skeleton\n' : ''}try:
      # Code that might raise an exception
      risky_operation()
  except ValueError as ve:
      print(f"Caught a ValueError: {ve}")
      # Handle specific error
  except Exception as e:
      print(f"Caught an unexpected error: {e}")
      # Handle general errors
  else:
      # Code to run if no exceptions were raised in the try block
      print("Operation successful, no exceptions.")
  finally:
      # Code that runs regardless of whether an exception occurred
      print("Cleaning up resources.")`,
  
    // Python doesn't have built-in enums like Java/C#, but stdlib Enum is common
    enum: ({ includeComments = true, className = 'Status' } = {}) => `
  ${includeComments ? '# Enum definition using standard library\n' : ''}from enum import Enum, auto
  
  class ${className}(Enum):
      PENDING = auto()
      PROCESSING = auto()
      COMPLETED = auto()
      FAILED = auto()
  
  ${includeComments ? `# Usage example:
  # current_status = ${className}.PENDING
  # if current_status == ${className}.COMPLETED:
  #     print("Task finished!")
  ` : ''}`,
  
    // Method within a class context
    method: ({ includeComments = true, functionName = 'my_method' } = {}) => `
      ${includeComments ? `"""
      Method description.
  
      Args:
          param (Any): Parameter description.
  
      Returns:
          Any: Return value description.
      """` : ''}
      def ${functionName}(self, param):
          # Method implementation
          print(f"Executing ${functionName} with {param}")
          return param`,
  
    // Constructor within a class context (__init__)
    constructor: ({ includeComments = true } = {}) => `
      ${includeComments ? `"""
      Initialize the class instance.
  
      Args:
          arg1 (type): Description of arg1.
          kwarg1 (type, optional): Description. Defaults to None.
      """` : ''}
      def __init__(self, arg1, kwarg1=None):
          self.attribute1 = arg1
          self.attribute2 = kwarg1 or "default_value"
          # Initialize other properties`,
  
    importStatement: ({ includeComments = true } = {}) => `
  ${includeComments ? '# Import statement skeletons\n' : ''}import os
  import sys as system_module
  from collections import Counter, defaultdict
  from my_package.my_module import specific_function, SpecificClass
  from ..sibling_module import another_function`,
  
    commentBlock: ({ includeComments = true } = {}) => `
  ${includeComments ? `"""
  Module or Function Docstring.
  
  Provides a high-level description of the purpose of this
  module or function. Can span multiple lines.
  """` : ''}
  # This is a single-line comment.
  
  # Another comment explaining a specific part.
  pass # Use 'pass' as a placeholder in empty blocks`,
  
    // Added list comprehension as it's very Pythonic
    listComprehension: ({ includeComments = true } = {}) => `
  ${includeComments ? '# List comprehension skeleton\n' : ''}numbers = [1, 2, 3, 4, 5]
  squared_evens = [x*x for x in numbers if x % 2 == 0]
  # squared_evens will be [4, 16]`,
  
    // Added dictionary comprehension
    dictComprehension: ({ includeComments = true } = {}) => `
  ${includeComments ? '# Dictionary comprehension skeleton\n' : ''}keys = ['a', 'b', 'c']
  values = [1, 2, 3]
  my_dict = {k: v for k, v in zip(keys, values)}
  # my_dict will be {'a': 1, 'b': 2, 'c': 3}`,
  
  };