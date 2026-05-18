import { Link } from 'react-router-dom';

export function Logo({ size = 'default' }: { size?: 'default' | 'lg' }) {
  const imgSize = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <img src="/logo.png?v=2" alt="ThinkDecor" className={`${imgSize} rounded-lg`} />
      <span className={`${textSize} font-bold text-gradient-primary`}>
        ThinkDecor
      </span>
    </Link>
  );
}