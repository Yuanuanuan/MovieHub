import instance from "./instance";

export async function getMovieList(page = 1) {
  try {
    const res = await instance.get(
      `/movie/popular?language=zh-TW&page=${page}`
    );
    console.log("movie list", res);
    return res;
  } catch (e) {
    console.log(e);
  }
}

export async function searchMovies(searchText: string, page = 1) {
  try {
    const res = await instance.get(
      `/search/movie?query=${searchText}&include_adult=false&language=zh-TW&page=${page}`
    );
    return res;
  } catch (e) {
    console.log(e);
  }
}

/** 獲取現正熱映中的電影 */
export async function getNowPlayingMovieList(page = 1) {
  try {
    const res = await instance.get(
      `/movie/now_playing?language=zh-TW&page=${page}`
    );
    return res.data.results;
  } catch (e) {
    console.log(e);
  }
}

/** 獲取熱門電影 */
export async function getPopularMovieList(page = 1) {
  try {
    const res = await instance.get(
      `/movie/popular?language=zh-TW&page=${page}`
    );
    return res.data.results;
  } catch (e) {
    console.log(e);
  }
}

/** 獲取最高評價電影 */
export async function getTopMovieList(page = 1) {
  try {
    const res = await instance.get(
      `/movie/top_rated?language=zh-TW&page=${page}`
    );
    return res.data.results;
  } catch (e) {
    console.log(e);
  }
}

/** 獲取即將上映電影 */
export async function getUpcomingMovieList(page = 1) {
  try {
    const res = await instance.get(
      `/movie/upcoming?language=zh-TW&page=${page}`
    );
    return res.data.results;
  } catch (e) {
    console.log(e);
  }
}
