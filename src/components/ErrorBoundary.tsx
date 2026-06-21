import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled runtime exception caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="backdrop-blur-md bg-red-500/5 border border-red-500/20 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white font-sans uppercase tracking-tight">
              Admissions Engine Interrupt
            </h2>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              A temporary runtime rendering exception was encountered. This can occasionally occur during offline state synchronization or chart layout recalibrations.
            </p>
          </div>

          {this.state.error && (
            <div className="bg-[#080d1a] border border-white/5 rounded-xl p-4 text-left">
              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-500 block mb-1">
                Diagnostic Trace
              </span>
              <p className="font-mono text-[11px] text-rose-300 break-all select-all leading-normal">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/15 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Workspace Terminal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
