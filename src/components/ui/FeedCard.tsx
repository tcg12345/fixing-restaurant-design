import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

/**
 * Photo-forward feed card primitive. Replaces the patchwork of inline
 * restaurant / recipe / guide / reel cards across Discover, Profile, and
 * the search results grid. One radius, one shadow, one hover treatment,
 * one metadata column.
 *
 * Spec (locked in DESIGN_NOTES.md):
 *  - 4:3 photo top, full-bleed inside the card radius.
 *  - 16px (p-4) metadata padding below the photo.
 *  - Overlay actions (heart / score badge / hotel pill) anchored at top-3
 *    / right-3 / left-3 — one shared offset across all card types.
 *  - rounded-2xl. No border — the --shadow-card token provides the edge.
 *  - Hover: -translate-y-0.5 + --shadow-card-hover. Transition ~200ms.
 *  - Title: Fraunces 17–18px (we settle on 17px / leading-snug / tracking-tight).
 *  - Subhead: Manrope 13px in ink-3, sentence case. No uppercase eyebrow on cards.
 *
 * Composition is intentional — the card accepts `media`, `topLeft`,
 * `topRight`, `mediaOverlay`, `title`, `subhead`, and `footer` slots so
 * the same primitive can render a restaurant (score badge top-right,
 * cuisine subhead) or a recipe (chef subhead, save action top-right)
 * without three different variants.
 */
interface FeedCardProps {
  /** Destination href. When provided, the card renders as a <Link>. */
  to?: string;
  /** Click handler — used when `to` isn't provided. */
  onClick?: () => void;
  /** Media slot. Typically an <img> or the CoverImage placeholder. */
  media: React.ReactNode;
  /** Aspect ratio for the media. Defaults to 4/3 per the spec. */
  aspect?: '4/3' | '4/5' | '1/1' | '16/9' | '3/4';
  /** Optional content overlaid at the top-left of the media (e.g. Hotel pill). */
  topLeft?: React.ReactNode;
  /** Optional content overlaid at the top-right of the media (heart / save / add). */
  topRight?: React.ReactNode;
  /** Optional content overlaid at the bottom-right of the media (score badge). */
  bottomRight?: React.ReactNode;
  /** Optional content overlaid at the bottom-left of the media. */
  bottomLeft?: React.ReactNode;
  /** Optional gradient overlay variant. */
  mediaOverlay?: 'none' | 'bottom-fade';
  /** Card title (renders Fraunces, 17px). */
  title: React.ReactNode;
  /** Sentence-case subhead (renders Manrope 13px in ink-3). */
  subhead?: React.ReactNode;
  /** Optional trailing footer row beneath the subhead (chips, score row, etc.). */
  footer?: React.ReactNode;
  className?: string;
  /** Render the metadata block over the image as an editorial overlay
   *  (hero-style). Default off — metadata sits below the photo. */
  overlay?: boolean;
}

const ASPECT: Record<NonNullable<FeedCardProps['aspect']>, string> = {
  '4/3': 'aspect-[4/3]',
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '16/9': 'aspect-video',
  '3/4': 'aspect-[3/4]',
};

/**
 * Shared overlay button surface used for heart / save / add actions in
 * the corners of a card. Sized once so every card uses the same chip.
 */
export const FeedCardActionButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, ariaLabel, active = false, children, className }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      'w-9 h-9 rounded-full flex items-center justify-center glass transition-transform duration-150 hover:scale-105 active:scale-95',
      active ? 'text-primary' : 'text-on-surface/70 hover:text-primary',
      className,
    )}
  >
    {children}
  </button>
);

export const FeedCard: React.FC<FeedCardProps> = ({
  to,
  onClick,
  media,
  aspect = '4/3',
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
  mediaOverlay = 'none',
  title,
  subhead,
  footer,
  className,
  overlay = false,
}) => {
  const cardClasses = cn(
    'group block bg-paper rounded-2xl overflow-hidden transition-all duration-200 ease-out',
    'shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5',
    className,
  );

  const mediaBlock = (
    <div className={cn('relative w-full overflow-hidden bg-on-surface/5', ASPECT[aspect])}>
      <div className="absolute inset-0 [&>*]:h-full [&>*]:w-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-700 [&>img]:group-hover:scale-[1.03]">
        {media}
      </div>

      {mediaOverlay === 'bottom-fade' && (
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 80%, transparent 100%)',
          }}
        />
      )}

      {(topLeft || topRight) && (
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10 pointer-events-none [&>*]:pointer-events-auto">
          <div className="min-w-0">{topLeft}</div>
          <div className="flex items-center gap-2 flex-shrink-0">{topRight}</div>
        </div>
      )}

      {(bottomLeft || bottomRight) && (
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10 pointer-events-none [&>*]:pointer-events-auto">
          <div className="min-w-0">{bottomLeft}</div>
          <div className="flex-shrink-0">{bottomRight}</div>
        </div>
      )}

      {overlay && (
        <div className="absolute inset-x-0 bottom-0 p-4 z-10">
          <h3 className="text-[17px] font-medium leading-snug text-white tracking-tight line-clamp-2 drop-shadow-md">
            {title}
          </h3>
          {subhead && (
            <p className="mt-1 text-[13px] text-white/85 line-clamp-1">{subhead}</p>
          )}
        </div>
      )}
    </div>
  );

  const metadataBlock = !overlay ? (
    <div className="p-4">
      <h3 className="text-[17px] font-medium leading-snug text-on-surface tracking-tight line-clamp-2">
        {title}
      </h3>
      {subhead && (
        <p className="mt-1 text-[13px] text-ink-3 line-clamp-1">{subhead}</p>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  ) : footer ? (
    <div className="p-4 pt-3">{footer}</div>
  ) : null;

  if (to) {
    return (
      <Link to={to} className={cardClasses} onClick={onClick}>
        {mediaBlock}
        {metadataBlock}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(cardClasses, 'text-left w-full')}>
        {mediaBlock}
        {metadataBlock}
      </button>
    );
  }
  return (
    <div className={cardClasses}>
      {mediaBlock}
      {metadataBlock}
    </div>
  );
};

export default FeedCard;
