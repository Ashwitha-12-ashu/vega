import React from 'react';

/**
 * Global Error Boundary to prevent React White Screen of Death.
 * Catches unhandled JavaScript render errors anywhere in child components,
 * logs the exception, and renders a graceful, recoverable fallback UI.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('VEGA caught an unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Clear corrupted temporary coords if any
    try {
      const coords = localStorage.getItem('vega_user_coords');
      if (coords) {
        JSON.parse(coords);
      }
    } catch {
      localStorage.removeItem('vega_user_coords');
    }
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            backgroundColor: 'var(--slate-50, #f8fafc)',
            color: 'var(--slate-800, #1e293b)',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '1.25rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
              border: '1px solid var(--slate-200, #e2e8f0)',
              padding: '2.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '1.75rem',
                fontWeight: 800,
              }}
            >
              !
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--slate-900, #0f172a)',
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                color: 'var(--slate-600, #475569)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              We encountered an unexpected issue while loading this page.
              Don't worry — your data and account are safe.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: 'var(--primary-600, #0284c7)',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)',
                  transition: 'all 0.2s',
                }}
              >
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  backgroundColor: 'var(--slate-100, #f1f5f9)',
                  color: 'var(--slate-700, #334155)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--slate-200, #e2e8f0)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Return to Home
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  backgroundColor: '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#ef4444',
                  marginTop: '1rem',
                  overflowX: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Technical Details</summary>
                <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
