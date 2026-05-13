# Claude Code Prompt — Design & UX Overhaul

## Your mission

This is a restaurant + recipe explore-and-review app (React + TypeScript + Vite + Tailwind v4, Supabase backend, framer-motion). I want it to feel **modern, clean, sleek, intuitive, and professional** — specifically a **warm modern social aesthetic** in the Airbnb / Instagram family: rounded cards, soft shadows, warm neutrals, photography-forward, friendly but premium. Today the design feels off — too many competing card chromes, lots of wasted whitespace on desktop, cards that don't fit their containers, and an editorial design system that's defined in `index.css` but mostly ignored by the page code.

**Prioritize desktop first (`>=1024px`).** Mobile gets a second pass after desktop is solid. Both should land in the same visual language.

You have **autonomy** on the specific visual decisions (exact radii, shadow ramps, hover treatments, spacing scale, etc.) — but every choice you make must be **documented** in a new file at the project root called `DESIGN_NOTES.md`: the token, the chosen value, and the reasoning in one sentence. When you're done, that file should let me reproduce the design language for any new component.

**Scope:** visual + UX/functional fixes. Not a code-quality refactor. But where the design fix requires extracting a primitive (e.g. a shared `<SectionHeader>`), do it — that's the point.

---

## Ground rules

1. **Read before you write.** Every file you change, read in full first. Many pages have inline copies of patterns; pick a canonical version and migrate.
2. **Preserve behavior.** Don't change data fetching, routing, or business logic unless it's the bug listed below. Visual + interaction polish only.
3. **One primitive, many usages.** When you see a pattern repeated three or more times (modal shell, section header, filter pill, feed card), extract it into `src/components/ui/` and migrate the call sites in the same PR. Do not leave the old and new versions both live.
4. **Use the design tokens.** `--color-surface`, `--color-on-surface`, `--color-primary` (clay), `--color-secondary` (olive), `--color-accent` (tan), and the editorial tokens (`cream`, `paper`, `ink-*`, `olive`, `clay`, `persimmon`) are already defined in `src/index.css`. Eliminate hardcoded hex values (`#2f3425`, `#fff8f6`, `#d4a373`, etc. — grep for them) and route through tokens.
5. **8-point spacing scale.** Use Tailwind's `2 / 3 / 4 / 6 / 8 / 12 / 16` only. Eliminate `p-3.5`, `mb-2.5`, `gap-2.5`, and other off-scale values. Round to the nearest valid step.
6. **Standardize radii to three:** card = `rounded-2xl` (16px), pill / chip = `rounded-full`, modal = `rounded-3xl` (24px). Migrate every `rounded-xl`, `rounded-3xl` on cards, `rounded-[28px]` to one of these three.
7. **Standardize shadows.** Define `--shadow-card`, `--shadow-card-hover`, `--shadow-modal` in `index.css` and reference them everywhere. Drop all inline `shadow-[0_30px_80px_-16px_rgba(...)]` magic numbers.
8. **Dark mode must work.** Test every change in both modes. The Mapbox styles in `RestaurantPanel.tsx:377` and `Discover.tsx:136-141` are hardcoded to `light-v11` — fix this so the map flips. The `glass` utility in `index.css:162` isn't covered by the dark-mode `bg-white` overrides at `index.css:68-75` — fix.
9. **Don't introduce a new UI library.** Stay on Tailwind + framer-motion. No shadcn, no Headless UI imports unless already present.
10. **Final check:** before declaring done, run `tsc --noEmit` and the dev server. Visually scan Discover, RestaurantDetailDesktop, Profile, Activity, Experts, RecipesForYou at 1280px and 1600px viewports. Take notes on anything still off; fix or list as follow-ups in `DESIGN_NOTES.md`.

---

## Phase 0 — Build the primitives (do this first)

These are referenced by every later phase. Create them in `src/components/ui/`.

### `PageShell.tsx`
A page wrapper that locks content width and horizontal padding. Today **at least six different `max-w-*` values** are used across pages (`max-w-2xl`, `max-w-3xl`, `max-w-5xl`, `max-w-6xl`, `max-w-7xl`, `max-w-[880px]`). Pick one canonical width for the main content column — I'd suggest `max-w-6xl` (1152px) with `px-8` on desktop, `px-5` on mobile — and apply it on every page directly under the sidebar layout. Provide a `width="narrow" | "default" | "wide"` prop for the rare exceptions (article reading column = narrow; reels / map = wide / unbounded).

### `SectionHeader.tsx`
Wraps `.section-eyebrow` + `.section-title` from `index.css:100-114`. These classes are defined but **almost never used** — every page reinvents the header inline (e.g. `RestaurantDetailDesktop.tsx:298, 556, 590, 656, 705` all use `text-xs font-bold uppercase tracking-[0.18em]` with slightly different tracking values 0.12 / 0.14 / 0.15 / 0.16 / 0.18). Migrate every uppercase-tracked eyebrow + serif title pair to `<SectionHeader eyebrow="FOR YOU" title="Recommended for tonight" action={<a>See all</a>} />`. Pick one tracking value and one title size.

### `FeedCard.tsx` (and `RestaurantCard` refresh)
Photo-forward card primitive. Reuse for restaurant cards, recipe cards, guide cards, reel cards. Spec:
- 4:3 photo top, full-bleed inside the card radius.
- 16px metadata padding below.
- Score badge / heart action overlaid on the photo, with one shared offset (`top-3 right-3`).
- Hover: `-translate-y-0.5` + shadow grow (`--shadow-card-hover`). Smooth ~200ms.
- Title: Fraunces 17–18px, tight tracking. Subhead: Manrope 13px in `ink-3`, sentence case (not uppercase — kill the competing eyebrow on cards at `RestaurantCard.tsx:264-268`).
- Radius: `rounded-2xl`. Border: 1px `border-on-surface/[0.06]` OR no border + shadow — pick one and stick to it.

**Critical fix:** `Discover.tsx:4438-4508` "Recommended" cards use the cover photo as a **25% opacity watermark** behind text. This is the single biggest "doesn't feel modern" problem in the app. Replace with the new photo-forward `FeedCard`. Same for "Recipes for you" (`Discover.tsx:4644+`) and "Guides" (`Discover.tsx:4567+`).

### `FilterPill.tsx`
At least four different pill specs are in use (varying heights 8/9/10, paddings `px-3` / `px-3.5` / `px-5`). Lock one: `h-9 px-4 rounded-full text-sm font-medium`, with `active` state using `bg-on-surface text-surface`, idle `bg-on-surface/[0.05] hover:bg-on-surface/[0.08]`. Migrate filter rows in `RestaurantDetailDesktop.tsx:825`, `Pantry.tsx`, `Experts.tsx:239`, `Discover.tsx:4853`.

### `ModalShell.tsx`
Today the modals are wildly inconsistent on desktop:
- `AddRestaurantModal.tsx:300`, `AddRecipeModal.tsx:178`, `RatingModal.tsx:246` cap at `sm:max-w-md` (448px) — a tiny floating sheet on a 1440px screen.
- `RestaurantDetailDesktop.tsx:3620` uses `max-w-2xl rounded-[28px]` with a different shadow.
- Header padding inside modals is invented per file (`px-5 pt-4 pb-3` / `px-6 pt-5 pb-4` / `px-5 pt-2 pb-2` etc.).

Build one modal shell with `size="sm" | "md" | "lg"` (mapping to `max-w-md`, `max-w-2xl`, `max-w-3xl`), one shared header pattern, `rounded-3xl` desktop / full-screen mobile, and `--shadow-modal`. Migrate `AddRestaurantModal`, `AddRecipeModal`, `RatingModal`, `RecipeModal`, `AddToListModal`, `AddHomeMealModal`, `AddReelModal`, `AddPostModal`, and the inline `RestaurantDetailDesktop.tsx:3620` confirm modal, `Pantry.tsx:444`, `Profile.tsx:1278`, `Profile.tsx:494`.

### `EmptyStateView.tsx` and `LoadingState.tsx`
The canonical `components/EmptyState.tsx` already exists but **most empty states bypass it** with custom JSX (see `Discover.tsx:4279-4290, 4560-4563, 4631-4642`; `RestaurantDetailDesktop.tsx:772-799, 836-839`; `Experts.tsx:265-274`). There's also a second `EmptyState` defined locally inside `Activity.tsx` — delete it, migrate to the canonical one. Similarly `LoadingSkeleton.tsx` exists but isn't used; Discover and RestaurantDetail render bare `<Loader2 className="animate-spin" />` instead. Replace every standalone spinner with `<LoadingState />` showing the appropriate skeleton variant.

---

## Phase 1 — Desktop chrome (Sidebar + DesktopHeader)

**Goal:** stop having two stacked half-empty bars at the top of the screen.

- `Sidebar.tsx` collapses on mouse-leave (`SIDEBAR_EXPANDED_WIDTH = 264` → `72` icon-only). On `>=1024px`, **make it persistent expanded** — the constant springing back and forth is jittery and the icon-only rail wastes the brand area. If you want a compact mode, gate it behind a manual toggle (saved to localStorage), not hover.
- Align all internal sidebar paddings to one rhythm. Currently `Sidebar.tsx` uses `px-5`, `px-3`, `px-2` in different blocks (header `:114-117`, CTA `:134`, nav `:207`, footer `:289`). Pick `px-4` for everything in the expanded state.
- `DesktopHeader.tsx:274` caps search to `max-w-2xl` then leaves ~700px of empty space to the right on a 1600px screen. Either (a) widen the search to a true command bar (`flex-1 max-w-4xl`), or (b) fill the right with **route-specific context**: current page title, active filters, breadcrumb. Pick (b) — it solves the empty feel and gives the user orientation.
- `DesktopHeader.tsx:469-471` hides the "Add Rating" pill on Home. Don't hide it — promote a single primary action (`+ Add`) that opens a menu (rating, recipe, reel, post) so the header has a clear primary CTA on every page.
- Decide where the search input lives. Today it's in the header. If page-level filtering belongs in the page (it does on Search / Discover / Pantry), pull the global header search down to a per-page bar and replace it in the header with a quick command-K-style global search (or remove it entirely on pages that have their own).
- Audit pages that render `<TopBar>` while inside the sidebar layout. `Discover.tsx:4212` correctly guards with `!usingDesktopHeader` but `Experts.tsx:182-185`, `Pantry.tsx` and others don't, producing **two stacked headers** at the breakpoint boundary. Add the guard or remove the redundant TopBar.

---

## Phase 2 — Discover (the home surface)

This is the most important page; spend the most care here.

- **Wrap the whole page in `PageShell`** with `max-w-6xl mx-auto px-8`. Today `Discover.tsx:4230` uses `px-6` with no max-width, so on 1920px screens content stretches to ~1620px and 178px cards look lonely.
- **Section rhythm:** lock spacing between sections to one value (try `mt-20` / 80px on desktop, `mt-12` mobile). Today the rhythm jumps 8 → 10 → 12 → 12 across `:4364, :4386, :4546, :4568, :4613, :4707` for no reason.
- **Section headers:** migrate every section to `<SectionHeader>`. Today `:4369` uses `text-[30px] font-serif font-bold` with no eyebrow, while `RestaurantDetailDesktop.tsx` headers all have the mono eyebrow. Make them match.
- **Recommended rail (`:4402-4508`):** replace with a `lg:grid-cols-3 xl:grid-cols-4` photo-forward grid using the new `FeedCard`. Keep horizontal scroll only at `<md`. Kill the 25%-opacity watermark treatment entirely.
- **Search-results grid (`:4297`):** currently `grid-cols-2 lg:grid-cols-4`. With no max-width, cards balloon to 430px on 1920px screens. After PageShell caps width, change to `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. Aspect ratio `aspect-[4/3]` on desktop (not the current `aspect-[4/5] sm:aspect-[4/3]` whiplash).
- **Guides + Recipes rails (`:4567+`, `:4644+`):** same treatment — desktop becomes a grid with `FeedCard`; widths and aspects must agree (today guides are 148×185 and recipes are 178×237).
- **Social feed (`:4707`):** currently full-width — photos stretch 1100px+ and feel lonely. Either (a) cap the social column to `max-w-2xl mx-auto` within Discover, or (b) split Discover into a two-column layout on `xl+`: feed left (max-w-2xl), trending / friends activity right (sticky rail). Pick (b) — it's more in line with the Instagram/Airbnb feel and uses the desktop width.

---

## Phase 3 — Restaurant Detail (Desktop)

`src/pages/RestaurantDetailDesktop.tsx`. Today this is a single narrow column with five identically-styled beige boxes stacked vertically.

- **Two-column layout:** `grid-cols-[minmax(0,1fr)_360px] gap-12` on `xl+`. Left column = editorial content (hero, name, community scores, flavor profile, friend reviews, hotel dining, visit history). Right column = sticky rail with key actions: rate / add to list / share, hours preview, mini map, price + cuisine chips, "directions" CTA. This solves the `:455` action grid (`max-w-md` in a 1024px column with 45% empty space) and the page-wide gray box monotony.
- **Hero (`:181-206`):** the bottom-of-hero gradient fades to hardcoded `#fff8f6` which isn't the current surface color (`#f6f5f2`). Fix to a CSS variable. Also reduce `max-h-[65vh]` to `max-h-[520px]` for desktop so the hero doesn't dominate above the fold.
- **Name + score row (`:297-378`):** stop the 80px score circle from floating in negative space. Tighten with `gap-6`, place price/status meta on the right, badge below if needed. Or move the score into the sticky right rail entirely.
- **Visual variety between sections:** today five sections (`:578, :739, :841, :1161, :1263`) all use `rounded-2xl bg-white/60 border border-on-surface/10` — five beige boxes in a row reads monotonous. Vary the treatment: one full-bleed editorial section with a hairline divider, one boxed card, one inline list with no chrome. The current Visit History date-rail (`:1101-1247`) is actually a nice editorial moment — extend that voice to one more section.
- **Inline ad-hoc styles:** `:404` uses `style={{ backgroundColor: '#2f3425' }}` — replace with `--color-olive` (`#5c6144`) or a darker olive token. `:411, :436` use `#d4a373` — replace with `--color-accent`.
- **Friends grid (`:726`):** `grid-cols-1 md:grid-cols-2` only — bump to `lg:grid-cols-3`.
- **Section title size:** `:593, :659, :708` inline `text-[28px] font-serif font-bold`, contradicting `.section-title` at 22px. Decide one canonical section-title size (I'd suggest 24px Fraunces, medium weight, tight tracking) and use it through `SectionHeader`.

Also touch **`RestaurantPanel.tsx`** (the map panel): `:478` and `:473` use hardcoded `height: 204` — round to 192 or 240. ScorePill chrome at `:97-99` (`bg-paper ring-1`) differs from the detail page boxes; align them.

---

## Phase 4 — Profile, Activity, Experts, Pantry, RecipesForYou

Apply `PageShell` everywhere; bring each page in line with the new primitives.

- **Profile (`Profile.tsx:949-1098`):** the avatar is 92px and the stats row is `flex-1 grid-cols-3 gap-2` lonely in a wide row. On desktop, make the profile header a true two-column block: avatar + identity left, stats + edit/share actions right. The tab bar at `:1102` is `grid-cols-4` — each tab balloons to 275px wide. Cap tabs to 120px max each, left-aligned with underline indicator (Airbnb-style).
- **Activity (`Activity.tsx:372, 409`):** uses `max-w-2xl` for index and `max-w-3xl` for lists — pick one. Likes grid at `:421` is `grid-cols-3` at all widths; on desktop it looks sparse. Make it `grid-cols-4 lg:grid-cols-5` square tiles, or align to the same grid as Discover's search results.
- **Experts (`Experts.tsx:185-186, 276`):** no `max-w-`, grid is `grid-cols-2 gap-4`. Apply PageShell and `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. `ExpertCard.tsx:25` uses `rounded-3xl` — align to `rounded-2xl` per the new card spec.
- **Pantry (`Pantry.tsx`):** apply PageShell. The grid at `:2353` uses different x/y gaps (`gap-x-3 gap-y-6`) — align to `gap-6` both axes.
- **RecipesForYou (`RecipesForYou.tsx:370-392`):** already uses `max-w-5xl mx-auto p-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` — this is closest to what we want. Use it as the reference, then bump to `max-w-6xl px-8` to match PageShell.
- **CircleActivity (`:217`):** post photo `w-full max-w-md aspect-[5/3]` — the photo caps at 448px while the page is unbounded, photo floats in whitespace. After PageShell + two-column layout, this resolves; if not, cap the parent column too.

---

## Phase 5 — Color, typography, dark mode

- **Use the editorial palette as accents.** Right now the app is gray + clay-red CTAs and the olive/tan/persimmon tokens are nearly invisible. Add olive borders or backgrounds for "saved" / "in your circle" states; tan as a subtle highlight on tag chips; persimmon for warnings or "new" badges. The clay primary stays the action color.
- **Typography rules:**
  - Display headers (`>=24px`): `font-family: Fraunces`. Add `font-display` utility if needed.
  - Section eyebrows: one tracking value (settle on `tracking-[0.14em]`) and one size (12px Mono 700 uppercase).
  - Body: Manrope (already default).
  - Italic editorial accents: Noto Serif italic — sparingly.
  - Stop applying `font-serif` to every heading inline (it's already the default via `index.css:123-125`). Grep for redundant `className="...font-serif..."` on headings and remove.
- **Dark mode:**
  - Add `.glass` to the brute-force dark-mode override block in `index.css:68-75` (it's currently missing).
  - Replace all hardcoded hex values with tokens so they flip automatically. Search and destroy: `#fff8f6`, `#2f3425`, `#d4a373`, `#fef3ec`, `#fbfaf6` outside `index.css` itself.
  - Fix Mapbox style hardcodes at `RestaurantPanel.tsx:377` and `Discover.tsx:136-141` to switch styles based on the `.dark` class on `<html>`.
  - Loop through every page in dark mode at the end and screenshot anything that's still off.

---

## Phase 6 — Mobile pass (after desktop is solid)

- Make sure the new primitives (`FeedCard`, `SectionHeader`, `ModalShell`) collapse cleanly at `<md`. Most should already work; verify horizontal scroll rails reappear in the right places (Recommended, Guides, Recipes For You all stay as horizontal-snap rails on mobile, become grids on desktop).
- `BottomNav.tsx:62` `glass` utility — confirm the dark-mode fix from Phase 5 lands.
- Phone-frame preview mode (`phoneMode` in `SettingsContext`) must still work — don't break the `App.tsx:222-254` narrow layout while doing the sidebar work.
- Audit `TopBar.tsx` usage so two headers never stack at the breakpoint.

---

## Deliverables

When you're done:

1. New primitives in `src/components/ui/`: `PageShell`, `SectionHeader`, `FeedCard`, `FilterPill`, `ModalShell`, `LoadingState`. Old inline copies migrated and removed.
2. Updated `src/index.css` with `--shadow-card`, `--shadow-card-hover`, `--shadow-modal` tokens, `glass` in the dark-mode override list, and consistent eyebrow/title styles.
3. Phase 1–6 changes applied across the files listed above.
4. `DESIGN_NOTES.md` at the project root: every primitive, every token value, every aesthetic decision (e.g. "card radius = 16px because the editorial Fraunces titles feel pinched in 12px rounding") in one place.
5. `tsc --noEmit` passes. Dev server runs clean. Visual scan at 1280 / 1600 / 1920 in both light and dark mode.
6. A short summary in your final message: what landed, what you intentionally left as follow-ups, and any places where my brief was ambiguous and you had to make a call.

Take your time. The goal is for me to open Discover on a 1600px monitor and immediately think "this looks like Airbnb / Resy / a serious modern product" — not "this is a hobby project with placeholder cards."
