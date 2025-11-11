

'use client';

import React from 'react';

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('[UI ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold mb-2">Noget gik galt på siden</h2>
            <p className="text-sm text-zinc-600">
              {this.state.message ?? 'Uventet fejl. Prøv at opdatere eller gå tilbage.'}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}