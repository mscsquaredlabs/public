// templates/python/pythonScript.js
// Python Script Template

export const pyScript = (options) => {
    const {
      includeComments = true,
      includeTests = false, // Simple inline tests or suggest separate test file
      scriptName = 'my_script',
      includeArgparse = true
    } = options || {};
  
    return `${includeComments ? '#!/usr/bin/env python3\n"""\n' + scriptName + ' - Description of the script purpose.\n\nUsage:\n    python ' + scriptName + '.py [--input <file>] [--output <file>] [--verbose]\n"""' : "#!/usr/bin/env python3"}
  import sys
  ${includeArgparse ? 'import argparse' : ''}
  import logging
  import os # Example import
  
  ${includeComments ? '# --- Setup Logging ---' : ""}
  logging.basicConfig(
      level=logging.INFO,
      format='%(asctime)s [%(levelname)-5.5s] %(message)s',
      handlers=[logging.StreamHandler(sys.stdout)] # Log to stdout
  )
  log = logging.getLogger(__name__)
  
  ${includeComments ? '# --- Core Functions ---' : ""}
  def process_data(input_data):
      ${includeComments ? '"""Example function to process data."""' : ""}
      log.info("Processing data...")
      # Replace with your actual processing logic
      processed_result = input_data.upper() if isinstance(input_data, str) else None
      log.debug(f"Processed result: {processed_result}")
      return processed_result
  
  def read_input_file(filepath):
      ${includeComments ? '"""Reads content from the input file."""' : ""}
      try:
          log.info(f"Reading from {filepath}")
          with open(filepath, 'r', encoding='utf-8') as f:
              content = f.read()
          return content
      except FileNotFoundError:
          log.error(f"Input file not found: {filepath}")
          raise # Re-raise the exception
      except Exception as e:
          log.error(f"Error reading file {filepath}: {e}")
          raise
  
  def write_output_file(filepath, content):
       ${includeComments ? '"""Writes content to the output file."""' : ""}
      try:
          log.info(f"Writing to {filepath}")
          # Ensure directory exists if needed
          # os.makedirs(os.path.dirname(filepath), exist_ok=True)
          with open(filepath, 'w', encoding='utf-8') as f:
              f.write(content)
      except Exception as e:
          log.error(f"Error writing file {filepath}: {e}")
          raise
  
  ${includeComments ? '# --- Argument Parsing (if enabled) ---' : ""}
  ${includeArgparse ? `
  def parse_arguments():
      ${includeComments ? '"""Parses command-line arguments."""' : ""}
      parser = argparse.ArgumentParser(
          description='${scriptName} - A script to [briefly describe what it does].',
          epilog='Example: python ${scriptName}.py -i input.txt -o output.txt -v'
      )
      parser.add_argument(
          '-i', '--input',
          metavar='FILE',
          type=str,
          help='Path to the input file.'
      )
      parser.add_argument(
          '-o', '--output',
          metavar='FILE',
          type=str,
          help='Path to the output file.'
      )
      parser.add_argument(
          '-v', '--verbose',
          action='store_true',
          help='Enable verbose logging (DEBUG level).'
      )
      # Add more arguments as needed
      # parser.add_argument('--config', type=str, default='config.json', help='Configuration file path')
  
      return parser.parse_args()
  ` : ''}
  
  ${includeComments ? '# --- Main Execution ---' : ""}
  def main():
      ${includeComments ? '"""Main entry point and execution logic."""' : ""}
      ${includeArgparse ? `
      args = parse_arguments()
  
      if args.verbose:
          log.setLevel(logging.DEBUG)
          log.debug("Verbose logging enabled.")
          log.debug(f"Arguments received: {args}")
  
      input_path = args.input
      output_path = args.output
      ` : `
      # Basic argument handling without argparse
      input_path = sys.argv[1] if len(sys.argv) > 1 else None
      output_path = sys.argv[2] if len(sys.argv) > 2 else None
      # Check for '-v' manually if needed
      if '-v' in sys.argv or '--verbose' in sys.argv:
           log.setLevel(logging.DEBUG)
           log.debug("Verbose logging enabled.")
      ` }
  
      try:
          log.info(f"Starting script: ${scriptName}")
  
          input_content = None
          if input_path:
              input_content = read_input_file(input_path)
          else:
              log.warning("No input file specified.")
              # Handle missing input, e.g., read from stdin or use default
              # input_content = sys.stdin.read()
  
          if input_content:
              processed_content = process_data(input_content)
          else:
              processed_content = "No input data to process."
  
          if output_path:
              write_output_file(output_path, processed_content)
          else:
              log.warning("No output file specified. Printing result to console:")
              print("--- Output ---")
              print(processed_content)
              print("--------------")
  
          log.info(f"Script ${scriptName} finished successfully.")
          return 0 # Indicate success
  
      except FileNotFoundError:
          # Already logged in read_input_file
          return 1 # Indicate specific error
      except Exception as e:
          log.exception(f"An unexpected error occurred during script execution: {e}")
          # Use log.exception to include traceback in logs
          return 1 # Indicate general error
  
  ${includeTests ? `
  # ================== Simple Inline Tests (Consider moving to pytest file) ==================
  def _run_tests():
      ${includeComments ? '"""Basic self-test function."""\n' : ''}
      log.info("Running basic tests...")
      test_passed = True
      try:
          # Test process_data
          assert process_data("hello") == "HELLO", "Test process_data failed"
          assert process_data(123) is None, "Test process_data with non-string failed"
  
          # Test argument parsing (requires mocking sys.argv or argparse)
          # This is better done with a proper test framework like pytest
  
          # Mock file operations if needed for read/write tests (using unittest.mock or pytest tmp_path)
  
          log.info("Basic tests passed.")
      except AssertionError as e:
          log.error(f"Test assertion failed: {e}")
          test_passed = False
      except Exception as e:
          log.error(f"Error during tests: {e}")
          test_passed = False
      return test_passed
  ` : ""}
  
  if __name__ == "__main__":
      ${includeTests ? `
      if "--test" in sys.argv:
          log.info("Executing test suite...")
          passed = _run_tests()
          sys.exit(0 if passed else 1)
      else:
          return_code = main()
          sys.exit(return_code)
      ` : `
      return_code = main()
      sys.exit(return_code)
      `}
  `;
  };