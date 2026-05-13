import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Canonical page wrapper. Locks the content column to one of three widths so
 * every page lives on the same horizontal rhythm:
 *
 *   - "default" (max-w-6xl / 1152px): the standard column for Discover, Profile,
 *     Activity, Experts, Pantry, RecipesForYou. Picked over the 7xl/5xl/3xl
 *     mix that was strewn across pages because 1152px is wide enough for a
 *     4-col card grid at the new card size without leaving cards lonely on
 *     1600–1920px monitors.
 *   - "narrow" (max-w-3xl / 768px): article-style reading columns (recipe
 *     detail body, friend review detail).
 *   - "wide" (no cap): full-bleed surfaces — map pages, reels viewer.
 *
 * Horizontal padding matches the 8-pt scale: px-5 (20px) on mobile, px-8
 * (32px) on >=md. The wrapper renders a plain <div> so callers can layer
 * their own grid / motion / background on top.
 */
export type PageShellWidth = 'narrow' | 'default' | 'wide';

interface PageShellProps {
  width?: PageShellWidth;
  className?: string;
  /**
   * When true (default), applies the responsive horizontal padding. Pass
   * `false` for pages that draw their own edge-to-edge sections (e.g. a
   * full-bleed hero) and want to add padding only inside specific blocks.
   */
  padded?: boolean;
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

const WIDTH_CLASS: Record<PageShellWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-none',
};

export const PageShell: React.FC<PageShellProps> = ({
  width = 'default',
  className,
  padded = true,
  children,
  as: Tag = 'div',
}) => {
  const Component = Tag as React.ElementType;
  return (
    <Component
      className={cn(
        'w-full mx-auto',
        WIDTH_CLASS[width],
        padded && 'px-5 md:px-8',
        className,
      )}
    >
      {children}
    </Component>
  );
};

export default PageShell;
