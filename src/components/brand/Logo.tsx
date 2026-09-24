import { Link } from 'react-router-dom';

/** `inverted` swaps the gradient wordmark for plain white — for sitting on a dark hero
 *  before the page has scrolled, where the usual dark-on-light gradient loses contrast. */
export function Logo({ size = 'default', to = '/', inverted = false }: { size?: 'default' | 'lg'; to?: string; inverted?: boolean }) {
  const imgSize = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link to={to} className="flex items-center gap-2 group">
      <img src="/logo.png?v=4" alt="Think Decor" className={`${imgSize} rounded-lg`} />
      <span className={`${textSize} font-bold ${inverted ? 'text-white' : 'text-gradient-primary'}`}>
        Think Decor
      </span>
    </Link>
  );
}