import React from 'react';
import { cn } from '../../lib/utils';
import { EmptyState as CanonicalEmptyState } from '../EmptyState';

/**
 * Thin wrapper / re-export of the canonical `components/EmptyState` so every
 * empty surface in the app reaches for the same primitive. Most call sites
 * should use this directly:
 *
 *   <EmptyStateView icon={<Compass size={48} />} heading="No reviews yet"
 *      description="Be the first to add one." />
 *
 * An additional `tone` prop offers a compact inline variant for the
 * "nothing in this rail yet" slots that today render bespoke JSX inside
 * Discover and RestaurantDetailDesktop.
 */
interface EmptyStateViewProps {
  icon: React.ReactNode;
  heading: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** 'default' = the full centered block; 'inline' = compact, smaller icon. */
  tone?: 'default' | 'inline';
  className?: string;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  icon,
  heading,
  description,
  action,
  tone = 'default',
  className,
}) => {
  if (tone === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 rounded-2xl bg-on-surface/[0.03] px-6 py-6 text-on-surface/70',
          className,
        )}
      >
        <div className="text-on-surface/30 flex-shrink-0" aria-hidden="true">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-on-surface/85 truncate">{heading}</p>
          {description && (
            <p className="mt-0.5 text-sm text-on-surface/55 truncate">
              {description}
            </p>
          )}
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="flex-shrink-0 px-4 h-9 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <CanonicalEmptyState
      icon={icon}
      heading={heading}
      description={description}
      action={action}
      className={className}
    />
  );
};

export default EmptyStateView;
