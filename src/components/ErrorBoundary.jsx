import React from 'react';

/**
 * Standard React Error Boundary
 * Catch errors in the component tree and show a minimal fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Minimal fallback UI
      return (
        <div className="min-h-screen bg-brand-sage flex items-center justify-center p-6 text-center">
          <div className="bg-brand-cream p-8 rounded-lg shadow-xl max-w-md border border-brand-charcoal/5">
            <h2 className="text-2xl font-medium text-brand-charcoal mb-4">Something went wrong</h2>
            <p className="text-brand-charcoal/60 mb-8 leading-relaxed">
              We encountered an unexpected error while rendering this page. 
              Please try refreshing the page or contacting support if the problem persists.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-brand-rose text-brand-charcoal px-8 py-3 rounded-md font-medium hover:bg-white transition-colors shadow-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
