import { Component, ReactNode } from 'react';
import { isChunkError, reloadOnce } from '@/lib/lazyPage';

/** Last line of defence: an error while drawing a page shows a way forward instead of a blank white screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Page crashed:', error);
    // A stale deploy is the usual cause: fetching the new files fixes it without the visitor doing anything.
    if (isChunkError(error)) reloadOnce();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F7FBFA', color: '#0F1F1D', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ font: '500 28px Georgia, serif', margin: 0 }}>Something went wrong</h1>
          <p style={{ color: '#4F6F6A' }}>The page didn&rsquo;t load properly. Reloading usually fixes it.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
            <button onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 999, padding: '12px 22px', background: '#00594E', color: '#fff', font: '600 14px system-ui', cursor: 'pointer' }}>Reload</button>
            <a href="/" style={{ borderRadius: 999, padding: '12px 22px', boxShadow: 'inset 0 0 0 1.5px #D3E6E2', color: '#00594E', font: '600 14px system-ui', textDecoration: 'none' }}>Home</a>
          </div>
        </div>
      </div>
    );
  }
}
