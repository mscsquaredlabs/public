// ErrorBoundary.jsx
// A React error boundary component for gracefully handling runtime errors
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary-container" style={{
          padding: '20px',
          margin: '20px',
          borderRadius: '6px',
          backgroundColor: '#ffeded',
          border: '1px solid #f56565',
          color: '#c53030'
        }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginBottom: '15px' }}>
            <summary>Show error details</summary>
            <p><strong>{this.state.error && this.state.error.toString()}</strong></p>
            <p>Component Stack:</p>
            <pre style={{ 
              backgroundColor: '#fff1f1', 
              padding: '10px', 
              overflow: 'auto', 
              maxHeight: '200px', 
              fontSize: '12px',
              borderRadius: '4px'
            }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <div>
            <button 
              onClick={this.resetError}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '10px'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: '1px solid #e5e7eb',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;