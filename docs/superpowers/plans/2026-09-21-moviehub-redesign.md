# MovieHub Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved "MovieHub Reel Cut" redesign — drop Sign In, add a
real login-free favorites watchlist, a home hero banner, curated genre
rows, movie-details recommendations, and responsive layout — plus the small
bundle of pre-existing bug fixes agreed alongside it.

**Architecture:** No new state library or data-fetching library. Favorites
is a new Redux Toolkit slice persisted to `localStorage` via a store
subscriber. New screens reuse the existing `Slide`/`MovieCard`/`useSlide`
row-scrolling pattern and the existing `instance`/`hideLoadingInstance`
axios pattern for any new API call. Responsive layout uses Tailwind's
standard viewport breakpoints (`sm`/`md`), not the container-query trick the
throwaway mockup used (that trick existed only to show two device widths on
one static page).

**Tech Stack:** React 18, TypeScript, Vite 8, Tailwind CSS 3, Redux Toolkit
2, React Router (`react-router-dom`) 7, axios — all already in the project;
no new dependencies are added by this plan.

**Spec:** `docs/superpowers/specs/2026-09-21-moviehub-redesign-design.md`

## Global Constraints

- No new npm dependencies. Every task below uses packages already in
  `package.json`.
- No automated test framework — this repo has none today, and adding one
  is explicitly out of scope for this change (spec §2). Each task's "test
  cycle" is: `npx tsc --noEmit` clean, `npm run lint` clean (`eslint . --ext
  ts,tsx --report-unused-disable-directives --max-warnings 0`), and a
  concrete manual QA check in the browser (steps given per task). Do not
  add Jest/Vitest/Testing Library as a side effect of any task.
- All new and touched user-facing copy is **English** (buttons, headings,
  labels, empty states, error pages, curated genre names). This applies to
  every file this plan creates or modifies, including `src/layouts/
  MainWrapper.tsx`'s existing tab labels and `src/layouts/UpcomingSlide.tsx`'s
  row heading (both added to this plan's scope for copy consistency — see
  Task 13). `src/api/person.ts` and the Person Details page are **not**
  touched by this plan and keep their existing `language=zh-TW` requests /
  Chinese copy — explicitly out of scope for this pass (spec §2).
- All new and existing TMDB **movie** requests in `src/api/movie.ts` use
  `language=en-US` (Task 4 normalizes this across the whole file, not just
  the two new functions it adds). `src/api/person.ts` keeps `language=zh-TW`
  — out of scope, per above.
- Follow the existing `instance` (shows the global loading spinner) vs.
  `hideLoadingInstance` (silent, used for page > 1 / background fetches)
  convention from `src/api/instance.ts` for any new list-fetching function.
- Dark theme tokens are already defined in `tailwind.config.js`: `black:
  "#141414"`, `white: "#f0f0f0"`, `primary: "#F13127"`. Reuse these, don't
  invent new color literals.
- `path` alias `@` → `src`, and `/` → `public` (see `vite.config.ts`) — keep
  using these for all imports, matching every existing file.
- Every new/edited component keeps the project's existing style: function
  components, no class components, no new UI library.

---

## File Structure

**New files:**
- `src/reducer/favoritesSlice.ts` — Redux Toolkit slice for the favorites
  watchlist, backed by `localStorage`.
- `src/components/FavoriteButton.tsx` — reusable heart-icon toggle button,
  used by `MovieCard`, `Hero`, and `MovieDetails`.
- `src/components/TrailerFacade.tsx` — click-to-load trailer embed (replaces
  the always-mounted YouTube iframe).
- `src/components/ErrorBoundaryPage.tsx` — router `errorElement`.
- `src/pages/NotFound.tsx` — catch-all 404 route element.
- `src/components/Hero.tsx` — home page hero banner.
- `src/layouts/GenreRows.tsx` — the two curated genre rows (Action/Comedy)
  shown on Home.

**Deleted files:**
- `src/layouts/SearchBar.tsx` — dead code, unused anywhere, imports a
  nonexistent `/search.svg`.
- `src/pages/Login.tsx` — Sign In is being removed entirely.

**Modified files:** `src/utils/module.ts`, `src/api/movie.ts`,
`src/store/index.ts`, `src/routers/router.tsx`, `src/layouts/Header.tsx`,
`src/layouts/MainLayout.tsx`, `src/layouts/MainWrapper.tsx`,
`src/pages/Home.tsx`,
`src/pages/MovieDetails.tsx`, `src/pages/PersonDetails.tsx`,
`src/pages/Favorite.tsx`, `src/components/MovieCard.tsx`,
`src/components/PersonIfno.tsx`, `src/hooks/useSlide.tsx`,
`tailwind.config.js`, `src/index.css`, `src/layouts/UpcomingSlide.tsx`.

---

### Task 1: Housekeeping cleanup

Small, independent fixes bundled into one task per the spec (§7).

**Files:**
- Delete: `src/layouts/SearchBar.tsx`
- Modify: `src/hooks/useSlide.tsx`, `src/pages/PersonDetails.tsx`,
  `src/layouts/MainLayout.tsx`

**Interfaces:** none — this task changes no exported names any later task
depends on.

- [ ] **Step 1: Delete the dead `SearchBar` file**

```bash
git rm src/layouts/SearchBar.tsx
```

- [ ] **Step 2: Confirm nothing imports it**

Run: `grep -rn "SearchBar" src`
Expected: no output (it was already unused before deletion — this just
proves it).

- [ ] **Step 3: Remove the leftover `console.log` in `useSlide.tsx`**

In `src/hooks/useSlide.tsx`, inside the `useEffect` that adds the scroll
listener, delete this line:

```ts
    console.log("slideRef change");
```

- [ ] **Step 4: Remove the leftover `console.log` in `PersonDetails.tsx`**

In `src/pages/PersonDetails.tsx`, delete this line from the `PersonDetails`
function body:

```ts
  console.log(personInfo);
```

- [ ] **Step 5: Fix the loading-timer bug in `MainLayout.tsx`**

The current code:

```tsx
  useEffect(() => {
    let timer = 0;
    if (requestCount > 0) {
      clearTimeout(timer);
      if (!timer) {
        dispatch({ type: "ONLOAD" });
      }
    } else {
      timer = setTimeout(() => {
        dispatch({ type: "OUTLOAD" });
      }, 0);
    }
  }, [dispatch, requestCount]);
```

`timer` is redeclared as a local `let` on every run of the effect, so
`clearTimeout(timer)` never cancels a timeout scheduled by a *previous* run
— it's always clearing a variable that was just initialized to `0`. Replace
with a `useRef` so the id survives across renders:

```tsx
  const outloadTimer = useRef(0);

  useEffect(() => {
    if (requestCount > 0) {
      window.clearTimeout(outloadTimer.current);
      dispatch({ type: "ONLOAD" });
    } else {
      outloadTimer.current = window.setTimeout(() => {
        dispatch({ type: "OUTLOAD" });
      }, 0);
    }
    return () => window.clearTimeout(outloadTimer.current);
  }, [dispatch, requestCount]);
```

Add `useRef` to the existing `import { useEffect } from "react";` line so it
reads `import { useEffect, useRef } from "react";`.

Note: `index.html` is **not** touched by this task. It already has
`<html lang="en">` and `<title>Movie_Hub</title>`, both already correct for
this redesign's English UI (see Global Constraints above) — an earlier draft
of this plan had a step here changing `lang` to `zh-TW`, which no longer
applies and has been removed.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: both clean, no output/errors.

Manual check: `npm run dev`, open the app, click between Home/Favorite/back
a few times — no console errors, loading spinner still appears/disappears
around navigation (same as before, just no longer relying on dead code).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove dead code and fix loading-timer bug"
```

---

### Task 2: Tailwind & font config

**Files:**
- Modify: `tailwind.config.js`, `src/index.css`

**Interfaces:**
- Produces: Tailwind utility class `font-bebas` (usable by later tasks —
  `Hero`, `MovieCard`'s rank numeral).

- [ ] **Step 1: Add the `bebas` font family**

In `tailwind.config.js`, inside `theme.extend.fontFamily`, add a new entry
alongside the existing ones:

```js
        bebas: ["Bebas Neue", "sans-serif"],
```

(Full block should read: `playFair`, `notoSans`, `notoSerif`, `freeman`,
`roboto`, `bebas`.)

- [ ] **Step 2: Update the Google Fonts import**

In `src/index.css`, the current first line is:

```css
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&family=Noto+Serif+TC&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900&family=Freeman&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");
```

`Noto Serif TC` and `Playfair Display` have zero usages anywhere in `src`
(verified with `grep -rn "font-notoSerif\|font-playFair" src` — no
matches). Replace the line with one that drops both and adds `Bebas Neue`:

```css
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900&family=Freeman&family=Bebas+Neue&display=swap");
```

- [ ] **Step 3: Verify nothing referenced the removed fonts**

Run: `grep -rn "font-notoSerif\|font-playFair" src`
Expected: no output.

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "style: add Bebas Neue font, drop unused font families"
```

---

### Task 3: Data model updates

**Files:**
- Modify: `src/utils/module.ts`

**Interfaces:**
- Produces: `MovieInfo.backdrop_path: string`, `MovieInfo.genre_ids?:
  number[]`, `IGenre { id: number; name: string }`, `IMovieDetails.genres:
  IGenre[]`, `FavoriteMovie { id: string; title: string; poster_path:
  string; vote_average: number }`. All later tasks that touch movie data
  import these from `@/utils/module`.

- [ ] **Step 1: Extend `MovieInfo` and add `IGenre`**

Change:

```ts
/** 電影的資料 */
export interface MovieInfo {
  id: string;
  poster_path: string;
  overview: string;
  title: string;
  release_date: string;
  vote_average: number;
  runtime: number;
}
```

to:

```ts
/** Movie data */
export interface MovieInfo {
  id: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  title: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genre_ids?: number[];
}

/** Genre */
export interface IGenre {
  id: number;
  name: string;
}
```

- [ ] **Step 2: Add `genres` to `IMovieDetails`**

Change:

```ts
export interface IMovieDetails extends MovieInfo {
  videos: MovieVideos;
  credits: MovieCredits;
}
```

to:

```ts
export interface IMovieDetails extends MovieInfo {
  videos: MovieVideos;
  credits: MovieCredits;
  genres: IGenre[];
}
```

- [ ] **Step 3: Add `FavoriteMovie`**

Add this new interface anywhere below `MovieInfo` in the same file:

```ts
/** Movie summary stored in the favorites list — renders without an extra API call */
export interface FavoriteMovie {
  id: string;
  title: string;
  poster_path: string;
  vote_average: number;
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: this will now show errors in files that construct a `MovieInfo`
object without `backdrop_path` (there shouldn't be any — the app only ever
*consumes* `MovieInfo` from API responses, never constructs one by hand) or
in places type-asserting an incomplete object. If you see errors, they're
expected to surface in later tasks' files, not this one — `module.ts` has
no other file's code in it, so `tsc` should stay clean for this task in
isolation as long as no other file currently constructs a literal
`MovieInfo`. Confirm with: `grep -rn "MovieInfo = {" src` (expect no
matches) and `grep -rn ": MovieInfo\[\] = \[" src` (expect no matches).

- [ ] **Step 5: Commit**

```bash
git add src/utils/module.ts
git commit -m "feat: add backdrop_path, genres, and FavoriteMovie types"
```

---

### Task 4: API layer additions

**Files:**
- Modify: `src/api/movie.ts`

**Interfaces:**
- Consumes: `instance`, `hideLoadingInstance` from `./instance` (existing).
- Produces: `getMoviesByGenre(genreId: number, page?: number):
  Promise<MovieInfo[]>`, `getMovieRecommendations(id: string, page?:
  number): Promise<MovieInfo[]>`. Both used by later tasks (`GenreRows`,
  `MovieDetails`).

This task also normalizes the **whole file** to `language=en-US` and English
JSDoc comments — not just the two new functions — since `src/api/movie.ts`
is already fully in scope here and leaving the four existing functions on
`zh-TW` would mean movie data came back in a mix of English and Chinese
depending which call fetched it (Global Constraints, above).

- [ ] **Step 1: Switch the four existing functions to `language=en-US` and
      English comments**

Current `src/api/movie.ts`:

```ts
import instance, { hideLoadingInstance } from "./instance";

/** 獲取現正熱映中的電影 */
export async function getNowPlayingMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/now_playing?language=zh-TW&page=${page}`
  );
  return res.data.results;
}

/** 獲取現正熱映中的電影 */
export async function getPopularMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/popular?language=zh-TW&page=${page}`
  );
  return res.data.results;
}

/** 獲取最高評價電影 */
export async function getTopMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/top_rated?language=zh-TW&page=${page}`
  );
  return res.data.results;
}

/** 獲取即將上映電影 */
export async function getUpcomingMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/upcoming?language=zh-TW&page=${page}`
  );
  return res.data.results;
}

/** 獲取電影詳情 */
export async function getMovieDetails(id: string) {
  const res = await instance.get(
    `/movie/${id}?append_to_response=videos,reviews,credits&language=zh-TW`
  );
  return res;
}

/** 搜尋電影 */
export async function searchMovies(searchText: string, page = 1) {
  const res = await instance.get(
    `/search/movie?query=${searchText}&include_adult=false&language=zh-TW&page=${page}`
  );
  return res;
}
```

Replace with:

```ts
import instance, { hideLoadingInstance } from "./instance";

/** Get now-playing movies */
export async function getNowPlayingMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/now_playing?language=en-US&page=${page}`
  );
  return res.data.results;
}

/** Get popular movies */
export async function getPopularMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/popular?language=en-US&page=${page}`
  );
  return res.data.results;
}

/** Get top-rated movies */
export async function getTopMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/top_rated?language=en-US&page=${page}`
  );
  return res.data.results;
}

/** Get upcoming movies */
export async function getUpcomingMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/upcoming?language=en-US&page=${page}`
  );
  return res.data.results;
}

/** Get movie details */
export async function getMovieDetails(id: string) {
  const res = await instance.get(
    `/movie/${id}?append_to_response=videos,reviews,credits&language=en-US`
  );
  return res;
}

/** Search movies */
export async function searchMovies(searchText: string, page = 1) {
  const res = await instance.get(
    `/search/movie?query=${searchText}&include_adult=false&language=en-US&page=${page}`
  );
  return res;
}
```

(Note: `getNowPlayingMovieList` and `getPopularMovieList` shared the exact
same comment in the original source — a pre-existing copy-paste artifact.
Each now gets its own accurate comment.)

- [ ] **Step 2: Add `getMoviesByGenre`**

Add to `src/api/movie.ts`, following the exact pattern of the existing
`getPopularMovieList`:

```ts
/** Get movies by genre */
export async function getMoviesByGenre(genreId: number, page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/discover/movie?with_genres=${genreId}&language=en-US&page=${page}`
  );
  return res.data.results;
}
```

- [ ] **Step 3: Add `getMovieRecommendations`**

```ts
/** Get related movie recommendations (falls back to similar when recommendations is empty) */
export async function getMovieRecommendations(id: string, page = 1) {
  const res = await instance.get(
    `/movie/${id}/recommendations?language=en-US&page=${page}`
  );
  if (res.data.results.length) return res.data.results;

  const fallback = await instance.get(
    `/movie/${id}/similar?language=en-US&page=${page}`
  );
  return fallback.data.results;
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Run: `grep -n "language=zh-TW" src/api/movie.ts`
Expected: no output (confirms every call in this file now uses `en-US`).

Manual check: temporarily add `console.log(await getMoviesByGenre(28))` in
a component that's already mounted (e.g. paste it inside `Home.tsx`'s
component body wrapped in a `useEffect`), run `npm run dev`, confirm the
browser console prints an array of movie objects with English titles/
overviews, then remove the temp code before committing.

- [ ] **Step 5: Commit**

```bash
git add src/api/movie.ts
git commit -m "feat: add getMoviesByGenre and getMovieRecommendations, switch movie API calls to en-US"
```

---

### Task 5: Favorites Redux slice

**Files:**
- Create: `src/reducer/favoritesSlice.ts`
- Modify: `src/store/index.ts`

**Interfaces:**
- Consumes: `FavoriteMovie` from `@/utils/module` (Task 3).
- Produces: default export `favoritesReducer`, named export
  `toggleFavorite(movie: FavoriteMovie)` action creator. State shape at
  `state.favorites.items: FavoriteMovie[]`. Later tasks (`FavoriteButton`,
  `Favorite` page, `Header`) read `state.favorites.items` and dispatch
  `toggleFavorite`.

- [ ] **Step 1: Create the slice**

Create `src/reducer/favoritesSlice.ts`:

```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FavoriteMovie } from "@/utils/module";

const STORAGE_KEY = "moviehub_favorites_v1";

export interface FavoritesState {
  items: FavoriteMovie[];
}

function loadInitialState(): FavoritesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { items: JSON.parse(raw) as FavoriteMovie[] };
  } catch {
    // corrupt or inaccessible localStorage — fall back to empty
  }
  return { items: [] };
}

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: loadInitialState(),
  reducers: {
    toggleFavorite(state, action: PayloadAction<FavoriteMovie>) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
export const FAVORITES_STORAGE_KEY = STORAGE_KEY;
export default favoritesSlice.reducer;
```

- [ ] **Step 2: Wire the reducer + persistence into the store**

Current `src/store/index.ts`:

```ts
import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "@/reducer";

export const store = configureStore({
  reducer: {
    main: mainReducer,
  },
});

export default store;
```

Replace with:

```ts
import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "@/reducer";
import favoritesReducer, {
  FAVORITES_STORAGE_KEY,
} from "@/reducer/favoritesSlice";

export const store = configureStore({
  reducer: {
    main: mainReducer,
    favorites: favoritesReducer,
  },
});

store.subscribe(() => {
  localStorage.setItem(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(store.getState().favorites.items)
  );
});

export default store;
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: `npm run dev`, open the browser devtools console, run:

```js
window.__store_test = true;
```

then in the same console (React DevTools not required — this just proves
the store boots without throwing): reload the page, confirm no console
errors on load. Open Application/Storage tab, confirm no
`moviehub_favorites_v1` key exists yet (expected — nothing dispatches
`toggleFavorite` until Task 6).

- [ ] **Step 4: Commit**

```bash
git add src/reducer/favoritesSlice.ts src/store/index.ts
git commit -m "feat: add favorites Redux slice with localStorage persistence"
```

---

### Task 6: `FavoriteButton` component

**Files:**
- Create: `src/components/FavoriteButton.tsx`

**Interfaces:**
- Consumes: `FavoriteMovie` (Task 3), `toggleFavorite` action + `favorites`
  slice state (Task 5).
- Produces: default export `FavoriteButton`, props `{ movie: FavoriteMovie;
  className?: string }`. Used by `MovieCard` (Task 7), `Hero` (Task 12),
  `MovieDetails` (Task 11).

- [ ] **Step 1: Create the component**

Create `src/components/FavoriteButton.tsx`:

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

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean (the component isn't mounted anywhere yet, so no visual
check possible yet — that happens in Task 7).

- [ ] **Step 3: Commit**

```bash
git add src/components/FavoriteButton.tsx
git commit -m "feat: add reusable FavoriteButton component"
```

---

### Task 7: Extend `MovieCard`

**Files:**
- Modify: `src/components/MovieCard.tsx`

**Interfaces:**
- Consumes: `FavoriteButton` (Task 6), `MovieInfo` (existing, extended in
  Task 3).
- Produces: `MainMovieCard` (default export, unchanged name) now accepts an
  optional `rank?: number` prop. Later tasks (`GenreRows`, `Hero`'s "Top
  10"-style usages if any, `Favorite` page) pass this prop where a rank
  numeral is wanted.

- [ ] **Step 1: Add the heart button and optional rank numeral**

Current `src/components/MovieCard.tsx`:

```tsx
import { MovieInfo } from "@/utils/module";
import { Link } from "react-router-dom";

const MainMovieCard = ({ movie }: { movie: MovieInfo }) => {
  return (
    <div key={movie.id} className="w-60 h-[350px] relative main-wrapper">
      <Link to={`/movieDetails/${movie.id}`}>
        <img
          width={"100%"}
          height={"100%"}
          src={import.meta.env.VITE_IMAGE_URL + movie.poster_path}
          className={`w-full h-full object-cover rounded-lg cursor-pointer shadow-xl shadow-gray-900 transition-all hover:scale-105 not:hover:scale-90 main-movie-card`}
          alt="movie image"
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

interface MainMovieCardProps {
  movie: MovieInfo;
  rank?: number;
}

const MainMovieCard = ({ movie, rank }: MainMovieCardProps) => {
  return (
    <div
      key={movie.id}
      className={`relative main-wrapper ${rank ? "pl-6" : ""} w-60 h-[350px]`}
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

Note: the invalid `not:hover:scale-90` Tailwind class (not a real variant —
did nothing) is dropped as part of this same edit, per spec §6.4.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: `npm run dev`, open Home — every poster card in the existing
rows now shows a heart icon in its top-right corner (row labels are still
Chinese at this point in the plan — Task 13 switches them to English, this
task only touches `MovieCard`). Click one: it should fill red and NOT navigate to the
movie details page (the `stopPropagation`/`preventDefault` in
`FavoriteButton` blocks the parent `Link`). Open devtools → Application →
Local Storage: confirm a `moviehub_favorites_v1` key now exists with that
movie's data. Click the same heart again: item disappears from the stored
array.

- [ ] **Step 3: Commit**

```bash
git add src/components/MovieCard.tsx
git commit -m "feat: add favorite button and optional rank numeral to MovieCard"
```

---

### Task 8: Router error handling + remove Login route

**Files:**
- Create: `src/components/ErrorBoundaryPage.tsx`
- Create: `src/pages/NotFound.tsx`
- Delete: `src/pages/Login.tsx`
- Modify: `src/routers/router.tsx`

**Interfaces:**
- Produces: `ErrorBoundaryPage` (default export, no props — reads
  `useRouteError()` itself), `NotFound` (default export, no props). Both
  wired into `router.tsx` only; no other task imports them directly.
- `RouthPath` loses its `login` key — grep confirms nothing else references
  it after Task 9.

- [ ] **Step 1: Create `ErrorBoundaryPage`**

Create `src/components/ErrorBoundaryPage.tsx`:

```tsx
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { RouthPath } from "@/routers/router";

export default function ErrorBoundaryPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";

  return (
    <section className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
      <h1 className="text-4xl font-bold">Oops, something went wrong</h1>
      <p className="text-slate-400">{message}</p>
      <Link
        to={RouthPath.home}
        className="mt-4 py-3 px-7 rounded-md bg-primary text-white"
      >
        Back to Home
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Create `NotFound`**

Create `src/pages/NotFound.tsx`:

```tsx
import { Link } from "react-router-dom";
import { RouthPath } from "@/routers/router";

function NotFound() {
  return (
    <section className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-slate-400">Page not found</p>
      <Link
        to={RouthPath.home}
        className="mt-4 py-3 px-7 rounded-md bg-primary text-white"
      >
        Back to Home
      </Link>
    </section>
  );
}

export default NotFound;
```

- [ ] **Step 3: Delete `Login.tsx`**

```bash
git rm src/pages/Login.tsx
```

- [ ] **Step 4: Update `router.tsx`**

Current file:

```tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import { getMovieDetails } from "@/api/movie";
import MainLayout from "@/layouts/MainLayout";
import MovieDetails from "@/pages/MovieDetails";
import Search from "@/pages/Search";
import PersonDetails from "@/pages/PersonDetails";
import Favorite from "@/pages/Favorite";
import { getPersonDetails } from "@/api/person";

export const RouthPath = {
  home: "/",
  favorite: "/favorite",
  login: "/login",
  search: "/search",
  details: "/movieDetails",
  person: "/person",
};

const router = createBrowserRouter([
  {
    path: RouthPath.home,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: RouthPath.favorite,
        element: <Favorite />,
      },
      {
        path: RouthPath.search,
        element: <Search />,
      },
      {
        path: RouthPath.details + "/:id",
        loader: async ({ params }) => {
          return await getMovieDetails(params.id as string);
        },
        element: <MovieDetails />,
      },
      {
        path: RouthPath.person + "/:id",
        loader: async ({ params }) => {
          return await getPersonDetails(Number(params.id));
        },
        element: <PersonDetails />,
      },
    ],
  },
  {
    path: RouthPath.login,
    element: <Login />,
  },
]);

export default router;
```

Replace with:

```tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/Home";
import { getMovieDetails } from "@/api/movie";
import MainLayout from "@/layouts/MainLayout";
import MovieDetails from "@/pages/MovieDetails";
import Search from "@/pages/Search";
import PersonDetails from "@/pages/PersonDetails";
import Favorite from "@/pages/Favorite";
import NotFound from "@/pages/NotFound";
import ErrorBoundaryPage from "@/components/ErrorBoundaryPage";
import { getPersonDetails } from "@/api/person";

export const RouthPath = {
  home: "/",
  favorite: "/favorite",
  search: "/search",
  details: "/movieDetails",
  person: "/person",
};

const router = createBrowserRouter([
  {
    path: RouthPath.home,
    element: <MainLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: RouthPath.favorite,
        element: <Favorite />,
      },
      {
        path: RouthPath.search,
        element: <Search />,
      },
      {
        path: RouthPath.details + "/:id",
        loader: async ({ params }) => {
          return await getMovieDetails(params.id as string);
        },
        element: <MovieDetails />,
      },
      {
        path: RouthPath.person + "/:id",
        loader: async ({ params }) => {
          return await getPersonDetails(Number(params.id));
        },
        element: <PersonDetails />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
```

Note `errorElement` is set on the parent `MainLayout` route rather than
each child individually — a loader failure in `MovieDetails`/`PersonDetails`
still bubbles up to it, and it renders in place of the `<Outlet />` while
keeping `Header`/`Footer` mounted.

- [ ] **Step 5: Verify**

Run: `grep -rn "RouthPath.login\|pages/Login" src`
Expected: no output.

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: `npm run dev`, visit `http://localhost:5173/movieDetails/0`
(an id that doesn't exist) — should render the "Oops, something went wrong"
page with a working "Back to Home" link, not a blank white screen. Visit
`http://localhost:5173/nonsense-path` — should render the "404" page.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add router error boundary and 404 page, remove Login route"
```

---

### Task 9: Header rewrite

**Files:**
- Modify: `src/layouts/Header.tsx`

**Interfaces:**
- Consumes: `favorites` slice state (Task 5), `RouthPath` (Task 8, no
  longer has `login`).
- Produces: no exported names other than the existing default export
  `Header`. Depends on Home page anchor ids `row-action`, `row-comedy`,
  `row-tabs` existing (created in Task 13) for genre-link scrolling to
  work end-to-end, but this task ships correctly on its own — the links
  work as soon as Task 13 lands; until then they navigate to `/` with a
  hash that simply doesn't match anything yet (harmless).

- [ ] **Step 1: Rewrite the component**

Current `src/layouts/Header.tsx`:

```tsx
import { useNavigate, useLocation } from "react-router-dom";
import { RouthPath } from "@/routers/router";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BaseButton from "@/components/BaseButton";
import SearchIcon from "@/components/SearchIcon";
import Logo from "@/components/Logo";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<"home" | "favorite">("home");

  function handleGoHome() {
    navigate(RouthPath.home);
  }

  function handleSearch() {
    navigate(RouthPath.search);
  }

  useEffect(() => {
    if (location.pathname.includes("favorite")) {
      setCurrentPage("favorite");
      return;
    }
    setCurrentPage("home");
  }, [location]);

  return (
    <header className="w-auto h-20 px-6 flex justify-between items-center bg-black text-white">
      <div
        className="flex gap-4 items-center cursor-pointer"
        onClick={handleGoHome}
      >
        <Logo />
      </div>
      <div className="flex">
        <ul className="flex items-center gap-32">
          <li
            className={`text-2xl font-bold cursor-pointer font-Roboto ${
              currentPage === "home" && "text-primary"
            }`}
          >
            <Link
              to={RouthPath.home}
              className="relative after:absolute after:w-full after:h-1 after:bg-primary after:bottom-[-5px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-in-out hover:text-primary"
            >
              Home
            </Link>
          </li>
          <li
            className={`text-2xl font-bold cursor-pointer font-Roboto ${
              currentPage === "favorite" && "text-primary"
            }`}
          >
            <Link
              to={RouthPath.favorite}
              className="relative after:absolute after:w-full after:h-1 after:bg-primary after:bottom-[-5px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-in-out hover:text-primary"
            >
              Favorite
            </Link>
          </li>
          <li onClick={handleSearch}>
            <SearchIcon className="w-8 h-8 fill-white cursor-pointer" />
          </li>
          <li>
            <BaseButton>
              <Link
                to={RouthPath.login}
                className="text-xl font-roboto font-semibold"
              >
                Sign In
              </Link>
            </BaseButton>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
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

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<"home" | "favorite">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const favoriteCount = useSelector(
    (state: FavoritesSelectorType) => state.favorites.items.length
  );

  function handleGoHome() {
    navigate(RouthPath.home);
    setMobileMenuOpen(false);
  }

  function handleSearch() {
    navigate(RouthPath.search);
    setMobileMenuOpen(false);
  }

  function handleGenreClick(anchor: string) {
    navigate(`${RouthPath.home}#${anchor}`);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (location.pathname.includes("favorite")) {
      setCurrentPage("favorite");
      return;
    }
    setCurrentPage("home");
  }, [location]);

  return (
    <header className="w-auto px-4 md:px-6 h-20 flex justify-between items-center bg-black text-white relative">
      <div
        className="flex gap-4 items-center cursor-pointer"
        onClick={handleGoHome}
      >
        <Logo />
      </div>

      <ul className="hidden md:flex items-center gap-10 lg:gap-16">
        <li
          className={`text-xl font-bold cursor-pointer font-roboto ${
            currentPage === "home" && "text-primary"
          }`}
        >
          <Link
            to={RouthPath.home}
            className="relative after:absolute after:w-full after:h-1 after:bg-primary after:bottom-[-5px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500 after:ease-in-out hover:text-primary"
          >
            Home
          </Link>
        </li>
        <li className="group relative">
          <button
            type="button"
            className="text-xl font-bold font-roboto flex items-center gap-1"
          >
            Genres
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity">
            <div className="bg-black border border-white/10 rounded-lg p-2 grid grid-cols-2 gap-1 w-64">
              {CURATED_GENRES.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleGenreClick(genre.anchor)}
                  className="text-left text-sm px-2 py-1.5 rounded hover:bg-white/10 whitespace-nowrap"
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>
        </li>
        <li
          className={`text-xl font-bold cursor-pointer font-roboto ${
            currentPage === "favorite" && "text-primary"
          }`}
        >
          <Link to={RouthPath.favorite} className="relative flex items-center gap-2">
            Favorite
            {favoriteCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </Link>
        </li>
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
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </svg>
      </button>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-t border-white/10 flex flex-col p-4 gap-3 z-50">
          <button type="button" className="text-left text-lg font-bold" onClick={handleGoHome}>
            Home
          </button>
          <Link
            to={RouthPath.favorite}
            className="text-lg font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Favorite{favoriteCount > 0 ? `(${favoriteCount})` : ""}
          </Link>
          <button type="button" className="text-left text-lg font-bold" onClick={handleSearch}>
            Search
          </button>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {CURATED_GENRES.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleGenreClick(genre.anchor)}
                className="text-sm px-3 py-1.5 rounded-full border border-white/20"
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
```

This drops the `BaseButton`/Sign In `Link` entirely and fixes the
pre-existing `font-Roboto` (capital R, didn't match the Tailwind config's
`roboto` key) → `font-roboto` typo along the way.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. (`BaseButton` import removal may leave the component file
itself unused — that's fine, it's a small reusable primitive with no other
current usages; do not delete `src/components/BaseButton.tsx` as part of
this task, it's out of scope here.)

Manual check: `npm run dev` at a normal desktop width — Home/Genres dropdown
(hover to open)/Favorite (with badge once you've favorited something in
Task 7)/search icon all visible, no Sign In button anywhere. Shrink the
browser to ~390px wide (or devtools device toolbar) — nav links disappear,
hamburger button appears top-right, clicking it opens the mobile panel with
the same links plus genre chips; clicking outside or clicking a link closes
it.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Header.tsx
git commit -m "feat: rewrite Header — remove Sign In, add favorites badge, genre menu, mobile nav"
```

---

### Task 10: `TrailerFacade` component

**Files:**
- Create: `src/components/TrailerFacade.tsx`

**Interfaces:**
- Consumes: nothing project-specific beyond `import.meta.env
  .VITE_YOUTUBE_URL` (existing env var, same one `MovieDetails.tsx` already
  uses).
- Produces: default export `TrailerFacade`, props `{ videoKey?: string;
  posterUrl: string }`. Used by `MovieDetails` (Task 11).

- [ ] **Step 1: Create the component**

Create `src/components/TrailerFacade.tsx`:

```tsx
import { useState } from "react";

interface TrailerFacadeProps {
  videoKey?: string;
  posterUrl: string;
}

function TrailerFacade({ videoKey, posterUrl }: TrailerFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing && videoKey) {
    return (
      <iframe
        src={import.meta.env.VITE_YOUTUBE_URL + videoKey}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="relative w-full h-full group"
      aria-label="Play trailer"
    >
      <img
        src={posterUrl}
        alt="movie poster"
        className="w-full h-full object-cover rounded-md brightness-75 group-hover:brightness-90 transition-all"
      />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="w-16 h-16 rounded-full bg-white/15 border border-white/50 backdrop-blur-sm flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
            <path d="M6 4v16l14-8z" />
          </svg>
        </span>
        <span className="text-sm tracking-wide text-slate-200">
          Click to play trailer
        </span>
      </span>
    </button>
  );
}

export default TrailerFacade;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean (not mounted yet — visual check happens in Task 11).

- [ ] **Step 3: Commit**

```bash
git add src/components/TrailerFacade.tsx
git commit -m "feat: add TrailerFacade click-to-play component"
```

---

### Task 11: `MovieDetails` page updates

**Files:**
- Modify: `src/pages/MovieDetails.tsx`

**Interfaces:**
- Consumes: `TrailerFacade` (Task 10), `FavoriteButton` (Task 6),
  `getMovieRecommendations` (Task 4), `IMovieDetails.genres` (Task 3).
- Produces: no new exported names.

- [ ] **Step 1: Replace the iframe with `TrailerFacade`, add genre pills and
      a favorite button**

Current `src/pages/MovieDetails.tsx`:

```tsx
import { useLoaderData } from "react-router-dom";
import starIcon from "/star.svg";
import CastSlide from "@/layouts/CastSlide";
import { MovieInfoRes, IMovieDetails } from "@/utils/module";
import HeaderWithBack from "@/components/HeaderWithBack";

function MovieDetails() {
  const res = useLoaderData() as MovieInfoRes;
  const info = res.data as IMovieDetails;

  return (
    <main className="w-full h-full text-white mb-16 px-16">
      <HeaderWithBack />
      <div className="w-full h-[70vh] flex">
        <DetailsLeftSide info={info} />
        <DetailsRightSide info={info} />
      </div>
      <hr className="hr my-10" />
      <CastSlide cast={info.credits.cast} />
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
    return hours + "小時" + mins + "分鐘";
  }

  return (
    <div className="w-[40%] h-full flex flex-col px-6  overflow-hidden">
      <h1 className="text-[48px] mb-4">{info.title}</h1>
      <h2 className="text-lg my-2">
        上映日期 :
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
          {info.overview || "對不起!沒有相關的電影描述..."}
        </p>
      </div>
    </div>
  );
}

function DetailsRightSide({ info }: { info: IMovieDetails }) {
  const videoUrl =
    import.meta.env.VITE_YOUTUBE_URL + info.videos.results[0]?.key;
  return (
    <div className="flex-1 flex justify-center">
      {info.videos.results.length ? (
        <iframe
          src={videoUrl}
          className="w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
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

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: `npm run dev`, open any movie details page. Confirm: genre
pills render under the title, a heart button sits next to the title and
toggles independently of the trailer/poster area, the trailer area shows a
poster + play button and only loads the YouTube iframe after clicking it,
and a "You Might Also Like" row appears below the cast row (may take a moment
to load). At ~390px width, the left/right split stacks into one column.

- [ ] **Step 3: Commit**

```bash
git add src/pages/MovieDetails.tsx
git commit -m "feat: add recommendations row, favorite button, and click-to-play trailer to MovieDetails"
```

---

### Task 12: `Hero` component

**Files:**
- Create: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `getPopularMovieList` (existing, `src/api/movie.ts`),
  `getMovieDetails` (existing), `FavoriteButton` (Task 6), `MovieInfo` /
  `IMovieDetails` (Task 3).
- Produces: default export `Hero`, no props (self-contained, fetches its
  own data). Mounted by `Home.tsx` in Task 13.

- [ ] **Step 1: Resolve the backdrop image URL — read your `.env` first**

This project's `.env` isn't checked into git (correct — it holds the TMDB
API token), so it wasn't visible during the design review. Before writing
this component:

Run: `grep VITE_IMAGE_URL .env`

- If it looks like `VITE_IMAGE_URL=https://image.tmdb.org/t/p/w500`
  (a **fixed poster size** baked into the value), add a sibling variable
  for the larger backdrop size. Add this line to `.env` (and to
  `.env.example` if one exists in the repo):

  ```
  VITE_BACKDROP_URL=https://image.tmdb.org/t/p/w1280
  ```

  and use `import.meta.env.VITE_BACKDROP_URL + movie.backdrop_path` in the
  component below.

- If `VITE_IMAGE_URL` is already just the TMDB image host with no size
  segment (e.g. `https://image.tmdb.org/t/p/`), no new env var is needed —
  just build the URL with an explicit size segment inline:
  `` `${import.meta.env.VITE_IMAGE_URL}w1280${movie.backdrop_path}` ``.
  Use this form instead throughout the component if this is the case.

The code below assumes the first (more likely) case — adjust the two
`import.meta.env.VITE_BACKDROP_URL` references if your `.env` matches the
second case instead.

- [ ] **Step 2: Create the component**

Create `src/components/Hero.tsx`:

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
    import.meta.env.VITE_BACKDROP_URL + activeDetails.backdrop_path;
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

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean (not mounted yet — visual check happens in Task 13).

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx .env .env.example 2>/dev/null
git commit -m "feat: add Home hero banner component"
```

(the `.env`/`.env.example` add is a no-op if those files aren't tracked or
don't need the new variable per Step 1's second branch — `git add` silently
skips paths that don't exist or aren't changed.)

---

### Task 13: Home genre rows + mount `Hero`

**Files:**
- Create: `src/layouts/GenreRows.tsx`
- Modify: `src/pages/Home.tsx`, `src/layouts/MainWrapper.tsx`,
  `src/layouts/UpcomingSlide.tsx`

**Interfaces:**
- Consumes: `getMoviesByGenre` (Task 4), `MovieCard` (Task 7), `Hero`
  (Task 12).
- Produces: DOM anchor ids `row-tabs` (on `MainWrapper`'s section),
  `row-action`, `row-comedy` (on `GenreRows`'s two sections) — these are
  what `Header`'s genre links (Task 9) scroll to.

- [ ] **Step 1: Add the `row-tabs` anchor to `MainWrapper`**

In `src/layouts/MainWrapper.tsx`, the existing tabbed section is:

```tsx
      <Header type={type} setType={setType} />
      <section className="h-[740px] relative no-scrollbar">
```

Change the `<section>` line to:

```tsx
      <Header type={type} setType={setType} />
      <section id="row-tabs" className="h-[740px] relative no-scrollbar">
```

(This is the fallback scroll target for any curated genre in the Header
dropdown that doesn't have its own dedicated row — matches the mockup's
"scroll to the closest relevant row" fallback behavior, adapted to this
app's tab-based row instead of a fixed "New Releases" section.)

- [ ] **Step 2: Switch `MainWrapper`'s tab labels to English**

Also in `src/layouts/MainWrapper.tsx` (same file, per the English-copy
switch in Global Constraints), the internal tab-bar `Header` component
currently reads:

```tsx
/** 主頁中主要部份的header(搜尋欄的部分) */
function Header({
  type,
  setType,
}: {
  type: HeaderType;
  setType: Dispatch<SetStateAction<HeaderType>>;
}) {
  function handleChangeType(type: HeaderType) {
    setType(type);
  }

  return (
    <header className="py-4 px-5 flex justify-between items-center">
      <div className="flex gap-6">
        <ToolsButton
          type={type}
          currentType="newMovie"
          icon={newIcon}
          label="最新電影"
          changeType={handleChangeType}
        />
        <ToolsButton
          type={type}
          currentType="hot"
          icon={fire}
          label="熱門電影"
          changeType={handleChangeType}
        />
        <ToolsButton
          type={type}
          currentType="top10"
          icon={popcorn}
          label="Top10"
          changeType={handleChangeType}
        />
      </div>
    </header>
  );
}
```

Change to:

```tsx
/** Header for the main section of the home page (search bar area) */
function Header({
  type,
  setType,
}: {
  type: HeaderType;
  setType: Dispatch<SetStateAction<HeaderType>>;
}) {
  function handleChangeType(type: HeaderType) {
    setType(type);
  }

  return (
    <header className="py-4 px-5 flex justify-between items-center">
      <div className="flex gap-6">
        <ToolsButton
          type={type}
          currentType="newMovie"
          icon={newIcon}
          label="New"
          changeType={handleChangeType}
        />
        <ToolsButton
          type={type}
          currentType="hot"
          icon={fire}
          label="Popular"
          changeType={handleChangeType}
        />
        <ToolsButton
          type={type}
          currentType="top10"
          icon={popcorn}
          label="Top10"
          changeType={handleChangeType}
        />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Switch `UpcomingSlide`'s row heading to English**

Current `src/layouts/UpcomingSlide.tsx`:

```tsx
      <h2 className="text-white text-5xl ml-4 mb-2">即將上映</h2>
```

Change to:

```tsx
      <h2 className="text-white text-5xl ml-4 mb-2">Coming Soon</h2>
```

- [ ] **Step 4: Create `GenreRows`**

Create `src/layouts/GenreRows.tsx`:

```tsx
import { useEffect, useState } from "react";
import Slide from "@/components/Slide";
import MovieCard from "@/components/MovieCard";
import { getMoviesByGenre } from "@/api/movie";
import { MovieInfo } from "@/utils/module";

interface GenreRowProps {
  anchorId: string;
  label: string;
  genreId: number;
}

function GenreRow({ anchorId, label, genreId }: GenreRowProps) {
  const [movies, setMovies] = useState<MovieInfo[]>([]);

  useEffect(() => {
    getMoviesByGenre(genreId).then(setMovies);
  }, [genreId]);

  if (!movies.length) return null;

  return (
    <section id={anchorId}>
      <h2 className="text-white text-4xl ml-4 mb-2">{label}</h2>
      <Slide>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </Slide>
      <hr className="hr m-10" />
    </section>
  );
}

function GenreRows() {
  return (
    <>
      <GenreRow anchorId="row-action" label="Action" genreId={28} />
      <GenreRow anchorId="row-comedy" label="Comedy" genreId={35} />
    </>
  );
}

export default GenreRows;
```

- [ ] **Step 5: Mount `Hero` and `GenreRows` on `Home`**

Current `src/pages/Home.tsx`:

```tsx
import MainWrapper from "@/layouts/MainWrapper";
import UpcomingSlide from "@/layouts/UpcomingSlide";

const Home = () => {
  return (
    <main>
      <MainWrapper />
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
import MainWrapper from "@/layouts/MainWrapper";
import UpcomingSlide from "@/layouts/UpcomingSlide";
import GenreRows from "@/layouts/GenreRows";
import Hero from "@/components/Hero";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      const timer = setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(timer);
    }
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

The `setTimeout` gives `MainWrapper`/`GenreRows` a moment to mount their
section elements before scrolling — the anchor targets exist immediately
(the `<section id="...">` wrapper renders before its movie data arrives),
so this is about letting React commit the DOM, not waiting on the network
call.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: `npm run dev`, open Home — hero banner at the top, then the
existing tab rows (now labeled New/Popular/Top10), then "Action"/"Comedy"
rows, then "Coming Soon". Click the dash indicators in the hero to switch
featured movies. From the Header's Genres dropdown, click "Action" — page
scrolls to the Action row; click "Horror" (no dedicated row) — page scrolls
to the tab section instead. From a different page (e.g. a movie details
page), click a genre link in the Header — navigates to Home and then
scrolls to the right row.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/GenreRows.tsx src/layouts/MainWrapper.tsx src/layouts/UpcomingSlide.tsx src/pages/Home.tsx
git commit -m "feat: add curated genre rows, mount Hero on Home, switch home-page labels to English"
```

---

### Task 14: Favorites page rewrite

**Files:**
- Modify: `src/pages/Favorite.tsx`

**Interfaces:**
- Consumes: `favorites` slice state (Task 5), `MovieCard` (Task 7,
  requires a full `MovieInfo`-shaped object — see Step 1 below for how the
  stored `FavoriteMovie` is adapted).

- [ ] **Step 1: Rewrite the page**

Current `src/pages/Favorite.tsx`:

```tsx
function Favorite() {
  return <div>This is a Favorite Pages</div>;
}

export default Favorite;
```

Replace with:

```tsx
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MovieCard from "@/components/MovieCard";
import { RouthPath } from "@/routers/router";
import { FavoriteMovie } from "@/utils/module";

interface FavoritesSelectorType {
  favorites: { items: FavoriteMovie[] };
}

function Favorite() {
  const items = useSelector(
    (state: FavoritesSelectorType) => state.favorites.items
  );

  return (
    <section className="w-full min-h-[70vh] text-white px-4 md:px-16 pb-16">
      <div className="flex items-baseline justify-between flex-wrap gap-2 py-8">
        <h1 className="text-4xl font-bold">My Favorites</h1>
        <span className="text-slate-400">{items.length} Movies Saved</span>
      </div>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((favorite) => (
            <MovieCard
              key={favorite.id}
              movie={{
                id: favorite.id,
                title: favorite.title,
                poster_path: favorite.poster_path,
                vote_average: favorite.vote_average,
                backdrop_path: "",
                overview: "",
                release_date: "",
                runtime: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorite;
```

Note the `MovieCard` in this grid is passed a `MovieInfo` with placeholder
empty/zero values for fields the Favorites page doesn't have (`overview`,
`release_date`, `runtime`, `backdrop_path`) — `MovieCard` itself never reads
those fields (confirm with `grep -n "movie\." src/components/MovieCard.tsx`
— only `movie.id`, `movie.poster_path`, `movie.title`, `movie.vote_average`
are used), so this is safe. This also fixes the `w-60 h-[350px]` fixed
sizing from `MovieCard`'s own markup by putting it inside a responsive grid
that already constrains its cell width — no change needed inside
`MovieCard` for this.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Manual check: with `localStorage` empty (devtools → Application → Local
Storage → delete `moviehub_favorites_v1` → refresh), visit `/favorite` —
empty state shows with a working "Browse Movies" link. Favorite 2–3 movies from
Home, revisit `/favorite` — grid shows them with live count in the header.
Click a card's heart in this grid — it disappears immediately and the count
updates.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Favorite.tsx
git commit -m "feat: implement real Favorites page backed by the favorites slice"
```

---

### Task 15: Responsive layout sweep

**Files:**
- Modify: `src/layouts/MainLayout.tsx`, `src/pages/PersonDetails.tsx`,
  `src/components/PersonIfno.tsx`, `src/pages/Search.tsx`

This is the last task — it touches layout spacing in files every earlier
task has already finished with, so there's no risk of conflicting with
in-flight changes.

**Interfaces:** none — pure className changes, no new props or exports.

- [ ] **Step 1: `MainLayout.tsx` — responsive side gutter**

Current line:

```tsx
      <div className="w-full min-h-[calc(100vh-64px)] px-16">
```

Change to:

```tsx
      <div className="w-full min-h-[calc(100vh-64px)] px-4 md:px-16">
```

- [ ] **Step 2: `PersonDetails.tsx` — responsive side gutter**

Current line:

```tsx
    <main className="w-full h-full text-white mb-16 px-16 max-w-[1400px] m-auto">
```

Change to:

```tsx
    <main className="w-full h-full text-white mb-16 px-4 md:px-16 max-w-[1400px] m-auto">
```

- [ ] **Step 3: `PersonIfno.tsx` — stack on mobile**

Current:

```tsx
function PersonInfo({ personInfo }: { personInfo: IPersonInfo }) {
  return (
    <div className="w-full h-fit flex gap-32">
      <img
        width={"40%"}
        height={"100%"}
        src={getPersonImage(personInfo)}
        className="max-w-[400px] object-cover rounded-2xl border-primary"
        style={{
          boxShadow: "-2px -2px 15px #252525, 2px 2px 15px #474747",
        }}
        alt="person image"
      />
      <div className="w-[60%] h-full font-notoSans">
```

Change to:

```tsx
function PersonInfo({ personInfo }: { personInfo: IPersonInfo }) {
  return (
    <div className="w-full h-fit flex flex-col md:flex-row gap-8 md:gap-32">
      <img
        width={"40%"}
        height={"100%"}
        src={getPersonImage(personInfo)}
        className="w-full md:w-[40%] max-w-[400px] object-cover rounded-2xl border-primary"
        style={{
          boxShadow: "-2px -2px 15px #252525, 2px 2px 15px #474747",
        }}
        alt="person image"
      />
      <div className="w-full md:w-[60%] h-full font-notoSans">
```

(only the two opening tags change — everything below the `<div
className="w-[60%]...` line inside this component stays exactly as-is.)

- [ ] **Step 4: `Search.tsx` — responsive input and card width**

Current:

```tsx
      <div className="w-full h-12 mb-6 flex justify-center">
        <input
          ref={searchInput}
          className="w-[500px] h-[45px] bg-white text-black rounded-[45px] pl-4 bg-transparent border-none outline-none text-xl"
          type="text"
          placeholder="搜尋電影名稱..."
          onChange={handleChange}
        />
      </div>
      <div className="px-4 w-full min-h-[85vh] flex flex-wrap gap-3 justify-center content-start">
        {movieList.length > 0 ? (
          movieList.map((movie) => {
            return (
              <div className="w-60 h-[320px]" key={movie.id}>
```

Change to:

```tsx
      <div className="w-full h-12 mb-6 flex justify-center px-4">
        <input
          ref={searchInput}
          className="w-full max-w-[500px] h-[45px] bg-white text-black rounded-[45px] pl-4 bg-transparent border-none outline-none text-xl"
          type="text"
          placeholder="Search for a movie..."
          onChange={handleChange}
        />
      </div>
      <div className="px-4 w-full min-h-[85vh] flex flex-wrap gap-3 justify-center content-start">
        {movieList.length > 0 ? (
          movieList.map((movie) => {
            return (
              <div className="w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[320px]" key={movie.id}>
```

The matching `<img>` immediately below that `<div>` currently has a fixed
`className="w-60 h-[320px] object-cover rounded-md"` — change it the same
way:

```tsx
                  className="w-36 sm:w-48 md:w-60 h-[220px] sm:h-[260px] md:h-[320px] object-cover rounded-md"
```

- [ ] **Step 4b: `Search.tsx` — switch the no-results message to English**

This file is already in scope for this task (Step 4 above), so its other
literal Chinese string switches too, per the English-copy switch in Global
Constraints. Current:

```tsx
          <div className="w-full h-[85vh] flex justify-center items-center">
            <h6 className="font-semibold text-4xl">對不起!找不到符合的電影</h6>
          </div>
```

Change to:

```tsx
          <div className="w-full h-[85vh] flex justify-center items-center">
            <h6 className="font-semibold text-4xl">No matching movies found.</h6>
          </div>
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

Run: `npm run build`
Expected: succeeds.

Manual check at ~390px width (devtools device toolbar) for each: Home
(hero, rows, header hamburger all fit without horizontal scroll), Movie
Details (stacks to one column, no overflow), Person Details (image stacks
above the info block), Search (input doesn't overflow, result cards shrink
to fit two per row roughly), Favorites (grid drops to 2 columns). Confirm
the page body itself never scrolls horizontally at any of these widths.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/MainLayout.tsx src/pages/PersonDetails.tsx src/components/PersonIfno.tsx src/pages/Search.tsx
git commit -m "style: responsive layout pass for phone-width viewports"
```

---

## Self-Review Notes

- **Spec coverage:** every §6 subsection of the design spec maps to a task
  (Hero → 12/13, genre rows → 13, recommendations → 11, favorites → 5/6/7/14,
  RWD → 9/11/13/15, housekeeping → 1/8, font → 2, data model → 3, API → 4).
  §3 (dependency upgrade) is already done and committed prior to this plan,
  not repeated here.
- **Type consistency check:** `FavoriteMovie` (Task 3) is used with the
  exact same 4 fields everywhere it's constructed — `MovieCard` (Task 7),
  `Hero` (Task 12), `MovieDetails` (Task 11), and read back in `Favorite`
  (Task 14) and `FavoriteButton`/`Header` (Tasks 6, 9). `toggleFavorite`'s
  payload type matches `FavoriteMovie` in every dispatch call site.
  `getMoviesByGenre`/`getMovieRecommendations` (Task 4) return
  `MovieInfo[]`, matching what `MovieCard` (Task 7) and `Slide` already
  expect.
- **Known open item:** Task 12 Step 1 requires reading the real `.env` at
  implementation time — this couldn't be resolved during planning since the
  file isn't tracked in git. The task gives both branches concretely so
  whichever subagent picks it up isn't blocked.
- **English-copy switch scope:** per the updated Global Constraints, this
  plan's UI copy switches from Traditional Chinese to English, and
  `src/api/movie.ts` switches to `language=en-US` (Task 4 normalizes the
  whole file). In scope: every file this plan already creates or modifies,
  plus `src/layouts/MainWrapper.tsx`'s tab labels and `src/layouts/
  UpcomingSlide.tsx`'s row heading (added to Task 13 for consistency) and
  the two literal strings in `src/pages/Search.tsx` (already in scope via
  Task 15's responsive pass). Out of scope, stays Traditional Chinese:
  `src/api/person.ts`, the Person Details page, `src/components/
  CastCard.tsx`, `src/components/PersonIfno.tsx` (beyond its planned
  responsive className edit), `src/components/SocialMedia.tsx`,
  `src/layouts/CastSlide.tsx` — none of these are touched by this pass.
