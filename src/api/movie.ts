import instance, { hideLoadingInstance } from "./instance";

/** Get now-playing movies */
export async function getNowPlayingMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/now_playing?language=zh-TW&page=${page}`
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

/** Get upcoming movies */
export async function getUpcomingMovieList(page = 1) {
  let currentInstance = instance;
  if (page > 1) currentInstance = hideLoadingInstance;

  const res = await currentInstance.get(
    `/movie/upcoming?language=zh-TW&page=${page}`
  );
  return res.data.results;
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
export async function searchMovies(searchText: string, page = 1) {
  const res = await instance.get(
    `/search/movie?query=${searchText}&include_adult=false&language=zh-TW&page=${page}`
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
