import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LinguaBridge Global Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto text-2xl font-bold">
              🌐
            </div>
            <h2 className="text-xl font-bold text-white">LinguaBridge Active</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your session state has been updated. Click the button below to proceed to your dashboard.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] text-amber-400 font-mono bg-amber-950/30 p-2 rounded-xl border border-amber-500/20">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition shadow-lg shadow-brand-500/30"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
