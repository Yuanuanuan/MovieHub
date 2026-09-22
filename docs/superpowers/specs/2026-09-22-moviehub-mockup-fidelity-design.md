# MovieHub — Mockup Fidelity Pass — Design Spec

Date: 2026-09-22
Status: Approved (scope confirmed by Javen), pending implementation plan
Related artifact: "MovieHub Reel Cut" (interactive HTML mockup)
Builds on: `docs/superpowers/specs/2026-09-21-moviehub-redesign-design.md` (already
implemented and shipped — Tasks 1–15 of
`docs/superpowers/plans/2026-09-21-moviehub-redesign.md` are all committed)

## 1. Goal

The 2026-09-21 redesign shipped, but a side-by-side audit against the approved
mockup's actual HTML/CSS source turned up real gaps between what was built and
what the mockup specifies. This spec closes those gaps so the app matches the
mockup as closely as the real data/routing/architecture reasonably allow —
the same standard the original spec set for itself in its §1, which this
pass now goes back and actually satisfies for the items that were missed.

Two kinds of gap, both in scope per Javen's explicit confirmation:

- **Missing polish** that was always implied by the approved mockup but never
  built: the home genre chip row, card hover scrim, Share button, dual
  favorites entry point in the nav, empty-state icon/card, hero grain
  texture, rank-numeral stroke style.
- **Structural rework** to match the mockup's actual information
  architecture, not just its decoration: the home page's row layout, the
  movie details page's layout, the hero's trailer-playback interaction, and
  the cast card's visual treatment.

## 2. Non-goals (unchanged from, or newly confirmed on top of, the prior spec)

- **Search stays a dedicated page/route** (`/search`, existing
  `src/pages/Search.tsx`), not the mockup's nav flyout. Confirmed decision:
  the mockup's flyout has no real search logic behind it — its own
  placeholder text is literally labelled "（示意）" ("illustrative/demo") —
  while the current app has a real, working TMDB-backed search page.
  Replacing a working feature with the mockup's acknowledged non-functional
  placeholder would be a regression, not fidelity.
- No container queries — still real Tailwind viewport breakpoints (carried
  over from the prior spec, unchanged).
- No autoplay hero carousel — still manual dash-click navigation only
  (carried over, and matches the mockup, which is also click-only).
- No backend/auth changes, no new state/data-fetching library — same
  constraints as the prior spec.
- The following are **mockup-review-tool artifacts, not app design**, and
  are correctly *not* being replicated:
  - The outer "review shell" chrome (desktop/phone toggle segmented
    control, the "film-strip" decorative border, the legend line) — that's
    scaffolding the mockup uses to show two device widths side by side in
    one static page; the real app just responds to the real viewport.
  - The poster "book icon" watermark (`.poster-mark`) — a placeholder the
    mockup shows in place of a real photo, since it uses color blocks
    instead of real images. The real app already renders real TMDB poster
    art, so there is nothing to watermark.
  - The favorites empty-state's "空清單狀態預覽" tag text — that's an
    annotation for whoever is reviewing the mockup ("empty-state preview"),
    not real product copy. The rest of that empty state's visual design
    (dashed card, icon, heading, paragraph) *is* real design and is in
    scope below.
- `MainWrapper`'s current scroll-triggered "load next page" behavior on the
  New/Popular/Top10 rows is being **intentionally dropped**, not preserved,
  as part of unifying all home rows onto one component (§3.1). This is a
  deliberate simplification to match the mockup's fixed-list rows and avoid
  maintaining two different row behaviors — flagged here explicitly since
  it removes an existing capability rather than just adding one.

## 3. Changes by area

### 3.1 Home — unify all rows, drop the tab switcher

**Current:** `MainWrapper.tsx` renders a New/Popular/Top10 **tab switcher**
(only one visible at a time, with scroll-triggered pagination), followed by
`GenreRows.tsx` (Action, Comedy — always visible) and `UpcomingSlide.tsx`
(Coming Soon — always visible). This tab-switcher predates this redesign
entirely and was never something either spec proposed changing — but it
does not match the mockup, which shows **all six rows stacked and visible
at once**, in this fixed order: New Releases → Popular → Top 10 This Week →
Action → Comedy → Coming Soon.

**New:** Retire `MainWrapper.tsx`, `GenreRows.tsx`, and `UpcomingSlide.tsx`.
Replace with one new component, config-driven, rendering all six rows
unconditionally in the mockup's order:

```
[
  { anchorId: "row-new",    label: "New Releases",        fetcher: getNowPlayingMovieList },
  { anchorId: "row-hot",    label: "Popular",              fetcher: getPopularMovieList },
  { anchorId: "row-top10",  label: "Top 10 This Week",     fetcher: getTopMovieList, numbered: true },
  { anchorId: "row-action", label: "Action",               fetcher: (page) => getMoviesByGenre(28, page) },
  { anchorId: "row-comedy", label: "Comedy",                fetcher: (page) => getMoviesByGenre(35, page) },
  { anchorId: "row-soon",   label: "Coming Soon",           fetcher: getUpcomingMovieList },
]
```

Each row fetches its own page 1 on mount and renders independently through
the existing `Slide` + `MovieCard` pattern — same shape as the current
`GenreRow` in `GenreRows.tsx`, just generalized to take any fetcher and
reused six times instead of twice. Each row's wrapping `<section id=...>`
renders unconditionally (not gated behind `if (!movies.length) return
null`), carrying forward the anchor-timing fix from the prior pass so
Header genre links can still find and scroll to a row before its data has
loaded.

The Top 10 row passes `rank={index + 1}` to each `MovieCard`, same as
today.

**Header genre-link fallback changes accordingly:** today, genres without
their own row (Horror, Sci-Fi, Drama, Animation, Romance, Documentary) fall
back to scrolling to `row-tabs` (the tab section). Since there's no more
tab section, they fall back to `row-new` instead — matching the mockup's
own `goToGenre` fallback (`ids.new` in its `map` object's default).

`Home.tsx` now mounts: `Hero`, the new genre chip row (§3.2), the new
unified rows component. No more separate `MainWrapper`/`GenreRows`/
`UpcomingSlide` mounts.

### 3.2 Home — genre chip row

The mockup has a horizontally-scrolling chip row directly under the Hero
("All" + the 8 curated genres) that isn't in the app at all today — genre
access only exists via the Header dropdown. Add it: same 8 curated genres
as the Header dropdown (extract that list into one shared constant both
components import, rather than duplicating it), plus a leading "All" chip.
Clicking a genre chip scrolls to its row using the same anchor logic as the
Header's genre links (Action → `row-action`, Comedy → `row-comedy`, else →
`row-new`). "All" is a purely decorative default-active state — like the
mockup, it doesn't filter anything; there's nothing to reset to since
nothing is ever filtered out.

### 3.3 Movie cards — hover scrim, sibling dimming, radius, rank style

`MovieCard.tsx` currently only scales up slightly on hover; the mockup
reveals the movie's title and rating over the bottom of the poster on
hover, and dims sibling cards in the same row so the hovered one stands
out. Add:

- A gradient scrim at the bottom of the poster, hidden by default, fading
  in on hover, containing the movie title and a star-rating chip.
- Row-level "focus" behavior: hovering one card dims the others in the same
  row slightly (not itself). This needs a shared hover-group context at the
  row level — the natural place is inside `Slide.tsx`'s track container,
  since every row (home rows, recommendations, cast) already renders
  through it.
- Poster corner radius matched to the mockup's 10px (currently 8px,
  `rounded-lg`).
- The Top 10 rank numeral switches from a translucent fill to an outlined
  ("stroked") numeral, matching the mockup's treatment.

### 3.4 Header — sticky nav, dual favorites entry point

- The Header becomes sticky (`position: sticky; top: 0`) with a gradient
  fade-to-transparent background instead of a solid bar, so it reads as
  part of the Hero rather than a hard-edged bar sitting on top of it — same
  visual language as the mockup's `app-nav`. It still needs to stay legible
  over any page content once the user scrolls past the Hero, so the
  gradient's stop values need checking against body copy, not just the
  Hero.
- Add a second favorites entry point: an icon-only heart button with the
  same live count badge, in the icon cluster next to Search — **in
  addition to**, not replacing, the existing "Favorite" text link + badge
  in the main nav links. This matches the mockup, which has both.

### 3.5 Hero — full-hero trailer playback, grain texture

- Remove the small inline trailer-thumbnail box currently sitting in the
  CTA row. In the mockup, "Play Trailer" is the primary CTA button itself,
  and clicking it plays the trailer **across the whole Hero**, not in a
  separate small box.
- Clicking "Play Trailer" (only shown/enabled when the featured movie has a
  trailer) swaps the Hero's backdrop image for a real YouTube iframe
  filling the same bounds, with a way to stop playback and return to the
  backdrop (the mockup's own veil has no real video to stop, so this needs
  a small addition beyond it — a close affordance — since a real embedded
  player needs one).
- Add the mockup's subtle grain/noise texture overlay on the Hero backdrop
  — pure decoration, no interaction.

### 3.6 Movie Details — backdrop + floating poster layout

**Current:** a left/right split — info column (title, meta, overview) on
the left, the trailer facade (or a plain poster fallback) on the right.
This is inherited from the pre-redesign app and was extended, not rebuilt,
in the prior pass. It doesn't match the mockup's layout at all.

**New**, matching the mockup:

- A full-width backdrop image band at the top of the page, gradient-fading
  into the page background at its bottom edge, with the back button
  overlaid on top of it (pill-shaped, translucent/blurred background) —
  this replaces the current plain back button for this page specifically;
  `HeaderWithBack` is shared with Person Details and is not being changed,
  to avoid an unintended visual change there.
- Below the backdrop: the poster thumbnail floats up to overlap the
  backdrop's bottom edge (negative top margin), sitting beside a single
  info column (title, genre pills, rating/year/runtime meta line, an
  actions row, overview paragraph) — stacking to one column below the
  `md` breakpoint, poster centered above info.
- The actions row now has **two** buttons: Favorite (see below) and a new
  **Share** button — uses the Web Share API when available
  (`navigator.share`), falling back to copying the page URL to the
  clipboard with a brief inline confirmation on the button itself when it
  isn't. No new dependency.
- The trailer facade moves out of the two-column area entirely and becomes
  its own full-width band **below** the info block (only rendered when a
  trailer exists, same as today) — matching the mockup's stacked layout.
- Cast row and recommendations row keep their current position, below the
  trailer band.
- `FavoriteButton` gains a `variant` prop: the existing small circular
  icon-only look (default, unchanged — still used by `MovieCard` and
  `Hero`) and a new outline "pill" look with a text label ("Add to
  Favorites" / "Favorited"), used only here, matching the mockup's
  `.btn-fav.btn-outline`.

### 3.7 Cast cards — circular photo treatment

`CastCard.tsx` currently renders a rectangular photo with a white
info panel below it (pre-existing app style, untouched by the prior
redesign since it was out of that pass's scope). The mockup uses a circular
photo directly on the dark page background, with the name and role as
plain centered text underneath, no card panel. Since this pass's approved
scope is full mockup fidelity, this is now in scope: switch to the circular
treatment.

### 3.8 Favorites — empty-state visual design

The empty state's copy is already correct (shipped in the prior pass). Its
*visual* container is not: the mockup wraps the empty state in a
dashed-border card with a heart icon above the heading. Add that container
and icon around the existing heading/paragraph/CTA — no copy changes here.

## 4. File change list (for the implementation plan)

**New files**
- A shared genre-list constant (used by `Header` and the new genre chip
  row, replacing the copy that currently lives only in `Header.tsx`).
- The unified home-rows component (replacing `MainWrapper.tsx`,
  `GenreRows.tsx`, `UpcomingSlide.tsx`).
- The genre chip row component.

**Deleted files**
- `src/layouts/MainWrapper.tsx`
- `src/layouts/GenreRows.tsx`
- `src/layouts/UpcomingSlide.tsx`

**Modified files**
- `src/pages/Home.tsx` (mount the new components instead of the retired
  ones)
- `src/layouts/Header.tsx` (sticky/gradient nav, second favorites icon
  button, updated genre-link fallback anchor, import the shared genre-list
  constant instead of its own copy)
- `src/components/MovieCard.tsx` (hover scrim, radius, rank style)
- `src/components/Slide.tsx` (row-level hover-dimming context)
- `src/components/FavoriteButton.tsx` (new `variant` prop)
- `src/components/Hero.tsx` (remove inline trailer box, full-hero playback,
  grain texture)
- `src/pages/MovieDetails.tsx` (layout rebuild, Share button, pill favorite
  button, trailer band repositioned)
- `src/components/CastCard.tsx` (circular photo treatment)
- `src/pages/Favorite.tsx` (empty-state container + icon)

## 5. Self-review notes

- Every item in the approved A+B scope from the audit maps to a numbered
  section above (A: §3.2–§3.4 icon button, §3.3 scrim/dimming/radius/rank,
  §3.5 grain, §3.6 Share, §3.8 empty state. B: §3.1 row architecture, §3.5
  hero playback, §3.6 layout rebuild, §3.7 cast cards).
- The search-flyout question and the MainWrapper-pagination removal are
  both called out explicitly in §2 as confirmed, deliberate decisions —
  not silent scope changes.
- `HeaderWithBack` is explicitly *not* touched, to contain the Movie
  Details back-button redesign to that one page rather than leaking into
  Person Details, which is out of scope for this pass.
- Open item for the implementation plan to resolve concretely (not a
  design ambiguity, just needs to be written out with exact values): the
  Header's gradient-fade background needs specific color stops checked
  against real page content scrolled underneath it, not just the Hero —
  this spec sets the direction, the plan should verify it in the browser
  against a page with body copy near the top (e.g. Movie Details) as part
  of its own verification step, not just Home.
