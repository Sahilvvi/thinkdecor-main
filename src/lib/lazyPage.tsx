import { ComponentType, Suspense, lazy } from 'react';

/**
 * Why this exists: after every deploy the file names of the lazily loaded pages change. A tab that was open
 * before the deploy asks for a file that no longer exists, the import fails, and the page went blank until a
 * manual refresh. This wrapper (1) retries once, (2) reloads the page once so it picks up the new files, and
 * (3) shows a spinner instead of a blank screen while a page loads.
 */
const RELOAD_KEY = 'td_chunk_reload';

export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 15_000) return false; // already tried a moment ago: don't loop
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch { /* storage blocked: reload anyway */ }
  window.location.reload();
  return true;
}

export const isChunkError = (e: unknown) =>
  /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch dynamically|error loading dynamically/i.test(
    String((e as Error)?.message ?? e),
  );

export function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyPage<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  const Lazy = lazy(async () => {
    try {
      return await factory();
    } catch (first) {
      await new Promise((r) => setTimeout(r, 400));
      try {
        return await factory();
      } catch (second) {
        if (isChunkError(second) && reloadOnce()) return new Promise<{ default: T }>(() => {}); // page is reloading
        throw second;
      }
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Page = (props: any) => (
    <Suspense fallback={<PageSpinner />}>
      <Lazy {...props} />
    </Suspense>
  );
  return Page;
}

/** Fetch the pages people are about to open while the browser is idle, so clicking never waits on the network. */
export function prefetchPages(factories: Array<() => Promise<unknown>>) {
  const run = () => factories.forEach((f) => f().catch(() => {}));
  const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
  if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2500);
}
