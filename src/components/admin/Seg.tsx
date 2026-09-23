import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
}

/** The mockup's `.seg` segmented control, done with a framer-motion layoutId pill instead of measuring DOM offsets by hand. */
export function Seg<T extends string>({
  options, value, onChange, dark, sm, layoutId,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  dark?: boolean;
  sm?: boolean;
  layoutId: string;
}) {
  return (
    <div className={`seg${dark ? ' dark' : ''}${sm ? ' sm' : ''}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} className={active ? 'on' : ''}>
            {active && (
              <motion.span layoutId={layoutId} className="ind" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className="relative z-[1] inline-flex items-center gap-1.5">
              {o.icon}
              {o.label}
              {o.count !== undefined && <span>{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
