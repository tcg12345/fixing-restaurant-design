# Design Notes

Living record of the design-system decisions made during the design + UX overhaul. Every primitive, every token value, and every aesthetic choice belongs here so the language can be extended to new components without guessing.

When you add a new primitive or change a token, update this file in the same change.

---

## Aesthetic target

Warm modern social, Airbnb / Resy / Instagram family. Photography-forward, soft shadows, warm neutrals, friendly but premium. Desktop-first at `>=1024px`; mobile collapses cleanly to the same visual language.

---

## Phase 0 — Foundations

### Tokens (`src/index.css`)

#### Color (already defined; left intact)

| Token | Value (light) | Value (dark) | Role |
|---|---|---|---|
| `--color-surface` | `#f6f5f2` | `#0e0e0f` | Page background. Neutral warm-gray (no rosy cast). |
| `--color-on-surface` | `#1e1b1a` | `#ededed` | Default text color. |
| `--color-primary` | `#9f3012` | (unchanged) | Clay-red. The single CTA accent. |
| `--color-secondary` | `#5c6144` | (unchanged) | Olive. For "saved" / "in your circle" semantic chips. |
| `--color-accent` | `#d4a373` | (unchanged) | Tan. Subtle highlight on tag chips. |
| `--color-cream` | `#f4f2ec` | `#131314` | Editorial page background. |
| `--color-paper` | `#fbfaf6` | `#18181a` | Card fill — what all `bg-paper` / `bg-white` overrides resolve to. |
| `--color-line` / `--color-line-2` | `#e2dfd5` / `#d2cec0` | `#2a2a2c` / `#353537` | Hairline dividers. |
| `--color-ink` → `--color-ink-4` | `#1e1b1a` … `#a19a8e` | `#ededed` … `#5d5d5d` | Text tone ramp. |
| `--color-olive` / `--color-clay` / `--color-persimmon` | `#5c6144` / `#9f3012` / `#e85a2c` | (unchanged) | Editorial accents — olive = saved/circle, clay = primary, persimmon = warning / "new" badge. |

**Rule.** Outside `index.css`, never reach for a hex literal — route through tokens so dark mode flips automatically. The four hexes already known to recur in pages (`#fff8f6`, `#2f3425`, `#d4a373`, `#fef3ec`) get migrated phase-by-phase.

#### Shadow ramp (new)

Three steps cover every elevated surface. Inline `shadow-[…]` magic numbers must resolve to one of these.

| Token | Value (light) | Where to use |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(30,27,26,0.04), 0 6px 16px -8px rgba(30,27,26,0.08)` | Resting cards (FeedCard, RestaurantCard, ExpertCard). Tinted ink base (not pure black) so the shadow stays warm against cream. |
| `--shadow-card-hover` | `0 2px 4px rgba(30,27,26,0.06), 0 18px 36px -12px rgba(30,27,26,0.16)` | Hover-lifted cards. |
| `--shadow-modal` | `0 12px 32px -8px rgba(30,27,26,0.18), 0 32px 80px -24px rgba(30,27,26,0.24)` | Modal sheets only. |

Dark mode overrides the same tokens to a pure-black, higher-alpha ramp so elevation still reads against the near-black surface.

Usage: `shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]`. Picked over a `@theme` shadow entry because the inline-arbitrary syntax composes cleanly with `hover:` / `dark:` variants in Tailwind v4.

#### Radii — three values only

| Surface | Class | Value | Why |
|---|---|---|---|
| Card (FeedCard, RestaurantCard, ExpertCard, list tiles) | `rounded-2xl` | 16px | Roomy enough that the Fraunces titles don't feel pinched; tight enough to read modern rather than playful. |
| Pill / chip / FilterPill / overlay action button | `rounded-full` | 9999px | Single consistent pill shape across filter rows, score badges, action chips. |
| Modal sheet (desktop) | `rounded-3xl` | 24px | Larger surface needs softer corner; mobile / phoneMode goes edge-to-edge (`rounded-none`). |

Migration target: every `rounded-xl`, `rounded-[28px]`, `rounded-[20px]` on a card or modal must collapse to one of these three. `rounded-lg` (12px) survives only on thumbnails inside list rows.

#### Spacing — 8-pt scale

Allowed Tailwind step keys only: `2 / 3 / 4 / 6 / 8 / 12 / 16` (and their negatives). Off-scale values that show up in the codebase get rounded to the nearest valid step.

| Bad | Good |
|---|---|
| `p-3.5` | `p-3` or `p-4` |
| `gap-2.5` | `gap-2` or `gap-3` |
| `mb-2.5` | `mb-2` or `mb-3` |

#### Typography

| Role | Font | Size | Tracking | Weight |
|---|---|---|---|---|
| Display heading (≥24px) | `font-display` / Fraunces | 24–48px | `-0.4px` to `-1.5px` | 500 (medium) |
| Section title (canonical) | Fraunces | **24px** | `-0.4px` | 500 |
| Section eyebrow | JetBrains Mono | **12px** uppercase | **`0.14em`** | 700 |
| Card title (FeedCard) | Fraunces | **17px** | `tracking-tight` | 500 |
| Card subhead | Manrope | 13px | normal | 400, sentence case |
| Body | Manrope | 14–16px | normal | 400 |
| Italic editorial | Noto Serif italic | 14–17px | normal | 400, *use sparingly* |

`section-eyebrow` and `section-title` are CSS classes in `index.css` and are reachable from outside React via plain className strings — the `SectionHeader` primitive wraps them so React call sites get type-safety + the optional action slot.

Decision rationale on the eyebrow:
- Settled on **12px Mono / 700 / 0.14em tracking / `--color-ink-3`** (was 13px / 0.12em / `ink-2`). 12px is the floor that still reads as an "eyebrow" rather than body; 0.14em is the midpoint of the 0.12–0.18em range the codebase was actually using, so existing pages re-skin without feeling drastically different.

Decision rationale on the title:
- Settled on **24px Fraunces / 500 / tight letter-spacing**. Up from the previous 22px definition (which was already canonical but ignored). 24px reads as a real section heading on a 1152px column without competing with display-size hero text (32px+).

#### Glass / `.card-interactive`

Rewritten to route through `--color-paper` so they flip automatically in dark mode. Previously `.glass` used `bg-white/80` and the brute-force `.dark .bg-white` override list (`index.css:68-75`) did not include it.

```css
.glass {
  background-color: color-mix(in srgb, var(--color-paper) 80%, transparent);
  backdrop-filter: blur(20px);
}
```

Same fix applied to `.card-interactive`.

---

### Primitives (`src/components/ui/`)

All Phase 0 primitives are exported from `src/components/ui/index.ts` so call sites can `import { PageShell, FeedCard, SectionHeader } from '../components/ui'`.

#### `PageShell.tsx`

Page-width and padding lock. Three widths — `narrow` (max-w-3xl / 768px reading column), `default` (max-w-6xl / 1152px standard column), `wide` (no cap — map/reels). Horizontal padding: `px-5` mobile, `px-8` desktop. Picked `max-w-6xl` over the previous six-way mix because at 1152px a 4-column FeedCard grid keeps cards roughly the size they are today (~250px) on 1920px monitors without leaving them lonely.

```tsx
<PageShell width="default">
  <SectionHeader eyebrow="FOR YOU" title="Recommended for tonight" />
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    ...
  </div>
</PageShell>
```

#### `SectionHeader.tsx`

Thin wrapper around `.section-eyebrow` + `.section-title`. Accepts an optional trailing `action` slot (e.g. "See all" link) that sits at the right on `sm+` and stacks below the title on mobile. `spacing` prop chooses the bottom margin (`tight | default | loose` → `mb-4 / mb-6 / mb-8`).

#### `FeedCard.tsx`

Photo-forward primitive for restaurant / recipe / guide / reel cards.

Locked spec:
- Media: `aspect-[4/3]` default (the spec value); `4/5 | 1/1 | 16/9 | 3/4` available for the rare exception.
- Metadata padding: `p-4` (16px).
- Overlay action offsets: `top-3 / left-3 / right-3 / bottom-3` — one shared offset across all corners so heart / score / hotel-pill always sit at the same inset.
- Corner radius: `rounded-2xl`. No border — `--shadow-card` provides the edge.
- Hover: `-translate-y-0.5` + `--shadow-card-hover`, `transition-all duration-200`.
- Title: Fraunces 17px / `tracking-tight` / `leading-snug` / `line-clamp-2`.
- Subhead: Manrope 13px / `text-ink-3` / sentence case / `line-clamp-1`. **No uppercase eyebrow on cards** — the competing tracked uppercase row on the current `RestaurantCard.tsx:264-268` is killed.

Composition slots (`topLeft`, `topRight`, `bottomLeft`, `bottomRight`, `media`, `title`, `subhead`, `footer`, `mediaOverlay`, `overlay`) keep one component flexible enough for restaurant cards (score badge bottom-right, cuisine subhead) and hero / editorial cards (`overlay` puts the title on top of a bottom-fade gradient instead of below the photo) without a variant prop ladder.

Exports a `FeedCardActionButton` helper sized at `w-9 h-9` for the corner heart / save / add chips so the action surfaces stay consistent.

#### `FilterPill.tsx`

The single filter chip. Locked to:

- `h-9 px-4 rounded-full text-sm font-medium`
- Idle: `bg-on-surface/[0.05] hover:bg-on-surface/[0.08]`
- Active: `bg-on-surface text-surface`
- Optional `size="sm"` (`h-8 px-3 text-[13px]`) for dense filter rows.

Accepts a leading `icon` and trailing `trailing` slot so "Hotel" / "Friends" / "Open now" pills with an icon stay aligned. Renders as `<button>` by default; `as="span"` for purely decorative chips.

#### `ModalShell.tsx`

Replaces the eight inconsistent modal shells in the app. Locked to:

- **Sizes:** `sm = max-w-md (448px)`, `md = max-w-2xl (672px)`, `lg = max-w-3xl (768px)`. The current `sm:max-w-md` cap on every modal is killed — `md` becomes the new default.
- **Desktop radius:** `rounded-3xl`. Mobile / `phoneMode`: `rounded-none`, full-screen.
- **Shadow:** `--shadow-modal`.
- **Backdrop:** `bg-black/60 backdrop-blur-sm` (matches the existing motion language).
- **Motion:** y `100% → 0`, spring `damping: 30, stiffness: 300` (unchanged from current modals so migrations don't change the feel).
- **Header padding:** `px-5 pt-5 pb-3` mobile / `px-6 pt-6 pb-4` desktop. Eyebrow (12px Mono uppercase) + title (Fraunces 20–24px, medium, tight tracking) + subtitle (13–14px ink-3 truncated) + built-in close button. Pass `header` to override entirely.
- **Footer:** optional pinned footer with a top hairline divider for sticky action buttons.

Honors `phoneMode` from `SettingsContext` so the phone-frame preview keeps its full-height sheet treatment.

#### `LoadingState.tsx`

Replaces every standalone `<Loader2 className="animate-spin" />` and bespoke "Loading…" line. Four variants:

- `cards` (default 6 items, responsive 2/3/4 grid via `gridClassName`) — for grid-based pages.
- `rows` (default 8 items) — for list views.
- `text` — paragraph placeholder.
- `spinner` — centered spinner + optional label. The only variant that should appear when the layout can't be skeletonized (e.g. inline loading next to a refresh button).

Wraps `LoadingSkeleton` for the skeleton variants so tint / pulse-rate adjustments propagate.

#### `EmptyStateView.tsx`

Re-export of the canonical `components/EmptyState` plus an additional `tone="inline"` variant for the compact "rail is empty" slot that today renders bespoke JSX inside Discover and RestaurantDetailDesktop.

```tsx
<EmptyStateView
  icon={<Compass size={48} />}
  heading="No reviews yet"
  description="Be the first to add one."
  action={{ label: 'Add review', onClick: openModal }}
/>

<EmptyStateView
  tone="inline"
  icon={<Bookmark size={24} />}
  heading="No saved guides"
  description="Bookmark the next one to see it here."
/>
```

The second locally-defined `EmptyState` inside `Activity.tsx` will be removed during Phase 4; the canonical one is the only allowed empty state going forward.

---

## Cross-cutting rules (applied through later phases)

1. **Tokens only.** Outside `index.css`: no hex literals. Grep for `#fff8f6`, `#2f3425`, `#d4a373`, `#fef3ec`, `#fbfaf6` and route them through `--color-cream`, `--color-olive`, `--color-accent`, etc.
2. **8-pt spacing.** No `*.5` Tailwind classes. Round to the nearest step (2/3/4/6/8/12/16).
3. **Three radii.** `rounded-2xl` cards, `rounded-full` pills, `rounded-3xl` modals. Migrate every other card/modal radius to these.
4. **One shadow ramp.** `--shadow-card / -hover / -modal`. Drop every inline `shadow-[0_30px_80px_-16px_rgba(...)]`.
5. **Dark mode coverage.** Every change tested in both modes. Mapbox styles must flip with the `.dark` class on `<html>`.
6. **One primitive, many usages.** When three inline copies of the same pattern appear, extract to `components/ui/` and migrate the call sites in the same change.

---

## Phase 1 — Desktop chrome (Sidebar + DesktopHeader)

### Sidebar

| Change | Decision | Why |
|---|---|---|
| Hover-collapse | **Removed.** Sidebar is persistent expanded by default. | The constant springing back and forth on every cursor pass was disliked; the icon-only rail also wasted the brand area. |
| Collapse toggle | New `PanelLeftClose` / `PanelLeftOpen` chevron in the header, persisted to `localStorage['gourmet-canvas-sidebar-collapsed']`. | Users who want a compact rail can still get it; the choice survives reloads. |
| Padding rhythm | Every block (`header`, `Create CTA`, `nav`, `footer`) locked to `px-4`. Previous mix (`px-2 / px-3 / px-5`) is gone. | One rhythm down the entire rail; no per-block guesswork. |
| Create menu shadow | `shadow-xl` → `shadow-[var(--shadow-card-hover)]` | Routes through the Phase 0 shadow token. |

The constants `SIDEBAR_EXPANDED_WIDTH = 264` and `SIDEBAR_COLLAPSED_WIDTH = 72` are unchanged — only the trigger for switching between them changed.

### DesktopHeader

| Change | Decision | Why |
|---|---|---|
| Empty space right of search | **Filled with a route-derived page-context chip on the LEFT.** Compact eyebrow (10px Mono uppercase / 0.14em) + page title (18px Fraunces medium). | Brief option (b): route-specific context that orients the user. Picked left placement so the chip reads like a "you are here" label before the search input. |
| Scoped search (Pantry hijack) | Scope name now appears in the page-title chip when scoped. | The user gets a single source of orientation — the chip — instead of guessing from the search-input placeholder. |
| Search input width | `flex-1 max-w-2xl` → `flex-1 max-w-md ml-auto`. | Frees real estate for the new page chip and the + Add menu without sacrificing the live-search dropdown that pages still depend on (Pantry's scoped-search). The full command-K rebuild is deferred — the current input *is* essentially a command palette with portal-rendered results — only the trigger shape changed. |
| Add CTA on Home | `!isHomeRoute` guard removed. | Brief: every page deserves a clear primary CTA. |
| Add CTA shape | One button `+ Add ▾` opening a four-item menu (Rating / Recipe / Reel / Post). | Brief: a single primary action that opens a menu, on every page. Item routing: Rating → `/search/main`; Recipe → `openHomeMealModal()`; Reel → `openAddReelModal()`; Post → `openAddPostModal()`. |
| `PageAddAction` override | Preserved, surfaced as a contextual "On this page" item at the top of the + Add menu (with the page-provided label). | Pantry's per-list "Add Recipe to All Recipes" shortcut keeps working without compromising the unified menu. |
| Search dropdown shadow | Inline `shadow-[0_18px_48px_-12px_rgba(0,0,0,0.22)]` → `shadow-[var(--shadow-card-hover)]`. | Phase 0 shadow token. |

The Add menu rebuilds on every route change so Pantry's per-view overrides re-render correctly.

### TopBar audit

- **Only `Discover.tsx` imports the canonical `<TopBar>` component**, and it's correctly guarded with `!usingDesktopHeader` at `Discover.tsx:4212`. The brief's mention of `Experts.tsx:182-185` and `Pantry.tsx` rendering `TopBar` is inaccurate in the current source: Experts has no header at all, and Pantry's local `hideTopBar` variable refers to its own combined tabs + list switcher block, not the canonical component.
- **Real "two stacked headers" cases** exist where pages mount their own sticky `<header>` inside the sidebar layout. Found via `grep "sticky top-0"` across pages: `Activity.tsx`, `SearchMain.tsx`, `RecipesForYou.tsx`, `UserProfile.tsx`, `FriendReviewDetail.tsx`, `RestaurantCircleReviews.tsx`, `MealRecipePage.tsx`, `ReorderRatings.tsx`, `ImportRestaurants.tsx`, `LocationPage.tsx`. These are page-specific chrome (back arrow + title or filter rows), not the canonical `<TopBar>`, and the cleanup belongs with each page's own rework in phases 3–4 — either by hiding DesktopHeader on those routes (via `App.tsx`'s `hideHeader` list) or by removing the redundant page-level header.

The Phase 1 fix here is the audit itself. No source change to the page list — touching every detail page is out of scope for the chrome phase.

---

## Phase 2 — Discover (home surface)

### Layout

| Change | Decision | Why |
|---|---|---|
| Page width | Wrapped the entire home content (`sheetState === 'full'` block) in `<PageShell width={usingDesktopHeader ? 'default' : 'wide'}>` — caps at `max-w-6xl` (1152px) with `px-8` on desktop, `px-5` on mobile. The map page and the half-state remain full-bleed. | Previously the wrapper used `px-6` with no `max-w-*`, so on 1920px screens content stretched to ~1620px and 178px cards looked lonely. |
| Section rhythm | All sections lock to `mt-20` (80px) desktop / `mt-12` (48px) mobile via `usingDesktopHeader ? 'mt-20' : 'mt-12'`. | Replaced the previous jagged 8→10→12→12 ramp at lines 4364/4386/4546/4568/4613/4707 with one value. |
| Two-column on `xl+` | Social feed wrapped in `grid-cols-[minmax(0,1fr)_320px] gap-12`. Left column `max-w-2xl` holds the feed; right column is a sticky aside (`top-24`) with two `DiscoverRail` lists — "Friends' picks" and "Your top rated" — built from the existing `friendRatings` / `topRated` state (no new fetches). | The full-width 1100px+ photo feed felt lonely on wide monitors. Two-column matches the Instagram/Airbnb language and uses the real estate the new PageShell cap exposes. |

### Section headers

Every inline `text-[30px]/[22px] font-serif font-bold` header inside Discover is now `<SectionHeader>`:

| Section | Eyebrow | Title |
|---|---|---|
| Recommended (loading + populated + empty branches) | `For you` | `Recommended` |
| Guides | `Editorial` | `Guides` |
| Recipes for you | `From the community` | `Recipes for you` |
| Search results | `Search` | `Results` (count surfaces in the action slot) |

All three Recommended states share one header so refresh button and "View all" link stay in the same position across states.

### Cards

| Rail | Before | After |
|---|---|---|
| Recommended | Custom 178×172 card with 25%-opacity photo watermark + manual cuisine eyebrow + bottom rating row. Killed the watermark entirely — it was the single largest "doesn't feel modern" tell in the app. | Desktop: `<FeedCard>` 4:3 photo-hero grid `grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6`. Mobile: horizontal snap rail of `<FeedCard>` 200px-wide tiles. Score badge in `bottomRight`, heart + add chips in `topRight`. |
| Guides | 148×185 photo with overlay text in a custom card. | `<FeedCard aspect="4/3" overlay mediaOverlay="bottom-fade">` — same primitive in overlay mode. `Guide · count` chip in `topLeft`. |
| Recipes for you | 178×237 photo card (mismatched aspect with Guides). | `<FeedCard aspect="4/3">` photo-up-top with source-tag chip; matches Guides aspect. Empty-state CTA recolored from inline emerald (`bg-emerald-600`) to `bg-secondary` (olive token) for "from the community" semantic. |
| Search results | `grid-cols-2 lg:grid-cols-4` of `RestaurantCard` with `aspect-[4/5] sm:aspect-[4/3]` whiplash. | `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6` of `<FeedCard aspect="4/3">`. The `RestaurantCard` import was removed from Discover (only used here previously). |

### Other

- `mt-8` on the SocialFeed wrapper → unified `mt-20`/`mt-12` rhythm.
- Hardcoded shadows like `shadow-[0_8px_24px_-10px_rgba(0,0,0,0.12)]` removed in favor of `FeedCard`'s built-in `--shadow-card`/`--shadow-card-hover` ramp.
- Empty-state copy retoned from `text-on-surface/55`/`text-on-surface/40` to `text-ink-2`/`text-ink-3` so dark-mode flips automatically through the ink ramp.
- `DiscoverRail` is a new in-file helper component (not added to `components/ui/`) — it's specific to the home surface; if a second page wants this list shape we can promote it.
- The brief option (b) was chosen for the two-column split because (a) — wide command bar — conflicts with the page-context chip introduced in Phase 1.

---

## Open follow-ups

Tracked here so they don't get lost between phases. Items move to "done" or to a deeper phase note as they land.

- [x] Phase 1 — Sidebar persistent-expanded on `>=1024px`; one `px-4` rhythm; `DesktopHeader` route-context fill + unified `+ Add` menu.
- [x] Phase 2 — Discover wrapped in PageShell, killed the 25%-opacity-watermark "Recommended" cards, two-column desktop layout with sticky DiscoverRail.
- [ ] Phase 3 — `RestaurantDetailDesktop` two-column with sticky right rail; hero gradient → `--color-cream`; replace inline `#2f3425` / `#d4a373`.
- [ ] Phase 4 — Profile / Activity / Experts / Pantry / RecipesForYou run through PageShell + the new primitives; delete the local `EmptyState` in `Activity.tsx`. **Hide DesktopHeader on detail/sub-pages** that render their own sticky `<header>` (the Phase 1 audit list) so the two-stack disappears.
- [ ] Phase 5 — Mapbox style switch on `RestaurantPanel.tsx:377` and `Discover.tsx:136-141`; semantic olive / tan / persimmon accents.
- [ ] Phase 6 — Mobile pass after desktop is solid.
