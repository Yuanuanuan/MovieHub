# MovieHub Redesign — Design Spec

Date: 2026-09-21
Status: Approved mockup, pending implementation plan
Related artifact: "MovieHub Reel Cut" (interactive HTML mockup, approved by Javen)

## 1. Goal

Turn MovieHub from a TMDB browsing demo into something with an actual reason to
come back to: a no-login watchlist, a proper landing experience (hero +
genre discovery), and cross-page recommendation flow. Scope for this round:

- Remove the dead-end **Sign In** flow entirely.
- Rebuild **Favorite** as a real, working, login-free watchlist.
- Add a **Home hero banner** (featured movies with backdrop art).
- Add **genre browsing** on Home (curated genre rows + quick-jump chips).
- Add **"you might also like"** recommendations on the Movie Details page.
- Make the whole app **responsive** (currently desktop-only, fixed pixel
  widths throughout) — this is a first-class, non-negotiable requirement of
  this round, not a nice-to-have; see §6.7.
- Switch new/touched UI copy to **English**. All text this redesign adds or
  rewrites (buttons, headings, labels, empty states, error pages, curated
  genre names) is English going forward. TMDB movie requests
  (`src/api/movie.ts`) use `language=en-US` instead of `zh-TW`. Content the
  API itself returns in a non-English original language (e.g. no English
  translation exists for a given field) is left exactly as TMDB returns it —
  that's a data property, not something the UI translates on its own. See
  §2 for the exact scope boundary.
- Fold in a short list of pre-existing small bugs/dead code while touching
  the same files (see §7).

Visual reference is the approved mockup; implementation should match its
layout, component boundaries, and interaction model as closely as the real
data and routing allow. Where this spec diverges from the mockup, it says so
explicitly and why.

## 2. Non-goals (explicitly out of scope this round)

- No real backend/authentication. Favorites persist per-browser
  (`localStorage`) only — no server sync, no cross-device favorites.
- No dedicated `/genre/:id` browse page (decided: home-embedded genre rows +
  scroll-to-row chips only, matching the mockup 1:1 — see §3.3).
- No data-fetching library swap (React Query/RTK Query). Stays with the
  existing axios + component-local `useState`/`useEffect` pattern already
  used by `MainWrapper`/`UpcomingSlide`/`Search`, extended for the new calls.
  This is a real caching/perf gap noted in the earlier review, but it's a
  separate, larger change — flagged as future work, not bundled here.
- No autoplay carousel on the hero — dash navigation is manual click only
  (matches what was approved; also avoids unwanted motion for
  `prefers-reduced-motion` users).
- No automated test suite. The repo currently has zero tests; verification
  for this change is `tsc`, `eslint`, a production `build`, and manual QA in
  the browser (desktop + mobile viewport). Adding a test framework is a
  separate decision, not implied by this spec.
- No change to the TMDB attribution footer requirement — noted as a
  pre-existing compliance gap (TMDB's ToS ask for a "Powered by TMDB"
  credit; MovieHub's `Footer.tsx` doesn't have one). Worth a follow-up, not
  blocking this redesign.
- No full i18n framework and no app-wide translation sweep. The English-copy
  switch (§1) is a one-way change scoped to the files this redesign already
  creates or touches: Home (Hero, genre rows, `MainWrapper.tsx`'s existing
  tab labels, `UpcomingSlide.tsx`'s row heading), Favorites, Movie Details,
  the error/404 pages, the curated genre labels, and the two literal strings
  in `Search.tsx` (already touched there for responsive classes only).
  Everything else already in Chinese — `src/api/person.ts`, the Person
  Details page, `src/components/CastCard.tsx`, `src/components/
  PersonIfno.tsx` (beyond its planned responsive className edit),
  `src/components/SocialMedia.tsx`, `src/layouts/CastSlide.tsx` — is
  untouched by this pass and stays Traditional Chinese. This is a deliberate
  scope boundary, not an oversight; extending the switch there is future
  work.

## 3. Dependencies & tooling

`npm audit` found 25 vulnerabilities (1 low / 6 moderate / 17 high / 1
critical), mostly in transitive lint/build tooling plus `axios` and
`react-router-dom`'s `@remix-run/router`. Resolution, already applied to the
working tree (not yet committed):

- `npm audit fix` — resolved 20 issues without any major bump (axios,
  `@reduxjs/toolkit`, eslint's dependency tree, etc. all stayed within their
  existing `package.json` semver ranges; only the lockfile moved).
- `npm audit fix --force` — required for the remaining 2, both moderate/high
  and both major bumps:
  - **`vite` `^5.2.0` → `^8.3.0`** (esbuild dev-server CVE
    `GHSA-67mh-4wv8-2f99`, only exploitable while `npm run dev` is running).
  - **`react-router-dom` `^6.23.1` → `^7.18.4`** (`@remix-run/router`
    open-redirect / SSR-hydration CVEs).
- Result: `npm audit` → **0 vulnerabilities**.
- Verified working: `tsc --noEmit` clean, `eslint` clean, `npm run build`
  succeeds (135 modules, dist output produced), `npm run dev` boots and
  serves the page. One cosmetic console warning remains from vite 8's new
  transform pipeline (`Invalid input options ... "jsx"`) — harmless, page
  renders fine; keep an eye on it when vite ships a patch.
- Everything else (`react`, `react-dom`, `redux`, `react-redux`,
  `@reduxjs/toolkit`, `tailwindcss`, `typescript`, `eslint`, ...) stays on
  its current major version — no unrequested tech-stack changes.
- react-router v7's non-framework API (`createBrowserRouter`,
  `RouterProvider`, `useLoaderData`, `useNavigation`, `useNavigate`,
  `useLocation`, `Link`) is unchanged from v6 for this app's usage — no
  router call-site rewrites needed beyond what §7 already covers
  (`errorElement`, catch-all route).
- New dependency to add: **none required**. The mockup's "Bebas Neue"
  display face is added via the existing Google Fonts `@import` mechanism
  already used for the other fonts (see §6.5) — no new npm package.

Action item before implementation starts: commit `package.json` +
`package-lock.json` as their own commit ("chore: patch dependency
vulnerabilities via npm audit fix"), separate from the feature work, so the
dependency bump is easy to revert independently if vite 8 or router 7 cause
trouble later.

## 4. Data model changes

### 4.1 `src/utils/module.ts`

Add fields the new screens need (all come back from TMDB's existing
endpoints already in use — nothing new to request beyond a `with_genres`/
`/recommendations`/`/similar` query):

```ts
export interface MovieInfo {
  id: string;
  poster_path: string;
  backdrop_path: string;      // NEW — needed for hero + details backdrop
  overview: string;
  title: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genre_ids?: number[];       // NEW — present on list/search/discover responses
}

export interface IGenre {                 // NEW
  id: number;
  name: string;
}

export interface IMovieDetails extends MovieInfo {
  videos: MovieVideos;
  credits: MovieCredits;
  genres: IGenre[];           // NEW — full objects on the /movie/{id} endpoint
}
```

`MovieCast`/`PersonInfoRes`/etc. are unchanged.

### 4.2 Favorites: store the summary, not just the id

Decision: the favorites slice stores a small **movie summary object**
(`id`, `title`, `poster_path`, `vote_average`), not just numeric ids. The
calling component already has the full `MovieInfo` in hand wherever a heart
button exists (row card, hero, details page), so this makes the Favorites
page a pure render of already-known data — **zero extra API calls**, works
instantly, and still works if TMDB is briefly down. The alternative (store
ids, re-fetch each on the Favorites page) would add N parallel requests for
no benefit here.

```ts
export interface FavoriteMovie {
  id: string;
  title: string;
  poster_path: string;
  vote_average: number;
}
```

## 5. State: new `favorites` Redux slice

New file `src/reducer/favoritesSlice.ts`, built with `@reduxjs/toolkit`'s
`createSlice` (already a project dependency — consistent with the existing
`main` reducer, no new state library):

- State shape: `{ items: FavoriteMovie[] }`.
- Actions: `toggleFavorite(movie: FavoriteMovie)` (adds if absent, removes by
  id if present — one action covers both, mirrors the mockup's single heart
  toggle), `clearFavorites()` (used only if we need it for QA; not exposed in
  the UI).
- Initial state is read synchronously from `localStorage` key
  `moviehub_favorites_v1` at module init (`JSON.parse` wrapped in
  `try/catch`, falling back to `{ items: [] }` on any parse error or missing
  key — matches the defensive pattern the mockup used).
- Persistence: `store/index.ts` adds `store.subscribe(...)` that writes
  `state.favorites.items` to the same `localStorage` key on every change.
  No debouncing needed — the array is small and writes are cheap.
- `store/index.ts` registers the new reducer alongside `main`:
  `{ main: mainReducer, favorites: favoritesReducer }`.

This intentionally does **not** introduce `redux-persist` — the
subscribe-and-write approach is ~10 lines and keeps the dependency list
unchanged, per §2.

## 6. Components & pages

### 6.1 Header (`src/layouts/Header.tsx`) — rewrite

- Remove the "Sign In" `BaseButton`/`Link` entirely.
- Remove the now-orphaned `RouthPath.login` usage.
- Add a favorites entry: heart icon + live count badge, sourced from
  `useSelector((s) => s.favorites.items.length)`, navigates to
  `RouthPath.favorite`.
- Add curated genre quick-links (desktop: hover/focus dropdown next to
  "Home"; mobile: folded into the hamburger panel — see §6.6). These are a
  **fixed, hardcoded list of 8 curated genres with known, stable TMDB genre
  IDs** (Action=28, Comedy=35, Horror=27, Sci-Fi=878, Drama=18,
  Animation=16, Romance=10749, Documentary=99) matching the mockup's chip
  row exactly. This is deliberately *not* a dynamic `/genre/movie/list` call
  — the mockup only ever needed a fixed, curated set (per the resolved scope
  in §3.3), so a hardcoded list is simpler and one fewer network request. If
  a future round wants the full TMDB genre list, that's a small follow-up.
  Clicking a genre scrolls to the matching Home row if one exists (Action,
  Comedy — see §6.3), otherwise scrolls to the "New Releases" tab section,
  same fallback behavior as the mockup.
- Fixes a pre-existing bug while in this file: line ~41 uses
  `font-Roboto` (capital R), which doesn't match the Tailwind config's
  `roboto` key (generates `font-roboto`, lowercase) — the class currently
  does nothing. Corrected to `font-roboto` to match line ~71's existing
  correct usage.
- Mobile: nav links + genre list collapse behind a hamburger button below
  the `md` breakpoint (see §6.6 for the responsive strategy — this uses
  real Tailwind viewport breakpoints, not the mockup's CSS container
  queries; see the callout in §6.6 for why).

### 6.2 Hero (`src/components/Hero.tsx`) — new

- Lives at the top of `Home.tsx`, above the existing `MainWrapper`/
  `UpcomingSlide` rows.
- Data source: top 5 movies from `getPopularMovieList(1)` that have a
  non-empty `backdrop_path` (filters out the rare item missing one).
- Renders: backdrop art (real `<img>` using `VITE_BACKDROP_URL +
  backdrop_path`, not a mockup gradient), title, rating, year, runtime,
  genre pills (from `movie.genres` — not available on the popular-list
  response, so the Hero fetches full details via `getMovieDetails(id)` for
  just the currently-shown movie, not all 5, to avoid 5 extra requests
  up front), overview (2-line clamp), primary CTA → toggles a
  `TrailerFacade`-style inline play state, secondary CTA → `Link` to
  `/movieDetails/:id`, heart button using `FavoriteButton` (§6.4).
- Manual dash navigation between the 5 featured movies (click only, no
  autoplay — see §2).

**Open item — confirm before implementation:** the current `.env` isn't
checked into git (correctly, as it holds the API token) and wasn't visible
to this review. `VITE_IMAGE_URL` is assumed to already point at a fixed
poster size (e.g. `.../t/p/w500`). The hero/backdrop needs a **larger**
image size (TMDB backdrops look best at `w1280` or `original`). Please
confirm the current `VITE_IMAGE_URL` value and, if it isn't a
per-purpose base, we'll add a sibling `VITE_BACKDROP_URL` env var
(`https://image.tmdb.org/t/p/w1280`) alongside it — I can't verify the
exact TMDB image base URL segment without seeing the current `.env`.

### 6.3 Genre rows on Home

- `MainWrapper.tsx`'s existing tab logic is unchanged in behavior, but its
  three tab labels switch to English as part of this pass's copy switch
  (§1): "最新電影"→"New", "熱門電影"→"Popular", "Top10" stays as-is.
- Two new **fixed** row sections below the existing tabs/rows (not part of
  the tab switcher — always visible, matching the mockup): "Action"
  (`getMoviesByGenre(28)`) and "Comedy" (`getMoviesByGenre(35)`).
- New API function `getMoviesByGenre(genreId, page = 1)` in
  `src/api/movie.ts`, hitting `GET /discover/movie?with_genres={genreId}
  &language=en-US&page={page}` — same `instance`/`hideLoadingInstance`
  pattern as the existing list functions.
- Rows render through the same `Slide` + `MovieCard` components already
  used elsewhere (no new row-scrolling mechanism — the existing
  `useSlide` hook/arrow-button pattern is reused as-is).

### 6.4 `MovieCard.tsx` — extend, don't replace

- Add an always-visible (not hover-only — mobile has no hover) heart
  button in the top-right corner, using a new small
  `src/components/FavoriteButton.tsx` that wraps the toggle logic
  (`useSelector` + `useDispatch(toggleFavorite(...))`) so it's a single
  place to change if the interaction ever changes. `FavoriteButton` takes
  the `MovieInfo`/`FavoriteMovie`-shaped object it needs to store, and calls
  `e.stopPropagation()` so clicking the heart never triggers the card's own
  `Link` navigation.
- Add an optional `rank?: number` prop for the Top 10 row's large numeral
  treatment (mirrors the mockup's `.rank-num`).
- Fix the pre-existing invalid Tailwind class: `not:hover:scale-90` isn't a
  real Tailwind variant and currently does nothing — replaced with the
  existing `App.css` `.main-wrapper:hover .main-movie-card:not(:hover)`
  dimming rule, which is the mechanism that was actually intended (already
  present, just not consistently applied).

### 6.5 Movie Details (`src/pages/MovieDetails.tsx`)

- `DetailsRightSide`'s always-mounted `<iframe>` becomes a new
  `src/components/TrailerFacade.tsx`: shows the backdrop image + a play
  button; only on click does it swap in the real YouTube `<iframe>`. This
  is both a UX match to the mockup and the performance fix flagged in the
  earlier review (YouTube's player JS/CSS no longer loads on every details
  page visit, only when the user actually wants to watch).
- Add a heart button (`FavoriteButton`) near the title, matching the
  mockup's details-page placement.
- New "You Might Also Like" row below the existing `CastSlide`, using a new
  `getMovieRecommendations(id, page = 1)` in `src/api/movie.ts`. It calls
  `GET /movie/{id}/recommendations` first; if `results.length === 0`, it
  falls back to `GET /movie/{id}/similar` in the same call (TMDB's
  recommendations endpoint is sometimes sparse for less mainstream titles;
  `similar` is genre/keyword-based and rarely empty). Rendered through the
  same `Slide` + `MovieCard` pattern as everywhere else.
- Font: add `Bebas Neue` to `tailwind.config.js`'s `fontFamily` (new key,
  e.g. `bebas: ["Bebas Neue", "sans-serif"]`) and to the Google Fonts
  `@import` in `src/index.css`, used for the small uppercase eyebrow labels
  and the Top 10 rank numerals — the one deliberate visual addition from
  the mockup that doesn't already exist in the codebase. While editing that
  `@import` line: `Noto Serif TC` and `Playfair Display` are requested but
  have **zero usages** anywhere in `src` (verified by grep) — dropped as
  part of the same edit, since touching that exact line is what's already
  in scope. `Roboto`, `Freeman`, and `Noto Sans TC` stay (all three are
  used). Trimming `Noto Sans TC`'s requested weight range (currently
  `100..900`, a CJK font, likely a multi-MB request) is a separate,
  higher-risk change — deferred, since it needs a visual check that no code
  path relies on an intermediate weight I haven't spotted, and it wasn't
  part of the agreed housekeeping list.

### 6.6 Favorites page (`src/pages/Favorite.tsx`) — full rewrite

- Reads `useSelector((s) => s.favorites.items)`.
- Populated state: grid of `MovieCard`s (reusing the same component, so the
  heart button doubles as "remove from favorites" — clicking it toggles off
  and the card disappears from the grid immediately, same as the mockup).
- Empty state: icon + "You haven't favorited any movies yet" + a `Link` back
  to Home — shown whenever `items.length === 0` (this *is* the real empty
  state, not a side-by-side preview like the mockup's reference panel, since
  the real page only ever has one state at a time).
- Header shows the live count ("N Movies Saved").

### 6.7 Responsive strategy (all of the above)

The mockup used CSS **container queries** on a fixed-width "device frame"
because it needed to show a simulated desktop and phone side by side in one
static page. The real app has no such constraint — it just needs to respond
to the browser's actual viewport. So the implementation uses **Tailwind's
standard viewport breakpoints** (`sm:`/`md:`/`lg:`) throughout instead:

- `Header`: nav links + genre dropdown hidden below `md`, hamburger button
  shown below `md`, opening a full-width dropdown panel (same content,
  different trigger).
- `Hero`, row headings: font sizes via `clamp()` using `vw` instead of the
  mockup's `cqi` (same visual scaling effect, just keyed to the real
  viewport).
- `MainLayout`'s current fixed `px-16` container padding becomes
  `px-4 md:px-16` (or Tailwind's `container` utility) so phone widths
  (~360–400px) don't get squeezed by a 64px gutter on each side.
- Row cards, Favorites grid: replace fixed pixel widths (`w-60`, `w-[350px]`
  etc.) with responsive Tailwind width/grid utilities so card size adapts
  rather than overflowing.
- `MovieDetails`' left/right split (`w-[40%]`/`flex-1`) stacks to a single
  column below `md`.

This is the biggest net-new surface area in the whole change (the current
app has *no* responsive behavior at all), so it touches the most files, but
each individual change is a Tailwind class swap, not new logic.

## 7. Housekeeping bundled into this pass

Agreed scope (small, low-risk, touching files already in motion):

1. **Delete `src/layouts/SearchBar.tsx`** — unused anywhere, and imports a
   `/search.svg` that doesn't exist in `public/`.
2. **Remove leftover `console.log`s** — `src/hooks/useSlide.tsx:38` and
   `src/pages/PersonDetails.tsx:11`.
3. **Fix the `MainLayout.tsx` loading-timer bug** — the second `useEffect`
   declares `let timer = 0` as a *local* variable every render, so
   `clearTimeout(timer)` never actually clears the real pending timeout;
   the debounce-out-of-loading behavior is currently a no-op. Fix: hoist
   the timer id into a `useRef` so it persists across renders and the
   `clearTimeout` actually cancels the previous one.
4. **Add `errorElement` + a 404 route** — `router.tsx` currently has no
   `errorElement` anywhere, so a failed loader (bad movie/person id,
   network error) or an unmatched URL both render React Router's bare,
   unstyled default error screen. Add:
   - `src/components/ErrorBoundaryPage.tsx` (uses `useRouteError` from
     `react-router-dom`, shows a message + "Back to Home" link, styled
     consistently with the rest of the dark UI), set as `errorElement` on
     the `MainLayout` route (covers loader failures for `/movieDetails/:id`
     and `/person/:id`).
   - `src/pages/NotFound.tsx` + a `{ path: "*", element: <NotFound /> }`
     route inside `MainLayout`'s children (covers unmatched URLs while
     keeping the Header/Footer chrome).

Also, as a side effect of removing Sign In (§6.1): delete `src/pages/
Login.tsx` and the `RouthPath.login` route entry, since nothing links to it
anymore and an orphaned stub page is exactly the kind of dead end this
redesign is trying to remove.

## 8. File change list (for the implementation plan)

**New files**
- `src/components/Hero.tsx`
- `src/components/FavoriteButton.tsx`
- `src/components/TrailerFacade.tsx`
- `src/components/ErrorBoundaryPage.tsx`
- `src/pages/NotFound.tsx`
- `src/reducer/favoritesSlice.ts`

**Deleted files**
- `src/layouts/SearchBar.tsx`
- `src/pages/Login.tsx`

**Modified files**
- `src/utils/module.ts` (§4.1, §4.2)
- `src/store/index.ts` (register `favorites` reducer + `localStorage`
  subscribe)
- `src/routers/router.tsx` (remove `login`, add `errorElement` + `*` route)
- `src/layouts/Header.tsx` (§6.1)
- `src/layouts/MainLayout.tsx` (timer bug fix, §7.3)
- `src/layouts/MainWrapper.tsx` (mount `Hero` above it, add the two genre
  rows — or these could live directly in `Home.tsx`; final placement is an
  implementation-plan detail)
- `src/pages/Home.tsx` (mounts `Hero`)
- `src/pages/MovieDetails.tsx`, `src/components/CastSlide.tsx`'s sibling
  recommendations row (§6.5)
- `src/pages/Favorite.tsx` (§6.6)
- `src/components/MovieCard.tsx` (§6.4)
- `src/api/movie.ts` (`getMoviesByGenre`, `getMovieRecommendations`)
- `src/hooks/useSlide.tsx` (remove `console.log`)
- `src/pages/PersonDetails.tsx` (remove `console.log`)
- `tailwind.config.js` (add `bebas` font family)
- `src/index.css` (font `@import` swap — add Bebas Neue, drop Noto Serif
  TC/Playfair Display)
- `src/layouts/MainWrapper.tsx` (English tab labels, per §6.3 above — on top
  of mounting `Hero`/the genre rows)
- `src/layouts/UpcomingSlide.tsx` (row heading "即將上映" → "Coming Soon")
- Every layout/page touched above also gets its responsive Tailwind classes
  per §6.7.

Note: `index.html` is **not** modified by this pass. It already has
`lang="en"` and `<title>Movie_Hub</title>`, both already correct for an
English UI — an earlier draft of this list called for changing `lang` to
`zh-TW`, which no longer applies now that the redesign's copy is English
(§1).

## 9. Verification plan

- `npx tsc --noEmit` and `npm run lint` clean (already the project's
  existing bar).
- `npm run build` succeeds.
- Manual QA in the browser at both a desktop width and a ~390px phone
  width (dev tools device toolbar), covering: Home (hero dash navigation,
  genre chip scroll, favoriting from a row card and from the hero),
  Movie Details (trailer facade click-to-play, recommendations row,
  favoriting), Favorites page (populated + empty state, removing an item),
  Header (hamburger menu open/close on mobile), a bad movie id URL and a
  nonsense URL (confirms `errorElement`/404 render instead of the default
  React Router error screen).
- Confirm `localStorage` favorites survive a hard refresh.

## 10. Risks / open questions

- **`.env` values unknown** — see the callout in §6.2. Needs your
  confirmation before the Hero/backdrop image work starts.
- **vite 8 is very new** (rolldown/oxc-based internals) — build and dev
  server both verified working for this project's current size, but it's
  a bigger jump than the CVE strictly required. If it causes friction
  during implementation, falling back to pinning `vite@^6` (still off the
  vulnerable `<=6.4.2` range once patched, if/when such a patch exists) is
  a reasonable escape hatch — flagging so it's a conscious tradeoff, not a
  surprise.
- **Favorites has no size cap.** Not expected to matter at real-world usage
  scale, but noting it's unbounded by design.
