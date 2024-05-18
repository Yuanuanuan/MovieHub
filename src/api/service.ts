import instance from "./instance";

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

export async function getMovieDetails(id: string) {
  try {
    const res = await instance.get(
      `/movie/${id}?append_to_response=videos,reviews,credits&language=zh-TW`
    );
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
