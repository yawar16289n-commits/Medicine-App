import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 mt-12">
          <div className="bg-white border-2 border-red-500 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-500 text-white px-6 py-4">
              <h4 className="text-2xl font-bold flex items-center gap-2">
                ⚠️ Something went wrong
              </h4>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                We&apos;re sorry — something unexpected happened. Please try refreshing the page.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4">
                  <summary className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 inline-block">
                    Show error details (dev mode)
                  </summary>
                  <pre className="mt-3 p-4 bg-gray-100 border border-gray-300 rounded-lg overflow-auto text-xs">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg transition-colors font-medium"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
                <button
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => window.location.href = '/'}
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
