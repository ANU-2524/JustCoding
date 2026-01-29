import React from 'react';
import { FaExclamationTriangle, FaSync, FaHome } from 'react-icons/fa';
import '../Style/ErrorBoundary.css';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 * Prevents entire app from crashing when a single component fails
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  /**
   * Update state so next render shows fallback UI
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error to console and tracking service
   */
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by Error Boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // You can also log to an error tracking service here
    // logErrorToService(error, errorInfo);
  }

  /**
   * Reset error boundary state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Navigate to home page
   */
  handleNavigateHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>

            <h1 className="error-title">Oops! Something went wrong</h1>

            <p className="error-message">
              We're sorry, but something unexpected happened. The application has encountered an error 
              and needs to recover.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details" open>
                <summary className="error-summary">Error Details (Development Only)</summary>
                <div className="error-stack">
                  <p className="error-type">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="error-trace">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {this.state.errorCount > 3 && (
              <div className="error-warning">
                <p>
                  ⚠️ Multiple errors detected. It's recommended to reload the page or go to home.
                </p>
              </div>
            )}

            <div className="error-actions">
              <button 
                className="error-btn retry-btn"
                onClick={this.handleReset}
              >
                <FaSync /> Try Again
              </button>

              <button 
                className="error-btn home-btn"
                onClick={this.handleNavigateHome}
              >
                <FaHome /> Go Home
              </button>
            </div>

            <p className="error-help">
              If the problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
