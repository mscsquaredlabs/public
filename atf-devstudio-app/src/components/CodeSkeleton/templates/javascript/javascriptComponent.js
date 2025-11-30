// templates/javascript/javascriptComponent.js
// React Component Template

export const jsComponent = (options) => { // Renamed to jsComponent
    const {
      includeComments = true,
      includeTypeInfo = true, // Note: PropTypes less common with TS, but useful in JS
      includeTests = false,
      className = 'MyComponent'
    } = options;
  
    return `import React, { useState, useEffect } from 'react';
  ${includeTypeInfo ? "import PropTypes from 'prop-types';" : ""}
  
  ${includeComments ? `/**
   * ${className} - A functional React component.
   * Provides [brief description of component purpose].
   *
   * @param {object} props - Component properties.
   ${includeTypeInfo ? `* @param {string} props.title - An example title prop.
   * @param {function} props.onClick - An example click handler.` : ""}
   */` : ""}
  const ${className} = ({ title = "Default Title", onClick = () => {} ${includeTypeInfo ? "" : ", ...props"} }) => {
    ${includeComments ? '// --- State ---' : ''}
    const [count, setCount] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    ${includeComments ? '// --- Effects ---' : ''}
    useEffect(() => {
      ${includeComments ? '// Example effect: Fetch data on mount\n' : ''}
      setLoading(true);
      setError(null);
      fetch('/api/data') // Replace with your actual API endpoint
        .then(response => {
          if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
          }
          return response.json();
        })
        .then(result => {
          setData(result);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
          console.error("Failed to fetch data:", err);
        });
  
      ${includeComments ? '// Cleanup function (optional)\n' : ''}
      return () => {
        ${includeComments ? '// Perform cleanup if needed (e.g., cancel subscriptions)\n' : ''}
      };
    }, []); ${includeComments ? '// Empty dependency array means run once on mount' : ''}
  
    ${includeComments ? '// --- Handlers ---' : ''}
    const handleIncrement = () => {
      setCount(prevCount => prevCount + 1);
    };
  
    const handleClickInternal = (event) => {
      ${includeComments ? '// Call the passed-in onClick handler\n' : ''}
      onClick(event);
    }
  
    ${includeComments ? '// --- Render Logic ---' : ''}
    if (loading) {
      return <div className="${className.toLowerCase()}-loading">Loading...</div>;
    }
  
    if (error) {
      return <div className="${className.toLowerCase()}-error">Error: {error}</div>;
    }
  
    return (
      <div className="${className.toLowerCase()}">
        <h2>{title}</h2>
        <p>Current count: {count}</p>
        <button onClick={handleIncrement}>Increment</button>
        <button onClick={handleClickInternal}>External Action</button>
  
        {data && (
          <div className="data-section">
            <h3>Fetched Data:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
        {/* Add more component content/structure here */}
      </div>
    );
  };
  
  ${includeTypeInfo ? `
  ${className}.propTypes = {
    /** The title to display in the component */
    title: PropTypes.string,
    /** Function to call when the action button is clicked */
    onClick: PropTypes.func,
    // Define other prop types here
  };
  
  ${className}.defaultProps = {
    title: 'Default Component Title',
    onClick: () => { console.log('Default onClick handler'); },
    // Define other default props here
  };
  ` : ""}
  
  export default ${className};
  
  ${includeTests ? `
  // ================== TEST FILE (e.g., ${className}.test.js) ==================
  import React from 'react';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import '@testing-library/jest-dom'; // For extra matchers
  import ${className} from './${className}'; // Adjust import path as needed
  
  // Mock fetch globally for tests
  global.fetch = jest.fn();
  
  describe('${className} Component', () => {
    beforeEach(() => {
      // Reset mocks before each test
      fetch.mockClear();
      // Default mock response for successful fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });
    });
  
    test('renders with default title', async () => {
      render(<${className} />);
      // Wait for loading state to resolve
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
      expect(screen.getByRole('heading', { name: 'Default Component Title' })).toBeInTheDocument();
    });
  
    test('renders with provided title', async () => {
      render(<${className} title="Custom Test Title" />);
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
      expect(screen.getByRole('heading', { name: 'Custom Test Title' })).toBeInTheDocument();
    });
  
    test('increments count when increment button is clicked', async () => {
      render(<${className} />);
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
  
      const incrementButton = screen.getByRole('button', { name: 'Increment' });
      expect(screen.getByText('Current count: 0')).toBeInTheDocument();
  
      fireEvent.click(incrementButton);
      expect(screen.getByText('Current count: 1')).toBeInTheDocument();
  
      fireEvent.click(incrementButton);
      expect(screen.getByText('Current count: 2')).toBeInTheDocument();
    });
  
    test('calls onClick prop when action button is clicked', async () => {
      const handleClickMock = jest.fn();
      render(<${className} onClick={handleClickMock} />);
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
  
      const actionButton = screen.getByRole('button', { name: 'External Action' });
      fireEvent.click(actionButton);
  
      expect(handleClickMock).toHaveBeenCalledTimes(1);
    });
  
    test('displays fetched data successfully', async () => {
       // fetch mock is already set up in beforeEach to succeed
      render(<${className} />);
  
      // Wait for the loading text to disappear and data to appear
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
      expect(screen.getByText(/Fetched Data:/)).toBeInTheDocument();
      // Check for part of the mocked data
      expect(screen.getByText(/"message": "Success"/)).toBeInTheDocument();
    });
  
     test('displays error message when fetch fails', async () => {
      // Override fetch mock for this specific test to simulate failure
      fetch.mockRejectedValueOnce(new Error('Network Error'));
  
      render(<${className} />);
  
      // Wait for the loading text to disappear and error to appear
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
      expect(screen.getByText(/Error: Network Error/)).toBeInTheDocument();
    });
  
    // Add more tests: prop types validation (if using PropTypes), snapshots, etc.
  });
  ` : ""}
  `;
  };