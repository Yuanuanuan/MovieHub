# MovieHub Mockup Fidelity Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gaps between the shipped MovieHub redesign and the approved
"MovieHub Reel Cut" mockup found by a post-implementation audit — unify the
home page's row layout, add the missing genre chip row and card hover
interactions, rebuild Movie Details around a backdrop/floating-poster layout,
switch the Hero to full-bleed trailer playback, redesign cast cards, and
polish the Header and Favorites empty state.

**Architecture:** No new dependencies, no new state library. The six home
rows (New/Popular/Top10/Action/Comedy/Coming Soon) collapse from three
separate components (`MainWrapper`, `GenreRows`, `UpcomingSlide`) into one
config-driven component reusing the existing `Slide`/`MovieCard` pattern.
Card hover-dim uses Tailwind's named `group`/`peer` variants, already
available in this project's Tailwind version — no new CSS mechanism.
Sharing/clipboard uses the native Web Share/Clipboard APIs — no package.

**Tech Stack:** React 18, TypeScript, Vite 8, Tailwind CSS 3.4, Redux Toolkit
2, React Router 7, axios — all already in the project; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-22-moviehub-mockup-fidelity-design.md`

## Global Constraints

- No new npm dependencies. Web Share API (`navigator.share`) and Clipboard
  API (`navigator.clipboard`) are browser-native — no package needed.
- No automated test framework (this repo has none) — each task's test cycle
  is `npx tsc --noEmit` clean, `npm run lint` clean, and a concrete manual
  QA check in the browser.
- All UI copy stays English, carried over unchanged from the prior pass.
- Any API call reuses one of the six existing fetcher functions already in
  `src/api/movie.ts` (`getNowPlayingMovieList`, `getPopularMovieList`,
  `getTopMovieList`, `getMoviesByGenre`, `getUpcomingMovieList`,
  `getMovieRecommendations`) — this plan adds no new API functions.
- Tailwind-only styling. Reuse existing design tokens (`black`, `white`,
  `primary` in `tailwind.config.js`, `font-bebas`) — no new color literals
  except where matching an existing pattern already in the codebase (e.g.
  `text-yellow-400` for a rating star is Tailwind's built-in palette, not a
  new custom color).
- `path` alias `@` → `src` for all imports, matching every existing file.
- Function components only, no class components, no new UI library.
- `src/layouts/MainLayout.tsx` is explicitly **not** touched by this plan.
  Header's sticky positioning is self-contained (`position: sticky`
  establishes its own stacking context without any parent change).
- `src/components/HeaderWithBack.tsx` is explicitly **not** touched. It
  keeps its current look for `src/pages/PersonDetails.tsx`. Movie Details
  gets its own inline back button instead of reusing or modifying the
  shared component, per the spec's explicit scope boundary.

---

## File Structure

**New files:**
- `src/constants/genres.ts` — the curated genre list (id/label/anchor),
  shared by `Header` and the new genre chip row instead of being defined
  twice.
- `src/components/GenreChipRow.tsx` — the home page's "All" + 8-genre
  horizontal chip row, missing from the app entirely today.
- `src/layouts/HomeRows.tsx` — replaces `MainWrapper.tsx`, `GenreRows.tsx`,
  and `UpcomingSlide.tsx` with one config-driven component rendering all
  six home rows, always visible, in the mockup's fixed order.

**Deleted files:**
- `src/layouts/MainWrapper.tsx` — the New/Popular/Top10 tab switcher;
  superseded by `HomeRows.tsx`.
- `src/layouts/GenreRows.tsx` — the Action/Comedy rows; folded into
  `HomeRows.tsx`.
- `src/layouts/UpcomingSlide.tsx` — the Coming Soon row; folded into
  `HomeRows.tsx`.

**Modified files:** `src/layouts/Header.tsx`, `src/components/Slide.tsx`,
`src/components/MovieCard.tsx`, `src/components/FavoriteButton.tsx`,
`src/pages/Home.tsx`, `src/components/Hero.tsx`,
`src/components/CastCard.tsx`, `src/pages/MovieDetails.tsx`,
`src/pages/Favorite.tsx`, `src/index.css`.

---

### Task 1: Shared curated-genres constant

**Files:**
- Create: `src/constants/genres.ts`

**Interfaces:**
- Produces: named export `CURATED_GENRES: CuratedGenre[]` and the
  `CuratedGenre` interface (`{ id: number; label: string; anchor: string }`).
  Consumed by `Header.tsx` (Task 2) and `GenreChipRow.tsx` (Task 6).

- [ ] **Step 1: Create the constant**

Create `src/constants/genres.ts`. This is the same 8-genre list
`Header.tsx` already hardcodes today, moved to a shared location — with one
change: the fallback `anchor` for genres without their own row (everything
except Action/Comedy) switches from `"row-tabs"` to `"row-new"`, because
Task 7 retires the `row-tabs` section entirely and the mockup's own
fallback (`goToGenre`'s `ids.new` default) is the New row.

```ts
export interface CuratedGenre {
  id: number;
  label: string;
  anchor: string;
}

export const CURATED_GENRES: CuratedGenre[] = [
  { id: 28, label: "Action", anchor: "row-action" },
  { id: 35, label: "Comedy", anchor: "row-comedy" },
  { id: 27, label: "Horror", anchor: "row-new" },
  { id: 878, label: "Sci-Fi", anchor: "row-new" },
  { id: 18, label: "Drama", anchor: "row-new" },
  { id: 16, label: "Animation", anchor: "row-new" },
  { id: 10749, label: "Romance", anchor: "row-new" },
  { id: 99, label: "Documentary", anchor: "row-new" },
];
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean (nothing imports this file yet).

- [ ] **Step 3: Commit**

```bash
git add src/constants/genres.ts
git commit -m "feat: add shared curated-genres constant"
```

---

### Task 2: Header — sticky nav, dual favorites entry, shared genre constant

**Files:**
- Modify: `src/layouts/Header.tsx`

**Interfaces:**
- Consumes: `CURATED_GENRES`, `CuratedGenre` from `@/constants/genres`
  (Task 1).
- Produces: no new exported names — still the default export `Header`.

**Design note on the "gradient fade" background:** the mockup's nav
literally overlaps the Hero image (it's `position: sticky` sitting on top
of a Hero that starts right underneath it in the same stacking context, so
a background that fades to transparent shows the Hero image bleeding
through). This app's `Header` is rendered by `MainLayout` *outside* the
page content, in normal document flow above the Hero — not overlapping it
— and `MainLayout.tsx` is out of scope for this plan (see Global
Constraints). Making the header `sticky` with a background that fades to
fully transparent would, once the user scrolls past the Hero, show
whatever page content is scrolling *underneath* the header bleeding through
its lower half — broken, not "soft." So this task uses a solid,
slightly-translucent, blurred background (`bg-black/95 backdrop-blur-sm`)
instead of a literal fade-to-transparent gradient: it reads as less of a
hard flat bar than today's flat `bg-black`, and stays legible over any page
content once scrolled, which the spec itself calls out as a requirement.

- [ ] **Step 1: Replace the local `CURATED_GENRES` with the shared import**

Current top of `src/layouts/Header.tsx`:

```tsx
import { useNavigate, useLocation } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SearchIcon from "@/components/SearchIcon";
import Logo from "@/components/Logo";
import { FavoriteMovie } from "@/utils/module";

interface FavoritesSelectorType {
  favorites: { items: FavoriteMovie[] };
}

const CURATED_GENRES: { id: number; label: string; anchor: string }[] = [
  { id: 28, label: "Action", anchor: "row-action" },
  { id: 35, label: "Comedy", anchor: "row-comedy" },
  { id: 27, label: "Horror", anchor: "row-tabs" },
  { id: 878, label: "Sci-Fi", anchor: "row-tabs" },
  { id: 18, label: "Drama", anchor: "row-tabs" },
  { id: 16, label: "Animation", anchor: "row-tabs" },
  { id: 10749, label: "Romance", anchor: "row-tabs" },
  { id: 99, label: "Documentary", anchor: "row-tabs" },
];
```

Replace with:

```tsx
import { useNavigate, useLocation } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SearchIcon from "@/components/SearchIcon";
import Logo from "@/components/Logo";
import { FavoriteMovie } from "@/utils/module";
import { CURATED_GENRES } from "@/constants/genres";

interface FavoritesSelectorType {
  favorites: { items: FavoriteMovie[] };
}
```

- [ ] **Step 2: Make the header sticky with the new background**

Current:

```tsx
    <header className="w-auto px-4 md:px-6 h-20 flex justify-between items-center bg-black text-white relative">
```

Change to:

```tsx
    <header className="w-auto px-4 md:px-6 h-20 flex justify-between items-center bg-black/95 backdrop-blur-sm text-white sticky top-0 z-50">
```

- [ ] **Step 3: Add the second favorites entry — an icon button with badge**

Current (the desktop `<ul>` closes, then the hamburger button follows
directly):

```tsx
        <li onClick={handleSearch}>
          <SearchIcon className="w-7 h-7 fill-white cursor-pointer" />
        </li>
      </ul>

      <button
        type="button"
        className="md:hidden w-10 h-10 flex items-center justify-center"
        aria-label="Menu"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
```

Replace with (wraps the hamburger in a new always-visible icon cluster
alongside the new favorites-icon button — the mockup keeps its icon
cluster, unlike the text nav links, visible at every width):

```tsx
        <li onClick={handleSearch}>
          <SearchIcon className="w-7 h-7 fill-white cursor-pointer" />
        </li>
      </ul>

      <div className="flex items-center gap-1">
        <Link
          to={RouthPath.favorite}
          aria-label="Favorites"
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.5-3c3.5.5 5 4 3.5 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
          {favoriteCount > 0 && (
            <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
              {favoriteCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="md:hidden w-10 h-10 flex items-center justify-center"
          aria-label="Menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
```

This changes the button's closing tags too — the hamburger `<button>` is
now nested inside the new wrapping `<div>`, so its own closing `</button>`
stays where it is, but the element right after it (the SVG icon markup) is
unchanged; only add a closing `</div>` right after that existing
`</button>` and before the `{mobileMenuOpen && (...)}` block. Concretely,
this line:

```tsx
      </button>

      {mobileMenuOpen && (
```

becomes:

```tsx
      </button>
      </div>

      {mobileMenuOpen && (
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: `npm run dev`, open Home. Confirm: a heart icon with a live
count badge now sits next to the hamburger/search area (visible at both
desktop and phone widths), in addition to the existing "Favorite" text
link + badge in the desktop nav. Favorite a movie from a row card, confirm
*both* badges update to the same count. Scroll the page down — the header
stays pinned to the top instead of scrolling away, and stays legible (not
see-through) over the content now underneath it. Click a genre in the
desktop dropdown that has no dedicated row (e.g. "Horror") — since Task 7
hasn't landed yet, this will 404-scroll to nothing yet (the `row-new`
anchor doesn't exist until Task 7); that's expected at this point in the
plan, not a bug to chase down now.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Header.tsx
git commit -m "feat: sticky Header, add favorites icon button, use shared genre constant"
```

---

### Task 3: `Slide` — row-level hover-dim group

**Files:**
- Modify: `src/components/Slide.tsx`

**Interfaces:**
- Produces: no new props or exports — the track container now carries an
  (unnamed) Tailwind `group` class that `MovieCard` (Task 4) reads via
  `group-hover:`. Every existing consumer of `Slide` (home rows, cast row,
  recommendations row) gets this for free with no call-site changes.

- [ ] **Step 1: Add the `group` class to the track container**

Current `src/components/Slide.tsx`:

```tsx
        <div
          ref={slideRef}
          className="px-4 py-4 grid grid-flow-col gap-3 overflow-scroll no-scrollbar"
        >
```

Change to:

```tsx
        <div
          ref={slideRef}
          className="group px-4 py-4 grid grid-flow-col gap-3 overflow-scroll no-scrollbar"
        >
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. No visual change yet — nothing reads `group-hover:` until
Task 4 lands.

- [ ] **Step 3: Commit**

```bash
git add src/components/Slide.tsx
git commit -m "feat: add row-level hover group to Slide for card dimming"
```

---

### Task 4: `MovieCard` — hover scrim, sibling dimming, radius, rank style

**Files:**
- Modify: `src/components/MovieCard.tsx`

**Interfaces:**
- Consumes: the unnamed `group` class now on `Slide`'s track container
  (Task 3) — `MovieCard` doesn't need to be inside a `Slide` for this to
  work (the `group-hover:` utilities simply never trigger with no matching
  ancestor, e.g. in the Favorites page's plain grid — safe no-op there).
- Produces: no prop/type changes — same `{ movie: MovieInfo; rank?: number
  }` signature.

- [ ] **Step 1: Rewrite the component**

Current `src/components/MovieCard.tsx`:

```tsx
import { MovieInfo } from "@/utils/module";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";

interface MainMovieCardProps {
  movie: MovieInfo;
  rank?: number;
}

const MainMovieCard = ({ movie, rank }: MainMovieCardProps) => {
  return (
    <div
      key={movie.id}
      className={`relative main-wrapper ${
        rank ? "pl-6" : ""
      } w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[350px]`}
    >
      {rank && (
        <span
          className="absolute -left-2 -bottom-3 z-0 font-bebas text-white/10 leading-none select-none pointer-events-none"
          style={{ fontSize: "88px" }}
        >
          {rank}
        </span>
      )}
      <Link to={`/movieDetails/${movie.id}`} className="relative z-10 block h-full">
        <img
          width={"100%"}
          height={"100%"}
          src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
          className="w-full h-full object-cover rounded-lg cursor-pointer shadow-xl shadow-gray-900 transition-all hover:scale-105 main-movie-card"
          alt="movie image"
        />
        <FavoriteButton
          movie={{
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
          }}
          className="absolute top-2 right-2 w-8 h-8"
        />
      </Link>
    </div>
  );
};

export default MainMovieCard;
```

Replace with:

```tsx
import { MovieInfo } from "@/utils/module";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";
import starIcon from "/star.svg";

interface MainMovieCardProps {
  movie: MovieInfo;
  rank?: number;
}

const MainMovieCard = ({ movie, rank }: MainMovieCardProps) => {
  return (
    <div
      key={movie.id}
      className={`relative main-wrapper ${
        rank ? "pl-6" : ""
      } w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[350px]`}
    >
      {rank && (
        <span
          className="absolute -left-2 -bottom-3 z-0 font-bebas leading-none select-none pointer-events-none"
          style={{
            fontSize: "88px",
            color: "transparent",
            WebkitTextStroke: "2px rgba(255,255,255,0.25)",
          }}
        >
          {rank}
        </span>
      )}
      <Link
        to={`/movieDetails/${movie.id}`}
        className="group/card relative z-10 block h-full rounded-[10px] overflow-hidden transition-opacity group-hover:opacity-70 hover:!opacity-100"
      >
        <img
          width={"100%"}
          height={"100%"}
          src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
          className="w-full h-full object-cover cursor-pointer shadow-xl shadow-gray-900 transition-transform duration-300 hover:scale-105 hover:-translate-y-1 main-movie-card"
          alt="movie image"
        />
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none">
          <h3 className="text-sm font-bold text-white line-clamp-1">
            {movie.title}
          </h3>
          <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold mt-1">
            <img src={starIcon} width={12} height={12} alt="star icon" />
            {movie.vote_average.toFixed(1)}
          </span>
        </div>
        <FavoriteButton
          movie={{
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
          }}
          className="absolute top-2 right-2 w-8 h-8 z-10"
        />
      </Link>
    </div>
  );
};

export default MainMovieCard;
```

What changed and why:
- `group/card` on the `Link` plus `group-hover/card:opacity-100` on the new
  scrim `div` reveals the title/rating whenever *this* card is hovered.
- `group-hover:opacity-70` (unnamed — reads `Slide`'s track `group` from
  Task 3) dims every card in the row when *any* card in it is hovered;
  `hover:!opacity-100` on the same `Link` overrides that dimming back to
  full opacity for the specific card the pointer is actually over — the
  same "highlight one, dim the rest" idiom Tailwind's own docs use for
  this exact pattern.
- `rounded-[10px]` replaces `rounded-lg` (8px) to match the mockup's
  poster radius exactly, and moved from the `<img>` onto the `Link`
  wrapper (with `overflow-hidden`) so the new scrim's corners clip
  correctly too.
- The rank numeral switches from a translucent fill (`text-white/10`) to
  an outlined/stroked numeral (`WebkitTextStroke`), matching the mockup's
  `-webkit-text-stroke` treatment.
- `hover:scale-105` gained `hover:-translate-y-1`, matching the mockup's
  lift-and-scale hover (`translateY(-4px) scale(1.045)`).

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. (`WebkitTextStroke` is a valid `CSSProperties` key via
`csstype`, which `@types/react` uses — `tsc` will catch it here if not.)

Manual check: `npm run dev`, open Home (rows will still be the old
tab-switcher layout until Task 7 — that's fine, `MovieCard` itself is
already mounted in `GenreRows`' Action/Comedy rows and the tab rows, so
this is testable now). Hover a card: title + rating fade in over the
bottom of the poster, the card lifts and scales slightly, and the *other*
cards in the same row dim slightly while the hovered one stays full
brightness. Move to Favorites (`/favorite`) with a couple of saved movies:
hover a card there too — the scrim reveal still works (its own `group/card`
is self-contained), but nothing dims (no ancestor `group`, which is
correct — Favorites is a grid, not a row, and was never meant to have
neighbor-dimming).

- [ ] **Step 3: Commit**

```bash
git add src/components/MovieCard.tsx
git commit -m "feat: add hover scrim, sibling dimming, and rank stroke style to MovieCard"
```

---

### Task 5: `FavoriteButton` — add pill variant

**Files:**
- Modify: `src/components/FavoriteButton.tsx`

**Interfaces:**
- Produces: new optional prop `variant?: "icon" | "pill"` (default
  `"icon"`, preserving current behavior exactly for every existing
  call site — `MovieCard`, `Hero`). `variant="pill"` is new, consumed by
  `MovieDetails` (Task 11).

- [ ] **Step 1: Rewrite the component**

Current `src/components/FavoriteButton.tsx`:

```tsx
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/reducer/favoritesSlice";
import { FavoriteMovie } from "@/utils/module";

interface FavoritesSelectorType {
  favorites: {
    items: FavoriteMovie[];
  };
}

interface FavoriteButtonProps {
  movie: FavoriteMovie;
  className?: string;
}

function FavoriteButton({ movie, className = "" }: FavoriteButtonProps) {
  const dispatch = useDispatch();
  const isFavorite = useSelector((state: FavoritesSelectorType) =>
    state.favorites.items.some((item) => item.id === movie.id)
  );

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(movie));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      aria-pressed={isFavorite}
      className={`flex items-center justify-center rounded-full transition-colors ${
        isFavorite ? "bg-primary text-white" : "bg-black/55 text-white"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.5-3c3.5.5 5 4 3.5 7.7C19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}

export default FavoriteButton;
```

Replace with:

```tsx
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "@/reducer/favoritesSlice";
import { FavoriteMovie } from "@/utils/module";

interface FavoritesSelectorType {
  favorites: {
    items: FavoriteMovie[];
  };
}

interface FavoriteButtonProps {
  movie: FavoriteMovie;
  className?: string;
  variant?: "icon" | "pill";
}

function FavoriteButton({
  movie,
  className = "",
  variant = "icon",
}: FavoriteButtonProps) {
  const dispatch = useDispatch();
  const isFavorite = useSelector((state: FavoritesSelectorType) =>
    state.favorites.items.some((item) => item.id === movie.id)
  );

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(movie));
  }

  const heartIcon = (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={isFavorite ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.5-3c3.5.5 5 4 3.5 7.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isFavorite}
        className={`flex items-center gap-2 py-2.5 px-5 rounded-md border transition-colors ${
          isFavorite
            ? "bg-primary border-primary text-white"
            : "bg-transparent border-white/25 text-white hover:border-white/50"
        } ${className}`}
      >
        {heartIcon}
        {isFavorite ? "Favorited" : "Add to Favorites"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      aria-pressed={isFavorite}
      className={`flex items-center justify-center rounded-full transition-colors ${
        isFavorite ? "bg-primary text-white" : "bg-black/55 text-white"
      } ${className}`}
    >
      {heartIcon}
    </button>
  );
}

export default FavoriteButton;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. No visual change anywhere yet — every existing call site
omits `variant`, so it defaults to `"icon"`, identical to today's only
behavior. `variant="pill"` isn't used until Task 11.

- [ ] **Step 3: Commit**

```bash
git add src/components/FavoriteButton.tsx
git commit -m "feat: add pill variant to FavoriteButton"
```

---

### Task 6: `GenreChipRow` component

**Files:**
- Create: `src/components/GenreChipRow.tsx`

**Interfaces:**
- Consumes: `CURATED_GENRES` from `@/constants/genres` (Task 1),
  `RouthPath` from `@/routers/router` (existing).
- Produces: default export `GenreChipRow`, no props (self-contained).
  Mounted by `Home.tsx` in Task 8.

- [ ] **Step 1: Create the component**

Create `src/components/GenreChipRow.tsx`:

```tsx
import { useNavigate } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { CURATED_GENRES } from "@/constants/genres";

function GenreChipRow() {
  const navigate = useNavigate();

  function handleChipClick(anchor: string) {
    navigate(`${RouthPath.home}#${anchor}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 md:px-16 pb-6 no-scrollbar">
      <button
        type="button"
        className="flex-none py-2 px-4 rounded-full text-sm font-bold bg-white text-black"
      >
        All
      </button>
      {CURATED_GENRES.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => handleChipClick(genre.anchor)}
          className="flex-none py-2 px-4 rounded-full text-sm font-bold border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10"
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}

export default GenreChipRow;
```

The "All" chip is deliberately non-interactive beyond its default-active
look, matching the mockup: nothing is ever filtered out of the rows below
it, so there's nothing for "All" to reset.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean (not mounted yet — visual check happens in Task 8).

- [ ] **Step 3: Commit**

```bash
git add src/components/GenreChipRow.tsx
git commit -m "feat: add home page genre chip row"
```

---

### Task 7: `HomeRows` — unify all six rows, delete the old three components

**Files:**
- Create: `src/layouts/HomeRows.tsx`
- Delete: `src/layouts/MainWrapper.tsx`, `src/layouts/GenreRows.tsx`,
  `src/layouts/UpcomingSlide.tsx`

**Interfaces:**
- Consumes: `getNowPlayingMovieList`, `getPopularMovieList`,
  `getTopMovieList`, `getMoviesByGenre`, `getUpcomingMovieList` (all
  existing, `src/api/movie.ts`), `Slide`, `MovieCard` (existing).
- Produces: default export `HomeRows`, no props (self-contained). Mounted
  by `Home.tsx` in Task 8. Renders DOM anchor ids `row-new`, `row-hot`,
  `row-top10`, `row-action`, `row-comedy`, `row-soon` — these are what
  `Header`'s and `GenreChipRow`'s genre links scroll to.

- [ ] **Step 1: Create `HomeRows`**

Create `src/layouts/HomeRows.tsx`:

```tsx
import { useEffect, useState } from "react";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import {
  getNowPlayingMovieList,
  getPopularMovieList,
  getTopMovieList,
  getMoviesByGenre,
  getUpcomingMovieList,
} from "@/api/movie";
import { MovieInfo } from "@/utils/module";

interface RowConfig {
  anchorId: string;
  label: string;
  fetcher: () => Promise<MovieInfo[]>;
  numbered?: boolean;
}

const ROWS: RowConfig[] = [
  {
    anchorId: "row-new",
    label: "New Releases",
    fetcher: () => getNowPlayingMovieList(),
  },
  {
    anchorId: "row-hot",
    label: "Popular",
    fetcher: () => getPopularMovieList(),
  },
  {
    anchorId: "row-top10",
    label: "Top 10 This Week",
    fetcher: () => getTopMovieList(),
    numbered: true,
  },
  {
    anchorId: "row-action",
    label: "Action",
    fetcher: () => getMoviesByGenre(28),
  },
  {
    anchorId: "row-comedy",
    label: "Comedy",
    fetcher: () => getMoviesByGenre(35),
  },
  {
    anchorId: "row-soon",
    label: "Coming Soon",
    fetcher: () => getUpcomingMovieList(),
  },
];

function HomeRow({ anchorId, label, fetcher, numbered }: RowConfig) {
  const [movies, setMovies] = useState<MovieInfo[]>([]);

  useEffect(() => {
    fetcher().then(setMovies);
  }, [anchorId, fetcher]);

  if (!movies.length) return <section id={anchorId} />;

  return (
    <section id={anchorId}>
      <h2 className="text-white text-4xl ml-4 mb-2">{label}</h2>
      <Slide>
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            rank={numbered ? index + 1 : undefined}
          />
        ))}
      </Slide>
      <hr className="hr m-10" />
    </section>
  );
}

function HomeRows() {
  return (
    <>
      {ROWS.map((row) => (
        <HomeRow key={row.anchorId} {...row} />
      ))}
    </>
  );
}

export default HomeRows;
```

This is a direct generalization of the existing `GenreRow` pattern from the
now-deleted `GenreRows.tsx`: fetch page 1 on mount, render nothing but the
anchor `<section>` until data arrives (so Header/chip-row links can still
find and scroll to it before the fetch resolves), then render the label +
`Slide` + `MovieCard`s once it has. The Top 10 row is the only one that
passes a `rank`.

Note what's intentionally **not** carried forward from `MainWrapper.tsx`:
its scroll-triggered "load next page" behavior. Every row here fetches
page 1 only, same as the old `GenreRows`/`UpcomingSlide` always did — this
was flagged as a deliberate simplification in the spec (§2), not an
oversight.

- [ ] **Step 2: Delete the three retired components**

```bash
git rm src/layouts/MainWrapper.tsx src/layouts/GenreRows.tsx src/layouts/UpcomingSlide.tsx
```

- [ ] **Step 3: Verify**

Run: `grep -rn "MainWrapper\|GenreRows\|UpcomingSlide" src`
Expected: no output yet from anywhere *except* `src/pages/Home.tsx`, which
still imports and mounts the three deleted components until Task 8 lands
— so this grep will show three hits there right now, and that's expected;
`Home.tsx` gets fixed in the very next task. Don't proceed past this point
without doing Task 8 immediately after, since `Home.tsx` won't compile
with the old imports gone.

Run: `npx tsc --noEmit`
Expected: **fails** here — `src/pages/Home.tsx` still imports the three
deleted files. This is the same kind of expected, momentary broken state
the prior redesign plan hit between two tightly-coupled tasks (Task 8 →
Task 9 there); resolve it by doing Task 8 right away, then verify both
together.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/HomeRows.tsx
git commit -m "feat: add unified HomeRows component, remove MainWrapper/GenreRows/UpcomingSlide"
```

(This commits the addition and the three deletions together — `git rm` in
Step 2 already staged the deletions; `git add` in this step adds the new
file. Run `git status` before committing to confirm exactly these four
file changes are staged, nothing from `Home.tsx` yet.)

---

### Task 8: `Home.tsx` — mount the new components

**Files:**
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `GenreChipRow` (Task 6), `HomeRows` (Task 7).
- Produces: no new exported names.

- [ ] **Step 1: Swap the mounted components**

Current `src/pages/Home.tsx`:

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainWrapper from "@/layouts/MainWrapper";
import UpcomingSlide from "@/layouts/UpcomingSlide";
import GenreRows from "@/layouts/GenreRows";
import Hero from "@/components/Hero";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const anchorId = location.hash.slice(1);

    // The sections above the target (Hero, MainWrapper's tab rows, other
    // GenreRows) each load their own data independently and grow the page
    // height as they resolve, so a single fixed-delay scroll attempt can
    // land before that growth happens and never get chased. Re-correct
    // (instant, so repeated calls don't fight an in-progress smooth-scroll
    // animation) until the target sits at the top of the viewport on its
    // own for a few checks in a row — i.e. nothing above it shifted since
    // the last correction — instead of guessing a fixed duration that real
    // network timing won't reliably fit.
    let attempts = 0;
    let stableCount = 0;
    const maxAttempts = 40;
    const interval = setInterval(() => {
      attempts += 1;
      const target = document.getElementById(anchorId);
      if (target) {
        const topBeforeCorrection = target.getBoundingClientRect().top;
        if (Math.abs(topBeforeCorrection) < 2) {
          stableCount += 1;
        } else {
          stableCount = 0;
          target.scrollIntoView({ behavior: "instant", block: "start" });
        }
        if (stableCount >= 3) {
          clearInterval(interval);
        }
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [location]);

  return (
    <main>
      <Hero />
      <MainWrapper />
      <GenreRows />
      <UpcomingSlide />
    </main>
  );
};

export default Home;
```

Replace with:

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import GenreChipRow from "@/components/GenreChipRow";
import HomeRows from "@/layouts/HomeRows";
import Hero from "@/components/Hero";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const anchorId = location.hash.slice(1);

    // The sections above the target (Hero, the other HomeRows rows) each
    // load their own data independently and grow the page height as they
    // resolve, so a single fixed-delay scroll attempt can land before that
    // growth happens and never get chased. Re-correct (instant, so
    // repeated calls don't fight an in-progress smooth-scroll animation)
    // until the target sits at the top of the viewport on its own for a
    // few checks in a row — i.e. nothing above it shifted since the last
    // correction — instead of guessing a fixed duration that real network
    // timing won't reliably fit.
    let attempts = 0;
    let stableCount = 0;
    const maxAttempts = 40;
    const interval = setInterval(() => {
      attempts += 1;
      const target = document.getElementById(anchorId);
      if (target) {
        const topBeforeCorrection = target.getBoundingClientRect().top;
        if (Math.abs(topBeforeCorrection) < 2) {
          stableCount += 1;
        } else {
          stableCount = 0;
          target.scrollIntoView({ behavior: "instant", block: "start" });
        }
        if (stableCount >= 3) {
          clearInterval(interval);
        }
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [location]);

  return (
    <main>
      <Hero />
      <GenreChipRow />
      <HomeRows />
    </main>
  );
};

export default Home;
```

The scroll-to-anchor effect itself is untouched (only its explanatory
comment is reworded since it no longer mentions the retired
`MainWrapper`/`GenreRows` by name) — it was already generic over *any*
anchor id, so it works unchanged against the six new `row-*` ids from
`HomeRows`.

- [ ] **Step 2: Verify**

Run: `grep -rn "MainWrapper\|GenreRows\|UpcomingSlide" src`
Expected: no output at all now (this resolves the expected-broken state
noted at the end of Task 7).

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Run: `npm run build`
Expected: succeeds.

Manual check: `npm run dev`, open Home. Confirm: Hero, then the genre chip
row, then all six rows — New Releases, Popular, Top 10 This Week (with
rank numerals), Action, Comedy, Coming Soon — stacked and all visible at
once (no more tab switcher). Click "Action" in the chip row: scrolls to
the Action row. Click "Horror" in the Header's Genres dropdown (from a
different page, e.g. `/favorite`, to also confirm the cross-page case):
navigates to Home and scrolls to the **New Releases** row (the new
fallback, replacing the old tab section). Resize to ~390px: rows still
scroll horizontally within their own bounds, chip row scrolls
horizontally, no page-level horizontal scrollbar.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: mount GenreChipRow and HomeRows on Home"
```

---

### Task 9: `Hero` — full-hero trailer playback, grain texture

**Files:**
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `getPopularMovieList`, `getMovieDetails` (existing,
  unchanged), `FavoriteButton` (Task 5, used here with its default `"icon"`
  variant — unchanged call site), `RouthPath`, `IMovieDetails`, `MovieInfo`
  (existing).
- Produces: no new exported names. **Drops** its `TrailerFacade` import —
  `Hero` no longer uses that component at all (it still exists and is
  still used by `MovieDetails`, Task 11 — this task only removes Hero's
  own usage of it).

- [ ] **Step 1: Rewrite the component**

Current `src/components/Hero.tsx`:

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import starIcon from "/star.svg";
import { getPopularMovieList, getMovieDetails } from "@/api/movie";
import FavoriteButton from "@/components/FavoriteButton";
import TrailerFacade from "@/components/TrailerFacade";
import { RouthPath } from "@/routers/router";
import { IMovieDetails, MovieInfo } from "@/utils/module";

function Hero() {
  const [candidates, setCandidates] = useState<MovieInfo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDetails, setActiveDetails] = useState<IMovieDetails | null>(
    null
  );

  useEffect(() => {
    getPopularMovieList(1).then((results: MovieInfo[]) => {
      setCandidates(results.filter((m) => m.backdrop_path).slice(0, 5));
    });
  }, []);

  useEffect(() => {
    const current = candidates[activeIndex];
    if (!current) return;
    let cancelled = false;
    getMovieDetails(current.id).then((res) => {
      if (!cancelled) setActiveDetails(res.data as IMovieDetails);
    });
    return () => {
      cancelled = true;
    };
  }, [candidates, activeIndex]);

  if (!activeDetails) return null;

  const backdropUrl =
    import.meta.env.VITE_IMAGE_URL + activeDetails.backdrop_path;
  const hours = Math.floor(activeDetails.runtime / 60) || 0;
  const mins = activeDetails.runtime % 60 || 0;

  return (
    <section className="relative w-full h-[70vh] max-h-[560px] overflow-hidden rounded-2xl mb-10">
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={activeDetails.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 max-w-2xl gap-3">
        <p className="uppercase tracking-widest text-sm text-slate-300 font-bebas">
          Featured This Week
        </p>
        <h1 className="text-3xl md:text-5xl font-bold">
          {activeDetails.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="flex items-center gap-1 font-bold">
            <img src={starIcon} width={16} height={16} alt="star icon" />
            {activeDetails.vote_average.toFixed(1)}
          </span>
          <span>{activeDetails.release_date?.slice(0, 4)}</span>
          <span>·</span>
          <span>
            {hours}h {mins}min
          </span>
          <div className="flex flex-wrap gap-2">
            {activeDetails.genres.map((genre) => (
              <span
                key={genre.id}
                className="text-xs px-3 py-1 rounded-full border border-white/25"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
        <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-xl">
          {activeDetails.overview}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {activeDetails.videos.results.length > 0 && (
            <div className="w-32 h-16 rounded-md overflow-hidden">
              <TrailerFacade
                videoKey={activeDetails.videos.results[0]?.key}
                posterUrl={backdropUrl}
              />
            </div>
          )}
          <Link
            to={`${RouthPath.details}/${activeDetails.id}`}
            className="py-2.5 px-6 rounded-md bg-white/10 border border-white/30 backdrop-blur-sm"
          >
            Details
          </Link>
          <FavoriteButton
            movie={{
              id: activeDetails.id,
              title: activeDetails.title,
              poster_path: activeDetails.poster_path,
              vote_average: activeDetails.vote_average,
            }}
            className="w-11 h-11"
          />
        </div>
        <div className="flex gap-2 mt-2">
          {candidates.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Featured ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={`w-6 h-1 rounded-full ${
                index === activeIndex ? "bg-primary" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
```

Replace with:

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import starIcon from "/star.svg";
import { getPopularMovieList, getMovieDetails } from "@/api/movie";
import FavoriteButton from "@/components/FavoriteButton";
import { RouthPath } from "@/routers/router";
import { IMovieDetails, MovieInfo } from "@/utils/module";

const GRAIN_BACKGROUND_IMAGE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>\")";

function Hero() {
  const [candidates, setCandidates] = useState<MovieInfo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDetails, setActiveDetails] = useState<IMovieDetails | null>(
    null
  );
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    getPopularMovieList(1).then((results: MovieInfo[]) => {
      setCandidates(results.filter((m) => m.backdrop_path).slice(0, 5));
    });
  }, []);

  useEffect(() => {
    const current = candidates[activeIndex];
    if (!current) return;
    let cancelled = false;
    getMovieDetails(current.id).then((res) => {
      if (!cancelled) setActiveDetails(res.data as IMovieDetails);
    });
    return () => {
      cancelled = true;
    };
  }, [candidates, activeIndex]);

  useEffect(() => {
    setPlaying(false);
  }, [activeIndex]);

  if (!activeDetails) return null;

  const backdropUrl =
    import.meta.env.VITE_IMAGE_URL + activeDetails.backdrop_path;
  const hours = Math.floor(activeDetails.runtime / 60) || 0;
  const mins = activeDetails.runtime % 60 || 0;
  const trailerKey = activeDetails.videos.results[0]?.key;

  return (
    <section className="relative w-full h-[70vh] max-h-[560px] overflow-hidden rounded-2xl mb-10">
      <div className="absolute inset-0">
        {playing && trailerKey ? (
          <iframe
            src={import.meta.env.VITE_YOUTUBE_URL + trailerKey}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={backdropUrl}
              alt={activeDetails.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
              style={{ backgroundImage: GRAIN_BACKGROUND_IMAGE }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          </>
        )}
      </div>

      {playing && trailerKey && (
        <button
          type="button"
          onClick={() => setPlaying(false)}
          aria-label="Close trailer"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4L10.6 10.6l6.3-6.3z" />
          </svg>
        </button>
      )}

      {!playing && (
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 max-w-2xl gap-3">
          <p className="uppercase tracking-widest text-sm text-slate-300 font-bebas">
            Featured This Week
          </p>
          <h1 className="text-3xl md:text-5xl font-bold">
            {activeDetails.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-1 font-bold">
              <img src={starIcon} width={16} height={16} alt="star icon" />
              {activeDetails.vote_average.toFixed(1)}
            </span>
            <span>{activeDetails.release_date?.slice(0, 4)}</span>
            <span>·</span>
            <span>
              {hours}h {mins}min
            </span>
            <div className="flex flex-wrap gap-2">
              {activeDetails.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs px-3 py-1 rounded-full border border-white/25"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-xl">
            {activeDetails.overview}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {trailerKey && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="flex items-center gap-2 py-2.5 px-6 rounded-md bg-white text-black font-bold hover:bg-slate-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M6 4v16l14-8z" />
                </svg>
                Play Trailer
              </button>
            )}
            <Link
              to={`${RouthPath.details}/${activeDetails.id}`}
              className="py-2.5 px-6 rounded-md bg-white/10 border border-white/30 backdrop-blur-sm"
            >
              Details
            </Link>
            <FavoriteButton
              movie={{
                id: activeDetails.id,
                title: activeDetails.title,
                poster_path: activeDetails.poster_path,
                vote_average: activeDetails.vote_average,
              }}
              className="w-11 h-11"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {candidates.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Featured ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`w-6 h-1 rounded-full ${
                  index === activeIndex ? "bg-primary" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;
```

What changed and why:
- The small 128×64 inline trailer box is gone. "Play Trailer" is now the
  primary CTA button itself (only rendered when the featured movie has a
  trailer), matching the mockup.
- Clicking it sets `playing`, which swaps the whole Hero's backdrop `img`
  for a real YouTube `iframe` filling the same bounds — the mockup's own
  "veil" has no real video to show, so this goes one step further than it
  (a real embed needs a real close affordance, hence the new close
  button — not present in the demo mockup, but necessary here).
- The CTA/meta content hides while playing (`{!playing && (...)}`) so it
  doesn't visually collide with the video.
- Switching the featured movie via the dash indicators (`activeIndex`
  changing) resets `playing` back to `false`, so a new backdrop always
  starts un-played.
- The grain/noise texture overlay is the same SVG-noise technique the
  mockup uses for its `.hero-grain`, added as a plain absolutely
  positioned div — pure decoration, `pointer-events-none`.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Run: `npm run build`
Expected: succeeds.

Manual check: `npm run dev`, open Home. Confirm the Hero shows a subtle
grain texture over the backdrop. Click "Play Trailer" on a featured movie
that has one: the backdrop is replaced by a playing YouTube video filling
the Hero, the title/meta/CTA row disappears, and a close (×) button
appears top-right. Click it: playback stops, the backdrop and full CTA
row return. Switch to a different featured movie via the dash indicators
while a trailer is playing: playback stops and the new movie's backdrop
shows normally (not mid-play). If a featured movie has no trailer, no
"Play Trailer" button renders for it (same conditional pattern already
used elsewhere in this app for trailer availability).

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat: full-hero trailer playback and grain texture in Hero"
```

---

### Task 10: `CastCard` — circular photo treatment

**Files:**
- Modify: `src/components/CastCard.tsx`

**Interfaces:** none — same `{ person: MovieCast }` prop, same default
export. `CastSlide.tsx` (which renders `CastCard` inside a `Slide`) needs
no changes at all.

- [ ] **Step 1: Rewrite the component**

Current `src/components/CastCard.tsx`:

```tsx
import { MovieCast } from "@/utils/module";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import { Link } from "react-router-dom";

function CastCard({ person }: { person: MovieCast }) {
  const personImg = getPersonImage(person);

  return (
    <div className="w-[240px] h-fit rounded-2xl">
      <div className="w-full h-[320px]">
        <Link to={`/person/${person.id}`}>
          <img
            src={personImg}
            alt="person image"
            className="w-full h-full object-cover rounded-t-2xl cursor-pointer"
          />
        </Link>
      </div>
      <div className="h-24 p-2 bg-white text-black  rounded-b-2xl">
        <h4 className="text-lg font-semibold">{person.name}</h4>
        <h5 className="text-sm text-[#666]">{person.character}</h5>
      </div>
    </div>
  );
}

export default CastCard;

/** 獲取演員圖像 */
function getPersonImage(person: MovieCast) {
  if (person.profile_path)
    return import.meta.env.VITE_IMAGE_URL + person.profile_path;

  if (person.gender === 1) {
    return womenImg;
  } else {
    return menImg;
  }
}
```

Replace with:

```tsx
import { MovieCast } from "@/utils/module";
import menImg from "/men.jpg";
import womenImg from "/women.jfif";
import { Link } from "react-router-dom";

function CastCard({ person }: { person: MovieCast }) {
  const personImg = getPersonImage(person);

  return (
    <div className="w-32 h-fit flex flex-col items-center text-center">
      <Link
        to={`/person/${person.id}`}
        className="block w-24 h-24 rounded-full overflow-hidden shadow-lg"
      >
        <img
          src={personImg}
          alt="person image"
          className="w-full h-full object-cover cursor-pointer"
        />
      </Link>
      <h4 className="text-sm font-bold text-white mt-3">{person.name}</h4>
      <h5 className="text-xs text-slate-400">{person.character}</h5>
    </div>
  );
}

export default CastCard;

/** 獲取演員圖像 */
function getPersonImage(person: MovieCast) {
  if (person.profile_path)
    return import.meta.env.VITE_IMAGE_URL + person.profile_path;

  if (person.gender === 1) {
    return womenImg;
  } else {
    return menImg;
  }
}
```

The `/** 獲取演員圖像 */` comment is pre-existing Chinese and untouched —
`CastCard.tsx` was explicitly out of scope for the English-copy switch in
the prior pass and stays that way here; this task only changes the visual
treatment, not the language.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: `npm run dev`, open any movie details page, scroll to the
cast row. Confirm: each cast member now shows as a circular headshot with
name and role as plain centered text below it, no white card panel behind
the text.

- [ ] **Step 3: Commit**

```bash
git add src/components/CastCard.tsx
git commit -m "style: switch CastCard to circular photo treatment"
```

---

### Task 11: `MovieDetails` — backdrop + floating poster layout rebuild

**Files:**
- Modify: `src/pages/MovieDetails.tsx`, `src/index.css`

**Interfaces:**
- Consumes: `FavoriteButton` with `variant="pill"` (Task 5), `TrailerFacade`
  (existing, unchanged, just repositioned in the layout), `CastSlide`
  (existing — automatically picks up Task 10's circular `CastCard` with no
  changes needed here), `getMovieRecommendations` (existing).
- Produces: no new exported names. **Drops** its `HeaderWithBack` import —
  replaced by an inline back button local to this page (see Global
  Constraints: `HeaderWithBack.tsx` itself stays untouched for
  `PersonDetails`).

- [ ] **Step 1: Rewrite the page**

Current `src/pages/MovieDetails.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/layouts/CastSlide";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import FavoriteButton from "@/components/FavoriteButton";
import TrailerFacade from "@/components/TrailerFacade";
import { getMovieRecommendations } from "@/api/movie";
import { MovieInfoRes, IMovieDetails, MovieInfo } from "@/utils/module";
import HeaderWithBack from "@/components/HeaderWithBack";

function MovieDetails() {
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data as IMovieDetails;
  const [recommendations, setRecommendations] = useState<MovieInfo[]>([]);

  useEffect(() => {
    let cancelled = false;
    getMovieRecommendations(info.id).then((results) => {
      if (!cancelled) setRecommendations(results);
    });
    return () => {
      cancelled = true;
    };
  }, [info.id]);

  return (
    <main className="w-full h-full text-white mb-16 px-4 md:px-16">
      <HeaderWithBack />
      <div className="w-full flex flex-col md:flex-row md:h-[70vh]">
        <DetailsLeftSide info={info} />
        <DetailsRightSide info={info} />
      </div>
      <hr className="hr my-10" />
      <CastSlide cast={info.credits.cast} />
      {recommendations.length > 0 && (
        <>
          <hr className="hr my-10" />
          <h3 className="text-4xl ml-6 mb-6">You Might Also Like</h3>
          <Slide>
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Slide>
        </>
      )}
      <hr className="hr my-10" />
    </main>
  );
}

function DetailsLeftSide({ info }: { info: IMovieDetails }) {
  function getRating(rate: number) {
    return rate.toFixed(2);
  }

  function getRuntime() {
    const hours = Math.floor(info.runtime / 60) || 0;
    const mins = info.runtime % 60 || 0;
    return `${hours}h ${mins}min`;
  }

  return (
    <div className="w-full md:w-[40%] flex flex-col px-6 overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-[36px] md:text-[48px] mb-4">{info.title}</h1>
        <FavoriteButton
          movie={{
            id: info.id,
            title: info.title,
            poster_path: info.poster_path,
            vote_average: info.vote_average,
          }}
          className="w-11 h-11 flex-none mt-2"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {info.genres.map((genre) => (
          <span
            key={genre.id}
            className="text-xs px-3 py-1 rounded-full border border-white/20 text-slate-300"
          >
            {genre.name}
          </span>
        ))}
      </div>
      <h2 className="text-lg my-2">
        Release Date:
        <span className="text-slate-400 ml-4">{info.release_date}</span>
      </h2>
      <h4 className="text-md tracking-wider mb-2">{getRuntime()}</h4>
      <h3 className="flex items-center mb-6">
        <img
          width={24}
          height={24}
          src={starIcon}
          className="mr-2"
          alt="star icon"
        />
        {getRating(info.vote_average)} / 10
      </h3>
      <div className="details-scroll overflow-y-scroll">
        <p className="text-xl leading-9">
          {info.overview || "No description available."}
        </p>
      </div>
    </div>
  );
}

function DetailsRightSide({ info }: { info: IMovieDetails }) {
  return (
    <div className="flex-1 flex justify-center min-h-[260px] md:min-h-0 mt-6 md:mt-0">
      {info.videos.results.length ? (
        <TrailerFacade
          videoKey={info.videos.results[0]?.key}
          posterUrl={import.meta.env.VITE_IMAGE_URL + info.backdrop_path}
        />
      ) : (
        <div className="w-[60%]">
          <img
            src={import.meta.env.VITE_IMAGE_URL + info.poster_path}
            alt="movie poster"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
```

Replace with:

```tsx
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/layouts/CastSlide";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import FavoriteButton from "@/components/FavoriteButton";
import TrailerFacade from "@/components/TrailerFacade";
import { getMovieRecommendations } from "@/api/movie";
import { MovieInfoRes, IMovieDetails, MovieInfo } from "@/utils/module";

function MovieDetails() {
  const navigate = useNavigate();
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data as IMovieDetails;
  const [recommendations, setRecommendations] = useState<MovieInfo[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMovieRecommendations(info.id).then((results) => {
      if (!cancelled) setRecommendations(results);
    });
    return () => {
      cancelled = true;
    };
  }, [info.id]);

  function getRating(rate: number) {
    return rate.toFixed(2);
  }

  function getRuntime() {
    const hours = Math.floor(info.runtime / 60) || 0;
    const mins = info.runtime % 60 || 0;
    return `${hours}h ${mins}min`;
  }

  async function handleShare() {
    const shareData = { title: info.title, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  return (
    <main className="w-full h-full text-white mb-16">
      <div className="relative h-[220px] sm:h-[300px] mx-4 md:mx-16 rounded-2xl overflow-hidden">
        <img
          src={import.meta.env.VITE_IMAGE_URL + info.backdrop_path}
          alt={info.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 py-2 pl-2.5 pr-4 rounded-full bg-black/55 backdrop-blur-sm text-white text-sm font-bold"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15 4l-8 8 8 8 1.4-1.4L9.8 12l6.6-6.6z" />
          </svg>
          Back
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-6 px-4 md:px-16">
        <div className="flex-none w-28 md:w-[200px] -mt-16 md:-mt-20 relative z-10">
          <img
            src={import.meta.env.VITE_IMAGE_URL + info.poster_path}
            alt={info.title}
            className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl border-4 border-black"
          />
        </div>

        <div className="flex-1 flex flex-col gap-4 pt-4">
          <h1 className="text-[32px] md:text-[44px] font-black leading-tight">
            {info.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-1 font-bold">
              <img width={16} height={16} src={starIcon} alt="star icon" />
              {getRating(info.vote_average)}
            </span>
            <span>{info.release_date?.slice(0, 4)}</span>
            <span>·</span>
            <span>{getRuntime()}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {info.genres.map((genre) => (
              <span
                key={genre.id}
                className="text-xs px-3 py-1 rounded-full border border-white/20 text-slate-300"
              >
                {genre.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <FavoriteButton
              variant="pill"
              movie={{
                id: info.id,
                title: info.title,
                poster_path: info.poster_path,
                vote_average: info.vote_average,
              }}
            />
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 py-2.5 px-5 rounded-md border border-white/25 text-white hover:border-white/50"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M18 8a3 3 0 1 0-2.8-4H15a3 3 0 1 0 .2 4.6L9.9 11a3 3 0 1 0 0 2l5.3 2.4a3 3 0 1 0 .8-1.8L10.7 11a3 3 0 0 0 0-2l5.3-2.4c.3.2.6.3 1 .4z" />
              </svg>
              {shareCopied ? "Copied!" : "Share"}
            </button>
          </div>
          <p className="text-base leading-7 text-slate-300 max-w-2xl">
            {info.overview || "No description available."}
          </p>
        </div>
      </div>

      {info.videos.results.length > 0 && (
        <div className="px-4 md:px-16 mt-8">
          <div className="h-[220px] sm:h-[320px] rounded-xl overflow-hidden">
            <TrailerFacade
              videoKey={info.videos.results[0]?.key}
              posterUrl={import.meta.env.VITE_IMAGE_URL + info.backdrop_path}
            />
          </div>
        </div>
      )}

      <hr className="hr my-10" />
      <CastSlide cast={info.credits.cast} />
      {recommendations.length > 0 && (
        <>
          <hr className="hr my-10" />
          <h3 className="text-4xl ml-6 mb-6">You Might Also Like</h3>
          <Slide>
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Slide>
        </>
      )}
      <hr className="hr my-10" />
    </main>
  );
}

export default MovieDetails;
```

What changed and why:
- `HeaderWithBack` is gone from this page; the back button is now overlaid
  on the backdrop image itself (pill, translucent/blurred), matching the
  mockup. `HeaderWithBack.tsx` the file is untouched — `PersonDetails.tsx`
  still imports and uses it exactly as before.
- The old `DetailsLeftSide`/`DetailsRightSide` sub-components are gone —
  the page no longer has a left/right split, so there's nothing left to
  usefully split into two components; everything lives directly in
  `MovieDetails`.
- The poster now floats over the backdrop's bottom edge via a negative top
  margin (`-mt-16 md:-mt-20`), sitting beside the info column instead of a
  trailer/poster column across from it.
- The trailer facade moved out of the two-column area entirely into its
  own full-width block below the info, and only renders when a trailer
  exists (same condition as before, just no more poster-only fallback
  branch, since the poster is now always shown up in the floating
  thumbnail regardless of trailer availability).
- Added the Share button (Web Share API with a copy-link fallback) and
  switched the favorite button to `variant="pill"` with a text label,
  matching the mockup's two-button actions row.

- [ ] **Step 2: Remove the now-unused `.details-scroll` CSS rules**

The old fixed-height, internally-scrolling overview column
(`details-scroll overflow-y-scroll`) is gone from Step 1's rewrite — the
overview is now a normal-flow paragraph, so its scrollbar styling in
`src/index.css` has no element left to apply to.

Current `src/index.css`:

```css
.details-scroll::-webkit-scrollbar {
  width: 12px;
}

.details-scroll::-webkit-scrollbar-track {
  background: #141414;
}

.details-scroll::-webkit-scrollbar-thumb {
  background: #666666;
  border-radius: 10px;
}

.details-scroll::-webkit-scrollbar-thumb:hover {
  background: #f0f0f0;
}

```

Delete this whole block (all four rules, including the blank line
directly after the last one).

- [ ] **Step 3: Verify**

Run: `grep -rn "details-scroll\|HeaderWithBack" src/pages/MovieDetails.tsx`
Expected: no output (confirms both are fully gone from this file).

Run: `grep -rn "HeaderWithBack" src`
Expected: exactly one hit, in `src/pages/PersonDetails.tsx` — confirms the
shared component itself is untouched and still used there.

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Run: `npm run build`
Expected: succeeds.

Manual check: `npm run dev`, open a movie details page. Confirm: a
full-width backdrop band at the top with a translucent "Back" pill button
overlaid on it (click it — navigates back, same as before); the poster
thumbnail floats up overlapping the backdrop's bottom edge, next to the
title/genres/meta/actions/overview; the actions row shows both a
"Add to Favorites" pill (click it — toggles to "Favorited" and fills red,
same as the icon version elsewhere) and a "Share" button (click it — if
your browser/OS supports the share sheet, it opens; otherwise the button
briefly shows "Copied!" and the movie's URL is now on your clipboard,
paste it somewhere to confirm); below that, the trailer (if the movie has
one) spans the full width as its own band, not beside anything; cast row
below that now shows the new circular photos from Task 10; recommendations
row below that. At ~390px width: poster/info stack correctly, nothing
overflows horizontally.

- [ ] **Step 4: Commit**

```bash
git add src/pages/MovieDetails.tsx src/index.css
git commit -m "feat: rebuild Movie Details around backdrop + floating poster layout, add Share button"
```

---

### Task 12: `Favorite` — empty-state visual redesign

**Files:**
- Modify: `src/pages/Favorite.tsx`

**Interfaces:** none — pure JSX/className changes around the existing
empty state, no prop or behavior changes.

- [ ] **Step 1: Wrap the empty state in a dashed card with an icon**

Current `src/pages/Favorite.tsx`:

```tsx
      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 py-20 text-slate-400">
          <h3 className="text-white text-xl font-bold">
            You haven't favorited any movies yet
          </h3>
          <p className="max-w-sm">
            Tap the heart icon on any poster to save it here.
          </p>
          <Link
            to={RouthPath.home}
            className="mt-2 py-3 px-7 rounded-md bg-primary text-white"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
```

Change to:

```tsx
      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 py-16 px-8 mx-auto max-w-md border border-dashed border-white/20 rounded-2xl text-slate-400">
          <svg
            viewBox="0 0 24 24"
            width="40"
            height="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.5 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.5-3c3.5.5 5 4 3.5 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
          <h3 className="text-white text-xl font-bold">
            You haven't favorited any movies yet
          </h3>
          <p className="max-w-sm">
            Tap the heart icon on any poster to save it here.
          </p>
          <Link
            to={RouthPath.home}
            className="mt-2 py-3 px-7 rounded-md bg-primary text-white"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
```

No other lines in this file change — the populated-grid branch, the
heading, the live count, and every piece of copy stay exactly as they are.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: with `localStorage` empty (devtools → Application → Local
Storage → delete `moviehub_favorites_v1` → refresh), visit `/favorite` —
the empty state now shows inside a dashed-border card with a heart icon
above the heading, "Browse Movies" link still works. Favorite a movie and
revisit — the populated grid (unchanged) still shows correctly, no leftover
dashed card.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Favorite.tsx
git commit -m "style: redesign Favorites empty state with dashed card and icon"
```

---

## Self-Review Notes

- **Spec coverage:** every numbered section of the spec
  (`docs/superpowers/specs/2026-09-22-moviehub-mockup-fidelity-design.md`)
  maps to a task here — §3.1 → Tasks 7–8, §3.2 → Task 6, §3.3 → Tasks 3–4,
  §3.4 → Task 2, §3.5 → Task 9, §3.6 → Task 11, §3.7 → Task 10, §3.8 →
  Task 12. The spec's §2 non-goals (search page kept as-is, no container
  queries, `MainWrapper` pagination intentionally dropped) require no task
  of their own — they're the absence of a task, which Task 7's own notes
  call out explicitly so a future reader doesn't mistake the omission for
  an oversight.
- **Type/interface consistency:** `FavoriteButton`'s new `variant` prop
  (Task 5) is `"icon" | "pill"`, and Task 11 is the only call site that
  passes `variant="pill"` — every other call site (`MovieCard` Task 4,
  `Hero` Task 9) omits it and gets the unchanged default. `HomeRows`'
  `RowConfig.fetcher` type (`() => Promise<MovieInfo[]>`) matches what all
  five reused API functions actually return (`Promise<MovieInfo[]>` in
  every case, confirmed against their current implementations in
  `src/api/movie.ts`). `CURATED_GENRES`'s `anchor` values (`row-action`,
  `row-comedy`, `row-new`) match `HomeRows`' actual anchor ids exactly —
  Task 1 is written knowing Task 7's anchor ids in advance since it's the
  same plan.
- **Known transient broken states, both flagged inline where they occur:**
  Task 7 alone leaves `src/pages/Home.tsx` failing to compile (it still
  imports the three just-deleted files) until Task 8 lands immediately
  after — same pattern the prior plan hit between its own Task 8 and
  Task 9, called out the same way here rather than silently glossed over.
- **Ordering rationale:** Tasks 1–2 (shared genre constant, Header) and
  Tasks 3–4 (Slide group, MovieCard hover) are two independent pairs that
  could each be done in either internal order without breaking anything,
  but are sequenced as written because each pair's second task directly
  depends on its first. Task 5 (FavoriteButton variant) is deliberately
  placed before Task 11 (its only real consumer) but after Task 4, since
  Task 4 already touches `FavoriteButton`'s call site inside `MovieCard`
  and there's no reason to interleave the two files. Tasks 6–8 (chip row,
  home rows, Home mount) are strictly ordered since Task 8 mounts both
  Task 6's and Task 7's output. Tasks 9–12 (Hero, CastCard, MovieDetails,
  Favorite) are independent of each other and of everything after Task 5,
  and could be reordered or parallelized by a subagent-driven executor
  without issue — they're sequenced here only for narrative flow.
