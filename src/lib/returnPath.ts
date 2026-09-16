/**
 * Where to send someone after they sign in or sign up. Only ever back into the
 * app, or to pricing (where checkout needs an account) — never an arbitrary
 * path taken from navigation state.
 */
export function safeReturnPath(state: unknown): string {
  const from = (state as { from?: { pathname?: string; search?: string } } | null)?.from;
  if (from?.pathname?.startsWith('/app')) return from.pathname;
  // Pricing keeps its query string so affiliate ?ref= codes survive signup.
  if (from?.pathname === '/pricing') return `/pricing${from.search ?? ''}`;
  return '/app';
}
