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
