import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  LoadingSkeleton,
  type LoadingSkeletonVariant,
} from '../LoadingSkeleton';

/**
 * Canonical loading state. Replaces the bare `<Loader2 className="animate-spin" />`
 * spinners scattered through Discover, RestaurantDetail, and friends with a
 * single component that picks the right placeholder shape.
 *
 *   <LoadingState variant="cards" count={6} />     // skeleton card grid
 *   <LoadingState variant="rows" count={8} />      // skeleton list rows
 *   <LoadingState variant="spinner" label="..." /> // centered spinner+label
 *
 * The skeleton variants wrap `LoadingSkeleton` so any tint or pulse-rate
 * changes propagate automatically.
 */
interface LoadingStateProps {
  variant?: 'cards' | 'rows' | 'spinner' | 'text';
  count?: number;
  label?: string;
  className?: string;
  /** Grid columns for the cards variant. Defaults to responsive 2/3/4. */
  gridClassName?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  count = 6,
  label,
  className,
  gridClassName,
}) => {
  if (variant === 'cards') {
    return (
      <div
        className={cn(
          'grid gap-6',
          gridClassName ?? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          className,
        )}
      >
        {renderRange(count, 'card')}
      </div>
    );
  }

  if (variant === 'rows') {
    return (
      <div className={cn('divide-y divide-on-surface/[0.06]', className)}>
        {renderRange(count, 'list-item')}
      </div>
    );
  }

  if (variant === 'text') {
    return <LoadingSkeleton variant="text" className={className} />;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-ink-3',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={24} className="animate-spin" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
};

function renderRange(count: number, variant: LoadingSkeletonVariant) {
  return Array.from({ length: count }).map((_, i) => (
    <LoadingSkeleton key={i} variant={variant} />
  ));
}

export default LoadingState;
