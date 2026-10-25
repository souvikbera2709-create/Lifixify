import React from 'react';
import { AlertTriangle, RefreshCw, LogOut, ChevronDown } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught a runtime crash:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleClearAndReload = () => {
    try {
      localStorage.removeItem('lifixify_token');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060910] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0d1322] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-1">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-display font-black text-xl text-white tracking-tight">
                UI Runtime Shield Activated
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                A component error was safely intercepted to prevent a blank screen.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-rose-300 font-mono overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Reload Page
              </button>
            </div>

            <button
              onClick={this.handleClearAndReload}
              className="text-[11px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
            >
              Clear Stale Session &amp; Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
