import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Canonical section header for every page rail/block. Pairs a short
 * uppercase JetBrains-Mono eyebrow with a Fraunces display title, plus an
 * optional trailing action (e.g. "See all" link).
 *
 * Replaces the 30+ inline header variants — most of which used
 * `text-xs font-bold uppercase tracking-[0.12em..0.18em]` plus a serif
 * heading at 18–30px — with one shape. Tracking is locked to 0.14em and
 * title size to 24px (see DESIGN_NOTES.md).
 *
 * The eyebrow / title styles come from `.section-eyebrow` and
 * `.section-title` in index.css so the same values are reachable from
 * outside React (e.g. when migrating an older block one line at a time).
 */
interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Stack the action below the title on narrow screens (defaults to true). */
  stackOnMobile?: boolean;
  className?: string;
  /** Margin-bottom under the header. Defaults to mb-6 (24px). */
  spacing?: 'tight' | 'default' | 'loose';
  /** Heading level for the title. */
  as?: 'h1' | 'h2' | 'h3';
}

const SPACING: Record<NonNullable<SectionHeaderProps['spacing']>, string> = {
  tight: 'mb-4',
  default: 'mb-6',
  loose: 'mb-8',
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  action,
  stackOnMobile = true,
  className,
  spacing = 'default',
  as = 'h2',
}) => {
  const Heading = as as React.ElementType;
  return (
    <div
      className={cn(
        'flex items-end gap-4',
        stackOnMobile ? 'flex-col items-start sm:flex-row sm:items-end' : 'flex-row items-end',
        SPACING[spacing],
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        {eyebrow && <div className="section-eyebrow mb-2">{eyebrow}</div>}
        <Heading className="section-title">{title}</Heading>
        {description && (
          <p className="mt-2 text-sm text-ink-3 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 self-start sm:self-end">{action}</div>
      )}
    </div>
  );
};

export default SectionHeader;
