import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1>Oops! Ceva nu a mers bine.</h1>
                    <p>Ne pare rău pentru inconveniență. Vă rugăm să încercați din nou.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="retry-button"
                    >
                        Reîncarcă pagina
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="error-details">
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 