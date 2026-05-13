import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';

/**
 * Canonical modal shell. Today the eight modals (AddRestaurant, AddRecipe,
 * AddPost, AddReel, AddHomeMeal, AddToList, Rating, Recipe…) plus inline
 * confirm sheets each reinvented the same shape with different sizes,
 * radii, headers, and shadows — and almost all of them capped at
 * `sm:max-w-md` (448px) on desktop, which floats in the middle of a
 * 1440px screen.
 *
 * Spec (locked in DESIGN_NOTES.md):
 *  - Sizes: sm = max-w-md (448px), md = max-w-2xl (672px), lg = max-w-3xl (768px).
 *  - Desktop radius: rounded-3xl (24px). Mobile / phoneMode: full-screen, no radius.
 *  - Shadow: --shadow-modal token.
 *  - Backdrop: bg-black/60 backdrop-blur-sm.
 *  - Enter: y: 100% → 0, spring damping 30 / stiffness 300. Matches the
 *    existing motion language across the app so a migration doesn't
 *    change the feel.
 *  - Header: shared row with title, optional eyebrow/subtitle, and close
 *    button. Padding locked to px-6 pt-6 pb-4 (24/24/16) on desktop,
 *    px-5 pt-5 pb-3 on mobile.
 *
 * The shell is intentionally dumb about scrolling — pass a flex-1 scroll
 * container as the child so each modal controls its own content overflow.
 */
export type ModalSize = 'sm' | 'md' | 'lg';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  /** Custom header content. Overrides title/subtitle/eyebrow rendering. */
  header?: React.ReactNode;
  /** Hide the built-in close (X) button. */
  hideClose?: boolean;
  /** Footer pinned to the bottom of the modal (action buttons). */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Override the inner content padding. Defaults to none — children layout themselves. */
  contentClassName?: string;
  /** Optional class for the outer modal sheet. */
  className?: string;
  /** Disable backdrop click-to-close (used by destructive confirms). */
  dismissOnBackdrop?: boolean;
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-3xl',
};

export const ModalShell: React.FC<ModalShellProps> = ({
  open,
  onClose,
  size = 'md',
  title,
  subtitle,
  eyebrow,
  header,
  hideClose = false,
  footer,
  children,
  contentClassName,
  className,
  dismissOnBackdrop = true,
}) => {
  const { phoneMode } = useSettings();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center',
            phoneMode ? 'items-end' : 'items-end sm:items-center',
          )}
          onClick={dismissOnBackdrop ? onClose : undefined}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'bg-surface w-full overflow-hidden flex flex-col shadow-[var(--shadow-modal)]',
              phoneMode
                ? 'h-full rounded-none'
                : `h-full sm:max-h-[92vh] sm:h-auto rounded-none sm:rounded-3xl ${SIZE_CLASS[size]}`,
              className,
            )}
            role="dialog"
            aria-modal="true"
          >
            {header !== undefined ? (
              header
            ) : title || eyebrow || subtitle || !hideClose ? (
              <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 flex-shrink-0">
                <div className="min-w-0 flex-1">
                  {eyebrow && (
                    <div className="section-eyebrow mb-1.5">{eyebrow}</div>
                  )}
                  {title && (
                    <h2 className="font-serif text-xl sm:text-2xl font-medium leading-tight tracking-tight text-on-surface">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-ink-3 truncate">{subtitle}</p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="-mr-2 -mt-1 p-2 rounded-full text-on-surface/50 hover:text-on-surface hover:bg-on-surface/[0.05] transition-colors flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ) : null}

            <div className={cn('flex-1 min-h-0', contentClassName)}>
              {children}
            </div>

            {footer && (
              <div className="px-5 py-4 sm:px-6 sm:py-4 border-t border-on-surface/[0.06] flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalShell;
