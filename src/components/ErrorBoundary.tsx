'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || 'Ocorreu um erro inesperado'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn btn-primary"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}