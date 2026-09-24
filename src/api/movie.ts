import instance, { hideLoadingInstance } from "./instance";
import { MovieInfo } from "@/utils/module";

/** Get now-playing movies */
export async function getNowPlayingMovieList(page = 1, signal?: AbortSignal) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/now_playing?language=zh-TW&page=${page}`,
    { signal }
  );
  return res.data.results;
}

/** Get popular movies */
export async function getPopularMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/popular?language=zh-TW&page=${page}`
  );
  return res.data.results;
}

/** Get top-rated movies */
export async function getTopMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/top_rated?language=zh-TW&page=${page}`
  );
  return res.data.results;
}

/** Get upcoming movies. Without a `region`, TMDB's "upcoming" window is
 * poorly defined and mixes in titles released years ago — `region=TW`
 * (matching the site's zh-TW locale) makes TMDB apply an actual release
 * window, and the release_date filter below catches the rare straggler
 * that still slips through. */
export async function getUpcomingMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/upcoming?language=zh-TW&region=TW&page=${page}`
  );
  const today = new Date().toISOString().slice(0, 10);
  return (res.data.results as MovieInfo[]).filter(
    (movie) => !movie.release_date || movie.release_date >= today
  );
}

/** Get movie details. `showLoadingIndicator` set to false lets background
 * refreshes (e.g. the Hero carousel's auto-rotate) skip the global loading UI. */
export async function getMovieDetails(id: string, showLoadingIndicator = true) {
  const currentInstance = showLoadingIndicator ? instance : hideLoadingInstance;
  const res = await currentInstance.get(
    `/movie/${id}?append_to_response=videos,reviews,credits&language=zh-TW`
  );
  return res;
}

/** Search movies */
export async function searchMovies(
  searchText: string,
  page = 1,
  signal?: AbortSignal
) {
  const res = await instance.get(
    `/search/movie?query=${searchText}&include_adult=false&language=zh-TW&page=${page}`,
    { signal }
  );
  return res;
}

/** Get movies by genre */
export async function getMoviesByGenre(genreId: number, page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/discover/movie?with_genres=${genreId}&language=zh-TW&page=${page}`
  );
  return res.data.results;
}

/** Get movies by genre with pagination metadata (for infinite scroll) */
export async function getMoviesByGenreWithMeta(genreId: number, page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/discover/movie?with_genres=${genreId}&language=zh-TW&page=${page}`
  );
  return {
    results: res.data.results,
    totalPages: res.data.total_pages as number,
  };
}

/** Get related movie recommendations (falls back to similar when recommendations is empty) */
export async function getMovieRecommendations(id: string, page = 1) {
  const res = await instance.get(
    `/movie/${id}/recommendations?language=zh-TW&page=${page}`
  );
  if (res.data.results.length) return res.data.results;

  const fallback = await instance.get(
    `/movie/${id}/similar?language=zh-TW&page=${page}`
  );
  return fallback.data.results;
}
