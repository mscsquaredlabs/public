// templates/python/pythonClass.js
// Python Class Template

export const pyClass = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      className = 'MyClass'
    } = options || {};
  
    return `${includeComments ? `"""
  Module providing the ${className} class.
  """` : ""}
  class ${className}:
      ${includeComments ? `"""
      Represents a ${className}.
  
      Encapsulates data and methods related to ${className}.
  
      Attributes:
          name (str): The name of the instance.
          value (int): An integer value associated with the instance.
      """` : ""}
  
      # Class variable (shared across instances)
      # default_prefix = "ITEM"
  
      def __init__(self, name: str, value: int = 0):
          ${includeComments ? `"""
          Initializes a new ${className} instance.
  
          Args:
              name (str): The name for this instance.
              value (int, optional): An initial value. Defaults to 0.
          """` : ""}
          if not isinstance(name, str) or not name:
              raise ValueError("Name must be a non-empty string")
          if not isinstance(value, int):
              raise ValueError("Value must be an integer")
  
          self.name = name
          self.value = value
          # Example private attribute (by convention)
          self._internal_counter = 0
  
      def get_description(self) -> str:
          ${includeComments ? `"""Returns a description of the instance."""` : ""}
          return f"{self.name} has a value of {self.value}"
  
      def increment_value(self, amount: int = 1) -> None:
          ${includeComments ? `"""Increments the instance's value."""` : ""}
          if not isinstance(amount, int):
              raise ValueError("Amount must be an integer")
          self.value += amount
          self._internal_counter += 1
  
      def get_internal_count(self) -> int:
           ${includeComments ? `"""Returns the internal counter value."""` : ""}
           return self._internal_counter
  
      @classmethod
      def from_config(cls, config: dict):
           ${includeComments ? `"""Creates an instance from a configuration dictionary (Class Method example)."""` : ""}
           name = config.get('name', 'Default from Config')
           value = config.get('value', 0)
           return cls(name=name, value=value)
  
      @staticmethod
      def utility_helper(data: list) -> int:
          ${includeComments ? `"""A static helper method (doesn't depend on instance or class)."""` : ""}
          return sum(item for item in data if isinstance(item, int))
  
      def __str__(self) -> str:
          ${includeComments ? `"""String representation for end-users."""` : ""}
          return self.get_description()
  
      def __repr__(self) -> str:
          ${includeComments ? `"""Detailed string representation for developers."""` : ""}
          return f"${self.__class__.__name__}(name='{self.name}', value={self.value})"
  
  ${includeTests ? `
  # ================== TEST FILE (e.g., test_${className.toLowerCase()}.py) ==================
  import unittest
  from .${className.toLowerCase()}_module import ${className} # Adjust import path
  
  class Test${className}(unittest.TestCase):
  
      def test_initialization_valid(self):
          """Test successful initialization."""
          instance = ${className}("Test Item", 10)
          self.assertEqual(instance.name, "Test Item")
          self.assertEqual(instance.value, 10)
          self.assertEqual(instance.get_internal_count(), 0)
  
      def test_initialization_invalid(self):
          """Test initialization with invalid arguments."""
          with self.assertRaises(ValueError, msg="Name must be non-empty"):
              ${className}("")
          with self.assertRaises(ValueError, msg="Name must be string"):
              ${className}(123)
          with self.assertRaises(ValueError, msg="Value must be integer"):
              ${className}("Valid Name", "not a number")
  
      def test_get_description(self):
          instance = ${className}("Gadget", 5)
          self.assertEqual(instance.get_description(), "Gadget has a value of 5")
  
      def test_increment_value(self):
          instance = ${className}("Counter", 0)
          instance.increment_value()
          self.assertEqual(instance.value, 1)
          self.assertEqual(instance.get_internal_count(), 1)
          instance.increment_value(5)
          self.assertEqual(instance.value, 6)
          self.assertEqual(instance.get_internal_count(), 2)
          with self.assertRaises(ValueError, msg="Amount must be integer"):
               instance.increment_value("abc")
  
      def test_string_representations(self):
          instance = ${className}("Widget", 99)
          self.assertEqual(str(instance), "Widget has a value of 99")
          self.assertEqual(repr(instance), "${className}(name='Widget', value=99)")
  
      def test_classmethod_from_config(self):
          config = {'name': 'Config Item', 'value': 50}
          instance = ${className}.from_config(config)
          self.assertEqual(instance.name, 'Config Item')
          self.assertEqual(instance.value, 50)
  
      def test_staticmethod_utility_helper(self):
          data = [1, 'a', 2, 3, 'b']
          self.assertEqual(${className}.utility_helper(data), 6)
  
  
  if __name__ == '__main__':
      unittest.main()
  ` : ""}
  `;
  };