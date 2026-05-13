import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Canonical filter / chip pill. Replaces the four (or more) inline pill
 * specs in use across the app — varying heights of 8/9/10, paddings
 * px-3 / px-3.5 / px-5, half a dozen background tints. Locked to:
 *
 *   h-9 (36px) · px-4 · rounded-full · text-sm font-medium
 *   idle:   bg-on-surface/[0.05] hover:bg-on-surface/[0.08]
 *   active: bg-on-surface text-surface
 *
 * Use the same component for both static filter chips (pass `active`
 * and `onClick`) and as a static badge (pass `as="span"` without
 * onClick). A leading icon slot is supported via the `icon` prop so
 * "Hotel" / "Open now" / "Friends" chips stay visually consistent.
 */
interface FilterPillProps {
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  as?: 'button' | 'span';
  ariaLabel?: string;
  type?: 'button' | 'submit';
  size?: 'sm' | 'md';
}

const SIZE: Record<NonNullable<FilterPillProps['size']>, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
};

export const FilterPill: React.FC<FilterPillProps> = ({
  active = false,
  onClick,
  icon,
  trailing,
  disabled = false,
  children,
  className,
  as = 'button',
  ariaLabel,
  type = 'button',
  size = 'md',
}) => {
  const base = cn(
    'inline-flex items-center rounded-full font-medium transition-colors duration-150 select-none whitespace-nowrap',
    SIZE[size],
    active
      ? 'bg-on-surface text-surface'
      : 'bg-on-surface/[0.05] text-on-surface hover:bg-on-surface/[0.08]',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className,
  );

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {trailing && <span className="flex-shrink-0">{trailing}</span>}
    </>
  );

  if (as === 'span' || !onClick) {
    return (
      <span className={base} aria-label={ariaLabel}>
        {content}
      </span>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={base}
    >
      {content}
    </button>
  );
};

export default FilterPill;
