import { Link } from 'react-router-dom';

/** `inverted` — for sitting on a dark hero before the page has scrolled: swaps the
 *  gradient wordmark for plain white, and skips the colour-flip on the mark below.
 *
 *  The mark itself (logo.png) is transparent white line art, so it's invisible on a
 *  light background as-is — CSS-inverting it to black is what makes it work there too,
 *  without needing a second image file. On a dark background it's left untouched. */
export function Logo({ size = 'default', to = '/', inverted = false }: { size?: 'default' | 'lg'; to?: string; inverted?: boolean }) {
  const imgSize = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link to={to} className="flex items-center gap-2 group">
      <img
        src="/logo.png?v=5"
        alt="Think Decor"
        className={`${imgSize} object-contain ${inverted ? '' : 'invert'}`}
      />
      <span className={`${textSize} font-bold ${inverted ? 'text-white' : 'text-gradient-primary'}`}>
        Think Decor
      </span>
    </Link>
  );
}