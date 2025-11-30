// templates/python/pythonFunction.js
// Python Function Template

export const pyFunction = (options) => {
    const {
      includeComments = true,
      includeTests = false,
      functionName = 'my_function'
    } = options || {};
  
    return `${includeComments ? `"""
  ${functionName}
  
  Brief description of what the function does.
  
  Args:
      param1 (type): Description of parameter 1.
      param2 (type, optional): Description of optional parameter. Defaults to None.
  
  Returns:
      type: Description of the return value.
  
  Raises:
      ValueError: If inputs are invalid (example).
  """` : ""}
  def ${functionName}(param1, param2=None):
      ${includeComments ? '# --- Input Validation ---\n' : ''}
      if not param1: # Example validation
          raise ValueError("param1 cannot be empty")
  
      ${includeComments ? '# --- Function Logic ---\n' : ''}
      result = f"Processed {param1}"
      if param2:
          result += f" with {param2}"
  
      ${includeComments ? '# --- Return Value ---\n' : ''}
      return result
  
  ${includeTests ? `
  # ================== TEST FILE (e.g., test_${functionName}.py) ==================
  import pytest # Using pytest as an example
  from .${functionName}_module import ${functionName} # Adjust import path as needed
  
  def test_${functionName}_basic():
      """Test basic functionality with required parameter."""
      assert ${functionName}("hello") == "Processed hello"
  
  def test_${functionName}_with_optional_param():
      """Test with the optional parameter."""
      assert ${functionName}("hello", "world") == "Processed hello with world"
  
  def test_${functionName}_invalid_input():
      """Test that it raises error for invalid input."""
      with pytest.raises(ValueError, match="param1 cannot be empty"):
          ${functionName}("")
      with pytest.raises(ValueError, match="param1 cannot be empty"):
          ${functionName}(None)
  
  # Add more tests for edge cases, types, etc.
  ` : ""}
  
  # Example of how to call the function if run directly
  if __name__ == "__main__":
      print(${functionName}("example input", param2="optional value"))
  `;
  };